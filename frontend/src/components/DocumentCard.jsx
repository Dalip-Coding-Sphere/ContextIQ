import { FileText, Trash2 } from "lucide-react";

function DocumentCard({
  document,
  isDeleting,
  onDelete,
}) {
  const pageLabel =
    document.total_pages === 1 ? "page" : "pages";

  const sectionLabel =
    document.total_chunks === 1
      ? "indexed section"
      : "indexed sections";

  return (
    <article className="document-card">
      <div className="document-icon">
        <FileText size={22} />
      </div>

      <div className="document-details">
        <h4>{document.filename}</h4>

        <p>
          {document.total_pages} {pageLabel}
          {" · "}
          {document.total_chunks} {sectionLabel}
        </p>
      </div>

      <button
        type="button"
        className="delete-button"
        onClick={() => onDelete(document)}
        disabled={isDeleting}
      >
        <Trash2 size={15} />
        {isDeleting ? "Deleting..." : "Delete"}
      </button>
    </article>
  );
}

export default DocumentCard;