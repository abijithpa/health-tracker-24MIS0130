#!/bin/bash
# ====================================================================
# Health Tracker - Push Images to DockerHub (v1, v2, v3)
# Roll No: 24MIS0130
# ====================================================================

set -e

REGISTRY_USER=${1:-"24mis0130"}
IMAGE_NAME="health-tracker"

echo "=========================================================="
echo "Pushing Health Tracker Images to DockerHub"
echo "Target User : ${REGISTRY_USER}"
echo "=========================================================="

echo "Checking Docker authentication..."
docker login

echo -e "\n[1/3] Pushing ${REGISTRY_USER}/${IMAGE_NAME}:v1 ..."
docker push ${REGISTRY_USER}/${IMAGE_NAME}:v1

echo -e "\n[2/3] Pushing ${REGISTRY_USER}/${IMAGE_NAME}:v2 ..."
docker push ${REGISTRY_USER}/${IMAGE_NAME}:v2

echo -e "\n[3/3] Pushing ${REGISTRY_USER}/${IMAGE_NAME}:v3 ..."
docker push ${REGISTRY_USER}/${IMAGE_NAME}:v3

echo -e "\n=========================================================="
echo "Successfully pushed all 3 versions to DockerHub!"
echo "DockerHub URLs:"
echo "https://hub.docker.com/r/${REGISTRY_USER}/${IMAGE_NAME}/tags"
echo "=========================================================="
