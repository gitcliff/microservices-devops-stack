# Gateway Service Dockerfile
# Build context: projects/boutique-microservices/backend/
FROM node:20-alpine AS builder

WORKDIR /backend

COPY services/gateway/package*.json ./services/gateway/
RUN npm install --prefix ./services/gateway

# Symlink so shared/ can resolve deps from the service's node_modules
RUN ln -s /backend/services/gateway/node_modules /backend/node_modules

COPY services/gateway/src              ./services/gateway/src
COPY services/gateway/tsconfig.json    ./services/gateway/tsconfig.json
COPY services/gateway/tsconfig.build.json ./services/gateway/tsconfig.build.json
COPY shared                            ./shared

WORKDIR /backend/services/gateway
RUN npm run build

# Production stage
FROM node:22-alpine

RUN apk upgrade --no-cache \
 && npm install -g npm@latest --ignore-scripts && npm cache clean --force


WORKDIR /app

COPY services/gateway/package*.json ./
RUN npm install --omit=dev && npm cache clean --force

COPY --from=builder /backend/services/gateway/dist ./dist

RUN addgroup -g 1001 -S nodejs \
 && adduser  -S nodejs -u 1001

USER nodejs

EXPOSE 3001

CMD ["node", "dist/services/gateway/src/index.js"]
