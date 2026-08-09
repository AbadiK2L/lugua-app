create schema if not exists private;

revoke all on schema private from public;
grant usage on schema private to authenticated;

create table public.classes (
  id uuid primary key default gen_random_uuid(),
  teacher_id uuid not null references public.profiles(id) on delete cascade,
  name text not null check (char_length(trim(name)) between 1 and 80),
  description text not null default '' check (char_length(description) <= 500),
  language text not null default 'shikomori' check (char_length(trim(language)) between 1 and 40),
  variety text not null default 'general' check (char_length(trim(variety)) between 1 and 40),
  level text check (level is null or level in ('A1', 'A2', 'B1', 'B2', 'multi_levels')),
  status text not null default 'active' check (status in ('active', 'archived')),
  invite_code text not null unique check (invite_code ~ '^LUGUA-[A-Z0-9]{6}$'),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

comment on table public.classes is
  'Classes persistantes créées par les professeurs Lugua.';
comment on column public.classes.invite_code is
  'Code d’invitation de classe. Ne contient aucune donnée personnelle.';

create table public.class_members (
  id uuid primary key default gen_random_uuid(),
  class_id uuid not null references public.classes(id) on delete cascade,
  student_id uuid not null references public.profiles(id) on delete cascade,
  status text not null default 'invited' check (status in ('invited', 'active', 'declined')),
  invited_at timestamptz not null default now(),
  responded_at timestamptz,
  joined_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (class_id, student_id)
);

comment on table public.class_members is
  'Invitations et inscriptions des élèves dans les classes Lugua.';

create index classes_teacher_status_idx
  on public.classes (teacher_id, status);

create index class_members_class_status_idx
  on public.class_members (class_id, status);

create index class_members_student_status_idx
  on public.class_members (student_id, status);

create or replace function private.is_teacher()
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
  select exists (
    select 1
    from public.profiles
    where id = auth.uid()
      and role = 'teacher'
  );
$$;

create or replace function private.is_student()
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
  select exists (
    select 1
    from public.profiles
    where id = auth.uid()
      and role = 'student'
  );
$$;

create or replace function private.owns_class(target_class_id uuid)
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
  select exists (
    select 1
    from public.classes
    where id = target_class_id
      and teacher_id = auth.uid()
  );
$$;

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
        and status in ('invited', 'active')
    );
$$;

create or replace function private.generate_invite_code()
returns text
language plpgsql
volatile
security definer
set search_path = ''
as $$
declare
  candidate text;
begin
  loop
    candidate := 'LUGUA-' || upper(substr(md5(random()::text || clock_timestamp()::text), 1, 6));
    exit when not exists (
      select 1
      from public.classes
      where invite_code = candidate
    );
  end loop;

  return candidate;
end;
$$;

create or replace function private.prepare_class_insert()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
  if not exists (
    select 1
    from public.profiles
    where id = new.teacher_id
      and role = 'teacher'
  ) then
    raise exception 'teacher_profile_required';
  end if;

  new.invite_code := private.generate_invite_code();
  new.updated_at := now();
  return new;
end;
$$;

create or replace function private.validate_class_member()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
  if not exists (
    select 1
    from public.profiles
    where id = new.student_id
      and role = 'student'
  ) then
    raise exception 'student_profile_required';
  end if;

  new.updated_at := now();
  return new;
end;
$$;

create or replace function private.set_row_updated_at()
returns trigger
language plpgsql
set search_path = ''
as $$
begin
  new.updated_at := now();
  return new;
end;
$$;

create trigger prepare_classes_insert
before insert on public.classes
for each row
execute function private.prepare_class_insert();

create trigger set_classes_updated_at
before update on public.classes
for each row
execute function private.set_row_updated_at();

create trigger validate_class_members_row
before insert or update on public.class_members
for each row
execute function private.validate_class_member();

alter table public.classes enable row level security;
alter table public.class_members enable row level security;

revoke all on table public.classes from anon, authenticated;
revoke all on table public.class_members from anon, authenticated;

grant select on table public.classes to authenticated;
grant insert (teacher_id, name, description, language, variety, level, status)
  on table public.classes to authenticated;
grant update (name, description, language, variety, level, status)
  on table public.classes to authenticated;
grant delete on table public.classes to authenticated;

grant select on table public.class_members to authenticated;

create policy "Teachers can read their own classes"
on public.classes
for select
to authenticated
using (private.can_view_class(id));

create policy "Teachers can create their own classes"
on public.classes
for insert
to authenticated
with check (
  teacher_id = auth.uid()
  and private.is_teacher()
);

create policy "Teachers can update their own classes"
on public.classes
for update
to authenticated
using (
  teacher_id = auth.uid()
  and private.is_teacher()
)
with check (
  teacher_id = auth.uid()
  and private.is_teacher()
);

