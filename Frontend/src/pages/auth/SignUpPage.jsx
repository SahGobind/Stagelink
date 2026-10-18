import React, { useState } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Eye, EyeOff, Sparkles, AlertCircle, Building2, UserPlus } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import Input from '../../components/common/Input';
import Checkbox from '../../components/common/Checkbox';

const signUpSchema = z
  .object({
    fullName: z
      .string()
      .trim()
      .min(2, { message: 'Full name must be at least 2 characters long' })
      .max(60, { message: 'Full name cannot exceed 60 characters' }),
    email: z
      .string()
      .trim()
      .email({ message: 'Please enter a valid email address' }),
    phoneNumber: z
      .string()
      .trim()
      .min(10, { message: 'Please enter a valid phone number (at least 10 digits)' })
      .regex(/^[0-9+\s\-()]{10,18}$/, { message: 'Phone number format is invalid' }),
    dateOfBirth: z
      .string()
      .min(1, { message: 'Date of birth is required' })
      .refine(
        (val) => {
          const birthDate = new Date(val);
          const now = new Date();
          const age = now.getFullYear() - birthDate.getFullYear();
          return age >= 16;
        },
        { message: 'Performers must be at least 16 years of age' }
      ),
    location: z
      .string()
      .trim()
      .min(2, { message: 'Location/city is required' }),
    password: z
      .string()
      .min(8, { message: 'Password must be at least 8 characters long' }),
    confirmPassword: z
      .string()
      .min(1, { message: 'Please confirm your password' }),
    agreeToTerms: z
      .union([z.boolean(), z.string().transform((v) => v === 'on' || v === 'true')])
      .refine((val) => val === true, {
        message: 'You must agree to the Terms of Service and Privacy Policy',
      }),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: 'Passwords do not match',
    path: ['confirmPassword'],
  });

