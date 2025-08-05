# Redis Sessions Setup for Botnet

This document explains the Redis session configuration for the Botnet Django application.

## Overview

The application now uses `django-redis` for session management in production, providing:
- Fast session storage with Redis
- Session persistence across server restarts
- Automatic session expiration
- Connection pooling for better performance
- Compression for reduced memory usage

## Configuration

### 1. Dependencies Added

```txt
django-redis==5.4.0
```

### 2. Cache Configuration

The application uses separate Redis databases for different purposes:

- **Database 0**: General caching (`botnet_cache` prefix)
- **Database 1**: Sessions (`botnet_session` prefix)
- **Database 2**: Channels/WebSocket communication

### 3. Session Settings

```python
# Session Configuration
SESSION_ENGINE = 'django.contrib.sessions.backends.cache'
SESSION_CACHE_ALIAS = 'sessions'
SESSION_COOKIE_AGE = 86400  # 24 hours
SESSION_COOKIE_SECURE = True  # Only send cookies over HTTPS
SESSION_COOKIE_HTTPONLY = True  # Prevent JavaScript access
SESSION_COOKIE_SAMESITE = 'Lax'  # CSRF protection
SESSION_EXPIRE_AT_BROWSER_CLOSE = False
SESSION_SAVE_EVERY_REQUEST = True  # Update session on every request
```

## Production Deployment

### 1. Environment Variables

Add these to your `.env.production` file:

```bash
# Redis Configuration
REDIS_URL=redis://your-redis-host:6379/0
REDIS_SESSION_DB=1
REDIS_CACHE_DB=0
REDIS_CHANNEL_DB=2
```

### 2. Redis Server Configuration

For production Redis, ensure these settings:

```bash
# Redis configuration
maxmemory 256mb
maxmemory-policy allkeys-lru
appendonly yes
save 900 1
save 300 10
save 60 10000
```

### 3. Docker Compose (Production)

```yaml
redis:
  image: redis:7-alpine
  ports:
    - "6379:6379"
  volumes:
    - redis_data:/data
  command: redis-server --appendonly yes --maxmemory 256mb --maxmemory-policy allkeys-lru
  healthcheck:
    test: ["CMD", "redis-cli", "ping"]
    interval: 30s
    timeout: 10s
    retries: 3
```

## Testing

### 1. Test Redis Session Configuration

Run the management command to test the setup:

```bash
python manage.py test_redis_sessions
```

This command tests:
- Basic cache connectivity
- Session store functionality
- Session expiration
- Cache key prefixes
- Connection pool

### 2. Manual Testing

```python
# Test session creation
from django.contrib.sessions.backends.cache import SessionStore
session = SessionStore()
session['user_id'] = 123
session.save()

# Test session retrieval
session_id = session.session_key
new_session = SessionStore(session_key=session_id)
user_id = new_session.get('user_id')  # Should return 123
```

## Monitoring

### 1. Redis CLI Commands

```bash
# Connect to Redis
redis-cli

# Monitor session keys
KEYS botnet_session*

# Check memory usage
INFO memory

# Monitor Redis operations
MONITOR
```

### 2. Django Management Commands

```bash
# Clear all sessions
python manage.py clearsessions

# Check session count
python manage.py shell
>>> from django.contrib.sessions.models import Session
>>> Session.objects.count()
```

## Performance Optimization

### 1. Connection Pooling

The configuration includes connection pooling:
- Max connections: 50 for cache, 20 for sessions
- Retry on timeout: Enabled
- Socket timeouts: 5 seconds

### 2. Compression

Sessions are compressed using zlib to reduce memory usage:
```python
'COMPRESSOR': 'django_redis.compressors.zlib.ZlibCompressor'
```

### 3. Key Prefixing

Different prefixes prevent key collisions:
- Cache: `botnet_cache`
- Sessions: `botnet_session`

## Security Considerations

### 1. Session Security

- `SESSION_COOKIE_SECURE = True`: Only HTTPS
- `SESSION_COOKIE_HTTPONLY = True`: No JavaScript access
- `SESSION_COOKIE_SAMESITE = 'Lax'`: CSRF protection

### 2. Redis Security

- Use strong Redis passwords in production
- Bind Redis to localhost only
- Use SSL/TLS for Redis connections in production

## Troubleshooting

### 1. Common Issues

**Session not persisting:**
- Check Redis connectivity
- Verify session engine configuration
- Check Redis memory limits

**High memory usage:**
- Monitor session count
- Adjust session timeout
- Check for session leaks

**Connection errors:**
- Verify Redis URL
- Check network connectivity
- Review connection pool settings

### 2. Debug Commands

```bash
# Check Redis status
redis-cli ping

# Monitor Redis operations
redis-cli monitor

# Check Django cache
python manage.py shell
>>> from django.core.cache import cache
>>> cache.set('test', 'value', 60)
>>> cache.get('test')
```

## Migration from Database Sessions

If migrating from database sessions:

1. Update settings:
```python
SESSION_ENGINE = 'django.contrib.sessions.backends.cache'
SESSION_CACHE_ALIAS = 'sessions'
```

2. Clear old sessions:
```bash
python manage.py clearsessions
```

3. Test thoroughly before deploying to production

## Backup and Recovery

### 1. Redis Backup

```bash
# Create Redis backup
redis-cli BGSAVE

# Copy RDB file
cp /var/lib/redis/dump.rdb /backup/redis-backup-$(date +%Y%m%d).rdb
```

### 2. Session Recovery

Sessions are stored in Redis, so they persist across application restarts but are lost if Redis data is cleared.

For critical applications, consider implementing session backup strategies or using Redis persistence features.
