-- WalletMV payments (applied 17 Oct 2026 to the WalletMV Supabase project).
-- 1. walletmv_payment_requests: a customer can add their own request (always "pending") and see their own.
--    Only WalletMV admins (public.walletmv_is_admin()) can see everyone's and approve or decline.
-- 2. walletmv-slips: private storage for transfer slips. Owner adds and reads their own; admins can read to check payments.
-- 3. walletmv_public_config: settings anyone can read (the bank details shown at checkout). Only admins can change them.
--    The bank details themselves are entered in Admin → Payment methods (or directly in the table), never in this repo.
create table if not exists public.walletmv_payment_requests (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null default auth.uid() references auth.users(id) on delete cascade,
  email text check (char_length(email) <= 200),
  name text check (char_length(name) <= 120),
  plan text not null check (plan in ('veli','starter','plus','family','mvshop')),
  period text not null default 'month' check (period in ('month','year')),
  days integer not null check (days between 1 and 366),
  amount numeric(10,2) not null check (amount >= 0 and amount < 100000),
  method text not null check (char_length(method) between 1 and 60),
  method_name text check (char_length(method_name) <= 120),
  reference text check (char_length(reference) <= 120),
  slip_path text check (char_length(slip_path) <= 300),
  joined_on date,
  status text not null default 'pending' check (status in ('pending','approved','rejected')),
  note text check (char_length(note) <= 300),
  starts_on date,
  ends_on date,
  created_at timestamptz not null default now(),
  decided_at timestamptz,
  decided_by uuid
);
create index if not exists walletmv_payment_requests_user_idx on public.walletmv_payment_requests (user_id, created_at desc);
create index if not exists walletmv_payment_requests_status_idx on public.walletmv_payment_requests (status, created_at desc);
alter table public.walletmv_payment_requests enable row level security;

create or replace function public.walletmv_my_pending_requests()
returns integer language sql stable security definer set search_path = '' as $$
  select count(*)::integer from public.walletmv_payment_requests r
  where r.user_id = (select auth.uid()) and r.status = 'pending';
$$;
revoke all on function public.walletmv_my_pending_requests() from public, anon;
grant execute on function public.walletmv_my_pending_requests() to authenticated;

create policy "payment requests: add my own, waiting" on public.walletmv_payment_requests for insert to authenticated
with check (user_id = (select auth.uid()) and status = 'pending'
  and decided_at is null and decided_by is null and starts_on is null and ends_on is null and note is null
  and public.walletmv_my_pending_requests() < 5);
create policy "payment requests: see my own, admins see all" on public.walletmv_payment_requests for select to authenticated
using (user_id = (select auth.uid()) or public.walletmv_is_admin());
create policy "payment requests: only admins decide" on public.walletmv_payment_requests for update to authenticated
using (public.walletmv_is_admin()) with check (public.walletmv_is_admin());
revoke all on public.walletmv_payment_requests from anon;
grant select, insert, update on public.walletmv_payment_requests to authenticated;

insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values ('walletmv-slips', 'walletmv-slips', false, 3145728, array['image/jpeg','image/png','image/webp','application/pdf'])
on conflict (id) do update set public = false, file_size_limit = excluded.file_size_limit, allowed_mime_types = excluded.allowed_mime_types;
create policy "walletmv slips: owner can add" on storage.objects for insert to authenticated
with check (bucket_id = 'walletmv-slips' and (storage.foldername(name))[1] = (select auth.uid())::text);
create policy "walletmv slips: owner or admin can read" on storage.objects for select to authenticated
using (bucket_id = 'walletmv-slips' and ((storage.foldername(name))[1] = (select auth.uid())::text or public.walletmv_is_admin()));

create table if not exists public.walletmv_public_config (
  key text primary key check (key ~ '^[a-z0-9_]{1,40}$'),
  value jsonb not null,
  updated_at timestamptz not null default now(),
  updated_by uuid
);
alter table public.walletmv_public_config enable row level security;
create policy "public config: anyone can read" on public.walletmv_public_config for select to anon, authenticated using (true);
create policy "public config: admins add" on public.walletmv_public_config for insert to authenticated with check (public.walletmv_is_admin());
create policy "public config: admins change" on public.walletmv_public_config for update to authenticated using (public.walletmv_is_admin()) with check (public.walletmv_is_admin());
revoke all on public.walletmv_public_config from anon;
grant select on public.walletmv_public_config to anon;
grant select, insert, update on public.walletmv_public_config to authenticated;

-- Checked 17 Oct 2026 with test rows (rolled back): a customer can add only their own pending request, can't add an
-- approved one or one for someone else, can't approve their own, can't see anyone else's, and can't change the bank
-- details; the owner can see and approve; a signed-out visitor can read the checkout details but not any request.
