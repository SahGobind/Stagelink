import React, { useState, useRef, useEffect } from 'react';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import {
  ArrowLeft,
  ChevronDown,
  Check,
  X,
  Search,
  Calendar,
  ShieldCheck,
  Sparkles,
  Loader2,
  DollarSign,
  Info,
} from 'lucide-react';
import Toast from '../../components/common/Toast';
import BackButton from '../../components/common/BackButton';
import { useAuth } from '../../context/AuthContext';
import { saveCustomOpportunity, setPostingPaymentCompleted } from '../../utils/paymentAccess';
import { apiRequest } from '../../services/api';
import { getCategoryFallbackImage } from '../../utils/opportunityImageHelper';

export const ALL_JOB_PRODUCTION_TYPES = [
  'Feature Film',
  'Short Film',
  'TV Series',
  'Streaming / OTT Production',
  'Documentary',
  'Reality TV',
  'Music Video',
  'TV Commercial',
  'Online Video Advertisement',
  'Social Media Advertisement',
  'Brand Campaign',
  'Fashion Shoot',
  'Catalogue / E-commerce Shoot',
  'Lifestyle Shoot',
  'Beauty Campaign',
  'Fitness Campaign',
  'Theatre',
  'Musical',
  'Concert',
  'Live Event',
  'YouTube Production',
  'TikTok Content',
  'UGC Content',
  'Influencer Campaign',
  'Corporate Film',
  'Training Video',
  'Recruitment Video',
  'Game / Motion Capture',
  'Student Film',
  'Independent Production',
  'Photography',
  'Other',
];

export const JOB_TYPE_TO_CATEGORY = {
  'Feature Film': 'Film & TV',
  'Short Film': 'Film & TV',
  'TV Series': 'Film & TV',
  'Streaming / OTT Production': 'Film & TV',
  'Documentary': 'Film & TV',
  'Reality TV': 'Film & TV',
  'Music Video': 'Music & Live Events',
  'TV Commercial': 'Commercials & Advertising',
  'Online Video Advertisement': 'Commercials & Advertising',
  'Social Media Advertisement': 'Commercials & Advertising',
  'Brand Campaign': 'Commercials & Advertising',
  'Fashion Shoot': 'Fashion & Photography',
  'Catalogue / E-commerce Shoot': 'Fashion & Photography',
  'Lifestyle Shoot': 'Fashion & Photography',
  'Beauty Campaign': 'Fashion & Photography',
  'Fitness Campaign': 'Fashion & Photography',
  'Theatre': 'Theatre & Performing Arts',
  'Musical': 'Theatre & Performing Arts',
  'Concert': 'Music & Live Events',
  'Live Event': 'Music & Live Events',
  'YouTube Production': 'Digital Content & Social Media',
  'TikTok Content': 'Digital Content & Social Media',
  'UGC Content': 'Digital Content & Social Media',
  'Influencer Campaign': 'Digital Content & Social Media',
  'Corporate Film': 'Corporate & Training',
  'Training Video': 'Corporate & Training',
  'Recruitment Video': 'Corporate & Training',
  'Game / Motion Capture': 'Gaming & Motion Capture',
  'Student Film': 'Film & TV',
  'Independent Production': 'Film & TV',
  'Photography': 'Fashion & Photography',
  'Other': 'Other',
};

export const PRODUCTION_CATEGORIES = [
  'Film & TV',
  'Commercials & Advertising',
  'Fashion & Photography',
  'Music & Live Events',
  'Digital Content & Social Media',
  'Corporate & Training',
  'Gaming & Motion Capture',
  'Theatre & Performing Arts',
  'Other',
];

export const CATEGORY_JOB_TYPES = {
  'Film & TV': [
    'Feature Film',
    'Short Film',
    'TV Series',
    'Streaming / OTT Production',
    'Documentary',
    'Reality TV',
    'Student Film',
    'Independent Production',
    'Other',
  ],
  'Commercials & Advertising': [
    'TV Commercial',
    'Online Video Advertisement',
    'Social Media Advertisement',
    'Brand Campaign',
    'Corporate Film',
    'Training Video',
    'Recruitment Video',
    'Other',
  ],
  'Fashion & Photography': [
    'Fashion Shoot',
    'Catalogue / E-commerce Shoot',
    'Lifestyle Shoot',
    'Beauty Campaign',
    'Fitness Campaign',
    'Photography',
    'Other',
  ],
  'Music & Live Events': [
    'Music Video',
    'Concert',
    'Live Event',
    'Musical',
    'Theatre',
    'Other',
  ],
  'Digital Content & Social Media': [
    'YouTube Production',
    'TikTok Content',
    'UGC Content',
    'Influencer Campaign',
    'Other',
  ],
  'Corporate & Training': [
    'Corporate Film',
    'Training Video',
    'Recruitment Video',
    'Other',
  ],
  'Gaming & Motion Capture': [
    'Game / Motion Capture',
    'Other',
  ],
  'Theatre & Performing Arts': [
    'Theatre',
    'Musical',
    'Live Event',
    'Other',
  ],
  Other: [
    'Other',
    'Feature Film',
    'TV Commercial',
    'Music Video',
    'Live Event',
    'YouTube Production',
    'Photography',
  ],
};

const TALENT_OPTIONS = [
  'Actors',
  'Models',
  'Background Talent',
  'Dancers / Performers',
  'Musicians',
  'Creators / Influencers',
  'Children / Families',
  'Athletes / Stunt Performers',
  'Voice Artists',
  'Specialized Talent',
  'Other',
];

const CURRENCIES = [
  { code: 'EUR', symbol: '€', label: 'EUR (€)' },
  { code: 'INR', symbol: '₹', label: 'INR (₹)' },
  { code: 'USD', symbol: '$', label: 'USD ($)' },
  { code: 'GBP', symbol: '£', label: 'GBP (£)' },
];

