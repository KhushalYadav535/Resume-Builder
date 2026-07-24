"use client";
import { useEffect, useState, useCallback } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import Navbar from "@/components/Navbar";
import { useAuth } from "@/hooks/useAuth";
import { Resume } from "@/types";
import ResumeDocument from "@/components/ResumeDocument";
import ParticleBackground from "@/components/ui/ParticleBackground";
import { ATSRing } from "@/components/ui/ATSRing";
import { SuggestionFlow } from "@/components/SuggestionFlow";
import {
  Edit3, Mail, Printer, FileDown, TrendingUp, Share2, Eye, Clock,
  Maximize2, Minimize2, Sparkles, Save, CheckCircle2, Wand2, X,
  ChevronDown, Copy, AlertTriangle, ZoomIn, ZoomOut,
  LayoutTemplate, Target, Zap, RotateCcw, RotateCw, FileText,
} from "lucide-react";
import { useToast } from "@/components/ui/toast-1";
import { CREDIT_COSTS } from "@/lib/creditCosts";

/* ─── helpers ─── */


const emptyResumeData = {
  personalInfo: { fullName: "", email: "", phone: "", linkedin: "", location: "", website: "" },
  summary: "",
  workExperience: [],
  education: [],
  skills: { technical: [], soft: [] },
  projects: [],
  certifications: [],
};

const sc = (score: number) => {
  if (score >= 70) return { color: "#10b981", bg: "rgba(16,185,129,0.08)", border: "rgba(16,185,129,0.22)", glow: "rgba(16,185,129,0.15)", label: "Excellent", grad: "linear-gradient(135deg,#10b981,#059669)" };
  if (score >= 45) return { color: "#f59e0b", bg: "rgba(245,158,11,0.08)", border: "rgba(245,158,11,0.22)", glow: "rgba(245,158,11,0.15)", label: "Average", grad: "linear-gradient(135deg,#f59e0b,#d97706)" };
  return { color: "#ef4444", bg: "rgba(239,68,68,0.08)", border: "rgba(239,68,68,0.22)", glow: "rgba(239,68,68,0.15)", label: "Needs Work", grad: "linear-gradient(135deg,#ef4444,#dc2626)" };
};

/* ─── collapsible section wrapper ─── */
function Section({ title, icon: Icon, defaultOpen = true, badge, children, accentColor, step }: {
  title: string; icon: React.ElementType; defaultOpen?: boolean;
  badge?: string | number; children: React.ReactNode; accentColor?: string; step?: number;
}) {
  const [open, setOpen] = useState(defaultOpen);
  const [hovered, setHovered] = useState(false);
  return (
    <div style={{
      background: "var(--card)",
      border: `1px solid ${open ? (accentColor ? `${accentColor}28` : "var(--border-accent)") : hovered ? "var(--border-accent)" : "var(--border)"}`,
      borderRadius: "16px", overflow: "hidden",
      boxShadow: open ? `0 6px 24px ${accentColor ? `${accentColor}0c` : "rgba(99,102,241,0.07)"}` : "none",
      transition: "border-color 0.2s, box-shadow 0.25s",
    }}>
      <button
        onClick={() => setOpen(o => !o)}
        onMouseEnter={() => setHovered(true)}
        onMouseLeave={() => setHovered(false)}
        style={{
          width: "100%", display: "flex", alignItems: "center", justifyContent: "space-between",
          padding: "0.85rem 1.1rem",
          background: open
            ? `linear-gradient(135deg, ${accentColor ? `${accentColor}07` : "rgba(99,102,241,0.04)"} 0%, transparent 60%)`
            : "transparent",
          border: "none", cursor: "pointer",
          borderBottom: open ? `1px solid ${accentColor ? `${accentColor}15` : "var(--border)"}` : "none",
          transition: "all 0.18s",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: "0.6rem" }}>
          {step !== undefined && (
            <div style={{
              width: 20, height: 20, borderRadius: "50%", flexShrink: 0,
              background: open ? (accentColor || "var(--accent)") : "var(--bg-3)",
              border: `1.5px solid ${open ? (accentColor || "var(--accent)") : "var(--border)"}`,
              display: "flex", alignItems: "center", justifyContent: "center",
              fontSize: "0.6rem", fontWeight: 800, color: open ? "#fff" : "var(--text-muted)",
              transition: "all 0.2s", flexDirection: "column",
            }}>{step}</div>
          )}
          <div style={{
            width: 28, height: 28, borderRadius: "8px", flexShrink: 0,
            background: open ? (accentColor ? `${accentColor}18` : "var(--accent-soft)") : "var(--bg-2)",
            border: `1px solid ${open ? (accentColor ? `${accentColor}28` : "var(--border-accent)") : "var(--border)"}`,
            display: "flex", alignItems: "center", justifyContent: "center",
            transition: "all 0.2s",
          }}>
            <Icon size={13} color={open ? (accentColor || "var(--accent)") : "var(--text-muted)"} />
          </div>
          <span style={{ fontFamily: "Syne, sans-serif", fontWeight: 700, fontSize: "0.86rem", color: open ? "var(--text)" : "var(--text-muted)", letterSpacing: "-0.01em", transition: "color 0.2s" }}>{title}</span>
          {badge !== undefined && (
            <span style={{
              fontSize: "0.62rem", fontWeight: 700, padding: "0.12rem 0.5rem",
              borderRadius: "9999px",
              background: accentColor ? `${accentColor}14` : "var(--accent-soft)",
              color: accentColor || "var(--accent)",
              border: `1px solid ${accentColor ? `${accentColor}25` : "var(--border-accent)"}`,
            }}>{badge}</span>
          )}
        </div>
        <div style={{
          width: 20, height: 20, borderRadius: "6px", background: "var(--bg-2)", border: "1px solid var(--border)",
          display: "flex", alignItems: "center", justifyContent: "center",
          transition: "transform 0.25s cubic-bezier(0.16,1,0.3,1)",
          transform: open ? "rotate(180deg)" : "none",
        }}>
          <ChevronDown size={11} color="var(--text-muted)" />
        </div>
      </button>
      <div style={{
        display: "grid",
        gridTemplateRows: open ? "1fr" : "0fr",
        transition: "grid-template-rows 0.28s cubic-bezier(0.16,1,0.3,1)",
      }}>
        <div style={{ overflow: "hidden" }}>
          <div style={{ padding: "1rem 1.1rem" }}>{children}</div>
        </div>
      </div>
    </div>
  );
}

/* ─── keyword pill ─── */
function Pill({ text, weight, color, border, bg }: { text: string; weight?: number; color: string; border: string; bg: string }) {
  const [hov, setHov] = useState(false);
  return (
    <span
      onMouseEnter={() => setHov(true)}
      onMouseLeave={() => setHov(false)}
      style={{
        display: "inline-flex", alignItems: "center", gap: "0.3rem",
        padding: "0.22rem 0.65rem", borderRadius: "8px", fontSize: "0.72rem",
        fontWeight: 600, background: hov ? `${color}18` : bg, color,
        border: `1px solid ${hov ? `${color}50` : border}`,
        cursor: "default", transition: "all 0.15s",
        transform: hov ? "translateY(-1px)" : "none",
        boxShadow: hov ? `0 2px 8px ${color}20` : "none",
      }}>
      {text}
      {weight !== undefined && (
        <span style={{ fontSize: "0.6rem", fontWeight: 700, background: `${color}22`, padding: "0 4px", borderRadius: "4px" }}>{weight}</span>
      )}
    </span>
  );
}

