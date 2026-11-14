# UniDate — Security & Row Level Security (RLS) Architecture

UniDate follows a **Zero-Trust Security Model**. Client applications are never trusted with administrative privileges or direct data mutations that bypass business constraints.

---

## 1. Core Security Guarantees

1. **Strict 18+ Age Gating:**
   - Under-18 registrations are blocked at both client and database levels.
   - Database trigger `calculate_profile_age()` computes age strictly from `date_of_birth` using `DATE_PART('year', AGE(CURRENT_DATE, NEW.date_of_birth))`.
   - Any client-submitted `age` field is overwritten or rejected if `< 18`.

2. **Server-Controlled Student Verification:**
   - Database trigger `protect_profile_verification_fields()` blocks non-`service_role` updates to `verification_status`.
   - Authenticated client users CANNOT set their own status to `verified`.
   - Verification status is solely approved by automated verification services or administrative staff.

3. **Confidential Student Document Vault:**
   - Student ID photos, matric numbers, and verification selfies are stored in the private `student-verifications` storage bucket.
   - Public access to this bucket is permanently disabled.
   - Storage RLS policy enforces that only the document owner (`(storage.foldername(name))[1] = auth.uid()::text`) can access files.

4. **Mutual-Only Messaging Gate:**
   - Conversations and messages cannot be accessed unless an active, mutual match exists in `public.matches`.
   - Blocked users are immediately revoked from reading or sending messages.

5. **Race-Safe Mutual Matching:**
   - Canonical ordering `user1_id < user2_id` is enforced by database constraint and unique index `idx_unique_canonical_matches`.
   - Mutual match creation is atomic via the `handle_mutual_like_and_match()` database trigger.

---

## 2. Row Level Security (RLS) Policy Matrix

| Table | Policy Name | Command | Who Can Access |
|---|---|---|---|
| `profiles` | `Profiles read policy` | `SELECT` | Own profile OR verified unblocked students viewing public profiles |
| `profiles` | `Users can update their own profile` | `UPDATE` | `auth.uid() = id` (verification status locked by trigger) |
| `profiles` | `Users can insert their own profile` | `INSERT` | `auth.uid() = id` |
| `verification_submissions` | `Users view only their own verification submission` | `SELECT` | `auth.uid() = user_id` |
| `verification_submissions` | `Users insert their own verification submission` | `INSERT` | `auth.uid() = user_id` |
| `likes` | `Users can insert their own likes` | `INSERT` | `auth.uid() = liker_id` (verified & unblocked only) |
| `likes` | `Users can view likes they sent` | `SELECT` | `auth.uid() = liker_id` |
| `likes` | `Users can view incoming likes` | `SELECT` | `auth.uid() = liked_id` |
| `matches` | `Matched users can view their matches` | `SELECT` | `auth.uid() = user1_id OR auth.uid() = user2_id` |
| `conversations` | `Only matched users can access conversation` | `SELECT` | Participants of active, unblocked match |
| `messages` | `Matched users can read messages` | `SELECT` | Participants of active, unblocked match |
| `messages` | `Matched users can send messages` | `INSERT` | Sender must be matched, verified, and unblocked |
| `blocked_users` | `Users can manage their own blocked list` | `ALL` | `auth.uid() = blocker_id` |
| `reports` | `Users can insert reports` | `INSERT` | `auth.uid() = reporter_id` |

---

## 3. Storage Bucket Security

### `profile-photos`
- **Public:** `true`
- **Purpose:** Publicly display student avatars.
- **Upload Rule:** Authenticated users only, scoped to folder `${auth.uid()}/`.

### `student-verifications`
- **Public:** `false`
- **Purpose:** Store sensitive student ID documents for verification.
- **Access Rule:** Only document owner can read/write their files.

---

## 4. Anti-Tampering & Security Definer Functions

The following PostgreSQL functions are marked `SECURITY DEFINER` and have search paths pinned to `public, pg_temp` to prevent search path injection attacks:

1. `calculate_profile_age()`
2. `protect_profile_verification_fields()`
3. `handle_mutual_like_and_match()`
4. `handle_user_block()`

