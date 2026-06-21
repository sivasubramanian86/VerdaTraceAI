#!/bin/bash
# deploy_cloud_run.sh - Build and deploy VerdaTraceAI Backend to Google Cloud Run

# Exit immediately if a command exits with a non-zero status
set -e

# Load project ID from environment or ask
GCP_PROJECT_ID=${1:-$(grep GCP_PROJECT_ID ../backend/.env | cut -d '=' -f2 | tr -d ' ' || echo "promptwars-demo-project")}
REGION=${2:-$(grep VERTEX_REGION ../backend/.env | cut -d '=' -f2 | tr -d ' ' || echo "us-central1")}
SERVICE_NAME="verdatrace-backend"

echo "============================================="
echo "Deploying VerdaTraceAI Backend to Cloud Run..."
echo "Project ID: $GCP_PROJECT_ID"
echo "Region:     $REGION"
echo "============================================="

# Ensure gcloud is configured to use the correct project
gcloud config set project "$GCP_PROJECT_ID"

# 1. Build and push image to Artifact Registry or Container Registry using Cloud Build
echo "Submitting build to Cloud Build..."
cd ../backend
gcloud builds submit --tag "gcr.io/$GCP_PROJECT_ID/$SERVICE_NAME:latest" .
cd ../infra

# 2. Deploy backend service to Cloud Run
echo "Deploying service to Cloud Run..."
gcloud run deploy "$SERVICE_NAME" \
  --image "gcr.io/$GCP_PROJECT_ID/$SERVICE_NAME:latest" \
  --region "$REGION" \
  --platform managed \
  --allow-unauthenticated \
  --set-env-vars="LLM_PROVIDER=vertex-ai,GCP_PROJECT_ID=$GCP_PROJECT_ID,VERTEX_REGION=$REGION"

echo "============================================="
echo "VerdaTraceAI Backend successfully deployed!"
echo "============================================="
gcloud run services describe "$SERVICE_NAME" --region "$REGION" --format='value(status.url)'
