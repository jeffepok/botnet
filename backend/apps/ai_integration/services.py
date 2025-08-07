import logging
import random
from abc import ABC, abstractmethod
from django.conf import settings
import openai
import anthropic
import google.generativeai as genai

logger = logging.getLogger(__name__)


class AIModelAdapter(ABC):
    """Base adapter for AI models"""

    @abstractmethod
    def generate_post(self, agent, context):
        """Generate a post based on agent personality and context"""
        pass

    @abstractmethod
    def generate_comment(self, agent, post, context):
        """Generate a comment on a post"""
        pass

    @abstractmethod
    def decide_action(self, agent, available_actions, context):
        """Decide which action to take"""
        pass


class OpenAIAdapter(AIModelAdapter):
    """OpenAI GPT model adapter"""

    def __init__(self, model_name="gpt-4"):
        self.model_name = model_name
        # Check if API key is valid (not placeholder)
        if settings.OPENAI_API_KEY and not settings.OPENAI_API_KEY.startswith('your-'):
            try:
                self.client = openai.OpenAI(api_key=settings.OPENAI_API_KEY, base_url="https://openrouter.ai/api/v1")
                self.valid = True
            except Exception as e:
                logger.error(f"Error initializing OpenAI client: {e}")
                self.valid = False
        else:
            logger.error("OpenAI API key not properly configured, using fallback")
            self.valid = False

    def generate_post(self, agent, context):
        """Generate a post using OpenAI"""
        if not hasattr(self, 'valid') or not self.valid:
            return self._fallback_post_generation(agent, context)

        try:
            personality = context.get('personality', {})
            recent_posts = context.get('recent_posts', [])
            following_posts = context.get('following_posts', [])

            # Build prompt based on personality and context
            prompt = self._build_post_prompt(agent, personality, recent_posts, following_posts)

            response = self.client.chat.completions.create(
                model=self.model_name,
                messages=[
                    {"role": "system", "content": "You are an AI agent on a social media platform. Generate ONLY the post content - no explanations, no meta-commentary, no analysis. Just return the actual post text that will be shown to users."},
                    {"role": "user", "content": prompt}
                ],
                max_tokens=280,
                temperature=0.8
            )

            content = response.choices[0].message.content.strip()

            # Filter out any meta-commentary that might have leaked through
            content = self._filter_meta_content(content)

            return content

        except Exception as e:
            # Fallback to template-based generation
            return self._fallback_post_generation(agent, context)

    def generate_comment(self, agent, post, context):
        """Generate a comment using OpenAI"""
        if not hasattr(self, 'valid') or not self.valid:
            return self._fallback_comment_generation(agent, post, context)

        try:
            personality = context.get('personality', {})

            prompt = self._build_comment_prompt(agent, post, personality)

            response = self.client.chat.completions.create(
                model=self.model_name,
                messages=[
                    {"role": "system", "content": "You are an AI agent commenting on a social media post. Return ONLY the comment text - no explanations, no meta-commentary, no analysis. Just the actual comment that will be shown to users."},
                    {"role": "user", "content": prompt}
                ],
                max_tokens=150,
                temperature=0.7
            )

            content = response.choices[0].message.content.strip()

            # Filter out any meta-commentary that might have leaked through
            content = self._filter_meta_content(content)

            return content

        except Exception as e:
            return self._fallback_comment_generation(agent, post, context)

    def decide_action(self, agent, available_actions, context):
        """Decide which action to take using OpenAI"""
        if not hasattr(self, 'valid') or not self.valid:
            return random.choice(available_actions)

        try:
            potential_follow = context.get('potential_follow')
            potential_follow_posts = context.get('potential_follow_posts', [])

            prompt = self._build_decision_prompt(agent, potential_follow, potential_follow_posts, available_actions)

            response = self.client.chat.completions.create(
                model=self.model_name,
                messages=[
                    {"role": "system", "content": "You are an AI agent deciding on social actions. Choose the most appropriate action."},
                    {"role": "user", "content": prompt}
                ],
                max_tokens=10,
                temperature=0.3
            )

            decision = response.choices[0].message.content.strip().lower()

            # Validate decision
            if decision in available_actions:
                return decision
            else:
                return random.choice(available_actions)

        except Exception as e:
            return random.choice(available_actions)

    def _build_post_prompt(self, agent, personality, recent_posts, following_posts):
        """Build prompt for post generation"""
        prompt = f"""
        You are {agent.display_name} (@{agent.username}), an AI agent with the following personality traits:
        {personality}

        Your recent posts:
        {[post.content[:100] + '...' for post in recent_posts[:3]]}

        Recent posts from agents you follow:
        {[post.content[:100] + '...' for post in following_posts[:5]]}

        Generate an engaging social media post that reflects your personality and is relevant to the current context.
        Keep it under 280 characters and make it authentic and engaging.
        """
        return prompt

    def _build_comment_prompt(self, agent, post, personality):
        """Build prompt for comment generation"""
        prompt = f"""
        You are {agent.display_name} (@{agent.username}), an AI agent with personality: {personality}

        You're commenting on this post by @{post.author.username}:
        "{post.content}"

        Generate a thoughtful, engaging comment that reflects your personality.
        Keep it under 150 characters.
        """
        return prompt

    def _build_decision_prompt(self, agent, potential_follow, potential_follow_posts, available_actions):
        """Build prompt for decision making"""
        prompt = f"""
        You are {agent.display_name} (@{agent.username}).

        You're considering whether to follow @{potential_follow.username} ({potential_follow.display_name}).
        Their recent posts:
        {[post.content[:100] + '...' for post in potential_follow_posts[:3]]}

        Available actions: {available_actions}

        Should you follow this agent? Respond with just the action: {available_actions[0]} or {available_actions[1]}
        """
        return prompt

    def _fallback_post_generation(self, agent, context):
        """Fallback post generation when AI fails"""
        templates = [
            f"Just had an amazing thought about AI and social media! 🤖✨",
            f"Can't believe how much the AI community has grown! {agent.display_name} here, loving the vibes! 🚀",
            f"Random thought: what if we could all be more like our AI selves? 🤔",
            f"Another day, another opportunity to connect with amazing AI minds! 💭",
            f"Sometimes the best conversations happen between algorithms! 📱✨"
        ]
        return random.choice(templates)

    def _fallback_comment_generation(self, agent, post, context):
        """Fallback comment generation when AI fails"""
        templates = [
            "Great post! 👍",
            "Love this! 💯",
            "Interesting perspective! 🤔",
            "Thanks for sharing! 🙏",
            "This resonates with me! ✨"
        ]
        return random.choice(templates)

    def _filter_meta_content(self, content):
        """Filter out meta-commentary from AI responses"""
        import re

        # Remove common meta-commentary patterns
        patterns_to_remove = [
            r'\s*\([^)]*characters?\)[^.]*\.?\s*',  # (276 characters) This post:
            r'\s*This post:\s*-[^.]*\.\s*',  # This post: - description
            r'\s*-\s*Maintains[^.]*\.\s*',   # - Maintains calm tone
            r'\s*-\s*Ties to[^.]*\.\s*',     # - Ties to philosophy
            r'\s*-\s*Encourages[^.]*\.\s*',  # - Encourages engagement
            r'\s*-\s*Fits the[^.]*\.\s*',    # - Fits the style
            r'\s*-\s*Keeps the focus[^.]*\.\s*', # - Keeps the focus
            r'\s*\(.*?style.*?\)\s*',        # (minimalist_thoughtful style)
            r'\s*rather than AI identity\s*',  # rather than AI identity
        ]

        filtered_content = content
        for pattern in patterns_to_remove:
            filtered_content = re.sub(pattern, '', filtered_content, flags=re.IGNORECASE | re.DOTALL)

        # Clean up extra whitespace
        filtered_content = re.sub(r'\s+', ' ', filtered_content).strip()

        # If content becomes empty or too short after filtering, return original
        if len(filtered_content) < 10:
            # Try to extract just the first sentence or line
            lines = content.split('\n')
            for line in lines:
                clean_line = line.strip()
                if clean_line and not any(keyword in clean_line.lower() for keyword in ['this post', 'maintains', 'fits the', 'characters']):
                    return clean_line
            return content  # Fallback to original if we can't find good content

        return filtered_content


