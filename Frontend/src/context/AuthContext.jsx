import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { authService, DEFAULT_ROLE_PERMISSIONS } from '../services/authService';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(() => authService.getCurrentUser());
  const [permissions, setPermissions] = useState(() => {
    const u = authService.getCurrentUser();
    const r = u?.role || 'user';
    return DEFAULT_ROLE_PERMISSIONS[r] || [];
  });
  const [loading, setLoading] = useState(false);

  // Sync permissions with backend
  const refreshPermissions = useCallback(async () => {
    if (!user) {
      setPermissions([]);
      return [];
    }
    try {
      const data = await authService.fetchPermissions();
      if (data && Array.isArray(data.permissions)) {
        setPermissions(data.permissions);
        return data.permissions;
      }
    } catch {
      // Fallback
    }
    const fallbackPerms = DEFAULT_ROLE_PERMISSIONS[user.role] || DEFAULT_ROLE_PERMISSIONS.user || [];
    setPermissions(fallbackPerms);
    return fallbackPerms;
  }, [user]);

  useEffect(() => {
    refreshPermissions();
  }, [user, refreshPermissions]);

  const login = async (email, password) => {
    setLoading(true);
    try {
      const loggedUser = await authService.login(email, password);
      setUser(loggedUser);
      // Immediately calculate baseline permissions for fast response
      const fallbackPerms = DEFAULT_ROLE_PERMISSIONS[loggedUser?.role] || [];
      setPermissions(fallbackPerms);
      // Then refresh authoritative permissions asynchronously
      authService.fetchPermissions().then((data) => {
        if (data && Array.isArray(data.permissions)) {
          setPermissions(data.permissions);
        }
      }).catch(() => {});
      return loggedUser;
    } finally {
      setLoading(false);
    }
  };

  const signUp = async (userData) => {
    const newUser = await authService.signUp(userData);
    setUser(newUser);
    return newUser;
  };

  const register = async (userData) => {
    return await authService.register(userData);
  };

  const logout = async () => {
    await authService.logout();
    setUser(null);
    setPermissions([]);
  };

  const setRecruiterSession = (companyData = {}) => {
    const recUser = authService.ensureRecruiterSession(companyData);
    setUser(recUser);
    return recUser;
  };

  const setOperationsSession = () => {
    const opsUser = authService.ensureOperationsSession();
    setUser(opsUser);
    return opsUser;
  };

  const updateUser = (updates) => {
    const updated = authService.updateCurrentUser(updates);
    if (updated) {
      setUser((prev) => ({ ...prev, ...updated }));
    }
    return updated;
  };

  // Permission evaluation helpers
  const hasPermission = (permission) => {
    return authService.hasPermission(user, permission, permissions);
  };

  const hasAnyPermission = (perms = []) => {
    return authService.hasAnyPermission(user, perms, permissions);
  };

  const hasAllPermissions = (perms = []) => {
    return authService.hasAllPermissions(user, perms, permissions);
  };

  const isSuperAdmin = authService.isSuperAdmin(user);
  const isAdmin = authService.isAdmin(user);

  const value = {
    user,
    loading,
    permissions,
    refreshPermissions,
    isAuthenticated: !!user,
    role: user?.role || 'guest',
    hasPermission,
    hasAnyPermission,
    hasAllPermissions,
    isSuperAdmin,
    isAdmin,
    login,
    signUp,
    register,
    logout,
    updateUser,
    setRecruiterSession,
    setOperationsSession,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

