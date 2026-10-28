import React, { useState, useEffect, useMemo } from 'react';
import { useParams, useSearchParams, Link } from 'react-router-dom';
import {
  Sparkles,
  Search,
  Filter,
  ArrowUpDown,
  RotateCcw,
  Star,
  Users,
  Calendar,
  CheckCircle2,
  XCircle,
  HelpCircle,
  Eye,
  ChevronLeft,
  ChevronRight,
  ShieldCheck,
  Building,
  Briefcase,
  Layers,
  ArrowLeft,
  RefreshCw,
} from 'lucide-react';

import PageContainer from '../../components/layout/PageContainer';
import BackButton from '../../components/common/BackButton';
import Button from '../../components/common/Button';
import CandidateCard from '../../components/ranking/CandidateCard';
import ScoreBreakdownModal from '../../components/ranking/ScoreBreakdownModal';
import CandidateComparisonModal from '../../components/ranking/CandidateComparisonModal';
import BulkShortlistModal from '../../components/ranking/BulkShortlistModal';
import ScoringCriteriaModal from '../../components/ranking/ScoringCriteriaModal';
import PortfolioModal from '../../components/ranking/PortfolioModal';
import AuditionInviteModal from '../../components/ranking/AuditionInviteModal';
import Modal from '../../components/common/Modal';
import CandidateAccessLock from '../../components/common/CandidateAccessLock';
import { hasCompletedPostingPayment, EVENT_PAYMENT_STATE_CHANGED } from '../../utils/paymentAccess';

import { rankingService } from '../../services/rankingService';
import { mockOpportunities } from '../../data/mockOpportunities';

const TALENT_CATEGORIES = ['All', 'Actor', 'Model', 'Voiceover', 'Theatre', 'Singer', 'Dancer'];

