export type AdminRole = 
  | 'super_admin' 
  | 'moderator' 
  | 'verification_admin' 
  | 'support_admin' 
  | 'university_admin';

export interface AdminUser {
  id: string;
  email: string;
  full_name: string;
  role: AdminRole;
  assigned_university_id?: string | null;
  assigned_university_name?: string | null;
  is_active: boolean;
  created_at: string;
  last_login_at?: string | null;
}

export interface AdminAuditLog {
  id: string;
  admin_id: string;
  admin_email: string;
  action: string;
  target_table: string;
  target_id?: string | null;
  details: Record<string, any>;
  ip_address?: string | null;
  created_at: string;
}

export interface StudentProfile {
  id: string;
  full_name: string;
  email?: string;
  university_id?: string | null;
  university_name?: string;
  faculty_name?: string;
  department_name?: string;
  academic_level?: string;
  gender?: string;
  date_of_birth?: string;
  age?: number;
  avatar_url?: string | null;
  bio?: string | null;
  is_verified: boolean;
  verification_status: 'none' | 'pending' | 'verified' | 'rejected';
  is_suspended: boolean;
  suspension_reason?: string | null;
  suspended_at?: string | null;
  suspended_by?: string | null;
  created_at: string;
  interests?: string[];
}

export interface VerificationSubmission {
  id: string;
  user_id: string;
  student_name?: string;
  student_email?: string;
  university_name?: string;
  matric_number?: string;
  id_card_url: string;
  status: 'pending' | 'approved' | 'rejected';
  notes?: string | null;
  created_at: string;
  reviewed_at?: string | null;
  reviewed_by?: string | null;
}

export interface ModerationReport {
  id: string;
  reporter_id: string;
  reported_user_id: string;
  reporter_name?: string;
  reported_name?: string;
  reason: string;
  description?: string | null;
  status: 'pending' | 'investigating' | 'resolved' | 'dismissed';
  action_taken?: string | null;
  resolved_by?: string | null;
  resolved_at?: string | null;
  created_at: string;
}

export interface UniversityRecord {
  id: string;
  name: string;
  short_name?: string | null;
  country: string;
  state_province?: string | null;
  domain?: string | null;
  logo_url?: string | null;
  is_active: boolean;
  student_count?: number;
  faculties_count?: number;
}

export interface FacultyRecord {
  id: string;
  university_id: string;
  name: string;
  code?: string | null;
}

export interface DepartmentRecord {
  id: string;
  faculty_id: string;
  name: string;
  code?: string | null;
}

export interface InterestRecord {
  id: string;
  name: string;
  category: string;
  icon?: string | null;
  is_active: boolean;
  usage_count?: number;
}

export interface DashboardMetrics {
  totalStudents: number;
  activeToday: number;
  verifiedStudents: number;
  pendingVerifications: number;
  openReports: number;
  totalMatches: number;
  totalUniversities: number;
}

