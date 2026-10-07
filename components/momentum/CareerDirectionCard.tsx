"use client";

import React from "react";
import { CareerDirection } from "@/types/momentum";
import { Compass, ArrowRight, Edit3, Eye } from "lucide-react";

interface CareerDirectionCardProps {
  direction: CareerDirection;
  onEdit: () => void;
  onView: () => void;
}

export default function CareerDirectionCard({
  direction,
  onEdit,
  onView,
}: CareerDirectionCardProps) {
  const trajectoryItems =
    direction.fullTrajectory && direction.fullTrajectory.length > 0
      ? direction.fullTrajectory
      : [direction.currentPath || "Current", direction.targetPath || direction.title];

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "Active":
        return "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/25";
      case "Exploring":
        return "bg-blue-500/10 text-blue-600 dark:text-blue-400 border-blue-500/25";
      case "Paused":
        return "bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/25";
      case "Achieved":
        return "bg-purple-500/10 text-purple-600 dark:text-purple-400 border-purple-500/25";
      default:
        return "bg-slate-500/10 text-slate-600 dark:text-slate-400 border-slate-500/25";
    }
  };

  return (
    <div className="bg-[var(--card)] border border-[var(--border)] rounded-2xl p-6 sm:p-7 shadow-sm transition-all hover:border-slate-300 dark:hover:border-slate-700 relative overflow-hidden group">
      {/* Decorative top-right accent */}
      <div className="absolute top-0 right-0 w-32 h-32 bg-amber-500/5 rounded-bl-full pointer-events-none group-hover:bg-amber-500/10 transition-colors" />

      {/* Header */}
      <div className="flex items-center justify-between gap-4 mb-4">
        <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-amber-600 dark:text-amber-400">
          <Compass size={15} />
          <span>Your Career Direction</span>
          <span className="text-[var(--text-muted)] lowercase font-normal hidden sm:inline">
            · &ldquo;Where am I heading?&rdquo;
          </span>
        </div>
        <span
          className={`text-[11px] font-bold px-2.5 py-0.5 rounded-full border uppercase tracking-wider ${getStatusBadge(
            direction.status
          )}`}
        >
          {direction.status}
        </span>
      </div>

      {/* Direction Title */}
      <h2 className="text-2xl sm:text-3xl font-extrabold text-[var(--text-primary)] font-['Syne',sans-serif] tracking-tight">
        {direction.title}
      </h2>

      {/* Trajectory Pathway */}
      <div className="mt-4 flex flex-wrap items-center gap-2 sm:gap-3 py-2 px-3.5 rounded-xl bg-[var(--bg-elevated)] border border-[var(--border)] w-fit max-w-full">
        {trajectoryItems.map((item, index) => (
          <React.Fragment key={index}>
            <span
              className={`text-xs sm:text-sm font-semibold ${
                index === trajectoryItems.length - 1
                  ? "text-amber-600 dark:text-amber-400 font-bold"
                  : "text-[var(--text-secondary)]"
              }`}
            >
              {item}
            </span>
            {index < trajectoryItems.length - 1 && (
              <ArrowRight size={13} className="text-[var(--text-muted)] shrink-0" />
            )}
          </React.Fragment>
        ))}
      </div>

      {/* Description */}
      {direction.description && (
        <p className="mt-4 text-xs sm:text-sm text-[var(--text-secondary)] leading-relaxed max-w-3xl">
          {direction.description}
        </p>
      )}

      {/* Actions */}
      <div className="mt-6 pt-5 border-t border-[var(--border)] flex items-center justify-between gap-4">
        <button
          onClick={onView}
          className="inline-flex items-center gap-2 text-xs font-bold text-amber-600 dark:text-amber-400 hover:text-amber-500 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-500/50 rounded-lg py-1 px-1.5"
        >
          <Eye size={14} />
          <span>View Direction</span>
        </button>

        <button
          onClick={onEdit}
          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-[var(--border)] text-xs font-semibold text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-elevated)] transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-500/50"
        >
          <Edit3 size={13} />
          <span>Edit</span>
        </button>
      </div>
    </div>
  );
}
