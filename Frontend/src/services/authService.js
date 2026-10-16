/**
 * Mock Auth Service for StarCast frontend demo
 *
 * Frontend Demo Mode: Passwords are not persisted in plaintext.
 * Real authentication, hashing, email verification, and session tokens
 * require backend implementation.
 */

const CURRENT_USER_KEY = 'starcast_user';

export const DEMO_USERS = {
  candidate: {
    id: 'cand-1',
    fullName: 'Sophia Bennett',
    email: 'sarah@starcast.com',
    phoneNumber: '+91 98765 43210',
    dateOfBirth: '2001-04-15',
    location: 'Mumbai, India',
    role: 'candidate',
    avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=400&q=80',
  },
  admin: {
    id: 'admin-1',
    fullName: 'Audrey Miller (Admin)',
    email: 'admin@starcast.com',
    phoneNumber: '+91 98765 00000',
    dateOfBirth: '1992-08-20',
    location: 'Mumbai, India',
    role: 'admin',
    avatar: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&w=400&q=80',
  },
};

export const authService = {
  /**
   * Retrieves currently logged in user from localStorage.
   * Returns null if unauthenticated.
   */
  getCurrentUser: () => {
    try {
      const stored = localStorage.getItem(CURRENT_USER_KEY);
      return stored ? JSON.parse(stored) : null;
    } catch {
      return null;
    }
  },

  /**
   * Demo login:
   * Recognizes admin accounts (containing 'admin' or admin@starcast.com)
   * Otherwise provisions a candidate session.
   */
  login: async (email, _password) => {
    const normalizedEmail = (email || '').trim().toLowerCase();
    const isAdmin = normalizedEmail.includes('admin');
    const baseUser = isAdmin ? DEMO_USERS.admin : DEMO_USERS.candidate;

    const user = {
      ...baseUser,
      email: normalizedEmail,
      fullName: isAdmin ? 'Audrey Miller (Admin)' : (baseUser.fullName || 'Sophia Bennett'),
    };

    localStorage.setItem(CURRENT_USER_KEY, JSON.stringify(user));
    return user;
  },

  /**
   * Demo registration:
   * Accepts candidate profile parameters and stores user session.
   */
  signUp: async (userData) => {
    const role = userData.role || 'candidate';
    const user = {
      id: `${role === 'admin' ? 'admin' : 'cand'}-${Date.now()}`,
      fullName: userData.fullName,
      email: (userData.email || '').trim().toLowerCase(),
      phoneNumber: userData.phoneNumber,
      dateOfBirth: userData.dateOfBirth,
      location: userData.location,
      role: role,
      avatar: role === 'admin'
        ? 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&w=400&q=80'
        : 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=400&q=80',
      createdAt: new Date().toISOString(),
    };

    localStorage.setItem(CURRENT_USER_KEY, JSON.stringify(user));
    return user;
  },

  /**
   * Demo logout:
   * Clears the user session from storage.
   */
  logout: async () => {
    localStorage.removeItem(CURRENT_USER_KEY);
    return true;
  },
};
