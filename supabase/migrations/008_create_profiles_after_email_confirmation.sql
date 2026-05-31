create or replace function public.handle_confirmed_user_profile()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  if new.email_confirmed_at is null then
    return new;
  end if;

  insert into public.profiles (id, email, full_name)
  values (
    new.id,
    coalesce(new.email, ''),
    coalesce(new.raw_user_meta_data ->> 'full_name', '')
  )
  on conflict (id) do update
    set email = excluded.email,
        full_name = coalesce(nullif(excluded.full_name, ''), public.profiles.full_name),
        updated_at = now();

  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
drop trigger if exists on_auth_user_confirmed on auth.users;

create trigger on_auth_user_confirmed
after insert or update of email_confirmed_at, email, raw_user_meta_data on auth.users
for each row
when (new.email_confirmed_at is not null)
execute function public.handle_confirmed_user_profile();

insert into public.profiles (id, email, full_name)
select
  users.id,
  coalesce(users.email, ''),
  coalesce(users.raw_user_meta_data ->> 'full_name', '')
from auth.users
where users.email_confirmed_at is not null
on conflict (id) do update
  set email = excluded.email,
      full_name = coalesce(nullif(excluded.full_name, ''), public.profiles.full_name),
      updated_at = now();
