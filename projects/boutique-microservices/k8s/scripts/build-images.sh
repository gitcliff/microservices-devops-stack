#!/bin/bash
# Build all service images using the local Docker daemon, then load into Minikube.
# Usage: bash k8s/scripts/build-images.sh

set -e

PROJECT_ROOT="$(cd "$(dirname "$0")/../.." && pwd)"
BACKEND="$PROJECT_ROOT/backend"
FRONTEND="$PROJECT_ROOT/frontend"

echo "==> Building boutique images (context: backend/ for services)"
echo "    Project root: $PROJECT_ROOT"
echo ""

# Backend services — build context is backend/ so shared/ resolves correctly
echo "[1/7] boutique/auth:latest"
docker build --platform linux/arm64 \
  -f "$BACKEND/services/auth/Dockerfile" \
  -t boutique/auth:latest \
  "$BACKEND"

echo "[2/7] boutique/product-service:latest"
docker build --platform linux/arm64 \
  -f "$BACKEND/services/product-service/Dockerfile" \
  -t boutique/product-service:latest \
  "$BACKEND"

echo "[3/7] boutique/order-service:latest"
docker build --platform linux/arm64 \
  -f "$BACKEND/services/order-service/Dockerfile" \
  -t boutique/order-service:latest \
  "$BACKEND"

echo "[4/7] boutique/orders:latest"
docker build --platform linux/arm64 \
  -f "$BACKEND/services/orders/Dockerfile" \
  -t boutique/orders:latest \
  "$BACKEND"

echo "[5/7] boutique/user-service:latest"
docker build --platform linux/arm64 \
  -f "$BACKEND/services/user-service/Dockerfile" \
  -t boutique/user-service:latest \
  "$BACKEND"

echo "[6/7] boutique/gateway:latest"
docker build --platform linux/arm64 \
  -f "$BACKEND/services/gateway/Dockerfile" \
  -t boutique/gateway:latest \
  "$BACKEND"

echo "[7/7] boutique/frontend:latest"
docker build --platform linux/arm64 \
  -t boutique/frontend:latest \
  "$FRONTEND"

echo ""
echo "==> All images built. Loading into Minikube..."
echo ""

for img in auth product-service order-service orders user-service gateway frontend; do
  echo "  Loading boutique/$img:latest"
  minikube image load "boutique/$img:latest"
done

echo ""
echo "==> Done! Verify with: minikube image ls | grep boutique"
