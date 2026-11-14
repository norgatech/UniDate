'use client';

import React, { useEffect } from 'react';
import { useAdminAuth } from '@/context/AuthContext';
import { usePathname, useRouter } from 'next/navigation';
import { canAccessModule } from '@/lib/auth/rbac';
import { ShieldAlert, Loader2 } from 'lucide-react';
import Link from 'next/link';

export function AdminGuard({ children }: { children: React.ReactNode }) {
  const { admin, loading } = useAdminAuth();
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    if (!loading && !admin && pathname !== '/login') {
      router.push('/login');
    }
  }, [admin, loading, pathname, router]);

  if (loading) {
    return (
      <div className="flex min-h-screen w-full items-center justify-center bg-[#0B0F19]">
        <div className="flex flex-col items-center space-y-4">
          <Loader2 className="h-10 w-10 animate-spin text-indigo-500" />
          <p className="text-sm font-medium text-slate-400">Verifying administrative credentials...</p>
        </div>
      </div>
    );
  }

  if (!admin && pathname !== '/login') {
    return null; // Will redirect in useEffect
  }

  // Check RBAC permission for route
  if (admin && !canAccessModule(admin.role, pathname)) {
    return (
      <div className="flex min-h-[70vh] flex-col items-center justify-center px-4 text-center">
        <div className="rounded-full bg-red-500/10 p-4 border border-red-500/20 text-red-400 mb-4">
          <ShieldAlert className="h-10 w-10" />
        </div>
        <h2 className="text-xl font-bold text-white mb-2">Access Restricted</h2>
        <p className="text-slate-400 max-w-md text-sm mb-6">
          Your role ({admin.role}) does not have permission to access this module. Please contact a Super Administrator if you require elevated privileges.
        </p>
        <Link
          href="/dashboard"
          className="rounded-lg bg-indigo-600 px-4 py-2 text-sm font-medium text-white hover:bg-indigo-500 transition-colors"
        >
          Return to Dashboard
        </Link>
      </div>
    );
  }

  return <>{children}</>;
}

