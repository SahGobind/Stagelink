import React, { useState, useEffect, useMemo } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  Users,
  FileCheck,
  PlusCircle,
  Search,
  CheckCircle2,
  Clock,
  ArrowRight,
  ShieldCheck,
  AlertCircle,
  Eye,
  Calendar,
  Building2,
  Globe,
  Phone,
  Mail,
  Edit,
  ExternalLink,
  Briefcase,
  Copy,
  Archive,
  Ban,
  CreditCard,
  Sparkles,
  FileText,
  Trash2,
  LifeBuoy,
} from 'lucide-react';
import PageContainer from '../../components/layout/PageContainer';
import Button from '../../components/common/Button';
import Avatar from '../../components/common/Avatar';
import Modal from '../../components/common/Modal';
import ApplicationStatusBadge from '../../components/applications/ApplicationStatusBadge';
import OpportunityPreviewModal from '../../components/opportunities/OpportunityPreviewModal';
import CreateTicketModal from '../../components/support/CreateTicketModal';
import { getCandidatesList } from '../../data/mockCandidates';
import { getAllApplications } from '../../data/mockApplications';
import { mockOpportunities } from '../../data/mockOpportunities';
import { getStoredSupportTickets } from '../../data/mockSupportTickets';
import {
  getAllCustomOpportunities,
  closeCustomOpportunity,
  archiveCustomOpportunity,
} from '../../utils/paymentAccess';
import { authService } from '../../services/authService';
import { castingService } from '../../services/castingService';

