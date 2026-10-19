-- Adds the new MVTAX package (MVR 800 / 30 days) to the places that only allow known package ids.
-- Applied 19 Oct 2026 with the owner's approval.
alter table public.walletmv_payment_requests drop constraint if exists walletmv_payment_requests_plan_check;
alter table public.walletmv_payment_requests add constraint walletmv_payment_requests_plan_check
  check (plan in ('veli','starter','plus','family','mvshop','mvtax'));

alter table public.walletmv_comp_access drop constraint if exists walletmv_comp_access_plan_check;
alter table public.walletmv_comp_access add constraint walletmv_comp_access_plan_check
  check (plan in ('starter','plus','family','mvshop','mvtax','all'));
