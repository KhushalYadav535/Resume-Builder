"use client";

import { useState, useEffect, useMemo } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import Navbar from "@/components/Navbar";
import { useAuth } from "@/hooks/useAuth";
import { Resume } from "@/types";
import {
  Sparkles,
  Briefcase,
  Zap,
  TrendingUp,
  ShieldCheck,
  Target,
  ArrowRight,
  CheckCircle2,
  AlertCircle,
  Clock,
  FolderGit2,
  Award,
  GraduationCap,
  Compass,
  BookOpen,
  Search,
  Layers,
  ChevronRight,
} from "lucide-react";

interface CareerSignal {
  label: string;
  value: string | number;
  icon: any;
  color: string;
  status: "strong" | "moderate" | "weak";
  statusLabel: string;
}

export default function PulsePage() {
  const { user, loading: authLoading } = useAuth();
  const router = useRouter();

  const [resumes, setResumes] = useState<Resume[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!authLoading && !user) {
      router.push("/login");
    }
  }, [authLoading, user, router]);

  useEffect(() => {
    if (!user) return;
    setLoading(true);
    fetch("/api/get-resumes")
      .then((res) => res.json())
      .then((data) => {
        const list = Array.isArray(data) ? data : [];
        setResumes(list);
      })
      .catch((err) => console.error("Error fetching resumes:", err))
      .finally(() => setLoading(false));
  }, [user]);

  const activeResume = useMemo(() => {
    return resumes.find((r) => r.is_base_resume) || resumes[0] || null;
  }, [resumes]);

  const data = activeResume?.resume_data;

  // Compute career signals
  const signals: CareerSignal[] = useMemo(() => {
    if (!data) return [];

    const expCount = data.workExperience?.length || 0;
    const totalTenure = data.workExperience?.reduce((acc: number, w: any) => {
      if (w.startDate && (w.endDate || w.current)) return acc + 1;
      return acc;
    }, 0) || 0;

    const skillsCount =
      (data.skills?.technical?.length || 0) + (data.skills?.soft?.length || 0);

    const quantifiedBullets = (data.workExperience || [])
      .flatMap((w: any) => w.bullets || [])
      .filter((b: string) =>
        /\d+%|\$\d+|₹\d+|\d+x|reduced|increased|improved|scaled|delivered/i.test(b)
      ).length;

    const roleChanges = (data.workExperience || []).filter(
      (_: any, idx: number) => idx > 0
    ).length;

    const projCount = data.projects?.length || 0;
    const certCount = data.certifications?.length || 0;

    return [
      {
        label: "Experience Profile",
        value: `${expCount} roles`,
        icon: Briefcase,
        color: "text-amber-500",
        status: expCount >= 2 ? "strong" : expCount >= 1 ? "moderate" : "weak",
        statusLabel: expCount >= 2 ? "Well documented" : expCount >= 1 ? "Foundation set" : "Needs data",
      },
      {
        label: "Capability Signals",
        value: `${skillsCount} skills`,
        icon: Zap,
        color: "text-purple-500",
        status: skillsCount >= 5 ? "strong" : skillsCount >= 2 ? "moderate" : "weak",
        statusLabel: skillsCount >= 5 ? "Rich skill profile" : skillsCount >= 2 ? "Growing" : "Needs enrichment",
      },
      {
        label: "Impact Signals",
        value: `${quantifiedBullets} quantified`,
        icon: TrendingUp,
        color: "text-blue-500",
        status: quantifiedBullets >= 3 ? "strong" : quantifiedBullets >= 1 ? "moderate" : "weak",
        statusLabel: quantifiedBullets >= 3 ? "Strong evidence" : quantifiedBullets >= 1 ? "Partial evidence" : "Discovery needed",
      },
      {
        label: "Progression Signals",
        value: `${roleChanges} transitions`,
        icon: Layers,
        color: "text-teal-500",
        status: roleChanges >= 2 ? "strong" : roleChanges >= 1 ? "moderate" : "weak",
        statusLabel: roleChanges >= 2 ? "Clear progression" : roleChanges >= 1 ? "Single transition" : "Early career",
      },
      {
        label: "Project Evidence",
        value: `${projCount} projects`,
        icon: FolderGit2,
        color: "text-emerald-500",
        status: projCount >= 2 ? "strong" : projCount >= 1 ? "moderate" : "weak",
        statusLabel: projCount >= 2 ? "Well documented" : projCount >= 1 ? "Foundation set" : "Add projects",
      },
      {
        label: "Credentials",
        value: `${certCount} certs`,
        icon: ShieldCheck,
        color: "text-indigo-500",
        status: certCount >= 1 ? "strong" : "weak",
        statusLabel: certCount >= 1 ? "Credentials present" : "No credentials yet",
      },
    ];
  }, [data]);

  const currentRole =
    data?.workExperience?.find((w: any) => w.current)?.role ||
    data?.workExperience?.[0]?.role ||
    "Professional";

  const discoveryOptions = [
    {
      title: "Discover Career Value",
      desc: "Understand what your career experience is worth through evidence-backed interpretation.",
      href: "/value",
      icon: Sparkles,
      color: "bg-violet-500/15 text-violet-500 border-violet-500/30",
    },
    {
      title: "Explore Impact",
      desc: "Uncover hidden impact and outcomes from your work that aren't captured in your resume.",
      href: "/value",
      icon: TrendingUp,
      color: "bg-blue-500/15 text-blue-500 border-blue-500/30",
    },
    {
      title: "Strengthen Evidence",
      desc: "Add recognition, feedback, and progression signals that validate your accomplishments.",
      href: "/value",
      icon: ShieldCheck,
      color: "bg-teal-500/15 text-teal-500 border-teal-500/30",
    },
    {
      title: "Understand Capabilities",
      desc: "See how your career facts translate into demonstrated professional capabilities.",
      href: "/value/profile",
      icon: Award,
      color: "bg-amber-500/15 text-amber-500 border-amber-500/30",
    },
    {
      title: "Explore Career Direction",
      desc: "Analyze your trajectory and identify areas for growth and strategic positioning.",
      href: "/career-copilot",
      icon: Compass,
      color: "bg-rose-500/15 text-rose-500 border-rose-500/30",
    },
    {
      title: "Continue Later",
      desc: "Your Career Memory is saved. Return anytime to explore further.",
      href: "/dashboard",
      icon: Clock,
      color: "bg-slate-500/15 text-slate-500 border-slate-500/30",
    },
  ];

  const statusColor = (s: string) => {
    if (s === "strong") return "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20";
    if (s === "moderate") return "bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/20";
    return "bg-red-500/10 text-red-600 dark:text-red-400 border-red-500/20";
  };

  return (
    <div className="min-h-screen bg-[var(--bg)] text-[var(--text-primary)] flex flex-col font-sans">
      <Navbar />

      {/* Hero */}
      <section className="relative overflow-hidden border-b border-[var(--border)] bg-[var(--card)] py-10 px-6 sm:px-8">
        <div className="absolute top-0 right-1/4 w-96 h-96 bg-violet-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 left-10 w-80 h-80 bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />

        <div className="max-w-7xl mx-auto relative z-10">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-violet-500/15 border border-violet-500/30 text-violet-600 dark:text-violet-400 text-xs font-bold uppercase tracking-wider mb-3">
            <Sparkles size={14} />
            <span>The Pulse · Career Intelligence</span>
          </div>
          <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-[var(--text-primary)] font-['Syne',sans-serif]">
            Your Career at a Glance
          </h1>
          <p className="mt-2 text-sm sm:text-base text-[var(--text-secondary)] max-w-2xl leading-relaxed">
            An initial view of your career signals based on the information extracted from your resume. No forced score — just your facts, ready to explore.
          </p>
        </div>
      </section>

      <main className="max-w-7xl mx-auto w-full px-6 sm:px-8 py-10 flex-1 space-y-10">
        {loading ? (
          <div className="flex flex-col items-center justify-center py-20 gap-4">
            <div className="spinner" style={{ width: 36, height: 36 }} />
            <p className="text-sm text-[var(--text-muted)]">Loading your career signals...</p>
          </div>
        ) : !data ? (
          <div className="bg-[var(--card)] border border-[var(--border)] rounded-2xl p-12 text-center max-w-lg mx-auto">
            <AlertCircle size={40} className="mx-auto text-amber-500 mb-4" />
            <h3 className="text-base font-bold text-[var(--text-primary)]">No Resume Data Found</h3>
            <p className="text-xs text-[var(--text-secondary)] mt-1.5 leading-relaxed">
              Upload a resume to generate your initial career intelligence.
            </p>
            <Link
              href="/resume/builder?new=true"
              className="mt-5 inline-flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-black text-brand-navy bg-amber-500 hover:bg-amber-400 transition-all"
            >
              <span>Upload Resume</span>
              <ArrowRight size={13} />
            </Link>
          </div>
        ) : (
          <>
            {/* Career Summary */}
            <section className="bg-[var(--card)] border border-[var(--border)] rounded-2xl p-6 shadow-sm">
              <div className="flex items-center gap-3 mb-3">
                <div className="w-11 h-11 rounded-xl bg-amber-500/15 text-amber-500 flex items-center justify-center">
                  <Briefcase size={20} />
                </div>
                <div>
                  <div className="text-xs font-bold uppercase tracking-wider text-amber-600 dark:text-amber-400">
                    Current Profile · {currentRole}
                  </div>
                  <div className="text-sm text-[var(--text-secondary)] mt-0.5">
                    Initial Career Memory established from your uploaded resume.
                  </div>
                </div>
              </div>
              {data.summary && (
                <p className="text-xs text-[var(--text-secondary)] leading-relaxed line-clamp-3">
                  {data.summary}
                </p>
              )}
            </section>

            {/* Career Signals Grid */}
            <section className="space-y-4">
              <div>
                <div className="text-xs font-bold uppercase tracking-wider text-violet-600 dark:text-violet-400">
                  Career Intelligence Signals
                </div>
                <h2 className="text-xl sm:text-2xl font-bold tracking-tight text-[var(--text-primary)] font-['Syne',sans-serif]">
                  Initial Career Profile
                </h2>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
                {signals.map((sig) => {
                  const Icon = sig.icon;
                  return (
                    <div
                      key={sig.label}
                      className="bg-[var(--card)] border border-[var(--border)] rounded-2xl p-4 shadow-sm hover:shadow-md transition-all space-y-3"
                    >
                      <div className="flex items-center justify-between">
                        <Icon size={18} className={sig.color} />
                        <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${statusColor(sig.status)}`}>
                          {sig.status}
                        </span>
                      </div>
                      <div>
                        <div className="text-lg font-black text-[var(--text-primary)] font-['Syne',sans-serif]">
                          {sig.value}
                        </div>
                        <div className="text-[10px] font-bold uppercase tracking-wider text-[var(--text-muted)] mt-0.5">
                          {sig.label}
                        </div>
                      </div>
                      <div className="text-[10px] text-[var(--text-secondary)] leading-relaxed">
                        {sig.statusLabel}
                      </div>
                    </div>
                  );
                })}
              </div>
            </section>

            {/* Discovery Opportunities */}
            <section className="space-y-4">
              <div>
                <div className="text-xs font-bold uppercase tracking-wider text-amber-600 dark:text-amber-400">
                  What would you like to explore?
                </div>
                <h2 className="text-xl sm:text-2xl font-bold tracking-tight text-[var(--text-primary)] font-['Syne',sans-serif]">
                  Choose Your Next Action
                </h2>
                <p className="text-xs text-[var(--text-secondary)] mt-1">
                  All activities are optional and user-initiated. There's no mandatory goal or forced career path.
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {discoveryOptions.map((opt) => {
                  const Icon = opt.icon;
                  return (
                    <Link
                      key={opt.title}
                      href={opt.href}
                      className="bg-[var(--card)] border border-[var(--border)] rounded-2xl p-5 shadow-sm hover:border-amber-500/40 hover:shadow-md transition-all group no-underline flex flex-col justify-between"
                    >
                      <div>
                        <div className={`w-10 h-10 rounded-xl ${opt.color} border flex items-center justify-center mb-3`}>
                          <Icon size={18} />
                        </div>
                        <h3 className="text-sm font-bold text-[var(--text-primary)] group-hover:text-amber-500 transition-colors">
                          {opt.title}
                        </h3>
                        <p className="text-xs text-[var(--text-secondary)] mt-1 leading-relaxed">
                          {opt.desc}
                        </p>
                      </div>
                      <div className="mt-4 pt-3 border-t border-[var(--border)] flex items-center gap-1 text-xs font-bold text-amber-500 group-hover:translate-x-0.5 transition-transform">
                        <span>Explore</span>
                        <ChevronRight size={13} />
                      </div>
                    </Link>
                  );
                })}
              </div>
            </section>
          </>
        )}
      </main>
    </div>
  );
}
