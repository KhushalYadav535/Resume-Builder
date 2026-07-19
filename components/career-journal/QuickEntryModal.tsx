"use client";
import { useState } from "react";
import { X, Sparkles, AlertCircle, ChevronDown, Calendar } from "lucide-react";
import { CareerJournalEntry } from "@/types";

interface QuickEntryModalProps {
  onClose: () => void;
  onSave: (entry: Partial<CareerJournalEntry>) => Promise<void>;
  prefilledContent?: string;
  editEntry?: CareerJournalEntry | null;
}

const PROMPTS = [
  "What was the toughest problem you solved this week?",
  "What made your manager happiest recently?",
  "Did you learn a new skill or tool recently?",
  "Did you receive any praise or recognition?",
  "What project milestone did you hit this month?",
  "What would you highlight if updating your resume today?",
];

const ENTRY_TYPES = [
  { value: "win", label: "Win / Achievement" },
  { value: "feedback", label: "Client / Customer Appreciation" },
  { value: "skill", label: "New Skill / Tool Learned" },
  { value: "project", label: "Successful Project Completion" },
  { value: "certification", label: "Certification Earned" },
  { value: "promotion", label: "Promotion" },
  { value: "award", label: "Award / Recognition" },
  { value: "mentorship", label: "Mentored / Trained Someone" },
  { value: "impact", label: "Cost Savings / Revenue Impact" },
  { value: "publication", label: "Publication / Patent" },
  { value: "gap", label: "Gap / Setback" },
  { value: "other", label: "General Activity Log" },
];

