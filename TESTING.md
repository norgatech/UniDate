# UniDate — Testing & Quality Assurance Plan

This document outlines the testing strategy, test suites, and manual verification procedures for UniDate.

---

## 1. Automated Testing & Verification

### Static Type Check
Run the TypeScript compiler to ensure strict typing across all components, hooks, stores, and services:
```bash
npm run typecheck
```
**Acceptance Criteria:** `exit code 0` with 0 type errors.

### Dependency & Build Integrity
Run a web export build to verify bundler asset resolution and polyfills:
```bash
npm run build:web
```
**Acceptance Criteria:** Clean export to `./dist` without missing module errors.

---

## 2. Feature Test Matrix

| Area | Test Scenario | Expected Result | Pass/Fail |
|---|---|---|---|
| **Auth** | Sign up with new email & 8+ character password | Supabase user created, session persisted in `AsyncStorage`. | ✅ |
| **Auth** | Sign in with valid credentials | Redirects to `/(tabs)` or `/(onboarding)` based on completion status. | ✅ |
| **Auth** | Sign in with invalid password | Clear error message displayed, no crash. | ✅ |
| **Auth** | Sign out | Session destroyed, cache cleared, redirected to splash/welcome. | ✅ |
| **18+ Gating** | Register with DOB resulting in age < 18 | Calculation rejects continue; database trigger throws constraint violation. | ✅ |
| **Onboarding** | Search university catalog | Dynamic list filters by campus name, short code, and location. | ✅ |
| **Onboarding** | Upload profile picture | Compressed, uploaded to `profile-photos` storage, preview updated. | ✅ |
| **Onboarding** | Student verification document upload | Document uploaded to private `student-verifications` vault. | ✅ |
| **Onboarding** | Client-side self-verification attempt | Database trigger retains `pending`/`not_submitted` status. | ✅ |
| **Matching** | Send like to a profile | Like recorded in `public.likes`. | ✅ |
| **Matching** | Mutual like between two users | Database trigger automatically creates `match` and `conversation`; celebration modal displays. | ✅ |
| **Messaging** | Send message in match thread | Instant optimistic UI update followed by database persistence in `public.messages`. | ✅ |
| **Messaging** | Supabase Realtime message delivery | Incoming message arrives in real-time without manual polling. | ✅ |
| **Safety** | Block another user | User immediately vanishes from Discovery; reciprocal likes deleted. | ✅ |
| **Safety** | Report inappropriate user | Confidential record stored in `public.reports` for moderation. | ✅ |

---

## 3. Cross-Platform Smoke Tests

### Web (Chrome / Firefox / Safari)
- Verify responsive layout across Desktop (1024px+), Tablet (768px-1024px), and Mobile (<768px).
- Verify web alert and modal fallbacks without native alert blocking.

### Android (Expo Go / Emulator)
- Verify image picker permissions prompt.
- Verify smooth card animations and bottom drawer gestures.

### iOS (Simulator / TestFlight)
- Verify safe area inset handling at top notch and bottom home indicator.
- Verify keyboard avoiding behavior in chat input.

