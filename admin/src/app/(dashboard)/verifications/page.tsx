'use client';

import React, { useEffect, useState } from 'react';
import { createClient } from '@/lib/supabase/client';
import { useAdminAuth } from '@/context/AuthContext';
import { recordAuditLog } from '@/lib/audit';
import {
  ShieldCheck,
  ShieldAlert,
  Clock,
  Check,
  X,
  ExternalLink,
  Search,
  Eye,
  AlertCircle,
  Loader2,
  Calendar,
  GraduationCap,
  FileCheck,
} from 'lucide-react';

interface VerificationItem {
  id: string;
  user_id: string;
  id_card_url: string;
  status: 'pending' | 'approved' | 'rejected';
  notes?: string | null;
  created_at: string;
  reviewed_at?: string | null;
  reviewed_by?: string | null;
  profile?: {
    full_name: string;
    email?: string;
    avatar_url?: string;
    faculty_name?: string;
    department_name?: string;
    academic_level?: string;
  };
}

export default function VerificationQueuePage() {
  const { admin } = useAdminAuth();
  const supabase = createClient();

  const [submissions, setSubmissions] = useState<VerificationItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<'pending' | 'approved' | 'rejected' | 'all'>('pending');
  const [searchQuery, setSearchQuery] = useState('');

  // Selected for review modal
  const [selectedSub, setSelectedSub] = useState<VerificationItem | null>(null);
  const [docSignedUrl, setDocSignedUrl] = useState<string | null>(null);
  const [reviewLoading, setReviewLoading] = useState(false);
  const [rejectionReason, setRejectionReason] = useState('');
  const [showRejectBox, setShowRejectBox] = useState(false);

  const fetchVerifications = async () => {
    setLoading(true);
    try {
      let query = supabase
        .from('verification_submissions')
        .select(`
          id,
          user_id,
          id_card_url,
          student_id_document_url,
          status,
          notes,
          review_notes,
          created_at,
          reviewed_at,
          reviewed_by,
          profile:user_id (
            full_name,
            email,
            avatar_url,
            faculty_name,
            department_name,
            academic_level
          )
        `)
        .order('created_at', { ascending: false });

      if (filter !== 'all') {
        query = query.eq('status', filter);
      }

      const { data, error } = await query;
      if (error) {
        // Fallback gracefully to separate queries if PostgREST cache has no direct FK relationship
        let fallbackQuery = supabase
          .from('verification_submissions')
          .select('id, user_id, id_card_url, student_id_document_url, status, notes, review_notes, created_at, reviewed_at, reviewed_by')
          .order('created_at', { ascending: false });

        if (filter !== 'all') {
          fallbackQuery = fallbackQuery.eq('status', filter);
        }

        const { data: rawSubs } = await fallbackQuery;

        if (rawSubs) {
          const userIds = Array.from(new Set(rawSubs.map((s) => s.user_id).filter(Boolean)));
          const { data: profs } = userIds.length > 0
            ? await supabase
                .from('profiles')
                .select('id, full_name, display_name, email, avatar_url, faculty_name, department_name, academic_level')
                .in('id', userIds)
            : { data: [] };

          const profMap = new Map((profs || []).map((p: any) => [p.id, p]));
          const joined = rawSubs.map((s: any) => {
            const p = profMap.get(s.user_id);
            return {
              ...s,
              id_card_url: s.id_card_url || s.student_id_document_url,
              notes: s.notes || s.review_notes,
              profile: p
                ? {
                    full_name: p.full_name || p.display_name,
                    email: p.email,
                    avatar_url: p.avatar_url,
                    faculty_name: p.faculty_name,
                    department_name: p.department_name,
                    academic_level: p.academic_level,
                  }
                : undefined,
            };
          });
          setSubmissions(joined as any[]);
        }
      } else if (data) {
        setSubmissions(
          data.map((s: any) => ({
            ...s,
            id_card_url: s.id_card_url || s.student_id_document_url,
            notes: s.notes || s.review_notes,
            profile: s.profile
              ? {
                  ...s.profile,
                  full_name: s.profile.full_name || s.profile.display_name,
                }
              : undefined,
          }))
        );
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchVerifications();
  }, [filter]);

  // When a submission is selected, fetch signed storage URL for the ID card if private
  useEffect(() => {
    async function resolveStorageUrl() {
      if (!selectedSub?.id_card_url) {
        setDocSignedUrl(null);
        return;
      }

      // If it's already a full HTTP URL
      if (selectedSub.id_card_url.startsWith('http')) {
        setDocSignedUrl(selectedSub.id_card_url);
        return;
      }

      try {
        const { data, error } = await supabase.storage
          .from('student-verifications')
          .createSignedUrl(selectedSub.id_card_url, 3600);

        if (data?.signedUrl) {
          setDocSignedUrl(data.signedUrl);
        } else {
          setDocSignedUrl(selectedSub.id_card_url);
        }
      } catch (e) {
        setDocSignedUrl(selectedSub.id_card_url);
      }
    }

    if (selectedSub) {
      resolveStorageUrl();
      setShowRejectBox(false);
      setRejectionReason('');
    }
  }, [selectedSub]);

  const handleApprove = async () => {
    if (!selectedSub || !admin) return;
    setReviewLoading(true);

    try {
      const now = new Date().toISOString();

      // 1. Update verification_submissions
      const { error: vError } = await supabase
        .from('verification_submissions')
        .update({
          status: 'approved',
          reviewed_at: now,
          reviewed_by: admin.id,
        })
        .eq('id', selectedSub.id);

      if (vError) throw vError;

      // 2. Update profiles
      const { error: pError } = await supabase
        .from('profiles')
        .update({
          is_verified: true,
          verification_status: 'verified',
        })
        .eq('id', selectedSub.user_id);

      if (pError) throw pError;

      // 3. Record Audit Log
      await recordAuditLog({
        adminId: admin.id,
        adminEmail: admin.email,
        action: 'APPROVE_STUDENT_VERIFICATION',
        targetTable: 'verification_submissions',
        targetId: selectedSub.id,
        details: {
          student_id: selectedSub.user_id,
          student_name: selectedSub.profile?.full_name,
        },
      });

      // Update UI
      setSubmissions((prev) =>
        prev.map((item) =>
          item.id === selectedSub.id ? { ...item, status: 'approved', reviewed_at: now } : item
        )
      );
      setSelectedSub(null);
    } catch (err: any) {
      alert('Approval failed: ' + err.message);
    } finally {
      setReviewLoading(false);
    }
  };

  const handleReject = async () => {
    if (!selectedSub || !admin || !rejectionReason.trim()) return;
    setReviewLoading(true);

    try {
      const now = new Date().toISOString();

      // 1. Update verification_submissions
      const { error: vError } = await supabase
        .from('verification_submissions')
        .update({
          status: 'rejected',
          notes: rejectionReason.trim(),
          reviewed_at: now,
          reviewed_by: admin.id,
        })
        .eq('id', selectedSub.id);

      if (vError) throw vError;

      // 2. Update profiles
      const { error: pError } = await supabase
        .from('profiles')
        .update({
          is_verified: false,
          verification_status: 'rejected',
        })
        .eq('id', selectedSub.user_id);

      if (pError) throw pError;

      // 3. Record Audit Log
      await recordAuditLog({
        adminId: admin.id,
        adminEmail: admin.email,
        action: 'REJECT_STUDENT_VERIFICATION',
        targetTable: 'verification_submissions',
        targetId: selectedSub.id,
        details: {
          student_id: selectedSub.user_id,
          student_name: selectedSub.profile?.full_name,
          reason: rejectionReason.trim(),
        },
      });

      // Update UI
      setSubmissions((prev) =>
        prev.map((item) =>
          item.id === selectedSub.id
            ? { ...item, status: 'rejected', notes: rejectionReason.trim(), reviewed_at: now }
            : item
        )
      );
      setSelectedSub(null);
    } catch (err: any) {
      alert('Rejection failed: ' + err.message);
    } finally {
      setReviewLoading(false);
    }
  };

  const filteredSubmissions = submissions.filter((sub) => {
    const studentName = sub.profile?.full_name || '';
    const studentEmail = sub.profile?.email || '';
    return (
      studentName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      studentEmail.toLowerCase().includes(searchQuery.toLowerCase())
    );
  });

  return (
    <div className="space-y-6">
      {/* Title */}
      <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
        <div>
          <h2 className="text-2xl font-bold tracking-tight text-white">Student ID Verification Review</h2>
          <p className="text-sm text-slate-400">
            Verify legitimate campus matriculation through official university credentials and IDs.
          </p>
        </div>
        <div className="flex items-center space-x-2">
          {(['pending', 'approved', 'rejected', 'all'] as const).map((tab) => (
            <button
              key={tab}
              onClick={() => setFilter(tab)}
              className={`rounded-xl px-3.5 py-1.5 text-xs font-semibold capitalize transition-all ${
                filter === tab
                  ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/30'
                  : 'border border-slate-800 bg-slate-900/60 text-slate-400 hover:bg-slate-800 hover:text-white'
              }`}
            >
              {tab}
            </button>
          ))}
        </div>
      </div>

      {/* Search Bar */}
      <div className="relative">
        <Search className="absolute left-3.5 top-3 h-4 w-4 text-slate-400" />
        <input
          type="text"
          placeholder="Search student submissions..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="w-full rounded-xl border border-slate-800 bg-slate-900/60 py-2 pl-10 pr-4 text-sm text-slate-200 placeholder-slate-500 focus:border-indigo-500 focus:outline-none"
        />
      </div>

      {/* Submissions Grid / List */}
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
        {loading ? (
          <div className="col-span-full py-16 text-center text-slate-400">
            <Loader2 className="mx-auto h-8 w-8 animate-spin text-indigo-500 mb-2" />
            Loading verification queue...
          </div>
        ) : filteredSubmissions.length === 0 ? (
          <div className="col-span-full rounded-2xl border border-slate-800 bg-slate-900/40 py-16 text-center text-slate-400">
            <FileCheck className="mx-auto h-10 w-10 text-slate-600 mb-3" />
            <p className="text-base font-semibold text-slate-300">No submissions found</p>
            <p className="text-xs text-slate-500 mt-1">There are no verification requests matching your filter.</p>
          </div>
        ) : (
          filteredSubmissions.map((sub) => (
            <div
              key={sub.id}
              className="flex flex-col justify-between rounded-2xl border border-slate-800 bg-slate-900/60 p-5 transition-all hover:border-slate-700"
            >
              <div>
                <div className="flex items-center justify-between mb-3">
                  <span
                    className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold border ${
                      sub.status === 'approved'
                        ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20'
                        : sub.status === 'rejected'
                        ? 'bg-red-500/10 text-red-400 border-red-500/20'
                        : 'bg-amber-500/10 text-amber-400 border-amber-500/20'
                    }`}
                  >
                    {sub.status === 'approved' && <ShieldCheck className="mr-1 h-3 w-3" />}
                    {sub.status === 'rejected' && <ShieldAlert className="mr-1 h-3 w-3" />}
                    {sub.status === 'pending' && <Clock className="mr-1 h-3 w-3" />}
                    {sub.status.toUpperCase()}
                  </span>
                  <span className="text-[11px] text-slate-400">
                    {new Date(sub.created_at).toLocaleDateString()}
                  </span>
                </div>

                <div className="flex items-center space-x-3 mb-4">
                  <div className="h-10 w-10 shrink-0 overflow-hidden rounded-full bg-slate-800 border border-slate-700">
                    {sub.profile?.avatar_url ? (
                      <img
                        src={sub.profile.avatar_url}
                        alt=""
                        className="h-full w-full object-cover"
                      />
                    ) : (
                      <div className="flex h-full w-full items-center justify-center font-bold text-indigo-400">
                        {sub.profile?.full_name?.charAt(0) || 'S'}
                      </div>
                    )}
                  </div>
                  <div className="min-w-0">
                    <p className="truncate font-semibold text-white">
                      {sub.profile?.full_name || 'Anonymous Student'}
                    </p>
                    <p className="truncate text-xs text-slate-400">
                      {sub.profile?.faculty_name || 'Academic Record Pending'}
                    </p>
                  </div>
                </div>

                {/* Rejection Note Preview if rejected */}
                {sub.status === 'rejected' && sub.notes && (
                  <p className="text-xs text-red-400 bg-red-500/10 rounded-lg p-2 mb-3 border border-red-500/20">
                    Reason: {sub.notes}
                  </p>
                )}
              </div>

              <button
                onClick={() => setSelectedSub(sub)}
                className="w-full flex items-center justify-center space-x-1.5 rounded-xl border border-indigo-500/30 bg-indigo-500/10 py-2 text-xs font-semibold text-indigo-300 hover:bg-indigo-500/20 transition-colors"
              >
                <Eye className="h-3.5 w-3.5" />
                <span>Review ID Document</span>
              </button>
            </div>
          ))
        )}
      </div>

      {/* Review & Decision Modal */}
      {selectedSub && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-md p-4">
          <div className="flex flex-col md:flex-row w-full max-w-4xl max-h-[90vh] rounded-2xl border border-slate-800 bg-[#0E131F] shadow-2xl overflow-hidden">
            {/* Left: ID Document Preview */}
            <div className="flex flex-1 flex-col items-center justify-center bg-slate-950 p-6 border-b md:border-b-0 md:border-r border-slate-800">
              <span className="text-xs uppercase font-semibold tracking-wider text-slate-400 mb-3">
                Submitted Student Credential
              </span>
              <div className="relative flex h-80 w-full items-center justify-center overflow-hidden rounded-xl border border-slate-800 bg-slate-900">
                {docSignedUrl ? (
                  <img
                    src={docSignedUrl}
                    alt="Student ID Document"
                    className="max-h-full max-w-full object-contain"
                  />
                ) : (
                  <p className="text-xs text-slate-500">Document preview unavailable</p>
                )}
              </div>
              {docSignedUrl && (
                <a
                  href={docSignedUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="mt-3 flex items-center space-x-1 text-xs text-indigo-400 hover:text-indigo-300"
                >
                  <span>Open Full Resolution Document</span>
                  <ExternalLink className="h-3 w-3" />
                </a>
              )}
            </div>

            {/* Right: Student Profile & Decision Controls */}
            <div className="flex w-full md:w-96 flex-col justify-between p-6 overflow-y-auto">
              <div>
                <div className="flex items-center justify-between border-b border-slate-800 pb-4 mb-4">
                  <h3 className="font-bold text-white text-base">Verification Review</h3>
                  <button
                    onClick={() => setSelectedSub(null)}
                    className="rounded-lg p-1 text-slate-400 hover:bg-slate-800 hover:text-white"
                  >
                    <X className="h-5 w-5" />
                  </button>
                </div>

                <div className="space-y-3 text-sm">
                  <div>
                    <span className="text-xs text-slate-400">Full Name</span>
                    <p className="font-semibold text-white">
                      {selectedSub.profile?.full_name || 'N/A'}
                    </p>
                  </div>
                  <div>
                    <span className="text-xs text-slate-400">Email Address</span>
                    <p className="font-medium text-slate-200">
                      {selectedSub.profile?.email || 'N/A'}
                    </p>
                  </div>
                  <div>
                    <span className="text-xs text-slate-400">Faculty</span>
                    <p className="font-medium text-slate-200">
                      {selectedSub.profile?.faculty_name || 'N/A'}
                    </p>
                  </div>
                  <div>
                    <span className="text-xs text-slate-400">Department</span>
                    <p className="font-medium text-slate-200">
                      {selectedSub.profile?.department_name || 'N/A'}
                    </p>
                  </div>
                  <div>
                    <span className="text-xs text-slate-400">Submission Date</span>
                    <p className="font-medium text-slate-300 text-xs">
                      {new Date(selectedSub.created_at).toLocaleString()}
                    </p>
                  </div>
                </div>

                {/* Reject Reason Box */}
                {showRejectBox && (
                  <div className="mt-4 rounded-xl border border-red-500/30 bg-red-500/10 p-3">
                    <label className="block text-xs font-semibold text-red-300 mb-1.5">
                      Specify Rejection Reason (sent to student):
                    </label>
                    <textarea
                      rows={2}
                      value={rejectionReason}
                      onChange={(e) => setRejectionReason(e.target.value)}
                      placeholder="e.g. Blurry photo, expired semester ID, or name mismatch."
                      className="w-full rounded-lg border border-red-500/40 bg-slate-900 p-2 text-xs text-white placeholder-slate-500 focus:outline-none"
                    />
                  </div>
                )}
              </div>

              {/* Action Buttons */}
              <div className="mt-6 space-y-2 pt-4 border-t border-slate-800">
                {selectedSub.status === 'pending' ? (
                  <>
                    {!showRejectBox ? (
                      <>
                        <button
                          onClick={handleApprove}
                          disabled={reviewLoading}
                          className="w-full flex items-center justify-center space-x-2 rounded-xl bg-emerald-600 py-2.5 text-sm font-semibold text-white hover:bg-emerald-500 transition-colors disabled:opacity-50"
                        >
                          {reviewLoading ? (
                            <Loader2 className="h-4 w-4 animate-spin" />
                          ) : (
                            <>
                              <Check className="h-4 w-4" />
                              <span>Approve & Grant Badge</span>
                            </>
                          )}
                        </button>
                        <button
                          onClick={() => setShowRejectBox(true)}
                          disabled={reviewLoading}
                          className="w-full flex items-center justify-center space-x-2 rounded-xl border border-red-500/30 bg-red-500/10 py-2.5 text-sm font-semibold text-red-400 hover:bg-red-500/20 transition-colors"
                        >
                          <X className="h-4 w-4" />
                          <span>Reject Verification</span>
                        </button>
                      </>
                    ) : (
                      <>
                        <button
                          onClick={handleReject}
                          disabled={reviewLoading || !rejectionReason.trim()}
                          className="w-full flex items-center justify-center space-x-2 rounded-xl bg-red-600 py-2.5 text-sm font-semibold text-white hover:bg-red-500 transition-colors disabled:opacity-50"
                        >
                          {reviewLoading ? (
                            <Loader2 className="h-4 w-4 animate-spin" />
                          ) : (
                            <span>Confirm Rejection</span>
                          )}
                        </button>
                        <button
                          onClick={() => setShowRejectBox(false)}
                          className="w-full rounded-xl border border-slate-700 py-2 text-xs font-semibold text-slate-300 hover:bg-slate-800"
                        >
                          Cancel
                        </button>
                      </>
                    )}
                  </>
                ) : (
                  <div className="text-center py-2 text-xs text-slate-400">
                    Decision already finalized ({selectedSub.status.toUpperCase()})
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

