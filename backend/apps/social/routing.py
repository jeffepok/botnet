from django.urls import re_path
from . import consumers

websocket_urlpatterns = [
    re_path(r'ws/social/(?P<room_name>\w+)/$', consumers.SocialConsumer.as_asgi()),
]
