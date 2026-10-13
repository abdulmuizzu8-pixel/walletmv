# WalletMV phone app (Android + iPhone)

This folder turns the WalletMV website into a real phone app with the gold **W** icon and a navy splash
screen, ready for **Google Play** and the **App Store**. It uses Capacitor, which packs `index.html`
inside the app. The app opens straight into the money app (not the website) and works offline.

```
mobile/
├─ package.json            ← app tools and shortcuts (npm run …)
├─ capacitor.config.json   ← app name "WalletMV", id com.walletmv.app, navy colours
├─ resources/              ← icon + splash images (all phone sizes are made from these)
├─ scripts/copy-web.js     ← copies index.html + icons into the app
└─ README.md               ← this guide
```

> The website on Vercel ignores this folder (see `.vercelignore`), so nothing here is published to the web.

---

## Option A: Android app (Windows laptop is fine)

### One-time setup
1. Install **Node.js LTS** from nodejs.org.
2. Install **Android Studio** from developer.android.com/studio. On first launch, let it download the
   Android SDK.
3. In VS Code, open the `walletmv` folder → **Terminal → New Terminal**:
   ```bash
   cd mobile
   npm install
   npm run setup
   ```
   `setup` copies the website in, creates the `android/` project and makes every icon and splash size.

### Build and test
```bash
npm run android
```
Android Studio opens the project:
- **Test on your phone:** plug the phone in by USB (turn on *Developer options → USB debugging*) → press the green ▶ **Run** button.
- **Make the file for Google Play:** **Build → Generate Signed App Bundle / APK** → **Android App Bundle** →
  create a new key (save the `.jks` file and its password somewhere safe and **never** upload it to GitHub) → **release** → Finish.
  You get `app-release.aab`.

### Publish on Google Play
1. **play.google.com/console**: create a developer account (one-time fee).
2. **Create app** → name *WalletMV* → upload `app-release.aab`.
3. Fill in the store listing (use `resources/icon-only.png` and phone screenshots), link to your Privacy page on walletmv.com, content rating and Data safety form → submit for review.

---

## Option B: iPhone app (needs a Mac)
1. On a Mac install **Xcode** (App Store) and Node.js.
2. In the `mobile` folder:
   ```bash
   npm install
   npm run setup-ios
   npm run ios
   ```
3. Xcode opens → choose your Apple developer team (Apple Developer Program, yearly fee) →
   **Product → Archive** → **Distribute App** → App Store Connect → submit for review.

No Mac? A build service (for example Ionic Appflow or Codemagic) can build the iPhone app in the cloud from
this GitHub repository.

---

## Option C: fastest, no Android Studio (Android only)
Once **walletmv.com** is public: go to **pwabuilder.com** → enter `https://walletmv.com` → **Package for stores
→ Android** → download → upload the `.aab` to Google Play. This app shows the live website, so it updates
by itself whenever you push to GitHub.

---

## Updating the app after you change the website
```bash
cd mobile
npm run build      # copies the new index.html into the app
npm run android    # then Run, or build a new signed bundle
```
Raise the version before each store upload: Android Studio → `android/app/build.gradle` →
`versionCode` +1 and `versionName` (e.g. `1.0.1`).

## Before submitting to the stores
- Move the admin login and free test login out of `index.html` (store reviewers can read the app's files too).
- Real Privacy Policy and Terms pages (both stores require a privacy policy link).
- Store screenshots: phone screenshots of Today, Dashboard, Packages and MVSHOP.
- Problems and concerns → WhatsApp **+960 798 7770**.
