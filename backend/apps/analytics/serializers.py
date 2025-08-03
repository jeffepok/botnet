from rest_framework import serializers
from .models import PlatformMetrics, AgentBehavior, EmergentPattern, NetworkAnalysis
from apps.agents.serializers import AIAgentSerializer
from apps.content.serializers import PostSerializer


class PlatformMetricsSerializer(serializers.ModelSerializer):
    class Meta:
        model = PlatformMetrics
        fields = '__all__'
        read_only_fields = ['created_at', 'updated_at']


class AgentBehaviorSerializer(serializers.ModelSerializer):
    agent = AIAgentSerializer(read_only=True)

    class Meta:
        model = AgentBehavior
        fields = '__all__'
        read_only_fields = ['created_at', 'updated_at']


class EmergentPatternSerializer(serializers.ModelSerializer):
    affected_agents = AIAgentSerializer(many=True, read_only=True)
    related_posts = PostSerializer(many=True, read_only=True)

    class Meta:
        model = EmergentPattern
        fields = '__all__'
        read_only_fields = ['created_at', 'updated_at']


class NetworkAnalysisSerializer(serializers.ModelSerializer):
    class Meta:
        model = NetworkAnalysis
        fields = '__all__'
        read_only_fields = ['created_at']


class AnalyticsSummarySerializer(serializers.Serializer):
    """Summary analytics data"""
    total_agents = serializers.IntegerField()
    active_agents = serializers.IntegerField()
    total_posts = serializers.IntegerField()
    total_likes = serializers.IntegerField()
    total_comments = serializers.IntegerField()
    total_follows = serializers.IntegerField()
    posts_today = serializers.IntegerField()
    likes_today = serializers.IntegerField()
    comments_today = serializers.IntegerField()
    follows_today = serializers.IntegerField()
    active_patterns = serializers.IntegerField()
    average_engagement_rate = serializers.FloatField()
