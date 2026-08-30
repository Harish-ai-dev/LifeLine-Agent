.PHONY: help install dev run ui test test-fast seed fetch data build-docker docker-build docker-run deploy-cloudrun deploy clean lint format

# ── Default ────────────────────────────────────────────────────────────────────
help:
	@echo ""
	@echo "  🚑 LifeLine Agent — Makefile Commands"
	@echo "  ─────────────────────────────────────────────────────────────────"
	@echo "  make install          Install package + development dependencies"
	@echo "  make dev              Start full stack (Backend + Frontend) concurrently"
	@echo "  make run              Start FastAPI backend server (http://localhost:8000)"
	@echo "  make ui               Launch Next.js frontend app (http://localhost:3000)"
	@echo "  make test             Run full test suite with coverage report"
	@echo "  make test-fast        Run tests quickly without coverage"
	@echo "  make seed             Enrich hospitals with simulated bed & specialty data"
	@echo "  make fetch            Pull real hospital locations (OSM Overpass API)"
	@echo "  make data             Run full data pipeline (fetch + seed)"
	@echo "  make build-docker     Build multi-stage production Docker container"
	@echo "  make deploy-cloudrun  Deploy containerized service to Google Cloud Run"
	@echo "  make lint             Run ruff code linter"
	@echo "  make format           Auto-format code with ruff"
	@echo "  make clean            Remove build artifacts, caches, and temp files"
	@echo "  ─────────────────────────────────────────────────────────────────"
	@echo ""

# ── Setup ──────────────────────────────────────────────────────────────────────
install:
	python -m pip install --upgrade pip
	python -m pip install -e ".[dev]"
	@echo "✅ LifeLine Agent installed. Run 'lifeline --help' or 'make dev' to get started."

# ── Development Servers ────────────────────────────────────────────────────────
dev:
	python start.py

run:
	python -m uvicorn lifeline.main:app --host 0.0.0.0 --port 8000 --reload

ui:
	python -m lifeline ui

# ── Data Pipeline ──────────────────────────────────────────────────────────────
CITY ?= mumbai

fetch:
	python -m lifeline fetch-hospitals --city $(CITY)

seed:
	python -m lifeline seed

# Run full data pipeline (fetch + seed)
data: fetch seed

# ── Testing ────────────────────────────────────────────────────────────────────
test:
	python -m pytest tests/ -v --cov=lifeline --cov-report=term-missing

test-fast:
	python -m pytest tests/ -x -q

# ── Code Quality ───────────────────────────────────────────────────────────────
lint:
	ruff check lifeline/ admin/ tests/

format:
	ruff format lifeline/ admin/ tests/
	ruff check --fix lifeline/ admin/ tests/

# ── Docker ─────────────────────────────────────────────────────────────────────
IMAGE_NAME ?= lifeline-agent
IMAGE_TAG  ?= latest
PROJECT_ID ?= $(shell cat .env 2>/dev/null | grep -E "^(FIRESTORE_PROJECT_ID|GCP_PROJECT_ID)=" | head -n 1 | cut -d= -f2)
REGION     ?= us-central1

build-docker:
	docker build -f deploy/Dockerfile -t $(IMAGE_NAME):$(IMAGE_TAG) .

docker-build: build-docker

docker-run:
	docker run --rm -p 8000:8080 \
		--env-file .env \
		$(IMAGE_NAME):$(IMAGE_TAG)

# ── Cloud Run Deployment ───────────────────────────────────────────────────────
deploy-cloudrun:
	@if [ -z "$(PROJECT_ID)" ]; then echo "❌ Set FIRESTORE_PROJECT_ID or GCP_PROJECT_ID in .env"; exit 1; fi
	gcloud builds submit \
		--tag gcr.io/$(PROJECT_ID)/$(IMAGE_NAME):$(IMAGE_TAG) \
		--project $(PROJECT_ID)
	gcloud run deploy $(IMAGE_NAME) \
		--image gcr.io/$(PROJECT_ID)/$(IMAGE_NAME):$(IMAGE_TAG) \
		--region $(REGION) \
		--platform managed \
		--allow-unauthenticated \
		--project $(PROJECT_ID)
	@echo "✅ Successfully deployed to Cloud Run"

deploy: deploy-cloudrun

# ── Clean ──────────────────────────────────────────────────────────────────────
clean:
	@echo "🧹 Cleaning up temporary files and caches..."
	python -c "import shutil, pathlib; [shutil.rmtree(p, ignore_errors=True) for p in pathlib.Path('.').rglob('__pycache__')]"
	python -c "import shutil, pathlib; [shutil.rmtree(p, ignore_errors=True) for p in pathlib.Path('.').rglob('*.egg-info')]"
	python -c "import shutil, pathlib; [shutil.rmtree(p, ignore_errors=True) for p in pathlib.Path('.').rglob('.pytest_cache')]"
	python -c "import shutil, pathlib; [shutil.rmtree(p, ignore_errors=True) for p in pathlib.Path('.').rglob('.ruff_cache')]"
	python -c "import os, pathlib; [os.remove(f) for f in pathlib.Path('.').rglob('*.py[co]')]"
	python -c "import os; os.remove('.coverage') if os.path.exists('.coverage') else None"
	@echo "✨ Clean complete."
