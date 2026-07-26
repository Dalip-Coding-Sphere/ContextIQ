from pydantic import BaseModel, Field


class SearchRequest(BaseModel):
    """Request body for semantic document search."""

    question: str = Field(
        ...,
        min_length=2,
        max_length=500,
        description="Question to search in uploaded documents.",
    )

    top_k: int = Field(
        default=5,
        ge=1,
        le=10,
        description="Number of relevant chunks to retrieve.",
    )


class ChatRequest(BaseModel):
    """Request body for the complete RAG chat endpoint."""

    question: str = Field(
        ...,
        min_length=2,
        max_length=500,
        description="Question to answer from uploaded documents.",
    )

    top_k: int = Field(
        default=5,
        ge=1,
        le=10,
        description="Maximum number of chunks to retrieve.",
    )