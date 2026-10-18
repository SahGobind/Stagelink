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
  HelpCircle,
  Clock,
  Printer,
  ChevronRight,
  ExternalLink,
  Sparkles,
  DollarSign,
  ArrowRight,
  Eye,
} from 'lucide-react';
import PageContainer from '../../components/layout/PageContainer';
import {
  getPendingOpportunity,
  publishOpportunity,
  setPostingPaymentCompleted,
} from '../../utils/paymentAccess';

const DEFAULT_OPPORTUNITY = {
  id: 'opp-demo-casting',
  refId: 'PRD-842910',
  title: 'Apex Vision Studios — Feature Film',
  productionCompany: 'Apex Vision Studios',
  productionCategory: 'Film & TV',
  productionType: 'Feature Film',
  talentNeeded: ['Actors / Screen Artists', 'Dancers / Performers'],
  shootDate: 'Flexible / To be decided',
  location: 'Open / Unspecified',
  artistsNeeded: 5,
  requirements: 'High stamina for choreographed group movement and expressive camera acting.',
  listingFee: 1999,
  currency: 'INR',
};

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

  // Payment Method: 'juicepay' (Credit Card) or 'paypal'
  const [paymentMethod, setPaymentMethod] = useState('juicepay');

  // JuicePay Card State
  const [cardName, setCardName] = useState(
    opportunity.productionCompany ? `${opportunity.productionCompany} Recruiter` : 'Production Recruiter'
  );
  const [cardNumber, setCardNumber] = useState('4242 4242 4242 4242');
  const [cardExpiry, setCardExpiry] = useState('12/28');
  const [cardCvv, setCardCvv] = useState('883');
  const [cardZip, setCardZip] = useState('400001');

  // PayPal State
  const [paypalEmail, setPaypalEmail] = useState(
    opportunity.customerEmail || 'casting-finance@production.com'
  );
  const [paypalRemember, setPaypalRemember] = useState(true);

  // General States
  const [agreeTerms, setAgreeTerms] = useState(true);
  const [isProcessing, setIsProcessing] = useState(false);
  const [processingStep, setProcessingStep] = useState('');
  const [isPaidSuccess, setIsPaidSuccess] = useState(false);
  const [paymentResult, setPaymentResult] = useState(null);
  const [errorMsg, setErrorMsg] = useState('');

  const listingFee = opportunity.listingFee || 1999;
  const currencySymbol = '₹';

  // Handle Card formatting
  const handleCardNumberChange = (e) => {
    const raw = e.target.value.replace(/\D/g, '').slice(0, 16);
    const formatted = raw.replace(/(\d{4})/g, '$1 ').trim();
    setCardNumber(formatted || e.target.value);
  };

  const handleExpiryChange = (e) => {
    const raw = e.target.value.replace(/\D/g, '').slice(0, 4);
    if (raw.length >= 3) {
      setCardExpiry(`${raw.slice(0, 2)}/${raw.slice(2)}`);
    } else {
      setCardExpiry(raw);
    }
  };

  const handleProcessPayment = (e) => {
    e.preventDefault();
    setErrorMsg('');

    if (!agreeTerms) {
      setErrorMsg('Please accept the payment terms & conditions to proceed.');
      return;
    }

    if (paymentMethod === 'juicepay') {
      const cleanCard = cardNumber.replace(/\s+/g, '');
      if (cleanCard.length < 15) {
        setErrorMsg('Please enter a valid 16-digit credit card number.');
        return;
      }
      if (!cardExpiry.includes('/')) {
        setErrorMsg('Please enter expiry in MM/YY format.');
        return;
      }
      if (cardCvv.length < 3) {
        setErrorMsg('Please enter a 3 or 4 digit CVV.');
        return;
      }
    } else if (paymentMethod === 'paypal') {
      if (!paypalEmail || !paypalEmail.includes('@')) {
        setErrorMsg('Please enter a valid PayPal email address.');
        return;
      }
    }

    setIsProcessing(true);

    const methodName =
      paymentMethod === 'juicepay' ? 'JuicePay (Credit Card)' : 'PayPal Express';

    // Simulated multi-step authorization sequence
    setProcessingStep(
      paymentMethod === 'juicepay'
        ? 'Connecting to JuicePay Payment Gateway...'
        : 'Connecting to PayPal Secure Authorization...'
    );

    setTimeout(() => {
      setProcessingStep(
        paymentMethod === 'juicepay'
          ? 'Verifying 3D Secure 2.0 Token with Bank...'
          : 'Validating PayPal Express Checkout Token...'
      );
    }, 900);

    setTimeout(() => {
      setProcessingStep('Publishing casting post & unlocking candidate directory...');
    }, 1800);

    setTimeout(() => {
      const txnId = `TXN-${paymentMethod === 'juicepay' ? 'JP' : 'PP'}-${Math.floor(
        100000 + Math.random() * 900000
      )}`;

      // 1. Publish opportunity live in localStorage and unlock candidate access
      const published = publishOpportunity(opportunity, txnId, methodName);

      // 2. Notify backend server
      try {
        fetch('/api/opportunities/confirm-payment', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            opportunityId: opportunity.id,
            orderId: opportunity.paymentOrderId || `ORD-${Date.now()}`,
            txnId,
            paymentMethod: methodName,
            title: opportunity.title,
            productionCompany: opportunity.productionCompany,
            category: opportunity.productionCategory || opportunity.category,
            type: opportunity.productionType || opportunity.type,
            talentNeeded: opportunity.talentNeeded,
            shootDate: opportunity.shootDate,
            location: opportunity.location,
            artistsNeeded: opportunity.artistsNeeded,
            requirements: opportunity.requirements,
          }),
        }).catch(() => {});
      } catch {
        // offline fallback
      }

      // 3. Mark payment completed in system
      setPostingPaymentCompleted(true);

      setPaymentResult({
        txnId,
        paymentMethod: methodName,
        opportunity: published || opportunity,
        paidAt: new Date().toLocaleString(),
      });

      setIsProcessing(false);
      setIsPaidSuccess(true);
    }, 2800);
  };

  return (
    <div className="bg-neutral-50/80 min-h-screen text-gray-900 font-sans pb-24 text-left">
      {/* Top Header / Breadcrumb Bar */}
      <div className="bg-white border-b border-gray-200">
        <PageContainer maxWidth="6xl" className="py-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={() => navigate(-1)}
                className="p-2 rounded-xl border border-gray-200 hover:border-gray-900 text-gray-600 hover:text-gray-900 transition-colors cursor-pointer"
                title="Return to Announcement"
              >
                <ArrowLeft className="w-4 h-4" />
              </button>
              <div>
                <div className="flex items-center gap-2">
                  <span className="text-[11px] font-bold uppercase tracking-wider text-brand-pink">
                    Step 2 of 2 — Publication Payment
                  </span>
                  <span className="text-gray-300">•</span>
                  <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-md border border-emerald-200">
                    <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
                    <span>256-Bit SSL Encrypted Checkout</span>
                  </span>
                </div>
                <h1 className="text-xl sm:text-2xl font-bold font-serif text-gray-900">
                  Choose Payment Option &amp; Publish Post
                </h1>
              </div>
            </div>

            {/* Step Progress Pill */}
            <div className="hidden md:flex items-center gap-2 text-xs">
              <Link
                to="/post-job"
                className="text-gray-500 hover:text-gray-900 flex items-center gap-1.5 font-medium transition-colors"
              >
                <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                <span>1. Announce Work</span>
              </Link>
              <ChevronRight className="w-3.5 h-3.5 text-gray-300" />
              <span className="text-gray-900 font-bold flex items-center gap-1.5 bg-pink-50 text-brand-pink px-3 py-1 rounded-lg border border-pink-200">
                <span className="w-4 h-4 rounded-full bg-brand-pink text-white text-[10px] flex items-center justify-center font-bold">
                  2
                </span>
                <span>Payment &amp; Publish</span>
              </span>
            </div>
          </div>
        </PageContainer>
      </div>

      <PageContainer maxWidth="6xl" className="py-8">
        {!isPaidSuccess ? (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
            {/* LEFT COLUMN: Payment Method Selection & Form (7 Cols) */}
            <div className="lg:col-span-7 space-y-6">
              {/* Payment Methods Box */}
              <div className="bg-white rounded-3xl border border-gray-200 p-6 sm:p-7 shadow-xs space-y-6">
                <div className="flex items-center justify-between border-b border-gray-100 pb-4">
                  <div>
                    <h2 className="text-base sm:text-lg font-bold font-serif text-gray-900">
                      Select Payment Option
                    </h2>
                    <p className="text-xs text-gray-500">
                      Choose your preferred payment gateway. Once completed, your post goes live and candidate profiles unlock immediately.
                    </p>
                  </div>
                  <Lock className="w-4 h-4 text-gray-400" />
                </div>

                {/* Method Options: JuicePay vs PayPal */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {/* JuicePay via Credit Card */}
                  <button
                    type="button"
                    onClick={() => {
                      setPaymentMethod('juicepay');
                      setErrorMsg('');
                    }}
                    className={`p-4 rounded-2xl border text-left transition-all cursor-pointer flex flex-col justify-between gap-3 ${
                      paymentMethod === 'juicepay'
                        ? 'border-brand-pink bg-pink-50/70 text-gray-900 ring-2 ring-pink-100 shadow-sm'
                        : 'border-gray-200 bg-white hover:border-gray-300 text-gray-700'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <CreditCard
                          className={`w-5 h-5 ${
                            paymentMethod === 'juicepay' ? 'text-brand-pink' : 'text-gray-400'
                          }`}
                        />
                        <span className="text-xs font-bold uppercase tracking-wider text-brand-pink">
                          JuicePay
                        </span>
                      </div>
                      <span className="text-[10px] font-bold bg-white px-2 py-0.5 rounded border border-gray-200 text-gray-600">
                        Credit Card
                      </span>
                    </div>

                    <div>
                      <div className="text-sm font-bold">JuicePay Credit Card</div>
                      <div className="text-[11px] text-gray-500">
                        Visa, Mastercard, Amex, RuPay
                      </div>
                    </div>

                    <div className="flex items-center gap-1.5 pt-1 text-[10px] text-emerald-700 font-semibold">
                      <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
                      <span>3D Secure 2.0 Protected</span>
                    </div>
                  </button>

                  {/* PayPal */}
                  <button
                    type="button"
                    onClick={() => {
                      setPaymentMethod('paypal');
                      setErrorMsg('');
                    }}
                    className={`p-4 rounded-2xl border text-left transition-all cursor-pointer flex flex-col justify-between gap-3 ${
                      paymentMethod === 'paypal'
                        ? 'border-[#003087] bg-blue-50/60 text-gray-900 ring-2 ring-blue-100 shadow-sm'
                        : 'border-gray-200 bg-white hover:border-gray-300 text-gray-700'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-1 text-sm font-extrabold tracking-tight">
                        <span className="text-[#003087]">Pay</span>
                        <span className="text-[#0079C1]">Pal</span>
                      </div>
                      <span className="text-[10px] font-bold bg-[#FFC439] text-[#003087] px-2 py-0.5 rounded shadow-2xs">
                        Express Checkout
                      </span>
                    </div>

                    <div>
                      <div className="text-sm font-bold text-gray-900">PayPal</div>
                      <div className="text-[11px] text-gray-500">
                        PayPal Balance, Bank, or Global Cards
                      </div>
                    </div>

                    <div className="flex items-center gap-1.5 pt-1 text-[10px] text-blue-800 font-semibold">
                      <ShieldCheck className="w-3.5 h-3.5 text-blue-600" />
                      <span>PayPal Buyer Protection</span>
                    </div>
                  </button>
                </div>

                {/* FORM: JuicePay via Credit Card */}
                {paymentMethod === 'juicepay' && (
                  <form onSubmit={handleProcessPayment} className="space-y-4 pt-2">
                    <div className="p-3 rounded-xl bg-pink-50/50 border border-pink-100 text-xs text-gray-700 flex items-center justify-between">
                      <span className="flex items-center gap-1.5 font-semibold text-gray-900">
                        <CreditCard className="w-4 h-4 text-brand-pink" />
                        <span>JuicePay Direct Gateway</span>
                      </span>
                      <span className="text-[10px] font-mono text-gray-500">
                        PCI-DSS Level 1 Compliant
                      </span>
                    </div>

                    <div className="space-y-1.5">
                      <label className="block text-xs font-bold text-gray-800">
                        Cardholder Name <span className="text-brand-pink">*</span>
                      </label>
                      <input
                        type="text"
                        required
                        value={cardName}
                        onChange={(e) => setCardName(e.target.value)}
                        placeholder="Name on card / Production company"
                        className="w-full px-4 py-2.5 bg-white border border-gray-200 rounded-xl text-xs sm:text-sm text-gray-900 focus:outline-none focus:border-brand-pink focus:ring-2 focus:ring-pink-100 transition-all"
                      />
                    </div>

                    <div className="space-y-1.5">
                      <div className="flex items-center justify-between">
                        <label className="block text-xs font-bold text-gray-800">
                          Card Number <span className="text-brand-pink">*</span>
                        </label>
                        <div className="flex items-center gap-1.5 text-[10px] font-bold text-gray-400">
                          <span>VISA</span>
                          <span>•</span>
                          <span>MASTERCARD</span>
                          <span>•</span>
                          <span>AMEX</span>
                          <span>•</span>
                          <span>RUPAY</span>
                        </div>
                      </div>
                      <div className="relative">
                        <input
                          type="text"
                          required
                          value={cardNumber}
                          onChange={handleCardNumberChange}
                          placeholder="4242 4242 4242 4242"
                          className="w-full pl-4 pr-10 py-2.5 bg-white border border-gray-200 rounded-xl text-xs sm:text-sm font-mono text-gray-900 focus:outline-none focus:border-brand-pink focus:ring-2 focus:ring-pink-100 transition-all tracking-wider"
                        />
                        <Lock className="w-4 h-4 text-gray-400 absolute right-3.5 top-1/2 -translate-y-1/2" />
                      </div>
                    </div>

                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                      <div className="space-y-1.5">
                        <label className="block text-xs font-bold text-gray-800">
                          Expiry Date (MM/YY) <span className="text-brand-pink">*</span>
                        </label>
                        <input
                          type="text"
                          required
                          maxLength={5}
                          value={cardExpiry}
                          onChange={handleExpiryChange}
                          placeholder="MM/YY"
                          className="w-full px-4 py-2.5 bg-white border border-gray-200 rounded-xl text-xs sm:text-sm font-mono text-gray-900 focus:outline-none focus:border-brand-pink text-center"
                        />
                      </div>

                      <div className="space-y-1.5">
                        <div className="flex items-center justify-between">
                          <label className="block text-xs font-bold text-gray-800">
                            CVV / CVC <span className="text-brand-pink">*</span>
                          </label>
                          <span className="text-[10px] text-gray-400">3-4 digits</span>
                        </div>
                        <input
                          type="password"
                          required
                          maxLength={4}
                          value={cardCvv}
                          onChange={(e) => setCardCvv(e.target.value.replace(/\D/g, ''))}
                          placeholder="•••"
                          className="w-full px-4 py-2.5 bg-white border border-gray-200 rounded-xl text-xs sm:text-sm font-mono text-gray-900 focus:outline-none focus:border-brand-pink text-center tracking-widest"
                        />
                      </div>

                      <div className="space-y-1.5 col-span-2 sm:col-span-1">
                        <label className="block text-xs font-bold text-gray-800">
                          Postal / ZIP Code
                        </label>
                        <input
                          type="text"
                          value={cardZip}
                          onChange={(e) => setCardZip(e.target.value)}
                          placeholder="Postal code"
                          className="w-full px-4 py-2.5 bg-white border border-gray-200 rounded-xl text-xs sm:text-sm text-gray-900 focus:outline-none focus:border-brand-pink"
                        />
                      </div>
                    </div>

                    {/* Terms Agreement */}
                    <div className="pt-2">
                      <label className="flex items-start gap-2.5 cursor-pointer text-xs text-gray-600 leading-relaxed">
                        <input
                          type="checkbox"
                          checked={agreeTerms}
                          onChange={(e) => setAgreeTerms(e.target.checked)}
                          className="mt-0.5 rounded border-gray-300 text-brand-pink focus:ring-brand-pink cursor-pointer"
                        />
                        <span>
                          I authorize JuicePay to charge{' '}
                          <strong className="text-gray-900 font-bold">
                            {currencySymbol}
                            {listingFee.toLocaleString()}
                          </strong>{' '}
                          for publishing this casting requirement and unlocking immediate talent candidate profile access.
                        </span>
                      </label>
                    </div>

                    {errorMsg && (
                      <div className="p-3.5 rounded-xl bg-red-50 border border-red-200 text-xs text-red-700 flex items-center gap-2">
                        <AlertCircle className="w-4 h-4 shrink-0 text-red-500" />
                        <span>{errorMsg}</span>
                      </div>
                    )}

                    {/* Pay Button */}
                    <div className="pt-3">
                      <button
                        type="submit"
                        disabled={isProcessing}
                        className="w-full py-4 px-6 bg-brand-pink hover:bg-rose-700 text-white font-bold text-sm uppercase tracking-wider rounded-2xl shadow-md hover:shadow-lg transition-all active:scale-[0.99] flex items-center justify-center gap-2.5 cursor-pointer disabled:opacity-75 disabled:cursor-not-allowed"
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
                              {listingFee.toLocaleString()} via JuicePay Credit Card
                            </span>
                          </>
                        )}
                      </button>
                    </div>
                  </form>
                )}

                {/* FORM: PayPal Express */}
                {paymentMethod === 'paypal' && (
                  <form onSubmit={handleProcessPayment} className="space-y-4 pt-2">
                    <div className="p-4 rounded-2xl bg-[#003087]/5 border border-[#003087]/20 text-xs text-gray-700 space-y-2">
                      <div className="flex items-center justify-between font-bold text-gray-900">
                        <div className="flex items-center gap-1.5">
                          <span className="text-[#003087] font-extrabold text-sm">PayPal</span>
                          <span>Express Checkout</span>
                        </div>
                        <span className="text-[10px] bg-emerald-100 text-emerald-800 px-2 py-0.5 rounded font-semibold">
                          Instant Authorization
                        </span>
                      </div>
                      <p className="text-[11px] text-gray-600 leading-relaxed">
                        Log in with your PayPal credentials or pay as a guest using your linked bank account or international debit/credit cards.
                      </p>
                    </div>

                    <div className="space-y-1.5">
                      <label className="block text-xs font-bold text-gray-800">
                        PayPal Account Email <span className="text-brand-pink">*</span>
                      </label>
                      <input
                        type="email"
                        required
                        value={paypalEmail}
                        onChange={(e) => setPaypalEmail(e.target.value)}
                        placeholder="your-email@paypal.com"
                        className="w-full px-4 py-2.5 bg-white border border-gray-200 rounded-xl text-xs sm:text-sm text-gray-900 focus:outline-none focus:border-[#003087] focus:ring-2 focus:ring-blue-100 transition-all"
                      />
                    </div>

                    <div className="flex items-center gap-2 pt-1">
                      <input
                        type="checkbox"
                        id="paypalRemember"
                        checked={paypalRemember}
                        onChange={(e) => setPaypalRemember(e.target.checked)}
                        className="rounded border-gray-300 text-[#003087] focus:ring-[#003087] cursor-pointer"
                      />
                      <label htmlFor="paypalRemember" className="text-xs text-gray-600 cursor-pointer">
                        Remember this PayPal account for future casting calls
                      </label>
                    </div>

                    {/* Terms Agreement */}
                    <div className="pt-2">
                      <label className="flex items-start gap-2.5 cursor-pointer text-xs text-gray-600 leading-relaxed">
                        <input
                          type="checkbox"
                          checked={agreeTerms}
                          onChange={(e) => setAgreeTerms(e.target.checked)}
                          className="mt-0.5 rounded border-gray-300 text-[#003087] focus:ring-[#003087] cursor-pointer"
                        />
                        <span>
                          I agree to PayPal's user agreement and authorize{' '}
                          <strong className="text-gray-900 font-bold">
                            {currencySymbol}
                            {listingFee.toLocaleString()}
                          </strong>{' '}
                          deduction to publish this casting call and unlock candidate profiles.
                        </span>
                      </label>
                    </div>

                    {errorMsg && (
                      <div className="p-3.5 rounded-xl bg-red-50 border border-red-200 text-xs text-red-700 flex items-center gap-2">
                        <AlertCircle className="w-4 h-4 shrink-0 text-red-500" />
                        <span>{errorMsg}</span>
                      </div>
                    )}

                    {/* PayPal Button */}
                    <div className="pt-3">
                      <button
                        type="submit"
                        disabled={isProcessing}
                        className="w-full py-4 px-6 bg-[#FFC439] hover:bg-[#F2BA36] text-[#003087] font-extrabold text-sm rounded-2xl shadow-md transition-all active:scale-[0.99] flex items-center justify-center gap-2.5 cursor-pointer disabled:opacity-75 disabled:cursor-not-allowed"
                      >
                        {isProcessing ? (
                          <>
                            <div className="w-4 h-4 border-2 border-[#003087]/30 border-t-[#003087] rounded-full animate-spin" />
                            <span>{processingStep}</span>
                          </>
                        ) : (
                          <>
                            <span>Pay with</span>
                            <span className="font-extrabold text-base tracking-tight text-[#003087]">
                              Pay<span className="text-[#0079C1]">Pal</span>
                            </span>
                            <span>({currencySymbol}{listingFee.toLocaleString()})</span>
                          </>
                        )}
                      </button>
                    </div>
                  </form>
                )}
              </div>

              {/* Guarantees Box */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
                <div className="p-4 rounded-2xl bg-white border border-gray-200 shadow-2xs space-y-1">
                  <div className="flex items-center gap-1.5 font-bold text-gray-900">
                    <ShieldCheck className="w-4 h-4 text-emerald-600" />
                    <span>Instant Live Post</span>
                  </div>
                  <p className="text-[11px] text-gray-500 leading-normal">
                    Opportunity becomes discoverable to verified talents across the platform.
                  </p>
                </div>

                <div className="p-4 rounded-2xl bg-white border border-gray-200 shadow-2xs space-y-1">
                  <div className="flex items-center gap-1.5 font-bold text-gray-900">
                    <Eye className="w-4 h-4 text-brand-pink" />
                    <span>Profiles Unlocked</span>
                  </div>
                  <p className="text-[11px] text-gray-500 leading-normal">
                    Gain full access to browse candidate portfolios, showreels, and contacts.
                  </p>
                </div>

                <div className="p-4 rounded-2xl bg-white border border-gray-200 shadow-2xs space-y-1">
                  <div className="flex items-center gap-1.5 font-bold text-gray-900">
                    <HelpCircle className="w-4 h-4 text-sky-600" />
                    <span>Recruiter Support</span>
                  </div>
                  <p className="text-[11px] text-gray-500 leading-normal">
                    Dedicated StageLink production support team ready for any assistance.
                  </p>
                </div>
              </div>
            </div>

            {/* RIGHT COLUMN: Order Summary & Opportunity Review (5 Cols) */}
            <div className="lg:col-span-5 space-y-5">
              <div className="bg-white rounded-3xl border border-gray-200 p-6 sm:p-7 shadow-xs space-y-5">
                {/* Header Badge */}
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2 text-xs font-bold text-gray-700 tracking-wide">
                    <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                    <span className="uppercase text-[11px]">Ready to Publish</span>
                  </div>
                  <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-pink-50 text-brand-pink border border-pink-200">
                    Listing Fee
                  </span>
                </div>

                {/* Amount Highlight Block */}
                <div className="p-5 rounded-2xl bg-linear-to-br from-rose-600 via-pink-600 to-rose-700 text-white space-y-2 shadow-md shadow-pink-500/20">
                  <span className="text-[10px] font-bold uppercase tracking-widest text-pink-200 block">
                    Total Publication Fee
                  </span>
                  <div className="flex items-baseline justify-between">
                    <div className="text-3xl sm:text-4xl font-extrabold font-serif text-white tracking-tight">
                      {currencySymbol}
                      {listingFee.toLocaleString()}
                    </div>
                    <span className="text-[10px] font-semibold text-white/90 bg-white/20 px-2.5 py-1 rounded-lg backdrop-blur-xs">
                      One-time charge
                    </span>
                  </div>
                </div>

                {/* Opportunity Snapshot Breakdown */}
                <div className="space-y-3 text-xs divide-y divide-gray-100">
                  <div className="flex items-start justify-between pt-1 gap-2">
                    <span className="text-gray-500">Production:</span>
                    <span className="font-bold text-gray-900 text-right">
                      {opportunity.productionCompany}
                    </span>
                  </div>

                  <div className="flex items-start justify-between pt-3 gap-2">
                    <span className="text-gray-500">Category &amp; Type:</span>
                    <span className="font-semibold text-gray-800 text-right">
                      {opportunity.productionCategory || opportunity.category} •{' '}
                      {opportunity.productionType || opportunity.type}
                    </span>
                  </div>

                  <div className="flex items-start justify-between pt-3 gap-2">
                    <span className="text-gray-500">Talent Needed:</span>
                    <span className="font-semibold text-gray-800 text-right">
                      {Array.isArray(opportunity.talentNeeded)
                        ? opportunity.talentNeeded.join(', ')
                        : opportunity.talentNeeded}
                    </span>
                  </div>

                  <div className="flex items-center justify-between pt-3">
                    <span className="text-gray-500 flex items-center gap-1.5">
                      <Users className="w-3.5 h-3.5 text-gray-400" />
                      <span>Artists Needed:</span>
                    </span>
                    <span className="font-bold text-gray-900">
                      {opportunity.artistsNeeded || 1} talent
                    </span>
                  </div>

                  <div className="flex items-center justify-between pt-3">
                    <span className="text-gray-500 flex items-center gap-1.5">
                      <MapPin className="w-3.5 h-3.5 text-gray-400" />
                      <span>Location:</span>
                    </span>
                    <span className="font-medium text-gray-800">
                      {opportunity.location || 'Open / Unspecified (Optional)'}
                    </span>
                  </div>

                  <div className="flex items-center justify-between pt-3">
                    <span className="text-gray-500 flex items-center gap-1.5">
                      <Calendar className="w-3.5 h-3.5 text-gray-400" />
                      <span>Shoot Date:</span>
                    </span>
                    <span className="font-medium text-gray-800">
                      {opportunity.shootDate || 'Flexible / To be decided (Optional)'}
                    </span>
                  </div>
                </div>

                <div className="border-t border-gray-100" />

                {/* Recruiter Privilege Notice */}
                <div className="space-y-2.5 p-4 rounded-2xl bg-gray-50 border border-gray-200/80">
                  <div className="flex items-center gap-2">
                    <Sparkles className="w-4 h-4 text-brand-pink shrink-0" />
                    <h3 className="text-xs font-bold text-gray-900">What Unlocks After Payment:</h3>
                  </div>
                  <ul className="text-[11px] text-gray-600 space-y-1.5 list-disc list-inside">
                    <li>Immediate public broadcast in Casting Directory</li>
                    <li>Full access to view and search candidate profiles</li>
                    <li>Direct audition tapes and contact details</li>
                    <li>Automated talent matching and ranking</li>
                  </ul>
                </div>

                {/* Production Reference Footer */}
                <div className="p-3.5 bg-gray-50 rounded-xl border border-gray-100 text-[11px] space-y-0.5">
                  <div className="font-semibold text-gray-900 truncate">
                    {opportunity.title || 'Casting Requirement Announcement'}
                  </div>
                  <div className="text-gray-500">
                    Draft Reference: <span className="font-mono">{opportunity.refId || 'PRD-NEW'}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        ) : (
          /* PAYMENT SUCCESS & RECEIPT SCREEN */
          <div className="max-w-2xl mx-auto bg-white rounded-3xl border border-gray-200 p-8 sm:p-10 shadow-xl text-center space-y-7 animate-in fade-in duration-300">
            {/* Success Icon */}
            <div className="w-20 h-20 rounded-full bg-emerald-50 border-2 border-emerald-200 text-emerald-600 flex items-center justify-center mx-auto shadow-sm">
              <CheckCircle2 className="w-10 h-10 stroke-[2.5]" />
            </div>

            <div className="space-y-2">
              <span className="text-xs font-bold text-emerald-700 uppercase tracking-widest block">
                Payment Authorized • Post Published Live
              </span>
              <h2 className="text-2xl sm:text-3xl font-bold font-serif text-gray-900">
                Casting Call is Live on StageLink!
              </h2>
              <p className="text-xs sm:text-sm text-gray-600 max-w-md mx-auto leading-relaxed">
                Your payment of{' '}
                <strong className="text-gray-900 font-bold">
                  {currencySymbol}
                  {listingFee.toLocaleString()}
                </strong>{' '}
                was successfully authorized via{' '}
                <strong className="text-brand-pink font-bold">
                  {paymentResult?.paymentMethod || 'JuicePay / PayPal'}
                </strong>
                . Your casting post is now live, and candidate profiles are fully unlocked!
              </p>
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
                <span className="text-gray-500 font-medium">Amount Paid:</span>
                <span className="font-bold text-emerald-700 text-sm font-mono">
                  {currencySymbol}
                  {listingFee.toLocaleString()} INR
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-500 font-medium">Authorized At:</span>
                <span className="font-medium text-gray-800">{paymentResult?.paidAt}</span>
              </div>
              <div className="flex justify-between items-center pt-2 border-t border-gray-200/80">
                <span className="text-gray-500 font-medium">Candidate Profiles:</span>
                <span className="inline-flex items-center gap-1 font-bold text-emerald-700">
                  <span className="w-2 h-2 rounded-full bg-emerald-500" />
                  <span>Unlocked &amp; Viewable</span>
                </span>
              </div>
            </div>

            {/* Navigation Actions */}
            <div className="flex flex-col sm:flex-row gap-3 pt-2">
              <Link
                to="/opportunities"
                className="flex-1 py-4 px-5 bg-brand-pink hover:bg-rose-700 text-white font-bold text-xs uppercase tracking-wider rounded-xl shadow-md transition-colors flex items-center justify-center gap-2 cursor-pointer"
              >
                <span>View Live Casting Post</span>
                <ExternalLink className="w-3.5 h-3.5" />
              </Link>
              <Link
                to="/admin/candidates"
                className="flex-1 py-4 px-5 bg-black hover:bg-neutral-800 text-white font-bold text-xs uppercase tracking-wider rounded-xl shadow-md transition-colors flex items-center justify-center gap-2 cursor-pointer"
              >
                <Users className="w-3.5 h-3.5 text-yellow-400" />
                <span>View Candidate Profiles</span>
              </Link>
              <button
                type="button"
                onClick={() => window.print()}
                className="py-4 px-5 bg-white border border-gray-300 hover:border-gray-900 text-gray-900 font-bold text-xs rounded-xl transition-colors flex items-center justify-center gap-2 cursor-pointer"
              >
                <Printer className="w-3.5 h-3.5" />
                <span>Print Receipt</span>
              </button>
            </div>
          </div>
        )}
      </PageContainer>
    </div>
  );
};

export default PaymentPage;
