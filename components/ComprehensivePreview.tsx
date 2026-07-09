"use client";

import React, { useState } from "react";
import { ResumeSuggestion } from "@/lib/types/comprehensive-suggestions";
import { Sparkles } from "lucide-react";

interface Props {
  appliedSuggestions: ResumeSuggestion[];
}

export function ComprehensivePreview({ appliedSuggestions }: Props) {
  const [isExpanded, setIsExpanded] = useState(true);

  if (appliedSuggestions.length === 0) return null;

  return (
    <div className="card mt-6 border border-accent/30 bg-accent/5">
      <div 
        className="flex items-center justify-between cursor-pointer"
        onClick={() => setIsExpanded(!isExpanded)}
      >
        <div className="flex items-center gap-3">
          <div className="text-amber-500 flex items-center justify-center">
            <Sparkles size={20} />
          </div>
          <div>
            <h3 className="font-bold text-lg text-foreground">Preview of Improvements</h3>
            <p className="text-sm text-muted-foreground">{appliedSuggestions.length} changes applied successfully</p>
          </div>
        </div>
        <div className="text-muted-foreground">
          <svg
            className={`w-5 h-5 transition-transform duration-200 ${isExpanded ? "rotate-180" : ""}`}
            fill="none" viewBox="0 0 24 24" stroke="currentColor"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
          </svg>
        </div>
      </div>

      {isExpanded && (
        <div className="mt-6 flex flex-col gap-4">
          {appliedSuggestions.map((suggestion, idx) => (
            <div key={suggestion.id} className="border-t border-border/50 pt-4 first:border-t-0 first:pt-0">
              <div className="flex items-center gap-2 mb-2">
                <span className="text-xs font-bold px-2 py-0.5 rounded bg-muted text-foreground capitalize">
                  {suggestion.section}
                </span>
                <span className="text-sm font-bold text-foreground">{suggestion.title}</span>
              </div>
              
              {suggestion.currentText ? (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mt-2">
                  <div className="bg-red-500/10 dark:bg-red-500/5 border border-red-500/20 p-3 rounded-lg">
                    <div className="text-[10px] uppercase font-bold text-red-600 dark:text-red-400 mb-1 tracking-wider">Before</div>
                    <div className="text-sm text-red-600 dark:text-red-200/70 line-through line-clamp-3">{suggestion.currentText}</div>
                  </div>
                  <div className="bg-accent/10 border border-accent/30 p-3 rounded-lg relative overflow-hidden">
                    <div className="absolute left-0 top-0 bottom-0 w-1 bg-accent"></div>
                    <div className="text-[10px] uppercase font-bold text-green-700 dark:text-[#43e97b] mb-1 tracking-wider">After</div>
                    <div className="text-sm text-foreground line-clamp-3">{suggestion.suggestedText}</div>
                  </div>
                </div>
              ) : (
                <div className="mt-2 bg-accent/10 border border-accent/30 p-3 rounded-lg relative overflow-hidden">
                  <div className="absolute left-0 top-0 bottom-0 w-1 bg-accent"></div>
                  <div className="text-[10px] uppercase font-bold text-green-700 dark:text-[#43e97b] mb-1 tracking-wider">Added</div>
                  <div className="text-sm text-foreground">{suggestion.suggestedText}</div>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
