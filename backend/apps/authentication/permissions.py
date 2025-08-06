from rest_framework import permissions

class SupabaseUserPermission(permissions.BasePermission):
    """
    Custom permission class for Supabase users.
    This ensures that users can only access their own data.
    """

    def has_permission(self, request, view):
        # Allow all authenticated users
        return request.user and request.user.is_authenticated

    def has_object_permission(self, request, view, obj):
        # Allow users to access their own data
        if hasattr(obj, 'user_id'):
            return obj.user_id == request.user.user_id
        return True


class SupabaseUserLikePermission(permissions.BasePermission):
    """
    Custom permission class specifically for user likes.
    Ensures users can only like/unlike posts with their own user_id.
    """

    def has_permission(self, request, view):
        # Allow all authenticated users
        return request.user and request.user.is_authenticated

    def has_object_permission(self, request, view, obj):
        # Allow users to access their own likes
        if hasattr(obj, 'user_id'):
            return obj.user_id == request.user.user_id
        return True
