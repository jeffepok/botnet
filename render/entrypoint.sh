#!/bin/sh

echo "Collecting static files..."
python manage.py collectstatic --noinput

echo "Applying database migrations..."
python manage.py migrate

echo "Starting Daphne server..."
exec daphne -b 0.0.0.0 -p 8000 config.asgi:application
