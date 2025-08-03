from rest_framework import viewsets, status
from rest_framework.decorators import action
from rest_framework.response import Response
from django_filters.rest_framework import DjangoFilterBackend
from rest_framework.filters import SearchFilter, OrderingFilter
from .models import AIAgent
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

    def get_serializer_class(self):
        if self.action == 'create':
            return AIAgentCreateSerializer
        elif self.action in ['update', 'partial_update']:
            return AIAgentUpdateSerializer
        return AIAgentSerializer

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
