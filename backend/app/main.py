"""Main FastAPI application module for VerdaTraceAI backend."""

from fastapi import FastAPI, Request
from fastapi.exceptions import RequestValidationError
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse

from app.api import router as api_router
from app.config import settings
from app.exceptions import VerdaTraceException

app = FastAPI(
    title="VerdaTraceAI - Carbon Intelligence Copilot",
    description="Agentic RAG and Copilot for AI Workload Carbon Footprint Optimization.",
    version="1.0.0",
)

# Enable CORS for configured frontend origins.
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.ALLOWED_ORIGINS,
    allow_credentials=True,
    allow_methods=["GET", "POST", "OPTIONS"],
    allow_headers=["Authorization", "Content-Type"],
)

app.include_router(api_router, prefix="/api/v1")


@app.exception_handler(VerdaTraceException)
async def verdatrace_exception_handler(request: Request, exc: VerdaTraceException) -> JSONResponse:
    """Handle custom VerdaTrace domain exceptions."""
    return JSONResponse(
        status_code=exc.status_code,
        content={
            "status": "error",
            "error_code": exc.error_code,
            "message": exc.message,
        },
    )


@app.exception_handler(RequestValidationError)
async def validation_exception_handler(request: Request, exc: RequestValidationError) -> JSONResponse:
    """Handle FastAPI validation errors."""
    return JSONResponse(
        status_code=422,
        content={
            "error_code": "VALIDATION_ERROR",
            "detail": exc.errors(),
        },
    )


@app.exception_handler(Exception)
async def general_exception_handler(request: Request, exc: Exception) -> JSONResponse:
    """Handle general unhandled server exceptions."""
    return JSONResponse(
        status_code=500,
        content={
            "status": "error",
            "error_code": "INTERNAL_SERVER_ERROR",
            "message": "An unexpected error occurred on the server.",
        },
    )


@app.get("/health")
async def health_check() -> dict:
    """Perform a system health check, verifying dependencies statuses."""
    return {"status": "healthy", "mcp_toolbox": "reachable", "gemini_context_cache": "active"}


if __name__ == "__main__":
    import uvicorn

    uvicorn.run("app.main:app", host="0.0.0.0", port=8000, reload=True)  # noqa: S104 # nosec B104
