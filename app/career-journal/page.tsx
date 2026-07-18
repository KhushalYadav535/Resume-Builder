"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Navbar from "@/components/Navbar";
import { useAuth } from "@/hooks/useAuth";
import { BookOpen, Plus, Calendar, Tag, ChevronRight, Award, Zap, TrendingUp, AlertTriangle, Search, Filter } from "lucide-react";
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
  const [generatedPromptStr, setGeneratedPromptStr] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [filterType, setFilterType] = useState("all");

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
      const res = await fetch("/api/journal/create", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(entry),
      });
      if (res.ok) {
        showToast("Entry saved successfully!", "success");
        fetchEntries();
      } else {
        throw new Error("Failed to save entry");
      }
    } catch (err) {
      console.error(err);
      showToast("Failed to save entry. Try again.", "error");
    }
  };

  const handleProofVaultExtracted = (text: string) => {
    setPrefilledContent(text);
    setShowQuickEntry(true);
  };

  if (authLoading || !user) {
    return (
      <div style={{ minHeight: "100vh", background: "var(--bg)", display: "flex", alignItems: "center", justifyContent: "center" }}>
        <div className="spinner" style={{ width: 40, height: 40 }} />
      </div>
    );
  }

  const getTypeIcon = (type: string) => {
    switch (type) {
      case "win": return <Award size={18} className="text-emerald-500" />;
      case "skill": return <Zap size={18} className="text-amber-500" />;
      case "promotion": return <TrendingUp size={18} className="text-purple-500" />;
      case "gap": return <AlertTriangle size={18} className="text-orange-400" />;
      default: return <BookOpen size={18} className="text-blue-500" />;
    }
  };

  const filteredEntries = entries.filter((e) => {
    const matchesType = filterType === "all" || e.entry_type === filterType;
    const q = searchQuery.toLowerCase();
    const matchesSearch =
      !q ||
      e.content.toLowerCase().includes(q) ||
      (e.tags || []).some((t) => t.toLowerCase().includes(q)) ||
      e.entry_type.toLowerCase().includes(q);
    return matchesType && matchesSearch;
  });

  const ENTRY_TYPES = [
    { value: "all", label: "All" },
    { value: "win", label: "Win" },
    { value: "skill", label: "Skill" },
    { value: "promotion", label: "Promotion" },
    { value: "certification", label: "Certification" },
    { value: "project", label: "Project" },
    { value: "feedback", label: "Feedback" },
    { value: "gap", label: "Gap" },
    { value: "other", label: "Other" },
  ];

  return (
    <div style={{ minHeight: "100vh", background: "var(--bg)", display: "flex", flexDirection: "column" }}>
      <Navbar />

      <div style={{ padding: "2.5rem 2rem", maxWidth: "1000px", margin: "0 auto", width: "100%", display: "grid", gridTemplateColumns: "1fr 320px", gap: "2rem" }}>
        {/* Main Content */}
        <div>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "2rem" }}>
            <div>
              <h1 style={{ fontFamily: "Syne, sans-serif", fontSize: "2rem", fontWeight: 800, margin: 0, display: "flex", alignItems: "center", gap: "0.6rem" }}>
                <BookOpen size={28} className="text-purple-500" />
                Career Journal
              </h1>
              <p style={{ color: "var(--text-muted)", fontSize: "0.95rem", marginTop: "0.4rem" }}>
                Log your wins, feedback, and skills. Build your narrative effortlessly.
              </p>
            </div>
            <button
              onClick={() => { setPrefilledContent(""); setShowQuickEntry(true); }}
              className="btn-primary"
              style={{ display: "flex", alignItems: "center", gap: "0.4rem", padding: "0.6rem 1.2rem" }}
            >
              <Plus size={18} />
              Quick Entry
            </button>
          </div>

          {/* Search + Filter */}
          <div style={{ display: "flex", gap: "0.8rem", flexWrap: "wrap", marginBottom: "1.5rem" }}>
            <div style={{ position: "relative", flex: 1, minWidth: "200px" }}>
              <Search size={16} style={{ position: "absolute", left: "0.8rem", top: "50%", transform: "translateY(-50%)", color: "var(--text-muted)" }} />
              <input
                type="text"
                className="input"
                placeholder="Search entries..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                style={{ paddingLeft: "2.2rem", height: "38px", background: "var(--bg-elevated)", border: "1px solid var(--border)", borderRadius: "8px", width: "100%" }}
              />
            </div>
            <div style={{ display: "flex", gap: "0.4rem", flexWrap: "wrap", alignItems: "center" }}>
              <Filter size={14} style={{ color: "var(--text-muted)", flexShrink: 0 }} />
              {ENTRY_TYPES.map((t) => (
                <button
                  key={t.value}
                  onClick={() => setFilterType(t.value)}
                  style={{
                    padding: "0.3rem 0.7rem",
                    borderRadius: "999px",
                    border: `1px solid ${filterType === t.value ? "var(--accent)" : "var(--border)"}`,
                    background: filterType === t.value ? "rgba(108,99,255,0.1)" : "var(--bg-elevated)",
                    color: filterType === t.value ? "var(--accent)" : "var(--text-muted)",
                    fontSize: "0.75rem",
                    fontWeight: 600,
                    cursor: "pointer",
                    transition: "all 0.15s",
                  }}
                >
                  {t.label}
                </button>
              ))}
            </div>
          </div>

          {/* Timeline View */}
          <div style={{ marginTop: "0" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "1.5rem" }}>
              <h2 style={{ fontSize: "1.1rem", fontWeight: 700, margin: 0 }}>Timeline</h2>
              {filteredEntries.length !== entries.length && (
                <span style={{ fontSize: "0.8rem", color: "var(--text-muted)" }}>
                  Showing {filteredEntries.length} of {entries.length}
                </span>
              )}
            </div>
            
            {loading ? (
              <div style={{ textAlign: "center", padding: "2rem" }}><div className="spinner" style={{ width: 30, height: 30, margin: "0 auto" }} /></div>
            ) : filteredEntries.length === 0 ? (
              <div className="card" style={{ textAlign: "center", padding: "3rem", borderStyle: "dashed" }}>
                <BookOpen size={48} className="text-gray-300 mx-auto mb-4" />
                {entries.length === 0 ? (
                  <>
                    <h3 style={{ margin: "0 0 0.5rem", fontSize: "1.1rem" }}>Your journal is empty</h3>
                    <p style={{ color: "var(--text-muted)", margin: 0, fontSize: "0.9rem" }}>Start logging your career achievements to build a powerful resume later.</p>
                    <button onClick={() => setShowQuickEntry(true)} className="btn-secondary" style={{ marginTop: "1rem" }}>Log your first entry</button>
                  </>
                ) : (
                  <>
                    <h3 style={{ margin: "0 0 0.5rem", fontSize: "1.1rem" }}>No matching entries</h3>
                    <p style={{ color: "var(--text-muted)", margin: 0, fontSize: "0.9rem" }}>Try adjusting your search or filter.</p>
                    <button onClick={() => { setSearchQuery(""); setFilterType("all"); }} className="btn-secondary" style={{ marginTop: "1rem" }}>Clear Filters</button>
                  </>
                )}
              </div>
            ) : (
              <div style={{ display: "grid", gap: "1.5rem", position: "relative" }}>
                {/* Vertical Line */}
                <div style={{ position: "absolute", left: "20px", top: "10px", bottom: "10px", width: "2px", background: "var(--border)" }} />

                {filteredEntries.map((entry) => (
                  <div key={entry.id} style={{ display: "flex", gap: "1.5rem", position: "relative", zIndex: 1 }}>
                    <div style={{ width: "42px", height: "42px", borderRadius: "50%", background: "var(--bg-elevated)", border: "2px solid var(--border)", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                      {getTypeIcon(entry.entry_type)}
                    </div>
                    
                    <div className="card" style={{ flex: 1, padding: "1.5rem", display: "grid", gap: "1rem", transition: "all 0.2s" }}>
                      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
                        <div>
                          <span style={{ textTransform: "capitalize", fontSize: "0.8rem", fontWeight: 700, color: "var(--text-muted)", display: "flex", alignItems: "center", gap: "0.4rem", marginBottom: "0.3rem" }}>
                            {entry.entry_type} {entry.source === "prompted" && "• Prompted"}
                          </span>
                          <p style={{ margin: 0, fontSize: "1rem", lineHeight: 1.6, color: "var(--text)" }}>{entry.content}</p>
                        </div>
                        <span style={{ fontSize: "0.75rem", color: "var(--text-muted)", display: "flex", alignItems: "center", gap: "0.3rem" }}>
                          <Calendar size={12} />
                          {new Date(entry.date).toLocaleDateString(undefined, { month: "short", day: "numeric", year: "numeric" })}
                        </span>
                      </div>
                      
                      {entry.tags && entry.tags.length > 0 && (
                        <div style={{ display: "flex", gap: "0.5rem", flexWrap: "wrap", marginTop: "0.5rem" }}>
                          {entry.tags.map(t => (
                            <span key={t} className="tag tag-purple" style={{ fontSize: "0.7rem", display: "flex", alignItems: "center", gap: "0.3rem" }}>
                              <Tag size={10} /> {t}
                            </span>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Sidebar */}
        <div style={{ display: "grid", gap: "1.5rem", alignContent: "start" }}>
          
          <StreakIndicator entries={entries} />

          {/* Health Check-in */}
          <div className="card" style={{ padding: "1.5rem", background: "linear-gradient(135deg, rgba(108, 99, 255, 0.1) 0%, rgba(59, 130, 246, 0.1) 100%)", border: "1px solid rgba(108, 99, 255, 0.2)" }}>
            <h3 style={{ margin: "0 0 0.5rem", fontSize: "1.05rem", fontWeight: 700 }}>Career Health Check</h3>
            <p style={{ fontSize: "0.85rem", color: "var(--text-secondary)", margin: "0 0 1rem", lineHeight: 1.5 }}>
              How is work going this week? Any small wins worth documenting?
            </p>
            <button onClick={() => setShowQuickEntry(true)} className="btn-primary" style={{ width: "100%", fontSize: "0.85rem", padding: "0.6rem" }}>
              Log a Quick Win
            </button>
          </div>

          <AchievementRadar entries={entries} onLogQuickWin={() => setShowQuickEntry(true)} />

          <ProjectSync onGeneratedPrompt={(prompt) => {
            setGeneratedPromptStr(prompt);
            setShowQuickEntry(true);
          }} />

          {/* Proof Vault */}
          <ProofVault onExtracted={handleProofVaultExtracted} />

          {/* Copilot Link */}
          <div className="card" style={{ padding: "1.5rem", display: "flex", justifyContent: "space-between", alignItems: "center", cursor: "pointer", transition: "all 0.2s" }} onClick={() => router.push("/career-copilot")}>
            <div>
              <h3 style={{ margin: "0 0 0.2rem", fontSize: "1rem", fontWeight: 700 }}>Career Copilot</h3>
              <p style={{ margin: 0, fontSize: "0.8rem", color: "var(--text-muted)" }}>Use journal data to generate pitch scripts.</p>
            </div>
            <ChevronRight size={20} className="text-gray-400" />
          </div>
        </div>
      </div>

      {showQuickEntry && (
        <QuickEntryModal
          onClose={() => {
            setShowQuickEntry(false);
            setGeneratedPromptStr("");
          }}
          onSave={handleSaveEntry}
          prefilledContent={prefilledContent || generatedPromptStr}
        />
      )}
    </div>
  );
}
