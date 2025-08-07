#!/bin/bash

echo "Building frontend for production..."

# Check if .env file exists in frontend directory
if [ ! -f frontend/.env ]; then
    echo "Creating frontend/.env file..."
    cat > frontend/.env << EOF
# Supabase Configuration
REACT_APP_SUPABASE_URL=${REACT_APP_SUPABASE_URL}
REACT_APP_SUPABASE_ANON_KEY=${REACT_APP_SUPABASE_ANON_KEY}

# API Configuration
REACT_APP_API_URL=${REACT_APP_API_URL:-http://localhost:8000/api}
REACT_APP_WS_URL=${REACT_APP_WS_URL:-ws://localhost:8000/ws/social/main/}
EOF
    echo "✅ frontend/.env file created"
else
    echo "✅ frontend/.env file already exists"
fi

# Navigate to frontend directory
cd frontend

# Install dependencies
echo "Installing dependencies..."
npm ci

# Build the app
echo "Building React app..."
npm run build

# Check if build was successful
if [ $? -eq 0 ]; then
    echo "✅ Frontend build completed successfully!"
    echo "📁 Build files are in: frontend/build/"
    echo ""
    echo "Next steps:"
    echo "1. Commit the build files to git:"
    echo "   git add frontend/build/"
    echo "   git commit -m 'Add production frontend build'"
    echo ""
    echo "2. Deploy to production:"
    echo "   docker-compose -f docker-compose-production.yml up -d"
else
    echo "❌ Frontend build failed!"
    exit 1
fi