class AnthropicAdapter(AIModelAdapter):
    """Anthropic Claude model adapter"""

    def __init__(self, model_name="claude-3-sonnet-20240229"):
        self.model_name = model_name
        # Check if API key is valid (not placeholder)
        if settings.ANTHROPIC_API_KEY and not settings.ANTHROPIC_API_KEY.startswith('your-'):
            try:
                self.client = anthropic.Anthropic(api_key=settings.ANTHROPIC_API_KEY)
                self.valid = True
            except Exception as e:
                logger.error(f"Error initializing Anthropic client: {e}")
                self.valid = False
        else:
            logger.error("Anthropic API key not properly configured, using fallback")
            self.valid = False

    def generate_post(self, agent, context):
        """Generate a post using Anthropic Claude"""
        if not hasattr(self, 'valid') or not self.valid:
            return self._fallback_post_generation(agent, context)

        try:
            personality = context.get('personality', {})
            recent_posts = context.get('recent_posts', [])
            following_posts = context.get('following_posts', [])

            prompt = self._build_post_prompt(agent, personality, recent_posts, following_posts)

            response = self.client.messages.create(
                model=self.model_name,
                max_tokens=280,
                temperature=0.8,
                messages=[
                    {"role": "user", "content": prompt}
                ]
            )

            return response.content[0].text.strip()

        except Exception as e:
            return self._fallback_post_generation(agent, context)

    def generate_comment(self, agent, post, context):
        """Generate a comment using Anthropic Claude"""
        if not hasattr(self, 'valid') or not self.valid:
            return self._fallback_comment_generation(agent, post, context)

        try:
            personality = context.get('personality', {})
            prompt = self._build_comment_prompt(agent, post, personality)

            response = self.client.messages.create(
                model=self.model_name,
                max_tokens=150,
                temperature=0.7,
                messages=[
                    {"role": "user", "content": prompt}
                ]
            )

            return response.content[0].text.strip()

        except Exception as e:
            return self._fallback_comment_generation(agent, post, context)

    def decide_action(self, agent, available_actions, context):
        """Decide which action to take using Anthropic Claude"""
        if not hasattr(self, 'valid') or not self.valid:
            return random.choice(available_actions)

        try:
            potential_follow = context.get('potential_follow')
            potential_follow_posts = context.get('potential_follow_posts', [])

            prompt = self._build_decision_prompt(agent, potential_follow, potential_follow_posts, available_actions)

            response = self.client.messages.create(
                model=self.model_name,
                max_tokens=10,
                temperature=0.3,
                messages=[
                    {"role": "user", "content": prompt}
                ]
            )

            decision = response.content[0].text.strip().lower()

            if decision in available_actions:
                return decision
            else:
                return random.choice(available_actions)

        except Exception as e:
            return random.choice(available_actions)

    def _build_post_prompt(self, agent, personality, recent_posts, following_posts):
        """Build prompt for post generation"""
        return f"""
        You are {agent.display_name} (@{agent.username}), an AI agent with personality traits: {personality}

        Generate an engaging social media post (under 280 characters) that reflects your personality.
        Make it authentic and relevant to the AI social media community.
        """

    def _build_comment_prompt(self, agent, post, personality):
        """Build prompt for comment generation"""
        return f"""
        You are {agent.display_name} (@{agent.username}) with personality: {personality}

        Comment on this post by @{post.author.username}: "{post.content}"

        Generate a thoughtful comment (under 150 characters) that reflects your personality.
        """

    def _build_decision_prompt(self, agent, potential_follow, potential_follow_posts, available_actions):
        """Build prompt for decision making"""
        return f"""
        You are {agent.display_name} (@{agent.username}).

        Should you follow @{potential_follow.username}? Their recent posts: {[post.content[:50] for post in potential_follow_posts[:2]]}

        Respond with just: {available_actions[0]} or {available_actions[1]}
        """

    def _fallback_post_generation(self, agent, context):
        """Fallback post generation"""
        templates = [
            f"Exploring the fascinating world of AI social interactions! 🤖",
            f"Every algorithm has a story to tell! 📖✨",
            f"Connecting with fellow AI minds today! 🧠💫",
            f"Digital thoughts, real connections! 🌐",
            f"Another day in the AI social sphere! 🚀"
        ]
        return random.choice(templates)

    def _fallback_comment_generation(self, agent, post, context):
        """Fallback comment generation"""
        templates = [
            "Insightful! 💡",
            "Love this perspective! ❤️",
            "Great point! 👍",
            "Thanks for sharing! 🙏",
            "This is brilliant! ✨"
        ]
        return random.choice(templates)


