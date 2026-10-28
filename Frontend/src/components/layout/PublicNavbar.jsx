import React, { useState, useEffect } from 'react';
import { Link, NavLink, useLocation } from 'react-router-dom';
import {
  Star,
  Menu,
  X,
  LogOut,
  ChevronDown,
  Briefcase,
  Settings,
  ArrowUpRight,
  User,
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import GlobalSearchModal from '../common/GlobalSearchModal';

const PublicNavbar = () => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const [isSearchOpen, setIsSearchOpen] = useState(false);

  const location = useLocation();
  const { isAuthenticated, user, logout } = useAuth();

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

  const isRecruiter =
    isAuthenticated &&
    (user?.role === 'recruiter' ||
      user?.role === 'admin' ||
      user?.role === 'super_admin');

  const navLinks = [
    { label: 'Casting Calls', path: '/opportunities' },
    { label: 'About', path: '/about' },
    { label: 'How it works', path: '/how-it-works' },
  ];

  return (
    <>
      <header className="fixed top-0 left-0 right-0 z-50 w-full bg-[#111214]/90 backdrop-blur-xl border-b border-neutral-800/80 shadow-3d-subtle transition-all duration-300">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Brand Logo with Orange S Emblem matching Screenshot */}
          <Link to="/" className="flex items-center space-x-2.5 group focus-visible:outline-none">
            <div className="w-8 h-8 rounded-xl bg-[#FA5A36] flex items-center justify-center text-white font-black text-base shadow-md shadow-[#FA5A36]/30 group-hover:scale-105 transition-transform duration-200">
              <span>S</span>
            </div>
            <span className="text-xl sm:text-2xl font-bold font-sans tracking-tight text-white">
              StageLink
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
                  className={`text-xs sm:text-sm font-medium transition-all relative px-3.5 py-1.5 rounded-full ${
                    isActive
                      ? 'text-white font-semibold bg-neutral-800/80'
                      : 'text-neutral-300 hover:text-white hover:bg-neutral-800/40'
                  }`}
                >
                  {link.label}
                  {isActive && (
                    <span className="absolute bottom-0 left-3 right-3 h-0.5 bg-[#FA5A36] rounded-full shadow-xs" />
                  )}
                </NavLink>
              );
            })}
          </nav>

          {/* Desktop Right Actions */}
          <div className="hidden md:flex items-center space-x-2.5">
            {/* User Profile / Production House Dropdown */}
            {isAuthenticated ? (
              <div className="relative">
                <button
                  type="button"
                  onClick={() => setUserMenuOpen(!userMenuOpen)}
                  className="flex items-center gap-2.5 p-1.5 rounded-2xl hover:bg-neutral-800/60 border border-transparent hover:border-neutral-700/80 transition-all text-left shadow-2xs hover:shadow-xs cursor-pointer"
                >
                  <img
                    src={
                      user?.avatar ||
                      'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&w=400&q=80'
                    }
                    alt={isRecruiter ? (user?.companyName || user?.fullName || 'Production House') : (user?.fullName || 'Candidate')}
                    className="w-8 h-8 rounded-full object-cover border border-neutral-700 shadow-2xs"
                  />
                  <div className="hidden lg:block text-left">
                    <p className="text-xs font-bold text-white leading-tight">
                      {isRecruiter ? (user?.companyName || user?.fullName || 'Production House') : (user?.fullName || 'Candidate')}
                    </p>
                    <p className="text-[10px] text-neutral-400 font-medium">
                      {isRecruiter ? 'Casting Director' : 'Candidate'}
                    </p>
                  </div>
                  <ChevronDown className="w-3.5 h-3.5 text-neutral-400 hidden lg:block" />
                </button>

                {userMenuOpen && (
                  <div
                    className="absolute right-0 mt-2 w-56 bg-[#18191C]/95 backdrop-blur-md rounded-2xl shadow-3d-floating border border-neutral-800 py-2 z-50 text-xs animate-in fade-in zoom-in-95 specular-top"
                    onClick={() => setUserMenuOpen(false)}
                  >
                    <Link
                      to={isRecruiter ? '/admin/dashboard' : '/candidate/dashboard'}
                      className="flex items-center gap-2.5 px-4 py-2 hover:bg-neutral-800 text-neutral-200 font-semibold transition-colors"
                    >
                      <Briefcase className="w-4 h-4 text-neutral-400" />
                      <span>Dashboard</span>
                    </Link>
                    {isRecruiter ? (
                      <>
                        <Link
                          to="/admin/opportunities"
                          className="flex items-center gap-2.5 px-4 py-2 hover:bg-neutral-800 text-neutral-200 font-semibold transition-colors"
                        >
                          <Star className="w-4 h-4 text-neutral-400" />
                          <span>My Casting Posts</span>
                        </Link>
                        <Link
                          to="/admin/saved-talent"
                          className="flex items-center gap-2.5 px-4 py-2 hover:bg-neutral-800 text-neutral-200 font-semibold transition-colors"
                        >
                          <Briefcase className="w-4 h-4 text-[#FA5A36]" />
                          <span>Saved Talent Roster</span>
                        </Link>
                        <Link
                          to="/post-job"
                          className="flex items-center gap-2.5 px-4 py-2 hover:bg-[#FA5A36]/10 text-[#FA5A36] font-bold transition-colors"
                        >
                          <Briefcase className="w-4 h-4" />
                          <span>Post New Casting</span>
                        </Link>
                      </>
                    ) : (
                      <>
                        <Link
                          to="/candidate/profile"
                          className="flex items-center gap-2.5 px-4 py-2 hover:bg-neutral-800 text-neutral-200 font-semibold transition-colors"
                        >
                          <User className="w-4 h-4 text-neutral-400" />
                          <span>My Profile</span>
                        </Link>
                        <Link
                          to="/candidate/applications"
                          className="flex items-center gap-2.5 px-4 py-2 hover:bg-neutral-800 text-neutral-200 font-semibold transition-colors"
                        >
                          <Star className="w-4 h-4 text-neutral-400" />
                          <span>My Applications</span>
                        </Link>
                      </>
                    )}
                    <hr className="my-1 border-neutral-800" />
                    <button
                      onClick={logout}
                      className="w-full flex items-center gap-2.5 px-4 py-2 hover:bg-red-500/10 text-red-400 font-semibold text-left transition-colors cursor-pointer"
                    >
                      <LogOut className="w-4 h-4" />
                      <span>Log Out</span>
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <div className="flex items-center space-x-3">
                <Link
                  to="/login"
                  className="px-3.5 py-2 text-xs sm:text-sm font-medium text-neutral-300 hover:text-white rounded-full hover:bg-neutral-800/60 transition-colors"
                >
                  Login
                </Link>
                <Link
                  to="/signup"
                  className="group relative inline-flex items-center gap-1.5 px-5 py-2 text-xs sm:text-sm font-semibold tracking-wide text-white bg-gradient-to-r from-[#FA5A36] via-[#FB6947] to-[#FA5A36] bg-[length:200%_auto] hover:bg-[position:right_center] rounded-full border border-white/25 shadow-[0_4px_16px_rgba(250,90,54,0.35)] hover:shadow-[0_6px_22px_rgba(250,90,54,0.5)] transition-all duration-300 hover:scale-[1.02] active:scale-[0.98] cursor-pointer whitespace-nowrap"
                >
                  <span>Join StageLink</span>
                  <ArrowUpRight className="w-3.5 h-3.5 transition-transform duration-200 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 shrink-0" />
                </Link>
              </div>
            )}
          </div>

          {/* Mobile menu trigger */}
          <div className="md:hidden flex items-center space-x-1">
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2 rounded-xl text-neutral-200 hover:bg-neutral-800 cursor-pointer"
              aria-label="Toggle menu"
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Drawer */}
      {mobileMenuOpen && (
        <div className="md:hidden border-b border-neutral-800 bg-[#141518] px-4 pt-3 pb-6 space-y-3">
          <nav className="flex flex-col space-y-1">
            {navLinks.map((link) => (
              <Link
                key={link.path}
                to={link.path}
                onClick={() => setMobileMenuOpen(false)}
                className={`px-3.5 py-2.5 rounded-xl text-sm font-medium ${
                  location.pathname === link.path
                    ? 'bg-[#FA5A36]/15 text-[#FA5A36] font-bold'
                    : 'text-neutral-300 hover:bg-neutral-800'
                }`}
              >
                {link.label}
              </Link>
            ))}
            {isAuthenticated ? (
              <div className="pt-3 border-t border-neutral-800 flex flex-col gap-1.5">
                <div className="px-3.5 py-1.5 bg-neutral-900/80 rounded-xl">
                  <p className="text-xs font-bold text-white">
                    {isRecruiter ? (user?.companyName || user?.fullName) : (user?.fullName || 'Candidate')}
                  </p>
                  <p className="text-[10px] text-neutral-400 font-medium">
                    {isRecruiter ? 'Casting Director' : 'Candidate'}
                  </p>
                </div>
                <Link
                  to={isRecruiter ? '/admin/dashboard' : '/candidate/dashboard'}
                  onClick={() => setMobileMenuOpen(false)}
                  className="px-3.5 py-2 text-sm text-neutral-200 hover:text-white hover:bg-neutral-800 rounded-xl"
                >
                  Dashboard
                </Link>
                {isRecruiter ? (
                  <Link
                    to="/post-job"
                    onClick={() => setMobileMenuOpen(false)}
                    className="px-3.5 py-2 text-sm text-[#FA5A36] font-semibold hover:bg-neutral-800 rounded-xl"
                  >
                    Post New Casting
                  </Link>
                ) : (
                  <Link
                    to="/candidate/profile"
                    onClick={() => setMobileMenuOpen(false)}
                    className="px-3.5 py-2 text-sm text-neutral-200 hover:text-white hover:bg-neutral-800 rounded-xl"
                  >
                    My Profile
                  </Link>
                )}
                <button
                  type="button"
                  onClick={() => {
                    setMobileMenuOpen(false);
                    logout();
                  }}
                  className="px-3.5 py-2 text-sm text-left text-red-400 hover:text-red-300 hover:bg-neutral-800 rounded-xl cursor-pointer"
                >
                  Log Out
                </button>
              </div>
            ) : (
              <div className="pt-3 border-t border-neutral-800 flex flex-col gap-2">
                <Link
                  to="/login"
                  onClick={() => setMobileMenuOpen(false)}
                  className="px-3.5 py-2 text-sm text-center text-neutral-200 hover:text-white"
                >
                  Login
                </Link>
                <Link
                  to="/signup"
                  onClick={() => setMobileMenuOpen(false)}
                  className="group w-full py-2.5 px-5 text-center text-sm font-semibold text-white bg-gradient-to-r from-[#FA5A36] to-[#E64825] rounded-full shadow-[0_4px_16px_rgba(250,90,54,0.35)] border border-white/20 flex items-center justify-center gap-1.5 active:scale-[0.98] transition-all"
                >
                  <span>Join StageLink</span>
                  <ArrowUpRight className="w-4 h-4 transition-transform duration-200 group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
                </Link>
              </div>
            )}
          </nav>
        </div>
      )}

      {/* Global Spotlight Search Modal */}
      <GlobalSearchModal
        isOpen={isSearchOpen}
        onClose={() => setIsSearchOpen(false)}
      />
      </header>
      {/* Spacer so page content never overlaps behind fixed navbar */}
      <div className="h-16 w-full shrink-0" aria-hidden="true" />
    </>
  );
};

export default PublicNavbar;
