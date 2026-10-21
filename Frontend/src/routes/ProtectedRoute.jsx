import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import LoadingSpinner from '../components/common/LoadingSpinner';
import { hasCompletedPostingPayment, getAllCustomOpportunities } from '../utils/paymentAccess';
import { authService } from '../services/authService';

const ProtectedRoute = ({ children }) => {
  const { isAuthenticated, loading } = useAuth();
  const location = useLocation();

  if (loading) {
    return <LoadingSpinner message="Checking authorization..." className="min-h-screen" />;
  }

  // If user has paid for posting or created opportunities, ensure recruiter session
  if (!isAuthenticated && (hasCompletedPostingPayment() || getAllCustomOpportunities().length > 0)) {
    authService.ensureRecruiterSession();
    return children;
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  return children;
};

export default ProtectedRoute;
