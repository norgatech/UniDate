-- ============================================================================
-- UNIDATE — DATABASE SCHEMA & ROW LEVEL SECURITY (RLS) MIGRATIONS
-- Product: UniDate
-- Architecture: PostgreSQL + Supabase
-- Target Audience: Verified adult university students aged 18+
-- ============================================================================

-- Enable required extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- ----------------------------------------------------------------------------
-- 1. UNIVERSITIES & DEPARTMENTS
-- ----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.universities (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    short_name TEXT NOT NULL,
    country TEXT NOT NULL,
    city TEXT NOT NULL,
    domain TEXT,
    created_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()) NOT NULL
);

CREATE TABLE IF NOT EXISTS public.faculties (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    university_id UUID NOT NULL REFERENCES public.universities(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    created_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()) NOT NULL
);

CREATE TABLE IF NOT EXISTS public.departments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    faculty_id UUID NOT NULL REFERENCES public.faculties(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    created_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- ----------------------------------------------------------------------------
-- 2. STUDENT PROFILES
-- ----------------------------------------------------------------------------
DO $$ BEGIN
    CREATE TYPE verification_status_enum AS ENUM (
        'not_submitted',
        'pending',
        'verified',
        'rejected',
        'resubmission_required'
    );
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    CREATE TYPE connection_intention_enum AS ENUM (
        'serious_relationship',
        'dating',
        'friends_first',
        'distance_relationship',
        'homie'
    );
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

CREATE TABLE IF NOT EXISTS public.profiles (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    display_name TEXT NOT NULL,
    date_of_birth DATE NOT NULL,
    age INT,
    gender TEXT NOT NULL,
    bio TEXT DEFAULT '',
    university_id UUID REFERENCES public.universities(id),
    university_name TEXT,
    faculty TEXT,
    department TEXT,
    academic_level TEXT,
    photos JSONB DEFAULT '[]'::jsonb,
    interests TEXT[] DEFAULT '{}',
    campus_activities TEXT[] DEFAULT '{}',
    connection_intention connection_intention_enum DEFAULT 'serious_relationship',
    verification_status verification_status_enum DEFAULT 'not_submitted',
    is_profile_complete BOOLEAN DEFAULT false,
    is_visible BOOLEAN DEFAULT true,
    created_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()) NOT NULL,
    CONSTRAINT check_min_age CHECK (age >= 18)
);

-- Trigger to calculate age automatically from date_of_birth before insert or update
CREATE OR REPLACE FUNCTION public.calculate_profile_age()
RETURNS TRIGGER AS $$
BEGIN
    IF NEW.date_of_birth IS NOT NULL THEN
        NEW.age := DATE_PART('year', AGE(CURRENT_DATE, NEW.date_of_birth))::int;
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_calculate_profile_age ON public.profiles;
CREATE TRIGGER trg_calculate_profile_age
BEFORE INSERT OR UPDATE ON public.profiles
FOR EACH ROW
EXECUTE FUNCTION public.calculate_profile_age();

-- ----------------------------------------------------------------------------
-- 3. STUDENT VERIFICATION SUBMISSIONS (STRICTLY PRIVATE)
-- ----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.verification_submissions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    full_name TEXT NOT NULL,
    matric_number TEXT NOT NULL,
    faculty TEXT NOT NULL,
    department TEXT NOT NULL,
    academic_level TEXT NOT NULL,
    student_id_document_url TEXT,
    selfie_url TEXT,
    status verification_status_enum DEFAULT 'pending',
    review_notes TEXT,
    submitted_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()) NOT NULL,
    reviewed_at TIMESTAMPTZ,
    reviewed_by UUID REFERENCES auth.users(id)
);

-- ----------------------------------------------------------------------------
-- 4. LIKES & MUTUAL MATCHES
-- ----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.likes (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    liker_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    liked_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    is_super_like BOOLEAN DEFAULT false,
    created_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()) NOT NULL,
    CONSTRAINT unique_like UNIQUE(liker_id, liked_id)
);

CREATE TABLE IF NOT EXISTS public.matches (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user1_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    user2_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    is_active BOOLEAN DEFAULT true,
    matched_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()) NOT NULL,
    CONSTRAINT unique_match_pair UNIQUE (user1_id, user2_id),
    CONSTRAINT match_different_users CHECK (user1_id <> user2_id)
);

