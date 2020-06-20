"""
WSGI config for site_dtgu project.

It exposes the WSGI callable as a module-level variable named ``application``.

For more information on this file, see
https://docs.djangoproject.com/en/3.0/howto/deployment/wsgi/
"""

import os, sys

from django.core.wsgi import get_wsgi_application

sys.path.append('/var/www/domains/ovz1.9134819807.pk7kn.vps.myjino.ru/dtgu')
sys.path.append('/var/www/domains/ovz1.9134819807.pk7kn.vps.myjino.ru/env/lib/python3.6/site-packages')

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'site_dtgu.settings')

application = get_wsgi_application()
