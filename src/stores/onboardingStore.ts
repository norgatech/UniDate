/**
 * UniDate — Onboarding Store (Zustand + AsyncStorage Persistence)
 * Manages full multi-step student onboarding state, progress, validation,
 * and seamless resumption across app restarts.
 */
import { create } from 'zustand';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { supabase, isSupabaseConfigured } from '../lib/supabase';
import type { StudentProfile, VerificationStatus, ConnectionIntention } from '../types';

const ONBOARDING_STORAGE_KEY = '@unidate_onboarding_draft_v2';

const UUID_REGEX = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
export const isValidUuid = (val?: string | null): boolean => Boolean(val && UUID_REGEX.test(val));

export const MOCK_TO_UUID_MAP: Record<string, string> = {
  'uni-1': '97d63bbb-1083-5226-a62c-59d35feb6e2e',
  'uni-2': '2fb705c6-1280-5446-9ec9-0ddb0f77fa80',
  'uni-3': 'c8a9c195-5c0a-5a9d-8f7e-cd363649d921',
  'uni-4': 'd48a224a-17f7-5028-912f-c1c772371802',
  'uni-5': 'a5e25e48-f884-528d-b93a-7d8e8122d6da',
  'uni-6': '14af09f0-4f92-5365-9c90-d2dd81ad9401',
  'uni-7': 'df02b152-21ab-5c64-b6eb-9118581c4733',
  'uni-8': '948141eb-4882-5384-b412-8301904b1210',
  'uni-9': '631000eb-e65a-5638-a4b1-524699f92014',
  'uni-10': '7bd04ec7-257c-5b34-8df2-8ae6e7c5d183',
  'uni-11': '57a2ca4b-965b-5bfd-a572-d8d62f1319a1',
  'uni-12': 'fc4b0327-8d2f-59a3-8ebb-2073d0ee93de',
  'uni-13': '75c57b96-17e2-5034-9696-df8becab84f6',
  'uni-14': 'a1520d54-f7ba-51c5-a240-5f971a44ef9a',
  'uni-15': 'e54190a8-70cb-531f-b85b-20335c9188f1',
  'uni-16': 'efaa43a4-03b8-5330-a6a3-bd8f0399eda2',
  'uni-17': 'b9a09c19-4a54-53c4-b718-29d2fae0bd08',
  'uni-18': '00a3134e-8475-58fc-aeeb-daf1ecb84ae5',
  'uni-19': 'edfce267-0cc9-5f1e-85eb-3492fea6096a',
  'uni-20': '22763240-7c0a-55c5-ae12-20a87674bee2',
  'uni-21': 'df7d375a-b0f4-5137-beaf-eab89457a216',
  'uni-22': '02a79d2e-5301-5b58-b1c5-1348bf4eb0f4',
  'uni-23': '63a4cec4-0e9a-52fe-aa51-62571259eb90',
  'uni-24': '25981cd4-682d-5f72-9e2a-d4ea638c6594',
  'uni-25': '9986e39b-a6b0-56cf-9995-16b3392e38d6',
  'uni-26': '341bb482-9d05-54ef-9fa3-fcb2d50101d8',
  'uni-27': 'de91fcb9-b4c5-58bd-8961-5ed14d7a44a9',
  'uni-28': 'fbd7cecc-9f12-5e68-8894-f9f77376f56f',
  'uni-29': 'e27967cb-fa81-53ab-a847-2c8031a10223',
  'uni-30': 'fc62fb7a-2848-5af3-952a-065f8eeda963',
  'uni-31': 'b8d65a29-e004-5ff7-b3f9-dc83706ea126',
  'uni-32': '9f4cc0a7-d792-5f08-9a69-bec7e436543a',
  'uni-33': '75939c1b-1b40-5544-853d-7fa378e6d25b',
  'uni-34': 'cbfee4c2-e542-5e47-9f13-10cf35f8749e',
  'uni-35': 'af213822-c78e-57df-9b25-da8d8b99ffa3',
  'uni-36': '52d586e7-1f82-52fd-a2e0-1726a01c4273',
  'uni-37': '9409c773-6415-5b9d-99f8-dd35e5c775e0',
  'uni-38': 'acc832b8-45ca-50e5-bb6d-bb714a488f8f',
  'uni-39': 'f286cc1a-2fcc-5f5b-9c28-0c462011f56a',
  'uni-40': '3524bbc1-42b4-58f9-8ee2-beed8bec226c',
  'uni-41': '677bfd25-3f56-522b-9c12-7feb2c656fe4',
  'uni-42': 'cec993cd-4783-58ff-af29-70e52e4203a1',
  'uni-43': '4ba353a4-dcfd-5443-97cb-61708925612b',
  'uni-44': '00992376-328f-573f-8a8b-ba67efbbea67',
  'uni-45': 'be3c740b-8dae-5da0-81d2-4183b30d7a2b',
  'uni-46': 'b2c8d94c-f63d-5e08-9d74-081c029212f2',
  'uni-47': '7fc84476-84bd-52be-8bb0-13f594912bde',
  'uni-48': '9031e698-a540-5d0b-9831-e0c9b4207d9f',
  'uni-49': '7eebc9be-24ce-58b2-aea7-fe0a051839e3',
  'uni-50': '00e268cf-9fbd-5741-9503-0e18015ca234',
};

