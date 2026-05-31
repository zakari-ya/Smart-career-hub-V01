alter table public.profiles
  add column if not exists has_password boolean not null default false,
  add column if not exists auth_method text not null default 'email_password';

alter table public.profiles drop constraint if exists profiles_auth_method_check;

alter table public.profiles
  add constraint profiles_auth_method_check
  check (auth_method in ('email_password', 'magic_link'));

create or replace function public.handle_confirmed_user_profile()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
  metadata_has_password boolean;
  metadata_auth_method text;
begin
  if new.email_confirmed_at is null then
    return new;
  end if;

  metadata_has_password := lower(coalesce(new.raw_user_meta_data ->> 'has_password', 'false')) = 'true';
  metadata_auth_method := coalesce(nullif(new.raw_user_meta_data ->> 'auth_method', ''), 'email_password');

  insert into public.profiles (id, email, full_name, has_password, auth_method)
  values (
    new.id,
    coalesce(new.email, ''),
    coalesce(new.raw_user_meta_data ->> 'full_name', ''),
    metadata_has_password,
    metadata_auth_method
  )
  on conflict (id) do update
    set email = excluded.email,
        full_name = coalesce(nullif(excluded.full_name, ''), public.profiles.full_name),
        has_password = public.profiles.has_password or excluded.has_password,
        auth_method = case
          when public.profiles.has_password or excluded.has_password then 'email_password'
          else excluded.auth_method
        end,
        updated_at = now();

  return new;
end;
$$;

drop trigger if exists on_auth_user_confirmed on auth.users;

create trigger on_auth_user_confirmed
after insert or update of email_confirmed_at, email, raw_user_meta_data on auth.users
for each row
when (new.email_confirmed_at is not null)
execute function public.handle_confirmed_user_profile();

insert into public.profiles (id, email, full_name, has_password, auth_method)
select
  users.id,
  coalesce(users.email, ''),
  coalesce(users.raw_user_meta_data ->> 'full_name', ''),
  lower(coalesce(users.raw_user_meta_data ->> 'has_password', 'false')) = 'true',
  coalesce(nullif(users.raw_user_meta_data ->> 'auth_method', ''), 'email_password')
from auth.users
where users.email_confirmed_at is not null
on conflict (id) do update
  set email = excluded.email,
      full_name = coalesce(nullif(excluded.full_name, ''), public.profiles.full_name),
      has_password = public.profiles.has_password or excluded.has_password,
      auth_method = case
        when public.profiles.has_password or excluded.has_password then 'email_password'
        else excluded.auth_method
      end,
      updated_at = now();
