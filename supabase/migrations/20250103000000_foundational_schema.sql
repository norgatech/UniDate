-- ============================================================================
-- UNIDATE — HARDENED FOUNDATIONAL DATABASE SCHEMA & RLS MIGRATION
-- File: supabase/migrations/20250103000000_foundational_schema.sql
-- Modules: Profiles, Universities, Interests, Likes, Matches, Messages, Blocks, Reports
-- Security Standard: Zero-trust RLS, 18+ enforcement, Student Verification gating,
--                    Anti-tampering triggers, Race-safe mutual matching
-- ============================================================================

-- Ensure required cryptographic and UUID extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- ============================================================================
-- 1. UNIVERSITIES & ACADEMIC CATALOG (PUBLIC READ ACCESS)
-- ============================================================================
-- The universities catalog is pre-seeded in 20250102000000_seed_ghana_universities.sql.
-- Enable explicit RLS with public read access so unauthenticated/onboarding
-- students can browse campus lists during initial registration.

ALTER TABLE IF EXISTS public.universities ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Universities are viewable by all users" ON public.universities;
CREATE POLICY "Universities are viewable by all users"
ON public.universities FOR SELECT
TO anon, authenticated
USING (true);

ALTER TABLE IF EXISTS public.faculties ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Faculties are viewable by all users" ON public.faculties;
CREATE POLICY "Faculties are viewable by all users"
ON public.faculties FOR SELECT
TO anon, authenticated
USING (true);

ALTER TABLE IF EXISTS public.departments ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Departments are viewable by all users" ON public.departments;
CREATE POLICY "Departments are viewable by all users"
ON public.departments FOR SELECT
TO anon, authenticated
USING (true);

-- ============================================================================
-- 2. INTERESTS & PROFILE INTERESTS CATALOG
-- ============================================================================
CREATE TABLE IF NOT EXISTS public.interests (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL UNIQUE,
    category TEXT NOT NULL DEFAULT 'General',
    icon TEXT,
    created_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()) NOT NULL
);

CREATE TABLE IF NOT EXISTS public.profile_interests (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    profile_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    interest_id UUID NOT NULL REFERENCES public.interests(id) ON DELETE CASCADE,
    created_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()) NOT NULL,
    CONSTRAINT unique_profile_interest UNIQUE(profile_id, interest_id)
);

ALTER TABLE public.interests ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Interests are viewable by all users" ON public.interests;
CREATE POLICY "Interests are viewable by all users"
ON public.interests FOR SELECT
TO anon, authenticated
USING (true);

ALTER TABLE public.profile_interests ENABLE ROW LEVEL SECURITY;

-- Profile interests visible only to authenticated users who are not blocked
DROP POLICY IF EXISTS "Profile interests viewable by unblocked users" ON public.profile_interests;
CREATE POLICY "Profile interests viewable by unblocked users"
ON public.profile_interests FOR SELECT
TO authenticated
USING (
    profile_id NOT IN (
        SELECT blocked_id FROM public.blocked_users WHERE blocker_id = auth.uid()
        UNION
        SELECT blocker_id FROM public.blocked_users WHERE blocked_id = auth.uid()
    )
);

DROP POLICY IF EXISTS "Users can insert their own profile interests" ON public.profile_interests;
CREATE POLICY "Users can insert their own profile interests"
ON public.profile_interests FOR INSERT
TO authenticated
WITH CHECK (auth.uid() = profile_id);

DROP POLICY IF EXISTS "Users can delete their own profile interests" ON public.profile_interests;
CREATE POLICY "Users can delete their own profile interests"
ON public.profile_interests FOR DELETE
TO authenticated
USING (auth.uid() = profile_id);

