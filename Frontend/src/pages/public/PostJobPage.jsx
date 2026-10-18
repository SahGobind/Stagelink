import React, { useState, useRef, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import {
  ArrowLeft,
  ChevronDown,
  Calendar,
  Lock,
  ArrowRight,
  ShieldCheck,
  Users,
  Check,
  AlertCircle,
  Loader2,
  X,
} from 'lucide-react';
import PageContainer from '../../components/layout/PageContainer';
import Toast from '../../components/common/Toast';
import { useAuth } from '../../context/AuthContext';
import { setPendingOpportunity } from '../../utils/paymentAccess';

const PRODUCTION_CATEGORIES = [
  'Film & TV',
  'Advertising',
  'Modeling',
  'Music',
  'Theatre',
  'Digital Content',
  'Voice-over',
  'Other',
];

// Dynamic options mapped to selected production category
const CATEGORY_JOB_TYPES = {
  'Film & TV': [
    'Feature Film',
    'Short Film',
    'TV Series / Drama',
    'Web Series / OTT Original',
    'Documentary',
    'Pilot Episode',
    'Other',
  ],
  Advertising: [
    'Commercial Campaign',
    'TV Commercial (TVC)',
    'Digital / Social Media Ad',
    'Print & Billboard Ad',
    'Brand Ambassador Shoot',
    'Other',
  ],
  Modeling: [
    'Fashion Runway',
    'Editorial / Magazine Shoot',
    'Lookbook & Catalog',
    'Commercial Print',
    'Fit Modeling',
    'Other',
  ],
  Music: [
    'Music Video',
    'Live Concert / Tour',
    'Album Visualizer / Cover',
    'Musical Performance',
    'Other',
  ],
  Theatre: [
    'Theatrical Play',
    'Musical Theatre',
    'Broadway / West End',
    'Opera',
    'Dance Theatre',
    'Other',
  ],
  'Digital Content': [
    'YouTube Web Series',
    'Creator Collaboration',
    'Social Media Campaign',
    'Podcast / Video Talk Show',
    'VR / AR Interactive Experience',
    'Other',
  ],
  'Voice-over': [
    'Animation Character',
    'Audiobook Narration',
    'Commercial VO',
    'Video Game Dubbing',
    'Documentary Narration',
    'Other',
  ],
  Other: [
    'Specialized Performance',
    'Corporate Film',
    'Live Event Performance',
    'Other Production',
    'Other',
  ],
};

const TALENT_CHIPS = [
  'Actors',
  'Models',
  'Dancers',
  'Musicians',
  'Creators / Influencers',
  'Children / Families',
  'Athletes',
  'Specialized Talent',
  'Other',
];

const PostJobPage = () => {
  const navigate = useNavigate();
  const { user } = useAuth();

  // Prefill from authenticated company profile if available
  const defaultCompany =
    user?.companyName ||
    (user?.role === 'admin' ? 'StageLink Studios' : '') ||
    'Your production company';

  const [productionCompany, setProductionCompany] = useState(defaultCompany);
  const [productionCategory, setProductionCategory] = useState('Film & TV');
  const [otherCategoryText, setOtherCategoryText] = useState('');
  const [productionType, setProductionType] = useState('Feature Film');
  const [otherProductionTypeText, setOtherProductionTypeText] = useState('');

  const [selectedTalents, setSelectedTalents] = useState(['Actors']);
  const [otherTalentText, setOtherTalentText] = useState('');
  const [isTalentDropdownOpen, setIsTalentDropdownOpen] = useState(false);
  const talentDropdownRef = useRef(null);
  const otherTalentInputRef = useRef(null);

  // Close talent dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (talentDropdownRef.current && !talentDropdownRef.current.contains(e.target)) {
        setIsTalentDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Shoot date & location are NOT mandatory
  const [shootDate, setShootDate] = useState('');
  const [location, setLocation] = useState('');
  const [artistsNeeded, setArtistsNeeded] = useState(5);
  const [requirements, setRequirements] = useState('');

  // UI state
  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [toastMessage, setToastMessage] = useState('');

  // When production category changes, auto-select the first job type for that category
  const handleCategoryChange = (e) => {
    const cat = e.target.value;
    setProductionCategory(cat);
    const availableTypes = CATEGORY_JOB_TYPES[cat] || ['Other'];
    setProductionType(availableTypes[0]);
    if (errors.productionCategory) {
      setErrors((prev) => ({ ...prev, productionCategory: undefined }));
    }
  };

  const toggleTalentChip = (talent) => {
    let updated;
    const isAddingOther = talent === 'Other' && !selectedTalents.includes('Other');
    if (selectedTalents.includes(talent)) {
      updated = selectedTalents.filter((t) => t !== talent);
    } else {
      updated = [...selectedTalents, talent];
    }
    setSelectedTalents(updated);
    if (errors.talents && updated.length > 0) {
      setErrors((prev) => ({ ...prev, talents: undefined }));
    }

    // When "Other" is selected, automatically focus the writing box
    if (isAddingOther) {
      setTimeout(() => {
        otherTalentInputRef.current?.focus();
      }, 120);
    }
  };

  const validate = () => {
    const newErrors = {};

    if (!productionCompany.trim() || productionCompany === 'Your production company') {
      newErrors.productionCompany = 'Production company name is required.';
    }
    if (!productionCategory) {
      newErrors.productionCategory = 'Production category is required.';
    }
    if (productionCategory === 'Other' && !otherCategoryText.trim()) {
      newErrors.otherCategory = 'Please specify the other production category.';
    }

    if (!productionType) {
      newErrors.productionType = 'Job / production type is required.';
    }
    if (productionType === 'Other' && !otherProductionTypeText.trim()) {
      newErrors.otherProductionType = 'Please specify the other job / production type.';
    }

    if (selectedTalents.length === 0) {
      newErrors.talents = 'Select at least one talent needed.';
    }
    if (selectedTalents.includes('Other') && !otherTalentText.trim()) {
      newErrors.otherTalent = 'Please specify the other talent needed.';
    }

    // Shoot date & location are NOT mandatory!
    if (!artistsNeeded || Number(artistsNeeded) < 1 || !Number.isInteger(Number(artistsNeeded))) {
      newErrors.artistsNeeded = 'Artists needed must be a positive integer.';
    }
    if (requirements.length > 500) {
      newErrors.requirements = 'Requirements must not exceed 500 characters.';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validate()) {
      setToastMessage('Please complete all required fields.');
      return;
    }

    setIsSubmitting(true);

    const finalTalents = selectedTalents.map((t) =>
      t === 'Other' && otherTalentText.trim() ? `Other (${otherTalentText.trim()})` : t
    );
    const finalCategory =
      productionCategory === 'Other' && otherCategoryText.trim()
        ? `Other: ${otherCategoryText.trim()}`
        : productionCategory;
    const finalProductionType =
      productionType === 'Other' && otherProductionTypeText.trim()
        ? `Other: ${otherProductionTypeText.trim()}`
        : productionType;

    const newOpportunity = {
      id: `opp-${Date.now()}`,
      refId: `PRD-${Math.floor(100000 + Math.random() * 900000)}`,
      title: `${productionCompany.trim()} — ${finalProductionType}`,
      productionCompany: productionCompany.trim(),
      productionCategory: finalCategory,
      productionType: finalProductionType,
      talentNeeded: finalTalents,
      shootDate: shootDate ? shootDate : 'Flexible / To be decided',
      location: location.trim() ? location.trim() : 'Open / Unspecified',
      artistsNeeded: Number(artistsNeeded) || 1,
      requirements: requirements.trim(),
      listingFee: 1999,
      currency: 'INR',
      status: 'pending_payment',
      listingStatus: 'pending_payment',
      paymentStatus: 'pending',
      companyId: user?.id || 'comp-default',
      customerEmail: user?.email || 'recruiter@stagelink.in',
      customerPhone: user?.phoneNumber || '9876543210',
    };

    // Store in pending session so payment page has immediate access
    setPendingOpportunity(newOpportunity);

    // Call backend order initializer if active
    try {
      fetch('/api/opportunities/create-order', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newOpportunity),
      })
        .then((res) => res.json())
        .then((data) => {
          if (data?.orderId) {
            newOpportunity.paymentOrderId = data.orderId;
            setPendingOpportunity(newOpportunity);
          }
        })
        .catch(() => {});
    } catch {
      // offline fallback
    }

    setIsSubmitting(false);

    // Navigate to dedicated separate payment page!
    navigate('/payment', { state: { opportunity: newOpportunity } });
  };

  return (
    <div className="bg-white min-h-screen text-gray-900 font-sans pb-24 pt-4 sm:pt-6 text-left">
      <PageContainer maxWidth="6xl" className="space-y-6 px-4 sm:px-6">
        {/* Back Button */}
        <div>
          <button
            type="button"
            onClick={() => navigate(-1)}
            className="inline-flex items-center gap-1.5 text-xs font-semibold text-gray-600 hover:text-gray-900 transition-colors"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Back</span>
          </button>
        </div>

        {/* Heading Header */}
        <div className="space-y-1">
          <h1 className="text-2xl sm:text-3xl font-bold font-serif tracking-tight text-gray-900">
            Announce Work
          </h1>
          <p className="text-xs sm:text-sm text-gray-500 font-normal">
            Post a production requirement for talents to discover and apply.
          </p>
        </div>

        {/* Clean Centered Single-Column Form */}
        <div className="max-w-3xl mx-auto pt-2">
          <div className="bg-white rounded-3xl p-6 sm:p-9 border border-gray-100 shadow-xs">
            <form onSubmit={handleSubmit} className="space-y-5">
              {/* 1. Production Company */}
              <div className="space-y-1.5">
                <label className="block text-xs font-bold text-gray-800">
                  Production company <span className="text-brand-pink">*</span>
                </label>
                <input
                  type="text"
                  value={productionCompany}
                  onChange={(e) => {
                    setProductionCompany(e.target.value);
                    if (errors.productionCompany) {
                      setErrors((prev) => ({ ...prev, productionCompany: undefined }));
                    }
                  }}
                  placeholder="Your production company"
                  className="w-full px-4 py-2.5 bg-white border border-gray-200 rounded-xl text-xs sm:text-sm text-gray-900 placeholder-gray-400 focus:outline-none focus:border-brand-pink focus:ring-2 focus:ring-pink-100 transition-all"
                />
                {errors.productionCompany && (
                  <p className="text-[11px] text-red-600 font-medium flex items-center gap-1">
                    <AlertCircle className="w-3 h-3" />
                    <span>{errors.productionCompany}</span>
                  </p>
                )}
              </div>

              {/* 2. Production Category */}
              <div className="space-y-1.5">
                <label className="block text-xs font-bold text-gray-800">
                  Production category <span className="text-brand-pink">*</span>
                </label>
                <div className="relative">
                  <select
                    value={productionCategory}
                    onChange={handleCategoryChange}
                    className="w-full px-4 py-2.5 bg-white border border-gray-200 rounded-xl text-xs sm:text-sm text-gray-900 appearance-none pr-10 focus:outline-none focus:border-brand-pink focus:ring-2 focus:ring-pink-100 cursor-pointer"
                  >
                    {PRODUCTION_CATEGORIES.map((cat) => (
                      <option key={cat} value={cat}>
                        {cat}
                      </option>
                    ))}
                  </select>
                  <ChevronDown className="w-4 h-4 text-gray-500 absolute right-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                </div>
                {errors.productionCategory && (
                  <p className="text-[11px] text-red-600 font-medium">{errors.productionCategory}</p>
                )}

                {/* Conditional Writing Box if Category is Other */}
                {productionCategory === 'Other' && (
                  <div className="pt-1.5 animate-in fade-in duration-200">
                    <input
                      type="text"
                      value={otherCategoryText}
                      onChange={(e) => {
                        setOtherCategoryText(e.target.value);
                        if (errors.otherCategory) {
                          setErrors((prev) => ({ ...prev, otherCategory: undefined }));
                        }
                      }}
                      placeholder="Specify your production category..."
                      className="w-full px-4 py-2.5 bg-white border border-gray-200 rounded-xl text-xs text-gray-900 placeholder-gray-400 focus:outline-none focus:border-brand-pink focus:ring-2 focus:ring-pink-100"
                    />
                    {errors.otherCategory && (
                      <p className="text-[11px] text-red-600 font-medium pt-1">{errors.otherCategory}</p>
                    )}
                  </div>
                )}
              </div>

              {/* 3. Job / Production Type (Dynamic to Category) */}
              <div className="space-y-1.5">
                <label className="block text-xs font-bold text-gray-800">
                  Job / production type <span className="text-brand-pink">*</span>
                </label>
                <div className="relative">
                  <select
                    value={productionType}
                    onChange={(e) => {
                      setProductionType(e.target.value);
                      if (errors.productionType) {
                        setErrors((prev) => ({ ...prev, productionType: undefined }));
                      }
                    }}
                    className="w-full px-4 py-2.5 bg-white border border-gray-200 rounded-xl text-xs sm:text-sm text-gray-900 appearance-none pr-10 focus:outline-none focus:border-brand-pink focus:ring-2 focus:ring-pink-100 cursor-pointer"
                  >
                    {(CATEGORY_JOB_TYPES[productionCategory] || ['Other']).map((type) => (
                      <option key={type} value={type}>
                        {type}
                      </option>
                    ))}
                  </select>
                  <ChevronDown className="w-4 h-4 text-gray-500 absolute right-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                </div>
                {errors.productionType && (
                  <p className="text-[11px] text-red-600 font-medium">{errors.productionType}</p>
                )}

                {/* Conditional Writing Box if Production Type is Other */}
                {productionType === 'Other' && (
                  <div className="pt-1.5 animate-in fade-in duration-200">
                    <input
                      type="text"
                      value={otherProductionTypeText}
                      onChange={(e) => {
                        setOtherProductionTypeText(e.target.value);
                        if (errors.otherProductionType) {
                          setErrors((prev) => ({ ...prev, otherProductionType: undefined }));
                        }
                      }}
                      placeholder="Specify your production / job type..."
                      className="w-full px-4 py-2.5 bg-white border border-gray-200 rounded-xl text-xs text-gray-900 placeholder-gray-400 focus:outline-none focus:border-brand-pink focus:ring-2 focus:ring-pink-100"
                    />
                    {errors.otherProductionType && (
                      <p className="text-[11px] text-red-600 font-medium pt-1">{errors.otherProductionType}</p>
                    )}
                  </div>
                )}
              </div>

              {/* 4. Talent Needed (Dropdown Option + Writing Box on Other + Checkbox Chips) */}
              <div className="space-y-2.5">
                <div className="flex justify-between items-center">
                  <label className="block text-xs font-bold text-gray-800">
                    Talent needed <span className="text-brand-pink">*</span>
                  </label>
                  <span className="text-[11px] text-gray-400 font-medium">
                    {selectedTalents.length} selected
                  </span>
                </div>

                {/* Primary Dropdown Option */}
                <div ref={talentDropdownRef} className="relative">
                  <button
                    type="button"
                    onClick={() => setIsTalentDropdownOpen((prev) => !prev)}
                    className={`w-full px-4 py-2.5 bg-white border rounded-xl text-xs sm:text-sm text-left flex items-center justify-between transition-all cursor-pointer ${
                      isTalentDropdownOpen
                        ? 'border-brand-pink ring-2 ring-pink-100'
                        : 'border-gray-200 hover:border-gray-300'
                    }`}
                    aria-haspopup="listbox"
                    aria-expanded={isTalentDropdownOpen}
                  >
                    <span
                      className={`truncate pr-2 ${
                        selectedTalents.length === 0 ? 'text-gray-400' : 'text-gray-900 font-medium'
                      }`}
                    >
                      {selectedTalents.length === 0
                        ? 'Select talent needed from dropdown...'
                        : selectedTalents.join(', ')}
                    </span>
                    <ChevronDown
                      className={`w-4 h-4 text-gray-500 shrink-0 transition-transform duration-200 ${
                        isTalentDropdownOpen ? 'rotate-180 text-brand-pink' : ''
                      }`}
                    />
                  </button>

                  {/* Dropdown Menu Options */}
                  {isTalentDropdownOpen && (
                    <div className="absolute z-30 left-0 right-0 mt-1.5 bg-white border border-gray-200 rounded-xl shadow-xl py-1.5 max-h-64 overflow-y-auto animate-in fade-in zoom-in-95 duration-150">
                      <div className="px-3 py-1.5 border-b border-gray-100 flex items-center justify-between text-[11px] text-gray-500">
                        <span>Click an option to select / unselect</span>
                        <span className="text-pink-600 font-semibold">{selectedTalents.length} selected</span>
                      </div>
                      {TALENT_CHIPS.map((talent) => {
                        const isSelected = selectedTalents.includes(talent);
                        return (
                          <button
                            key={talent}
                            type="button"
                            onClick={() => toggleTalentChip(talent)}
                            className={`w-full px-4 py-2 text-left text-xs sm:text-sm flex items-center justify-between transition-colors cursor-pointer ${
                              isSelected
                                ? 'bg-pink-50/80 text-brand-pink font-semibold'
                                : 'text-gray-700 hover:bg-gray-50'
                            }`}
                          >
                            <div className="flex items-center gap-2.5">
                              <span
                                className={`w-4 h-4 rounded border flex items-center justify-center transition-colors ${
                                  isSelected
                                    ? 'bg-brand-pink border-brand-pink text-white'
                                    : 'border-gray-300 bg-white'
                                }`}
                              >
                                {isSelected && <Check className="w-3 h-3 stroke-[3]" />}
                              </span>
                              <span>{talent}</span>
                            </div>
                            {talent === 'Other' && (
                              <span className="text-[10px] text-pink-600 font-medium bg-pink-100/70 px-2 py-0.5 rounded-full">
                                {isSelected ? 'Writing box open' : 'Opens writing box'}
                              </span>
                            )}
                          </button>
                        );
                      })}
                    </div>
                  )}
                </div>

                {/* Selected Talent Tags */}
                {selectedTalents.length > 0 && (
                  <div className="flex flex-wrap gap-1.5 pt-0.5">
                    {selectedTalents.map((talent) => (
                      <span
                        key={talent}
                        className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-medium bg-pink-50/80 text-gray-800 border border-pink-200/80"
                      >
                        <span>{talent}</span>
                        <button
                          type="button"
                          onClick={() => toggleTalentChip(talent)}
                          className="text-gray-400 hover:text-brand-pink p-0.5 rounded cursor-pointer"
                          title={`Remove ${talent}`}
                          aria-label={`Remove ${talent}`}
                        >
                          <X className="w-3 h-3" />
                        </button>
                      </span>
                    ))}
                  </div>
                )}

                {/* Visual Checkbox Chips (matches reference design) */}
                <div className="flex flex-wrap gap-2 pt-1">
                  {TALENT_CHIPS.map((talent) => {
                    const isSelected = selectedTalents.includes(talent);
                    return (
                      <button
                        key={talent}
                        type="button"
                        onClick={() => toggleTalentChip(talent)}
                        className={`inline-flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-semibold transition-all border cursor-pointer ${
                          isSelected
                            ? 'bg-pink-50 border-brand-pink text-gray-900 shadow-2xs'
                            : 'bg-white border-gray-200 text-gray-600 hover:border-gray-300'
                        }`}
                      >
                        <span
                          className={`w-4 h-4 rounded flex items-center justify-center transition-colors ${
                            isSelected ? 'bg-brand-pink text-white' : 'border border-gray-300 bg-white'
                          }`}
                        >
                          {isSelected && <Check className="w-3 h-3 stroke-[3]" />}
                        </span>
                        <span>{talent}</span>
                      </button>
                    );
                  })}
                </div>

                {errors.talents && (
                  <p className="text-[11px] text-red-600 font-medium">{errors.talents}</p>
                )}

                {/* Writing Box: Opens when "Other" option is clicked / selected */}
                {selectedTalents.includes('Other') && (
                  <div className="p-3.5 rounded-2xl bg-pink-50/70 border border-pink-200/90 shadow-2xs space-y-2 animate-in fade-in slide-in-from-top-1 duration-200">
                    <div className="flex items-center justify-between">
                      <label className="block text-xs font-bold text-gray-900">
                        Specify other talent needed <span className="text-brand-pink">*</span>
                      </label>
                      <span className="text-[10px] text-pink-600 font-semibold bg-pink-100/70 px-2 py-0.5 rounded-full">
                        Writing Box
                      </span>
                    </div>
                    <input
                      ref={otherTalentInputRef}
                      type="text"
                      value={otherTalentText}
                      onChange={(e) => {
                        setOtherTalentText(e.target.value);
                        if (errors.otherTalent) {
                          setErrors((prev) => ({ ...prev, otherTalent: undefined }));
                        }
                      }}
                      placeholder="e.g. Martial artists, Stunt performers, Contortionists, Circus artists, Puppeteers..."
                      className="w-full px-3.5 py-2.5 bg-white border border-gray-200 rounded-xl text-xs sm:text-sm text-gray-900 placeholder-gray-400 focus:outline-none focus:border-brand-pink focus:ring-2 focus:ring-pink-100 transition-all shadow-2xs"
                    />
                    {errors.otherTalent && (
                      <p className="text-[11px] text-red-600 font-medium pt-0.5">{errors.otherTalent}</p>
                    )}
                  </div>
                )}
              </div>              {/* 5. Shoot Date (Optional) */}
              <div className="space-y-1.5">
                <label className="block text-xs font-bold text-gray-800">
                  Shoot date <span className="text-gray-400 font-normal">(Optional)</span>
                </label>
                <div className="relative">
                  <input
                    type="date"
                    value={shootDate}
                    onChange={(e) => {
                      setShootDate(e.target.value);
                      if (errors.shootDate) {
                        setErrors((prev) => ({ ...prev, shootDate: undefined }));
                      }
                    }}
                    className="w-full px-4 py-2.5 bg-white border border-gray-200 rounded-xl text-xs sm:text-sm text-gray-900 focus:outline-none focus:border-brand-pink focus:ring-2 focus:ring-pink-100 transition-all cursor-pointer"
                  />
                </div>
                {errors.shootDate && (
                  <p className="text-[11px] text-red-600 font-medium">{errors.shootDate}</p>
                )}
              </div>

              {/* 6. Location (Optional) */}
              <div className="space-y-1.5">
                <label className="block text-xs font-bold text-gray-800">
                  Location <span className="text-gray-400 font-normal">(Optional)</span>
                </label>
                <input
                  type="text"
                  value={location}
                  onChange={(e) => {
                    setLocation(e.target.value);
                    if (errors.location) {
                      setErrors((prev) => ({ ...prev, location: undefined }));
                    }
                  }}
                  placeholder="Enter location (city, state, country - optional)"
                  className="w-full px-4 py-2.5 bg-white border border-gray-200 rounded-xl text-xs sm:text-sm text-gray-900 placeholder-gray-400 focus:outline-none focus:border-brand-pink focus:ring-2 focus:ring-pink-100 transition-all"
                />
                {errors.location && (
                  <p className="text-[11px] text-red-600 font-medium">{errors.location}</p>
                )}
              </div>

              {/* 7. Artists Needed */}
              <div className="space-y-1.5">
                <label className="block text-xs font-bold text-gray-800">
                  Artists needed <span className="text-brand-pink">*</span>
                </label>
                <input
                  type="number"
                  min="1"
                  value={artistsNeeded}
                  onChange={(e) => {
                    setArtistsNeeded(e.target.value);
                    if (errors.artistsNeeded) {
                      setErrors((prev) => ({ ...prev, artistsNeeded: undefined }));
                    }
                  }}
                  placeholder="e.g. 5"
                  className="w-full px-4 py-2.5 bg-white border border-gray-200 rounded-xl text-xs sm:text-sm text-gray-900 focus:outline-none focus:border-brand-pink focus:ring-2 focus:ring-pink-100 transition-all"
                />
                {errors.artistsNeeded && (
                  <p className="text-[11px] text-red-600 font-medium">{errors.artistsNeeded}</p>
                )}
              </div>

              {/* 8. Requirements (Optional Multiline 500 chars limit) */}
              <div className="space-y-1.5">
                <div className="flex justify-between items-center">
                  <label className="block text-xs font-bold text-gray-800">
                    Requirements <span className="text-gray-400 font-normal">(Optional)</span>
                  </label>
                  <span
                    className={`text-[11px] font-medium ${
                      requirements.length > 500 ? 'text-red-500' : 'text-gray-400'
                    }`}
                  >
                    {requirements.length}/500
                  </span>
                </div>
                <textarea
                  rows={3}
                  maxLength={500}
                  value={requirements}
                  onChange={(e) => setRequirements(e.target.value)}
                  placeholder="Age range, language, skills, wardrobe, etc."
                  className="w-full px-4 py-2.5 bg-white border border-gray-200 rounded-xl text-xs sm:text-sm text-gray-900 placeholder-gray-400 focus:outline-none focus:border-brand-pink focus:ring-2 focus:ring-pink-100 transition-all resize-none"
                />
              </div>

              {/* 9. Action Button: Continue to Payment */}
              <div className="pt-3">
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full py-4 px-6 rounded-2xl bg-brand-pink hover:bg-rose-700 text-white text-sm sm:text-base font-bold shadow-md hover:shadow-lg transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-70 disabled:cursor-not-allowed"
                >
                  {isSubmitting ? (
                    <>
                      <Loader2 className="w-5 h-5 animate-spin" />
                      <span>Preparing Payment Gateway...</span>
                    </>
                  ) : (
                    <>
                      <span>Next</span>
                      <ArrowRight className="w-4 h-4" />
                    </>
                  )}
                </button>
              </div>

              {/* Helper text */}
              <p className="text-center text-xs text-gray-500 font-medium flex items-center justify-center gap-1.5 pt-1">
                <ShieldCheck className="w-3.5 h-3.5 text-brand-pink" />
                <span>Publishing requires payment via JuicePay Credit Card or PayPal. Candidate profiles unlock after payment.</span>
              </p>
            </form>
          </div>
        </div>

        <Toast message={toastMessage} onClose={() => setToastMessage('')} />
      </PageContainer>
    </div>
  );
};

export default PostJobPage;
