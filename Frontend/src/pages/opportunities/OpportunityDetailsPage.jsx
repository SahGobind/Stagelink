import React, { useState, useEffect, useMemo } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
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
import { saveCandidateApplication } from '../../data/mockApplications';
import { initialCandidateProfile } from '../../data/mockCandidates';
import { rankingService } from '../../services/rankingService';
import { calculateCandidateMatchScore } from '../../services/scoringEngine';
import { useApp } from '../../context/AppContext';
import { useAuth } from '../../context/AuthContext';

const OpportunityDetailsPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { isOpportunitySaved, toggleSaveOpportunity } = useApp();
  const { isAuthenticated, user } = useAuth();

  const opportunity = useMemo(() => {
    const allOpps = [...getCustomOpportunities(), ...mockOpportunities];
    return allOpps.find((o) => o.id === id || o.refId === id) || null;
  }, [id]);
  const [activeImage, setActiveImage] = useState(0);
  const [applyModalOpen, setApplyModalOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [hasApplied, setHasApplied] = useState(false);
  const [applicationRef, setApplicationRef] = useState('');
  const [coverNote, setCoverNote] = useState('');
  const [selfTapeFile, setSelfTapeFile] = useState(null);
  const [confirmAvailability, setConfirmAvailability] = useState(true);

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
            Opportunity Not Found
          </h1>
          <p className="text-xs text-brand-text-secondary max-w-sm mx-auto">
            The casting opportunity you are looking for may have been removed or does not exist.
          </p>
          <div className="pt-2">
            <Link
              to="/opportunities"
              className="inline-flex items-center px-5 py-2.5 bg-black hover:bg-neutral-800 text-white text-xs font-bold rounded-xl transition-colors"
            >
              Back to Opportunities
            </Link>
          </div>
        </PageContainer>
      </div>
    );
  }

  const isSaved = isOpportunitySaved(opportunity.id);
  const isClosed = opportunity.status === 'closed' || opportunity.status === 'expired';
  const gallery = opportunity.gallery?.length ? opportunity.gallery : [opportunity.image];

  // Similar opportunities: same category or matching tags, excluding the current one
  const similarOpportunities = mockOpportunities
    .filter(
      (opp) =>
        opp.id !== opportunity.id &&
        (opp.categoryKey === opportunity.categoryKey ||
          opp.category === opportunity.category ||
          opp.location === opportunity.location)
    )
    .slice(0, 3);

  const [rankedApplications, setRankedApplications] = useState([]);
  const [selectedBreakdownApp, setSelectedBreakdownApp] = useState(null);
  const [isBreakdownModalOpen, setIsBreakdownModalOpen] = useState(false);

  // Evaluate candidate's match score against this opportunity
  const candidateMatchScore = useMemo(() => {
    return calculateCandidateMatchScore(initialCandidateProfile, opportunity);
  }, [opportunity]);

  // Load ranked candidates preview
  useEffect(() => {
    if (opportunity) {
      rankingService.getRankedCandidates(opportunity.id, { pageSize: 3 }).then((res) => {
        if (res?.applications) setRankedApplications(res.applications.slice(0, 3));
      });
    }
  }, [opportunity]);

  // Handle Apply Now click
  const handleApplyClick = () => {
    if (isClosed) return;

    if (!isAuthenticated) {
      // Redirect unauthenticated users to login with return destination
      navigate('/login', {
        state: { from: `/opportunities/${opportunity.id}` },
      });
      return;
    }

    // Authenticated user proceeds to review-application modal
    setApplyModalOpen(true);
  };

  // Handle Application Submission in review modal
  const handleConfirmApplication = (e) => {
    e.preventDefault();
    setIsSubmitting(true);

    setTimeout(() => {
      const generatedRef = `SC-${Math.floor(100000 + Math.random() * 900000)}`;
      setApplicationRef(generatedRef);

      // Create rich application record with transparent match score
      const candidateProfile = initialCandidateProfile;
      const matchScore = calculateCandidateMatchScore(candidateProfile, opportunity);
      const newApp = {
        id: `app-${Date.now()}`,
        opportunityId: opportunity.id,
        opportunityTitle: opportunity.title,
        productionCompany: opportunity.productionCompany,
        location: opportunity.location,
        candidateId: user?.id || 'cand-1',
        candidateName: user?.fullName || candidateProfile.fullName,
        candidateAvatar: user?.avatar || candidateProfile.avatar,
        candidateHeadline: candidateProfile.headline,
        candidateLocation: candidateProfile.location,
        candidateExperience: candidateProfile.experienceLevel,
        roleAppliedFor: opportunity.roles?.[0]?.name || opportunity.title,
        status: 'submitted',
        appliedDate: new Date().toISOString().split('T')[0],
        coverMessage: coverNote,
        submittedMaterials: {
          headshot: candidateProfile.avatar,
          videoAudition: selfTapeFile ? { title: selfTapeFile.name, url: 'https://vimeo.com/76979871' } : null,
          resume: { fileName: `${(user?.fullName || candidateProfile.fullName).replace(/\s+/g, '_')}_Resume.pdf`, fileSize: '2.1 MB' },
        },
        match_score: {
          total_score: matchScore.totalScore,
          status: matchScore.status,
          confidence_level: matchScore.confidenceLevel,
          missing_fields: matchScore.missingFields,
          improvement_suggestions: matchScore.improvementSuggestions,
          calculation_summary: matchScore.calculationSummary,
          calculated_at: new Date().toISOString(),
          breakdowns: matchScore.breakdowns.map(b => ({
            criterion_key: b.criterionKey,
            criterion_name: b.criterionName,
            max_points: b.maxPoints,
            points_awarded: b.pointsAwarded,
            evidence_used: b.evidenceUsed,
            missing_or_uncertainty: b.missingOrUncertainty,
          })),
        },
        statusHistory: [
          {
            status: 'submitted',
            changedAt: new Date().toISOString(),
            note: 'Application submitted with profile materials & verified showreel.',
            changedBy: user?.fullName || 'Candidate',
          },
        ],
        internalNotes: [],
      };

      saveCandidateApplication(newApp);

      setIsSubmitting(false);
      setHasApplied(true);
      setApplyModalOpen(false);
    }, 600);
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
            Acting Opportunities
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
              <p className="font-bold">This Casting Call is Closed</p>
              <p className="text-[11px] text-amber-700">
                The deadline ({opportunity.deadline}) has passed or the production company is no longer accepting new submissions.
              </p>
            </div>
          </div>
        )}

        {/* Application Submitted Success Banner */}
        {hasApplied && (
          <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-2xl flex items-center gap-3 text-emerald-800 text-xs">
            <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
            <div>
              <p className="font-bold">Application Successfully Submitted!</p>
              <p className="text-[11px] text-emerald-700">
                Your portfolio, headshots, and notes have been delivered to {opportunity.productionCompany}. Application Ref: #{applicationRef || 'SC-849201'}
              </p>
            </div>
          </div>
        )}

        {/* 2. HERO CARD: Image + Specs & Application Header */}
        <div className="bg-white rounded-3xl border border-brand-border p-6 sm:p-8 shadow-card grid grid-cols-1 md:grid-cols-12 gap-8 items-start">
          {/* Left: Project Image & Gallery Thumbnails */}
          <div className="md:col-span-5 space-y-3">
            <div className="aspect-[4/5] rounded-2xl overflow-hidden bg-gray-100 shadow-subtle border border-gray-100 relative group">
              <img
                src={gallery[activeImage] || opportunity.image}
                alt={opportunity.title}
                className={`w-full h-full object-cover transition-transform duration-500 group-hover:scale-102 ${
                  isClosed ? 'grayscale-[30%]' : ''
                }`}
              />
              <div className="absolute top-3 left-3 flex items-center gap-2">
                <span className="px-3 py-1 bg-white/95 backdrop-blur-sm text-brand-pink text-xs font-bold rounded-full shadow-xs">
                  {opportunity.category || opportunity.type}
                </span>
                {isClosed && (
                  <span className="px-2.5 py-1 bg-gray-900/90 text-white text-[10px] font-bold rounded-full backdrop-blur-sm uppercase">
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
                    className={`aspect-square rounded-xl overflow-hidden border-2 transition-all ${
                      activeImage === idx
                        ? 'border-brand-pink ring-2 ring-brand-pink/20 scale-95'
                        : 'border-transparent opacity-70 hover:opacity-100'
                    }`}
                  >
                    <img src={img} alt="Thumbnail" className="w-full h-full object-cover" />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Right: Role Title, Production House, Key Specs, Actions */}
          <div className="md:col-span-7 space-y-6">
            <div className="space-y-2">
              <div className="flex items-center gap-2 text-xs text-brand-text-secondary">
                <Building2 className="w-4 h-4 text-brand-pink shrink-0" />
                <span className="font-bold text-brand-navy">{opportunity.productionCompany}</span>
                <span>•</span>
                <span className="flex items-center text-gray-400 text-[11px]">
                  <Clock className="w-3 h-3 mr-1" />
                  {opportunity.postedTime || 'Recently posted'}
                </span>
              </div>

              <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold font-serif text-brand-navy leading-tight">
                {opportunity.title}
              </h1>

              <div className="flex flex-wrap items-center gap-4 text-xs text-brand-text-secondary pt-1">
                <span className="flex items-center font-medium">
                  <MapPin className="w-3.5 h-3.5 text-brand-pink mr-1" />
                  {opportunity.location}
                </span>
                <span className="flex items-center font-medium">
                  <Calendar className="w-3.5 h-3.5 text-brand-pink mr-1" />
                  Deadline: <strong className="text-brand-navy ml-1">{opportunity.deadline}</strong>
                </span>
              </div>
            </div>

            {/* Compensation Details ONLY when provided */}
            {opportunity.compensation && (
              <div className="p-4 bg-emerald-50/70 border border-emerald-100 rounded-2xl flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-emerald-600 text-white flex items-center justify-center shrink-0">
                  <Banknote className="w-5 h-5" />
                </div>
                <div>
                  <p className="text-[10px] font-bold uppercase tracking-wider text-emerald-800">
                    Compensation / Remuneration
                  </p>
                  <p className="text-base font-bold text-emerald-900 mt-0.5">
                    {opportunity.compensation}
                  </p>
                </div>
              </div>
            )}

            {/* Action Buttons: Apply Now + Save */}
            <div className="flex flex-wrap items-center gap-3 pt-2">
              {hasApplied ? (
                <div className="flex-1 py-3 px-6 bg-emerald-50 border border-emerald-200 text-emerald-700 text-xs font-bold rounded-xl flex items-center justify-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                  <span>Applied</span>
                </div>
              ) : (
                <button
                  type="button"
                  onClick={handleApplyClick}
                  disabled={isClosed}
                  className={`flex-1 py-3.5 px-6 text-xs font-bold rounded-xl shadow-xs transition-all flex items-center justify-center gap-2 ${
                    isClosed
                      ? 'bg-gray-200 text-gray-500 cursor-not-allowed'
                      : 'bg-black hover:bg-neutral-800 text-white shadow-sm'
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
                className={`py-3.5 px-5 border rounded-xl text-xs font-bold transition-all flex items-center gap-2 ${
                  isSaved
                    ? 'border-black bg-neutral-100 text-black shadow-2xs'
                    : 'border-gray-200 text-brand-navy hover:border-gray-300 hover:bg-gray-50'
                }`}
              >
                <Heart className={`w-4 h-4 ${isSaved ? 'fill-black text-black' : ''}`} />
                <span>{isSaved ? 'Saved' : 'Save'}</span>
              </button>

              {/* Recruiter / Casting Director Shortcut Button */}
              <Link
                to={`/admin/opportunities/${opportunity.id}/candidates`}
                className="py-3.5 px-4 rounded-xl bg-pink-50 border border-pink-200 text-brand-pink text-xs font-bold hover:bg-pink-100 transition-colors flex items-center gap-1.5 shrink-0"
                title="Review & rank candidate applications for this role"
              >
                <Sparkles className="w-3.5 h-3.5" />
                <span>Ranked Candidates</span>
              </Link>
            </div>

            {/* Key Specifications Grid: Age, Experience, Type, Languages */}
            <div className="grid grid-cols-2 gap-3 pt-2">
              <div className="p-3.5 bg-gray-50 rounded-2xl border border-gray-100">
                <p className="text-[10px] uppercase font-bold tracking-wider text-brand-text-secondary">
                  Age Range
                </p>
                <p className="text-xs font-bold text-brand-navy mt-1">
                  {opportunity.ageRange || 'All ages welcome'}
                </p>
              </div>

              <div className="p-3.5 bg-gray-50 rounded-2xl border border-gray-100">
                <p className="text-[10px] uppercase font-bold tracking-wider text-brand-text-secondary">
                  Experience Req.
                </p>
                <p className="text-xs font-bold text-brand-navy mt-1">
                  {opportunity.experience || 'Freshers OK'}
                </p>
              </div>

              <div className="p-3.5 bg-gray-50 rounded-2xl border border-gray-100">
                <p className="text-[10px] uppercase font-bold tracking-wider text-brand-text-secondary">
                  Project Type
                </p>
                <p className="text-xs font-bold text-brand-navy mt-1">
                  {opportunity.category || opportunity.type}
                </p>
              </div>

              <div className="p-3.5 bg-gray-50 rounded-2xl border border-gray-100">
                <p className="text-[10px] uppercase font-bold tracking-wider text-brand-text-secondary">
                  Languages Required
                </p>
                <p className="text-xs font-bold text-brand-navy mt-1">
                  {opportunity.languages || 'Hindi, English'}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* 3. DETAILS BODY: Left (About, Role, Requirements) + Right (Casting Team & Company) */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          {/* Main Details (8 cols) */}
          <div className="lg:col-span-8 space-y-6">
            {/* About the Project */}
            <div className="bg-white rounded-3xl border border-brand-border p-6 sm:p-8 shadow-card space-y-3">
              <h2 className="text-lg font-bold font-serif text-brand-navy">
                About the Project
              </h2>
              <p className="text-xs sm:text-sm text-brand-text-secondary leading-relaxed">
                {opportunity.description}
              </p>
            </div>

            {/* Role Description */}
            <div className="bg-white rounded-3xl border border-brand-border p-6 sm:p-8 shadow-card space-y-3">
              <h2 className="text-lg font-bold font-serif text-brand-navy">
                Role Description
              </h2>
              <p className="text-xs sm:text-sm text-brand-text-secondary leading-relaxed">
                {opportunity.roleDescription ||
                  'The casting director is seeking a dedicated performer with strong dramatic comprehension, camera versatility, and natural engagement with script dialogues.'}
              </p>
            </div>

            {/* Eligibility and Requirements */}
            {opportunity.requirements && (
              <div className="bg-white rounded-3xl border border-brand-border p-6 sm:p-8 shadow-card space-y-4">
                <h2 className="text-lg font-bold font-serif text-brand-navy">
                  Eligibility & Requirements
                </h2>
                <ul className="space-y-2.5 text-xs sm:text-sm text-brand-text-secondary">
                  {opportunity.requirements.map((req, i) => (
                    <li key={i} className="flex items-start gap-2.5 leading-relaxed">
                      <CheckCircle2 className="w-4 h-4 text-brand-pink shrink-0 mt-0.5" />
                      <span>{req}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {/* Languages & Experience Breakdown */}
            <div className="bg-white rounded-3xl border border-brand-border p-6 sm:p-8 shadow-card space-y-4">
              <h2 className="text-lg font-bold font-serif text-brand-navy">
                Languages & Experience
              </h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="p-4 bg-gray-50 rounded-2xl border border-gray-100 flex items-start gap-3">
                  <Languages className="w-5 h-5 text-brand-pink shrink-0 mt-0.5" />
                  <div>
                    <h3 className="text-xs font-bold text-brand-navy">Spoken Languages</h3>
                    <p className="text-xs text-brand-text-secondary mt-0.5">
                      {opportunity.languages || 'Hindi, English'}
                    </p>
                    <p className="text-[11px] text-gray-400 mt-1">Fluency and clear diction required</p>
                  </div>
                </div>

                <div className="p-4 bg-gray-50 rounded-2xl border border-gray-100 flex items-start gap-3">
                  <Briefcase className="w-5 h-5 text-brand-navy shrink-0 mt-0.5" />
                  <div>
                    <h3 className="text-xs font-bold text-brand-navy">Experience Level</h3>
                    <p className="text-xs text-brand-text-secondary mt-0.5">
                      {opportunity.experience || 'Freshers OK'}
                    </p>
                    <p className="text-[11px] text-gray-400 mt-1">Previous showreels or workshop credits</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Candidate Role Compatibility Preview Card */}
            {user?.role === 'candidate' && (
              <div className="bg-pink-50/40 rounded-3xl border border-pink-100 p-6 shadow-xs space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Sparkles className="w-4 h-4 text-brand-pink" />
                    <h3 className="text-sm font-bold font-serif text-brand-navy">
                      Your Profile Match for this Role
                    </h3>
                  </div>
                  <ScoreBadge
                    score={candidateMatchScore.totalScore}
                    status={candidateMatchScore.status}
                    size="sm"
                    onClick={() => {
                      setSelectedBreakdownApp({
                        candidate: initialCandidateProfile,
                        roleAppliedFor: opportunity.roles?.[0]?.name || opportunity.title,
                        opportunityTitle: opportunity.title,
                        match_score: {
                          total_score: candidateMatchScore.totalScore,
                          status: candidateMatchScore.status,
                          confidence_level: candidateMatchScore.confidenceLevel,
                          calculation_summary: candidateMatchScore.calculationSummary,
                          breakdowns: candidateMatchScore.breakdowns.map(b => ({
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
                <p className="text-xs text-neutral-600">
                  {candidateMatchScore.calculationSummary}
                </p>
                {candidateMatchScore.improvementSuggestions?.length > 0 && (
                  <p className="text-[11px] text-brand-pink font-medium">
                    Profile Suggestion: {candidateMatchScore.improvementSuggestions[0]}
                  </p>
                )}
              </div>
            )}

            {/* 6. RANKED CANDIDATES SECTION (Casting Director & Recruiter System) */}
            <div className="bg-white rounded-3xl border border-brand-border p-6 sm:p-8 shadow-card space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-neutral-100">
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="p-1 rounded-lg bg-pink-50 text-brand-pink">
                      <Sparkles className="w-4 h-4 fill-current" />
                    </span>
                    <h2 className="text-lg font-bold font-serif text-brand-navy">
                      Ranked Candidates (Role Matching System)
                    </h2>
                  </div>
                  <p className="text-xs text-brand-text-secondary">
                    Applicants evaluated against this role’s specific criteria. Transparent 100-point rubric with zero protected demographic analysis.
                  </p>
                </div>

                <Link
                  to={`/admin/opportunities/${opportunity.id}/candidates`}
                  className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-slate-900 hover:bg-neutral-800 text-white text-xs font-bold shadow-xs transition-colors shrink-0"
                >
                  <Users className="w-3.5 h-3.5" />
                  <span>Open Ranked Dashboard</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </Link>
              </div>

              {/* Preview Candidate Cards */}
              {rankedApplications.length > 0 ? (
                <div className="space-y-3">
                  {rankedApplications.map((app) => (
                    <div
                      key={app.id}
                      className="p-3.5 rounded-2xl border border-neutral-200 bg-neutral-50/50 flex flex-col sm:flex-row sm:items-center justify-between gap-3 hover:border-neutral-300 transition-colors"
                    >
                      <div className="flex items-center gap-3">
                        <Avatar
                          src={app.candidate?.avatar || app.candidateAvatar}
                          name={app.candidate?.fullName || app.candidateName}
                          size="md"
                        />
                        <div>
                          <div className="flex items-center gap-2">
                            <h4 className="font-bold text-xs text-neutral-900">
                              {app.candidate?.fullName || app.candidateName}
                            </h4>
                            <span className="px-2 py-0.5 rounded-full text-[9px] font-bold bg-white border border-neutral-200 text-neutral-700">
                              {app.candidate?.experienceLevel || `${app.candidate?.yearsOfExperience || 2}+ Yrs`}
                            </span>
                          </div>
                          <p className="text-[11px] text-neutral-500 line-clamp-1">
                            {app.candidate?.skills?.slice(0, 3).join(', ') || 'Skills catalogued'} • {app.candidate?.location || 'Location verified'}
                          </p>
                        </div>
                      </div>

                      <div className="flex items-center gap-2.5 self-end sm:self-center">
                        <ScoreBadge
                          score={app.match_score?.total_score}
                          status={app.match_score?.status}
                          size="sm"
                          onClick={() => {
                            setSelectedBreakdownApp(app);
                            setIsBreakdownModalOpen(true);
                          }}
                        />

                        <Link
                          to={`/admin/opportunities/${opportunity.id}/candidates`}
                          className="px-2.5 py-1 rounded-lg bg-white border border-neutral-200 hover:border-brand-pink text-neutral-800 text-[11px] font-semibold transition-colors"
                        >
                          Review
                        </Link>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="p-6 text-center text-xs text-neutral-500 bg-neutral-50 rounded-2xl border border-neutral-200">
                  <p>Applications submitted to this casting call will automatically appear ranked here.</p>
                </div>
              )}
            </div>
          </div>

          {/* Right Sidebar (4 cols): Casting Team & Production Information */}
          <div className="lg:col-span-4 space-y-6">
            {/* Casting Team Information */}
            <div className="bg-white rounded-3xl border border-brand-border p-6 shadow-card space-y-4">
              <h3 className="text-xs font-bold uppercase tracking-wider text-brand-text-secondary">
                Casting Team Information
              </h3>

              {opportunity.castingTeam ? (
                <div className="space-y-4">
                  <div className="flex items-start gap-3">
                    <div className="w-12 h-12 rounded-2xl bg-brand-navy text-white flex items-center justify-center font-bold text-base shadow-subtle shrink-0">
                      {opportunity.castingTeam.name.charAt(0)}
                    </div>
                    <div>
                      <div className="flex items-center gap-1.5">
                        <h4 className="text-sm font-bold text-brand-navy">
                          {opportunity.castingTeam.name}
                        </h4>
                        {opportunity.castingTeam.verified && (
                          <ShieldCheck className="w-4 h-4 text-brand-pink" />
                        )}
                      </div>
                      <p className="text-xs font-medium text-brand-pink">
                        {opportunity.castingTeam.title}
                      </p>
                      <p className="text-[11px] text-brand-text-secondary">
                        {opportunity.castingTeam.company}
                      </p>
                    </div>
                  </div>

                  <p className="text-xs text-brand-text-secondary leading-relaxed bg-gray-50 p-3 rounded-2xl border border-gray-100">
                    {opportunity.castingTeam.bio}
                  </p>

                  <div className="flex items-center gap-2 text-xs text-brand-navy pt-1 font-semibold">
                    <Mail className="w-3.5 h-3.5 text-brand-pink shrink-0" />
                    <span className="truncate">{opportunity.castingTeam.email}</span>
                  </div>
                </div>
              ) : (
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-2xl bg-brand-navy flex items-center justify-center text-white font-serif font-bold text-lg">
                    {opportunity.companyLogo || 'C'}
                  </div>
                  <div>
                    <h4 className="text-sm font-bold text-brand-navy">
                      {opportunity.productionCompany}
                    </h4>
                    <p className="text-[11px] text-brand-text-secondary">Verified Casting Desk</p>
                  </div>
                </div>
              )}
            </div>

            {/* Production House Details */}
            <div className="bg-white rounded-3xl border border-brand-border p-6 shadow-card space-y-4">
              <h3 className="text-xs font-bold uppercase tracking-wider text-brand-text-secondary">
                Production Company
              </h3>
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
                Submissions via StageLink are reviewed directly by the designated production office and casting directors.
              </p>
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
                  Explore other active roles in {opportunity.category} and related productions
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

        {/* 5. REVIEW APPLICATION MODAL (for authenticated candidates) */}
        <Modal
          isOpen={applyModalOpen}
          onClose={() => setApplyModalOpen(false)}
          title={`Review & Submit Application`}
        >
          <form onSubmit={handleConfirmApplication} className="space-y-4 text-left">
            <div className="p-3.5 bg-brand-pink-light/60 border border-brand-pink/20 rounded-2xl space-y-1">
              <p className="text-xs font-bold text-brand-navy">
                Applying for: <span className="text-brand-pink">{opportunity.title}</span>
              </p>
              <p className="text-[11px] text-brand-text-secondary">
                Production House: <strong>{opportunity.productionCompany}</strong> • Location: <strong>{opportunity.location}</strong>
              </p>
            </div>

            {/* Candidate Profile Details Confirmation */}
            <div className="p-3.5 bg-gray-50 border border-gray-200/80 rounded-2xl space-y-2">
              <h4 className="text-[11px] font-bold uppercase tracking-wider text-brand-text-secondary">
                Applicant Information
              </h4>
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-brand-pink text-white flex items-center justify-center font-bold text-xs shrink-0">
                  {user?.name ? user.name.charAt(0) : 'S'}
                </div>
                <div className="text-xs">
                  <p className="font-bold text-brand-navy">{user?.name || 'Sarah Jenkins'}</p>
                  <p className="text-[11px] text-brand-text-secondary">{user?.email || 'sarah@stagelink.com'}</p>
                </div>
              </div>
              <p className="text-[11px] text-gray-500 italic">
                Your StageLink verified performer profile and headshots will be automatically attached to this submission.
              </p>
            </div>

            {/* Audition Note / Statement */}
            <Textarea
              label="Audition Note / Why are you suited for this role?"
              placeholder="Tell the casting director about your interest, character approach, and relevant experience..."
              value={coverNote}
              onChange={(e) => setCoverNote(e.target.value)}
              rows={3}
              required
            />

            {/* Audition Reel / Self-Tape Video File */}
            <FileUpload
              label="Audition Self-Tape / Showreel (Optional)"
              helperText="Upload MP4 or MOV video (Max 50MB)"
              file={selfTapeFile}
              onFileSelect={setSelfTapeFile}
              onFileRemove={() => setSelfTapeFile(null)}
            />

            {/* Availability Checkbox */}
            <label className="flex items-start gap-2 text-xs text-brand-navy cursor-pointer select-none">
              <input
                type="checkbox"
                checked={confirmAvailability}
                onChange={(e) => setConfirmAvailability(e.target.checked)}
                className="rounded border-gray-300 text-brand-pink focus:ring-brand-pink mt-0.5"
                required
              />
              <span className="text-[11px] text-brand-text-secondary">
                I confirm that I am available for audition callbacks and the projected shoot dates in {opportunity.location}.
              </span>
            </label>

            {/* Modal Actions */}
            <div className="flex justify-end gap-3 pt-4 border-t border-gray-100">
              <Button
                variant="secondary"
                type="button"
                onClick={() => setApplyModalOpen(false)}
                disabled={isSubmitting}
              >
                Cancel
              </Button>
              <Button type="submit" disabled={isSubmitting}>
                {isSubmitting ? 'Submitting Application...' : 'Confirm & Submit Application'}
              </Button>
            </div>
          </form>
        </Modal>

        {/* Score Breakdown Modal */}
        <ScoreBreakdownModal
          isOpen={isBreakdownModalOpen}
          onClose={() => {
            setIsBreakdownModalOpen(false);
            setSelectedBreakdownApp(null);
          }}
          application={selectedBreakdownApp}
        />
      </PageContainer>
    </div>
  );
};

export default OpportunityDetailsPage;
