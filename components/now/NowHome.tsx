"use client";

import { useState, useRef, useEffect } from "react";
import {
  Sparkles,
  ArrowUp,
  TrendingUp,
  Activity,
  Compass,
  Zap,
  Clock,
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
    label: "Target next promotion",
    hint: "PROMOTION",
    icon: TrendingUp,
  },
  {
    label: "Benchmark my compensation",
    hint: "COMPENSATION",
    icon: Sparkles,
  },
  {
    label: "Find better opportunities",
    hint: "JOB_CHANGE",
    icon: Compass,
  },
  {
    label: "Explore career transition",
    hint: "CAREER_EXPLORATION",
    icon: Zap,
  },
  {
    label: "Uncover my key strengths",
    hint: "CAPABILITY_DISCOVERY",
    icon: Activity,
  },
  {
    label: "Figure out what's next",
    hint: "CAREER_PLANNING",
    icon: Clock,
  },
];

export default function NowHome({
  careerContext,
  onSubmitIntent,
  isLoading,
  onResumeThread,
}: NowHomeProps) {
  const [inputText, setInputText] = useState("");
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const roleTitle = careerContext?.current_position?.title || "";
  const companyName = careerContext?.current_position?.company || "";
  const skills = careerContext?.career_summary?.topCapabilities || [];
  const topSkill = skills[0] || "Frontend";
  const secondSkill = skills[1] || "React";
  const firstName = careerContext?.user?.name ? careerContext.user.name.split(" ")[0] : "";
  const isEarlyCareer = /intern|junior|entry|trainee|fresher|student/i.test(roleTitle);

  // Auto-resize textarea like ChatGPT
  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = "auto";
      textareaRef.current.style.height = `${Math.min(textareaRef.current.scrollHeight, 180)}px`;
    }
  }, [inputText]);

  const handleSubmit = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!inputText.trim() || isLoading) return;
    onSubmitIntent(inputText.trim());
  };

  const handleChipClick = (label: string, hint: string) => {
    if (isLoading) return;
    onSubmitIntent(label, hint);
  };

  const activeThread = careerContext?.active_threads?.[0];

  // Dynamically tailor prompt chips to the user's real resume data
  const dynamicIntents = (() => {
    if (isEarlyCareer) {
      return [
        {
          label: `Optimize resume for Full-Time ${roleTitle.replace(/intern|trainee/gi, "").trim() || "Developer"} roles`,
          hint: "JOB_CHANGE",
          icon: TrendingUp,
        },
        {
          label: `Strengthen ${companyName || "internship"} project bullets`,
          hint: "CAPABILITY_DISCOVERY",
          icon: Sparkles,
        },
        {
          label: `Highlight ${secondSkill} & ${topSkill} projects`,
          hint: "EVIDENCE_REVIEW",
          icon: Zap,
        },
        {
          label: `Check ATS score for Junior Developer roles`,
          hint: "RESUME_REVIEW",
          icon: Compass,
        },
        {
          label: `Identify missing skills in my resume`,
          hint: "GAP_ANALYSIS",
          icon: Activity,
        },
        {
          label: `Prepare interview answers from my projects`,
          hint: "INTERVIEW_PREP",
          icon: Clock,
        },
      ];
    }

    if (roleTitle && !/Senior Technology Professional/i.test(roleTitle)) {
      return [
        {
          label: `Target next level from ${roleTitle}`,
          hint: "PROMOTION",
          icon: TrendingUp,
        },
        {
          label: `Quantify impact at ${companyName || "current role"}`,
          hint: "CAPABILITY_DISCOVERY",
          icon: Sparkles,
        },
        {
          label: `Benchmark compensation for ${roleTitle}`,
          hint: "COMPENSATION",
          icon: Compass,
        },
        {
          label: `Highlight my top ${topSkill} & ${secondSkill} capabilities`,
          hint: "CAPABILITY_DISCOVERY",
          icon: Activity,
        },
        {
          label: `Tailor resume for high-growth opportunities`,
          hint: "JOB_CHANGE",
          icon: Zap,
        },
        {
          label: `Prepare STAR stories from my resume`,
          hint: "INTERVIEW_PREP",
          icon: Clock,
        },
      ];
    }

    // Default resume-first chips
    return [
      {
        label: "Tailor resume for target role",
        hint: "JOB_CHANGE",
        icon: TrendingUp,
      },
      {
        label: "Improve project bullet points & impact",
        hint: "CAPABILITY_DISCOVERY",
        icon: Sparkles,
      },
      {
        label: "Check ATS score & keyword match",
        hint: "RESUME_REVIEW",
        icon: Compass,
      },
      {
        label: "Extract verified strengths from my resume",
        hint: "CAPABILITY_DISCOVERY",
        icon: Activity,
      },
      {
        label: "Prepare interview questions from my projects",
        hint: "INTERVIEW_PREP",
        icon: Zap,
      },
      {
        label: "Figure out what's next in my career",
        hint: "CAREER_PLANNING",
        icon: Clock,
      },
    ];
  })();

  const headingText = firstName
    ? `Hi ${firstName}, what can I help with on your resume?`
    : roleTitle
    ? `How can I help with your ${roleTitle} resume?`
    : "What can I help with on your resume today?";

  const placeholderText = roleTitle
    ? `Ask anything about your ${roleTitle} resume, projects, or next role...`
    : "Ask anything about your resume, skills, or target roles...";

  return (
    <div className="max-w-[780px] mx-auto px-4 sm:px-6 min-h-[calc(100vh-120px)] flex flex-col justify-center py-8">
      {/* ── ChatGPT Style Clean Hero ── */}
      <div className="text-center mb-8">
        <h1 className="text-2xl sm:text-4xl font-semibold tracking-tight text-slate-900 dark:text-white m-0">
          {headingText}
        </h1>
      </div>

      {/* ── ChatGPT Style Rounded Input Card ── */}
      <form onSubmit={handleSubmit} className="mb-6">
        <div className="relative rounded-3xl bg-white dark:bg-[#1E222B] border border-slate-200/90 dark:border-white/10 shadow-lg shadow-slate-200/40 dark:shadow-black/20 transition-all focus-within:border-amber-500/80 dark:focus-within:border-amber-500/80 focus-within:ring-4 focus-within:ring-amber-500/10 p-3 sm:p-4">
          <textarea
            ref={textareaRef}
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter" && !e.shiftKey) {
                e.preventDefault();
                handleSubmit();
              }
            }}
            placeholder={placeholderText}
            rows={1}
            disabled={isLoading}
            className="w-full bg-transparent text-base sm:text-lg text-slate-900 dark:text-white placeholder:text-slate-400 dark:placeholder:text-slate-500 focus:outline-none resize-none leading-relaxed min-h-[48px] max-h-[180px] px-2 py-1"
          />

          {/* Action Row Inside Box */}
          <div className="flex items-center justify-between pt-2 px-1">
            <div className="flex items-center gap-2">
              <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-medium bg-slate-100 dark:bg-white/5 text-slate-600 dark:text-slate-400 border border-slate-200/60 dark:border-white/5">
                <Sparkles size={11} className="text-amber-500" />
                <span>{roleTitle ? `${roleTitle} Resume` : "Resume Intelligence"}</span>
              </span>
            </div>

            {/* Circular Send Button (ChatGPT style) */}
            <button
              type="submit"
              disabled={!inputText.trim() || isLoading}
              aria-label="Send prompt"
              className="w-9 h-9 rounded-full flex items-center justify-center transition-all bg-slate-900 hover:bg-slate-800 dark:bg-amber-500 dark:hover:bg-amber-400 text-white dark:text-slate-950 disabled:opacity-20 disabled:hover:bg-slate-900 dark:disabled:hover:bg-amber-500 disabled:cursor-not-allowed shadow-sm cursor-pointer"
            >
              {isLoading ? (
                <div className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin" />
              ) : (
                <ArrowUp size={18} strokeWidth={2.5} />
              )}
            </button>
          </div>
        </div>

        {/* ── Compact Resume Thread Pill (if active) ── */}
        {activeThread && (
          <div className="mt-3 flex items-center justify-center">
            <button
              type="button"
              onClick={() => {
                if (onResumeThread) {
                  onResumeThread(activeThread.id);
                } else {
                  onSubmitIntent(`Continue ${activeThread.title}`, activeThread.intent);
                }
              }}
              disabled={isLoading}
              className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full text-xs font-medium bg-amber-500/10 hover:bg-amber-500/15 text-amber-800 dark:text-amber-300 border border-amber-500/20 transition-all cursor-pointer shadow-sm hover:scale-[1.01]"
            >
              <Clock size={12} className="text-amber-600 dark:text-amber-400" />
              <span>Resume Focus: <strong>{activeThread.title}</strong></span>
              <span className="text-amber-600 dark:text-amber-400">→</span>
            </button>
          </div>
        )}
      </form>

      {/* ── ChatGPT Style Quick Suggestion Chips (Tailored to Resume) ── */}
      <div className="flex flex-wrap items-center justify-center gap-2 sm:gap-2.5 max-w-2xl mx-auto">
        {dynamicIntents.map((item) => {
          const Icon = item.icon;
          return (
            <button
              key={item.label}
              type="button"
              onClick={() => handleChipClick(item.label, item.hint)}
              disabled={isLoading}
              className="inline-flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs sm:text-sm font-medium bg-white dark:bg-[#151922] border border-slate-200/80 dark:border-white/10 hover:border-slate-300 dark:hover:border-white/20 hover:bg-slate-50 dark:hover:bg-white/5 text-slate-700 dark:text-slate-300 transition-all shadow-sm hover:shadow cursor-pointer active:scale-95"
            >
              <Icon size={14} className="text-amber-500/90 dark:text-amber-400" />
              <span>{item.label}</span>
            </button>
          );
        })}
      </div>

      {/* ── Subtle Footnote / Connection Status ── */}
      {careerContext && (
        <div className="mt-12 text-center text-xs text-slate-400 dark:text-slate-500 flex items-center justify-center gap-3">
          <span className="inline-flex items-center gap-1.5">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
            {careerContext.current_position.title} @ {careerContext.current_position.company}
          </span>
          <span>·</span>
          <span>{careerContext.career_summary.evidenceCount} verified evidence points</span>
        </div>
      )}
    </div>
  );
}