-- Seed comprehensive interests matching the UniDate client types
INSERT INTO public.interests (name, category, icon) VALUES
    ('Music', 'Creative', 'music'),
    ('Sports', 'Active', 'activity'),
    ('Party', 'Social', 'sparkles'),
    ('Reading', 'Intellectual', 'book-open'),
    ('Movies', 'Entertainment', 'film'),
    ('Prayer', 'Spiritual', 'heart'),
    ('Food', 'Lifestyle', 'utensils'),
    ('Travel', 'Adventure', 'compass'),
    ('Photography', 'Creative', 'camera'),
    ('Gaming', 'Entertainment', 'gamepad-2'),
    ('Art', 'Creative', 'palette'),
    ('Dance', 'Active', 'music'),
    ('Cooking', 'Lifestyle', 'coffee'),
    ('Fitness', 'Active', 'dumbbell'),
    ('Fashion', 'Lifestyle', 'sparkles'),
    ('Technology', 'Intellectual', 'laptop'),
    ('Writing', 'Creative', 'pen-tool'),
    ('Volunteering', 'Social', 'hands-helping'),
    ('Anime', 'Entertainment', 'tv'),
    ('Coffee', 'Lifestyle', 'coffee'),
    ('Nature', 'Adventure', 'trees'),
    ('Podcasts', 'Intellectual', 'headphones'),
    ('Coding', 'Intellectual', 'code'),
    ('Meditation', 'Spiritual', 'feather'),
    ('Comedy', 'Entertainment', 'smile'),
    ('Theater', 'Creative', 'drama'),
    ('Singing', 'Creative', 'mic')
ON CONFLICT (name) DO NOTHING;

-- ============================================================================
-- 3. PROFILES — 18+ REQUIREMENT, ANTI-TAMPERING & HARDENED RLS
-- ============================================================================
-- Enforce non-null date_of_birth and 18+ requirement at constraint level
ALTER TABLE public.profiles ALTER COLUMN date_of_birth SET NOT NULL;

DO $$ BEGIN
    ALTER TABLE public.profiles ADD CONSTRAINT check_min_age CHECK (age >= 18);
EXCEPTION WHEN duplicate_object THEN null; END $$;

DO $$ BEGIN
    ALTER TABLE public.profiles ADD CONSTRAINT check_dob_18_plus
    CHECK (date_of_birth <= (CURRENT_DATE - INTERVAL '18 years'));
EXCEPTION WHEN duplicate_object THEN null; END $$;

-- Hardened age calculation trigger: computes age strictly from date_of_birth,
-- rejecting any spoofed client-supplied age and throwing on under-18 accounts.
CREATE OR REPLACE FUNCTION public.calculate_profile_age()
RETURNS TRIGGER AS $$
BEGIN
    IF NEW.date_of_birth IS NULL THEN
        RAISE EXCEPTION 'A valid date of birth is strictly required.';
    END IF;

    -- Compute age exclusively from date_of_birth
    NEW.age := DATE_PART('year', AGE(CURRENT_DATE, NEW.date_of_birth))::int;

    IF NEW.age < 18 THEN
        RAISE EXCEPTION 'UniDate is strictly restricted to adult students aged 18 and older. Computed age: %', NEW.age;
    END IF;

    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER
SET search_path = public, pg_temp;

DROP TRIGGER IF EXISTS trg_calculate_profile_age ON public.profiles;
CREATE TRIGGER trg_calculate_profile_age
BEFORE INSERT OR UPDATE ON public.profiles
FOR EACH ROW
EXECUTE FUNCTION public.calculate_profile_age();

-- Anti-tampering trigger: prevents authenticated clients from elevating their own
-- verification_status or changing their user ID via client-side UPDATE statements.
CREATE OR REPLACE FUNCTION public.protect_profile_verification_fields()
RETURNS TRIGGER AS $$
BEGIN
    IF (current_user <> 'service_role' AND current_user <> 'postgres' AND auth.role() = 'authenticated') THEN
        IF NEW.verification_status IS DISTINCT FROM OLD.verification_status THEN
            NEW.verification_status := OLD.verification_status;
        END IF;
        IF NEW.id IS DISTINCT FROM OLD.id THEN
            RAISE EXCEPTION 'Profile ID cannot be modified.';
        END IF;
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER
SET search_path = public, pg_temp;

DROP TRIGGER IF EXISTS trg_protect_profile_verification ON public.profiles;
CREATE TRIGGER trg_protect_profile_verification
BEFORE UPDATE ON public.profiles
FOR EACH ROW
EXECUTE FUNCTION public.protect_profile_verification_fields();

