import React, { useState, useMemo } from 'react';
import { useSearchParams } from 'react-router-dom';
import {
  Search,
  X,
  RotateCcw,
  Sparkles,
  ChevronDown,
  Filter,
  CheckCircle2,
} from 'lucide-react';
import PageContainer from '../../components/layout/PageContainer';
import OpportunityCard from '../../components/opportunities/OpportunityCard';
import EmptyState from '../../components/common/EmptyState';
import { mockOpportunities } from '../../data/mockOpportunities';
import { getCustomOpportunities } from '../../utils/paymentAccess';

const OpportunitiesPage = () => {
  const [searchParams, setSearchParams] = useSearchParams();

  // URL param or initial category
  const initialCategory = searchParams.get('category') || 'all';

  // Filters & State
  const [search, setSearch] = useState('');
  const [selectedProjectType, setSelectedProjectType] = useState(
    initialCategory !== 'all' ? initialCategory : ''
  );
  const [selectedTalentCategory, setSelectedTalentCategory] = useState('');
  const [selectedLocation, setSelectedLocation] = useState('');
  const [selectedExperience, setSelectedExperience] = useState('');
  const [selectedLanguage, setSelectedLanguage] = useState('');
  const [selectedCompensationType, setSelectedCompensationType] = useState('');
  const [selectedDeadline, setSelectedDeadline] = useState('');
  const [sortBy, setSortBy] = useState('newest'); // 'newest' | 'relevant' | 'deadline'
  const [visibleCount, setVisibleCount] = useState(6);

  // Available Filter Options
  const projectTypeOptions = [
    { value: '', label: 'All Project Categories' },
    { value: 'film-tv', label: 'Film & TV' },
    { value: 'advertising', label: 'Advertising / Commercials' },
    { value: 'modeling', label: 'Modeling & Fashion' },
    { value: 'music', label: 'Music & Music Videos' },
    { value: 'theatre', label: 'Theatre & Stage' },
    { value: 'digital-content', label: 'Digital Content & Web' },
    { value: 'voice-over', label: 'Voice-Over / Audio' },
    { value: 'other', label: 'Other Opportunities' },
  ];

  const talentCategoryOptions = [
    { value: '', label: 'All Talent Categories' },
    { value: 'actor', label: 'Actors' },
    { value: 'actress', label: 'Actresses' },
    { value: 'model', label: 'Models' },
    { value: 'dancer', label: 'Dancers' },
    { value: 'musician', label: 'Musicians' },
    { value: 'creator', label: 'Creators' },
    { value: 'voice', label: 'Voice Artists' },
    { value: 'presenter', label: 'Presenters' },
    { value: 'background', label: 'Background Artists' },
  ];

  const locationOptions = [
    { value: '', label: 'All Locations & Countries' },
    { value: 'mumbai', label: 'Mumbai, India' },
    { value: 'delhi', label: 'Delhi NCR, India' },
    { value: 'hyderabad', label: 'Hyderabad, India' },
    { value: 'bangalore', label: 'Bangalore, India' },
    { value: 'goa', label: 'Goa, India' },
    { value: 'kolkata', label: 'Kolkata, India' },
    { value: 'london', label: 'London, UK' },
    { value: 'budapest', label: 'Budapest, Hungary' },
    { value: 'los angeles', label: 'Los Angeles, USA' },
  ];

  const experienceOptions = [
    { value: '', label: 'All Experience Levels' },
    { value: 'freshers', label: 'Freshers OK' },
    { value: '1+ year', label: '1+ Year' },
    { value: '3+ years', label: '3+ Years' },
    { value: '5+ years', label: '5+ Years' },
  ];

  const languageOptions = [
    { value: '', label: 'All Languages' },
    { value: 'hindi', label: 'Hindi' },
    { value: 'english', label: 'English' },
    { value: 'telugu', label: 'Telugu' },
    { value: 'punjabi', label: 'Punjabi' },
    { value: 'kannada', label: 'Kannada' },
    { value: 'bengali', label: 'Bengali' },
    { value: 'urdu', label: 'Urdu' },
    { value: 'russian', label: 'Russian' },
  ];

  const compensationTypeOptions = [
    { value: '', label: 'All Compensation Types' },
    { value: 'paid', label: 'Paid' },
    { value: 'unpaid', label: 'Unpaid / Collaboration' },
    { value: 'expenses only', label: 'Expenses Only' },
    { value: 'negotiable', label: 'Negotiable' },
  ];

  const deadlineOptions = [
    { value: '', label: 'All Deadlines' },
    { value: 'active', label: 'Open / Not Expired' },
    { value: 'closing_soon', label: 'Closing Soon (≤ 7 Days)' },
  ];

  // Clear all filters
  const handleClearFilters = () => {
    setSearch('');
    setSelectedProjectType('');
    setSelectedTalentCategory('');
    setSelectedLocation('');
    setSelectedExperience('');
    setSelectedLanguage('');
    setSelectedCompensationType('');
    setSelectedDeadline('');
    setSortBy('newest');
    setVisibleCount(6);
    setSearchParams({});
  };

  const hasActiveFilters = Boolean(
    search ||
      selectedProjectType ||
      selectedTalentCategory ||
      selectedLocation ||
      selectedExperience ||
      selectedLanguage ||
      selectedCompensationType ||
      selectedDeadline
  );

  // STRICT Filter: Only Published & Open casting calls appear in the public listing
  const allOpportunities = useMemo(() => {
    const custom = getCustomOpportunities();
    const combined = [...custom, ...mockOpportunities];

    return combined.filter((opp) => {
      const status = (opp.listingStatus || opp.status || '').toLowerCase();
      // Explicitly reject drafts, pending payments, payment failures, pending moderation review, closed, rejected, or archived
      if (
        status === 'draft' ||
        status === 'pending_payment' ||
        status === 'payment_failed' ||
        status === 'pending_review' ||
        status === 'rejected' ||
        status === 'closed' ||
        status === 'expired' ||
        status === 'archived'
      ) {
        return false;
      }
      return status === 'published' || status === 'open';
    });
  }, []);

  const filteredAndSortedOpportunities = useMemo(() => {
    const filtered = allOpportunities.filter((opp) => {
      // 1. Search filter: title, company, character, skill, requirements, tags
      const q = search.trim().toLowerCase();
      const matchesSearch =
        !q ||
        (opp.title && opp.title.toLowerCase().includes(q)) ||
        (opp.productionCompany && opp.productionCompany.toLowerCase().includes(q)) ||
        (opp.description && opp.description.toLowerCase().includes(q)) ||
        (opp.roleDescription && opp.roleDescription.toLowerCase().includes(q)) ||
        (opp.requirementsSummary && opp.requirementsSummary.toLowerCase().includes(q)) ||
        (opp.requirements && opp.requirements.toLowerCase().includes(q)) ||
        (opp.tags && opp.tags.some((t) => t.toLowerCase().includes(q))) ||
        (opp.roles &&
          opp.roles.some(
            (r) =>
              (r.name && r.name.toLowerCase().includes(q)) ||
              (r.character && r.character.toLowerCase().includes(q)) ||
              (r.skills && r.skills.some((s) => s.toLowerCase().includes(q)))
          ));

      // 2. Project type filter
      const categoryText = (
        opp.productionCategory ||
        opp.category ||
        opp.categoryKey ||
        ''
      )
        .toLowerCase()
        .replace(/[^a-z0-9]/g, '');

      const matchesType =
        !selectedProjectType ||
        categoryText.includes(selectedProjectType.replace(/[^a-z0-9]/g, ''));

      // 3. Talent category filter
      const talents = Array.isArray(opp.talentNeeded)
        ? opp.talentNeeded.join(' ').toLowerCase()
        : (opp.talentNeeded || opp.category || '').toLowerCase();

      const matchesTalent =
        !selectedTalentCategory ||
        talents.includes(selectedTalentCategory.toLowerCase());

      // 4. Location & country filter
      const locationText = (opp.location || '').toLowerCase();
      const matchesLocation =
        !selectedLocation || locationText.includes(selectedLocation.toLowerCase());

      // 5. Experience filter
      const expText = (opp.experience || '').toLowerCase();
      const matchesExp =
        !selectedExperience ||
        (selectedExperience === 'freshers' && expText.includes('fresher')) ||
        (selectedExperience === '1+ year' && (expText.includes('1+') || expText.includes('fresher'))) ||
        (selectedExperience === '3+ years' && (expText.includes('3+') || expText.includes('2+'))) ||
        (selectedExperience === '5+ years' && expText.includes('5+'));

      // 6. Language filter
      const langText = (opp.languages || opp.required_languages?.join(' ') || '').toLowerCase();
      const matchesLang =
        !selectedLanguage || langText.includes(selectedLanguage.toLowerCase());

      // 7. Compensation type filter
      const compType = (opp.compensationType || '').toLowerCase();
      const matchesComp =
        !selectedCompensationType ||
        compType.includes(selectedCompensationType.toLowerCase()) ||
        (selectedCompensationType === 'paid' && opp.compensation && opp.compensation !== '0');

      // 8. Application deadline filter
      let matchesDeadline = true;
      if (selectedDeadline) {
        const deadlineDateStr =
          opp.applicationDeadline || opp.deadline || opp.expiresDate;
        if (deadlineDateStr) {
          const deadlineTime = new Date(deadlineDateStr).getTime();
          const now = Date.now();
          if (selectedDeadline === 'active') {
            matchesDeadline = !deadlineTime || deadlineTime >= now;
          } else if (selectedDeadline === 'closing_soon') {
            const sevenDaysMs = 7 * 24 * 60 * 60 * 1000;
            matchesDeadline = deadlineTime >= now && deadlineTime <= now + sevenDaysMs;
          }
        }
      }

      return (
        matchesSearch &&
        matchesType &&
        matchesTalent &&
        matchesLocation &&
        matchesExp &&
        matchesLang &&
        matchesComp &&
        matchesDeadline
      );
    });

    // Sorting
    return [...filtered].sort((a, b) => {
      if (sortBy === 'newest') {
        const dateA = new Date(a.postedDate || a.postedTime || a.created_at || 0).getTime();
        const dateB = new Date(b.postedDate || b.postedTime || b.created_at || 0).getTime();
        return dateB - dateA;
      }
      if (sortBy === 'deadline') {
        const dateA = new Date(a.applicationDeadline || a.deadline || '2099-01-01').getTime();
        const dateB = new Date(b.applicationDeadline || b.deadline || '2099-01-01').getTime();
        return dateA - dateB;
      }
      if (sortBy === 'relevant') {
        if (search) {
          const q = search.toLowerCase();
          const aInTitle = a.title?.toLowerCase().includes(q) ? 2 : 0;
          const bInTitle = b.title?.toLowerCase().includes(q) ? 2 : 0;
          return bInTitle - aInTitle;
        }
        if (a.status === 'open' && b.status !== 'open') return -1;
        if (a.status !== 'open' && b.status === 'open') return 1;
        return 0;
      }
      return 0;
    });
  }, [
    allOpportunities,
    search,
    selectedProjectType,
    selectedTalentCategory,
    selectedLocation,
    selectedExperience,
    selectedLanguage,
    selectedCompensationType,
    selectedDeadline,
    sortBy,
  ]);

  const displayedOpportunities = filteredAndSortedOpportunities.slice(0, visibleCount);
  const totalCount = filteredAndSortedOpportunities.length;
  const canLoadMore = visibleCount < totalCount;

  return (
    <div className="bg-gray-50/50 min-h-screen pb-20 space-y-8">
      {/* 1. HERO HEADER */}
      <section className="bg-brand-navy text-white relative overflow-hidden">
        <div className="absolute top-0 right-0 w-96 h-96 bg-brand-pink/10 rounded-full blur-3xl pointer-events-none -mr-20 -mt-20" />
        <div className="absolute bottom-0 left-1/3 w-64 h-64 bg-brand-gold/10 rounded-full blur-2xl pointer-events-none" />

        <PageContainer className="py-10 sm:py-14 relative z-10">
          <div className="grid grid-cols-1 md:grid-cols-12 gap-6 items-center">
            <div className="md:col-span-8 space-y-3 text-left">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 text-brand-gold text-xs font-semibold backdrop-blur-sm">
                <Sparkles className="w-3.5 h-3.5" />
                <span>Verified Casting Directory</span>
              </div>
              <h1 className="text-3xl sm:text-5xl font-bold font-serif tracking-tight">
                Casting Calls &amp; Auditions
              </h1>
              <p className="text-xs sm:text-base text-gray-300 max-w-2xl leading-relaxed">
                Discover published acting opportunities, lead roles, and casting calls
                from certified production houses across feature films, web series, commercials, and theatre.
              </p>
            </div>
            <div className="md:col-span-4 hidden md:flex justify-end">
              <div className="relative">
                <div className="w-28 h-28 rounded-full overflow-hidden border-2 border-brand-pink/50 shadow-md">
                  <img
                    src="https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=300&q=80"
                    alt="Artist in Audition"
                    className="w-full h-full object-cover grayscale contrast-110"
                  />
                </div>
                <div className="absolute -bottom-2 -left-3 bg-brand-pink text-white text-[10px] font-bold px-2.5 py-0.5 rounded-full shadow-md">
                  Live Calls
                </div>
              </div>
            </div>
          </div>
        </PageContainer>
      </section>

      {/* 2. SEARCH & FILTER CONTROLS */}
      <PageContainer className="-mt-10 sm:-mt-12 relative z-20 space-y-6">
        <div className="bg-white rounded-3xl p-5 sm:p-6 border border-neutral-200 shadow-xl space-y-5">
          {/* Top Search Input */}
          <div className="relative">
            <Search className="w-4 h-4 text-gray-400 absolute left-4 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search by title, production company, character, skill, or keyword..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-11 pr-10 py-3 bg-gray-50 border border-neutral-200 rounded-2xl text-xs sm:text-sm text-black placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-brand-pink/20 focus:border-brand-pink transition-all"
            />
            {search && (
              <button
                type="button"
                onClick={() => setSearch('')}
                aria-label="Clear search text"
                className="absolute right-3.5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-brand-navy p-1 cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            )}
          </div>

          {/* Dedicated Filter Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 text-left">
            {/* Filter 1: Project Type */}
            <div className="relative">
              <label className="block text-[10px] font-bold uppercase tracking-wider text-brand-text-secondary mb-1">
                Project Category
              </label>
              <div className="relative">
                <select
                  value={selectedProjectType}
                  onChange={(e) => {
                    setSelectedProjectType(e.target.value);
                    if (e.target.value) {
                      setSearchParams({ category: e.target.value });
                    } else {
                      setSearchParams({});
                    }
                  }}
                  className="w-full px-3.5 py-2.5 bg-gray-50/70 border border-brand-border rounded-xl text-xs text-brand-navy font-medium appearance-none pr-8 focus:outline-none focus:ring-2 focus:ring-brand-pink/20 focus:border-brand-pink cursor-pointer"
                >
                  {projectTypeOptions.map((opt) => (
                    <option key={opt.value} value={opt.value}>
                      {opt.label}
                    </option>
                  ))}
                </select>
                <ChevronDown className="w-3.5 h-3.5 text-gray-400 absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none" />
              </div>
            </div>

            {/* Filter 2: Talent Category */}
            <div className="relative">
              <label className="block text-[10px] font-bold uppercase tracking-wider text-brand-text-secondary mb-1">
                Talent Category
              </label>
              <div className="relative">
                <select
                  value={selectedTalentCategory}
                  onChange={(e) => setSelectedTalentCategory(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-gray-50/70 border border-brand-border rounded-xl text-xs text-brand-navy font-medium appearance-none pr-8 focus:outline-none focus:ring-2 focus:ring-brand-pink/20 focus:border-brand-pink cursor-pointer"
                >
                  {talentCategoryOptions.map((opt) => (
                    <option key={opt.value} value={opt.value}>
                      {opt.label}
                    </option>
                  ))}
                </select>
                <ChevronDown className="w-3.5 h-3.5 text-gray-400 absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none" />
              </div>
            </div>

            {/* Filter 3: Location */}
            <div className="relative">
              <label className="block text-[10px] font-bold uppercase tracking-wider text-brand-text-secondary mb-1">
                Location &amp; Country
              </label>
              <div className="relative">
                <select
                  value={selectedLocation}
                  onChange={(e) => setSelectedLocation(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-gray-50/70 border border-brand-border rounded-xl text-xs text-brand-navy font-medium appearance-none pr-8 focus:outline-none focus:ring-2 focus:ring-brand-pink/20 focus:border-brand-pink cursor-pointer"
                >
                  {locationOptions.map((opt) => (
                    <option key={opt.value} value={opt.value}>
                      {opt.label}
                    </option>
                  ))}
                </select>
                <ChevronDown className="w-3.5 h-3.5 text-gray-400 absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none" />
              </div>
            </div>

            {/* Filter 4: Experience */}
            <div className="relative">
              <label className="block text-[10px] font-bold uppercase tracking-wider text-brand-text-secondary mb-1">
                Experience Level
              </label>
              <div className="relative">
                <select
                  value={selectedExperience}
                  onChange={(e) => setSelectedExperience(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-gray-50/70 border border-brand-border rounded-xl text-xs text-brand-navy font-medium appearance-none pr-8 focus:outline-none focus:ring-2 focus:ring-brand-pink/20 focus:border-brand-pink cursor-pointer"
                >
                  {experienceOptions.map((opt) => (
                    <option key={opt.value} value={opt.value}>
                      {opt.label}
                    </option>
                  ))}
                </select>
                <ChevronDown className="w-3.5 h-3.5 text-gray-400 absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none" />
              </div>
            </div>

            {/* Filter 5: Language */}
            <div className="relative">
              <label className="block text-[10px] font-bold uppercase tracking-wider text-brand-text-secondary mb-1">
                Language
              </label>
              <div className="relative">
                <select
                  value={selectedLanguage}
                  onChange={(e) => setSelectedLanguage(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-gray-50/70 border border-brand-border rounded-xl text-xs text-brand-navy font-medium appearance-none pr-8 focus:outline-none focus:ring-2 focus:ring-brand-pink/20 focus:border-brand-pink cursor-pointer"
                >
                  {languageOptions.map((opt) => (
                    <option key={opt.value} value={opt.value}>
                      {opt.label}
                    </option>
                  ))}
                </select>
                <ChevronDown className="w-3.5 h-3.5 text-gray-400 absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none" />
              </div>
            </div>

            {/* Filter 6: Compensation Type */}
            <div className="relative">
              <label className="block text-[10px] font-bold uppercase tracking-wider text-brand-text-secondary mb-1">
                Compensation Type
              </label>
              <div className="relative">
                <select
                  value={selectedCompensationType}
                  onChange={(e) => setSelectedCompensationType(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-gray-50/70 border border-brand-border rounded-xl text-xs text-brand-navy font-medium appearance-none pr-8 focus:outline-none focus:ring-2 focus:ring-brand-pink/20 focus:border-brand-pink cursor-pointer"
                >
                  {compensationTypeOptions.map((opt) => (
                    <option key={opt.value} value={opt.value}>
                      {opt.label}
                    </option>
                  ))}
                </select>
                <ChevronDown className="w-3.5 h-3.5 text-gray-400 absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none" />
              </div>
            </div>

            {/* Filter 7: Application Deadline */}
            <div className="relative">
              <label className="block text-[10px] font-bold uppercase tracking-wider text-brand-text-secondary mb-1">
                Application Deadline
              </label>
              <div className="relative">
                <select
                  value={selectedDeadline}
                  onChange={(e) => setSelectedDeadline(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-gray-50/70 border border-brand-border rounded-xl text-xs text-brand-navy font-medium appearance-none pr-8 focus:outline-none focus:ring-2 focus:ring-brand-pink/20 focus:border-brand-pink cursor-pointer"
                >
                  {deadlineOptions.map((opt) => (
                    <option key={opt.value} value={opt.value}>
                      {opt.label}
                    </option>
                  ))}
                </select>
                <ChevronDown className="w-3.5 h-3.5 text-gray-400 absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none" />
              </div>
            </div>

            {/* Filter 8: Sorting */}
            <div className="relative">
              <label className="block text-[10px] font-bold uppercase tracking-wider text-brand-text-secondary mb-1">
                Sort Listings
              </label>
              <div className="relative">
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-gray-50/70 border border-brand-border rounded-xl text-xs text-brand-navy font-medium appearance-none pr-8 focus:outline-none focus:ring-2 focus:ring-brand-pink/20 focus:border-brand-pink cursor-pointer"
                >
                  <option value="newest">Newest First</option>
                  <option value="relevant">Most Relevant</option>
                  <option value="deadline">Expiring Soonest</option>
                </select>
                <ChevronDown className="w-3.5 h-3.5 text-gray-400 absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none" />
              </div>
            </div>
          </div>

          {/* Active Filter Chips & Clear Action */}
          {hasActiveFilters && (
            <div className="flex flex-wrap items-center gap-2 pt-2 border-t border-gray-100 text-xs text-left">
              <span className="text-brand-text-secondary font-medium mr-1">Active Filters:</span>

              {search && (
                <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-pink-50 text-brand-pink text-xs font-semibold">
                  Search: "{search}"
                  <button onClick={() => setSearch('')} aria-label="Remove search filter">
                    <X className="w-3 h-3 hover:text-rose-700" />
                  </button>
                </span>
              )}

              {selectedProjectType && (
                <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-pink-50 text-brand-pink text-xs font-semibold">
                  Type: {projectTypeOptions.find((p) => p.value === selectedProjectType)?.label}
                  <button onClick={() => setSelectedProjectType('')} aria-label="Remove type filter">
                    <X className="w-3 h-3 hover:text-rose-700" />
                  </button>
                </span>
              )}

              {selectedTalentCategory && (
                <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-pink-50 text-brand-pink text-xs font-semibold">
                  Talent: {talentCategoryOptions.find((t) => t.value === selectedTalentCategory)?.label}
                  <button onClick={() => setSelectedTalentCategory('')} aria-label="Remove talent filter">
                    <X className="w-3 h-3 hover:text-rose-700" />
                  </button>
                </span>
              )}

              {selectedLocation && (
                <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-pink-50 text-brand-pink text-xs font-semibold">
                  Location: {selectedLocation}
                  <button onClick={() => setSelectedLocation('')} aria-label="Remove location filter">
                    <X className="w-3 h-3 hover:text-rose-700" />
                  </button>
                </span>
              )}

              {selectedExperience && (
                <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-pink-50 text-brand-pink text-xs font-semibold">
                  Experience: {selectedExperience}
                  <button onClick={() => setSelectedExperience('')} aria-label="Remove experience filter">
                    <X className="w-3 h-3 hover:text-rose-700" />
                  </button>
                </span>
              )}

              {selectedLanguage && (
                <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-pink-50 text-brand-pink text-xs font-semibold">
                  Language: {selectedLanguage}
                  <button onClick={() => setSelectedLanguage('')} aria-label="Remove language filter">
                    <X className="w-3 h-3 hover:text-rose-700" />
                  </button>
                </span>
              )}

              {selectedCompensationType && (
                <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-pink-50 text-brand-pink text-xs font-semibold">
                  Comp: {selectedCompensationType}
                  <button onClick={() => setSelectedCompensationType('')} aria-label="Remove compensation filter">
                    <X className="w-3 h-3 hover:text-rose-700" />
                  </button>
                </span>
              )}

              {selectedDeadline && (
                <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-pink-50 text-brand-pink text-xs font-semibold">
                  Deadline: {selectedDeadline}
                  <button onClick={() => setSelectedDeadline('')} aria-label="Remove deadline filter">
                    <X className="w-3 h-3 hover:text-rose-700" />
                  </button>
                </span>
              )}

              <button
                type="button"
                onClick={handleClearFilters}
                className="inline-flex items-center gap-1 text-xs text-gray-500 hover:text-brand-pink ml-auto font-medium cursor-pointer"
              >
                <RotateCcw className="w-3 h-3" />
                <span>Reset All Filters</span>
              </button>
            </div>
          )}
        </div>

        {/* 3. LISTINGS RESULTS HEADER */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs text-brand-text-secondary text-left">
          <div>
            Showing <strong className="text-black font-bold">{displayedOpportunities.length}</strong> of{' '}
            <strong className="text-black font-bold">{totalCount}</strong> published casting call
            {totalCount !== 1 ? 's' : ''}
          </div>

          <div className="flex items-center gap-2">
            <span className="inline-flex items-center gap-1 text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-full border border-emerald-200 text-[11px] font-semibold">
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
              <span>Verified &amp; Published Only</span>
            </span>
          </div>
        </div>

        {/* 4. OPPORTUNITIES GRID / EMPTY STATE */}
        {displayedOpportunities.length === 0 ? (
          <EmptyState
            title="No Matching Casting Calls Found"
            description="Try adjusting your filters, location, or search keywords to discover more production opportunities."
            actionText="Reset All Filters"
            onAction={handleClearFilters}
          />
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {displayedOpportunities.map((opp) => (
              <OpportunityCard key={opp.id} opportunity={opp} />
            ))}
          </div>
        )}

        {/* 5. LOAD MORE / PAGINATION */}
        {canLoadMore && (
          <div className="text-center pt-8">
            <button
              type="button"
              onClick={() => setVisibleCount((prev) => prev + 6)}
              className="px-8 py-3 bg-white hover:bg-neutral-50 text-black border border-neutral-300 hover:border-black text-xs font-bold rounded-2xl shadow-sm transition-all transform active:scale-95 cursor-pointer"
            >
              Load More Casting Calls ({totalCount - visibleCount} remaining)
            </button>
          </div>
        )}
      </PageContainer>
    </div>
  );
};

export default OpportunitiesPage;
