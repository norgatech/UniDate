-- ============================================================================
-- UNIDATE — ADMIN PORTAL, RBAC ROLES, AND IMMUTABLE AUDIT LOGS SCHEMA
-- Migration: 20250104000000_admin_roles_and_audit.sql
-- ============================================================================

-- Ensure required cryptographic extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- ----------------------------------------------------------------------------
-- 1. ADMIN USERS & ROLE-BASED ACCESS CONTROL (RBAC)
-- ----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.admin_users (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    email TEXT NOT NULL UNIQUE,
    full_name TEXT NOT NULL,
    role TEXT NOT NULL CHECK (role IN (
        'super_admin',
        'moderator',
        'verification_admin',
        'support_admin',
        'university_admin'
    )),
    assigned_university_id UUID REFERENCES public.universities(id) ON DELETE SET NULL,
    is_active BOOLEAN DEFAULT true NOT NULL,
    last_login_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Ensure columns exist if table was partially created
DO $$ BEGIN
    ALTER TABLE public.admin_users ADD COLUMN IF NOT EXISTS assigned_university_id UUID REFERENCES public.universities(id) ON DELETE SET NULL;
    ALTER TABLE public.admin_users ADD COLUMN IF NOT EXISTS last_login_at TIMESTAMPTZ;
    ALTER TABLE public.admin_users ADD COLUMN IF NOT EXISTS is_active BOOLEAN DEFAULT true NOT NULL;
EXCEPTION WHEN duplicate_column THEN null; END $$;

-- Enable Row Level Security on admin_users
ALTER TABLE public.admin_users ENABLE ROW LEVEL SECURITY;

-- Policy: Active admins can view admin user directory
DROP POLICY IF EXISTS "Active admins can view admin directory" ON public.admin_users;
CREATE POLICY "Active admins can view admin directory"
ON public.admin_users FOR SELECT
TO authenticated
USING (
    EXISTS (
        SELECT 1 FROM public.admin_users a
        WHERE a.id = auth.uid() AND a.is_active = true
    )
);

-- Policy: Only Super Admins can manage (insert/update/delete) admin accounts
DROP POLICY IF EXISTS "Super admins manage admin accounts" ON public.admin_users;
CREATE POLICY "Super admins manage admin accounts"
ON public.admin_users FOR ALL
TO authenticated
USING (
    EXISTS (
        SELECT 1 FROM public.admin_users a
        WHERE a.id = auth.uid() AND a.role = 'super_admin' AND a.is_active = true
    )
)
WITH CHECK (
    EXISTS (
        SELECT 1 FROM public.admin_users a
        WHERE a.id = auth.uid() AND a.role = 'super_admin' AND a.is_active = true
    )
);

-- ----------------------------------------------------------------------------
-- 2. IMMUTABLE ADMINISTRATOR AUDIT LOGS
-- ----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.admin_audit_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    admin_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    admin_email TEXT NOT NULL,
    action TEXT NOT NULL,
    target_table TEXT NOT NULL,
    target_id TEXT,
    details JSONB DEFAULT '{}'::jsonb NOT NULL,
    ip_address TEXT,
    created_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Ensure columns exist if table was partially created
DO $$ BEGIN
    ALTER TABLE public.admin_audit_logs ADD COLUMN IF NOT EXISTS target_table TEXT;
    ALTER TABLE public.admin_audit_logs ADD COLUMN IF NOT EXISTS target_id TEXT;
    ALTER TABLE public.admin_audit_logs ADD COLUMN IF NOT EXISTS details JSONB DEFAULT '{}'::jsonb;
EXCEPTION WHEN duplicate_column THEN null; END $$;

ALTER TABLE public.admin_audit_logs ENABLE ROW LEVEL SECURITY;

-- Admins can view audit logs
DROP POLICY IF EXISTS "Admins can view audit logs" ON public.admin_audit_logs;
CREATE POLICY "Admins can view audit logs"
ON public.admin_audit_logs FOR SELECT
TO authenticated
USING (
    EXISTS (
        SELECT 1 FROM public.admin_users a
        WHERE a.id = auth.uid() AND a.is_active = true
    )
);

-- Any active admin can insert audit logs
DROP POLICY IF EXISTS "Admins can insert audit logs" ON public.admin_audit_logs;
CREATE POLICY "Admins can insert audit logs"
ON public.admin_audit_logs FOR INSERT
TO authenticated
WITH CHECK (
    EXISTS (
        SELECT 1 FROM public.admin_users a
        WHERE a.id = auth.uid() AND a.is_active = true
    )
);

-- ----------------------------------------------------------------------------
-- 3. EXTEND PROFILES TABLE WITH ADMIN AND MODERATION CONTROLS
-- ----------------------------------------------------------------------------
DO $$ BEGIN
    ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS full_name TEXT;
    ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS is_verified BOOLEAN DEFAULT false;
    ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS is_suspended BOOLEAN DEFAULT false;
    ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS suspension_reason TEXT;
    ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS suspended_at TIMESTAMPTZ;
    ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS suspended_by UUID REFERENCES auth.users(id);
    ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS faculty_name TEXT;
    ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS department_name TEXT;
    ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS avatar_url TEXT;
EXCEPTION WHEN duplicate_column THEN null; END $$;

-- Synchronize full_name and display_name if one is null
UPDATE public.profiles SET full_name = display_name WHERE full_name IS NULL AND display_name IS NOT NULL;
UPDATE public.profiles SET display_name = full_name WHERE display_name IS NULL AND full_name IS NOT NULL;

-- Synchronize is_verified boolean with verification_status enum
UPDATE public.profiles SET is_verified = (verification_status = 'verified') WHERE is_verified IS NULL OR is_verified != (verification_status = 'verified');

-- Allow active admins to view all profiles (including unverified and suspended)
DROP POLICY IF EXISTS "Admins can view all profiles" ON public.profiles;
CREATE POLICY "Admins can view all profiles"
ON public.profiles FOR SELECT
TO authenticated
USING (
    EXISTS (
        SELECT 1 FROM public.admin_users a
        WHERE a.id = auth.uid() AND a.is_active = true
    )
);

-- Allow active admins (moderators, verification admins, super admins) to update profiles
DROP POLICY IF EXISTS "Admins can update profiles" ON public.profiles;
CREATE POLICY "Admins can update profiles"
ON public.profiles FOR UPDATE
TO authenticated
USING (
    EXISTS (
        SELECT 1 FROM public.admin_users a
        WHERE a.id = auth.uid() AND a.is_active = true
    )
)
WITH CHECK (
    EXISTS (
        SELECT 1 FROM public.admin_users a
        WHERE a.id = auth.uid() AND a.is_active = true
    )
);

-- ----------------------------------------------------------------------------
-- 4. EXTEND VERIFICATION_SUBMISSIONS WITH AUDIT AND ACCESS POLICIES
-- ----------------------------------------------------------------------------
DO $$ BEGIN
    ALTER TABLE public.verification_submissions ADD COLUMN IF NOT EXISTS id_card_url TEXT;
    ALTER TABLE public.verification_submissions ADD COLUMN IF NOT EXISTS notes TEXT;
    ALTER TABLE public.verification_submissions ADD COLUMN IF NOT EXISTS student_id_document_url TEXT;
    ALTER TABLE public.verification_submissions ADD COLUMN IF NOT EXISTS review_notes TEXT;
    ALTER TABLE public.verification_submissions ADD COLUMN IF NOT EXISTS reviewed_by UUID REFERENCES auth.users(id);
    ALTER TABLE public.verification_submissions ADD COLUMN IF NOT EXISTS reviewed_at TIMESTAMPTZ;
EXCEPTION WHEN duplicate_column THEN null; END $$;

-- Optional foreign key relationship to profiles for PostgREST resource embedding
DO $$ BEGIN
    ALTER TABLE public.verification_submissions 
    ADD CONSTRAINT fk_verification_profile 
    FOREIGN KEY (user_id) REFERENCES public.profiles(id) ON DELETE CASCADE;
EXCEPTION WHEN duplicate_object THEN null; END $$;

-- Synchronize id_card_url and student_id_document_url
UPDATE public.verification_submissions SET id_card_url = student_id_document_url WHERE id_card_url IS NULL AND student_id_document_url IS NOT NULL;
UPDATE public.verification_submissions SET student_id_document_url = id_card_url WHERE student_id_document_url IS NULL AND id_card_url IS NOT NULL;
UPDATE public.verification_submissions SET notes = review_notes WHERE notes IS NULL AND review_notes IS NOT NULL;

-- Allow active admins to view verification submissions
DROP POLICY IF EXISTS "Admins can view verification submissions" ON public.verification_submissions;
CREATE POLICY "Admins can view verification submissions"
ON public.verification_submissions FOR SELECT
TO authenticated
USING (
    EXISTS (
        SELECT 1 FROM public.admin_users a
        WHERE a.id = auth.uid() AND a.is_active = true
    )
);

-- Allow active verification admins to update verification submissions
DROP POLICY IF EXISTS "Admins can review verification submissions" ON public.verification_submissions;
CREATE POLICY "Admins can review verification submissions"
ON public.verification_submissions FOR UPDATE
TO authenticated
USING (
    EXISTS (
        SELECT 1 FROM public.admin_users a
        WHERE a.id = auth.uid() AND a.is_active = true
    )
)
WITH CHECK (
    EXISTS (
        SELECT 1 FROM public.admin_users a
        WHERE a.id = auth.uid() AND a.is_active = true
    )
);

-- ----------------------------------------------------------------------------
-- 5. EXTEND REPORTS TABLE WITH RESOLUTION AUDIT AND ACCESS POLICIES
-- ----------------------------------------------------------------------------
DO $$ BEGIN
    ALTER TABLE public.reports ADD COLUMN IF NOT EXISTS description TEXT;
    ALTER TABLE public.reports ADD COLUMN IF NOT EXISTS action_taken TEXT;
    ALTER TABLE public.reports ADD COLUMN IF NOT EXISTS resolved_by UUID REFERENCES auth.users(id);
    ALTER TABLE public.reports ADD COLUMN IF NOT EXISTS resolved_at TIMESTAMPTZ;
EXCEPTION WHEN duplicate_column THEN null; END $$;

-- Optional foreign key relationship to profiles for PostgREST resource embedding
DO $$ BEGIN
    ALTER TABLE public.reports 
    ADD CONSTRAINT fk_reports_reported_profile 
    FOREIGN KEY (reported_user_id) REFERENCES public.profiles(id) ON DELETE CASCADE;
EXCEPTION WHEN duplicate_object THEN null; END $$;

-- Synchronize description and details
UPDATE public.reports SET description = details WHERE description IS NULL AND details IS NOT NULL;

-- Allow active admins to view and manage safety reports
DROP POLICY IF EXISTS "Admins can view reports" ON public.reports;
CREATE POLICY "Admins can view reports"
ON public.reports FOR SELECT
TO authenticated
USING (
    EXISTS (
        SELECT 1 FROM public.admin_users a
        WHERE a.id = auth.uid() AND a.is_active = true
    )
);

DROP POLICY IF EXISTS "Admins can update reports" ON public.reports;
CREATE POLICY "Admins can update reports"
ON public.reports FOR UPDATE
TO authenticated
USING (
    EXISTS (
        SELECT 1 FROM public.admin_users a
        WHERE a.id = auth.uid() AND a.is_active = true
    )
)
WITH CHECK (
    EXISTS (
        SELECT 1 FROM public.admin_users a
        WHERE a.id = auth.uid() AND a.is_active = true
    )
);

-- ----------------------------------------------------------------------------
-- 6. EXTEND UNIVERSITIES & INTERESTS MANAGEMENT POLICIES FOR ADMINS
-- ----------------------------------------------------------------------------
DROP POLICY IF EXISTS "Super admins can modify universities" ON public.universities;
CREATE POLICY "Super admins can modify universities"
ON public.universities FOR ALL
TO authenticated
USING (
    EXISTS (
        SELECT 1 FROM public.admin_users a
        WHERE a.id = auth.uid() AND a.role = 'super_admin' AND a.is_active = true
    )
)
WITH CHECK (
    EXISTS (
        SELECT 1 FROM public.admin_users a
        WHERE a.id = auth.uid() AND a.role = 'super_admin' AND a.is_active = true
    )
);

DROP POLICY IF EXISTS "Super admins can modify faculties" ON public.faculties;
CREATE POLICY "Super admins can modify faculties"
ON public.faculties FOR ALL
TO authenticated
USING (
    EXISTS (
        SELECT 1 FROM public.admin_users a
        WHERE a.id = auth.uid() AND a.role = 'super_admin' AND a.is_active = true
    )
)
WITH CHECK (
    EXISTS (
        SELECT 1 FROM public.admin_users a
        WHERE a.id = auth.uid() AND a.role = 'super_admin' AND a.is_active = true
    )
);

DROP POLICY IF EXISTS "Super admins can modify interests" ON public.interests;
CREATE POLICY "Super admins can modify interests"
ON public.interests FOR ALL
TO authenticated
USING (
    EXISTS (
        SELECT 1 FROM public.admin_users a
        WHERE a.id = auth.uid() AND a.role = 'super_admin' AND a.is_active = true
    )
)
WITH CHECK (
    EXISTS (
        SELECT 1 FROM public.admin_users a
        WHERE a.id = auth.uid() AND a.role = 'super_admin' AND a.is_active = true
    )
);

-- ----------------------------------------------------------------------------
-- 7. PERFORMANCE INDEXES FOR ADMIN CONSOLE
-- ----------------------------------------------------------------------------
CREATE INDEX IF NOT EXISTS idx_admin_audit_logs_created_at ON public.admin_audit_logs(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_admin_audit_logs_admin_id ON public.admin_audit_logs(admin_id);
CREATE INDEX IF NOT EXISTS idx_admin_audit_logs_action ON public.admin_audit_logs(action);
CREATE INDEX IF NOT EXISTS idx_admin_users_role ON public.admin_users(role);
CREATE INDEX IF NOT EXISTS idx_admin_users_assigned_uni ON public.admin_users(assigned_university_id);
CREATE INDEX IF NOT EXISTS idx_profiles_is_suspended ON public.profiles(is_suspended);
CREATE INDEX IF NOT EXISTS idx_verification_submissions_status ON public.verification_submissions(status);
CREATE INDEX IF NOT EXISTS idx_reports_status ON public.reports(status);
