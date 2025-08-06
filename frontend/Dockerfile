# Build stage
FROM node:18-alpine as build

WORKDIR /app

# Copy package files
COPY package*.json ./

# Install dependencies
RUN npm ci --only=production

# Copy source code
COPY . .

# Build the app
RUN npm run build

# Production stage - this will be used by the build service
FROM alpine:latest

# Install necessary tools
RUN apk add --no-cache bash

# Create build directory
RUN mkdir -p /app/build

# Copy built app to build directory
COPY --from=build /app/build /app/build

# Set working directory
WORKDIR /app

# Default command (can be overridden)
CMD ["sh", "-c", "echo 'Frontend build completed'"]
