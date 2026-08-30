#!/usr/bin/env bash
# =============================================================================
# LifeLine Agent — Google Cloud Run Deployment Script
# =============================================================================
set -euo pipefail

# Configuration defaults
PROJECT_ID="${GCP_PROJECT_ID:-${PROJECT_ID:-}}"
REGION="${REGION:-us-central1}"
SERVICE_NAME="${SERVICE_NAME:-lifeline-agent}"
IMAGE_TAG="${IMAGE_TAG:-latest}"
PORT="${PORT:-8080}"

if [ -z "$PROJECT_ID" ]; then
  echo "❌ Error: GCP_PROJECT_ID is not set. Please export GCP_PROJECT_ID=your-project-id"
  exit 1
fi

IMAGE_URI="gcr.io/${PROJECT_ID}/${SERVICE_NAME}:${IMAGE_TAG}"

echo "================================================================="
echo "🚑 LifeLine Agent — Deploying to Google Cloud Run"
echo "================================================================="
echo "  Project ID:   ${PROJECT_ID}"
echo "  Region:       ${REGION}"
echo "  Service Name: ${SERVICE_NAME}"
echo "  Image URI:    ${IMAGE_URI}"
echo "================================================================="

# 1. Build and push container image using Cloud Build
echo "[1/3] Submitting build to Google Cloud Build..."
gcloud builds submit \
  --project "${PROJECT_ID}" \
  --tag "${IMAGE_URI}" \
  --file deploy/Dockerfile .

# 2. Deploy to Cloud Run
echo "[2/3] Deploying service to Cloud Run..."
gcloud run deploy "${SERVICE_NAME}" \
  --image "${IMAGE_URI}" \
  --region "${REGION}" \
  --platform managed \
  --allow-unauthenticated \
  --port "${PORT}" \
  --set-env-vars "PORT=8080,HOST=0.0.0.0,DEMO_AUTH_MODE=true,DEMO_CITY=mumbai,FIRESTORE_COLLECTION=dispatch_cases,FIRESTORE_PROJECT_ID=${PROJECT_ID}" \
  --project "${PROJECT_ID}"

# 3. Retrieve service URL
SERVICE_URL=$(gcloud run services describe "${SERVICE_NAME}" --platform managed --region "${REGION}" --project "${PROJECT_ID}" --format 'value(status.url)')

echo "================================================================="
echo "✅ Deployment Successful!"
echo "  Service URL: ${SERVICE_URL}"
echo "  Health:      ${SERVICE_URL}/health"
echo "  API Docs:    ${SERVICE_URL}/docs"
echo "================================================================="
