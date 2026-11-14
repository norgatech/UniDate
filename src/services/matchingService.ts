/**
 * UniDate — Matching Service
 * Real database integration for Likes, Mutual Matches, and Match History.
 */
import { supabase, isSupabaseConfigured } from '../lib/supabase';
import type { Match, StudentProfile, Like } from '../types';

export interface SendLikeResult {
  success: boolean;
  isMatch: boolean;
  matchId?: string;
  conversationId?: string;
  error?: string;
}

export const matchingService = {
  /**
   * Send a like to a student profile.
   * Supabase trigger 'trg_mutual_like_match' automatically creates match and conversation if mutual.
   */
  async sendLike(targetUserId: string, isSuperLike = false): Promise<SendLikeResult> {
    if (!isSupabaseConfigured()) {
      return { success: false, isMatch: false, error: 'Supabase not configured' };
    }

    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return { success: false, isMatch: false, error: 'User not authenticated' };
      if (user.id === targetUserId) return { success: false, isMatch: false, error: 'Cannot like yourself' };

      // Insert like
      const { error: likeError } = await supabase
        .from('likes')
        .insert({
          liker_id: user.id,
          liked_id: targetUserId,
          is_super_like: isSuperLike,
        });

      if (likeError && !likeError.message.includes('unique_like')) {
        return { success: false, isMatch: false, error: likeError.message };
      }

      // Check if mutual match exists
      const u1 = user.id < targetUserId ? user.id : targetUserId;
      const u2 = user.id < targetUserId ? targetUserId : user.id;

      const { data: matchData } = await supabase
        .from('matches')
        .select('id, conversations(id)')
        .eq('user1_id', u1)
        .eq('user2_id', u2)
        .maybeSingle();

      if (matchData) {
        const conversationId = Array.isArray(matchData.conversations)
          ? matchData.conversations[0]?.id
          : (matchData.conversations as any)?.id;

        return {
          success: true,
          isMatch: true,
          matchId: matchData.id,
          conversationId,
        };
      }

      return { success: true, isMatch: false };
    } catch (err: any) {
      return { success: false, isMatch: false, error: err.message || 'Failed to send like' };
    }
  },

  /**
   * Get list of profile IDs current user has already liked.
   */
  async getSentLikedIds(): Promise<Set<string>> {
    if (!isSupabaseConfigured()) return new Set();

    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return new Set();

      const { data } = await supabase
        .from('likes')
        .select('liked_id')
        .eq('liker_id', user.id);

      if (!data) return new Set();
      return new Set(data.map((l: any) => l.liked_id));
    } catch {
      return new Set();
    }
  },

  /**
   * Fetch incoming likes (profiles who liked current user).
   */
  async getIncomingLikes(): Promise<StudentProfile[]> {
    if (!isSupabaseConfigured()) return [];

    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return [];

      const { data: likes, error } = await supabase
        .from('likes')
        .select('liker_id, created_at')
        .eq('liked_id', user.id)
        .order('created_at', { ascending: false });

      if (error || !likes || likes.length === 0) return [];

      const likerIds = likes.map((l: any) => l.liker_id);

      // Fetch profiles of likers
      const { data: profiles, error: pError } = await supabase
        .from('profiles')
        .select('*')
        .in('id', likerIds)
        .eq('is_visible', true);

      if (pError || !profiles) return [];

      return profiles.map((d: any) => ({
        id: d.id,
        user_id: d.id,
        display_name: d.display_name || 'Student',
        date_of_birth: d.date_of_birth || '',
        age: d.age || 18,
        gender: d.gender || 'female',
        bio: d.bio || '',
        university_id: d.university_id || '',
        university_name: d.university_name || '',
        faculty: d.faculty || '',
        department: d.department || '',
        level: d.academic_level || d.level || '100',
        photos: Array.isArray(d.photos) ? d.photos : [],
        interests: Array.isArray(d.interests) ? d.interests : [],
        campus_activities: Array.isArray(d.campus_activities) ? d.campus_activities : [],
        connection_intention: d.connection_intention || 'dating',
        verification_status: d.verification_status || 'not_submitted',
        is_profile_complete: Boolean(d.is_profile_complete),
        is_visible: d.is_visible !== false,
        created_at: d.created_at || new Date().toISOString(),
        updated_at: d.updated_at || new Date().toISOString(),
      }));
    } catch {
      return [];
    }
  },

  /**
   * Fetch active matches for current user.
   */
  async getMatches(): Promise<Match[]> {
    if (!isSupabaseConfigured()) return [];

    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return [];

      const { data: matchesData, error } = await supabase
        .from('matches')
        .select('id, user1_id, user2_id, matched_at, is_active')
        .or(`user1_id.eq.${user.id},user2_id.eq.${user.id}`)
        .eq('is_active', true)
        .order('matched_at', { ascending: false });

      if (error || !matchesData || matchesData.length === 0) return [];

      const otherUserIds = matchesData.map((m: any) =>
        m.user1_id === user.id ? m.user2_id : m.user1_id
      );

      // Fetch profiles
      const { data: profiles } = await supabase
        .from('profiles')
        .select('*')
        .in('id', otherUserIds);

      const profileMap = new Map((profiles || []).map((p: any) => [p.id, p]));

      return matchesData.map((m: any) => {
        const otherId = m.user1_id === user.id ? m.user2_id : m.user1_id;
        const d = profileMap.get(otherId);

        const otherProfile: StudentProfile | undefined = d
          ? {
              id: d.id,
              user_id: d.id,
              display_name: d.display_name || 'Student',
              date_of_birth: d.date_of_birth || '',
              age: d.age || 18,
              gender: d.gender || 'female',
              bio: d.bio || '',
              university_id: d.university_id || '',
              university_name: d.university_name || '',
              faculty: d.faculty || '',
              department: d.department || '',
              level: d.academic_level || d.level || '100',
              photos: Array.isArray(d.photos) ? d.photos : [],
              interests: Array.isArray(d.interests) ? d.interests : [],
              campus_activities: Array.isArray(d.campus_activities) ? d.campus_activities : [],
              connection_intention: d.connection_intention || 'dating',
              verification_status: d.verification_status || 'not_submitted',
              is_profile_complete: Boolean(d.is_profile_complete),
              is_visible: d.is_visible !== false,
              created_at: d.created_at || new Date().toISOString(),
              updated_at: d.updated_at || new Date().toISOString(),
            }
          : undefined;

        return {
          id: m.id,
          user1_id: m.user1_id,
          user2_id: m.user2_id,
          matched_at: m.matched_at,
          is_active: m.is_active,
          other_profile: otherProfile,
        };
      });
    } catch {
      return [];
    }
  },
};

