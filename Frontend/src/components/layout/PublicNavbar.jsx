import React, { useState, useEffect } from 'react';
import { Link, NavLink, useLocation } from 'react-router-dom';
import {
  Star,
  Search,
  Bell,
  Menu,
  X,
  LogOut,
  ChevronDown,
  Briefcase,
  Settings,
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useNotifications } from '../../context/NotificationContext';
import NotificationDropdown from './NotificationDropdown';
import GlobalSearchModal from '../common/GlobalSearchModal';

const PublicNavbar = () => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [isNotificationsOpen, setIsNotificationsOpen] = useState(false);

  const location = useLocation();
  const { isAuthenticated, user, logout } = useAuth();
  const { unreadCount } = useNotifications();

  // Global keyboard shortcut for quick search (Ctrl+K or Cmd+K)
  useEffect(() => {
    const handleKeyDown = (e) => {
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        setIsSearchOpen((prev) => !prev);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  const navLinks = [
    { label: 'Casting Calls', path: '/opportunities' },
    { label: 'Discover Talent', path: '/talent' },
    { label: 'How It Works', path: '/how-it-works' },
    { label: 'About', path: '/about' },
  ];

  return (
    <header className="sticky top-0 z-40 bg-white/85 backdrop-blur-xl border-b border-slate-200/75 shadow-3d-subtle transition-all duration-300">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Brand Logo with 3D Pink Star Emblem */}
          <Link to="/" className="flex items-center space-x-2.5 group focus-visible:outline-none">
            <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-rose-500 via-brand-pink to-brand-pink-hover flex items-center justify-center text-white shadow-3d-button-pink group-hover:scale-105 transition-transform duration-200">
              <Star className="w-4 h-4 fill-white text-white drop-shadow-xs" />
            </div>
            <span className="text-xl sm:text-2xl font-bold font-serif tracking-tight text-neutral-950">
              Stage<span className="text-brand-pink font-serif">Link</span>
            </span>
          </Link>

          {/* Desktop Nav Items */}
          <nav className="hidden md:flex items-center space-x-1 lg:space-x-2">
            {navLinks.map((link) => {
              const isActive = location.pathname === link.path;
              return (
                <NavLink
                  key={link.path}
                  to={link.path}
                  className={`text-xs sm:text-sm font-semibold transition-all relative px-3.5 py-1.5 rounded-xl ${
                    isActive
                      ? 'text-neutral-950 font-bold bg-neutral-100/80 shadow-2xs'
                      : 'text-neutral-600 hover:text-neutral-950 hover:bg-neutral-50/80'
                  }`}
                >
                  {link.label}
                  {isActive && (
                    <span className="absolute bottom-0 left-3 right-3 h-0.5 bg-brand-pink rounded-full shadow-xs" />
                  )}
                </NavLink>
              );
            })}
          </nav>

          {/* Desktop Right Actions */}
          <div className="hidden md:flex items-center space-x-3">
            {/* Search Icon / Button */}
            <button
              type="button"
              onClick={() => {
                setIsSearchOpen(true);
                setIsNotificationsOpen(false);
                setUserMenuOpen(false);
              }}
              className="p-2 text-neutral-600 hover:text-neutral-950 hover:bg-neutral-100/80 transition-all rounded-xl flex items-center gap-1.5 cursor-pointer shadow-2xs hover:shadow-xs"
              title="Quick Search (Ctrl + K)"
              aria-label="Search platform"
            >
              <Search className="w-4 h-4" />
              <span className="hidden xl:inline text-[10px] font-semibold text-neutral-500 bg-neutral-100 px-1.5 py-0.5 rounded border border-neutral-200/80 shadow-2xs">
                ⌘K
              </span>
            </button>

            {/* Notification Bell with Dropdown */}
            <div className="relative">
              <button
                type="button"
                onClick={() => {
                  setIsNotificationsOpen((prev) => !prev);
                  setUserMenuOpen(false);
                }}
                className={`p-2 rounded-xl transition-all relative cursor-pointer shadow-2xs ${
                  isNotificationsOpen
                    ? 'text-brand-pink bg-rose-50 border border-rose-200/60 shadow-xs'
                    : 'text-neutral-600 hover:text-neutral-950 hover:bg-neutral-100/80 hover:shadow-xs'
                }`}
                title="Notifications"
                aria-label={`Notifications ${unreadCount > 0 ? `(${unreadCount} unread)` : ''}`}
              >
                <Bell className="w-4 h-4" />
                {unreadCount > 0 && (
                  <span className="absolute top-1 right-1 min-w-[14px] h-[14px] bg-brand-pink text-white text-[9px] font-bold rounded-full flex items-center justify-center px-0.5 ring-2 ring-white shadow-xs">
                    {unreadCount > 9 ? '9+' : unreadCount}
                  </span>
                )}
              </button>

              <NotificationDropdown
                isOpen={isNotificationsOpen}
                onClose={() => setIsNotificationsOpen(false)}
              />
            </div>

            {/* User Profile / Production House Dropdown */}
            {isAuthenticated ? (
              <div className="relative">
                <button
                  type="button"
                  onClick={() => setUserMenuOpen(!userMenuOpen)}
                  className="flex items-center gap-2.5 p-1.5 rounded-2xl hover:bg-neutral-50 border border-transparent hover:border-neutral-200/80 transition-all text-left shadow-2xs hover:shadow-xs"
                >
                  <img
                    src={
                      user?.avatar ||
                      'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&w=400&q=80'
                    }
                    alt={user?.fullName || 'Production House'}
                    className="w-8 h-8 rounded-full object-cover border border-slate-200 shadow-2xs"
                  />
                  <div className="hidden lg:block text-left">
                    <p className="text-xs font-bold text-neutral-950 leading-tight">
                      {user?.companyName || user?.fullName || 'Production House'}
                    </p>
                    <p className="text-[10px] text-neutral-500 font-medium">Casting Director</p>
                  </div>
                  <ChevronDown className="w-3.5 h-3.5 text-neutral-400 hidden lg:block" />
                </button>

                {userMenuOpen && (
                  <div
                    className="absolute right-0 mt-2 w-56 bg-white/95 backdrop-blur-md rounded-2xl shadow-3d-floating border border-slate-200/90 py-2 z-50 text-xs animate-in fade-in zoom-in-95 specular-top"
                    onClick={() => setUserMenuOpen(false)}
                  >
                    <Link
                      to={user?.role === 'admin' ? '/admin/dashboard' : '/candidate/dashboard'}
                      className="flex items-center gap-2.5 px-4 py-2 hover:bg-neutral-50 text-neutral-800 font-semibold transition-colors"
                    >
                      <Briefcase className="w-4 h-4 text-neutral-500" />
                      <span>Dashboard</span>
                    </Link>
                    <Link
                      to="/admin/opportunities"
                      className="flex items-center gap-2.5 px-4 py-2 hover:bg-neutral-50 text-neutral-800 font-semibold transition-colors"
                    >
                      <Star className="w-4 h-4 text-neutral-500" />
                      <span>My Casting Posts</span>
                    </Link>
                    <Link
                      to="/admin/saved-talent"
                      className="flex items-center gap-2.5 px-4 py-2 hover:bg-neutral-50 text-neutral-800 font-semibold transition-colors"
                    >
                      <Briefcase className="w-4 h-4 text-brand-pink" />
                      <span>Saved Talent Roster</span>
                    </Link>
                    <Link
                      to="/post-job"
                      className="flex items-center gap-2.5 px-4 py-2 hover:bg-rose-50 text-brand-pink font-bold transition-colors"
                    >
                      <PlusCircle className="w-4 h-4" />
                      <span>Post New Casting</span>
                    </Link>
                    <hr className="my-1 border-neutral-100" />
                    <button
                      onClick={logout}
                      className="w-full flex items-center gap-2.5 px-4 py-2 hover:bg-rose-50 text-rose-600 font-semibold text-left transition-colors"
                    >
                      <LogOut className="w-4 h-4" />
                      <span>Log Out</span>
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <div className="flex items-center space-x-2">
                <Link to="/login">
                  <button className="px-4 py-2 text-xs font-bold text-neutral-800 bg-white border border-neutral-200/90 rounded-xl hover:bg-neutral-50 hover:border-neutral-300 shadow-2xs hover:shadow-subtle active:translate-y-0.5 transition-all">
                    Login
                  </button>
                </Link>
                <Link to="/signup">
                  <button className="px-4 py-2 text-xs font-bold text-white bg-brand-pink hover:bg-brand-pink-hover rounded-xl shadow-3d-button-pink hover:shadow-3d-pink active:translate-y-0.5 transition-all">
                    Sign Up
                  </button>
                </Link>
              </div>
            )}
          </div>

          {/* Mobile menu trigger */}
          <div className="md:hidden flex items-center space-x-1">
            <button
              type="button"
              onClick={() => setIsSearchOpen(true)}
              className="p-2 text-gray-700 hover:bg-gray-100 rounded-xl cursor-pointer"
              title="Search Opportunities & Talent"
            >
              <Search className="w-5 h-5" />
            </button>

            <button
              type="button"
              onClick={() => setIsNotificationsOpen((prev) => !prev)}
              className="p-2 text-gray-700 hover:bg-gray-100 rounded-xl relative cursor-pointer"
              title="Notifications"
            >
              <Bell className="w-5 h-5" />
              {unreadCount > 0 && (
                <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-brand-pink rounded-full ring-2 ring-white" />
              )}
            </button>

            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2 rounded-xl text-gray-800 hover:bg-gray-100 cursor-pointer"
              aria-label="Toggle menu"
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Drawer */}
      {mobileMenuOpen && (
        <div className="md:hidden border-b border-gray-100 bg-white px-4 pt-3 pb-6 space-y-3">
          <nav className="flex flex-col space-y-1">
            {navLinks.map((link) => (
              <Link
                key={link.path}
                to={link.path}
                onClick={() => setMobileMenuOpen(false)}
                className={`px-3 py-2.5 rounded-xl text-sm font-medium ${
                  location.pathname === link.path
                    ? 'bg-pink-50 text-brand-pink font-bold'
                    : 'text-gray-700 hover:bg-gray-50'
                }`}
              >
                {link.label}
              </Link>
            ))}
          </nav>
        </div>
      )}

      {/* Global Spotlight Search Modal */}
      <GlobalSearchModal
        isOpen={isSearchOpen}
        onClose={() => setIsSearchOpen(false)}
      />
    </header>
  );
};

export default PublicNavbar;
