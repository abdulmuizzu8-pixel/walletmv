# Putting WalletMV on Google Play, the App Store and computers

Everything in this folder is ready to upload. The phone apps open walletmv.com inside the app, so **website updates reach the apps straight away**. You only upload a new app version when the app itself changes (icon, Face ID lock, and so on).

**Store rule to know:** in the Maldives, Google Play and the App Store don't allow an app to sell packages through your own payment methods (BML, m-Faisaa, Dhiraagu Pay and so on). So inside the store apps, prices, payment pages and "buy" buttons are hidden. People buy or renew packages on walletmv.com, then use them in the app.

---

## 1. Accounts you need (one time)

| Account | Cost | Where |
|---|---|---|
| Expo (builds the apps in the cloud) | Free plan is enough to start | expo.dev — you already have the team `muisssss-team` |
| Google Play Console | USD 25, once | play.google.com/console |
| Apple Developer Program | USD 99 a year | developer.apple.com/programs |
| Microsoft Partner Center (Windows store, optional) | Free for individuals | partner.microsoft.com |

**Google Play testing rule:** personal Play accounts must run a **closed test with at least 12 testers for 14 days in a row** before the app can go public. Start this early. Organisation accounts (these need a D-U-N-S number for the business) don't have this rule.

## 2. Connect GitHub to Expo (one time, about 5 minutes)

1. On **expo.dev**, log in → your profile picture → **Account settings → Access tokens → Create token**. Name it `GitHub builds` and copy it.
2. On **github.com/abdulmuizzu8-pixel/walletmv** → **Settings → Secrets and variables → Actions → New repository secret**.
   Name: `EXPO_TOKEN`. Value: paste the token. Save.

Never paste the token anywhere else, including into the code.

## 3. Android (Google Play)

1. On GitHub → **Actions → Build the phone apps → Run workflow**. Choose **android** and leave "Send to the store" unticked. The build takes about 15–30 minutes, depending on the Expo queue.
2. When it's done, go to **expo.dev → walletmv → Builds** and download the `.aab` file.
3. In **Play Console → Create app**, enter WalletMV: Budget & Shop, English, App, Free. Tick the declarations.
4. Fill in the store listing from **listing.md** (text, the Data safety answers and the other forms), with the images from this folder.
5. Go to **Testing → Closed testing → Create track**. Upload the `.aab`, add at least 12 testers (their Gmail addresses or a Google Group), then **Send for review**. Testers must accept the invite and keep the app for 14 days.
6. After 14 days, go to **Dashboard → Apply for production**, answer the questions, then release to **Production**.

**Later updates:** in Google Cloud, create a service account key for Play Console API access. Upload it at **expo.dev → walletmv → Credentials → Android → Google Service Account Key**. After that, run the workflow with **"Send to the store"** ticked, and new versions go to the internal testing track by themselves. Google only accepts this after your first manual upload in step 5.

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
   After this first time, the GitHub workflow can build the iPhone app too.
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

- **Packages and payments** still happen in the browser only. The next step is a server table, so payment requests reach your admin panel and approvals switch packages on for the customer.
- **Email sender:** add your own sender in Supabase (Authentication → Emails → SMTP) so reset and confirmation emails reach everyone.
- **Redirect URLs:** in Supabase (Authentication → URL Configuration), make sure walletmv.com and www.walletmv.com are listed.

Problems? WhatsApp +960 798 7770.
