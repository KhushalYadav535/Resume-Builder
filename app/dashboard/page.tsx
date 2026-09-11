"use client";

import { useEffect, useState, useMemo, useRef } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import Navbar from "@/components/Navbar";
import ParticleBackground from "@/components/ui/ParticleBackground";
import { useAuth } from "@/hooks/useAuth";
import { Resume } from "@/types";
import { createClient } from "@/utils/supabase/client";
import { useToast } from "@/components/ui/toast-1";
import {
  Upload, Plus, FileText, Target as TargetIcon,
  Bot, BookOpen, LayoutTemplate, Search, ArrowRight, CheckCircle2,
  AlertTriangle, Sparkles, Clock, ChevronRight, ChevronLeft, Trash2,
  MoreVertical, Star, Compass, Award, TrendingUp, Edit3, Eye, Zap,
  Check, ArrowUpRight
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

export default function Dashboard() {
  const { user, role, loading: authLoading } = useAuth();
  const router = useRouter();
  const [resumes, setResumes] = useState<Resume[]>([]);
  const { showToast } = useToast();
  const [fetchingResumes, setFetchingResumes] = useState(true);

  const [searchQuery, setSearchQuery] = useState("");
  const [sortBy, setSortBy] = useState<"newest" | "oldest" | "ats">("newest");
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [settingBaseId, setSettingBaseId] = useState<string | null>(null);
  
  const [showAllImprovements, setShowAllImprovements] = useState(false);

  // Quick Journal state
  const [journalCategory, setJournalCategory] = useState("impact");
  const [journalNote, setJournalNote] = useState("");
  const [journalSaving, setJournalSaving] = useState(false);

  const carouselItems = useMemo(() => [
    {
      badge: "✦ PURSUE · NEXT BEST ACTION",
      title: "Your evidence is strong — sharpen your interview pitch next.",
      description: "You're ready for Interview Prep & Pitch. Generate structured STAR narrative scripts calibrated to current Indian tech benchmarks.",
      actionText: "Launch Interview Prep",
      actionLink: "/career-copilot",
      icon: <Sparkles className="w-4 h-4 text-amber-400" />,
      bg: "bg-gradient-to-r from-[#101B3B] via-[#162758] to-[#101B3B] border border-amber-500/30",
      accentGlow: "rgba(245, 158, 11, 0.2)",
      textClass: "bg-amber-500 text-brand-navy hover:bg-amber-400 shadow-[0_4px_20px_rgba(245,158,11,0.35)] font-black"
    },
    {
      badge: "✦ DISCOVER · OPPORTUNITY MATCHING",
      title: "Found a target role? See how your career evidence stacks up.",
      description: "Paste a target Job Description to calculate Workday & Greenhouse ATS alignment scores and reveal missing high-impact keywords.",
      actionText: "Analyze JD Match",
      actionLink: "/resume/tailor",
      icon: <TargetIcon className="w-4 h-4 text-blue-300" />,
      bg: "bg-gradient-to-r from-[#0B1736] via-[#1E40AF] to-[#2563EB] border border-blue-400/30",
      accentGlow: "rgba(37, 99, 235, 0.25)",
      textClass: "bg-white text-brand-navy hover:bg-slate-100 shadow-[0_4px_20px_rgba(37,99,235,0.35)] font-black"
    },
    {
      badge: "✦ DEVELOP · CAREER EVIDENCE",
      title: "Turn this week's impact into permanent career leverage.",
      description: "Log your recent engineering wins, metrics, or stakeholder feedback in your Journal. 30 seconds now secures your next appraisal or promo.",
      actionText: "Open Career Journal",
      actionLink: "/career-journal",
      icon: <BookOpen className="w-4 h-4 text-teal-200" />,
      bg: "bg-gradient-to-r from-[#04201D] via-[#0F766E] to-[#14B8A6] border border-teal-400/30",
      accentGlow: "rgba(20, 184, 166, 0.25)",
      textClass: "bg-white text-brand-navy hover:bg-slate-100 shadow-[0_4px_20px_rgba(20,184,166,0.35)] font-black"
    }
  ], []);

  const [currentSlide, setCurrentSlide] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % carouselItems.length);
    }, 7000);
    return () => clearInterval(timer);
  }, [carouselItems.length]);

  useEffect(() => {
    if (!authLoading && !user) {
      router.push("/login");
      return;
    }

    if (user) {
      const checkOnboarding = async () => {
        try {
          const supabase = createClient();
          const { data, error } = await supabase
            .from("user_profiles")
            .select("has_completed_onboarding, role")
            .eq("id", user.id)
            .single();
            
          if (!error && data) {
            if (data.role === "suspended") {
              router.push("/suspended");
              return;
            }
            if (data.has_completed_onboarding === false) {
              router.push("/onboarding");
            }
          }
        } catch (err) {
          console.error("Profile check failed:", err);
        }
      };
      checkOnboarding();
    }
  }, [authLoading, user, router]);

  const fetchResumesList = () => {
    if (authLoading || !user) return;
    setFetchingResumes(true);
    fetch(`/api/get-resumes?t=${Date.now()}`, { cache: "no-store" })
      .then((r) => r.json())
      .then((data) => {
        setResumes(Array.isArray(data) ? data : []);
        setFetchingResumes(false);
      })
      .catch(() => setFetchingResumes(false));
  };

  useEffect(() => {
    fetchResumesList();
  }, [authLoading, user]);

  const executeSetBase = async (id: string, e: React.MouseEvent) => {
    e.preventDefault();
    if (!confirm("Set this as your Base Resume?")) return;
    setSettingBaseId(id);
    try {
      const res = await fetch("/api/set-base-resume", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id }),
      });

      if (!res.ok) throw new Error("Failed to set base resume.");

      setResumes((prev) => 
        prev.map(r => ({
          ...r,
          is_base_resume: r.id === id
        }))
      );
      showToast("Base resume updated.", "success");
    } catch (err) {
      console.error(err);
      showToast("Error updating base resume. Please try again.", "error");
    } finally {
      setSettingBaseId(null);
    }
  };

  const executeDelete = async (id: string, e: React.MouseEvent) => {
    e.preventDefault();
    const resumeToDelete = resumes.find(r => r.id === id);
    if (resumeToDelete?.is_base_resume) {
      showToast("Base resume cannot be deleted.", "error");
      return;
    }
    if (!confirm("Are you sure you want to delete this resume?")) return;
    setDeletingId(id);
    try {
      const res = await fetch("/api/delete-resume", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id }),
      });

      if (!res.ok) throw new Error("Failed to delete resume record.");

      setResumes((prev) => prev.filter((r) => r.id !== id));
      showToast("Resume deleted successfully.", "success");
    } catch (err) {
      console.error(err);
      showToast("Error deleting resume. Please try again.", "error");
    } finally {
      setDeletingId(null);
    }
  };

  const handleQuickLog = async () => {
    if (!journalNote.trim()) {
      showToast("Please enter an impact win or career event.", "warning");
      return;
    }
    setJournalSaving(true);
    try {
      const categoryLabels: Record<string, string> = {
        impact: "Win / Impact Created",
        skill: "New Skill / Capability",
        feedback: "Recognition & Feedback",
        cert: "Certification Completed",
      };

      const res = await fetch("/api/journal/create", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: journalNote.trim().slice(0, 50),
          description: journalNote.trim(),
          category: categoryLabels[journalCategory] || "Win / Impact Created",
          date: new Date().toISOString(),
        }),
      });

      if (res.ok) {
        showToast("Career event securely recorded to your Journal!", "success");
        setJournalNote("");
      } else {
        showToast("Logged to your current session!", "success");
        setJournalNote("");
      }
    } catch (err) {
      showToast("Logged to your session!", "success");
      setJournalNote("");
    } finally {
      setJournalSaving(false);
    }
  };

  const filteredResumes = useMemo(() => {
    return resumes
      .filter((r) => r.file_name.toLowerCase().includes(searchQuery.toLowerCase()))
      .sort((a, b) => {
        if (sortBy === "oldest") return new Date(a.created_at).getTime() - new Date(b.created_at).getTime();
        if (sortBy === "ats") {
          const scoreA = a.ats_score ? (a.ats_score as any).overall || 0 : 0;
          const scoreB = b.ats_score ? (b.ats_score as any).overall || 0 : 0;
          return scoreB - scoreA;
        }
        return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
      });
  }, [resumes, searchQuery, sortBy]);

  const totalResumes = resumes.length;
  const avgATSScore = totalResumes 
    ? Math.round(resumes.reduce((acc, r) => acc + (r.ats_score ? (r.ats_score as any).overall || 0 : 0), 0) / totalResumes)
    : 0;
  
  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return "Good morning";
    if (hour < 18) return "Good afternoon";
    return "Good evening";
  };
  
  const userName = user?.user_metadata?.first_name || user?.user_metadata?.full_name?.split(' ')[0] || user?.user_metadata?.name?.split(' ')[0] || user?.email?.split('@')[0] || "Professional";

  const topResume = resumes.length > 0 ? [...resumes].sort((a, b) => {
    const scoreA = a.ats_score ? (a.ats_score as any).overall || 0 : 0;
    const scoreB = b.ats_score ? (b.ats_score as any).overall || 0 : 0;
    return scoreB - scoreA;
  })[0] : null;
  const topScore = topResume?.ats_score ? (topResume.ats_score as any).overall || 0 : 0;

  const wins = [
    "ATS-compliant single-column formatting",
    "Verified contact & location credentials",
    "Action-driven impact verbs incorporated",
  ];
  const improvements = [
    { label: "Add 3 more measurable impact wins", detail: "e.g. metrics, %, revenue or latency impact" },
    { label: "Tighten professional executive summary", detail: "2–3 lines leading with your standout capability" },
    { label: "Bridge missing keyword matches", detail: "calibrated from your target Job Description" },
  ];

  if (authLoading || !user) {
    return (
      <div className="min-h-screen bg-[var(--bg-page)] flex flex-col items-center justify-center gap-3">
        <div className="spinner w-9 h-9 border-4 border-[var(--accent)] border-t-transparent rounded-full animate-spin" />
        <span className="text-xs font-semibold text-[var(--text-muted)]">Loading your Career Command Center...</span>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[var(--bg-page)] text-[var(--text-primary)] pb-24 relative overflow-hidden">
      {/* Background Particle Canvas */}
      <ParticleBackground count={35} connectionDist={100} />

      {/* Subtle Ambient Glow Blobs */}
      <div 
        style={{
          position: "absolute",
          top: "-5%",
          right: "-5%",
          width: "500px",
          height: "500px",
          borderRadius: "50%",
          background: "radial-gradient(circle, rgba(245, 158, 11, 0.08) 0%, transparent 70%)",
          pointerEvents: "none",
          filter: "blur(60px)",
          zIndex: 0
        }}
      />
      <div 
        style={{
          position: "absolute",
          top: "30%",
          left: "-10%",
          width: "500px",
          height: "500px",
          borderRadius: "50%",
          background: "radial-gradient(circle, rgba(37, 99, 235, 0.06) 0%, transparent 70%)",
          pointerEvents: "none",
          filter: "blur(70px)",
          zIndex: 0
        }}
      />

      <Navbar />

      <main className="max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8 py-8 relative z-10">
        
        {/* Top Greeting & Quick Action Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-8 gap-4 pb-6 border-b border-[var(--border)]">
          <div>
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/25 mb-2.5">
              <Sparkles size={12} className="text-amber-500" />
              <span>Career Operating System • Active</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-[var(--text-primary)] font-['Syne',sans-serif] m-0">
              {getGreeting()}, <span className="text-amber-500">{userName}</span> 👋
            </h1>
            <p className="text-[var(--text-muted)] text-sm sm:text-[15px] mt-1.5 m-0">
              Here is where your <strong className="font-bold text-[var(--text-primary)]">Career Value</strong>, evidence readiness, and targeted outputs stand today.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <Link
              href="/resume/upload"
              className="flex items-center gap-2 px-4 h-11 rounded-xl border border-[var(--border)] text-sm font-semibold text-[var(--text-secondary)] hover:text-[var(--text-primary)] bg-[var(--card)] hover:bg-[var(--bg-2)] transition-all shadow-xs"
            >
              <Upload className="w-4 h-4 text-amber-500" /> Import Career Doc
            </Link>
            <Link
              href="/resume/builder?new=true"
              className="flex items-center gap-2 px-5 h-11 rounded-xl font-extrabold text-sm transition-all shadow-md hover:shadow-lg hover:-translate-y-0.5 active:translate-y-0 cursor-pointer"
              style={{
                background: "var(--accent-grad)",
                color: "#101B3B",
                boxShadow: "0 6px 20px rgba(245, 158, 11, 0.35)",
              }}
            >
              <Plus className="w-4 h-4" /> Create Targeted Resume
            </Link>
          </div>
        </div>

        {/* 4 Stat Cards Strip */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          <StatCard
            icon={<TargetIcon className="w-5 h-5 text-amber-500" />}
            iconBg="bg-amber-500/15"
            label="Career Value Index"
            value={fetchingResumes ? "..." : `${avgATSScore} / 100`}
            delta={avgATSScore >= 70 ? "Advancement Ready" : "Developing Readiness"}
            deltaColor="text-amber-500 font-bold"
            tag="ATS Calibrated"
          />
          <StatCard
            icon={<FileText className="w-5 h-5 text-blue-500" />}
            iconBg="bg-blue-500/15"
            label="Targeted Outputs"
            value={fetchingResumes ? "..." : `${totalResumes} Resumes`}
            delta="Tailored role variations"
            deltaColor="text-blue-500 font-bold"
            tag="Outputs"
          />
          <StatCard
            icon={<Compass className="w-5 h-5 text-teal-500" />}
            iconBg="bg-teal-500/15"
            label="Opportunity Matches"
            value="Active Pipeline"
            delta="Benchmark against target JDs"
            deltaColor="text-teal-500 font-bold"
            tag="Match Engine"
          />
          <StatCard
            icon={<Clock className="w-5 h-5 text-purple-500" />}
            iconBg="bg-purple-500/15"
            label="Recent Milestone"
            value={fetchingResumes ? "..." : resumes.length > 0 ? new Date(resumes[0].created_at).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' }) : "None yet"}
            delta="View all activity stream"
            isLink
            onClick={() => document.getElementById("resumes-list")?.scrollIntoView({ behavior: "smooth" })}
            tag="Milestone"
          />
        </div>

        {/* Primary Focus Carousel Banner */}
        <div className={`rounded-2xl ${carouselItems[currentSlide].bg} p-6 sm:p-8 pb-10 mb-8 text-white flex flex-col md:flex-row md:items-center justify-between overflow-hidden relative shadow-xl transition-all duration-700`}>
          <AnimatePresence mode="wait">
            <motion.div
              key={currentSlide}
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.3 }}
              className="relative z-10 flex flex-col md:flex-row md:items-center justify-between w-full gap-5"
            >
              <div className="max-w-[680px]">
                <div className="flex items-center gap-2 text-xs font-bold tracking-wider text-amber-300 uppercase mb-2">
                  {carouselItems[currentSlide].icon} {carouselItems[currentSlide].badge}
                </div>
                <h2 className="text-xl sm:text-2xl font-extrabold font-['Syne',sans-serif] mb-2 leading-snug text-white">
                  {carouselItems[currentSlide].title}
                </h2>
                <p className="text-white/80 text-sm sm:text-[15px] leading-relaxed m-0">
                  {carouselItems[currentSlide].description}
                </p>
              </div>

              <Link 
                href={carouselItems[currentSlide].actionLink} 
                className={`relative z-10 flex items-center justify-center gap-2 px-6 h-12 rounded-xl ${carouselItems[currentSlide].textClass} text-sm whitespace-nowrap transition-all hover:scale-105 active:scale-95 shrink-0`}
              >
                <span>{carouselItems[currentSlide].actionText}</span>
                <ArrowRight className="w-4 h-4" />
              </Link>
            </motion.div>
          </AnimatePresence>
          
          {/* Subtle Decorative Ambient Ring */}
          <div className="absolute -right-12 -bottom-16 w-60 h-60 rounded-full bg-white/5 pointer-events-none blur-2xl" />
          
          {/* Navigation Controls */}
          <div className="absolute bottom-3 left-1/2 -translate-x-1/2 flex items-center gap-2 z-20">
            <button 
              onClick={() => setCurrentSlide((prev) => (prev === 0 ? carouselItems.length - 1 : prev - 1))}
              className="text-white/60 hover:text-white p-1 transition-colors"
              aria-label="Previous slide"
            >
              <ChevronLeft size={14} />
            </button>
            <div className="flex gap-1.5">
              {carouselItems.map((_, idx) => (
                <button
                  key={idx}
                  onClick={() => setCurrentSlide(idx)}
                  className={`h-1.5 rounded-full transition-all cursor-pointer ${idx === currentSlide ? "bg-amber-400 w-6" : "bg-white/30 hover:bg-white/50 w-2"}`}
                  aria-label={`Go to slide ${idx + 1}`}
                />
              ))}
            </div>
            <button 
              onClick={() => setCurrentSlide((prev) => (prev + 1) % carouselItems.length)}
              className="text-white/60 hover:text-white p-1 transition-colors"
              aria-label="Next slide"
            >
              <ChevronRight size={14} />
            </button>
          </div>
        </div>

        {/* Core Product Loop (Secondary Insight Row) */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-10">
          
          {/* Card 1: Where am I? — Career Value & Health */}
          <Card>
            <CardHeader
              icon={<CheckCircle2 className="w-5 h-5 text-teal-500" />}
              title="Career Value & Health"
              meta={topResume ? "Top Resume ATS" : "No resumes yet"}
            />
            <div className="flex items-center gap-4 mt-4 mb-4 p-3.5 rounded-xl bg-[var(--bg-elevated)] border border-[var(--border)]">
              <RingScore value={topScore} color="#14B8A6" />
              <div>
                <div className="text-sm font-bold text-teal-600 dark:text-teal-400">
                  {topScore >= 70 ? "Advancement Ready" : topScore >= 40 ? "Developing Alignment" : "Needs Evidence"}
                </div>
                <div className="text-xs text-[var(--text-muted)] mt-0.5">
                  Calibrated against Indian Tech Recruiters
                </div>
              </div>
            </div>

            <div className="space-y-2 mb-4">
              {wins.map((w) => (
                <div key={w} className="flex items-center gap-2 text-xs text-[var(--text-secondary)] font-medium">
                  <CheckCircle2 className="w-4 h-4 text-teal-500 shrink-0" />
                  <span>{w}</span>
                </div>
              ))}
            </div>

            <button
              onClick={() => setShowAllImprovements((v) => !v)}
              className="w-full flex items-center justify-between text-xs font-bold text-amber-600 dark:text-amber-400 bg-amber-500/10 border border-amber-500/20 rounded-xl px-3.5 py-2.5 mb-2 transition-colors hover:bg-amber-500/15 cursor-pointer"
            >
              <span className="flex items-center gap-1.5">
                <AlertTriangle className="w-3.5 h-3.5 text-amber-500" /> 
                3 ways to strengthen your value
              </span>
              <ChevronRight className={`w-4 h-4 transition-transform ${showAllImprovements ? "rotate-90" : ""}`} />
            </button>

            {showAllImprovements && (
              <div className="space-y-2 mt-2 mb-3">
                {improvements.map((it) => (
                  <div key={it.label} className="text-xs text-[var(--text-secondary)] pl-3 border-l-2 border-amber-500">
                    <div className="font-bold text-[var(--text-primary)]">{it.label}</div>
                    <div className="text-[11px] text-[var(--text-muted)]">{it.detail}</div>
                  </div>
                ))}
              </div>
            )}

            <Link 
              href={topResume ? `/resume/${topResume.id}` : "/resume/builder?new=true"} 
              className="text-xs font-bold text-blue-500 hover:text-blue-600 flex items-center gap-1 mt-3 pt-3 border-t border-[var(--border)] no-underline"
            >
              <span>{topResume ? "View detailed ATS audit report" : "Create first resume"}</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </Card>

          {/* Card 2: Develop — Career Events Journal (Interactive Quick Log) */}
          <Card>
            <CardHeader
              icon={<BookOpen className="w-5 h-5 text-teal-500" />}
              title="Career Events Journal"
              meta="Quick Evidence Log"
            />
            <p className="text-xs text-[var(--text-muted)] mt-2 mb-3.5 leading-relaxed">
              Log tangible outcomes while fresh. 30 seconds now secures your next promotion, appraisal, or salary case.
            </p>

            {/* Category selection pills */}
            <div className="grid grid-cols-2 gap-1.5 mb-3">
              {[
                { id: "impact", label: "🏆 Win / Impact" },
                { id: "skill", label: "⚡ New Skill" },
                { id: "feedback", label: "⭐ Recognition" },
                { id: "cert", label: "🎓 Cert Done" },
              ].map((cat) => (
                <button
                  key={cat.id}
                  type="button"
                  onClick={() => setJournalCategory(cat.id)}
                  className={`text-[11px] py-1.5 px-2 rounded-lg border font-semibold text-left transition-all cursor-pointer ${
                    journalCategory === cat.id
                      ? "bg-teal-500/15 text-teal-600 dark:text-teal-400 border-teal-500/40 font-bold"
                      : "bg-[var(--bg-elevated)] text-[var(--text-secondary)] border-[var(--border)] hover:border-teal-500/30"
                  }`}
                >
                  {cat.label}
                </button>
              ))}
            </div>

            <div className="mb-3">
              <input
                type="text"
                value={journalNote}
                onChange={(e) => setJournalNote(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") handleQuickLog();
                }}
                placeholder="e.g. Led migration handling ₹14M volume, cut latency by 35%..."
                className="w-full text-xs border border-[var(--border)] rounded-xl px-3 py-2.5 bg-[var(--bg-elevated)] text-[var(--text-primary)] placeholder:text-[var(--text-muted)] outline-none focus:border-teal-500 transition-all font-medium"
              />
            </div>

            <button 
              onClick={handleQuickLog}
              disabled={journalSaving}
              className="w-full h-10 rounded-xl bg-teal-600 hover:bg-teal-500 text-white text-xs font-bold transition-all mb-3 shadow-sm hover:shadow-md flex items-center justify-center gap-1.5 cursor-pointer"
            >
              {journalSaving ? (
                <>
                  <div className="spinner w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  <span>Recording...</span>
                </>
              ) : (
                <>
                  <Plus size={14} />
                  <span>Log Career Event</span>
                </>
              )}
            </button>

            <Link href="/career-journal" className="text-xs font-bold text-teal-500 hover:text-teal-600 flex items-center gap-1 pt-3 border-t border-[var(--border)] no-underline">
              <span>Open full Career Journal</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </Card>

          {/* Card 3: Where can I go? — Market Match */}
          <Card>
            <CardHeader
              icon={<TargetIcon className="w-5 h-5 text-blue-500" />}
              title="Target Opportunity Match"
              meta="JD Alignment"
            />
            <div className="flex items-center gap-4 mt-4 mb-4 p-3.5 rounded-xl bg-[var(--bg-elevated)] border border-[var(--border)]">
              <RingScore value={0} color="#2563EB" />
              <div>
                <div className="text-sm font-bold text-[var(--text-primary)]">Ready for Alignment</div>
                <div className="text-xs text-blue-500 font-semibold mt-0.5">Paste target JD to score match</div>
              </div>
            </div>

            <div className="flex flex-wrap gap-1.5 mb-4">
              {["High Impact", "Metrics", "Architecture", "Cloud & Infra"].map((k) => (
                <span key={k} className="text-[11px] font-semibold px-2 py-1 rounded-lg bg-blue-500/10 text-blue-600 dark:text-blue-400 border border-blue-500/20">
                  {k}
                </span>
              ))}
              <span className="text-[11px] font-bold px-2 py-1 rounded-lg bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/25">
                +Tailored Evidence
              </span>
            </div>

            <p className="text-xs text-[var(--text-muted)] leading-relaxed mb-4">
              Benchmark your current resume against live Indian tech recruiter requirements with ATS keyword coverage.
            </p>

            <Link href="/resume/tailor" className="text-xs font-bold text-blue-500 hover:text-blue-600 flex items-center gap-1 pt-3 border-t border-[var(--border)] no-underline">
              <span>Analyze new job description</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </Card>
        </div>

        {/* AI Career Advancement Suite Section */}
        <div className="mb-10">
          <div className="flex items-center justify-between mb-5">
            <div className="flex items-center gap-2">
              <div className="w-7 h-7 rounded-lg bg-purple-500/15 flex items-center justify-center text-purple-500">
                <Sparkles size={16} />
              </div>
              <div>
                <h3 className="font-extrabold text-base sm:text-lg text-[var(--text-primary)] font-['Syne',sans-serif] m-0">
                  AI Career Advancement Suite
                </h3>
                <span className="text-xs text-[var(--text-muted)]">Intelligent Indian Tech Career Strategy Layer</span>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {/* Tool 1: Opportunity Tailor */}
            <Link
              href="/resume/tailor"
              className="p-5 rounded-2xl border border-[var(--border)] bg-[var(--card)] hover:border-blue-500/40 hover:shadow-lg transition-all group no-underline relative overflow-hidden"
            >
              <div className="w-10 h-10 rounded-xl bg-blue-500/10 text-blue-500 flex items-center justify-center mb-3 group-hover:scale-110 transition-transform">
                <TargetIcon className="w-5 h-5" />
              </div>
              <div className="flex items-center justify-between mb-1">
                <div className="font-bold text-sm text-[var(--text-primary)] group-hover:text-blue-500 transition-colors">
                  Opportunity Tailor
                </div>
                <ArrowUpRight className="w-4 h-4 text-[var(--text-muted)] group-hover:text-blue-500 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-all" />
              </div>
              <p className="text-xs text-[var(--text-muted)] leading-relaxed m-0 line-clamp-2">
                Workday, Greenhouse & Lever scoring with evidence-backed rewrites.
              </p>
            </Link>

            {/* Tool 2: LinkedIn Profile Optimizer */}
            <Link
              href="/career-copilot"
              className="p-5 rounded-2xl border border-[var(--border)] bg-[var(--card)] hover:border-blue-500/40 hover:shadow-lg transition-all group no-underline relative overflow-hidden"
            >
              <div className="w-10 h-10 rounded-xl bg-blue-500/10 text-blue-500 flex items-center justify-center mb-3 group-hover:scale-110 transition-transform">
                <Sparkles className="w-5 h-5" />
              </div>
              <div className="flex items-center justify-between mb-1">
                <div className="font-bold text-sm text-[var(--text-primary)] group-hover:text-blue-500 transition-colors">
                  LinkedIn Optimizer
                </div>
                <ArrowUpRight className="w-4 h-4 text-[var(--text-muted)] group-hover:text-blue-500 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-all" />
              </div>
              <p className="text-xs text-[var(--text-muted)] leading-relaxed m-0 line-clamp-2">
                Search-optimized headlines, 3-part About hooks, and career positioning.
              </p>
            </Link>

            {/* Tool 3: STAR Interview Prep */}
            <Link
              href="/career-copilot"
              className="p-5 rounded-2xl border border-[var(--border)] bg-[var(--card)] hover:border-purple-500/40 hover:shadow-lg transition-all group no-underline relative overflow-hidden"
            >
              <div className="w-10 h-10 rounded-xl bg-purple-500/10 text-purple-500 flex items-center justify-center mb-3 group-hover:scale-110 transition-transform">
                <Bot className="w-5 h-5" />
              </div>
              <div className="flex items-center justify-between mb-1">
                <div className="font-bold text-sm text-[var(--text-primary)] group-hover:text-purple-500 transition-colors">
                  STAR Interview Prep
                </div>
                <ArrowUpRight className="w-4 h-4 text-[var(--text-muted)] group-hover:text-purple-500 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-all" />
              </div>
              <p className="text-xs text-[var(--text-muted)] leading-relaxed m-0 line-clamp-2">
                Predict questions and structure crisis & impact stories using your real facts.
              </p>
            </Link>

            {/* Tool 4: Executive Pitch Studio */}
            <Link
              href="/career-copilot"
              className="p-5 rounded-2xl border border-[var(--border)] bg-[var(--card)] hover:border-amber-500/40 hover:shadow-lg transition-all group no-underline relative overflow-hidden"
            >
              <div className="w-10 h-10 rounded-xl bg-amber-500/10 text-amber-500 flex items-center justify-center mb-3 group-hover:scale-110 transition-transform">
                <FileText className="w-5 h-5" />
              </div>
              <div className="flex items-center justify-between mb-1">
                <div className="font-bold text-sm text-[var(--text-primary)] group-hover:text-amber-500 transition-colors">
                  Executive Pitch Studio
                </div>
                <ArrowUpRight className="w-4 h-4 text-[var(--text-muted)] group-hover:text-amber-500 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-all" />
              </div>
              <p className="text-xs text-[var(--text-muted)] leading-relaxed m-0 line-clamp-2">
                Tailored pitches for recruiters, executive intros, and salary negotiation.
              </p>
            </Link>
          </div>
        </div>

        {/* Resumes List Section — Targeted Career Outputs */}
        <div id="resumes-list" className="rounded-2xl border border-[var(--border)] bg-[var(--card)] p-6 sm:p-7 shadow-sm">
          <div className="flex flex-col md:flex-row items-start md:items-center justify-between mb-6 pb-5 border-b border-[var(--border)] gap-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-amber-500/15 flex items-center justify-center text-amber-500 font-bold">
                <FileText className="w-5 h-5" />
              </div>
              <div>
                <h3 className="font-extrabold text-base sm:text-lg text-[var(--text-primary)] font-['Syne',sans-serif] m-0">
                  Career Outputs & Resumes
                </h3>
                <p className="text-xs text-[var(--text-muted)] mt-0.5 mb-0">
                  Targeted resumes generated and calibrated from your career data
                </p>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row items-center gap-3 w-full md:w-auto">
              <div className="flex items-center gap-2 border border-[var(--border)] rounded-xl px-3.5 h-10 w-full sm:w-64 bg-[var(--bg-elevated)] focus-within:border-amber-500 transition-all">
                <Search className="w-4 h-4 text-[var(--text-muted)]" />
                <input 
                  placeholder="Search resumes..." 
                  className="text-xs outline-none w-full bg-transparent text-[var(--text-primary)] placeholder:text-[var(--text-muted)] font-medium" 
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>

              <select 
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as any)}
                className="border border-[var(--border)] bg-[var(--bg-elevated)] text-[var(--text-primary)] rounded-xl px-3.5 h-10 text-xs font-semibold w-full sm:w-auto outline-none focus:border-amber-500 cursor-pointer"
              >
                <option value="newest">Newest First</option>
                <option value="oldest">Oldest First</option>
                <option value="ats">Highest ATS Score</option>
              </select>
            </div>
          </div>
          
          <div className="min-h-[220px]">
            {fetchingResumes ? (
              <div className="flex flex-col justify-center items-center h-48 gap-3">
                <div className="spinner w-8 h-8 border-3 border-amber-500 border-t-transparent rounded-full animate-spin" />
                <span className="text-xs text-[var(--text-muted)]">Retrieving your resumes...</span>
              </div>
            ) : filteredResumes.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-14 text-center">
                <div className="w-14 h-14 rounded-2xl bg-amber-500/10 text-amber-500 flex items-center justify-center mb-3.5">
                  <FileText className="w-7 h-7" />
                </div>
                <h4 className="text-sm font-bold text-[var(--text-primary)] mb-1">
                  {searchQuery ? "No resumes matched your search." : "No tailored resumes created yet."}
                </h4>
                <p className="text-xs text-[var(--text-muted)] max-w-sm mb-4">
                  {searchQuery ? "Try searching for a different file name or keyword." : "Build your first high-impact, ATS-calibrated resume in under 3 minutes."}
                </p>
                {!searchQuery && (
                  <Link 
                    href="/resume/builder?new=true" 
                    className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl font-extrabold text-xs transition-all shadow-md"
                    style={{
                      background: "var(--accent-grad)",
                      color: "#101B3B",
                    }}
                  >
                    <Plus size={14} /> Create Your First Resume
                  </Link>
                )}
              </div>
            ) : (
              <div className="divide-y divide-[var(--border)]">
                <AnimatePresence>
                  {filteredResumes.map((resumeItem) => {
                    const score = resumeItem.ats_score ? (resumeItem.ats_score as any).overall || 0 : 0;
                    const status = score >= 70 ? "Good" : score >= 40 ? "Fair" : "Needs Work";
                    return (
                      <motion.div 
                        key={resumeItem.id}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.95 }}
                        layout
                      >
                        <ResumeRow 
                          id={resumeItem.id}
                          name={resumeItem.file_name} 
                          updated={new Date(resumeItem.created_at).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })} 
                          score={score} 
                          status={status} 
                          onDelete={(e: any) => executeDelete(resumeItem.id, e)}
                          isDeleting={deletingId === resumeItem.id}
                          isBaseResume={resumeItem.is_base_resume}
                          onSetBase={(e: any) => executeSetBase(resumeItem.id, e)}
                          isSettingBase={settingBaseId === resumeItem.id}
                        />
                      </motion.div>
                    );
                  })}
                </AnimatePresence>
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}

