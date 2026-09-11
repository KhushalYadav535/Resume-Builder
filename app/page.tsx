"use client";

import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { useAuth } from "@/hooks/useAuth";
import Navbar from "@/components/Navbar";
import PricingSection from "@/components/pricing/PricingSection";
import { motion, AnimatePresence } from "framer-motion";
import {
  Sparkles,
  BookOpen,
  Target,
  TrendingUp,
  ArrowRight,
  CheckCircle2,
  Zap,
  Award,
  ChevronRight,
  ShieldCheck,
  Compass,
  FileText,
  Search,
  MessageSquare,
  Lock,
  Send,
  Star,
  BarChart2,
  Layers,
  ArrowUpRight,
  Check,
  Building2,
  DollarSign,
  Workflow,
  Lightbulb,
  Clock,
  Briefcase,
  Sliders,
  Copy,
  CheckCheck,
  Cpu,
  HelpCircle,
  Activity,
  Flame,
  Shield,
  BadgeCheck,
  Terminal,
  Maximize2,
  ChevronDown,
  ChevronLeft,
  Play,
  Pause,
  RotateCcw,
  Quote,
} from "lucide-react";
import QuickScanModal from "@/components/QuickScanModal";

/* ───── Animated Number Counter ───── */
function Counter({
  value,
  suffix = "",
  prefix = "",
}: {
  value: number;
  suffix?: string;
  prefix?: string;
}) {
  const [count, setCount] = useState(0);

  useEffect(() => {
    let start = 0;
    const end = value;
    const duration = 1800;
    const increment = Math.max(1, Math.floor(end / (duration / 16)));
    const timer = setInterval(() => {
      start += increment;
      if (start >= end) {
        setCount(end);
        clearInterval(timer);
      } else {
        setCount(start);
      }
    }, 16);
    return () => clearInterval(timer);
  }, [value]);

  return (
    <span>
      {prefix}
      {count}
      {suffix}
    </span>
  );
}

