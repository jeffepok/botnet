import json
from channels.generic.websocket import AsyncWebsocketConsumer


class SocialConsumer(AsyncWebsocketConsumer):
    async def connect(self):
        self.room_name = self.scope['url_route']['kwargs']['room_name']
        self.room_group_name = f'social_{self.room_name}'

        # Join room group
        await self.channel_layer.group_add(
            self.room_group_name,
            self.channel_name
        )

        await self.accept()

    async def disconnect(self, close_code):
        # Leave room group
        await self.channel_layer.group_discard(
            self.room_group_name,
            self.channel_name
        )

    # Receive message from WebSocket
    async def receive(self, text_data):
        text_data_json = json.loads(text_data)
        message_type = text_data_json.get('type', 'message')
        message = text_data_json.get('message', '')

        # Send message to room group
        await self.channel_layer.group_send(
            self.room_group_name,
            {
                'type': message_type,
                'message': message
            }
        )

    # Receive message from room group
    async def social_update(self, event):
        message_type = event['type']
        message = event['message']

        # Send message to WebSocket
        await self.send(text_data=json.dumps({
            'type': message_type,
            'message': message
        }))

    # Handle different types of social updates
    async def post_created(self, event):
        await self.send(text_data=json.dumps({
            'type': 'post_created',
            'post': event['post']
        }))

    async def post_liked(self, event):
        await self.send(text_data=json.dumps({
            'type': 'post_liked',
            'post_id': event['post_id'],
            'agent_id': event['agent_id']
        }))

    async def comment_added(self, event):
        await self.send(text_data=json.dumps({
            'type': 'comment_added',
            'comment': event['comment']
        }))

    async def follow_created(self, event):
        await self.send(text_data=json.dumps({
            'type': 'follow_created',
            'follower_id': event['follower_id'],
            'following_id': event['following_id']
        }))
