"""
Django settings for StarCast backend.
Stateless, database-free architecture ready for in-memory API testing.
"""
import os
from pathlib import Path
from dotenv import load_dotenv

# Build paths inside the project like this: BASE_DIR / 'subdir'.
BASE_DIR = Path(__file__).resolve().parent.parent

# Load environment variables from .env if present
load_dotenv(BASE_DIR / '.env')

# Quick-start development settings - unsuitable for production
SECRET_KEY = os.getenv('DJANGO_SECRET_KEY', os.getenv('SECRET_KEY', 'starcast-dev-insecure-key-2026-xyz'))

DEBUG = os.getenv('DJANGO_DEBUG', os.getenv('DEBUG', 'True')).lower() in ('true', '1', 't')

# Allowed Hosts: dynamically populated from environment or permissive for cloud platforms
env_allowed_hosts = os.getenv('DJANGO_ALLOWED_HOSTS', os.getenv('ALLOWED_HOSTS', '*'))
if env_allowed_hosts:
    ALLOWED_HOSTS = [host.strip() for host in env_allowed_hosts.split(',') if host.strip()]
else:
    ALLOWED_HOSTS = ['*']

for default_host in ['localhost', '127.0.0.1', '0.0.0.0', 'testserver', '.onrender.com']:
    if default_host not in ALLOWED_HOSTS and '*' not in ALLOWED_HOSTS:
        ALLOWED_HOSTS.append(default_host)

# Application definition
# NOTE: database-backed apps (django.contrib.auth, contenttypes, sessions, admin) are intentionally omitted.
INSTALLED_APPS = [
    'django.contrib.staticfiles',
    
    # Third party
    'rest_framework',
    'corsheaders',
    
    # Modular StarCast apps
    'users.apps.UsersConfig',
    'companies.apps.CompaniesConfig',
    'opportunities.apps.OpportunitiesConfig',
    'applications.apps.ApplicationsConfig',
    'ranking.apps.RankingConfig',
    'messaging.apps.MessagingConfig',
    'notifications.apps.NotificationsConfig',
    'payments.apps.PaymentsConfig',
    'support.apps.SupportConfig',
]

MIDDLEWARE = [
    'corsheaders.middleware.CorsMiddleware',
    'django.middleware.security.SecurityMiddleware',
    'whitenoise.middleware.WhiteNoiseMiddleware',
    'django.middleware.common.CommonMiddleware',
    'django.middleware.clickjacking.XFrameOptionsMiddleware',
]

ROOT_URLCONF = 'starcast.urls'

TEMPLATES = [
    {
        'BACKEND': 'django.template.backends.django.DjangoTemplates',
        'DIRS': [],
        'APP_DIRS': True,
        'OPTIONS': {
            'context_processors': [
                'django.template.context_processors.debug',
                'django.template.context_processors.request',
            ],
        },
    },
]

WSGI_APPLICATION = 'starcast.wsgi.application'
ASGI_APPLICATION = 'starcast.asgi.application'

# ==============================================================================
# DATABASE CONFIGURATION: PyMongo Direct Integration with MongoDB Atlas
# ==============================================================================
# Note: Django's relational ORM is intentionally not used for MongoDB.
# PyMongo provides direct, type-safe, driver-level connection management.
DATABASES = {}

MONGODB_URI = os.getenv('MONGODB_URI', '')
MONGODB_DB_NAME = os.getenv('MONGODB_DB_NAME', 'stagelink_db')
MONGODB_SERVER_SELECTION_TIMEOUT_MS = int(os.getenv('MONGODB_SERVER_SELECTION_TIMEOUT_MS', 5000))
MONGODB_CONNECT_TIMEOUT_MS = int(os.getenv('MONGODB_CONNECT_TIMEOUT_MS', 5000))
MONGODB_SOCKET_TIMEOUT_MS = int(os.getenv('MONGODB_SOCKET_TIMEOUT_MS', 10000))

# Frontend URL
FRONTEND_URL = os.getenv('FRONTEND_URL', 'http://localhost:5173')

# Internationalization
LANGUAGE_CODE = 'en-us'
TIME_ZONE = 'UTC'
USE_I18N = True
USE_TZ = True

# Static files (CSS, JavaScript, Images)
STATIC_URL = '/static/'
STATIC_ROOT = BASE_DIR / 'staticfiles'

