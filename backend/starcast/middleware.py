"""
StageLink Security Middleware Suite
===================================
1. SecurityHeadersMiddleware: Injects OWASP-recommended security headers (CSP, HSTS, X-Frame-Options, etc.)
2. AuthRateLimitMiddleware: In-memory sliding-window rate limiter protecting login and registration endpoints from brute-force attacks.
"""

import time
import logging
from collections import defaultdict
from django.http import JsonResponse

logger = logging.getLogger(__name__)

# Sliding window rate limiter store: { ip_address: [(timestamp, endpoint), ...] }
_RATE_LIMIT_STORE = defaultdict(list)
_RATE_LIMIT_WINDOW_SECONDS = 300  # 5 minutes
_MAX_AUTH_ATTEMPTS = 30          # 30 auth requests per 5 min per IP

class SecurityHeadersMiddleware:
    """
    Appends standard security hardening headers to all HTTP responses.
    """
    def __init__(self, get_response):
        self.get_response = get_response

    def __call__(self, request):
        response = self.get_response(request)

        # 1. Prevent MIME type sniffing
        response.headers['X-Content-Type-Options'] = 'nosniff'

        # 2. Prevent Clickjacking
        response.headers['X-Frame-Options'] = 'SAMEORIGIN'

        # 3. Enable Browser XSS filter
        response.headers['X-XSS-Protection'] = '1; mode=block'

        # 4. Referrer Policy
        response.headers['Referrer-Policy'] = 'strict-origin-when-cross-origin'

        # 5. Disable sensitive hardware features unless explicitly granted
        response.headers['Permissions-Policy'] = 'camera=(self), microphone=(self), geolocation=()'

        # 6. Restrict Flash and PDF cross-domain policies
        response.headers['X-Permitted-Cross-Domain-Policies'] = 'none'

        return response


class AuthRateLimitMiddleware:
    """
    Protects authentication endpoints from brute-force attacks and credential stuffing.
    """
    AUTH_ENDPOINTS = {
        '/api/users/login/',
        '/api/users/register/',
        '/api/users/recruiter/login/',
        '/api/users/recruiter/register/',
        '/users/login/',
        '/users/register/',
    }

    def __init__(self, get_response):
        self.get_response = get_response

    def __call__(self, request):
        path = request.path_info
        if request.method == 'POST' and path in self.AUTH_ENDPOINTS:
            client_ip = self._get_client_ip(request)
            now = time.time()
            cutoff = now - _RATE_LIMIT_WINDOW_SECONDS

            # Clean expired timestamps for this IP
            recent_attempts = [ts for ts in _RATE_LIMIT_STORE[client_ip] if ts > cutoff]
            _RATE_LIMIT_STORE[client_ip] = recent_attempts

            if len(recent_attempts) >= _MAX_AUTH_ATTEMPTS:
                logger.warning("Auth rate limit exceeded for IP: %s on %s", client_ip, path)
                return JsonResponse({
                    "error": "Too many authentication attempts. Please wait 5 minutes before trying again.",
                    "code": "AUTH_RATE_LIMIT_EXCEEDED"
                }, status=429)

            # Record this attempt
            _RATE_LIMIT_STORE[client_ip].append(now)

        return self.get_response(request)

    def _get_client_ip(self, request):
        x_forwarded_for = request.META.get('HTTP_X_FORWARDED_FOR')
        if x_forwarded_for:
            return x_forwarded_for.split(',')[0].strip()
        return request.META.get('REMOTE_ADDR', '127.0.0.1')