const AdminDashboardPage = () => {
  const navigate = useNavigate();
  const [currentUser, setCurrentUser] = useState(() => authService.getCurrentUser());
  const [toastMessage, setToastMessage] = useState('');

  // Opportunities state (merging custom opportunities, drafts, and mock data)
  const [opportunities, setOpportunities] = useState(() => {
    const custom = getAllCustomOpportunities();
    const drafts = castingService.getDrafts();
    const ids = new Set([...custom.map((c) => c.id), ...drafts.map((d) => d.id)]);
    return [...custom, ...drafts, ...mockOpportunities.filter((m) => !ids.has(m.id))];
  });

  // Preview Modal
  const [previewOpp, setPreviewOpp] = useState(null);
  const [isPreviewModalOpen, setIsPreviewModalOpen] = useState(false);

  // Close confirmation modal
  const [closeTarget, setCloseTarget] = useState(null);
  const [isCloseModalOpen, setIsCloseModalOpen] = useState(false);

  // Edit Company Profile Modal
  const [isProfileModalOpen, setIsProfileModalOpen] = useState(false);
  const [profileForm, setProfileForm] = useState({
    companyName: currentUser?.companyName || 'Apex Vision Studios',
    fullName: currentUser?.fullName || 'Marcus Sterling',
    email: currentUser?.email || 'marcus@apexvisionstudios.com',
    phoneNumber: currentUser?.phoneNumber || '+1 (555) 349-8201',
    country: currentUser?.country || 'United States',
    website: currentUser?.website || 'https://apexvisionstudios.com',
  });
  const [isSavingProfile, setIsSavingProfile] = useState(false);

  // Help & Support state for Recruiter Dashboard
  const [isSupportModalOpen, setIsSupportModalOpen] = useState(false);
  const [recruiterTickets, setRecruiterTickets] = useState(() => {
    const all = getStoredSupportTickets();
    return all.filter((t) => t.userRole === 'recruiter' || t.userRole === 'admin');
  });

  useEffect(() => {
    const handleSupportUpdate = () => {
      const all = getStoredSupportTickets();
      setRecruiterTickets(all.filter((t) => t.userRole === 'recruiter' || t.userRole === 'admin'));
    };
    window.addEventListener('starcast_support_updated', handleSupportUpdate);
    return () => window.removeEventListener('starcast_support_updated', handleSupportUpdate);
  }, []);

  const candidates = useMemo(() => getCandidatesList(), []);
  const applications = useMemo(() => getAllApplications(), []);

  const showToast = (msg) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(''), 3500);
  };

  // Sync profile data when currentUser changes
  useEffect(() => {
    const u = authService.getCurrentUser();
    if (u) {
      setCurrentUser(u);
      setProfileForm({
        companyName: u.companyName || 'Apex Vision Studios',
        fullName: u.fullName || 'Marcus Sterling',
        email: u.email || 'marcus@apexvisionstudios.com',
        phoneNumber: u.phoneNumber || '+1 (555) 349-8201',
        country: u.country || 'United States',
        website: u.website || 'https://apexvisionstudios.com',
      });
    }
  }, []);

  // 6 REQUIRED RECRUITER METRIC CARDS
  const recruiterStats = useMemo(() => {
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

    return {
      total,
      published,
      drafts,
      pendingPayment,
      pendingReview,
      totalApplications,
    };
  }, [opportunities, applications]);

  // Handle Close Job (Preserving applications)
  const handleConfirmClose = () => {
    if (!closeTarget) return;
    closeCustomOpportunity(closeTarget.id);
    castingService.closeOpportunity(closeTarget.id);
    setOpportunities((prev) =>
      prev.map((o) => (o.id === closeTarget.id ? { ...o, status: 'closed', listingStatus: 'closed' } : o))
    );
    setIsCloseModalOpen(false);
    showToast(`Casting call "${closeTarget.title}" is now Closed. Existing applications preserved.`);
    setCloseTarget(null);
  };

  // Handle Archive Job
  const handleArchiveClick = (opp) => {
    archiveCustomOpportunity(opp.id);
    castingService.archiveOpportunity(opp.id);
    setOpportunities((prev) =>
      prev.map((o) => (o.id === opp.id ? { ...o, status: 'archived', listingStatus: 'archived' } : o))
    );
    showToast(`Opportunity "${opp.title}" moved to archive.`);
  };

  // Handle Save Company Profile
  const handleSaveCompanyProfile = (e) => {
    e.preventDefault();
    setIsSavingProfile(true);

    const updated = authService.updateCompanyProfile(profileForm);
    if (updated) {
      setCurrentUser(updated);
    }
    setIsSavingProfile(false);
    setIsProfileModalOpen(false);
    showToast('Company profile details saved successfully.');
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
      case 'payment_failed':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-red-50 text-red-700 border border-red-200">
            <AlertCircle className="w-3 h-3" />
            Payment Failed
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

  // Recent applications (sorted by appliedDate desc)
  const recentApplications = useMemo(() => {
    return [...applications]
      .sort((a, b) => new Date(b.appliedDate || 0) - new Date(a.appliedDate || 0))
      .slice(0, 5);
  }, [applications]);

  // Recent candidates
  const recentCandidates = useMemo(() => {
    return [...candidates]
      .sort((a, b) => new Date(b.registeredDate || 0) - new Date(a.registeredDate || 0))
      .slice(0, 5);
  }, [candidates]);

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

      {/* Header & Quick Action Buttons */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-gray-200">
        <div className="space-y-1">
          <div className="inline-flex items-center gap-2 px-2.5 py-0.5 rounded-md bg-neutral-100 text-brand-navy text-[11px] font-bold uppercase tracking-wider">
            <ShieldCheck className="w-3.5 h-3.5 text-brand-pink" />
            <span>Recruiter &amp; Production Control Center</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold font-serif text-gray-900 tracking-tight">
            Recruiter Dashboard &amp; Talent Pipeline
          </h1>
          <p className="text-xs text-gray-500">
            Manage casting announcements, track server-side Juspay verifications, review candidates, and hire talent.
          </p>
        </div>

        {/* 8 Actions: Action 1 - Create Job */}
        <div className="flex flex-wrap items-center gap-2.5">
          {(currentUser?.role === 'admin' || currentUser?.role === 'operations') && (
            <Link to="/admin/operations/support">
              <Button variant="secondary" size="sm" className="space-x-1.5 text-xs font-bold border-indigo-200 bg-indigo-50/70 hover:bg-indigo-100 text-indigo-900">
                <ShieldCheck className="w-3.5 h-3.5 text-indigo-600" />
                <span>Operations Desk</span>
              </Button>
            </Link>
          )}
          <Link to="/admin/support">
            <Button variant="secondary" size="sm" className="space-x-1.5 text-xs font-bold border-gray-300 hover:border-gray-900 text-brand-navy">
              <LifeBuoy className="w-3.5 h-3.5 text-brand-pink" />
              <span>Help &amp; Support</span>
              {recruiterTickets.some((t) => t.unreadForUser) && (
                <span className="w-2 h-2 rounded-full bg-brand-pink ml-1" />
              )}
            </Button>
          </Link>
          <Link to="/admin/opportunities">
            <Button variant="secondary" size="sm" className="space-x-1.5 text-xs font-bold">
              <Briefcase className="w-3.5 h-3.5" />
              <span>All Casting Calls</span>
            </Button>
          </Link>
          <Link to="/post-job">
            <Button size="sm" variant="primary" className="space-x-1.5 text-xs font-bold bg-brand-pink hover:bg-rose-700 text-white shadow-xs">
              <PlusCircle className="w-3.5 h-3.5" />
              <span>Announce Work / Create Job</span>
            </Button>
          </Link>
        </div>
      </div>

      {/* Recruiter Studio Profile Details Card */}
      <div className="bg-white rounded-3xl border border-gray-200 p-5 sm:p-6 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-5">
        <div className="flex items-start gap-4">
          <div className="w-14 h-14 rounded-2xl bg-pink-50 border border-pink-200 text-brand-pink flex items-center justify-center font-serif font-bold text-xl shrink-0 shadow-2xs">
            {profileForm.companyName.charAt(0) || 'P'}
          </div>
          <div className="space-y-1">
            <div className="flex items-center gap-2.5 flex-wrap">
              <h2 className="text-lg font-bold font-serif text-gray-900">
                {profileForm.companyName}
              </h2>
              <span className="px-2 py-0.5 rounded-md text-[10px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
                Verified Recruiter
              </span>
              <span className="px-2 py-0.5 rounded-md text-[10px] font-mono bg-neutral-100 text-gray-600 border border-gray-200">
                Mock Dev Persistence
              </span>
            </div>
            <p className="text-xs text-gray-500 flex items-center gap-2 flex-wrap">
              <span>Recruiter: <strong className="text-gray-800">{profileForm.fullName}</strong></span>
              <span className="text-gray-300">•</span>
              <span className="flex items-center gap-1">
                <Mail className="w-3.5 h-3.5 text-gray-400" />
                {profileForm.email}
              </span>
              <span className="text-gray-300">•</span>
              <span className="flex items-center gap-1">
                <Globe className="w-3.5 h-3.5 text-gray-400" />
                {profileForm.country}
              </span>
            </p>
            {profileForm.website && (
              <p className="text-xs text-brand-pink font-medium flex items-center gap-1">
                <Globe className="w-3.5 h-3.5" />
                <a href={profileForm.website} target="_blank" rel="noreferrer" className="hover:underline">
                  {profileForm.website}
                </a>
              </p>
            )}
          </div>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          <button
            type="button"
            onClick={() => setIsProfileModalOpen(true)}
            className="px-4 py-2 rounded-xl border border-gray-300 hover:border-gray-900 text-gray-800 font-bold text-xs flex items-center gap-1.5 transition-colors cursor-pointer"
          >
            <Edit className="w-3.5 h-3.5 text-gray-600" />
            <span>Complete / Edit Profile</span>
          </button>
        </div>
      </div>

      {/* 6 REQUIRED RECRUITER METRIC CARDS */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
        {/* Metric 1: Total Jobs */}
        <div className="p-4 bg-white rounded-2xl border border-gray-200 shadow-2xs space-y-1 hover:border-brand-pink/40 transition-colors">
          <span className="text-[10px] font-bold uppercase text-gray-500 block tracking-wider">
            Total Jobs
          </span>
          <p className="text-2xl sm:text-3xl font-extrabold font-serif text-brand-navy">
            {recruiterStats.total}
          </p>
          <span className="text-[10px] text-gray-400 font-medium">All posted opportunities</span>
        </div>

        {/* Metric 2: Published Jobs */}
        <div className="p-4 bg-white rounded-2xl border border-emerald-100 shadow-2xs space-y-1 hover:border-emerald-300 transition-colors">
          <span className="text-[10px] font-bold uppercase text-emerald-700 block tracking-wider">
            Published Jobs
          </span>
          <p className="text-2xl sm:text-3xl font-extrabold font-serif text-emerald-700">
            {recruiterStats.published}
          </p>
          <span className="text-[10px] text-emerald-600 font-medium">Active &amp; public calls</span>
        </div>

        {/* Metric 3: Drafts */}
        <div className="p-4 bg-white rounded-2xl border border-gray-200 shadow-2xs space-y-1 hover:border-gray-400 transition-colors">
          <span className="text-[10px] font-bold uppercase text-gray-500 block tracking-wider">
            Drafts
          </span>
          <p className="text-2xl sm:text-3xl font-extrabold font-serif text-gray-700">
            {recruiterStats.drafts}
          </p>
          <span className="text-[10px] text-gray-400 font-medium">Saved drafts in progress</span>
        </div>

        {/* Metric 4: Pending Payments */}
        <div className="p-4 bg-white rounded-2xl border border-amber-100 shadow-2xs space-y-1 hover:border-amber-300 transition-colors">
          <span className="text-[10px] font-bold uppercase text-amber-700 block tracking-wider">
            Pending Payments
          </span>
          <p className="text-2xl sm:text-3xl font-extrabold font-serif text-amber-600">
            {recruiterStats.pendingPayment}
          </p>
          <span className="text-[10px] text-amber-600 font-medium">Awaiting checkout auth</span>
        </div>

        {/* Metric 5: Pending Review */}
        <div className="p-4 bg-white rounded-2xl border border-blue-100 shadow-2xs space-y-1 hover:border-blue-300 transition-colors">
          <span className="text-[10px] font-bold uppercase text-blue-700 block tracking-wider">
            Pending Review
          </span>
          <p className="text-2xl sm:text-3xl font-extrabold font-serif text-blue-600">
            {recruiterStats.pendingReview}
          </p>
          <span className="text-[10px] text-blue-600 font-medium">In moderation queue</span>
        </div>

        {/* Metric 6: Total Applications */}
        <div className="p-4 bg-white rounded-2xl border border-pink-100 shadow-2xs space-y-1 hover:border-pink-300 transition-colors">
          <span className="text-[10px] font-bold uppercase text-brand-pink block tracking-wider">
            Total Applications
          </span>
          <p className="text-2xl sm:text-3xl font-extrabold font-serif text-brand-pink">
            {recruiterStats.totalApplications}
          </p>
          <span className="text-[10px] text-pink-600 font-medium">Performer submissions</span>
        </div>
      </div>

      {/* Recruiter Casting Call Actions Table (Surfacing all 8 actions) */}
      <div className="bg-white rounded-3xl border border-gray-200 shadow-xs overflow-hidden">
        <div className="p-5 border-b border-gray-200 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="space-y-0.5">
            <h2 className="text-base font-bold font-serif text-gray-900">
              Casting Announcements &amp; Production Management
            </h2>
            <p className="text-xs text-gray-500">
              Manage jobs, resume pending payments with Juspay, review applicants, and rank candidates.
            </p>
          </div>
          <Link
            to="/admin/opportunities"
            className="text-xs font-bold text-brand-pink hover:underline flex items-center gap-1 group"
          >
            <span>View All Opportunities Table</span>
            <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
          </Link>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-xs text-left">
            <thead className="bg-gray-50 text-gray-500 font-bold uppercase text-[10px] tracking-wider border-b border-gray-200">
              <tr>
                <th className="py-3.5 px-5">Job / Casting Title</th>
                <th className="py-3.5 px-4">Category</th>
                <th className="py-3.5 px-4">Applications</th>
                <th className="py-3.5 px-4">Status</th>
                <th className="py-3.5 px-5 text-right">Recruiter Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {opportunities.slice(0, 6).map((opp) => {
                const s = (opp.listingStatus || opp.status || 'published').toLowerCase();
                const isPendingPay = s === 'pending_payment';
                const isDraft = s === 'draft';
                const isClosed = s === 'closed' || s === 'expired';

                const oppApps = applications.filter(
                  (a) => a.opportunityId === opp.id || a.opportunity_id === opp.id
                ).length;

                return (
                  <tr key={opp.id} className="hover:bg-gray-50/70 transition-colors">
                    <td className="py-3.5 px-5">
                      <p className="font-bold text-gray-900 text-xs">{opp.title}</p>
                      <p className="text-[11px] text-gray-500">
                        {opp.productionCompany || profileForm.companyName} • {opp.location}
                      </p>
                    </td>

                    <td className="py-3.5 px-4 text-gray-700 font-medium">
                      {opp.productionCategory || opp.category || 'Film & TV'}
                    </td>

                    <td className="py-3.5 px-4">
                      {/* Action 5: View Applications */}
                      <Link
                        to={`/admin/applications?opp=${opp.id}`}
                        className="font-bold text-brand-pink hover:underline font-mono text-[11px]"
                      >
                        {opp.applicantCount || oppApps || 0} applicants
                      </Link>
                    </td>

                    <td className="py-3.5 px-4">{renderStatusBadge(opp)}</td>

                    <td className="py-3.5 px-5 text-right">
                      <div className="flex items-center justify-end gap-1.5 flex-wrap">
                        {/* Action 4: Resume Pending Payment (Reuses order ID, no duplicate charge) */}
                        {isPendingPay && (
                          <Link
                            to={`/payment`}
                            state={{ opportunity: opp }}
                            className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-pink-50 hover:bg-pink-100 text-brand-pink text-[11px] font-bold border border-pink-200 transition-colors"
                            title="Resume pending payment via Juspay or Simulator"
                          >
                            <CreditCard className="w-3 h-3" />
                            <span>Resume Payment</span>
                          </Link>
                        )}

                        {/* Action 3: Preview Job */}
                        <button
                          type="button"
                          onClick={() => {
                            setPreviewOpp(opp);
                            setIsPreviewModalOpen(true);
                          }}
                          className="p-1.5 rounded-lg text-gray-500 hover:text-gray-900 hover:bg-gray-100 transition-colors cursor-pointer"
                          title="Preview Job"
                        >
                          <Eye className="w-4 h-4" />
                        </button>

                        {/* Action 2: Edit Draft / Job */}
                        <Link
                          to={isDraft ? `/post-job` : `/admin/opportunities/${opp.id}/edit`}
                          state={isDraft ? { opportunity: opp } : undefined}
                          className="p-1.5 rounded-lg text-gray-500 hover:text-gray-900 hover:bg-gray-100 transition-colors"
                          title="Edit Job / Draft"
                        >
                          <Edit className="w-4 h-4" />
                        </Link>

                        {/* Action 5: View Applications */}
                        <Link
                          to={`/admin/applications?opp=${opp.id}`}
                          className="p-1.5 rounded-lg text-gray-500 hover:text-brand-pink hover:bg-pink-50 transition-colors"
                          title="View Applications"
                        >
                          <Users className="w-4 h-4" />
                        </Link>

                        {/* Action 6: View Ranked Candidates */}
                        <Link
                          to={`/admin/opportunities/${opp.id}/candidates`}
                          className="inline-flex items-center gap-1 px-2 py-1 rounded-lg bg-pink-50 hover:bg-pink-100 text-brand-pink text-[11px] font-bold border border-pink-200 transition-colors"
                          title="View Ranked Candidates"
                        >
                          <Sparkles className="w-3 h-3 text-brand-pink" />
                          <span>Rank</span>
                        </Link>

                        {/* Action 7: Close Job (Preserves applications) */}
                        {!isClosed && !isDraft && (
                          <button
                            type="button"
                            onClick={() => {
                              setCloseTarget(opp);
                              setIsCloseModalOpen(true);
                            }}
                            className="p-1.5 rounded-lg text-amber-600 hover:text-amber-800 hover:bg-amber-50 transition-colors cursor-pointer"
                            title="Close Job (Preserves Applications)"
                          >
                            <Ban className="w-4 h-4" />
                          </button>
                        )}

                        {/* Action 8: Archive Job */}
                        <button
                          type="button"
                          onClick={() => handleArchiveClick(opp)}
                          className="p-1.5 rounded-lg text-gray-400 hover:text-purple-600 hover:bg-purple-50 transition-colors cursor-pointer"
                          title="Archive Job"
                        >
                          <Archive className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Two Dense Admin Data Tables: Candidates & Audition Submissions */}
      <div className="grid grid-cols-1 xl:grid-cols-12 gap-6 items-start">
        {/* Recently Registered Candidates (7 Cols) */}
        <div className="xl:col-span-7 bg-white rounded-2xl border border-neutral-200 shadow-2xs overflow-hidden text-left">
          <div className="p-5 border-b border-neutral-200 flex items-center justify-between">
            <div className="space-y-0.5">
              <h2 className="text-base font-bold font-serif text-brand-navy">
                Recently Registered Candidates
              </h2>
              <p className="text-xs text-neutral-500">
                Latest performer sign-ups awaiting verification or casting review.
              </p>
            </div>
            <Link
              to="/admin/candidates"
              className="text-xs font-bold text-brand-pink hover:underline flex items-center gap-1 group"
            >
              <span>View Directory</span>
              <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
            </Link>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-xs text-left">
              <thead className="bg-neutral-50 text-neutral-500 font-semibold uppercase text-[10px] tracking-wider border-b border-neutral-200">
                <tr>
                  <th className="py-3.5 px-4">Candidate</th>
                  <th className="py-3.5 px-3">Location</th>
                  <th className="py-3.5 px-3">Experience</th>
                  <th className="py-3.5 px-3">Profile</th>
                  <th className="py-3.5 px-4 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-neutral-100">
                {recentCandidates.map((candidate) => (
                  <tr key={candidate.id} className="hover:bg-neutral-50/70 transition-colors">
                    <td className="py-3.5 px-4">
                      <div className="flex items-center gap-3">
                        <Avatar src={candidate.avatar} name={candidate.fullName} size="sm" />
                        <div className="min-w-0">
                          <Link
                            to={`/admin/candidates/${candidate.id}`}
                            className="font-bold text-brand-navy hover:text-brand-pink block truncate max-w-[200px]"
                          >
                            {candidate.fullName}
                          </Link>
                          <span className="text-[10px] text-neutral-500 truncate block max-w-[200px]">
                            {candidate.headline}
                          </span>
                        </div>
                      </div>
                    </td>

                    <td className="py-3.5 px-3 text-neutral-700 whitespace-nowrap">
                      {candidate.location.split('/')[0].trim()}
                    </td>

                    <td className="py-3.5 px-3 text-neutral-600 whitespace-nowrap font-medium">
                      {candidate.yearsOfExperience} yrs
                    </td>

                    <td className="py-3.5 px-3 whitespace-nowrap">
                      <div className="flex items-center gap-1.5">
                        <div className="w-12 bg-neutral-100 h-1.5 rounded-full overflow-hidden">
                          <div
                            className="bg-brand-pink h-full rounded-full"
                            style={{ width: `${candidate.profileCompletion}%` }}
                          />
                        </div>
                        <span className="text-[10px] font-semibold text-neutral-700">
                          {candidate.profileCompletion}%
                        </span>
                      </div>
                    </td>

                    <td className="py-3.5 px-4 text-right whitespace-nowrap">
                      <Link
                        to={`/admin/candidates/${candidate.id}`}
                        className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-neutral-100 hover:bg-brand-navy hover:text-white text-brand-navy text-[11px] font-bold transition-all shadow-2xs"
                      >
                        <Eye className="w-3 h-3" />
                        <span>View</span>
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Recent Applications (5 Cols) */}
        <div className="xl:col-span-5 bg-white rounded-2xl border border-neutral-200 shadow-2xs overflow-hidden text-left">
          <div className="p-5 border-b border-neutral-200 flex items-center justify-between">
            <div className="space-y-0.5">
              <h2 className="text-base font-bold font-serif text-brand-navy">
                Recent Auditions
              </h2>
              <p className="text-xs text-neutral-500">
                Submissions for active casting calls.
              </p>
            </div>
            <Link
              to="/admin/applications"
              className="text-xs font-bold text-brand-pink hover:underline flex items-center gap-1 group"
            >
              <span>All Submissions</span>
              <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
            </Link>
          </div>

          <div className="divide-y divide-neutral-100">
            {recentApplications.map((app) => (
              <div
                key={app.id}
                className="p-4 sm:p-5 hover:bg-neutral-50/70 transition-colors flex items-start justify-between gap-3 text-xs"
              >
                <div className="space-y-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-brand-navy truncate">{app.candidateName}</span>
                    <span className="text-[10px] text-neutral-400">• {app.appliedDate}</span>
                  </div>
                  <p className="text-neutral-600 truncate font-medium">
                    Applied for <strong className="text-brand-pink">{app.roleAppliedFor}</strong>
                  </p>
                  <p className="text-[11px] text-neutral-500 truncate">
                    {app.opportunityTitle} ({app.productionCompany})
                  </p>
                </div>

                <div className="flex flex-col items-end gap-2 shrink-0">
                  <ApplicationStatusBadge status={app.status} />
                  <Link
                    to={`/admin/candidates/${app.candidateId}`}
                    className="text-[11px] font-bold text-neutral-500 hover:text-brand-pink hover:underline"
                  >
                    View Performer →
                  </Link>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Recruiter & Studio Help & Support Section Card */}
      <div className="bg-white rounded-3xl border border-brand-border p-6 sm:p-8 shadow-card flex flex-col lg:flex-row lg:items-center justify-between gap-6 text-left">
        <div className="space-y-1.5 max-w-2xl">
          <div className="flex items-center gap-2">
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-pink-50 text-brand-pink text-[11px] font-bold border border-pink-100">
              <LifeBuoy className="w-3.5 h-3.5" />
              <span>Studio &amp; Recruiter Desk</span>
            </span>
            {recruiterTickets.some((t) => t.unreadForUser) && (
              <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-pink-100 text-brand-pink border border-pink-200">
                New Reply from Team
              </span>
            )}
          </div>
          <h2 className="text-xl sm:text-2xl font-bold font-serif text-brand-navy">
            Help &amp; Support for Production Companies
          </h2>
          <p className="text-xs sm:text-sm text-gray-500 leading-relaxed">
            Need urgent assistance with casting publication, candidate ranking, Juspay transaction receipts, or studio verification? Contact our Operation Team directly.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3 shrink-0">
          {/* Option 1: Contact Operation Team */}
          <button
            type="button"
            onClick={() => setIsSupportModalOpen(true)}
            className="px-5 py-3 bg-brand-pink hover:bg-rose-700 active:scale-95 text-white rounded-2xl font-bold text-xs sm:text-sm flex items-center gap-2 shadow-xs transition-all cursor-pointer"
          >
            <PlusCircle className="w-4 h-4" />
            <span>Contact Operation Team</span>
          </button>

          {/* Option 2: My Support Tickets */}
          <Link
            to="/admin/support"
            className="px-5 py-3 rounded-2xl border border-gray-300 hover:border-gray-900 text-brand-navy font-bold text-xs sm:text-sm flex items-center gap-2 transition-colors cursor-pointer bg-white"
          >
            <LifeBuoy className="w-4 h-4 text-brand-pink" />
            <span>My Support Tickets</span>
            {recruiterTickets.length > 0 && (
              <span className="px-2 py-0.5 rounded-full text-[10px] bg-gray-100 text-gray-700 font-bold ml-1">
                {recruiterTickets.length}
              </span>
            )}
          </Link>

          {/* Option 3: Unified Staff Hub */}
          <Link
            to="/admin/operations/support"
            className="px-4 py-3 rounded-2xl bg-neutral-900 hover:bg-black text-white font-bold text-xs flex items-center gap-1.5 transition-colors cursor-pointer"
          >
            <ShieldCheck className="w-4 h-4 text-brand-pink" />
            <span>Staff Inbox</span>
          </Link>
        </div>
      </div>

      {/* Opportunity Public Preview Modal */}
      <OpportunityPreviewModal
        isOpen={isPreviewModalOpen}
        onClose={() => setIsPreviewModalOpen(false)}
        opportunity={previewOpp}
        onEdit={(opp) => {
          setIsPreviewModalOpen(false);
          navigate(`/admin/opportunities/${opp.id}/edit`);
        }}
      />

      {/* Close Opportunity Confirmation Modal */}
      <Modal
        isOpen={isCloseModalOpen}
        onClose={() => setIsCloseModalOpen(false)}
        title="Confirm Closing Casting Opportunity"
      >
        <div className="space-y-4 text-xs text-left">
          <p className="text-gray-600">
            Are you sure you want to close{' '}
            <strong className="text-gray-900 font-bold">"{closeTarget?.title}"</strong>?
          </p>
          <div className="p-3 bg-amber-50 border border-amber-200 rounded-xl text-amber-800 text-[11px]">
            <strong>Note:</strong> Closing this casting call will remove it from public discovery, but all{' '}
            <strong>submitted candidate applications will be strictly preserved</strong> in your recruiter pipeline.
          </div>
          <div className="flex justify-end gap-2.5 pt-2">
            <button
              type="button"
              onClick={() => setIsCloseModalOpen(false)}
              className="px-4 py-2 bg-gray-100 hover:bg-gray-200 rounded-xl font-bold text-gray-700 cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={handleConfirmClose}
              className="px-4 py-2 bg-amber-600 hover:bg-amber-700 text-white rounded-xl font-bold cursor-pointer"
            >
              Confirm Close Job
            </button>
          </div>
        </div>
      </Modal>

      {/* Edit Company Profile Modal */}
      <Modal
        isOpen={isProfileModalOpen}
        onClose={() => setIsProfileModalOpen(false)}
        title="Complete / Edit Production Company Profile"
      >
        <form onSubmit={handleSaveCompanyProfile} className="space-y-4 text-xs text-left">
          <div className="p-3 bg-pink-50 border border-pink-200 rounded-xl text-pink-900 text-[11px]">
            Keep your production studio and recruiter details current so casting applicants have verified contact information.
          </div>

          <div className="space-y-1.5">
            <label className="block text-xs font-bold text-gray-700">
              Production Company Name <span className="text-brand-pink">*</span>
            </label>
            <input
              type="text"
              required
              value={profileForm.companyName}
              onChange={(e) => setProfileForm({ ...profileForm, companyName: e.target.value })}
              className="w-full px-3.5 py-2.5 bg-white border border-gray-200 rounded-xl text-gray-900 text-xs focus:outline-none focus:border-brand-pink focus:ring-2 focus:ring-pink-100"
            />
          </div>

          <div className="space-y-1.5">
            <label className="block text-xs font-bold text-gray-700">
              Recruiter Full Name <span className="text-brand-pink">*</span>
            </label>
            <input
              type="text"
              required
              value={profileForm.fullName}
              onChange={(e) => setProfileForm({ ...profileForm, fullName: e.target.value })}
              className="w-full px-3.5 py-2.5 bg-white border border-gray-200 rounded-xl text-gray-900 text-xs focus:outline-none focus:border-brand-pink focus:ring-2 focus:ring-pink-100"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <label className="block text-xs font-bold text-gray-700">
                Business Email <span className="text-brand-pink">*</span>
              </label>
              <input
                type="email"
                required
                value={profileForm.email}
                onChange={(e) => setProfileForm({ ...profileForm, email: e.target.value })}
                className="w-full px-3.5 py-2.5 bg-white border border-gray-200 rounded-xl text-gray-900 text-xs focus:outline-none focus:border-brand-pink focus:ring-2 focus:ring-pink-100"
              />
            </div>
            <div className="space-y-1.5">
              <label className="block text-xs font-bold text-gray-700">
                Phone Number
              </label>
              <input
                type="text"
                value={profileForm.phoneNumber}
                onChange={(e) => setProfileForm({ ...profileForm, phoneNumber: e.target.value })}
                className="w-full px-3.5 py-2.5 bg-white border border-gray-200 rounded-xl text-gray-900 text-xs focus:outline-none focus:border-brand-pink focus:ring-2 focus:ring-pink-100"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <label className="block text-xs font-bold text-gray-700">
                Country <span className="text-brand-pink">*</span>
              </label>
              <input
                type="text"
                required
                value={profileForm.country}
                onChange={(e) => setProfileForm({ ...profileForm, country: e.target.value })}
                className="w-full px-3.5 py-2.5 bg-white border border-gray-200 rounded-xl text-gray-900 text-xs focus:outline-none focus:border-brand-pink focus:ring-2 focus:ring-pink-100"
              />
            </div>
            <div className="space-y-1.5">
              <label className="block text-xs font-bold text-gray-700">
                Company Website
              </label>
              <input
                type="url"
                value={profileForm.website}
                onChange={(e) => setProfileForm({ ...profileForm, website: e.target.value })}
                placeholder="https://yourcompany.com"
                className="w-full px-3.5 py-2.5 bg-white border border-gray-200 rounded-xl text-gray-900 text-xs focus:outline-none focus:border-brand-pink focus:ring-2 focus:ring-pink-100"
              />
            </div>
          </div>

          <div className="flex justify-end gap-2.5 pt-3 border-t border-gray-100">
            <button
              type="button"
              onClick={() => setIsProfileModalOpen(false)}
              className="px-4 py-2 bg-gray-100 hover:bg-gray-200 rounded-xl font-bold text-gray-700 cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSavingProfile}
              className="px-5 py-2 bg-brand-pink hover:bg-rose-700 text-white rounded-xl font-bold cursor-pointer transition-colors"
            >
              {isSavingProfile ? 'Saving...' : 'Save Profile Details'}
            </button>
          </div>
        </form>
      </Modal>

      {/* Recruiter Support Ticket Creation Modal */}
      <CreateTicketModal
        isOpen={isSupportModalOpen}
        onClose={() => setIsSupportModalOpen(false)}
        onTicketCreated={() => {
          const all = getStoredSupportTickets();
          setRecruiterTickets(all.filter((t) => t.userRole === 'recruiter' || t.userRole === 'admin'));
        }}
      />
    </PageContainer>
  );
};

export default AdminDashboardPage;
