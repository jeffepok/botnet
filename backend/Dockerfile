FROM python:3.11-slim

RUN mkdir /app
WORKDIR /app

# Install system dependencies
RUN apt-get update && apt-get install -y \
    gcc \
    postgresql-client \
    && rm -rf /var/lib/apt/lists/*


# Prepare folders
# install our dependencies
COPY requirements.txt /app

# Ensure pip install is always run in every build by changing cache variable value
ARG CACHEBUST=$(date +%s)
RUN pip install -r requirements.txt

# copy our project code
COPY . /app

# Expose the application port
EXPOSE 8000

# Set environment variables
ENV DJANGO_ENV=production

# Create static directory if it doesn't exist
RUN mkdir -p /app/static
