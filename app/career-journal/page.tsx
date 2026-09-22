"use client";
import { useEffect, useState, useMemo } from "react";
import { useRouter } from "next/navigation";
import Navbar from "@/components/Navbar";
import { useAuth } from "@/hooks/useAuth";
import {
  BookOpen, Plus, Calendar, Tag, ChevronRight, Award, Zap, TrendingUp,
  AlertTriangle, Search, Filter, Pencil, Trash2, Sparkles, Star, FileText,
  Briefcase, GraduationCap, MessageSquare, Target, Check, Copy, Shield,
  Layers, ArrowUpRight, BarChart3
} from "lucide-react";
import { CareerJournalEntry } from "@/types";
import { useToast } from "@/components/ui/toast-1";
import QuickEntryModal from "@/components/career-journal/QuickEntryModal";
import ProofVault from "@/components/career-journal/ProofVault";
import StreakIndicator from "@/components/career-journal/StreakIndicator";
import AchievementRadar from "@/components/career-journal/AchievementRadar";
import ProjectSync from "@/components/career-journal/ProjectSync";

export default function CareerJournalPage() {
  const { user, loading: authLoading } = useAuth();
  const router = useRouter();
  const { showToast } = useToast();

  const [entries, setEntries] = useState<CareerJournalEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [showQuickEntry, setShowQuickEntry] = useState(false);
  const [prefilledContent, setPrefilledContent] = useState("");
  const [prefilledType, setPrefilledType] = useState<any>("win");
  const [generatedPromptStr, setGeneratedPromptStr] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [filterDimension, setFilterDimension] = useState<string>("all");
  const [editEntry, setEditEntry] = useState<CareerJournalEntry | null>(null);
  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null);
  const [copiedId, setCopiedId] = useState<string | null>(null);

  useEffect(() => {
    if (!authLoading && !user) {
      router.push("/login");
    }
  }, [authLoading, user, router]);

  useEffect(() => {
    if (user) {
      fetchEntries();
    }
  }, [user]);

  const fetchEntries = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/journal/list");
      if (res.ok) {
        const data = await res.json();
        setEntries(data.entries || []);
      }
    } catch (err) {
      console.error(err);
      showToast("Failed to load journal entries.", "error");
    } finally {
      setLoading(false);
    }
  };

  const handleSaveEntry = async (entry: Partial<CareerJournalEntry>) => {
    try {
      const isEdit = !!entry.id;
      const res = await fetch(isEdit ? "/api/journal/update" : "/api/journal/create", {
        method: isEdit ? "PUT" : "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(entry),
      });
      if (res.ok) {
        showToast(isEdit ? "Career event updated!" : "Career event saved!", "success");
        setEditEntry(null);
        fetchEntries();
      } else {
        throw new Error("Failed to save entry");
      }
    } catch (err) {
      console.error(err);
      showToast("Failed to save entry. Try again.", "error");
    }
  };

  const handleDeleteEntry = async (id: string) => {
    try {
      const res = await fetch("/api/journal/delete", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id }),
      });
      if (res.ok) {
        showToast("Career event deleted.", "success");
        setDeleteConfirmId(null);
        fetchEntries();
      } else {
        throw new Error();
      }
    } catch {
      showToast("Failed to delete entry.", "error");
    }
  };

  const handleCopyBullet = (entry: CareerJournalEntry) => {
    // Format entry as a clean professional resume bullet
    const bulletText = `• ${entry.content.replace(/\n+/g, " ")}`;
    navigator.clipboard.writeText(bulletText);
    setCopiedId(entry.id);
    showToast("Copied as resume bullet!", "success");
    setTimeout(() => setCopiedId(null), 2500);
  };

  const handleProofVaultExtracted = (text: string) => {
    setPrefilledContent(text);
    setPrefilledType("feedback");
    setShowQuickEntry(true);
  };

  const handleSparkClick = (type: string, promptStarter: string) => {
    setPrefilledType(type);
    setPrefilledContent(promptStarter);
    setShowQuickEntry(true);
  };

  // UpRole Dimension mapping
  const getEntryDimension = (type: string): "achieve" | "develop" | "evidence" | "resilience" | "other" => {
    switch (type) {
      case "win":
      case "impact":
      case "promotion":
      case "award":
        return "achieve";
      case "skill":
      case "certification":
      case "mentorship":
        return "develop";
      case "feedback":
      case "project":
      case "publication":
        return "evidence";
      case "gap":
        return "resilience";
      default:
        return "other";
    }
  };

  const getTypeIcon = (type: string) => {
    const iconProps = { size: 18 };
    switch (type) {
      case "win":
      case "award":
        return <Award {...iconProps} style={{ color: "var(--brand-amber, #F59E0B)" }} />;
      case "impact":
        return <BarChart3 {...iconProps} style={{ color: "var(--brand-amber, #F59E0B)" }} />;
      case "skill":
        return <Zap {...iconProps} style={{ color: "var(--uprole-teal, #14B8A6)" }} />;
      case "promotion":
        return <TrendingUp {...iconProps} style={{ color: "var(--brand-amber, #F59E0B)" }} />;
      case "gap":
        return <AlertTriangle {...iconProps} style={{ color: "#EF4444" }} />;
      case "project":
        return <Briefcase {...iconProps} style={{ color: "var(--uprole-blue, #2563EB)" }} />;
      case "feedback":
        return <MessageSquare {...iconProps} style={{ color: "var(--uprole-blue, #2563EB)" }} />;
      case "certification":
        return <GraduationCap {...iconProps} style={{ color: "var(--uprole-teal, #14B8A6)" }} />;
      case "mentorship":
        return <Sparkles {...iconProps} style={{ color: "var(--uprole-teal, #14B8A6)" }} />;
      default:
        return <BookOpen {...iconProps} style={{ color: "#64748B" }} />;
    }
  };

  const getDimensionLabel = (dim: string) => {
    switch (dim) {
      case "achieve": return "Achieve · Impact";
      case "develop": return "Develop · Capability";
      case "evidence": return "Evidence · Proof";
      case "resilience": return "Resilience · Growth";
      default: return "Activity Log";
    }
  };

  // Compute live Career Value summary metrics
  const valueMetrics = useMemo(() => {
    const totalEvents = entries.length;

    // Detect entries with quantifiable metrics (numbers, %, $, x)
    const metricRegex = /(\d+[\.,]?\d*[%$kKmMxX]|\$\d+|\d+\+?\s*(users|clients|hours|days|weeks|months|members|team|leads|requests|bps))/i;
    const impactEvents = entries.filter(e => metricRegex.test(e.content) || e.entry_type === "impact" || e.entry_type === "win").length;

    // Unique skills/capabilities documented in tags
    const allTags = entries.flatMap(e => e.tags || []);
    const uniqueSkills = new Set(allTags.map(t => t.toLowerCase())).size;

    // Evidence & proof items
    const evidenceEvents = entries.filter(e => e.entry_type === "feedback" || e.entry_type === "project" || e.entry_type === "certification" || e.entry_type === "publication").length;

    return { totalEvents, impactEvents, uniqueSkills, evidenceEvents };
  }, [entries]);

  // Filtering
  const filteredEntries = useMemo(() => {
    return entries.filter((e) => {
      const dim = getEntryDimension(e.entry_type);
      const matchesDim = filterDimension === "all" || dim === filterDimension;
      const q = searchQuery.toLowerCase();
      const matchesSearch =
        !q ||
        e.content.toLowerCase().includes(q) ||
        (e.tags || []).some((t) => t.toLowerCase().includes(q)) ||
        e.entry_type.toLowerCase().includes(q);
      return matchesDim && matchesSearch;
    });
  }, [entries, filterDimension, searchQuery]);

  // Group by Month & Year for the executive chronological ledger
  const groupedEntries = useMemo(() => {
    const groups: { [key: string]: CareerJournalEntry[] } = {};
    filteredEntries.forEach((entry) => {
      const d = new Date(entry.date);
      const monthYear = d.toLocaleDateString(undefined, { month: "long", year: "numeric" });
      if (!groups[monthYear]) groups[monthYear] = [];
      groups[monthYear].push(entry);
    });
    return groups;
  }, [filteredEntries]);

  // Highlight metrics inside text
  const renderFormattedContent = (content: string) => {
    // Regex to detect numbers/metrics like 20%, $50K, 3x, 100+
    const parts = content.split(/(\b\d+[\.,]?\d*[%$kKmMxX]|\$\d+[\.,]?\d*|\b\d+\+\b)/g);
    return parts.map((part, index) => {
      if (/(\b\d+[\.,]?\d*[%$kKmMxX]|\$\d+[\.,]?\d*|\b\d+\+\b)/.test(part)) {
        return (
          <span key={index} className="journal-metric-pill">
            {part}
          </span>
        );
      }
      return part;
    });
  };

  const DIMENSION_TABS = [
    { value: "all", label: "All Events", icon: <Layers size={13} /> },
    { value: "achieve", label: "Achieve & Impact", icon: <Award size={13} style={{ color: "var(--brand-amber, #F59E0B)" }} /> },
    { value: "develop", label: "Develop & Skills", icon: <Zap size={13} style={{ color: "var(--uprole-teal, #14B8A6)" }} /> },
    { value: "evidence", label: "Evidence & Proof", icon: <Briefcase size={13} style={{ color: "var(--uprole-blue, #2563EB)" }} /> },
    { value: "resilience", label: "Resilience", icon: <TrendingUp size={13} style={{ color: "#F97316" }} /> },
  ];

  if (authLoading || !user) {
    return (
      <div style={{ minHeight: "100vh", background: "var(--bg)", display: "flex", alignItems: "center", justifyContent: "center" }}>
        <div className="spinner" style={{ width: 40, height: 40 }} />
      </div>
    );
  }

  return (
    <div style={{ minHeight: "100vh", background: "var(--bg)", display: "flex", flexDirection: "column" }}>
      <Navbar />

      <div
        className="journal-page-grid"
        style={{
          padding: "2.5rem 2rem",
          maxWidth: "1160px",
          margin: "0 auto",
          width: "100%",
          display: "grid",
          gridTemplateColumns: "1fr 340px",
          gap: "2.5rem",
        }}
      >
        {/* Main Journal Feed */}
        <div>
          {/* Executive Header */}
          <div
            className="journal-header-row"
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              marginBottom: "1.8rem",
              animation: "journal-fadeInUp 0.5s ease forwards",
              gap: "1.5rem",
            }}
          >
            <div style={{ display: "flex", alignItems: "flex-start", gap: "1rem" }}>
              {/* Brand Emblem Icon (Deep Navy + Warm Amber) */}
              <div style={{
                width: 48,
                height: 48,
                borderRadius: "13px",
                background: "var(--brand-navy, #101B3B)",
                border: "1px solid rgba(245, 158, 11, 0.35)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                boxShadow: "0 6px 18px rgba(16, 27, 59, 0.14)",
                flexShrink: 0,
                marginTop: "2px",
              }}>
                <BookOpen size={22} style={{ color: "var(--brand-amber, #F59E0B)" }} strokeWidth={2.2} />
              </div>

              <div>
                <div style={{ display: "flex", alignItems: "center", gap: "0.45rem", marginBottom: "0.25rem" }}>
                  <span style={{
                    fontSize: "0.68rem",
                    fontWeight: 800,
                    textTransform: "uppercase",
                    letterSpacing: "0.8px",
                    color: "var(--brand-amber, #F59E0B)",
                    background: "rgba(245, 158, 11, 0.1)",
                    padding: "0.15rem 0.5rem",
                    borderRadius: "5px",
                    fontFamily: "Space Grotesk, sans-serif",
                  }}>
                    Evidence Engine
                  </span>
                  <span style={{ fontSize: "0.68rem", color: "var(--text-muted)" }}>• Continuous Career Loop</span>
                </div>
                <h1 style={{
                  fontFamily: "Syne, sans-serif",
                  fontSize: "2rem",
                  fontWeight: 800,
                  margin: 0,
                  lineHeight: 1.15,
                  letterSpacing: "-0.5px",
                  color: "var(--text-primary, #101B3B)",
                }}>
                  Career Journal
                </h1>
                <p style={{
                  color: "var(--text-muted)",
                  fontSize: "0.88rem",
                  margin: "0.35rem 0 0",
                  lineHeight: 1.45,
                  maxWidth: "580px",
                }}>
                  Capture your impact and evidence. Compound your <strong>Career Value</strong> systematically for promotions, raises, and your next big move.
                </p>
              </div>
            </div>

            <button
              onClick={() => {
                setPrefilledContent("");
                setPrefilledType("win");
                setShowQuickEntry(true);
              }}
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: "0.55rem",
                padding: "0.65rem 1.35rem",
                borderRadius: "11px",
                background: "linear-gradient(135deg, #F59E0B 0%, #D97706 100%)",
                color: "#FFFFFF",
                border: "1px solid rgba(255, 255, 255, 0.28)",
                fontSize: "0.88rem",
                fontWeight: 700,
                fontFamily: "Space Grotesk, Inter, sans-serif",
                letterSpacing: "0.2px",
                boxShadow: "0 4px 14px rgba(217, 119, 6, 0.35), inset 0 1px 0 rgba(255, 255, 255, 0.35)",
                cursor: "pointer",
                transition: "all 0.2s cubic-bezier(0.16, 1, 0.3, 1)",
                flexShrink: 0,
                textShadow: "0 1px 2px rgba(0, 0, 0, 0.18)",
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.transform = "translateY(-2px)";
                e.currentTarget.style.boxShadow = "0 8px 24px rgba(245, 158, 11, 0.45), inset 0 1px 0 rgba(255, 255, 255, 0.45)";
                e.currentTarget.style.background = "linear-gradient(135deg, #FBBF24 0%, #F59E0B 100%)";
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.transform = "translateY(0)";
                e.currentTarget.style.boxShadow = "0 4px 14px rgba(217, 119, 6, 0.35), inset 0 1px 0 rgba(255, 255, 255, 0.35)";
                e.currentTarget.style.background = "linear-gradient(135deg, #F59E0B 0%, #D97706 100%)";
              }}
              onMouseDown={(e) => {
                e.currentTarget.style.transform = "scale(0.97)";
              }}
              onMouseUp={(e) => {
                e.currentTarget.style.transform = "translateY(-2px)";
              }}
            >
              <div style={{
                width: 20,
                height: 20,
                borderRadius: "6px",
                background: "rgba(255, 255, 255, 0.22)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                boxShadow: "inset 0 1px 1px rgba(255, 255, 255, 0.3)",
              }}>
                <Plus size={13} strokeWidth={3} color="#FFFFFF" />
              </div>
              <span>Log Career Event</span>
            </button>
          </div>

          {/* Career Value Momentum Bar (Unified Executive Dashboard) */}
          <div
            style={{
              background: "var(--bg-elevated)",
              border: "1px solid var(--border)",
              borderRadius: "18px",
              padding: "1.2rem 1.6rem",
              marginBottom: "1.5rem",
              boxShadow: "0 8px 30px rgba(16, 27, 59, 0.04)",
              animation: "journal-fadeInUp 0.5s ease forwards",
            }}
          >
            <div style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              marginBottom: "0.9rem",
              paddingBottom: "0.6rem",
              borderBottom: "1px solid var(--border)",
            }}>
              <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
                <span style={{
                  width: 8,
                  height: 8,
                  borderRadius: "50%",
                  background: "var(--brand-amber, #F59E0B)",
                  boxShadow: "0 0 8px rgba(245, 158, 11, 0.6)",
                }} />
                <span style={{
                  fontSize: "0.74rem",
                  fontWeight: 800,
                  letterSpacing: "0.8px",
                  textTransform: "uppercase",
                  color: "var(--text-secondary)",
                  fontFamily: "Space Grotesk, sans-serif",
                }}>
                  Career Value Momentum
                </span>
              </div>
              <span style={{ fontSize: "0.72rem", color: "var(--text-muted)", fontWeight: 500 }}>
                UpRole Equity Engine
              </span>
            </div>

            <div style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fit, minmax(130px, 1fr))",
              gap: "1.2rem",
            }}>
              {/* 1. Events */}
              <div style={{ paddingRight: "0.5rem" }}>
                <span style={{ fontSize: "0.68rem", fontWeight: 700, color: "var(--text-muted)", textTransform: "uppercase", letterSpacing: "0.5px", display: "block", marginBottom: "0.2rem" }}>
                  Career Events
                </span>
                <div style={{ display: "flex", alignItems: "baseline", gap: "0.35rem" }}>
                  <span style={{ fontSize: "1.85rem", fontWeight: 800, fontFamily: "Syne, sans-serif", color: "var(--text-primary)", lineHeight: 1.1 }}>
                    {valueMetrics.totalEvents}
                  </span>
                  <span style={{ fontSize: "0.75rem", color: "var(--text-muted)", fontWeight: 500 }}>logged</span>
                </div>
                <span style={{ fontSize: "0.7rem", color: "var(--uprole-blue, #2563EB)", fontWeight: 600, display: "block", marginTop: "0.2rem" }}>
                  Continuous ledger
                </span>
              </div>

              {/* 2. Impact */}
              <div style={{ paddingRight: "0.5rem" }}>
                <span style={{ fontSize: "0.68rem", fontWeight: 700, color: "var(--text-muted)", textTransform: "uppercase", letterSpacing: "0.5px", display: "block", marginBottom: "0.2rem" }}>
                  Impact Points
                </span>
                <div style={{ display: "flex", alignItems: "baseline", gap: "0.35rem" }}>
                  <span style={{ fontSize: "1.85rem", fontWeight: 800, fontFamily: "Syne, sans-serif", color: "var(--brand-amber, #F59E0B)", lineHeight: 1.1 }}>
                    {valueMetrics.impactEvents}
                  </span>
                  <span style={{ fontSize: "0.75rem", color: "var(--brand-amber, #F59E0B)", fontWeight: 600 }}>metrics</span>
                </div>
                <span style={{ fontSize: "0.7rem", color: "var(--brand-amber, #F59E0B)", fontWeight: 600, display: "block", marginTop: "0.2rem" }}>
                  Quantified outcomes
                </span>
              </div>

              {/* 3. Capabilities */}
              <div style={{ paddingRight: "0.5rem" }}>
                <span style={{ fontSize: "0.68rem", fontWeight: 700, color: "var(--text-muted)", textTransform: "uppercase", letterSpacing: "0.5px", display: "block", marginBottom: "0.2rem" }}>
                  Capabilities
                </span>
                <div style={{ display: "flex", alignItems: "baseline", gap: "0.35rem" }}>
                  <span style={{ fontSize: "1.85rem", fontWeight: 800, fontFamily: "Syne, sans-serif", color: "var(--uprole-teal, #14B8A6)", lineHeight: 1.1 }}>
                    {valueMetrics.uniqueSkills}
                  </span>
                  <span style={{ fontSize: "0.75rem", color: "var(--uprole-teal, #14B8A6)", fontWeight: 600 }}>skills</span>
                </div>
                <span style={{ fontSize: "0.7rem", color: "var(--uprole-teal, #14B8A6)", fontWeight: 600, display: "block", marginTop: "0.2rem" }}>
                  Demonstrated competencies
                </span>
              </div>

              {/* 4. Evidence */}
              <div>
                <span style={{ fontSize: "0.68rem", fontWeight: 700, color: "var(--text-muted)", textTransform: "uppercase", letterSpacing: "0.5px", display: "block", marginBottom: "0.2rem" }}>
                  Verified Proof
                </span>
                <div style={{ display: "flex", alignItems: "baseline", gap: "0.35rem" }}>
                  <span style={{ fontSize: "1.85rem", fontWeight: 800, fontFamily: "Syne, sans-serif", color: "var(--uprole-blue, #2563EB)", lineHeight: 1.1 }}>
                    {valueMetrics.evidenceEvents}
                  </span>
                  <span style={{ fontSize: "0.75rem", color: "var(--uprole-blue, #2563EB)", fontWeight: 600 }}>artifacts</span>
                </div>
                <span style={{ fontSize: "0.7rem", color: "var(--uprole-blue, #2563EB)", fontWeight: 600, display: "block", marginTop: "0.2rem" }}>
                  Praise, certs & vault
                </span>
              </div>
            </div>
          </div>

          {/* Quick Spark Prompts (1-Click Frictionless Starters) */}
          <div style={{
            background: "rgba(245, 158, 11, 0.04)",
            border: "1px solid rgba(245, 158, 11, 0.16)",
            borderRadius: "16px",
            padding: "0.9rem 1.2rem",
            marginBottom: "1.8rem",
            animation: "journal-fadeInUp 0.5s ease forwards",
            animationDelay: "0.05s",
          }}>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "0.65rem" }}>
              <div style={{ display: "flex", alignItems: "center", gap: "0.45rem" }}>
                <Sparkles size={14} style={{ color: "var(--brand-amber, #F59E0B)" }} />
                <span style={{ fontSize: "0.78rem", fontWeight: 800, color: "var(--text-primary)", letterSpacing: "0.4px" }}>
                  Quick Spark Prompts — 1-Click to Log:
                </span>
              </div>
              <span style={{ fontSize: "0.72rem", color: "var(--text-muted)" }}>
                Click any prompt to prefill
              </span>
            </div>

            <div style={{
              display: "flex",
              alignItems: "center",
              gap: "0.55rem",
              flexWrap: "wrap",
            }}>
              {[
                { icon: "🚀", label: "Shipped a Feature", type: "project", prompt: "Shipped key project milestone: " },
                { icon: "💬", label: "Manager / Client Praise", type: "feedback", prompt: "Received commendation regarding: " },
                { icon: "💰", label: "Cost / Latency Win", type: "impact", prompt: "Improved performance or reduced cost by: " },
                { icon: "⚡", label: "Mastered a Skill", type: "skill", prompt: "Acquired and put into practice: " },
                { icon: "🔄", label: "Turn Setback into Growth", type: "gap", prompt: "" },
              ].map((spark) => (
                <button
                  key={spark.label}
                  type="button"
                  onClick={() => handleSparkClick(spark.type, spark.prompt)}
                  style={{
                    display: "inline-flex",
                    alignItems: "center",
                    gap: "0.45rem",
                    padding: "0.45rem 0.95rem",
                    borderRadius: "999px",
                    background: "var(--bg-elevated)",
                    border: "1px solid var(--border)",
                    boxShadow: "0 2px 6px rgba(16, 27, 59, 0.04)",
                    fontSize: "0.8rem",
                    fontWeight: 600,
                    color: "var(--text-primary)",
                    cursor: "pointer",
                    transition: "all 0.2s cubic-bezier(0.25, 0.46, 0.45, 0.94)",
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.borderColor = "var(--brand-amber, #F59E0B)";
                    e.currentTarget.style.background = "rgba(245, 158, 11, 0.08)";
                    e.currentTarget.style.transform = "translateY(-1px)";
                    e.currentTarget.style.boxShadow = "0 4px 12px rgba(245, 158, 11, 0.12)";
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.borderColor = "var(--border)";
                    e.currentTarget.style.background = "var(--bg-elevated)";
                    e.currentTarget.style.transform = "translateY(0)";
                    e.currentTarget.style.boxShadow = "0 2px 6px rgba(16, 27, 59, 0.04)";
                  }}
                >
                  <span>{spark.icon}</span>
                  <span>{spark.label}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Search + Dimension Tabs */}
          <div style={{
            display: "flex",
            gap: "0.8rem",
            flexWrap: "wrap",
            marginBottom: "1.8rem",
            animation: "journal-fadeInUp 0.5s ease forwards",
            animationDelay: "0.1s",
          }}>
            <div className="journal-search" style={{ position: "relative", flex: 1, minWidth: "220px" }}>
              <Search size={16} style={{
                position: "absolute",
                left: "1rem",
                top: "50%",
                transform: "translateY(-50%)",
                color: "var(--text-muted)",
              }} />
              <input
                type="text"
                placeholder="Search events, skills, impact keywords..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                style={{
                  paddingLeft: "2.6rem",
                  height: "44px",
                  background: "transparent",
                  border: "none",
                  width: "100%",
                  fontSize: "0.88rem",
                  color: "var(--text-primary)",
                  outline: "none",
                }}
              />
            </div>
            <div style={{
              display: "flex",
              gap: "0.4rem",
              flexWrap: "nowrap",
              overflowX: "auto",
              alignItems: "center",
              scrollbarWidth: "none",
              paddingBottom: "0.2rem",
            }}>
              {DIMENSION_TABS.map((t) => (
                <button
                  key={t.value}
                  onClick={() => setFilterDimension(t.value)}
                  className={`journal-filter-chip ${filterDimension === t.value ? "active" : ""}`}
                >
                  {t.icon}
                  {t.label}
                </button>
              ))}
            </div>
          </div>

          {/* Timeline Ledger */}
          <div style={{
            animation: "journal-fadeInUp 0.6s ease forwards",
            animationDelay: "0.2s",
          }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "1rem" }}>
              <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
                <h2 style={{
                  fontSize: "1.15rem",
                  fontWeight: 800,
                  margin: 0,
                  fontFamily: "Syne, sans-serif",
                  color: "var(--text-primary)",
                }}>
                  Chronological Career Ledger
                </h2>
                <span style={{
                  fontSize: "0.75rem",
                  color: "var(--text-muted)",
                  background: "var(--bg-elevated)",
                  padding: "0.15rem 0.6rem",
                  borderRadius: "999px",
                  border: "1px solid var(--border)",
                  fontWeight: 600,
                }}>
                  {filteredEntries.length} {filteredEntries.length === 1 ? "event" : "events"}
                </span>
              </div>
            </div>

            {loading ? (
              <div style={{ textAlign: "center", padding: "3.5rem" }}>
                <div className="spinner" style={{ width: 34, height: 34, margin: "0 auto" }} />
                <p style={{ color: "var(--text-muted)", fontSize: "0.88rem", marginTop: "1rem" }}>
                  Loading your career evidence ledger...
                </p>
              </div>
            ) : filteredEntries.length === 0 ? (
              <div
                className="journal-glass"
                style={{
                  textAlign: "center",
                  padding: "3.5rem 2rem",
                  border: "2px dashed var(--border-strong)",
                  borderRadius: "24px",
                }}
              >
                <div className="journal-empty-float" style={{ display: "inline-block", marginBottom: "1rem" }}>
                  <div style={{
                    width: 68,
                    height: 68,
                    borderRadius: "20px",
                    background: "linear-gradient(135deg, rgba(245, 158, 11, 0.12), rgba(20, 184, 166, 0.1))",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    margin: "0 auto",
                  }}>
                    <BookOpen size={30} style={{ color: "var(--brand-amber, #F59E0B)" }} />
                  </div>
                </div>

                {entries.length === 0 ? (
                  <>
                    <h3 style={{ margin: "0 0 0.5rem", fontSize: "1.25rem", fontWeight: 800, fontFamily: "Syne, sans-serif" }}>
                      Your Career Ledger is waiting for its first event
                    </h3>
                    <p style={{ color: "var(--text-muted)", margin: 0, fontSize: "0.9rem", lineHeight: 1.5, maxWidth: 440, marginLeft: "auto", marginRight: "auto" }}>
                      High performers routine overlook their best achievements. Capture what you shipped, praised feedback, or skills learned this week.
                    </p>
                    <button
                      onClick={() => setShowQuickEntry(true)}
                      className="btn-primary journal-cta-glow"
                      style={{
                        marginTop: "1.5rem",
                        padding: "0.75rem 1.8rem",
                        borderRadius: "14px",
                        fontSize: "0.9rem",
                        fontWeight: 700,
                        display: "inline-flex",
                        alignItems: "center",
                        gap: "0.5rem",
                      }}
                    >
                      <Sparkles size={16} />
                      Log your first career event
                    </button>
                  </>
                ) : (
                  <>
                    <h3 style={{ margin: "0 0 0.5rem", fontSize: "1.2rem", fontWeight: 800, fontFamily: "Syne, sans-serif" }}>
                      No matching events found
                    </h3>
                    <p style={{ color: "var(--text-muted)", margin: 0, fontSize: "0.88rem" }}>
                      Try adjusting your search query or dimension filter.
                    </p>
                    <button
                      onClick={() => { setSearchQuery(""); setFilterDimension("all"); }}
                      className="btn-secondary"
                      style={{ marginTop: "1.2rem", borderRadius: "12px", fontSize: "0.85rem", padding: "0.5rem 1.2rem" }}
                    >
                      Reset Filters
                    </button>
                  </>
                )}
              </div>
            ) : (
              <div style={{ position: "relative" }}>
                {/* Timeline Spine */}
                <div className="journal-timeline-line" style={{
                  position: "absolute",
                  left: "21px",
                  top: "20px",
                  bottom: "20px",
                }} />

                {Object.entries(groupedEntries).map(([monthYear, monthEntries], groupIdx) => (
                  <div key={monthYear} style={{ marginBottom: "2rem" }}>
                    {/* Month / Year Header */}
                    <div className="journal-month-header" style={{ paddingLeft: "3.5rem" }}>
                      <span>{monthYear}</span>
                    </div>

                    <div style={{ display: "grid", gap: "1.2rem" }}>
                      {monthEntries.map((entry, idx) => {
                        const dim = getEntryDimension(entry.entry_type);
                        return (
                          <div
                            key={entry.id}
                            style={{
                              display: "flex",
                              gap: "1.2rem",
                              position: "relative",
                              zIndex: 1,
                              animation: "journal-fadeInUp 0.5s ease forwards",
                              animationDelay: `${Math.min((groupIdx * 3 + idx) * 0.05, 0.4)}s`,
                            }}
                          >
                            {/* Timeline Node */}
                            <div className={`journal-timeline-dot journal-timeline-dot-${entry.entry_type}`}>
                              {getTypeIcon(entry.entry_type)}
                            </div>

                            {/* Entry Card */}
                            <div
                              className={`journal-glass journal-entry-card journal-entry-${entry.entry_type}`}
                              style={{
                                flex: 1,
                                padding: "1.3rem 1.5rem",
                                display: "grid",
                                gap: "0.8rem",
                              }}
                            >
                              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: "1rem" }}>
                                <div style={{ flex: 1 }}>
                                  {/* Dimension Badge */}
                                  <div style={{ display: "flex", alignItems: "center", gap: "0.5rem", marginBottom: "0.5rem", flexWrap: "wrap" }}>
                                    <span className={`journal-dimension-badge ${dim}`}>
                                      {getDimensionLabel(dim)}
                                    </span>
                                    {entry.source === "prompted" && (
                                      <span style={{ fontSize: "0.68rem", color: "var(--text-muted)", background: "var(--bg-elevated)", padding: "0.15rem 0.45rem", borderRadius: "6px", border: "1px solid var(--border)" }}>
                                        AI Prompted
                                      </span>
                                    )}
                                  </div>

                                  {/* Content with auto-detected metric pills */}
                                  <p style={{
                                    margin: 0,
                                    fontSize: "0.94rem",
                                    lineHeight: 1.65,
                                    color: "var(--text-primary)",
                                    whiteSpace: "pre-wrap",
                                  }}>
                                    {renderFormattedContent(entry.content)}
                                  </p>
                                </div>

                                <div style={{ display: "flex", flexDirection: "column", alignItems: "flex-end", gap: "0.5rem", flexShrink: 0 }}>
                                  <span style={{
                                    fontSize: "0.74rem",
                                    color: "var(--text-muted)",
                                    display: "flex",
                                    alignItems: "center",
                                    gap: "0.3rem",
                                    background: "var(--bg-elevated)",
                                    padding: "0.25rem 0.55rem",
                                    borderRadius: "8px",
                                    border: "1px solid var(--border)",
                                    fontWeight: 600,
                                  }}>
                                    <Calendar size={11} style={{ color: "var(--accent)" }} />
                                    {new Date(entry.date).toLocaleDateString(undefined, { month: "short", day: "numeric", year: "numeric" })}
                                  </span>

                                  {/* Hover Actions */}
                                  <div style={{ display: "flex", gap: "0.3rem" }}>
                                    <button
                                      onClick={() => handleCopyBullet(entry)}
                                      title="Copy as formatted resume bullet"
                                      className="journal-action-btn copy"
                                    >
                                      {copiedId === entry.id ? <Check size={12} style={{ color: "var(--uprole-teal)" }} /> : <Copy size={12} />}
                                      {copiedId === entry.id ? "Copied" : "Copy"}
                                    </button>
                                    <button
                                      onClick={() => { setEditEntry(entry); setShowQuickEntry(true); }}
                                      title="Edit entry"
                                      className="journal-action-btn edit"
                                    >
                                      <Pencil size={12} />
                                    </button>
                                    {deleteConfirmId === entry.id ? (
                                      <div style={{ display: "flex", gap: "0.25rem" }}>
                                        <button
                                          onClick={() => handleDeleteEntry(entry.id)}
                                          style={{
                                            background: "linear-gradient(135deg, #ef4444, #dc2626)",
                                            color: "#fff",
                                            border: "none",
                                            borderRadius: "8px",
                                            padding: "0.3rem 0.6rem",
                                            cursor: "pointer",
                                            fontSize: "0.72rem",
                                            fontWeight: 700,
                                          }}
                                        >
                                          Confirm
                                        </button>
                                        <button
                                          onClick={() => setDeleteConfirmId(null)}
                                          style={{
                                            background: "var(--bg-elevated)",
                                            border: "1px solid var(--border)",
                                            borderRadius: "8px",
                                            padding: "0.3rem 0.5rem",
                                            cursor: "pointer",
                                            fontSize: "0.72rem",
                                            color: "var(--text-muted)",
                                          }}
                                        >
                                          ✕
                                        </button>
                                      </div>
                                    ) : (
                                      <button
                                        onClick={() => setDeleteConfirmId(entry.id)}
                                        title="Delete entry"
                                        className="journal-action-btn delete"
                                      >
                                        <Trash2 size={12} />
                                      </button>
                                    )}
                                  </div>
                                </div>
                              </div>

                              {/* Tags */}
                              {entry.tags && entry.tags.length > 0 && (
                                <div style={{ display: "flex", gap: "0.35rem", flexWrap: "wrap", marginTop: "0.2rem" }}>
                                  {entry.tags.map((t) => (
                                    <span key={t} className="journal-tag">
                                      <Tag size={10} /> {t}
                                    </span>
                                  ))}
                                </div>
                              )}
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Sidebar */}
        <div style={{ display: "grid", gap: "1.3rem", alignContent: "start" }}>
          {/* Consistency & Momentum Gauge */}
          <StreakIndicator entries={entries} />

          {/* Achievement Radar Nudge */}
          <AchievementRadar entries={entries} onLogQuickWin={() => {
            setPrefilledContent("");
            setPrefilledType("win");
            setShowQuickEntry(true);
          }} />

          {/* Proof Vault */}
          <ProofVault onExtracted={handleProofVaultExtracted} />

          {/* Project & Calendar Sync */}
          <ProjectSync onGeneratedPrompt={(prompt) => {
            setGeneratedPromptStr(prompt);
            setPrefilledContent(prompt);
            setShowQuickEntry(true);
          }} />

          {/* Career Value Bridge (Output Generator) */}
          <div
            style={{
              background: "var(--bg-elevated, #ffffff)",
              border: "1px solid var(--border)",
              borderRadius: "16px",
              padding: "1.2rem",
              boxShadow: "0 4px 16px rgba(16, 27, 59, 0.03)",
              position: "relative",
              overflow: "hidden",
              cursor: "pointer",
              animation: "journal-fadeInUp 0.7s ease forwards",
              animationDelay: "0.2s",
              transition: "all 0.25s cubic-bezier(0.16, 1, 0.3, 1)",
            }}
            onClick={() => router.push("/career-copilot")}
            onMouseEnter={(e) => {
              e.currentTarget.style.transform = "translateY(-2px)";
              e.currentTarget.style.borderColor = "var(--brand-amber, #F59E0B)";
              e.currentTarget.style.boxShadow = "0 8px 24px rgba(245, 158, 11, 0.12)";
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.transform = "translateY(0)";
              e.currentTarget.style.borderColor = "var(--border)";
              e.currentTarget.style.boxShadow = "0 4px 16px rgba(16, 27, 59, 0.03)";
            }}
          >
            {/* Top accent hairline */}
            <div style={{
              position: "absolute",
              top: 0,
              left: 0,
              right: 0,
              height: "3px",
              background: "linear-gradient(90deg, #F59E0B, #7C3AED)",
              borderRadius: "16px 16px 0 0",
            }} />

            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "0.55rem" }}>
              <div style={{ display: "flex", alignItems: "center", gap: "0.55rem" }}>
                <div style={{
                  width: 32,
                  height: 32,
                  borderRadius: "9px",
                  background: "rgba(245, 158, 11, 0.12)",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                }}>
                  <Sparkles size={17} style={{ color: "var(--brand-amber, #F59E0B)" }} />
                </div>
                <div>
                  <h3 style={{
                    margin: 0,
                    fontSize: "0.95rem",
                    fontWeight: 800,
                    fontFamily: "Space Grotesk, Syne, sans-serif",
                    color: "var(--text-primary)",
                  }}>
                    Career Copilot
                  </h3>
                  <span style={{ fontSize: "0.68rem", color: "var(--text-muted)" }}>
                    Turn Journal into Opportunity
                  </span>
                </div>
              </div>
              <ChevronRight size={18} style={{ color: "var(--text-muted)" }} />
            </div>

            <p style={{ margin: "0 0 0.75rem", fontSize: "0.78rem", color: "var(--text-secondary)", lineHeight: 1.45 }}>
              Convert your logged events directly into targeted Resumes, LinkedIn profiles, Promotion cases, and Interview stories.
            </p>

            <div style={{
              display: "flex",
              alignItems: "center",
              gap: "0.3rem",
              fontSize: "0.76rem",
              fontWeight: 700,
              color: "var(--brand-amber, #F59E0B)",
            }}>
              <span>Launch Career Copilot</span>
              <span>→</span>
            </div>
          </div>
        </div>
      </div>

      {/* Quick Entry Modal */}
      {showQuickEntry && (
        <QuickEntryModal
          onClose={() => {
            setShowQuickEntry(false);
            setGeneratedPromptStr("");
            setPrefilledContent("");
            setEditEntry(null);
          }}
          onSave={handleSaveEntry}
          prefilledContent={prefilledContent || generatedPromptStr}
          editEntry={editEntry}
        />
      )}
    </div>
  );
}
