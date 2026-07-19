"use client";
import React, { useState } from "react";
import { Handshake, Copy, Check } from "lucide-react";
import { useToast } from "@/components/ui/toast-1";
import ToneCalibrator from "@/components/career-copilot/ToneCalibrator";

export default function NegotiationScript() {
  const [offerDetails, setOfferDetails] = useState("");
  const [targetSalary, setTargetSalary] = useState("");
  const [toneValue, setToneValue] = useState(50);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<string>("");
  const [copied, setCopied] = useState(false);
  const { showToast } = useToast();

  const handleGenerate = async () => {
    if (!offerDetails || !targetSalary) {
      showToast("Please provide offer details and your target.", "warning");
      return;
    }
    setLoading(true);
    try {
      const res = await fetch("/api/copilot/growth", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ type: "negotiation", offerDetails, targetSalary, tone: toneValue })
      });
      if (res.ok) {
        const data = await res.json();
        setResult(data.script);
      } else {
        showToast("Failed to generate script", "error");
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
        <Handshake size={18} className="text-emerald-500" />
        Negotiation Script Generator
      </h3>
      <p style={{ margin: 0, fontSize: "0.85rem", color: "var(--text-muted)", lineHeight: 1.5 }}>
        Generate a professional counter-offer email to negotiate your salary or benefits. AI will use your resume's value to justify the request.
      </p>

      <div style={{ display: "grid", gap: "1rem" }}>
        <textarea 
          className="input" 
          rows={3}
          placeholder="What did they offer? (e.g. $120k base, 10% bonus, standard benefits)" 
          value={offerDetails} 
          onChange={e => setOfferDetails(e.target.value)} 
          style={{ width: "100%", padding: "0.8rem", borderRadius: "8px", border: "1px solid var(--border)", background: "var(--bg-elevated)", resize: "vertical" }} 
        />
        <input 
          className="input" 
          placeholder="What is your target? (e.g. $135k base or an extra week of PTO)" 
          value={targetSalary} 
          onChange={e => setTargetSalary(e.target.value)} 
          style={{ width: "100%", padding: "0.6rem 1rem", borderRadius: "8px", border: "1px solid var(--border)", background: "var(--bg-elevated)" }} 
        />
        
        <ToneCalibrator value={toneValue} onChange={setToneValue} />
        
        <button onClick={handleGenerate} disabled={loading} className="btn-primary" style={{ width: "fit-content" }}>
          {loading ? "Generating Script..." : "Generate Counter-Offer Script"}
        </button>
      </div>

      {result && (
        <div style={{ background: "rgba(16, 185, 129, 0.05)", border: "1px solid rgba(16, 185, 129, 0.2)", borderRadius: "10px", padding: "1.2rem", marginTop: "0.5rem" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "0.8rem" }}>
            <span style={{ fontSize: "0.8rem", fontWeight: 700, color: "#10b981" }}>Generated Script</span>
            <button
              onClick={() => { navigator.clipboard.writeText(result); setCopied(true); setTimeout(() => setCopied(false), 2000); }}
              style={{ background: "none", border: "1px solid var(--border)", borderRadius: "6px", padding: "0.3rem 0.7rem", cursor: "pointer", color: copied ? "#10b981" : "var(--text-muted)", fontSize: "0.8rem", display: "flex", alignItems: "center", gap: "0.3rem", fontWeight: 600 }}
            >
              {copied ? <><Check size={13} /> Copied!</> : <><Copy size={13} /> Copy</>}
            </button>
          </div>
          <p style={{ whiteSpace: "pre-wrap", margin: 0, fontSize: "0.9rem", color: "var(--text)", lineHeight: 1.6 }}>
            {result}
          </p>
        </div>
      )}
    </div>
  );
}
