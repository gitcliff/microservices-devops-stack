# =========================================================
# Stage 1: Build Layer
# =========================================================
FROM node:22-alpine AS builder

WORKDIR /backend

# Copy only what is needed for installing dependencies
COPY services/orders/package*.json ./services/orders/
RUN npm ci --prefix ./services/orders --ignore-scripts

# Symlink so shared/ can resolve deps from the service's node_modules
RUN ln -s /backend/services/orders/node_modules /backend/node_modules

# Copy source and config files
COPY services/orders/src              ./services/orders/src
COPY services/orders/tsconfig.json    ./services/orders/tsconfig.json
COPY services/orders/tsconfig.build.json ./services/orders/tsconfig.build.json
COPY shared                           ./shared

WORKDIR /backend/services/orders
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
COPY services/orders/package*.json ./
RUN npm ci --omit=dev --ignore-scripts && npm cache clean --force

# 3. Copy built artifacts from the builder stage
COPY --from=builder /backend/services/orders/dist ./dist

# 4. Correct ownership of app files to non-root user
RUN chown -R nodejs:nodejs /app

USER nodejs

EXPOSE 3005

CMD ["node", "dist/services/orders/src/index.js"]
