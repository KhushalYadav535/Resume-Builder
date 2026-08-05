"use client";

import React, { useState, useEffect } from "react";
import { Zap, ArrowRight, X, Sparkles, ShieldAlert } from "lucide-react";
import { useRouter } from "next/navigation";

interface ModalDetails {
  open: boolean;
  message?: string;
  featureName?: string;
  requiredCredits?: number;
}

/**
 * Global helper that can be called anywhere in client code to open the Insufficient Credits modal.
 */
export function triggerInsufficientCreditsModal(message?: string, requiredCredits?: number, featureName?: string) {
  if (typeof window !== "undefined") {
    window.dispatchEvent(
      new CustomEvent("open-insufficient-credits-modal", {
        detail: { message, requiredCredits, featureName },
      })
    );
  }
}

export default function InsufficientCreditsModal() {
  const [details, setDetails] = useState<ModalDetails>({ open: false });
  const router = useRouter();

  useEffect(() => {
    const handleOpen = (e: Event) => {
      const customEvent = e as CustomEvent<{ message?: string; requiredCredits?: number; featureName?: string }>;
      setDetails({
        open: true,
        message: customEvent.detail?.message,
        featureName: customEvent.detail?.featureName,
        requiredCredits: customEvent.detail?.requiredCredits,
      });
    };

    window.addEventListener("open-insufficient-credits-modal", handleOpen);
    return () => {
      window.removeEventListener("open-insufficient-credits-modal", handleOpen);
    };
  }, []);

  if (!details.open) return null;

  const handleUpgrade = () => {
    setDetails({ open: false });
    router.push("/pricing#topup");
  };

  return (
    <div
      style={{
        position: "fixed",
        inset: 0,
        zIndex: 99999,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: "1rem",
        background: "rgba(9, 13, 22, 0.75)",
        backdropFilter: "blur(8px)",
        WebkitBackdropFilter: "blur(8px)",
        animation: "fadeIn 0.2s ease-out",
      }}
      onClick={() => setDetails({ open: false })}
    >
      <div
        style={{
          position: "relative",
          width: "100%",
          maxWidth: "460px",
          background: "var(--card, #131722)",
          border: "1px solid rgba(239, 68, 68, 0.3)",
          borderRadius: "20px",
          padding: "2rem",
          boxShadow: "0 20px 50px rgba(0,0,0,0.5), 0 0 40px rgba(239, 68, 68, 0.15)",
          color: "var(--text-primary, #ffffff)",
          fontFamily: "Inter, sans-serif",
          overflow: "hidden",
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Decorative Top Accent Line */}
        <div
          style={{
            position: "absolute",
            top: 0,
            left: 0,
            right: 0,
            height: "4px",
            background: "linear-gradient(90deg, #ef4444, #f97316, #8b5cf6)",
          }}
        />

        {/* Close Button */}
        <button
          onClick={() => setDetails({ open: false })}
          style={{
            position: "absolute",
            top: "1.25rem",
            right: "1.25rem",
            background: "rgba(255, 255, 255, 0.05)",
            border: "1px solid rgba(255, 255, 255, 0.1)",
            borderRadius: "50%",
            width: "32px",
            height: "32px",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            color: "#94a3b8",
            cursor: "pointer",
            transition: "all 0.2s",
          }}
          onMouseOver={(e) => (e.currentTarget.style.color = "#ffffff")}
          onMouseOut={(e) => (e.currentTarget.style.color = "#94a3b8")}
        >
          <X size={16} />
        </button>

        {/* Header Icon */}
        <div
          style={{
            width: "56px",
            height: "56px",
            borderRadius: "16px",
            background: "linear-gradient(135deg, rgba(239,68,68,0.2) 0%, rgba(249,115,22,0.2) 100%)",
            border: "1px solid rgba(239, 68, 68, 0.4)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            marginBottom: "1.25rem",
            color: "#f87171",
          }}
        >
          <Zap size={28} />
        </div>

        {/* Title & Message */}
        <h3
          style={{
            fontFamily: "Syne, sans-serif",
            fontWeight: 800,
            fontSize: "1.35rem",
            color: "#ffffff",
            margin: "0 0 0.5rem 0",
          }}
        >
          Insufficient AI Credits
        </h3>

        <p
          style={{
            fontSize: "0.92rem",
            lineHeight: 1.55,
            color: "#94a3b8",
            margin: "0 0 1.25rem 0",
          }}
        >
          {details.message ||
            (details.requiredCredits
              ? `You need ${details.requiredCredits} credits to run ${details.featureName || "this AI feature"}.`
              : "You have run out of AI credits. Upgrade your account or purchase top-up credits to continue generating AI content.")}
        </p>

        {/* Warning Callout Box */}
        <div
          style={{
            background: "rgba(239, 68, 68, 0.08)",
            border: "1px solid rgba(239, 68, 68, 0.2)",
            borderRadius: "12px",
            padding: "0.85rem 1rem",
            marginBottom: "1.5rem",
            display: "flex",
            alignItems: "center",
            gap: "0.75rem",
          }}
        >
          <ShieldAlert size={18} color="#f87171" style={{ flexShrink: 0 }} />
          <span style={{ fontSize: "0.82rem", color: "#fca5a5", fontWeight: 500 }}>
            AI generation is temporarily paused until you add more credits to your balance.
          </span>
        </div>

        {/* Buttons */}
        <div style={{ display: "flex", gap: "0.75rem" }}>
          <button
            onClick={handleUpgrade}
            style={{
              flex: 1,
              background: "linear-gradient(135deg, #6366f1 0%, #a855f7 100%)",
              border: "none",
              borderRadius: "10px",
              padding: "0.75rem 1.25rem",
              fontWeight: 700,
              fontSize: "0.9rem",
              color: "#ffffff",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              gap: "0.5rem",
              cursor: "pointer",
              boxShadow: "0 4px 14px rgba(99, 102, 241, 0.4)",
              transition: "transform 0.15s, boxShadow 0.15s",
            }}
            onMouseOver={(e) => (e.currentTarget.style.transform = "translateY(-1px)")}
            onMouseOut={(e) => (e.currentTarget.style.transform = "translateY(0)")}
          >
            <Sparkles size={16} /> Get More Credits <ArrowRight size={16} />
          </button>
          <button
            onClick={() => setDetails({ open: false })}
            style={{
              background: "transparent",
              border: "1px solid rgba(255, 255, 255, 0.15)",
              borderRadius: "10px",
              padding: "0.75rem 1.25rem",
              fontWeight: 600,
              fontSize: "0.9rem",
              color: "#94a3b8",
              cursor: "pointer",
              transition: "all 0.15s",
            }}
            onMouseOver={(e) => (e.currentTarget.style.color = "#ffffff")}
            onMouseOut={(e) => (e.currentTarget.style.color = "#94a3b8")}
          >
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
}