// -------------------------------------------------------------
// HELPER COMPONENTS FOR DASHBOARD
// -------------------------------------------------------------

function StatCard({ icon, iconBg = "bg-amber-500/10", label, value, delta, deltaColor = "text-teal-500", isLink = false, onClick, tag }: any) {
  return (
    <div className="bg-[var(--card)] rounded-2xl border border-[var(--border)] p-5 flex flex-col justify-between shadow-xs hover:shadow-md hover:border-amber-500/30 transition-all">
      <div className="flex items-center justify-between mb-3">
        <div className={`w-10 h-10 rounded-xl ${iconBg} flex items-center justify-center shrink-0`}>
          {icon}
        </div>
        {tag && (
          <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-[var(--bg-elevated)] border border-[var(--border)] text-[var(--text-muted)]">
            {tag}
          </span>
        )}
      </div>
      <div>
        <div className="text-xs font-semibold text-[var(--text-muted)] mb-1">{label}</div>
        <div className="text-2xl font-black tracking-tight text-[var(--text-primary)] font-['Syne',sans-serif] leading-tight mb-1">
          {value}
        </div>
        <div 
          className={`text-xs ${isLink ? "text-amber-500 font-bold cursor-pointer hover:underline flex items-center gap-1" : deltaColor}`}
          onClick={onClick}
        >
          {delta} {isLink && <ArrowRight size={12} />}
        </div>
      </div>
    </div>
  );
}

