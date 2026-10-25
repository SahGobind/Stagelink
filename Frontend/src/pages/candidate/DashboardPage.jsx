import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  FileText,
  Clock,
  Trophy,
  Calendar,
  ArrowRight,
  Sparkles,
  CheckCircle2,
  ChevronRight,
  AlertCircle,
  Eye,
  Compass,
  Briefcase,
  ShieldCheck,
  Film,
  LifeBuoy,
} from 'lucide-react';
import PageContainer from '../../components/layout/PageContainer';
import OpportunityCard from '../../components/opportunities/OpportunityCard';
import ApplicationStatusBadge from '../../components/applications/ApplicationStatusBadge';
import EmptyState from '../../components/common/EmptyState';
import CreateTicketModal from '../../components/support/CreateTicketModal';
import { useAuth } from '../../context/AuthContext';
import { getCandidateProfile, calculateProfileCompletion } from '../../data/mockCandidates';
import { getCandidateApplications } from '../../data/mockApplications';
import { mockOpportunities } from '../../data/mockOpportunities';
import { getStoredSupportTickets } from '../../data/mockSupportTickets';
import { formatDate } from '../../utils/formatters';
import { candidateService } from '../../services/candidateService';
import { applicationService } from '../../services/applicationService';
import { castingService } from '../../services/castingService';

