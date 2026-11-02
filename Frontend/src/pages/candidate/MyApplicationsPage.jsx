import React, { useState, useEffect, useMemo } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import {
  Sparkles,
  Calendar,
  Award,
  ShieldCheck,
  Filter,
  Building2,
  Briefcase,
  Search,
  MapPin,
  Banknote,
  Clock,
  ArrowRight,
  CheckCircle2,
  Eye,
  FileCheck,
  X,
  ChevronRight,
  Layers,
  Trophy,
  AlertCircle,
  RotateCcw,
} from 'lucide-react';
import PageContainer from '../../components/layout/PageContainer';
import ApplicationCard from '../../components/applications/ApplicationCard';
import EmptyState from '../../components/common/EmptyState';
import { getAllApplications } from '../../data/mockApplications';
import { mockOpportunities } from '../../data/mockOpportunities';
import { rankingService } from '../../services/rankingService';
import { applicationService } from '../../services/applicationService';
import { castingService } from '../../services/castingService';
import { useAuth } from '../../context/AuthContext';
import { formatDate } from '../../utils/formatters';

const STATUS_TABS = [
  { id: 'all', label: 'All Applications' },
  { id: 'submitted', label: 'Submitted' },
  { id: 'under_review', label: 'Under Review' },
  { id: 'shortlisted', label: 'Shortlisted' },
  { id: 'audition_requested', label: 'Audition Requested' },
  { id: 'selected', label: 'Selected' },
  { id: 'rejected', label: 'Rejected' },
  { id: 'withdrawn', label: 'Withdrawn' },
];

const JOB_CATEGORIES = [
  { id: 'all', label: 'All Categories' },
  { id: 'web-series', label: 'Web Series' },
  { id: 'films', label: 'Films' },
  { id: 'advertisements', label: 'Advertisements' },
  { id: 'music-videos', label: 'Music Videos' },
  { id: 'theatre', label: 'Theatre' },
  { id: 'modeling', label: 'Modeling' },
];

