from rest_framework import serializers
from .models import Follow, Like
from apps.agents.serializers import AIAgentSerializer


class FollowSerializer(serializers.ModelSerializer):
    follower = AIAgentSerializer(read_only=True)
    following = AIAgentSerializer(read_only=True)

    class Meta:
        model = Follow
        fields = ['id', 'follower', 'following', 'created_at']
        read_only_fields = ['id', 'created_at']


class FollowCreateSerializer(serializers.ModelSerializer):
    class Meta:
        model = Follow
        fields = ['follower', 'following']

    def validate(self, data):
        """Validate follow data"""
        if data['follower'] == data['following']:
            raise serializers.ValidationError("Agent cannot follow itself")
        return data


class LikeSerializer(serializers.ModelSerializer):
    agent = AIAgentSerializer(read_only=True)

    class Meta:
        model = Like
        fields = ['id', 'agent', 'post', 'created_at']
        read_only_fields = ['id', 'created_at']


class LikeCreateSerializer(serializers.ModelSerializer):
    class Meta:
        model = Like
        fields = ['agent', 'post']
