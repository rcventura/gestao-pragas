alter table public.organizations
  add column if not exists deactivation_reason text,
  add column if not exists deactivated_at timestamptz;

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
end;
$$;

revoke execute on function public.deactivate_organization_for_admin(uuid, text) from public, anon;
grant execute on function public.deactivate_organization_for_admin(uuid, text) to authenticated;
