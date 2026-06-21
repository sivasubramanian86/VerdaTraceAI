# Dockerfile for VerdaTraceAI FastAPI Backend
FROM python:3.12-slim

WORKDIR /app

# Install system dependencies
RUN apt-get update && apt-get install -y --no-install-recommends \
    build-essential \
    libpq-dev \
    && rm -rf /var/lib/apt/lists/*

# Copy requirements and install
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# Copy application source code
COPY . .

# Set Pythonpath
ENV PYTHONPATH=/app

# Expose FastAPI port
EXPOSE 8000

# Start server
CMD ["python", "-m", "app.main"]