const MyApplicationsPage = () => {
  const { user } = useAuth();
  const [searchParams, setSearchParams] = useSearchParams();

  // Active top-level tab: 'jobs' vs 'applications'
  const initialTab = searchParams.get('tab') === 'applications' ? 'applications' : 'jobs';
  const [activeTab, setActiveTab] = useState(initialTab);

  // Status & search states
  const initialStatus = searchParams.get('status') || 'all';
  const [selectedStatus, setSelectedStatus] = useState(initialStatus);
  const [selectedJobCategory, setSelectedJobCategory] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [appSearchQuery, setAppSearchQuery] = useState('');
  const [selectedCompanyFilter, setSelectedCompanyFilter] = useState('all');
  const [selectedLocationFilter, setSelectedLocationFilter] = useState('all');

  // Data states
  const [applications, setApplications] = useState([]);
  const [opportunities, setOpportunities] = useState(() => mockOpportunities);
  const [isLoading, setIsLoading] = useState(true);

  // Sync tab & status with URL query params
  useEffect(() => {
    const tabParam = searchParams.get('tab');
    if (tabParam === 'applications' && activeTab !== 'applications') {
      setActiveTab('applications');
    } else if (tabParam === 'jobs' && activeTab !== 'jobs') {
      setActiveTab('jobs');
    }

    const statusParam = searchParams.get('status');
    if (statusParam && statusParam !== selectedStatus) {
      setSelectedStatus(statusParam);
    }
  }, [searchParams]);

  // Handle switching top-level tabs
  const handleTabChange = (tabId) => {
    setActiveTab(tabId);
    if (tabId === 'applications') {
      setSearchParams(selectedStatus !== 'all' ? { tab: 'applications', status: selectedStatus } : { tab: 'applications' });
    } else {
      setSearchParams({});
    }
  };

  // Handle selecting an application status filter
  const handleStatusChange = (statusId) => {
    setSelectedStatus(statusId);
    if (activeTab === 'applications') {
      setSearchParams(statusId !== 'all' ? { tab: 'applications', status: statusId } : { tab: 'applications' });
    }
  };

  // Fetch candidate applications & company opportunities
  const loadData = () => {
    const candidateId = user?.id || 'cand-aanya';

    // 1. Fetch Candidate Applications
    applicationService
      .getByCandidate(candidateId)
      .then((res) => {
        if (res && res.length > 0) {
          setApplications(res);
          return;
        }
        return rankingService.getTalentApplications(candidateId);
      })
      .then((rankApps) => {
        if (rankApps && rankApps.length > 0) {
          setApplications(rankApps);
        } else {
          const all = getAllApplications();
          const candidateApps = all.filter((a) => a.candidateId === candidateId || a.candidate_id === candidateId);
          setApplications(candidateApps.length > 0 ? candidateApps : all);
        }
      })
      .catch(() => {
        const all = getAllApplications();
        const candidateApps = all.filter((a) => a.candidateId === candidateId || a.candidate_id === candidateId);
        setApplications(candidateApps.length > 0 ? candidateApps : all);
      });

    // 2. Fetch Live Company Jobs & Opportunities
    castingService
      .getPublicOpportunities()
      .then((data) => {
        if (Array.isArray(data) && data.length > 0) {
          setOpportunities(data);
        } else {
          setOpportunities(mockOpportunities);
        }
      })
      .catch(() => {
        setOpportunities(mockOpportunities);
      })
      .finally(() => {
        setIsLoading(false);
      });
  };

  useEffect(() => {
    loadData();

    // Listen for real-time application events (such as withdrawals or new submissions)
    const handleUpdate = () => loadData();
    window.addEventListener('storage', handleUpdate);
    window.addEventListener('starcast_applications_updated', handleUpdate);

    return () => {
      window.removeEventListener('storage', handleUpdate);
      window.removeEventListener('starcast_applications_updated', handleUpdate);
    };
  }, [user]);

  // Lookup map: opportunityId -> application (to show applied status on company jobs)
  const appliedOpportunitiesMap = useMemo(() => {
    const map = new Map();
    applications.forEach((app) => {
      if (app.opportunityId) map.set(app.opportunityId, app);
      if (app.opportunityTitle) map.set(app.opportunityTitle.toLowerCase().trim(), app);
    });
    return map;
  }, [applications]);

  // Derived application counts
  const appCounts = useMemo(() => {
    const total = applications.length;
    const underReview = applications.filter((a) => (a.status || '').toLowerCase() === 'under_review').length;
    const shortlisted = applications.filter((a) => (a.status || '').toLowerCase() === 'shortlisted').length;
    const auditionRequested = applications.filter(
      (a) => (a.status || '').toLowerCase() === 'audition_requested' || (a.status || '').toLowerCase() === 'interview'
    ).length;
    const selected = applications.filter(
      (a) => (a.status || '').toLowerCase() === 'selected' || (a.status || '').toLowerCase() === 'accepted'
    ).length;

    return { total, underReview, shortlisted, auditionRequested, selected };
  }, [applications]);

  // Unique companies list for filtering
  const companyOptions = useMemo(() => {
    const set = new Set();
    opportunities.forEach((o) => {
      if (o.productionCompany) set.add(o.productionCompany);
      else if (o.company) set.add(o.company);
    });
    return Array.from(set).sort();
  }, [opportunities]);

  // Unique locations list for filtering
  const locationOptions = useMemo(() => {
    const set = new Set();
    opportunities.forEach((o) => {
      if (o.location) {
        const city = o.location.split(',')[0].trim();
        set.add(city);
      }
    });
    return Array.from(set).sort();
  }, [opportunities]);

  // Filtered Company Jobs
  const filteredCompanyJobs = useMemo(() => {
    return opportunities.filter((job) => {
      if (selectedJobCategory !== 'all') {
        const catKey = (job.categoryKey || job.category || '').toLowerCase().replace(/\s+/g, '-');
        if (!catKey.includes(selectedJobCategory)) return false;
      }

      if (selectedCompanyFilter !== 'all') {
        const comp = job.productionCompany || job.company || '';
        if (comp !== selectedCompanyFilter) return false;
      }

      if (selectedLocationFilter !== 'all') {
        const loc = job.location || '';
        if (!loc.toLowerCase().includes(selectedLocationFilter.toLowerCase())) return false;
      }

      if (searchQuery.trim()) {
        const query = searchQuery.toLowerCase().trim();
        const title = (job.title || '').toLowerCase();
        const company = (job.productionCompany || job.company || '').toLowerCase();
        const desc = (job.description || '').toLowerCase();
        const role = (job.roleDescription || '').toLowerCase();
        const loc = (job.location || '').toLowerCase();
        const tags = (job.tags || []).join(' ').toLowerCase();

        return (
          title.includes(query) ||
          company.includes(query) ||
          desc.includes(query) ||
          role.includes(query) ||
          loc.includes(query) ||
          tags.includes(query)
        );
      }

      return true;
    });
  }, [opportunities, selectedJobCategory, selectedCompanyFilter, selectedLocationFilter, searchQuery]);

  // Filtered Applications with search support
  const filteredApplications = useMemo(() => {
    return applications.filter((a) => {
      const s = (a.status || '').toLowerCase();

      // 1. Status Filter
      if (selectedStatus !== 'all') {
        if (selectedStatus === 'submitted' && !(s === 'submitted' || s === 'applied')) return false;
        if (selectedStatus === 'audition_requested' && !(s === 'audition_requested' || s === 'interview')) return false;
        if (selectedStatus === 'selected' && !(s === 'selected' || s === 'accepted')) return false;
        if (selectedStatus === 'rejected' && !(s === 'rejected' || s === 'not_selected')) return false;
        if (
          !['submitted', 'audition_requested', 'selected', 'rejected'].includes(selectedStatus) &&
          s !== selectedStatus
        ) {
          return false;
        }
      }

      // 2. Search Filter
      if (appSearchQuery.trim()) {
        const query = appSearchQuery.toLowerCase().trim();
        const title = (a.opportunityTitle || '').toLowerCase();
        const comp = (a.productionCompany || '').toLowerCase();
        const role = (a.roleAppliedFor || '').toLowerCase();
        const note = (a.notes || '').toLowerCase();

        return title.includes(query) || comp.includes(query) || role.includes(query) || note.includes(query);
      }

      return true;
    });
  }, [applications, selectedStatus, appSearchQuery]);

  return (
    <PageContainer className="space-y-6 text-left pb-16">
      {/* 1. Header Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-gray-100">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-bold font-serif text-brand-navy">
              {activeTab === 'jobs' ? 'Jobs / Applications' : 'My Applications'}
            </h1>
            <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-pink-100 text-brand-pink uppercase tracking-wide">
              {activeTab === 'jobs' ? `${opportunities.length} Active Jobs` : `${applications.length} Submitted`}
            </span>
          </div>
          <p className="text-xs text-gray-500 mt-1">
            {activeTab === 'jobs'
              ? 'Browse verified production companies, open casting calls, and audition roles. Apply directly with your candidate portfolio.'
              : 'Track current status of your submitted auditions, matched role requirements, callback invitations, and withdrawal status.'}
          </p>
        </div>

        <div className="flex items-center gap-2 self-start sm:self-center">
          <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-neutral-100 text-[11px] text-neutral-600 font-medium">
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
            <span>Verified Production Studios</span>
          </div>
        </div>
      </div>

      {/* 2. Top-Level Switcher Tabs: [Jobs / Openings] vs [My Applications] */}
      <div className="flex items-center gap-2 border-b border-slate-200 pb-3">
        <button
          type="button"
          onClick={() => handleTabChange('jobs')}
          className={`flex items-center gap-2 px-5 py-2.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
            activeTab === 'jobs'
              ? 'bg-brand-pink text-white shadow-3d-button-pink shadow-xs'
              : 'bg-white text-slate-600 hover:text-slate-900 hover:bg-slate-50 border border-slate-200'
          }`}
        >
          <Building2 className="w-4 h-4" />
          <span>Jobs / Openings</span>
          <span
            className={`px-2 py-0.5 rounded-full text-[10px] font-semibold ${
              activeTab === 'jobs' ? 'bg-white/20 text-white' : 'bg-slate-100 text-slate-600'
            }`}
          >
            {opportunities.length}
          </span>
        </button>

        <button
          type="button"
          onClick={() => handleTabChange('applications')}
          className={`flex items-center gap-2 px-5 py-2.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
            activeTab === 'applications'
              ? 'bg-brand-pink text-white shadow-3d-button-pink shadow-xs'
              : 'bg-white text-slate-600 hover:text-slate-900 hover:bg-slate-50 border border-slate-200'
          }`}
        >
          <FileCheck className="w-4 h-4" />
          <span>My Applications</span>
          <span
            className={`px-2 py-0.5 rounded-full text-[10px] font-semibold ${
              activeTab === 'applications' ? 'bg-white/20 text-white' : 'bg-slate-100 text-slate-600'
            }`}
          >
            {applications.length}
          </span>
        </button>
      </div>

      {/* ================= VIEW 1: JOBS / OPENINGS ================= */}
      {activeTab === 'jobs' && (
        <div className="space-y-6 animate-in fade-in duration-200">
          {/* Search & Dropdown Filters Bar */}
          <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-2xs space-y-3">
            <div className="flex flex-col sm:flex-row items-center gap-3">
              {/* Search input */}
              <div className="relative flex-1 w-full">
                <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search by company name, job role, production title, location..."
                  className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 text-xs font-medium text-slate-900 focus:outline-none focus:border-brand-pink focus:ring-2 focus:ring-pink-100 transition-all bg-white"
                />
                {searchQuery && (
                  <button
                    onClick={() => setSearchQuery('')}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 p-1"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>

              {/* Company Filter Dropdown */}
              <div className="w-full sm:w-56 shrink-0">
                <select
                  value={selectedCompanyFilter}
                  onChange={(e) => setSelectedCompanyFilter(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs font-medium text-slate-700 bg-white focus:outline-none focus:border-brand-pink focus:ring-2 focus:ring-pink-100 cursor-pointer"
                >
                  <option value="all">All Production Companies</option>
                  {companyOptions.map((c) => (
                    <option key={c} value={c}>
                      {c}
                    </option>
                  ))}
                </select>
              </div>

              {/* Location Filter Dropdown */}
              <div className="w-full sm:w-48 shrink-0">
                <select
                  value={selectedLocationFilter}
                  onChange={(e) => setSelectedLocationFilter(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs font-medium text-slate-700 bg-white focus:outline-none focus:border-brand-pink focus:ring-2 focus:ring-pink-100 cursor-pointer"
                >
                  <option value="all">All Locations</option>
                  {locationOptions.map((loc) => (
                    <option key={loc} value={loc}>
                      {loc}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Category Filter Pills */}
            <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none pt-1 border-t border-slate-100">
              <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider mr-1 shrink-0 flex items-center gap-1">
                <Filter className="w-3 h-3" /> Filter:
              </span>
              {JOB_CATEGORIES.map((cat) => {
                const count =
                  cat.id === 'all'
                    ? opportunities.length
                    : opportunities.filter((o) =>
                        (o.categoryKey || o.category || '').toLowerCase().includes(cat.id)
                      ).length;

                return (
                  <button
                    key={cat.id}
                    type="button"
                    onClick={() => setSelectedJobCategory(cat.id)}
                    className={`px-3 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-all cursor-pointer flex items-center gap-1.5 ${
                      selectedJobCategory === cat.id
                        ? 'bg-slate-900 text-white shadow-2xs'
                        : 'bg-slate-50 text-slate-600 hover:bg-slate-100 border border-slate-200/60'
                    }`}
                  >
                    <span>{cat.label}</span>
                    <span
                      className={`px-1.5 py-0.2 rounded-full text-[10px] ${
                        selectedJobCategory === cat.id ? 'bg-white/20 text-white' : 'bg-white text-slate-500'
                      }`}
                    >
                      {count}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Job Listings List */}
          {isLoading ? (
            <div className="space-y-4">
              {[1, 2, 3].map((i) => (
                <div key={i} className="h-36 bg-gray-100 rounded-3xl animate-pulse" />
              ))}
            </div>
          ) : filteredCompanyJobs.length === 0 ? (
            <EmptyState
              title="No company jobs found"
              description="Try adjusting your search terms or clearing your filters to discover open casting vacancies."
              actionText="Reset All Filters"
              onAction={() => {
                setSearchQuery('');
                setSelectedJobCategory('all');
                setSelectedCompanyFilter('all');
                setSelectedLocationFilter('all');
              }}
            />
          ) : (
            <div className="space-y-4">
              {filteredCompanyJobs.map((job) => {
                const companyName = job.productionCompany || job.company || 'Production Studio';
                const companyLogoInitial = (companyName.trim()[0] || 'S').toUpperCase();
                const appliedApp =
                  appliedOpportunitiesMap.get(job.id) ||
                  appliedOpportunitiesMap.get((job.title || '').toLowerCase().trim());

                return (
                  <div
                    key={job.id}
                    className="bg-white rounded-3xl border border-slate-200/90 p-5 sm:p-6 shadow-3d-card hover:shadow-3d-card-hover hover:-translate-y-0.5 transition-all duration-300"
                  >
                    {/* Header Row: Company Info & Badges */}
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-100">
                      <div className="flex items-center gap-3 min-w-0">
                        {/* Company Logo Badge */}
                        <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-slate-900 to-slate-800 text-white font-bold text-sm flex items-center justify-center shrink-0 shadow-2xs">
                          {companyLogoInitial}
                        </div>

                        <div className="min-w-0">
                          <div className="flex items-center gap-2 flex-wrap">
                            <span className="text-xs font-bold text-brand-navy truncate">
                              {companyName}
                            </span>
                            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200/70">
                              <ShieldCheck className="w-3 h-3 text-emerald-600" />
                              <span>Verified Studio</span>
                            </span>
                            {appliedApp && (
                              <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-pink-50 text-brand-pink border border-pink-200">
                                <CheckCircle2 className="w-3 h-3 text-brand-pink" />
                                <span>Applied • {appliedApp.status || 'Under Review'}</span>
                              </span>
                            )}
                          </div>
                          <div className="flex items-center gap-3 mt-0.5 text-[11px] text-slate-500">
                            {job.location && (
                              <span className="flex items-center gap-1">
                                <MapPin className="w-3 h-3 text-slate-400" />
                                {job.location}
                              </span>
                            )}
                            {job.postedTime && (
                              <span className="flex items-center gap-1">
                                <Clock className="w-3 h-3 text-slate-400" />
                                {job.postedTime}
                              </span>
                            )}
                          </div>
                        </div>
                      </div>

                      {/* Category Badge & Compensation */}
                      <div className="flex items-center gap-2 self-start sm:self-center shrink-0">
                        <span className="px-3 py-1 rounded-xl text-xs font-bold bg-slate-100 text-slate-700 border border-slate-200/60">
                          {job.category || 'Casting Call'}
                        </span>
                        {job.compensation && (
                          <span className="px-3 py-1 rounded-xl text-xs font-bold bg-emerald-50 text-emerald-800 border border-emerald-200/80 flex items-center gap-1">
                            <Banknote className="w-3.5 h-3.5 text-emerald-600" />
                            {job.compensation}
                          </span>
                        )}
                      </div>
                    </div>

                    {/* Middle: Job Title & Role Details */}
                    <div className="py-4 space-y-2">
                      <div className="flex flex-col sm:flex-row sm:items-baseline justify-between gap-2">
                        <Link
                          to={`/candidate/casting-calls/${job.id}`}
                          className="text-lg sm:text-xl font-bold font-serif text-brand-navy hover:text-brand-pink transition-colors tracking-tight"
                        >
                          {job.title}
                        </Link>
                        {job.deadline && (
                          <span className="text-[11px] font-semibold text-slate-500 flex items-center gap-1 shrink-0">
                            <Calendar className="w-3.5 h-3.5 text-slate-400" />
                            Deadline: {job.deadline}
                          </span>
                        )}
                      </div>

                      {job.roleDescription && (
                        <p className="text-xs text-slate-600 line-clamp-2 leading-relaxed">
                          <strong className="text-slate-900 font-semibold">Role Synopsis:</strong> {job.roleDescription}
                        </p>
                      )}

                      {/* Specs Row: Age Range, Experience, Shoot Info */}
                      <div className="flex flex-wrap items-center gap-2 pt-1 text-xs text-slate-600">
                        {job.ageRange && (
                          <span className="px-2.5 py-1 rounded-lg bg-slate-50 border border-slate-200/60 text-[11px] font-medium">
                            Playing Age: <strong className="text-slate-800">{job.ageRange}</strong>
                          </span>
                        )}
                        {job.experience && (
                          <span className="px-2.5 py-1 rounded-lg bg-slate-50 border border-slate-200/60 text-[11px] font-medium">
                            Experience: <strong className="text-slate-800">{job.experience}</strong>
                          </span>
                        )}
                        {job.languages && (
                          <span className="px-2.5 py-1 rounded-lg bg-slate-50 border border-slate-200/60 text-[11px] font-medium">
                            Languages: <strong className="text-slate-800">{job.languages}</strong>
                          </span>
                        )}
                      </div>
                    </div>

                    {/* Footer Row: Tags & Actions */}
                    <div className="pt-3 border-t border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                      <div className="flex flex-wrap items-center gap-1.5">
                        {(job.tags || []).slice(0, 3).map((tag, idx) => (
                          <span
                            key={idx}
                            className="px-2 py-0.5 rounded-md bg-slate-50 text-[10px] font-medium text-slate-500 border border-slate-200/50"
                          >
                            #{tag}
                          </span>
                        ))}
                      </div>

                      <div className="flex items-center gap-2.5 self-end sm:self-center">
                        <Link
                          to={`/candidate/casting-calls/${job.id}`}
                          className="px-4 py-2 rounded-xl text-xs font-bold text-slate-700 hover:text-slate-900 bg-slate-50 hover:bg-slate-100 border border-slate-200 transition-colors shadow-2xs"
                        >
                          View Details
                        </Link>

                        {appliedApp ? (
                          <Link
                            to={`/candidate/applications/${appliedApp.id}`}
                            className="px-4 py-2 rounded-xl text-xs font-bold text-brand-pink hover:text-white bg-pink-50 hover:bg-brand-pink border border-pink-200 transition-all flex items-center gap-1.5 shadow-2xs"
                          >
                            <FileCheck className="w-3.5 h-3.5" />
                            <span>View My Application</span>
                          </Link>
                        ) : (
                          <Link
                            to={`/candidate/casting-calls/${job.id}?apply=true`}
                            className="px-5 py-2 rounded-xl text-xs font-bold text-white bg-gradient-to-r from-[#FA5A36] to-[#FB6947] hover:brightness-105 active:scale-95 transition-all flex items-center gap-1.5 shadow-xs"
                          >
                            <span>Apply Now</span>
                            <ArrowRight className="w-3.5 h-3.5" />
                          </Link>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* ================= VIEW 2: MY APPLICATIONS ================= */}
      {activeTab === 'applications' && (
        <div className="space-y-6 animate-in fade-in duration-200">
          {/* Quick Metrics Bar for Applications */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4">
            <button
              type="button"
              onClick={() => handleStatusChange('all')}
              className={`p-4 rounded-2xl border text-left transition-all cursor-pointer ${
                selectedStatus === 'all'
                  ? 'bg-brand-navy text-white border-brand-navy shadow-md'
                  : 'bg-white border-slate-200 hover:border-slate-300 text-slate-700'
              }`}
            >
              <div className="flex items-center justify-between mb-1">
                <span className="text-[11px] font-bold uppercase tracking-wider opacity-75">
                  Total Submissions
                </span>
                <FileCheck className="w-4 h-4" />
              </div>
              <p className="text-2xl font-bold font-serif">{appCounts.total}</p>
            </button>

            <button
              type="button"
              onClick={() => handleStatusChange('under_review')}
              className={`p-4 rounded-2xl border text-left transition-all cursor-pointer ${
                selectedStatus === 'under_review'
                  ? 'bg-sky-700 text-white border-sky-700 shadow-md'
                  : 'bg-white border-slate-200 hover:border-sky-300 text-slate-700'
              }`}
            >
              <div className="flex items-center justify-between mb-1">
                <span className="text-[11px] font-bold uppercase tracking-wider opacity-75">
                  In Review
                </span>
                <Clock className="w-4 h-4 text-sky-500" />
              </div>
              <p className="text-2xl font-bold font-serif">{appCounts.underReview}</p>
            </button>

            <button
              type="button"
              onClick={() => handleStatusChange('shortlisted')}
              className={`p-4 rounded-2xl border text-left transition-all cursor-pointer ${
                selectedStatus === 'shortlisted'
                  ? 'bg-amber-600 text-white border-amber-600 shadow-md'
                  : 'bg-white border-slate-200 hover:border-amber-300 text-slate-700'
              }`}
            >
              <div className="flex items-center justify-between mb-1">
                <span className="text-[11px] font-bold uppercase tracking-wider opacity-75">
                  Shortlisted
                </span>
                <Trophy className="w-4 h-4 text-amber-500" />
              </div>
              <p className="text-2xl font-bold font-serif">{appCounts.shortlisted}</p>
            </button>

            <button
              type="button"
              onClick={() => handleStatusChange('audition_requested')}
              className={`p-4 rounded-2xl border text-left transition-all cursor-pointer ${
                selectedStatus === 'audition_requested'
                  ? 'bg-brand-pink text-white border-brand-pink shadow-md'
                  : 'bg-white border-slate-200 hover:border-pink-300 text-slate-700'
              }`}
            >
              <div className="flex items-center justify-between mb-1">
                <span className="text-[11px] font-bold uppercase tracking-wider opacity-75">
                  Auditions
                </span>
                <Sparkles className="w-4 h-4 text-pink-500" />
              </div>
              <p className="text-2xl font-bold font-serif">{appCounts.auditionRequested}</p>
            </button>
          </div>

          {/* Search & Filter Bar for Applications */}
          <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-2xs space-y-3">
            {/* Search input */}
            <div className="relative w-full">
              <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
              <input
                type="text"
                value={appSearchQuery}
                onChange={(e) => setAppSearchQuery(e.target.value)}
                placeholder="Search your applications by role, production company, or notes..."
                className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 text-xs font-medium text-slate-900 focus:outline-none focus:border-brand-pink focus:ring-2 focus:ring-pink-100 transition-all bg-white"
              />
              {appSearchQuery && (
                <button
                  onClick={() => setAppSearchQuery('')}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 p-1"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              )}
            </div>

            {/* Filter Tabs for Application Statuses */}
            <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none pt-1 border-t border-slate-100">
              <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider mr-1 shrink-0 flex items-center gap-1">
                <Filter className="w-3 h-3" /> Status:
              </span>
              {STATUS_TABS.map((tab) => {
                const count =
                  tab.id === 'all'
                    ? applications.length
                    : applications.filter((a) => {
                        const s = (a.status || '').toLowerCase();
                        if (tab.id === 'submitted') return s === 'submitted' || s === 'applied';
                        if (tab.id === 'audition_requested') return s === 'audition_requested' || s === 'interview';
                        if (tab.id === 'selected') return s === 'selected' || s === 'accepted';
                        if (tab.id === 'rejected') return s === 'rejected' || s === 'not_selected';
                        return s === tab.id;
                      }).length;

                return (
                  <button
                    key={tab.id}
                    type="button"
                    onClick={() => handleStatusChange(tab.id)}
                    className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-all cursor-pointer flex items-center gap-1.5 shadow-2xs ${
                      selectedStatus === tab.id
                        ? 'bg-brand-pink text-white shadow-3d-button-pink'
                        : 'bg-white border border-slate-200/80 text-slate-600 hover:bg-slate-50 hover:border-slate-300'
                    }`}
                  >
                    <span>{tab.label}</span>
                    <span
                      className={`px-1.5 py-0.2 rounded-full text-[10px] ${
                        selectedStatus === tab.id ? 'bg-white/20 text-white' : 'bg-slate-100 text-slate-500'
                      }`}
                    >
                      {count}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>

          {isLoading ? (
            <div className="space-y-3">
              {[1, 2, 3].map((i) => (
                <div key={i} className="h-28 bg-gray-100 rounded-2xl animate-pulse" />
              ))}
            </div>
          ) : filteredApplications.length === 0 ? (
            <EmptyState
              title={`No ${selectedStatus === 'all' ? '' : selectedStatus.replace('_', ' ')} applications`}
              description={
                selectedStatus === 'all'
                  ? 'Browse open company jobs to submit your first audition application.'
                  : `You have no applications matching the status "${selectedStatus.replace('_', ' ')}"${appSearchQuery ? ` and query "${appSearchQuery}"` : ''}.`
              }
              actionText={selectedStatus !== 'all' || appSearchQuery ? 'View All Applications' : 'Explore Open Jobs'}
              onAction={() => {
                if (selectedStatus !== 'all' || appSearchQuery) {
                  setSelectedStatus('all');
                  setAppSearchQuery('');
                } else {
                  handleTabChange('jobs');
                }
              }}
            />
          ) : (
            <div className="space-y-4">
              {filteredApplications.map((app) => (
                <ApplicationCard key={app.id} application={app} />
              ))}
            </div>
          )}
        </div>
      )}
    </PageContainer>
  );
};

export default MyApplicationsPage;
