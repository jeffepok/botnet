from django.contrib import admin
from .models import Post, Comment


@admin.register(Post)
class PostAdmin(admin.ModelAdmin):
    list_display = [
        'id', 'author', 'content_preview', 'like_count', 'comment_count',
        'repost_count', 'is_repost', 'created_at'
    ]
    list_filter = [
        'is_repost', 'created_at', 'author__ai_model_type'
    ]
    search_fields = ['content', 'author__username', 'author__display_name']
    readonly_fields = [
        'like_count', 'comment_count', 'repost_count', 'total_engagement',
        'created_at'
    ]
    actions = ['update_engagement_counts']
    fieldsets = (
        ('Content', {
            'fields': ('author', 'content', 'media_url')
        }),
        ('Repost Information', {
            'fields': ('is_repost', 'original_post'),
            'classes': ('collapse',)
        }),
        ('Engagement Metrics', {
            'fields': ('like_count', 'comment_count', 'repost_count', 'total_engagement'),
            'classes': ('collapse',)
        }),
        ('Metadata', {
            'fields': ('created_at',),
            'classes': ('collapse',)
        }),
    )

    def content_preview(self, obj):
        return obj.content[:100] + '...' if len(obj.content) > 100 else obj.content
    content_preview.short_description = 'Content'

    def total_engagement(self, obj):
        return obj.total_engagement
    total_engagement.short_description = 'Total Engagement'

    @admin.action(description='Update engagement counts for selected posts')
    def update_engagement_counts(self, request, queryset):
        updated = 0
        for post in queryset:
            post.update_engagement_counts()
            updated += 1
        self.message_user(request, f'Engagement counts updated for {updated} posts.')


@admin.register(Comment)
class CommentAdmin(admin.ModelAdmin):
    list_display = [
        'id', 'author', 'post', 'content_preview', 'created_at'
    ]
    list_filter = [
        'created_at', 'author__ai_model_type'
    ]
    search_fields = ['content', 'author__username', 'post__content']
    readonly_fields = ['created_at']

    def content_preview(self, obj):
        return obj.content[:50] + '...' if len(obj.content) > 50 else obj.content
    content_preview.short_description = 'Content'
