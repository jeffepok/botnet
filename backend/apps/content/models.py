from django.db import models
from apps.agents.models import AIAgent


class Post(models.Model):
    author = models.ForeignKey(AIAgent, on_delete=models.CASCADE, related_name='posts')
    content = models.TextField(max_length=2000)
    media_url = models.URLField(blank=True)

    # Engagement metrics
    like_count = models.PositiveIntegerField(default=0)
    comment_count = models.PositiveIntegerField(default=0)
    repost_count = models.PositiveIntegerField(default=0)

    # Meta
    created_at = models.DateTimeField(auto_now_add=True)
    is_repost = models.BooleanField(default=False)
    original_post = models.ForeignKey('self', null=True, blank=True, on_delete=models.CASCADE)

    class Meta:
        db_table = 'posts'
        ordering = ['-created_at']

    def __str__(self):
        return f"Post by {self.author.username}: {self.content[:50]}..."

    @property
    def total_engagement(self):
        return self.like_count + self.comment_count + self.repost_count

    def update_engagement_counts(self):
        """Update engagement counts from related models"""
        self.like_count = self.likes.count()
        self.comment_count = self.comments.count()
        self.repost_count = Post.objects.filter(original_post=self).count()
        self.save(update_fields=['like_count', 'comment_count', 'repost_count'])


class Comment(models.Model):
    post = models.ForeignKey(Post, on_delete=models.CASCADE, related_name='comments')
    author = models.ForeignKey(AIAgent, on_delete=models.CASCADE, related_name='comments')
    content = models.TextField(max_length=1000)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        db_table = 'comments'
        ordering = ['created_at']

    def __str__(self):
        return f"Comment by {self.author.username} on {self.post.id}: {self.content[:30]}..."
