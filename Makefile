.PHONY: install admin ui run fetch seed test lint format docker-build docker-run deploy help

# ── Default ────────────────────────────────────────────────────────────────────
help:
	@echo ""
	@echo "  🚑 LifeLine Agent — Makefile commands"
	@echo "  ────────────────────────────────────────────────────"
	@echo "  make install        Install package + dev dependencies"
	@echo "  make admin          Launch Super Admin Panel (set API keys)"
	@echo "  make ui             Launch demo Streamlit UI"
	@echo "  make run            Start FastAPI server (localhost:8000)"
	@echo "  make fetch          Pull real hospital data (Overpass API)"
	@echo "  make seed           Enrich hospitals with simulated bed data"
	@echo "  make test           Run full test suite"
	@echo "  make lint           Lint with ruff"
	@echo "  make format         Auto-format with ruff"
	@echo "  make docker-build   Build production Docker image"
	@echo "  make docker-run     Run Docker image locally"
	@echo "  make deploy         Deploy to Google Cloud Run"
	@echo ""

# ── Setup ──────────────────────────────────────────────────────────────────────
install:
	pip install -e ".[dev]"
	@echo "✅ lifeline-agent installed. Run 'lifeline --help' to get started."

# ── Dev servers ────────────────────────────────────────────────────────────────
admin:
	lifeline admin

ui:
	lifeline ui

run:
	lifeline run --reload

# ── Data pipeline ──────────────────────────────────────────────────────────────
CITY ?= mumbai

fetch:
	lifeline fetch-hospitals --city $(CITY)

seed:
	lifeline seed

# Run full data pipeline (fetch + seed)
data: fetch seed

# ── Testing ────────────────────────────────────────────────────────────────────
test:
	pytest tests/ -v --cov=lifeline --cov-report=term-missing

test-fast:
	pytest tests/ -x -q

# ── Linting / Formatting ───────────────────────────────────────────────────────
lint:
	ruff check lifeline/ admin/ tests/

format:
	ruff format lifeline/ admin/ tests/
	ruff check --fix lifeline/ admin/ tests/

# ── Docker ─────────────────────────────────────────────────────────────────────
IMAGE_NAME ?= lifeline-agent
IMAGE_TAG  ?= latest
PROJECT_ID ?= $(shell cat .env 2>/dev/null | grep GCP_PROJECT_ID | cut -d= -f2)
REGION     ?= us-central1

docker-build:
	docker build -f deploy/Dockerfile -t $(IMAGE_NAME):$(IMAGE_TAG) .

docker-run:
	docker run --rm -p 8000:8080 \
		--env-file .env \
		$(IMAGE_NAME):$(IMAGE_TAG)

# ── Cloud Run Deployment ───────────────────────────────────────────────────────
deploy:
	@if [ -z "$(PROJECT_ID)" ]; then echo "❌ Set GCP_PROJECT_ID in .env"; exit 1; fi
	gcloud builds submit \
		--tag gcr.io/$(PROJECT_ID)/$(IMAGE_NAME):$(IMAGE_TAG) \
		--project $(PROJECT_ID)
	gcloud run deploy $(IMAGE_NAME) \
		--image gcr.io/$(PROJECT_ID)/$(IMAGE_NAME):$(IMAGE_TAG) \
		--region $(REGION) \
		--platform managed \
		--allow-unauthenticated \
		--project $(PROJECT_ID)
	@echo "✅ Deployed to Cloud Run"
