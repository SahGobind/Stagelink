import React, { useState, useEffect, useMemo } from 'react';
import { Link, useNavigate } from 'react-router-dom';
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
  Copy,
  Archive,
  Ban,
  Eye,
  Users,
  Award,
  Layers,
  FileText,
} from 'lucide-react';
import PageContainer from '../../components/layout/PageContainer';
import Button from '../../components/common/Button';
import Badge from '../../components/common/Badge';
import Modal from '../../components/common/Modal';
import OpportunityPreviewModal from '../../components/opportunities/OpportunityPreviewModal';
import { mockOpportunities } from '../../data/mockOpportunities';
import { getAllApplications } from '../../data/mockApplications';
import { getCustomOpportunities, getDeletedOpportunityIds } from '../../utils/paymentAccess';
import { castingService } from '../../services/castingService';

const AdminOpportunitiesPage = () => {
  const navigate = useNavigate();
  const [opportunities, setOpportunities] = useState(() => {
    const custom = getCustomOpportunities();
    const drafts = castingService.getDrafts();
    const deletedIds = getDeletedOpportunityIds();
    const ids = new Set([...custom.map((c) => c.id), ...drafts.map((d) => d.id)]);
    return [...custom, ...drafts, ...mockOpportunities.filter((m) => !ids.has(m.id))].filter(
      (o) => !deletedIds.has(String(o?.id)) && !deletedIds.has(String(o?.refId))
    );
  });

  const [search, setSearch] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [isLoading, setIsLoading] = useState(true);

  // Preview modal state
  const [previewOpp, setPreviewOpp] = useState(null);
  const [isPreviewModalOpen, setIsPreviewModalOpen] = useState(false);

  // Delete modal state
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);

  // Close opportunity confirmation modal
  const [closeTarget, setCloseTarget] = useState(null);
  const [isCloseModalOpen, setIsCloseModalOpen] = useState(false);

  const [toastMessage, setToastMessage] = useState('');

  const showToast = (msg) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(''), 3500);
  };

  const applications = useMemo(() => getAllApplications(), []);

  // Fetch opportunities from backend and merge
  const refreshOpportunities = async () => {
    setIsLoading(true);
    try {
      const data = await castingService.getRecruiterOpportunities();
      if (Array.isArray(data) && data.length > 0) {
        setOpportunities(data);
      }
    } catch (err) {
      console.warn('Fallback to local opportunity state:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    refreshOpportunities();
  }, []);

  // Compute 7 Required Metric Stat Cards
  const stats = useMemo(() => {
    const total = opportunities.length;
    const published = opportunities.filter((o) => {
      const s = (o.listingStatus || o.status || '').toLowerCase();
      return s === 'published' || s === 'open';
    }).length;

    const drafts = opportunities.filter((o) => {
      const s = (o.listingStatus || o.status || '').toLowerCase();
      return s === 'draft';
    }).length;

    const pendingPayment = opportunities.filter((o) => {
      const s = (o.listingStatus || o.status || '').toLowerCase();
      return s === 'pending_payment';
    }).length;

    const pendingReview = opportunities.filter((o) => {
      const s = (o.listingStatus || o.status || '').toLowerCase();
      return s === 'pending_review';
    }).length;

    const totalApplications = applications.length;
    const shortlistedCount = applications.filter(
      (a) => (a.status || '').toLowerCase() === 'shortlisted'
    ).length;

    return {
      total,
      published,
      drafts,
      pendingPayment,
      pendingReview,
      totalApplications,
      shortlistedCount,
    };
  }, [opportunities, applications]);

  // Filtered listings
  const filteredOpps = useMemo(() => {
    return opportunities.filter((opp) => {
      if (search.trim()) {
        const q = search.toLowerCase();
        const matchTitle = (opp.title || '').toLowerCase().includes(q);
        const matchCompany = (opp.productionCompany || '').toLowerCase().includes(q);
        const matchCat = (opp.category || opp.productionCategory || '').toLowerCase().includes(q);
        if (!matchTitle && !matchCompany && !matchCat) return false;
      }

      const s = (opp.listingStatus || opp.status || 'published').toLowerCase();
      if (filterStatus !== 'all') {
        if (filterStatus === 'published') return s === 'published' || s === 'open';
        if (filterStatus === 'draft') return s === 'draft';
        if (filterStatus === 'pending_payment') return s === 'pending_payment';
        if (filterStatus === 'pending_review') return s === 'pending_review';
        if (filterStatus === 'closed') return s === 'closed' || s === 'expired';
        if (filterStatus === 'archived') return s === 'archived';
      }
      return true;
    });
  }, [opportunities, search, filterStatus]);

  // Action Handlers
  const handlePreviewClick = (opp) => {
    setPreviewOpp(opp);
    setIsPreviewModalOpen(true);
  };

  const handleDuplicateClick = (opp) => {
    const duplicated = castingService.duplicateOpportunity(opp);
    if (duplicated) {
      setOpportunities((prev) => [duplicated, ...prev]);
      showToast(`Casting call "${opp.title}" duplicated as new draft.`);
    }
  };

  const handleCloseClick = (opp) => {
    setCloseTarget(opp);
    setIsCloseModalOpen(true);
  };

  const handleConfirmClose = () => {
    if (!closeTarget) return;
    castingService.closeOpportunity(closeTarget.id);
    setOpportunities((prev) =>
      prev.map((o) => (o.id === closeTarget.id ? { ...o, status: 'closed', listingStatus: 'closed' } : o))
    );
    setIsCloseModalOpen(false);
    showToast(`Casting call "${closeTarget.title}" is now Closed. Existing applications preserved.`);
    setCloseTarget(null);
  };

  const handleArchiveClick = (opp) => {
    castingService.archiveOpportunity(opp.id);
    setOpportunities((prev) =>
      prev.map((o) => (o.id === opp.id ? { ...o, status: 'archived', listingStatus: 'archived' } : o))
    );
    showToast(`Opportunity "${opp.title}" moved to archive.`);
  };

  const [isDeleting, setIsDeleting] = useState(false);

  const handleDeleteClick = (opp) => {
    setDeleteTarget(opp);
    setIsDeleteModalOpen(true);
  };

  const handleConfirmDelete = async () => {
    if (!deleteTarget) return;
    setIsDeleting(true);

    const targetId = deleteTarget.id || deleteTarget._id || deleteTarget.refId;
    const targetRefId = deleteTarget.refId || null;

    // 1. Immediately remove from local state so UI updates instantaneously
    setOpportunities((prev) =>
      prev.filter(
        (o) =>
          o.id !== targetId &&
          o.refId !== targetId &&
          (targetRefId ? o.refId !== targetRefId : true) &&
          (deleteTarget.id ? o.id !== deleteTarget.id : true)
      )
    );

    // 2. Persistently delete from backend and local caches
    try {
      await castingService.deleteOpportunity(targetId, targetRefId);
    } catch (err) {
      console.warn('Error deleting opportunity:', err);
    } finally {
      setIsDeleting(false);
      setIsDeleteModalOpen(false);
      showToast(`Casting call "${deleteTarget.title}" deleted.`);
      setDeleteTarget(null);
    }
  };

  // Status Badge Helper
  const renderStatusBadge = (opp) => {
    const s = (opp.listingStatus || (opp.status === 'open' ? 'published' : opp.status) || 'published').toLowerCase();
    switch (s) {
      case 'published':
      case 'open':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
            <CheckCircle2 className="w-3 h-3" />
            Published
          </span>
        );
      case 'draft':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-gray-100 text-gray-700 border border-gray-200">
            <FileText className="w-3 h-3" />
            Draft
          </span>
        );
      case 'pending_payment':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-amber-50 text-amber-700 border border-amber-200">
            <Clock className="w-3 h-3" />
            Pending Payment
          </span>
        );
      case 'pending_review':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-blue-50 text-blue-700 border border-blue-200">
            <ShieldCheck className="w-3 h-3" />
            Pending Review
          </span>
        );
      case 'closed':
      case 'expired':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-rose-50 text-rose-700 border border-rose-200">
            <Ban className="w-3 h-3" />
            Closed
          </span>
        );
      case 'archived':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-purple-50 text-purple-700 border border-purple-200">
            <Archive className="w-3 h-3" />
            Archived
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-gray-100 text-gray-700">
            {s}
          </span>
        );
    }
  };

  return (
    <PageContainer maxWidth="7xl" className="space-y-6 text-left pb-16">
      {/* Toast Feedback */}
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
            Production Company Dashboard
          </h1>
          <p className="text-xs text-gray-500">
            Manage casting announcements, track Juspay payments, review candidates, and schedule audition callbacks.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Link to="/post-job">
            <Button className="space-x-2 text-xs bg-brand-pink hover:bg-rose-700 text-white shadow-xs font-bold">
              <PlusCircle className="w-4 h-4" />
              <span>Announce Work</span>
            </Button>
          </Link>
        </div>
      </div>

      {/* 6 REQUIRED RECRUITER METRIC STAT CARDS (+ SHORTLISTED) */}
      <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-7 gap-3">
        <div className="p-3.5 bg-white rounded-2xl border border-gray-200 shadow-2xs space-y-1">
          <span className="text-[10px] font-bold uppercase text-gray-500 block tracking-wider">
            Total Jobs
          </span>
          <p className="text-2xl font-bold font-serif text-brand-navy">{stats.total}</p>
        </div>

        <div className="p-3.5 bg-white rounded-2xl border border-emerald-100 shadow-2xs space-y-1">
          <span className="text-[10px] font-bold uppercase text-emerald-700 block tracking-wider">
            Published Jobs
          </span>
          <p className="text-2xl font-bold font-serif text-emerald-700">{stats.published}</p>
        </div>

        <div className="p-3.5 bg-white rounded-2xl border border-gray-200 shadow-2xs space-y-1">
          <span className="text-[10px] font-bold uppercase text-gray-500 block tracking-wider">
            Drafts
          </span>
          <p className="text-2xl font-bold font-serif text-gray-700">{stats.drafts}</p>
        </div>

        <div className="p-3.5 bg-white rounded-2xl border border-amber-100 shadow-2xs space-y-1">
          <span className="text-[10px] font-bold uppercase text-amber-700 block tracking-wider">
            Pending Payments
          </span>
          <p className="text-2xl font-bold font-serif text-amber-600">{stats.pendingPayment}</p>
        </div>

        <div className="p-3.5 bg-white rounded-2xl border border-blue-100 shadow-2xs space-y-1">
          <span className="text-[10px] font-bold uppercase text-blue-700 block tracking-wider">
            Pending Review
          </span>
          <p className="text-2xl font-bold font-serif text-blue-600">{stats.pendingReview}</p>
        </div>

        <div className="p-3.5 bg-white rounded-2xl border border-pink-100 shadow-2xs space-y-1">
          <span className="text-[10px] font-bold uppercase text-brand-pink block tracking-wider">
            Total Applications
          </span>
          <p className="text-2xl font-bold font-serif text-brand-pink">{stats.totalApplications}</p>
        </div>

        <div className="p-3.5 bg-white rounded-2xl border border-purple-100 shadow-2xs space-y-1">
          <span className="text-[10px] font-bold uppercase text-purple-700 block tracking-wider">
            Shortlisted
          </span>
          <p className="text-2xl font-bold font-serif text-purple-700">{stats.shortlistedCount}</p>
        </div>
      </div>

      {/* Filter Toolbar */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="w-4 h-4 text-gray-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search casting calls by title, production house, or category..."
            className="w-full pl-10 pr-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-xs text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-pink-100 focus:border-brand-pink focus:bg-white"
          />
        </div>

        <select
          value={filterStatus}
          onChange={(e) => setFilterStatus(e.target.value)}
          aria-label="Filter by listing status"
          className="px-3.5 py-2.5 bg-white border border-gray-200 rounded-xl text-xs font-medium text-gray-900 focus:outline-none focus:ring-2 focus:ring-pink-100 cursor-pointer"
        >
          <option value="all">All Opportunities ({opportunities.length})</option>
          <option value="published">Published ({stats.published})</option>
          <option value="draft">Drafts ({stats.drafts})</option>
          <option value="pending_payment">Pending Payment ({stats.pendingPayment})</option>
          <option value="pending_review">Pending Review ({stats.pendingReview})</option>
          <option value="closed">Closed</option>
          <option value="archived">Archived</option>
        </select>
      </div>

      {/* Opportunities Table */}
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
                  <th className="px-5 py-3.5">Casting Title &amp; Production</th>
                  <th className="px-4 py-3.5">Category</th>
                  <th className="px-4 py-3.5">Applications</th>
                  <th className="px-4 py-3.5">Deadline</th>
                  <th className="px-4 py-3.5">Status</th>
                  <th className="px-5 py-3.5 text-right">Opportunity Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {filteredOpps.map((opp) => {
                  const isPendingPay = opp.listingStatus === 'pending_payment';
                  const isClosed = opp.status === 'closed' || opp.listingStatus === 'closed';
                  const isDraft = opp.status === 'draft' || opp.listingStatus === 'draft';

                  // Count matching applications for this opportunity
                  const oppAppsCount = applications.filter(
                    (a) => a.opportunityId === opp.id || a.opportunity_id === opp.id
                  ).length;

                  return (
                    <tr key={opp.id} className="hover:bg-gray-50/70 transition-colors">
                      <td className="px-5 py-3.5">
                        <p className="font-bold text-gray-900 text-xs">{opp.title}</p>
                        <p className="text-[11px] text-gray-500">
                          {opp.productionCompany} • {opp.location}
                        </p>
                      </td>
                      <td className="px-4 py-3.5 text-gray-700 font-medium">
                        {opp.productionCategory || opp.category || 'Film & TV'}
                      </td>
                      <td className="px-4 py-3.5">
                        <Link
                          to={`/admin/applications?opp=${opp.id}`}
                          className="font-bold text-brand-pink hover:underline font-mono text-[11px]"
                          title="View submitted applicant applications"
                        >
                          {opp.applicantCount || oppAppsCount || 0} applicant
                          {(opp.applicantCount || oppAppsCount || 0) !== 1 ? 's' : ''}
                        </Link>
                      </td>
                      <td className="px-4 py-3.5 text-gray-600 font-mono text-[11px]">
                        {opp.jobOpeningRange ||
                          (opp.openingStartDate && opp.openingEndDate
                            ? `${opp.openingStartDate} to ${opp.openingEndDate}`
                            : (opp.applicationDeadline || opp.deadline || opp.shootDate || 'Open'))}
                      </td>
                      <td className="px-4 py-3.5">{renderStatusBadge(opp)}</td>
                      <td className="px-5 py-3.5 text-right">
                        <div className="flex items-center justify-end gap-1.5">

                          {/* Preview Action */}
                          <button
                            type="button"
                            onClick={() => handlePreviewClick(opp)}
                            className="p-1.5 rounded-lg text-gray-500 hover:text-gray-900 hover:bg-gray-100 transition-colors cursor-pointer"
                            title="Preview Public Listing"
                            aria-label={`Preview ${opp.title}`}
                          >
                            <Eye className="w-4 h-4" />
                          </button>

                          {/* Edit Action */}
                          <Link
                            to={`/admin/opportunities/${opp.id}/edit`}
                            className="p-1.5 rounded-lg text-gray-500 hover:text-gray-900 hover:bg-gray-100 transition-colors"
                            title="Edit Opportunity"
                            aria-label={`Edit ${opp.title}`}
                          >
                            <Edit className="w-4 h-4" />
                          </Link>

                          {/* View Applications */}
                          <Link
                            to={`/admin/applications?opp=${opp.id}`}
                            className="p-1.5 rounded-lg text-gray-500 hover:text-brand-pink hover:bg-pink-50 transition-colors"
                            title="View Candidate Applications"
                            aria-label={`View applications for ${opp.title}`}
                          >
                            <Users className="w-4 h-4" />
                          </Link>

                          {/* View Ranked Candidates */}
                          <Link
                            to={`/admin/opportunities/${opp.id}/candidates`}
                            className="inline-flex items-center gap-1 px-2 py-1 rounded-lg bg-pink-50 hover:bg-pink-100 text-brand-pink text-[11px] font-bold border border-pink-200 transition-colors"
                            title="Rank & Score Candidates"
                            aria-label={`Ranked Candidates for ${opp.title}`}
                          >
                            <Sparkles className="w-3.5 h-3.5 text-brand-pink" />
                            <span>Rank</span>
                          </Link>

                          {/* Duplicate Action */}
                          <button
                            type="button"
                            onClick={() => handleDuplicateClick(opp)}
                            className="p-1.5 rounded-lg text-gray-500 hover:text-gray-900 hover:bg-gray-100 transition-colors cursor-pointer"
                            title="Duplicate as Draft"
                            aria-label={`Duplicate ${opp.title}`}
                          >
                            <Copy className="w-4 h-4" />
                          </button>

                          {/* Close Opportunity (If open) */}
                          {!isClosed && !isDraft && (
                            <button
                              type="button"
                              onClick={() => handleCloseClick(opp)}
                              className="p-1.5 rounded-lg text-amber-600 hover:text-amber-800 hover:bg-amber-50 transition-colors cursor-pointer"
                              title="Close Opportunity (Preserves Applications)"
                              aria-label={`Close ${opp.title}`}
                            >
                              <Ban className="w-4 h-4" />
                            </button>
                          )}

                          {/* Archive Action */}
                          <button
                            type="button"
                            onClick={() => handleArchiveClick(opp)}
                            className="p-1.5 rounded-lg text-gray-400 hover:text-purple-600 hover:bg-purple-50 transition-colors cursor-pointer"
                            title="Archive Opportunity"
                            aria-label={`Archive ${opp.title}`}
                          >
                            <Archive className="w-4 h-4" />
                          </button>

                          {/* Delete Action */}
                          <button
                            type="button"
                            onClick={() => handleDeleteClick(opp)}
                            className="p-1.5 rounded-lg text-gray-400 hover:text-rose-600 hover:bg-rose-50 transition-colors cursor-pointer"
                            title="Delete Opportunity"
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

      {/* Opportunity Public Listing Preview Modal */}
      <OpportunityPreviewModal
        isOpen={isPreviewModalOpen}
        onClose={() => setIsPreviewModalOpen(false)}
        opportunity={previewOpp}
        onEdit={(opp) => {
          setIsPreviewModalOpen(false);
          navigate(`/admin/opportunities/${opp.id}/edit`);
        }}
      />

      {/* Confirmation Dialog: Close Opportunity */}
      <Modal
        isOpen={isCloseModalOpen}
        onClose={() => setIsCloseModalOpen(false)}
        title="Confirm Closing Casting Opportunity"
      >
        <div className="p-6 space-y-4 text-left text-xs">
          <p className="text-gray-600">
            Are you sure you want to close submissions for{' '}
            <strong className="text-gray-900 font-semibold">{closeTarget?.title}</strong>?
          </p>
          <div className="p-3 bg-amber-50 border border-amber-200 rounded-xl text-amber-800 flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
            <span>
              All existing applicant records, showreels, and candidate rankings will be strictly preserved.
            </span>
          </div>
          <div className="flex justify-end gap-2 pt-2 border-t border-gray-100">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setIsCloseModalOpen(false)}
              className="text-xs"
            >
              Cancel
            </Button>
            <Button
              variant="danger"
              size="sm"
              onClick={handleConfirmClose}
              className="text-xs bg-amber-600 hover:bg-amber-700 text-white font-bold"
            >
              Close Applications
            </Button>
          </div>
        </div>
      </Modal>

      {/* Confirmation Dialog: Delete Opportunity */}
      <Modal
        isOpen={isDeleteModalOpen}
        onClose={() => {
          if (!isDeleting) setIsDeleteModalOpen(false);
        }}
        title="Confirm Casting Call Removal"
      >
        <div className="p-6 space-y-4 text-left text-xs">
          <p className="text-gray-700 text-sm">
            Are you sure you want to remove the listing{' '}
            <strong className="text-gray-900 font-bold">{deleteTarget?.title}</strong>?
          </p>
          <div className="p-3.5 bg-red-50 border border-red-200 rounded-xl flex items-center gap-2.5 text-red-700 font-medium">
            <AlertTriangle className="w-4 h-4 shrink-0 text-red-600" />
            <span>This action cannot be undone.</span>
          </div>
          <div className="flex justify-end gap-2.5 pt-3 border-t border-gray-100">
            <Button
              variant="outline"
              size="sm"
              disabled={isDeleting}
              onClick={() => setIsDeleteModalOpen(false)}
              className="text-xs px-4"
            >
              Cancel
            </Button>
            <Button
              variant="danger"
              size="sm"
              loading={isDeleting}
              onClick={handleConfirmDelete}
              className="text-xs bg-red-600 hover:bg-red-700 text-white font-bold px-4"
            >
              {isDeleting ? 'Deleting...' : 'Delete Listing'}
            </Button>
          </div>
        </div>
      </Modal>
    </PageContainer>
  );
};

export default AdminOpportunitiesPage;
