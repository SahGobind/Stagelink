import React from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

const PublicFooter = () => {
  const { isAuthenticated } = useAuth();
  return (
    <footer className="bg-neutral-950 text-white pt-16 pb-12 border-t border-neutral-900 relative overflow-hidden">
      {/* Subtle top ambient specular illumination line */}
      <div className="absolute top-0 inset-x-0 h-px bg-gradient-to-r from-transparent via-rose-500/40 to-transparent pointer-events-none" />
      <div className="absolute top-0 right-1/4 w-96 h-96 bg-brand-pink/5 rounded-full blur-3xl pointer-events-none" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-10 pb-12 border-b border-neutral-900">
          {/* Col 1: Brand */}
          <div className="space-y-4 lg:col-span-2">
            <Link to="/" className="inline-block group focus-visible:outline-none">
              <span className="text-2xl font-bold font-serif tracking-tight text-white group-hover:opacity-95 transition-opacity">
                Stage<span className="text-brand-pink font-serif">Link</span>
              </span>
            </Link>
            <p className="text-xs text-neutral-400 leading-relaxed max-w-sm">
              Connecting talented performers directly with visionary directors, production houses, and casting agencies worldwide.
            </p>
            <div className="pt-2 flex items-center gap-3 text-xs text-neutral-500">
              <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-neutral-900 border border-neutral-800 text-[10px] font-semibold text-neutral-400">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                Live Casting Network
              </span>
            </div>
          </div>

          {/* Col 2: Quick Links */}
          <div>
            <h4 className="text-xs font-bold uppercase tracking-wider text-neutral-300 mb-4">Quick Links</h4>
            <ul className="space-y-2.5 text-xs text-neutral-400">
              <li><Link to="/" className="hover:text-brand-pink transition-colors">Home</Link></li>
              {isAuthenticated && (
                <li><Link to="/opportunities" className="hover:text-brand-pink transition-colors">Opportunities</Link></li>
              )}
              <li><Link to="/about" className="hover:text-brand-pink transition-colors">About</Link></li>
              <li><Link to="/how-it-works" className="hover:text-brand-pink transition-colors">How It Works</Link></li>
              <li><Link to="/contact" className="hover:text-brand-pink transition-colors">Contact</Link></li>
            </ul>
          </div>

          {/* Col 3: For Artists */}
          <div>
            <h4 className="text-xs font-bold uppercase tracking-wider text-neutral-300 mb-4">For Artists</h4>
            <ul className="space-y-2.5 text-xs text-neutral-400">
              <li><Link to="/signup?redirect=/candidate/profile/setup" className="hover:text-white transition-colors">Create Profile</Link></li>
              {isAuthenticated && (
                <li><Link to="/opportunities" className="hover:text-white transition-colors">Browse Opportunities</Link></li>
              )}
              <li><Link to="/about" className="hover:text-brand-pink transition-colors">Success Stories</Link></li>
              <li><Link to="/contact" className="hover:text-brand-pink transition-colors">Help Center</Link></li>
            </ul>
          </div>

          {/* Col 4: Newsletter */}
          <div>
            <h4 className="text-xs font-bold uppercase tracking-wider text-neutral-300 mb-4">Newsletter</h4>
            <p className="text-xs text-neutral-400 mb-3">Get the latest casting opportunities straight to your inbox.</p>
            <form onSubmit={(e) => e.preventDefault()} className="space-y-2.5">
              <input
                type="email"
                placeholder="Enter your email"
                className="w-full px-3.5 py-2.5 bg-neutral-900 border border-neutral-800 rounded-xl text-xs text-white placeholder-neutral-500 focus:outline-none focus:border-brand-pink focus:ring-2 focus:ring-brand-pink/20 transition-all shadow-inner-bevel"
              />
              <button
                type="submit"
                className="w-full bg-brand-pink hover:bg-brand-pink-hover text-white py-2.5 rounded-xl text-xs font-bold transition-all shadow-3d-button-pink hover:shadow-3d-pink active:translate-y-0.5"
              >
                Subscribe
              </button>
            </form>
          </div>
        </div>

        {/* Bottom copyright row */}
        <div className="pt-8 flex flex-col sm:flex-row items-center justify-between text-[11px] text-neutral-500 gap-4">
          <p>© 2026 StageLink. All rights reserved.</p>
          <div className="flex flex-wrap items-center justify-center gap-x-4 gap-y-2">
            <a href="#" className="hover:text-neutral-400 transition-colors">Terms & Conditions</a>
            <span className="text-neutral-800">•</span>
            <a href="#" className="hover:text-neutral-400 transition-colors">Privacy Policy</a>
            <span className="text-neutral-800">•</span>
            <Link to="/admin/login" className="text-neutral-400 hover:text-white transition-colors font-medium hover:underline">
              Admin Login
            </Link>
            <span className="text-neutral-800">•</span>
            <Link to="/operations/login" className="text-neutral-400 hover:text-white transition-colors font-medium hover:underline">
              Operation Team Login
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default PublicFooter;
