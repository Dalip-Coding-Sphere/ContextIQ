from sentence_transformers import SentenceTransformer


MODEL_NAME = "sentence-transformers/all-MiniLM-L6-v2"

embedding_model = SentenceTransformer(MODEL_NAME)


def generate_embeddings(chunks: list[dict]) -> list[dict]:
    """
    Generate embeddings for document chunks.
    """

    if not chunks:
        return []

    chunk_texts = [chunk["text"] for chunk in chunks]

    embeddings = embedding_model.encode(
        chunk_texts,
        convert_to_numpy=True,
        normalize_embeddings=True,
        show_progress_bar=False,
    )

    embedded_chunks = []

    for chunk, embedding in zip(chunks, embeddings):
        embedded_chunks.append(
            {
                **chunk,
                "embedding": embedding.tolist(),
                "embedding_dimension": len(embedding),
            }
        )

    return embedded_chunks


def generate_query_embedding(question: str) -> list[float]:
    """
    Convert a user question into an embedding vector.
    """

    if not question.strip():
        raise ValueError("Question cannot be empty.")

    embedding = embedding_model.encode(
        question,
        convert_to_numpy=True,
        normalize_embeddings=True,
        show_progress_bar=False,
    )

    return embedding.tolist()