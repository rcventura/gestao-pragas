create table public.organization_status_history (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references public.organizations(id) on delete cascade,
  status text not null check (status in ('active', 'inactive')),
  reason text,
  changed_at timestamptz not null default now(),
  changed_by uuid references auth.users(id) on delete set null
);

create index organization_status_history_organization_changed_idx
  on public.organization_status_history (organization_id, changed_at desc);

alter table public.organization_status_history enable row level security;

create or replace function public.deactivate_organization_for_admin(
  target_id uuid,
  target_reason text
)
returns void
language plpgsql
security definer
set search_path = public
as $$
begin
  if not public.is_super_admin() then
    raise exception 'not authorized';
  end if;

  if target_reason is null or length(btrim(target_reason)) = 0 or length(target_reason) > 500 then
    raise exception 'invalid reason';
  end if;

  update public.organizations
  set active = false,
      deactivation_reason = btrim(target_reason),
      deactivated_at = now()
  where id = target_id and active = true;

  if found then
    insert into public.organization_status_history (organization_id, status, reason, changed_by)
    values (target_id, 'inactive', btrim(target_reason), auth.uid());
  end if;
end;
$$;

create or replace function public.activate_organization_for_admin(
  target_id uuid
)
returns void
language plpgsql
security definer
set search_path = public
as $$
begin
  if not public.is_super_admin() then
    raise exception 'not authorized';
  end if;

  update public.organizations
  set active = true,
      deactivated_at = null
  where id = target_id and active = false;

  if found then
    insert into public.organization_status_history (organization_id, status, changed_by)
    values (target_id, 'active', auth.uid());
  end if;
end;
$$;

create or replace function public.get_organization_status_history(target_id uuid)
returns table (
  id uuid,
  status text,
  reason text,
  changed_at timestamptz,
  changed_by uuid
)
language sql
stable
security definer
set search_path = public
as $$
  select h.id, h.status, h.reason, h.changed_at, h.changed_by
  from public.organization_status_history h
  where h.organization_id = target_id
    and public.is_super_admin()
  order by h.changed_at desc;
$$;

revoke all on table public.organization_status_history from public, anon, authenticated;
revoke execute on function public.get_organization_status_history(uuid) from public, anon;
grant execute on function public.get_organization_status_history(uuid) to authenticated;
