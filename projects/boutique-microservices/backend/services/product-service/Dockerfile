# Product Service Dockerfile
# Build context: projects/boutique-microservices/backend/
FROM node:20-alpine AS builder

WORKDIR /backend

COPY services/product-service/package*.json ./services/product-service/
RUN npm install --prefix ./services/product-service

# Symlink so shared/ can resolve deps from the service's node_modules
RUN ln -s /backend/services/product-service/node_modules /backend/node_modules

COPY services/product-service/src              ./services/product-service/src
COPY services/product-service/tsconfig.json    ./services/product-service/tsconfig.json
COPY services/product-service/tsconfig.build.json ./services/product-service/tsconfig.build.json
COPY shared                                    ./shared

WORKDIR /backend/services/product-service
RUN npm run build

# Production stage
FROM node:22-alpine

RUN apk upgrade --no-cache \
 && npm install -g npm@latest && npm cache clean --force


WORKDIR /app

COPY services/product-service/package*.json ./
RUN npm install --omit=dev && npm cache clean --force

COPY --from=builder /backend/services/product-service/dist ./dist

RUN addgroup -g 1001 -S nodejs \
 && adduser  -S nodejs -u 1001

USER nodejs

EXPOSE 3003

CMD ["node", "dist/services/product-service/src/index.js"]
