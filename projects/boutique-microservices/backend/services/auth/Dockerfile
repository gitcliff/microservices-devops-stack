# Auth Service Dockerfile
# Build context: projects/boutique-microservices/backend/
FROM node:20-alpine AS builder

WORKDIR /backend

COPY services/auth/package*.json ./services/auth/
RUN npm install --prefix ./services/auth

# Symlink so shared/ can resolve deps from the service's node_modules
RUN ln -s /backend/services/auth/node_modules /backend/node_modules

COPY services/auth/src              ./services/auth/src
COPY services/auth/tsconfig.json    ./services/auth/tsconfig.json
COPY services/auth/tsconfig.build.json ./services/auth/tsconfig.build.json
COPY shared                         ./shared

WORKDIR /backend/services/auth
RUN npm run build

# Production stage
FROM node:22-alpine

RUN apk upgrade --no-cache \
 && npm install -g npm@10.9.2 --ignore-scripts && npm cache clean --force


WORKDIR /app

COPY services/auth/package*.json ./
RUN npm install --omit=dev && npm cache clean --force

COPY --from=builder /backend/services/auth/dist ./dist

RUN addgroup -g 1001 -S nodejs \
 && adduser  -S nodejs -u 1001

USER nodejs

EXPOSE 3002

CMD ["node", "dist/services/auth/src/index.js"]
