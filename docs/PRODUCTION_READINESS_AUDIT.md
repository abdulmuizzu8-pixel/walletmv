# WalletMV production-readiness audit

## Scope

This audit is based on the repository's `main` branch website source and Expo wrapper. It is not a penetration test, a live database-policy verification, or confirmation that the deployed site serves these changes. The fixes in this branch are proposals until reviewed and merged; production was not deployed.

## Changes in this branch

- Removed the seeded active Muraka subscription and fake approved payment request from the app's initial state. A new account must not inherit a sample entitlement.
- Changed missing-field hydration to use a blank account state rather than demo data. The blank state also clears saved documents, category budgets, and charge presets, reducing the chance that demo records appear in a newly created or older partial account.
- Replaced the contradictory MVR 499 one-time purchase language in Terms and Refund Policy with checkout-specific price and access-duration wording. The live package list remains the source of advertised package prices; those prices still need owner confirmation.
- Disabled default bank transfer, mobile wallet, card, PayPal, Skrill, and Wise methods until verified instructions are configured. WhatsApp ordering remains available if its support number is valid.
- Added persisted enabled/disabled state for payment methods and support for persisted custom payment methods in the existing public-config record. Enabling a method with known placeholder instructions is blocked.
- Corrected publishing documentation: the referenced GitHub Actions workflow is not present on `main`; the docs now describe manual EAS builds and no longer state unverified store-payment policy as a fact.

## Still required before customer launch

1. **Supabase security review:** inspect RLS for `walletmv_app_state`, `walletmv_payment_requests`, `walletmv_public_config`, `walletmv_admins`, `walletmv_comp_access`, storage bucket `walletmv-slips`, and all related functions. Confirm users can read/write only their own state and requests, and only authorised administrators can approve payments or change public payment settings.
2. **Privileged function:** review `public.walletmv_is_admin()` and revoke unnecessary execution rights or redesign it if it exposes privileged checks. Do not change production privileges without confirming all call sites and intended admin access.
3. **Auth configuration:** confirm email confirmation, password reset, redirect allowlist for `walletmv.com` and `www.walletmv.com`, rate limits/CAPTCHA, and password policy. Enable leaked-password protection if the project's plan supports it.
4. **Payment reality check:** owner must verify every payment destination, WhatsApp number, support email, and refund contact. Test pending → approved/rejected payment flows using separate customer and admin accounts. No card gateway is treated as live by this code.
5. **Account data:** create two test accounts and prove data never crosses users; test empty, partial, offline, cloud-save failure, logout, deletion, and returning-session cases. Test document upload and deletion.
6. **Legal/privacy:** confirm actual data collected, processors/hosting locations, retention, account deletion behavior, package prices, tax treatment, renewal wording, and store billing rules for each storefront. This audit is not legal advice.
7. **Expo and stores:** link `mobile-expo/app.json` to the existing Expo project using its real project ID, run `expo-doctor`, create a preview APK, and test on physical devices. The repository has no `package-lock.json` and no GitHub build workflow yet. Store submission and policy review remain outstanding.
8. **Live-site verification:** the browser check could not fetch `https://walletmv.com`; verify the deployed site manually after merging. The branch changes are not live until merged and deployed.

## Test performed

- Compiled the complete inline website JavaScript using the JavaScript parser after each code change; syntax validation passed.
- Checked that all seven non-WhatsApp default payment methods are disabled in the source.
- This is a syntax/configuration check only. It does not replace browser, database, payment, security, or device testing.
