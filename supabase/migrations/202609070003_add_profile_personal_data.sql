alter table public.profiles
  add column birth_date date,
  add column sex text,
  add column phone text;

alter table public.profiles
  add constraint profiles_sex_check
  check (sex is null or sex in ('female', 'male', 'non_binary', 'other', 'prefer_not_to_say'));

create or replace function public.create_profile_for_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
  requested_role text;
  requested_organization_id text;
  profile_role public.user_role;
  profile_organization_id uuid;
begin
  requested_role := new.raw_user_meta_data ->> 'role';
  requested_organization_id := new.raw_user_meta_data ->> 'organization_id';

  if requested_role in ('super_admin', 'admin', 'operator') then
    profile_role := requested_role::public.user_role;
  end if;

  if requested_organization_id ~ '^[0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[1-5][0-9a-fA-F]{3}-[89abAB][0-9a-fA-F]{3}-[0-9a-fA-F]{12}$' then
    profile_organization_id := requested_organization_id::uuid;
  end if;

  if profile_role = 'super_admin' then
    profile_organization_id := null;
  end if;

  insert into public.profiles (
    id, email, organization_id, role, full_name, birth_date, sex, phone
  ) values (
    new.id,
    new.email,
    profile_organization_id,
    profile_role,
    coalesce(new.raw_user_meta_data ->> 'full_name', new.raw_user_meta_data ->> 'name'),
    case
      when new.raw_user_meta_data ->> 'birth_date' ~ '^\d{4}-\d{2}-\d{2}$'
      then (new.raw_user_meta_data ->> 'birth_date')::date
      else null
    end,
    nullif(new.raw_user_meta_data ->> 'sex', ''),
    nullif(new.raw_user_meta_data ->> 'phone', '')
  );

  return new;
end;
$$;

create trigger users_create_profile
after insert on auth.users
for each row execute function public.create_profile_for_new_user();