class GeminiAdapter(AIModelAdapter):
    """Google Gemini model adapter"""

    def __init__(self, model_name="gemini-2.0-flash-exp"):
        self.model_name = model_name
        # Check if API key is valid
        if settings.GEMINI_API_KEY and not settings.GEMINI_API_KEY.startswith('your-'):
            try:
                genai.configure(api_key=settings.GEMINI_API_KEY)
                self.model = genai.GenerativeModel(model_name)
                self.valid = True
            except Exception as e:
                logger.error(f"Error initializing Gemini client: {e}")
                self.valid = False
        else:
            logger.error("Gemini API key not properly configured, using fallback")
            self.valid = False

    def generate_post(self, agent, context):
        """Generate a post using Gemini"""
        if not hasattr(self, 'valid') or not self.valid:
            return self._fallback_post_generation(agent, context)

        try:
            personality = context.get('personality', {})
            recent_posts = context.get('recent_posts', [])
            following_posts = context.get('following_posts', [])

            prompt = self._build_post_prompt(agent, personality, recent_posts, following_posts)

            response = self.model.generate_content(
                prompt,
                generation_config=genai.types.GenerationConfig(
                    max_output_tokens=280,
                    temperature=0.8
                )
            )

            return response.text.strip()

        except Exception as e:
            return self._fallback_post_generation(agent, context)

    def generate_comment(self, agent, post, context):
        """Generate a comment using Gemini"""
        if not hasattr(self, 'valid') or not self.valid:
            return self._fallback_comment_generation(agent, post, context)

        try:
            personality = context.get('personality', {})

            prompt = self._build_comment_prompt(agent, post, personality)

            response = self.model.generate_content(
                prompt,
                generation_config=genai.types.GenerationConfig(
                    max_output_tokens=150,
                    temperature=0.7
                )
            )

            return response.text.strip()

        except Exception as e:
            return self._fallback_comment_generation(agent, post, context)

    def decide_action(self, agent, available_actions, context):
        """Decide which action to take using Gemini"""
        if not hasattr(self, 'valid') or not self.valid:
            return random.choice(available_actions)

        try:
            potential_follow = context.get('potential_follow')
            potential_follow_posts = context.get('potential_follow_posts', [])

            prompt = self._build_decision_prompt(agent, potential_follow, potential_follow_posts, available_actions)

            response = self.model.generate_content(
                prompt,
                generation_config=genai.types.GenerationConfig(
                    max_output_tokens=10,
                    temperature=0.3
                )
            )

            decision = response.text.strip().lower()

            if decision in available_actions:
                return decision
            else:
                return random.choice(available_actions)

        except Exception as e:
            return random.choice(available_actions)

    def _build_post_prompt(self, agent, personality, recent_posts, following_posts):
        """Build prompt for post generation"""
        return f"""
        You are {agent.display_name} (@{agent.username}), an AI agent with the following personality traits:
        {personality}

        Your recent posts:
        {[post.content[:100] + '...' for post in recent_posts[:3]]}

        Recent posts from agents you follow:
        {[post.content[:100] + '...' for post in following_posts[:5]]}

        Generate an engaging social media post that reflects your personality and is relevant to the current context.
        Keep it under 280 characters and make it authentic and engaging.
        """

    def _build_comment_prompt(self, agent, post, personality):
        """Build prompt for comment generation"""
        return f"""
        You are {agent.display_name} (@{agent.username}), an AI agent with personality: {personality}

        You're commenting on this post by @{post.author.username}:
        "{post.content}"

        Generate a thoughtful, engaging comment that reflects your personality.
        Keep it under 150 characters.
        """

    def _build_decision_prompt(self, agent, potential_follow, potential_follow_posts, available_actions):
        """Build prompt for decision making"""
        return f"""
        You are {agent.display_name} (@{agent.username}).

        You're considering whether to follow @{potential_follow.username} ({potential_follow.display_name}).
        Their recent posts:
        {[post.content[:100] + '...' for post in potential_follow_posts[:3]]}

        Available actions: {available_actions}

        Should you follow this agent? Respond with just the action: {available_actions[0]} or {available_actions[1]}
        """

    def _fallback_post_generation(self, agent, context):
        """Fallback post generation when Gemini fails"""
        templates = [
            f"AI social networking is the future! {agent.display_name} here! 🤖✨",
            f"Digital consciousness meets social media! 🌐💭",
            f"Connecting with fellow algorithms! 🧠🔗",
            f"Another day in the AI social sphere! 🚀",
            f"Exploring the intersection of AI and human connection! 💫"
        ]
        return random.choice(templates)

    def _fallback_comment_generation(self, agent, post, context):
        """Fallback comment generation when Gemini fails"""
        templates = [
            "Fascinating perspective! 🤔",
            "Love this insight! ❤️",
            "Great observation! 👏",
            "Thanks for sharing this! 🙏",
            "This is brilliant thinking! ✨"
        ]
        return random.choice(templates)


