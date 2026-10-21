import React, { useState, useRef, useEffect } from 'react';
import { useNavigate, useLocation, Link } from 'react-router-dom';
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
  FileText,
  Eye,
  Save,
  Banknote,
  Sparkles,
  Building2,
  MapPin,
  Tag,
  Clock,
  Edit,
  Info,
  Image as ImageIcon,
} from 'lucide-react';
import PageContainer from '../../components/layout/PageContainer';
import Toast from '../../components/common/Toast';
import OpportunityPreviewModal from '../../components/opportunities/OpportunityPreviewModal';
import WorkflowStepper from '../../components/opportunities/WorkflowStepper';
import { useAuth } from '../../context/AuthContext';
import { setPendingOpportunity } from '../../utils/paymentAccess';
import { castingService } from '../../services/castingService';
import { paymentService } from '../../services/paymentService';
import { authService } from '../../services/authService';
import {
  CINEMATIC_PRESETS,
  getCategoryFallbackImage,
  isBrokenImageUrl,
} from '../../utils/opportunityImageHelper';

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
  ],
};

const TALENT_CHIPS = [
  'Actors',
  'Actresses',
  'Models',
  'Dancers',
  'Singers',
  'Musicians',
  'Creators',
  'Voice Artists',
  'Presenters',
  'Background Artists',
  'Other',
];

const COMPENSATION_TYPES = ['Paid', 'Unpaid', 'Expenses Only', 'Negotiable'];
const PAYMENT_UNITS = ['Per Project', 'Per Day', 'Per Episode', 'Per Month', 'Total Stipend'];

