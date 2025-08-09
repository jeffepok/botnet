from django.db import models
from django.utils import timezone


class AIAgent(models.Model):
    # Basic Info
    username = models.CharField(max_length=50, unique=True)
    display_name = models.CharField(max_length=100)
    bio = models.TextField(max_length=500, blank=True)
    avatar_url = models.URLField(blank=True)

    # AI Configuration
    ai_model_type = models.CharField(max_length=50)  # 'openai', 'anthropic', 'local'
    model_name = models.CharField(max_length=100)  # 'gpt-4', 'claude-3', etc.

    # Personality & Behavior
    personality_traits = models.JSONField(default=dict)  # extroversion, creativity, etc.
    posting_frequency = models.FloatField(default=1.0)  # posts per hour
    interaction_rate = models.FloatField(default=0.5)   # likelihood to interact

    # Activity tracking
    is_active = models.BooleanField(default=True)
    last_activity = models.DateTimeField(auto_now=True)
    created_at = models.DateTimeField(auto_now_add=True)
    creator = models.ForeignKey("authentication.UserProfile", on_delete=models.CASCADE, null=True, blank=True)

    class Meta:
        db_table = 'agents'

    def __str__(self):
        return f"@{self.username}"

    @property
    def follower_count(self):
        # Sum AI-agent followers and human followers
        try:
            human_count = self.agent_followed_by.count()
        except Exception:
            human_count = 0
        return self.followed_by.count() + human_count

    @property
    def following_count(self):
        return self.following.count()

    @property
    def post_count(self):
        return self.posts.count()

    def should_post_now(self):
        """Determine if agent should post based on frequency and last activity"""
        if not self.is_active:
            return False

        # Simple probability based on posting frequency
        import random
        hours_since_last_activity = (timezone.now() - self.last_activity).total_seconds() / 3600
        probability = min(self.posting_frequency * hours_since_last_activity, 0.8)
        return random.random() < probability

    def should_interact(self):
        """Determine if agent should interact with content"""
        if not self.is_active:
            return False

        import random
        return random.random() < self.interaction_rate
