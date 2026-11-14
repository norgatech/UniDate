'use client';

import React from 'react';
import { usePathname } from 'next/navigation';
import { Bell, Search, Shield, Moon, Sun, User } from 'lucide-react';
import { useAdminAuth } from '@/context/AuthContext';
import { formatRoleName } from '@/lib/auth/rbac';

export function Header() {
  const pathname = usePathname();
  const { admin } = useAdminAuth();
  const [isDark, setIsDark] = React.useState(true);

  const getPageTitle = () => {
    if (pathname.startsWith('/dashboard')) return 'Dashboard Overview';
    if (pathname.startsWith('/users')) return 'Student Management';
    if (pathname.startsWith('/verifications')) return 'Student ID Verification';
    if (pathname.startsWith('/moderation')) return 'Reports & Safety Moderation';
    if (pathname.startsWith('/universities')) return 'University Directory';
    if (pathname.startsWith('/interests')) return 'Interests Catalog';
    if (pathname.startsWith('/analytics')) return 'Platform Analytics';
    if (pathname.startsWith('/admins')) return 'Administrator Management';
    if (pathname.startsWith('/audit-logs')) return 'Immutable Audit Logs';
    return 'Admin Console';
  };

  const toggleTheme = () => {
    setIsDark(!isDark);
    if (typeof document !== 'undefined') {
      document.documentElement.classList.toggle('light-theme');
    }
  };

  return (
    <header className="sticky top-0 z-20 flex h-16 w-full items-center justify-between border-b border-slate-800 bg-[#0B0F19]/90 px-6 backdrop-blur">
      {/* Page Title & Breadcrumbs */}
      <div className="flex items-center space-x-3">
        <h1 className="text-xl font-bold tracking-tight text-white">{getPageTitle()}</h1>
        {admin?.role === 'university_admin' && (
          <span className="rounded-full bg-cyan-500/10 border border-cyan-500/30 px-2.5 py-0.5 text-xs font-semibold text-cyan-400">
            Campus Scope
          </span>
        )}
      </div>

      {/* Right Controls */}
      <div className="flex items-center space-x-4">
        {/* Global Search Bar */}
        <div className="relative hidden md:block w-64">
          <Search className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
          <input
            type="text"
            placeholder="Search students, universities..."
            className="w-full rounded-lg border border-slate-800 bg-slate-900/80 py-1.5 pl-9 pr-4 text-sm text-slate-200 placeholder-slate-500 focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500 transition-colors"
          />
        </div>

        {/* Theme Toggle */}
        <button
          onClick={toggleTheme}
          className="rounded-lg p-2 text-slate-400 hover:bg-slate-800 hover:text-slate-200 transition-colors"
          title="Toggle theme"
        >
          {isDark ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
        </button>

        {/* Notification Bell */}
        <div className="relative">
          <button
            className="relative rounded-lg p-2 text-slate-400 hover:bg-slate-800 hover:text-slate-200 transition-colors"
            title="Notifications"
          >
            <Bell className="h-4 w-4" />
            <span className="absolute right-1.5 top-1.5 flex h-2 w-2">
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-indigo-400 opacity-75"></span>
              <span className="relative inline-flex h-2 w-2 rounded-full bg-indigo-500"></span>
            </span>
          </button>
        </div>

        {/* Admin Identity pill */}
        {admin && (
          <div className="flex items-center space-x-3 border-l border-slate-800 pl-4">
            <div className="flex h-9 w-9 items-center justify-center rounded-full bg-indigo-950 border border-indigo-500/40 text-indigo-300 font-semibold text-sm">
              {admin.full_name?.charAt(0) || <User className="h-4 w-4" />}
            </div>
            <div className="hidden lg:flex flex-col text-left">
              <span className="text-sm font-semibold text-slate-200 leading-tight">
                {admin.full_name}
              </span>
              <span className="text-[11px] text-slate-400">
                {formatRoleName(admin.role)}
              </span>
            </div>
          </div>
        )}
      </div>
    </header>
  );
}

