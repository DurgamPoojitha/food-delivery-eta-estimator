"""
exceptions/handlers.py
======================
Purpose:
    Global FastAPI exception handlers that convert ALL exception types into
    consistent, well-structured JSON error responses.

Design Rationale:
    - EVERY error from the API has the same outer shape, regardless of its cause.
      This is critical for frontend error handling — one pattern, zero surprises.
    - Distinguishing 4 exception categories gives precise, actionable responses:
        1. DeliverIQError     → app-level errors we control
        2. RequestValidationError → Pydantic schema failures (422)
        3. HTTPException      → FastAPI/Starlette HTTP errors (404, 405, etc.)
        4. Exception          → Unexpected catch-all (never expose internals)
    - The catch-all handler logs CRITICAL so on-call engineers are alerted
      immediately, while the client sees a generic "please try again" message.

Uniform Error Response Shape:
    {
        "error": {
            "code":    "VALIDATION_ERROR",     ← machine-readable, stable
            "message": "Human-readable text",  ← safe to show users
            "details": [                       ← optional, field-level info
                {
                    "field":   "restaurant_lat",
                    "message": "Input should be ≤ 90",
                    "type":    "less_than_equal"
                }
            ]
        }
    }

Registration (in main.py):
    app.add_exception_handler(DeliverIQError, deliveriq_exception_handler)
    app.add_exception_handler(StarletteHTTPException, http_exception_handler)
    app.add_exception_handler(RequestValidationError, validation_exception_handler)
    app.add_exception_handler(Exception, unhandled_exception_handler)
"""

import logging
from typing import Any

from fastapi import Request
from fastapi.exceptions import RequestValidationError
from fastapi.responses import JSONResponse
from starlette.exceptions import HTTPException as StarletteHTTPException

from app.exceptions.errors import DeliverIQError

logger = logging.getLogger(__name__)


# ── Helper ────────────────────────────────────────────────────────────────────

def _build_error_response(
    status_code: int,
    code: str,
    message: str,
    details: list[dict[str, Any]] | None = None,
) -> JSONResponse:
    """
    Builds a standardised JSON error response.

    All error responses share this structure so the frontend only needs
    to handle one error shape — not a different format per error type.
    """
    content: dict[str, Any] = {
        "error": {
            "code":    code,
            "message": message,
        }
    }
    if details:
        content["error"]["details"] = details

    return JSONResponse(status_code=status_code, content=content)


# ── Handler 1: Custom app errors ─────────────────────────────────────────────

async def deliveriq_exception_handler(
    request: Request,
    exc: DeliverIQError,
) -> JSONResponse:
    """
    Handle all DeliverIQError subclasses (ValidationError, InvalidCoordinatesError, etc.).

    Logs at ERROR level with path context for traceability.
    The exception carries its own status_code and error_code.
    """
    logger.error(
        "Application error | path=%s | error_code=%s | message=%s",
        request.url.path,
        exc.error_code,
        exc.message,
    )
    return _build_error_response(
        status_code=exc.status_code,
        code=exc.error_code,
        message=exc.message,
    )


# ── Handler 2: HTTP exceptions (404, 405, etc.) ───────────────────────────────

async def http_exception_handler(
    request: Request,
    exc: StarletteHTTPException,
) -> JSONResponse:
    """
    Handle standard Starlette/FastAPI HTTP errors.

    Logs at WARNING because these are usually client errors (not our bugs).
    Common cases: 404 Not Found, 405 Method Not Allowed.
    """
    logger.warning(
        "HTTP error | path=%s | status=%d | detail=%s",
        request.url.path,
        exc.status_code,
        exc.detail,
    )
    return _build_error_response(
        status_code=exc.status_code,
        code="HTTP_ERROR",
        message=str(exc.detail),
    )


# ── Handler 3: Pydantic schema validation errors ─────────────────────────────

async def validation_exception_handler(
    request: Request,
    exc: RequestValidationError,
) -> JSONResponse:
    """
    Handle Pydantic v2 request validation errors (HTTP 422).

    Reformats Pydantic's verbose error format into clean field-level
    messages that the frontend can display next to specific form fields.

    Pydantic default (verbose):
        [{"loc": ["body", "restaurant_lat"], "msg": "...", "type": "..."}]

    Our output (clean):
        [{"field": "restaurant_lat", "message": "...", "type": "..."}]
    """
    details: list[dict[str, Any]] = []
    for error in exc.errors():
        # Build a human-readable field path like "restaurant_lat" or "nested → field"
        loc_parts = [str(loc) for loc in error["loc"] if loc != "body"]
        field_path = " → ".join(loc_parts) if loc_parts else "request"

        details.append({
            "field":   field_path,
            "message": error["msg"],
            "type":    error["type"],
        })

    logger.warning(
        "Validation error | path=%s | errors=%s",
        request.url.path,
        details,
    )

    return _build_error_response(
        status_code=422,
        code="VALIDATION_ERROR",
        message="Request validation failed. Please check the highlighted fields.",
        details=details,
    )


# ── Handler 4: Unhandled catch-all ────────────────────────────────────────────

async def unhandled_exception_handler(
    request: Request,
    exc: Exception,
) -> JSONResponse:
    """
    Last-resort catch-all for unexpected exceptions.

    NEVER exposes internal error details to the client — doing so would
    leak implementation details that attackers could exploit.

    Logs at CRITICAL so PagerDuty/alerting fires immediately.
    The full traceback is included in the log for debugging.
    """
    logger.critical(
        "Unhandled exception | path=%s | type=%s | message=%s",
        request.url.path,
        type(exc).__name__,
        str(exc),
        exc_info=True,  # Includes full stack trace in the log
    )
    return _build_error_response(
        status_code=500,
        code="INTERNAL_ERROR",
        message="An unexpected error occurred. Please try again later.",
    )
