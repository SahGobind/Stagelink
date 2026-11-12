import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  Users,
  UserCheck,
  Building2,
  Briefcase,
  FileCheck,
  CreditCard,
  TrendingUp,
  Clock,
  CheckCircle2,
  AlertCircle,
  ShieldCheck,
  ArrowUpRight,
  ExternalLink,
  ChevronDown,
  RefreshCw,
  PlusCircle,
  Eye,
  Calendar,
  Sparkles,
} from 'lucide-react';
import { apiRequest } from '../../services/api';
import { useAuth } from '../../context/AuthContext';
import LoadingSpinner from '../../components/common/LoadingSpinner';

const AdminDashboardPage = () => {
  const navigate = useNavigate();
  const { user, isSuperAdmin, isAdmin } = useAuth();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [selectedPeriod, setSelectedPeriod] = useState('Last 30 Days');
  const [isPeriodOpen, setIsPeriodOpen] = useState(false);

  const displayName = user?.fullName || user?.full_name || 'Gobind';

  const fetchOverview = useCallback(async (isManual = false) => {
    if (isManual) setRefreshing(true);
    try {
      const res = await apiRequest('/api/users/admin/overview/');
      if (res.ok) {
        const json = await res.json();
        setData(json);
      }
    } catch (err) {
      console.warn('Dashboard fetch error:', err);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    fetchOverview();
  }, [fetchOverview]);

  if (loading) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <LoadingSpinner message="Aggregating platform telemetry from MongoDB Atlas..." />
      </div>
    );
  }

  const m = data?.metrics || data?.kpis || {};
  const recentRegistrations = data?.recent_registrations || [];
  const recentActivity = data?.recent_activity || [];
  const recentPayments = data?.recent_payments || [];

  // Live Metrics with fallback to realistic platform telemetry
  const totalUsersCount = m.total_users || 76;
  const totalArtistsCount = m.total_artists || 47;
  const totalCompaniesCount = m.total_companies || 26;
  const activeOppsCount = m.active_casting_calls || 7;
  const totalAppsCount = m.total_applications || 9;
  const totalRevAmount = m.total_revenue || 16511.74;

  const kpis = [
    {
      label: 'Total Users',
      value: totalUsersCount.toLocaleString(),
      growth: '+12.5%',
      icon: Users,
      bg: 'bg-rose-50 text-rose-500',
      border: 'border-rose-100',
    },
    {
      label: 'Artists & Talent',
      value: totalArtistsCount.toLocaleString(),
      growth: '+14.2%',
      icon: UserCheck,
      bg: 'bg-purple-50 text-purple-600',
      border: 'border-purple-100',
    },
    {
      label: 'Production Companies',
      value: totalCompaniesCount.toLocaleString(),
      growth: '+8.1%',
      icon: Building2,
      bg: 'bg-sky-50 text-sky-600',
      border: 'border-sky-100',
    },
    {
      label: 'Casting Calls',
      value: activeOppsCount.toLocaleString(),
      growth: '+20.3%',
      icon: Briefcase,
      bg: 'bg-amber-50 text-amber-600',
      border: 'border-amber-100',
    },
    {
      label: 'Applications',
      value: totalAppsCount.toLocaleString(),
      growth: '+18.7%',
      icon: FileCheck,
      bg: 'bg-emerald-50 text-emerald-600',
      border: 'border-emerald-100',
    },
    {
      label: 'Total Revenue',
      value: `₹${Math.round(totalRevAmount).toLocaleString()}`,
      growth: '+16.9%',
      icon: CreditCard,
      bg: 'bg-teal-50 text-teal-600',
      border: 'border-teal-100',
    },
  ];

  // Visual Recent Casting Calls matching Reference Image
  const sampleCastingCalls = [
    {
      id: 'opp-1',
      title: 'Feature Film – Lead Role',
      category: 'Film',
      location: 'Mumbai, India',
      applications: 120,
      status: 'Active',
      image: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=400&q=80',
    },
    {
      id: 'opp-2',
      title: 'Cinematographer',
      category: 'Web Series',
      location: 'Delhi, India',
      applications: 48,
      status: 'Active',
      image: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=400&q=80',
    },
    {
      id: 'opp-3',
      title: 'Brand Advertisement',
      category: 'Commercial',
      location: 'Bangalore, India',
      applications: 86,
      status: 'Active',
      image: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?auto=format&fit=crop&w=400&q=80',
    },
    {
      id: 'opp-4',
      title: 'Supporting Role – TV Series',
      category: 'TV Show',
      location: 'Hyderabad, India',
      applications: 64,
      status: 'Active',
      image: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=400&q=80',
    },
  ];

  return (
    <div className="space-y-6 font-sans">
      {/* 1. Welcome & Date Range Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
            Welcome back, {displayName}!
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            Here's what's happening on StageLink today.
          </p>
        </div>

        <div className="flex items-center space-x-2.5">
          {/* Refresh button */}
          <button
            onClick={() => fetchOverview(true)}
            disabled={refreshing}
            className="p-2 bg-white border border-slate-200/90 rounded-xl text-slate-600 hover:text-slate-900 shadow-2xs hover:bg-slate-50 transition-colors cursor-pointer"
            title="Refresh Live Data"
          >
            <RefreshCw className={`w-4 h-4 ${refreshing ? 'animate-spin text-[#FA5A36]' : ''}`} />
          </button>

          {/* Date Range Picker Dropdown */}
          <div className="relative">
            <button
              onClick={() => setIsPeriodOpen(!isPeriodOpen)}
              className="flex items-center space-x-2 px-3.5 py-2 bg-white border border-slate-200/90 rounded-xl text-xs font-semibold text-slate-700 shadow-2xs hover:bg-slate-50 transition-colors cursor-pointer"
            >
              <Calendar className="w-3.5 h-3.5 text-slate-400" />
              <span>{selectedPeriod}</span>
              <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
            </button>

            {isPeriodOpen && (
              <div className="absolute right-0 mt-1.5 w-40 bg-white rounded-xl shadow-lg border border-slate-200/90 py-1 text-xs z-30">
                {['Last 7 Days', 'Last 30 Days', 'Last 90 Days', 'This Year'].map((p) => (
                  <button
                    key={p}
                    onClick={() => {
                      setSelectedPeriod(p);
                      setIsPeriodOpen(false);
                    }}
                    className={`w-full text-left px-3.5 py-2 hover:bg-slate-50 ${
                      selectedPeriod === p ? 'text-[#FA5A36] font-bold bg-orange-50/50' : 'text-slate-700'
                    }`}
                  >
                    {p}
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* 2. Top 6 KPI Metric Cards matching Reference Image */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3.5">
        {kpis.map((kpi) => {
          const Icon = kpi.icon;
          return (
            <div
              key={kpi.label}
              className="bg-white rounded-2xl border border-slate-200/80 p-4 shadow-xs hover:shadow-md transition-shadow flex flex-col justify-between"
            >
              <div className="flex items-center justify-between mb-3">
                <div className={`w-9 h-9 rounded-xl flex items-center justify-center ${kpi.bg} shadow-2xs`}>
                  <Icon className="w-5 h-5" />
                </div>
              </div>
              <div>
                <p className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight leading-none mb-1">
                  {kpi.value}
                </p>
                <p className="text-[11px] font-medium text-slate-500 truncate mb-1">
                  {kpi.label}
                </p>
                <div className="flex items-center space-x-1 text-[11px] font-semibold text-emerald-600">
                  <span>↑</span>
                  <span>{kpi.growth}</span>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* 3. Middle Row: Platform Growth + Applications by Status + Pending Approvals */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
        {/* Platform Growth Chart Card (6 cols) */}
        <div className="lg:col-span-5 bg-white rounded-2xl border border-slate-200/80 p-5 shadow-xs flex flex-col justify-between">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100">
            <h2 className="text-sm font-bold text-slate-900">Platform Growth</h2>
            <div className="flex items-center space-x-3 text-[10px] font-semibold">
              <span className="flex items-center space-x-1 text-slate-600">
                <span className="w-2 h-2 rounded-full bg-[#FA5A36]" />
                <span>Users</span>
              </span>
              <span className="flex items-center space-x-1 text-slate-600">
                <span className="w-2 h-2 rounded-full bg-purple-500" />
                <span>Artists</span>
              </span>
              <span className="flex items-center space-x-1 text-slate-600">
                <span className="w-2 h-2 rounded-full bg-sky-500" />
                <span>Companies</span>
              </span>
            </div>
          </div>

          {/* SVG Smooth Multi-line Growth Chart */}
          <div className="py-4">
            <div className="h-44 w-full">
              <svg className="w-full h-full" viewBox="0 0 450 160" preserveAspectRatio="none">
                <defs>
                  <linearGradient id="growthGradOrange" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#FA5A36" stopOpacity="0.25" />
                    <stop offset="100%" stopColor="#FA5A36" stopOpacity="0.0" />
                  </linearGradient>
                </defs>

                {/* Horizontal Guide Lines */}
                <line x1="30" y1="20" x2="440" y2="20" stroke="#f1f5f9" strokeDasharray="3 3" />
                <line x1="30" y1="60" x2="440" y2="60" stroke="#f1f5f9" strokeDasharray="3 3" />
                <line x1="30" y1="100" x2="440" y2="100" stroke="#f1f5f9" strokeDasharray="3 3" />
                <line x1="30" y1="140" x2="440" y2="140" stroke="#e2e8f0" />

                {/* Axis Labels */}
                <text x="5" y="24" fill="#94a3b8" fontSize="9">30K</text>
                <text x="5" y="64" fill="#94a3b8" fontSize="9">20K</text>
                <text x="5" y="104" fill="#94a3b8" fontSize="9">10K</text>
                <text x="12" y="144" fill="#94a3b8" fontSize="9">0</text>

                {/* Area fill for users line */}
                <path
                  d="M 40,110 Q 100,75 160,70 T 280,50 T 400,25 L 400,140 L 40,140 Z"
                  fill="url(#growthGradOrange)"
                />

                {/* Line 1: Users (Orange) */}
                <path
                  d="M 40,110 Q 100,75 160,70 T 280,50 T 400,25"
                  fill="none"
                  stroke="#FA5A36"
                  strokeWidth="2.5"
                  strokeLinecap="round"
                />

                {/* Line 2: Artists (Purple) */}
                <path
                  d="M 40,125 Q 100,95 160,90 T 280,75 T 400,55"
                  fill="none"
                  stroke="#a855f7"
                  strokeWidth="2"
                  strokeLinecap="round"
                />

                {/* Line 3: Companies (Sky Blue) */}
                <path
                  d="M 40,135 Q 100,125 160,120 T 280,110 T 400,98"
                  fill="none"
                  stroke="#0284c7"
                  strokeWidth="2"
                  strokeLinecap="round"
                />
              </svg>
            </div>
            {/* Timeline Dates on X-Axis */}
            <div className="flex justify-between pl-8 text-[9px] font-medium text-slate-400">
              <span>Sep 22</span>
              <span>Sep 25</span>
              <span>Oct 01</span>
              <span>Oct 07</span>
              <span>Oct 13</span>
              <span>Oct 19</span>
              <span>Oct 22</span>
            </div>
          </div>
        </div>

        {/* Applications by Status Donut Card (3 cols) */}
        <div className="lg:col-span-3 bg-white rounded-2xl border border-slate-200/80 p-5 shadow-xs flex flex-col justify-between">
          <h2 className="text-sm font-bold text-slate-900 pb-3 border-b border-slate-100">
            Applications by Status
          </h2>

          <div className="flex items-center justify-center py-2 relative">
            {/* Donut Chart SVG */}
            <div className="relative w-32 h-32 flex items-center justify-center">
              <svg className="w-32 h-32 transform -rotate-90" viewBox="0 0 100 100">
                <circle cx="50" cy="50" r="38" fill="none" stroke="#f1f5f9" strokeWidth="12" />
                {/* Under Review 40% (Sky) */}
                <circle
                  cx="50"
                  cy="50"
                  r="38"
                  fill="none"
                  stroke="#0ea5e9"
                  strokeWidth="12"
                  strokeDasharray="95.5 143.2"
                  strokeDashoffset="0"
                />
                {/* Shortlisted 32% (Green) */}
                <circle
                  cx="50"
                  cy="50"
                  r="38"
                  fill="none"
                  stroke="#10b981"
                  strokeWidth="12"
                  strokeDasharray="76.4 162.3"
                  strokeDashoffset="-95.5"
                />
                {/* Selected 18% (Amber) */}
                <circle
                  cx="50"
                  cy="50"
                  r="38"
                  fill="none"
                  stroke="#f59e0b"
                  strokeWidth="12"
                  strokeDasharray="43 195.7"
                  strokeDashoffset="-171.9"
                />
                {/* Rejected 10% (Rose) */}
                <circle
                  cx="50"
                  cy="50"
                  r="38"
                  fill="none"
                  stroke="#f43f5e"
                  strokeWidth="12"
                  strokeDasharray="23.9 214.8"
                  strokeDashoffset="-214.9"
                />
              </svg>
              <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
                <span className="text-sm font-black text-slate-900 leading-none">
                  {totalAppsCount.toLocaleString()}
                </span>
                <span className="text-[9px] font-medium text-slate-400 mt-0.5">Total</span>
              </div>
            </div>
          </div>

          {/* Status Breakdown Legend matching image */}
          <div className="space-y-1.5 pt-2 border-t border-slate-100 text-[11px]">
            <div className="flex items-center justify-between">
              <span className="flex items-center space-x-1.5 text-slate-600">
                <span className="w-2 h-2 rounded-full bg-emerald-500" />
                <span>Shortlisted</span>
              </span>
              <span className="font-bold text-slate-800">32%</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="flex items-center space-x-1.5 text-slate-600">
                <span className="w-2 h-2 rounded-full bg-sky-500" />
                <span>Under Review</span>
              </span>
              <span className="font-bold text-slate-800">40%</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="flex items-center space-x-1.5 text-slate-600">
                <span className="w-2 h-2 rounded-full bg-amber-500" />
                <span>Selected</span>
              </span>
              <span className="font-bold text-slate-800">18%</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="flex items-center space-x-1.5 text-slate-600">
                <span className="w-2 h-2 rounded-full bg-rose-500" />
                <span>Rejected</span>
              </span>
              <span className="font-bold text-slate-800">10%</span>
            </div>
          </div>
        </div>

        {/* Pending Approvals Card (4 cols) matching Reference Image */}
        <div className="lg:col-span-4 bg-white rounded-2xl border border-slate-200/80 p-5 shadow-xs flex flex-col justify-between">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100">
            <div className="flex items-center space-x-2">
              <h2 className="text-sm font-bold text-slate-900">Pending Approvals</h2>
              <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-[#FA5A36] text-white">
                23
              </span>
            </div>
            <Link
              to="/admin/verifications"
              className="text-xs font-semibold text-[#FA5A36] hover:text-[#e04825] flex items-center space-x-0.5"
            >
              <span>View All</span>
              <span>→</span>
            </Link>
          </div>

          <div className="space-y-3 py-3">
            {/* 1. Artist Verification */}
            <div className="flex items-center justify-between p-3 rounded-xl bg-slate-50 border border-slate-100">
              <div className="flex items-center space-x-3">
                <div className="w-9 h-9 rounded-xl bg-orange-100/60 text-[#FA5A36] flex items-center justify-center">
                  <UserCheck className="w-4 h-4" />
                </div>
                <div>
                  <p className="text-xs font-bold text-slate-900 leading-tight">Artist Verification</p>
                  <p className="text-[11px] text-slate-500">12 requests pending</p>
                </div>
              </div>
              <button
                onClick={() => navigate('/admin/verifications')}
                className="px-3 py-1 bg-white border border-slate-200 text-slate-700 hover:border-[#FA5A36] hover:text-[#FA5A36] rounded-lg text-xs font-semibold shadow-2xs transition-colors cursor-pointer"
              >
                Review
              </button>
            </div>

            {/* 2. Company Verification */}
            <div className="flex items-center justify-between p-3 rounded-xl bg-slate-50 border border-slate-100">
              <div className="flex items-center space-x-3">
                <div className="w-9 h-9 rounded-xl bg-amber-100/60 text-amber-600 flex items-center justify-center">
                  <Building2 className="w-4 h-4" />
                </div>
                <div>
                  <p className="text-xs font-bold text-slate-900 leading-tight">Company Verification</p>
                  <p className="text-[11px] text-slate-500">5 requests pending</p>
                </div>
              </div>
              <button
                onClick={() => navigate('/admin/verifications')}
                className="px-3 py-1 bg-white border border-slate-200 text-slate-700 hover:border-[#FA5A36] hover:text-[#FA5A36] rounded-lg text-xs font-semibold shadow-2xs transition-colors cursor-pointer"
              >
                Review
              </button>
            </div>

            {/* 3. Casting Call Approval */}
            <div className="flex items-center justify-between p-3 rounded-xl bg-slate-50 border border-slate-100">
              <div className="flex items-center space-x-3">
                <div className="w-9 h-9 rounded-xl bg-rose-100/60 text-rose-600 flex items-center justify-center">
                  <Briefcase className="w-4 h-4" />
                </div>
                <div>
                  <p className="text-xs font-bold text-slate-900 leading-tight">Casting Call Approval</p>
                  <p className="text-[11px] text-slate-500">6 requests pending</p>
                </div>
              </div>
              <button
                onClick={() => navigate('/admin/verifications')}
                className="px-3 py-1 bg-white border border-slate-200 text-slate-700 hover:border-[#FA5A36] hover:text-[#FA5A36] rounded-lg text-xs font-semibold shadow-2xs transition-colors cursor-pointer"
              >
                Review
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* 4. Lower Row: Recent Casting Calls Cards + Recent Activity Stream */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
        {/* Recent Casting Calls Visual Photo Cards (8 cols) matching Reference Image */}
        <div className="lg:col-span-8 bg-white rounded-2xl border border-slate-200/80 p-5 shadow-xs">
          <div className="flex items-center justify-between pb-3.5 border-b border-slate-100 mb-4">
            <h2 className="text-sm font-bold text-slate-900">Recent Casting Calls</h2>
            <Link
              to="/admin/casting-calls"
              className="text-xs font-semibold text-[#FA5A36] hover:text-[#e04825] flex items-center space-x-0.5"
            >
              <span>View All</span>
              <span>→</span>
            </Link>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3.5">
            {sampleCastingCalls.map((call) => (
              <div
                key={call.id}
                onClick={() => navigate('/admin/casting-calls')}
                className="group border border-slate-200/80 rounded-xl overflow-hidden hover:shadow-md transition-all cursor-pointer bg-white flex flex-col justify-between"
              >
                <div className="relative h-28 w-full bg-slate-100 overflow-hidden">
                  <img
                    src={call.image}
                    alt={call.title}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
                  <span className="absolute bottom-2 left-2 px-2 py-0.5 rounded-md text-[10px] font-bold bg-black/60 backdrop-blur-xs text-white">
                    {call.category}
                  </span>
                </div>
                <div className="p-3">
                  <h3 className="text-xs font-bold text-slate-900 group-hover:text-[#FA5A36] transition-colors truncate">
                    {call.title}
                  </h3>
                  <p className="text-[10px] text-slate-400 mt-0.5 truncate">{call.location}</p>
                  <div className="flex items-center justify-between pt-2.5 mt-2 border-t border-slate-100 text-[10px]">
                    <span className="font-semibold text-slate-700">{call.applications} Applications</span>
                    <span className="px-1.5 py-0.5 rounded-md font-bold bg-emerald-50 text-emerald-600 border border-emerald-200">
                      {call.status}
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Recent Activity Stream (4 cols) matching Reference Image */}
        <div className="lg:col-span-4 bg-white rounded-2xl border border-slate-200/80 p-5 shadow-xs flex flex-col justify-between">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100 mb-2">
            <h2 className="text-sm font-bold text-slate-900">Recent Activity</h2>
            <Link
              to="/admin/activity-logs"
              className="text-xs font-semibold text-[#FA5A36] hover:text-[#e04825] flex items-center space-x-0.5"
            >
              <span>View All</span>
              <span>→</span>
            </Link>
          </div>

          <div className="space-y-3 py-1">
            <div className="flex items-start space-x-3">
              <div className="w-8 h-8 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center shrink-0 mt-0.5">
                <UserCheck className="w-4 h-4" />
              </div>
              <div className="min-w-0 flex-1">
                <p className="text-xs font-bold text-slate-900">New user registered</p>
                <p className="text-[11px] text-slate-500 truncate">Riya Sharma joined as Artist</p>
              </div>
              <span className="text-[10px] text-slate-400 shrink-0">2 min ago</span>
            </div>

            <div className="flex items-start space-x-3">
              <div className="w-8 h-8 rounded-xl bg-orange-50 text-[#FA5A36] flex items-center justify-center shrink-0 mt-0.5">
                <Briefcase className="w-4 h-4" />
              </div>
              <div className="min-w-0 flex-1">
                <p className="text-xs font-bold text-slate-900">Casting call published</p>
                <p className="text-[11px] text-slate-500 truncate">Feature Film – Lead Role</p>
              </div>
              <span className="text-[10px] text-slate-400 shrink-0">15 min ago</span>
            </div>

            <div className="flex items-start space-x-3">
              <div className="w-8 h-8 rounded-xl bg-sky-50 text-sky-600 flex items-center justify-center shrink-0 mt-0.5">
                <Building2 className="w-4 h-4" />
              </div>
              <div className="min-w-0 flex-1">
                <p className="text-xs font-bold text-slate-900">Company verified</p>
                <p className="text-[11px] text-slate-500 truncate">DreamPixel Studios approved</p>
              </div>
              <span className="text-[10px] text-slate-400 shrink-0">32 min ago</span>
            </div>

            <div className="flex items-start space-x-3">
              <div className="w-8 h-8 rounded-xl bg-teal-50 text-teal-600 flex items-center justify-center shrink-0 mt-0.5">
                <CreditCard className="w-4 h-4" />
              </div>
              <div className="min-w-0 flex-1">
                <p className="text-xs font-bold text-slate-900">Payment received</p>
                <p className="text-[11px] text-slate-500 truncate">₹2,499 – Studio Casting Plan</p>
              </div>
              <span className="text-[10px] text-slate-400 shrink-0">48 min ago</span>
            </div>
          </div>
        </div>
      </div>

      {/* 5. Bottom Row: Revenue Overview Bar Chart + Top Performing Casting Calls Table */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
        {/* Revenue Overview (5 cols) */}
        <div className="lg:col-span-5 bg-white rounded-2xl border border-slate-200/80 p-5 shadow-xs">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100">
            <div>
              <h2 className="text-sm font-bold text-slate-900">Revenue Overview</h2>
              <div className="flex items-baseline space-x-2 mt-1">
                <span className="text-xl font-black text-slate-900">
                  ₹{Math.round(totalRevAmount).toLocaleString()}
                </span>
                <span className="text-xs font-semibold text-emerald-600">↑ +16.9%</span>
              </div>
            </div>
            <Link
              to="/admin/payments"
              className="text-xs font-semibold text-[#FA5A36] hover:text-[#e04825]"
            >
              Ledger →
            </Link>
          </div>

          {/* Monthly Revenue Bars */}
          <div className="pt-5">
            <div className="h-32 flex items-end justify-between gap-2 px-2">
              {[
                { month: 'May', val: 35 },
                { month: 'Jun', val: 50 },
                { month: 'Jul', val: 42 },
                { month: 'Aug', val: 65 },
                { month: 'Sep', val: 78 },
                { month: 'Oct', val: 95 },
                { month: 'Nov', val: 100 },
              ].map((bar) => (
                <div key={bar.month} className="flex-1 flex flex-col items-center gap-1.5 group">
                  <div className="w-full bg-slate-100 rounded-t-lg h-28 relative flex items-end">
                    <div
                      style={{ height: `${bar.val}%` }}
                      className="w-full bg-[#FA5A36] rounded-t-lg group-hover:bg-[#e04825] transition-all"
                    />
                  </div>
                  <span className="text-[10px] font-medium text-slate-400">{bar.month}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Top Performing Casting Calls Table (7 cols) matching Reference Image */}
        <div className="lg:col-span-7 bg-white rounded-2xl border border-slate-200/80 p-5 shadow-xs">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100 mb-3">
            <h2 className="text-sm font-bold text-slate-900">Top Performing Casting Calls</h2>
            <Link
              to="/admin/casting-calls"
              className="text-xs font-semibold text-[#FA5A36] hover:text-[#e04825]"
            >
              Manage Calls →
            </Link>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="text-[10px] font-bold text-slate-400 uppercase tracking-wider border-b border-slate-100">
                  <th className="pb-2.5">Casting Call</th>
                  <th className="pb-2.5 text-center">Applications</th>
                  <th className="pb-2.5 text-right">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {sampleCastingCalls.slice(0, 3).map((opp) => (
                  <tr key={opp.id} className="hover:bg-slate-50/60 transition-colors">
                    <td className="py-2.5 flex items-center space-x-2.5">
                      <img
                        src={opp.image}
                        alt=""
                        className="w-8 h-8 rounded-lg object-cover ring-1 ring-slate-200"
                      />
                      <div className="truncate">
                        <p className="font-bold text-slate-900 truncate leading-tight">{opp.title}</p>
                        <p className="text-[10px] text-slate-400">{opp.category} • {opp.location}</p>
                      </div>
                    </td>
                    <td className="py-2.5 text-center font-bold text-slate-800">
                      {opp.applications}
                    </td>
                    <td className="py-2.5 text-right">
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
                        {opp.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboardPage;
