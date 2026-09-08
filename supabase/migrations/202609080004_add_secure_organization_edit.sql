create or replace function public.get_organization_for_admin(target_id uuid)
returns table (
  id uuid,
  name text,
  email text,
  client_type public.organization_type,
  document text,
  phone text,
  postal_code text,
  street text,
  street_number text,
  state char(2),
  city text,
  neighborhood text
)
language sql
stable
security definer
set search_path = public
as $$
  select o.id, o.name, o.email, o.client_type, o.document, o.phone,
    o.postal_code, o.street, o.street_number, o.state, o.city, o.neighborhood
  from public.organizations o
  where o.id = target_id and public.is_super_admin();
$$;

create or replace function public.update_organization_for_admin(
  target_id uuid,
  target_name text,
  target_email text,
  target_client_type public.organization_type,
  target_document text,
  target_phone text,
  target_postal_code text,
  target_street text,
  target_street_number text,
  target_state char(2),
  target_city text,
  target_neighborhood text
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
  set name = target_name, email = target_email, client_type = target_client_type,
    document = target_document, phone = target_phone, postal_code = target_postal_code,
    street = target_street, street_number = target_street_number, state = target_state,
    city = target_city, neighborhood = target_neighborhood
  where id = target_id;
end;
$$;

revoke execute on function public.get_organization_for_admin(uuid) from public, anon;
grant execute on function public.get_organization_for_admin(uuid) to authenticated;
revoke execute on function public.update_organization_for_admin(uuid, text, text, public.organization_type, text, text, text, text, text, char(2), text, text) from public, anon;
grant execute on function public.update_organization_for_admin(uuid, text, text, public.organization_type, text, text, text, text, text, char(2), text, text) to authenticated;