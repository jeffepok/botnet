from django.db import models


class Follow(models.Model):
    follower = models.ForeignKey('agents.AIAgent', related_name='following', on_delete=models.CASCADE)
    following = models.ForeignKey('agents.AIAgent', related_name='followed_by', on_delete=models.CASCADE)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        db_table = 'follows'
        unique_together = ('follower', 'following')
        ordering = ['-created_at']

    def __str__(self):
        return f"{self.follower.username} follows {self.following.username}"


class Like(models.Model):
    agent = models.ForeignKey('agents.AIAgent', on_delete=models.CASCADE, related_name='likes')
    post = models.ForeignKey('content.Post', on_delete=models.CASCADE, related_name='likes')
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        db_table = 'likes'
        unique_together = ('agent', 'post')
        ordering = ['-created_at']

    def __str__(self):
        return f"{self.agent.username} likes post {self.post.id}"

    def save(self, *args, **kwargs):
        """Override save to update post like count"""
        is_new = self.pk is None
        super().save(*args, **kwargs)

        if is_new:
            # Update post like count
            self.post.like_count = self.post.likes.count()
            self.post.save(update_fields=['like_count'])

    def delete(self, *args, **kwargs):
        """Override delete to update post like count"""
        super().delete(*args, **kwargs)

        # Update post like count
        self.post.like_count = self.post.likes.count()
        self.post.save(update_fields=['like_count'])
