import { FileText } from "lucide-react";

function ChatMessage({ message }) {
  const isUser = message.role === "user";

  return (
    <article className={`message-row ${message.role}`}>
      <div className="message-avatar">
        {isUser ? "You" : "AI"}
      </div>

      <div className="message-content">
        <div className="message-header">
          {isUser ? "You" : "ContextIQ"}
        </div>

        <div className="message-bubble">
          {message.content}
        </div>

        {!isUser && message.sources?.length > 0 && (
          <div className="source-section">
            <p className="source-title">Sources</p>

            <div className="source-list">
              {message.sources.map((source, index) => (
                <div
                  className="source-card"
                  key={`${source.document_id}-${source.page_number}-${index}`}
                >
                  <span className="source-icon">
                    <FileText size={16} />
                  </span>

                  <div>
                    <strong>
                      {source.filename || "Document"}
                    </strong>

                    <p>
                      Page {source.page_number ?? "Unknown"}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </article>
  );
}

export default ChatMessage;