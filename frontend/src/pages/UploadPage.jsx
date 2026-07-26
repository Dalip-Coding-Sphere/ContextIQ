import { useRef, useState } from "react";
import {
  CheckCircle2,
  FileText,
  Upload,
  X,
} from "lucide-react";

import { uploadDocument } from "../api";

const MAX_FILE_SIZE = 25 * 1024 * 1024;

function UploadPage({ onUploadComplete }) {
  const fileInputRef = useRef(null);

  const [selectedFile, setSelectedFile] = useState(null);
  const [isDragging, setIsDragging] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [errorMessage, setErrorMessage] = useState("");
  const [uploadResult, setUploadResult] = useState(null);

  const resetUpload = () => {
    setSelectedFile(null);
    setUploadResult(null);
    setErrorMessage("");
    setUploadProgress(0);

    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const selectFile = (file) => {
    if (!file) return;

    const isPdf =
      file.type === "application/pdf" ||
      file.name.toLowerCase().endsWith(".pdf");

    if (!isPdf) {
      setErrorMessage("Only PDF files are supported.");
      setSelectedFile(null);
      return;
    }

    if (file.size > MAX_FILE_SIZE) {
      setErrorMessage(
        "The selected PDF must be smaller than 25 MB."
      );
      setSelectedFile(null);
      return;
    }

    setSelectedFile(file);
    setUploadResult(null);
    setErrorMessage("");
    setUploadProgress(0);
  };

  const handleDrop = (event) => {
    event.preventDefault();
    setIsDragging(false);
    selectFile(event.dataTransfer.files?.[0]);
  };

  const handleUpload = async () => {
    if (!selectedFile || isUploading) return;

    setIsUploading(true);
    setUploadResult(null);
    setErrorMessage("");
    setUploadProgress(0);

    try {
      const data = await uploadDocument(
        selectedFile,
        (progressEvent) => {
          if (!progressEvent.total) return;

          const progress = Math.round(
            (progressEvent.loaded * 100) /
              progressEvent.total
          );

          setUploadProgress(progress);
        }
      );

      setUploadResult(data);
      setUploadProgress(100);
      onUploadComplete?.();
    } catch (error) {
      console.error("Upload failed:", error);

      setErrorMessage(
        error.response?.data?.detail ||
          "Unable to upload the document."
      );
    } finally {
      setIsUploading(false);
    }
  };

  const fileSize = selectedFile
    ? (
        selectedFile.size /
        (1024 * 1024)
      ).toFixed(2)
    : null;

  return (
    <section className="page-card">
      <div className="page-heading">
        <p className="section-label">
          ADD DOCUMENT
        </p>

        <h3>Upload a PDF</h3>

        <p>
          Add a text-based PDF to your ContextIQ
          knowledge base.
        </p>
      </div>

      <div
        className={`upload-dropzone ${
          isDragging ? "dragging" : ""
        }`}
        role="button"
        tabIndex="0"
        onClick={() =>
          fileInputRef.current?.click()
        }
        onDragOver={(event) => {
          event.preventDefault();
          setIsDragging(true);
        }}
        onDragLeave={() => setIsDragging(false)}
        onDrop={handleDrop}
        onKeyDown={(event) => {
          if (
            event.key === "Enter" ||
            event.key === " "
          ) {
            fileInputRef.current?.click();
          }
        }}
      >
        <input
          ref={fileInputRef}
          type="file"
          accept=".pdf,application/pdf"
          hidden
          onChange={(event) =>
            selectFile(event.target.files?.[0])
          }
        />

        <div className="upload-icon">
          <Upload size={25} />
        </div>

        <h4>Drop your PDF here</h4>

        <p>
          or click to browse · Maximum size 25 MB
        </p>
      </div>

      {selectedFile && (
        <div className="selected-file-card">
          <div className="selected-file-icon">
            <FileText size={21} />
          </div>

          <div className="selected-file-info">
            <strong>{selectedFile.name}</strong>
            <span>{fileSize} MB</span>
          </div>

          <button
            type="button"
            className="remove-file-button"
            onClick={resetUpload}
            disabled={isUploading}
            aria-label="Remove selected file"
          >
            <X size={16} />
          </button>
        </div>
      )}

      {isUploading && (
        <div className="upload-progress-section">
          <div className="progress-header">
            <span>Processing document...</span>
            <strong>{uploadProgress}%</strong>
          </div>

          <div className="progress-track">
            <div
              className="progress-value"
              style={{
                width: `${uploadProgress}%`,
              }}
            />
          </div>

          <p>
            Preparing your document for search and
            question answering.
          </p>
        </div>
      )}

      {errorMessage && (
        <div className="page-error">
          {errorMessage}
        </div>
      )}

      {uploadResult && (
        <div className="upload-success">
          <div className="success-icon">
            <CheckCircle2 size={22} />
          </div>

          <div>
            <h4>Document is ready</h4>

            <p>
              {uploadResult.filename} was added
              successfully.
            </p>
          </div>

          <div className="upload-metrics">
            <div>
              <span>Pages</span>
              <strong>
                {uploadResult.total_pages}
              </strong>
            </div>

            <div>
              <span>Indexed sections</span>
              <strong>
                {uploadResult.stored_chunks}
              </strong>
            </div>
          </div>
        </div>
      )}

      <div className="upload-actions">
        <button
          type="button"
          className="secondary-button"
          onClick={resetUpload}
          disabled={isUploading || !selectedFile}
        >
          Clear
        </button>

        <button
          type="button"
          className="primary-button"
          onClick={handleUpload}
          disabled={!selectedFile || isUploading}
        >
          {isUploading
            ? "Processing..."
            : "Upload document"}
        </button>
      </div>
    </section>
  );
}

export default UploadPage;