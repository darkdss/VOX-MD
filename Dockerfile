FROM node:18-slim

# Install required system dependencies
RUN apt-get update && apt-get install -y \
    ffmpeg \
    wget \
    imagemagick \
    webp \
    python3 \
    procps \
    && rm -rf /var/lib/apt/lists/*

# Install webp utilities
RUN mkdir -p /tmp/webp && \
    cd /tmp/webp && \
    wget -q https://storage.googleapis.com/downloads.webmproject.org/releases/webp/libwebp-1.2.4-linux-x86-64.tar.gz && \
    tar -xzf libwebp-1.2.4-linux-x86-64.tar.gz && \
    cp -r libwebp-1.2.4-linux-x86-64/bin/* /usr/local/bin/ && \
    rm -rf /tmp/webp

# Create and set working directory
WORKDIR /app

# Copy package.json and package-lock.json first for better caching
COPY package*.json ./

# Install dependencies
RUN npm install

# Copy source code
COPY . .

# Create data directories with appropriate permissions
RUN mkdir -p /app/session /app/media /app/temp && \
    chmod -R 777 /app/session /app/media /app/temp

# Create volume mount points for persistent data
VOLUME ["/app/session", "/app/media"]

# Environment variables
ENV PORT=3000
ENV NODE_ENV=production
ENV PUPPETEER_SKIP_CHROMIUM_DOWNLOAD=true
ENV PUPPETEER_NO_SANDBOX=true
ENV TZ=Africa/Nairobi

# Add health check
HEALTHCHECK --interval=60s --timeout=10s --start-period=30s --retries=3 \
    CMD wget -q --spider http://localhost:$PORT || exit 1

# Expose port 
EXPOSE $PORT

# Set entry point shell script to handle signals properly
COPY docker-entrypoint.sh /usr/local/bin/
RUN chmod +x /usr/local/bin/docker-entrypoint.sh

ENTRYPOINT ["docker-entrypoint.sh"]
CMD ["npm", "start"]