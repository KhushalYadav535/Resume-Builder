"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import ResumeDocument from "@/components/ResumeDocument";

interface SharedResume {
  file_name: string;
  resume_data: any;
  template_id: string;
}

export default function SharedResumePage() {
  const params = useParams();
  const token = params.token as string;

  const [resume, setResume] = useState<SharedResume | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [zoomFactor, setZoomFactor] = useState(0.95);

  useEffect(() => {
    if (!token) return;

    const fetchSharedResume = async () => {
      try {
        setLoading(true);
        const res = await fetch(`/api/share/retrieve?token=${token}`);
        const data = await res.json();
        
        if (!res.ok || data.error) {
          throw new Error(data.error || "Failed to load shared resume.");
        }

        setResume(data);
      } catch (err: any) {
        console.error(err);
        setError(err.message || "Unable to view this resume. The link might be invalid or expired.");
      } finally {
        setLoading(false);
      }
    };

    fetchSharedResume();
  }, [token]);

  const handlePrint = () => {
    window.print();
  };

  if (loading) {
    return (
      <div style={{ minHeight: "100vh", background: "var(--bg)", display: "flex", alignItems: "center", justifyContent: "center", flexDirection: "column", gap: "1rem" }}>
        <div className="spinner" style={{ width: 40, height: 40 }} />
        <p style={{ color: "var(--text-muted)", fontSize: "0.88rem" }}>Loading shared resume...</p>
      </div>
    );
  }

  if (error || !resume) {
    return (
      <div style={{ minHeight: "100vh", background: "var(--bg)", display: "flex", alignItems: "center", justifyContent: "center", padding: "2rem" }}>
        <div className="card" style={{ maxWidth: "460px", padding: "2.5rem", textAlign: "center", display: "grid", gap: "1rem" }}>
          <div style={{ fontSize: "3rem" }}>⚠️</div>
          <h2 style={{ fontFamily: "Syne, sans-serif", fontSize: "1.4rem", fontWeight: 800 }}>Shared Resume Unavailable</h2>
          <p style={{ color: "var(--text-muted)", fontSize: "0.88rem", lineHeight: 1.5 }}>
            {error || "This resume link is invalid, private, or has been deleted by its owner."}
          </p>
          <div style={{ display: "flex", gap: "0.8rem", justifyContent: "center", marginTop: "1rem" }}>
            <Link href="/" style={{ textDecoration: "none" }}>
              <button className="btn-primary" style={{ padding: "0.6rem 1.2rem" }}>Go to Homepage</button>
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div style={{ minHeight: "100vh", background: "var(--bg)", display: "flex", flexDirection: "column" }}>
      
      {/* FLOATING ACTION TOOLBAR (Hidden on print) */}
      <div className="no-print" style={{ 
        background: "rgba(10,10,15,0.85)", 
        backdropFilter: "blur(12px)", 
        borderBottom: "1px solid var(--border)", 
        padding: "0.8rem 1.5rem", 
        position: "sticky",
        top: 0,
        zIndex: 100
      }}>
        <div style={{ maxWidth: "1000px", margin: "0 auto", display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: "0.8rem" }}>
          <div>
            <h1 style={{ fontFamily: "Syne, sans-serif", fontSize: "1.1rem", fontWeight: 800, margin: 0, display: "flex", alignItems: "center", gap: "0.4rem" }}>
              ✦ Shared Resume
            </h1>
            <span style={{ fontSize: "0.72rem", color: "var(--text-muted)" }}>
              Viewing: {resume.file_name}
            </span>
          </div>

          <div style={{ display: "flex", alignItems: "center", gap: "0.8rem" }}>
            {/* Zoom controls */}
            <div style={{ display: "flex", alignItems: "center", gap: "0.4rem", marginRight: "0.5rem" }}>
              <button onClick={() => setZoomFactor(prev => Math.max(0.6, prev - 0.05))} className="btn-secondary" style={{ padding: "0.2rem 0.5rem", fontSize: "0.75rem" }}>-</button>
              <span style={{ fontSize: "0.74rem", color: "var(--text-muted)", minWidth: "32px", textAlign: "center" }}>{Math.round(zoomFactor * 100)}%</span>
              <button onClick={() => setZoomFactor(prev => Math.min(1.2, prev + 0.05))} className="btn-secondary" style={{ padding: "0.2rem 0.5rem", fontSize: "0.75rem" }}>+</button>
            </div>

            <button onClick={handlePrint} className="btn-primary" style={{ fontSize: "0.8rem", padding: "0.5rem 1rem" }}>
              📥 Download PDF / Print
            </button>
            
            <Link href="/signup" style={{ textDecoration: "none" }}>
              <button className="btn-secondary" style={{ fontSize: "0.8rem", padding: "0.5rem 1rem", borderColor: "var(--accent)", color: "var(--accent)" }}>
                Build Your Own ✦
              </button>
            </Link>
          </div>
        </div>
      </div>

      {/* STICKY LIVE DOCUMENT RENDERER */}
      <div style={{ 
        flex: 1, 
        overflowY: "auto", 
        background: "var(--bg-3)", 
        display: "flex", 
        justifyContent: "center", 
        alignItems: "start",
        padding: "3rem 1.5rem"
      }} className="no-print">
        
        <div className="resume-paper" style={{ 
          transform: `scale(${zoomFactor})`, 
          transformOrigin: "top center",
          background: "#ffffff", 
          color: "#333333", 
          padding: resume.template_id === "creative" ? "0" : "2.4rem 2rem", 
          width: "100%",
          maxWidth: "600px",
          boxShadow: "0 10px 30px rgba(0,0,0,0.5)",
          borderRadius: "4px",
          transition: "transform 0.15s ease-out",
        }}>
          <ResumeDocument data={resume.resume_data} templateId={resume.template_id} />
        </div>
      </div>

      {/* PRINT-ONLY RESUME CONTAINER */}
      <div className="print-only">
        <div className="resume-paper" style={{ background: "#ffffff", color: "#333333", padding: resume.template_id === "creative" ? "0" : "2.4rem 2rem", width: "100%" }}>
          <ResumeDocument data={resume.resume_data} templateId={resume.template_id} />
        </div>
      </div>

    </div>
  );
}
