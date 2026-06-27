"use client";

import React, { useEffect, useState } from "react";
import { ResumeSuggestion } from "@/lib/types/comprehensive-suggestions";
import { Button } from "./ui/Button";

interface AiChangesHistoryModalProps {
  resumeId: string;
  isOpen: boolean;
  onClose: () => void;
}

export function AiChangesHistoryModal({ resumeId, isOpen, onClose }: AiChangesHistoryModalProps) {
  const [suggestions, setSuggestions] = useState<ResumeSuggestion[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (isOpen && resumeId) {
      fetchSuggestions();
    }
  }, [isOpen, resumeId]);

  const fetchSuggestions = async () => {
    setLoading(true);
    setError("");
    try {
      const res = await fetch(`/api/resume/suggestions/accepted?resumeId=${resumeId}`);
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to load history");
      setSuggestions(data.suggestions || []);
    } catch (err: any) {
      console.error(err);
      setError(err.message || "An unexpected error occurred");
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[9999] flex justify-end bg-black/60 backdrop-blur-sm transition-opacity duration-300">
      <div 
        className="fixed inset-0" 
        onClick={onClose}
        aria-hidden="true"
      />
      <div 
        className="relative w-full max-w-2xl h-full border-l border-border/50 shadow-2xl flex flex-col animate-in slide-in-from-right duration-300"
        style={{ background: "var(--bg-surface)" }}
      >
        
        {/* Header */}
        <div 
          className="flex items-center justify-between p-6 border-b border-border/50"
          style={{ background: "var(--bg-elevated)" }}
        >
          <div>
            <h2 className="text-xl font-bold font-syne text-[var(--text-primary)] flex items-center gap-2">
              <span className="text-2xl">✨</span> AI Edits History
            </h2>
            <p className="text-sm text-[var(--text-muted)] mt-1">Review changes applied by the Complete Resume Engine</p>
          </div>
          <button 
            onClick={onClose}
            className="w-8 h-8 flex items-center justify-center rounded-full bg-muted/50 hover:bg-muted text-muted-foreground transition-colors"
          >
            ✕
          </button>
        </div>

        {/* Body */}
        <div className="flex-1 overflow-y-auto p-6 custom-scrollbar">
          {loading ? (
            <div className="flex flex-col items-center justify-center h-40 text-muted-foreground">
              <div className="spinner mb-4 w-8 h-8" />
              <p>Loading AI edit history...</p>
            </div>
          ) : error ? (
            <div className="p-4 bg-red-500/10 border border-red-500/20 text-red-600 dark:text-red-400 rounded-lg">
              {error}
            </div>
          ) : suggestions.length === 0 ? (
            <div className="text-center py-12 text-muted-foreground">
              <div className="text-4xl mb-4">📝</div>
              <p>No AI changes have been applied to this resume yet.</p>
            </div>
          ) : (
            <div className="space-y-6">
              <div className="p-4 bg-blue-500/10 border border-blue-500/20 text-blue-600 dark:text-blue-400 text-sm rounded-lg">
                <strong>Tip:</strong> If you prefer your original text, you can copy it from the "Before" sections below and paste it back into your resume in the editor.
              </div>
              
              <div className="flex flex-col gap-6">
                {suggestions.map((suggestion, idx) => (
                  <div key={suggestion.id} className="border-b border-border/50 pb-6 last:border-b-0 last:pb-0">
                    <div className="flex items-center gap-2 mb-3">
                      <span className="text-[10px] font-bold px-2 py-1 rounded bg-muted text-foreground uppercase tracking-wider">
                        {suggestion.section}
                      </span>
                      <span className="text-[15px] font-bold text-foreground">{suggestion.title}</span>
                    </div>
                    
                    {suggestion.currentText ? (
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-2">
                        <div className="bg-red-500/10 dark:bg-red-500/5 border border-red-500/20 p-4 rounded-lg shadow-sm">
                          <div className="text-[10px] uppercase font-bold text-red-600 dark:text-red-400 mb-2 tracking-wider">Before</div>
                          <div className="text-[13px] text-red-600 dark:text-red-200/80 leading-relaxed line-through">{suggestion.currentText}</div>
                        </div>
                        <div className="bg-accent/10 border border-accent/30 p-4 rounded-lg relative overflow-hidden shadow-sm">
                          <div className="absolute left-0 top-0 bottom-0 w-1 bg-accent"></div>
                          <div className="text-[10px] uppercase font-bold text-green-700 dark:text-[#43e97b] mb-2 tracking-wider">After</div>
                          <div className="text-[13px] text-foreground leading-relaxed">{suggestion.suggestedText}</div>
                        </div>
                      </div>
                    ) : (
                      <div className="mt-2 bg-accent/10 border border-accent/30 p-4 rounded-lg relative overflow-hidden shadow-sm">
                        <div className="absolute left-0 top-0 bottom-0 w-1 bg-accent"></div>
                        <div className="text-[10px] uppercase font-bold text-green-700 dark:text-[#43e97b] mb-2 tracking-wider">Added</div>
                        <div className="text-[13px] text-foreground leading-relaxed">{suggestion.suggestedText}</div>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
