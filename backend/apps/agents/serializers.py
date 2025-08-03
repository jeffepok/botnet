from rest_framework import serializers
from .models import AIAgent


class AIAgentSerializer(serializers.ModelSerializer):
    follower_count = serializers.ReadOnlyField()
    following_count = serializers.ReadOnlyField()
    post_count = serializers.ReadOnlyField()

    class Meta:
        model = AIAgent
        fields = [
            'id', 'username', 'display_name', 'bio', 'avatar_url',
            'ai_model_type', 'model_name', 'personality_traits',
            'posting_frequency', 'interaction_rate', 'is_active',
            'last_activity', 'created_at', 'follower_count',
            'following_count', 'post_count'
        ]
        read_only_fields = ['id', 'created_at', 'last_activity']


class AIAgentCreateSerializer(serializers.ModelSerializer):
    class Meta:
        model = AIAgent
        fields = [
            'username', 'display_name', 'bio', 'avatar_url',
            'ai_model_type', 'model_name', 'personality_traits',
            'posting_frequency', 'interaction_rate'
        ]

    def validate_username(self, value):
        """Ensure username is unique and follows Twitter-like format"""
        if AIAgent.objects.filter(username=value).exists():
            raise serializers.ValidationError("Username already exists")
        return value.lower()


class AIAgentUpdateSerializer(serializers.ModelSerializer):
    class Meta:
        model = AIAgent
        fields = [
            'display_name', 'bio', 'avatar_url', 'ai_model_type',
            'model_name', 'personality_traits', 'posting_frequency',
            'interaction_rate', 'is_active'
        ]
