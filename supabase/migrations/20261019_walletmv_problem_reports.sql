-- WalletMV problem reports (applied 19 Oct 2026 with the owner's approval).
-- A signed-in customer can add their own report; only WalletMV admins (public.walletmv_is_admin()) can read everyone's and mark them resolved.
create table if not exists public.walletmv_problem_reports (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null default auth.uid() references auth.users(id) on delete cascade,
  ref text not null check (char_length(ref) between 4 and 20),
  category text not null check (char_length(category) between 1 and 80),
  message text not null check (char_length(message) between 5 and 2000),
  page text check (char_length(page) <= 80),
  email text check (char_length(email) <= 200),
  name text check (char_length(name) <= 120),
  diagnostics jsonb not null default '{}'::jsonb check (pg_column_size(diagnostics) < 8000),
  status text not null default 'open' check (status in ('open','resolved')),
  created_at timestamptz not null default now(),
  resolved_at timestamptz,
  notified_at timestamptz
);
create index if not exists walletmv_problem_reports_status_idx on public.walletmv_problem_reports (status, created_at desc);
alter table public.walletmv_problem_reports enable row level security;
create policy "customers add own problem reports" on public.walletmv_problem_reports for insert to authenticated
  with check (user_id = (select auth.uid()) and status = 'open');
create policy "admins read problem reports" on public.walletmv_problem_reports for select to authenticated
  using (public.walletmv_is_admin());
create policy "admins update problem reports" on public.walletmv_problem_reports for update to authenticated
  using (public.walletmv_is_admin()) with check (public.walletmv_is_admin());
