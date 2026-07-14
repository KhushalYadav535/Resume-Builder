"use client";
import React, { useState, useEffect } from "react";
import { ResumeSuggestion } from "@/lib/types/suggestions";
import { ClassicLoader } from "@/components/ui/Loader";
import { useRouter } from "next/navigation";
import { Sparkles } from "lucide-react";

interface ResumeSuggestionsModalProps {
  resumeId: string;
  suggestions: ResumeSuggestion[];
  currentScore: number;
  potentialScore: number;
  onClose: () => void;
  onApply: (selectedIds: string[]) => void;
}

export default function ResumeSuggestionsModal({
  resumeId,
  suggestions,
  currentScore,
  potentialScore,
  onClose,
  onApply,
}: ResumeSuggestionsModalProps) {
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [localSuggestions, setLocalSuggestions] = useState<ResumeSuggestion[]>(suggestions);
  const [activeTab, setActiveTab] = useState<"high" | "all" | "category">("high");
  const [isApplying, setIsApplying] = useState(false);

  // Initialize with all high priority selected
  useEffect(() => {
    const initialSelected = new Set<string>();
    suggestions.forEach(s => {
      if (s.priority >= 4) initialSelected.add(s.id);
    });
    setSelectedIds(initialSelected);
  }, [suggestions]);

  // Calculate dynamic estimated score
  const scoreImprovementPerSuggestion = Math.max(1, Math.round((potentialScore - currentScore) / (suggestions.length || 1)));
  const estimatedNewScore = Math.min(100, currentScore + (selectedIds.size * scoreImprovementPerSuggestion));

  // Keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [onClose]);

  const toggleSelection = (id: string) => {
    const next = new Set(selectedIds);
    if (next.has(id)) next.delete(id);
    else next.add(id);
    setSelectedIds(next);
  };

  const handleDismiss = async (id: string) => {
    try {
      const res = await fetch("/api/resume/suggestions/accept", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ resumeId, suggestionIds: [id], action: 'reject' })
      });
      if (res.ok) {
        setLocalSuggestions(prev => prev.filter(s => s.id !== id));
        const nextSelected = new Set(selectedIds);
        nextSelected.delete(id);
        setSelectedIds(nextSelected);
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleApply = async () => {
    if (selectedIds.size === 0) return;
    setIsApplying(true);
    
    // First mark as accepted in the DB so the apply route can find them
    try {
      await fetch("/api/resume/suggestions/accept", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ resumeId, suggestionIds: Array.from(selectedIds), action: 'accept' })
      });
      
      onApply(Array.from(selectedIds));
    } catch (err) {
      console.error(err);
      setIsApplying(false);
    }
  };

  const filteredSuggestions = localSuggestions.filter(s => {
    if (activeTab === "high") return s.priority >= 4;
    return true;
  }).sort((a, b) => {
    if (activeTab === "category") return a.category.localeCompare(b.category);
    return b.priority - a.priority;
  });

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 bg-black/40 backdrop-blur-md animate-in fade-in duration-300">
      <div 
        className="w-full max-w-4xl max-h-[90vh] bg-white text-gray-900 border border-gray-200 rounded-2xl shadow-2xl flex flex-col overflow-hidden relative"
      >
        
        {/* Header */}
        <div className="p-6 border-b border-gray-200 bg-gray-50">
          <div className="flex justify-between items-start mb-6">
            <div>
              <h2 className="text-2xl font-extrabold flex items-center gap-2 text-gray-900 font-syne">
                <Sparkles className="text-amber-500" size={24} />
                Resume Improvement Suggestions
              </h2>
              <p className="text-gray-500 mt-1 text-sm">
                We scanned your resume and found these high-value missing keywords and skills.
              </p>
            </div>
            <button onClick={onClose} className="p-2 text-gray-400 hover:text-gray-900 rounded-full hover:bg-gray-200 transition-colors">
              ✕
            </button>
          </div>

          <div className="flex items-center gap-8 p-5 rounded-xl border border-indigo-100 bg-indigo-50/50 shadow-sm">
            <div>
              <div className="text-[0.7rem] font-bold uppercase tracking-widest text-gray-500 mb-1">Current Score</div>
              <div className="text-3xl font-black font-syne" style={{ color: currentScore >= 70 ? '#10b981' : '#f59e0b' }}>
                {currentScore}<span className="text-lg text-gray-400 font-normal">/100</span>
              </div>
            </div>
            <div className="h-12 w-px bg-gray-200"></div>
            <div>
              <div className="text-[0.7rem] font-bold uppercase tracking-widest text-indigo-600 mb-1">Potential Score</div>
              <div className="text-3xl font-black font-syne text-indigo-600 flex items-baseline gap-2">
                {estimatedNewScore}<span className="text-lg text-indigo-400 font-normal">/100</span>
                {estimatedNewScore > currentScore && (
                  <span className="text-sm font-bold text-[#43e97b] bg-[#43e97b]/10 px-2 py-0.5 rounded">
                    +{estimatedNewScore - currentScore} pts
                  </span>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex gap-2 px-6 pt-4 pb-0 bg-gray-50/50 border-b border-gray-200 overflow-x-auto">
          <button 
            onClick={() => setActiveTab('high')}
            className={`px-4 py-2.5 rounded-t-lg text-sm font-semibold transition-colors whitespace-nowrap border-b-2 ${activeTab === 'high' ? 'border-indigo-600 text-indigo-700 bg-indigo-50' : 'border-transparent text-gray-500 hover:bg-gray-100 hover:text-gray-900'}`}
          >
            🔥 High Priority ({localSuggestions.filter(s => s.priority >= 4).length})
          </button>
          <button 
            onClick={() => setActiveTab('all')}
            className={`px-4 py-2.5 rounded-t-lg text-sm font-semibold transition-colors whitespace-nowrap border-b-2 ${activeTab === 'all' ? 'border-indigo-600 text-indigo-700 bg-indigo-50' : 'border-transparent text-gray-500 hover:bg-gray-100 hover:text-gray-900'}`}
          >
            All Suggestions ({localSuggestions.length})
          </button>
          <button 
            onClick={() => setActiveTab('category')}
            className={`px-4 py-2.5 rounded-t-lg text-sm font-semibold transition-colors whitespace-nowrap border-b-2 ${activeTab === 'category' ? 'border-indigo-600 text-indigo-700 bg-indigo-50' : 'border-transparent text-gray-500 hover:bg-gray-100 hover:text-gray-900'}`}
          >
            By Category
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6 space-y-4 bg-white">
          {filteredSuggestions.length === 0 ? (
            <div className="text-center py-16 text-gray-500 bg-gray-50 rounded-xl border border-dashed border-gray-300">
              <p className="text-sm font-medium">No suggestions found for this filter.</p>
            </div>
          ) : (
            filteredSuggestions.map((suggestion) => {
              const isSelected = selectedIds.has(suggestion.id);
              return (
                <div 
                  key={suggestion.id}
                  onClick={() => toggleSelection(suggestion.id)}
                  className={`group flex gap-4 p-5 rounded-xl border transition-all cursor-pointer shadow-sm ${
                    isSelected 
                      ? 'border-indigo-500 bg-indigo-50/30 ring-1 ring-indigo-500' 
                      : 'border-gray-200 hover:border-indigo-300 bg-white hover:shadow-md'
                  }`}
                >
                  <div className="pt-1">
                    <div className={`w-6 h-6 rounded flex items-center justify-center transition-colors border ${
                      isSelected ? 'bg-indigo-600 border-indigo-600 text-white' : 'border-gray-300 bg-gray-50'
                    }`}>
                      {isSelected && <span className="text-sm">✓</span>}
                    </div>
                  </div>
                  
                  <div className="flex-1 min-w-0">
                    <div className="flex flex-wrap items-center gap-3 mb-2">
                      <h3 className="font-bold text-gray-900 text-[16px]">{suggestion.title}</h3>
                      <span className="text-[11px] font-medium px-2 py-0.5 rounded-full bg-gray-100 border border-gray-200 text-gray-600 capitalize">
                        {suggestion.category.replace('_', ' ')}
                      </span>
                      <span className="text-[11px] font-semibold px-2 py-0.5 rounded-full bg-indigo-100 border border-indigo-200 text-indigo-700 capitalize">
                        Add to: {suggestion.whereToAdd}
                      </span>
                      <div className="ml-auto flex text-amber-500 text-xs gap-[1px]">
                        {Array.from({ length: 5 }).map((_, i) => (
                          <span key={i} className={i < suggestion.priority ? 'opacity-100' : 'opacity-20'}>★</span>
                        ))}
                      </div>
                    </div>
                    
                    <p className="text-[14px] text-gray-600 leading-relaxed mb-4">{suggestion.description}</p>
                    
                    <div className="bg-gray-50 border border-gray-200 rounded-lg p-4 relative overflow-hidden shadow-inner">
                      <div className="absolute left-0 top-0 bottom-0 w-[3px] bg-indigo-500"></div>
                      <code className="text-[13px] text-gray-800 font-mono leading-relaxed block pl-3">
                        "{suggestion.suggestedText}"
                      </code>
                    </div>
                  </div>

                  <div className="flex flex-col gap-2 justify-start pt-1">
                    <button 
                      onClick={(e) => { e.stopPropagation(); handleDismiss(suggestion.id); }}
                      className="p-2 text-muted-foreground hover:text-red-400 rounded-lg hover:bg-red-400/10 transition-colors opacity-0 group-hover:opacity-100"
                      title="Dismiss this suggestion"
                    >
                      ✕
                    </button>
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-gray-200 bg-gray-50 flex flex-wrap items-center justify-between gap-4">
          <div className="text-[13px] text-gray-500 flex items-center gap-2">
            <span className="text-gray-900 font-bold bg-white px-2 py-0.5 rounded border border-gray-300">{selectedIds.size}</span> selected
            <span className="mx-1 opacity-50">•</span>
            <kbd className="px-2 py-1 bg-white border border-gray-300 rounded text-[11px] font-mono shadow-sm">Space</kbd> to toggle
          </div>
          <div className="flex gap-3">
            <button 
              onClick={onClose}
              className="px-5 py-2.5 rounded-lg font-medium text-sm text-gray-500 hover:text-gray-900 hover:bg-gray-200 transition-colors"
            >
              Skip
            </button>
            <button 
              onClick={handleApply}
              disabled={selectedIds.size === 0 || isApplying}
              className="px-6 py-2.5 rounded-lg font-semibold text-[14px] bg-indigo-600 text-white hover:bg-indigo-700 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2 active:scale-[0.98]"
              style={{ boxShadow: selectedIds.size > 0 ? '0 4px 14px rgba(79, 70, 229, 0.35)' : 'none' }}
            >
              {isApplying ? (
                <><ClassicLoader /> Applying...</>
              ) : (
                <>Apply Selected <span className="opacity-70 font-normal">→</span></>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
