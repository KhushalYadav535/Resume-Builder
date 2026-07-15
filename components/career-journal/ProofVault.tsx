"use client";
import { useState, useRef } from "react";
import { Upload, FileText, CheckCircle, AlertCircle, X } from "lucide-react";

interface ProofVaultProps {
  onExtracted: (text: string) => void;
}

export default function ProofVault({ onExtracted }: ProofVaultProps) {
  const [isDragging, setIsDragging] = useState(false);
  const [file, setFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      processFile(e.dataTransfer.files[0]);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      processFile(e.target.files[0]);
    }
  };

  const processFile = (selectedFile: File) => {
    // Check file type (allow images and pdfs)
    if (!selectedFile.type.startsWith("image/") && selectedFile.type !== "application/pdf" && selectedFile.type !== "text/plain") {
      setError("Please upload an image, PDF, or text file.");
      return;
    }
    setError(null);
    setFile(selectedFile);
  };

  const extractData = async () => {
    if (!file) return;
    setLoading(true);
    setError(null);

    const formData = new FormData();
    formData.append("file", file);

    try {
      const response = await fetch("/api/journal/extract", {
        method: "POST",
        body: formData,
      });

      if (!response.ok) {
        throw new Error("Failed to extract data");
      }

      const data = await response.json();
      if (data.extractedText) {
        onExtracted(data.extractedText);
        setFile(null); // Clear after success
      } else {
        throw new Error("No text extracted");
      }
    } catch (err: any) {
      setError(err.message || "An error occurred during extraction.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ background: "var(--card)", border: "1px solid var(--border)", borderRadius: "16px", padding: "1.5rem", boxShadow: "0 4px 30px rgba(0,0,0,0.05)" }}>
      <div style={{ display: "flex", alignItems: "center", gap: "0.8rem", marginBottom: "1rem" }}>
        <div style={{ background: "rgba(16, 185, 129, 0.1)", padding: "0.6rem", borderRadius: "8px" }}>
          <Upload size={20} className="text-emerald-500" />
        </div>
        <div>
          <h3 style={{ margin: 0, fontSize: "1.1rem", fontWeight: 700, fontFamily: "Syne, sans-serif" }}>Proof Vault</h3>
          <p style={{ margin: "0.2rem 0 0", fontSize: "0.85rem", color: "var(--text-muted)" }}>Upload praise emails, screenshots, or certificates. AI will extract the achievements.</p>
        </div>
      </div>

      {!file ? (
        <div
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
          onClick={() => fileInputRef.current?.click()}
          style={{
            border: `2px dashed ${isDragging ? "var(--accent)" : "var(--border-light)"}`,
            borderRadius: "12px",
            padding: "2.5rem 1rem",
            textAlign: "center",
            background: isDragging ? "rgba(108, 99, 255, 0.05)" : "var(--bg-2)",
            cursor: "pointer",
            transition: "all 0.2s ease"
          }}
        >
          <input
            type="file"
            ref={fileInputRef}
            onChange={handleFileChange}
            accept="image/*,application/pdf,text/plain"
            style={{ display: "none" }}
          />
          <FileText size={32} style={{ margin: "0 auto 1rem", color: isDragging ? "var(--accent)" : "var(--text-muted)" }} />
          <p style={{ margin: 0, fontSize: "0.95rem", fontWeight: 600 }}>Drag & drop a file here</p>
          <p style={{ margin: "0.3rem 0 0", fontSize: "0.8rem", color: "var(--text-muted)" }}>or click to browse</p>
        </div>
      ) : (
        <div style={{ background: "var(--bg-2)", border: "1px solid var(--border)", borderRadius: "12px", padding: "1.2rem" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "1rem" }}>
            <div style={{ display: "flex", alignItems: "center", gap: "0.8rem" }}>
              <CheckCircle size={20} className="text-emerald-500" />
              <span style={{ fontSize: "0.9rem", fontWeight: 600, wordBreak: "break-all" }}>{file.name}</span>
            </div>
            <button onClick={() => setFile(null)} disabled={loading} style={{ background: "none", border: "none", cursor: "pointer", color: "var(--text-muted)" }}>
              <X size={18} />
            </button>
          </div>
          <button
            onClick={extractData}
            disabled={loading}
            className="btn-primary"
            style={{ width: "100%", padding: "0.8rem", background: "linear-gradient(135deg, #10b981 0%, #059669 100%)", border: "none" }}
          >
            {loading ? "Extracting with AI..." : "Extract Achievement"}
          </button>
        </div>
      )}

      {error && (
        <div style={{ marginTop: "1rem", padding: "0.8rem", background: "rgba(239, 68, 68, 0.1)", border: "1px solid rgba(239, 68, 68, 0.2)", borderRadius: "8px", display: "flex", gap: "0.5rem", alignItems: "center", color: "#ef4444", fontSize: "0.85rem" }}>
          <AlertCircle size={16} />
          <span>{error}</span>
        </div>
      )}
    </div>
  );
}