export default function ResumeDetailPage() {
  const { user, loading: authLoading } = useAuth();
  const { showToast } = useToast();
  const router = useRouter();
  const params = useParams();

  const [resume, setResume] = useState<Resume | null>(null);
  const [loading, setLoading] = useState(true);

  const [selectedTemplate, setSelectedTemplate] = useState("jakes-resume");
  const [zoomFactor, setZoomFactor] = useState(0.85);
  const [isFullscreen, setIsFullscreen] = useState(false);



  const [shareToken, setShareToken] = useState<string | null>(null);
  const [isSharePublic, setIsSharePublic] = useState(true);
  const [shareLoading, setShareLoading] = useState(false);
  const [shareViews, setShareViews] = useState(0);

  const [docxLoading, setDocxLoading] = useState(false);
  const [naukriTips, setNaukriTips] = useState<{ area: string; tip: string; priority: string }[]>([]);
  const [naukriLoading, setNaukriLoading] = useState(false);
  const [naukriFetched, setNaukriFetched] = useState(false);

  const [suggestions, setSuggestions] = useState<any[]>([]);
  const [suggestionsLoading, setSuggestionsLoading] = useState(false);
  const [suggestionsFetched, setSuggestionsFetched] = useState(false);
  const [addingKeywords, setAddingKeywords] = useState(false);

  const [showSuggestionsModal, setShowSuggestionsModal] = useState(false);
  const [estimatedNewScore, setEstimatedNewScore] = useState(0);
  const [isApplyingSuggestions, setIsApplyingSuggestions] = useState(false);

  const [previewMode, setPreviewMode] = useState<"pdf" | "live">("live");

  const [showCreditPrompt, setShowCreditPrompt] = useState(false);

  const [modifiedResumeData, setModifiedResumeData] = useState<any | null>(null);
  const [hasUnappliedChanges, setHasUnappliedChanges] = useState(false);
  const [showSaveNewModal, setShowSaveNewModal] = useState(false);
  const [saveNewName, setSaveNewName] = useState("");
  const [savingNew, setSavingNew] = useState(false);
  const [savingCurrent, setSavingCurrent] = useState(false);
  const [savedNewResumeId, setSavedNewResumeId] = useState<string | null>(null);
  const [highlightedChanges, setHighlightedChanges] = useState<string[]>([]);

  // ── Undo / Redo history stacks ──────────────────────────────────────────
  const [history, setHistory] = useState<any[]>([]); // past snapshots (max 20)
  const [future, setFuture] = useState<any[]>([]);   // redo snapshots

  const [applyingTipIdx, setApplyingTipIdx] = useState<number | null>(null);
  const [appliedTipPatches, setAppliedTipPatches] = useState<Record<number, any>>({});
  const [selectedTipIdxs, setSelectedTipIdxs] = useState<Set<number>>(new Set());
  const [naukriApplyMode, setNaukriApplyMode] = useState(false);

  // ── pushHistory: snapshot current data before mutating ─────────────────
  const pushHistory = useCallback((snapshot: any) => {
    setHistory(prev => [...prev.slice(-19), JSON.parse(JSON.stringify(snapshot))]);
    setFuture([]); // new change clears redo stack
  }, []);

  // ── Undo ────────────────────────────────────────────────────────────────
  const handleUndo = useCallback(() => {
    setHistory(prev => {
      if (!prev.length) return prev;
      const snapshot = prev[prev.length - 1];
      setFuture(f => [modifiedResumeData, ...f]);
      setModifiedResumeData(snapshot);
      setHasUnappliedChanges(prev.length > 1);
      return prev.slice(0, -1);
    });
  }, [modifiedResumeData]);

  // ── Redo ────────────────────────────────────────────────────────────────
  const handleRedo = useCallback(() => {
    setFuture(prev => {
      if (!prev.length) return prev;
      const snapshot = prev[0];
      setHistory(h => [...h, modifiedResumeData]);
      setModifiedResumeData(snapshot);
      setHasUnappliedChanges(true);
      return prev.slice(1);
    });
  }, [modifiedResumeData]);

  // ── Save Changes → always create a NEW resume record ──────────
  const handleSaveCurrentResume = useCallback(async () => {
    if (!resume || !modifiedResumeData) return;
    setSavingCurrent(true);
    try {
      const rawText = [
        modifiedResumeData.personalInfo?.fullName || "",
        modifiedResumeData.personalInfo?.email || "",
        modifiedResumeData.summary || "",
        ...(modifiedResumeData.workExperience?.flatMap((w: any) => [w.company, w.role, ...(w.bullets || [])]) || []),
        ...(modifiedResumeData.skills?.technical || []),
        ...(modifiedResumeData.skills?.soft || []),
        ...(modifiedResumeData.certifications?.map((c: any) => c.name) || []),
      ].join("\n");
      const res = await fetch("/api/save-resume", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          // OMITTING ID to force an INSERT (save as new)
          file_name: `${resume.file_name} (Optimized)`,
          raw_text: rawText,
          resume_data: modifiedResumeData,
          template_id: selectedTemplate,
          ats_score: resume.ats_score,
          content_review: resume.content_review,
          jd_match: resume.jd_match,
        }),
      });
      if (res.ok) {
        const newResume = await res.json();
        setHasUnappliedChanges(false);
        setHistory([]); // clear after save
        setFuture([]);
        setHighlightedChanges([]);
        showToast("Changes saved as a new resume!", "success");
        // Redirect to the newly created resume
        router.push(`/resume/${newResume.id}`);
      } else {
        showToast("Failed to save. Please try again.", "error");
      }
    } catch { showToast("Error saving resume.", "error"); }
    finally { setSavingCurrent(false); }
  }, [resume, modifiedResumeData, selectedTemplate, showToast, router]);

  const fetchSuggestions = async () => {
    if (!resume || suggestionsFetched || suggestionsLoading) return;
    setSuggestionsLoading(true);
    try {
      const res = await fetch("/api/resume/suggestions/comprehensive-analyze", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          resumeId: resume.id,
          resumeText: resume.raw_text,
          detectedRole: resume.ats_score?.detectedRole,
          detectedIndustry: resume.ats_score?.detectedIndustry
        })
      });
      if (res.status === 403) {
        const errData = await res.json();
        showToast(errData.error || `Insufficient credits. Finding improvements costs ${CREDIT_COSTS.AI_IMPROVEMENTS_GENERATE} credits.`, "error");
        return;
      }
      if (res.ok) {
        const data = await res.json();
        if (data.suggestions) {
          setSuggestions(data.suggestions);
          setEstimatedNewScore(Math.min(100, (resume.ats_score?.overall || 0) + Math.round(data.suggestions.length * 1.5)));
          setSuggestionsFetched(true);
          setShowSuggestionsModal(true); // Open flow immediately when fetched
        }
      }
    } catch (err) { console.error(err); }
    finally { setSuggestionsLoading(false); }
  };

  const fetchNaukriTips = async () => {
    if (!resume || naukriFetched || naukriLoading) return;
    setNaukriLoading(true);
    try {
      const res = await fetch("/api/naukri-tips", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ resumeId: resume.id })
      });
      if (res.status === 403) {
        const errData = await res.json();
        showToast(errData.error || `Insufficient credits. Loading tips costs ${CREDIT_COSTS.NAUKRI_SEO_TIPS} credits.`, "error");
        return;
      }
      if (res.ok) {
        const data = await res.json();
        if (data.tips) { setNaukriTips(data.tips); setNaukriFetched(true); }
      }
    } catch (err) { console.error(err); }
    finally { setNaukriLoading(false); }
  };

  const handleDownloadDocx = async () => {
    if (!resume) return;
    setDocxLoading(true);
    try {
      const res = await fetch("/api/export-resume", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ resumeId: resume.id })
      });
      if (res.ok) {
        const blob = await res.blob();
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url; a.download = `${resume.file_name || "Resume"}.docx`;
        document.body.appendChild(a); a.click(); a.remove();
        window.URL.revokeObjectURL(url);
      } else showToast("Failed to export Word document.", "error");
    } catch { showToast("Error exporting Word document.", "error"); }
    finally { setDocxLoading(false); }
  };

  const handleAddMissingKeywords = async () => {
    if (!resume || !resume.ats_score) return;
    const details = resume.ats_score.missingKeywordDetails || [];
    const strings = resume.ats_score.missingKeywords || [];
    const keywordsToAdd = details.length > 0 ? details.map((k) => k.keyword) : strings;
    if (keywordsToAdd.length === 0) return;
    setAddingKeywords(true);
    try {
      const currentSkills = resume.resume_data?.skills?.technical || [];
      const newSkills = [...new Set([...currentSkills, ...keywordsToAdd])];
      const updatedResumeData = { ...resume.resume_data, skills: { ...resume.resume_data?.skills, technical: newSkills } };
      const updatedAtsScore = { ...resume.ats_score, missingKeywordDetails: [], missingKeywords: [], keywordMatches: [...(resume.ats_score.keywordMatches || []), ...(resume.ats_score.missingKeywordDetails || [])], matchedKeywords: [...(resume.ats_score.matchedKeywords || []), ...(resume.ats_score.missingKeywords || [])] };
      const res = await fetch("/api/save-resume", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: resume.id, file_name: resume.file_name, raw_text: resume.raw_text, resume_data: updatedResumeData, template_id: resume.template_id, ats_score: updatedAtsScore, content_review: resume.content_review, jd_match: resume.jd_match }),
      });
      if (res.ok) { const updated = await res.json(); setResume(updated); showToast(`Injected ${keywordsToAdd.length} missing keywords into Technical Skills!`, "success"); }
      else showToast("Failed to save updated resume.", "error");
    } catch { showToast("Error adding missing keywords.", "error"); }
    finally { setAddingKeywords(false); }
  };

  const fetchShareStatus = async () => {
    if (!params.id) return;
    try {
      const res = await fetch(`/api/share?resumeId=${params.id}`);
      if (res.ok) { const data = await res.json(); if (data.token) { setShareToken(data.token); setIsSharePublic(data.is_public); setShareViews(data.views_count || 0); } }
    } catch (err) { console.error("Failed to fetch share status:", err); }
  };

  const handleToggleShare = async () => {
    if (!resume) return;
    setShareLoading(true);
    try {
      const nextPublic = !shareToken ? true : !isSharePublic;
      const res = await fetch("/api/share", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ resumeId: resume.id, isPublic: nextPublic }) });
      const data = await res.json();
      if (res.ok && data.token) { setShareToken(data.token); setIsSharePublic(data.is_public); setShareViews(data.views_count || 0); }
    } catch { showToast("Error toggling resume share status.", "error"); }
    finally { setShareLoading(false); }
  };

  const fetchResumeData = () => {
    if (authLoading || !user) return;
    setLoading(true);
    fetch(`/api/get-resumes?t=${Date.now()}`, { cache: "no-store" })
      .then((r) => r.json())
      .then((data: Resume[]) => {
        const found = data.find((r) => r.id === params.id);
        if (found) { setResume(found); setModifiedResumeData(JSON.parse(JSON.stringify(found.resume_data || {}))); if (found.template_id) setSelectedTemplate(found.template_id); }
        setLoading(false);
      })
      .catch(() => setLoading(false));
  };

  const handleApplySuggestionsInline = (selectedSuggestions: any[]) => {
    if (!resume) return;
    pushHistory(modifiedResumeData ?? resume.resume_data);
    const base = JSON.parse(JSON.stringify(modifiedResumeData || resume.resume_data || {}));
    for (const s of selectedSuggestions) {
      const text = s.suggestedText || s.suggested_text || "";
      const where = s.whereToAdd || (s.category === "technical" ? "skills" : "experience");
      const category = s.category || "technical";
      if (where === "skills" || where === "skills_technical") {
        if (!base.skills) base.skills = { technical: [], soft: [] };
        const type = category === "soft_skill" ? "soft" : "technical";
        if (!base.skills[type]) base.skills[type] = [];
        if (text && !base.skills[type].includes(text)) base.skills[type].push(text);
      } else if (where === "summary") {
        base.summary = text + (base.summary ? " " + base.summary : "");
      } else if (where === "experience") {
        if (!base.workExperience) base.workExperience = [];
        if (base.workExperience.length > 0) {
          if (!base.workExperience[0].bullets) base.workExperience[0].bullets = [];
          if (text && !base.workExperience[0].bullets.includes(text)) base.workExperience[0].bullets.push(text);
        }
      } else if (where === "certifications") {
        if (!base.certifications) base.certifications = [];
        base.certifications.push({ id: Date.now().toString(), name: text, issuer: "", date: "" });
      }
    }
    setModifiedResumeData(base);
    setHasUnappliedChanges(true);
    setHighlightedChanges(prev => [...prev, ...selectedSuggestions.map(s => s.suggestedText || s.suggested_text || "")].filter(Boolean));
    setSuggestions(prev => prev.filter(s => !selectedSuggestions.some(sel => sel.id === s.id)));
    setShowSuggestionsModal(false);
    showToast(`${selectedSuggestions.length} change(s) applied! Click "Save Changes" to persist.`, "success");
  };

  const handleApplyComprehensive = async (acceptedSuggestionsList: any[]) => {
    if (acceptedSuggestionsList.length === 0 || !resume) return;
    setIsApplyingSuggestions(true);
    try {
      const ids = acceptedSuggestionsList.map(s => s.id);
      const res = await fetch("/api/resume/suggestions/apply-comprehensive", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ 
          resumeId: resume.id, 
          applySuggestionIds: ids 
        })
      });
      if (res.ok) {
        const data = await res.json();
        showToast("Changes applied successfully to a new resume!", "success");
        setShowSuggestionsModal(false);
        setSuggestionsFetched(false); // allow fetching again later if needed
        if (data.newResumeId) {
          router.push(`/resume/${data.newResumeId}`);
        } else {
          fetchResumeData();
        }
      } else {
        throw new Error("Failed to apply suggestions");
      }
    } catch (err) {
      console.error(err);
      showToast("Failed to apply suggestions. Please try again.", "error");
    } finally {
      setIsApplyingSuggestions(false);
    }
  };

  const handleApplyNaukriTipPatch = (idx: number, patch: any) => {
    pushHistory(modifiedResumeData ?? resume?.resume_data);
    const base = JSON.parse(JSON.stringify(modifiedResumeData || resume?.resume_data || {}));
    if (patch.field === "summary") { base.summary = patch.suggestedValue; }
    else if (patch.field === "skills_technical") { const skills = patch.suggestedValue.split(",").map((s: string) => s.trim()).filter(Boolean); if (!base.skills) base.skills = { technical: [], soft: [] }; base.skills.technical = [...new Set([...(base.skills.technical || []), ...skills])]; }
    else if (patch.field === "skills_soft") { const skills = patch.suggestedValue.split(",").map((s: string) => s.trim()).filter(Boolean); if (!base.skills) base.skills = { technical: [], soft: [] }; base.skills.soft = [...new Set([...(base.skills.soft || []), ...skills])]; }
    setModifiedResumeData(base);
    setHasUnappliedChanges(true);
    setAppliedTipPatches(prev => ({ ...prev, [idx]: patch }));
    const newChanges = patch.field.startsWith("skills") ? patch.suggestedValue.split(",").map((s: string) => s.trim()) : [patch.suggestedValue];
    setHighlightedChanges(prev => [...prev, ...newChanges].filter(Boolean));
    showToast("Tip applied! Click \"Save Changes\" to persist.", "success");
  };

  const handleGenerateNaukriTipFix = async (idx: number, tip: { area: string; tip: string }) => {
    if (!resume) return;
    setApplyingTipIdx(idx);
    try {
      const res = await fetch("/api/naukri-tips/apply", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ resumeId: resume.id, tipArea: tip.area, tipText: tip.tip }) });
      if (res.status === 403) {
        const errData = await res.json();
        showToast(errData.error || `Insufficient credits. Apply Fix costs ${CREDIT_COSTS.NAUKRI_APPLY_FIX} credits.`, "error");
        return;
      }
      if (res.ok) { const data = await res.json(); if (data.patch) handleApplyNaukriTipPatch(idx, data.patch); }
      else showToast("Could not generate a fix for this tip. Please try again.", "error");
    } catch { showToast("Error applying tip.", "error"); }
    finally { setApplyingTipIdx(null); }
  };

  // Small helper: render an inline credit cost pill
  const CreditBadge = ({ cost, free }: { cost?: number; free?: boolean }) => (
    <span style={{
      display: "inline-flex", alignItems: "center", gap: "0.2rem",
      fontSize: "0.6rem", fontWeight: 700, padding: "0.08rem 0.4rem",
      borderRadius: "9999px",
      background: free ? "rgba(16,185,129,0.12)" : "rgba(245,158,11,0.12)",
      color: free ? "#10b981" : "#d97706",
      border: `1px solid ${free ? "rgba(16,185,129,0.25)" : "rgba(245,158,11,0.25)"}`,
      letterSpacing: "0.03em", whiteSpace: "nowrap",
    }}>
      {free ? (
        <><CheckCircle2 size={8} /> Free</>
      ) : (
        <><Zap size={8} /> {cost} credits</>
      )}
    </span>
  );

  const handleSaveAsNewResume = async () => {
    if (!resume || !modifiedResumeData) return;
    setSavingNew(true);
    try {
      const rawText = [
        modifiedResumeData.personalInfo?.fullName || "",
        modifiedResumeData.personalInfo?.email || "",
        modifiedResumeData.summary || "",
        ...(modifiedResumeData.workExperience?.flatMap((w: any) => [w.company, w.role, ...(w.bullets || [])]) || []),
        ...(modifiedResumeData.skills?.technical || []),
        ...(modifiedResumeData.skills?.soft || []),
        ...(modifiedResumeData.certifications?.map((c: any) => c.name) || []),
      ].join("\n");
      const res = await fetch("/api/save-resume", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ file_name: saveNewName.trim() || `${resume.file_name} (Optimized)`, raw_text: rawText, resume_data: modifiedResumeData, template_id: selectedTemplate, ats_score: resume.ats_score, content_review: resume.content_review, jd_match: resume.jd_match }),
      });
      if (res.ok) {
        const newResume = await res.json();
        setSavedNewResumeId(newResume.id);
        setShowSaveNewModal(false);
        setHasUnappliedChanges(false);
        showToast(`Saved as "${saveNewName.trim() || resume.file_name + " (Optimized)"}". View it on your Dashboard.`, "success");
      } else showToast("Failed to save. Please try again.", "error");
    } catch { showToast("Error saving new resume.", "error"); }
    finally { setSavingNew(false); }
  };

  useEffect(() => { if (!authLoading && !user) router.push("/login"); }, [authLoading, user, router]);
  useEffect(() => { fetchResumeData(); fetchShareStatus(); }, [authLoading, user, params.id]);
  useEffect(() => { if (resume && !naukriFetched) fetchNaukriTips(); }, [resume, naukriFetched]);

  useEffect(() => {
    if (resume?.file_name?.includes("AI Improved") || hasUnappliedChanges || !((resume as any)?.pdf_url || (resume?.resume_data as any)?.pdf_url)) {
      setPreviewMode("live");
    } else {
      setPreviewMode("pdf");
    }
  }, [resume?.file_name, hasUnappliedChanges, (resume as any)?.pdf_url, (resume?.resume_data as any)?.pdf_url]);

  // ── Keyboard shortcuts: Ctrl+Z = Undo, Ctrl+Y / Ctrl+Shift+Z = Redo ────
  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      if (!hasUnappliedChanges && !history.length && !future.length) return;
      if ((e.ctrlKey || e.metaKey) && !e.shiftKey && e.key === "z") { e.preventDefault(); handleUndo(); }
      if ((e.ctrlKey || e.metaKey) && (e.key === "y" || (e.shiftKey && e.key === "z"))) { e.preventDefault(); handleRedo(); }
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [handleUndo, handleRedo, hasUnappliedChanges, history.length, future.length]);

  const handleTemplateChange = async (tplId: string) => {
    setSelectedTemplate(tplId);
    if (!resume) return;
    try {
      const res = await fetch("/api/save-resume", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ id: resume.id, file_name: resume.file_name, raw_text: resume.raw_text, resume_data: resume.resume_data, template_id: tplId, ats_score: resume.ats_score, content_review: resume.content_review, jd_match: resume.jd_match }) });
      if (res.ok) { const updated = await res.json(); setResume(updated); }
    } catch { console.error("Failed to update template:"); }
  };



  const [isPrinting, setIsPrinting] = useState(false);

  const handlePrint = async () => {
    setIsPrinting(true);
    try {
      const res = await fetch("/api/billing/charge-pdf", {
        method: "POST",
      });
      const data = await res.json();
      
      if (!res.ok) {
        showToast(data.error || "Insufficient credits for PDF download", "error");
        return;
      }
      
      window.print();
    } catch (err: any) {
      showToast("Error processing request. Try again.", "error");
    } finally {
      setIsPrinting(false);
    }
  };

  const getMissingSections = (data: any) => {
    const missing = [];
    if (!data?.personalInfo?.fullName) missing.push("Full Name");
    if (!data?.personalInfo?.email) missing.push("Email Address");
    if (!data?.summary) missing.push("Professional Summary");
    if (!data?.workExperience || data.workExperience.length === 0) missing.push("Work Experience");
    if (!data?.education || data.education.length === 0) missing.push("Education");
    if (!data?.skills?.technical || data.skills.technical.length === 0) missing.push("Technical Skills");
    return missing;
  };

  const getCompletionStats = (data: any) => {
    let completedSteps = 0;
    if (data?.personalInfo?.fullName && data?.personalInfo?.email) completedSteps++;
    if (data?.summary?.trim()?.length > 10) completedSteps++;
    if (data?.workExperience?.length > 0) completedSteps++;
    if (data?.education?.length > 0) completedSteps++;
    if (data?.skills?.technical?.length > 0) completedSteps++;
    if (data?.projects?.length > 0) completedSteps++;
    if (data?.certifications?.length > 0) completedSteps++;
    return Math.round((completedSteps / 7) * 100);
  };

  if (authLoading || loading || !user) return (
    <div style={{ minHeight: "100vh", background: "var(--bg)", display: "flex", alignItems: "center", justifyContent: "center" }}>
      <div className="spinner" style={{ width: 32, height: 32 }} />
    </div>
  );

  if (!resume) return (
    <div style={{ minHeight: "100vh", background: "var(--bg)" }}>
      <Navbar />
      <div style={{ textAlign: "center", padding: "6rem 2rem" }}>
        <h2 style={{ fontFamily: "Syne, sans-serif", fontSize: "1.5rem" }}>Resume record not found</h2>
        <p style={{ color: "var(--text-muted)", marginTop: "0.5rem" }}>Ensure you are logged into the correct user workspace account.</p>
        <Link href="/dashboard" style={{ display: "inline-block", marginTop: "1.5rem" }}>
          <button className="btn-secondary">Back to Dashboard</button>
        </Link>
      </div>
    </div>
  );

  const hasDeepAnalysis = !!resume.content_review;
  const missingSecs = getMissingSections(resume.resume_data);
  const completionPercent = getCompletionStats(resume.resume_data);
  const atsColor = resume.ats_score ? sc(resume.ats_score.overall) : null;

  const TEMPLATES = [
    { value: "jakes-resume", label: "Jake's Resume" },
    { value: "altacv-modern", label: "AltaCV Modern" },
    { value: "curve-timeline", label: "CurVe Timeline" },
    { value: "hipster-sidebar", label: "Hipster Sidebar" },
    { value: "deedy-cs", label: "Deedy CS" },
    { value: "awesome-corporate", label: "Awesome Corporate" },
    { value: "plasmati-academic", label: "Plasmati Academic" },
  ];

  return (
    <div style={{ minHeight: "100vh", background: "var(--bg)", position: "relative", overflow: "hidden" }}>
      <ParticleBackground count={50} connectionDist={110} />
      <div style={{ position: "relative", zIndex: 10, display: "flex", flexDirection: "column", minHeight: "100vh" }}>
        <Navbar />

        {/* Suggestions Modal (now using SuggestionFlow) */}
        {showSuggestionsModal && resume && resume.ats_score && (
          <div style={{ position: "fixed", inset: 0, zIndex: 9999, background: "var(--bg)", overflowY: "auto" }}>
            <div style={{ padding: "2rem", maxWidth: "1200px", margin: "0 auto" }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "1rem" }}>
                <h2 style={{ fontFamily: "Syne, sans-serif", fontSize: "1.8rem", fontWeight: 800 }}>Comprehensive Analysis</h2>
                <button 
                  onClick={() => setShowSuggestionsModal(false)}
                  style={{ background: "var(--card)", border: "1px solid var(--border)", padding: "0.5rem", borderRadius: "50%", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center" }}
                >
                  <X size={20} color="var(--text)" />
                </button>
              </div>
              
              {isApplyingSuggestions ? (
                <div style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", padding: "4rem 0" }}>
                   <div className="spinner" style={{ width: 40, height: 40, marginBottom: "1rem" }} />
                   <div style={{ fontSize: "1.1rem", fontWeight: 600 }}>Applying Suggestions...</div>
                   <div style={{ fontSize: "0.9rem", color: "var(--text-muted)", marginTop: "0.5rem" }}>Optimizing your resume directly in the database.</div>
                </div>
              ) : (
                <div style={{ display: "grid", gridTemplateColumns: "320px 1fr", gap: "2rem", alignItems: "start" }}>
                  <div style={{ background: "var(--card)", border: "1px solid var(--border)", borderRadius: "16px", padding: "1.8rem" }}>
                    <h3 style={{ fontSize: "1.2rem", fontWeight: 800, marginBottom: "1.5rem", fontFamily: "Syne, sans-serif" }}>ATS Score</h3>
                    
                    <div style={{ display: "flex", alignItems: "baseline", gap: "0.5rem", marginBottom: "2.5rem" }}>
                       <span style={{ fontSize: "3.5rem", fontWeight: 800, lineHeight: 1, color: resume.ats_score.overall >= 80 ? "#10b981" : resume.ats_score.overall >= 60 ? "#f59e0b" : "#ef4444" }}>
                         {resume.ats_score.overall}
                       </span>
                       <span style={{ fontSize: "1rem", color: "var(--text-muted)", fontWeight: 600 }}>/ 100</span>
                       <span style={{ marginLeft: "auto", fontSize: "0.8rem", fontWeight: 700, padding: "0.25rem 0.7rem", borderRadius: "12px", background: resume.ats_score.overall >= 80 ? "rgba(16,185,129,0.15)" : resume.ats_score.overall >= 60 ? "rgba(245,158,11,0.15)" : "rgba(239,68,68,0.15)", color: resume.ats_score.overall >= 80 ? "#10b981" : resume.ats_score.overall >= 60 ? "#f59e0b" : "#ef4444" }}>
                         {resume.ats_score.overall >= 80 ? "Excellent" : resume.ats_score.overall >= 60 ? "Average" : "Needs Work"}
                       </span>
                    </div>

                    <div style={{ display: "flex", flexDirection: "column", gap: "1.5rem" }}>
                      {[
                        { key: "profile_fill", label: "Profile Fill", val: completionPercent },
                        { key: "keywords", label: "Keywords", val: resume.ats_score.breakdown.keywords },
                        { key: "sections", label: "Sections", val: resume.ats_score.breakdown.sections },
                        { key: "formatting", label: "Formatting", val: resume.ats_score.breakdown.formatting },
                        { key: "readability", label: "Readability", val: resume.ats_score.breakdown.readability }
                      ].map(m => {
                        const color = m.val >= 80 ? "#10b981" : m.val >= 60 ? "#f59e0b" : "#ef4444";
                        const label = m.val >= 80 ? "Excellent" : m.val >= 60 ? "Average" : "Needs Work";
                        return (
                          <div key={m.key}>
                            <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "0.5rem", fontSize: "0.9rem", fontWeight: 700, color: "var(--text)" }}>
                              <span>{m.label}</span>
                              <span style={{ color }}>{m.val} <span style={{ fontSize: "0.75rem", color: "var(--text-muted)" }}>/100</span></span>
                            </div>
                            <div style={{ height: "6px", background: "var(--bg-2)", borderRadius: "3px", overflow: "hidden", marginBottom: "0.4rem" }}>
                               <div style={{ height: "100%", width: `${m.val}%`, background: color, borderRadius: "3px" }} />
                            </div>
                            <div style={{ textAlign: "right", fontSize: "0.75rem", fontWeight: 600, color: "var(--text-muted)" }}>
                              {label}
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>

                  <div style={{ minWidth: 0 }}>
                    <SuggestionFlow
                      suggestions={suggestions}
                      currentScore={resume.ats_score.overall}
                      estimatedNewScore={estimatedNewScore}
                      onApplyChanges={handleApplyComprehensive}
                    />
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Save-as-New Modal */}
        {showSaveNewModal && (
          <div style={{ position: "fixed", inset: 0, zIndex: 1000, background: "rgba(0,0,0,0.7)", display: "flex", alignItems: "center", justifyContent: "center", padding: "1.5rem", backdropFilter: "blur(8px)" }}>
            <div style={{ maxWidth: "460px", width: "100%", background: "var(--card)", borderRadius: "20px", padding: "1.8rem", display: "grid", gap: "1.2rem", boxShadow: "0 24px 60px rgba(0,0,0,0.5)", border: "1px solid var(--border-accent)" }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <h3 style={{ fontFamily: "Syne, sans-serif", fontSize: "1.15rem", fontWeight: 800, margin: 0, display: "flex", alignItems: "center", gap: "0.5rem" }}>
                  <Save size={17} color="#10b981" /> Save as New Resume
                </h3>
                <button onClick={() => setShowSaveNewModal(false)} style={{ background: "none", border: "none", color: "var(--text-muted)", cursor: "pointer" }}><X size={17} /></button>
              </div>
              <p style={{ color: "var(--text-muted)", fontSize: "0.83rem", margin: 0, lineHeight: 1.5 }}>
                Your original resume stays unchanged. This saves a <strong>new copy</strong> with your applied improvements.
              </p>
              <div>
                <label style={{ fontSize: "0.76rem", fontWeight: 700, color: "var(--text-muted)", display: "block", marginBottom: "0.4rem", textTransform: "uppercase" }}>New Resume Name</label>
                <input className="input" value={saveNewName} onChange={e => setSaveNewName(e.target.value)} placeholder={`${resume.file_name} (Optimized)`} onKeyDown={e => e.key === "Enter" && handleSaveAsNewResume()} autoFocus />
              </div>
              <div style={{ display: "flex", gap: "0.8rem", justifyContent: "flex-end" }}>
                <button onClick={() => setShowSaveNewModal(false)} className="btn-secondary" style={{ fontSize: "0.84rem" }}>Cancel</button>
                <button onClick={handleSaveAsNewResume} disabled={savingNew} className="btn-primary" style={{ fontSize: "0.84rem", background: "linear-gradient(135deg, #10b981 0%, #059669 100%)", border: "none" }}>
                  {savingNew ? "Saving..." : "Save New Resume"}
                </button>
              </div>
            </div>
          </div>
        )}

        {/* ── TOPBAR ── */}
        <div className="no-print" style={{
          background: "linear-gradient(135deg, var(--card) 0%, var(--bg-2) 100%)",
          borderBottom: "1px solid var(--border)",
          padding: "1rem 1.8rem",
          position: "relative", overflow: "hidden",
        }}>
          {/* subtle glow orb */}
          <div style={{ position: "absolute", top: "-60px", right: "100px", width: 200, height: 200, borderRadius: "50%", background: "radial-gradient(circle, rgba(99,102,241,0.08) 0%, transparent 70%)", pointerEvents: "none" }} />
          <div style={{ maxWidth: "1500px", margin: "0 auto", position: "relative" }}>
            {/* Breadcrumb */}
            <div style={{ display: "flex", alignItems: "center", gap: "0.4rem", marginBottom: "0.55rem" }}>
              <Link href="/dashboard" style={{ textDecoration: "none", color: "var(--text-muted)", fontSize: "0.78rem", display: "inline-flex", alignItems: "center", gap: "0.3rem", transition: "color 0.15s" }}
                onMouseEnter={e => (e.currentTarget.style.color = "var(--text)")}
                onMouseLeave={e => (e.currentTarget.style.color = "var(--text-muted)")}>
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><line x1="19" y1="12" x2="5" y2="12" /><polyline points="12 19 5 12 12 5" /></svg>
                Dashboard
              </Link>
              <span style={{ color: "var(--border-strong)", fontSize: "0.78rem" }}>/</span>
              <span style={{
                fontSize: "0.68rem", fontWeight: 700, padding: "0.18rem 0.65rem", borderRadius: "9999px",
                background: hasDeepAnalysis ? "rgba(99,102,241,0.12)" : "var(--bg-2)",
                color: hasDeepAnalysis ? "var(--accent)" : "var(--text-muted)",
                border: `1px solid ${hasDeepAnalysis ? "var(--border-accent)" : "var(--border)"}`,
                boxShadow: hasDeepAnalysis ? "0 0 12px rgba(99,102,241,0.15)" : "none",
                letterSpacing: "0.02em",
              }}>
                {hasDeepAnalysis ? "✦ Deep AI Enhanced" : "⚙ Local Analysis Only"}
              </span>
            </div>

            {/* Title + Actions row */}
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: "0.8rem" }}>
              <h1 style={{
                fontFamily: "Syne, sans-serif", fontSize: "1.5rem", fontWeight: 800, margin: 0,
                background: "linear-gradient(135deg, var(--text) 0%, var(--text-muted) 100%)",
                WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent",
                backgroundClip: "text",
              }}>
                {resume.file_name}
              </h1>
              <div style={{ display: "flex", alignItems: "center", gap: "0.5rem", flexWrap: "wrap" }}>
                <Link href={`/resume/builder?id=${resume.id}&template=${selectedTemplate}`}>
                  <button className="btn-primary" style={{ fontSize: "0.82rem", padding: "0.48rem 1.1rem", display: "inline-flex", alignItems: "center", gap: "0.4rem" }}>
                    <Edit3 size={13} /> Edit in Builder
                  </button>
                </Link>

                <button onClick={handlePrint} disabled={isPrinting} className="btn-secondary" style={{ fontSize: "0.82rem", padding: "0.48rem 1.1rem", display: "inline-flex", alignItems: "center", gap: "0.4rem" }}>
                  <Printer size={13} /> {isPrinting ? "Processing..." : "Print / PDF"}
                </button>
                <button onClick={handleDownloadDocx} disabled={docxLoading} className="btn-secondary" style={{ fontSize: "0.82rem", padding: "0.48rem 1.1rem", display: "inline-flex", alignItems: "center", gap: "0.4rem" }}>
                  <FileDown size={13} /> {docxLoading ? "Downloading..." : "DOCX"}
                </button>
              </div>
            </div>

            {/* Quick stats strip */}
            <div style={{
              display: "flex", gap: "0", alignItems: "stretch", flexWrap: "wrap",
              marginTop: "0.85rem", paddingTop: "0.85rem", borderTop: "1px solid var(--border)",
            }}>
              {[
                resume.ats_score && { icon: TrendingUp, iconColor: "var(--accent)", label: "ATS Score", value: `${resume.ats_score.overall}/100`, valueColor: sc(resume.ats_score.overall).color },
                { icon: Share2, iconColor: "#8b5cf6", label: "Sharing", value: shareToken && isSharePublic ? "Public" : "Private", valueColor: shareToken && isSharePublic ? "#10b981" : "#ef4444" },
                { icon: Eye, iconColor: "#3b82f6", label: "Views", value: String(shareViews), valueColor: "var(--text)" },
                { icon: Clock, iconColor: "#10b981", label: "Last Audit", value: resume.updated_at ? new Date(resume.updated_at).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" }) : "Never", valueColor: "var(--text)" },
              ].filter(Boolean).map((stat: any, i, arr) => (
                <div key={i} style={{
                  display: "flex", alignItems: "center", gap: "0.4rem",
                  paddingRight: i < arr.length - 1 ? "1.2rem" : 0,
                  marginRight: i < arr.length - 1 ? "1.2rem" : 0,
                  borderRight: i < arr.length - 1 ? "1px solid var(--border)" : "none",
                  fontSize: "0.78rem", color: "var(--text-muted)",
                }}>
                  <stat.icon size={12} color={stat.iconColor} />
                  <span>{stat.label}:</span>
                  <strong style={{ color: stat.valueColor, fontWeight: 700 }}>{stat.value}</strong>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* ── MAIN SPLIT ── */}
        <div style={{
          flex: 1, display: "grid",
          gridTemplateColumns: isFullscreen ? "1fr" : (((resume as any).pdf_url || (resume.resume_data as any).pdf_url) ? "minmax(0, 450px) 1fr" : "1fr"),
          maxWidth: (((resume as any).pdf_url || (resume.resume_data as any).pdf_url) && !isFullscreen) ? "1500px" : "1000px", width: "100%", margin: "0 auto",
          padding: "1.2rem 1.5rem", gap: "1.2rem",
          height: "calc(100vh - 160px)",
          overflow: "hidden",
        }}>

          {/* ── LEFT PANEL ── */}
          {!isFullscreen && (
            <div className="no-print" style={{ overflowY: "auto", display: "flex", flexDirection: "column", gap: "0.8rem", paddingRight: "4px", scrollbarGutter: "stable" }}>

              {/* ── Changes Applied — Undo / Redo / Save Bar ── */}
              {hasUnappliedChanges && (
                <div style={{
                  background: "linear-gradient(135deg, rgba(16,185,129,0.08), rgba(5,150,105,0.04))",
                  border: "1px solid rgba(16,185,129,0.28)", borderRadius: "12px",
                  padding: "0.75rem 1rem", display: "flex", flexDirection: "column", gap: "0.6rem",
                }}>
                  {/* Row 1: label + undo/redo */}
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: "0.5rem" }}>
                    <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
                      <CheckCircle2 size={14} color="#10b981" style={{ flexShrink: 0 }} />
                      <strong style={{ fontSize: "0.8rem", color: "#10b981" }}>Unsaved changes in preview</strong>
                    </div>
                    {/* Undo / Redo buttons */}
                    <div style={{ display: "flex", gap: "0.35rem" }}>
                      <button
                        onClick={handleUndo}
                        disabled={history.length === 0}
                        title="Undo (Ctrl+Z)"
                        style={{
                          display: "inline-flex", alignItems: "center", gap: "0.25rem",
                          background: history.length ? "var(--bg-2)" : "var(--bg-3)",
                          border: "1px solid var(--border)", borderRadius: "7px",
                          padding: "0.25rem 0.6rem", fontSize: "0.72rem", fontWeight: 700,
                          color: history.length ? "var(--text)" : "var(--text-muted)",
                          cursor: history.length ? "pointer" : "not-allowed", transition: "all 0.15s",
                        }}
                      >
                        <RotateCcw size={11} />
                        Undo{history.length > 0 && ` (${history.length})`}
                      </button>
                      <button
                        onClick={handleRedo}
                        disabled={future.length === 0}
                        title="Redo (Ctrl+Y)"
                        style={{
                          display: "inline-flex", alignItems: "center", gap: "0.25rem",
                          background: future.length ? "var(--bg-2)" : "var(--bg-3)",
                          border: "1px solid var(--border)", borderRadius: "7px",
                          padding: "0.25rem 0.6rem", fontSize: "0.72rem", fontWeight: 700,
                          color: future.length ? "var(--text)" : "var(--text-muted)",
                          cursor: future.length ? "pointer" : "not-allowed", transition: "all 0.15s",
                        }}
                      >
                        <RotateCw size={11} />
                        Redo{future.length > 0 && ` (${future.length})`}
                      </button>
                    </div>
                  </div>
                  {/* Row 2: Save as New Resume (primary) */}
                  <div style={{ display: "flex", gap: "0.5rem", alignItems: "center" }}>
                    <button
                      onClick={handleSaveCurrentResume}
                      disabled={savingCurrent}
                      className="btn-primary"
                      style={{
                        flex: 1, fontSize: "0.8rem", padding: "0.45rem 0.9rem",
                        background: "linear-gradient(135deg, #10b981 0%, #059669 100%)",
                        border: "none", justifyContent: "center",
                      }}
                    >
                      {savingCurrent
                        ? <><span className="spinner" style={{ width: 12, height: 12 }} /> Saving as New...</>
                        : <><Save size={12} /> Save as New Resume</>}
                    </button>
                  </div>
                </div>
              )}

              {savedNewResumeId && (
                <div style={{ background: "rgba(16,185,129,0.07)", border: "1px solid rgba(16,185,129,0.2)", borderRadius: "10px", padding: "0.7rem 1rem", display: "flex", alignItems: "center", gap: "0.6rem", justifyContent: "space-between" }}>
                  <span style={{ fontSize: "0.8rem", color: "#10b981", fontWeight: 600 }}>Saved as a new copy!</span>
                  <Link href={`/resume/${savedNewResumeId}`}>
                    <button className="btn-secondary" style={{ fontSize: "0.76rem", padding: "0.28rem 0.7rem", borderColor: "#10b981", color: "#10b981" }}>View Copy</button>
                  </Link>
                </div>
              )}

              {/* ── Credit exhausted prompt (Bug 24) ── */}
              {showCreditPrompt && (
                <div style={{
                  background: "linear-gradient(135deg, rgba(239,68,68,0.08), rgba(220,38,38,0.04))",
                  border: "1px solid rgba(239,68,68,0.3)", borderLeft: "3px solid #ef4444",
                  borderRadius: "12px", padding: "0.85rem 1rem",
                  display: "flex", flexDirection: "column", gap: "0.6rem",
                }}>
                  <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                    <div style={{ display: "flex", alignItems: "center", gap: "0.4rem" }}>
                      <AlertTriangle size={14} color="#ef4444" />
                      <strong style={{ fontSize: "0.82rem", color: "#ef4444" }}>Insufficient Credits</strong>
                    </div>
                    <button onClick={() => setShowCreditPrompt(false)} style={{ background: "none", border: "none", color: "var(--text-muted)", cursor: "pointer", padding: 0 }}>
                      <X size={14} />
                    </button>
                  </div>
                  <p style={{ margin: 0, fontSize: "0.76rem", color: "var(--text-muted)", lineHeight: 1.5 }}>
                    You don't have enough credits to run this AI feature. Top up your credits or upgrade to Career Sprint for unlimited access.
                  </p>
                  <div style={{ display: "flex", gap: "0.5rem", flexWrap: "wrap" }}>
                    <Link href="/pricing" style={{
                      flex: 1, textAlign: "center", padding: "0.45rem 0.7rem", borderRadius: "8px",
                      background: "linear-gradient(135deg, #6c63ff 0%, #3b82f6 100%)",
                      color: "#fff", fontWeight: 700, fontSize: "0.78rem", textDecoration: "none",
                    }}>
                      Career Sprint — ₹799
                    </Link>
                    <Link href="/pricing#topup" style={{
                      flex: 1, textAlign: "center", padding: "0.45rem 0.7rem", borderRadius: "8px",
                      border: "1px solid rgba(239,68,68,0.3)", color: "#ef4444",
                      fontWeight: 600, fontSize: "0.78rem", textDecoration: "none",
                    }}>
                      Top Up Credits
                    </Link>
                  </div>
                </div>
              )}

              {/* ── ATS Score Breakdown (Renamed to Health Check) ── */}
              {resume.ats_score && (
                <Section title="Health Check" icon={TrendingUp} defaultOpen={true}>
                  <div style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
                    
                    {/* Missing sections alert */}
                    {missingSecs.length > 0 && (
                      <div style={{ background: "rgba(245,158,11,0.07)", border: "1px solid rgba(245,158,11,0.2)", borderLeft: "3px solid #f59e0b", padding: "0.75rem 1rem", borderRadius: "10px" }}>
                        <div style={{ display: "flex", alignItems: "center", gap: "0.4rem", marginBottom: "0.35rem" }}>
                          <AlertTriangle size={13} color="#f59e0b" />
                          <strong style={{ color: "#f59e0b", fontSize: "0.8rem" }}>Incomplete Resume Profile</strong>
                        </div>
                        <div style={{ display: "flex", flexWrap: "wrap", gap: "0.3rem" }}>
                          {missingSecs.map((sec, i) => (
                            <span key={i} style={{ fontSize: "0.7rem", padding: "0.15rem 0.5rem", borderRadius: "6px", background: "rgba(245,158,11,0.1)", color: "#f59e0b", border: "1px solid rgba(245,158,11,0.2)", fontWeight: 600 }}>
                              Missing: {sec}
                            </span>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* ── Score Summary Row ── */}
                    <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "0.75rem" }}>
                      {/* ATS Score */}
                      {(() => {
                        const s = sc(resume.ats_score.overall);
                        return (
                          <div style={{
                            background: `linear-gradient(145deg, ${s.bg} 0%, var(--card) 70%)`,
                            border: `1px solid ${s.border}`,
                            borderRadius: "14px", padding: "1.1rem 0.9rem",
                            textAlign: "center", position: "relative", overflow: "hidden",
                            boxShadow: `0 4px 20px ${s.glow}`,
                            transition: "box-shadow 0.3s",
                          }}>
                            <div style={{ position: "absolute", top: 0, left: 0, right: 0, height: "3px", background: s.grad }} />
                            <div style={{ position: "absolute", bottom: "-20px", right: "-20px", width: 70, height: 70, borderRadius: "50%", background: `radial-gradient(circle, ${s.color}12 0%, transparent 70%)`, pointerEvents: "none" }} />
                            <div style={{ fontSize: "0.62rem", fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.1em", color: "var(--text-muted)", marginBottom: "0.45rem" }}>ATS Score</div>
                            <div style={{
                              fontSize: "2.6rem", fontWeight: 900, fontFamily: "Syne, sans-serif",
                              color: s.color, lineHeight: 1,
                              textShadow: `0 0 20px ${s.color}40`,
                            }}>{resume.ats_score.overall}</div>
                            <div style={{ fontSize: "0.66rem", color: "var(--text-muted)", marginTop: "0.2rem" }}>/ 100</div>
                            <div style={{ height: 5, background: "var(--bg-3)", borderRadius: 99, overflow: "hidden", marginTop: "0.6rem" }}>
                              <div style={{ height: "100%", width: `${resume.ats_score.overall}%`, background: s.grad, borderRadius: 99, transition: "width 1s cubic-bezier(0.16,1,0.3,1)", boxShadow: `0 0 8px ${s.color}60` }} />
                            </div>
                            <div style={{ marginTop: "0.45rem", display: "inline-block", fontSize: "0.62rem", fontWeight: 700, padding: "0.1rem 0.5rem", borderRadius: "9999px", background: `${s.color}15`, color: s.color, border: `1px solid ${s.color}30` }}>{s.label}</div>
                          </div>
                        );
                      })()}

                      {/* Profile Completion */}
                      {(() => {
                        const s = sc(completionPercent);
                        return (
                          <div style={{
                            background: `linear-gradient(145deg, ${s.bg} 0%, var(--card) 70%)`,
                            border: `1px solid ${s.border}`,
                            borderRadius: "14px", padding: "1.1rem 0.9rem",
                            textAlign: "center", position: "relative", overflow: "hidden",
                            boxShadow: `0 4px 20px ${s.glow}`,
                            transition: "box-shadow 0.3s",
                          }}>
                            <div style={{ position: "absolute", top: 0, left: 0, right: 0, height: "3px", background: s.grad }} />
                            <div style={{ position: "absolute", bottom: "-20px", left: "-20px", width: 70, height: 70, borderRadius: "50%", background: `radial-gradient(circle, ${s.color}12 0%, transparent 70%)`, pointerEvents: "none" }} />
                            <div style={{ fontSize: "0.62rem", fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.1em", color: "var(--text-muted)", marginBottom: "0.45rem" }}>Profile Fill</div>
                            <div style={{
                              fontSize: "2.6rem", fontWeight: 900, fontFamily: "Syne, sans-serif",
                              color: s.color, lineHeight: 1,
                              textShadow: `0 0 20px ${s.color}40`,
                            }}>{completionPercent}%</div>
                            <div style={{ fontSize: "0.66rem", color: "var(--text-muted)", marginTop: "0.2rem" }}>completed</div>
                            <div style={{ height: 5, background: "var(--bg-3)", borderRadius: 99, overflow: "hidden", marginTop: "0.6rem" }}>
                              <div style={{ height: "100%", width: `${completionPercent}%`, background: s.grad, borderRadius: 99, transition: "width 1s cubic-bezier(0.16,1,0.3,1)", boxShadow: `0 0 8px ${s.color}60` }} />
                            </div>
                            <div style={{ marginTop: "0.45rem", display: "inline-block", fontSize: "0.62rem", fontWeight: 700, padding: "0.1rem 0.5rem", borderRadius: "9999px", background: `${s.color}15`, color: s.color, border: `1px solid ${s.color}30` }}>{s.label}</div>
                          </div>
                        );
                      })()}
                    </div>

                    {/* ── contextual next-action nudge ── */}
                    {!hasUnappliedChanges && !savedNewResumeId && (() => {
                      const missing = (resume.ats_score.missingKeywordDetails || resume.ats_score.missingKeywords || []).length;
                      const score = resume.ats_score.overall;
                      if (score >= 80) return (
                        <div style={{ display: "flex", alignItems: "center", gap: "0.6rem", padding: "0.7rem 0.9rem", background: "rgba(16,185,129,0.07)", border: "1px solid rgba(16,185,129,0.2)", borderRadius: "12px" }}>
                          <CheckCircle2 size={15} color="#10b981" style={{ flexShrink: 0 }} />
                          <div>
                            <div style={{ fontSize: "0.78rem", fontWeight: 700, color: "#10b981" }}>Great score! Ready to share</div>
                            <div style={{ fontSize: "0.7rem", color: "var(--text-muted)" }}>Generate a public link below and share with recruiters.</div>
                          </div>
                        </div>
                      );
                      if (missing > 0) return (
                        <div style={{ display: "flex", alignItems: "center", gap: "0.6rem", padding: "0.7rem 0.9rem", background: "rgba(99,102,241,0.07)", border: "1px solid rgba(99,102,241,0.2)", borderRadius: "12px" }}>
                          <Sparkles size={15} color="var(--accent)" style={{ flexShrink: 0 }} />
                          <div style={{ flex: 1 }}>
                            <div style={{ fontSize: "0.78rem", fontWeight: 700, color: "var(--accent)" }}>Recommended: Add {missing} missing keyword{missing !== 1 ? "s" : ""}</div>
                            <div style={{ fontSize: "0.7rem", color: "var(--text-muted)" }}>Could boost your score by ~{Math.min(30, missing * 3)}pts. Scroll to Keywords →</div>
                          </div>
                        </div>
                      );
                      return null;
                    })()}

                    {/* ── Original ATS Breakdown ── */}
                    <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "0.6rem" }}>
                      {Object.entries(resume.ats_score.breakdown).map(([key, val]) => {
                        const v = val as number;
                        return (
                          <div key={key} style={{
                            display: "flex", alignItems: "center", gap: "0.6rem",
                            padding: "0.6rem 0.7rem", borderRadius: "9px",
                            background: "var(--bg-2)", border: "1px solid var(--border)",
                          }}>
                            <ATSRing score={v} size={38} strokeWidth={4} />
                            <div>
                              <div style={{ fontSize: "0.78rem", fontWeight: 700, color: "var(--text)", textTransform: "capitalize" }}>{key}</div>
                              <div style={{ fontSize: "0.65rem", color: sc(v).color, fontWeight: 700 }}>{sc(v).label}</div>
                            </div>
                          </div>
                        );
                      })}
                    </div>

                    {/* AI Role inference */}
                    {resume.ats_score.detectedRole && (
                      <div style={{ padding: "0.7rem 0.9rem", background: "rgba(99,102,241,0.06)", border: "1px solid rgba(99,102,241,0.15)", borderRadius: "9px" }}>
                        <div style={{ fontSize: "0.62rem", fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.07em", color: "var(--accent)", marginBottom: "0.45rem" }}>AI Role Inference</div>
                        <div style={{ display: "flex", flexWrap: "wrap", gap: "0.35rem" }}>
                          <span style={{ padding: "0.2rem 0.6rem", borderRadius: "7px", background: "var(--accent-soft)", color: "var(--accent)", fontSize: "0.75rem", fontWeight: 700, border: "1px solid var(--border-accent)" }}>
                            {resume.ats_score.detectedRole}
                          </span>
                          {resume.ats_score.detectedIndustry && (
                            <span style={{ padding: "0.2rem 0.6rem", borderRadius: "7px", background: "var(--bg-3)", color: "var(--text)", fontSize: "0.75rem", fontWeight: 600, border: "1px solid var(--border)" }}>
                              {resume.ats_score.detectedIndustry}
                            </span>
                          )}
                          {resume.ats_score.confidence && (
                            <span style={{ padding: "0.2rem 0.6rem", borderRadius: "7px", background: "rgba(245,158,11,0.1)", color: "#f59e0b", fontSize: "0.7rem", fontWeight: 700, border: "1px solid rgba(245,158,11,0.2)" }}>
                              {resume.ats_score.confidence}% confidence
                            </span>
                          )}
                        </div>
                      </div>
                    )}
                  </div>
                </Section>
              )}

              {/* ── Keywords ── */}
              {resume.ats_score && (
                <Section
                  title="Keywords"
                  icon={Target}
                  defaultOpen={true}
                  badge={`${(resume.ats_score.missingKeywordDetails || resume.ats_score.missingKeywords || []).length} missing`}
                  accentColor="#ef4444"
                >
                  {/* Missing */}
                  {((resume.ats_score.missingKeywordDetails || resume.ats_score.missingKeywords)?.length ?? 0) > 0 && (
                    <div style={{ marginBottom: "0.8rem" }}>
                      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "0.5rem" }}>
                        <div style={{ display: "flex", alignItems: "center", gap: "0.35rem" }}>
                          <div style={{ width: 6, height: 6, borderRadius: "50%", background: "#ef4444" }} />
                          <span style={{ fontSize: "0.68rem", fontWeight: 700, color: "#ef4444", textTransform: "uppercase", letterSpacing: "0.06em" }}>
                            Missing ({(resume.ats_score.missingKeywordDetails || resume.ats_score.missingKeywords || []).length})
                          </span>
                        </div>
                        <button
                          onClick={handleAddMissingKeywords}
                          disabled={addingKeywords}
                          style={{
                            display: "inline-flex", alignItems: "center", gap: "0.3rem",
                            background: "var(--accent-soft)", border: "1px solid var(--border-accent)",
                            color: "var(--accent)", borderRadius: "7px", padding: "0.22rem 0.65rem",
                            fontSize: "0.7rem", fontWeight: 700, cursor: addingKeywords ? "wait" : "pointer",
                          }}
                        >
                          {addingKeywords ? <><span className="spinner" style={{ width: 10, height: 10 }} /> Adding...</> : <><Sparkles size={10} /> Auto-Add All <CreditBadge free /></>}
                        </button>
                      </div>
                      <div style={{ display: "flex", flexWrap: "wrap", gap: "0.3rem" }}>
                        {resume.ats_score.missingKeywordDetails
                          ? [...resume.ats_score.missingKeywordDetails].sort((a: any, b: any) => b.weight - a.weight).map((kw: any, i: number) => (
                            <Pill key={i} text={kw.keyword} weight={kw.weight} color="#ef4444" bg="rgba(239,68,68,0.07)" border="rgba(239,68,68,0.2)" />
                          ))
                          : resume.ats_score.missingKeywords?.map((kw: string, i: number) => (
                            <Pill key={i} text={kw} color="#ef4444" bg="rgba(239,68,68,0.07)" border="rgba(239,68,68,0.2)" />
                          ))
                        }
                      </div>
                    </div>
                  )}

                  {/* Matched */}
                  {((resume.ats_score.keywordMatches || resume.ats_score.matchedKeywords)?.length ?? 0) > 0 && (
                    <div>
                      <div style={{ display: "flex", alignItems: "center", gap: "0.35rem", marginBottom: "0.5rem" }}>
                        <div style={{ width: 6, height: 6, borderRadius: "50%", background: "#10b981" }} />
                        <span style={{ fontSize: "0.68rem", fontWeight: 700, color: "#10b981", textTransform: "uppercase", letterSpacing: "0.06em" }}>
                          Matched ({(resume.ats_score.keywordMatches || resume.ats_score.matchedKeywords || []).length})
                        </span>
                      </div>
                      <div style={{ display: "flex", flexWrap: "wrap", gap: "0.3rem" }}>
                        {resume.ats_score.keywordMatches
                          ? [...resume.ats_score.keywordMatches].sort((a: any, b: any) => b.weight - a.weight).map((kw: any, i: number) => (
                            <Pill key={i} text={kw.keyword} weight={kw.weight} color="#10b981" bg="rgba(16,185,129,0.07)" border="rgba(16,185,129,0.2)" />
                          ))
                          : resume.ats_score.matchedKeywords?.map((kw: string, i: number) => (
                            <Pill key={i} text={kw} color="#10b981" bg="rgba(16,185,129,0.07)" border="rgba(16,185,129,0.2)" />
                          ))
                        }
                      </div>
                    </div>
                  )}
                </Section>
              )}

              {/* ── AI Improvements ── */}
              {resume.ats_score && (
                <Section title="AI Improvements" icon={Sparkles} defaultOpen={false} accentColor="#f59e0b">
                  {/* All improvements applied — success state */}
                  {suggestionsFetched && suggestions.length === 0 ? (
                    <div style={{ display: "flex", alignItems: "center", gap: "0.5rem", padding: "0.7rem 0.9rem", background: "rgba(16,185,129,0.07)", border: "1px solid rgba(16,185,129,0.22)", borderRadius: "9px" }}>
                      <CheckCircle2 size={15} color="#10b981" style={{ flexShrink: 0 }} />
                      <div>
                        <div style={{ fontSize: "0.8rem", fontWeight: 700, color: "#10b981" }}>All improvements applied!</div>
                        <div style={{ fontSize: "0.72rem", color: "var(--text-muted)" }}>Your resume is fully optimised. Save as a new resume to keep the changes.</div>
                      </div>
                    </div>
                  ) : (
                    <>
                      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "0.7rem", flexWrap: "wrap", gap: "0.5rem" }}>
                        <p style={{ fontSize: "0.78rem", color: "var(--text-muted)", margin: 0, lineHeight: 1.5 }}>
                          Generate AI suggestions to improve ATS score by adding missing keywords and skills.
                        </p>
                        {!suggestionsFetched && (
                          <button
                            onClick={fetchSuggestions}
                            disabled={suggestionsLoading}
                            className="btn-primary"
                            style={{ fontSize: "0.78rem", padding: "0.4rem 0.9rem", whiteSpace: "nowrap", display: "inline-flex", alignItems: "center", gap: "0.4rem" }}
                          >
                            {suggestionsLoading ? <><span className="spinner" style={{ width: 12, height: 12 }} /> Analyzing...</> : <><Sparkles size={12} /> Find Improvements <CreditBadge cost={CREDIT_COSTS.AI_IMPROVEMENTS_GENERATE} /></>}
                          </button>
                        )}
                      </div>
                      {suggestions.length > 0 && (
                        <div style={{ background: "var(--accent-soft)", border: "1px solid var(--border-accent)", borderRadius: "9px", padding: "0.7rem 0.9rem", display: "flex", justifyContent: "space-between", alignItems: "center", gap: "0.7rem", flexWrap: "wrap" }}>
                          <div>
                            <div style={{ fontSize: "0.8rem", fontWeight: 700, color: "var(--accent)" }}>{suggestions.length} improvements found!</div>
                            <div style={{ fontSize: "0.72rem", color: "var(--text-muted)" }}>Estimated new score: {estimatedNewScore}/100</div>
                          </div>
                          <button onClick={() => setShowSuggestionsModal(true)} className="btn-primary" style={{ fontSize: "0.78rem", padding: "0.38rem 0.85rem" }}>
                            View & Apply
                          </button>
                        </div>
                      )}
                    </>
                  )}
                </Section>
              )}

              {/* ── Indian Portals Tips ── */}
              <Section title="Naukri / LinkedIn SEO Tips" icon={TrendingUp} defaultOpen={false} accentColor="#8b5cf6" badge={naukriLoading ? "loading..." : naukriTips.length > 0 ? naukriTips.length : undefined}>
                <p style={{ fontSize: "0.76rem", color: "var(--text-muted)", margin: "0 0 0.7rem", lineHeight: 1.5 }}>
                  Boost visibility on Naukri.com and LinkedIn India. Click <strong>Apply Fix</strong> to instantly update your preview.
                </p>

                {naukriTips.length === 0 && !naukriLoading && (
                  <button onClick={fetchNaukriTips} style={{
                    display: "inline-flex", alignItems: "center", gap: "0.4rem",
                    background: "rgba(139,92,246,0.1)", border: "1px solid rgba(139,92,246,0.25)",
                    color: "#8b5cf6", borderRadius: "8px", padding: "0.45rem 1rem",
                    fontSize: "0.78rem", fontWeight: 700, cursor: "pointer",
                  }}>
                    Load Visibility Tips <CreditBadge cost={CREDIT_COSTS.NAUKRI_SEO_TIPS} />
                  </button>
                )}

                {naukriLoading && (
                  <div style={{ display: "flex", alignItems: "center", gap: "0.5rem", padding: "0.5rem 0", color: "var(--text-muted)", fontSize: "0.8rem" }}>
                    <span className="spinner" style={{ width: 14, height: 14 }} /> Loading tips...
                  </div>
                )}

                {naukriTips.length > 0 && (
                  <div style={{ display: "grid", gap: "0.6rem" }}>
                    {naukriTips.map((tip, i) => {
                      const priColor = tip.priority === "High" ? "#ef4444" : tip.priority === "Medium" ? "#f59e0b" : "#8b5cf6";
                      const isApplied = !!appliedTipPatches[i];
                      const isApplyingThis = applyingTipIdx === i;
                      return (
                        <div key={i} style={{
                          padding: "0.8rem 0.9rem", borderRadius: "10px",
                          background: isApplied ? "rgba(16,185,129,0.04)" : "var(--bg-2)",
                          border: `1px solid ${isApplied ? "rgba(16,185,129,0.25)" : "var(--border)"}`,
                          transition: "all 0.2s",
                        }}>
                          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: "0.5rem", marginBottom: "0.35rem" }}>
                            <strong style={{ fontSize: "0.8rem", fontWeight: 700, color: isApplied ? "#10b981" : "var(--text)", display: "flex", alignItems: "center", gap: "0.3rem" }}>
                              {isApplied && <CheckCircle2 size={13} />}
                              {tip.area}
                            </strong>
                            <span style={{ fontSize: "0.62rem", fontWeight: 700, textTransform: "uppercase", padding: "0.12rem 0.45rem", borderRadius: "5px", background: `${priColor}15`, color: priColor, border: `1px solid ${priColor}30`, whiteSpace: "nowrap" }}>
                              {tip.priority}
                            </span>
                          </div>
                          <p style={{ margin: "0 0 0.5rem", fontSize: "0.77rem", color: "var(--text-muted)", lineHeight: 1.5 }}>{tip.tip}</p>
                          {isApplied && appliedTipPatches[i] && (
                            <div style={{ fontSize: "0.72rem", color: "#10b981", background: "rgba(16,185,129,0.08)", borderRadius: "7px", padding: "0.4rem 0.6rem", border: "1px solid rgba(16,185,129,0.2)", marginBottom: "0.35rem" }}>
                              Applied: {appliedTipPatches[i].explanation || "Applied to preview"}
                            </div>
                          )}
                          {!isApplied && (
                            <button
                              onClick={() => handleGenerateNaukriTipFix(i, tip)}
                              disabled={isApplyingThis}
                              style={{
                                display: "inline-flex", alignItems: "center", gap: "0.3rem",
                                background: "var(--card)", border: "1px solid rgba(139,92,246,0.3)",
                                color: "#8b5cf6", borderRadius: "7px", padding: "0.28rem 0.65rem",
                                fontSize: "0.72rem", fontWeight: 700, cursor: isApplyingThis ? "wait" : "pointer",
                                transition: "all 0.15s",
                              }}
                            >
                              {isApplyingThis ? <><span className="spinner" style={{ width: 10, height: 10 }} /> Generating...</> : <><Wand2 size={10} /> Apply Fix <CreditBadge cost={CREDIT_COSTS.NAUKRI_APPLY_FIX} /></>}
                            </button>
                          )}
                        </div>
                      );
                    })}
                  </div>
                )}
              </Section>

              {/* ── Public Share ── */}
              <Section title="Public Share Link" icon={Share2} defaultOpen={false} accentColor="#8b5cf6">
                {!shareToken ? (
                  <button
                    onClick={handleToggleShare}
                    disabled={shareLoading}
                    style={{
                      width: "100%", display: "flex", alignItems: "center", justifyContent: "center", gap: "0.5rem",
                      padding: "0.65rem", fontSize: "0.83rem", fontWeight: 700, cursor: "pointer",
                      background: "linear-gradient(135deg, #8b5cf6, #6d28d9)", color: "#fff", border: "none", borderRadius: "9px",
                    }}
                  >
                    {shareLoading ? "Generating..." : <><Share2 size={14} /> Generate Share Link</>}
                  </button>
                ) : (
                  <div style={{ display: "grid", gap: "0.65rem" }}>
                    <div style={{ display: "flex", gap: "0.4rem" }}>
                      <input
                        readOnly className="input"
                        style={{ fontSize: "0.76rem", padding: "0.45rem 0.7rem", flex: 1, height: "38px" }}
                        value={typeof window !== "undefined" ? window.location.origin + "/share/" + shareToken : ""}
                        onFocus={(e) => e.target.select()}
                      />
                      <button
                        onClick={() => { if (typeof window !== "undefined") { navigator.clipboard.writeText(window.location.origin + "/share/" + shareToken); showToast("Link copied to clipboard!", "success"); } }}
                        style={{
                          display: "inline-flex", alignItems: "center", gap: "0.3rem",
                          background: "#8b5cf6", color: "#fff", border: "none", borderRadius: "8px",
                          padding: "0 0.9rem", fontSize: "0.76rem", fontWeight: 700, cursor: "pointer", whiteSpace: "nowrap",
                        }}
                      >
                        <Copy size={12} /> Copy
                      </button>
                    </div>
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                      <label style={{ display: "flex", alignItems: "center", gap: "0.45rem", fontSize: "0.76rem", cursor: "pointer", color: "var(--text-muted)", fontWeight: 500 }}>
                        <input type="checkbox" checked={isSharePublic} onChange={handleToggleShare} disabled={shareLoading} style={{ accentColor: "#8b5cf6", width: 13, height: 13 }} />
                        Link is Active
                      </label>
                      {shareToken && (
                        <span style={{ fontSize: "0.72rem", fontWeight: 600, color: "var(--text-muted)", display: "flex", alignItems: "center", gap: "0.3rem" }}>
                          <Eye size={11} /> {shareViews} views
                        </span>
                      )}
                    </div>
                  </div>
                )}
              </Section>

            </div>
          )}

          {/* ── RIGHT PANEL (PREVIEW VIEWER) ── */}
          {!isFullscreen && (
            <div className="no-print" style={{ display: "flex", flexDirection: "column", gap: "0", overflow: "hidden", minWidth: 0, background: "var(--card)", borderRadius: "16px", border: "1px solid var(--border)", boxShadow: "0 4px 24px rgba(0,0,0,0.06)" }}>
              <div style={{ padding: "0.75rem 1.1rem", borderBottom: "1px solid var(--border)", background: "linear-gradient(135deg, rgba(99,102,241,0.04) 0%, transparent 100%)", display: "flex", alignItems: "center", justifyContent: "space-between", gap: "0.7rem", flexWrap: "wrap", flexShrink: 0 }}>
                <div style={{ display: "flex", alignItems: "center", gap: "0.5rem", fontWeight: 700, fontSize: "0.85rem", color: "var(--text)" }}>
                  <FileText size={16} color="var(--accent)" />
                  {previewMode === "live" ? "Live AI Preview" : "Original Document"}
                </div>
                {((resume as any)?.pdf_url || (resume?.resume_data as any)?.pdf_url) && (
                  <div style={{ display: "flex", gap: "0.2rem", background: "var(--bg-2)", padding: "0.2rem", borderRadius: "8px", border: "1px solid var(--border)" }}>
                    <button onClick={() => setPreviewMode("live")} style={{ padding: "0.25rem 0.6rem", fontSize: "0.7rem", fontWeight: 700, borderRadius: "5px", background: previewMode === "live" ? "var(--accent)" : "transparent", color: previewMode === "live" ? "#fff" : "var(--text-muted)", border: "none", cursor: "pointer", transition: "all 0.2s" }}>Live Preview</button>
                    <button onClick={() => setPreviewMode("pdf")} style={{ padding: "0.25rem 0.6rem", fontSize: "0.7rem", fontWeight: 700, borderRadius: "5px", background: previewMode === "pdf" ? "var(--accent)" : "transparent", color: previewMode === "pdf" ? "#fff" : "var(--text-muted)", border: "none", cursor: "pointer", transition: "all 0.2s" }}>Original PDF</button>
                  </div>
                )}
              </div>
              <div style={{ flex: 1, position: "relative", backgroundColor: "#f3f4f6", overflow: "auto", display: "flex", justifyContent: "center", padding: "1.5rem 0" }}>
                {previewMode === "live" ? (
                  <div style={{
                    width: "210mm", minHeight: "297mm", backgroundColor: "#fff",
                    boxShadow: "0 10px 40px rgba(0,0,0,0.12)",
                    transform: `scale(${zoomFactor})`,
                    transformOrigin: "top center",
                    transition: "transform 0.2s cubic-bezier(0.16, 1, 0.3, 1)",
                  }}>
                    <ResumeDocument data={modifiedResumeData || (resume as any).structured_data || resume.resume_data || emptyResumeData} templateId={selectedTemplate} />
                  </div>
                ) : (
                  <iframe
                    src={`${(resume as any).pdf_url || (resume.resume_data as any).pdf_url}#toolbar=0&navpanes=0&scrollbar=0`}
                    style={{ width: "100%", height: "100%", border: "none", position: "absolute", top: 0, left: 0 }}
                    title="Original Resume PDF"
                  />
                )}
              </div>
            </div>
          )}

        </div>

        {/* PRINT ONLY */}
        <div className="print-only">
          <div className="resume-paper resume-print-area" style={{ background: "#ffffff", color: "#333333", padding: "40px", width: "100%" }}>
            <ResumeDocument data={modifiedResumeData || (resume as any).structured_data || resume.resume_data || emptyResumeData} templateId={selectedTemplate} />
          </div>
        </div>
      </div>
    </div>
  );
}
