import React, { useState } from 'react';
import { Link, NavLink, useLocation } from 'react-router-dom';
import {
  Star,
  Search,
  Bell,
  Menu,
  X,
  LogOut,
  ChevronDown,
  PlusCircle,
  Briefcase,
  Settings,
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

const PublicNavbar = () => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const location = useLocation();
  const { isAuthenticated, user, logout } = useAuth();

  const navLinks = [
    { label: 'Casting Calls', path: '/opportunities' },
    { label: 'Discover Talent', path: '/talent/cand-1' },
    { label: 'How It Works', path: '/how-it-works' },
    { label: 'About', path: '/about' },
  ];

  return (
    <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-gray-100">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-18">
          {/* Brand Logo with Pink Star */}
          <Link to="/" className="flex items-center space-x-2 focus-visible:outline-none">
            <Star className="w-6 h-6 text-brand-pink fill-brand-pink" />
            <span className="text-2xl font-bold font-serif tracking-tight text-gray-900">
              StarCast
            </span>
          </Link>

          {/* Desktop Nav Items */}
          <nav className="hidden md:flex items-center space-x-8">
            {navLinks.map((link) => {
              const isActive = location.pathname === link.path;
              return (
                <NavLink
                  key={link.path}
                  to={link.path}
                  className={`text-xs sm:text-sm font-semibold transition-all relative py-2 ${
                    isActive ? 'text-gray-900 font-bold' : 'text-gray-500 hover:text-gray-900'
                  }`}
                >
                  {link.label}
                  {isActive && (
                    <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-brand-pink rounded-full" />
                  )}
                </NavLink>
              );
            })}
          </nav>

          {/* Desktop Right Actions */}
          <div className="hidden md:flex items-center space-x-4">
            {/* Announce Work Action */}
            <Link
              to="/post-job"
              className="px-3.5 py-1.5 rounded-xl border border-pink-200 text-brand-pink hover:bg-pink-50 text-xs font-bold transition-colors inline-flex items-center gap-1.5"
            >
              <PlusCircle className="w-3.5 h-3.5" />
              <span>Announce Work</span>
            </Link>

            {/* Search Icon */}
            <Link
              to="/opportunities"
              className="p-2 text-gray-500 hover:text-gray-900 transition-colors rounded-xl"
              title="Search Opportunities"
            >
              <Search className="w-4 h-4" />
            </Link>

            {/* Notification Bell with Indicator */}
            <button
              type="button"
              className="p-2 text-gray-500 hover:text-gray-900 transition-colors rounded-xl relative"
              title="Notifications"
            >
              <Bell className="w-4 h-4" />
              <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-brand-pink rounded-full ring-2 ring-white" />
            </button>

            {/* User Profile / Production House Dropdown */}
            {isAuthenticated ? (
              <div className="relative">
                <button
                  type="button"
                  onClick={() => setUserMenuOpen(!userMenuOpen)}
                  className="flex items-center gap-2.5 p-1.5 rounded-2xl hover:bg-gray-50 transition-colors text-left"
                >
                  <img
                    src={
                      user?.avatar ||
                      'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&w=400&q=80'
                    }
                    alt={user?.fullName || 'Production House'}
                    className="w-8 h-8 rounded-full object-cover border border-gray-200 shadow-2xs"
                  />
                  <div className="hidden lg:block text-left">
                    <p className="text-xs font-bold text-gray-900 leading-tight">
                      {user?.companyName || user?.fullName || 'Production House'}
                    </p>
                    <p className="text-[10px] text-gray-400 font-medium">Casting Director</p>
                  </div>
                  <ChevronDown className="w-3.5 h-3.5 text-gray-400 hidden lg:block" />
                </button>

                {userMenuOpen && (
                  <div
                    className="absolute right-0 mt-2 w-52 bg-white rounded-2xl shadow-xl border border-gray-100 py-2 z-50 text-xs animate-in fade-in"
                    onClick={() => setUserMenuOpen(false)}
                  >
                    <Link
                      to={user?.role === 'admin' ? '/admin/dashboard' : '/candidate/dashboard'}
                      className="flex items-center gap-2.5 px-4 py-2 hover:bg-gray-50 text-gray-700 font-semibold"
                    >
                      <Briefcase className="w-4 h-4 text-gray-400" />
                      <span>Dashboard</span>
                    </Link>
                    <Link
                      to="/admin/opportunities"
                      className="flex items-center gap-2.5 px-4 py-2 hover:bg-gray-50 text-gray-700 font-semibold"
                    >
                      <Star className="w-4 h-4 text-gray-400" />
                      <span>My Casting Posts</span>
                    </Link>
                    <Link
                      to="/post-job"
                      className="flex items-center gap-2.5 px-4 py-2 hover:bg-gray-50 text-brand-pink font-bold"
                    >
                      <PlusCircle className="w-4 h-4" />
                      <span>Post New Casting</span>
                    </Link>
                    <hr className="my-1 border-gray-100" />
                    <button
                      onClick={logout}
                      className="w-full flex items-center gap-2.5 px-4 py-2 hover:bg-red-50 text-red-600 font-semibold text-left"
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
                  <button className="px-4 py-2 text-xs font-bold text-gray-800 bg-white border border-gray-200 rounded-xl hover:bg-gray-50 transition-colors">
                    Login
                  </button>
                </Link>
                <Link to="/signup">
                  <button className="px-4 py-2 text-xs font-bold text-white bg-brand-pink hover:bg-rose-700 rounded-xl shadow-xs transition-colors">
                    Sign Up
                  </button>
                </Link>
              </div>
            )}
          </div>

          {/* Mobile menu trigger */}
          <div className="md:hidden flex items-center space-x-2">
            <Link to="/opportunities" className="p-2 text-gray-700">
              <Search className="w-5 h-5" />
            </Link>
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2 rounded-xl text-gray-800 hover:bg-gray-100"
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
            <Link
              to="/post-job"
              onClick={() => setMobileMenuOpen(false)}
              className="px-3 py-2.5 rounded-xl text-sm font-bold text-brand-pink bg-pink-50 flex items-center gap-2"
            >
              <PlusCircle className="w-4 h-4" />
              <span>Announce Work</span>
            </Link>
          </nav>
        </div>
      )}
    </header>
  );
};

export default PublicNavbar;
