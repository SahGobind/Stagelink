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
  ArrowRight,
  ShieldCheck,
  AlertCircle,
  ShieldAlert,
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

const opsLoginSchema = z.object({
  email: z
    .string()
    .trim()
    .min(1, { message: 'Operations staff email is required' })
    .email({ message: 'Please enter a valid email address' }),
  password: z
    .string()
    .min(1, { message: 'Password is required' }),
  rememberMe: z.boolean().optional(),
});

const OperationsLoginPage = () => {
  const [showPassword, setShowPassword] = useState(false);
  const [serverError, setServerError] = useState('');
  const [loading, setLoading] = useState(false);

  const { login, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(opsLoginSchema),
    defaultValues: {
      email: '',
      password: '',
      rememberMe: false,
    },
  });

  const onSubmit = async (data) => {
    setServerError('');
    setLoading(true);
    try {
      const loggedUser = await login(data.email, data.password);

      // Verify backend role permission (must be operations staff or system admin)
      if (!loggedUser || (loggedUser.role !== 'operations' && loggedUser.role !== 'admin')) {
        await logout();
        setServerError('Access Denied: This portal is restricted to StageLink Operations Team personnel only.');
        return;
      }

      const returnUrl = location.state?.from;
      const targetPath = returnUrl || '/admin/operations/support';
      navigate(targetPath, { replace: true });
    } catch (err) {
      setServerError(err.message || 'Invalid operations credentials. Access restricted.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-xl mx-auto px-4 sm:px-6 text-left">
      <div className="bg-white rounded-3xl p-6 sm:p-10 shadow-xl border border-gray-100 flex flex-col justify-center">
        {/* Operations Portal Header */}
        <div className="space-y-2 mb-6">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-indigo-950 text-white text-[10px] font-bold tracking-wider uppercase border border-indigo-700/50">
            <ShieldCheck className="w-3.5 h-3.5 text-indigo-400" />
            <span>StageLink Operations Desk Portal</span>
          </div>

          <h2 className="text-2xl sm:text-3xl font-bold font-serif text-brand-navy">
            Operations Team Login
          </h2>
          <p className="text-xs sm:text-sm text-brand-text-secondary leading-relaxed">
            Staff access portal for candidate verification, audition support tickets & platform operations.
          </p>
        </div>

        {/* Server / Validation Error */}
        {serverError && (
          <div className="mb-4 p-3 bg-red-50 border border-red-200 text-brand-error rounded-xl text-xs font-medium flex items-center gap-2">
            <ShieldAlert className="w-4 h-4 shrink-0" />
            <span>{serverError}</span>
          </div>
        )}

        {/* Operations Login Form */}
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4" noValidate>
          {/* Email Address */}
          <div className="space-y-1.5">
            <label
              htmlFor="ops-email"
              className="block text-xs font-semibold text-brand-navy"
            >
              Operations Staff Email <span className="text-black font-bold">*</span>
            </label>
            <div className="relative rounded-xl">
              <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-gray-400">
                <Mail className="w-4 h-4" />
              </div>
              <input
                id="ops-email"
                type="email"
                autoComplete="email"
                placeholder="ops@stagelink.com"
                className={`w-full pl-10 pr-4 py-2.5 bg-white border rounded-xl text-sm text-brand-navy placeholder-gray-400 focus:outline-none focus:ring-2 transition-all ${
                  errors.email
                    ? 'border-brand-error focus:ring-brand-error/20 bg-red-50/10'
                    : 'border-brand-border hover:border-gray-300 focus:border-indigo-600 focus:ring-indigo-600/20'
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
              htmlFor="ops-password"
              className="block text-xs font-semibold text-brand-navy"
            >
              Password <span className="text-black font-bold">*</span>
            </label>
            <div className="relative rounded-xl">
              <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-gray-400">
                <Lock className="w-4 h-4" />
              </div>
              <input
                id="ops-password"
                type={showPassword ? 'text' : 'password'}
                autoComplete="current-password"
                placeholder="Enter staff password"
                className={`w-full pl-10 pr-11 py-2.5 bg-white border rounded-xl text-sm text-brand-navy placeholder-gray-400 focus:outline-none focus:ring-2 transition-all ${
                  errors.password
                    ? 'border-brand-error focus:ring-brand-error/20 bg-red-50/10'
                    : 'border-brand-border hover:border-gray-300 focus:border-indigo-600 focus:ring-indigo-600/20'
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

          {/* Security Notice */}
          <div className="p-3 bg-indigo-50/70 border border-indigo-200/80 rounded-xl text-[11px] text-indigo-950">
            🔒 Operations Desk access is restricted to verified StageLink support staff.
          </div>

          {/* Login Button */}
          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 bg-indigo-900 hover:bg-indigo-950 text-white text-sm font-bold rounded-xl shadow-md hover:shadow-lg transition-all flex items-center justify-center space-x-2 disabled:opacity-50 mt-2 cursor-pointer"
          >
            <span>{loading ? 'Authenticating Staff...' : 'Sign In to Operations Desk'}</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </form>

        {/* Back to Public Login Link */}
        <div className="text-center text-xs text-brand-text-secondary mt-6 pt-4 border-t border-gray-100">
          Not operations staff?{' '}
          <Link
            to="/login"
            className="font-bold text-brand-pink hover:underline"
          >
            Candidate / Recruiter Login →
          </Link>
        </div>
      </div>
    </div>
  );
};

export default OperationsLoginPage;