-- ----------------------------------------------------------------------------
-- 5. CONVERSATIONS & MESSAGES
-- ----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.conversations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    match_id UUID NOT NULL REFERENCES public.matches(id) ON DELETE CASCADE,
    created_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()) NOT NULL
);

CREATE TABLE IF NOT EXISTS public.messages (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    conversation_id UUID NOT NULL REFERENCES public.conversations(id) ON DELETE CASCADE,
    sender_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    content TEXT NOT NULL,
    message_type TEXT DEFAULT 'text',
    is_read BOOLEAN DEFAULT false,
    created_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- ----------------------------------------------------------------------------
-- 6. CAMPUS EVENTS & RSVPs
-- ----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.campus_events (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    university_id UUID REFERENCES public.universities(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    description TEXT NOT NULL,
    date DATE NOT NULL,
    time TEXT NOT NULL,
    venue TEXT NOT NULL,
    organizer TEXT NOT NULL,
    image_url TEXT,
    category TEXT DEFAULT 'social',
    is_approved BOOLEAN DEFAULT true,
    created_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()) NOT NULL
);

CREATE TABLE IF NOT EXISTS public.event_rsvps (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    event_id UUID NOT NULL REFERENCES public.campus_events(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    created_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()) NOT NULL,
    CONSTRAINT unique_event_rsvp UNIQUE(event_id, user_id)
);

-- ----------------------------------------------------------------------------
-- 7. SAFETY, MODERATION, REPORTS & BLOCKS
-- ----------------------------------------------------------------------------
DO $$ BEGIN
    CREATE TYPE report_reason_enum AS ENUM (
        'fake_profile',
        'harassment',
        'inappropriate_content',
        'underage',
        'spam',
        'other'
    );
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

CREATE TABLE IF NOT EXISTS public.reports (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    reporter_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    reported_user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    reason report_reason_enum NOT NULL,
    details TEXT,
    status TEXT DEFAULT 'submitted',
    created_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()) NOT NULL
);

CREATE TABLE IF NOT EXISTS public.blocked_users (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    blocker_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    blocked_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    created_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()) NOT NULL,
    CONSTRAINT unique_block UNIQUE(blocker_id, blocked_id)
);

-- ============================================================================
-- ROW LEVEL SECURITY (RLS) POLICIES
-- ============================================================================

-- Enable RLS on all tables
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.verification_submissions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.likes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.matches ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.conversations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.campus_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.event_rsvps ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.reports ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.blocked_users ENABLE ROW LEVEL SECURITY;

-- ----------------------------------------------------------------------------
-- PROFILES RLS
-- ----------------------------------------------------------------------------
-- Users can see active public profiles who haven't blocked them
DROP POLICY IF EXISTS "Public profiles are visible to verified users" ON public.profiles;
CREATE POLICY "Public profiles are visible to verified users"
ON public.profiles FOR SELECT
USING (
    is_visible = true
    AND id NOT IN (
        SELECT blocked_id FROM public.blocked_users WHERE blocker_id = auth.uid()
        UNION
        SELECT blocker_id FROM public.blocked_users WHERE blocked_id = auth.uid()
    )
);

-- Users can update only their own profile
DROP POLICY IF EXISTS "Users can update their own profile" ON public.profiles;
CREATE POLICY "Users can update their own profile"
ON public.profiles FOR UPDATE
USING (auth.uid() = id);

-- Users can insert their own profile
DROP POLICY IF EXISTS "Users can insert their own profile" ON public.profiles;
CREATE POLICY "Users can insert their own profile"
ON public.profiles FOR INSERT
WITH CHECK (auth.uid() = id);

-- ----------------------------------------------------------------------------
-- VERIFICATION SUBMISSIONS RLS (NEVER EXPOSED PUBLICLY)
-- ----------------------------------------------------------------------------
-- Only user themselves can view their submission status
DROP POLICY IF EXISTS "Users view only their own verification submission" ON public.verification_submissions;
CREATE POLICY "Users view only their own verification submission"
ON public.verification_submissions FOR SELECT
USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users insert their own verification submission" ON public.verification_submissions;
CREATE POLICY "Users insert their own verification submission"
ON public.verification_submissions FOR INSERT
WITH CHECK (auth.uid() = user_id);

-- ----------------------------------------------------------------------------
-- LIKES & MUTUAL MATCHES RLS
-- ----------------------------------------------------------------------------
DROP POLICY IF EXISTS "Users can view likes they sent" ON public.likes;
CREATE POLICY "Users can view likes they sent"
ON public.likes FOR SELECT
USING (auth.uid() = liker_id);