-- Profiles RLS Policies:
-- 1. Owner can always view their own profile (even during pending onboarding).
-- 2. Other profiles are viewable ONLY if the viewer is authenticated AND verified (18+),
--    AND the target is verified and visible, AND neither user has blocked the other.
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Public profiles are visible to verified users" ON public.profiles;
DROP POLICY IF EXISTS "Profiles read policy" ON public.profiles;
CREATE POLICY "Profiles read policy"
ON public.profiles FOR SELECT
TO authenticated
USING (
    auth.uid() = id
    OR (
        is_visible = true
        AND verification_status = 'verified'
        AND EXISTS (
            SELECT 1 FROM public.profiles viewer
            WHERE viewer.id = auth.uid()
              AND viewer.verification_status = 'verified'
              AND viewer.age >= 18
        )
        AND NOT EXISTS (
            SELECT 1 FROM public.blocked_users b
            WHERE (b.blocker_id = auth.uid() AND b.blocked_id = profiles.id)
               OR (b.blocker_id = profiles.id AND b.blocked_id = auth.uid())
        )
    )
);

DROP POLICY IF EXISTS "Users can update their own profile" ON public.profiles;
CREATE POLICY "Users can update their own profile"
ON public.profiles FOR UPDATE
TO authenticated
USING (auth.uid() = id)
WITH CHECK (auth.uid() = id);

DROP POLICY IF EXISTS "Users can insert their own profile" ON public.profiles;
CREATE POLICY "Users can insert their own profile"
ON public.profiles FOR INSERT
TO authenticated
WITH CHECK (auth.uid() = id);

-- ============================================================================
-- 4. STUDENT VERIFICATION PRIVACY (NEVER EXPOSED TO OTHER USERS)
-- ============================================================================
ALTER TABLE IF EXISTS public.verification_submissions ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users view only their own verification submission" ON public.verification_submissions;
CREATE POLICY "Users view only their own verification submission"
ON public.verification_submissions FOR SELECT
TO authenticated
USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users insert their own verification submission" ON public.verification_submissions;
CREATE POLICY "Users insert their own verification submission"
ON public.verification_submissions FOR INSERT
TO authenticated
WITH CHECK (auth.uid() = user_id);

-- ============================================================================
-- 5. LIKES — 18+ REQUIREMENT, STUDENT VERIFICATION & BLOCK ENFORCEMENT
-- ============================================================================
ALTER TABLE IF EXISTS public.likes ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can insert their own likes" ON public.likes;
CREATE POLICY "Users can insert their own likes"
ON public.likes FOR INSERT
TO authenticated
WITH CHECK (
    auth.uid() = liker_id
    AND liker_id <> liked_id
    -- Liker must be an approved verified student aged 18+
    AND EXISTS (
        SELECT 1 FROM public.profiles p
        WHERE p.id = auth.uid()
          AND p.verification_status = 'verified'
          AND p.age >= 18
    )
    -- Target must also be an approved verified student aged 18+
    AND EXISTS (
        SELECT 1 FROM public.profiles target
        WHERE target.id = likes.liked_id
          AND target.verification_status = 'verified'
          AND target.age >= 18
    )
    -- Blocked users cannot interact
    AND NOT EXISTS (
        SELECT 1 FROM public.blocked_users b
        WHERE (b.blocker_id = auth.uid() AND b.blocked_id = likes.liked_id)
           OR (b.blocker_id = likes.liked_id AND b.blocked_id = auth.uid())
    )
);

DROP POLICY IF EXISTS "Users can view likes they sent" ON public.likes;
CREATE POLICY "Users can view likes they sent"
ON public.likes FOR SELECT
TO authenticated
USING (auth.uid() = liker_id);

DROP POLICY IF EXISTS "Users can view incoming likes" ON public.likes;
CREATE POLICY "Users can view incoming likes"
ON public.likes FOR SELECT
TO authenticated
USING (auth.uid() = liked_id);

