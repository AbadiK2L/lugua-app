alter table public.classes
  add column visibility text not null default 'public'
  check (visibility in ('public', 'private'));

comment on column public.classes.visibility is
  'public : visible dans l’annuaire élève ; private : accessible uniquement sur invitation.';

alter table public.class_members
  drop constraint class_members_status_check;

alter table public.class_members
  add constraint class_members_status_check
  check (status in ('invited', 'requested', 'active', 'declined'));

alter table public.class_members
  add column requested_at timestamptz,
  add column request_message text
    check (request_message is null or char_length(request_message) <= 240);

create table public.notifications (
  id uuid primary key default gen_random_uuid(),
  recipient_id uuid not null references public.profiles(id) on delete cascade,
  actor_id uuid references public.profiles(id) on delete set null,
  class_id uuid references public.classes(id) on delete cascade,
  membership_id uuid references public.class_members(id) on delete set null,
  type text not null check (
    type in (
      'class_invitation',
      'class_invitation_accepted',
      'class_invitation_declined',
      'join_request_received',
      'join_request_approved',
      'join_request_declined',
      'removed_from_class'
    )
  ),
  read_at timestamptz,
  created_at timestamptz not null default now()
);

comment on table public.notifications is
  'Notifications internes Lugua liées aux classes. Les notifications push système ne sont pas encore activées.';

create index notifications_recipient_unread_idx
  on public.notifications (recipient_id, created_at desc)
  where read_at is null;

create index notifications_recipient_created_idx
  on public.notifications (recipient_id, created_at desc);

create index class_members_requested_idx
  on public.class_members (class_id, requested_at desc)
  where status = 'requested';

alter table public.notifications enable row level security;
revoke all on table public.notifications from anon, authenticated;

create or replace function private.create_notification(
  target_recipient_id uuid,
  target_actor_id uuid,
  target_type text,
  target_class_id uuid,
  target_membership_id uuid
)
returns uuid
language plpgsql
security definer
set search_path = ''
as $$
declare
  notification_id uuid;
begin
  if target_type not in (
    'class_invitation',
    'class_invitation_accepted',
    'class_invitation_declined',
    'join_request_received',
    'join_request_approved',
    'join_request_declined',
    'removed_from_class'
  ) then
    raise exception 'unsupported_notification_type';
  end if;

  insert into public.notifications (
    recipient_id,
    actor_id,
    class_id,
    membership_id,
    type
  )
  values (
    target_recipient_id,
    target_actor_id,
    target_class_id,
    target_membership_id,
    target_type
  )
  returning id into notification_id;

  return notification_id;
end;
$$;

revoke all on function private.create_notification(uuid, uuid, text, uuid, uuid)
  from public, anon, authenticated;

create or replace function private.can_view_class(target_class_id uuid)
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
  select
    private.owns_class(target_class_id)
    or exists (
      select 1
      from public.class_members
      where class_id = target_class_id
        and student_id = auth.uid()
        and status in ('invited', 'requested', 'active')
    );
$$;

grant insert (visibility) on table public.classes to authenticated;
grant update (visibility) on table public.classes to authenticated;

create or replace function public.list_discoverable_classes(
  search_term text default null,
  result_limit integer default 50
)
returns table (
  class_id uuid,
  class_name text,
  class_description text,
  language text,
  variety text,
  level text,
  teacher_id uuid,
  teacher_name text,
  active_member_count bigint,
  membership_status text,
  created_at timestamptz
)
language plpgsql
stable
security definer
set search_path = ''
as $$
declare
  safe_limit integer := least(greatest(coalesce(result_limit, 50), 1), 100);
  normalized_search text := lower(trim(coalesce(search_term, '')));
begin
  if auth.uid() is null or not private.is_student() then
    raise exception 'student_access_required';
  end if;

  return query
  select
    c.id,
    c.name,
    c.description,
    c.language,
    c.variety,
    c.level,
    c.teacher_id,
    teacher_profile.display_name,
    count(active_members.id) filter (where active_members.status = 'active') as active_member_count,
    own_membership.status,
    c.created_at
  from public.classes c
  join public.profiles teacher_profile
    on teacher_profile.id = c.teacher_id
   and teacher_profile.role = 'teacher'
  left join public.class_members active_members
    on active_members.class_id = c.id
   and active_members.status = 'active'
  left join public.class_members own_membership
    on own_membership.class_id = c.id
   and own_membership.student_id = auth.uid()
  where c.status = 'active'
    and c.visibility = 'public'
    and (
      normalized_search = ''
      or strpos(lower(c.name), normalized_search) > 0
      or strpos(lower(c.description), normalized_search) > 0
      or strpos(lower(teacher_profile.display_name), normalized_search) > 0
    )
  group by
    c.id,
    c.name,
    c.description,
    c.language,
    c.variety,
    c.level,
    c.teacher_id,
    teacher_profile.display_name,
    own_membership.status,
    c.created_at
  order by lower(c.name), c.created_at desc
  limit safe_limit;