const SignUpPage = () => {
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [serverError, setServerError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const { signUp } = useAuth();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const isFromTestYourTalent = searchParams.get('from') === 'test-your-talent';
  const isFromProduction = searchParams.get('from') === 'production' || searchParams.get('role') === 'admin';
  const roleParam = searchParams.get('role');
  const userRole = (roleParam === 'admin' || isFromProduction) ? 'admin' : 'candidate';
  const defaultRedirect = userRole === 'admin' ? '/admin/dashboard' : '/candidate/profile/setup';
  const redirectTarget = searchParams.get('redirect') || defaultRedirect;
  const isProfileRedirect = redirectTarget === '/candidate/profile/setup' || searchParams.get('redirect') === '/candidate/profile/setup';

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(signUpSchema),
    defaultValues: {
      fullName: '',
      email: '',
      phoneNumber: '',
      dateOfBirth: '',
      location: '',
      password: '',
      confirmPassword: '',
      agreeToTerms: false,
    },
  });

  const onSubmit = async (data) => {
    setServerError('');
    setIsSubmitting(true);
    try {
      await signUp({
        fullName: data.fullName,
        email: data.email,
        phoneNumber: data.phoneNumber,
        dateOfBirth: data.dateOfBirth,
        location: data.location,
        role: userRole,
      });
      navigate(redirectTarget);
    } catch {
      setServerError('Failed to create account. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto px-4 sm:px-6">
      <div className="bg-white rounded-3xl p-6 sm:p-10 shadow-xl border border-gray-100 space-y-6 text-left">
        {/* Production Onboarding Banner */}
        {isFromProduction && (
          <div className="p-4 bg-black text-white rounded-2xl flex items-start gap-3 shadow-xs border border-neutral-800">
            <div className="w-8 h-8 rounded-xl bg-white text-black flex items-center justify-center font-bold text-xs shrink-0 mt-0.5">
              <Building2 className="w-4 h-4 text-black" />
            </div>
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <span className="font-bold text-sm">Register Production / Studio Profile</span>
                <span className="px-2 py-0.5 bg-neutral-800 text-neutral-300 text-[10px] rounded-full uppercase tracking-wider font-semibold">
                  Studio Portal
                </span>
              </div>
              <p className="text-xs text-neutral-300 leading-relaxed">
                Create your verified casting director or studio account to post casting calls, discover 5,000+ performers, and manage ranked audition submissions.
              </p>
            </div>
          </div>
        )}

        {/* Heading */}
        <div className="space-y-1">
          <h2 className="text-2xl sm:text-3xl font-bold font-serif text-brand-navy">
            {isFromProduction ? 'Create Your Production Profile' : 'Create Your Performer Account'}
          </h2>
          <p className="text-xs sm:text-sm text-brand-text-secondary leading-relaxed">
            {isFromProduction
              ? 'Join as a casting director, producer, or studio to post auditions and discover premier talent.'
              : 'Begin your acting journey with verified casting calls. Detailed portfolio and headshots will be collected during profile setup.'}
          </p>
        </div>

      {/* Form-level Error Feedback */}
      {serverError && (
        <div className="p-3 bg-red-50 border border-red-200 text-brand-error rounded-xl text-xs font-medium flex items-center gap-2">
          <AlertCircle className="w-4 h-4 shrink-0" />
          <span>{serverError}</span>
        </div>
      )}

      {/* Registration Form */}
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-3.5" noValidate>
        {/* Full Name */}
        <Input
          label="Full Name"
          placeholder="e.g. Sarah Jenkins"
          required
          error={errors.fullName?.message}
          {...register('fullName')}
        />

        {/* Email & Phone Number Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <Input
            label="Email Address"
            type="email"
            placeholder="sarah@example.com"
            required
            error={errors.email?.message}
            {...register('email')}
          />

          <Input
            label="Phone Number"
            type="tel"
            placeholder="+91 98765 43210"
            required
            error={errors.phoneNumber?.message}
            {...register('phoneNumber')}
          />
        </div>

        {/* Date of Birth & Location Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <Input
            label="Date of Birth"
            type="date"
            required
            error={errors.dateOfBirth?.message}
            {...register('dateOfBirth')}
          />

          <Input
            label="Location / City"
            placeholder="e.g. Mumbai, India"
            required
            error={errors.location?.message}
            {...register('location')}
          />
        </div>

        {/* Password */}
        <Input
          label="Password"
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

        {/* Confirm Password */}
        <Input
          label="Confirm Password"
          type={showConfirmPassword ? 'text' : 'password'}
          placeholder="Re-enter password"
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

        {/* Terms and Privacy Consent */}
        <div className="pt-1">
          <Checkbox
            label={
              <span className="text-xs text-brand-navy/90">
                I agree to the{' '}
                <a href="#terms" className="text-black font-semibold hover:underline">
                  Terms of Service
                </a>{' '}
                and{' '}
                <a href="#privacy" className="text-black font-semibold hover:underline">
                  Privacy Policy
                </a>{' '}
                <span className="text-brand-error">*</span>
              </span>
            }
            error={errors.agreeToTerms?.message}
            {...register('agreeToTerms')}
          />
        </div>

        {/* Submit Button */}
        <button
          type="submit"
          disabled={isSubmitting}
          className="w-full py-3 bg-black hover:bg-neutral-800 text-white text-xs font-bold rounded-xl shadow-xs transition-all mt-2 flex items-center justify-center gap-2 disabled:opacity-50"
        >
          {isSubmitting ? (
            <span>Creating Account...</span>
          ) : (
            <>
              <Sparkles className="w-4 h-4" />
              <span>Create Account</span>
            </>
          )}
        </button>
      </form>

      {/* Link to Login */}
      <div className="text-center text-xs text-brand-text-secondary pt-1">
        Already have an account?{' '}
        <Link
          to={`/login${redirectTarget ? `?redirect=${encodeURIComponent(redirectTarget)}` : ''}`}
          className="font-bold text-black hover:underline"
        >
          Sign In
        </Link>
      </div>
    </div>
  </div>
  );
};

export default SignUpPage;
