create table if not exists public.rate_limits (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users (id) on delete cascade,
  action text not null,
  window_start timestamptz not null,
  count integer not null default 0 check (count >= 0),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create unique index if not exists rate_limits_user_action_window_idx
  on public.rate_limits (user_id, action, window_start);

create index if not exists rate_limits_user_id_idx on public.rate_limits (user_id);

create trigger set_rate_limits_updated_at
before update on public.rate_limits
for each row
execute function public.set_updated_at();

alter table public.rate_limits enable row level security;
