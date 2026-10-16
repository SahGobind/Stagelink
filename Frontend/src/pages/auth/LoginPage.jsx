import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import {
  Mail,
  Lock,
  Eye,
  EyeOff,
  Check,
  ArrowRight,
  User,
  Shield,
  Briefcase,
  TrendingUp,
  AlertCircle,
  Sparkles,
  ShieldAlert,
  Building2,
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import heroActressImg from '../../assets/images/auth_hero_actress.jpg';

const loginSchema = z.object({
  email: z
    .string()
    .trim()
    .min(1, { message: 'Email address is required' })
    .email({ message: 'Please enter a valid email address' }),
  password: z
    .string()
    .min(1, { message: 'Password is required' }),
  rememberMe: z.boolean().optional(),
});

const LoginPage = () => {
  const [showPassword, setShowPassword] = useState(false);
  const [serverError, setServerError] = useState('');
  const [loading, setLoading] = useState(false);

  const { login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const searchParams = new URLSearchParams(location.search);
  const fromState = location.state?.from;
  const fromPath = typeof fromState === 'string' ? fromState : fromState?.pathname;
  const redirectParam = searchParams.get('redirect');
  const isRedirectToProfile = redirectParam === '/candidate/profile/setup' || fromPath === '/candidate/profile/setup';
  const isRedirectToAdmin = redirectParam === '/admin/dashboard' || fromPath === '/admin/dashboard';

  const {
    register,
    handleSubmit,
    setValue,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: isRedirectToAdmin ? 'admin@starcast.com' : 'sarah@starcast.com',
      password: 'password123',
      rememberMe: true,
    },
  });

  const onSubmit = async (data) => {
    setServerError('');
    setLoading(true);
    try {
      const loggedUser = await login(data.email, data.password);

      const returnUrl = location.state?.from;
      const searchParams = new URLSearchParams(location.search);
      const redirectQuery = searchParams.get('redirect');
      let targetPath;
      if (returnUrl) {
        targetPath = typeof returnUrl === 'string' ? returnUrl : returnUrl.pathname;
      } else if (redirectQuery) {
        targetPath = redirectQuery;
      } else {
        targetPath = loggedUser.role === 'admin' ? '/admin/dashboard' : '/candidate/dashboard';
      }

      navigate(targetPath, { replace: true });
    } catch {
      setServerError('Invalid email or password. Please verify your credentials or use the demo buttons.');
    } finally {
      setLoading(false);
    }
  };

  const handleQuickFill = (role) => {
    if (role === 'admin') {
      setValue('email', 'admin@starcast.com', { shouldValidate: true });
      setValue('password', 'password123', { shouldValidate: true });
    } else {
      setValue('email', 'sarah@starcast.com', { shouldValidate: true });
      setValue('password', 'password123', { shouldValidate: true });
    }
  };

  const checklistItems = [
    'Apply to latest casting calls',
    'Manage your applications',
    'Connect with production houses',
    'Update your profile and portfolio',
  ];

  const stats = [
    { value: '5,000+', label: 'Talented Artists' },
    { value: '300+', label: 'Production Houses' },
    { value: '1,000+', label: 'Casting Opportunities' },
    { value: '95%', label: 'Success Stories' },
  ];

  const features = [
    {
      icon: User,
      title: 'Genuine Opportunities',
      desc: 'Verified casting calls from trusted production houses.',
    },
    {
      icon: Shield,
      title: 'Safe & Secure',
      desc: 'Your data and profile are always protected.',
    },
    {
      icon: Briefcase,
      title: 'Easy Application',
      desc: 'Apply to multiple opportunities with just a few clicks.',
    },
    {
      icon: TrendingUp,
      title: 'Grow Your Career',
      desc: 'Get noticed and build long-term relationships in the industry.',
    },
  ];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-16">
      {/* Main Top Section: Hero Banner + Login Card */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-stretch">
        
        {/* Left Column: Glamour Actress Hero & Metrics */}
        <div className="lg:col-span-7 flex flex-col justify-between rounded-3xl overflow-hidden shadow-2xl relative bg-black min-h-[560px] lg:min-h-[660px]">
          {/* Background Actress Image in Cinematic Black and White */}
          <img
            src={heroActressImg}
            alt="StarCast Glamour Artist"
            className="absolute inset-0 w-full h-full object-cover object-top opacity-90 grayscale contrast-110"
          />

          {/* Cinematic Gradient Overlays */}
          <div className="absolute inset-0 bg-gradient-to-t from-black via-black/55 to-black/30 pointer-events-none" />
          <div className="absolute inset-0 bg-gradient-to-r from-black/85 via-black/45 to-transparent pointer-events-none" />

          {/* Top/Middle Hero Content */}
          <div className="relative z-10 p-8 sm:p-12 lg:p-14 space-y-6 max-w-xl text-left">
            <div>
              <span className="text-[11px] sm:text-xs font-bold tracking-[0.2em] uppercase text-gray-300">
                WELCOME BACK TO
              </span>
              <h1 className="text-3xl sm:text-4xl lg:text-5xl font-black font-serif text-white tracking-tight mt-1">
                Star<span className="text-gray-400 italic">Cast</span>
              </h1>
              <h2 className="text-2xl sm:text-3xl font-serif text-white font-medium mt-1">
                Your Next Opportunity <br className="hidden sm:inline" />
                Is Here
              </h2>
            </div>

            <p className="text-xs sm:text-sm text-gray-200/90 leading-relaxed max-w-md">
              Log in to your StarCast account and continue your journey towards exciting casting opportunities, collaborations and success.
            </p>

            {/* Checklist with monochrome circular badges */}
            <div className="space-y-3 pt-2">
              {checklistItems.map((item, idx) => (
                <div key={idx} className="flex items-center space-x-3">
                  <span className="w-5 h-5 rounded-full bg-white flex items-center justify-center text-black shrink-0 shadow-sm">
                    <Check className="w-3 h-3 stroke-[3]" />
                  </span>
                  <span className="text-xs sm:text-sm font-medium text-white/95">
                    {item}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Bottom Stats Counter Strip */}
          <div className="relative z-10 bg-black/75 backdrop-blur-md border-t border-white/10 px-6 py-5 sm:px-8">
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-left">
              {stats.map((stat, idx) => (
                <div
                  key={idx}
                  className={`${
                    idx > 0 ? 'sm:border-l sm:border-white/10 sm:pl-4' : ''
                  }`}
                >
                  <p className="text-lg sm:text-xl font-bold font-serif text-white tracking-tight">
                    {stat.value}
                  </p>
                  <p className="text-[10px] sm:text-xs text-gray-300">
                    {stat.label}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Right Column: Clean White Login Card */}
        <div className="lg:col-span-5 bg-white rounded-3xl p-6 sm:p-10 shadow-xl border border-gray-100 flex flex-col justify-center text-left">
          {/* Header */}
          <div className="space-y-1 mb-6">
            <h2 className="text-2xl sm:text-3xl font-bold font-serif text-brand-navy">
              Welcome Back
            </h2>
            <p className="text-xs sm:text-sm text-brand-text-secondary leading-relaxed">
              Log in to your StarCast account and continue your acting journey.
            </p>
          </div>

          {/* Test Your Talent Returning Performer Banner */}
          {isRedirectToProfile && (
            <div className="mb-5 p-3.5 bg-black text-white rounded-2xl flex items-center gap-3 shadow-xs">
              <div className="w-7 h-7 rounded-lg bg-white/20 flex items-center justify-center font-bold text-xs shrink-0">
                ★
              </div>
              <p className="text-xs text-neutral-300">
                Log in to continue directly to <strong className="text-white">Create / Complete Your Performer Profile</strong> and submit auditions.
              </p>
            </div>
          )}

          {/* Production Returning Studio Banner */}
          {isRedirectToAdmin && (
            <div className="mb-5 p-3.5 bg-black text-white rounded-2xl flex items-center gap-3 shadow-xs">
              <div className="w-7 h-7 rounded-lg bg-white/20 flex items-center justify-center font-bold text-xs shrink-0">
                <Building2 className="w-4 h-4 text-white" />
              </div>
              <p className="text-xs text-neutral-300">
                Log in to access your <strong className="text-white">Studio & Production Dashboard</strong>, post casting calls, and review talent.
              </p>
            </div>
          )}

          {/* Frontend Demo Mode Security Notice */}
          <div className="mb-4 p-3 bg-amber-50/80 border border-amber-200/80 rounded-2xl flex items-start gap-2.5 text-amber-900 text-[11px] leading-relaxed">
            <ShieldAlert className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
            <p>
              <strong className="font-bold">Frontend Demo Mode:</strong> Passwords are not persisted in plaintext. Real authentication, hashing, email verification, and session tokens require backend implementation.
            </p>
          </div>

          {/* Server / Validation Error */}
          {serverError && (
            <div className="mb-4 p-3 bg-red-50 border border-red-200 text-brand-error rounded-xl text-xs font-medium flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{serverError}</span>
            </div>
          )}

          {/* Login Form */}
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4" noValidate>
            {/* Email Address */}
            <div className="space-y-1.5">
              <label
                htmlFor="login-email"
                className="block text-xs font-semibold text-brand-navy"
              >
                Email Address <span className="text-black font-bold">*</span>
              </label>
              <div className="relative rounded-xl">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-gray-400">
                  <Mail className="w-4 h-4" />
                </div>
                <input
                  id="login-email"
                  type="email"
                  placeholder="Enter your email address"
                  className={`w-full pl-10 pr-4 py-2.5 bg-white border rounded-xl text-sm text-brand-navy placeholder-gray-400 focus:outline-none focus:ring-2 transition-all ${
                    errors.email
                      ? 'border-brand-error focus:ring-brand-error/20 bg-red-50/10'
                      : 'border-brand-border hover:border-gray-300 focus:border-black focus:ring-black/20'
                  }`}
                  {...register('email')}
                />
              </div>
              {errors.email && (
                <p className="text-xs text-brand-error font-medium">• {errors.email.message}</p>
              )}
            </div>

            {/* Password */}
            <div className="space-y-1.5">
              <label
                htmlFor="login-password"
                className="block text-xs font-semibold text-brand-navy"
              >
                Password <span className="text-black font-bold">*</span>
              </label>
              <div className="relative rounded-xl">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-gray-400">
                  <Lock className="w-4 h-4" />
                </div>
                <input
                  id="login-password"
                  type={showPassword ? 'text' : 'password'}
                  placeholder="Enter your password"
                  className={`w-full pl-10 pr-11 py-2.5 bg-white border rounded-xl text-sm text-brand-navy placeholder-gray-400 focus:outline-none focus:ring-2 transition-all ${
                    errors.password
                      ? 'border-brand-error focus:ring-brand-error/20 bg-red-50/10'
                      : 'border-brand-border hover:border-gray-300 focus:border-black focus:ring-black/20'
                  }`}
                  {...register('password')}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  aria-label={showPassword ? 'Hide password' : 'Show password'}
                  className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-gray-400 hover:text-brand-navy focus:outline-none"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
              {errors.password && (
                <p className="text-xs text-brand-error font-medium">• {errors.password.message}</p>
              )}
            </div>

            {/* Keep me signed in & Forgot Password Row */}
            <div className="flex items-center justify-between pt-1">
              <label className="flex items-center space-x-2 cursor-pointer select-none">
                <input
                  type="checkbox"
                  className="w-4 h-4 rounded border-gray-300 text-black focus:ring-black accent-black cursor-pointer"
                  {...register('rememberMe')}
                />
                <span className="text-xs text-gray-600">Keep me signed in</span>
              </label>

              <Link
                to="/forgot-password"
                className="text-xs font-medium text-black hover:underline"
              >
                Forgot Password?
              </Link>
            </div>

            {/* Login Button */}
            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 bg-black hover:bg-neutral-800 text-white text-sm font-bold rounded-xl shadow-md hover:shadow-lg transition-all flex items-center justify-center space-x-2 disabled:opacity-50 mt-2"
            >
              <span>{loading ? 'Logging in...' : 'Login'}</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </form>

          {/* Social Divider */}
          <div className="relative my-6">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-gray-200" />
            </div>
            <div className="relative flex justify-center text-xs">
              <span className="bg-white px-3 text-gray-500 font-medium">
                or continue with
              </span>
            </div>
          </div>

          {/* Social Login Buttons */}
          <div className="space-y-2.5">
            {/* Google */}
            <button
              type="button"
              onClick={() => handleQuickFill('candidate')}
              className="w-full flex items-center justify-center gap-3 py-2.5 px-4 border border-gray-200 rounded-xl text-xs font-semibold text-brand-navy hover:bg-gray-50 transition-colors"
            >
              <svg className="w-4 h-4" viewBox="0 0 24 24">
                <path
                  fill="#4285F4"
                  d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                />
                <path
                  fill="#34A853"
                  d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                />
                <path
                  fill="#FBBC05"
                  d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
                />
                <path
                  fill="#EA4335"
                  d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
                />
              </svg>
              <span>Continue with Google</span>
            </button>

            {/* Apple */}
            <button
              type="button"
              onClick={() => handleQuickFill('admin')}
              className="w-full flex items-center justify-center gap-3 py-2.5 px-4 border border-gray-200 rounded-xl text-xs font-semibold text-brand-navy hover:bg-gray-50 transition-colors"
            >
              <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24">
                <path d="M18.71 19.5c-.83 1.24-1.71 2.45-3.05 2.47-1.34.03-1.77-.79-3.29-.79-1.53 0-2 .77-3.27.82-1.31.05-2.3-1.32-3.14-2.53C4.25 17 2.94 12.45 4.7 9.39c.87-1.52 2.43-2.48 4.12-2.51 1.28-.02 2.5.87 3.29.87.78 0 2.26-1.07 3.81-.91.65.03 2.47.26 3.64 1.98-.09.06-2.17 1.28-2.15 3.81.03 3.02 2.65 4.03 2.68 4.04-.03.07-.42 1.44-1.38 2.83M15.97 6.84c.62-.75 1.04-1.8 1.01-2.84-.89.04-2 .6-2.64 1.34-.56.65-1.06 1.7-0.93 2.73.99.08 2-.48 2.56-1.23z" />
              </svg>
              <span>Continue with Apple</span>
            </button>

            {/* Facebook */}
            <button
              type="button"
              onClick={() => handleQuickFill('candidate')}
              className="w-full flex items-center justify-center gap-3 py-2.5 px-4 border border-gray-200 rounded-xl text-xs font-semibold text-brand-navy hover:bg-gray-50 transition-colors"
            >
              <svg className="w-4 h-4 fill-[#1877F2]" viewBox="0 0 24 24">
                <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
              </svg>
              <span>Continue with Facebook</span>
            </button>
          </div>

          {/* Quick Demo Fill Helper */}
          <div className="mt-4 pt-4 border-t border-dashed border-gray-200 flex items-center justify-between text-[11px] text-gray-500">
            <span className="flex items-center gap-1 font-semibold text-gray-800">
              <Sparkles className="w-3 h-3 text-black" /> Quick Fill:
            </span>
            <div className="flex gap-2">
              <button
                type="button"
                onClick={() => handleQuickFill('candidate')}
                className="px-2.5 py-0.5 rounded-lg bg-neutral-100 text-black hover:bg-neutral-200 font-medium transition-colors"
              >
                Candidate
              </button>
              <button
                type="button"
                onClick={() => handleQuickFill('admin')}
                className="px-2.5 py-0.5 rounded-lg bg-neutral-100 text-black hover:bg-neutral-200 font-medium transition-colors"
              >
                Admin
              </button>
            </div>
          </div>

          {/* Bottom Sign Up Link */}
          <div className="text-center text-xs text-brand-text-secondary mt-5">
            Don't have an account?{' '}
            <Link
              to={`/signup${isRedirectToProfile ? '?redirect=/candidate/profile/setup' : ''}`}
              className="font-bold text-black hover:underline"
            >
              Sign Up
            </Link>
          </div>
        </div>
      </div>

      {/* Bottom Section: Why Artists Choose StarCast */}
      <div className="pt-6 pb-4">
        <h3 className="text-2xl sm:text-3xl font-bold font-serif text-brand-navy text-center mb-10">
          Why Artists Choose StarCast
        </h3>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 text-center">
          {features.map((feat, idx) => {
            const Icon = feat.icon;
            return (
              <div
                key={idx}
                className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm hover:shadow-md transition-shadow flex flex-col items-center"
              >
                <div className="w-12 h-12 rounded-full bg-neutral-100 flex items-center justify-center text-black mb-4">
                  <Icon className="w-6 h-6" />
                </div>
                <h4 className="text-sm font-bold text-brand-navy mb-1.5 font-serif">
                  {feat.title}
                </h4>
                <p className="text-xs text-brand-text-secondary leading-relaxed">
                  {feat.desc}
                </p>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default LoginPage;
