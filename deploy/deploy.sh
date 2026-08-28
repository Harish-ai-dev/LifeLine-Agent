#!/bin/bash
# Deploy to Cloud Run. See docs/05-environment-setup.md for prerequisites.
set -e

gcloud run deploy lifeline-agent \
  --source . \
  --region us-central1 \
  --allow-unauthenticated \
  --set-env-vars GOOGLE_API_KEY=$GOOGLE_API_KEY,GOOGLE_MAPS_API_KEY=$GOOGLE_MAPS_API_KEY
