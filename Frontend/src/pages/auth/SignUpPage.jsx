import React, { useState } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import {
  Eye,
  EyeOff,
  Sparkles,
  AlertCircle,
  Building2,
  UserCheck,
  Globe,
  Info,
  ShieldCheck,
  User,
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { authService } from '../../services/authService';
import Input from '../../components/common/Input';
import Checkbox from '../../components/common/Checkbox';

// 1. Candidate Registration Schema
const candidateSignUpSchema = z
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

// 2. Recruiter / Production Company Registration Schema
const recruiterSignUpSchema = z
  .object({
    fullName: z
      .string()
      .trim()
      .min(2, { message: 'Recruiter full name is required (at least 2 characters)' })
      .max(80, { message: 'Full name cannot exceed 80 characters' }),
    companyName: z
      .string()
      .trim()
      .min(2, { message: 'Production Company name is required' }),
    email: z
      .string()
      .trim()
      .email({ message: 'Please enter a valid business email address' }),
    phoneNumber: z
      .string()
      .trim()
      .optional()
      .refine(
        (val) => !val || /^[0-9+\s\-()]{10,20}$/.test(val),
        { message: 'Phone number format is invalid (include country code)' }
      ),
    country: z
      .string()
      .trim()
      .min(2, { message: 'Country is required' }),
    website: z
      .string()
      .trim()
      .optional()
      .refine(
        (val) => !val || /^https?:\/\/.+/.test(val) || /^www\..+/.test(val),
        { message: 'Website must start with https://, http://, or www.' }
      ),
    password: z
      .string()
      .min(8, { message: 'Password must be at least 8 characters long' }),
    confirmPassword: z
      .string()
      .min(1, { message: 'Please confirm your password' }),
    agreeToTerms: z
      .union([z.boolean(), z.string().transform((v) => v === 'on' || v === 'true')])
      .refine((val) => val === true, {
        message: 'You must accept the Terms of Service and Privacy Policy',
      }),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: 'Passwords do not match',
    path: ['confirmPassword'],
  });

const SignUpPage = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { signUp } = useAuth();

  const isRoleRecruiterParam =
    searchParams.get('role') === 'recruiter' ||
    searchParams.get('role') === 'admin' ||
    searchParams.get('from') === 'production' ||
    searchParams.get('redirect') === '/post-job';

  const redirectParam = searchParams.get('redirect');
  const [activeTab, setActiveTab] = useState(isRoleRecruiterParam ? 'recruiter' : 'candidate');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [serverError, setServerError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Form for candidate
  const candidateForm = useForm({
    resolver: zodResolver(candidateSignUpSchema),
    defaultValues: {
      fullName: '',
      email: '',
      phoneNumber: '',
      dateOfBirth: '',
      location: 'Mumbai, India',
      password: '',
      confirmPassword: '',
      agreeToTerms: false,
    },
  });

  // Form for recruiter
  const recruiterForm = useForm({
    resolver: zodResolver(recruiterSignUpSchema),
    defaultValues: {
      fullName: '',
      companyName: '',
      email: '',
      phoneNumber: '',
      country: 'India',
      website: '',
      password: '',
      confirmPassword: '',
      agreeToTerms: false,
    },
  });

  const onCandidateSubmit = async (data) => {
    setServerError('');
    setIsSubmitting(true);
    try {
      await signUp({
        fullName: data.fullName,
        email: data.email,
        phoneNumber: data.phoneNumber,
        dateOfBirth: data.dateOfBirth,
        location: data.location,
        role: 'candidate',
      });
      navigate(redirectParam || '/candidate/profile/setup');
    } catch {
      setServerError('Failed to create performer account. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const onRecruiterSubmit = async (data) => {
    setServerError('');
    setIsSubmitting(true);

    try {
      // 1. Prepare backend payload
      const payload = {
        fullName: data.fullName,
        companyName: data.companyName,
        email: data.email,
        phoneNumber: data.phoneNumber || '',
        country: data.country,
        website: data.website || '',
        password: data.password,
        confirmPassword: data.confirmPassword,
        agreeToTerms: true,
      };

      // 2. Call backend recruiter register endpoint
      try {
        await fetch('/api/users/recruiter/register/', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload),
        });
      } catch {
        // client-side fallback
      }

      // 3. Register user locally in authService
      await authService.signUp({
        fullName: data.fullName,
        companyName: data.companyName,
        email: data.email,
        phoneNumber: data.phoneNumber,
        country: data.country,
        website: data.website,
        role: 'recruiter',
      });

      // 4. Navigate to Email Verification UI showing pending verification state
      const redirectQuery = redirectParam ? `&redirect=${encodeURIComponent(redirectParam)}` : '';
      navigate(
        `/verify-email?email=${encodeURIComponent(data.email)}&name=${encodeURIComponent(
          data.fullName
        )}&company=${encodeURIComponent(data.companyName)}${redirectQuery}`
      );
    } catch {
      setServerError('Failed to create recruiter profile. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleInstantDemoRecruiter = async () => {
    try {
      authService.ensureRecruiterSession({
        fullName: 'Marcus Sterling',
        companyName: 'Apex Vision Studios',
        email: 'recruiter@stagelink.com',
      });
      await authService.login('recruiter@stagelink.com', 'password123');
      navigate(redirectParam || '/post-job');
    } catch {
      // fallback
      navigate(redirectParam || '/post-job');
    }
  };

  return (
    <div className="max-w-2xl mx-auto px-4 sm:px-6 text-left">
      <div className="bg-white rounded-3xl p-6 sm:p-10 shadow-xl border border-gray-100 space-y-6">
        {/* Role Switcher Tabs */}
        <div className="flex p-1 bg-gray-100 rounded-2xl">
          <button
            type="button"
            onClick={() => {
              setActiveTab('recruiter');
              setServerError('');
            }}
            className={`flex-1 py-2.5 px-3 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-2 cursor-pointer ${
              activeTab === 'recruiter'
                ? 'bg-white text-gray-900 shadow-xs'
                : 'text-gray-500 hover:text-gray-900'
            }`}
          >
            <Building2 className={`w-4 h-4 ${activeTab === 'recruiter' ? 'text-brand-pink' : ''}`} />
            <span>Recruiter / Production Studio</span>
          </button>
          <button
            type="button"
            onClick={() => {
              setActiveTab('candidate');
              setServerError('');
            }}
            className={`flex-1 py-2.5 px-3 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-2 cursor-pointer ${
              activeTab === 'candidate'
                ? 'bg-white text-gray-900 shadow-xs'
                : 'text-gray-500 hover:text-gray-900'
            }`}
          >
            <User className={`w-4 h-4 ${activeTab === 'candidate' ? 'text-brand-pink' : ''}`} />
            <span>Performer / Talent</span>
          </button>
        </div>


        {/* Heading */}
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <span className="text-[10px] font-bold uppercase tracking-wider text-brand-pink bg-pink-50 px-2.5 py-0.5 rounded-full border border-pink-200">
              {activeTab === 'recruiter' ? 'Step 1 of 5 — Recruiter Onboarding' : 'Performer Portal'}
            </span>
          </div>
          <h2 className="text-2xl sm:text-3xl font-bold font-serif text-brand-navy">
            {activeTab === 'recruiter' ? 'Create Your Recruiter & Studio Account' : 'Create Your Performer Account'}
          </h2>
          <p className="text-xs sm:text-sm text-brand-text-secondary leading-relaxed">
            {activeTab === 'recruiter'
              ? 'Register your production house or casting agency to announce casting calls, review fees, and manage auditions.'
              : 'Begin your acting journey with verified casting calls and auditions.'}
          </p>
        </div>

        {/* Job Posting Recruiter Notice */}
        {activeTab === 'recruiter' && redirectParam === '/post-job' && (
          <div className="p-4 bg-gradient-to-r from-pink-50 via-rose-50/70 to-purple-50 border border-pink-200 rounded-2xl flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 text-xs text-neutral-800">
            <div className="flex items-start gap-3">
              <div className="w-8 h-8 rounded-xl bg-brand-pink text-white flex items-center justify-center shrink-0 shadow-2xs mt-0.5">
                <Building2 className="w-4 h-4" />
              </div>
              <div>
                <h4 className="font-bold text-gray-900">
                  Register Your Studio to Announce Work
                </h4>
                <p className="text-[11px] text-gray-600 mt-0.5 leading-relaxed">
                  Only registered production companies and recruiters can post jobs on StageLink. Complete your setup below to immediately publish your casting call.
                </p>
              </div>
            </div>
            <button
              type="button"
              onClick={handleInstantDemoRecruiter}
              className="px-3.5 py-2 bg-neutral-900 hover:bg-black text-white text-[11px] font-bold rounded-xl shadow-xs transition-colors shrink-0 flex items-center gap-1.5 cursor-pointer whitespace-nowrap self-end sm:self-center"
            >
              <Sparkles className="w-3.5 h-3.5 text-amber-300" />
              <span>1-Click Demo Recruiter</span>
            </button>
          </div>
        )}

        {/* Server Error Message */}
        {serverError && (
          <div className="p-3 bg-red-50 border border-red-200 text-brand-error rounded-xl text-xs font-medium flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{serverError}</span>
          </div>
        )}

        {/* ================= RECRUITER REGISTRATION FORM ================= */}
        {activeTab === 'recruiter' && (
          <form
            onSubmit={recruiterForm.handleSubmit(onRecruiterSubmit)}
            className="space-y-4"
            noValidate
          >
            {/* Recruiter Full Name */}
            <Input
              label="Recruiter Full Name"
              placeholder="e.g. Marcus Sterling"
              required
              error={recruiterForm.formState.errors.fullName?.message}
              {...recruiterForm.register('fullName')}
            />

            {/* Production Company Name */}
            <Input
              label="Production Company Name"
              placeholder="e.g. Apex Vision Studios / Silverline Pictures"
              required
              error={recruiterForm.formState.errors.companyName?.message}
              {...recruiterForm.register('companyName')}
            />

            {/* Business Email & Phone */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <Input
                label="Business Email"
                type="email"
                placeholder="recruiter@production.com"
                required
                error={recruiterForm.formState.errors.email?.message}
                {...recruiterForm.register('email')}
              />

              <Input
                label="Phone Number (with Country Code)"
                type="tel"
                placeholder="+91 98765 43210 or +44 20 7946 0912"
                error={recruiterForm.formState.errors.phoneNumber?.message}
                {...recruiterForm.register('phoneNumber')}
              />
            </div>

            {/* Country & Company Website */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <Input
                label="Country"
                placeholder="e.g. India, United Kingdom, USA"
                required
                error={recruiterForm.formState.errors.country?.message}
                {...recruiterForm.register('country')}
              />

              <Input
                label="Company Website (Optional)"
                type="url"
                placeholder="https://apexvisionstudios.com"
                error={recruiterForm.formState.errors.website?.message}
                {...recruiterForm.register('website')}
              />
            </div>

            {/* Password */}
            <Input
              label="Password (min 8 characters)"
              type={showPassword ? 'text' : 'password'}
              placeholder="Choose a strong password"
              required
              error={recruiterForm.formState.errors.password?.message}
              rightElement={
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  aria-label={showPassword ? 'Hide password' : 'Show password'}
                  className="text-gray-400 hover:text-brand-navy focus:outline-none p-1 cursor-pointer"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              }
              {...recruiterForm.register('password')}
            />

            {/* Confirm Password */}
            <Input
              label="Confirm Password"
              type={showConfirmPassword ? 'text' : 'password'}
              placeholder="Re-enter password"
              required
              error={recruiterForm.formState.errors.confirmPassword?.message}
              rightElement={
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  aria-label={showConfirmPassword ? 'Hide password' : 'Show password'}
                  className="text-gray-400 hover:text-brand-navy focus:outline-none p-1 cursor-pointer"
                >
                  {showConfirmPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              }
              {...recruiterForm.register('confirmPassword')}
            />

            {/* Terms and Privacy Consent */}
            <div className="pt-1">
              <Checkbox
                label={
                  <span className="text-xs text-brand-navy/90">
                    I agree to StageLink's{' '}
                    <a href="#terms" className="text-brand-pink font-semibold hover:underline">
                      Terms of Service
                    </a>{' '}
                    and{' '}
                    <a href="#privacy" className="text-brand-pink font-semibold hover:underline">
                      Privacy Policy
                    </a>{' '}
                    <span className="text-brand-error">*</span>
                  </span>
                }
                error={recruiterForm.formState.errors.agreeToTerms?.message}
                {...recruiterForm.register('agreeToTerms')}
              />
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full py-3.5 bg-brand-pink hover:bg-rose-700 text-white text-xs font-bold uppercase tracking-wider rounded-xl shadow-md transition-all mt-2 flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
            >
              {isSubmitting ? (
                <>
                  <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  <span>Registering Studio Account...</span>
                </>
              ) : (
                <>
                  <Sparkles className="w-4 h-4" />
                  <span>Create Recruiter Profile &amp; Verify Email</span>
                </>
              )}
            </button>
          </form>
        )}

        {/* ================= CANDIDATE REGISTRATION FORM ================= */}
        {activeTab === 'candidate' && (
          <form
            onSubmit={candidateForm.handleSubmit(onCandidateSubmit)}
            className="space-y-3.5"
            noValidate
          >
            <Input
              label="Full Name"
              placeholder="e.g. Sarah Jenkins"
              required
              error={candidateForm.formState.errors.fullName?.message}
              {...candidateForm.register('fullName')}
            />

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <Input
                label="Email Address"
                type="email"
                placeholder="sarah@example.com"
                required
                error={candidateForm.formState.errors.email?.message}
                {...candidateForm.register('email')}
              />

              <Input
                label="Phone Number"
                type="tel"
                placeholder="+91 98765 43210"
                required
                error={candidateForm.formState.errors.phoneNumber?.message}
                {...candidateForm.register('phoneNumber')}
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <Input
                label="Date of Birth"
                type="date"
                required
                error={candidateForm.formState.errors.dateOfBirth?.message}
                {...candidateForm.register('dateOfBirth')}
              />

              <Input
                label="Location / City"
                placeholder="e.g. Mumbai, India"
                required
                error={candidateForm.formState.errors.location?.message}
                {...candidateForm.register('location')}
              />
            </div>

            <Input
              label="Password"
              type={showPassword ? 'text' : 'password'}
              placeholder="At least 8 characters"
              required
              error={candidateForm.formState.errors.password?.message}
              rightElement={
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  aria-label={showPassword ? 'Hide password' : 'Show password'}
                  className="text-gray-400 hover:text-brand-navy focus:outline-none p-1 cursor-pointer"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              }
              {...candidateForm.register('password')}
            />

            <Input
              label="Confirm Password"
              type={showConfirmPassword ? 'text' : 'password'}
              placeholder="Re-enter password"
              required
              error={candidateForm.formState.errors.confirmPassword?.message}
              rightElement={
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  aria-label={showConfirmPassword ? 'Hide password' : 'Show password'}
                  className="text-gray-400 hover:text-brand-navy focus:outline-none p-1 cursor-pointer"
                >
                  {showConfirmPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              }
              {...candidateForm.register('confirmPassword')}
            />

            <div className="pt-1">
              <Checkbox
                label={
                  <span className="text-xs text-brand-navy/90">
                    I agree to the{' '}
                    <a href="#terms" className="text-brand-pink font-semibold hover:underline">
                      Terms of Service
                    </a>{' '}
                    and{' '}
                    <a href="#privacy" className="text-brand-pink font-semibold hover:underline">
                      Privacy Policy
                    </a>{' '}
                    <span className="text-brand-error">*</span>
                  </span>
                }
                error={candidateForm.formState.errors.agreeToTerms?.message}
                {...candidateForm.register('agreeToTerms')}
              />
            </div>

            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full py-3 bg-black hover:bg-neutral-800 text-white text-xs font-bold rounded-xl shadow-xs transition-all mt-2 flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
            >
              {isSubmitting ? (
                <span>Creating Account...</span>
              ) : (
                <>
                  <Sparkles className="w-4 h-4" />
                  <span>Create Performer Account</span>
                </>
              )}
            </button>
          </form>
        )}

        {/* Sign In Link */}
        <div className="text-center text-xs text-brand-text-secondary pt-2 border-t border-gray-100">
          Already have an account?{' '}
          <Link
            to={`/login?${new URLSearchParams({
              ...(activeTab === 'recruiter' ? { role: 'recruiter' } : {}),
              ...(redirectParam ? { redirect: redirectParam } : {}),
            }).toString()}`}
            className="font-bold text-brand-pink hover:underline"
          >
            Sign In here
          </Link>
        </div>
      </div>
    </div>
  );
};

export default SignUpPage;
