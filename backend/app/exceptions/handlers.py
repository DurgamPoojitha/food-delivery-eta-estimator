import logging
from typing import Any

from fastapi import Request
from fastapi.exceptions import RequestValidationError
from fastapi.responses import JSONResponse
from starlette.exceptions import HTTPException as StarletteHTTPException

from app.exceptions.errors import DeliverIQError

logger = logging.getLogger(__name__)

def _build_error_response(
    status_code: int,
    code: str,
    message: str,
    details: list[dict[str, Any]] | None = None,
) -> JSONResponse:
    
    content: dict[str, Any] = {
        "error": {
            "code":    code,
            "message": message,
        }
    }
    if details:
        content["error"]["details"] = details

    return JSONResponse(status_code=status_code, content=content)

async def deliveriq_exception_handler(
    request: Request,
    exc: DeliverIQError,
) -> JSONResponse:
    
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

async def http_exception_handler(
    request: Request,
    exc: StarletteHTTPException,
) -> JSONResponse:
    
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

async def validation_exception_handler(
    request: Request,
    exc: RequestValidationError,
) -> JSONResponse:
    
    details: list[dict[str, Any]] = []
    for error in exc.errors():
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

async def unhandled_exception_handler(
    request: Request,
    exc: Exception,
) -> JSONResponse:
    
    logger.critical(
        "Unhandled exception | path=%s | type=%s | message=%s",
        request.url.path,
        type(exc).__name__,
        str(exc),
        exc_info=True,
    )
    return _build_error_response(
        status_code=500,
        code="INTERNAL_ERROR",
        message="An unexpected error occurred. Please try again later.",
    )