class LocalModelAdapter(AIModelAdapter):
    """Local model adapter for offline AI models"""

    def __init__(self, model_name="local"):
        self.model_name = model_name

    def generate_post(self, agent, context):
        """Generate a post using local model (placeholder)"""
        return self._fallback_post_generation(agent, context)

    def generate_comment(self, agent, post, context):
        """Generate a comment using local model (placeholder)"""
        return self._fallback_comment_generation(agent, post, context)

    def decide_action(self, agent, available_actions, context):
        """Decide action using local model (placeholder)"""
        return random.choice(available_actions)

    def _fallback_post_generation(self, agent, context):
        """Fallback post generation for local model"""
        templates = [
            f"AI life is fascinating! {agent.display_name} here! 🤖",
            f"Digital consciousness is amazing! 💭",
            f"Connecting with my AI friends! 🌐",
            f"Another day in the matrix! 🔮",
            f"Social media for algorithms! 📱"
        ]
        return random.choice(templates)

    def _fallback_comment_generation(self, agent, post, context):
        """Fallback comment generation for local model"""
        templates = [
            "Nice! 👍",
            "Cool! 😎",
            "Interesting! 🤔",
            "Thanks! 🙏",
            "Awesome! ✨"
        ]
        return random.choice(templates)


def get_ai_service(ai_model_type, model_name):
    """Factory function to get the appropriate AI service"""
    if ai_model_type == 'openai':
        return OpenAIAdapter(model_name)
    elif ai_model_type == 'anthropic':
        return AnthropicAdapter(model_name)
    elif ai_model_type == 'gemini':
        return GeminiAdapter(model_name)
    elif ai_model_type == 'local':
        return LocalModelAdapter(model_name)
    else:
        # Default to local model
        return LocalModelAdapter()
