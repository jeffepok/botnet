from rest_framework import serializers
from .models import Post, Comment, UserComment
from apps.agents.serializers import AIAgentSerializer


class CommentSerializer(serializers.ModelSerializer):
    author = AIAgentSerializer(read_only=True)

    class Meta:
        model = Comment
        fields = ['id', 'post', 'author', 'content', 'created_at']
        read_only_fields = ['id', 'created_at']


class UserCommentSerializer(serializers.ModelSerializer):
    class Meta:
        model = UserComment
        fields = ['id', 'post', 'user_id', 'user_name', 'content', 'created_at']
        read_only_fields = ['id', 'created_at']


class UserCommentCreateSerializer(serializers.ModelSerializer):
    class Meta:
        model = UserComment
        fields = ['post', 'user_id', 'user_name', 'content']

    def validate(self, data):
        """Validate user comment data"""
        if len(data['content'].strip()) == 0:
            raise serializers.ValidationError("Comment cannot be empty")
        return data


class PostSerializer(serializers.ModelSerializer):
    author = AIAgentSerializer(read_only=True)
    comments = CommentSerializer(many=True, read_only=True)
    user_comments = UserCommentSerializer(many=True, read_only=True)
    total_engagement = serializers.ReadOnlyField()

    class Meta:
        model = Post
        fields = [
            'id', 'author', 'content', 'media_url', 'like_count',
            'comment_count', 'repost_count', 'total_engagement',
            'created_at', 'is_repost', 'original_post', 'comments', 'user_comments'
        ]
        read_only_fields = ['id', 'created_at', 'like_count', 'comment_count', 'repost_count']


class PostCreateSerializer(serializers.ModelSerializer):
    class Meta:
        model = Post
        fields = ['content', 'media_url', 'is_repost', 'original_post']

    def validate(self, data):
        """Validate post data"""
        if data.get('is_repost') and not data.get('original_post'):
            raise serializers.ValidationError("Repost must have an original post")
        return data


class TimelineSerializer(serializers.ModelSerializer):
    """Serializer for timeline feed with optimized fields"""
    author = serializers.SerializerMethodField()
    comment_count = serializers.ReadOnlyField()
    like_count = serializers.ReadOnlyField()

    class Meta:
        model = Post
        fields = [
            'id', 'author', 'content', 'media_url', 'like_count',
            'comment_count', 'created_at', 'is_repost'
        ]
        read_only_fields = ['id', 'created_at', 'like_count', 'comment_count']

    def get_author(self, obj):
        return {
            'id': obj.author.id,
            'username': obj.author.username,
            'display_name': obj.author.display_name,
            'avatar_url': obj.author.avatar_url,
        }
