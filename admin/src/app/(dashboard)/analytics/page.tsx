'use client';

import React, { useState } from 'react';
import {
  TrendingUp,
  Heart,
  Users,
  MessageCircle,
  Clock,
  Sparkles,
  Award,
  ArrowUpRight,
} from 'lucide-react';
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  AreaChart,
  Area,
  CartesianGrid,
  PieChart,
  Pie,
  Cell,
} from 'recharts';

const SWIPES_VS_MATCHES_DATA = [
  { day: 'Nov 8', likes: 1420, passes: 3100, matches: 380 },
  { day: 'Nov 9', likes: 1850, passes: 3890, matches: 460 },
  { day: 'Nov 10', likes: 2100, passes: 4200, matches: 530 },
  { day: 'Nov 11', likes: 2480, passes: 4900, matches: 640 },
  { day: 'Nov 12', likes: 2950, passes: 5300, matches: 790 },
  { day: 'Nov 13', likes: 3600, passes: 6100, matches: 920 },
  { day: 'Nov 14', likes: 4120, passes: 6800, matches: 1040 },
];

const GENDER_RATIO_DATA = [
  { name: 'Female', value: 52, color: '#EC4899' },
  { name: 'Male', value: 45, color: '#3B82F6' },
  { name: 'Non-Binary / Other', value: 3, color: '#8B5CF6' },
];

const ACADEMIC_LEVEL_DATA = [
  { level: '100 Level (Freshman)', count: 420 },
  { level: '200 Level (Sophomore)', count: 580 },
  { level: '300 Level (Junior)', count: 640 },
  { level: '400 Level (Senior)', count: 490 },
  { level: 'Postgraduate / Masters', count: 180 },
];

