-- Proposal only: review before applying to any Supabase project.
-- This migration is intentionally stored outside supabase/migrations so it cannot
-- be mistaken for an approved production migration.
create table if not exists public.daily_tasks (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  title text not null check (char_length(trim(title)) between 1 and 140),
  category text not null check (category in ('personal', 'finance')),
  priority text not null default 'normal' check (priority in ('normal', 'high')),
  due_date date,
  completed_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists daily_tasks_user_due_idx
  on public.daily_tasks (user_id, due_date, completed_at);

alter table public.daily_tasks enable row level security;

grant select, insert, update, delete on public.daily_tasks to authenticated;

create policy "Users can read their own daily tasks"
  on public.daily_tasks for select to authenticated
  using ((select auth.uid()) = user_id);

create policy "Users can create their own daily tasks"
  on public.daily_tasks for insert to authenticated
  with check ((select auth.uid()) = user_id);

create policy "Users can update their own daily tasks"
  on public.daily_tasks for update to authenticated
  using ((select auth.uid()) = user_id)
  with check ((select auth.uid()) = user_id);

create policy "Users can delete their own daily tasks"
  on public.daily_tasks for delete to authenticated
  using ((select auth.uid()) = user_id);
