#!/bin/sh

echo "Fixing permissions on static and media directories..."
chown -R appuser:appuser /app/staticfiles /app/media

exec "$@"