-- ============================================================================
-- 6. MATCHES — CONCURRENCY-SAFE MUTUAL MATCHING & SYMMETRIC UNIQUE CONSTRAINT
-- ============================================================================
ALTER TABLE IF EXISTS public.matches ENABLE ROW LEVEL SECURITY;

-- Enforce canonical ordering (user1_id < user2_id) so duplicate flipped pairs
-- (A, B) and (B, A) are impossible at the database constraint level.
DO $$ BEGIN
    ALTER TABLE public.matches ADD CONSTRAINT check_canonical_match_order
    CHECK (user1_id < user2_id);
EXCEPTION WHEN duplicate_object THEN null; END $$;

CREATE UNIQUE INDEX IF NOT EXISTS idx_unique_canonical_matches
ON public.matches (user1_id, user2_id);

-- Ensure conversations table has a unique match_id constraint to prevent duplicate threads
DO $$ BEGIN
    ALTER TABLE public.conversations ADD CONSTRAINT unique_conversation_match UNIQUE (match_id);
EXCEPTION WHEN duplicate_object THEN null; END $$;

-- Matches RLS: Active participants only, verified only, no blocked pairs
DROP POLICY IF EXISTS "Matched users can view their matches" ON public.matches;
CREATE POLICY "Matched users can view their matches"
ON public.matches FOR SELECT
TO authenticated
USING (
    (auth.uid() = user1_id OR auth.uid() = user2_id)
    AND is_active = true
    AND NOT EXISTS (
        SELECT 1 FROM public.blocked_users b
        WHERE (b.blocker_id = user1_id AND b.blocked_id = user2_id)
           OR (b.blocker_id = user2_id AND b.blocked_id = user1_id)
    )
);

-- Race-safe mutual matching trigger
CREATE OR REPLACE FUNCTION public.handle_mutual_like_and_match()
RETURNS TRIGGER AS $$
DECLARE
    u1 UUID;
    u2 UUID;
    new_match_id UUID;
    both_verified BOOLEAN;
BEGIN
    -- Check if reciprocal like exists
    IF EXISTS (
        SELECT 1 FROM public.likes
        WHERE liker_id = NEW.liked_id AND liked_id = NEW.liker_id
    ) THEN
        -- Deterministic pair ordering
        IF NEW.liker_id < NEW.liked_id THEN
            u1 := NEW.liker_id;
            u2 := NEW.liked_id;
        ELSE
            u1 := NEW.liked_id;
            u2 := NEW.liker_id;
        END IF;

        -- Verify both users are verified and 18+
        SELECT (
            (SELECT COUNT(*) FROM public.profiles
             WHERE id IN (u1, u2)
               AND verification_status = 'verified'
               AND age >= 18) = 2
        ) INTO both_verified;

        IF both_verified THEN
            -- Verify neither user has blocked the other
            IF NOT EXISTS (
                SELECT 1 FROM public.blocked_users
                WHERE (blocker_id = u1 AND blocked_id = u2)
                   OR (blocker_id = u2 AND blocked_id = u1)
            ) THEN
                -- Atomically insert match if not exists
                INSERT INTO public.matches (user1_id, user2_id, is_active)
                VALUES (u1, u2, true)
                ON CONFLICT (user1_id, user2_id) DO NOTHING
                RETURNING id INTO new_match_id;

                -- If this transaction created the match, create the conversation
                IF new_match_id IS NOT NULL THEN
                    INSERT INTO public.conversations (match_id)
                    VALUES (new_match_id)
                    ON CONFLICT (match_id) DO NOTHING;
                END IF;
            END IF;
        END IF;
    END IF;

    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER
SET search_path = public, pg_temp;

DROP TRIGGER IF EXISTS trg_mutual_like_match ON public.likes;
CREATE TRIGGER trg_mutual_like_match
AFTER INSERT ON public.likes
FOR EACH ROW
EXECUTE FUNCTION public.handle_mutual_like_and_match();

