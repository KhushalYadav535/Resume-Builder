"use client";

import Link from "next/link";
import {
  Compass,
  ArrowRight,
  Home,
  FileText,
  Briefcase,
  Sparkles,
  Layers,
  ChevronLeft
} from "lucide-react";
import Navbar from "@/components/Navbar";

export default function NotFound() {
  return (
    <div className="min-h-screen bg-[var(--bg-page)] text-[var(--text-primary)] flex flex-col font-sans selection:bg-[#F59E0B] selection:text-[#101B3B]">
      <Navbar />

      <main className="flex-1 max-w-5xl mx-auto px-6 py-16 md:py-24 flex flex-col items-center justify-center text-center">
        {/* Animated Badge & Icon */}
        <div className="relative mb-6">
          <div className="w-24 h-24 rounded-3xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-500 shadow-xl shadow-amber-500/10">
            <Compass size={48} className="animate-spin-slow" />
          </div>
          <span className="absolute -top-2 -right-2 px-2.5 py-1 rounded-full bg-rose-500 text-white font-mono font-black text-xs shadow-md">
            404
          </span>
        </div>

        {/* Heading */}
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-500/10 border border-amber-500/25 text-amber-600 dark:text-amber-400 text-xs font-bold uppercase tracking-wider mb-4">
          <Sparkles size={12} className="text-amber-500" />
          <span>CAREER PATH OFF-GRID</span>
        </div>

        <h1 className="text-3xl md:text-5xl font-black tracking-tight text-[var(--text-primary)] font-['Syne',sans-serif] max-w-xl">
          Looks like this trajectory doesn’t exist.
        </h1>

        <p className="text-sm md:text-base text-[var(--text-muted)] max-w-lg mt-3 leading-relaxed">
          The link you followed may be broken, relocated, or expired. Let’s recalibrate your coordinates back to your career toolkit.
        </p>

        {/* Primary Action Button */}
        <div className="flex flex-wrap items-center justify-center gap-3 mt-8">
          <Link
            href="/"
            className="px-6 py-3 rounded-xl bg-amber-500 hover:bg-amber-400 text-brand-navy font-black text-sm transition-all shadow-md shadow-amber-500/25 border border-amber-400 flex items-center gap-2 cursor-pointer"
          >
            <Home size={16} />
            <span>Return to Home Base</span>
          </Link>

          <button
            onClick={() => window.history.back()}
            className="px-5 py-3 rounded-xl bg-[var(--bg-elevated)] hover:bg-[var(--bg-page)] border border-[var(--border)] text-xs font-bold text-[var(--text-secondary)] transition-all flex items-center gap-1.5 cursor-pointer"
          >
            <ChevronLeft size={16} />
            <span>Go Back One Step</span>
          </button>
        </div>

        {/* Quick Recovery Trajectory Grid */}
        <div className="w-full mt-14 pt-10 border-t border-[var(--border)]">
          <h2 className="text-xs font-bold uppercase tracking-wider text-[var(--text-muted)] mb-5">
            Quick Career Trajectories
          </h2>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 text-left">
            {[
              {
                href: "/resume/builder?new=true",
                icon: <FileText size={18} className="text-amber-500" />,
                title: "Resume Builder",
                desc: "Build an ATS-calibrated resume in minutes.",
              },
              {
                href: "/resume/templates",
                icon: <Layers size={18} className="text-blue-500" />,
                title: "ATS Templates",
                desc: "Explore executive & modern templates.",
              },
              {
                href: "/job-tracker",
                icon: <Briefcase size={18} className="text-emerald-500" />,
                title: "Job Tracker",
                desc: "Organize applications in Kanban board.",
              },
              {
                href: "/career-copilot",
                icon: <Sparkles size={18} className="text-purple-500" />,
                title: "Career Copilot",
                desc: "Get strategic AI advice & interview prep.",
              },
            ].map((card) => (
              <Link
                key={card.title}
                href={card.href}
                className="p-4 rounded-2xl bg-[var(--bg-elevated)] border border-[var(--border)] hover:border-amber-500/40 hover:-translate-y-1 transition-all group flex flex-col justify-between"
              >
                <div>
                  <div className="w-8 h-8 rounded-lg bg-[var(--bg-page)] border border-[var(--border)] flex items-center justify-center mb-3 group-hover:border-amber-500/30 transition-colors">
                    {card.icon}
                  </div>
                  <div className="font-bold text-xs text-[var(--text-primary)] mb-1">
                    {card.title}
                  </div>
                  <div className="text-[11px] text-[var(--text-muted)] leading-relaxed">
                    {card.desc}
                  </div>
                </div>
                <div className="flex items-center gap-1 text-[10px] font-bold text-amber-500 mt-3 group-hover:translate-x-0.5 transition-transform">
                  <span>Open tool</span>
                  <ArrowRight size={11} />
                </div>
              </Link>
            ))}
          </div>
        </div>
      </main>
    </div>
  );
}
