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
import ResumeSuggestionsModal from "@/components/ResumeSuggestionsModal";
import {
  Edit3, Mail, Printer, FileDown, TrendingUp, Share2, Eye, Clock,
  Maximize2, Minimize2, Sparkles, Save, CheckCircle2, Wand2, X,
  ChevronDown, ChevronUp, Copy, AlertTriangle, ZoomIn, ZoomOut,
  RefreshCw, LayoutTemplate, Target,
} from "lucide-react";
import { useToast } from "@/components/ui/toast-1";

/* ─── helpers ─── */
const ROTATING_MESSAGES = [
  "Handshaking with strictly-free AI reasoning models...",
  "Rewriting experience bullets with active action verbs & metrics...",
  "Performing semantic keyword match against Job Description...",
  "Generating professional CV summary & gap recommendations...",
  "Analyzing keywords against Indian recruiter portals...",
  "Comparing achievements with LPA benchmarks...",
  "Assessing tone clarity for IT vs BFSI sectors...",
  "Resolving skills taxonomy with modern technology stacks...",
];

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
  if (score >= 70) return { color: "#10b981", bg: "rgba(16,185,129,0.1)", border: "rgba(16,185,129,0.25)", label: "Excellent" };
  if (score >= 45) return { color: "#f59e0b", bg: "rgba(245,158,11,0.1)", border: "rgba(245,158,11,0.25)", label: "Average" };
  return { color: "#ef4444", bg: "rgba(239,68,68,0.1)", border: "rgba(239,68,68,0.25)", label: "Needs Work" };
};

/* ─── collapsible section wrapper ─── */
function Section({ title, icon: Icon, defaultOpen = true, badge, children, accentColor }: {
  title: string; icon: React.ElementType; defaultOpen?: boolean;
  badge?: string | number; children: React.ReactNode; accentColor?: string;
}) {
  const [open, setOpen] = useState(defaultOpen);
  return (
    <div style={{
      background: "var(--card)", border: "1px solid var(--border)",
      borderRadius: "14px", overflow: "hidden", transition: "all 0.2s",
    }}>
      <button
        onClick={() => setOpen(o => !o)}
        style={{
          width: "100%", display: "flex", alignItems: "center", justifyContent: "space-between",
          padding: "0.85rem 1.1rem", background: "none", border: "none", cursor: "pointer",
          borderBottom: open ? "1px solid var(--border)" : "none", transition: "all 0.2s",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: "0.55rem" }}>
          <div style={{
            width: 28, height: 28, borderRadius: "7px", flexShrink: 0,
            background: accentColor ? `${accentColor}18` : "var(--accent-soft)",
            display: "flex", alignItems: "center", justifyContent: "center",
          }}>
            <Icon size={13} color={accentColor || "var(--accent)"} />
          </div>
          <span style={{ fontFamily: "Syne, sans-serif", fontWeight: 700, fontSize: "0.87rem", color: "var(--text)" }}>{title}</span>
          {badge !== undefined && (
            <span style={{
              fontSize: "0.65rem", fontWeight: 700, padding: "0.12rem 0.5rem",
              borderRadius: "9999px", background: accentColor ? `${accentColor}18` : "var(--accent-soft)",
              color: accentColor || "var(--accent)", border: `1px solid ${accentColor ? `${accentColor}30` : "var(--border-accent)"}`,
            }}>{badge}</span>
          )}
        </div>
        {open ? <ChevronUp size={14} color="var(--text-muted)" /> : <ChevronDown size={14} color="var(--text-muted)" />}
      </button>
      {open && <div style={{ padding: "1rem 1.1rem" }}>{children}</div>}
    </div>
  );
}

