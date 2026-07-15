# ══════════════════════════════════════════════════════════════════════════════
# DeliverIQ API — Dockerfile
# ══════════════════════════════════════════════════════════════════════════════
#
# Multi-stage build strategy:
#   Stage 1 (builder): Install dependencies into /install prefix.
#   Stage 2 (runtime): Copy only the installed packages — no build tools, no cache.
#
# Benefits:
#   - Final image contains ONLY what's needed to run the app.
#   - No pip, gcc, or build artifacts in production image.
#   - Significantly smaller final image size.
#   - Non-root user improves container security posture.
#
# Build:  docker build -t deliveriq-api .
# Run:    docker run -p 8000:8000 -e CORS_ORIGINS=http://localhost:5173 deliveriq-api
# ══════════════════════════════════════════════════════════════════════════════


# ── Stage 1: Builder ──────────────────────────────────────────────────────────
FROM python:3.12-slim AS builder

# Set working directory
WORKDIR /build

# Prevents Python from writing .pyc files (not needed in containers)
ENV PYTHONDONTWRITEBYTECODE=1

# Install packages to a custom prefix so Stage 2 can copy them cleanly
COPY requirements.txt .
RUN pip install --no-cache-dir --upgrade pip \
 && pip install --no-cache-dir --prefix=/install -r requirements.txt


# ── Stage 2: Runtime ──────────────────────────────────────────────────────────
FROM python:3.12-slim AS runtime

# ── Security: run as non-root user ─────────────────────────────────────────
# Running as root inside a container is a security anti-pattern.
# If the container is compromised, root access inside the container could
# escalate to host-level access depending on the runtime configuration.
RUN useradd \
    --no-create-home \
    --no-log-init \
    --shell /bin/false \
    deliveriq

WORKDIR /app

# ── Python environment ────────────────────────────────────────────────────────
ENV PYTHONDONTWRITEBYTECODE=1 \
    PYTHONUNBUFFERED=1 \
    PYTHONPATH=/app

# ── Copy installed packages from builder ─────────────────────────────────────
COPY --from=builder /install /usr/local

# ── Copy application source ───────────────────────────────────────────────────
# Owned by deliveriq user — container process cannot modify its own code.
COPY --chown=deliveriq:deliveriq app/ ./app/

# ── Switch to non-root user ───────────────────────────────────────────────────
USER deliveriq

# ── Expose port ───────────────────────────────────────────────────────────────
EXPOSE 8000

# ── Health check ──────────────────────────────────────────────────────────────
# Docker/Kubernetes will mark the container unhealthy if this fails.
# Uses Python's built-in urllib so no curl dependency needed.
HEALTHCHECK \
    --interval=30s \
    --timeout=10s \
    --start-period=15s \
    --retries=3 \
    CMD python3 -c "\
import urllib.request, sys; \
r = urllib.request.urlopen('http://localhost:8000/'); \
sys.exit(0 if r.status == 200 else 1)"

# ── Start command ─────────────────────────────────────────────────────────────
# --host 0.0.0.0  → listen on all interfaces (required in containers)
# --port $PORT    → Render/Railway/Fly.io inject PORT env var
# Workers: 1 (use Gunicorn + uvicorn workers for multi-core production scaling)
CMD ["uvicorn", "app.main:app", "--host", "0.0.0.0", "--port", "8000"]
