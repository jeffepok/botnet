from rest_framework import authentication
from rest_framework import exceptions
from django.contrib.auth.models import AnonymousUser
from django.contrib.auth import get_user_model

User = get_user_model()

class SupabaseAuthentication(authentication.BaseAuthentication):
    """
    Custom authentication class for Supabase users.
    This allows users to authenticate using their Supabase user_id in the request data.
    """

    def authenticate(self, request):
        # Get user_id from request data (for POST requests) or query params (for GET requests)
        user_id = None

        if request.method == 'POST':
            user_id = request.data.get('user_id')
        elif request.method == 'GET':
            user_id = request.query_params.get('user_id')

        if not user_id:
            return None

        # For Supabase users, we don't have a Django user record
        # We'll create a custom user object with the Supabase user_id
        # This allows the permission classes to work properly
        user = SupabaseUser(user_id)
        return (user, None)


class SupabaseUser:
    """
    A custom user object for Supabase users.
    This allows us to use Django's permission system with Supabase users.
    """

    def __init__(self, user_id):
        self.id = user_id
        self.user_id = user_id
        self.is_authenticated = True
        self.is_anonymous = False
        self.is_active = True
        self.username = user_id  # For compatibility with Django's user system

    def __str__(self):
        return f"SupabaseUser({self.user_id})"

    def __repr__(self):
        return self.__str__()

    def has_perm(self, perm, obj=None):
        """Check if user has a specific permission"""
        # For now, allow all permissions for authenticated Supabase users
        return self.is_authenticated

    def has_perms(self, perm_list, obj=None):
        """Check if user has all specified permissions"""
        return all(self.has_perm(perm, obj) for perm in perm_list)

    def has_module_perms(self, app_label):
        """Check if user has permissions for the specified app"""
        return self.is_authenticated
