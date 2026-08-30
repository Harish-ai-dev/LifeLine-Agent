# Multi-stage production container build for LifeLine Agent
# Google Cloud Run Container Specification

# ── Stage 1: Builder ─────────────────────────────────────────────────────────
FROM python:3.11-slim as builder

WORKDIR /app

# Install build essentials for C-extensions / cryptography
RUN apt-get update && apt-get install -y --no-install-recommends \
    build-essential \
    && rm -rf /var/lib/apt/lists/*

# Create isolated virtual environment
RUN python -m venv /opt/venv
ENV PATH="/opt/venv/bin:$PATH"

# Install dependencies first for layer caching
COPY pyproject.toml requirements.txt ./
RUN pip install --no-cache-dir --upgrade pip setuptools wheel && \
    pip install --no-cache-dir -r requirements.txt

# Copy source tree and install lifeline package
COPY lifeline /app/lifeline
COPY admin /app/admin
COPY data /app/data
COPY scripts /app/scripts
RUN pip install --no-cache-dir --no-deps -e .

# ── Stage 2: Production Runtime ──────────────────────────────────────────────
FROM python:3.11-slim as runner

WORKDIR /app

# Copy virtualenv and application from builder stage
COPY --from=builder /opt/venv /opt/venv
COPY --from=builder /app /app

ENV PATH="/opt/venv/bin:$PATH"
ENV PYTHONUNBUFFERED=1
ENV PYTHONDONTWRITEBYTECODE=1
ENV PORT=8080
ENV HOST=0.0.0.0

# Expose standard Cloud Run port
EXPOSE 8080

# Health check using standard python library
HEALTHCHECK --interval=30s --timeout=5s --start-period=10s --retries=3 \
    CMD python -c "import urllib.request; urllib.request.urlopen('http://localhost:8080/health')" || exit 1

# Production entrypoint per contract
CMD ["uvicorn", "lifeline.main:app", "--host", "0.0.0.0", "--port", "8080"]
