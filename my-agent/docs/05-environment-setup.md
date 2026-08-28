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

Enable billing on the project (required for Places/Routes API and Cloud Run).

## 2. API Keys

- **Gemini API key** — get from Google AI Studio → put in `.env` as `GOOGLE_API_KEY`
- **Google Maps Platform key** (covers Places + Routes) — get from GCP Console → Credentials → put in `.env` as `GOOGLE_MAPS_API_KEY`
- Restrict both keys to only the APIs they need before the demo (basic hygiene, judges may check public repo for leaked keys — never commit `.env`)

## 3. Local Python environment

```bash
python3 -m venv venv
source venv/bin/activate
pip install -r requirements.txt
```

`requirements.txt` should include at minimum:
```
google-adk
google-generativeai
google-cloud-firestore
fastapi
uvicorn
streamlit
requests
pydantic
```

## 4. Firestore

```bash
gcloud firestore databases create --location=us-central1
```

## 5. Verify everything works before Day 1 coding starts

```bash
# Gemini
python3 -c "import google.generativeai as genai; genai.configure(api_key='YOUR_KEY'); print(genai.GenerativeModel('gemini-2.5-flash').generate_content('say hi').text)"

# Places API
curl "https://places.googleapis.com/v1/places:searchText" -H "Content-Type: application/json" -H "X-Goog-Api-Key: YOUR_KEY" -H "X-Goog-FieldMask: places.displayName" -d '{"textQuery": "hospitals in [YOUR CITY]"}'
```

If both return valid responses, environment is ready — proceed to `02-build-plan.md` Day 1.

## 6. Cloud Run deploy (used on Day 2, listed here for reference)

```bash
gcloud run deploy lifeline-agent \
  --source . \
  --region us-central1 \
  --allow-unauthenticated \
  --set-env-vars GOOGLE_API_KEY=$GOOGLE_API_KEY,GOOGLE_MAPS_API_KEY=$GOOGLE_MAPS_API_KEY
```
