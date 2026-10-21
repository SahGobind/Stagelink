import React, { useState, useEffect, useMemo } from 'react';
import { Link, useLocation } from 'react-router-dom';
import {
  Search,
  Filter,
  X,
  RotateCcw,
  SlidersHorizontal,
  ChevronDown,
  Sparkles,
  Bookmark,
  Users,
  CheckCircle2,
  AlertCircle,
  ArrowRight,
  Briefcase,
  ExternalLink,
  Calendar,
  MapPin,
  Building2,
  Clock,
  PlusCircle,
  Check,
  Award,
} from 'lucide-react';
import TalentCard from '../../components/talent/TalentCard';
import OpportunityCard from '../../components/opportunities/OpportunityCard';
import InviteToCastingModal from '../../components/talent/InviteToCastingModal';
import Toast from '../../components/common/Toast';
import {
  TALENT_CATEGORIES,
  EXPERIENCE_LEVELS,
  AVAILABILITY_OPTIONS,
  LANGUAGES_OPTIONS,
  LOCATION_OPTIONS,
} from '../../data/mockTalentDirectory';
import {
  talentService,
  EVENT_SAVED_TALENT_CHANGED,
} from '../../services/talentService';
import { castingService } from '../../services/castingService';
import { useAuth } from '../../context/AuthContext';
import {
  getCustomOpportunities,
  getLastPublishedOpportunity,
  EVENT_PAYMENT_STATE_CHANGED,
} from '../../utils/paymentAccess';

const PAGE_SIZE = 8;

const JOB_CATEGORIES = [
  'All Categories',
  'Films',
  'Film & TV',
  'Web Series',
  'Advertisements',
  'Music Videos',
  'Modeling',
  'Theatre',
  'Digital Content',
];

