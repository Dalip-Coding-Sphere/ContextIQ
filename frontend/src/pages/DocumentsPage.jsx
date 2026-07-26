import { useEffect, useState } from "react";
import { deleteDocument, getDocuments } from "../api";
import DocumentCard from "../components/DocumentCard";

function DocumentsPage({ refreshKey }) {
  const [documents, setDocuments] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [deletingId, setDeletingId] = useState(null);
  const [errorMessage, setErrorMessage] = useState("");

  const loadDocuments = async () => {
    setIsLoading(true);
    setErrorMessage("");

    try {
      const data = await getDocuments();
      setDocuments(data.documents || []);
    } catch (error) {
      console.error(error);

      setErrorMessage(
        error.response?.data?.detail ||
          "Unable to retrieve documents."
      );
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadDocuments();
  }, [refreshKey]);

  const handleDelete = async (document) => {
    if (
      !window.confirm(
        `Delete "${document.filename}"?\n\nThis action cannot be undone.`
      )
    ) {
      return;
    }

    setDeletingId(document.document_id);

    try {
      await deleteDocument(document.document_id);

      setDocuments((current) =>
        current.filter(
          (item) =>
            item.document_id !== document.document_id
        )
      );
    } catch (error) {
      console.error(error);

      setErrorMessage(
        error.response?.data?.detail ||
          "Unable to delete document."
      );
    } finally {
      setDeletingId(null);
    }
  };

  const totalPages = documents.reduce(
    (sum, doc) => sum + doc.total_pages,
    0
  );

  const totalSections = documents.reduce(
    (sum, doc) => sum + doc.total_chunks,
    0
  );

  return (
    <section className="page-card">
      <div className="page-heading document-heading">
        <div>
          <p className="section-label">
            DOCUMENT LIBRARY
          </p>

          <h3>ContextIQ Documents</h3>

          <p>
            Manage every document available for AI
            search and question answering.
          </p>
        </div>

        <button
          className="secondary-button"
          onClick={loadDocuments}
          disabled={isLoading}
        >
          {isLoading ? "Loading..." : "Refresh"}
        </button>
      </div>

      {errorMessage && (
        <div className="page-error">
          {errorMessage}
        </div>
      )}

      {isLoading ? (
        <div className="document-loading">
          <div className="loading-spinner" />
          <p>Loading documents...</p>
        </div>
      ) : documents.length === 0 ? (
        <div className="empty-documents">
          <div className="empty-icon">📄</div>

          <h4>No documents uploaded</h4>

          <p>
            Upload your first PDF to start building
            your AI knowledge base.
          </p>
        </div>
      ) : (
        <>
          <div className="document-summary">
            <div>
              <span>Documents</span>
              <strong>{documents.length}</strong>
            </div>

            <div>
              <span>Pages</span>
              <strong>{totalPages}</strong>
            </div>

            <div>
              <span>Indexed Sections</span>
              <strong>{totalSections}</strong>
            </div>
          </div>

          <div className="document-list">
            {documents.map((document) => (
              <DocumentCard
                key={document.document_id}
                document={document}
                isDeleting={
                  deletingId ===
                  document.document_id
                }
                onDelete={handleDelete}
              />
            ))}
          </div>
        </>
      )}
    </section>
  );
}

export default DocumentsPage;