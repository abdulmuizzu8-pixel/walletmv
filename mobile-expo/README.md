# WalletMV Expo app

This folder creates the Android/iOS native shell for WalletMV using Expo and React Native WebView. It opens https://walletmv.com/?app=1, so the website should be deployed and working before testing the native app. Website updates appear in the app without rebuilding it; native-code or app-icon changes require a new build.

## Link it to your existing Expo project

The intended Expo project is @muisssss-team/walletmv.

1. Install the current Node.js LTS release.
2. Open a terminal in this mobile-expo folder.
3. Run:

   npm install
   npx eas-cli login

4. Link this folder to the existing Expo project:

   npx eas-cli project:init --account muisssss-team

Confirm the CLI links walletmv under muisssss-team. It should add expo.extra.eas.projectId in app.json. If it requests an ID, copy the Project ID from the Expo dashboard for this exact project, then run npx eas-cli project:init --id YOUR_PROJECT_ID.

5. Check configuration:

   npx expo install --check
   npx expo-doctor@latest

## Build an Android install file

Run:

   npx eas-cli build --platform android --profile preview

EAS builds in the cloud. When finished, open its build URL on the Android phone and install the APK. Sign in with the Expo account that owns or has build access to the project.

## iPhone

For TestFlight / App Store distribution, configure Apple signing and run:

   npx eas-cli build --platform ios --profile production

An iPhone cannot install an arbitrary IPA directly. Use TestFlight or the App Store.

## Test with Expo Go

   npx expo start --tunnel

Expo Go is for quick testing only; use an EAS build for a standalone app. SDK 57 Expo Go availability may vary by device-store version, so use an EAS build if Expo Go reports an SDK mismatch.

## Before publishing

This native wrapper does not add server authentication or a database. The current website source contains prototype/demo login and account data, and secure Supabase persistence has not been verified for the app flows. Do not invite customers or publish store builds until authentication, data persistence, privacy policy, and payment flow have been reviewed and secured.
