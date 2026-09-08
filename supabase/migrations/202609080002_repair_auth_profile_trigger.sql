-- Remove legacy auth triggers that still reference the old cliente_id schema.
do $$
declare
  legacy_trigger record;
begin
  for legacy_trigger in
    select
      trigger_namespace.nspname as table_schema,
      trigger_table.relname as table_name,
      auth_trigger.tgname as trigger_name
    from pg_trigger as auth_trigger
    join pg_class as trigger_table on trigger_table.oid = auth_trigger.tgrelid
    join pg_namespace as trigger_namespace on trigger_namespace.oid = trigger_table.relnamespace
    join pg_proc as trigger_function on trigger_function.oid = auth_trigger.tgfoid
    where trigger_namespace.nspname = 'auth'
      and trigger_table.relname = 'users'
      and not auth_trigger.tgisinternal
      and trigger_function.prosrc ilike '%cliente_id%'
  loop
    execute format(
      'drop trigger if exists %I on %I.%I',
      legacy_trigger.trigger_name,
      legacy_trigger.table_schema,
      legacy_trigger.table_name
    );
  end loop;
end;
$$;

-- Keep one canonical trigger for profiles created after this migration.
drop trigger if exists users_create_profile on auth.users;

create trigger users_create_profile
after insert on auth.users
for each row execute function public.create_profile_for_new_user();