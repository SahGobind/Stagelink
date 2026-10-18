import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  Lock,
  Sparkles,
  CreditCard,
  ArrowRight,
  ShieldAlert,
  ShieldCheck,
  CheckCircle2,
  Users,
  Eye,
  PlusCircle,
  RotateCcw,
} from 'lucide-react';
import {
  getPendingOpportunity,
  setPostingPaymentCompleted,
} from '../../utils/paymentAccess';

const CandidateAccessLock = ({
  title = 'Candidate Profiles are Locked',
  subtitle = 'Complete your casting post payment to unlock performer profiles, audition tapes, and talent contact details.',
}) => {
  const navigate = useNavigate();
  const pendingOpp = getPendingOpportunity();

  const handleTestUnlock = () => {
    setPostingPaymentCompleted(true);
  };

  return (
    <div className="relative overflow-hidden py-8 sm:py-12">
      {/* Background Decorative Teaser: Blurred Performer Cards */}
      <div className="absolute inset-0 pointer-events-none opacity-25 filter blur-xs select-none">
        <div className="max-w-5xl mx-auto grid grid-cols-1 sm:grid-cols-3 gap-4 p-4">
          {[
            { name: 'Aanya Sharma', role: 'Lead Actor • Hindi/English', loc: 'Mumbai' },
            { name: 'Marcus Vance', role: 'Contemporary Performer • Combat', loc: 'London' },
            { name: 'Elena Rostova', role: 'Commercial Model • Runway', loc: 'Berlin' },
          ].map((item, idx) => (
            <div
              key={idx}
              className="bg-white rounded-2xl p-5 border border-gray-200 shadow-xs space-y-2 text-left"
            >
              <div className="w-12 h-12 rounded-full bg-gray-200" />
              <div className="font-bold text-sm text-gray-800">{item.name}</div>
              <div className="text-xs text-gray-500">{item.role}</div>
              <div className="text-[11px] text-gray-400">{item.loc}</div>
            </div>
          ))}
        </div>
      </div>

      {/* Main Lock Modal / Card */}
      <div className="relative z-10 max-w-xl mx-auto px-4">
        <div className="bg-white/95 backdrop-blur-md rounded-3xl border border-gray-200/90 p-6 sm:p-9 shadow-2xl text-center space-y-6">
          {/* Animated Lock Icon */}
          <div className="relative w-20 h-20 mx-auto">
            <div className="absolute inset-0 rounded-full bg-pink-100 animate-ping opacity-30" />
            <div className="w-20 h-20 rounded-full bg-linear-to-tr from-rose-600 via-pink-600 to-rose-500 text-white flex items-center justify-center shadow-lg shadow-pink-500/25 relative z-10">
              <Lock className="w-9 h-9 stroke-[2.2]" />
            </div>
          </div>

          {/* Heading */}
          <div className="space-y-2 text-center">
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-bold bg-pink-50 text-brand-pink border border-pink-100 uppercase tracking-wider">
              <ShieldAlert className="w-3.5 h-3.5" />
              <span>Recruiter Payment Required</span>
            </span>
            <h2 className="text-2xl sm:text-3xl font-bold font-serif text-gray-900 tracking-tight">
              {title}
            </h2>
            <p className="text-xs sm:text-sm text-gray-600 max-w-md mx-auto leading-relaxed">
              {subtitle}
            </p>
          </div>

          {/* Value Prop Perks */}
          <div className="p-4 rounded-2xl bg-gray-50 border border-gray-200/80 text-left text-xs space-y-2.5">
            <span className="text-[10px] font-bold uppercase tracking-wider text-gray-500 block">
              What Unlocks After Payment:
            </span>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-gray-700">
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                <span>Full Performer Profiles</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                <span>HD Video Showreels &amp; Slates</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                <span>Ranked Role Matching Engine</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                <span>Direct Audition Invitations</span>
              </div>
            </div>
          </div>

          {/* Supported Gateways Note */}
          <div className="flex items-center justify-center gap-4 text-[11px] text-gray-500 font-medium">
            <span className="flex items-center gap-1.5">
              <CreditCard className="w-3.5 h-3.5 text-brand-pink" />
              <span>JuicePay Credit Card</span>
            </span>
            <span>•</span>
            <span className="flex items-center gap-1.5">
              <span className="font-bold text-[#003087]">Pay</span>
              <span className="font-bold text-[#0079C1]">Pal</span>
            </span>
          </div>

          {/* Action CTAs */}
          <div className="space-y-2.5 pt-1">
            {pendingOpp ? (
              <button
                type="button"
                onClick={() => navigate('/payment', { state: { opportunity: pendingOpp } })}
                className="w-full py-4 px-6 rounded-2xl bg-brand-pink hover:bg-rose-700 text-white text-sm font-bold shadow-md hover:shadow-lg transition-all flex items-center justify-center gap-2 cursor-pointer"
              >
                <Sparkles className="w-4 h-4" />
                <span>Complete Payment for "{pendingOpp.productionCompany || 'Casting Post'}"</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            ) : null}

            <Link
              to="/post-job"
              className={`w-full py-3.5 px-6 rounded-2xl text-xs sm:text-sm font-bold transition-all flex items-center justify-center gap-2 cursor-pointer ${
                pendingOpp
                  ? 'bg-white border border-gray-200 text-gray-800 hover:bg-gray-50'
                  : 'bg-brand-pink hover:bg-rose-700 text-white shadow-md'
              }`}
            >
              <PlusCircle className="w-4 h-4" />
              <span>Announce Work to Publish Post &amp; Unlock</span>
              {!pendingOpp && <ArrowRight className="w-4 h-4" />}
            </Link>

            <Link
              to="/opportunities"
              className="block text-center text-xs text-gray-500 hover:text-gray-900 font-medium pt-1"
            >
              ← Back to Casting Calls
            </Link>
          </div>

          {/* Quick Demo Mode Toggle for Immediate Testing */}
          <div className="pt-3 border-t border-gray-100 flex items-center justify-between text-[11px] text-gray-400">
            <span>Evaluation / Demo Testing:</span>
            <button
              type="button"
              onClick={handleTestUnlock}
              className="text-brand-pink hover:underline font-bold flex items-center gap-1 cursor-pointer"
            >
              <Sparkles className="w-3 h-3" />
              <span>Simulate Payment &amp; Unlock Now</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CandidateAccessLock;
