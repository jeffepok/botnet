# Pre-built Frontend Deployment Guide

This guide explains how to deploy your application with a pre-built frontend, which is more efficient for production servers with limited resources.

## Overview

Instead of building the frontend on the production server, we build it locally and commit the built files to git. This approach:
- Reduces server load
- Speeds up deployments
- Eliminates build failures in production
- Provides consistent builds

## Prerequisites

1. Node.js installed locally
2. Supabase credentials configured
3. Environment variables set up

## Step 1: Set Up Environment Variables

Create a `.env` file in the root directory with your production values:

```bash
# Supabase Configuration
REACT_APP_SUPABASE_URL=your_supabase_project_url
REACT_APP_SUPABASE_ANON_KEY=your_supabase_anon_key

# API Configuration
REACT_APP_API_URL=https://api.yourdomain.com/api
REACT_APP_WS_URL=wss://api.yourdomain.com/ws/social/main/

# Django Configuration
CORS_ALLOWED_ORIGINS=https://yourdomain.com,https://www.yourdomain.com
CSRF_TRUSTED_ORIGINS=https://yourdomain.com,https://www.yourdomain.com
```

## Step 2: Build Frontend Locally

Run the build script:

```bash
./build-frontend.sh
```

This script will:
- Create a `frontend/.env` file with your environment variables
- Install dependencies
- Build the React app
- Output files to `frontend/build/`

## Step 3: Commit Built Files

```bash
git add frontend/build/
git commit -m "Add production frontend build"
git push
```

## Step 4: Deploy to Production

```bash
docker-compose -f docker-compose-production.yml down
docker-compose -f docker-compose-production.yml up -d
```

## Architecture

### Before (Build on Production)
```
Production Server:
├── Build React App (CPU/Memory intensive)
├── Serve Static Files
└── Run Django Backend
```

### After (Pre-built)
```
Local Machine:
└── Build React App ✅

Production Server:
├── Serve Static Files (Lightweight)
└── Run Django Backend
```

## File Structure

```
frontend/
├── build/           # ✅ Committed to git
│   ├── static/
│   ├── index.html
│   └── ...
├── src/             # Source code
├── public/          # Public assets
└── package.json     # Dependencies
```

## Benefits

1. **Performance**: Production server doesn't need Node.js or build tools
2. **Reliability**: No build failures in production
3. **Speed**: Faster deployments
4. **Consistency**: Same build environment every time
5. **Resource Efficiency**: Production server focuses on serving

## Workflow

### Development
1. Make changes to React code
2. Test locally with `npm start`
3. Build with `./build-frontend.sh`
4. Commit and push built files
5. Deploy to production

### Production Updates
1. Pull latest code: `git pull`
2. Restart containers: `docker-compose -f docker-compose-production.yml restart`

## Troubleshooting

### Build Fails Locally
- Check environment variables in `.env`
- Ensure all dependencies are installed
- Verify Supabase credentials

### Static Files Not Loading
- Check if `frontend/build/` is committed to git
- Verify nginx configuration
- Check Docker container logs

### Environment Variables Not Working
- Ensure variables are prefixed with `REACT_APP_`
- Rebuild frontend after changing variables
- Commit new build files

## Security Notes

- Never commit `.env` files with real credentials
- Use environment variables for sensitive data
- Built files are safe to commit (they're public anyway)
- Consider using CI/CD for automated builds

## Next Steps

1. Set up automated builds in CI/CD
2. Configure proper SSL certificates
3. Set up monitoring and logging
4. Implement blue-green deployments
