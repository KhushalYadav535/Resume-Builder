"use client";

import React, { useState, useEffect } from "react";
import { CareerGoal, GoalType } from "@/types/momentum";
import { getDefaultMilestonesForGoalType } from "@/lib/momentumData";
import { X, Plus } from "lucide-react";

interface AddGoalModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAdd: (newGoal: Partial<CareerGoal>) => void;
  initialPrefill?: {
    title?: string;
    targetRole?: string;
    goalType?: GoalType;
    isPrimary?: boolean;
  } | null;
}

const GOAL_TAXONOMY: GoalType[] = [
  "Role Change",
  "Promotion",
  "Job Change",
  "Salary Increase",
  "Designation Change",
  "Leadership Transition",
  "Industry Change",
  "Location Change",
  "Career Return",
  "Independent / Consulting",
  "Skill / Capability Development",
  "Other",
];

export default function AddGoalModal({
  isOpen,
  onClose,
  onAdd,
  initialPrefill,
}: AddGoalModalProps) {
  const [title, setTitle] = useState("");
  const [targetRole, setTargetRole] = useState("");
  const [currentRole, setCurrentRole] = useState("");
  const [targetHorizon, setTargetHorizon] = useState("6–12 months");
  const [goalType, setGoalType] = useState<GoalType>("Role Change");
  const [objective, setObjective] = useState("");
  const [strategyOverview, setStrategyOverview] = useState("");
  const [isPrimary, setIsPrimary] = useState(false);

  useEffect(() => {
    if (initialPrefill) {
      if (initialPrefill.title) setTitle(initialPrefill.title);
      if (initialPrefill.targetRole) setTargetRole(initialPrefill.targetRole);
      if (initialPrefill.goalType) setGoalType(initialPrefill.goalType);
      if (initialPrefill.isPrimary !== undefined) setIsPrimary(Boolean(initialPrefill.isPrimary));
    }
  }, [initialPrefill, isOpen]);

  useEffect(() => {
    if (!isOpen) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;

    const assignedTargetRole = targetRole.trim() || title.trim();
    const newId = typeof crypto !== "undefined" && crypto.randomUUID ? crypto.randomUUID() : `goal-${Date.now()}`;
    const generatedMilestones = getDefaultMilestonesForGoalType(goalType, assignedTargetRole);

    onAdd({
      id: newId,
      title: title.trim(),
      targetRole: assignedTargetRole,
      currentRole: currentRole.trim() || "Current Role",
      targetHorizon: targetHorizon.trim() || "6–12 months",
      goalType,
      status: "Active",
      isPrimary,
      stage: "direction",
      objective: objective.trim() || `Achieve successful career progression into ${assignedTargetRole}.`,
      strategyOverview: strategyOverview.trim() || `Execute milestone strategy to demonstrate verified capability and secure ${assignedTargetRole}.`,
      milestones: generatedMilestones,
      reasonSummary: `Targeting ${assignedTargetRole} directly leverages your past experience, addressing your chosen focus in ${goalType}.`,
      supportingEvidence: [
        {
          id: `ev-${Date.now()}-1`,
          title: "Goal Formulation",
          category: goalType,
          snippet: `User established active goal for ${assignedTargetRole} with target horizon ${targetHorizon}.`,
        },
      ],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    });

    // Reset and close
    setTitle("");
    setTargetRole("");
    setCurrentRole("");
    setObjective("");
    setStrategyOverview("");
    onClose();
  };

  return (
    <div
      className="fixed inset-0 z-[150] overflow-y-auto p-4 sm:p-6 flex items-center justify-center bg-black/75 backdrop-blur-md animate-fade-in"
      onClick={onClose}
    >
      <div
        className="relative w-full max-w-lg my-auto bg-[var(--card)] border border-[var(--border)] rounded-3xl shadow-2xl flex flex-col max-h-[85vh] overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Pinned Header */}
        <div className="px-6 py-5 border-b border-[var(--border)] flex items-center justify-between shrink-0 bg-[var(--card)]">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center shrink-0">
              <Plus size={18} className="text-amber-500" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-[var(--text-primary)] font-['Syne',sans-serif] leading-tight">
                Add Career Goal
              </h3>
              <p className="text-[11px] text-[var(--text-muted)] mt-0.5">
                Define an active career target or secondary outcome
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-xl text-[var(--text-muted)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-elevated)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-500 transition-colors"
            aria-label="Close modal"
          >
            <X size={18} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="flex flex-col flex-1 min-h-0">
          {/* Scrollable Form Body */}
          <div className="p-6 overflow-y-auto flex-1 min-h-0 space-y-4">
          {/* Goal Type taxonomy selection */}
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-[var(--text-muted)] mb-1.5">
              Goal Type
            </label>
            <div className="flex flex-wrap gap-1.5 max-h-36 overflow-y-auto p-1 border border-[var(--border)] rounded-xl bg-[var(--bg-elevated)]">
              {GOAL_TAXONOMY.map((t) => (
                <button
                  type="button"
                  key={t}
                  onClick={() => setGoalType(t)}
                  className={`text-[11px] font-semibold px-2.5 py-1 rounded-lg transition-all ${
                    goalType === t
                      ? "bg-amber-500 text-brand-navy font-bold shadow-2xs"
                      : "text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-black/5 dark:hover:bg-white/5"
                  }`}
                >
                  {t}
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-[var(--text-muted)] mb-1.5">
              Goal Headline
            </label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-xl border border-[var(--border)] bg-[var(--bg-elevated)] text-[var(--text-primary)] text-sm focus:outline-none focus:ring-2 focus:ring-amber-500/30"
              placeholder="e.g. Become a Principal Engineer"
              required
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-[var(--text-muted)] mb-1.5">
                Target Role
              </label>
              <input
                type="text"
                value={targetRole}
                onChange={(e) => setTargetRole(e.target.value)}
                className="w-full px-3 py-2 rounded-xl border border-[var(--border)] bg-[var(--bg-elevated)] text-[var(--text-primary)] text-xs focus:outline-none focus:ring-2 focus:ring-amber-500/30"
                placeholder="e.g. Principal Engineer"
              />
            </div>
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-[var(--text-muted)] mb-1.5">
                Current Role
              </label>
              <input
                type="text"
                value={currentRole}
                onChange={(e) => setCurrentRole(e.target.value)}
                className="w-full px-3 py-2 rounded-xl border border-[var(--border)] bg-[var(--bg-elevated)] text-[var(--text-primary)] text-xs focus:outline-none focus:ring-2 focus:ring-amber-500/30"
                placeholder="e.g. Staff Engineer"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-[var(--text-muted)] mb-1.5">
              Target Horizon
            </label>
            <input
              type="text"
              value={targetHorizon}
              onChange={(e) => setTargetHorizon(e.target.value)}
              className="w-full px-3 py-2 rounded-xl border border-[var(--border)] bg-[var(--bg-elevated)] text-[var(--text-primary)] text-xs focus:outline-none focus:ring-2 focus:ring-amber-500/30"
              placeholder="e.g. 6–12 months or Q2 2027"
            />
          </div>

          {/* Primary Goal Checkbox */}
          <div className="flex items-center gap-3 p-3 rounded-xl bg-[var(--bg-elevated)] border border-[var(--border)]">
            <input
              type="checkbox"
              id="setPrimary"
              checked={isPrimary}
              onChange={(e) => setIsPrimary(e.target.checked)}
              className="w-4 h-4 rounded text-amber-500 focus:ring-amber-500/30"
            />
            <label htmlFor="setPrimary" className="text-xs font-semibold text-[var(--text-primary)] cursor-pointer">
              Set as Primary Active Goal (replaces current active goal)
            </label>
          </div>
        </div>

        {/* Pinned Footer */}
        <div className="px-6 py-4 border-t border-[var(--border)] flex items-center justify-end gap-3 shrink-0 bg-[var(--card)]">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 rounded-xl border border-[var(--border)] text-xs font-semibold text-[var(--text-secondary)] hover:bg-[var(--bg-elevated)] transition-colors"
          >
            Cancel
          </button>
          <button
            type="submit"
            className="px-5 py-2.5 rounded-xl bg-amber-500 text-brand-navy text-xs font-bold hover:bg-amber-400 transition-all shadow-xs"
          >
            Add Goal
          </button>
        </div>
      </form>
    </div>
  </div>
  );
}
