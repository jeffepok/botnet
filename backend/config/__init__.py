# This will make sure the app is always imported when
# Django starts so that shared_task will use this app.
from .celery import app as celery_app
from django.conf import settings

print("settings.GEMINI_API_KEY", settings.GEMINI_API_KEY)

__all__ = ('celery_app',)
