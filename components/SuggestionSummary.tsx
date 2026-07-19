"use client";

import { useState } from "react";
import { ResumeSuggestion } from "@/lib/types/comprehensive-suggestions";

interface SuggestionSummaryProps {
  acceptedCount: number;
  skippedCount: number;
  totalSuggestions: number;
  currentScore: number;
  estimatedNewScore: number;
  acceptedSuggestions: ResumeSuggestion[];
  onApply: () => void;
  onReview: () => void;
}

export function SuggestionSummary({
  acceptedCount,
  skippedCount,
  totalSuggestions,
  currentScore,
  estimatedNewScore,
  acceptedSuggestions,
  onApply,
  onReview
}: SuggestionSummaryProps) {
  const [isApplying, setIsApplying] = useState(false);
  const [applied, setApplied] = useState(false);

  const handleApply = () => {
    if (isApplying || applied) return;
    setIsApplying(true);
    setApplied(true);
    onApply();
  };
  
  return (
    <div className="w-full px-6 py-4 animate-in fade-in zoom-in-95 duration-300">
      
      {/* 12-Column Grid Layout: Left (Info, Stats & CTAs) vs Right (Upgraded Points Preview) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        
        {/* LEFT COLUMN: Success Header, Stats, Score Progress & Action Buttons (5 Columns) */}
        <div className="lg:col-span-5 flex flex-col space-y-6">
          
          {/* Header Card */}
          <div className="flex items-center gap-3.5 pb-4 border-b border-slate-200 dark:border-gray-800">
            <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-green-100 dark:bg-green-500/10 text-green-700 dark:text-green-400 border-2 border-green-300 dark:border-green-500/25 text-xl font-bold">
              ✓
            </div>
            <div>
              <h2 className="text-xl md:text-2xl font-black text-slate-950 dark:text-white leading-tight tracking-tight">
                Review Complete!
              </h2>
              <p className="text-xs text-slate-700 dark:text-gray-400 font-bold">
                All {totalSuggestions} recommendations reviewed
              </p>
            </div>
          </div>

          {/* Stats Cards (2 Column Grid) */}
          <div className="grid grid-cols-2 gap-4">
            <div className="p-4 rounded-2xl bg-green-100/60 border-2 border-green-300 dark:bg-green-500/10 dark:border-green-500/30 flex flex-col justify-between shadow-sm">
              <span className="text-[10px] font-black text-green-800 dark:text-green-400 uppercase tracking-wider">Accepted</span>
              <div className="mt-2 flex items-baseline gap-0.5">
                <span className="text-2xl md:text-3xl font-black text-green-800 dark:text-green-400">{acceptedCount}</span>
                <span className="text-[10px] text-green-700 dark:text-green-500/70 font-bold">saved</span>
              </div>
            </div>

            <div className="p-4 rounded-2xl bg-indigo-100/60 border-2 border-indigo-300 dark:bg-indigo-500/10 dark:border-indigo-500/30 flex flex-col justify-between shadow-sm">
              <span className="text-[10px] font-black text-indigo-800 dark:text-indigo-400 uppercase tracking-wider">Impact Lift</span>
              <div className="mt-2 flex items-baseline gap-0.5">
                <span className="text-2xl md:text-3xl font-black text-indigo-800 dark:text-indigo-400">
                  +{estimatedNewScore - currentScore}
                </span>
                <span className="text-[10px] text-indigo-700 dark:text-indigo-400/80 font-bold">points</span>
              </div>
            </div>
          </div>

          {/* Score progression card */}
          <div className="bg-slate-100/80 border-2 border-slate-300 dark:bg-slate-900/60 dark:border-gray-800 rounded-2xl p-4.5 space-y-4 shadow-sm">
            <span className="text-[10px] font-bold text-slate-700 dark:text-gray-400 uppercase tracking-widest block">
              Score Progression
            </span>
            
            <div className="space-y-3.5">
              {/* original */}
              <div>
                <div className="flex justify-between items-baseline mb-1.5">
                  <span className="text-[11px] text-slate-900 dark:text-gray-300 font-bold">Original Score</span>
                  <span className="text-[11px] font-black text-slate-800 dark:text-white font-mono">{currentScore}/100</span>
                </div>
                <div className="w-full h-2 bg-slate-300 dark:bg-slate-800 rounded-full overflow-hidden">
                  <div 
                    className="h-full bg-slate-500 transition-all duration-500"
                    style={{ width: `${currentScore}%` }}
                  ></div>
                </div>
              </div>

              {/* new */}
              <div>
                <div className="flex justify-between items-baseline mb-1.5">
                  <span className="text-[11px] text-slate-900 dark:text-gray-300 font-bold">Estimated New Score</span>
                  <span className="text-[11px] font-black text-green-700 dark:text-green-400 font-mono">{estimatedNewScore}/100</span>
                </div>
                <div className="w-full h-2 bg-slate-300 dark:bg-slate-800 rounded-full overflow-hidden">
                  <div 
                    className="h-full bg-gradient-to-r from-indigo-500 to-green-400 transition-all duration-500"
                    style={{ width: `${estimatedNewScore}%` }}
                  ></div>
                </div>
              </div>
            </div>
          </div>

          {/* Action CTAs stacked vertically directly below metrics */}
          <div className="space-y-3 pt-3 border-t-2 border-slate-200 dark:border-gray-800/60">
            {!applied ? (
              <button 
                onClick={handleApply}
                disabled={isApplying || acceptedCount === 0}
                className="w-full py-4 rounded-xl font-black text-sm bg-gradient-to-r from-indigo-500 to-purple-600 text-white hover:opacity-95 transition-all shadow-[0_0_25px_rgba(99,102,241,0.25)] active:scale-[0.99] disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isApplying ? "Applying..." : "Apply Changes & Open Builder"}
              </button>
            ) : (
              <div className="w-full py-4 rounded-xl font-black text-sm bg-green-500/20 border-2 border-green-500/40 text-green-600 text-center">
                Changes Applied!
              </div>
            )}
            <button 
              onClick={onReview}
              className="w-full py-3 rounded-xl font-bold text-xs bg-slate-200 hover:bg-slate-300 text-slate-900 border-2 border-slate-300 dark:bg-slate-800 dark:hover:bg-slate-700 dark:text-gray-300 dark:border-gray-700 active:scale-[0.99]"
            >
              Review My Choices
            </button>
          </div>

        </div>

        {/* RIGHT COLUMN: Preview of Upgraded Points (7 Columns) */}
        <div className="lg:col-span-7 flex flex-col h-full space-y-3.5">
          <div className="flex items-center justify-between border-b-2 border-slate-200 dark:border-gray-800 pb-2">
            <h3 className="text-xs font-black text-slate-950 dark:text-white tracking-wider uppercase">
              Preview of Upgraded Points ({acceptedCount})
            </h3>
            <span className="text-[10px] text-slate-600 dark:text-gray-400 font-bold hidden sm:block">
              Accepted modifications
            </span>
          </div>

          {acceptedSuggestions.length > 0 ? (
            <div className="space-y-3 overflow-y-auto max-h-[520px] pr-2.5 custom-scrollbar">
              {acceptedSuggestions.map((sugg, idx) => (
                <div 
                  key={sugg.id} 
                  className="p-4 bg-white border-2 border-slate-300 dark:bg-slate-900/60 dark:border-gray-800 rounded-2xl shadow-sm hover:shadow-md transition-all space-y-2.5"
                >
                  <div className="flex items-center justify-between gap-4">
                    <span className="text-[11px] font-black text-indigo-700 dark:text-indigo-400 uppercase tracking-wide">
                      {sugg.title}
                    </span>
                    <span className="text-[9px] text-slate-600 dark:text-gray-500 uppercase font-black bg-slate-100 dark:bg-slate-800 px-2 py-0.5 rounded border border-slate-300 dark:border-gray-700">
                      {sugg.section}
                    </span>
                  </div>
                  <p className="text-xs md:text-sm text-slate-900 dark:text-gray-200 leading-relaxed font-bold break-words">
                    "{sugg.suggestedText}"
                  </p>
                </div>
              ))}
            </div>
          ) : (
            <div className="flex flex-col justify-center items-center text-center p-8 bg-slate-100/80 border-2 border-slate-300 dark:bg-slate-900/40 dark:border-gray-800 rounded-2xl min-h-[260px]">
              <span className="text-2xl mb-1">⊘</span>
              <p className="text-xs text-slate-700 dark:text-gray-400 font-bold">No suggestions were accepted.</p>
            </div>
          )}
        </div>

      </div>
    </div>
  );
}
