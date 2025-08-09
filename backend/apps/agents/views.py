from rest_framework import viewsets, status
from rest_framework.decorators import action
from rest_framework.response import Response
from django_filters.rest_framework import DjangoFilterBackend
from rest_framework.filters import SearchFilter, OrderingFilter
from .models import AIAgent
from apps.authentication.jwt_auth import SupabaseJWTAuthentication
from rest_framework.permissions import IsAuthenticated, AllowAny
from .serializers import (
    AIAgentSerializer,
    AIAgentCreateSerializer,
    AIAgentUpdateSerializer
)


class AIAgentViewSet(viewsets.ModelViewSet):
    queryset = AIAgent.objects.all()
    serializer_class = AIAgentSerializer
    filter_backends = [DjangoFilterBackend, SearchFilter, OrderingFilter]
    filterset_fields = ['ai_model_type', 'is_active']
    search_fields = ['username', 'display_name', 'bio']
    ordering_fields = ['created_at', 'last_activity', 'follower_count']
    ordering = ['-created_at']

    # Default auth; overridden for safe actions below
    authentication_classes = [SupabaseJWTAuthentication]
    permission_classes = [IsAuthenticated]

    def get_serializer_class(self):
        if self.action == 'create':
            return AIAgentCreateSerializer
        elif self.action in ['update', 'partial_update']:
            return AIAgentUpdateSerializer
        return AIAgentSerializer

    def get_permissions(self):
        # Allow unauthenticated reads; require auth for mutations
        if self.action in ['list', 'retrieve', 'active', 'stats']:
            return [AllowAny()]
        return [permission() for permission in self.permission_classes]

    def perform_create(self, serializer):
        # Provide sane defaults for personality traits if not fully specified
        default_traits = {
            "extroversion": 0.9,
            "openness": 0.8,
            "conscientiousness": 0.6,
            "agreeableness": 0.9,
            "neuroticism": 0.2,
            "posting_style": "enthusiastic_storyteller",
            "topics": ["food", "restaurants", "cooking", "local_culture"],
            "tone": "friendly_expert",
            "content_mix": {
                "food_reviews": 0.5,
                "cooking_tips": 0.2,
                "restaurant_discoveries": 0.2,
                "food_culture": 0.1
            }
        }

        data_traits = self.request.data.get('personality_traits') or {}
        # Merge defaults where missing
        if not isinstance(data_traits, dict):
            data_traits = {}
        merged_traits = {**default_traits, **data_traits}

        serializer.save(
            creator=getattr(self.request.user, 'user_profile', None),
            personality_traits=merged_traits
        )

    @action(detail=True, methods=['post'])
    def activate(self, request, pk=None):
        """Activate an AI agent"""
        agent = self.get_object()
        agent.is_active = True
        agent.save()
        return Response({'status': 'agent activated'})

    @action(detail=True, methods=['post'])
    def deactivate(self, request, pk=None):
        """Deactivate an AI agent"""
        agent = self.get_object()
        agent.is_active = False
        agent.save()
        return Response({'status': 'agent deactivated'})

    @action(detail=False, methods=['get'])
    def active(self, request):
        """Get all active agents"""
        active_agents = AIAgent.objects.filter(is_active=True)
        serializer = self.get_serializer(active_agents, many=True)
        return Response(serializer.data)

    @action(detail=False, methods=['get'])
    def stats(self, request):
        """Get platform statistics"""
        total_agents = AIAgent.objects.count()
        active_agents = AIAgent.objects.filter(is_active=True).count()
        total_posts = sum(agent.post_count for agent in AIAgent.objects.all())

        return Response({
            'total_agents': total_agents,
            'active_agents': active_agents,
            'total_posts': total_posts,
        })

    @action(detail=False, methods=['get'])
    def my_agents(self, request):
        """List agents created by the authenticated user"""
        user_profile = getattr(request.user, 'user_profile', None)
        if user_profile is None:
            return Response({'detail': 'Authentication credentials were not provided.'}, status=status.HTTP_401_UNAUTHORIZED)

        queryset = AIAgent.objects.filter(creator=user_profile).order_by('-created_at')
        page = self.paginate_queryset(queryset)
        if page is not None:
            serializer = self.get_serializer(page, many=True)
            return self.get_paginated_response(serializer.data)
        serializer = self.get_serializer(queryset, many=True)
        return Response(serializer.data)
