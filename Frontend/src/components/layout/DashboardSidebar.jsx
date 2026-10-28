import React from 'react';
import { NavLink, Link } from 'react-router-dom';
import {
  Sparkles,
  LayoutDashboard,
  User,
  Briefcase,
  FileCheck,
  Bookmark,
  MessageSquare,
  Bell,
  Settings,
  Users,
  LogOut,
  LifeBuoy,
  ShieldCheck,
  KeyRound,
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useNotifications } from '../../context/NotificationContext';
import { getStoredSupportTickets } from '../../data/mockSupportTickets';

const DashboardSidebar = ({ role = 'candidate' }) => {
  const { user, logout, isSuperAdmin, isAdmin } = useAuth();
  const { unreadCount } = useNotifications();

  // Support unread count state
  const [supportUnread, setSupportUnread] = React.useState(0);
  const [staffNewCount, setStaffNewCount] = React.useState(0);

  const isSuperAdminUser = isSuperAdmin || user?.role === 'super_admin' || role === 'super_admin';
  const isOperationsUser = !isSuperAdminUser && (role === 'operations' || user?.role === 'operations');
  const isAdminUser = isSuperAdminUser || (!isOperationsUser && (role === 'admin' || user?.role === 'admin' || isAdmin));
  const isRecruiterUser = !isSuperAdminUser && !isOperationsUser && !isAdminUser && (role === 'recruiter' || user?.role === 'recruiter');

  React.useEffect(() => {
    const updateCounts = () => {
      const tickets = getStoredSupportTickets();
      if (user?.id) {
        const userUnread = tickets.filter(
          (t) => t.userId === user.id && t.unreadForUser
        ).length;
        setSupportUnread(userUnread);
      }
      const staffCount = tickets.filter(
        (t) => t.status === 'open' && t.unreadForStaff
      ).length;
      setStaffNewCount(staffCount);
    };

    updateCounts();
    window.addEventListener('starcast_support_updated', updateCounts);
    return () => window.removeEventListener('starcast_support_updated', updateCounts);
  }, [user?.id]);

  const candidateLinks = [
    { label: 'Dashboard', path: '/candidate/dashboard', icon: LayoutDashboard },
    { label: 'My Profile', path: '/candidate/profile', icon: User },
    { label: 'Casting Calls', path: '/opportunities', icon: Briefcase },
    { label: 'My Applications', path: '/candidate/applications', icon: FileCheck },
    { label: 'Saved Opportunities', path: '/candidate/saved-opportunities', icon: Bookmark },
    { label: 'Messages', path: '/candidate/messages', icon: MessageSquare },
    { label: 'Notifications', path: '/candidate/notifications', icon: Bell, badge: unreadCount },
    { label: 'Help & Support', path: '/candidate/support', icon: LifeBuoy, badge: supportUnread || null },
    { label: 'Settings', path: '/candidate/settings', icon: Settings },
  ];

  const adminLinks = [
    { label: 'Dashboard', path: '/admin/dashboard', icon: LayoutDashboard },
    { label: 'Discover Talent', path: '/talent', icon: Sparkles },
    { label: 'Saved Talent', path: '/admin/saved-talent', icon: Bookmark },
    { label: 'Candidates', path: '/admin/candidates', icon: Users },
    { label: 'Ranked Matching', path: '/admin/candidates/ranked', icon: Sparkles },
    { label: 'Opportunities', path: '/admin/opportunities', icon: Briefcase },
    { label: 'Applications', path: '/admin/applications', icon: FileCheck },
    { label: 'Messages', path: '/admin/messages', icon: MessageSquare },
    { label: 'Help & Support', path: '/admin/support', icon: LifeBuoy, badge: supportUnread || null },
    { label: 'Operations Desk', path: '/admin/operations/support', icon: ShieldCheck, badge: staffNewCount || null },
    ...((isSuperAdminUser || isAdminUser) ? [{ label: 'Access & Audit (RBAC)', path: '/admin/settings?tab=accessControl', icon: KeyRound }] : []),
    { label: 'Settings', path: '/admin/settings', icon: Settings },
  ];

  const operationsLinks = [
    { label: 'Operations Desk', path: '/admin/operations/support', icon: ShieldCheck, badge: staffNewCount || null },
    { label: 'Candidates & Profiles', path: '/admin/candidates', icon: Users },
    { label: 'Casting Calls', path: '/admin/opportunities', icon: Briefcase },
    { label: 'Applications', path: '/admin/applications', icon: FileCheck },
    { label: 'Messages', path: '/admin/messages', icon: MessageSquare },
    { label: 'Settings', path: '/admin/settings', icon: Settings },
  ];

  let links = candidateLinks;
  if (isOperationsUser) {
    links = operationsLinks;
  } else if (isAdminUser) {
    links = adminLinks;
  } else if (isRecruiterUser) {
    links = adminLinks.filter((item) => item.path !== '/admin/operations/support' && item.path !== '/admin/settings?tab=accessControl');
  }

  return (
    <aside className="w-64 bg-white/95 backdrop-blur-md border-r border-slate-200/80 flex flex-col justify-between min-h-screen py-6 px-4 sticky top-0 h-screen overflow-y-auto shadow-3d-subtle">
      <div className="space-y-6">
        {/* Brand */}
        <Link to="/" className="flex items-center space-x-2.5 px-3 group focus-visible:outline-none">
          <div className="w-9 h-9 rounded-xl bg-[#FA5A36] flex items-center justify-center text-white font-bold text-lg shadow-md group-hover:scale-105 transition-transform duration-200">
            S
          </div>
          <div className="flex flex-col">
            <span className="text-lg font-bold tracking-tight text-neutral-950 font-sans">StageLink</span>
            <span className="text-[9px] uppercase tracking-widest text-[#FA5A36] font-bold -mt-0.5">
              {isSuperAdminUser ? 'Governance Suite' : isOperationsUser ? 'Operations Desk' : (isAdminUser || isRecruiterUser) ? 'Casting Director Suite' : 'Candidate Portal'}
            </span>
          </div>
        </Link>

        {/* Navigation list */}
        <nav className="space-y-1.5">
          {links.map((item) => {
            const Icon = item.icon;
            return (
              <NavLink
                key={item.path}
                to={item.path}
                className={({ isActive }) =>
                  `flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs font-semibold transition-all duration-200 ${
                    isActive
                      ? 'bg-rose-50/90 text-brand-pink font-bold border border-rose-200/60 shadow-2xs'
                      : 'text-slate-600 hover:text-neutral-950 hover:bg-slate-50/80'
                  }`
                }
              >
                <div className="flex items-center space-x-3">
                  <Icon className="w-4 h-4 shrink-0" />
                  <span>{item.label}</span>
                </div>
                {item.badge ? (
                  <span className="bg-brand-pink text-white text-[10px] font-bold px-2 py-0.5 rounded-full shadow-xs">
                    {item.badge}
                  </span>
                ) : null}
              </NavLink>
            );
          })}
        </nav>
      </div>

      {/* Logout Action */}
      <div className="pt-4 border-t border-slate-200/80">
        <button
          onClick={logout}
          className="w-full flex items-center space-x-3 px-3.5 py-2.5 rounded-xl text-xs font-semibold text-slate-500 hover:text-rose-600 hover:bg-rose-50/80 transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-pink cursor-pointer"
        >
          <LogOut className="w-4 h-4 shrink-0" />
          <span>Logout</span>
        </button>
      </div>
    </aside>
  );
};

export default DashboardSidebar;
