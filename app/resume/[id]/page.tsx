"use client";
import { useEffect, useState } from "react";
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
import { Edit3, Mail, Printer, FileDown, TrendingUp, Share2, Eye, Clock } from "lucide-react";

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
  const router = useRouter();
  const params = useParams();
  
  const [resume, setResume] = useState<Resume | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<"suggestions" | "interview" | "skillgap">("suggestions");
  
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
          alert(`Download complete! 🎉\nYour optimized resume has an ATS score of ${resume.ats_score?.overall || 100}/100.`);
        }
      } else {
        alert("Failed to export Word document.");
      }
    } catch (err) {
      console.error(err);
      alert("Error exporting Word document.");
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
        alert(`Successfully injected ${keywordsToAdd.length} missing keywords into your Technical Skills section!`);
      } else {
        alert("Failed to save updated resume.");
      }
    } catch (err) {
      console.error(err);
      alert("Error adding missing keywords.");
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
        alert("Failed to predict questions. Please try again.");
      }
    } catch (err) {
      console.error(err);
      alert("Error predicting questions.");
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
        alert("Failed to generate career story script.");
      }
    } catch (err) {
      console.error(err);
      alert("Error generating career story.");
    } finally {
      setCareerStoryLoading(false);
    }
  };

  const fetchSkillGap = async () => {
    if (!resume || !targetRole.trim()) {
      alert("Please enter a target role first.");
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
        alert("Failed to compute skill gap. Please try again.");
      }
    } catch (err) {
      console.error(err);
      alert("Error analyzing skill gap.");
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
        alert("Failed to get career recommendations.");
      }
    } catch (err) {
      console.error(err);
      alert("Error getting career recommendations.");
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
      alert("Error toggling resume share status.");
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
          if (found.template_id) {
            setSelectedTemplate(found.template_id);
          }
        }
        setLoading(false);
      })
      .catch(() => setLoading(false));
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
        setActiveTab("suggestions");
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
            setShowSuggestionsModal(false);
            try {
              const res = await fetch("/api/resume/suggestions/apply", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ resumeId: resume.id, applySuggestionIds: selectedIds })
              });
              if (res.ok) {
                // Navigate to builder with a query param to trigger the toast/highlight
                router.push(`/resume/builder?id=${resume.id}&suggestionsApplied=true`);
              }
            } catch (err) {
              console.error("Failed to apply suggestions:", err);
            }
          }}
        />
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
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))", gap: "1rem" }}>
              {resume.ats_score && (
                <div className="card" style={{ textAlign: "center", background: "linear-gradient(180deg, var(--card) 0%, rgba(20,20,30,0.8) 100%)", padding: "1.2rem" }}>
                  <p className="section-label" style={{ marginBottom: "0.3rem" }}>ATS score</p>
                  <div style={{ fontSize: "2.2rem", fontWeight: 800, fontFamily: "Syne, sans-serif", color: getScoreColor(resume.ats_score.overall) }}>
                    {resume.ats_score.overall}
                  </div>
                  <div style={{ fontSize: "0.74rem", color: "var(--text-muted)" }}>out of 100</div>
                </div>
              )}

              <div className="card" style={{ textAlign: "center", padding: "1.2rem" }}>
                <p className="section-label" style={{ marginBottom: "0.3rem" }}>Completion Profile</p>
                <div style={{ fontSize: "2.2rem", fontWeight: 800, fontFamily: "Syne, sans-serif", color: completionPercent >= 70 ? "#43e97b" : completionPercent >= 45 ? "#f6d365" : "#ff6584" }}>
                  {completionPercent}%
                </div>
                <div style={{ fontSize: "0.74rem", color: "var(--text-muted)" }}>sections completed</div>
              </div>

              {/* Public Link Generator widget */}
            <div className="card" style={{ display: "grid", gap: "0.8rem", textAlign: "left" }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <span style={{ fontSize: "0.82rem", fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.05em", color: "var(--text-muted)" }}>🔗 Public Web Link Sharing</span>
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
                <div style={{ display: "grid", gap: "0.5rem" }}>
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
                    <label style={{ display: "flex", alignItems: "center", gap: "0.5rem", fontSize: "0.78rem", cursor: "pointer", color: "var(--text-muted)" }}>
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

            {/* ATS ANALYSIS PANEL */}
            {resume.ats_score && (
              <div className="grid gap-6 animate-fade-in-up mt-6">
                <Card className="p-6">
                  <h3 className="section-label mb-6">Score Breakdown</h3>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-8 gap-y-6">
                    {Object.entries(resume.ats_score.breakdown).map(([key, val]) => (
                      <div key={key} className="flex items-center gap-4">
                        <div className="w-[54px] shrink-0">
                          <ATSRing score={val as number} size={54} strokeWidth={5} />
                        </div>
                        <div>
                          <p className="text-sm font-semibold capitalize text-[var(--text-primary)] mb-1">{key}</p>
                          <p className="text-xs text-[var(--text-muted)]">{(val as number) >= 70 ? 'Excellent' : (val as number) >= 40 ? 'Average' : 'Needs Work'}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </Card>

                {resume.ats_score.detectedRole && (
                  <Card glowColor="var(--accent)" className="p-5 border-[var(--accent)]/30 bg-[var(--accent)]/5">
                    <p className="section-label mb-3">Detected Role Configuration</p>
                    <div className="flex items-center gap-2 flex-wrap">
                      <Badge variant="accent">{resume.ats_score.detectedRole}</Badge>
                      <Badge variant="neutral">{resume.ats_score.detectedIndustry}</Badge>
                      <Badge variant="warning">{resume.ats_score.confidence}% confidence</Badge>
                    </div>
                  </Card>
                )}

                {((resume.ats_score.missingKeywordDetails || resume.ats_score.missingKeywords)?.length ?? 0) > 0 && (
                  <Card className="p-6">
                                        <div className="flex justify-between items-center mb-4">
                      <p className="section-label text-[var(--danger)] mb-0">Missing High-Value Keywords</p>
                      <button 
                         onClick={handleAddMissingKeywords}
                         disabled={addingKeywords}
                         className="btn-secondary" 
                         style={{ padding: "0.3rem 0.8rem", fontSize: "0.75rem", background: "var(--bg-elevated)", borderColor: "var(--border)" }}
                      >
                         {addingKeywords ? "Adding..." : "+ Auto-Add to Resume"}
                      </button>
                    </div>
                    <div className="flex flex-wrap gap-2">
                      {resume.ats_score.missingKeywordDetails ? (
                        [...resume.ats_score.missingKeywordDetails].sort((a: any, b: any) => b.weight - a.weight).map((kw: any, i: number) => (
                          <Badge key={`${kw.keyword}-${i}`} variant="danger" className="flex items-center gap-1.5">
                            {kw.keyword} <span className="bg-[var(--danger)]/20 px-1.5 py-0.5 rounded text-[10px]">{kw.weight}</span>
                          </Badge>
                        ))
                      ) : (
                        resume.ats_score.missingKeywords?.map((kw: string, i: number) => <Badge key={`${kw}-${i}`} variant="danger">{kw}</Badge>)
                      )}
                    </div>
                  </Card>
                )}

                {((resume.ats_score.keywordMatches || resume.ats_score.matchedKeywords)?.length ?? 0) > 0 && (
                  <Card className="p-6">
                    <p className="section-label mb-4 text-[var(--success)]">Matched Keywords</p>
                    <div className="flex flex-wrap gap-2">
                      {resume.ats_score.keywordMatches ? (
                        [...resume.ats_score.keywordMatches].sort((a: any, b: any) => b.weight - a.weight).map((kw: any, i: number) => (
                          <Badge key={`${kw.keyword}-${i}`} variant="success" className="flex items-center gap-1.5">
                            {kw.keyword} <span className="bg-[var(--success)]/20 px-1.5 py-0.5 rounded text-[10px]">{kw.weight}</span>
                          </Badge>
                        ))
                      ) : (
                        resume.ats_score.matchedKeywords?.map((kw: string, i: number) => <Badge key={`${kw}-${i}`} variant="success">{kw}</Badge>)
                      )}
                    </div>
                  </Card>
                )}

                <div className="text-xs text-[var(--text-muted)] text-center mt-2">
                  Keywords are updated periodically by our market intelligence system
                </div>

                <Card className="p-6">
                  <p className="section-label mb-4">Improvement Suggestions</p>
                  <div className="space-y-3">
                    {resume.ats_score.suggestions.map((s, i) => (
                      <div key={i} className="flex gap-3 items-start">
                        <span className="text-[var(--accent)] text-sm font-bold mt-0.5">→</span>
                        <span className="text-sm text-[var(--text-muted)] leading-relaxed">{s}</span>
                      </div>
                    ))}
                  </div>
                </Card>

                {/* Naukri / Portal Tips Card */}
                <div className="card" style={{ display: "grid", gap: "0.8rem" }}>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                    <h3 style={{ fontFamily: "Syne, sans-serif", fontSize: "1.05rem", fontWeight: 700, margin: 0, display: "flex", alignItems: "center", gap: "0.4rem" }}>
                      🇮🇳 Indian Portals (Naukri/LinkedIn) SEO Tips
                    </h3>
                    {naukriLoading && <div className="spinner" style={{ width: 14, height: 14 }} />}
                  </div>
                  <p style={{ fontSize: "0.78rem", color: "var(--text-muted)", margin: 0 }}>
                    Maximize your indexing keyword matches and search visibility for Indian HR consultants.
                  </p>
                  
                  {naukriTips.length === 0 && !naukriLoading && (
                    <button onClick={fetchNaukriTips} className="btn-secondary" style={{ padding: "0.4rem 0.8rem", fontSize: "0.78rem", alignSelf: "start" }}>
                      Load Visibility Tips
                    </button>
                  )}

                  {naukriTips.length > 0 && (
                    <div style={{ display: "grid", gap: "0.8rem", marginTop: "0.4rem" }}>
                      {naukriTips.map((tip, i) => {
                        const priColors: Record<string, string> = {
                          High: "rgba(255, 101, 132, 0.12)",
                          Medium: "rgba(246, 211, 101, 0.12)",
                          Low: "rgba(108, 99, 255, 0.12)"
                        };
                        const textColors: Record<string, string> = {
                          High: "#ff6584",
                          Medium: "#f6d365",
                          Low: "#6c63ff"
                        };
                        return (
                          <div key={i} style={{ padding: "0.8rem", background: "rgba(255,255,255,0.015)", border: "1px solid var(--border)", borderRadius: "8px" }}>
                            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "0.3rem" }}>
                              <strong style={{ fontSize: "0.82rem", color: "var(--text)" }}>{tip.area}</strong>
                              <span style={{ 
                                fontSize: "0.65rem", 
                                fontWeight: 700, 
                                padding: "2px 6px", 
                                borderRadius: "4px",
                                background: priColors[tip.priority] || "rgba(255,255,255,0.08)",
                                color: textColors[tip.priority] || "var(--text-muted)"
                              }}>
                                {tip.priority} Priority
                              </span>
                            </div>
                            <p style={{ margin: 0, fontSize: "0.78rem", color: "var(--text-muted)", lineHeight: 1.4 }}>{tip.tip}</p>
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
              {[                { key: "suggestions", label: "Suggested Improvements" },
                { key: "interview", label: "Interview Prep" },
                { key: "skillgap", label: "Skill Gap & Career" },
              ].map((tab) => {
                const isDeepLocked = (tab.key === "content" || tab.key === "jd") && !hasDeepAnalysis;
                return (
                  <button 
                    key={tab.key} 
                    onClick={() => setActiveTab(tab.key as any)} 
                    className={`px-4 py-2 rounded-full font-semibold text-sm flex items-center gap-2 transition-all duration-200 shrink-0 ${
                      activeTab === tab.key 
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

            {/* SUGGESTED IMPROVEMENTS TAB */}
            {activeTab === "suggestions" && (
              <div style={{ display: "grid", gap: "1rem", animation: "fadeInUp 0.3s ease" }}>
                <div className="card" style={{ display: "grid", gap: "1rem", padding: "1.5rem" }}>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                    <div>
                      <h3 style={{ fontFamily: "Syne, sans-serif", fontSize: "1.1rem", fontWeight: 700, margin: 0 }}>✨ Interactive Improvements</h3>
                      <p style={{ fontSize: "0.85rem", color: "var(--text-muted)", margin: "0.2rem 0 0 0" }}>
                        Generate AI suggestions to improve your ATS score by adding missing keywords and skills.
                      </p>
                    </div>
                    <button
                      onClick={fetchSuggestions}
                      disabled={suggestionsLoading}
                      className="btn-primary"
                      style={{ padding: "0.5rem 1rem", fontSize: "0.85rem" }}
                    >
                      {suggestionsLoading ? "Analyzing..." : "Find Improvements"}
                    </button>
                  </div>
                  
                  {suggestions.length > 0 && (
                    <div style={{ display: "grid", gap: "0.5rem", marginTop: "0.5rem" }}>
                      <p style={{ fontSize: "0.85rem", fontWeight: 600, color: "var(--accent)" }}>
                        {suggestions.length} highly impactful improvements found! 
                        Estimated new score: {estimatedNewScore}/100.
                      </p>
                      <button
                        onClick={() => setShowSuggestionsModal(true)}
                        className="btn-secondary"
                        style={{ padding: "0.5rem 1rem", fontSize: "0.85rem", width: "fit-content" }}
                      >
                        View & Apply Suggestions
                      </button>
                    </div>
                  )}
                </div>
              </div>
            )}

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
                      <h3 style={{ fontFamily: "Syne, sans-serif", fontSize: "1.05rem", fontWeight: 700, margin: 0 }}>🚀 Next-Step Career Path Recommendations</h3>
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
              <button onClick={() => setIsFullscreen(prev => !prev)} className="btn-secondary" style={{ padding: "0.25rem 0.6rem", fontSize: "0.78rem", borderRadius: "6px" }}>
                {isFullscreen ? "🗖 Back to Critique" : "🗔 Fullscreen Preview"}
              </button>
            </div>
          </div>

          {/* Sticky preview paper container */}
          <div style={{ 
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
              maxWidth: "800px",
              boxShadow: "0 10px 30px rgba(0,0,0,0.5)",
              borderRadius: "4px",
              transition: "transform 0.15s ease-out",
            }}>
              <ResumeDocument data={(resume as any).structured_data || resume.resume_data || emptyResumeData} templateId={selectedTemplate} />
            </div>

          </div>
        </div>

      </div>

      {/* PRINT-ONLY RESUME CONTAINER */}
      <div className="print-only">
        <div className="resume-paper resume-print-area" style={{ background: "#ffffff", color: "#333333", padding: "40px", width: "100%" }}>
          <ResumeDocument data={(resume as any).structured_data || resume.resume_data || emptyResumeData} templateId={selectedTemplate} />
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
                  alert("Copied elevator pitch to clipboard!");
                }}
                className="btn-primary"
                style={{ padding: "0.5rem 1.2rem", fontSize: "0.85rem" }}
              >
                📋 Copy Script
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
