import React, { useState, useEffect, useMemo, useCallback } from 'react';
import {
  Activity,
  Search,
  Filter,
  ShieldCheck,
  ShieldAlert,
  Clock,
  Eye,
  Download,
  RefreshCw,
  Lock,
  User,
  CheckCircle2,
  XCircle,
  FileText,
} from 'lucide-react';
import { apiRequest } from '../../services/api';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import Modal from '../../components/common/Modal';

const PAGE_SIZE = 12;

const ActivityLogsPage = () => {
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [search, setSearch] = useState('');
  const [actionFilter, setActionFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');
  const [page, setPage] = useState(1);

  // Detail Modal
  const [selectedLog, setSelectedLog] = useState(null);
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);

  const fetchLogs = useCallback(async (isManual = false) => {
    if (isManual) setRefreshing(true);
    try {
      const res = await apiRequest('/api/users/audit-logs/');
      if (res.ok) {
        const json = await res.json();
        setLogs(Array.isArray(json) ? json : json.results || []);
      }
    } catch (err) {
      console.warn('Failed to load audit logs:', err);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    fetchLogs();
  }, [fetchLogs]);

  const handleExportJSON = () => {
    if (!logs.length) return;
    const jsonStr = JSON.stringify(logs, null, 2);
    const blob = new Blob([jsonStr], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `stagelink-audit-trail-${new Date().toISOString().split('T')[0]}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const filteredLogs = useMemo(() => {
    return logs.filter((log) => {
      if (search.trim()) {
        const q = search.toLowerCase();
        const action = (log.action || '').toLowerCase();
        const actor = (log.actor?.email || log.actor?.fullName || '').toLowerCase();
        const resId = (log.resource_id || '').toLowerCase();
        if (!action.includes(q) && !actor.includes(q) && !resId.includes(q)) return false;
      }
      if (actionFilter !== 'all') {
        const act = (log.action || '').toLowerCase();
        if (!act.includes(actionFilter.toLowerCase())) return false;
      }
      if (statusFilter !== 'all') {
        const st = (log.status || 'SUCCESS').toLowerCase();
        if (st !== statusFilter.toLowerCase()) return false;
      }
      return true;
    });
  }, [logs, search, actionFilter, statusFilter]);

  const totalPages = Math.max(1, Math.ceil(filteredLogs.length / PAGE_SIZE));
  const paginated = useMemo(() => {
    const s = (page - 1) * PAGE_SIZE;
    return filteredLogs.slice(s, s + PAGE_SIZE);
  }, [filteredLogs, page]);

  return (
    <div className="space-y-6 font-sans">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-slate-200/80">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight">System Activity & Audit Logs</h1>
            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-slate-100 text-slate-700 border border-slate-200">
              <Lock className="w-3 h-3 text-slate-500" />
              Immutable Trail
            </span>
          </div>
          <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
            Cryptographically sealed security log documenting Super Admin actions, permission adjustments, and critical record changes.
          </p>
        </div>
        <div className="flex items-center gap-2.5">
          <button
            onClick={() => fetchLogs(true)}
            disabled={refreshing}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-white border border-slate-200 text-slate-700 hover:bg-slate-50 rounded-xl text-xs font-semibold shadow-2xs transition-colors cursor-pointer"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${refreshing ? 'animate-spin text-[#FA5A36]' : ''}`} />
            <span>{refreshing ? 'Refreshing...' : 'Refresh'}</span>
          </button>
          <button
            onClick={handleExportJSON}
            className="inline-flex items-center gap-1.5 px-3.5 py-1.5 bg-slate-900 hover:bg-black text-white rounded-xl text-xs font-semibold shadow-xs transition-colors cursor-pointer"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Export Audit Trail</span>
          </button>
        </div>
      </div>

      {/* Search & Filters */}
      <div className="bg-white p-4 rounded-xl border border-slate-200/80 shadow-xs flex flex-col md:flex-row gap-3 items-center justify-between">
        <div className="relative w-full md:w-80">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
          <input
            type="text"
            value={search}
            onChange={(e) => { setSearch(e.target.value); setPage(1); }}
            placeholder="Search by action, administrator, resource ID..."
            className="w-full pl-9 pr-3 py-1.5 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:outline-none focus:border-[#FA5A36] focus:bg-white"
          />
        </div>

        <div className="flex items-center gap-2.5">
          <select
            value={actionFilter}
            onChange={(e) => { setActionFilter(e.target.value); setPage(1); }}
            className="bg-slate-50 border border-slate-200 text-slate-700 text-xs rounded-xl px-3 py-1.5 focus:outline-none focus:border-[#FA5A36]"
          >
            <option value="all">All Action Categories</option>
            <option value="user">User Operations</option>
            <option value="verification">Verifications</option>
            <option value="settings">Settings Changes</option>
            <option value="auth">Authentication & Login</option>
            <option value="payment">Payment Events</option>
          </select>

          <select
            value={statusFilter}
            onChange={(e) => { setStatusFilter(e.target.value); setPage(1); }}
            className="bg-slate-50 border border-slate-200 text-slate-700 text-xs rounded-xl px-3 py-1.5 focus:outline-none focus:border-[#FA5A36]"
          >
            <option value="all">All Statuses</option>
            <option value="success">Success</option>
            <option value="failed">Failed / Denied</option>
          </select>
        </div>
      </div>

      {/* Logs Table */}
      <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs overflow-hidden">
        {loading ? (
          <div className="py-16 flex items-center justify-center">
            <LoadingSpinner message="Querying tamper-evident audit logs..." />
          </div>
        ) : paginated.length === 0 ? (
          <div className="py-16 text-center text-slate-400">
            <Activity className="w-8 h-8 mx-auto mb-2 opacity-50" />
            <p className="font-bold text-slate-800 text-sm">No activity records found</p>
            <p className="text-xs text-slate-400 mt-1">Adjust search parameters or clear filters.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50/80 border-b border-slate-200/80 text-[10px] font-bold text-slate-500 uppercase tracking-wider">
                <tr>
                  <th className="py-3 px-4">Action Event</th>
                  <th className="py-3 px-4">Admin Account</th>
                  <th className="py-3 px-4">Affected Resource</th>
                  <th className="py-3 px-4 text-center">Status</th>
                  <th className="py-3 px-4">Timestamp</th>
                  <th className="py-3 px-4 text-right">Inspection</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 font-mono text-[11px]">
                {paginated.map((log, idx) => {
                  const isSuccess = (log.status || 'SUCCESS').toUpperCase() === 'SUCCESS';
                  return (
                    <tr key={log.id || log._id || idx} className="hover:bg-slate-50/60 transition-colors font-sans">
                      <td className="py-3 px-4 font-bold text-slate-900 flex items-center space-x-2">
                        <span className={`w-2 h-2 rounded-full ${isSuccess ? 'bg-emerald-500' : 'bg-rose-500'}`} />
                        <span>{log.action}</span>
                      </td>
                      <td className="py-3 px-4 text-slate-700">
                        {log.actor?.email || log.actor?.fullName || 'Super Admin'}
                      </td>
                      <td className="py-3 px-4 font-mono text-[11px] text-slate-500">
                        {log.resource_type || 'record'}: {log.resource_id || 'N/A'}
                      </td>
                      <td className="py-3 px-4 text-center">
                        <span
                          className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                            isSuccess
                              ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                              : 'bg-rose-50 text-rose-700 border border-rose-200'
                          }`}
                        >
                          {log.status || 'SUCCESS'}
                        </span>
                      </td>
                      <td className="py-3 px-4 text-slate-400 text-[11px]">
                        {log.timestamp ? new Date(log.timestamp).toLocaleString() : 'Recent'}
                      </td>
                      <td className="py-3 px-4 text-right">
                        <button
                          onClick={() => { setSelectedLog(log); setIsDetailModalOpen(true); }}
                          className="p-1.5 text-slate-500 hover:text-slate-900 hover:bg-slate-100 rounded-lg transition-colors cursor-pointer"
                          title="Inspect Payload"
                        >
                          <Eye className="w-3.5 h-3.5" />
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}

        {/* Pagination */}
        <div className="p-3 bg-slate-50 border-t border-slate-200/80 flex items-center justify-between text-xs text-slate-500 font-sans">
          <span>Showing {paginated.length} of {filteredLogs.length} audit events</span>
          <div className="flex items-center space-x-1.5">
            <button
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              disabled={page === 1}
              className="px-2.5 py-1 bg-white border border-slate-200 rounded-lg text-xs font-semibold disabled:opacity-50"
            >
              Previous
            </button>
            <span className="font-bold px-2">{page} / {totalPages}</span>
            <button
              onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
              disabled={page === totalPages}
              className="px-2.5 py-1 bg-white border border-slate-200 rounded-lg text-xs font-semibold disabled:opacity-50"
            >
              Next
            </button>
          </div>
        </div>
      </div>

      {/* Inspect Modal */}
      {isDetailModalOpen && selectedLog && (
        <Modal
          isOpen={isDetailModalOpen}
          onClose={() => setIsDetailModalOpen(false)}
          title="Audit Event Details & Payload"
        >
          <div className="space-y-3.5 text-xs font-sans">
            <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 space-y-1">
              <p><strong>Action:</strong> <span className="font-mono text-[#FA5A36]">{selectedLog.action}</span></p>
              <p><strong>Actor:</strong> {selectedLog.actor?.email || 'Super Admin'}</p>
              <p><strong>Resource:</strong> {selectedLog.resource_type} ({selectedLog.resource_id})</p>
              <p><strong>Timestamp:</strong> {selectedLog.timestamp}</p>
              <p><strong>IP Address:</strong> {selectedLog.ip_address || '127.0.0.1'}</p>
            </div>

            <div>
              <span className="font-bold text-slate-700 block mb-1">Payload / Details:</span>
              <pre className="p-3 bg-slate-900 text-slate-200 rounded-xl text-[11px] font-mono overflow-x-auto max-h-48">
                {JSON.stringify(selectedLog.details || {}, null, 2)}
              </pre>
            </div>

            <div className="pt-3 border-t border-slate-200 flex justify-end">
              <button
                onClick={() => setIsDetailModalOpen(false)}
                className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl font-semibold cursor-pointer"
              >
                Close
              </button>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
};

export default ActivityLogsPage;
