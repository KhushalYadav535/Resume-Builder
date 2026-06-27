"use client";

import React, { useState, useMemo } from "react";
import { ResumeSuggestion } from "@/lib/types/comprehensive-suggestions";
import { ImprovementSuggestionCard } from "./ImprovementSuggestionCard";

interface Props {
  title: string;
  emoji: string;
  description: string;
  suggestions: ResumeSuggestion[];
  selectedIds: Set<string>;
  onToggle: (id: string) => void;
  onAcceptAll: (ids: string[]) => void;
}

export function ImprovementCategory({ 
  title, 
  emoji, 
  description, 
  suggestions, 
  selectedIds, 
  onToggle,
  onAcceptAll 
}: Props) {
  const [isExpanded, setIsExpanded] = useState(suggestions.length > 0);

  // Calculate estimated impact based on priorities (rough heuristic)
  const estimatedImpact = useMemo(() => {
    let pts = 0;
    suggestions.forEach(s => {
      if (s.priority >= 4) pts += 2;
      else if (s.priority >= 2) pts += 1;
    });
    return pts;
  }, [suggestions]);

  // Check how many are selected
  const allIds = suggestions.map(s => s.id);
  const selectedCount = suggestions.filter(s => selectedIds.has(s.id)).length;
  const isAllSelected = selectedCount === suggestions.length && suggestions.length > 0;

  if (suggestions.length === 0) return null;

  return (
    <div className="card mb-4 overflow-hidden border border-border/50">
      {/* Header */}
      <div 
        className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 cursor-pointer"
        onClick={() => setIsExpanded(!isExpanded)}
      >
        <div className="flex items-start sm:items-center gap-3 flex-1">
          <div className="text-2xl">{emoji}</div>
          <div>
            <h3 className="font-bold text-lg text-white flex items-center gap-2">
              {title}
              <span className="text-xs bg-white/10 text-muted-foreground px-2 py-0.5 rounded-full font-normal">
                {suggestions.length}
              </span>
            </h3>
            <p className="text-sm text-muted-foreground mt-0.5">{description}</p>
          </div>
        </div>

        <div className="flex items-center gap-3 pl-11 sm:pl-0">
          {estimatedImpact > 0 && (
            <div className="text-xs font-bold text-[#43e97b] bg-[#43e97b]/10 px-2 py-1 rounded">
              Impact: +{estimatedImpact} pts
            </div>
          )}
          
          <button 
            onClick={(e) => {
              e.stopPropagation();
              onAcceptAll(allIds);
            }}
            className="text-xs font-bold px-3 py-1.5 rounded bg-white/5 hover:bg-white/10 text-white transition-colors border border-white/10"
          >
            {isAllSelected ? "Deselect All" : "Select All"}
          </button>
          
          <div className="text-muted-foreground w-6 h-6 flex items-center justify-center">
            <svg
              className={`w-5 h-5 transition-transform duration-200 ${isExpanded ? "rotate-180" : ""}`}
              fill="none" viewBox="0 0 24 24" stroke="currentColor"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
            </svg>
          </div>
        </div>
      </div>

      {/* Expanded body */}
      {isExpanded && (
        <div className="mt-6 pt-4 border-t border-border/50 flex flex-col gap-3 animate-in fade-in">
          {suggestions.map(s => (
            <ImprovementSuggestionCard 
              key={s.id} 
              suggestion={s} 
              isSelected={selectedIds.has(s.id)}
              onToggle={onToggle}
            />
          ))}
        </div>
      )}
    </div>
  );
}
