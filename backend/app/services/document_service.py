from io import BytesIO

import fitz
from langchain_text_splitters import RecursiveCharacterTextSplitter


CHUNK_SIZE = 1000
CHUNK_OVERLAP = 200


def extract_text_from_pdf(file_content: bytes) -> dict:
    """
    Extract text from a PDF file page by page.

    Args:
        file_content: PDF file content in bytes.

    Returns:
        A dictionary containing the total pages,
        complete text and page-wise text.
    """

    try:
        pdf_document = fitz.open(
            stream=BytesIO(file_content),
            filetype="pdf",
        )
    except Exception as exc:
        raise ValueError("Unable to open the PDF file.") from exc

    pages = []
    complete_text = []

    for page_number, page in enumerate(pdf_document, start=1):
        page_text = page.get_text("text", sort=True).strip()
        page_text = " ".join(page_text.split())

        pages.append(
            {
                "page_number": page_number,
                "text": page_text,
            }
        )

        if page_text:
            complete_text.append(page_text)

    total_pages = len(pdf_document)
    pdf_document.close()

    return {
        "total_pages": total_pages,
        "text": "\n\n".join(complete_text),
        "pages": pages,
    }


def create_document_chunks(pages: list[dict]) -> list[dict]:
    """
    Split page-wise PDF text into smaller overlapping chunks.

    Each chunk keeps its original page number so the application
    can later display source citations.
    """

    text_splitter = RecursiveCharacterTextSplitter(
        chunk_size=CHUNK_SIZE,
        chunk_overlap=CHUNK_OVERLAP,
        separators=["\n\n", "\n", ". ", " ", ""],
    )

    chunks = []
    chunk_id = 1

    for page in pages:
        page_number = page["page_number"]
        page_text = page["text"]

        if not page_text:
            continue

        page_chunks = text_splitter.split_text(page_text)

        for chunk_text in page_chunks:
            chunks.append(
                {
                    "chunk_id": chunk_id,
                    "page_number": page_number,
                    "text": chunk_text,
                    "character_count": len(chunk_text),
                }
            )

            chunk_id += 1

    return chunks