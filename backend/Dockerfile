# Dockerfile for VerdaTraceAI FastAPI Backend
# Multi-stage build: minimal, non-root, production-ready
FROM python:3.12-slim AS base

# Install system dependencies (libpq for asyncpg, build-essential for compilation)
RUN apt-get update && apt-get install -y --no-install-recommends \
    build-essential \
    libpq-dev \
    && rm -rf /var/lib/apt/lists/*

WORKDIR /app

# --- Dependency layer (cached separately) ---
FROM base AS deps
COPY requirements.txt .
RUN pip install --no-cache-dir --upgrade pip \
    && pip install --no-cache-dir -r requirements.txt

# --- Final runtime image ---
FROM deps AS runtime

# Create non-root user for security
RUN groupadd -r appgroup && useradd -r -g appgroup -d /app -s /sbin/nologin appuser

# Copy source
COPY --chown=appuser:appgroup . .

# Set Python path
ENV PYTHONPATH=/app
ENV PORT=8080

# Drop to non-root
USER appuser

# Expose Cloud Run default port
EXPOSE 8080

# Use uvicorn with production settings (no --reload in prod)
CMD ["python", "-m", "uvicorn", "app.main:app", "--host", "0.0.0.0", "--port", "8080", "--workers", "2", "--log-level", "info"]
