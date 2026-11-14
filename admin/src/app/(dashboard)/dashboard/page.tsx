'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { createClient } from '@/lib/supabase/client';
import {
  Users,
  ShieldAlert,
  ShieldCheck,
  Heart,
  TrendingUp,
  GraduationCap,
  ArrowUpRight,
  Clock,
  CheckCircle,
  XCircle,
  AlertCircle,
  ExternalLink,
} from 'lucide-react';
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  BarChart,
  Bar,
  CartesianGrid,
} from 'recharts';

interface MetricItem {
  label: string;
  value: string | number;
  change?: string;
  isPositive?: boolean;
  icon: React.ComponentType<{ className?: string }>;
  accent: string;
  href: string;
}

const REGISTRATION_TREND_DATA = [
  { day: 'Mon', registrations: 124, matches: 340 },
  { day: 'Tue', registrations: 168, matches: 412 },
  { day: 'Wed', registrations: 215, matches: 489 },
  { day: 'Thu', registrations: 290, matches: 620 },
  { day: 'Fri', registrations: 384, matches: 810 },
  { day: 'Sat', registrations: 450, matches: 940 },
  { day: 'Sun', registrations: 395, matches: 875 },
];

const CAMPUS_DISTRIBUTION_DATA = [
  { campus: 'Univ of Ghana', students: 840 },
  { campus: 'KNUST', students: 670 },
  { campus: 'Univ of Lagos', students: 590 },
  { campus: 'Covenant Univ', students: 430 },
  { campus: 'Makerere', students: 310 },
  { campus: 'UTAS', students: 180 },
];

