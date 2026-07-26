import {
  ArrowRight,
  FileText,
  MessageSquareText,
  Search,
  ShieldCheck,
  Upload,
} from "lucide-react";


function HomePage({
  onStartChat,
  onUploadDocument,
}) {
  return (
    <section className="home-page">
      <div className="home-hero">
        <div className="home-badge">
          <ShieldCheck size={15} />
          Grounded document intelligence
        </div>

        <h1>
          Turn your documents into
          searchable knowledge
        </h1>

        <p className="home-description">
          Upload PDF documents, ask questions in natural
          language, and receive answers grounded in relevant
          source content.
        </p>

        <div className="home-actions">
          <button
            type="button"
            className="home-primary-button"
            onClick={onStartChat}
          >
            <MessageSquareText size={18} />
            Start Chat
            <ArrowRight size={17} />
          </button>

          <button
            type="button"
            className="home-secondary-button"
            onClick={onUploadDocument}
          >
            <Upload size={18} />
            Upload Document
          </button>
        </div>

        <p className="home-support-text">
          Supports text-based PDF documents up to 25 MB.
        </p>
      </div>

      <div className="home-feature-grid">
        <article className="home-feature-card">
          <div className="home-feature-icon">
            <FileText size={22} />
          </div>
      
          <div>
            <h3>Upload documents</h3>
            <p>
              Add PDF documents to build your searchable
              knowledge base.
            </p>
          </div>
        </article>

        <article className="home-feature-card">
          <div className="home-feature-icon">
            <Search size={22} />
          </div>
      
          <div>
            <h3>Search by meaning</h3>
            <p>
              Find relevant content even when your question
              uses different wording.
            </p>
          </div>
        </article>

        <article className="home-feature-card">
          <div className="home-feature-icon">
            <MessageSquareText size={22} />
          </div>
      
          <div>
            <h3>Receive grounded answers</h3>
            <p>
              Generate answers supported by document and
              page references.
            </p>
          </div>
        </article>
      </div>
    </section>
  );
}

export default HomePage;