import { useEffect, useRef } from "react";
import {
  FileText,
  MessageSquareText,
  Send,
  Trash2,
} from "lucide-react";

import { askDocumentQuestion } from "../api";
import ChatMessage from "../components/ChatMessage";

function ChatPage({
  question,
  setQuestion,
  messages,
  setMessages,
  isLoading,
  setIsLoading,
  errorMessage,
  setErrorMessage,
}) {
  const messagesEndRef = useRef(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({
      behavior: "smooth",
      block: "end",
    });
  }, [messages, isLoading]);

  const submitQuestion = async () => {
    const cleanQuestion = question.trim();

    if (!cleanQuestion || isLoading) {
      return;
    }

    setMessages((currentMessages) => [
      ...currentMessages,
      {
        id: crypto.randomUUID(),
        role: "user",
        content: cleanQuestion,
        sources: [],
      },
    ]);

    setQuestion("");
    setErrorMessage("");
    setIsLoading(true);

    try {
      const data = await askDocumentQuestion(
        cleanQuestion,
        5
      );

      setMessages((currentMessages) => [
        ...currentMessages,
        {
          id: crypto.randomUUID(),
          role: "assistant",
          content:
            data.answer ||
            "I could not generate an answer.",
          sources: data.sources || [],
        },
      ]);
    } catch (error) {
      console.error("Chat request failed:", error);

      setErrorMessage(
        error.response?.data?.detail ||
          "Unable to generate an answer. Please try again."
      );
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmit = (event) => {
    event.preventDefault();
    submitQuestion();
  };

  const handleKeyDown = (event) => {
    if (
      event.key === "Enter" &&
      !event.shiftKey
    ) {
      event.preventDefault();
      submitQuestion();
    }
  };

  const clearConversation = () => {
    if (
      messages.length === 0 ||
      !window.confirm(
        "Clear the current conversation?"
      )
    ) {
      return;
    }

    setMessages([]);
    setQuestion("");
    setErrorMessage("");
  };

  return (
    <section className="chat-container">
      <div className="chat-toolbar">
        <div className="chat-toolbar-title">
          <div className="chat-toolbar-icon">
            <MessageSquareText size={19} />
          </div>

          <div>
            <h3>Document chat</h3>
            <p>
              Ask questions from your uploaded PDF
              documents.
            </p>
          </div>
        </div>

        <button
          type="button"
          className="clear-chat-button"
          onClick={clearConversation}
          disabled={
            messages.length === 0 || isLoading
          }
        >
          <Trash2 size={15} />
          Clear chat
        </button>
      </div>

      <div className="messages-area">
        {messages.length === 0 ? (
          <div className="chat-empty-state">
            <div className="chat-empty-icon">
              <FileText size={29} />
            </div>

            <h3>Ask your first question</h3>

            <p>
              Enter a clear question whose answer is
              available in your uploaded PDF documents.
            </p>

            <div className="chat-guidance">
              <strong>For better results</strong>
              <span>
                Ask focused questions instead of broad
                requests.
              </span>
            </div>
          </div>
        ) : (
          messages.map((message) => (
            <ChatMessage
              key={message.id}
              message={message}
            />
          ))
        )}

        {isLoading && (
          <article className="message-row assistant">
            <div className="message-avatar">AI</div>

            <div className="message-content">
              <div className="message-header">
                ContextIQ
              </div>

              <div className="message-bubble loading-message">
                <span />
                <span />
                <span />
              </div>
            </div>
          </article>
        )}

        <div ref={messagesEndRef} />
      </div>

      {errorMessage && (
        <div className="chat-error">
          {errorMessage}
        </div>
      )}

      <form
        className="chat-input-wrapper"
        onSubmit={handleSubmit}
      >
        <textarea
          value={question}
          onChange={(event) =>
            setQuestion(event.target.value)
          }
          onKeyDown={handleKeyDown}
          placeholder="Ask a question from your PDFs..."
          rows="1"
          maxLength="500"
          disabled={isLoading}
        />

        <button
          type="submit"
          disabled={
            isLoading || !question.trim()
          }
        >
          <Send size={17} />
          {isLoading ? "Thinking..." : "Send"}
        </button>
      </form>

      <div className="chat-input-note">
        Enter to send · Shift + Enter for a new line
      </div>
    </section>
  );
}

export default ChatPage;