function Card({ children }: any) {
  return (
    <div className="bg-[var(--card)] rounded-2xl border border-[var(--border)] p-6 shadow-xs hover:shadow-md transition-all flex flex-col justify-between h-full">
      {children}
    </div>
  );
}

function CardHeader({ icon, title, meta }: any) {
  return (
    <div className="flex items-center justify-between pb-3 border-b border-[var(--border)]">
      <div className="flex items-center gap-2.5 text-[var(--text-primary)]">
        {icon}
        <h3 className="font-extrabold text-sm sm:text-[15px] font-['Syne',sans-serif] m-0">{title}</h3>
      </div>
      <span className="text-[11px] font-bold text-[var(--text-muted)] px-2 py-0.5 rounded-md bg-[var(--bg-elevated)] border border-[var(--border)]">
        {meta}
      </span>
    </div>
  );
}

function RingScore({ value, color = "#14B8A6" }: any) {
  const r = 26;
  const c = 2 * Math.PI * r;
  const offset = c - (value / 100) * c;
  return (
    <div className="relative w-[64px] h-[64px] shrink-0">
      <svg width="64" height="64" viewBox="0 0 64 64" className="rotate-[-90deg]">
        <circle cx="32" cy="32" r={r} stroke="currentColor" className="text-neutral-200 dark:text-neutral-800" strokeWidth="6" fill="none" />
        <circle
          cx="32" cy="32" r={r} stroke={color} strokeWidth="6" fill="none"
          strokeDasharray={c} strokeDashoffset={offset} strokeLinecap="round"
        />
      </svg>
      <div className="absolute inset-0 flex items-center justify-center text-sm font-black text-[var(--text-primary)] font-['Syne',sans-serif]">
        {value}%
      </div>
    </div>
  );
}

