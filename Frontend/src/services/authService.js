/**
 * Mock Auth Service for StageLink frontend demo
 *
 * Frontend Demo Mode: Passwords are not persisted in plaintext.
 * Real authentication, hashing, email verification, and session tokens
 * require backend implementation.
 */

const CURRENT_USER_KEY = 'starcast_user';
const REGISTERED_ACCOUNTS_KEY = 'starcast_registered_accounts';

export const SEEDED_ACCOUNTS = [
  {
    id: 'cand-aanya',
    fullName: 'Aanya Sharma',
    email: 'aanya@stagelink.com',
    phoneNumber: '+91 98201 23456',
    dateOfBirth: '1998-03-12',
    location: 'Mumbai, India',
    role: 'candidate',
    avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=800&q=80',
    createdAt: '2026-09-15T00:00:00.000Z',
  },
  {
    id: 'cand-sophia',
    fullName: 'Sophia Bennett',
    email: 'sarah@stagelink.com',
    secondaryEmail: 'sophia@stagelink.com',
    phoneNumber: '+91 98765 43210',
    dateOfBirth: '2001-04-15',
    location: 'London, UK / Mumbai',
    role: 'candidate',
    avatar: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?auto=format&fit=crop&w=800&q=80',
    createdAt: '2026-09-20T00:00:00.000Z',
  },
  {
    id: 'cand-rohit',
    fullName: 'Rohit Verma',
    email: 'rohit@stagelink.com',
    phoneNumber: '+91 98111 87654',
    dateOfBirth: '1997-09-05',
    location: 'Delhi, India',
    role: 'candidate',
    avatar: 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?auto=format&fit=crop&w=800&q=80',
    createdAt: '2026-09-25T00:00:00.000Z',
  },
  {
    id: 'admin-1',
    fullName: 'Audrey Miller (Admin)',
    email: 'admin@stagelink.com',
    phoneNumber: '+91 98765 00000',
    dateOfBirth: '1992-08-20',
    location: 'Mumbai, India',
    role: 'admin',
    avatar: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&w=400&q=80',
    createdAt: '2026-08-01T00:00:00.000Z',
  },
];

export const DEMO_USERS = {
  candidate: SEEDED_ACCOUNTS[0],
  admin: SEEDED_ACCOUNTS[3],
};

const getStoredAccounts = () => {
  try {
    const raw = localStorage.getItem(REGISTERED_ACCOUNTS_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed) && parsed.length > 0) {
        // Merge with seed accounts to ensure default demo candidates exist
        const accountsMap = new Map();
        SEEDED_ACCOUNTS.forEach((acc) => accountsMap.set(acc.id, acc));
        parsed.forEach((acc) => accountsMap.set(acc.id, acc));
        return Array.from(accountsMap.values());
      }
    }
  } catch {
    // fallback
  }
  return SEEDED_ACCOUNTS;
};

const saveStoredAccounts = (accounts) => {
  try {
    localStorage.setItem(REGISTERED_ACCOUNTS_KEY, JSON.stringify(accounts));
  } catch {
    // ignore
  }
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
   * Returns list of known candidate accounts for demo selection.
   */
  getRegisteredCandidates: () => {
    const accounts = getStoredAccounts();
    return accounts.filter((acc) => acc.role === 'candidate');
  },

  /**
   * Demo login:
   * Matches candidate by exact email/secondaryEmail.
   * If candidate does not exist, registers them dynamically with their derived name.
   */
  login: async (email, _password) => {
    const normalizedEmail = (email || '').trim().toLowerCase();
    const isAdmin = normalizedEmail.includes('admin');

    if (isAdmin) {
      const adminUser = SEEDED_ACCOUNTS.find((a) => a.role === 'admin');
      localStorage.setItem(CURRENT_USER_KEY, JSON.stringify(adminUser));
      return adminUser;
    }

    const accounts = getStoredAccounts();
    const altEmail = normalizedEmail.includes('@stagelink.com')
      ? normalizedEmail.replace('@stagelink.com', '@starcast.com')
      : normalizedEmail.replace('@starcast.com', '@stagelink.com');
    const existing = accounts.find(
      (a) =>
        a.email?.toLowerCase() === normalizedEmail ||
        a.secondaryEmail?.toLowerCase() === normalizedEmail ||
        a.email?.toLowerCase() === altEmail ||
        a.secondaryEmail?.toLowerCase() === altEmail
    );

    if (existing) {
      localStorage.setItem(CURRENT_USER_KEY, JSON.stringify(existing));
      return existing;
    }

    // New candidate logging in for the first time with custom email:
    // Derive a clean full name (e.g. "rohit.verma@example.com" -> "Rohit Verma")
    const usernamePart = normalizedEmail.split('@')[0] || 'candidate';
    const cleanName = usernamePart
      .split(/[._-]/)
      .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
      .join(' ') || 'Candidate Performer';

    const newCandidate = {
      id: `cand-${Date.now()}`,
      fullName: cleanName,
      email: normalizedEmail,
      phoneNumber: '+91 98000 00000',
      dateOfBirth: '2000-01-01',
      location: 'Mumbai, India',
      role: 'candidate',
      avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=400&q=80',
      createdAt: new Date().toISOString(),
    };

    const updatedAccounts = [...accounts, newCandidate];
    saveStoredAccounts(updatedAccounts);
    localStorage.setItem(CURRENT_USER_KEY, JSON.stringify(newCandidate));
    return newCandidate;
  },

  /**
   * Demo registration:
   * Registers candidate with their specific name and parameters.
   */
  signUp: async (userData) => {
    const role = userData.role || 'candidate';
    const normalizedEmail = (userData.email || '').trim().toLowerCase();
    const user = {
      id: `${role === 'admin' ? 'admin' : 'cand'}-${Date.now()}`,
      fullName: userData.fullName || 'Candidate Performer',
      email: normalizedEmail,
      phoneNumber: userData.phoneNumber || '',
      dateOfBirth: userData.dateOfBirth || '',
      location: userData.location || '',
      role: role,
      avatar: role === 'admin'
        ? 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&w=400&q=80'
        : 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=400&q=80',
      createdAt: new Date().toISOString(),
    };

    const accounts = getStoredAccounts();
    const filtered = accounts.filter((a) => a.email !== normalizedEmail);
    filtered.push(user);
    saveStoredAccounts(filtered);

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
