"use client";

import Link from "next/link";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import {
  Sparkles,
  ArrowRight,
  FileText,
  Briefcase,
  Compass,
  CheckCircle2,
  Layers,
  Heart
} from "lucide-react";

export default function ThankYouPage() {
  return (
    <div className="min-h-screen bg-[var(--bg-page)] text-[var(--text-primary)] flex flex-col font-sans selection:bg-[#F59E0B] selection:text-[#101B3B]">
      <Navbar />

      <main className="flex-1 max-w-4xl mx-auto px-6 py-16 md:py-24 flex flex-col items-center justify-center text-center">
        {/* Success Emblem */}
        <div className="w-20 h-20 rounded-3xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-500 shadow-xl shadow-amber-500/10 mb-6">
          <Sparkles size={38} className="animate-pulse" />
        </div>

        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/25 text-emerald-600 dark:text-emerald-400 text-xs font-bold uppercase tracking-wider mb-4">
          <CheckCircle2 size={12} className="text-emerald-500" />
          <span>YOUR TRAJECTORY IS SET</span>
        </div>

        <h1 className="text-3xl md:text-5xl font-black tracking-tight text-[var(--text-primary)] font-['Syne',sans-serif] max-w-xl">
          Thank you for trusting UpRole with your career.
        </h1>

        <p className="text-sm md:text-base text-[var(--text-muted)] max-w-lg mt-3 leading-relaxed">
          Your workspace is primed and ready. Ambitious careers are built step by step — here is your 3-step launch roadmap:
        </p>

        {/* 3 Step Roadmap */}
        <div className="w-full mt-10 grid grid-cols-1 md:grid-cols-3 gap-4 text-left">
          {/* Step 1 */}
          <div className="p-5 rounded-2xl bg-[var(--bg-elevated)] border border-[var(--border)] relative overflow-hidden flex flex-col justify-between">
            <div>
              <span className="text-[10px] font-mono font-black text-amber-500 uppercase">Step 01</span>
              <div className="font-bold text-sm text-[var(--text-primary)] mt-1 mb-2">
                Build & Calibrate Resume
              </div>
              <p className="text-xs text-[var(--text-muted)] leading-relaxed">
                Scan your resume against enterprise ATS filters and receive instant keyword calibrations.
              </p>
            </div>
            <Link
              href="/resume/builder?new=true"
              className="mt-4 inline-flex items-center gap-1.5 text-xs font-bold text-amber-500 hover:text-amber-400"
            >
              <span>Launch Builder</span>
              <ArrowRight size={12} />
            </Link>
          </div>

          {/* Step 2 */}
          <div className="p-5 rounded-2xl bg-[var(--bg-elevated)] border border-[var(--border)] relative overflow-hidden flex flex-col justify-between">
            <div>
              <span className="text-[10px] font-mono font-black text-blue-500 uppercase">Step 02</span>
              <div className="font-bold text-sm text-[var(--text-primary)] mt-1 mb-2">
                Select Proven Template
              </div>
              <p className="text-xs text-[var(--text-muted)] leading-relaxed">
                Choose from recruiter-approved, clean layout templates tailored for software & product leaders.
              </p>
            </div>
            <Link
              href="/resume/templates"
              className="mt-4 inline-flex items-center gap-1.5 text-xs font-bold text-blue-500 hover:text-blue-400"
            >
              <span>Browse Templates</span>
              <ArrowRight size={12} />
            </Link>
          </div>

          {/* Step 3 */}
          <div className="p-5 rounded-2xl bg-[var(--bg-elevated)] border border-[var(--border)] relative overflow-hidden flex flex-col justify-between">
            <div>
              <span className="text-[10px] font-mono font-black text-emerald-500 uppercase">Step 03</span>
              <div className="font-bold text-sm text-[var(--text-primary)] mt-1 mb-2">
                Track Your Pursuits
              </div>
              <p className="text-xs text-[var(--text-muted)] leading-relaxed">
                Organize target companies, interviews, and offers in your Opportunity Pipeline Kanban.
              </p>
            </div>
            <Link
              href="/job-tracker"
              className="mt-4 inline-flex items-center gap-1.5 text-xs font-bold text-emerald-500 hover:text-emerald-400"
            >
              <span>Open Pipeline</span>
              <ArrowRight size={12} />
            </Link>
          </div>
        </div>

        {/* Primary CTA button */}
        <div className="mt-10">
          <Link
            href="/dashboard"
            className="px-8 py-3.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-brand-navy font-black text-sm transition-all shadow-md shadow-amber-500/25 border border-amber-400 inline-flex items-center gap-2 cursor-pointer"
          >
            <span>Enter My Career Dashboard</span>
            <ArrowRight size={15} />
          </Link>
        </div>
      </main>

      <Footer />
    </div>
  );
}
