import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import LoadingSpinner from '../components/common/LoadingSpinner';

const RoleBasedRoute = ({
  allowedRoles = [],
  requiredPermissions = [],
  requireAll = true,
  children,
}) => {
  const { user, role, loading, isAuthenticated, hasPermission, hasAllPermissions, hasAnyPermission, isSuperAdmin } = useAuth();
  const location = useLocation();

  if (loading) {
    return <LoadingSpinner message="Verifying authorization..." className="min-h-screen" />;
  }

  if (!isAuthenticated || !user) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  const currentRole = user?.role || role || 'guest';

  // 1. Role validation (Super Admin has root clearance for administrative paths)
  if (allowedRoles.length > 0) {
    const roleMatches = allowedRoles.includes(currentRole) || (isSuperAdmin && allowedRoles.includes('admin'));
    if (!roleMatches) {
      if (currentRole === 'candidate' || currentRole === 'talent') {
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
  }

  // 2. Granular Permission validation (Deny by default if permission not possessed)
  if (requiredPermissions && (!isSuperAdmin)) {
    const permsList = Array.isArray(requiredPermissions) ? requiredPermissions : [requiredPermissions];
    if (permsList.length > 0) {
      const hasAccess = requireAll ? hasAllPermissions(permsList) : hasAnyPermission(permsList);
      if (!hasAccess) {
        return <Navigate to="/unauthorized" replace />;
      }
    }
  }

  return children;
};

export default RoleBasedRoute;


