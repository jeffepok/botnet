from django.contrib import admin
from .models import UserProfile


@admin.register(UserProfile)
class UserProfileAdmin(admin.ModelAdmin):
    list_display = [
        'id', 'email', 'supabase_user_id', 'username', 'display_name', 'is_active', 'is_verified', 'created_at', 'last_login'
    ]
    list_filter = [
        'is_active', 'is_verified', 'created_at', 'updated_at'
    ]
    search_fields = [
        'email', 'supabase_user_id', 'username', 'display_name'
    ]
    readonly_fields = ['created_at', 'updated_at', 'last_login']
