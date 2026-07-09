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
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-300">
      <div 
        className="w-full max-w-4xl max-h-[90vh] bg-card border border-accent/20 rounded-2xl shadow-2xl flex flex-col overflow-hidden relative"
        style={{ background: 'linear-gradient(180deg, var(--card) 0%, rgba(20,20,30,0.95) 100%)' }}
      >
        
        {/* Header */}
        <div className="p-6 border-b border-border/50 bg-black/20">
          <div className="flex justify-between items-start mb-4">
            <div>
              <h2 className="text-2xl font-bold flex items-center gap-2 text-white">
                <Sparkles className="text-amber-500" size={24} />
                Resume Improvement Suggestions
              </h2>
              <p className="text-muted-foreground mt-1 text-sm">
                We scanned your resume and found these high-value missing keywords and skills.
              </p>
            </div>
            <button onClick={onClose} className="p-2 text-muted-foreground hover:text-white rounded-full hover:bg-white/10 transition-colors">
              ✕
            </button>
          </div>

          <div className="flex items-center gap-6 p-4 rounded-xl border border-accent/30 bg-accent/5">
            <div>
              <div className="text-xs font-bold uppercase tracking-wider text-muted-foreground mb-1">Current ATS Score</div>
              <div className="text-3xl font-black font-syne" style={{ color: currentScore >= 70 ? '#43e97b' : '#f6d365' }}>
                {currentScore}<span className="text-lg text-muted-foreground font-normal">/100</span>
              </div>
            </div>
            <div className="h-12 w-px bg-border"></div>
            <div>
              <div className="text-xs font-bold uppercase tracking-wider text-accent mb-1">Estimated Potential</div>
              <div className="text-3xl font-black font-syne text-accent flex items-baseline gap-2">
                {estimatedNewScore}<span className="text-lg text-muted-foreground font-normal">/100</span>
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
        <div className="flex gap-1 p-2 bg-black/20 border-b border-border/50 overflow-x-auto">
          <button 
            onClick={() => setActiveTab('high')}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors whitespace-nowrap ${activeTab === 'high' ? 'bg-accent text-white' : 'text-muted-foreground hover:bg-white/5'}`}
          >
            🔥 High Priority ({localSuggestions.filter(s => s.priority >= 4).length})
          </button>
          <button 
            onClick={() => setActiveTab('all')}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors whitespace-nowrap ${activeTab === 'all' ? 'bg-accent text-white' : 'text-muted-foreground hover:bg-white/5'}`}
          >
            All Suggestions ({localSuggestions.length})
          </button>
          <button 
            onClick={() => setActiveTab('category')}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors whitespace-nowrap ${activeTab === 'category' ? 'bg-accent text-white' : 'text-muted-foreground hover:bg-white/5'}`}
          >
            By Category
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-4 space-y-3">
          {filteredSuggestions.length === 0 ? (
            <div className="text-center py-12 text-muted-foreground">
              No suggestions found for this filter.
            </div>
          ) : (
            filteredSuggestions.map((suggestion) => {
              const isSelected = selectedIds.has(suggestion.id);
              return (
                <div 
                  key={suggestion.id}
                  onClick={() => toggleSelection(suggestion.id)}
                  className={`group flex gap-4 p-4 rounded-xl border transition-all cursor-pointer ${
                    isSelected 
                      ? 'border-accent bg-accent/5' 
                      : 'border-border/50 hover:border-border bg-card'
                  }`}
                >
                  <div className="pt-1">
                    <div className={`w-6 h-6 rounded border flex items-center justify-center transition-colors ${
                      isSelected ? 'bg-accent border-accent text-white' : 'border-muted-foreground'
                    }`}>
                      {isSelected && <span className="text-sm">✓</span>}
                    </div>
                  </div>
                  
                  <div className="flex-1 min-w-0">
                    <div className="flex flex-wrap items-center gap-2 mb-1">
                      <h3 className="font-bold text-white text-[15px]">{suggestion.title}</h3>
                      <span className="text-xs px-2 py-0.5 rounded-full bg-white/10 text-muted-foreground capitalize">
                        {suggestion.category.replace('_', ' ')}
                      </span>
                      <span className="text-xs px-2 py-0.5 rounded-full bg-accent/20 text-accent capitalize">
                        Add to: {suggestion.whereToAdd}
                      </span>
                      <div className="ml-auto flex text-yellow-500 text-xs">
                        {Array.from({ length: 5 }).map((_, i) => (
                          <span key={i} className={i < suggestion.priority ? 'opacity-100' : 'opacity-20'}>★</span>
                        ))}
                      </div>
                    </div>
                    
                    <p className="text-sm text-muted-foreground mb-3">{suggestion.description}</p>
                    
                    <div className="bg-black/40 border border-white/5 rounded-lg p-3 relative overflow-hidden">
                      <div className="absolute left-0 top-0 bottom-0 w-1 bg-accent"></div>
                      <code className="text-sm text-white font-mono leading-relaxed block pl-2">
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
        <div className="p-4 border-t border-border/50 bg-black/30 flex items-center justify-between">
          <div className="text-sm text-muted-foreground">
            <span className="text-white font-medium">{selectedIds.size}</span> selected
            <span className="mx-2">•</span>
            <kbd className="px-2 py-1 bg-white/10 rounded text-xs">Space</kbd> to toggle
          </div>
          <div className="flex gap-3">
            <button 
              onClick={onClose}
              className="px-5 py-2.5 rounded-lg font-medium text-sm text-muted-foreground hover:text-white hover:bg-white/5 transition-colors"
            >
              Skip
            </button>
            <button 
              onClick={handleApply}
              disabled={selectedIds.size === 0 || isApplying}
              className="px-6 py-2.5 rounded-lg font-medium text-sm bg-accent text-white hover:bg-accent-2 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
              style={{ boxShadow: '0 0 20px rgba(108, 99, 255, 0.3)' }}
            >
              {isApplying ? (
                <><ClassicLoader /> Applying...</>
              ) : (
                <>Apply Selected & Open Builder ↗</>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
