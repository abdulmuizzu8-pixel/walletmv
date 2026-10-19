-- WalletMV owner alerts: remember which payment requests have already been sent to the owner's phone,
-- so each one is only sent once (used by the walletmv-notify function).
-- Applied 19 Oct 2026 with the owner's approval.
alter table public.walletmv_payment_requests add column if not exists notified_at timestamptz;
