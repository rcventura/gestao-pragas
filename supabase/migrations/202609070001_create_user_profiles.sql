create extension if not exists pgcrypto;

create type public.user_role as enum ('super_admin', 'admin', 'operator');

create table public.organizations (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  slug text not null unique,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  organization_id uuid references public.organizations(id) on delete restrict,
  role public.user_role,
  full_name text,
  active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint profiles_role_organization_check check (
    role is null
    or (role = 'super_admin' and organization_id is null)
    or (role in ('admin', 'operator') and organization_id is not null)
  )
);

create index profiles_organization_id_idx on public.profiles (organization_id);
create index profiles_role_idx on public.profiles (role);

create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create trigger organizations_set_updated_at
before update on public.organizations
for each row execute function public.set_updated_at();

create trigger profiles_set_updated_at
before update on public.profiles
for each row execute function public.set_updated_at();

create or replace function public.is_super_admin()
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1 from public.profiles
    where id = auth.uid() and role = 'super_admin' and active = true
  );
$$;

create or replace function public.current_organization_id()
returns uuid
language sql
stable
security definer
set search_path = public
as $$
  select organization_id from public.profiles
  where id = auth.uid() and active = true limit 1;
$$;

create or replace function public.is_organization_admin(target_organization_id uuid)
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select public.is_super_admin()
    or exists (
      select 1 from public.profiles
      where id = auth.uid()
        and organization_id = target_organization_id
        and role = 'admin'
        and active = true
    );
$$;

alter table public.organizations enable row level security;
alter table public.profiles enable row level security;

create policy organizations_select_policy on public.organizations for select
using (public.is_super_admin() or id = public.current_organization_id());

create policy organizations_insert_policy on public.organizations for insert
with check (public.is_super_admin());

create policy organizations_update_policy on public.organizations for update
using (public.is_super_admin()) with check (public.is_super_admin());

create policy profiles_select_policy on public.profiles for select
using (public.is_super_admin() or id = auth.uid() or organization_id = public.current_organization_id());

create policy profiles_insert_policy on public.profiles for insert
with check (
  public.is_super_admin()
  or (role <> 'super_admin' and public.is_organization_admin(organization_id))
);

create policy profiles_update_policy on public.profiles for update
using (
  public.is_super_admin()
  or (organization_id = public.current_organization_id()
      and public.is_organization_admin(organization_id)
      and role <> 'super_admin')
)
with check (
  public.is_super_admin()
  or (organization_id = public.current_organization_id()
      and public.is_organization_admin(organization_id)
      and role <> 'super_admin')
);

create policy profiles_delete_policy on public.profiles for delete
using (
  public.is_super_admin()
  or (organization_id = public.current_organization_id()
      and public.is_organization_admin(organization_id)
      and role <> 'super_admin')
);
