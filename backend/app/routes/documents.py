from uuid import uuid4

from fastapi import APIRouter, File, HTTPException, UploadFile

from app.services.document_service import (
    create_document_chunks,
    extract_text_from_pdf,
)
from app.services.embedding_service import generate_embeddings
from app.services.vector_service import (
    delete_document as delete_document_from_qdrant,
    list_documents,
    store_document_chunks,
)


router = APIRouter(
    prefix="/documents",
    tags=["Documents"],
)

MAX_FILE_SIZE = 25 * 1024 * 1024  # 25 MB


@router.post("/upload")
async def upload_document(
    file: UploadFile = File(...),
) -> dict:
    """
    Upload and process a text-based PDF,
    then store its vectors in Qdrant.
    """

    if file.content_type != "application/pdf":
        raise HTTPException(
            status_code=400,
            detail="Only PDF files are allowed.",
        )

    file_content = await file.read()

    if not file_content:
        raise HTTPException(
            status_code=400,
            detail="The uploaded file is empty.",
        )

    if len(file_content) > MAX_FILE_SIZE:
        raise HTTPException(
            status_code=400,
            detail="The PDF must be smaller than 25 MB.",
        )

    try:
        extracted_data = extract_text_from_pdf(file_content)

    except ValueError as exc:
        raise HTTPException(
            status_code=400,
            detail=str(exc),
        ) from exc

    if not extracted_data["text"]:
        raise HTTPException(
            status_code=400,
            detail=(
                "No selectable text was found in this PDF. "
                "Scanned PDFs are not supported yet."
            ),
        )

    chunks = create_document_chunks(
        extracted_data["pages"]
    )

    embedded_chunks = generate_embeddings(chunks)

    document_id = str(uuid4())

    try:
        stored_chunks = store_document_chunks(
            embedded_chunks=embedded_chunks,
            filename=file.filename or "unknown.pdf",
            document_id=document_id,
        )

    except Exception as exc:
        print(
            "Document storage error: "
            f"{type(exc).__name__}: {exc}"
        )

        raise HTTPException(
            status_code=500,
            detail="Failed to store document in Qdrant.",
        ) from exc

    return {
        "message": (
            "PDF processed and stored in Qdrant successfully."
        ),
        "document_id": document_id,
        "filename": file.filename,
        "total_pages": extracted_data["total_pages"],
        "total_characters": len(extracted_data["text"]),
        "total_chunks": len(chunks),
        "stored_chunks": stored_chunks,
        "embedding_model": (
            "sentence-transformers/all-MiniLM-L6-v2"
        ),
        "embedding_dimension": (
            embedded_chunks[0]["embedding_dimension"]
            if embedded_chunks
            else 0
        ),
    }


@router.get("")
def get_documents() -> dict:
    """
    Return all documents currently stored in Qdrant.
    """

    try:
        documents = list_documents()

    except Exception as exc:
        print(
            "Document listing error: "
            f"{type(exc).__name__}: {exc}"
        )

        raise HTTPException(
            status_code=500,
            detail="Failed to retrieve stored documents.",
        ) from exc

    return {
        "message": "Documents retrieved successfully.",
        "total_documents": len(documents),
        "documents": documents,
    }


@router.delete("/{document_id}")
def remove_document(document_id: str) -> dict:
    """
    Delete one document and all of its chunks from Qdrant.
    """

    try:
        deleted = delete_document_from_qdrant(
            document_id=document_id
        )

    except Exception as exc:
        print(
            "Document deletion error: "
            f"{type(exc).__name__}: {exc}"
        )

        raise HTTPException(
            status_code=500,
            detail=(
                "Failed to delete the document: "
                f"{type(exc).__name__}: {str(exc)}"
            ),
        ) from exc

    if not deleted:
        raise HTTPException(
            status_code=404,
            detail="Document not found.",
        )

    return {
        "message": "Document deleted successfully.",
        "document_id": document_id,
    }