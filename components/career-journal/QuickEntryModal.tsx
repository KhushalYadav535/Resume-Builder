"use client";
import { useState, useEffect, useCallback } from "react";
import { X, Sparkles, AlertCircle, ChevronDown, Calendar, Hash, Save, RefreshCw, Award, Zap, Briefcase, TrendingUp, Check, ArrowRight } from "lucide-react";
import { CareerJournalEntry } from "@/types";

interface QuickEntryModalProps {
  onClose: () => void;
  onSave: (entry: Partial<CareerJournalEntry>) => Promise<void>;
  prefilledContent?: string;
  editEntry?: CareerJournalEntry | null;
}

const PROMPTS = [
  "What tangible outcome or metric improved because of your work this week?",
  "Did your manager, client, or peer recognize a deliverable recently?",
  "What new technical capability or domain skill did you put into practice?",
  "What roadblock did you clear that unblocked a project or team?",
  "What is the single most valuable achievement you want remembered in your next review?",
  "Did you lead, mentor, or improve a process that made work easier for others?",
];

type DimensionType = "achieve" | "develop" | "evidence" | "resilience" | "other";

const DIMENSIONS: { id: DimensionType; label: string; icon: any; color: string; desc: string }[] = [
  { id: "achieve", label: "Achieve", icon: Award, color: "var(--brand-amber, #F59E0B)", desc: "Wins, Impact & Milestones" },
  { id: "develop", label: "Develop", icon: Zap, color: "var(--uprole-teal, #14B8A6)", desc: "Skills & Capabilities" },
  { id: "evidence", label: "Evidence", icon: Briefcase, color: "var(--uprole-blue, #2563EB)", desc: "Praise, Proof & Projects" },
  { id: "resilience", label: "Resilience", icon: TrendingUp, color: "#F97316", desc: "Turn Setbacks into Growth" },
];

const ENTRY_TYPES = [
  { value: "win", label: "Win / Tangible Outcome", emoji: "🏆", dimension: "achieve" },
  { value: "impact", label: "Revenue / Cost / Efficiency Impact", emoji: "💰", dimension: "achieve" },
  { value: "promotion", label: "Promotion / Title Milestone", emoji: "📈", dimension: "achieve" },
  { value: "award", label: "Award / Formal Recognition", emoji: "🏅", dimension: "achieve" },
  
  { value: "skill", label: "New Skill / Capability Acquired", emoji: "⚡", dimension: "develop" },
  { value: "certification", label: "Certification / Credential", emoji: "📜", dimension: "develop" },
  { value: "mentorship", label: "Mentored / Trained Others", emoji: "🤝", dimension: "develop" },

  { value: "feedback", label: "Client / Manager Praise", emoji: "💬", dimension: "evidence" },
  { value: "project", label: "Successful Project Shipped", emoji: "🚀", dimension: "evidence" },
  { value: "publication", label: "Publication / Architecture Spec", emoji: "📖", dimension: "evidence" },

  { value: "gap", label: "Setback / Growth Moment", emoji: "🔄", dimension: "resilience" },
  { value: "other", label: "General Career Activity", emoji: "📋", dimension: "other" },
];

const SUGGESTED_TAGS: Record<DimensionType, string[]> = {
  achieve: ["CostSavings", "RevenueGrowth", "Efficiency", "Leadership", "Milestone", "Scaling"],
  develop: ["SystemDesign", "React", "NextJS", "CloudArchitecture", "Python", "Mentorship"],
  evidence: ["ClientPraise", "PeerReview", "CustomerSuccess", "ShippedFeature", "StakeholderTrust"],
  resilience: ["ProblemSolving", "Resilience", "RootCauseAnalysis", "ContinuousLearning"],
  other: ["ProcessImprovement", "CrossFunctional", "Documentation"],
};