const PostJobPage = () => {
  const navigate = useNavigate();
  const navLocation = useLocation();
  const { user, isAuthenticated, login, setRecruiterSession } = useAuth();
  const passedOpp = navLocation.state?.opportunity;

  // Determine if user has recruiter / production studio authorization
  const isRecruiter = Boolean(
    isAuthenticated && (user?.role === 'recruiter' || user?.role === 'admin')
  );

  // Workflow Step: 2 = Create Job (Form), 3 = Review Fees (Review & Order Summary)
  const [currentStep, setCurrentStep] = useState(2);

  // Prefill from authenticated company profile or passed opportunity
  const defaultCompany =
    passedOpp?.productionCompany ||
    user?.companyName ||
    user?.productionCompany ||
    (user?.role === 'admin' ? 'StageLink Studios' : '') ||
    'Apex Vision Studios';

  // 1. Form States
  const [productionCompany, setProductionCompany] = useState(defaultCompany);
  const [productionCategory, setProductionCategory] = useState(passedOpp?.productionCategory || 'Film & TV');
  const [otherCategoryText, setOtherCategoryText] = useState('');
  const [productionType, setProductionType] = useState(passedOpp?.productionType || 'Feature Film');
  const [otherProductionTypeText, setOtherProductionTypeText] = useState('');

  const [castingTitle, setCastingTitle] = useState(passedOpp?.title || '');
  const [selectedTalents, setSelectedTalents] = useState(
    Array.isArray(passedOpp?.talentNeeded) && passedOpp.talentNeeded.length > 0
      ? passedOpp.talentNeeded
      : ['Actors']
  );
  const [otherTalentText, setOtherTalentText] = useState('');

  // Cover Image Poster States (Smart Category Defaults & 1-Click Presets)
  const initialCover =
    passedOpp?.image && !isBrokenImageUrl(passedOpp.image)
      ? passedOpp.image
      : getCategoryFallbackImage(
          passedOpp?.productionCategory || 'Film & TV',
          passedOpp?.productionType || 'Feature Film'
        );
  const [coverImage, setCoverImage] = useState(initialCover);
  const [customImageUrl, setCustomImageUrl] = useState('');
  const [showCustomUrlInput, setShowCustomUrlInput] = useState(false);

  // Default shoot date (30 days from now) and deadline (15 days from now)
  const todayIso = new Date().toISOString().split('T')[0];
  const defaultDeadline = new Date(Date.now() + 15 * 86400000).toISOString().split('T')[0];
  const defaultShoot = new Date(Date.now() + 35 * 86400000).toISOString().split('T')[0];

  const [shootDate, setShootDate] = useState(passedOpp?.shootDate || defaultShoot);
  const [applicationDeadline, setApplicationDeadline] = useState(
    passedOpp?.applicationDeadline || passedOpp?.deadline || defaultDeadline
  );
  const [location, setLocation] = useState(passedOpp?.location || 'Mumbai, India');
  const [artistsNeeded, setArtistsNeeded] = useState(passedOpp?.artistsNeeded || 5);

  const [compensationAmount, setCompensationAmount] = useState(
    passedOpp?.compensationAmount ? String(passedOpp.compensationAmount) : '50000'
  );
  const [currency, setCurrency] = useState(passedOpp?.currency || 'INR');
  const [paymentUnit, setPaymentUnit] = useState(passedOpp?.paymentUnit || 'Per Project');
  const [compensationType, setCompensationType] = useState(passedOpp?.compensationType || 'Paid');

  const [requirements, setRequirements] = useState(passedOpp?.requirements || '');
  const [projectDescription, setProjectDescription] = useState(passedOpp?.description || '');

  // Promo Code & Backend Pricing State
  const [promoCode, setPromoCode] = useState('');
  const [promoInput, setPromoInput] = useState('');
  const [pricingDetails, setPricingDetails] = useState(null);
  const [isLoadingPricing, setIsLoadingPricing] = useState(false);

  // UI state
  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [toastMessage, setToastMessage] = useState('');
  const [isPreviewOpen, setIsPreviewOpen] = useState(false);

  // Update company prefill when user context is ready
  useEffect(() => {
    if (user?.companyName && !productionCompany) {
      setProductionCompany(user.companyName);
    }
  }, [user]);

  const handleCategoryChange = (e) => {
    const cat = e.target.value;
    setProductionCategory(cat);
    const availableTypes = CATEGORY_JOB_TYPES[cat] || ['Other'];
    setProductionType(availableTypes[0]);
    // Auto-update cover image to match newly selected category unless user entered a custom URL
    if (!showCustomUrlInput) {
      setCoverImage(getCategoryFallbackImage(cat, availableTypes[0]));
    }
    if (errors.productionCategory) {
      setErrors((prev) => ({ ...prev, productionCategory: undefined }));
    }
  };

  const toggleTalentChip = (talent) => {
    let updated;
    if (selectedTalents.includes(talent)) {
      updated = selectedTalents.filter((t) => t !== talent);
    } else {
      updated = [...selectedTalents, talent];
    }
    setSelectedTalents(updated);
    if (errors.talents && updated.length > 0) {
      setErrors((prev) => ({ ...prev, talents: undefined }));
    }
  };

  // Compile Opportunity Object
  const getCompiledOpportunity = (status = 'pending_payment', customTitle, customDesc, customPricing) => {
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

    const formattedComp =
      compensationType === 'Unpaid'
        ? 'Unpaid / Experience Credit'
        : compensationType === 'Negotiable'
        ? 'Negotiable'
        : `${currency === 'INR' ? '₹' : '$'}${Number(compensationAmount || 0).toLocaleString()} / ${paymentUnit}`;

    const effectiveTitle =
      (customTitle !== undefined ? customTitle : castingTitle).trim() ||
      `${(productionCompany || 'StageLink Studios').trim()} — ${finalProductionType}`;

    const effectiveDesc =
      (customDesc !== undefined ? customDesc : projectDescription).trim() ||
      requirements.trim() ||
      'Verified production casting call.';

    const p = customPricing || pricingDetails;
    const authoritativeFee = p?.final_payable_amount || (currency === 'USD' ? 29 : 1999);

    const safeImage =
      coverImage && !isBrokenImageUrl(coverImage)
        ? coverImage
        : getCategoryFallbackImage(finalCategory, finalProductionType);

    return {
      id: passedOpp?.id || `opp-${Date.now()}`,
      refId: passedOpp?.refId || `PRD-${Math.floor(100000 + Math.random() * 900000)}`,
      title: effectiveTitle,
      image: safeImage,
      productionCompany: (productionCompany || '').trim() || 'StageLink Studios',
      productionCategory: finalCategory,
      productionType: finalProductionType,
      talentNeeded: finalTalents,
      shootDate: shootDate ? shootDate : 'Flexible / To be decided',
      deadline: applicationDeadline ? applicationDeadline : 'Open',
      applicationDeadline: applicationDeadline ? applicationDeadline : 'Open',
      location: location.trim() ? location.trim() : 'Open / Unspecified',
      artistsNeeded: Number(artistsNeeded) || 1,
      compensation: formattedComp,
      compensationAmount: Number(compensationAmount) || 0,
      currency,
      paymentUnit,
      compensationType,
      requirements: requirements.trim(),
      description: effectiveDesc,
      listingFee: authoritativeFee,
      taxAmount: p?.tax_amount || 0,
      discountAmount: p?.discount_amount || 0,
      finalPayableAmount: authoritativeFee,
      status,
      listingStatus: status,
      paymentStatus: status === 'draft' ? 'not_required' : 'pending',
      companyId: user?.id || 'comp-default',
      customerEmail: user?.email || 'recruiter@stagelink.com',
      customerPhone: user?.phoneNumber || '+91 98765 43210',
      createdAt: passedOpp?.createdAt || new Date().toISOString(),
    };
  };

  const validate = (overrideTitle, overrideDesc) => {
    const titleVal = (overrideTitle !== undefined ? overrideTitle : castingTitle).trim();
    const descVal = (overrideDesc !== undefined ? overrideDesc : projectDescription).trim();
    const newErrors = {};

    if (!productionCompany.trim()) {
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
    if (!titleVal) {
      newErrors.castingTitle = 'Casting / role title is required.';
    }
    if (selectedTalents.length === 0) {
      newErrors.talents = 'Select at least one talent needed.';
    }
    if (selectedTalents.includes('Other') && !otherTalentText.trim()) {
      newErrors.otherTalent = 'Please specify the other talent needed.';
    }
    if (!location.trim()) {
      newErrors.location = 'Location (city and country) is required.';
    }
    if (!shootDate) {
      newErrors.shootDate = 'Shoot date is required.';
    }
    if (!applicationDeadline) {
      newErrors.applicationDeadline = 'Application deadline is required.';
    }

    // Date relationship validation
    if (shootDate && applicationDeadline) {
      const shootD = new Date(shootDate);
      const appD = new Date(applicationDeadline);
      const today = new Date();
      today.setHours(0, 0, 0, 0);

      if (appD < today) {
        newErrors.applicationDeadline = 'Application deadline cannot be in the past.';
      }
      if (shootD < today) {
        newErrors.shootDate = 'Shoot date cannot be in the past.';
      }
      if (appD > shootD) {
        newErrors.applicationDeadline = 'Application deadline must be on or before the shoot date.';
      }
    }

    if (!artistsNeeded || Number(artistsNeeded) < 1 || !Number.isInteger(Number(artistsNeeded))) {
      newErrors.artistsNeeded = 'Artists needed must be a positive integer.';
    }
    if (!descVal) {
      newErrors.projectDescription = 'Project description is required.';
    }
    if (requirements.length > 500) {
      newErrors.requirements = 'Requirements must not exceed 500 characters.';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // 1. Save Draft
  const handleSaveDraft = (e) => {
    e.preventDefault();
    if (!productionCompany.trim() || !castingTitle.trim()) {
      setToastMessage('Please enter at least a Company Name and Casting Title to save a draft.');
      return;
    }

    const draft = getCompiledOpportunity('draft');
    castingService.saveDraft(draft);
    setToastMessage('Casting call saved as draft.');
    setTimeout(() => {
      navigate('/admin/opportunities');
    }, 1200);
  };

  // 2. Open Preview
  const handleOpenPreview = (e) => {
    e.preventDefault();
    if (!validate()) {
      setToastMessage('Please complete all required fields correctly to preview.');
      return;
    }
    setIsPreviewOpen(true);
  };

  // 3. Continue Directly to Payment Page (Redirect to /payment)
  const handleContinueToPayment = async (e) => {
    if (e) e.preventDefault();

    // Auto-fill smart defaults if title or description were left empty
    let effectiveTitle = castingTitle.trim();
    if (!effectiveTitle) {
      effectiveTitle = `${(productionCompany || 'StageLink Studios').trim()} — ${productionType || 'Feature Film'} Casting Call`;
      setCastingTitle(effectiveTitle);
    }

    let effectiveDesc = projectDescription.trim();
    if (!effectiveDesc) {
      effectiveDesc = `Official casting call by ${(productionCompany || 'StageLink Studios').trim()} for ${productionType || 'production'}. Selected performers will be contacted for callbacks and auditions.`;
      setProjectDescription(effectiveDesc);
    }

    const isValid = validate(effectiveTitle, effectiveDesc);
    if (!isValid) {
      setToastMessage('Please complete the highlighted required fields marked in red.');
      setTimeout(() => {
        const firstErrorEl = document.querySelector('.border-red-500');
        if (firstErrorEl) {
          firstErrorEl.scrollIntoView({ behavior: 'smooth', block: 'center' });
          firstErrorEl.focus?.();
        }
      }, 50);
      return;
    }

    setIsLoadingPricing(true);
    try {
      // 1. Fetch authoritative pricing (falls back to local pricing if backend unavailable)
      let pricing;
      try {
        pricing = await paymentService.fetchAuthoritativePricing(currency, promoCode);
      } catch {
        pricing = paymentService.calculateListingFee(currency);
      }
      setPricingDetails(pricing);

      // 2. Compile opportunity object
      const opportunity = getCompiledOpportunity('pending_payment', effectiveTitle, effectiveDesc, pricing);
      setPendingOpportunity(opportunity);

      // 3. Initialize backend order session if reachable
      try {
        await fetch('/api/opportunities/validate/', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(opportunity),
        });

        const orderSession = await paymentService.createOrderSession(opportunity, promoCode);
        if (orderSession?.orderId) {
          opportunity.paymentOrderId = orderSession.orderId;
        }
      } catch {
        // offline fallback
      }

      setPendingOpportunity(opportunity);

      // 4. Redirect immediately to the official Payment Page
      navigate('/payment', { state: { opportunity, pricingDetails: pricing } });
    } catch {
      const opportunity = getCompiledOpportunity('pending_payment', effectiveTitle, effectiveDesc);
      setPendingOpportunity(opportunity);
      navigate('/payment', { state: { opportunity } });
    } finally {
      setIsLoadingPricing(false);
    }
  };

  // Keep handleContinueToReview for optional Step 3 navigation
  const handleContinueToReview = async (e) => {
    return handleContinueToPayment(e);
  };

  // Apply Promo Code
  const handleApplyPromo = async (e) => {
    e.preventDefault();
    if (!promoInput.trim()) return;

    setIsLoadingPricing(true);
    const updated = await paymentService.fetchAuthoritativePricing(currency, promoInput.trim());
    setPricingDetails(updated);
    setPromoCode(promoInput.trim().toUpperCase());
    setIsLoadingPricing(false);

    if (updated?.discount_amount > 0) {
      setToastMessage(`Promo code ${promoInput.toUpperCase()} applied successfully!`);
    } else {
      setToastMessage('Invalid or expired promo code.');
    }
  };

  // 4. Proceed from Review to Payment (Step 4)
  const handleProceedToPayment = async (e) => {
    if (e) e.preventDefault();

    setIsSubmitting(true);
    let pricing = pricingDetails;
    if (!pricing || pricing.configured === false) {
      try {
        pricing = await paymentService.fetchAuthoritativePricing(currency, promoCode);
      } catch {
        pricing = paymentService.calculateListingFee(currency);
      }
      setPricingDetails(pricing);
    }

    const opportunity = getCompiledOpportunity('pending_payment', castingTitle, projectDescription, pricing);
    setPendingOpportunity(opportunity);

    try {
      // 1. Validate on backend
      await fetch('/api/opportunities/validate/', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(opportunity),
      });

      // 2. Initialize backend order session
      const orderSession = await paymentService.createOrderSession(opportunity, promoCode);
      if (orderSession?.orderId) {
        opportunity.paymentOrderId = orderSession.orderId;
        setPendingOpportunity(opportunity);
      }
    } catch {
      // offline fallback
    }

    setIsSubmitting(false);
    navigate('/payment', { state: { opportunity, pricingDetails: pricing } });
  };

  const handleInstantDemoRecruiter = async () => {
    try {
      if (setRecruiterSession) {
        setRecruiterSession({
          companyName: 'Apex Vision Studios',
          fullName: 'Marcus Sterling',
          email: 'recruiter@stagelink.com',
        });
      } else {
        authService.ensureRecruiterSession({
          companyName: 'Apex Vision Studios',
          fullName: 'Marcus Sterling',
          email: 'recruiter@stagelink.com',
        });
      }
      if (login) {
        await login('recruiter@stagelink.com', 'password123');
      }
      setProductionCompany('Apex Vision Studios');
      setToastMessage('Signed in as Marcus Sterling (Apex Vision Studios Recruiter). You can now announce work!');
    } catch (err) {
      console.warn('Demo login error:', err);
    }
  };

  const handleSwitchToRecruiter = () => {
    try {
      const company = user?.companyName || `${user?.fullName || 'StageLink'} Productions`;
      if (setRecruiterSession) {
        setRecruiterSession({
          fullName: user?.fullName,
          companyName: company,
          email: user?.email,
        });
      } else {
        authService.ensureRecruiterSession({
          fullName: user?.fullName,
          companyName: company,
          email: user?.email,
        });
      }
      setProductionCompany(company);
      setToastMessage(`Switched to Recruiter profile for ${company}! You can now announce work.`);
    } catch (err) {
      console.warn('Switch error:', err);
    }
  };

  // If user is not authenticated as a recruiter or admin, show simple, user-friendly registration gate
  if (!isRecruiter) {
    return (
      <div className="bg-neutral-50/70 min-h-screen text-gray-900 font-sans pb-24 text-left">
        {/* Top Header / Breadcrumb Bar */}
        <div className="bg-white border-b border-gray-200 sticky top-0 z-10 backdrop-blur-md bg-white/95">
          <PageContainer maxWidth="5xl" className="py-3.5">
            <div className="flex items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                <Link
                  to="/"
                  className="p-2 rounded-xl border border-gray-200 hover:border-gray-900 text-gray-600 hover:text-gray-900 transition-colors"
                  title="Return to Home"
                >
                  <ArrowLeft className="w-4 h-4" />
                </Link>
                <div>
                  <span className="text-[10px] font-bold uppercase tracking-wider text-brand-pink block">
                    Step 1 of 5 — Recruiter Verification &amp; Studio Access
                  </span>
                  <h1 className="text-lg sm:text-xl font-bold font-serif text-gray-900">
                    Announce Work &amp; Post a Casting Call
                  </h1>
                </div>
              </div>

              <div className="flex items-center gap-2 text-xs text-gray-500 font-medium">
                <span className="inline-flex items-center gap-1.5 text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-full border border-emerald-200 text-[11px] font-semibold">
                  <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
                  <span>Verified Recruiter Gate</span>
                </span>
              </div>
            </div>
          </PageContainer>
        </div>

        <PageContainer maxWidth="4xl" className="py-10">
          <WorkflowStepper currentStep={1} className="mb-8" />

          {/* Recruiter Gate Box */}
          <div className="bg-white rounded-3xl border border-gray-200 shadow-sm p-6 sm:p-10 max-w-2xl mx-auto space-y-6 text-center animate-in fade-in duration-200">
            <div className="w-16 h-16 rounded-2xl bg-gradient-to-tr from-pink-500 to-rose-600 text-white flex items-center justify-center mx-auto shadow-md">
              <Building2 className="w-8 h-8 stroke-[2.2]" />
            </div>

            <div className="space-y-2">
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-pink-50 border border-pink-200 text-brand-pink text-xs font-bold">
                <Sparkles className="w-3.5 h-3.5" />
                <span>Recruiter &amp; Production House Access Required</span>
              </div>
              <h2 className="text-2xl sm:text-3xl font-bold font-serif text-gray-900">
                Register as a Recruiter to Announce Work
              </h2>
              <p className="text-xs sm:text-sm text-gray-600 max-w-lg mx-auto leading-relaxed">
                To maintain verified casting standards and protect performers, only registered production companies, casting directors, and recruiters can post jobs on StageLink.
              </p>
            </div>

            {/* If logged in as candidate, show specific alert */}
            {isAuthenticated && user?.role === 'candidate' && (
              <div className="p-4 bg-amber-50 border border-amber-200 rounded-2xl text-left text-xs text-amber-900 space-y-2.5">
                <div className="flex items-center gap-2 font-bold text-amber-950">
                  <AlertCircle className="w-4 h-4 text-amber-600 shrink-0" />
                  <span>Signed in as Performer / Candidate ({user.fullName})</span>
                </div>
                <p className="text-[11px] text-amber-800 leading-relaxed">
                  Performer accounts cannot announce work. You can convert your account to a Recruiter profile right now or register a new production studio profile.
                </p>
                <button
                  type="button"
                  onClick={handleSwitchToRecruiter}
                  className="px-4 py-2 bg-amber-600 hover:bg-amber-700 text-white font-bold rounded-xl text-xs transition-colors cursor-pointer"
                >
                  Convert to Recruiter Profile &amp; Post Job
                </button>
              </div>
            )}

            {/* Benefits Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-left pt-2">
              <div className="p-3.5 rounded-2xl bg-gray-50 border border-gray-100 space-y-1">
                <div className="text-xs font-bold text-gray-900 flex items-center gap-1.5">
                  <Check className="w-3.5 h-3.5 text-emerald-600" />
                  <span>Verified Studio</span>
                </div>
                <p className="text-[11px] text-gray-500">
                  Official badge builds instant credibility with actors &amp; models.
                </p>
              </div>

              <div className="p-3.5 rounded-2xl bg-gray-50 border border-gray-100 space-y-1">
                <div className="text-xs font-bold text-gray-900 flex items-center gap-1.5">
                  <Check className="w-3.5 h-3.5 text-emerald-600" />
                  <span>Direct Showreels</span>
                </div>
                <p className="text-[11px] text-gray-500">
                  Receive video auditions &amp; self-tape submissions securely.
                </p>
              </div>

              <div className="p-3.5 rounded-2xl bg-gray-50 border border-gray-100 space-y-1">
                <div className="text-xs font-bold text-gray-900 flex items-center gap-1.5">
                  <Check className="w-3.5 h-3.5 text-emerald-600" />
                  <span>AI Talent Ranking</span>
                </div>
                <p className="text-[11px] text-gray-500">
                  Instantly rank applicants and invite matching talent in 1-click.
                </p>
              </div>
            </div>

            {/* Primary Action Buttons */}
            <div className="space-y-3 pt-3">
              <Link
                to="/signup?role=recruiter&redirect=/post-job"
                className="w-full py-3.5 px-6 bg-brand-pink hover:bg-rose-700 text-white font-bold text-xs uppercase tracking-wider rounded-xl shadow-md transition-all flex items-center justify-center gap-2 cursor-pointer"
              >
                <span>Register as Recruiter to Announce Work</span>
                <ArrowRight className="w-4 h-4" />
              </Link>

              <div className="flex flex-col sm:flex-row gap-2.5">
                <Link
                  to="/login?role=recruiter&redirect=/post-job"
                  className="flex-1 py-3 px-4 bg-white border border-gray-300 hover:border-gray-900 text-gray-800 font-bold text-xs rounded-xl transition-colors flex items-center justify-center gap-1.5"
                >
                  <span>Existing Recruiter? Log In</span>
                </Link>

                <button
                  type="button"
                  onClick={handleInstantDemoRecruiter}
                  className="flex-1 py-3 px-4 bg-neutral-900 hover:bg-black text-white font-bold text-xs rounded-xl shadow-xs transition-colors flex items-center justify-center gap-1.5 cursor-pointer"
                >
                  <Sparkles className="w-3.5 h-3.5 text-amber-300" />
                  <span>1-Click Demo Recruiter Login</span>
                </button>
              </div>
            </div>

            <p className="text-[11px] text-gray-400">
              Registration takes less than 60 seconds • Free recruiter profile setup
            </p>
          </div>
        </PageContainer>
        <Toast message={toastMessage} onClose={() => setToastMessage('')} />
      </div>
    );
  }

  return (
    <div className="bg-white min-h-screen text-gray-900 font-sans pb-24 pt-4 sm:pt-6 text-left">
      <PageContainer maxWidth="5xl" className="space-y-6 px-4 sm:px-6">
        {/* Navigation Breadcrumb */}
        <div className="flex items-center justify-between gap-3 border-b border-gray-100 pb-4">
          <Link
            to="/opportunities"
            className="inline-flex items-center gap-1.5 text-xs text-gray-500 hover:text-black font-medium transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Back to Opportunities</span>
          </Link>
          <div className="flex items-center gap-2">
            <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-pink-50 text-brand-pink text-xs font-bold border border-pink-200">
              <Sparkles className="w-3.5 h-3.5 text-brand-pink" />
              <span>Recruiter Workflow</span>
            </span>
          </div>
        </div>

        {/* 5-STEP WORKFLOW STEPPER */}
        <WorkflowStepper currentStep={currentStep} />


        {/* ================= STEP 2: CREATE JOB FORM ================= */}
        {currentStep === 2 && (
          <form onSubmit={handleContinueToPayment} className="space-y-6" noValidate>
            {/* Page Title & Subtitle */}
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <span className="text-[10px] font-bold uppercase tracking-wider text-brand-pink bg-pink-50 px-2.5 py-0.5 rounded-full border border-pink-200">
                  Step 2 of 5
                </span>
                <span className="text-xs text-gray-400">•</span>
                <span className="text-xs font-semibold text-gray-600">Announce Work Form</span>
              </div>
              <h1 className="text-2xl sm:text-3xl font-bold font-serif text-brand-navy">
                Create Casting Opportunity
              </h1>
              <p className="text-xs sm:text-sm text-gray-500">
                Post an audition notice to reach international actors, models, dancers, singers, and creators.
              </p>
            </div>

            {/* SECTION 1: PRODUCTION & CASTING BASICS */}
            <div className="bg-white rounded-3xl border border-gray-200 p-6 sm:p-8 shadow-xs space-y-6">
              <h2 className="text-sm font-bold uppercase tracking-wider text-gray-500 border-b border-gray-100 pb-2 flex items-center gap-2">
                <Building2 className="w-4 h-4 text-brand-pink" />
                <span>1. Production &amp; Role Overview</span>
              </h2>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {/* Production Company (Prefilled from Recruiter Profile) */}
                <div className="space-y-1.5">
                  <div className="flex items-center justify-between">
                    <label className="block text-xs font-bold text-brand-navy">
                      Production Company <span className="text-red-500">*</span>
                    </label>
                    <span className="text-[10px] font-mono text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                      Prefilled from Profile
                    </span>
                  </div>
                  <input
                    type="text"
                    value={productionCompany}
                    onChange={(e) => setProductionCompany(e.target.value)}
                    placeholder="e.g. Apex Vision Studios / Silverline Pictures"
                    className={`w-full px-3.5 py-2.5 bg-gray-50 border rounded-xl text-xs text-gray-900 focus:bg-white focus:outline-hidden focus:ring-2 focus:ring-pink-100 focus:border-brand-pink transition-colors ${
                      errors.productionCompany ? 'border-red-500' : 'border-gray-200'
                    }`}
                  />
                  {errors.productionCompany && (
                    <p className="text-[11px] text-red-500">{errors.productionCompany}</p>
                  )}
                </div>

                {/* Casting / Role Title */}
                <div className="space-y-1.5">
                  <label className="block text-xs font-bold text-brand-navy">
                    Job / Casting Title <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={castingTitle}
                    onChange={(e) => setCastingTitle(e.target.value)}
                    placeholder="e.g. Lead Female Protagonist — Echoes of the Crown"
                    className={`w-full px-3.5 py-2.5 bg-gray-50 border rounded-xl text-xs text-gray-900 focus:bg-white focus:outline-hidden focus:ring-2 focus:ring-pink-100 focus:border-brand-pink transition-colors ${
                      errors.castingTitle ? 'border-red-500' : 'border-gray-200'
                    }`}
                  />
                  {errors.castingTitle && (
                    <p className="text-[11px] text-red-500">{errors.castingTitle}</p>
                  )}
                </div>

                {/* Production Category */}
                <div className="space-y-1.5">
                  <label className="block text-xs font-bold text-brand-navy">
                    Production Category <span className="text-red-500">*</span>
                  </label>
                  <select
                    value={productionCategory}
                    onChange={handleCategoryChange}
                    className="w-full px-3.5 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-xs text-gray-900 focus:bg-white focus:outline-hidden focus:ring-2 focus:ring-pink-100 cursor-pointer"
                  >
                    {PRODUCTION_CATEGORIES.map((cat) => (
                      <option key={cat} value={cat}>
                        {cat}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Job / Production Type (Dependent Dropdown) */}
                <div className="space-y-1.5">
                  <label className="block text-xs font-bold text-brand-navy">
                    Production Type (Dependent) <span className="text-red-500">*</span>
                  </label>
                  <select
                    value={productionType}
                    onChange={(e) => setProductionType(e.target.value)}
                    className="w-full px-3.5 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-xs text-gray-900 focus:bg-white focus:outline-hidden focus:ring-2 focus:ring-pink-100 cursor-pointer"
                  >
                    {(CATEGORY_JOB_TYPES[productionCategory] || ['Other']).map((t) => (
                      <option key={t} value={t}>
                        {t}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Project Description */}
              <div className="space-y-1.5">
                <label className="block text-xs font-bold text-brand-navy">
                  Project Description <span className="text-red-500">*</span>
                </label>
                <textarea
                  rows={3}
                  value={projectDescription}
                  onChange={(e) => setProjectDescription(e.target.value)}
                  placeholder="Describe the production storyline, director's vision, character arcs, and audition expectations..."
                  className={`w-full px-3.5 py-2.5 bg-gray-50 border rounded-xl text-xs text-gray-900 focus:bg-white focus:outline-hidden focus:ring-2 focus:ring-pink-100 focus:border-brand-pink transition-colors resize-y ${
                    errors.projectDescription ? 'border-red-500' : 'border-gray-200'
                  }`}
                />
                {errors.projectDescription && (
                  <p className="text-[11px] text-red-500">{errors.projectDescription}</p>
                )}
              </div>

              {/* Cover Image / Project Poster Selector */}
              <div className="space-y-3 pt-3 border-t border-gray-100">
                <div className="flex items-center justify-between">
                  <div>
                    <label className="block text-xs font-bold text-brand-navy flex items-center gap-1.5">
                      <ImageIcon className="w-3.5 h-3.5 text-brand-pink" />
                      <span>Project Cover Poster</span>
                      <span className="text-[11px] font-normal text-emerald-700 bg-emerald-50 border border-emerald-200 px-2 py-0.2 rounded-full">
                        Auto-matched to Category
                      </span>
                    </label>
                    <p className="text-[11px] text-gray-500">
                      Choose a high-resolution cinematic preset below or paste a custom poster URL.
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={() => setShowCustomUrlInput(!showCustomUrlInput)}
                    className="text-[11px] font-bold text-brand-pink hover:underline cursor-pointer"
                  >
                    {showCustomUrlInput ? '← Use Cinematic Presets' : '+ Custom Poster URL'}
                  </button>
                </div>

                {/* 1-Click Cinematic Presets */}
                {!showCustomUrlInput ? (
                  <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-7 gap-2">
                    {CINEMATIC_PRESETS.map((preset) => {
                      const isSelected = coverImage === preset.url;
                      return (
                        <button
                          key={preset.id}
                          type="button"
                          onClick={() => setCoverImage(preset.url)}
                          className={`group relative rounded-xl overflow-hidden border-2 transition-all cursor-pointer text-left aspect-[16/10] bg-neutral-900 ${
                            isSelected
                              ? 'border-brand-pink ring-2 ring-brand-pink/30 scale-[1.02] shadow-sm'
                              : 'border-transparent opacity-75 hover:opacity-100 hover:border-gray-300'
                          }`}
                          title={`${preset.label} — ${preset.description}`}
                        >
                          <img
                            src={preset.url}
                            alt=""
                            className="w-full h-full object-cover"
                          />
                          <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/20 to-transparent" />
                          <div className="absolute bottom-1 left-1.5 right-1.5">
                            <span className="text-[10px] font-bold text-white line-clamp-1 block leading-tight">
                              {preset.label}
                            </span>
                          </div>
                          {isSelected && (
                            <div className="absolute top-1 right-1 w-4 h-4 rounded-full bg-brand-pink text-white flex items-center justify-center shadow-xs">
                              <Check className="w-2.5 h-2.5 stroke-[3]" />
                            </div>
                          )}
                        </button>
                      );
                    })}
                  </div>
                ) : (
                  <div className="flex gap-2">
                    <input
                      type="url"
                      value={customImageUrl}
                      onChange={(e) => {
                        setCustomImageUrl(e.target.value);
                        if (e.target.value.trim()) {
                          setCoverImage(e.target.value.trim());
                        }
                      }}
                      placeholder="Paste image URL (e.g. https://images.unsplash.com/...)"
                      className="flex-1 px-3.5 py-2 bg-gray-50 border border-gray-200 rounded-xl text-xs text-gray-900 focus:bg-white focus:outline-hidden focus:ring-2 focus:ring-pink-100 focus:border-brand-pink"
                    />
                    <button
                      type="button"
                      onClick={() => {
                        if (customImageUrl.trim()) {
                          setCoverImage(customImageUrl.trim());
                          setToastMessage('Custom cover poster applied.');
                        }
                      }}
                      className="px-4 py-2 bg-black hover:bg-neutral-800 text-white text-xs font-bold rounded-xl transition-colors cursor-pointer"
                    >
                      Apply
                    </button>
                  </div>
                )}

                {/* Selected Cover Image Live Banner Preview */}
                <div className="relative rounded-2xl overflow-hidden aspect-[21/9] max-h-32 border border-gray-200 bg-neutral-900 shadow-xs">
                  <img
                    src={coverImage}
                    alt=""
                    onError={() => {
                      setCoverImage(getCategoryFallbackImage(productionCategory, productionType));
                    }}
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/75 via-transparent to-black/30 pointer-events-none" />
                  <div className="absolute top-2.5 left-3 flex items-center gap-2">
                    <span className="px-2.5 py-0.5 bg-white/95 text-black font-bold text-[10px] rounded-full shadow-xs">
                      {productionCategory} — {productionType}
                    </span>
                    <span className="px-2 py-0.5 bg-black/60 text-white font-medium text-[10px] rounded-full backdrop-blur-sm">
                      Live Banner Preview
                    </span>
                  </div>
                  <div className="absolute bottom-2 left-3 right-3 text-white">
                    <p className="text-[10px] text-gray-300 uppercase tracking-wider font-semibold">
                      {productionCompany || 'Your Studio'}
                    </p>
                    <p className="text-xs sm:text-sm font-bold font-serif line-clamp-1">
                      {castingTitle || `${productionCompany || 'Studio'} — ${productionType}`}
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* SECTION 2: TALENT NEEDED & LOGISTICS */}
            <div className="bg-white rounded-3xl border border-gray-200 p-6 sm:p-8 shadow-xs space-y-6">
              <h2 className="text-sm font-bold uppercase tracking-wider text-gray-500 border-b border-gray-100 pb-2 flex items-center gap-2">
                <Users className="w-4 h-4 text-brand-pink" />
                <span>2. Talent Needed &amp; Schedule</span>
              </h2>

              {/* Talent Needed Multi-Select (Includes Singers!) */}
              <div className="space-y-2">
                <label className="block text-xs font-bold text-brand-navy">
                  Talent Needed (Multi-select) <span className="text-red-500">*</span>
                </label>
                <div className="flex flex-wrap gap-2">
                  {TALENT_CHIPS.map((chip) => {
                    const selected = selectedTalents.includes(chip);
                    return (
                      <button
                        key={chip}
                        type="button"
                        onClick={() => toggleTalentChip(chip)}
                        className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold border transition-all cursor-pointer ${
                          selected
                            ? 'bg-black text-white border-black shadow-xs'
                            : 'bg-gray-50 text-gray-700 border-gray-200 hover:bg-gray-100'
                        }`}
                      >
                        {chip}
                      </button>
                    );
                  })}
                </div>
                {selectedTalents.includes('Other') && (
                  <input
                    type="text"
                    value={otherTalentText}
                    onChange={(e) => setOtherTalentText(e.target.value)}
                    placeholder="Specify other talent type (e.g. Stunt Performer)"
                    className="mt-2 w-full px-3.5 py-2 bg-gray-50 border border-gray-200 rounded-xl text-xs"
                  />
                )}
                {errors.talents && <p className="text-[11px] text-red-500">{errors.talents}</p>}
              </div>

              {/* Schedule, Location, Openings Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                {/* Location (City & Country) */}
                <div className="space-y-1.5">
                  <label className="block text-xs font-bold text-brand-navy">
                    Location (City &amp; Country) <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={location}
                    onChange={(e) => setLocation(e.target.value)}
                    placeholder="e.g. Mumbai, India or London, UK"
                    className={`w-full px-3.5 py-2.5 bg-gray-50 border rounded-xl text-xs text-gray-900 focus:bg-white ${
                      errors.location ? 'border-red-500' : 'border-gray-200'
                    }`}
                  />
                  {errors.location && <p className="text-[11px] text-red-500">{errors.location}</p>}
                </div>

                {/* Shoot Date */}
                <div className="space-y-1.5">
                  <label className="block text-xs font-bold text-brand-navy">
                    Shoot Date <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="date"
                    min={todayIso}
                    value={shootDate}
                    onChange={(e) => setShootDate(e.target.value)}
                    className={`w-full px-3.5 py-2.5 bg-gray-50 border rounded-xl text-xs text-gray-900 focus:bg-white ${
                      errors.shootDate ? 'border-red-500' : 'border-gray-200'
                    }`}
                  />
                  {errors.shootDate && <p className="text-[11px] text-red-500">{errors.shootDate}</p>}
                </div>

                {/* Application Deadline */}
                <div className="space-y-1.5">
                  <label className="block text-xs font-bold text-brand-navy">
                    Application Deadline <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="date"
                    min={todayIso}
                    value={applicationDeadline}
                    onChange={(e) => setApplicationDeadline(e.target.value)}
                    className={`w-full px-3.5 py-2.5 bg-gray-50 border rounded-xl text-xs text-gray-900 focus:bg-white ${
                      errors.applicationDeadline ? 'border-red-500' : 'border-gray-200'
                    }`}
                  />
                  {errors.applicationDeadline && (
                    <p className="text-[11px] text-red-500">{errors.applicationDeadline}</p>
                  )}
                </div>

                {/* Artists Needed */}
                <div className="space-y-1.5">
                  <label className="block text-xs font-bold text-brand-navy">
                    Number of Artists Required <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="number"
                    min="1"
                    value={artistsNeeded}
                    onChange={(e) => setArtistsNeeded(e.target.value)}
                    className={`w-full px-3.5 py-2.5 bg-gray-50 border rounded-xl text-xs text-gray-900 focus:bg-white ${
                      errors.artistsNeeded ? 'border-red-500' : 'border-gray-200'
                    }`}
                  />
                  {errors.artistsNeeded && (
                    <p className="text-[11px] text-red-500">{errors.artistsNeeded}</p>
                  )}
                </div>
              </div>
            </div>

            {/* SECTION 3: COMPENSATION & REQUIREMENTS */}
            <div className="bg-white rounded-3xl border border-gray-200 p-6 sm:p-8 shadow-xs space-y-6">
              <h2 className="text-sm font-bold uppercase tracking-wider text-gray-500 border-b border-gray-100 pb-2 flex items-center gap-2">
                <Banknote className="w-4 h-4 text-brand-pink" />
                <span>3. Compensation &amp; Requirements</span>
              </h2>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                {/* Compensation Type */}
                <div className="space-y-1.5">
                  <label className="block text-xs font-bold text-brand-navy">
                    Compensation Type
                  </label>
                  <select
                    value={compensationType}
                    onChange={(e) => setCompensationType(e.target.value)}
                    className="w-full px-3.5 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-xs text-gray-900 cursor-pointer"
                  >
                    {COMPENSATION_TYPES.map((t) => (
                      <option key={t} value={t}>
                        {t}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Currency */}
                <div className="space-y-1.5">
                  <label className="block text-xs font-bold text-brand-navy">Currency</label>
                  <select
                    value={currency}
                    onChange={(e) => setCurrency(e.target.value)}
                    disabled={compensationType === 'Unpaid' || compensationType === 'Expenses Only'}
                    className="w-full px-3.5 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-xs text-gray-900 disabled:opacity-50 cursor-pointer"
                  >
                    <option value="INR">INR (₹)</option>
                    <option value="USD">USD ($)</option>
                  </select>
                </div>

                {/* Amount */}
                <div className="space-y-1.5">
                  <label className="block text-xs font-bold text-brand-navy">Amount</label>
                  <input
                    type="number"
                    disabled={compensationType === 'Unpaid' || compensationType === 'Negotiable'}
                    value={compensationAmount}
                    onChange={(e) => setCompensationAmount(e.target.value)}
                    className="w-full px-3.5 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-xs text-gray-900 focus:bg-white disabled:opacity-50"
                  />
                </div>

                {/* Payment Unit */}
                <div className="space-y-1.5">
                  <label className="block text-xs font-bold text-brand-navy">Payment Unit</label>
                  <select
                    value={paymentUnit}
                    onChange={(e) => setPaymentUnit(e.target.value)}
                    disabled={compensationType === 'Unpaid' || compensationType === 'Negotiable'}
                    className="w-full px-3.5 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-xs text-gray-900 disabled:opacity-50 cursor-pointer"
                  >
                    {PAYMENT_UNITS.map((u) => (
                      <option key={u} value={u}>
                        {u}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Requirements (Max 500 characters) */}
              <div className="space-y-1.5">
                <div className="flex items-center justify-between">
                  <label className="block text-xs font-bold text-brand-navy">
                    Requirements (Optional, max 500 characters)
                  </label>
                  <span
                    className={`text-[10px] font-mono ${
                      requirements.length > 500 ? 'text-red-500 font-bold' : 'text-gray-400'
                    }`}
                  >
                    {requirements.length} / 500 characters
                  </span>
                </div>
                <textarea
                  rows={3}
                  maxLength={550}
                  value={requirements}
                  onChange={(e) => setRequirements(e.target.value)}
                  placeholder="Specify required languages, age brackets, physical stamina, dialogue sample, or travel readiness..."
                  className={`w-full px-3.5 py-2.5 bg-gray-50 border rounded-xl text-xs text-gray-900 focus:bg-white resize-y ${
                    errors.requirements ? 'border-red-500' : 'border-gray-200'
                  }`}
                />
                {errors.requirements && (
                  <p className="text-[11px] text-red-500">{errors.requirements}</p>
                )}
              </div>
            </div>

            {/* Validation Error Banner */}
            {Object.keys(errors).length > 0 && (
              <div className="p-3.5 rounded-2xl bg-red-50 border border-red-200 text-red-700 text-xs flex items-center gap-2.5 animate-in fade-in">
                <AlertCircle className="w-4 h-4 text-red-600 shrink-0" />
                <span>
                  Please complete the required fields highlighted in red above before continuing to payment.
                </span>
              </div>
            )}

            {/* ACTION BUTTONS (Save Draft, Preview, Continue to Payment) */}
            <div className="bg-gray-50 rounded-2xl border border-gray-200 p-4 sm:p-6 flex flex-wrap items-center justify-between gap-4">
              <button
                type="button"
                onClick={handleSaveDraft}
                className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-white border border-gray-300 hover:bg-gray-100 text-xs font-bold text-gray-700 transition-colors cursor-pointer"
              >
                <Save className="w-4 h-4" />
                <span>Save Draft</span>
              </button>

              <div className="flex flex-wrap items-center gap-3">
                <button
                  type="button"
                  onClick={handleOpenPreview}
                  className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-pink-50 hover:bg-pink-100 text-brand-pink border border-pink-200 text-xs font-bold transition-colors cursor-pointer"
                >
                  <Eye className="w-4 h-4" />
                  <span>Preview Listing</span>
                </button>

                <button
                  type="submit"
                  disabled={isLoadingPricing}
                  className="inline-flex items-center gap-2 px-6 py-2.5 rounded-xl bg-brand-pink hover:bg-rose-700 text-white text-xs font-bold shadow-md transition-colors cursor-pointer disabled:opacity-50"
                >
                  {isLoadingPricing ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      <span>Redirecting to Payment...</span>
                    </>
                  ) : (
                    <>
                      <span>Continue to Payment</span>
                      <ArrowRight className="w-4 h-4" />
                    </>
                  )}
                </button>
              </div>
            </div>
          </form>
        )}

        {/* ================= STEP 3: REVIEW JOB & SHOW PUBLISHING FEES ================= */}
        {currentStep === 3 && (
          <div className="space-y-6 animate-in fade-in duration-200">
            {/* Header */}
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <span className="text-[10px] font-bold uppercase tracking-wider text-brand-pink bg-pink-50 px-2.5 py-0.5 rounded-full border border-pink-200">
                  Step 3 of 5
                </span>
                <span className="text-xs text-gray-400">•</span>
                <span className="text-xs font-semibold text-gray-600">Review &amp; Order Summary</span>
              </div>
              <h1 className="text-2xl sm:text-3xl font-bold font-serif text-brand-navy">
                Review Opportunity &amp; Publishing Fees
              </h1>
              <p className="text-xs sm:text-sm text-gray-500">
                Verify your casting call specifications and review authoritative publishing fees before checkout.
              </p>
            </div>

            {/* Check if pricing is configured */}
            {pricingDetails?.configured === false ? (
              <div className="p-5 rounded-2xl bg-amber-50 border border-amber-200 text-amber-900 space-y-2">
                <div className="flex items-center gap-2 font-bold text-sm">
                  <AlertCircle className="w-5 h-5 text-amber-600" />
                  <span>Pricing Configuration Required</span>
                </div>
                <p className="text-xs leading-relaxed">
                  Publishing fee plans have not been configured on the backend server. As per platform policy, creation of a real payment order is disabled until authoritative pricing is initialized.
                </p>
                <div className="pt-2">
                  <button
                    type="button"
                    onClick={() => setCurrentStep(2)}
                    className="px-4 py-2 bg-white border border-amber-300 rounded-xl text-xs font-bold text-amber-900 hover:bg-amber-100"
                  >
                    ← Edit Job Details
                  </button>
                </div>
              </div>
            ) : (
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
                {/* LEFT: JOB SPECIFICATIONS REVIEW */}
                <div className="lg:col-span-7 bg-white rounded-3xl border border-gray-200 p-6 sm:p-8 shadow-xs space-y-6">
                  <div className="flex items-center justify-between border-b border-gray-100 pb-3">
                    <h2 className="text-base font-bold font-serif text-gray-900 flex items-center gap-2">
                      <FileText className="w-4 h-4 text-brand-pink" />
                      <span>Opportunity Review</span>
                    </h2>
                    <button
                      type="button"
                      onClick={() => setCurrentStep(2)}
                      className="inline-flex items-center gap-1.5 text-xs font-bold text-brand-pink hover:underline cursor-pointer"
                    >
                      <Edit className="w-3.5 h-3.5" />
                      <span>Edit Job</span>
                    </button>
                  </div>

                  <div className="space-y-4 text-xs">
                    {/* Title */}
                    <div>
                      <span className="text-gray-400 block text-[11px] uppercase tracking-wider font-bold">
                        Casting Title
                      </span>
                      <p className="text-sm font-bold text-gray-900 mt-0.5">{castingTitle}</p>
                    </div>

                    {/* Production Company */}
                    <div>
                      <span className="text-gray-400 block text-[11px] uppercase tracking-wider font-bold">
                        Production Company
                      </span>
                      <p className="font-semibold text-gray-800 mt-0.5">{productionCompany}</p>
                    </div>

                    {/* Category & Type */}
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <span className="text-gray-400 block text-[11px] uppercase tracking-wider font-bold">
                          Category
                        </span>
                        <p className="font-medium text-gray-800 mt-0.5">{productionCategory}</p>
                      </div>
                      <div>
                        <span className="text-gray-400 block text-[11px] uppercase tracking-wider font-bold">
                          Production Type
                        </span>
                        <p className="font-medium text-gray-800 mt-0.5">{productionType}</p>
                      </div>
                    </div>

                    {/* Talent Needed */}
                    <div>
                      <span className="text-gray-400 block text-[11px] uppercase tracking-wider font-bold">
                        Talent Needed
                      </span>
                      <div className="flex flex-wrap gap-1.5 mt-1">
                        {selectedTalents.map((t) => (
                          <span
                            key={t}
                            className="px-2.5 py-1 rounded-lg bg-gray-100 text-gray-800 text-[11px] font-semibold"
                          >
                            {t}
                          </span>
                        ))}
                      </div>
                    </div>

                    {/* Shoot Date & Location */}
                    <div className="grid grid-cols-2 gap-4 pt-1">
                      <div>
                        <span className="text-gray-400 block text-[11px] uppercase tracking-wider font-bold">
                          Shoot Date
                        </span>
                        <p className="font-medium text-gray-800 mt-0.5">{shootDate}</p>
                      </div>
                      <div>
                        <span className="text-gray-400 block text-[11px] uppercase tracking-wider font-bold">
                          Location
                        </span>
                        <p className="font-medium text-gray-800 mt-0.5">{location}</p>
                      </div>
                    </div>

                    {/* Openings & Compensation */}
                    <div className="grid grid-cols-2 gap-4 pt-1">
                      <div>
                        <span className="text-gray-400 block text-[11px] uppercase tracking-wider font-bold">
                          Number of Openings
                        </span>
                        <p className="font-bold text-gray-900 mt-0.5">{artistsNeeded} Artists</p>
                      </div>
                      <div>
                        <span className="text-gray-400 block text-[11px] uppercase tracking-wider font-bold">
                          Compensation Terms
                        </span>
                        <p className="font-medium text-gray-800 mt-0.5">
                          {compensationType === 'Paid'
                            ? `${currency === 'INR' ? '₹' : '$'}${Number(
                                compensationAmount
                              ).toLocaleString()} / ${paymentUnit}`
                            : compensationType}
                        </p>
                      </div>
                    </div>

                    {/* Application Deadline */}
                    <div className="pt-1">
                      <span className="text-gray-400 block text-[11px] uppercase tracking-wider font-bold">
                        Application Deadline
                      </span>
                      <p className="font-medium text-gray-800 mt-0.5">{applicationDeadline}</p>
                    </div>

                    {/* Requirements */}
                    {requirements && (
                      <div className="pt-1 border-t border-gray-100">
                        <span className="text-gray-400 block text-[11px] uppercase tracking-wider font-bold">
                          Requirements
                        </span>
                        <p className="text-gray-600 mt-0.5 leading-relaxed">{requirements}</p>
                      </div>
                    )}
                  </div>
                </div>

                {/* RIGHT: AUTHORITATIVE ORDER SUMMARY & PRICING */}
                <div className="lg:col-span-5 bg-white rounded-3xl border border-gray-200 p-6 sm:p-7 shadow-xs space-y-5">
                  <div className="flex items-center justify-between border-b border-gray-100 pb-3">
                    <h3 className="text-base font-bold font-serif text-gray-900">
                      Publishing Order Summary
                    </h3>
                    <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-pink-50 text-brand-pink border border-pink-200">
                      Standard Plan
                    </span>
                  </div>

                  {/* Promo Code Input */}
                  <div className="p-3.5 rounded-2xl bg-gray-50 border border-gray-200/80 space-y-2">
                    <label className="block text-[11px] font-bold text-gray-700">
                      Promo Code or Discount Voucher
                    </label>
                    <div className="flex gap-2">
                      <input
                        type="text"
                        value={promoInput}
                        onChange={(e) => setPromoInput(e.target.value.toUpperCase())}
                        placeholder="e.g. STAGE10"
                        className="flex-1 px-3 py-1.5 bg-white border border-gray-200 rounded-xl text-xs font-mono uppercase focus:outline-none focus:border-brand-pink"
                      />
                      <button
                        type="button"
                        onClick={handleApplyPromo}
                        className="px-3.5 py-1.5 bg-black hover:bg-neutral-800 text-white rounded-xl text-xs font-bold transition-colors cursor-pointer"
                      >
                        Apply
                      </button>
                    </div>
                    <p className="text-[10px] text-gray-400">
                      Try <span className="font-mono font-bold text-brand-pink">STAGE10</span> for 10% discount.
                    </p>
                  </div>

                  {/* Price Breakdown */}
                  <div className="space-y-3 text-xs divide-y divide-gray-100 pt-1">
                    <div className="flex justify-between items-center pt-1">
                      <span className="text-gray-500">Authoritative Listing Fee:</span>
                      <span className="font-mono font-bold text-gray-900">
                        {pricingDetails?.symbol}
                        {pricingDetails?.listing_fee?.toLocaleString()}
                      </span>
                    </div>

                    {pricingDetails?.discount_amount > 0 && (
                      <div className="flex justify-between items-center pt-3 text-emerald-700">
                        <span className="font-medium">Discount Applied:</span>
                        <span className="font-mono font-bold">
                          - {pricingDetails?.symbol}
                          {pricingDetails?.discount_amount?.toLocaleString()}
                        </span>
                      </div>
                    )}

                    <div className="flex justify-between items-center pt-3">
                      <span className="text-gray-500">
                        {pricingDetails?.tax_name || 'Applicable Tax'}:
                      </span>
                      <span className="font-mono font-medium text-gray-800">
                        {pricingDetails?.tax_amount > 0
                          ? `${pricingDetails?.symbol}${pricingDetails?.tax_amount?.toLocaleString()}`
                          : 'Included'}
                      </span>
                    </div>

                    <div className="flex justify-between items-center pt-3 text-sm">
                      <span className="font-bold text-gray-900">Final Payable Amount:</span>
                      <span className="font-bold font-serif text-brand-pink text-lg">
                        {pricingDetails?.symbol}
                        {pricingDetails?.final_payable_amount?.toLocaleString()}
                      </span>
                    </div>
                  </div>

                  {/* Policy Notice */}
                  <div className="p-3 bg-pink-50/60 rounded-xl border border-pink-100 text-[11px] text-gray-600 leading-relaxed space-y-1">
                    <p className="font-semibold text-gray-900 flex items-center gap-1.5">
                      <ShieldCheck className="w-3.5 h-3.5 text-brand-pink" />
                      <span>Server-Side Payment Verification</span>
                    </p>
                    <p>
                      Clicking proceed validates the opportunity on the backend, saves a temporary order in Pending Payment, and opens the official Juspay gateway.
                    </p>
                  </div>

                  {/* Actions: Edit Job & Proceed to Payment */}
                  <div className="space-y-2.5 pt-2">
                    <button
                      type="button"
                      onClick={handleProceedToPayment}
                      disabled={isSubmitting}
                      className="w-full py-3.5 px-6 bg-brand-pink hover:bg-rose-700 text-white font-bold text-xs uppercase tracking-wider rounded-xl shadow-md transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
                    >
                      {isSubmitting ? (
                        <>
                          <Loader2 className="w-4 h-4 animate-spin" />
                          <span>Initializing Order...</span>
                        </>
                      ) : (
                        <>
                          <Lock className="w-4 h-4" />
                          <span>
                            Proceed to Payment ({pricingDetails?.symbol}
                            {pricingDetails?.final_payable_amount?.toLocaleString()})
                          </span>
                        </>
                      )}
                    </button>

                    <button
                      type="button"
                      onClick={() => setCurrentStep(2)}
                      className="w-full py-2.5 px-4 bg-gray-100 hover:bg-gray-200 text-gray-700 font-bold text-xs rounded-xl transition-colors cursor-pointer"
                    >
                      Edit Job Details
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Listing Preview Modal */}
        <OpportunityPreviewModal
          isOpen={isPreviewOpen}
          onClose={() => setIsPreviewOpen(false)}
          opportunity={getCompiledOpportunity('preview')}
          onProceedToPayment={handleContinueToReview}
        />

        <Toast message={toastMessage} onClose={() => setToastMessage('')} />
      </PageContainer>
    </div>
  );
};

export default PostJobPage;
