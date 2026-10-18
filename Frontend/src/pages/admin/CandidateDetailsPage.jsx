import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import {
  ArrowLeft,
  ShieldCheck,
  ShieldAlert,
  CheckCircle2,
  Clock,
  Star,
  MessageSquare,
  AlertCircle,
  FileText,
  ExternalLink,
  Calendar,
  MapPin,
  Eye,
  Lock,
  Unlock,
  Phone,
  Mail,
  Award,
  ChevronRight,
  Download,
  AlertTriangle,
  Play,
  Briefcase,
  Globe,
} from 'lucide-react';

import PageContainer from '../../components/layout/PageContainer';
import Button from '../../components/common/Button';
import Modal from '../../components/common/Modal';
import ApplicationStatusBadge from '../../components/applications/ApplicationStatusBadge';
import PortfolioGallery from '../../components/profile/PortfolioGallery';
import ExperienceList from '../../components/profile/ExperienceList';
import SkillsList from '../../components/profile/SkillsList';
import CandidateAccessLock from '../../components/common/CandidateAccessLock';
import { hasCompletedPostingPayment, EVENT_PAYMENT_STATE_CHANGED } from '../../utils/paymentAccess';

import {
  getCandidateById,
  updateCandidateInList,
} from '../../data/mockCandidates';
import {
  getApplicationsByCandidateId,
  saveCandidateApplication,
} from '../../data/mockApplications';
import { mockOpportunities } from '../../data/mockOpportunities';

