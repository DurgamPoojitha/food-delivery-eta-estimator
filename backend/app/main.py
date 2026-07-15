"""
main.py
=======
Purpose:
    FastAPI application factory — the composition root of the entire app.
    Wires together: configuration, logging, middleware, exception handlers,
    and routers. Nothing else lives here.

Design Rationale (Composition Root pattern):
    - main.py is the ONLY file that imports from every other layer.
      All other modules only import from layers below them.
    - Using lifespan (instead of deprecated @app.on_event) handles startup
      and shutdown as a single async context manager — cleaner and testable.
    - Exception handlers are registered BEFORE middleware so they can catch
      errors raised within middleware chains.
    - CORS middleware is added LAST (closest to the client) so it runs FIRST
      on incoming requests and adds headers to ALL responses, including errors.

Architecture layers (top → bottom):
    routers → services → utils
               ↑
          models (shared types, used by all layers)
               ↑
    core + exceptions (cross-cutting, no layer imports them)
"""

import logging
from contextlib import asynccontextmanager

from fastapi import FastAPI
from fastapi.exceptions import RequestValidationError
from fastapi.middleware.cors import CORSMiddleware
from starlette.exceptions import HTTPException as StarletteHTTPException

from app.core.config import get_settings
from app.core.logging_config import configure_logging, get_logger
from app.exceptions.errors import DeliverIQError
from app.exceptions.handlers import (
    deliveriq_exception_handler,
    http_exception_handler,
    unhandled_exception_handler,
    validation_exception_handler,
)
from app.routers.estimate import router as estimate_router

# ── Bootstrap ────────────────────────────────────────────────────────────────
# Load settings first — everything else depends on them.
settings = get_settings()

# Configure logging immediately after loading settings.
# All subsequent logger calls inherit this configuration.
configure_logging(
    log_level=settings.log_level,
    log_format=settings.log_format,
)

logger = get_logger(__name__)


# ── Lifespan ─────────────────────────────────────────────────────────────────

@asynccontextmanager
async def lifespan(app: FastAPI):
    """
    Manage application startup and shutdown events.

    Using the lifespan context manager (FastAPI 0.95+) is preferred over
    the deprecated @app.on_event("startup") pattern. It handles both events
    in one place and is compatible with pytest's TestClient.
    """
    # ── Startup ───────────────────────────────────────────────────────────────
    logger.info(
        "DeliverIQ API v%s starting | env=%s | log_level=%s",
        settings.app_version,
        settings.environment,
        settings.log_level,
    )
    logger.info("CORS origins: %s", settings.cors_origins_list)
    logger.info("API prefix:   %s", settings.api_prefix)
    logger.info("Swagger docs: %s", settings.docs_url)

    yield  # ← Application runs here

    # ── Shutdown ──────────────────────────────────────────────────────────────
    logger.info("DeliverIQ API shutting down gracefully")


# ── App factory ───────────────────────────────────────────────────────────────

app = FastAPI(
    title=settings.app_name,
    description=settings.app_description,
    version=settings.app_version,
    docs_url=settings.docs_url,
    redoc_url=settings.redoc_url,
    lifespan=lifespan,
    # OpenAPI tag ordering for Swagger UI sidebar
    openapi_tags=[
        {
            "name": "ETA Estimation",
            "description": (
                "Core endpoint for estimating food delivery arrival time. "
                "Accepts GPS coordinates + traffic level, returns distance, "
                "travel time, and a human-readable delivery status."
            ),
        },
        {
            "name": "Health",
            "description": (
                "API liveness probe. Used by Render's health check ping "
                "and uptime monitoring tools."
            ),
        },
    ],
)


# ── Exception Handlers ────────────────────────────────────────────────────────
# Registered before middleware so they catch errors from all layers.
# Order matters: more specific types first.

app.add_exception_handler(DeliverIQError,             deliveriq_exception_handler)   # type: ignore[arg-type]
app.add_exception_handler(StarletteHTTPException,     http_exception_handler)        # type: ignore[arg-type]
app.add_exception_handler(RequestValidationError,     validation_exception_handler)  # type: ignore[arg-type]
app.add_exception_handler(Exception,                  unhandled_exception_handler)   # type: ignore[arg-type]


# ── Middleware ─────────────────────────────────────────────────────────────────
# Middleware wraps request/response processing.
# CORS middleware adds Access-Control headers to ALL responses, including errors.

app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.cors_origins_list,
    allow_credentials=True,
    allow_methods=["GET", "POST", "OPTIONS"],
    allow_headers=["Content-Type", "Accept", "Authorization"],
)


# ── Routers ───────────────────────────────────────────────────────────────────
# Mounting with prefix here (not in the router) follows the thin-router pattern:
# the router doesn't need to know where it's mounted.

app.include_router(estimate_router, prefix=settings.api_prefix)


# ── Health check ──────────────────────────────────────────────────────────────

@app.get(
    "/",
    tags=["Health"],
    summary="API health check",
    response_description="API liveness status",
    responses={
        200: {
            "description": "API is healthy and running",
            "content": {
                "application/json": {
                    "example": {
                        "status": "ok",
                        "service": "DeliverIQ API",
                        "version": "2.0.0",
                        "environment": "production",
                        "docs": "/docs",
                    }
                }
            },
        }
    },
)
async def health_check() -> dict:
    """
    GET /

    Returns a status payload confirming the API is live and its current version.
    Used by Render's uptime health-check ping (every 30s in production).
    """
    logger.debug("Health check requested")
    return {
        "status":      "ok",
        "service":     settings.app_name,
        "version":     settings.app_version,
        "environment": settings.environment,
        "docs":        settings.docs_url,
    }
