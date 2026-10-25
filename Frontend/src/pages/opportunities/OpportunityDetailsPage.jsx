import React, { useState, useEffect, useMemo } from 'react';
import { useParams, Link, useNavigate, useSearchParams } from 'react-router-dom';
import {
  MapPin,
  Heart,
  CheckCircle2,
  Building2,
  Calendar,
  Languages,
  Briefcase,
  AlertCircle,
  Banknote,
  Sparkles,
  Mail,
  ChevronRight,
  Clock,
  ShieldCheck,
  Users,
  Award,
  Star,
  ArrowRight,
  Flag,
  FileText,
  Video,
  Camera,
  Layers,
  HelpCircle,
} from 'lucide-react';
import PageContainer from '../../components/layout/PageContainer';
import Button from '../../components/common/Button';
import Modal from '../../components/common/Modal';
import Textarea from '../../components/common/Textarea';
import FileUpload from '../../components/common/FileUpload';
import OpportunityCard from '../../components/opportunities/OpportunityCard';
import Avatar from '../../components/common/Avatar';
import ScoreBadge from '../../components/ranking/ScoreBadge';
import ScoreBreakdownModal from '../../components/ranking/ScoreBreakdownModal';
import { mockOpportunities } from '../../data/mockOpportunities';
import { getCustomOpportunities } from '../../utils/paymentAccess';
import { initialCandidateProfile } from '../../data/mockCandidates';
import { resolveOpportunityImage, getCategoryFallbackImage } from '../../utils/opportunityImageHelper';
import { castingService } from '../../services/castingService';
import { applicationService } from '../../services/applicationService';
import { rankingService } from '../../services/rankingService';
import { calculateCandidateMatchScore } from '../../services/scoringEngine';
import { feedbackService } from '../../services/feedbackService';
import CompanyRatingModal from '../../components/feedback/CompanyRatingModal';
import { useApp } from '../../context/AppContext';
import { useAuth } from '../../context/AuthContext';

