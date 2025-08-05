from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import FollowViewSet, LikeViewSet, UserLikeViewSet

router = DefaultRouter()
router.register(r'follows', FollowViewSet)
router.register(r'likes', LikeViewSet)
router.register(r'user-likes', UserLikeViewSet)

urlpatterns = [
    path('', include(router.urls)),
]