export default function AnalyticsPage() {
  const [timeRange, setTimeRange] = useState('7d');

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
        <div>
          <h2 className="text-2xl font-bold tracking-tight text-white">Platform Analytics & Insights</h2>
          <p className="text-sm text-slate-400">
            Comprehensive telemetry on student engagement, matching efficiency, and campus demographics.
          </p>
        </div>
        <div className="flex items-center space-x-2">
          {['24h', '7d', '30d', 'All Time'].map((range) => (
            <button
              key={range}
              onClick={() => setTimeRange(range)}
              className={`rounded-xl px-3.5 py-1.5 text-xs font-semibold transition-all ${
                timeRange === range
                  ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/30'
                  : 'border border-slate-800 bg-slate-900/60 text-slate-400 hover:bg-slate-800 hover:text-white'
              }`}
            >
              {range}
            </button>
          ))}
        </div>
      </div>

      {/* High-Level Conversion Metric Cards */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <div className="rounded-2xl border border-slate-800 bg-slate-900/60 p-5">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-400">
              Match Conversion Rate
            </span>
            <div className="rounded-xl border border-pink-500/30 bg-pink-500/10 p-2 text-pink-400">
              <Heart className="h-4 w-4" />
            </div>
          </div>
          <p className="mt-3 text-2xl font-bold text-white">24.6%</p>
          <p className="mt-1 text-xs text-emerald-400 font-medium">+3.2% from last cycle</p>
        </div>

        <div className="rounded-2xl border border-slate-800 bg-slate-900/60 p-5">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-400">
              Avg Time to 1st Match
            </span>
            <div className="rounded-xl border border-indigo-500/30 bg-indigo-500/10 p-2 text-indigo-400">
              <Clock className="h-4 w-4" />
            </div>
          </div>
          <p className="mt-3 text-2xl font-bold text-white">18.4 mins</p>
          <p className="mt-1 text-xs text-emerald-400 font-medium">Fast campus matchmaking</p>
        </div>

        <div className="rounded-2xl border border-slate-800 bg-slate-900/60 p-5">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-400">
              Chat Engagement Rate
            </span>
            <div className="rounded-xl border border-cyan-500/30 bg-cyan-500/10 p-2 text-cyan-400">
              <MessageCircle className="h-4 w-4" />
            </div>
          </div>
          <p className="mt-3 text-2xl font-bold text-white">71.8%</p>
          <p className="mt-1 text-xs text-slate-400">Matches that begin messaging</p>
        </div>

        <div className="rounded-2xl border border-slate-800 bg-slate-900/60 p-5">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-400">
              Verified User Premium
            </span>
            <div className="rounded-xl border border-emerald-500/30 bg-emerald-500/10 p-2 text-emerald-400">
              <Award className="h-4 w-4" />
            </div>
          </div>
          <p className="mt-3 text-2xl font-bold text-white">3.4x</p>
          <p className="mt-1 text-xs text-emerald-400 font-medium">More likes received with badge</p>
        </div>
      </div>

      {/* Main Charts */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        {/* Swiping and Match Growth */}
        <div className="rounded-2xl border border-slate-800 bg-slate-900/60 p-6 lg:col-span-2">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h3 className="text-base font-bold text-white">Discovery Swipes vs Mutual Matches</h3>
              <p className="text-xs text-slate-400">Daily like gestures, passes, and successful connections</p>
            </div>
            <div className="flex items-center space-x-4 text-xs font-medium">
              <span className="flex items-center text-indigo-400">
                <span className="mr-1.5 h-2 w-2 rounded-full bg-indigo-500" /> Likes
              </span>
              <span className="flex items-center text-pink-400">
                <span className="mr-1.5 h-2 w-2 rounded-full bg-pink-500" /> Mutual Matches
              </span>
            </div>
          </div>
          <div className="h-80 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={SWIPES_VS_MATCHES_DATA} margin={{ top: 10, right: 10, left: -10, bottom: 0 }}>
                <defs>
                  <linearGradient id="colorLikes" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#6366F1" stopOpacity={0.4} />
                    <stop offset="95%" stopColor="#6366F1" stopOpacity={0.0} />
                  </linearGradient>
                  <linearGradient id="colorMatches" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#EC4899" stopOpacity={0.4} />
                    <stop offset="95%" stopColor="#EC4899" stopOpacity={0.0} />
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
                <Area type="monotone" dataKey="likes" stroke="#6366F1" strokeWidth={2} fillOpacity={1} fill="url(#colorLikes)" />
                <Area type="monotone" dataKey="matches" stroke="#EC4899" strokeWidth={2} fillOpacity={1} fill="url(#colorMatches)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Gender Demographics Ratio */}
        <div className="rounded-2xl border border-slate-800 bg-slate-900/60 p-6 flex flex-col justify-between">
          <div>
            <h3 className="text-base font-bold text-white">Student Demographics</h3>
            <p className="text-xs text-slate-400">Gender distribution on UniDate</p>
            <div className="h-56 w-full mt-4">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={GENDER_RATIO_DATA}
                    cx="50%"
                    cy="50%"
                    innerRadius={55}
                    outerRadius={80}
                    paddingAngle={4}
                    dataKey="value"
                  >
                    {GENDER_RATIO_DATA.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip
                    contentStyle={{
                      backgroundColor: '#0F172A',
                      borderColor: '#334155',
                      borderRadius: '0.75rem',
                      color: '#F8FAFC',
                    }}
                  />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </div>

          <div className="space-y-2 border-t border-slate-800 pt-4">
            {GENDER_RATIO_DATA.map((item) => (
              <div key={item.name} className="flex items-center justify-between text-xs">
                <span className="flex items-center text-slate-300">
                  <span
                    className="mr-2 h-2.5 w-2.5 rounded-full"
                    style={{ backgroundColor: item.color }}
                  />
                  {item.name}
                </span>
                <span className="font-semibold text-white">{item.value}%</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Academic Year Distribution */}
      <div className="rounded-2xl border border-slate-800 bg-slate-900/60 p-6">
        <h3 className="text-base font-bold text-white mb-1">Academic Level Distribution</h3>
        <p className="text-xs text-slate-400 mb-6">Student adoption across degree years</p>
        <div className="h-64 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={ACADEMIC_LEVEL_DATA} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#1E293B" vertical={false} />
              <XAxis dataKey="level" stroke="#64748B" fontSize={11} tickLine={false} />
              <YAxis stroke="#64748B" fontSize={11} tickLine={false} />
              <Tooltip
                contentStyle={{
                  backgroundColor: '#0F172A',
                  borderColor: '#334155',
                  borderRadius: '0.75rem',
                  color: '#F8FAFC',
                }}
              />
              <Bar dataKey="count" fill="#6366F1" radius={[6, 6, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
}

