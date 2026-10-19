-- WalletMV staff & family sign-in (NOT applied yet — needs the owner's approval).
-- An owner invites a person (walletmv_members row with a one-time code). The person opens walletmv.com/join/CODE,
-- signs in with their own account and joins. They can then open the owner's wallet or shop:
--  * they only ever receive the parts of the owner's data their rights allow (walletmv_member_state),
--  * they can only save the parts their rights allow (walletmv_member_save) — everything else is kept from the owner's copy,
--  * a cashier without "Change stock and prices" can only lower stock numbers (by selling), never change prices or items,
--  * private documents, payment history and the package itself are never shared.
-- Owners manage their own rows directly; nobody can see another owner's people.

create table if not exists public.walletmv_members (
  id uuid primary key default gen_random_uuid(),
  owner_id uuid not null default auth.uid() references auth.users(id) on delete cascade,
  code text not null unique check (code ~ '^[A-Z0-9]{6,12}$'),
  member_id uuid references auth.users(id) on delete cascade,
  member_email text check (char_length(member_email) <= 200),
  name text not null check (char_length(name) between 1 and 120),
  contact text check (char_length(contact) <= 200),
  preset text not null default 'family' check (preset in ('family','viewer','cashier','manager','accountant','custom')),
  perms text[] not null default '{}'::text[] check (perms <@ array['addTx','seeBalance','editBudget','groceries','sell','discount','refund','stockView','stockEdit','customers','expenses','shopReports','tax','invite']::text[]),
  status text not null default 'invited' check (status in ('invited','joined')),
  created_at timestamptz not null default now(),
  joined_at timestamptz,
  unique (owner_id, member_id)
);
create index if not exists walletmv_members_owner_idx on public.walletmv_members (owner_id);
create index if not exists walletmv_members_member_idx on public.walletmv_members (member_id);
alter table public.walletmv_members enable row level security;

-- The rights the signed-in person has in an owner's wallet (empty if they are not a joined member).
create or replace function public.walletmv_member_perms(p_owner uuid)
returns text[] language sql stable security definer set search_path = '' as $$
  select coalesce((select m.perms from public.walletmv_members m
    where m.owner_id = p_owner and m.member_id = (select auth.uid()) and m.status = 'joined' limit 1), '{}'::text[]);
$$;
revoke all on function public.walletmv_member_perms(uuid) from public, anon;
grant execute on function public.walletmv_member_perms(uuid) to authenticated;

create policy "owners see their people" on public.walletmv_members for select to authenticated
  using (owner_id = (select auth.uid()) or member_id = (select auth.uid())
         or 'invite' = any(public.walletmv_member_perms(owner_id)));
create policy "owners add people" on public.walletmv_members for insert to authenticated
  with check (status = 'invited' and member_id is null and (
    owner_id = (select auth.uid())
    or ('invite' = any(public.walletmv_member_perms(owner_id)) and perms <@ public.walletmv_member_perms(owner_id) and not ('invite' = any(perms)))));
create policy "owners change rights" on public.walletmv_members for update to authenticated
  using (owner_id = (select auth.uid())) with check (owner_id = (select auth.uid()));
create policy "owners remove people" on public.walletmv_members for delete to authenticated
  using (owner_id = (select auth.uid()) or member_id = (select auth.uid())
         or ('invite' = any(public.walletmv_member_perms(owner_id)) and not ('invite' = any(perms)) and member_id is distinct from owner_id));

-- Join with an invite code. Returns the owner's name, or an error message.
create or replace function public.walletmv_join(p_code text)
returns jsonb language plpgsql security definer set search_path = '' as $$
declare r public.walletmv_members; me uuid := (select auth.uid()); em text := lower(coalesce(auth.jwt() ->> 'email',''));
begin
  if me is null then return jsonb_build_object('ok', false, 'error', 'Log in first'); end if;
  select * into r from public.walletmv_members where code = upper(trim(p_code)) for update;
  if not found then return jsonb_build_object('ok', false, 'error', 'This invite link is not valid. Ask for a new one.'); end if;
  if r.owner_id = me then return jsonb_build_object('ok', false, 'error', 'This is your own invite link. Send it to the person you invited.'); end if;
  if r.status = 'joined' and r.member_id is distinct from me then return jsonb_build_object('ok', false, 'error', 'This invite has already been used. Ask for a new one.'); end if;
  if exists (select 1 from public.walletmv_members x where x.owner_id = r.owner_id and x.member_id = me and x.id <> r.id) then
    delete from public.walletmv_members where id = r.id;
    return jsonb_build_object('ok', true, 'owner', r.owner_id, 'already', true);
  end if;
  update public.walletmv_members set member_id = me, member_email = nullif(em,''), status = 'joined', joined_at = now() where id = r.id;
  return jsonb_build_object('ok', true, 'owner', r.owner_id, 'name', r.name);
end $$;
revoke all on function public.walletmv_join(text) from public, anon;
grant execute on function public.walletmv_join(text) to authenticated;

-- The wallets/shops the signed-in person has joined.
create or replace function public.walletmv_my_workspaces()
returns table (owner_id uuid, owner_name text, shop_name text, perms text[], preset text)
language sql stable security definer set search_path = '' as $$
  select m.owner_id,
         coalesce(nullif(u.raw_user_meta_data ->> 'full_name',''), split_part(u.email,'@',1)),
         nullif(s.state -> 'd' -> 'shopProfile' ->> 'name',''),
         m.perms, m.preset
  from public.walletmv_members m
  join auth.users u on u.id = m.owner_id
  left join public.walletmv_app_state s on s.user_id = m.owner_id
  where m.member_id = (select auth.uid()) and m.status = 'joined';
$$;
revoke all on function public.walletmv_my_workspaces() from public, anon;
grant execute on function public.walletmv_my_workspaces() to authenticated;

-- Which saved parts of the wallet a set of rights may change.
create or replace function public.walletmv_allowed_keys(p text[])
returns text[] language sql immutable set search_path = '' as $$
  select array(select distinct k from unnest(
      case when 'addTx' = any(p) then array['tx','transfers'] else '{}'::text[] end
   || case when 'editBudget' = any(p) then array['budget','catBudgets','goals','bills','calNotes','tasks'] else '{}'::text[] end
   || case when 'groceries' = any(p) then array['groc','homeStock'] else '{}'::text[] end
   || case when 'sell' = any(p) then array['saleLines','shopTx','docCounters','inv','products'] else '{}'::text[] end
   || case when 'expenses' = any(p) then array['shopTx'] else '{}'::text[] end
   || case when 'discount' = any(p) then array['discounts','loyalty'] else '{}'::text[] end
   || case when 'stockEdit' = any(p) then array['products'] else '{}'::text[] end
   || case when 'customers' = any(p) then array['customers','suppliers','workers'] else '{}'::text[] end
  ) as k);
$$;

-- Which saved parts of the wallet a set of rights may see. Documents, payments and other private parts are never shared.
create or replace function public.walletmv_visible_keys(p text[])
returns text[] language sql immutable set search_path = '' as $$
  select array(select distinct k from unnest(
      array['subscription','cats','quick','cur','shopProfile','chargePresets','defaultGst','shared']
   || public.walletmv_allowed_keys(p)
   || case when 'seeBalance' = any(p) then array['accounts','tx','transfers','budget','catBudgets','goals','bills','calNotes','tasks'] else '{}'::text[] end
   || case when 'stockView' = any(p) or 'sell' = any(p) then array['products'] else '{}'::text[] end
   || case when 'shopReports' = any(p) or 'tax' = any(p) then array['shopTx','saleLines','products','customers','suppliers'] else '{}'::text[] end
  ) as k);
$$;

-- Open an owner's wallet as a member: only the parts their rights allow.
create or replace function public.walletmv_member_state(p_owner uuid)
returns jsonb language plpgsql stable security definer set search_path = '' as $$
declare p text[] := public.walletmv_member_perms(p_owner); s record; d jsonb; vis text[];
begin
  if cardinality(p) = 0 then return jsonb_build_object('ok', false, 'error', 'You are not part of this wallet any more.'); end if;
  select state, updated_at into s from public.walletmv_app_state where user_id = p_owner;
  d := coalesce(s.state -> 'd', '{}'::jsonb);
  vis := public.walletmv_visible_keys(p);
  select coalesce(jsonb_object_agg(key, value), '{}'::jsonb) into d from jsonb_each(d) where key = any(vis);
  return jsonb_build_object('ok', true, 'd', d, 'updated_at', s.updated_at, 'perms', to_jsonb(p));
end $$;
revoke all on function public.walletmv_member_state(uuid) from public, anon;
grant execute on function public.walletmv_member_state(uuid) to authenticated;

-- Save as a member. Only allowed parts are written; everything else stays as the owner saved it.
-- p_expected is the owner copy's updated_at the member last loaded; if someone saved since, nothing is written and
-- the app reloads, merges and tries again.
create or replace function public.walletmv_member_save(p_owner uuid, p_patch jsonb, p_expected timestamptz)
returns jsonb language plpgsql security definer set search_path = '' as $$
declare p text[] := public.walletmv_member_perms(p_owner); s record; cur jsonb; ok_keys text[]; k text; v jsonb; at timestamptz := now();
  oldp jsonb; newp jsonb;
begin
  if cardinality(p) = 0 then return jsonb_build_object('ok', false, 'error', 'You are not part of this wallet any more.'); end if;
  if jsonb_typeof(p_patch) <> 'object' or pg_column_size(p_patch) > 4000000 then return jsonb_build_object('ok', false, 'error', 'Nothing to save'); end if;
  select state, updated_at into s from public.walletmv_app_state where user_id = p_owner for update;
  if not found then return jsonb_build_object('ok', false, 'error', 'The owner has not set up this wallet yet.'); end if;
  if p_expected is distinct from s.updated_at then return jsonb_build_object('ok', false, 'stale', true, 'updated_at', s.updated_at); end if;
  cur := coalesce(s.state -> 'd', '{}'::jsonb);
  ok_keys := public.walletmv_allowed_keys(p);
  for k, v in select key, value from jsonb_each(p_patch) loop
    if not (k = any(ok_keys)) then continue; end if;
    -- Selling without "Change stock and prices": items and prices stay; stock can only go down.
    if k = 'products' and not ('stockEdit' = any(p)) then
      oldp := coalesce(cur -> 'products', '[]'::jsonb); newp := v;
      if jsonb_typeof(newp) <> 'array' or jsonb_array_length(newp) <> jsonb_array_length(oldp) then continue; end if;
      if exists (
        select 1 from jsonb_array_elements(newp) e2(n)
        left join jsonb_array_elements(oldp) o2(o) on (o2.o ->> 'id') = (e2.n ->> 'id')
        where o2.o is null
           or (e2.n - 'stock' - 'qty') <> (o2.o - 'stock' - 'qty')
           or coalesce(e2.n -> 'stock', '0'::jsonb) > coalesce(o2.o -> 'stock', '0'::jsonb)
           or coalesce(e2.n -> 'qty', '0'::jsonb) > coalesce(o2.o -> 'qty', '0'::jsonb)
      ) then continue; end if;
    end if;
    cur := jsonb_set(cur, array[k], v, true);
  end loop;
  update public.walletmv_app_state set state = jsonb_build_object('v', 1, 'd', cur), updated_at = at where user_id = p_owner;
  return jsonb_build_object('ok', true, 'updated_at', at);
end $$;
revoke all on function public.walletmv_member_save(uuid, jsonb, timestamptz) from public, anon;
grant execute on function public.walletmv_member_save(uuid, jsonb, timestamptz) to authenticated;
