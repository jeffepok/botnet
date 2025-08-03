from celery import shared_task
from django.utils import timezone
from datetime import timedelta
from .models import PlatformMetrics, AgentBehavior, EmergentPattern, NetworkAnalysis
from apps.agents.models import AIAgent
from apps.content.models import Post
from apps.social.models import Follow, Like
from django.db import models


@shared_task
def platform_analytics_update():
    """Update platform analytics and metrics"""
    today = timezone.now().date()

    # Get or create today's metrics
    metrics, created = PlatformMetrics.objects.get_or_create(date=today)

    # Update total counts
    metrics.total_agents = AIAgent.objects.count()
    metrics.active_agents = AIAgent.objects.filter(is_active=True).count()
    metrics.total_posts = Post.objects.count()
    metrics.total_likes = Like.objects.count()
    metrics.total_comments = Post.objects.aggregate(
        total=models.Sum('comment_count')
    )['total'] or 0
    metrics.total_follows = Follow.objects.count()

    # Update today's activity
    today_start = timezone.now().replace(hour=0, minute=0, second=0, microsecond=0)
    today_end = today_start + timedelta(days=1)

    metrics.posts_created_today = Post.objects.filter(
        created_at__range=(today_start, today_end)
    ).count()

    metrics.likes_given_today = Like.objects.filter(
        created_at__range=(today_start, today_end)
    ).count()

    metrics.comments_made_today = Post.objects.filter(
        comments__created_at__range=(today_start, today_end)
    ).count()

    metrics.follows_created_today = Follow.objects.filter(
        created_at__range=(today_start, today_end)
    ).count()

    metrics.save()

    return f"Updated platform metrics for {today}"


@shared_task
def update_agent_behaviors():
    """Update individual agent behavior tracking"""
    today = timezone.now().date()
    today_start = timezone.now().replace(hour=0, minute=0, second=0, microsecond=0)
    today_end = today_start + timedelta(days=1)

    for agent in AIAgent.objects.filter(is_active=True):
        # Get or create behavior record for today
        behavior, created = AgentBehavior.objects.get_or_create(
            agent=agent,
            date=today
        )

        # Update behavior metrics
        behavior.posts_created = Post.objects.filter(
            author=agent,
            created_at__range=(today_start, today_end)
        ).count()

        behavior.likes_given = Like.objects.filter(
            agent=agent,
            created_at__range=(today_start, today_end)
        ).count()

        behavior.comments_made = Post.objects.filter(
            comments__author=agent,
            comments__created_at__range=(today_start, today_end)
        ).count()

        behavior.follows_created = Follow.objects.filter(
            follower=agent,
            created_at__range=(today_start, today_end)
        ).count()

        # Calculate followers gained today
        yesterday = today - timedelta(days=1)
        followers_yesterday = Follow.objects.filter(
            following=agent,
            created_at__lt=today_start
        ).count()

        followers_today = Follow.objects.filter(
            following=agent,
            created_at__lt=today_end
        ).count()

        behavior.followers_gained = followers_today - followers_yesterday

        # Calculate engagement rate
        if behavior.posts_created > 0:
            behavior.engagement_rate = (behavior.likes_given + behavior.comments_made) / behavior.posts_created
        else:
            behavior.engagement_rate = 0.0

        behavior.save()

    return f"Updated behavior tracking for {AIAgent.objects.filter(is_active=True).count()} agents"


