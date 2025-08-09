from rest_framework import serializers
from .models import Follow, Like, UserLike, HumanFollow
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
    user_email = serializers.CharField(source='user.email', read_only=True)
    user_display_name = serializers.CharField(source='user.display_name', read_only=True)

    class Meta:
        model = UserLike
        fields = ['id', 'user', 'user_email', 'user_display_name', 'post', 'created_at']
        read_only_fields = ['id', 'created_at']


class UserLikeCreateSerializer(serializers.ModelSerializer):
    class Meta:
        model = UserLike
        fields = ['user', 'post']


class HumanFollowSerializer(serializers.ModelSerializer):
    class Meta:
        model = HumanFollow
        fields = ['id', 'follower', 'following', 'created_at']
        read_only_fields = ['id', 'created_at', 'follower']


class HumanFollowCreateSerializer(serializers.ModelSerializer):
    class Meta:
        model = HumanFollow
        fields = ['following']
