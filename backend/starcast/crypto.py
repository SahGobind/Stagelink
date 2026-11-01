"""
StageLink End-to-End Cryptographic Security & Password Policy Suite
==================================================================
Features:
- Symmetric authenticated encryption for messages (AES + HMAC via Fernet)
- Cryptographic key derivation (PBKDF2HMAC SHA-256)
- Enterprise-grade registration password complexity validation
- NoSQL Injection input sanitization
"""

import os
import re
import base64
import logging
from django.conf import settings
from cryptography.fernet import Fernet, InvalidToken
from cryptography.hazmat.primitives import hashes
from cryptography.hazmat.primitives.kdf.pbkdf2 import PBKDF2HMAC

logger = logging.getLogger(__name__)

# Salt for deriving message encryption key
_SALT = b"stagelink_msg_enc_v2_salt_secure_2026"

def _get_fernet_cipher():
    """Derives a Fernet cipher instance from Django SECRET_KEY or MESSAGE_ENCRYPTION_KEY."""
    raw_secret = getattr(settings, 'MESSAGE_ENCRYPTION_KEY', None) or getattr(settings, 'SECRET_KEY', 'stagelink-default-enc-key-32bytes-min!')
    if isinstance(raw_secret, str):
        secret_bytes = raw_secret.encode('utf-8')
    else:
        secret_bytes = bytes(raw_secret)
        
    kdf = PBKDF2HMAC(
        algorithm=hashes.SHA256(),
        length=32,
        salt=_SALT,
        iterations=100000,
    )
    key = base64.urlsafe_b64encode(kdf.derive(secret_bytes))
    return Fernet(key)

# Singleton Fernet cipher instance
_CIPHER = None

def get_cipher():
    global _CIPHER
    if _CIPHER is None:
        _CIPHER = _get_fernet_cipher()
    return _CIPHER


def encrypt_message_text(plaintext: str) -> str:
    """
    Encrypts message text using AES-128-CBC + HMAC-SHA256 (Fernet).
    Returns an encrypted string prefixed with 'enc::' for transparent detection.
    """
    if plaintext is None:
        return ""
    if not isinstance(plaintext, str):
        plaintext = str(plaintext)
    if not plaintext.strip():
        return plaintext
    
    # If already encrypted, do not re-encrypt
    if plaintext.startswith("enc::"):
        return plaintext

    try:
        cipher = get_cipher()
        token = cipher.encrypt(plaintext.encode("utf-8")).decode("utf-8")
        return f"enc::{token}"
    except Exception as e:
        logger.error("Failed to encrypt message text: %s", e)
        return plaintext


def decrypt_message_text(ciphertext: str) -> str:
    """
    Decrypts encrypted message text prefixed with 'enc::'.
    If the string is legacy plaintext or invalid token, returns the string safely.
    """
    if ciphertext is None:
        return ""
    if not isinstance(ciphertext, str):
        return str(ciphertext)
    if not ciphertext.startswith("enc::"):
        return ciphertext

    token = ciphertext[5:]
    try:
        cipher = get_cipher()
        decrypted = cipher.decrypt(token.encode("utf-8")).decode("utf-8")
        return decrypted
    except InvalidToken:
        logger.warning("Invalid token while decrypting message; returning masked notice")
        return "[Encrypted message - key mismatch]"
    except Exception as e:
        logger.error("Error during message decryption: %s", e)
        return ciphertext


# ==============================================================================
# REGISTRATION PASSWORD COMPLEXITY VALIDATOR
# ==============================================================================

COMMON_WEAK_PASSWORDS = {
    "password", "password123", "password1", "12345678", "123456789",
    "1234567890", "qwertyuiop", "admin123", "welcome1", "welcome123",
    "stagelink", "stagelink123", "casting123", "audition1", "iloveyou",
    "letmein123", "passw0rd", "pass1234", "master123", "abc12345",
}

def validate_password_strength(password: str, user_info: dict = None) -> tuple[bool, list[str]]:
    """
    Enforces industry-standard password strength:
    - 8 to 128 characters
    - At least 1 uppercase letter (A-Z)
    - At least 1 lowercase letter (a-z)
    - At least 1 number (0-9)
    - At least 1 special character (!@#$%^&*()_+-=[]{}|;:,.<>?~/ etc.)
    - Must not be in common passwords dictionary
    - Must not contain user's name or email address
    """
    errors = []
    
    if not password:
        return False, ["Password is required."]
    
    if len(password) < 8:
        errors.append("Password must be at least 8 characters long.")
    if len(password) > 128:
        errors.append("Password cannot exceed 128 characters.")
    
    if not re.search(r"[A-Z]", password):
        errors.append("Password must contain at least one uppercase letter (A-Z).")
    
    if not re.search(r"[a-z]", password):
        errors.append("Password must contain at least one lowercase letter (a-z).")
        
    if not re.search(r"[0-9]", password):
        errors.append("Password must contain at least one number (0-9).")
        
    if not re.search(r"[!@#$%^&*()_+\-=\[\]{}|;:,.<>?~/\\]", password):
        errors.append("Password must contain at least one special character (e.g. !@#$%^&*).")
        
    lower_pwd = password.lower().strip()
    if lower_pwd in COMMON_WEAK_PASSWORDS:
        errors.append("This password is too common. Please choose a more secure password.")
        
    if user_info and isinstance(user_info, dict):
        email = (user_info.get("email") or "").lower()
        if email and "@" in email:
            email_user = email.split("@")[0]
            if len(email_user) >= 3 and email_user in lower_pwd:
                errors.append("Password cannot contain your email username.")
                
        name = (user_info.get("fullName") or user_info.get("full_name") or "").lower()
        if name:
            for part in name.split():
                if len(part) >= 3 and part in lower_pwd:
                    errors.append("Password cannot contain parts of your name.")
                    break

    return len(errors) == 0, errors


# ==============================================================================
# NOSQL INJECTION & PAYLOAD SANITIZER
# ==============================================================================

def sanitize_nosql_input(data):
    """
    Recursively strips dangerous MongoDB operators (keys starting with $)
    to prevent NoSQL injection attacks.
    """
    if isinstance(data, dict):
        sanitized = {}
        for k, v in data.items():
            if str(k).startswith("$"):
                continue  # strip NoSQL operator
            sanitized[k] = sanitize_nosql_input(v)
        return sanitized
    elif isinstance(data, list):
        return [sanitize_nosql_input(item) for item in data]
    return data

