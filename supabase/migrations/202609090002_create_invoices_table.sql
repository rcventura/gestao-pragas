create table public.invoices (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references public.organizations(id) on delete restrict,
  amount numeric(10, 2) not null,
  due_date date not null,
  reference_month date not null,
  created_at timestamptz not null default now(),
  unique (organization_id, reference_month)
);

create index invoices_organization_id_idx on public.invoices (organization_id);
create index invoices_due_date_idx on public.invoices (due_date);

alter table public.invoices enable row level security;

create policy invoices_select_policy on public.invoices for select
using (public.is_super_admin() or organization_id = public.current_organization_id());

create function public.is_internal_staff()
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1 from public.profiles
    where id = auth.uid() and active = true and role in ('super_admin', 'admin', 'operator')
  );
$$;

create function public.ensure_current_month_invoices()
returns void
language sql
security definer
set search_path = public
as $$
  insert into public.invoices (organization_id, amount, due_date, reference_month)
  select
    o.id,
    o.billing_amount,
    (date_trunc('month', now())
      + (least(o.billing_due_day, extract(day from (date_trunc('month', now()) + interval '1 month - 1 day'))::int) - 1) * interval '1 day')::date,
    date_trunc('month', now())::date
  from public.organizations o
  where public.is_internal_staff()
    and o.active = true
    and o.billing_due_day is not null
    and o.billing_amount is not null
  on conflict (organization_id, reference_month) do nothing;
$$;

create function public.list_invoices_for_admin()
returns table (
  id uuid,
  organization_name text,
  organization_phone text,
  amount numeric,
  due_date date
)
language sql
stable
security definer
set search_path = public
as $$
  select i.id, o.name, o.phone, i.amount, i.due_date
  from public.invoices i
  join public.organizations o on o.id = i.organization_id
  where public.is_internal_staff()
  order by i.due_date desc;
$$;

revoke execute on function public.is_internal_staff() from public, anon;
grant execute on function public.is_internal_staff() to authenticated;
revoke execute on function public.ensure_current_month_invoices() from public, anon;
grant execute on function public.ensure_current_month_invoices() to authenticated;
revoke execute on function public.list_invoices_for_admin() from public, anon;
grant execute on function public.list_invoices_for_admin() to authenticated;
