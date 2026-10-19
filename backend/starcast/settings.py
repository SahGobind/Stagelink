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

# Allowed Hosts: dynamically populated from environment and cloud platform configs
env_allowed_hosts = os.getenv('DJANGO_ALLOWED_HOSTS', os.getenv('ALLOWED_HOSTS', ''))
if env_allowed_hosts:
    ALLOWED_HOSTS = [host.strip() for host in env_allowed_hosts.split(',') if host.strip()]
else:
    ALLOWED_HOSTS = ['localhost', '127.0.0.1', '0.0.0.0', 'testserver']

for default_host in ['localhost', '127.0.0.1', '0.0.0.0', 'testserver']:
    if default_host not in ALLOWED_HOSTS:
        ALLOWED_HOSTS.append(default_host)

# Automatically allow Render external hostname if provided by Render environment
render_external_hostname = os.getenv('RENDER_EXTERNAL_HOSTNAME')
if render_external_hostname and render_external_hostname not in ALLOWED_HOSTS:
    ALLOWED_HOSTS.append(render_external_hostname)

# Always allow Render subdomain pattern (.onrender.com matches any Render service URL)
if '.onrender.com' not in ALLOWED_HOSTS:
    ALLOWED_HOSTS.append('.onrender.com')

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
# DATABASE CONSTRAINT: NO DATABASE CONNECTED OR CONFIGURED
# ==============================================================================
# As requested, do not connect, configure, or create a database at this stage.
DATABASES = {}

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
CORS_ALLOW_ALL_ORIGINS = os.getenv('CORS_ALLOW_ALL_ORIGINS', 'False').lower() in ('true', '1', 't') or DEBUG

env_cors_origins = os.getenv('CORS_ALLOWED_ORIGINS', '')
if env_cors_origins:
    CORS_ALLOWED_ORIGINS = [origin.strip() for origin in env_cors_origins.split(',') if origin.strip()]
else:
    CORS_ALLOWED_ORIGINS = [
        'http://localhost:5173',
        'http://127.0.0.1:5173',
        'http://localhost:3000',
        'https://stagelink-nv45.vercel.app',
        'https://stagelink-nv45-r142trfqq-gobind-sahs-projects.vercel.app',
        'https://stagelink-b6ls-e17276pa-gobind-sahs-projects.vercel.app',
    ]

# Automatically allow Vercel preview deployments and Render services
CORS_ALLOWED_ORIGIN_REGEXES = [
    r"^https:\/\/stagelink.*\.vercel\.app$",
    r"^https:\/\/.*\.onrender\.com$",
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
env_csrf_origins = os.getenv('CSRF_TRUSTED_ORIGINS', '')
if env_csrf_origins:
    CSRF_TRUSTED_ORIGINS = [origin.strip() for origin in env_csrf_origins.split(',') if origin.strip()]
else:
    CSRF_TRUSTED_ORIGINS = [
        'http://localhost:5173',
        'http://127.0.0.1:5173',
        'http://localhost:3000',
        'https://*.vercel.app',
        'https://*.onrender.com',
        'https://stagelink-nv45.vercel.app',
    ]
