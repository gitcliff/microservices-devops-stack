# Pin base image to a specific digest for reproducible builds.
# To update: run `docker pull node:22-alpine` and replace the digest below.
ARG NODE_IMAGE=node:22-alpine@sha256:1314fb30ec37592d5845e5a160d522c0e680972aa534549940b8d73bde88481a

# =========================================================
# Stage 1: Build Layer
# =========================================================
FROM ${NODE_IMAGE} AS builder

WORKDIR /backend

# Copy only what is needed for installing dependencies
COPY services/product-service/package*.json ./services/product-service/
RUN npm ci --prefix ./services/product-service --ignore-scripts

# Symlink so shared/ can resolve deps from the service's node_modules
RUN ln -s /backend/services/product-service/node_modules /backend/node_modules

# Copy source and config files
COPY services/product-service/src              ./services/product-service/src
COPY services/product-service/tsconfig.json    ./services/product-service/tsconfig.json
COPY services/product-service/tsconfig.build.json ./services/product-service/tsconfig.build.json
COPY shared                                    ./shared

WORKDIR /backend/services/product-service
RUN npm run build

# =========================================================
# Stage 2: Production Layer (Hardened)
# =========================================================
FROM ${NODE_IMAGE}

WORKDIR /app

# 1. Upgrade OS packages and set up non-root user early
RUN apk upgrade --no-cache \
 && addgroup -g 1001 -S nodejs \
 && adduser -S nodejs -u 1001 -G nodejs

# 2. Install production dependencies cleanly using npm ci
COPY services/product-service/package*.json ./
RUN npm ci --omit=dev --ignore-scripts && npm cache clean --force

# 3. Copy built artifacts from the builder stage
COPY --from=builder /backend/services/product-service/dist ./dist

# 4. Correct ownership of app files to non-root user
RUN chown -R nodejs:nodejs /app

USER nodejs

EXPOSE 3003

CMD ["node", "dist/services/product-service/src/index.js"]
