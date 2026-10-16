import React from 'react';
import { Link } from 'react-router-dom';
import { ShieldAlert, Home, LogIn } from 'lucide-react';
import Button from '../../components/common/Button';

const UnauthorizedPage = () => {
  return (
    <div className="min-h-[80vh] flex items-center justify-center bg-white px-4">
      <div className="text-center space-y-6 max-w-md">
        <div className="w-16 h-16 rounded-3xl bg-red-50 flex items-center justify-center text-red-500 mx-auto">
          <ShieldAlert className="w-8 h-8" />
        </div>

        <div className="space-y-2">
          <h1 className="text-4xl font-bold font-serif text-brand-navy">Access Restricted</h1>
          <p className="text-sm text-gray-500 leading-relaxed">
            You do not possess the appropriate studio permissions or credentials to view this area.
          </p>
        </div>

        <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2">
          <Link to="/" className="w-full sm:w-auto">
            <Button variant="secondary" className="w-full sm:w-auto space-x-2">
              <Home className="w-4 h-4" />
              <span>Home</span>
            </Button>
          </Link>
          <Link to="/login" className="w-full sm:w-auto">
            <Button className="w-full sm:w-auto space-x-2">
              <LogIn className="w-4 h-4" />
              <span>Sign In with Different Account</span>
            </Button>
          </Link>
        </div>
      </div>
    </div>
  );
};

export default UnauthorizedPage;
