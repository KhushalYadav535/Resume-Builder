"use client";

import { ResumeSuggestion } from "@/lib/types/comprehensive-suggestions";

interface SuggestionCardProps {
  suggestion: ResumeSuggestion;
  currentIndex: number;
  totalSuggestions: number;
  onAccept: () => void;
  onSkip: () => void;
  onLearnMore: () => void;
}

export function SuggestionCard({
  suggestion,
  currentIndex,
  totalSuggestions,
  onAccept,
  onSkip,
  onLearnMore
}: SuggestionCardProps) {
  
  // Priority color mapping (with enhanced contrast details for light mode)
  const priorityColors = {
    5: { bg: 'bg-red-50 dark:bg-red-500/10', border: 'border-red-300 dark:border-red-500/30', text: 'text-red-800 dark:text-red-400', label: 'CRITICAL' },
    4: { bg: 'bg-orange-50 dark:bg-orange-500/10', border: 'border-orange-300 dark:border-orange-500/30', text: 'text-orange-800 dark:text-orange-400', label: 'HIGH' },
    3: { bg: 'bg-amber-50 dark:bg-amber-500/10', border: 'border-amber-300 dark:border-amber-500/30', text: 'text-amber-800 dark:text-amber-400', label: 'MEDIUM' },
    2: { bg: 'bg-yellow-50 dark:bg-yellow-500/10', border: 'border-yellow-300 dark:border-yellow-500/30', text: 'text-yellow-800 dark:text-yellow-400', label: 'LOW' },
    1: { bg: 'bg-green-50 dark:bg-green-500/10', border: 'border-green-300 dark:border-green-500/30', text: 'text-green-800 dark:text-green-400', label: 'MINOR' }
  };

  const priority = (suggestion.priority || 3) as keyof typeof priorityColors;
  const colors = priorityColors[priority];

  // Deterministic point computation to avoid hydration mismatches
  const estimatedImpactPoints = suggestion.priority >= 4 ? (suggestion.priority === 5 ? 5 : 3) : 2;

  return (
    <div className="w-full px-6 py-4 suggestion-card">
      <div className={`p-6 md:p-8 rounded-3xl border-2 ${colors.border} ${colors.bg} backdrop-blur-md shadow-2xl transition-all duration-300`}>
        {/* Dynamic Grid: Left (Metadata & Info) vs Right (Before/After Comparison) */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-stretch">
          
          {/* LEFT SECTION: Info & Details (5 Columns) */}
          <div className="lg:col-span-5 flex flex-col justify-between space-y-6">
            <div className="space-y-4">
              <div className="flex items-center justify-between gap-4">
                <span className="text-[10px] font-black text-slate-700 dark:text-gray-400 uppercase tracking-widest">
                  RECOMMENDATION {currentIndex} OF {totalSuggestions}
                </span>
                <span className={`px-2.5 py-0.5 rounded-md text-[9px] font-black tracking-wider uppercase border border-current ${colors.text}`}>
                  {colors.label}
                </span>
              </div>

              <h3 className="text-xl md:text-2xl font-black text-slate-950 dark:text-white leading-tight tracking-tight">
                {suggestion.title}
              </h3>

              <p className="text-xs md:text-sm text-slate-900 dark:text-gray-300 leading-relaxed font-bold">
                {suggestion.description}
              </p>

              {/* Strategic Alignment Alignment Card */}
              <div className="bg-slate-100/80 border-2 border-slate-300 dark:bg-indigo-500/5 dark:border-indigo-500/20 rounded-2xl p-4 space-y-2.5 shadow-sm">
                <span className="text-[10px] font-black text-indigo-700 dark:text-indigo-400 uppercase tracking-wider block">
                  💡 Strategic Alignment
                </span>
                <ul className="space-y-2 text-[11px] md:text-xs">
                  <li className="text-slate-950 dark:text-gray-300 flex items-start gap-2">
                    <span className="text-indigo-600 dark:text-indigo-400 font-bold mt-0.5">•</span>
                    <span><strong>Impact:</strong> {suggestion.reasoning}</span>
                  </li>
                  <li className="text-slate-950 dark:text-gray-300 flex items-start gap-2">
                    <span className="text-indigo-600 dark:text-indigo-400 font-bold mt-0.5">•</span>
                    <span><strong>ATS Valuation:</strong> Worth +{estimatedImpactPoints} points</span>
                  </li>
                </ul>
              </div>
            </div>

            {/* CTAs Stacked at Bottom of Left Column */}
            <div className="space-y-4 pt-3">
              <div className="flex flex-col sm:flex-row gap-3">
                <button 
                  onClick={onAccept}
                  className="flex-1 px-6 py-3.5 rounded-xl font-bold text-xs bg-gradient-to-r from-indigo-500 to-purple-600 text-white hover:opacity-95 transition-all shadow-md active:scale-[0.99]"
                >
                  ✓ Accept & Continue
                </button>
                <button 
                  onClick={onSkip}
                  className="px-6 py-3.5 rounded-xl font-bold text-xs bg-slate-200 hover:bg-slate-300 text-slate-900 border-2 border-slate-300 dark:bg-slate-800 dark:hover:bg-slate-700/80 dark:text-gray-300 dark:border-gray-700/50 active:scale-[0.99]"
                >
                  ⊘ Skip
                </button>
              </div>

              {/* Progress bar */}
              <div className="space-y-1.5 pt-2 border-t-2 border-slate-300 dark:border-gray-800/50">
                <div className="w-full h-2 bg-slate-300 dark:bg-slate-800 rounded-full overflow-hidden">
                  <div 
                    className="h-full bg-gradient-to-r from-indigo-500 to-purple-500 progress-bar"
                    style={{ width: `${(currentIndex / totalSuggestions) * 100}%` }}
                  ></div>
                </div>
              </div>
            </div>
          </div>

          {/* RIGHT SECTION: Before / After Text Blocks (7 Columns) */}
          <div className="lg:col-span-7 flex flex-col justify-between gap-5">
            {suggestion.currentText ? (
              <div className="flex flex-col h-full gap-5">
                {/* BEFORE CONTAINER */}
                <div className="flex-1 flex flex-col min-h-0">
                  <span className="text-[10px] font-black text-red-700 dark:text-red-400 uppercase tracking-wider mb-1.5 flex items-center gap-1">
                    ✕ Current Phrase
                  </span>
                  <div className="flex-1 p-4 bg-red-100/60 border-2 border-red-300 dark:bg-red-500/5 dark:border-red-500/20 rounded-2xl overflow-y-auto max-h-[140px] lg:max-h-none shadow-inner">
                    <p className="text-xs text-slate-950 dark:text-gray-300 leading-relaxed font-bold break-words whitespace-pre-wrap">
                      "{suggestion.currentText}"
                    </p>
                  </div>
                </div>

                {/* AFTER CONTAINER */}
                <div className="flex-1 flex flex-col min-h-0">
                  <span className="text-[10px] font-black text-green-700 dark:text-green-400 uppercase tracking-wider mb-1.5 flex items-center gap-1">
                    ✓ Recommended Upgrade
                  </span>
                  <div className="flex-1 p-4 bg-green-100/60 border-2 border-green-300 dark:bg-green-500/5 dark:border-green-500/20 rounded-2xl overflow-y-auto max-h-[140px] lg:max-h-none shadow-inner">
                    <p className="text-xs text-slate-950 dark:text-gray-100 leading-relaxed font-black break-words whitespace-pre-wrap">
                      "{suggestion.suggestedText}"
                    </p>
                  </div>
                </div>
              </div>
            ) : (
              <div className="h-full flex flex-col justify-center items-center text-center p-6 bg-slate-100/80 border-2 border-slate-300 dark:bg-slate-900/40 dark:border-gray-800 rounded-2xl min-h-[240px]">
                <span className="text-2xl mb-2">➕</span>
                <h4 className="text-sm font-black text-slate-900 dark:text-white mb-1">Addition Recommended</h4>
                <p className="text-xs text-slate-700 dark:text-gray-400 max-w-sm font-medium">
                  This skill category is completely missing from your resume. We recommend adding the following segment directly to your <strong className="uppercase text-slate-900 dark:text-white">{suggestion.section}</strong> section:
                </p>
                <div className="mt-4 p-3.5 bg-green-100/60 border-2 border-green-300 dark:bg-green-500/5 dark:border-green-500/20 rounded-xl w-full">
                  <p className="text-xs font-black text-slate-950 dark:text-gray-100 break-words">
                    "{suggestion.suggestedText}"
                  </p>
                </div>
              </div>
            )}
          </div>

        </div>
      </div>
    </div>
  );
}
