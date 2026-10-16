import React, { useMemo } from 'react';
import { Link } from 'react-router-dom';
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
} from 'lucide-react';
import PageContainer from '../../components/layout/PageContainer';
import Button from '../../components/common/Button';
import Avatar from '../../components/common/Avatar';
import ApplicationStatusBadge from '../../components/applications/ApplicationStatusBadge';
import { getCandidatesList } from '../../data/mockCandidates';
import { getAllApplications } from '../../data/mockApplications';
import { mockOpportunities } from '../../data/mockOpportunities';

const AdminDashboardPage = () => {
  const candidates = useMemo(() => getCandidatesList(), []);
  const applications = useMemo(() => getAllApplications(), []);

  // Strict derivations from mock data (no invented numbers)
  const totalCandidateCount = candidates.length;

  // New registrations defined as registered on or after Oct 1, 2026
  const newRegistrationsCount = useMemo(() => {
    return candidates.filter((c) => {
      if (!c.registeredDate) return false;
      return new Date(c.registeredDate) >= new Date('2026-10-01');
    }).length;
  }, [candidates]);

  const totalApplicationsCount = applications.length;
  const underReviewApplicationsCount = useMemo(() => {
    return applications.filter((a) => a.status === 'under_review').length;
  }, [applications]);

  // Recently registered candidates (sorted by registeredDate desc)
  const recentCandidates = useMemo(() => {
    return [...candidates]
      .sort((a, b) => new Date(b.registeredDate || 0) - new Date(a.registeredDate || 0))
      .slice(0, 5);
  }, [candidates]);

  // Recent applications (sorted by appliedDate desc)
  const recentApplications = useMemo(() => {
    return [...applications]
      .sort((a, b) => new Date(b.appliedDate || 0) - new Date(a.appliedDate || 0))
      .slice(0, 5);
  }, [applications]);

  // Verification helper badge
  const renderVerificationBadge = (status) => {
    switch (status) {
      case 'verified':
        return (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[10px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
            <CheckCircle2 className="w-3 h-3 text-emerald-600" />
            <span>Verified</span>
          </span>
        );
      case 'pending_review':
        return (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[10px] font-bold bg-amber-50 text-amber-700 border border-amber-200">
            <Clock className="w-3 h-3 text-amber-600" />
            <span>Pending Review</span>
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[10px] font-bold bg-neutral-100 text-neutral-600 border border-neutral-200">
            <AlertCircle className="w-3 h-3 text-neutral-400" />
            <span>Unverified</span>
          </span>
        );
    }
  };

  return (
    <PageContainer maxWidth="7xl" className="space-y-6">
      {/* Header & Quick Actions */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-neutral-200/80">
        <div className="space-y-1 text-left">
          <div className="inline-flex items-center gap-2 px-2.5 py-0.5 rounded-md bg-neutral-100 text-brand-navy text-[11px] font-bold uppercase tracking-wider">
            <ShieldCheck className="w-3.5 h-3.5 text-brand-pink" />
            <span>Studio Admin Control Center</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold font-serif text-brand-navy tracking-tight">
            Admin Overview &amp; Talent Pipeline
          </h1>
          <p className="text-xs text-neutral-500">
            Real-time management for performers, casting requirements, and incoming auditions.
          </p>
        </div>

        {/* Quick Action Buttons */}
        <div className="flex flex-wrap items-center gap-2.5">
          <Link to="/admin/candidates">
            <Button variant="secondary" size="sm" className="space-x-1.5 text-xs font-bold">
              <Search className="w-3.5 h-3.5" />
              <span>Search Candidates</span>
            </Button>
          </Link>
          <Link to="/admin/opportunities/create">
            <Button size="sm" variant="primary" className="space-x-1.5 text-xs font-bold">
              <PlusCircle className="w-3.5 h-3.5" />
              <span>Post New Casting</span>
            </Button>
          </Link>
        </div>
      </div>

      {/* Derived Metric Cards (Strictly from mock data) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4 sm:gap-5 text-left">
        {/* Metric 1: Total Candidates */}
        <div className="bg-white p-5 sm:p-6 rounded-2xl border border-neutral-200/90 shadow-2xs flex items-center justify-between hover:border-brand-pink/30 hover:shadow-subtle transition-all">
          <div className="space-y-1">
            <p className="text-[11px] font-bold uppercase tracking-wider text-neutral-500">
              Total Candidates
            </p>
            <p className="text-3xl font-extrabold font-serif text-brand-navy">
              {totalCandidateCount}
            </p>
            <p className="text-[11px] text-neutral-400 font-medium">
              Registered performer profiles
            </p>
          </div>
          <div className="w-12 h-12 rounded-2xl bg-neutral-100 flex items-center justify-center text-brand-navy border border-neutral-200">
            <Users className="w-6 h-6" />
          </div>
        </div>

        {/* Metric 2: New Registrations */}
        <div className="bg-white p-5 sm:p-6 rounded-2xl border border-neutral-200/90 shadow-2xs flex items-center justify-between hover:border-brand-pink/30 hover:shadow-subtle transition-all">
          <div className="space-y-1">
            <p className="text-[11px] font-bold uppercase tracking-wider text-neutral-500">
              New Registrations
            </p>
            <p className="text-3xl font-extrabold font-serif text-brand-navy">
              {newRegistrationsCount}
            </p>
            <p className="text-[11px] text-emerald-600 font-semibold flex items-center gap-1">
              <span>●</span> Recent in past 14 days
            </p>
          </div>
          <div className="w-12 h-12 rounded-2xl bg-emerald-50 text-emerald-700 flex items-center justify-center border border-emerald-200">
            <Calendar className="w-6 h-6" />
          </div>
        </div>

        {/* Metric 3: Total Applications */}
        <div className="bg-white p-5 sm:p-6 rounded-2xl border border-neutral-200/90 shadow-2xs flex items-center justify-between hover:border-brand-pink/30 hover:shadow-subtle transition-all">
          <div className="space-y-1">
            <p className="text-[11px] font-bold uppercase tracking-wider text-neutral-500">
              Total Applications
            </p>
            <p className="text-3xl font-extrabold font-serif text-brand-navy">
              {totalApplicationsCount}
            </p>
            <p className="text-[11px] text-neutral-400 font-medium">
              Across {mockOpportunities.length} active castings
            </p>
          </div>
          <div className="w-12 h-12 rounded-2xl bg-sky-50 text-sky-700 flex items-center justify-center border border-sky-200">
            <FileCheck className="w-6 h-6" />
          </div>
        </div>

        {/* Metric 4: Applications Under Review */}
        <div className="bg-white p-5 sm:p-6 rounded-2xl border border-neutral-200/90 shadow-2xs flex items-center justify-between hover:border-brand-pink/30 hover:shadow-subtle transition-all">
          <div className="space-y-1">
            <p className="text-[11px] font-bold uppercase tracking-wider text-neutral-500">
              Under Review
            </p>
            <p className="text-3xl font-extrabold font-serif text-amber-600">
              {underReviewApplicationsCount}
            </p>
            <p className="text-[11px] text-amber-700 font-medium">
              Pending studio feedback
            </p>
          </div>
          <div className="w-12 h-12 rounded-2xl bg-amber-50 text-amber-700 flex items-center justify-center border border-amber-200">
            <Clock className="w-6 h-6" />
          </div>
        </div>
      </div>

      {/* Two Dense Admin Data Tables */}
      <div className="grid grid-cols-1 xl:grid-cols-12 gap-6 items-start">
        {/* Left Column: Recently Registered Candidates (7 Cols) */}
        <div className="xl:col-span-7 bg-white rounded-2xl border border-neutral-200/90 shadow-2xs overflow-hidden text-left">
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
              className="text-xs font-bold text-brand-pink hover:text-brand-pink-dark flex items-center gap-1 group"
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
                  <th className="py-3.5 px-3">Verification</th>
                  <th className="py-3.5 px-3">Profile</th>
                  <th className="py-3.5 px-4 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-neutral-100">
                {recentCandidates.map((candidate) => (
                  <tr key={candidate.id} className="hover:bg-neutral-50/70 transition-colors">
                    {/* Candidate Name & Avatar */}
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

                    {/* Location */}
                    <td className="py-3.5 px-3 text-neutral-700 whitespace-nowrap">
                      {candidate.location.split('/')[0].trim()}
                    </td>

                    {/* Experience */}
                    <td className="py-3.5 px-3 text-neutral-600 whitespace-nowrap font-medium">
                      {candidate.yearsOfExperience} yrs
                    </td>

                    {/* Status */}
                    <td className="py-3.5 px-3 whitespace-nowrap">
                      {renderVerificationBadge(candidate.verificationStatus)}
                    </td>

                    {/* Completion % */}
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

                    {/* Action */}
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

        {/* Right Column: Recent Applications & Pipeline (5 Cols) */}
        <div className="xl:col-span-5 bg-white rounded-2xl border border-neutral-200/90 shadow-2xs overflow-hidden text-left">
          <div className="p-5 border-b border-neutral-200 flex items-center justify-between">
            <div className="space-y-0.5">
              <h2 className="text-base font-bold font-serif text-brand-navy">
                Recent Applications
              </h2>
              <p className="text-xs text-neutral-500">
                Auditions submitted for active casting calls.
              </p>
            </div>
            <Link
              to="/admin/applications"
              className="text-xs font-bold text-brand-pink hover:text-brand-pink-dark flex items-center gap-1 group"
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

          <div className="p-3.5 bg-neutral-50 border-t border-neutral-200 text-center">
            <Link
              to="/admin/candidates"
              className="text-xs font-bold text-brand-pink hover:underline inline-flex items-center gap-1"
            >
              <span>Explore All Candidate Audition Portfolios</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>
        </div>
      </div>
    </PageContainer>
  );
};

export default AdminDashboardPage;
