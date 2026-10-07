"use client";

import { useState } from "react";
import {
  Sparkles,
  ArrowRight,
  TrendingUp,
  Activity,
  Compass,
  Zap,
  CornerDownLeft,
  Clock,
  Play,
  CheckCircle2,
} from "lucide-react";
import { CareerContextModel } from "@/app/api/now/context/route";

interface NowHomeProps {
  careerContext: CareerContextModel | null;
  onSubmitIntent: (intentText: string, intentHint?: string) => void;
  isLoading: boolean;
  onResumeThread?: (threadId: string) => void;
}

const SUGGESTED_INTENTS = [
  {
    label: "Move up",
    hint: "PROMOTION",
    desc: "Target next level & build promotion case",
    icon: TrendingUp,
    badgeColor: "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/25",
  },
  {
    label: "Earn more",
    hint: "COMPENSATION",
    desc: "Benchmark compensation & negotiation leverage",
    icon: Sparkles,
    badgeColor: "bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/25",
  },
  {
    label: "Find a better opportunity",
    hint: "JOB_CHANGE",
    desc: "Align profile to high-leverage roles",
    icon: Compass,
    badgeColor: "bg-blue-500/10 text-blue-600 dark:text-blue-400 border-blue-500/25",
  },
  {
    label: "Change direction",
    hint: "CAREER_EXPLORATION",
    desc: "Explore adjacent trajectories & transition plans",
    icon: Zap,
    badgeColor: "bg-purple-500/10 text-purple-600 dark:text-purple-400 border-purple-500/25",
  },
  {
    label: "Understand my strengths",
    hint: "CAPABILITY_DISCOVERY",
    desc: "Extract substantiated capabilities & proof",
    icon: Activity,
    badgeColor: "bg-teal-500/10 text-teal-600 dark:text-teal-400 border-teal-500/25",
  },
  {
    label: "Figure out what's next",
    hint: "CAREER_PLANNING",
    desc: "Synthesize career signals when unsure",
    icon: Clock,
    badgeColor: "bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 border-indigo-500/25",
  },
];

