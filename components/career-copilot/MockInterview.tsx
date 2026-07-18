"use client";
import React, { useState } from "react";
import {
  Brain,
  ChevronDown,
  ChevronRight,
  Loader2,
  CheckCircle2,
  AlertTriangle,
  Star,
  Copy,
  Check,
} from "lucide-react";
import { useToast } from "@/components/ui/toast-1";

interface Question {
  question: string;
  type: string;
}

interface StarAnswer {
  question: string;
  type: string;
  situation: string;
  task: string;
  action: string;
  result: string;
  fullAnswer: string;
  journalEvidence: string;
}

interface MockInterviewResult {
  starAnswers: StarAnswer[];
  readinessScore: number;
  readinessSummary: string;
  strengthAreas: string[];
  improvementAreas: string[];
}

interface MockInterviewProps {
  resumeId: string;
  questions: Question[];
}

const typeColors: Record<string, string> = {
  technical: "tag-purple",
  behavioral: "tag-green",
  "experience-specific": "tag-yellow",
};

export default function MockInterview({ resumeId, questions }: MockInterviewProps) {
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<MockInterviewResult | null>(null);
  const [expandedIdx, setExpandedIdx] = useState<number | null>(0);
  const [copiedIdx, setCopiedIdx] = useState<number | null>(null);
  const { showToast } = useToast();

  const handleGenerate = async () => {
    if (!resumeId || questions.length === 0) {
      showToast("Predict interview questions first, then build STAR answers.", "warning");
      return;
    }
    setLoading(true);
    setResult(null);
    try {
      const res = await fetch("/api/copilot/mock-interview", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ resumeId, questions }),
      });
      if (res.ok) {
        const data = await res.json();
        setResult(data);
        setExpandedIdx(0);
      } else {
        showToast("Failed to generate STAR answers. Please try again.", "error");
      }
    } catch (err) {
      console.error(err);
      showToast("An error occurred.", "error");
    } finally {
      setLoading(false);
    }
  };

  const handleCopy = (text: string, idx: number) => {
    navigator.clipboard.writeText(text);
    setCopiedIdx(idx);
    setTimeout(() => setCopiedIdx(null), 2000);
  };

  const getScoreColor = (score: number) => {
    if (score >= 75) return "#10b981";
    if (score >= 50) return "#f59e0b";
    return "#ef4444";
  };

  return (
    <div className="card" style={{ padding: "1.5rem", display: "grid", gap: "1.2rem" }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", flexWrap: "wrap", gap: "0.8rem" }}>
        <div>
          <h3 style={{ margin: "0 0 0.4rem", fontSize: "1.1rem", fontWeight: 700, display: "flex", alignItems: "center", gap: "0.5rem" }}>
            <Brain size={18} className="text-violet-500" />
            Mock Interview + STAR Answer Builder
          </h3>
          <p style={{ margin: 0, fontSize: "0.85rem", color: "var(--text-muted)", lineHeight: 1.5 }}>
            {questions.length > 0
              ? `AI will draft STAR-format answers for all ${questions.length} predicted questions using your resume and Career Journal data.`
              : "Predict interview questions above, then come back here to build STAR answers."}
          </p>
        </div>
        {result && (
          <div
            style={{
              textAlign: "center",
              background: `rgba(${result.readinessScore >= 75 ? "16,185,129" : result.readinessScore >= 50 ? "245,158,11" : "239,68,68"}, 0.1)`,
              border: `1px solid ${getScoreColor(result.readinessScore)}40`,
              borderRadius: "12px",
              padding: "0.8rem 1.2rem",
              minWidth: "100px",
            }}
          >
            <div style={{ fontSize: "0.7rem", color: "var(--text-muted)", fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.5px" }}>
              Readiness
            </div>
            <div style={{ fontSize: "2rem", fontWeight: 900, fontFamily: "Syne, sans-serif", color: getScoreColor(result.readinessScore), lineHeight: 1 }}>
              {result.readinessScore}%
            </div>
          </div>
        )}
      </div>

      {!result ? (
        <button
          onClick={handleGenerate}
          disabled={loading || questions.length === 0}
          className="btn-primary"
          style={{ width: "fit-content", display: "flex", alignItems: "center", gap: "0.5rem" }}
        >
          {loading ? (
            <><Loader2 size={14} className="animate-spin" /> Drafting STAR Answers...</>
          ) : (
            <><Star size={14} /> Build STAR Answers from Journal</>
          )}
        </button>
      ) : (
        <div style={{ display: "grid", gap: "1.2rem" }}>
          {/* Readiness Summary */}
          <div style={{ background: "rgba(255,255,255,0.02)", border: "1px solid var(--border)", borderRadius: "10px", padding: "1rem 1.2rem", display: "grid", gap: "0.8rem" }}>
            <p style={{ margin: 0, fontSize: "0.88rem", color: "var(--text)", lineHeight: 1.6 }}>
              {result.readinessSummary}
            </p>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1rem" }}>
              <div>
                <p style={{ margin: "0 0 0.4rem", fontSize: "0.78rem", fontWeight: 700, color: "#10b981" }}>
                  <CheckCircle2 size={12} style={{ display: "inline", marginRight: "0.3rem" }} />
                  Strong Areas
                </p>
                {result.strengthAreas.map((s, i) => (
                  <div key={i} style={{ fontSize: "0.8rem", color: "var(--text-muted)", padding: "0.2rem 0" }}>• {s}</div>
                ))}
              </div>
              <div>
                <p style={{ margin: "0 0 0.4rem", fontSize: "0.78rem", fontWeight: 700, color: "#f59e0b" }}>
                  <AlertTriangle size={12} style={{ display: "inline", marginRight: "0.3rem" }} />
                  To Strengthen
                </p>
                {result.improvementAreas.map((s, i) => (
                  <div key={i} style={{ fontSize: "0.8rem", color: "var(--text-muted)", padding: "0.2rem 0" }}>• {s}</div>
                ))}
              </div>
            </div>
          </div>

          {/* STAR Answers */}
          {result.starAnswers.map((qa, idx) => {
            const isExpanded = expandedIdx === idx;
            const displayType = qa.type || "general";
            const tagClass = typeColors[displayType.toLowerCase()] || "tag-purple";

            return (
              <div
                key={idx}
                style={{
                  border: "1px solid var(--border)",
                  borderRadius: "10px",
                  overflow: "hidden",
                  transition: "all 0.2s",
                }}
              >
                {/* Header */}
                <button
                  onClick={() => setExpandedIdx(isExpanded ? null : idx)}
                  style={{
                    width: "100%",
                    background: isExpanded ? "rgba(108,99,255,0.04)" : "rgba(255,255,255,0.01)",
                    border: "none",
                    padding: "1rem 1.2rem",
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "flex-start",
                    gap: "0.8rem",
                    cursor: "pointer",
                    textAlign: "left",
                  }}
                >
                  <div style={{ display: "flex", flexDirection: "column", gap: "0.4rem", flex: 1 }}>
                    <span style={{ fontSize: "0.92rem", fontWeight: 700, color: "var(--text)", lineHeight: 1.4 }}>
                      Q{idx + 1}: {qa.question}
                    </span>
                    <span className={`tag ${tagClass}`} style={{ fontSize: "0.65rem", textTransform: "capitalize", width: "fit-content" }}>
                      {displayType}
                    </span>
                  </div>
                  {isExpanded ? <ChevronDown size={18} className="text-gray-400" /> : <ChevronRight size={18} className="text-gray-400" />}
                </button>

                {/* STAR Content */}
                {isExpanded && (
                  <div style={{ padding: "0 1.2rem 1.2rem", display: "grid", gap: "1rem" }}>
                    {/* STAR breakdown */}
                    <div style={{ display: "grid", gap: "0.6rem" }}>
                      {[
                        { key: "S", label: "Situation", text: qa.situation, color: "#6c63ff" },
                        { key: "T", label: "Task", text: qa.task, color: "#3b82f6" },
                        { key: "A", label: "Action", text: qa.action, color: "#10b981" },
                        { key: "R", label: "Result", text: qa.result, color: "#f59e0b" },
                      ].map((part) => (
                        <div
                          key={part.key}
                          style={{
                            display: "flex",
                            gap: "0.8rem",
                            alignItems: "flex-start",
                            padding: "0.6rem 0.8rem",
                            borderRadius: "8px",
                            background: `${part.color}08`,
                            border: `1px solid ${part.color}20`,
                          }}
                        >
                          <span
                            style={{
                              fontSize: "0.75rem",
                              fontWeight: 900,
                              color: part.color,
                              background: `${part.color}15`,
                              padding: "0.15rem 0.45rem",
                              borderRadius: "4px",
                              flexShrink: 0,
                              fontFamily: "Syne, sans-serif",
                            }}
                          >
                            {part.key}
                          </span>
                          <div>
                            <span style={{ fontSize: "0.72rem", fontWeight: 700, color: part.color, display: "block", marginBottom: "0.2rem" }}>
                              {part.label}
                            </span>
                            <span style={{ fontSize: "0.85rem", color: "var(--text)", lineHeight: 1.6 }}>
                              {part.text}
                            </span>
                          </div>
                        </div>
                      ))}
                    </div>

                    {/* Full Answer */}
                    <div style={{ background: "rgba(108,99,255,0.04)", border: "1px solid rgba(108,99,255,0.15)", borderRadius: "8px", padding: "1rem" }}>
                      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "0.6rem" }}>
                        <span style={{ fontSize: "0.8rem", fontWeight: 700, color: "var(--accent)" }}>
                          Complete Answer (60-90 sec)
                        </span>
                        <button
                          onClick={() => handleCopy(qa.fullAnswer, idx)}
                          style={{ background: "none", border: "none", cursor: "pointer", color: copiedIdx === idx ? "#10b981" : "var(--text-muted)", display: "flex", alignItems: "center", gap: "0.3rem", fontSize: "0.78rem" }}
                        >
                          {copiedIdx === idx ? <><Check size={13} /> Copied!</> : <><Copy size={13} /> Copy</>}
                        </button>
                      </div>
                      <p style={{ margin: 0, fontSize: "0.88rem", color: "var(--text)", lineHeight: 1.7, fontStyle: "italic" }}>
                        {qa.fullAnswer}
                      </p>
                    </div>

                    {/* Evidence */}
                    {qa.journalEvidence && (
                      <div style={{ fontSize: "0.75rem", color: "var(--text-muted)", display: "flex", alignItems: "center", gap: "0.4rem" }}>
                        <Star size={11} className="text-amber-500" />
                        <span><strong>Source evidence:</strong> {qa.journalEvidence}</span>
                      </div>
                    )}
                  </div>
                )}
              </div>
            );
          })}

          <button
            onClick={handleGenerate}
            disabled={loading}
            className="btn-secondary"
            style={{ width: "fit-content", fontSize: "0.8rem" }}
          >
            {loading ? "Regenerating..." : "Regenerate All Answers"}
          </button>
        </div>
      )}
    </div>
  );
}
