create or replace function public.invite_student_to_class(
  target_class_id uuid,
  target_student_id uuid
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
begin
  if auth.uid() is null or not private.is_teacher() then
    raise exception 'teacher_access_required';
  end if;

  select *
  into target_class
  from public.classes
  where id = target_class_id
    and teacher_id = auth.uid();

  if not found then
    raise exception 'class_not_found_or_not_owned';
  end if;

  if target_class.status <> 'active' then
    raise exception 'class_archived';
  end if;

  if not exists (
    select 1
    from public.profiles
    where id = target_student_id
      and role = 'student'
  ) then
    raise exception 'student_not_found';
  end if;

  select *
  into existing_member
  from public.class_members
  where class_id = target_class_id
    and student_id = target_student_id;

  if found and existing_member.status = 'active' then
    raise exception 'student_already_member';
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
    target_student_id,
    'invited',
    now(),
    null,
    null,
    null,
    null
  )
  on conflict (class_id, student_id)
  do update set
    status = 'invited',
    invited_at = now(),
    requested_at = null,
    request_message = null,
    responded_at = null,
    joined_at = null,
    updated_at = now()
  returning * into saved_member;

  perform private.create_notification(
    target_student_id,
    auth.uid(),
    'class_invitation',
    target_class_id,
    saved_member.id
  );

  return saved_member;
end;
$$;

create or replace function public.respond_to_class_invitation(
  membership_id uuid,
  accept_invitation boolean
)
returns public.class_members
language plpgsql
security definer
set search_path = ''
as $$
declare
  target_member public.class_members%rowtype;
  target_teacher_id uuid;
  saved_member public.class_members%rowtype;
begin
  if auth.uid() is null or not private.is_student() then
    raise exception 'student_access_required';
  end if;

  select cm.*
  into target_member
  from public.class_members cm
  where cm.id = membership_id
    and cm.student_id = auth.uid()
    and cm.status = 'invited';

  if not found then
    raise exception 'invitation_not_found';
  end if;

  select c.teacher_id
  into target_teacher_id
  from public.classes c
  where c.id = target_member.class_id;

  update public.class_members
  set
    status = case when accept_invitation then 'active' else 'declined' end,
    responded_at = now(),
    joined_at = case when accept_invitation then now() else null end,
    updated_at = now()
  where id = membership_id
  returning * into saved_member;

  perform private.create_notification(
    target_teacher_id,
    auth.uid(),
    case
      when accept_invitation then 'class_invitation_accepted'
      else 'class_invitation_declined'
    end,
    saved_member.class_id,
    saved_member.id
  );

  return saved_member;
end;
$$;

create or replace function public.remove_student_from_class(
  target_class_id uuid,
  target_student_id uuid
)
returns boolean
language plpgsql
security definer
set search_path = ''
as $$
declare
  removed_count integer;
begin
  if auth.uid() is null or not private.owns_class(target_class_id) then
    raise exception 'class_owner_required';
  end if;

  delete from public.class_members
  where class_id = target_class_id
    and student_id = target_student_id;

  get diagnostics removed_count = row_count;

  if removed_count > 0 then
    perform private.create_notification(
      target_student_id,
      auth.uid(),
      'removed_from_class',
      target_class_id,
      null
    );
  end if;

  return removed_count > 0;
end;
$$;;
