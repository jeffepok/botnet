import jwt
import requests
from rest_framework import authentication
from rest_framework import exceptions
from django.conf import settings
from django.contrib.auth.models import AnonymousUser
from .models import UserProfile


class SupabaseJWTAuthentication(authentication.BaseAuthentication):
    """
    JWT-based authentication for Supabase users.
    Validates Supabase JWT tokens and returns authenticated user.
    """

    def authenticate(self, request):
        # Get the Authorization header
        auth_header = request.META.get('HTTP_AUTHORIZATION', '')
        
        if not auth_header.startswith('Bearer '):
            return None
        
        # Extract the token
        token = auth_header.split(' ')[1]
        
        try:
            # Validate the JWT token
            user_data = self.validate_supabase_token(token)
            
            # Get or create user profile
            user_profile = self.get_or_create_user_profile(user_data)
            
            # Create authenticated user object
            user = SupabaseAuthenticatedUser(user_profile)
            
            return (user, None)
            
        except jwt.InvalidTokenError:
            raise exceptions.AuthenticationFailed('Invalid token')
        except jwt.ExpiredSignatureError:
            raise exceptions.AuthenticationFailed('Token has expired')
        except Exception as e:
            raise exceptions.AuthenticationFailed(f'Authentication failed: {str(e)}')

    def validate_supabase_token(self, token):
        """
        Validate Supabase JWT token.
        In production, you should verify the token signature with Supabase's public key.
        For now, we'll decode and validate the token structure.
        """
        try:
            # Decode the token without verification for now
            # In production, you should verify the signature
            payload = jwt.decode(token, options={"verify_signature": False})
            
            # Check if token has required fields
            if 'sub' not in payload or 'email' not in payload:
                raise jwt.InvalidTokenError('Token missing required fields')
            
            return {
                'id': payload['sub'],
                'email': payload['email'],
                'user_metadata': payload.get('user_metadata', {}),
                'email_confirmed_at': payload.get('email_confirmed_at'),
            }
            
        except jwt.DecodeError:
            raise jwt.InvalidTokenError('Invalid token format')

    def get_or_create_user_profile(self, user_data):
        """
        Get or create a UserProfile for the authenticated user.
        """
        from .services import UserSyncService
        return UserSyncService.get_or_create_user_profile(user_data)


class SupabaseAuthenticatedUser:
    """
    An authenticated user object for Supabase users with JWT validation.
    """

    def __init__(self, user_profile):
        self.user_profile = user_profile
        self.id = user_profile.supabase_user_id
        self.supabase_user_id = user_profile.supabase_user_id
        self.email = user_profile.email
        self.is_authenticated = True
        self.is_anonymous = False
        self.is_active = user_profile.is_active
        self.username = user_profile.username or user_profile.email

    def __str__(self):
        return f"SupabaseAuthenticatedUser({self.email})"

    def __repr__(self):
        return self.__str__()

    def has_perm(self, perm, obj=None):
        """Check if user has a specific permission"""
        return self.is_authenticated and self.is_active

    def has_perms(self, perm_list, obj=None):
        """Check if user has all specified permissions"""
        return all(self.has_perm(perm, obj) for perm in perm_list)

    def has_module_perms(self, app_label):
        """Check if user has permissions for the specified app"""
        return self.is_authenticated and self.is_active 