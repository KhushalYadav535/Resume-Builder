"use client";
import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import Navbar from "@/components/Navbar";
import { useAuth } from "@/hooks/useAuth";
import { Card } from "@/components/ui/Card";
import { Copy, Check, Printer } from "lucide-react";
export default function CoverLetterPage() {
  const { user, loading: authLoading } = useAuth();
  const router = useRouter();
  const params = useParams();
  const resumeId = params.id as string;

  const [jobDescription, setJobDescription] = useState("");
  const [coverLetter, setCoverLetter] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    if (!authLoading && !user) {
      router.push("/login");
    }
  }, [authLoading, user, router]);

  const handleGenerate = async () => {
    if (!jobDescription.trim()) {
      setError("Please paste the target job description first.");
      return;
    }

    setLoading(true);
    setError("");
    try {
      const res = await fetch("/api/generate-cover-letter", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ resumeId, jobDescription }),
      });
      const data = await res.json();
      if (!res.ok || data.error) {
        throw new Error(data.error || "Failed to generate cover letter.");
      }
      setCoverLetter(data.letter);
    } catch (err: any) {
      console.error(err);
      setError(err.message || "Something went wrong.");
    } finally {
      setLoading(false);
    }
  };

  const handleCopy = () => {
    if (!coverLetter) return;
    navigator.clipboard.writeText(coverLetter);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handlePrint = () => {
    window.print();
  };

  if (authLoading || !user) {
    return (
      <div style={{ minHeight: "100vh", background: "var(--bg)", display: "flex", alignItems: "center", justifyContent: "center" }}>
        <div className="spinner" style={{ width: 40, height: 40 }} />
      </div>
    );
  }

  return (
    <div style={{ minHeight: "100vh", background: "var(--bg)" }}>
      <Navbar />
      
      {/* Print Styles */}
      <style dangerouslySetInnerHTML={{ __html: `
        @media print {
          body, html {
            background: #ffffff !important;
            color: #000000 !important;
            padding: 1.5cm !important;
          }
          .no-print {
            display: none !important;
          }
          .print-area {
            border: none !important;
            background: transparent !important;
            color: #000000 !important;
            padding: 0 !important;
            box-shadow: none !important;
            white-space: pre-wrap !important;
            font-family: 'Inter', sans-serif !important;
            font-size: 11pt !important;
            line-height: 1.6 !important;
          }
        }
      `}} />

      <div className="no-print" style={{ maxWidth: "800px", margin: "0 auto", padding: "2.5rem 1.5rem" }}>
        
        {/* Header Link */}
        <div style={{ marginBottom: "1.5rem" }}>
          <Link href={`/resume/${resumeId}`} style={{ textDecoration: "none", color: "var(--text-muted)", fontSize: "0.85rem" }}>
            ← Back to Resume Critique
          </Link>
        </div>

        <Card className="grid gap-6 p-6">
          <div>
            <span style={{ fontSize: "0.75rem", color: "var(--accent-2)", fontWeight: 700, textTransform: "uppercase" }}>AI Copilot</span>
            <h1 style={{ fontFamily: "Syne, sans-serif", fontSize: "1.8rem", fontWeight: 800, margin: "0.2rem 0 0" }}>Cover Letter Generator</h1>
            <p style={{ color: "var(--text-muted)", fontSize: "0.85rem", marginTop: "0.25rem" }}>
              Combines your experience accomplishments with target role requirements to build a personalized cover letter.
            </p>
          </div>

          <div>
            <label style={{ fontSize: "0.82rem", color: "var(--text-muted)", display: "block", marginBottom: "0.4rem" }}>Target Job Description</label>
            <textarea
              className="input"
              rows={5}
              placeholder="Paste target job listing, role description, or company overview..."
              value={jobDescription}
              onChange={(e) => setJobDescription(e.target.value)}
              style={{ background: "rgba(0,0,0,0.2)" }}
            />
          </div>

          {error && (
            <div style={{ color: "#ff6584", fontSize: "0.82rem", padding: "0.8rem 1rem", background: "rgba(255,101,132,0.08)", borderRadius: "8px", borderLeft: "4px solid #ff6584" }}>
              {error}
            </div>
          )}

          <button
            onClick={handleGenerate}
            disabled={loading}
            className="btn-primary"
            style={{ width: "100%", justifyContent: "center", padding: "0.75rem", fontSize: "0.95rem" }}
          >
            {loading ? "✦ Writing Letter with AI reasoning..." : "✦ Generate Tailored Cover Letter"}
          </button>

          {coverLetter && (
            <div style={{ display: "grid", gap: "1rem", borderTop: "1px solid var(--border)", paddingTop: "1.5rem", marginTop: "0.5rem" }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <span style={{ fontSize: "0.85rem", fontWeight: 700, textTransform: "uppercase", color: "var(--text-muted)" }}>Generated Letter</span>
                <div style={{ display: "flex", gap: "0.5rem" }}>
                  <button onClick={handleCopy} className="btn-secondary" style={{ padding: "0.4rem 0.8rem", fontSize: "0.8rem", display: "inline-flex", alignItems: "center", gap: "0.4rem" }}>
                    {copied ? (
                      <>
                        <Check size={13} className="text-emerald-500" />
                        Copied!
                      </>
                    ) : (
                      <>
                        <Copy size={13} />
                        Copy
                      </>
                    )}
                  </button>
                  <button onClick={handlePrint} className="btn-secondary" style={{ padding: "0.4rem 0.8rem", fontSize: "0.8rem", display: "inline-flex", alignItems: "center", gap: "0.4rem" }}>
                    <Printer size={13} />
                    Print / PDF
                  </button>
                </div>
              </div>

              <div 
                className="print-area"
                style={{ 
                  background: "var(--bg-2)", 
                  border: "1px solid var(--border)", 
                  borderRadius: "10px", 
                  padding: "1.8rem", 
                  color: "var(--text)", 
                  fontSize: "0.92rem", 
                  lineHeight: 1.6, 
                  whiteSpace: "pre-wrap", 
                  fontFamily: "Inter, sans-serif" 
                }}
              >
                {coverLetter}
              </div>
            </div>
          )}
        </Card>
      </div>

      {/* Print-only container */}
      <div className="print-only print-area">
        {coverLetter}
      </div>
    </div>
  );
}
