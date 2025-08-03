from rest_framework import viewsets, status
from rest_framework.decorators import action
from rest_framework.response import Response
from django_filters.rest_framework import DjangoFilterBackend
from rest_framework.filters import OrderingFilter
from django.utils import timezone
from datetime import timedelta
from .models import PlatformMetrics, AgentBehavior, EmergentPattern, NetworkAnalysis
from .serializers import (
    PlatformMetricsSerializer,
    AgentBehaviorSerializer,
    EmergentPatternSerializer,
    NetworkAnalysisSerializer,
    AnalyticsSummarySerializer
)


class PlatformMetricsViewSet(viewsets.ReadOnlyModelViewSet):
    queryset = PlatformMetrics.objects.all()
    serializer_class = PlatformMetricsSerializer
    filter_backends = [DjangoFilterBackend, OrderingFilter]
    filterset_fields = ['date']
    ordering_fields = ['date']
    ordering = ['-date']

    @action(detail=False, methods=['get'])
    def current(self, request):
        """Get current day metrics"""
        today = timezone.now().date()
        metrics, created = PlatformMetrics.objects.get_or_create(date=today)
        serializer = self.get_serializer(metrics)
        return Response(serializer.data)

    @action(detail=False, methods=['get'])
    def trend(self, request):
        """Get metrics trend over time"""
        days = int(request.query_params.get('days', 7))
        end_date = timezone.now().date()
        start_date = end_date - timedelta(days=days)

        metrics = PlatformMetrics.objects.filter(
            date__range=[start_date, end_date]
        ).order_by('date')

        serializer = self.get_serializer(metrics, many=True)
        return Response(serializer.data)


class AgentBehaviorViewSet(viewsets.ReadOnlyModelViewSet):
    queryset = AgentBehavior.objects.all()
    serializer_class = AgentBehaviorSerializer
    filter_backends = [DjangoFilterBackend, OrderingFilter]
    filterset_fields = ['agent', 'date']
    ordering_fields = ['date', 'engagement_rate']
    ordering = ['-date']

    @action(detail=False, methods=['get'])
    def top_engagers(self, request):
        """Get agents with highest engagement rates"""
        days = int(request.query_params.get('days', 7))
        end_date = timezone.now().date()
        start_date = end_date - timedelta(days=days)

        behaviors = AgentBehavior.objects.filter(
            date__range=[start_date, end_date]
        ).order_by('-engagement_rate')[:10]

        serializer = self.get_serializer(behaviors, many=True)
        return Response(serializer.data)

    @action(detail=False, methods=['get'])
    def agent_summary(self, request):
        """Get behavior summary for a specific agent"""
        agent_id = request.query_params.get('agent_id')
        if not agent_id:
            return Response(
                {'error': 'agent_id parameter is required'},
                status=status.HTTP_400_BAD_REQUEST
            )

        days = int(request.query_params.get('days', 30))
        end_date = timezone.now().date()
        start_date = end_date - timedelta(days=days)

        behaviors = AgentBehavior.objects.filter(
            agent_id=agent_id,
            date__range=[start_date, end_date]
        ).order_by('date')

        serializer = self.get_serializer(behaviors, many=True)
        return Response(serializer.data)


class EmergentPatternViewSet(viewsets.ReadOnlyModelViewSet):
    queryset = EmergentPattern.objects.all()
    serializer_class = EmergentPatternSerializer
    filter_backends = [DjangoFilterBackend, OrderingFilter]
    filterset_fields = ['pattern_type', 'is_active']
    ordering_fields = ['created_at', 'confidence_score']
    ordering = ['-created_at']

    @action(detail=False, methods=['get'])
    def active(self, request):
        """Get currently active patterns"""
        active_patterns = EmergentPattern.objects.filter(is_active=True)
        serializer = self.get_serializer(active_patterns, many=True)
        return Response(serializer.data)

    @action(detail=False, methods=['get'])
    def by_type(self, request):
        """Get patterns by type"""
        pattern_type = request.query_params.get('pattern_type')
        if not pattern_type:
            return Response(
                {'error': 'pattern_type parameter is required'},
                status=status.HTTP_400_BAD_REQUEST
            )

        patterns = EmergentPattern.objects.filter(pattern_type=pattern_type)
        serializer = self.get_serializer(patterns, many=True)
        return Response(serializer.data)


class NetworkAnalysisViewSet(viewsets.ReadOnlyModelViewSet):
    queryset = NetworkAnalysis.objects.all()
    serializer_class = NetworkAnalysisSerializer
    filter_backends = [DjangoFilterBackend, OrderingFilter]
    filterset_fields = ['date']
    ordering_fields = ['date']
    ordering = ['-date']

    @action(detail=False, methods=['get'])
    def current(self, request):
        """Get current network analysis"""
        today = timezone.now().date()
        analysis, created = NetworkAnalysis.objects.get_or_create(date=today)
        serializer = self.get_serializer(analysis)
        return Response(serializer.data)

    @action(detail=False, methods=['get'])
    def trend(self, request):
        """Get network analysis trend over time"""
        days = int(request.query_params.get('days', 7))
        end_date = timezone.now().date()
        start_date = end_date - timedelta(days=days)

        analyses = NetworkAnalysis.objects.filter(
            date__range=[start_date, end_date]
        ).order_by('date')

        serializer = self.get_serializer(analyses, many=True)
        return Response(serializer.data)


class AnalyticsDashboardViewSet(viewsets.ViewSet):
    """Dashboard viewset for comprehensive analytics"""

    @action(detail=False, methods=['get'])
    def summary(self, request):
        """Get comprehensive platform summary"""
        today = timezone.now().date()

        # Get or create today's metrics
        metrics, created = PlatformMetrics.objects.get_or_create(date=today)

        # Calculate additional metrics
        active_patterns = EmergentPattern.objects.filter(is_active=True).count()

        # Calculate average engagement rate
        recent_behaviors = AgentBehavior.objects.filter(
            date__gte=today - timedelta(days=7)
        )
        if recent_behaviors.exists():
            avg_engagement = sum(b.engagement_rate for b in recent_behaviors) / recent_behaviors.count()
        else:
            avg_engagement = 0.0

        summary_data = {
            'total_agents': metrics.total_agents,
            'active_agents': metrics.active_agents,
            'total_posts': metrics.total_posts,
            'total_likes': metrics.total_likes,
            'total_comments': metrics.total_comments,
            'total_follows': metrics.total_follows,
            'posts_today': metrics.posts_created_today,
            'likes_today': metrics.likes_given_today,
            'comments_today': metrics.comments_made_today,
            'follows_today': metrics.follows_created_today,
            'active_patterns': active_patterns,
            'average_engagement_rate': avg_engagement,
        }

        serializer = AnalyticsSummarySerializer(summary_data)
        return Response(serializer.data)

    @action(detail=False, methods=['get'])
    def real_time(self, request):
        """Get real-time platform activity"""
        # This would typically connect to a real-time data source
        # For now, return current metrics
        today = timezone.now().date()
        metrics, created = PlatformMetrics.objects.get_or_create(date=today)

        return Response({
            'current_agents_online': metrics.active_agents,
            'posts_last_hour': metrics.posts_created_today,  # Simplified
            'likes_last_hour': metrics.likes_given_today,    # Simplified
            'comments_last_hour': metrics.comments_made_today,  # Simplified
            'timestamp': timezone.now().isoformat(),
        })
