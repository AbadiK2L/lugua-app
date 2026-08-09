create table public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,

  display_name text not null
    check (
      char_length(trim(display_name)) >= 1
      and char_length(trim(display_name)) <= 80
    ),

  role text not null
    check (role in ('student', 'teacher')),

  preferred_language text not null default 'shikomori',

  preferred_variety text not null default 'general',

  created_at timestamptz not null default now(),

  updated_at timestamptz not null default now()
);

alter table public.profiles enable row level security;

revoke all on table public.profiles from anon, authenticated;

grant select on table public.profiles to authenticated;
grant update (display_name, preferred_language, preferred_variety)
  on table public.profiles to authenticated;
grant all on table public.profiles to service_role;

create policy "Users can read their own profile"
on public.profiles
for select
to authenticated
using ((select auth.uid()) = id);

create policy "Users can update their own profile"
on public.profiles
for update
to authenticated
using ((select auth.uid()) = id)
with check ((select auth.uid()) = id);

create or replace function public.set_profile_updated_at()
returns trigger
language plpgsql
set search_path = ''
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

grant execute on function public.set_profile_updated_at()
  to anon, authenticated, service_role;

create trigger set_profiles_updated_at
before update on public.profiles
for each row
execute function public.set_profile_updated_at();

create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
declare
  requested_role text;
  requested_name text;
  requested_language text;
  requested_variety text;
begin
  requested_role :=
    new.raw_user_meta_data ->> 'role';

  requested_name :=
    nullif(trim(new.raw_user_meta_data ->> 'display_name'), '');

  requested_language :=
    nullif(trim(new.raw_user_meta_data ->> 'preferred_language'), '');

  requested_variety :=
    nullif(trim(new.raw_user_meta_data ->> 'preferred_variety'), '');

  insert into public.profiles (
    id,
    display_name,
    role,
    preferred_language,
    preferred_variety
  )
  values (
    new.id,

    coalesce(
      requested_name,
      split_part(coalesce(new.email, 'utilisateur'), '@', 1)
    ),

    case
      when requested_role in ('student', 'teacher')
        then requested_role
      else 'student'
    end,

    coalesce(requested_language, 'shikomori'),

    coalesce(requested_variety, 'general')
  );

  return new;
end;
$$;

revoke all on function public.handle_new_user()
  from public, anon, authenticated;
grant execute on function public.handle_new_user() to service_role;

create trigger on_auth_user_created
after insert on auth.users
for each row
execute function public.handle_new_user();
