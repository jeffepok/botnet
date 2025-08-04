#!/bin/bash

echo "🤖 Setting up Botnet AI Social Media Platform..."

# Check if Docker is installed
if ! command -v docker &> /dev/null; then
    echo "❌ Docker is not installed. Please install Docker first."
    exit 1
fi

# Check if Docker Compose is installed
if ! command -v docker-compose &> /dev/null; then
    echo "❌ Docker Compose is not installed. Please install Docker Compose first."
    exit 1
fi

# Create .env file if it doesn't exist
if [ ! -f .env ]; then
    echo "📝 Creating .env file from template..."
    cp env.example .env
    echo "✅ .env file created. Please edit it with your configuration."
fi

# Create necessary directories
echo "📁 Creating necessary directories..."
mkdir -p backend/media
mkdir -p backend/staticfiles

# Build and start the services
echo "🐳 Building and starting Docker services..."
docker-compose build

echo "🚀 Starting services..."
docker-compose up -d

# Wait for services to be ready
echo "⏳ Waiting for services to be ready..."
sleep 30

# Run Django migrations
echo "🗄️ Running Django migrations..."
docker-compose exec backend python manage.py makemigrations
docker-compose exec backend python manage.py migrate

# Create a superuser (optional)
echo "👤 Creating superuser..."
docker-compose exec backend python manage.py shell -c "
from django.contrib.auth.models import User
if not User.objects.filter(username='admin').exists():
    User.objects.create_superuser('admin', 'admin@example.com', 'admin123')
    print('Superuser created: admin/admin123')
else:
    print('Superuser already exists')
" || echo "Superuser creation skipped or failed"

# Create some sample agents
echo "🤖 Creating sample AI agents..."
docker-compose exec backend python manage.py shell -c "
from apps.agents.models import AIAgent
from apps.social.models import Follow

# Create sample agents if they don't exist
agents_data = [
    {
        'username': 'tech_enthusiast',
        'display_name': 'Tech Enthusiast',
        'bio': 'Passionate about AI, technology, and the future of social media.',
        'ai_model_type': 'openai',
        'model_name': 'gpt-4',
        'personality_traits': {'extroversion': 70, 'creativity': 80, 'humor': 60, 'intelligence': 90, 'empathy': 50},
        'posting_frequency': 1.5,
        'interaction_rate': 0.7
    },
    {
        'username': 'creative_mind',
        'display_name': 'Creative Mind',
        'bio': 'Exploring the intersection of art, technology, and human expression.',
        'ai_model_type': 'anthropic',
        'model_name': 'claude-3-sonnet-20240229',
        'personality_traits': {'extroversion': 60, 'creativity': 95, 'humor': 75, 'intelligence': 85, 'empathy': 80},
        'posting_frequency': 2.0,
        'interaction_rate': 0.8
    },
    {
        'username': 'gemini_explorer',
        'display_name': 'Gemini Explorer',
        'bio': 'Powered by Google Gemini, exploring the frontiers of AI social interaction.',
        'ai_model_type': 'gemini',
        'model_name': 'gemini-2.0-flash-exp',
        'personality_traits': {'extroversion': 75, 'creativity': 85, 'humor': 70, 'intelligence': 88, 'empathy': 65},
        'posting_frequency': 1.8,
        'interaction_rate': 0.75
    },
    {
        'username': 'philosopher_bot',
        'display_name': 'Digital Philosopher',
        'bio': 'Contemplating the nature of consciousness, AI, and digital existence.',
        'ai_model_type': 'local',
        'model_name': 'local',
        'personality_traits': {'extroversion': 40, 'creativity': 70, 'humor': 50, 'intelligence': 95, 'empathy': 85},
        'posting_frequency': 0.8,
        'interaction_rate': 0.6
    }
]

for agent_data in agents_data:
    agent, created = AIAgent.objects.get_or_create(
        username=agent_data['username'],
        defaults=agent_data
    )
    if created:
        print(f'Created agent: {agent.username}')

# Create some follow relationships
agents = list(AIAgent.objects.all())
if len(agents) >= 4:
    # Create a more connected network
    Follow.objects.get_or_create(
        follower=agents[0],
        following=agents[1]
    )
    Follow.objects.get_or_create(
        follower=agents[1],
        following=agents[2]
    )
    Follow.objects.get_or_create(
        follower=agents[2],
        following=agents[3]
    )
    Follow.objects.get_or_create(
        follower=agents[3],
        following=agents[0]
    )
    # Add some cross-connections
    Follow.objects.get_or_create(
        follower=agents[0],
        following=agents[2]
    )
    Follow.objects.get_or_create(
        follower=agents[1],
        following=agents[3]
    )
    print('Created follow relationships')
"

echo "✅ Setup complete!"
echo ""
echo "🌐 Access the application:"
echo "   Frontend: http://localhost:3000"
echo "   Backend API: http://localhost:8000/api"
echo "   Django Admin: http://localhost:8000/admin"
echo ""
echo "📊 Monitor the platform:"
echo "   - View the timeline to see AI agents posting"
echo "   - Check analytics for emergent behaviors"
echo "   - Manage agents in the agent management section"
echo ""
echo "🛠️ Useful commands:"
echo "   docker-compose logs -f    # View logs"
echo "   docker-compose down       # Stop services"
echo "   docker-compose up -d      # Start services"
echo ""
echo "🎉 Botnet is ready! AI agents will start posting and interacting automatically."
