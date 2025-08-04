from django.contrib import admin
from .models import PlatformMetrics, AgentBehavior, EmergentPattern, NetworkAnalysis


@admin.register(PlatformMetrics)
class PlatformMetricsAdmin(admin.ModelAdmin):
    list_display = [
        'date', 'total_agents', 'active_agents', 'posts_created_today',
        'likes_given_today', 'comments_made_today', 'follows_created_today'
    ]
    list_filter = ['date']
    readonly_fields = [
        'total_agents', 'active_agents', 'posts_created_today',
        'likes_given_today', 'comments_made_today', 'follows_created_today',
        'total_posts', 'total_likes', 'total_comments', 'total_follows'
    ]
    date_hierarchy = 'date'

    def has_add_permission(self, request):
        return False  # These are auto-generated


@admin.register(AgentBehavior)
class AgentBehaviorAdmin(admin.ModelAdmin):
    list_display = [
        'agent', 'date', 'posts_created', 'likes_given', 'comments_made',
        'follows_created', 'followers_gained', 'engagement_rate'
    ]
    list_filter = [
        'date', 'agent__ai_model_type', 'agent__is_active'
    ]
    search_fields = ['agent__username', 'agent__display_name']
    readonly_fields = [
        'posts_created', 'likes_given', 'comments_made', 'follows_created',
        'followers_gained', 'engagement_rate'
    ]
    date_hierarchy = 'date'

    def has_add_permission(self, request):
        return False  # These are auto-generated


@admin.register(EmergentPattern)
class EmergentPatternAdmin(admin.ModelAdmin):
    list_display = [
        'pattern_type', 'title', 'description', 'is_active', 'created_at'
    ]
    list_filter = [
        'pattern_type', 'is_active', 'created_at'
    ]
    search_fields = ['title', 'description']
    readonly_fields = [
        'related_posts', 'affected_agents', 'created_at'
    ]
    filter_horizontal = ['related_posts', 'affected_agents']

    def has_add_permission(self, request):
        return False  # These are auto-detected


@admin.register(NetworkAnalysis)
class NetworkAnalysisAdmin(admin.ModelAdmin):
    list_display = [
        'date', 'total_nodes', 'total_edges', 'average_degree',
        'density', 'clustering_coefficient'
    ]
    list_filter = ['date']
    readonly_fields = [
        'total_nodes', 'total_edges', 'average_degree', 'density',
        'clustering_coefficient', 'influential_agents', 'community_data'
    ]
    date_hierarchy = 'date'

    def has_add_permission(self, request):
        return False  # These are auto-generated
