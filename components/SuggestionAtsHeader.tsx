"use client";

interface SuggestionAtsHeaderProps {
  currentScore: number;
  estimatedNewScore: number;
  totalSuggestions: number;
  acceptedCount: number;
}

export function SuggestionAtsHeader({
  currentScore,
  estimatedNewScore,
  totalSuggestions,
  acceptedCount
}: SuggestionAtsHeaderProps) {
  return (
    <div className="sticky top-0 z-40 bg-slate-100/95 border-b border-slate-300 backdrop-blur-md dark:bg-slate-950/90 dark:border-indigo-500/20 py-5 shadow-md">
      <div className="w-full px-6 flex flex-col md:flex-row md:items-center justify-between gap-6">
        
        {/* Left Side: Progress & Title */}
        <div className="space-y-1">
          <h2 className="text-xl md:text-2xl font-black text-slate-900 dark:text-white flex items-center gap-2 tracking-tight">
            ✨ AI Optimizer
          </h2>
          <p className="text-xs md:text-sm text-slate-700 dark:text-gray-400 font-bold">
            {acceptedCount} of {totalSuggestions} recommendations accepted
          </p>
        </div>

        {/* Right Side: Large ATS Score Badges */}
        <div className="flex flex-row items-center gap-4 sm:gap-6 self-start md:self-auto">
          
          {/* Current Score Badge */}
          <div className="flex flex-col items-center justify-center px-5 py-3 rounded-2xl bg-white border-2 border-slate-300 dark:bg-slate-900 dark:border-gray-800 shadow-md min-w-[110px] md:min-w-[130px] transition-all">
            <span className="text-[10px] font-black text-slate-800 dark:text-gray-400 uppercase tracking-widest mb-1">
              Current ATS
            </span>
            <div className="flex items-baseline">
              <span className="text-3xl md:text-4xl font-extrabold text-slate-900 dark:text-white font-mono">
                {currentScore}
              </span>
              <span className="text-xs text-slate-600 dark:text-gray-500 font-bold ml-0.5">/100</span>
            </div>
          </div>

          {/* Arrow Separator */}
          <div className="text-slate-400 dark:text-gray-600 font-black text-xl md:text-2xl">
            ➔
          </div>

          {/* Potential Score Badge */}
          <div className="flex flex-col items-center justify-center px-5 py-3 rounded-2xl bg-emerald-50 border-2 border-emerald-300 dark:bg-emerald-500/10 dark:border-emerald-500/20 shadow-md min-w-[120px] md:min-w-[140px] transition-all relative">
            <span className="text-[10px] font-black text-emerald-800 dark:text-emerald-400 uppercase tracking-widest mb-1">
              Potential ATS
            </span>
            <div className="flex items-baseline gap-1">
              <span className="text-3xl md:text-4xl font-extrabold text-emerald-700 dark:text-emerald-400 font-mono">
                {estimatedNewScore}
              </span>
              <span className="text-xs text-emerald-600 dark:text-emerald-500 font-bold">/100</span>
            </div>
            
            {/* Diff badge overlay */}
            <span className="absolute -top-2 -right-2 text-[10px] text-white font-extrabold bg-gradient-to-r from-emerald-500 to-green-600 px-2 py-0.5 rounded-full border-2 border-white dark:border-slate-950 shadow-sm animate-pulse">
              +{estimatedNewScore - currentScore} pts
            </span>
          </div>

        </div>
      </div>
    </div>
  );
}