const OpportunityDetailsPage = () => {
  const { id } = useParams();
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { isOpportunitySaved, toggleSaveOpportunity } = useApp();
  const { isAuthenticated, user } = useAuth();

  const [opportunity, setOpportunity] = useState(() => {
    const allOpps = [...getCustomOpportunities(), ...mockOpportunities];
    return allOpps.find((o) => o.id === id || o.refId === id) || null;
  });

  useEffect(() => {
    let isMounted = true;
    castingService.getById(id).then((opp) => {
      if (isMounted && opp) {
        setOpportunity(opp);
      }
    }).catch((err) => console.warn('Failed to load opportunity dynamically:', err));

    return () => {
      isMounted = false;
    };
  }, [id]);

  // Production Company reviews and rating state
  const [isCompanyRatingModalOpen, setIsCompanyRatingModalOpen] = useState(false);
  const [companyStats, setCompanyStats] = useState({ averageRating: 4.9, totalReviews: 14, reviews: [] });

  useEffect(() => {
    if (opportunity?.productionCompany) {
      feedbackService.getCompanyReviews(opportunity.productionCompany).then((res) => {
        if (res) {
          setCompanyStats(res);
        }
      });
    }
  }, [opportunity?.productionCompany]);

  const [activeImage, setActiveImage] = useState(0);
  const [applyModalOpen, setApplyModalOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [existingApplication, setExistingApplication] = useState(null);
  const [applicationRef, setApplicationRef] = useState('');
  const [submitError, setSubmitError] = useState('');

  // Application form fields
  const [selectedRole, setSelectedRole] = useState('');
  const [coverNote, setCoverNote] = useState('');
  const [portfolioLink, setPortfolioLink] = useState(
    initialCandidateProfile.portfolio?.video_reel || 'https://vimeo.com/76979871'
  );
  const [selfTapeFile, setSelfTapeFile] = useState(null);
  const [confirmAvailability, setConfirmAvailability] = useState(true);
  const [travelFeasibility, setTravelFeasibility] = useState('Available to travel at own schedule');

  // Report listing state
  const [reportModalOpen, setReportModalOpen] = useState(false);
  const [reportReason, setReportReason] = useState('Misleading information');
  const [reportDetails, setReportDetails] = useState('');
  const [reportSubmitted, setReportSubmitted] = useState(false);

  const [selectedBreakdownApp, setSelectedBreakdownApp] = useState(null);
  const [isBreakdownModalOpen, setIsBreakdownModalOpen] = useState(false);

  const candidateId = user?.id || 'cand-1';

  // Available roles dropdown list
  const availableRoles = useMemo(() => {
    if (!opportunity) return [];
    if (opportunity.roles && opportunity.roles.length > 0) {
      return opportunity.roles.map((r) => r.name || r.title || r);
    }
    if (Array.isArray(opportunity.talentNeeded)) {
      return opportunity.talentNeeded;
    }
    return opportunity.title ? [opportunity.title] : [];
  }, [opportunity]);

  useEffect(() => {
    if (availableRoles.length > 0 && !selectedRole) {
      setSelectedRole(availableRoles[0]);
    }
  }, [availableRoles, selectedRole]);

  // Evaluate candidate's match score against this opportunity
  const candidateMatchScore = useMemo(() => {
    if (!opportunity) return { overallScore: 0, breakdowns: [], calculationSummary: '' };
    return calculateCandidateMatchScore(initialCandidateProfile, opportunity);
  }, [opportunity]);

  // Check if candidate already applied
  useEffect(() => {
    if (opportunity) {
      const prevApp = applicationService.hasAlreadyApplied(candidateId, opportunity.id);
      if (prevApp) {
        setExistingApplication(prevApp);
        setApplicationRef(prevApp.id);
      }
    }
  }, [opportunity, candidateId]);

  const isClosed =
    !opportunity ||
    opportunity.status === 'closed' ||
    opportunity.status === 'expired' ||
    (opportunity.deadline && new Date(opportunity.deadline).getTime() < Date.now());

  // Handle Apply Now click
  const handleApplyClick = () => {
    if (isClosed || !opportunity) return;

    if (!isAuthenticated) {
      navigate('/login', {
        state: { from: `/opportunities/${opportunity.id}` },
      });
      return;
    }

    if (existingApplication) {
      return;
    }

    setApplyModalOpen(true);
  };

  // Open apply modal if query param ?apply=true is in URL
  useEffect(() => {
    if (searchParams.get('apply') === 'true' && opportunity && !existingApplication) {
      handleApplyClick();
    }
  }, [searchParams, opportunity, existingApplication]);

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, [id]);

  if (!opportunity) {
    return (
      <div className="bg-gray-50/50 min-h-screen py-16">
        <PageContainer maxWidth="md" className="text-center space-y-4">
          <div className="w-16 h-16 rounded-full bg-red-50 text-brand-error flex items-center justify-center mx-auto">
            <AlertCircle className="w-8 h-8" />
          </div>
          <h1 className="text-2xl font-bold font-serif text-brand-navy">
            Casting Call Not Found
          </h1>
          <p className="text-xs text-brand-text-secondary max-w-sm mx-auto">
            The casting opportunity you are looking for may have expired or is not currently active.
          </p>
          <div className="pt-2">
            <Link
              to="/opportunities"
              className="inline-flex items-center px-5 py-2.5 bg-black hover:bg-neutral-800 text-white text-xs font-bold rounded-xl transition-colors"
            >
              Browse Casting Calls
            </Link>
          </div>
        </PageContainer>
      </div>
    );
  }

  const isSaved = isOpportunitySaved(opportunity.id);
  const safePrimaryImage = resolveOpportunityImage(opportunity);
  const gallery = opportunity.gallery?.length ? opportunity.gallery : [safePrimaryImage];

  // Similar opportunities
  const similarOpportunities = mockOpportunities
    .filter(
      (opp) =>
        opp.id !== opportunity.id &&
        (opp.categoryKey === opportunity.categoryKey ||
          opp.category === opportunity.category ||
          opp.location === opportunity.location)
    )
    .slice(0, 3);

  // Handle Application Submission in modal
  const handleConfirmApplication = async (e) => {
    e.preventDefault();
    setSubmitError('');
    setIsSubmitting(true);

    try {
      const result = await applicationService.apply({
        opportunityId: opportunity.id,
        opportunityTitle: opportunity.title,
        productionCompany: opportunity.productionCompany,
        location: opportunity.location,
        candidateId,
        candidateName: user?.fullName || user?.name || initialCandidateProfile.fullName,
        candidateAvatar: user?.avatar || initialCandidateProfile.avatar,
        candidateHeadline: initialCandidateProfile.headline,
        roleAppliedFor: selectedRole || availableRoles[0] || opportunity.title,
        coverMessage: coverNote,
        portfolioUrl: portfolioLink,
        videoAuditionUrl: selfTapeFile ? 'https://vimeo.com/76979871' : '',
        resumeFileName: `${(user?.fullName || initialCandidateProfile.fullName).replace(/\s+/g, '_')}_Resume.pdf`,
        answers: {
          availabilityConfirmed: confirmAvailability,
          travelFeasibility,
        },
      });

      if (!result.success) {
        setSubmitError(result.message || 'Application could not be submitted.');
        setIsSubmitting(false);
        return;
      }

      setApplicationRef(result.application?.id || `APP-${Date.now()}`);
      setExistingApplication(result.application);
      setIsSubmitting(false);
      setApplyModalOpen(false);
    } catch (err) {
      setSubmitError(`Submission error: ${err.message || 'Please check your connection'}`);
      setIsSubmitting(false);
    }
  };

  const handleReportSubmit = (e) => {
    e.preventDefault();
    setReportSubmitted(true);
    setTimeout(() => {
      setReportModalOpen(false);
      setReportSubmitted(false);
      setReportDetails('');
    }, 2000);
  };

  return (
    <div className="bg-gray-50/50 min-h-screen py-6 sm:py-10 pb-24 text-left">
      <PageContainer maxWidth="lg" className="space-y-6">
        {/* 1. BREADCRUMB NAVIGATION */}
        <nav aria-label="Breadcrumb" className="flex items-center space-x-2 text-xs text-brand-text-secondary">
          <Link to="/" className="hover:text-black transition-colors font-medium">
            Home
          </Link>
          <ChevronRight className="w-3.5 h-3.5 text-gray-400" />
          <Link to="/opportunities" className="hover:text-black transition-colors font-medium">
            Casting Calls
          </Link>
          <ChevronRight className="w-3.5 h-3.5 text-gray-400" />
          <span className="text-brand-navy font-semibold truncate max-w-xs sm:max-w-md">
            {opportunity.title}
          </span>
        </nav>

        {/* Closed / Expired Alert Banner */}
        {isClosed && (
          <div className="p-4 bg-amber-50 border border-amber-200 rounded-2xl flex items-center gap-3 text-amber-800 text-xs">
            <AlertCircle className="w-5 h-5 text-amber-600 shrink-0" />
            <div>
              <p className="font-bold">Applications Closed for this Casting Call</p>
              <p className="text-[11px] text-amber-700">
                The application deadline ({opportunity.applicationDeadline || opportunity.deadline}) has passed or the production company has filled the available openings.
              </p>
            </div>
          </div>
        )}

        {/* Application Submitted State */}
        {existingApplication && (
          <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-2xl flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-emerald-800 text-xs">
            <div className="flex items-center gap-3">
              <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
              <div>
                <p className="font-bold">You Have Applied for this Role</p>
                <p className="text-[11px] text-emerald-700">
                  Application Status:{' '}
                  <span className="uppercase font-bold tracking-wide">
                    {existingApplication.status}
                  </span>{' '}
                  • Reference ID: #{existingApplication.id}
                </p>
              </div>
            </div>
            <Link
              to={`/candidate/applications/${existingApplication.id}`}
              className="inline-flex items-center gap-1.5 px-3.5 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl text-xs transition-colors shrink-0"
            >
              <span>Track Application</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>
        )}

        {/* 2. HERO CARD: Image + Specs & Application Header */}
        <div className="bg-white rounded-3xl border border-slate-200/80 p-6 sm:p-8 shadow-3d-card specular-top grid grid-cols-1 md:grid-cols-12 gap-8 items-start">
          {/* Left: Project Image & Gallery */}
          <div className="md:col-span-5 space-y-3">
            <div className="aspect-[4/5] rounded-2xl overflow-hidden bg-neutral-950 shadow-3d-subtle border border-slate-200/70 relative group">
              <img
                src={gallery[activeImage] || safePrimaryImage}
                alt=""
                onError={(e) => {
                  e.currentTarget.onerror = null;
                  e.currentTarget.src = getCategoryFallbackImage(
                    opportunity.productionCategory || opportunity.category,
                    opportunity.productionType || opportunity.type
                  );
                }}
                className={`w-full h-full object-cover transition-transform duration-500 group-hover:scale-102 ${
                  isClosed ? 'grayscale-[30%]' : ''
                }`}
              />
              <div className="absolute top-3 left-3 flex items-center gap-2">
                <span className="px-3 py-1 bg-white/95 backdrop-blur-md text-brand-pink text-xs font-bold rounded-full shadow-2xs border border-white/60">
                  {opportunity.productionCategory || opportunity.category || 'Film & TV'}
                </span>
                {isClosed && (
                  <span className="px-2.5 py-1 bg-slate-900/90 text-white text-[10px] font-bold rounded-full backdrop-blur-md uppercase shadow-2xs">
                    Closed
                  </span>
                )}
              </div>
            </div>

            {/* Gallery Thumbnails */}
            {gallery.length > 1 && (
              <div className="grid grid-cols-4 gap-2 pt-1">
                {gallery.map((img, idx) => (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => setActiveImage(idx)}
                    aria-label={`View photo ${idx + 1}`}
                    className={`aspect-square rounded-xl overflow-hidden border-2 transition-all cursor-pointer shadow-2xs ${
                      activeImage === idx
                        ? 'border-brand-pink ring-2 ring-brand-pink/20 scale-95'
                        : 'border-transparent opacity-70 hover:opacity-100 hover:border-slate-300'
                    }`}
                  >
                    <img src={img} alt="Thumbnail" className="w-full h-full object-cover" />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Right: Role Title, Production House, Key Specs, Actions */}
          <div className="md:col-span-7 space-y-5">
            <div className="space-y-2">
              <div className="flex items-center justify-between text-xs text-brand-text-secondary">
                <div className="flex items-center gap-2">
                  <Building2 className="w-4 h-4 text-brand-pink shrink-0" />
                  <span className="font-bold text-brand-navy">
                    {opportunity.productionCompany}
                  </span>
                </div>
                <button
                  type="button"
                  onClick={() => setReportModalOpen(true)}
                  className="flex items-center gap-1 text-[11px] text-slate-400 hover:text-rose-600 transition-colors cursor-pointer"
                  title="Report inappropriate or suspicious listing"
                >
                  <Flag className="w-3 h-3" />
                  <span>Report Listing</span>
                </button>
              </div>

              <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold font-serif text-brand-navy leading-tight tracking-tight">
                {opportunity.title}
              </h1>

              <div className="flex flex-wrap items-center gap-4 text-xs text-brand-text-secondary pt-1">
                <span className="flex items-center font-medium">
                  <MapPin className="w-3.5 h-3.5 text-brand-pink mr-1" />
                  {opportunity.location}
                </span>
                <span className="flex items-center font-medium">
                  <Calendar className="w-3.5 h-3.5 text-brand-pink mr-1" />
                  Deadline:{' '}
                  <strong className="text-brand-navy ml-1">
                    {opportunity.applicationDeadline || opportunity.deadline || 'Open'}
                  </strong>
                </span>
                <span className="flex items-center font-medium">
                  <Users className="w-3.5 h-3.5 text-brand-pink mr-1" />
                  Openings:{' '}
                  <strong className="text-brand-navy ml-1">
                    {opportunity.artistsNeeded || 1} Artist{opportunity.artistsNeeded > 1 ? 's' : ''}
                  </strong>
                </span>
              </div>
            </div>

            {/* Compensation Terms */}
            <div className="p-4 bg-gradient-to-r from-emerald-50/90 to-teal-50/80 border border-emerald-200/80 rounded-2xl flex items-center justify-between shadow-inner-bevel">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-emerald-600 text-white flex items-center justify-center shrink-0 shadow-2xs">
                  <Banknote className="w-5 h-5" />
                </div>
                <div>
                  <p className="text-[10px] font-bold uppercase tracking-wider text-emerald-800">
                    Compensation Terms &amp; Remuneration
                  </p>
                  <p className="text-base font-bold text-emerald-950 mt-0.5">
                    {opportunity.compensation && opportunity.compensation !== '0'
                      ? `${opportunity.compensation}${
                          opportunity.rateUnit ? ` / ${opportunity.rateUnit}` : ''
                        }`
                      : opportunity.compensationType || 'Negotiable Remuneration'}
                  </p>
                </div>
              </div>
              <span className="text-[11px] font-bold text-emerald-850 bg-white/90 px-3 py-1 rounded-lg border border-emerald-200 shadow-2xs">
                {opportunity.compensationType || 'Paid Opportunity'}
              </span>
            </div>

            {/* Action Buttons: Apply Now + Save */}
            <div className="flex flex-wrap items-center gap-3 pt-1">
              {existingApplication ? (
                <Link
                  to={`/candidate/applications/${existingApplication.id}`}
                  className="flex-1 py-3.5 px-6 bg-emerald-50/90 border border-emerald-200 text-emerald-700 text-xs font-bold rounded-xl flex items-center justify-center gap-2 hover:bg-emerald-100 shadow-2xs transition-all active:translate-y-0.5"
                >
                  <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                  <span>Application Submitted — View Status</span>
                </Link>
              ) : (
                <button
                  type="button"
                  onClick={handleApplyClick}
                  disabled={isClosed}
                  className={`flex-1 py-3.5 px-6 text-xs font-bold rounded-xl transition-all flex items-center justify-center gap-2 cursor-pointer specular-top ${
                    isClosed
                      ? 'bg-slate-200 text-slate-500 cursor-not-allowed shadow-none'
                      : 'bg-brand-pink hover:bg-rose-700 text-white shadow-3d-button-pink hover:shadow-3d-card-hover active:translate-y-0.5'
                  }`}
                >
                  <Sparkles className="w-4 h-4" />
                  <span>{isClosed ? 'Applications Closed' : 'Apply Now'}</span>
                </button>
              )}

              {/* Save/Unsave Button */}
              <button
                type="button"
                onClick={() => toggleSaveOpportunity(opportunity.id)}
                className={`py-3.5 px-5 border rounded-xl text-xs font-bold transition-all flex items-center gap-2 cursor-pointer shadow-3d-subtle hover:shadow-3d-card active:translate-y-0.5 ${
                  isSaved
                    ? 'border-slate-900 bg-slate-900 text-white shadow-2xs'
                    : 'border-slate-200 text-brand-navy hover:border-slate-300 hover:bg-slate-50 bg-white'
                }`}
              >
                <Heart className={`w-4 h-4 ${isSaved ? 'fill-brand-pink text-brand-pink' : ''}`} />
                <span>{isSaved ? 'Saved' : 'Save'}</span>
              </button>

              {/* Recruiter / Production Dashboard Shortcut */}
              <Link
                to={`/admin/opportunities/${opportunity.id}/candidates`}
                className="py-3.5 px-4 rounded-xl bg-pink-50 border border-pink-200/90 text-brand-pink text-xs font-bold hover:bg-pink-100 shadow-2xs transition-all flex items-center gap-1.5 shrink-0 active:translate-y-0.5"
                title="Review & rank candidate applications for this role"
              >
                <Sparkles className="w-3.5 h-3.5" />
                <span>Ranked Candidates</span>
              </Link>
            </div>

            {/* Key Specifications Grid */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 pt-2 text-left">
              <div className="p-3 bg-gray-50 rounded-2xl border border-gray-100">
                <p className="text-[10px] uppercase font-bold tracking-wider text-brand-text-secondary">
                  Shoot Date
                </p>
                <p className="text-xs font-bold text-brand-navy mt-1 truncate">
                  {opportunity.shootDate || 'Flexible / TBD'}
                </p>
              </div>

              <div className="p-3 bg-gray-50 rounded-2xl border border-gray-100">
                <p className="text-[10px] uppercase font-bold tracking-wider text-brand-text-secondary">
                  Experience Req.
                </p>
                <p className="text-xs font-bold text-brand-navy mt-1 truncate">
                  {opportunity.experience || 'Freshers OK'}
                </p>
              </div>

              <div className="p-3 bg-gray-50 rounded-2xl border border-gray-100">
                <p className="text-[10px] uppercase font-bold tracking-wider text-brand-text-secondary">
                  Project Type
                </p>
                <p className="text-xs font-bold text-brand-navy mt-1 truncate">
                  {opportunity.productionType || opportunity.type || 'Feature Film'}
                </p>
              </div>

              <div className="p-3 bg-gray-50 rounded-2xl border border-gray-100">
                <p className="text-[10px] uppercase font-bold tracking-wider text-brand-text-secondary">
                  Artists Needed
                </p>
                <p className="text-xs font-bold text-brand-navy mt-1 truncate">
                  {opportunity.artistsNeeded || 1} Opening{opportunity.artistsNeeded > 1 ? 's' : ''}
                </p>
              </div>
            </div>

            {/* Job Opening Period Banner ("Is date se lekar is date tak job opening hai") */}
            <div className="p-3.5 bg-gradient-to-r from-emerald-50 via-teal-50 to-white rounded-2xl border border-emerald-200 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-left">
              <div className="flex items-center gap-2.5">
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 shrink-0 animate-pulse" />
                <div>
                  <span className="text-[10px] uppercase font-bold tracking-wider text-emerald-800 block">
                    Job Opening Period
                  </span>
                  <p className="text-xs sm:text-sm font-bold text-emerald-950">
                    {opportunity.openingStartDate && opportunity.openingEndDate
                      ? `${opportunity.openingStartDate} se lekar ${opportunity.openingEndDate} tak`
                      : (opportunity.jobOpeningRange || 'Open for candidate submissions')}
                  </p>
                  <p className="text-[11px] text-emerald-700 font-medium">
                    📌 Is date se lekar is date tak job opening active hai — candidates can submit applications.
                  </p>
                </div>
              </div>
              <span className="text-[11px] font-semibold text-emerald-800 bg-emerald-100 border border-emerald-200 px-3 py-1 rounded-full shrink-0 self-start sm:self-auto">
                Accepting Submissions
              </span>
            </div>
          </div>
        </div>

        {/* 3. DETAILS BODY: Left (About, Role, Requirements, Audition Process, Materials) + Right (Company & Match) */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          {/* Main Details (8 cols) */}
          <div className="lg:col-span-8 space-y-6">
            {/* Complete Project Description */}
            <div className="bg-white rounded-3xl border border-brand-border p-6 sm:p-8 shadow-card space-y-3">
              <h2 className="text-lg font-bold font-serif text-brand-navy">
                Complete Project Description
              </h2>
              <p className="text-xs sm:text-sm text-brand-text-secondary leading-relaxed whitespace-pre-line">
                {opportunity.description ||
                  opportunity.projectDescription ||
                  'A high-profile production casting verified talent for key narrative roles.'}
              </p>
            </div>

            {/* Role Requirements & Specifications */}
            <div className="bg-white rounded-3xl border border-brand-border p-6 sm:p-8 shadow-card space-y-4">
              <h2 className="text-lg font-bold font-serif text-brand-navy">
                Role Requirements &amp; Character Criteria
              </h2>
              <p className="text-xs sm:text-sm text-brand-text-secondary leading-relaxed">
                {opportunity.roleDescription ||
                  opportunity.requirements ||
                  'The production team is seeking performers with strong camera presence, emotional range, and disciplined script study.'}
              </p>

              {Array.isArray(opportunity.requirements) && (
                <ul className="space-y-2 text-xs sm:text-sm text-brand-text-secondary pt-2">
                  {opportunity.requirements.map((req, i) => (
                    <li key={i} className="flex items-start gap-2.5 leading-relaxed">
                      <CheckCircle2 className="w-4 h-4 text-brand-pink shrink-0 mt-0.5" />
                      <span>{req}</span>
                    </li>
                  ))}
                </ul>
              )}
            </div>

            {/* Required Skills & Languages */}
            <div className="bg-white rounded-3xl border border-brand-border p-6 sm:p-8 shadow-card space-y-4">
              <h2 className="text-lg font-bold font-serif text-brand-navy">
                Required Skills &amp; Spoken Languages
              </h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="p-4 bg-gray-50 rounded-2xl border border-gray-100 flex items-start gap-3">
                  <Languages className="w-5 h-5 text-brand-pink shrink-0 mt-0.5" />
                  <div>
                    <h3 className="text-xs font-bold text-brand-navy">Required Languages</h3>
                    <p className="text-xs text-brand-text-secondary mt-0.5">
                      {opportunity.languages || 'Hindi, English'}
                    </p>
                    <p className="text-[11px] text-gray-400 mt-1">Dialogue delivery and clear articulation</p>
                  </div>
                </div>

                <div className="p-4 bg-gray-50 rounded-2xl border border-gray-100 flex items-start gap-3">
                  <Briefcase className="w-5 h-5 text-brand-navy shrink-0 mt-0.5" />
                  <div>
                    <h3 className="text-xs font-bold text-brand-navy">Role Abilities &amp; Skills</h3>
                    <p className="text-xs text-brand-text-secondary mt-0.5">
                      {Array.isArray(opportunity.required_skills)
                        ? opportunity.required_skills.join(', ')
                        : 'Stage Combat, Camera Acting, Method Acting'}
                    </p>
                    <p className="text-[11px] text-gray-400 mt-1">Verified during audition evaluation</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Audition Process Workflow */}
            <div className="bg-white rounded-3xl border border-brand-border p-6 sm:p-8 shadow-card space-y-4">
              <h2 className="text-lg font-bold font-serif text-brand-navy">
                Audition &amp; Selection Process
              </h2>
              <div className="space-y-3">
                <div className="flex items-start gap-3 p-3.5 rounded-2xl bg-gray-50 border border-gray-100 text-xs">
                  <div className="w-7 h-7 rounded-full bg-brand-pink text-white flex items-center justify-center font-bold text-xs shrink-0">
                    1
                  </div>
                  <div>
                    <h4 className="font-bold text-brand-navy">Online Application &amp; Portfolio Submission</h4>
                    <p className="text-gray-500 text-[11px] mt-0.5">
                      Submit your StageLink performer profile, headshots, and optional self-tape before {opportunity.applicationDeadline || opportunity.deadline || 'the deadline'}.
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-3 p-3.5 rounded-2xl bg-gray-50 border border-gray-100 text-xs">
                  <div className="w-7 h-7 rounded-full bg-brand-navy text-white flex items-center justify-center font-bold text-xs shrink-0">
                    2
                  </div>
                  <div>
                    <h4 className="font-bold text-brand-navy">Transparent Role Matching &amp; Shortlisting</h4>
                    <p className="text-gray-500 text-[11px] mt-0.5">
                      The production director reviews applicants ranked by skills, experience, portfolio, and language compatibility.
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-3 p-3.5 rounded-2xl bg-gray-50 border border-gray-100 text-xs">
                  <div className="w-7 h-7 rounded-full bg-emerald-600 text-white flex items-center justify-center font-bold text-xs shrink-0">
                    3
                  </div>
                  <div>
                    <h4 className="font-bold text-brand-navy">Audition Invitation &amp; Final Selection</h4>
                    <p className="text-gray-500 text-[11px] mt-0.5">
                      Shortlisted candidates receive date, time, script sides, and instructions for an in-studio read or live video callback.
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Required Portfolio Materials */}
            <div className="bg-white rounded-3xl border border-brand-border p-6 sm:p-8 shadow-card space-y-4">
              <h2 className="text-lg font-bold font-serif text-brand-navy">
                Required Portfolio Materials
              </h2>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
                <div className="p-4 bg-gray-50 rounded-2xl border border-gray-100 space-y-1">
                  <Camera className="w-5 h-5 text-brand-pink" />
                  <h4 className="font-bold text-brand-navy pt-1">Professional Headshots</h4>
                  <p className="text-[11px] text-gray-500">
                    Close-up and full-length portraits with natural studio lighting.
                  </p>
                </div>

                <div className="p-4 bg-gray-50 rounded-2xl border border-gray-100 space-y-1">
                  <Video className="w-5 h-5 text-brand-navy" />
                  <h4 className="font-bold text-brand-navy pt-1">Video Showreel</h4>
                  <p className="text-[11px] text-gray-500">
                    Recent performance reel showcasing dialogue delivery and screen versatility.
                  </p>
                </div>

                <div className="p-4 bg-gray-50 rounded-2xl border border-gray-100 space-y-1">
                  <FileText className="w-5 h-5 text-emerald-600" />
                  <h4 className="font-bold text-brand-navy pt-1">Performer Credits</h4>
                  <p className="text-[11px] text-gray-500">
                    Documented acting credits, theatre training, or relevant workshop experience.
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Right Sidebar (4 cols): Production Info & Match */}
          <div className="lg:col-span-4 space-y-6">
            {/* Production Company Card */}
            <div className="bg-white rounded-3xl border border-brand-border p-6 shadow-card space-y-4 text-left">
              <div className="flex items-center justify-between">
                <h3 className="text-xs font-bold uppercase tracking-wider text-brand-text-secondary">
                  Production Company
                </h3>
                <span className="flex items-center gap-1 bg-amber-50 px-2.5 py-1 rounded-full text-xs font-bold text-amber-900 border border-amber-200">
                  <Star className="w-3.5 h-3.5 text-amber-500 fill-amber-500" />
                  <span>{companyStats.averageRating || 4.9}</span>
                  <span className="text-[10px] text-amber-700">({companyStats.totalReviews || 14})</span>
                </span>
              </div>

              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-2xl bg-brand-navy text-white flex items-center justify-center font-bold text-lg">
                  {opportunity.companyLogo || opportunity.productionCompany.charAt(0)}
                </div>
                <div>
                  <h4 className="text-sm font-bold text-brand-navy">{opportunity.productionCompany}</h4>
                  <p className="text-[11px] text-emerald-600 font-semibold flex items-center gap-1">
                    <ShieldCheck className="w-3.5 h-3.5" /> Verified Production House
                  </p>
                </div>
              </div>

              <p className="text-xs text-brand-text-secondary leading-relaxed">
                Applications submitted on StageLink are delivered directly to the designated casting directors of this production.
              </p>

              {/* Rate & Review Button */}
              <div className="pt-2 border-t border-gray-100 flex items-center justify-between">
                <span className="text-[11px] text-gray-500 font-medium">Auditioned here before?</span>
                <button
                  type="button"
                  onClick={() => setIsCompanyRatingModalOpen(true)}
                  className="inline-flex items-center gap-1 text-xs font-bold text-black hover:underline cursor-pointer"
                >
                  <Star className="w-3 h-3 text-amber-500 fill-amber-500" />
                  <span>Rate Production House</span>
                </button>
              </div>
            </div>

            {/* Candidate Match Preview */}
            <div className="bg-pink-50/50 rounded-3xl border border-pink-200/80 p-6 shadow-xs space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Sparkles className="w-4 h-4 text-brand-pink" />
                  <h3 className="text-xs font-bold uppercase tracking-wider text-brand-navy">
                    Your Match Score
                  </h3>
                </div>
                <ScoreBadge
                  score={candidateMatchScore.totalScore}
                  status={candidateMatchScore.status}
                  size="sm"
                  onClick={() => {
                    setSelectedBreakdownApp({
                      candidate: initialCandidateProfile,
                      roleAppliedFor: selectedRole || opportunity.title,
                      opportunityTitle: opportunity.title,
                      match_score: {
                        total_score: candidateMatchScore.totalScore,
                        status: candidateMatchScore.status,
                        confidence_level: candidateMatchScore.confidenceLevel,
                        calculation_summary: candidateMatchScore.calculationSummary,
                        breakdowns: candidateMatchScore.breakdowns.map((b) => ({
                          criterion_key: b.criterionKey,
                          criterion_name: b.criterionName,
                          max_points: b.maxPoints,
                          points_awarded: b.pointsAwarded,
                          evidence_used: b.evidenceUsed,
                          missing_or_uncertainty: b.missingOrUncertainty,
                        })),
                      },
                    });
                    setIsBreakdownModalOpen(true);
                  }}
                />
              </div>
              <p className="text-xs text-neutral-600 leading-relaxed">
                {candidateMatchScore.calculationSummary}
              </p>
              <button
                type="button"
                onClick={() => {
                  setSelectedBreakdownApp({
                    candidate: initialCandidateProfile,
                    roleAppliedFor: selectedRole || opportunity.title,
                    opportunityTitle: opportunity.title,
                    match_score: {
                      total_score: candidateMatchScore.totalScore,
                      status: candidateMatchScore.status,
                      confidence_level: candidateMatchScore.confidenceLevel,
                      calculation_summary: candidateMatchScore.calculationSummary,
                      breakdowns: candidateMatchScore.breakdowns.map((b) => ({
                        criterion_key: b.criterionKey,
                        criterion_name: b.criterionName,
                        max_points: b.maxPoints,
                        points_awarded: b.pointsAwarded,
                        evidence_used: b.evidenceUsed,
                        missing_or_uncertainty: b.missingOrUncertainty,
                      })),
                    },
                  });
                  setIsBreakdownModalOpen(true);
                }}
                className="text-xs font-bold text-brand-pink hover:underline"
              >
                View Transparent Score Breakdown →
              </button>
            </div>
          </div>
        </div>

        {/* 4. SIMILAR OPPORTUNITIES */}
        {similarOpportunities.length > 0 && (
          <section className="pt-8 space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-xl sm:text-2xl font-bold font-serif text-brand-navy">
                  Similar Opportunities
                </h2>
                <p className="text-xs text-brand-text-secondary mt-0.5">
                  Explore other active roles in {opportunity.category || 'production'}
                </p>
              </div>
              <Link
                to="/opportunities"
                className="text-xs font-bold text-brand-pink hover:underline hidden sm:inline-block"
              >
                View All Opportunities →
              </Link>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {similarOpportunities.map((simOpp) => (
                <OpportunityCard key={simOpp.id} opportunity={simOpp} />
              ))}
            </div>
          </section>
        )}

        {/* 5. CANDIDATE APPLICATION MODAL */}
        <Modal
          isOpen={applyModalOpen}
          onClose={() => setApplyModalOpen(false)}
          title="Submit Audition Application"
        >
          <form onSubmit={handleConfirmApplication} className="space-y-4 text-left text-xs">
            {submitError && (
              <div className="p-3 bg-red-50 border border-red-200 text-red-700 rounded-xl flex items-center gap-2">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{submitError}</span>
              </div>
            )}

            <div className="p-3.5 bg-pink-50 border border-pink-100 rounded-2xl space-y-1">
              <p className="text-xs font-bold text-brand-navy">
                Casting Call: <span className="text-brand-pink">{opportunity.title}</span>
              </p>
              <p className="text-[11px] text-brand-text-secondary">
                Production: <strong>{opportunity.productionCompany}</strong> • Location: <strong>{opportunity.location}</strong>
              </p>
            </div>

            {/* Role Selection when multiple roles exist */}
            {availableRoles.length > 1 && (
              <div className="space-y-1">
                <label className="block text-[11px] font-bold text-gray-800 uppercase tracking-wider">
                  Select Role to Apply For <span className="text-brand-pink">*</span>
                </label>
                <select
                  value={selectedRole}
                  onChange={(e) => setSelectedRole(e.target.value)}
                  className="w-full p-2.5 bg-white border border-gray-200 rounded-xl text-xs font-medium text-gray-900 focus:outline-none focus:ring-2 focus:ring-brand-pink cursor-pointer"
                  required
                >
                  {availableRoles.map((role, idx) => (
                    <option key={idx} value={role}>
                      {role}
                    </option>
                  ))}
                </select>
              </div>
            )}

            {/* Candidate Profile Details Confirmation */}
            <div className="p-3.5 bg-gray-50 border border-gray-200/80 rounded-2xl space-y-2">
              <h4 className="text-[11px] font-bold uppercase tracking-wider text-brand-text-secondary">
                Candidate Profile Information
              </h4>
              <div className="flex items-center gap-3">
                <Avatar
                  src={user?.avatar || initialCandidateProfile.avatar}
                  name={user?.fullName || user?.name || initialCandidateProfile.fullName}
                  size="md"
                />
                <div className="text-xs">
                  <p className="font-bold text-brand-navy">
                    {user?.fullName || user?.name || initialCandidateProfile.fullName}
                  </p>
                  <p className="text-[11px] text-brand-text-secondary">
                    {user?.email || 'elena.rostova@example.com'} • {initialCandidateProfile.location}
                  </p>
                </div>
              </div>
            </div>

            {/* Optional Cover Note */}
            <Textarea
              label="Audition Note / Cover Message (Optional)"
              placeholder="Tell the casting director about your character approach, preparation, and relevant credits..."
              value={coverNote}
              onChange={(e) => setCoverNote(e.target.value)}
              rows={3}
            />

            {/* Portfolio / Showreel Reference */}
            <div className="space-y-1">
              <label className="block text-[11px] font-bold text-gray-800 uppercase tracking-wider">
                Showreel / Portfolio URL
              </label>
              <input
                type="url"
                value={portfolioLink}
                onChange={(e) => setPortfolioLink(e.target.value)}
                placeholder="https://vimeo.com/... or YouTube link"
                className="w-full p-2.5 bg-white border border-gray-200 rounded-xl text-xs text-gray-900 focus:outline-none focus:ring-2 focus:ring-brand-pink"
              />
            </div>

            {/* Self-Tape Video File (Optional) */}
            <FileUpload
              label="Audition Self-Tape Video File (Optional)"
              helperText="Upload MP4 or MOV video (Max 50MB)"
              file={selfTapeFile}
              onFileSelect={setSelfTapeFile}
              onFileRemove={() => setSelfTapeFile(null)}
            />

            {/* Required Application Questions */}
            <div className="space-y-2 pt-1 border-t border-gray-100">
              <label className="block text-[11px] font-bold text-gray-800 uppercase tracking-wider">
                Travel &amp; Shoot Schedule Feasibility
              </label>
              <select
                value={travelFeasibility}
                onChange={(e) => setTravelFeasibility(e.target.value)}
                className="w-full p-2.5 bg-white border border-gray-200 rounded-xl text-xs font-medium text-gray-900 focus:outline-none focus:ring-2 focus:ring-brand-pink cursor-pointer"
              >
                <option value="Available to travel at own schedule">Available to travel at own schedule</option>
                <option value="Local resident in shoot city">Local resident in shoot city</option>
                <option value="Travel with production accommodation needed">Travel with production accommodation needed</option>
              </select>
            </div>

            {/* Availability Checkbox */}
            <label className="flex items-start gap-2 text-xs text-brand-navy cursor-pointer select-none pt-1">
              <input
                type="checkbox"
                checked={confirmAvailability}
                onChange={(e) => setConfirmAvailability(e.target.checked)}
                className="rounded border-gray-300 text-brand-pink focus:ring-brand-pink mt-0.5 cursor-pointer"
                required
              />
              <span className="text-[11px] text-brand-text-secondary leading-snug">
                I confirm that I am available for audition callbacks and the projected shoot dates in {opportunity.location}.
              </span>
            </label>

            {/* Modal Actions */}
            <div className="flex justify-end gap-3 pt-3 border-t border-gray-100">
              <Button
                variant="secondary"
                type="button"
                onClick={() => setApplyModalOpen(false)}
                disabled={isSubmitting}
                className="text-xs"
              >
                Cancel
              </Button>
              <Button
                type="submit"
                disabled={isSubmitting}
                className="text-xs bg-brand-pink hover:bg-rose-700 text-white font-bold"
              >
                {isSubmitting ? 'Submitting Application...' : 'Confirm & Submit Application'}
              </Button>
            </div>
          </form>
        </Modal>

        {/* 6. REPORT LISTING MODAL */}
        <Modal
          isOpen={reportModalOpen}
          onClose={() => setReportModalOpen(false)}
          title="Report Casting Call Listing"
        >
          {reportSubmitted ? (
            <div className="p-6 text-center space-y-3">
              <CheckCircle2 className="w-10 h-10 text-emerald-600 mx-auto" />
              <h3 className="font-bold text-sm text-gray-900">Report Received</h3>
              <p className="text-xs text-gray-500">
                Thank you for helping keep StageLink safe. Our moderation team will investigate this listing immediately.
              </p>
            </div>
          ) : (
            <form onSubmit={handleReportSubmit} className="space-y-4 text-left text-xs">
              <p className="text-gray-600 text-xs">
                If you believe this casting call violates StageLink safety guidelines or represents fraudulent activity, let our moderation desk know:
              </p>

              <div className="space-y-1">
                <label className="block text-[11px] font-bold text-gray-800 uppercase tracking-wider">
                  Reason for Report
                </label>
                <select
                  value={reportReason}
                  onChange={(e) => setReportReason(e.target.value)}
                  className="w-full p-2.5 bg-white border border-gray-200 rounded-xl text-xs font-medium text-gray-900 focus:outline-none focus:ring-2 focus:ring-brand-pink cursor-pointer"
                >
                  <option value="Misleading information">Misleading information or compensation</option>
                  <option value="Inappropriate content">Inappropriate or prohibited content</option>
                  <option value="Suspected fraud">Suspected fraudulent production company</option>
                  <option value="Expired listing">Listing is closed but still active</option>
                  <option value="Other">Other violation</option>
                </select>
              </div>

              <Textarea
                label="Additional Details (Optional)"
                placeholder="Provide any specific details or concerns..."
                value={reportDetails}
                onChange={(e) => setReportDetails(e.target.value)}
                rows={3}
              />

              <div className="flex justify-end gap-2 pt-2 border-t border-gray-100">
                <Button
                  variant="secondary"
                  size="sm"
                  type="button"
                  onClick={() => setReportModalOpen(false)}
                  className="text-xs"
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  size="sm"
                  className="text-xs bg-rose-600 hover:bg-rose-700 text-white font-bold"
                >
                  Submit Report
                </Button>
              </div>
            </form>
          )}
        </Modal>

        {/* 7. SCORE BREAKDOWN MODAL */}
        <ScoreBreakdownModal
          isOpen={isBreakdownModalOpen}
          onClose={() => {
            setIsBreakdownModalOpen(false);
            setSelectedBreakdownApp(null);
          }}
          application={selectedBreakdownApp}
        />

        {/* 8. CANDIDATE PRODUCTION COMPANY RATING MODAL */}
        {opportunity && (
          <CompanyRatingModal
            isOpen={isCompanyRatingModalOpen}
            onClose={() => setIsCompanyRatingModalOpen(false)}
            companyName={opportunity.productionCompany}
            companyId={opportunity.productionCompany?.toLowerCase().replace(/\s+/g, '-')}
            opportunityId={opportunity.id}
            opportunityTitle={opportunity.title}
            candidateId={user?.id || 'cand-1'}
            candidateName={user?.name || user?.fullName || 'StageLink Performer'}
            onReviewSubmitted={(newRev) => {
              setCompanyStats((prev) => ({
                averageRating: newRev.rating,
                totalReviews: (prev.totalReviews || 0) + 1,
                reviews: [newRev, ...(prev.reviews || [])],
              }));
            }}
          />
        )}
      </PageContainer>
    </div>
  );
};

export default OpportunityDetailsPage;
