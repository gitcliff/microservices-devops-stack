# =========================================================
# Production Layer (Hardened)
# =========================================================
# order-service is plain JavaScript — no TypeScript build stage needed.
FROM node:22-alpine

WORKDIR /app

# 1. Upgrade OS packages and set up non-root user early
RUN apk upgrade --no-cache \
 && addgroup -g 1001 -S nodejs \
 && adduser -S nodejs -u 1001 -G nodejs

# 2. Install production dependencies cleanly using npm ci
COPY services/order-service/package*.json ./
RUN npm ci --omit=dev && npm cache clean --force

# 3. Copy application source
COPY services/order-service/src ./src

# 4. Correct ownership of app files to non-root user
RUN chown -R nodejs:nodejs /app

USER nodejs

EXPOSE 3004

CMD ["node", "src/server.js"]
