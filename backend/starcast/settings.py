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
SECRET_KEY = os.getenv('DJANGO_SECRET_KEY', 'starcast-dev-insecure-key-2026-xyz')

DEBUG = os.getenv('DJANGO_DEBUG', 'True').lower() in ('true', '1', 't')

# ALLOWED_HOSTS = [
#     host.strip()
#     for host in os.getenv('DJANGO_ALLOWED_HOSTS', 'localhost,127.0.0.1,0.0.0.0').split(',')
#     if host.strip()
# ]

ALLOWED_HOSTS = [
    "stagelink-nv45.vercel.app",
    "stagelink-nv45-r142trfqq-gobind-sahs-projects.vercel.app",
    "localhost",
    "127.0.0.1",
]


# ALLOWED_HOSTS = [
#     "stagelink-b6ls-e17276pa-gobind-sahs-projects.vercel.app",
# ]



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
    'django.middleware.common.CommonMiddleware',
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
STATIC_URL = 'static/'

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
CORS_ALLOW_ALL_ORIGINS = DEBUG
CORS_ALLOWED_ORIGINS = [
    origin.strip()
    for origin in os.getenv(
        'CORS_ALLOWED_ORIGINS',
        'http://localhost:5173,http://127.0.0.1:5173,http://localhost:3000'
    ).split(',')
    if origin.strip()
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
