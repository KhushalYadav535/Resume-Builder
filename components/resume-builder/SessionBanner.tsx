"use client";

import React from "react";
import { Clock } from "lucide-react";

interface SessionBannerProps {
  estimatedMinutes: number;
}

export function SessionBanner({ estimatedMinutes }: SessionBannerProps) {
  if (estimatedMinutes <= 0) return null;

  return (
    <div className="flex items-center gap-2 px-3 py-2 bg-[var(--bg-elevated)] border border-[var(--border)] rounded-[8px] mb-4">
      <Clock size={16} className="text-[var(--text-secondary)]" />
      <span className="type-caption text-[var(--text-primary)] font-medium">
        About {estimatedMinutes} minute{estimatedMinutes !== 1 ? 's' : ''}
      </span>
      <span className="type-caption text-[var(--text-muted)] border-l border-[var(--border)] pl-2 ml-1">
        You can stop anytime
      </span>
    </div>
  );
}
