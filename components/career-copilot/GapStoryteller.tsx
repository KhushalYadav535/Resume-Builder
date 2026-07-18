"use client";
import React, { useState } from "react";
import { HelpCircle, Copy, Check, Loader2 } from "lucide-react";
import { useToast } from "@/components/ui/toast-1";
import ToneCalibrator from "@/components/career-copilot/ToneCalibrator";

export default function GapStoryteller() {
  const [gapReason, setGapReason] = useState("");
  const [whatYouDid, setWhatYouDid] = useState("");
  const [learning, setLearning] = useState("");
  const [toneValue, setToneValue] = useState(50);
  const [result, setResult] = useState("");
  const [loading, setLoading] = useState(false);
  const [copied, setCopied] = useState(false);
  const { showToast } = useToast();

  const generateGapStory = async () => {
    if (!gapReason.trim()) {
      showToast("Please describe the reason for your gap.", "warning");
      return;
    }
    setLoading(true);
    setResult("");
    try {
      const res = await fetch("/api/copilot/growth", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          type: "gap-story",
          gapReason,
          whatYouDid,
          learning,
          tone: toneValue,
        }),
      });
      if (res.ok) {
        const data = await res.json();
        setResult(data.script || "");
      } else {
        showToast("Failed to generate narrative. Please try again.", "error");
      }
    } catch (err) {
      console.error(err);
      showToast("An error occurred.", "error");
    } finally {
      setLoading(false);
    }
  };

  const handleCopy = () => {
    if (!result) return;
    navigator.clipboard.writeText(result);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="card" style={{ padding: "1.5rem", display: "grid", gap: "1.2rem" }}>
      <div>
        <h3 style={{ margin: "0 0 0.5rem", fontSize: "1.1rem", fontWeight: 700, display: "flex", alignItems: "center", gap: "0.5rem" }}>
          <HelpCircle size={18} className="text-blue-500" />
          Gap Storyteller
        </h3>
        <p style={{ margin: 0, fontSize: "0.85rem", color: "var(--text-muted)", lineHeight: 1.5 }}>
          Frame career gaps, layoffs, or transitions constructively. AI will weave your 3 inputs into a compelling professional narrative.
        </p>
      </div>

      <div style={{ display: "grid", gap: "1rem" }}>
        {/* Step 1 */}
        <div>
          <label style={{ fontSize: "0.85rem", fontWeight: 600, display: "block", marginBottom: "0.4rem" }}>
            <span style={{ color: "var(--accent)", marginRight: "0.5rem" }}>①</span>
            What happened? (Reason for gap)
          </label>
          <input
            className="input"
            style={{ width: "100%", height: "42px", background: "var(--bg-elevated)", border: "1px solid var(--border)", borderRadius: "8px", padding: "0 1rem" }}
            placeholder="e.g. Layoff due to company restructuring, Caregiving for family, Health reasons"
            value={gapReason}
            onChange={(e) => setGapReason(e.target.value)}
          />
        </div>

        {/* Step 2 */}
        <div>
          <label style={{ fontSize: "0.85rem", fontWeight: 600, display: "block", marginBottom: "0.4rem" }}>
            <span style={{ color: "var(--accent)", marginRight: "0.5rem" }}>②</span>
            What did you actively do? (Actions taken)
          </label>
          <input
            className="input"
            style={{ width: "100%", height: "42px", background: "var(--bg-elevated)", border: "1px solid var(--border)", borderRadius: "8px", padding: "0 1rem" }}
            placeholder="e.g. Freelanced, volunteered, cared for a family member, took courses"
            value={whatYouDid}
            onChange={(e) => setWhatYouDid(e.target.value)}
          />
        </div>

        {/* Step 3 */}
        <div>
          <label style={{ fontSize: "0.85rem", fontWeight: 600, display: "block", marginBottom: "0.4rem" }}>
            <span style={{ color: "var(--accent)", marginRight: "0.5rem" }}>③</span>
            What did you learn or gain? (Growth)
          </label>
          <input
            className="input"
            style={{ width: "100%", height: "42px", background: "var(--bg-elevated)", border: "1px solid var(--border)", borderRadius: "8px", padding: "0 1rem" }}
            placeholder="e.g. Upskilled in React, developed patience, built freelance portfolio"
            value={learning}
            onChange={(e) => setLearning(e.target.value)}
          />
        </div>

        <ToneCalibrator value={toneValue} onChange={setToneValue} />

        <button
          onClick={generateGapStory}
          disabled={!gapReason.trim() || loading}
          className="btn-secondary"
          style={{ width: "fit-content", display: "flex", alignItems: "center", gap: "0.5rem" }}
        >
          {loading ? (
            <><Loader2 size={14} className="animate-spin" /> Generating Narrative...</>
          ) : (
            "Generate Narrative"
          )}
        </button>
      </div>

      {result && (
        <div style={{ background: "rgba(108, 99, 255, 0.05)", border: "1px solid rgba(108, 99, 255, 0.15)", borderRadius: "8px", padding: "1.2rem", marginTop: "0.5rem" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "0.8rem" }}>
            <span style={{ fontSize: "0.85rem", fontWeight: 700, color: "var(--accent)" }}>Suggested Narrative</span>
            <button
              onClick={handleCopy}
              style={{ background: "none", border: "none", cursor: "pointer", color: copied ? "#10b981" : "var(--text-muted)", display: "flex", alignItems: "center", gap: "0.3rem", fontSize: "0.8rem" }}
            >
              {copied ? <><Check size={14} /> Copied!</> : <><Copy size={14} /> Copy</>}
            </button>
          </div>
          <p style={{ margin: 0, fontSize: "0.95rem", lineHeight: 1.7, color: "var(--text)", fontStyle: "italic" }}>
            {result}
          </p>
        </div>
      )}
    </div>
  );
}
