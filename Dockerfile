# Use Debian-based Node image for better native module support
FROM node:20

# Install system dependencies required for native builds (e.g., canvas)
RUN apt-get update && apt-get install -y \
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

# Copy package files and install dependencies
COPY package*.json ./
RUN npm install

# Copy the entire project
COPY . .

# Build your TypeScript server (skip migrations - they'll run at runtime)
RUN npm run build:docker

# Expose port (optional; only needed if you're testing locally or using Docker standalone)
EXPOSE 3000

# Create a startup script that handles migrations at runtime
RUN echo '#!/bin/sh\n\
npx prisma migrate deploy\n\
node public/dist/src/server.js' > /app/start.sh && chmod +x /app/start.sh

# Run the startup script
CMD ["/app/start.sh"]
