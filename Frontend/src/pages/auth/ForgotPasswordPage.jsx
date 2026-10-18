import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Mail, CheckCircle2, ArrowLeft, Sparkles } from 'lucide-react';
import Input from '../../components/common/Input';

const forgotPasswordSchema = z.object({
  email: z
    .string()
    .trim()
    .min(1, { message: 'Email address is required' })
    .email({ message: 'Please enter a valid email address' }),
});

const ForgotPasswordPage = () => {
  const [submittedEmail, setSubmittedEmail] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(forgotPasswordSchema),
    defaultValues: {
      email: '',
    },
  });

  const onSubmit = (data) => {
    setIsSubmitting(true);
    // Simulate sending reset instructions
    setTimeout(() => {
      setSubmittedEmail(data.email);
      setIsSubmitting(false);
    }, 400);
  };

  return (
    <div className="max-w-md mx-auto px-4 sm:px-6">
      <div className="bg-white rounded-3xl p-6 sm:p-10 shadow-xl border border-gray-100 space-y-6 text-left">
        {/* Heading */}
        <div className="space-y-1">
          <h2 className="text-2xl sm:text-3xl font-bold font-serif text-brand-navy">
            Forgot Password
          </h2>
          <p className="text-xs sm:text-sm text-brand-text-secondary leading-relaxed">
            Enter your registered email address to receive password reset instructions.
          </p>
        </div>

      {submittedEmail ? (
        <div className="p-5 bg-emerald-50 border border-emerald-200 rounded-2xl space-y-3">
          <div className="flex items-center gap-2 text-emerald-800">
            <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
            <h3 className="text-sm font-bold">Reset Instructions Sent!</h3>
          </div>
          <p className="text-xs text-emerald-900 leading-relaxed">
            If an account exists for <strong className="font-bold">{submittedEmail}</strong>,
            a reset link has been dispatched.
          </p>
          <div className="pt-2 border-t border-emerald-200/60">
            <Link
              to="/reset-password?token=demo-token"
              className="inline-flex items-center gap-1.5 text-xs font-bold text-brand-pink hover:underline"
            >
              <span>Demo Mode: Proceed to Choose New Password</span>
              <span>→</span>
            </Link>
          </div>
        </div>
      ) : (
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4" noValidate>
          <Input
            label="Registered Email Address"
            type="email"
            placeholder="e.g. sarah@stagelink.com"
            required
            error={errors.email?.message}
            icon={Mail}
            {...register('email')}
          />

          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full py-3 bg-black hover:bg-neutral-800 text-white text-xs font-bold rounded-xl shadow-xs transition-all flex items-center justify-center gap-2 disabled:opacity-50"
          >
            {isSubmitting ? (
              <span>Sending Instructions...</span>
            ) : (
              <>
                <Sparkles className="w-4 h-4" />
                <span>Send Reset Instructions</span>
              </>
            )}
          </button>
        </form>
      )}

      {/* Return to Sign In */}
      <div className="text-center text-xs text-brand-text-secondary pt-2">
        <Link
          to="/login"
          className="inline-flex items-center gap-1.5 font-bold text-black hover:underline transition-colors"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>Back to Sign In</span>
        </Link>
      </div>
    </div>
  </div>
  );
};

export default ForgotPasswordPage;
