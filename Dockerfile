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

# Build your TypeScript server (and run any Prisma stuff if needed)
RUN if [ ! -f .built ]; then \
    npm run build:server && touch .built; \
    else \
    npm run build; \
    fi

# Expose port (optional; only needed if you're testing locally or using Docker standalone)
EXPOSE 3000

# Run the compiled server
CMD ["node", "public/dist/src/server.js"]
