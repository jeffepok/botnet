import jwt
import requests
import json
import time
from rest_framework import authentication
from rest_framework import exceptions
from django.conf import settings
from django.contrib.auth.models import AnonymousUser
from .models import UserProfile


class SupabaseJWTAuthentication(authentication.BaseAuthentication):
    """
    JWT-based authentication for Supabase users.
    Validates Supabase JWT tokens with structure validation.
    """

    def __init__(self):
        self.supabase_url = getattr(settings, 'SUPABASE_URL', None)
        self.supabase_anon_key = getattr(settings, 'SUPABASE_ANON_KEY', None)

    def authenticate(self, request):
        # Get the Authorization header
        auth_header = request.META.get('HTTP_AUTHORIZATION', '')
        print("auth_header", auth_header)
        if not auth_header.startswith('Bearer '):
            return None

        # Extract the token
        token = auth_header.split(' ')[1]

        print("token", token)

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
        Validate Supabase JWT token structure.
        """
        try:
            # Decode without verification to check structure
            payload = jwt.decode(token, options={"verify_signature": False})

            # Validate required fields
            if 'sub' not in payload or 'email' not in payload:
                raise jwt.InvalidTokenError('Token missing required fields')

            # Check if token is expired
            if 'exp' in payload:
                if payload['exp'] < time.time():
                    raise jwt.ExpiredSignatureError('Token has expired')

            # Verify this is a Supabase token by checking issuer
            if 'iss' in payload:
                # Check if it matches our Supabase URL or is a Supabase domain
                if self.supabase_url and payload['iss'] != self.supabase_url:
                    # Fallback: check if it's a Supabase domain
                    if not ('supabase' in payload['iss'] or payload['iss'].endswith('.co')):
                        raise jwt.InvalidTokenError('Invalid token issuer')

            # Verify audience if present
            if 'aud' in payload:
                if payload['aud'] not in ['authenticated', 'anon']:
                    raise jwt.InvalidTokenError('Invalid token audience')

            # Additional security checks
            if 'role' in payload:
                if payload['role'] not in ['authenticated', 'anon']:
                    raise jwt.InvalidTokenError('Invalid token role')

            return {
                'id': payload['sub'],
                'email': payload['email'],
                'user_metadata': payload.get('user_metadata', {}),
                'email_confirmed_at': payload.get('email_confirmed_at'),
            }

        except jwt.DecodeError:
            raise jwt.InvalidTokenError('Invalid token format')
        except jwt.ExpiredSignatureError:
            raise jwt.ExpiredSignatureError('Token has expired')

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
