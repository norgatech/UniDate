'use client';

import React, { useEffect, useState } from 'react';
import { createClient } from '@/lib/supabase/client';
import { useAdminAuth } from '@/context/AuthContext';
import { recordAuditLog } from '@/lib/audit';
import { AdminRole, AdminUser } from '@/types/admin';
import { formatRoleName, getRoleBadgeColor } from '@/lib/auth/rbac';
import {
  UserCog,
  Shield,
  Plus,
  Search,
  CheckCircle,
  XCircle,
  Clock,
  Edit2,
  Trash2,
  AlertTriangle,
  Lock,
  Mail,
  User,
  Building,
  Loader2,
} from 'lucide-react';

const ROLES: AdminRole[] = [
  'super_admin',
  'moderator',
  'verification_admin',
  'support_admin',
  'university_admin',
];

export default function AdminsManagementPage() {
  const { admin } = useAdminAuth();
  const supabase = createClient();

  const [admins, setAdmins] = useState<AdminUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [universities, setUniversities] = useState<{ id: string; name: string }[]>([]);

  // Add/Edit modal state
  const [showModal, setShowModal] = useState(false);
  const [editingAdmin, setEditingAdmin] = useState<AdminUser | null>(null);
  const [form, setForm] = useState({
    email: '',
    full_name: '',
    role: 'moderator' as AdminRole,
    assigned_university_id: '',
    password: '',
  });
  const [actionLoading, setActionLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const fetchAdmins = async () => {
    setLoading(true);
    try {
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
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error fetching admins:', error);
      } else if (data) {
        setAdmins(data as AdminUser[]);
      }

      // Fetch universities for university_admin assignment
      const { data: unis } = await supabase.from('universities').select('id, name').order('name');
      if (unis) setUniversities(unis);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAdmins();
  }, []);

  const handleSaveAdmin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!admin) return;
    setActionLoading(true);
    setErrorMsg(null);

    try {
      if (editingAdmin) {
        // Update existing admin
        const updateData: any = {
          full_name: form.full_name.trim(),
          role: form.role,
          assigned_university_id: form.role === 'university_admin' ? form.assigned_university_id || null : null,
        };

        const { error } = await supabase
          .from('admin_users')
          .update(updateData)
          .eq('id', editingAdmin.id);

        if (error) throw error;

        await recordAuditLog({
          adminId: admin.id,
          adminEmail: admin.email,
          action: 'UPDATE_ADMIN_ROLE',
          targetTable: 'admin_users',
          targetId: editingAdmin.id,
          details: { ...updateData, target_email: editingAdmin.email },
        });

        setAdmins((prev) =>
          prev.map((a) => (a.id === editingAdmin.id ? { ...a, ...updateData } : a))
        );
        setShowModal(false);
      } else {
        // Create new admin account
        if (!form.password || form.password.length < 8) {
          setErrorMsg('Password must be at least 8 characters long.');
          setActionLoading(false);
          return;
        }

        const { data: signUpData, error: signUpError } = await supabase.auth.signUp({
          email: form.email.trim(),
          password: form.password,
          options: {
            data: {
              full_name: form.full_name.trim(),
              is_admin: true,
            },
          },
        });

        if (signUpError) throw signUpError;
        if (!signUpData.user) throw new Error('Failed to register user.');

        // Insert into admin_users table
        const { error: insertError } = await supabase.from('admin_users').insert([
          {
            id: signUpData.user.id,
            email: form.email.trim(),
            full_name: form.full_name.trim(),
            role: form.role,
            assigned_university_id: form.role === 'university_admin' ? form.assigned_university_id || null : null,
            is_active: true,
            created_at: new Date().toISOString(),
          },
        ]);

        if (insertError) throw insertError;

        await recordAuditLog({
          adminId: admin.id,
          adminEmail: admin.email,
          action: 'CREATE_ADMIN_USER',
          targetTable: 'admin_users',
          targetId: signUpData.user.id,
          details: {
            email: form.email.trim(),
            role: form.role,
          },
        });

        fetchAdmins();
        setShowModal(false);
        setForm({
          email: '',
          full_name: '',
          role: 'moderator',
          assigned_university_id: '',
          password: '',
        });
      }
    } catch (err: any) {
      setErrorMsg(err.message || 'Action failed.');
    } finally {
      setActionLoading(false);
    }
  };

  const handleToggleActive = async (target: AdminUser) => {
    if (!admin || target.id === admin.id) return;
    const nextState = !target.is_active;

    try {
      const { error } = await supabase
        .from('admin_users')
        .update({ is_active: nextState })
        .eq('id', target.id);

      if (error) throw error;

      await recordAuditLog({
        adminId: admin.id,
        adminEmail: admin.email,
        action: nextState ? 'ACTIVATE_ADMIN' : 'DEACTIVATE_ADMIN',
        targetTable: 'admin_users',
        targetId: target.id,
        details: { target_email: target.email, is_active: nextState },
      });

      setAdmins((prev) =>
        prev.map((a) => (a.id === target.id ? { ...a, is_active: nextState } : a))
      );
    } catch (err: any) {
      alert('Error updating admin state: ' + err.message);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
        <div>
          <h2 className="text-2xl font-bold tracking-tight text-white">Administrator Access & RBAC</h2>
          <p className="text-sm text-slate-400">
            Control administrator roles, assign campus scopes, and enforce security policies.
          </p>
        </div>
        <button
          onClick={() => {
            setEditingAdmin(null);
            setForm({
              email: '',
              full_name: '',
              role: 'moderator',
              assigned_university_id: '',
              password: '',
            });
            setShowModal(true);
          }}
          className="flex items-center space-x-2 rounded-xl bg-indigo-600 px-4 py-2 text-sm font-semibold text-white shadow-lg shadow-indigo-600/30 hover:bg-indigo-500 transition-colors"
        >
          <Plus className="h-4 w-4" />
          <span>Provision Administrator</span>
        </button>
      </div>

      {/* Admins Table */}
      <div className="overflow-hidden rounded-2xl border border-slate-800 bg-slate-900/60 shadow-xl">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm text-slate-300">
            <thead className="border-b border-slate-800 bg-slate-950/60 text-xs font-semibold uppercase tracking-wider text-slate-400">
              <tr>
                <th className="px-6 py-4">Administrator</th>
                <th className="px-6 py-4">Role & Privileges</th>
                <th className="px-6 py-4">Campus Assignment</th>
                <th className="px-6 py-4">Status</th>
                <th className="px-6 py-4">Last Login</th>
                <th className="px-6 py-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60">
              {loading ? (
                <tr>
                  <td colSpan={6} className="py-12 text-center text-slate-400">
                    <Loader2 className="mx-auto h-8 w-8 animate-spin text-indigo-500 mb-2" />
                    Loading administrator directory...
                  </td>
                </tr>
              ) : admins.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-12 text-center text-slate-400">
                    No administrator records found.
                  </td>
                </tr>
              ) : (
                admins.map((adm) => (
                  <tr key={adm.id} className="hover:bg-slate-800/40 transition-colors">
                    <td className="px-6 py-4">
                      <div className="flex items-center space-x-3">
                        <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 font-bold">
                          {adm.full_name?.charAt(0) || <User className="h-4 w-4" />}
                        </div>
                        <div>
                          <p className="font-semibold text-white">{adm.full_name}</p>
                          <p className="text-xs text-slate-400">{adm.email}</p>
                        </div>
                      </div>
                    </td>

                    <td className="px-6 py-4">
                      <span
                        className={`inline-flex items-center rounded-md px-2.5 py-1 text-xs font-semibold border ${getRoleBadgeColor(
                          adm.role
                        )}`}
                      >
                        <Shield className="mr-1.5 h-3 w-3" />
                        {formatRoleName(adm.role)}
                      </span>
                    </td>

                    <td className="px-6 py-4 text-xs text-slate-400">
                      {adm.assigned_university_id ? (
                        <span className="font-medium text-cyan-400">Scoped Campus</span>
                      ) : (
                        <span>System-wide (All Campuses)</span>
                      )}
                    </td>

                    <td className="px-6 py-4">
                      {adm.is_active ? (
                        <span className="inline-flex items-center text-xs text-emerald-400 font-semibold">
                          <CheckCircle className="mr-1 h-3.5 w-3.5" />
                          Active
                        </span>
                      ) : (
                        <span className="inline-flex items-center text-xs text-red-400 font-semibold">
                          <XCircle className="mr-1 h-3.5 w-3.5" />
                          Deactivated
                        </span>
                      )}
                    </td>

                    <td className="px-6 py-4 text-xs text-slate-400">
                      {adm.last_login_at
                        ? new Date(adm.last_login_at).toLocaleString()
                        : 'Never logged in'}
                    </td>

                    <td className="px-6 py-4 text-right">
                      <div className="flex items-center justify-end space-x-2">
                        <button
                          onClick={() => {
                            setEditingAdmin(adm);
                            setForm({
                              email: adm.email,
                              full_name: adm.full_name,
                              role: adm.role,
                              assigned_university_id: adm.assigned_university_id || '',
                              password: '',
                            });
                            setShowModal(true);
                          }}
                          className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-800 hover:text-white"
                          title="Edit Privileges"
                        >
                          <Edit2 className="h-4 w-4" />
                        </button>
                        {adm.id !== admin?.id && (
                          <button
                            onClick={() => handleToggleActive(adm)}
                            className={`rounded-lg p-1.5 ${
                              adm.is_active
                                ? 'text-slate-400 hover:bg-red-500/10 hover:text-red-400'
                                : 'text-emerald-400 hover:bg-emerald-500/10'
                            }`}
                            title={adm.is_active ? 'Deactivate Access' : 'Reactivate Access'}
                          >
                            <Trash2 className="h-4 w-4" />
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Provision / Edit Admin Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
          <div className="w-full max-w-md rounded-2xl border border-slate-800 bg-[#0E131F] p-6 shadow-2xl">
            <h3 className="text-lg font-bold text-white">
              {editingAdmin ? 'Edit Administrator Privileges' : 'Provision Administrator Account'}
            </h3>

            {errorMsg && (
              <div className="mt-3 rounded-xl border border-red-500/20 bg-red-500/10 p-3 text-xs text-red-400">
                {errorMsg}
              </div>
            )}

            <form onSubmit={handleSaveAdmin} className="mt-4 space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-300 uppercase mb-1">
                  Full Name
                </label>
                <input
                  type="text"
                  required
                  value={form.full_name}
                  onChange={(e) => setForm({ ...form, full_name: e.target.value })}
                  placeholder="e.g. Sarah Jenkins"
                  className="w-full rounded-xl border border-slate-700 bg-slate-900 p-2.5 text-sm text-white focus:outline-none focus:border-indigo-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 uppercase mb-1">
                  Email Address
                </label>
                <input
                  type="email"
                  required
                  disabled={!!editingAdmin}
                  value={form.email}
                  onChange={(e) => setForm({ ...form, email: e.target.value })}
                  placeholder="sarah.jenkins@unidate.com"
                  className="w-full rounded-xl border border-slate-700 bg-slate-900 p-2.5 text-sm text-white focus:outline-none focus:border-indigo-500 disabled:opacity-50"
                />
              </div>

              {!editingAdmin && (
                <div>
                  <label className="block text-xs font-semibold text-slate-300 uppercase mb-1">
                    Initial Security Password
                  </label>
                  <input
                    type="password"
                    required
                    value={form.password}
                    onChange={(e) => setForm({ ...form, password: e.target.value })}
                    placeholder="Minimum 8 characters"
                    className="w-full rounded-xl border border-slate-700 bg-slate-900 p-2.5 text-sm text-white focus:outline-none focus:border-indigo-500"
                  />
                </div>
              )}

              <div>
                <label className="block text-xs font-semibold text-slate-300 uppercase mb-1">
                  Assigned Administrative Role
                </label>
                <select
                  value={form.role}
                  onChange={(e: any) => setForm({ ...form, role: e.target.value })}
                  className="w-full rounded-xl border border-slate-700 bg-slate-900 p-2.5 text-sm text-white focus:outline-none focus:border-indigo-500"
                >
                  {ROLES.map((r) => (
                    <option key={r} value={r}>
                      {formatRoleName(r)} ({r})
                    </option>
                  ))}
                </select>
              </div>

              {form.role === 'university_admin' && (
                <div>
                  <label className="block text-xs font-semibold text-slate-300 uppercase mb-1">
                    Assigned Campus Scope
                  </label>
                  <select
                    value={form.assigned_university_id}
                    onChange={(e) => setForm({ ...form, assigned_university_id: e.target.value })}
                    className="w-full rounded-xl border border-slate-700 bg-slate-900 p-2.5 text-sm text-white focus:outline-none focus:border-indigo-500"
                  >
                    <option value="">Select University...</option>
                    {universities.map((u) => (
                      <option key={u.id} value={u.id}>
                        {u.name}
                      </option>
                    ))}
                  </select>
                </div>
              )}

              <div className="mt-6 flex justify-end space-x-3 pt-4 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="rounded-xl border border-slate-700 px-4 py-2 text-sm font-semibold text-slate-300 hover:bg-slate-800"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={actionLoading}
                  className="rounded-xl bg-indigo-600 px-4 py-2 text-sm font-semibold text-white hover:bg-indigo-500 disabled:opacity-50 flex items-center space-x-1.5"
                >
                  {actionLoading && <Loader2 className="h-4 w-4 animate-spin" />}
                  <span>{editingAdmin ? 'Update Privileges' : 'Provision Account'}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

