import React, { useState, useMemo } from 'react';
import {
  Clapperboard,
  Drama,
  Mic,
  Sparkles,
  Music,
  Camera,
  Activity,
  ChevronDown,
  Plus,
  X,
  Search,
  Check,
  Tag,
  HelpCircle,
} from 'lucide-react';
import { SKILL_CATEGORIES, ALL_PREDEFINED_SKILLS } from '../../data/skillsData';

const iconMap = {
  Clapperboard,
  Drama,
  Mic,
  Sparkles,
  Music,
  Camera,
  Activity,
};

const SkillDropdownPicker = ({
  selectedSkills = [],
  onAddSkill,
  onRemoveSkill,
  helperText = 'Choose performance skills from the dropdown or search to add them to your casting profile.',
}) => {
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [dropdownSkillValue, setDropdownSkillValue] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [customSkill, setCustomSkill] = useState('');
  const [showQuickPills, setShowQuickPills] = useState(true);

  // Available skills based on selected category filter
  const currentCategorySkills = useMemo(() => {
    if (selectedCategory === 'all') {
      return ALL_PREDEFINED_SKILLS;
    }
    const cat = SKILL_CATEGORIES.find((c) => c.id === selectedCategory);
    return cat ? cat.skills : [];
  }, [selectedCategory]);

  // Filtered skills for search dropdown / suggestions
  const searchResults = useMemo(() => {
    if (!searchQuery.trim()) return [];
    const q = searchQuery.toLowerCase();
    return ALL_PREDEFINED_SKILLS.filter((s) => s.toLowerCase().includes(q)).slice(0, 8);
  }, [searchQuery]);

  // Handle dropdown selection
  const handleDropdownSelect = (e) => {
    const val = e.target.value;
    if (val && !selectedSkills.includes(val)) {
      onAddSkill(val);
      setDropdownSkillValue('');
    }
  };

  // Handle custom skill addition
  const handleAddCustom = (e) => {
    e.preventDefault();
    const trimmed = customSkill.trim();
    if (trimmed && !selectedSkills.includes(trimmed)) {
      onAddSkill(trimmed);
      setCustomSkill('');
    }
  };

  // Popular quick-add recommendations that are not yet selected
  const popularRecommendations = useMemo(() => {
    const popularList = [
      'Method Acting',
      'Classical Text & Shakespeare',
      'British RP Accent',
      'General American Accent',
      'Contemporary Dance',
      'Musical Theatre Vocals',
      'Screen Combat & Stunt Falls',
      'Editorial Print',
      'Improvisation (Improv)',
      'Audiobook Narration',
      'Stage Movement & Laban',
      'Firearms Safety Trained (Tactical / Handgun)',
    ];
    return popularList.filter((s) => !selectedSkills.includes(s)).slice(0, 6);
  }, [selectedSkills]);

  return (
    <div className="space-y-4">
      {/* Helper Information */}
      <div className="flex items-start justify-between gap-2">
        <p className="text-xs text-brand-text-secondary leading-relaxed">
          {helperText}
        </p>
        <span className="text-[11px] font-bold px-2.5 py-1 rounded-full bg-brand-navy/5 text-brand-navy shrink-0 border border-brand-navy/10">
          {selectedSkills.length} Added
        </span>
      </div>

      {/* Main Dropdown Controls Box */}
      <div className="p-4 sm:p-5 rounded-2xl bg-gray-50/90 border border-brand-border space-y-4">
        {/* Row 1: Dropdown Selection Options */}
        <div className="grid grid-cols-1 md:grid-cols-12 gap-3 items-end">
          {/* Category Dropdown */}
          <div className="md:col-span-5 space-y-1.5 text-left">
            <label className="block text-xs font-semibold uppercase tracking-wider text-brand-navy">
              1. Choose Category
            </label>
            <div className="relative">
              <select
                value={selectedCategory}
                onChange={(e) => {
                  setSelectedCategory(e.target.value);
                  setDropdownSkillValue('');
                }}
                className="w-full pl-3.5 pr-10 py-2.5 bg-white border border-brand-border rounded-xl text-xs sm:text-sm text-brand-navy font-medium focus:outline-none focus:ring-2 focus:ring-black/20 appearance-none cursor-pointer hover:border-gray-400 transition-colors shadow-2xs"
              >
                <option value="all">⚡ All Categories ({ALL_PREDEFINED_SKILLS.length} Skills)</option>
                {SKILL_CATEGORIES.map((cat) => (
                  <option key={cat.id} value={cat.id}>
                    {cat.label} ({cat.skills.length})
                  </option>
                ))}
              </select>
              <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none text-gray-500">
                <ChevronDown className="w-4 h-4" />
              </div>
            </div>
          </div>

          {/* Skill Dropdown (Primary Dropdown Option) */}
          <div className="md:col-span-7 space-y-1.5 text-left">
            <label className="block text-xs font-semibold uppercase tracking-wider text-brand-navy flex items-center justify-between">
              <span>2. Select Skill From Dropdown</span>
              <span className="text-[10px] text-gray-400 font-normal">Click to add instantly</span>
            </label>
            <div className="relative">
              <select
                value={dropdownSkillValue}
                onChange={handleDropdownSelect}
                className="w-full pl-3.5 pr-10 py-2.5 bg-white border border-brand-border rounded-xl text-xs sm:text-sm text-brand-navy font-medium focus:outline-none focus:ring-2 focus:ring-black/20 appearance-none cursor-pointer hover:border-gray-400 transition-colors shadow-2xs"
              >
                <option value="" disabled>
                  -- Select a skill to add to profile --
                </option>
                {selectedCategory === 'all' ? (
                  // Grouped by Category in Optgroups
                  SKILL_CATEGORIES.map((cat) => (
                    <optgroup key={cat.id} label={`--- ${cat.label} ---`}>
                      {cat.skills.map((sk) => {
                        const isAdded = selectedSkills.includes(sk);
                        return (
                          <option key={sk} value={sk} disabled={isAdded}>
                            {isAdded ? `✓ ${sk} (Already Added)` : `+ ${sk}`}
                          </option>
                        );
                      })}
                    </optgroup>
                  ))
                ) : (
                  // Single Category list
                  currentCategorySkills.map((sk) => {
                    const isAdded = selectedSkills.includes(sk);
                    return (
                      <option key={sk} value={sk} disabled={isAdded}>
                        {isAdded ? `✓ ${sk} (Already Added)` : `+ ${sk}`}
                      </option>
                    );
                  })
                )}
              </select>
              <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none text-gray-500">
                <ChevronDown className="w-4 h-4" />
              </div>
            </div>
          </div>
        </div>

        {/* Row 2: Search Autocomplete or Custom Skill */}
        <div className="pt-3 border-t border-gray-200/70 grid grid-cols-1 md:grid-cols-2 gap-3">
          {/* Quick Search with Dropdown Suggestion Results */}
          <div className="space-y-1.5 text-left relative">
            <label className="block text-[11px] font-semibold uppercase tracking-wider text-gray-500">
              Or Search Skills by Keyword
            </label>
            <div className="relative">
              <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                placeholder="Type to filter e.g. 'Accent', 'Voice', 'Combat'..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-9 pr-8 py-2 bg-white border border-brand-border rounded-xl text-xs text-brand-navy focus:outline-none focus:ring-2 focus:ring-black/20 shadow-2xs"
              />
              {searchQuery && (
                <button
                  type="button"
                  onClick={() => setSearchQuery('')}
                  className="absolute right-2.5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-black"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              )}
            </div>

            {/* Live Search Results Dropdown List */}
            {searchQuery.trim() && (
              <div className="absolute left-0 right-0 top-full mt-1.5 z-20 bg-white border border-brand-border rounded-xl shadow-lg p-2 max-h-48 overflow-y-auto space-y-1">
                {searchResults.length > 0 ? (
                  searchResults.map((sk) => {
                    const isAdded = selectedSkills.includes(sk);
                    return (
                      <button
                        key={sk}
                        type="button"
                        disabled={isAdded}
                        onClick={() => {
                          if (!isAdded) {
                            onAddSkill(sk);
                            setSearchQuery('');
                          }
                        }}
                        className={`w-full text-left px-3 py-1.5 rounded-lg text-xs flex items-center justify-between transition-colors ${
                          isAdded
                            ? 'bg-gray-50 text-gray-400 cursor-not-allowed'
                            : 'hover:bg-gray-100 text-brand-navy font-medium'
                        }`}
                      >
                        <span>{sk}</span>
                        {isAdded ? (
                          <span className="text-[10px] text-gray-400 flex items-center gap-1">
                            <Check className="w-3 h-3 text-emerald-500" /> Added
                          </span>
                        ) : (
                          <span className="text-[10px] font-bold text-brand-navy bg-gray-200/70 px-2 py-0.5 rounded">
                            + Add
                          </span>
                        )}
                      </button>
                    );
                  })
                ) : (
                  <div className="p-2 text-center text-xs text-gray-500">
                    No matching predefined skill. You can add it as a custom skill on the right!
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Add Custom Skill Option */}
          <div className="space-y-1.5 text-left">
            <label className="block text-[11px] font-semibold uppercase tracking-wider text-gray-500">
              Can't find your skill? Add Custom Tag
            </label>
            <div className="flex gap-2">
              <input
                type="text"
                placeholder="e.g. Scuba Diving, Mime, Opera..."
                value={customSkill}
                onChange={(e) => setCustomSkill(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    e.preventDefault();
                    handleAddCustom(e);
                  }
                }}
                className="flex-1 px-3.5 py-2 bg-white border border-brand-border rounded-xl text-xs text-brand-navy focus:outline-none focus:ring-2 focus:ring-black/20 shadow-2xs"
              />
              <button
                type="button"
                onClick={handleAddCustom}
                disabled={!customSkill.trim()}
                className="px-4 py-2 bg-brand-navy hover:opacity-90 disabled:opacity-40 text-white font-bold text-xs rounded-xl flex items-center gap-1 transition-opacity shadow-2xs shrink-0"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Add</span>
              </button>
            </div>
          </div>
        </div>

        {/* Row 3: Quick Add Popular Suggestions */}
        {popularRecommendations.length > 0 && (
          <div className="pt-2 text-left">
            <div className="flex items-center gap-1.5 mb-1.5">
              <Sparkles className="w-3.5 h-3.5 text-amber-500" />
              <span className="text-[11px] font-bold uppercase tracking-wider text-gray-500">
                Popular Casting Suggestions (1-Click Add):
              </span>
            </div>
            <div className="flex flex-wrap gap-1.5">
              {popularRecommendations.map((popSkill) => (
                <button
                  key={popSkill}
                  type="button"
                  onClick={() => onAddSkill(popSkill)}
                  className="px-2.5 py-1 rounded-lg bg-white border border-gray-200 text-[11px] text-brand-navy hover:border-brand-navy hover:bg-gray-100/60 font-medium transition-all shadow-2xs flex items-center gap-1"
                >
                  <Plus className="w-3 h-3 text-gray-400" />
                  <span>{popSkill}</span>
                </button>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Selected Skills Pills Display */}
      <div className="space-y-2 text-left">
        <div className="flex items-center justify-between">
          <label className="block text-xs font-semibold uppercase tracking-wider text-brand-navy">
            Selected Profile Skills ({selectedSkills.length})
          </label>
          {selectedSkills.length > 0 && (
            <span className="text-[11px] text-gray-400">
              Click '×' on any skill tag to remove it
            </span>
          )}
        </div>

        {selectedSkills.length === 0 ? (
          <div className="p-4 rounded-xl border border-dashed border-gray-300 text-center text-xs text-gray-500 bg-gray-50/50">
            No skills added yet. Use the dropdown above to add your acting, vocal, or athletic disciplines!
          </div>
        ) : (
          <div className="flex flex-wrap gap-2 p-3 rounded-2xl bg-white border border-gray-200 shadow-2xs min-h-[50px] items-center">
            {selectedSkills.map((sk) => (
              <span
                key={sk}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-brand-navy text-white text-xs font-semibold shadow-xs animate-in fade-in zoom-in-95 duration-150"
              >
                <span>{sk}</span>
                <button
                  type="button"
                  onClick={() => onRemoveSkill(sk)}
                  className="p-0.5 hover:bg-white/20 rounded-full transition-colors text-white/80 hover:text-white"
                  title={`Remove ${sk}`}
                  aria-label={`Remove ${sk}`}
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              </span>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default SkillDropdownPicker;
