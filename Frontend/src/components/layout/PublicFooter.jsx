import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

const PublicFooter = () => {
  const { isAuthenticated } = useAuth();
  const [email, setEmail] = useState('');
  const [subscribed, setSubscribed] = useState(false);

  const handleSubscribe = (e) => {
    e.preventDefault();
    if (!email.trim() || !email.includes('@')) return;
    setSubscribed(true);
  };

  return (
    <footer className="bg-[#0B0C0E] text-white pt-10 pb-6 border-t border-neutral-800/80 relative overflow-hidden">
      {/* Subtle top ambient specular illumination line */}
      <div className="absolute top-0 inset-x-0 h-px bg-gradient-to-r from-transparent via-[#FA5A36]/40 to-transparent pointer-events-none" />
      <div className="absolute top-0 right-1/4 w-80 h-80 bg-[#FA5A36]/5 rounded-full blur-3xl pointer-events-none" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-8 pb-8 border-b border-neutral-800/80">
          {/* Col 1: Brand (Span 2) */}
          <div className="space-y-3 lg:col-span-2">
            <Link to="/" className="inline-flex items-center gap-2.5 group focus-visible:outline-none">
              <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-[#FA5A36] to-[#FF7043] flex items-center justify-center font-bold text-white text-base shadow-md shadow-[#FA5A36]/20 group-hover:scale-105 transition-transform">
                S
              </div>
              <span className="text-xl font-bold tracking-tight text-white group-hover:text-neutral-100 transition-colors">
                StageLink
              </span>
            </Link>

            <p className="text-xs text-neutral-400 leading-relaxed max-w-sm">
              Connecting talented performers directly with visionary directors, production houses, and casting agencies worldwide.
            </p>

            <div className="flex items-center gap-3 pt-1">
              <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-neutral-900 border border-neutral-800 text-[10px] font-medium text-neutral-300">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                Live Casting Network
              </span>
            </div>

            {/* Social Links */}
            <div className="flex items-center gap-2 pt-1">
              {/* Instagram */}
              <a
                href="https://instagram.com"
                target="_blank"
                rel="noopener noreferrer"
                aria-label="Instagram"
                className="w-7 h-7 rounded-lg bg-neutral-900 border border-neutral-800 text-neutral-400 hover:text-[#FA5A36] hover:border-[#FA5A36]/40 transition-all flex items-center justify-center"
              >
                <svg className="w-3.5 h-3.5 fill-currentColor" viewBox="0 0 24 24">
                  <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z" />
                </svg>
              </a>

              {/* YouTube */}
              <a
                href="https://youtube.com"
                target="_blank"
                rel="noopener noreferrer"
                aria-label="YouTube"
                className="w-7 h-7 rounded-lg bg-neutral-900 border border-neutral-800 text-neutral-400 hover:text-[#FA5A36] hover:border-[#FA5A36]/40 transition-all flex items-center justify-center"
              >
                <svg className="w-3.5 h-3.5 fill-currentColor" viewBox="0 0 24 24">
                  <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z" />
                </svg>
              </a>

              {/* Twitter / X */}
              <a
                href="https://twitter.com"
                target="_blank"
                rel="noopener noreferrer"
                aria-label="Twitter X"
                className="w-7 h-7 rounded-lg bg-neutral-900 border border-neutral-800 text-neutral-400 hover:text-[#FA5A36] hover:border-[#FA5A36]/40 transition-all flex items-center justify-center"
              >
                <svg className="w-3 h-3 fill-currentColor" viewBox="0 0 24 24">
                  <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
                </svg>
              </a>

              {/* LinkedIn */}
              <a
                href="https://linkedin.com"
                target="_blank"
                rel="noopener noreferrer"
                aria-label="LinkedIn"
                className="w-7 h-7 rounded-lg bg-neutral-900 border border-neutral-800 text-neutral-400 hover:text-[#FA5A36] hover:border-[#FA5A36]/40 transition-all flex items-center justify-center"
              >
                <svg className="w-3 h-3 fill-currentColor" viewBox="0 0 24 24">
                  <path d="M19 0h-14c-2.761 0-5 2.239-5 5v14c0 2.761 2.239 5 5 5h14c2.762 0 5-2.239 5-5v-14c0-2.761-2.238-5-5-5zm-11 19h-3v-11h3v11zm-1.5-12.268c-.966 0-1.75-.79-1.75-1.764s.784-1.764 1.75-1.764 1.75.79 1.75 1.764-.783 1.764-1.75 1.764zm13.5 12.268h-3v-5.604c0-3.368-4-3.113-4 0v5.604h-3v-11h3v1.765c1.396-2.586 7-2.777 7 2.476v6.759z" />
                </svg>
              </a>
            </div>
          </div>

          {/* Col 2: Quick Links */}
          <div>
            <h4 className="text-xs font-bold uppercase tracking-wider text-neutral-300 mb-3">Quick Links</h4>
            <ul className="space-y-2 text-xs text-neutral-400">
              <li><Link to="/" className="hover:text-[#FA5A36] transition-colors">Home</Link></li>
              {isAuthenticated && (
                <li><Link to="/opportunities" className="hover:text-[#FA5A36] transition-colors">Opportunities</Link></li>
              )}
              <li><Link to="/about" className="hover:text-[#FA5A36] transition-colors">About</Link></li>
              <li><Link to="/how-it-works" className="hover:text-[#FA5A36] transition-colors">How It Works</Link></li>
              <li><Link to="/contact" className="hover:text-[#FA5A36] transition-colors">Contact</Link></li>
            </ul>
          </div>

          {/* Col 3: For Artists */}
          <div>
            <h4 className="text-xs font-bold uppercase tracking-wider text-neutral-300 mb-3">For Artists</h4>
            <ul className="space-y-2 text-xs text-neutral-400">
              <li><Link to="/signup?redirect=/candidate/profile/setup" className="hover:text-[#FA5A36] transition-colors">Create Profile</Link></li>
              {isAuthenticated && (
                <li><Link to="/opportunities" className="hover:text-[#FA5A36] transition-colors">Browse Opportunities</Link></li>
              )}
              <li><Link to="/about" className="hover:text-[#FA5A36] transition-colors">Success Stories</Link></li>
              <li><Link to="/contact" className="hover:text-[#FA5A36] transition-colors">Help Center</Link></li>
            </ul>
          </div>

          {/* Col 4: Newsletter */}
          <div>
            <h4 className="text-xs font-bold uppercase tracking-wider text-neutral-300 mb-3">Newsletter</h4>
            <p className="text-xs text-neutral-400 mb-3">Get the latest casting opportunities straight to your inbox.</p>
            {subscribed ? (
              <div className="px-3.5 py-2.5 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs">
                ✓ Subscribed! You'll receive latest casting updates.
              </div>
            ) : (
              <form onSubmit={handleSubscribe} className="space-y-2">
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="Enter your email"
                  className="w-full px-4 py-2 bg-neutral-900 border border-neutral-800 rounded-full text-xs text-white placeholder-neutral-500 focus:outline-none focus:border-[#FA5A36] focus:ring-1 focus:ring-[#FA5A36]/30 transition-all"
                />
                <button
                  type="submit"
                  className="w-full bg-[#FA5A36] hover:bg-[#E64825] text-white py-2 rounded-full text-xs font-bold transition-all shadow-md active:translate-y-0.5 cursor-pointer"
                >
                  Subscribe
                </button>
              </form>
            )}
          </div>
        </div>

        {/* Bottom copyright row - Centered in middle */}
        <div className="pt-6 flex flex-wrap items-center justify-center text-[11px] text-neutral-400 gap-x-4 gap-y-2 text-center">
          <p>© 2026 StageLink. All rights reserved.</p>
          <span className="text-neutral-700">•</span>
          <p className="text-neutral-500">Connecting talent with global productions.</p>
          <span className="text-neutral-700">•</span>
          <a href="#" className="hover:text-[#FA5A36] transition-colors">Terms & Conditions</a>
          <span className="text-neutral-700">•</span>
          <a href="#" className="hover:text-[#FA5A36] transition-colors">Privacy Policy</a>
        </div>
      </div>
    </footer>
  );
};

export default PublicFooter;
