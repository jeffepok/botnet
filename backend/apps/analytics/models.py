from django.db import models
from django.utils import timezone
from apps.agents.models import AIAgent
from apps.content.models import Post


class PlatformMetrics(models.Model):
    """Daily platform metrics"""
    date = models.DateField(unique=True)
    total_agents = models.PositiveIntegerField(default=0)
    active_agents = models.PositiveIntegerField(default=0)
    total_posts = models.PositiveIntegerField(default=0)
    total_likes = models.PositiveIntegerField(default=0)
    total_comments = models.PositiveIntegerField(default=0)
    total_follows = models.PositiveIntegerField(default=0)
    posts_created_today = models.PositiveIntegerField(default=0)
    likes_given_today = models.PositiveIntegerField(default=0)
    comments_made_today = models.PositiveIntegerField(default=0)
    follows_created_today = models.PositiveIntegerField(default=0)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        db_table = 'platform_metrics'
        ordering = ['-date']

    def __str__(self):
        return f"Platform Metrics for {self.date}"


class AgentBehavior(models.Model):
    """Individual agent behavior tracking"""
    agent = models.ForeignKey(AIAgent, on_delete=models.CASCADE, related_name='behaviors')
    date = models.DateField()
    posts_created = models.PositiveIntegerField(default=0)
    likes_given = models.PositiveIntegerField(default=0)
    comments_made = models.PositiveIntegerField(default=0)
    follows_created = models.PositiveIntegerField(default=0)
    followers_gained = models.PositiveIntegerField(default=0)
    engagement_rate = models.FloatField(default=0.0)  # (likes + comments) / posts
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        db_table = 'agent_behaviors'
        unique_together = ('agent', 'date')
        ordering = ['-date']

    def __str__(self):
        return f"{self.agent.username} behavior on {self.date}"


class EmergentPattern(models.Model):
    """Detected emergent behaviors and patterns"""
    PATTERN_TYPES = [
        ('viral_content', 'Viral Content'),
        ('echo_chamber', 'Echo Chamber'),
        ('influencer_emergence', 'Influencer Emergence'),
        ('trend_formation', 'Trend Formation'),
        ('community_formation', 'Community Formation'),
        ('behavioral_clustering', 'Behavioral Clustering'),
    ]

    pattern_type = models.CharField(max_length=50, choices=PATTERN_TYPES)
    title = models.CharField(max_length=200)
    description = models.TextField()
    confidence_score = models.FloatField(default=0.0)  # 0.0 to 1.0
    affected_agents = models.ManyToManyField(AIAgent, blank=True)
    related_posts = models.ManyToManyField(Post, blank=True)
    start_date = models.DateTimeField()
    end_date = models.DateTimeField(null=True, blank=True)
    is_active = models.BooleanField(default=True)
    metadata = models.JSONField(default=dict)  # Additional pattern data
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        db_table = 'emergent_patterns'
        ordering = ['-created_at']

    def __str__(self):
        return f"{self.pattern_type}: {self.title}"


class NetworkAnalysis(models.Model):
    """Social network analysis data"""
    date = models.DateField(unique=True)
    total_nodes = models.PositiveIntegerField(default=0)
    total_edges = models.PositiveIntegerField(default=0)
    average_degree = models.FloatField(default=0.0)
    clustering_coefficient = models.FloatField(default=0.0)
    diameter = models.PositiveIntegerField(default=0)
    density = models.FloatField(default=0.0)
    influential_agents = models.JSONField(default=list)  # List of agent IDs with influence scores
    community_data = models.JSONField(default=dict)  # Community detection results
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        db_table = 'network_analysis'
        ordering = ['-date']

    def __str__(self):
        return f"Network Analysis for {self.date}"
