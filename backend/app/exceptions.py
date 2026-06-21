"""Domain exception classes for the VerdaTraceAI backend."""


class VerdaTraceException(Exception):
    """Base exception class for all VerdaTraceAI domain errors."""

    def __init__(self, message: str, error_code: str, status_code: int = 400) -> None:
        super().__init__(message)
        self.message = message
        self.error_code = error_code
        self.status_code = status_code


class ValidationError(VerdaTraceException):
    """Raised when request payload or input validation fails."""

    def __init__(self, message: str, error_code: str = "VALIDATION_ERROR") -> None:
        super().__init__(message, error_code, status_code=422)


class ResourceNotFoundError(VerdaTraceException):
    """Raised when a requested resource is not found."""

    def __init__(self, message: str, error_code: str = "RESOURCE_NOT_FOUND") -> None:
        super().__init__(message, error_code, status_code=404)
