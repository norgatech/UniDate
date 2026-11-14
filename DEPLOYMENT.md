# UniDate — Production Deployment Guide

This guide describes the end-to-end deployment workflows for Web, Android, and iOS platforms.

---

## 1. Pre-Deployment Checklist

Before deploying any production release:
1. Run static type checking:
   ```bash
   npm run typecheck
   ```
2. Verify all environment variables are populated with production credentials.
3. Verify that all SQL migrations in `supabase/migrations/` have been executed on the production Supabase project.
4. Verify Row Level Security (RLS) is active on every table:
   - `profiles`
   - `verification_submissions`
   - `likes`
   - `matches`
   - `conversations`
   - `messages`
   - `blocked_users`
   - `reports`

---

## 2. Web Deployment (Vercel / Static Hosting)

UniDate is built with **Expo Router Static Web Rendering**.

### Building Web Assets Locally
```bash
# Export static production bundle to /dist
npm run build:web
```

### Deploying to Vercel
UniDate includes a pre-configured `vercel.json` with SPA routing and security headers.

1. **Via Vercel CLI:**
   ```bash
   npm install -g vercel
   vercel --prod
   ```
2. **Via Vercel Dashboard (GitHub Integration):**
   - Import the `Campus-Love-Project` repository.
   - Build Command: `npx expo export --platform web` (automatically read from `vercel.json`).
   - Output Directory: `dist`
   - Environment Variables:
     - `EXPO_PUBLIC_SUPABASE_URL`: Production Supabase URL
     - `EXPO_PUBLIC_SUPABASE_ANON_KEY`: Production Supabase Anon/Publishable Key
     - `EXPO_PUBLIC_APP_ENV`: `production`

---

## 3. Android Deployment (Google Play Store via EAS)

### 1. Prerequisites
- [EAS CLI](https://docs.expo.dev/build/setup/):
  ```bash
  npm install -g eas-cli
  eas login
  ```
- Google Play Console Developer Account.
- Android Keystore (EAS can automatically generate and securely manage credentials).

### 2. Android App Configuration (`app.json`)
- **Package Name:** `com.unidate.campus`
- **Version Code:** `1` (auto-incremented on each build)
- **Target SDK:** Android 14+ (API 34+)

### 3. Generate Android App Bundle (`.aab`)
```bash
# Build production bundle for Google Play submission
eas build --platform android --profile production
```
Once the build completes on Expo Application Services:
1. Download the `.aab` file from the build URL.
2. Sign in to [Google Play Console](https://play.google.com/console).
3. Create a new release in the **Internal Testing** or **Production** track.
4. Upload the generated `.aab`.
5. Complete store listing details, content rating questionnaire, and privacy policy URL.

---

## 4. iOS Deployment (Apple App Store via EAS)

### 1. Prerequisites
- Apple Developer Account ($99/year).
- App Store Connect app entry created for `com.unidate.campus`.

### 2. iOS App Configuration (`app.json`)
- **Bundle Identifier:** `com.unidate.campus`
- **Build Number:** `1`
- **Privacy Permissions (`infoPlist`):**
  - `NSCameraUsageDescription`
  - `NSPhotoLibraryUsageDescription`
  - `ITSAppUsesNonExemptEncryption: false`

### 3. Build & Submit to App Store Connect
```bash
# Trigger cloud build and sign with Apple certificates
eas build --platform ios --profile production

# Automatically submit to TestFlight / App Store Connect
eas submit --platform ios --profile production
```

---

## 5. Post-Deployment Verification

After deploying:
1. **Auth Smoke Test:** Register a new user, verify session persistence across app restarts.
2. **Realtime Chat Test:** Open two active accounts, send a message and confirm instant delivery via Supabase Realtime without refreshing.
3. **Safety & Blocking Test:** Block a test user, confirm they disappear immediately from the Discovery deck and matching list.

