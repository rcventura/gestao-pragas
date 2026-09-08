-- New profiles must not receive authorization from user-controlled Auth metadata.
-- Existing profiles are intentionally left unchanged and require manual review.

create or replace function public.create_profile_for_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.profiles (
    id,
    email,
    organization_id,
    role,
    full_name,
    birth_date,
    sex,
    phone
  ) values (
    new.id,
    new.email,
    null,
    null,
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

-- Review existing privileged profiles manually before changing them. The
-- migration does not alter existing role or organization assignments.