export default function QuickEntryModal({ onClose, onSave, prefilledContent, editEntry }: QuickEntryModalProps) {
  const isEditing = !!editEntry;

  const [content, setContent] = useState(editEntry?.content || prefilledContent || "");
  const [entryType, setEntryType] = useState<CareerJournalEntry["entry_type"]>(editEntry?.entry_type || "win");
  const [tags, setTags] = useState((editEntry?.tags || []).join(", "));
  const [saving, setSaving] = useState(false);
  const [boosting, setBoosting] = useState(false);
  const [boostSuccess, setBoostSuccess] = useState(false);
  const [activePrompt, setActivePrompt] = useState(PROMPTS[0]);

  // Date for entries
  const todayStr = new Date().toISOString().split("T")[0];
  const yesterdayStr = new Date(Date.now() - 86400000).toISOString().split("T")[0];
  const [entryDate, setEntryDate] = useState<string>(
    editEntry?.date ? new Date(editEntry.date).toISOString().split("T")[0] : todayStr
  );

  // Gap 3-step fields
  const [gapWhatHappened, setGapWhatHappened] = useState(
    editEntry?.entry_type === "gap" ? editEntry.content.split("What I did:")[0].replace("What happened:", "").trim() : ""
  );
  const [gapWhatYouDid, setGapWhatYouDid] = useState("");
  const [gapWhatYouLearned, setGapWhatYouLearned] = useState("");

  const isGapEntry = entryType === "gap";

  // Determine active dimension from entryType
  const currentDimension: DimensionType = (
    ENTRY_TYPES.find((t) => t.value === entryType)?.dimension as DimensionType
  ) || "achieve";

  // Escape key handler
  const handleEscape = useCallback((e: KeyboardEvent) => {
    if (e.key === "Escape") onClose();
  }, [onClose]);

  useEffect(() => {
    document.addEventListener("keydown", handleEscape);
    return () => document.removeEventListener("keydown", handleEscape);
  }, [handleEscape]);

  const handleSave = async () => {
    let finalContent = content.trim();

    if (isGapEntry) {
      if (!gapWhatHappened.trim()) return;
      finalContent = [
        gapWhatHappened.trim() && `What happened: ${gapWhatHappened.trim()}`,
        gapWhatYouDid.trim() && `What I did: ${gapWhatYouDid.trim()}`,
        gapWhatYouLearned.trim() && `What I learned: ${gapWhatYouLearned.trim()}`,
      ]
        .filter(Boolean)
        .join("\n");
    }

    if (!finalContent) return;
    setSaving(true);
    await onSave({
      id: editEntry?.id,
      content: finalContent,
      entry_type: entryType,
      tags: tags.split(",").map((t) => t.trim()).filter(Boolean),
      source: "manual",
      date: entryDate,
    });
    setSaving(false);
    onClose();
  };

  const handleAIBoost = async () => {
    if (!content.trim()) return;
    setBoosting(true);
    setBoostSuccess(false);

    try {
      const res = await fetch("/api/journal/boost", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ content: content.trim(), entry_type: entryType }),
      });

      if (res.ok) {
        const data = await res.json();
        if (data.enhancedContent) {
          setContent(data.enhancedContent);
        }
        if (data.suggestedTags && data.suggestedTags.length > 0) {
          const currentTagList = tags.split(",").map((t) => t.trim()).filter(Boolean);
          const combined = Array.from(new Set([...currentTagList, ...data.suggestedTags]));
          setTags(combined.join(", "));
        }
        setBoostSuccess(true);
        setTimeout(() => setBoostSuccess(false), 3000);
      }
    } catch (err) {
      console.error("AI Boost failed:", err);
    } finally {
      setBoosting(false);
    }
  };

  const addTag = (tagToAdd: string) => {
    const currentList = tags.split(",").map((t) => t.trim()).filter(Boolean);
    if (!currentList.includes(tagToAdd)) {
      const updated = [...currentList, tagToAdd];
      setTags(updated.join(", "));
    }
  };

  const shufflePrompt = () => {
    const others = PROMPTS.filter((p) => p !== activePrompt);
    setActivePrompt(others[Math.floor(Math.random() * others.length)]);
  };

  const canSave = isGapEntry ? gapWhatHappened.trim().length > 0 : content.trim().length > 0;
  const selectedType = ENTRY_TYPES.find((t) => t.value === entryType);

  return (
    <div
      className="journal-modal-backdrop"
      onClick={(e) => e.target === e.currentTarget && onClose()}
    >
      <div className="journal-modal">
        {/* Close Button */}
        <button
          onClick={onClose}
          aria-label="Close modal"
          style={{
            position: "absolute",
            top: "1.25rem",
            right: "1.25rem",
            background: "var(--bg-elevated)",
            border: "1px solid var(--border)",
            borderRadius: "10px",
            width: 36,
            height: 36,
            cursor: "pointer",
            color: "var(--text-muted)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            transition: "all 0.2s",
          }}
        >
          <X size={18} />
        </button>

        {/* Header */}
        <div style={{ marginBottom: "1.5rem" }}>
          <div style={{ display: "flex", alignItems: "center", gap: "0.6rem", marginBottom: "0.3rem" }}>
            <span style={{ fontSize: "1.6rem" }}>{selectedType?.emoji || "📝"}</span>
            <h2 style={{
              fontFamily: "Syne, sans-serif",
              fontSize: "1.45rem",
              fontWeight: 800,
              margin: 0,
              background: "linear-gradient(135deg, var(--text-primary) 0%, var(--text-secondary) 100%)",
              WebkitBackgroundClip: "text",
              WebkitTextFillColor: "transparent",
            }}>
              {isEditing ? "Edit Career Event" : "Log Career Event"}
            </h2>
          </div>
          <p style={{ margin: 0, fontSize: "0.85rem", color: "var(--text-muted)", paddingLeft: "2.3rem", lineHeight: 1.4 }}>
            {isEditing
              ? "Refine your documented achievement and evidence."
              : "Capture what changed, the evidence behind it, and the capability demonstrated."}
          </p>
        </div>

        <div style={{ display: "grid", gap: "1.25rem" }}>
          {/* Dimension Selector Tabs */}
          <div>
            <label style={{
              display: "block",
              marginBottom: "0.45rem",
              fontSize: "0.78rem",
              fontWeight: 700,
              color: "var(--text-muted)",
              textTransform: "uppercase",
              letterSpacing: "0.6px",
            }}>
              Core Product Dimension
            </label>
            <div style={{
              display: "grid",
              gridTemplateColumns: "repeat(4, 1fr)",
              gap: "0.45rem",
            }}>
              {DIMENSIONS.map((dim) => {
                const isSelected = currentDimension === dim.id;
                const IconComponent = dim.icon;
                return (
                  <button
                    key={dim.id}
                    type="button"
                    onClick={() => {
                      const firstType = ENTRY_TYPES.find((t) => t.dimension === dim.id);
                      if (firstType) setEntryType(firstType.value as any);
                    }}
                    style={{
                      padding: "0.6rem 0.4rem",
                      borderRadius: "12px",
                      border: isSelected ? `2px solid ${dim.color}` : "1px solid var(--border)",
                      background: isSelected ? "var(--bg-elevated)" : "rgba(16, 27, 59, 0.02)",
                      display: "flex",
                      flexDirection: "column",
                      alignItems: "center",
                      gap: "0.25rem",
                      cursor: "pointer",
                      transition: "all 0.2s",
                      boxShadow: isSelected ? `0 4px 12px ${dim.color}25` : "none",
                    }}
                  >
                    <IconComponent size={16} style={{ color: dim.color }} />
                    <span style={{
                      fontSize: "0.76rem",
                      fontWeight: isSelected ? 700 : 500,
                      color: isSelected ? "var(--text-primary)" : "var(--text-muted)",
                    }}>
                      {dim.label}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Specific Event Type Picker */}
          <div>
            <label style={{
              display: "block",
              marginBottom: "0.45rem",
              fontSize: "0.78rem",
              fontWeight: 700,
              color: "var(--text-muted)",
              textTransform: "uppercase",
              letterSpacing: "0.6px",
            }}>
              Specific Event Type
            </label>
            <div style={{ position: "relative" }}>
              <select
                className="journal-input"
                value={entryType}
                onChange={(e) => setEntryType(e.target.value as any)}
                style={{
                  height: "44px",
                  width: "100%",
                  appearance: "none",
                  paddingRight: "2.5rem",
                  paddingLeft: "1rem",
                  fontSize: "0.88rem",
                  cursor: "pointer",
                }}
              >
                {ENTRY_TYPES.map((t) => (
                  <option key={t.value} value={t.value}>
                    {t.emoji} {t.label}
                  </option>
                ))}
              </select>
              <ChevronDown size={16} style={{
                position: "absolute",
                right: "1rem",
                top: "50%",
                transform: "translateY(-50%)",
                color: "var(--text-muted)",
                pointerEvents: "none",
              }} />
            </div>
          </div>

          {/* Date Picker & Quick Presets */}
          <div>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "0.45rem" }}>
              <label style={{
                display: "flex",
                alignItems: "center",
                gap: "0.35rem",
                fontSize: "0.78rem",
                fontWeight: 700,
                color: "var(--text-muted)",
                textTransform: "uppercase",
                letterSpacing: "0.6px",
              }}>
                <Calendar size={13} style={{ color: "var(--accent)" }} />
                Date of Event
              </label>
              <div style={{ display: "flex", gap: "0.3rem" }}>
                <button
                  type="button"
                  onClick={() => setEntryDate(todayStr)}
                  style={{
                    background: entryDate === todayStr ? "rgba(245, 158, 11, 0.12)" : "transparent",
                    color: entryDate === todayStr ? "var(--accent)" : "var(--text-muted)",
                    border: "none",
                    borderRadius: "6px",
                    padding: "0.15rem 0.5rem",
                    fontSize: "0.72rem",
                    fontWeight: 600,
                    cursor: "pointer",
                  }}
                >
                  Today
                </button>
                <button
                  type="button"
                  onClick={() => setEntryDate(yesterdayStr)}
                  style={{
                    background: entryDate === yesterdayStr ? "rgba(245, 158, 11, 0.12)" : "transparent",
                    color: entryDate === yesterdayStr ? "var(--accent)" : "var(--text-muted)",
                    border: "none",
                    borderRadius: "6px",
                    padding: "0.15rem 0.5rem",
                    fontSize: "0.72rem",
                    fontWeight: 600,
                    cursor: "pointer",
                  }}
                >
                  Yesterday
                </button>
              </div>
            </div>
            <input
              type="date"
              className="journal-input"
              value={entryDate}
              max={todayStr}
              onChange={(e) => setEntryDate(e.target.value)}
              style={{
                height: "44px",
                width: "100%",
                padding: "0 1rem",
                fontSize: "0.88rem",
              }}
            />
          </div>

          {/* Gap 3-Step Flow */}
          {isGapEntry ? (
            <div style={{ display: "grid", gap: "0.9rem" }}>
              <div style={{
                background: "rgba(249, 115, 22, 0.06)",
                border: "1px solid rgba(249, 115, 22, 0.2)",
                borderRadius: "14px",
                padding: "0.9rem 1.1rem",
                display: "flex",
                gap: "0.75rem",
              }}>
                <AlertCircle size={18} style={{ color: "#f97316", flexShrink: 0, marginTop: 2 }} />
                <p style={{ margin: 0, fontSize: "0.82rem", color: "var(--text-secondary)", lineHeight: 1.5 }}>
                  <strong style={{ color: "var(--text-primary)" }}>UpRole Resilience Framing:</strong> Career setbacks and gaps happen to every high-performing professional. Framing what you actively did and learned builds authentic self-efficacy and credibility.
                </p>
              </div>

              {[
                { num: "1", label: "What happened? (Brief, objective, non-defensive)", placeholder: "e.g. Org restructuring in Q3 impacted team roadmap...", value: gapWhatHappened, onChange: setGapWhatHappened },
                { num: "2", label: "What did you actively do during this time?", placeholder: "e.g. Completed AWS Solution Architect training, freelanced for a startup...", value: gapWhatYouDid, onChange: setGapWhatYouDid },
                { num: "3", label: "What did you learn or gain?", placeholder: "e.g. Deepened cloud infrastructure skills, strengthened execution resilience...", value: gapWhatYouLearned, onChange: setGapWhatYouLearned },
              ].map((step) => (
                <div key={step.num}>
                  <label style={{
                    display: "block",
                    marginBottom: "0.35rem",
                    fontSize: "0.84rem",
                    fontWeight: 600,
                  }}>
                    <span style={{
                      display: "inline-flex",
                      width: 18,
                      height: 18,
                      borderRadius: "50%",
                      background: "rgba(249, 115, 22, 0.15)",
                      color: "#f97316",
                      fontSize: "0.7rem",
                      fontWeight: 700,
                      alignItems: "center",
                      justifyContent: "center",
                      marginRight: "0.4rem",
                    }}>
                      {step.num}
                    </span>
                    {step.label}
                  </label>
                  <textarea
                    className="journal-input"
                    rows={2}
                    placeholder={step.placeholder}
                    value={step.value}
                    onChange={(e) => step.onChange(e.target.value)}
                    style={{ padding: "0.7rem 0.9rem", width: "100%", resize: "vertical", fontSize: "0.86rem" }}
                  />
                </div>
              ))}
            </div>
          ) : (
            <>
              {/* Guided Inspiration Prompt — only for new entries */}
              {!isEditing && (
                <div style={{
                  background: "linear-gradient(135deg, rgba(124, 58, 237, 0.06), rgba(37, 99, 235, 0.04))",
                  border: "1px solid rgba(124, 58, 237, 0.15)",
                  borderRadius: "14px",
                  padding: "0.9rem 1.1rem",
                  display: "flex",
                  gap: "0.85rem",
                  alignItems: "flex-start",
                }}>
                  <div style={{
                    width: 30,
                    height: 30,
                    borderRadius: "8px",
                    background: "rgba(124, 58, 237, 0.1)",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    flexShrink: 0,
                  }}>
                    <Sparkles size={15} style={{ color: "#7c3aed" }} />
                  </div>
                  <div style={{ flex: 1 }}>
                    <p style={{ margin: "0 0 0.25rem", fontSize: "0.72rem", color: "var(--text-muted)", fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.5px" }}>
                      Guided Reflection Prompt
                    </p>
                    <p style={{
                      margin: 0,
                      color: "var(--text-primary)",
                      fontStyle: "italic",
                      lineHeight: 1.45,
                      fontSize: "0.9rem",
                    }}>
                      &ldquo;{activePrompt}&rdquo;
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={shufflePrompt}
                    style={{
                      background: "rgba(124, 58, 237, 0.08)",
                      border: "none",
                      borderRadius: "8px",
                      width: 30,
                      height: 30,
                      cursor: "pointer",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      color: "#7c3aed",
                      flexShrink: 0,
                      transition: "all 0.2s",
                    }}
                    title="Try another prompt"
                  >
                    <RefreshCw size={13} />
                  </button>
                </div>
              )}

              {/* Content Textarea & AI Impact Booster */}
              <div>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "0.45rem" }}>
                  <label style={{
                    fontSize: "0.78rem",
                    fontWeight: 700,
                    color: "var(--text-muted)",
                    textTransform: "uppercase",
                    letterSpacing: "0.6px",
                  }}>
                    What changed & what was the impact?
                  </label>

                  {/* AI Impact Polish Button */}
                  <button
                    type="button"
                    onClick={handleAIBoost}
                    disabled={boosting || !content.trim()}
                    style={{
                      display: "inline-flex",
                      alignItems: "center",
                      gap: "0.35rem",
                      background: boostSuccess
                        ? "rgba(16, 185, 129, 0.12)"
                        : "linear-gradient(135deg, rgba(124, 58, 237, 0.12), rgba(37, 99, 235, 0.08))",
                      color: boostSuccess ? "#10B981" : "#7C3AED",
                      border: "1px solid",
                      borderColor: boostSuccess ? "rgba(16, 185, 129, 0.3)" : "rgba(124, 58, 237, 0.25)",
                      borderRadius: "8px",
                      padding: "0.25rem 0.65rem",
                      fontSize: "0.75rem",
                      fontWeight: 700,
                      cursor: boosting || !content.trim() ? "not-allowed" : "pointer",
                      opacity: !content.trim() ? 0.6 : 1,
                      transition: "all 0.2s",
                    }}
                    title="Use UpRole AI to polish your draft into a quantified, high-impact bullet"
                  >
                    {boosting ? (
                      <>
                        <div className="spinner" style={{ width: 12, height: 12 }} />
                        Polishing...
                      </>
                    ) : boostSuccess ? (
                      <>
                        <Check size={12} />
                        Impact Polished!
                      </>
                    ) : (
                      <>
                        <Sparkles size={12} />
                        AI Impact Booster
                      </>
                    )}
                  </button>
                </div>

                <textarea
                  className="journal-input"
                  rows={4}
                  placeholder="e.g. Led migration of search infrastructure, cutting query latency by 35% and saving ~$12K in annual cloud costs..."
                  value={content}
                  onChange={(e) => setContent(e.target.value)}
                  style={{
                    padding: "0.9rem 1rem",
                    width: "100%",
                    resize: "vertical",
                    fontSize: "0.88rem",
                    lineHeight: 1.55,
                  }}
                />
              </div>
            </>
          )}

          {/* Tags & Smart Suggestions */}
          <div>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "0.45rem" }}>
              <label style={{
                display: "flex",
                alignItems: "center",
                gap: "0.35rem",
                fontSize: "0.78rem",
                fontWeight: 700,
                color: "var(--text-muted)",
                textTransform: "uppercase",
                letterSpacing: "0.6px",
              }}>
                <Hash size={13} style={{ color: "var(--uprole-purple, #7C3AED)" }} />
                Capability & Impact Tags
              </label>
            </div>

            <input
              type="text"
              className="journal-input"
              placeholder="e.g. React, Leadership, Performance, CostSavings"
              value={tags}
              onChange={(e) => setTags(e.target.value)}
              style={{
                height: "44px",
                width: "100%",
                padding: "0 1rem",
                fontSize: "0.88rem",
              }}
            />

            {/* Smart Suggested Tag Pills */}
            <div style={{ display: "flex", gap: "0.35rem", flexWrap: "wrap", marginTop: "0.5rem" }}>
              <span style={{ fontSize: "0.72rem", color: "var(--text-muted)", alignSelf: "center", marginRight: "0.2rem" }}>
                Suggested:
              </span>
              {(SUGGESTED_TAGS[currentDimension] || []).map((t) => (
                <button
                  key={t}
                  type="button"
                  onClick={() => addTag(t)}
                  style={{
                    background: "rgba(16, 27, 59, 0.04)",
                    border: "1px solid var(--border)",
                    borderRadius: "999px",
                    padding: "0.18rem 0.55rem",
                    fontSize: "0.72rem",
                    color: "var(--text-secondary)",
                    cursor: "pointer",
                    transition: "all 0.15s",
                  }}
                >
                  +{t}
                </button>
              ))}
            </div>
          </div>

          {/* Actions */}
          <div style={{
            display: "flex",
            justifyContent: "flex-end",
            gap: "0.8rem",
            marginTop: "0.4rem",
            paddingTop: "1rem",
            borderTop: "1px solid var(--border)",
          }}>
            <button
              type="button"
              onClick={onClose}
              className="btn-secondary"
              style={{
                borderRadius: "12px",
                padding: "0.65rem 1.4rem",
                fontSize: "0.86rem",
              }}
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={handleSave}
              disabled={saving || !canSave}
              className="btn-primary journal-cta-glow"
              style={{
                minWidth: "150px",
                borderRadius: "12px",
                padding: "0.65rem 1.6rem",
                fontSize: "0.88rem",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                gap: "0.45rem",
              }}
            >
              {saving ? (
                <span style={{ display: "flex", alignItems: "center", gap: "0.4rem" }}>
                  <div className="spinner" style={{ width: 15, height: 15 }} />
                  Saving...
                </span>
              ) : (
                <>
                  <Save size={15} />
                  {isEditing ? "Update Career Event" : "Save to Career Journal"}
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
