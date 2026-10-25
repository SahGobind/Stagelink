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
import Modal from '../../components/common/Modal';
import ApplicationStatusBadge from '../../components/applications/ApplicationStatusBadge';
import OpportunityPreviewModal from '../../components/opportunities/OpportunityPreviewModal';
import CreateTicketModal from '../../components/support/CreateTicketModal';
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
  const [isLoading, setIsLoading] = useState(true);
  const [loadError, setLoadError] = useState('');

  // Opportunities state (scoped strictly to recruiter's real custom opportunities and drafts)
  const [opportunities, setOpportunities] = useState(() => {
    const custom = getAllCustomOpportunities();
    const drafts = castingService.getDrafts();
    return [...custom, ...drafts];
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
    companyName: currentUser?.companyName || '',
    fullName: currentUser?.fullName || '',
    email: currentUser?.email || '',
    phoneNumber: currentUser?.phoneNumber || '',
    country: currentUser?.country || 'India',
    website: currentUser?.website || '',
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

  const applications = useMemo(() => getAllApplications(), []);

  // Fetch dynamic recruiter data from MongoDB Atlas backend
  useEffect(() => {
    let isMounted = true;
    setIsLoading(true);
    setLoadError('');

    Promise.all([
      castingService.getRecruiterDashboardData(),
      castingService.getRecruiterOpportunities(),
    ])
      .then(([dashData, opps]) => {
        if (!isMounted) return;
        if (dashData && Array.isArray(dashData.opportunities)) {
          setOpportunities(dashData.opportunities);
        } else if (Array.isArray(opps)) {
          setOpportunities(opps);
        }
      })
      .catch((err) => {
        if (isMounted) {
          console.warn('Failed to load recruiter data:', err);
          setLoadError('Unable to load live casting calls from server. Showing local records.');
        }
      })
      .finally(() => {
        if (isMounted) setIsLoading(false);
      });

    return () => {
      isMounted = false;
    };
  }, []);

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
        companyName: u.companyName || '',
        fullName: u.fullName || '',
        email: u.email || '',
        phoneNumber: u.phoneNumber || '',
        country: u.country || 'India',
        website: u.website || '',
      });
    }
  }, []);

  // Profile completion calculation
  const profileCompletion = useMemo(() => {
    const fields = [
      profileForm.companyName,
      profileForm.fullName,
      profileForm.email,
      profileForm.phoneNumber,
      profileForm.website,
      profileForm.country,
    ];
    const filled = fields.filter((f) => f && String(f).trim().length > 0).length;
    return Math.round((filled / fields.length) * 100);
  }, [profileForm]);

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
  const handleSaveCompanyProfile = async (e) => {
    e.preventDefault();
    setIsSavingProfile(true);

    try {
      const updated = await authService.updateCompanyProfile(currentUser?.id, profileForm);
      if (updated) {
        setCurrentUser(updated);
      }
      setIsProfileModalOpen(false);
      showToast('Company profile details saved successfully.');
    } catch (err) {
      showToast(err.message || 'Failed to update company profile.');
    } finally {
      setIsSavingProfile(false);
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
        <div className="space-y-1.5">
          <div className="flex items-center gap-2 flex-wrap">
            <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-md bg-neutral-100 text-brand-navy text-[11px] font-bold uppercase tracking-wider">
              <Building2 className="w-3.5 h-3.5 text-brand-pink" />
              <span>{profileForm.companyName || 'Production Recruiter'}</span>
            </div>
            <span className="px-2 py-0.5 rounded-md text-[10px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
              Verified
            </span>
            <button
              type="button"
              onClick={() => setIsProfileModalOpen(true)}
              className="text-[11px] font-bold text-gray-500 hover:text-brand-pink underline flex items-center gap-1 cursor-pointer"
            >
              <Edit className="w-3 h-3" />
              <span>Edit Profile</span>
            </button>
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold font-serif text-gray-900 tracking-tight">
            Recruiter Dashboard
          </h1>
          <p className="text-xs text-gray-500">
            Overview of your active casting calls, applicant pipeline, and opportunities.
          </p>
        </div>

        {/* Action Buttons */}
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

      {/* Recruiter Welcome & Company Profile Completion Section */}
      <div className="bg-gradient-to-r from-neutral-950 via-slate-900 to-neutral-950 rounded-3xl p-6 sm:p-7 text-white shadow-3d-floating specular-top border border-neutral-800 flex flex-col lg:flex-row lg:items-center justify-between gap-6 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-80 h-80 bg-rose-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="space-y-3 max-w-2xl relative z-10">
          <div className="flex items-center gap-2.5 flex-wrap">
            <span className="text-[10px] font-bold uppercase tracking-wider bg-brand-pink/20 text-pink-300 border border-brand-pink/30 px-3 py-0.5 rounded-full shadow-2xs">
              Production Workspace
            </span>
            <span className="text-xs font-semibold text-slate-300">
              Profile: {profileCompletion}% Completed
            </span>
          </div>

          <div>
            <h2 className="text-xl sm:text-2xl font-bold font-serif text-white tracking-tight">
              Welcome back, {currentUser?.fullName || 'Production Partner'}!
            </h2>
            <p className="text-xs sm:text-sm text-slate-300 mt-1 leading-relaxed">
              {profileForm.companyName
                ? `Managing productions and auditions for ${profileForm.companyName}.`
                : 'Manage your production house, announce casting calls, and discover vetted talent.'}
            </p>
          </div>

          <div className="space-y-1.5 pt-1">
            <div className="flex justify-between text-[11px] text-slate-400">
              <span>Studio Verification &amp; Profile Setup</span>
              <span>{profileCompletion}%</span>
            </div>
            <div className="w-full bg-neutral-800 rounded-full h-2 max-w-md overflow-hidden border border-white/10 shadow-inner-pressed">
              <div
                className="bg-brand-pink h-2 rounded-full transition-all duration-500 shadow-2xs"
                style={{ width: `${profileCompletion}%` }}
              />
            </div>
          </div>
        </div>

        <div className="flex flex-col sm:flex-row lg:flex-col gap-2.5 shrink-0 min-w-[200px] relative z-10">
          <Link to="/post-job" className="w-full">
            <Button size="sm" variant="primary" className="w-full py-2.5 bg-brand-pink hover:bg-rose-700 text-white text-xs font-bold shadow-3d-button-pink hover:shadow-3d-card-hover active:translate-y-0.5 specular-top space-x-1.5 flex items-center justify-center">
              <PlusCircle className="w-4 h-4" />
              <span>Post a Casting Call</span>
            </Button>
          </Link>

          <Link to="/admin/talent" className="w-full">
            <Button size="sm" variant="secondary" className="w-full py-2.5 bg-white/10 hover:bg-white/20 text-white text-xs font-bold border border-white/20 shadow-2xs hover:shadow-xs active:translate-y-0.5 space-x-1.5 flex items-center justify-center">
              <Search className="w-4 h-4 text-pink-300" />
              <span>Discover Talent</span>
            </Button>
          </Link>

          <button
            type="button"
            onClick={() => setIsProfileModalOpen(true)}
            className="w-full py-2 px-3 text-center text-xs font-semibold text-slate-300 hover:text-white transition-colors cursor-pointer"
          >
            Edit Company Details →
          </button>
        </div>
      </div>

      {/* 6 REQUIRED RECRUITER METRIC CARDS */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
        {/* Metric 1: Total Jobs */}
        <div className="p-4 bg-white rounded-2xl border border-slate-200/80 shadow-3d-subtle hover:shadow-3d-card hover:-translate-y-1 specular-top transition-all duration-300 space-y-1">
          <span className="text-[10px] font-bold uppercase text-slate-500 block tracking-wider">
            Total Jobs
          </span>
          <p className="text-2xl sm:text-3xl font-extrabold font-serif text-brand-navy">
            {recruiterStats.total}
          </p>
          <span className="text-[10px] text-slate-400 font-medium">All posted opportunities</span>
        </div>

        {/* Metric 2: Published Jobs */}
        <div className="p-4 bg-white rounded-2xl border border-emerald-100 shadow-3d-subtle hover:shadow-3d-card hover:-translate-y-1 specular-top transition-all duration-300 space-y-1">
          <span className="text-[10px] font-bold uppercase text-emerald-700 block tracking-wider">
            Published Jobs
          </span>
          <p className="text-2xl sm:text-3xl font-extrabold font-serif text-emerald-700">
            {recruiterStats.published}
          </p>
          <span className="text-[10px] text-emerald-600 font-medium">Active &amp; public calls</span>
        </div>

        {/* Metric 3: Drafts */}
        <div className="p-4 bg-white rounded-2xl border border-slate-200/80 shadow-3d-subtle hover:shadow-3d-card hover:-translate-y-1 specular-top transition-all duration-300 space-y-1">
          <span className="text-[10px] font-bold uppercase text-slate-500 block tracking-wider">
            Drafts
          </span>
          <p className="text-2xl sm:text-3xl font-extrabold font-serif text-slate-700">
            {recruiterStats.drafts}
          </p>
          <span className="text-[10px] text-slate-400 font-medium">Saved drafts in progress</span>
        </div>

        {/* Metric 4: Pending Payments */}
        <div className="p-4 bg-white rounded-2xl border border-amber-100 shadow-3d-subtle hover:shadow-3d-card hover:-translate-y-1 specular-top transition-all duration-300 space-y-1">
          <span className="text-[10px] font-bold uppercase text-amber-700 block tracking-wider">
            Pending Payments
          </span>
          <p className="text-2xl sm:text-3xl font-extrabold font-serif text-amber-600">
            {recruiterStats.pendingPayment}
          </p>
          <span className="text-[10px] text-amber-600 font-medium">Awaiting checkout auth</span>
        </div>

        {/* Metric 5: Pending Review */}
        <div className="p-4 bg-white rounded-2xl border border-blue-100 shadow-3d-subtle hover:shadow-3d-card hover:-translate-y-1 specular-top transition-all duration-300 space-y-1">
          <span className="text-[10px] font-bold uppercase text-blue-700 block tracking-wider">
            Pending Review
          </span>
          <p className="text-2xl sm:text-3xl font-extrabold font-serif text-blue-600">
            {recruiterStats.pendingReview}
          </p>
          <span className="text-[10px] text-blue-600 font-medium">In moderation queue</span>
        </div>

        {/* Metric 6: Total Applications */}
        <div className="p-4 bg-white rounded-2xl border border-pink-100 shadow-3d-subtle hover:shadow-3d-card hover:-translate-y-1 specular-top transition-all duration-300 space-y-1">
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
      <div className="bg-white rounded-3xl border border-slate-200/80 shadow-3d-card specular-top overflow-hidden">
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
              {isLoading ? (
                <tr>
                  <td colSpan="5" className="py-12 px-6 text-center text-gray-500 font-medium">
                    <div className="flex flex-col items-center justify-center gap-2">
                      <div className="w-6 h-6 border-2 border-brand-pink border-t-transparent rounded-full animate-spin" />
                      <span className="text-xs">Loading your casting calls...</span>
                    </div>
                  </td>
                </tr>
              ) : opportunities.length === 0 ? (
                <tr>
                  <td colSpan="5" className="py-12 px-6 text-center">
                    <div className="max-w-md mx-auto space-y-3">
                      <div className="w-12 h-12 bg-pink-50 text-brand-pink rounded-2xl flex items-center justify-center mx-auto border border-pink-100 shadow-2xs">
                        <Briefcase className="w-6 h-6" />
                      </div>
                      <h4 className="text-sm font-bold text-gray-900 font-serif">
                        No casting calls announced yet
                      </h4>
                      <p className="text-xs text-gray-500 leading-relaxed">
                        You have not created any casting calls for {profileForm.companyName || 'your production studio'}. Announce your first casting call to start receiving audition submissions from verified talent.
                      </p>
                      <div className="pt-2 flex flex-wrap items-center justify-center gap-2.5">
                        <Link to="/post-job">
                          <Button size="sm" variant="primary" className="bg-brand-pink hover:bg-rose-700 text-white text-xs font-bold space-x-1.5 shadow-xs">
                            <PlusCircle className="w-3.5 h-3.5" />
                            <span>Post a Casting Call</span>
                          </Button>
                        </Link>
                        <Link to="/admin/talent">
                          <Button size="sm" variant="secondary" className="text-xs font-bold space-x-1.5 border-gray-300">
                            <Search className="w-3.5 h-3.5" />
                            <span>Discover Talent</span>
                          </Button>
                        </Link>
                      </div>
                    </div>
                  </td>
                </tr>
              ) : (
                opportunities.slice(0, 6).map((opp) => {
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
              })
            )}
            </tbody>
          </table>
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
