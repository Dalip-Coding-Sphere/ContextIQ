from uuid import uuid4

from qdrant_client import QdrantClient, models

from app.config import (
    QDRANT_API_KEY,
    QDRANT_COLLECTION_NAME,
    QDRANT_URL,
    validate_qdrant_settings,
)


VECTOR_SIZE = 384
SCROLL_BATCH_SIZE = 100


validate_qdrant_settings()

qdrant_client = QdrantClient(
    url=QDRANT_URL,
    api_key=QDRANT_API_KEY,
    timeout=30,
)


def ensure_payload_indexes_exist() -> None:
    """
    Create payload indexes required for filtering documents.
    """

    collection_info = qdrant_client.get_collection(
        collection_name=QDRANT_COLLECTION_NAME,
    )

    payload_schema = collection_info.payload_schema or {}

    if "document_id" not in payload_schema:
        qdrant_client.create_payload_index(
            collection_name=QDRANT_COLLECTION_NAME,
            field_name="document_id",
            field_schema=models.PayloadSchemaType.UUID,
            wait=True,
        )


def ensure_collection_exists() -> None:
    """
    Create the Qdrant collection if it does not already exist
    and ensure required payload indexes are available.
    """

    collection_exists = qdrant_client.collection_exists(
        collection_name=QDRANT_COLLECTION_NAME,
    )

    if not collection_exists:
        qdrant_client.create_collection(
            collection_name=QDRANT_COLLECTION_NAME,
            vectors_config=models.VectorParams(
                size=VECTOR_SIZE,
                distance=models.Distance.COSINE,
            ),
        )

    ensure_payload_indexes_exist()


def store_document_chunks(
    embedded_chunks: list[dict],
    filename: str,
    document_id: str,
) -> int:
    """
    Store embedded document chunks and their metadata in Qdrant.

    Returns:
        Number of chunks stored.
    """

    if not embedded_chunks:
        return 0

    ensure_collection_exists()

    points: list[models.PointStruct] = []

    for chunk in embedded_chunks:
        points.append(
            models.PointStruct(
                id=str(uuid4()),
                vector=chunk["embedding"],
                payload={
                    "document_id": document_id,
                    "filename": filename,
                    "chunk_id": chunk["chunk_id"],
                    "page_number": chunk["page_number"],
                    "text": chunk["text"],
                    "character_count": chunk["character_count"],
                },
            )
        )

    qdrant_client.upsert(
        collection_name=QDRANT_COLLECTION_NAME,
        points=points,
        wait=True,
    )

    return len(points)


def search_similar_chunks(
    query_embedding: list[float],
    limit: int = 5,
) -> list[dict]:
    """
    Search Qdrant for chunks semantically similar
    to the user's question.
    """

    ensure_collection_exists()

    search_response = qdrant_client.query_points(
        collection_name=QDRANT_COLLECTION_NAME,
        query=query_embedding,
        limit=limit,
        with_payload=True,
        with_vectors=False,
    )

    results = []

    for point in search_response.points:
        payload = point.payload or {}

        results.append(
            {
                "score": round(float(point.score), 4),
                "document_id": payload.get("document_id"),
                "filename": payload.get("filename"),
                "page_number": payload.get("page_number"),
                "chunk_id": payload.get("chunk_id"),
                "text": payload.get("text", ""),
            }
        )

    return results


def list_documents() -> list[dict]:
    """
    Return all unique documents currently stored in Qdrant.

    Qdrant stores individual chunks, so this function groups
    chunks using their document_id.
    """

    collection_exists = qdrant_client.collection_exists(
        collection_name=QDRANT_COLLECTION_NAME,
    )

    if not collection_exists:
        return []

    ensure_payload_indexes_exist()

    documents: dict[str, dict] = {}
    next_offset = None

    while True:
        points, next_offset = qdrant_client.scroll(
            collection_name=QDRANT_COLLECTION_NAME,
            limit=SCROLL_BATCH_SIZE,
            offset=next_offset,
            with_payload=True,
            with_vectors=False,
        )

        for point in points:
            payload = point.payload or {}

            document_id = payload.get("document_id")
            filename = payload.get("filename")
            page_number = payload.get("page_number")

            if not document_id:
                continue

            if document_id not in documents:
                documents[document_id] = {
                    "document_id": document_id,
                    "filename": filename or "Unknown document",
                    "total_chunks": 0,
                    "pages": set(),
                }

            documents[document_id]["total_chunks"] += 1

            if page_number is not None:
                documents[document_id]["pages"].add(page_number)

        if next_offset is None:
            break

    result = []

    for document in documents.values():
        page_numbers = sorted(document["pages"])

        result.append(
            {
                "document_id": document["document_id"],
                "filename": document["filename"],
                "total_chunks": document["total_chunks"],
                "total_pages": len(page_numbers),
                "page_numbers": page_numbers,
            }
        )

    return sorted(
        result,
        key=lambda item: (
            item["filename"].lower(),
            item["document_id"],
        ),
    )


def delete_document(document_id: str) -> bool:
    """
    Delete all Qdrant points belonging to one uploaded document.

    Returns:
        True when matching chunks were found and deleted.
        False when the document_id was not found.
    """

    clean_document_id = document_id.strip()

    if not clean_document_id:
        return False

    collection_exists = qdrant_client.collection_exists(
        collection_name=QDRANT_COLLECTION_NAME,
    )

    if not collection_exists:
        return False

    ensure_payload_indexes_exist()

    document_filter = models.Filter(
        must=[
            models.FieldCondition(
                key="document_id",
                match=models.MatchValue(
                    value=clean_document_id,
                ),
            )
        ]
    )

    point_ids = []
    next_offset = None

    while True:
        points, next_offset = qdrant_client.scroll(
            collection_name=QDRANT_COLLECTION_NAME,
            scroll_filter=document_filter,
            limit=SCROLL_BATCH_SIZE,
            offset=next_offset,
            with_payload=False,
            with_vectors=False,
        )

        point_ids.extend(point.id for point in points)

        if next_offset is None:
            break

    if not point_ids:
        return False

    qdrant_client.delete(
        collection_name=QDRANT_COLLECTION_NAME,
        points_selector=models.PointIdsList(
            points=point_ids,
        ),
        wait=True,
    )

    return True