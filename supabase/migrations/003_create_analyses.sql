create table if not exists public.analyses (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users (id) on delete cascade,
  resume_id uuid not null references public.resumes (id) on delete cascade,
  provider text not null,
  model text not null,
  status text not null default 'pending' check (status in ('pending', 'completed', 'failed')),
  result jsonb not null default '{}'::jsonb,
  overall_score integer not null default 0 check (overall_score between 0 and 100),
  ats_score integer not null default 0 check (ats_score between 0 and 100),
  keyword_score integer not null default 0 check (keyword_score between 0 and 100),
  impact_score integer not null default 0 check (impact_score between 0 and 100),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists analyses_user_id_idx on public.analyses (user_id);
create index if not exists analyses_resume_id_idx on public.analyses (resume_id);
create index if not exists analyses_created_at_idx on public.analyses (created_at desc);

create trigger set_analyses_updated_at
before update on public.analyses
for each row
execute function public.set_updated_at();

alter table public.analyses enable row level security;

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
