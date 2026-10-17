# WalletMV Android app (Trusted Web Activity)

This directory prepares the Android packaging layer for the existing WalletMV PWA. It does not replace the web app or contain production credentials.

## Important status
- Package ID in this draft: `com.walletmv.app` (provisional; verify in Play Console before the first upload).
- Web origin: `https://walletmv.com`.
- Start URL follows the repository PWA manifest: `/?app=1`.
- This is not yet a signed or tested Android release. The final Android project and AAB must be generated and tested in a controlled build environment.
- Do not merge or deploy the website, change Supabase/Auth, or publish to Play Console without the owner's explicit approval.

## Why Trusted Web Activity
The repository already contains a PWA manifest and service worker. A Trusted Web Activity (TWA) is the lightest Android wrapper for that existing experience. It requires a valid Digital Asset Links association at `https://walletmv.com/.well-known/assetlinks.json` for the final package ID and signing certificate. That file must not be guessed: create it only after the release signing certificate is known and after approval to make the production-domain change.

## Build on a developer workstation
Prerequisites: Node.js LTS, Java/JDK supported by the current Bubblewrap release, Android SDK/build tools, Chrome, and a stable internet connection.

1. Review `twa-manifest.json` and confirm the package ID in Play Console.
2. Install Bubblewrap following the official instructions: https://github.com/GoogleChromeLabs/bubblewrap
3. Generate the Android project from the reviewed configuration (Bubblewrap's init flow may fetch the web manifest, so run it only in a developer environment and review all prompted values).
4. Generate a new release signing key locally. Store it in a secure backup; never commit it or passwords to Git.
5. Build a signed AAB and APK with Bubblewrap, then install the APK on real Android devices for testing.
6. Verify Digital Asset Links using the actual package ID and signing certificate. For Play App Signing, make sure the production association uses the appropriate app-signing certificate fingerprint.
7. Run Play pre-launch checks and validate login, account deletion, offline/poor-network behavior, navigation, export, and all user-facing features.
8. Only after review approval, publish the Digital Asset Links file and upload the bundle to the appropriate Play testing track.

Useful official references:
- Bubblewrap: https://github.com/GoogleChromeLabs/bubblewrap
- TWA quick start: https://developer.chrome.com/docs/android/trusted-web-activity/quick-start/
- Play Console personal account testing: https://support.google.com/googleplay/android-developer/answer/14151465

## Build command (after Bubblewrap project generation)
Run from the generated Android project directory:
```sh
bubblewrap update
bubblewrap build
```

Bubblewrap may prompt for key-store settings. Do not put passwords into source files, terminal transcripts shared publicly, or GitHub Actions logs.

## Release blockers
- [ ] Confirm account type and complete Play Console identity verification.
- [ ] Confirm package ID before first upload.
- [ ] Configure Google OAuth in Google Cloud and Supabase, then test sign-in end-to-end. Never put the client secret in the web app or Git.
- [ ] Publish a truthful privacy policy and terms, and verify both in-app and website account-deletion flows.
- [ ] Complete Play Data safety, financial-features declaration, content rating, and app-access instructions.
- [ ] Confirm all features described in the store listing work in the actual release build.
- [ ] Generate final icon/feature graphic and genuine phone screenshots.
- [ ] Verify PWA quality criteria and production domain association.
- [ ] Build and test AAB/APK.
- [ ] Recruit and run any required closed test for the personal developer account.
- [ ] Owner review and explicit approval before merge, deployment, production settings changes, or Play submission.