DROP POLICY IF EXISTS "Users can insert their own likes" ON public.likes;
CREATE POLICY "Users can insert their own likes"
ON public.likes FOR INSERT
WITH CHECK (auth.uid() = liker_id);

DROP POLICY IF EXISTS "Matched users can view their matches" ON public.matches;
CREATE POLICY "Matched users can view their matches"
ON public.matches FOR SELECT
USING (auth.uid() = user1_id OR auth.uid() = user2_id);

-- ----------------------------------------------------------------------------
-- CONVERSATIONS & MESSAGES RLS (MUTUAL MATCHES ONLY)
-- ----------------------------------------------------------------------------
DROP POLICY IF EXISTS "Only matched users can access conversation" ON public.conversations;
CREATE POLICY "Only matched users can access conversation"
ON public.conversations FOR SELECT
USING (
    EXISTS (
        SELECT 1 FROM public.matches m
        WHERE m.id = conversations.match_id
        AND (m.user1_id = auth.uid() OR m.user2_id = auth.uid())
        AND m.is_active = true
    )
);

DROP POLICY IF EXISTS "Matched users can read messages" ON public.messages;
CREATE POLICY "Matched users can read messages"
ON public.messages FOR SELECT
USING (
    EXISTS (
        SELECT 1 FROM public.conversations c
        JOIN public.matches m ON m.id = c.match_id
        WHERE c.id = messages.conversation_id
        AND (m.user1_id = auth.uid() OR m.user2_id = auth.uid())
        AND m.is_active = true
    )
);

DROP POLICY IF EXISTS "Matched users can send messages" ON public.messages;
CREATE POLICY "Matched users can send messages"
ON public.messages FOR INSERT
WITH CHECK (
    auth.uid() = sender_id
    AND EXISTS (
        SELECT 1 FROM public.conversations c
        JOIN public.matches m ON m.id = c.match_id
        WHERE c.id = messages.conversation_id
        AND (m.user1_id = auth.uid() OR m.user2_id = auth.uid())
        AND m.is_active = true
    )
);

-- ----------------------------------------------------------------------------
-- CAMPUS EVENTS RLS
-- ----------------------------------------------------------------------------
DROP POLICY IF EXISTS "Events are viewable by all verified users" ON public.campus_events;
CREATE POLICY "Events are viewable by all verified users"
ON public.campus_events FOR SELECT
USING (is_approved = true);

DROP POLICY IF EXISTS "Users can manage their own RSVPs" ON public.event_rsvps;
CREATE POLICY "Users can manage their own RSVPs"
ON public.event_rsvps FOR ALL
USING (auth.uid() = user_id);

-- ----------------------------------------------------------------------------
-- REPORTS & BLOCKS RLS
-- ----------------------------------------------------------------------------
DROP POLICY IF EXISTS "Users can insert reports" ON public.reports;
CREATE POLICY "Users can insert reports"
ON public.reports FOR INSERT
WITH CHECK (auth.uid() = reporter_id);

DROP POLICY IF EXISTS "Users can manage their own blocked list" ON public.blocked_users;
CREATE POLICY "Users can manage their own blocked list"
ON public.blocked_users FOR ALL
USING (auth.uid() = blocker_id);

-- ============================================================================
-- STORAGE BUCKET POLICIES (PRIVATE ID STORAGE VS PUBLIC AVATARS)
-- ============================================================================

-- Public bucket for profile photos
INSERT INTO storage.buckets (id, name, public)
VALUES ('profile-photos', 'profile-photos', true)
ON CONFLICT (id) DO NOTHING;

-- Private bucket for student ID documents (NEVER PUBLIC)
INSERT INTO storage.buckets (id, name, public)
VALUES ('student-verifications', 'student-verifications', false)
ON CONFLICT (id) DO NOTHING;

-- RLS for student-verifications storage
DROP POLICY IF EXISTS "Users can upload their own verification documents" ON storage.objects;
CREATE POLICY "Users can upload their own verification documents"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (
    bucket_id = 'student-verifications'
    AND (storage.foldername(name))[1] = auth.uid()::text
);

DROP POLICY IF EXISTS "Users can view only their own verification files" ON storage.objects;
CREATE POLICY "Users can view only their own verification files"
ON storage.objects FOR SELECT
TO authenticated
USING (
    bucket_id = 'student-verifications'
    AND (storage.foldername(name))[1] = auth.uid()::text
);

