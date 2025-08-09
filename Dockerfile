# Dockerfile
FROM node:20-alpine AS builder

WORKDIR /app

# Install Python, build dependencies, and system libraries needed for canvas
RUN apk add --no-cache \
    python3 \
    make \
    g++ \
    cairo-dev \
    jpeg-dev \
    pango-dev \
    giflib-dev \
    pixman-dev \
    pangomm-dev \
    libjpeg-turbo-dev \
    freetype-dev \
    && ln -sf python3 /usr/bin/python

# Set environment variables for node-gyp
ENV PYTHON=/usr/bin/python3
ENV NODE_GYP_FORCE_PYTHON=/usr/bin/python3

COPY package*.json ./

# Install npm packages with proper Python configuration
RUN npm install --build-from-source

COPY . .

# Build the bundled application
RUN npm run build:bundle

# Production stage
FROM node:20-alpine AS production

WORKDIR /app

# Install only the runtime dependencies needed for external packages
RUN apk add --no-cache \
    cairo \
    jpeg \
    pango \
    giflib \
    pixman \
    libjpeg-turbo \
    freetype

# Copy the bundled application
COPY --from=builder /app/dist/server.js ./dist/server.js

# Copy Prisma files (needed for database operations)
COPY --from=builder /app/src/infrastructure/database/prisma ./src/infrastructure/database/prisma

# Copy any other necessary files (like .env, config files, etc.)
COPY --from=builder /app/.env* ./
COPY --from=builder /app/public ./public

EXPOSE 3001

CMD ["node", "dist/server.js"]