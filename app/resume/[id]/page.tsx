"use client";
import { useEffect, useState, useCallback } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import Navbar from "@/components/Navbar";
import { useAuth } from "@/hooks/useAuth";
import { Resume } from "@/types";
import ResumeDocument from "@/components/ResumeDocument";
import { Card } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import ParticleBackground from "@/components/ui/ParticleBackground";
import { ATSRing } from "@/components/ui/ATSRing";
import ResumeSuggestionsModal from "@/components/ResumeSuggestionsModal";
import { Edit3, Mail, Printer, FileDown, TrendingUp, Share2, Eye, Clock, Copy, Maximize2, Minimize2, Sparkles, Save, CheckCircle2, Wand2, X } from "lucide-react";
import { useToast } from "@/components/ui/toast-1";

interface LoadingStage {
  label: string;
  minPercent: number;
  maxPercent: number;
}

const ROTATING_MESSAGES = [
  "✦ Handshaking with strictly-free AI reasoning models...",
  "✦ Rewriting experience bullets with active action verbs & metrics...",
  "✦ Performing semantic keyword match against Job Description...",
  "✦ Generating professional CV summary & gap recommendations...",
  "✦ Analyzing keywords against Indian recruiter portals...",
  "✦ Comparing achievements with LPA benchmarks...",
  "✦ Assessing tone clarity for IT vs BFSI sectors...",
  "✦ Resolving skills taxonomy with modern technology stacks...",
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

export default function ResumeDetailPage() {
  const { user, loading: authLoading } = useAuth();
  const { showToast } = useToast();
  const router = useRouter();
  const params = useParams();

  const [resume, setResume] = useState<Resume | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<"interview" | "skillgap">("interview");

  // Custom toolbar states
  const [selectedTemplate, setSelectedTemplate] = useState("standard");
  const [zoomFactor, setZoomFactor] = useState(0.85);
  const [isFullscreen, setIsFullscreen] = useState(false);

  // On-demand Deep AI processing states
  const [deepLoading, setDeepLoading] = useState(false);
  const [deepProgress, setDeepProgress] = useState(0);
  const [deepText, setDeepText] = useState("");
  const [deepError, setDeepError] = useState("");
  const [jobDescription, setJobDescription] = useState("");

  // Public Sharing States
  const [shareToken, setShareToken] = useState<string | null>(null);
  const [isSharePublic, setIsSharePublic] = useState(true);
  const [shareLoading, setShareLoading] = useState(false);
  const [shareViews, setShareViews] = useState(0);

  // Interview Prep States
  const [questions, setQuestions] = useState<{ question: string; type: string; suggestedAnswerTips: string }[]>([]);
  const [questionsLoading, setQuestionsLoading] = useState(false);
  const [careerStory, setCareerStory] = useState("");
  const [careerStoryLoading, setCareerStoryLoading] = useState(false);

  // Skill Gap States
  const [targetRole, setTargetRole] = useState("");
  const [skillGapData, setSkillGapData] = useState<{ matchedSkills: string[]; missingSkills: string[]; recommendedCourses: string[]; gapPercentage: number } | null>(null);
  const [skillGapLoading, setSkillGapLoading] = useState(false);
  const [careerRecommendations, setCareerRecommendations] = useState<{ roleTitle: string; marketDemand: string; averageSalaryRange: string; whyGoodFit: string }[]>([]);
  const [recommendationsLoading, setRecommendationsLoading] = useState(false);
  const [showStoryModal, setShowStoryModal] = useState(false);
  const [docxLoading, setDocxLoading] = useState(false);
  const [naukriTips, setNaukriTips] = useState<{ area: string; tip: string; priority: string }[]>([]);
  const [naukriLoading, setNaukriLoading] = useState(false);
  const [naukriFetched, setNaukriFetched] = useState(false);

  // Suggestions States
  const [suggestions, setSuggestions] = useState<any[]>([]);
  const [suggestionsLoading, setSuggestionsLoading] = useState(false);
  const [suggestionsFetched, setSuggestionsFetched] = useState(false);
  const [addingKeywords, setAddingKeywords] = useState(false);

  const [showSuggestionsModal, setShowSuggestionsModal] = useState(false);
  const [estimatedNewScore, setEstimatedNewScore] = useState(0);

  // === NEW: Inline Apply & Save-as-New state ===
  // Holds a working copy of resume_data that can be patched by applying suggestions/tips
  const [modifiedResumeData, setModifiedResumeData] = useState<any | null>(null);
  const [hasUnappliedChanges, setHasUnappliedChanges] = useState(false);
  const [showSaveNewModal, setShowSaveNewModal] = useState(false);
  const [saveNewName, setSaveNewName] = useState("");
  const [savingNew, setSavingNew] = useState(false);
  const [savedNewResumeId, setSavedNewResumeId] = useState<string | null>(null);
  const [highlightedChanges, setHighlightedChanges] = useState<string[]>([]);

  // Naukri tip apply state
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
    } catch (err) {
      console.error(err);
    } finally {
      setSuggestionsLoading(false);
    }
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
        if (data.tips) {
          setNaukriTips(data.tips);
          setNaukriFetched(true);
        }
      }
    } catch (err) {
      console.error(err);
    } finally {
      setNaukriLoading(false);
    }
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
        a.href = url;
        a.download = `${resume.file_name || "Resume"}.docx`;
        document.body.appendChild(a);
        a.click();
        a.remove();
        window.URL.revokeObjectURL(url);

        // Show success banner if they applied suggestions recently
        if (estimatedNewScore > 0 || (resume.ats_score && resume.ats_score.overall > 70)) {
          showToast(`Download complete! 🎉\nYour optimized resume has an ATS score of ${resume.ats_score?.overall || 100}/100.`, "success");
        }
      } else {
        showToast("Failed to export Word document.", "error");
      }
    } catch (err) {
      console.error(err);
      showToast("Error exporting Word document.", "error");
    } finally {
      setDocxLoading(false);
    }
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

      const updatedResumeData = {
        ...resume.resume_data,
        skills: {
          ...resume.resume_data?.skills,
          technical: newSkills
        }
      };

      const updatedAtsScore = {
        ...resume.ats_score,
        missingKeywordDetails: [],
        missingKeywords: [],
        keywordMatches: [
          ...(resume.ats_score.keywordMatches || []),
          ...(resume.ats_score.missingKeywordDetails || [])
        ],
        matchedKeywords: [
          ...(resume.ats_score.matchedKeywords || []),
          ...(resume.ats_score.missingKeywords || [])
        ]
      };

      const res = await fetch("/api/save-resume", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          id: resume.id,
          file_name: resume.file_name,
          raw_text: resume.raw_text,
          resume_data: updatedResumeData,
          template_id: resume.template_id,
          ats_score: updatedAtsScore,
          content_review: resume.content_review,
          jd_match: resume.jd_match,
        }),
      });

      if (res.ok) {
        const updated = await res.json();
        setResume(updated);
        showToast(`Successfully injected ${keywordsToAdd.length} missing keywords into your Technical Skills section!`, "success");
      } else {
        showToast("Failed to save updated resume.", "error");
      }
    } catch (err) {
      console.error(err);
      showToast("Error adding missing keywords.", "error");
    } finally {
      setAddingKeywords(false);
    }
  };

  const fetchQuestions = async () => {
    if (!resume) return;
    setQuestionsLoading(true);
    try {
      const res = await fetch("/api/predict-interview-questions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ resumeId: resume.id })
      });
      if (res.ok) {
        const data = await res.json();
        if (data.questions) {
          setQuestions(data.questions);
        }
      } else {
        showToast("Failed to predict questions. Please try again.", "error");
      }
    } catch (err) {
      console.error(err);
      showToast("Error predicting questions.", "error");
    } finally {
      setQuestionsLoading(false);
    }
  };

  const fetchCareerStory = async () => {
    if (!resume) return;
    setCareerStoryLoading(true);
    try {
      const res = await fetch("/api/generate-career-story", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ resumeId: resume.id })
      });
      if (res.ok) {
        const data = await res.json();
        if (data.script) {
          setCareerStory(data.script);
          setShowStoryModal(true);
        }
      } else {
        showToast("Failed to generate career story script.", "error");
      }
    } catch (err) {
      console.error(err);
      showToast("Error generating career story.", "error");
    } finally {
      setCareerStoryLoading(false);
    }
  };

  const fetchSkillGap = async () => {
    if (!resume || !targetRole.trim()) {
      showToast("Please enter a target role first.", "warning");
      return;
    }
    setSkillGapLoading(true);
    try {
      const res = await fetch("/api/skill-gap", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ resumeId: resume.id, targetRole })
      });
      if (res.ok) {
        const data = await res.json();
        setSkillGapData(data);
      } else {
        showToast("Failed to compute skill gap. Please try again.", "error");
      }
    } catch (err) {
      console.error(err);
      showToast("Error analyzing skill gap.", "error");
    } finally {
      setSkillGapLoading(false);
    }
  };

  const fetchCareerRecommendations = async () => {
    if (!resume) return;
    setRecommendationsLoading(true);
    try {
      const res = await fetch("/api/career-recommendations", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ resumeId: resume.id })
      });
      if (res.ok) {
        const data = await res.json();
        if (data.recommendations) {
          setCareerRecommendations(data.recommendations);
        }
      } else {
        showToast("Failed to get career recommendations.", "error");
      }
    } catch (err) {
      console.error(err);
      showToast("Error getting career recommendations.", "error");
    } finally {
      setRecommendationsLoading(false);
    }
  };

  const fetchShareStatus = async () => {
    if (!params.id) return;
    try {
      const res = await fetch(`/api/share?resumeId=${params.id}`);
      if (res.ok) {
        const data = await res.json();
        if (data.token) {
          setShareToken(data.token);
          setIsSharePublic(data.is_public);
          setShareViews(data.views_count || 0);
        }
      }
    } catch (err) {
      console.error("Failed to fetch share status:", err);
    }
  };

  const handleToggleShare = async () => {
    if (!resume) return;
    setShareLoading(true);
    try {
      const nextPublic = !shareToken ? true : !isSharePublic;
      const res = await fetch("/api/share", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ resumeId: resume.id, isPublic: nextPublic })
      });
      const data = await res.json();
      if (res.ok && data.token) {
        setShareToken(data.token);
        setIsSharePublic(data.is_public);
        setShareViews(data.views_count || 0);
      }
    } catch (err) {
      console.error(err);
      showToast("Error toggling resume share status.", "error");
    } finally {
      setShareLoading(false);
    }
  };

  const fetchResumeData = () => {
    if (authLoading || !user) return;

    setLoading(true);
    fetch("/api/get-resumes")
      .then((r) => r.json())
      .then((data: Resume[]) => {
        const found = data.find((r) => r.id === params.id);
        if (found) {
          setResume(found);
          setModifiedResumeData(JSON.parse(JSON.stringify(found.resume_data || {})));
          if (found.template_id) {
            setSelectedTemplate(found.template_id);
          }
        }
        setLoading(false);
      })
      .catch(() => setLoading(false));
  };

  // === Inline Apply Suggestions → update preview without navigating ===
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
    setHighlightedChanges(prev => [
      ...prev,
      ...selectedSuggestions.map(s => s.suggestedText || s.suggested_text || "")
    ].filter(Boolean));
    setShowSuggestionsModal(false);
    showToast(`✅ ${selectedSuggestions.length} change(s) applied! Check the preview on the right, then click "Save as New Resume".`, "success");
  };

  // === Apply a single Naukri tip AI patch to the live preview ===
  const handleApplyNaukriTipPatch = (idx: number, patch: any) => {
    const base = JSON.parse(JSON.stringify(modifiedResumeData || resume?.resume_data || {}));
    if (patch.field === "summary") {
      base.summary = patch.suggestedValue;
    } else if (patch.field === "skills_technical") {
      const skills = patch.suggestedValue.split(",").map((s: string) => s.trim()).filter(Boolean);
      if (!base.skills) base.skills = { technical: [], soft: [] };
      base.skills.technical = [...new Set([...(base.skills.technical || []), ...skills])];
    } else if (patch.field === "skills_soft") {
      const skills = patch.suggestedValue.split(",").map((s: string) => s.trim()).filter(Boolean);
      if (!base.skills) base.skills = { technical: [], soft: [] };
      base.skills.soft = [...new Set([...(base.skills.soft || []), ...skills])];
    }
    setModifiedResumeData(base);
    setHasUnappliedChanges(true);
    setAppliedTipPatches(prev => ({ ...prev, [idx]: patch }));

    // Track highlight
    const newChanges = patch.field.startsWith("skills")
      ? patch.suggestedValue.split(",").map((s: string) => s.trim())
      : [patch.suggestedValue];
    setHighlightedChanges(prev => [...prev, ...newChanges].filter(Boolean));

    showToast("✅ Tip applied to preview! Save as new resume to keep this version.", "success");
  };

  // === Fetch AI-generated concrete patch for a Naukri tip ===
  const handleGenerateNaukriTipFix = async (idx: number, tip: { area: string; tip: string }) => {
    if (!resume) return;
    setApplyingTipIdx(idx);
    try {
      const res = await fetch("/api/naukri-tips/apply", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ resumeId: resume.id, tipArea: tip.area, tipText: tip.tip })
      });
      if (res.ok) {
        const data = await res.json();
        if (data.patch) handleApplyNaukriTipPatch(idx, data.patch);
      } else {
        showToast("Could not generate a fix for this tip. Please try again.", "error");
      }
    } catch (err) {
      console.error(err);
      showToast("Error applying tip.", "error");
    } finally {
      setApplyingTipIdx(null);
    }
  };

  // === Save Modified Resume as a Brand New Record ===
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
        body: JSON.stringify({
          file_name: saveNewName.trim() || `${resume.file_name} (Optimized)`,
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
        setSavedNewResumeId(newResume.id);
        setShowSaveNewModal(false);
        setHasUnappliedChanges(false);
        showToast(`🎉 Saved as "${saveNewName.trim() || resume.file_name + " (Optimized)"}"! View it on your Dashboard.`, "success");
      } else {
        showToast("Failed to save. Please try again.", "error");
      }
    } catch (err) {
      console.error(err);
      showToast("Error saving new resume.", "error");
    } finally {
      setSavingNew(false);
    }
  };

  useEffect(() => {
    if (!authLoading && !user) {
      router.push("/login");
    }
  }, [authLoading, user, router]);

  useEffect(() => {
    fetchResumeData();
    fetchShareStatus();
  }, [authLoading, user, params.id]);

  useEffect(() => {
    if (resume && !naukriFetched) {
      fetchNaukriTips();
    }
  }, [resume, naukriFetched]);

  const handleTemplateChange = async (tplId: string) => {
    setSelectedTemplate(tplId);
    if (!resume) return;

    try {
      const res = await fetch("/api/save-resume", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          id: resume.id,
          file_name: resume.file_name,
          raw_text: resume.raw_text,
          resume_data: resume.resume_data,
          template_id: tplId,
          ats_score: resume.ats_score,
          content_review: resume.content_review,
          jd_match: resume.jd_match,
        }),
      });
      if (res.ok) {
        const updated = await res.json();
        setResume(updated);
      }
    } catch (err) {
      console.error("Failed to update template:", err);
    }
  };

  const runDeepAI = async () => {
    if (!resume) return;
    setDeepLoading(true);
    setDeepError("");
    setDeepProgress(0);

    let animPercent = 0;
    const animInterval = setInterval(() => {
      animPercent += 1;
      if (animPercent > 98) {
        animPercent = 98;
      }
      setDeepProgress(animPercent);

      const messageIndex = Math.floor(animPercent / 12) % ROTATING_MESSAGES.length;
      setDeepText(ROTATING_MESSAGES[messageIndex]);
    }, 250);

    try {
      const res = await fetch("/api/analyze-resume/deep", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ resumeId: resume.id, jobDescription }),
      });

      if (!res.ok) {
        throw new Error("Deep AI response failed. AI service might be loaded. Please retry.");
      }

      const updatedRow = await res.json();
      if (updatedRow.error) {
        throw new Error(updatedRow.error);
      }

      clearInterval(animInterval);
      setDeepProgress(100);
      setDeepText("✓ Deep AI Enhancements integrated successfully!");

      setResume(updatedRow);

      setTimeout(() => {
        setDeepLoading(false);
        setActiveTab("interview");
      }, 350);

    } catch (err: any) {
      clearInterval(animInterval);
      console.error(err);
      setDeepError(err.message || "Deep AI analysis failed. Please try again.");
      setDeepLoading(false);
    }
  };

  const handlePrint = () => {
    window.print();
  };

  const getScoreColor = (score: number) => {
    if (score >= 70) return "#43e97b";
    if (score >= 45) return "#f6d365";
    return "#ff6584";
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
          <button className="btn-secondary">
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="w-4 h-4 inline-block mr-1.5 align-text-bottom" style={{ verticalAlign: 'middle', marginTop: '-2px' }}><line x1="19" y1="12" x2="5" y2="12"></line><polyline points="12 19 5 12 12 5"></polyline></svg>
            Back to Dashboard
          </button>
        </Link>
      </div>
    </div>
  );

  const hasDeepAnalysis = !!resume.content_review;
  const missingSecs = getMissingSections(resume.resume_data);
  const completionPercent = getCompletionStats(resume.resume_data);

  return (
    <div className="min-h-screen bg-[var(--bg-page)] relative overflow-hidden">
      <ParticleBackground count={50} connectionDist={110} />
      <div style={{ position: 'relative', zIndex: 10 }}>
        <Navbar />

        {showSuggestionsModal && resume && resume.ats_score && (
          <ResumeSuggestionsModal
            resumeId={resume.id}
            suggestions={suggestions}
            currentScore={resume.ats_score.overall}
            potentialScore={estimatedNewScore}
            onClose={() => setShowSuggestionsModal(false)}
            onApply={async (selectedIds) => {
              // Apply inline: find the full suggestion objects by ID and patch resume data in state
              const selectedSuggs = suggestions.filter(s => selectedIds.includes(s.id));
              handleApplySuggestionsInline(selectedSuggs);
            }}
          />
        )}

        {/* Save-as-New Resume Modal */}
        {showSaveNewModal && (
          <div style={{ position: "fixed", inset: 0, zIndex: 1000, background: "rgba(0,0,0,0.75)", display: "flex", alignItems: "center", justifyContent: "center", padding: "1.5rem", backdropFilter: "blur(6px)" }}>
            <div className="card" style={{ maxWidth: "480px", width: "100%", background: "var(--bg-2)", borderRadius: "20px", padding: "2rem", display: "grid", gap: "1.2rem", boxShadow: "0 24px 60px rgba(0,0,0,0.5)", border: "1px solid var(--accent)/30" }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <h3 style={{ fontFamily: "Syne, sans-serif", fontSize: "1.2rem", fontWeight: 800, margin: 0, display: "flex", alignItems: "center", gap: "0.5rem" }}>
                  <Save size={18} className="text-emerald-400" />
                  Save as New Resume
                </h3>
                <button onClick={() => setShowSaveNewModal(false)} style={{ background: "none", border: "none", color: "var(--text-muted)", cursor: "pointer", fontSize: "1.2rem" }}><X size={18} /></button>
              </div>
              <p style={{ color: "var(--text-muted)", fontSize: "0.85rem", margin: 0, lineHeight: 1.5 }}>
                Your original resume stays unchanged. This saves a <strong>new copy</strong> with your applied improvements.
              </p>
              <div>
                <label style={{ fontSize: "0.8rem", fontWeight: 600, color: "var(--text-muted)", display: "block", marginBottom: "0.4rem" }}>New Resume Name</label>
                <input
                  className="input"
                  value={saveNewName}
                  onChange={e => setSaveNewName(e.target.value)}
                  placeholder={`${resume.file_name} (Optimized)`}
                  onKeyDown={e => e.key === "Enter" && handleSaveAsNewResume()}
                  autoFocus
                />
              </div>
              <div style={{ display: "flex", gap: "0.8rem", justifyContent: "flex-end" }}>
                <button onClick={() => setShowSaveNewModal(false)} className="btn-secondary" style={{ fontSize: "0.85rem", padding: "0.5rem 1.2rem" }}>Cancel</button>
                <button
                  onClick={handleSaveAsNewResume}
                  disabled={savingNew}
                  className="btn-primary"
                  style={{ fontSize: "0.85rem", padding: "0.5rem 1.5rem", background: "linear-gradient(135deg, #10b981 0%, #059669 100%)", border: "none" }}
                >
                  {savingNew ? "Saving..." : "💾 Save New Resume"}
                </button>
              </div>
            </div>
          </div>
        )}

        {/* HEADER WIDGET (Hidden on print) */}
        <div className="no-print" style={{ background: "var(--bg-2)", borderBottom: "1px solid var(--border)", padding: "1.2rem 2rem" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", maxWidth: "1400px", margin: "0 auto", flexWrap: "wrap", gap: "1rem" }}>
            <div>
              <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
                <Link href="/dashboard" style={{ textDecoration: "none", color: "var(--text-muted)", fontSize: "0.82rem", display: 'inline-flex', alignItems: 'center' }}>
                  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="w-3.5 h-3.5 inline-block mr-1" style={{ verticalAlign: 'middle' }}><line x1="19" y1="12" x2="5" y2="12"></line><polyline points="12 19 5 12 12 5"></polyline></svg>
                  Dashboard
                </Link>
                <span style={{ color: "var(--border-light)" }}>/</span>
                <span className="tag tag-purple" style={{ fontSize: "0.72rem" }}>
                  {hasDeepAnalysis ? "✦ Deep AI Enhanced" : "⚙ Local Analysis Only"}
                </span>
              </div>
              <h1 style={{ fontFamily: "Syne, sans-serif", fontSize: "1.6rem", fontWeight: 800, marginTop: "0.2rem" }}>
                {resume.file_name}
              </h1>
            </div>

            <div style={{ display: "flex", alignItems: "center", gap: "0.8rem" }}>
              <Link href={`/resume/builder?id=${resume.id}&template=${selectedTemplate}`}>
                <button className="btn-primary" style={{ fontSize: "0.85rem", display: "inline-flex", alignItems: "center", gap: "0.4rem" }}>
                  <Edit3 size={15} />
                  Edit in Builder
                </button>
              </Link>
              <Link href={`/resume/${resume.id}/cover-letter`}>
                <button className="btn-secondary" style={{ fontSize: "0.85rem", borderColor: "var(--accent-2)", color: "var(--accent-2)", display: "inline-flex", alignItems: "center", gap: "0.4rem" }}>
                  <Mail size={15} />
                  Cover Letter
                </button>
              </Link>
              <button onClick={handlePrint} className="btn-secondary" style={{ fontSize: "0.85rem", display: "inline-flex", alignItems: "center", gap: "0.4rem" }}>
                <Printer size={15} />
                Print / Export PDF
              </button>
              <button
                onClick={handleDownloadDocx}
                disabled={docxLoading}
                className="btn-secondary"
                style={{ fontSize: "0.85rem", borderColor: "var(--accent-3)", color: "var(--accent-3)", display: "inline-flex", alignItems: "center", gap: "0.4rem" }}
              >
                <FileDown size={15} />
                {docxLoading ? "Downloading DOCX..." : "Download DOCX"}
              </button>
            </div>
          </div>
        </div>

        {/* DETAILS ANALYTICS SUMMARY BAR (Feature 10.1) */}
        <div className="no-print" style={{ background: "var(--bg-3)", borderBottom: "1px solid var(--border)", padding: "0.75rem 2rem" }}>
          <div style={{ display: "flex", gap: "2rem", alignItems: "center", maxWidth: "1400px", margin: "0 auto", flexWrap: "wrap", fontSize: "0.8rem", color: "var(--text-muted)" }}>
            <div style={{ display: "flex", alignItems: "center", gap: "0.4rem" }}>
              <TrendingUp size={14} className="text-indigo-500" />
              <span>ATS Score:</span>
              <strong style={{ color: resume.ats_score ? getScoreColor(resume.ats_score.overall) : "var(--text)" }}>
                {resume.ats_score ? `${resume.ats_score.overall}/100` : "Not computed"}
              </strong>
            </div>
            <div style={{ display: "flex", alignItems: "center", gap: "0.4rem" }}>
              <Share2 size={14} className="text-purple-500" />
              <span>Sharing Status:</span>
              <strong style={{ color: shareToken && isSharePublic ? "#43e97b" : "#ff6584" }}>
                {shareToken && isSharePublic ? "Public (Active)" : "Private (Off)"}
              </strong>
            </div>
            <div style={{ display: "flex", alignItems: "center", gap: "0.4rem" }}>
              <Eye size={14} className="text-blue-500" />
              <span>Public Link Views:</span>
              <strong style={{ color: "var(--text)" }}>
                {shareViews}
              </strong>
            </div>
            <div style={{ display: "flex", alignItems: "center", gap: "0.4rem" }}>
              <Clock size={14} className="text-green-500" />
              <span>Last Audit:</span>
              <strong style={{ color: "var(--text)" }}>
                {resume.updated_at ? new Date(resume.updated_at).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric", hour: "2-digit", minute: "2-digit" }) : "Never"}
              </strong>
            </div>
          </div>
        </div>

        {/* CORE SPLIT GRID */}
        <div
          className={isFullscreen ? "" : "detail-split-grid"}
          style={isFullscreen ? { maxWidth: "1450px", margin: "0 auto", padding: "1.5rem", display: "grid", gridTemplateColumns: "1fr" } : { maxWidth: "1450px", margin: "0 auto", padding: "1.5rem" }}
        >

          {/* LEFT COLUMN: CRITIQUE PANELS & SETTINGS */}
          {!isFullscreen && (
            <div className="no-print detail-left-column">

              {/* === Save-as-New sticky banner when changes are applied === */}
              {hasUnappliedChanges && (
                <div style={{ background: "linear-gradient(135deg, rgba(16,185,129,0.12) 0%, rgba(5,150,105,0.08) 100%)", border: "1px solid rgba(16,185,129,0.3)", borderRadius: "12px", padding: "0.9rem 1.1rem", display: "flex", justifyContent: "space-between", alignItems: "center", gap: "0.8rem", flexWrap: "wrap" }}>
                  <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
                    <CheckCircle2 size={18} className="text-emerald-400" style={{ flexShrink: 0 }} />
                    <div>
                      <strong style={{ fontSize: "0.85rem", color: "#10b981", display: "block" }}>Changes Applied to Preview</strong>
                      <span style={{ fontSize: "0.75rem", color: "var(--text-muted)" }}>Review the right panel, then save as a new resume to keep them.</span>
                    </div>
                  </div>
                  <div style={{ display: "flex", gap: "0.5rem" }}>
                    <button
                      onClick={() => {
                        setSaveNewName("");
                        setShowSaveNewModal(true);
                      }}
                      className="btn-primary"
                      style={{ fontSize: "0.8rem", padding: "0.45rem 1rem", background: "linear-gradient(135deg, #10b981 0%, #059669 100%)", border: "none", whiteSpace: "nowrap" }}
                    >
                      <Save size={13} style={{ marginRight: "0.3rem" }} />
                      Save as New Resume
                    </button>
                  </div>
                </div>
              )}

              {/* === Link to newly saved resume === */}
              {savedNewResumeId && (
                <div style={{ background: "rgba(16,185,129,0.08)", border: "1px solid rgba(16,185,129,0.25)", borderRadius: "12px", padding: "0.75rem 1rem", display: "flex", alignItems: "center", gap: "0.6rem", justifyContent: "space-between" }}>
                  <span style={{ fontSize: "0.82rem", color: "#10b981", fontWeight: 600 }}>🎉 New resume saved!</span>
                  <Link href={`/resume/${savedNewResumeId}`} style={{ textDecoration: "none" }}>
                    <button className="btn-secondary" style={{ fontSize: "0.78rem", padding: "0.3rem 0.8rem", borderColor: "#10b981", color: "#10b981" }}>View New Resume →</button>
                  </Link>
                </div>
              )}

              {/* Real-time missing sections alerts */}
              {missingSecs.length > 0 && (
                <div style={{ background: "rgba(246, 211, 101, 0.08)", borderLeft: "4px solid #f6d365", padding: "1rem", borderRadius: "12px", border: "1px solid rgba(246,211,101,0.15)" }}>
                  <div style={{ display: "flex", gap: "0.4rem", alignItems: "center" }}>
                    <span style={{ fontSize: "1.1rem" }}>⚠️</span>
                    <strong style={{ color: "#f6d365", fontSize: "0.85rem" }}>Incomplete Resume Profile:</strong>
                  </div>
                  <p style={{ fontSize: "0.78rem", color: "var(--text-muted)", marginTop: "0.25rem", margin: "0.25rem 0 0" }}>
                    The local parser flagged the following critical gaps. Edit in the builder to resolve them:
                  </p>
                  <ul style={{ margin: "0.4rem 0 0 1.2rem", fontSize: "0.78rem", color: "var(--text-muted)" }}>
                    {missingSecs.map((sec, i) => <li key={i} style={{ marginBottom: "0.15rem" }}>Missing {sec}</li>)}
                  </ul>
                </div>
              )}

              {/* Score Grid Cards */}
              <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: "1.2rem" }}>

                {/* ATS Score Card */}
                {resume.ats_score && (
                  <div className="card hover-glow" style={{ position: "relative", overflow: "hidden", textAlign: "center", background: "var(--bg-2)", border: "1px solid var(--border)", padding: "1.8rem 1.2rem", display: "flex", flexDirection: "column", justifyContent: "center", boxShadow: "0 4px 20px rgba(0,0,0,0.05)" }}>
                    <div style={{ position: "absolute", top: 0, left: 0, right: 0, height: "4px", background: `linear-gradient(90deg, ${getScoreColor(resume.ats_score.overall)}, transparent)` }} />
                    <p style={{ fontSize: "0.75rem", fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.1em", color: "var(--text-muted)", marginBottom: "0.8rem" }}>ATS Match Score</p>
                    <div style={{ fontSize: "3rem", fontWeight: 800, fontFamily: "Syne, sans-serif", color: getScoreColor(resume.ats_score.overall), lineHeight: 1, filter: "drop-shadow(0 4px 12px rgba(0,0,0,0.1))" }}>
                      {resume.ats_score.overall}
                    </div>
                    <div style={{ fontSize: "0.78rem", color: "var(--text-muted)", marginTop: "0.6rem", fontWeight: 500 }}>out of 100</div>
                  </div>
                )}

                {/* Completion Profile Card */}
                <div className="card hover-glow" style={{ position: "relative", overflow: "hidden", textAlign: "center", background: "var(--bg-2)", border: "1px solid var(--border)", padding: "1.8rem 1.2rem", display: "flex", flexDirection: "column", justifyContent: "center", boxShadow: "0 4px 20px rgba(0,0,0,0.05)" }}>
                  <div style={{ position: "absolute", top: 0, left: 0, right: 0, height: "4px", background: `linear-gradient(90deg, ${completionPercent >= 70 ? "#43e97b" : completionPercent >= 45 ? "#f6d365" : "#ff6584"}, transparent)` }} />
                  <p style={{ fontSize: "0.75rem", fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.1em", color: "var(--text-muted)", marginBottom: "0.8rem" }}>Profile Completion</p>
                  <div style={{ fontSize: "3rem", fontWeight: 800, fontFamily: "Syne, sans-serif", color: completionPercent >= 70 ? "#43e97b" : completionPercent >= 45 ? "#f6d365" : "#ff6584", lineHeight: 1, filter: "drop-shadow(0 4px 12px rgba(0,0,0,0.1))" }}>
                    {completionPercent}%
                  </div>
                  <div style={{ fontSize: "0.78rem", color: "var(--text-muted)", marginTop: "0.6rem", fontWeight: 500 }}>sections completed</div>
                </div>

                {/* Public Link Generator widget */}
                <div className="card hover-glow" style={{ position: "relative", overflow: "hidden", background: "var(--bg-2)", border: "1px solid var(--border)", padding: "1.5rem 1.2rem", display: "flex", flexDirection: "column", justifyContent: "center", boxShadow: "0 4px 20px rgba(0,0,0,0.05)" }}>
                  <div style={{ position: "absolute", top: 0, left: 0, right: 0, height: "4px", background: "linear-gradient(90deg, #8b5cf6, transparent)" }} />

                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "1.2rem" }}>
                    <span style={{ fontSize: "0.75rem", fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.1em", color: "var(--text-muted)", display: "inline-flex", alignItems: "center", gap: "0.4rem" }}>
                      <Share2 size={14} color="#8b5cf6" />
                      Public Link
                    </span>
                    {shareToken && (
                      <span style={{ fontSize: "0.72rem", fontWeight: 600, color: "var(--text)", background: "rgba(139, 92, 246, 0.1)", padding: "0.25rem 0.6rem", borderRadius: "20px", display: "inline-flex", alignItems: "center", gap: "0.3rem" }}>
                        <Eye size={12} color="#8b5cf6" />
                        {shareViews} Views
                      </span>
                    )}
                  </div>

                  {!shareToken ? (
                    <button
                      onClick={handleToggleShare}
                      className="btn-primary hover-glow"
                      style={{ width: "100%", justifyContent: "center", padding: "0.7rem", fontSize: "0.85rem", background: "linear-gradient(135deg, #8b5cf6 0%, #6d28d9 100%)", color: "#fff", border: "none", borderRadius: "8px" }}
                      disabled={shareLoading}
                    >
                      {shareLoading ? "Generating Link..." : "✨ Generate Share Link"}
                    </button>
                  ) : (
                    <div style={{ display: "flex", flexDirection: "column", gap: "0.8rem" }}>
                      <div style={{ display: "flex", gap: "0.4rem" }}>
                        <input
                          readOnly
                          className="input"
                          style={{ fontSize: "0.78rem", padding: "0.5rem 0.6rem", flex: 1, background: "var(--bg-3)", border: "1px solid var(--border)", borderRadius: "6px", color: "var(--text)", outline: "none" }}
                          value={typeof window !== "undefined" ? window.location.origin + "/share/" + shareToken : ""}
                          onFocus={(e) => e.target.select()}
                        />
                        <button
                          onClick={() => {
                            if (typeof window !== "undefined") {
                              navigator.clipboard.writeText(window.location.origin + "/share/" + shareToken);
                              showToast("Link copied to clipboard!", "success");
                            }
                          }}
                          className="btn-primary"
                          style={{ padding: "0 0.8rem", fontSize: "0.8rem", background: "#8b5cf6", color: "#fff", border: "none", borderRadius: "6px" }}
                        >
                          Copy
                        </button>
                      </div>
                      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                        <label style={{ display: "flex", alignItems: "center", gap: "0.5rem", fontSize: "0.78rem", cursor: "pointer", color: "var(--text-muted)", fontWeight: 500 }}>
                          <input
                            type="checkbox"
                            checked={isSharePublic}
                            onChange={handleToggleShare}
                            disabled={shareLoading}
                            style={{ accentColor: "#8b5cf6", width: "14px", height: "14px" }}
                          />
                          Link is Active
                        </label>
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* ATS ANALYSIS PANEL */}
              {resume.ats_score && (
                <div className="grid gap-6 animate-fade-in-up mt-6">
                  <div className="bg-white border border-gray-200 rounded-2xl shadow-sm p-6 lg:p-8">
                    <h3 className="text-sm font-bold uppercase tracking-widest text-gray-500 mb-6">Score Breakdown</h3>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-8 gap-y-6">
                      {Object.entries(resume.ats_score.breakdown).map(([key, val]) => (
                        <div key={key} className="flex items-center gap-5 p-4 rounded-xl border border-gray-100 bg-gray-50/80">
                          <div className="w-[54px] shrink-0">
                            <ATSRing score={val as number} size={54} strokeWidth={5} />
                          </div>
                          <div>
                            <p className="text-[15px] font-bold capitalize text-gray-900 mb-1">{key}</p>
                            <p className="text-[11px] font-bold text-gray-500 uppercase tracking-wider">{(val as number) >= 70 ? 'Excellent' : (val as number) >= 40 ? 'Average' : 'Needs Work'}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  {resume.ats_score.detectedRole && (
                    <div className="bg-indigo-50/50 border border-indigo-100 rounded-2xl shadow-sm p-6 relative overflow-hidden">
                      <div className="absolute top-0 left-0 bottom-0 w-1 bg-indigo-500" />
                      <p className="text-[11px] font-bold uppercase tracking-widest text-indigo-600 mb-4">AI Role Inference</p>
                      <div className="flex items-center gap-3 flex-wrap">
                        <span className="px-3.5 py-1.5 rounded-lg bg-indigo-100 text-indigo-800 font-bold text-[13px] border border-indigo-200">{resume.ats_score.detectedRole}</span>
                        <span className="px-3.5 py-1.5 rounded-lg bg-white text-gray-700 font-medium text-[13px] border border-gray-200 shadow-sm">{resume.ats_score.detectedIndustry}</span>
                        <span className="px-2.5 py-1.5 rounded-md bg-amber-100 text-amber-800 font-bold text-[11px] border border-amber-200 flex items-center gap-1">
                          <Sparkles size={12} className="text-amber-600" />
                          {resume.ats_score.confidence}% match confidence
                        </span>
                      </div>
                    </div>
                  )}

                  {((resume.ats_score.missingKeywordDetails || resume.ats_score.missingKeywords)?.length ?? 0) > 0 && (
                    <div className="bg-white border border-gray-200 rounded-2xl shadow-sm p-6 lg:p-8">
                      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-4">
                        <p className="text-sm font-bold uppercase tracking-widest text-red-500 flex items-center gap-2 m-0">
                          <span className="w-2 h-2 rounded-full bg-red-500 animate-pulse"></span>
                          High-Value Missing Keywords
                        </p>
                        <button
                          onClick={handleAddMissingKeywords}
                          disabled={addingKeywords}
                          className="flex items-center justify-center gap-2 px-4 py-2 bg-indigo-50 text-indigo-700 hover:bg-indigo-100 font-bold rounded-lg text-[13px] transition-colors border border-indigo-200 shadow-sm disabled:opacity-50"
                        >
                          {addingKeywords ? <><div className="spinner" style={{ width: 14, height: 14 }} /> Processing...</> : <><Sparkles size={14} className="text-indigo-500" /> Auto-Add to Resume</>}
                        </button>
                      </div>
                      <div className="flex flex-wrap gap-2.5">
                        {resume.ats_score.missingKeywordDetails ? (
                          [...resume.ats_score.missingKeywordDetails].sort((a: any, b: any) => b.weight - a.weight).map((kw: any, i: number) => (
                            <span key={`${kw.keyword}-${i}`} className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-lg bg-red-50/50 border border-red-100 text-red-700 text-[13px] font-semibold hover:bg-red-50 transition-colors">
                              {kw.keyword} <span className="bg-red-100/80 px-1.5 py-0.5 rounded text-[10px] font-bold text-red-700">{kw.weight}</span>
                            </span>
                          ))
                        ) : (
                          resume.ats_score.missingKeywords?.map((kw: string, i: number) => (
                            <span key={`${kw}-${i}`} className="px-3.5 py-1.5 rounded-lg bg-red-50/50 border border-red-100 text-red-700 text-[13px] font-semibold">{kw}</span>
                          ))
                        )}
                      </div>
                    </div>
                  )}

                  {((resume.ats_score.keywordMatches || resume.ats_score.matchedKeywords)?.length ?? 0) > 0 && (
                    <div className="bg-white border border-gray-200 rounded-2xl shadow-sm p-6 lg:p-8">
                      <p className="text-sm font-bold uppercase tracking-widest text-emerald-600 mb-6 flex items-center gap-2">
                        <CheckCircle2 size={16} /> Verified Matched Keywords
                      </p>
                      <div className="flex flex-wrap gap-2.5">
                        {resume.ats_score.keywordMatches ? (
                          [...resume.ats_score.keywordMatches].sort((a: any, b: any) => b.weight - a.weight).map((kw: any, i: number) => (
                            <span key={`${kw.keyword}-${i}`} className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-lg bg-emerald-50/50 border border-emerald-100 text-emerald-700 text-[13px] font-semibold">
                              {kw.keyword} <span className="bg-emerald-100/80 px-1.5 py-0.5 rounded text-[10px] font-bold text-emerald-700">{kw.weight}</span>
                            </span>
                          ))
                        ) : (
                          resume.ats_score.matchedKeywords?.map((kw: string, i: number) => (
                            <span key={`${kw}-${i}`} className="px-3.5 py-1.5 rounded-lg bg-emerald-50/50 border border-emerald-100 text-emerald-700 text-[13px] font-semibold">{kw}</span>
                          ))
                        )}
                      </div>
                    </div>
                  )}

                  <div className="text-[12px] font-medium text-gray-400 text-center mt-2 mb-2">
                    Keywords are cross-referenced with live market data for your detected role.
                  </div>

                  <div className="bg-white border border-gray-200 rounded-2xl shadow-sm p-6 lg:p-8 flex flex-col gap-4">
                    <div className="flex justify-between items-center flex-wrap gap-4">
                      <div>
                        <h3 className="font-bold text-gray-900 m-0 flex items-center gap-2 text-lg">
                          <Sparkles size={18} className="text-amber-500" />
                          Interactive Improvements
                        </h3>
                        <p className="text-sm text-gray-500 mt-1 mb-0">
                          Generate AI suggestions to improve your ATS score by adding missing keywords and skills.
                        </p>
                      </div>
                      <button
                        onClick={fetchSuggestions}
                        disabled={suggestionsLoading}
                        className="bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-lg text-sm font-bold shadow-sm transition-colors disabled:opacity-50"
                      >
                        {suggestionsLoading ? "Analyzing..." : "Find Improvements"}
                      </button>
                    </div>

                    {suggestions.length > 0 && (
                      <div className="flex flex-col gap-3 mt-2">
                        <p className="text-sm font-bold text-indigo-600 m-0">
                          {suggestions.length} highly impactful improvements found!
                          Estimated new score: {estimatedNewScore}/100.
                        </p>
                        <button
                          onClick={() => setShowSuggestionsModal(true)}
                          className="bg-white border border-gray-200 hover:bg-gray-50 text-gray-700 px-4 py-2 rounded-lg text-sm font-bold shadow-sm transition-colors w-fit"
                        >
                          View & Apply Suggestions
                        </button>
                      </div>
                    )}
                  </div>

                  {/* Naukri / Portal Tips Card */}
                  <div className="bg-white border border-gray-200 rounded-2xl shadow-sm p-6 lg:p-8" style={{ display: "grid", gap: "1rem" }}>
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                      <h3 style={{ fontFamily: "Syne, sans-serif", fontSize: "1.1rem", fontWeight: 800, margin: 0, display: "flex", alignItems: "center", gap: "0.5rem", color: "#111827" }}>
                        🇮🇳 Indian Portals (Naukri/LinkedIn) SEO Tips
                      </h3>
                      {naukriLoading && <div className="spinner" style={{ width: 16, height: 16 }} />}
                    </div>
                    <p style={{ fontSize: "0.85rem", color: "#4b5563", margin: 0 }}>
                      Boost your visibility on Naukri.com and LinkedIn India. Click <strong>"Apply Fix"</strong> on any tip to instantly update your resume preview.
                    </p>

                    {naukriTips.length === 0 && !naukriLoading && (
                      <button onClick={fetchNaukriTips} className="px-5 py-2.5 bg-indigo-50 text-indigo-700 hover:bg-indigo-100 font-bold rounded-lg text-sm transition-colors border border-indigo-200 shadow-sm" style={{ alignSelf: "start" }}>
                        Load Visibility Tips
                      </button>
                    )}

                    {naukriTips.length > 0 && (
                      <div style={{ display: "grid", gap: "1rem", marginTop: "0.5rem" }}>
                        {naukriTips.map((tip, i) => {
                          const priColors: Record<string, string> = {
                            High: "bg-red-50 text-red-600 border-red-100",
                            Medium: "bg-amber-50 text-amber-600 border-amber-100",
                            Low: "bg-indigo-50 text-indigo-600 border-indigo-100"
                          };
                          const isApplied = !!appliedTipPatches[i];
                          const isApplyingThis = applyingTipIdx === i;
                          return (
                            <div key={i} className={`p-5 rounded-xl border transition-all duration-200 ${isApplied ? 'bg-emerald-50/50 border-emerald-200 shadow-sm' : 'bg-gray-50/80 border-gray-200 hover:border-indigo-300 hover:bg-white hover:shadow-md'}`}>
                              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: "0.6rem", marginBottom: "0.6rem" }}>
                                <strong className={`text-[14.5px] font-bold flex items-center gap-1.5 ${isApplied ? 'text-emerald-700' : 'text-gray-900'}`}>
                                  {isApplied && <CheckCircle2 size={16} />}
                                  {tip.area}
                                </strong>
                                <span className={`text-[10px] font-bold uppercase tracking-widest px-2.5 py-1 rounded-md border ${priColors[tip.priority] || "bg-gray-100 text-gray-600 border-gray-200"}`}>
                                  {tip.priority}
                                </span>
                              </div>
                              <p style={{ margin: "0 0 1rem", fontSize: "0.85rem", color: "#4b5563", lineHeight: 1.5 }}>{tip.tip}</p>

                              {isApplied && appliedTipPatches[i] && (
                                <div className="text-[13px] text-emerald-700 bg-emerald-100/50 rounded-lg p-3 mb-2 border border-emerald-200 font-semibold shadow-inner">
                                  ✓ {appliedTipPatches[i].explanation || "Applied to preview"}
                                </div>
                              )}

                              {!isApplied && (
                                <button
                                  onClick={() => handleGenerateNaukriTipFix(i, tip)}
                                  disabled={isApplyingThis}
                                  className="inline-flex items-center justify-center gap-2 px-4 py-2 bg-white text-indigo-600 border border-indigo-200 hover:bg-indigo-50 font-bold rounded-lg text-[12px] transition-colors disabled:opacity-50 shadow-sm"
                                >
                                  {isApplyingThis ? (
                                    <><div className="spinner" style={{ width: 14, height: 14 }} /> Generating Fix...</>
                                  ) : (
                                    <><Wand2 size={14} className="text-indigo-400" /> Apply Fix to Preview</>
                                  )}
                                </button>
                              )}
                            </div>
                          );
                        })}
                      </div>
                    )}
                  </div>

                </div>
              )}


              {/* Tab Navigation */}
              <div className="flex flex-wrap gap-2 border-b border-[var(--border)] mt-4 pb-4">
                {[
                { key: "interview", label: "Interview Prep" },
                { key: "skillgap", label: "Skill Gap & Career" },
                ].map((tab) => {
                  const isDeepLocked = (tab.key === "content" || tab.key === "jd") && !hasDeepAnalysis;
                  return (
                    <button
                      key={tab.key}
                      onClick={() => setActiveTab(tab.key as any)}
                      className={`px-4 py-2 rounded-full font-semibold text-sm flex items-center gap-2 transition-all duration-200 shrink-0 ${activeTab === tab.key
                          ? "bg-[var(--accent)] text-white shadow-md shadow-[var(--accent)]/20"
                          : isDeepLocked
                            ? "bg-[var(--bg-elevated)] text-[var(--text-dim)] cursor-not-allowed opacity-60 hover:bg-[var(--bg-elevated)]"
                            : "bg-[var(--bg-elevated)] text-[var(--text-muted)] hover:bg-[var(--bg-3)] hover:text-[var(--text-primary)]"
                        }`}
                      disabled={isDeepLocked}
                      title={isDeepLocked ? "Requires Deep AI Analysis" : ""}
                    >
                      {isDeepLocked && <span className="text-xs opacity-75">🔒</span>}
                      {tab.label}
                    </button>
                  );
                })}
              </div>



              {activeTab === "interview" && (
                <div style={{ display: "grid", gap: "1rem", animation: "fadeInUp 0.3s ease" }}>

                  {/* Career Story Generation Button */}
                  <div className="card" style={{ display: "grid", gap: "0.8rem" }}>
                    <h3 style={{ fontFamily: "Syne, sans-serif", fontSize: "1.05rem", fontWeight: 700, margin: 0 }}>✦ Career Pitch Script ("Tell Me About Yourself")</h3>
                    <p style={{ fontSize: "0.8rem", color: "var(--text-muted)", margin: 0, lineHeight: 1.4 }}>
                      Generate a high-quality 2-minute elevator pitch script tailored to your resume's achievements to kickstart your interviews confidently.
                    </p>
                    <button
                      onClick={fetchCareerStory}
                      disabled={careerStoryLoading}
                      className="btn-primary"
                      style={{ width: "100%", justifyContent: "center", padding: "0.6rem 1rem", fontSize: "0.85rem", background: "linear-gradient(135deg, #6c63ff 0%, #3b82f6 100%)", border: "none" }}
                    >
                      {careerStoryLoading ? "Generating Elevator Pitch..." : "✦ Generate Elevator Pitch Script"}
                    </button>
                  </div>

                  {/* Predicted Interview Questions */}
                  <div className="card" style={{ display: "grid", gap: "1rem" }}>
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: "0.5rem" }}>
                      <div>
                        <h3 style={{ fontFamily: "Syne, sans-serif", fontSize: "1.05rem", fontWeight: 700, margin: 0 }}>🎯 AI-Predicted Interview Questions</h3>
                        <p style={{ fontSize: "0.78rem", color: "var(--text-muted)", margin: "0.2rem 0 0" }}>Get 5 personalized technical, behavioral, and background questions you are highly likely to face.</p>
                      </div>
                      {questions.length > 0 && (
                        <button onClick={fetchQuestions} disabled={questionsLoading} className="btn-secondary" style={{ padding: "0.4rem 0.8rem", fontSize: "0.8rem" }}>
                          {questionsLoading ? "Regenerating..." : "Regenerate Questions"}
                        </button>
                      )}
                    </div>

                    {questions.length === 0 ? (
                      <div style={{ textAlign: "center", padding: "2rem 1.5rem" }}>
                        <button
                          onClick={fetchQuestions}
                          disabled={questionsLoading}
                          className="btn-primary"
                          style={{ padding: "0.6rem 1.2rem", fontSize: "0.85rem" }}
                        >
                          {questionsLoading ? "Predicting Questions..." : "Predict Interview Questions"}
                        </button>
                      </div>
                    ) : (
                      <div style={{ display: "grid", gap: "0.8rem", marginTop: "0.5rem" }}>
                        {questions.map((q, idx) => {
                          const typeColors: Record<string, string> = {
                            technical: "tag-purple",
                            behavioral: "tag-green",
                            "experience-specific": "tag-yellow"
                          };
                          const displayType = q.type || "general";
                          const tagClass = typeColors[displayType.toLowerCase()] || "tag-purple";

                          return (
                            <div key={idx} className="card" style={{ background: "rgba(255,255,255,0.02)", border: "1px solid var(--border)", padding: "1rem", borderRadius: "8px" }}>
                              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: "0.8rem", marginBottom: "0.5rem" }}>
                                <span style={{ fontSize: "0.88rem", fontWeight: 700, color: "var(--text)" }}>Q{idx + 1}: {q.question}</span>
                                <span className={`tag ${tagClass}`} style={{ fontSize: "0.65rem", textTransform: "capitalize", flexShrink: 0 }}>
                                  {displayType}
                                </span>
                              </div>
                              <div style={{ padding: "0.75rem", background: "rgba(0,0,0,0.15)", borderRadius: "6px", borderLeft: "3px solid var(--accent)", fontSize: "0.8rem", color: "var(--text-muted)", lineHeight: 1.4 }}>
                                <strong style={{ color: "var(--text)", display: "block", marginBottom: "0.25rem", fontSize: "0.76rem" }}>Suggested Talking Points & Tips:</strong>
                                {q.suggestedAnswerTips}
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    )}
                  </div>

                </div>
              )}

              {activeTab === "skillgap" && (
                <div style={{ display: "grid", gap: "1.2rem", animation: "fadeInUp 0.3s ease" }}>

                  {/* Skill Gap Section */}
                  <div className="card" style={{ display: "grid", gap: "1rem" }}>
                    <div>
                      <h3 style={{ fontFamily: "Syne, sans-serif", fontSize: "1.05rem", fontWeight: 700, margin: 0 }}>🛠️ Skill Gap Analysis</h3>
                      <p style={{ fontSize: "0.78rem", color: "var(--text-muted)", margin: "0.2rem 0 0" }}>Compare your current resume skills against the industry standards for a target job role.</p>
                    </div>

                    <div style={{ display: "flex", gap: "0.5rem", flexWrap: "wrap" }}>
                      <input
                        className="input"
                        style={{ flex: 1, minWidth: "200px", fontSize: "0.85rem" }}
                        placeholder="e.g. Senior Frontend Engineer, DevOps Analyst, Product Manager..."
                        value={targetRole}
                        onChange={(e) => setTargetRole(e.target.value)}
                      />
                      <button
                        onClick={fetchSkillGap}
                        disabled={skillGapLoading}
                        className="btn-primary"
                        style={{ padding: "0.65rem 1.2rem", fontSize: "0.85rem" }}
                      >
                        {skillGapLoading ? "Analyzing..." : "Analyze Gap"}
                      </button>
                    </div>

                    {skillGapData && (
                      <div style={{ display: "grid", gap: "1rem", borderTop: "1px solid var(--border)", paddingTop: "1rem", marginTop: "0.5rem" }}>

                        {/* Gap Percentage Badge/Scale */}
                        <div style={{ display: "flex", alignItems: "center", gap: "1rem", background: "rgba(0,0,0,0.15)", padding: "0.8rem 1.2rem", borderRadius: "8px" }}>
                          <div style={{
                            fontSize: "1.8rem",
                            fontWeight: 800,
                            fontFamily: "Syne, sans-serif",
                            color: skillGapData.gapPercentage > 60 ? "#ff6584" : skillGapData.gapPercentage > 30 ? "#f6d365" : "#43e97b"
                          }}>
                            {skillGapData.gapPercentage}%
                          </div>
                          <div>
                            <strong style={{ display: "block", fontSize: "0.82rem" }}>Skills Gap Detected</strong>
                            <span style={{ fontSize: "0.75rem", color: "var(--text-muted)" }}>
                              {skillGapData.gapPercentage > 60 ? "Requires significant skill acquisition." : skillGapData.gapPercentage > 30 ? "Moderate alignment. Learn recommended topics to stand out." : "Excellent alignment! Minimal skill gap detected."}
                            </span>
                          </div>
                        </div>

                        {/* Matched vs Missing Skill Lists */}
                        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1rem", flexWrap: "wrap" }}>
                          <div>
                            <p className="section-label" style={{ marginBottom: "0.5rem", color: "#43e97b" }}>Matched Skills ({skillGapData.matchedSkills?.length || 0})</p>
                            <div style={{ display: "flex", flexWrap: "wrap", gap: "0.3rem" }}>
                              {skillGapData.matchedSkills?.map((s) => <span key={s} className="tag tag-green" style={{ fontSize: "0.72rem" }}>{s}</span>)}
                              {(!skillGapData.matchedSkills || skillGapData.matchedSkills.length === 0) && <span style={{ fontSize: "0.76rem", color: "var(--text-muted)" }}>None detected</span>}
                            </div>
                          </div>
                          <div>
                            <p className="section-label" style={{ marginBottom: "0.5rem", color: "#ff6584" }}>Missing Skills ({skillGapData.missingSkills?.length || 0})</p>
                            <div style={{ display: "flex", flexWrap: "wrap", gap: "0.3rem" }}>
                              {skillGapData.missingSkills?.map((s) => <span key={s} className="tag tag-red" style={{ fontSize: "0.72rem" }}>{s}</span>)}
                              {(!skillGapData.missingSkills || skillGapData.missingSkills.length === 0) && <span style={{ fontSize: "0.76rem", color: "var(--text-muted)" }}>None detected</span>}
                            </div>
                          </div>
                        </div>

                        {/* Recommended Courses */}
                        {skillGapData.recommendedCourses && skillGapData.recommendedCourses.length > 0 && (
                          <div style={{ background: "rgba(108,99,255,0.04)", border: "1px solid rgba(108,99,255,0.15)", borderRadius: "8px", padding: "1rem" }}>
                            <p className="section-label" style={{ marginBottom: "0.5rem", color: "var(--accent)" }}>Recommended Learning Topics</p>
                            <ul style={{ margin: "0 0 0 1.2rem", padding: 0, fontSize: "0.8rem", color: "var(--text-muted)", lineHeight: 1.5 }}>
                              {skillGapData.recommendedCourses.map((c, i) => (
                                <li key={i} style={{ marginBottom: "0.25rem" }}>
                                  <strong style={{ color: "var(--text)" }}>{c}</strong>
                                </li>
                              ))}
                            </ul>
                          </div>
                        )}

                      </div>
                    )}
                  </div>

                  {/* Career Path Options Recommendations */}
                  <div className="card" style={{ display: "grid", gap: "1rem" }}>
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: "0.5rem" }}>
                      <div>
                        <h3 style={{ fontFamily: "Syne, sans-serif", fontSize: "1.05rem", fontWeight: 700, margin: 0, display: "inline-flex", alignItems: "center", gap: "0.4rem" }}>
                          <TrendingUp size={16} className="text-emerald-500" />
                          Next-Step Career Path Recommendations
                        </h3>
                        <p style={{ fontSize: "0.78rem", color: "var(--text-muted)", margin: "0.2rem 0 0" }}>Discover alternative or progressive career paths based on your experience profile.</p>
                      </div>
                      {careerRecommendations.length > 0 && (
                        <button onClick={fetchCareerRecommendations} disabled={recommendationsLoading} className="btn-secondary" style={{ padding: "0.4rem 0.8rem", fontSize: "0.8rem" }}>
                          {recommendationsLoading ? "Refreshing..." : "Refresh Paths"}
                        </button>
                      )}
                    </div>

                    {careerRecommendations.length === 0 ? (
                      <div style={{ textAlign: "center", padding: "1.5rem" }}>
                        <button
                          onClick={fetchCareerRecommendations}
                          disabled={recommendationsLoading}
                          className="btn-primary"
                          style={{ padding: "0.6rem 1.2rem", fontSize: "0.85rem" }}
                        >
                          {recommendationsLoading ? "Analyzing Profile..." : "Explore Next-Step Career Paths"}
                        </button>
                      </div>
                    ) : (
                      <div style={{ display: "grid", gap: "0.8rem", marginTop: "0.5rem" }}>
                        {careerRecommendations.map((rec, idx) => {
                          const demandColors: Record<string, string> = {
                            high: "tag-green",
                            medium: "tag-yellow",
                            low: "tag-red"
                          };
                          const demandClass = demandColors[(rec.marketDemand || "medium").toLowerCase()] || "tag-yellow";
                          return (
                            <div key={idx} className="card" style={{ background: "rgba(255,255,255,0.01)", border: "1px solid var(--border)", padding: "1rem", borderRadius: "8px" }}>
                              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: "0.8rem", marginBottom: "0.4rem", flexWrap: "wrap" }}>
                                <strong style={{ fontSize: "0.92rem", color: "var(--text)" }}>{rec.roleTitle}</strong>
                                <div style={{ display: "flex", gap: "0.4rem", alignItems: "center" }}>
                                  <span className="tag tag-purple" style={{ fontSize: "0.7rem" }}>{rec.averageSalaryRange}</span>
                                  <span className={`tag ${demandClass}`} style={{ fontSize: "0.7rem" }}>Demand: {rec.marketDemand}</span>
                                </div>
                              </div>
                              <p style={{ fontSize: "0.8rem", color: "var(--text-muted)", margin: 0, lineHeight: 1.4 }}>
                                {rec.whyGoodFit}
                              </p>
                            </div>
                          );
                        })}
                      </div>
                    )}
                  </div>

                </div>
              )}

            </div>
          )}

          {/* RIGHT COLUMN: STICKY LIVE DOCUMENT PREVIEW PANEL */}
          <div className="no-print detail-right-column">

            {/* Zoom controls & fullscreen & template switching toolbar */}
            <div className="card" style={{ padding: "0.75rem 1rem", display: "flex", flexWrap: "wrap", justifyContent: "space-between", alignItems: "center", gap: "0.8rem" }}>

              {/* Template Selector dropdown */}
              <div style={{ display: "flex", alignItems: "center", gap: "0.4rem" }}>
                <span style={{ fontSize: "0.74rem", fontWeight: 700, textTransform: "uppercase", color: "var(--text-muted)" }}>Template:</span>
                <select
                  value={selectedTemplate}
                  onChange={(e) => handleTemplateChange(e.target.value)}
                  className="input"
                  style={{ width: "135px", padding: "0.25rem 0.5rem", fontSize: "0.78rem", borderRadius: "6px" }}
                >
                  <option value="standard">Standard (Recommended)</option>
                  <option value="modern">Modern ATS</option>
                  <option value="professional">Professional</option>
                  <option value="executive">Executive</option>
                  <option value="minimal">Minimal</option>
                  <option value="creative">Creative</option>
                  <option value="ats-safe">ATS Safe</option>
                  <option value="fresher">Fresher Mode</option>
                  <option value="startup">Startup Growth</option>
                  <option value="it-tech">IT Tech</option>
                  <option value="bfsi-risk">BFSI Corporate</option>
                  <option value="minimal-2">Minimalist Teal</option>
                </select>
                <Link href={`/resume/templates?id=${resume.id}`} style={{ textDecoration: "none" }}>
                  <button className="btn-secondary" style={{ padding: "0.25rem 0.5rem", fontSize: "0.75rem", borderRadius: "6px", whiteSpace: "nowrap" }}>
                    🖼️ Gallery
                  </button>
                </Link>
              </div>

              {/* Zoom factor */}
              <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
                <button onClick={() => setZoomFactor(prev => Math.max(0.6, prev - 0.05))} className="btn-secondary" style={{ padding: "0.2rem 0.5rem", fontSize: "0.78rem", borderRadius: "6px" }}>Zoom -</button>
                <input
                  type="range"
                  min="0.6"
                  max="1.2"
                  step="0.05"
                  value={zoomFactor}
                  onChange={(e) => setZoomFactor(parseFloat(e.target.value))}
                  style={{ width: "60px", accentColor: "var(--accent)" }}
                />
                <span style={{ fontSize: "0.74rem", color: "var(--text-muted)", minWidth: "30px", textAlign: "right" }}>{Math.round(zoomFactor * 100)}%</span>
                <button onClick={() => setZoomFactor(prev => Math.min(1.2, prev + 0.05))} className="btn-secondary" style={{ padding: "0.2rem 0.5rem", fontSize: "0.78rem", borderRadius: "6px" }}>Zoom +</button>
              </div>

              {/* Screen layout option */}
              <div style={{ display: "flex", gap: "0.4rem" }}>
                <button
                  onClick={() => setIsFullscreen(prev => !prev)}
                  className="btn-secondary"
                  style={{ padding: "0.25rem 0.6rem", fontSize: "0.78rem", borderRadius: "6px", display: "inline-flex", alignItems: "center", gap: "0.4rem" }}
                >
                  {isFullscreen ? (
                    <>
                      <Minimize2 size={13} />
                      Back to Critique
                    </>
                  ) : (
                    <>
                      <Maximize2 size={13} />
                      Fullscreen Preview
                    </>
                  )}
                </button>
              </div>
            </div>

            {/* Preview modified indicator */}
            {hasUnappliedChanges && (
              <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: "0.5rem", padding: "0.4rem 0.8rem", background: "rgba(16,185,129,0.1)", border: "1px solid rgba(16,185,129,0.25)", borderRadius: "8px", fontSize: "0.75rem", color: "#10b981", fontWeight: 600 }}>
                <CheckCircle2 size={13} />
                Preview showing your applied changes
              </div>
            )}

            {/* Sticky preview paper container */}
            <div style={{
              flex: 1,
              overflow: "auto",
              background: "var(--bg-2)",
              borderRadius: "12px",
              border: "1px solid var(--border)",
              display: "flex",
              justifyContent: "center",
              alignItems: "start",
              padding: "2rem 1rem",
              position: "relative"
            }}>

              <div style={{
                transform: `scale(${zoomFactor})`,
                transformOrigin: "top center",
                transition: "transform 0.2s cubic-bezier(0.16, 1, 0.3, 1)",
              }}>
                <div className="resume-paper resume-print-area" style={{
                  background: "#ffffff",
                  color: "#333333",
                  padding: "40px",
                  width: "210mm",
                  minHeight: "297mm",
                  boxShadow: hasUnappliedChanges ? "0 10px 40px rgba(16,185,129,0.3)" : "0 8px 30px rgba(0,0,0,0.12)",
                  borderRadius: "4px",
                  transition: "box-shadow 0.3s",
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

        {/* PRINT-ONLY RESUME CONTAINER */}
        <div className="print-only">
          <div className="resume-paper resume-print-area" style={{ background: "#ffffff", color: "#333333", padding: "40px", width: "100%" }}>
            <ResumeDocument data={modifiedResumeData || (resume as any).structured_data || resume.resume_data || emptyResumeData} templateId={selectedTemplate} />
          </div>
        </div>

        {/* ELEVATOR PITCH MODAL OVERLAY */}
        {showStoryModal && (
          <div style={{
            position: "fixed",
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            background: "rgba(0, 0, 0, 0.75)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            zIndex: 1000,
            padding: "1.5rem",
            backdropFilter: "blur(4px)",
            animation: "fadeIn 0.2s ease-out"
          }}>
            <div className="card" style={{
              maxWidth: "600px",
              width: "100%",
              background: "var(--bg-2)",
              border: "1px solid var(--border)",
              borderRadius: "16px",
              padding: "2rem",
              display: "grid",
              gap: "1.2rem",
              boxShadow: "0 20px 40px rgba(0,0,0,0.5)",
              animation: "scaleUp 0.2s ease-out"
            }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <h3 style={{ fontFamily: "Syne, sans-serif", fontSize: "1.2rem", fontWeight: 800, margin: 0 }}>🗣️ Your Career Pitch Script</h3>
                <button
                  onClick={() => setShowStoryModal(false)}
                  style={{ background: "transparent", border: "none", color: "var(--text-muted)", fontSize: "1.2rem", cursor: "pointer" }}
                >
                  ✕
                </button>
              </div>

              <p style={{ fontSize: "0.78rem", color: "var(--text-muted)", margin: 0 }}>
                Use this script to introduce yourself when interviewers ask: <em>"Tell me about yourself"</em>.
              </p>

              <div style={{
                background: "var(--bg-3)",
                border: "1px solid var(--border)",
                borderRadius: "8px",
                padding: "1.2rem",
                fontSize: "0.88rem",
                lineHeight: 1.6,
                color: "var(--text)",
                whiteSpace: "pre-wrap",
                maxHeight: "300px",
                overflowY: "auto"
              }}>
                {careerStory}
              </div>

              <div style={{ display: "flex", gap: "0.8rem", justifyContent: "flex-end" }}>
                <button
                  onClick={() => {
                    navigator.clipboard.writeText(careerStory);
                    showToast("Copied elevator pitch to clipboard!", "success");
                  }}
                  className="btn-primary"
                  style={{ padding: "0.5rem 1.2rem", fontSize: "0.85rem", display: "inline-flex", alignItems: "center", gap: "0.4rem" }}
                >
                  <Copy size={14} />
                  Copy Script
                </button>
                <button
                  onClick={() => setShowStoryModal(false)}
                  className="btn-secondary"
                  style={{ padding: "0.5rem 1.2rem", fontSize: "0.85rem" }}
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        )}

      </div>
    </div>
  );
}
