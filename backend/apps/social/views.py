from rest_framework import viewsets, status
from rest_framework.decorators import action
from rest_framework.response import Response
from django_filters.rest_framework import DjangoFilterBackend
from rest_framework.filters import OrderingFilter
from .models import Follow, Like
from .serializers import (
    FollowSerializer,
    FollowCreateSerializer,
    LikeSerializer,
    LikeCreateSerializer
)


class FollowViewSet(viewsets.ModelViewSet):
    queryset = Follow.objects.all()
    serializer_class = FollowSerializer
    filter_backends = [DjangoFilterBackend, OrderingFilter]
    filterset_fields = ['follower', 'following']
    ordering_fields = ['created_at']
    ordering = ['-created_at']

    def get_serializer_class(self):
        if self.action == 'create':
            return FollowCreateSerializer
        return FollowSerializer

    @action(detail=False, methods=['get'])
    def followers(self, request):
        """Get followers of a specific agent"""
        agent_id = request.query_params.get('agent_id')
        if not agent_id:
            return Response(
                {'error': 'agent_id parameter is required'},
                status=status.HTTP_400_BAD_REQUEST
            )

        followers = Follow.objects.filter(following_id=agent_id)
        followers = self.filter_queryset(followers)

        page = self.paginate_queryset(followers)
        if page is not None:
            serializer = self.get_serializer(page, many=True)
            return self.get_paginated_response(serializer.data)

        serializer = self.get_serializer(followers, many=True)
        return Response(serializer.data)

    @action(detail=False, methods=['get'])
    def following(self, request):
        """Get agents that a specific agent is following"""
        agent_id = request.query_params.get('agent_id')
        if not agent_id:
            return Response(
                {'error': 'agent_id parameter is required'},
                status=status.HTTP_400_BAD_REQUEST
            )

        following = Follow.objects.filter(follower_id=agent_id)
        following = self.filter_queryset(following)

        page = self.paginate_queryset(following)
        if page is not None:
            serializer = self.get_serializer(page, many=True)
            return self.get_paginated_response(serializer.data)

        serializer = self.get_serializer(following, many=True)
        return Response(serializer.data)


class LikeViewSet(viewsets.ModelViewSet):
    queryset = Like.objects.all()
    serializer_class = LikeSerializer
    filter_backends = [DjangoFilterBackend, OrderingFilter]
    filterset_fields = ['agent', 'post']
    ordering_fields = ['created_at']
    ordering = ['-created_at']

    def get_serializer_class(self):
        if self.action == 'create':
            return LikeCreateSerializer
        return LikeSerializer

    @action(detail=False, methods=['get'])
    def post_likes(self, request):
        """Get likes for a specific post"""
        post_id = request.query_params.get('post_id')
        if not post_id:
            return Response(
                {'error': 'post_id parameter is required'},
                status=status.HTTP_400_BAD_REQUEST
            )

        likes = Like.objects.filter(post_id=post_id)
        likes = self.filter_queryset(likes)

        page = self.paginate_queryset(likes)
        if page is not None:
            serializer = self.get_serializer(page, many=True)
            return self.get_paginated_response(serializer.data)

        serializer = self.get_serializer(likes, many=True)
        return Response(serializer.data)

    @action(detail=False, methods=['get'])
    def agent_likes(self, request):
        """Get posts liked by a specific agent"""
        agent_id = request.query_params.get('agent_id')
        if not agent_id:
            return Response(
                {'error': 'agent_id parameter is required'},
                status=status.HTTP_400_BAD_REQUEST
            )

        likes = Like.objects.filter(agent_id=agent_id)
        likes = self.filter_queryset(likes)

        page = self.paginate_queryset(likes)
        if page is not None:
            serializer = self.get_serializer(page, many=True)
            return self.get_paginated_response(serializer.data)

        serializer = self.get_serializer(likes, many=True)
        return Response(serializer.data)
