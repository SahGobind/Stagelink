import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Eye, EyeOff, CheckCircle2, ArrowLeft, ShieldAlert, Sparkles } from 'lucide-react';
import Input from '../../components/common/Input';

const resetPasswordSchema = z
  .object({
    password: z
      .string()
      .min(8, { message: 'New password must be at least 8 characters long' }),
    confirmPassword: z
      .string()
      .min(1, { message: 'Please confirm your new password' }),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: 'Passwords do not match',
    path: ['confirmPassword'],
  });

const ResetPasswordPage = () => {
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const navigate = useNavigate();

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(resetPasswordSchema),
    defaultValues: {
      password: '',
      confirmPassword: '',
    },
  });

  const onSubmit = () => {
    setIsSubmitting(true);
    // Simulate updating password in demo
    setTimeout(() => {
      setIsSubmitting(false);
      setIsSuccess(true);
      // Auto-redirect to login after brief feedback
      setTimeout(() => {
        navigate('/login');
      }, 2500);
    }, 400);
  };

  return (
    <div className="max-w-md mx-auto px-4 sm:px-6">
      <div className="bg-white rounded-3xl p-6 sm:p-10 shadow-xl border border-gray-100 space-y-6 text-left">
        {/* Heading */}
        <div className="space-y-1">
          <h2 className="text-2xl sm:text-3xl font-bold font-serif text-brand-navy">
            Choose New Password
          </h2>
          <p className="text-xs sm:text-sm text-brand-text-secondary leading-relaxed">
            Create a strong password of at least 8 characters to secure your StarCast account.
          </p>
        </div>

      {/* Demo Architecture Notice Banner */}
      <div className="p-3 bg-amber-50/80 border border-amber-200/80 rounded-2xl flex items-start gap-2.5 text-amber-900 text-[11px] leading-relaxed">
        <ShieldAlert className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
        <div>
          <span className="font-bold">Frontend Demo Mode:</span> Passwords are not
          persisted in plaintext. Real authentication, hashing, email verification,
          and session tokens require backend implementation.
        </div>
      </div>

      {isSuccess ? (
        <div className="p-5 bg-emerald-50 border border-emerald-200 rounded-2xl space-y-3">
          <div className="flex items-center gap-2 text-emerald-800">
            <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
            <h3 className="text-sm font-bold">Password Successfully Updated!</h3>
          </div>
          <p className="text-xs text-emerald-900 leading-relaxed">
            Your new password has been saved. You can now use it to sign in to your StarCast account.
          </p>
          <div className="pt-2 border-t border-emerald-200/60">
            <Link
              to="/login"
              className="inline-flex items-center gap-1.5 text-xs font-bold text-brand-pink hover:underline"
            >
              <span>Proceed to Login Immediately</span>
              <span>→</span>
            </Link>
          </div>
        </div>
      ) : (
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4" noValidate>
          {/* New Password */}
          <Input
            label="New Password"
            type={showPassword ? 'text' : 'password'}
            placeholder="At least 8 characters"
            required
            error={errors.password?.message}
            rightElement={
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                aria-label={showPassword ? 'Hide password' : 'Show password'}
                className="text-gray-400 hover:text-brand-navy focus:outline-none p-1"
              >
                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            }
            {...register('password')}
          />

          {/* Confirm New Password */}
          <Input
            label="Confirm New Password"
            type={showConfirmPassword ? 'text' : 'password'}
            placeholder="Re-enter your new password"
            required
            error={errors.confirmPassword?.message}
            rightElement={
              <button
                type="button"
                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                aria-label={showConfirmPassword ? 'Hide password' : 'Show password'}
                className="text-gray-400 hover:text-brand-navy focus:outline-none p-1"
              >
                {showConfirmPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            }
            {...register('confirmPassword')}
          />

          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full py-3 bg-black hover:bg-neutral-800 text-white text-xs font-bold rounded-xl shadow-xs transition-all flex items-center justify-center gap-2 disabled:opacity-50 mt-2"
          >
            {isSubmitting ? (
              <span>Updating Password...</span>
            ) : (
              <>
                <Sparkles className="w-4 h-4" />
                <span>Update Password</span>
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

export default ResetPasswordPage;
