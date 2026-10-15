# User Service Dockerfile
# Build context: projects/boutique-microservices/backend/
FROM node:20-alpine AS builder

WORKDIR /backend

COPY services/user-service/package*.json ./services/user-service/
RUN npm install --prefix ./services/user-service

# Symlink so shared/ can resolve deps from the service's node_modules
RUN ln -s /backend/services/user-service/node_modules /backend/node_modules

COPY services/user-service/src              ./services/user-service/src
COPY services/user-service/tsconfig.json    ./services/user-service/tsconfig.json
COPY services/user-service/tsconfig.build.json ./services/user-service/tsconfig.build.json
COPY shared                                 ./shared

WORKDIR /backend/services/user-service
RUN npm run build

# Production stage
FROM node:22-alpine

RUN apk upgrade --no-cache \
 && npm install -g npm@11.18.0 && npm cache clean --force

WORKDIR /app

COPY services/user-service/package*.json ./
RUN npm install --omit=dev && npm cache clean --force

COPY --from=builder /backend/services/user-service/dist ./dist

RUN addgroup -g 1001 -S nodejs \
 && adduser  -S nodejs -u 1001

USER nodejs

EXPOSE 3006

CMD ["node", "dist/services/user-service/src/index.js"]
