# Multi-stage build to reduce final image size
FROM node:20-slim AS builder

# Install system dependencies required for native builds
RUN apt-get update && apt-get install -y \
    openssl \
    python3 \
    make \
    g++ \
    libcairo2-dev \
    libjpeg-dev \
    libpango1.0-dev \
    libgif-dev \
    librsvg2-dev \
    && apt-get clean

# Set working directory
WORKDIR /app

# Copy package files and install ALL dependencies (including devDependencies for build)
COPY package*.json ./
RUN npm ci

# Copy the entire project
COPY . .

# Generate Prisma client and build TypeScript
RUN npx prisma generate && npm run build:docker

# Production stage
FROM node:20-slim AS production

# Install only runtime system dependencies
RUN apt-get update && apt-get install -y \
    libcairo2 \
    libjpeg62-turbo \
    libpango-1.0-0 \
    libgif7 \
    librsvg2-2 \
    && apt-get clean \
    && rm -rf /var/lib/apt/lists/*

# Set working directory
WORKDIR /app

# Copy package files
COPY package*.json ./

# Install only production dependencies
RUN npm ci --only=production && npm cache clean --force

# Copy built application from builder stage
COPY --from=builder /app/public ./public
COPY --from=builder /app/node_modules/.prisma ./node_modules/.prisma

# Remove unnecessary files
RUN rm -rf node_modules/.cache && \
    rm -rf /root/.npm && \
    rm -rf /root/.cache

# Expose port
EXPOSE 3000

# Create a startup script that handles migrations at runtime
RUN echo '#!/bin/sh\n\
    npx prisma migrate deploy\n\
    node public/dist/src/server.js' > /app/start.sh && chmod +x /app/start.sh

# Run the startup script
CMD ["/app/start.sh"]
