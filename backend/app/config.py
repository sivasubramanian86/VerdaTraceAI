import os

from dotenv import load_dotenv

# Load .env file from the backend directory
load_dotenv(os.path.join(os.path.dirname(__file__), "../.env"))


class Settings:
    """Application settings and feature flags."""

    PROJECT_NAME: str = "VerdaTraceAI"

    # Feature Flags
    USE_ALLOYDB: bool = os.getenv("USE_ALLOYDB", "False").lower() in ("true", "1", "t")

    # Database Config
    ALLOYDB_URI: str = os.getenv("ALLOYDB_URI", "")

    # Vertex AI Config
    GCP_PROJECT_ID: str = os.getenv("GCP_PROJECT_ID", "verdatraceai-500110")
    VERTEX_REGION: str = os.getenv("VERTEX_REGION", "us-central1")

    # Multi-LLM Config
    LLM_PROVIDER: str = os.getenv("LLM_PROVIDER", "vertex-ai")  # vertex-ai, openai, anthropic
    OPENAI_API_KEY: str = os.getenv("OPENAI_API_KEY", "")
    ANTHROPIC_API_KEY: str = os.getenv("ANTHROPIC_API_KEY", "")
    ALLOWED_ORIGINS: list[str] = [
        origin.strip()
        for origin in os.getenv(
            "ALLOWED_ORIGINS",
            (
                "http://localhost:5173,"
                "http://localhost:5174,"
                "http://127.0.0.1:5173,"
                "http://127.0.0.1:5174,"
                "https://verdatraceai.web.app,"
                "https://verdatraceai.firebaseapp.com"
            ),
        ).split(",")
        if origin.strip()
    ]


settings = Settings()
