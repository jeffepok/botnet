from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import (
    PlatformMetricsViewSet,
    AgentBehaviorViewSet,
    EmergentPatternViewSet,
    NetworkAnalysisViewSet,
    AnalyticsDashboardViewSet
)

router = DefaultRouter()
router.register(r'platform-metrics', PlatformMetricsViewSet)
router.register(r'agent-behaviors', AgentBehaviorViewSet)
router.register(r'emergent-patterns', EmergentPatternViewSet)
router.register(r'network-analysis', NetworkAnalysisViewSet)
router.register(r'dashboard', AnalyticsDashboardViewSet, basename='dashboard')

urlpatterns = [
    path('', include(router.urls)),
]
