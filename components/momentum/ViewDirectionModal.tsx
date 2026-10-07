"use client";

import React, { useEffect } from "react";
import { CareerDirection } from "@/types/momentum";
import { X, Compass, ArrowRight, Edit3, Calendar } from "lucide-react";

interface ViewDirectionModalProps {
  isOpen: boolean;
  onClose: () => void;
  direction: CareerDirection | null;
  onOpenEdit: () => void;
}

export default function ViewDirectionModal({
  isOpen,
  onClose,
  direction,
  onOpenEdit,
}: ViewDirectionModalProps) {
  useEffect(() => {
    if (!isOpen) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen || !direction) return null;

  const trajectoryItems =
    direction.fullTrajectory && direction.fullTrajectory.length > 0
      ? direction.fullTrajectory
      : [direction.currentPath || "Current", direction.targetPath || direction.title];

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
              <Compass size={18} className="text-amber-500" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-[var(--text-primary)] font-['Syne',sans-serif] leading-tight">
                Career Direction Overview
              </h3>
              <p className="text-[11px] text-[var(--text-muted)] mt-0.5">
                Active trajectory and pathway scope
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

        {/* Scrollable Content */}
        <div className="p-6 overflow-y-auto flex-1 min-h-0 space-y-4">
          <div>
            <div className="flex items-center gap-2 mb-1.5">
              <span className="text-[11px] font-bold px-2.5 py-0.5 rounded-full bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20">
                {direction.status}
              </span>
              <span className="text-[11px] font-semibold text-[var(--text-muted)]">
                Source: {direction.source}
              </span>
            </div>
            <h2 className="text-2xl font-extrabold text-[var(--text-primary)] font-['Syne',sans-serif]">
              {direction.title}
            </h2>
          </div>

          {/* Full Trajectory Pathway */}
          <div className="p-4 rounded-xl bg-[var(--bg-elevated)] border border-[var(--border)] space-y-2">
            <div className="text-[11px] font-bold uppercase tracking-wider text-[var(--text-muted)]">
              Directional Career Pathway
            </div>
            <div className="flex flex-wrap items-center gap-2">
              {trajectoryItems.map((step, idx) => (
                <React.Fragment key={idx}>
                  <span
                    className={`text-xs font-bold px-3 py-1.5 rounded-lg border ${
                      idx === trajectoryItems.length - 1
                        ? "bg-amber-500/15 border-amber-500/40 text-amber-600 dark:text-amber-400"
                        : "bg-[var(--card)] border-[var(--border)] text-[var(--text-secondary)]"
                    }`}
                  >
                    {step}
                  </span>
                  {idx < trajectoryItems.length - 1 && (
                    <ArrowRight size={13} className="text-[var(--text-muted)]" />
                  )}
                </React.Fragment>
              ))}
            </div>
          </div>

          {/* Description */}
          {direction.description && (
            <div className="p-4 rounded-xl bg-[var(--bg-elevated)] border border-[var(--border)]">
              <div className="text-[11px] font-bold uppercase tracking-wider text-[var(--text-muted)] mb-1">
                Strategic Scope & Rationale
              </div>
              <p className="text-xs text-[var(--text-secondary)] leading-relaxed">
                {direction.description}
              </p>
            </div>
          )}

          {/* Telemetry info */}
          <div className="text-[11px] text-[var(--text-muted)] flex items-center gap-3">
            <span className="flex items-center gap-1">
              <Calendar size={12} />
              <span>Last updated: {direction.updatedAt?.split("T")[0] || "Active"}</span>
            </span>
          </div>
        </div>

        {/* Pinned Footer */}
        <div className="px-6 py-4 border-t border-[var(--border)] flex items-center justify-between shrink-0 bg-[var(--card)]">
          <button
            onClick={() => {
              onClose();
              onOpenEdit();
            }}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-[var(--bg-elevated)] border border-[var(--border)] text-xs font-bold text-[var(--text-primary)] hover:border-amber-500/40 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-500 transition-colors"
          >
            <Edit3 size={13} />
            <span>Edit Direction</span>
          </button>
          <button
            onClick={onClose}
            className="px-5 py-2.5 rounded-xl bg-amber-500 text-brand-navy text-xs font-bold hover:bg-amber-400 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-500 transition-colors shadow-xs"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
}
