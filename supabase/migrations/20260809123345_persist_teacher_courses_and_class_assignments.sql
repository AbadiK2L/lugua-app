create table public.teacher_courses (
  id uuid primary key default gen_random_uuid(),
  teacher_id uuid not null references public.profiles(id) on delete cascade,
  origin text not null check (origin in ('lugua_program', 'teacher_created')),
  title text not null check (char_length(trim(title)) between 1 and 160),
  description text not null default '',
  language text not null check (char_length(trim(language)) between 1 and 80),
  variety text not null default 'general' check (char_length(trim(variety)) between 1 and 80),
  level text check (level is null or level in ('A1', 'A2', 'B1', 'B2')),
  objectives text[] not null default '{}'::text[],
  source_chapter_id text,
  selected_concept_ids text[] not null default '{}'::text[],
  status text not null default 'draft' check (status = 'draft'),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

comment on table public.teacher_courses is
  'Brouillons de cours persistants créés ou adaptés par les professeurs Lugua.';

comment on column public.teacher_courses.origin is
  'Origine du brouillon : programme Lugua ou création du professeur.';

create index teacher_courses_teacher_updated_idx
  on public.teacher_courses (teacher_id, updated_at desc);

create table public.class_course_assignments (
  class_id uuid not null references public.classes(id) on delete cascade,
  course_id uuid not null references public.teacher_courses(id) on delete cascade,
  assigned_at timestamptz not null default now(),
  primary key (class_id, course_id)
);

comment on table public.class_course_assignments is
  'Association persistante entre une classe et un brouillon de cours du même professeur.';

create index class_course_assignments_course_idx
  on public.class_course_assignments (course_id);

create or replace function public.set_teacher_course_updated_at()
returns trigger
language plpgsql
set search_path = ''
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create trigger set_teacher_courses_updated_at
before update on public.teacher_courses
for each row
execute function public.set_teacher_course_updated_at();

revoke execute on function public.set_teacher_course_updated_at() from public;
revoke execute on function public.set_teacher_course_updated_at() from anon;
revoke execute on function public.set_teacher_course_updated_at() from authenticated;

create or replace function private.owns_teacher_course(target_course_id uuid)
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
  select exists (
    select 1
    from public.teacher_courses
    where id = target_course_id
      and teacher_id = auth.uid()
  );
$$;

alter table public.teacher_courses enable row level security;
alter table public.class_course_assignments enable row level security;

create policy "Teachers can read their own courses"
on public.teacher_courses
for select
to authenticated
using (
  teacher_id = (select auth.uid())
  and private.is_teacher()
);

create policy "Teachers can create their own courses"
on public.teacher_courses
for insert
to authenticated
with check (
  teacher_id = (select auth.uid())
  and private.is_teacher()
);

create policy "Teachers can update their own courses"
on public.teacher_courses
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

create policy "Teachers can delete their own courses"
on public.teacher_courses
for delete
to authenticated
using (
  teacher_id = (select auth.uid())
  and private.is_teacher()
);

create policy "Teachers can read their class course assignments"
on public.class_course_assignments
for select
to authenticated
using (
  private.owns_class(class_id)
  and private.owns_teacher_course(course_id)
);

create policy "Teachers can assign their courses to their classes"
on public.class_course_assignments
for insert
to authenticated
with check (
  private.owns_class(class_id)
  and private.owns_teacher_course(course_id)
);

create policy "Teachers can unassign their courses from their classes"
on public.class_course_assignments
for delete
to authenticated
using (
  private.owns_class(class_id)
  and private.owns_teacher_course(course_id)
);

revoke all on table public.teacher_courses from anon, authenticated;
grant select, insert, update, delete on table public.teacher_courses to authenticated;

revoke all on table public.class_course_assignments from anon, authenticated;
grant select, insert, delete on table public.class_course_assignments to authenticated;;
