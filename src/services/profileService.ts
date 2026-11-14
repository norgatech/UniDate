/**
 * UniDate — Profile Service
 * Manages profile CRUD, photo uploads to Supabase Storage, and live discovery queries.
 */
import { supabase, isSupabaseConfigured } from '../lib/supabase';
import type { StudentProfile, ProfilePhoto } from '../types';

export const profileService = {
  /**
   * Fetch current authenticated user's profile.
   */
  async getCurrentProfile(): Promise<StudentProfile | null> {
    if (!isSupabaseConfigured()) return null;

    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return null;

      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .maybeSingle();

      if (error || !data) return null;

      return {
        id: data.id,
        user_id: data.id,
        display_name: data.display_name || '',
        date_of_birth: data.date_of_birth || '',
        age: data.age || 18,
        gender: data.gender || 'female',
        bio: data.bio || '',
        university_id: data.university_id || '',
        university_name: data.university_name || '',
        faculty: data.faculty || '',
        department: data.department || '',
        level: data.academic_level || data.level || '100',
        photos: Array.isArray(data.photos) ? data.photos : [],
        interests: Array.isArray(data.interests) ? data.interests : [],
        campus_activities: Array.isArray(data.campus_activities) ? data.campus_activities : [],
        connection_intention: data.connection_intention || 'serious_relationship',
        verification_status: data.verification_status || 'not_submitted',
        is_profile_complete: Boolean(data.is_profile_complete),
        is_visible: data.is_visible !== false,
        created_at: data.created_at || new Date().toISOString(),
        updated_at: data.updated_at || new Date().toISOString(),
      };
    } catch {
      return null;
    }
  },

  /**
   * Fetch a specific profile by ID.
   */
  async getProfileById(profileId: string): Promise<StudentProfile | null> {
    if (!isSupabaseConfigured() || !profileId) return null;

    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', profileId)
        .maybeSingle();

      if (error || !data) return null;

      return {
        id: data.id,
        user_id: data.id,
        display_name: data.display_name || '',
        date_of_birth: data.date_of_birth || '',
        age: data.age || 18,
        gender: data.gender || 'female',
        bio: data.bio || '',
        university_id: data.university_id || '',
        university_name: data.university_name || '',
        faculty: data.faculty || '',
        department: data.department || '',
        level: data.academic_level || data.level || '100',
        photos: Array.isArray(data.photos) ? data.photos : [],
        interests: Array.isArray(data.interests) ? data.interests : [],
        campus_activities: Array.isArray(data.campus_activities) ? data.campus_activities : [],
        connection_intention: data.connection_intention || 'serious_relationship',
        verification_status: data.verification_status || 'not_submitted',
        is_profile_complete: Boolean(data.is_profile_complete),
        is_visible: data.is_visible !== false,
        created_at: data.created_at || new Date().toISOString(),
        updated_at: data.updated_at || new Date().toISOString(),
      };
    } catch {
      return null;
    }
  },

  /**
   * Update current user's profile.
   */
  async updateProfile(updates: Partial<StudentProfile>): Promise<{ success: boolean; error?: string }> {
    if (!isSupabaseConfigured()) return { success: false, error: 'Supabase not configured' };

    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return { success: false, error: 'User not authenticated' };

      const payload: Record<string, any> = {
        updated_at: new Date().toISOString(),
      };

      if (updates.display_name !== undefined) payload.display_name = updates.display_name;
      if (updates.bio !== undefined) payload.bio = updates.bio;
      if (updates.university_id !== undefined) payload.university_id = updates.university_id;
      if (updates.university_name !== undefined) payload.university_name = updates.university_name;
      if (updates.faculty !== undefined) payload.faculty = updates.faculty;
      if (updates.department !== undefined) payload.department = updates.department;
      if (updates.level !== undefined) payload.academic_level = updates.level;
      if (updates.photos !== undefined) payload.photos = updates.photos;
      if (updates.interests !== undefined) payload.interests = updates.interests;
      if (updates.campus_activities !== undefined) payload.campus_activities = updates.campus_activities;
      if (updates.connection_intention !== undefined) payload.connection_intention = updates.connection_intention;
      if (updates.is_visible !== undefined) payload.is_visible = updates.is_visible;
      if (updates.is_profile_complete !== undefined) payload.is_profile_complete = updates.is_profile_complete;

      const { error } = await supabase
        .from('profiles')
        .update(payload)
        .eq('id', user.id);

      if (error) return { success: false, error: error.message };
      return { success: true };
    } catch (err: any) {
      return { success: false, error: err.message || 'Failed to update profile' };
    }
  },

  /**
   * Upload profile image to Supabase Storage 'profile-photos' bucket.
   */
  async uploadProfilePhoto(fileUri: string, isPrimary = false): Promise<{ url: string | null; error?: string }> {
    if (!isSupabaseConfigured()) return { url: null, error: 'Supabase not configured' };

    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return { url: null, error: 'User not authenticated' };

      // Generate a unique filename
      const fileExt = fileUri.split('.').pop()?.toLowerCase() || 'jpg';
      const fileName = `${user.id}/${Date.now()}_${Math.random().toString(36).substring(7)}.${fileExt}`;

      let blob: Blob;
      if (fileUri.startsWith('data:')) {
        const res = await fetch(fileUri);
        blob = await res.blob();
      } else {
        const response = await fetch(fileUri);
        blob = await response.blob();
      }

      const { error: uploadError } = await supabase.storage
        .from('profile-photos')
        .upload(fileName, blob, {
          contentType: `image/${fileExt === 'png' ? 'png' : 'jpeg'}`,
          upsert: true,
        });

      if (uploadError) {
        return { url: null, error: uploadError.message };
      }

      const { data: publicUrlData } = supabase.storage
        .from('profile-photos')
        .getPublicUrl(fileName);

      const publicUrl = publicUrlData.publicUrl;

      // Update user's photos array in profiles table
      const { data: profile } = await supabase
        .from('profiles')
        .select('photos')
        .eq('id', user.id)
        .single();

      const existingPhotos: ProfilePhoto[] = Array.isArray(profile?.photos) ? profile.photos : [];
      const newPhoto: ProfilePhoto = {
        id: 'photo_' + Date.now(),
        url: publicUrl,
        is_primary: isPrimary || existingPhotos.length === 0,
        order: existingPhotos.length,
      };

      const updatedPhotos = isPrimary
        ? [newPhoto, ...existingPhotos.map((p) => ({ ...p, is_primary: false }))]
        : [...existingPhotos, newPhoto];

      await supabase.from('profiles').update({ photos: updatedPhotos }).eq('id', user.id);

      return { url: publicUrl };
    } catch (err: any) {
      return { url: null, error: err.message || 'Failed to upload photo' };
    }
  },

  /**
   * Query discovery profiles from Supabase.
   */
  async getDiscoveryProfiles(options?: {
    faculty?: string;
    level?: string;
    verifiedOnly?: boolean;
    search?: string;
    limit?: number;
  }): Promise<StudentProfile[]> {
    if (!isSupabaseConfigured()) return [];

    try {
      const { data: { user } } = await supabase.auth.getUser();
      const currentUserId = user?.id;

      let query = supabase
        .from('profiles')
        .select('*')
        .eq('is_visible', true)
        .eq('is_profile_complete', true)
        .order('created_at', { ascending: false })
        .limit(options?.limit || 50);

      if (currentUserId) {
        query = query.neq('id', currentUserId);
      }

      if (options?.verifiedOnly) {
        query = query.eq('verification_status', 'verified');
      }

      if (options?.faculty && options.faculty !== 'All') {
        query = query.eq('faculty', options.faculty);
      }

      if (options?.level && options.level !== 'All') {
        query = query.eq('academic_level', options.level);
      }

      if (options?.search && options.search.trim()) {
        const term = `%${options.search.trim()}%`;
        query = query.or(`display_name.ilike.${term},faculty.ilike.${term},bio.ilike.${term}`);
      }

      const { data, error } = await query;
      if (error || !data) {
        console.warn('Error fetching discovery profiles:', error?.message);
        return [];
      }

      return data.map((d: any) => ({
        id: d.id,
        user_id: d.id,
        display_name: d.display_name || 'Anonymous Student',
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
    } catch (err) {
      console.warn('Exception in getDiscoveryProfiles:', err);
      return [];
    }
  },
};