const CandidateDetailsPage = () => {
  const { id } = useParams();

  const [hasPaid, setHasPaid] = useState(() => hasCompletedPostingPayment());

  useEffect(() => {
    const checkPayment = () => setHasPaid(hasCompletedPostingPayment());
    window.addEventListener(EVENT_PAYMENT_STATE_CHANGED, checkPayment);
    window.addEventListener('storage', checkPayment);
    return () => {
      window.removeEventListener(EVENT_PAYMENT_STATE_CHANGED, checkPayment);
      window.removeEventListener('storage', checkPayment);
    };
  }, []);

  // Candidate state (persisted via mockCandidates helper)
  const [candidate, setCandidate] = useState(null);
  const [applications, setApplications] = useState([]);
  const [loading, setLoading] = useState(true);

  // Notification toast message
  const [notification, setNotification] = useState(null);

  // Modals state
  const [isReviewModalOpen, setIsReviewModalOpen] = useState(false);
  const [isVerifyModalOpen, setIsVerifyModalOpen] = useState(false);
  const [isVerifyWarningOpen, setIsVerifyWarningOpen] = useState(false);
  const [isShortlistModalOpen, setIsShortlistModalOpen] = useState(false);
  const [isStatusModalOpen, setIsStatusModalOpen] = useState(false);
  const [isResumeModalOpen, setIsResumeModalOpen] = useState(false);
  const [isVideoModalOpen, setIsVideoModalOpen] = useState(false);
  const [selectedVideo, setSelectedVideo] = useState(null);

  // Form states for modals
  const [selectedOpportunityId, setSelectedOpportunityId] = useState('');
  const [shortlistNotes, setShortlistNotes] = useState('');
  const [targetStatus, setTargetStatus] = useState('');

  // Load candidate and applications
  useEffect(() => {
    const data = getCandidateById(id);
    if (data) {
      setCandidate(data);
      const apps = getApplicationsByCandidateId(data.id);
      setApplications(apps);
    }
    setLoading(false);
  }, [id]);

  const showToast = (message, type = 'success') => {
    setNotification({ message, type });
    setTimeout(() => setNotification(null), 4000);
  };

  // 1. Mark as Reviewed Action
  const handleConfirmReview = () => {
    if (!candidate) return;
    const updated = {
      ...candidate,
      isReviewed: true,
      lastReviewedAt: new Date().toISOString(),
    };
    updateCandidateInList(candidate.id, updated);
    setCandidate(updated);
    setIsReviewModalOpen(false);
    showToast(`Profile for ${candidate.fullName} has been marked as officially reviewed.`);
  };

  // 2. Verification Action (Gated by isReviewed)
  const handleInitiateVerification = () => {
    if (!candidate) return;
    if (!candidate.isReviewed) {
      // Must review first!
      setIsVerifyWarningOpen(true);
      return;
    }
    setIsVerifyModalOpen(true);
  };

  const handleConfirmVerification = () => {
    if (!candidate) return;
    const isCurrentlyVerified = candidate.verificationStatus === 'verified';
    const updated = {
      ...candidate,
      verificationStatus: isCurrentlyVerified ? 'unverified' : 'verified',
      verifiedAt: isCurrentlyVerified ? null : new Date().toISOString(),
    };
    updateCandidateInList(candidate.id, updated);
    setCandidate(updated);
    setIsVerifyModalOpen(false);
    showToast(
      isCurrentlyVerified
        ? `StageLink Verified status has been revoked for ${candidate.fullName}.`
        : `Official StageLink Verified badge awarded to ${candidate.fullName}!`
    );
  };

  // 3. Shortlist Action
  const handleConfirmShortlist = () => {
    if (!candidate || !selectedOpportunityId) return;

    const opp = mockOpportunities.find((o) => o.id === selectedOpportunityId);
    const updatedShortlisted = Array.from(
      new Set([...(candidate.shortlistedOpportunities || []), selectedOpportunityId])
    );

    // Update candidate
    const updatedCandidate = {
      ...candidate,
      shortlistedOpportunities: updatedShortlisted,
    };
    updateCandidateInList(candidate.id, updatedCandidate);
    setCandidate(updatedCandidate);

    // Save as application entry so it reflects in application history
    const existingApp = applications.find((a) => a.opportunityId === selectedOpportunityId);
    if (!existingApp && opp) {
      const newApp = {
        id: `app-auto-${Date.now()}`,
        opportunityId: opp.id,
        opportunityTitle: opp.title,
        productionCompany: opp.productionCompany,
        candidateId: candidate.id,
        candidateName: candidate.fullName,
        roleAppliedFor: opp.roles?.[0]?.name || 'Lead Audition Candidate',
        status: 'shortlisted',
        appliedDate: new Date().toISOString().split('T')[0],
        notes: shortlistNotes || 'Candidate directly shortlisted by Admin.',
      };
      saveCandidateApplication(newApp);
      setApplications((prev) => [newApp, ...prev]);
    }

    setIsShortlistModalOpen(false);
    setSelectedOpportunityId('');
    setShortlistNotes('');
    showToast(
      `${candidate.fullName} has been successfully shortlisted for "${opp?.title || 'Selected Opportunity'}"!`
    );
  };

  // 4. Change Status Action
  const handleInitiateStatusChange = (status) => {
    setTargetStatus(status);
    setIsStatusModalOpen(true);
  };

  const handleConfirmStatusChange = () => {
    if (!candidate || !targetStatus) return;
    const updated = {
      ...candidate,
      status: targetStatus,
    };
    updateCandidateInList(candidate.id, updated);
    setCandidate(updated);
    setIsStatusModalOpen(false);
    showToast(`Account status for ${candidate.fullName} changed to "${targetStatus}".`);
  };

  // Open Video Preview
  const handlePlayVideo = (videoObj) => {
    setSelectedVideo(videoObj);
    setIsVideoModalOpen(true);
  };

  if (loading || !candidate) {
    return (
      <PageContainer className="py-12 text-center">
        <p className="text-gray-500">Loading candidate profile...</p>
      </PageContainer>
    );
  }

  if (!hasPaid) {
    return (
      <PageContainer className="space-y-6 pb-16 py-8 text-left">
        <div>
          <Link
            to="/admin/candidates"
            className="inline-flex items-center text-xs font-semibold text-gray-500 hover:text-black transition-colors"
          >
            <ArrowLeft className="w-3.5 h-3.5 mr-1" />
            <span>Back to Candidates</span>
          </Link>
        </div>
        <CandidateAccessLock
          title="Candidate Profile Details are Locked"
          subtitle="You must announce work and complete the posting payment via JuicePay Credit Card or PayPal to view performer profiles, audition reels, and contact info."
        />
      </PageContainer>
    );
  }

  const isVerified = candidate.verificationStatus === 'verified';
  const isReviewed = Boolean(candidate.isReviewed);
  const hasContactPermission = Boolean(candidate.contactPermissionGranted);

  return (
    <PageContainer className="space-y-6 pb-16">
      {/* Toast Notification */}
      {notification && (
        <div
          role="status"
          aria-live="polite"
          className={`fixed bottom-6 right-6 z-50 px-5 py-3 rounded-2xl shadow-xl border flex items-center gap-3 animate-in fade-in slide-in-from-bottom-3 duration-200 ${
            notification.type === 'error'
              ? 'bg-red-900 text-white border-red-700'
              : 'bg-brand-navy text-white border-white/20'
          }`}
        >
          <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" />
          <span className="text-xs font-semibold">{notification.message}</span>
        </div>
      )}

      {/* Top Navigation & Breadcrumbs */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-2 text-xs">
          <Link
            to="/admin/candidates"
            className="inline-flex items-center text-gray-500 hover:text-brand-pink font-medium transition-colors"
          >
            <ArrowLeft className="w-3.5 h-3.5 mr-1" />
            <span>Performer Directory</span>
          </Link>
          <ChevronRight className="w-3 h-3 text-gray-400" />
          <span className="text-gray-400 font-mono">ID: {candidate.id}</span>
          <ChevronRight className="w-3 h-3 text-gray-400" />
          <span className="font-semibold text-brand-navy">{candidate.fullName}</span>
        </div>

        {/* Quick Messaging Link */}
        <div className="flex items-center gap-2">
          <Link to={`/admin/messages?candidateId=${candidate.id}`}>
            <Button size="sm" variant="outline" className="text-xs space-x-1.5 border-brand-border">
              <MessageSquare className="w-3.5 h-3.5 text-brand-pink" />
              <span>Direct Platform Message</span>
            </Button>
          </Link>
        </div>
      </div>

      {/* ADMIN ACTION CONTROL PANEL */}
      <div className="bg-white rounded-2xl border border-brand-border p-4 sm:p-5 shadow-xs">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold uppercase tracking-wider text-gray-400">
                Admin Control Bar
              </span>
              <span className="inline-block w-1.5 h-1.5 rounded-full bg-emerald-500" />
              <span className="text-xs text-gray-500">Live Management Mode</span>
            </div>
            <p className="text-xs text-gray-500">
              Perform audited actions, review submissions, and manage casting shortlists for this performer.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            {/* Action 1: Mark as Reviewed */}
            {isReviewed ? (
              <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-emerald-50 text-emerald-800 border border-emerald-200 text-xs font-semibold">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                <span>Reviewed by Admin</span>
              </span>
            ) : (
              <Button
                size="sm"
                variant="outline"
                onClick={() => setIsReviewModalOpen(true)}
                className="text-xs space-x-1.5 border-amber-300 text-amber-900 bg-amber-50/70 hover:bg-amber-100"
              >
                <CheckCircle2 className="w-3.5 h-3.5 text-amber-600" />
                <span>Mark Profile Reviewed</span>
              </Button>
            )}

            {/* Action 2: Verify Profile (Requires Review) */}
            {isVerified ? (
              <Button
                size="sm"
                variant="outline"
                onClick={handleInitiateVerification}
                className="text-xs space-x-1.5 border-emerald-300 text-emerald-800 bg-emerald-50/60 hover:bg-emerald-100"
              >
                <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
                <span>Verified Talent (Revoke)</span>
              </Button>
            ) : (
              <Button
                size="sm"
                variant="outline"
                onClick={handleInitiateVerification}
                className={`text-xs space-x-1.5 ${
                  isReviewed
                    ? 'border-brand-navy text-brand-navy hover:bg-gray-50'
                    : 'border-gray-200 text-gray-400 hover:border-amber-300 hover:text-amber-700'
                }`}
              >
                <ShieldAlert className="w-3.5 h-3.5" />
                <span>Verify Profile</span>
              </Button>
            )}

            {/* Action 3: Shortlist for Opportunity */}
            <Button
              size="sm"
              variant="secondary"
              onClick={() => setIsShortlistModalOpen(true)}
              className="text-xs space-x-1.5"
            >
              <Star className="w-3.5 h-3.5 text-amber-400 fill-amber-400" />
              <span>Shortlist for Role</span>
            </Button>

            {/* Action 4: Change Status Dropdown */}
            <div className="relative inline-block">
              <select
                aria-label="Change candidate status"
                value={candidate.status || 'active'}
                onChange={(e) => handleInitiateStatusChange(e.target.value)}
                className="px-3 py-1.5 text-xs font-semibold rounded-xl border border-brand-border bg-white text-brand-navy hover:border-gray-400 focus:outline-hidden focus:ring-1 focus:ring-brand-pink transition-all cursor-pointer"
              >
                <option value="active">Status: Active</option>
                <option value="pending_review">Status: Pending Review</option>
                <option value="unverified">Status: Unverified</option>
                <option value="suspended">Status: Suspended</option>
              </select>
            </div>
          </div>
        </div>
      </div>

      {/* PROFILE HEADER CARD */}
      <div className="bg-white rounded-3xl border border-brand-border overflow-hidden shadow-card">
        {/* Cover Banner */}
        <div className="relative h-44 sm:h-56 w-full bg-brand-navy overflow-hidden">
          {candidate.coverImage ? (
            <img
              src={candidate.coverImage}
              alt="Cover"
              className="w-full h-full object-cover object-center opacity-80"
            />
          ) : (
            <div className="w-full h-full bg-linear-to-r from-zinc-900 via-neutral-900 to-black" />
          )}
          <div className="absolute inset-0 bg-linear-to-t from-black/80 via-black/25 to-transparent" />

          {/* Top Floating Badges */}
          <div className="absolute top-4 left-4 right-4 flex flex-wrap items-center justify-between gap-2">
            <div className="flex items-center gap-2">
              {/* Verification status badge */}
              {isVerified ? (
                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-600/95 text-white text-[11px] font-bold backdrop-blur-md shadow-xs">
                  <ShieldCheck className="w-3.5 h-3.5" />
                  <span>StageLink Verified Talent</span>
                </span>
              ) : candidate.verificationStatus === 'pending_review' ? (
                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-500/90 text-white text-[11px] font-bold backdrop-blur-md shadow-xs">
                  <Clock className="w-3.5 h-3.5" />
                  <span>Verification Pending Review</span>
                </span>
              ) : (
                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-gray-700/90 text-white text-[11px] font-bold backdrop-blur-md shadow-xs">
                  <AlertCircle className="w-3.5 h-3.5 text-gray-300" />
                  <span>Unverified Account</span>
                </span>
              )}

              {/* Status Badge */}
              <span
                className={`inline-flex items-center px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider backdrop-blur-md ${
                  candidate.status === 'active'
                    ? 'bg-white/20 text-white border border-white/30'
                    : candidate.status === 'suspended'
                    ? 'bg-red-500/90 text-white'
                    : 'bg-amber-400/90 text-black'
                }`}
              >
                {candidate.status || 'Active'}
              </span>
            </div>

            {/* Union & Availability */}
            <div className="flex items-center gap-2">
              {candidate.unionStatus && (
                <span className="hidden sm:inline-flex items-center gap-1 px-3 py-1 rounded-full bg-black/50 text-white text-[11px] font-medium border border-white/20">
                  <Award className="w-3 h-3 text-amber-300" />
                  <span>{candidate.unionStatus}</span>
                </span>
              )}
              {candidate.availability && (
                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-500 text-white text-[11px] font-bold">
                  <span className="w-2 h-2 rounded-full bg-white animate-pulse" />
                  <span>{candidate.availability}</span>
                </span>
              )}
            </div>
          </div>
        </div>

        {/* Profile Info Row */}
        <div className="px-6 sm:px-8 pb-8 pt-0 relative">
          <div className="flex flex-col sm:flex-row items-center sm:items-end justify-between gap-6 -mt-16 sm:-mt-20 mb-6">
            <div className="flex flex-col sm:flex-row items-center sm:items-end gap-5 text-center sm:text-left">
              <div className="w-32 h-32 rounded-3xl overflow-hidden ring-4 ring-white shadow-xl bg-white shrink-0">
                <img
                  src={candidate.avatar}
                  alt={candidate.fullName}
                  className="w-full h-full object-cover object-top"
                />
              </div>

              <div className="space-y-1.5">
                <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2.5">
                  <h1 className="text-2xl sm:text-3xl font-bold text-brand-navy font-serif">
                    {candidate.fullName}
                  </h1>
                  <span className="px-2.5 py-0.5 rounded-full bg-gray-100 text-brand-navy text-[11px] font-semibold">
                    {candidate.yearsOfExperience || 0}+ Years Experience
                  </span>
                </div>

                <p className="text-sm font-semibold text-brand-text-secondary max-w-xl">
                  {candidate.headline}
                </p>

                <div className="flex flex-wrap items-center justify-center sm:justify-start gap-x-4 gap-y-1 text-xs text-gray-500 pt-1">
                  <div className="flex items-center gap-1">
                    <MapPin className="w-3.5 h-3.5 text-gray-400" />
                    <span>{candidate.location}</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <Calendar className="w-3.5 h-3.5 text-gray-400" />
                    <span>Registered: {candidate.registeredDate || 'September 2026'}</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Completion Meter */}
            <div className="bg-gray-50 border border-gray-200 rounded-2xl p-4 w-full sm:w-64 shrink-0 text-left">
              <div className="flex items-center justify-between text-xs mb-1.5">
                <span className="font-semibold text-brand-navy">Profile Completion</span>
                <span className="font-bold text-brand-pink">{candidate.profileCompletion || 85}%</span>
              </div>
              <div className="w-full h-2 rounded-full bg-gray-200 overflow-hidden">
                <div
                  className="h-full bg-linear-to-r from-brand-pink to-brand-navy rounded-full transition-all"
                  style={{ width: `${candidate.profileCompletion || 85}%` }}
                />
              </div>
              <p className="text-[10px] text-gray-500 mt-1.5">
                Verified headshots, credentials & acting credits cataloged
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* CONTACT PRIVACY & PLATFORM MESSAGING STATUS (CRITICAL PRIVACY RULE) */}
      <div
        className={`rounded-2xl border p-5 transition-all ${
          hasContactPermission
            ? 'bg-emerald-50/50 border-emerald-200'
            : 'bg-amber-50/60 border-amber-200'
        }`}
      >
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-start gap-3.5">
            <div
              className={`p-2.5 rounded-xl shrink-0 ${
                hasContactPermission
                  ? 'bg-emerald-100 text-emerald-800'
                  : 'bg-amber-100 text-amber-800'
              }`}
            >
              {hasContactPermission ? (
                <Unlock className="w-5 h-5 text-emerald-700" />
              ) : (
                <Lock className="w-5 h-5 text-amber-700" />
              )}
            </div>

            <div className="space-y-1">
              <div className="flex flex-wrap items-center gap-2">
                <h3 className="text-sm font-bold text-brand-navy font-serif">
                  {hasContactPermission
                    ? 'Direct External Contact Permitted by Performer'
                    : 'Candidate Contact Privacy Protected — Platform Messaging Only'}
                </h3>
                <span
                  className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                    hasContactPermission
                      ? 'bg-emerald-200/60 text-emerald-900'
                      : 'bg-amber-200/80 text-amber-900'
                  }`}
                >
                  {hasContactPermission ? 'Permission Granted' : 'Restricted Access'}
                </span>
              </div>

              <p className="text-xs text-gray-600 leading-relaxed max-w-2xl">
                {hasContactPermission
                  ? 'This performer has authorized verified casting teams and StageLink administrators to view their primary phone and email coordinates for audition logistics.'
                  : 'Candidate has not released private phone or direct email to external contacts. All casting invitations, audition notes, and audition bookings MUST be conducted via the StageLink platform messaging UI.'}
              </p>

              {/* Direct coordinates or masked representation */}
              <div className="flex flex-wrap items-center gap-4 pt-2 text-xs">
                <div className="flex items-center gap-1.5">
                  <Mail className="w-3.5 h-3.5 text-gray-500" />
                  {hasContactPermission ? (
                    <a
                      href={`mailto:${candidate.contactEmail}`}
                      className="font-semibold text-brand-navy hover:underline"
                    >
                      {candidate.contactEmail}
                    </a>
                  ) : (
                    <span className="font-mono text-gray-400 bg-white/70 px-2 py-0.5 rounded-md border border-gray-200">
                      {candidate.contactEmail?.replace(/(.{2})(.*)(@.*)/, '$1••••••$3') ||
                        '•••••••••@protected.talent'}
                    </span>
                  )}
                </div>

                <div className="flex items-center gap-1.5">
                  <Phone className="w-3.5 h-3.5 text-gray-500" />
                  {hasContactPermission ? (
                    <a
                      href={`tel:${candidate.phone}`}
                      className="font-semibold text-brand-navy hover:underline"
                    >
                      {candidate.phone}
                    </a>
                  ) : (
                    <span className="font-mono text-gray-400 bg-white/70 px-2 py-0.5 rounded-md border border-gray-200">
                      +44 ••• ••• ••• (Hidden)
                    </span>
                  )}
                </div>
              </div>
            </div>
          </div>

          <Link to={`/admin/messages?candidateId=${candidate.id}`} className="shrink-0">
            <Button
              size="sm"
              variant={hasContactPermission ? 'outline' : 'primary'}
              className="w-full md:w-auto text-xs space-x-1.5"
            >
              <MessageSquare className="w-3.5 h-3.5" />
              <span>Open Platform Chat</span>
            </Button>
          </Link>
        </div>
      </div>

      {/* MAIN TWO-COLUMN LAYOUT */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* LEFT / CENTER CONTENT (2 COLS) */}
        <div className="lg:col-span-2 space-y-6">
          {/* Section: Biography / Artist Statement */}
          <div className="bg-white rounded-3xl border border-brand-border p-6 sm:p-8 shadow-card space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-gray-100">
              <h2 className="text-lg font-bold text-brand-navy font-serif">
                Performer Biography & Artist Statement
              </h2>
              <span className="text-[11px] font-semibold text-gray-400">Curated Bio</span>
            </div>
            <p className="text-sm text-gray-700 leading-relaxed whitespace-pre-line">
              {candidate.bio}
            </p>
          </div>

          {/* Section: Acting Experience / Credits */}
          <ExperienceList experience={candidate.experience || []} />

          {/* Section: Portfolio Gallery */}
          <PortfolioGallery
            headshots={candidate.portfolio?.headshots || []}
            portfolioPhotos={candidate.portfolio?.portfolioPhotos || []}
          />

          {/* Section: Video Showreels & Casting Resume References */}
          <div className="bg-white rounded-3xl border border-brand-border p-6 sm:p-8 shadow-card space-y-6">
            <div className="flex items-center justify-between pb-3 border-b border-gray-100">
              <div>
                <h2 className="text-lg font-bold text-brand-navy font-serif">
                  Video Slates & Resume References
                </h2>
                <p className="text-xs text-gray-500">
                  Self-tapes, showreels, and theatrical PDF resume documentation
                </p>
              </div>
            </div>

            {/* Video Cards Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {/* Slate Video */}
              <div className="p-4 rounded-2xl border border-gray-200 bg-gray-50/60 hover:bg-white transition-all space-y-3">
                <div className="relative aspect-video rounded-xl overflow-hidden bg-brand-navy group">
                  <img
                    src={
                      candidate.portfolio?.introVideo?.thumbnail ||
                      candidate.avatar
                    }
                    alt="Intro Slate"
                    className="w-full h-full object-cover group-hover:scale-105 transition-all duration-300"
                  />
                  <div className="absolute inset-0 bg-black/40 flex items-center justify-center">
                    <button
                      type="button"
                      onClick={() =>
                        handlePlayVideo({
                          title:
                            candidate.portfolio?.introVideo?.title ||
                            `${candidate.fullName} - Introduction Slate`,
                          url: candidate.portfolio?.introVideo?.url,
                          duration: candidate.portfolio?.introVideo?.duration || '1:15',
                        })
                      }
                      className="w-11 h-11 rounded-full bg-white/90 text-brand-navy flex items-center justify-center shadow-lg hover:scale-110 transition-transform cursor-pointer"
                    >
                      <Play className="w-5 h-5 ml-0.5 fill-current text-brand-pink" />
                    </button>
                  </div>
                  <span className="absolute bottom-2 right-2 bg-black/70 text-white text-[10px] font-mono font-bold px-2 py-0.5 rounded-md">
                    {candidate.portfolio?.introVideo?.duration || '1:12'}
                  </span>
                </div>
                <div>
                  <h4 className="text-xs font-bold text-brand-navy">
                    {candidate.portfolio?.introVideo?.title || 'Audition Slate & Introduction'}
                  </h4>
                  <p className="text-[11px] text-gray-500">Official Self-Tape Greeting (2026)</p>
                </div>
              </div>

              {/* Showreel Video */}
              <div className="p-4 rounded-2xl border border-gray-200 bg-gray-50/60 hover:bg-white transition-all space-y-3">
                <div className="relative aspect-video rounded-xl overflow-hidden bg-brand-navy group">
                  <img
                    src={
                      candidate.portfolio?.actingReel?.thumbnail ||
                      candidate.coverImage ||
                      candidate.avatar
                    }
                    alt="Acting Reel"
                    className="w-full h-full object-cover group-hover:scale-105 transition-all duration-300"
                  />
                  <div className="absolute inset-0 bg-black/40 flex items-center justify-center">
                    <button
                      type="button"
                      onClick={() =>
                        handlePlayVideo({
                          title:
                            candidate.portfolio?.actingReel?.title ||
                            `${candidate.fullName} - Feature Dramatic Reel`,
                          url: candidate.portfolio?.actingReel?.url,
                          duration: candidate.portfolio?.actingReel?.duration || '2:48',
                        })
                      }
                      className="w-11 h-11 rounded-full bg-white/90 text-brand-navy flex items-center justify-center shadow-lg hover:scale-110 transition-transform cursor-pointer"
                    >
                      <Play className="w-5 h-5 ml-0.5 fill-current text-brand-pink" />
                    </button>
                  </div>
                  <span className="absolute bottom-2 right-2 bg-black/70 text-white text-[10px] font-mono font-bold px-2 py-0.5 rounded-md">
                    {candidate.portfolio?.actingReel?.duration || '2:48'}
                  </span>
                </div>
                <div>
                  <h4 className="text-xs font-bold text-brand-navy">
                    {candidate.portfolio?.actingReel?.title || 'Dramatic Showreel & Action Reel'}
                  </h4>
                  <p className="text-[11px] text-gray-500">Feature film & television compilation</p>
                </div>
              </div>
            </div>

            {/* Casting Resume Reference */}
            <div className="p-4 rounded-2xl border border-brand-border bg-brand-pink-light/30 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                <div className="p-3 rounded-xl bg-white text-brand-pink border border-brand-pink/20 shadow-xs">
                  <FileText className="w-6 h-6" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h4 className="text-xs font-bold text-brand-navy">
                      {candidate.portfolio?.resume?.fileName ||
                        `${candidate.fullName.replace(/\s+/g, '_')}_Resume_2026.pdf`}
                    </h4>
                    <span className="px-2 py-0.5 rounded-full bg-white text-gray-500 border border-gray-200 text-[10px] font-mono">
                      {candidate.portfolio?.resume?.fileSize || '2.4 MB'}
                    </span>
                  </div>
                  <p className="text-[11px] text-gray-500">
                    Uploaded {candidate.portfolio?.resume?.uploadDate || 'October 2026'} • 2-page theatrical resume
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => setIsResumeModalOpen(true)}
                  className="text-xs border-brand-border"
                >
                  <Eye className="w-3.5 h-3.5 mr-1" />
                  <span>Preview Resume</span>
                </Button>
              </div>
            </div>
          </div>

          {/* Section: Candidate Application History */}
          <div className="bg-white rounded-3xl border border-brand-border p-6 sm:p-8 shadow-card space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-gray-100">
              <div>
                <h2 className="text-lg font-bold text-brand-navy font-serif">
                  Casting Application History
                </h2>
                <p className="text-xs text-gray-500">
                  Roles and productions this performer has applied or been shortlisted for
                </p>
              </div>
              <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-gray-100 text-brand-navy">
                {applications.length} Submissions
              </span>
            </div>

            {applications.length === 0 ? (
              <div className="text-center py-8 text-gray-400 text-xs">
                <Briefcase className="w-8 h-8 mx-auto mb-2 opacity-50" />
                <p>No recorded casting submissions for this candidate yet.</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead className="bg-gray-50 text-gray-500 font-semibold border-b border-gray-200">
                    <tr>
                      <th className="py-2.5 px-3">Opportunity</th>
                      <th className="py-2.5 px-3">Production Company</th>
                      <th className="py-2.5 px-3">Role Applied</th>
                      <th className="py-2.5 px-3">Applied Date</th>
                      <th className="py-2.5 px-3">Status</th>
                      <th className="py-2.5 px-3">Notes</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    {applications.map((app) => (
                      <tr key={app.id} className="hover:bg-gray-50/70">
                        <td className="py-3 px-3 font-semibold text-brand-navy">
                          <Link
                            to={`/opportunities/${app.opportunityId}`}
                            className="hover:text-brand-pink hover:underline"
                          >
                            {app.opportunityTitle}
                          </Link>
                        </td>
                        <td className="py-3 px-3 text-gray-600">
                          {app.productionCompany}
                        </td>
                        <td className="py-3 px-3 font-medium text-brand-navy">
                          {app.roleAppliedFor}
                        </td>
                        <td className="py-3 px-3 font-mono text-gray-500">
                          {app.appliedDate}
                        </td>
                        <td className="py-3 px-3">
                          <ApplicationStatusBadge status={app.status} />
                        </td>
                        <td className="py-3 px-3 text-gray-500 max-w-xs truncate" title={app.notes}>
                          {app.notes || '—'}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>

        {/* RIGHT COLUMN: PROFESSIONAL INFO & AUDIT LOG (1 COL) */}
        <div className="space-y-6">
          {/* Professional Information Card */}
          <div className="bg-white rounded-3xl border border-brand-border p-6 shadow-card space-y-4">
            <h3 className="text-base font-bold text-brand-navy font-serif pb-2 border-b border-gray-100">
              Professional & Physical Specs
            </h3>

            <div className="space-y-3 text-xs">
              <div className="flex items-center justify-between py-1 border-b border-gray-50">
                <span className="text-gray-500">Experience Level:</span>
                <span className="font-semibold text-brand-navy">{candidate.experienceLevel || 'Senior'}</span>
              </div>
              <div className="flex items-center justify-between py-1 border-b border-gray-50">
                <span className="text-gray-500">Union Status:</span>
                <span className="font-semibold text-brand-navy">{candidate.unionStatus || 'Non-Union'}</span>
              </div>
              <div className="flex items-center justify-between py-1 border-b border-gray-50">
                <span className="text-gray-500">Gender:</span>
                <span className="font-semibold text-brand-navy">{candidate.gender || 'Female'}</span>
              </div>
              <div className="flex items-center justify-between py-1 border-b border-gray-50">
                <span className="text-gray-500">Height:</span>
                <span className="font-semibold text-brand-navy">{candidate.height || "5'8\" (173 cm)"}</span>
              </div>
              <div className="flex items-center justify-between py-1 border-b border-gray-50">
                <span className="text-gray-500">Eye Color:</span>
                <span className="font-semibold text-brand-navy">{candidate.eyeColor || 'Hazel Green'}</span>
              </div>
              <div className="flex items-center justify-between py-1 border-b border-gray-50">
                <span className="text-gray-500">Hair Color:</span>
                <span className="font-semibold text-brand-navy">{candidate.hairColor || 'Dark Brown'}</span>
              </div>
              <div className="flex items-center justify-between py-1 border-b border-gray-50">
                <span className="text-gray-500">Date of Birth:</span>
                <span className="font-semibold text-brand-navy">{candidate.dateOfBirth || '1998-05-14'}</span>
              </div>
              <div className="flex items-center justify-between py-1 border-b border-gray-50">
                <span className="text-gray-500">Travel Flexibility:</span>
                <span className="font-semibold text-brand-navy">{candidate.travelStatus || 'Worldwide'}</span>
              </div>
              <div className="flex items-center justify-between py-1">
                <span className="text-gray-500">Availability:</span>
                <span className="font-semibold text-emerald-600">{candidate.availability || 'Immediate'}</span>
              </div>
            </div>
          </div>

          {/* Languages & Accents */}
          <div className="bg-white rounded-3xl border border-brand-border p-6 shadow-card space-y-3">
            <h3 className="text-base font-bold text-brand-navy font-serif pb-2 border-b border-gray-100 flex items-center gap-2">
              <Globe className="w-4 h-4 text-brand-pink" />
              <span>Languages & Dialects</span>
            </h3>

            <div className="flex flex-wrap gap-1.5 pt-1">
              {(candidate.languages || ['English', 'French']).map((lang, idx) => (
                <span
                  key={idx}
                  className="px-2.5 py-1 rounded-xl bg-gray-100 text-brand-navy text-xs font-medium"
                >
                  {lang}
                </span>
              ))}
            </div>
          </div>

          {/* Performance Skills */}
          <SkillsList
            skills={candidate.skills || []}
            skillsByCategory={candidate.skillsByCategory}
            languages={candidate.languages}
          />

          {/* Admin Audit & Metadata */}
          <div className="bg-gray-50 rounded-3xl border border-gray-200 p-6 space-y-3 text-xs">
            <h4 className="font-bold text-brand-navy uppercase tracking-wider text-[11px]">
              Admin Verification Audit
            </h4>
            <div className="space-y-2 text-gray-600">
              <div className="flex justify-between">
                <span>Verification State:</span>
                <span className="font-bold capitalize text-brand-navy">
                  {candidate.verificationStatus || 'unverified'}
                </span>
              </div>
              <div className="flex justify-between">
                <span>Profile Reviewed:</span>
                <span className="font-bold text-brand-navy">
                  {isReviewed ? 'Yes (Audited)' : 'No (Pending)'}
                </span>
              </div>
              <div className="flex justify-between">
                <span>Shortlisted Roles:</span>
                <span className="font-bold text-brand-navy">
                  {candidate.shortlistedOpportunities?.length || 0}
                </span>
              </div>
              <div className="flex justify-between">
                <span>Account Created:</span>
                <span className="font-mono text-gray-500">
                  {candidate.registeredDate || '2026-09-15'}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* =========================================================================
          MODALS & CONFIRMATION DIALOGS FOR CONSEQUENTIAL ACTIONS
      ========================================================================= */}

      {/* Modal 1: Confirm Profile Review */}
      <Modal
        isOpen={isReviewModalOpen}
        onClose={() => setIsReviewModalOpen(false)}
        title="Confirm Profile Review"
        size="md"
      >
        <div className="p-6 space-y-4">
          <div className="flex items-center gap-3 p-3 bg-amber-50 rounded-2xl border border-amber-200 text-amber-800 text-xs">
            <AlertCircle className="w-5 h-5 shrink-0 text-amber-600" />
            <p>
              You are certifying that you have checked the headshots, credits, and identification details for{' '}
              <strong>{candidate.fullName}</strong>.
            </p>
          </div>

          <p className="text-xs text-gray-600 leading-relaxed">
            Marking this profile as reviewed authorizes the candidate to proceed to official verification.
          </p>

          <div className="flex items-center justify-end gap-3 pt-3 border-t border-gray-100">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setIsReviewModalOpen(false)}
            >
              Cancel
            </Button>
            <Button
              variant="primary"
              size="sm"
              onClick={handleConfirmReview}
            >
              Confirm Review Completed
            </Button>
          </div>
        </div>
      </Modal>

      {/* Modal 2: Warning when trying to verify without review first */}
      <Modal
        isOpen={isVerifyWarningOpen}
        onClose={() => setIsVerifyWarningOpen(false)}
        title="Admin Review Required"
        size="md"
      >
        <div className="p-6 space-y-4 text-xs">
          <div className="flex items-start gap-3 p-3 bg-red-50 rounded-2xl border border-red-200 text-red-800">
            <AlertTriangle className="w-5 h-5 shrink-0 text-red-600" />
            <div className="space-y-1">
              <h4 className="font-bold">Cannot Verify Unreviewed Talent</h4>
              <p>
                StageLink platform policy requires an admin to complete a preliminary review of headshots and identity before granting official Verified status.
              </p>
            </div>
          </div>

          <p className="text-gray-600">
            Please click <strong>"Mark Profile Reviewed"</strong> first. Once reviewed, you can grant the verified trust badge.
          </p>

          <div className="flex items-center justify-end gap-3 pt-3 border-t border-gray-100">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setIsVerifyWarningOpen(false)}
            >
              Close
            </Button>
            <Button
              variant="primary"
              size="sm"
              onClick={() => {
                setIsVerifyWarningOpen(false);
                setIsReviewModalOpen(true);
              }}
            >
              Review Profile Now
            </Button>
          </div>
        </div>
      </Modal>

      {/* Modal 3: Confirm Verification (or Revoke) */}
      <Modal
        isOpen={isVerifyModalOpen}
        onClose={() => setIsVerifyModalOpen(false)}
        title={isVerified ? 'Revoke Verified Talent Status' : 'Grant StageLink Verified Badge'}
        size="md"
      >
        <div className="p-6 space-y-4 text-xs">
          {isVerified ? (
            <div className="p-3 bg-amber-50 rounded-2xl border border-amber-200 text-amber-800 space-y-1">
              <h4 className="font-bold">Are you sure you want to revoke verification?</h4>
              <p>
                {candidate.fullName} will lose their verified trust badge and will no longer appear with verified priority in casting searches.
              </p>
            </div>
          ) : (
            <div className="p-3 bg-emerald-50 rounded-2xl border border-emerald-200 text-emerald-800 space-y-1">
              <h4 className="font-bold">Grant Official Verification to {candidate.fullName}</h4>
              <p>
                Awarding this badge confirms identity, training credits, and provides casting directors with high confidence.
              </p>
            </div>
          )}

          <div className="flex items-center justify-end gap-3 pt-3 border-t border-gray-100">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setIsVerifyModalOpen(false)}
            >
              Cancel
            </Button>
            <Button
              variant={isVerified ? 'danger' : 'primary'}
              size="sm"
              onClick={handleConfirmVerification}
            >
              {isVerified ? 'Confirm Revocation' : 'Confirm Verified Status'}
            </Button>
          </div>
        </div>
      </Modal>

      {/* Modal 4: Shortlist for Opportunity */}
      <Modal
        isOpen={isShortlistModalOpen}
        onClose={() => setIsShortlistModalOpen(false)}
        title={`Shortlist ${candidate.fullName} for an Opportunity`}
        size="lg"
      >
        <div className="p-6 space-y-4 text-xs">
          <p className="text-gray-600">
            Select an active production or casting call to shortlist this candidate for auditions or callbacks.
          </p>

          <div className="space-y-1.5">
            <label className="font-semibold text-brand-navy block">
              Target Casting Opportunity *
            </label>
            <select
              value={selectedOpportunityId}
              onChange={(e) => setSelectedOpportunityId(e.target.value)}
              className="w-full px-3 py-2 text-xs rounded-xl border border-brand-border bg-white text-brand-navy focus:outline-hidden focus:ring-2 focus:ring-brand-pink"
            >
              <option value="">-- Select Active Opportunity --</option>
              {mockOpportunities.map((opp) => (
                <option key={opp.id} value={opp.id}>
                  {opp.title} ({opp.productionCompany}) — {opp.location}
                </option>
              ))}
            </select>
          </div>

          <div className="space-y-1.5">
            <label className="font-semibold text-brand-navy block">
              Audition / Casting Director Notes
            </label>
            <textarea
              rows={3}
              value={shortlistNotes}
              onChange={(e) => setShortlistNotes(e.target.value)}
              placeholder="e.g. Recommended for Scene 4 chemistry read. Exceptional classical diction."
              className="w-full px-3 py-2 text-xs rounded-xl border border-brand-border bg-white text-brand-navy focus:outline-hidden focus:ring-2 focus:ring-brand-pink"
            />
          </div>

          <div className="flex items-center justify-end gap-3 pt-3 border-t border-gray-100">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setIsShortlistModalOpen(false)}
            >
              Cancel
            </Button>
            <Button
              variant="primary"
              size="sm"
              disabled={!selectedOpportunityId}
              onClick={handleConfirmShortlist}
            >
              Confirm Shortlist
            </Button>
          </div>
        </div>
      </Modal>

      {/* Modal 5: Status Change Confirmation */}
      <Modal
        isOpen={isStatusModalOpen}
        onClose={() => setIsStatusModalOpen(false)}
        title="Confirm Performer Account Status"
        size="md"
      >
        <div className="p-6 space-y-4 text-xs">
          <p className="text-gray-600">
            Are you sure you want to change <strong>{candidate.fullName}</strong>'s status to{' '}
            <strong className="uppercase text-brand-navy">{targetStatus}</strong>?
          </p>

          {targetStatus === 'suspended' && (
            <div className="p-3 bg-red-50 rounded-2xl border border-red-200 text-red-800">
              <p className="font-semibold">
                Warning: Suspending this account will hide the candidate from all public and casting director searches.
              </p>
            </div>
          )}

          <div className="flex items-center justify-end gap-3 pt-3 border-t border-gray-100">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setIsStatusModalOpen(false)}
            >
              Cancel
            </Button>
            <Button
              variant={targetStatus === 'suspended' ? 'danger' : 'primary'}
              size="sm"
              onClick={handleConfirmStatusChange}
            >
              Confirm Status Change
            </Button>
          </div>
        </div>
      </Modal>

      {/* Modal 6: Resume Document Preview */}
      <Modal
        isOpen={isResumeModalOpen}
        onClose={() => setIsResumeModalOpen(false)}
        title={`Theatrical Resume — ${candidate.fullName}`}
        size="lg"
      >
        <div className="p-6 space-y-6 text-xs">
          <div className="bg-gray-50 border border-gray-200 rounded-2xl p-4 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <FileText className="w-7 h-7 text-brand-pink" />
              <div>
                <h4 className="font-bold text-brand-navy">
                  {candidate.portfolio?.resume?.fileName || 'Casting_Resume_2026.pdf'}
                </h4>
                <p className="text-[11px] text-gray-500">
                  Size: {candidate.portfolio?.resume?.fileSize || '2.4 MB'} • Theatrical & Film Format
                </p>
              </div>
            </div>
            <a
              href="#"
              onClick={(e) => {
                e.preventDefault();
                showToast('Resume PDF downloaded successfully to local device.');
              }}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white border border-gray-300 hover:border-gray-400 font-semibold text-brand-navy transition-all"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Download PDF</span>
            </a>
          </div>

          <div className="border border-gray-200 rounded-2xl p-6 bg-white space-y-4 max-h-96 overflow-y-auto">
            <div className="text-center pb-4 border-b border-gray-100">
              <h2 className="text-lg font-bold text-brand-navy uppercase tracking-wider font-serif">
                {candidate.fullName}
              </h2>
              <p className="text-gray-500 text-[11px]">{candidate.headline}</p>
              <p className="text-gray-400 text-[10px] mt-1">
                Union: {candidate.unionStatus} • Location: {candidate.location}
              </p>
            </div>

            <div className="space-y-3">
              <h3 className="font-bold uppercase tracking-wider text-[11px] text-brand-pink">
                Theatrical & Film Credits
              </h3>
              {(candidate.experience || []).map((exp, idx) => (
                <div key={idx} className="flex justify-between border-b border-gray-50 pb-2">
                  <div>
                    <span className="font-semibold text-brand-navy">{exp.project}</span>
                    <span className="text-gray-500 ml-2">({exp.role})</span>
                    <p className="text-[10px] text-gray-400">{exp.director}</p>
                  </div>
                  <span className="font-mono text-gray-500">{exp.year}</span>
                </div>
              ))}
            </div>

            <div className="space-y-2 pt-2">
              <h3 className="font-bold uppercase tracking-wider text-[11px] text-brand-pink">
                Education & Masterclasses
              </h3>
              {(candidate.education || []).map((edu, idx) => (
                <div key={idx} className="text-[11px]">
                  <span className="font-semibold text-brand-navy">{edu.institution}</span> — {edu.degree} ({edu.year})
                </div>
              ))}
            </div>
          </div>

          <div className="flex justify-end">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setIsResumeModalOpen(false)}
            >
              Close Preview
            </Button>
          </div>
        </div>
      </Modal>

      {/* Modal 7: Video Slate Player */}
      <Modal
        isOpen={isVideoModalOpen}
        onClose={() => setIsVideoModalOpen(false)}
        title={selectedVideo?.title || 'Video Audition Slate'}
        size="lg"
      >
        <div className="p-6 space-y-4 text-xs">
          <div className="aspect-video w-full rounded-2xl overflow-hidden bg-black flex items-center justify-center relative shadow-inner">
            <div className="text-center space-y-2 p-4 text-white">
              <Play className="w-12 h-12 mx-auto text-brand-pink fill-brand-pink opacity-80 animate-pulse" />
              <p className="font-semibold">{selectedVideo?.title}</p>
              <p className="text-gray-400 text-[11px]">
                Embedded StageLink Audition Player (Duration: {selectedVideo?.duration})
              </p>
            </div>
          </div>

          <div className="flex items-center justify-between pt-2">
            <a
              href={selectedVideo?.url || '#'}
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center gap-1.5 text-xs text-brand-pink font-semibold hover:underline"
            >
              <ExternalLink className="w-3.5 h-3.5" />
              <span>Open in External Player (Vimeo / YouTube)</span>
            </a>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setIsVideoModalOpen(false)}
            >
              Close
            </Button>
          </div>
        </div>
      </Modal>
    </PageContainer>
  );
};

export default CandidateDetailsPage;
