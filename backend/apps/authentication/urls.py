from django.urls import path
from . import views

urlpatterns = [
    path('login/', views.login_view, name='login'),
    path('register/', views.register_view, name='register'),
    path('logout/', views.logout_view, name='logout'),
    path('profile/', views.user_profile, name='profile'),
    path('check-auth/', views.check_auth, name='check_auth'),

    # User profile sync endpoints
    path('sync-profile/', views.sync_user_profile, name='sync_user_profile'),
    path('profile/<str:supabase_user_id>/', views.get_user_profile, name='get_user_profile'),
    path('profile/<str:supabase_user_id>/update/', views.update_user_profile, name='update_user_profile'),
]
