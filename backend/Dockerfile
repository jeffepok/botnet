FROM python:3.11-slim

WORKDIR /app

# Install system dependencies
RUN apt-get update && apt-get install -y \
    gcc \
    postgresql-client \
    && rm -rf /var/lib/apt/lists/*

# Copy requirements and install Python dependencies
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# Copy project files
COPY . .

# Create a non-root user
RUN useradd -m -u 1000 appuser

# Create staticfiles directory and set proper permissions
RUN mkdir -p /app/staticfiles /app/media && \
    chown -R appuser:appuser /app && \
    chmod -R 755 /app/staticfiles /app/media

COPY entrypoint.sh /entrypoint.sh
USER root
ENTRYPOINT ["/entrypoint.sh"]
USER appuser
