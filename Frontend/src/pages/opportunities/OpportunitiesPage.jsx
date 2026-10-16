import React, { useState, useMemo } from 'react';
import { useSearchParams } from 'react-router-dom';
import {
  Search,
  X,
  RotateCcw,
  Sparkles,
  ChevronDown,
} from 'lucide-react';
import PageContainer from '../../components/layout/PageContainer';
import OpportunityCard from '../../components/opportunities/OpportunityCard';
import EmptyState from '../../components/common/EmptyState';
import { mockOpportunities, OPPORTUNITY_CATEGORIES } from '../../data/mockOpportunities';

const OpportunitiesPage = () => {
  const [searchParams, setSearchParams] = useSearchParams();

  // URL param or initial category
  const initialCategory = searchParams.get('category') || 'all';

  // Filters & State
  const [search, setSearch] = useState('');
  const [selectedProjectType, setSelectedProjectType] = useState(
    initialCategory !== 'all' ? initialCategory : ''
  );
  const [selectedLocation, setSelectedLocation] = useState('');
  const [selectedExperience, setSelectedExperience] = useState('');
  const [selectedLanguage, setSelectedLanguage] = useState('');
  const [sortBy, setSortBy] = useState('newest'); // 'newest' | 'relevant'
  const [visibleCount, setVisibleCount] = useState(6);

  // Available Filter Options
  const projectTypeOptions = [
    { value: '', label: 'All Project Types' },
    { value: 'films', label: 'Films' },
    { value: 'web-series', label: 'Web Series' },
    { value: 'advertisements', label: 'Advertisements' },
    { value: 'music-videos', label: 'Music Videos' },
    { value: 'modeling', label: 'Modeling' },
    { value: 'theatre', label: 'Theatre' },
  ];

  const locationOptions = [
    { value: '', label: 'All Locations' },
    { value: 'mumbai', label: 'Mumbai' },
    { value: 'delhi', label: 'Delhi' },
    { value: 'hyderabad', label: 'Hyderabad' },
    { value: 'bangalore', label: 'Bangalore' },
    { value: 'goa', label: 'Goa' },
    { value: 'kolkata', label: 'Kolkata' },
  ];

  const experienceOptions = [
    { value: '', label: 'All Experience Levels' },
    { value: 'freshers', label: 'Freshers OK' },
    { value: '1+ year', label: '1+ Year' },
    { value: '3+ years', label: '3+ Years' },
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
  ];

  // Clear all filters
  const handleClearFilters = () => {
    setSearch('');
    setSelectedProjectType('');
    setSelectedLocation('');
    setSelectedExperience('');
    setSelectedLanguage('');
    setSortBy('newest');
    setVisibleCount(6);
    setSearchParams({});
  };

  const hasActiveFilters = Boolean(
    search ||
    selectedProjectType ||
    selectedLocation ||
    selectedExperience ||
    selectedLanguage
  );

  // Filter & Sort Logic
  const filteredAndSortedOpportunities = useMemo(() => {
    const filtered = mockOpportunities.filter((opp) => {
      // 1. Search filter (title, company, description, requirementsSummary, tags)
      const q = search.trim().toLowerCase();
      const matchesSearch =
        !q ||
        opp.title.toLowerCase().includes(q) ||
        opp.productionCompany.toLowerCase().includes(q) ||
        opp.description.toLowerCase().includes(q) ||
        (opp.roleDescription && opp.roleDescription.toLowerCase().includes(q)) ||
        (opp.requirementsSummary && opp.requirementsSummary.toLowerCase().includes(q)) ||
        (opp.tags && opp.tags.some((t) => t.toLowerCase().includes(q)));

      // 2. Project type filter
      const matchesType =
        !selectedProjectType ||
        opp.categoryKey === selectedProjectType ||
        opp.category.toLowerCase().replace(/\s+/g, '-') === selectedProjectType;

      // 3. Location filter
      const matchesLocation =
        !selectedLocation ||
        opp.location.toLowerCase().includes(selectedLocation.toLowerCase());

      // 4. Experience filter
      const matchesExp =
        !selectedExperience ||
        (selectedExperience === 'freshers' &&
          opp.experience.toLowerCase().includes('fresher')) ||
        (selectedExperience === '1+ year' &&
          opp.experience.toLowerCase().includes('1+')) ||
        (selectedExperience === '3+ years' &&
          opp.experience.toLowerCase().includes('3+'));

      // 5. Language filter
      const matchesLang =
        !selectedLanguage ||
        (opp.languages &&
          opp.languages.toLowerCase().includes(selectedLanguage.toLowerCase()));

      return matchesSearch && matchesType && matchesLocation && matchesExp && matchesLang;
    });

    // Sorting
    return [...filtered].sort((a, b) => {
      if (sortBy === 'newest') {
        const dateA = new Date(a.postedDate || a.postedTime || 0).getTime();
        const dateB = new Date(b.postedDate || b.postedTime || 0).getTime();
        return dateB - dateA;
      }
      if (sortBy === 'relevant') {
        // Relevance ranking: give higher weight if search matches title
        if (search) {
          const q = search.toLowerCase();
          const aInTitle = a.title.toLowerCase().includes(q) ? 2 : 0;
          const bInTitle = b.title.toLowerCase().includes(q) ? 2 : 0;
          return bInTitle - aInTitle;
        }
        // Fallback relevance: open status first, then newest
        if (a.status === 'open' && b.status !== 'open') return -1;
        if (a.status !== 'open' && b.status === 'open') return 1;
        return 0;
      }
      return 0;
    });
  }, [
    search,
    selectedProjectType,
    selectedLocation,
    selectedExperience,
    selectedLanguage,
    sortBy,
  ]);

  const displayedOpportunities = filteredAndSortedOpportunities.slice(0, visibleCount);
  const totalCount = filteredAndSortedOpportunities.length;
  const canLoadMore = visibleCount < totalCount;

  return (
    <div className="bg-gray-50/50 min-h-screen pb-20 space-y-8">
      {/* 1. HERO HEADER */}
      <section className="bg-brand-navy text-white relative overflow-hidden">
        {/* Subtle decorative glow */}
        <div className="absolute top-0 right-0 w-96 h-96 bg-brand-pink/10 rounded-full blur-3xl pointer-events-none -mr-20 -mt-20" />
        <div className="absolute bottom-0 left-1/3 w-64 h-64 bg-brand-gold/10 rounded-full blur-2xl pointer-events-none" />

        <PageContainer className="py-10 sm:py-14 relative z-10">
          <div className="grid grid-cols-1 md:grid-cols-12 gap-6 items-center">
            <div className="md:col-span-8 space-y-3 text-left">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 text-brand-gold text-xs font-semibold backdrop-blur-sm">
                <Sparkles className="w-3.5 h-3.5" />
                <span>Verified Casting Calls</span>
              </div>
              <h1 className="text-3xl sm:text-5xl font-bold font-serif tracking-tight">
                Acting Opportunities
              </h1>
              <p className="text-xs sm:text-base text-gray-300 max-w-2xl leading-relaxed">
                Discover active auditions, lead roles, and casting calls from certified
                production houses across feature films, web series, commercials, and theatre.
              </p>
            </div>
            <div className="md:col-span-4 hidden md:flex justify-end">
              <div className="relative">
                <div className="w-28 h-28 rounded-full overflow-hidden border-2 border-black/50 shadow-md">
                  <img
                    src="https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=300&q=80"
                    alt="Artist in Audition"
                    className="w-full h-full object-cover grayscale contrast-110"
                  />
                </div>
                <div className="absolute -bottom-2 -left-3 bg-black text-white text-[10px] font-bold px-2 py-0.5 rounded-full shadow-md">
                  Active Calls
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
              placeholder="Search by role title, production house, character or keywords..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-11 pr-10 py-3 bg-gray-50 border border-neutral-200 rounded-2xl text-xs sm:text-sm text-black placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-black/20 focus:border-black transition-all"
            />
            {search && (
              <button
                type="button"
                onClick={() => setSearch('')}
                aria-label="Clear search text"
                className="absolute right-3.5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-brand-navy p-1"
              >
                <X className="w-4 h-4" />
              </button>
            )}
          </div>

          {/* 4 Dedicated Filters: Project Type, Location, Experience, Language */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
            {/* Filter 1: Project Type */}
            <div className="relative">
              <label className="block text-[10px] font-bold uppercase tracking-wider text-brand-text-secondary mb-1">
                Project Type
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

            {/* Filter 2: Location */}
            <div className="relative">
              <label className="block text-[10px] font-bold uppercase tracking-wider text-brand-text-secondary mb-1">
                Location
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

            {/* Filter 3: Experience */}
            <div className="relative">
              <label className="block text-[10px] font-bold uppercase tracking-wider text-brand-text-secondary mb-1">
                Experience
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

            {/* Filter 4: Language */}
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
          </div>

          {/* Active Filter Chips & Clear Action */}
          {hasActiveFilters && (
            <div className="flex flex-wrap items-center gap-2 pt-2 border-t border-gray-100 text-xs">
              <span className="text-brand-text-secondary font-medium mr-1">Active Filters:</span>

              {search && (
                <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-brand-pink-light text-brand-pink text-xs font-semibold">
                  Search: "{search}"
                  <button onClick={() => setSearch('')} aria-label="Remove search filter">
                    <X className="w-3 h-3 hover:text-brand-pink-hover" />
                  </button>
                </span>
              )}

              {selectedProjectType && (
                <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-gray-100 text-brand-navy text-xs font-semibold">
                  Type: {projectTypeOptions.find((p) => p.value === selectedProjectType)?.label}
                  <button
                    onClick={() => {
                      setSelectedProjectType('');
                      setSearchParams({});
                    }}
                    aria-label="Remove project type filter"
                  >
                    <X className="w-3 h-3 hover:text-brand-pink" />
                  </button>
                </span>
              )}

              {selectedLocation && (
                <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-gray-100 text-brand-navy text-xs font-semibold">
                  Location: {locationOptions.find((l) => l.value === selectedLocation)?.label}
                  <button onClick={() => setSelectedLocation('')} aria-label="Remove location filter">
                    <X className="w-3 h-3 hover:text-brand-pink" />
                  </button>
                </span>
              )}

              {selectedExperience && (
                <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-gray-100 text-brand-navy text-xs font-semibold">
                  Exp: {experienceOptions.find((e) => e.value === selectedExperience)?.label}
                  <button onClick={() => setSelectedExperience('')} aria-label="Remove experience filter">
                    <X className="w-3 h-3 hover:text-brand-pink" />
                  </button>
                </span>
              )}

              {selectedLanguage && (
                <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-gray-100 text-brand-navy text-xs font-semibold">
                  Lang: {languageOptions.find((l) => l.value === selectedLanguage)?.label}
                  <button onClick={() => setSelectedLanguage('')} aria-label="Remove language filter">
                    <X className="w-3 h-3 hover:text-brand-pink" />
                  </button>
                </span>
              )}

              <button
                type="button"
                onClick={handleClearFilters}
                className="ml-auto inline-flex items-center gap-1 text-xs font-bold text-brand-pink hover:text-brand-pink-hover hover:underline"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                <span>Clear Filters</span>
              </button>
            </div>
          )}
        </div>

        {/* 3. CATEGORY PILLS BAR */}
        <div className="flex items-center gap-2 overflow-x-auto no-scrollbar pb-1">
          <button
            onClick={() => {
              setSelectedProjectType('');
              setSearchParams({});
            }}
            className={`px-4 py-2 rounded-xl text-xs font-bold whitespace-nowrap transition-all duration-150 ${
              !selectedProjectType
                ? 'bg-black text-white shadow-xs'
                : 'bg-white text-black border border-neutral-200 hover:bg-neutral-50'
            }`}
          >
            All Categories
          </button>
          {OPPORTUNITY_CATEGORIES.map((cat) => {
            const isActive = selectedProjectType === cat.id;
            return (
              <button
                key={cat.id}
                onClick={() => {
                  setSelectedProjectType(cat.id);
                  setSearchParams({ category: cat.id });
                }}
                className={`px-4 py-2 rounded-xl text-xs font-bold whitespace-nowrap transition-all duration-150 ${
                  isActive
                    ? 'bg-black text-white shadow-xs'
                    : 'bg-white text-black border border-neutral-200 hover:bg-neutral-50'
                }`}
              >
                {cat.name}
              </button>
            );
          })}
        </div>

        {/* 4. RESULT COUNT & SORT CONTROL */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs text-brand-text-secondary pt-2">
          <div className="flex items-center gap-2">
            <span>
              Showing <strong className="text-brand-navy font-bold">{displayedOpportunities.length}</strong> of{' '}
              <strong className="text-brand-navy font-bold">{totalCount}</strong> opportunities
            </span>
          </div>

          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2 bg-white px-3 py-1.5 rounded-xl border border-brand-border shadow-2xs">
              <span className="text-[11px] font-medium text-brand-text-secondary">Sort by:</span>
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="bg-transparent font-bold text-brand-navy text-xs focus:outline-none cursor-pointer"
              >
                <option value="newest">Newest</option>
                <option value="relevant">Relevant</option>
              </select>
            </div>

            {hasActiveFilters && (
              <button
                type="button"
                onClick={handleClearFilters}
                className="text-xs font-bold text-gray-500 hover:text-brand-pink transition-colors"
              >
                Reset All
              </button>
            )}
          </div>
        </div>

        {/* 5. OPPORTUNITY CARD GRID OR EMPTY STATE */}
        {totalCount === 0 ? (
          <EmptyState
            title="No Opportunities Match Your Criteria"
            description="We couldn't find any casting calls matching your search and filter parameters. Try clearing some filters or searching with broader terms."
            actionLabel="Clear All Filters"
            onAction={handleClearFilters}
          />
        ) : (
          <div className="space-y-8">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {displayedOpportunities.map((opp) => (
                <OpportunityCard key={opp.id} opportunity={opp} />
              ))}
            </div>

            {/* Pagination / Load More Button */}
            {canLoadMore && (
              <div className="flex flex-col items-center justify-center pt-4 space-y-2">
                <button
                  type="button"
                  onClick={() => setVisibleCount((prev) => Math.min(prev + 6, totalCount))}
                  className="px-6 py-3 bg-white hover:bg-gray-50 border border-brand-border text-brand-navy text-xs font-bold rounded-xl shadow-subtle hover:shadow-card transition-all"
                >
                  Load More Opportunities ({totalCount - displayedOpportunities.length} remaining)
                </button>
                <p className="text-[11px] text-gray-400">
                  Showing {displayedOpportunities.length} of {totalCount} total castings
                </p>
              </div>
            )}
          </div>
        )}
      </PageContainer>
    </div>
  );
};

export default OpportunitiesPage;
