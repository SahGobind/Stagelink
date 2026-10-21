import React from 'react';
import { Link } from 'react-router-dom';
import { ShieldAlert, Home, ShieldCheck } from 'lucide-react';
import Button from '../../components/common/Button';
import { authService } from '../../services/authService';

const UnauthorizedPage = () => {
  return (
    <div className="min-h-[80vh] flex items-center justify-center bg-white px-4">
      <div className="text-center space-y-6 max-w-lg">
        <div className="w-16 h-16 rounded-3xl bg-red-50 flex items-center justify-center text-red-500 mx-auto">
          <ShieldAlert className="w-8 h-8" />
        </div>

        <div className="space-y-2">
          <h1 className="text-4xl font-bold font-serif text-brand-navy">Access Restricted</h1>
          <p className="text-sm text-gray-500 leading-relaxed">
            You do not possess the appropriate studio permissions or credentials to view this area.
          </p>
        </div>

        <div className="flex flex-wrap items-center justify-center gap-3 pt-2">
          <Link to="/" className="w-full sm:w-auto">
            <Button variant="secondary" className="w-full sm:w-auto space-x-2">
              <Home className="w-4 h-4" />
              <span>Home</span>
            </Button>
          </Link>
          <Link to="/opportunities" className="w-full sm:w-auto">
            <Button variant="secondary" className="w-full sm:w-auto space-x-2">
              <span>View Casting Calls</span>
            </Button>
          </Link>
          <button
            type="button"
            onClick={() => {
              authService.ensureOperationsSession();
              window.location.href = '/admin/operations/support';
            }}
            className="w-full sm:w-auto px-4 py-2 bg-indigo-950 hover:bg-neutral-800 text-white font-bold text-xs rounded-xl transition-colors cursor-pointer flex items-center justify-center gap-1.5 shadow-sm"
          >
            <ShieldCheck className="w-4 h-4 text-indigo-300" />
            <span>Switch to Operations Desk Mode</span>
          </button>
          <button
            type="button"
            onClick={() => {
              authService.ensureRecruiterSession();
              window.location.href = '/admin/dashboard';
            }}
            className="w-full sm:w-auto px-4 py-2 bg-brand-pink hover:bg-rose-700 text-white font-bold text-xs rounded-xl transition-colors cursor-pointer"
          >
            Switch to Studio / Recruiter Mode
          </button>
        </div>
      </div>
    </div>
  );
};

export default UnauthorizedPage;
