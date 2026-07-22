"use client";

import React from "react";
import { cn } from "@/lib/utils";
import { CheckCircle2, Circle, Clock } from "lucide-react";

export type SectionStatus = "not-started" | "in-progress" | "done";

export interface SectionProgressItem {
  id: string;
  label: string;
  status: SectionStatus;
  progressText?: string; // e.g. "2 of 3 roles"
}

interface SectionProgressListProps {
  sections: SectionProgressItem[];
  activeSectionId?: string;
  onSectionClick?: (id: string) => void;
}

export function SectionProgressList({ sections, activeSectionId, onSectionClick }: SectionProgressListProps) {
  return (
    <div className="flex flex-col gap-1 w-full bg-[var(--bg-surface)] border border-[var(--border)] rounded-[12px] p-3">
      <h3 className="type-heading text-[var(--text-primary)] mb-3 px-2">Progress</h3>
      {sections.map((section) => {
        const isActive = section.id === activeSectionId;
        
        // Determine colors based on status
        let statusColor = "text-[var(--text-muted)]";
        let StatusIcon = Circle;
        
        if (section.status === "in-progress") {
          statusColor = "text-[var(--signal-nudge)]";
          StatusIcon = Clock;
        } else if (section.status === "done") {
          statusColor = "text-[var(--accent-affirm)]";
          StatusIcon = CheckCircle2;
        }

        return (
          <button
            type="button"
            key={section.id}
            onClick={() => onSectionClick?.(section.id)}
            className={cn(
              "flex items-center justify-between w-full p-2 rounded-[8px] transition-colors text-left",
              isActive ? "bg-[var(--bg-2)]" : "hover:bg-[var(--bg-2)]"
            )}
          >
            <div className="flex items-center gap-2">
              <StatusIcon size={16} className={statusColor} />
              <span className={cn(
                "type-label transition-colors",
                isActive ? "text-[var(--text-primary)]" : "text-[var(--text-secondary)]"
              )}>
                {section.label}
              </span>
            </div>
            
            {section.progressText && (
              <span className={cn("type-caption", statusColor)}>
                {section.progressText}
              </span>
            )}
          </button>
        );
      })}
    </div>
  );
}
