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
end;
$$;

revoke execute on function public.activate_organization_for_admin(uuid) from public, anon;
grant execute on function public.activate_organization_for_admin(uuid) to authenticated;
