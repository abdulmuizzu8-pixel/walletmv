# WalletMV redesign and daily tasks — review checklist

## Current branch
`feature/walletmv-modern-daily-tasks`

## Implemented in this branch
- Added `daily-tasks.html`: responsive Daily Tasks page with personal and finance categories, priority, due dates, filters, quick-add actions, completion state, daily progress, and delete/clear-completed actions.
- Added `supabase/proposals/daily_tasks_rls.sql`: proposed table and row-level security policies for owner-only task access. This is a proposal, not a production migration, and has not been applied to Supabase.
- The Daily Tasks page clearly labels its current local-browser storage as preview mode. It does not claim cross-device sync or server reminders.

## Known integration blockers
- The current main site is a large single-file app in `index.html`; its current login/account flow must be audited before integrating tasks into its navigation and data model.
- The native iOS/Android app is a WebView wrapper around `walletmv.com`. It will show the feature when the website serves it, but the standalone tasks page is not yet linked from the main site's navigation.
- Existing README documentation warns that prototype/demo account data remains in the website and that secure Supabase persistence has not been verified. Do not represent the whole product as production-ready until that is resolved.
- The current Supabase `public.users` table has zero rows in the inspected project. The proposed tasks table references Supabase Auth user IDs, not IDs from the separate `public.users` table. The app must consistently use Supabase Auth identities before the proposal is applied.
- Supabase security advisories observed during review:
  - `public.walletmv_is_admin()` is a SECURITY DEFINER function executable by authenticated users. Review its intended public RPC exposure and privileges before changing it.
  - Leaked-password protection is disabled. Enable after reviewing the Auth configuration and impact on existing users.

## Review / acceptance checklist
1. Test task create, complete, delete, filters, date handling, empty state, and local persistence on desktop and mobile.
2. Verify keyboard navigation, labels, contrast, and narrow-screen layout.
3. Integrate navigation into the main site after reviewing the full `index.html` application shell.
4. Connect Supabase Auth and task CRUD; require `auth.uid() = user_id` for every operation and test cross-user denial.
5. Apply the SQL only after confirming the existing auth model and reviewing the proposed RLS policies.
6. Test website-in-WebView on iOS and Android; verify app-store store-mode routing is preserved.
7. Review pricing, authentication, payments, account entitlements, and all main navigation sections before calling the overall redesign complete.
8. Deploy only after the owner reviews and approves the pull request.

## Production status
No production deployment has been requested or performed by this branch workflow. The SQL proposal has not been executed against Supabase.
