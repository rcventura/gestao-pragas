revoke select on table public.organizations from anon, authenticated;

grant select (
  id,
  name,
  slug,
  email,
  active,
  client_type,
  created_at,
  updated_at
) on table public.organizations to authenticated;

revoke select on table public.profiles from anon, authenticated;

grant select (
  id,
  organization_id,
  role,
  full_name,
  active,
  created_at,
  updated_at
) on table public.profiles to authenticated;

create index if not exists organizations_active_name_idx
  on public.organizations (active, name);

create or replace function public.list_privileged_profiles_for_review()
returns table (
  id uuid,
  email text,
  organization_id uuid,
  role public.user_role,
  active boolean,
  created_at timestamptz
)
language sql
stable
security definer
set search_path = public
as $$
  select id, email, organization_id, role, active, created_at
  from public.profiles
  where role is not null;
$$;

revoke execute on function public.list_privileged_profiles_for_review() from public, anon, authenticated;
grant execute on function public.list_privileged_profiles_for_review() to service_role;