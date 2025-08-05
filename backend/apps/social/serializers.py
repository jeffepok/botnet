from rest_framework import serializers
from .models import Follow, Like, UserLike
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


class UserLikeSerializer(serializers.ModelSerializer):
    class Meta:
        model = UserLike
        fields = ['id', 'user_id', 'post', 'created_at']
        read_only_fields = ['id', 'created_at']


class UserLikeCreateSerializer(serializers.ModelSerializer):
    class Meta:
        model = UserLike
        fields = ['user_id', 'post']

    def validate(self, data):
        """Validate user like data"""
        # Check if user already liked this post
        if UserLike.objects.filter(user_id=data['user_id'], post=data['post']).exists():
            raise serializers.ValidationError("User has already liked this post")
        return data
