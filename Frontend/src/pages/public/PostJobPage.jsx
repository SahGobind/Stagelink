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
  Globe,
  FileText,
  CreditCard,
  Megaphone,
  Check,
  AlertCircle,
  Loader2,
  Info,
  X,
  Sparkles,
  CheckCircle2,
  Smartphone,
  Building2,
  QrCode,
  ExternalLink,
} from 'lucide-react';
import PageContainer from '../../components/layout/PageContainer';
import Toast from '../../components/common/Toast';
import { useAuth } from '../../context/AuthContext';

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

const CURRENCIES = [
  { code: 'INR', symbol: '₹', name: 'INR (₹)' },
  { code: 'USD', symbol: '$', name: 'USD ($)' },
  { code: 'EUR', symbol: '€', name: 'EUR (€)' },
  { code: 'GBP', symbol: '£', name: 'GBP (£)' },
];

const RATE_UNITS = [
  { value: 'Per Day', label: 'Per Day' },
  { value: 'Per Project', label: 'Per Project' },
  { value: 'Per Hour', label: 'Per Hour' },
  { value: 'Flat Rate', label: 'Flat Rate' },
];

const PostJobPage = () => {
  const navigate = useNavigate();
  const { user } = useAuth();

  // Prefill from authenticated company profile if available
  const defaultCompany =
    user?.companyName ||
    (user?.role === 'admin' ? 'StarCast Studios' : '') ||
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

  const [shootDate, setShootDate] = useState('2026-11-20');
  const [location, setLocation] = useState('');
  const [artistsNeeded, setArtistsNeeded] = useState(5);
  const [compensation, setCompensation] = useState(150);
  const [currency, setCurrency] = useState('INR');
  const [rateUnit, setRateUnit] = useState('Per Day');
  const [requirements, setRequirements] = useState('');

  // UI state
  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [toastMessage, setToastMessage] = useState('');

  // Payment Option Modal & Publishing States
  const [isPaymentModalOpen, setIsPaymentModalOpen] = useState(false);
  const [createdOpportunity, setCreatedOpportunity] = useState(null);
  const [activePaymentMethod, setActivePaymentMethod] = useState('upi'); // 'upi' | 'card' | 'netbanking' | 'juspay'
  const [selectedUpiApp, setSelectedUpiApp] = useState('gpay'); // 'gpay' | 'phonepe' | 'paytm' | 'id'
  const [upiId, setUpiId] = useState('');
  const [cardNumber, setCardNumber] = useState('');
  const [cardExpiry, setCardExpiry] = useState('');
  const [cardCvv, setCardCvv] = useState('');
  const [cardName, setCardName] = useState('');
  const [selectedBank, setSelectedBank] = useState('HDFC Bank');
  const [isProcessingPayment, setIsProcessingPayment] = useState(false);
  const [publishedSuccessData, setPublishedSuccessData] = useState(null);
  const [checkoutUrl, setCheckoutUrl] = useState('');

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

    if (!shootDate) {
      newErrors.shootDate = 'Shoot date is required.';
    }
    if (!location.trim()) {
      newErrors.location = 'Location (city, country) is required.';
    }
    if (!artistsNeeded || Number(artistsNeeded) < 1 || !Number.isInteger(Number(artistsNeeded))) {
      newErrors.artistsNeeded = 'Artists needed must be a positive integer.';
    }
    if (compensation === '' || Number(compensation) < 0) {
      newErrors.compensation = 'Valid compensation amount is required.';
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

    const payload = {
      productionCompany: productionCompany.trim(),
      productionCategory: finalCategory,
      productionType: finalProductionType,
      talentNeeded: finalTalents,
      shootDate,
      location: location.trim(),
      artistsNeeded: Number(artistsNeeded),
      compensation: Number(compensation),
      currency,
      rateUnit,
      requirements: requirements.trim(),
      companyId: user?.id || 'comp-default',
      customerEmail: user?.email || 'recruiter@starcast.in',
      customerPhone: user?.phoneNumber || '9876543210',
    };

    try {
      const response = await fetch('/api/opportunities/create-order', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
      });

      const data = await response.json();

      if (!response.ok) {
        if (data.code === 'VALIDATION_ERROR') {
          setErrors(data.errors || {});
          setToastMessage('Validation failed on server. Please check your inputs.');
        } else {
          setToastMessage(data.error || 'Failed to initialize casting order.');
        }
        setIsSubmitting(false);
        return;
      }

      setCreatedOpportunity(data.opportunity);
      if (data.checkoutUrl) {
        setCheckoutUrl(data.checkoutUrl);
      }
      setIsSubmitting(false);
      // Open Payment Options Modal directly upon clicking Publish button!
      setIsPaymentModalOpen(true);
      setPublishedSuccessData(null);
    } catch (err) {
      console.error('Submission network error:', err);
      setToastMessage('Backend service connection issue. Please verify server is running on port 5050.');
      setIsSubmitting(false);
    }
  };

  const handleConfirmPayment = async () => {
    if (!createdOpportunity) return;
    setIsProcessingPayment(true);

    try {
      // If user selected Juspay redirect mode and checkout URL is available
      if (activePaymentMethod === 'juspay' && checkoutUrl) {
        window.location.href = checkoutUrl;
        return;
      }

      let methodLabel = 'UPI';
      if (activePaymentMethod === 'upi') {
        methodLabel = upiId ? `UPI (${upiId})` : `UPI (${selectedUpiApp.toUpperCase()})`;
      } else if (activePaymentMethod === 'card') {
        const last4 = cardNumber ? cardNumber.replace(/\s/g, '').slice(-4) : '4242';
        methodLabel = `Card (•••• ${last4})`;
      } else if (activePaymentMethod === 'netbanking') {
        methodLabel = `NetBanking (${selectedBank})`;
      } else if (activePaymentMethod === 'juspay') {
        methodLabel = 'Juspay Gateway';
      }

      const response = await fetch('/api/opportunities/confirm-payment', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          opportunityId: createdOpportunity.id,
          orderId: createdOpportunity.paymentOrderId,
          paymentMethod: methodLabel,
        }),
      });

      const data = await response.json();

      if (!response.ok || !data.success) {
        setToastMessage(data.error || 'Payment confirmation failed.');
        setIsProcessingPayment(false);
        return;
      }

      // Successfully published!
      setPublishedSuccessData(data);
      setIsProcessingPayment(false);
      setToastMessage('Payment completed! Casting opportunity is now published.');
    } catch (err) {
      console.error('Payment confirmation error:', err);
      setToastMessage('Failed to confirm payment. Please try again.');
      setIsProcessingPayment(false);
    }
  };

  const selectedCurrencyObj = CURRENCIES.find((c) => c.code === currency) || CURRENCIES[0];

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
              </div>

              {/* 5. Shoot Date */}
              <div className="space-y-1.5">
                <label className="block text-xs font-bold text-gray-800">
                  Shoot date <span className="text-brand-pink">*</span>
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
                    className="w-full px-4 py-2.5 bg-white border border-gray-200 rounded-xl text-xs sm:text-sm text-gray-900 focus:outline-none focus:border-brand-pink focus:ring-2 focus:ring-pink-100 transition-all"
                  />
                </div>
                {errors.shootDate && (
                  <p className="text-[11px] text-red-600 font-medium">{errors.shootDate}</p>
                )}
              </div>

              {/* 6. Location */}
              <div className="space-y-1.5">
                <label className="block text-xs font-bold text-gray-800">
                  Location <span className="text-brand-pink">*</span>
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
                  placeholder="Enter location (city, state, country)"
                  className="w-full px-4 py-2.5 bg-white border border-gray-200 rounded-xl text-xs sm:text-sm text-gray-900 placeholder-gray-400 focus:outline-none focus:border-brand-pink focus:ring-2 focus:ring-pink-100 transition-all"
                />
                {errors.location && (
                  <p className="text-[11px] text-red-600 font-medium">{errors.location}</p>
                )}
              </div>

              {/* 7 & 8. Artists Needed & Compensation per talent */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {/* Artists Needed */}
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

                {/* Compensation per talent with Currency & Rate Unit */}
                <div className="space-y-1.5">
                  <label className="block text-xs font-bold text-gray-800">
                    Compensation per talent ({selectedCurrencyObj.symbol}){' '}
                    <span className="text-brand-pink">*</span>
                  </label>
                  <div className="flex gap-2">
                    <div className="relative w-28 shrink-0">
                      <select
                        value={currency}
                        onChange={(e) => setCurrency(e.target.value)}
                        className="w-full px-3 py-2.5 bg-white border border-gray-200 rounded-xl text-xs font-semibold text-gray-900 appearance-none pr-7 focus:outline-none focus:border-brand-pink cursor-pointer"
                      >
                        {CURRENCIES.map((c) => (
                          <option key={c.code} value={c.code}>
                            {c.code}
                          </option>
                        ))}
                      </select>
                      <ChevronDown className="w-3.5 h-3.5 text-gray-400 absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                    </div>

                    <input
                      type="number"
                      min="0"
                      value={compensation}
                      onChange={(e) => {
                        setCompensation(e.target.value);
                        if (errors.compensation) {
                          setErrors((prev) => ({ ...prev, compensation: undefined }));
                        }
                      }}
                      placeholder="Amount"
                      className="flex-1 px-4 py-2.5 bg-white border border-gray-200 rounded-xl text-xs sm:text-sm text-gray-900 focus:outline-none focus:border-brand-pink focus:ring-2 focus:ring-pink-100 transition-all"
                    />

                    <div className="relative w-32 shrink-0 hidden sm:block">
                      <select
                        value={rateUnit}
                        onChange={(e) => setRateUnit(e.target.value)}
                        className="w-full px-2.5 py-2.5 bg-white border border-gray-200 rounded-xl text-xs font-medium text-gray-700 appearance-none pr-7 focus:outline-none focus:border-brand-pink cursor-pointer"
                      >
                        {RATE_UNITS.map((u) => (
                          <option key={u.value} value={u.value}>
                            {u.label}
                          </option>
                        ))}
                      </select>
                      <ChevronDown className="w-3.5 h-3.5 text-gray-400 absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                    </div>
                  </div>
                  {errors.compensation && (
                    <p className="text-[11px] text-red-600 font-medium">{errors.compensation}</p>
                  )}
                </div>
              </div>

              {/* 9. Requirements (Optional Multiline 500 chars limit) */}
              <div className="space-y-1.5">
                <div className="flex justify-between items-center">
                  <label className="block text-xs font-bold text-gray-800">
                    Requirements
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

              {/* 10. Action Button: Publish Casting Call */}
              <div className="pt-3">
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full py-4 px-6 rounded-2xl bg-brand-pink hover:bg-rose-700 text-white text-sm sm:text-base font-bold shadow-md hover:shadow-lg transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-70 disabled:cursor-not-allowed"
                >
                  {isSubmitting ? (
                    <>
                      <Loader2 className="w-5 h-5 animate-spin" />
                      <span>Validating &amp; Preparing Payment...</span>
                    </>
                  ) : (
                    <>
                      <Sparkles className="w-5 h-5" />
                      <span>Publish Casting Call</span>
                      <ArrowRight className="w-4 h-4" />
                    </>
                  )}
                </button>
              </div>

              {/* Helper text */}
              <p className="text-center text-xs text-gray-500 font-medium flex items-center justify-center gap-1.5 pt-1">
                <ShieldCheck className="w-3.5 h-3.5 text-brand-pink" />
                <span>Fill in all details above and click publish to select your payment option.</span>
              </p>
            </form>
          </div>
        </div>

        {/* Payment Options Modal: Opens when user clicks Publish Casting Call */}
        {isPaymentModalOpen && (
          <div
            role="dialog"
            aria-modal="true"
            className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto animate-in fade-in duration-200"
          >
            <div className="bg-white rounded-3xl max-w-xl w-full p-6 sm:p-8 space-y-6 shadow-2xl border border-gray-100 text-left my-8 animate-in zoom-in-95 duration-200">
              {!publishedSuccessData ? (
                <>
                  {/* Modal Header */}
                  <div className="flex items-start justify-between border-b border-gray-100 pb-4">
                    <div>
                      <span className="text-[11px] font-bold text-brand-pink uppercase tracking-widest block">
                        STEP 2 — PAYMENT &amp; PUBLICATION
                      </span>
                      <h2 className="text-xl sm:text-2xl font-bold font-serif text-gray-900 mt-0.5">
                        Choose Payment Option
                      </h2>
                      <p className="text-xs text-gray-500 mt-0.5">
                        Complete payment to publish your casting opportunity live on StarCast.
                      </p>
                    </div>
                    <button
                      type="button"
                      onClick={() => setIsPaymentModalOpen(false)}
                      className="p-1.5 rounded-xl text-gray-400 hover:text-gray-700 hover:bg-gray-100 cursor-pointer transition-colors"
                      aria-label="Close payment modal"
                    >
                      <X className="w-5 h-5" />
                    </button>
                  </div>

                  {/* Opportunity Snapshot & Fee Summary */}
                  <div className="p-4 rounded-2xl bg-pink-50/60 border border-pink-100/90 space-y-3">
                    <div className="flex items-start justify-between gap-4">
                      <div>
                        <span className="text-[10px] font-semibold text-brand-pink uppercase tracking-wider">
                          Opportunity Summary
                        </span>
                        <h3 className="text-sm font-bold text-gray-900 mt-0.5">
                          {createdOpportunity?.productionCompany} — {createdOpportunity?.productionType}
                        </h3>
                        <p className="text-xs text-gray-500">
                          {createdOpportunity?.productionCategory} • {createdOpportunity?.location}
                        </p>
                      </div>
                      <div className="text-right shrink-0">
                        <span className="text-[11px] text-gray-500 block">Listing Fee</span>
                        <span className="text-xl font-bold text-gray-900">
                          ₹{createdOpportunity?.listingFee || 1999}
                        </span>
                      </div>
                    </div>

                    <div className="flex flex-wrap gap-2 pt-1 border-t border-pink-200/50 text-[11px] text-gray-600">
                      <span>
                        <strong className="text-gray-800">Shoot Date:</strong> {createdOpportunity?.shootDate}
                      </span>
                      <span>•</span>
                      <span>
                        <strong className="text-gray-800">Talent:</strong>{' '}
                        {Array.isArray(createdOpportunity?.talentNeeded)
                          ? createdOpportunity.talentNeeded.join(', ')
                          : createdOpportunity?.talentNeeded}
                      </span>
                      <span>•</span>
                      <span>
                        <strong className="text-gray-800">Compensation:</strong>{' '}
                        {createdOpportunity?.currency} {createdOpportunity?.compensation}{' '}
                        {createdOpportunity?.rateUnit}
                      </span>
                    </div>
                  </div>

                  {/* Payment Method Selector Tabs */}
                  <div className="space-y-3">
                    <label className="block text-xs font-bold text-gray-800">
                      Select Payment Method
                    </label>

                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                      {/* UPI */}
                      <button
                        type="button"
                        onClick={() => setActivePaymentMethod('upi')}
                        className={`p-3 rounded-2xl border text-center transition-all cursor-pointer flex flex-col items-center gap-1.5 ${
                          activePaymentMethod === 'upi'
                            ? 'bg-pink-50 border-brand-pink text-brand-pink ring-2 ring-pink-100 font-bold shadow-2xs'
                            : 'bg-white border-gray-200 text-gray-600 hover:border-gray-300'
                        }`}
                      >
                        <Smartphone className="w-5 h-5" />
                        <span className="text-xs">UPI / QR</span>
                        <span className="text-[10px] text-emerald-600 font-semibold bg-emerald-50 px-1.5 py-0.5 rounded">
                          Instant
                        </span>
                      </button>

                      {/* Card */}
                      <button
                        type="button"
                        onClick={() => setActivePaymentMethod('card')}
                        className={`p-3 rounded-2xl border text-center transition-all cursor-pointer flex flex-col items-center gap-1.5 ${
                          activePaymentMethod === 'card'
                            ? 'bg-pink-50 border-brand-pink text-brand-pink ring-2 ring-pink-100 font-bold shadow-2xs'
                            : 'bg-white border-gray-200 text-gray-600 hover:border-gray-300'
                        }`}
                      >
                        <CreditCard className="w-5 h-5" />
                        <span className="text-xs">Cards</span>
                        <span className="text-[10px] text-gray-400">Debit / Credit</span>
                      </button>

                      {/* Net Banking */}
                      <button
                        type="button"
                        onClick={() => setActivePaymentMethod('netbanking')}
                        className={`p-3 rounded-2xl border text-center transition-all cursor-pointer flex flex-col items-center gap-1.5 ${
                          activePaymentMethod === 'netbanking'
                            ? 'bg-pink-50 border-brand-pink text-brand-pink ring-2 ring-pink-100 font-bold shadow-2xs'
                            : 'bg-white border-gray-200 text-gray-600 hover:border-gray-300'
                        }`}
                      >
                        <Building2 className="w-5 h-5" />
                        <span className="text-xs">Net Banking</span>
                        <span className="text-[10px] text-gray-400">All Banks</span>
                      </button>

                      {/* Juspay Gateway */}
                      <button
                        type="button"
                        onClick={() => setActivePaymentMethod('juspay')}
                        className={`p-3 rounded-2xl border text-center transition-all cursor-pointer flex flex-col items-center gap-1.5 ${
                          activePaymentMethod === 'juspay'
                            ? 'bg-pink-50 border-brand-pink text-brand-pink ring-2 ring-pink-100 font-bold shadow-2xs'
                            : 'bg-white border-gray-200 text-gray-600 hover:border-gray-300'
                        }`}
                      >
                        <ShieldCheck className="w-5 h-5" />
                        <span className="text-xs">Juspay</span>
                        <span className="text-[10px] text-gray-400">Gateway</span>
                      </button>
                    </div>

                    {/* Method Content Panel */}
                    <div className="p-4 rounded-2xl bg-gray-50 border border-gray-200 text-xs text-gray-700 space-y-3">
                      {/* UPI Option Form */}
                      {activePaymentMethod === 'upi' && (
                        <div className="space-y-3">
                          <div className="flex items-center justify-between text-xs font-bold text-gray-800">
                            <span>Choose UPI App or enter VPA ID</span>
                            <span className="text-[10px] text-gray-400 font-normal">Fast 1-click Pay</span>
                          </div>

                          <div className="grid grid-cols-4 gap-2">
                            {['gpay', 'phonepe', 'paytm', 'bhim'].map((app) => (
                              <button
                                key={app}
                                type="button"
                                onClick={() => setSelectedUpiApp(app)}
                                className={`py-2 px-1 rounded-xl border text-center text-xs font-semibold capitalize transition-all cursor-pointer ${
                                  selectedUpiApp === app
                                    ? 'bg-white border-brand-pink text-brand-pink shadow-xs'
                                    : 'bg-white/60 border-gray-200 text-gray-600 hover:bg-white'
                                }`}
                              >
                                {app === 'gpay'
                                  ? 'Google Pay'
                                  : app === 'phonepe'
                                  ? 'PhonePe'
                                  : app === 'paytm'
                                  ? 'Paytm'
                                  : 'BHIM'}
                              </button>
                            ))}
                          </div>

                          <div className="space-y-1">
                            <label className="block text-[11px] font-semibold text-gray-600">
                              Or enter your UPI ID (VPA)
                            </label>
                            <input
                              type="text"
                              value={upiId}
                              onChange={(e) => setUpiId(e.target.value)}
                              placeholder="e.g. mobileNumber@upi or yourname@okhdfcbank"
                              className="w-full px-3.5 py-2 bg-white border border-gray-200 rounded-xl text-xs text-gray-900 focus:outline-none focus:border-brand-pink"
                            />
                          </div>
                        </div>
                      )}

                      {/* Card Option Form */}
                      {activePaymentMethod === 'card' && (
                        <div className="space-y-3">
                          <div className="space-y-1">
                            <label className="block text-[11px] font-semibold text-gray-600">Card Number</label>
                            <input
                              type="text"
                              maxLength={19}
                              value={cardNumber}
                              onChange={(e) => setCardNumber(e.target.value)}
                              placeholder="4111 2222 3333 4444"
                              className="w-full px-3.5 py-2 bg-white border border-gray-200 rounded-xl text-xs text-gray-900 focus:outline-none focus:border-brand-pink font-mono"
                            />
                          </div>

                          <div className="grid grid-cols-2 gap-2">
                            <div className="space-y-1">
                              <label className="block text-[11px] font-semibold text-gray-600">Expiry (MM/YY)</label>
                              <input
                                type="text"
                                maxLength={5}
                                value={cardExpiry}
                                onChange={(e) => setCardExpiry(e.target.value)}
                                placeholder="12/28"
                                className="w-full px-3.5 py-2 bg-white border border-gray-200 rounded-xl text-xs text-gray-900 focus:outline-none focus:border-brand-pink text-center"
                              />
                            </div>
                            <div className="space-y-1">
                              <label className="block text-[11px] font-semibold text-gray-600">CVV</label>
                              <input
                                type="password"
                                maxLength={4}
                                value={cardCvv}
                                onChange={(e) => setCardCvv(e.target.value)}
                                placeholder="•••"
                                className="w-full px-3.5 py-2 bg-white border border-gray-200 rounded-xl text-xs text-gray-900 focus:outline-none focus:border-brand-pink text-center"
                              />
                            </div>
                          </div>

                          <div className="space-y-1">
                            <label className="block text-[11px] font-semibold text-gray-600">Cardholder Name</label>
                            <input
                              type="text"
                              value={cardName}
                              onChange={(e) => setCardName(e.target.value)}
                              placeholder="Name on card"
                              className="w-full px-3.5 py-2 bg-white border border-gray-200 rounded-xl text-xs text-gray-900 focus:outline-none focus:border-brand-pink"
                            />
                          </div>
                        </div>
                      )}

                      {/* Net Banking Form */}
                      {activePaymentMethod === 'netbanking' && (
                        <div className="space-y-2.5">
                          <label className="block text-[11px] font-semibold text-gray-600">
                            Select Your Bank
                          </label>
                          <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                            {['HDFC Bank', 'ICICI Bank', 'State Bank of India', 'Axis Bank', 'Kotak Mahindra', 'Other Bank'].map(
                              (bank) => (
                                <button
                                  key={bank}
                                  type="button"
                                  onClick={() => setSelectedBank(bank)}
                                  className={`py-2 px-2 rounded-xl border text-center text-xs font-semibold transition-all cursor-pointer ${
                                    selectedBank === bank
                                      ? 'bg-white border-brand-pink text-brand-pink shadow-xs'
                                      : 'bg-white/60 border-gray-200 text-gray-600 hover:bg-white'
                                  }`}
                                >
                                  {bank}
                                </button>
                              )
                            )}
                          </div>
                        </div>
                      )}

                      {/* Juspay Gateway Info */}
                      {activePaymentMethod === 'juspay' && (
                        <div className="space-y-2 text-xs">
                          <p className="font-semibold text-gray-800">Official Juspay Encrypted Gateway</p>
                          <p className="text-gray-500 text-[11px]">
                            {checkoutUrl
                              ? 'Clicking below will securely redirect you to Juspay standard checkout session.'
                              : 'Juspay gateway integration is ready. Click below to verify and complete direct payment.'}
                          </p>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="space-y-2 pt-2">
                    <button
                      type="button"
                      onClick={handleConfirmPayment}
                      disabled={isProcessingPayment}
                      className="w-full py-4 px-6 rounded-2xl bg-brand-pink hover:bg-rose-700 text-white text-sm sm:text-base font-bold shadow-md hover:shadow-lg transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-70 disabled:cursor-not-allowed"
                    >
                      {isProcessingPayment ? (
                        <>
                          <Loader2 className="w-5 h-5 animate-spin" />
                          <span>Processing Payment &amp; Publishing...</span>
                        </>
                      ) : (
                        <>
                          <Lock className="w-4 h-4" />
                          <span>Pay ₹{createdOpportunity?.listingFee || 1999} &amp; Publish Job</span>
                        </>
                      )}
                    </button>

                    <button
                      type="button"
                      onClick={() => setIsPaymentModalOpen(false)}
                      className="w-full py-2 text-center text-xs text-gray-500 hover:text-gray-800 font-medium cursor-pointer"
                    >
                      Cancel and keep as draft
                    </button>
                  </div>
                </>
              ) : (
                /* Success Published State */
                <div className="text-center py-4 space-y-5 animate-in zoom-in-95 duration-200">
                  <div className="w-16 h-16 rounded-full bg-emerald-50 text-emerald-600 border border-emerald-200 flex items-center justify-center mx-auto shadow-sm">
                    <CheckCircle2 className="w-9 h-9 stroke-[2.5]" />
                  </div>

                  <div className="space-y-1">
                    <span className="text-[11px] font-bold text-emerald-600 uppercase tracking-widest block">
                      PAYMENT CONFIRMED • LIVE ON STARCAST
                    </span>
                    <h2 className="text-2xl font-bold font-serif text-gray-900">
                      Casting Call Published!
                    </h2>
                    <p className="text-xs text-gray-500 max-w-sm mx-auto">
                      Your casting opportunity has been published live. Talents across StarCast can now discover and apply.
                    </p>
                  </div>

                  {/* Reference card */}
                  <div className="p-4 rounded-2xl bg-gray-50 border border-gray-200 text-left text-xs space-y-2 max-w-md mx-auto">
                    <div className="flex justify-between items-center text-gray-600">
                      <span>Listing Ref ID:</span>
                      <span className="font-mono font-bold text-gray-900">
                        {publishedSuccessData.opportunity?.refId || 'PRD-ACTIVE'}
                      </span>
                    </div>
                    <div className="flex justify-between items-center text-gray-600">
                      <span>Transaction ID:</span>
                      <span className="font-mono text-gray-800 text-[11px]">
                        {publishedSuccessData.txnId || 'TXN-CONFIRMED'}
                      </span>
                    </div>
                    <div className="flex justify-between items-center text-gray-600">
                      <span>Status:</span>
                      <span className="font-bold text-emerald-700 bg-emerald-100/70 px-2 py-0.5 rounded-full text-[11px]">
                        Published &amp; Active
                      </span>
                    </div>
                  </div>

                  {/* Navigation links */}
                  <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2">
                    <Link
                      to="/opportunities"
                      className="w-full sm:w-auto px-6 py-2.5 rounded-xl bg-brand-pink text-white text-xs font-bold hover:bg-rose-700 transition-all shadow-xs flex items-center justify-center gap-1.5 cursor-pointer"
                    >
                      <span>View Live Casting Calls</span>
                      <ExternalLink className="w-3.5 h-3.5" />
                    </Link>

                    <Link
                      to="/admin/opportunities"
                      className="w-full sm:w-auto px-6 py-2.5 rounded-xl bg-white border border-gray-200 text-gray-800 text-xs font-bold hover:bg-gray-50 transition-all cursor-pointer"
                    >
                      <span>Recruiter Dashboard</span>
                    </Link>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        <Toast message={toastMessage} onClose={() => setToastMessage('')} />
      </PageContainer>
    </div>
  );
};

export default PostJobPage;