export default function NowHome({
  careerContext,
  onSubmitIntent,
  isLoading,
  onResumeThread,
}: NowHomeProps) {
  const [inputText, setInputText] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputText.trim() || isLoading) return;
    onSubmitIntent(inputText.trim());
  };

  const handleChipClick = (label: string, hint: string) => {
    if (isLoading) return;
    onSubmitIntent(label, hint);
  };

  const activeThread = careerContext?.active_threads?.[0];

  return (
    <div className="max-w-[920px] mx-auto px-4 sm:px-6 py-10 sm:py-16">
      
      {/* ── Active Thread Continuation Card (Spec Section 21) ── */}
      {activeThread && (
        <div className="mb-10 p-5 sm:p-6 rounded-2xl bg-gradient-to-r from-amber-500/10 via-amber-500/5 to-transparent dark:from-amber-500/15 dark:via-white/[0.03] dark:to-transparent border border-amber-500/30 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4 animate-in fade-in slide-in-from-top-4 duration-300">
          <div className="space-y-1">
            <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-amber-600 dark:text-amber-400">
              <Clock size={13} />
              <span>Continue where you left off · {activeThread.last_activity_at}</span>
            </div>
            <h3 className="text-base font-bold text-slate-900 dark:text-white m-0 font-['Syne',sans-serif]">
              {activeThread.title}
            </h3>
            <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-300 m-0 leading-relaxed">
              {activeThread.summary}
            </p>
          </div>

          <button
            onClick={() => {
              if (onResumeThread) {
                onResumeThread(activeThread.id);
              } else {
                onSubmitIntent("Continue promotion readiness", activeThread.intent);
              }
            }}
            disabled={isLoading}
            className="px-5 py-2.5 rounded-xl text-xs sm:text-sm font-bold bg-amber-500 hover:bg-amber-400 text-brand-navy shadow-sm transition-all hover:scale-105 active:scale-95 shrink-0 flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
          >
            <Play size={14} className="fill-current" />
            <span>Continue Thread</span>
          </button>
        </div>
      )}

      {/* ── Primary Hero Section (Spec Section 6) ── */}
      <div className="text-center mb-8 sm:mb-12">
        <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full text-xs font-bold uppercase tracking-widest bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/25 mb-4">
          <Zap size={13} className="text-amber-500" />
          <span>NOW · Intent-First Orchestration</span>
        </div>

        <h1 className="text-3xl sm:text-5xl font-black tracking-tight text-slate-900 dark:text-white font-['Syne',sans-serif] m-0 mb-3">
          What matters to you right now?
        </h1>

        <p className="text-base sm:text-lg text-slate-600 dark:text-slate-300 max-w-xl mx-auto leading-relaxed m-0">
          Tell UpRole what you're thinking about. We'll interpret your intent, pull relevant career intelligence, and help you move it forward.
        </p>
      </div>

      {/* ── Free-form Intent Input Bar ── */}
      <form onSubmit={handleSubmit} className="mb-10 sm:mb-14">
        <div className="relative rounded-2xl bg-white dark:bg-[#0E172B] border-2 border-slate-200 dark:border-white/15 shadow-xl transition-all focus-within:border-amber-500 dark:focus-within:border-amber-500 focus-within:ring-4 focus-within:ring-amber-500/15">
          <textarea
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter" && !e.shiftKey) {
                e.preventDefault();
                handleSubmit(e);
              }
            }}
            placeholder="Tell UpRole what you're thinking about..."
            rows={3}
            disabled={isLoading}
            className="w-full p-4 sm:p-5 pr-28 rounded-2xl bg-transparent text-base sm:text-lg text-slate-900 dark:text-white placeholder:text-slate-400 dark:placeholder:text-slate-500 focus:outline-none resize-none leading-relaxed"
          />

          <div className="absolute right-3.5 bottom-3.5 flex items-center gap-2">
            <button
              type="submit"
              disabled={!inputText.trim() || isLoading}
              className="px-4 sm:px-5 py-2.5 rounded-xl font-black text-xs sm:text-sm bg-amber-500 hover:bg-amber-400 text-brand-navy shadow-md shadow-amber-500/25 transition-all hover:scale-105 active:scale-95 disabled:opacity-40 disabled:hover:scale-100 disabled:cursor-not-allowed flex items-center gap-2 cursor-pointer"
            >
              <span>Move Forward</span>
              {isLoading ? (
                <div className="w-4 h-4 border-2 border-brand-navy border-t-transparent rounded-full animate-spin" />
              ) : (
                <ArrowRight size={15} />
              )}
            </button>
          </div>
        </div>
        <div className="flex items-center justify-between text-xs text-slate-400 dark:text-slate-500 mt-2 px-2">
          <span>Press <strong>Enter ↵</strong> to submit · Shift+Enter for newline</span>
          <span>Zero chat clutter · Dynamic structured output</span>
        </div>
      </form>

      {/* ── Suggested Starting Intents Grid (Spec Section 6) ── */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xs font-black uppercase tracking-wider text-slate-400 dark:text-slate-500 m-0">
            Suggested Starting Points
          </h2>
          <span className="text-xs text-slate-400 dark:text-slate-500">
            Pick one to begin instantly
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {SUGGESTED_INTENTS.map((item) => {
            const Icon = item.icon;
            return (
              <button
                key={item.label}
                type="button"
                onClick={() => handleChipClick(item.label, item.hint)}
                disabled={isLoading}
                className="p-4 rounded-xl text-left bg-white dark:bg-[#0D1527] border border-slate-200/80 dark:border-white/10 hover:border-amber-500/50 dark:hover:border-amber-500/50 hover:bg-amber-500/[0.03] dark:hover:bg-amber-500/[0.04] transition-all duration-200 hover:shadow-md hover:-translate-y-0.5 active:translate-y-0 cursor-pointer group flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-bold text-slate-900 dark:text-white group-hover:text-amber-500 dark:group-hover:text-amber-400 transition-colors font-['Syne',sans-serif]">
                      {item.label}
                    </span>
                    <Icon size={16} className="text-slate-400 group-hover:text-amber-500 transition-colors" />
                  </div>
                  <p className="text-xs text-slate-500 dark:text-slate-400 m-0 leading-relaxed">
                    {item.desc}
                  </p>
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* ── Contextual Career State Ticker (Spec Section 6.7) ── */}
      {careerContext && (
        <div className="mt-12 pt-6 border-t border-slate-200/60 dark:border-white/10 flex flex-wrap items-center justify-between gap-4 text-xs text-slate-500 dark:text-slate-400">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            <span>
              Connected to <strong>{careerContext.current_position.title}</strong> at {careerContext.current_position.company}
            </span>
          </div>

          <div className="flex items-center gap-4">
            <span>
              Grounding: <strong className="text-slate-800 dark:text-slate-200">{careerContext.career_summary.evidenceCount} verified evidence points</strong>
            </span>
            <span>
              Momentum: <strong className="text-emerald-500">{careerContext.momentum_summary.state}</strong>
            </span>
          </div>
        </div>
      )}
    </div>
  );
}
