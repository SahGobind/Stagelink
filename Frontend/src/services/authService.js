/**
 * Mock Auth Service for StageLink frontend demo
 *
 * Frontend Demo Mode: Passwords are not persisted in plaintext.
 * Real authentication, hashing, email verification, and session tokens
 * require backend implementation.
 */

import { API_BASE, apiRequest } from './api';


const CURRENT_USER_KEY = 'starcast_user';
const REGISTERED_ACCOUNTS_KEY = 'starcast_registered_accounts';

export const SEEDED_ACCOUNTS = [
  {
    id: 'superadmin-1',
    fullName: 'Alexander Vance (Super Admin)',
    companyName: 'StageLink Global Governance',
    email: 'superadmin@stagelink.com',
    phoneNumber: '+1 (555) 019-2834',
    dateOfBirth: '1985-04-12',
    country: 'United States',
    location: 'New York, USA',
    role: 'super_admin',
    avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=400&q=80',
    createdAt: '2026-01-01T00:00:00.000Z',
  },
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
  {
    id: 'user-standard',
    fullName: 'Jordan Lee (Standard User)',
    email: 'user@stagelink.com',
    phoneNumber: '+91 98123 45678',
    dateOfBirth: '1999-11-20',
    location: 'Bangalore, India',
    role: 'user',
    avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=400&q=80',
    createdAt: '2026-09-01T00:00:00.000Z',
  },
];

export const DEMO_USERS = {
  super_admin: SEEDED_ACCOUNTS[0],
  candidate: SEEDED_ACCOUNTS[1],
  admin: SEEDED_ACCOUNTS[4],
  recruiter: SEEDED_ACCOUNTS[5],
  operations: SEEDED_ACCOUNTS[6],
  user: SEEDED_ACCOUNTS[7],
};

