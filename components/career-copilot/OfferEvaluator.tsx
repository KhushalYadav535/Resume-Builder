"use client";
import React, { useState } from "react";
import { Scale, Loader2, CheckCircle2, AlertCircle, HeartHandshake, Copy, Check, DollarSign, Briefcase, FileText, Sparkles } from "lucide-react";
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
    showToast("Evaluation copied to clipboard", "success");
    setTimeout(() => setCopied(false), 2200);
  };

  const priorityOptions = [
    {
      id: "growth",
      label: "Career Growth",
      desc: "Skill acquisition & title trajectory",
      icon: <CheckCircle2 size={15} className="text-emerald-500" />,
      color: "#10B981",
    },
    {
      id: "compensation",
      label: "Top Compensation",
      desc: "Base, equity, bonus maximization",
      icon: <DollarSign size={15} className="text-amber-500" />,
      color: "#F59E0B",
    },
    {
      id: "wlb",
      label: "Work-Life Balance",
      desc: "Flexibility, PTO & sustainability",
      icon: <HeartHandshake size={15} className="text-blue-400" />,
      color: "#38BDF8",
    },
  ];

  return (
    <div
      className="card"
      style={{
        padding: "1.6rem",
        display: "grid",
        gap: "1.25rem",
        borderRadius: "14px",
        border: "1px solid var(--border)",
        background: "var(--card)",
      }}
    >
      {/* Header */}
      <div>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "0.4rem" }}>
          <div style={{ display: "flex", alignItems: "center", gap: "0.6rem" }}>
            <div
              style={{
                width: 34,
                height: 34,
                borderRadius: "10px",
                background: "linear-gradient(135deg, rgba(245, 158, 11, 0.2), rgba(217, 119, 6, 0.2))",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                color: "var(--brand-amber)",
                border: "1px solid rgba(245, 158, 11, 0.3)",
              }}
            >
              <Scale size={18} />
            </div>
            <div>
              <h3 style={{ margin: 0, fontSize: "1.1rem", fontWeight: 700, color: "var(--text)" }}>
                Offer Evaluator
              </h3>
            </div>
          </div>
          <span
            style={{
              fontSize: "0.7rem",
              fontWeight: 700,
              padding: "0.2rem 0.6rem",
              borderRadius: "999px",
              background: "rgba(245, 158, 11, 0.12)",
              color: "var(--brand-amber)",
              border: "1px solid rgba(245, 158, 11, 0.25)",
            }}
          >
            Leverage Analysis
          </span>
        </div>
        <p style={{ margin: 0, fontSize: "0.85rem", color: "var(--text-muted)", lineHeight: 1.5 }}>
          Benchmark your job offer against current market compensation and your personal priorities with AI leverage insights.
        </p>
      </div>

      {/* Form Fields */}
      <div style={{ display: "grid", gap: "1rem" }}>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: "0.85rem" }}>
          <div>
            <label style={{ fontSize: "0.78rem", fontWeight: 700, color: "var(--text)", display: "flex", alignItems: "center", gap: "0.4rem", marginBottom: "0.4rem" }}>
              <DollarSign size={13} className="text-amber-500" />
              Offered Base Salary *
            </label>
            <input
              className="input"
              placeholder="e.g. ₹24L, $135k, £85k"
              value={offerSalary}
              onChange={(e) => setOfferSalary(e.target.value)}
              style={{
                width: "100%",
                padding: "0.65rem 0.95rem",
                borderRadius: "8px",
                border: "1px solid var(--border)",
                background: "var(--bg-elevated)",
                fontSize: "0.88rem",
              }}
            />
          </div>

          <div>
            <label style={{ fontSize: "0.78rem", fontWeight: 700, color: "var(--text)", display: "flex", alignItems: "center", gap: "0.4rem", marginBottom: "0.4rem" }}>
              <Briefcase size={13} className="text-blue-500" />
              Target Role Title
            </label>
            <input
              className="input"
              placeholder="e.g. Senior Software Engineer"
              value={targetRole}
              onChange={(e) => setTargetRole(e.target.value)}
              style={{
                width: "100%",
                padding: "0.65rem 0.95rem",
                borderRadius: "8px",
                border: "1px solid var(--border)",
                background: "var(--bg-elevated)",
                fontSize: "0.88rem",
              }}
            />
          </div>
        </div>

        <div>
          <label style={{ fontSize: "0.78rem", fontWeight: 700, color: "var(--text)", display: "flex", alignItems: "center", gap: "0.4rem", marginBottom: "0.4rem" }}>
            <FileText size={13} className="text-purple-500" />
            Offer Breakdown &amp; Perks (Optional)
          </label>
          <textarea
            className="input"
            rows={3}
            placeholder="Equity/RSUs, joining bonus, performance incentive, hybrid/remote flexibility, health insurance, leave days..."
            value={offerDetails}
            onChange={(e) => setOfferDetails(e.target.value)}
            style={{
              width: "100%",
              padding: "0.75rem 0.95rem",
              borderRadius: "8px",
              border: "1px solid var(--border)",
              background: "var(--bg-elevated)",
              fontSize: "0.85rem",
              resize: "vertical",
              lineHeight: 1.5,
            }}
          />
        </div>

        {/* Priority Selector */}
        <div>
          <label style={{ fontSize: "0.78rem", fontWeight: 700, color: "var(--text)", display: "block", marginBottom: "0.5rem" }}>
            Primary Strategic Goal for this Career Move:
          </label>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(140px, 1fr))", gap: "0.5rem" }}>
            {priorityOptions.map((opt) => {
              const selected = priority === opt.id;
              return (
                <button
                  key={opt.id}
                  type="button"
                  onClick={() => setPriority(opt.id)}
                  style={{
                    padding: "0.6rem 0.75rem",
                    borderRadius: "10px",
                    border: selected ? `1.5px solid ${opt.color}` : "1px solid var(--border)",
                    background: selected ? `${opt.color}14` : "var(--bg-elevated)",
                    color: selected ? opt.color : "var(--text-muted)",
                    cursor: "pointer",
                    textAlign: "left",
                    transition: "all 0.15s ease",
                  }}
                >
                  <div style={{ display: "flex", alignItems: "center", gap: "0.4rem", fontWeight: 700, fontSize: "0.82rem" }}>
                    {opt.icon}
                    <span>{opt.label}</span>
                  </div>
                  <div style={{ fontSize: "0.7rem", color: "var(--text-muted)", marginTop: "0.2rem" }}>
                    {opt.desc}
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        {/* Submit Action */}
        <div>
          <button
            type="button"
            onClick={handleEvaluate}
            disabled={!offerSalary.trim() || loading}
            className="btn-primary"
            style={{
              padding: "0.65rem 1.4rem",
              fontSize: "0.88rem",
              fontWeight: 700,
              borderRadius: "8px",
              display: "inline-flex",
              alignItems: "center",
              gap: "0.5rem",
              cursor: !offerSalary.trim() || loading ? "not-allowed" : "pointer",
              opacity: !offerSalary.trim() ? 0.6 : 1,
            }}
          >
            {loading ? (
              <>
                <Loader2 size={16} className="animate-spin" />
                Analyzing Market Value &amp; Leverage...
              </>
            ) : (
              <>
                <Sparkles size={16} />
                Evaluate Offer &amp; Leverage
              </>
            )}
          </button>
        </div>
      </div>

      {/* AI Evaluation Output */}
      {result && (
        <div
          style={{
            background: "rgba(245, 158, 11, 0.04)",
            border: "1px solid rgba(245, 158, 11, 0.25)",
            borderRadius: "12px",
            padding: "1.3rem",
            marginTop: "0.25rem",
            boxShadow: "0 4px 20px rgba(0, 0, 0, 0.05)",
          }}
        >
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "0.85rem", paddingBottom: "0.6rem", borderBottom: "1px solid rgba(245, 158, 11, 0.15)" }}>
            <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
              <span
                style={{
                  fontSize: "0.75rem",
                  fontWeight: 800,
                  textTransform: "uppercase",
                  letterSpacing: "0.5px",
                  color: "var(--brand-amber)",
                }}
              >
                AI Offer Analysis &amp; Leverage Report
              </span>
            </div>
            <button
              type="button"
              onClick={handleCopy}
              style={{
                background: "var(--bg-elevated)",
                border: "1px solid var(--border)",
                borderRadius: "6px",
                padding: "0.3rem 0.7rem",
                cursor: "pointer",
                color: copied ? "#10B981" : "var(--text-muted)",
                display: "flex",
                alignItems: "center",
                gap: "0.35rem",
                fontSize: "0.78rem",
                fontWeight: 600,
              }}
            >
              {copied ? (
                <>
                  <Check size={13} className="text-emerald-500" />
                  <span>Copied!</span>
                </>
              ) : (
                <>
                  <Copy size={13} />
                  <span>Copy Report</span>
                </>
              )}
            </button>
          </div>

          <p
            style={{
              margin: 0,
              fontSize: "0.88rem",
              color: "var(--text-primary)",
              lineHeight: 1.7,
              whiteSpace: "pre-wrap",
            }}
          >
            {result}
          </p>
        </div>
      )}
    </div>
  );
}
