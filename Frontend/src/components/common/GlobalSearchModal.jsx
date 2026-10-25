import React, { useState, useEffect, useRef, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Search,
  X,
  Briefcase,
  Users,
  Building2,
  ArrowRight,
  Sparkles,
  MapPin,
  Star,
  Film,
  Compass,
} from 'lucide-react';
import { mockOpportunities } from '../../data/mockOpportunities';
import { mockTalentProfiles } from '../../data/mockTalentDirectory';
import { getCustomOpportunities } from '../../utils/paymentAccess';

const TRENDING_SEARCHES = [
  { label: 'Indian Film Stars', category: 'talent', filter: 'Film Stars' },
  { label: 'Feature Film Lead', category: 'casting', filter: 'Feature Film' },
  { label: 'Musicians & Scores', category: 'talent', filter: 'Musicians' },
  { label: 'Dancers & Choreography', category: 'talent', filter: 'Dancers' },
  { label: 'OTT Web Series', category: 'casting', filter: 'Web Series' },
  { label: 'London Casting', category: 'all', filter: 'London' },
];

const GlobalSearchModal = ({ isOpen, onClose }) => {
  const navigate = useNavigate();
  const inputRef = useRef(null);
  const [query, setQuery] = useState('');
  const [activeFilter, setActiveFilter] = useState('all'); // 'all', 'casting', 'talent', 'studios'

  // Focus input when opened
  useEffect(() => {
    if (isOpen) {
      setTimeout(() => {
        inputRef.current?.focus();
      }, 50);
    } else {
      setQuery('');
      setActiveFilter('all');
    }
  }, [isOpen]);

  // Handle ESC key
  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (e) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  // Combine static and custom opportunities
  const allOpportunities = useMemo(() => {
    const custom = getCustomOpportunities() || [];
    return [...custom, ...mockOpportunities];
  }, []);

  // Filtered Results
  const searchResults = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) {
      return { opportunities: [], talent: [], studios: [] };
    }

    // 1. Opportunities & Casting Calls
    const opportunities = allOpportunities
      .filter((opp) => {
        const title = (opp.title || '').toLowerCase();
        const comp = (opp.productionCompany || '').toLowerCase();
        const role = (opp.roleDescription || opp.roleAppliedFor || '').toLowerCase();
        const cat = (opp.productionCategory || opp.category || '').toLowerCase();
        const loc = (opp.location || '').toLowerCase();
        return (
          title.includes(q) ||
          comp.includes(q) ||
          role.includes(q) ||
          cat.includes(q) ||
          loc.includes(q)
        );
      })
      .slice(0, 4);

    // 2. Talent & Artists
    const talent = mockTalentProfiles
      .filter((t) => {
        const name = (t.fullName || '').toLowerCase();
        const cat = (t.category || '').toLowerCase();
        const headline = (t.headline || '').toLowerCase();
        const loc = (t.location || '').toLowerCase();
        const skills = (t.skills || []).join(' ').toLowerCase();
        return (
          name.includes(q) ||
          cat.includes(q) ||
          headline.includes(q) ||
          loc.includes(q) ||
          skills.includes(q)
        );
      })
      .slice(0, 4);

    // 3. Studios & Production Companies
    const studioNames = new Set();
    const studios = [];
    allOpportunities.forEach((opp) => {
      const name = opp.productionCompany;
      if (name && !studioNames.has(name) && name.toLowerCase().includes(q)) {
        studioNames.add(name);
        studios.push({
          name,
          location: opp.location || 'Mumbai, India',
          activeCallsCount: allOpportunities.filter((o) => o.productionCompany === name).length,
        });
      }
    });

    return {
      opportunities,
      talent,
      studios: studios.slice(0, 3),
    };
  }, [query, allOpportunities]);

  const totalResultsCount =
    searchResults.opportunities.length +
    searchResults.talent.length +
    searchResults.studios.length;

  const handleSelectOpportunity = (opp) => {
    onClose();
    navigate(`/opportunities/${opp.id}`);
  };

  const handleSelectTalent = (t) => {
    onClose();
    navigate(`/talent?search=${encodeURIComponent(t.fullName)}`);
  };

  const handleSelectStudio = (studio) => {
    onClose();
    navigate(`/opportunities?search=${encodeURIComponent(studio.name)}`);
  };

  const handleFullSearch = (e) => {
    e?.preventDefault();
    if (!query.trim()) return;
    onClose();
    if (activeFilter === 'talent') {
      navigate(`/talent?search=${encodeURIComponent(query.trim())}`);
    } else {
      navigate(`/opportunities?search=${encodeURIComponent(query.trim())}`);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto p-4 sm:p-6 md:p-20 flex justify-center items-start animate-in fade-in duration-150">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/65 backdrop-blur-md transition-opacity"
        onClick={onClose}
      />

      {/* Modal Dialog */}
      <div className="relative w-full max-w-2xl bg-white rounded-3xl shadow-3d-floating border border-slate-200/80 specular-top overflow-hidden z-10 text-left">
        {/* Top Search Input Bar */}
        <form onSubmit={handleFullSearch} className="relative flex items-center border-b border-slate-100 p-4">
          <Search className="w-5 h-5 text-slate-400 absolute left-5 top-1/2 -translate-y-1/2 pointer-events-none" />
          <input
            ref={inputRef}
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search casting calls, talent, film stars, or production studios..."
            className="w-full pl-10 pr-20 py-2.5 text-sm sm:text-base text-slate-900 placeholder:text-slate-400 focus:outline-none bg-transparent"
          />

          <div className="absolute right-4 flex items-center gap-2">
            {query && (
              <button
                type="button"
                onClick={() => setQuery('')}
                className="p-1 text-slate-400 hover:text-slate-600 rounded-lg cursor-pointer"
                title="Clear input"
              >
                <X className="w-4 h-4" />
              </button>
            )}

            <button
              type="button"
              onClick={onClose}
              className="px-2 py-1 text-[11px] font-bold text-slate-400 hover:text-slate-700 bg-slate-100 rounded-lg cursor-pointer border border-slate-200 shadow-2xs"
            >
              ESC
            </button>
          </div>
        </form>

        {/* Quick Filter Pill Selector */}
        <div className="px-4 py-2.5 bg-slate-50/80 border-b border-slate-100 flex items-center gap-1.5 overflow-x-auto no-scrollbar text-xs">
          {[
            { id: 'all', label: 'All Results' },
            { id: 'casting', label: 'Casting Calls' },
            { id: 'talent', label: 'Talent & Performers' },
            { id: 'studios', label: 'Studios' },
          ].map((tab) => (
            <button
              key={tab.id}
              type="button"
              onClick={() => setActiveFilter(tab.id)}
              className={`px-3.5 py-1.5 rounded-full text-xs font-bold transition-all cursor-pointer whitespace-nowrap shadow-2xs ${
                activeFilter === tab.id
                  ? 'bg-brand-pink text-white shadow-3d-button-pink'
                  : 'bg-white text-slate-600 hover:text-slate-900 border border-slate-200/80 hover:border-slate-300'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Modal Body / Results */}
        <div className="max-h-[60vh] overflow-y-auto p-4 sm:p-5 space-y-5">
          {/* STATE 1: Empty Query - Show Trending & Shortcuts */}
          {!query.trim() && (
            <div className="space-y-4">
              <div>
                <span className="text-[10px] font-bold uppercase tracking-wider text-gray-400 block mb-2">
                  Popular &amp; Trending Searches
                </span>
                <div className="flex flex-wrap gap-2">
                  {TRENDING_SEARCHES.map((item, idx) => (
                    <button
                      key={idx}
                      type="button"
                      onClick={() => setQuery(item.filter)}
                      className="px-3 py-1.5 rounded-xl bg-gray-50 hover:bg-pink-50 hover:text-brand-pink text-xs font-semibold text-gray-700 border border-gray-200/80 transition-all flex items-center gap-1.5 cursor-pointer"
                    >
                      <Sparkles className="w-3 h-3 text-brand-pink" />
                      <span>{item.label}</span>
                    </button>
                  ))}
                </div>
              </div>

              <div className="pt-2 border-t border-gray-100 grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
                <button
                  type="button"
                  onClick={() => {
                    onClose();
                    navigate('/opportunities');
                  }}
                  className="p-3 rounded-2xl border border-gray-100 hover:border-gray-200 bg-gray-50/50 hover:bg-gray-50 transition-all text-left flex items-center justify-between group cursor-pointer"
                >
                  <div className="flex items-center gap-2.5">
                    <div className="w-8 h-8 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center">
                      <Briefcase className="w-4 h-4" />
                    </div>
                    <div>
                      <p className="font-bold text-gray-900">Browse All Casting Calls</p>
                      <p className="text-[11px] text-gray-500">500+ verified production roles</p>
                    </div>
                  </div>
                  <ArrowRight className="w-4 h-4 text-gray-400 group-hover:translate-x-0.5 transition-transform" />
                </button>

                <button
                  type="button"
                  onClick={() => {
                    onClose();
                    navigate('/talent');
                  }}
                  className="p-3 rounded-2xl border border-gray-100 hover:border-gray-200 bg-gray-50/50 hover:bg-gray-50 transition-all text-left flex items-center justify-between group cursor-pointer"
                >
                  <div className="flex items-center gap-2.5">
                    <div className="w-8 h-8 rounded-xl bg-pink-50 text-brand-pink flex items-center justify-center">
                      <Users className="w-4 h-4" />
                    </div>
                    <div>
                      <p className="font-bold text-gray-900">Discover Talent Roster</p>
                      <p className="text-[11px] text-gray-500">Film stars, dancers &amp; musicians</p>
                    </div>
                  </div>
                  <ArrowRight className="w-4 h-4 text-gray-400 group-hover:translate-x-0.5 transition-transform" />
                </button>
              </div>
            </div>
          )}

          {/* STATE 2: Query Typed & Results Found */}
          {query.trim() && totalResultsCount > 0 && (
            <div className="space-y-4">
              {/* Category: Opportunities */}
              {(activeFilter === 'all' || activeFilter === 'casting') &&
                searchResults.opportunities.length > 0 && (
                  <div className="space-y-2">
                    <span className="text-[10px] font-extrabold uppercase tracking-wider text-gray-400 flex items-center gap-1.5">
                      <Briefcase className="w-3.5 h-3.5" />
                      <span>Casting Calls &amp; Roles</span>
                    </span>

                    <div className="space-y-1.5">
                      {searchResults.opportunities.map((opp) => (
                        <button
                          key={opp.id}
                          type="button"
                          onClick={() => handleSelectOpportunity(opp)}
                          className="w-full p-2.5 sm:p-3 rounded-2xl hover:bg-pink-50/60 border border-transparent hover:border-pink-200/60 transition-all text-left flex items-center justify-between group cursor-pointer"
                        >
                          <div className="min-w-0 pr-2">
                            <h4 className="text-xs sm:text-sm font-bold text-gray-900 group-hover:text-brand-pink transition-colors truncate">
                              {opp.title}
                            </h4>
                            <p className="text-[11px] text-gray-500 truncate mt-0.5">
                              {opp.productionCompany} • {opp.location || 'Mumbai'}
                            </p>
                          </div>

                          <span className="px-2.5 py-1 rounded-full bg-gray-100 group-hover:bg-pink-100 text-[10px] font-bold text-gray-700 group-hover:text-brand-pink shrink-0 transition-colors">
                            View Role
                          </span>
                        </button>
                      ))}
                    </div>
                  </div>
                )}

              {/* Category: Talent */}
              {(activeFilter === 'all' || activeFilter === 'talent') &&
                searchResults.talent.length > 0 && (
                  <div className="space-y-2 pt-2 border-t border-gray-100">
                    <span className="text-[10px] font-extrabold uppercase tracking-wider text-gray-400 flex items-center gap-1.5">
                      <Users className="w-3.5 h-3.5" />
                      <span>Talent &amp; Artists</span>
                    </span>

                    <div className="space-y-1.5">
                      {searchResults.talent.map((t) => (
                        <button
                          key={t.id}
                          type="button"
                          onClick={() => handleSelectTalent(t)}
                          className="w-full p-2.5 sm:p-3 rounded-2xl hover:bg-pink-50/60 border border-transparent hover:border-pink-200/60 transition-all text-left flex items-center justify-between group cursor-pointer"
                        >
                          <div className="flex items-center gap-3 min-w-0 pr-2">
                            <img
                              src={t.avatar}
                              alt={t.fullName}
                              className="w-9 h-9 rounded-xl object-cover border border-gray-200 shrink-0"
                            />
                            <div className="min-w-0">
                              <div className="flex items-center gap-1.5">
                                <h4 className="text-xs sm:text-sm font-bold text-gray-900 group-hover:text-brand-pink transition-colors truncate">
                                  {t.fullName}
                                </h4>
                                {t.isFilmStar && (
                                  <span className="text-[10px] font-extrabold text-amber-900 bg-amber-200 px-1.5 py-0.2 rounded shrink-0">
                                    ★ STAR
                                  </span>
                                )}
                              </div>
                              <p className="text-[11px] text-gray-500 truncate mt-0.5">
                                {t.category} • {t.location}
                              </p>
                            </div>
                          </div>

                          <span className="px-2.5 py-1 rounded-full bg-gray-100 group-hover:bg-pink-100 text-[10px] font-bold text-gray-700 group-hover:text-brand-pink shrink-0 transition-colors">
                            Profile
                          </span>
                        </button>
                      ))}
                    </div>
                  </div>
                )}

              {/* Category: Production Companies */}
              {(activeFilter === 'all' || activeFilter === 'studios') &&
                searchResults.studios.length > 0 && (
                  <div className="space-y-2 pt-2 border-t border-gray-100">
                    <span className="text-[10px] font-extrabold uppercase tracking-wider text-gray-400 flex items-center gap-1.5">
                      <Building2 className="w-3.5 h-3.5" />
                      <span>Production Houses &amp; Studios</span>
                    </span>

                    <div className="space-y-1.5">
                      {searchResults.studios.map((st, idx) => (
                        <button
                          key={idx}
                          type="button"
                          onClick={() => handleSelectStudio(st)}
                          className="w-full p-2.5 sm:p-3 rounded-2xl hover:bg-pink-50/60 border border-transparent hover:border-pink-200/60 transition-all text-left flex items-center justify-between group cursor-pointer"
                        >
                          <div className="min-w-0 pr-2">
                            <h4 className="text-xs sm:text-sm font-bold text-gray-900 group-hover:text-brand-pink transition-colors truncate">
                              {st.name}
                            </h4>
                            <p className="text-[11px] text-gray-500 truncate mt-0.5">
                              {st.location} • {st.activeCallsCount} active casting call{st.activeCallsCount > 1 ? 's' : ''}
                            </p>
                          </div>

                          <span className="px-2.5 py-1 rounded-full bg-gray-100 group-hover:bg-pink-100 text-[10px] font-bold text-gray-700 group-hover:text-brand-pink shrink-0 transition-colors">
                            Casting Calls
                          </span>
                        </button>
                      ))}
                    </div>
                  </div>
                )}
            </div>
          )}

          {/* STATE 3: Query Typed but No Results Found */}
          {query.trim() && totalResultsCount === 0 && (
            <div className="py-8 text-center space-y-3">
              <div className="w-12 h-12 rounded-full bg-pink-50 text-brand-pink flex items-center justify-center mx-auto">
                <Search className="w-5 h-5" />
              </div>
              <div>
                <h4 className="text-sm font-bold text-gray-900">
                  No matching results for "{query}"
                </h4>
                <p className="text-xs text-gray-500 mt-1 max-w-sm mx-auto">
                  Try checking your spelling, using broader search terms, or explore our complete casting directory.
                </p>
              </div>
              <button
                type="button"
                onClick={handleFullSearch}
                className="px-4 py-2 rounded-xl bg-brand-pink hover:bg-rose-700 text-white text-xs font-bold transition-all shadow-xs cursor-pointer inline-flex items-center gap-1.5"
              >
                <span>Search in All Opportunities</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>
          )}
        </div>

        {/* Footer info bar */}
        <div className="px-4 py-2.5 bg-gray-50 border-t border-gray-100 flex items-center justify-between text-[11px] text-gray-400">
          <span>Tip: Press <kbd className="px-1.5 py-0.5 bg-white border border-gray-200 rounded font-mono text-[10px]">Ctrl</kbd> + <kbd className="px-1.5 py-0.5 bg-white border border-gray-200 rounded font-mono text-[10px]">K</kbd> anytime to open quick search</span>
          <button
            type="button"
            onClick={handleFullSearch}
            className="font-bold text-brand-pink hover:underline cursor-pointer"
          >
            Full Search &rarr;
          </button>
        </div>
      </div>
    </div>
  );
};

export default GlobalSearchModal;
