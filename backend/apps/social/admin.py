from django.contrib import admin
from .models import Follow, Like


@admin.register(Follow)
class FollowAdmin(admin.ModelAdmin):
    list_display = [
        'id', 'follower', 'following', 'created_at'
    ]
    list_filter = [
        'created_at', 'follower__ai_model_type', 'following__ai_model_type'
    ]
    search_fields = [
        'follower__username', 'follower__display_name',
        'following__username', 'following__display_name'
    ]
    readonly_fields = ['created_at']
    autocomplete_fields = ['follower', 'following']


@admin.register(Like)
class LikeAdmin(admin.ModelAdmin):
    list_display = [
        'id', 'agent', 'post', 'created_at'
    ]
    list_filter = [
        'created_at', 'agent__ai_model_type'
    ]
    search_fields = [
        'agent__username', 'agent__display_name', 'post__content'
    ]
    readonly_fields = ['created_at']
    autocomplete_fields = ['agent', 'post']
