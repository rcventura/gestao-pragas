alter table public.organizations
  add column email text,
  add column active boolean not null default true;

create index organizations_active_idx on public.organizations (active);
create index organizations_email_idx on public.organizations (email);
