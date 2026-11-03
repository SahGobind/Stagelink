import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import LoadingSpinner from '../components/common/LoadingSpinner';

const ProtectedRoute = ({ children, redirectTo }) => {
  const { isAuthenticated, user, loading } = useAuth();
  const location = useLocation();

  if (loading) {
    return <LoadingSpinner message="Checking authorization..." className="min-h-screen" />;
  }

  if (!isAuthenticated || !user) {
    const target = redirectTo || (location.pathname.startsWith('/admin') ? '/admin' : '/login');
    return <Navigate to={target} state={{ from: location }} replace />;
  }

  return children;
};

export default ProtectedRoute;

