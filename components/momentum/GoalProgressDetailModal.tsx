"use client";

import React, { useState, useEffect } from "react";
import { GoalMilestone, CareerGoal, GoalStage, ProgressSource } from "@/types/momentum";
import { X, Award, CheckCircle2, ArrowRight, BookOpen, Plus } from "lucide-react";
import Link from "next/link";

interface GoalProgressDetailModalProps {
  isOpen: boolean;
  onClose: () => void;
  goal: CareerGoal | null;
  milestones: GoalMilestone[];
  onToggleMilestone: (id: string) => void;
  onAddMilestone?: (title: string, stage: GoalStage, sourceType?: ProgressSource) => void;
}

const PROGRESS_SOURCES: ProgressSource[] = [
  "Capability development",
  "Evidence captured",
  "Opportunity discovered",
  "Career Event",
  "Learning",
  "Application",
  "Interview",
  "Networking",
  "Recognition",
  "Promotion",
  "Compensation change",
  "New responsibility",
  "Career Outcome",
];

export default function GoalProgressDetailModal({
  isOpen,
  onClose,
  goal,
  milestones,
  onToggleMilestone,
  onAddMilestone,
}: GoalProgressDetailModalProps) {
  const [newTitle, setNewTitle] = useState("");
  const [newStage, setNewStage] = useState<GoalStage>("strategy");
  const [newSourceType, setNewSourceType] = useState<ProgressSource>("Capability development");
  const [isAdding, setIsAdding] = useState(false);

  useEffect(() => {
    if (!isOpen) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const completedCount = (milestones || []).filter((m) => m.completed).length;

  const handleCreateMilestone = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle.trim()) return;
    if (onAddMilestone) {
      onAddMilestone(newTitle.trim(), newStage, newSourceType);
      setNewTitle("");
      setIsAdding(false);
    }
  };

  return (
    <div
      className="fixed inset-0 z-[150] overflow-y-auto p-4 sm:p-6 flex items-center justify-center bg-black/75 backdrop-blur-md animate-fade-in"
      onClick={onClose}
    >
      <div
        className="relative w-full max-w-xl my-auto bg-[var(--card)] border border-[var(--border)] rounded-3xl shadow-2xl flex flex-col max-h-[85vh] overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Pinned Header */}
        <div className="px-6 py-5 border-b border-[var(--border)] flex items-center justify-between shrink-0 bg-[var(--card)]">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-teal-500/10 border border-teal-500/20 flex items-center justify-center shrink-0">
              <Award size={18} className="text-teal-500" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-[var(--text-primary)] font-['Syne',sans-serif] leading-tight">
                Meaningful Progress Detail
              </h3>
              <p className="text-[11px] text-[var(--text-muted)] mt-0.5">
                Career milestone verification sequence
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-xl text-[var(--text-muted)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-elevated)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-teal-500 transition-colors"
            aria-label="Close modal"
          >
            <X size={18} />
          </button>
        </div>

        {/* Scrollable Body */}
        <div className="p-6 overflow-y-auto flex-1 min-h-0 space-y-5">
          <div className="p-4 rounded-2xl bg-[var(--bg-elevated)] border border-[var(--border)]">
            <div className="text-[10px] font-bold uppercase tracking-wider text-[var(--text-muted)]">
              Active Target Goal
            </div>
            <h4 className="text-lg font-bold text-[var(--text-primary)] mt-0.5">
              {goal?.title || "Career Goal"}
            </h4>
            <p className="text-xs text-[var(--text-secondary)] mt-1 leading-relaxed">
              Progress is derived from career milestone completion and real advancement events, not an artificial profile completion score.
            </p>
          </div>

        {/* Milestone Tracker list */}
        <div className="space-y-3">
          <div className="flex items-center justify-between text-xs font-semibold">
            <span className="text-[var(--text-muted)]">Milestone Sequence</span>
            <span className="text-teal-600 dark:text-teal-400 font-bold">
              {completedCount} of {(milestones || []).length} Cleared
            </span>
          </div>

          <div className="space-y-2">
            {(milestones || []).map((m) => (
              <div
                key={m.id}
                onClick={() => onToggleMilestone(m.id)}
                className={`p-3.5 rounded-xl border cursor-pointer transition-all flex items-start gap-3 ${
                  m.completed
                    ? "bg-teal-500/10 border-teal-500/30 text-[var(--text-primary)]"
                    : "bg-[var(--bg-elevated)] border-[var(--border)] text-[var(--text-secondary)] opacity-80"
                }`}
              >
                <div
                  className={`w-5 h-5 rounded-md flex items-center justify-center shrink-0 mt-0.5 text-xs font-bold ${
                    m.completed
                      ? "bg-teal-600 text-white"
                      : "border border-slate-400 dark:border-slate-600 bg-white dark:bg-black/20"
                  }`}
                >
                  {m.completed && <CheckCircle2 size={13} />}
                </div>

                <div className="flex-1">
                  <div className="flex items-center justify-between gap-2">
                    <div className="text-xs sm:text-sm font-semibold">{m.title}</div>
                    {m.sourceType && (
                      <span className="text-[10px] px-2 py-0.5 rounded bg-teal-500/10 text-teal-600 dark:text-teal-400 font-medium shrink-0">
                        {m.sourceType}
                      </span>
                    )}
                  </div>
                  <div className="text-[10.5px] text-[var(--text-muted)] mt-0.5 flex items-center gap-2 capitalize">
                    {m.stage && <span>Stage: {m.stage}</span>}
                    {m.completedAt && <span>• Completed on {m.completedAt}</span>}
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Add Milestone Inline */}
          {onAddMilestone && (
            <div className="pt-2">
              {!isAdding ? (
                <button
                  onClick={() => setIsAdding(true)}
                  className="inline-flex items-center gap-1.5 text-xs font-semibold text-teal-600 dark:text-teal-400 hover:underline"
                >
                  <Plus size={14} />
                  <span>Add Custom Milestone</span>
                </button>
              ) : (
                <form onSubmit={handleCreateMilestone} className="space-y-3 p-3.5 rounded-2xl bg-[var(--bg-elevated)] border border-[var(--border)]">
                  <div>
                    <input
                      type="text"
                      value={newTitle}
                      onChange={(e) => setNewTitle(e.target.value)}
                      placeholder="e.g. Schedule informational interview with 3 Design Directors"
                      className="w-full px-3 py-2 rounded-xl border border-[var(--border)] bg-[var(--card)] text-xs text-[var(--text-primary)] focus:outline-none focus:ring-2 focus:ring-teal-500/30"
                      required
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <label className="text-[10px] uppercase font-bold text-[var(--text-muted)] block mb-1">
                        Stage:
                      </label>
                      <select
                        value={newStage}
                        onChange={(e) => setNewStage(e.target.value as GoalStage)}
                        className="w-full px-2.5 py-1.5 rounded-lg border border-[var(--border)] bg-[var(--card)] text-xs text-[var(--text-primary)]"
                      >
                        <option value="direction">Direction</option>
                        <option value="target">Target</option>
                        <option value="strategy">Strategy</option>
                        <option value="outcome">Outcome</option>
                      </select>
                    </div>

                    <div>
                      <label className="text-[10px] uppercase font-bold text-[var(--text-muted)] block mb-1">
                        Source (Spec Sec. 10):
                      </label>
                      <select
                        value={newSourceType}
                        onChange={(e) => setNewSourceType(e.target.value as ProgressSource)}
                        className="w-full px-2.5 py-1.5 rounded-lg border border-[var(--border)] bg-[var(--card)] text-xs text-[var(--text-primary)]"
                      >
                        {PROGRESS_SOURCES.map((src) => (
                          <option key={src} value={src}>
                            {src}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>

                  <div className="flex items-center justify-end gap-2 pt-1 border-t border-[var(--border)]">
                    <button
                      type="button"
                      onClick={() => setIsAdding(false)}
                      className="px-3 py-1.5 rounded-lg text-xs font-medium text-[var(--text-muted)] hover:bg-[var(--card)]"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      className="px-3 py-1.5 rounded-lg bg-teal-600 text-white text-xs font-bold hover:bg-teal-500 shadow-xs"
                    >
                      Add Milestone
                    </button>
                  </div>
                </form>
              )}
            </div>
          )}
        </div>

        {/* Career Event Connection Info */}
        <div className="p-4 rounded-xl bg-[var(--bg-elevated)] border border-[var(--border)] space-y-2">
          <div className="text-xs font-bold text-[var(--text-primary)] flex items-center gap-1.5">
            <BookOpen size={14} className="text-amber-500" />
            <span>Connected to Career Memory & Journal</span>
          </div>
          <p className="text-xs text-[var(--text-secondary)] leading-relaxed">
            Logging new responsibilities, promotions, and quantified wins in your Career Journal automatically substantiates these milestones and updates your Career Value.
          </p>
          <Link
            href="/career-journal"
            className="inline-flex items-center gap-1 text-xs font-bold text-amber-600 dark:text-amber-400 hover:underline pt-1"
          >
            <span>Log a Career Event in Journal</span>
            <ArrowRight size={12} />
          </Link>
        </div>
      </div>

      {/* Pinned Footer */}
      <div className="px-6 py-4 border-t border-[var(--border)] flex justify-end shrink-0 bg-[var(--card)]">
          <button
            onClick={onClose}
            className="px-5 py-2.5 rounded-xl bg-teal-600 text-white text-xs font-bold hover:bg-teal-500 transition-all shadow-xs"
          >
            Done
          </button>
        </div>
      </div>
    </div>
  );
}