const PostJobPage = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { user } = useAuth();

  // Initial defaults matching the target mockup
  const initialCompany =
    user?.companyName ||
    user?.company_name ||
    user?.productionCompany ||
    'Northlight Productions';

  const [productionCompany, setProductionCompany] = useState(initialCompany);
  const [productionCategory, setProductionCategory] = useState('Film & TV');
  const [customProductionCategory, setCustomProductionCategory] = useState('');
  const [productionType, setProductionType] = useState('Feature Film');
  const [customProductionType, setCustomProductionType] = useState('');
  const [selectedTalents, setSelectedTalents] = useState(['Background Talent']);
  const [customTalentNeeded, setCustomTalentNeeded] = useState('');
  const todayIso = new Date().toISOString().split('T')[0];
  const defaultEndIso = new Date(Date.now() + 14 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];

  const [openingStartDate, setOpeningStartDate] = useState(todayIso);
  const [openingEndDate, setOpeningEndDate] = useState(defaultEndIso);
  const [shootStartDate, setShootStartDate] = useState('');
  const [shootEndDate, setShootEndDate] = useState('');
  const [shootDate, setShootDate] = useState('');
  const [locationValue, setLocationValue] = useState('Berlin');
  const [artistsNeeded, setArtistsNeeded] = useState(5);
  const [selectedCurrency, setSelectedCurrency] = useState('EUR');
  const [compensationAmount, setCompensationAmount] = useState('150');
  const [requirements, setRequirements] = useState('');

  // Helper to format ISO date (YYYY-MM-DD) to friendly short date (e.g. 25 Oct 2026)
  const formatShortDate = (isoStr) => {
    if (!isoStr) return '';
    try {
      const parts = isoStr.split('-');
      if (parts.length === 3) {
        const d = new Date(parseInt(parts[0], 10), parseInt(parts[1], 10) - 1, parseInt(parts[2], 10));
        return d.toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' });
      }
      return isoStr;
    } catch {
      return isoStr;
    }
  };

  // Helper to quickly set duration in days from openingStartDate
  const setQuickDuration = (days) => {
    const base = openingStartDate ? new Date(openingStartDate) : new Date();
    const target = new Date(base.getTime() + days * 24 * 60 * 60 * 1000);
    const targetStr = target.toISOString().split('T')[0];
    setOpeningEndDate(targetStr);
    if (errors.openingDates) {
      setErrors((prev) => ({ ...prev, openingDates: undefined }));
    }
  };

  // Calculate day difference between start and end date
  const calculateDaysDuration = () => {
    if (!openingStartDate || !openingEndDate) return null;
    try {
      const start = new Date(openingStartDate);
      const end = new Date(openingEndDate);
      const diffMs = end - start;
      const days = Math.round(diffMs / (1000 * 60 * 60 * 24));
      return days >= 0 ? days : null;
    } catch {
      return null;
    }
  };

  // Dropdown UI states
  const [isTalentDropdownOpen, setIsTalentDropdownOpen] = useState(false);
  const [talentSearchQuery, setTalentSearchQuery] = useState('');
  const talentDropdownRef = useRef(null);

  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [toastMessage, setToastMessage] = useState('');

  // Two-way synchronization handlers between Job/Production Type and Category
  const handleProductionTypeChange = (selectedType) => {
    setProductionType(selectedType);
    const matchedCategory = JOB_TYPE_TO_CATEGORY[selectedType];
    if (matchedCategory) {
      setProductionCategory(matchedCategory);
    }
    if (errors.productionType) {
      setErrors((prev) => ({ ...prev, productionType: undefined }));
    }
    if (errors.productionCategory) {
      setErrors((prev) => ({ ...prev, productionCategory: undefined }));
    }
  };

  const handleCategoryChange = (selectedCategory) => {
    setProductionCategory(selectedCategory);
    const validTypes = CATEGORY_JOB_TYPES[selectedCategory] || ALL_JOB_PRODUCTION_TYPES;
    if (!validTypes.includes(productionType)) {
      setProductionType(validTypes[0] || 'Feature Film');
    }
    if (errors.productionCategory) {
      setErrors((prev) => ({ ...prev, productionCategory: undefined }));
    }
  };

  // Click outside listener for Talent Needed Dropdown
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (talentDropdownRef.current && !talentDropdownRef.current.contains(e.target)) {
        setIsTalentDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Talent toggle handler
  const toggleTalent = (talent) => {
    setSelectedTalents((prev) =>
      prev.includes(talent) ? prev.filter((t) => t !== talent) : [...prev, talent]
    );
    if (errors.talents) {
      setErrors((prev) => ({ ...prev, talents: undefined }));
    }
  };

  const removeTalent = (talent, e) => {
    e?.stopPropagation();
    setSelectedTalents((prev) => prev.filter((t) => t !== talent));
  };

  const filteredTalents = TALENT_OPTIONS.filter((t) =>
    t.toLowerCase().includes(talentSearchQuery.toLowerCase())
  );

  // Validation
  const validate = () => {
    const errs = {};
    if (!productionCompany.trim()) {
      errs.productionCompany = 'Production company is required.';
    }
    if (!productionCategory) {
      errs.productionCategory = 'Please select a production category.';
    }
    if (!productionType) {
      errs.productionType = 'Please select a job / production type.';
    }
    if (productionCategory === 'Other' && !customProductionCategory.trim()) {
      errs.customProductionCategory = 'Please specify the production category.';
    }
    if (productionType === 'Other' && !customProductionType.trim()) {
      errs.customProductionType = 'Please specify the job / production type.';
    }
    if (selectedTalents.length === 0) {
      errs.talents = 'Please select at least one talent needed.';
    }
    if (selectedTalents.includes('Other') && !customTalentNeeded.trim()) {
      errs.customTalentNeeded = 'Please specify other talent needed.';
    }
    if (!artistsNeeded || Number(artistsNeeded) < 1) {
      errs.artistsNeeded = 'Artists needed must be at least 1.';
    }
    if (openingStartDate && openingEndDate && openingStartDate > openingEndDate) {
      errs.openingDates = 'Opening end date must be on or after start date.';
    }
    if (shootStartDate && shootEndDate && shootStartDate > shootEndDate) {
      errs.shootDates = 'Shoot end date must be on or after start date.';
    }

    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  // Submit / Publish Work
  const handlePublishWork = async (e) => {
    e.preventDefault();

    if (!validate()) {
      setToastMessage('Please complete all required fields.');
      return;
    }

    setIsSubmitting(true);

    const currencyObj = CURRENCIES.find((c) => c.code === selectedCurrency) || CURRENCIES[0];
    const oppId = `opp-${Date.now()}`;
    const cleanLocation = locationValue.trim() || 'Worldwide / Remote';
    
    // Shoot dates range computation
    const computedShootDate = shootStartDate && shootEndDate
      ? `${shootStartDate} to ${shootEndDate}`
      : shootStartDate || shootDate || 'Flexible / To be confirmed';

    // Job opening range computation ("is date se lekar is date tak job opening hai")
    const openingRangeText = openingStartDate && openingEndDate
      ? `${openingStartDate} to ${openingEndDate}`
      : openingStartDate
      ? `From ${openingStartDate} (Open)`
      : 'Open for submissions';

    const resolvedProductionCategory =
      productionCategory === 'Other' && customProductionCategory.trim()
        ? customProductionCategory.trim()
        : productionCategory;
    const resolvedProductionType =
      productionType === 'Other' && customProductionType.trim()
        ? customProductionType.trim()
        : productionType;
    const resolvedTalents = selectedTalents.map((t) =>
      t === 'Other' && customTalentNeeded.trim() ? customTalentNeeded.trim() : t
    );

    const computedTitle = `${productionCompany} — ${resolvedProductionType} (${resolvedTalents.join(', ')})`;
    const fallbackCover = getCategoryFallbackImage(resolvedProductionCategory, resolvedProductionType);

    const cleanCategorySlug = (resolvedProductionCategory || 'other')
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/(^-|-$)/g, '');

    const compAmountNum = Number(compensationAmount) || 0;
    const cleanCompensation = compAmountNum > 0
      ? `${currencyObj.symbol}${compensationAmount} per talent`
      : 'Competitive / To be discussed';

    const categoryWiseDetails = {
      primaryCategory: resolvedProductionCategory,
      categorySlug: cleanCategorySlug,
      productionType: resolvedProductionType,
      jobType: resolvedProductionType,
      type: resolvedProductionType,
      talentCategory: resolvedTalents,
      selectedTalents,
      customTalentNeeded: customTalentNeeded.trim(),
      customProductionCategory: customProductionCategory.trim(),
      customProductionType: customProductionType.trim(),
      artistsNeeded: Number(artistsNeeded) || 1,
      compensationPerTalent: cleanCompensation,
      compensationType: compAmountNum > 0 ? 'Paid' : 'Standard / To be discussed',
      currency: currencyObj.code,
      currencySymbol: currencyObj.symbol,
      totalBudget: compAmountNum * (Number(artistsNeeded) || 1),
      locationCategory: cleanLocation,
      shootSchedule: computedShootDate,
      openingSchedule: openingRangeText,
      categoryTags: [
        resolvedProductionCategory,
        resolvedProductionType,
        ...resolvedTalents,
        compAmountNum > 0 ? 'Paid' : 'Open',
      ],
    };

    const categoryBreakdown = {
      production: {
        category: resolvedProductionCategory,
        type: resolvedProductionType,
        company: productionCompany.trim(),
      },
      talent: {
        categories: resolvedTalents,
        totalCount: Number(artistsNeeded) || 1,
      },
      compensation: {
        rate: cleanCompensation,
        totalBudget: compAmountNum * (Number(artistsNeeded) || 1),
        currency: currencyObj.code,
        type: compAmountNum > 0 ? 'Paid' : 'Standard / To be discussed',
      },
      logistics: {
        location: cleanLocation,
        shootDate: computedShootDate,
        jobOpeningRange: openingRangeText,
      },
    };

    const opportunity = {
      id: oppId,
      refId: `PRD-${Math.floor(100000 + Math.random() * 900000)}`,
      title: computedTitle,
      productionCompany: productionCompany.trim(),
      companyName: productionCompany.trim(),
      category: resolvedProductionCategory,
      productionCategory: resolvedProductionCategory,
      customProductionCategory: customProductionCategory.trim(),
      categorySlug: cleanCategorySlug,
      productionType: resolvedProductionType,
      customProductionType: customProductionType.trim(),
      jobType: resolvedProductionType,
      type: resolvedProductionType,
      talentNeeded: resolvedTalents,
      talents: resolvedTalents,
      selectedTalents,
      customTalentNeeded: customTalentNeeded.trim(),
      categoryWise: categoryWiseDetails,
      category_wise: categoryWiseDetails,
      category_breakdown: categoryBreakdown,
      categoryTags: categoryWiseDetails.categoryTags,
      roles: resolvedTalents.map((roleName) => ({
        roleName,
        characterName: roleName,
        category: roleName,
        spots: Math.max(1, Math.floor(Number(artistsNeeded) / resolvedTalents.length)),
        pay: cleanCompensation,
        description: requirements.trim() || 'Refer to requirements',
      })),
      shootDate: computedShootDate,
      shootDates: computedShootDate,
      shooting_dates: computedShootDate,
      shootStartDate: shootStartDate || shootDate,
      shootEndDate: shootEndDate,
      openingStartDate: openingStartDate,
      openingEndDate: openingEndDate,
      jobOpeningRange: openingRangeText,
      applicationDeadline: openingEndDate || 'Open',
      application_deadline: openingEndDate || 'Open',
      deadline: openingEndDate || 'Open',
      location: cleanLocation,
      artistsNeeded: Number(artistsNeeded) || 1,
      budget: compAmountNum * (Number(artistsNeeded) || 1),
      currency: currencyObj.code,
      currencySymbol: currencyObj.symbol,
      compensationPerTalent: cleanCompensation,
      compensation: cleanCompensation,
      requirements: requirements.trim(),
      description:
        requirements.trim() ||
        `Production requirement announced by ${productionCompany} for ${productionType}. Open for casting submissions.`,
      coverImage: fallbackCover,
      coverPosterUrl: fallbackCover,
      status: 'published',
      listingStatus: 'published',
      paymentStatus: 'paid',
      isPublished: true,
      isOpen: true,
      postedTime: 'Just now',
      createdAt: new Date().toISOString(),
    };

    try {
      // 1. Save to local application opportunities cache
      saveCustomOpportunity(opportunity);
      setPostingPaymentCompleted(true);

      // 2. Persist to MongoDB Atlas backend if server is active
      try {
        await apiRequest('/api/opportunities/create-order/', {
          method: 'POST',
          body: JSON.stringify(opportunity),
          timeout: 8000,
        });
      } catch (err) {
        console.warn('Backend opportunity sync fallback:', err);
      }

      setToastMessage('Work announced successfully!');
      setTimeout(() => {
        navigate(`/opportunities/${opportunity.id}`);
      }, 700);
    } catch (err) {
      console.error('Publish error:', err);
      saveCustomOpportunity(opportunity);
      setToastMessage('Work published successfully!');
      setTimeout(() => {
        navigate(`/opportunities/${opportunity.id}`);
      }, 700);
    } finally {
      setIsSubmitting(false);
    }
  };

  const currentCurrency = CURRENCIES.find((c) => c.code === selectedCurrency) || CURRENCIES[0];

  return (
    <div className="min-h-screen bg-white text-gray-900 antialiased py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-6xl mx-auto space-y-6 text-left">
        {/* Top Back Navigation */}
        <div>
          <BackButton fallback="/" variant="light" />
        </div>

        {/* Page Header */}
        <div className="space-y-1">
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-gray-900">
            Announce Work
          </h1>
          <p className="text-xs sm:text-sm text-gray-500 font-normal">
            Post a production requirement for talents to discover and apply.
          </p>
        </div>

        {/* 2-Column Responsive Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-start pt-2">
          {/* ================= LEFT COLUMN: FORM ================= */}
          <div className="lg:col-span-7 xl:col-span-8">
            <form onSubmit={handlePublishWork} className="space-y-5" noValidate>
              {/* 1. Production Company */}
              <div className="space-y-1.5">
                <label className="block text-xs font-semibold text-gray-900">
                  Production company
                </label>
                <input
                  type="text"
                  value={productionCompany}
                  onChange={(e) => setProductionCompany(e.target.value)}
                  placeholder="Northlight Productions"
                  className={`w-full px-3.5 py-2.5 bg-white border rounded-xl text-xs sm:text-sm text-gray-900 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-black/10 focus:border-black transition-all ${
                    errors.productionCompany ? 'border-red-500' : 'border-gray-200 hover:border-gray-300'
                  }`}
                />
                {errors.productionCompany && (
                  <p className="text-[11px] text-red-500">{errors.productionCompany}</p>
                )}
              </div>

              {/* 2. Production Category (Dropdown) */}
              <div className="space-y-1.5">
                <label className="block text-xs font-semibold text-gray-900">
                  Production category
                </label>
                <div className="relative">
                  <select
                    value={productionCategory}
                    onChange={(e) => handleCategoryChange(e.target.value)}
                    className="w-full px-3.5 py-2.5 bg-white border border-gray-200 hover:border-gray-300 rounded-xl text-xs sm:text-sm text-gray-900 appearance-none pr-10 focus:outline-none focus:ring-2 focus:ring-black/10 focus:border-black transition-all cursor-pointer font-medium"
                  >
                    {PRODUCTION_CATEGORIES.map((cat) => (
                      <option key={cat} value={cat}>
                        {cat}
                      </option>
                    ))}
                  </select>
                  <ChevronDown className="w-4 h-4 text-gray-500 absolute right-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                </div>

                {/* Custom Production Category input box when Other is chosen */}
                {productionCategory === 'Other' && (
                  <div className="mt-2.5 animate-in fade-in slide-in-from-top-1 duration-200">
                    <label className="block text-[11px] font-bold text-gray-700 mb-1.5">
                      Please specify production category <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      value={customProductionCategory}
                      onChange={(e) => {
                        setCustomProductionCategory(e.target.value);
                        if (errors.customProductionCategory) {
                          setErrors((prev) => ({ ...prev, customProductionCategory: undefined }));
                        }
                      }}
                      placeholder="Enter your custom production category..."
                      className={`w-full px-3.5 py-2.5 bg-white border rounded-xl text-xs sm:text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-black/10 transition-all ${
                        errors.customProductionCategory ? 'border-red-500' : 'border-gray-200 focus:border-black'
                      }`}
                      autoFocus
                    />
                    {errors.customProductionCategory && (
                      <p className="text-[11px] text-red-500 mt-1">{errors.customProductionCategory}</p>
                    )}
                  </div>
                )}
              </div>

              {/* 3. Job / production type (All 32 Categories from User Screenshots) */}
              <div className="space-y-1.5">
                <div className="flex items-center justify-between">
                  <label className="block text-xs font-semibold text-gray-900">
                    Job / production type
                  </label>
                  <span className="text-[11px] font-medium text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-md border border-emerald-200/60 flex items-center gap-1.5">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
                    Category: {productionCategory === 'Other' && customProductionCategory.trim() ? customProductionCategory.trim() : productionCategory}
                  </span>
                </div>
                <div className="relative">
                  <select
                    value={productionType}
                    onChange={(e) => handleProductionTypeChange(e.target.value)}
                    className="w-full px-3.5 py-2.5 bg-white border border-gray-200 hover:border-gray-300 rounded-xl text-xs sm:text-sm text-gray-900 appearance-none pr-10 focus:outline-none focus:ring-2 focus:ring-black/10 focus:border-black transition-all cursor-pointer font-medium"
                  >
                    {ALL_JOB_PRODUCTION_TYPES.map((type) => (
                      <option key={type} value={type}>
                        {type}
                      </option>
                    ))}
                  </select>
                  <ChevronDown className="w-4 h-4 text-gray-500 absolute right-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                </div>

                {/* Custom Job / Production Type input box when Other is chosen */}
                {productionType === 'Other' && (
                  <div className="mt-2.5 animate-in fade-in slide-in-from-top-1 duration-200">
                    <label className="block text-[11px] font-bold text-gray-700 mb-1.5">
                      Please specify job / production type <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      value={customProductionType}
                      onChange={(e) => {
                        setCustomProductionType(e.target.value);
                        if (errors.customProductionType) {
                          setErrors((prev) => ({ ...prev, customProductionType: undefined }));
                        }
                      }}
                      placeholder="Enter your custom job / production type..."
                      className={`w-full px-3.5 py-2.5 bg-white border rounded-xl text-xs sm:text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-black/10 transition-all ${
                        errors.customProductionType ? 'border-red-500' : 'border-gray-200 focus:border-black'
                      }`}
                      autoFocus
                    />
                    {errors.customProductionType && (
                      <p className="text-[11px] text-red-500 mt-1">{errors.customProductionType}</p>
                    )}
                  </div>
                )}
              </div>

              {/* 4. Talent Needed (User-friendly Multi-Select Dropdown) */}
              <div className="space-y-1.5" ref={talentDropdownRef}>
                <div className="flex items-center justify-between">
                  <label className="block text-xs font-semibold text-gray-900">
                    Talent needed
                  </label>
                  {selectedTalents.length > 0 && (
                    <button
                      type="button"
                      onClick={() => setSelectedTalents([])}
                      className="text-[11px] text-gray-400 hover:text-red-500 transition-colors"
                    >
                      Clear all
                    </button>
                  )}
                </div>

                {/* Dropdown Trigger Box */}
                <div className="relative">
                  <div
                    role="button"
                    tabIndex={0}
                    onClick={() => setIsTalentDropdownOpen((prev) => !prev)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter' || e.key === ' ') {
                        e.preventDefault();
                        setIsTalentDropdownOpen((prev) => !prev);
                      }
                    }}
                    className={`w-full min-h-[44px] px-3.5 py-2 bg-white border rounded-xl flex items-center justify-between gap-2 cursor-pointer transition-all ${
                      isTalentDropdownOpen
                        ? 'border-black ring-2 ring-black/10'
                        : errors.talents
                        ? 'border-red-500'
                        : 'border-gray-200 hover:border-gray-300'
                    }`}
                  >
                    {/* Selected Badges Inside Trigger */}
                    <div className="flex flex-wrap items-center gap-1.5 flex-1 pr-2">
                      {selectedTalents.length === 0 ? (
                        <span className="text-xs sm:text-sm text-gray-400">
                          Select talent needed (e.g. Background Talent, Actors)...
                        </span>
                      ) : (
                        selectedTalents.map((t) => (
                          <span
                            key={t}
                            className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-gray-100 text-gray-900 rounded-lg text-xs font-medium border border-gray-200/80 group"
                          >
                            <span>{t}</span>
                            <span
                              role="button"
                              tabIndex={0}
                              onClick={(e) => removeTalent(t, e)}
                              className="w-3.5 h-3.5 flex items-center justify-center text-gray-400 hover:text-black rounded-full transition-colors cursor-pointer"
                              title={`Remove ${t}`}
                            >
                              <X className="w-3 h-3" />
                            </span>
                          </span>
                        ))
                      )}
                    </div>

                    <div className="flex items-center gap-1.5 text-gray-400 shrink-0">
                      {selectedTalents.length > 0 && (
                        <span className="text-[11px] font-mono text-gray-500 bg-gray-100 px-1.5 py-0.5 rounded">
                          {selectedTalents.length}
                        </span>
                      )}
                      <ChevronDown
                        className={`w-4 h-4 transition-transform duration-200 ${
                          isTalentDropdownOpen ? 'rotate-180 text-black' : ''
                        }`}
                      />
                    </div>
                  </div>

                  {/* Dropdown Menu Popover */}
                  {isTalentDropdownOpen && (
                    <div className="absolute z-30 left-0 right-0 mt-1.5 bg-white border border-gray-200 rounded-2xl shadow-xl overflow-hidden animate-fadeIn">
                      {/* Search Filter Header */}
                      <div className="p-2.5 border-b border-gray-100 bg-gray-50/60">
                        <div className="relative">
                          <Search className="w-3.5 h-3.5 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
                          <input
                            type="text"
                            value={talentSearchQuery}
                            onChange={(e) => setTalentSearchQuery(e.target.value)}
                            placeholder="Search talent types..."
                            className="w-full pl-8 pr-3 py-1.5 bg-white border border-gray-200 rounded-lg text-xs text-gray-900 placeholder:text-gray-400 focus:outline-none focus:border-black"
                            autoFocus
                          />
                        </div>
                      </div>

                      {/* Options List */}
                      <div className="max-h-60 overflow-y-auto p-1.5 divide-y divide-gray-50">
                        {filteredTalents.length === 0 ? (
                          <div className="py-4 text-center text-xs text-gray-400">
                            No matching talent types found.
                          </div>
                        ) : (
                          filteredTalents.map((talent) => {
                            const isSelected = selectedTalents.includes(talent);
                            return (
                              <div
                                key={talent}
                                role="button"
                                tabIndex={0}
                                onClick={() => toggleTalent(talent)}
                                className={`w-full flex items-center justify-between px-3 py-2 text-xs rounded-xl cursor-pointer transition-colors ${
                                  isSelected
                                    ? 'bg-gray-100 text-gray-900 font-semibold'
                                    : 'text-gray-700 hover:bg-gray-50'
                                }`}
                              >
                                <div className="flex items-center gap-2.5">
                                  <div
                                    className={`w-4 h-4 rounded-md border flex items-center justify-center transition-colors ${
                                      isSelected
                                        ? 'bg-black border-black text-white'
                                        : 'border-gray-300 bg-white'
                                    }`}
                                  >
                                    {isSelected && <Check className="w-3 h-3 stroke-[3]" />}
                                  </div>
                                  <span>{talent}</span>
                                </div>
                                {isSelected && (
                                  <span className="text-[10px] text-gray-500 uppercase tracking-wider font-semibold">
                                    Selected
                                  </span>
                                )}
                              </div>
                            );
                          })
                        )}
                      </div>

                      {/* Quick Action Footer */}
                      <div className="p-2.5 border-t border-gray-100 bg-gray-50 flex items-center justify-between text-xs">
                        <button
                          type="button"
                          onClick={() => setSelectedTalents([...TALENT_OPTIONS])}
                          className="text-gray-500 hover:text-black font-medium transition-colors"
                        >
                          Select All
                        </button>
                        <button
                          type="button"
                          onClick={() => setIsTalentDropdownOpen(false)}
                          className="px-3 py-1 bg-black text-white text-[11px] font-semibold rounded-lg hover:bg-neutral-800 transition-colors"
                        >
                          Done
                        </button>
                      </div>
                    </div>
                  )}
                </div>

                {/* Quick-Pick Popular Chips (One-Click Selection) */}
                <div className="flex flex-wrap gap-1.5 pt-1">
                  {TALENT_OPTIONS.slice(0, 6).map((talent) => {
                    const isSelected = selectedTalents.includes(talent);
                    return (
                      <button
                        key={talent}
                        type="button"
                        onClick={() => toggleTalent(talent)}
                        className={`px-2.5 py-1 rounded-lg text-[11px] font-medium transition-all cursor-pointer ${
                          isSelected
                            ? 'bg-black text-white shadow-xs'
                            : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                        }`}
                      >
                        {isSelected ? `✓ ${talent}` : `+ ${talent}`}
                      </button>
                    );
                  })}
                </div>

                {errors.talents && (
                  <p className="text-[11px] text-red-500">{errors.talents}</p>
                )}

                {/* Custom Talent Needed input box when Other is chosen */}
                {selectedTalents.includes('Other') && (
                  <div className="mt-2.5 animate-in fade-in slide-in-from-top-1 duration-200">
                    <label className="block text-[11px] font-bold text-gray-700 mb-1.5">
                      Please specify other talent needed <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      value={customTalentNeeded}
                      onChange={(e) => {
                        setCustomTalentNeeded(e.target.value);
                        if (errors.customTalentNeeded) {
                          setErrors((prev) => ({ ...prev, customTalentNeeded: undefined }));
                        }
                      }}
                      placeholder="Enter talent type (e.g. Acrobat, Puppeteer, Drone Operator)..."
                      className={`w-full px-3.5 py-2.5 bg-white border rounded-xl text-xs sm:text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-black/10 transition-all ${
                        errors.customTalentNeeded ? 'border-red-500' : 'border-gray-200 focus:border-black'
                      }`}
                      autoFocus
                    />
                    {errors.customTalentNeeded && (
                      <p className="text-[11px] text-red-500 mt-1">{errors.customTalentNeeded}</p>
                    )}
                  </div>
                )}
              </div>

              {/* 5. Job Opening Period (Date Range: "Is date se lekar is date tak job opening hai") */}
              <div className="space-y-3 bg-neutral-50/90 p-4 sm:p-5 rounded-2xl border border-gray-200">
                <div className="flex items-center justify-between flex-wrap gap-2">
                  <label className="text-xs font-semibold text-gray-900 flex items-center gap-1.5">
                    <Calendar className="w-3.5 h-3.5 text-gray-800" />
                    <span>Job Opening Period (From – To)</span>
                  </label>
                  <span className="text-[11px] font-medium text-emerald-700 bg-emerald-50 px-2.5 py-0.5 rounded-full border border-emerald-200 flex items-center gap-1.5">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
                    Job Opening Active
                  </span>
                </div>

                <p className="text-[11px] text-gray-600 leading-relaxed">
                  Date range set karein jisme job opening candidates ke liye active aur open rahegi (Short date range):
                </p>

                {/* Quick-Pick Duration Presets */}
                <div className="flex items-center gap-1.5 flex-wrap pt-0.5">
                  <span className="text-[10px] uppercase font-bold text-gray-400 mr-1 tracking-wider">
                    Quick Duration:
                  </span>
                  {[
                    { label: '+7 Days (1 Week)', days: 7 },
                    { label: '+15 Days (~2 Weeks)', days: 15 },
                    { label: '+30 Days (1 Month)', days: 30 },
                    { label: '+60 Days (2 Months)', days: 60 },
                  ].map((preset) => {
                    const isCurrent = calculateDaysDuration() === preset.days;
                    return (
                      <button
                        key={preset.days}
                        type="button"
                        onClick={() => setQuickDuration(preset.days)}
                        className={`px-2.5 py-1 rounded-lg text-[11px] font-medium transition-all cursor-pointer ${
                          isCurrent
                            ? 'bg-black text-white shadow-xs'
                            : 'bg-white text-gray-700 hover:bg-gray-200 border border-gray-200'
                        }`}
                      >
                        {preset.label}
                      </button>
                    );
                  })}
                </div>

                {/* Date Inputs Grid */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
                  <div>
                    <label className="block text-[11px] font-medium text-gray-700 mb-1">
                      Opening Start Date (From)
                    </label>
                    <input
                      type="date"
                      value={openingStartDate}
                      onChange={(e) => setOpeningStartDate(e.target.value)}
                      className="w-full px-3 py-2 bg-white border border-gray-200 hover:border-gray-300 rounded-xl text-xs sm:text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-black/10 focus:border-black transition-all cursor-pointer"
                    />
                    {openingStartDate && (
                      <span className="block text-[10px] text-gray-500 mt-0.5 font-medium">
                        Starts: {formatShortDate(openingStartDate)}
                      </span>
                    )}
                  </div>
                  <div>
                    <label className="block text-[11px] font-medium text-gray-700 mb-1">
                      Opening End Date (To / Deadline)
                    </label>
                    <input
                      type="date"
                      value={openingEndDate}
                      onChange={(e) => setOpeningEndDate(e.target.value)}
                      min={openingStartDate || undefined}
                      className="w-full px-3 py-2 bg-white border border-gray-200 hover:border-gray-300 rounded-xl text-xs sm:text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-black/10 focus:border-black transition-all cursor-pointer"
                    />
                    {openingEndDate && (
                      <span className="block text-[10px] text-gray-500 mt-0.5 font-medium">
                        Ends: {formatShortDate(openingEndDate)}
                      </span>
                    )}
                  </div>
                </div>

                {/* Highlighted Banner: "Is date se lekar is date tak job opening hai" */}
                {openingStartDate && openingEndDate && (
                  <div className="mt-2.5 p-3 bg-gradient-to-r from-emerald-50 via-teal-50 to-white rounded-xl border border-emerald-200/90 shadow-2xs">
                    <div className="flex items-start gap-2.5">
                      <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 mt-0.5 shrink-0 animate-ping" />
                      <div className="flex-1">
                        <div className="flex items-center justify-between flex-wrap gap-1">
                          <p className="text-[11px] font-bold text-emerald-950">
                            Active Job Opening Window
                          </p>
                          {calculateDaysDuration() !== null && (
                            <span className="text-[10px] font-semibold text-emerald-800 bg-emerald-100 px-2 py-0.5 rounded-full border border-emerald-200">
                              {calculateDaysDuration()} Days Active
                            </span>
                          )}
                        </div>
                        <p className="text-xs text-emerald-900 mt-0.5 font-medium leading-relaxed">
                          📌 <strong>Is date se lekar is date tak job opening hai:</strong>{' '}
                          <span className="font-bold text-emerald-950 underline decoration-emerald-500">
                            {formatShortDate(openingStartDate)}
                          </span>{' '}
                          se lekar{' '}
                          <span className="font-bold text-emerald-950 underline decoration-emerald-500">
                            {formatShortDate(openingEndDate)}
                          </span>{' '}
                          tak candidate applications open rahengi.
                        </p>
                      </div>
                    </div>
                  </div>
                )}

                {errors.openingDates && (
                  <p className="text-[11px] text-red-500 font-medium">{errors.openingDates}</p>
                )}
              </div>

              {/* 6. Shoot Dates (Production Schedule) */}
              <div className="space-y-1.5">
                <div className="flex items-center justify-between">
                  <label className="block text-xs font-semibold text-gray-900">
                    Shoot dates / Production schedule
                  </label>
                  <span className="text-[11px] text-gray-400">Optional / Flexible</span>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-[11px] font-medium text-gray-500 mb-1">
                      Shoot Start Date
                    </label>
                    <input
                      type="date"
                      value={shootStartDate}
                      onChange={(e) => setShootStartDate(e.target.value)}
                      className="w-full px-3 py-2 bg-white border border-gray-200 hover:border-gray-300 rounded-xl text-xs text-gray-900 focus:outline-none focus:ring-2 focus:ring-black/10 focus:border-black transition-all cursor-pointer"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] font-medium text-gray-500 mb-1">
                      Shoot End Date
                    </label>
                    <input
                      type="date"
                      value={shootEndDate}
                      onChange={(e) => setShootEndDate(e.target.value)}
                      min={shootStartDate || undefined}
                      className="w-full px-3 py-2 bg-white border border-gray-200 hover:border-gray-300 rounded-xl text-xs text-gray-900 focus:outline-none focus:ring-2 focus:ring-black/10 focus:border-black transition-all cursor-pointer"
                    />
                  </div>
                </div>
                {errors.shootDates && (
                  <p className="text-[11px] text-red-500">{errors.shootDates}</p>
                )}
              </div>

              {/* 7. Location */}
              <div className="space-y-1.5">
                <label className="block text-xs font-semibold text-gray-900">
                  Location
                </label>
                <input
                  type="text"
                  value={locationValue}
                  onChange={(e) => setLocationValue(e.target.value)}
                  placeholder="Berlin"
                  className="w-full px-3.5 py-2.5 bg-white border border-gray-200 hover:border-gray-300 rounded-xl text-xs sm:text-sm text-gray-900 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-black/10 focus:border-black transition-all"
                />
              </div>

              {/* 8. Artists Needed */}
              <div className="space-y-1.5">
                <label className="block text-xs font-semibold text-gray-900">
                  Artists needed
                </label>
                <input
                  type="number"
                  min="1"
                  value={artistsNeeded}
                  onChange={(e) => setArtistsNeeded(e.target.value)}
                  placeholder="5"
                  className={`w-full px-3.5 py-2.5 bg-white border rounded-xl text-xs sm:text-sm text-gray-900 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-black/10 focus:border-black transition-all ${
                    errors.artistsNeeded ? 'border-red-500' : 'border-gray-200 hover:border-gray-300'
                  }`}
                />
                {errors.artistsNeeded && (
                  <p className="text-[11px] text-red-500">{errors.artistsNeeded}</p>
                )}
              </div>

              {/* 8. Compensation Per Talent (€) — [Payment requirement disabled as requested by user] */}
              {/*
              <div className="space-y-1.5">
                <div className="flex items-center justify-between">
                  <label className="block text-xs font-semibold text-gray-900">
                    Compensation per talent ({currentCurrency.symbol})
                  </label>
                  <div className="flex items-center gap-1 text-[11px] text-gray-500">
                    <span>Currency:</span>
                    <select
                      value={selectedCurrency}
                      onChange={(e) => setSelectedCurrency(e.target.value)}
                      className="bg-transparent font-semibold text-gray-900 border-none focus:outline-none cursor-pointer"
                    >
                      {CURRENCIES.map((c) => (
                        <option key={c.code} value={c.code}>
                          {c.code} ({c.symbol})
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-gray-400 font-semibold text-sm">
                    {currentCurrency.symbol}
                  </div>
                  <input
                    type="number"
                    min="0"
                    step="1"
                    value={compensationAmount}
                    onChange={(e) => setCompensationAmount(e.target.value)}
                    placeholder="150"
                    className={`w-full pl-8 pr-3.5 py-2.5 bg-white border rounded-xl text-xs sm:text-sm text-gray-900 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-black/10 focus:border-black transition-all ${
                      errors.compensation ? 'border-red-500' : 'border-gray-200 hover:border-gray-300'
                    }`}
                  />
                </div>
                {errors.compensation && (
                  <p className="text-[11px] text-red-500">{errors.compensation}</p>
                )}
              </div>
              */}

              {/* 9. Requirements */}
              <div className="space-y-1.5">
                <label className="block text-xs font-semibold text-gray-900">
                  Requirements
                </label>
                <textarea
                  rows={4}
                  value={requirements}
                  onChange={(e) => setRequirements(e.target.value)}
                  placeholder="Age range, appearance, language, skills, wardrobe, etc."
                  className="w-full px-3.5 py-2.5 bg-white border border-gray-200 hover:border-gray-300 rounded-xl text-xs sm:text-sm text-gray-900 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-black/10 focus:border-black transition-all resize-y"
                />
              </div>

              {/* 10. Publish Work Button */}
              <div className="pt-2">
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full py-3.5 px-6 bg-black hover:bg-neutral-800 active:scale-[0.99] text-white font-semibold text-sm rounded-xl shadow-xs transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isSubmitting ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      <span>Publishing Work...</span>
                    </>
                  ) : (
                    <span>Publish Work</span>
                  )}
                </button>
              </div>
            </form>
          </div>

          {/* ================= RIGHT COLUMN: LIVE PREVIEW & INFO ================= */}
          <div className="lg:col-span-5 xl:col-span-4 lg:sticky lg:top-24 space-y-4">
            {/* Live Job Card Preview */}
            <div className="bg-white rounded-2xl border border-gray-200 p-5 shadow-xs space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-bold text-gray-500 uppercase tracking-wider flex items-center gap-1.5">
                  <Sparkles className="w-3.5 h-3.5 text-black" />
                  Live Announcement Preview
                </span>
                <span className="text-[10px] font-semibold text-emerald-700 bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded-full flex items-center gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
                  Open for Applications
                </span>
              </div>

              {/* Card Body */}
              <div className="space-y-3 bg-neutral-50/80 rounded-xl p-3.5 border border-gray-100">
                <div>
                  <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider block">
                    {productionCompany || 'Production Company'}
                  </span>
                  <h4 className="text-sm font-bold text-gray-900 mt-0.5">
                    {productionType}
                  </h4>
                  <div className="flex flex-wrap gap-1 mt-1.5">
                    <span className="px-2 py-0.5 rounded-md bg-gray-200/80 text-gray-700 font-medium text-[10px]">
                      {productionCategory}
                    </span>
                    {selectedTalents.map((t) => (
                      <span
                        key={t}
                        className="px-2 py-0.5 rounded-md bg-black text-white font-medium text-[10px]"
                      >
                        {t}
                      </span>
                    ))}
                  </div>
                </div>

                {/* Prominent Job Opening Period Window */}
                <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-xl text-left space-y-1">
                  <div className="flex items-center justify-between text-[11px] font-bold text-emerald-950">
                    <span className="flex items-center gap-1.5">
                      <Calendar className="w-3.5 h-3.5 text-emerald-700" />
                      Job Opening Window
                    </span>
                    {calculateDaysDuration() !== null && (
                      <span className="text-[10px] bg-emerald-100 text-emerald-800 px-1.5 py-0.5 rounded-md font-semibold">
                        {calculateDaysDuration()} Days
                      </span>
                    )}
                  </div>
                  <p className="text-xs text-emerald-900 font-bold">
                    {openingStartDate && openingEndDate
                      ? `${formatShortDate(openingStartDate)} se lekar ${formatShortDate(openingEndDate)} tak`
                      : 'Open for applications'}
                  </p>
                  <p className="text-[10px] text-emerald-700 font-medium">
                    📌 Is date se lekar is date tak job opening candidates ke liye active rahegi.
                  </p>
                </div>

                {/* Shoot & Location summary */}
                <div className="grid grid-cols-2 gap-2 text-[11px] pt-1 border-t border-gray-200/60">
                  <div>
                    <span className="text-gray-400 text-[10px] block">Shoot Schedule</span>
                    <span className="font-semibold text-gray-800 text-xs">
                      {shootStartDate && shootEndDate
                        ? `${formatShortDate(shootStartDate)} – ${formatShortDate(shootEndDate)}`
                        : (shootStartDate ? formatShortDate(shootStartDate) : 'Flexible / TBD')}
                    </span>
                  </div>
                  <div>
                    <span className="text-gray-400 text-[10px] block">Location & Artists</span>
                    <span className="font-semibold text-gray-800 text-xs">
                      {locationValue || 'Pan-India'} • {artistsNeeded} Artists
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* Direct Booking & Casting Guide Info */}
            <div className="bg-white rounded-2xl border border-gray-200 p-5 shadow-xs space-y-4">
              <div className="space-y-2">
                <h3 className="text-sm font-bold text-gray-900">
                  Casting & Production Guide
                </h3>
                <p className="text-xs text-gray-600 leading-relaxed">
                  Your production announcement is broadcast directly to verified talent across StageLink. Review submissions, evaluate portfolios, and contact artists directly.
                </p>
                <div className="bg-gray-100 rounded-xl p-2.5 text-[11px] text-gray-700 font-medium">
                  Casting workflow:{' '}
                  <span className="font-semibold text-gray-900">
                    Announce → Review Applications → Direct Selection.
                  </span>
                </div>
              </div>

              <div className="space-y-1.5 pt-2 border-t border-gray-100">
                <h4 className="text-xs font-bold text-gray-900">
                  Reputation & Verified Badges
                </h4>
                <p className="text-xs text-gray-600 leading-relaxed">
                  After a completed booking, both the talent and production company can rate each other. Only platform bookings contribute to verified reputation.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      <Toast message={toastMessage} onClose={() => setToastMessage('')} />
    </div>
  );
};

export default PostJobPage;
