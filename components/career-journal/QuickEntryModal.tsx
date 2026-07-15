"use client";
import { useState } from "react";
import { X, Sparkles, AlertCircle } from "lucide-react";
import { CareerJournalEntry } from "@/types";

interface QuickEntryModalProps {
  onClose: () => void;
  onSave: (entry: Partial<CareerJournalEntry>) => Promise<void>;
  prefilledContent?: string;
}

const PROMPTS = [
  "What was the toughest problem you solved this week?",
  "What made your manager happiest recently?",
  "Did you learn a new skill or tool recently?",
  "Did you receive any praise or recognition?",
];

export default function QuickEntryModal({ onClose, onSave, prefilledContent }: QuickEntryModalProps) {
  const [content, setContent] = useState(prefilledContent || "");
  const [entryType, setEntryType] = useState<CareerJournalEntry["entry_type"]>("win");
  const [tags, setTags] = useState("");
  const [saving, setSaving] = useState(false);
  const [activePrompt, setActivePrompt] = useState(PROMPTS[0]);

  const handleSave = async () => {
    if (!content.trim()) return;
    setSaving(true);
    await onSave({
      content,
      entry_type: entryType,
      tags: tags.split(",").map(t => t.trim()).filter(Boolean),
      source: "manual",
    });
    setSaving(false);
    onClose();
  };

  const shufflePrompt = () => {
    const next = PROMPTS[Math.floor(Math.random() * PROMPTS.length)];
    setActivePrompt(next);
  };

  return (
    <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.5)", zIndex: 100, display: "flex", alignItems: "center", justifyContent: "center", padding: "1rem" }}>
      <div style={{ background: "var(--bg)", width: "100%", maxWidth: "600px", maxHeight: "90vh", overflowY: "auto", borderRadius: "16px", padding: "2rem", boxShadow: "0 20px 40px rgba(0,0,0,0.2)", position: "relative" }}>
        <button onClick={onClose} style={{ position: "absolute", top: "1.5rem", right: "1.5rem", background: "none", border: "none", cursor: "pointer", color: "var(--text-muted)" }}>
          <X size={24} />
        </button>

        <h2 style={{ fontFamily: "Syne, sans-serif", fontSize: "1.5rem", fontWeight: 800, marginBottom: "1.5rem" }}>Log Career Event</h2>

        {/* Guided Prompt */}
        <div style={{ background: "rgba(108, 99, 255, 0.05)", border: "1px solid rgba(108, 99, 255, 0.2)", borderRadius: "12px", padding: "1rem", marginBottom: "1.5rem", display: "flex", gap: "1rem", alignItems: "flex-start" }}>
          <Sparkles size={20} className="text-purple-500" style={{ marginTop: "2px", flexShrink: 0 }} />
          <div style={{ flex: 1 }}>
            <p style={{ margin: "0 0 0.5rem", fontSize: "0.9rem", color: "var(--text)", fontWeight: 600 }}>Guided Prompt</p>
            <p style={{ margin: 0, fontSize: "0.95rem", color: "var(--text-muted)", fontStyle: "italic" }}>"{activePrompt}"</p>
          </div>
          <button onClick={shufflePrompt} style={{ background: "none", border: "none", color: "var(--accent)", fontSize: "0.8rem", cursor: "pointer", fontWeight: 600 }}>Refresh</button>
        </div>

        <div style={{ display: "grid", gap: "1.2rem" }}>
          <div>
            <label style={{ display: "block", marginBottom: "0.5rem", fontSize: "0.9rem", fontWeight: 600 }}>Event Type</label>
            <select
              className="input"
              value={entryType}
              onChange={(e) => setEntryType(e.target.value as any)}
              style={{ background: "var(--bg-elevated)", color: "var(--text)", border: "1px solid var(--border)", borderRadius: "8px", height: "42px", width: "100%" }}
            >
              <option value="win">Win / Achievement</option>
              <option value="feedback">Feedback / Praise</option>
              <option value="skill">Skill Learned</option>
              <option value="project">Project Completed</option>
              <option value="certification">Certification</option>
              <option value="promotion">Promotion</option>
              <option value="gap">Gap / Setback</option>
              <option value="other">Other</option>
            </select>
          </div>

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

          {entryType === "gap" && (
            <div style={{ background: "rgba(239, 68, 68, 0.05)", border: "1px solid rgba(239, 68, 68, 0.2)", borderRadius: "8px", padding: "1rem", display: "flex", gap: "0.8rem" }}>
              <AlertCircle size={20} className="text-red-500" style={{ flexShrink: 0 }} />
              <p style={{ margin: 0, fontSize: "0.85rem", color: "var(--text-muted)" }}>
                <strong>Tip for logging setbacks:</strong> Focus on what happened, what you did in response, and what you learned. This makes it easier to frame positively later.
              </p>
            </div>
          )}

          <div>
            <label style={{ display: "block", marginBottom: "0.5rem", fontSize: "0.9rem", fontWeight: 600 }}>Tags (Comma separated)</label>
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
            <button onClick={handleSave} disabled={saving || !content.trim()} className="btn-primary" style={{ minWidth: "120px" }}>
              {saving ? "Saving..." : "Save Entry"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
