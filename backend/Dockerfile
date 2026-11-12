FROM node:20-slim

# Install Python and ffmpeg for yt-dlp & media conversion
RUN apt-get update && apt-get install -y \
    python3 \
    python3-pip \
    ffmpeg \
    curl \
    && rm -rf /var/lib/apt/lists/*

# Install yt-dlp via pip
RUN pip3 install --no-cache-dir --break-system-packages yt-dlp

WORKDIR /app

# Copy backend package files
COPY package*.json ./
RUN npm install --production

# Copy source code
COPY . .

# Create temp directory
RUN mkdir -p temp

EXPOSE 5000

ENV PORT=5000
ENV NODE_ENV=production

CMD ["node", "src/server.js"]

