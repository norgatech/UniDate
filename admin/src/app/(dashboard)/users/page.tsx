'use client';

import React, { useEffect, useState } from 'react';
import { createClient } from '@/lib/supabase/client';
import { useAdminAuth } from '@/context/AuthContext';
import { recordAuditLog } from '@/lib/audit';
import { StudentProfile } from '@/types/admin';
import {
  Users,
  Search,
  Filter,
  ShieldCheck,
  ShieldAlert,
  Ban,
  CheckCircle,
  Clock,
  MoreVertical,
  X,
  ExternalLink,
  GraduationCap,
  Sparkles,
  AlertTriangle,
  RotateCcw,
  Loader2,
} from 'lucide-react';

export default function UsersManagementPage() {
  const { admin } = useAdminAuth();
  const supabase = createClient();

  const [students, setStudents] = useState<StudentProfile[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'verified' | 'pending' | 'suspended'>('all');
  const [universityFilter, setUniversityFilter] = useState<string>('all');
  const [universities, setUniversities] = useState<{ id: string; name: string }[]>([]);

  // Selected Student Drawer
  const [selectedStudent, setSelectedStudent] = useState<StudentProfile | null>(null);

  // Suspend modal state
  const [showSuspendModal, setShowSuspendModal] = useState(false);
  const [suspensionReason, setSuspensionReason] = useState('');
  const [actionLoading, setActionLoading] = useState(false);

  const fetchStudents = async () => {
    setLoading(true);
    try {
      let query = supabase.from('profiles').select(`
        id,
        full_name,
        display_name,
        email,
        university_id,
        faculty_name,
        faculty,
        department_name,
        department,
        academic_level,
        gender,
        date_of_birth,
        avatar_url,
        photos,
        bio,
        is_verified,
        verification_status,
        is_suspended,
        suspension_reason,
        suspended_at,
        suspended_by,
        created_at
      `).order('created_at', { ascending: false });

      if (admin?.role === 'university_admin' && admin.assigned_university_id) {
        query = query.eq('university_id', admin.assigned_university_id);
      }

      const { data, error } = await query;
      if (error) {
        console.error('Error fetching students:', error);
      } else if (data) {
        const mapped: StudentProfile[] = (data as any[]).map((p) => {
          let avatar = p.avatar_url;
          if (!avatar && Array.isArray(p.photos) && p.photos.length > 0) {
            avatar = p.photos[0];
          }
          return {
            ...p,
            full_name: p.full_name || p.display_name || 'Anonymous Student',
            faculty_name: p.faculty_name || p.faculty || 'Undeclared Faculty',
            department_name: p.department_name || p.department || 'Undeclared Department',
            avatar_url: avatar,
            is_verified: p.is_verified ?? (p.verification_status === 'verified'),
          };
        });
        setStudents(mapped);
      }

      // Fetch universities for filter
      const { data: unis } = await supabase.from('universities').select('id, name').order('name');
      if (unis) setUniversities(unis);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStudents();
  }, [admin]);

  const handleSuspendStudent = async () => {
    if (!selectedStudent || !suspensionReason.trim() || !admin) return;
    setActionLoading(true);

    try {
      const now = new Date().toISOString();
      const { error } = await supabase
        .from('profiles')
        .update({
          is_suspended: true,
          suspension_reason: suspensionReason.trim(),
          suspended_at: now,
          suspended_by: admin.id,
        })
        .eq('id', selectedStudent.id);

      if (error) {
        alert('Failed to suspend student: ' + error.message);
      } else {
        await recordAuditLog({
          adminId: admin.id,
          adminEmail: admin.email,
          action: 'SUSPEND_STUDENT',
          targetTable: 'profiles',
          targetId: selectedStudent.id,
          details: {
            student_name: selectedStudent.full_name,
            reason: suspensionReason.trim(),
          },
        });

        // Update local state
        setStudents((prev) =>
          prev.map((s) =>
            s.id === selectedStudent.id
              ? {
                  ...s,
                  is_suspended: true,
                  suspension_reason: suspensionReason.trim(),
                  suspended_at: now,
                }
              : s
          )
        );
        setSelectedStudent((prev) =>
          prev
            ? {
                ...prev,
                is_suspended: true,
                suspension_reason: suspensionReason.trim(),
                suspended_at: now,
              }
            : null
        );
        setShowSuspendModal(false);
        setSuspensionReason('');
      }
    } catch (err: any) {
      alert(err.message);
    } finally {
      setActionLoading(false);
    }
  };

  const handleRestoreStudent = async () => {
    if (!selectedStudent || !admin) return;
    setActionLoading(true);

    try {
      const { error } = await supabase
        .from('profiles')
        .update({
          is_suspended: false,
          suspension_reason: null,
          suspended_at: null,
          suspended_by: null,
        })
        .eq('id', selectedStudent.id);

      if (error) {
        alert('Failed to restore student: ' + error.message);
      } else {
        await recordAuditLog({
          adminId: admin.id,
          adminEmail: admin.email,
          action: 'RESTORE_STUDENT',
          targetTable: 'profiles',
          targetId: selectedStudent.id,
          details: {
            student_name: selectedStudent.full_name,
          },
        });

        setStudents((prev) =>
          prev.map((s) =>
            s.id === selectedStudent.id
              ? {
                  ...s,
                  is_suspended: false,
                  suspension_reason: null,
                  suspended_at: null,
                }
              : s
          )
        );
        setSelectedStudent((prev) =>
          prev
            ? {
                ...prev,
                is_suspended: false,
                suspension_reason: null,
                suspended_at: null,
              }
            : null
        );
      }
    } catch (err: any) {
      alert(err.message);
    } finally {
      setActionLoading(false);
    }
  };

  const filteredStudents = students.filter((s) => {
    const matchesSearch =
      (s.full_name || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
      (s.email || '').toLowerCase().includes(searchQuery.toLowerCase());

    const matchesUniversity =
      universityFilter === 'all' || s.university_id === universityFilter;

    let matchesStatus = true;
    if (statusFilter === 'verified') matchesStatus = s.is_verified;
    if (statusFilter === 'pending') matchesStatus = s.verification_status === 'pending';
    if (statusFilter === 'suspended') matchesStatus = s.is_suspended;

    return matchesSearch && matchesUniversity && matchesStatus;
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
        <div>
          <h2 className="text-2xl font-bold tracking-tight text-white">Student User Directory</h2>
          <p className="text-sm text-slate-400">
            View profiles, oversee verification credentials, and maintain campus community standards.
          </p>
        </div>
        <div className="text-sm text-slate-400">
          Total: <span className="font-semibold text-white">{filteredStudents.length}</span> students
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="flex flex-col gap-4 rounded-2xl border border-slate-800 bg-slate-900/60 p-4 md:flex-row md:items-center md:justify-between">
        <div className="relative flex-1">
          <Search className="absolute left-3.5 top-3 h-4 w-4 text-slate-400" />
          <input
            type="text"
            placeholder="Search by student name or email..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full rounded-xl border border-slate-700/80 bg-slate-950 py-2 pl-10 pr-4 text-sm text-slate-100 placeholder-slate-500 focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
          />
        </div>

        <div className="flex flex-wrap items-center gap-3">
          {/* Status Filter */}
          <div className="flex items-center space-x-2">
            <Filter className="h-4 w-4 text-slate-400" />
            <select
              value={statusFilter}
              onChange={(e: any) => setStatusFilter(e.target.value)}
              className="rounded-xl border border-slate-700/80 bg-slate-950 px-3 py-2 text-sm text-slate-200 focus:border-indigo-500 focus:outline-none"
            >
              <option value="all">All Statuses</option>
              <option value="verified">Verified Only</option>
              <option value="pending">Pending Verification</option>
              <option value="suspended">Suspended Only</option>
            </select>
          </div>

          {/* University Filter */}
          {admin?.role !== 'university_admin' && (
            <select
              value={universityFilter}
              onChange={(e) => setUniversityFilter(e.target.value)}
              className="max-w-[200px] truncate rounded-xl border border-slate-700/80 bg-slate-950 px-3 py-2 text-sm text-slate-200 focus:border-indigo-500 focus:outline-none"
            >
              <option value="all">All Universities</option>
              {universities.map((u) => (
                <option key={u.id} value={u.id}>
                  {u.name}
                </option>
              ))}
            </select>
          )}
        </div>
      </div>

      {/* Students Table */}
      <div className="overflow-hidden rounded-2xl border border-slate-800 bg-slate-900/60 shadow-xl">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm text-slate-300">
            <thead className="border-b border-slate-800 bg-slate-950/60 text-xs font-semibold uppercase tracking-wider text-slate-400">
              <tr>
                <th className="px-6 py-4">Student</th>
                <th className="px-6 py-4">University & Faculty</th>
                <th className="px-6 py-4">Verification</th>
                <th className="px-6 py-4">Status</th>
                <th className="px-6 py-4">Joined</th>
                <th className="px-6 py-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60">
              {loading ? (
                <tr>
                  <td colSpan={6} className="py-12 text-center text-slate-400">
                    <Loader2 className="mx-auto h-8 w-8 animate-spin text-indigo-500 mb-2" />
                    Loading student profiles...
                  </td>
                </tr>
              ) : filteredStudents.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-12 text-center text-slate-400">
                    No students match the selected filter criteria.
                  </td>
                </tr>
              ) : (
                filteredStudents.map((student) => (
                  <tr
                    key={student.id}
                    className="hover:bg-slate-800/40 transition-colors cursor-pointer"
                    onClick={() => setSelectedStudent(student)}
                  >
                    {/* Student Info */}
                    <td className="px-6 py-4">
                      <div className="flex items-center space-x-3">
                        <div className="relative h-10 w-10 shrink-0 overflow-hidden rounded-full bg-slate-800 border border-slate-700">
                          {student.avatar_url ? (
                            <img
                              src={student.avatar_url}
                              alt={student.full_name}
                              className="h-full w-full object-cover"
                            />
                          ) : (
                            <div className="flex h-full w-full items-center justify-center font-bold text-indigo-400">
                              {student.full_name?.charAt(0) || 'U'}
                            </div>
                          )}
                        </div>
                        <div className="min-w-0">
                          <p className="truncate font-semibold text-white">
                            {student.full_name || 'Anonymous Student'}
                          </p>
                          <p className="truncate text-xs text-slate-400">{student.email || 'No email'}</p>
                        </div>
                      </div>
                    </td>

                    {/* Academic Info */}
                    <td className="px-6 py-4">
                      <p className="font-medium text-slate-200 truncate max-w-[200px]">
                        {student.faculty_name || 'Faculty undeclared'}
                      </p>
                      <p className="text-xs text-slate-400 truncate max-w-[200px]">
                        {student.academic_level || 'Undergraduate'}
                      </p>
                    </td>

                    {/* Verification Status */}
                    <td className="px-6 py-4">
                      {student.is_verified ? (
                        <span className="inline-flex items-center rounded-full bg-emerald-500/10 px-2.5 py-1 text-xs font-semibold text-emerald-400 border border-emerald-500/20">
                          <ShieldCheck className="mr-1 h-3.5 w-3.5" />
                          Verified
                        </span>
                      ) : student.verification_status === 'pending' ? (
                        <span className="inline-flex items-center rounded-full bg-amber-500/10 px-2.5 py-1 text-xs font-semibold text-amber-400 border border-amber-500/20">
                          <Clock className="mr-1 h-3.5 w-3.5" />
                          Pending Review
                        </span>
                      ) : (
                        <span className="inline-flex items-center rounded-full bg-slate-700/40 px-2.5 py-1 text-xs font-semibold text-slate-400 border border-slate-700">
                          Unverified
                        </span>
                      )}
                    </td>

                    {/* Account Status */}
                    <td className="px-6 py-4">
                      {student.is_suspended ? (
                        <span className="inline-flex items-center rounded-full bg-red-500/10 px-2.5 py-1 text-xs font-semibold text-red-400 border border-red-500/20">
                          <Ban className="mr-1 h-3.5 w-3.5" />
                          Suspended
                        </span>
                      ) : (
                        <span className="inline-flex items-center rounded-full bg-indigo-500/10 px-2.5 py-1 text-xs font-semibold text-indigo-400 border border-indigo-500/20">
                          Active
                        </span>
                      )}
                    </td>

                    {/* Joined Date */}
                    <td className="px-6 py-4 text-xs text-slate-400">
                      {new Date(student.created_at || Date.now()).toLocaleDateString()}
                    </td>

                    {/* Action */}
                    <td className="px-6 py-4 text-right">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          setSelectedStudent(student);
                        }}
                        className="rounded-lg border border-slate-700 bg-slate-800/80 px-3 py-1.5 text-xs font-medium text-slate-200 hover:bg-slate-700 hover:text-white transition-colors"
                      >
                        Inspect
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Student Details Drawer */}
      {selectedStudent && (
        <div className="fixed inset-0 z-50 flex justify-end bg-black/60 backdrop-blur-sm">
          <div className="relative h-full w-full max-w-xl border-l border-slate-800 bg-[#0E131F] p-6 shadow-2xl overflow-y-auto">
            <button
              onClick={() => setSelectedStudent(null)}
              className="absolute right-5 top-5 rounded-lg p-2 text-slate-400 hover:bg-slate-800 hover:text-white"
            >
              <X className="h-5 w-5" />
            </button>

            <div className="space-y-6">
              {/* Profile Header */}
              <div className="flex items-center space-x-4 border-b border-slate-800 pb-6">
                <div className="h-20 w-20 shrink-0 overflow-hidden rounded-2xl bg-slate-800 border-2 border-indigo-500/30">
                  {selectedStudent.avatar_url ? (
                    <img
                      src={selectedStudent.avatar_url}
                      alt={selectedStudent.full_name}
                      className="h-full w-full object-cover"
                    />
                  ) : (
                    <div className="flex h-full w-full items-center justify-center font-bold text-2xl text-indigo-400">
                      {selectedStudent.full_name?.charAt(0) || 'U'}
                    </div>
                  )}
                </div>
                <div>
                  <h3 className="text-xl font-bold text-white">{selectedStudent.full_name}</h3>
                  <p className="text-sm text-slate-400">{selectedStudent.email}</p>
                  <div className="mt-2 flex flex-wrap gap-2">
                    {selectedStudent.is_verified ? (
                      <span className="inline-flex items-center rounded-full bg-emerald-500/10 px-2.5 py-0.5 text-xs font-semibold text-emerald-400 border border-emerald-500/20">
                        <ShieldCheck className="mr-1 h-3.5 w-3.5" />
                        Verified Campus Student
                      </span>
                    ) : (
                      <span className="inline-flex items-center rounded-full bg-slate-700/40 px-2.5 py-0.5 text-xs font-semibold text-slate-400">
                        Unverified
                      </span>
                    )}

                    {selectedStudent.is_suspended && (
                      <span className="inline-flex items-center rounded-full bg-red-500/10 px-2.5 py-0.5 text-xs font-semibold text-red-400 border border-red-500/20">
                        <Ban className="mr-1 h-3.5 w-3.5" />
                        Suspended
                      </span>
                    )}
                  </div>
                </div>
              </div>

              {/* Suspension Alert if suspended */}
              {selectedStudent.is_suspended && (
                <div className="rounded-xl border border-red-500/30 bg-red-500/10 p-4 text-sm text-red-300">
                  <p className="font-semibold flex items-center">
                    <AlertTriangle className="h-4 w-4 mr-1.5" />
                    Account Currently Suspended
                  </p>
                  <p className="mt-1 text-xs text-red-400">
                    Reason: {selectedStudent.suspension_reason || 'Violation of terms.'}
                  </p>
                  {selectedStudent.suspended_at && (
                    <p className="mt-0.5 text-[11px] text-red-500">
                      Suspended on: {new Date(selectedStudent.suspended_at).toLocaleString()}
                    </p>
                  )}
                </div>
              )}

              {/* Bio */}
              <div>
                <label className="text-xs font-semibold uppercase tracking-wider text-slate-400">
                  Campus Bio
                </label>
                <p className="mt-1.5 text-sm text-slate-200 bg-slate-900/80 rounded-xl p-3 border border-slate-800">
                  {selectedStudent.bio || 'No bio provided yet.'}
                </p>
              </div>

              {/* Academic Details */}
              <div className="grid grid-cols-2 gap-4 rounded-xl border border-slate-800 bg-slate-900/50 p-4 text-sm">
                <div>
                  <span className="text-xs text-slate-400">Faculty</span>
                  <p className="font-medium text-white">{selectedStudent.faculty_name || 'N/A'}</p>
                </div>
                <div>
                  <span className="text-xs text-slate-400">Department</span>
                  <p className="font-medium text-white">{selectedStudent.department_name || 'N/A'}</p>
                </div>
                <div>
                  <span className="text-xs text-slate-400">Academic Level</span>
                  <p className="font-medium text-white">{selectedStudent.academic_level || 'N/A'}</p>
                </div>
                <div>
                  <span className="text-xs text-slate-400">Gender</span>
                  <p className="font-medium text-white">{selectedStudent.gender || 'N/A'}</p>
                </div>
              </div>

              {/* Actions Section */}
              <div className="border-t border-slate-800 pt-6 space-y-3">
                <h4 className="text-xs font-semibold uppercase tracking-wider text-slate-400">
                  Administrative Actions
                </h4>
                {selectedStudent.is_suspended ? (
                  <button
                    onClick={handleRestoreStudent}
                    disabled={actionLoading}
                    className="w-full flex items-center justify-center space-x-2 rounded-xl bg-emerald-600 py-2.5 text-sm font-semibold text-white hover:bg-emerald-500 transition-colors disabled:opacity-50"
                  >
                    {actionLoading ? (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    ) : (
                      <>
                        <RotateCcw className="h-4 w-4" />
                        <span>Restore Student Account</span>
                      </>
                    )}
                  </button>
                ) : (
                  <button
                    onClick={() => setShowSuspendModal(true)}
                    className="w-full flex items-center justify-center space-x-2 rounded-xl bg-red-600/20 border border-red-500/30 py-2.5 text-sm font-semibold text-red-400 hover:bg-red-600/30 transition-colors"
                  >
                    <Ban className="h-4 w-4" />
                    <span>Suspend Student Account</span>
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Suspend Confirmation Modal */}
      {showSuspendModal && selectedStudent && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4">
          <div className="w-full max-w-md rounded-2xl border border-slate-800 bg-[#0E131F] p-6 shadow-2xl">
            <h3 className="text-lg font-bold text-white flex items-center">
              <AlertTriangle className="h-5 w-5 text-red-400 mr-2" />
              Suspend Student Profile
            </h3>
            <p className="mt-2 text-sm text-slate-300">
              You are about to suspend <span className="font-semibold text-white">{selectedStudent.full_name}</span>. This will revoke discovery visibility and session access.
            </p>

            <div className="mt-4">
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400 mb-2">
                Mandatory Reason for Suspension
              </label>
              <textarea
                required
                rows={3}
                value={suspensionReason}
                onChange={(e) => setSuspensionReason(e.target.value)}
                placeholder="e.g. Terms violation: deceptive profile identity or inappropriate behavior reported."
                className="w-full rounded-xl border border-slate-700 bg-slate-900 p-3 text-sm text-slate-100 placeholder-slate-500 focus:border-red-500 focus:outline-none focus:ring-1 focus:ring-red-500"
              />
            </div>

            <div className="mt-6 flex justify-end space-x-3">
              <button
                onClick={() => {
                  setShowSuspendModal(false);
                  setSuspensionReason('');
                }}
                className="rounded-xl border border-slate-700 px-4 py-2 text-sm font-semibold text-slate-300 hover:bg-slate-800"
              >
                Cancel
              </button>
              <button
                onClick={handleSuspendStudent}
                disabled={actionLoading || !suspensionReason.trim()}
                className="rounded-xl bg-red-600 px-4 py-2 text-sm font-semibold text-white hover:bg-red-500 disabled:opacity-50 flex items-center space-x-1.5"
              >
                {actionLoading && <Loader2 className="h-4 w-4 animate-spin" />}
                <span>Confirm Suspension</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

