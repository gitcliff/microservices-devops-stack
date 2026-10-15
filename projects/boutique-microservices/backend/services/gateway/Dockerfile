# Gateway Service Dockerfile
# Build context: projects/boutique-microservices/backend/
FROM node:20-alpine AS builder

WORKDIR /backend

COPY services/gateway/package*.json ./services/gateway/
RUN npm install --prefix ./services/gateway

COPY services/gateway/src         ./services/gateway/src
COPY services/gateway/tsconfig.json ./services/gateway/tsconfig.json
COPY shared                        ./shared

WORKDIR /backend/services/gateway
RUN npm run build

# Production stage
FROM node:20-alpine

RUN apk upgrade --no-cache

WORKDIR /app

COPY services/gateway/package*.json ./
RUN npm install --production && npm cache clean --force

COPY --from=builder /backend/services/gateway/dist ./dist

RUN addgroup -g 1001 -S nodejs \
 && adduser  -S nodejs -u 1001

USER nodejs

EXPOSE 3001

CMD ["node", "dist/services/gateway/src/index.js"]