/* ─── keyword pill ─── */
function Pill({ text, weight, color, border, bg }: { text: string; weight?: number; color: string; border: string; bg: string }) {
  return (
    <span style={{
      display: "inline-flex", alignItems: "center", gap: "0.3rem",
      padding: "0.18rem 0.6rem", borderRadius: "7px", fontSize: "0.72rem",
      fontWeight: 600, background: bg, color, border: `1px solid ${border}`,
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

  const [selectedTemplate, setSelectedTemplate] = useState("standard");
  const [zoomFactor, setZoomFactor] = useState(0.85);
  const [isFullscreen, setIsFullscreen] = useState(false);

  const [deepLoading, setDeepLoading] = useState(false);
  const [deepProgress, setDeepProgress] = useState(0);
  const [deepText, setDeepText] = useState("");
  const [deepError, setDeepError] = useState("");
  const [jobDescription, setJobDescription] = useState("");

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

  const [modifiedResumeData, setModifiedResumeData] = useState<any | null>(null);
  const [hasUnappliedChanges, setHasUnappliedChanges] = useState(false);
  const [showSaveNewModal, setShowSaveNewModal] = useState(false);
  const [saveNewName, setSaveNewName] = useState("");
  const [savingNew, setSavingNew] = useState(false);
  const [savedNewResumeId, setSavedNewResumeId] = useState<string | null>(null);
  const [highlightedChanges, setHighlightedChanges] = useState<string[]>([]);

  const [applyingTipIdx, setApplyingTipIdx] = useState<number | null>(null);
  const [appliedTipPatches, setAppliedTipPatches] = useState<Record<number, any>>({});
  const [selectedTipIdxs, setSelectedTipIdxs] = useState<Set<number>>(new Set());
  const [naukriApplyMode, setNaukriApplyMode] = useState(false);

  const fetchSuggestions = async () => {
    if (!resume || suggestionsFetched || suggestionsLoading) return;
    setSuggestionsLoading(true);
    try {
      const res = await fetch("/api/resume/suggestions/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          resumeId: resume.id,
          resumeText: resume.raw_text,
          detectedRole: resume.ats_score?.detectedRole,
          detectedIndustry: resume.ats_score?.detectedIndustry
        })
      });
      if (res.ok) {
        const data = await res.json();
        if (data.suggestions) {
          setSuggestions(data.suggestions);
          setEstimatedNewScore(data.estimatedNewScore);
          setSuggestionsFetched(true);
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
    fetch("/api/get-resumes")
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
    setShowSuggestionsModal(false);
    showToast(`${selectedSuggestions.length} change(s) applied! Check the preview, then save as new resume.`, "success");
  };

  const handleApplyNaukriTipPatch = (idx: number, patch: any) => {
    const base = JSON.parse(JSON.stringify(modifiedResumeData || resume?.resume_data || {}));
    if (patch.field === "summary") { base.summary = patch.suggestedValue; }
    else if (patch.field === "skills_technical") { const skills = patch.suggestedValue.split(",").map((s: string) => s.trim()).filter(Boolean); if (!base.skills) base.skills = { technical: [], soft: [] }; base.skills.technical = [...new Set([...(base.skills.technical || []), ...skills])]; }
    else if (patch.field === "skills_soft") { const skills = patch.suggestedValue.split(",").map((s: string) => s.trim()).filter(Boolean); if (!base.skills) base.skills = { technical: [], soft: [] }; base.skills.soft = [...new Set([...(base.skills.soft || []), ...skills])]; }
    setModifiedResumeData(base);
    setHasUnappliedChanges(true);
    setAppliedTipPatches(prev => ({ ...prev, [idx]: patch }));
    const newChanges = patch.field.startsWith("skills") ? patch.suggestedValue.split(",").map((s: string) => s.trim()) : [patch.suggestedValue];
    setHighlightedChanges(prev => [...prev, ...newChanges].filter(Boolean));
    showToast("Tip applied to preview! Save as new resume to keep this version.", "success");
  };

  const handleGenerateNaukriTipFix = async (idx: number, tip: { area: string; tip: string }) => {
    if (!resume) return;
    setApplyingTipIdx(idx);
    try {
      const res = await fetch("/api/naukri-tips/apply", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ resumeId: resume.id, tipArea: tip.area, tipText: tip.tip }) });
      if (res.ok) { const data = await res.json(); if (data.patch) handleApplyNaukriTipPatch(idx, data.patch); }
      else showToast("Could not generate a fix for this tip. Please try again.", "error");
    } catch { showToast("Error applying tip.", "error"); }
    finally { setApplyingTipIdx(null); }
  };

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

  const handleTemplateChange = async (tplId: string) => {
    setSelectedTemplate(tplId);
    if (!resume) return;
    try {
      const res = await fetch("/api/save-resume", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ id: resume.id, file_name: resume.file_name, raw_text: resume.raw_text, resume_data: resume.resume_data, template_id: tplId, ats_score: resume.ats_score, content_review: resume.content_review, jd_match: resume.jd_match }) });
      if (res.ok) { const updated = await res.json(); setResume(updated); }
    } catch { console.error("Failed to update template:"); }
  };

  const runDeepAI = async () => {
    if (!resume) return;
    setDeepLoading(true); setDeepError(""); setDeepProgress(0);
    let animPercent = 0;
    const animInterval = setInterval(() => {
      animPercent += 1;
      if (animPercent > 98) animPercent = 98;
      setDeepProgress(animPercent);
      setDeepText(ROTATING_MESSAGES[Math.floor(animPercent / 12) % ROTATING_MESSAGES.length]);
    }, 250);
    try {
      const res = await fetch("/api/analyze-resume/deep", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ resumeId: resume.id, jobDescription }) });
      if (!res.ok) throw new Error("Deep AI response failed. AI service might be loaded. Please retry.");
      const updatedRow = await res.json();
      if (updatedRow.error) throw new Error(updatedRow.error);
      clearInterval(animInterval);
      setDeepProgress(100);
      setDeepText("Deep AI Enhancements integrated successfully!");
      setResume(updatedRow);
      setTimeout(() => setDeepLoading(false), 350);
    } catch (err: any) {
      clearInterval(animInterval);
      setDeepError(err.message || "Deep AI analysis failed. Please try again.");
      setDeepLoading(false);
    }
  };

  const handlePrint = () => window.print();

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
    { value: "standard", label: "Standard" },
    { value: "modern", label: "Modern ATS" },
    { value: "professional", label: "Professional" },
    { value: "executive", label: "Executive" },
    { value: "minimal", label: "Minimal" },
    { value: "creative", label: "Creative" },
    { value: "ats-safe", label: "ATS Safe" },
    { value: "fresher", label: "Fresher" },
    { value: "startup", label: "Startup" },
    { value: "it-tech", label: "IT Tech" },
    { value: "bfsi-risk", label: "BFSI Corporate" },
    { value: "minimal-2", label: "Minimalist Teal" },
  ];

  return (
    <div style={{ minHeight: "100vh", background: "var(--bg)", position: "relative", overflow: "hidden" }}>
      <ParticleBackground count={50} connectionDist={110} />
      <div style={{ position: "relative", zIndex: 10, display: "flex", flexDirection: "column", minHeight: "100vh" }}>
        <Navbar />

        {/* Suggestions Modal */}
        {showSuggestionsModal && resume && resume.ats_score && (
          <ResumeSuggestionsModal
            resumeId={resume.id}
            suggestions={suggestions}
            currentScore={resume.ats_score.overall}
            potentialScore={estimatedNewScore}
            onClose={() => setShowSuggestionsModal(false)}
            onApply={async (selectedIds) => {
              const selectedSuggs = suggestions.filter(s => selectedIds.includes(s.id));
              handleApplySuggestionsInline(selectedSuggs);
            }}
          />
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
        <div className="no-print" style={{ background: "var(--card)", borderBottom: "1px solid var(--border)", padding: "1rem 1.8rem" }}>
          <div style={{ maxWidth: "1500px", margin: "0 auto" }}>
            {/* Breadcrumb */}
            <div style={{ display: "flex", alignItems: "center", gap: "0.4rem", marginBottom: "0.5rem" }}>
              <Link href="/dashboard" style={{ textDecoration: "none", color: "var(--text-muted)", fontSize: "0.78rem", display: "inline-flex", alignItems: "center", gap: "0.3rem" }}>
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><line x1="19" y1="12" x2="5" y2="12" /><polyline points="12 19 5 12 12 5" /></svg>
                Dashboard
              </Link>
              <span style={{ color: "var(--border-strong)", fontSize: "0.78rem" }}>/</span>
              <span style={{
                fontSize: "0.7rem", fontWeight: 700, padding: "0.1rem 0.55rem", borderRadius: "9999px",
                background: hasDeepAnalysis ? "rgba(99,102,241,0.12)" : "var(--bg-2)",
                color: hasDeepAnalysis ? "var(--accent)" : "var(--text-muted)",
                border: `1px solid ${hasDeepAnalysis ? "var(--border-accent)" : "var(--border)"}`,
              }}>
                {hasDeepAnalysis ? "✦ Deep AI Enhanced" : "⚙ Local Analysis Only"}
              </span>
            </div>

            {/* Title + Actions row */}
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: "0.8rem" }}>
              <h1 style={{ fontFamily: "Syne, sans-serif", fontSize: "1.45rem", fontWeight: 800, margin: 0 }}>
                {resume.file_name}
              </h1>
              <div style={{ display: "flex", alignItems: "center", gap: "0.6rem", flexWrap: "wrap" }}>
                <Link href={`/resume/builder?id=${resume.id}&template=${selectedTemplate}`}>
                  <button className="btn-primary" style={{ fontSize: "0.83rem", padding: "0.5rem 1.1rem" }}>
                    <Edit3 size={14} /> Edit in Builder
                  </button>
                </Link>
                <Link href={`/resume/${resume.id}/cover-letter`}>
                  <button className="btn-secondary" style={{ fontSize: "0.83rem", padding: "0.5rem 1.1rem" }}>
                    <Mail size={14} /> Cover Letter
                  </button>
                </Link>
                <button onClick={handlePrint} className="btn-secondary" style={{ fontSize: "0.83rem", padding: "0.5rem 1.1rem" }}>
                  <Printer size={14} /> Print / PDF
                </button>
                <button onClick={handleDownloadDocx} disabled={docxLoading} className="btn-secondary" style={{ fontSize: "0.83rem", padding: "0.5rem 1.1rem" }}>
                  <FileDown size={14} /> {docxLoading ? "Downloading..." : "DOCX"}
                </button>
              </div>
            </div>

            {/* Quick stats strip */}
            <div style={{
              display: "flex", gap: "1.5rem", alignItems: "center", flexWrap: "wrap",
              marginTop: "0.75rem", paddingTop: "0.75rem", borderTop: "1px solid var(--border)",
              fontSize: "0.78rem", color: "var(--text-muted)",
            }}>
              {resume.ats_score && (
                <div style={{ display: "flex", alignItems: "center", gap: "0.35rem" }}>
                  <TrendingUp size={13} color="var(--accent)" />
                  <span>ATS Score:</span>
                  <strong style={{ color: sc(resume.ats_score.overall).color }}>{resume.ats_score.overall}/100</strong>
                </div>
              )}
              <div style={{ display: "flex", alignItems: "center", gap: "0.35rem" }}>
                <Share2 size={13} color="#8b5cf6" />
                <span>Sharing:</span>
                <strong style={{ color: shareToken && isSharePublic ? "#10b981" : "#ef4444" }}>
                  {shareToken && isSharePublic ? "Public (Active)" : "Private (Off)"}
                </strong>
              </div>
              <div style={{ display: "flex", alignItems: "center", gap: "0.35rem" }}>
                <Eye size={13} color="#3b82f6" />
                <span>Public Views:</span>
                <strong style={{ color: "var(--text)" }}>{shareViews}</strong>
              </div>
              <div style={{ display: "flex", alignItems: "center", gap: "0.35rem" }}>
                <Clock size={13} color="#10b981" />
                <span>Last Audit:</span>
                <strong style={{ color: "var(--text)" }}>
                  {resume.updated_at ? new Date(resume.updated_at).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric", hour: "2-digit", minute: "2-digit" }) : "Never"}
                </strong>
              </div>
            </div>
          </div>
        </div>

        {/* ── MAIN SPLIT ── */}
        <div style={{
          flex: 1, display: "grid",
          gridTemplateColumns: isFullscreen ? "1fr" : "minmax(0, 420px) 1fr",
          maxWidth: "1500px", width: "100%", margin: "0 auto",
          padding: "1.2rem 1.5rem", gap: "1.2rem",
          height: "calc(100vh - 160px)",
          overflow: "hidden",
        }}>

          {/* ── LEFT PANEL ── */}
          {!isFullscreen && (
            <div className="no-print" style={{ overflowY: "auto", display: "flex", flexDirection: "column", gap: "0.8rem", paddingRight: "4px", scrollbarGutter: "stable" }}>

              {/* Changes applied banner */}
              {hasUnappliedChanges && (
                <div style={{
                  background: "linear-gradient(135deg, rgba(16,185,129,0.1), rgba(5,150,105,0.06))",
                  border: "1px solid rgba(16,185,129,0.3)", borderRadius: "12px",
                  padding: "0.8rem 1rem", display: "flex", justifyContent: "space-between",
                  alignItems: "center", gap: "0.8rem", flexWrap: "wrap",
                }}>
                  <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
                    <CheckCircle2 size={16} color="#10b981" style={{ flexShrink: 0 }} />
                    <div>
                      <strong style={{ fontSize: "0.82rem", color: "#10b981", display: "block" }}>Changes Applied to Preview</strong>
                      <span style={{ fontSize: "0.72rem", color: "var(--text-muted)" }}>Review the right panel, then save as a new resume.</span>
                    </div>
                  </div>
                  <button
                    onClick={() => { setSaveNewName(""); setShowSaveNewModal(true); }}
                    className="btn-primary"
                    style={{ fontSize: "0.78rem", padding: "0.4rem 0.9rem", background: "linear-gradient(135deg, #10b981 0%, #059669 100%)", border: "none", whiteSpace: "nowrap" }}
                  >
                    <Save size={12} /> Save as New
                  </button>
                </div>
              )}

              {savedNewResumeId && (
                <div style={{ background: "rgba(16,185,129,0.07)", border: "1px solid rgba(16,185,129,0.2)", borderRadius: "10px", padding: "0.7rem 1rem", display: "flex", alignItems: "center", gap: "0.6rem", justifyContent: "space-between" }}>
                  <span style={{ fontSize: "0.8rem", color: "#10b981", fontWeight: 600 }}>New resume saved!</span>
                  <Link href={`/resume/${savedNewResumeId}`}>
                    <button className="btn-secondary" style={{ fontSize: "0.76rem", padding: "0.28rem 0.7rem", borderColor: "#10b981", color: "#10b981" }}>View New Resume</button>
                  </Link>
                </div>
              )}

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
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "0.7rem" }}>
                {/* ATS Score */}
                {resume.ats_score && (
                  <div style={{
                    background: "var(--card)", border: `1px solid ${sc(resume.ats_score.overall).border}`,
                    borderRadius: "12px", padding: "1rem", textAlign: "center", position: "relative", overflow: "hidden",
                  }}>
                    <div style={{ position: "absolute", top: 0, left: 0, right: 0, height: "3px", background: `linear-gradient(90deg, ${sc(resume.ats_score.overall).color}, transparent)` }} />
                    <div style={{ fontSize: "0.65rem", fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.08em", color: "var(--text-muted)", marginBottom: "0.4rem" }}>ATS Score</div>
                    <div style={{ fontSize: "2.2rem", fontWeight: 800, fontFamily: "Syne, sans-serif", color: sc(resume.ats_score.overall).color, lineHeight: 1 }}>
                      {resume.ats_score.overall}
                    </div>
                    <div style={{ fontSize: "0.68rem", color: "var(--text-muted)", marginTop: "0.25rem" }}>out of 100</div>
                    {/* mini bar */}
                    <div style={{ height: 4, background: "var(--bg-3)", borderRadius: 99, overflow: "hidden", marginTop: "0.5rem" }}>
                      <div style={{ height: "100%", width: `${resume.ats_score.overall}%`, background: sc(resume.ats_score.overall).color, borderRadius: 99, transition: "width 0.8s" }} />
                    </div>
                  </div>
                )}

                {/* Profile Completion */}
                <div style={{
                  background: "var(--card)", border: `1px solid ${sc(completionPercent).border}`,
                  borderRadius: "12px", padding: "1rem", textAlign: "center", position: "relative", overflow: "hidden",
                }}>
                  <div style={{ position: "absolute", top: 0, left: 0, right: 0, height: "3px", background: `linear-gradient(90deg, ${sc(completionPercent).color}, transparent)` }} />
                  <div style={{ fontSize: "0.65rem", fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.08em", color: "var(--text-muted)", marginBottom: "0.4rem" }}>Completion</div>
                  <div style={{ fontSize: "2.2rem", fontWeight: 800, fontFamily: "Syne, sans-serif", color: sc(completionPercent).color, lineHeight: 1 }}>
                    {completionPercent}%
                  </div>
                  <div style={{ fontSize: "0.68rem", color: "var(--text-muted)", marginTop: "0.25rem" }}>sections filled</div>
                  <div style={{ height: 4, background: "var(--bg-3)", borderRadius: 99, overflow: "hidden", marginTop: "0.5rem" }}>
                    <div style={{ height: "100%", width: `${completionPercent}%`, background: sc(completionPercent).color, borderRadius: 99, transition: "width 0.8s" }} />
                  </div>
                </div>
              </div>

              {/* ── ATS Score Breakdown ── */}
              {resume.ats_score && (
                <Section title="Score Breakdown" icon={TrendingUp} defaultOpen={true}>
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
                    <div style={{ marginTop: "0.7rem", padding: "0.7rem 0.9rem", background: "rgba(99,102,241,0.06)", border: "1px solid rgba(99,102,241,0.15)", borderRadius: "9px" }}>
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
                          {addingKeywords ? <><span className="spinner" style={{ width: 10, height: 10 }} /> Adding...</> : <><Sparkles size={10} /> Auto-Add All</>}
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
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "0.7rem", flexWrap: "wrap", gap: "0.5rem" }}>
                    <p style={{ fontSize: "0.78rem", color: "var(--text-muted)", margin: 0, lineHeight: 1.5 }}>
                      Generate AI suggestions to improve ATS score by adding missing keywords and skills.
                    </p>
                    <button
                      onClick={fetchSuggestions}
                      disabled={suggestionsLoading}
                      className="btn-primary"
                      style={{ fontSize: "0.78rem", padding: "0.4rem 0.9rem", whiteSpace: "nowrap" }}
                    >
                      {suggestionsLoading ? <><span className="spinner" style={{ width: 12, height: 12 }} /> Analyzing...</> : <><Sparkles size={12} /> Find Improvements</>}
                    </button>
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
                    Load Visibility Tips
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
                              {isApplyingThis ? <><span className="spinner" style={{ width: 10, height: 10 }} /> Generating...</> : <><Wand2 size={10} /> Apply Fix</>}
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

          {/* ── RIGHT PANEL: PREVIEW ── */}
          <div className="no-print" style={{ display: "flex", flexDirection: "column", gap: "0.7rem", overflow: "hidden", minWidth: 0 }}>

            {/* Toolbar */}
            <div style={{
              background: "var(--card)", border: "1px solid var(--border)", borderRadius: "12px",
              padding: "0.65rem 1rem", display: "flex", flexWrap: "wrap",
              alignItems: "center", justifyContent: "space-between", gap: "0.6rem",
            }}>
              {/* Template selector */}
              <div style={{ display: "flex", alignItems: "center", gap: "0.45rem", minWidth: 0 }}>
                <LayoutTemplate size={13} color="var(--text-muted)" style={{ flexShrink: 0 }} />
                <span style={{ fontSize: "0.72rem", fontWeight: 700, textTransform: "uppercase", color: "var(--text-muted)", whiteSpace: "nowrap" }}>Template</span>
                <select
                  value={selectedTemplate}
                  onChange={(e) => handleTemplateChange(e.target.value)}
                  className="input"
                  style={{ height: "32px", padding: "0 0.5rem", fontSize: "0.78rem", borderRadius: "7px", minWidth: 0, maxWidth: "140px" }}
                >
                  {TEMPLATES.map(t => <option key={t.value} value={t.value}>{t.label}</option>)}
                </select>
                <Link href={`/resume/templates?id=${resume.id}`} style={{ textDecoration: "none" }}>
                  <button className="btn-secondary" style={{ padding: "0.22rem 0.55rem", fontSize: "0.72rem", borderRadius: "6px", height: "32px", whiteSpace: "nowrap" }}>
                    Gallery
                  </button>
                </Link>
              </div>

              {/* Zoom */}
              <div style={{ display: "flex", alignItems: "center", gap: "0.4rem" }}>
                <button onClick={() => setZoomFactor(prev => Math.max(0.5, prev - 0.05))} style={{ width: 28, height: 28, display: "flex", alignItems: "center", justifyContent: "center", background: "var(--bg-2)", border: "1px solid var(--border)", borderRadius: "6px", cursor: "pointer", color: "var(--text-muted)" }}>
                  <ZoomOut size={13} />
                </button>
                <input type="range" min="0.5" max="1.2" step="0.05" value={zoomFactor} onChange={(e) => setZoomFactor(parseFloat(e.target.value))} style={{ width: 70, accentColor: "var(--accent)" }} />
                <span style={{ fontSize: "0.72rem", color: "var(--text-muted)", minWidth: "2.2rem", textAlign: "center" }}>{Math.round(zoomFactor * 100)}%</span>
                <button onClick={() => setZoomFactor(prev => Math.min(1.2, prev + 0.05))} style={{ width: 28, height: 28, display: "flex", alignItems: "center", justifyContent: "center", background: "var(--bg-2)", border: "1px solid var(--border)", borderRadius: "6px", cursor: "pointer", color: "var(--text-muted)" }}>
                  <ZoomIn size={13} />
                </button>
                <button onClick={() => setZoomFactor(0.85)} style={{ width: 28, height: 28, display: "flex", alignItems: "center", justifyContent: "center", background: "none", border: "none", cursor: "pointer", color: "var(--text-muted)" }}>
                  <RefreshCw size={11} />
                </button>
              </div>

              {/* Fullscreen */}
              <button
                onClick={() => setIsFullscreen(prev => !prev)}
                style={{
                  display: "inline-flex", alignItems: "center", gap: "0.35rem",
                  background: isFullscreen ? "var(--accent-soft)" : "var(--bg-2)",
                  border: isFullscreen ? "1px solid var(--border-accent)" : "1px solid var(--border)",
                  color: isFullscreen ? "var(--accent)" : "var(--text-muted)",
                  borderRadius: "7px", padding: "0.22rem 0.65rem", fontSize: "0.75rem",
                  fontWeight: 600, cursor: "pointer", height: "32px", whiteSpace: "nowrap",
                }}
              >
                {isFullscreen ? <><Minimize2 size={12} /> Back to Critique</> : <><Maximize2 size={12} /> Fullscreen</>}
              </button>
            </div>

            {/* Changes badge */}
            {hasUnappliedChanges && (
              <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: "0.45rem", padding: "0.38rem 0.8rem", background: "rgba(16,185,129,0.09)", border: "1px solid rgba(16,185,129,0.22)", borderRadius: "8px", fontSize: "0.73rem", color: "#10b981", fontWeight: 600 }}>
                <CheckCircle2 size={12} /> Preview showing your applied changes
              </div>
            )}

            {/* Resume paper container */}
            <div style={{
              flex: 1, overflow: "auto", background: "var(--bg-3)", borderRadius: "12px",
              border: hasUnappliedChanges ? "1.5px solid rgba(16,185,129,0.35)" : "1px solid var(--border)",
              display: "flex", justifyContent: "center", alignItems: "flex-start",
              padding: "1.5rem 1rem", position: "relative",
              transition: "border-color 0.3s",
            }}>
              <div style={{
                transform: `scale(${zoomFactor})`,
                transformOrigin: "top center",
                transition: "transform 0.2s cubic-bezier(0.16, 1, 0.3, 1)",
              }}>
                <div className="resume-paper resume-print-area" style={{
                  background: "#ffffff", color: "#333333",
                  padding: "40px", width: "210mm", minHeight: "297mm",
                  boxShadow: hasUnappliedChanges ? "0 8px 32px rgba(16,185,129,0.25)" : "0 8px 30px rgba(0,0,0,0.12)",
                  borderRadius: "4px", transition: "box-shadow 0.3s",
                  outline: hasUnappliedChanges ? "2px solid #10b981" : "1px solid #e5e7eb",
                }}>
                  <ResumeDocument
                    data={modifiedResumeData || (resume as any).structured_data || resume.resume_data || emptyResumeData}
                    templateId={selectedTemplate}
                    highlightChanges={highlightedChanges}
                  />
                </div>
              </div>
            </div>
          </div>
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
