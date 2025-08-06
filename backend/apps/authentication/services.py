from django.utils import timezone
from .models import UserProfile


class UserSyncService:
    """Service for synchronizing Supabase users with Django database"""

    @staticmethod
    def get_or_create_user_profile(supabase_user_data):
        """
        Get or create a user profile from Supabase user data

        Args:
            supabase_user_data (dict): User data from Supabase auth

        Returns:
            UserProfile: The user profile instance
        """
        supabase_user_id = supabase_user_data.get('id')
        email = supabase_user_data.get('email')

        if not supabase_user_id or not email:
            raise ValueError("Supabase user data must contain 'id' and 'email'")

        # Try to get existing profile
        try:
            profile = UserProfile.objects.get(supabase_user_id=supabase_user_id)
            # Update last login
            profile.update_last_login()
            return profile
        except UserProfile.DoesNotExist:
            pass

        # Create new profile
        profile = UserProfile.objects.create(
            supabase_user_id=supabase_user_id,
            email=email,
            full_name=supabase_user_data.get('user_metadata', {}).get('full_name', ''),
            avatar_url=supabase_user_data.get('user_metadata', {}).get('avatar_url', ''),
            username=supabase_user_data.get('user_metadata', {}).get('username', ''),
            display_name=supabase_user_data.get('user_metadata', {}).get('full_name', ''),
            is_verified=supabase_user_data.get('email_confirmed_at') is not None,
            last_login=timezone.now()
        )

        return profile

    @staticmethod
    def update_user_profile(supabase_user_id, update_data):
        """
        Update an existing user profile

        Args:
            supabase_user_id (str): The Supabase user ID
            update_data (dict): Data to update

        Returns:
            UserProfile: The updated user profile instance
        """
        try:
            profile = UserProfile.objects.get(supabase_user_id=supabase_user_id)

            # Update fields
            for field, value in update_data.items():
                if hasattr(profile, field):
                    setattr(profile, field, value)

            profile.save()
            return profile
        except UserProfile.DoesNotExist:
            raise ValueError(f"User profile not found for Supabase user ID: {supabase_user_id}")

    @staticmethod
    def get_user_profile_by_supabase_id(supabase_user_id):
        """
        Get user profile by Supabase user ID

        Args:
            supabase_user_id (str): The Supabase user ID

        Returns:
            UserProfile: The user profile instance or None
        """
        try:
            return UserProfile.objects.get(supabase_user_id=supabase_user_id)
        except UserProfile.DoesNotExist:
            return None

    @staticmethod
    def get_user_profile_by_email(email):
        """
        Get user profile by email

        Args:
            email (str): The user's email

        Returns:
            UserProfile: The user profile instance or None
        """
        try:
            return UserProfile.objects.get(email=email)
        except UserProfile.DoesNotExist:
            return None
