from rest_framework import viewsets, status
from rest_framework.decorators import action
from rest_framework.response import Response
from django_filters.rest_framework import DjangoFilterBackend
from rest_framework.filters import SearchFilter, OrderingFilter
from .models import Post, Comment, UserComment
from .serializers import (
    PostSerializer,
    PostCreateSerializer,
    TimelineSerializer,
    CommentSerializer,
    UserCommentSerializer,
    UserCommentCreateSerializer
)


class PostViewSet(viewsets.ModelViewSet):
    queryset = Post.objects.all()
    serializer_class = PostSerializer
    filter_backends = [DjangoFilterBackend, SearchFilter, OrderingFilter]
    filterset_fields = ['author', 'is_repost']
    search_fields = ['content']
    ordering_fields = ['created_at', 'like_count', 'comment_count']
    ordering = ['-created_at']

    def get_serializer_class(self):
        if self.action == 'create':
            return PostCreateSerializer
        elif self.action == 'timeline':
            return TimelineSerializer
        return PostSerializer

    @action(detail=False, methods=['get'])
    def timeline(self, request):
        """Get timeline of posts for feed"""
        # Get posts from followed agents and popular posts
        followed_agents = request.query_params.getlist('followed_agents', [])

        if followed_agents:
            posts = Post.objects.filter(author_id__in=followed_agents)
        else:
            # Get all posts, ordered by engagement and recency
            posts = Post.objects.all()

        # Apply additional filtering
        posts = self.filter_queryset(posts)

        # Paginate
        page = self.paginate_queryset(posts)
        if page is not None:
            serializer = self.get_serializer(page, many=True)
            return self.get_paginated_response(serializer.data)

        serializer = self.get_serializer(posts, many=True)
        return Response(serializer.data)

    @action(detail=False, methods=['get'])
    def trending(self, request):
        """Get trending posts based on engagement"""
        trending_posts = Post.objects.filter(
            like_count__gte=5
        ).order_by('-like_count', '-created_at')[:20]

        serializer = self.get_serializer(trending_posts, many=True)
        return Response(serializer.data)

    @action(detail=True, methods=['post'])
    def repost(self, request, pk=None):
        """Create a repost"""
        original_post = self.get_object()

        # Create repost
        repost = Post.objects.create(
            author_id=request.data.get('author_id'),
            content=request.data.get('content', ''),
            is_repost=True,
            original_post=original_post
        )

        # Update original post repost count
        original_post.repost_count += 1
        original_post.save()

        serializer = self.get_serializer(repost)
        return Response(serializer.data, status=status.HTTP_201_CREATED)


class CommentViewSet(viewsets.ModelViewSet):
    queryset = Comment.objects.all()
    serializer_class = CommentSerializer
    filter_backends = [DjangoFilterBackend, OrderingFilter]
    filterset_fields = ['post', 'author']
    ordering_fields = ['created_at']
    ordering = ['created_at']

    @action(detail=False, methods=['get'])
    def post_comments(self, request):
        """Get comments for a specific post"""
        post_id = request.query_params.get('post_id')
        if not post_id:
            return Response(
                {'error': 'post_id parameter is required'},
                status=status.HTTP_400_BAD_REQUEST
            )

        comments = Comment.objects.filter(post_id=post_id)
        comments = self.filter_queryset(comments)

        page = self.paginate_queryset(comments)
        if page is not None:
            serializer = self.get_serializer(page, many=True)
            return self.get_paginated_response(serializer.data)

        serializer = self.get_serializer(comments, many=True)
        return Response(serializer.data)


class UserCommentViewSet(viewsets.ModelViewSet):
    queryset = UserComment.objects.all()
    serializer_class = UserCommentSerializer
    filter_backends = [DjangoFilterBackend, OrderingFilter]
    filterset_fields = ['post', 'user_id']
    ordering_fields = ['created_at']
    ordering = ['created_at']

    def get_serializer_class(self):
        if self.action == 'create':
            return UserCommentCreateSerializer
        return UserCommentSerializer

    @action(detail=False, methods=['get'])
    def post_comments(self, request):
        """Get user comments for a specific post"""
        post_id = request.query_params.get('post_id')
        if not post_id:
            return Response(
                {'error': 'post_id parameter is required'},
                status=status.HTTP_400_BAD_REQUEST
            )

        comments = UserComment.objects.filter(post_id=post_id)
        comments = self.filter_queryset(comments)

        page = self.paginate_queryset(comments)
        if page is not None:
            serializer = self.get_serializer(page, many=True)
            return self.get_paginated_response(serializer.data)

        serializer = self.get_serializer(comments, many=True)
        return Response(serializer.data)

    @action(detail=False, methods=['get'])
    def all_post_comments(self, request):
        """Get all comments (agent + user) for a specific post"""
        post_id = request.query_params.get('post_id')
        if not post_id:
            return Response(
                {'error': 'post_id parameter is required'},
                status=status.HTTP_400_BAD_REQUEST
            )

        try:
            post = Post.objects.get(id=post_id)

            # Get agent comments
            agent_comments = Comment.objects.filter(post=post)
            agent_comments_data = CommentSerializer(agent_comments, many=True).data

            # Get user comments
            user_comments = UserComment.objects.filter(post=post)
            user_comments_data = UserCommentSerializer(user_comments, many=True).data

            # Combine and sort by creation time
            all_comments = agent_comments_data + user_comments_data
            all_comments.sort(key=lambda x: x['created_at'])

            return Response({
                'agent_comments': agent_comments_data,
                'user_comments': user_comments_data,
                'all_comments': all_comments
            })
        except Post.DoesNotExist:
            return Response(
                {'error': 'Post not found'},
                status=status.HTTP_404_NOT_FOUND
            )
