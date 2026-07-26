from functools import lru_cache

from sentence_transformers import CrossEncoder


RERANKER_MODEL = "cross-encoder/ms-marco-MiniLM-L6-v2"


@lru_cache(maxsize=1)
def get_reranker() -> CrossEncoder:
    """
    Load the CrossEncoder only once.

    The model is downloaded on the first question
    and then reused for future requests.
    """

    return CrossEncoder(RERANKER_MODEL)


def rerank_chunks(
    question: str,
    chunks: list[dict],
    limit: int = 5,
) -> list[dict]:
    """
    Re-rank retrieved chunks based on their relevance
    to the user's question.
    """

    clean_question = question.strip()

    if not clean_question or not chunks:
        return []

    pairs = [
        (
            clean_question,
            chunk.get("text", "").strip(),
        )
        for chunk in chunks
    ]

    reranker = get_reranker()

    scores = reranker.predict(
        pairs,
        show_progress_bar=False,
    )

    reranked_chunks = []

    for chunk, score in zip(chunks, scores):
        reranked_chunk = chunk.copy()

        reranked_chunk["vector_score"] = chunk.get(
            "score",
            0.0,
        )

        reranked_chunk["rerank_score"] = round(
            float(score),
            4,
        )

        reranked_chunks.append(reranked_chunk)

    reranked_chunks.sort(
        key=lambda item: item["rerank_score"],
        reverse=True,
    )

    return reranked_chunks[:limit]