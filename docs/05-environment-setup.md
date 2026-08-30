# 05 — Environment Setup (copy-paste checklist)

Run once, in order. Don't improvise — if a step fails, fix it before moving on.

## 1. GCP Project

```bash
gcloud projects create lifeline-agent-hack --name="LifeLine Agent"
gcloud config set project lifeline-agent-hack
gcloud services enable run.googleapis.com firestore.googleapis.com \
  places-backend.googleapis.com routes.googleapis.com \
  aiplatform.googleapis.com
```

Enable billing on the project (required for Cloud Run & Firestore).

## 2. API Keys

- **Gemini API key** — get from Google AI Studio → put in `.env` as `GOOGLE_API_KEY`
- Restrict keys to only the APIs they need before the demo (basic hygiene, judges may check public repo for leaked keys — never commit `.env`)

## 3. Local Python Environment

```bash
python -m venv venv
# On Windows:
.\venv\Scripts\activate
# On Linux/macOS:
source venv/bin/activate

pip install -e ".[dev]"
```

## 4. Firestore

```bash
gcloud firestore databases create --location=us-central1
```

## 5. Verify Everything Works Before Coding Starts

```bash
# Verify Gemini 3.5 Flash
python -c "import google.generativeai as genai, os; genai.configure(api_key=os.environ.get('GOOGLE_API_KEY')); print(genai.GenerativeModel('gemini-3.5-flash').generate_content('ping').text)"
```

## 6. Cloud Run Deploy

```bash
gcloud run deploy lifeline-agent \
  --source . \
  --region us-central1 \
  --allow-unauthenticated \
  --set-env-vars GOOGLE_API_KEY=$GOOGLE_API_KEY
```