end;
$$;

create or replace function public.request_to_join_class(
  target_class_id uuid,
  message text default null
)
returns public.class_members
language plpgsql
security definer
set search_path = ''
as $$
declare
  target_class public.classes%rowtype;
  existing_member public.class_members%rowtype;
  saved_member public.class_members%rowtype;
  normalized_message text := nullif(trim(coalesce(message, '')), '');
begin
  if auth.uid() is null or not private.is_student() then
    raise exception 'student_access_required';
  end if;

  if normalized_message is not null and char_length(normalized_message) > 240 then
    raise exception 'request_message_too_long';
  end if;

  select *
  into target_class
  from public.classes
  where id = target_class_id
    and status = 'active'
    and visibility = 'public';

  if not found then
    raise exception 'class_not_discoverable';
  end if;

  select *
  into existing_member
  from public.class_members
  where class_id = target_class_id
    and student_id = auth.uid();

  if found and existing_member.status = 'active' then
    raise exception 'student_already_member';
  end if;

  if found and existing_member.status = 'invited' then
    raise exception 'invitation_already_available';
  end if;

  if found and existing_member.status = 'requested' then
    raise exception 'join_request_already_pending';
  end if;

  insert into public.class_members (
    class_id,
    student_id,
    status,
    invited_at,
    requested_at,
    request_message,
    responded_at,
    joined_at
  )
  values (
    target_class_id,
    auth.uid(),
    'requested',
    now(),
    now(),
    normalized_message,
    null,
    null
  )
  on conflict (class_id, student_id)
  do update set
    status = 'requested',
    requested_at = now(),
    request_message = normalized_message,
    responded_at = null,
    joined_at = null,
    updated_at = now()
  returning * into saved_member;

  perform private.create_notification(
    target_class.teacher_id,
    auth.uid(),
    'join_request_received',
    target_class_id,
    saved_member.id
  );

  return saved_member;
end;
$$;

create or replace function public.get_class_join_requests(target_class_id uuid)
returns table (
  membership_id uuid,
  student_id uuid,
  display_name text,
  preferred_language text,
  preferred_variety text,
  request_message text,
  requested_at timestamptz
)
language plpgsql
stable
security definer
set search_path = ''
as $$
begin
  if auth.uid() is null or not private.owns_class(target_class_id) then
    raise exception 'class_owner_required';
  end if;

  return query
  select
    cm.id,
    p.id,
    p.display_name,
    p.preferred_language,
    p.preferred_variety,
    cm.request_message,
    cm.requested_at
  from public.class_members cm
  join public.profiles p on p.id = cm.student_id
  where cm.class_id = target_class_id
    and cm.status = 'requested'
  order by cm.requested_at desc nulls last, lower(p.display_name);
end;
$$;

create or replace function public.respond_to_join_request(
  membership_id uuid,
  approve_request boolean
)
returns public.class_members
language plpgsql
security definer
set search_path = ''
as $$
declare
  target_member public.class_members%rowtype;
  saved_member public.class_members%rowtype;
begin
  select cm.*
  into target_member
  from public.class_members cm
  join public.classes c on c.id = cm.class_id
  where cm.id = membership_id
    and cm.status = 'requested'
    and c.teacher_id = auth.uid();

  if not found or not private.is_teacher() then
    raise exception 'join_request_not_found';
  end if;

  update public.class_members
  set
    status = case when approve_request then 'active' else 'declined' end,
    responded_at = now(),
    joined_at = case when approve_request then now() else null end,
    updated_at = now()
  where id = membership_id
  returning * into saved_member;

  perform private.create_notification(
    saved_member.student_id,
    auth.uid(),
    case
      when approve_request then 'join_request_approved'
      else 'join_request_declined'
    end,
    saved_member.class_id,
    saved_member.id
  );

  return saved_member;
end;
$$;

