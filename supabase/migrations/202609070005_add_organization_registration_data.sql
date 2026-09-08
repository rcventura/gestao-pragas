create type public.organization_type as enum ('individual', 'company');

alter table public.organizations
  add column client_type public.organization_type not null default 'company',
  add column document text,
  add column phone text,
  add column postal_code text,
  add column street text,
  add column street_number text,
  add column state char(2),
  add column city text,
  add column neighborhood text;

create index organizations_document_idx on public.organizations (document);
create index organizations_postal_code_idx on public.organizations (postal_code);
