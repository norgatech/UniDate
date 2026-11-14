'use client';

import React, { useEffect, useState } from 'react';
import { createClient } from '@/lib/supabase/client';
import { useAdminAuth } from '@/context/AuthContext';
import { recordAuditLog } from '@/lib/audit';
import { ModerationReport } from '@/types/admin';
import {
  ShieldAlert,
  AlertTriangle,
  CheckCircle,
  XCircle,
  Clock,
  Search,
  Filter,
  UserX,
  ExternalLink,
  MessageSquare,
  Loader2,
  Eye,
  Check,
  Ban,
} from 'lucide-react';

export default function ModerationReportsPage() {
  const { admin } = useAdminAuth();
  const supabase = createClient();

  const [reports, setReports] = useState<ModerationReport[]>([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState<string>('pending');
  const [selectedReport, setSelectedReport] = useState<ModerationReport | null>(null);

  // Resolution modal state
  const [actionNotes, setActionNotes] = useState('');
  const [actionLoading, setActionLoading] = useState(false);

  const fetchReports = async () => {
    setLoading(true);
    try {
      let query = supabase
        .from('reports')
        .select(`
          id,
          reporter_id,
          reported_user_id,
          reason,
          description,
          details,
          status,
          action_taken,
          resolved_by,
          resolved_at,
          created_at
        `)
        .order('created_at', { ascending: false });

      if (statusFilter !== 'all') {
        query = query.eq('status', statusFilter);
      }

      const { data, error } = await query;
      if (error) {
        console.error('Error fetching reports:', error);
      } else if (data) {
        setReports(
          (data as any[]).map((r) => ({
            ...r,
            description: r.description || r.details,
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
    fetchReports();
  }, [statusFilter]);

  const handleUpdateStatus = async (
    newStatus: 'investigating' | 'resolved' | 'dismissed',
    actionTakenDesc?: string
  ) => {
    if (!selectedReport || !admin) return;
    setActionLoading(true);

    try {
      const now = new Date().toISOString();
      const updatePayload: any = {
        status: newStatus,
        resolved_by: admin.id,
        resolved_at: now,
      };

      if (actionTakenDesc) {
        updatePayload.action_taken = actionTakenDesc;
      }

      const { error } = await supabase
        .from('reports')
        .update(updatePayload)
        .eq('id', selectedReport.id);

      if (error) throw error;

      await recordAuditLog({
        adminId: admin.id,
        adminEmail: admin.email,
        action: `MODERATION_REPORT_${newStatus.toUpperCase()}`,
        targetTable: 'reports',
        targetId: selectedReport.id,
        details: {
          reported_user_id: selectedReport.reported_user_id,
          reason: selectedReport.reason,
          new_status: newStatus,
          action_taken: actionTakenDesc || null,
        },
      });

      setReports((prev) =>
        prev.map((r) =>
          r.id === selectedReport.id
            ? { ...r, status: newStatus, action_taken: actionTakenDesc, resolved_at: now }
            : r
        )
      );
      setSelectedReport(null);
      setActionNotes('');
    } catch (err: any) {
      alert('Error updating report: ' + err.message);
    } finally {
      setActionLoading(false);
    }
  };

  const handleSuspendReportedUser = async () => {
    if (!selectedReport || !admin || !actionNotes.trim()) return;
    setActionLoading(true);

    try {
      const now = new Date().toISOString();

      // 1. Suspend student in profiles
      const { error: pErr } = await supabase
        .from('profiles')
        .update({
          is_suspended: true,
          suspension_reason: `Moderation Action: ${selectedReport.reason}. ${actionNotes.trim()}`,
          suspended_at: now,
          suspended_by: admin.id,
        })
        .eq('id', selectedReport.reported_user_id);

      if (pErr) throw pErr;

      // 2. Mark report as resolved
      const { error: rErr } = await supabase
        .from('reports')
        .update({
          status: 'resolved',
          action_taken: `Student suspended. Reason: ${actionNotes.trim()}`,
          resolved_by: admin.id,
          resolved_at: now,
        })
        .eq('id', selectedReport.id);

      if (rErr) throw rErr;

      // 3. Log audit
      await recordAuditLog({
        adminId: admin.id,
        adminEmail: admin.email,
        action: 'SUSPEND_STUDENT_VIA_REPORT',
        targetTable: 'profiles',
        targetId: selectedReport.reported_user_id,
        details: {
          report_id: selectedReport.id,
          reason: selectedReport.reason,
          notes: actionNotes.trim(),
        },
      });

      setReports((prev) =>
        prev.map((r) =>
          r.id === selectedReport.id
            ? { ...r, status: 'resolved', action_taken: `Student suspended. ${actionNotes.trim()}` }
            : r
        )
      );
      setSelectedReport(null);
      setActionNotes('');
      alert('Student suspended and report resolved successfully.');
    } catch (err: any) {
      alert('Action failed: ' + err.message);
    } finally {
      setActionLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
        <div>
          <h2 className="text-2xl font-bold tracking-tight text-white">Trust & Safety Moderation</h2>
          <p className="text-sm text-slate-400">
            Investigate student reports, harassment flags, fake accounts, and enforce community standards.
          </p>
        </div>
        <div className="flex items-center space-x-2">
          {(['pending', 'investigating', 'resolved', 'dismissed', 'all'] as const).map((tab) => (
            <button
              key={tab}
              onClick={() => setStatusFilter(tab)}
              className={`rounded-xl px-3.5 py-1.5 text-xs font-semibold capitalize transition-all ${
                statusFilter === tab
                  ? 'bg-rose-600 text-white shadow-md shadow-rose-600/30'
                  : 'border border-slate-800 bg-slate-900/60 text-slate-400 hover:bg-slate-800 hover:text-white'
              }`}
            >
              {tab}
            </button>
          ))}
        </div>
      </div>

      {/* Reports Table */}
      <div className="overflow-hidden rounded-2xl border border-slate-800 bg-slate-900/60 shadow-xl">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm text-slate-300">
            <thead className="border-b border-slate-800 bg-slate-950/60 text-xs font-semibold uppercase tracking-wider text-slate-400">
              <tr>
                <th className="px-6 py-4">Report Reason</th>
                <th className="px-6 py-4">Reported Student ID</th>
                <th className="px-6 py-4">Reporter ID</th>
                <th className="px-6 py-4">Status</th>
                <th className="px-6 py-4">Submitted</th>
                <th className="px-6 py-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60">
              {loading ? (
                <tr>
                  <td colSpan={6} className="py-12 text-center text-slate-400">
                    <Loader2 className="mx-auto h-8 w-8 animate-spin text-rose-500 mb-2" />
                    Loading safety reports...
                  </td>
                </tr>
              ) : reports.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-12 text-center text-slate-400">
                    <CheckCircle className="mx-auto h-8 w-8 text-emerald-500/60 mb-2" />
                    No reports match the current filter.
                  </td>
                </tr>
              ) : (
                reports.map((report) => (
                  <tr
                    key={report.id}
                    className="hover:bg-slate-800/40 transition-colors cursor-pointer"
                    onClick={() => setSelectedReport(report)}
                  >
                    <td className="px-6 py-4">
                      <div className="flex items-center space-x-2">
                        <AlertTriangle className="h-4 w-4 text-rose-400 shrink-0" />
                        <div>
                          <p className="font-semibold text-white">{report.reason}</p>
                          {report.description && (
                            <p className="text-xs text-slate-400 truncate max-w-xs">
                              {report.description}
                            </p>
                          )}
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 font-mono text-xs text-slate-300">
                      {report.reported_user_id.substring(0, 8)}...
                    </td>
                    <td className="px-6 py-4 font-mono text-xs text-slate-400">
                      {report.reporter_id.substring(0, 8)}...
                    </td>
                    <td className="px-6 py-4">
                      <span
                        className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold border ${
                          report.status === 'resolved'
                            ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20'
                            : report.status === 'investigating'
                            ? 'bg-amber-500/10 text-amber-400 border-amber-500/20'
                            : report.status === 'dismissed'
                            ? 'bg-slate-700/40 text-slate-400 border-slate-700'
                            : 'bg-rose-500/10 text-rose-400 border-rose-500/20'
                        }`}
                      >
                        {report.status.toUpperCase()}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-xs text-slate-400">
                      {new Date(report.created_at).toLocaleDateString()}
                    </td>
                    <td className="px-6 py-4 text-right">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          setSelectedReport(report);
                        }}
                        className="rounded-lg border border-slate-700 bg-slate-800/80 px-3 py-1.5 text-xs font-medium text-slate-200 hover:bg-slate-700 hover:text-white"
                      >
                        Investigate
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Investigation Modal */}
      {selectedReport && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-md p-4">
          <div className="w-full max-w-2xl rounded-2xl border border-slate-800 bg-[#0E131F] p-6 shadow-2xl">
            <div className="flex items-center justify-between border-b border-slate-800 pb-4 mb-4">
              <div className="flex items-center space-x-2">
                <ShieldAlert className="h-5 w-5 text-rose-400" />
                <h3 className="text-lg font-bold text-white">Safety Report Investigation</h3>
              </div>
              <button
                onClick={() => setSelectedReport(null)}
                className="rounded-lg p-1 text-slate-400 hover:bg-slate-800 hover:text-white"
              >
                ✕
              </button>
            </div>

            <div className="space-y-4 text-sm">
              <div className="grid grid-cols-2 gap-4 rounded-xl border border-slate-800 bg-slate-900/60 p-4">
                <div>
                  <span className="text-xs text-slate-400">Reason Category</span>
                  <p className="font-semibold text-rose-400">{selectedReport.reason}</p>
                </div>
                <div>
                  <span className="text-xs text-slate-400">Submission Date</span>
                  <p className="font-medium text-slate-200">
                    {new Date(selectedReport.created_at).toLocaleString()}
                  </p>
                </div>
                <div>
                  <span className="text-xs text-slate-400">Reported Student ID</span>
                  <p className="font-mono text-xs text-slate-300">{selectedReport.reported_user_id}</p>
                </div>
                <div>
                  <span className="text-xs text-slate-400">Reporter Student ID</span>
                  <p className="font-mono text-xs text-slate-400">{selectedReport.reporter_id}</p>
                </div>
              </div>

              <div>
                <label className="text-xs font-semibold uppercase tracking-wider text-slate-400">
                  Student's Description of Complaint
                </label>
                <div className="mt-1 rounded-xl border border-slate-800 bg-slate-950 p-4 text-slate-200">
                  {selectedReport.description || 'No additional explanation provided.'}
                </div>
              </div>

              {selectedReport.action_taken && (
                <div className="rounded-xl border border-emerald-500/20 bg-emerald-500/10 p-4 text-sm text-emerald-300">
                  <p className="font-semibold">Resolution Action Record</p>
                  <p className="text-xs text-emerald-400 mt-1">{selectedReport.action_taken}</p>
                </div>
              )}

              {/* Action Note Input */}
              {selectedReport.status !== 'resolved' && (
                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400 mb-1.5">
                    Moderator Action Notes / Decision Summary
                  </label>
                  <textarea
                    rows={2}
                    value={actionNotes}
                    onChange={(e) => setActionNotes(e.target.value)}
                    placeholder="Document investigation outcome or why action was taken..."
                    className="w-full rounded-xl border border-slate-700 bg-slate-900 p-3 text-xs text-white placeholder-slate-500 focus:border-rose-500 focus:outline-none"
                  />
                </div>
              )}
            </div>

            {/* Decision Actions */}
            {selectedReport.status !== 'resolved' && (
              <div className="mt-6 flex flex-wrap items-center justify-end gap-3 border-t border-slate-800 pt-4">
                <button
                  onClick={() => handleUpdateStatus('dismissed', 'Dismissed as non-violation')}
                  disabled={actionLoading}
                  className="rounded-xl border border-slate-700 px-4 py-2 text-xs font-semibold text-slate-300 hover:bg-slate-800"
                >
                  Dismiss Report
                </button>
                <button
                  onClick={() => handleUpdateStatus('investigating', 'Marked under active review')}
                  disabled={actionLoading}
                  className="rounded-xl border border-amber-500/30 bg-amber-500/10 px-4 py-2 text-xs font-semibold text-amber-300 hover:bg-amber-500/20"
                >
                  Mark Under Investigation
                </button>
                <button
                  onClick={() => handleUpdateStatus('resolved', actionNotes || 'Resolved without ban')}
                  disabled={actionLoading}
                  className="rounded-xl bg-indigo-600 px-4 py-2 text-xs font-semibold text-white hover:bg-indigo-500"
                >
                  Mark Resolved
                </button>
                <button
                  onClick={handleSuspendReportedUser}
                  disabled={actionLoading || !actionNotes.trim()}
                  className="rounded-xl bg-rose-600 px-4 py-2 text-xs font-semibold text-white hover:bg-rose-500 flex items-center space-x-1.5 disabled:opacity-50"
                >
                  <Ban className="h-3.5 w-3.5" />
                  <span>Suspend Student & Resolve</span>
                </button>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

