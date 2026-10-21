import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import LoadingSpinner from '../components/common/LoadingSpinner';
import { hasCompletedPostingPayment, getAllCustomOpportunities } from '../utils/paymentAccess';
import { authService } from '../services/authService';

const RoleBasedRoute = ({ allowedRoles = [], children }) => {
  const { role, loading, isAuthenticated } = useAuth();

  if (loading) {
    return <LoadingSpinner message="Checking permissions..." className="min-h-screen" />;
  }

  // Development demo mode: If accessing operations area, auto-switch to operations session so developer is never blocked
  if (allowedRoles.includes('operations') && role !== 'admin' && role !== 'operations') {
    authService.ensureOperationsSession();
    return children;
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  if (allowedRoles.length > 0 && !allowedRoles.includes(role)) {
    return <Navigate to="/unauthorized" replace />;
  }

  return children;
};

export default RoleBasedRoute;

