"use client";
import React, { useState } from "react";
import { CalendarDays, Sparkles } from "lucide-react";
import { useToast } from "@/components/ui/toast-1";

const PRESET_TOPICS = [
  "Sprint Demo",
  "Q3 Planning",
  "Production Release",
  "Client Review",
];

export default function ProjectSync({ onGeneratedPrompt }: { onGeneratedPrompt: (prompt: string) => void }) {
  const [contextText, setContextText] = useState("");
  const [loading, setLoading] = useState(false);
  const { showToast } = useToast();

  const handleSync = async (textToUse?: string) => {
    const text = (textToUse !== undefined ? textToUse : contextText).trim();
    if (!text) {
      showToast("Please enter a meeting or project title", "warning");
      return;
    }
    setLoading(true);
    try {
      const res = await fetch("/api/journal/project-sync", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ contextText: text }),
      });
      if (res.ok) {
        const data = await res.json();
        onGeneratedPrompt(data.prompt);
        setContextText("");
      } else {
        showToast("Failed to generate prompt", "error");
      }
    } catch (err) {
      console.error(err);
      showToast("An error occurred", "error");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      style={{
        background: "var(--bg-elevated, #ffffff)",
        border: "1px solid var(--border)",
        borderRadius: "16px",
        padding: "1.2rem",
        boxShadow: "0 4px 16px rgba(16, 27, 59, 0.03)",
        position: "relative",
        overflow: "hidden",
        animation: "journal-fadeInUp 0.6s ease forwards",
        animationDelay: "0.15s",
      }}
    >
      {/* Top accent hairline */}
      <div style={{
        position: "absolute",
        top: 0,
        left: 0,
        right: 0,
        height: "3px",
        background: "linear-gradient(90deg, #14B8A6, #2563EB)",
        borderRadius: "16px 16px 0 0",
      }} />

      {/* Header */}
      <div style={{ display: "flex", alignItems: "center", gap: "0.55rem", marginBottom: "0.55rem" }}>
        <div style={{
          width: 32,
          height: 32,
          borderRadius: "9px",
          background: "rgba(20, 184, 166, 0.1)",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}>
          <CalendarDays size={17} style={{ color: "var(--uprole-teal, #14B8A6)" }} />
        </div>
        <div>
          <h3 style={{
            margin: 0,
            fontSize: "0.95rem",
            fontWeight: 800,
            fontFamily: "Space Grotesk, Syne, sans-serif",
            color: "var(--text-primary)",
          }}>
            Project & Calendar Sync
          </h3>
          <span style={{ fontSize: "0.68rem", color: "var(--text-muted)" }}>
            Contextual Win Prompts
          </span>
        </div>
      </div>

      <p style={{
        fontSize: "0.78rem",
        color: "var(--text-secondary)",
        margin: "0 0 0.75rem",
        lineHeight: 1.45,
      }}>
        Paste any meeting, release, or milestone. AI crafts a targeted question to log your win.
      </p>

      {/* Quick Example Chips */}
      <div style={{ display: "flex", gap: "0.3rem", flexWrap: "wrap", marginBottom: "0.65rem" }}>
        {PRESET_TOPICS.map((topic) => (
          <button
            key={topic}
            type="button"
            onClick={() => {
              setContextText(topic);
              handleSync(topic);
            }}
            disabled={loading}
            style={{
              background: "var(--bg-2, #F1F4F9)",
              border: "1px solid var(--border)",
              borderRadius: "6px",
              padding: "0.2rem 0.5rem",
              fontSize: "0.7rem",
              fontWeight: 600,
              color: "var(--text-secondary)",
              cursor: "pointer",
              transition: "all 0.15s ease",
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.borderColor = "var(--uprole-teal, #14B8A6)";
              e.currentTarget.style.color = "var(--text-primary)";
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.borderColor = "var(--border)";
              e.currentTarget.style.color = "var(--text-secondary)";
            }}
          >
            {topic}
          </button>
        ))}
      </div>

      <div style={{ display: "grid", gap: "0.5rem" }}>
        <input
          className="journal-input"
          placeholder="e.g. Q3 Architecture Migration"
          value={contextText}
          onChange={(e) => setContextText(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && handleSync()}
          style={{
            width: "100%",
            padding: "0.55rem 0.85rem",
            height: "38px",
            fontSize: "0.82rem",
          }}
        />
        <button
          onClick={() => handleSync()}
          disabled={loading}
          style={{
            width: "100%",
            fontSize: "0.8rem",
            padding: "0.55rem",
            display: "flex",
            justifyContent: "center",
            gap: "0.4rem",
            alignItems: "center",
            borderRadius: "9px",
            fontWeight: 700,
            background: "var(--bg-2, #F1F4F9)",
            border: "1px solid var(--border)",
            color: "var(--text-primary)",
            cursor: loading ? "not-allowed" : "pointer",
            transition: "all 0.2s ease",
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.borderColor = "var(--uprole-teal, #14B8A6)";
            e.currentTarget.style.background = "rgba(20, 184, 166, 0.08)";
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.borderColor = "var(--border)";
            e.currentTarget.style.background = "var(--bg-2, #F1F4F9)";
          }}
        >
          {loading ? (
            <span style={{ display: "flex", alignItems: "center", gap: "0.4rem" }}>
              <div className="spinner" style={{ width: 12, height: 12 }} />
              Generating Prompt...
            </span>
          ) : (
            <>
              <Sparkles size={13} style={{ color: "var(--uprole-teal, #14B8A6)" }} />
              Generate Career Prompt
            </>
          )}
        </button>
      </div>
    </div>
  );
}
