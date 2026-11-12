import React, { useState } from 'react';
import { Link } from 'react-router-dom';

const PublicFooter = () => {
  const [email, setEmail] = useState('');
  const [subscribed, setSubscribed] = useState(false);

  const handleSubscribe = (e) => {
    e.preventDefault();
    if (!email.trim() || !email.includes('@')) return;
    setSubscribed(true);
  };

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <footer className="bg-[#0B0C0E] text-white pt-10 pb-6 border-t border-neutral-800/80 relative overflow-hidden">
      {/* Subtle top ambient specular illumination line */}
      <div className="absolute top-0 inset-x-0 h-px bg-gradient-to-r from-transparent via-[#FA5A36]/40 to-transparent pointer-events-none" />
      <div className="absolute top-0 right-1/4 w-80 h-80 bg-[#FA5A36]/5 rounded-full blur-3xl pointer-events-none" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-8 pb-8 border-b border-neutral-800/80">
          {/* Col 1: Brand & Badges & Socials (Span 2) */}
          <div className="space-y-3 lg:col-span-2">
            <Link to="/" className="inline-block group focus-visible:outline-none">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-[#FA5A36] to-[#FF7043] flex items-center justify-center font-bold text-white text-base shadow-md shadow-[#FA5A36]/30 group-hover:scale-105 transition-transform">
                  S
                </div>
                <div>
                  <span className="text-xl font-bold tracking-tight text-white group-hover:text-neutral-100 transition-colors">
                    StageLink
                  </span>
                  <div className="text-[9px] font-bold uppercase tracking-wider text-[#FA5A36] -mt-0.5">
                    AUDITION & CASTING SUITE
                  </div>
                </div>
              </div>
            </Link>

            <p className="text-xs text-neutral-400 leading-relaxed max-w-sm">
              Connecting exceptional performers directly with visionary directors, production houses, and casting agencies worldwide.
            </p>

            {/* Badges */}
            <div className="flex flex-wrap items-center gap-2.5 pt-1">
              <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-neutral-900 border border-neutral-800 text-[10px] font-medium text-neutral-300">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                Live Casting Network
              </span>
              <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-neutral-900 border border-neutral-800 text-[10px] font-medium text-neutral-300">
                <svg className="w-3 h-3 text-[#FA5A36]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                </svg>
                Protected Talent Media
              </span>
            </div>

            {/* Social Links */}
            <div className="space-y-2 pt-2">
              <div className="text-[10px] font-bold uppercase tracking-wider text-neutral-400">
                CONNECT WITH US
              </div>
              <div className="flex items-center gap-2">
                {/* Instagram */}
                <a
                  href="https://instagram.com"
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label="Instagram"
                  className="w-7 h-7 rounded-lg bg-neutral-900 border border-neutral-800 text-neutral-400 hover:text-[#FA5A36] hover:border-[#FA5A36]/40 transition-all flex items-center justify-center cursor-pointer"
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
                  className="w-7 h-7 rounded-lg bg-neutral-900 border border-neutral-800 text-neutral-400 hover:text-[#FA5A36] hover:border-[#FA5A36]/40 transition-all flex items-center justify-center cursor-pointer"
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
                  className="w-7 h-7 rounded-lg bg-neutral-900 border border-neutral-800 text-neutral-400 hover:text-[#FA5A36] hover:border-[#FA5A36]/40 transition-all flex items-center justify-center cursor-pointer"
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
                  className="w-7 h-7 rounded-lg bg-neutral-900 border border-neutral-800 text-neutral-400 hover:text-[#FA5A36] hover:border-[#FA5A36]/40 transition-all flex items-center justify-center cursor-pointer"
                >
                  <svg className="w-3 h-3 fill-currentColor" viewBox="0 0 24 24">
                    <path d="M19 0h-14c-2.761 0-5 2.239-5 5v14c0 2.761 2.239 5 5 5h14c2.762 0 5-2.239 5-5v-14c0-2.761-2.238-5-5-5zm-11 19h-3v-11h3v11zm-1.5-12.268c-.966 0-1.75-.79-1.75-1.764s.784-1.764 1.75-1.764 1.75.79 1.75 1.764-.783 1.764-1.75 1.764zm13.5 12.268h-3v-5.604c0-3.368-4-3.113-4 0v5.604h-3v-11h3v1.765c1.396-2.586 7-2.777 7 2.476v6.759z" />
                  </svg>
                </a>
              </div>
            </div>
          </div>

          {/* Col 2: Quick Links */}
          <div>
            <h4 className="text-xs font-bold uppercase tracking-wider text-neutral-300 mb-3">QUICK LINKS</h4>
            <ul className="space-y-2 text-xs text-neutral-400">
              <li><Link to="/" className="hover:text-[#FA5A36] transition-colors">Home</Link></li>
              <li><Link to="/opportunities" className="hover:text-[#FA5A36] transition-colors">Casting Calls</Link></li>
              <li><Link to="/about" className="hover:text-[#FA5A36] transition-colors">About StageLink</Link></li>
              <li><Link to="/how-it-works" className="hover:text-[#FA5A36] transition-colors">How It Works</Link></li>
              <li><Link to="/contact" className="hover:text-[#FA5A36] transition-colors">Help & Contact</Link></li>
            </ul>
          </div>

          {/* Col 3: For Artists */}
          <div>
            <h4 className="text-xs font-bold uppercase tracking-wider text-neutral-300 mb-3">FOR ARTISTS</h4>
            <ul className="space-y-2 text-xs text-neutral-400">
              <li><Link to="/signup?role=candidate&redirect=/candidate/profile/setup" className="hover:text-[#FA5A36] transition-colors">Create Profile</Link></li>
              <li><Link to="/opportunities" className="hover:text-[#FA5A36] transition-colors">Audition Feed</Link></li>
              <li><Link to="/about" className="hover:text-[#FA5A36] transition-colors">Success Stories</Link></li>
              <li><Link to="/contact" className="hover:text-[#FA5A36] transition-colors">Help Center</Link></li>
              <li><Link to="/signup?role=candidate" className="hover:text-[#FA5A36] transition-colors">Join Talent Roster</Link></li>
            </ul>
          </div>

          {/* Col 4: Newsletter Boxed Card */}
          <div className="lg:col-span-1">
            <div className="rounded-2xl bg-[#141518]/90 border border-neutral-800/80 p-4 space-y-3 shadow-xl relative overflow-hidden">
              <div className="flex items-center gap-1.5 text-neutral-200">
                <span className="text-[#FA5A36] text-xs">✨</span>
                <h4 className="text-[11px] font-bold uppercase tracking-wider text-white">
                  NEWSLETTER & CASTING ALERTS
                </h4>
              </div>

              <p className="text-[11px] text-neutral-400 leading-relaxed">
                Get the latest verified casting opportunities and audition notices straight to your inbox.
              </p>

              {subscribed ? (
                <div className="px-3 py-2 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs">
                  ✓ Subscribed! You will receive verified casting notifications.
                </div>
              ) : (
                <form onSubmit={handleSubscribe} className="space-y-2.5">
                  <div className="relative">
                    <svg className="w-3.5 h-3.5 text-neutral-500 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                    </svg>
                    <input
                      type="email"
                      required
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="Enter your email address"
                      className="w-full pl-9 pr-3 py-2 bg-neutral-900 border border-neutral-800 rounded-xl text-xs text-white placeholder-neutral-500 focus:outline-none focus:border-[#FA5A36] focus:ring-1 focus:ring-[#FA5A36]/30 transition-all"
                    />
                  </div>
                  <button
                    type="submit"
                    className="w-full bg-[#FA5A36] hover:bg-[#E64825] text-white py-2 rounded-xl text-xs font-bold transition-all shadow-md active:translate-y-0.5 cursor-pointer flex items-center justify-center gap-1.5"
                  >
                    <span>Subscribe</span>
                    <svg className="w-3.5 h-3.5 -rotate-45" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
                    </svg>
                  </button>
                </form>
              )}

              <div className="flex items-center justify-center gap-1 text-[10px] text-neutral-500 pt-0.5">
                <svg className="w-2.5 h-2.5 text-neutral-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                </svg>
                <span>No spam. Unsubscribe at any time.</span>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom copyright row with Top button */}
        <div className="pt-6 flex flex-wrap items-center justify-between text-[11px] text-neutral-400 gap-y-2">
          <div className="flex flex-wrap items-center gap-x-3 gap-y-1">
            <p>© 2026 StageLink. All rights reserved.</p>
            <span className="text-neutral-700">•</span>
            <p className="text-neutral-500">Connecting talent with global productions.</p>
          </div>
          <div className="flex items-center gap-3">
            <a href="#" className="hover:text-[#FA5A36] transition-colors">Terms & Conditions</a>
            <span className="text-neutral-700">•</span>
            <a href="#" className="hover:text-[#FA5A36] transition-colors">Privacy Policy</a>
            <span className="text-neutral-700">•</span>
            <button
              type="button"
              onClick={scrollToTop}
              className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-neutral-900 border border-neutral-800 text-neutral-300 hover:text-white hover:border-neutral-700 transition-all text-[11px] cursor-pointer shadow-xs active:scale-95"
            >
              <span>Top</span>
              <span className="text-[#FA5A36] font-bold">↑</span>
            </button>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default PublicFooter;
