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
  ShieldCheck,
  ShieldAlert,
  LogOut,
  LayoutDashboard,
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import LoadingSpinner from '../../components/common/LoadingSpinner';

const adminLoginSchema = z.object({
  email: z
    .string()
    .trim()
    .min(1, { message: 'Administrator email or username is required' }),
  password: z
    .string()
    .min(1, { message: 'Password is required' }),
  rememberMe: z.boolean().optional(),
});

const AdminLoginPage = () => {
  const [showPassword, setShowPassword] = useState(false);
  const [serverError, setServerError] = useState('');
  const [loading, setLoading] = useState(false);

  const { user, isAuthenticated, loading: authLoading, login, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  // Rule 9: If an authenticated admin visits /admin/, redirect them to the Admin Dashboard
  useEffect(() => {
    if (!authLoading && isAuthenticated && user) {
      if (user.role === 'admin' || user.role === 'super_admin') {
        const returnUrl = location.state?.from;
        const targetPath = returnUrl || '/admin/dashboard';
        navigate(targetPath, { replace: true });
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
      rememberMe: false,
    },
  });

  const onSubmit = async (data) => {
    setServerError('');
    setLoading(true);
    try {
      // Authenticate credentials against backend MongoDB Atlas
      const loggedUser = await login(data.email, data.password);

      // Verify user's actual role returned by backend
      if (!loggedUser || (loggedUser.role !== 'admin' && loggedUser.role !== 'super_admin')) {
        await logout();
        setServerError('Access Denied: This portal is restricted to authorized StageLink Administrators only.');
        return;
      }

      // Successful admin login: redirect to protected admin dashboard or requested return URL
      const returnUrl = location.state?.from;
      const targetPath = returnUrl || '/admin/dashboard';
      navigate(targetPath, { replace: true });
    } catch (err) {
      setServerError(err.message || 'Invalid administrator credentials. Access restricted.');
    } finally {
      setLoading(false);
    }
  };

  if (authLoading) {
    return <LoadingSpinner message="Verifying administrator clearance..." className="min-h-[50vh]" />;
  }

  // Rule 8: If a candidate, recruiter, or operations user tries to access /admin/, deny access
  const isNonAdminAuthenticated = isAuthenticated && user && user.role !== 'admin' && user.role !== 'super_admin';

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

          <h1 className="text-2xl sm:text-3xl font-bold font-serif text-brand-navy tracking-tight">
            Admin Sign In
          </h1>
          <p className="text-xs sm:text-sm text-brand-text-secondary leading-relaxed">
            Restricted access portal for authorized StageLink administrators and security governance.
          </p>
        </div>

        {/* Rule 8: Explicit Access Denied Screen for Authenticated Non-Admin Users */}
        {isNonAdminAuthenticated ? (
          <div className="p-5 bg-red-50/90 border border-red-200 rounded-2xl space-y-3.5">
            <div className="flex items-center gap-2.5 text-red-700 font-bold text-sm">
              <ShieldAlert className="w-5 h-5 shrink-0 text-red-600" />
              <span>Access Denied: Administrator Clearance Required</span>
            </div>
            <p className="text-xs text-slate-700 leading-relaxed">
              You are currently signed in as <strong className="text-slate-900">{user.fullName || user.email}</strong> with the role of <strong className="text-slate-900 capitalize font-bold">{user.role}</strong>. This administrative portal is strictly restricted to authorized StageLink Administrators.
            </p>
            <div className="pt-2 flex flex-wrap items-center gap-2.5">
              <button
                type="button"
                onClick={async () => {
                  await logout();
                  window.location.reload();
                }}
                className="inline-flex items-center gap-1.5 px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-xl font-bold text-xs shadow-xs transition-colors cursor-pointer"
              >
                <LogOut className="w-3.5 h-3.5" />
                <span>Sign Out &amp; Switch Account</span>
              </button>
              <Link
                to={user.role === 'candidate' ? '/candidate/dashboard' : '/admin/dashboard'}
                className="inline-flex items-center gap-1.5 px-4 py-2 bg-white hover:bg-slate-50 border border-slate-200 text-slate-800 rounded-xl font-semibold text-xs shadow-2xs transition-colors"
              >
                <LayoutDashboard className="w-3.5 h-3.5" />
                <span>Return to your dashboard →</span>
              </Link>
            </div>
          </div>
        ) : (
          <>
            {/* Server / Validation Error */}
            {serverError && (
              <div className="mb-4 p-3.5 bg-red-50/90 border border-red-200/90 text-red-700 rounded-2xl text-xs font-medium flex items-center gap-2 shadow-2xs">
                <ShieldAlert className="w-4 h-4 shrink-0 text-red-600" />
                <span>{serverError}</span>
              </div>
            )}

            {/* Admin Login Form */}
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4" noValidate>
              {/* Email Address / Username */}
              <div className="space-y-1.5">
                <label
                  htmlFor="admin-email"
                  className="block text-xs font-semibold text-brand-navy"
                >
                  Administrator Email or Username <span className="text-black font-bold">*</span>
                </label>
                <div className="relative rounded-xl">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                    <Mail className="w-4 h-4" />
                  </div>
                  <input
                    id="admin-email"
                    type="text"
                    autoComplete="username email"
                    placeholder="admin@stagelink.com or username"
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
                    placeholder="Enter administrator password"
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
                    className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-slate-400 hover:text-brand-navy focus:outline-none cursor-pointer"
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
          </>
        )}

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
