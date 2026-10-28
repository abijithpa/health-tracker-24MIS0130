#!/bin/bash
# ====================================================================
# Health Tracker - Deploy 3 Versions to Kubernetes
# Roll No: 24MIS0130
# ====================================================================

set -e

echo "=========================================================="
echo "Deploying Health Tracker to Kubernetes"
echo "Roll Number: 24MIS0130"
echo "=========================================================="

echo "Applying Kubernetes manifests for v1, v2, v3..."
kubectl apply -f k8s/health-tracker-all.yaml

echo -e "\nWaiting for Pods to be ready..."
kubectl rollout status deployment/health-tracker-v1-deployment --timeout=60s || true
kubectl rollout status deployment/health-tracker-v2-deployment --timeout=60s || true
kubectl rollout status deployment/health-tracker-v3-deployment --timeout=60s || true

echo -e "\n=========================================================="
echo "Current Kubernetes Deployments:"
kubectl get deployments -l app=health-tracker

echo -e "\nCurrent Kubernetes Pods:"
kubectl get pods -l app=health-tracker -o wide

echo -e "\nCurrent Kubernetes Services:"
kubectl get services -l app=health-tracker
echo "=========================================================="

echo -e "\nLocalhost Access Instructions:"
echo "1. If using Docker Desktop / Minikube NodePort:"
echo "   v1: http://localhost:30001"
echo "   v2: http://localhost:30002"
echo "   v3: http://localhost:30003"
echo ""
echo "2. Or enable Port Forwarding using kubectl:"
echo "   kubectl port-forward svc/health-tracker-v1-service 8081:8081 &"
echo "   kubectl port-forward svc/health-tracker-v2-service 8082:8082 &"
echo "   kubectl port-forward svc/health-tracker-v3-service 8083:8083 &"
echo ""
echo "   Then open in browser:"
echo "   v1 (Enter Data)    : http://localhost:8081"
echo "   v2 (View Records)  : http://localhost:8082"
echo "   v3 (Chart & Graph) : http://localhost:8083"
echo "=========================================================="