export default function QuickEntryModal({ onClose, onSave, prefilledContent, editEntry }: QuickEntryModalProps) {
  const isEditing = !!editEntry;

  const [content, setContent] = useState(editEntry?.content || prefilledContent || "");
  const [entryType, setEntryType] = useState<CareerJournalEntry["entry_type"]>(editEntry?.entry_type || "win");
  const [tags, setTags] = useState((editEntry?.tags || []).join(", "));
  const [saving, setSaving] = useState(false);
  const [activePrompt, setActivePrompt] = useState(PROMPTS[0]);

  // Date for past entries
  const todayStr = new Date().toISOString().split("T")[0];
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

  const shufflePrompt = () => {
    const others = PROMPTS.filter((p) => p !== activePrompt);
    setActivePrompt(others[Math.floor(Math.random() * others.length)]);
  };

  const canSave = isGapEntry ? gapWhatHappened.trim().length > 0 : content.trim().length > 0;

  return (
    <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.5)", zIndex: 100, display: "flex", alignItems: "center", justifyContent: "center", padding: "1rem" }}>
      <div style={{ background: "var(--bg)", width: "100%", maxWidth: "600px", maxHeight: "90vh", overflowY: "auto", borderRadius: "16px", padding: "2rem", boxShadow: "0 20px 40px rgba(0,0,0,0.2)", position: "relative" }}>
        <button onClick={onClose} style={{ position: "absolute", top: "1.5rem", right: "1.5rem", background: "none", border: "none", cursor: "pointer", color: "var(--text-muted)" }}>
          <X size={24} />
        </button>

        <h2 style={{ fontFamily: "Syne, sans-serif", fontSize: "1.5rem", fontWeight: 800, marginBottom: "1.5rem" }}>
          {isEditing ? "Edit Journal Entry" : "Log Career Event"}
        </h2>

        <div style={{ display: "grid", gap: "1.2rem" }}>
          {/* Entry Type */}
          <div>
            <label style={{ display: "block", marginBottom: "0.5rem", fontSize: "0.9rem", fontWeight: 600 }}>Event Type</label>
            <div style={{ position: "relative" }}>
              <select
                className="input"
                value={entryType}
                onChange={(e) => setEntryType(e.target.value as any)}
                style={{ background: "var(--bg-elevated)", color: "var(--text)", border: "1px solid var(--border)", borderRadius: "8px", height: "42px", width: "100%", appearance: "none", paddingRight: "2rem" }}
              >
                {ENTRY_TYPES.map((t) => (
                  <option key={t.value} value={t.value}>{t.label}</option>
                ))}
              </select>
              <ChevronDown size={16} style={{ position: "absolute", right: "0.8rem", top: "50%", transform: "translateY(-50%)", color: "var(--text-muted)", pointerEvents: "none" }} />
            </div>
          </div>

          {/* Date Picker for past entries */}
          <div>
            <label style={{ display: "flex", alignItems: "center", gap: "0.4rem", marginBottom: "0.5rem", fontSize: "0.9rem", fontWeight: 600 }}>
              <Calendar size={14} style={{ color: "var(--accent)" }} />
              Date of Event
              <span style={{ fontSize: "0.75rem", color: "var(--text-muted)", fontWeight: 400 }}>(can be in the past)</span>
            </label>
            <input
              type="date"
              className="input"
              value={entryDate}
              max={todayStr}
              onChange={(e) => setEntryDate(e.target.value)}
              style={{ background: "var(--bg-elevated)", color: "var(--text)", border: "1px solid var(--border)", borderRadius: "8px", height: "42px", width: "100%", padding: "0 1rem" }}
            />
          </div>

          {/* Gap 3-Step Flow */}
          {isGapEntry ? (
            <div style={{ display: "grid", gap: "1rem" }}>
              <div style={{ background: "rgba(249, 115, 22, 0.05)", border: "1px solid rgba(249, 115, 22, 0.2)", borderRadius: "10px", padding: "1rem", display: "flex", gap: "0.8rem" }}>
                <AlertCircle size={20} className="text-orange-400" style={{ flexShrink: 0 }} />
                <p style={{ margin: 0, fontSize: "0.85rem", color: "var(--text-muted)", lineHeight: 1.5 }}>
                  <strong>Framing tip:</strong> Gaps are normal and can become strengths. These 3 prompts will help frame this constructively for interviews.
                </p>
              </div>

              <div>
                <label style={{ display: "block", marginBottom: "0.4rem", fontSize: "0.88rem", fontWeight: 600 }}>
                  <span style={{ color: "var(--accent)", marginRight: "0.4rem" }}>①</span>
                  What happened? (Brief, non-defensive)
                </label>
                <textarea
                  className="input"
                  rows={2}
                  placeholder="e.g. Laid off due to company-wide restructuring in Q3..."
                  value={gapWhatHappened}
                  onChange={(e) => setGapWhatHappened(e.target.value)}
                  style={{ background: "var(--bg-elevated)", color: "var(--text)", border: "1px solid var(--border)", borderRadius: "8px", padding: "0.8rem", width: "100%", resize: "vertical" }}
                />
              </div>

              <div>
                <label style={{ display: "block", marginBottom: "0.4rem", fontSize: "0.88rem", fontWeight: 600 }}>
                  <span style={{ color: "var(--accent)", marginRight: "0.4rem" }}>②</span>
                  What did you actively do during this time?
                </label>
                <textarea
                  className="input"
                  rows={2}
                  placeholder="e.g. Freelanced for two startups, completed an AWS certification..."
                  value={gapWhatYouDid}
                  onChange={(e) => setGapWhatYouDid(e.target.value)}
                  style={{ background: "var(--bg-elevated)", color: "var(--text)", border: "1px solid var(--border)", borderRadius: "8px", padding: "0.8rem", width: "100%", resize: "vertical" }}
                />
              </div>

              <div>
                <label style={{ display: "block", marginBottom: "0.4rem", fontSize: "0.88rem", fontWeight: 600 }}>
                  <span style={{ color: "var(--accent)", marginRight: "0.4rem" }}>③</span>
                  What did you learn or gain? (Optional)
                </label>
                <textarea
                  className="input"
                  rows={2}
                  placeholder="e.g. Deepened my cloud skills, built resilience, redefined my career focus..."
                  value={gapWhatYouLearned}
                  onChange={(e) => setGapWhatYouLearned(e.target.value)}
                  style={{ background: "var(--bg-elevated)", color: "var(--text)", border: "1px solid var(--border)", borderRadius: "8px", padding: "0.8rem", width: "100%", resize: "vertical" }}
                />
              </div>
            </div>
          ) : (
            <>
              {/* Guided Prompt — only for new entries */}
              {!isEditing && (
                <div style={{ background: "rgba(108, 99, 255, 0.05)", border: "1px solid rgba(108, 99, 255, 0.2)", borderRadius: "12px", padding: "1rem", display: "flex", gap: "1rem", alignItems: "flex-start" }}>
                  <Sparkles size={20} className="text-purple-500" style={{ marginTop: "2px", flexShrink: 0 }} />
                  <div style={{ flex: 1 }}>
                    <p style={{ margin: "0 0 0.5rem", fontSize: "0.9rem", color: "var(--text)", fontWeight: 600 }}>Guided Prompt</p>
                    <p style={{ margin: 0, fontSize: "0.95rem", color: "var(--text-muted)", fontStyle: "italic" }}>"{activePrompt}"</p>
                  </div>
                  <button onClick={shufflePrompt} style={{ background: "none", border: "none", color: "var(--accent)", fontSize: "0.8rem", cursor: "pointer", fontWeight: 600, flexShrink: 0 }}>Refresh</button>
                </div>
              )}

              {/* Content */}
              <div>
                <label style={{ display: "block", marginBottom: "0.5rem", fontSize: "0.9rem", fontWeight: 600 }}>What happened?</label>
                <textarea
                  className="input"
                  rows={5}
                  placeholder="e.g. Led the Q3 release which reduced load times by 20%..."
                  value={content}
                  onChange={(e) => setContent(e.target.value)}
                  style={{ background: "var(--bg-elevated)", color: "var(--text)", border: "1px solid var(--border)", borderRadius: "8px", padding: "1rem", width: "100%", resize: "vertical" }}
                />
              </div>
            </>
          )}

          {/* Tags */}
          <div>
            <label style={{ display: "block", marginBottom: "0.5rem", fontSize: "0.9rem", fontWeight: 600 }}>Tags (comma separated)</label>
            <input
              type="text"
              className="input"
              placeholder="e.g. React, Leadership, Performance"
              value={tags}
              onChange={(e) => setTags(e.target.value)}
              style={{ background: "var(--bg-elevated)", color: "var(--text)", border: "1px solid var(--border)", borderRadius: "8px", height: "42px", width: "100%", padding: "0 1rem" }}
            />
          </div>

          <div style={{ display: "flex", justifyContent: "flex-end", gap: "1rem", marginTop: "1rem" }}>
            <button onClick={onClose} className="btn-secondary">Cancel</button>
            <button onClick={handleSave} disabled={saving || !canSave} className="btn-primary" style={{ minWidth: "120px" }}>
              {saving ? "Saving..." : isEditing ? "Update Entry" : "Save Entry"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