export const resolveUniversityUuid = async (
  uniId?: string | null,
  uniName?: string | null,
  uniShortName?: string | null
): Promise<string | null> => {
  if (uniId && isValidUuid(uniId)) return uniId;
  if (uniId && MOCK_TO_UUID_MAP[uniId]) return MOCK_TO_UUID_MAP[uniId];

  // Lookup in Supabase by name or short name
  if (isSupabaseConfigured() && (uniName || uniShortName)) {
    try {
      const term = uniShortName || uniName;
      if (term) {
        const { data } = await supabase
          .from('universities')
          .select('id')
          .or(`short_name.ilike.%${term}%,name.ilike.%${term}%`)
          .limit(1)
          .maybeSingle();

        if (data?.id && isValidUuid(data.id)) {
          return data.id;
        }
      }
    } catch {
      // ignore
    }
  }

  return null;
};

export interface OnboardingData {
  // Screen 1: Personal Information
  fullName: string;
  displayName: string;
  dateOfBirth: string; // YYYY-MM-DD
  age: number;
  gender: 'male' | 'female' | 'non_binary' | 'prefer_not_to_say';

  // Screen 2: University Selection
  universityId: string;
  universityName: string;
  universityShortName: string;
  universityCity: string;

  // Screen 3: Academic Information
  facultyId: string;
  facultyName: string;
  departmentId: string;
  departmentName: string;
  level: string; // 100, 200, etc.
  courseProgramme: string;

  // Screen 4: Profile Photo
  primaryPhotoUrl: string;
  additionalPhotos: string[];

  // Screen 5: Interests and Hobbies
  interests: string[];
  interestIds: string[];

  // Screen 6: Personal Bio
  bio: string;
  favouriteActivities: string;
  connectionIntention: ConnectionIntention;

  // Screen 7: Student Verification
  matricNumber: string;
  studentIdDocumentUrl: string;
  selfieUrl: string;
  verificationStatus: VerificationStatus;

  // Metadata
  currentStep: number;
  completedSteps: number[];
  isComplete: boolean;
}

const INITIAL_ONBOARDING_DATA: OnboardingData = {
  fullName: '',
  displayName: '',
  dateOfBirth: '',
  age: 0,
  gender: 'female',

  universityId: '',
  universityName: '',
  universityShortName: '',
  universityCity: '',

  facultyId: '',
  facultyName: '',
  departmentId: '',
  departmentName: '',
  level: '200',
  courseProgramme: '',

  primaryPhotoUrl: '',
  additionalPhotos: [],

  interests: [],
  interestIds: [],

  bio: '',
  favouriteActivities: '',
  connectionIntention: 'serious_relationship',

  matricNumber: '',
  studentIdDocumentUrl: '',
  selfieUrl: '',
  verificationStatus: 'not_submitted',

  currentStep: 1,
  completedSteps: [],
  isComplete: false,
};

interface OnboardingStore extends OnboardingData {
  // Actions
  updateData: (fields: Partial<OnboardingData>) => void;
  markStepComplete: (step: number) => void;
  loadSavedDraft: (userId?: string) => Promise<void>;
  saveDraft: (userId?: string) => Promise<void>;
  resetOnboarding: () => Promise<void>;
  saveFinalProfileToSupabase: (userId: string) => Promise<{ success: boolean; error?: string }>;
}

