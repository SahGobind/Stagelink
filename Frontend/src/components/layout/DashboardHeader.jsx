import React from 'react';
import { Link } from 'react-router-dom';
import { Bell, Search, LogOut, User, Settings, LifeBuoy, ShieldCheck } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useNotifications } from '../../context/NotificationContext';
import Avatar from '../common/Avatar';
import Dropdown from '../common/Dropdown';

const DashboardHeader = ({ title, subtitle }) => {
  const { user, role, logout } = useAuth();
  const { unreadCount } = useNotifications();

  const notifLink = role === 'admin' ? '/admin/messages' : '/candidate/notifications';
  const profileLink = role === 'admin' ? '/admin/settings' : '/candidate/profile';
  const settingsLink = role === 'admin' ? '/admin/settings' : '/candidate/settings';
  const supportLink = role === 'admin' || role === 'recruiter' ? '/admin/support' : '/candidate/support';

  return (
    <header className="bg-white border-b border-brand-border px-4 sm:px-6 md:px-8 xl:px-10 py-3.5 sm:py-4 flex items-center justify-between sticky top-0 z-30">
      <div className="min-w-0 pr-2">
        <h1 className="text-lg sm:text-xl font-bold text-brand-navy font-serif tracking-tight truncate">
          {title}
        </h1>
        {subtitle && (
          <p className="text-[11px] sm:text-xs text-brand-text-secondary mt-0.5 truncate hidden xs:block sm:block">
            {subtitle}
          </p>
        )}
      </div>

      <div className="flex items-center space-x-2 sm:space-x-4 shrink-0">
        {/* Quick Search on larger screens */}
        <div className="hidden lg:flex items-center bg-gray-50 border border-brand-border rounded-xl px-3.5 py-1.5 w-64 focus-within:border-brand-pink focus-within:ring-2 focus-within:ring-brand-pink/20 transition-all">
          <Search className="w-4 h-4 text-gray-400 mr-2 shrink-0" />
          <input
            type="text"
            placeholder="Search platform..."
            aria-label="Search platform"
            className="bg-transparent text-xs text-brand-navy placeholder-gray-400 focus:outline-hidden w-full"
          />
        </div>

        {/* Notifications Icon with Indicator */}
        <Link
          to={notifLink}
          aria-label="Notifications"
          className="relative p-2 text-brand-text-secondary hover:text-brand-navy hover:bg-gray-50 rounded-xl transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-pink min-w-[40px] min-h-[40px] flex items-center justify-center"
        >
          <Bell className="w-5 h-5" />
          {unreadCount > 0 && (
            <span className="absolute top-2 right-2 w-2 h-2 bg-brand-pink rounded-full ring-2 ring-white" />
          )}
        </Link>

        {/* User Profile Dropdown */}
        <Dropdown
          align="right"
          trigger={
            <button
              aria-label="Open user profile menu"
              className="flex items-center space-x-2 sm:space-x-3 pl-2 border-l border-brand-border py-1 text-left focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-pink rounded-xl min-h-[40px]"
            >
              <Avatar src={user?.avatar} name={user?.fullName || 'User'} size="sm" status="online" />
              <div className="hidden md:block text-left leading-tight">
                <p className="text-xs font-bold text-brand-navy">{user?.fullName || 'Member'}</p>
                <p className="text-[10px] text-brand-pink font-semibold uppercase tracking-wider mt-0.5">
                  {user?.role || 'Guest'}
                </p>
              </div>
            </button>
          }
        >
          <div className="px-4 py-2 border-b border-gray-100">
            <p className="text-xs font-bold text-brand-navy">{user?.fullName}</p>
            <p className="text-[11px] text-brand-text-secondary truncate">{user?.email}</p>
          </div>
          <div className="py-1">
            <Link
              to={profileLink}
              className="flex items-center space-x-2 px-4 py-2 text-xs font-medium text-brand-navy hover:bg-gray-50 transition-colors"
            >
              <User className="w-4 h-4 text-gray-400" />
              <span>Profile</span>
            </Link>
            <Link
              to={settingsLink}
              className="flex items-center space-x-2 px-4 py-2 text-xs font-medium text-brand-navy hover:bg-gray-50 transition-colors"
            >
              <Settings className="w-4 h-4 text-gray-400" />
              <span>Settings</span>
            </Link>
            <Link
              to={supportLink}
              className="flex items-center space-x-2 px-4 py-2 text-xs font-medium text-brand-navy hover:bg-gray-50 transition-colors"
            >
              <LifeBuoy className="w-4 h-4 text-brand-pink" />
              <span>Help &amp; Support</span>
            </Link>
            {(role === 'admin' || user?.role === 'admin' || user?.role === 'operations') && (
              <Link
                to="/admin/operations/support"
                className="flex items-center space-x-2 px-4 py-2 text-xs font-medium text-brand-navy hover:bg-gray-50 transition-colors"
              >
                <ShieldCheck className="w-4 h-4 text-indigo-600" />
                <span>Operations Desk</span>
              </Link>
            )}
          </div>
          <div className="pt-1 border-t border-gray-100">
            <button
              onClick={logout}
              className="w-full flex items-center space-x-2 px-4 py-2 text-xs font-medium text-brand-error hover:bg-red-50 transition-colors"
            >
              <LogOut className="w-4 h-4" />
              <span>Logout</span>
            </button>
          </div>
        </Dropdown>
      </div>
    </header>
  );
};

export default DashboardHeader;
