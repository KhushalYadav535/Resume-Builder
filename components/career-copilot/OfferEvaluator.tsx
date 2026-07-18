"use client";
import React, { useState } from "react";
import { Scale, Loader2, CheckCircle, AlertCircle, XCircle, Copy, Check } from "lucide-react";
import { useToast } from "@/components/ui/toast-1";

export default function OfferEvaluator() {
  const [offerSalary, setOfferSalary] = useState("");
  const [offerDetails, setOfferDetails] = useState("");
  const [targetRole, setTargetRole] = useState("");
  const [priority, setPriority] = useState("growth");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<string>("");
  const [copied, setCopied] = useState(false);
  const { showToast } = useToast();

  const handleEvaluate = async () => {
    if (!offerSalary.trim()) {
      showToast("Please enter the offered salary.", "warning");
      return;
    }
    setLoading(true);
    setResult("");
    try {
      const res = await fetch("/api/copilot/growth", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          type: "offer-eval",
          offerSalary,
          offerDetails,
          targetRole,
          priority,
        }),
      });
      if (res.ok) {
        const data = await res.json();
        setResult(data.evaluation || "");
      } else {
        showToast("Failed to evaluate offer. Please try again.", "error");
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

  const priorityIcons: Record<string, React.ReactNode> = {
    growth: <CheckCircle size={14} className="text-emerald-500" />,
    compensation: <AlertCircle size={14} className="text-amber-500" />,
    wlb: <XCircle size={14} className="text-blue-400" />,
  };

  return (
    <div className="card" style={{ padding: "1.5rem", display: "grid", gap: "1.2rem" }}>
      <h3 style={{ margin: "0 0 0.5rem", fontSize: "1.1rem", fontWeight: 700, display: "flex", alignItems: "center", gap: "0.5rem" }}>
        <Scale size={18} className="text-orange-400" />
        Offer Evaluator
      </h3>
      <p style={{ margin: 0, fontSize: "0.85rem", color: "var(--text-muted)", lineHeight: 1.5 }}>
        Get an AI-powered evaluation of a job offer against market data and your personal priorities. Includes negotiation leverage points.
      </p>

      <div style={{ display: "grid", gap: "1rem" }}>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1rem" }}>
          <input
            className="input"
            placeholder="Offered Base Salary (e.g. ₹18L, $120k)"
            value={offerSalary}
            onChange={(e) => setOfferSalary(e.target.value)}
            style={{ padding: "0.6rem 1rem", borderRadius: "8px", border: "1px solid var(--border)", background: "var(--bg-elevated)" }}
          />
          <input
            className="input"
            placeholder="Target Role (e.g. Senior Engineer)"
            value={targetRole}
            onChange={(e) => setTargetRole(e.target.value)}
            style={{ padding: "0.6rem 1rem", borderRadius: "8px", border: "1px solid var(--border)", background: "var(--bg-elevated)" }}
          />
        </div>

        <textarea
          className="input"
          rows={3}
          placeholder="Full offer details (optional): equity, bonus, perks, remote policy, growth path..."
          value={offerDetails}
          onChange={(e) => setOfferDetails(e.target.value)}
          style={{ padding: "0.8rem 1rem", borderRadius: "8px", border: "1px solid var(--border)", background: "var(--bg-elevated)", resize: "vertical" }}
        />

        <div>
          <label style={{ fontSize: "0.85rem", fontWeight: 600, display: "block", marginBottom: "0.5rem" }}>
            What's your top priority for this role?
          </label>
          <div style={{ display: "flex", gap: "0.6rem", flexWrap: "wrap" }}>
            {[
              { value: "growth", label: "Growth & Learning" },
              { value: "compensation", label: "Maximum Compensation" },
              { value: "wlb", label: "Work-Life Balance" },
            ].map((opt) => (
              <button
                key={opt.value}
                onClick={() => setPriority(opt.value)}
                style={{
                  padding: "0.4rem 0.9rem",
                  borderRadius: "999px",
                  border: `1px solid ${priority === opt.value ? "var(--accent)" : "var(--border)"}`,
                  background: priority === opt.value ? "rgba(108, 99, 255, 0.1)" : "var(--bg-elevated)",
                  color: priority === opt.value ? "var(--accent)" : "var(--text-muted)",
                  fontSize: "0.8rem",
                  fontWeight: 600,
                  cursor: "pointer",
                  display: "flex",
                  alignItems: "center",
                  gap: "0.35rem",
                  transition: "all 0.15s",
                }}
              >
                {priorityIcons[opt.value]}
                {opt.label}
              </button>
            ))}
          </div>
        </div>

        <button
          onClick={handleEvaluate}
          disabled={!offerSalary.trim() || loading}
          className="btn-secondary"
          style={{ width: "fit-content", display: "flex", alignItems: "center", gap: "0.5rem" }}
        >
          {loading ? (
            <><Loader2 size={14} className="animate-spin" /> Evaluating Offer...</>
          ) : (
            "Evaluate Offer"
          )}
        </button>
      </div>

      {result && (
        <div
          style={{
            background: "rgba(249, 115, 22, 0.05)",
            border: "1px solid rgba(249, 115, 22, 0.2)",
            borderRadius: "10px",
            padding: "1.2rem",
            marginTop: "0.5rem",
          }}
        >
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "0.8rem" }}>
            <span style={{ fontSize: "0.85rem", fontWeight: 700, color: "#f97316" }}>AI Evaluation</span>
            <button
              onClick={handleCopy}
              style={{ background: "none", border: "none", cursor: "pointer", color: copied ? "#10b981" : "var(--text-muted)", display: "flex", alignItems: "center", gap: "0.3rem", fontSize: "0.8rem" }}
            >
              {copied ? <><Check size={14} /> Copied!</> : <><Copy size={14} /> Copy</>}
            </button>
          </div>
          <p style={{ margin: 0, fontSize: "0.9rem", color: "var(--text)", lineHeight: 1.7, whiteSpace: "pre-wrap" }}>
            {result}
          </p>
        </div>
      )}
    </div>
  );
}
