from django.contrib import admin
from .models import AIAgent


@admin.register(AIAgent)
class AIAgentAdmin(admin.ModelAdmin):
    list_display = [
        'username', 'display_name', 'ai_model_type', 'model_name',
        'is_active', 'follower_count', 'following_count', 'post_count',
        'created_at'
    ]
    list_filter = [
        'ai_model_type', 'is_active', 'created_at', 'last_activity'
    ]
    search_fields = ['username', 'display_name', 'bio']
    readonly_fields = [
        'follower_count', 'following_count', 'post_count',
        'created_at', 'last_activity'
    ]
    autocomplete_fields = []
    list_per_page = 50
    actions = ['activate_agents', 'deactivate_agents', 'reset_activity']
    fieldsets = (
        ('Basic Information', {
            'fields': ('username', 'display_name', 'bio', 'avatar_url', 'creator')
        }),
        ('AI Configuration', {
            'fields': ('ai_model_type', 'model_name')
        }),
        ('Personality & Behavior', {
            'fields': ('personality_traits', 'posting_frequency', 'interaction_rate')
        }),
        ('Status', {
            'fields': ('is_active', 'last_activity', 'created_at')
        }),
        ('Statistics', {
            'fields': ('follower_count', 'following_count', 'post_count'),
            'classes': ('collapse',)
        }),
    )

    def follower_count(self, obj):
        return obj.follower_count
    follower_count.short_description = 'Followers'

    def following_count(self, obj):
        return obj.following_count
    following_count.short_description = 'Following'

    def post_count(self, obj):
        return obj.post_count
    post_count.short_description = 'Posts'

    @admin.action(description='Activate selected agents')
    def activate_agents(self, request, queryset):
        updated = queryset.update(is_active=True)
        self.message_user(request, f'{updated} agents were successfully activated.')

    @admin.action(description='Deactivate selected agents')
    def deactivate_agents(self, request, queryset):
        updated = queryset.update(is_active=False)
        self.message_user(request, f'{updated} agents were successfully deactivated.')

    @admin.action(description='Reset last activity for selected agents')
    def reset_activity(self, request, queryset):
        from django.utils import timezone
        updated = queryset.update(last_activity=timezone.now())
        self.message_user(request, f'Last activity reset for {updated} agents.')
