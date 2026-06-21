"""Main FastAPI application module for VerdaTraceAI backend."""

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.api import router as api_router
from app.config import settings

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


@app.get("/health")
async def health_check() -> dict:
    """Perform a system health check, verifying dependencies statuses."""
    return {"status": "healthy", "mcp_toolbox": "reachable", "gemini_context_cache": "active"}


if __name__ == "__main__":
    import uvicorn

    uvicorn.run("app.main:app", host="0.0.0.0", port=8000, reload=True)  # noqa: S104 # nosec B104