-- ============================================================================
-- 7. CONVERSATIONS & MESSAGING — MUTUAL MATCHES & UNBLOCKED ONLY
-- ============================================================================
ALTER TABLE IF EXISTS public.conversations ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.messages ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Only matched users can access conversation" ON public.conversations;
CREATE POLICY "Only matched users can access conversation"
ON public.conversations FOR SELECT
TO authenticated
USING (
    EXISTS (
        SELECT 1 FROM public.matches m
        WHERE m.id = conversations.match_id
        AND (m.user1_id = auth.uid() OR m.user2_id = auth.uid())
        AND m.is_active = true
        AND NOT EXISTS (
            SELECT 1 FROM public.blocked_users b
            WHERE (b.blocker_id = m.user1_id AND b.blocked_id = m.user2_id)
               OR (b.blocker_id = m.user2_id AND b.blocked_id = m.user1_id)
        )
    )
);

DROP POLICY IF EXISTS "Matched users can read messages" ON public.messages;
CREATE POLICY "Matched users can read messages"
ON public.messages FOR SELECT
TO authenticated
USING (
    EXISTS (
        SELECT 1 FROM public.conversations c
        JOIN public.matches m ON m.id = c.match_id
        WHERE c.id = messages.conversation_id
        AND (m.user1_id = auth.uid() OR m.user2_id = auth.uid())
        AND m.is_active = true
        AND NOT EXISTS (
            SELECT 1 FROM public.blocked_users b
            WHERE (b.blocker_id = m.user1_id AND b.blocked_id = m.user2_id)
               OR (b.blocker_id = m.user2_id AND b.blocked_id = m.user1_id)
        )
    )
);

DROP POLICY IF EXISTS "Matched users can send messages" ON public.messages;
CREATE POLICY "Matched users can send messages"
ON public.messages FOR INSERT
TO authenticated
WITH CHECK (
    auth.uid() = sender_id
    AND EXISTS (
        SELECT 1 FROM public.conversations c
        JOIN public.matches m ON m.id = c.match_id
        WHERE c.id = messages.conversation_id
        AND (m.user1_id = auth.uid() OR m.user2_id = auth.uid())
        AND m.is_active = true
        -- Sender must be approved verified student aged 18+
        AND EXISTS (
            SELECT 1 FROM public.profiles p
            WHERE p.id = auth.uid()
              AND p.verification_status = 'verified'
              AND p.age >= 18
        )
        -- Blocked users cannot message
        AND NOT EXISTS (
            SELECT 1 FROM public.blocked_users b
            WHERE (b.blocker_id = m.user1_id AND b.blocked_id = m.user2_id)
               OR (b.blocker_id = m.user2_id AND b.blocked_id = m.user1_id)
        )
    )
);

-- ============================================================================
-- 8. BLOCKING — PREVENT SELF-BLOCKING & AUTOMATIC INTERACTION PURGE
-- ============================================================================
ALTER TABLE IF EXISTS public.blocked_users ENABLE ROW LEVEL SECURITY;

DO $$ BEGIN
    ALTER TABLE public.blocked_users ADD CONSTRAINT check_no_self_block
    CHECK (blocker_id <> blocked_id);
EXCEPTION WHEN duplicate_object THEN null; END $$;

DROP POLICY IF EXISTS "Users can manage their own blocked list" ON public.blocked_users;
CREATE POLICY "Users can manage their own blocked list"
ON public.blocked_users FOR ALL
TO authenticated
USING (auth.uid() = blocker_id)
WITH CHECK (auth.uid() = blocker_id);

-- Trigger: When user A blocks user B, immediately deactivate matches and purge likes
CREATE OR REPLACE FUNCTION public.handle_user_block()
RETURNS TRIGGER AS $$
BEGIN
    -- Deactivate any mutual matches between blocker and blocked
    UPDATE public.matches
    SET is_active = false
    WHERE (user1_id = NEW.blocker_id AND user2_id = NEW.blocked_id)
       OR (user1_id = NEW.blocked_id AND user2_id = NEW.blocker_id);

    -- Remove reciprocal likes
    DELETE FROM public.likes
    WHERE (liker_id = NEW.blocker_id AND liked_id = NEW.blocked_id)
       OR (liker_id = NEW.blocked_id AND liked_id = NEW.blocker_id);

    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER
