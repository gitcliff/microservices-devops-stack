# Orders Service Dockerfile
# Build context: projects/boutique-microservices/backend/
FROM node:22-alpine AS builder

WORKDIR /backend

COPY services/orders/package*.json ./services/orders/
RUN npm install --prefix ./services/orders

# Symlink so shared/ can resolve deps from the service's node_modules
RUN ln -s /backend/services/orders/node_modules /backend/node_modules

COPY services/orders/src              ./services/orders/src
COPY services/orders/tsconfig.json    ./services/orders/tsconfig.json
COPY services/orders/tsconfig.build.json ./services/orders/tsconfig.build.json
COPY shared                           ./shared

WORKDIR /backend/services/orders
RUN npm run build

# Production stage
FROM node:22-alpine

RUN apk upgrade --no-cache \
 && npm install -g npm@latest

WORKDIR /app

COPY services/orders/package*.json ./
RUN npm install --omit=dev && npm cache clean --force

COPY --from=builder /backend/services/orders/dist ./dist

RUN addgroup -g 1001 -S nodejs \
 && adduser  -S nodejs -u 1001

USER nodejs

EXPOSE 3005

CMD ["node", "dist/services/orders/src/index.js"]
