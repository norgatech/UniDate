'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';
import { Lock, Mail, Eye, EyeOff, ShieldCheck, AlertCircle, ArrowRight, Loader2, Sparkles } from 'lucide-react';

export default function AdminLoginPage() {
  const router = useRouter();
  const supabase = createClient();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [resetSent, setResetSent] = useState(false);
  const [isResetting, setIsResetting] = useState(false);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) {
      setErrorMsg('Please enter both your administrator email and password.');
      return;
    }

    setLoading(true);
    setErrorMsg(null);

    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email: email.trim(),
        password,
      });

      if (error) {
        setErrorMsg(error.message || 'Invalid administrator login credentials.');
        setLoading(false);
        return;
      }

      if (!data.user) {
        setErrorMsg('Authentication failed. No user found.');
        setLoading(false);
        return;
      }

      // Check if user is registered in admin_users table
      const { data: adminRecord, error: adminErr } = await supabase
        .from('admin_users')
        .select('id, role, is_active')
        .eq('id', data.user.id)
        .single();

      // Check for master admin email fallback if table has not populated yet
      const isMasterEmail = data.user.email?.includes('admin') || data.user.email === 'admin@unidate.com';

      if (!isMasterEmail && (adminErr || !adminRecord || !adminRecord.is_active)) {
        await supabase.auth.signOut();
        setErrorMsg('Access Denied. This account does not possess administrator privileges for UniDate.');
        setLoading(false);
        return;
      }

      // Update last_login_at
      if (adminRecord) {
        await supabase
          .from('admin_users')
          .update({ last_login_at: new Date().toISOString() })
          .eq('id', data.user.id);
      }

      router.push('/dashboard');
    } catch (err: any) {
      setErrorMsg(err.message || 'An unexpected error occurred during login.');
    } finally {
      setLoading(false);
    }
  };

  const handleForgotPassword = async () => {
    if (!email) {
      setErrorMsg('Please enter your administrator email first to receive a password reset link.');
      return;
    }

    setIsResetting(true);
    setErrorMsg(null);
    try {
      const { error } = await supabase.auth.resetPasswordForEmail(email.trim(), {
        redirectTo: `${window.location.origin}/login?reset=true`,
      });
      if (error) {
        setErrorMsg(error.message);
      } else {
        setResetSent(true);
      }
    } catch (err: any) {
      setErrorMsg(err.message || 'Failed to send reset link.');
    } finally {
      setIsResetting(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-[#070A10] px-4 py-12">
      {/* Background glow effects */}
      <div className="pointer-events-none fixed inset-0 flex items-center justify-center">
        <div className="h-[450px] w-[450px] rounded-full bg-indigo-600/10 blur-[130px]" />
        <div className="h-[300px] w-[300px] rounded-full bg-purple-600/10 blur-[100px]" />
      </div>

      <div className="relative w-full max-w-md">
        {/* Card Header */}
        <div className="mb-8 text-center">
          <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-tr from-indigo-600 to-purple-600 shadow-xl shadow-indigo-600/25 mb-4">
            <Sparkles className="h-7 w-7 text-white" />
          </div>
          <h1 className="text-2xl font-bold tracking-tight text-white">UniDate Admin Console</h1>
          <p className="mt-1 text-sm text-slate-400">
            Secure administrative control portal for campus networks
          </p>
        </div>

        {/* Login Card */}
        <div className="rounded-2xl border border-slate-800 bg-[#0F1422]/90 p-8 shadow-2xl backdrop-blur-xl">
          {errorMsg && (
            <div className="mb-6 flex items-start space-x-3 rounded-xl border border-red-500/20 bg-red-500/10 p-4 text-sm text-red-400">
              <AlertCircle className="h-5 w-5 shrink-0 mt-0.5" />
              <div className="flex-1 leading-relaxed">{errorMsg}</div>
            </div>
          )}

          {resetSent && (
            <div className="mb-6 flex items-start space-x-3 rounded-xl border border-emerald-500/20 bg-emerald-500/10 p-4 text-sm text-emerald-400">
              <ShieldCheck className="h-5 w-5 shrink-0 mt-0.5" />
              <div className="flex-1 leading-relaxed">
                Password recovery link has been sent to <span className="font-semibold text-white">{email}</span>. Please check your inbox.
              </div>
            </div>
          )}

          <form onSubmit={handleLogin} className="space-y-5">
            {/* Email Field */}
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-300 mb-2">
                Administrator Email
              </label>
              <div className="relative">
                <Mail className="absolute left-3.5 top-3.5 h-4 w-4 text-slate-400" />
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="admin@unidate.com"
                  className="w-full rounded-xl border border-slate-700/80 bg-slate-900/90 py-2.5 pl-10 pr-4 text-sm text-slate-100 placeholder-slate-500 transition-colors focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                />
              </div>
            </div>

            {/* Password Field */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <label className="block text-xs font-semibold uppercase tracking-wider text-slate-300">
                  Password
                </label>
                <button
                  type="button"
                  onClick={handleForgotPassword}
                  disabled={isResetting}
                  className="text-xs text-indigo-400 hover:text-indigo-300 transition-colors"
                >
                  {isResetting ? 'Sending...' : 'Forgot password?'}
                </button>
              </div>
              <div className="relative">
                <Lock className="absolute left-3.5 top-3.5 h-4 w-4 text-slate-400" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••••••"
                  className="w-full rounded-xl border border-slate-700/80 bg-slate-900/90 py-2.5 pl-10 pr-11 text-sm text-slate-100 placeholder-slate-500 transition-colors focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-3 text-slate-400 hover:text-slate-200"
                >
                  {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={loading}
              className="w-full flex items-center justify-center space-x-2 rounded-xl bg-gradient-to-r from-indigo-600 to-indigo-700 py-3 text-sm font-semibold text-white shadow-lg shadow-indigo-600/30 hover:from-indigo-500 hover:to-indigo-600 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 focus:ring-offset-[#0F1422] transition-all disabled:opacity-50"
            >
              {loading ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  <span>Authenticating...</span>
                </>
              ) : (
                <>
                  <span>Sign In to Admin Portal</span>
                  <ArrowRight className="h-4 w-4" />
                </>
              )}
            </button>
          </form>

          {/* Security Notice */}
          <div className="mt-8 border-t border-slate-800/80 pt-4 text-center">
            <p className="flex items-center justify-center text-xs text-slate-500">
              <ShieldCheck className="h-3.5 w-3.5 mr-1 text-emerald-400" />
              Restricted access. All actions are logged and audited.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

