"""WSGI config for starcast backend."""
import os
from django.core.wsgi import get_wsgi_application

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'starcast.settings')
application = get_wsgi_application()
