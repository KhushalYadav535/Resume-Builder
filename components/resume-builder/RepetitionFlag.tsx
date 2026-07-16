"use client";

import React, { useState } from "react";
import { AlertCircle, ChevronDown, ChevronUp, RefreshCw } from "lucide-react";

export interface RepetitionIssue {
  repeatedPhrase: string;
  count: number;
  lines: { original: string; suggestedVerb: string }[];
}

interface RepetitionFlagProps {
  issues: RepetitionIssue[];
  onApplyAlternative: (originalLine: string, newVerb: string) => void;
}

export function RepetitionFlag({ issues, onApplyAlternative }: RepetitionFlagProps) {
  const [expanded, setExpanded] = useState(false);

  if (!issues || issues.length === 0) return null;

  const totalCount = issues.reduce((acc, issue) => acc + issue.count, 0);
  const mainPhrase = issues[0].repeatedPhrase;

  return (
    <div className="w-full mt-4 bg-[var(--bg-elevated)] border border-[var(--border)] rounded-[8px] overflow-hidden">
      <button 
        onClick={() => setExpanded(!expanded)}
        className="w-full flex items-center justify-between p-3 text-left hover:bg-[var(--bg-2)] transition-colors"
      >
        <div className="flex items-center gap-2">
          <AlertCircle size={16} className="text-[var(--signal-nudge)]" />
          <span className="type-caption text-[var(--text-primary)]">
            {totalCount} lines start with "{mainPhrase}" — diversify?
          </span>
        </div>
        {expanded ? <ChevronUp size={16} className="text-[var(--text-muted)]" /> : <ChevronDown size={16} className="text-[var(--text-muted)]" />}
      </button>

      {expanded && (
        <div className="p-3 border-t border-[var(--border)] flex flex-col gap-3 bg-[var(--bg-surface)]">
          {issues.map((issue, idx) => (
            <div key={idx} className="flex flex-col gap-2">
              <div className="type-micro text-[var(--text-muted)]">Replacing "{issue.repeatedPhrase}"</div>
              {issue.lines.map((line, lIdx) => (
                <div key={lIdx} className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 p-2 bg-[var(--bg-2)] rounded-[6px]">
                  <div className="type-caption text-[var(--text-secondary)] truncate max-w-[70%]">
                    <span className="line-through opacity-50 mr-1">{issue.repeatedPhrase}</span>
                    {line.original.substring(issue.repeatedPhrase.length)}
                  </div>
                  <button 
                    onClick={() => onApplyAlternative(line.original, line.suggestedVerb)}
                    className="flex items-center gap-1 px-2 py-1 bg-[var(--accent-soft)] text-[var(--accent)] rounded-[4px] type-caption font-medium hover:bg-[var(--accent)] hover:text-white transition-colors whitespace-nowrap"
                  >
                    <RefreshCw size={12} />
                    Use "{line.suggestedVerb}"
                  </button>
                </div>
              ))}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
