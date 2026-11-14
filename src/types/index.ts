/**
 * UniDate — Core Types
 */

// ============ User & Auth ============
export interface User {
  id: string;
  email: string;
  phone?: string;
  created_at: string;
  updated_at: string;
}

export type VerificationStatus = 'not_submitted' | 'pending' | 'verified' | 'rejected' | 'resubmission_required';

export interface StudentProfile {
  id: string;
  user_id: string;
  display_name: string;
  date_of_birth: string;
  age: number;
  gender: 'male' | 'female' | 'non_binary' | 'prefer_not_to_say';
  bio: string;
  university_id: string;
  university_name: string;
  faculty: string;
  department: string;
  level: string;
  photos: ProfilePhoto[];
  interests: string[];
  campus_activities: string[];
  connection_intention: ConnectionIntention;
  verification_status: VerificationStatus;
  is_profile_complete: boolean;
  is_visible: boolean;
  created_at: string;
  updated_at: string;
}

export interface ProfilePhoto {
  id: string;
  url: string;
  is_primary: boolean;
  order: number;
}

export type ConnectionIntention =
  | 'serious_relationship'
  | 'dating'
  | 'friends_first'
  | 'distance_relationship'
  | 'homie';

// ============ University ============
export interface University {
  id: string;
  name: string;
  short_name: string;
  country: string;
  city: string;
  faculties: Faculty[];
}

export interface Faculty {
  id: string;
  name: string;
  departments: Department[];
}

export interface Department {
  id: string;
  name: string;
}

// ============ Verification ============
export interface VerificationSubmission {
  id: string;
  user_id: string;
  full_name: string;
  matric_number: string;
  faculty: string;
  department: string;
  level: string;
  student_id_document_url?: string;
  selfie_url?: string;
  status: VerificationStatus;
  review_notes?: string;
  submitted_at: string;
  reviewed_at?: string;
}

// ============ Discovery & Matching ============
export interface InterestItem {
  id: string;
  name: string;
  category: string;
  icon?: string;
  created_at: string;
}

export interface ProfileInterest {
  id: string;
  profile_id: string;
  interest_id: string;
  created_at: string;
}

export interface DiscoveryPreferences {
  age_range: [number, number];
  faculty_preference?: string;
  level_preference?: string;
  interests: string[];
  verified_only: boolean;
}

export interface Like {
  id: string;
  liker_id: string;
  liked_id: string;
  is_super_like: boolean;
  created_at: string;
}

export interface Match {
  id: string;
  user1_id: string;
  user2_id: string;
  matched_at: string;
  is_active: boolean;
  last_message?: Message;
  other_profile?: StudentProfile;
}

// ============ Messaging ============
export interface Conversation {
  id: string;
  match_id: string;
  other_user: {
    id: string;
    display_name: string;
    photo_url?: string;
    is_online: boolean;
  };
  last_message?: Message;
  unread_count: number;
  created_at: string;
  updated_at: string;
}

export interface Message {
  id: string;
  conversation_id: string;
  sender_id: string;
  content: string;
  message_type: 'text' | 'wave' | 'image';
  is_read: boolean;
  created_at: string;
}

// ============ Events ============
export interface CampusEvent {
  id: string;
  title: string;
  description: string;
  date: string;
  time: string;
  venue: string;
  organizer: string;
  image_url?: string;
  rsvp_count: number;
  is_rsvped: boolean;
  category: EventCategory;
  created_at: string;
}

export type EventCategory =
  | 'social'
  | 'academic'
  | 'sports'
  | 'cultural'
  | 'career'
  | 'other';

// ============ Safety ============
export interface Report {
  id: string;
  reporter_id: string;
  reported_user_id: string;
  reason: ReportReason;
  details?: string;
  status: 'submitted' | 'reviewing' | 'resolved' | 'dismissed';
  created_at: string;
}

export type ReportReason =
  | 'fake_profile'
  | 'inappropriate_content'
  | 'harassment'
  | 'spam'
  | 'underage'
  | 'other';

export interface BlockedUser {
  id: string;
  blocker_id: string;
  blocked_id: string;
  blocked_profile?: StudentProfile;
  created_at: string;
}

// ============ Notifications ============
export interface Notification {
  id: string;
  user_id: string;
  type: NotificationType;
  title: string;
  body: string;
  data?: Record<string, unknown>;
  is_read: boolean;
  created_at: string;
}

export type NotificationType =
  | 'match'
  | 'message'
  | 'like'
  | 'event'
  | 'verification'
  | 'system';

// ============ App State ============
export type OnboardingStep =
  | 'splash'
  | 'onboarding'
  | 'auth'
  | 'eligibility'
  | 'university'
  | 'verification'
  | 'profile_photos'
  | 'profile_about'
  | 'profile_interests'
  | 'profile_preferences'
  | 'profile_preview'
  | 'complete';

// ============ Interests List ============
export const INTERESTS = [
  'Music', 'Sports', 'Party', 'Reading', 'Movies', 'Prayer',
  'Food', 'Travel', 'Photography', 'Gaming', 'Art', 'Dance',
  'Cooking', 'Fitness', 'Fashion', 'Technology', 'Writing',
  'Volunteering', 'Anime', 'Coffee', 'Nature', 'Podcasts',
  'Coding', 'Meditation', 'Comedy', 'Theater', 'Singing',
] as const;

export const CONNECTION_INTENTIONS: { value: ConnectionIntention; label: string }[] = [
  { value: 'serious_relationship', label: 'Serious Relationship' },
  { value: 'dating', label: 'Dating' },
  { value: 'friends_first', label: 'Friends First' },
  { value: 'distance_relationship', label: 'Distance Relationship' },
  { value: 'homie', label: 'Homie' },
];

export const ACADEMIC_LEVELS = ['100', '200', '300', '400', '500', '600', '700', 'Postgraduate'] as const;

