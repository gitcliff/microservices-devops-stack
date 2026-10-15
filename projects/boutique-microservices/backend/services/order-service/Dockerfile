# Order Service Dockerfile (JavaScript service)
# Build context: projects/boutique-microservices/backend/
FROM node:20-alpine

RUN apk upgrade --no-cache \
 && npm install -g npm@latest && npm cache clean --force

WORKDIR /app

COPY services/order-service/package*.json ./
RUN npm install --omit=dev && npm cache clean --force

COPY services/order-service/src ./src

RUN addgroup -g 1001 -S nodejs \
 && adduser  -S nodejs -u 1001

USER nodejs

EXPOSE 3004

CMD ["node", "src/server.js"]
