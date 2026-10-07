"use client";

import React, { useState, useEffect } from "react";
import { CareerGoal, GoalStatus, GoalType } from "@/types/momentum";
import { X, Flag, Clock, CheckCircle2, Pause, Play, Award, Edit3, Archive, ArrowRight } from "lucide-react";
import Link from "next/link";

interface GoalDetailModalProps {
  isOpen: boolean;
  onClose: () => void;
  goal: CareerGoal | null;
  onUpdateGoal: (updated: Partial<CareerGoal>) => void;
  onArchiveGoal?: (goalId: string) => void;
}

const ALL_STATUSES: GoalStatus[] = [
  "Active",
  "Exploring",
  "Paused",
  "Achieved",
  "Archived",
];

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

export default function GoalDetailModal({
  isOpen,
  onClose,
  goal,
  onUpdateGoal,
  onArchiveGoal,
}: GoalDetailModalProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [title, setTitle] = useState("");
  const [targetRole, setTargetRole] = useState("");
  const [currentRole, setCurrentRole] = useState("");
  const [targetHorizon, setTargetHorizon] = useState("");
  const [goalType, setGoalType] = useState<GoalType>("Role Change");
  const [status, setStatus] = useState<GoalStatus>("Active");
  const [objective, setObjective] = useState("");
  const [strategyOverview, setStrategyOverview] = useState("");

  useEffect(() => {
    if (goal) {
      setTitle(goal.title);
      setTargetRole(goal.targetRole);
      setCurrentRole(goal.currentRole);
      setTargetHorizon(goal.targetHorizon);
      setGoalType(goal.goalType);
      setStatus(goal.status);
      setObjective(goal.objective || "");
      setStrategyOverview(goal.strategyOverview || "");
    }
  }, [goal, isOpen]);

  useEffect(() => {
    if (!isOpen) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen || !goal) return null;

  const handleSaveEdit = (e: React.FormEvent) => {
    e.preventDefault();
    onUpdateGoal({
      id: goal.id,
      title: title.trim(),
      targetRole: targetRole.trim() || title.trim(),
      currentRole: currentRole.trim(),
      targetHorizon: targetHorizon.trim() || "6–12 months",
      goalType,
      status,
      objective: objective.trim() || undefined,
      strategyOverview: strategyOverview.trim() || undefined,
      updatedAt: new Date().toISOString(),
    });
    setIsEditing(false);
  };

  const handleToggleStatus = (newStatus: GoalStatus) => {
    onUpdateGoal({
      id: goal.id,
      status: newStatus,
      updatedAt: new Date().toISOString(),
    });
  };

  const handleToggleMilestone = (milestoneId: string) => {
    const updatedMilestones = (goal.milestones || []).map((m) =>
      m.id === milestoneId
        ? {
            ...m,
            completed: !m.completed,
            completedAt: !m.completed ? new Date().toISOString().split("T")[0] : undefined,
          }
        : m
    );
    onUpdateGoal({
      id: goal.id,
      milestones: updatedMilestones,
      updatedAt: new Date().toISOString(),
    });
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
            <div className="w-8 h-8 rounded-xl bg-blue-500/10 border border-blue-500/20 flex items-center justify-center shrink-0">
              <Flag size={18} className="text-blue-500" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-[var(--text-primary)] font-['Syne',sans-serif] leading-tight">
                Career Goal Details
              </h3>
              <p className="text-[11px] text-[var(--text-muted)] mt-0.5">
                Strategic objective, timeline & milestones
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-xl text-[var(--text-muted)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-elevated)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 transition-colors"
            aria-label="Close modal"
          >
            <X size={18} />
          </button>
        </div>

        {/* Scrollable Content Body */}
        <div className="p-6 overflow-y-auto flex-1 min-h-0">
          {!isEditing ? (
          <div className="space-y-6">
            <div>
              <div className="flex flex-wrap items-center gap-2 mb-2">
                <span className="text-[11px] font-bold px-2.5 py-0.5 rounded-full bg-blue-500/10 text-blue-600 dark:text-blue-400 border border-blue-500/20">
                  {goal.goalType}
                </span>
                <span className="text-[11px] font-bold px-2.5 py-0.5 rounded-full bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20">
                  {goal.status}
                </span>
                {goal.isPrimary && (
                  <span className="text-[11px] font-bold px-2 py-0.5 rounded-full bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20">
                    Primary Goal
                  </span>
                )}
              </div>
              <h2 className="text-2xl font-extrabold text-[var(--text-primary)] font-['Syne',sans-serif]">
                {goal.title}
              </h2>
            </div>

            {/* Achieved Banner */}
            {goal.status === "Achieved" && (
              <div className="p-4 rounded-2xl bg-purple-500/10 border border-purple-500/30 flex items-center justify-between gap-3">
                <div className="flex items-center gap-2 text-xs text-purple-700 dark:text-purple-300 font-semibold">
                  <Award size={18} className="text-purple-500 shrink-0" />
                  <span>This goal has been achieved! Feed it into Career Memory & Journal.</span>
                </div>
                <Link
                  href="/career-journal"
                  className="inline-flex items-center gap-1 text-xs font-bold text-purple-600 dark:text-purple-400 hover:underline shrink-0"
                >
                  <span>Log Outcome</span>
                  <ArrowRight size={12} />
                </Link>
              </div>
            )}

            <div className="grid grid-cols-2 gap-3">
              <div className="p-3.5 rounded-xl bg-[var(--bg-elevated)] border border-[var(--border)]">
                <div className="text-[11px] text-[var(--text-muted)] font-semibold uppercase">
                  Target Role
                </div>
                <div className="text-sm font-bold text-[var(--text-primary)] mt-0.5">
                  {goal.targetRole || goal.title}
                </div>
              </div>
              <div className="p-3.5 rounded-xl bg-[var(--bg-elevated)] border border-[var(--border)]">
                <div className="text-[11px] text-[var(--text-muted)] font-semibold uppercase">
                  Current Role
                </div>
                <div className="text-sm font-bold text-[var(--text-primary)] mt-0.5">
                  {goal.currentRole || "Not specified"}
                </div>
              </div>
              <div className="p-3.5 rounded-xl bg-[var(--bg-elevated)] border border-[var(--border)] col-span-2">
                <div className="text-[11px] text-[var(--text-muted)] font-semibold uppercase">
                  Target Horizon
                </div>
                <div className="text-sm font-bold text-[var(--text-primary)] mt-0.5">
                  {goal.targetHorizon || "6–12 months"}
                </div>
              </div>

              {goal.objective && (
                <div className="p-3.5 rounded-xl bg-[var(--bg-elevated)] border border-[var(--border)] col-span-2">
                  <div className="text-[11px] text-[var(--text-muted)] font-semibold uppercase">
                    Career Objective (Spec Section 19)
                  </div>
                  <div className="text-xs text-[var(--text-secondary)] mt-0.5 leading-relaxed">
                    {goal.objective}
                  </div>
                </div>
              )}

              {goal.strategyOverview && (
                <div className="p-3.5 rounded-xl bg-[var(--bg-elevated)] border border-[var(--border)] col-span-2">
                  <div className="text-[11px] text-[var(--text-muted)] font-semibold uppercase">
                    Career Strategy (Spec Section 19)
                  </div>
                  <div className="text-xs text-[var(--text-secondary)] mt-0.5 leading-relaxed">
                    {goal.strategyOverview}
                  </div>
                </div>
              )}
            </div>

            {/* Milestones list with interactive toggles */}
            <div>
              <div className="flex items-center justify-between mb-2.5">
                <span className="text-xs font-bold uppercase tracking-wider text-[var(--text-muted)]">
                  Associated Milestones ({(goal.milestones || []).length})
                </span>
                <span className="text-[11px] text-[var(--text-muted)]">
                  Click to mark cleared
                </span>
              </div>
              <div className="space-y-2">
                {(goal.milestones || []).map((m) => (
                  <div
                    key={m.id}
                    onClick={() => handleToggleMilestone(m.id)}
                    className="flex items-center justify-between p-3 rounded-xl bg-[var(--bg-elevated)] border border-[var(--border)] hover:border-slate-300 dark:hover:border-slate-700 cursor-pointer text-xs transition-all"
                  >
                    <span
                      className={
                        m.completed
                          ? "font-semibold text-emerald-600 dark:text-emerald-400"
                          : "text-[var(--text-secondary)]"
                      }
                    >
                      {m.completed ? "✓ " : "○ "}
                      {m.title}
                    </span>
                    {m.completedAt && (
                      <span className="text-[10px] text-[var(--text-muted)] font-mono">
                        {m.completedAt}
                      </span>
                    )}
                  </div>
                ))}
              </div>
            </div>

            {/* Status transitions (Spec Section 12 & 16: Exploring, Active, Pause, Mark Achieved, Archive) */}
            <div className="pt-4 border-t border-[var(--border)] flex flex-wrap items-center justify-between gap-3">
              <div className="flex flex-wrap items-center gap-2">
                {goal.status !== "Paused" ? (
                  <button
                    onClick={() => handleToggleStatus("Paused")}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-[var(--border)] text-xs font-semibold text-[var(--text-secondary)] hover:text-amber-500 hover:border-amber-500/40"
                  >
                    <Pause size={13} />
                    <span>Pause Goal</span>
                  </button>
                ) : (
                  <button
                    onClick={() => handleToggleStatus("Active")}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-emerald-500/40 text-xs font-semibold text-emerald-600 dark:text-emerald-400 bg-emerald-500/10"
                  >
                    <Play size={13} />
                    <span>Resume Goal</span>
                  </button>
                )}

                {goal.status !== "Achieved" ? (
                  <button
                    onClick={() => handleToggleStatus("Achieved")}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-purple-500/40 text-xs font-semibold text-purple-600 dark:text-purple-400 bg-purple-500/10 hover:bg-purple-500/20"
                  >
                    <Award size={13} />
                    <span>Mark Achieved</span>
                  </button>
                ) : (
                  <button
                    onClick={() => handleToggleStatus("Active")}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-[var(--border)] text-xs font-semibold text-[var(--text-secondary)]"
                  >
                    <span>Reopen Goal</span>
                  </button>
                )}

                {onArchiveGoal && !goal.isPrimary && (
                  <button
                    onClick={() => {
                      onArchiveGoal(goal.id);
                      onClose();
                    }}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-[var(--border)] text-xs font-semibold text-slate-500 hover:text-red-500 hover:border-red-500/40"
                  >
                    <Archive size={13} />
                    <span>Archive</span>
                  </button>
                )}
              </div>

              <button
                onClick={() => setIsEditing(true)}
                className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-[var(--bg-elevated)] border border-[var(--border)] text-xs font-bold text-[var(--text-primary)] hover:border-blue-500/40"
              >
                <Edit3 size={13} />
                <span>Edit Details</span>
              </button>
            </div>
          </div>
        ) : (
          <form onSubmit={handleSaveEdit} className="space-y-4">
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-[var(--text-muted)] mb-1.5">
                Goal Type
              </label>
              <select
                value={goalType}
                onChange={(e) => setGoalType(e.target.value as GoalType)}
                className="w-full px-3.5 py-2.5 rounded-xl border border-[var(--border)] bg-[var(--bg-elevated)] text-[var(--text-primary)] text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-blue-500/30"
              >
                {GOAL_TAXONOMY.map((t) => (
                  <option key={t} value={t}>
                    {t}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-[var(--text-muted)] mb-1.5">
                Goal Headline
              </label>
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl border border-[var(--border)] bg-[var(--bg-elevated)] text-[var(--text-primary)] text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/30"
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
                  className="w-full px-3 py-2 rounded-xl border border-[var(--border)] bg-[var(--bg-elevated)] text-[var(--text-primary)] text-xs focus:outline-none focus:ring-2 focus:ring-blue-500/30"
                  required
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
                  className="w-full px-3 py-2 rounded-xl border border-[var(--border)] bg-[var(--bg-elevated)] text-[var(--text-primary)] text-xs focus:outline-none focus:ring-2 focus:ring-blue-500/30"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-[var(--text-muted)] mb-1.5">
                  Target Horizon
                </label>
                <input
                  type="text"
                  value={targetHorizon}
                  onChange={(e) => setTargetHorizon(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-[var(--border)] bg-[var(--bg-elevated)] text-[var(--text-primary)] text-xs focus:outline-none focus:ring-2 focus:ring-blue-500/30"
                  placeholder="e.g. 6–12 months"
                  required
                />
              </div>
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-[var(--text-muted)] mb-1.5">
                  Status
                </label>
                <select
                  value={status}
                  onChange={(e) => setStatus(e.target.value as GoalStatus)}
                  className="w-full px-3 py-2 rounded-xl border border-[var(--border)] bg-[var(--bg-elevated)] text-[var(--text-primary)] text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-blue-500/30"
                >
                  {ALL_STATUSES.map((st) => (
                    <option key={st} value={st}>
                      {st}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-[var(--text-muted)] mb-1.5">
                Career Objective (Spec Section 19)
              </label>
              <textarea
                rows={2}
                value={objective}
                onChange={(e) => setObjective(e.target.value)}
                placeholder="Specific objective being addressed..."
                className="w-full px-3 py-2 rounded-xl border border-[var(--border)] bg-[var(--bg-elevated)] text-[var(--text-primary)] text-xs focus:outline-none focus:ring-2 focus:ring-blue-500/30"
              />
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-[var(--text-muted)] mb-1.5">
                Career Strategy (Spec Section 19)
              </label>
              <textarea
                rows={2}
                value={strategyOverview}
                onChange={(e) => setStrategyOverview(e.target.value)}
                placeholder="High-level strategy to reach this career outcome..."
                className="w-full px-3 py-2 rounded-xl border border-[var(--border)] bg-[var(--bg-elevated)] text-[var(--text-primary)] text-xs focus:outline-none focus:ring-2 focus:ring-blue-500/30"
              />
            </div>

            <div className="pt-4 border-t border-[var(--border)] flex items-center justify-end gap-3">
              <button
                type="button"
                onClick={() => setIsEditing(false)}
                className="px-4 py-2 rounded-xl border border-[var(--border)] text-xs font-semibold text-[var(--text-secondary)] hover:bg-[var(--bg-elevated)]"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-4 py-2 rounded-xl bg-blue-600 text-white text-xs font-bold hover:bg-blue-500 transition-all shadow-xs"
              >
                Save Changes
              </button>
            </div>
          </form>
        )}
        </div>
      </div>
    </div>
  );
}
