import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Bell, Search, HelpCircle, LogOut, Settings, User } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useNotifications } from '../../context/NotificationContext';
import Avatar from '../common/Avatar';
import NotificationDropdown from './NotificationDropdown';

const DashboardHeader = ({ title, subtitle }) => {
  const { user, role, logout, isSuperAdmin } = useAuth();
  const { unreadCount } = useNotifications();
  const navigate = useNavigate();
  const [headerSearch, setHeaderSearch] = useState('');
  const [isNotificationsOpen, setIsNotificationsOpen] = useState(false);
  const [isProfileOpen, setIsProfileOpen] = useState(false);

  const displayName = user?.fullName || user?.full_name || 'Gobind Sah';
  const displayRole = isSuperAdmin || user?.role === 'super_admin' ? 'Super Admin' : user?.role === 'admin' ? 'Admin' : 'Staff';

  const handleSearchSubmit = (e) => {
    if (e.key === 'Enter' && headerSearch.trim()) {
      e.preventDefault();
      navigate(`/admin/users?search=${encodeURIComponent(headerSearch.trim())}`);
    }
  };

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  return (
    <header className="bg-white border-b border-slate-200/90 px-4 sm:px-6 md:px-8 py-3 flex items-center justify-between sticky top-0 z-30 shadow-xs">
      {/* Left: Global Search matching Reference Image */}
      <div className="flex-1 max-w-lg">
        <div className="flex items-center bg-slate-50 border border-slate-200/80 rounded-xl px-3.5 py-2 w-full max-w-md shadow-2xs focus-within:bg-white focus-within:border-[#FA5A36] focus-within:ring-2 focus-within:ring-[#FA5A36]/10 transition-all">
          <Search className="w-4 h-4 text-slate-400 mr-2.5 shrink-0" />
          <input
            type="text"
            value={headerSearch}
            onChange={(e) => setHeaderSearch(e.target.value)}
            onKeyDown={handleSearchSubmit}
            placeholder="Search users, casting calls, companies..."
            aria-label="Search platform"
            className="bg-transparent text-xs text-slate-900 placeholder-slate-400 focus:outline-none w-full"
          />
        </div>
      </div>

      {/* Right Controls: Notifications, Help, User Profile */}
      <div className="flex items-center space-x-3 sm:space-x-4 shrink-0">
        {/* Notification Bell */}
        <div className="relative">
          <button
            type="button"
            onClick={() => setIsNotificationsOpen((prev) => !prev)}
            aria-label="Notifications"
            className="relative p-2 rounded-xl text-slate-600 hover:text-slate-900 hover:bg-slate-100 transition-colors cursor-pointer"
          >
            <Bell className="w-5 h-5" />
            {unreadCount > 0 && (
              <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-[#FA5A36] rounded-full ring-2 ring-white" />
            )}
          </button>
          <NotificationDropdown
            isOpen={isNotificationsOpen}
            onClose={() => setIsNotificationsOpen(false)}
          />
        </div>

        {/* Help Icon */}
        <Link
          to="/admin/support"
          aria-label="Help & Documentation"
          className="p-2 rounded-xl text-slate-600 hover:text-slate-900 hover:bg-slate-100 transition-colors"
          title="Support & Documentation"
        >
          <HelpCircle className="w-5 h-5" />
        </Link>

        {/* User Profile Info Chip matching Reference Image */}
        <div className="relative">
          <button
            onClick={() => setIsProfileOpen(!isProfileOpen)}
            className="flex items-center space-x-2.5 pl-2 sm:pl-3 border-l border-slate-200/80 py-1 hover:opacity-90 transition-opacity cursor-pointer text-left"
          >
            <Avatar
              src={user?.avatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=150&q=80'}
              name={displayName}
              size="sm"
              className="ring-1 ring-slate-200 shadow-2xs"
            />
            <div className="hidden sm:block text-left leading-tight">
              <p className="text-xs font-bold text-slate-900">{displayName}</p>
              <p className="text-[10px] text-slate-500 font-medium">{displayRole}</p>
            </div>
          </button>

          {isProfileOpen && (
            <div className="absolute right-0 mt-2 w-48 bg-white rounded-xl shadow-lg border border-slate-200/90 py-1.5 text-xs z-40 animate-in fade-in duration-100">
              <div className="px-3 py-2 border-b border-slate-100">
                <p className="font-semibold text-slate-900">{displayName}</p>
                <p className="text-[10px] text-slate-400">{user?.email || 'admin@stagelink.com'}</p>
              </div>
              <Link
                to="/admin/settings"
                onClick={() => setIsProfileOpen(false)}
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
    </header>
  );
};

export default DashboardHeader;
