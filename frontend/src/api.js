import axios from "axios";

const API_BASE_URL =
  import.meta.env.VITE_API_BASE_URL || "http://127.0.0.1:8000";

const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: 120000,
});

export const checkBackendHealth = async () => {
  const response = await api.get("/health");
  return response.data;
};

export const askDocumentQuestion = async (
  question,
  topK = 5
) => {
  const response = await api.post("/chat/ask", {
    question,
    top_k: topK,
  });

  return response.data;
};

export const getDocuments = async () => {
  const response = await api.get("/documents");
  return response.data;
};

export const uploadDocument = async (
  file,
  onUploadProgress
) => {
  const formData = new FormData();

  formData.append("file", file);

  const response = await api.post(
    "/documents/upload",
    formData,
    {
      headers: {
        "Content-Type": "multipart/form-data",
      },
      onUploadProgress,
    }
  );

  return response.data;
};

export const deleteDocument = async (
  documentId
) => {
  const response = await api.delete(
    `/documents/${documentId}`
  );

  return response.data;
};

export default api;