create or replace function public.get_my_class_memberships()
returns table (
  membership_id uuid,
  class_id uuid,
  class_name text,
  class_description text,
  language text,
  variety text,
  level text,
  teacher_id uuid,
  teacher_name text,
  membership_status text,
  invited_at timestamptz,
  requested_at timestamptz,
  responded_at timestamptz,
  joined_at timestamptz
)
language plpgsql
stable
security definer
set search_path = ''
as $$
begin
  if auth.uid() is null or not private.is_student() then
    raise exception 'student_access_required';
  end if;

  return query
  select
    cm.id,
    c.id,
    c.name,
    c.description,
    c.language,
    c.variety,
    c.level,
    c.teacher_id,
    teacher_profile.display_name,
    cm.status,
    cm.invited_at,
    cm.requested_at,
    cm.responded_at,
    cm.joined_at
  from public.class_members cm
  join public.classes c on c.id = cm.class_id
  join public.profiles teacher_profile on teacher_profile.id = c.teacher_id
  where cm.student_id = auth.uid()
    and cm.status in ('invited', 'requested', 'active')
  order by coalesce(cm.requested_at, cm.invited_at, cm.created_at) desc;
end;
$$;

create or replace function public.get_my_notifications(
  result_limit integer default 50,
  unread_only boolean default false
)
returns table (
  notification_id uuid,
  notification_type text,
  class_id uuid,
  class_name text,
  actor_id uuid,
  actor_name text,
  membership_id uuid,
  read_at timestamptz,
  created_at timestamptz
)
language plpgsql
stable
security definer
set search_path = ''
as $$
declare
  safe_limit integer := least(greatest(coalesce(result_limit, 50), 1), 100);
begin
  if auth.uid() is null then
    raise exception 'authentication_required';
  end if;

  return query
  select
    n.id,
    n.type,
    n.class_id,
    c.name,
    n.actor_id,
    actor_profile.display_name,
    n.membership_id,
    n.read_at,
    n.created_at
  from public.notifications n
  left join public.classes c on c.id = n.class_id
  left join public.profiles actor_profile on actor_profile.id = n.actor_id
  where n.recipient_id = auth.uid()
    and (not unread_only or n.read_at is null)
  order by n.created_at desc
  limit safe_limit;
end;
$$;

create or replace function public.mark_notification_read(target_notification_id uuid)
returns boolean
language plpgsql
security definer
set search_path = ''
as $$
declare
  updated_count integer;
begin
  if auth.uid() is null then
    raise exception 'authentication_required';
  end if;

  update public.notifications
  set read_at = coalesce(read_at, now())
  where id = target_notification_id
    and recipient_id = auth.uid();

  get diagnostics updated_count = row_count;
  return updated_count > 0;
end;
$$;

create or replace function public.mark_all_notifications_read()
returns integer
language plpgsql
security definer
set search_path = ''
as $$
declare
  updated_count integer;
begin
  if auth.uid() is null then
    raise exception 'authentication_required';
  end if;

  update public.notifications
  set read_at = now()
  where recipient_id = auth.uid()
    and read_at is null;

  get diagnostics updated_count = row_count;
  return updated_count;
end;
$$;

revoke all on function public.list_discoverable_classes(text, integer)
  from public, anon, authenticated;
revoke all on function public.request_to_join_class(uuid, text)
  from public, anon, authenticated;
revoke all on function public.get_class_join_requests(uuid)
  from public, anon, authenticated;
revoke all on function public.respond_to_join_request(uuid, boolean)
  from public, anon, authenticated;
revoke all on function public.get_my_class_memberships()
  from public, anon, authenticated;
revoke all on function public.get_my_notifications(integer, boolean)
  from public, anon, authenticated;
revoke all on function public.mark_notification_read(uuid)
  from public, anon, authenticated;
revoke all on function public.mark_all_notifications_read()
  from public, anon, authenticated;

grant execute on function public.list_discoverable_classes(text, integer)
  to authenticated;
grant execute on function public.request_to_join_class(uuid, text)
  to authenticated;
grant execute on function public.get_class_join_requests(uuid)
  to authenticated;
grant execute on function public.respond_to_join_request(uuid, boolean)
  to authenticated;
grant execute on function public.get_my_class_memberships()
  to authenticated;
grant execute on function public.get_my_notifications(integer, boolean)
  to authenticated;
grant execute on function public.mark_notification_read(uuid)
  to authenticated;
grant execute on function public.mark_all_notifications_read()
  to authenticated;;
