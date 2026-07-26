import os

from dotenv import load_dotenv


load_dotenv()


QDRANT_URL = os.getenv("QDRANT_URL")
QDRANT_API_KEY = os.getenv("QDRANT_API_KEY")
QDRANT_COLLECTION_NAME = os.getenv(
    "QDRANT_COLLECTION_NAME",
    "knowledge_documents",
)

GROQ_API_KEY = os.getenv("GROQ_API_KEY")
GROQ_MODEL = os.getenv(
    "GROQ_MODEL",
    "llama-3.3-70b-versatile",
)


def validate_qdrant_settings() -> None:
    """Validate required Qdrant environment variables."""

    missing_settings = []

    if not QDRANT_URL:
        missing_settings.append("QDRANT_URL")

    if not QDRANT_API_KEY:
        missing_settings.append("QDRANT_API_KEY")

    if missing_settings:
        missing_names = ", ".join(missing_settings)
        raise RuntimeError(
            f"Missing Qdrant environment variables: {missing_names}"
        )


def validate_groq_settings() -> None:
    """Validate required Groq environment variables."""

    if not GROQ_API_KEY:
        raise RuntimeError(
            "Missing environment variable: GROQ_API_KEY"
        )