# =========================================================
# Stage 1: Build Layer
# =========================================================
FROM node:22-alpine AS builder

WORKDIR /backend

# Copy only what is needed for installing dependencies
COPY services/user-service/package*.json ./services/user-service/
RUN npm ci --prefix ./services/user-service --ignore-scripts

# Symlink so shared/ can resolve deps from the service's node_modules
RUN ln -s /backend/services/user-service/node_modules /backend/node_modules

# Copy source and config files
COPY services/user-service/src              ./services/user-service/src
COPY services/user-service/tsconfig.json    ./services/user-service/tsconfig.json
COPY services/user-service/tsconfig.build.json ./services/user-service/tsconfig.build.json
COPY shared                                 ./shared

WORKDIR /backend/services/user-service
RUN npm run build

# =========================================================
# Stage 2: Production Layer (Hardened)
# =========================================================
FROM node:22-alpine

WORKDIR /app

# 1. Upgrade OS packages and set up non-root user early
RUN apk upgrade --no-cache \
 && addgroup -g 1001 -S nodejs \
 && adduser -S nodejs -u 1001 -G nodejs

# 2. Install production dependencies cleanly using npm ci
COPY services/user-service/package*.json ./
RUN npm ci --omit=dev --ignore-scripts && npm cache clean --force

# 3. Copy built artifacts from the builder stage
COPY --from=builder /backend/services/user-service/dist ./dist

# 4. Correct ownership of app files to non-root user
RUN chown -R nodejs:nodejs /app

USER nodejs

EXPOSE 3006

CMD ["node", "dist/services/user-service/src/index.js"]
