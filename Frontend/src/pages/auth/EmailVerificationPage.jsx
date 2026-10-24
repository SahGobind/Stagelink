import React, { useState } from 'react';
import { useSearchParams, useNavigate, Link } from 'react-router-dom';
import { Mail, CheckCircle2, ArrowRight, ShieldAlert, Sparkles, Building2, RefreshCw } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { authService } from '../../services/authService';

const EmailVerificationPage = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { login } = useAuth();

  const email = searchParams.get('email') || 'recruiter@stagelink.com';
  const name = searchParams.get('name') || 'Production Recruiter';
  const company = searchParams.get('company') || 'Production Studio';

  const [otp, setOtp] = useState(['', '', '', '', '', '']);
  const [isVerifying, setIsVerifying] = useState(false);
  const [resendStatus, setResendStatus] = useState('');

  const handleOtpChange = (index, value) => {
    if (value.length > 1) value = value.slice(-1);
    const updated = [...otp];
    updated[index] = value;
    setOtp(updated);

    // Auto-focus next input
    if (value && index < 5) {
      const nextInput = document.getElementById(`otp-input-${index + 1}`);
      if (nextInput) nextInput.focus();
    }
  };

  const handleKeyDown = (index, e) => {
    if (e.key === 'Backspace' && !otp[index] && index > 0) {
      const prevInput = document.getElementById(`otp-input-${index - 1}`);
      if (prevInput) prevInput.focus();
    }
  };

  const redirectParam = searchParams.get('redirect');

  const handleVerify = async (e) => {
    if (e) e.preventDefault();
    setIsVerifying(true);

    try {
      // Simulate verification latency
      await new Promise((r) => setTimeout(r, 600));

      // Ensure session is set or re-login if needed
      const currentUser = authService.getCurrentUser();
      if (!currentUser || currentUser.email !== email) {
        try {
          await login(email, 'StageLink2026!');
        } catch {
          // If custom password was used during signup, user is redirected to login or stays logged in
        }
      }

      navigate(redirectParam || '/admin/dashboard', {
        state: { message: `Welcome to StageLink, ${name}! Your studio account is active.` },
      });
    } catch {
      setIsVerifying(false);
    }
  };

  const handleResend = () => {
    setResendStatus('Simulated verification code re-dispatched to ' + email);
    setTimeout(() => setResendStatus(''), 4000);
  };

  return (
    <div className="max-w-xl mx-auto px-4 sm:px-6 text-left">
      <div className="bg-white rounded-3xl p-6 sm:p-10 shadow-xl border border-gray-100 space-y-6">
        {/* Verification Icon Header */}
        <div className="flex items-center gap-4 border-b border-gray-100 pb-5">
          <div className="w-12 h-12 rounded-2xl bg-pink-50 border border-pink-200 text-brand-pink flex items-center justify-center shrink-0">
            <Mail className="w-6 h-6 stroke-[2.2]" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-[10px] font-bold uppercase tracking-wider text-brand-pink bg-pink-50 px-2.5 py-0.5 rounded-full border border-pink-200">
                Verification Pending
              </span>
              <span className="text-[10px] font-mono text-gray-400">Step 1 of 5</span>
            </div>
            <h1 className="text-xl sm:text-2xl font-bold font-serif text-brand-navy">
              Verify Your Business Email
            </h1>
          </div>
        </div>

        {/* Studio Identity Card */}
        <div className="p-4 rounded-2xl bg-gray-50 border border-gray-200/80 space-y-2">
          <div className="flex items-center gap-2 text-xs font-bold text-gray-800">
            <Building2 className="w-4 h-4 text-brand-pink" />
            <span>{company}</span>
          </div>
          <p className="text-xs text-gray-600 leading-relaxed">
            Account created for <strong className="text-gray-900 font-bold">{name}</strong> at{' '}
            <strong className="text-brand-pink font-semibold">{email}</strong>.
          </p>
        </div>

        {/* Development Mock Notice */}
        <div className="p-4 rounded-2xl bg-amber-50 border border-amber-200/90 text-amber-900 space-y-1.5 text-xs">
          <div className="flex items-center gap-1.5 font-bold text-amber-950">
            <ShieldAlert className="w-4 h-4 text-amber-600 shrink-0" />
            <span>Development Mock Functionality Notice</span>
          </div>
          <p className="text-[11px] leading-relaxed text-amber-800">
            Production SMTP / email services and database persistence are not connected. No real email was dispatched. Use the simulated verification below to complete the onboarding workflow.
          </p>
        </div>

        {/* Simulated 6-digit Code Entry */}
        <div className="space-y-3">
          <label className="block text-xs font-bold text-gray-700">
            Enter 6-Digit Verification Code (or click instant verify)
          </label>
          <div className="flex justify-between gap-2 max-w-sm">
            {otp.map((digit, idx) => (
              <input
                key={idx}
                id={`otp-input-${idx}`}
                type="text"
                inputMode="numeric"
                maxLength={1}
                value={digit}
                onChange={(e) => handleOtpChange(idx, e.target.value)}
                onKeyDown={(e) => handleKeyDown(idx, e)}
                placeholder="•"
                className="w-11 h-12 text-center text-base font-bold font-mono bg-gray-50 border border-gray-200 rounded-xl focus:bg-white focus:outline-none focus:border-brand-pink focus:ring-2 focus:ring-pink-100 transition-all text-gray-900"
              />
            ))}
          </div>
        </div>

        {/* Resend Status Message */}
        {resendStatus && (
          <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-xl text-xs text-emerald-800 flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
            <span>{resendStatus}</span>
          </div>
        )}

        {/* Action Buttons */}
        <div className="space-y-3 pt-2">
          <button
            type="button"
            onClick={handleVerify}
            disabled={isVerifying}
            className="w-full py-3.5 px-6 bg-brand-pink hover:bg-rose-700 text-white font-bold text-xs uppercase tracking-wider rounded-xl shadow-md transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-75"
          >
            {isVerifying ? (
              <>
                <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                <span>Activating Account...</span>
              </>
            ) : (
              <>
                <span>
                  {redirectParam === '/post-job'
                    ? 'Complete Verification & Continue to Post Job'
                    : 'Complete Verification & Enter Dashboard'}
                </span>
                <ArrowRight className="w-4 h-4" />
              </>
            )}
          </button>

          <div className="flex items-center justify-between text-xs pt-1">
            <button
              type="button"
              onClick={handleResend}
              className="inline-flex items-center gap-1.5 text-gray-500 hover:text-gray-900 font-semibold cursor-pointer"
            >
              <RefreshCw className="w-3.5 h-3.5" />
              <span>Resend Code (Simulated)</span>
            </button>

            <Link
              to="/login?role=recruiter"
              className="text-brand-pink hover:underline font-bold"
            >
              Back to Recruiter Sign In
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default EmailVerificationPage;
