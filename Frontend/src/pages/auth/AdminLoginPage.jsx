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

const adminLoginSchema = z.object({
  email: z
    .string()
    .trim()
    .min(1, { message: 'Administrator email is required' })
    .email({ message: 'Please enter a valid email address' }),
  password: z
    .string()
    .min(1, { message: 'Password is required' }),
  rememberMe: z.boolean().optional(),
});

const AdminLoginPage = () => {
  const [showPassword, setShowPassword] = useState(false);
  const [serverError, setServerError] = useState('');
  const [loading, setLoading] = useState(false);

  const { login, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const {
    register,
    handleSubmit,
    setValue,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(adminLoginSchema),
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

      // Verify backend role permission
      if (!loggedUser || (loggedUser.role !== 'admin' && loggedUser.role !== 'super_admin')) {
        await logout();
        setServerError('Access Denied: This portal is restricted to authorized StageLink Administrators and Super Administrators only.');
        return;
      }

      const returnUrl = location.state?.from;
      const targetPath = returnUrl || '/admin/dashboard';
      navigate(targetPath, { replace: true });
    } catch (err) {
      setServerError(err.message || 'Invalid administrator credentials. Access restricted.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-xl mx-auto px-4 sm:px-6 text-left relative">
      {/* Subtle ambient 3D glow */}
      <div className="absolute -top-16 -left-16 w-64 h-64 bg-slate-900/10 rounded-full blur-3xl pointer-events-none -z-10" />
      <div className="absolute -bottom-16 -right-16 w-64 h-64 bg-brand-pink/10 rounded-full blur-3xl pointer-events-none -z-10" />

      <div className="bg-white rounded-3xl p-6 sm:p-10 shadow-3d-floating border border-slate-200/80 specular-top flex flex-col justify-center relative backdrop-blur-sm">
        {/* Admin Portal Header */}
        <div className="space-y-2 mb-6">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-slate-900 text-white text-[10px] font-bold tracking-wider uppercase shadow-2xs">
            <ShieldCheck className="w-3.5 h-3.5 text-brand-pink" />
            <span>StageLink Administrator Portal</span>
          </div>

          <h2 className="text-2xl sm:text-3xl font-bold font-serif text-brand-navy tracking-tight">
            Admin Sign In
          </h2>
          <p className="text-xs sm:text-sm text-brand-text-secondary leading-relaxed">
            Restricted access portal for authorized StageLink administrators and production directors.
          </p>
        </div>

        {/* Server / Validation Error */}
        {serverError && (
          <div className="mb-4 p-3.5 bg-red-50/90 border border-red-200/90 text-brand-error rounded-2xl text-xs font-medium flex items-center gap-2 shadow-2xs">
            <ShieldAlert className="w-4 h-4 shrink-0" />
            <span>{serverError}</span>
          </div>
        )}

        {/* Admin Login Form */}
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4" noValidate>
          {/* Email Address */}
          <div className="space-y-1.5">
            <label
              htmlFor="admin-email"
              className="block text-xs font-semibold text-brand-navy"
            >
              Administrator Email <span className="text-black font-bold">*</span>
            </label>
            <div className="relative rounded-xl">
              <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                <Mail className="w-4 h-4" />
              </div>
              <input
                id="admin-email"
                type="email"
                autoComplete="email"
                placeholder="admin@stagelink.com"
                className={`w-full pl-10 pr-4 py-2.5 bg-slate-50/60 border rounded-xl text-sm text-brand-navy placeholder-slate-400 focus:outline-none focus:ring-2 focus:bg-white transition-all shadow-inner-bevel ${
                  errors.email
                    ? 'border-brand-error focus:ring-brand-error/20 bg-red-50/10'
                    : 'border-slate-200 hover:border-slate-300 focus:border-slate-900 focus:ring-slate-900/10'
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
              htmlFor="admin-password"
              className="block text-xs font-semibold text-brand-navy"
            >
              Password <span className="text-black font-bold">*</span>
            </label>
            <div className="relative rounded-xl">
              <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                <Lock className="w-4 h-4" />
              </div>
              <input
                id="admin-password"
                type={showPassword ? 'text' : 'password'}
                autoComplete="current-password"
                placeholder="Enter admin password"
                className={`w-full pl-10 pr-11 py-2.5 bg-slate-50/60 border rounded-xl text-sm text-brand-navy placeholder-slate-400 focus:outline-none focus:ring-2 focus:bg-white transition-all shadow-inner-bevel ${
                  errors.password
                    ? 'border-brand-error focus:ring-brand-error/20 bg-red-50/10'
                    : 'border-slate-200 hover:border-slate-300 focus:border-slate-900 focus:ring-slate-900/10'
                }`}
                {...register('password')}
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                aria-label={showPassword ? 'Hide password' : 'Show password'}
                className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-slate-400 hover:text-brand-navy focus:outline-none"
              >
                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
            {errors.password && (
              <p className="text-xs text-brand-error font-medium">• {errors.password.message}</p>
            )}
          </div>

          {/* Security Notice */}
          <div className="p-3 bg-slate-50 border border-slate-200/80 rounded-xl text-[11px] text-slate-600 shadow-2xs">
            🔒 All administrator login attempts are logged and verified against role permissions.
          </div>

          {/* Quick Demo Credentials */}
          <div className="space-y-1.5 pt-1">
            <span className="text-[10px] uppercase font-bold text-slate-400 block tracking-wider">
              Quick Fill Demo Credentials
            </span>
            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => {
                  setValue('email', 'superadmin@stagelink.com');
                  setValue('password', 'StageLink2026!');
                }}
                className="p-2 rounded-xl border border-slate-200 hover:border-black text-left bg-slate-50/60 hover:bg-slate-100/80 transition-all"
              >
                <span className="text-[11px] font-bold text-slate-900 block">Super Admin</span>
                <span className="text-[10px] text-slate-500 font-mono block truncate">superadmin@stagelink.com</span>
              </button>
              <button
                type="button"
                onClick={() => {
                  setValue('email', 'admin@stagelink.com');
                  setValue('password', 'StageLink2026!');
                }}
                className="p-2 rounded-xl border border-slate-200 hover:border-black text-left bg-slate-50/60 hover:bg-slate-100/80 transition-all"
              >
                <span className="text-[11px] font-bold text-slate-900 block">Studio Admin</span>
                <span className="text-[10px] text-slate-500 font-mono block truncate">admin@stagelink.com</span>
              </button>
            </div>
          </div>

          {/* Login Button */}
          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 bg-slate-900 hover:bg-black text-white text-sm font-bold rounded-xl shadow-3d-button hover:shadow-3d-card-hover active:translate-y-0.5 transition-all flex items-center justify-center space-x-2 disabled:opacity-50 mt-2 cursor-pointer specular-top"
          >
            <span>{loading ? 'Authenticating Admin...' : 'Authenticate Administrator'}</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </form>

        {/* Back to Public Login Link */}
        <div className="text-center text-xs text-brand-text-secondary mt-6 pt-4 border-t border-slate-100">
          Not an administrator?{' '}
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

export default AdminLoginPage;
