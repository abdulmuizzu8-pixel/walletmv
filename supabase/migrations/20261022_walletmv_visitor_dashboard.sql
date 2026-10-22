-- WalletMV admin dashboard: anonymous visitor counting + profit (NOT applied yet — needs the owner's approval).
-- Each browser gets a random visitor id (kept in that browser only). No names, emails or IP addresses are stored.
--  * walletmv_visitors: one row per browser — first and last time seen, which page, app or website, phone or computer.
--  * walletmv_visit_days: which visitors came on which day (for "visitors per day" and "new visitors").
--  * walletmv_ping(): the only way to write; anyone can call it, it only touches that one visitor's row.
--  * walletmv_admin_costs: the owner's monthly running costs (hosting, SIM, ads…), admins only.
--  * walletmv_admin_stats(): admins only — online now, visitors, new visitors, sign-ups, revenue, GST, costs, profit.

create table if not exists public.walletmv_visitors (
  vid uuid primary key,
  first_seen timestamptz not null default now(),
  last_seen timestamptz not null default now(),
  sessions integer not null default 1,
  last_page text check (char_length(last_page) <= 60),
  is_app boolean not null default false,
  device text not null default 'phone' check (device in ('phone','tablet','computer'))
);
create index if not exists walletmv_visitors_last_seen_idx on public.walletmv_visitors (last_seen desc);
create index if not exists walletmv_visitors_first_seen_idx on public.walletmv_visitors (first_seen desc);
alter table public.walletmv_visitors enable row level security;
create policy "admins read visitors" on public.walletmv_visitors for select to authenticated using (public.walletmv_is_admin());

create table if not exists public.walletmv_visit_days (
  day date not null,
  vid uuid not null references public.walletmv_visitors(vid) on delete cascade,
  primary key (day, vid)
);
alter table public.walletmv_visit_days enable row level security;
create policy "admins read visit days" on public.walletmv_visit_days for select to authenticated using (public.walletmv_is_admin());

create table if not exists public.walletmv_admin_costs (
  id uuid primary key default gen_random_uuid(),
  name text not null check (char_length(name) between 1 and 80),
  amount numeric(12,2) not null check (amount >= 0 and amount < 10000000),
  created_at timestamptz not null default now()
);
alter table public.walletmv_admin_costs enable row level security;
create policy "admins manage costs" on public.walletmv_admin_costs for all to authenticated
  using (public.walletmv_is_admin()) with check (public.walletmv_is_admin());

-- Count a visit. A new "session" starts after 30 minutes away. Days are counted in Maldives time.
create or replace function public.walletmv_ping(p_vid uuid, p_page text, p_app boolean, p_device text)
returns void language plpgsql security definer set search_path = '' as $$
declare d date := (now() at time zone 'Indian/Maldives')::date; dev text := case when p_device in ('phone','tablet','computer') then p_device else 'phone' end;
begin
  if p_vid is null then return; end if;
  insert into public.walletmv_visitors as v (vid, last_page, is_app, device)
  values (p_vid, left(coalesce(p_page,''), 60), coalesce(p_app,false), dev)
  on conflict (vid) do update set
    sessions = v.sessions + case when v.last_seen < now() - interval '30 minutes' then 1 else 0 end,
    last_seen = now(), last_page = left(coalesce(p_page,''), 60), is_app = coalesce(p_app,false), device = dev
  where v.last_seen < now() - interval '20 seconds';
  insert into public.walletmv_visit_days (day, vid) values (d, p_vid) on conflict do nothing;
end $$;
revoke all on function public.walletmv_ping(uuid, text, boolean, text) from public;
grant execute on function public.walletmv_ping(uuid, text, boolean, text) to anon, authenticated;

-- Everything the dashboard shows, in one call. Admins only.
create or replace function public.walletmv_admin_stats(p_days integer default 14)
returns jsonb language plpgsql stable security definer set search_path = '' as $$
declare today date := (now() at time zone 'Indian/Maldives')::date; n int := least(greatest(coalesce(p_days,14),7),90);
  m0 timestamptz := date_trunc('month', now() at time zone 'Indian/Maldives') at time zone 'Indian/Maldives';
  r jsonb; rev numeric; costs numeric;
begin
  if not public.walletmv_is_admin() then raise exception 'Owner only'; end if;
  select coalesce(sum(amount),0) into rev from public.walletmv_payment_requests
    where status = 'approved' and coalesce(decided_at, created_at) >= m0;
  select coalesce(sum(amount),0) into costs from public.walletmv_admin_costs;
  r := jsonb_build_object(
    'online', (select count(*) from public.walletmv_visitors where last_seen > now() - interval '3 minutes'),
    'online_app', (select count(*) from public.walletmv_visitors where last_seen > now() - interval '3 minutes' and is_app),
    'today', (select count(*) from public.walletmv_visit_days where day = today),
    'today_new', (select count(*) from public.walletmv_visitors where (first_seen at time zone 'Indian/Maldives')::date = today),
    'week', (select count(distinct vid) from public.walletmv_visit_days where day > today - 7),
    'week_new', (select count(*) from public.walletmv_visitors where (first_seen at time zone 'Indian/Maldives')::date > today - 7),
    'month', (select count(distinct vid) from public.walletmv_visit_days where day > today - 30),
    'all_visitors', (select count(*) from public.walletmv_visitors),
    'returning_week', (select count(*) from public.walletmv_visitors where sessions > 1 and last_seen > now() - interval '7 days'),
    'devices', (select coalesce(jsonb_object_agg(device, c), '{}'::jsonb) from (select device, count(*) c from public.walletmv_visitors where last_seen > now() - interval '30 days' group by device) x),
    'app_share', (select count(*) filter (where is_app) from public.walletmv_visitors where last_seen > now() - interval '30 days'),
    'pages', (select coalesce(jsonb_agg(jsonb_build_object('page', last_page, 'n', c) order by c desc), '[]'::jsonb) from (select last_page, count(*) c from public.walletmv_visitors where last_seen > now() - interval '7 days' and coalesce(last_page,'') <> '' group by last_page order by c desc limit 6) x),
    'daily', (select coalesce(jsonb_agg(jsonb_build_object('day', g.day::date, 'visitors', coalesce(v.c,0), 'new', coalesce(nw.c,0)) order by g.day), '[]'::jsonb)
              from generate_series(today - (n-1), today, interval '1 day') as g(day)
              left join (select day, count(*) c from public.walletmv_visit_days group by day) v on v.day = g.day::date
              left join (select (first_seen at time zone 'Indian/Maldives')::date d, count(*) c from public.walletmv_visitors group by 1) nw on nw.d = g.day::date),
    'signups_today', (select count(*) from auth.users where (created_at at time zone 'Indian/Maldives')::date = today),
    'signups_week', (select count(*) from auth.users where created_at > now() - interval '7 days'),
    'signups_all', (select count(*) from auth.users),
    'paid_customers', (select count(distinct user_id) from public.walletmv_payment_requests where status = 'approved' and ends_on >= today),
    'pending_payments', (select count(*) from public.walletmv_payment_requests where status = 'pending'),
    'revenue_month', rev,
    'revenue_all', (select coalesce(sum(amount),0) from public.walletmv_payment_requests where status = 'approved'),
    'gst_month', round(rev * 8 / 108, 2),
    'costs_month', costs,
    'profit_month', round(rev - rev * 8 / 108 - costs, 2),
    'costs', (select coalesce(jsonb_agg(jsonb_build_object('id', id, 'name', name, 'amount', amount) order by created_at), '[]'::jsonb) from public.walletmv_admin_costs),
    'at', now());
  return r;
end $$;
revoke all on function public.walletmv_admin_stats(integer) from public, anon;
grant execute on function public.walletmv_admin_stats(integer) to authenticated;
