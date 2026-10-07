"use client";

import React, { useState, useEffect } from "react";
import { CareerPriority } from "@/types/momentum";
import { X, SlidersHorizontal, Check } from "lucide-react";

interface EditPrioritiesModalProps {
  isOpen: boolean;
  onClose: () => void;
  priorities: CareerPriority[];
  onSave: (updatedPriorities: CareerPriority[]) => void;
}

const ALL_PRIORITY_OPTIONS = [
  { type: "growth", label: "Career Growth", defaultPreference: "High upward mobility" },
  { type: "leadership", label: "Leadership & Scope", defaultPreference: "Leading teams & cross-functional direction" },
  { type: "comp", label: "Better Compensation", defaultPreference: "Top-decile market compensation & equity" },
  { type: "learning", label: "Learning & Capabilities", defaultPreference: "Emerging domains, AI & modern tech" },
  { type: "balance", label: "Work-Life Balance", defaultPreference: "Sustainable pace & personal life bounds" },
  { type: "autonomy", label: "Autonomy & Impact", defaultPreference: "Freedom in technical/product decisions" },
  { type: "location", label: "Location & Flexibility", defaultPreference: "Remote, hybrid, or specific global hubs" },
  { type: "industry", label: "Industry Transition", defaultPreference: "Shifting to high-growth sectors" },
  { type: "security", label: "Job Security", defaultPreference: "Resilient business models" },
  { type: "impact", label: "Bottom-Line Impact", defaultPreference: "High-visibility company outcomes" },
];

export default function EditPrioritiesModal({
  isOpen,
  onClose,
  priorities,
  onSave,
}: EditPrioritiesModalProps) {
  const [selectedMap, setSelectedMap] = useState<Record<string, boolean>>({});
  const [preferencesMap, setPreferencesMap] = useState<Record<string, string>>({});

  useEffect(() => {
    const map: Record<string, boolean> = {};
    const prefMap: Record<string, string> = {};
    (priorities || []).forEach((p) => {
      map[p.type] = Boolean(p.selected);
      prefMap[p.type] = p.preference || "";
    });
    setSelectedMap(map);
    setPreferencesMap(prefMap);
  }, [priorities, isOpen]);

  useEffect(() => {
    if (!isOpen) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const toggleOption = (type: string) => {
    setSelectedMap((prev) => ({
      ...prev,
      [type]: !prev[type],
    }));
  };

  const handlePreferenceChange = (type: string, val: string) => {
    setPreferencesMap((prev) => ({
      ...prev,
      [type]: val,
    }));
  };

  const handleSave = () => {
    const updated: CareerPriority[] = ALL_PRIORITY_OPTIONS.map((opt) => {
      const isSelected = Boolean(selectedMap[opt.type]);
      const existing = (priorities || []).find((p) => p.type === opt.type);
      const userPref = preferencesMap[opt.type]?.trim();

      return {
        id: existing?.id || `pr-${opt.type}`,
        userId: existing?.userId,
        type: opt.type,
        label: existing?.label || opt.label,
        importance: isSelected ? "high" : "medium",
        preference: userPref || existing?.preference || opt.defaultPreference,
        source: "User Selected",
        selected: isSelected,
        updatedAt: new Date().toISOString(),
      };
    });

    onSave(updated);
    onClose();
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
            <div className="w-8 h-8 rounded-xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center shrink-0">
              <SlidersHorizontal size={18} className="text-amber-500" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-[var(--text-primary)] font-['Syne',sans-serif] leading-tight">
                Edit Career Priorities
              </h3>
              <p className="text-[11px] text-[var(--text-muted)] mt-0.5">
                Declare what matters to calibrate your career trajectory
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

        {/* Scrollable Body */}
        <div className="p-6 overflow-y-auto flex-1 min-h-0 space-y-4">
          <p className="text-xs text-[var(--text-secondary)] leading-relaxed">
            Select what truly matters to you. UpRole uses these priorities to guide your goals and recommendations, never ranking you with an artificial single score.
          </p>

          {/* Options Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {ALL_PRIORITY_OPTIONS.map((opt) => {
              const isSelected = Boolean(selectedMap[opt.type]);
              const currentPref = preferencesMap[opt.type] !== undefined
                ? preferencesMap[opt.type]
                : ((priorities || []).find((p) => p.type === opt.type)?.preference || opt.defaultPreference);

              return (
                <div
                  key={opt.type}
                  className={`p-3.5 rounded-2xl border transition-all flex flex-col justify-between ${
                    isSelected
                      ? "bg-amber-500/10 border-amber-500/50 shadow-2xs"
                      : "bg-[var(--bg-elevated)] border-[var(--border)] opacity-75"
                  }`}
                >
                  <div
                    className="flex items-start gap-3 cursor-pointer"
                    onClick={() => toggleOption(opt.type)}
                  >
                    <div
                      className={`w-5 h-5 rounded-md flex items-center justify-center shrink-0 mt-0.5 text-xs font-bold ${
                        isSelected
                          ? "bg-amber-500 text-brand-navy"
                          : "border border-[var(--border)] bg-white dark:bg-black/20"
                      }`}
                    >
                      {isSelected && <Check size={12} strokeWidth={3} />}
                    </div>
                    <div>
                      <div className="text-xs font-bold text-[var(--text-primary)]">
                        {opt.label}
                      </div>
                      <div className="text-[11px] text-[var(--text-muted)] mt-0.5 leading-tight">
                        {opt.defaultPreference}
                      </div>
                    </div>
                  </div>

                  {isSelected && (
                    <div className="mt-2.5 pt-2 border-t border-amber-500/20">
                      <label className="text-[10px] uppercase font-bold text-amber-600 dark:text-amber-400 block mb-1">
                        Custom Preference:
                      </label>
                      <input
                        type="text"
                        value={currentPref}
                        onChange={(e) => handlePreferenceChange(opt.type, e.target.value)}
                        placeholder={opt.defaultPreference}
                        className="w-full px-2 py-1 text-xs rounded-lg border border-[var(--border)] bg-[var(--card)] text-[var(--text-primary)] focus:outline-none focus:ring-1 focus:ring-amber-500"
                      />
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* Pinned Footer Actions */}
        <div className="px-6 py-4 border-t border-[var(--border)] flex items-center justify-between shrink-0 bg-[var(--card)]">
          <span className="text-xs text-[var(--text-muted)] font-medium">
            {Object.values(selectedMap).filter(Boolean).length} priorities selected
          </span>
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl border border-[var(--border)] text-xs font-semibold text-[var(--text-secondary)] hover:bg-[var(--bg-elevated)] transition-colors"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={handleSave}
              className="px-5 py-2.5 rounded-xl bg-amber-500 text-brand-navy text-xs font-bold hover:bg-amber-400 transition-all shadow-xs"
            >
              Save Priorities
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
