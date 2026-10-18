import React from 'react';
import { Link } from 'react-router-dom';
import { Sparkles, Home, ArrowLeft, LogIn } from 'lucide-react';
import Button from '../../components/common/Button';
import { useAuth } from '../../context/AuthContext';

const NotFoundPage = () => {
  const { isAuthenticated } = useAuth();
  return (
    <div className="min-h-[80vh] flex items-center justify-center bg-white px-4">
      <div className="text-center space-y-6 max-w-md">
        <div className="w-16 h-16 rounded-3xl bg-brand-pink-light flex items-center justify-center text-brand-pink mx-auto">
          <Sparkles className="w-8 h-8" />
        </div>

        <div className="space-y-2">
          <h1 className="text-6xl font-bold font-serif text-brand-navy">404</h1>
          <h2 className="text-xl font-bold text-brand-navy font-serif">Scene Not Found</h2>
          <p className="text-sm text-gray-500 leading-relaxed">
            The casting call or page you're searching for might have wrapped production or been relocated.
          </p>
        </div>

        <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2">
          <Link to="/" className="w-full sm:w-auto">
            <Button className="w-full sm:w-auto space-x-2">
              <Home className="w-4 h-4" />
              <span>Back to StageLink Home</span>
            </Button>
          </Link>
          {isAuthenticated ? (
            <Link to="/opportunities" className="w-full sm:w-auto">
              <Button variant="secondary" className="w-full sm:w-auto space-x-2">
                <ArrowLeft className="w-4 h-4" />
                <span>Browse Castings</span>
              </Button>
            </Link>
          ) : (
            <Link to="/login" className="w-full sm:w-auto">
              <Button variant="secondary" className="w-full sm:w-auto space-x-2">
                <LogIn className="w-4 h-4" />
                <span>Log In</span>
              </Button>
            </Link>
          )}
        </div>
      </div>
    </div>
  );
};

export default NotFoundPage;
