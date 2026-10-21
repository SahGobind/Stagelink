import React, { useState } from 'react';
import { useLocation, useNavigate, Link } from 'react-router-dom';
import {
  ShieldCheck,
  Lock,
  CreditCard,
  CheckCircle2,
  ArrowLeft,
  Calendar,
  MapPin,
  Users,
  AlertCircle,
  Clock,
  Printer,
  ExternalLink,
  Sparkles,
  Edit,
  Info,
  Smartphone,
  Building,
  Check,
  ChevronDown,
  HelpCircle,
} from 'lucide-react';
import PageContainer from '../../components/layout/PageContainer';
import WorkflowStepper from '../../components/opportunities/WorkflowStepper';
import { paymentService } from '../../services/paymentService';
import {
  getPendingOpportunity,
  publishOpportunity,
  setPostingPaymentCompleted,
  saveCustomOpportunity,
} from '../../utils/paymentAccess';
import { authService } from '../../services/authService';

const DEFAULT_OPPORTUNITY = {
  id: 'opp-demo-casting',
  refId: 'PRD-842910',
  title: 'Apex Vision Studios — Feature Film',
  productionCompany: 'Apex Vision Studios',
  productionCategory: 'Film & TV',
  productionType: 'Feature Film',
  talentNeeded: ['Actors / Screen Artists', 'Dancers / Performers'],
  shootDate: 'Flexible / To be decided',
  location: 'Mumbai, India',
  artistsNeeded: 5,
  requirements: 'High stamina for choreographed group movement and expressive camera acting.',
  listingFee: 1999,
  currency: 'INR',
};

const POPULAR_BANKS = [
  { id: 'HDFC', name: 'HDFC Bank', popular: true },
  { id: 'ICICI', name: 'ICICI Bank', popular: true },
  { id: 'SBI', name: 'State Bank of India', popular: true },
  { id: 'AXIS', name: 'Axis Bank', popular: true },
  { id: 'KOTAK', name: 'Kotak Mahindra Bank', popular: false },
  { id: 'PNB', name: 'Punjab National Bank', popular: false },
  { id: 'BOB', name: 'Bank of Baroda', popular: false },
];

