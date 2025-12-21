# Multi-stage Docker build for Smart Complaint System
FROM python:3.11-slim as base

# Set environment variables
ENV PYTHONDONTWRITEBYTECODE=1 \
    PYTHONUNBUFFERED=1 \
    DEBIAN_FRONTEND=noninteractive

# Install system dependencies
RUN apt-get update && apt-get install -y \
    gcc \
    g++ \
    libpq-dev \
    curl \
    && rm -rf /var/lib/apt/lists/*

# Create app directory
WORKDIR /app

# Copy requirements first for better caching
COPY backend/requirements.txt /app/requirements.txt

# Install Python dependencies
RUN pip install --no-cache-dir --upgrade pip && \
    pip install --no-cache-dir -r requirements.txt

# Production stage
FROM base as production

# Create non-root user
RUN groupadd -r appuser && useradd -r -g appuser appuser

# Copy application code
COPY backend/ /app/backend/
COPY frontend/ /app/frontend/
COPY data/ /app/data/
COPY scripts/ /app/scripts/

# Create necessary directories
RUN mkdir -p /app/logs && \
    chown -R appuser:appuser /app

# Switch to non-root user
USER appuser

# Expose port
EXPOSE 5000

# Health check
HEALTHCHECK --interval=30s --timeout=10s --start-period=5s --retries=3 \
    CMD curl -f http://localhost:5000/api/health || exit 1

# Default command
CMD ["python", "backend/run_server.py"]

# Development stage
FROM base as development

# Install development dependencies
RUN pip install --no-cache-dir pytest pytest-cov black flake8 mypy

# Copy application code
COPY . /app/

# Create logs directory
RUN mkdir -p /app/logs

# Expose ports for development
EXPOSE 5000 5173

# Development command
CMD ["python", "backend/run_server.py"]