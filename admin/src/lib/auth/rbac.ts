import { AdminRole, AdminUser } from '@/types/admin';

export type AdminPermission =
  | 'manage_admins'
  | 'view_audit_logs'
  | 'manage_universities'
  | 'manage_interests'
  | 'view_users'
  | 'suspend_users'
  | 'view_verifications'
  | 'review_verifications'
  | 'view_reports'
  | 'resolve_reports'
  | 'view_analytics';

export const ROLE_PERMISSIONS: Record<AdminRole, AdminPermission[]> = {
  super_admin: [
    'manage_admins',
    'view_audit_logs',
    'manage_universities',
    'manage_interests',
    'view_users',
    'suspend_users',
    'view_verifications',
    'review_verifications',
    'view_reports',
    'resolve_reports',
    'view_analytics',
  ],
  moderator: [
    'view_users',
    'suspend_users',
    'view_reports',
    'resolve_reports',
    'view_verifications',
    'view_analytics',
  ],
  verification_admin: [
    'view_users',
    'view_verifications',
    'review_verifications',
  ],
  support_admin: [
    'view_users',
    'view_reports',
    'view_verifications',
  ],
  university_admin: [
    'view_users',
    'view_verifications',
    'review_verifications',
    'view_analytics',
  ],
};

export function hasPermission(role: AdminRole, permission: AdminPermission): boolean {
  const permissions = ROLE_PERMISSIONS[role] || [];
  return permissions.includes(permission);
}

export function canAccessModule(role: AdminRole, path: string): boolean {
  if (role === 'super_admin') return true;

  if (path.startsWith('/admins') || path.startsWith('/audit-logs')) {
    return false;
  }

  if (path.startsWith('/universities') || path.startsWith('/interests')) {
    return false;
  }

  if (path.startsWith('/moderation')) {
    return role === 'moderator' || role === 'support_admin';
  }

  if (path.startsWith('/verifications')) {
    return role === 'verification_admin' || role === 'moderator' || role === 'university_admin';
  }

  if (path.startsWith('/users')) {
    return true; // All admins have user directory access (scoped if university_admin)
  }

  if (path.startsWith('/analytics')) {
    return role === 'moderator' || role === 'university_admin';
  }

  return true;
}

export function getRoleBadgeColor(role: AdminRole): string {
  switch (role) {
    case 'super_admin':
      return 'bg-purple-500/10 text-purple-400 border-purple-500/30';
    case 'moderator':
      return 'bg-amber-500/10 text-amber-400 border-amber-500/30';
    case 'verification_admin':
      return 'bg-blue-500/10 text-blue-400 border-blue-500/30';
    case 'support_admin':
      return 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30';
    case 'university_admin':
      return 'bg-cyan-500/10 text-cyan-400 border-cyan-500/30';
    default:
      return 'bg-slate-500/10 text-slate-400 border-slate-500/30';
  }
}

export function formatRoleName(role: AdminRole): string {
  switch (role) {
    case 'super_admin':
      return 'Super Administrator';
    case 'moderator':
      return 'Community Moderator';
    case 'verification_admin':
      return 'Verification Specialist';
    case 'support_admin':
      return 'Support Representative';
    case 'university_admin':
      return 'Campus Administrator';
    default:
      return role;
  }
}
