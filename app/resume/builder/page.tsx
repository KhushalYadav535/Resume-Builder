"use client";
import { useState, Suspense, useEffect, useRef } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import Link from "next/link";
import Navbar from "@/components/Navbar";
import { useAuth } from "@/hooks/useAuth";
import { ResumeData, WorkExperience, Education, Project, Certification, ATSScore, LanguagesKnown, JDMatch } from "@/types";
import { calculateATS } from "@/lib/calculateATS";
import ResumeDocument from "@/components/ResumeDocument";
import ResizablePanels from "@/components/ResizablePanels";
import { Card } from "@/components/ui/Card";
import { Input } from "@/components/ui/Input";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";


const defaultEmptyResume: ResumeData = {
  personalInfo: { fullName: "", email: "", phone: "", linkedin: "", location: "", website: "", currentCTC: "", expectedCTC: "" },
  summary: "",
  workExperience: [],
  education: [],
  skills: { technical: [], soft: [] },
  projects: [],
  certifications: [],
  languagesKnown: [],
  fresherMode: false,
  hackathons: [],
  codingContests: [],
  campusAchievements: [],
  clubsAndLeadership: [],
  competitiveExams: [],
  placementChecklist: {
    aptitudePrep: false,
    codingPrep: false,
    mockInterview: false,
    resumeReviewed: false,
    linkedinUpdated: false,
  },
  industryMode: "IT",
  fontFamily: "Inter",
  fontSize: 10,
  spacing: 1.2,
  sectionOrder: ["summary", "work", "education", "skills", "projects", "certifications", "languages", "fresher"],
};

function uid() { return Math.random().toString(36).slice(2, 9); }

function calculateTenureMonths(startStr: string, endStr: string, isCurrent: boolean): number {
  if (!startStr) return 0;
  
  const parseDateStr = (str: string) => {
    const s = str.trim().toLowerCase();
    if (!s || s === "present" || s === "current") return new Date();
    // Check if it is a year only (e.g. 2021)
    if (/^\d{4}$/.test(s)) {
      return new Date(parseInt(s), 0, 1);
    }
    // Try standard parsing
    const d = new Date(str);
    if (!isNaN(d.getTime())) return d;
    return null;
  };

  const start = parseDateStr(startStr);
  const end = isCurrent ? new Date() : parseDateStr(endStr);

  if (!start || !end) return 18; // Default to safe if unparseable

  const diffYears = end.getFullYear() - start.getFullYear();
  const diffMonths = end.getMonth() - start.getMonth();
  return diffYears * 12 + diffMonths;
}

type Step = 
  | "personal" 
  | "summary" 
  | "work" 
  | "education" 
  | "skills" 
  | "projects" 
  | "certifications" 
  | "languages"
  | "fresher"
  | "templates" 
  | "preview";

const stepsOrder: { key: Step; label: string }[] = [
  { key: "personal", label: "Personal Info" },
  { key: "summary", label: "Summary" },
  { key: "work", label: "Work Experience" },
  { key: "education", label: "Education" },
  { key: "skills", label: "Skills" },
  { key: "projects", label: "Projects" },
  { key: "certifications", label: "Certifications" },
  { key: "languages", label: "Languages Known" },
  { key: "fresher", label: "Fresher Activities" },
  { key: "templates", label: "Template & Design" },
  { key: "preview", label: "Preview & Scan" },
];