# WhiteNoise storage for compressed, production-ready static assets
STORAGES = {
    "default": {
        "BACKEND": "django.core.files.storage.FileSystemStorage",
    },
    "staticfiles": {
        "BACKEND": "whitenoise.storage.CompressedStaticFilesStorage",
    },
}

# Trust reverse proxy SSL termination (Render, Cloudflare, etc.)
SECURE_PROXY_SSL_HEADER = ('HTTP_X_FORWARDED_PROTO', 'https')

# Password Hashers: optimized PBKDF2 for cloud container responsiveness
PASSWORD_HASHERS = [
    'starcast.hashers.StageLinkPBKDF2PasswordHasher',
    'django.contrib.auth.hashers.PBKDF2PasswordHasher',
    'django.contrib.auth.hashers.PBKDF2SHA1PasswordHasher',
    'django.contrib.auth.hashers.Argon2PasswordHasher',
    'django.contrib.auth.hashers.BCryptSHA256PasswordHasher',
]

# Django REST Framework configuration
REST_FRAMEWORK = {
    'DEFAULT_AUTHENTICATION_CLASSES': [],
    'DEFAULT_PERMISSION_CLASSES': [
        'rest_framework.permissions.AllowAny',
    ],
    'UNAUTHENTICATED_USER': None,
    'DEFAULT_RENDERER_CLASSES': [
        'rest_framework.renderers.JSONRenderer',
        'rest_framework.renderers.BrowsableAPIRenderer',
    ],
}

# CORS configuration for React frontend
CORS_ALLOW_ALL_ORIGINS = os.getenv('CORS_ALLOW_ALL_ORIGINS', 'True').lower() in ('true', '1', 't')

DEFAULT_CORS_ORIGINS = [
    'http://localhost:5173',
    'http://127.0.0.1:5173',
    'http://localhost:3000',
    'http://127.0.0.1:3000',
    'https://stagelink-nv45.vercel.app',
    'https://stagelink-nv45-r142trfqq-gobind-sahs-projects.vercel.app',
    'https://stagelink-b6ls-e17276pa-gobind-sahs-projects.vercel.app',
]

env_cors_origins = os.getenv('CORS_ALLOWED_ORIGINS', '')
if env_cors_origins:
    CORS_ALLOWED_ORIGINS = list(set(
        DEFAULT_CORS_ORIGINS + [origin.strip() for origin in env_cors_origins.split(',') if origin.strip()]
    ))
else:
    CORS_ALLOWED_ORIGINS = DEFAULT_CORS_ORIGINS

if FRONTEND_URL and FRONTEND_URL not in CORS_ALLOWED_ORIGINS:
    CORS_ALLOWED_ORIGINS.append(FRONTEND_URL)

# Automatically allow ALL Vercel deployments (production, branch & preview) and Render services
CORS_ALLOWED_ORIGIN_REGEXES = [
    r"^https?:\/\/.*\.vercel\.app$",
    r"^https?:\/\/.*\.onrender\.com$",
    r"^http:\/\/localhost(:\d+)?$",
    r"^http:\/\/127\.0\.0\.1(:\d+)?$",
]

CORS_ALLOW_CREDENTIALS = True
CORS_ALLOW_METHODS = [
    'DELETE',
    'GET',
    'OPTIONS',
    'PATCH',
    'POST',
    'PUT',
]
CORS_ALLOW_HEADERS = [
    'accept',
    'accept-encoding',
    'authorization',
    'content-type',
    'dnt',
    'origin',
    'user-agent',
    'x-csrftoken',
    'x-requested-with',
]

# CSRF configuration for trusted cross-origin requests
DEFAULT_CSRF_ORIGINS = [
    'http://localhost:5173',
    'http://127.0.0.1:5173',
    'http://localhost:3000',
    'http://127.0.0.1:3000',
    'https://*.vercel.app',
    'https://*.onrender.com',
]

env_csrf_origins = os.getenv('CSRF_TRUSTED_ORIGINS', '')
if env_csrf_origins:
    CSRF_TRUSTED_ORIGINS = list(set(
        DEFAULT_CSRF_ORIGINS + [origin.strip() for origin in env_csrf_origins.split(',') if origin.strip()]
    ))
else:
    CSRF_TRUSTED_ORIGINS = DEFAULT_CSRF_ORIGINS

if FRONTEND_URL and FRONTEND_URL not in CSRF_TRUSTED_ORIGINS:
    CSRF_TRUSTED_ORIGINS.append(FRONTEND_URL)
