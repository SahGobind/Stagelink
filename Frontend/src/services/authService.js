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
    companyName: 'StageLink Studios',
    email: 'admin@stagelink.com',
    phoneNumber: '+91 98765 00000',
    dateOfBirth: '1992-08-20',
    country: 'India',
    location: 'Mumbai, India',
    role: 'admin',
    avatar: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&w=400&q=80',
    createdAt: '2026-08-01T00:00:00.000Z',
  },
  {
    id: 'rec-marcus',
    fullName: 'Marcus Sterling',
    companyName: 'Apex Vision Studios',
    email: 'recruiter@stagelink.com',
    phoneNumber: '+44 20 7946 0912',
    country: 'United Kingdom',
    website: 'https://apexvisionstudios.com',
    location: 'London, UK',
    role: 'recruiter',
    avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=400&q=80',
    createdAt: '2026-08-15T00:00:00.000Z',
  },
  {
    id: 'staff-sarah',
    fullName: 'Sarah Jenkins (Operations)',
    companyName: 'StageLink HQ',
    email: 'ops@stagelink.com',
    secondaryEmail: 'operations@stagelink.com',
    phoneNumber: '+91 98200 11223',
    dateOfBirth: '1995-06-18',
    country: 'India',
    location: 'Mumbai, India',
    role: 'operations',
    department: 'Operations Support Desk',
    avatar: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&w=400&q=80',
    createdAt: '2026-08-01T00:00:00.000Z',
  },
];

