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
  CheckCircle2,
  ArrowRight,
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { authService } from '../../services/authService';
import { apiRequest } from '../../services/api';
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
      .min(1, { message: 'Business email address is required' })
      .email({ message: 'Please enter a valid business email address' }),
    phoneNumber: z
      .string()
      .trim()
      .optional()
      .refine(
        (val) => !val || /^[0-9+\s\-()]{10,20}$/.test(val),
        { message: 'Phone number format is invalid (include country code)' }
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
  const { register: registerAccount } = useAuth();

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
  const [registrationSuccess, setRegistrationSuccess] = useState(null);

  // Form for candidate
  const candidateForm = useForm({
    resolver: zodResolver(candidateSignUpSchema),
    defaultValues: {
      fullName: '',
      email: '',
      phoneNumber: '',
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
      password: '',
      confirmPassword: '',
      agreeToTerms: false,
    },
  });

  const onCandidateSubmit = async (data) => {
    setServerError('');
    setIsSubmitting(true);
    try {
      await registerAccount({
        fullName: data.fullName,
        email: data.email,
        password: data.password,
        phoneNumber: data.phoneNumber,
        role: 'candidate',
      });
      // Redirect to login page and preserve forward destination
      navigate(
        `/login?role=candidate&email=${encodeURIComponent(data.email)}&registered=true${
          redirectParam ? `&redirect=${encodeURIComponent(redirectParam)}` : '&redirect=/candidate/profile/setup'
        }`,
        { replace: true }
      );
    } catch (err) {
      setServerError(err.message || 'Failed to create performer account. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const onRecruiterSubmit = async (data) => {
    setServerError('');
    setIsSubmitting(true);

    try {
      await registerAccount({
        fullName: data.fullName.trim(),
        companyName: data.companyName.trim(),
        email: data.email.trim().toLowerCase(),
        phoneNumber: data.phoneNumber ? data.phoneNumber.trim() : '',
        country: 'India',
        website: '',
        password: data.password,
        confirmPassword: data.confirmPassword,
        agreeToTerms: true,
        role: 'recruiter',
      });

      // Redirect to login page and preserve forward destination
      navigate(
        `/login?role=recruiter&email=${encodeURIComponent(data.email.trim().toLowerCase())}&registered=true${
          redirectParam ? `&redirect=${encodeURIComponent(redirectParam)}` : '&redirect=/admin/dashboard'
        }`,
        { replace: true }
      );
    } catch (err) {
      setServerError(err.message || 'Failed to create recruiter profile. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto px-4 sm:px-6 text-left">
      <div className="bg-white/95 rounded-3xl p-7 sm:p-10 shadow-3d-floating border border-slate-200/90 space-y-6 relative overflow-hidden specular-top">
        {/* Ambient illumination */}
        <div className="absolute top-0 right-0 w-48 h-48 bg-brand-pink/5 rounded-full blur-3xl pointer-events-none" />

        {registrationSuccess ? (
          <div className="text-center py-4 space-y-6">
            <div className="w-16 h-16 bg-emerald-50 text-emerald-600 rounded-full flex items-center justify-center mx-auto border-4 border-emerald-100 shadow-sm">
              <CheckCircle2 className="w-8 h-8" />
            </div>

            <div className="space-y-2">
              <span className="text-[11px] font-bold uppercase tracking-wider text-emerald-700 bg-emerald-50 px-3 py-1 rounded-full border border-emerald-200">
                Registration Complete
              </span>
              <h2 className="text-2xl sm:text-3xl font-bold font-serif text-brand-navy">
                Account Created Successfully!
              </h2>
              <p className="text-xs sm:text-sm text-brand-text-secondary max-w-md mx-auto">
                Your Casting Director account for <strong className="text-gray-900 font-semibold">{registrationSuccess.companyName}</strong> has been registered in StageLink.
              </p>
            </div>

            <div className="bg-gray-50 rounded-2xl p-4 sm:p-5 text-left border border-gray-200 space-y-2 max-w-md mx-auto text-xs">
              <div className="flex justify-between py-1 border-b border-gray-200/60">
                <span className="text-gray-500">Company Name</span>
                <span className="font-semibold text-gray-900">{registrationSuccess.companyName}</span>
              </div>
              <div className="flex justify-between py-1 border-b border-gray-200/60">
                <span className="text-gray-500">Contact Person</span>
                <span className="font-semibold text-gray-900">{registrationSuccess.fullName}</span>
              </div>
              <div className="flex justify-between py-1">
                <span className="text-gray-500">Login Email</span>
                <span className="font-semibold text-gray-900">{registrationSuccess.email}</span>
              </div>
            </div>

            <div className="pt-2 space-y-3 max-w-md mx-auto">
              <Link
                to={`/login?role=recruiter&email=${encodeURIComponent(registrationSuccess.email)}`}
                className="w-full py-3.5 px-6 bg-brand-pink hover:bg-brand-pink-hover text-white text-sm font-bold rounded-xl shadow-3d-button-pink hover:shadow-3d-pink active:translate-y-0.5 transition-all flex items-center justify-center gap-2"
              >
                <span>Go to Casting Director Login</span>
                <ArrowRight className="w-4 h-4" />
              </Link>

              <div className="flex items-center justify-center gap-4 text-xs text-gray-500 pt-2">
                <button
                  type="button"
                  onClick={() => {
                    setRegistrationSuccess(null);
                    recruiterForm.reset();
                  }}
                  className="hover:underline text-gray-600 font-medium cursor-pointer"
                >
                  Register another account
                </button>
                <span>•</span>
                <Link to="/" className="hover:underline text-gray-600 font-medium">
                  Back to Home
                </Link>
              </div>
            </div>
          </div>
        ) : (
          <>
            {/* Heading */}
            <div className="space-y-1.5 mb-5">
              <div className="flex items-center gap-2">
                <span className="text-[10px] font-bold uppercase tracking-wider text-brand-pink bg-rose-50 px-2.5 py-0.5 rounded-full border border-rose-200/70 shadow-2xs">
                  {activeTab === 'recruiter' ? 'Step 1 of 5 — Casting Director Registration' : 'Candidate Registration'}
                </span>
              </div>
              <h2 className="text-2xl sm:text-3xl font-bold font-serif text-neutral-950 tracking-tight">
                {activeTab === 'recruiter' ? 'Register as Company / Casting Director' : 'Register as Candidate'}
              </h2>
            </div>

            {/* Role Switcher Tabs */}
            <div className="flex p-1.5 bg-slate-100/90 rounded-2xl border border-slate-200/70 shadow-inner-bevel mb-6">
              <button
                type="button"
                onClick={() => {
                  setActiveTab('candidate');
                  setServerError('');
                }}
                className={`flex-1 py-2.5 px-3 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-2 cursor-pointer ${
                  activeTab === 'candidate'
                    ? 'bg-white text-neutral-950 shadow-3d-subtle border border-slate-200/80'
                    : 'text-slate-500 hover:text-neutral-950'
                }`}
              >
                <User className={`w-4 h-4 ${activeTab === 'candidate' ? 'text-brand-pink' : ''}`} />
                <span>Candidate</span>
              </button>
              <button
                type="button"
                onClick={() => {
                  setActiveTab('recruiter');
                  setServerError('');
                }}
                className={`flex-1 py-2.5 px-3 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-2 cursor-pointer ${
                  activeTab === 'recruiter'
                    ? 'bg-white text-neutral-950 shadow-3d-subtle border border-slate-200/80'
                    : 'text-slate-500 hover:text-neutral-950'
                }`}
              >
                <Building2 className={`w-4 h-4 ${activeTab === 'recruiter' ? 'text-brand-pink' : ''}`} />
                <span>Company / Casting Director</span>
              </button>
            </div>


        {/* Server Error Message */}
        {serverError && (
          <div className="p-3 bg-red-50 border border-red-200 text-brand-error rounded-xl text-xs font-medium flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{serverError}</span>
          </div>
        )}

        {/* ================= RECRUITER / CASTING DIRECTOR REGISTRATION FORM ================= */}
        {activeTab === 'recruiter' && (
          <form
            onSubmit={recruiterForm.handleSubmit(onRecruiterSubmit)}
            className="space-y-4"
            noValidate
          >
            {/* Casting Director Full Name */}
            <Input
              label="Casting Director Full Name"
              placeholder="e.g. Marcus Sterling"
              required
              error={recruiterForm.formState.errors.fullName?.message}
              {...recruiterForm.register('fullName')}
            />

            {/* Company / Production Name */}
            <Input
              label="Company / Production Name"
              placeholder="e.g. Apex Vision Studios / Silverline Pictures"
              required
              error={recruiterForm.formState.errors.companyName?.message}
              {...recruiterForm.register('companyName')}
            />

            {/* Business Email & Phone */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <Input
                label="Business Email Address"
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
                  <span>Registering Casting Director Account...</span>
                </>
              ) : (
                <>
                  <Sparkles className="w-4 h-4" />
                  <span>Register as Casting Director</span>
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
              className="w-full py-3.5 bg-neutral-950 hover:bg-black text-white text-xs font-bold uppercase tracking-wider rounded-xl shadow-3d-button hover:shadow-3d-card-hover active:translate-y-0.5 transition-all mt-3 flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
            >
              {isSubmitting ? (
                <span>Creating Candidate Account...</span>
              ) : (
                <>
                  <Sparkles className="w-4 h-4" />
                  <span>Create Candidate Account</span>
                </>
              )}
            </button>
          </form>
        )}
        </>
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
