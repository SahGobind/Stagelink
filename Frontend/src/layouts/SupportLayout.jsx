import React, { useState } from 'react';
import { Outlet, NavLink, useNavigate, useLocation } from 'react-router-dom';
import {
  LayoutDashboard,
  Inbox,
  Ticket,
  CheckCircle2,
  AlertTriangle,
  BookOpen,
  HelpCircle,
  Users,
  BarChart3,
  Sliders,
  LogOut,
  Shield,
  ShieldAlert,
  Search,
  Menu,
  X,
  ExternalLink,
  ChevronRight,
  Headphones,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import ErrorBoundary from '../components/common/ErrorBoundary';

const SupportLayout = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  const role = user?.role || 'support_agent';
  const isAgent = role === 'support_agent';
  const isLead = role === 'support_lead';
  const isSuper = role === 'super_admin' || role === 'admin';
  const canManageTeam = isLead || isSuper;

  const handleLogout = async () => {
    await logout();
    navigate('/support/login');
  };

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/support/tickets?search=${encodeURIComponent(searchQuery.trim())}`);
    }
  };

  const navLinkClass = ({ isActive }) =>
    `flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-sm font-medium transition-all duration-150 ${
      isActive
        ? 'bg-amber-500/10 text-amber-600 font-semibold shadow-sm border border-amber-500/20'
        : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100/80'
    }`;

  return (
    <div className="flex min-h-screen bg-slate-50 text-slate-900 font-sans antialiased">
      {/* Mobile Backdrop */}
      {mobileMenuOpen && (
        <div
          className="fixed inset-0 z-40 bg-slate-900/50 backdrop-blur-sm md:hidden"
          onClick={() => setMobileMenuOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside
        className={`fixed inset-y-0 left-0 z-50 w-72 bg-white border-r border-slate-200/80 flex flex-col transition-transform duration-300 ease-in-out md:translate-x-0 md:static ${
          mobileMenuOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        {/* Brand / Logo */}
        <div className="h-16 px-6 flex items-center justify-between border-b border-slate-100">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-amber-600 to-amber-500 flex items-center justify-center text-white shadow-md shadow-amber-500/20">
              <Headphones className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <span className="font-bold text-slate-900 tracking-tight text-lg">StageLink</span>
                <span className="text-[10px] font-bold uppercase tracking-wider px-1.5 py-0.5 rounded bg-amber-100 text-amber-800">
                  Support
                </span>
              </div>
              <p className="text-xs text-slate-500">Helpdesk & Resolution Hub</p>
            </div>
          </div>
          <button
            onClick={() => setMobileMenuOpen(false)}
            className="md:hidden text-slate-400 hover:text-slate-600"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Scope Badge Banner */}
        <div className="px-5 py-3 border-b border-slate-100 bg-slate-50/60">
          <div className="flex items-center gap-2 text-xs">
            {isAgent ? (
              <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-sky-50 text-sky-700 font-semibold border border-sky-200/60">
                <Shield className="w-3.5 h-3.5 text-sky-600" />
                Level 1 • Support Agent
              </span>
            ) : isLead ? (
              <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-purple-50 text-purple-700 font-semibold border border-purple-200/60">
                <ShieldAlert className="w-3.5 h-3.5 text-purple-600" />
                Level 2 • Support Lead
              </span>
            ) : (
              <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-emerald-50 text-emerald-700 font-semibold border border-emerald-200/60">
                <Shield className="w-3.5 h-3.5 text-emerald-600" />
                Super Admin • Full Access
              </span>
            )}
          </div>
          <p className="text-[11px] text-slate-500 mt-1 leading-snug">
            {isAgent
              ? 'Authorized scope: Assigned tickets only (PoLP enforced).'
              : isLead
              ? 'Team supervisor: Ticket routing, escalations & performance.'
              : 'Platform super administrator.'}
          </p>
        </div>

        {/* Navigation Links */}
        <nav className="flex-1 overflow-y-auto px-4 py-4 space-y-6">
          {/* Section: Workflows */}
          <div>
            <div className="px-3 mb-2 text-[11px] font-bold uppercase tracking-wider text-slate-400">
              Ticket Operations
            </div>
            <div className="space-y-1">
              <NavLink to="/support/dashboard" className={navLinkClass}>
                <LayoutDashboard className="w-4 h-4 text-slate-500" />
                <span>Dashboard</span>
              </NavLink>
              <NavLink to="/support/my-tickets" className={navLinkClass}>
                <Inbox className="w-4 h-4 text-slate-500" />
                <span>My Assigned Tickets</span>
              </NavLink>
              {canManageTeam && (
                <NavLink to="/support/tickets" className={navLinkClass}>
                  <Ticket className="w-4 h-4 text-slate-500" />
                  <span>All Platform Tickets</span>
                </NavLink>
              )}
              <NavLink to="/support/assigned" className={navLinkClass}>
                <CheckCircle2 className="w-4 h-4 text-slate-500" />
                <span>Active Workload</span>
              </NavLink>
              <NavLink to="/support/escalations" className={navLinkClass}>
                <AlertTriangle className="w-4 h-4 text-amber-500" />
                <span>Escalated Queue</span>
              </NavLink>
            </div>
          </div>

          {/* Section: Resources */}
          <div>
            <div className="px-3 mb-2 text-[11px] font-bold uppercase tracking-wider text-slate-400">
              Knowledge & Guides
            </div>
            <div className="space-y-1">
              <NavLink to="/support/knowledge-base" className={navLinkClass}>
                <BookOpen className="w-4 h-4 text-slate-500" />
                <span>Knowledge Base</span>
              </NavLink>
              <NavLink to="/support/help" className={navLinkClass}>
                <HelpCircle className="w-4 h-4 text-slate-500" />
                <span>Agent Handbook</span>
              </NavLink>
            </div>
          </div>

          {/* Section: Team Management (Lead / Super Admin Only) */}
          {canManageTeam && (
            <div>
              <div className="px-3 mb-2 text-[11px] font-bold uppercase tracking-wider text-slate-400 flex items-center justify-between">
                <span>Team Governance</span>
                <span className="text-[10px] text-purple-600 font-semibold bg-purple-50 px-1.5 py-0.2 rounded">
                  Lead Only
                </span>
              </div>
              <div className="space-y-1">
                <NavLink to="/support/team" className={navLinkClass}>
                  <Users className="w-4 h-4 text-slate-500" />
                  <span>Team Workload</span>
                </NavLink>
                <NavLink to="/support/team/reports" className={navLinkClass}>
                  <BarChart3 className="w-4 h-4 text-slate-500" />
                  <span>Performance Reports</span>
                </NavLink>
                <NavLink to="/support/team/settings" className={navLinkClass}>
                  <Sliders className="w-4 h-4 text-slate-500" />
                  <span>Support Settings</span>
                </NavLink>
              </div>
            </div>
          )}
        </nav>

        {/* User Card & Logout */}
        <div className="p-4 border-t border-slate-100 bg-slate-50/50">
          <div className="flex items-center gap-3 mb-3">
            <img
              src={
                user?.avatar ||
                'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=400&q=80'
              }
              alt={user?.fullName || 'Support Staff'}
              className="w-9 h-9 rounded-full object-cover border border-slate-200"
            />
            <div className="min-w-0 flex-1">
              <p className="text-sm font-semibold text-slate-900 truncate">
                {user?.fullName || 'Liam Patel'}
              </p>
              <p className="text-xs text-slate-500 truncate">{user?.email || 'agent@stagelink.com'}</p>
            </div>
          </div>
          <button
            onClick={handleLogout}
            className="w-full flex items-center justify-center gap-2 px-3 py-2 text-xs font-semibold text-red-600 bg-red-50 hover:bg-red-100 rounded-xl transition"
          >
            <LogOut className="w-3.5 h-3.5" />
            <span>Sign Out of Helpdesk</span>
          </button>
        </div>
      </aside>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Top Header */}
        <header className="h-16 bg-white border-b border-slate-200/80 px-4 sm:px-6 md:px-8 flex items-center justify-between gap-4 sticky top-0 z-30">
          <div className="flex items-center gap-3">
            <button
              onClick={() => setMobileMenuOpen(true)}
              className="md:hidden p-2 rounded-xl text-slate-500 hover:bg-slate-100"
            >
              <Menu className="w-5 h-5" />
            </button>
            <div className="hidden sm:block">
              <h1 className="text-base font-bold text-slate-900">StageLink Customer Support Hub</h1>
              <p className="text-xs text-slate-500">Production-level resolution management & governance</p>
            </div>
          </div>

          {/* Quick Search */}
          <form onSubmit={handleSearchSubmit} className="flex-1 max-w-md">
            <div className="relative">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
              <input
                type="text"
                placeholder="Search ticket #, subject, customer email..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-9 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs sm:text-sm text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500 transition"
              />
            </div>
          </form>

          {/* User Info / Role Pill */}
          <div className="flex items-center gap-3">
            {isSuper && (
              <button
                onClick={() => navigate('/admin/dashboard')}
                className="hidden lg:flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-slate-600 hover:text-slate-900 bg-slate-100 hover:bg-slate-200 rounded-lg transition"
              >
                <span>Super Admin Portal</span>
                <ExternalLink className="w-3 h-3" />
              </button>
            )}
            <div className="w-8 h-8 rounded-full bg-amber-500/10 text-amber-600 flex items-center justify-center font-bold text-xs border border-amber-500/20">
              {(user?.fullName || 'S')[0]}
            </div>
          </div>
        </header>

        {/* Page Content */}
        <main className="flex-1 p-4 sm:p-6 md:p-8 max-w-7xl mx-auto w-full">
          <ErrorBoundary>
            <Outlet />
          </ErrorBoundary>
        </main>
      </div>
    </div>
  );
};

export default SupportLayout;

