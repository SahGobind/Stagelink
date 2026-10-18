import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  PlusCircle,
  Edit,
  ExternalLink,
  Trash2,
  Search,
  AlertTriangle,
  CheckCircle2,
  Briefcase,
  CreditCard,
  Clock,
  XCircle,
  ShieldCheck,
  RefreshCw,
  Sparkles,
} from 'lucide-react';
import PageContainer from '../../components/layout/PageContainer';
import Button from '../../components/common/Button';
import Badge from '../../components/common/Badge';
import Modal from '../../components/common/Modal';
import { mockOpportunities } from '../../data/mockOpportunities';
import { getCustomOpportunities } from '../../utils/paymentAccess';

const AdminOpportunitiesPage = () => {
  const [opportunities, setOpportunities] = useState(() => {
    const custom = getCustomOpportunities();
    const ids = new Set(custom.map((c) => c.id));
    return [...custom, ...mockOpportunities.filter((m) => !ids.has(m.id))];
  });
  const [search, setSearch] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [isLoading, setIsLoading] = useState(true);

  // Delete confirmation modal state
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [toastMessage, setToastMessage] = useState('');

  const showToast = (msg) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(''), 3500);
  };

  // Fetch opportunities from backend and merge
  useEffect(() => {
    const fetchBackendOpps = async () => {
      try {
        const response = await fetch('/api/opportunities/recruiter');
        if (response.ok) {
          const data = await response.json();
          if (data.opportunities && Array.isArray(data.opportunities)) {
            // Map backend opportunities to table schema
            const backendFormatted = data.opportunities.map((o) => ({
              id: o.id,
              title: `${o.productionType} — ${Array.isArray(o.talentNeeded) ? o.talentNeeded.join(', ') : o.talentNeeded}`,
              productionCompany: o.productionCompany,
              location: o.location,
              category: o.productionCategory,
              compensation: `${o.currency === 'INR' ? '₹' : o.currency || '₹'}${o.compensation} / ${o.rateUnit || 'talent'}`,
              deadline: o.shootDate || 'Open',
              status: o.listingStatus || 'pending_payment',
              listingStatus: o.listingStatus || 'pending_payment',
              paymentStatus: o.paymentStatus || 'pending',
              paymentOrderId: o.paymentOrderId,
              listingFee: o.listingFee,
              isBackend: true,
            }));

            // Merge with local mock
            setOpportunities((prev) => {
              const ids = new Set(backendFormatted.map((b) => b.id));
              const nonDuplicatePrev = prev.filter((p) => !ids.has(p.id));
              return [...backendFormatted, ...nonDuplicatePrev];
            });
          }
        }
      } catch (err) {
        console.warn('Backend opportunity fetch fallback to local mock:', err);
      } finally {
        setIsLoading(false);
      }
    };

    fetchBackendOpps();
  }, []);

  const filteredOpps = opportunities.filter((opp) => {
    if (search.trim()) {
      const q = search.toLowerCase();
      const matchTitle = (opp.title || '').toLowerCase().includes(q);
      const matchCompany = (opp.productionCompany || '').toLowerCase().includes(q);
      if (!matchTitle && !matchCompany) return false;
    }

    const currentStatus = opp.listingStatus || opp.status || 'published';
    if (filterStatus !== 'all') {
      if (filterStatus === 'published' && currentStatus !== 'published' && currentStatus !== 'open') return false;
      if (filterStatus === 'pending_payment' && currentStatus !== 'pending_payment') return false;
      if (filterStatus === 'payment_failed' && currentStatus !== 'payment_failed') return false;
      if (filterStatus === 'pending_review' && currentStatus !== 'pending_review') return false;
    }
    return true;
  });

  const handleDeleteClick = (opp) => {
    setDeleteTarget(opp);
    setIsDeleteModalOpen(true);
  };

  const handleConfirmDelete = () => {
    if (!deleteTarget) return;
    setOpportunities((prev) => prev.filter((o) => o.id !== deleteTarget.id));
    setIsDeleteModalOpen(false);
    showToast(`Casting listing "${deleteTarget.title}" deleted.`);
    setDeleteTarget(null);
  };

  const renderStatusBadge = (opp) => {
    const status = opp.listingStatus || (opp.status === 'open' ? 'published' : opp.status);
    switch (status) {
      case 'published':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
            <CheckCircle2 className="w-3 h-3" />
            Published
          </span>
        );
      case 'pending_payment':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-amber-50 text-amber-700 border border-amber-200">
            <Clock className="w-3 h-3" />
            Pending Payment
          </span>
        );
      case 'payment_failed':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-rose-50 text-rose-700 border border-rose-200">
            <XCircle className="w-3 h-3" />
            Payment Failed
          </span>
        );
      case 'pending_review':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-blue-50 text-blue-700 border border-blue-200">
            <ShieldCheck className="w-3 h-3" />
            Pending Review
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-gray-100 text-gray-700">
            {status}
          </span>
        );
    }
  };

  return (
    <PageContainer maxWidth="7xl" className="space-y-6 text-left pb-12">
      {/* Toast */}
      {toastMessage && (
        <div
          role="status"
          aria-live="polite"
          className="fixed bottom-6 right-6 z-50 px-5 py-3 rounded-2xl shadow-xl border bg-gray-900 text-white border-white/20 flex items-center gap-2.5 animate-in fade-in"
        >
          <CheckCircle2 className="w-4 h-4 text-emerald-400" />
          <span className="text-xs font-semibold">{toastMessage}</span>
        </div>
      )}

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-gray-200">
        <div className="space-y-1">
          <h1 className="text-2xl font-bold font-serif text-gray-900 tracking-tight">
            Production Opportunities &amp; Casting Calls
          </h1>
          <p className="text-xs text-gray-500">
            Publish casting calls, manage production listings, track Juspay payments, and review talent submissions.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Link to="/post-job">
            <Button className="space-x-2 text-xs bg-brand-pink hover:bg-rose-700 text-white shadow-xs">
              <PlusCircle className="w-4 h-4" />
              <span>Announce Work</span>
            </Button>
          </Link>
        </div>
      </div>

      {/* Filter toolbar */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="w-4 h-4 text-gray-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search casting calls by title or production company..."
            className="w-full pl-10 pr-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-xs text-gray-900 placeholder-gray-400 focus:outline-hidden focus:ring-2 focus:ring-pink-100 focus:border-brand-pink focus:bg-white"
          />
        </div>
        <select
          value={filterStatus}
          onChange={(e) => setFilterStatus(e.target.value)}
          aria-label="Filter by listing status"
          className="px-3.5 py-2.5 bg-white border border-gray-200 rounded-xl text-xs font-medium text-gray-900 focus:outline-hidden focus:ring-2 focus:ring-pink-100 cursor-pointer"
        >
          <option value="all">All Statuses</option>
          <option value="published">Published</option>
          <option value="pending_payment">Pending Payment</option>
          <option value="payment_failed">Payment Failed</option>
          <option value="pending_review">Pending Review</option>
        </select>
      </div>

      {/* Responsive Table / Card Container */}
      <div className="bg-white rounded-2xl border border-gray-200 shadow-xs overflow-hidden">
        {filteredOpps.length === 0 ? (
          <div className="p-12 text-center space-y-3">
            <Briefcase className="w-10 h-10 mx-auto text-gray-300" />
            <h3 className="text-base font-bold text-gray-900 font-serif">No casting calls found</h3>
            <p className="text-xs text-gray-500">Try adjusting your search query or status filter.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-gray-50 border-b border-gray-200 text-[10px] font-bold text-gray-500 uppercase tracking-wider">
                <tr>
                  <th className="px-5 py-3.5">Title &amp; Production</th>
                  <th className="px-4 py-3.5">Category</th>
                  <th className="px-4 py-3.5">Compensation</th>
                  <th className="px-4 py-3.5">Shoot Date</th>
                  <th className="px-4 py-3.5">Listing Status</th>
                  <th className="px-5 py-3.5 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {filteredOpps.map((opp) => {
                  const isPendingPay = opp.listingStatus === 'pending_payment';
                  const isFailedPay = opp.listingStatus === 'payment_failed';

                  return (
                    <tr key={opp.id} className="hover:bg-gray-50/70 transition-colors">
                      <td className="px-5 py-3.5">
                        <p className="font-bold text-gray-900 text-xs">{opp.title}</p>
                        <p className="text-[11px] text-gray-500">
                          {opp.productionCompany} • {opp.location}
                        </p>
                      </td>
                      <td className="px-4 py-3.5 text-gray-700 font-medium">
                        {opp.category || opp.categoryKey}
                      </td>
                      <td className="px-4 py-3.5 text-gray-700 font-mono text-[11px]">
                        {opp.compensation || 'Standard Union'}
                      </td>
                      <td className="px-4 py-3.5 text-gray-600 font-mono text-[11px]">
                        {opp.deadline || opp.shootDate}
                      </td>
                      <td className="px-4 py-3.5">{renderStatusBadge(opp)}</td>
                      <td className="px-5 py-3.5 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          {/* If pending payment or failed, show direct Resume Payment action */}
                          {(isPendingPay || isFailedPay) && (
                            <Link
                              to={`/payment/callback?order_id=${encodeURIComponent(opp.paymentOrderId || opp.id)}`}
                              className="px-2.5 py-1 rounded-lg bg-pink-50 hover:bg-pink-100 text-brand-pink text-[11px] font-bold border border-pink-200 transition-colors"
                              title="Resume Payment with Juspay"
                            >
                              Resume Pay
                            </Link>
                          )}

                          {/* Ranked Candidates Link */}
                          <Link
                            to={`/admin/opportunities/${opp.id}/candidates`}
                            className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-pink-50 hover:bg-pink-100 text-brand-pink text-[11px] font-bold border border-pink-200 transition-colors"
                            title="Review & Match Ranked Candidates"
                            aria-label={`Ranked Candidates for ${opp.title}`}
                          >
                            <Sparkles className="w-3.5 h-3.5 text-brand-pink" />
                            <span>Ranked Candidates</span>
                          </Link>

                          <Link
                            to={`/opportunities/${opp.id}`}
                            className="p-1.5 rounded-lg text-gray-400 hover:text-gray-900 hover:bg-gray-100 transition-colors"
                            title="View Public Casting Page"
                            aria-label={`View public casting page for ${opp.title}`}
                          >
                            <ExternalLink className="w-4 h-4" />
                          </Link>
                          <Link
                            to={`/admin/opportunities/${opp.id}/edit`}
                            className="p-1.5 rounded-lg text-gray-400 hover:text-gray-900 hover:bg-gray-100 transition-colors"
                            title="Edit Listing"
                            aria-label={`Edit ${opp.title}`}
                          >
                            <Edit className="w-4 h-4" />
                          </Link>
                          <button
                            type="button"
                            onClick={() => handleDeleteClick(opp)}
                            className="p-1.5 rounded-lg text-gray-400 hover:text-rose-600 hover:bg-rose-50 transition-colors cursor-pointer"
                            title="Delete Listing"
                            aria-label={`Delete ${opp.title}`}
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Confirmation Dialog for Destructive Action */}
      <Modal
        isOpen={isDeleteModalOpen}
        onClose={() => setIsDeleteModalOpen(false)}
        title="Confirm Casting Call Removal"
      >
        <div className="space-y-4 text-left">
          <p className="text-xs text-gray-600">
            Are you sure you want to remove the listing{' '}
            <strong className="text-gray-900 font-semibold">{deleteTarget?.title}</strong>?
          </p>
          <div className="p-3 bg-red-50 border border-red-200 rounded-xl flex items-center gap-2 text-xs text-red-700">
            <AlertTriangle className="w-4 h-4 shrink-0" />
            <span>This action cannot be undone. Any active auditions will be archived.</span>
          </div>
          <div className="flex justify-end gap-2 pt-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setIsDeleteModalOpen(false)}
              className="text-xs"
            >
              Cancel
            </Button>
            <Button
              variant="danger"
              size="sm"
              onClick={handleConfirmDelete}
              className="text-xs bg-red-600 hover:bg-red-700 text-white"
            >
              Delete Casting Call
            </Button>
          </div>
        </div>
      </Modal>
    </PageContainer>
  );
};

export default AdminOpportunitiesPage;
