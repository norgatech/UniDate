/**
 * UniDate — University & Academic Catalog Service
 * Loads universities, faculties, departments, and interests directly from Supabase.
 */
import { supabase, isSupabaseConfigured } from '../lib/supabase';
import type { University, Faculty, Department, InterestItem } from '../types';

export const universityService = {
  /**
   * Fetch all universities or search by query.
   */
  async getUniversities(search?: string): Promise<University[]> {
    if (!isSupabaseConfigured()) return [];

    try {
      let query = supabase
        .from('universities')
        .select('id, name, short_name, country, city')
        .order('name', { ascending: true });

      if (search && search.trim()) {
        const term = `%${search.trim()}%`;
        query = query.or(`name.ilike.${term},short_name.ilike.${term},city.ilike.${term}`);
      }

      const { data, error } = await query;
      if (error || !data) {
        console.warn('Error fetching universities from Supabase:', error?.message);
        return [];
      }

      return data.map((u: any) => ({
        id: u.id,
        name: u.name,
        short_name: u.short_name || '',
        country: u.country || 'Ghana',
        city: u.city || '',
        faculties: [],
      }));
    } catch (err) {
      console.warn('Exception in getUniversities:', err);
      return [];
    }
  },

  /**
   * Fetch faculties belonging to a specific university.
   */
  async getFaculties(universityId: string): Promise<Faculty[]> {
    if (!isSupabaseConfigured() || !universityId) return [];

    try {
      const { data, error } = await supabase
        .from('faculties')
        .select('id, name')
        .eq('university_id', universityId)
        .order('name', { ascending: true });

      if (error || !data) {
        console.warn('Error fetching faculties:', error?.message);
        return [];
      }

      return data.map((f: any) => ({
        id: f.id,
        name: f.name,
        departments: [],
      }));
    } catch (err) {
      console.warn('Exception in getFaculties:', err);
      return [];
    }
  },

  /**
   * Fetch departments belonging to a specific faculty.
   */
  async getDepartments(facultyId: string): Promise<Department[]> {
    if (!isSupabaseConfigured() || !facultyId) return [];

    try {
      const { data, error } = await supabase
        .from('departments')
        .select('id, name')
        .eq('faculty_id', facultyId)
        .order('name', { ascending: true });

      if (error || !data) {
        console.warn('Error fetching departments:', error?.message);
        return [];
      }

      return data.map((d: any) => ({
        id: d.id,
        name: d.name,
      }));
    } catch (err) {
      console.warn('Exception in getDepartments:', err);
      return [];
    }
  },

  /**
   * Fetch system-wide interests catalog.
   */
  async getInterests(): Promise<InterestItem[]> {
    if (!isSupabaseConfigured()) return [];

    try {
      const { data, error } = await supabase
        .from('interests')
        .select('id, name, category, icon, created_at')
        .order('category', { ascending: true });

      if (error || !data) {
        console.warn('Error fetching interests:', error?.message);
        return [];
      }

      return data as InterestItem[];
    } catch (err) {
      console.warn('Exception in getInterests:', err);
      return [];
    }
  },

  /**
   * Fetch user's selected interests from profile_interests junction table.
   */
  async getUserInterests(profileId: string): Promise<InterestItem[]> {
    if (!isSupabaseConfigured() || !profileId) return [];

    try {
      const { data, error } = await supabase
        .from('profile_interests')
        .select('interest:interests(id, name, category, icon, created_at)')
        .eq('profile_id', profileId);

      if (error || !data) return [];
      return data.map((item: any) => item.interest).filter(Boolean);
    } catch {
      return [];
    }
  },

  /**
   * Replace user's interests in profile_interests junction table.
   */
  async saveUserInterests(profileId: string, interestIds: string[]): Promise<boolean> {
    if (!isSupabaseConfigured() || !profileId) return false;

    try {
      // Delete existing interests
      await supabase.from('profile_interests').delete().eq('profile_id', profileId);

      if (interestIds.length === 0) return true;

      const rows = interestIds.map((interest_id) => ({
        profile_id: profileId,
        interest_id,
      }));

      const { error } = await supabase.from('profile_interests').insert(rows);
      return !error;
    } catch {
      return false;
    }
  },
};

