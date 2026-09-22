"use client";

import { useEffect, useState, useMemo } from "react";
import { useRouter } from "next/navigation";
import Navbar from "@/components/Navbar";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/components/ui/toast-1";
import { ConfirmationModal } from "@/components/ui/ConfirmationModal";
import {
  Building2,
  Briefcase,
  Calendar,
  DollarSign,
  ExternalLink,
  FileText,
  CheckCircle2,
  Clock,
  ArrowRight,
  Trash2,
  Edit3,
  Target,
  Sparkles,
  Filter,
  Layers,
  TrendingUp,
  Award,
  X,
  Plus,
  Search,
  ChevronRight,
  AlertCircle,
  HelpCircle,
} from "lucide-react";

export interface JobApplication {
  id: string;
  company: string;
  role: string;
  salary: string;
  platform: string;
  date: string;
  status: "Applied" | "Interview" | "Offer" | "Rejected" | "Withdrawn";
  notes: string;
  reminders?: string;
  resume_id?: string;
  jd_text?: string;
  jd_url?: string;
  jd_match_score?: number;
}

export default function JobTracker() {
  const { user, loading: authLoading } = useAuth();
  const router = useRouter();
  const { showToast } = useToast();
  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null);

  // Job data states
  const [applications, setApplications] = useState<JobApplication[]>([]);
  const [resumes, setResumes] = useState<{ id: string; file_name: string }[]>([]);
  const [loading, setLoading] = useState(true);

  // Filter & Search states
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedPlatform, setSelectedPlatform] = useState("All");

  // Modal / Drawer states
  const [showDrawer, setShowDrawer] = useState(false);
  const [editingApp, setEditingApp] = useState<JobApplication | null>(null);

  // Form states
  const [company, setCompany] = useState("");
  const [roleName, setRoleName] = useState("");
  const [salary, setSalary] = useState("");
  const [platform, setPlatform] = useState("LinkedIn");
  const [status, setStatus] = useState<JobApplication["status"]>("Applied");
  const [date, setDate] = useState(new Date().toISOString().split("T")[0]);
  const [notes, setNotes] = useState("");
  const [resumeId, setResumeId] = useState("");
  const [jdText, setJdText] = useState("");
  const [jdUrl, setJdUrl] = useState("");
  const [jdMatchScore, setJdMatchScore] = useState<number | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (!authLoading && !user) {
      router.push("/login");
    }
  }, [authLoading, user, router]);

  const fetchApplications = async () => {
    if (!user) return;
    try {
      setLoading(true);
      const res = await fetch("/api/job-applications");
      const data = await res.json();
      if (Array.isArray(data)) {
        setApplications(data);
      }
    } catch (err) {
      console.error("Failed to load applications:", err);
    } finally {
      setLoading(false);
    }
  };

  const fetchResumes = async () => {
    if (!user) return;
    try {
      const res = await fetch("/api/get-resumes");
      const data = await res.json();
      if (Array.isArray(data)) {
        setResumes(data);
      }
    } catch (err) {
      console.error("Failed to load resumes:", err);
    }
  };

  useEffect(() => {
    if (user) {
      fetchApplications();
      fetchResumes();
    }
  }, [user]);

  // Open modal for Adding
  const openAddModal = (defaultStatus: JobApplication["status"] = "Applied") => {
    setEditingApp(null);
    setCompany("");
    setRoleName("");
    setSalary("");
    setPlatform("LinkedIn");
    setStatus(defaultStatus);
    setDate(new Date().toISOString().split("T")[0]);
    setNotes("");
    setResumeId(resumes.length > 0 ? resumes[0].id : "");
    setJdText("");
    setJdUrl("");
    setJdMatchScore(null);
    setShowDrawer(true);
  };

  // Open modal for Editing
  const openEditModal = (app: JobApplication) => {
    setEditingApp(app);
    setCompany(app.company);
    setRoleName(app.role);
    setSalary(app.salary || "");
    setPlatform(app.platform || "LinkedIn");
    setStatus(app.status);
    setDate(app.date);
    setNotes(app.notes || "");
    setResumeId(app.resume_id || "");
    setJdText(app.jd_text || "");
    setJdUrl(app.jd_url || "");
    setJdMatchScore(app.jd_match_score ?? null);
    setShowDrawer(true);
  };

  const handleFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!company.trim() || !roleName.trim()) return;

    setIsSubmitting(true);
    try {
      if (editingApp) {
        // Update existing application
        const res = await fetch("/api/job-applications", {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            id: editingApp.id,
            company,
            role: roleName,
            salary,
            platform,
            date,
            status,
            notes,
            resume_id: resumeId || null,
            jd_text: jdText || null,
            jd_url: jdUrl || null,
            jd_match_score: jdMatchScore,
          }),
        });

        if (!res.ok) throw new Error("Failed to update application");
        const updated = await res.json();
        setApplications((prev) => prev.map((app) => (app.id === updated.id ? updated : app)));
        showToast("Opportunity updated successfully.", "success");
      } else {
        // Add new application
        const res = await fetch("/api/job-applications", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            company,
            role: roleName,
            salary,
            platform,
            date,
            status,
            notes,
            resume_id: resumeId || null,
            jd_text: jdText || null,
            jd_url: jdUrl || null,
          }),
        });

        if (!res.ok) throw new Error("Failed to add job application");
        const newApp = await res.json();
        setApplications((prev) => [newApp, ...prev]);
        showToast("Target opportunity added to your pipeline.", "success");
      }

      setShowDrawer(false);
      setEditingApp(null);
    } catch (err) {
      console.error(err);
      showToast("Error saving application. Please try again.", "error");
    } finally {
      setIsSubmitting(false);
    }
  };

  const updateStatusQuick = async (app: JobApplication, newStatus: JobApplication["status"]) => {
    try {
      const res = await fetch("/api/job-applications", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...app,
          status: newStatus,
        }),
      });

      if (!res.ok) throw new Error("Failed to update status");
      const updated = await res.json();
      setApplications((prev) => prev.map((a) => (a.id === updated.id ? updated : a)));
      showToast(`Moved to ${newStatus}.`, "success");
    } catch (err) {
      console.error(err);
      showToast("Failed to change status.", "error");
    }
  };

  const executeDelete = async (id: string) => {
    try {
      const res = await fetch(`/api/job-applications?id=${id}`, {
        method: "DELETE",
      });

      if (!res.ok) throw new Error("Failed to delete application");
      setApplications((prev) => prev.filter((app) => app.id !== id));
      setShowDrawer(false);
      setEditingApp(null);
      showToast("Opportunity removed from pipeline.", "success");
    } catch (err) {
      console.error(err);
      showToast("Failed to delete application.", "error");
    }
  };

  // Compute metrics
  const totalApps = applications.length;
  const interviews = applications.filter((a) => a.status === "Interview").length;
  const offers = applications.filter((a) => a.status === "Offer").length;
  const activeApps = applications.filter((a) => a.status === "Applied" || a.status === "Interview").length;

  const nonWithdrawn = applications.filter((a) => a.status !== "Withdrawn").length;
  const responseRate =
    nonWithdrawn > 0 ? Math.round(((interviews + offers) / nonWithdrawn) * 100) : 0;

  // Filtered applications
  const filteredApps = useMemo(() => {
    return applications.filter((app) => {
      const matchesSearch =
        searchQuery.trim() === "" ||
        app.company.toLowerCase().includes(searchQuery.toLowerCase()) ||
        app.role.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (app.notes && app.notes.toLowerCase().includes(searchQuery.toLowerCase()));

      const matchesPlatform =
        selectedPlatform === "All" || app.platform === selectedPlatform;

      return matchesSearch && matchesPlatform;
    });
  }, [applications, searchQuery, selectedPlatform]);

  const columns: {
    title: string;
    stageLabel: string;
    key: JobApplication["status"];
    color: string;
    badgeBg: string;
    badgeBorder: string;
    emptyHint: string;
  }[] = [
    {
      title: "Applied",
      stageLabel: "DISCOVER & REACH",
      key: "Applied",
      color: "#2563EB",
      badgeBg: "rgba(37, 99, 235, 0.12)",
      badgeBorder: "rgba(37, 99, 235, 0.25)",
      emptyHint: "No active submissions. Tailor a resume and log target roles.",
    },
    {
      title: "Evaluating & Interviews",
      stageLabel: "PURSUE · VELOCITY",
      key: "Interview",
      color: "#F59E0B",
      badgeBg: "rgba(245, 158, 11, 0.12)",
      badgeBorder: "rgba(245, 158, 11, 0.25)",
      emptyHint: "No interviews active. Advance applications with follow-ups.",
    },
    {
      title: "Offers Secured",
      stageLabel: "ACHIEVE · OUTCOME",
      key: "Offer",
      color: "#14B8A6",
      badgeBg: "rgba(20, 184, 166, 0.12)",
      badgeBorder: "rgba(20, 184, 166, 0.25)",
      emptyHint: "Offers will appear here. Calibrate compensation leverage in Copilot.",
    },
    {
      title: "Archived / Closed",
      stageLabel: "EVIDENCE & REVIEW",
      key: "Rejected",
      color: "#64748B",
      badgeBg: "rgba(100, 116, 139, 0.12)",
      badgeBorder: "rgba(100, 116, 139, 0.25)",
      emptyHint: "No archived pursuits.",
    },
    {
      title: "Withdrawn",
      stageLabel: "PRIORITY SHIFT",
      key: "Withdrawn",
      color: "#94A3B8",
      badgeBg: "rgba(148, 163, 184, 0.12)",
      badgeBorder: "rgba(148, 163, 184, 0.25)",
      emptyHint: "No withdrawn opportunities.",
    },
  ];

  if (authLoading || !user) {
    return (
      <div className="min-h-screen bg-[var(--bg-page)] flex items-center justify-center">
        <div className="spinner" style={{ width: 40, height: 40 }} />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[var(--bg-page)] text-[var(--text-primary)] relative overflow-hidden flex flex-col font-sans selection:bg-[#F59E0B] selection:text-[#101B3B]">
      <div className="relative z-10 flex flex-col min-h-screen">
        <Navbar />

        <main className="flex-1 max-w-7xl mx-auto w-full px-4 sm:px-6 lg:px-8 py-8 md:py-10">
          {/* EXECUTIVE HEADER */}
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 pb-6 border-b border-[var(--border)] mb-8">
            <div className="space-y-2">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-500/10 border border-amber-500/25 text-amber-600 dark:text-amber-400 text-xs font-bold uppercase tracking-wider">
                <Sparkles size={12} className="text-amber-500" />
                <span>PURSUE · OPPORTUNITY PIPELINE & PURSUIT TRACKER</span>
              </div>
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#101B3B] to-[#2563EB] flex items-center justify-center text-white shadow-md border border-white/10 shrink-0">
                  <Target size={20} className="text-amber-400" />
                </div>
                <div>
                  <h1 className="text-2xl md:text-3xl font-extrabold tracking-tight text-[var(--text-primary)] font-['Syne',sans-serif]">
                    Opportunity Pipeline
                  </h1>
                </div>
              </div>
              <p className="text-sm text-[var(--text-muted)] max-w-2xl leading-relaxed">
                Deploy your Career Value into high-leverage market opportunities. Track interview velocity, calibrate JD alignment, and secure compensation leverage.
              </p>
            </div>

            <div className="flex items-center gap-3 self-start md:self-center shrink-0">
              <button
                onClick={() => openAddModal("Applied")}
                className="btn-primary inline-flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-bold shadow-lg shadow-amber-500/20 hover:scale-[1.02] active:scale-[0.98] transition-all cursor-pointer"
              >
                <Plus size={16} />
                <span>+ Add Target Opportunity</span>
              </button>
            </div>
          </div>

          {/* EXECUTIVE VELOCITY & MOMENTUM BAR */}
          <div className="bg-[var(--bg-elevated)] border border-[var(--border)] rounded-2xl p-4 md:p-5 shadow-sm backdrop-blur-xl mb-8 relative overflow-hidden">
            <div className="absolute top-0 left-0 right-0 h-[2px] bg-gradient-to-r from-[#2563EB] via-[#F59E0B] to-[#14B8A6]" />
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4 md:gap-6 divide-y sm:divide-y-0 sm:divide-x divide-[var(--border)]">
              
              {/* Stat 1: Total Opportunities */}
              <div className="pt-2 sm:pt-0 sm:px-3 first:px-0">
                <div className="flex items-center gap-2 mb-1.5 text-xs font-bold text-[var(--text-muted)] uppercase tracking-wider">
                  <div className="w-5 h-5 rounded-md bg-blue-500/10 text-blue-500 flex items-center justify-center">
                    <Layers size={11} />
                  </div>
                  <span>Target Roles</span>
                </div>
                <div className="text-2xl md:text-3xl font-black text-[var(--text-primary)]">
                  {totalApps}
                </div>
                <div className="text-[11px] text-[var(--text-muted)] mt-0.5">
                  Total pipeline volume
                </div>
              </div>

              {/* Stat 2: Active Pipeline */}
              <div className="pt-2 sm:pt-0 sm:px-3">
                <div className="flex items-center gap-2 mb-1.5 text-xs font-bold text-[var(--text-muted)] uppercase tracking-wider">
                  <div className="w-5 h-5 rounded-md bg-amber-500/10 text-amber-500 flex items-center justify-center">
                    <Briefcase size={11} />
                  </div>
                  <span>Active Pipeline</span>
                </div>
                <div className="text-2xl md:text-3xl font-black text-amber-500">
                  {activeApps}
                </div>
                <div className="text-[11px] text-[var(--text-muted)] mt-0.5">
                  Applied + Interview loops
                </div>
              </div>

              {/* Stat 3: Interview Velocity */}
              <div className="pt-2 sm:pt-0 sm:px-3">
                <div className="flex items-center gap-2 mb-1.5 text-xs font-bold text-[var(--text-muted)] uppercase tracking-wider">
                  <div className="w-5 h-5 rounded-md bg-amber-500/15 text-amber-600 dark:text-amber-400 flex items-center justify-center">
                    <TrendingUp size={11} />
                  </div>
                  <span>Interview Velocity</span>
                </div>
                <div className="text-2xl md:text-3xl font-black text-amber-600 dark:text-amber-400">
                  {interviews}
                </div>
                <div className="text-[11px] text-[var(--text-muted)] mt-0.5">
                  Active interview cycles
                </div>
              </div>

              {/* Stat 4: Pipeline Conversion */}
              <div className="pt-2 sm:pt-0 sm:px-3">
                <div className="flex items-center gap-2 mb-1.5 text-xs font-bold text-[var(--text-muted)] uppercase tracking-wider">
                  <div className="w-5 h-5 rounded-md bg-teal-500/10 text-teal-500 flex items-center justify-center">
                    <CheckCircle2 size={11} />
                  </div>
                  <span>Conversion Rate</span>
                </div>
                <div className="text-2xl md:text-3xl font-black text-teal-500">
                  {responseRate}%
                </div>
                <div className="text-[11px] text-[var(--text-muted)] mt-0.5">
                  Advancement beyond apply
                </div>
              </div>

              {/* Stat 5: Offers Secured */}
              <div className="pt-2 sm:pt-0 sm:px-3">
                <div className="flex items-center gap-2 mb-1.5 text-xs font-bold text-[var(--text-muted)] uppercase tracking-wider">
                  <div className="w-5 h-5 rounded-md bg-teal-500/15 text-teal-600 dark:text-teal-400 flex items-center justify-center">
                    <Award size={11} />
                  </div>
                  <span>Offers Secured</span>
                </div>
                <div className="text-2xl md:text-3xl font-black text-teal-600 dark:text-teal-400">
                  {offers}
                </div>
                <div className="text-[11px] text-[var(--text-muted)] mt-0.5">
                  Career outcomes & leverage
                </div>
              </div>

            </div>
          </div>

          {/* SEARCH & PLATFORM FILTERS */}
          <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-4 mb-6">
            <div className="relative flex-1 max-w-md">
              <Search size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[var(--text-muted)] pointer-events-none" />
              <input
                type="text"
                placeholder="Search company, role title, or notes..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2 rounded-xl bg-[var(--bg-elevated)] border border-[var(--border)] text-sm text-[var(--text-primary)] placeholder-[var(--text-muted)] focus:outline-none focus:border-amber-500/50 transition-all"
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery("")}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-[var(--text-muted)] hover:text-[var(--text-primary)] text-xs"
                >
                  <X size={14} />
                </button>
              )}
            </div>

            <div className="flex items-center gap-1.5 overflow-x-auto pb-1 [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden">
              <span className="text-xs font-semibold text-[var(--text-muted)] flex items-center gap-1 mr-1 shrink-0">
                <Filter size={12} /> Platform:
              </span>
              {["All", "LinkedIn", "Naukri", "Direct Career Portal", "Instahyre", "Indeed"].map((plat) => {
                const label = plat === "Direct Career Portal" ? "Direct / Referral" : plat;
                const active = selectedPlatform === plat;
                return (
                  <button
                    key={plat}
                    onClick={() => setSelectedPlatform(plat)}
                    className={`px-3 py-1 rounded-lg text-xs font-semibold shrink-0 transition-all cursor-pointer ${
                      active
                        ? "bg-amber-500/15 text-amber-600 dark:text-amber-400 border border-amber-500/30"
                        : "bg-[var(--bg-elevated)] text-[var(--text-muted)] hover:text-[var(--text-primary)] border border-[var(--border)]"
                    }`}
                  >
                    {label}
                  </button>
                );
              })}
            </div>
          </div>

          {/* KANBAN BOARD */}
          {loading ? (
            <div className="text-center py-20 bg-[var(--bg-elevated)] rounded-2xl border border-[var(--border)]">
              <div className="spinner mx-auto" style={{ width: 32, height: 32 }} />
              <p className="mt-3 text-sm text-[var(--text-muted)] font-medium">Calibrating your opportunity pipeline...</p>
            </div>
          ) : applications.length === 0 ? (
            /* ZERO STATE */
            <div className="text-center py-16 px-4 bg-[var(--bg-elevated)] border border-[var(--border)] rounded-2xl backdrop-blur-xl">
              <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-[#101B3B] to-[#2563EB] text-white flex items-center justify-center mx-auto mb-4 shadow-lg border border-white/10">
                <Target size={30} className="text-amber-400" />
              </div>
              <h3 className="text-xl font-extrabold text-[var(--text-primary)] font-['Syne',sans-serif]">
                Your Opportunity Pipeline is Empty
              </h3>
              <p className="text-sm text-[var(--text-muted)] max-w-md mx-auto mt-2 leading-relaxed">
                Turn your career strategy into real-world momentum. Track target opportunities, calibrate JD alignment scores, and accelerate interview velocity.
              </p>
              <button
                onClick={() => openAddModal("Applied")}
                className="btn-primary mt-6 inline-flex items-center gap-2 px-6 py-3 rounded-xl text-sm font-bold shadow-lg shadow-amber-500/25"
              >
                <Plus size={16} />
                <span>+ Log Your First Target Opportunity</span>
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-5 items-start">
              {columns.map((col) => {
                const colApps = filteredApps.filter((app) => app.status === col.key);
                return (
                  <div
                    key={col.key}
                    className="bg-[var(--bg-elevated)] rounded-2xl border border-[var(--border)] flex flex-col min-h-[580px] shadow-sm backdrop-blur-xl overflow-hidden"
                  >
                    {/* Column Header */}
                    <div className="p-3.5 border-b border-[var(--border)] flex items-center justify-between relative">
                      <div
                        className="absolute top-0 left-0 right-0 h-[3px]"
                        style={{ backgroundColor: col.color }}
                      />
                      <div className="flex items-center gap-2">
                        <span
                          className="w-2.5 h-2.5 rounded-full"
                          style={{ backgroundColor: col.color }}
                        />
                        <div>
                          <h2 className="text-xs font-extrabold text-[var(--text-primary)] tracking-tight">
                            {col.title}
                          </h2>
                          <div className="text-[10px] text-[var(--text-muted)] font-semibold uppercase tracking-wider">
                            {col.stageLabel}
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center gap-1.5">
                        <span className="text-[11px] font-bold px-2 py-0.5 rounded-md bg-[var(--bg-page)] text-[var(--text-secondary)] border border-[var(--border)]">
                          {colApps.length}
                        </span>
                        <button
                          onClick={() => openAddModal(col.key)}
                          className="p-1 rounded-md text-[var(--text-muted)] hover:text-amber-500 hover:bg-amber-500/10 transition-colors"
                          title={`Add to ${col.title}`}
                        >
                          <Plus size={14} />
                        </button>
                      </div>
                    </div>

                    {/* Column Body Cards */}
                    <div className="p-3 flex flex-col gap-3 flex-1 overflow-y-auto max-h-[calc(100vh-280px)]">
                      {colApps.length === 0 ? (
                        <div className="text-center py-10 px-3 border border-dashed border-[var(--border)] rounded-xl text-xs text-[var(--text-muted)] flex flex-col items-center justify-center gap-1.5 my-auto">
                          <AlertCircle size={18} className="opacity-40 mb-1" />
                          <p className="leading-snug">{col.emptyHint}</p>
                          <button
                            onClick={() => openAddModal(col.key)}
                            className="mt-2 text-[11px] font-bold text-amber-500 hover:underline flex items-center gap-1"
                          >
                            <Plus size={12} /> Add {col.title}
                          </button>
                        </div>
                      ) : (
                        colApps.map((app) => {
                          const linkedResumeName = resumes.find((r) => r.id === app.resume_id)?.file_name;
                          return (
                            <div
                              key={app.id}
                              onClick={() => openEditModal(app)}
                              className="group relative p-3.5 rounded-xl bg-[var(--bg-page)] border border-[var(--border)] hover:border-amber-500/40 hover:shadow-md transition-all duration-200 cursor-pointer flex flex-col gap-2.5"
                            >
                              {/* Top Bar: Avatar, Company, Platform */}
                              <div className="flex items-start justify-between gap-2">
                                <div className="flex items-center gap-2 min-w-0">
                                  <div className="w-8 h-8 rounded-lg bg-[var(--bg-elevated)] border border-[var(--border)] flex items-center justify-center text-xs font-black text-[var(--text-primary)] shrink-0 shadow-xs">
                                    {app.company.substring(0, 1).toUpperCase()}
                                  </div>
                                  <div className="min-w-0">
                                    <h3 className="font-extrabold text-sm text-[var(--text-primary)] truncate group-hover:text-amber-500 transition-colors leading-tight">
                                      {app.company}
                                    </h3>
                                    <span className="text-[10px] font-semibold text-[var(--text-muted)] px-1.5 py-0.2 rounded bg-[var(--bg-elevated)] border border-[var(--border)] inline-block mt-0.5">
                                      {app.platform}
                                    </span>
                                  </div>
                                </div>

                                <div className="shrink-0">
                                  {app.jd_match_score !== undefined && app.jd_match_score !== null && (
                                    <span
                                      className={`text-[10px] font-extrabold px-2 py-0.5 rounded-md flex items-center gap-1 border ${
                                        app.jd_match_score >= 70
                                          ? "bg-teal-500/10 text-teal-600 dark:text-teal-400 border-teal-500/30"
                                          : app.jd_match_score >= 45
                                          ? "bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/30"
                                          : "bg-rose-500/10 text-rose-600 dark:text-rose-400 border-rose-500/30"
                                      }`}
                                    >
                                      🎯 {app.jd_match_score}% Match
                                    </span>
                                  )}
                                </div>
                              </div>

                              {/* Role Title */}
                              <div className="text-xs font-semibold text-[var(--text-secondary)] line-clamp-1">
                                {app.role}
                              </div>

                              {/* Linked Resume or JD url pill */}
                              {linkedResumeName && (
                                <div className="text-[10px] text-[var(--text-muted)] flex items-center gap-1 bg-[var(--bg-elevated)] px-2 py-0.5 rounded border border-[var(--border)] truncate">
                                  <FileText size={10} className="text-blue-400 shrink-0" />
                                  <span className="truncate">{linkedResumeName}</span>
                                </div>
                              )}

                              {/* Compensation & Date */}
                              <div className="flex items-center justify-between text-[11px] pt-2 border-t border-[var(--border)]">
                                <span className="font-bold text-amber-600 dark:text-amber-400 flex items-center gap-1">
                                  {app.salary ? `₹ ${app.salary}` : "LPA uncalibrated"}
                                </span>
                                <span className="text-[10px] text-[var(--text-muted)] flex items-center gap-1">
                                  <Clock size={10} />
                                  {app.date}
                                </span>
                              </div>

                              {/* Quick Move Action Pills */}
                              <div
                                className="pt-2 border-t border-[var(--border)] flex items-center gap-1 flex-wrap"
                                onClick={(e) => e.stopPropagation()}
                              >
                                {columns
                                  .filter((c) => c.key !== col.key)
                                  .slice(0, 3)
                                  .map((c) => (
                                    <button
                                      key={c.key}
                                      onClick={() => updateStatusQuick(app, c.key)}
                                      className="text-[10px] font-semibold px-2 py-0.5 rounded bg-[var(--bg-elevated)] hover:bg-amber-500/10 hover:text-amber-500 border border-[var(--border)] text-[var(--text-muted)] transition-colors"
                                      title={`Move to ${c.title}`}
                                    >
                                      → {c.title.split(" ")[0]}
                                    </button>
                                  ))}
                              </div>
                            </div>
                          );
                        })
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </main>

        {/* EXECUTIVE OPPORTUNITY DRAWER / MODAL */}
        {showDrawer && (
          <>
            {/* Backdrop */}
            <div
              onClick={() => {
                setShowDrawer(false);
                setEditingApp(null);
              }}
              className="fixed inset-0 bg-black/60 backdrop-blur-xs z-50 transition-opacity"
            />

            {/* Slide-over Container */}
            <div className="fixed inset-y-0 right-0 w-full max-w-lg bg-[var(--bg-elevated)] border-l border-[var(--border)] shadow-2xl z-50 flex flex-col justify-between overflow-hidden animate-in slide-in-from-right duration-200">
              
              {/* Drawer Header */}
              <div className="p-5 border-b border-[var(--border)] flex items-center justify-between bg-[var(--bg-page)]/50">
                <div className="space-y-1">
                  <div className="inline-flex items-center gap-1.5 text-[10px] font-bold text-amber-500 uppercase tracking-wider">
                    <Sparkles size={11} />
                    <span>{editingApp ? "PURSUIT SPECIFICATION" : "NEW TARGET PURSUIT"}</span>
                  </div>
                  <h3 className="text-lg font-extrabold text-[var(--text-primary)] font-['Syne',sans-serif]">
                    {editingApp ? "Edit Target Opportunity" : "Log Target Opportunity"}
                  </h3>
                </div>
                <button
                  onClick={() => {
                    setShowDrawer(false);
                    setEditingApp(null);
                  }}
                  className="p-1.5 rounded-lg text-[var(--text-muted)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-elevated)] transition-colors"
                >
                  <X size={18} />
                </button>
              </div>

              {/* Form Body */}
              <form onSubmit={handleFormSubmit} className="flex-1 overflow-y-auto p-5 space-y-5">
                
                {/* Section 1: Overview */}
                <div className="space-y-3">
                  <div className="text-xs font-extrabold text-[var(--text-muted)] uppercase tracking-wider flex items-center gap-1.5">
                    <Building2 size={13} className="text-amber-500" />
                    <span>Opportunity Core</span>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div className="space-y-1">
                      <label className="text-xs font-semibold text-[var(--text-secondary)]">
                        Company Name *
                      </label>
                      <input
                        required
                        type="text"
                        placeholder="e.g. Microsoft India, CRED"
                        value={company}
                        onChange={(e) => setCompany(e.target.value)}
                        className="w-full px-3 py-2 rounded-xl bg-[var(--bg-page)] border border-[var(--border)] text-sm text-[var(--text-primary)] focus:outline-none focus:border-amber-500/50"
                      />
                    </div>

                    <div className="space-y-1">
                      <label className="text-xs font-semibold text-[var(--text-secondary)]">
                        Role Title *
                      </label>
                      <input
                        required
                        type="text"
                        placeholder="e.g. Lead Product Engineer"
                        value={roleName}
                        onChange={(e) => setRoleName(e.target.value)}
                        className="w-full px-3 py-2 rounded-xl bg-[var(--bg-page)] border border-[var(--border)] text-sm text-[var(--text-primary)] focus:outline-none focus:border-amber-500/50"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div className="space-y-1">
                      <label className="text-xs font-semibold text-[var(--text-secondary)]">
                        Source Platform
                      </label>
                      <select
                        value={platform}
                        onChange={(e) => setPlatform(e.target.value)}
                        className="w-full px-3 py-2 rounded-xl bg-[var(--bg-page)] border border-[var(--border)] text-sm text-[var(--text-primary)] focus:outline-none focus:border-amber-500/50"
                      >
                        <option value="LinkedIn">LinkedIn</option>
                        <option value="Naukri">Naukri</option>
                        <option value="Direct Career Portal">Direct / Referral</option>
                        <option value="Instahyre">Instahyre</option>
                        <option value="Indeed">Indeed India</option>
                        <option value="Other">Other Executive Network</option>
                      </select>
                    </div>

                    <div className="space-y-1">
                      <label className="text-xs font-semibold text-[var(--text-secondary)]">
                        Applied Date
                      </label>
                      <input
                        type="date"
                        value={date}
                        onChange={(e) => setDate(e.target.value)}
                        className="w-full px-3 py-2 rounded-xl bg-[var(--bg-page)] border border-[var(--border)] text-sm text-[var(--text-primary)] focus:outline-none focus:border-amber-500/50"
                      />
                    </div>
                  </div>
                </div>

                {/* Section 2: Strategic Fit & AI Match */}
                <div className="space-y-3 pt-3 border-t border-[var(--border)]">
                  <div className="text-xs font-extrabold text-[var(--text-muted)] uppercase tracking-wider flex items-center gap-1.5">
                    <Target size={13} className="text-blue-500" />
                    <span>Strategic Fit & Alignment</span>
                  </div>

                  <div className="space-y-1">
                    <label className="text-xs font-semibold text-[var(--text-secondary)]">
                      Link Tailored Resume
                    </label>
                    <select
                      value={resumeId}
                      onChange={(e) => setResumeId(e.target.value)}
                      className="w-full px-3 py-2 rounded-xl bg-[var(--bg-page)] border border-[var(--border)] text-sm text-[var(--text-primary)] focus:outline-none focus:border-amber-500/50"
                    >
                      <option value="">-- Select Baseline / Tailored Resume --</option>
                      {resumes.map((r) => (
                        <option key={r.id} value={r.id}>
                          {r.file_name}
                        </option>
                      ))}
                    </select>
                  </div>

                  {jdMatchScore !== null && (
                    <div className="p-3 rounded-xl bg-teal-500/10 border border-teal-500/25 flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <div className="w-7 h-7 rounded-lg bg-teal-500 text-white flex items-center justify-center font-bold text-xs">
                          🎯
                        </div>
                        <div>
                          <div className="text-xs font-bold text-teal-600 dark:text-teal-400">
                            AI Job Description Alignment
                          </div>
                          <div className="text-[11px] text-[var(--text-muted)]">
                            Workday & Greenhouse ATS calibrated
                          </div>
                        </div>
                      </div>
                      <div className="text-base font-black text-teal-600 dark:text-teal-400">
                        {jdMatchScore}%
                      </div>
                    </div>
                  )}

                  <div className="space-y-1">
                    <label className="text-xs font-semibold text-[var(--text-secondary)]">
                      Job Description URL (Optional)
                    </label>
                    <input
                      type="url"
                      placeholder="https://careers.google.com/jobs/..."
                      value={jdUrl}
                      onChange={(e) => setJdUrl(e.target.value)}
                      className="w-full px-3 py-2 rounded-xl bg-[var(--bg-page)] border border-[var(--border)] text-sm text-[var(--text-primary)] focus:outline-none focus:border-amber-500/50"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-xs font-semibold text-[var(--text-secondary)]">
                      Job Description & Requirements
                    </label>
                    <textarea
                      rows={3}
                      placeholder="Paste JD requirements here to trigger AI match analysis..."
                      value={jdText}
                      onChange={(e) => setJdText(e.target.value)}
                      className="w-full px-3 py-2 rounded-xl bg-[var(--bg-page)] border border-[var(--border)] text-sm text-[var(--text-primary)] focus:outline-none focus:border-amber-500/50 leading-relaxed"
                    />
                  </div>
                </div>

                {/* Section 3: Compensation & Stage */}
                <div className="space-y-3 pt-3 border-t border-[var(--border)]">
                  <div className="text-xs font-extrabold text-[var(--text-muted)] uppercase tracking-wider flex items-center gap-1.5">
                    <DollarSign size={13} className="text-amber-500" />
                    <span>Compensation & Status</span>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div className="space-y-1">
                      <label className="text-xs font-semibold text-[var(--text-secondary)]">
                        Target Salary Bracket
                      </label>
                      <input
                        type="text"
                        placeholder="e.g. 28-35 LPA"
                        value={salary}
                        onChange={(e) => setSalary(e.target.value)}
                        className="w-full px-3 py-2 rounded-xl bg-[var(--bg-page)] border border-[var(--border)] text-sm text-[var(--text-primary)] focus:outline-none focus:border-amber-500/50"
                      />
                    </div>

                    <div className="space-y-1">
                      <label className="text-xs font-semibold text-[var(--text-secondary)]">
                        Current Stage
                      </label>
                      <select
                        value={status}
                        onChange={(e) => setStatus(e.target.value as any)}
                        className="w-full px-3 py-2 rounded-xl bg-[var(--bg-page)] border border-[var(--border)] text-sm text-[var(--text-primary)] focus:outline-none focus:border-amber-500/50"
                      >
                        <option value="Applied">Applied (Submissions)</option>
                        <option value="Interview">Evaluating & Interviews</option>
                        <option value="Offer">Offer Secured</option>
                        <option value="Rejected">Archived / Closed</option>
                        <option value="Withdrawn">Withdrawn / Paused</option>
                      </select>
                    </div>
                  </div>
                </div>

                {/* Section 4: Notes */}
                <div className="space-y-2 pt-3 border-t border-[var(--border)]">
                  <label className="text-xs font-semibold text-[var(--text-secondary)]">
                    Strategic Pursuit Notes & Follow-ups
                  </label>
                  <textarea
                    rows={3}
                    placeholder="Recruiter contact, interview panel discussion points, next round dates..."
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl bg-[var(--bg-page)] border border-[var(--border)] text-sm text-[var(--text-primary)] focus:outline-none focus:border-amber-500/50 leading-relaxed"
                  />
                </div>

                {/* Submit button inside form */}
                <div className="pt-4 border-t border-[var(--border)] flex items-center justify-between gap-3">
                  {editingApp ? (
                    <button
                      type="button"
                      onClick={() => setDeleteConfirmId(editingApp.id)}
                      className="px-3 py-2 rounded-xl text-xs font-bold text-rose-500 hover:bg-rose-500/10 transition-colors flex items-center gap-1.5"
                    >
                      <Trash2 size={14} /> Delete
                    </button>
                  ) : (
                    <div />
                  )}

                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => {
                        setShowDrawer(false);
                        setEditingApp(null);
                      }}
                      className="px-4 py-2 rounded-xl text-xs font-bold text-[var(--text-muted)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-page)] transition-colors cursor-pointer"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      disabled={isSubmitting}
                      className="btn-primary px-5 py-2.5 rounded-xl text-xs font-bold shadow-md shadow-amber-500/20 cursor-pointer"
                    >
                      {isSubmitting ? "Saving..." : editingApp ? "Save Changes" : "+ Add Opportunity"}
                    </button>
                  </div>
                </div>

              </form>
            </div>
          </>
        )}

        {/* DELETE CONFIRMATION MODAL */}
        <ConfirmationModal
          isOpen={deleteConfirmId !== null}
          title="Delete Target Opportunity?"
          message="Are you sure you want to remove this opportunity from your pursuit pipeline? All progress history and linked notes will be permanently removed."
          confirmLabel="Delete Opportunity"
          cancelLabel="Cancel"
          isDanger={true}
          onConfirm={() => {
            if (deleteConfirmId) {
              executeDelete(deleteConfirmId);
              setDeleteConfirmId(null);
            }
          }}
          onCancel={() => setDeleteConfirmId(null)}
        />
      </div>
    </div>
  );
}
