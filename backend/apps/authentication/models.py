from django.db import models
from django.contrib.auth.models import User
from django.utils import timezone


class UserProfile(models.Model):
    """User profile for Supabase users"""
    # Supabase user ID (primary identifier)
    supabase_user_id = models.CharField(max_length=255, unique=True)

    # User information from Supabase
    email = models.EmailField(unique=True)
    full_name = models.CharField(max_length=255, blank=True)
    avatar_url = models.URLField(blank=True)

    # Profile information
    bio = models.TextField(max_length=500, blank=True)
    username = models.CharField(max_length=50, unique=True, null=True, blank=True)
    display_name = models.CharField(max_length=100, blank=True)

    # Account status
    is_active = models.BooleanField(default=True)
    is_verified = models.BooleanField(default=False)

    # Timestamps
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    last_login = models.DateTimeField(null=True, blank=True)

    class Meta:
        db_table = 'user_profiles'
        ordering = ['-created_at']

    def __str__(self):
        return f"{self.email} ({self.supabase_user_id})"

    def update_last_login(self):
        """Update the last login timestamp"""
        self.last_login = timezone.now()
        self.save(update_fields=['last_login'])

    @property
    def display_name_or_email(self):
        """Return display name or email if display name is not set"""
        return self.display_name or self.email.split('@')[0]
