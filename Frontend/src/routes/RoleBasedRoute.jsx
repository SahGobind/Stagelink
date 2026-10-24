import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import LoadingSpinner from '../components/common/LoadingSpinner';

const RoleBasedRoute = ({ allowedRoles = [], children }) => {
  const { user, role, loading, isAuthenticated } = useAuth();
  const location = useLocation();

  if (loading) {
    return <LoadingSpinner message="Checking permissions..." className="min-h-screen" />;
  }

  if (!isAuthenticated || !user) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  const currentRole = user?.role || role || 'guest';

  // Role validation
  if (allowedRoles.length > 0 && !allowedRoles.includes(currentRole)) {
    // Role-isolated redirects
    if (currentRole === 'candidate') {
      return <Navigate to="/candidate/dashboard" replace />;
    }
    if (currentRole === 'recruiter') {
      return <Navigate to="/admin/dashboard" replace />;
    }
    if (currentRole === 'operations') {
      return <Navigate to="/admin/operations/support" replace />;
    }
    return <Navigate to="/unauthorized" replace />;
  }

  return children;
};

export default RoleBasedRoute;


