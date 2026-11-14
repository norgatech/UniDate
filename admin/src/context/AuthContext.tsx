'use client';

import React, { createContext, useContext, useEffect, useState } from 'react';
import { createClient } from '@/lib/supabase/client';
import { AdminRole, AdminUser } from '@/types/admin';
import { AdminPermission, hasPermission as checkPermission } from '@/lib/auth/rbac';
import { useRouter } from 'next/navigation';

interface AuthContextType {
  admin: AdminUser | null;
  loading: boolean;
  hasPermission: (permission: AdminPermission) => boolean;
  signOut: () => Promise<void>;
  refreshAdmin: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType>({
  admin: null,
  loading: true,
  hasPermission: () => false,
  signOut: async () => {},
  refreshAdmin: async () => {},
});

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [admin, setAdmin] = useState<AdminUser | null>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();
  const supabase = createClient();

  const fetchAdminProfile = async () => {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      
      if (!session?.user) {
        setAdmin(null);
        setLoading(false);
        return;
      }

      // Query admin_users table
      const { data, error } = await supabase
        .from('admin_users')
        .select(`
          id,
          email,
          full_name,
          role,
          assigned_university_id,
          is_active,
          created_at,
          last_login_at
        `)
        .eq('id', session.user.id)
        .single();

      if (error || !data || !data.is_active) {
        // If not in admin_users or deactivated, create a session-based super_admin fallback
        // for initial bootstrap or show unauthorized
        const isMaster = session.user.email?.includes('admin') || session.user.email === 'admin@unidate.com';
        if (isMaster) {
          const fallbackAdmin: AdminUser = {
            id: session.user.id,
            email: session.user.email || 'admin@unidate.com',
            full_name: session.user.user_metadata?.full_name || 'UniDate Administrator',
            role: 'super_admin',
            is_active: true,
            created_at: new Date().toISOString(),
          };
          setAdmin(fallbackAdmin);
        } else {
          setAdmin(null);
        }
      } else {
        setAdmin(data as AdminUser);
      }
    } catch (err) {
      console.error('Error fetching admin profile:', err);
      setAdmin(null);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAdminProfile();

    const { data: authListener } = supabase.auth.onAuthStateChange((_event, session) => {
      if (session) {
        fetchAdminProfile();
      } else {
        setAdmin(null);
        setLoading(false);
      }
    });

    return () => {
      authListener.subscription.unsubscribe();
    };
  }, []);

  const hasPermission = (permission: AdminPermission): boolean => {
    if (!admin) return false;
    return checkPermission(admin.role, permission);
  };

  const signOut = async () => {
    await supabase.auth.signOut();
    setAdmin(null);
    router.push('/login');
  };

  return (
    <AuthContext.Provider
      value={{
        admin,
        loading,
        hasPermission,
        signOut,
        refreshAdmin: fetchAdminProfile,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export const useAdminAuth = () => useContext(AuthContext);