create policy "Teachers can delete their own classes"
on public.classes
for delete
to authenticated
using (
  teacher_id = auth.uid()
  and private.is_teacher()
);

create policy "Members can read relevant memberships"
on public.class_members
for select
to authenticated
using (
  student_id = auth.uid()
  or private.owns_class(class_id)
);

grant execute on function private.is_teacher() to authenticated;
grant execute on function private.is_student() to authenticated;
grant execute on function private.owns_class(uuid) to authenticated;
grant execute on function private.can_view_class(uuid) to authenticated;

create or replace function public.search_student_directory(
  search_term text default null,
  result_limit integer default 50
)
returns table (
  profile_id uuid,
  display_name text,
  preferred_language text,
  preferred_variety text
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
  if auth.uid() is null or not private.is_teacher() then
    raise exception 'teacher_access_required';
  end if;

  return query
  select
    p.id,
    p.display_name,
    p.preferred_language,
    p.preferred_variety
  from public.profiles p
  where p.role = 'student'
    and (
      normalized_search = ''
      or strpos(lower(p.display_name), normalized_search) > 0
    )
  order by lower(p.display_name), p.id
  limit safe_limit;
end;
$$;

create or replace function public.get_class_roster(target_class_id uuid)
returns table (
  membership_id uuid,
  student_id uuid,
  display_name text,
  preferred_language text,
  preferred_variety text,
  membership_status text,
  invited_at timestamptz,
  responded_at timestamptz,
  joined_at timestamptz
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
    cm.status,
    cm.invited_at,
    cm.responded_at,
    cm.joined_at
  from public.class_members cm
  join public.profiles p on p.id = cm.student_id
  where cm.class_id = target_class_id
  order by
    case cm.status
      when 'active' then 1
      when 'invited' then 2
      else 3
    end,
    lower(p.display_name);
end;
$$;

create or replace function public.get_my_class_invitations()
returns table (
  membership_id uuid,
  class_id uuid,
  class_name text,
  class_description text,
  language text,
  variety text,
  level text,
  teacher_id uuid,
  membership_status text,
  invited_at timestamptz,
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
    cm.status,
    cm.invited_at,
    cm.responded_at,
    cm.joined_at
  from public.class_members cm
  join public.classes c on c.id = cm.class_id
  where cm.student_id = auth.uid()
    and cm.status in ('invited', 'active')
  order by cm.invited_at desc;
end;
$$;

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
    responded_at,
    joined_at
  )
  values (
    target_class_id,
    target_student_id,
    'invited',
    now(),
    null,
    null
  )
  on conflict (class_id, student_id)
  do update set
    status = 'invited',
    invited_at = now(),
    responded_at = null,
    joined_at = null,
    updated_at = now()
  returning * into saved_member;

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
  saved_member public.class_members%rowtype;
begin
  if auth.uid() is null or not private.is_student() then
    raise exception 'student_access_required';
  end if;

  update public.class_members
  set
    status = case when accept_invitation then 'active' else 'declined' end,
    responded_at = now(),
    joined_at = case when accept_invitation then now() else null end,
    updated_at = now()
  where id = membership_id
    and student_id = auth.uid()
    and status = 'invited'
  returning * into saved_member;

  if not found then
    raise exception 'invitation_not_found';
  end if;

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
  return removed_count > 0;
end;
$$;

create or replace function public.regenerate_class_invite_code(target_class_id uuid)
returns text
language plpgsql
security definer
set search_path = ''
as $$
declare
  new_code text;
begin
  if auth.uid() is null or not private.owns_class(target_class_id) then
    raise exception 'class_owner_required';
  end if;

  new_code := private.generate_invite_code();

  update public.classes
  set invite_code = new_code,
      updated_at = now()
  where id = target_class_id;

  return new_code;
end;
$$;

revoke all on function public.search_student_directory(text, integer) from public, anon, authenticated;
revoke all on function public.get_class_roster(uuid) from public, anon, authenticated;
revoke all on function public.get_my_class_invitations() from public, anon, authenticated;
revoke all on function public.invite_student_to_class(uuid, uuid) from public, anon, authenticated;
revoke all on function public.respond_to_class_invitation(uuid, boolean) from public, anon, authenticated;
revoke all on function public.remove_student_from_class(uuid, uuid) from public, anon, authenticated;
revoke all on function public.regenerate_class_invite_code(uuid) from public, anon, authenticated;

grant execute on function public.search_student_directory(text, integer) to authenticated;
grant execute on function public.get_class_roster(uuid) to authenticated;
grant execute on function public.get_my_class_invitations() to authenticated;
grant execute on function public.invite_student_to_class(uuid, uuid) to authenticated;
grant execute on function public.respond_to_class_invitation(uuid, boolean) to authenticated;
grant execute on function public.remove_student_from_class(uuid, uuid) to authenticated;
grant execute on function public.regenerate_class_invite_code(uuid) to authenticated;;
