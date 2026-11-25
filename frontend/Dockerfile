# Frontend Dockerfile
# Pin base image to a specific digest for reproducible builds.
# To update: run `docker pull node:22-alpine` and replace the digest below.
ARG NODE_IMAGE=node:22-alpine@sha256:1314fb30ec37592d5845e5a160d522c0e680972aa534549940b8d73bde88481a
FROM ${NODE_IMAGE}


RUN apk upgrade --no-cache

WORKDIR /app

# Copy package files
COPY package*.json ./
RUN npm install --production=false

# Copy source code
COPY . .

# Build the app
RUN npm run build

# Install serve globally
RUN npm install -g serve

# Drop to non-root user for runtime (node user ships with node:alpine, uid 1000)
RUN chown -R node:node /app
USER node

EXPOSE 3000

# Use serve to host the static files
CMD ["serve", "-s", "build", "-l", "3000", "--single"]
