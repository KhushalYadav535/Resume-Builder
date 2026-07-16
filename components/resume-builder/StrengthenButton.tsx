"use client";

import React, { useState } from "react";
import { Sparkles, Loader2, Check, X } from "lucide-react";
import { Button } from "@/components/ui/Button";

interface StrengthenButtonProps {
  originalText: string;
  onRewrite: (text: string) => Promise<string>;
  onAccept: (newText: string) => void;
  onReject: () => void;
}

export function StrengthenButton({ originalText, onRewrite, onAccept, onReject }: StrengthenButtonProps) {
  const [state, setState] = useState<"idle" | "loading" | "reviewing">("idle");
  const [suggestion, setSuggestion] = useState("");

  const handleRewrite = async () => {
    if (!originalText.trim()) return;
    setState("loading");
    try {
      const result = await onRewrite(originalText);
      setSuggestion(result);
      setState("reviewing");
    } catch (e) {
      console.error(e);
      setState("idle");
    }
  };

  const handleAccept = () => {
    onAccept(suggestion);
    setState("idle");
    setSuggestion("");
  };

  const handleReject = () => {
    onReject();
    setState("idle");
    setSuggestion("");
  };

  if (state === "idle") {
    return (
      <button
        onClick={handleRewrite}
        className="flex items-center gap-1.5 px-2 py-1 type-caption text-[var(--accent)] hover:bg-[var(--accent-soft)] rounded-md transition-colors"
        disabled={!originalText.trim()}
      >
        <Sparkles size={14} />
        Strengthen
      </button>
    );
  }

  if (state === "loading") {
    return (
      <div className="flex items-center gap-1.5 px-2 py-1 type-caption text-[var(--text-muted)]">
        <Loader2 size={14} className="animate-spin" />
        Rewriting...
      </div>
    );
  }

  if (state === "reviewing") {
    return (
      <div className="flex flex-col gap-2 p-3 bg-[var(--bg-elevated)] border border-[var(--border)] rounded-md w-full my-2 animate-fade-in-up">
        <div className="flex flex-col gap-1">
          <div className="type-caption font-medium text-[var(--text-muted)] uppercase tracking-wider text-[10px]">Suggested</div>
          <div className="type-body text-[var(--success)]">{suggestion}</div>
        </div>
        <div className="flex flex-col gap-1 opacity-60">
          <div className="type-caption font-medium text-[var(--text-muted)] uppercase tracking-wider text-[10px]">Original</div>
          <div className="type-body line-through text-[var(--text-secondary)]">{originalText}</div>
        </div>
        
        <div className="flex items-center gap-2 mt-2">
          <button 
            onClick={handleAccept}
            className="flex items-center gap-1 px-3 py-1.5 bg-[var(--accent)] text-white rounded-md type-label hover:bg-[var(--accent-2)] transition-colors"
          >
            <Check size={14} />
            Use this
          </button>
          <button 
            onClick={handleReject}
            className="flex items-center gap-1 px-3 py-1.5 text-[var(--text-secondary)] hover:bg-[var(--border)] rounded-md type-label transition-colors"
          >
            <X size={14} />
            Keep mine
          </button>
        </div>
      </div>
    );
  }

  return null;
}
