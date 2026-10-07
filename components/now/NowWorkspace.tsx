"use client";

import { useState } from "react";
import Link from "next/link";
import {
  ArrowLeft,
  RotateCcw,
  Sparkles,
  Zap,
  ArrowRight,
  ShieldCheck,
  Send,
  Loader2,
  CheckCircle2,
} from "lucide-react";
import { NowResponsePayload } from "@/app/api/now/message/route";
import NowBlockRenderer from "./NowBlockRenderer";

interface NowWorkspaceProps {
  responsePayload: NowResponsePayload;
  onReset: () => void;
  onRefineIntent: (message: string) => void;
  isLoading: boolean;
  loadingStepText?: string;
}

export default function NowWorkspace({
  responsePayload,
  onReset,
  onRefineIntent,
  isLoading,
  loadingStepText,
}: NowWorkspaceProps) {
  const [refinementInput, setRefinementInput] = useState("");

  const handleRefineSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!refinementInput.trim() || isLoading) return;
    onRefineIntent(refinementInput.trim());
    setRefinementInput("");
  };

  const { intent, response, confidence } = responsePayload;

  const [isCompleted, setIsCompleted] = useState(false);
  const [isCompleting, setIsCompleting] = useState(false);

  const handleCompleteThread = async () => {
    if (!responsePayload.thread_id || isCompleted) return;
    setIsCompleting(true);
    try {
      await fetch(`/api/now/threads/${responsePayload.thread_id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: "COMPLETED" }),
      });
      setIsCompleted(true);
    } catch (e) {
      console.warn("Complete thread error:", e);
    } finally {
      setIsCompleting(false);
    }
  };

  return (
    <div className="max-w-[1000px] mx-auto px-4 sm:px-6 py-8 pb-24">
      {/* ── Top Bar: Navigation & Intent Meta ── */}
      <div className="flex items-center justify-between gap-4 mb-8 pb-4 border-b border-slate-200/80 dark:border-white/10">
        <button
          onClick={onReset}
          className="inline-flex items-center gap-2 text-xs sm:text-sm font-bold text-slate-600 dark:text-slate-300 hover:text-amber-500 dark:hover:text-amber-400 transition-colors cursor-pointer group"
        >
          <ArrowLeft size={16} className="group-hover:-translate-x-1 transition-transform" />
          <span>Start new thought</span>
        </button>

        <div className="flex items-center gap-2">
          {isCompleted ? (
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/25">
              <CheckCircle2 size={13} /> Thread Completed
            </span>
          ) : (
            <button
              onClick={handleCompleteThread}
              disabled={isCompleting}
              className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold text-slate-600 dark:text-slate-300 hover:text-emerald-600 dark:hover:text-emerald-400 hover:bg-emerald-500/10 border border-slate-200 dark:border-white/10 transition-colors cursor-pointer disabled:opacity-50"
              title="Mark this career thread as completed"
            >
              <CheckCircle2 size={12} />
              <span>{isCompleting ? "Saving..." : "Mark Done"}</span>
            </button>
          )}

          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-black uppercase tracking-wider bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/25">
            <Zap size={12} className="text-amber-500" />
            <span>Intent: {intent.replace(/_/g, " ")}</span>
          </span>
          <span className="hidden sm:inline-flex text-xs font-semibold text-slate-400 dark:text-slate-500">
            {Math.round(confidence * 100)}% Match
          </span>
        </div>
      </div>

      {/* ── Loading Banner (Spec Section 30: Multi-stage loading) ── */}
      {isLoading && (
        <div className="mb-8 p-4 rounded-2xl bg-amber-500/10 border border-amber-500/30 flex items-center gap-3 animate-pulse">
          <div className="w-5 h-5 border-2 border-amber-500 border-t-transparent rounded-full animate-spin shrink-0" />
          <div className="text-sm font-bold text-amber-600 dark:text-amber-400">
            {loadingStepText || "Looking at your career context & finding what matters…"}
          </div>
        </div>
      )}

      {/* ── Editorial Header (Spec Section 7 & 8) ── */}
      <div className="mb-10">
        <h1 className="text-2xl sm:text-4xl font-extrabold tracking-tight text-slate-900 dark:text-white font-['Syne',sans-serif] m-0 mb-3">
          {response.title}
        </h1>
        <p className="text-base sm:text-lg text-slate-600 dark:text-slate-300 leading-relaxed max-w-3xl m-0">
          {response.subtitle}
        </p>
      </div>

      {/* ── Assembled Dynamic Blocks ── */}
      <div className="space-y-6 mb-12">
        {response.blocks.map((block) => (
          <NowBlockRenderer
            key={block.id}
            block={block}
            onDecisionAction={(actionId, route) => {
              if (route && route.startsWith("/now?")) {
                const params = new URLSearchParams(route.split("?")[1]);
                const nextIntent = params.get("intent") || "";
                onRefineIntent(nextIntent);
              }
            }}
          />
        ))}
      </div>

      {/* ── Persistent Follow-up & Refinement Bar ── */}
      <div className="sticky bottom-6 z-20">
        <div className="rounded-2xl p-2 bg-white/95 dark:bg-[#0E172B]/95 backdrop-blur-xl border-2 border-slate-200 dark:border-white/15 shadow-2xl">
          <form onSubmit={handleRefineSubmit} className="flex items-center gap-2">
            <input
              type="text"
              value={refinementInput}
              onChange={(e) => setRefinementInput(e.target.value)}
              placeholder="Add nuance, specify target role, or pivot this direction..."
              disabled={isLoading}
              className="flex-1 px-4 py-2.5 bg-transparent text-sm sm:text-base text-slate-900 dark:text-white placeholder:text-slate-400 dark:placeholder:text-slate-500 focus:outline-none"
            />
            <button
              type="submit"
              disabled={!refinementInput.trim() || isLoading}
              className="px-4 py-2.5 rounded-xl font-bold text-xs sm:text-sm bg-amber-500 hover:bg-amber-400 text-brand-navy shadow-sm transition-all hover:scale-105 active:scale-95 disabled:opacity-40 disabled:hover:scale-100 disabled:cursor-not-allowed flex items-center gap-1.5 cursor-pointer shrink-0"
            >
              <span>Refine</span>
              <Send size={13} />
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
