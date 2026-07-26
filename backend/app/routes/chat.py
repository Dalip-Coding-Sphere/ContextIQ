import logging

from fastapi import APIRouter, HTTPException

from app.schemas import ChatRequest, SearchRequest
from app.services.embedding_service import generate_query_embedding
from app.services.rag_service import answer_question
from app.services.vector_service import search_similar_chunks


logger = logging.getLogger(__name__)


router = APIRouter(
    prefix="/chat",
    tags=["Chat"],
)


@router.post("/search")
def search_documents(request: SearchRequest) -> dict:
    """
    Retrieve semantically similar document chunks.
    """

    try:
        query_embedding = generate_query_embedding(
            request.question
        )

        results = search_similar_chunks(
            query_embedding=query_embedding,
            limit=request.top_k,
        )

    except ValueError as exc:
        raise HTTPException(
            status_code=400,
            detail=str(exc),
        ) from exc

    except Exception as exc:
        logger.exception(
            "Document search failed for question: %s",
            request.question,
        )

        raise HTTPException(
            status_code=500,
            detail="Unable to search the documents right now. Please try again.",
        ) from exc

    if not results:
        return {
            "message": "No relevant document content was found.",
            "question": request.question,
            "results": [],
        }

    return {
        "message": "Relevant document chunks retrieved successfully.",
        "question": request.question,
        "total_results": len(results),
        "results": results,
    }


@router.post("/ask")
def ask_question(request: ChatRequest) -> dict:
    """
    Answer a question using the complete RAG pipeline.
    """

    try:
        result = answer_question(
            question=request.question,
            top_k=request.top_k,
        )

    except ValueError as exc:
        raise HTTPException(
            status_code=400,
            detail=str(exc),
        ) from exc

    except Exception as exc:
        logger.exception(
            "Answer generation failed for question: %s",
            request.question,
        )

        raise HTTPException(
            status_code=500,
            detail="Unable to generate an answer right now. Please try again.",
        ) from exc

    return {
        "message": "Question processed successfully.",
        "question": request.question,
        "answer": result["answer"],
        "sources": result["sources"],
        "retrieved_chunks": result["retrieved_chunks"],
    }