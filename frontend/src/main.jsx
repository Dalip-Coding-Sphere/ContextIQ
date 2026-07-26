import { StrictMode } from "react";
import { createRoot } from "react-dom/client";

import App from "./App.jsx";
import "./styles/base.css";
import "./styles/layout.css";
import "./styles/sidebar.css";
import "./styles/chat.css";
import "./styles/documents.css";
import "./styles/upload.css";
import "./styles/home.css";
import "./styles/responsive.css";

createRoot(document.getElementById("root")).render(
  <StrictMode>
    <App />
  </StrictMode>
);