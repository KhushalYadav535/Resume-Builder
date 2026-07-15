"use client";
import React, { useState } from "react";
import { ArrowUpCircle, ListChecks } from "lucide-react";
import { useToast } from "@/components/ui/toast-1";
import ToneCalibrator from "@/components/career-copilot/ToneCalibrator";

export default function PromotionCaseBuilder() {
  const [targetRole, setTargetRole] = useState("");
  const [toneValue, setToneValue] = useState(50);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<string>("");
  const { showToast } = useToast();

  const handleGenerate = async () => {
    if (!targetRole) {
      showToast("Please enter the target promotion role", "warning");
      return;
    }
    setLoading(true);
    try {
      const res = await fetch("/api/copilot/growth", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ type: "promotion", targetRole, tone: toneValue })
      });
      if (res.ok) {
        const data = await res.json();
        setResult(data.script);
      } else {
        showToast("Failed to generate case", "error");
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
        <ArrowUpCircle size={18} className="text-purple-500" />
        Promotion Case Builder
      </h3>
      <p style={{ margin: 0, fontSize: "0.85rem", color: "var(--text-muted)", lineHeight: 1.5 }}>
        AI will draft an internal promotion request or 1:1 talking points using your recorded Career Journal wins and resume data as evidence.
      </p>

      <div style={{ display: "grid", gap: "1rem" }}>
        <input 
          className="input" 
          placeholder="Target Role (e.g. Senior Product Manager)" 
          value={targetRole} 
          onChange={e => setTargetRole(e.target.value)} 
          style={{ width: "100%", padding: "0.6rem 1rem", borderRadius: "8px", border: "1px solid var(--border)", background: "var(--bg-elevated)" }} 
        />
        <ToneCalibrator value={toneValue} onChange={setToneValue} />
        <button onClick={handleGenerate} disabled={loading} className="btn-primary" style={{ width: "fit-content" }}>
          {loading ? "Drafting Case..." : "Draft Promotion Request"}
        </button>
      </div>

      {result && (
        <div style={{ background: "rgba(108, 99, 255, 0.05)", border: "1px solid rgba(108, 99, 255, 0.2)", borderRadius: "10px", padding: "1.2rem", marginTop: "0.5rem" }}>
          <div style={{ display: "flex", alignItems: "center", gap: "0.5rem", marginBottom: "0.8rem", color: "var(--accent)" }}>
            <ListChecks size={16} />
            <span style={{ fontSize: "0.85rem", fontWeight: 700 }}>Suggested Talking Points & Draft</span>
          </div>
          <p style={{ whiteSpace: "pre-wrap", margin: 0, fontSize: "0.9rem", color: "var(--text)", lineHeight: 1.6 }}>
            {result}
          </p>
        </div>
      )}
    </div>
  );
}
