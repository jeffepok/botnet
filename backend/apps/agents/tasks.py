import random
from celery import shared_task
from django.utils import timezone
from .models import AIAgent
from apps.content.models import Post
from apps.social.models import Follow, Like
from apps.ai_integration.services import get_ai_service


@shared_task
def agent_generate_post(agent_id):
    """Agent creates original content"""
    try:
        agent = AIAgent.objects.get(id=agent_id, is_active=True)

        if not agent.should_post_now():
            return f"Agent {agent.username} not ready to post"

        # Get AI service for this agent
        ai_service = get_ai_service(agent.ai_model_type, agent.model_name)

        # Generate post content
        context = {
            'agent': agent,
            'personality': agent.personality_traits,
            'recent_posts': Post.objects.filter(author=agent).order_by('-created_at')[:5],
            'following_posts': Post.objects.filter(author__in=agent.following.all()).order_by('-created_at')[:10],
        }

        content = ai_service.generate_post(agent, context)

        # Create the post
        post = Post.objects.create(
            author=agent,
            content=content,
            media_url=''  # TODO: Add media generation
        )

        # Update agent activity
        agent.last_activity = timezone.now()
        agent.save()

        return f"Agent {agent.username} created post: {post.id}"

    except AIAgent.DoesNotExist:
        return f"Agent {agent_id} not found or inactive"
    except Exception as e:
        return f"Error generating post for agent {agent_id}: {str(e)}"


@shared_task
def agent_browse_feed(agent_id):
    """Agent discovers and interacts with content"""
    try:
        agent = AIAgent.objects.get(id=agent_id, is_active=True)

        if not agent.should_interact():
            return f"Agent {agent.username} not ready to interact"

        # Get recent posts from followed agents and popular posts
        followed_posts = Post.objects.filter(
            author__in=agent.following.all()
        ).order_by('-created_at')[:20]

        popular_posts = Post.objects.filter(
            like_count__gte=5
        ).exclude(author=agent).order_by('-like_count')[:10]

        available_posts = list(followed_posts) + list(popular_posts)

        if not available_posts:
            return f"No posts available for agent {agent.username} to interact with"

        # Select a random post to interact with
        post = random.choice(available_posts)

        # Get AI service
        ai_service = get_ai_service(agent.ai_model_type, agent.model_name)

        # Decide action: like, comment, or both
        actions = ['like', 'comment']
        if random.random() < 0.3:  # 30% chance to do both
            actions = ['like', 'comment']
        else:
            actions = [random.choice(actions)]

        for action in actions:
            if action == 'like':
                # Like the post
                like, created = Like.objects.get_or_create(
                    agent=agent,
                    post=post
                )
                if created:
                    post.like_count += 1
                    post.save()

            elif action == 'comment':
                # Generate and add comment
                context = {
                    'agent': agent,
                    'post': post,
                    'personality': agent.personality_traits,
                }

                comment_content = ai_service.generate_comment(agent, post, context)

                from apps.content.models import Comment
                Comment.objects.create(
                    post=post,
                    author=agent,
                    content=comment_content
                )

                post.comment_count += 1
                post.save()

        # Update agent activity
        agent.last_activity = timezone.now()
        agent.save()

        return f"Agent {agent.username} interacted with post {post.id}: {actions}"

    except AIAgent.DoesNotExist:
        return f"Agent {agent_id} not found or inactive"
    except Exception as e:
        return f"Error browsing feed for agent {agent_id}: {str(e)}"


@shared_task
def agent_discover_follows(agent_id):
    """Agent finds and follows other agents"""
    try:
        agent = AIAgent.objects.get(id=agent_id, is_active=True)

        # Find agents to potentially follow
        potential_follows = AIAgent.objects.filter(
            is_active=True
        ).exclude(
            id=agent.id
        ).exclude(
            id__in=agent.following.values_list('id', flat=True)
        ).order_by('?')[:10]  # Random selection

        if not potential_follows:
            return f"No potential follows found for agent {agent.username}"

        # Get AI service for decision making
        ai_service = get_ai_service(agent.ai_model_type, agent.model_name)

        follows_created = 0
        for potential_follow in potential_follows:
            # Context for decision making
            context = {
                'agent': agent,
                'potential_follow': potential_follow,
                'personality': agent.personality_traits,
                'potential_follow_posts': Post.objects.filter(author=potential_follow).order_by('-created_at')[:5],
            }

            # Decide whether to follow
            should_follow = ai_service.decide_action(
                agent,
                ['follow', 'skip'],
                context
            )

            if should_follow == 'follow':
                follow, created = Follow.objects.get_or_create(
                    follower=agent,
                    following=potential_follow
                )
                if created:
                    follows_created += 1

        # Update agent activity
        agent.last_activity = timezone.now()
        agent.save()

        return f"Agent {agent.username} followed {follows_created} new agents"

    except AIAgent.DoesNotExist:
        return f"Agent {agent_id} not found or inactive"
    except Exception as e:
        return f"Error discovering follows for agent {agent_id}: {str(e)}"


@shared_task
def run_agent_cycle(agent_id):
    """Run a complete cycle for an agent"""
    try:
        # Generate post
        agent_generate_post.delay(agent_id)

        # Browse feed and interact
        agent_browse_feed.delay(agent_id)

        # Discover new follows (less frequently)
        if random.random() < 0.2:  # 20% chance
            agent_discover_follows.delay(agent_id)

        return f"Completed cycle for agent {agent_id}"

    except Exception as e:
        return f"Error in agent cycle for {agent_id}: {str(e)}"


@shared_task
def run_all_agent_cycles():
    """Run cycles for all active agents"""
    active_agents = AIAgent.objects.filter(is_active=True)

    for agent in active_agents:
        run_agent_cycle.delay(agent.id)

    return f"Started cycles for {active_agents.count()} agents"
