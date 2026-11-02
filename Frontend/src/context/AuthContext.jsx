import React, { createContext, useContext, useState, useEffect, useCallback, useMemo } from 'react';
import { authService, DEFAULT_ROLE_PERMISSIONS } from '../services/authService';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(() => authService.getCurrentUser());
  const [permissions, setPermissions] = useState(() => {
    const initialUser = authService.getCurrentUser();
    if (!initialUser) return [];
    const r = initialUser.role || 'user';
    return DEFAULT_ROLE_PERMISSIONS[r] || DEFAULT_ROLE_PERMISSIONS.user || [];
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
    let isSubscribed = true;
    if (!user) {
      return;
    }
    authService
      .fetchPermissions()
      .then((data) => {
        if (isSubscribed && data && Array.isArray(data.permissions)) {
          setPermissions(data.permissions);
        }
      })
      .catch(() => {
        if (isSubscribed) {
          const fallbackPerms =
            DEFAULT_ROLE_PERMISSIONS[user.role] || DEFAULT_ROLE_PERMISSIONS.user || [];
          setPermissions(fallbackPerms);
        }
      });

    return () => {
      isSubscribed = false;
    };
  }, [user]);

  const login = useCallback(async (email, password) => {
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
      }).catch(() => { });
      return loggedUser;
    } finally {
      setLoading(false);
    }
  }, []);

  const signUp = useCallback(async (userData) => {
    const newUser = await authService.signUp(userData);
    setUser(newUser);
    return newUser;
  }, []);

  const register = useCallback(async (userData) => {
    return await authService.register(userData);
  }, []);

  const logout = useCallback(async () => {
    await authService.logout();
    setUser(null);
    setPermissions([]);
  }, []);

  const setRecruiterSession = useCallback((companyData = {}) => {
    const recUser = authService.ensureRecruiterSession(companyData);
    setUser(recUser);
    return recUser;
  }, []);

  const setOperationsSession = useCallback(() => {
    const opsUser = authService.ensureOperationsSession();
    setUser(opsUser);
    return opsUser;
  }, []);

  const updateUser = useCallback((updates) => {
    const updated = authService.updateCurrentUser(updates);
    if (updated) {
      setUser((prev) => ({ ...prev, ...updated }));
    }
    return updated;
  }, []);

  // Permission evaluation helpers
  const hasPermission = useCallback((permission) => {
    return authService.hasPermission(user, permission, permissions);
  }, [user, permissions]);

  const hasAnyPermission = useCallback((perms = []) => {
    return authService.hasAnyPermission(user, perms, permissions);
  }, [user, permissions]);

  const hasAllPermissions = useCallback((perms = []) => {
    return authService.hasAllPermissions(user, perms, permissions);
  }, [user, permissions]);

  const isSuperAdmin = useMemo(() => authService.isSuperAdmin(user), [user]);
  const isAdmin = useMemo(() => authService.isAdmin(user), [user]);
  const role = useMemo(() => user?.role || 'guest', [user?.role]);
  const isAuthenticated = useMemo(() => !!user, [user]);

  const value = useMemo(
    () => ({
      user,
      loading,
      permissions,
      refreshPermissions,
      isAuthenticated,
      role,
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
    }),
    [
      user,
      loading,
      permissions,
      refreshPermissions,
      isAuthenticated,
      role,
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
    ]
  );

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

