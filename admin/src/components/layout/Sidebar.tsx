'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  LayoutDashboard,
  Users,
  GraduationCap,
  ShieldCheck,
  AlertTriangle,
  Heart,
  TrendingUp,
  UserCog,
  FileText,
  ChevronLeft,
  ChevronRight,
  LogOut,
  Sparkles,
} from 'lucide-react';
import { useAdminAuth } from '@/context/AuthContext';
import { formatRoleName, getRoleBadgeColor } from '@/lib/auth/rbac';

interface NavItem {
  name: string;
  href: string;
  icon: React.ComponentType<{ className?: string }>;
  roles?: string[];
  badgeKey?: string;
}

const NAV_ITEMS: NavItem[] = [
  {
    name: 'Dashboard',
    href: '/dashboard',
    icon: LayoutDashboard,
  },
  {
    name: 'Students',
    href: '/users',
    icon: Users,
  },
  {
    name: 'Verifications',
    href: '/verifications',
    icon: ShieldCheck,
  },
  {
    name: 'Reports & Safety',
    href: '/moderation',
    icon: AlertTriangle,
  },
  {
    name: 'Universities',
    href: '/universities',
    icon: GraduationCap,
    roles: ['super_admin'],
  },
  {
    name: 'Interests',
    href: '/interests',
    icon: Heart,
    roles: ['super_admin'],
  },
  {
    name: 'Analytics',
    href: '/analytics',
    icon: TrendingUp,
    roles: ['super_admin', 'moderator', 'university_admin'],
  },
  {
    name: 'Administrators',
    href: '/admins',
    icon: UserCog,
    roles: ['super_admin'],
  },
  {
    name: 'Audit Logs',
    href: '/audit-logs',
    icon: FileText,
    roles: ['super_admin'],
  },
];

export function Sidebar() {
  const pathname = usePathname();
  const { admin, signOut } = useAdminAuth();
  const [collapsed, setCollapsed] = useState(false);

  const filteredItems = NAV_ITEMS.filter((item) => {
    if (!item.roles) return true;
    if (!admin) return false;
    return item.roles.includes(admin.role);
  });

  return (
    <aside
      className={`relative flex flex-col border-r border-slate-800 bg-[#0B0F19] text-slate-200 transition-all duration-300 ${
        collapsed ? 'w-20' : 'w-64'
      }`}
    >
      {/* Brand Logo & Header */}
      <div className="flex h-16 items-center justify-between px-4 border-b border-slate-800/80">
        <Link href="/dashboard" className="flex items-center space-x-3 overflow-hidden">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-gradient-to-tr from-indigo-600 to-purple-600 shadow-md shadow-indigo-500/20">
            <Sparkles className="h-5 w-5 text-white" />
          </div>
          {!collapsed && (
            <div className="flex flex-col">
              <span className="font-bold text-lg tracking-tight bg-gradient-to-r from-white to-slate-300 bg-clip-text text-transparent">
                UniDate
              </span>
              <span className="text-[10px] uppercase font-semibold tracking-wider text-indigo-400">
                Admin Console
              </span>
            </div>
          )}
        </Link>
        <button
          onClick={() => setCollapsed(!collapsed)}
          className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-800/80 hover:text-slate-100 transition-colors"
          title={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
        >
          {collapsed ? <ChevronRight className="h-4 w-4" /> : <ChevronLeft className="h-4 w-4" />}
        </button>
      </div>

      {/* Navigation Links */}
      <nav className="flex-1 space-y-1.5 px-3 py-4 overflow-y-auto">
        {filteredItems.map((item) => {
          const isActive = pathname === item.href || pathname.startsWith(`${item.href}/`);
          const Icon = item.icon;

          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex items-center space-x-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-all ${
                isActive
                  ? 'bg-indigo-600 text-white shadow-sm shadow-indigo-600/30'
                  : 'text-slate-400 hover:bg-slate-800/60 hover:text-slate-100'
              }`}
              title={collapsed ? item.name : undefined}
            >
              <Icon className={`h-5 w-5 shrink-0 ${isActive ? 'text-white' : 'text-slate-400'}`} />
              {!collapsed && <span className="truncate">{item.name}</span>}
            </Link>
          );
        })}
      </nav>

      {/* Admin User Footer Card */}
      {admin && (
        <div className="border-t border-slate-800/80 p-3 bg-slate-900/40">
          {!collapsed ? (
            <div className="flex items-center justify-between">
              <div className="min-w-0 pr-2">
                <p className="truncate text-sm font-medium text-slate-200">
                  {admin.full_name || 'Admin'}
                </p>
                <span
                  className={`inline-block truncate rounded px-1.5 py-0.5 text-[10px] font-semibold border ${getRoleBadgeColor(
                    admin.role
                  )}`}
                >
                  {formatRoleName(admin.role)}
                </span>
              </div>
              <button
                onClick={() => signOut()}
                className="rounded-lg p-1.5 text-slate-400 hover:bg-red-500/10 hover:text-red-400 transition-colors"
                title="Sign out"
              >
                <LogOut className="h-4 w-4" />
              </button>
            </div>
          ) : (
            <div className="flex justify-center">
              <button
                onClick={() => signOut()}
                className="rounded-lg p-2 text-slate-400 hover:bg-red-500/10 hover:text-red-400 transition-colors"
                title="Sign out"
              >
                <LogOut className="h-5 w-5" />
              </button>
            </div>
          )}
        </div>
      )}
    </aside>
  );
}

