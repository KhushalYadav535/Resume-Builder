"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import Navbar from "@/components/Navbar";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/components/ui/toast-1";
import {
  TrendingUp,
  Target,
  Sparkles,
  ShieldCheck,
  CheckCircle2,
  AlertCircle,
  ArrowRight,
  Zap,
  Handshake,
  MessageSquare,
  BarChart3,
  Rocket,
  Compass,
  Check,
  ChevronRight,
  Flame,
  Clock,
  Layers,
  Award,
  BookOpen,
  ArrowUpRight,
  Sliders,
  Flag,
  Crosshair,
  FileText
} from "lucide-react";

interface PriorityItem {
  id: string;
  label: string;
  desc: string;
  category: "growth" | "comp" | "impact" | "culture";
  selected: boolean;
}

interface ActionStep {
  id: string;
  title: string;
  toolName: string;
  toolLink: string;
  phase: "readiness" | "gaps" | "strategy" | "actions" | "outcomes";
  completed: boolean;
  tag: string;
}

export default function MomentumPage() {
  const { user, loading: authLoading } = useAuth();
  const router = useRouter();
  const { showToast } = useToast();

  // Tier 1: Career Priorities & Goals
  const [priorities, setPriorities] = useState<PriorityItem[]>([
    {
      id: "comp",
      label: "Compensation Growth",
      desc: "Targeting top-decile market compensation and equity packages",
      category: "comp",
      selected: true,
    },
    {
      id: "scope",
      label: "Leadership & Ownership",
      desc: "Leading high-visibility cross-functional initiatives & teams",
      category: "growth",
      selected: true,
    },
    {
      id: "tech",
      label: "Technical Architecture",
      desc: "Mastering large-scale distributed systems and AI systems",
      category: "growth",
      selected: false,
    },
    {
      id: "impact",
      label: "High-Visibility Impact",
      desc: "Delivering bottom-line revenue & mission-critical reliability",
      category: "impact",
      selected: true,
    },
    {
      id: "balance",
      label: "Autonomy & Balance",
      desc: "High-trust asynchronous culture with clear work-life bounds",
      category: "culture",
      selected: false,
    },
  ]);

  const [careerGoal, setCareerGoal] = useState("Staff Software Engineer / Tech Lead");
  const [goalTimeline, setGoalTimeline] = useState("Next 6 Months");
  const [isEditingGoal, setIsEditingGoal] = useState(false);
  const [tempGoal, setTempGoal] = useState(careerGoal);

  // Tier 2: Level 2 Execution Tab
  const [activeTier2Tab, setActiveTier2Tab] = useState<
    "readiness" | "gaps" | "strategy" | "actions" | "outcomes"
  >("readiness");

  // Concrete Actions list
  const [actionSteps, setActionSteps] = useState<ActionStep[]>([
    {
      id: "action-1",
      title: "Audit current resume against target Staff Engineer benchmarks",
      toolName: "Precision JD Matching & AI Tailoring",
      toolLink: "/resume/tailor",
      phase: "readiness",
      completed: true,
      tag: "Match",
    },
    {
      id: "action-2",
      title: "Identify missing system design & architectural competencies",
      toolName: "Skill Gap Telemetry",
      toolLink: "/career-copilot?tab=skillgap",
      phase: "gaps",
      completed: false,
      tag: "Skill Gap",
    },
    {
      id: "action-3",
      title: "Construct STAR narratives for multi-stakeholder friction scenarios",
      toolName: "Narrative Studio",
      toolLink: "/career-copilot?tab=interview",
      phase: "strategy",
      completed: false,
      tag: "Interview",
    },
    {
      id: "action-4",
      title: "Frame 6-month career transition period constructively",
      toolName: "Gap Storyteller",
      toolLink: "/career-copilot?tab=interview",
      phase: "strategy",
      completed: true,
      tag: "Narrative",
    },
    {
      id: "action-5",
      title: "Run peer compensation benchmark for target base + RSUs",
      toolName: "Offer Evaluator & Negotiation Scripts",
      toolLink: "/career-copilot?tab=negotiation",
      phase: "actions",
      completed: false,
      tag: "Negotiation",
    },
    {
      id: "action-6",
      title: "Document weekly wins in Journal to build promotion case",
      toolName: "Promotion Case Builder & Journal",
      toolLink: "/career-journal",
      phase: "outcomes",
      completed: false,
      tag: "Growth",
    },
  ]);

  useEffect(() => {
    if (!authLoading && !user) {
      router.push("/login");
    }
  }, [authLoading, user, router]);

  const togglePriority = (id: string) => {
    setPriorities((prev) =>
      prev.map((p) => (p.id === id ? { ...p, selected: !p.selected } : p))
    );
    showToast("Career priorities updated", "info");
  };

  const handleSaveGoal = () => {
    if (tempGoal.trim()) {
      setCareerGoal(tempGoal.trim());
      setIsEditingGoal(false);
      showToast("Target Career Goal saved!", "success");
    }
  };

  const toggleActionCompleted = (id: string) => {
    setActionSteps((prev) =>
      prev.map((a) => (a.id === id ? { ...a, completed: !a.completed } : a))
    );
  };

  const completedCount = actionSteps.filter((a) => a.completed).length;
  const readinessPercent = Math.round((completedCount / actionSteps.length) * 100);

  return (
    <div className="min-h-screen bg-[var(--bg)] text-[var(--text-primary)] flex flex-col font-sans">
      <Navbar />

      {/* Hero Header */}
      <section className="relative overflow-hidden border-b border-[var(--border)] bg-[var(--card)] py-10 px-6 sm:px-8">
        <div className="absolute top-0 right-1/4 w-96 h-96 bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 left-10 w-80 h-80 bg-blue-500/10 rounded-full blur-3xl pointer-events-none" />

        <div className="max-w-7xl mx-auto relative z-10">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
            <div>
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-500/15 border border-amber-500/30 text-amber-600 dark:text-amber-400 text-xs font-bold uppercase tracking-wider mb-3">
                <Flame size={14} className="text-amber-500 animate-pulse" />
                <span>Top Level Menu 3 · Execution Engine</span>
              </div>
              <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-[var(--text-primary)] font-['Syne',sans-serif]">
                Momentum
              </h1>
              <p className="mt-2 text-sm sm:text-base text-[var(--text-secondary)] max-w-2xl">
                Convert what matters to you into concrete milestones. Align career priorities and specific desired outcomes with audited readiness, gap closure, and Level 3 strategic tools.
              </p>
            </div>

            {/* Quick Readiness Score Card */}
            <div className="flex items-center gap-4 bg-[var(--bg-elevated)] border border-[var(--border)] rounded-2xl p-4 shadow-sm">
              <div className="relative flex items-center justify-center w-16 h-16 rounded-full bg-amber-500/10 border-2 border-amber-500/30 text-amber-600 dark:text-amber-400 font-extrabold text-xl">
                {readinessPercent}%
              </div>
              <div>
                <div className="text-xs font-semibold text-[var(--text-muted)] uppercase tracking-wider">
                  Target Readiness
                </div>
                <div className="text-sm font-bold text-[var(--text-primary)] mt-0.5">
                  {readinessPercent >= 70
                    ? "Advancement Ready"
                    : readinessPercent >= 40
                    ? "Active Execution"
                    : "Calibrating Positioning"}
                </div>
                <div className="text-xs text-[var(--text-secondary)] mt-0.5">
                  {completedCount} of {actionSteps.length} milestones cleared
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Main Content Hub */}
      <main className="max-w-7xl mx-auto w-full px-6 sm:px-8 py-10 flex-1 space-y-12">
        {/* ─── TIER 1: CAREER PRIORITIES & GOALS ─── */}
        <section id="priorities" className="space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <div className="text-xs font-bold uppercase tracking-wider text-amber-600 dark:text-amber-400 flex items-center gap-1.5">
                <Target size={14} /> Level 1 Foundation
              </div>
              <h2 className="text-xl sm:text-2xl font-bold tracking-tight text-[var(--text-primary)] font-['Syne',sans-serif]">
                Career Priorities & Target Goals
              </h2>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Priorities Selector (What matters to the person) */}
            <div className="lg:col-span-2 bg-[var(--card)] border border-[var(--border)] rounded-2xl p-6 shadow-sm">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h3 className="text-base font-bold text-[var(--text-primary)]">
                    Career Priorities (What Matters to You)
                  </h3>
                  <p className="text-xs text-[var(--text-muted)]">
                    Select the core drivers guiding your next transition or promotion.
                  </p>
                </div>
                <span className="text-xs font-semibold px-2.5 py-1 rounded-md bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20">
                  {priorities.filter((p) => p.selected).length} Active
                </span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mt-4">
                {priorities.map((item) => (
                  <button
                    key={item.id}
                    onClick={() => togglePriority(item.id)}
                    className={`flex items-start gap-3 p-3.5 rounded-xl border text-left transition-all ${
                      item.selected
                        ? "bg-amber-500/10 border-amber-500/50 shadow-sm"
                        : "bg-[var(--bg-elevated)] border-[var(--border)] hover:border-slate-400 dark:hover:border-slate-600 opacity-70"
                    }`}
                  >
                    <div
                      className={`w-5 h-5 rounded-md flex items-center justify-center shrink-0 mt-0.5 text-xs font-bold ${
                        item.selected
                          ? "bg-amber-500 text-brand-navy"
                          : "border border-[var(--border)] bg-white/50 dark:bg-black/20"
                      }`}
                    >
                      {item.selected && <Check size={12} strokeWidth={3} />}
                    </div>
                    <div>
                      <div className="text-sm font-bold text-[var(--text-primary)]">
                        {item.label}
                      </div>
                      <div className="text-xs text-[var(--text-secondary)] mt-0.5 leading-snug">
                        {item.desc}
                      </div>
                    </div>
                  </button>
                ))}
              </div>
            </div>

            {/* Target Career Goal (Specific Desired Outcome) */}
            <div className="bg-[var(--card)] border border-[var(--border)] rounded-2xl p-6 shadow-sm flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-blue-500">
                    <Flag size={13} /> Desired Outcome
                  </div>
                  {!isEditingGoal && (
                    <button
                      onClick={() => {
                        setTempGoal(careerGoal);
                        setIsEditingGoal(true);
                      }}
                      className="text-xs font-semibold text-amber-500 hover:underline"
                    >
                      Edit Goal
                    </button>
                  )}
                </div>

                <div className="text-xs text-[var(--text-muted)] mb-3">
                  Your primary target objective for this career momentum cycle:
                </div>

                {isEditingGoal ? (
                  <div className="space-y-3">
                    <input
                      type="text"
                      value={tempGoal}
                      onChange={(e) => setTempGoal(e.target.value)}
                      className="w-full px-3 py-2 text-sm rounded-xl border border-amber-500/50 bg-[var(--bg-elevated)] text-[var(--text-primary)] focus:outline-none focus:ring-2 focus:ring-amber-500/30 font-bold"
                      placeholder="e.g. Staff Engineer, VP of Product"
                    />
                    <div className="flex items-center gap-2">
                      <button
                        onClick={handleSaveGoal}
                        className="px-3 py-1.5 rounded-lg bg-amber-500 text-brand-navy font-bold text-xs hover:bg-amber-400"
                      >
                        Save
                      </button>
                      <button
                        onClick={() => setIsEditingGoal(false)}
                        className="px-3 py-1.5 rounded-lg border border-[var(--border)] text-xs text-[var(--text-secondary)] hover:bg-[var(--bg-elevated)]"
                      >
                        Cancel
                      </button>
                    </div>
                  </div>
                ) : (
                  <div className="p-4 rounded-xl bg-gradient-to-br from-amber-500/10 via-transparent to-blue-500/10 border border-amber-500/20">
                    <div className="text-lg font-black text-[var(--text-primary)] font-['Syne',sans-serif]">
                      {careerGoal}
                    </div>
                    <div className="flex items-center gap-2 mt-2 text-xs font-semibold text-[var(--text-secondary)]">
                      <Clock size={12} className="text-amber-500" />
                      <span>Horizon: {goalTimeline}</span>
                    </div>
                  </div>
                )}
              </div>

              <div className="mt-6 pt-4 border-t border-[var(--border)]">
                <div className="text-xs font-semibold text-[var(--text-muted)]">
                  Active Calibration:
                </div>
                <div className="text-xs text-[var(--text-secondary)] mt-1">
                  Targeting Indian tech scale-up & MNC benchmarks (Tier 1 equity + ₹45L-₹60L base).
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* ─── TIER 2: EXECUTION ENGINE (Readiness, Gaps, Strategy, Actions, Outcomes) ─── */}
        <section id="readiness" className="space-y-6">
          <div>
            <div className="text-xs font-bold uppercase tracking-wider text-teal-600 dark:text-teal-400 flex items-center gap-1.5">
              <Sliders size={14} /> Level 2 Execution Framework
            </div>
            <h2 className="text-xl sm:text-2xl font-bold tracking-tight text-[var(--text-primary)] font-['Syne',sans-serif]">
              Readiness, Gaps, Strategy, Actions & Outcomes
            </h2>
          </div>

          {/* Sub-tabs for Level 2 */}
          <div className="flex items-center gap-2 overflow-x-auto pb-2 border-b border-[var(--border)]">
            {[
              { id: "readiness", label: "Readiness", count: "82%" },
              { id: "gaps", label: "Gaps", count: "3 Key" },
              { id: "strategy", label: "Strategy", count: "Roadmap" },
              { id: "actions", label: "Actions", count: `${completedCount}/${actionSteps.length}` },
              { id: "outcomes", label: "Outcomes", count: "Tracked" },
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTier2Tab(tab.id as any)}
                className={`px-4 py-2 rounded-xl text-xs font-bold transition-all whitespace-nowrap flex items-center gap-2 ${
                  activeTier2Tab === tab.id
                    ? "bg-teal-500/15 text-teal-700 dark:text-teal-300 border border-teal-500/30 shadow-xs"
                    : "text-[var(--text-secondary)] hover:bg-[var(--bg-elevated)] hover:text-[var(--text-primary)]"
                }`}
              >
                <span>{tab.label}</span>
                <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-slate-200 dark:bg-white/10 text-[var(--text-muted)] font-mono">
                  {tab.count}
                </span>
              </button>
            ))}
          </div>

          {/* Level 2 Tab Contents */}
          <div className="bg-[var(--card)] border border-[var(--border)] rounded-2xl p-6 shadow-sm">
            {activeTier2Tab === "readiness" && (
              <div className="space-y-6">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-[var(--border)]">
                  <div>
                    <h3 className="text-base font-bold text-[var(--text-primary)]">
                      Current Readiness Assessment
                    </h3>
                    <p className="text-xs text-[var(--text-muted)]">
                      Evaluated against {careerGoal} requirements and verified proof in your Journal.
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-bold px-3 py-1 rounded-full bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20">
                      Strong Core Alignment
                    </span>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="p-4 rounded-xl bg-[var(--bg-elevated)] border border-[var(--border)]">
                    <div className="text-xs font-bold text-emerald-500 uppercase tracking-wider flex items-center gap-1">
                      <CheckCircle2 size={13} /> Verified Strengths
                    </div>
                    <ul className="mt-2 space-y-1.5 text-xs text-[var(--text-secondary)]">
                      <li>• High-concurrency backend services architecture</li>
                      <li>• Production incident management & zero-downtime migrations</li>
                      <li>• Mentoring & technical documentation in Journal</li>
                    </ul>
                  </div>

                  <div className="p-4 rounded-xl bg-[var(--bg-elevated)] border border-[var(--border)]">
                    <div className="text-xs font-bold text-amber-500 uppercase tracking-wider flex items-center gap-1">
                      <AlertCircle size={13} /> Elevation Needs
                    </div>
                    <ul className="mt-2 space-y-1.5 text-xs text-[var(--text-secondary)]">
                      <li>• Multi-team roadmap synthesis & business case formulation</li>
                      <li>• Executive presentation & STAR narrative delivery</li>
                      <li>• Public GitHub / tech blog architectural proof</li>
                    </ul>
                  </div>

                  <div className="p-4 rounded-xl bg-[var(--bg-elevated)] border border-[var(--border)]">
                    <div className="text-xs font-bold text-blue-500 uppercase tracking-wider flex items-center gap-1">
                      <Rocket size={13} /> Recommended Quick Win
                    </div>
                    <p className="mt-2 text-xs text-[var(--text-secondary)] leading-relaxed">
                      Run the <strong>Precision JD Matcher</strong> with your latest target opening to generate targeted resume bullet points.
                    </p>
                    <Link
                      href="/resume/tailor"
                      className="mt-3 inline-flex items-center gap-1 text-xs font-bold text-blue-500 hover:underline"
                    >
                      <span>Tailor Resume</span>
                      <ArrowRight size={12} />
                    </Link>
                  </div>
                </div>
              </div>
            )}

            {activeTier2Tab === "gaps" && (
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="text-base font-bold text-[var(--text-primary)]">
                    Identified Career & Competency Gaps
                  </h3>
                  <Link
                    href="/career-copilot?tab=skillgap"
                    className="text-xs font-bold text-amber-500 hover:underline inline-flex items-center gap-1"
                  >
                    <span>Open Skill Gap Telemetry</span>
                    <ArrowUpRight size={12} />
                  </Link>
                </div>
                <div className="space-y-3">
                  <div className="p-4 rounded-xl bg-[var(--bg-elevated)] border border-[var(--border)] flex items-start justify-between gap-4">
                    <div>
                      <div className="text-sm font-bold text-[var(--text-primary)]">
                        Staff-Level Cross-Functional Influence
                      </div>
                      <div className="text-xs text-[var(--text-secondary)] mt-1">
                        Target roles require documented examples of driving consensus across Product, Data, and SRE organizations.
                      </div>
                    </div>
                    <span className="text-[11px] font-bold px-2 py-0.5 rounded bg-red-500/10 text-red-500 border border-red-500/20 shrink-0">
                      High Priority Gap
                    </span>
                  </div>

                  <div className="p-4 rounded-xl bg-[var(--bg-elevated)] border border-[var(--border)] flex items-start justify-between gap-4">
                    <div>
                      <div className="text-sm font-bold text-[var(--text-primary)]">
                        Strategic Financial & ROI Telemetry
                      </div>
                      <div className="text-xs text-[var(--text-secondary)] mt-1">
                        Resume and stories lack explicit ₹/$ cloud optimization numbers and bottom-line efficiency gains.
                      </div>
                    </div>
                    <span className="text-[11px] font-bold px-2 py-0.5 rounded bg-amber-500/10 text-amber-500 border border-amber-500/20 shrink-0">
                      Medium Gap
                    </span>
                  </div>
                </div>
              </div>
            )}

            {activeTier2Tab === "strategy" && (
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="text-base font-bold text-[var(--text-primary)]">
                    Strategic Execution Plan (How to Reach It)
                  </h3>
                  <span className="text-xs text-[var(--text-muted)]">3 Pillars Defined</span>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="p-4 rounded-xl bg-[var(--bg-elevated)] border border-[var(--border)]">
                    <div className="text-xs font-extrabold text-amber-500 uppercase tracking-wider">
                      Pillar 1 · Evidence
                    </div>
                    <div className="text-sm font-bold text-[var(--text-primary)] mt-1">
                      Proof Vault & Journaling
                    </div>
                    <p className="text-xs text-[var(--text-secondary)] mt-1.5 leading-relaxed">
                      Log at least 2 quantified impact events per week in the Career Journal to generate promotion evidence.
                    </p>
                  </div>

                  <div className="p-4 rounded-xl bg-[var(--bg-elevated)] border border-[var(--border)]">
                    <div className="text-xs font-extrabold text-teal-500 uppercase tracking-wider">
                      Pillar 2 · Narrative
                    </div>
                    <div className="text-sm font-bold text-[var(--text-primary)] mt-1">
                      Executive Storytelling
                    </div>
                    <p className="text-xs text-[var(--text-secondary)] mt-1.5 leading-relaxed">
                      Use Narrative Studio and Gap Storyteller to construct concise 2-minute elevator pitches and transition framing.
                    </p>
                  </div>

                  <div className="p-4 rounded-xl bg-[var(--bg-elevated)] border border-[var(--border)]">
                    <div className="text-xs font-extrabold text-blue-500 uppercase tracking-wider">
                      Pillar 3 · Leverage
                    </div>
                    <div className="text-sm font-bold text-[var(--text-primary)] mt-1">
                      Offer & Compensation
                    </div>
                    <p className="text-xs text-[var(--text-secondary)] mt-1.5 leading-relaxed">
                      Leverage salary benchmarking and negotiation scripts before any compensation review or counter-offer discussion.
                    </p>
                  </div>
                </div>
              </div>
            )}

            {activeTier2Tab === "actions" && (
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="text-base font-bold text-[var(--text-primary)]">
                    Concrete Next Actions
                  </h3>
                  <span className="text-xs text-[var(--text-muted)]">
                    Click checkbox to mark milestone completed
                  </span>
                </div>

                <div className="space-y-2">
                  {actionSteps.map((action) => (
                    <div
                      key={action.id}
                      className={`flex items-center justify-between p-3.5 rounded-xl border transition-all ${
                        action.completed
                          ? "bg-slate-50 dark:bg-white/[0.02] border-[var(--border)] opacity-60"
                          : "bg-[var(--bg-elevated)] border-[var(--border)] hover:border-amber-500/40"
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <button
                          onClick={() => toggleActionCompleted(action.id)}
                          className={`w-5 h-5 rounded-md flex items-center justify-center text-xs font-bold transition-colors ${
                            action.completed
                              ? "bg-emerald-500 text-white"
                              : "border border-slate-400 dark:border-slate-600 hover:border-amber-500"
                          }`}
                        >
                          {action.completed && <Check size={12} strokeWidth={3} />}
                        </button>
                        <div>
                          <span
                            className={`text-sm font-semibold ${
                              action.completed
                                ? "line-through text-[var(--text-muted)]"
                                : "text-[var(--text-primary)]"
                            }`}
                          >
                            {action.title}
                          </span>
                          <div className="text-[11px] text-[var(--text-muted)] flex items-center gap-1.5 mt-0.5">
                            <span className="font-mono text-amber-500">[{action.tag}]</span>
                            <span>via {action.toolName}</span>
                          </div>
                        </div>
                      </div>

                      <Link
                        href={action.toolLink}
                        className="text-xs font-bold text-amber-500 hover:text-amber-400 inline-flex items-center gap-1 px-3 py-1.5 rounded-lg bg-amber-500/10 border border-amber-500/20 hover:bg-amber-500/20 transition-all shrink-0"
                      >
                        <span>Launch</span>
                        <ArrowRight size={12} />
                      </Link>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {activeTier2Tab === "outcomes" && (
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="text-base font-bold text-[var(--text-primary)]">
                    Tracked Outcomes (What Actually Happened)
                  </h3>
                  <span className="text-xs text-emerald-500 font-bold">2 Recorded Wins</span>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="p-4 rounded-xl bg-emerald-500/5 border border-emerald-500/20">
                    <div className="flex items-center gap-2 text-xs font-bold text-emerald-600 dark:text-emerald-400 uppercase">
                      <Award size={14} /> Resume ATS Optimization
                    </div>
                    <div className="text-sm font-bold text-[var(--text-primary)] mt-1">
                      ATS Score Raised to 88/100
                    </div>
                    <p className="text-xs text-[var(--text-secondary)] mt-1">
                      Matched with 14 target Indian unicorn tech specifications via Precision JD Matcher.
                    </p>
                  </div>

                  <div className="p-4 rounded-xl bg-blue-500/5 border border-blue-500/20">
                    <div className="flex items-center gap-2 text-xs font-bold text-blue-600 dark:text-blue-400 uppercase">
                      <BookOpen size={14} /> Journal Proof Vault
                    </div>
                    <div className="text-sm font-bold text-[var(--text-primary)] mt-1">
                      4 High-Impact Wins Synced
                    </div>
                    <p className="text-xs text-[var(--text-secondary)] mt-1">
                      Ready for one-click promotion case compilation or portfolio export.
                    </p>
                  </div>
                </div>
              </div>
            )}
          </div>
        </section>

        {/* ─── TIER 3: LEVEL 3 TOOLS (Already Available Suite) ─── */}
        <section id="tools" className="space-y-6">
          <div>
            <div className="text-xs font-bold uppercase tracking-wider text-purple-600 dark:text-purple-400 flex items-center gap-1.5">
              <Zap size={14} /> Level 3 Strategic Tools
            </div>
            <h2 className="text-xl sm:text-2xl font-bold tracking-tight text-[var(--text-primary)] font-['Syne',sans-serif]">
              Integrated Execution Launchpad
            </h2>
            <p className="text-xs text-[var(--text-secondary)] mt-1">
              Direct access to all specialized AI tools aligned with your priorities.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {/* Tool 1: Negotiations and Offers */}
            <div className="bg-[var(--card)] border border-[var(--border)] rounded-2xl p-5 shadow-sm hover:border-amber-500/40 transition-all flex flex-col justify-between group">
              <div>
                <div className="w-10 h-10 rounded-xl bg-amber-500/15 text-amber-500 flex items-center justify-center mb-4">
                  <Handshake size={20} />
                </div>
                <h3 className="text-base font-bold text-[var(--text-primary)] group-hover:text-amber-500 transition-colors">
                  Negotiations & Offers
                </h3>
                <p className="text-xs text-[var(--text-secondary)] mt-1 leading-relaxed">
                  Evaluate multiple offer letters side-by-side, analyze equity vesting cliffs, and generate personalized negotiation scripts.
                </p>
                <div className="mt-3 flex flex-wrap gap-1.5">
                  <span className="text-[10.5px] px-2 py-0.5 rounded-md bg-amber-500/10 text-amber-600 dark:text-amber-400 font-semibold">
                    Offer Evaluator
                  </span>
                  <span className="text-[10.5px] px-2 py-0.5 rounded-md bg-amber-500/10 text-amber-600 dark:text-amber-400 font-semibold">
                    Script Generator
                  </span>
                </div>
              </div>
              <Link
                href="/career-copilot?tab=negotiation"
                className="mt-5 inline-flex items-center justify-between w-full text-xs font-bold text-brand-navy bg-amber-500 hover:bg-amber-400 px-3.5 py-2 rounded-xl transition-all shadow-xs"
              >
                <span>Launch Negotiation Suite</span>
                <ArrowRight size={13} />
              </Link>
            </div>

            {/* Tool 2: Interview Prep & Pitch */}
            <div className="bg-[var(--card)] border border-[var(--border)] rounded-2xl p-5 shadow-sm hover:border-teal-500/40 transition-all flex flex-col justify-between group">
              <div>
                <div className="w-10 h-10 rounded-xl bg-teal-500/15 text-teal-500 flex items-center justify-center mb-4">
                  <MessageSquare size={20} />
                </div>
                <h3 className="text-base font-bold text-[var(--text-primary)] group-hover:text-teal-500 transition-colors">
                  Interview Prep & Pitch
                </h3>
                <p className="text-xs text-[var(--text-secondary)] mt-1 leading-relaxed">
                  Generate AI-predicted questions, calibrate your professional narrative in Narrative Studio, and constructively frame career gaps.
                </p>
                <div className="mt-3 flex flex-wrap gap-1.5">
                  <span className="text-[10.5px] px-2 py-0.5 rounded-md bg-teal-500/10 text-teal-600 dark:text-teal-400 font-semibold">
                    Narrative Studio
                  </span>
                  <span className="text-[10.5px] px-2 py-0.5 rounded-md bg-teal-500/10 text-teal-600 dark:text-teal-400 font-semibold">
                    AI Questions
                  </span>
                  <span className="text-[10.5px] px-2 py-0.5 rounded-md bg-teal-500/10 text-teal-600 dark:text-teal-400 font-semibold">
                    Gap Storyteller
                  </span>
                </div>
              </div>
              <Link
                href="/career-copilot?tab=interview"
                className="mt-5 inline-flex items-center justify-between w-full text-xs font-bold text-white bg-teal-600 hover:bg-teal-500 px-3.5 py-2 rounded-xl transition-all shadow-xs"
              >
                <span>Launch Interview Prep</span>
                <ArrowRight size={13} />
              </Link>
            </div>

            {/* Tool 3: Skill Gap & Career Path */}
            <div className="bg-[var(--card)] border border-[var(--border)] rounded-2xl p-5 shadow-sm hover:border-purple-500/40 transition-all flex flex-col justify-between group">
              <div>
                <div className="w-10 h-10 rounded-xl bg-purple-500/15 text-purple-500 flex items-center justify-center mb-4">
                  <Sparkles size={20} />
                </div>
                <h3 className="text-base font-bold text-[var(--text-primary)] group-hover:text-purple-500 transition-colors">
                  Skill Gap & Career Path
                </h3>
                <p className="text-xs text-[var(--text-secondary)] mt-1 leading-relaxed">
                  Real-time telemetry on missing tech stack proficiencies and AI-recommended next-step career trajectories.
                </p>
                <div className="mt-3 flex flex-wrap gap-1.5">
                  <span className="text-[10.5px] px-2 py-0.5 rounded-md bg-purple-500/10 text-purple-600 dark:text-purple-400 font-semibold">
                    Skill Telemetry
                  </span>
                  <span className="text-[10.5px] px-2 py-0.5 rounded-md bg-purple-500/10 text-purple-600 dark:text-purple-400 font-semibold">
                    Trajectory AI
                  </span>
                </div>
              </div>
              <Link
                href="/career-copilot?tab=skillgap"
                className="mt-5 inline-flex items-center justify-between w-full text-xs font-bold text-white bg-purple-600 hover:bg-purple-500 px-3.5 py-2 rounded-xl transition-all shadow-xs"
              >
                <span>Audit Skill Gaps</span>
                <ArrowRight size={13} />
              </Link>
            </div>

            {/* Tool 4: Planning & Growth */}
            <div className="bg-[var(--card)] border border-[var(--border)] rounded-2xl p-5 shadow-sm hover:border-rose-500/40 transition-all flex flex-col justify-between group">
              <div>
                <div className="w-10 h-10 rounded-xl bg-rose-500/15 text-rose-500 flex items-center justify-center mb-4">
                  <Rocket size={20} />
                </div>
                <h3 className="text-base font-bold text-[var(--text-primary)] group-hover:text-rose-500 transition-colors">
                  Planning & Growth
                </h3>
                <p className="text-xs text-[var(--text-secondary)] mt-1 leading-relaxed">
                  Build ironclad promotion business cases with logged accomplishments and draft executive networking outreach.
                </p>
                <div className="mt-3 flex flex-wrap gap-1.5">
                  <span className="text-[10.5px] px-2 py-0.5 rounded-md bg-rose-500/10 text-rose-600 dark:text-rose-400 font-semibold">
                    Promotion Case Builder
                  </span>
                  <span className="text-[10.5px] px-2 py-0.5 rounded-md bg-rose-500/10 text-rose-600 dark:text-rose-400 font-semibold">
                    Networking Assistant
                  </span>
                </div>
              </div>
              <Link
                href="/career-copilot?tab=growth"
                className="mt-5 inline-flex items-center justify-between w-full text-xs font-bold text-white bg-rose-600 hover:bg-rose-500 px-3.5 py-2 rounded-xl transition-all shadow-xs"
              >
                <span>Launch Growth Suite</span>
                <ArrowRight size={13} />
              </Link>
            </div>

            {/* Tool 5: Match & Tailoring */}
            <div className="bg-[var(--card)] border border-[var(--border)] rounded-2xl p-5 shadow-sm hover:border-blue-500/40 transition-all flex flex-col justify-between group">
              <div>
                <div className="w-10 h-10 rounded-xl bg-blue-500/15 text-blue-500 flex items-center justify-center mb-4">
                  <Crosshair size={20} />
                </div>
                <h3 className="text-base font-bold text-[var(--text-primary)] group-hover:text-blue-500 transition-colors">
                  Match: Precision JD Matching
                </h3>
                <p className="text-xs text-[var(--text-secondary)] mt-1 leading-relaxed">
                  Paste any job description to compute instant ATS match percentages and generate AI-tailored resume bullets.
                </p>
                <div className="mt-3 flex flex-wrap gap-1.5">
                  <span className="text-[10.5px] px-2 py-0.5 rounded-md bg-blue-500/10 text-blue-600 dark:text-blue-400 font-semibold">
                    JD Match Score
                  </span>
                  <span className="text-[10.5px] px-2 py-0.5 rounded-md bg-blue-500/10 text-blue-600 dark:text-blue-400 font-semibold">
                    Bullet Tailoring
                  </span>
                </div>
              </div>
              <Link
                href="/resume/tailor"
                className="mt-5 inline-flex items-center justify-between w-full text-xs font-bold text-white bg-blue-600 hover:bg-blue-500 px-3.5 py-2 rounded-xl transition-all shadow-xs"
              >
                <span>Launch JD Matcher</span>
                <ArrowRight size={13} />
              </Link>
            </div>

            {/* Tool 6: Journal Integration */}
            <div className="bg-[var(--card)] border border-[var(--border)] rounded-2xl p-5 shadow-sm hover:border-emerald-500/40 transition-all flex flex-col justify-between group">
              <div>
                <div className="w-10 h-10 rounded-xl bg-emerald-500/15 text-emerald-500 flex items-center justify-center mb-4">
                  <BookOpen size={20} />
                </div>
                <h3 className="text-base font-bold text-[var(--text-primary)] group-hover:text-emerald-500 transition-colors">
                  Proof Vault & Journal
                </h3>
                <p className="text-xs text-[var(--text-secondary)] mt-1 leading-relaxed">
                  Record weekly impact events, maintain streak telemetry, and synchronize GitHub commits and PRs into permanent career capital.
                </p>
                <div className="mt-3 flex flex-wrap gap-1.5">
                  <span className="text-[10.5px] px-2 py-0.5 rounded-md bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 font-semibold">
                    Weekly Wins
                  </span>
                  <span className="text-[10.5px] px-2 py-0.5 rounded-md bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 font-semibold">
                    Achievement Radar
                  </span>
                </div>
              </div>
              <Link
                href="/career-journal"
                className="mt-5 inline-flex items-center justify-between w-full text-xs font-bold text-white bg-emerald-600 hover:bg-emerald-500 px-3.5 py-2 rounded-xl transition-all shadow-xs"
              >
                <span>Open Career Journal</span>
                <ArrowRight size={13} />
              </Link>
            </div>
          </div>
        </section>
      </main>
    </div>
  );
}
