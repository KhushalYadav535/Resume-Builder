"use client";
import React, { useState } from "react";
import { Info, HelpCircle } from "lucide-react";

export default function GapStoryteller() {
  const [gapReason, setGapReason] = useState("");
  const [learning, setLearning] = useState("");
  const [result, setResult] = useState("");
  const [loading, setLoading] = useState(false);

  const generateGapStory = async () => {
    if (!gapReason) return;
    setLoading(true);
    // Simulate generation for now
    setTimeout(() => {
      setResult(`"During my career break for ${gapReason.toLowerCase()}, I took the opportunity to reflect and grow. ${learning ? `Specifically, I focused on ${learning.toLowerCase()}, which allowed me to stay sharp and develop new perspectives.` : ''} I am now fully energized and ready to bring this renewed focus to a new role."`);
      setLoading(false);
    }, 1500);
  };

  return (
    <div className="card" style={{ padding: "1.5rem", display: "grid", gap: "1.2rem" }}>
      <div>
        <h3 style={{ margin: "0 0 0.5rem", fontSize: "1.1rem", fontWeight: 700, display: "flex", alignItems: "center", gap: "0.5rem" }}>
          <HelpCircle size={18} className="text-blue-500" />
          Gap Storyteller
        </h3>
        <p style={{ margin: 0, fontSize: "0.85rem", color: "var(--text-muted)", lineHeight: 1.5 }}>
          Frame career gaps, layoffs, or job-hopping constructively. Fill out the details below, and AI will weave it into a professional narrative.
        </p>
      </div>

      <div style={{ display: "grid", gap: "1rem" }}>
        <div>
          <label style={{ fontSize: "0.85rem", fontWeight: 600, display: "block", marginBottom: "0.4rem" }}>Reason for Gap</label>
          <input
            className="input"
            style={{ width: "100%", height: "42px", background: "var(--bg-elevated)", border: "1px solid var(--border)", borderRadius: "8px", padding: "0 1rem" }}
            placeholder="e.g. Layoff, Caregiving, Sabbatical, Relocation"
            value={gapReason}
            onChange={(e) => setGapReason(e.target.value)}
          />
        </div>
        
        <div>
          <label style={{ fontSize: "0.85rem", fontWeight: 600, display: "block", marginBottom: "0.4rem" }}>What did you do/learn? (Optional)</label>
          <input
            className="input"
            style={{ width: "100%", height: "42px", background: "var(--bg-elevated)", border: "1px solid var(--border)", borderRadius: "8px", padding: "0 1rem" }}
            placeholder="e.g. Upskilled in React, Freelance work, Volunteer"
            value={learning}
            onChange={(e) => setLearning(e.target.value)}
          />
        </div>
        
        <button 
          onClick={generateGapStory} 
          disabled={!gapReason || loading} 
          className="btn-secondary"
          style={{ width: "fit-content" }}
        >
          {loading ? "Generating..." : "Generate Narrative"}
        </button>
      </div>

      {result && (
        <div style={{ background: "rgba(108, 99, 255, 0.05)", border: "1px solid rgba(108, 99, 255, 0.15)", borderRadius: "8px", padding: "1.2rem", marginTop: "0.5rem" }}>
          <div style={{ display: "flex", alignItems: "center", gap: "0.5rem", marginBottom: "0.8rem", color: "var(--accent)" }}>
            <Info size={16} />
            <span style={{ fontSize: "0.85rem", fontWeight: 700 }}>Suggested Script</span>
          </div>
          <p style={{ margin: 0, fontSize: "0.95rem", lineHeight: 1.6, fontStyle: "italic", color: "var(--text)" }}>
            {result}
          </p>
        </div>
      )}
    </div>
  );
}
