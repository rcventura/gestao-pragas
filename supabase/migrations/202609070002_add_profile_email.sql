alter table public.profiles add column email text;

update public.profiles as profiles
set email = users.email
from auth.users as users
where profiles.id = users.id;

alter table public.profiles alter column email set not null;
create unique index profiles_email_idx on public.profiles (email);

create or replace function public.sync_profile_email()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  update public.profiles
  set email = new.email, updated_at = now()
  where id = new.id;
  return new;
end;
$$;

create trigger users_sync_profile_email
after update of email on auth.users
for each row
when (old.email is distinct from new.email)
execute function public.sync_profile_email();