const RankedCandidatesPage = () => {
  const { id: routeOppId } = useParams();
  const [searchParams, setSearchParams] = useSearchParams();

  // Selected Opportunity
  const opportunityId = routeOppId || searchParams.get('opp') || 'opp-1';

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

  // State
  const [opportunity, setOpportunity] = useState(null);
  const [applications, setApplications] = useState([]);
  const [totalCount, setTotalCount] = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const [currentPage, setCurrentPage] = useState(1);
  const [isLoading, setIsLoading] = useState(true);
  const [toastMessage, setToastMessage] = useState('');

  // Filters & Sorting
  const [search, setSearch] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [selectedSkill, setSelectedSkill] = useState('all');
  const [selectedLanguage, setSelectedLanguage] = useState('all');
  const [selectedLocation, setSelectedLocation] = useState('all');
  const [selectedAvailability, setSelectedAvailability] = useState('all');
  const [selectedStatus, setSelectedStatus] = useState('all');
  const [sortBy, setSortBy] = useState('match_score'); // 'match_score' | 'latest_application' | 'experience'
  const [showAdvancedFilters, setShowAdvancedFilters] = useState(false);

  const STATUS_TABS = [
    { value: 'all', label: 'All Applicants' },
    { value: 'shortlisted', label: 'Shortlisted' },
    { value: 'under_review', label: 'Under Review' },
    { value: 'selected', label: 'Selected' },
    { value: 'audition_requested', label: 'Audition Requested' },
  ];

  const activeAdvancedCount = [
    selectedCategory !== 'all',
    selectedSkill !== 'all',
    selectedLanguage !== 'all',
    selectedLocation !== 'all',
    selectedAvailability !== 'all',
  ].filter(Boolean).length;

  // Selection for bulk actions and comparison
  const [selectedAppIds, setSelectedAppIds] = useState([]);

  // Modals
  const [breakdownApp, setBreakdownApp] = useState(null);
  const [isBreakdownOpen, setIsBreakdownOpen] = useState(false);
  const [portfolioApp, setPortfolioApp] = useState(null);
  const [isPortfolioOpen, setIsPortfolioOpen] = useState(false);
  const [auditionApp, setAuditionApp] = useState(null);
  const [isAuditionOpen, setIsAuditionOpen] = useState(false);
  const [isCompareOpen, setIsCompareOpen] = useState(false);
  const [isBulkShortlistOpen, setIsBulkShortlistOpen] = useState(false);
  const [isCriteriaInfoOpen, setIsCriteriaInfoOpen] = useState(false);

  // Single reject modal
  const [rejectApp, setRejectApp] = useState(null);
  const [rejectReason, setRejectReason] = useState('Role requirements filled by another applicant.');
  const [isRejectOpen, setIsRejectOpen] = useState(false);

  const showToast = (msg) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(''), 3500);
  };

  // Fetch Ranked Candidates
  const loadRankedCandidates = async (page = 1) => {
    setIsLoading(true);
    try {
      const data = await rankingService.getRankedCandidates(opportunityId, {
        search,
        category: selectedCategory,
        skill: selectedSkill,
        language: selectedLanguage,
        location: selectedLocation,
        availability: selectedAvailability,
        status: selectedStatus,
        sortBy,
        page,
        pageSize: 10,
      });

      if (data) {
        setOpportunity(data.opportunity);
        setApplications(data.applications);
        setTotalCount(data.count || data.applications.length);
        setTotalPages(data.totalPages || 1);
        setCurrentPage(page);
      }
    } catch (err) {
      console.error('Error fetching ranked candidates:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadRankedCandidates(1);
  }, [
    opportunityId,
    search,
    selectedCategory,
    selectedSkill,
    selectedLanguage,
    selectedLocation,
    selectedAvailability,
    selectedStatus,
    sortBy,
  ]);

  // Toggle single candidate selection
  const handleToggleSelect = (id) => {
    setSelectedAppIds((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
    );
  };

  // Select all on current page
  const handleSelectAll = () => {
    if (selectedAppIds.length === applications.length) {
      setSelectedAppIds([]);
    } else {
      setSelectedAppIds(applications.map((a) => a.id));
    }
  };

  // Shortlist action
  const handleShortlist = async (appId, action) => {
    const res = await rankingService.shortlistCandidate(appId, action);
    showToast(res.message);
    loadRankedCandidates(currentPage);
  };

  // Audition Invitation action
  const handleConfirmAudition = async (auditionData) => {
    if (!auditionApp) return;
    const res = await rankingService.inviteAudition(auditionApp.id, auditionData);
    showToast(res.message);
    loadRankedCandidates(currentPage);
  };

  // Reject action
  const handleConfirmReject = async () => {
    if (!rejectApp) return;
    const res = await rankingService.rejectApplication(rejectApp.id, rejectReason);
    showToast(res.message);
    setIsRejectOpen(false);
    setRejectApp(null);
    loadRankedCandidates(currentPage);
  };

  // Bulk Shortlist action
  const handleConfirmBulkShortlist = async (appIds, notes) => {
    const res = await rankingService.bulkShortlist(appIds, notes);
    showToast(res.message);
    setSelectedAppIds([]);
    loadRankedCandidates(currentPage);
  };

  // Recalculate Score action
  const handleRecalculateScore = async (appId) => {
    const res = await rankingService.recalculateScore(appId);
    showToast('Score successfully recalculated!');
    loadRankedCandidates(currentPage);
    // Update breakdown modal if currently open
    if (breakdownApp && breakdownApp.id === appId && res?.application) {
      setBreakdownApp(res.application);
    }
  };

  const selectedApplicationsList = useMemo(() => {
    return applications.filter((a) => selectedAppIds.includes(a.id));
  }, [applications, selectedAppIds]);

  const isFiltering =
    search.trim() !== '' ||
    selectedCategory !== 'all' ||
    selectedSkill !== 'all' ||
    selectedLanguage !== 'all' ||
    selectedLocation !== 'all' ||
    selectedAvailability !== 'all' ||
    selectedStatus !== 'all' ||
    sortBy !== 'match_score';

  const handleResetFilters = () => {
    setSearch('');
    setSelectedCategory('all');
    setSelectedSkill('all');
    setSelectedLanguage('all');
    setSelectedLocation('all');
    setSelectedAvailability('all');
    setSelectedStatus('all');
    setSortBy('match_score');
  };

  return (
    <PageContainer maxWidth="7xl" className="space-y-6 text-left pb-12">
      {/* Toast Notification */}
      {toastMessage && (
        <div
          role="status"
          aria-live="polite"
          className="fixed bottom-6 right-6 z-50 px-5 py-3 rounded-2xl shadow-xl border bg-gray-900 text-white border-white/20 flex items-center gap-2.5 animate-in fade-in"
        >
          <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
          <span className="text-xs font-semibold">{toastMessage}</span>
        </div>
      )}

      {/* Top Navigation */}
      <div className="flex items-center justify-between pb-1">
        <BackButton fallback="/admin/opportunities" label="Back to Opportunities" variant="light" />
        <div className="hidden sm:flex items-center gap-1.5 text-xs text-neutral-400 font-medium">
          <span>Casting</span>
          <span>/</span>
          <span className="text-neutral-700 font-bold truncate max-w-xs">{opportunity?.title || 'Ranked Candidates'}</span>
        </div>
      </div>

      {/* TOP HEADER: Opportunity Info, Metrics & Actions */}
      <div className="p-5 sm:p-6 rounded-3xl bg-white border border-neutral-200/90 shadow-2xs space-y-4">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div className="space-y-1.5">
            <div className="flex flex-wrap items-center gap-2">
              <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-orange-50 text-[#FA5A36] border border-orange-200">
                {opportunity?.category || 'Casting Call'}
              </span>
              <span className="text-xs text-neutral-300">•</span>
              <span className="text-xs font-semibold text-neutral-600 flex items-center gap-1">
                <Building className="w-3.5 h-3.5 text-neutral-400" />
                {opportunity?.production_company || 'StageLink Productions'}
              </span>
            </div>

            <h1 className="text-2xl sm:text-3xl font-bold font-serif text-neutral-900 tracking-tight">
              Ranked Candidates — {opportunity?.title || 'Production Opportunity'}
            </h1>
            <p className="text-xs text-neutral-500 max-w-2xl leading-relaxed">
              Review, compare, and shortlist applicants ranked automatically against your role requirements.
            </p>
          </div>

          {/* Quick Metrics Bar */}
          <div className="flex items-center gap-2.5 self-start lg:self-center shrink-0">
            <div className="px-4 py-2 rounded-2xl bg-neutral-50 border border-neutral-200 text-center min-w-[90px]">
              <span className="block text-base font-bold font-mono text-neutral-900">
                {opportunity?.total_applications || applications.length}
              </span>
              <span className="text-[10px] font-bold text-neutral-500 uppercase tracking-wider">
                Applicants
              </span>
            </div>
            <div className="px-4 py-2 rounded-2xl bg-amber-50/80 border border-amber-200 text-center min-w-[90px]">
              <span className="block text-base font-bold font-mono text-amber-900">
                {opportunity?.total_shortlisted || 0}
              </span>
              <span className="text-[10px] font-bold text-amber-700 uppercase tracking-wider">
                Shortlisted
              </span>
            </div>
            <button
              type="button"
              onClick={() => setIsCriteriaInfoOpen(true)}
              className="px-3.5 py-2.5 rounded-2xl bg-neutral-50 hover:bg-neutral-100 border border-neutral-200 text-neutral-700 transition-colors flex items-center gap-1.5 text-xs font-bold cursor-pointer"
              title="View scoring criteria & fairness policy"
            >
              <ShieldCheck className="w-4 h-4 text-emerald-600" />
              <span className="hidden sm:inline">Scoring Rubric</span>
            </button>
          </div>
        </div>

        {/* Requirements Summary Badge */}
        {opportunity?.requirements_summary && (
          <div className="p-3 rounded-xl bg-neutral-50 border border-neutral-200/80 text-neutral-700 text-xs flex flex-col sm:flex-row sm:items-center justify-between gap-2">
            <span className="font-medium">
              <strong className="text-neutral-900">Target Role: </strong>
              {opportunity.requirements_summary}
            </span>
            <span className="text-[11px] font-mono text-neutral-500">
              Dialogue: {opportunity.languages || 'Hindi, English'} • Location: {opportunity.location || 'Mumbai'}
            </span>
          </div>
        )}
      </div>

      {/* FILTER & SORTING TOOLBAR */}
      <div className="bg-white p-4 sm:p-5 rounded-2xl border border-neutral-200/90 shadow-2xs space-y-3.5">
        {/* Row 1: Search + Sort + Advanced Filter Toggle */}
        <div className="flex flex-col sm:flex-row gap-3 items-center">
          {/* Search by name or skill */}
          <div className="relative flex-1 w-full">
            <Search className="w-4 h-4 text-neutral-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search candidate by name, skills (e.g. Combat, Dance, Improv)..."
              className="w-full pl-10 pr-4 py-2.5 bg-neutral-50 border border-neutral-200 rounded-xl text-xs text-neutral-900 placeholder-neutral-400 focus:outline-none focus:ring-2 focus:ring-[#FA5A36]/20 focus:border-[#FA5A36] focus:bg-white transition-all"
            />
          </div>

          {/* Sort By Dropdown */}
          <div className="flex items-center gap-2 shrink-0 w-full sm:w-auto justify-between sm:justify-start">
            <div className="flex items-center gap-2">
              <ArrowUpDown className="w-3.5 h-3.5 text-neutral-500 shrink-0" />
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                aria-label="Sort candidates"
                className="px-3 py-2 bg-white border border-neutral-200 rounded-xl text-xs font-bold text-neutral-800 focus:outline-none focus:border-[#FA5A36] cursor-pointer"
              >
                <option value="match_score">Highest Match Score (Default)</option>
                <option value="latest_application">Latest Application Date</option>
                <option value="experience">Years of Experience</option>
              </select>
            </div>

            {/* Advanced Filters Toggle Button */}
            <button
              type="button"
              onClick={() => setShowAdvancedFilters(!showAdvancedFilters)}
              className={`inline-flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-bold border transition-all cursor-pointer ${
                showAdvancedFilters || activeAdvancedCount > 0
                  ? 'bg-neutral-900 text-white border-neutral-900 shadow-xs'
                  : 'bg-white text-neutral-700 border-neutral-200 hover:bg-neutral-50'
              }`}
            >
              <Filter className="w-3.5 h-3.5" />
              <span>Filters</span>
              {activeAdvancedCount > 0 && (
                <span className="w-4 h-4 rounded-full bg-[#FA5A36] text-white text-[10px] flex items-center justify-center font-bold">
                  {activeAdvancedCount}
                </span>
              )}
            </button>
          </div>
        </div>

        {/* Row 2: Status Quick Filter Tabs */}
        <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar pt-1 border-t border-neutral-100">
          <span className="text-[11px] font-bold uppercase tracking-wider text-neutral-400 mr-1 shrink-0">
            Status:
          </span>
          {STATUS_TABS.map((tab) => {
            const isActive = selectedStatus === tab.value;
            return (
              <button
                key={tab.value}
                type="button"
                onClick={() => setSelectedStatus(tab.value)}
                className={`px-3 py-1 rounded-full text-xs font-semibold whitespace-nowrap transition-all cursor-pointer ${
                  isActive
                    ? 'bg-[#FA5A36] text-white shadow-xs'
                    : 'bg-neutral-100 text-neutral-600 hover:bg-neutral-200 hover:text-neutral-900'
                }`}
              >
                {tab.label}
              </button>
            );
          })}
        </div>

        {/* Collapsible Advanced Filters */}
        {showAdvancedFilters && (
          <div className="pt-3 border-t border-neutral-100 animate-in fade-in duration-150">
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3 text-xs">
              {/* Category */}
              <div className="space-y-1">
                <label className="block text-[10px] font-bold text-neutral-500 uppercase tracking-wider">
                  Talent Category
                </label>
                <select
                  value={selectedCategory}
                  onChange={(e) => setSelectedCategory(e.target.value)}
                  className="w-full p-2 bg-white border border-neutral-200 rounded-xl text-xs font-medium text-neutral-800 focus:outline-none focus:border-[#FA5A36] cursor-pointer"
                >
                  <option value="all">All Categories</option>
                  <option value="actor">Actor</option>
                  <option value="model">Model</option>
                  <option value="theatre">Theatre</option>
                  <option value="voiceover">Voiceover</option>
                </select>
              </div>

              {/* Specific Skill */}
              <div className="space-y-1">
                <label className="block text-[10px] font-bold text-neutral-500 uppercase tracking-wider">
                  Specific Skill
                </label>
                <select
                  value={selectedSkill}
                  onChange={(e) => setSelectedSkill(e.target.value)}
                  className="w-full p-2 bg-white border border-neutral-200 rounded-xl text-xs font-medium text-neutral-800 focus:outline-none focus:border-[#FA5A36] cursor-pointer"
                >
                  <option value="all">All Skills</option>
                  <option value="acting">Acting</option>
                  <option value="dialogue">Dialogue Delivery</option>
                  <option value="improvisation">Improvisation</option>
                  <option value="combat">Screen Combat</option>
                  <option value="dance">Dance</option>
                  <option value="modeling">Modeling</option>
                </select>
              </div>

              {/* Language */}
              <div className="space-y-1">
                <label className="block text-[10px] font-bold text-neutral-500 uppercase tracking-wider">
                  Language
                </label>
                <select
                  value={selectedLanguage}
                  onChange={(e) => setSelectedLanguage(e.target.value)}
                  className="w-full p-2 bg-white border border-neutral-200 rounded-xl text-xs font-medium text-neutral-800 focus:outline-none focus:border-[#FA5A36] cursor-pointer"
                >
                  <option value="all">All Languages</option>
                  <option value="hindi">Hindi</option>
                  <option value="english">English</option>
                  <option value="punjabi">Punjabi</option>
                  <option value="bengali">Bengali</option>
                  <option value="french">French</option>
                </select>
              </div>

              {/* Location */}
              <div className="space-y-1">
                <label className="block text-[10px] font-bold text-neutral-500 uppercase tracking-wider">
                  Location
                </label>
                <select
                  value={selectedLocation}
                  onChange={(e) => setSelectedLocation(e.target.value)}
                  className="w-full p-2 bg-white border border-neutral-200 rounded-xl text-xs font-medium text-neutral-800 focus:outline-none focus:border-[#FA5A36] cursor-pointer"
                >
                  <option value="all">All Locations</option>
                  <option value="mumbai">Mumbai, India</option>
                  <option value="delhi">Delhi, India</option>
                  <option value="new york">New York, NY</option>
                  <option value="london">London, UK</option>
                </select>
              </div>

              {/* Availability */}
              <div className="space-y-1">
                <label className="block text-[10px] font-bold text-neutral-500 uppercase tracking-wider">
                  Availability
                </label>
                <select
                  value={selectedAvailability}
                  onChange={(e) => setSelectedAvailability(e.target.value)}
                  className="w-full p-2 bg-white border border-neutral-200 rounded-xl text-xs font-medium text-neutral-800 focus:outline-none focus:border-[#FA5A36] cursor-pointer"
                >
                  <option value="all">All Availability</option>
                  <option value="project">Immediate / Projects</option>
                  <option value="audition">Available for Auditions</option>
                  <option value="flexible">Flexible with Dates</option>
                </select>
              </div>
            </div>

            {/* Reset Active Filters */}
            {isFiltering && (
              <div className="flex justify-end pt-2">
                <button
                  type="button"
                  onClick={handleResetFilters}
                  className="inline-flex items-center gap-1.5 text-xs text-neutral-600 hover:text-[#FA5A36] font-semibold transition-colors cursor-pointer"
                >
                  <RotateCcw className="w-3.5 h-3.5" />
                  <span>Reset All Filters</span>
                </button>
              </div>
            )}
          </div>
        )}
      </div>

      {/* BULK ACTIONS & COMPARISON BAR */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-3.5 bg-white border border-neutral-200 rounded-2xl shadow-2xs">
        <div className="flex items-center gap-3">
          <label className="inline-flex items-center gap-2 cursor-pointer text-xs font-semibold text-neutral-700">
            <input
              type="checkbox"
              checked={applications.length > 0 && selectedAppIds.length === applications.length}
              onChange={handleSelectAll}
              className="w-4 h-4 rounded text-[#FA5A36] focus:ring-[#FA5A36] border-neutral-300"
            />
            <span>Select All ({selectedAppIds.length} Selected)</span>
          </label>
          {selectedAppIds.length > 0 && (
            <button
              type="button"
              onClick={() => setSelectedAppIds([])}
              className="text-xs text-neutral-400 hover:text-neutral-700 underline cursor-pointer"
            >
              Clear
            </button>
          )}
        </div>

        {/* Action triggers */}
        <div className="flex items-center gap-2">
          {/* Candidate Comparison Button (Active when 2-4 selected) */}
          <button
            type="button"
            disabled={selectedAppIds.length < 2 || selectedAppIds.length > 4}
            onClick={() => setIsCompareOpen(true)}
            className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
              selectedAppIds.length >= 2 && selectedAppIds.length <= 4
                ? 'bg-neutral-900 hover:bg-neutral-800 text-white shadow-2xs cursor-pointer'
                : 'bg-neutral-100 text-neutral-400 cursor-not-allowed border border-neutral-200'
            }`}
            title="Select 2 to 4 candidates to view side-by-side comparison"
          >
            <Layers className="w-3.5 h-3.5" />
            <span>Compare Candidates ({selectedAppIds.length >= 2 && selectedAppIds.length <= 4 ? selectedAppIds.length : 'Select 2-4'})</span>
          </button>

          {/* Bulk Shortlist Button */}
          <button
            type="button"
            disabled={selectedAppIds.length === 0}
            onClick={() => setIsBulkShortlistOpen(true)}
            className={`inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all ${
              selectedAppIds.length > 0
                ? 'bg-amber-400 hover:bg-amber-500 text-amber-950 shadow-2xs cursor-pointer'
                : 'bg-neutral-100 text-neutral-400 cursor-not-allowed border border-neutral-200'
            }`}
          >
            <Star className="w-3.5 h-3.5 fill-current" />
            <span>Bulk Shortlist ({selectedAppIds.length})</span>
          </button>
        </div>
      </div>

      {/* CANDIDATES LIST / CARDS */}
      {isLoading ? (
        <div className="space-y-4">
          {[1, 2, 3].map((i) => (
            <div
              key={i}
              className="p-6 rounded-2xl bg-white border border-neutral-200 animate-pulse space-y-4"
            >
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-full bg-neutral-200" />
                <div className="space-y-2 flex-1">
                  <div className="h-4 bg-neutral-200 rounded w-1/4" />
                  <div className="h-3 bg-neutral-200 rounded w-1/3" />
                </div>
              </div>
              <div className="grid grid-cols-3 gap-3">
                <div className="h-16 bg-neutral-100 rounded-xl" />
                <div className="h-16 bg-neutral-100 rounded-xl" />
                <div className="h-16 bg-neutral-100 rounded-xl" />
              </div>
            </div>
          ))}
        </div>
      ) : applications.length === 0 ? (
        <div className="p-12 text-center bg-white rounded-3xl border border-neutral-200 shadow-2xs space-y-3">
          <Briefcase className="w-12 h-12 mx-auto text-neutral-300" />
          <h3 className="text-lg font-bold font-serif text-neutral-900">
            No applicants match these criteria
          </h3>
          <p className="text-xs text-neutral-500 max-w-sm mx-auto">
            Try adjusting your search terms, specific skill requirements, or language filters.
          </p>
          <div className="pt-2">
            <Button onClick={handleResetFilters} variant="outline" className="text-xs">
              Reset Filters
            </Button>
          </div>
        </div>
      ) : (
        <div className="space-y-4">
          {applications.map((app) => (
            <CandidateCard
              key={app.id}
              application={app}
              isSelected={selectedAppIds.includes(app.id)}
              onToggleSelect={handleToggleSelect}
              onViewScoreBreakdown={(selected) => {
                setBreakdownApp(selected);
                setIsBreakdownOpen(true);
              }}
              onViewPortfolio={(selected) => {
                setPortfolioApp(selected);
                setIsPortfolioOpen(true);
              }}
              onShortlist={handleShortlist}
              onInviteAudition={(selected) => {
                setAuditionApp(selected);
                setIsAuditionOpen(true);
              }}
              onReject={(selected) => {
                setRejectApp(selected);
                setIsRejectOpen(true);
              }}
            />
          ))}
        </div>
      )}

      {/* PAGINATION CONTROLS */}
      {totalPages > 1 && (
        <div className="flex items-center justify-between p-4 bg-white rounded-2xl border border-neutral-200 shadow-2xs text-xs">
          <span className="text-neutral-500">
            Showing Page <strong className="text-neutral-900 font-bold">{currentPage}</strong> of{' '}
            <strong className="text-neutral-900 font-bold">{totalPages}</strong> ({totalCount} Total Candidates)
          </span>

          <div className="flex items-center gap-1.5">
            <button
              type="button"
              disabled={currentPage <= 1}
              onClick={() => loadRankedCandidates(currentPage - 1)}
              className="p-2 rounded-lg border border-neutral-200 hover:bg-neutral-50 text-neutral-700 disabled:opacity-40 disabled:cursor-not-allowed"
              title="Previous Page"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <span className="px-3 py-1 font-mono font-bold text-neutral-800">
              {currentPage} / {totalPages}
            </span>
            <button
              type="button"
              disabled={currentPage >= totalPages}
              onClick={() => loadRankedCandidates(currentPage + 1)}
              className="p-2 rounded-lg border border-neutral-200 hover:bg-neutral-50 text-neutral-700 disabled:opacity-40 disabled:cursor-not-allowed"
              title="Next Page"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      {/* =========================================================================
          MODALS
      ========================================================================= */}

      {/* 1. Transparent Score Breakdown Modal */}
      <ScoreBreakdownModal
        isOpen={isBreakdownOpen}
        onClose={() => {
          setIsBreakdownOpen(false);
          setBreakdownApp(null);
        }}
        application={breakdownApp}
        onRecalculate={handleRecalculateScore}
      />

      {/* 2. Portfolio & Work Samples Lightbox Modal */}
      <PortfolioModal
        isOpen={isPortfolioOpen}
        onClose={() => {
          setIsPortfolioOpen(false);
          setPortfolioApp(null);
        }}
        application={portfolioApp}
      />

      {/* 3. Audition / Callback Invitation Modal */}
      <AuditionInviteModal
        isOpen={isAuditionOpen}
        onClose={() => {
          setIsAuditionOpen(false);
          setAuditionApp(null);
        }}
        application={auditionApp}
        onConfirm={handleConfirmAudition}
      />

      {/* 4. Candidate Side-by-Side Comparison Modal */}
      <CandidateComparisonModal
        isOpen={isCompareOpen}
        onClose={() => setIsCompareOpen(false)}
        applications={selectedApplicationsList}
        onShortlist={handleShortlist}
        onInviteAudition={(selected) => {
          setIsCompareOpen(false);
          setAuditionApp(selected);
          setIsAuditionOpen(true);
        }}
      />

      {/* 5. Bulk Shortlist Modal */}
      <BulkShortlistModal
        isOpen={isBulkShortlistOpen}
        onClose={() => setIsBulkShortlistOpen(false)}
        selectedApplications={selectedApplicationsList}
        onConfirm={handleConfirmBulkShortlist}
      />

      {/* 6. Scoring Criteria & Fairness Policy Modal */}
      <ScoringCriteriaModal
        isOpen={isCriteriaInfoOpen}
        onClose={() => setIsCriteriaInfoOpen(false)}
      />

      {/* 7. Single Candidate Rejection Confirmation Modal */}
      <Modal
        isOpen={isRejectOpen}
        onClose={() => {
          setIsRejectOpen(false);
          setRejectApp(null);
        }}
        title="Confirm Application Status Change"
      >
        <div className="space-y-4 text-xs text-left">
          <p className="text-neutral-600">
            Are you sure you want to mark{' '}
            <strong className="text-neutral-900 font-bold">
              {rejectApp?.candidate?.fullName || rejectApp?.candidateName}
            </strong>{' '}
            as rejected?
          </p>

          <div className="p-3 bg-neutral-50 border border-neutral-200 rounded-xl text-neutral-600 text-[11px] space-y-1">
            <span className="font-bold text-neutral-800">Fairness Reminder:</span>
            <p>
              StageLink never automatically rejects candidates based on match scores. Casting directors hold full discretion to evaluate unique artistic suitability.
            </p>
          </div>

          <div className="space-y-1">
            <label className="block text-[11px] font-bold text-neutral-700 uppercase tracking-wider">
              Reason / Internal Feedback
            </label>
            <input
              type="text"
              value={rejectReason}
              onChange={(e) => setRejectReason(e.target.value)}
              className="w-full p-2.5 bg-white border border-neutral-200 rounded-xl text-xs text-neutral-900 focus:outline-hidden focus:ring-2 focus:ring-brand-pink"
            />
          </div>

          <div className="flex items-center justify-end gap-2 pt-2 border-t border-neutral-200">
            <Button
              type="button"
              variant="outline"
              onClick={() => {
                setIsRejectOpen(false);
                setRejectApp(null);
              }}
              className="text-xs"
            >
              Cancel
            </Button>
            <Button
              type="button"
              onClick={handleConfirmReject}
              className="text-xs bg-rose-600 hover:bg-rose-700 text-white font-bold"
            >
              Confirm Rejection
            </Button>
          </div>
        </div>
      </Modal>
    </PageContainer>
  );
};

export default RankedCandidatesPage;
