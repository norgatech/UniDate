# UniDate Admin Console (`admin.unidate.com`)

Production-ready administrative web application for **UniDate**, the modern campus dating and social connection platform.

---

## 🚀 Key Modules & Architecture

1. **Authentication & RBAC (`/login`, `/admins`)**
   - Secure email & password authentication connecting to Supabase Auth.
   - Comprehensive Role-Based Access Control:
     - `super_admin`: Full system access, administrator provisioning, audit logs.
     - `moderator`: User management, trust & safety reports, account suspensions.
     - `verification_admin`: Student ID document inspection, approval and rejection.
     - `support_admin`: Read-only user directory and complaint tickets.
     - `university_admin`: Scoped to a specific university campus.

2. **Dashboard Overview (`/dashboard`)**
   - Executive telemetry counters: Total students, active students, verified percentage, pending queue, open safety reports, and mutual matches.
   - Dynamic Recharts charts: Student sign-ups vs connection trends, leading active campuses.
   - Real-time action queues for pending reviews.

3. **Student User Management (`/users`)**
   - Student directory with live search, campus filter, and verification status filter.
   - Full student profile drawer (academic credentials, bio, interests, join date).
   - Administrative actions: Suspend with mandatory reason, restore suspended account.

4. **Student ID Verification Review (`/verifications`)**
   - ID card document inspection from secure Supabase Storage (`student-verifications` bucket).
   - Approval workflow: Automatically grants verified status & badge to student profile.
   - Rejection workflow: Specifies reasons (e.g., blurry image, expired semester, name mismatch).

5. **Trust & Safety Moderation (`/moderation`)**
   - Inappropriate behavior & harassment reports management.
   - Status tracking: Pending, Investigating, Resolved, Dismissed.
   - One-click suspension of reported accounts with audit reason.

6. **Universities & Campuses (`/universities`)**
   - Add and update partner universities, state/country locations, and official email domains.
   - Manage registered faculties and departments per institution.

7. **Interests & Passion Tags (`/interests`)**
   - Curate passion tags across 8 campus categories (Sports, Music, Tech, Arts, etc.).
   - Create, edit, and archive interest tags.

8. **Matching Analytics (`/analytics`)**
   - Swipe volume (likes vs passes) vs mutual connection rates.
   - Campus demographics and academic year distribution.

9. **Immutable Audit Logs (`/audit-logs`)**
   - Append-only audit trail logging every administrative mutation.
   - JSON payload inspector for compliance, accountability, and traceability.

---

## 🛠️ Environment Configuration

Set the following environment variables in `.env.local`:

```env
NEXT_PUBLIC_SUPABASE_URL=https://ffgghopixgaykxsdgmhj.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=sb_publishable_DoshvtiuLF-Lja5qfOzU2Q_3f3y6yE4
```

---

## 🚢 Local Development & Testing

```bash
cd admin
npm install
npm run dev
```

Visit [http://localhost:3000](http://localhost:3000) in your browser.

---

## 🌐 Deployment to Vercel (`admin.unidate.com`)

1. **Deploy to Vercel**:
   ```bash
   vercel --prod
   ```
2. **Set Root Directory**: In Vercel Project Settings, configure **Root Directory** as `admin`.
3. **Set Environment Variables**: In Vercel Project Settings, add `NEXT_PUBLIC_SUPABASE_URL` and `NEXT_PUBLIC_SUPABASE_ANON_KEY`.
4. **Connect Custom Domain**:
   - In Vercel Dashboard -> Settings -> Domains.
   - Add `admin.unidate.com`.
   - Configure DNS CNAME record pointing `admin` to `cname.vercel-dns.com`.

