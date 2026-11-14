# UniDate — Environment Configuration Guide

This document outlines environment management for UniDate across development, preview/staging, and production environments.

---

## 1. Environment Architecture

UniDate strictly enforces separation between development and production Supabase projects and credentials.

| Environment | Purpose | Target URL / Platform | EAS Profile |
|---|---|---|---|
| **Development** | Local engineering and feature testing | `http://localhost:8081` / Expo Go | `development` |
| **Preview / Staging** | Internal testing, QA, and PR previews | `staging.unidate.app` | `preview` |
| **Production** | Live app store and production web users | `https://unidate.app` / Google Play / App Store | `production` |

---

## 2. Environment Variables Specification

All client-facing environment variables in Expo must be prefixed with `EXPO_PUBLIC_` to be bundled at build time.

| Variable Name | Required | Default / Example | Description |
|---|---|---|---|
| `EXPO_PUBLIC_SUPABASE_URL` | **Yes** | `https://<project-ref>.supabase.co` | The HTTPS endpoint for your Supabase project. |
| `EXPO_PUBLIC_SUPABASE_ANON_KEY` | **Yes** | `sb_publishable_...` | Public/anon API key for client-side queries (RLS enforced). |
| `EXPO_PUBLIC_SUPABASE_PUBLISHABLE_KEY` | Optional | `sb_publishable_...` | Modern Supabase publishable key format alias. |
| `EXPO_PUBLIC_APP_ENV` | Optional | `development` \| `preview` \| `production` | Active runtime environment tier. |

> ⚠️ **CRITICAL SECURITY NOTE:**
> - NEVER put `SUPABASE_SERVICE_ROLE_KEY` in `.env` or client applications.
> - The service-role key bypasses all Row Level Security and must only exist in secure serverless backend environments or CI/CD pipelines.

---

## 3. Configuration Setup by Tier

### Development Setup (`.env`)
Create a local `.env` file at the project root:
```env
EXPO_PUBLIC_SUPABASE_URL=https://ffgghopixgaykxsdgmhj.supabase.co
EXPO_PUBLIC_SUPABASE_ANON_KEY=sb_publishable_DoshvtiuLF-Lja5qfOzU2Q_3f3y6yE4
EXPO_PUBLIC_APP_ENV=development
```

### Staging Setup (`.env.staging`)
```env
EXPO_PUBLIC_SUPABASE_URL=https://staging-project.supabase.co
EXPO_PUBLIC_SUPABASE_ANON_KEY=your-staging-anon-key
EXPO_PUBLIC_APP_ENV=preview
```

### Production Setup (`.env.production`)
Configure production secrets via **EAS Secrets** (for mobile builds) and **Vercel / Hosting Provider Environment Variables** (for Web):
```bash
# EAS CLI mobile builds
eas secret:create --scope project --name EXPO_PUBLIC_SUPABASE_URL --value https://your-prod-project.supabase.co --type string
eas secret:create --scope project --name EXPO_PUBLIC_SUPABASE_ANON_KEY --value your-production-anon-key --type string
```

---

## 4. Supabase Storage Buckets Configuration

Ensure both environments have the following buckets initialized:

1. **`profile-photos`**:
   - **Public:** `true`
   - **File Size Limit:** 5 MB
   - **Allowed MIME types:** `image/jpeg`, `image/png`, `image/webp`
   - **RLS:** Anyone can view, only authenticated users can upload to their own folder (`auth.uid()`).

2. **`student-verifications`**:
   - **Public:** `false` (Strictly Private)
   - **File Size Limit:** 10 MB
   - **Allowed MIME types:** `image/jpeg`, `image/png`, `application/pdf`
   - **RLS:** Only authenticated student can upload/view their own file path `(storage.foldername(name))[1] = auth.uid()::text`.

