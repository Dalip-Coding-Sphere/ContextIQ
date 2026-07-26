import logging
import os
from contextlib import asynccontextmanager

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.routes.chat import router as chat_router
from app.routes.documents import router as documents_router


logging.basicConfig(
    level=logging.INFO,
    format="%(levelname)s: %(name)s - %(message)s",
)

logger = logging.getLogger(__name__)


@asynccontextmanager
async def lifespan(app: FastAPI):
    """Log application startup and shutdown events."""

    logger.info("ContextIQ backend started successfully.")

    yield

    logger.info("ContextIQ backend stopped.")


app = FastAPI(
    title="ContextIQ – AI-Powered Document Intelligence Platform",
    description=(
        "Backend API for the ContextIQ AI-powered document intelligence platform."
    ),
    version="1.0.0",
    lifespan=lifespan,
)


frontend_url = os.getenv("FRONTEND_URL")

allowed_origins = [
    "http://localhost:5173",
    "http://127.0.0.1:5173",
]

if frontend_url:
    allowed_origins.append(frontend_url.rstrip("/"))


app.add_middleware(
    CORSMiddleware,
    allow_origins=allowed_origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


app.include_router(documents_router)
app.include_router(chat_router)


@app.get("/")
def root() -> dict[str, str]:
    """Return a message confirming that the API is running."""

    return {
        "message": "ContextIQ API is running."
    }


@app.get("/health")
def health_check() -> dict[str, str]:
    """Return the basic backend health status."""

    return {
        "status": "healthy",
        "service": "ContextIQ API",
    }