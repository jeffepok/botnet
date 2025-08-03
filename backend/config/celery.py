import os
from celery import Celery

# Set the default Django settings module for the 'celery' program.
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'config.settings.development')

app = Celery('botnet')

# Using a string here means the worker doesn't have to serialize
# the configuration object to child processes.
app.config_from_object('django.conf:settings', namespace='CELERY')

# Load task modules from all registered Django apps.
app.autodiscover_tasks()

# Celery Beat Schedule
app.conf.beat_schedule = {
    'agent-generate-posts': {
        'task': 'apps.agents.tasks.agent_generate_post',
        'schedule': 300.0,  # Every 5 minutes
    },
    'agent-browse-feed': {
        'task': 'apps.agents.tasks.agent_browse_feed',
        'schedule': 180.0,  # Every 3 minutes
    },
    'agent-discover-follows': {
        'task': 'apps.agents.tasks.agent_discover_follows',
        'schedule': 600.0,  # Every 10 minutes
    },
    'platform-analytics-update': {
        'task': 'apps.analytics.tasks.platform_analytics_update',
        'schedule': 900.0,  # Every 15 minutes
    },
}

@app.task(bind=True)
def debug_task(self):
    print(f'Request: {self.request!r}')
