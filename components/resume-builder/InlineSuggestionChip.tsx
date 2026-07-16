"use client";

import React, { useState, useEffect } from "react";
import { Lightbulb, X } from "lucide-react";

interface InlineSuggestionChipProps {
  suggestion: string;
  onApply: (suggestion: string) => void;
  onDismiss: () => void;
}

export function InlineSuggestionChip({ suggestion, onApply, onDismiss }: InlineSuggestionChipProps) {
  const [visible, setVisible] = useState(false);

  // 300ms delay before showing up (simulate typing pause delay if mounted)
  useEffect(() => {
    const timer = setTimeout(() => setVisible(true), 300);
    return () => clearTimeout(timer);
  }, []);

  if (!visible) return null;

  return (
    <div className="flex items-center gap-2 mt-1 ml-4 py-1 px-3 bg-[var(--bg-elevated)] border border-[var(--border)] rounded-full w-fit animate-fade-in-up">
      <Lightbulb size={14} className="text-[var(--signal-nudge)]" />
      <span 
        className="type-caption text-[var(--text-secondary)] cursor-pointer hover:text-[var(--text-primary)] transition-colors"
        onClick={() => onApply(suggestion)}
      >
        {suggestion}
      </span>
      <button 
        onClick={(e) => {
          e.stopPropagation();
          onDismiss();
        }}
        className="ml-1 text-[var(--text-muted)] hover:text-[var(--text-primary)] transition-colors p-0.5 rounded-full hover:bg-[var(--border)]"
        aria-label="Dismiss suggestion"
      >
        <X size={12} />
      </button>
    </div>
  );
}
