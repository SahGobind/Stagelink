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
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useNotifications } from '../../context/NotificationContext';
import { getStoredSupportTickets } from '../../data/mockSupportTickets';

const DashboardSidebar = ({ role = 'candidate' }) => {
  const { user, logout } = useAuth();
  const { unreadCount } = useNotifications();

  // Support unread count state
  const [supportUnread, setSupportUnread] = React.useState(0);
  const [staffNewCount, setStaffNewCount] = React.useState(0);

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

  const isOperationsUser = role === 'operations' || user?.role === 'operations';
  const isAdminUser = !isOperationsUser && (role === 'admin' || user?.role === 'admin');
  const isRecruiterUser = !isOperationsUser && !isAdminUser && (role === 'recruiter' || user?.role === 'recruiter');

  let links = candidateLinks;
  if (isOperationsUser) {
    links = operationsLinks;
  } else if (isAdminUser) {
    links = adminLinks;
  } else if (isRecruiterUser) {
    links = adminLinks.filter((item) => item.path !== '/admin/operations/support');
  }

  return (
    <aside className="w-64 bg-white border-r border-brand-border flex flex-col justify-between min-h-screen py-6 px-4 sticky top-0 h-screen overflow-y-auto">
      <div className="space-y-6">
        {/* Brand */}
        <Link to="/" className="flex items-center space-x-2.5 px-3 group">
          <div className="w-9 h-9 rounded-xl bg-brand-pink flex items-center justify-center text-white shadow-sm shadow-brand-pink/30 group-hover:scale-105 transition-transform">
            <Sparkles className="w-5 h-5 fill-current" />
          </div>
          <div className="flex flex-col">
            <span className="text-lg font-bold tracking-tight text-brand-navy font-serif">StageLink</span>
            <span className="text-[9px] uppercase tracking-widest text-brand-pink font-semibold -mt-1">
              {isOperationsUser ? 'Operations Desk' : (isAdminUser || isRecruiterUser) ? 'Studio Suite' : 'Performer Portal'}
            </span>
          </div>
        </Link>

        {/* Navigation list */}
        <nav className="space-y-1">
          {links.map((item) => {
            const Icon = item.icon;
            return (
              <NavLink
                key={item.path}
                to={item.path}
                className={({ isActive }) =>
                  `flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs font-semibold transition-all duration-150 ${
                    isActive
                      ? 'bg-brand-pink-light text-brand-pink shadow-xs'
                      : 'text-brand-text-secondary hover:text-brand-navy hover:bg-gray-50'
                  }`
                }
              >
                <div className="flex items-center space-x-3">
                  <Icon className="w-4 h-4 shrink-0" />
                  <span>{item.label}</span>
                </div>
                {item.badge ? (
                  <span className="bg-brand-pink text-white text-[10px] font-bold px-2 py-0.5 rounded-full">
                    {item.badge}
                  </span>
                ) : null}
              </NavLink>
            );
          })}
        </nav>
      </div>

      {/* Logout Action */}
      <div className="pt-4 border-t border-brand-border">
        <button
          onClick={logout}
          className="w-full flex items-center space-x-3 px-3.5 py-2.5 rounded-xl text-xs font-semibold text-brand-text-secondary hover:text-brand-error hover:bg-red-50 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-pink"
        >
          <LogOut className="w-4 h-4 shrink-0" />
          <span>Logout</span>
        </button>
      </div>
    </aside>
  );
};

export default DashboardSidebar;
