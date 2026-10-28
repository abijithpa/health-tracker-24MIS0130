#!/bin/bash
# ====================================================================
# Health Tracker - Build & Run Docker Containers (v1, v2, v3)
# Roll No: 24MIS0130
# ====================================================================

set -e

REGISTRY_USER=${1:-"24mis0130"}
IMAGE_NAME="health-tracker"

echo "=========================================================="
echo "Building Health Tracker Docker Images"
echo "Roll Number : 24MIS0130"
echo "Image Base  : ${REGISTRY_USER}/${IMAGE_NAME}"
echo "=========================================================="

# Build v1
echo -e "\n[1/3] Building v1 (Enter Data)..."
docker build -t ${REGISTRY_USER}/${IMAGE_NAME}:v1 -f versions/v1/Dockerfile versions/v1

# Build v2
echo -e "\n[2/3] Building v2 (View Records)..."
docker build -t ${REGISTRY_USER}/${IMAGE_NAME}:v2 -f versions/v2/Dockerfile versions/v2

# Build v3
echo -e "\n[3/3] Building v3 (Chart & Graph)..."
docker build -t ${REGISTRY_USER}/${IMAGE_NAME}:v3 -f versions/v3/Dockerfile versions/v3

echo -e "\n=========================================================="
echo "Successfully built images:"
docker images | grep "${IMAGE_NAME}"
echo "=========================================================="

echo -e "\nStarting containers via Docker Compose..."
docker compose down || true
docker compose up -d

echo -e "\nVerifying running containers:"
docker ps --filter "name=health-tracker"

echo -e "\n=========================================================="
echo "All 3 versions are now live on localhost:"
echo "v1 (Enter Data)    : http://localhost:8081"
echo "v2 (View Records)  : http://localhost:8082"
echo "v3 (Chart & Graph) : http://localhost:8083"
echo "=========================================================="
