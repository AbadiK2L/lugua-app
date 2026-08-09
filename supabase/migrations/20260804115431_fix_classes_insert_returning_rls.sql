create or replace function private.is_class_member(target_class_id uuid)
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
  select exists (
    select 1
    from public.class_members
    where class_id = target_class_id
      and student_id = auth.uid()
      and status in ('invited', 'active')
  );
$$;

grant execute on function private.is_class_member(uuid) to authenticated;

drop policy if exists "Teachers can read their own classes" on public.classes;

create policy "Users can read relevant classes"
on public.classes
for select
to authenticated
using (
  teacher_id = auth.uid()
  or private.is_class_member(id)
);;