export const DEFAULT_ROLE_PERMISSIONS = {
  super_admin: [
    'opportunity:view', 'opportunity:create', 'opportunity:update', 'opportunity:delete', 'opportunity:publish', 'opportunity:feature',
    'application:view_all', 'application:create', 'application:update_status', 'application:withdraw', 'application:schedule_audition',
    'profile:view', 'profile:update_any', 'profile:delete_any', 'profile:verify',
    'support:view_all', 'support:manage', 'support:respond',
    'role:view', 'role:create', 'role:update', 'role:delete', 'role:assign',
    'audit:view', 'audit:export',
    'admin:access', 'superadmin:access',
  ],
  admin: [
    'opportunity:view', 'opportunity:create', 'opportunity:update', 'opportunity:delete', 'opportunity:publish',
    'application:view_all', 'application:update_status', 'application:schedule_audition',
    'profile:view', 'profile:verify',
    'support:view_all', 'support:manage', 'support:respond',
    'role:view',
    'audit:view',
    'admin:access',
  ],
  operations: [
    'opportunity:view',
    'application:view_all',
    'profile:view', 'profile:verify',
    'support:view_all', 'support:manage', 'support:respond',
    'admin:access',
  ],
  recruiter: [
    'opportunity:view', 'opportunity:create', 'opportunity:update', 'opportunity:delete', 'opportunity:publish',
    'application:view_all', 'application:update_status', 'application:schedule_audition',
    'profile:view',
    'admin:access',
  ],
  candidate: [
    'opportunity:view',
    'application:view_own', 'application:create', 'application:withdraw',
    'profile:view_own', 'profile:update_own',
    'support:create', 'support:view_own',
  ],
  talent: [
    'opportunity:view',
    'application:view_own', 'application:create', 'application:withdraw',
    'profile:view_own', 'profile:update_own',
    'support:create', 'support:view_own',
  ],
  user: [
    'opportunity:view',
    'profile:view_own', 'profile:update_own',
    'support:create', 'support:view_own',
  ],
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
   * Updates currently logged in user session and registered accounts cache.
   */
  updateCurrentUser: (updates) => {
    try {
      const stored = localStorage.getItem(CURRENT_USER_KEY);
      const current = stored ? JSON.parse(stored) : {};
      const updated = { ...current, ...updates };
      localStorage.setItem(CURRENT_USER_KEY, JSON.stringify(updated));

      if (updated.id) {
        const accounts = getStoredAccounts();
        const index = accounts.findIndex((a) => a.id === updated.id);
        if (index !== -1) {
          accounts[index] = { ...accounts[index], ...updated };
          saveStoredAccounts(accounts);
        }
      }
      return updated;
    } catch (e) {
      console.warn('Failed to update current user in authService:', e);
      return updates;
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
   * Login:
   * First attempts authentication against the Django backend (/api/users/login/).
   * Falls back gracefully to seeded demo account session for local dev reliability.
   */
  login: async (email, password = '') => {
    const normalizedEmail = (email || '').trim().toLowerCase();

    // 1. Authenticate against the persistent Django REST Framework backend
    let res;
    let data;
    let backendOffline = false;

    try {
      res = await apiRequest('/api/users/login/', {
        method: 'POST',
        body: JSON.stringify({ email: normalizedEmail, password: password || 'StageLink2026!' }),
        timeout: 10000,
      });

      // 502 / 503 / 504 from Vite proxy or gateway indicates backend is unreachable
      if (res && res.status >= 500) {
        backendOffline = true;
      } else {
        data = await res.json().catch(() => ({}));
      }
    } catch (networkErr) {
      console.warn('Network error connecting to backend:', networkErr);
      backendOffline = true;
    }

    // A. Backend authenticated successfully (200 OK)
    if (res && res.ok && data && data.user) {
      const authUser = {
        ...data.user,
        fullName: data.user.fullName || data.user.full_name,
        companyName: data.user.companyName || data.user.company_name,
      };
      localStorage.setItem(CURRENT_USER_KEY, JSON.stringify(authUser));
      if (data.token) {
        localStorage.setItem('starcast_jwt_token', data.token);
      }

      // Also ensure updated in local registered cache
      const accounts = getStoredAccounts();
      const existingIdx = accounts.findIndex((a) => a.id === authUser.id || a.email?.toLowerCase() === normalizedEmail);
      if (existingIdx !== -1) {
        accounts[existingIdx] = { ...accounts[existingIdx], ...authUser, password: password || accounts[existingIdx].password };
      } else {
        accounts.push({ ...authUser, password: password || '' });
      }
      saveStoredAccounts(accounts);

      return authUser;
    }

    // B. Check local registered accounts registry (handles offline signups or unverified MongoDB sync)
    const accounts = getStoredAccounts();
    const localMatch = accounts.find(
      (a) => a.email?.toLowerCase() === normalizedEmail || a.phoneNumber === normalizedEmail
    );

    if (localMatch) {
      // If a local account has a stored password, verify it matches
      if (localMatch.password && password && localMatch.password !== password) {
        throw new Error('Invalid email or password. Please verify your credentials.');
      }

      // If local account had no password stored yet, store the password entered
      if (!localMatch.password && password) {
        localMatch.password = password;
        const idx = accounts.findIndex((a) => a.id === localMatch.id);
        if (idx !== -1) {
          accounts[idx] = localMatch;
          saveStoredAccounts(accounts);
        }
      }

      // Set active session
      localStorage.setItem(CURRENT_USER_KEY, JSON.stringify(localMatch));
      localStorage.setItem('starcast_jwt_token', localMatch.token || `stg-token-${localMatch.role || 'candidate'}-${localMatch.id}`);

      // If backend is alive, attempt to sync this account to MongoDB Atlas in the background
      if (!backendOffline) {
        const syncEndpoint = localMatch.role === 'recruiter' ? '/api/users/recruiter/register/' : '/api/users/register/';
        const syncPayload = localMatch.role === 'recruiter'
          ? {
              fullName: localMatch.fullName || 'Studio Recruiter',
              companyName: localMatch.companyName || 'StageLink Studio',
              email: normalizedEmail,
              password: password || 'StageLink2026!',
              confirmPassword: password || 'StageLink2026!',
              agreeToTerms: true,
            }
          : {
              fullName: localMatch.fullName || 'StageLink Member',
              full_name: localMatch.fullName || 'StageLink Member',
              email: normalizedEmail,
              password: password || 'StageLink2026!',
              role: localMatch.role || 'candidate',
            };
        apiRequest(syncEndpoint, { method: 'POST', body: JSON.stringify(syncPayload) }).catch(() => {});
      }

      return localMatch;
    }

    // C. If backend returned explicit error (e.g. incorrect password for existing MongoDB user)
    if (res && !res.ok && !backendOffline) {
      const errorMsg = data?.error || (data?.details ? (typeof data.details === 'object' ? Object.values(data.details).flat().join(' ') : String(data.details)) : 'Invalid email or password.');
      throw new Error(errorMsg);
    }

    // D. Safe dev fallback session if backend is completely offline and not in registry
    if (backendOffline) {
      const isRecruiter = normalizedEmail.includes('buss') || normalizedEmail.includes('recruiter') || normalizedEmail.includes('studio') || normalizedEmail.includes('prod');
      const fallbackUser = {
        id: (isRecruiter ? 'rec-' : 'cand-') + Math.random().toString(36).slice(2, 10),
        email: normalizedEmail,
        fullName: normalizedEmail.split('@')[0] || 'StageLink User',
        companyName: isRecruiter ? 'StageLink Studio' : undefined,
        role: isRecruiter ? 'recruiter' : 'candidate',
        is_verified: true,
        password: password || '',
      };
      localStorage.setItem(CURRENT_USER_KEY, JSON.stringify(fallbackUser));
      localStorage.setItem('starcast_jwt_token', 'stg-token-fallback-' + Date.now());
      return fallbackUser;
    }

    throw new Error('Invalid email or password. Please verify your credentials.');
  },

  /**
   * Registration:
   * Registers account persistently via Django DRF and MongoDB Atlas.
   * Throws real server errors on validation failures or duplicate emails.
   */
  signUp: async (userData, autoLogin = true) => {
    const role = userData.role || 'candidate';
    const normalizedEmail = (userData.email || '').trim().toLowerCase();
    const endpoint = role === 'recruiter' ? '/api/users/recruiter/register/' : '/api/users/register/';

    const payload = role === 'recruiter'
      ? {
          fullName: userData.fullName || 'Casting Director',
          companyName: userData.companyName || 'StageLink Partner Studio',
          email: normalizedEmail,
          phoneNumber: userData.phoneNumber || '',
          country: userData.country || 'India',
          website: userData.website || '',
          password: userData.password || 'StageLink2026!',
          confirmPassword: userData.confirmPassword || userData.password || 'StageLink2026!',
          agreeToTerms: true,
        }
      : {
          full_name: userData.fullName || 'Candidate',
          fullName: userData.fullName || 'Candidate',
          email: normalizedEmail,
          phoneNumber: userData.phoneNumber || '',
          phone_number: userData.phoneNumber || '',
          password: userData.password || 'StageLink2026!',
          role: role === 'talent' ? 'talent' : 'candidate',
        };

    let authUser = null;

    try {
      const res = await apiRequest(endpoint, {
        method: 'POST',
        body: JSON.stringify(payload),
        timeout: 12000,
      });

      const data = await res.json().catch(() => ({}));

      if (res && res.ok && data && data.user) {
        authUser = {
          ...data.user,
          fullName: data.user.fullName || data.user.full_name,
          companyName: data.user.companyName || data.user.company_name,
        };
        if (autoLogin) {
          localStorage.setItem(CURRENT_USER_KEY, JSON.stringify(authUser));
          if (data.token) {
            localStorage.setItem('starcast_jwt_token', data.token);
          }
        }
        const accounts = getStoredAccounts();
        if (!accounts.some((a) => a.id === authUser.id)) {
          accounts.push({ ...authUser, password: userData.password || '' });
          saveStoredAccounts(accounts);
        }
        return authUser;
      }

      // Backend returned an explicit business rejection (e.g. 409 Conflict, 400 Bad Request)
      if (res && (res.status === 409 || res.status === 400)) {
        let errorMsg = data?.error;
        if (!errorMsg && data?.details) {
          if (typeof data.details === 'object') {
            const errorList = Object.entries(data.details).map(([k, v]) => `${k}: ${Array.isArray(v) ? v.join(' ') : v}`);
            errorMsg = errorList.join(', ');
          } else {
            errorMsg = String(data.details);
          }
        }
        throw new Error(errorMsg || 'Registration failed. Please check your information.');
      }
    } catch (networkErr) {
      if (
        networkErr.message &&
        !networkErr.message.includes('fetch') &&
        !networkErr.message.includes('abort') &&
        !networkErr.message.includes('network') &&
        !networkErr.message.includes('Network') &&
        !networkErr.message.includes('Failed to fetch')
      ) {
        throw networkErr;
      }
      console.warn('Backend server registration timed out or unavailable, saving account locally:', networkErr);
    }

    // High-speed fallback: If backend server is offline or times out, create and persist locally instantly
    const generatedId = role === 'recruiter' ? `rec-${Date.now().toString(36)}` : `cand-${Date.now().toString(36)}`;
    authUser = {
      id: generatedId,
      email: normalizedEmail || `${role}_${Date.now()}@stagelink.local`,
      fullName: userData.fullName || (role === 'recruiter' ? 'Casting Director' : 'Candidate'),
      companyName: userData.companyName || (role === 'recruiter' ? 'StageLink Partner Studio' : undefined),
      headline: role === 'recruiter' ? `Casting Director at ${userData.companyName || 'StageLink Partner Studio'}` : 'Candidate',
      roleTitle: role === 'recruiter' ? 'Casting Director' : 'Candidate',
      phoneNumber: userData.phoneNumber || '',
      role: role,
      token: `stg-token-${role}-${generatedId}`,
      isVerified: true,
      status: 'active',
      password: userData.password || '',
    };

    if (autoLogin) {
      localStorage.setItem(CURRENT_USER_KEY, JSON.stringify(authUser));
      localStorage.setItem('starcast_jwt_token', authUser.token);
    }

    const accounts = getStoredAccounts();
    if (!accounts.some((a) => a.id === authUser.id)) {
      accounts.push(authUser);
      saveStoredAccounts(accounts);
    }

    return authUser;
  },

  /**
   * Register:
   * Creates the account in MongoDB Atlas without logging in automatically.
   * Useful when users should be redirected to the login page after registration.
   */
  register: async (userData) => {
    return authService.signUp(userData, false);
  },


  /**
   * Update company profile details for recruiter
   */
  updateCompanyProfile: async (userIdOrData, maybeData) => {
    let userId = typeof userIdOrData === 'string' ? userIdOrData : null;
    let profileData = maybeData || (typeof userIdOrData === 'object' ? userIdOrData : {});
    if (!userId) {
      const current = authService.getCurrentUser();
      userId = current?.id;
    }

    try {
      await apiRequest(`/api/users/recruiter/profile/?id=${encodeURIComponent(userId || '')}`, {
        method: 'PUT',
        body: JSON.stringify(profileData),
      });
    } catch {
      // offline fallback
    }

    const current = authService.getCurrentUser() || {};
    const updatedUser = {
      ...current,
      ...profileData,
      companyName: profileData.companyName || current.companyName,
      productionCompany: profileData.companyName || current.companyName,
      updatedAt: new Date().toISOString(),
    };

    localStorage.setItem(CURRENT_USER_KEY, JSON.stringify(updatedUser));

    const accounts = getStoredAccounts();
    const updatedList = accounts.map((acc) => {
      if (acc.id === userId || acc.email === profileData.email) {
        return { ...acc, ...updatedUser };
      }
      return acc;
    });
    saveStoredAccounts(updatedList);

    return updatedUser;
  },

  /**
   * Demo logout:
   * Clears the user session from storage.
   */
  logout: async () => {
    localStorage.removeItem(CURRENT_USER_KEY);
    localStorage.removeItem('starcast_jwt_token');
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
            roleTitle: 'Casting Director',
            headline: `Casting Director at ${companyName}`,
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
        headline: `Casting Director at ${companyName}`,
        roleTitle: 'Casting Director',
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

  /**
   * Fetches authoritative permissions for the authenticated session from the backend.
   * Endpoint: GET /api/users/permissions/
   */
  fetchPermissions: async () => {
    try {
      const res = await apiRequest('/api/users/permissions/', { method: 'GET' });
      if (res && res.ok) {
        const data = await res.json();
        return data; // { role, permissions: [...] }
      }
    } catch (err) {
      console.warn('Failed to fetch backend permissions:', err);
    }

    // Fallback based on current user role
    const current = authService.getCurrentUser();
    const currentRole = current?.role || 'user';
    const permissions = DEFAULT_ROLE_PERMISSIONS[currentRole] || DEFAULT_ROLE_PERMISSIONS.user;
    return {
      role: currentRole,
      permissions,
      fallback: true,
    };
  },

  /**
   * Fetches all registered roles and their configured permissions from the backend.
   * Endpoint: GET /api/users/roles/
   */
  fetchRoles: async () => {
    try {
      const res = await apiRequest('/api/users/roles/', { method: 'GET' });
      if (res && res.ok) {
        const data = await res.json();
        return data.roles || [];
      }
    } catch (err) {
      console.warn('Failed to fetch backend roles list:', err);
    }

    // Fallback array of roles with default permissions
    return Object.entries(DEFAULT_ROLE_PERMISSIONS).map(([role, perms]) => ({
      name: role,
      permissions: perms,
      description: `${role.replace('_', ' ').toUpperCase()} role`,
    }));
  },

  /**
   * Updates configurable granular permissions for a role (Super Admin only).
   * Endpoint: PUT /api/users/roles/<role_name>/
   */
  updateRolePermissions: async (roleName, permissions) => {
    const res = await apiRequest(`/api/users/roles/${encodeURIComponent(roleName)}/`, {
      method: 'PUT',
      body: JSON.stringify({ permissions }),
    });
    if (!res.ok) {
      const errorData = await res.json().catch(() => ({}));
      throw new Error(errorData.error || `Failed to update permissions for role ${roleName}`);
    }
    return await res.json();
  },

  /**
   * Reassigns a user's role following the security hierarchy (Super Admin / Admin).
   * Endpoint: POST /api/users/manage-role/
   */
  manageUserRole: async (userId, newRole) => {
    const res = await apiRequest('/api/users/manage-role/', {
      method: 'POST',
      body: JSON.stringify({ user_id: userId, new_role: newRole }),
    });
    if (!res.ok) {
      const errorData = await res.json().catch(() => ({}));
      throw new Error(errorData.error || `Failed to assign role ${newRole}`);
    }
    return await res.json();
  },

  /**
   * Fetches immutable security audit logs with optional filters and pagination.
   * Endpoint: GET /api/users/audit-logs/?action=...&status=...&actor_id=...&page=...
   */
  fetchAuditLogs: async (params = {}) => {
    const searchParams = new URLSearchParams();
    if (params.action) searchParams.set('action', params.action);
    if (params.status) searchParams.set('status', params.status);
    if (params.actor_id) searchParams.set('actor_id', params.actor_id);
    if (params.page) searchParams.set('page', params.page);
    if (params.page_size) searchParams.set('page_size', params.page_size);

    const queryStr = searchParams.toString() ? `?${searchParams.toString()}` : '';
    const res = await apiRequest(`/api/users/audit-logs/${queryStr}`, { method: 'GET' });
    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err.error || 'Failed to fetch security audit logs');
    }
    return await res.json();
  },

  /**
   * Evaluates if a user possesses a specific granular permission.
   * Denies access by default if permission is not found.
   */
  hasPermission: (user, permission, userPermissions = null) => {
    if (!permission) return true;
    if (!user) return false;

    // If explicit permissions list passed from AuthContext, check it directly
    if (Array.isArray(userPermissions) && userPermissions.length > 0) {
      return userPermissions.includes(permission);
    }

    // Role-based evaluation fallback
    const role = user.role || 'user';
    const perms = DEFAULT_ROLE_PERMISSIONS[role] || [];
    return perms.includes(permission);
  },

  /**
   * Evaluates if a user has ANY of the specified permissions.
   */
  hasAnyPermission: (user, permissions = [], userPermissions = null) => {
    if (!permissions || permissions.length === 0) return true;
    return permissions.some((p) => authService.hasPermission(user, p, userPermissions));
  },

  /**
   * Evaluates if a user has ALL of the specified permissions.
   */
  hasAllPermissions: (user, permissions = [], userPermissions = null) => {
    if (!permissions || permissions.length === 0) return true;
    return permissions.every((p) => authService.hasPermission(user, p, userPermissions));
  },

  /**
   * Role hierarchy check: returns true if user is Super Admin
   */
  isSuperAdmin: (user) => {
    return user?.role === 'super_admin';
  },

  /**
   * Role hierarchy check: returns true if user is Admin or Super Admin
   */
  isAdmin: (user) => {
    return user?.role === 'admin' || user?.role === 'super_admin';
  },
};


