/**
 * UniDate — Authentication Service
 * Interacts directly with Supabase Auth with robust error handling,
 * email verification, session persistence, and password recovery.
 */
import { supabase, isSupabaseConfigured } from '../lib/supabase';
import type { User, StudentProfile } from '../types';

export interface AuthResponse<T = any> {
  data: T | null;
  error: string | null;
}

export const authService = {
  /**
   * Register a new student account using email and password.
   */
  async signUp(email: string, password: string, fullName: string): Promise<AuthResponse<{ user: User | null; session: any }>> {
    try {
      if (!isSupabaseConfigured()) {
        return { data: null, error: 'Supabase is not configured. Check environment variables.' };
      }

      const { data, error } = await supabase.auth.signUp({
        email: email.trim().toLowerCase(),
        password,
        options: {
          data: {
            full_name: fullName.trim(),
          },
        },
      });

      if (error) {
        return { data: null, error: error.message };
      }

      const user: User | null = data.user
        ? {
            id: data.user.id,
            email: data.user.email || email,
            created_at: data.user.created_at || new Date().toISOString(),
            updated_at: new Date().toISOString(),
          }
        : null;

      return { data: { user, session: data.session }, error: null };
    } catch (err: any) {
      return { data: null, error: err.message || 'An unexpected error occurred during registration.' };
    }
  },

  /**
   * Sign in using email and password.
   */
  async signIn(email: string, password: string): Promise<AuthResponse<{ user: User; session: any }>> {
    try {
      if (!isSupabaseConfigured()) {
        return { data: null, error: 'Supabase is not configured. Check environment variables.' };
      }

      const { data, error } = await supabase.auth.signInWithPassword({
        email: email.trim().toLowerCase(),
        password,
      });

      if (error) {
        return { data: null, error: error.message };
      }

      if (!data.user) {
        return { data: null, error: 'Authentication failed. User record not found.' };
      }

      const user: User = {
        id: data.user.id,
        email: data.user.email || email,
        created_at: data.user.created_at || new Date().toISOString(),
        updated_at: new Date().toISOString(),
      };

      return { data: { user, session: data.session }, error: null };
    } catch (err: any) {
      return { data: null, error: err.message || 'An unexpected error occurred during login.' };
    }
  },

  /**
   * Sign out current user.
   */
  async signOut(): Promise<AuthResponse<boolean>> {
    try {
      if (isSupabaseConfigured()) {
        const { error } = await supabase.auth.signOut();
        if (error) return { data: false, error: error.message };
      }
      return { data: true, error: null };
    } catch (err: any) {
      return { data: false, error: err.message || 'Failed to sign out.' };
    }
  },

  /**
   * Request password reset email.
   */
  async requestPasswordReset(email: string): Promise<AuthResponse<boolean>> {
    try {
      if (!isSupabaseConfigured()) {
        return { data: null, error: 'Supabase is not configured.' };
      }

      const { error } = await supabase.auth.resetPasswordForEmail(email.trim().toLowerCase(), {
        redirectTo: 'unidate://reset-password',
      });

      if (error) {
        return { data: false, error: error.message };
      }

      return { data: true, error: null };
    } catch (err: any) {
      return { data: false, error: err.message || 'Failed to send password reset email.' };
    }
  },

  /**
   * Update password for currently authenticated user (from reset password flow).
   */
  async updatePassword(newPassword: string): Promise<AuthResponse<boolean>> {
    try {
      if (!isSupabaseConfigured()) {
        return { data: null, error: 'Supabase is not configured.' };
      }

      const { error } = await supabase.auth.updateUser({
        password: newPassword,
      });

      if (error) {
        return { data: false, error: error.message };
      }

      return { data: true, error: null };
    } catch (err: any) {
      return { data: false, error: err.message || 'Failed to update password.' };
    }
  },

  /**
   * Get active session.
   */
  async getSession() {
    if (!isSupabaseConfigured()) return null;
    const { data } = await supabase.auth.getSession();
    return data.session;
  },

  /**
   * Get currently authenticated user.
   */
  async getCurrentUser(): Promise<User | null> {
    if (!isSupabaseConfigured()) return null;
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return null;
    return {
      id: user.id,
      email: user.email || '',
      created_at: user.created_at || new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };
  },
};

