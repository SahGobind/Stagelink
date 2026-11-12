import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import {
  Headphones,
  Shield,
  ShieldAlert,
  Lock,
  Mail,
  ArrowRight,
  AlertCircle,
  CheckCircle2,
  Users,
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

const SupportLoginPage = () => {
  const { login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const from = location.state?.from?.pathname || '/support/dashboard';

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const loggedUser = await login(email.trim(), password);
      const role = loggedUser?.role;

      // Verify support or admin role
      if (
        role === 'support_agent' ||
        role === 'support_lead' ||
        role === 'super_admin' ||
        role === 'admin' ||
        role === 'operations'
      ) {
        navigate(from, { replace: true });
      } else {
        setError('Access Denied: This portal is strictly restricted to StageLink Support Personnel.');
      }
    } catch (err) {
      setError(err?.message || 'Authentication failed. Please verify your credentials.');
    } finally {
      setLoading(false);
    }
  };

  const fillQuickCredentials = (demoEmail, demoPassword) => {
    setEmail(demoEmail);
    setPassword(demoPassword);
    setError('');
  };

  return (
    <div className="min-h-screen bg-slate-950 flex flex-col justify-center py-12 sm:px-6 lg:px-8 relative overflow-hidden">
      {/* Background Glows */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-[600px] h-[300px] bg-amber-500/10 blur-[120px] rounded-full pointer-events-none" />
      <div className="absolute bottom-10 left-10 w-[300px] h-[200px] bg-purple-500/10 blur-[90px] rounded-full pointer-events-none" />

      <div className="sm:mx-auto sm:w-full sm:max-w-md relative z-10">
        <div className="flex justify-center">
          <div className="w-14 h-14 rounded-2xl bg-gradient-to-tr from-amber-600 to-amber-500 flex items-center justify-center text-white shadow-xl shadow-amber-500/25">
            <Headphones className="w-7 h-7" />
          </div>
        </div>
        <h2 className="mt-6 text-center text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
          Support Management Portal
        </h2>
        <p className="mt-2 text-center text-xs sm:text-sm text-slate-400">
          Principle of Least Privilege (PoLP) Protected Resolution Center
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md relative z-10 px-4 sm:px-0">
        <div className="bg-slate-900 border border-slate-800 py-8 px-6 shadow-2xl rounded-2xl sm:px-10">
          {error && (
            <div className="mb-6 p-3.5 rounded-xl bg-red-500/10 border border-red-500/20 flex items-start gap-3 text-red-400 text-xs sm:text-sm">
              <AlertCircle className="w-5 h-5 shrink-0 text-red-400 mt-0.5" />
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-300 mb-1.5">
                Support Identity (Email)
              </label>
              <div className="relative">
                <Mail className="w-4 h-4 text-slate-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="agent@stagelink.com"
                  className="w-full pl-10 pr-4 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-sm text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500 transition"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-300 mb-1.5">
                Security Password
              </label>
              <div className="relative">
                <Lock className="w-4 h-4 text-slate-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••••••"
                  className="w-full pl-10 pr-4 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-sm text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500 transition"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 px-4 rounded-xl font-bold text-sm text-slate-950 bg-amber-500 hover:bg-amber-400 focus:outline-none focus:ring-2 focus:ring-amber-500/50 shadow-lg shadow-amber-500/20 transition flex items-center justify-center gap-2 disabled:opacity-50"
            >
              {loading ? (
                <span>Authenticating Credentials...</span>
              ) : (
                <>
                  <span>Sign In to Support Center</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </form>

          {/* Quick Demo Login Credentials */}
          <div className="mt-8 pt-6 border-t border-slate-800">
            <p className="text-[11px] font-bold uppercase tracking-wider text-slate-400 mb-3 text-center">
              Quick Role Demonstration Access
            </p>
            <div className="grid grid-cols-2 gap-2.5">
              <button
                type="button"
                onClick={() => fillQuickCredentials('agent@stagelink.com', 'Admin@123')}
                className="p-2.5 rounded-xl border border-sky-500/30 bg-sky-500/5 hover:bg-sky-500/10 text-left transition flex flex-col"
              >
                <div className="flex items-center gap-1.5 text-sky-400 text-xs font-bold">
                  <Shield className="w-3.5 h-3.5" />
                  <span>Agent (Level 1)</span>
                </div>
                <span className="text-[11px] text-slate-400 mt-0.5 truncate">agent@stagelink.com</span>
              </button>

              <button
                type="button"
                onClick={() => fillQuickCredentials('lead@stagelink.com', 'Admin@123')}
                className="p-2.5 rounded-xl border border-purple-500/30 bg-purple-500/5 hover:bg-purple-500/10 text-left transition flex flex-col"
              >
                <div className="flex items-center gap-1.5 text-purple-400 text-xs font-bold">
                  <ShieldAlert className="w-3.5 h-3.5" />
                  <span>Lead (Level 2)</span>
                </div>
                <span className="text-[11px] text-slate-400 mt-0.5 truncate">lead@stagelink.com</span>
              </button>
            </div>
          </div>

          {/* Principle of Least Privilege Notice */}
          <div className="mt-6 p-3 rounded-xl bg-slate-950/80 border border-slate-800/80 text-[11px] text-slate-400 leading-relaxed">
            <div className="flex items-center gap-1.5 text-slate-300 font-semibold mb-1">
              <Lock className="w-3 h-3 text-amber-500" />
              <span>PoLP Security Policy</span>
            </div>
            Support accounts are granted only permissions necessary for resolution. Support agents cannot access Super Admin settings, database credentials, or issue financial refunds.
          </div>
        </div>
      </div>
    </div>
  );
};

export default SupportLoginPage;

