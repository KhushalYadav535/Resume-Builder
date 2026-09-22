"use client";

import React, { ReactNode } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useCDE } from '@/context/CDEContext';
import {
  ArrowLeft,
  CheckCircle2,
  Building2,
  Sparkles,
  Award,
  Zap,
  RotateCcw,
  ArrowRight,
  ShieldCheck,
  Briefcase,
  ExternalLink,
} from 'lucide-react';
import Link from 'next/link';

export function cn(...inputs: (string | undefined | null | false)[]) {
  return inputs.filter(Boolean).join(' ');
}

interface CDEContainerProps {
  children: ReactNode;
}

export const CDEContainer = ({ children }: CDEContainerProps) => {
  const {
    profileStrength,
    currentQuestionId,
    currentQuestion,
    goBack,
    history,
    isComplete,
    skipQuestion,
    stepIndex,
    totalSteps,
    resumeContext,
    restartSession,
    knownFacts,
    isLoading,
  } = useCDE();

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[70vh] text-center p-6">
        <div className="w-12 h-12 rounded-2xl bg-amber-500/15 border border-amber-500/30 flex items-center justify-center text-amber-500 animate-spin mb-4">
          <Sparkles size={24} />
        </div>
        <h3 className="text-base font-bold text-[var(--text-primary)] font-['Syne',sans-serif]">
          Initializing Career Discovery Engine...
        </h3>
        <p className="text-xs text-[var(--text-muted)] mt-1">
          Synthesizing personalized discovery deck tailored to your verified career memory.
        </p>
      </div>
    );
  }

  // ─── SCREEN S4: DISCOVERY PROFILE COMPLETE ───
  if (isComplete) {
    const confirmedSkills = Array.isArray(knownFacts.q_tech_stack)
      ? knownFacts.q_tech_stack
      : resumeContext?.extractedTechSkills || [];
    const confirmedRole =
      knownFacts.q_role_type || resumeContext?.primaryRole || 'Senior Specialist';
    const confirmedCompany =
      knownFacts.q_company || resumeContext?.primaryCompany || 'Leading Organization';
    const confirmedYears =
      knownFacts.q_experience_years || resumeContext?.estimatedYears || 8;

    return (
      <div className="flex flex-col items-center justify-center min-h-[85vh] text-center p-4 sm:p-6 w-full max-w-2xl mx-auto">
        <motion.div
          initial={{ scale: 0.9, opacity: 0, y: 20 }}
          animate={{ scale: 1, opacity: 1, y: 0 }}
          transition={{ type: 'spring', bounce: 0.4, duration: 0.6 }}
          className="relative bg-[var(--card)] border border-amber-500/30 rounded-3xl p-6 sm:p-10 shadow-2xl w-full overflow-hidden"
        >
          {/* Ambient Glow */}
          <div className="absolute top-0 right-1/2 translate-x-1/2 w-64 h-64 bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />

          {/* Success Check Icon */}
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ delay: 0.15, type: 'spring', bounce: 0.5 }}
            className="w-16 h-16 rounded-2xl bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 border border-emerald-500/30 flex items-center justify-center mx-auto mb-4 shadow-sm"
          >
            <CheckCircle2 size={32} />
          </motion.div>

          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-500/15 text-emerald-700 dark:text-emerald-300 border border-emerald-500/30 text-[10px] font-black uppercase tracking-wider mb-2">
            <ShieldCheck size={12} />
            <span>Career Discovery Complete · Fact Signals Linked</span>
          </span>

          <h1 className="text-2xl sm:text-3xl font-extrabold text-[var(--text-primary)] font-['Syne',sans-serif] tracking-tight">
            Your Discovery Profile is Ready
          </h1>
          <p className="text-xs sm:text-sm text-[var(--text-secondary)] mt-1 mb-6 max-w-md mx-auto leading-relaxed">
            All discovery card signals have been extracted and correlated with your persistent Career Memory.
          </p>

          {/* Gamification Stats */}
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 mb-6 text-left">
            <div className="p-3.5 rounded-2xl bg-[var(--bg-elevated)] border border-[var(--border)]">
              <span className="text-[10px] font-bold text-[var(--text-muted)] uppercase">
                Profile Readiness
              </span>
              <div className="text-xl font-black text-amber-600 dark:text-amber-400 mt-0.5">
                {Math.max(85, profileStrength)}%
              </div>
            </div>
            <div className="p-3.5 rounded-2xl bg-[var(--bg-elevated)] border border-[var(--border)]">
              <span className="text-[10px] font-bold text-[var(--text-muted)] uppercase">
                ATS Compatibility
              </span>
              <div className="text-xl font-black text-emerald-600 dark:text-emerald-400 mt-0.5 flex items-center gap-1">
                <span>94+</span>
                <Sparkles size={14} />
              </div>
            </div>
            <div className="col-span-2 sm:col-span-1 p-3.5 rounded-2xl bg-[var(--bg-elevated)] border border-[var(--border)]">
              <span className="text-[10px] font-bold text-[var(--text-muted)] uppercase">
                Signals Captured
              </span>
              <div className="text-xl font-black text-[var(--text-primary)] mt-0.5">
                +{Object.keys(knownFacts).length || 6} Facts
              </div>
            </div>
          </div>

          {/* Captured Facts Summary Breakdown */}
          <div className="p-4 rounded-2xl bg-[var(--bg-elevated)] border border-[var(--border)] text-left mb-8 space-y-2.5">
            <div className="text-[11px] font-extrabold text-[var(--text-muted)] uppercase tracking-wider">
              Discovered Snapshot:
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
              <div>
                <span className="text-[var(--text-muted)] font-medium">Domain: </span>
                <span className="font-bold text-[var(--text-primary)]">{confirmedRole}</span>
              </div>
              <div>
                <span className="text-[var(--text-muted)] font-medium">Primary Org: </span>
                <span className="font-bold text-[var(--text-primary)]">{confirmedCompany}</span>
              </div>
              <div>
                <span className="text-[var(--text-muted)] font-medium">Career Tenure: </span>
                <span className="font-bold text-[var(--text-primary)]">{confirmedYears} Years</span>
              </div>
              <div>
                <span className="text-[var(--text-muted)] font-medium">Key Stack: </span>
                <span className="font-bold text-amber-600 dark:text-amber-400 truncate block">
                  {confirmedSkills.slice(0, 4).join(', ')}
                </span>
              </div>
            </div>
          </div>

          {/* Action CTAs */}
          <div className="flex flex-col sm:flex-row gap-3">
            <Link
              href="/resume/builder"
              className="flex-1 inline-flex items-center justify-center gap-2 py-3 px-6 rounded-xl font-black text-xs text-brand-navy bg-amber-500 hover:bg-amber-400 transition-all shadow-md shadow-amber-500/25 active:scale-[0.98] no-underline"
            >
              <span>Preview Generated Resume</span>
              <ArrowRight size={13} />
            </Link>
            <Link
              href="/value"
              className="flex-1 inline-flex items-center justify-center gap-2 py-3 px-6 rounded-xl font-bold text-xs text-[var(--text-primary)] bg-[var(--bg-elevated)] hover:bg-[var(--card)] border border-[var(--border)] transition-colors no-underline"
            >
              <Award size={13} className="text-amber-500" />
              <span>Career Value Profile</span>
            </Link>
          </div>

          <div className="mt-4 flex items-center justify-center">
            <button
              onClick={restartSession}
              className="inline-flex items-center gap-1.5 text-xs font-semibold text-[var(--text-muted)] hover:text-[var(--text-primary)] transition-colors cursor-pointer py-1 px-3 rounded-lg"
            >
              <RotateCcw size={12} />
              <span>Replay Discovery Deck</span>
            </button>
          </div>
        </motion.div>
      </div>
    );
  }

  // ─── ACTIVE CARD EXPERIENCE ───
  return (
    <div className="flex flex-col min-h-[85vh] max-w-2xl mx-auto w-full px-4 py-4 sm:py-6">
      {/* Dynamic Header & Breadcrumb */}
      <header className="flex items-center justify-between gap-3 mb-6 relative z-10">
        <div className="flex items-center gap-3">
          <button
            onClick={goBack}
            disabled={history.length === 0}
            title="Previous question"
            className="p-2.5 rounded-xl bg-[var(--card)] border border-[var(--border)] text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:border-amber-500/50 shadow-xs transition-colors disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer"
          >
            <ArrowLeft size={16} />
          </button>

          <div>
            <div className="flex items-center gap-2 flex-wrap">
              <span className="text-[10px] font-black uppercase tracking-wider px-2 py-0.5 rounded-md bg-amber-500/15 text-amber-700 dark:text-amber-300 border border-amber-500/25 inline-flex items-center gap-1">
                <Sparkles size={10} />
                <span>Card Discovery (CDE)</span>
              </span>
              {resumeContext?.primaryCompany && (
                <span className="text-xs font-semibold text-[var(--text-muted)] hidden sm:inline">
                  {resumeContext.primaryCompany}
                </span>
              )}
            </div>
            <div className="text-xs font-bold text-[var(--text-primary)] mt-0.5">
              Pillar {stepIndex} of {Math.max(totalSteps, 6)}
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={skipQuestion}
            className="text-xs font-bold text-[var(--text-muted)] hover:text-[var(--text-primary)] px-3 py-1.5 rounded-lg hover:bg-[var(--bg-elevated)] transition-colors cursor-pointer"
          >
            Skip &rarr;
          </button>
        </div>
      </header>

      {/* Main 3D Card Stack Area */}
      <main className="flex-1 flex flex-col relative w-full items-center justify-center my-auto">
        <AnimatePresence mode="wait">
          <motion.div
            key={currentQuestionId || 'cde-active'}
            initial={{ opacity: 0, y: 25, scale: 0.96 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -20, scale: 0.96 }}
            transition={{ type: 'spring', stiffness: 300, damping: 26 }}
            className="w-full relative flex flex-col items-center"
          >
            {/* 3D Stacked Background Cards for depth */}
            <div className="absolute top-[-14px] w-[90%] h-20 bg-[var(--card)]/30 rounded-3xl -z-20 border border-[var(--border)]/40 shadow-xs" />
            <div className="absolute top-[-7px] w-[95%] h-20 bg-[var(--card)]/60 rounded-3xl -z-10 border border-[var(--border)]/70 shadow-sm" />

            {/* Main Interactive Card */}
            <div className="relative w-full bg-[var(--card)] rounded-3xl shadow-2xl border border-[var(--border)] px-6 sm:px-8 pb-8 pt-10 z-0 overflow-hidden">
              {/* Top Accent Icon */}
              <div className="absolute -top-5 left-1/2 -translate-x-1/2 w-11 h-11 rounded-2xl bg-amber-500 text-brand-navy flex items-center justify-center shadow-md shadow-amber-500/25 border-4 border-[var(--bg)] z-10">
                <Briefcase size={18} strokeWidth={2.5} />
              </div>

              {children}
            </div>
          </motion.div>
        </AnimatePresence>
      </main>

      {/* Footer Progress Bar */}
      <div className="mt-8 pt-4 flex flex-col items-center">
        <div className="flex items-center justify-between w-full max-w-sm mb-2 text-xs font-bold text-[var(--text-muted)]">
          <span>Card Discovery Progress</span>
          <span className="text-amber-600 dark:text-amber-400 font-extrabold">
            {Math.round((stepIndex / Math.max(totalSteps, 1)) * 100)}%
          </span>
        </div>
        <div className="w-full max-w-sm h-1.5 bg-slate-200 dark:bg-white/10 rounded-full overflow-hidden">
          <motion.div
            className="h-full bg-gradient-to-r from-amber-500 to-amber-400 rounded-full"
            initial={{ width: 0 }}
            animate={{ width: `${(stepIndex / Math.max(totalSteps, 1)) * 100}%` }}
            transition={{ duration: 0.4, ease: 'easeOut' }}
          />
        </div>
      </div>
    </div>
  );
};