const DashboardPage = () => {
  const { user } = useAuth();

  // Synchronize candidate profile & applications from storage & MongoDB Atlas
  const [candidate, setCandidate] = useState(() => getCandidateProfile(user));
  const [applications, setApplications] = useState(() => getCandidateApplications());
  const [recommendedOpportunities, setRecommendedOpportunities] = useState(() => mockOpportunities.slice(0, 3));

  // Dynamic fetch from MongoDB Atlas backend
  useEffect(() => {
    let isMounted = true;
    const candidateId = user?.id || 'cand-aanya';

    candidateService.getById(candidateId).then((data) => {
      if (isMounted && data) setCandidate(data);
    }).catch((err) => console.warn('Candidate profile fetch fallback:', err));

    applicationService.getByCandidate(candidateId).then((data) => {
      if (isMounted && Array.isArray(data) && data.length > 0) setApplications(data);
    }).catch((err) => console.warn('Candidate applications fetch fallback:', err));

    castingService.getPublicOpportunities().then((data) => {
      if (isMounted && Array.isArray(data) && data.length > 0) {
        setRecommendedOpportunities(data.slice(0, 3));
      }
    }).catch((err) => console.warn('Recommended opportunities fetch fallback:', err));

    return () => {
      isMounted = false;
    };
  }, [user?.id]);

  // Support ticket state & modal
  const [isSupportModalOpen, setIsSupportModalOpen] = useState(false);
  const [supportTickets, setSupportTickets] = useState(() => {
    const all = getStoredSupportTickets();
    return all.filter((t) => t.userId === user?.id && t.userRole === 'candidate');
  });

  useEffect(() => {
    const handleSupportUpdate = () => {
      const all = getStoredSupportTickets();
      setSupportTickets(all.filter((t) => t.userId === user?.id && t.userRole === 'candidate'));
    };
    handleSupportUpdate();
    window.addEventListener('starcast_support_updated', handleSupportUpdate);
    return () => window.removeEventListener('starcast_support_updated', handleSupportUpdate);
  }, [user?.id]);

  useEffect(() => {
    setCandidate(getCandidateProfile(user));
  }, [user]);

  useEffect(() => {
    const handleStorageChange = () => {
      setCandidate(getCandidateProfile(user));
      setApplications(getCandidateApplications());
    };
    window.addEventListener('storage', handleStorageChange);
    window.addEventListener('starcast_profile_updated', handleStorageChange);
    return () => {
      window.removeEventListener('storage', handleStorageChange);
      window.removeEventListener('starcast_profile_updated', handleStorageChange);
    };
  }, [user]);

  // Personalized details isolated to this candidate
  const displayName = candidate?.fullName || user?.fullName || 'Candidate Artist';
  const firstName = displayName.split(' ')[0] || 'Artist';

  // Derived profile completion
  const profileStatus = calculateProfileCompletion(candidate);
  const completionPercentage = profileStatus.percentage;
  const isProfileComplete = profileStatus.isComplete;
  const missingSections = profileStatus.missingSections || [];

  // Summary counts derived directly from mock applications data
  const totalApplications = applications.length;
  const underReviewCount = applications.filter((a) => a.status === 'under_review').length;
  const shortlistedCount = applications.filter((a) => a.status === 'shortlisted').length;
  const interviewCount = applications.filter(
    (a) => a.status === 'audition_requested' || a.status === 'interview_invited'
  ).length;

  // Recent data sets
  const recentApplications = applications.slice(0, 3);

  return (
    <PageContainer maxWidth="7xl" className="space-y-8 text-left pb-12">
      {/* 1. TOP WELCOME & PROFILE COMPLETION BANNER */}
      <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200/80 shadow-3d-card specular-top space-y-6">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
          {/* Welcome Info */}
          <div className="space-y-2">
            <div className="flex flex-wrap items-center gap-2">
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-50 text-emerald-800 text-[11px] font-bold border border-emerald-200/80 shadow-2xs">
                <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
                <span>Verified Performer Account</span>
              </span>
              <span className="text-xs text-slate-400">•</span>
              <span className="text-xs font-semibold text-brand-text-secondary">
                {candidate.location || 'London, UK / Los Angeles, CA'}
              </span>
            </div>

            <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold font-serif text-brand-navy tracking-tight">
              Welcome back, {firstName}! 👋
            </h1>

            <p className="text-xs sm:text-sm text-brand-text-secondary max-w-2xl leading-relaxed">
              {candidate.headline || 'Film & Theatre Performer | Classical & Dramatic Performer'}
            </p>
          </div>

          {/* Profile Completion Card / CTAs */}
          <div className="bg-slate-50/80 rounded-2xl p-5 border border-slate-200/70 shadow-inner-bevel min-w-[280px] sm:min-w-[320px] space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-brand-navy">Portfolio Readiness</span>
              <div className="flex items-center gap-1.5">
                {isProfileComplete && (
                  <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                )}
                <span className="text-sm font-bold text-brand-navy">
                  {completionPercentage}%
                </span>
              </div>
            </div>

            {/* Progress Meter */}
            <div className="w-full bg-slate-200/80 h-2 rounded-full overflow-hidden shadow-inner-pressed">
              <div
                className={`h-full transition-all duration-500 ease-out rounded-full ${
                  isProfileComplete
                    ? 'bg-emerald-500 shadow-2xs'
                    : 'bg-gradient-to-r from-amber-500 via-rose-500 to-brand-navy shadow-2xs'
                }`}
                style={{ width: `${completionPercentage}%` }}
              />
            </div>

            {/* Incomplete / Complete Action */}
            {!isProfileComplete ? (
              <div className="space-y-2 pt-1">
                <p className="text-[11px] text-slate-500 flex items-center gap-1">
                  <AlertCircle className="w-3.5 h-3.5 text-amber-500 shrink-0" />
                  <span>
                    Missing: {missingSections.map((s) => s.name).join(', ')}
                  </span>
                </p>
                <Link
                  to="/candidate/profile/setup"
                  className="block w-full text-center py-2.5 px-3.5 bg-slate-900 hover:bg-black text-white text-xs font-bold rounded-xl shadow-3d-button hover:shadow-3d-card-hover active:translate-y-0.5 specular-top transition-all"
                >
                  Complete Profile &amp; Portfolio
                </Link>
              </div>
            ) : (
              <div className="flex items-center gap-2 pt-1">
                <Link
                  to="/candidate/profile"
                  className="flex-1 text-center py-2 px-3 bg-slate-900 hover:bg-black text-white text-xs font-bold rounded-xl shadow-3d-button hover:shadow-3d-card-hover active:translate-y-0.5 specular-top transition-all flex items-center justify-center gap-1.5"
                >
                  <Eye className="w-3.5 h-3.5" />
                  <span>View My Profile</span>
                </Link>
                <Link
                  to="/candidate/profile/edit"
                  className="py-2 px-3 bg-white border border-slate-200 hover:border-slate-900 text-brand-navy text-xs font-bold rounded-xl shadow-2xs hover:shadow-xs active:translate-y-0.5 transition-all"
                >
                  Edit
                </Link>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* 2. APPLICATION SUMMARY CARDS (Derived from mock data) */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
        {/* Total Applications */}
        <Link
          to="/candidate/applications"
          className="group bg-white p-5 sm:p-6 rounded-2xl border border-slate-200/80 hover:border-slate-400 shadow-3d-card hover:shadow-3d-card-hover hover:-translate-y-1 specular-top transition-all duration-300 flex items-center justify-between"
        >
          <div className="space-y-1">
            <p className="text-[11px] uppercase tracking-wider font-bold text-slate-400">
              Total Applications
            </p>
            <p className="text-2xl sm:text-3xl font-bold font-serif text-brand-navy">
              {totalApplications}
            </p>
            <span className="text-[11px] font-semibold text-brand-navy group-hover:underline flex items-center gap-1 pt-0.5">
              <span>View all files</span>
              <ChevronRight className="w-3 h-3 group-hover:translate-x-0.5 transition-transform" />
            </span>
          </div>
          <div className="w-12 h-12 rounded-2xl bg-slate-50 group-hover:bg-slate-100 flex items-center justify-center text-brand-navy transition-colors shrink-0 shadow-2xs">
            <FileText className="w-6 h-6" />
          </div>
        </Link>

        {/* Under Review */}
        <Link
          to="/candidate/applications"
          className="group bg-white p-5 sm:p-6 rounded-2xl border border-slate-200/80 hover:border-sky-300 shadow-3d-card hover:shadow-3d-card-hover hover:-translate-y-1 specular-top transition-all duration-300 flex items-center justify-between"
        >
          <div className="space-y-1">
            <p className="text-[11px] uppercase tracking-wider font-bold text-sky-700">
              Under Review
            </p>
            <p className="text-2xl sm:text-3xl font-bold font-serif text-brand-navy">
              {underReviewCount}
            </p>
            <span className="text-[11px] font-semibold text-sky-700 flex items-center gap-1 pt-0.5">
              <span>Audition review active</span>
            </span>
          </div>
          <div className="w-12 h-12 rounded-2xl bg-sky-50 group-hover:bg-sky-100 flex items-center justify-center text-sky-700 transition-colors shrink-0 shadow-2xs">
            <Clock className="w-6 h-6" />
          </div>
        </Link>

        {/* Shortlisted */}
        <Link
          to="/candidate/applications"
          className="group bg-white p-5 sm:p-6 rounded-2xl border border-slate-200/80 hover:border-amber-300 shadow-3d-card hover:shadow-3d-card-hover hover:-translate-y-1 specular-top transition-all duration-300 flex items-center justify-between"
        >
          <div className="space-y-1">
            <p className="text-[11px] uppercase tracking-wider font-bold text-amber-700">
              Shortlisted
            </p>
            <p className="text-2xl sm:text-3xl font-bold font-serif text-brand-navy">
              {shortlistedCount}
            </p>
            <span className="text-[11px] font-semibold text-amber-700 flex items-center gap-1 pt-0.5">
              <span>Director considerations</span>
            </span>
          </div>
          <div className="w-12 h-12 rounded-2xl bg-amber-50 group-hover:bg-amber-100 flex items-center justify-center text-amber-700 transition-colors shrink-0 shadow-2xs">
            <Trophy className="w-6 h-6" />
          </div>
        </Link>

        {/* Interview Invitations */}
        <Link
          to="/candidate/applications"
          className="group bg-white p-5 sm:p-6 rounded-2xl border border-slate-200/80 hover:border-slate-900 shadow-3d-card hover:shadow-3d-card-hover hover:-translate-y-1 specular-top transition-all duration-300 flex items-center justify-between"
        >
          <div className="space-y-1">
            <p className="text-[11px] uppercase tracking-wider font-bold text-brand-navy">
              Interview Invites
            </p>
            <p className="text-2xl sm:text-3xl font-bold font-serif text-brand-navy">
              {interviewCount}
            </p>
            <span className="text-[11px] font-semibold text-emerald-700 flex items-center gap-1 pt-0.5">
              <span>Audition tape callback</span>
            </span>
          </div>
          <div className="w-12 h-12 rounded-2xl bg-slate-950 text-white group-hover:opacity-90 flex items-center justify-center transition-colors shrink-0 shadow-3d-button specular-top">
            <Sparkles className="w-6 h-6" />
          </div>
        </Link>
      </div>

      {/* 3. MAIN DASHBOARD CONTENT (Applications, Recommendations & Opportunities) */}
      <div className="space-y-8">
          {/* Section: Recent Applications */}
          <div className="bg-white rounded-3xl border border-slate-200/80 p-6 sm:p-8 shadow-3d-card specular-top space-y-6">
            <div className="flex items-center justify-between pb-4 border-b border-slate-100">
              <div>
                <div className="flex items-center gap-2">
                  <Briefcase className="w-5 h-5 text-brand-navy" />
                  <h2 className="text-xl font-bold font-serif text-brand-navy tracking-tight">
                    Recent Applications
                  </h2>
                </div>
                <p className="text-xs text-brand-text-secondary mt-0.5">
                  Auditions and roles submitted to casting directors
                </p>
              </div>

              <Link
                to="/candidate/applications"
                className="text-xs font-bold text-brand-navy hover:underline flex items-center gap-1 group"
              >
                <span>View All ({totalApplications})</span>
                <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
              </Link>
            </div>

            {recentApplications.length === 0 ? (
              <EmptyState
                icon={Briefcase}
                title="No applications submitted yet"
                description="Explore current auditions and submit your tape to get reviewed by casting directors."
                actionLabel="Explore Opportunities"
                onAction={() => (window.location.href = '/opportunities')}
              />
            ) : (
              <div className="space-y-3.5">
                {recentApplications.map((app) => (
                  <div
                    key={app.id}
                    className="group p-4 sm:p-5 rounded-2xl border border-slate-200/80 hover:border-slate-300 bg-slate-50/50 hover:bg-white shadow-2xs hover:shadow-3d-subtle hover:-translate-y-0.5 transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-4"
                  >
                    <div className="space-y-1.5">
                      <div className="flex flex-wrap items-center gap-2">
                        <ApplicationStatusBadge status={app.status} />
                        <span className="text-[11px] text-slate-400 flex items-center gap-1 font-medium">
                          <Calendar className="w-3 h-3" />
                          Applied {formatDate(app.appliedDate)}
                        </span>
                      </div>

                      <h3 className="text-sm sm:text-base font-bold text-brand-navy group-hover:text-black">
                        <Link
                          to={`/candidate/applications/${app.id}`}
                          className="hover:underline"
                        >
                          {app.opportunityTitle}
                        </Link>
                      </h3>

                      <p className="text-xs text-brand-text-secondary">
                        Role: <strong className="text-brand-navy font-semibold">{app.roleAppliedFor}</strong> • {app.productionCompany}
                      </p>

                      {app.notes && (
                        <p className="text-[11px] text-slate-500 italic pt-0.5">
                          Note: {app.notes}
                        </p>
                      )}
                    </div>

                    <Link
                      to={`/candidate/applications/${app.id}`}
                      className="px-4 py-2 bg-white border border-slate-200 hover:border-slate-900 rounded-xl text-xs font-bold text-brand-navy shadow-2xs hover:shadow-xs active:translate-y-0.5 flex items-center justify-center gap-1.5 transition-all self-start sm:self-center shrink-0"
                    >
                      <span>Application Details</span>
                      <ChevronRight className="w-3.5 h-3.5" />
                    </Link>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Section: Recommended Casting Opportunities */}
          <div className="space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
              <div>
                <div className="flex items-center gap-2">
                  <Film className="w-5 h-5 text-brand-navy" />
                  <h2 className="text-xl font-bold font-serif text-brand-navy tracking-tight">
                    Recommended Casting Calls
                  </h2>
                </div>
                <p className="text-xs text-brand-text-secondary mt-0.5">
                  Roles matching your playing age, location, and performance disciplines
                </p>
              </div>

              <Link
                to="/opportunities"
                className="text-xs font-bold text-brand-navy hover:underline flex items-center gap-1 group self-start sm:self-auto"
              >
                <span>Browse All Opportunities</span>
                <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
              </Link>
            </div>

            {recommendedOpportunities.length === 0 ? (
              <EmptyState
                icon={Film}
                title="No casting recommendations"
                description="Check back shortly as new roles are posted daily by accredited studios."
              />
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {recommendedOpportunities.map((opp) => (
                  <OpportunityCard key={opp.id} opportunity={opp} />
                ))}
              </div>
            )}
          </div>

          {/* Prominent Browse Opportunities CTA Banner */}
          <div className="bg-gradient-to-r from-neutral-950 via-slate-900 to-neutral-950 text-white p-6 sm:p-8 rounded-3xl shadow-3d-floating specular-top flex flex-col md:flex-row md:items-center justify-between gap-6 border border-neutral-800 relative overflow-hidden">
            <div className="absolute top-0 right-0 w-80 h-80 bg-rose-500/10 rounded-full blur-3xl pointer-events-none" />
            <div className="space-y-1.5 max-w-xl relative z-10">
              <div className="flex items-center gap-2">
                <Compass className="w-4 h-4 text-emerald-400" />
                <span className="text-[11px] uppercase font-bold tracking-wider text-emerald-400">
                  StageLink Casting Directory
                </span>
              </div>
              <h3 className="text-xl sm:text-2xl font-bold font-serif tracking-tight">
                Discover 500+ Open Casting Calls
              </h3>
              <p className="text-xs text-neutral-300 leading-relaxed">
                Filter by feature film, OTT web series, commercial campaigns, and West End stage repertory to find your next breakthrough project.
              </p>
            </div>

            <Link
              to="/opportunities"
              className="px-6 py-3.5 bg-white hover:bg-neutral-100 text-neutral-950 font-bold text-xs rounded-xl shadow-3d-button hover:shadow-3d-card-hover active:translate-y-0.5 specular-top transition-all flex items-center justify-center gap-2 shrink-0 self-start md:self-center relative z-10"
            >
              <span>Browse Opportunities</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>

        {/* Help & Support Desk Banner */}
        <div className="bg-white rounded-3xl border border-slate-200/80 p-6 sm:p-7 shadow-3d-card specular-top flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3.5">
            <div className="w-10 h-10 rounded-2xl bg-pink-50 text-brand-pink flex items-center justify-center shrink-0 shadow-2xs border border-pink-100">
              <LifeBuoy className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-sm sm:text-base font-bold font-serif text-brand-navy">
                Need Help with Auditions or Submissions?
              </h3>
              <p className="text-xs text-slate-500 mt-0.5">
                StageLink Operations Desk is available to assist with callback specs, tapes, and account verification.
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2.5 shrink-0">
            <button
              type="button"
              onClick={() => setIsSupportModalOpen(true)}
              className="px-4 py-2.5 rounded-xl bg-brand-pink hover:bg-rose-700 text-white font-bold text-xs shadow-3d-button-pink hover:shadow-3d-card-hover active:translate-y-0.5 specular-top transition-all cursor-pointer flex items-center gap-1.5"
            >
              <LifeBuoy className="w-4 h-4" />
              <span>Contact Operation Team</span>
            </button>
            <Link
              to="/candidate/support"
              className="px-4 py-2.5 rounded-xl bg-slate-50 hover:bg-slate-100 text-brand-navy font-bold text-xs border border-slate-200/80 shadow-2xs hover:shadow-xs active:translate-y-0.5 transition-all"
            >
              <span>My Tickets {supportTickets.length > 0 ? `(${supportTickets.length})` : ''}</span>
            </Link>
          </div>
        </div>
      </div>

      {/* Support Ticket Modal */}
      <CreateTicketModal
        isOpen={isSupportModalOpen}
        onClose={() => setIsSupportModalOpen(false)}
        onTicketCreated={() => {
          const all = getStoredSupportTickets();
          setSupportTickets(all.filter((t) => t.userId === user?.id && t.userRole === 'candidate'));
        }}
      />
    </PageContainer>
  );
};

export default DashboardPage;
