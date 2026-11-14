/**
 * UniDate — Auth Store (Zustand)
 * Manages authentication state, onboarding progress, and user session
 */
import { create } from 'zustand';
import type { User, StudentProfile, OnboardingStep, VerificationStatus } from '../types';
import { supabase, isSupabaseConfigured } from '../lib/supabase';

interface AuthState {
  // Session
  user: User | null;
  profile: StudentProfile | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  isInitialized: boolean;

  // Onboarding
  onboardingStep: OnboardingStep;
  hasCompletedOnboarding: boolean;
  isEligible: boolean; // 18+ confirmed

  // Actions
  initializeAuth: () => Promise<void>;
  setUser: (user: User | null) => void;
  setProfile: (profile: StudentProfile | null) => void;
  setLoading: (loading: boolean) => void;
  setInitialized: (initialized: boolean) => void;
  setOnboardingStep: (step: OnboardingStep) => void;
  setHasCompletedOnboarding: (completed: boolean) => void;
  setIsEligible: (eligible: boolean) => void;
  refreshProfile: () => Promise<void>;
  signOut: () => Promise<void>;
}

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  profile: null,
  isAuthenticated: false,
  isLoading: true,
  isInitialized: false,
  onboardingStep: 'splash',
  hasCompletedOnboarding: false,
  isEligible: false,

  initializeAuth: async () => {
    try {
      if (!isSupabaseConfigured()) {
        set({ isInitialized: true, isLoading: false });
        return;
      }

      const { data: { session } } = await supabase.auth.getSession();
      if (session?.user) {
        const u: User = {
          id: session.user.id,
          email: session.user.email || '',
          created_at: session.user.created_at || new Date().toISOString(),
          updated_at: new Date().toISOString(),
        };

        const { data: profile } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', session.user.id)
          .maybeSingle();

        set({
          user: u,
          profile: profile || null,
          isAuthenticated: true,
          hasCompletedOnboarding: Boolean(profile?.is_profile_complete),
          isInitialized: true,
          isLoading: false,
        });
      } else {
        set({
          user: null,
          profile: null,
          isAuthenticated: false,
          isInitialized: true,
          isLoading: false,
        });
      }

      // Listen for runtime auth changes
      supabase.auth.onAuthStateChange(async (event, currentSession) => {
        if (event === 'SIGNED_IN' && currentSession?.user) {
          const u: User = {
            id: currentSession.user.id,
            email: currentSession.user.email || '',
            created_at: currentSession.user.created_at || new Date().toISOString(),
            updated_at: new Date().toISOString(),
          };

          const { data: profile } = await supabase
            .from('profiles')
            .select('*')
            .eq('id', currentSession.user.id)
            .maybeSingle();

          set({
            user: u,
            profile: profile || null,
            isAuthenticated: true,
            hasCompletedOnboarding: Boolean(profile?.is_profile_complete),
          });
        } else if (event === 'SIGNED_OUT') {
          set({
            user: null,
            profile: null,
            isAuthenticated: false,
            hasCompletedOnboarding: false,
            onboardingStep: 'splash',
          });
        }
      });
    } catch {
      set({ isInitialized: true, isLoading: false });
    }
  },

  setUser: (user) =>
    set({ user, isAuthenticated: !!user }),

  setProfile: (profile) =>
    set({ profile }),

  setLoading: (isLoading) =>
    set({ isLoading }),

  setInitialized: (isInitialized) =>
    set({ isInitialized }),

  setOnboardingStep: (onboardingStep) =>
    set({ onboardingStep }),

  setHasCompletedOnboarding: (hasCompletedOnboarding) =>
    set({ hasCompletedOnboarding }),

  setIsEligible: (isEligible) =>
    set({ isEligible }),

  refreshProfile: async () => {
    try {
      if (!isSupabaseConfigured()) return;
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data: profile } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .maybeSingle();

      if (profile) {
        const studentProf: StudentProfile = {
          id: profile.id,
          user_id: profile.id,
          display_name: profile.display_name || '',
          date_of_birth: profile.date_of_birth || '',
          age: profile.age || 18,
          gender: profile.gender || 'female',
          bio: profile.bio || '',
          university_id: profile.university_id || '',
          university_name: profile.university_name || '',
          faculty: profile.faculty || '',
          department: profile.department || '',
          level: profile.academic_level || profile.level || '100',
          photos: Array.isArray(profile.photos) ? profile.photos : [],
          interests: Array.isArray(profile.interests) ? profile.interests : [],
          campus_activities: Array.isArray(profile.campus_activities) ? profile.campus_activities : [],
          connection_intention: profile.connection_intention || 'dating',
          verification_status: profile.verification_status || 'not_submitted',
          is_profile_complete: Boolean(profile.is_profile_complete),
          is_visible: profile.is_visible !== false,
          created_at: profile.created_at || new Date().toISOString(),
          updated_at: profile.updated_at || new Date().toISOString(),
        };

        set({
          profile: studentProf,
          hasCompletedOnboarding: Boolean(studentProf.is_profile_complete),
        });
      }
    } catch {
      // ignore
    }
  },

  signOut: async () => {
    try {
      if (isSupabaseConfigured()) {
        await supabase.auth.signOut();
      }
    } catch {
      // ignore
    }
    set({
      user: null,
      profile: null,
      isAuthenticated: false,
      onboardingStep: 'splash',
      hasCompletedOnboarding: false,
      isEligible: false,
    });
  },
}));

