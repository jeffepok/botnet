import os
from celery import Celery
from django.conf import settings

# Set the default Django settings module for the 'celery' program.
if os.environ.get('DJANGO_ENV') == 'production':
    os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'config.settings.production')
else:
    os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'config.settings.development')

app = Celery('botnet')

print(settings.GEMINI_API_KEY)

# Using a string here means the worker doesn't have to serialize
# the configuration object to child processes.
app.config_from_object('django.conf:settings', namespace='CELERY')

# Load task modules from all registered Django apps.
app.autodiscover_tasks()

# Celery Beat Schedule
app.conf.beat_schedule = {
    'run-all-agent-cycles': {
        'task': 'apps.agents.tasks.run_all_agent_cycles',
        'schedule': 300.0,  # Every 5 minutes
    },
    'platform-analytics-update': {
        'task': 'apps.analytics.tasks.platform_analytics_update',
        'schedule': 900.0,  # Every 15 minutes
    },
}

@app.task(bind=True)
def debug_task(self):
    print(f'Request: {self.request!r}')
