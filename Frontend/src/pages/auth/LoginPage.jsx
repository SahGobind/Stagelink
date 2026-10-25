import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import {
  Mail,
  Lock,
  Eye,
  EyeOff,
  ArrowRight,
  User,
  Shield,
  Briefcase,
  TrendingUp,
  AlertCircle,
  Building2,
  CheckCircle2,
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

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
  const roleParam = searchParams.get('role');
  const isRegistered = searchParams.get('registered') === 'true';
  const registeredEmail = searchParams.get('email') || '';
  const isRedirectToProfile = redirectParam === '/candidate/profile/setup' || fromPath === '/candidate/profile/setup';
  const isRedirectToAdmin = redirectParam === '/admin/dashboard' || fromPath === '/admin/dashboard';
  const isRedirectToPostJob = redirectParam === '/post-job' || fromPath === '/post-job' || roleParam === 'recruiter';

  // Requirement 1: Only two user types on public login: Candidate / Artist & Recruiter / Production Company
  const [userType, setUserType] = useState(() => {
    if (roleParam === 'recruiter' || isRedirectToPostJob || isRedirectToAdmin) {
      return 'recruiter';
    }
    return 'candidate';
  });

  const {
    register,
    handleSubmit,
    setValue,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: searchParams.get('email') || '',
      password: '',
      rememberMe: false,
    },
  });

  useEffect(() => {
    const emailParam = searchParams.get('email');
    if (emailParam) {
      setValue('email', emailParam);
    }
    const role = searchParams.get('role');
    if (role === 'recruiter') {
      setUserType('recruiter');
    } else if (role === 'candidate') {
      setUserType('candidate');
    }
  }, [location.search, setValue]);

  const onSubmit = async (data) => {
    setServerError('');
    setLoading(true);
    try {
      const loggedUser = await login(data.email, data.password);

      const returnUrl = location.state?.from;
      const redirectQuery = searchParams.get('redirect');
      let targetPath;

      if (returnUrl) {
        const potentialPath = typeof returnUrl === 'string' ? returnUrl : returnUrl.pathname;
        if (potentialPath && potentialPath.startsWith('/admin') && loggedUser?.role === 'candidate') {
          targetPath = '/candidate/dashboard';
        } else if (potentialPath && potentialPath.startsWith('/candidate') && (loggedUser?.role === 'recruiter' || loggedUser?.role === 'admin')) {
          targetPath = '/admin/dashboard';
        } else {
          targetPath = potentialPath;
        }
      } else if (redirectQuery) {
        targetPath = redirectQuery;
      } else if (loggedUser?.role === 'operations') {
        targetPath = '/admin/operations/support';
      } else if (loggedUser?.role === 'admin' || loggedUser?.role === 'recruiter') {
        targetPath = '/admin/dashboard';
      } else if (isRegistered && loggedUser?.role === 'candidate') {
        targetPath = '/candidate/profile/setup';
      } else {
        targetPath = '/candidate/dashboard';
      }

      navigate(targetPath, { replace: true });
    } catch (err) {
      setServerError(err.message || 'Invalid email or password. Please verify your credentials.');
    } finally {
      setLoading(false);
    }
  };

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
      {/* Centered 3D Floating Login Card */}
      <div className="max-w-xl mx-auto bg-white/95 rounded-3xl p-7 sm:p-10 shadow-3d-floating border border-slate-200/90 flex flex-col justify-center text-left relative overflow-hidden specular-top">
        {/* Subtle Ambient Glow */}
        <div className="absolute top-0 right-0 w-48 h-48 bg-brand-pink/5 rounded-full blur-3xl pointer-events-none" />

        {/* User Type Switcher: Only Candidate / Artist & Recruiter / Production Company */}
        <div className="flex p-1.5 bg-slate-100/90 rounded-2xl mb-6 border border-slate-200/70 shadow-inner-bevel">
          <button
            type="button"
            onClick={() => {
              setUserType('candidate');
              setServerError('');
            }}
            className={`flex-1 py-2.5 px-3 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-2 cursor-pointer ${
              userType === 'candidate'
                ? 'bg-white text-neutral-950 shadow-3d-subtle border border-slate-200/80'
                : 'text-slate-500 hover:text-neutral-950'
            }`}
          >
            <User className={`w-4 h-4 ${userType === 'candidate' ? 'text-brand-pink' : ''}`} />
            <span>Candidate / Artist</span>
          </button>
          <button
            type="button"
            onClick={() => {
              setUserType('recruiter');
              setServerError('');
            }}
            className={`flex-1 py-2.5 px-3 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-2 cursor-pointer ${
              userType === 'recruiter'
                ? 'bg-white text-neutral-950 shadow-3d-subtle border border-slate-200/80'
                : 'text-slate-500 hover:text-neutral-950'
            }`}
          >
            <Building2 className={`w-4 h-4 ${userType === 'recruiter' ? 'text-brand-pink' : ''}`} />
            <span>Recruiter / Studio</span>
          </button>
        </div>

        {/* Header */}
        <div className="space-y-1.5 mb-6">
          <h2 className="text-2xl sm:text-3xl font-bold font-serif text-neutral-950 tracking-tight">
            {userType === 'recruiter' ? 'Welcome Back, Studio' : 'Welcome Back'}
          </h2>
          <p className="text-xs sm:text-sm text-slate-500 leading-relaxed font-medium">
            {userType === 'recruiter'
              ? 'Log in to your Studio / Production account to announce casting calls and review talent.'
              : 'Log in to your Candidate account to explore casting calls and track applications.'}
          </p>
        </div>

        {/* Test Your Talent Returning Performer Banner */}
        {isRedirectToProfile && userType === 'candidate' && (
          <div className="mb-5 p-3.5 bg-black text-white rounded-2xl flex items-center gap-3 shadow-xs">
            <div className="w-7 h-7 rounded-lg bg-white/20 flex items-center justify-center font-bold text-xs shrink-0">
              ★
            </div>
            <p className="text-xs text-neutral-300">
              Log in to continue directly to <strong className="text-white">Create / Complete Your Performer Profile</strong>.
            </p>
          </div>
        )}

        {/* Production Returning Studio Banner */}
        {(isRedirectToAdmin || isRedirectToPostJob) && userType === 'recruiter' && (
          <div className="mb-5 p-3.5 bg-black text-white rounded-2xl flex items-center gap-3 shadow-xs">
            <div className="w-7 h-7 rounded-lg bg-white/20 flex items-center justify-center font-bold text-xs shrink-0">
              <Building2 className="w-4 h-4 text-white" />
            </div>
            <p className="text-xs text-neutral-300">
              Log in to access your <strong className="text-white">Studio & Production Dashboard</strong>.
            </p>
          </div>
        )}

        {/* Registration Success Notification Banner */}
        {isRegistered && (
          <div className="mb-5 p-4 bg-emerald-50 border border-emerald-200 text-emerald-950 rounded-2xl flex items-start gap-3 shadow-xs animate-fadeIn">
            <div className="w-8 h-8 rounded-xl bg-emerald-100 flex items-center justify-center shrink-0 text-emerald-700">
              <CheckCircle2 className="w-5 h-5" />
            </div>
            <div className="text-xs space-y-1">
              <p className="font-bold text-sm text-emerald-900">
                Account Registered Successfully!
              </p>
              <p className="text-emerald-800 leading-relaxed">
                Your account for <strong className="text-emerald-950 font-semibold">{registeredEmail || 'your email'}</strong> has been created and securely saved in the database.
              </p>
              <p className="text-emerald-700 font-medium pt-0.5">
                Please enter your password below to log in and proceed.
              </p>
            </div>
          </div>
        )}

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
                autoComplete="email"
                placeholder={
                  userType === 'recruiter'
                    ? 'e.g. casting@production.com'
                    : 'e.g. performer@example.com'
                }
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
                autoComplete="current-password"
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
            className="w-full py-3.5 bg-neutral-950 hover:bg-black text-white text-sm font-bold rounded-xl shadow-3d-button hover:shadow-3d-card-hover active:translate-y-0.5 transition-all flex items-center justify-center space-x-2 disabled:opacity-50 mt-3 cursor-pointer"
          >
            <span>{loading ? 'Signing in...' : userType === 'recruiter' ? 'Sign In as Recruiter' : 'Sign In as Candidate'}</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </form>

        {/* Bottom Sign Up Link */}
        <div className="text-center text-xs text-brand-text-secondary mt-6 pt-4 border-t border-gray-100">
          Don't have an account?{' '}
          <Link
            to={`/signup?role=${userType}${redirectParam ? `&redirect=${encodeURIComponent(redirectParam)}` : ''}`}
            className="font-bold text-brand-pink hover:underline"
          >
            Sign Up as {userType === 'recruiter' ? 'Recruiter' : 'Candidate'}
          </Link>
        </div>
      </div>

      {/* Bottom Section: Why Artists Choose StageLink */}
      <div className="pt-6 pb-4">
        <h3 className="text-2xl sm:text-3xl font-bold font-serif text-brand-navy text-center mb-10">
          Why Artists & Studios Choose StageLink
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
