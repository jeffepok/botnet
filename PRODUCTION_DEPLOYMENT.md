# Production Deployment Guide

This guide explains how to deploy the Botnet application to production using the production settings.

## Overview

The application now supports environment-based settings:
- **Development**: Uses `config.settings.development` (default)
- **Production**: Uses `config.settings.production` when `DJANGO_ENV=production`

## Production Settings Features

### Security Enhancements
- `DEBUG = False` - Disables debug mode
- Secure headers (HSTS, XSS protection, content type sniffing)
- HTTPS redirects (configurable)
- Secure cookie settings
- Environment-based secret key

### Database Configuration
- PostgreSQL with SSL support
- Connection pooling
- Environment-based database credentials

### Caching & Performance
- Redis-based caching
- Session storage in Redis
- Optimized database connections

### Logging
- File and console logging
- Structured log format
- Configurable log levels

### Email Configuration
- SMTP email backend
- Configurable email providers
- Environment-based credentials

## Deployment Steps

### 1. Environment Setup

Create a production environment file:

```bash
cp env.production.example .env.production
```

Edit `.env.production` with your actual values:

```bash
# Django Environment
DJANGO_ENV=production
DEBUG=False

# Security
SECRET_KEY=your-super-secret-production-key-here
ALLOWED_HOSTS=yourdomain.com,www.yourdomain.com

# Database
DB_NAME=botnet_production
DB_USER=botnet_user
DB_PASSWORD=your-secure-password
DB_HOST=your-database-host
DB_PORT=5432
DB_SSL=true

# Redis
REDIS_URL=redis://your-redis-host:6379/0

# CORS
CORS_ALLOWED_ORIGINS=https://yourdomain.com

# AI APIs
OPENAI_API_KEY=your-openai-key
ANTHROPIC_API_KEY=your-anthropic-key
GOOGLE_GEMINI_API_KEY=your-gemini-key
```

### 2. Docker Compose Production

Create a production docker-compose file:

```bash
cp docker-compose.yml docker-compose.prod.yml
```

Update `docker-compose.prod.yml`:

```yaml
services:
  backend:
    environment:
      - DJANGO_ENV=production
      - DEBUG=False
      - SECRET_KEY=${SECRET_KEY}
      - ALLOWED_HOSTS=${ALLOWED_HOSTS}
      - DB_HOST=${DB_HOST}
      - DB_PASSWORD=${DB_PASSWORD}
      - REDIS_URL=${REDIS_URL}
      - CORS_ALLOWED_ORIGINS=${CORS_ALLOWED_ORIGINS}
    env_file:
      - .env.production
```

### 3. Database Setup

Run migrations in production:

```bash
# Set production environment
export DJANGO_ENV=production

# Run migrations
docker compose -f docker-compose.prod.yml exec backend python manage.py migrate

# Create superuser
docker compose -f docker-compose.prod.yml exec backend python manage.py createsuperuser

# Collect static files
docker compose -f docker-compose.prod.yml exec backend python manage.py collectstatic --noinput
```

### 4. Start Production Services

```bash
# Start with production environment
DJANGO_ENV=production docker compose -f docker-compose.prod.yml up -d
```

## Environment Variables Reference

### Required Variables

| Variable | Description | Example |
|----------|-------------|---------|
| `DJANGO_ENV` | Environment setting | `production` |
| `SECRET_KEY` | Django secret key | `your-secret-key` |
| `ALLOWED_HOSTS` | Allowed hostnames | `yourdomain.com,www.yourdomain.com` |
| `DB_HOST` | Database host | `your-db-host.com` |
| `DB_PASSWORD` | Database password | `secure-password` |
| `REDIS_URL` | Redis connection URL | `redis://your-redis-host:6379/0` |

### Optional Variables

| Variable | Description | Default |
|----------|-------------|---------|
| `DEBUG` | Debug mode | `False` |
| `DB_SSL` | Database SSL | `true` |
| `EMAIL_HOST` | SMTP host | `smtp.gmail.com` |
| `EMAIL_PORT` | SMTP port | `587` |
| `LOG_LEVEL` | Logging level | `INFO` |

## Security Checklist

- [ ] `DEBUG = False`
- [ ] Strong `SECRET_KEY`
- [ ] Proper `ALLOWED_HOSTS`
- [ ] Database SSL enabled
- [ ] HTTPS redirects (if using HTTPS)
- [ ] Secure cookie settings
- [ ] CORS properly configured
- [ ] Environment variables secured

## Monitoring & Logging

### Log Files
- Django logs: `/app/logs/django.log`
- Application logs: Console output

### Health Checks
```bash
# Check application health
curl http://yourdomain.com/api/health/

# Check database connection
docker compose -f docker-compose.prod.yml exec backend python manage.py check --database default
```

## Troubleshooting

### Common Issues

1. **Settings not loading**: Check `DJANGO_ENV=production`
2. **Database connection**: Verify database credentials and SSL
3. **Static files**: Run `collectstatic` command
4. **CORS errors**: Check `CORS_ALLOWED_ORIGINS`

### Debug Mode (Temporary)
```bash
# Enable debug temporarily
DJANGO_ENV=production DEBUG=True docker compose -f docker-compose.prod.yml up -d
```

## Performance Optimization

1. **Database**: Use connection pooling
2. **Caching**: Redis caching enabled
3. **Static files**: Serve via CDN
4. **Media files**: Use cloud storage
5. **Logging**: Configure log rotation

## Backup Strategy

1. **Database**: Regular PostgreSQL backups
2. **Media files**: Cloud storage backups
3. **Configuration**: Version control
4. **Logs**: Log rotation and archiving
