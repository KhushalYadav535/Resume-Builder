"use client";
import React, { useState } from "react";
import { Handshake, Copy, Check, Loader2, Sparkles, Mail, Send, DollarSign, MessageSquare } from "lucide-react";
import { useToast } from "@/components/ui/toast-1";
import ToneCalibrator from "@/components/career-copilot/ToneCalibrator";

export default function NegotiationScript() {
  const [offerDetails, setOfferDetails] = useState("");
  const [targetSalary, setTargetSalary] = useState("");
  const [toneValue, setToneValue] = useState(65);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<string>("");
  const [copied, setCopied] = useState(false);
  const { showToast } = useToast();

  const handleGenerate = async () => {
    if (!offerDetails.trim() || !targetSalary.trim()) {
      showToast("Please provide current offer details and your counter target.", "warning");
      return;
    }
    setLoading(true);
    try {
      const res = await fetch("/api/copilot/growth", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ type: "negotiation", offerDetails, targetSalary, tone: toneValue }),
      });
      if (res.ok) {
        const data = await res.json();
        setResult(data.script || "");
      } else {
        showToast("Failed to generate script", "error");
      }
    } catch (err) {
      console.error(err);
      showToast("An error occurred while generating script", "error");
    } finally {
      setLoading(false);
    }
  };

  const handleCopy = () => {
    if (!result) return;
    navigator.clipboard.writeText(result);
    setCopied(true);
    showToast("Negotiation script copied to clipboard", "success");
    setTimeout(() => setCopied(false), 2200);
  };

  const wordCount = result ? result.trim().split(/\s+/).length : 0;
  const readTimeSec = Math.max(10, Math.round((wordCount / 200) * 60));

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
                background: "linear-gradient(135deg, rgba(16, 185, 129, 0.2), rgba(5, 150, 105, 0.2))",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                color: "#10B981",
                border: "1px solid rgba(16, 185, 129, 0.3)",
              }}
            >
              <Handshake size={18} />
            </div>
            <div>
              <h3 style={{ margin: 0, fontSize: "1.1rem", fontWeight: 700, color: "var(--text)" }}>
                Negotiation Script Generator
              </h3>
            </div>
          </div>
          <span
            style={{
              fontSize: "0.7rem",
              fontWeight: 700,
              padding: "0.2rem 0.6rem",
              borderRadius: "999px",
              background: "rgba(16, 185, 129, 0.12)",
              color: "#10B981",
              border: "1px solid rgba(16, 185, 129, 0.25)",
            }}
          >
            Counter-Offer Studio
          </span>
        </div>
        <p style={{ margin: 0, fontSize: "0.85rem", color: "var(--text-muted)", lineHeight: 1.5 }}>
          Draft an executive counter-offer response to negotiate base salary, equity, signing bonus, or PTO with data-backed diplomacy.
        </p>
      </div>

      {/* Inputs */}
      <div style={{ display: "grid", gap: "1rem" }}>
        <div>
          <label style={{ fontSize: "0.78rem", fontWeight: 700, color: "var(--text)", display: "flex", alignItems: "center", gap: "0.4rem", marginBottom: "0.4rem" }}>
            <MessageSquare size={13} className="text-emerald-500" />
            What is their current offer? *
          </label>
          <textarea
            className="input"
            rows={3}
            placeholder="e.g. ₹18L base + ₹2L variable bonus, standard 15 days PTO, hybrid 3 days/week in office..."
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

        <div>
          <label style={{ fontSize: "0.78rem", fontWeight: 700, color: "var(--text)", display: "flex", alignItems: "center", gap: "0.4rem", marginBottom: "0.4rem" }}>
            <DollarSign size={13} className="text-amber-500" />
            What is your desired target / counter-ask? *
          </label>
          <input
            className="input"
            placeholder="e.g. ₹22L base salary, or ₹20L base + ₹3L sign-on bonus + 1 extra week PTO"
            value={targetSalary}
            onChange={(e) => setTargetSalary(e.target.value)}
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

        {/* Tone Calibrator Widget */}
        <ToneCalibrator value={toneValue} onChange={setToneValue} />

        {/* Submit Button */}
        <div>
          <button
            type="button"
            onClick={handleGenerate}
            disabled={!offerDetails.trim() || !targetSalary.trim() || loading}
            className="btn-primary"
            style={{
              padding: "0.65rem 1.4rem",
              fontSize: "0.88rem",
              fontWeight: 700,
              borderRadius: "8px",
              display: "inline-flex",
              alignItems: "center",
              gap: "0.5rem",
              cursor: !offerDetails.trim() || !targetSalary.trim() || loading ? "not-allowed" : "pointer",
              opacity: !offerDetails.trim() || !targetSalary.trim() ? 0.6 : 1,
            }}
          >
            {loading ? (
              <>
                <Loader2 size={16} className="animate-spin" />
                Composing Diplomatic Counter-Offer...
              </>
            ) : (
              <>
                <Sparkles size={16} />
                Generate Counter-Offer Script
              </>
            )}
          </button>
        </div>
      </div>

      {/* Generated Script Mockup */}
      {result && (
        <div
          style={{
            background: "rgba(16, 185, 129, 0.03)",
            border: "1px solid rgba(16, 185, 129, 0.25)",
            borderRadius: "12px",
            overflow: "hidden",
            boxShadow: "0 4px 20px rgba(0, 0, 0, 0.05)",
          }}
        >
          {/* Email Client Header Bar */}
          <div
            style={{
              background: "rgba(0, 0, 0, 0.15)",
              padding: "0.75rem 1.1rem",
              borderBottom: "1px solid rgba(16, 185, 129, 0.15)",
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              flexWrap: "wrap",
              gap: "0.5rem",
            }}
          >
            <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
              <Mail size={15} className="text-emerald-500" />
              <span style={{ fontSize: "0.8rem", fontWeight: 700, color: "var(--text)" }}>
                Ready-to-Send Executive Email Draft
              </span>
              <span
                style={{
                  fontSize: "0.7rem",
                  color: "var(--text-muted)",
                  background: "rgba(255, 255, 255, 0.06)",
                  padding: "0.1rem 0.4rem",
                  borderRadius: "4px",
                }}
              >
                ~{readTimeSec}s read ({wordCount} words)
              </span>
            </div>

            <button
              type="button"
              onClick={handleCopy}
              style={{
                background: "var(--bg-elevated)",
                border: "1px solid var(--border)",
                borderRadius: "6px",
                padding: "0.3rem 0.75rem",
                cursor: "pointer",
                color: copied ? "#10B981" : "var(--text)",
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
                  <span>Copy Email</span>
                </>
              )}
            </button>
          </div>

          {/* Email Body */}
          <div style={{ padding: "1.25rem 1.4rem" }}>
            <p
              style={{
                whiteSpace: "pre-wrap",
                margin: 0,
                fontSize: "0.88rem",
                color: "var(--text-primary)",
                lineHeight: 1.7,
                fontFamily: "inherit",
              }}
            >
              {result}
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
