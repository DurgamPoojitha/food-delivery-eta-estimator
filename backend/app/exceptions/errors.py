from http import HTTPStatus

class DeliverIQError(Exception):
    

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
    

    def __init__(self, message: str, field: str | None = None) -> None:
        super().__init__(
            message=message,
            status_code=HTTPStatus.UNPROCESSABLE_ENTITY,
            error_code="VALIDATION_ERROR",
        )
        self.field = field

class InvalidCoordinatesError(ValidationError):
    

    def __init__(self, message: str) -> None:
        super().__init__(message=message, field="coordinates")
        self.error_code = "INVALID_COORDINATES"

class ETACalculationError(DeliverIQError):
    

    def __init__(self, message: str) -> None:
        super().__init__(
            message=message,
            status_code=HTTPStatus.INTERNAL_SERVER_ERROR,
            error_code="ETA_CALCULATION_ERROR",
        )
