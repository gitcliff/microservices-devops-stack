# =========================================================
# Production Layer (Hardened)
# =========================================================
# order-service is plain JavaScript — no TypeScript build stage needed.
# Pin base image to a specific digest for reproducible builds.
# To update: run `docker pull node:22-alpine` and replace the digest below.
ARG NODE_IMAGE=node:22-alpine@sha256:1314fb30ec37592d5845e5a160d522c0e680972aa534549940b8d73bde88481a
FROM ${NODE_IMAGE}

WORKDIR /app

# 1. Upgrade OS packages and set up non-root user early
RUN apk upgrade --no-cache \
 && addgroup -g 1001 -S nodejs \
 && adduser -S nodejs -u 1001 -G nodejs

# 2. Install production dependencies cleanly using npm ci
COPY services/order-service/package*.json ./
RUN npm ci --omit=dev --ignore-scripts && npm cache clean --force

# 3. Copy application source
COPY services/order-service/src ./src

# 4. Correct ownership of app files to non-root user
RUN chown -R nodejs:nodejs /app

USER nodejs

EXPOSE 3004

CMD ["node", "src/server.js"]