SET search_path = public, pg_temp;

DROP TRIGGER IF EXISTS trg_handle_user_block ON public.blocked_users;
CREATE TRIGGER trg_handle_user_block
AFTER INSERT ON public.blocked_users
FOR EACH ROW
EXECUTE FUNCTION public.handle_user_block();

-- ============================================================================
-- 9. REPORTS & USER SAFETY
-- ============================================================================
ALTER TABLE IF EXISTS public.reports ENABLE ROW LEVEL SECURITY;

DO $$ BEGIN
    ALTER TABLE public.reports ADD CONSTRAINT check_no_self_report
    CHECK (reporter_id <> reported_user_id);
EXCEPTION WHEN duplicate_object THEN null; END $$;

DROP POLICY IF EXISTS "Users can insert reports" ON public.reports;
CREATE POLICY "Users can insert reports"
ON public.reports FOR INSERT
TO authenticated
WITH CHECK (
    auth.uid() = reporter_id
    AND reporter_id <> reported_user_id
);

DROP POLICY IF EXISTS "Users can view their submitted reports" ON public.reports;
CREATE POLICY "Users can view their submitted reports"
ON public.reports FOR SELECT
TO authenticated
USING (auth.uid() = reporter_id);

-- ============================================================================
-- 10. FUNCTION EXECUTION PERMISSION HARDENING
-- ============================================================================
REVOKE ALL ON FUNCTION public.calculate_profile_age() FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.calculate_profile_age() TO authenticated, service_role, postgres;

REVOKE ALL ON FUNCTION public.protect_profile_verification_fields() FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.protect_profile_verification_fields() TO authenticated, service_role, postgres;

REVOKE ALL ON FUNCTION public.handle_mutual_like_and_match() FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.handle_mutual_like_and_match() TO authenticated, service_role, postgres;

REVOKE ALL ON FUNCTION public.handle_user_block() FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.handle_user_block() TO authenticated, service_role, postgres;

-- ============================================================================
-- 11. PERFORMANCE INDEXES
-- ============================================================================
CREATE INDEX IF NOT EXISTS idx_universities_country ON public.universities(country);
CREATE INDEX IF NOT EXISTS idx_universities_name ON public.universities(name);
CREATE INDEX IF NOT EXISTS idx_profiles_university_id ON public.profiles(university_id);
CREATE INDEX IF NOT EXISTS idx_profiles_verification_status ON public.profiles(verification_status);
CREATE INDEX IF NOT EXISTS idx_profiles_age ON public.profiles(age);
CREATE INDEX IF NOT EXISTS idx_likes_liker_id ON public.likes(liker_id);
CREATE INDEX IF NOT EXISTS idx_likes_liked_id ON public.likes(liked_id);
CREATE INDEX IF NOT EXISTS idx_matches_users ON public.matches(user1_id, user2_id);
CREATE INDEX IF NOT EXISTS idx_matches_active ON public.matches(is_active);
CREATE INDEX IF NOT EXISTS idx_conversations_match_id ON public.conversations(match_id);
CREATE INDEX IF NOT EXISTS idx_messages_conversation_id ON public.messages(conversation_id);
CREATE INDEX IF NOT EXISTS idx_messages_created_at ON public.messages(created_at);
CREATE INDEX IF NOT EXISTS idx_blocked_users_blocker ON public.blocked_users(blocker_id);
CREATE INDEX IF NOT EXISTS idx_blocked_users_blocked ON public.blocked_users(blocked_id);
CREATE INDEX IF NOT EXISTS idx_reports_reported_user ON public.reports(reported_user_id);
CREATE INDEX IF NOT EXISTS idx_interests_name ON public.interests(name);
CREATE INDEX IF NOT EXISTS idx_interests_category ON public.interests(category);
CREATE INDEX IF NOT EXISTS idx_profile_interests_profile ON public.profile_interests(profile_id);
CREATE INDEX IF NOT EXISTS idx_profile_interests_interest ON public.profile_interests(interest_id);
