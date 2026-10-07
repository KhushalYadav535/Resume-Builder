"use client";

import React, { useState, useEffect } from "react";
import { CareerDirection, DirectionStatus } from "@/types/momentum";
import { X, Compass } from "lucide-react";

interface EditDirectionModalProps {
  isOpen: boolean;
  onClose: () => void;
  direction: CareerDirection | null;
  onSave: (updated: Partial<CareerDirection>) => void;
}

const STATUS_OPTIONS: DirectionStatus[] = [
  "Active",
  "Exploring",
  "Paused",
  "Achieved",
  "Archived",
];

export default function EditDirectionModal({
  isOpen,
  onClose,
  direction,
  onSave,
}: EditDirectionModalProps) {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [currentPath, setCurrentPath] = useState("");
  const [targetPath, setTargetPath] = useState("");
  const [status, setStatus] = useState<DirectionStatus>("Active");

  useEffect(() => {
    if (direction) {
      setTitle(direction.title);
      setDescription(direction.description || "");
      setCurrentPath(direction.currentPath || "");
      setTargetPath(direction.targetPath || "");
      setStatus(direction.status);
    }
  }, [direction, isOpen]);

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

    const curr = currentPath.trim() || "Current";
    const tgt = targetPath.trim() || title.trim();

    // Preserve existing intermediate trajectory steps if present, otherwise clean 2-step trajectory
    const existing = direction?.fullTrajectory || [];
    let trajectory: string[];
    if (existing.length >= 3 && existing[0] === curr && existing[existing.length - 1] === tgt) {
      trajectory = existing;
    } else {
      trajectory = [curr, tgt];
    }

    onSave({
      title: title.trim(),
      description: description.trim(),
      currentPath: curr,
      targetPath: tgt,
      fullTrajectory: trajectory,
      status,
      updatedAt: new Date().toISOString(),
    });
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
              <Compass size={18} className="text-amber-500" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-[var(--text-primary)] font-['Syne',sans-serif] leading-tight">
                Edit Career Direction
              </h3>
              <p className="text-[11px] text-[var(--text-muted)] mt-0.5">
                Target domain and strategic progression path
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
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-[var(--text-muted)] mb-1.5">
              Direction Title
            </label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-xl border border-[var(--border)] bg-[var(--bg-elevated)] text-[var(--text-primary)] text-sm focus:outline-none focus:ring-2 focus:ring-amber-500/30"
              placeholder="e.g. Move into Product Leadership"
              required
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-[var(--text-muted)] mb-1.5">
                Current Domain
              </label>
              <input
                type="text"
                value={currentPath}
                onChange={(e) => setCurrentPath(e.target.value)}
                className="w-full px-3 py-2 rounded-xl border border-[var(--border)] bg-[var(--bg-elevated)] text-[var(--text-primary)] text-xs focus:outline-none focus:ring-2 focus:ring-amber-500/30"
                placeholder="e.g. Engineering"
              />
            </div>
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-[var(--text-muted)] mb-1.5">
                Target Domain
              </label>
              <input
                type="text"
                value={targetPath}
                onChange={(e) => setTargetPath(e.target.value)}
                className="w-full px-3 py-2 rounded-xl border border-[var(--border)] bg-[var(--bg-elevated)] text-[var(--text-primary)] text-xs focus:outline-none focus:ring-2 focus:ring-amber-500/30"
                placeholder="e.g. Product Leadership"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-[var(--text-muted)] mb-1.5">
              Description / Strategic Rationale
            </label>
            <textarea
              rows={3}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full px-3.5 py-2 rounded-xl border border-[var(--border)] bg-[var(--bg-elevated)] text-[var(--text-primary)] text-xs focus:outline-none focus:ring-2 focus:ring-amber-500/30 leading-relaxed"
              placeholder="Describe what moving in this direction looks like for your career..."
            />
          </div>

          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-[var(--text-muted)] mb-1.5">
              Direction Status
            </label>
            <div className="flex flex-wrap gap-2">
              {STATUS_OPTIONS.map((st) => (
                <button
                  type="button"
                  key={st}
                  onClick={() => setStatus(st)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-bold border transition-all ${
                    status === st
                      ? "bg-amber-500 text-brand-navy border-amber-500 shadow-2xs"
                      : "bg-[var(--bg-elevated)] border-[var(--border)] text-[var(--text-secondary)] hover:text-[var(--text-primary)]"
                  }`}
                >
                  {st}
                </button>
              ))}
            </div>
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
            Save Direction
          </button>
        </div>
      </form>
    </div>
  </div>
  );
}
