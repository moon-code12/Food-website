-- Allow Supabase sign-ups to be turned on for first-time admin setup, but only
-- for the store account. Any other email is rejected by the database itself,
-- so the restriction cannot be bypassed from the browser.
create or replace function public.restrict_signups_to_store_admin()
returns trigger
language plpgsql
security definer
set search_path = public, pg_temp
as $$
begin
  if lower(new.email) is distinct from 'sultanabdulwaheed382@gmail.com' then
    raise exception 'Sign-ups are restricted to the store account.' using errcode = '42501';
  end if;
  return new;
end;
$$;

drop trigger if exists restrict_signups_to_store_admin on auth.users;
create trigger restrict_signups_to_store_admin
  before insert on auth.users
  for each row execute function public.restrict_signups_to_store_admin();
