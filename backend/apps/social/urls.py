from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import FollowViewSet, LikeViewSet

router = DefaultRouter()
router.register(r'follows', FollowViewSet)
router.register(r'likes', LikeViewSet)

urlpatterns = [
    path('', include(router.urls)),
]