function BuilderContent() {
  const { user, loading: authLoading } = useAuth();
  const router = useRouter();
  const searchParams = useSearchParams();

  // URL Query States
  const initialTemplate = searchParams.get("template") || "standard";
  const editId = searchParams.get("id");

  // Primary States
  const [resumeId, setResumeId] = useState<string | null>(editId);
  const [resume, setResume] = useState<ResumeData>(defaultEmptyResume);
  const [selectedTemplate, setSelectedTemplate] = useState<string>(initialTemplate);
  const [activeStep, setActiveStep] = useState<Step>("personal");
  const [saveStatus, setSaveStatus] = useState<"" | "saving" | "saved" | "error">("");
  const [validationError, setValidationError] = useState("");
  
  // Real-time Local ATS Score
  const [localATS, setLocalATS] = useState<ATSScore | null>(null);

  // UI Helpers
  const [skillInput, setSkillInput] = useState({ tech: "", soft: "" });
  const [collapsedCards, setCollapsedCards] = useState<Record<string, boolean>>({});
  const [zoomFactor, setZoomFactor] = useState(0.85);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [importOption, setImportOption] = useState<"paste" | "pdf">("pdf");
  const [pasteText, setPasteText] = useState("");
  const [pdfFile, setPdfFile] = useState<File | null>(null);
  const [linkedinLoading, setLinkedinLoading] = useState(false);
  const [showLinkedinModal, setShowLinkedinModal] = useState(false);
  const [aiLoading, setAiLoading] = useState<string>("");

  // Inline AI Rewrite States
  const [inlineRewriteKey, setInlineRewriteKey] = useState<string>("");
  const [inlineRewriteSuggestions, setInlineRewriteSuggestions] = useState<string[]>([]);
  const [inlineRewriteLoading, setInlineRewriteLoading] = useState(false);

  const handleInlineRewrite = async (text: string, context: string, key: string) => {
    setInlineRewriteKey(key);
    setInlineRewriteLoading(true);
    setInlineRewriteSuggestions([]);
    try {
      const res = await fetch("/api/ai-rewrite", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          text,
          context,
          targetJobDescription: resume.targetJobDescription || "",
        }),
      });
      const data = await res.json();
      if (!res.ok || data.error) throw new Error(data.error || "Rewrite failed");
      setInlineRewriteSuggestions(data.suggestions || []);
    } catch (err: any) {
      console.error(err);
      setInlineRewriteSuggestions([]);
    } finally {
      setInlineRewriteLoading(false);
    }
  };

  // AI Career Coach States

  const [showCoach, setShowCoach] = useState(false);
  const [coachMessages, setCoachMessages] = useState<{ role: "user" | "coach"; content: string }[]>([
    { role: "coach", content: "👋 Namaste! I am your AI Career Coach. Ask me anything about improving your resume, explaining career gaps (like UPSC prep, personal reasons), or how to frame your salary package in ₹ LPA. How can I help you today?" }
  ]);
  const [coachInput, setCoachInput] = useState("");
  const [coachLoading, setCoachLoading] = useState(false);

  const handleCoachSend = async (customPrompt?: string) => {
    const prompt = customPrompt || coachInput;
    if (!prompt.trim()) return;

    const updatedMessages = [...coachMessages, { role: "user" as const, content: prompt }];
    setCoachMessages(updatedMessages);
    if (!customPrompt) setCoachInput("");
    setCoachLoading(true);

    try {
      const res = await fetch("/api/ai-chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          messages: updatedMessages,
          resumeData: resume
        })
      });

      const data = await res.json();
      if (!res.ok || data.error) throw new Error(data.error || "Chat failed");

      setCoachMessages(prev => [...prev, { role: "coach" as const, content: data.message }]);
    } catch (err: any) {
      console.error(err);
      setCoachMessages(prev => [...prev, { role: "coach" as const, content: "⚠️ Sorry, I encountered a connection error. Please try again." }]);
    } finally {
      setCoachLoading(false);
    }
  };
  // Public Sharing States
  const [shareToken, setShareToken] = useState<string | null>(null);
  const [isSharePublic, setIsSharePublic] = useState(true);
  const [shareLoading, setShareLoading] = useState(false);
  const [shareViews, setShareViews] = useState(0);

  const fetchShareStatus = async () => {
    if (!resumeId) return;
    try {
      const res = await fetch(`/api/share?resumeId=${resumeId}`);
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

  useEffect(() => {
    if (activeStep === "preview" && resumeId) {
      fetchShareStatus();
    }
  }, [activeStep, resumeId]);

  const handleToggleShare = async () => {
    if (!resumeId) return;
    setShareLoading(true);
    try {
      const nextPublic = !shareToken ? true : !isSharePublic;
      const res = await fetch("/api/share", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ resumeId, isPublic: nextPublic })
      });
      const data = await res.json();
      if (res.ok && data.token) {
        setShareToken(data.token);
        setIsSharePublic(data.is_public);
        setShareViews(data.views_count || 0);
      }
    } catch (err) {
      console.error(err);
      alert("Error toggling resume share status.");
    } finally {
      setShareLoading(false);
    }
  };

  // Autosave Ref for debouncing
  const saveTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const isFirstLoad = useRef(true);

  // Fetch or restore existing resume
  useEffect(() => {
    if (authLoading || !user) return;

    const fetchResume = async () => {
      try {
        const res = await fetch("/api/get-resumes");
        const data = await res.json();
        
        let found = null;
        if (editId) {
          found = data.find((r: any) => r.id === editId);
        } else if (data && Array.isArray(data) && data.length > 0) {
          // Prefill with the most recently updated resume if no editId is provided
          found = [...data].sort((a, b) => new Date(b.updated_at).getTime() - new Date(a.updated_at).getTime())[0];
        }

        if (found && found.resume_data) {
          // Merge safely with defaults to prevent missing keys
          const merged: ResumeData = {
            ...defaultEmptyResume,
            ...found.resume_data,
            personalInfo: { ...defaultEmptyResume.personalInfo, ...found.resume_data.personalInfo },
            skills: { ...defaultEmptyResume.skills, ...found.resume_data.skills },
            placementChecklist: { ...defaultEmptyResume.placementChecklist, ...found.resume_data.placementChecklist },
          };
          setResume(merged);
          
          if (editId) {
            setResumeId(found.id);
          }
          if (found.template_id && !searchParams.has("template")) {
            setSelectedTemplate(found.template_id);
          }
        }
      } catch (err) {
        console.error("Error loading resume details for edit:", err);
      }
    };
    fetchResume();
  }, [authLoading, user, editId]);

  // Recalculate local ATS Score in real-time
  useEffect(() => {
    const rawText = [
      resume.personalInfo.fullName,
      resume.personalInfo.email,
      resume.personalInfo.phone,
      resume.personalInfo.location,
      resume.personalInfo.linkedin,
      resume.personalInfo.website,
      resume.summary,
      ...resume.workExperience.flatMap((w) => [w.company, w.role, w.industry || "", w.city || "", ...(w.bullets || []), w.toolsUsed?.join(", ") || ""]),
      ...resume.education.map((e) => `${e.level || ""} ${e.degree || ""} in ${e.field || ""} at ${e.institution || ""} ${e.boardOrUniversity || ""} ${e.academicAchievements || ""}`),
      ...resume.skills.technical,
      ...resume.skills.soft,
      ...(resume.languagesKnown?.map(l => `${l.language} ${l.proficiency} ${l.certification || ""}`) || []),
      ...(resume.hackathons || []),
      ...(resume.codingContests || []),
      ...(resume.campusAchievements || []),
      ...(resume.clubsAndLeadership || []),
      ...(resume.competitiveExams?.map(ex => `${ex.exam} ${ex.score} ${ex.year}`) || []),
    ].join("\n");

    try {
      const calculated = calculateATS(rawText);
      setLocalATS(calculated);
    } catch (err) {
      console.error("Failed to run local ATS calculations:", err);
    }
  }, [resume]);

  // Scroll preview to active section dynamically
  useEffect(() => {
    if (activeStep && activeStep !== "preview" && activeStep !== "templates") {
      setTimeout(() => {
        const elementId = `preview-section-${activeStep}`;
        const element = document.getElementById(elementId);
        if (element) {
          element.scrollIntoView({ behavior: "smooth", block: "center" });
        } else if (activeStep === "personal" || activeStep === "summary") {
          const container = document.getElementById("resume-preview-container");
          if (container) container.scrollTo({ top: 0, behavior: "smooth" });
        }
      }, 100);
    }
  }, [activeStep, resume]);

  // Debounced Autosave Trigger
  useEffect(() => {
    if (isFirstLoad.current) {
      isFirstLoad.current = false;
      return;
    }

    if (saveTimeoutRef.current) {
      clearTimeout(saveTimeoutRef.current);
    }

    setSaveStatus("saving");
    saveTimeoutRef.current = setTimeout(() => {
      triggerAutosave();
    }, 1500);

    return () => {
      if (saveTimeoutRef.current) clearTimeout(saveTimeoutRef.current);
    };
  }, [resume, selectedTemplate]);

  const triggerAutosave = async () => {
    if (!resume.personalInfo.fullName.trim()) {
      setSaveStatus(""); // Skip autosaving unnamed records
      return;
    }

    const rawText = [
      resume.personalInfo.fullName,
      resume.personalInfo.email,
      resume.personalInfo.phone,
      resume.personalInfo.location,
      resume.personalInfo.linkedin,
      resume.personalInfo.website,
      resume.summary,
      ...resume.workExperience.flatMap((w) => [w.company, w.role, w.industry || "", w.city || "", ...(w.bullets || []), w.toolsUsed?.join(", ") || ""]),
      ...resume.education.map((e) => `${e.level || ""} ${e.degree || ""} in ${e.field || ""} at ${e.institution || ""} ${e.boardOrUniversity || ""} ${e.academicAchievements || ""}`),
      ...resume.skills.technical,
      ...resume.skills.soft,
      ...(resume.languagesKnown?.map(l => `${l.language} ${l.proficiency} ${l.certification || ""}`) || []),
      ...(resume.hackathons || []),
      ...(resume.codingContests || []),
      ...(resume.campusAchievements || []),
      ...(resume.clubsAndLeadership || []),
      ...(resume.competitiveExams?.map(ex => `${ex.exam} ${ex.score} ${ex.year}`) || []),
    ].join("\n");

    let finalATS = localATS;
    if (!finalATS) {
      try {
        finalATS = calculateATS(rawText);
      } catch (err) {
        console.error(err);
      }
    }

    try {
      const res = await fetch("/api/save-resume", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          id: resumeId,
          file_name: `${resume.personalInfo.fullName}'s Resume`,
          raw_text: rawText,
          resume_data: resume,
          template_id: selectedTemplate,
          ats_score: finalATS,
          jd_match: null,
        }),
      });

      if (!res.ok) {
        let errMessage = "Save request failed";
        try {
          const errData = await res.json();
          if (errData.error) errMessage = errData.error;
        } catch (e) {}
        throw new Error(errMessage);
      }
      const savedRow = await res.json();
      setResumeId(savedRow.id);
      setSaveStatus("saved");
      setTimeout(() => setSaveStatus(""), 2000);
    } catch (err) {
      console.error("Autosave failed:", err);
      setSaveStatus("error");
    }
  };

  const handleAIEngineCall = async (type: string, context: string, callback: (res: string) => void) => {
    setAiLoading(type);
    try {
      const res = await fetch("/api/generate-section", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ section: type, context }),
      });
      const data = await res.json();
      if (data.result) callback(data.result);
    } catch (err) {
      console.error(err);
    } finally {
      setAiLoading("");
    }
  };


  const handleLinkedInImport = async () => {
    setLinkedinLoading(true);
    setValidationError("");

    try {
      let res;
      if (importOption === "paste") {
        if (!pasteText.trim()) return;
        res = await fetch("/api/linkedin-import", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ rawText: pasteText, source: "paste" }),
        });
      } else {
        if (!pdfFile) return;
        const formData = new FormData();
        formData.append("file", pdfFile);
        res = await fetch("/api/linkedin-import", {
          method: "POST",
          body: formData,
        });
      }

      const body = await res.json();
      if (!res.ok || body.error) {
        throw new Error(body.error || "LinkedIn extraction failed.");
      }

      const mapped = mapLinkedInToResume(body.data);
      setResume(mapped);
      setShowLinkedinModal(false);
      setPasteText("");
      setPdfFile(null);
      alert("LinkedIn import successful!");
    } catch (err: any) {
      console.error(err);
      setValidationError(err.message || "Unable to auto import LinkedIn.");
    } finally {
      setLinkedinLoading(false);
    }
  };

  const mapLinkedInToResume = (data: any): ResumeData => {
    const defaultEmptyResume = { ...resume };
    
    const personalInfo = {
      ...defaultEmptyResume.personalInfo,
      fullName: data.personal?.name || "",
      email: data.personal?.email || "",
      phone: data.personal?.phone || "",
      location: data.personal?.location || "",
      linkedin: data.personal?.linkedin_url || data.personal?.linkedin || "",
      headline: data.personal?.headline || "",
    };

    const workExperience = (data.experience || []).map((exp: any, idx: number) => ({
      id: `exp_${idx}_${Date.now()}`,
      company: exp.company || "",
      role: exp.title || "",
      city: exp.city || exp.location || "",
      startDate: exp.startDate || "",
      endDate: exp.endDate || "",
      current: exp.endDate === "Present" || exp.endDate === "Current" || exp.is_current || false,
      bullets: exp.bullets || [],
    }));

    const education = (data.education || []).map((edu: any, idx: number) => ({
      id: `edu_${idx}_${Date.now()}`,
      institution: edu.institution || "",
      boardOrUniversity: edu.boardOrUniversity || "",
      degree: edu.degree || "",
      field: edu.field || "",
      startDate: edu.startDate || "",
      endDate: edu.endDate || "",
      gpa: edu.grade || "",
      gpaType: (edu.grade && (edu.grade.includes("%") || parseFloat(edu.grade) > 10)) ? "percentage" : "cgpa",
    }));

    const technicalSkills = data.skills || [];

    const projects = (data.projects || []).map((proj: any, idx: number) => ({
      id: `proj_${idx}_${Date.now()}`,
      name: proj.name || "",
      description: proj.description || "",
      techStack: proj.technologies || [],
      link: "",
    }));

    const certifications = (data.certifications || []).map((cert: any, idx: number) => ({
      id: `cert_${idx}_${Date.now()}`,
      name: cert.name || "",
      issuer: cert.issuer || "",
      date: cert.date || "",
    }));

    return {
      ...defaultEmptyResume,
      personalInfo,
      summary: data.summary || "",
      workExperience: workExperience,
      education: education,
      skills: {
        technical: technicalSkills,
        soft: defaultEmptyResume.skills.soft,
      },
      projects: projects,
      certifications: certifications,
      languagesKnown: data.languages ? data.languages.map((l: any, i: number) => ({
        id: `lang_${i}_${Date.now()}`,
        language: l.language || "",
        proficiency: l.proficiency || "",
      })) : defaultEmptyResume.languagesKnown,
    };
  };



  const moveItem = <T,>(list: T[], index: number, direction: "up" | "down"): T[] => {
    const result = [...list];
    const targetIdx = direction === "up" ? index - 1 : index + 1;
    if (targetIdx < 0 || targetIdx >= list.length) return list;
    const temp = result[index];
    result[index] = result[targetIdx];
    result[targetIdx] = temp;
    return result;
  };

  const duplicateItem = <T extends { id: string }>(list: T[], index: number): T[] => {
    const result = [...list];
    const itemCopy = { ...result[index], id: uid() };
    result.splice(index + 1, 0, itemCopy);
    return result;
  };

  // Drag and drop HTML5 controls for reordering
  const handleDragStart = (e: React.DragEvent, index: number) => {
    e.dataTransfer.setData("text/plain", index.toString());
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
  };

  const handleDrop = (e: React.DragEvent, targetIndex: number) => {
    const sourceIndex = parseInt(e.dataTransfer.getData("text/plain"));
    if (isNaN(sourceIndex) || sourceIndex === targetIndex) return;
    
    const updated = [...(resume.sectionOrder || [])];
    const [removed] = updated.splice(sourceIndex, 1);
    updated.splice(targetIndex, 0, removed);
    setResume(prev => ({ ...prev, sectionOrder: updated }));
  };

  // Completion calculation
  const getCompletionStats = () => {
    let completedSteps = 0;
    const totalRequired = resume.fresherMode ? 6 : 7;
    
    if (resume.personalInfo.fullName && resume.personalInfo.email) completedSteps++;
    if (resume.summary.trim().length > 10) completedSteps++;
    if (!resume.fresherMode && resume.workExperience.length > 0) completedSteps++;
    if (resume.education.length > 0) completedSteps++;
    if (resume.skills.technical.length > 0) completedSteps++;
    if (resume.projects.length > 0) completedSteps++;
    if (resume.certifications.length > 0) completedSteps++;
    if (resume.languagesKnown && resume.languagesKnown.length > 0) completedSteps++;

    return {
      percent: Math.round((completedSteps / totalRequired) * 100),
      count: completedSteps,
      total: totalRequired
    };
  };

  const completion = getCompletionStats();

  const checkStepCompletion = (key: Step): boolean => {
    switch (key) {
      case "personal":
        return !!(resume.personalInfo.fullName && resume.personalInfo.email);
      case "summary":
        return resume.summary.trim().length > 15;
      case "work":
        return resume.fresherMode ? true : resume.workExperience.length > 0;
      case "education":
        return resume.education.length > 0;
      case "skills":
        return resume.skills.technical.length > 3;
      case "projects":
        return resume.projects.length > 0;
      case "certifications":
        return resume.certifications.length > 0;
      case "languages":
        return !!(resume.languagesKnown && resume.languagesKnown.length > 0);
      case "fresher":
        return !!(resume.competitiveExams && resume.competitiveExams.length > 0) || !!(resume.hackathons && resume.hackathons.length > 0);
      default:
        return true;
    }
  };

  const handlePrint = () => {
    window.print();
  };

  // Filter steps based on Fresher Mode toggle
  const steps = stepsOrder.filter(step => {
    if (step.key === "fresher" && !resume.fresherMode) return false;
    return true;
  });

  return (
    <div style={{ minHeight: "100vh", background: "var(--bg)" }}>
      <Navbar />
      
      {/* EDITOR HEADER */}
      <div className="no-print" style={{ background: "var(--bg-2)", borderBottom: "1px solid var(--border)", padding: "1.2rem 2rem" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", maxWidth: "1550px", margin: "0 auto", flexWrap: "wrap", gap: "1.5rem" }}>
          <div>
            <h1 style={{ fontFamily: "Syne, sans-serif", fontSize: "1.6rem", fontWeight: 800, display: "flex", alignItems: "center", gap: "0.8rem" }}>
              {resumeId ? "✏️ Premium Resume Editor" : "✦ Interactive Resume Builder"}
              {resume.fresherMode && <span style={{ fontSize: "0.75rem", background: "var(--accent-3)", color: "#000", padding: "2px 8px", borderRadius: "20px", fontWeight: 700 }}>FRESHER</span>}
            </h1>
            <div style={{ display: "flex", alignItems: "center", gap: "1.2rem", marginTop: "0.2rem", flexWrap: "wrap" }}>
              <span className="tag tag-purple" style={{ fontSize: "0.72rem", textTransform: "capitalize" }}>
                Template: {selectedTemplate}
              </span>
              {localATS && (
                <span className="tag tag-green" style={{ fontSize: "0.72rem", fontWeight: 700, background: localATS.overall >= 70 ? "rgba(67,233,123,0.12)" : "rgba(255,101,132,0.12)", color: localATS.overall >= 70 ? "#43e97b" : "#ff6584" }}>
                  Scan Compatibility: {localATS.overall}/100
                </span>
              )}
              <span style={{ fontSize: "0.8rem", color: "var(--text-muted)" }}>
                Active Industry: <strong>{resume.industryMode || "IT"}</strong>
              </span>
            </div>
          </div>

          <div style={{ display: "flex", alignItems: "center", gap: "1.2rem" }}>
            {saveStatus === "saving" && <span style={{ fontSize: "0.8rem", color: "var(--accent)" }} className="pulse">● Saving...</span>}
            {saveStatus === "saved" && <span style={{ fontSize: "0.8rem", color: "#43e97b" }}>✓ Saved</span>}
            {saveStatus === "error" && <span style={{ fontSize: "0.8rem", color: "#ff6584" }}>✗ Autosave failed</span>}

            <button onClick={() => setShowCoach(prev => !prev)} className="btn-secondary" style={{ fontSize: "0.85rem", borderColor: "var(--accent)", color: "var(--accent)", fontWeight: 600 }}>
              ✦ AI Career Coach
            </button>
            <button onClick={() => setShowLinkedinModal(true)} className="btn-secondary" style={{ fontSize: "0.85rem", borderColor: "#a89fff", color: "#a89fff" }}>
              💼 Import LinkedIn
            </button>
            <button onClick={() => setIsFullscreen(prev => !prev)} className="btn-primary" style={{ fontSize: "0.85rem" }}>
              {isFullscreen ? "🗔 Hide Preview" : "🗔 See Preview"}
            </button>
            <button onClick={handlePrint} className="btn-secondary" style={{ fontSize: "0.85rem" }}>
              📥 Export PDF
            </button>
            <Link href="/dashboard">
              <button className="btn-secondary" style={{ fontSize: "0.85rem" }}>
                ← Close
              </button>
            </Link>
          </div>
        </div>
      </div>

      {/* CORE 3-COLUMN WORKSPACE */}
      <div className="builder-workspace">
        
        {/* COLUMN 1: PROGRESS & NAVIGATION SIDEBAR (Sticky) */}
        <div className="no-print builder-sidebar">
          {/* Completion stats card */}
            <div className="card" style={{ padding: "1rem", display: "grid", gap: "0.8rem" }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <span style={{ fontSize: "0.8rem", fontWeight: 700, color: "var(--text-muted)", textTransform: "uppercase" }}>Completion</span>
                <span style={{ fontSize: "1rem", fontWeight: 800, color: "var(--accent)" }}>{completion.percent}%</span>
              </div>
              <div style={{ height: "6px", background: "var(--bg-3)", borderRadius: "3px", overflow: "hidden" }}>
                <div style={{ height: "100%", width: `${completion.percent}%`, background: "var(--accent)", transition: "width 0.3s" }} />
              </div>
              
              {/* Fresher Mode switch */}
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", borderTop: "1px solid var(--border)", paddingTop: "0.8rem", marginTop: "0.3rem" }}>
                <span style={{ fontSize: "0.82rem", fontWeight: 700 }}>Fresher Mode</span>
                <label className="switch" style={{ position: "relative", display: "inline-block", width: "40px", height: "20px" }}>
                  <input
                    type="checkbox"
                    checked={resume.fresherMode || false}
                    onChange={(e) => {
                      const fm = e.target.checked;
                      setResume(r => ({
                        ...r,
                        fresherMode: fm,
                        sectionOrder: fm 
                          ? ["summary", "education", "projects", "certifications", "languages", "fresher", "skills", "work"]
                          : ["summary", "work", "education", "skills", "projects", "certifications", "languages"]
                      }));
                    }}
                    style={{ opacity: 0, width: 0, height: 0 }}
                  />
                  <span style={{
                    position: "absolute",
                    cursor: "pointer",
                    top: 0, left: 0, right: 0, bottom: 0,
                    backgroundColor: resume.fresherMode ? "var(--accent)" : "#555",
                    transition: "0.3s",
                    borderRadius: "20px"
                  }}>
                    <span style={{
                      position: "absolute",
                      content: "",
                      height: "14px", width: "14px",
                      left: resume.fresherMode ? "22px" : "3px",
                      bottom: "3px",
                      backgroundColor: "white",
                      transition: "0.3s",
                      borderRadius: "50%"
                    }} />
                  </span>
                </label>
              </div>
            </div>

            {/* Steps Navigation list */}
            <div className="card" style={{ padding: "0.6rem", display: "flex", flexDirection: "column", gap: "0.25rem" }}>
              <span style={{ paddingLeft: "0.4rem", fontSize: "0.75rem", fontWeight: 700, color: "var(--text-muted)", textTransform: "uppercase", marginBottom: "0.4rem" }}>Builder Steps</span>
              {steps.map((stepItem, idx) => {
                const isComplete = checkStepCompletion(stepItem.key);
                return (
                  <button
                    key={stepItem.key}
                    onClick={() => setActiveStep(stepItem.key)}
                    style={{
                      background: activeStep === stepItem.key ? "var(--accent)" : "transparent",
                      color: activeStep === stepItem.key ? "#fff" : "var(--text)",
                      border: "none",
                      borderRadius: "6px",
                      padding: "0.55rem 0.6rem",
                      fontSize: "0.82rem",
                      fontWeight: activeStep === stepItem.key ? 700 : 500,
                      cursor: "pointer",
                      textAlign: "left",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "space-between",
                      transition: "all 0.2s"
                    }}
                  >
                    <span>{idx + 1}. {stepItem.label}</span>
                    <span style={{ fontSize: "0.8rem" }}>
                      {isComplete ? "🟢" : "⚪"}
                    </span>
                  </button>
                );
              })}
            </div>

            {/* Section Reordering Widget */}
            <div className="card" style={{ padding: "1rem", display: "grid", gap: "1rem" }}>
              <span style={{ fontSize: "0.75rem", fontWeight: 700, color: "var(--text-muted)", textTransform: "uppercase" }}>🔀 Layout Ordering</span>
              <p style={{ fontSize: "0.7rem", color: "var(--text-muted)", margin: 0 }}>Drag or use arrows to structure PDF sections.</p>
              
              <div style={{ display: "grid", gap: "0.4rem" }}>
                {(resume.sectionOrder || []).map((secKey, idx) => {
                  if (secKey === "fresher" && !resume.fresherMode) return null;
                  
                  const labelMap: Record<string, string> = {
                    summary: "Summary",
                    work: "Work Experience",
                    education: "Education",
                    skills: "Technical Skills",
                    projects: "Projects",
                    certifications: "Certifications",
                    languages: "Languages",
                    fresher: "Fresher Activities",
                  };

                  return (
                    <div 
                      key={secKey}
                      draggable
                      onDragStart={(e) => handleDragStart(e, idx)}
                      onDragOver={handleDragOver}
                      onDrop={(e) => handleDrop(e, idx)}
                      style={{
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "space-between",
                        padding: "0.4rem 0.5rem",
                        background: "var(--bg-2)",
                        border: "1px solid var(--border)",
                        borderRadius: "6px",
                        fontSize: "0.78rem",
                        cursor: "grab",
                        userSelect: "none"
                      }}
                    >
                      <span style={{ fontWeight: 600 }}>☰ {labelMap[secKey] || secKey}</span>
                      <div style={{ display: "flex", gap: "0.2rem" }}>
                        <button 
                          onClick={() => {
                            const updated = moveItem(resume.sectionOrder || [], idx, "up");
                            setResume(prev => ({ ...prev, sectionOrder: updated }));
                          }}
                          disabled={idx === 0}
                          style={{ background: "none", border: "none", color: "var(--text-muted)", cursor: "pointer", fontSize: "0.7rem", padding: 0 }}
                        >
                          ▲
                        </button>
                        <button 
                          onClick={() => {
                            const updated = moveItem(resume.sectionOrder || [], idx, "down");
                            setResume(prev => ({ ...prev, sectionOrder: updated }));
                          }}
                          disabled={idx === (resume.sectionOrder?.length || 0) - 1}
                          style={{ background: "none", border: "none", color: "var(--text-muted)", cursor: "pointer", fontSize: "0.7rem", padding: 0 }}
                        >
                          ▼
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>

        {/* COLUMN 2: ACTIVE STEP FORM EDITOR */}
        <ResizablePanels
          leftPanel={(
          <div className="no-print builder-editor-container">
            
            {/* HORIZONTAL STEPPER */}
            <div className="mb-8 no-print">
              <div className="flex items-center justify-between relative px-2">
                <div className="absolute left-0 top-1/2 -translate-y-1/2 w-full h-1 bg-[var(--bg-elevated)] rounded-full -z-10"></div>
                <div 
                  className="absolute left-0 top-1/2 -translate-y-1/2 h-1 bg-[var(--accent)] rounded-full -z-10 transition-all duration-500" 
                  style={{ width: `${(steps.findIndex(s => s.key === activeStep) / (steps.length - 1)) * 100}%` }}
                ></div>
                
                {steps.map((stepItem, idx) => {
                  const isActive = activeStep === stepItem.key;
                  const isPast = steps.findIndex(s => s.key === activeStep) > idx;
                  const isComplete = checkStepCompletion(stepItem.key);
                  return (
                    <button
                      key={stepItem.key}
                      onClick={() => setActiveStep(stepItem.key)}
                      className={`w-8 h-8 flex-shrink-0 rounded-full flex items-center justify-center text-xs font-bold transition-all duration-300 shadow-md ${
                        isActive 
                          ? 'bg-[var(--accent)] text-white scale-125 ring-4 ring-[var(--accent)]/20' 
                          : isPast 
                            ? 'bg-[var(--accent)] text-white' 
                            : 'bg-[var(--bg-elevated)] text-[var(--text-muted)] hover:bg-[var(--bg-3)]'
                      }`}
                      title={stepItem.label}
                    >
                      {isComplete && !isActive ? '✓' : idx + 1}
                    </button>
                  );
                })}
              </div>
              <div className="text-center mt-5 font-bold text-[var(--text-primary)] text-sm tracking-wide uppercase">
                {steps.find(s => s.key === activeStep)?.label}
              </div>
            </div>

            <div key={activeStep} className="pb-24">
            
            {/* STEP 1: Personal info */}
            {activeStep === "personal" && (
              <Card className="grid gap-6 p-8">
                <h2 className="font-['Syne',sans-serif] font-bold text-xl text-[var(--text-primary)]">Personal Information</h2>
                {([
                  ["fullName", "Full Name *", "John Doe"],
                  ["email", "Email Address *", "john@email.com"],
                  ["phone", "Phone Number", "+91 98765 43210"],
                  ["location", "Location (City, State)", "Pune, Maharashtra"],
                  ["linkedin", "LinkedIn URL", "linkedin.com/in/johndoe"],
                  ["website", "Website / Portfolio", "johndoe.com"],
                  ["currentCTC", "Current CTC (e.g. 12 LPA)", "e.g. 10 LPA"],
                  ["expectedCTC", "Expected CTC (e.g. 18 LPA)", "e.g. 15 LPA"]
                ] as [keyof typeof resume.personalInfo, string, string][]).map(([field, label, placeholder]) => (
                  <div key={field}>
                    <Input
                      label={label}
                      placeholder={placeholder}
                      value={resume.personalInfo[field] || ""}
                      onChange={(e) => setResume((r) => ({ ...r, personalInfo: { ...r.personalInfo, [field]: e.target.value } }))}
                    />
                  </div>
                ))}
              </Card>
            )}

            {/* STEP 2: Summary */}
            {activeStep === "summary" && (
              <Card className="grid gap-6 p-8">
                <div className="flex justify-between items-center">
                  <h2 className="font-['Syne',sans-serif] font-bold text-xl text-[var(--text-primary)]">Professional Summary</h2>
                  <Button
                    variant="secondary"
                    size="sm"
                    disabled={!!aiLoading}
                    onClick={() => handleAIEngineCall("summary", `Role: ${resume.workExperience[0]?.role || "Professional"}\nSkills: ${resume.skills.technical.join(", ")}`, (r) => setResume((prev) => ({ ...prev, summary: r })))}
                  >
                    {aiLoading === "summary" ? "Generating..." : "✦ AI Generate"}
                  </Button>
                </div>
                <textarea
                  className="w-full min-h-[120px] rounded-[var(--radius-md)] border border-[var(--border)] bg-[var(--bg-surface)] px-4 py-3 text-[14px] text-[var(--text-primary)] placeholder-[var(--text-muted)] focus:outline-none focus:ring-2 focus:ring-[var(--accent)] focus:border-transparent transition-all shadow-[var(--shadow-xs)]"
                  rows={6}
                  placeholder="Enter Compelling Summary..."
                  value={resume.summary}
                  onChange={(e) => setResume((r) => ({ ...r, summary: e.target.value }))}
                />

                {/* Inline AI Rewrite for Summary */}
                {resume.summary.trim().length > 15 && (
                  <div>
                    <Button
                      variant="secondary"
                      size="sm"
                      disabled={inlineRewriteLoading && inlineRewriteKey === "summary"}
                      onClick={() => handleInlineRewrite(resume.summary, "Professional Summary", "summary")}
                      className="border-sky-500 text-sky-500 hover:bg-sky-50 dark:hover:bg-sky-950"
                    >
                      {inlineRewriteLoading && inlineRewriteKey === "summary" ? (
                        <span className="flex items-center gap-2">
                          <span className="w-3 h-3 border-2 border-sky-500 border-t-transparent rounded-full animate-spin" /> Rewriting...
                        </span>
                      ) : "✨ AI Rewrite"}
                    </Button>

                    {inlineRewriteKey === "summary" && inlineRewriteSuggestions.length > 0 && (
                      <div className="mt-3 grid gap-2">
                        <span className="text-xs font-bold text-[var(--accent)] uppercase tracking-wider">
                          Click a suggestion to accept:
                        </span>
                        {inlineRewriteSuggestions.map((s, idx) => (
                          <div
                            key={idx}
                            onClick={() => {
                              setResume((r) => ({ ...r, summary: s }));
                              setInlineRewriteSuggestions([]);
                              setInlineRewriteKey("");
                            }}
                            className="p-3 bg-sky-50/50 dark:bg-sky-900/10 border border-sky-100 dark:border-sky-900/50 rounded-[var(--radius-md)] cursor-pointer transition-all hover:bg-sky-50 hover:border-sky-400 dark:hover:bg-sky-900/30 text-sm leading-relaxed"
                          >
                            <div className="flex justify-between items-start gap-4">
                              <span className="text-[var(--text-primary)]">{s}</span>
                              <span className="text-xs text-sky-500 font-bold whitespace-nowrap shrink-0">✅ Accept</span>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                )}
              </Card>
            )}


            {/* STEP 3: Work Experience */}
            {activeStep === "work" && (
              <div style={{ display: "grid", gap: "1.5rem" }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                  <h2 style={{ fontFamily: "Syne, sans-serif", fontWeight: 700, fontSize: "1.2rem" }}>Work Experience {resume.fresherMode && "(Optional)"}</h2>
                  <button
                    className="btn-primary"
                    style={{ fontSize: "0.82rem", padding: "0.45rem 1rem" }}
                    onClick={() => setResume((r) => ({ ...r, workExperience: [...r.workExperience, { id: uid(), company: "", role: "", startDate: "", endDate: "", current: false, bullets: [""], industry: "", city: "", teamSize: undefined, employmentType: "Full-time", reportingManager: "", toolsUsed: [], companyScale: "Mid-size", currentCTC: "", expectedCTC: "", salaryBreakup: "", showSalary: false }] }))}
                  >
                    + Add Position
                  </button>
                </div>

                {(() => {
                  const shortTenureCount = resume.workExperience.filter(exp => {
                    const months = calculateTenureMonths(exp.startDate, exp.endDate, exp.current);
                    return months > 0 && months < 18;
                  }).length;
                  if (shortTenureCount >= 3) {
                    return (
                      <div style={{ background: "rgba(255, 101, 132, 0.08)", borderLeft: "4px solid #ff6584", padding: "1rem", borderRadius: "8px", fontSize: "0.82rem", color: "var(--text)", marginBottom: "0.5rem" }}>
                        <strong>⚠️ Job-Hopping Risk Warning:</strong> You have {shortTenureCount} short-tenure positions (under 18 months each). Automated resume screeners and recruiters may flag this pattern. We recommend providing clear, professional exit contexts (e.g. startup shut down, contract completion, UPSC preparation) in the Exit Context Note fields below to mitigate this risk.
                      </div>
                    );
                  }
                  return null;
                })()}

                {resume.workExperience.length === 0 && (
                  <div className="card" style={{ textAlign: "center", padding: "2.5rem", borderStyle: "dashed" }}>
                    <p style={{ color: "var(--text-muted)", marginBottom: "1rem" }}>No experience added yet.</p>
                  </div>
                )}

                {resume.workExperience.map((exp, idx) => {
                  const isCollapsed = collapsedCards[exp.id] || false;
                  return (
                    <div key={exp.id} className="card" style={{ display: "grid", gap: "1.2rem" }}>
                      
                      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", borderBottom: "1px solid var(--border)", paddingBottom: "0.5rem" }}>
                        <span 
                          onClick={() => setCollapsedCards(prev => ({ ...prev, [exp.id]: !isCollapsed }))}
                          style={{ fontWeight: 700, fontSize: "0.9rem", cursor: "pointer" }}
                        >
                          {isCollapsed ? "▶" : "▼"} {exp.role || "Role"} {exp.company ? `@ ${exp.company}` : "Untitled Position"}
                        </span>
                        
                        <div style={{ display: "flex", gap: "0.4rem" }}>
                          <button onClick={() => setResume(r => ({ ...r, workExperience: moveItem(r.workExperience, idx, "up") }))} style={{ background: "none", border: "none", color: "var(--text-muted)", cursor: "pointer" }}>▲</button>
                          <button onClick={() => setResume(r => ({ ...r, workExperience: moveItem(r.workExperience, idx, "down") }))} style={{ background: "none", border: "none", color: "var(--text-muted)", cursor: "pointer" }}>▼</button>
                          <button onClick={() => setResume(r => ({ ...r, workExperience: duplicateItem(r.workExperience, idx) }))} style={{ background: "none", border: "none", color: "var(--accent)", cursor: "pointer", fontSize: "0.8rem" }}>Copy</button>
                          <button onClick={() => setResume(r => ({ ...r, workExperience: r.workExperience.filter(w => w.id !== exp.id) }))} style={{ background: "none", border: "none", color: "#ff6584", cursor: "pointer", fontSize: "0.8rem" }}>Delete</button>
                        </div>
                      </div>

                      {!isCollapsed && (
                        <>
                          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1.2rem" }}>
                            <div>
                              <label style={{ fontSize: "0.8rem", color: "var(--text-muted)", display: "block", marginBottom: "0.3rem" }}>Company Name</label>
                              <input className="input" placeholder="e.g. TCS, Google" value={exp.company} onChange={(e) => setResume(r => ({ ...r, workExperience: r.workExperience.map(w => w.id === exp.id ? { ...w, company: e.target.value } : w) }))} />
                            </div>
                            <div>
                              <label style={{ fontSize: "0.8rem", color: "var(--text-muted)", display: "block", marginBottom: "0.3rem" }}>Role Title</label>
                              <input className="input" placeholder="e.g. Software Engineer" value={exp.role} onChange={(e) => setResume(r => ({ ...r, workExperience: r.workExperience.map(w => w.id === exp.id ? { ...w, role: e.target.value } : w) }))} />
                            </div>
                            <div>
                              <label style={{ fontSize: "0.8rem", color: "var(--text-muted)", display: "block", marginBottom: "0.3rem" }}>Start Date (e.g. Jan 2022)</label>
                              <input className="input" placeholder="Jan 2022" value={exp.startDate} onChange={(e) => setResume(r => ({ ...r, workExperience: r.workExperience.map(w => w.id === exp.id ? { ...w, startDate: e.target.value } : w) }))} />
                            </div>
                            <div>
                              <label style={{ fontSize: "0.8rem", color: "var(--text-muted)", display: "block", marginBottom: "0.3rem" }}>End Date (e.g. Present)</label>
                              <input className="input" placeholder="Present" value={exp.endDate} disabled={exp.current} onChange={(e) => setResume(r => ({ ...r, workExperience: r.workExperience.map(w => w.id === exp.id ? { ...w, endDate: e.target.value } : w) }))} />
                            </div>

                            {(() => {
                              const months = calculateTenureMonths(exp.startDate, exp.endDate, exp.current);
                              if (months > 0 && months < 18) {
                                return (
                                  <div style={{ gridColumn: "span 2", background: "rgba(246, 211, 101, 0.08)", borderLeft: "4px solid #f6d365", padding: "0.8rem", borderRadius: "8px", fontSize: "0.78rem", color: "var(--text-muted)", margin: "0.4rem 0" }}>
                                    ⚠️ Short tenure detected ({months} months). Recruiter platforms may flag this as job-hopping. Use the Exit Context Note below to explain (e.g. startup shut down, completed contract, medical leave, UPSC preparation).
                                  </div>
                                );
                              }
                              return null;
                            })()}

                            <div>
                              <label style={{ fontSize: "0.8rem", color: "var(--text-muted)", display: "block", marginBottom: "0.3rem" }}>Employment Type</label>
                              <select
                                className="input"
                                style={{ background: "var(--bg-2)", color: "var(--text)", border: "1px solid var(--border)", borderRadius: "8px", height: "42px" }}
                                value={exp.employmentType || "Full-time"}
                                onChange={(e) => setResume(r => ({ ...r, workExperience: r.workExperience.map(w => w.id === exp.id ? { ...w, employmentType: e.target.value } : w) }))}
                              >
                                <option value="Full-time">Full-time</option>
                                <option value="Part-time">Part-time</option>
                                <option value="Internship">Internship</option>
                                <option value="Contract">Contract</option>
                              </select>
                            </div>
                            
                            <div>
                              <label style={{ fontSize: "0.8rem", color: "var(--text-muted)", display: "block", marginBottom: "0.3rem" }}>Company Scale</label>
                              <select
                                className="input"
                                style={{ background: "var(--bg-2)", color: "var(--text)", border: "1px solid var(--border)", borderRadius: "8px", height: "42px" }}
                                value={exp.companyScale || "Mid-size"}
                                onChange={(e) => setResume(r => ({ ...r, workExperience: r.workExperience.map(w => w.id === exp.id ? { ...w, companyScale: e.target.value } : w) }))}
                              >
                                <option value="Startup">Startup</option>
                                <option value="Mid-size">Mid-size</option>
                                <option value="Enterprise">Enterprise</option>
                              </select>
                            </div>

                            <div>
                              <label style={{ fontSize: "0.8rem", color: "var(--text-muted)", display: "block", marginBottom: "0.3rem" }}>Industry</label>
                              <input className="input" placeholder="e.g. IT, FinTech, Banking" value={exp.industry || ""} onChange={(e) => setResume(r => ({ ...r, workExperience: r.workExperience.map(w => w.id === exp.id ? { ...w, industry: e.target.value } : w) }))} />
                            </div>

                            <div>
                              <label style={{ fontSize: "0.8rem", color: "var(--text-muted)", display: "block", marginBottom: "0.3rem" }}>City</label>
                              <input className="input" placeholder="e.g. Pune, Bangalore" value={exp.city || ""} onChange={(e) => setResume(r => ({ ...r, workExperience: r.workExperience.map(w => w.id === exp.id ? { ...w, city: e.target.value } : w) }))} />
                            </div>

                            <div>
                              <label style={{ fontSize: "0.8rem", color: "var(--text-muted)", display: "block", marginBottom: "0.3rem" }}>Team Size supervised</label>
                              <input type="number" className="input" placeholder="e.g. 5" value={exp.teamSize || ""} onChange={(e) => setResume(r => ({ ...r, workExperience: r.workExperience.map(w => w.id === exp.id ? { ...w, teamSize: parseInt(e.target.value) || undefined } : w) }))} />
                            </div>

                            <div>
                              <label style={{ fontSize: "0.8rem", color: "var(--text-muted)", display: "block", marginBottom: "0.3rem" }}>Reporting Manager (Role)</label>
                              <input className="input" placeholder="e.g. Engineering Manager" value={exp.reportingManager || ""} onChange={(e) => setResume(r => ({ ...r, workExperience: r.workExperience.map(w => w.id === exp.id ? { ...w, reportingManager: e.target.value } : w) }))} />
                            </div>

                            <div style={{ gridColumn: "span 2" }}>
                              <label style={{ fontSize: "0.8rem", color: "var(--text-muted)", display: "block", marginBottom: "0.3rem" }}>Tools Used (Comma-separated)</label>
                              <input className="input" placeholder="e.g. Jira, Git, React" value={exp.toolsUsed?.join(", ") || ""} onChange={(e) => setResume(r => ({ ...r, workExperience: r.workExperience.map(w => w.id === exp.id ? { ...w, toolsUsed: e.target.value.split(",").map(t => t.trim()).filter(Boolean) } : w) }))} />
                            </div>

                            <div style={{ gridColumn: "span 2" }}>
                              <label style={{ fontSize: "0.8rem", color: "var(--text-muted)", display: "block", marginBottom: "0.3rem" }}>Exit Context Note / Reason for Short Tenure</label>
                              <input className="input" placeholder="e.g. Project-based contract, startup shut down, health reasons, UPSC / competitive exam preparation" value={exp.contextNote || ""} onChange={(e) => setResume(r => ({ ...r, workExperience: r.workExperience.map(w => w.id === exp.id ? { ...w, contextNote: e.target.value } : w) }))} />
                            </div>

                            <div style={{ gridColumn: "span 2", marginTop: "0.5rem" }}>
                              <label style={{ display: "flex", alignItems: "center", gap: "0.4rem", fontSize: "0.85rem", cursor: "pointer", fontWeight: 600 }}>
                                <input
                                  type="checkbox"
                                  checked={exp.showSalary || false}
                                  onChange={(e) => setResume(r => ({ ...r, workExperience: r.workExperience.map(w => w.id === exp.id ? { ...w, showSalary: e.target.checked } : w) }))}
                                  style={{ accentColor: "var(--accent)" }}
                                />
                                Expose Indian CTC Salary details
                              </label>
                            </div>

                            {exp.showSalary && (
                              <>
                                <div>
                                  <label style={{ fontSize: "0.8rem", color: "var(--text-muted)", display: "block", marginBottom: "0.3rem" }}>Current CTC (e.g. ₹ 8.5 LPA)</label>
                                  <input className="input" placeholder="e.g. ₹ 8.5 LPA" value={exp.currentCTC || ""} onChange={(e) => setResume(r => ({ ...r, workExperience: r.workExperience.map(w => w.id === exp.id ? { ...w, currentCTC: e.target.value } : w) }))} />
                                </div>
                                <div>
                                  <label style={{ fontSize: "0.8rem", color: "var(--text-muted)", display: "block", marginBottom: "0.3rem" }}>Expected CTC (e.g. ₹ 12.0 LPA)</label>
                                  <input className="input" placeholder="e.g. ₹ 12.0 LPA" value={exp.expectedCTC || ""} onChange={(e) => setResume(r => ({ ...r, workExperience: r.workExperience.map(w => w.id === exp.id ? { ...w, expectedCTC: e.target.value } : w) }))} />
                                </div>
                                <div style={{ gridColumn: "span 2" }}>
                                  <label style={{ fontSize: "0.8rem", color: "var(--text-muted)", display: "block", marginBottom: "0.3rem" }}>Salary Breakup details</label>
                                  <input className="input" placeholder="e.g. ₹ 8.0 LPA Fixed + ₹ 0.5 LPA Variable" value={exp.salaryBreakup || ""} onChange={(e) => setResume(r => ({ ...r, workExperience: r.workExperience.map(w => w.id === exp.id ? { ...w, salaryBreakup: e.target.value } : w) }))} />
                                </div>
                              </>
                            )}
                          </div>

                          <div style={{ marginTop: "0.5rem" }}>
                            <label style={{ fontSize: "0.8rem", color: "var(--text-muted)", display: "block", marginBottom: "0.30rem" }}>Accomplishments (Action verbs & quantified metrics)</label>
                            {exp.bullets.map((bullet, bi) => {
                              const hasMetric = /\b(\d+|percent|%|lakhs?|crores?|lpa)\b/i.test(bullet) || bullet.includes("₹");
                              return (
                                <div key={bi} style={{ display: "flex", flexDirection: "column", gap: "0.2rem", marginBottom: "0.6rem" }}>
                                  <div style={{ display: "flex", gap: "0.8rem" }}>
                                    <input
                                      className="input"
                                      placeholder="Describe result achieved..."
                                      value={bullet}
                                      onChange={(e) => setResume(r => ({ ...r, workExperience: r.workExperience.map(w => w.id === exp.id ? { ...w, bullets: w.bullets.map((b, bIdx) => bIdx === bi ? e.target.value : b) } : w) }))}
                                    />
                                    <button
                                      className="btn-secondary"
                                      style={{ padding: "0.4rem 0.6rem", fontSize: "0.75rem", borderColor: "var(--accent)", color: "var(--accent)" }}
                                      disabled={!!aiLoading}
                                      onClick={() => handleAIEngineCall("bullet", bullet || `${exp.role} at ${exp.company}`, (r) => {
                                        setResume(prev => ({ ...prev, workExperience: prev.workExperience.map(w => w.id === exp.id ? { ...w, bullets: w.bullets.map((b, bIdx) => bIdx === bi ? r : b) } : w) }));
                                      })}
                                    >
                                      ✦ Improve
                                    </button>
                                    <button
                                      className="btn-secondary"
                                      type="button"
                                      style={{ padding: "0.4rem 0.6rem", fontSize: "0.75rem", borderColor: "var(--accent-3)", color: "var(--accent-3)" }}
                                      disabled={!!aiLoading}
                                      onClick={async () => {
                                        if (!bullet.trim()) return;
                                        setAiLoading("translate");
                                        try {
                                          const res = await fetch("/api/translate-achievement", {
                                            method: "POST",
                                            headers: { "Content-Type": "application/json" },
                                            body: JSON.stringify({ bullet }),
                                          });
                                          const data = await res.json();
                                          if (data.result) {
                                            setResume(prev => ({
                                              ...prev,
                                              workExperience: prev.workExperience.map(w => w.id === exp.id ? { ...w, bullets: w.bullets.map((b, bIdx) => bIdx === bi ? data.result : b) } : w)
                                            }));
                                          }
                                        } catch (err) {
                                          console.error(err);
                                        } finally {
                                          setAiLoading("");
                                        }
                                      }}
                                    >
                                      ₹ Translate
                                    </button>
                                    <button onClick={() => setResume(r => ({ ...r, workExperience: r.workExperience.map(w => w.id === exp.id ? { ...w, bullets: w.bullets.filter((_, bIdx) => bIdx !== bi) } : w) }))} style={{ background: "none", border: "none", color: "var(--text-muted)", cursor: "pointer", fontSize: "1.1rem" }}>×</button>
                                  </div>
                                  {/* Inline AI Rewrite for this bullet */}
                                  {bullet.trim().length > 10 && (
                                    <div style={{ paddingLeft: "4px", marginTop: "0.2rem" }}>
                                      <button
                                        className="btn-secondary"
                                        disabled={inlineRewriteLoading && inlineRewriteKey === `work-${idx}-${bi}`}
                                        onClick={() => handleInlineRewrite(bullet, `Work Experience at ${exp.company} — ${exp.role}`, `work-${idx}-${bi}`)}
                                        style={{ fontSize: "0.7rem", padding: "0.2rem 0.5rem", borderColor: "#0ea5e9", color: "#0ea5e9" }}
                                      >
                                        {inlineRewriteLoading && inlineRewriteKey === `work-${idx}-${bi}` ? "Rewriting..." : "✨ AI Rewrite"}
                                      </button>

                                      {inlineRewriteKey === `work-${idx}-${bi}` && inlineRewriteSuggestions.length > 0 && (
                                        <div style={{ marginTop: "0.4rem", display: "grid", gap: "0.3rem" }}>
                                          {inlineRewriteSuggestions.map((s, sIdx) => (
                                            <div
                                              key={sIdx}
                                              onClick={() => {
                                                setResume(prev => ({ ...prev, workExperience: prev.workExperience.map(w => w.id === exp.id ? { ...w, bullets: w.bullets.map((b, bIdx) => bIdx === bi ? s : b) } : w) }));
                                                setInlineRewriteSuggestions([]);
                                                setInlineRewriteKey("");
                                              }}
                                              style={{
                                                fontSize: "0.78rem", lineHeight: 1.4, padding: "0.5rem 0.6rem",
                                                background: "rgba(14, 165, 233, 0.04)", border: "1px solid rgba(14, 165, 233, 0.15)",
                                                borderRadius: "6px", cursor: "pointer", transition: "all 0.2s",
                                                display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: "0.4rem",
                                              }}
                                              onMouseEnter={(e) => { (e.currentTarget as HTMLDivElement).style.borderColor = "#0ea5e9"; }}
                                              onMouseLeave={(e) => { (e.currentTarget as HTMLDivElement).style.borderColor = "rgba(14, 165, 233, 0.15)"; }}
                                            >
                                              <span>{s}</span>
                                              <span style={{ fontSize: "0.68rem", color: "#0ea5e9", fontWeight: 700, whiteSpace: "nowrap", flexShrink: 0 }}>✅ Accept</span>
                                            </div>
                                          ))}
                                        </div>
                                      )}
                                    </div>
                                  )}
                                  {!hasMetric && bullet.trim().length > 0 && (
                                    <span style={{ fontSize: "0.72rem", color: "#f6d365", paddingLeft: "4px" }}>
                                      💡 tip: Add numerical results (e.g. ₹ 5 Lakhs saved, 30% speedup) to satisfy ATS metrics audit.
                                    </span>
                                  )}
                                </div>
                              );
                            })}
                            <button className="btn-secondary" style={{ fontSize: "0.78rem", padding: "0.3rem 0.7rem" }} onClick={() => setResume(r => ({ ...r, workExperience: r.workExperience.map(w => w.id === exp.id ? { ...w, bullets: [...w.bullets, ""] } : w) }))}>+ Add Bullet</button>
                          </div>
                        </>
                      )}
                    </div>
                  );
                })}
              </div>
            )}

            {/* STEP 4: Education */}
            {activeStep === "education" && (
              <div style={{ display: "grid", gap: "1.5rem" }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                  <h2 style={{ fontFamily: "Syne, sans-serif", fontWeight: 700, fontSize: "1.2rem" }}>Education</h2>
                  <button 
                    className="btn-primary" 
                    style={{ fontSize: "0.82rem", padding: "0.45rem 1rem" }} 
                    onClick={() => setResume(r => ({ 
                      ...r, 
                      education: [...r.education, { id: uid(), institution: "", degree: "", field: "", startDate: "", endDate: "", gpa: "", level: "", boardOrUniversity: "", gpaType: "cgpa", distinction: false, topper: false, scholarship: "", academicAchievements: "" }] 
                    }))}
                  >
                    + Add Education
                  </button>
                </div>

                {resume.education.map((edu, idx) => {
                  const isCollapsed = collapsedCards[edu.id] || false;
                  return (
                    <div key={edu.id} className="card" style={{ display: "grid", gap: "1.2rem" }}>
                      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", borderBottom: "1px solid var(--border)", paddingBottom: "0.5rem" }}>
                        <span 
                          onClick={() => setCollapsedCards(prev => ({ ...prev, [edu.id]: !isCollapsed }))}
                          style={{ fontWeight: 700, fontSize: "0.9rem", cursor: "pointer" }}
                        >
                          {isCollapsed ? "▶" : "▼"} {edu.level ? `[${edu.level}] ` : ""}{edu.degree || "Degree"} {edu.institution ? `@ ${edu.institution}` : ""}
                        </span>
                        <div style={{ display: "flex", gap: "0.4rem" }}>
                          <button onClick={() => setResume(r => ({ ...r, education: moveItem(r.education, idx, "up") }))} style={{ background: "none", border: "none", color: "var(--text-muted)", cursor: "pointer" }}>▲</button>
                          <button onClick={() => setResume(r => ({ ...r, education: moveItem(r.education, idx, "down") }))} style={{ background: "none", border: "none", color: "var(--text-muted)", cursor: "pointer" }}>▼</button>
                          <button onClick={() => setResume(r => ({ ...r, education: r.education.filter(e => e.id !== edu.id) }))} style={{ background: "none", border: "none", color: "#ff6584", cursor: "pointer", fontSize: "0.8rem" }}>Delete</button>
                        </div>
                      </div>

                      {!isCollapsed && (
                        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1.2rem" }}>
                          <div>
                            <label style={{ fontSize: "0.8rem", color: "var(--text-muted)", display: "block", marginBottom: "0.3rem" }}>Education Level</label>
                            <select
                              className="input"
                              style={{ background: "var(--bg-2)", color: "var(--text)", border: "1px solid var(--border)", borderRadius: "8px", height: "42px" }}
                              value={edu.level || ""}
                              onChange={(e) => setResume(r => ({ ...r, education: r.education.map(ed => ed.id === edu.id ? { ...ed, level: e.target.value as any } : ed) }))}
                            >
                              <option value="">Select Level</option>
                              <option value="10th">10th (Secondary)</option>
                              <option value="12th">12th (Senior Secondary)</option>
                              <option value="UG">UG (Undergraduate)</option>
                              <option value="PG">PG (Postgraduate)</option>
                              <option value="Diploma">Diploma</option>
                              <option value="Certification">Certification</option>
                            </select>
                          </div>
                          
                          <div>
                            <label style={{ fontSize: "0.8rem", color: "var(--text-muted)", display: "block", marginBottom: "0.3rem" }}>Board or University</label>
                            <input 
                              className="input" 
                              placeholder="e.g. CBSE, ICSE, IIT, NIT, Pune University" 
                              value={edu.boardOrUniversity || ""} 
                              onChange={(e) => setResume(r => ({ ...r, education: r.education.map(ed => ed.id === edu.id ? { ...ed, boardOrUniversity: e.target.value } : ed) }))} 
                            />
                          </div>

                          <div>
                            <label style={{ fontSize: "0.8rem", color: "var(--text-muted)", display: "block", marginBottom: "0.3rem" }}>Institution Name</label>
                            <input className="input" placeholder="e.g. VIT Bhopal University" value={edu.institution} onChange={(e) => setResume(r => ({ ...r, education: r.education.map(ed => ed.id === edu.id ? { ...ed, institution: e.target.value } : ed) }))} />
                          </div>

                          <div>
                            <label style={{ fontSize: "0.8rem", color: "var(--text-muted)", display: "block", marginBottom: "0.3rem" }}>Degree / Certificate</label>
                            <input className="input" placeholder="B.Tech Computer Science" value={edu.degree} onChange={(e) => setResume(r => ({ ...r, education: r.education.map(ed => ed.id === edu.id ? { ...ed, degree: e.target.value } : ed) }))} />
                          </div>

                          <div>
                            <label style={{ fontSize: "0.8rem", color: "var(--text-muted)", display: "block", marginBottom: "0.3rem" }}>Field of Study</label>
                            <input className="input" placeholder="e.g. Cyber Security, Business" value={edu.field} onChange={(e) => setResume(r => ({ ...r, education: r.education.map(ed => ed.id === edu.id ? { ...ed, field: e.target.value } : ed) }))} />
                          </div>

                          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "0.8rem" }}>
                            <div>
                              <label style={{ fontSize: "0.8rem", color: "var(--text-muted)", display: "block", marginBottom: "0.3rem" }}>Score Type</label>
                              <select
                                className="input"
                                style={{ background: "var(--bg-2)", color: "var(--text)", border: "1px solid var(--border)", borderRadius: "8px", height: "42px" }}
                                value={edu.gpaType || "cgpa"}
                                onChange={(e) => setResume(r => ({ ...r, education: r.education.map(ed => ed.id === edu.id ? { ...ed, gpaType: e.target.value as any } : ed) }))}
                              >
                                <option value="cgpa">CGPA (out of 10)</option>
                                <option value="percentage">Percentage (%)</option>
                              </select>
                            </div>
                            <div>
                              <label style={{ fontSize: "0.8rem", color: "var(--text-muted)", display: "block", marginBottom: "0.3rem" }}>Score</label>
                              <input className="input" placeholder={edu.gpaType === "percentage" ? "e.g. 91.5%" : "e.g. 9.2/10"} value={edu.gpa} onChange={(e) => setResume(r => ({ ...r, education: r.education.map(ed => ed.id === edu.id ? { ...ed, gpa: e.target.value } : ed) }))} />
                            </div>
                          </div>

                          <div>
                            <label style={{ fontSize: "0.8rem", color: "var(--text-muted)", display: "block", marginBottom: "0.3rem" }}>Start Year</label>
                            <input className="input" placeholder="2020" value={edu.startDate} onChange={(e) => setResume(r => ({ ...r, education: r.education.map(ed => ed.id === edu.id ? { ...ed, startDate: e.target.value } : ed) }))} />
                          </div>

                          <div>
                            <label style={{ fontSize: "0.8rem", color: "var(--text-muted)", display: "block", marginBottom: "0.3rem" }}>End Year</label>
                            <input className="input" placeholder="2024" value={edu.endDate} onChange={(e) => setResume(r => ({ ...r, education: r.education.map(ed => ed.id === edu.id ? { ...ed, endDate: e.target.value } : ed) }))} />
                          </div>

                          <div>
                            <label style={{ fontSize: "0.8rem", color: "var(--text-muted)", display: "block", marginBottom: "0.3rem" }}>Scholarship (Optional)</label>
                            <input className="input" placeholder="e.g. NTSE Scholar" value={edu.scholarship || ""} onChange={(e) => setResume(r => ({ ...r, education: r.education.map(ed => ed.id === edu.id ? { ...ed, scholarship: e.target.value } : ed) }))} />
                          </div>

                          <div style={{ display: "flex", gap: "1.5rem", alignItems: "center", height: "42px", marginTop: "1.5rem" }}>
                            <label style={{ display: "flex", alignItems: "center", gap: "0.4rem", fontSize: "0.82rem", cursor: "pointer" }}>
                              <input 
                                type="checkbox" 
                                checked={edu.distinction || false} 
                                onChange={(e) => setResume(r => ({ ...r, education: r.education.map(ed => ed.id === edu.id ? { ...ed, distinction: e.target.checked } : ed) }))} 
                                style={{ accentColor: "var(--accent)" }}
                              />
                              Graduated with Distinction
                            </label>
                            <label style={{ display: "flex", alignItems: "center", gap: "0.4rem", fontSize: "0.82rem", cursor: "pointer" }}>
                              <input 
                                type="checkbox" 
                                checked={edu.topper || false} 
                                onChange={(e) => setResume(r => ({ ...r, education: r.education.map(ed => ed.id === edu.id ? { ...ed, topper: e.target.checked } : ed) }))} 
                                style={{ accentColor: "var(--accent)" }}
                              />
                              Class Topper
                            </label>
                          </div>

                          <div style={{ gridColumn: "span 2" }}>
                            <label style={{ fontSize: "0.8rem", color: "var(--text-muted)", display: "block", marginBottom: "0.3rem" }}>Academic Achievements & Honors</label>
                            <textarea 
                              className="input" 
                              rows={2} 
                              placeholder="e.g. Department Rank 2, Gold medalist in Chemistry..." 
                              value={edu.academicAchievements || ""} 
                              onChange={(e) => setResume(r => ({ ...r, education: r.education.map(ed => ed.id === edu.id ? { ...ed, academicAchievements: e.target.value } : ed) }))} 
                            />
                          </div>

                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            )}

            {/* STEP 5: Skills */}
            {activeStep === "skills" && (
              <div style={{ display: "grid", gap: "1.5rem" }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                  <h2 style={{ fontFamily: "Syne, sans-serif", fontWeight: 700, fontSize: "1.2rem" }}>Skills</h2>
                  <button className="btn-secondary" style={{ fontSize: "0.8rem", padding: "0.4rem 0.9rem" }} disabled={!!aiLoading} onClick={() => {
                    const role = resume.workExperience[0]?.role || "software engineer";
                    handleAIEngineCall("skills", role, (r) => {
                      const techMatch = r.match(/Technical:(.*?)(\||$)/i);
                      const softMatch = r.match(/Soft:(.*?)(\||$)/i);
                      const tech = techMatch ? techMatch[1].split(",").map((s) => s.trim()).filter(Boolean) : [];
                      const soft = softMatch ? softMatch[1].split(",").map((s) => s.trim()).filter(Boolean) : [];
                      setResume((prev) => ({ ...prev, skills: { technical: [...prev.skills.technical, ...tech], soft: [...prev.skills.soft, ...soft] } }));
                    });
                  }}>
                    {aiLoading === "skills" ? "Generating..." : "✦ AI Suggest Skills"}
                  </button>
                </div>

                <div className="card" style={{ display: "grid", gap: "1.2rem" }}>
                  <div>
                    <label style={{ fontSize: "0.82rem", color: "var(--text-muted)", display: "block", marginBottom: "0.5rem" }}>Technical Skills ({resume.skills.technical.length} added)</label>
                    <div style={{ display: "flex", flexWrap: "wrap", gap: "0.4rem", marginBottom: "0.5rem" }}>
                      {resume.skills.technical.map((skill) => (
                        <span key={skill} className="tag tag-purple" style={{ cursor: "pointer" }} onClick={() => setResume((r) => ({ ...r, skills: { ...r.skills, technical: r.skills.technical.filter((s) => s !== skill) } }))}>
                          {skill} ×
                        </span>
                      ))}
                    </div>
                    <div style={{ display: "flex", gap: "0.8rem" }}>
                      <input className="input" placeholder="React, SQL, Python..." value={skillInput.tech} onChange={(e) => setSkillInput((s) => ({ ...s, tech: e.target.value }))}
                        onKeyDown={(e) => { if (e.key === "Enter" && skillInput.tech.trim()) { setResume((r) => ({ ...r, skills: { ...r.skills, technical: [...r.skills.technical, skillInput.tech.trim()] } })); setSkillInput((s) => ({ ...s, tech: "" })); } }} />
                      <button className="btn-secondary" style={{ whiteSpace: "nowrap", fontSize: "0.82rem" }} onClick={() => { if (skillInput.tech.trim()) { setResume((r) => ({ ...r, skills: { ...r.skills, technical: [...r.skills.technical, skillInput.tech.trim()] } })); setSkillInput((s) => ({ ...s, tech: "" })); } }}>Add</button>
                    </div>
                  </div>

                  <div>
                    <label style={{ fontSize: "0.82rem", color: "var(--text-muted)", display: "block", marginBottom: "0.5rem" }}>Soft Skills ({resume.skills.soft.length} added)</label>
                    <div style={{ display: "flex", flexWrap: "wrap", gap: "0.4rem", marginBottom: "0.5rem" }}>
                      {resume.skills.soft.map((skill) => (
                        <span key={skill} className="tag tag-green" style={{ cursor: "pointer" }} onClick={() => setResume((r) => ({ ...r, skills: { ...r.skills, soft: r.skills.soft.filter((s) => s !== skill) } }))}>
                          {skill} ×
                        </span>
                      ))}
                    </div>
                    <div style={{ display: "flex", gap: "0.8rem" }}>
                      <input className="input" placeholder="Leadership, Negotiation..." value={skillInput.soft} onChange={(e) => setSkillInput((s) => ({ ...s, soft: e.target.value }))}
                        onKeyDown={(e) => { if (e.key === "Enter" && skillInput.soft.trim()) { setResume((r) => ({ ...r, skills: { ...r.skills, soft: [...r.skills.soft, skillInput.soft.trim()] } })); setSkillInput((s) => ({ ...s, soft: "" })); } }} />
                      <button className="btn-secondary" style={{ whiteSpace: "nowrap", fontSize: "0.82rem" }} onClick={() => { if (skillInput.soft.trim()) { setResume((r) => ({ ...r, skills: { ...r.skills, soft: [...r.skills.soft, skillInput.soft.trim()] } })); setSkillInput((s) => ({ ...s, soft: "" })); } }}>Add</button>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* STEP 6: Projects */}
            {activeStep === "projects" && (
              <div style={{ display: "grid", gap: "1.5rem" }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                  <h2 style={{ fontFamily: "Syne, sans-serif", fontWeight: 700, fontSize: "1.2rem" }}>Projects</h2>
                  <button className="btn-primary" style={{ fontSize: "0.82rem", padding: "0.45rem 1rem" }} onClick={() => setResume((r) => ({ ...r, projects: [...r.projects, { id: uid(), name: "", description: "", techStack: [], link: "" }] }))}>+ Add Project</button>
                </div>
                {resume.projects.map((proj, idx) => (
                  <div key={proj.id} className="card" style={{ display: "grid", gap: "1.2rem" }}>
                    <div style={{ display: "flex", justifyContent: "space-between" }}>
                      <span style={{ fontWeight: 600, fontSize: "0.9rem" }}>Project {idx + 1}</span>
                      <div style={{ display: "flex", gap: "0.4rem" }}>
                        <button onClick={() => setResume(r => ({ ...r, projects: moveItem(r.projects, idx, "up") }))} style={{ background: "none", border: "none", color: "var(--text-muted)", cursor: "pointer" }}>▲</button>
                        <button onClick={() => setResume(r => ({ ...r, projects: moveItem(r.projects, idx, "down") }))} style={{ background: "none", border: "none", color: "var(--text-muted)", cursor: "pointer" }}>▼</button>
                        <button onClick={() => setResume((r) => ({ ...r, projects: r.projects.filter((p) => p.id !== proj.id) }))} style={{ background: "none", border: "none", color: "#ff6584", cursor: "pointer", fontSize: "0.85rem" }}>Remove</button>
                      </div>
                    </div>
                    <input className="input" placeholder="Project Name" value={proj.name} onChange={(e) => setResume((r) => ({ ...r, projects: r.projects.map((p) => p.id === proj.id ? { ...p, name: e.target.value } : p) }))} />
                    <textarea className="input" rows={3} placeholder="Brief description of what it does and your role..." value={proj.description} onChange={(e) => setResume((r) => ({ ...r, projects: r.projects.map((p) => p.id === proj.id ? { ...p, description: e.target.value } : p) }))} />
                    <input className="input" placeholder="GitHub / Live Link" value={proj.link} onChange={(e) => setResume((r) => ({ ...r, projects: r.projects.map((p) => p.id === proj.id ? { ...p, link: e.target.value } : p) }))} />
                    <input className="input" placeholder="Tech stack (comma separated)" value={proj.techStack.join(", ")} onChange={(e) => setResume((r) => ({ ...r, projects: r.projects.map((p) => p.id === proj.id ? { ...p, techStack: e.target.value.split(",").map((s) => s.trim()) } : p) }))} />
                  </div>
                ))}
              </div>
            )}

            {/* STEP 7: Certifications */}
            {activeStep === "certifications" && (
              <div style={{ display: "grid", gap: "1.5rem" }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                  <h2 style={{ fontFamily: "Syne, sans-serif", fontWeight: 700, fontSize: "1.2rem" }}>Certifications</h2>
                  <button className="btn-primary" style={{ fontSize: "0.82rem", padding: "0.45rem 1rem" }} onClick={() => setResume((r) => ({ ...r, certifications: [...r.certifications, { id: uid(), name: "", issuer: "", date: "" }] }))}>+ Add Certification</button>
                </div>
                {resume.certifications.map((cert, idx) => (
                  <div key={cert.id} className="card" style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr auto", gap: "1.2rem", alignItems: "end" }}>
                    <div>
                      <label style={{ fontSize: "0.8rem", color: "var(--text-muted)", display: "block", marginBottom: "0.3rem" }}>Certification Name</label>
                      <input className="input" placeholder="AWS Solutions Architect" value={cert.name} onChange={(e) => setResume((r) => ({ ...r, certifications: r.certifications.map((c) => c.id === cert.id ? { ...c, name: e.target.value } : c) }))} />
                    </div>
                    <div>
                      <label style={{ fontSize: "0.8rem", color: "var(--text-muted)", display: "block", marginBottom: "0.3rem" }}>Issuer</label>
                      <input className="input" placeholder="Amazon Web Services" value={cert.issuer} onChange={(e) => setResume((r) => ({ ...r, certifications: r.certifications.map((c) => c.id === cert.id ? { ...c, issuer: e.target.value } : c) }))} />
                    </div>
                    <div>
                      <label style={{ fontSize: "0.8rem", color: "var(--text-muted)", display: "block", marginBottom: "0.3rem" }}>Date</label>
                      <input className="input" placeholder="2024" value={cert.date} onChange={(e) => setResume((r) => ({ ...r, certifications: r.certifications.map((c) => c.id === cert.id ? { ...c, date: e.target.value } : c) }))} />
                    </div>
                    <button onClick={() => setResume((r) => ({ ...r, certifications: r.certifications.filter((c) => c.id !== cert.id) }))} style={{ background: "none", border: "none", color: "#ff6584", cursor: "pointer", fontSize: "1.2rem", paddingBottom: "0.6rem" }}>×</button>
                  </div>
                ))}
              </div>
            )}

            {/* STEP 8: Languages Known */}
            {activeStep === "languages" && (
              <div style={{ display: "grid", gap: "1.5rem" }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                  <h2 style={{ fontFamily: "Syne, sans-serif", fontWeight: 700, fontSize: "1.2rem" }}>Languages Known</h2>
                  <button
                    className="btn-primary"
                    style={{ fontSize: "0.82rem", padding: "0.45rem 1rem" }}
                    onClick={() => setResume(r => ({
                      ...r,
                      languagesKnown: [...(r.languagesKnown || []), { id: uid(), language: "", proficiency: "Beginner", certification: "", usageContext: "" }]
                    }))}
                  >
                    + Add Language
                  </button>
                </div>

                {(!resume.languagesKnown || resume.languagesKnown.length === 0) && (
                  <div className="card" style={{ textAlign: "center", padding: "2.5rem", borderStyle: "dashed" }}>
                    <p style={{ color: "var(--text-muted)", marginBottom: "1rem" }}>No languages added yet.</p>
                  </div>
                )}

                {(resume.languagesKnown || []).map((lang, idx) => (
                  <div key={lang.id} className="card" style={{ display: "grid", gap: "1.2rem" }}>
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", borderBottom: "1px solid var(--border)", paddingBottom: "0.5rem" }}>
                      <span style={{ fontWeight: 700, fontSize: "0.9rem" }}>
                        🗣️ {lang.language || "Language"} ({lang.proficiency || "Proficiency"})
                      </span>
                      <button
                        onClick={() => setResume(r => ({
                          ...r,
                          languagesKnown: (r.languagesKnown || []).filter(l => l.id !== lang.id)
                        }))}
                        style={{ background: "none", border: "none", color: "#ff6584", cursor: "pointer", fontSize: "0.8rem" }}
                      >
                        Delete
                      </button>
                    </div>

                    <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1.2rem" }}>
                      <div>
                        <label style={{ fontSize: "0.8rem", color: "var(--text-muted)", display: "block", marginBottom: "0.3rem" }}>Language</label>
                        <input
                          className="input"
                          placeholder="Hindi, Marathi, Tamil, etc."
                          value={lang.language}
                          onChange={(e) => setResume(r => ({
                            ...r,
                            languagesKnown: (r.languagesKnown || []).map(l => l.id === lang.id ? { ...l, language: e.target.value } : l)
                          }))}
                        />
                      </div>
                      <div>
                        <label style={{ fontSize: "0.8rem", color: "var(--text-muted)", display: "block", marginBottom: "0.3rem" }}>Proficiency</label>
                        <select
                          className="input"
                          style={{ background: "var(--bg-2)", color: "var(--text)", border: "1px solid var(--border)", borderRadius: "8px", height: "42px" }}
                          value={lang.proficiency}
                          onChange={(e) => setResume(r => ({
                            ...r,
                            languagesKnown: (r.languagesKnown || []).map(l => l.id === lang.id ? { ...l, proficiency: e.target.value as any } : l)
                          }))}
                        >
                          <option value="Beginner">Beginner</option>
                          <option value="Intermediate">Intermediate</option>
                          <option value="Fluent">Fluent</option>
                          <option value="Native">Native</option>
                        </select>
                      </div>
                      <div>
                        <label style={{ fontSize: "0.8rem", color: "var(--text-muted)", display: "block", marginBottom: "0.3rem" }}>Certification (Optional)</label>
                        <input
                          className="input"
                          placeholder="IELTS Band 8.5, JLPT N2"
                          value={lang.certification || ""}
                          onChange={(e) => setResume(r => ({
                            ...r,
                            languagesKnown: (r.languagesKnown || []).map(l => l.id === lang.id ? { ...l, certification: e.target.value } : l)
                          }))}
                        />
                      </div>
                      <div>
                        <label style={{ fontSize: "0.8rem", color: "var(--text-muted)", display: "block", marginBottom: "0.3rem" }}>Context (Optional)</label>
                        <input
                          className="input"
                          placeholder="Professional Work, Conversation"
                          value={lang.usageContext || ""}
                          onChange={(e) => setResume(r => ({
                            ...r,
                            languagesKnown: (r.languagesKnown || []).map(l => l.id === lang.id ? { ...l, usageContext: e.target.value } : l)
                          }))}
                        />
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* STEP 9: Fresher Activities */}
            {activeStep === "fresher" && (
              <div style={{ display: "grid", gap: "1.2rem" }}>
                <h2 style={{ fontFamily: "Syne, sans-serif", fontWeight: 700, fontSize: "1.2rem" }}>Fresher Mode Achievements & Activities</h2>

                {/* Competitive Exams */}
                <div className="card" style={{ display: "grid", gap: "1.5rem" }}>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                    <h3 style={{ fontWeight: 700, fontSize: "1rem" }}>📝 Competitive Exams (JEE, GATE, CAT, UPSC)</h3>
                    <button
                      className="btn-secondary"
                      style={{ fontSize: "0.78rem", padding: "0.3rem 0.7rem" }}
                      onClick={() => setResume(r => ({
                        ...r,
                        competitiveExams: [...(r.competitiveExams || []), { exam: "GATE", score: "", year: "" }]
                      }))}
                    >
                      + Add Exam
                    </button>
                  </div>

                  {(!resume.competitiveExams || resume.competitiveExams.length === 0) && (
                    <p style={{ fontSize: "0.8rem", color: "var(--text-muted)", margin: 0 }}>No competitive exams listed.</p>
                  )}

                  {(resume.competitiveExams || []).map((item, idx) => (
                    <div key={idx} style={{ display: "flex", gap: "0.8rem", alignItems: "center" }}>
                      <select
                        className="input"
                        style={{ flex: 1, background: "var(--bg-2)", color: "var(--text)", border: "1px solid var(--border)", borderRadius: "8px", height: "42px" }}
                        value={item.exam}
                        onChange={(e) => setResume(r => ({
                          ...r,
                          competitiveExams: (r.competitiveExams || []).map((ex, i) => i === idx ? { ...ex, exam: e.target.value } : ex)
                        }))}
                      >
                        <option value="JEE Mains">JEE Mains</option>
                        <option value="JEE Advanced">JEE Advanced</option>
                        <option value="GATE">GATE</option>
                        <option value="CAT">CAT</option>
                        <option value="UPSC">UPSC</option>
                        <option value="NEET">NEET</option>
                        <option value="GMAT">GMAT</option>
                      </select>
                      <input
                        className="input"
                        style={{ flex: 1.5 }}
                        placeholder="AIR 120 / 99.8 Percentile"
                        value={item.score}
                        onChange={(e) => setResume(r => ({
                          ...r,
                          competitiveExams: (r.competitiveExams || []).map((ex, i) => i === idx ? { ...ex, score: e.target.value } : ex)
                        }))}
                      />
                      <input
                        className="input"
                        style={{ flex: 0.8 }}
                        placeholder="Year"
                        value={item.year}
                        onChange={(e) => setResume(r => ({
                          ...r,
                          competitiveExams: (r.competitiveExams || []).map((ex, i) => i === idx ? { ...ex, year: e.target.value } : ex)
                        }))}
                      />
                      <button
                        onClick={() => setResume(r => ({
                          ...r,
                          competitiveExams: (r.competitiveExams || []).filter((_, i) => i !== idx)
                        }))}
                        style={{ background: "none", border: "none", color: "#ff6584", cursor: "pointer", fontSize: "1.2rem" }}
                      >
                        ×
                      </button>
                    </div>
                  ))}
                </div>

                {/* Hackathons & Coding Contests */}
                <div className="card" style={{ display: "grid", gap: "1.5rem" }}>
                  <h3 style={{ fontWeight: 700, fontSize: "1rem" }}>🏆 Hackathons & Coding Contests</h3>
                  <div>
                    <label style={{ fontSize: "0.8rem", color: "var(--text-muted)", display: "block", marginBottom: "0.3rem" }}>Hackathons Participated</label>
                    <textarea
                      className="input"
                      rows={2}
                      placeholder="e.g. Smart India Hackathon 2024 (Winner)"
                      value={resume.hackathons?.join("\n") || ""}
                      onChange={(e) => setResume(r => ({ ...r, hackathons: e.target.value.split("\n").filter(Boolean) }))}
                    />
                  </div>
                  <div>
                    <label style={{ fontSize: "0.8rem", color: "var(--text-muted)", display: "block", marginBottom: "0.3rem" }}>Coding Contest Profiles / Ratings</label>
                    <textarea
                      className="input"
                      rows={2}
                      placeholder="e.g. LeetCode Max Rating: 1850"
                      value={resume.codingContests?.join("\n") || ""}
                      onChange={(e) => setResume(r => ({ ...r, codingContests: e.target.value.split("\n").filter(Boolean) }))}
                    />
                  </div>
                </div>

                {/* Campus Activities */}
                <div className="card" style={{ display: "grid", gap: "1.5rem" }}>
                  <h3 style={{ fontWeight: 700, fontSize: "1rem" }}>📣 Campus Achievements & Club Roles</h3>
                  <div>
                    <label style={{ fontSize: "0.8rem", color: "var(--text-muted)", display: "block", marginBottom: "0.3rem" }}>Campus Achievements</label>
                    <textarea
                      className="input"
                      rows={2}
                      placeholder="e.g. Excellence award in Capstone Project"
                      value={resume.campusAchievements?.join("\n") || ""}
                      onChange={(e) => setResume(r => ({ ...r, campusAchievements: e.target.value.split("\n").filter(Boolean) }))}
                    />
                  </div>
                  <div>
                    <label style={{ fontSize: "0.8rem", color: "var(--text-muted)", display: "block", marginBottom: "0.3rem" }}>Clubs & Leadership Roles</label>
                    <textarea
                      className="input"
                      rows={2}
                      placeholder="e.g. Technical Head at UX Club"
                      value={resume.clubsAndLeadership?.join("\n") || ""}
                      onChange={(e) => setResume(r => ({ ...r, clubsAndLeadership: e.target.value.split("\n").filter(Boolean) }))}
                    />
                  </div>
                </div>

                {/* Placement Readiness Checklist */}
                <div className="card" style={{ display: "grid", gap: "1.5rem" }}>
                  <h3 style={{ fontWeight: 700, fontSize: "1rem" }}>🎓 Placement Readiness Checklist</h3>
                  <div style={{ display: "grid", gap: "1rem" }}>
                    {[
                      ["aptitudePrep", "Completed Quantitative & Verbal Aptitude Prep"],
                      ["codingPrep", "Completed Core DSA Preparation"],
                      ["mockInterview", "Completed Mock Interview rounds"],
                      ["resumeReviewed", "Resume audited and ATS score above 70%"],
                      ["linkedinUpdated", "LinkedIn Profile and GitHub repositories updated"]
                    ].map(([key, label]) => (
                      <label key={key} style={{ display: "flex", alignItems: "center", gap: "1rem", fontSize: "0.85rem", cursor: "pointer" }}>
                        <input
                          type="checkbox"
                          checked={resume.placementChecklist?.[key] || false}
                          onChange={(e) => setResume(r => ({
                            ...r,
                            placementChecklist: {
                              ...(r.placementChecklist || {}),
                              [key]: e.target.checked
                            }
                          }))}
                          style={{ accentColor: "var(--accent)", width: "16px", height: "16px" }}
                        />
                        {label}
                      </label>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* STEP 9.5: Job Description Target Match */}


            {/* STEP 10: Template Selection & Spacing/Font controls */}
            {activeStep === "templates" && (
              <div style={{ display: "grid", gap: "1.2rem" }}>
                <div className="card" style={{ display: "grid", gap: "1.5rem" }}>
                  <h2 style={{ fontFamily: "Syne, sans-serif", fontWeight: 700, fontSize: "1.2rem" }}>Select Design Template</h2>
                  <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1.5rem" }}>
                    {[
                      { id: "standard", name: "Standard (Recommended)", desc: "Highly recommended ATS-friendly, clean and professional layout." },
                      { id: "modern", name: "Modern ATS", desc: "Minimal design with standard sections - highly compatible." },
                      { id: "professional", name: "Professional", desc: "Classic layout styled with prominent timeline dividers." },
                      { id: "executive", name: "Executive", desc: "Structured top headers best for senior management." },
                      { id: "minimal", name: "Minimal", desc: "Elegant layout maximizing whitespace utilization." },
                      { id: "creative", name: "Creative", desc: "Features left tag sidebar and striking highlights." },
                      { id: "ats-safe", name: "ATS Safe", desc: "Times New Roman clean 1-column layout - maximum parse rates." },
                      { id: "fresher", name: "Fresher Mode", desc: "Highlighted education, GATE scores, hackathons." },
                      { id: "startup", name: "Startup Growth", desc: "Rose red impact styling, projects and metrics grids." },
                      { id: "it-tech", name: "IT Tech", desc: "Monospace coding font, Top tech stack blocks." },
                      { id: "bfsi-risk", name: "BFSI Corporate", desc: "CFA, FRM, RBI, SEBI compliance structured navy layout." },
                      { id: "minimal-2", name: "Minimalist Teal", desc: "Teal accents, elegant spacing." }
                    ].map((tpl) => (
                      <div
                        key={tpl.id}
                        onClick={() => setSelectedTemplate(tpl.id)}
                        style={{
                          padding: "1rem",
                          border: selectedTemplate === tpl.id ? "2px solid var(--accent)" : "1px solid var(--border)",
                          borderRadius: "10px",
                          background: selectedTemplate === tpl.id ? "rgba(108,99,255,0.06)" : "var(--card)",
                          cursor: "pointer",
                          transition: "all 0.2s",
                        }}
                      >
                        <h4 style={{ fontWeight: 700, margin: "0 0 0.25rem" }}>{tpl.name}</h4>
                        <p style={{ fontSize: "0.78rem", color: "var(--text-muted)", margin: 0 }}>{tpl.desc}</p>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="card" style={{ display: "grid", gap: "1.5rem" }}>
                  <h3 style={{ fontWeight: 700, fontSize: "1rem" }}>🎨 Typography & Layout Controls</h3>
                  
                  <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1.2rem" }}>
                    <div>
                      <label style={{ fontSize: "0.8rem", color: "var(--text-muted)", display: "block", marginBottom: "0.3rem" }}>Font Family</label>
                      <select
                        className="input"
                        style={{ background: "var(--bg-2)", color: "var(--text)", border: "1px solid var(--border)", borderRadius: "8px", height: "42px" }}
                        value={resume.fontFamily || "Inter"}
                        onChange={(e) => setResume(r => ({ ...r, fontFamily: e.target.value }))}
                      >
                        <option value="Inter">Inter (Clean Modern)</option>
                        <option value="DM Sans">DM Sans (Professional)</option>
                        <option value="Syne">Syne (Creative Header)</option>
                        <option value="Georgia">Georgia (Classic Serif)</option>
                        <option value="Garamond">Garamond (Executive Serif)</option>
                        <option value="Space Grotesk">Space Grotesk (Tech/Startup)</option>
                        <option value="Outfit">Outfit (Minimalist Sans)</option>
                        <option value="Playfair Display">Playfair (Elegant Display)</option>
                      </select>
                    </div>

                    <div>
                      <label style={{ fontSize: "0.8rem", color: "var(--text-muted)", display: "block", marginBottom: "0.3rem" }}>Industry Mode Context</label>
                      <select
                        className="input"
                        style={{ background: "var(--bg-2)", color: "var(--text)", border: "1px solid var(--border)", borderRadius: "8px", height: "42px" }}
                        value={resume.industryMode || "IT"}
                        onChange={(e) => setResume(r => ({ ...r, industryMode: e.target.value }))}
                      >
                        <option value="IT">IT & Software</option>
                        <option value="Sales">Sales & Revenue</option>
                        <option value="BFSI">BFSI (Finance/Banking)</option>
                        <option value="Startup">Startup & Growth</option>
                        <option value="Healthcare">Healthcare & Bio</option>
                        <option value="Education">Academic & Research</option>
                        <option value="Manufacturing">Manufacturing & Safety</option>
                        <option value="MBA">MBA Candidates</option>
                      </select>
                    </div>

                    <div>
                      <label style={{ fontSize: "0.8rem", color: "var(--text-muted)", display: "block", marginBottom: "0.35rem" }}>Font Size ({resume.fontSize || 10}pt)</label>
                      <input
                        type="range"
                        min="8"
                        max="14"
                        step="0.5"
                        value={resume.fontSize || 10}
                        onChange={(e) => setResume(r => ({ ...r, fontSize: parseFloat(e.target.value) }))}
                        style={{ width: "100%", accentColor: "var(--accent)" }}
                      />
                    </div>

                    <div>
                      <label style={{ fontSize: "0.8rem", color: "var(--text-muted)", display: "block", marginBottom: "0.35rem" }}>Line Spacing ({resume.spacing || 1.2})</label>
                      <input
                        type="range"
                        min="1"
                        max="2"
                        step="0.1"
                        value={resume.spacing || 1.2}
                        onChange={(e) => setResume(r => ({ ...r, spacing: parseFloat(e.target.value) }))}
                        style={{ width: "100%", accentColor: "var(--accent)" }}
                      />
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* STEP 11: Preview and ATS Check Report */}
            {activeStep === "preview" && (
              <div style={{ display: "grid", gap: "1.2rem" }}>
                {localATS && (
                  <div className="card" style={{ display: "grid", gap: "1.5rem" }}>
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                      <h3 style={{ fontFamily: "Syne, sans-serif", fontWeight: 700, fontSize: "1.1rem" }}>Local ATS Scan Report</h3>
                      <span className="tag tag-green" style={{ fontSize: "0.85rem", fontWeight: 800, background: localATS.overall >= 70 ? "rgba(67,233,123,0.15)" : "rgba(255,101,132,0.15)", color: localATS.overall >= 70 ? "#43e97b" : "#ff6584" }}>
                        Score: {localATS.overall}/100
                      </span>
                    </div>

                    <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(130px, 1fr))", gap: "1.2rem" }}>
                      {Object.entries(localATS.breakdown).map(([key, val]) => (
                        <div key={key} style={{ background: "var(--bg-3)", padding: "0.6rem 0.8rem", borderRadius: "8px", textAlign: "center" }}>
                          <div style={{ fontSize: "0.68rem", textTransform: "uppercase", color: "var(--text-muted)", marginBottom: "0.2rem" }}>{key}</div>
                          <div style={{ fontWeight: 700, fontSize: "1.05rem", color: val >= 70 ? "#43e97b" : val >= 45 ? "#f6d365" : "#ff6584" }}>{val}%</div>
                        </div>
                      ))}
                    </div>

                    {localATS.suggestions.length > 0 && (
                      <div style={{ marginTop: "0.5rem" }}>
                        <div style={{ fontWeight: 700, fontSize: "0.88rem", marginBottom: "0.4rem" }}>🎯 Priority Recommendations:</div>
                        <div style={{ display: "grid", gap: "0.4rem" }}>
                          {localATS.suggestions.map((s, i) => (
                            <div key={i} style={{ fontSize: "0.82rem", color: "var(--text-muted)", background: "var(--bg-2)", padding: "0.5rem 0.75rem", borderRadius: "6px", borderLeft: "3px solid var(--accent)" }}>{s}</div>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Matched Keywords Chips */}
                    {localATS.matchedKeywords && localATS.matchedKeywords.length > 0 && (
                      <div style={{ marginTop: "0.8rem", borderTop: "1px solid var(--border)", paddingTop: "0.8rem" }}>
                        <div style={{ fontWeight: 700, fontSize: "0.88rem", marginBottom: "0.5rem", color: "#43e97b", display: "flex", alignItems: "center", gap: "0.4rem" }}>
                          <span>✓ Matched Keywords ({localATS.matchedKeywords.length})</span>
                        </div>
                        <div style={{ display: "flex", flexWrap: "wrap", gap: "0.4rem" }}>
                          {localATS.matchedKeywords.map((kw, i) => (
                            <span key={i} style={{ fontSize: "0.75rem", background: "rgba(67,233,123,0.1)", color: "#43e97b", padding: "4px 8px", borderRadius: "12px", border: "1px solid rgba(67,233,123,0.2)", fontWeight: 500 }}>
                              {kw}
                            </span>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Missing Keywords Chips */}
                    {localATS.missingKeywords && localATS.missingKeywords.length > 0 && (
                      <div style={{ marginTop: "0.8rem", borderTop: "1px solid var(--border)", paddingTop: "0.8rem" }}>
                        <div style={{ fontWeight: 700, fontSize: "0.88rem", marginBottom: "0.5rem", color: "#ff6584", display: "flex", alignItems: "center", gap: "0.4rem" }}>
                          <span>✗ Missing Keyword Gaps ({localATS.missingKeywords.length})</span>
                        </div>
                        <div style={{ display: "flex", flexWrap: "wrap", gap: "0.4rem" }}>
                          {localATS.missingKeywords.map((kw, i) => (
                            <span key={i} style={{ fontSize: "0.75rem", background: "rgba(255,101,132,0.1)", color: "#ff6584", padding: "4px 8px", borderRadius: "12px", border: "1px solid rgba(255,101,132,0.2)", fontWeight: 500 }}>
                              + {kw}
                            </span>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                )}

                {/* ATS AI Rewrite Section */}
                {localATS && localATS.missingKeywords && localATS.missingKeywords.length > 0 && (
                  <div className="card" style={{ display: "grid", gap: "1.2rem" }}>
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                      <h2 style={{ fontFamily: "Syne, sans-serif", fontWeight: 700, fontSize: "1.15rem", margin: 0 }}>
                        ✨ ATS Keyword Injector
                      </h2>
                    </div>
                    <p style={{ color: "var(--text-muted)", fontSize: "0.82rem", margin: 0, lineHeight: 1.5 }}>
                      Click <strong>"✨ Inject Keywords"</strong> to let AI seamlessly weave your missing ATS keywords into your existing content.
                    </p>
                    
                    <div style={{ display: "grid", gap: "1.5rem" }}>
                      {/* Summary Rewrite Target */}
                      {resume.summary && (
                        <div style={{ border: "1px solid var(--border)", padding: "1rem", borderRadius: "10px", background: "var(--bg-2)" }}>
                          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "0.6rem" }}>
                            <span style={{ fontSize: "0.8rem", fontWeight: 700, color: "var(--text-muted)", textTransform: "uppercase" }}>Professional Summary</span>
                            <button 
                              className="btn-secondary" 
                              disabled={inlineRewriteLoading}
                              onClick={() => handleInlineRewrite(resume.summary, "Professional Summary", "ats-summary")}
                              style={{ fontSize: "0.78rem", padding: "0.35rem 0.8rem", borderColor: "var(--accent)", color: "var(--accent)" }}
                            >
                              {inlineRewriteLoading && inlineRewriteKey === "ats-summary" ? "Generating..." : "✨ Inject Keywords"}
                            </button>
                          </div>
                          <div style={{ fontSize: "0.85rem", color: "var(--text)", lineHeight: 1.5 }}>{resume.summary}</div>
                          
                          {/* Suggestions */}
                          {inlineRewriteKey === "ats-summary" && inlineRewriteSuggestions.length > 0 && (
                            <div style={{ display: "grid", gap: "1.2rem", marginTop: "1rem" }}>
                                {inlineRewriteSuggestions.map((sug, i) => (
                                  <div key={i} style={{ padding: "0.8rem", background: "var(--bg-3)", borderLeft: "3px solid var(--accent)", borderRadius: "6px" }}>
                                    <p style={{ fontSize: "0.85rem", margin: "0 0 0.8rem", lineHeight: 1.5 }}>{sug}</p>
                                    <button className="btn-primary" style={{ fontSize: "0.75rem", padding: "0.3rem 0.8rem" }} onClick={() => {
                                      setResume(r => ({ ...r, summary: sug }));
                                      setInlineRewriteSuggestions([]);
                                      setInlineRewriteKey("");
                                    }}>✅ Accept</button>
                                  </div>
                                ))}
                            </div>
                          )}
                        </div>
                      )}
                      
                      {/* Work Experience Targets */}
                      {resume.workExperience.map((exp, expIdx) => 
                        exp.bullets?.map((bullet, bulletIdx) => {
                          const key = `ats-work-${expIdx}-${bulletIdx}`;
                          return (
                            <div key={key} style={{ border: "1px solid var(--border)", padding: "1rem", borderRadius: "10px", background: "var(--bg-2)" }}>
                              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "0.6rem" }}>
                                <span style={{ fontSize: "0.8rem", fontWeight: 700, color: "var(--text-muted)", textTransform: "uppercase" }}>{exp.company} — Bullet {bulletIdx + 1}</span>
                                <button 
                                  className="btn-secondary" 
                                  disabled={inlineRewriteLoading}
                                  onClick={() => handleInlineRewrite(bullet, `Work Experience at ${exp.company} — ${exp.role}`, key)}
                                  style={{ fontSize: "0.78rem", padding: "0.35rem 0.8rem", borderColor: "var(--accent)", color: "var(--accent)" }}
                                >
                                  {inlineRewriteLoading && inlineRewriteKey === key ? "Generating..." : "✨ Inject Keywords"}
                                </button>
                              </div>
                              <div style={{ fontSize: "0.85rem", color: "var(--text)", lineHeight: 1.5 }}>{bullet}</div>
                              
                              {/* Suggestions */}
                              {inlineRewriteKey === key && inlineRewriteSuggestions.length > 0 && (
                                <div style={{ display: "grid", gap: "1.2rem", marginTop: "1rem" }}>
                                    {inlineRewriteSuggestions.map((sug, i) => (
                                      <div key={i} style={{ padding: "0.8rem", background: "var(--bg-3)", borderLeft: "3px solid var(--accent)", borderRadius: "6px" }}>
                                        <p style={{ fontSize: "0.85rem", margin: "0 0 0.8rem", lineHeight: 1.5 }}>{sug}</p>
                                        <button className="btn-primary" style={{ fontSize: "0.75rem", padding: "0.3rem 0.8rem" }} onClick={() => {
                                          const newExp = [...resume.workExperience];
                                          if (newExp[expIdx].bullets) {
                                            newExp[expIdx].bullets[bulletIdx] = sug;
                                          }
                                          setResume(r => ({ ...r, workExperience: newExp }));
                                          setInlineRewriteSuggestions([]);
                                          setInlineRewriteKey("");
                                        }}>✅ Accept</button>
                                      </div>
                                    ))}
                                </div>
                              )}
                            </div>
                          );
                        })
                      )}
                    </div>
                  </div>
                )}

                <div className="card" style={{ textAlign: "center", padding: "2.5rem 2rem", display: "grid", gap: "1.2rem" }}>
                  <div style={{ fontSize: "2.5rem" }}>🎉</div>
                  <h3 style={{ fontFamily: "Syne, sans-serif", fontWeight: 800, fontSize: "1.3rem", margin: 0 }}>Your Resume is Ready!</h3>
                  <p style={{ color: "var(--text-muted)", fontSize: "0.88rem", maxWidth: "400px", margin: "0 auto 0.2rem", lineHeight: 1.5 }}>
                    Export it as an A4 print sheet PDF, create a public link to share with recruiters, or track application logs.
                  </p>
                  
                  <div style={{ display: "flex", gap: "1.2rem", justifyContent: "center", flexWrap: "wrap" }}>
                    <button onClick={handlePrint} className="btn-primary" style={{ padding: "0.65rem 1.4rem" }}>
                      📥 Print / Save PDF
                    </button>
                    <Link href="/dashboard" style={{ textDecoration: "none" }}>
                      <button className="btn-secondary" style={{ padding: "0.65rem 1.4rem" }}>
                        ← Dashboard
                      </button>
                    </Link>
                  </div>

                  {/* Public Link Generator widget */}
                  <div style={{ borderTop: "1px solid var(--border)", paddingTop: "1.2rem", marginTop: "0.5rem", display: "grid", gap: "1.2rem", textAlign: "left" }}>
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                      <span style={{ fontSize: "0.82rem", fontWeight: 700 }}>🔗 Public Web Link Sharing</span>
                      {shareToken && (
                        <span style={{ fontSize: "0.72rem", color: "var(--text-muted)" }}>
                          👁️ Views: <strong>{shareViews}</strong>
                        </span>
                      )}
                    </div>

                    {!shareToken ? (
                      <button 
                        onClick={handleToggleShare} 
                        className="btn-secondary" 
                        style={{ width: "100%", justifyContent: "center", padding: "0.55rem", fontSize: "0.82rem", borderColor: "var(--accent)", color: "var(--accent)" }}
                        disabled={shareLoading}
                      >
                        {shareLoading ? "Generating Link..." : "✦ Generate Shareable Public Link"}
                      </button>
                    ) : (
                      <div style={{ display: "grid", gap: "0.8rem" }}>
                        <div style={{ display: "flex", gap: "0.4rem" }}>
                          <input 
                            readOnly 
                            className="input" 
                            style={{ fontSize: "0.8rem", padding: "0.5rem", flex: 1, background: "var(--bg-3)" }} 
                            value={typeof window !== "undefined" ? window.location.origin + "/share/" + shareToken : ""}
                          />
                          <button 
                            onClick={() => {
                              if (typeof window !== "undefined") {
                                navigator.clipboard.writeText(window.location.origin + "/share/" + shareToken);
                                alert("Link copied to clipboard!");
                              }
                            }}
                            className="btn-primary"
                            style={{ padding: "0 1rem", fontSize: "0.8rem" }}
                          >
                            Copy
                          </button>
                        </div>
                        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginTop: "0.2rem" }}>
                          <label style={{ display: "flex", alignItems: "center", gap: "0.8rem", fontSize: "0.78rem", cursor: "pointer", color: "var(--text-muted)" }}>
                            <input
                              type="checkbox"
                              checked={isSharePublic}
                              onChange={handleToggleShare}
                              disabled={shareLoading}
                              style={{ accentColor: "var(--accent)" }}
                            />
                            Link is Active (Public)
                          </label>
                          <a 
                            href={`/share/${shareToken}`} 
                            target="_blank" 
                            rel="noopener noreferrer" 
                            style={{ fontSize: "0.78rem", color: "var(--accent)", textDecoration: "none" }}
                          >
                            Open Link ↗
                          </a>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            )}

            {/* PREVIOUS / NEXT STEPS NAVIGATION BUTTONS */}
            <div style={{ display: "flex", justifyContent: "space-between", marginTop: "1rem", borderTop: "1px solid var(--border)", paddingTop: "1rem", paddingBottom: "1rem" }}>
              <button
                className="btn-secondary"
                disabled={activeStep === "personal"}
                style={{ padding: "0.4rem 1rem", fontSize: "0.85rem", borderRadius: "8px", fontWeight: 600, display: "flex", alignItems: "center", gap: "0.4rem" }}
                onClick={() => {
                  const idx = steps.findIndex((s) => s.key === activeStep);
                  if (idx > 0) setActiveStep(steps[idx - 1].key);
                }}
              >
                ← Back
              </button>
              <button
                className="btn-primary"
                disabled={activeStep === "preview"}
                style={{ padding: "0.4rem 1rem", fontSize: "0.85rem", borderRadius: "8px", fontWeight: 600, display: "flex", alignItems: "center", gap: "0.4rem" }}
                onClick={() => {
                  const idx = steps.findIndex((s) => s.key === activeStep);
                  if (idx >= 0 && idx < steps.length - 1) setActiveStep(steps[idx + 1].key);
                }}
              >
                Next Step →
              </button>
            </div>

            </div>
          </div>
        )}
        rightPanel={isFullscreen ? (
          <>
            {/* COLUMN 3: STICKY LIVE DOCUMENT PREVIEW PANEL */}
            <div className="no-print builder-preview-container">
          
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "1rem" }}>
            <div style={{ display: "flex", alignItems: "center", gap: "1.2rem" }}>
              <button onClick={() => setZoomFactor(prev => Math.max(0.5, prev - 0.05))} className="btn-secondary" style={{ padding: "0.3rem 0.6rem", fontSize: "0.8rem" }}>Zoom -</button>
              <input 
                type="range" 
                min="0.5" 
                max="1.2" 
                step="0.05" 
                value={zoomFactor}
                onChange={(e) => setZoomFactor(parseFloat(e.target.value))}
                style={{ width: "80px", accentColor: "var(--accent)" }}
              />
              <span style={{ fontSize: "0.82rem", color: "var(--text-muted)" }}>{Math.round(zoomFactor * 100)}%</span>
              <button onClick={() => setZoomFactor(prev => Math.min(1.2, prev + 0.05))} className="btn-secondary" style={{ padding: "0.3rem 0.6rem", fontSize: "0.8rem" }}>Zoom +</button>
            </div>
          </div>

          <div 
            id="resume-preview-container"
            style={{ 
            flex: 1, 
            overflowY: "auto", 
            background: "var(--bg-3)", 
            borderRadius: "12px", 
            border: "1px solid var(--border)", 
            display: "flex", 
            justifyContent: "center", 
            alignItems: "start",
            padding: "2rem 1rem"
          }}>
            <div className="resume-paper resume-print-area" style={{ 
              transform: `scale(${zoomFactor})`, 
              transformOrigin: "top center",
              background: "#ffffff", 
              color: "#333333", 
              padding: "40px", 
              width: "100%",
              minHeight: "297mm",
              maxWidth: "800px",
              boxShadow: "0 10px 30px rgba(0,0,0,0.5)",
              borderRadius: "4px",
              transition: "transform 0.15s ease-out",
            }}>
              <ResumeDocument data={resume} templateId={selectedTemplate} />
            </div>
          </div>
        </div>
          </>
        ) : null}
        />

      </div>

      {/* LINKEDIN IMPORT MODAL */}
      {showLinkedinModal && (
        <div className="no-print" style={{ position: "fixed", top: 0, left: 0, right: 0, bottom: 0, background: "rgba(0,0,0,0.8)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 1000 }}>
            <div className="card" style={{ width: "100%", maxWidth: "500px", padding: "2rem" }}>
              <h3 style={{ fontFamily: "Syne, sans-serif", fontWeight: 800, marginBottom: "0.5rem" }}>
                Import LinkedIn Details
              </h3>
              
              {/* Option Toggle */}
              <div style={{ display: "flex", gap: "0.8rem", marginBottom: "1rem", background: "rgba(255,255,255,0.05)", padding: "4px", borderRadius: "10px" }}>
                <button
                  type="button"
                  onClick={() => setImportOption("paste")}
                  style={{
                    flex: 1,
                    padding: "0.5rem",
                    borderRadius: "8px",
                    border: "none",
                    background: importOption === "paste" ? "var(--accent)" : "transparent",
                    color: "#fff",
                    fontSize: "0.85rem",
                    fontWeight: 600,
                    cursor: "pointer",
                  }}
                >
                  Option A: Text Paste
                </button>
                <button
                  type="button"
                  onClick={() => setImportOption("pdf")}
                  style={{
                    flex: 1,
                    padding: "0.5rem",
                    borderRadius: "8px",
                    border: "none",
                    background: importOption === "pdf" ? "var(--accent)" : "transparent",
                    color: "#fff",
                    fontSize: "0.85rem",
                    fontWeight: 600,
                    cursor: "pointer",
                  }}
                >
                  Option B: PDF Upload
                </button>
              </div>

              {importOption === "paste" ? (
                <div>
                  <p style={{ color: "var(--text-muted)", fontSize: "0.85rem", marginBottom: "0.8rem" }}>
                    Go to your LinkedIn profile → click <strong>More</strong> → <strong>Save to PDF</strong> → open the PDF → select all text (Ctrl+A) → copy → paste here.<br />
                    Or, select all text directly on your LinkedIn profile page and paste it below.
                  </p>
                  <textarea
                    className="input"
                    style={{ minHeight: "12rem", width: "100%", fontFamily: "monospace", fontSize: "0.82rem" }}
                    placeholder="Paste copied LinkedIn profile text here..."
                    value={pasteText}
                    onChange={(e) => setPasteText(e.target.value)}
                    disabled={linkedinLoading}
                  />
                </div>
              ) : (
                <div>
                  <p style={{ color: "var(--text-muted)", fontSize: "0.85rem", marginBottom: "0.8rem" }}>
                    Get your complete profile imported with AI extraction:
                  </p>
                  <ol style={{ fontSize: "0.85rem", color: "var(--text-muted)", paddingLeft: "1.2rem", marginBottom: "1rem", lineHeight: 1.6 }}>
                    <li>On your LinkedIn profile page, click <strong>More</strong> → <strong>Save to PDF</strong></li>
                    <li>Upload the downloaded PDF below</li>
                  </ol>
                  <input
                    type="file"
                    accept=".pdf"
                    onChange={(e) => setPdfFile(e.target.files?.[0] || null)}
                    style={{
                      width: "100%",
                      padding: "1rem",
                      background: "rgba(0,0,0,0.2)",
                      border: "1px dashed var(--border)",
                      borderRadius: "8px",
                      color: "#fff",
                      cursor: "pointer",
                    }}
                    disabled={linkedinLoading}
                  />
                </div>
              )}

              {validationError && (
                <div style={{ color: "#ff6584", fontSize: "0.82rem", background: "rgba(255,101,132,0.1)", padding: "0.6rem", borderRadius: "6px", marginTop: "1rem" }}>
                  {validationError}
                </div>
              )}

              <div style={{ display: "flex", justifyContent: "flex-end", gap: "1.2rem", marginTop: "1.5rem" }}>
                <button
                  type="button"
                  onClick={() => { setShowLinkedinModal(false); setValidationError(""); }}
                  className="btn-secondary"
                  disabled={linkedinLoading}
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={handleLinkedInImport}
                  className="btn-primary"
                  disabled={linkedinLoading || (importOption === "paste" ? !pasteText.trim() : !pdfFile)}
                >
                  {linkedinLoading ? "Parsing..." : "✦ Import"}
                </button>
              </div>
            </div>
        </div>
      )}

      {/* AI CAREER COACH DRAWER */}
      {showCoach && (
        <div className="no-print" style={{
          position: "fixed",
          top: 0,
          right: 0,
          bottom: 0,
          width: "420px",
          background: "var(--bg-2)",
          borderLeft: "1px solid var(--border)",
          boxShadow: "-10px 0 30px rgba(0,0,0,0.5)",
          zIndex: 999,
          display: "flex",
          flexDirection: "column",
          padding: "1.5rem",
          transition: "transform 0.3s ease-in-out"
        }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", borderBottom: "1px solid var(--border)", paddingBottom: "1rem", marginBottom: "1rem" }}>
            <div>
              <h3 style={{ fontFamily: "Syne, sans-serif", fontWeight: 800, fontSize: "1.2rem", display: "flex", alignItems: "center", gap: "0.8rem" }}>
                ✦ AI Career Coach
              </h3>
              <span style={{ fontSize: "0.7rem", background: "rgba(108,99,255,0.15)", color: "var(--accent)", padding: "2px 8px", borderRadius: "10px", fontWeight: 600 }}>India-First Expert</span>
            </div>
            <button 
              onClick={() => setShowCoach(false)} 
              style={{ background: "none", border: "none", color: "var(--text)", fontSize: "1.25rem", cursor: "pointer", fontWeight: 700 }}
            >
              ✕
            </button>
          </div>

          {/* Messages Container */}
          <div style={{ flex: 1, overflowY: "auto", display: "flex", flexDirection: "column", gap: "1.2rem", paddingRight: "4px", marginBottom: "1rem" }}>
            {coachMessages.map((msg, i) => (
              <div key={i} style={{
                alignSelf: msg.role === "user" ? "flex-end" : "flex-start",
                maxWidth: "85%",
                background: msg.role === "user" ? "var(--accent)" : "var(--bg-3)",
                color: msg.role === "user" ? "#fff" : "var(--text)",
                padding: "0.75rem 1rem",
                borderRadius: msg.role === "user" ? "12px 12px 2px 12px" : "12px 12px 12px 2px",
                fontSize: "0.85rem",
                lineHeight: 1.5,
                whiteSpace: "pre-wrap"
              }}>
                {msg.content}
              </div>
            ))}
            {coachLoading && (
              <div style={{ alignSelf: "flex-start", background: "var(--bg-3)", padding: "0.75rem 1rem", borderRadius: "12px 12px 12px 2px", fontSize: "0.85rem", display: "flex", alignItems: "center", gap: "0.8rem" }}>
                <span className="spinner" style={{ width: 14, height: 14 }}></span>
                <span style={{ color: "var(--text-muted)", fontSize: "0.8rem" }}>Coach is writing...</span>
              </div>
            )}
          </div>

          {/* Suggestion Chips */}
          {coachMessages.length === 1 && (
            <div style={{ display: "flex", flexDirection: "column", gap: "0.4rem", marginBottom: "1rem" }}>
              <span style={{ fontSize: "0.72rem", color: "var(--text-muted)", fontWeight: 700, textTransform: "uppercase" }}>Common Topics:</span>
              {[
                "Suggest a Hinglish resume summary",
                "How to frame UPSC gap years?",
                "Frame current CTC (₹8 LPA) & expected (₹14 LPA)",
                "Improve technical project bullet points"
              ].map((topic, i) => (
                <button
                  key={i}
                  onClick={() => handleCoachSend(topic)}
                  style={{
                    textAlign: "left",
                    background: "var(--bg-3)",
                    border: "1px solid var(--border)",
                    borderRadius: "8px",
                    padding: "0.5rem 0.75rem",
                    fontSize: "0.78rem",
                    cursor: "pointer",
                    color: "var(--text)",
                    transition: "all 0.2s"
                  }}
                  onMouseOver={(e) => e.currentTarget.style.borderColor = "var(--accent)"}
                  onMouseOut={(e) => e.currentTarget.style.borderColor = "var(--border)"}
                >
                  {topic}
                </button>
              ))}
            </div>
          )}

          {/* Input Area */}
          <div style={{ display: "flex", gap: "1rem" }}>
            <input
              type="text"
              className="input"
              placeholder="Ask anything (e.g. 'Mera resume improve karo')..."
              value={coachInput}
              onChange={(e) => setCoachInput(e.target.value)}
              onKeyDown={(e) => { if (e.key === "Enter" && !coachLoading) handleCoachSend(); }}
              style={{ flex: 1, fontSize: "0.85rem" }}
              disabled={coachLoading}
            />
            <button 
              onClick={() => handleCoachSend()}
              className="btn-primary" 
              style={{ padding: "0 1rem", fontSize: "0.85rem" }}
              disabled={coachLoading || !coachInput.trim()}
            >
              Send
            </button>
          </div>
        </div>
      )}
      
      {/* PRINT-ONLY RESUME CONTAINER */}
      <div className="print-only">
        <div className="resume-paper resume-print-area" style={{ background: "#ffffff", color: "#333333", padding: "40px", width: "100%" }}>
          <ResumeDocument data={resume} templateId={selectedTemplate} />
        </div>
      </div>

    </div>
  );
}

export default function BuilderPage() {
  return (
    <Suspense fallback={<div style={{ minHeight: "100vh", background: "var(--bg)", display: "flex", alignItems: "center", justifyContent: "center" }}><div className="spinner" style={{ width: 32, height: 32 }} /></div>}>
      <BuilderContent />
    </Suspense>
  );
}
