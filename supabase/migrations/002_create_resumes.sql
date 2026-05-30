create table if not exists public.resumes (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users (id) on delete cascade,
  file_name text not null,
  storage_path text not null unique,
  mime_type text not null,
  file_size bigint not null check (file_size > 0),
  extracted_text text,
  extraction_status text not null default 'pending' check (extraction_status in ('pending', 'completed', 'failed')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists resumes_user_id_idx on public.resumes (user_id);
create index if not exists resumes_created_at_idx on public.resumes (created_at desc);

create trigger set_resumes_updated_at
before update on public.resumes
for each row
execute function public.set_updated_at();

alter table public.resumes enable row level security;

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

insert into storage.buckets (id, name, public)
values ('resumes', 'resumes', false)
on conflict (id) do nothing;

create policy "resume_bucket_select_own"
on storage.objects
for select
using (
  bucket_id = 'resumes'
  and auth.uid()::text = split_part(name, '/', 1)
);

create policy "resume_bucket_insert_own"
on storage.objects
for insert
with check (
  bucket_id = 'resumes'
  and auth.uid()::text = split_part(name, '/', 1)
);

create policy "resume_bucket_update_own"
on storage.objects
for update
using (
  bucket_id = 'resumes'
  and auth.uid()::text = split_part(name, '/', 1)
)
with check (
  bucket_id = 'resumes'
  and auth.uid()::text = split_part(name, '/', 1)
);

create policy "resume_bucket_delete_own"
on storage.objects
for delete
using (
  bucket_id = 'resumes'
  and auth.uid()::text = split_part(name, '/', 1)
);
