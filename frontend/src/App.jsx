import { useState } from "react";
import {
  FileText,
  Home,
  MessageSquareText,
  Upload,
} from "lucide-react";

import Logo from "./components/Logo";
import ChatPage from "./pages/ChatPage";
import DocumentsPage from "./pages/DocumentsPage";
import HomePage from "./pages/HomePage";
import UploadPage from "./pages/UploadPage";

const PAGE_CONFIG = {
  home: {
    eyebrow: "CONTEXTIQ",
    title: "Your intelligent document workspace",
  },
  chat: {
    eyebrow: "DOCUMENT CHAT",
    title: "Chat with your knowledge base",
  },
  documents: {
    eyebrow: "KNOWLEDGE BASE",
    title: "Your documents",
  },
  upload: {
    eyebrow: "ADD CONTENT",
    title: "Upload a new document",
  },
};

const NAV_ITEMS = [
  {
    id: "home",
    label: "Home",
    icon: Home,
  },
  {
    id: "chat",
    label: "Chat",
    icon: MessageSquareText,
  },
  {
    id: "documents",
    label: "Documents",
    icon: FileText,
  },
  {
    id: "upload",
    label: "Upload",
    icon: Upload,
  },
];

function App() {
  const [activePage, setActivePage] =
    useState("home");

  const [
    documentRefreshKey,
    setDocumentRefreshKey,
  ] = useState(0);

  const [question, setQuestion] = useState("");
  const [messages, setMessages] = useState([]);

  const [isChatLoading, setIsChatLoading] =
    useState(false);

  const [chatError, setChatError] = useState("");

  const handleUploadComplete = () => {
    setDocumentRefreshKey(
      (currentKey) => currentKey + 1
    );
  };

  const pageDetails = PAGE_CONFIG[activePage];

  return (
    <div className="app-shell">
      <aside className="sidebar">
        <div className="brand">
          <Logo />
        </div>

        <nav
          className="navigation"
          aria-label="Main navigation"
        >
          {NAV_ITEMS.map((item) => {
            const Icon = item.icon;
            const isActive =
              activePage === item.id;

            return (
              <button
                key={item.id}
                type="button"
                className={`nav-item ${
                  isActive ? "active" : ""
                }`}
                onClick={() =>
                  setActivePage(item.id)
                }
                aria-current={
                  isActive ? "page" : undefined
                }
              >
                <Icon size={18} />
                {item.label}
              </button>
            );
          })}
        </nav>

        <div className="sidebar-footer">
          <p>AI document workspace</p>
          <span>Search. Ask. Understand.</span>
        </div>
      </aside>

      <main className="main-content">
        <header className="topbar">
          <div>
            <p className="eyebrow">
              {pageDetails.eyebrow}
            </p>

            <h2>{pageDetails.title}</h2>
          </div>
        </header>

        {activePage === "home" && (
          <HomePage
            onStartChat={() =>
              setActivePage("chat")
            }
            onUploadDocument={() =>
              setActivePage("upload")
            }
          />
        )}

        {activePage === "chat" && (
          <ChatPage
            question={question}
            setQuestion={setQuestion}
            messages={messages}
            setMessages={setMessages}
            isLoading={isChatLoading}
            setIsLoading={setIsChatLoading}
            errorMessage={chatError}
            setErrorMessage={setChatError}
          />
        )}

        {activePage === "documents" && (
          <DocumentsPage
            refreshKey={documentRefreshKey}
          />
        )}

        {activePage === "upload" && (
          <UploadPage
            onUploadComplete={
              handleUploadComplete
            }
          />
        )}
      </main>
    </div>
  );
}

export default App;