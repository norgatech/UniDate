'use client';

import React, { useEffect, useState } from 'react';
import { createClient } from '@/lib/supabase/client';
import { AdminAuditLog } from '@/types/admin';
import {
  FileText,
  Search,
  Filter,
  Shield,
  Clock,
  Eye,
  CheckCircle,
  AlertTriangle,
  Code,
  User,
  Loader2,
} from 'lucide-react';

export default function AuditLogsPage() {
  const supabase = createClient();

  const [logs, setLogs] = useState<AdminAuditLog[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [actionFilter, setActionFilter] = useState('ALL');
  const [selectedLog, setSelectedLog] = useState<AdminAuditLog | null>(null);

  const fetchLogs = async () => {
    setLoading(true);
    try {
      let query = supabase
        .from('admin_audit_logs')
        .select('*')
        .order('created_at', { ascending: false });

      if (actionFilter !== 'ALL') {
        query = query.eq('action', actionFilter);
      }

      const { data, error } = await query;
      if (error) {
        console.error('Error fetching audit logs:', error);
      } else if (data) {
        setLogs(data as AdminAuditLog[]);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLogs();
  }, [actionFilter]);

  const filteredLogs = logs.filter((log) => {
    const matchesSearch =
      log.admin_email.toLowerCase().includes(searchQuery.toLowerCase()) ||
      log.action.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (log.target_table || '').toLowerCase().includes(searchQuery.toLowerCase());
    return matchesSearch;
  });

  const getActionBadgeColor = (action: string) => {
    if (action.includes('SUSPEND') || action.includes('REJECT') || action.includes('DEACTIVATE')) {
      return 'bg-red-500/10 text-red-400 border-red-500/20';
    }
    if (action.includes('APPROVE') || action.includes('RESTORE') || action.includes('ACTIVATE')) {
      return 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20';
    }
    if (action.includes('CREATE') || action.includes('PROVISION')) {
      return 'bg-indigo-500/10 text-indigo-400 border-indigo-500/20';
    }
    return 'bg-amber-500/10 text-amber-400 border-amber-500/20';
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
        <div>
          <h2 className="text-2xl font-bold tracking-tight text-white">Immutable Security Audit Logs</h2>
          <p className="text-sm text-slate-400">
            Cryptographically sealed and tamper-evident audit record of all administrative transactions.
          </p>
        </div>
        <div className="text-xs font-mono text-slate-400 bg-slate-900 border border-slate-800 rounded-xl px-3 py-1.5 flex items-center space-x-1.5">
          <Shield className="h-3.5 w-3.5 text-emerald-400" />
          <span>RLS Enforced • Write-Only Append</span>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="flex flex-col gap-4 rounded-2xl border border-slate-800 bg-slate-900/60 p-4 md:flex-row md:items-center md:justify-between">
        <div className="relative flex-1">
          <Search className="absolute left-3.5 top-3 h-4 w-4 text-slate-400" />
          <input
            type="text"
            placeholder="Search by admin email, action name, or target table..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full rounded-xl border border-slate-700/80 bg-slate-950 py-2 pl-10 pr-4 text-sm text-slate-100 placeholder-slate-500 focus:border-indigo-500 focus:outline-none"
          />
        </div>

        <select
          value={actionFilter}
          onChange={(e) => setActionFilter(e.target.value)}
          className="rounded-xl border border-slate-700/80 bg-slate-950 px-3 py-2 text-sm text-slate-200 focus:border-indigo-500 focus:outline-none"
        >
          <option value="ALL">All Recorded Actions</option>
          <option value="SUSPEND_STUDENT">SUSPEND_STUDENT</option>
          <option value="RESTORE_STUDENT">RESTORE_STUDENT</option>
          <option value="APPROVE_STUDENT_VERIFICATION">APPROVE_STUDENT_VERIFICATION</option>
          <option value="REJECT_STUDENT_VERIFICATION">REJECT_STUDENT_VERIFICATION</option>
          <option value="UPDATE_ADMIN_ROLE">UPDATE_ADMIN_ROLE</option>
          <option value="CREATE_ADMIN_USER">CREATE_ADMIN_USER</option>
        </select>
      </div>

      {/* Audit Logs Table */}
      <div className="overflow-hidden rounded-2xl border border-slate-800 bg-slate-900/60 shadow-xl">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm text-slate-300">
            <thead className="border-b border-slate-800 bg-slate-950/60 text-xs font-semibold uppercase tracking-wider text-slate-400">
              <tr>
                <th className="px-6 py-4">Timestamp</th>
                <th className="px-6 py-4">Action</th>
                <th className="px-6 py-4">Administrator</th>
                <th className="px-6 py-4">Target Entity</th>
                <th className="px-6 py-4 text-right">Details</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60">
              {loading ? (
                <tr>
                  <td colSpan={5} className="py-12 text-center text-slate-400">
                    <Loader2 className="mx-auto h-8 w-8 animate-spin text-indigo-500 mb-2" />
                    Loading audit trail...
                  </td>
                </tr>
              ) : filteredLogs.length === 0 ? (
                <tr>
                  <td colSpan={5} className="py-12 text-center text-slate-400">
                    No audit records found matching your filter.
                  </td>
                </tr>
              ) : (
                filteredLogs.map((log) => (
                  <tr
                    key={log.id}
                    className="hover:bg-slate-800/40 transition-colors cursor-pointer"
                    onClick={() => setSelectedLog(log)}
                  >
                    <td className="px-6 py-4 font-mono text-xs text-slate-400">
                      {new Date(log.created_at).toLocaleString()}
                    </td>
                    <td className="px-6 py-4">
                      <span
                        className={`inline-flex items-center rounded-md px-2 py-0.5 text-xs font-semibold border ${getActionBadgeColor(
                          log.action
                        )}`}
                      >
                        {log.action}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center space-x-2">
                        <span className="text-white font-medium">{log.admin_email}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-xs font-mono text-slate-300">
                      {log.target_table} {log.target_id ? `(${log.target_id.substring(0, 8)}...)` : ''}
                    </td>
                    <td className="px-6 py-4 text-right">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          setSelectedLog(log);
                        }}
                        className="rounded-lg border border-slate-700 bg-slate-800/80 px-2.5 py-1 text-xs text-slate-300 hover:text-white"
                      >
                        View Payload
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Payload Modal */}
      {selectedLog && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
          <div className="w-full max-w-lg rounded-2xl border border-slate-800 bg-[#0E131F] p-6 shadow-2xl">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3 mb-4">
              <h3 className="font-bold text-white text-base flex items-center">
                <Code className="h-4 w-4 mr-2 text-indigo-400" />
                Audit Record Metadata
              </h3>
              <button
                onClick={() => setSelectedLog(null)}
                className="rounded-lg p-1 text-slate-400 hover:text-white"
              >
                ✕
              </button>
            </div>

            <div className="space-y-3 text-xs">
              <div className="grid grid-cols-2 gap-2 text-slate-300">
                <div>
                  <span className="text-slate-500 block">Record ID</span>
                  <span className="font-mono text-white">{selectedLog.id}</span>
                </div>
                <div>
                  <span className="text-slate-500 block">Event Action</span>
                  <span className="font-semibold text-white">{selectedLog.action}</span>
                </div>
                <div>
                  <span className="text-slate-500 block">Administrator</span>
                  <span className="text-white">{selectedLog.admin_email}</span>
                </div>
                <div>
                  <span className="text-slate-500 block">Target Table</span>
                  <span className="font-mono text-white">{selectedLog.target_table}</span>
                </div>
              </div>

              <div>
                <span className="text-slate-500 block mb-1">Details JSON Payload</span>
                <pre className="rounded-xl border border-slate-800 bg-slate-950 p-3 font-mono text-[11px] text-indigo-300 overflow-x-auto max-h-60">
                  {JSON.stringify(selectedLog.details, null, 2)}
                </pre>
              </div>
            </div>

            <div className="mt-5 flex justify-end pt-3 border-t border-slate-800">
              <button
                onClick={() => setSelectedLog(null)}
                className="rounded-xl bg-slate-800 px-4 py-2 text-xs font-semibold text-white hover:bg-slate-700"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

