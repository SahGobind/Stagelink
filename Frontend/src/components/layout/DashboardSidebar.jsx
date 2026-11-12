import React, { useState, useEffect } from 'react';
import { NavLink, Link, useNavigate, useLocation } from 'react-router-dom';
import {
  LayoutDashboard,
  Users,
  UserCheck,
  Building2,
  Briefcase,
  FileCheck,
  CreditCard,
  ShieldCheck,
  LifeBuoy,
  Bell,
  BarChart3,
  KeyRound,
  Activity,
  Settings,
  ChevronRight,
  LogOut,
  Sparkles,
  MessageSquare,
  PlusCircle,
  Bookmark,
  User,
  ChevronDown,
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useNotifications } from '../../context/NotificationContext';
import { getStoredSupportTickets } from '../../data/mockSupportTickets';
import Avatar from '../common/Avatar';

const DashboardSidebar = ({ role = 'admin' }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const { user, logout, isSuperAdmin, isAdmin } = useAuth();
  const { unreadCount } = useNotifications();

  const [supportUnread, setSupportUnread] = useState(12); // live/default badge matching control center design
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);

  const isSuperAdminUser = isSuperAdmin || user?.role === 'super_admin' || role === 'super_admin';
  const isOperationsUser = !isSuperAdminUser && (role === 'operations' || user?.role === 'operations');
  const isAdminUser = isSuperAdminUser || (!isOperationsUser && (role === 'admin' || user?.role === 'admin' || isAdmin));
  const isRecruiterUser = !isSuperAdminUser && !isOperationsUser && !isAdminUser && (role === 'recruiter' || user?.role === 'recruiter');

  useEffect(() => {
    const updateCounts = () => {
      const tickets = getStoredSupportTickets();
      const openCount = tickets.filter(
        (t) => t.status === 'open' || t.status === 'in_progress'
      ).length;
      if (openCount > 0) {
        setSupportUnread(openCount);
      }
    };

    updateCounts();
    window.addEventListener('starcast_support_updated', updateCounts);
    return () => window.removeEventListener('starcast_support_updated', updateCounts);
  }, []);

  // 14 Dedicated Modules for Super Admin & Platform Control Center
  const adminModules = [
    { label: 'Overview', path: '/admin/dashboard', icon: LayoutDashboard },
    { label: 'User Management', path: '/admin/users', icon: Users },
    { label: 'Artists & Talent', path: '/admin/artists', icon: UserCheck },
    { label: 'Production Companies', path: '/admin/companies', icon: Building2 },
    { label: 'Casting Calls', path: '/admin/casting-calls', icon: Briefcase },
    { label: 'Applications', path: '/admin/applications', icon: FileCheck },
    { label: 'Payments & Transactions', path: '/admin/payments', icon: CreditCard },
    { label: 'Verification & Approvals', path: '/admin/verifications', icon: ShieldCheck },
    { label: 'Support Management', path: '/admin/support', icon: LifeBuoy, badge: supportUnread || 12 },
    { label: 'Notifications & CMS', path: '/admin/notifications', icon: Bell, badge: unreadCount || null },
    { label: 'Analytics & Reports', path: '/admin/analytics', icon: BarChart3 },
    { label: 'Roles & Permissions', path: '/admin/permissions', icon: KeyRound },
    { label: 'Activity Logs', path: '/admin/activity-logs', icon: Activity },
    { label: 'Platform Settings', path: '/admin/settings', icon: Settings },
  ];

  // Recruiter Scoped Workspace (Casting Director only)
  const recruiterModules = [
    { label: 'Studio Dashboard', path: '/admin/dashboard', icon: LayoutDashboard },
    { label: 'My Casting Calls', path: '/admin/casting-calls', icon: Briefcase },
    { label: 'Post Casting Call', path: '/post-job', icon: PlusCircle },
    { label: 'Applications Received', path: '/admin/applications', icon: FileCheck },
    { label: 'Discover Talent', path: '/admin/artists', icon: Sparkles },
    { label: 'Direct Messages', path: '/admin/messages', icon: MessageSquare },
    { label: 'Studio Support', path: '/admin/support', icon: LifeBuoy },
    { label: 'Company Settings', path: '/admin/settings', icon: Settings },
  ];

  // Candidate Workspace
  const candidateModules = [
    { label: 'Dashboard', path: '/candidate/dashboard', icon: LayoutDashboard },
    { label: 'My Profile', path: '/candidate/profile', icon: User },
    { label: 'Casting Calls', path: '/candidate/casting-calls', icon: Briefcase },
    { label: 'Applications', path: '/candidate/applications', icon: FileCheck },
    { label: 'Saved Calls', path: '/candidate/saved-opportunities', icon: Bookmark },
    { label: 'Messages', path: '/candidate/messages', icon: MessageSquare },
    { label: 'Notifications', path: '/candidate/notifications', icon: Bell, badge: unreadCount || null },
    { label: 'Support & Help', path: '/candidate/support', icon: LifeBuoy },
    { label: 'Settings', path: '/candidate/settings', icon: Settings },
  ];

  const items = (isAdminUser || isSuperAdminUser || isOperationsUser)
    ? adminModules
    : isRecruiterUser
    ? recruiterModules
    : candidateModules;

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  const displayName = user?.fullName || user?.full_name || 'Gobind Sah';
  const displayRole = isSuperAdminUser ? 'Super Admin' : isAdminUser ? 'Admin' : isRecruiterUser ? 'Casting Director' : 'Performer';

  return (
    <aside className="w-64 bg-white border-r border-slate-200/90 flex flex-col justify-between min-h-screen sticky top-0 h-screen select-none shadow-xs z-20 font-sans">
      {/* Top Header / Branding */}
      <div className="flex flex-col flex-1 min-h-0">
        <div className="p-4 px-5 pb-3 border-b border-slate-100 flex items-center justify-between">
          <Link to="/admin/dashboard" className="flex items-center space-x-3 group focus-visible:outline-none">
            <div className="w-8 h-8 rounded-xl bg-[#FA5A36] flex items-center justify-center text-white font-bold text-sm shadow-xs group-hover:scale-105 transition-transform duration-200">
              <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24">
                <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5" />
              </svg>
            </div>
            <div className="flex flex-col leading-tight">
              <span className="text-base font-bold tracking-tight text-slate-900">StageLink</span>
              <span className="text-[10px] text-slate-400 font-medium">Admin Control Center</span>
            </div>
          </Link>
        </div>

        {/* Scrollable Navigation Items */}
        <nav className="flex-1 overflow-y-auto px-3 py-3 space-y-1 scrollbar-thin scrollbar-thumb-slate-200">
          {items.map((item) => {
            const Icon = item.icon;
            // Check active (support aliases e.g. /admin/talent matching /admin/artists, etc.)
            const isActive =
              location.pathname === item.path ||
              (item.path === '/admin/artists' && (location.pathname.startsWith('/admin/talent') || location.pathname.startsWith('/admin/candidates'))) ||
              (item.path === '/admin/casting-calls' && location.pathname.startsWith('/admin/opportunities')) ||
              (item.path === '/admin/permissions' && location.pathname.startsWith('/admin/roles')) ||
              (item.path === '/admin/activity-logs' && location.pathname.startsWith('/admin/audit-logs'));

            return (
              <NavLink
                key={item.label}
                to={item.path}
                className={`flex items-center justify-between px-3 py-2 rounded-xl text-xs font-medium transition-all group ${
                  isActive
                    ? 'bg-[#FA5A36] text-white font-semibold shadow-xs'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
                }`}
              >
                <div className="flex items-center space-x-3 truncate">
                  <Icon className={`w-4 h-4 shrink-0 transition-colors ${isActive ? 'text-white' : 'text-slate-500 group-hover:text-slate-800'}`} />
                  <span className="truncate">{item.label}</span>
                </div>

                <div className="flex items-center space-x-1.5 shrink-0">
                  {item.badge ? (
                    <span
                      className={`px-1.5 py-0.5 rounded-full text-[10px] font-bold ${
                        isActive
                          ? 'bg-white/20 text-white'
                          : 'bg-[#FA5A36] text-white shadow-2xs'
                      }`}
                    >
                      {item.badge}
                    </span>
                  ) : (
                    <ChevronRight className={`w-3.5 h-3.5 transition-transform ${isActive ? 'text-white/80' : 'text-slate-400 opacity-60 group-hover:opacity-100 group-hover:translate-x-0.5'}`} />
                  )}
                </div>
              </NavLink>
            );
          })}
        </nav>
      </div>

      {/* Bottom Profile Footer matching Reference Image */}
      <div className="p-3 border-t border-slate-100 bg-white">
        <div className="relative">
          <button
            onClick={() => setIsUserMenuOpen(!isUserMenuOpen)}
            className="w-full flex items-center justify-between p-2 rounded-xl hover:bg-slate-50 transition-colors text-left cursor-pointer"
          >
            <div className="flex items-center space-x-2.5 min-w-0">
              <Avatar
                src={user?.avatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=150&q=80'}
                name={displayName}
                size="sm"
                className="shrink-0 ring-1 ring-slate-200"
              />
              <div className="truncate">
                <p className="text-xs font-bold text-slate-900 truncate leading-tight">{displayRole}</p>
                <div className="flex items-center space-x-1 mt-0.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                  <span className="text-[10px] font-medium text-emerald-600">Full Access</span>
                </div>
              </div>
            </div>
            <ChevronDown className="w-3.5 h-3.5 text-slate-400 shrink-0" />
          </button>

          {/* Quick Dropdown Popover */}
          {isUserMenuOpen && (
            <div className="absolute bottom-full left-0 right-0 mb-2 bg-white rounded-xl shadow-lg border border-slate-200/90 py-1.5 text-xs z-30 animate-in fade-in slide-in-from-bottom-2 duration-150">
              <div className="px-3 py-2 border-b border-slate-100">
                <p className="font-semibold text-slate-900 truncate">{displayName}</p>
                <p className="text-[11px] text-slate-400 truncate">{user?.email || 'admin@stagelink.com'}</p>
              </div>
              <Link
                to="/admin/settings"
                onClick={() => setIsUserMenuOpen(false)}
                className="flex items-center space-x-2 px-3 py-2 text-slate-700 hover:bg-slate-50 transition-colors"
              >
                <Settings className="w-3.5 h-3.5 text-slate-400" />
                <span>Platform Settings</span>
              </Link>
              <button
                onClick={handleLogout}
                className="w-full flex items-center space-x-2 px-3 py-2 text-red-600 hover:bg-red-50 transition-colors text-left"
              >
                <LogOut className="w-3.5 h-3.5" />
                <span>Sign Out</span>
              </button>
            </div>
          )}
        </div>
      </div>
    </aside>
  );
};

export default DashboardSidebar;
