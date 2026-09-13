"use client";
import React, { useState } from "react";
import { Users, BarChart3, Sparkles, ArrowUpRight, ArrowDownRight, Loader2, ArrowRight } from "lucide-react";
import { useToast } from "@/components/ui/toast-1";

const ROLE_PRESETS = [
  "Frontend Engineer",
  "Full Stack Developer",
  "Product Manager",
  "Data Scientist",
];

export default function PeerBenchmark({ userAtsScore = 0 }: { userAtsScore?: number }) {
  const [role, setRole] = useState("Full Stack Developer");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<{ averageAtsScore: number; coreSkills: string[] } | null>({
    averageAtsScore: 72,
    coreSkills: ["JavaScript", "HTML/CSS", "React/Angular/Vue.js", "Node.js", "MySQL/MongoDB"],
  });
  const { showToast } = useToast();

  const handleBenchmark = async (targetRole?: string) => {
    const roleToQuery = targetRole || role;
    if (!roleToQuery.trim()) {
      showToast("Please enter or pick a target role", "warning");
      return;
    }
    if (targetRole) setRole(targetRole);
    setLoading(true);
    try {
      const res = await fetch("/api/copilot/market-insight", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ type: "peer-benchmark", role: roleToQuery }),
      });
      if (res.ok) {
        const data = await res.json();
        setResult(data);
      } else {
        showToast("Failed to fetch benchmark data", "error");
      }
    } catch (err) {
      console.error(err);
      showToast("An error occurred", "error");
    } finally {
      setLoading(false);
    }
  };

  const diff = result ? userAtsScore - result.averageAtsScore : 0;
  const isHigher = diff >= 0;

  return (
    <div
      className="card"
      style={{
        padding: "1.5rem",
        background: "linear-gradient(135deg, rgba(37, 99, 235, 0.05) 0%, rgba(20, 184, 166, 0.02) 100%)",
        border: "1px solid rgba(37, 99, 235, 0.22)",
        borderRadius: "16px",
        display: "flex",
        flexDirection: "column",
        justifyContent: "space-between",
        gap: "1rem",
        boxShadow: "0 4px 20px rgba(0, 0, 0, 0.03)",
      }}
    >
      <div>
        {/* Header */}
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "0.85rem" }}>
          <div style={{ display: "flex", alignItems: "center", gap: "0.55rem" }}>
            <div
              style={{
                width: 32,
                height: 32,
                borderRadius: "9px",
                background: "linear-gradient(135deg, rgba(37, 99, 235, 0.2), rgba(20, 184, 166, 0.2))",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                color: "#2563EB",
                border: "1px solid rgba(37, 99, 235, 0.35)",
              }}
            >
              <Users size={16} />
            </div>
            <div>
              <span style={{ fontSize: "0.7rem", color: "var(--text-muted)", fontWeight: 800, textTransform: "uppercase", letterSpacing: "0.5px", display: "block", lineHeight: 1 }}>
                Market Baseline
              </span>
              <h3 style={{ margin: "0.2rem 0 0", fontSize: "0.95rem", fontWeight: 700, color: "var(--text)" }}>
                Peer Benchmark
              </h3>
            </div>
          </div>
          <span
            style={{
              fontSize: "0.68rem",
              fontWeight: 700,
              padding: "0.2rem 0.6rem",
              borderRadius: "999px",
              background: "rgba(37, 99, 235, 0.12)",
              color: "var(--uprole-blue)",
              border: "1px solid rgba(37, 99, 235, 0.25)",
            }}
          >
            AI Industry Radar
          </span>
        </div>

        {/* Quick Role Suggestions */}
        <div style={{ display: "flex", gap: "0.35rem", flexWrap: "wrap", marginBottom: "0.65rem" }}>
          {ROLE_PRESETS.map((p) => {
            const isSel = role === p;
            return (
              <button
                key={p}
                type="button"
                onClick={() => handleBenchmark(p)}
                style={{
                  fontSize: "0.7rem",
                  fontWeight: 600,
                  padding: "0.2rem 0.55rem",
                  borderRadius: "6px",
                  border: isSel ? "1.5px solid var(--brand-amber)" : "1px solid var(--border)",
                  background: isSel ? "rgba(245, 158, 11, 0.12)" : "var(--bg-elevated)",
                  color: isSel ? "var(--brand-amber)" : "var(--text-muted)",
                  cursor: "pointer",
                  transition: "all 0.15s ease",
                }}
              >
                {p}
              </button>
            );
          })}
        </div>

        {/* Search Input Bar */}
        <div style={{ display: "flex", gap: "0.45rem", marginBottom: "0.75rem" }}>
          <input
            className="input"
            placeholder="Target role..."
            value={role}
            onChange={(e) => setRole(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleBenchmark()}
            style={{
              flex: 1,
              padding: "0.45rem 0.75rem",
              borderRadius: "8px",
              border: "1px solid var(--border)",
              background: "var(--bg-elevated)",
              fontSize: "0.8rem",
              height: "36px",
            }}
          />
          <button
            type="button"
            onClick={() => handleBenchmark()}
            disabled={loading}
            className="btn-secondary"
            style={{
              fontSize: "0.78rem",
              fontWeight: 700,
              padding: "0 0.85rem",
              height: "36px",
              borderRadius: "8px",
              display: "inline-flex",
              alignItems: "center",
              gap: "0.3rem",
              flexShrink: 0,
            }}
          >
            {loading ? <Loader2 size={13} className="animate-spin" /> : "Compare"}
          </button>
        </div>

        {/* Comparison Results Card */}
        {result && (
          <div
            style={{
              padding: "0.85rem 0.95rem",
              borderRadius: "14px",
              background: "var(--card)",
              border: "1px solid rgba(37, 99, 235, 0.16)",
              boxShadow: "0 2px 10px rgba(16, 27, 59, 0.03)",
              display: "flex",
              flexDirection: "column",
              gap: "0.75rem",
            }}
          >
            {/* Side by side stats */}
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "0.6rem" }}>
              {/* Box 1: Your Score */}
              <div
                style={{
                  padding: "0.6rem 0.7rem",
                  borderRadius: "10px",
                  background: isHigher ? "rgba(16, 185, 129, 0.05)" : "rgba(245, 158, 11, 0.05)",
                  border: isHigher ? "1px solid rgba(16, 185, 129, 0.2)" : "1px solid rgba(245, 158, 11, 0.2)",
                  textAlign: "center",
                }}
              >
                <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: "0.3rem", marginBottom: "0.2rem" }}>
                  <span
                    style={{
                      width: 5,
                      height: 5,
                      borderRadius: "50%",
                      background: isHigher ? "#10B981" : "#F59E0B",
                    }}
                  />
                  <span style={{ fontSize: "0.64rem", color: "var(--text-muted)", textTransform: "uppercase", fontWeight: 800, letterSpacing: "0.5px" }}>
                    Your Score
                  </span>
                </div>
                <div style={{ display: "flex", alignItems: "baseline", justifyContent: "center", gap: "0.15rem" }}>
                  <span
                    style={{
                      fontSize: "1.45rem",
                      fontWeight: 800,
                      fontFamily: "Syne, sans-serif",
                      color: isHigher ? "#10B981" : "#F59E0B",
                      lineHeight: 1,
                    }}
                  >
                    {userAtsScore}
                  </span>
                  <span style={{ fontSize: "0.62rem", color: "var(--text-muted)", fontWeight: 600 }}>/100</span>
                </div>
              </div>

              {/* Box 2: Industry Avg */}
              <div
                style={{
                  padding: "0.6rem 0.7rem",
                  borderRadius: "10px",
                  background: "rgba(37, 99, 235, 0.05)",
                  border: "1px solid rgba(37, 99, 235, 0.2)",
                  textAlign: "center",
                }}
              >
                <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: "0.3rem", marginBottom: "0.2rem" }}>
                  <span
                    style={{
                      width: 5,
                      height: 5,
                      borderRadius: "50%",
                      background: "#2563EB",
                    }}
                  />
                  <span style={{ fontSize: "0.64rem", color: "var(--text-muted)", textTransform: "uppercase", fontWeight: 800, letterSpacing: "0.5px" }}>
                    Industry Avg
                  </span>
                </div>
                <div style={{ display: "flex", alignItems: "baseline", justifyContent: "center", gap: "0.15rem" }}>
                  <span
                    style={{
                      fontSize: "1.45rem",
                      fontWeight: 800,
                      fontFamily: "Syne, sans-serif",
                      color: "var(--text-primary)",
                      lineHeight: 1,
                    }}
                  >
                    {result.averageAtsScore}
                  </span>
                  <span style={{ fontSize: "0.62rem", color: "var(--text-muted)", fontWeight: 600 }}>/100</span>
                </div>
              </div>
            </div>

            {/* Visual Comparative Meter Slider */}
            <div style={{ padding: "0.15rem 0" }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "0.35rem", fontSize: "0.68rem" }}>
                <span style={{ color: "var(--text-muted)", fontWeight: 600 }}>Peer Placement</span>
                <span
                  style={{
                    fontWeight: 700,
                    color: isHigher ? "#10B981" : "#D97706",
                    fontSize: "0.68rem",
                    display: "inline-flex",
                    alignItems: "center",
                    gap: "0.25rem",
                  }}
                >
                  {isHigher ? <ArrowUpRight size={12} /> : <ArrowDownRight size={12} />}
                  {isHigher ? `${Math.abs(diff)} pts above target baseline` : `${Math.abs(diff)} pts below target baseline`}
                </span>
              </div>
              
              {/* Dual-marker comparative bar */}
              <div
                style={{
                  height: "8px",
                  borderRadius: "999px",
                  background: "var(--bg-2)",
                  position: "relative",
                  overflow: "hidden",
                  border: "1px solid var(--border)",
                }}
              >
                {/* Industry avg marker fill */}
                <div
                  style={{
                    position: "absolute",
                    left: 0,
                    top: 0,
                    bottom: 0,
                    width: `${Math.min(100, Math.max(5, result.averageAtsScore))}%`,
                    background: "rgba(37, 99, 235, 0.15)",
                    borderRadius: "999px",
                  }}
                />
                {/* Candidate score fill */}
                <div
                  style={{
                    position: "absolute",
                    left: 0,
                    top: 0,
                    bottom: 0,
                    width: `${Math.min(100, Math.max(5, userAtsScore))}%`,
                    background: isHigher
                      ? "linear-gradient(90deg, #10B981, #059669)"
                      : "linear-gradient(90deg, #F59E0B, #D97706)",
                    borderRadius: "999px",
                    boxShadow: isHigher ? "0 0 8px rgba(16, 185, 129, 0.4)" : "0 0 8px rgba(245, 158, 11, 0.4)",
                    transition: "width 0.6s ease",
                  }}
                />
              </div>
            </div>

            {/* Expected Skills */}
            {result.coreSkills && result.coreSkills.length > 0 && (
              <div style={{ paddingTop: "0.15rem" }}>
                <div style={{ display: "flex", alignItems: "center", gap: "0.35rem", marginBottom: "0.4rem" }}>
                  <Sparkles size={12} style={{ color: "#2563EB" }} />
                  <span style={{ fontSize: "0.68rem", fontWeight: 700, color: "var(--text-muted)" }}>
                    Core Evaluated Competencies:
                  </span>
                </div>
                <div style={{ display: "flex", flexWrap: "wrap", gap: "0.35rem" }}>
                  {result.coreSkills.map((s, i) => (
                    <span
                      key={i}
                      style={{
                        fontSize: "0.68rem",
                        fontWeight: 600,
                        padding: "0.2rem 0.6rem",
                        borderRadius: "999px",
                        background: "rgba(37, 99, 235, 0.06)",
                        color: "var(--text-primary)",
                        border: "1px solid rgba(37, 99, 235, 0.18)",
                        display: "inline-flex",
                        alignItems: "center",
                        gap: "0.35rem",
                      }}
                    >
                      <span style={{ width: 4, height: 4, borderRadius: "50%", background: "#2563EB" }} />
                      {s}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Footer */}
      <div style={{ borderTop: "1px solid var(--border)", paddingTop: "0.75rem", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <span style={{ fontSize: "0.74rem", color: "var(--text-muted)" }}>Benchmark data updated</span>
        <span style={{ fontSize: "0.72rem", fontWeight: 700, color: "var(--uprole-blue)" }}>Live AI Telemetry</span>
      </div>
    </div>
  );
}
