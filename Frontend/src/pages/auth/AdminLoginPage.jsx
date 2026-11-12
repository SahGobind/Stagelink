import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Mail, Lock, Eye, EyeOff, AlertCircle } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import LoadingSpinner from '../../components/common/LoadingSpinner';

const adminLoginSchema = z.object({
  email: z
    .string()
    .trim()
    .min(1, { message: 'Email or username is required' }),
  password: z
    .string()
    .min(1, { message: 'Password is required' }),
});

const AdminLoginPage = () => {
  const [showPassword, setShowPassword] = useState(false);
  const [serverError, setServerError] = useState('');
  const [loading, setLoading] = useState(false);

  const { user, isAuthenticated, loading: authLoading, login, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  // If already authenticated as admin, redirect to Admin Dashboard
  useEffect(() => {
    if (!authLoading && isAuthenticated && user) {
      if (user.role === 'admin' || user.role === 'super_admin') {
        const returnUrl = location.state?.from;
        navigate(returnUrl || '/admin/dashboard', { replace: true });
      }
    }
  }, [authLoading, isAuthenticated, user, navigate, location.state]);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(adminLoginSchema),
    defaultValues: {
      email: '',
      password: '',
    },
  });

  const onSubmit = async (data) => {
    setServerError('');
    setLoading(true);
    try {
      const loggedUser = await login(data.email, data.password);

      if (!loggedUser || (loggedUser.role !== 'admin' && loggedUser.role !== 'super_admin')) {
        await logout();
        setServerError('Access Denied: Only administrators can log in here.');
        return;
      }

      const returnUrl = location.state?.from;
      navigate(returnUrl || '/admin/dashboard', { replace: true });
    } catch (err) {
      setServerError(err.message || 'Invalid email or password.');
    } finally {
      setLoading(false);
    }
  };

  if (authLoading) {
    return <LoadingSpinner message="Checking session..." className="min-h-[50vh]" />;
  }

  return (
    <div className="max-w-md mx-auto px-4 py-8">
      <div className="bg-white rounded-2xl p-6 sm:p-8 shadow-xl border border-slate-200">
        {/* Simple Header */}
        <div className="text-center mb-6">
          <div className="w-12 h-12 rounded-2xl bg-[#FA5A36] text-white flex items-center justify-center font-black text-xl mx-auto mb-3 shadow-md shadow-[#FA5A36]/30">
            S
          </div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Admin Login</h1>
          <p className="text-xs text-slate-500 mt-1">
            Sign in to access StageLink admin panel
          </p>
        </div>

        {/* Error Banner */}
        {serverError && (
          <div className="mb-4 p-3 bg-red-50 border border-red-200 text-red-700 rounded-xl text-xs flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0 text-red-600" />
            <span>{serverError}</span>
          </div>
        )}

        {/* Clean Login Form */}
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4" noValidate>
          {/* Email / Username */}
          <div>
            <label htmlFor="admin-email" className="block text-xs font-semibold text-slate-700 mb-1.5">
              Email or Username
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                <Mail className="w-4 h-4" />
              </div>
              <input
                id="admin-email"
                type="text"
                autoComplete="username email"
                placeholder="admin@stagelink.com"
                className={`w-full pl-10 pr-4 py-2.5 bg-slate-50 border rounded-xl text-sm text-slate-900 placeholder-slate-400 focus:outline-none focus:bg-white focus:border-[#FA5A36] focus:ring-1 focus:ring-[#FA5A36] transition-all ${
                  errors.email ? 'border-red-400 bg-red-50/30' : 'border-slate-200 hover:border-slate-300'
                }`}
                {...register('email')}
              />
            </div>
            {errors.email && (
              <p className="text-xs text-red-600 mt-1">{errors.email.message}</p>
            )}
          </div>

          {/* Password */}
          <div>
            <label htmlFor="admin-password" className="block text-xs font-semibold text-slate-700 mb-1.5">
              Password
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                <Lock className="w-4 h-4" />
              </div>
              <input
                id="admin-password"
                type={showPassword ? 'text' : 'password'}
                autoComplete="current-password"
                placeholder="••••••••"
                className={`w-full pl-10 pr-10 py-2.5 bg-slate-50 border rounded-xl text-sm text-slate-900 placeholder-slate-400 focus:outline-none focus:bg-white focus:border-[#FA5A36] focus:ring-1 focus:ring-[#FA5A36] transition-all ${
                  errors.password ? 'border-red-400 bg-red-50/30' : 'border-slate-200 hover:border-slate-300'
                }`}
                {...register('password')}
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                aria-label={showPassword ? 'Hide password' : 'Show password'}
                className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-slate-400 hover:text-slate-700 cursor-pointer"
              >
                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
            {errors.password && (
              <p className="text-xs text-red-600 mt-1">{errors.password.message}</p>
            )}
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            disabled={loading}
            className="w-full py-2.5 bg-[#FA5A36] hover:bg-[#e04825] active:bg-[#c93b1a] text-white font-semibold rounded-xl text-sm transition-colors flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50 mt-2 shadow-sm"
          >
            {loading ? 'Signing in...' : 'Sign In'}
          </button>
        </form>

        {/* Back Link */}
        <div className="text-center mt-5 pt-4 border-t border-slate-100">
          <Link
            to="/login"
            className="text-xs text-slate-500 hover:text-[#FA5A36] transition-colors"
          >
            ← Candidate / Recruiter Login
          </Link>
        </div>
      </div>
    </div>
  );
};

export default AdminLoginPage;
