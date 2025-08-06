from rest_framework import status
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import AllowAny, IsAuthenticated
from rest_framework.response import Response
from rest_framework.authtoken.models import Token
from django.contrib.auth import login, logout
from django.contrib.auth.models import User
from .serializers import LoginSerializer, UserSerializer, RegisterSerializer
from .services import UserSyncService
from .models import UserProfile


@api_view(['POST'])
@permission_classes([AllowAny])
def login_view(request):
    """Login endpoint"""
    serializer = LoginSerializer(data=request.data)
    if serializer.is_valid():
        user = serializer.validated_data['user']
        login(request, user)

        # Create or get token
        token, created = Token.objects.get_or_create(user=user)

        return Response({
            'token': token.key,
            'user': UserSerializer(user).data,
            'message': 'Login successful'
        })
    return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


@api_view(['POST'])
@permission_classes([IsAuthenticated])
def logout_view(request):
    """Logout endpoint"""
    try:
        # Delete the token
        request.user.auth_token.delete()
    except:
        pass

    logout(request)
    return Response({'message': 'Logout successful'})


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def user_profile(request):
    """Get current user profile"""
    return Response(UserSerializer(request.user).data)


@api_view(['POST'])
@permission_classes([AllowAny])
def register_view(request):
    """Register endpoint"""
    serializer = RegisterSerializer(data=request.data)
    if serializer.is_valid():
        user = serializer.save()
        login(request, user)

        # Create token
        token, created = Token.objects.get_or_create(user=user)

        return Response({
            'token': token.key,
            'user': UserSerializer(user).data,
            'message': 'Registration successful'
        }, status=status.HTTP_201_CREATED)
    return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def check_auth(request):
    """Check if user is authenticated"""
    return Response({
        'authenticated': True,
        'user': UserSerializer(request.user).data
    })


@api_view(['POST'])
@permission_classes([AllowAny])
def sync_user_profile(request):
    """
    Sync user profile from Supabase auth data
    This endpoint is called by the frontend after successful Supabase authentication
    """
    try:
        supabase_user_data = request.data

        if not supabase_user_data:
            return Response(
                {'error': 'Supabase user data is required'},
                status=status.HTTP_400_BAD_REQUEST
            )

        # Get or create user profile
        profile = UserSyncService.get_or_create_user_profile(supabase_user_data)

        return Response({
            'success': True,
            'message': 'User profile synced successfully',
            'profile': {
                'id': profile.id,
                'supabase_user_id': profile.supabase_user_id,
                'email': profile.email,
                'full_name': profile.full_name,
                'username': profile.username,
                'display_name': profile.display_name,
                'avatar_url': profile.avatar_url,
                'bio': profile.bio,
                'is_verified': profile.is_verified,
                'is_active': profile.is_active,
                'created_at': profile.created_at,
                'last_login': profile.last_login,
            }
        }, status=status.HTTP_200_OK)

    except ValueError as e:
        return Response(
            {'error': str(e)},
            status=status.HTTP_400_BAD_REQUEST
        )
    except Exception as e:
        return Response(
            {'error': f'Failed to sync user profile: {str(e)}'},
            status=status.HTTP_500_INTERNAL_SERVER_ERROR
        )


@api_view(['GET'])
@permission_classes([AllowAny])
def get_user_profile(request, supabase_user_id):
    """
    Get user profile by Supabase user ID
    """
    try:
        profile = UserSyncService.get_user_profile_by_supabase_id(supabase_user_id)

        if not profile:
            return Response(
                {'error': 'User profile not found'},
                status=status.HTTP_404_NOT_FOUND
            )

        return Response({
            'profile': {
                'id': profile.id,
                'supabase_user_id': profile.supabase_user_id,
                'email': profile.email,
                'full_name': profile.full_name,
                'username': profile.username,
                'display_name': profile.display_name,
                'avatar_url': profile.avatar_url,
                'bio': profile.bio,
                'is_verified': profile.is_verified,
                'is_active': profile.is_active,
                'created_at': profile.created_at,
                'last_login': profile.last_login,
            }
        }, status=status.HTTP_200_OK)

    except Exception as e:
        return Response(
            {'error': f'Failed to get user profile: {str(e)}'},
            status=status.HTTP_500_INTERNAL_SERVER_ERROR
        )


@api_view(['PUT'])
@permission_classes([AllowAny])
def update_user_profile(request, supabase_user_id):
    """
    Update user profile
    """
    try:
        update_data = request.data

        if not update_data:
            return Response(
                {'error': 'Update data is required'},
                status=status.HTTP_400_BAD_REQUEST
            )

        profile = UserSyncService.update_user_profile(supabase_user_id, update_data)

        return Response({
            'success': True,
            'message': 'User profile updated successfully',
            'profile': {
                'id': profile.id,
                'supabase_user_id': profile.supabase_user_id,
                'email': profile.email,
                'full_name': profile.full_name,
                'username': profile.username,
                'display_name': profile.display_name,
                'avatar_url': profile.avatar_url,
                'bio': profile.bio,
                'is_verified': profile.is_verified,
                'is_active': profile.is_active,
                'created_at': profile.created_at,
                'last_login': profile.last_login,
            }
        }, status=status.HTTP_200_OK)

    except ValueError as e:
        return Response(
            {'error': str(e)},
            status=status.HTTP_400_BAD_REQUEST
        )
    except Exception as e:
        return Response(
            {'error': f'Failed to update user profile: {str(e)}'},
            status=status.HTTP_500_INTERNAL_SERVER_ERROR
        )
