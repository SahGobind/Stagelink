import React, { createContext, useContext, useState } from 'react';
import { authService } from '../services/authService';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(() => authService.getCurrentUser());
  const [loading] = useState(false);

  const login = async (email, password) => {
    const loggedUser = await authService.login(email, password);
    setUser(loggedUser);
    return loggedUser;
  };

  const signUp = async (userData) => {
    const newUser = await authService.signUp(userData);
    setUser(newUser);
    return newUser;
  };

  const logout = async () => {
    await authService.logout();
    setUser(null);
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

  const value = {
    user,
    loading,
    isAuthenticated: !!user,
    role: user?.role || 'guest',
    login,
    signUp,
    logout,
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
export { AuthContext };
