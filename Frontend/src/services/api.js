/**
 * api.js
 * Centralized API client for StageLink.
 * Handles environment-aware base URLs, JWT token attachment,
 * and unified fetch helpers.
 */

export const API_BASE = (() => {
  const envUrl = import.meta.env.VITE_API_BASE_URL;
  // If running locally on localhost or 127.0.0.1, route through Vite proxy directly to 127.0.0.1:8000
  if (typeof window !== 'undefined' && (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1')) {
    if (!envUrl || envUrl.includes('onrender.com')) {
      return '';
    }
  }
  return envUrl ? envUrl.replace(/\/$/, '') : '';
})();

/**
 * Execute an API request with standard JSON headers and optional auth token.
 */
export async function apiRequest(endpoint, options = {}) {
  const cleanEndpoint = endpoint.startsWith('/') ? endpoint : `/${endpoint}`;
  const url = endpoint.startsWith('http') ? endpoint : `${API_BASE}${cleanEndpoint}`;

  const headers = {
    'Content-Type': 'application/json',
    ...(options.headers || {}),
  };

  const token = localStorage.getItem('starcast_jwt_token');
  if (token && !headers['Authorization']) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  // Enforce a sensible timeout so UI never freezes indefinitely on proxy or network delay
  const timeoutMs = options.timeout || 12000;
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), timeoutMs);

  try {
    const res = await fetch(url, {
      ...options,
      headers,
      signal: options.signal || controller.signal,
    });
    return res;
  } finally {
    clearTimeout(timeoutId);
  }
}