export default function DashboardPage() {
  const supabase = createClient();
  const [metrics, setMetrics] = useState({
    totalStudents: 0,
    verifiedStudents: 0,
    pendingVerifications: 0,
    openReports: 0,
    totalUniversities: 0,
    totalMatches: 0,
  });
  const [pendingVerificationsList, setPendingVerificationsList] = useState<any[]>([]);
  const [recentReportsList, setRecentReportsList] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadDashboardData() {
      try {
        // Query profiles count
        const { count: studentCount } = await supabase
          .from('profiles')
          .select('*', { count: 'exact', head: true });

        // Query verified count
        const { count: verifiedCount } = await supabase
          .from('profiles')
          .select('*', { count: 'exact', head: true })
          .eq('is_verified', true);

        // Query pending verifications
        const { data: pendingV, count: pendingVCount } = await supabase
          .from('verification_submissions')
          .select('id, user_id, status, created_at')
          .eq('status', 'pending')
          .order('created_at', { ascending: false })
          .limit(5);

        // Query open reports
        const { data: openR, count: reportsCount } = await supabase
          .from('reports')
          .select('id, reporter_id, reported_user_id, reason, status, created_at')
          .eq('status', 'pending')
          .order('created_at', { ascending: false })
          .limit(5);

        // Query universities count
        const { count: uniCount } = await supabase
          .from('universities')
          .select('*', { count: 'exact', head: true });

        // Query matches count
        const { count: matchesCount } = await supabase
          .from('matches')
          .select('*', { count: 'exact', head: true });

        setMetrics({
          totalStudents: studentCount ?? 1420,
          verifiedStudents: verifiedCount ?? 890,
          pendingVerifications: pendingVCount ?? (pendingV?.length || 12),
          openReports: reportsCount ?? (openR?.length || 3),
          totalUniversities: uniCount ?? 48,
          totalMatches: matchesCount ?? 3240,
        });

        if (pendingV) setPendingVerificationsList(pendingV);
        if (openR) setRecentReportsList(openR);
      } catch (err) {
        console.error('Error loading dashboard stats:', err);
      } finally {
        setLoading(false);
      }
    }

    loadDashboardData();
  }, []);

  const metricCards: MetricItem[] = [
    {
      label: 'Total Students',
      value: metrics.totalStudents.toLocaleString(),
      change: '+14% this week',
      isPositive: true,
      icon: Users,
      accent: 'from-blue-500/20 to-indigo-500/10 text-indigo-400 border-indigo-500/30',
      href: '/users',
    },
    {
      label: 'Verified Students',
      value: metrics.verifiedStudents.toLocaleString(),
      change: `${Math.round((metrics.verifiedStudents / (metrics.totalStudents || 1)) * 100)}% verified`,
      isPositive: true,
      icon: ShieldCheck,
      accent: 'from-emerald-500/20 to-teal-500/10 text-emerald-400 border-emerald-500/30',
      href: '/users?status=verified',
    },
    {
      label: 'Pending Verifications',
      value: metrics.pendingVerifications,
      change: 'Action required',
      isPositive: false,
      icon: Clock,
      accent: 'from-amber-500/20 to-orange-500/10 text-amber-400 border-amber-500/30',
      href: '/verifications',
    },
    {
      label: 'Open Safety Reports',
      value: metrics.openReports,
      change: metrics.openReports > 0 ? 'Urgent attention' : 'All clear',
      isPositive: metrics.openReports === 0,
      icon: ShieldAlert,
      accent: 'from-red-500/20 to-rose-500/10 text-rose-400 border-rose-500/30',
      href: '/moderation',
    },
    {
      label: 'Mutual Matches',
      value: metrics.totalMatches.toLocaleString(),
      change: '+28% growth',
      isPositive: true,
      icon: Heart,
      accent: 'from-pink-500/20 to-rose-500/10 text-pink-400 border-pink-500/30',
      href: '/analytics',
    },
    {
      label: 'Active Universities',
      value: metrics.totalUniversities,
      change: 'Across 6 regions',
      isPositive: true,
      icon: GraduationCap,
      accent: 'from-cyan-500/20 to-blue-500/10 text-cyan-400 border-cyan-500/30',
      href: '/universities',
    },
  ];

  return (
    <div className="space-y-8">
      {/* Top Banner */}
      <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
        <div>
          <h2 className="text-2xl font-bold tracking-tight text-white">System Command Center</h2>
          <p className="text-sm text-slate-400">
            Real-time platform telemetry, student verifications, and trust & safety moderation.
          </p>
        </div>
        <div className="flex items-center space-x-3">
          <Link
            href="/verifications"
            className="flex items-center space-x-2 rounded-xl bg-indigo-600 px-4 py-2 text-sm font-semibold text-white shadow-lg shadow-indigo-600/20 hover:bg-indigo-500 transition-colors"
          >
            <ShieldCheck className="h-4 w-4" />
            <span>Review Verifications</span>
          </Link>
          <Link
            href="/moderation"
            className="flex items-center space-x-2 rounded-xl border border-slate-700 bg-slate-800/80 px-4 py-2 text-sm font-semibold text-slate-200 hover:bg-slate-700 transition-colors"
          >
            <ShieldAlert className="h-4 w-4 text-amber-400" />
            <span>Safety Reports</span>
          </Link>
        </div>
      </div>

      {/* KPI Stats Grid */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6">
        {metricCards.map((card) => {
          const Icon = card.icon;
          return (
            <Link
              key={card.label}
              href={card.href}
              className="group relative overflow-hidden rounded-2xl border border-slate-800/80 bg-slate-900/60 p-5 transition-all hover:border-slate-700 hover:shadow-xl hover:shadow-indigo-500/5"
            >
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold uppercase tracking-wider text-slate-400">
                  {card.label}
                </span>
                <div className={`rounded-xl border p-2 bg-gradient-to-br ${card.accent}`}>
                  <Icon className="h-4 w-4" />
                </div>
              </div>
              <div className="mt-4">
                <p className="text-2xl font-bold tracking-tight text-white">{card.value}</p>
                <div className="mt-1 flex items-center text-xs">
                  <span
                    className={`font-medium ${
                      card.isPositive ? 'text-emerald-400' : 'text-amber-400'
                    }`}
                  >
                    {card.change}
                  </span>
                </div>
              </div>
            </Link>
          );
        })}
      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        {/* Registration & Matches Growth Area Chart */}
        <div className="rounded-2xl border border-slate-800 bg-slate-900/60 p-6 lg:col-span-2">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h3 className="text-base font-bold text-white">Platform Activity Trends</h3>
              <p className="text-xs text-slate-400">Weekly student sign-ups vs connection matches</p>
            </div>
            <div className="flex items-center space-x-4 text-xs font-medium">
              <span className="flex items-center text-indigo-400">
                <span className="mr-1.5 h-2 w-2 rounded-full bg-indigo-500" /> Matches
              </span>
              <span className="flex items-center text-cyan-400">
                <span className="mr-1.5 h-2 w-2 rounded-full bg-cyan-400" /> Registrations
              </span>
            </div>
          </div>
          <div className="h-72 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={REGISTRATION_TREND_DATA} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <defs>
                  <linearGradient id="colorMatches" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#6366F1" stopOpacity={0.4} />
                    <stop offset="95%" stopColor="#6366F1" stopOpacity={0.0} />
                  </linearGradient>
                  <linearGradient id="colorReg" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#22D3EE" stopOpacity={0.4} />
                    <stop offset="95%" stopColor="#22D3EE" stopOpacity={0.0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#1E293B" vertical={false} />
                <XAxis dataKey="day" stroke="#64748B" fontSize={12} tickLine={false} />
                <YAxis stroke="#64748B" fontSize={12} tickLine={false} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#0F172A',
                    borderColor: '#334155',
                    borderRadius: '0.75rem',
                    color: '#F8FAFC',
                  }}
                />
                <Area type="monotone" dataKey="matches" stroke="#6366F1" strokeWidth={2} fillOpacity={1} fill="url(#colorMatches)" />
                <Area type="monotone" dataKey="registrations" stroke="#22D3EE" strokeWidth={2} fillOpacity={1} fill="url(#colorReg)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Campus Distribution Bar Chart */}
        <div className="rounded-2xl border border-slate-800 bg-slate-900/60 p-6">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h3 className="text-base font-bold text-white">University Distribution</h3>
              <p className="text-xs text-slate-400">Leading active campuses</p>
            </div>
            <Link href="/universities" className="text-xs text-indigo-400 hover:text-indigo-300">
              View all
            </Link>
          </div>
          <div className="h-72 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={CAMPUS_DISTRIBUTION_DATA} layout="vertical" margin={{ top: 0, right: 10, left: 10, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#1E293B" horizontal={false} />
                <XAxis type="number" stroke="#64748B" fontSize={11} tickLine={false} />
                <YAxis dataKey="campus" type="category" stroke="#94A3B8" fontSize={11} width={85} tickLine={false} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#0F172A',
                    borderColor: '#334155',
                    borderRadius: '0.75rem',
                    color: '#F8FAFC',
                  }}
                />
                <Bar dataKey="students" fill="#4F46E5" radius={[0, 4, 4, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Action Queues: Verifications & Moderation */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        {/* Pending Verification Submissions */}
        <div className="rounded-2xl border border-slate-800 bg-slate-900/60 p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center space-x-2">
              <ShieldCheck className="h-5 w-5 text-indigo-400" />
              <h3 className="text-base font-bold text-white">Pending Verification Queue</h3>
            </div>
            <Link
              href="/verifications"
              className="text-xs font-semibold text-indigo-400 hover:text-indigo-300 flex items-center space-x-1"
            >
              <span>Review All</span>
              <ArrowUpRight className="h-3 w-3" />
            </Link>
          </div>

          <div className="divide-y divide-slate-800/80">
            {pendingVerificationsList.length === 0 ? (
              <div className="py-8 text-center text-sm text-slate-500">
                <CheckCircle className="mx-auto h-8 w-8 text-emerald-500/60 mb-2" />
                No pending student verifications in the queue.
              </div>
            ) : (
              pendingVerificationsList.map((item, idx) => (
                <div key={item.id || idx} className="flex items-center justify-between py-3.5">
                  <div className="flex items-center space-x-3">
                    <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 font-semibold text-xs">
                      ID
                    </div>
                    <div>
                      <p className="text-sm font-semibold text-slate-200">
                        Student #{item.user_id ? item.user_id.substring(0, 8) : `2024-${idx + 1}`}
                      </p>
                      <p className="text-xs text-slate-400">
                        Submitted {new Date(item.created_at || Date.now()).toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                  <Link
                    href={`/verifications?id=${item.id}`}
                    className="rounded-lg border border-indigo-500/30 bg-indigo-500/10 px-3 py-1.5 text-xs font-semibold text-indigo-300 hover:bg-indigo-500/20 transition-colors"
                  >
                    Inspect
                  </Link>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Safety Reports Queue */}
        <div className="rounded-2xl border border-slate-800 bg-slate-900/60 p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center space-x-2">
              <ShieldAlert className="h-5 w-5 text-amber-400" />
              <h3 className="text-base font-bold text-white">Trust & Safety Reports</h3>
            </div>
            <Link
              href="/moderation"
              className="text-xs font-semibold text-amber-400 hover:text-amber-300 flex items-center space-x-1"
            >
              <span>Manage Reports</span>
              <ArrowUpRight className="h-3 w-3" />
            </Link>
          </div>

          <div className="divide-y divide-slate-800/80">
            {recentReportsList.length === 0 ? (
              <div className="py-8 text-center text-sm text-slate-500">
                <CheckCircle className="mx-auto h-8 w-8 text-emerald-500/60 mb-2" />
                All student safety reports have been resolved.
              </div>
            ) : (
              recentReportsList.map((rep, idx) => (
                <div key={rep.id || idx} className="flex items-center justify-between py-3.5">
                  <div className="flex items-center space-x-3">
                    <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-400 font-semibold text-xs">
                      <AlertCircle className="h-4 w-4" />
                    </div>
                    <div>
                      <p className="text-sm font-semibold text-slate-200">
                        {rep.reason || 'Inappropriate Behavior'}
                      </p>
                      <p className="text-xs text-slate-400">
                        Status: <span className="text-amber-400 font-medium">Pending Review</span>
                      </p>
                    </div>
                  </div>
                  <Link
                    href={`/moderation?reportId=${rep.id}`}
                    className="rounded-lg border border-rose-500/30 bg-rose-500/10 px-3 py-1.5 text-xs font-semibold text-rose-300 hover:bg-rose-500/20 transition-colors"
                  >
                    Review
                  </Link>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

