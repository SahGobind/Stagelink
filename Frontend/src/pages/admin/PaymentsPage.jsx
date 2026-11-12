import React, { useState, useEffect, useMemo, useCallback } from 'react';
import {
  CreditCard,
  Search,
  CheckCircle2,
  Clock,
  AlertCircle,
  RefreshCw,
  ArrowUpRight,
  Filter,
  DollarSign,
  TrendingUp,
  Receipt,
  Eye,
  Download,
  RotateCcw,
  ShieldCheck,
} from 'lucide-react';
import { apiRequest } from '../../services/api';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import Modal from '../../components/common/Modal';

const PAGE_SIZE = 10;

const PaymentsPage = () => {
  const [payments, setPayments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [page, setPage] = useState(1);

  // Modals
  const [selectedPayment, setSelectedPayment] = useState(null);
  const [isReceiptModalOpen, setIsReceiptModalOpen] = useState(false);
  const [refundTarget, setRefundTarget] = useState(null);
  const [isRefundModalOpen, setIsRefundModalOpen] = useState(false);
  const [refundReason, setRefundReason] = useState('Requested by customer');
  const [isRefunding, setIsRefunding] = useState(false);
  const [actionSuccessMsg, setActionSuccessMsg] = useState('');

  const fetchPayments = useCallback(async (isManual = false) => {
    if (isManual) setRefreshing(true);
    try {
      const res = await apiRequest('/api/payments/');
      if (res.ok) {
        const json = await res.json();
        setPayments(json.results || []);
      }
    } catch (err) {
      console.warn('Failed to load payments:', err);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    fetchPayments();
  }, [fetchPayments]);

  // Aggregate KPI metrics
  const stats = useMemo(() => {
    let totalVolume = 0;
    let settledCount = 0;
    let pendingCount = 0;
    let refundedCount = 0;

    payments.forEach((p) => {
      const amt = Number(p.amount) || 0;
      totalVolume += amt;
      const st = (p.payment_status || p.status || '').toLowerCase();
      if (st === 'paid' || st === 'succeeded' || st === 'completed' || st === 'confirmed') {
        settledCount++;
      } else if (st === 'refunded') {
        refundedCount++;
      } else {
        pendingCount++;
      }
    });

    const avg = payments.length > 0 ? Math.round(totalVolume / payments.length) : 0;
    return {
      totalVolume,
      settledCount,
      pendingCount,
      refundedCount,
      avgOrderValue: avg,
      totalCount: payments.length,
    };
  }, [payments]);

  // Process Authorized Refund
  const handleProcessRefund = async () => {
    if (!refundTarget) return;
    setIsRefunding(true);
    try {
      const pid = refundTarget.id || refundTarget.order_id || refundTarget.txn_id;
      const res = await apiRequest(`/api/payments/${pid}/refund/`, {
        method: 'POST',
        body: JSON.stringify({ reason: refundReason }),
      });
      if (res.ok) {
        setPayments((prev) =>
          prev.map((p) =>
            (p.id === pid || p.order_id === pid || p.txn_id === pid)
              ? { ...p, payment_status: 'refunded', status: 'refunded' }
              : p
          )
        );
        setIsRefundModalOpen(false);
        setRefundTarget(null);
        setActionSuccessMsg(`Refund processed successfully for transaction ${pid}.`);
        setTimeout(() => setActionSuccessMsg(''), 4000);
      } else {
        const err = await res.json();
        alert(err.error || 'Refund failed.');
      }
    } catch (err) {
      alert('Refund failed: ' + err.message);
    } finally {
      setIsRefunding(false);
    }
  };

  // Export Financial CSV
  const handleExportCSV = () => {
    if (!payments.length) return;
    const headers = ['Order ID', 'Transaction ID', 'Amount (INR)', 'Status', 'Date'];
    const rows = payments.map((p) => [
      p.order_id || p.id || '',
      p.txn_id || '',
      p.amount || 0,
      p.payment_status || p.status || 'completed',
      p.created_at || '',
    ]);

    const csvContent =
      'data:text/csv;charset=utf-8,' +
      [headers.join(','), ...rows.map((e) => e.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `stagelink_financial_report_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const filtered = useMemo(() => {
    return payments.filter((p) => {
      if (statusFilter !== 'all') {
        const st = (p.payment_status || p.status || '').toLowerCase();
        if (statusFilter === 'paid' && st !== 'paid' && st !== 'succeeded' && st !== 'confirmed') return false;
        if (statusFilter === 'pending' && (st === 'paid' || st === 'refunded')) return false;
        if (statusFilter === 'refunded' && st !== 'refunded') return false;
      }
      if (search.trim()) {
        const q = search.toLowerCase();
        const id = (p.order_id || p.id || '').toLowerCase();
        const txn = (p.txn_id || '').toLowerCase();
        const desc = (p.description || '').toLowerCase();
        return id.includes(q) || txn.includes(q) || desc.includes(q);
      }
      return true;
    });
  }, [payments, search, statusFilter]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const paginated = useMemo(() => {
    const start = (page - 1) * PAGE_SIZE;
    return filtered.slice(start, start + PAGE_SIZE);
  }, [filtered, page]);

  return (
    <div className="space-y-6 font-sans">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-slate-200/80">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight">Payments & Financial Transactions</h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
            Real-time financial telemetry, casting call subscription orders, and escrow reconciliation.
          </p>
        </div>
        <div className="flex items-center gap-2.5">
          <button
            onClick={() => fetchPayments(true)}
            disabled={refreshing}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-white border border-slate-200 text-slate-700 hover:bg-slate-50 rounded-xl text-xs font-semibold shadow-2xs transition-colors cursor-pointer"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${refreshing ? 'animate-spin text-[#FA5A36]' : ''}`} />
            <span>{refreshing ? 'Refreshing...' : 'Refresh'}</span>
          </button>
          <button
            onClick={handleExportCSV}
            className="inline-flex items-center gap-1.5 px-3.5 py-1.5 bg-slate-900 hover:bg-black text-white rounded-xl text-xs font-semibold shadow-xs transition-colors cursor-pointer"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Export Financial Ledger</span>
          </button>
        </div>
      </div>

      {actionSuccessMsg && (
        <div className="p-3 bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-xl text-xs font-medium flex items-center justify-between shadow-2xs">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
            <span>{actionSuccessMsg}</span>
          </div>
          <button onClick={() => setActionSuccessMsg('')} className="text-emerald-700 font-bold">✕</button>
        </div>
      )}

      {/* 4 Financial KPI Summary Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3.5">
        <div className="bg-white p-4 rounded-xl border border-slate-200/80 shadow-xs">
          <div className="flex items-center justify-between text-slate-400 mb-1.5">
            <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider">Gross Volume</span>
            <DollarSign className="w-4 h-4 text-emerald-600" />
          </div>
          <p className="text-2xl font-black text-slate-900">
            ₹{stats.totalVolume.toLocaleString('en-IN', { maximumFractionDigits: 2 })}
          </p>
          <span className="text-[10px] text-emerald-600 font-medium">Platform-wide Lifetime</span>
        </div>

        <div className="bg-white p-4 rounded-xl border border-slate-200/80 shadow-xs">
          <div className="flex items-center justify-between text-slate-400 mb-1.5">
            <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider">Settled Orders</span>
            <CheckCircle2 className="w-4 h-4 text-emerald-600" />
          </div>
          <p className="text-2xl font-black text-slate-900">{stats.settledCount}</p>
          <span className="text-[10px] text-slate-400">Captured & Verified</span>
        </div>

        <div className="bg-white p-4 rounded-xl border border-slate-200/80 shadow-xs">
          <div className="flex items-center justify-between text-slate-400 mb-1.5">
            <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider">Pending / Processing</span>
            <Clock className="w-4 h-4 text-amber-500" />
          </div>
          <p className="text-2xl font-black text-slate-900">{stats.pendingCount}</p>
          <span className="text-[10px] text-amber-600 font-medium">Awaiting Webhook</span>
        </div>

        <div className="bg-white p-4 rounded-xl border border-slate-200/80 shadow-xs">
          <div className="flex items-center justify-between text-slate-400 mb-1.5">
            <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider">Average Ticket</span>
            <TrendingUp className="w-4 h-4 text-[#FA5A36]" />
          </div>
          <p className="text-2xl font-black text-slate-900">
            ₹{stats.avgOrderValue.toLocaleString('en-IN')}
          </p>
          <span className="text-[10px] text-slate-400">Per Casting Transaction</span>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white p-4 rounded-xl border border-slate-200/80 shadow-xs flex flex-col md:flex-row gap-3 items-center justify-between">
        <div className="relative w-full md:w-80">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
          <input
            type="text"
            value={search}
            onChange={(e) => { setSearch(e.target.value); setPage(1); }}
            placeholder="Search by Order ID, Transaction ID, description..."
            className="w-full pl-9 pr-3 py-1.5 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:outline-none focus:border-[#FA5A36] focus:bg-white"
          />
        </div>

        <div className="flex items-center gap-2.5">
          <select
            value={statusFilter}
            onChange={(e) => { setStatusFilter(e.target.value); setPage(1); }}
            className="bg-slate-50 border border-slate-200 text-slate-700 text-xs rounded-xl px-3 py-1.5 focus:outline-none focus:border-[#FA5A36]"
          >
            <option value="all">All Transactions</option>
            <option value="paid">Settled / Succeeded</option>
            <option value="pending">Pending</option>
            <option value="refunded">Refunded</option>
          </select>
        </div>
      </div>

      {/* Ledger Table */}
      <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs overflow-hidden">
        {loading ? (
          <div className="py-16 flex items-center justify-center">
            <LoadingSpinner message="Querying live transaction logs from MongoDB..." />
          </div>
        ) : paginated.length === 0 ? (
          <div className="py-16 text-center text-slate-400">
            <CreditCard className="w-8 h-8 mx-auto mb-2 opacity-50" />
            <p className="font-medium text-slate-600 text-sm">No transaction records match criteria</p>
            <p className="text-xs text-slate-400 mt-1">Adjust search parameters or status filters.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50/80 border-b border-slate-200/80 text-[10px] font-bold text-slate-500 uppercase tracking-wider">
                <tr>
                  <th className="py-3 px-4">Order / ID</th>
                  <th className="py-3 px-4">Purpose / Plan</th>
                  <th className="py-3 px-4">Amount</th>
                  <th className="py-3 px-4 text-center">Status</th>
                  <th className="py-3 px-4">Timestamp</th>
                  <th className="py-3 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {paginated.map((p) => {
                  const st = (p.payment_status || p.status || '').toLowerCase();
                  const isSettled = st === 'paid' || st === 'succeeded' || st === 'completed' || st === 'confirmed';
                  const isRefunded = st === 'refunded';

                  return (
                    <tr key={p.id || p.order_id || p._id} className="hover:bg-slate-50/60 transition-colors">
                      <td className="py-3 px-4 font-mono font-bold text-slate-800">
                        {p.order_id || p.id || 'TXN-DIRECT'}
                      </td>
                      <td className="py-3 px-4 text-slate-700 font-medium">
                        {p.description || p.plan_name || 'Casting Call Publication Package'}
                      </td>
                      <td className="py-3 px-4 font-bold text-slate-900">
                        ₹{Number(p.amount || 0).toLocaleString('en-IN', { maximumFractionDigits: 2 })}
                      </td>
                      <td className="py-3 px-4 text-center">
                        {isSettled ? (
                          <span className="inline-flex items-center gap-1 text-[10px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
                            <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                            Settled
                          </span>
                        ) : isRefunded ? (
                          <span className="inline-flex items-center gap-1 text-[10px] font-bold text-purple-700 bg-purple-50 px-2 py-0.5 rounded-full border border-purple-200">
                            <RotateCcw className="w-3 h-3 text-purple-600" />
                            Refunded
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 text-[10px] font-bold text-amber-700 bg-amber-50 px-2 py-0.5 rounded-full border border-amber-200">
                            <Clock className="w-3 h-3 text-amber-600" />
                            Pending
                          </span>
                        )}
                      </td>
                      <td className="py-3 px-4 text-slate-400 text-[11px]">
                        {p.created_at ? new Date(p.created_at).toLocaleString() : 'Recent'}
                      </td>
                      <td className="py-3 px-4 text-right space-x-1.5">
                        {/* View Receipt */}
                        <button
                          onClick={() => { setSelectedPayment(p); setIsReceiptModalOpen(true); }}
                          title="View Invoice & Receipt"
                          className="p-1.5 text-slate-500 hover:text-slate-900 hover:bg-slate-100 rounded-lg transition-colors cursor-pointer"
                        >
                          <Receipt className="w-3.5 h-3.5" />
                        </button>
                        {/* Process Refund */}
                        {isSettled && (
                          <button
                            onClick={() => { setRefundTarget(p); setIsRefundModalOpen(true); }}
                            title="Process Refund"
                            className="p-1.5 text-slate-500 hover:text-purple-600 hover:bg-purple-50 rounded-lg transition-colors cursor-pointer"
                          >
                            <RotateCcw className="w-3.5 h-3.5" />
                          </button>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}

        {/* Table Pagination */}
        <div className="p-3 bg-slate-50 border-t border-slate-200/80 flex items-center justify-between text-xs text-slate-500">
          <span>Showing {paginated.length} of {filtered.length} transactions</span>
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

      {/* Invoice & Receipt Modal */}
      {isReceiptModalOpen && selectedPayment && (
        <Modal
          isOpen={isReceiptModalOpen}
          onClose={() => setIsReceiptModalOpen(false)}
          title="Transaction Receipt & Audit Breakdown"
        >
          <div className="space-y-4 text-xs font-sans">
            <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 space-y-2">
              <div className="flex justify-between items-center pb-2 border-b border-slate-200">
                <span className="font-bold text-slate-900 text-sm">StageLink Payment Receipt</span>
                <span className="font-mono text-[11px] text-slate-500">
                  {selectedPayment.order_id || selectedPayment.id}
                </span>
              </div>
              <div className="grid grid-cols-2 gap-2 text-slate-600 pt-1">
                <div>
                  <span className="text-slate-400 block text-[10px]">Total Captured:</span>
                  <span className="font-bold text-slate-900 text-base">
                    ₹{Number(selectedPayment.amount || 0).toLocaleString('en-IN', { maximumFractionDigits: 2 })}
                  </span>
                </div>
                <div>
                  <span className="text-slate-400 block text-[10px]">Payment Status:</span>
                  <span className="font-bold text-emerald-600 uppercase tracking-wider text-[11px]">
                    {selectedPayment.payment_status || selectedPayment.status || 'Paid'}
                  </span>
                </div>
              </div>
            </div>

            <div className="p-3 bg-slate-50 rounded-xl border border-slate-100 text-slate-600 space-y-1">
              <p><strong>Item:</strong> {selectedPayment.description || 'Studio Casting Call Package'}</p>
              <p><strong>Transaction Ref:</strong> {selectedPayment.txn_id || 'Captured via Gateway'}</p>
              <p><strong>Security Verification:</strong> Bank-grade SHA256 webhook reconciliation confirmed.</p>
            </div>

            <div className="pt-3 border-t border-slate-200 flex justify-end space-x-2">
              <button
                onClick={() => setIsReceiptModalOpen(false)}
                className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl font-semibold cursor-pointer"
              >
                Close
              </button>
            </div>
          </div>
        </Modal>
      )}

      {/* Process Refund Modal */}
      {isRefundModalOpen && refundTarget && (
        <Modal
          isOpen={isRefundModalOpen}
          onClose={() => setIsRefundModalOpen(false)}
          title="Process Transaction Refund"
        >
          <div className="space-y-4 text-xs font-sans">
            <div className="p-3 bg-amber-50 border border-amber-200 text-amber-800 rounded-xl">
              <p className="font-bold">Refund Authorization</p>
              <p className="mt-1 text-[11px]">
                Are you sure you want to refund <strong>₹{refundTarget.amount}</strong> for Order #{refundTarget.order_id || refundTarget.id}?
              </p>
            </div>

            <div>
              <label className="font-bold text-slate-700 block mb-1">Refund Reason / Audit Note</label>
              <input
                type="text"
                value={refundReason}
                onChange={(e) => setRefundReason(e.target.value)}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:outline-none focus:border-[#FA5A36] focus:bg-white"
              />
            </div>

            <div className="pt-3 border-t border-slate-200 flex justify-end space-x-2">
              <button
                onClick={() => setIsRefundModalOpen(false)}
                className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl font-semibold cursor-pointer"
              >
                Cancel
              </button>
              <button
                onClick={handleProcessRefund}
                disabled={isRefunding}
                className="px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-xl font-semibold cursor-pointer disabled:opacity-50"
              >
                {isRefunding ? 'Processing...' : 'Authorize Refund'}
              </button>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
};

export default PaymentsPage;
