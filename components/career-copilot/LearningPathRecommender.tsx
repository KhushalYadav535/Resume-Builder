"use client";
import React, { useState } from "react";
import { BookOpen, GraduationCap, Loader2, ExternalLink, Clock, TrendingUp, Copy, Check } from "lucide-react";
import { useToast } from "@/components/ui/toast-1";

interface LearningItem {
  skill: string;
  priority: "high" | "medium" | "low";
  estimatedWeeks: number;
  whyItMatters: string;
  recommendation: string;
  platform: string;
  url: string | null;
}

interface LearningPathRecommenderProps {
  targetRole: string;
  missingSkills: string[];
  gapPercentage: number;
}

const priorityConfig = {
  high: { color: "#ef4444", bg: "rgba(239, 68, 68, 0.1)", label: "High Priority" },
  medium: { color: "#f59e0b", bg: "rgba(245, 158, 11, 0.1)", label: "Medium" },
  low: { color: "#6b7280", bg: "rgba(107, 114, 128, 0.1)", label: "Nice to Have" },
};

const platformColors: Record<string, string> = {
  Coursera: "#0056d3",
  Udemy: "#a435f0",
  YouTube: "#ff0000",
  GitHub: "#333",
  "Official Docs": "#10b981",
  Other: "var(--accent)",
};

