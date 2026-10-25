import React from 'react';
import { useAuth } from '../../context/AuthContext';

/**
 * PermissionGate
 * Declarative component to conditionally render UI controls based on granular permissions.
 *
 * Props:
 * - permission: string (e.g. 'opportunity:create')
 * - permissions: string[] (list of permissions to check)
 * - requireAll: boolean (if true, all permissions required; if false, any permission suffices. Default: true)
 * - fallback: ReactNode (rendered if permission check fails. Default: null)
 * - children: ReactNode
 */
const PermissionGate = ({
  permission,
  permissions = [],
  requireAll = true,
  fallback = null,
  children,
}) => {
  const { hasPermission, hasAllPermissions, hasAnyPermission, isSuperAdmin } = useAuth();

  // Super Admin bypasses client-side gates (backend still enforces authoritative authorization)
  if (isSuperAdmin) {
    return <>{children}</>;
  }

  // Single permission check
  if (permission) {
    if (hasPermission(permission)) {
      return <>{children}</>;
    }
    return <>{fallback}</>;
  }

  // Multiple permissions check
  if (Array.isArray(permissions) && permissions.length > 0) {
    const passed = requireAll ? hasAllPermissions(permissions) : hasAnyPermission(permissions);
    if (passed) {
      return <>{children}</>;
    }
    return <>{fallback}</>;
  }

  // Default: if no permission specified, allow through
  return <>{children}</>;
};

export default PermissionGate;
