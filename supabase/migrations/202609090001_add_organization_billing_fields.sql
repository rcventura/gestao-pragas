alter table public.organizations
  add column billing_amount numeric(10, 2),
  add column billing_due_day smallint,
  add constraint organizations_billing_due_day_check
    check (billing_due_day is null or billing_due_day between 1 and 31);

drop function if exists public.get_organization_for_admin(uuid);
drop function if exists public.update_organization_for_admin(uuid, text, text, public.organization_type, text, text, text, text, text, char(2), text, text);

create function public.get_organization_for_admin(target_id uuid)
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
  neighborhood text,
  billing_amount numeric,
  billing_due_day smallint
)
language sql
stable
security definer
set search_path = public
as $$
  select o.id, o.name, o.email, o.client_type, o.document, o.phone,
    o.postal_code, o.street, o.street_number, o.state, o.city, o.neighborhood,
    o.billing_amount, o.billing_due_day
  from public.organizations o
  where o.id = target_id and public.is_super_admin();
$$;

create function public.update_organization_for_admin(
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
  target_neighborhood text,
  target_billing_amount numeric,
  target_billing_due_day smallint
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
    city = target_city, neighborhood = target_neighborhood,
    billing_amount = target_billing_amount, billing_due_day = target_billing_due_day
  where id = target_id;
end;
$$;

revoke execute on function public.get_organization_for_admin(uuid) from public, anon;
grant execute on function public.get_organization_for_admin(uuid) to authenticated;
revoke execute on function public.update_organization_for_admin(uuid, text, text, public.organization_type, text, text, text, text, text, char(2), text, text, numeric, smallint) from public, anon;
grant execute on function public.update_organization_for_admin(uuid, text, text, public.organization_type, text, text, text, text, text, char(2), text, text, numeric, smallint) to authenticated;