export default function LearningPathRecommender({
  targetRole,
  missingSkills,
  gapPercentage,
}: LearningPathRecommenderProps) {
  const [loading, setLoading] = useState(false);
  const [learningPath, setLearningPath] = useState<LearningItem[]>([]);
  const [totalWeeks, setTotalWeeks] = useState<number | null>(null);
  const [copied, setCopied] = useState(false);
  const { showToast } = useToast();

  const handleGenerate = async () => {
    if (!targetRole || missingSkills.length === 0) {
      showToast("Run Skill Gap Analysis first to generate a learning path.", "warning");
      return;
    }
    setLoading(true);
    setLearningPath([]);
    try {
      const res = await fetch("/api/copilot/growth", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          type: "learning-path",
          targetRole,
          missingSkills,
          gapPercentage,
        }),
      });
      if (res.ok) {
        const data = await res.json();
        const path: LearningItem[] = data.learningPath || [];
        setLearningPath(path);
        const weeks = path
          .filter((item) => item.priority === "high")
          .reduce((sum, item) => sum + (item.estimatedWeeks || 0), 0);
        setTotalWeeks(weeks || null);
      } else {
        showToast("Failed to generate learning path.", "error");
      }
    } catch (err) {
      console.error(err);
      showToast("An error occurred.", "error");
    } finally {
      setLoading(false);
    }
  };

  const handleCopyAll = () => {
    if (learningPath.length === 0) return;
    const text = learningPath
      .map(
        (item, i) =>
          `${i + 1}. ${item.skill} [${item.priority.toUpperCase()}] — ${item.estimatedWeeks}w\n   ${item.recommendation} (${item.platform})`
      )
      .join("\n");
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="card" style={{ padding: "1.5rem", display: "grid", gap: "1.2rem" }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
        <div>
          <h3 style={{ margin: "0 0 0.4rem", fontSize: "1.1rem", fontWeight: 700, display: "flex", alignItems: "center", gap: "0.5rem" }}>
            <GraduationCap size={18} className="text-violet-500" />
            Learning Path Recommender
          </h3>
          <p style={{ margin: 0, fontSize: "0.85rem", color: "var(--text-muted)", lineHeight: 1.5 }}>
            {missingSkills.length > 0
              ? `${missingSkills.length} skills to bridge for ${targetRole}. AI will rank courses by ROI.`
              : "Run Skill Gap Analysis above to unlock personalized learning recommendations."}
          </p>
        </div>
        {learningPath.length > 0 && totalWeeks !== null && (
          <div style={{ textAlign: "center", flexShrink: 0 }}>
            <div style={{ display: "flex", alignItems: "center", gap: "0.3rem", fontSize: "0.75rem", color: "var(--text-muted)", justifyContent: "center" }}>
              <Clock size={12} />
              Est. focus time
            </div>
            <div style={{ fontSize: "1.3rem", fontWeight: 800, color: "var(--accent)", fontFamily: "Syne, sans-serif" }}>
              ~{totalWeeks}w
            </div>
          </div>
        )}
      </div>

      {missingSkills.length > 0 && (
        <div style={{ display: "flex", flexWrap: "wrap", gap: "0.4rem" }}>
          {missingSkills.map((s) => (
            <span key={s} className="tag tag-red" style={{ fontSize: "0.72rem" }}>{s}</span>
          ))}
        </div>
      )}

      {learningPath.length === 0 ? (
        <button
          onClick={handleGenerate}
          disabled={loading || missingSkills.length === 0}
          className="btn-primary"
          style={{ width: "fit-content", display: "flex", alignItems: "center", gap: "0.5rem" }}
        >
          {loading ? (
            <><Loader2 size={14} className="animate-spin" /> Building Learning Path...</>
          ) : (
            <><TrendingUp size={14} /> Generate Learning Path</>
          )}
        </button>
      ) : (
        <div style={{ display: "grid", gap: "1rem" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <span style={{ fontSize: "0.85rem", fontWeight: 700, color: "var(--text)" }}>
              {learningPath.length} resources ranked by ROI
            </span>
            <button
              onClick={handleCopyAll}
              style={{ background: "none", border: "none", cursor: "pointer", color: copied ? "#10b981" : "var(--text-muted)", display: "flex", alignItems: "center", gap: "0.3rem", fontSize: "0.8rem" }}
            >
              {copied ? <><Check size={14} /> Copied!</> : <><Copy size={14} /> Copy All</>}
            </button>
          </div>

          {learningPath.map((item, idx) => {
            const cfg = priorityConfig[item.priority] || priorityConfig.low;
            const platColor = platformColors[item.platform] || "var(--accent)";

            return (
              <div
                key={idx}
                style={{
                  background: "rgba(255,255,255,0.015)",
                  border: "1px solid var(--border)",
                  borderLeft: `3px solid ${cfg.color}`,
                  borderRadius: "10px",
                  padding: "1rem 1.2rem",
                  display: "grid",
                  gap: "0.6rem",
                }}
              >
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", flexWrap: "wrap", gap: "0.5rem" }}>
                  <div style={{ display: "flex", alignItems: "center", gap: "0.6rem" }}>
                    <span style={{ fontSize: "0.95rem", fontWeight: 700, color: "var(--text)" }}>
                      {item.skill}
                    </span>
                    <span style={{ fontSize: "0.7rem", fontWeight: 700, padding: "0.2rem 0.5rem", borderRadius: "999px", background: cfg.bg, color: cfg.color }}>
                      {cfg.label}
                    </span>
                  </div>
                  <div style={{ display: "flex", alignItems: "center", gap: "0.4rem", fontSize: "0.8rem", color: "var(--text-muted)" }}>
                    <Clock size={12} />
                    {item.estimatedWeeks}w
                  </div>
                </div>

                <p style={{ margin: 0, fontSize: "0.82rem", color: "var(--text-muted)", lineHeight: 1.5 }}>
                  {item.whyItMatters}
                </p>

                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: "0.8rem" }}>
                  <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
                    <span style={{ fontSize: "0.7rem", fontWeight: 700, padding: "0.2rem 0.5rem", borderRadius: "999px", background: `${platColor}18`, color: platColor }}>
                      {item.platform}
                    </span>
                    <span style={{ fontSize: "0.82rem", color: "var(--text-secondary)" }}>
                      {item.recommendation}
                    </span>
                  </div>
                  {item.url && (
                    <a
                      href={item.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      style={{ color: "var(--accent)", display: "flex", alignItems: "center", gap: "0.3rem", fontSize: "0.8rem", textDecoration: "none", flexShrink: 0 }}
                    >
                      Open <ExternalLink size={12} />
                    </a>
                  )}
                </div>
              </div>
            );
          })}

          <button
            onClick={handleGenerate}
            disabled={loading}
            className="btn-secondary"
            style={{ width: "fit-content", fontSize: "0.8rem" }}
          >
            {loading ? "Refreshing..." : "Refresh Path"}
          </button>
        </div>
      )}
    </div>
  );
}
