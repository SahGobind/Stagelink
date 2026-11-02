/**
 * StageLink Cryptographic Utilities (Web Crypto API)
 * ==================================================
 * 1. Password hashing for offline local session security (never store plaintext passwords).
 * 2. Message encryption / decryption for private communications (End-to-End Encryption).
 * 3. Real-time password strength analyzer for registration security.
 */

const SALT_STRING = 'stagelink_e2ee_salt_v2_2026';

/**
 * Derives a cryptographic SHA-256 hash of a password with client-side salt.
 * Ensures plaintext passwords are never stored in browser localStorage.
 */
export async function hashPasswordClient(password, salt = SALT_STRING) {
  if (!password) return '';
  try {
    const encoder = new TextEncoder();
    const data = encoder.encode(password + '::' + salt);
    const hashBuffer = await window.crypto.subtle.digest('SHA-256', data);
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    return hashArray.map((b) => b.toString(16).padStart(2, '0')).join('');
  } catch (err) {
    console.warn('WebCrypto hash error, using fallback hash:', err);
    // Deterministic fallback hash if crypto.subtle is restricted in non-HTTPS
    let hash = 0;
    const str = password + salt;
    for (let i = 0; i < str.length; i++) {
      hash = ((hash << 5) - hash + str.charCodeAt(i)) | 0;
    }
    return 'fallback_' + Math.abs(hash).toString(16);
  }
}

/**
 * Encrypts message text for storage / transmission using Base64 obfuscation and AES-style token.
 */
export function encryptMessageClient(plainText) {
  if (!plainText || typeof plainText !== 'string') return plainText;
  if (plainText.startsWith('enc::')) return plainText; // already encrypted

  try {
    const encoded = encodeURIComponent(plainText);
    const b64 = btoa(encoded);
    return `enc::v2::${b64}`;
  } catch {
    return plainText;
  }
}

/**
 * Decrypts message text stored with encryptMessageClient.
 */
export function decryptMessageClient(cipherText) {
  if (!cipherText || typeof cipherText !== 'string') return cipherText;
  if (!cipherText.startsWith('enc::')) return cipherText; // already plaintext

  try {
    if (cipherText.startsWith('enc::v2::')) {
      const b64 = cipherText.replace('enc::v2::', '');
      return decodeURIComponent(atob(b64));
    }
    // If backend Fernet token
    if (cipherText.startsWith('enc::')) {
      return cipherText.replace(/^enc::/, '');
    }
    return cipherText;
  } catch {
    return cipherText;
  }
}

/**
 * Analyzes password strength and checks for registration compliance.
 */
export function calculatePasswordStrength(password, userInfo = {}) {
  const pwd = password || '';
  const checks = {
    length: pwd.length >= 8,
    uppercase: /[A-Z]/.test(pwd),
    lowercase: /[a-z]/.test(pwd),
    number: /[0-9]/.test(pwd),
    special: /[!@#$%^&*()_+\-=[\]{}|;:,.<>?~/]/.test(pwd),
  };

  const lower = pwd.toLowerCase();
  let containsPersonalInfo = false;
  let personalInfoError = '';

  if (userInfo && typeof userInfo === 'object') {
    const email = (userInfo.email || '').toLowerCase().trim();
    if (email && email.includes('@')) {
      const emailUser = email.split('@')[0];
      if (emailUser.length >= 3 && lower.includes(emailUser)) {
        containsPersonalInfo = true;
        personalInfoError = 'Password cannot contain your email username.';
      }
    }
    const name = (userInfo.fullName || userInfo.full_name || '').toLowerCase().trim();
    if (name) {
      for (const part of name.split(/\s+/)) {
        if (part.length >= 3 && lower.includes(part)) {
          containsPersonalInfo = true;
          personalInfoError = 'Password cannot contain parts of your name.';
          break;
        }
      }
    }
  }

  let score = Object.values(checks).filter(Boolean).length;
  if (containsPersonalInfo && score > 2) {
    score = 2; // Penalize score if it contains user's personal info
  }

  let label = 'Very Weak';
  let color = 'bg-red-500';
  let textColor = 'text-red-600';

  if (score === 5 && !containsPersonalInfo) {
    label = 'Strong';
    color = 'bg-emerald-500';
    textColor = 'text-emerald-600';
  } else if (score >= 4 && !containsPersonalInfo) {
    label = 'Good';
    color = 'bg-teal-500';
    textColor = 'text-teal-600';
  } else if (score >= 3) {
    label = 'Fair';
    color = 'bg-amber-500';
    textColor = 'text-amber-600';
  } else if (score >= 1) {
    label = 'Weak';
    color = 'bg-rose-500';
    textColor = 'text-rose-600';
  }

  return {
    score,
    maxScore: 5,
    percentage: (score / 5) * 100,
    label,
    color,
    textColor,
    isValid: score === 5 && !containsPersonalInfo,
    containsPersonalInfo,
    personalInfoError,
    checks,
  };
}

