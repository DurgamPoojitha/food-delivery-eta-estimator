"""
exceptions/errors.py
====================
Purpose:
    Custom exception hierarchy for DeliverIQ.

Why custom exceptions?
    - Meaningful error types instead of generic ValueError/RuntimeError.
      "InvalidCoordinatesError" tells you exactly what went wrong.
    - HTTP status codes are attached to exceptions so the handler layer
      maps them to responses without hardcoding status codes in business logic.
    - All exceptions inherit from DeliverIQError so callers can catch the
      base type if they want to handle all app errors uniformly.
    - error_code (machine-readable string) + message (human-readable) lets
      clients display user messages while logging structured error codes.

Hierarchy:
    DeliverIQError               ← Base (500 by default)
    ├── ValidationError          ← 422 Unprocessable Entity
    │   └── InvalidCoordinatesError ← 422, specific to GPS coordinate issues
    └── ETACalculationError      ← 500 Internal Server Error

Error Response Shape (produced by handlers.py):
    {
        "error": {
            "code":    "INVALID_COORDINATES",   ← machine-readable
            "message": "Human-readable detail", ← user-facing
            "details": [...]                    ← optional field-level breakdown
        }
    }
"""

from http import HTTPStatus


class DeliverIQError(Exception):
    """
    Base exception for all DeliverIQ application errors.

    All custom exceptions should inherit from this class so that:
    1. The global exception handler catches them uniformly.
    2. Callers can catch all app errors with a single `except DeliverIQError`.

    Attributes:
        message:     Human-readable error description.
        status_code: HTTP status code to return to the client.
        error_code:  Machine-readable error identifier (snake_UPPER_CASE).
    """

    def __init__(
        self,
        message: str,
        status_code: int = HTTPStatus.INTERNAL_SERVER_ERROR,
        error_code: str = "INTERNAL_ERROR",
    ) -> None:
        super().__init__(message)
        self.message    = message
        self.status_code = status_code
        self.error_code  = error_code

    def __repr__(self) -> str:
        return (
            f"{self.__class__.__name__}("
            f"error_code={self.error_code!r}, "
            f"status_code={self.status_code}, "
            f"message={self.message!r})"
        )


class ValidationError(DeliverIQError):
    """
    Raised when business-level input validation fails.

    Note: This is distinct from Pydantic's RequestValidationError,
    which handles schema/type validation at the HTTP layer.
    This exception handles higher-level semantic validation in services.

    HTTP status: 422 Unprocessable Entity
    """

    def __init__(self, message: str, field: str | None = None) -> None:
        super().__init__(
            message=message,
            status_code=HTTPStatus.UNPROCESSABLE_ENTITY,
            error_code="VALIDATION_ERROR",
        )
        self.field = field  # Optional: which field caused the error


class InvalidCoordinatesError(ValidationError):
    """
    Raised when GPS coordinates are geographically invalid or nonsensical.

    Examples:
        - restaurant_lat and delivery_lat are identical (zero distance)
        - Coordinates resolve to an ocean with no roads

    HTTP status: 422 Unprocessable Entity
    Error code:  INVALID_COORDINATES
    """

    def __init__(self, message: str) -> None:
        super().__init__(message=message, field="coordinates")
        self.error_code = "INVALID_COORDINATES"


class ETACalculationError(DeliverIQError):
    """
    Raised when the ETA calculation pipeline fails unexpectedly.

    This should rarely occur since Pydantic validates inputs first.
    If it does occur, it indicates a programming error or edge case
    that the service layer did not anticipate.

    HTTP status: 500 Internal Server Error
    Error code:  ETA_CALCULATION_ERROR
    """

    def __init__(self, message: str) -> None:
        super().__init__(
            message=message,
            status_code=HTTPStatus.INTERNAL_SERVER_ERROR,
            error_code="ETA_CALCULATION_ERROR",
        )
