"use client";
import React, { useState } from "react";
import { Search, CheckCircle } from "lucide-react";
import { useToast } from "@/components/ui/toast-1";

export default function RecruiterVisibility() {
  const [headline, setHeadline] = useState("");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<{ score: number; feedback: string[]; suggestedKeywords: string[] } | null>(null);
  const { showToast } = useToast();

  const handleAudit = async () => {
    if (!headline) {
      showToast("Please paste your LinkedIn headline", "warning");
      return;
    }
    setLoading(true);
    try {
      const res = await fetch("/api/copilot/market-insight", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ type: "visibility", headline })
      });
      if (res.ok) {
        const data = await res.json();
        setResult(data);
      } else {
        showToast("Failed to run audit", "error");
      }
    } catch (err) {
      console.error(err);
      showToast("An error occurred", "error");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="card" style={{ padding: "1.5rem", display: "grid", gap: "1.2rem" }}>
      <h3 style={{ margin: "0 0 0.5rem", fontSize: "1.1rem", fontWeight: 700, display: "flex", alignItems: "center", gap: "0.5rem" }}>
        <Search size={18} className="text-blue-500" />
        Recruiter Visibility Audit
      </h3>
      <p style={{ margin: 0, fontSize: "0.85rem", color: "var(--text-muted)", lineHeight: 1.5 }}>
        Paste your LinkedIn headline to see how discoverable you are to recruiters based on current ATS/search algorithms.
      </p>

      <div style={{ display: "flex", gap: "1rem" }}>
        <input 
          className="input" 
          placeholder="e.g. Software Engineer | Passionate about UI" 
          value={headline} 
          onChange={e => setHeadline(e.target.value)} 
          style={{ flex: 1, padding: "0.6rem 1rem", borderRadius: "8px", border: "1px solid var(--border)", background: "var(--bg-elevated)" }} 
        />
        <button onClick={handleAudit} disabled={loading} className="btn-secondary">
          {loading ? "Auditing..." : "Audit Headline"}
        </button>
      </div>

      {result && (
        <div style={{ background: "rgba(59, 130, 246, 0.05)", border: "1px solid rgba(59, 130, 246, 0.2)", borderRadius: "10px", padding: "1.2rem", marginTop: "0.5rem" }}>
          <div style={{ display: "flex", alignItems: "center", gap: "1rem", marginBottom: "1rem" }}>
            <div style={{ width: "50px", height: "50px", borderRadius: "50%", background: result.score > 70 ? "#43e97b" : "#f6d365", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "1.2rem", fontWeight: 800, color: "#fff" }}>
              {result.score}
            </div>
            <div>
              <strong style={{ fontSize: "1rem" }}>Visibility Score</strong>
              <p style={{ margin: 0, fontSize: "0.8rem", color: "var(--text-muted)" }}>{result.score > 70 ? "Highly Discoverable" : "Needs Optimization"}</p>
            </div>
          </div>
          
          <div style={{ display: "grid", gap: "1rem", fontSize: "0.85rem", color: "var(--text)", lineHeight: 1.6 }}>
            <div>
              <strong style={{ color: "var(--text)" }}>Feedback:</strong>
              <ul style={{ margin: "0.5rem 0 0 1.2rem", padding: 0 }}>
                {result.feedback.map((f, i) => <li key={i}>{f}</li>)}
              </ul>
            </div>
            <div>
              <strong style={{ color: "var(--text)" }}>Suggested Keywords to Add:</strong>
              <div style={{ display: "flex", flexWrap: "wrap", gap: "0.4rem", marginTop: "0.5rem" }}>
                {result.suggestedKeywords.map((k, i) => (
                  <span key={i} className="tag tag-blue" style={{ fontSize: "0.75rem", display: "inline-flex", alignItems: "center", gap: "0.2rem" }}>
                    <CheckCircle size={10} /> {k}
                  </span>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
