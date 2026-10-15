# Orders Service Dockerfile
# Build context: projects/boutique-microservices/backend/
FROM node:20-alpine AS builder

WORKDIR /backend

COPY services/orders/package*.json ./services/orders/
RUN npm install --prefix ./services/orders

COPY services/orders/src         ./services/orders/src
COPY services/orders/tsconfig.json ./services/orders/tsconfig.json
COPY shared                      ./shared

WORKDIR /backend/services/orders
RUN npm run build

# Production stage
FROM node:20-alpine

RUN apk upgrade --no-cache

WORKDIR /app

COPY services/orders/package*.json ./
RUN npm install --production && npm cache clean --force

COPY --from=builder /backend/services/orders/dist ./dist

RUN addgroup -g 1001 -S nodejs \
 && adduser  -S nodejs -u 1001

USER nodejs

EXPOSE 3005

CMD ["node", "dist/services/orders/src/index.js"]
