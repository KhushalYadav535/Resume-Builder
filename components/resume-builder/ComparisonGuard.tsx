"use client";

import React, { useState } from "react";
import { Info, Trash2 } from "lucide-react";

interface ComparisonGuardProps {
  itemName: string;
  relevanceReason?: string;
  onConfirmDelete: () => void;
  children: React.ReactNode;
}

export function ComparisonGuard({ itemName, relevanceReason, onConfirmDelete, children }: ComparisonGuardProps) {
  const [isGuarding, setIsGuarding] = useState(false);

  const handleInitialDelete = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    
    // Only guard if we have a reason to keep it (e.g., highly relevant to JD)
    if (relevanceReason) {
      setIsGuarding(true);
    } else {
      onConfirmDelete();
    }
  };

  const handleConfirm = () => {
    setIsGuarding(false);
    onConfirmDelete();
  };

  const handleCancel = () => {
    setIsGuarding(false);
  };

  return (
    <div className="relative inline-flex items-center">
      {/* Wrapper to attach the initial delete handler */}
      <div onClickCapture={isGuarding ? undefined : handleInitialDelete}>
        {children}
      </div>

      {isGuarding && (
        <div className="absolute top-full right-0 mt-2 z-50 w-64 bg-[var(--bg-surface)] border border-[var(--border)] shadow-lg rounded-[12px] p-4 animate-fade-in-up">
          <div className="flex items-start gap-2 mb-3">
            <Info className="text-[var(--accent)] shrink-0 mt-0.5" size={16} />
            <p className="type-caption text-[var(--text-primary)]">
              This is relevant for your target role because <span className="font-medium">{relevanceReason}</span>.
            </p>
          </div>
          <div className="flex items-center justify-end gap-3">
            <button
              onClick={handleConfirm}
              className="type-label text-[var(--text-muted)] hover:text-[var(--signal-error)] transition-colors"
            >
              Remove anyway
            </button>
            <button
              onClick={handleCancel}
              className="type-label bg-[var(--accent)] text-white px-3 py-1.5 rounded-[8px] hover:bg-[var(--accent-2)] transition-colors"
            >
              Keep it
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
