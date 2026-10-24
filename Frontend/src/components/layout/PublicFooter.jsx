import React from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

const PublicFooter = () => {
  const { isAuthenticated } = useAuth();
  return (
    <footer className="bg-brand-navy text-white pt-16 pb-10 border-t border-gray-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-10 pb-12 border-b border-gray-800/80">
          {/* Col 1: Brand */}
          <div className="space-y-4 lg:col-span-2">
            <Link to="/" className="inline-block">
              <span className="text-2xl font-bold font-serif tracking-tight text-white">
                Stage<span className="text-brand-pink">Link</span>
              </span>
            </Link>
            <p className="text-xs text-gray-400 leading-relaxed max-w-sm">
              Connecting talented artists with real opportunities in films, web series, advertisements and more.
            </p>
          </div>

          {/* Col 2: Quick Links */}
          <div>
            <h4 className="text-xs font-bold uppercase tracking-wider text-gray-300 mb-4">Quick Links</h4>
            <ul className="space-y-2 text-xs text-gray-400">
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
            <h4 className="text-xs font-bold uppercase tracking-wider text-gray-300 mb-4">For Artists</h4>
            <ul className="space-y-2 text-xs text-gray-400">
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
            <h4 className="text-xs font-bold uppercase tracking-wider text-gray-300 mb-4">Newsletter</h4>
            <p className="text-xs text-gray-400 mb-3">Get the latest opportunities in your inbox.</p>
            <form onSubmit={(e) => e.preventDefault()} className="space-y-2">
              <input
                type="email"
                placeholder="Enter your email"
                className="w-full px-3.5 py-2.5 bg-gray-800/80 border border-gray-700 rounded-xl text-xs text-white placeholder-gray-500 focus:outline-none focus:border-brand-pink transition-colors"
              />
              <button
                type="submit"
                className="w-full bg-brand-pink hover:bg-brand-pink-hover text-white py-2.5 rounded-xl text-xs font-bold transition-colors shadow-xs"
              >
                Subscribe
              </button>
            </form>
          </div>
        </div>

        {/* Bottom copyright row */}
        <div className="pt-8 flex flex-col sm:flex-row items-center justify-between text-[11px] text-gray-500 gap-4">
          <p>© 2026 StageLink. All rights reserved.</p>
          <div className="flex flex-wrap items-center justify-center gap-x-4 gap-y-2">
            <a href="#" className="hover:text-gray-400 transition-colors">Terms & Conditions</a>
            <span className="text-gray-700">•</span>
            <a href="#" className="hover:text-gray-400 transition-colors">Privacy Policy</a>
            <span className="text-gray-700">•</span>
            <Link to="/admin/login" className="text-gray-400 hover:text-white transition-colors font-medium">
              Admin Login
            </Link>
            <span className="text-gray-700">•</span>
            <Link to="/operations/login" className="text-gray-400 hover:text-white transition-colors font-medium">
              Operation Team Login
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default PublicFooter;
