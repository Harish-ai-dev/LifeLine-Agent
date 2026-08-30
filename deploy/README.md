# Deployment & Infrastructure Guide — Google Cloud Run

This directory contains container specifications, manifests, and scripts for deploying **LifeLine Agent** to Google Cloud Run.

---

## 📁 Directory Structure

- `Dockerfile`: Multi-stage production container build specification (Python 3.11).
- `cloud_run.yaml`: Knative Service YAML manifest with health checks, autoscaling, and environment variables.
- `deploy.sh`: Automated build and deployment script using Google Cloud Build and Cloud Run.

---

## 🚀 Quick Deployment Options

### Option 1: Direct gcloud Deploy (Recommended)

```bash
# 1. Authenticate and configure project
gcloud auth login
gcloud config set project YOUR_GCP_PROJECT_ID

# 2. Build & Deploy in one command
gcloud run deploy lifeline-agent \
  --source . \
  --region us-central1 \
  --allow-unauthenticated \
  --port 8080 \
  --set-env-vars GOOGLE_API_KEY=your-gemini-api-key,DEMO_AUTH_MODE=true,FIRESTORE_PROJECT_ID=YOUR_GCP_PROJECT_ID
```

### Option 2: Using the Makefile

```bash
# Set your GCP Project ID in .env or environment
export GCP_PROJECT_ID=your-project-id
make deploy-cloudrun
```

### Option 3: Using Knative Manifest (`cloud_run.yaml`)

```bash
# Replace PROJECT_ID in cloud_run.yaml with your GCP project
gcloud run services replace deploy/cloud_run.yaml --region us-central1
```

---

## ⚙️ Environment Variables on Cloud Run

| Variable Name | Required | Description |
|---|---|---|
| `PORT` | Yes | HTTP listening port (Cloud Run sets `8080` by default). |
| `HOST` | Yes | Bind address (`0.0.0.0`). |
| `GOOGLE_API_KEY` | Yes (for live AI) | Gemini API key for Gemini 3.1 Pro and Gemini 3.5 Flash models. |
| `DEMO_AUTH_MODE` | No (default: `true`) | Enables zero-friction mock auth token parsing. |
| `FIRESTORE_PROJECT_ID` | No | GCP Project ID containing Firestore collections. |
| `FIRESTORE_COLLECTION` | No (default: `dispatch_cases`) | Collection name for audit traces. |
| `DEMO_CITY` | No (default: `mumbai`) | Default city for hospital geospatial queries. |
| `VITE_API_BASE_URL` | No | Backend URL for frontend clients. |

---

## 🔒 Production Security Best Practices

1. **Secret Manager**: Store `GOOGLE_API_KEY` and Firebase service credentials in Google Cloud Secret Manager and reference them via Cloud Run secret volume mounts or secret environment variables (`--set-secrets`).
2. **Service Accounts**: Assign a dedicated IAM Service Account to Cloud Run with `roles/datastore.user` (for Firestore access) to eliminate the need for exported JSON keys.
3. **Health Probes**: Cloud Run automatically uses the `/health` endpoint for startup and liveness verification.
