# WalletMV Google Play launch preparation

Status: planning and review only. This branch must not be merged or deployed without explicit owner approval. Do not change production Supabase/Auth settings, the live website, signing credentials, or Play Console release tracks as part of this preparation.

## Decisions confirmed by owner
- Developer account: Personal.
- Launch pricing: free; no in-app digital subscriptions at launch.
- Mobile number: optional.
- Sign in with Apple: defer until a later iOS release.
- Launch market: Maldives first.
- Primary currency: MVR.
- Store listing language: English first; Dhivehi only after localization is verified.
- Ads: assume none unless owner changes this.
- Audience: adults 18+ as a proposed setting; confirm app suitability before submitting.

## Existing repository observations
- Static web app/site is in `index.html`.
- `manifest.webmanifest` already exists and specifies standalone display, an app start URL, theme colors, and icon/screenshot paths.
- This repository has a web app/PWA baseline. No `package.json` or `app.json` was found at the repository root when checked.
- Android packaging route is not selected. Evaluate a Trusted Web Activity (Bubblewrap) against Expo/React Native only after validating all app flows and PWA requirements.
- Proposed package ID `com.walletmv.app` is provisional and must be checked in Play Console before the first upload; package IDs cannot be changed after upload.
- Google OAuth implementation is in a separate PR and still needs owner review plus Google Cloud and Supabase configuration. Do not claim Google sign-in is active until credentials are configured and end-to-end tested.

## Play Store listing draft
App name: WalletMV – Money Tracker

Short description (under 80 characters):
Track your money, budgets, accounts and spending in Maldivian Rufiyaa.

Full description:
WalletMV helps you organize everyday money management in the Maldives.

Track income and expenses, organize spending, plan budgets and review financial activity in Maldivian Rufiyaa (MVR).

Potential features, publish only after each is verified in the release build:
- Track multiple financial accounts.
- Record income and expenses.
- Organize spending into categories.
- Create budgets and monitor spending.
- Review financial reports and charts.
- Export records where supported.
- Set reminders where supported.
- Use dark mode where supported.
- Access personal money-management tools and MVSHOP shop tools where available.

WalletMV is a money-management tool, not a bank. It does not itself provide banking, investment or financial-advisory services. Do not enter sensitive banking credentials unless the app explicitly supports a verified and secure flow.

## Play Console and legal checklist
- [ ] Create personal Play Console account; complete identity and developer verification.
- [ ] Choose developer display name and public contact email.
- [ ] Confirm package ID before first upload.
- [ ] Publish a privacy policy at a stable public URL and verify it matches actual app behavior.
- [ ] Publish terms of service if required for the service model.
- [ ] Implement and test account deletion inside the app and a public web deletion-request route.
- [ ] Audit actual collection/storage of name, email, mobile number, user-entered transactions/balances, receipt photos, device identifiers and location. Declare only what the shipped build actually collects.
- [ ] Complete Data safety, financial-features declaration, content rating and app access instructions in Play Console.
- [ ] Confirm encryption in transit from actual network configuration; do not answer “yes” without verification.
- [ ] Confirm ads setting; current decision is no ads.
- [ ] Set audience only after content and age suitability review; proposed target is 18+.
- [ ] Review current Play payments rules before introducing digital subscriptions or premium features. If digital functionality is sold in the Play-distributed app, Play Billing is generally required unless a specific exception applies.
- [ ] Review Maldives-specific financial, privacy and consumer requirements before public release.

## Android packaging and quality checklist
- [ ] Choose packaging route after inspecting app compatibility and navigation.
- [ ] Verify the production PWA manifest, service worker, HTTPS, icon files and mobile layout without changing production.
- [ ] Create 512x512 Play icon and 1024x500 feature graphic.
- [ ] Capture at least two authentic phone screenshots from the release candidate; do not use fabricated UI.
- [ ] Create a separate test build and verify sign-in, sign-out, offline behavior, navigation, data persistence, export, account deletion, and error states.
- [ ] Verify Google OAuth with test credentials/configuration before enabling for public users.
- [ ] Create and securely back up the signing key; never commit private signing material or credentials.
- [ ] Configure `/.well-known/assetlinks.json` only if required by the chosen Android wrapper/TWA, with the actual package ID and SHA-256 signing fingerprint.
- [ ] Build and validate the Android App Bundle (.aab); record version name/code.
- [ ] Run Play pre-launch report and test on real Android devices.
- [ ] Do not upload a public/production release until explicitly approved.

## Personal-account closed testing
For personal developer accounts created after 13 November 2023, Google currently documents a closed test with at least 12 testers opted in continuously for 14 days before applying for production access. Verify the exact requirement shown in the owner's Play Console at the time of launch.
- [ ] Recruit at least 12 genuine testers if required.
- [ ] Provide clear test instructions and a feedback channel.
- [ ] Record closed-test start date and confirm continuous opt-in period.
- [ ] Review and address feedback; complete the production-access application.

## Local market checklist
- [ ] Confirm launch countries and target launch date.
- [ ] Verify MVR formatting and any exchange-rate assumptions.
- [ ] Verify any references to BML, MIB, SDFC, Ooredoo Money, Dhiraagu, utility bills or local payment methods; do not imply integrations that are not implemented and approved.
- [ ] Verify Maldives-relevant categories such as ferry fares, island shopping, utilities and remittances before claiming them as built features.
- [ ] Decide monthly active user target and customer support contact.

## Owner inputs still needed
- Public developer contact email.
- Privacy policy URL and confirmation that the published policy reflects the actual app.
- Terms URL, if used.
- Confirm target age and ads setting.
- Confirm package ID and Android wrapper route.
- Confirm launch countries, target date and monthly active user target.
- Confirm which listed features are genuinely working in the release build.
- Recruiter/feedback contact and tester list (keep tester emails out of public repository).
- Play Console registration and verification status.
- Google OAuth client ID/configuration status (never commit client secrets).

## Guardrails
- This file is preparation documentation only.
- No production database/Auth configuration, live website, deployment, Play Console release, or PR merge is authorized by this checklist.
- Never store Google client secrets, service-role keys, signing keys, tester personal data, or other secrets in this repository.
