import React, { useState } from 'react';
import { useLocation, useNavigate, Link } from 'react-router-dom';
import {
  ShieldCheck,
  Lock,
  CreditCard,
  Building,
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
} from 'lucide-react';
import PageContainer from '../../components/layout/PageContainer';

const DEFAULT_ESCROW_DATA = {
  refId: 'PRD-842910',
  id: 'opp-berlin-requiem',
  projectTitle: 'The Berlin Requiem — Dancers & Performers',
  productionCompany: 'Northlight Productions',
  productionCategory: 'Film & TV',
  productionType: 'Feature Film',
  talentNeeded: ['Dancers / Performers', 'Actors / Screen Artists'],
  shootDate: '2026-11-20',
  location: 'Berlin',
  artistsNeeded: 5,
  compensation: 150,
  currency: '€',
  totalEscrow: 750,
  description:
    'Seeking expressive movement performers and specialized talents for an atmospheric night exterior sequence set in Berlin. Period-appropriate wardrobe provided on set.',
  requirements: [
    'Must have high stamina for choreographed group movement. Prior screen or stage experience preferred.',
  ],
  contactEmail: 'casting@northlightproductions.de',
};

const PaymentPage = () => {
  const location = useLocation();
  const navigate = useNavigate();

  // Retrieve escrow data passed via state, session storage, or default fallback
  const [escrowData] = useState(() => {
    if (location.state?.escrowData) {
      return location.state.escrowData;
    }
    try {
      const saved = sessionStorage.getItem('starcast_pending_payment');
      if (saved) return JSON.parse(saved);
    } catch {
      // Fallback
    }
    return DEFAULT_ESCROW_DATA;
  });

  // Payment Form States
  const [paymentMethod, setPaymentMethod] = useState('card'); // 'card' | 'sepa' | 'apple_pay' | 'balance'
  const [cardName, setCardName] = useState(
    escrowData.productionCompany ? `${escrowData.productionCompany} GmbH` : 'Northlight Productions GmbH'
  );
  const [cardNumber, setCardNumber] = useState('4242 •••• •••• 4242');
  const [cardExpiry, setCardExpiry] = useState('11/28');
  const [cardCvv, setCardCvv] = useState('883');
  const [billingCountry, setBillingCountry] = useState('Germany');
  const [billingPostal, setBillingPostal] = useState('10115');
  const [agreeTerms, setAgreeTerms] = useState(true);

  // Status & UI States
  const [isProcessing, setIsProcessing] = useState(false);
  const [processingStep, setProcessingStep] = useState('');
  const [isPaidSuccess, setIsPaidSuccess] = useState(false);
  const [paymentTxnId, setPaymentTxnId] = useState('');
  const [errorMsg, setErrorMsg] = useState('');

  const currency = escrowData.currency || '€';
  const totalAmount = Number(escrowData.totalEscrow) || 750;

  // Handle Card Number Formatting
  const handleCardNumberChange = (e) => {
    const raw = e.target.value.replace(/\D/g, '').slice(0, 16);
    const formatted = raw.replace(/(\d{4})/g, '$1 ').trim();
    setCardNumber(formatted || e.target.value);
  };

  const handlePayNow = (e) => {
    e.preventDefault();
    setErrorMsg('');

    if (!agreeTerms) {
      setErrorMsg('Please confirm agreement with StarCast Escrow Protection terms.');
      return;
    }

    setIsProcessing(true);
    setProcessingStep('Connecting to European Banking Gateway...');

    setTimeout(() => {
      setProcessingStep('Authorizing 3D Secure Escrow Deposit...');
    }, 900);

    setTimeout(() => {
      setProcessingStep('Locking funds in StarCast Segregated Production Vault...');
    }, 1800);

    setTimeout(() => {
      const txnId = `TXN-ESC-${Math.floor(100000 + Math.random() * 900000)}`;
      setPaymentTxnId(txnId);
      setIsProcessing(false);
      setIsPaidSuccess(true);

      // Save to published opportunities in localStorage so it appears everywhere
      try {
        const stored = localStorage.getItem('starcast_custom_opportunities');
        const existing = stored ? JSON.parse(stored) : [];
        const newOpportunity = {
          id: escrowData.id || `opp-${Date.now()}`,
          refId: escrowData.refId || `PRD-${Math.floor(100000 + Math.random() * 900000)}`,
          title: escrowData.projectTitle || `${escrowData.productionCompany} Casting Call`,
          category: escrowData.productionCategory || 'Film & TV',
          productionCompany: escrowData.productionCompany || 'StarCast Partner Studio',
          location: escrowData.location || 'Berlin',
          compensation: `${currency}${escrowData.compensation || 150} / artist`,
          totalCompensation: `${currency}${totalAmount}`,
          shootDate: escrowData.shootDate || '2026-11-20',
          artistsNeeded: Number(escrowData.artistsNeeded) || 5,
          talentNeeded: escrowData.talentNeeded || ['Performers'],
          description: escrowData.description || 'Verified production role with automated escrow.',
          requirements: escrowData.requirements || ['Professional acting/movement audition.'],
          postedTime: 'Just now',
          status: 'open',
          escrowStatus: 'funded',
          escrowTxnId: txnId,
          image:
            escrowData.image ||
            'https://images.unsplash.com/photo-1518173946687-a4c8a383392e?auto=format&fit=crop&w=800&q=80',
        };

        // Filter out if duplicate
        const filtered = existing.filter((item) => item.refId !== newOpportunity.refId);
        localStorage.setItem(
          'starcast_custom_opportunities',
          JSON.stringify([newOpportunity, ...filtered])
        );

        // Clear pending session
        sessionStorage.removeItem('starcast_pending_payment');
      } catch (err) {
        console.warn('Storage save failed:', err);
      }
    }, 2700);
  };

  return (
    <div className="bg-neutral-50/70 min-h-screen text-black font-sans pb-24">
      {/* Top Header / Progress Breadcrumb */}
      <div className="bg-white border-b border-neutral-200">
        <PageContainer maxWidth="xl" className="py-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={() => navigate(-1)}
                className="p-2 rounded-xl border border-neutral-200 hover:border-black text-neutral-600 hover:text-black transition-colors"
                title="Return to Requirement Setup"
              >
                <ArrowLeft className="w-4 h-4" />
              </button>
              <div>
                <div className="flex items-center gap-2">
                  <span className="text-[11px] font-bold uppercase tracking-wider text-neutral-400">
                    Step 2 of 2
                  </span>
                  <span className="text-neutral-300">•</span>
                  <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-md border border-emerald-200">
                    <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
                    <span>256-Bit SSL Escrow Gateway</span>
                  </span>
                </div>
                <h1 className="text-xl sm:text-2xl font-bold font-serif text-black">
                  Production Escrow Deposit & Authorization
                </h1>
              </div>
            </div>

            {/* Stepper Indicator */}
            <div className="hidden md:flex items-center gap-2 text-xs">
              <Link
                to="/post-job"
                className="text-neutral-500 hover:text-black flex items-center gap-1.5 font-medium transition-colors"
              >
                <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                <span>1. Job & Role Details</span>
              </Link>
              <ChevronRight className="w-3.5 h-3.5 text-neutral-300" />
              <span className="text-black font-bold flex items-center gap-1.5 bg-neutral-100 px-3 py-1 rounded-lg border border-neutral-200">
                <span className="w-4 h-4 rounded-full bg-black text-white text-[10px] flex items-center justify-center font-bold">
                  2
                </span>
                <span>Escrow & Payment</span>
              </span>
            </div>
          </div>
        </PageContainer>
      </div>

      <PageContainer maxWidth="xl" className="py-8">
        {!isPaidSuccess ? (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
            {/* LEFT COLUMN: Payment Method Selection & Checkout Form (7 Cols) */}
            <div className="lg:col-span-7 space-y-6">
              {/* Payment Methods Tabs */}
              <div className="bg-white rounded-2xl border border-neutral-200/90 p-6 shadow-xs space-y-5">
                <div className="flex items-center justify-between border-b border-neutral-100 pb-4">
                  <div className="space-y-0.5">
                    <h2 className="text-base font-bold text-black font-serif">
                      Select Payment Method
                    </h2>
                    <p className="text-xs text-neutral-500">
                      Funds are strictly held in escrow and released only after talent completes the shoot.
                    </p>
                  </div>
                  <Lock className="w-4 h-4 text-neutral-400" />
                </div>

                {/* Method Options */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
                  <button
                    type="button"
                    onClick={() => setPaymentMethod('card')}
                    className={`p-3.5 rounded-xl border text-left transition-all flex flex-col justify-between gap-2 ${
                      paymentMethod === 'card'
                        ? 'border-black bg-neutral-900 text-white shadow-xs'
                        : 'border-neutral-200 bg-white hover:border-neutral-300 text-neutral-700'
                    }`}
                  >
                    <CreditCard className={`w-5 h-5 ${paymentMethod === 'card' ? 'text-yellow-400' : 'text-neutral-500'}`} />
                    <div>
                      <div className="text-xs font-bold leading-tight">Credit Card</div>
                      <div className={`text-[10px] ${paymentMethod === 'card' ? 'text-neutral-300' : 'text-neutral-400'}`}>
                        Visa / MC / Amex
                      </div>
                    </div>
                  </button>

                  <button
                    type="button"
                    onClick={() => setPaymentMethod('sepa')}
                    className={`p-3.5 rounded-xl border text-left transition-all flex flex-col justify-between gap-2 ${
                      paymentMethod === 'sepa'
                        ? 'border-black bg-neutral-900 text-white shadow-xs'
                        : 'border-neutral-200 bg-white hover:border-neutral-300 text-neutral-700'
                    }`}
                  >
                    <Building className={`w-5 h-5 ${paymentMethod === 'sepa' ? 'text-emerald-400' : 'text-neutral-500'}`} />
                    <div>
                      <div className="text-xs font-bold leading-tight">SEPA Bank</div>
                      <div className={`text-[10px] ${paymentMethod === 'sepa' ? 'text-neutral-300' : 'text-neutral-400'}`}>
                        Direct Wire (EU)
                      </div>
                    </div>
                  </button>

                  <button
                    type="button"
                    onClick={() => setPaymentMethod('apple_pay')}
                    className={`p-3.5 rounded-xl border text-left transition-all flex flex-col justify-between gap-2 ${
                      paymentMethod === 'apple_pay'
                        ? 'border-black bg-neutral-900 text-white shadow-xs'
                        : 'border-neutral-200 bg-white hover:border-neutral-300 text-neutral-700'
                    }`}
                  >
                    <Sparkles className={`w-5 h-5 ${paymentMethod === 'apple_pay' ? 'text-sky-400' : 'text-neutral-500'}`} />
                    <div>
                      <div className="text-xs font-bold leading-tight">Digital Pay</div>
                      <div className={`text-[10px] ${paymentMethod === 'apple_pay' ? 'text-neutral-300' : 'text-neutral-400'}`}>
                        Apple / Google
                      </div>
                    </div>
                  </button>

                  <button
                    type="button"
                    onClick={() => setPaymentMethod('balance')}
                    className={`p-3.5 rounded-xl border text-left transition-all flex flex-col justify-between gap-2 ${
                      paymentMethod === 'balance'
                        ? 'border-black bg-neutral-900 text-white shadow-xs'
                        : 'border-neutral-200 bg-white hover:border-neutral-300 text-neutral-700'
                    }`}
                  >
                    <ShieldCheck className={`w-5 h-5 ${paymentMethod === 'balance' ? 'text-yellow-400' : 'text-neutral-500'}`} />
                    <div>
                      <div className="text-xs font-bold leading-tight">Studio Credit</div>
                      <div className={`text-[10px] ${paymentMethod === 'balance' ? 'text-neutral-300' : 'text-neutral-400'}`}>
                        €2,400 Avail.
                      </div>
                    </div>
                  </button>
                </div>

                {/* Card Payment Form */}
                {paymentMethod === 'card' && (
                  <form onSubmit={handlePayNow} className="space-y-4 pt-2">
                    <div className="space-y-1.5">
                      <label className="block text-xs font-semibold text-neutral-800">
                        Cardholder / Company Name *
                      </label>
                      <input
                        type="text"
                        required
                        value={cardName}
                        onChange={(e) => setCardName(e.target.value)}
                        placeholder="e.g. Northlight Productions GmbH"
                        className="w-full px-3.5 py-2.5 bg-white border border-neutral-300 rounded-xl text-xs text-black focus:outline-none focus:ring-2 focus:ring-black/20 focus:border-black transition-all"
                      />
                    </div>

                    <div className="space-y-1.5">
                      <div className="flex items-center justify-between">
                        <label className="block text-xs font-semibold text-neutral-800">
                          Card Number *
                        </label>
                        <div className="flex items-center gap-1.5 text-[10px] font-bold text-neutral-400">
                          <span>VISA</span>
                          <span>•</span>
                          <span>MC</span>
                          <span>•</span>
                          <span>AMEX</span>
                        </div>
                      </div>
                      <div className="relative">
                        <input
                          type="text"
                          required
                          value={cardNumber}
                          onChange={handleCardNumberChange}
                          placeholder="4242 4242 4242 4242"
                          className="w-full pl-3.5 pr-10 py-2.5 bg-white border border-neutral-300 rounded-xl text-xs font-mono text-black focus:outline-none focus:ring-2 focus:ring-black/20 focus:border-black transition-all tracking-wider"
                        />
                        <Lock className="w-3.5 h-3.5 text-neutral-400 absolute right-3.5 top-1/2 -translate-y-1/2" />
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-1.5">
                        <label className="block text-xs font-semibold text-neutral-800">
                          Expiry Date (MM/YY) *
                        </label>
                        <input
                          type="text"
                          required
                          value={cardExpiry}
                          onChange={(e) => setCardExpiry(e.target.value)}
                          placeholder="MM/YY"
                          className="w-full px-3.5 py-2.5 bg-white border border-neutral-300 rounded-xl text-xs font-mono text-black focus:outline-none focus:ring-2 focus:ring-black/20 focus:border-black transition-all text-center"
                        />
                      </div>

                      <div className="space-y-1.5">
                        <div className="flex items-center justify-between">
                          <label className="block text-xs font-semibold text-neutral-800">
                            CVC / CVV *
                          </label>
                          <span className="text-[10px] text-neutral-400">3 or 4 digits</span>
                        </div>
                        <input
                          type="password"
                          required
                          maxLength={4}
                          value={cardCvv}
                          onChange={(e) => setCardCvv(e.target.value)}
                          placeholder="•••"
                          className="w-full px-3.5 py-2.5 bg-white border border-neutral-300 rounded-xl text-xs font-mono text-black focus:outline-none focus:ring-2 focus:ring-black/20 focus:border-black transition-all text-center tracking-widest"
                        />
                      </div>
                    </div>

                    {/* Billing address section */}
                    <div className="grid grid-cols-2 gap-4 pt-2 border-t border-neutral-100">
                      <div className="space-y-1.5">
                        <label className="block text-xs font-semibold text-neutral-800">
                          Billing Country
                        </label>
                        <input
                          type="text"
                          value={billingCountry}
                          onChange={(e) => setBillingCountry(e.target.value)}
                          className="w-full px-3.5 py-2.5 bg-white border border-neutral-300 rounded-xl text-xs text-black focus:outline-none focus:ring-2 focus:ring-black/20 focus:border-black transition-all"
                        />
                      </div>

                      <div className="space-y-1.5">
                        <label className="block text-xs font-semibold text-neutral-800">
                          Postal / ZIP Code
                        </label>
                        <input
                          type="text"
                          value={billingPostal}
                          onChange={(e) => setBillingPostal(e.target.value)}
                          className="w-full px-3.5 py-2.5 bg-white border border-neutral-300 rounded-xl text-xs text-black focus:outline-none focus:ring-2 focus:ring-black/20 focus:border-black transition-all"
                        />
                      </div>
                    </div>

                    {/* Terms Agreement Checkbox */}
                    <div className="pt-2">
                      <label className="flex items-start gap-2.5 cursor-pointer text-xs text-neutral-700 leading-relaxed">
                        <input
                          type="checkbox"
                          checked={agreeTerms}
                          onChange={(e) => setAgreeTerms(e.target.checked)}
                          className="mt-0.5 rounded border-neutral-300 text-black focus:ring-black"
                        />
                        <span>
                          I authorize StarCast Escrow Services to safely lock{' '}
                          <strong>
                            {currency}
                            {totalAmount.toLocaleString()}
                          </strong>{' '}
                          until the production date ({escrowData.shootDate || '2026-11-20'}). Funds will be released only upon confirmed attendance.
                        </span>
                      </label>
                    </div>

                    {errorMsg && (
                      <div className="p-3 rounded-xl bg-red-50 border border-red-200 text-xs text-red-700 flex items-center gap-2">
                        <AlertCircle className="w-4 h-4 shrink-0 text-red-500" />
                        <span>{errorMsg}</span>
                      </div>
                    )}

                    {/* Submit Pay Button */}
                    <div className="pt-3">
                      <button
                        type="submit"
                        disabled={isProcessing}
                        className="w-full py-4 px-6 bg-black hover:bg-neutral-800 text-white font-bold text-sm uppercase tracking-wider rounded-xl shadow-md transition-all active:scale-[0.99] flex items-center justify-center gap-2.5 disabled:opacity-75 disabled:cursor-not-allowed"
                      >
                        {isProcessing ? (
                          <>
                            <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                            <span>{processingStep}</span>
                          </>
                        ) : (
                          <>
                            <Lock className="w-4 h-4 text-yellow-400" />
                            <span>
                              Confirm & Deposit {currency}
                              {totalAmount.toLocaleString()} in Escrow
                            </span>
                          </>
                        )}
                      </button>
                    </div>
                  </form>
                )}

                {/* Alternative SEPA Wire Details */}
                {paymentMethod === 'sepa' && (
                  <div className="space-y-4 pt-2">
                    <div className="p-4 rounded-xl bg-neutral-50 border border-neutral-200 space-y-2 text-xs">
                      <div className="font-bold text-black flex items-center justify-between">
                        <span>StarCast European Escrow Trust Account</span>
                        <span className="text-[10px] bg-emerald-100 text-emerald-800 px-2 py-0.5 rounded font-mono">
                          SEPA INSTANT ACTIVE
                        </span>
                      </div>
                      <div className="space-y-1 text-neutral-600 font-mono text-[11px]">
                        <div>IBAN: DE89 3704 0044 0532 0130 00</div>
                        <div>BIC / SWIFT: COBADEFFXXX</div>
                        <div>Reference: {escrowData.refId || 'PRD-842910'}</div>
                      </div>
                    </div>
                    <button
                      type="button"
                      onClick={handlePayNow}
                      disabled={isProcessing}
                      className="w-full py-3.5 px-6 bg-black hover:bg-neutral-800 text-white font-bold text-xs uppercase tracking-wider rounded-xl shadow-xs transition-all flex items-center justify-center gap-2"
                    >
                      <Building className="w-4 h-4 text-emerald-400" />
                      <span>Generate SEPA Payment Reference & Lock Escrow</span>
                    </button>
                  </div>
                )}

                {/* Alternative Digital Pay */}
                {paymentMethod === 'apple_pay' && (
                  <div className="space-y-4 pt-2 text-center">
                    <p className="text-xs text-neutral-600">
                      Use Apple Pay, Google Pay, or Biometric Authentication to authorize this talent escrow deposit instantly.
                    </p>
                    <button
                      type="button"
                      onClick={handlePayNow}
                      disabled={isProcessing}
                      className="w-full py-4 px-6 bg-black hover:bg-neutral-800 text-white font-bold text-sm rounded-xl shadow-md transition-all flex items-center justify-center gap-2"
                    >
                      <span>Pay with</span>
                      <strong className="tracking-tight text-white">Pay / GPay</strong>
                      <span>({currency}{totalAmount.toLocaleString()})</span>
                    </button>
                  </div>
                )}

                {/* Alternative Studio Balance */}
                {paymentMethod === 'balance' && (
                  <div className="space-y-4 pt-2">
                    <div className="p-4 rounded-xl bg-amber-50/70 border border-amber-200 text-xs space-y-2">
                      <div className="flex justify-between items-center text-amber-900 font-bold">
                        <span>Available Studio Escrow Balance</span>
                        <span className="text-sm font-serif">€2,400.00</span>
                      </div>
                      <p className="text-[11px] text-amber-800">
                        {currency}{totalAmount} will be deducted from your prepaid balance and allocated to booking ref #{escrowData.refId || 'PRD-842910'}.
                      </p>
                    </div>
                    <button
                      type="button"
                      onClick={handlePayNow}
                      disabled={isProcessing}
                      className="w-full py-3.5 px-6 bg-black hover:bg-neutral-800 text-white font-bold text-xs uppercase tracking-wider rounded-xl shadow-xs transition-all flex items-center justify-center gap-2"
                    >
                      <ShieldCheck className="w-4 h-4 text-yellow-400" />
                      <span>Deduct & Allocate from Studio Balance</span>
                    </button>
                  </div>
                )}
              </div>

              {/* Guarantees Box */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
                <div className="p-4 rounded-xl bg-white border border-neutral-200/90 shadow-2xs space-y-1">
                  <div className="flex items-center gap-1.5 font-bold text-black">
                    <ShieldCheck className="w-4 h-4 text-emerald-600" />
                    <span>Performer Guarantee</span>
                  </div>
                  <p className="text-[11px] text-neutral-500 leading-normal">
                    Funds released only after production verifies check-in.
                  </p>
                </div>

                <div className="p-4 rounded-xl bg-white border border-neutral-200/90 shadow-2xs space-y-1">
                  <div className="flex items-center gap-1.5 font-bold text-black">
                    <Clock className="w-4 h-4 text-sky-600" />
                    <span>100% Refundable</span>
                  </div>
                  <p className="text-[11px] text-neutral-500 leading-normal">
                    Cancel anytime before booking confirmation for full refund.
                  </p>
                </div>

                <div className="p-4 rounded-xl bg-white border border-neutral-200/90 shadow-2xs space-y-1">
                  <div className="flex items-center gap-1.5 font-bold text-black">
                    <HelpCircle className="w-4 h-4 text-neutral-600" />
                    <span>Dispute Mediation</span>
                  </div>
                  <p className="text-[11px] text-neutral-500 leading-normal">
                    StarCast legal mediation team resolves any production issues.
                  </p>
                </div>
              </div>
            </div>

            {/* RIGHT COLUMN: Escrow Financial Summary & Timeline (5 Cols) */}
            <div className="lg:col-span-5 space-y-5">
              {/* Exact Escrow Card As Seen In Screenshot */}
              <div className="bg-white rounded-2xl border border-neutral-200/90 p-6 shadow-xs space-y-5">
                {/* Header Badge */}
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2 text-xs font-bold text-neutral-700 tracking-wide">
                    <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                    <span className="uppercase text-[11px]">Live Production Escrow</span>
                  </div>
                  <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
                    Automated Escrow
                  </span>
                </div>

                {/* Total Escrow Highlight Block */}
                <div className="p-5 rounded-2xl bg-neutral-900 text-white space-y-2">
                  <span className="text-[10px] font-bold uppercase tracking-widest text-neutral-400 block">
                    Total Talent Escrow
                  </span>
                  <div className="flex items-baseline justify-between">
                    <div className="text-3xl sm:text-4xl font-extrabold font-serif text-white tracking-tight">
                      {currency}
                      {totalAmount.toLocaleString()}
                    </div>
                    <span className="text-[10px] font-semibold text-neutral-400 bg-neutral-800 px-2 py-0.5 rounded">
                      0% Platform Surcharge
                    </span>
                  </div>
                </div>

                {/* Breakdown List */}
                <div className="space-y-3 text-xs divide-y divide-neutral-100">
                  <div className="flex items-center justify-between pt-1">
                    <span className="text-neutral-500 flex items-center gap-1.5">
                      <Users className="w-3.5 h-3.5 text-neutral-400" />
                      <span>Artists Needed:</span>
                    </span>
                    <span className="font-bold text-black">
                      {escrowData.artistsNeeded || 5} performers
                    </span>
                  </div>

                  <div className="flex items-center justify-between pt-3">
                    <span className="text-neutral-500">Compensation / Artist:</span>
                    <span className="font-bold text-black font-mono">
                      {currency}
                      {escrowData.compensation || 150}
                    </span>
                  </div>

                  <div className="flex items-center justify-between pt-3">
                    <span className="text-neutral-500 flex items-center gap-1.5">
                      <MapPin className="w-3.5 h-3.5 text-neutral-400" />
                      <span>Shooting City:</span>
                    </span>
                    <span className="font-bold text-black">{escrowData.location || 'Berlin'}</span>
                  </div>

                  <div className="flex items-center justify-between pt-3">
                    <span className="text-neutral-500 flex items-center gap-1.5">
                      <Calendar className="w-3.5 h-3.5 text-neutral-400" />
                      <span>Production Date:</span>
                    </span>
                    <span className="font-bold text-black font-mono">
                      {escrowData.shootDate || '2026-11-20'}
                    </span>
                  </div>
                </div>

                <div className="border-t border-neutral-100" />

                {/* Payment Protection Text & Timeline */}
                <div className="space-y-3">
                  <div className="flex items-center gap-2">
                    <ShieldCheck className="w-4 h-4 text-black shrink-0" />
                    <h3 className="text-xs font-bold text-black">Payment Protection</h3>
                  </div>
                  <p className="text-[11px] text-neutral-600 leading-relaxed font-normal">
                    The agreed compensation is securely locked in platform escrow. Funds are disbursed to verified talent once the shoot is confirmed.
                  </p>

                  {/* 3-Step Escrow Timeline */}
                  <div className="p-3.5 rounded-xl bg-neutral-50 border border-neutral-200 space-y-2">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-neutral-500 block">
                      Escrow Booking Timeline:
                    </span>
                    <div className="grid grid-cols-3 gap-1.5 text-center">
                      <div className="p-2 rounded-lg bg-black text-white shadow-2xs">
                        <span className="block text-[10px] font-bold text-white">1. Secured</span>
                        <span className="text-[9px] text-yellow-300">🔒 In Escrow</span>
                      </div>
                      <div className="p-2 rounded-lg bg-white border border-neutral-200 shadow-2xs">
                        <span className="block text-[10px] font-bold text-black">2. Shoot Done</span>
                        <span className="text-[9px] text-neutral-500">🎬 Verified</span>
                      </div>
                      <div className="p-2 rounded-lg bg-white border border-neutral-200 shadow-2xs">
                        <span className="block text-[10px] font-bold text-black">3. Paid</span>
                        <span className="text-[9px] text-neutral-400">✓ Instant</span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Production Summary Footer */}
                <div className="p-3.5 bg-neutral-50 rounded-xl border border-neutral-100 text-[11px] space-y-1">
                  <div className="font-semibold text-black truncate">
                    {escrowData.projectTitle || 'The Berlin Requiem'}
                  </div>
                  <div className="text-neutral-500">
                    By <strong>{escrowData.productionCompany || 'Northlight Productions'}</strong>
                  </div>
                  <div className="text-neutral-400 font-mono text-[10px]">
                    Booking Reference: {escrowData.refId || 'PRD-842910'}
                  </div>
                </div>
              </div>
            </div>
          </div>
        ) : (
          /* PAYMENT SUCCESS RECEIPT SCREEN */
          <div className="max-w-2xl mx-auto bg-white rounded-3xl border border-neutral-200 p-8 sm:p-10 shadow-lg text-center space-y-8 animate-in fade-in duration-300">
            <div className="w-20 h-20 rounded-full bg-emerald-50 border border-emerald-200 text-emerald-600 flex items-center justify-center mx-auto shadow-xs">
              <CheckCircle2 className="w-10 h-10" />
            </div>

            <div className="space-y-2">
              <span className="text-xs font-bold text-emerald-700 uppercase tracking-widest block">
                Escrow Deposit Secured & Verified
              </span>
              <h2 className="text-2xl sm:text-3xl font-bold font-serif text-black">
                Payment Authorized Successfully!
              </h2>
              <p className="text-xs text-neutral-600 max-w-md mx-auto leading-relaxed">
                Your payment of{' '}
                <strong className="text-black font-semibold">
                  {currency}
                  {totalAmount.toLocaleString()}
                </strong>{' '}
                is safely locked in StarCast Production Escrow. The casting call is now officially active and being broadcast to verified performers.
              </p>
            </div>

            {/* Official Digital Receipt Box */}
            <div className="bg-neutral-50 rounded-2xl border border-neutral-200 p-6 text-left text-xs space-y-3.5">
              <div className="flex justify-between items-center border-b border-neutral-200/80 pb-3">
                <span className="text-neutral-500 font-medium">Transaction Hash:</span>
                <span className="font-mono font-bold text-black bg-white px-2.5 py-1 rounded border border-neutral-200">
                  {paymentTxnId}
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-neutral-500 font-medium">Production Reference:</span>
                <span className="font-mono font-bold text-black">{escrowData.refId || 'PRD-842910'}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-neutral-500 font-medium">Production Company:</span>
                <span className="font-bold text-black">{escrowData.productionCompany}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-neutral-500 font-medium">Escrow Amount Locked:</span>
                <span className="font-bold text-emerald-700 text-sm font-mono">
                  {currency}
                  {totalAmount.toLocaleString()} EUR
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-neutral-500 font-medium">Performer Allocation:</span>
                <span className="font-medium text-black">
                  {escrowData.artistsNeeded || 5} artists × {currency}
                  {escrowData.compensation || 150}
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-neutral-500 font-medium">Scheduled Shoot Date:</span>
                <span className="font-medium text-black">{escrowData.shootDate || '2026-11-20'}</span>
              </div>
              <div className="flex justify-between items-center pt-2 border-t border-neutral-200/80">
                <span className="text-neutral-500 font-medium">Escrow Status:</span>
                <span className="inline-flex items-center gap-1 font-bold text-emerald-700">
                  <span className="w-2 h-2 rounded-full bg-emerald-500" />
                  <span>Funds Segregated & Guarded</span>
                </span>
              </div>
            </div>

            {/* Navigation Actions */}
            <div className="flex flex-col sm:flex-row gap-3 pt-2">
              <Link
                to="/opportunities"
                className="flex-1 py-3.5 px-5 bg-black hover:bg-neutral-800 text-white font-bold text-xs uppercase tracking-wider rounded-xl shadow-xs transition-colors flex items-center justify-center gap-2"
              >
                <span>View in Casting Directory</span>
                <ExternalLink className="w-3.5 h-3.5" />
              </Link>
              <button
                type="button"
                onClick={() => window.print()}
                className="py-3.5 px-5 bg-white border border-neutral-300 hover:border-black text-black font-bold text-xs rounded-xl transition-colors flex items-center justify-center gap-2"
              >
                <Printer className="w-3.5 h-3.5" />
                <span>Print Official Escrow Receipt</span>
              </button>
            </div>
          </div>
        )}
      </PageContainer>
    </div>
  );
};

export default PaymentPage;
