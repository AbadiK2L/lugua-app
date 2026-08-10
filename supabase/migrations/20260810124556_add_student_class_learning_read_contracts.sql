create or replace function private.has_active_class_membership(target_class_id uuid)
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
  select
    auth.uid() is not null
    and private.is_student()
    and exists (
      select 1
      from public.class_members
      where class_id = target_class_id
        and student_id = auth.uid()
        and status = 'active'
    );
$$;

create or replace function public.get_my_class_courses(target_class_id uuid)
returns table (
  course_id uuid,
  class_id uuid,
  origin text,
  title text,
  description text,
  language text,
  variety text,
  level text,
  objectives text[],
  source_chapter_id text,
  selected_concept_ids text[],
  assigned_at timestamptz
)
language plpgsql
stable
security definer
set search_path = ''
as $$
begin
  if not private.has_active_class_membership(target_class_id) then
    raise exception 'active_class_membership_required';
  end if;

  return query
  select
    course.id,
    assignment.class_id,
    course.origin,
    course.title,
    course.description,
    course.language,
    course.variety,
    course.level,
    course.objectives,
    course.source_chapter_id,
    course.selected_concept_ids,
    assignment.assigned_at
  from public.class_course_assignments assignment
  join public.teacher_courses course on course.id = assignment.course_id
  where assignment.class_id = target_class_id
  order by assignment.assigned_at, course.title;
end;
$$;

create or replace function public.get_my_class_assignments(target_class_id uuid)
returns table (
  assignment_id uuid,
  class_id uuid,
  course_id uuid,
  title text,
  instructions text,
  selected_concept_ids text[],
  due_date timestamptz,
  status text,
  published_at timestamptz,
  closed_at timestamptz,
  created_at timestamptz,
  updated_at timestamptz
)
language plpgsql
stable
security definer
set search_path = ''
as $$
begin
  if not private.has_active_class_membership(target_class_id) then
    raise exception 'active_class_membership_required';
  end if;

  return query
  select
    assignment.id,
    assignment.class_id,
    case
      when assignment.course_id is not null
        and exists (
          select 1
          from public.class_course_assignments course_assignment
          where course_assignment.class_id = assignment.class_id
            and course_assignment.course_id = assignment.course_id
        )
      then assignment.course_id
      else null::uuid
    end,
    assignment.title,
    assignment.instructions,
    assignment.selected_concept_ids,
    assignment.due_date,
    assignment.status,
    assignment.published_at,
    assignment.closed_at,
    assignment.created_at,
    assignment.updated_at
  from public.teacher_assignments assignment
  where assignment.class_id = target_class_id
    and assignment.status in ('published', 'closed')
  order by
    case when assignment.status = 'published' then 0 else 1 end,
    assignment.due_date asc nulls last,
    assignment.updated_at desc;
end;
$$;

revoke all on function private.has_active_class_membership(uuid)
  from public, anon, authenticated;

revoke all on function public.get_my_class_courses(uuid)
  from public, anon, authenticated;
revoke all on function public.get_my_class_assignments(uuid)
  from public, anon, authenticated;

grant execute on function public.get_my_class_courses(uuid)
  to authenticated;
grant execute on function public.get_my_class_assignments(uuid)
  to authenticated;
