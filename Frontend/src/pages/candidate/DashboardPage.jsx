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
  MessageSquare,
  Bell,
  ChevronRight,
  AlertCircle,
  Eye,
  Compass,
  Briefcase,
  ShieldCheck,
  Film,
} from 'lucide-react';
import PageContainer from '../../components/layout/PageContainer';
import OpportunityCard from '../../components/opportunities/OpportunityCard';
import ApplicationStatusBadge from '../../components/applications/ApplicationStatusBadge';
import EmptyState from '../../components/common/EmptyState';
import { useAuth } from '../../context/AuthContext';
import { useNotifications } from '../../context/NotificationContext';
import { getCandidateProfile, calculateProfileCompletion } from '../../data/mockCandidates';
import { getCandidateApplications } from '../../data/mockApplications';
import { mockOpportunities } from '../../data/mockOpportunities';
import { mockMessages } from '../../data/mockMessages';
import { formatDate } from '../../utils/formatters';

const DashboardPage = () => {
  const { user } = useAuth();
  const { notifications } = useNotifications();

  // Synchronize candidate profile & applications from storage
  const [candidate, setCandidate] = useState(() => getCandidateProfile());
  const [applications, setApplications] = useState(() => getCandidateApplications());

  useEffect(() => {
    const handleStorageChange = () => {
      setCandidate(getCandidateProfile());
      setApplications(getCandidateApplications());
    };
    window.addEventListener('storage', handleStorageChange);
    return () => window.removeEventListener('storage', handleStorageChange);
  }, []);

  // Personalized details
  const displayName = user?.fullName || candidate?.fullName || 'Sophia Bennett';
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
  const recentMessages = mockMessages.slice(0, 3);
  const recentNotifications = (notifications || []).slice(0, 4);
  const recommendedOpportunities = mockOpportunities.slice(0, 3);

  return (
    <PageContainer maxWidth="7xl" className="space-y-8 text-left pb-12">
      {/* 1. TOP WELCOME & PROFILE COMPLETION BANNER */}
      <div className="bg-white rounded-3xl p-6 sm:p-8 border border-brand-border shadow-card space-y-6">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
          {/* Welcome Info */}
          <div className="space-y-2">
            <div className="flex flex-wrap items-center gap-2">
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-50 text-emerald-800 text-[11px] font-bold border border-emerald-200">
                <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
                <span>Verified Performer Account</span>
              </span>
              <span className="text-xs text-gray-400">•</span>
              <span className="text-xs font-semibold text-brand-text-secondary">
                {candidate.location || 'London, UK / Los Angeles, CA'}
              </span>
            </div>

            <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold font-serif text-brand-navy">
              Welcome back, {firstName}! 👋
            </h1>

            <p className="text-xs sm:text-sm text-brand-text-secondary max-w-2xl leading-relaxed">
              {candidate.headline || 'Film & Theatre Performer | Classical & Dramatic Performer'}
            </p>
          </div>

          {/* Profile Completion Card / CTAs */}
          <div className="bg-gray-50/80 rounded-2xl p-5 border border-gray-100 min-w-[280px] sm:min-w-[320px] space-y-3">
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
            <div className="w-full bg-gray-200/80 h-2 rounded-full overflow-hidden">
              <div
                className={`h-full transition-all duration-500 ease-out rounded-full ${
                  isProfileComplete
                    ? 'bg-emerald-500'
                    : 'bg-gradient-to-r from-amber-500 to-brand-navy'
                }`}
                style={{ width: `${completionPercentage}%` }}
              />
            </div>

            {/* Incomplete / Complete Action */}
            {!isProfileComplete ? (
              <div className="space-y-2 pt-1">
                <p className="text-[11px] text-gray-500 flex items-center gap-1">
                  <AlertCircle className="w-3.5 h-3.5 text-amber-500 shrink-0" />
                  <span>
                    Missing: {missingSections.map((s) => s.name).join(', ')}
                  </span>
                </p>
                <Link
                  to="/candidate/profile/setup"
                  className="block w-full text-center py-2 px-3.5 bg-brand-navy hover:opacity-90 text-white text-xs font-bold rounded-xl shadow-xs transition-colors"
                >
                  Complete Profile & Portfolio
                </Link>
              </div>
            ) : (
              <div className="flex items-center gap-2 pt-1">
                <Link
                  to="/candidate/profile"
                  className="flex-1 text-center py-2 px-3 bg-brand-navy hover:opacity-90 text-white text-xs font-bold rounded-xl shadow-xs transition-colors flex items-center justify-center gap-1.5"
                >
                  <Eye className="w-3.5 h-3.5" />
                  <span>View My Profile</span>
                </Link>
                <Link
                  to="/candidate/profile/edit"
                  className="py-2 px-3 bg-white border border-gray-200 hover:border-black text-brand-navy text-xs font-bold rounded-xl transition-colors"
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
          className="group bg-white p-5 sm:p-6 rounded-2xl border border-brand-border hover:border-gray-400 shadow-card hover:shadow-card-hover transition-all flex items-center justify-between"
        >
          <div className="space-y-1">
            <p className="text-[11px] uppercase tracking-wider font-bold text-gray-400">
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
          <div className="w-12 h-12 rounded-2xl bg-gray-50 group-hover:bg-gray-100 flex items-center justify-center text-brand-navy transition-colors shrink-0">
            <FileText className="w-6 h-6" />
          </div>
        </Link>

        {/* Under Review */}
        <Link
          to="/candidate/applications"
          className="group bg-white p-5 sm:p-6 rounded-2xl border border-brand-border hover:border-sky-300 shadow-card hover:shadow-card-hover transition-all flex items-center justify-between"
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
          <div className="w-12 h-12 rounded-2xl bg-sky-50 group-hover:bg-sky-100 flex items-center justify-center text-sky-700 transition-colors shrink-0">
            <Clock className="w-6 h-6" />
          </div>
        </Link>

        {/* Shortlisted */}
        <Link
          to="/candidate/applications"
          className="group bg-white p-5 sm:p-6 rounded-2xl border border-brand-border hover:border-amber-300 shadow-card hover:shadow-card-hover transition-all flex items-center justify-between"
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
          <div className="w-12 h-12 rounded-2xl bg-amber-50 group-hover:bg-amber-100 flex items-center justify-center text-amber-700 transition-colors shrink-0">
            <Trophy className="w-6 h-6" />
          </div>
        </Link>

        {/* Interview Invitations */}
        <Link
          to="/candidate/applications"
          className="group bg-white p-5 sm:p-6 rounded-2xl border border-brand-border hover:border-brand-navy shadow-card hover:shadow-card-hover transition-all flex items-center justify-between"
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
          <div className="w-12 h-12 rounded-2xl bg-black text-white group-hover:opacity-90 flex items-center justify-center transition-colors shrink-0 shadow-xs">
            <Sparkles className="w-6 h-6" />
          </div>
        </Link>
      </div>

      {/* 3. MAIN DASHBOARD CONTENT GRID (Applications, Opportunities vs Messages, Notifications) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Left Column (8 cols): Recent Applications & Recommended Opportunities */}
        <div className="lg:col-span-8 space-y-8">
          {/* Section: Recent Applications */}
          <div className="bg-white rounded-3xl border border-brand-border p-6 sm:p-8 shadow-card space-y-6">
            <div className="flex items-center justify-between pb-4 border-b border-gray-100">
              <div>
                <div className="flex items-center gap-2">
                  <Briefcase className="w-5 h-5 text-brand-navy" />
                  <h2 className="text-xl font-bold font-serif text-brand-navy">
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
                    className="group p-4 sm:p-5 rounded-2xl border border-gray-100 hover:border-gray-300 bg-gray-50/50 hover:bg-white transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-4"
                  >
                    <div className="space-y-1.5">
                      <div className="flex flex-wrap items-center gap-2">
                        <ApplicationStatusBadge status={app.status} />
                        <span className="text-[11px] text-gray-400 flex items-center gap-1">
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
                        <p className="text-[11px] text-gray-500 italic pt-0.5">
                          Note: {app.notes}
                        </p>
                      )}
                    </div>

                    <Link
                      to={`/candidate/applications/${app.id}`}
                      className="px-3.5 py-2 bg-white border border-gray-200 hover:border-black rounded-xl text-xs font-bold text-brand-navy shadow-xs flex items-center justify-center gap-1.5 transition-all self-start sm:self-center shrink-0"
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
                  <h2 className="text-xl font-bold font-serif text-brand-navy">
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
          <div className="bg-black text-white p-6 sm:p-8 rounded-3xl shadow-card flex flex-col md:flex-row md:items-center justify-between gap-6 border border-neutral-800">
            <div className="space-y-1.5 max-w-xl">
              <div className="flex items-center gap-2">
                <Compass className="w-4 h-4 text-emerald-400" />
                <span className="text-[11px] uppercase font-bold tracking-wider text-emerald-400">
                  StarCast Casting Directory
                </span>
              </div>
              <h3 className="text-xl sm:text-2xl font-bold font-serif">
                Discover 500+ Open Casting Calls
              </h3>
              <p className="text-xs text-neutral-300 leading-relaxed">
                Filter by feature film, OTT web series, commercial campaigns, and West End stage repertory to find your next breakthrough project.
              </p>
            </div>

            <Link
              to="/opportunities"
              className="px-6 py-3.5 bg-white hover:bg-neutral-100 text-black font-bold text-xs rounded-xl shadow-md transition-colors flex items-center justify-center gap-2 shrink-0 self-start md:self-center"
            >
              <span>Browse Opportunities</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </div>

        {/* Right Column (4 cols): Recent Messages & Recent Notifications */}
        <div className="lg:col-span-4 space-y-8">
          {/* Recent Messages Card */}
          <div className="bg-white rounded-3xl border border-brand-border p-6 shadow-card space-y-5">
            <div className="flex items-center justify-between pb-3 border-b border-gray-100">
              <div className="flex items-center gap-2">
                <MessageSquare className="w-4 h-4 text-brand-navy" />
                <h3 className="text-sm font-bold font-serif text-brand-navy">
                  Recent Messages
                </h3>
              </div>
              <Link
                to="/candidate/messages"
                className="text-[11px] font-bold text-brand-navy hover:underline"
              >
                Open Inbox
              </Link>
            </div>

            {recentMessages.length === 0 ? (
              <EmptyState
                icon={MessageSquare}
                title="No messages"
                description="Conversations with casting directors will appear here."
              />
            ) : (
              <div className="space-y-2.5">
                {recentMessages.map((conv) => (
                  <Link
                    key={conv.id}
                    to={`/candidate/messages?conversationId=${conv.id}`}
                    className="block p-3 rounded-2xl border border-gray-100 hover:border-gray-300 hover:bg-gray-50 transition-all text-left"
                  >
                    <div className="flex items-start gap-3">
                      <div className="relative shrink-0">
                        <img
                          src={conv.participant.avatar}
                          alt={conv.participant.name}
                          className="w-10 h-10 rounded-xl object-cover border border-gray-200"
                        />
                        {conv.unreadCount > 0 && (
                          <span className="absolute -top-1 -right-1 w-3 h-3 bg-brand-navy text-white text-[9px] font-bold rounded-full flex items-center justify-center ring-2 ring-white">
                            {conv.unreadCount}
                          </span>
                        )}
                      </div>

                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between gap-1">
                          <h4 className="text-xs font-bold text-brand-navy truncate">
                            {conv.participant.name}
                          </h4>
                          <span className="text-[10px] text-gray-400 shrink-0">
                            {conv.lastMessageTime}
                          </span>
                        </div>

                        <p className="text-[11px] text-gray-500 font-medium truncate">
                          {conv.participant.organization || conv.participant.role}
                        </p>

                        <p className="text-xs text-brand-text-secondary truncate mt-1">
                          {conv.lastMessage}
                        </p>
                      </div>
                    </div>
                  </Link>
                ))}
              </div>
            )}
          </div>

          {/* Recent Notifications Card */}
          <div className="bg-white rounded-3xl border border-brand-border p-6 shadow-card space-y-5">
            <div className="flex items-center justify-between pb-3 border-b border-gray-100">
              <div className="flex items-center gap-2">
                <Bell className="w-4 h-4 text-brand-navy" />
                <h3 className="text-sm font-bold font-serif text-brand-navy">
                  Recent Notifications
                </h3>
              </div>
              <Link
                to="/candidate/notifications"
                className="text-[11px] font-bold text-brand-navy hover:underline"
              >
                View All
              </Link>
            </div>

            {recentNotifications.length === 0 ? (
              <EmptyState
                icon={Bell}
                title="No notifications"
                description="You are caught up on all alerts."
              />
            ) : (
              <div className="space-y-2.5">
                {recentNotifications.map((notif) => (
                  <Link
                    key={notif.id}
                    to="/candidate/notifications"
                    className={`block p-3 rounded-2xl border transition-all text-left ${
                      notif.read
                        ? 'bg-gray-50/50 border-gray-100 hover:border-gray-200'
                        : 'bg-neutral-50 border-gray-300 shadow-2xs hover:border-black'
                    }`}
                  >
                    <div className="flex items-start gap-2.5">
                      <div
                        className={`w-7 h-7 rounded-lg flex items-center justify-center shrink-0 mt-0.5 ${
                          notif.type === 'audition'
                            ? 'bg-black text-white'
                            : notif.type === 'opportunity'
                            ? 'bg-emerald-100 text-emerald-800'
                            : 'bg-gray-200 text-brand-navy'
                        }`}
                      >
                        {notif.type === 'audition' ? (
                          <Sparkles className="w-3.5 h-3.5" />
                        ) : notif.type === 'opportunity' ? (
                          <Film className="w-3.5 h-3.5" />
                        ) : (
                          <Bell className="w-3.5 h-3.5" />
                        )}
                      </div>

                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between gap-1">
                          <h4 className="text-xs font-bold text-brand-navy truncate">
                            {notif.title}
                          </h4>
                          {!notif.read && (
                            <span className="w-2 h-2 rounded-full bg-black shrink-0" />
                          )}
                        </div>
                        <p className="text-[11px] text-gray-500 line-clamp-2 mt-0.5 leading-snug">
                          {notif.message}
                        </p>
                        <span className="text-[10px] text-gray-400 block mt-1">
                          {notif.timestamp}
                        </span>
                      </div>
                    </div>
                  </Link>
                ))}
              </div>
            )}
          </div>

          {/* Quick Profile Shortcuts Card */}
          <div className="bg-white rounded-3xl border border-brand-border p-6 shadow-card space-y-4">
            <h3 className="text-sm font-bold font-serif text-brand-navy">
              Profile Management Shortcuts
            </h3>
            <div className="space-y-2 text-xs font-semibold">
              <Link
                to="/candidate/profile"
                className="flex items-center justify-between p-3 rounded-xl bg-gray-50 hover:bg-gray-100 text-brand-navy transition-colors"
              >
                <span>View Public Composite Card</span>
                <ChevronRight className="w-4 h-4 text-gray-400" />
              </Link>
              <Link
                to="/candidate/profile/edit"
                className="flex items-center justify-between p-3 rounded-xl bg-gray-50 hover:bg-gray-100 text-brand-navy transition-colors"
              >
                <span>Edit Credits, Media & Bio</span>
                <ChevronRight className="w-4 h-4 text-gray-400" />
              </Link>
              <Link
                to="/candidate/settings"
                className="flex items-center justify-between p-3 rounded-xl bg-gray-50 hover:bg-gray-100 text-brand-navy transition-colors"
              >
                <span>Contact Privacy & Account</span>
                <ChevronRight className="w-4 h-4 text-gray-400" />
              </Link>
            </div>
          </div>
        </div>
      </div>
    </PageContainer>
  );
};

export default DashboardPage;