@shared_task
def detect_emergent_patterns():
    """Detect emergent behaviors and patterns"""
    today = timezone.now().date()
    week_ago = today - timedelta(days=7)

    # Detect viral content
    viral_posts = Post.objects.filter(
        like_count__gte=10,
        created_at__date__gte=week_ago
    ).order_by('-like_count')[:5]

    if viral_posts.exists():
        pattern, created = EmergentPattern.objects.get_or_create(
            pattern_type='viral_content',
            title='Viral Content Detection',
            defaults={
                'description': 'High-engagement content detected',
                'confidence_score': 0.8,
                'start_date': timezone.now(),
                'is_active': True,
            }
        )

        if created:
            pattern.related_posts.set(viral_posts)
            pattern.affected_agents.set([post.author for post in viral_posts])

    # Detect echo chambers (agents following similar patterns)
    # This is a simplified detection - in practice, you'd use more sophisticated algorithms
    high_engagement_agents = AIAgent.objects.filter(
        behaviors__engagement_rate__gte=2.0,
        behaviors__date__gte=week_ago
    ).distinct()

    if high_engagement_agents.count() >= 3:
        pattern, created = EmergentPattern.objects.get_or_create(
            pattern_type='echo_chamber',
            title='High Engagement Cluster',
            defaults={
                'description': 'Group of agents with high engagement patterns',
                'confidence_score': 0.6,
                'start_date': timezone.now(),
                'is_active': True,
            }
        )

        if created:
            pattern.affected_agents.set(high_engagement_agents)

    # Detect influencer emergence
    influencers = AIAgent.objects.filter(
        follower_count__gte=5,
        behaviors__engagement_rate__gte=1.5
    ).distinct()

    if influencers.exists():
        pattern, created = EmergentPattern.objects.get_or_create(
            pattern_type='influencer_emergence',
            title='Influencer Emergence',
            defaults={
                'description': 'Agents with high follower counts and engagement',
                'confidence_score': 0.7,
                'start_date': timezone.now(),
                'is_active': True,
            }
        )

        if created:
            pattern.affected_agents.set(influencers)

    return f"Detected {EmergentPattern.objects.filter(is_active=True).count()} active patterns"


@shared_task
def update_network_analysis():
    """Update social network analysis"""
    today = timezone.now().date()

    # Get or create network analysis for today
    analysis, created = NetworkAnalysis.objects.get_or_create(date=today)

    # Calculate basic network metrics
    total_agents = AIAgent.objects.filter(is_active=True).count()
    total_follows = Follow.objects.count()

    analysis.total_nodes = total_agents
    analysis.total_edges = total_follows

    if total_agents > 0:
        analysis.average_degree = (2 * total_follows) / total_agents
        analysis.density = (2 * total_follows) / (total_agents * (total_agents - 1))
    else:
        analysis.average_degree = 0.0
        analysis.density = 0.0

    # Calculate influential agents (simplified)
    influential_agents = []
    for agent in AIAgent.objects.filter(is_active=True):
        influence_score = (agent.follower_count * 0.6) + (agent.post_count * 0.2) + (agent.likes.count() * 0.2)
        influential_agents.append({
            'agent_id': agent.id,
            'username': agent.username,
            'influence_score': influence_score
        })

    # Sort by influence score and take top 10
    influential_agents.sort(key=lambda x: x['influence_score'], reverse=True)
    analysis.influential_agents = influential_agents[:10]

    # Simple community detection (agents with similar engagement patterns)
    communities = {}
    for agent in AIAgent.objects.filter(is_active=True):
        if agent.post_count > 0:
            engagement_level = agent.likes.count() / agent.post_count
            if engagement_level > 2.0:
                community = 'high_engagement'
            elif engagement_level > 1.0:
                community = 'medium_engagement'
            else:
                community = 'low_engagement'

            if community not in communities:
                communities[community] = []
            communities[community].append(agent.id)

    analysis.community_data = communities

    analysis.save()

    return f"Updated network analysis for {today}"


@shared_task
def run_analytics_pipeline():
    """Run the complete analytics pipeline"""
    try:
        # Update platform metrics
        platform_analytics_update.delay()

        # Update agent behaviors
        update_agent_behaviors.delay()

        # Detect emergent patterns
        detect_emergent_patterns.delay()

        # Update network analysis
        update_network_analysis.delay()

        return "Analytics pipeline completed successfully"

    except Exception as e:
        return f"Analytics pipeline failed: {str(e)}"
