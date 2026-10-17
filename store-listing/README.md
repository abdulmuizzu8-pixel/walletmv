# Putting WalletMV on Google Play, the App Store and computers

These are **draft publishing instructions**, not confirmation that WalletMV is ready for store submission. The phone apps open `walletmv.com` inside a WebView, so website changes can appear without a new native build; native-code or icon changes require a new build.

The app currently uses a store-specific mode that hides package, service, and checkout pages. **Do not treat this as a verified statement of Google Play or Apple policy for the Maldives.** Billing and external-purchase rules vary by store, storefront, app type, and program. Check the current official Google Play and Apple guidelines for the actual distribution countries and monetisation model before submission. Do not rely on website payments being allowed or on hidden prices alone to satisfy review.

---

## 1. Accounts you need (one time)

| Account | Cost | Where |
|---|---|---|
| Expo (builds the apps in the cloud) | Free plan is enough to start | expo.dev — you already have the team `muisssss-team` |
| Google Play Console | USD 25, once | play.google.com/console |
| Apple Developer Program | USD 99 a year | developer.apple.com/programs |
| Microsoft Partner Center (Windows store, optional) | Free for individuals | partner.microsoft.com |

**Testing requirement:** Play Console may impose closed-testing and production-access requirements based on developer account type and status. Confirm the exact requirement shown in your Play Console; do not assume the requirement is identical for every account.

## 2. Build setup

The repository currently does **not** contain the `Build the phone apps` GitHub Actions workflow described in older instructions. Do not expect that Actions menu item to appear until a workflow is added and the Expo project is linked.

For a manual build, install Node.js LTS, open a terminal in `mobile-expo`, then run:

```bash
npm install
npx expo install --fix
npx expo-doctor@latest
npx eas-cli login
npx eas-cli project:init --account muisssss-team
```

Confirm the CLI links the existing `@muisssss-team/walletmv` project; do not create a duplicate. Verify that `mobile-expo/app.json` contains the correct `expo.extra.eas.projectId` before building. Keep Expo tokens and signing credentials out of source control.

## 3. Android (Google Play)

1. For an installable test APK, run `npx eas-cli build --platform android --profile preview` from `mobile-expo`. Install it on a real Android device and test the app before a production build.
2. For Google Play, run `npx eas-cli build --platform android --profile production`. When the cloud build completes, download the `.aab` from the EAS build page. The project must be correctly linked and Android signing must be configured.
3. In **Play Console → Create app**, enter WalletMV: Budget & Shop, English, App, Free. Tick the declarations.
4. Fill in the store listing from **listing.md** (text, the Data safety answers and the other forms), with the images from this folder.
5. Go to **Testing → Closed testing → Create track**. Upload the `.aab`, add at least 12 testers (their Gmail addresses or a Google Group), then **Send for review**. Testers must accept the invite and keep the app for 14 days.
6. After 14 days, go to **Dashboard → Apply for production**, answer the questions, then release to **Production**.

**Later updates:** automated Play submission is not configured by this repository at present. First verify the app in Play Console. Only set up EAS Submit and a Google Play service account after the initial manual upload and after you explicitly want automated submissions.

## 4. iPhone (App Store)

1. In **App Store Connect → Apps → +**, enter name WalletMV: Budget & Shop, bundle ID `com.walletmv.app` and SKU `walletmv`.
2. **First iPhone build only:** this needs your Apple login once, so do it from your computer. In the `mobile-expo` folder run:
   ```
   npm install
   npx expo install --fix
   npx eas-cli build --platform ios --profile production
   ```
   Log in with your Apple ID when asked. Expo creates the certificates for you. Then send the build to TestFlight:
   ```
   npx eas-cli submit --platform ios --latest
   ```
   Automated GitHub builds are not configured in this repository at present.
3. Install it from **TestFlight** on your iPhone and try it.
4. Fill in the App Store page from **listing.md**: text, the 6.9" screenshots, App Privacy and the review notes with the demo account. Then **Submit for review**.

**Possible Apple answer:** Apple may say packages must also be sold with Apple In-App Purchase (guideline 3.1.1), even though the app doesn't sell anything. If they do, there are two ways forward:
- **Add Apple In-App Purchase** for the packages. Apple takes 15% for small businesses.
- **Make the iPhone app free**, with no package features.

## 5. Desktop app (Windows and Mac)

- **Right now, no store needed:** open walletmv.com in **Chrome or Edge** and click the **Install** icon in the address bar (or Menu → Install WalletMV). On a Mac with **Safari**, use **File → Add to Dock**. WalletMV then opens in its own window, with its own icon.
- **Microsoft Store (free):**
  1. In **Partner Center**, reserve the name "WalletMV".
  2. Go to **pwabuilder.com**, enter `https://walletmv.com`, then choose **Package for stores → Windows**.
  3. Paste in the Package ID, Publisher ID and Publisher display name from Partner Center (Product identity), then download the package.
  4. In Partner Center, upload the `.msixbundle`, fill in the listing (reuse listing.md and `../icons/screenshot-desktop.png`), and submit.
- **Mac App Store:** needs a small Mac app wrapper and the same Apple Developer account. Leave this until the iPhone app is approved.

## 6. Before inviting real customers

- **Authentication, data isolation, and payment activation** need a full end-to-end test against the live Supabase project before launch. The website uses a Supabase state table; verify that its RLS policies isolate rows by the authenticated user ID and that payment approval is admin-only on the server. A browser-only status flag is not proof of payment.
- **Email sender:** add your own sender in Supabase (Authentication → Emails → SMTP) so reset and confirmation emails reach everyone.
- **Redirect URLs:** in Supabase (Authentication → URL Configuration), make sure walletmv.com and www.walletmv.com are listed.

Problems? WhatsApp +960 798 7770.