/* ───── Floating Scroll Progress (Sleek Top Bar) ───── */
function ScrollProgress() {
  const [scrollProgress, setScrollProgress] = useState(0);

  useEffect(() => {
    const handleScroll = () => {
      const windowHeight = document.documentElement.scrollHeight - window.innerHeight;
      if (windowHeight > 0) {
        setScrollProgress((window.scrollY / windowHeight) * 100);
      }
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <div className="fixed top-0 left-0 right-0 h-[2.5px] z-[150] pointer-events-none bg-white/[0.04]">
      <div
        className="h-full transition-all duration-150 gradient-career-path"
        style={{ width: `${scrollProgress}%` }}
      />
    </div>
  );
}

/* ═══════════════════════════════════════════════
   HERO COMMAND CENTER (Interactive Software Console)
   ═══════════════════════════════════════════════ */
function HeroCommandCenter() {
  const [activeTab, setActiveTab] = useState<"resume" | "linkedin" | "interview" | "dossier">("resume");
  const [copied, setCopied] = useState(false);

  const outputs = {
    resume: {
      badge: "Workday & Greenhouse Pass",
      badgeColor: "text-[#60A5FA] bg-blue-500/10 border-blue-500/30",
      target: "Senior Full-Stack Architect",
      atsScore: "96%",
      snippet: "Architected enterprise real-time transaction engine processing ₹14M+ daily with 99.98% uptime. Engineered zero-downtime DB cluster migration across 12 regions, slashing global latency by 42%.",
      tags: ["Workday Verified", "Quantified Metrics", "Action-First Verbs"],
    },
    linkedin: {
      badge: "Top 2% Recruiter Match",
      badgeColor: "text-[#2DD4BF] bg-teal-500/10 border-teal-500/30",
      target: "Inbound Recruiter Magnet",
      atsScore: "3.4x",
      snippet: "Headline: Senior Staff Engineer | Cloud Architecture (AWS/GCP) | Scaled Systems to 5M+ DAU\nAbout Hook: 'I build fault-tolerant distributed systems where milliseconds equal revenue.'",
      tags: ["High InMail Conversion", "Algorithmic Search Index", "Storytelling Hook"],
    },
    interview: {
      badge: "Exec Round Ready",
      badgeColor: "text-[#A855F7] bg-purple-500/10 border-purple-500/30",
      target: "STAR Crisis Pitch",
      atsScore: "High",
      snippet: "Situation: Peak Diwali sale queue jammed at 18k req/s.\nTask: Clear backlog within 15 min with zero loss.\nAction: Deployed dynamic backpressure throttler.\nResult: Resolved in 11m, protected ₹45L revenue.",
      tags: ["STAR Framework", "Executive Proof", "Zero Blanking Out"],
    },
    dossier: {
      badge: "Appraisal-Ready Proof",
      badgeColor: "text-[#FBBF24] bg-amber-500/10 border-amber-500/30",
      target: "Promotion & Salary ROI",
      atsScore: "+₹18.5L",
      snippet: "Delivered ₹18.5L annual cloud FinOps savings via automated provisioning. Mentored 4 engineers into mid-level elevations. Documented business case ready for appraisal committee.",
      tags: ["FinOps ROI", "Leadership Multiplier", "Comp Leverage"],
    },
  };

  const cur = outputs[activeTab];

  const handleCopy = () => {
    navigator.clipboard.writeText(cur.snippet);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="relative w-full max-w-5xl mx-auto">
      {/* Radiant Glow Mesh */}
      <div className="absolute -inset-1.5 bg-gradient-to-r from-[#2563EB]/25 via-[#14B8A6]/20 to-[#F59E0B]/30 rounded-3xl blur-2xl opacity-80 pointer-events-none" />

      {/* Main Console Frame */}
      <div className="relative rounded-2xl card-obsidian border border-white/15 shadow-2xl overflow-hidden text-white">
        {/* Window Topbar */}
        <div className="flex items-center justify-between px-5 py-3.5 bg-white/[0.04] border-b border-white/10">
          <div className="flex items-center gap-2">
            <span className="w-3 h-3 rounded-full bg-rose-500/80 inline-block" />
            <span className="w-3 h-3 rounded-full bg-amber-500/80 inline-block" />
            <span className="w-3 h-3 rounded-full bg-emerald-500/80 inline-block" />
            <span className="text-[11px] font-mono text-slate-400 ml-2 hidden sm:inline-block">
              uprole_career_engine_v2.4.prod
            </span>
          </div>
          <div className="flex items-center gap-3">
            <span className="text-[10px] font-mono font-bold px-2.5 py-0.5 rounded bg-emerald-500/15 border border-emerald-500/30 text-emerald-300 flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
              VAULT ACTIVE
            </span>
            <span className="text-[10px] font-mono text-slate-400 hidden md:inline">
              SYNCED WITH 400+ ATS BENCHMARKS
            </span>
          </div>
        </div>

        {/* Console Workspace: 2-Column Split */}
        <div className="p-6 sm:p-8 grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Left Column: Live Raw Evidence Ingest */}
          <div className="lg:col-span-6 space-y-4 flex flex-col justify-between">
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold uppercase tracking-wider text-slate-300 flex items-center gap-1.5">
                  <Sparkles size={14} className="text-[#F59E0B]" />
                  Career Vault Evidence Ingest
                </span>
                <span className="text-[10px] font-mono text-[#60A5FA] bg-blue-500/10 px-2 py-0.5 rounded border border-blue-500/20">
                  Impact Verified
                </span>
              </div>

              {/* Raw vs Extracted Comparison */}
              <div className="space-y-2">
                <div className="p-3 rounded-lg bg-black/40 border border-white/5 text-xs text-slate-400 font-mono">
                  <span className="text-slate-500 block text-[10px] uppercase font-bold mb-1">
                    [Before: Raw Unrecorded Memory]
                  </span>
                  &quot;I helped scale our databases during our peak festival sales and assisted teammates with code reviews.&quot;
                </div>

                <div className="p-3.5 rounded-xl bg-gradient-to-br from-[#101B3B]/90 to-[#060A14] border border-[#F59E0B]/30 text-xs text-slate-100 font-mono space-y-2 shadow-inner">
                  <span className="text-amber-400 block text-[10px] uppercase font-bold flex items-center gap-1">
                    <CheckCircle2 size={12} className="text-emerald-400" />
                    [After: UpRole Verified Impact Synthesis]
                  </span>
                  <p className="leading-relaxed text-[12.5px] text-slate-200">
                    &quot;Architected 12-region database cluster failover handling <strong className="text-amber-300">₹14M+ daily volume</strong> at <strong className="text-emerald-300">99.98% SLA</strong>; slashed latency by 42% and elevated 4 developers into senior roles.&quot;
                  </p>
                  <div className="flex flex-wrap gap-1.5 pt-1">
                    <span className="text-[10px] px-2 py-0.5 rounded bg-[#F59E0B]/15 text-[#FBBF24] font-bold">
                      ₹14M+ Daily Volume
                    </span>
                    <span className="text-[10px] px-2 py-0.5 rounded bg-emerald-500/15 text-emerald-300 font-bold">
                      99.98% SLA
                    </span>
                    <span className="text-[10px] px-2 py-0.5 rounded bg-blue-500/15 text-blue-300 font-bold">
                      -42% Latency
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* Live Career Value Quotient Radar */}
            <div className="p-3.5 rounded-xl bg-white/[0.03] border border-white/10 flex items-center justify-between">
              <div>
                <span className="text-[10px] uppercase tracking-wider text-slate-400 block font-mono">
                  Career Value Index
                </span>
                <div className="flex items-baseline gap-1.5 mt-0.5">
                  <span className="text-2xl font-extrabold text-white font-['Syne',sans-serif]">88</span>
                  <span className="text-xs text-slate-400 font-mono">/ 100</span>
                  <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-emerald-500/20 text-emerald-300 ml-1">
                    Staff Ready
                  </span>
                </div>
              </div>
              <div className="text-right">
                <span className="text-[10px] uppercase tracking-wider text-slate-400 block font-mono">
                  Market Valuation
                </span>
                <span className="text-sm font-extrabold text-[#F59E0B] font-mono">
                  ₹38L – ₹52L Base
                </span>
              </div>
            </div>
          </div>

          {/* Right Column: Multi-Output Live Synthesizer */}
          <div className="lg:col-span-6 space-y-4">
            {/* Tab Selectors */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-1.5 p-1 bg-black/40 rounded-xl border border-white/10 text-xs">
              {(
                [
                  { key: "resume", label: "ATS Resume" },
                  { key: "linkedin", label: "LinkedIn" },
                  { key: "interview", label: "STAR Pitch" },
                  { key: "dossier", label: "Promotion" },
                ] as const
              ).map((tab) => (
                <button
                  key={tab.key}
                  onClick={() => setActiveTab(tab.key)}
                  className={`py-2 px-2 text-xs font-bold rounded-lg transition-all ${
                    activeTab === tab.key
                      ? "bg-[#F59E0B] text-slate-950 shadow-md font-extrabold"
                      : "text-slate-400 hover:text-white"
                  }`}
                >
                  {tab.label}
                </button>
              ))}
            </div>

            {/* Tab Preview Box */}
            <AnimatePresence mode="wait">
              <motion.div
                key={activeTab}
                initial={{ opacity: 0, y: 6 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -6 }}
                transition={{ duration: 0.18 }}
                className="p-4 sm:p-5 rounded-xl bg-white/[0.03] border border-white/10 space-y-3"
              >
                <div className="flex items-center justify-between pb-2.5 border-b border-white/10">
                  <div>
                    <span className={`text-[10px] font-bold px-2.5 py-0.5 rounded-full border uppercase tracking-wider ${cur.badgeColor}`}>
                      {cur.badge}
                    </span>
                    <h5 className="text-sm font-bold text-white mt-1.5">
                      {cur.target}
                    </h5>
                  </div>
                  <div className="text-right">
                    <span className="text-[9px] uppercase tracking-wider text-slate-400 block font-mono">
                      Validation
                    </span>
                    <span className="text-xl font-extrabold text-[#F59E0B] font-['Syne',sans-serif]">
                      {cur.atsScore}
                    </span>
                  </div>
                </div>

                <p className="text-xs font-mono text-slate-200 leading-relaxed whitespace-pre-line bg-black/30 p-3 rounded-lg border border-white/5">
                  {cur.snippet}
                </p>

                <div className="flex items-center justify-between pt-1">
                  <div className="flex flex-wrap gap-1.5">
                    {cur.tags.map((tag, i) => (
                      <span key={i} className="text-[10px] px-2 py-0.5 rounded bg-white/5 text-slate-300">
                        ✓ {tag}
                      </span>
                    ))}
                  </div>
                  <button
                    onClick={handleCopy}
                    className="flex items-center gap-1 text-[11px] font-semibold text-slate-300 hover:text-white bg-white/5 hover:bg-white/10 px-2.5 py-1 rounded transition-colors"
                  >
                    {copied ? <CheckCheck size={12} className="text-emerald-400" /> : <Copy size={12} />}
                    <span>{copied ? "Copied" : "Copy"}</span>
                  </button>
                </div>
              </motion.div>
            </AnimatePresence>

            {/* Next Best Action Callout */}
            <div className="p-3 rounded-xl bg-gradient-to-r from-blue-600/15 via-teal-500/10 to-transparent border border-blue-500/20 flex items-center justify-between text-xs">
              <div className="flex items-center gap-2">
                <div className="w-7 h-7 rounded-lg bg-blue-500/20 flex items-center justify-center text-blue-400 shrink-0">
                  <Target size={14} />
                </div>
                <div>
                  <span className="font-bold text-white block">Next Best High-Leverage Move</span>
                  <span className="text-[11px] text-slate-300">Align 3 bullets to Workday JD for +12 ATS boost</span>
                </div>
              </div>
              <Link href="/resume/upload" className="no-underline">
                <button className="px-3 py-1.5 rounded-lg bg-[#2563EB] hover:bg-blue-600 text-white font-bold text-[11px] transition-colors whitespace-nowrap">
                  Execute ➔
                </button>
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

/* ═══════════════════════════════════════════════
   INTERACTIVE BULLET TRANSFORMER (Before / After Showcase)
   ═══════════════════════════════════════════════ */
function InteractiveBulletTransformer() {
  const [role, setRole] = useState<"swe" | "pm" | "em">("swe");

  const examples = {
    swe: {
      role: "Senior Software Engineer",
      before: "Built features for our payment gateway and improved transaction response times. Worked with backend APIs and fixed several database latency bugs.",
      after: "Engineered high-concurrency microservices processing ₹14M+ daily volume; refactored PostgreSQL indexing to slash p99 latency from 420ms to 68ms (-84%) with 99.98% uptime.",
      impact: "+38 ATS Points • Workday Pass • Executive Ready",
      metric: "84% Latency Drop",
    },
    pm: {
      role: "Lead Product Manager",
      before: "Managed roadmap for onboarding flow. Talked to customers and coordinated with engineering to launch new sign-up features.",
      after: "Spearheaded 0-to-1 onboarding overhaul across 350K MAUs; reduced activation drop-off from 41% to 19%, unlocking ₹42L in annualized self-serve ARR within 90 days.",
      impact: "+44 ATS Points • C-Suite Credibility • High InMail",
      metric: "₹42L ARR Lift",
    },
    em: {
      role: "Engineering Manager",
      before: "Managed a team of 8 software engineers. Ran sprint planning, 1-on-1s, and helped hire new developers for our growth initiatives.",
      after: "Led high-output squad of 9 engineers across 4 time zones; shortened cycle time from 18 to 6 days (-66%) via automated CI/CD pipelines while maintaining 0% regretted attrition across 24 months.",
      impact: "+40 ATS Points • Leadership Multiplier • Promotion Locked",
      metric: "66% Faster Cycle",
    },
  };

  const active = examples[role];

  return (
    <div className="max-w-5xl mx-auto rounded-2xl card-obsidian border border-white/15 p-6 sm:p-9 shadow-2xl space-y-6">
      <div className="text-center space-y-3 max-w-2xl mx-auto">
        <span className="text-xs font-bold uppercase tracking-widest text-[#F59E0B]">
          Evidence Extraction Engine
        </span>
        <h3 className="text-2xl sm:text-3xl font-extrabold font-['Syne',sans-serif] text-white">
          See the Difference Evidence Makes
        </h3>
        <p className="text-xs sm:text-sm text-slate-300">
          Hiring managers and ATS parsers discard generic responsibilities. UpRole uncovers verifiable business outcomes hidden in your daily work.
        </p>
      </div>

      {/* Role Switcher */}
      <div className="flex justify-center gap-2">
        {(
          [
            { key: "swe", label: "Software Engineer" },
            { key: "pm", label: "Product Manager" },
            { key: "em", label: "Engineering Manager" },
          ] as const
        ).map((item) => (
          <button
            key={item.key}
            onClick={() => setRole(item.key)}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${
              role === item.key
                ? "bg-[#F59E0B] text-slate-950 shadow-md font-extrabold scale-105"
                : "bg-white/5 text-slate-400 hover:text-white border border-white/10"
            }`}
          >
            {item.label}
          </button>
        ))}
      </div>

      {/* Before / After Dual Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5 pt-2">
        {/* Before */}
        <div className="p-5 rounded-xl bg-red-950/15 border border-red-500/20 space-y-3">
          <div className="flex items-center justify-between text-xs pb-2 border-b border-white/5">
            <span className="font-bold text-red-400 flex items-center gap-1.5">
              ✕ Traditional Unrecorded Bullet
            </span>
            <span className="text-[10px] font-mono text-slate-400">ATS Match: 38%</span>
          </div>
          <p className="text-xs sm:text-sm text-slate-300 leading-relaxed font-mono">
            &quot;{active.before}&quot;
          </p>
          <div className="pt-2 text-[11px] text-red-300/80 flex items-center gap-1">
            <span>Result: Filtered out by Workday parser within 6 seconds.</span>
          </div>
        </div>

        {/* After */}
        <div className="p-5 rounded-xl bg-gradient-to-br from-[#101B3B] to-[#0D152A] border-2 border-emerald-500/30 space-y-3 shadow-lg relative overflow-hidden">
          <div className="absolute top-0 right-0 w-24 h-24 bg-emerald-500/10 rounded-full blur-xl pointer-events-none" />
          <div className="flex items-center justify-between text-xs pb-2 border-b border-white/10">
            <span className="font-bold text-emerald-400 flex items-center gap-1.5">
              ✓ UpRole Evidence-Backed Bullet
            </span>
            <span className="text-[10px] font-mono font-bold text-[#F59E0B] bg-amber-500/15 px-2 py-0.5 rounded">
              {active.metric}
            </span>
          </div>
          <p className="text-xs sm:text-sm text-slate-100 leading-relaxed font-mono font-medium">
            &quot;{active.after}&quot;
          </p>
          <div className="pt-2 text-[11px] font-semibold text-emerald-300 flex items-center gap-1.5">
            <BadgeCheck size={14} />
            <span>{active.impact}</span>
          </div>
        </div>
      </div>
    </div>
  );
}

/* ═══════════════════════════════════════════════
   INTERACTIVE CAREER VALUE & ATS CALCULATOR
   ═══════════════════════════════════════════════ */
function CareerValueCalculator() {
  const [level, setLevel] = useState<"junior" | "mid" | "senior" | "lead" | "exec">("senior");
  const [domain, setDomain] = useState<"eng" | "product" | "data" | "design" | "finance">("eng");

  const estimates = {
    junior: { wins: "6–8 overlooked achievements", atsJump: "42% ➔ 89%", upside: "₹3.5L – ₹6.0L" },
    mid: { wins: "9–12 unrecorded wins", atsJump: "48% ➔ 92%", upside: "₹7.0L – ₹12.5L" },
    senior: { wins: "14–18 quantifiable milestones", atsJump: "54% ➔ 96%", upside: "₹14.0L – ₹24.0L" },
    lead: { wins: "18–24 systemic impact proofs", atsJump: "58% ➔ 97%", upside: "₹22.0L – ₹38.0L" },
    exec: { wins: "25+ business revenue drivers", atsJump: "62% ➔ 98%", upside: "₹35.0L – ₹60.0L+" },
  };

  const currentEst = estimates[level];

  return (
    <div className="relative w-full max-w-4xl mx-auto rounded-2xl card-obsidian border border-white/15 p-6 sm:p-9 shadow-2xl">
      <div className="text-center space-y-3 mb-8">
        <span className="text-xs font-bold uppercase tracking-widest text-[#F59E0B]">
          Instant Career Leverage Assessment
        </span>
        <h3 className="text-2xl sm:text-3xl font-extrabold font-['Syne',sans-serif] text-white">
          Discover Your Unrecorded Career Value
        </h3>
        <p className="text-xs sm:text-sm text-slate-300 max-w-xl mx-auto">
          Most professionals undervalue themselves by 30% because daily wins go unmeasured. Select your level to calculate your hidden leverage.
        </p>
      </div>

      {/* Selectors */}
      <div className="space-y-5">
        <div>
          <label className="text-xs font-semibold text-slate-300 block mb-2">
            1. Select Your Current Seniority Level:
          </label>
          <div className="grid grid-cols-2 sm:grid-cols-5 gap-2">
            {(
              [
                { key: "junior", label: "Entry (1-3y)" },
                { key: "mid", label: "Mid (3-6y)" },
                { key: "senior", label: "Senior (6-9y)" },
                { key: "lead", label: "Lead / Staff (9-14y)" },
                { key: "exec", label: "Director / Exec" },
              ] as const
            ).map((item) => (
              <button
                key={item.key}
                onClick={() => setLevel(item.key)}
                className={`py-2 px-2.5 text-xs font-bold rounded-lg border transition-all ${
                  level === item.key
                    ? "bg-[#F59E0B] text-slate-950 border-[#F59E0B] shadow-md scale-105 font-extrabold"
                    : "bg-white/5 text-slate-300 border-white/10 hover:border-white/25 hover:text-white"
                }`}
              >
                {item.label}
              </button>
            ))}
          </div>
        </div>

        <div>
          <label className="text-xs font-semibold text-slate-300 block mb-2">
            2. Select Your Professional Domain:
          </label>
          <div className="grid grid-cols-2 sm:grid-cols-5 gap-2">
            {(
              [
                { key: "eng", label: "Engineering / Arch" },
                { key: "product", label: "Product Mgmt" },
                { key: "data", label: "Data & AI" },
                { key: "design", label: "Design & UX" },
                { key: "finance", label: "Strategy & Finance" },
              ] as const
            ).map((item) => (
              <button
                key={item.key}
                onClick={() => setDomain(item.key)}
                className={`py-2 px-2.5 text-xs font-bold rounded-lg border transition-all ${
                  domain === item.key
                    ? "bg-[#2563EB] text-white border-[#2563EB] shadow-md font-extrabold"
                    : "bg-white/5 text-slate-300 border-white/10 hover:border-white/25 hover:text-white"
                }`}
              >
                {item.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Calculated Results Box */}
      <div className="mt-8 p-6 rounded-xl bg-gradient-to-br from-[#060A14] to-[#101B3B] border border-white/15 grid grid-cols-1 md:grid-cols-3 gap-6 text-center shadow-inner">
        <div className="space-y-1">
          <span className="text-[11px] font-mono text-slate-400 uppercase tracking-wider block">
            Unrecorded Wins
          </span>
          <div className="text-lg sm:text-xl font-extrabold text-[#14B8A6] font-['Syne',sans-serif]">
            {currentEst.wins}
          </div>
          <span className="text-[10px] text-slate-400">Ready to surface in Journal</span>
        </div>

        <div className="space-y-1 border-t md:border-t-0 md:border-x border-white/10 pt-4 md:pt-0">
          <span className="text-[11px] font-mono text-slate-400 uppercase tracking-wider block">
            ATS Pass Rate Jump
          </span>
          <div className="text-lg sm:text-xl font-extrabold text-[#60A5FA] font-['Syne',sans-serif]">
            {currentEst.atsJump}
          </div>
          <span className="text-[10px] text-slate-400">Workday & Greenhouse Indexed</span>
        </div>

        <div className="space-y-1 border-t md:border-t-0 border-white/10 pt-4 md:pt-0">
          <span className="text-[11px] font-mono text-slate-400 uppercase tracking-wider block">
            Compensation Leverage
          </span>
          <div className="text-lg sm:text-xl font-extrabold text-[#F59E0B] font-['Syne',sans-serif]">
            {currentEst.upside}
          </div>
          <span className="text-[10px] text-slate-400">Estimated Annual Base Lift</span>
        </div>
      </div>

      {/* Direct CTA */}
      <div className="mt-6 text-center">
        <Link href="/resume/upload" className="no-underline">
          <button className="px-8 py-3.5 rounded-xl btn-warm-amber text-slate-950 font-extrabold text-sm shadow-lg hover:scale-105 transition-transform flex items-center gap-2 mx-auto">
            <span>Claim Your Free Career Analysis</span>
            <ArrowRight size={16} />
          </button>
        </Link>
        <span className="text-[11px] text-slate-400 mt-2 block">
          No credit card required • 100 free welcome credits included
        </span>
      </div>
    </div>
  );
}

/* ═══════════════════════════════════════════════
   OPERATING SYSTEM HUD (Interactive 4-Quadrant Console)
   Section 9 of Foundation Doc:
   1. Where am I? (Career Value)
   2. Where can I go? (Career Opportunities)
   3. What am I trying to achieve? (Career Goal)
   4. What should I do next? (Next Best Action)
   ═══════════════════════════════════════════════ */
function OperatingSystemHUD() {
  const [selectedPillar, setSelectedPillar] = useState<"all" | "01" | "02" | "03" | "04">("all");
  const [isExecuting, setIsExecuting] = useState(false);
  const [executedSuccess, setExecutedSuccess] = useState(false);

  const handleExecute = () => {
    setIsExecuting(true);
    setTimeout(() => {
      setIsExecuting(false);
      setExecutedSuccess(true);
      setTimeout(() => setExecutedSuccess(false), 4000);
    }, 850);
  };

  return (
    <div className="relative w-full max-w-5xl mx-auto">
      {/* Ambient Console Halo */}
      <div className="absolute -inset-1.5 bg-gradient-to-r from-blue-600/20 via-teal-500/20 to-amber-500/25 rounded-3xl blur-2xl opacity-70 pointer-events-none" />

      {/* Main Console Canvas */}
      <div className="relative rounded-2xl card-obsidian border border-white/15 shadow-2xl overflow-hidden text-white backdrop-blur-xl">
        {/* Top Control Bar */}
        <div className="flex flex-wrap items-center justify-between gap-3 px-5 py-3.5 bg-white/[0.04] border-b border-white/10">
          <div className="flex items-center gap-2.5">
            <span className="w-3 h-3 rounded-full bg-rose-500/80 inline-block" />
            <span className="w-3 h-3 rounded-full bg-amber-500/80 inline-block" />
            <span className="w-3 h-3 rounded-full bg-emerald-500/80 inline-block" />
            <span className="text-[11px] font-mono text-slate-300 ml-1.5 font-bold hidden sm:inline-block">
              UPROLE_COMMAND_CENTER // ARCHITECTURE PRINCIPLE #9
            </span>
          </div>

          {/* Quick Pillar Filter Buttons */}
          <div className="flex items-center gap-1 bg-black/40 p-1 rounded-xl border border-white/10 text-[11px]">
            {(
              [
                { key: "all", label: "Full HUD (All 4)" },
                { key: "01", label: "01 Value" },
                { key: "02", label: "02 Market" },
                { key: "03", label: "03 Goal" },
                { key: "04", label: "04 Action" },
              ] as const
            ).map((tab) => (
              <button
                key={tab.key}
                onClick={() => setSelectedPillar(tab.key)}
                className={`px-2.5 py-1 rounded-lg font-bold transition-all ${
                  selectedPillar === tab.key
                    ? "bg-[#2563EB] text-white shadow font-extrabold"
                    : "text-slate-400 hover:text-white"
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>

          <div className="flex items-center gap-2">
            <span className="text-[10px] font-mono font-bold px-2.5 py-0.5 rounded bg-blue-500/15 border border-blue-500/30 text-blue-300 flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 rounded-full bg-blue-400 animate-pulse" />
              5-SECOND CLARITY ACTIVE
            </span>
          </div>
        </div>

        {/* 4 Quadrants Grid Workspace */}
        <div className="p-6 sm:p-8 grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* ──── QUADRANT 01: Where am I? (Blue - Discover) ──── */}
          {(selectedPillar === "all" || selectedPillar === "01") && (
            <div
              onClick={() => setSelectedPillar(selectedPillar === "01" ? "all" : "01")}
              className={`p-6 rounded-2xl bg-[#101B3B]/60 border transition-all cursor-pointer flex flex-col justify-between group ${
                selectedPillar === "01"
                  ? "border-blue-400 shadow-[0_0_25px_rgba(37,99,235,0.3)] md:col-span-2"
                  : "border-blue-500/30 hover:border-blue-400 hover:bg-[#101B3B]/80 shadow-lg"
              }`}
            >
              <div className="space-y-4">
                <div className="flex items-center justify-between pb-3 border-b border-white/10">
                  <div className="flex items-center gap-2">
                    <span className="w-6 h-6 rounded-md bg-blue-500/20 border border-blue-500/30 text-blue-300 font-mono font-bold text-xs flex items-center justify-center">
                      01
                    </span>
                    <div>
                      <span className="text-xs font-bold text-slate-300 uppercase tracking-wider font-mono block">
                        Where am I?
                      </span>
                      <span className="text-[10px] text-blue-300/80 font-mono font-medium">
                        Career Value Quotient
                      </span>
                    </div>
                  </div>
                  <span className="text-xs font-mono font-bold bg-blue-500/15 text-[#60A5FA] px-3 py-1 rounded-full border border-blue-500/30">
                    Readiness: 88/100
                  </span>
                </div>

                <div className="flex items-baseline justify-between pt-1">
                  <div>
                    <div className="flex items-baseline gap-2">
                      <span className="text-4xl sm:text-5xl font-extrabold text-white font-['Syne',sans-serif]">
                        88
                      </span>
                      <span className="text-sm font-mono text-slate-400">/ 100</span>
                    </div>
                    <span className="text-xs font-semibold text-emerald-400 flex items-center gap-1 mt-1">
                      <TrendingUp size={13} />
                      Top 4% Staff Readiness Tier
                    </span>
                  </div>

                  {/* 5-Segment Bar */}
                  <div className="flex gap-1 items-end h-8">
                    {[1, 2, 3, 4].map((i) => (
                      <div key={i} className="w-2.5 rounded-sm bg-[#2563EB] h-full shadow-[0_0_8px_rgba(37,99,235,0.6)]" />
                    ))}
                    <div className="w-2.5 rounded-sm bg-white/15 h-full" />
                  </div>
                </div>

                <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
                  Your readiness index synthesized from verified business impact, architecture depth, and leadership progression evidence.
                </p>

                {/* Evidence Chips */}
                <div className="grid grid-cols-3 gap-2 pt-1 text-[11px] font-mono">
                  <div className="p-2 rounded-lg bg-black/30 border border-white/5 text-center">
                    <span className="text-slate-400 block text-[9px]">WINS LOGGED</span>
                    <span className="text-white font-bold">18 Verified</span>
                  </div>
                  <div className="p-2 rounded-lg bg-black/30 border border-white/5 text-center">
                    <span className="text-slate-400 block text-[9px]">PROOF DEPTH</span>
                    <span className="text-[#60A5FA] font-bold">94% Metric</span>
                  </div>
                  <div className="p-2 rounded-lg bg-black/30 border border-white/5 text-center">
                    <span className="text-slate-400 block text-[9px]">REVENUE ROI</span>
                    <span className="text-emerald-400 font-bold">₹4.2Cr</span>
                  </div>
                </div>
              </div>

              <div className="mt-5 pt-3 border-t border-white/10 flex items-center justify-between text-xs">
                <span className="text-slate-400 flex items-center gap-1.5">
                  <CheckCircle2 size={13} className="text-blue-400" />
                  Evidence Vault in Sync
                </span>
                <span className="text-[#2DD4BF] font-mono font-bold">+18 pts since Q2 cycle</span>
              </div>
            </div>
          )}

          {/* ──── QUADRANT 02: Where can I go? (Teal - Develop) ──── */}
          {(selectedPillar === "all" || selectedPillar === "02") && (
            <div
              onClick={() => setSelectedPillar(selectedPillar === "02" ? "all" : "02")}
              className={`p-6 rounded-2xl bg-[#0B252C]/60 border transition-all cursor-pointer flex flex-col justify-between group ${
                selectedPillar === "02"
                  ? "border-teal-400 shadow-[0_0_25px_rgba(20,184,166,0.3)] md:col-span-2"
                  : "border-teal-500/30 hover:border-teal-400 hover:bg-[#0B252C]/80 shadow-lg"
              }`}
            >
              <div className="space-y-4">
                <div className="flex items-center justify-between pb-3 border-b border-white/10">
                  <div className="flex items-center gap-2">
                    <span className="w-6 h-6 rounded-md bg-teal-500/20 border border-teal-500/30 text-teal-300 font-mono font-bold text-xs flex items-center justify-center">
                      02
                    </span>
                    <div>
                      <span className="text-xs font-bold text-slate-300 uppercase tracking-wider font-mono block">
                        Where can I go?
                      </span>
                      <span className="text-[10px] text-teal-300/80 font-mono font-medium">
                        Market Opportunities & Bands
                      </span>
                    </div>
                  </div>
                  <span className="text-xs font-mono font-bold bg-teal-500/15 text-[#2DD4BF] px-3 py-1 rounded-full border border-teal-500/30">
                    Demand: High
                  </span>
                </div>

                <div className="flex items-baseline justify-between pt-1">
                  <div>
                    <div className="flex items-baseline gap-2">
                      <span className="text-3xl sm:text-4xl font-extrabold text-[#2DD4BF] font-mono">
                        ₹42L – ₹58L
                      </span>
                    </div>
                    <span className="text-xs font-semibold text-slate-300 flex items-center gap-1 mt-1">
                      <Award size={13} className="text-[#F59E0B]" />
                      Base Band for Top 8% Market Tier
                    </span>
                  </div>

                  <span className="text-[11px] font-mono text-teal-300 bg-teal-500/20 px-2 py-1 rounded border border-teal-500/30">
                    14 Matches
                  </span>
                </div>

                <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
                  Real-time compensation benchmarks and role calibrations unlocked specifically by your verified Career Value quotient.
                </p>

                {/* Match Chips */}
                <div className="space-y-2 pt-1 text-xs font-mono">
                  <div className="p-2 rounded-lg bg-black/30 border border-white/5 flex items-center justify-between">
                    <span className="text-slate-200">Staff Platform Architect</span>
                    <span className="text-emerald-400 font-bold">96% Fit</span>
                  </div>
                  <div className="p-2 rounded-lg bg-black/30 border border-white/5 flex items-center justify-between">
                    <span className="text-slate-200">Principal Systems Engineer</span>
                    <span className="text-teal-300 font-bold">92% Fit</span>
                  </div>
                </div>
              </div>

              <div className="mt-5 pt-3 border-t border-white/10 flex items-center justify-between text-xs">
                <span className="text-slate-400 flex items-center gap-1.5">
                  <TrendingUp size={13} className="text-teal-400" />
                  +32% Comp Leverage vs Current
                </span>
                <span className="text-[#FBBF24] font-mono font-bold">Calibrated Daily</span>
              </div>
            </div>
          )}

          {/* ──── QUADRANT 03: What to achieve? (Amber - Pursue) ──── */}
          {(selectedPillar === "all" || selectedPillar === "03") && (
            <div
              onClick={() => setSelectedPillar(selectedPillar === "03" ? "all" : "03")}
              className={`p-6 rounded-2xl bg-[#2B1B06]/60 border transition-all cursor-pointer flex flex-col justify-between group ${
                selectedPillar === "03"
                  ? "border-amber-400 shadow-[0_0_25px_rgba(245,158,11,0.3)] md:col-span-2"
                  : "border-amber-500/30 hover:border-amber-400 hover:bg-[#2B1B06]/80 shadow-lg"
              }`}
            >
              <div className="space-y-4">
                <div className="flex items-center justify-between pb-3 border-b border-white/10">
                  <div className="flex items-center gap-2">
                    <span className="w-6 h-6 rounded-md bg-amber-500/20 border border-amber-500/30 text-amber-300 font-mono font-bold text-xs flex items-center justify-center">
                      03
                    </span>
                    <div>
                      <span className="text-xs font-bold text-slate-300 uppercase tracking-wider font-mono block">
                        What to achieve?
                      </span>
                      <span className="text-[10px] text-amber-300/80 font-mono font-medium">
                        Specific Career Goal
                      </span>
                    </div>
                  </div>
                  <span className="text-xs font-mono font-bold bg-amber-500/15 text-[#FBBF24] px-3 py-1 rounded-full border border-amber-500/30">
                    Day 24 of 45
                  </span>
                </div>

                <div>
                  <h4 className="text-lg font-bold text-white mb-1 flex items-center gap-2">
                    <Target size={16} className="text-[#F59E0B]" />
                    Staff Promotion &amp; Compensation Sprint
                  </h4>
                  <p className="text-xs sm:text-sm text-slate-300 leading-relaxed mt-1">
                    Your active professional objective. UpRole directs every draft, bullet rewrite, and interview story to close the gap toward this goal.
                  </p>
                </div>

                {/* Progress Bar */}
                <div className="space-y-1.5 pt-1">
                  <div className="flex justify-between text-xs font-mono">
                    <span className="text-slate-300">Milestone Gap Closed</span>
                    <span className="text-[#F59E0B] font-bold">82%</span>
                  </div>
                  <div className="w-full h-2.5 rounded-full bg-black/40 border border-white/10 overflow-hidden">
                    <div className="h-full bg-gradient-to-r from-amber-500 to-amber-300 rounded-full w-[82%]" />
                  </div>
                </div>

                {/* Milestones Checklist */}
                <div className="space-y-1.5 pt-1 text-xs font-mono">
                  <div className="flex items-center gap-2 text-emerald-300">
                    <CheckCircle2 size={13} className="shrink-0" />
                    <span>3 Scalability Crisis Stories (STAR)</span>
                  </div>
                  <div className="flex items-center gap-2 text-emerald-300">
                    <CheckCircle2 size={13} className="shrink-0" />
                    <span>Executive Promotion Dossier Ready</span>
                  </div>
                  <div className="flex items-center gap-2 text-amber-300/80">
                    <Clock size={13} className="shrink-0" />
                    <span>Final Comp Benchmark Negotiation Deck</span>
                  </div>
                </div>
              </div>

              <div className="mt-5 pt-3 border-t border-white/10 flex items-center justify-between text-xs">
                <span className="text-slate-400 flex items-center gap-1.5">
                  <Target size={13} className="text-amber-400" />
                  Sprint Deadline: Oct 30
                </span>
                <span className="text-[#60A5FA] font-mono font-bold">On Schedule</span>
              </div>
            </div>
          )}

          {/* ──── QUADRANT 04: What next? (Purple - AI Intelligence) ──── */}
          {(selectedPillar === "all" || selectedPillar === "04") && (
            <div
              onClick={() => setSelectedPillar(selectedPillar === "04" ? "all" : "04")}
              className={`p-6 rounded-2xl bg-[#1C1033]/60 border transition-all cursor-pointer flex flex-col justify-between group ${
                selectedPillar === "04"
                  ? "border-purple-400 shadow-[0_0_25px_rgba(124,58,237,0.3)] md:col-span-2"
                  : "border-purple-500/30 hover:border-purple-400 hover:bg-[#1C1033]/80 shadow-lg"
              }`}
            >
              <div className="space-y-4">
                <div className="flex items-center justify-between pb-3 border-b border-white/10">
                  <div className="flex items-center gap-2">
                    <span className="w-6 h-6 rounded-md bg-purple-500/20 border border-purple-500/30 text-purple-300 font-mono font-bold text-xs flex items-center justify-center">
                      04
                    </span>
                    <div>
                      <span className="text-xs font-bold text-slate-300 uppercase tracking-wider font-mono block">
                        What to do next?
                      </span>
                      <span className="text-[10px] text-purple-300/80 font-mono font-medium">
                        Highest-Leverage Action
                      </span>
                    </div>
                  </div>
                  <span className="text-xs font-mono font-bold bg-purple-500/15 text-[#A855F7] px-3 py-1 rounded-full border border-purple-500/30">
                    Highest ROI
                  </span>
                </div>

                <div>
                  <div className="p-3.5 rounded-xl bg-purple-950/40 border border-purple-500/30 space-y-1.5">
                    <span className="text-[10px] font-mono text-purple-300 uppercase font-bold flex items-center gap-1.5">
                      <Zap size={12} className="text-[#A855F7]" />
                      Today&apos;s Recommended Move
                    </span>
                    <p className="text-xs sm:text-sm font-bold text-white leading-snug">
                      &quot;Align 3 System Scaling bullets to Workday Director JD&quot;
                    </p>
                    <p className="text-[11px] text-slate-300 leading-relaxed font-sans pt-0.5">
                      Target role prioritizes high-concurrency event pipelines. UpRole diagnosed missing Kafka &amp; gRPC latency benchmarks in your active draft.
                    </p>
                  </div>
                </div>

                {/* Simulated Action Trigger */}
                <div className="pt-1">
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      handleExecute();
                    }}
                    disabled={isExecuting || executedSuccess}
                    className={`w-full py-2.5 px-4 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-2 shadow-md ${
                      executedSuccess
                        ? "bg-emerald-500 text-slate-950 font-extrabold"
                        : isExecuting
                        ? "bg-purple-700 text-white cursor-wait"
                        : "bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white hover:scale-[1.02]"
                    }`}
                  >
                    {isExecuting ? (
                      <>
                        <span className="w-3.5 h-3.5 rounded-full border-2 border-white/30 border-t-white animate-spin" />
                        <span>Calibrating Workday ATS Vectors...</span>
                      </>
                    ) : executedSuccess ? (
                      <>
                        <CheckCheck size={14} className="text-slate-950" />
                        <span>3 Bullets Aligned (+14 ATS Points Gained!)</span>
                      </>
                    ) : (
                      <>
                        <Sparkles size={14} />
                        <span>Simulate 1-Click Action ➔</span>
                      </>
                    )}
                  </button>
                </div>
              </div>

              <div className="mt-5 pt-3 border-t border-white/10 flex items-center justify-between text-xs">
                <span className="text-slate-400 flex items-center gap-1.5">
                  <Zap size={13} className="text-purple-400" />
                  Zero Decision Paralysis
                </span>
                <span className="text-emerald-400 font-mono font-bold">+14 ATS Expected</span>
              </div>
            </div>
          )}
        </div>

        {/* Operating System Bottom Bar */}
        <div className="px-6 py-4 bg-white/[0.02] border-t border-white/10 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-slate-400">
          <div className="flex items-center gap-2">
            <ShieldCheck size={15} className="text-[#F59E0B]" />
            <span>
              <strong className="text-white">Principle #9:</strong> The 5-Second Rule. Know your leverage, target, and next move every single session.
            </span>
          </div>
          <span className="font-mono text-[11px] text-slate-500">
            UPROLE DECISION ENGINE v3.2
          </span>
        </div>
      </div>
    </div>
  );
}

/* ═══════════════════════════════════════════════
   ANIMATED CORE LOOP FLOW (Interactive 4-Phase Cycle)
   Section 1, 6 & 7 of Foundation Doc:
   Discover ➔ Develop ➔ Pursue ➔ Achieve ➔ Continuous Loop
   ═══════════════════════════════════════════════ */
function AnimatedCoreLoopFlow() {
  const [activeStep, setActiveStep] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  const [stepProgress, setStepProgress] = useState(0);

  const STEP_DURATION_MS = 3200;
  const TICK_INTERVAL_MS = 40;

  // Auto-cycle through the 4 steps with smooth progress indicator
  useEffect(() => {
    if (isPaused) return;

    const timer = setInterval(() => {
      setStepProgress((prev) => {
        const increment = (TICK_INTERVAL_MS / STEP_DURATION_MS) * 100;
        if (prev + increment >= 100) {
          setActiveStep((curr) => (curr + 1) % 4);
          return 0;
        }
        return prev + increment;
      });
    }, TICK_INTERVAL_MS);

    return () => clearInterval(timer);
  }, [isPaused]);

  const handleStepSelect = (idx: number) => {
    setActiveStep(idx);
    setStepProgress(0);
  };

  const handleNext = () => {
    setActiveStep((prev) => (prev + 1) % 4);
    setStepProgress(0);
  };

  const handlePrev = () => {
    setActiveStep((prev) => (prev - 1 + 4) % 4);
    setStepProgress(0);
  };

  const phases = [
    {
      num: "01",
      title: "Discover",
      subtitle: "Understand your value & possibilities",
      desc: "Uncover achievements you quietly completed. Audit previous roles, quantify overlooked operational wins, and benchmark against current market demand.",
      metric: "Achievement Discovery Engine",
      accent: "#2563EB",
      glowBorder: "border-blue-400 shadow-[0_0_35px_rgba(37,99,235,0.4)]",
      badgeClass: "badge-discover",
      icon: Compass,
      textColor: "text-[#60A5FA]",
      telemetry: "⚡ RAW INGEST: Uncovering +18 Unrecorded Wins",
      streamLabel: "Ingesting Career Milestones",
      nextArrowColor: "from-blue-500 via-teal-400 to-teal-500",
    },
    {
      num: "02",
      title: "Develop",
      subtitle: "Build capability & career readiness",
      desc: "Log wins while they're fresh in your always-free Career Journal. Store milestones, certifications, and praise before you forget them weeks later.",
      metric: "Free Career Journal & Vault",
      accent: "#14B8A6",
      glowBorder: "border-teal-400 shadow-[0_0_35px_rgba(20,184,166,0.4)]",
      badgeClass: "badge-develop",
      icon: BookOpen,
      textColor: "text-[#2DD4BF]",
      telemetry: "🔒 VAULT SYNC: Encrypting Verified Proof",
      streamLabel: "Synthesizing Evidence Vault",
      nextArrowColor: "from-teal-500 via-amber-400 to-amber-500",
    },
    {
      num: "03",
      title: "Pursue",
      subtitle: "Take high-velocity action toward goals",
      desc: "Run targeted Career Sprints. Align your resume to specific ATS systems, generate 1-click tailored bullets, and match job descriptions in seconds.",
      metric: "Named ATS & JD Matcher",
      accent: "#F59E0B",
      glowBorder: "border-amber-400 shadow-[0_0_35px_rgba(245,158,11,0.4)]",
      badgeClass: "badge-pursue",
      icon: Target,
      textColor: "text-[#FBBF24]",
      telemetry: "🎯 ATS VECTOR: 96% Workday / Greenhouse Pass",
      streamLabel: "Aligning ATS Algorithms",
      nextArrowColor: "from-amber-500 via-amber-300 to-amber-500",
    },
    {
      num: "04",
      title: "Achieve",
      subtitle: "Turn progress into tangible career outcomes",
      desc: "Walk into interviews knowing you are good enough. Master STAR responses, negotiate compensation with market data, and build promotion packets.",
      metric: "STAR Prep & Promotion Dossier",
      accent: "#F59E0B",
      glowBorder: "border-amber-400 shadow-[0_0_40px_rgba(245,158,11,0.55)] bg-gradient-to-b from-[#101B3B]/90 to-amber-500/10",
      badgeClass: "bg-amber-500/20 text-[#F59E0B] border border-amber-500/30",
      icon: Award,
      textColor: "text-[#F59E0B]",
      telemetry: "🏆 ELEVATION: +₹18.5L Comp Lift Secured",
      streamLabel: "Generating New Career Evidence",
      nextArrowColor: "from-amber-500 via-blue-400 to-blue-500",
    },
  ];

  const currentPhase = phases[activeStep];
  const nextPhase = phases[(activeStep + 1) % 4];

  return (
    <div
      className="space-y-8 relative"
      onMouseEnter={() => setIsPaused(true)}
      onMouseLeave={() => setIsPaused(false)}
    >
      {/* ──── TOP TIMELINE NAVIGATION & PLAYBACK CONTROLS ──── */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4 p-3.5 rounded-2xl bg-white/[0.03] border border-white/10 backdrop-blur-md">
        {/* Phase Selectors with Arrow Dividers */}
        <div className="flex flex-wrap items-center justify-center gap-1.5 sm:gap-2">
          {phases.map((p, idx) => {
            const isSelected = activeStep === idx;
            return (
              <div key={idx} className="flex items-center gap-1.5 sm:gap-2">
                <button
                  onClick={() => handleStepSelect(idx)}
                  className={`px-3 py-1.5 rounded-xl text-xs font-mono font-bold transition-all flex items-center gap-1.5 relative overflow-hidden ${
                    isSelected
                      ? "text-white shadow-lg scale-105"
                      : "text-slate-400 hover:text-slate-200 hover:bg-white/5"
                  }`}
                  style={{
                    backgroundColor: isSelected ? `${p.accent}25` : undefined,
                    border: isSelected ? `1px solid ${p.accent}` : "1px solid rgba(255,255,255,0.06)",
                  }}
                >
                  <span
                    className="w-1.5 h-1.5 rounded-full shrink-0"
                    style={{
                      backgroundColor: p.accent,
                      boxShadow: isSelected ? `0 0 8px ${p.accent}` : "none",
                    }}
                  />
                  <span>{p.num} {p.title}</span>

                  {/* Micro Progress Bar on Active Pill */}
                  {isSelected && (
                    <div
                      className="absolute bottom-0 left-0 h-[2px] transition-all duration-75"
                      style={{
                        width: `${stepProgress}%`,
                        backgroundColor: p.accent,
                        boxShadow: `0 0 6px ${p.accent}`,
                      }}
                    />
                  )}
                </button>

                {/* Arrow Divider between pills */}
                {idx < 3 && (
                  <ChevronRight
                    size={13}
                    className={`transition-colors ${
                      activeStep > idx ? "text-amber-400" : "text-slate-600"
                    }`}
                  />
                )}
              </div>
            );
          })}
        </div>

        {/* Right Playback Controls & Status */}
        <div className="flex items-center gap-2">
          {/* Pause / Play Toggle */}
          <button
            onClick={() => setIsPaused(!isPaused)}
            className="p-1.5 px-2.5 rounded-lg bg-white/5 hover:bg-white/10 border border-white/10 text-xs font-mono text-slate-300 flex items-center gap-1.5 transition-colors"
            title={isPaused ? "Resume auto-flow" : "Pause on current phase"}
          >
            {isPaused ? (
              <>
                <Play size={12} className="text-emerald-400 fill-emerald-400" />
                <span className="text-[11px]">Resume Flow</span>
              </>
            ) : (
              <>
                <Pause size={12} className="text-amber-400 fill-amber-400" />
                <span className="text-[11px]">Pause</span>
              </>
            )}
          </button>

          {/* Prev / Next Quick Step Buttons */}
          <div className="flex items-center gap-1">
            <button
              onClick={handlePrev}
              className="p-1.5 rounded-lg bg-white/5 hover:bg-white/10 border border-white/10 text-slate-400 hover:text-white transition-colors"
              title="Previous Phase"
            >
              <ChevronLeft size={13} />
            </button>
            <button
              onClick={handleNext}
              className="p-1.5 rounded-lg bg-white/5 hover:bg-white/10 border border-white/10 text-slate-400 hover:text-white transition-colors"
              title="Next Phase"
            >
              <ChevronRight size={13} />
            </button>
          </div>

          {/* Real-time Telemetry Pill */}
          <div className="hidden xl:flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-black/40 border border-white/10 text-[10px] font-mono text-slate-400">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
            <span className="text-slate-300">FLOW: {currentPhase.streamLabel}</span>
          </div>
        </div>
      </div>

      {/* ──── THE 4 CARDS + ANIMATED SEQUENTIAL ARROWS ──── */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 relative items-stretch">
        {phases.map((phase, idx) => {
          const Icon = phase.icon;
          const isActive = activeStep === idx;
          const isTransitionActive = activeStep === idx;

          return (
            <div key={idx} className="relative flex flex-col">
              {/* The Card */}
              <div
                onClick={() => handleStepSelect(idx)}
                className={`p-7 rounded-2xl card-obsidian border-2 transition-all duration-500 flex flex-col justify-between cursor-pointer h-full relative overflow-hidden group ${
                  isActive
                    ? `${phase.glowBorder} scale-[1.025] -translate-y-1 bg-[#0E1730]`
                    : "border-white/10 hover:border-white/25 hover:bg-white/[0.04]"
                }`}
              >
                {/* Active Ambient Radial Beacon */}
                {isActive && (
                  <div
                    className="absolute -top-10 -right-10 w-36 h-36 rounded-full opacity-35 pointer-events-none blur-2xl"
                    style={{ backgroundColor: phase.accent }}
                  />
                )}

                <div className="space-y-4 relative z-10">
                  {/* Top Badge & Icon */}
                  <div className="flex items-center justify-between">
                    <span
                      className={`text-[11px] font-bold px-3 py-1 rounded-full uppercase tracking-wider ${phase.badgeClass}`}
                    >
                      Phase {phase.num}
                    </span>
                    <div
                      className={`w-10 h-10 rounded-xl flex items-center justify-center transition-all duration-300 ${
                        isActive
                          ? "bg-white/10 shadow-lg scale-110"
                          : "bg-white/5 text-slate-400 group-hover:scale-105"
                      }`}
                      style={{ color: isActive ? phase.accent : undefined }}
                    >
                      <Icon size={20} />
                    </div>
                  </div>

                  {/* Header Titles */}
                  <div>
                    <h3 className="text-xl font-bold text-white mb-1 tracking-tight">
                      {phase.title}
                    </h3>
                    <p className={`text-xs font-semibold ${phase.textColor} mb-2.5`}>
                      {phase.subtitle}
                    </p>
                    <p className="text-xs sm:text-sm text-slate-300 leading-relaxed font-normal">
                      {phase.desc}
                    </p>
                  </div>

                  {/* High-Tech Ingest Telemetry Pill */}
                  <div className="pt-1">
                    <div
                      className={`p-2.5 rounded-xl border text-[11px] font-mono transition-all duration-300 flex items-center gap-1.5 ${
                        isActive
                          ? "bg-black/50 border-white/20 text-white shadow-inner"
                          : "bg-black/20 border-white/5 text-slate-400"
                      }`}
                    >
                      <span className="w-1.5 h-1.5 rounded-full shrink-0 animate-ping" style={{ backgroundColor: phase.accent }} />
                      <span className="truncate">{phase.telemetry}</span>
                    </div>
                  </div>
                </div>

                {/* Bottom Card Footer with Metric & Advance Arrow */}
                <div className="mt-6 pt-4 border-t border-white/10 flex items-center justify-between text-xs font-semibold relative z-10">
                  <span className={phase.textColor}>{phase.metric}</span>
                  <ArrowRight
                    size={15}
                    className={`transition-transform duration-300 ${
                      isActive ? "translate-x-1.5" : "group-hover:translate-x-1 text-slate-400"
                    }`}
                    style={{ color: isActive ? phase.accent : undefined }}
                  />
                </div>

                {/* Micro Linear Progress Line at the very bottom of the card */}
                {isActive && (
                  <div className="absolute bottom-0 left-0 right-0 h-1 bg-white/5 overflow-hidden">
                    <div
                      className="h-full transition-all duration-75"
                      style={{
                        width: `${stepProgress}%`,
                        backgroundColor: phase.accent,
                        boxShadow: `0 0 10px ${phase.accent}`,
                      }}
                    />
                  </div>
                )}
              </div>

              {/* ──── DESKTOP CONNECTING ARROW PIPELINE (Between Cards 1➔2, 2➔3, 3➔4) ──── */}
              {idx < 3 && (
                <div className="hidden lg:flex absolute -right-5 top-1/2 -translate-y-1/2 z-30 items-center justify-center pointer-events-none">
                  {/* Glowing Arrow Conduit Badge */}
                  <div
                    className={`relative w-9 h-9 rounded-full flex items-center justify-center border transition-all duration-500 shadow-xl backdrop-blur-md ${
                      isTransitionActive
                        ? "bg-[#101B3B] border-amber-400 text-amber-300 scale-125 shadow-[0_0_24px_rgba(245,158,11,0.65)] ring-2 ring-amber-400/40"
                        : "bg-[#070C18] border-white/15 text-slate-500"
                    }`}
                  >
                    {/* Directional Flow Chevrons Behind / Next to Arrow */}
                    {isTransitionActive && (
                      <div className="absolute -left-3 flex gap-0.5 text-[10px] text-amber-400/80 animate-chevron-wave pointer-events-none">
                        <span>›</span>
                        <span>›</span>
                      </div>
                    )}

                    {/* Animated Arrow Motion */}
                    <motion.div
                      animate={
                        isTransitionActive
                          ? { x: [0, 4, 0] }
                          : { x: 0 }
                      }
                      transition={{ repeat: Infinity, duration: 0.9, ease: "easeInOut" }}
                    >
                      <ArrowRight size={15} />
                    </motion.div>

                    {/* Glowing Pulse Rings when Active */}
                    {isTransitionActive && (
                      <div className="absolute inset-0 rounded-full border border-amber-400 animate-ping opacity-30 pointer-events-none" />
                    )}
                  </div>
                </div>
              )}

              {/* ──── MOBILE / TABLET VERTICAL ARROW CONNECTOR ──── */}
              {idx < 3 && (
                <div className="lg:hidden flex flex-col items-center justify-center py-2 relative">
                  {/* Vertical Light Stream Rail */}
                  <div className="w-[2px] h-6 bg-gradient-to-b from-white/10 via-amber-400/40 to-white/10 relative overflow-hidden">
                    {isTransitionActive && (
                      <div className="w-full h-full bg-amber-400 animate-flow-down" />
                    )}
                  </div>

                  <div
                    className={`w-8 h-8 rounded-full flex items-center justify-center border transition-all duration-300 shadow-md ${
                      isTransitionActive
                        ? "border-amber-400 text-amber-300 bg-[#101B3B] scale-110 shadow-[0_0_16px_rgba(245,158,11,0.5)]"
                        : "border-white/15 bg-white/5 text-slate-400"
                    }`}
                  >
                    <ChevronDown size={16} className={isTransitionActive ? "animate-bounce" : ""} />
                  </div>

                  <div className="w-[2px] h-2 bg-white/10" />
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* ──── THE CONTINUOUS CAREER FLYWHEEL LOOPBACK (Phase 04 ➔ Phase 01) ──── */}
      <div className="pt-2">
        <div className="p-5 sm:p-6 rounded-2xl card-obsidian border-2 border-white/15 bg-gradient-to-r from-blue-950/40 via-teal-950/30 to-amber-950/40 flex flex-col lg:flex-row items-center justify-between gap-5 shadow-2xl relative overflow-hidden">
          {/* Continuous Traveling Photon Light Beam (Right to Left) */}
          <div className="absolute inset-x-0 bottom-0 h-[2px] bg-gradient-to-r from-blue-500 via-teal-400 to-amber-400 opacity-60">
            <div className="h-full w-48 bg-white animate-flow-left blur-[1px]" />
          </div>

          {/* Left Title & Manifesto */}
          <div className="flex items-center gap-4 relative z-10 w-full lg:w-auto">
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-amber-500 via-teal-400 to-blue-500 text-slate-950 flex items-center justify-center font-bold shrink-0 shadow-lg">
              <Workflow size={24} className="animate-spin" style={{ animationDuration: "14s" }} />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xs font-mono font-bold uppercase tracking-wider text-amber-300 flex items-center gap-1.5">
                  <RotateCcw size={12} />
                  The Continuous Career Flywheel · Compounding Loop
                </span>
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse shadow-[0_0_8px_rgba(52,211,153,0.8)]" />
              </div>
              <p className="text-xs sm:text-sm text-slate-200 mt-1 font-medium leading-relaxed">
                Phase 04 (Achieve: Promotions & Offers) produces <strong className="text-white">New Career Evidence</strong> ➔ continually feeds back into <strong className="text-blue-300">Phase 01 (Discover)</strong> to compound your market leverage indefinitely.
              </p>
            </div>
          </div>

          {/* Right Live Stream Status & Step Advance */}
          <div className="flex flex-wrap items-center justify-end gap-3 relative z-10 shrink-0 w-full lg:w-auto">
            {/* Real-time Step Telemetry */}
            <div className="flex items-center gap-2 text-xs font-mono font-bold text-slate-300 bg-black/50 px-4 py-2.5 rounded-xl border border-white/10 shadow-inner">
              <span className="text-amber-400">Step {activeStep + 1} of 4 Active</span>
              <span className="text-slate-600">•</span>
              <span className="text-[#2DD4BF] flex items-center gap-1.5">
                <span>Phase {currentPhase.num} ➔ Phase {nextPhase.num}</span>
                <ArrowRight size={13} className="text-amber-400 animate-pulse" />
              </span>
            </div>

            {/* Quick Trigger Button */}
            <button
              onClick={handleNext}
              className="px-4 py-2.5 rounded-xl bg-white/10 hover:bg-white/15 border border-white/20 text-white font-bold text-xs transition-all flex items-center gap-1.5 shadow-sm active:scale-95 hover:border-amber-400/50"
            >
              <span>Next Phase ({nextPhase.title})</span>
              <ArrowRight size={13} className="text-amber-400" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

/* ═══════════════════════════════════════════════
   MAIN PAGE COMPONENT
   ═══════════════════════════════════════════════ */
export default function Home() {
  const { user, loading: authLoading } = useAuth();
  const router = useRouter();

  const [dbStats, setDbStats] = useState({
    totalResumes: 1850,
    aiRunsCount: 4200,
    averageATS: 88,
  });
  const [isQuickScanOpen, setIsQuickScanOpen] = useState(false);
  const coreLoopRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!authLoading && user) {
      router.push("/dashboard");
    }
  }, [user, authLoading, router]);

  useEffect(() => {
    fetch("/api/public-stats")
      .then((res) => res.json())
      .then((data) => {
        if (data.success && data.stats) {
          setDbStats(data.stats);
        }
      })
      .catch((err) => console.error("Failed to load public stats:", err));
  }, []);

  return (
    <main
      className="relative min-h-screen bg-[#070C18] text-white selection:bg-[#F59E0B] selection:text-slate-950 bg-grid-tech"
      style={{
        overflowX: "hidden",
      }}
    >
      <ScrollProgress />

      <div className="relative z-10">
        <Navbar />

        {/* ═══════════════════════════════════════
            SECTION 1: HERO (Atmospheric Mountain Summit + Pure Modern UI)
            ═══════════════════════════════════════ */}
        <section className="relative min-h-[calc(100vh-68px)] flex flex-col justify-between overflow-hidden bg-[#070C18] pt-4 sm:pt-6 pb-6">
          {/* Cinematic Summit Hero Photography Backdrop */}
          <div className="absolute inset-0 z-0 overflow-hidden pointer-events-none">
            <Image
              src="/uprole_hero_summit.jpg"
              alt="UpRole — More than a resume. A brighter career ahead."
              fill
              priority
              unoptimized
              className="object-cover object-[72%_center] sm:object-center"
            />
            {/* Atmospheric shading to ensure pristine contrast on text while preserving the golden dawn on the right */}
            <div className="absolute inset-0 bg-gradient-to-r from-[#070C18]/90 via-[#070C18]/40 to-transparent sm:w-[55%]" />
            <div className="absolute inset-0 bg-gradient-to-t from-[#070C18] via-transparent to-[#070C18]/20" />
            <div className="absolute top-0 left-0 right-0 h-24 bg-gradient-to-b from-[#070C18]/60 to-transparent" />
          </div>

          {/* Master Hero Content */}
          <div className="relative z-10 max-w-7xl mx-auto px-6 sm:px-10 lg:px-12 w-full flex-1 flex flex-col justify-center my-auto py-8 sm:py-12">
            <div className="relative w-full">
              {/* Left Column Content */}
              <div className="max-w-2xl space-y-6 sm:space-y-7 text-left">
                {/* Category Pill / Subtitle */}
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5 }}
                >
                  <span className="text-[11px] sm:text-[12.5px] font-semibold tracking-[0.22em] uppercase text-slate-300 font-mono">
                    AI-POWERED CAREER ADVANCEMENT PLATFORM
                  </span>
                </motion.div>

                {/* Main Headline */}
                <motion.div
                  initial={{ opacity: 0, y: 16 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.6, delay: 0.1 }}
                >
                  <h1 className="text-4xl sm:text-5xl md:text-6xl lg:text-[66px] font-normal leading-[1.12] text-white font-['Playfair_Display',serif] tracking-tight drop-shadow-[0_4px_24px_rgba(0,0,0,0.8)]">
                    More than a resume.
                    <br />
                    A brighter career ahead.
                  </h1>
                </motion.div>

                {/* Subheadline */}
                <motion.div
                  initial={{ opacity: 0, y: 16 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.6, delay: 0.2 }}
                >
                  <p className="text-base sm:text-lg lg:text-[19px] text-slate-200/90 font-normal leading-relaxed max-w-xl">
                    Understand your value. Build your potential.
                    <br className="hidden sm:inline" />
                    Turn it into real opportunities.
                  </p>
                </motion.div>

                {/* CTA Action Button */}
                <motion.div
                  initial={{ opacity: 0, y: 16 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.6, delay: 0.3 }}
                  className="pt-2"
                >
                  <Link href="/resume/upload" className="inline-block no-underline">
                    <button className="inline-flex items-center gap-3 px-8 sm:px-9 py-4 rounded-full bg-gradient-to-r from-[#F59E0B] via-[#F97316] to-[#EA580C] text-white font-semibold text-[15px] sm:text-[16px] shadow-[0_8px_24px_rgba(245,158,11,0.4)] hover:shadow-[0_12px_32px_rgba(245,158,11,0.55)] hover:brightness-105 hover:scale-[1.02] active:scale-[0.98] transition-all group cursor-pointer">
                      <span>Get Your Free Career Analysis</span>
                      <ArrowRight size={18} className="transition-transform group-hover:translate-x-1" />
                    </button>
                  </Link>
                </motion.div>
              </div>

              {/* Right Callout: "A brighter you" script accent above the clouds */}
              <div className="hidden lg:block absolute right-[18%] xl:right-[23%] 2xl:right-[26%] top-[10px] xl:top-[25px] select-none pointer-events-none">
                <div className="flex flex-col items-center -rotate-6">
                  <span className="font-['Caveat',cursive] text-4xl xl:text-5xl text-[#FCD34D] tracking-wide drop-shadow-[0_2px_12px_rgba(0,0,0,0.8)] leading-tight">
                    A brighter
                  </span>
                  <span className="font-['Caveat',cursive] text-5xl xl:text-6xl text-[#FCD34D] font-bold tracking-wide drop-shadow-[0_2px_12px_rgba(0,0,0,0.8)] leading-none -mt-1">
                    you
                  </span>
                  {/* Whimsical curved underline */}
                  <svg className="w-20 h-4 text-[#FCD34D] mt-1 drop-shadow" viewBox="0 0 80 14" fill="none">
                    <path d="M4 8C24 14 56 13 76 4" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"/>
                  </svg>
                </div>
              </div>
            </div>
          </div>

          {/* Bottom Dock: The 4 Pillars matching screenshot */}
          <div id="pillars" className="relative z-10 w-full px-6 sm:px-10 lg:px-12 pt-4 pb-2">
            <div className="max-w-7xl mx-auto grid grid-cols-2 md:grid-cols-4 gap-6 sm:gap-8">
              {/* Discover */}
              <a href="#core-loop" className="flex items-center gap-3.5 group no-underline text-left">
                <div className="w-12 h-12 rounded-full border border-white/20 bg-black/25 backdrop-blur-md flex items-center justify-center text-amber-400 group-hover:border-amber-400 group-hover:bg-amber-400/10 group-hover:scale-105 transition-all shadow-sm shrink-0">
                  <Compass size={21} />
                </div>
                <div>
                  <div className="text-[15px] font-bold text-white group-hover:text-amber-300 transition-colors">
                    Discover
                  </div>
                  <div className="text-[13px] text-slate-300/80 font-normal">
                    Your value
                  </div>
                </div>
              </a>

              {/* Develop */}
              <a href="#core-loop" className="flex items-center gap-3.5 group no-underline text-left">
                <div className="w-12 h-12 rounded-full border border-white/20 bg-black/25 backdrop-blur-md flex items-center justify-center text-teal-400 group-hover:border-teal-400 group-hover:bg-teal-400/10 group-hover:scale-105 transition-all shadow-sm shrink-0">
                  <BarChart2 size={21} />
                </div>
                <div>
                  <div className="text-[15px] font-bold text-white group-hover:text-teal-300 transition-colors">
                    Develop
                  </div>
                  <div className="text-[13px] text-slate-300/80 font-normal">
                    Your potential
                  </div>
                </div>
              </a>

              {/* Pursue */}
              <a href="#core-loop" className="flex items-center gap-3.5 group no-underline text-left">
                <div className="w-12 h-12 rounded-full border border-white/20 bg-black/25 backdrop-blur-md flex items-center justify-center text-amber-400 group-hover:border-amber-400 group-hover:bg-amber-400/10 group-hover:scale-105 transition-all shadow-sm shrink-0">
                  <Send size={19} className="-rotate-12 translate-y-[-1px] translate-x-[1px]" />
                </div>
                <div>
                  <div className="text-[15px] font-bold text-white group-hover:text-amber-300 transition-colors">
                    Pursue
                  </div>
                  <div className="text-[13px] text-slate-300/80 font-normal">
                    Your goals
                  </div>
                </div>
              </a>

              {/* Achieve */}
              <a href="#core-loop" className="flex items-center gap-3.5 group no-underline text-left">
                <div className="w-12 h-12 rounded-full border border-white/20 bg-black/25 backdrop-blur-md flex items-center justify-center text-amber-400 group-hover:border-amber-400 group-hover:bg-amber-400/10 group-hover:scale-105 transition-all shadow-sm shrink-0">
                  <Star size={21} />
                </div>
                <div>
                  <div className="text-[15px] font-bold text-white group-hover:text-amber-300 transition-colors">
                    Achieve
                  </div>
                  <div className="text-[13px] text-slate-300/80 font-normal">
                    What&apos;s next
                  </div>
                </div>
              </a>
            </div>
          </div>
        </section>

        {/* ═══════════════════════════════════════
            SECTION: INTERACTIVE PLATFORM INTELLIGENCE (HeroCommandCenter)
            ═══════════════════════════════════════ */}
        <section id="products" className="relative py-20 bg-[#070C18] border-t border-white/10">
          <div className="max-w-7xl mx-auto px-6 sm:px-8 space-y-10">
            <div className="text-center max-w-3xl mx-auto space-y-4">
              <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-amber-500/10 border border-amber-500/30 text-amber-300 text-xs font-mono font-bold tracking-widest uppercase">
                <Sparkles size={13} className="text-[#F59E0B]" />
                <span>Career Evidence Engine In Action</span>
              </div>
              <h2 className="text-3xl sm:text-4xl font-extrabold font-['Syne',sans-serif] text-white">
                From Raw Unrecorded Work to High-Leverage Proof
              </h2>
              <p className="text-slate-300 text-sm sm:text-base leading-relaxed">
                Experience how UpRole continuously extracts, verifies, and transforms your day-to-day work into ATS-optimized resumes, executive interview STAR stories, and appraisal business cases.
              </p>
            </div>

            <HeroCommandCenter />

            {/* Trust Signals & Quick Scan Trigger */}
            <div className="flex flex-wrap items-center justify-center gap-y-3 gap-x-8 text-xs sm:text-sm text-slate-300 font-medium pt-2">
              <span className="flex items-center gap-2 text-emerald-400">
                <ShieldCheck size={16} /> Free Forever Career Journal
              </span>
              <span className="flex items-center gap-2 text-slate-300">
                <Check size={16} className="text-[#F59E0B]" /> Zero Credit Card Required
              </span>
              <span className="flex items-center gap-2 text-slate-300">
                <Sparkles size={16} className="text-blue-400" /> 100 Welcome Credits Included
              </span>
              <button
                onClick={() => setIsQuickScanOpen(true)}
                className="inline-flex items-center gap-2 text-[#F59E0B] hover:text-amber-300 font-bold underline underline-offset-4 cursor-pointer"
              >
                <Zap size={15} /> Try 30s Quick Scan
              </button>
            </div>
          </div>
        </section>

        {/* ═══════════════════════════════════════
            SECTION 2: STRATEGIC PLATFORM PROMISE
            Section 1 & 2 of Foundation Doc
            ═══════════════════════════════════════ */}
        <section id="about" className="py-24 border-t border-white/10 bg-gradient-to-b from-[#070C18] via-[#0D152A] to-[#070C18]">
          <div className="max-w-7xl mx-auto px-6">
            {/* Header */}
            <div className="text-center max-w-4xl mx-auto space-y-5 mb-16">
              <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-amber-500/10 border border-amber-500/30 text-amber-300 text-xs font-mono font-bold tracking-widest uppercase shadow-sm">
                <Sparkles size={13} className="text-[#F59E0B]" />
                <span>A CATEGORY OF ITS OWN · PLATFORM PROMISE</span>
              </div>

              <h2 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-normal leading-[1.18] text-white font-['Playfair_Display',serif] tracking-tight">
                UpRole is not a resume builder.
                <span className="block mt-2 font-normal italic text-transparent bg-clip-text bg-gradient-to-r from-amber-300 via-amber-200 to-teal-200">
                  It is your Career Advancement Platform.
                </span>
              </h2>

              <p className="text-base sm:text-lg text-slate-300 leading-relaxed max-w-2xl mx-auto font-normal">
                Resume builders treat career progression as a static document to format. UpRole treats it as an ongoing operating system of verified evidence, capability, and market positioning.
              </p>
            </div>

            {/* Side-by-side Comparative Contrast */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-16">
              {/* Old Way */}
              <div className="p-8 rounded-2xl bg-gradient-to-br from-rose-950/20 to-[#0B1020] border border-rose-500/25 shadow-xl space-y-5">
                <div className="flex items-center justify-between pb-4 border-b border-white/10">
                  <div className="flex items-center gap-2">
                    <span className="w-6 h-6 rounded-md bg-rose-500/20 border border-rose-500/30 text-rose-300 font-mono font-bold text-xs flex items-center justify-center">
                      ✕
                    </span>
                    <span className="text-xs font-mono font-bold uppercase tracking-wider text-rose-300">
                      The Resume Builder Trap
                    </span>
                  </div>
                  <span className="text-[11px] font-mono font-semibold text-rose-400/80 bg-rose-500/10 px-2.5 py-0.5 rounded border border-rose-500/20">
                    Static Transaction
                  </span>
                </div>

                <ul className="space-y-3.5 text-xs sm:text-sm text-slate-300 leading-relaxed">
                  <li className="flex items-start gap-3">
                    <span className="text-rose-400 font-bold mt-1 text-sm">✕</span>
                    <span><strong className="text-white">Static 1-Page PDF:</strong> Scrambling to reconstruct 3 years of work in a panic only when desperately job hunting.</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <span className="text-rose-400 font-bold mt-1 text-sm">✕</span>
                    <span><strong className="text-white">Unrecorded Impact:</strong> Crucial projects, system architecture overhauls, and cost savings permanently forgotten.</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <span className="text-rose-400 font-bold mt-1 text-sm">✕</span>
                    <span><strong className="text-white">Keyword Stuffing Anxiety:</strong> Blindly pasting random jargon hoping HR parsers won&apos;t silently reject you in 6 seconds.</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <span className="text-rose-400 font-bold mt-1 text-sm">✕</span>
                    <span><strong className="text-white">Imposter Syndrome:</strong> Entering executive rounds unsure of your actual market value or leverage.</span>
                  </li>
                </ul>
              </div>

              {/* UpRole Way */}
              <div className="p-8 rounded-2xl card-obsidian border-2 border-emerald-500/40 shadow-2xl space-y-5 relative overflow-hidden bg-gradient-to-br from-[#0A2024]/60 to-[#070C18]">
                <div className="absolute top-0 right-0 w-48 h-48 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />
                <div className="flex items-center justify-between pb-4 border-b border-white/10 relative z-10">
                  <div className="flex items-center gap-2">
                    <span className="w-6 h-6 rounded-md bg-emerald-500/20 border border-emerald-500/30 text-emerald-300 font-mono font-bold text-xs flex items-center justify-center">
                      ✓
                    </span>
                    <span className="text-xs font-mono font-bold uppercase tracking-wider text-emerald-400">
                      The UpRole Continuous System
                    </span>
                  </div>
                  <span className="text-[11px] font-mono font-bold text-[#FBBF24] bg-amber-500/15 px-2.5 py-0.5 rounded border border-amber-500/30">
                    Permanent Career Advantage
                  </span>
                </div>

                <ul className="space-y-3.5 text-xs sm:text-sm text-slate-200 leading-relaxed relative z-10">
                  <li className="flex items-start gap-3">
                    <span className="text-emerald-400 font-bold mt-1 text-sm">✓</span>
                    <span><strong className="text-white">Persistent Career Vault:</strong> Archive milestones, performance praise, and metrics as they happen in your free journal.</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <span className="text-emerald-400 font-bold mt-1 text-sm">✓</span>
                    <span><strong className="text-white">Multi-Output Sync:</strong> 1 verified achievement automatically recalibrates your Resume, LinkedIn, STAR pitch, and appraisal dossier.</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <span className="text-emerald-400 font-bold mt-1 text-sm">✓</span>
                    <span><strong className="text-white">Named ATS Precision:</strong> Tested algorithms calibrated for Workday, Greenhouse, Taleo, and Lever scoring engines.</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <span className="text-emerald-400 font-bold mt-1 text-sm">✓</span>
                    <span><strong className="text-white">Evidence-Backed Confidence:</strong> Never wonder if you&apos;re good enough — walk into any room backed by ₹14M+ verified business impact.</span>
                  </li>
                </ul>
              </div>
            </div>

            {/* Canonical Vocabulary Matrix */}
            <div className="space-y-5">
              <div className="text-center">
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/[0.04] border border-white/10 text-xs font-mono uppercase tracking-widest text-slate-400">
                  <Layers size={13} className="text-[#2563EB]" />
                  <span>The Canonical UpRole Vocabulary · Section 2 Brand Foundation</span>
                </div>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3.5">
                {[
                  { term: "Impact", q: "What changed?", desc: "Tangible business outcomes created through your work.", color: "text-[#60A5FA] border-blue-500/30 bg-blue-500/5 hover:border-blue-400" },
                  { term: "Evidence", q: "How do we know?", desc: "Facts, metrics, recognition, and verifiable proof.", color: "text-[#2DD4BF] border-teal-500/30 bg-teal-500/5 hover:border-teal-400" },
                  { term: "Capability", q: "What can I do?", desc: "Skills, expertise, and proven competencies.", color: "text-[#FBBF24] border-amber-500/30 bg-amber-500/5 hover:border-amber-400" },
                  { term: "Career Value", q: "What do I bring?", desc: "Combined experience + impact + progression + evidence.", color: "text-[#A855F7] border-purple-500/30 bg-purple-500/5 hover:border-purple-400" },
                  { term: "Market Value", q: "What will market pay?", desc: "External demand & compensation associated with value.", color: "text-[#F59E0B] border-amber-500/30 bg-amber-500/5 hover:border-amber-400" },
                ].map((item, idx) => (
                  <div key={idx} className={`p-4 rounded-xl border ${item.color} flex flex-col justify-between hover:scale-[1.02] transition-all shadow-md`}>
                    <div>
                      <div className="flex items-center justify-between mb-1">
                        <span className="font-bold text-sm text-white">{item.term}</span>
                      </div>
                      <span className="text-[10px] font-mono font-bold uppercase tracking-wider opacity-80 block mb-2">{item.q}</span>
                      <p className="text-xs text-slate-300 leading-relaxed">{item.desc}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* ═══════════════════════════════════════
            SECTION 3: LIVE BULLET TRANSFORMER (Interactive Before/After)
            ═══════════════════════════════════════ */}
        <section className="py-24 border-t border-white/10 bg-[#070C18]">
          <div className="max-w-6xl mx-auto px-6">
            <InteractiveBulletTransformer />
          </div>
        </section>

        {/* ═══════════════════════════════════════
            SECTION 4: PSYCHOLOGICAL FOUNDATION
            Section 3 & 4 of Foundation Doc:
            "Do not manufacture confidence. Uncover evidence that creates confidence."
            ═══════════════════════════════════════ */}
        <section id="psychology" className="py-28 border-t border-white/10 bg-gradient-to-b from-[#080E20] via-[#0D152A] to-[#070C18] relative overflow-hidden">
          {/* Subtle Ambient Halo */}
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[350px] bg-teal-500/[0.07] rounded-full blur-[160px] pointer-events-none" />

          <div className="max-w-6xl mx-auto px-6 space-y-16 relative z-10">
            {/* Philosophical Manifesto Header */}
            <div className="text-center space-y-5 max-w-4xl mx-auto">
              <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-teal-500/10 border border-teal-500/25 text-teal-300 text-xs font-mono font-bold tracking-widest uppercase">
                <Sparkles size={13} className="text-teal-400" />
                <span>The Psychological Foundation</span>
              </div>

              <h2 className="text-3xl sm:text-4xl md:text-5xl font-normal leading-[1.25] text-white font-['Playfair_Display',serif] tracking-tight">
                &ldquo;Do not manufacture confidence.
                <br />
                <span className="italic font-normal text-transparent bg-clip-text bg-gradient-to-r from-amber-200 via-teal-200 to-blue-300">
                  Uncover evidence that creates confidence.&rdquo;
                </span>
              </h2>

              <p className="text-base sm:text-lg text-slate-300 leading-relaxed max-w-2xl mx-auto font-normal">
                Most professionals don&apos;t stall in their careers because they lack ability — they stall because of <strong className="text-white font-semibold">unrecorded work</strong>. When your accomplishments are backed by verifiable proof, imposter syndrome permanently dissolves.
              </p>
            </div>

            {/* The Emotional Shift: Before vs. After */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-5xl mx-auto">
              {/* State 1: The Uncertainty State */}
              <div className="p-7 sm:p-8 rounded-2xl bg-white/[0.02] border border-rose-500/25 space-y-4 shadow-lg">
                <div className="flex items-center justify-between pb-3 border-b border-white/10">
                  <span className="text-xs font-mono font-bold uppercase tracking-wider text-rose-400 flex items-center gap-1.5">
                    ✕ The Uncertainty Trap (Without Evidence)
                  </span>
                  <span className="text-[11px] text-slate-400 font-mono">Imposter Syndrome</span>
                </div>

                <div className="space-y-3 text-sm text-slate-300 leading-relaxed">
                  <p className="italic text-slate-200 font-['Playfair_Display',serif] text-base">
                    &ldquo;I worked hard all year, but I can&apos;t remember the exact numbers. In interviews, I feel like I&apos;m bluffing.&rdquo;
                  </p>
                  <ul className="space-y-2 text-xs text-slate-400 pt-1">
                    <li className="flex items-center gap-2">
                      <span className="text-rose-400 font-bold">•</span>
                      <span>80% of daily technical and operational wins get overlooked</span>
                    </li>
                    <li className="flex items-center gap-2">
                      <span className="text-rose-400 font-bold">•</span>
                      <span>Struggling to articulate value during annual salary negotiations</span>
                    </li>
                    <li className="flex items-center gap-2">
                      <span className="text-rose-400 font-bold">•</span>
                      <span>Career progression feels like stressful, reactive guesswork</span>
                    </li>
                  </ul>
                </div>
              </div>

              {/* State 2: The Professional Agency State */}
              <div className="p-7 sm:p-8 rounded-2xl card-obsidian border-2 border-emerald-500/35 space-y-4 shadow-2xl relative overflow-hidden">
                <div className="absolute top-0 right-0 w-32 h-32 bg-emerald-500/10 rounded-full blur-2xl pointer-events-none" />
                <div className="flex items-center justify-between pb-3 border-b border-white/10">
                  <span className="text-xs font-mono font-bold uppercase tracking-wider text-emerald-400 flex items-center gap-1.5">
                    ✓ The UpRole Agency State (Evidence-Backed)
                  </span>
                  <span className="text-[11px] text-amber-300 font-bold font-mono">Leverage Locked</span>
                </div>

                <div className="space-y-3 text-sm text-slate-200 leading-relaxed">
                  <p className="italic text-amber-100 font-['Playfair_Display',serif] text-base">
                    &ldquo;I know exactly what I bring to the table. Every bullet has a dollar or percentage figure, and I walk into interviews with leverage.&rdquo;
                  </p>
                  <ul className="space-y-2 text-xs text-slate-300 pt-1">
                    <li className="flex items-center gap-2">
                      <Check size={14} className="text-emerald-400 shrink-0" />
                      <span>Always-free Career Journal archives impact while it&apos;s fresh</span>
                    </li>
                    <li className="flex items-center gap-2">
                      <Check size={14} className="text-emerald-400 shrink-0" />
                      <span>Quantitative data anchors executive round conversations</span>
                    </li>
                    <li className="flex items-center gap-2">
                      <Check size={14} className="text-emerald-400 shrink-0" />
                      <span>Average reported compensation uplift of ₹14.0L – ₹24.0L</span>
                    </li>
                  </ul>
                </div>
              </div>
            </div>

            {/* The 4 Psychological Pillars (Section 3 of Brand Foundation) */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5 max-w-5xl mx-auto">
              {[
                {
                  title: "Self-Recognition",
                  icon: Search,
                  color: "text-blue-400 border-blue-500/30",
                  desc: "Notice achievements, cost savings, and architecture milestones people routinely overlook.",
                },
                {
                  title: "Self-Efficacy",
                  icon: ShieldCheck,
                  color: "text-teal-400 border-teal-500/30",
                  desc: "Build unwavering confidence grounded in verifiable proof, not empty encouragement.",
                },
                {
                  title: "Professional Agency",
                  icon: Target,
                  color: "text-amber-400 border-amber-500/30",
                  desc: "Shift from waiting for promotions to taking informed, data-backed career sprints.",
                },
                {
                  title: "Career Momentum",
                  icon: TrendingUp,
                  color: "text-purple-400 border-purple-500/30",
                  desc: "Turn professional development into an ongoing growth loop rather than transactional panic.",
                },
              ].map((pill, i) => {
                const Icon = pill.icon;
                return (
                  <div key={i} className="p-5 rounded-xl card-obsidian border border-white/10 space-y-2.5 hover:border-white/25 transition-all">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-white">{pill.title}</span>
                      <Icon size={16} className={pill.color.split(" ")[0]} />
                    </div>
                    <p className="text-xs text-slate-400 leading-relaxed">
                      {pill.desc}
                    </p>
                  </div>
                );
              })}
            </div>
          </div>
        </section>

        {/* ═══════════════════════════════════════
            SECTION 5: THE CANONICAL CORE LOOP
            Section 6 & 7 of Foundation Doc: Discover, Develop, Pursue, Achieve
            ═══════════════════════════════════════ */}
        <section ref={coreLoopRef} id="core-loop" className="py-24 border-t border-white/10 bg-[#070C18]">
          <div className="max-w-7xl mx-auto px-6 space-y-16">
            <div className="text-center space-y-4 max-w-3xl mx-auto">
              <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-blue-500/10 border border-blue-500/30 text-blue-400 text-xs font-mono font-bold tracking-widest uppercase shadow-sm">
                <Workflow size={13} className="text-[#2563EB]" />
                <span>CONTINUOUS ADVANCEMENT ENGINE · THE CORE LOOP</span>
              </div>
              <h2 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-normal leading-[1.18] text-white font-['Playfair_Display',serif] tracking-tight">
                Your career is not a static document.
                <span className="block mt-2 font-normal italic text-transparent bg-clip-text bg-gradient-to-r from-blue-300 via-teal-200 to-amber-300">
                  It is a continuous compound loop.
                </span>
              </h2>
              <p className="text-base sm:text-lg text-slate-300 leading-relaxed font-normal">
                Resume builders are one-time emergency transactions you abandon after landing a job. UpRole is your permanent career operating system structured across four connected phases.
              </p>
            </div>

            {/* Animated Sequential 4-Phase Core Loop with Connecting Flow Arrows */}
            <AnimatedCoreLoopFlow />

            {/* AI Intelligence Layer Banner */}
            <div className="p-6 rounded-2xl bg-gradient-to-r from-purple-900/30 via-indigo-900/20 to-purple-900/30 border border-purple-500/30 flex flex-col sm:flex-row items-center justify-between gap-5 shadow-lg">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-xl bg-purple-600 text-white flex items-center justify-center shrink-0 shadow-md">
                  <Sparkles size={24} />
                </div>
                <div>
                  <h4 className="text-base font-bold text-white">
                    Powered by UpRole AI Intelligence Layer
                  </h4>
                  <p className="text-xs text-slate-300 leading-relaxed">
                    Acts as your personal strategic career counsel across all 4 phases — diagnosing unrecorded impact, calibrating ATS matches, and structuring executive interview stories.
                  </p>
                </div>
              </div>
              <span className="text-xs font-bold px-4 py-2 rounded-full badge-ai shrink-0 border border-purple-500/30">
                AI Intelligence Layer
              </span>
            </div>
          </div>
        </section>

        {/* ═══════════════════════════════════════
            SECTION 6: THE 4 DASHBOARD QUESTIONS
            Section 9 of Foundation Doc: Where am I, Where can I go, What to achieve, What next
            ═══════════════════════════════════════ */}
        <section id="value-engine" className="py-28 border-t border-white/10 bg-gradient-to-b from-[#070C18] via-[#0D152A] to-[#070C18] relative overflow-hidden">
          {/* Subtle Ambient Radial Orb */}
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[850px] h-[450px] bg-blue-600/[0.08] rounded-full blur-[180px] pointer-events-none" />

          <div className="max-w-6xl mx-auto px-6 space-y-12 relative z-10">
            {/* Executive Framing Header */}
            <div className="text-center space-y-4 max-w-3xl mx-auto">
              <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-blue-500/10 border border-blue-500/25 text-blue-300 text-xs font-mono font-bold tracking-widest uppercase shadow-sm">
                <Compass size={13} className="text-blue-400" />
                <span>THE UPROLE OPERATING SYSTEM · PRINCIPLE 09</span>
              </div>

              <h2 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-normal leading-[1.18] text-white font-['Playfair_Display',serif] tracking-tight">
                Every time you log in, answer the{" "}
                <span className="italic font-normal text-transparent bg-clip-text bg-gradient-to-r from-blue-300 via-teal-200 to-amber-300">
                  4 questions that matter.
                </span>
              </h2>

              <p className="text-base sm:text-lg text-slate-300 leading-relaxed font-normal">
                UpRole rejects cluttered dashboards with meaningless graphs. Your command center provides unequivocal clarity across the four essential pillars of career leverage.
              </p>
            </div>

            {/* Interactive 4-Quadrant Operating System Console */}
            <OperatingSystemHUD />
          </div>
        </section>

        {/* ═══════════════════════════════════════
            SECTION 7: INTERACTIVE VALUE CALCULATOR
            ═══════════════════════════════════════ */}
        <section id="calculator" className="py-24 border-t border-white/10 bg-[#070C18]">
          <div className="max-w-6xl mx-auto px-6">
            <CareerValueCalculator />
          </div>
        </section>

        {/* ═══════════════════════════════════════
            SECTION 8: SOCIAL PROOF & ATS BENCHMARKS
            ═══════════════════════════════════════ */}
        <section className="border-t border-white/10 bg-gradient-to-b from-[#0D152A] to-[#070C18] py-20 relative z-10">
          <div className="max-w-6xl mx-auto px-6 space-y-14">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 divide-y md:divide-y-0 md:divide-x divide-white/10">
              <div className="text-center pt-6 md:pt-0 flex flex-col items-center justify-center">
                <div className="font-['Syne',sans-serif] text-5xl font-extrabold text-[#F59E0B] mb-2">
                  <Counter value={dbStats.averageATS} suffix="%" />
                </div>
                <div className="text-sm font-semibold text-slate-200">
                  Average ATS Match Score
                </div>
                <p className="text-xs text-slate-400 mt-1">Benchmarked across 400+ Job Specs</p>
              </div>

              <div className="text-center pt-6 md:pt-0 flex flex-col items-center justify-center">
                <div className="font-['Syne',sans-serif] text-5xl font-extrabold text-[#60A5FA] mb-2">
                  <Counter value={dbStats.totalResumes} suffix="+" />
                </div>
                <div className="text-sm font-semibold text-slate-200">
                  Targeted Resumes Deployed
                </div>
                <p className="text-xs text-slate-400 mt-1">Across 18 Global Industries</p>
              </div>

              <div className="text-center pt-6 md:pt-0 flex flex-col items-center justify-center">
                <div className="font-['Syne',sans-serif] text-5xl font-extrabold text-[#2DD4BF] mb-2">
                  <Counter value={dbStats.aiRunsCount} suffix="+" />
                </div>
                <div className="text-sm font-semibold text-slate-200">
                  Achievements Discovered
                </div>
                <p className="text-xs text-slate-400 mt-1">Surfaced from Unrecorded Work</p>
              </div>
            </div>

            {/* Named ATS Compatibility Badges */}
            <div className="pt-8 border-t border-white/10 text-center space-y-4">
              <span className="text-xs font-mono font-bold uppercase tracking-wider text-slate-400">
                Calibrated & Compliance-Tested For Enterprise ATS Engines
              </span>
              <div className="flex flex-wrap items-center justify-center gap-4 sm:gap-6 pt-2">
                {["Workday", "Greenhouse", "Taleo (Oracle)", "Lever", "iCIMS", "SAP SuccessFactors"].map((engine, i) => (
                  <span
                    key={i}
                    className="px-4 py-2 rounded-xl bg-white/[0.04] border border-white/10 text-xs sm:text-sm font-semibold text-slate-300 flex items-center gap-2 hover:border-white/20 transition-all"
                  >
                    <BadgeCheck size={16} className="text-[#14B8A6]" />
                    {engine}
                  </span>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* ═══════════════════════════════════════
            SECTION 9: INTENT-BASED PRICING
            "Free is where you build. Paid is where you sprint."
            ═══════════════════════════════════════ */}
        <section id="pricing" className="relative z-10 border-t border-white/10 bg-[#070C18]">
          <PricingSection showCards={true} />
        </section>

        {/* ═══════════════════════════════════════
            SECTION 10: FINAL HIGH-CONVERTING STRATEGIC CTA
            ═══════════════════════════════════════ */}
        <section className="py-28 bg-gradient-to-br from-[#0D152A] via-[#0A1124] to-[#060A14] text-white relative overflow-hidden border-t border-white/10">
          {/* Ambient Glow */}
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[700px] h-[350px] bg-gradient-to-r from-blue-600/20 via-teal-500/15 to-amber-500/20 rounded-full blur-3xl pointer-events-none" />

          <div className="max-w-3xl mx-auto px-6 text-center space-y-8 relative z-10">
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white/10 border border-white/20 text-xs font-bold text-amber-400 shadow-md">
              <Sparkles size={14} />
              <span>Free Forever Plan Included</span>
            </div>

            <h2 className="text-3xl sm:text-5xl font-extrabold font-['Syne',sans-serif] leading-tight text-white">
              You already did the work.
              <br />
              <span className="text-gradient-amber">
                Let&apos;s make sure your career reflects it.
              </span>
            </h2>

            <p className="text-base sm:text-lg text-slate-300 max-w-xl mx-auto leading-relaxed">
              Start building your Career Value today. Log your achievements, discover your missing impact, and generate a resume that turns recruiter calls into offers.
            </p>

            <div className="pt-2">
              <Link href="/resume/upload" className="no-underline">
                <button className="px-10 py-4 rounded-xl btn-warm-amber text-slate-950 font-extrabold text-base shadow-[0_8px_32px_rgba(245,158,11,0.45)] hover:scale-105 active:scale-95 transition-all">
                  Get Your Free Career Analysis
                </button>
              </Link>
            </div>

            <p className="text-xs text-slate-400">
              No credit card required • Instant analysis in 30 seconds • 100 bonus credits on signup
            </p>
          </div>
        </section>

        {/* ═══════════════════════════════════════
            SECTION 11: STRATEGIC BRAND FOOTER
            Section 11, 12, 13 of Foundation Doc
            ═══════════════════════════════════════ */}
        <footer className="border-t border-white/10 bg-[#060A14] py-16 px-6 relative z-10 text-white">
          <div className="max-w-7xl mx-auto grid grid-cols-1 sm:grid-cols-2 md:grid-cols-5 gap-10 mb-12">
            {/* Col 1: Wordmark & Canonical Career Path Logo */}
            <div className="space-y-4 md:col-span-2">
              <div className="flex items-center gap-2.5">
                <div className="relative flex items-center justify-center w-8 h-8 rounded-lg bg-gradient-to-br from-[#101B3B] via-[#2563EB] to-[#14B8A6] p-[1.5px] shadow-sm">
                  <div className="w-full h-full bg-[#070C18] rounded-[6.5px] flex items-center justify-center">
                    <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M4 18L10 12L14 16L20 6" stroke="url(#careerPathGradFooter)" />
                      <path d="M15 6H20V11" stroke="#F59E0B" />
                      <defs>
                        <linearGradient id="careerPathGradFooter" x1="4" y1="18" x2="20" y2="6" gradientUnits="userSpaceOnUse">
                          <stop stopColor="#2563EB" />
                          <stop offset="0.5" stopColor="#14B8A6" />
                          <stop offset="1" stopColor="#F59E0B" />
                        </linearGradient>
                      </defs>
                    </svg>
                  </div>
                </div>
                <span className="text-[22px] font-extrabold tracking-tight text-white font-['Syne',sans-serif]">
                  UpRole
                </span>
              </div>
              <p className="text-xs font-bold uppercase tracking-wider text-[#F59E0B]">
                Careers with Clarity. Progress with Purpose.
              </p>
              <p className="text-xs text-slate-400 leading-relaxed max-w-sm">
                UpRole is the Career Advancement Platform helping professionals understand their career value, strengthen it with verified evidence, and convert it into breakthrough career outcomes.
              </p>
              <p className="text-[11px] text-slate-500">
                © {new Date().getFullYear()} UpRole. All rights reserved.
              </p>
            </div>

            {/* Col 2: The Platform */}
            <div className="space-y-4">
              <h4 className="text-xs font-bold text-white uppercase tracking-wider">
                The Platform
              </h4>
              <ul className="space-y-2.5 text-xs text-slate-400 list-none p-0 m-0">
                <li><Link href="/dashboard" className="hover:text-[#F59E0B] transition-colors">Career Dashboard</Link></li>
                <li><Link href="/resume/builder?new=true" className="hover:text-[#F59E0B] transition-colors">Career Discovery Engine</Link></li>
                <li><Link href="/resume/tailor" className="hover:text-[#F59E0B] transition-colors">Named ATS Tailor</Link></li>
                <li><Link href="/career-journal" className="hover:text-[#F59E0B] transition-colors">Career Journal & Vault</Link></li>
                <li><Link href="/career-copilot" className="hover:text-[#F59E0B] transition-colors">AI Career Copilot</Link></li>
              </ul>
            </div>

            {/* Col 3: Multi-Outputs */}
            <div className="space-y-4">
              <h4 className="text-xs font-bold text-white uppercase tracking-wider">
                Multi-Outputs
              </h4>
              <ul className="space-y-2.5 text-xs text-slate-400 list-none p-0 m-0">
                <li><Link href="/dashboard/linkedin" className="hover:text-[#F59E0B] transition-colors">LinkedIn Optimizer</Link></li>
                <li><Link href="/dashboard/interview-prep" className="hover:text-[#F59E0B] transition-colors">STAR Interview Prep</Link></li>
                <li><Link href="/dashboard/cover-letter" className="hover:text-[#F59E0B] transition-colors">Cover Letter Writer</Link></li>
                <li><Link href="/pricing" className="hover:text-[#F59E0B] transition-colors">Pricing & Sprints</Link></li>
              </ul>
            </div>

            {/* Col 4: Canonical Pillars */}
            <div className="space-y-4">
              <h4 className="text-xs font-bold text-white uppercase tracking-wider">
                Canonical Pillars
              </h4>
              <ul className="space-y-2.5 text-xs text-slate-400 list-none p-0 m-0">
                <li className="flex items-center gap-1.5"><span className="w-1.5 h-1.5 rounded-full bg-[#2563EB]" /><span>Discover (Your Value)</span></li>
                <li className="flex items-center gap-1.5"><span className="w-1.5 h-1.5 rounded-full bg-[#14B8A6]" /><span>Develop (Your Potential)</span></li>
                <li className="flex items-center gap-1.5"><span className="w-1.5 h-1.5 rounded-full bg-[#F59E0B]" /><span>Pursue (Your Goals)</span></li>
                <li className="flex items-center gap-1.5"><span className="w-1.5 h-1.5 rounded-full bg-[#F59E0B]" /><span>Achieve (What&apos;s Next)</span></li>
                <li className="flex items-center gap-1.5"><span className="w-1.5 h-1.5 rounded-full bg-[#7C3AED]" /><span>AI Intelligence Layer</span></li>
              </ul>
            </div>
          </div>

          {/* Bottom Bar */}
          <div className="max-w-7xl mx-auto pt-8 border-t border-white/10 flex flex-col sm:flex-row justify-between items-center gap-4 text-[11px] text-slate-500">
            <div className="flex gap-6">
              <Link href="/privacy" className="hover:text-white transition-colors">Privacy Policy</Link>
              <Link href="/terms" className="hover:text-white transition-colors">Terms of Service</Link>
            </div>
            <p className="font-semibold tracking-wider text-slate-400">UPROLE | CAREERS WITH CLARITY. PROGRESS WITH PURPOSE.</p>
          </div>
        </footer>
      </div>

      <QuickScanModal isOpen={isQuickScanOpen} onClose={() => setIsQuickScanOpen(false)} />
    </main>
  );
}