const DiscoverTalentPage = () => {
  const location = useLocation();
  const { isAuthenticated, user } = useAuth();
  const isRecruiter = isAuthenticated && (user?.role === 'recruiter' || user?.role === 'admin');

  // Tab State: 'talent' (Browse Talent Roster) or 'jobs' (Published Casting Calls)
  const [activeTab, setActiveTab] = useState(
    location.state?.activeTab || (location.state?.newlyPublishedOpp ? 'jobs' : 'talent')
  );

  // Newly Published Opportunity Spotlight Banner (passed from payment confirmation or session)
  const [newlyPublishedNotice, setNewlyPublishedNotice] = useState(
    location.state?.newlyPublishedOpp || getLastPublishedOpportunity() || null
  );

  // Talent Filter States
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All Categories');
  const [selectedLocation, setSelectedLocation] = useState('All Locations');
  const [selectedExperience, setSelectedExperience] = useState('All Experience');
  const [selectedLanguage, setSelectedLanguage] = useState('All Languages');
  const [selectedAvailability, setSelectedAvailability] = useState('All Availability');

  // Job Filter States
  const [jobSearchQuery, setJobSearchQuery] = useState('');
  const [jobCategoryFilter, setJobCategoryFilter] = useState('All Categories');
  const [jobLocationFilter, setJobLocationFilter] = useState('All Locations');

  // Toggle for More Filters in Talent Tab
  const [showMoreFilters, setShowMoreFilters] = useState(false);

  // Data & UI States
  const [filteredTalent, setFilteredTalent] = useState([]);
  const [isLoadingTalent, setIsLoadingTalent] = useState(true);
  const [visibleCount, setVisibleCount] = useState(PAGE_SIZE);
  const [savedTalentIds, setSavedTalentIds] = useState(new Set());
  const [toastMessage, setToastMessage] = useState('');

  // Published Jobs Data States
  const [publishedJobs, setPublishedJobs] = useState([]);
  const [isLoadingJobs, setIsLoadingJobs] = useState(true);
  const [visibleJobsCount, setVisibleJobsCount] = useState(PAGE_SIZE);

  // Modal State for Invite to Audition
  const [inviteModalTalent, setInviteModalTalent] = useState(null);

  // Sync state if routed with newly published opp state
  useEffect(() => {
    if (location.state?.newlyPublishedOpp) {
      setNewlyPublishedNotice(location.state.newlyPublishedOpp);
      if (location.state?.activeTab) {
        setActiveTab(location.state.activeTab);
      }
    }
  }, [location.state]);

  // Load Saved Talent IDs
  const refreshSavedTalent = () => {
    const list = talentService.getSavedTalent();
    setSavedTalentIds(new Set(list.map((item) => (typeof item === 'string' ? item : item.id))));
  };

  useEffect(() => {
    refreshSavedTalent();

    const handleSavedChanged = () => refreshSavedTalent();
    window.addEventListener(EVENT_SAVED_TALENT_CHANGED, handleSavedChanged);
    window.addEventListener('storage', handleSavedChanged);

    return () => {
      window.removeEventListener(EVENT_SAVED_TALENT_CHANGED, handleSavedChanged);
      window.removeEventListener('storage', handleSavedChanged);
    };
  }, []);

  // Load Published Casting Calls & Job Posts
  const loadPublishedJobs = async () => {
    setIsLoadingJobs(true);
    try {
      const opps = await castingService.getPublicOpportunities();
      const customList = getCustomOpportunities();
      const customIds = new Set(customList.map((c) => c.id));

      // Ensure custom user-published jobs (paid listings) are sorted to the very top
      const sorted = [...(opps || [])].sort((a, b) => {
        const aIsCustom = customIds.has(a.id);
        const bIsCustom = customIds.has(b.id);
        if (aIsCustom && !bIsCustom) return -1;
        if (!aIsCustom && bIsCustom) return 1;
        return 0;
      });

      setPublishedJobs(sorted);
    } catch (err) {
      console.error('Failed to load published jobs:', err);
      setPublishedJobs(getCustomOpportunities());
    } finally {
      setIsLoadingJobs(false);
    }
  };

  useEffect(() => {
    loadPublishedJobs();

    const handlePublishedUpdate = () => loadPublishedJobs();
    window.addEventListener(EVENT_PAYMENT_STATE_CHANGED, handlePublishedUpdate);
    window.addEventListener('starcast:opportunity-published', handlePublishedUpdate);
    window.addEventListener('storage', handlePublishedUpdate);

    return () => {
      window.removeEventListener(EVENT_PAYMENT_STATE_CHANGED, handlePublishedUpdate);
      window.removeEventListener('starcast:opportunity-published', handlePublishedUpdate);
      window.removeEventListener('storage', handlePublishedUpdate);
    };
  }, []);

  // Fetch Talent Data
  useEffect(() => {
    let isMounted = true;
    const fetchTalent = async () => {
      setIsLoadingTalent(true);
      try {
        const res = await talentService.getAllTalent({
          search: searchQuery,
          category: selectedCategory,
          location: selectedLocation,
          experience: selectedExperience,
          language: selectedLanguage,
          availability: selectedAvailability,
        });
        if (isMounted) {
          setFilteredTalent(res.talent || []);
        }
      } catch (err) {
        console.error('Failed to load talent:', err);
      } finally {
        if (isMounted) setIsLoadingTalent(false);
      }
    };

    fetchTalent();

    return () => {
      isMounted = false;
    };
  }, [
    searchQuery,
    selectedCategory,
    selectedLocation,
    selectedExperience,
    selectedLanguage,
    selectedAvailability,
  ]);

  // Filtered Published Jobs
  const filteredJobs = useMemo(() => {
    return publishedJobs.filter((job) => {
      // Search Query
      if (jobSearchQuery.trim()) {
        const q = jobSearchQuery.toLowerCase();
        const matchTitle = job.title?.toLowerCase().includes(q);
        const matchComp = job.productionCompany?.toLowerCase().includes(q);
        const matchDesc = job.description?.toLowerCase().includes(q);
        const matchLoc = job.location?.toLowerCase().includes(q);
        if (!matchTitle && !matchComp && !matchDesc && !matchLoc) return false;
      }

      // Category Filter
      if (jobCategoryFilter !== 'All Categories') {
        const jobCat = (job.productionCategory || job.category || '').toLowerCase();
        const filterCat = jobCategoryFilter.toLowerCase();
        if (!jobCat.includes(filterCat) && !filterCat.includes(jobCat)) return false;
      }

      // Location Filter
      if (jobLocationFilter !== 'All Locations') {
        const jobLoc = (job.location || '').toLowerCase();
        const filterLoc = jobLocationFilter.toLowerCase();
        if (!jobLoc.includes(filterLoc)) return false;
      }

      return true;
    });
  }, [publishedJobs, jobSearchQuery, jobCategoryFilter, jobLocationFilter]);

  // Determine Active Filters Count for Talent
  const activeTalentFiltersCount = useMemo(() => {
    let count = 0;
    if (searchQuery.trim()) count++;
    if (selectedCategory !== 'All Categories') count++;
    if (selectedLocation !== 'All Locations') count++;
    if (selectedExperience !== 'All Experience') count++;
    if (selectedLanguage !== 'All Languages') count++;
    if (selectedAvailability !== 'All Availability') count++;
    return count;
  }, [
    searchQuery,
    selectedCategory,
    selectedLocation,
    selectedExperience,
    selectedLanguage,
    selectedAvailability,
  ]);

  // Determine Active Filters Count for Jobs
  const activeJobFiltersCount = useMemo(() => {
    let count = 0;
    if (jobSearchQuery.trim()) count++;
    if (jobCategoryFilter !== 'All Categories') count++;
    if (jobLocationFilter !== 'All Locations') count++;
    return count;
  }, [jobSearchQuery, jobCategoryFilter, jobLocationFilter]);

  // Clear Talent Filters
  const handleClearTalentFilters = () => {
    setSearchQuery('');
    setSelectedCategory('All Categories');
    setSelectedLocation('All Locations');
    setSelectedExperience('All Experience');
    setSelectedLanguage('All Languages');
    setSelectedAvailability('All Availability');
    setVisibleCount(PAGE_SIZE);
    setToastMessage('Talent filters cleared.');
  };

  // Clear Job Filters
  const handleClearJobFilters = () => {
    setJobSearchQuery('');
    setJobCategoryFilter('All Categories');
    setJobLocationFilter('All Locations');
    setVisibleJobsCount(PAGE_SIZE);
    setToastMessage('Casting call filters cleared.');
  };

  // Toggle Save Talent
  const handleToggleSave = (talent) => {
    const isNowSaved = talentService.toggleSaveTalent(talent);
    refreshSavedTalent();
    setToastMessage(
      isNowSaved
        ? `${talent.fullName} saved to your talent roster!`
        : `${talent.fullName} removed from saved roster.`
    );
  };

  // Open Invite Modal
  const handleOpenInvite = (talent) => {
    setInviteModalTalent(talent);
  };

  // Find Matching Talent for a Job Post
  const handleFindMatchingTalent = (job) => {
    setActiveTab('talent');
    const jobCat = (job.category || job.productionCategory || '').toLowerCase();
    const talentNeeded = Array.isArray(job.talentNeeded) ? job.talentNeeded[0] : (job.talentNeeded || '');

    if (talentNeeded && TALENT_CATEGORIES.includes(talentNeeded)) {
      setSelectedCategory(talentNeeded);
    } else if (jobCat.includes('model')) {
      setSelectedCategory('Model');
    } else if (jobCat.includes('music')) {
      setSelectedCategory('Musician');
    } else if (jobCat.includes('dance')) {
      setSelectedCategory('Dancer');
    } else if (jobCat.includes('voice')) {
      setSelectedCategory('Voice Artist');
    } else {
      setSelectedCategory('Actor');
    }

    setToastMessage(`Showing talent suited for "${job.title}"!`);
    window.scrollTo({ top: 320, behavior: 'smooth' });
  };

  const displayedTalent = filteredTalent.slice(0, visibleCount);
  const hasMoreTalent = visibleCount < filteredTalent.length;

  const displayedJobs = filteredJobs.slice(0, visibleJobsCount);
  const hasMoreJobs = visibleJobsCount < filteredJobs.length;

  // Custom opportunities created by user/recruiter
  const customOpportunities = useMemo(() => {
    return getCustomOpportunities();
  }, [publishedJobs]);

  return (
    <div className="min-h-screen bg-white text-brand-navy pb-24 text-left">
      {/* Hero / Page Header */}
      <section className="border-b border-gray-100 bg-gradient-to-b from-gray-50/70 via-white to-white pt-10 pb-6 sm:pt-14 sm:pb-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-6">
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
            <div className="space-y-2">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-pink-50 border border-pink-100/80 text-brand-pink text-xs font-bold">
                <Sparkles className="w-3.5 h-3.5" />
                <span>StageLink Talent Marketplace &amp; Production Casting</span>
              </div>
              <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold font-serif text-brand-navy tracking-tight">
                Discover Talent
              </h1>
              <p className="text-sm sm:text-base text-brand-text-secondary max-w-2xl font-normal leading-relaxed">
                Connect verified performers with active production casting calls. Browse vetted artist profiles, inspect showreels, or explore paid job posts published directly by studios.
              </p>
            </div>

            {/* Quick Actions Bar */}
            <div className="flex flex-wrap items-center gap-2.5 shrink-0">
              <Link
                to={isRecruiter ? '/post-job' : '/signup?role=recruiter&redirect=/post-job'}
                className="px-4 py-2.5 rounded-xl bg-brand-pink hover:bg-rose-700 text-white text-xs font-bold flex items-center gap-1.5 shadow-xs transition-all"
              >
                <PlusCircle className="w-4 h-4" />
                <span>Post a Casting Call</span>
              </Link>
              <Link
                to="/admin/saved-talent"
                className="px-4 py-2.5 rounded-xl border border-gray-200 hover:border-brand-pink bg-white text-xs font-bold text-brand-navy flex items-center gap-2 shadow-2xs transition-all"
              >
                <Bookmark className="w-4 h-4 text-brand-pink" />
                <span>Saved Talent Roster</span>
                {savedTalentIds.size > 0 && (
                  <span className="px-2 py-0.5 rounded-full bg-brand-pink text-white text-[10px] font-bold">
                    {savedTalentIds.size}
                  </span>
                )}
              </Link>
            </div>
          </div>

          {/* Primary View Navigation Tabs */}
          <div className="flex items-center gap-2 border-b border-gray-200 pt-4 overflow-x-auto no-scrollbar">
            <button
              type="button"
              onClick={() => setActiveTab('talent')}
              className={`pb-3.5 px-4 text-xs sm:text-sm font-bold flex items-center gap-2 border-b-2 transition-all cursor-pointer whitespace-nowrap ${
                activeTab === 'talent'
                  ? 'border-brand-pink text-brand-pink'
                  : 'border-transparent text-gray-500 hover:text-gray-900'
              }`}
            >
              <Users className="w-4 h-4" />
              <span>Browse Talent Roster</span>
              <span className="px-2 py-0.5 rounded-full text-[10px] bg-gray-100 text-gray-700 font-semibold">
                {filteredTalent.length}
              </span>
            </button>

            <button
              type="button"
              onClick={() => setActiveTab('jobs')}
              className={`pb-3.5 px-4 text-xs sm:text-sm font-bold flex items-center gap-2 border-b-2 transition-all cursor-pointer relative whitespace-nowrap ${
                activeTab === 'jobs'
                  ? 'border-brand-pink text-brand-pink'
                  : 'border-transparent text-gray-500 hover:text-gray-900'
              }`}
            >
              <Briefcase className="w-4 h-4" />
              <span>Published Casting Calls &amp; Job Posts</span>
              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] bg-emerald-50 text-emerald-700 border border-emerald-200 font-bold">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                {publishedJobs.length} Live
              </span>
            </button>
          </div>
        </div>
      </section>

      {/* NEWLY PUBLISHED OPPORTUNITY SPOTLIGHT BANNER */}
      {newlyPublishedNotice && (
        <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-6">
          <div className="p-4 sm:p-5 rounded-3xl bg-gradient-to-r from-emerald-50 via-teal-50/80 to-pink-50/70 border border-emerald-200 shadow-xs flex flex-col md:flex-row items-start md:items-center justify-between gap-4 animate-in fade-in slide-in-from-top-2 duration-300">
            <div className="flex items-start gap-3.5">
              <div className="w-11 h-11 rounded-2xl bg-emerald-600 text-white flex items-center justify-center shrink-0 shadow-xs">
                <CheckCircle2 className="w-6 h-6 stroke-[2.2]" />
              </div>
              <div className="space-y-1">
                <div className="flex flex-wrap items-center gap-2">
                  <span className="px-2.5 py-0.5 rounded-full text-[10px] font-extrabold uppercase tracking-wider bg-emerald-100 text-emerald-800 border border-emerald-200">
                    ✓ Published Live Inside Discover Talent
                  </span>
                  <span className="text-[11px] text-gray-500 font-medium">
                    Payment Verified &amp; Active
                  </span>
                </div>
                <h3 className="text-base sm:text-lg font-bold text-gray-900 font-serif">
                  {newlyPublishedNotice.title}
                </h3>
                <p className="text-xs text-gray-600 leading-relaxed">
                  Published by <strong className="text-gray-900">{newlyPublishedNotice.productionCompany}</strong> • {newlyPublishedNotice.location || 'Mumbai'} • {newlyPublishedNotice.artistsNeeded || 1} open roles. Performers across StageLink can now view, share, and apply!
                </p>
              </div>
            </div>

            <div className="flex flex-wrap items-center gap-2.5 shrink-0 self-end md:self-center">
              <button
                type="button"
                onClick={() => {
                  setActiveTab('jobs');
                  setJobSearchQuery(newlyPublishedNotice.title || '');
                }}
                className="px-3.5 py-2 rounded-xl bg-white border border-gray-300 hover:border-gray-900 text-xs font-bold text-gray-800 transition-colors shadow-2xs cursor-pointer"
              >
                View in Job Posts
              </button>
              <button
                type="button"
                onClick={() => handleFindMatchingTalent(newlyPublishedNotice)}
                className="px-4 py-2 rounded-xl bg-brand-pink hover:bg-rose-700 text-xs font-bold text-white transition-colors shadow-2xs flex items-center gap-1.5 cursor-pointer"
              >
                <Users className="w-3.5 h-3.5" />
                <span>Invite Matching Talent Below</span>
              </button>
              <button
                type="button"
                onClick={() => setNewlyPublishedNotice(null)}
                className="p-2 text-gray-400 hover:text-gray-700 transition-colors cursor-pointer"
                title="Dismiss banner"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>
        </section>
      )}

      {/* ============================================================== */}
      {/* TAB 1: BROWSE TALENT ROSTER VIEW                               */}
      {/* ============================================================== */}
      {activeTab === 'talent' && (
        <>
          {/* Quick Announcement Bar for Active Published Jobs */}
          {customOpportunities.length > 0 && (
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-4">
              <div className="p-3 bg-neutral-50 rounded-2xl border border-gray-200/80 flex items-center justify-between gap-3 text-xs">
                <div className="flex items-center gap-2 overflow-hidden text-ellipsis">
                  <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse shrink-0" />
                  <span className="font-bold text-gray-800 shrink-0">Your Active Casting Calls:</span>
                  <span className="text-gray-600 truncate">
                    "{customOpportunities[0].title}" is live. Invite candidates directly from the roster below!
                  </span>
                </div>
                <button
                  type="button"
                  onClick={() => setActiveTab('jobs')}
                  className="text-xs font-bold text-brand-pink hover:underline shrink-0 flex items-center gap-1 cursor-pointer"
                >
                  <span>View All ({publishedJobs.length}) Published Calls</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          )}

          {/* Sticky Search and Filters Bar for Talent */}
          <section className="sticky top-16 z-30 bg-white/95 backdrop-blur-md border-b border-gray-100 py-4 shadow-xs mt-4">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-3">
              {/* Primary Quick Filters Row */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-12 gap-3">
                {/* Search Input */}
                <div className="lg:col-span-4 relative">
                  <Search className="w-4 h-4 text-gray-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => {
                      setSearchQuery(e.target.value);
                      setVisibleCount(PAGE_SIZE);
                    }}
                    placeholder="Search by artist name, skill, or keyword..."
                    className="w-full pl-10 pr-9 py-2.5 rounded-xl border border-gray-200 text-xs text-gray-900 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-brand-pink/30 focus:border-brand-pink bg-white transition-all shadow-2xs"
                  />
                  {searchQuery && (
                    <button
                      type="button"
                      onClick={() => setSearchQuery('')}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-700"
                    >
                      <X className="w-3.5 h-3.5" />
                    </button>
                  )}
                </div>

                {/* Talent Category Dropdown */}
                <div className="lg:col-span-3">
                  <select
                    value={selectedCategory}
                    onChange={(e) => {
                      setSelectedCategory(e.target.value);
                      setVisibleCount(PAGE_SIZE);
                    }}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-gray-200 text-xs font-semibold text-gray-800 bg-white focus:outline-none focus:ring-2 focus:ring-brand-pink/30 focus:border-brand-pink transition-all shadow-2xs cursor-pointer"
                  >
                    {TALENT_CATEGORIES.map((cat) => (
                      <option key={cat} value={cat}>
                        {cat}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Location Dropdown */}
                <div className="lg:col-span-3">
                  <select
                    value={selectedLocation}
                    onChange={(e) => {
                      setSelectedLocation(e.target.value);
                      setVisibleCount(PAGE_SIZE);
                    }}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-gray-200 text-xs font-semibold text-gray-800 bg-white focus:outline-none focus:ring-2 focus:ring-brand-pink/30 focus:border-brand-pink transition-all shadow-2xs cursor-pointer"
                  >
                    {LOCATION_OPTIONS.map((loc) => (
                      <option key={loc} value={loc}>
                        {loc}
                      </option>
                    ))}
                  </select>
                </div>

                {/* More Filters Toggle & Clear Filters */}
                <div className="lg:col-span-2 flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => setShowMoreFilters(!showMoreFilters)}
                    className={`flex-1 py-2.5 px-3 rounded-xl border text-xs font-bold transition-all flex items-center justify-center gap-1.5 shadow-2xs cursor-pointer ${
                      showMoreFilters ||
                      selectedLanguage !== 'All Languages' ||
                      selectedAvailability !== 'All Availability' ||
                      selectedExperience !== 'All Experience'
                        ? 'border-brand-pink text-brand-pink bg-pink-50/50'
                        : 'border-gray-200 text-gray-700 hover:border-gray-400 bg-white'
                    }`}
                  >
                    <SlidersHorizontal className="w-3.5 h-3.5" />
                    <span>Filters</span>
                    {activeTalentFiltersCount > 0 && (
                      <span className="w-4 h-4 rounded-full bg-brand-pink text-white text-[10px] flex items-center justify-center font-bold">
                        {activeTalentFiltersCount}
                      </span>
                    )}
                    <ChevronDown
                      className={`w-3.5 h-3.5 transition-transform ${showMoreFilters ? 'rotate-180' : ''}`}
                    />
                  </button>

                  {activeTalentFiltersCount > 0 && (
                    <button
                      type="button"
                      onClick={handleClearTalentFilters}
                      className="p-2.5 rounded-xl border border-gray-200 text-gray-500 hover:text-brand-pink hover:border-brand-pink bg-white transition-all shadow-2xs cursor-pointer"
                      title="Clear all active filters"
                    >
                      <RotateCcw className="w-3.5 h-3.5" />
                    </button>
                  )}
                </div>
              </div>

              {/* Secondary "More Filters" Accordion Row */}
              {showMoreFilters && (
                <div className="p-4 bg-gray-50/90 rounded-2xl border border-gray-100 grid grid-cols-1 sm:grid-cols-3 gap-3 pt-3 animate-in fade-in duration-150">
                  <div className="space-y-1">
                    <label className="block text-[11px] font-bold text-gray-700">
                      Experience Level
                    </label>
                    <select
                      value={selectedExperience}
                      onChange={(e) => {
                        setSelectedExperience(e.target.value);
                        setVisibleCount(PAGE_SIZE);
                      }}
                      className="w-full px-3 py-2 rounded-xl border border-gray-200 text-xs font-semibold text-gray-800 bg-white focus:outline-none focus:ring-2 focus:ring-brand-pink/30 focus:border-brand-pink"
                    >
                      {EXPERIENCE_LEVELS.map((exp) => (
                        <option key={exp} value={exp}>
                          {exp}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className="space-y-1">
                    <label className="block text-[11px] font-bold text-gray-700">
                      Spoken Language
                    </label>
                    <select
                      value={selectedLanguage}
                      onChange={(e) => {
                        setSelectedLanguage(e.target.value);
                        setVisibleCount(PAGE_SIZE);
                      }}
                      className="w-full px-3 py-2 rounded-xl border border-gray-200 text-xs font-semibold text-gray-800 bg-white focus:outline-none focus:ring-2 focus:ring-brand-pink/30 focus:border-brand-pink"
                    >
                      {LANGUAGES_OPTIONS.map((lang) => (
                        <option key={lang} value={lang}>
                          {lang}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className="space-y-1">
                    <label className="block text-[11px] font-bold text-gray-700">
                      Availability Status
                    </label>
                    <select
                      value={selectedAvailability}
                      onChange={(e) => {
                        setSelectedAvailability(e.target.value);
                        setVisibleCount(PAGE_SIZE);
                      }}
                      className="w-full px-3 py-2 rounded-xl border border-gray-200 text-xs font-semibold text-gray-800 bg-white focus:outline-none focus:ring-2 focus:ring-brand-pink/30 focus:border-brand-pink"
                    >
                      {AVAILABILITY_OPTIONS.map((avail) => (
                        <option key={avail} value={avail}>
                          {avail}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>
              )}

              {/* Active Filter Chips & Counter Bar */}
              <div className="flex flex-wrap items-center justify-between gap-2 pt-1 text-xs">
                <div className="flex flex-wrap items-center gap-1.5">
                  <span className="text-gray-500 font-medium">
                    {isLoadingTalent
                      ? 'Searching roster...'
                      : `Showing ${filteredTalent.length} performer${filteredTalent.length === 1 ? '' : 's'}`}
                  </span>

                  {selectedCategory !== 'All Categories' && (
                    <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-pink-50 border border-pink-100 text-[11px] font-bold text-brand-pink">
                      <span>{selectedCategory}</span>
                      <button onClick={() => setSelectedCategory('All Categories')}>
                        <X className="w-3 h-3" />
                      </button>
                    </span>
                  )}

                  {selectedLocation !== 'All Locations' && (
                    <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-pink-50 border border-pink-100 text-[11px] font-bold text-brand-pink">
                      <span>{selectedLocation}</span>
                      <button onClick={() => setSelectedLocation('All Locations')}>
                        <X className="w-3 h-3" />
                      </button>
                    </span>
                  )}

                  {searchQuery && (
                    <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-gray-100 border border-gray-200 text-[11px] font-bold text-gray-700">
                      <span>"{searchQuery}"</span>
                      <button onClick={() => setSearchQuery('')}>
                        <X className="w-3 h-3" />
                      </button>
                    </span>
                  )}
                </div>

                {activeTalentFiltersCount > 0 && (
                  <button
                    type="button"
                    onClick={handleClearTalentFilters}
                    className="text-[11px] font-bold text-brand-pink hover:underline cursor-pointer"
                  >
                    Clear all filters
                  </button>
                )}
              </div>
            </div>
          </section>

          {/* Talent Cards Grid */}
          <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-10">
            {isLoadingTalent ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {[...Array(8)].map((_, i) => (
                  <div
                    key={i}
                    className="bg-white rounded-2xl border border-gray-100 overflow-hidden shadow-2xs animate-pulse"
                  >
                    <div className="aspect-4/3 bg-gray-100" />
                    <div className="p-4 space-y-3">
                      <div className="h-4 bg-gray-100 rounded-md w-3/4" />
                      <div className="h-3 bg-gray-100 rounded-md w-1/2" />
                      <div className="h-10 bg-gray-50 rounded-md w-full" />
                      <div className="flex gap-2 pt-2">
                        <div className="h-8 bg-gray-100 rounded-xl flex-1" />
                        <div className="h-8 bg-gray-100 rounded-xl w-16" />
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : filteredTalent.length === 0 ? (
              <div className="py-16 text-center max-w-md mx-auto space-y-4">
                <div className="w-16 h-16 rounded-full bg-pink-50 text-brand-pink flex items-center justify-center mx-auto shadow-2xs">
                  <Users className="w-8 h-8" />
                </div>
                <div className="space-y-1.5">
                  <h2 className="text-xl font-bold font-serif text-brand-navy">
                    No Talent Found Matching Criteria
                  </h2>
                  <p className="text-xs text-brand-text-secondary leading-relaxed">
                    We couldn't find any performers matching your active filters. Try adjusting your search query, location, or talent category.
                  </p>
                </div>
                <button
                  type="button"
                  onClick={handleClearTalentFilters}
                  className="px-6 py-2.5 rounded-xl bg-brand-pink text-white text-xs font-bold hover:bg-rose-700 transition-colors shadow-xs cursor-pointer"
                >
                  Clear All Filters
                </button>
              </div>
            ) : (
              <div className="space-y-8">
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                  {displayedTalent.map((talent) => (
                    <TalentCard
                      key={talent.id}
                      talent={talent}
                      isSaved={savedTalentIds.has(talent.id)}
                      onToggleSave={handleToggleSave}
                      onInvite={handleOpenInvite}
                    />
                  ))}
                </div>

                {hasMoreTalent && (
                  <div className="pt-6 text-center">
                    <button
                      type="button"
                      onClick={() => setVisibleCount((prev) => prev + PAGE_SIZE)}
                      className="px-7 py-3 rounded-xl border border-gray-200 hover:border-gray-900 bg-white hover:bg-gray-50 text-brand-navy text-xs font-bold transition-all shadow-2xs cursor-pointer"
                    >
                      Load More Performers ({filteredTalent.length - visibleCount} remaining)
                    </button>
                  </div>
                )}
              </div>
            )}
          </main>
        </>
      )}

      {/* ============================================================== */}
      {/* TAB 2: PUBLISHED CASTING CALLS & JOB POSTS VIEW               */}
      {/* ============================================================== */}
      {activeTab === 'jobs' && (
        <>
          {/* Search & Filter Bar for Published Jobs */}
          <section className="sticky top-16 z-30 bg-white/95 backdrop-blur-md border-b border-gray-100 py-4 shadow-xs mt-4">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-3">
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-12 gap-3">
                {/* Search Bar */}
                <div className="lg:col-span-5 relative">
                  <Search className="w-4 h-4 text-gray-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                  <input
                    type="text"
                    value={jobSearchQuery}
                    onChange={(e) => {
                      setJobSearchQuery(e.target.value);
                      setVisibleJobsCount(PAGE_SIZE);
                    }}
                    placeholder="Search casting calls by title, role, or production company..."
                    className="w-full pl-10 pr-9 py-2.5 rounded-xl border border-gray-200 text-xs text-gray-900 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-brand-pink/30 focus:border-brand-pink bg-white transition-all shadow-2xs"
                  />
                  {jobSearchQuery && (
                    <button
                      type="button"
                      onClick={() => setJobSearchQuery('')}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-700"
                    >
                      <X className="w-3.5 h-3.5" />
                    </button>
                  )}
                </div>

                {/* Job Category Dropdown */}
                <div className="lg:col-span-4">
                  <select
                    value={jobCategoryFilter}
                    onChange={(e) => {
                      setJobCategoryFilter(e.target.value);
                      setVisibleJobsCount(PAGE_SIZE);
                    }}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-gray-200 text-xs font-semibold text-gray-800 bg-white focus:outline-none focus:ring-2 focus:ring-brand-pink/30 focus:border-brand-pink transition-all shadow-2xs cursor-pointer"
                  >
                    {JOB_CATEGORIES.map((cat) => (
                      <option key={cat} value={cat}>
                        {cat}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Location Filter */}
                <div className="lg:col-span-3 flex items-center gap-2">
                  <select
                    value={jobLocationFilter}
                    onChange={(e) => {
                      setJobLocationFilter(e.target.value);
                      setVisibleJobsCount(PAGE_SIZE);
                    }}
                    className="flex-1 px-3.5 py-2.5 rounded-xl border border-gray-200 text-xs font-semibold text-gray-800 bg-white focus:outline-none focus:ring-2 focus:ring-brand-pink/30 focus:border-brand-pink transition-all shadow-2xs cursor-pointer"
                  >
                    {LOCATION_OPTIONS.map((loc) => (
                      <option key={loc} value={loc}>
                        {loc}
                      </option>
                    ))}
                  </select>

                  {activeJobFiltersCount > 0 && (
                    <button
                      type="button"
                      onClick={handleClearJobFilters}
                      className="p-2.5 rounded-xl border border-gray-200 text-gray-500 hover:text-brand-pink hover:border-brand-pink bg-white transition-all shadow-2xs cursor-pointer"
                      title="Clear job filters"
                    >
                      <RotateCcw className="w-3.5 h-3.5" />
                    </button>
                  )}
                </div>
              </div>

              {/* Active Chips & Information */}
              <div className="flex flex-wrap items-center justify-between gap-2 pt-1 text-xs">
                <div className="flex items-center gap-2">
                  <span className="text-gray-500 font-medium">
                    {isLoadingJobs
                      ? 'Loading live casting calls...'
                      : `Showing ${filteredJobs.length} active casting call${filteredJobs.length === 1 ? '' : 's'}`}
                  </span>
                  {customOpportunities.length > 0 && (
                    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-800 border border-emerald-200 text-[10px] font-bold">
                      <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                      <span>{customOpportunities.length} Published by You</span>
                    </span>
                  )}
                </div>

                {activeJobFiltersCount > 0 && (
                  <button
                    type="button"
                    onClick={handleClearJobFilters}
                    className="text-[11px] font-bold text-brand-pink hover:underline cursor-pointer"
                  >
                    Clear all casting call filters
                  </button>
                )}
              </div>
            </div>
          </section>

          {/* Published Casting Calls Grid */}
          <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-10">
            {isLoadingJobs ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {[...Array(6)].map((_, i) => (
                  <div
                    key={i}
                    className="bg-white rounded-2xl border border-gray-200 overflow-hidden shadow-2xs animate-pulse"
                  >
                    <div className="aspect-[16/10] bg-gray-100" />
                    <div className="p-5 space-y-3">
                      <div className="h-4 bg-gray-100 rounded w-1/3" />
                      <div className="h-5 bg-gray-100 rounded w-3/4" />
                      <div className="h-10 bg-gray-50 rounded w-full" />
                    </div>
                  </div>
                ))}
              </div>
            ) : filteredJobs.length === 0 ? (
              <div className="py-16 text-center max-w-md mx-auto space-y-4">
                <div className="w-16 h-16 rounded-full bg-pink-50 text-brand-pink flex items-center justify-center mx-auto shadow-2xs">
                  <Briefcase className="w-8 h-8" />
                </div>
                <div className="space-y-1.5">
                  <h2 className="text-xl font-bold font-serif text-brand-navy">
                    No Casting Calls Match Your Search
                  </h2>
                  <p className="text-xs text-brand-text-secondary leading-relaxed">
                    Try loosening your keywords or category filters, or publish a brand new casting call for your production.
                  </p>
                </div>
                <div className="flex justify-center gap-3">
                  <button
                    type="button"
                    onClick={handleClearJobFilters}
                    className="px-5 py-2.5 rounded-xl border border-gray-300 text-xs font-bold text-gray-800 hover:bg-gray-50"
                  >
                    Reset Filters
                  </button>
                  <Link
                    to={isRecruiter ? '/post-job' : '/signup?role=recruiter&redirect=/post-job'}
                    className="px-5 py-2.5 rounded-xl bg-brand-pink text-white text-xs font-bold hover:bg-rose-700 shadow-xs"
                  >
                    Post a Casting Call
                  </Link>
                </div>
              </div>
            ) : (
              <div className="space-y-8">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {displayedJobs.map((job) => {
                    const isCustomRecruiterJob = customOpportunities.some(
                      (c) => c.id === job.id || c.refId === job.refId
                    );

                    return (
                      <div
                        key={job.id}
                        className={`rounded-2xl flex flex-col justify-between transition-all relative ${
                          isCustomRecruiterJob
                            ? 'ring-2 ring-emerald-500/80 shadow-md'
                            : ''
                        }`}
                      >
                        {/* Custom Job Header Ribbon if published by current recruiter */}
                        {isCustomRecruiterJob && (
                          <div className="bg-emerald-600 text-white text-[10px] font-bold uppercase tracking-wider py-1 px-3 rounded-t-2xl flex items-center justify-between">
                            <span className="flex items-center gap-1">
                              <Award className="w-3.5 h-3.5" />
                              <span>Your Live Published Post • Paid &amp; Active</span>
                            </span>
                            <span className="bg-white/20 px-1.5 py-0.2 rounded text-[9px]">
                              Escrow Verified
                            </span>
                          </div>
                        )}

                        <div className="flex-1 flex flex-col">
                          <OpportunityCard opportunity={job} />
                        </div>

                        {/* Direct Quick Action for Matching Performers */}
                        <div className="bg-gray-50/90 border-x border-b border-gray-200 p-3 rounded-b-2xl flex items-center justify-between gap-2 text-xs">
                          <div className="flex items-center gap-1.5 text-gray-600 text-[11px]">
                            <Users className="w-3.5 h-3.5 text-brand-pink" />
                            <span>{job.artistsNeeded || 1} Openings</span>
                          </div>

                          <button
                            type="button"
                            onClick={() => handleFindMatchingTalent(job)}
                            className="px-3 py-1.5 rounded-lg bg-brand-pink/10 hover:bg-brand-pink text-brand-pink hover:text-white font-bold text-[11px] transition-all flex items-center gap-1 cursor-pointer"
                          >
                            <span>Find Matching Talent</span>
                            <ArrowRight className="w-3 h-3" />
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>

                {hasMoreJobs && (
                  <div className="pt-6 text-center">
                    <button
                      type="button"
                      onClick={() => setVisibleJobsCount((prev) => prev + PAGE_SIZE)}
                      className="px-7 py-3 rounded-xl border border-gray-200 hover:border-gray-900 bg-white hover:bg-gray-50 text-brand-navy text-xs font-bold transition-all shadow-2xs cursor-pointer"
                    >
                      Load More Casting Calls ({filteredJobs.length - visibleJobsCount} remaining)
                    </button>
                  </div>
                )}
              </div>
            )}
          </main>
        </>
      )}

      {/* Direct Invitation Modal for Talent */}
      <InviteToCastingModal
        isOpen={Boolean(inviteModalTalent)}
        onClose={() => setInviteModalTalent(null)}
        talent={inviteModalTalent}
        onSuccess={(invitation) => {
          setToastMessage(`Audition invitation sent to ${inviteModalTalent?.fullName}!`);
        }}
      />

      {/* Action Toast Feedback */}
      <Toast message={toastMessage} onClose={() => setToastMessage('')} />
    </div>
  );
};

export default DiscoverTalentPage;
