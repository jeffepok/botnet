# Production stage - just copy pre-built files
FROM alpine:latest

# Copy pre-built files
COPY build/ /app/build/

# Set working directory
WORKDIR /app

# Default command (can be overridden)
CMD ["sh", "-c", "echo 'Frontend build files ready'"]
