"use client";
import { useState, useRef } from "react";
import { Upload, FileText, CheckCircle, AlertCircle, X, Shield, Sparkles } from "lucide-react";

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
        setFile(null);
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
    <div
      style={{
        background: "var(--bg-elevated, #ffffff)",
        border: "1px solid var(--border)",
        borderRadius: "16px",
        padding: "1.2rem",
        boxShadow: "0 4px 16px rgba(16, 27, 59, 0.03)",
        position: "relative",
        overflow: "hidden",
        animation: "journal-fadeInUp 0.6s ease forwards",
        animationDelay: "0.1s",
      }}
    >
      {/* Top accent hairline */}
      <div style={{
        position: "absolute",
        top: 0,
        left: 0,
        right: 0,
        height: "3px",
        background: "linear-gradient(90deg, #2563EB, #60A5FA)",
        borderRadius: "16px 16px 0 0",
      }} />

      {/* Header */}
      <div style={{ display: "flex", alignItems: "center", gap: "0.55rem", marginBottom: "0.55rem" }}>
        <div style={{
          width: 32,
          height: 32,
          borderRadius: "9px",
          background: "rgba(37, 99, 235, 0.1)",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}>
          <Shield size={17} style={{ color: "var(--uprole-blue, #2563EB)" }} />
        </div>
        <div>
          <h3 style={{
            margin: 0,
            fontSize: "0.95rem",
            fontWeight: 800,
            fontFamily: "Space Grotesk, Syne, sans-serif",
            color: "var(--text-primary)",
          }}>
            Proof Vault
          </h3>
          <span style={{ fontSize: "0.68rem", color: "var(--text-muted)" }}>
            Verified Evidence Storage
          </span>
        </div>
      </div>

      <p style={{
        margin: "0 0 0.85rem",
        fontSize: "0.78rem",
        color: "var(--text-secondary)",
        lineHeight: 1.45,
      }}>
        Upload client emails, review snippets, or certificates. AI extracts the achievement into a ready event.
      </p>

      {!file ? (
        <div
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
          onClick={() => fileInputRef.current?.click()}
          style={{
            border: isDragging ? "1.5px dashed var(--uprole-blue, #2563EB)" : "1.5px dashed var(--border-strong)",
            borderRadius: "12px",
            padding: "1.1rem 0.8rem",
            textAlign: "center",
            cursor: "pointer",
            background: isDragging ? "rgba(37, 99, 235, 0.04)" : "var(--bg-2, #F1F4F9)",
            transition: "all 0.2s ease",
          }}
        >
          <input
            type="file"
            ref={fileInputRef}
            onChange={handleFileChange}
            accept="image/*,application/pdf,text/plain"
            style={{ display: "none" }}
          />
          <div style={{
            width: 36,
            height: 36,
            borderRadius: "10px",
            background: "var(--bg-elevated, #ffffff)",
            border: "1px solid var(--border)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            margin: "0 auto 0.45rem",
            boxShadow: "0 2px 6px rgba(0, 0, 0, 0.03)",
          }}>
            <Upload size={17} style={{ color: "var(--uprole-blue, #2563EB)" }} />
          </div>
          <p style={{ margin: 0, fontSize: "0.82rem", fontWeight: 700, color: "var(--text-primary)" }}>
            Drop proof or browse
          </p>
          <p style={{ margin: "0.15rem 0 0", fontSize: "0.7rem", color: "var(--text-muted)" }}>
            PDF, Image, or Text (praise & certs)
          </p>
        </div>
      ) : (
        <div style={{
          background: "var(--bg-2, #F1F4F9)",
          border: "1px solid var(--border)",
          borderRadius: "12px",
          padding: "0.85rem",
        }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "0.75rem" }}>
            <div style={{ display: "flex", alignItems: "center", gap: "0.5rem", overflow: "hidden" }}>
              <div style={{
                width: 28,
                height: 28,
                borderRadius: "7px",
                background: "rgba(16, 185, 129, 0.15)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                flexShrink: 0,
              }}>
                <CheckCircle size={15} style={{ color: "#10b981" }} />
              </div>
              <div style={{ minWidth: 0 }}>
                <span style={{ fontSize: "0.8rem", fontWeight: 700, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis", display: "block" }}>
                  {file.name}
                </span>
                <span style={{ fontSize: "0.66rem", color: "var(--text-muted)" }}>
                  {(file.size / 1024).toFixed(1)} KB
                </span>
              </div>
            </div>
            <button
              onClick={() => setFile(null)}
              disabled={loading}
              style={{
                background: "none",
                border: "1px solid var(--border)",
                borderRadius: "6px",
                width: 24,
                height: 24,
                cursor: "pointer",
                color: "var(--text-muted)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                flexShrink: 0,
              }}
              aria-label="Remove file"
            >
              <X size={12} />
            </button>
          </div>

          <button
            onClick={extractData}
            disabled={loading}
            style={{
              width: "100%",
              padding: "0.55rem",
              background: "linear-gradient(135deg, #2563EB 0%, #1D4ED8 100%)",
              color: "#FFFFFF",
              border: "1px solid rgba(255, 255, 255, 0.2)",
              borderRadius: "9px",
              fontSize: "0.8rem",
              fontWeight: 700,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              gap: "0.4rem",
              cursor: loading ? "not-allowed" : "pointer",
              boxShadow: "0 3px 10px rgba(37, 99, 235, 0.25)",
            }}
          >
            {loading ? (
              <span style={{ display: "flex", alignItems: "center", gap: "0.4rem" }}>
                <div className="spinner" style={{ width: 13, height: 13 }} />
                Extracting Evidence...
              </span>
            ) : (
              <>
                <Sparkles size={13} />
                Extract into Event
              </>
            )}
          </button>
        </div>
      )}

      {error && (
        <div style={{
          marginTop: "0.7rem",
          padding: "0.55rem 0.75rem",
          background: "rgba(239, 68, 68, 0.08)",
          border: "1px solid rgba(239, 68, 68, 0.18)",
          borderRadius: "9px",
          display: "flex",
          gap: "0.4rem",
          alignItems: "center",
          color: "#ef4444",
          fontSize: "0.75rem",
        }}>
          <AlertCircle size={14} style={{ flexShrink: 0 }} />
          <span>{error}</span>
        </div>
      )}
    </div>
  );
}
