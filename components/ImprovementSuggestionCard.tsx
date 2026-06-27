"use client";

import React, { useState } from "react";
import { ResumeSuggestion } from "@/lib/types/comprehensive-suggestions";

interface Props {
  suggestion: ResumeSuggestion;
  isSelected: boolean;
  onToggle: (id: string) => void;
}

export function ImprovementSuggestionCard({ suggestion, isSelected, onToggle }: Props) {
  const [isExpanded, setIsExpanded] = useState(false);

  const getImpactColor = (level: string) => {
    switch (level) {
      case "high": return "text-[#43e97b] bg-[#43e97b]/10 border-[#43e97b]/20";
      case "medium": return "text-[#f6d365] bg-[#f6d365]/10 border-[#f6d365]/20";
      case "low": return "text-blue-400 bg-blue-400/10 border-blue-400/20";
      default: return "text-gray-400 bg-gray-400/10 border-gray-400/20";
    }
  };

  return (
    <div 
      className={`group border rounded-xl p-4 transition-all ${
        isSelected 
          ? "border-accent bg-accent/5 shadow-[0_0_15px_rgba(67,233,123,0.1)]" 
          : "border-border/50 hover:border-border bg-card"
      }`}
    >
      <div className="flex gap-4 cursor-pointer" onClick={() => setIsExpanded(!isExpanded)}>
        {/* Checkbox */}
        <div className="pt-1" onClick={(e) => { e.stopPropagation(); onToggle(suggestion.id); }}>
          <div className={`w-6 h-6 rounded border flex items-center justify-center transition-colors ${
            isSelected ? 'bg-accent border-accent text-white' : 'border-muted-foreground'
          }`}>
            {isSelected && <span className="text-sm font-bold">✓</span>}
          </div>
        </div>

        {/* Content summary */}
        <div className="flex-1 min-w-0">
          <div className="flex flex-wrap items-center gap-2 mb-1">
            <h3 className="font-bold text-foreground text-[15px]">{suggestion.title}</h3>
            
            <span className={`text-xs px-2 py-0.5 rounded-full border uppercase tracking-wider font-bold ${getImpactColor(suggestion.impactLevel)}`}>
              {suggestion.impactLevel} Impact
            </span>
            
            <div className="ml-auto flex text-yellow-500 text-xs">
              {Array.from({ length: 5 }).map((_, i) => (
                <span key={i} className={i < suggestion.priority ? 'opacity-100' : 'opacity-20'}>★</span>
              ))}
            </div>
          </div>
          
          <p className="text-sm text-muted-foreground line-clamp-1">{suggestion.description}</p>
        </div>

        {/* Expand toggle */}
        <div className="text-muted-foreground flex items-center justify-center">
          <svg
            className={`w-5 h-5 transition-transform duration-200 ${isExpanded ? "rotate-180" : ""}`}
            fill="none" viewBox="0 0 24 24" stroke="currentColor"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
          </svg>
        </div>
      </div>

      {/* Expanded Details */}
      {isExpanded && (
        <div className="mt-4 pl-10 border-t border-border/50 pt-4 animate-in fade-in slide-in-from-top-2">
          
          <div className="mb-4">
            <h4 className="text-xs font-bold text-muted-foreground uppercase tracking-wider mb-1">Why this matters</h4>
            <p className="text-sm text-foreground/80">{suggestion.description}</p>
          </div>

          {suggestion.currentText && (
            <div className="mb-3">
              <h4 className="text-xs font-bold text-muted-foreground uppercase tracking-wider mb-1">Current</h4>
              <div className="p-3 bg-red-500/10 dark:bg-red-500/5 border border-red-500/20 rounded-lg text-sm text-red-600 dark:text-red-200/70 line-through">
                {suggestion.currentText}
              </div>
            </div>
          )}

          <div className="mb-4">
            <h4 className="text-xs font-bold text-[#43e97b] uppercase tracking-wider mb-1">Suggested Change</h4>
            <div className="p-3 bg-accent/5 border border-accent/20 rounded-lg text-sm text-foreground font-mono leading-relaxed relative overflow-hidden">
              <div className="absolute left-0 top-0 bottom-0 w-1 bg-accent"></div>
              {suggestion.suggestedText}
            </div>
          </div>

          {suggestion.reasoning && (
            <div className="mb-3">
              <h4 className="text-xs font-bold text-muted-foreground uppercase tracking-wider mb-1">AI Reasoning</h4>
              <p className="text-sm text-muted-foreground italic font-mono opacity-80">{suggestion.reasoning}</p>
            </div>
          )}

          <div className="mt-4 flex gap-3 text-xs text-muted-foreground">
            <span className="bg-muted px-2 py-1 rounded">Section: <span className="capitalize">{suggestion.section || "General"}</span></span>
            <span className="bg-muted px-2 py-1 rounded">Type: <span className="capitalize">{suggestion.category.replace(/_/g, ' ')}</span></span>
          </div>
        </div>
      )}
    </div>
  );
}