const PaymentPage = () => {
  const location = useLocation();
  const navigate = useNavigate();

  // Retrieve opportunity from navigation state, sessionStorage, or fallback
  const [opportunity] = useState(() => {
    if (location.state?.opportunity) {
      return location.state.opportunity;
    }
    const pending = getPendingOpportunity();
    if (pending) {
      return pending;
    }
    return DEFAULT_OPPORTUNITY;
  });

  const configDetails = paymentService.getConfigDetails();
  const pricing = location.state?.pricingDetails;

  // Accurate transparent pricing calculations
  const baseFee = pricing?.listing_fee || (opportunity.currency === 'USD' ? 29 : 1999);
  const taxRate = pricing?.tax_rate !== undefined ? pricing.tax_rate : (opportunity.currency === 'USD' ? 0 : 0.18);
  const taxAmount =
    pricing?.tax_amount !== undefined
      ? pricing.tax_amount
      : Math.round(baseFee * taxRate * 100) / 100;
  const discountAmount = pricing?.discount_amount || 0;
  const finalPayable =
    pricing?.final_payable_amount ||
    Math.round((baseFee + taxAmount - discountAmount) * 100) / 100;
  const currencySymbol = pricing?.symbol || (opportunity.currency === 'USD' ? '$' : '₹');

  // Payment Method Tabs: 'card' | 'upi' | 'netbanking'
  const [paymentMethodTab, setPaymentMethodTab] = useState('card');

  // Card Inputs
  const [cardName, setCardName] = useState(
    opportunity.productionCompany ? `${opportunity.productionCompany} Recruiter` : 'Production Recruiter'
  );
  const [cardNumber, setCardNumber] = useState('4242 4242 4242 4242');
  const [cardExpiry, setCardExpiry] = useState('12/28');
  const [cardCvv, setCardCvv] = useState('883');
  const [saveCard, setSaveCard] = useState(true);

  // UPI Inputs
  const [upiId, setUpiId] = useState('recruiter@okhdfcbank');

  // Net Banking Inputs
  const [selectedBank, setSelectedBank] = useState('HDFC');

  // General States
  const [agreeTerms, setAgreeTerms] = useState(true);
  const [isProcessing, setIsProcessing] = useState(false);
  const [processingStep, setProcessingStep] = useState('');
  const [paymentResult, setPaymentResult] = useState(null);
  const [errorMsg, setErrorMsg] = useState('');
  const [infoNotice, setInfoNotice] = useState('');

  // Optional QA Controls (collapsed by default)
  const [showQaControls, setShowQaControls] = useState(false);
  const [simulationOutcome, setSimulationOutcome] = useState('success');

  // Format Card Number
  const handleCardNumberChange = (e) => {
    const raw = e.target.value.replace(/\D/g, '').slice(0, 16);
    const formatted = raw.replace(/(\d{4})/g, '$1 ').trim();
    setCardNumber(formatted || e.target.value);
  };

  // Format Expiry Date
  const handleExpiryChange = (e) => {
    const raw = e.target.value.replace(/\D/g, '').slice(0, 4);
    if (raw.length >= 3) {
      setCardExpiry(`${raw.slice(0, 2)}/${raw.slice(2)}`);
    } else {
      setCardExpiry(raw);
    }
  };

  // Process Payment Submission
  const handleProcessPayment = async (e) => {
    e.preventDefault();
    setErrorMsg('');
    setInfoNotice('');

    if (!agreeTerms) {
      setErrorMsg('Please accept the publication terms to proceed.');
      return;
    }

    if (paymentMethodTab === 'upi' && !upiId.trim()) {
      setErrorMsg('Please enter a valid UPI ID (e.g. yourname@okhdfcbank).');
      return;
    }

    setIsProcessing(true);
    setProcessingStep('Connecting to secure payment gateway...');
    await new Promise((r) => setTimeout(r, 600));

    setProcessingStep('Verifying order and authorizing payment...');
    await new Promise((r) => setTimeout(r, 700));

    const orderId = opportunity.paymentOrderId || `ORD-${Date.now()}`;
    const txnId = `TXN-JSP-${Math.floor(100000 + Math.random() * 900000)}`;

    const methodLabel =
      paymentMethodTab === 'upi'
        ? `UPI (${upiId.trim()})`
        : paymentMethodTab === 'netbanking'
        ? `Net Banking (${selectedBank})`
        : configDetails.isConfigured
        ? 'Juspay HyperCheckout'
        : 'Credit / Debit Card';

    try {
      setProcessingStep('Publishing casting call live on StageLink...');
      const verifyResult = await paymentService.verifyPaymentServerSide({
        orderId,
        opportunityId: opportunity.id,
        paymentMethod: methodLabel,
        txnId,
        simulationStatus: configDetails.isConfigured ? 'success' : simulationOutcome,
      });

      if (!verifyResult.verified) {
        setIsProcessing(false);
        if (verifyResult.status === 'failed') {
          saveCustomOpportunity({
            ...opportunity,
            status: 'payment_failed',
            listingStatus: 'payment_failed',
            paymentStatus: 'failed',
            paymentOrderId: orderId,
          });
          setErrorMsg(
            verifyResult.message ||
              'Payment was not authorized. No charges were made. You can try again or use another payment method.'
          );
        } else if (verifyResult.status === 'cancelled') {
          saveCustomOpportunity({
            ...opportunity,
            status: 'pending_payment',
            listingStatus: 'pending_payment',
            paymentStatus: 'cancelled',
            paymentOrderId: orderId,
          });
          setInfoNotice('Transaction was cancelled. No charges were made.');
        } else if (verifyResult.status === 'pending') {
          saveCustomOpportunity({
            ...opportunity,
            status: 'pending_payment',
            listingStatus: 'pending_payment',
            paymentStatus: 'pending',
            paymentOrderId: orderId,
          });
          setInfoNotice('Transaction is awaiting bank authorization.');
        }
        return;
      }

      // Automatically publish casting call live upon confirmed payment
      const published = publishOpportunity(
        {
          ...opportunity,
          status: 'published',
          listingStatus: 'published',
          isOpen: true,
          paymentStatus: 'paid',
        },
        txnId,
        methodLabel
      );

      setPostingPaymentCompleted(true);

      // Ensure recruiter session so user has seamless dashboard access
      authService.ensureRecruiterSession({
        companyName: published?.productionCompany || opportunity.productionCompany,
        email: published?.email || opportunity.email,
        fullName: published?.recruiterName || `${published?.productionCompany || 'Studio'} Recruiter`,
      });

      setPaymentResult({
        txnId,
        orderId,
        paymentMethod: methodLabel,
        opportunity: published || opportunity,
        paidAt: new Date().toLocaleString(),
        listingStatus: 'published',
        isSimulation: !configDetails.isConfigured,
      });

      setIsProcessing(false);
    } catch (err) {
      setIsProcessing(false);
      setErrorMsg(`Payment verification failed: ${err.message || 'Network error'}. Please try again.`);
    }
  };

  return (
    <div className="bg-neutral-50/70 min-h-screen text-gray-900 font-sans pb-24 text-left">
      {/* Top Header / Breadcrumb Bar */}
      <div className="bg-white border-b border-gray-200 sticky top-0 z-10 backdrop-blur-md bg-white/95">
        <PageContainer maxWidth="6xl" className="py-3.5">
          <div className="flex items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={() => navigate('/post-job', { state: { opportunity } })}
                className="p-2 rounded-xl border border-gray-200 hover:border-gray-900 text-gray-600 hover:text-gray-900 transition-colors cursor-pointer"
                title="Return to Job Details"
              >
                <ArrowLeft className="w-4 h-4" />
              </button>
              <div>
                <span className="text-[10px] font-bold uppercase tracking-wider text-brand-pink block">
                  {paymentResult ? 'Step 5 of 5 — Confirmation & Live Publication' : 'Step 4 of 5 — Secure Payment'}
                </span>
                <h1 className="text-lg sm:text-xl font-bold font-serif text-gray-900">
                  {paymentResult ? 'Payment Verified & Opportunity Published' : 'Secure Checkout & Listing Activation'}
                </h1>
              </div>
            </div>

            <div className="flex items-center gap-2 text-xs text-gray-500 font-medium">
              <span className="hidden sm:inline-flex items-center gap-1.5 text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-full border border-emerald-200 text-[11px] font-semibold">
                <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
                <span>256-Bit SSL Encrypted</span>
              </span>
            </div>
          </div>
        </PageContainer>
      </div>

      <PageContainer maxWidth="6xl" className="py-8">
        {/* Workflow Stepper */}
        <WorkflowStepper currentStep={paymentResult ? 5 : 4} className="mb-8" />

        {!paymentResult ? (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
            {/* LEFT COLUMN: Modern, Simple Payment Interface */}
            <div className="lg:col-span-7 space-y-6">
              {/* Test / Sandbox Notice (Polite & Subtle) */}
              {!configDetails.isConfigured && (
                <div className="p-3.5 rounded-2xl bg-pink-50/70 border border-pink-200/80 flex items-center justify-between gap-3 text-xs text-neutral-800">
                  <div className="flex items-center gap-2">
                    <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-white text-brand-pink border border-pink-200 shrink-0">
                      Demo Mode
                    </span>
                    <span className="text-[11px] text-gray-700">
                      Test checkout active. You can proceed without any real money deduction.
                    </span>
                  </div>
                  <button
                    type="button"
                    onClick={() => setShowQaControls((prev) => !prev)}
                    className="text-[10px] font-semibold text-brand-pink hover:underline shrink-0 cursor-pointer"
                  >
                    {showQaControls ? 'Hide QA Options' : 'QA Options'}
                  </button>
                </div>
              )}

              {/* Collapsible QA Testing Options (Kept clean & hidden for normal users) */}
              {!configDetails.isConfigured && showQaControls && (
                <div className="p-4 rounded-2xl bg-white border border-gray-200 shadow-2xs space-y-2.5 animate-in fade-in duration-150">
                  <div className="flex items-center justify-between">
                    <label className="text-[11px] font-bold text-gray-700 uppercase tracking-wider">
                      Simulate Transaction Outcome:
                    </label>
                    <span className="text-[10px] text-gray-400">For platform QA testing only</span>
                  </div>
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                    {[
                      { id: 'success', label: 'Success (Approve)' },
                      { id: 'failed', label: 'Decline / Fail' },
                      { id: 'pending', label: 'Pending Auth' },
                      { id: 'cancelled', label: 'User Cancel' },
                    ].map((opt) => (
                      <button
                        key={opt.id}
                        type="button"
                        onClick={() => setSimulationOutcome(opt.id)}
                        className={`px-3 py-1.5 rounded-xl border text-xs font-semibold transition-all cursor-pointer ${
                          simulationOutcome === opt.id
                            ? 'bg-black text-white border-black font-bold'
                            : 'bg-gray-50 border-gray-200 text-gray-700 hover:bg-gray-100'
                        }`}
                      >
                        {opt.label}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Main Payment Card Box */}
              <div className="bg-white rounded-3xl border border-gray-200 p-6 sm:p-8 shadow-xs space-y-6">
                {/* Section Header */}
                <div className="border-b border-gray-100 pb-4">
                  <h2 className="text-base sm:text-lg font-bold font-serif text-gray-900">
                    Select Payment Method
                  </h2>
                  <p className="text-xs text-gray-500 mt-0.5">
                    Choose your preferred payment method to complete verification and publish.
                  </p>
                </div>

                {/* Modern Payment Method Tabs */}
                <div className="grid grid-cols-3 gap-2 p-1.5 bg-gray-100/80 rounded-2xl">
                  <button
                    type="button"
                    onClick={() => setPaymentMethodTab('card')}
                    className={`py-3 px-2 sm:px-4 rounded-xl text-xs font-bold transition-all flex flex-col sm:flex-row items-center justify-center gap-1.5 cursor-pointer ${
                      paymentMethodTab === 'card'
                        ? 'bg-white text-black shadow-xs ring-1 ring-black/5'
                        : 'text-gray-500 hover:text-gray-900'
                    }`}
                  >
                    <CreditCard className="w-4 h-4" />
                    <span>Card</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setPaymentMethodTab('upi')}
                    className={`py-3 px-2 sm:px-4 rounded-xl text-xs font-bold transition-all flex flex-col sm:flex-row items-center justify-center gap-1.5 cursor-pointer ${
                      paymentMethodTab === 'upi'
                        ? 'bg-white text-black shadow-xs ring-1 ring-black/5'
                        : 'text-gray-500 hover:text-gray-900'
                    }`}
                  >
                    <Smartphone className="w-4 h-4" />
                    <span>UPI / QR</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setPaymentMethodTab('netbanking')}
                    className={`py-3 px-2 sm:px-4 rounded-xl text-xs font-bold transition-all flex flex-col sm:flex-row items-center justify-center gap-1.5 cursor-pointer ${
                      paymentMethodTab === 'netbanking'
                        ? 'bg-white text-black shadow-xs ring-1 ring-black/5'
                        : 'text-gray-500 hover:text-gray-900'
                    }`}
                  >
                    <Building className="w-4 h-4" />
                    <span>Net Banking</span>
                  </button>
                </div>

                {/* Form Elements Based on Selected Tab */}
                <form onSubmit={handleProcessPayment} className="space-y-4 pt-1">
                  {/* TAB 1: CREDIT / DEBIT CARD */}
                  {paymentMethodTab === 'card' && (
                    <div className="space-y-4 animate-in fade-in duration-150">
                      <div className="space-y-1.5">
                        <label className="block text-xs font-bold text-gray-800">
                          Name on Card <span className="text-red-500">*</span>
                        </label>
                        <input
                          type="text"
                          required
                          value={cardName}
                          onChange={(e) => setCardName(e.target.value)}
                          placeholder="e.g. Apex Vision Studios Recruiter"
                          className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-xs sm:text-sm text-gray-900 focus:bg-white focus:outline-none focus:border-brand-pink focus:ring-2 focus:ring-pink-100 transition-all"
                        />
                      </div>

                      <div className="space-y-1.5">
                        <div className="flex items-center justify-between">
                          <label className="block text-xs font-bold text-gray-800">
                            Card Number <span className="text-red-500">*</span>
                          </label>
                          <div className="flex items-center gap-1.5 text-[10px] text-gray-400 font-semibold uppercase">
                            <span>Visa</span> • <span>Mastercard</span> • <span>RuPay</span>
                          </div>
                        </div>
                        <div className="relative">
                          <input
                            type="text"
                            required
                            value={cardNumber}
                            onChange={handleCardNumberChange}
                            placeholder="4242 4242 4242 4242"
                            className="w-full pl-4 pr-10 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-xs sm:text-sm text-gray-900 font-mono tracking-wider focus:bg-white focus:outline-none focus:border-brand-pink focus:ring-2 focus:ring-pink-100 transition-all"
                          />
                          <CreditCard className="w-4 h-4 text-gray-400 absolute right-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                        </div>
                      </div>

                      <div className="grid grid-cols-2 gap-3">
                        <div className="space-y-1.5">
                          <label className="block text-xs font-bold text-gray-800">
                            Expiry Date <span className="text-red-500">*</span>
                          </label>
                          <input
                            type="text"
                            required
                            value={cardExpiry}
                            onChange={handleExpiryChange}
                            placeholder="MM/YY"
                            maxLength={5}
                            className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-xs sm:text-sm text-gray-900 font-mono focus:bg-white focus:outline-none focus:border-brand-pink focus:ring-2 focus:ring-pink-100 transition-all"
                          />
                        </div>
                        <div className="space-y-1.5">
                          <label className="block text-xs font-bold text-gray-800">
                            CVV / CVC <span className="text-red-500">*</span>
                          </label>
                          <input
                            type="password"
                            required
                            maxLength={4}
                            value={cardCvv}
                            onChange={(e) => setCardCvv(e.target.value.replace(/\D/g, ''))}
                            placeholder="•••"
                            className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-xs sm:text-sm text-gray-900 font-mono focus:bg-white focus:outline-none focus:border-brand-pink focus:ring-2 focus:ring-pink-100 transition-all"
                          />
                        </div>
                      </div>

                      <label className="flex items-center gap-2 cursor-pointer text-xs text-gray-600 pt-1">
                        <input
                          type="checkbox"
                          checked={saveCard}
                          onChange={(e) => setSaveCard(e.target.checked)}
                          className="rounded border-gray-300 text-brand-pink focus:ring-brand-pink cursor-pointer"
                        />
                        <span>Save card securely for future casting call publications</span>
                      </label>
                    </div>
                  )}

                  {/* TAB 2: UPI / QR CODE */}
                  {paymentMethodTab === 'upi' && (
                    <div className="space-y-4 animate-in fade-in duration-150">
                      <div className="space-y-1.5">
                        <label className="block text-xs font-bold text-gray-800">
                          Enter UPI ID / VPA <span className="text-red-500">*</span>
                        </label>
                        <input
                          type="text"
                          required
                          value={upiId}
                          onChange={(e) => setUpiId(e.target.value)}
                          placeholder="e.g. yourname@okhdfcbank or 9876543210@paytm"
                          className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-xs sm:text-sm text-gray-900 focus:bg-white focus:outline-none focus:border-brand-pink focus:ring-2 focus:ring-pink-100 transition-all font-mono"
                        />
                      </div>

                      {/* Quick Apps Selection */}
                      <div className="space-y-1.5">
                        <span className="text-[11px] font-semibold text-gray-500 block">
                          Supported Apps:
                        </span>
                        <div className="grid grid-cols-4 gap-2 text-center text-xs">
                          {['Google Pay', 'PhonePe', 'Paytm', 'BHIM UPI'].map((app) => (
                            <div
                              key={app}
                              className="p-2.5 rounded-xl border border-gray-200 bg-gray-50 font-medium text-gray-700 text-[11px]"
                            >
                              {app}
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                  )}

                  {/* TAB 3: NET BANKING */}
                  {paymentMethodTab === 'netbanking' && (
                    <div className="space-y-4 animate-in fade-in duration-150">
                      <div className="space-y-1.5">
                        <label className="block text-xs font-bold text-gray-800">
                          Popular Indian Banks
                        </label>
                        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                          {POPULAR_BANKS.filter((b) => b.popular).map((bank) => (
                            <button
                              key={bank.id}
                              type="button"
                              onClick={() => setSelectedBank(bank.id)}
                              className={`p-3 rounded-xl border text-xs font-bold transition-all text-center cursor-pointer ${
                                selectedBank === bank.id
                                  ? 'border-brand-pink bg-pink-50 text-brand-pink ring-1 ring-brand-pink shadow-xs'
                                  : 'border-gray-200 bg-gray-50 text-gray-700 hover:bg-white'
                              }`}
                            >
                              {bank.name}
                            </button>
                          ))}
                        </div>
                      </div>

                      <div className="space-y-1.5">
                        <label className="block text-xs font-bold text-gray-800">
                          Or Choose from All Banks
                        </label>
                        <select
                          value={selectedBank}
                          onChange={(e) => setSelectedBank(e.target.value)}
                          className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-xs sm:text-sm text-gray-900 focus:bg-white focus:outline-none focus:border-brand-pink"
                        >
                          {POPULAR_BANKS.map((b) => (
                            <option key={b.id} value={b.id}>
                              {b.name}
                            </option>
                          ))}
                        </select>
                      </div>
                    </div>
                  )}

                  {/* Agreement Terms */}
                  <div className="pt-2 border-t border-gray-100">
                    <label className="flex items-start gap-2.5 cursor-pointer text-xs text-gray-600 leading-relaxed">
                      <input
                        type="checkbox"
                        checked={agreeTerms}
                        onChange={(e) => setAgreeTerms(e.target.checked)}
                        className="mt-0.5 rounded border-gray-300 text-brand-pink focus:ring-brand-pink cursor-pointer"
                      />
                      <span>
                        I confirm that the casting call information is accurate and agree to publish it live on StageLink.
                      </span>
                    </label>
                  </div>

                  {/* Error & Info Alerts */}
                  {errorMsg && (
                    <div className="p-3.5 rounded-2xl bg-red-50 border border-red-200 text-xs text-red-700 flex items-center gap-2">
                      <AlertCircle className="w-4 h-4 shrink-0 text-red-500" />
                      <span>{errorMsg}</span>
                    </div>
                  )}

                  {infoNotice && (
                    <div className="p-3.5 rounded-2xl bg-amber-50 border border-amber-200 text-xs text-amber-800 flex items-center gap-2">
                      <Info className="w-4 h-4 shrink-0 text-amber-600" />
                      <span>{infoNotice}</span>
                    </div>
                  )}

                  {/* Primary Pay & Publish Button */}
                  <div className="pt-2">
                    <button
                      type="submit"
                      disabled={isProcessing}
                      className="w-full py-4 px-6 bg-brand-pink hover:bg-rose-700 text-white font-bold text-sm rounded-2xl shadow-md transition-all active:scale-[0.99] flex items-center justify-center gap-2 cursor-pointer disabled:opacity-75 disabled:cursor-not-allowed"
                    >
                      {isProcessing ? (
                        <>
                          <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                          <span>{processingStep}</span>
                        </>
                      ) : (
                        <>
                          <Lock className="w-4 h-4" />
                          <span>
                            Pay {currencySymbol}
                            {finalPayable.toLocaleString()} &amp; Publish Casting Call
                          </span>
                        </>
                      )}
                    </button>
                  </div>
                </form>

                {/* Guarantees & Trust Footnote */}
                <div className="pt-2 border-t border-gray-100 grid grid-cols-1 sm:grid-cols-3 gap-3 text-center text-[11px] text-gray-500">
                  <div className="flex items-center justify-center gap-1.5 font-medium">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                    <span>Instant Live Publishing</span>
                  </div>
                  <div className="flex items-center justify-center gap-1.5 font-medium">
                    <ShieldCheck className="w-3.5 h-3.5 text-blue-600" />
                    <span>256-Bit SSL Protection</span>
                  </div>
                  <div className="flex items-center justify-center gap-1.5 font-medium">
                    <Printer className="w-3.5 h-3.5 text-gray-600" />
                    <span>GST Invoice Generated</span>
                  </div>
                </div>
              </div>
            </div>

            {/* RIGHT COLUMN: Clean, Concise Order & Opportunity Summary */}
            <div className="lg:col-span-5 space-y-5">
              <div className="bg-white rounded-3xl border border-gray-200 p-6 sm:p-7 shadow-xs space-y-5">
                {/* Header */}
                <div className="flex items-center justify-between border-b border-gray-100 pb-3">
                  <h3 className="text-base font-bold font-serif text-gray-900">
                    Order Summary
                  </h3>
                  <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
                    Standard Listing
                  </span>
                </div>

                {/* Opportunity Details Card */}
                <div className="space-y-3">
                  <div>
                    <span className="text-[10px] font-bold uppercase tracking-wider text-gray-400 block">
                      Production &amp; Role
                    </span>
                    <h4 className="text-sm font-bold text-gray-900 font-serif mt-0.5">
                      {opportunity.title}
                    </h4>
                    <p className="text-xs text-gray-600 font-medium mt-0.5">
                      {opportunity.productionCompany}
                    </p>
                  </div>

                  {/* Attribute Chips */}
                  <div className="flex flex-wrap gap-1.5 pt-1">
                    <span className="px-2.5 py-1 rounded-lg bg-gray-100 text-gray-800 text-[11px] font-medium flex items-center gap-1">
                      <Users className="w-3 h-3 text-gray-500" />
                      <span>{opportunity.artistsNeeded || 1} Openings</span>
                    </span>

                    <span className="px-2.5 py-1 rounded-lg bg-gray-100 text-gray-800 text-[11px] font-medium flex items-center gap-1">
                      <MapPin className="w-3 h-3 text-gray-500" />
                      <span>{opportunity.location || 'Mumbai, India'}</span>
                    </span>

                    <span className="px-2.5 py-1 rounded-lg bg-gray-100 text-gray-800 text-[11px] font-medium flex items-center gap-1">
                      <Calendar className="w-3 h-3 text-gray-500" />
                      <span>Shoot: {opportunity.shootDate || 'Flexible'}</span>
                    </span>
                  </div>

                  {/* Compensation */}
                  <div className="text-xs text-gray-600 pt-1">
                    <span className="text-gray-400 text-[11px]">Compensation: </span>
                    <span className="font-semibold text-gray-800">
                      {opportunity.compensation || 'Paid'}
                    </span>
                  </div>
                </div>

                {/* Accurate Price Breakdown */}
                <div className="p-4 rounded-2xl bg-gray-50 border border-gray-200/80 space-y-2.5 text-xs">
                  <div className="flex justify-between text-gray-600">
                    <span>Base Listing Fee:</span>
                    <span className="font-mono font-medium text-gray-900">
                      {currencySymbol}
                      {baseFee.toLocaleString()}
                    </span>
                  </div>

                  {taxAmount > 0 && (
                    <div className="flex justify-between text-gray-600">
                      <span>Applicable GST (18%):</span>
                      <span className="font-mono font-medium text-gray-900">
                        {currencySymbol}
                        {taxAmount.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                      </span>
                    </div>
                  )}

                  {discountAmount > 0 && (
                    <div className="flex justify-between text-emerald-700 font-semibold">
                      <span>Promo Discount ({opportunity.promoCode || 'APPLIED'}):</span>
                      <span className="font-mono">
                        -{currencySymbol}
                        {discountAmount.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                      </span>
                    </div>
                  )}

                  <div className="flex justify-between items-center text-gray-900 font-bold pt-2.5 border-t border-gray-200">
                    <span className="text-sm">Final Payable Amount:</span>
                    <span className="font-serif font-extrabold text-brand-pink text-lg sm:text-xl">
                      {currencySymbol}
                      {finalPayable.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                    </span>
                  </div>
                </div>

                {/* Edit Button */}
                <button
                  type="button"
                  onClick={() => navigate('/post-job', { state: { opportunity } })}
                  className="w-full py-2.5 px-4 bg-white border border-gray-300 hover:border-gray-900 text-gray-800 rounded-xl font-bold text-xs flex items-center justify-center gap-2 transition-colors cursor-pointer"
                >
                  <Edit className="w-3.5 h-3.5 text-gray-500" />
                  <span>Edit Job Details</span>
                </button>

                {/* What Happens Next Card */}
                <div className="p-4 rounded-2xl bg-pink-50/50 border border-pink-100 text-xs space-y-2">
                  <div className="flex items-center gap-1.5 font-bold text-gray-900">
                    <Sparkles className="w-3.5 h-3.5 text-brand-pink" />
                    <span>What Happens After Payment:</span>
                  </div>
                  <ul className="text-[11px] text-gray-600 space-y-1.5">
                    <li className="flex items-center gap-1.5">
                      <span className="w-4 h-4 rounded-full bg-pink-100 text-brand-pink font-bold text-[10px] flex items-center justify-center shrink-0">1</span>
                      <span>Listing published immediately on the public casting board</span>
                    </li>
                    <li className="flex items-center gap-1.5">
                      <span className="w-4 h-4 rounded-full bg-pink-100 text-brand-pink font-bold text-[10px] flex items-center justify-center shrink-0">2</span>
                      <span>Verified performers start applying with self-tape reels</span>
                    </li>
                    <li className="flex items-center gap-1.5">
                      <span className="w-4 h-4 rounded-full bg-pink-100 text-brand-pink font-bold text-[10px] flex items-center justify-center shrink-0">3</span>
                      <span>AI candidate ranking &amp; audition invitations unlocked</span>
                    </li>
                  </ul>
                </div>
              </div>
            </div>
          </div>
        ) : (
          /* PAYMENT SUCCESS & RECEIPT SCREEN */
          <div className="max-w-2xl mx-auto bg-white rounded-3xl border border-gray-200 p-8 sm:p-10 shadow-xl text-center space-y-7 animate-in fade-in duration-300">
            <div className="w-20 h-20 rounded-full bg-emerald-50 border-2 border-emerald-200 text-emerald-600 flex items-center justify-center mx-auto shadow-xs">
              <CheckCircle2 className="w-10 h-10 stroke-[2.5]" />
            </div>

            <div className="space-y-2">
              <span className="text-xs font-bold text-emerald-700 uppercase tracking-widest block">
                ✓ Payment Verified • Casting Call Published Live!
              </span>
              <h2 className="text-2xl sm:text-3xl font-bold font-serif text-gray-900">
                Payment Confirmed &amp; Published Live!
              </h2>
              <p className="text-xs sm:text-sm text-gray-600 max-w-md mx-auto leading-relaxed">
                Your payment of{' '}
                <strong className="text-gray-900 font-bold">
                  {currencySymbol}
                  {finalPayable.toLocaleString()}
                </strong>{' '}
                was verified via{' '}
                <strong className="text-brand-pink font-bold">
                  {paymentResult?.paymentMethod}
                </strong>
                . Your casting call is now <strong className="text-emerald-700 font-bold">published live inside Discover Talent</strong> and across StageLink!
              </p>
              {paymentResult.isSimulation && (
                <div className="inline-block mt-2 px-3 py-1 bg-neutral-100 border border-neutral-200 rounded-full text-[11px] text-gray-600 font-medium">
                  Processed via Demo Test Checkout (No real card charges made)
                </div>
              )}
            </div>

            {/* Official Digital Receipt Box */}
            <div className="bg-gray-50 rounded-2xl border border-gray-200 p-6 text-left text-xs space-y-3">
              <div className="flex justify-between items-center border-b border-gray-200/80 pb-3">
                <span className="text-gray-500 font-medium">Transaction ID:</span>
                <span className="font-mono font-bold text-gray-900 bg-white px-2.5 py-1 rounded border border-gray-200">
                  {paymentResult?.txnId}
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-500 font-medium">Listing Status:</span>
                <span className="inline-flex items-center gap-1 font-bold text-emerald-700 bg-emerald-50 px-2.5 py-0.5 rounded-full border border-emerald-200 text-[11px]">
                  <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                  <span>Published Live in Discover Talent</span>
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-500 font-medium">Listing Reference:</span>
                <span className="font-mono font-bold text-gray-900">
                  {paymentResult?.opportunity?.refId || opportunity.refId}
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-500 font-medium">Production Company:</span>
                <span className="font-bold text-gray-900">
                  {paymentResult?.opportunity?.productionCompany || opportunity.productionCompany}
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-500 font-medium">Payment Option:</span>
                <span className="font-semibold text-brand-pink">
                  {paymentResult?.paymentMethod}
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-500 font-medium">Amount Verified:</span>
                <span className="font-bold text-emerald-700 text-sm font-mono">
                  {currencySymbol}
                  {finalPayable.toLocaleString()}
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-500 font-medium">Timestamp:</span>
                <span className="font-medium text-gray-800">{paymentResult?.paidAt}</span>
              </div>
            </div>

            {/* Navigation Actions */}
            <div className="flex flex-col sm:flex-row gap-3 pt-2">
              <Link
                to="/discover-talent"
                state={{
                  newlyPublishedOpp: paymentResult?.opportunity || opportunity,
                  activeTab: 'jobs',
                }}
                className="flex-1 py-3.5 px-5 bg-brand-pink hover:bg-rose-700 text-white font-bold text-xs uppercase tracking-wider rounded-xl shadow-md transition-colors flex items-center justify-center gap-2 cursor-pointer"
              >
                <Sparkles className="w-4 h-4" />
                <span>View in Discover Talent →</span>
              </Link>
              <Link
                to="/opportunities"
                className="py-3.5 px-4 bg-white border border-gray-300 hover:border-gray-900 text-gray-800 font-bold text-xs uppercase tracking-wider rounded-xl transition-colors flex items-center justify-center gap-1.5 cursor-pointer"
              >
                <span>Casting Calls</span>
                <ExternalLink className="w-3.5 h-3.5" />
              </Link>
              <Link
                to="/admin/opportunities"
                onClick={() => {
                  authService.ensureRecruiterSession({
                    companyName: paymentResult?.opportunity?.productionCompany || opportunity.productionCompany,
                  });
                }}
                className="py-3.5 px-4 bg-gray-900 hover:bg-black text-white font-bold text-xs uppercase tracking-wider rounded-xl shadow-md transition-colors flex items-center justify-center gap-1.5 cursor-pointer"
              >
                <span>Recruiter Dashboard</span>
              </Link>
              <button
                type="button"
                onClick={() => window.print()}
                className="py-3.5 px-3.5 bg-white border border-gray-300 hover:border-gray-900 text-gray-700 font-bold text-xs rounded-xl transition-colors flex items-center justify-center gap-1.5 cursor-pointer"
              >
                <Printer className="w-3.5 h-3.5" />
                <span>Print</span>
              </button>
            </div>
          </div>
        )}
      </PageContainer>
    </div>
  );
};

export default PaymentPage;
