# =========================================================
# Stage 1: Build Layer
# =========================================================
FROM node:22-alpine AS builder

WORKDIR /backend

# Copy only what is needed for installing dependencies
COPY services/auth/package*.json ./services/auth/
RUN npm ci --prefix ./services/auth --ignore-scripts

# Symlink so shared/ can resolve deps from the service's node_modules
RUN ln -s /backend/services/auth/node_modules /backend/node_modules

# Copy source and config files
COPY services/auth/src              ./services/auth/src
COPY services/auth/tsconfig.json    ./services/auth/tsconfig.json
COPY services/auth/tsconfig.build.json ./services/auth/tsconfig.build.json
COPY shared                         ./shared

WORKDIR /backend/services/auth
RUN npm run build

# =========================================================
# Stage 2: Production Layer (Hardened)
# =========================================================
# Using a specific alpine version (e.g., 3.20) gives more predictable security baselines
FROM node:22-alpine

WORKDIR /app

# 1. Upgrade OS packages AND drop root privileges setup early
RUN apk upgrade --no-cache \
 && addgroup -g 1001 -S nodejs \
 && adduser -S nodejs -u 1001 -G nodejs

# 2. Install production dependencies cleanly using npm ci
COPY services/auth/package*.json ./
RUN npm ci --omit=dev --ignore-scripts && npm cache clean --force

# 3. Copy built artifacts from the builder stage
COPY --from=builder /backend/services/auth/dist ./dist

# 4. Correct ownership of app files to non-root user
RUN chown -R nodejs:nodejs /app

USER nodejs

EXPOSE 3002

CMD ["node", "dist/services/auth/src/index.js"]

