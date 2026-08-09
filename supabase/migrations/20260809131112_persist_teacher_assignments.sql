create table public.teacher_assignments (
  id uuid primary key default gen_random_uuid(),
  teacher_id uuid not null references public.profiles(id) on delete cascade,
  class_id uuid not null references public.classes(id) on delete cascade,
  course_id uuid references public.teacher_courses(id) on delete set null,
  title text not null check (
    char_length(trim(title)) >= 1
    and char_length(trim(title)) <= 160
  ),
  instructions text not null default '',
  selected_concept_ids text[] not null default '{}',
  due_date timestamptz,
  status text not null default 'draft' check (status in ('draft', 'published', 'closed')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  published_at timestamptz,
  closed_at timestamptz,
  constraint teacher_assignments_status_timestamps_check check (
    (status = 'draft' and published_at is null and closed_at is null)
    or (status = 'published' and published_at is not null and closed_at is null)
    or (status = 'closed' and published_at is not null and closed_at is not null)
  )
);

comment on table public.teacher_assignments is
  'Devoirs persistants créés par les professeurs Lugua.';

create index teacher_assignments_teacher_updated_idx
  on public.teacher_assignments (teacher_id, updated_at desc);

create index teacher_assignments_class_status_idx
  on public.teacher_assignments (class_id, status, updated_at desc);

create index teacher_assignments_course_idx
  on public.teacher_assignments (course_id)
  where course_id is not null;

create or replace function public.set_teacher_assignment_updated_at()
returns trigger
language plpgsql
set search_path = ''
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create trigger set_teacher_assignments_updated_at
before update on public.teacher_assignments
for each row
execute function public.set_teacher_assignment_updated_at();

create or replace function private.validate_teacher_assignment_relations()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
declare
  linked_class_teacher_id uuid;
  linked_class_status text;
  linked_course_teacher_id uuid;
begin
  if tg_op = 'UPDATE' and new.teacher_id <> old.teacher_id then
    raise exception 'assignment teacher cannot be changed';
  end if;

  select teacher_id, status
    into linked_class_teacher_id, linked_class_status
  from public.classes
  where id = new.class_id;

  if linked_class_teacher_id is null then
    raise exception 'class not found';
  end if;

  if linked_class_teacher_id <> new.teacher_id then
    raise exception 'class access denied';
  end if;

  if new.status = 'published' and linked_class_status <> 'active' then
    raise exception 'class archived';
  end if;

  if new.course_id is not null then
    select teacher_id
      into linked_course_teacher_id
    from public.teacher_courses
    where id = new.course_id;

    if linked_course_teacher_id is null then
      raise exception 'course not found';
    end if;

    if linked_course_teacher_id <> new.teacher_id then
      raise exception 'course access denied';
    end if;
  end if;

  return new;
end;
$$;

create trigger validate_teacher_assignment_relations
before insert or update on public.teacher_assignments
for each row
execute function private.validate_teacher_assignment_relations();

revoke execute on function private.validate_teacher_assignment_relations() from public;
revoke execute on function private.validate_teacher_assignment_relations() from anon;
revoke execute on function private.validate_teacher_assignment_relations() from authenticated;

alter table public.teacher_assignments enable row level security;

create policy "Teachers can read their own assignments"
on public.teacher_assignments
for select
to authenticated
using (
  teacher_id = (select auth.uid())
  and private.is_teacher()
);

create policy "Teachers can create their own assignments"
on public.teacher_assignments
for insert
to authenticated
with check (
  teacher_id = (select auth.uid())
  and private.is_teacher()
);

create policy "Teachers can update their own assignments"
on public.teacher_assignments
for update
to authenticated
using (
  teacher_id = (select auth.uid())
  and private.is_teacher()
)
with check (
  teacher_id = (select auth.uid())
  and private.is_teacher()
);

create policy "Teachers can delete their own assignments"
on public.teacher_assignments
for delete
to authenticated
using (
  teacher_id = (select auth.uid())
  and private.is_teacher()
);

revoke all on table public.teacher_assignments from anon, authenticated;
grant select, insert, update, delete on table public.teacher_assignments to authenticated;

create or replace function public.publish_teacher_assignment(target_assignment_id uuid)
returns public.teacher_assignments
language plpgsql
security definer
set search_path = ''
as $$
declare
  current_assignment public.teacher_assignments;
  updated_assignment public.teacher_assignments;
begin
  if auth.uid() is null or not private.is_teacher() then
    raise exception 'teacher access required';
  end if;

  select *
    into current_assignment
  from public.teacher_assignments
  where id = target_assignment_id
  for update;

  if current_assignment.id is null then
    raise exception 'assignment not found';
  end if;

  if current_assignment.teacher_id <> auth.uid() then
    raise exception 'assignment access denied';
  end if;

  if current_assignment.status = 'closed' then
    raise exception 'invalid assignment status';
  end if;

  if current_assignment.status = 'published' then
    return current_assignment;
  end if;

  update public.teacher_assignments
  set
    status = 'published',
    published_at = now(),
    closed_at = null
  where id = target_assignment_id
  returning * into updated_assignment;

  return updated_assignment;
end;
$$;

create or replace function public.close_teacher_assignment(target_assignment_id uuid)
returns public.teacher_assignments
language plpgsql
security definer
set search_path = ''
as $$
declare
  current_assignment public.teacher_assignments;
  updated_assignment public.teacher_assignments;
begin
  if auth.uid() is null or not private.is_teacher() then
    raise exception 'teacher access required';
  end if;

  select *
    into current_assignment
  from public.teacher_assignments
  where id = target_assignment_id
  for update;

  if current_assignment.id is null then
    raise exception 'assignment not found';
  end if;

  if current_assignment.teacher_id <> auth.uid() then
    raise exception 'assignment access denied';
  end if;

  if current_assignment.status = 'closed' then
    return current_assignment;
  end if;

  if current_assignment.status <> 'published' then
    raise exception 'invalid assignment status';
  end if;

  update public.teacher_assignments
  set
    status = 'closed',
    published_at = coalesce(published_at, now()),
    closed_at = now()
  where id = target_assignment_id
  returning * into updated_assignment;

  return updated_assignment;
end;
$$;

create or replace function public.reopen_teacher_assignment(target_assignment_id uuid)
returns public.teacher_assignments
language plpgsql
security definer
set search_path = ''
as $$
declare
  current_assignment public.teacher_assignments;
  updated_assignment public.teacher_assignments;
begin
  if auth.uid() is null or not private.is_teacher() then
    raise exception 'teacher access required';
  end if;

  select *
    into current_assignment
  from public.teacher_assignments
  where id = target_assignment_id
  for update;

  if current_assignment.id is null then
    raise exception 'assignment not found';
  end if;

  if current_assignment.teacher_id <> auth.uid() then
    raise exception 'assignment access denied';
  end if;

  if current_assignment.status = 'published' then
    return current_assignment;
  end if;

  if current_assignment.status <> 'closed' then
    raise exception 'invalid assignment status';
  end if;

  update public.teacher_assignments
  set
    status = 'published',
    published_at = coalesce(published_at, now()),
    closed_at = null
  where id = target_assignment_id
  returning * into updated_assignment;

  return updated_assignment;
end;
$$;

revoke execute on function public.publish_teacher_assignment(uuid) from public;
revoke execute on function public.publish_teacher_assignment(uuid) from anon;
grant execute on function public.publish_teacher_assignment(uuid) to authenticated;

revoke execute on function public.close_teacher_assignment(uuid) from public;
revoke execute on function public.close_teacher_assignment(uuid) from anon;
grant execute on function public.close_teacher_assignment(uuid) to authenticated;

revoke execute on function public.reopen_teacher_assignment(uuid) from public;
revoke execute on function public.reopen_teacher_assignment(uuid) from anon;
grant execute on function public.reopen_teacher_assignment(uuid) to authenticated;;