export const useOnboardingStore = create<OnboardingStore>((set, get) => ({
  ...INITIAL_ONBOARDING_DATA,

  updateData: (fields) => {
    set((state) => {
      const updated = { ...state, ...fields };
      // Fire-and-forget background persist to AsyncStorage
      AsyncStorage.setItem(ONBOARDING_STORAGE_KEY, JSON.stringify(updated)).catch(() => { });
      return updated;
    });
  },

  markStepComplete: (step) => {
    set((state) => {
      const completedSteps = state.completedSteps.includes(step)
        ? state.completedSteps
        : [...state.completedSteps, step];
      const next = { ...state, completedSteps, currentStep: Math.max(state.currentStep, step + 1) };
      AsyncStorage.setItem(ONBOARDING_STORAGE_KEY, JSON.stringify(next)).catch(() => { });
      return next;
    });
  },

  loadSavedDraft: async (userId) => {
    try {
      // 1. Try local AsyncStorage draft first
      const stored = await AsyncStorage.getItem(ONBOARDING_STORAGE_KEY);
      if (stored) {
        const parsed = JSON.parse(stored);
        if (parsed.universityId && MOCK_TO_UUID_MAP[parsed.universityId]) {
          parsed.universityId = MOCK_TO_UUID_MAP[parsed.universityId];
        }
        set((state) => ({ ...state, ...parsed }));
      }

      // 2. If authenticated and Supabase configured, load remote profile progress
      if (isSupabaseConfigured() && userId && !userId.startsWith('usr_')) {
        const { data: profile } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', userId)
          .maybeSingle();

        if (profile) {
          set((state) => ({
            ...state,
            displayName: profile.display_name || state.displayName,
            dateOfBirth: profile.date_of_birth || state.dateOfBirth,
            age: profile.age || state.age,
            gender: profile.gender || state.gender,
            bio: profile.bio || state.bio,
            universityId: profile.university_id || state.universityId,
            universityName: profile.university_name || state.universityName,
            facultyName: profile.faculty || state.facultyName,
            departmentName: profile.department || state.departmentName,
            level: profile.academic_level || state.level,
            interests: profile.interests || state.interests,
            connectionIntention: profile.connection_intention || state.connectionIntention,
            verificationStatus: profile.verification_status || state.verificationStatus,
            primaryPhotoUrl: profile.photos?.[0]?.url || state.primaryPhotoUrl,
            additionalPhotos: profile.photos?.slice(1).map((p: any) => p.url) || state.additionalPhotos,
            isComplete: Boolean(profile.is_profile_complete),
          }));
        }

        // Also check if they have a verification submission
        const { data: submission } = await supabase
          .from('verification_submissions')
          .select('*')
          .eq('user_id', userId)
          .order('submitted_at', { ascending: false })
          .limit(1)
          .maybeSingle();

        if (submission) {
          set((state) => ({
            ...state,
            matricNumber: submission.matric_number || state.matricNumber,
            studentIdDocumentUrl: submission.student_id_document_url || state.studentIdDocumentUrl,
            selfieUrl: submission.selfie_url || state.selfieUrl,
            verificationStatus: submission.status || state.verificationStatus,
          }));
        }
      }
    } catch (e) {
      console.warn('[OnboardingStore] loadSavedDraft warning:', e);
    }
  },

  saveDraft: async (userId) => {
    const state = get();
    try {
      await AsyncStorage.setItem(ONBOARDING_STORAGE_KEY, JSON.stringify(state));

      // If user is authenticated, save partial draft to Supabase profiles
      if (isSupabaseConfigured() && userId && !userId.startsWith('usr_') && state.displayName && state.dateOfBirth) {
        const validDraftUniId = await resolveUniversityUuid(
          state.universityId,
          state.universityName,
          state.universityShortName
        );

        const photosPayload = [
          ...(state.primaryPhotoUrl ? [{ id: 'p1', url: state.primaryPhotoUrl, is_primary: true, order: 0 }] : []),
          ...state.additionalPhotos.map((url, i) => ({ id: `p${i + 2}`, url, is_primary: false, order: i + 1 })),
        ];

        await supabase.from('profiles').upsert({
          id: userId,
          display_name: state.displayName,
          date_of_birth: state.dateOfBirth,
          gender: state.gender,
          bio: state.bio,
          university_id: validDraftUniId,
          university_name: state.universityName || null,
          faculty: state.facultyName || null,
          department: state.departmentName || null,
          academic_level: state.level || null,
          photos: photosPayload,
          interests: state.interests,
          campus_activities: state.favouriteActivities ? [state.favouriteActivities] : [],
          connection_intention: state.connectionIntention,
          is_profile_complete: false,
          is_visible: false, // Hidden until full completion
        });
      }
    } catch (e) {
      console.warn('[OnboardingStore] saveDraft warning:', e);
    }
  },

  resetOnboarding: async () => {
    await AsyncStorage.removeItem(ONBOARDING_STORAGE_KEY).catch(() => { });
    set({ ...INITIAL_ONBOARDING_DATA });
  },

  saveFinalProfileToSupabase: async (userId: string) => {
    const s = get();
    try {
      if (!isSupabaseConfigured() || userId.startsWith('usr_')) {
        // Dev fallback simulation
        set({ isComplete: true });
        return { success: true };
      }

      const validUniversityId = await resolveUniversityUuid(
        s.universityId,
        s.universityName,
        s.universityShortName
      );

      // If validUniversityId was resolved, update local state as well
      if (validUniversityId && validUniversityId !== s.universityId) {
        set({ universityId: validUniversityId });
      }

      // Build photos JSON
      const photosPayload = [
        ...(s.primaryPhotoUrl ? [{ id: 'p1', url: s.primaryPhotoUrl, is_primary: true, order: 0 }] : []),
        ...s.additionalPhotos.map((url, i) => ({ id: `p${i + 2}`, url, is_primary: false, order: i + 1 })),
      ];

      // 1. Upsert profile — notice verification_status is NOT modified by client (trigger protects it)
      const { error: profileError } = await supabase.from('profiles').upsert({
        id: userId,
        display_name: s.displayName.trim(),
        date_of_birth: s.dateOfBirth,
        gender: s.gender,
        bio: s.bio.trim(),
        university_id: validUniversityId,
        university_name: s.universityName || null,
        faculty: s.facultyName || null,
        department: s.departmentName || null,
        academic_level: s.level || '100',
        photos: photosPayload,
        interests: s.interests,
        campus_activities: s.favouriteActivities ? [s.favouriteActivities.trim()] : [],
        connection_intention: s.connectionIntention,
        is_profile_complete: true,
        is_visible: true,
      });

      if (profileError) {
        return { success: false, error: profileError.message };
      }

      // 2. Save profile_interests relationships (only valid UUIDs)
      let validInterestIds: string[] = (s.interestIds || []).filter((id) => isValidUuid(id));

      if (validInterestIds.length === 0 && s.interests && s.interests.length > 0) {
        try {
          const { data: dbInterests } = await supabase
            .from('interests')
            .select('id, name')
            .in('name', s.interests);

          if (dbInterests && dbInterests.length > 0) {
            validInterestIds = dbInterests
              .map((row: any) => row.id)
              .filter((id: string) => isValidUuid(id));
          }
        } catch {
          // ignore
        }
      }

      if (validInterestIds.length > 0) {
        // Clean existing profile_interests
        await supabase.from('profile_interests').delete().eq('profile_id', userId);

        const rows = validInterestIds.map((intId) => ({
          profile_id: userId,
          interest_id: intId,
        }));
        await supabase.from('profile_interests').insert(rows);
      }

      // 3. Save student verification submission if student ID or matric number provided
      if (s.matricNumber.trim() || s.studentIdDocumentUrl) {
        await supabase.from('verification_submissions').insert({
          user_id: userId,
          full_name: s.fullName.trim() || s.displayName.trim(),
          matric_number: s.matricNumber.trim() || 'NOT_PROVIDED',
          faculty: s.facultyName || 'General',
          department: s.departmentName || 'General',
          academic_level: s.level || '100',
          student_id_document_url: s.studentIdDocumentUrl || null,
          selfie_url: s.selfieUrl || null,
          status: 'pending',
        });
      }

      set({ isComplete: true });
      return { success: true };
    } catch (err: any) {
      return { success: false, error: err.message || 'Failed to save final profile.' };
    }
  },
}));

