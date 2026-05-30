alter table public.resumes
  add column if not exists title text,
  add column if not exists file_type text,
  add column if not exists extraction_error text;

update public.resumes
set title = coalesce(
      nullif(title, ''),
      nullif(regexp_replace(file_name, '\.[^.]+$', ''), ''),
      file_name,
      'Untitled Resume'
    )
where title is null or title = '';

update public.resumes
set file_type = coalesce(nullif(file_type, ''), mime_type, 'text/plain')
where file_type is null or file_type = '';

alter table public.resumes
  alter column title set not null,
  alter column file_type set not null,
  alter column user_id set default auth.uid();

alter table public.resumes drop constraint if exists resumes_file_size_check;

alter table public.resumes
  add constraint resumes_file_size_check check (file_size > 0 and file_size <= 5242880);

alter table public.analyses
  add column if not exists failure_reason text;

alter table public.analyses
  alter column user_id set default auth.uid();

drop policy if exists "profiles_select_own" on public.profiles;
drop policy if exists "profiles_insert_own" on public.profiles;
drop policy if exists "profiles_update_own" on public.profiles;

create policy "profiles_select_own"
on public.profiles
for select
using (auth.uid() = id);

create policy "profiles_insert_own"
on public.profiles
for insert
with check (auth.uid() = id);

create policy "profiles_update_own"
on public.profiles
for update
using (auth.uid() = id)
with check (auth.uid() = id);

drop policy if exists "resumes_select_own" on public.resumes;
drop policy if exists "resumes_insert_own" on public.resumes;
drop policy if exists "resumes_update_own" on public.resumes;
drop policy if exists "resumes_delete_own" on public.resumes;

create policy "resumes_select_own"
on public.resumes
for select
using (auth.uid() = user_id);

create policy "resumes_insert_own"
on public.resumes
for insert
with check (auth.uid() = user_id);

create policy "resumes_update_own"
on public.resumes
for update
using (auth.uid() = user_id)
with check (auth.uid() = user_id);

create policy "resumes_delete_own"
on public.resumes
for delete
using (auth.uid() = user_id);

drop policy if exists "analyses_select_own" on public.analyses;
drop policy if exists "analyses_insert_own" on public.analyses;
drop policy if exists "analyses_update_own" on public.analyses;
drop policy if exists "analyses_delete_own" on public.analyses;

create policy "analyses_select_own"
on public.analyses
for select
using (auth.uid() = user_id);

create policy "analyses_insert_own"
on public.analyses
for insert
with check (auth.uid() = user_id);

create policy "analyses_update_own"
on public.analyses
for update
using (auth.uid() = user_id)
with check (auth.uid() = user_id);

create policy "analyses_delete_own"
on public.analyses
for delete
using (auth.uid() = user_id);