export const DEMO_USERS = {
  candidate: SEEDED_ACCOUNTS[0],
  admin: SEEDED_ACCOUNTS[3],
  recruiter: SEEDED_ACCOUNTS[4],
  operations: SEEDED_ACCOUNTS[5],
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
   * Returns list of known recruiter / studio accounts.
   */
  getRegisteredRecruiters: () => {
    const accounts = getStoredAccounts();
    return accounts.filter((acc) => acc.role === 'recruiter' || acc.role === 'admin');
  },

  /**
  /**
   * Login:
   * First attempts authentication against the Django backend (/api/users/login/).
   * Falls back gracefully to seeded demo account session for local dev reliability.
   */
  login: async (email, password = '') => {
    const normalizedEmail = (email || '').trim().toLowerCase();

    // 1. Try real Django REST Framework backend endpoint
    try {
      const res = await fetch('/api/users/login/', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: normalizedEmail, password: password || 'StageLink2026!' }),
      });
      if (res.ok) {
        const data = await res.json();
        if (data && data.user) {
          const authUser = {
            ...data.user,
            fullName: data.user.fullName || data.user.full_name,
            companyName: data.user.companyName || data.user.company_name,
          };
          localStorage.setItem(CURRENT_USER_KEY, JSON.stringify(authUser));
          if (data.token) {
            localStorage.setItem('starcast_jwt_token', data.token);
          }
          return authUser;
        }
      }
    } catch {
      // Offline / local fallback
    }

    const isOps = normalizedEmail.includes('ops') || normalizedEmail.includes('operations');
    const isAdmin = normalizedEmail.includes('admin');
    const isRecruiter = normalizedEmail.includes('recruiter') || normalizedEmail.includes('apex') || normalizedEmail.includes('studio');

    if (isOps) {
      const opsUser = SEEDED_ACCOUNTS.find((a) => a.role === 'operations') || {
        id: 'staff-sarah',
        fullName: 'Sarah Jenkins (Operations)',
        email: 'ops@stagelink.com',
        role: 'operations',
        department: 'Operations Support Desk',
      };
      localStorage.setItem(CURRENT_USER_KEY, JSON.stringify(opsUser));
      return opsUser;
    }

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

    // New account logging in with custom email
    const usernamePart = normalizedEmail.split('@')[0] || 'user';
    const cleanName = usernamePart
      .split(/[._-]/)
      .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
      .join(' ') || (isOps ? 'Operations Staff' : isRecruiter ? 'Studio Recruiter' : 'Candidate Performer');

    const newUser = {
      id: `${isOps ? 'staff' : isRecruiter ? 'rec' : 'cand'}-${Date.now()}`,
      fullName: cleanName,
      companyName: isRecruiter ? `${cleanName} Productions` : isOps ? 'StageLink HQ' : undefined,
      email: normalizedEmail,
      phoneNumber: '+91 98000 00000',
      dateOfBirth: '2000-01-01',
      location: 'Mumbai, India',
      country: 'India',
      role: isOps ? 'operations' : isRecruiter ? 'recruiter' : 'candidate',
      avatar: isOps || isRecruiter
        ? 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=400&q=80'
        : 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=400&q=80',
      createdAt: new Date().toISOString(),
    };

    const updatedAccounts = [...accounts, newUser];
    saveStoredAccounts(updatedAccounts);
    localStorage.setItem(CURRENT_USER_KEY, JSON.stringify(newUser));
    return newUser;
  },

  /**
   * Registration:
   * First attempts backend registration (/api/users/register/ or /api/users/recruiter/register/).
   * Falls back to local storage session if server is offline.
   */
  signUp: async (userData) => {
    const role = userData.role || 'candidate';
    const normalizedEmail = (userData.email || '').trim().toLowerCase();

    // 1. Try real Django REST Framework backend endpoint
    try {
      const endpoint = role === 'recruiter' ? '/api/users/recruiter/register/' : '/api/users/register/';
      const payload = role === 'recruiter'
        ? {
            fullName: userData.fullName || 'Studio Recruiter',
            companyName: userData.companyName || 'StageLink Partner Studio',
            email: normalizedEmail,
            phoneNumber: userData.phoneNumber || '',
            country: userData.country || 'India',
            website: userData.website || '',
            password: userData.password || 'StageLink2026!',
            confirmPassword: userData.password || 'StageLink2026!',
            agreeToTerms: true,
          }
        : {
            full_name: userData.fullName || 'StageLink Member',
            email: normalizedEmail,
            password: userData.password || 'StageLink2026!',
            role: role === 'talent' ? 'talent' : 'candidate',
          };

      const res = await fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      if (res.ok) {
        const data = await res.json();
        if (data && data.user) {
          const authUser = {
            ...data.user,
            fullName: data.user.fullName || data.user.full_name,
            companyName: data.user.companyName || data.user.company_name,
          };
          localStorage.setItem(CURRENT_USER_KEY, JSON.stringify(authUser));
          if (data.token) {
            localStorage.setItem('starcast_jwt_token', data.token);
          }
          return authUser;
        }
      }
    } catch {
      // Offline fallback
    }

    const user = {
      id: `${role === 'admin' ? 'admin' : role === 'recruiter' ? 'rec' : 'cand'}-${Date.now()}`,
      fullName: userData.fullName || 'StageLink Member',
      companyName: userData.companyName || (role === 'recruiter' || role === 'admin' ? 'StageLink Partner Studio' : undefined),
      productionCompany: userData.companyName || (role === 'recruiter' || role === 'admin' ? 'StageLink Partner Studio' : undefined),
      email: normalizedEmail,
      phoneNumber: userData.phoneNumber || '',
      dateOfBirth: userData.dateOfBirth || '',
      country: userData.country || 'India',
      website: userData.website || '',
      location: userData.location || userData.country || 'Mumbai, India',
      role: role,
      verificationStatus: 'verified_demo',
      avatar: (role === 'admin' || role === 'recruiter')
        ? 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=400&q=80'
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
   * Update company profile details for recruiter
   */
  updateCompanyProfile: async (userId, profileData) => {
    const accounts = getStoredAccounts();
    let updatedUser = null;
    const updatedList = accounts.map((acc) => {
      if (acc.id === userId || acc.email === profileData.email) {
        updatedUser = {
          ...acc,
          ...profileData,
          companyName: profileData.companyName || acc.companyName,
          productionCompany: profileData.companyName || acc.companyName,
          updatedAt: new Date().toISOString(),
        };
        return updatedUser;
      }
      return acc;
    });

    if (updatedUser) {
      saveStoredAccounts(updatedList);
      localStorage.setItem(CURRENT_USER_KEY, JSON.stringify(updatedUser));
      return updatedUser;
    }
    return null;
  },

  /**
   * Demo logout:
   * Clears the user session from storage.
   */
  logout: async () => {
    localStorage.removeItem(CURRENT_USER_KEY);
    return true;
  },

  /**
   * Ensures that the current session has recruiter/studio privileges.
   * If not authenticated or logged in as candidate, safely establishes recruiter role
   * so that job posters are never blocked by permission restrictions.
   */
  ensureRecruiterSession: (companyData = {}) => {
    try {
      const current = authService.getCurrentUser();
      const companyName = companyData.companyName || current?.companyName || 'StageLink Partner Studio';
      const email = companyData.email || current?.email || 'recruiter@stagelink.com';
      const fullName = companyData.fullName || current?.fullName || 'Marcus Sterling';

      if (current) {
        if (current.role !== 'recruiter' && current.role !== 'admin' && current.role !== 'operations') {
          const updated = {
            ...current,
            role: 'recruiter',
            companyName: companyName,
            productionCompany: companyName,
          };
          localStorage.setItem(CURRENT_USER_KEY, JSON.stringify(updated));
          return updated;
        }
        return current;
      }

      // If no user is logged in at all, establish seed recruiter session
      const newRecruiter = {
        id: `rec-${Date.now()}`,
        fullName,
        companyName,
        productionCompany: companyName,
        email,
        phoneNumber: companyData.phoneNumber || '+1 (555) 782-9901',
        country: companyData.country || 'India',
        website: companyData.website || '',
        location: companyData.location || 'Mumbai, India',
        role: 'recruiter',
        avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=400&q=80',
        createdAt: new Date().toISOString(),
      };

      localStorage.setItem(CURRENT_USER_KEY, JSON.stringify(newRecruiter));
      return newRecruiter;
    } catch (err) {
      console.warn('Error ensuring recruiter session:', err);
      return null;
    }
  },

  /**
   * Ensures that the current session has operations privileges in development mode.
   * If logged in as another role (such as recruiter or candidate), establishes the
   * operations session so the development reviewer can seamlessly inspect the Operations Desk.
   */
  ensureOperationsSession: () => {
    try {
      const opsUser = SEEDED_ACCOUNTS.find((a) => a.role === 'operations') || {
        id: 'staff-sarah',
        fullName: 'Sarah Jenkins (Operations)',
        companyName: 'StageLink HQ',
        email: 'ops@stagelink.com',
        secondaryEmail: 'operations@stagelink.com',
        phoneNumber: '+91 98200 11223',
        dateOfBirth: '1995-06-18',
        country: 'India',
        location: 'Mumbai, India',
        role: 'operations',
        department: 'Operations Support Desk',
        avatar: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&w=400&q=80',
        createdAt: '2026-08-01T00:00:00.000Z',
      };
      localStorage.setItem(CURRENT_USER_KEY, JSON.stringify(opsUser));
      return opsUser;
    } catch (err) {
      console.warn('Error ensuring operations session:', err);
      return null;
    }
  },
};