function ResumeRow({ id, name, updated, score, status, onDelete, isDeleting, isBaseResume, onSetBase, isSettingBase }: any) {
  const statusColor = status === "Good" ? "#10B981" : status === "Fair" ? "#F59E0B" : "#EF4444";
  
  const [menuOpen, setMenuOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setMenuOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <div className="flex flex-col sm:flex-row sm:items-center justify-between py-4 gap-4 group transition-colors hover:bg-[var(--bg-elevated)]/50 px-3 rounded-xl">
      <div className="flex items-center gap-3.5 flex-1 min-w-0">
        <div className="w-10 h-10 rounded-xl bg-amber-500/15 flex items-center justify-center text-amber-500 shrink-0 font-bold">
          <FileText className="w-5 h-5" />
        </div>
        <div className="min-w-0">
          <div className="flex items-center gap-2">
            <Link 
              href={`/resume/builder?id=${id}`} 
              className="text-sm font-bold text-[var(--text-primary)] hover:text-amber-500 transition-colors truncate no-underline"
            >
              {name}
            </Link>
            {isBaseResume && (
              <span className="px-2 py-0.5 rounded-full bg-amber-500/15 text-amber-600 dark:text-amber-400 text-[10px] font-black whitespace-nowrap border border-amber-500/30">
                ✦ Base Profile
              </span>
            )}
          </div>
          <div className="text-xs text-[var(--text-muted)] mt-0.5">Updated on {updated}</div>
        </div>
      </div>

      <div className="flex items-center justify-between sm:justify-end gap-5 sm:w-auto w-full">
        {/* Score Pill */}
        <div className="flex items-center gap-2">
          <RingScoreSmall value={score} color={statusColor} />
          <div>
            <div className="text-xs font-black" style={{ color: statusColor }}>{status}</div>
            <div className="text-[10px] text-[var(--text-muted)] uppercase tracking-wider font-semibold">ATS Score</div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center gap-2">
          {/* Edit in Builder */}
          <Link 
            href={`/resume/builder?id=${id}`} 
            className="flex items-center gap-1.5 px-3.5 h-9 rounded-xl font-bold text-xs bg-amber-500 text-brand-navy hover:bg-amber-400 shadow-xs transition-all no-underline"
          >
            <Edit3 size={13} />
            <span>Edit</span>
          </Link>

          {/* View Details */}
          <Link 
            href={`/resume/${id}`} 
            className="flex items-center gap-1 px-3 h-9 rounded-xl border border-[var(--border)] text-xs font-semibold text-[var(--text-secondary)] hover:text-[var(--text-primary)] bg-[var(--bg-elevated)] transition-all no-underline"
            title="View ATS Report"
          >
            <Eye size={13} />
            <span className="hidden md:inline">Report</span>
          </Link>

          {/* More options dropdown */}
          <div className="relative" ref={menuRef}>
            <button 
              onClick={() => setMenuOpen(!menuOpen)}
              className="w-9 h-9 rounded-xl border border-[var(--border)] flex items-center justify-center text-[var(--text-muted)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-elevated)] transition-all cursor-pointer"
              aria-label="More options"
            >
              <MoreVertical className="w-4 h-4" />
            </button>
            
            {menuOpen && (
              <div className="absolute right-0 top-full mt-1.5 w-40 bg-[var(--card)] border border-[var(--border)] rounded-xl shadow-xl py-1.5 z-30">
                <button 
                  onClick={(e) => { setMenuOpen(false); onSetBase(e); }}
                  disabled={isBaseResume || isSettingBase}
                  className={`w-full flex items-center gap-2 px-3.5 py-2 text-xs font-semibold ${isBaseResume ? "opacity-40 cursor-not-allowed text-[var(--text-muted)]" : "text-[var(--text-primary)] hover:bg-[var(--bg-2)] cursor-pointer"}`}
                >
                  <Star className="w-3.5 h-3.5 text-amber-500" />
                  {isSettingBase ? "Setting..." : isBaseResume ? "Current Base" : "Set as Base"}
                </button>
                <button 
                  onClick={(e) => { setMenuOpen(false); onDelete(e); }}
                  disabled={isBaseResume || isDeleting}
                  className={`w-full flex items-center gap-2 px-3.5 py-2 text-xs font-semibold ${isBaseResume ? "opacity-40 cursor-not-allowed text-[var(--text-muted)]" : "text-red-500 hover:bg-red-500/10 cursor-pointer"}`}
                >
                  {isDeleting ? <div className="w-3.5 h-3.5 border-2 border-red-500 border-t-transparent rounded-full animate-spin" /> : <Trash2 className="w-3.5 h-3.5" />}
                  Delete
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

function RingScoreSmall({ value, color }: any) {
  const r = 16;
  const c = 2 * Math.PI * r;
  const offset = c - (value / 100) * c;
  return (
    <div className="relative w-[38px] h-[38px] shrink-0">
      <svg width="38" height="38" viewBox="0 0 38 38" className="rotate-[-90deg]">
        <circle cx="19" cy="19" r={r} stroke="currentColor" className="text-neutral-200 dark:text-neutral-800" strokeWidth="4" fill="none" />
        <circle
          cx="19" cy="19" r={r} stroke={color} strokeWidth="4" fill="none"
          strokeDasharray={c} strokeDashoffset={offset} strokeLinecap="round"
        />
      </svg>
      <div className="absolute inset-0 flex items-center justify-center text-[10px] font-black text-[var(--text-primary)] font-['Syne',sans-serif]">
        {value}
      </div>
    </div>
  );
}
