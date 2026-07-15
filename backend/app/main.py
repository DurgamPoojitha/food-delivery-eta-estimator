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

settings = get_settings()

configure_logging(
    log_level=settings.log_level,
    log_format=settings.log_format,
)

logger = get_logger(__name__)

@asynccontextmanager
async def lifespan(app: FastAPI):
    
    logger.info(
        "DeliverIQ API v%s starting | env=%s | log_level=%s",
        settings.app_version,
        settings.environment,
        settings.log_level,
    )
    logger.info("CORS origins: %s", settings.cors_origins_list)
    logger.info("API prefix:   %s", settings.api_prefix)
    logger.info("Swagger docs: %s", settings.docs_url)

    yield

    logger.info("DeliverIQ API shutting down gracefully")

app = FastAPI(
    title=settings.app_name,
    description=settings.app_description,
    version=settings.app_version,
    docs_url=settings.docs_url,
    redoc_url=settings.redoc_url,
    lifespan=lifespan,
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

app.add_exception_handler(DeliverIQError,             deliveriq_exception_handler) 
app.add_exception_handler(StarletteHTTPException,     http_exception_handler)      
app.add_exception_handler(RequestValidationError,     validation_exception_handler)
app.add_exception_handler(Exception,                  unhandled_exception_handler) 

app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.cors_origins_list,
    allow_credentials=True,
    allow_methods=["GET", "POST", "OPTIONS"],
    allow_headers=["Content-Type", "Accept", "Authorization"],
)

app.include_router(estimate_router, prefix=settings.api_prefix)

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
    
    logger.debug("Health check requested")
    return {
        "status":      "ok",
        "service":     settings.app_name,
        "version":     settings.app_version,
        "environment": settings.environment,
        "docs":        settings.docs_url,
    }
