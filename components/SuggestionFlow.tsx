"use client";

import { useState, useEffect } from 'react';
import { ResumeSuggestion } from '@/lib/types/comprehensive-suggestions';
import { SuggestionCard } from './SuggestionCard';
import { SuggestionSummary } from './SuggestionSummary';
import { SuggestionAtsHeader } from './SuggestionAtsHeader';

interface SuggestionFlowProps {
  suggestions: ResumeSuggestion[];
  currentScore: number;
  estimatedNewScore: number; // fallback/maximum potential
  onApplyChanges: (accepted: ResumeSuggestion[]) => void;
}

export function SuggestionFlow({
  suggestions,
  currentScore,
  estimatedNewScore,
  onApplyChanges
}: SuggestionFlowProps) {
  
  // State: 'wizard' (card-by-card), 'summary' (stats overview), 'list' (all-in-one checklist)
  const [viewMode, setViewMode] = useState<'wizard' | 'summary' | 'list'>('wizard');
  const [currentIndex, setCurrentIndex] = useState(0);
  const [acceptedIndices, setAcceptedIndices] = useState<Set<number>>(new Set());

  // Keyboard navigation for wizard mode
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (viewMode !== 'wizard' || !suggestions || suggestions.length === 0) return;
      const activeElement = document.activeElement;
      if (activeElement && (activeElement.tagName === "INPUT" || activeElement.tagName === "TEXTAREA")) {
        return;
      }

      if (e.key === "Enter") {
        e.preventDefault();
        handleAccept();
      } else if (e.key === "Escape" || e.key === "ArrowRight") {
        e.preventDefault();
        handleSkip();
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [currentIndex, viewMode, suggestions, acceptedIndices]);

  if (!suggestions || suggestions.length === 0) {
    return (
      <div className="max-w-4xl mx-auto px-6 py-12 text-center text-gray-400">
        No active suggestions to review.
      </div>
    );
  }

  // Handlers
  const handleAccept = () => {
    const nextAccepted = new Set(acceptedIndices);
    nextAccepted.add(currentIndex);
    setAcceptedIndices(nextAccepted);
    handleNext();
  };

  const handleSkip = () => {
    handleNext();
  };

  const handleNext = () => {
    if (currentIndex < suggestions.length - 1) {
      setCurrentIndex(currentIndex + 1);
    } else {
      setViewMode('summary');
    }
  };

  const handleApply = () => {
    const accepted = Array.from(acceptedIndices).map(idx => suggestions[idx]);
    onApplyChanges(accepted);
  };

  const handleReview = () => {
    // Switch to List View so they can review all changes on a single page
    setViewMode('list');
  };

  // Calculate potential score progress based on accepted items (1.5 pts per accepted item, max 100)
  const currentDynamicNewScore = Math.min(100, currentScore + Math.floor(acceptedIndices.size * 1.5));

  // ── 1. SUMMARY VIEW ─────────────────────────────────
  if (viewMode === 'summary') {
    return (
      <SuggestionSummary
        acceptedCount={acceptedIndices.size}
        skippedCount={suggestions.length - acceptedIndices.size}
        totalSuggestions={suggestions.length}
        currentScore={currentScore}
        estimatedNewScore={currentDynamicNewScore}
        acceptedSuggestions={Array.from(acceptedIndices).map(idx => suggestions[idx])}
        onApply={handleApply}
        onReview={handleReview}
      />
    );
  }

  // ── 2. LIST VIEW (ALL-IN-ONE SINGLE PAGE REVIEW) ─────
  if (viewMode === 'list') {
    return (
      <div className="space-y-6 animate-in fade-in duration-300">
        <SuggestionAtsHeader
          currentScore={currentScore}
          estimatedNewScore={currentDynamicNewScore}
          totalSuggestions={suggestions.length}
          acceptedCount={acceptedIndices.size}
        />
        
        <div className="w-full px-6 py-4">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
            
            {/* LEFT COLUMN: Title & Actions Stack (5 Columns) */}
            <div className="lg:col-span-5 flex flex-col space-y-6">
              <div className="space-y-2.5 pb-4 border-b border-slate-200 dark:border-gray-800">
                <h2 className="text-xl md:text-2xl font-black text-slate-950 dark:text-white leading-tight tracking-tight">
                  Review All Recommendations
                </h2>
                <p className="text-xs text-slate-700 dark:text-gray-400 font-bold">
                  Toggle accept/skip choices on each item, then click Save at the bottom.
                </p>
              </div>

              {/* Action Buttons stacked vertically directly below titles */}
              <div className="space-y-3">
                <button 
                  onClick={handleApply}
                  className="w-full py-4 rounded-xl font-black text-sm bg-gradient-to-r from-indigo-500 to-purple-600 text-white hover:opacity-95 transition-all shadow-[0_0_25px_rgba(99,102,241,0.25)] active:scale-[0.99]"
                >
                  ✓ Save & Apply Changes
                </button>
                <button 
                  onClick={() => setViewMode('summary')}
                  className="w-full py-3 rounded-xl font-bold text-xs bg-slate-200 hover:bg-slate-300 text-slate-900 border-2 border-slate-300 dark:bg-slate-800 dark:hover:bg-slate-700 dark:text-gray-300 dark:border-gray-700 active:scale-[0.99]"
                >
                  ← Back to Summary
                </button>
              </div>
            </div>

            {/* RIGHT COLUMN: Checklist Items List (7 Columns) */}
            <div className="lg:col-span-7 flex flex-col space-y-3.5">
              <div className="space-y-4 overflow-y-auto max-h-[520px] pr-2.5 custom-scrollbar">
                {suggestions.map((sugg, idx) => {
                  const isAccepted = acceptedIndices.has(idx);
                  const priorityColors = {
                    5: { bg: 'bg-red-50 dark:bg-red-500/10', border: 'border-red-300 dark:border-red-500/30', text: 'text-red-800 dark:text-red-400', label: 'CRITICAL' },
                    4: { bg: 'bg-orange-50 dark:bg-orange-500/10', border: 'border-orange-300 dark:border-orange-500/30', text: 'text-orange-800 dark:text-orange-400', label: 'HIGH' },
                    3: { bg: 'bg-amber-50 dark:bg-amber-500/10', border: 'border-amber-300 dark:border-amber-500/30', text: 'text-amber-600 dark:text-amber-400', label: 'MEDIUM' },
                    2: { bg: 'bg-yellow-50 dark:bg-yellow-500/10', border: 'border-yellow-200 dark:border-yellow-500/30', text: 'text-yellow-800 dark:text-yellow-400', label: 'LOW' },
                    1: { bg: 'bg-green-50 dark:bg-green-500/10', border: 'border-green-300 dark:border-green-500/30', text: 'text-green-800 dark:text-green-400', label: 'MINOR' }
                  };
                  const colors = priorityColors[(sugg.priority || 3) as keyof typeof priorityColors];
                  
                  return (
                    <div 
                      key={sugg.id} 
                      className={`p-5 rounded-2xl border-2 transition-all duration-200 ${
                        isAccepted 
                          ? `${colors.border} ${colors.bg} shadow-md` 
                          : 'border-slate-200 bg-white dark:border-gray-800 dark:bg-slate-900/40 opacity-80 hover:opacity-100 shadow-sm'
                      }`}
                    >
                      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-5">
                        {/* Left: Content Details */}
                        <div className="flex-1 space-y-2">
                          <div className="flex items-center gap-2">
                            <span className={`px-2 py-0.5 rounded text-[8px] font-black tracking-wider uppercase border border-current ${colors.text}`}>
                              {colors.label}
                            </span>
                            <span className="text-[10px] text-slate-600 dark:text-gray-500 font-black uppercase">
                              {sugg.section}
                            </span>
                          </div>
                          <h4 className="text-base font-black text-slate-950 dark:text-white leading-tight">{sugg.title}</h4>
                          <p className="text-xs text-slate-800 dark:text-gray-300 font-bold leading-relaxed">{sugg.description}</p>
                          
                          {sugg.currentText && (
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mt-3 pt-2 border-t-2 border-slate-100 dark:border-gray-800/40">
                              <div>
                                <span className="text-[9px] font-black text-red-700 dark:text-red-400 uppercase tracking-wider block mb-0.5">✕ Current</span>
                                <p className="text-xs text-slate-950 dark:text-gray-300 leading-relaxed font-bold bg-red-100/60 border-2 border-red-300 dark:bg-red-500/5 dark:border-red-500/10 p-2.5 rounded-lg break-words">"{sugg.currentText}"</p>
                              </div>
                              <div>
                                <span className="text-[9px] font-black text-green-700 dark:text-green-400 uppercase tracking-wider block mb-0.5">✓ Upgrade</span>
                                <p className="text-xs text-slate-950 dark:text-gray-100 leading-relaxed font-black bg-green-100/60 border-2 border-green-300 dark:bg-green-500/5 dark:border-green-500/10 p-2.5 rounded-lg break-words">"{sugg.suggestedText}"</p>
                              </div>
                            </div>
                          )}
                        </div>

                        {/* Right: Choice Toggle Switch */}
                        <div className="self-end md:self-center">
                          <button
                            onClick={() => {
                              const next = new Set(acceptedIndices);
                              if (next.has(idx)) {
                                next.delete(idx);
                              } else {
                                next.add(idx);
                              }
                              setAcceptedIndices(next);
                            }}
                            className={`px-4.5 py-3 rounded-xl font-bold text-xs border-2 transition-all active:scale-[0.98] ${
                              isAccepted
                                ? 'bg-gradient-to-r from-indigo-500 to-purple-600 border-indigo-500 text-white shadow-md'
                                : 'bg-slate-200 hover:bg-slate-300 text-slate-950 border-2 border-slate-300 dark:bg-slate-800 dark:hover:bg-slate-700 dark:text-gray-300 dark:border-gray-700'
                            }`}
                          >
                            {isAccepted ? '✓ Accepted' : '⊘ Skipped'}
                          </button>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

          </div>
        </div>
      </div>
    );
  }

  // ── 3. WIZARD CARD VIEW (DEFAULT) ───────────────────
  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      <SuggestionAtsHeader
        currentScore={currentScore}
        estimatedNewScore={currentDynamicNewScore}
        totalSuggestions={suggestions.length}
        acceptedCount={acceptedIndices.size}
      />

      <SuggestionCard
        suggestion={suggestions[currentIndex]}
        currentIndex={currentIndex + 1}
        totalSuggestions={suggestions.length}
        onAccept={handleAccept}
        onSkip={handleSkip}
        onLearnMore={() => {
          // Can be hooked up to modal or left as placeholder details
        }}
      />
    </div>
  );
}
