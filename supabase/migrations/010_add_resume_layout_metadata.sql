alter table public.resumes
  add column if not exists layout_metadata jsonb not null default '{}'::jsonb;
