/**
 * UniDate — User Safety & Moderation Service
 * Direct Supabase integration for blocking, unblocking, reporting, and safety enforcement.
 */
import { supabase, isSupabaseConfigured } from '../lib/supabase';
import type { BlockedUser } from '../types';

export const safetyService = {
  /**
   * Block a user.
   * Database trigger 'trg_handle_user_block' automatically deactivates matches and purges reciprocal likes.
   */
  async blockUser(targetUserId: string): Promise<{ success: boolean; error?: string }> {
    if (!isSupabaseConfigured()) return { success: false, error: 'Supabase not configured' };

    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return { success: false, error: 'User not authenticated' };
      if (user.id === targetUserId) return { success: false, error: 'Cannot block yourself' };

      const { error } = await supabase
        .from('blocked_users')
        .insert({
          blocker_id: user.id,
          blocked_id: targetUserId,
        });

      if (error && !error.message.includes('unique_block')) {
        return { success: false, error: error.message };
      }

      return { success: true };
    } catch (err: any) {
      return { success: false, error: err.message || 'Failed to block user' };
    }
  },

  /**
   * Unblock a previously blocked user.
   */
  async unblockUser(targetUserId: string): Promise<{ success: boolean; error?: string }> {
    if (!isSupabaseConfigured()) return { success: false, error: 'Supabase not configured' };

    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return { success: false, error: 'User not authenticated' };

      const { error } = await supabase
        .from('blocked_users')
        .delete()
        .eq('blocker_id', user.id)
        .eq('blocked_id', targetUserId);

      if (error) return { success: false, error: error.message };
      return { success: true };
    } catch (err: any) {
      return { success: false, error: err.message || 'Failed to unblock user' };
    }
  },

  /**
   * Get list of blocked users.
   */
  async getBlockedUsers(): Promise<BlockedUser[]> {
    if (!isSupabaseConfigured()) return [];

    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return [];

      const { data, error } = await supabase
        .from('blocked_users')
        .select(`
          id,
          blocker_id,
          blocked_id,
          created_at,
          blocked:profiles!blocked_id (
            id,
            display_name,
            photos
          )
        `)
        .eq('blocker_id', user.id)
        .order('created_at', { ascending: false });

      if (error || !data) return [];

      return data.map((b: any) => ({
        id: b.id,
        blocker_id: b.blocker_id,
        blocked_id: b.blocked_id,
        blocked_profile: b.blocked ? {
          id: b.blocked.id,
          user_id: b.blocked.id,
          display_name: b.blocked.display_name || 'Student',
          photos: Array.isArray(b.blocked.photos) ? b.blocked.photos : [],
        } as any : undefined,
        created_at: b.created_at,
      }));
    } catch {
      return [];
    }
  },

  /**
   * Submit an incident report against a user.
   */
  async reportUser(
    reportedUserId: string,
    reason: 'fake_profile' | 'harassment' | 'inappropriate_content' | 'underage' | 'spam' | 'other',
    details?: string
  ): Promise<{ success: boolean; error?: string }> {
    if (!isSupabaseConfigured()) return { success: false, error: 'Supabase not configured' };

    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return { success: false, error: 'User not authenticated' };
      if (user.id === reportedUserId) return { success: false, error: 'Cannot report yourself' };

      const { error } = await supabase
        .from('reports')
        .insert({
          reporter_id: user.id,
          reported_user_id: reportedUserId,
          reason,
          details: details?.trim() || null,
        });

      if (error) return { success: false, error: error.message };
      return { success: true };
    } catch (err: any) {
      return { success: false, error: err.message || 'Failed to submit report' };
    }
  },
};
