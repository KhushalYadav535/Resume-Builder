"use client";

import { useState, useEffect, useMemo } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import Navbar from "@/components/Navbar";
import { useAuth } from "@/hooks/useAuth";
import { Resume } from "@/types";
import {
  ChevronLeft,
  Briefcase,
  FolderGit2,
  Award,
  Zap,
  GraduationCap,
  ShieldCheck,
  Languages,
  Edit3,
  Calendar,
  Layers,
  Sparkles,
  CheckCircle2,
  Info,
  ArrowLeft,
  Building,
  MapPin,
  Users,
  Target,
  Shield
} from "lucide-react";

const CATEGORY_MAP: Record<
  string,
  { label: string; icon: any; addHash: string; color: string }
> = {
  employment: {
    label: "Employment History",
    icon: Briefcase,
    addHash: "experience",
    color: "text-amber-500",
  },
  projects: {
    label: "Projects & Engineering",
    icon: FolderGit2,
    addHash: "projects",
    color: "text-blue-500",
  },
  achievements: {
    label: "Impact & Achievements",
    icon: Award,
    addHash: "experience",
    color: "text-emerald-500",
  },
  skills: {
    label: "Skills & Capabilities",
    icon: Zap,
    addHash: "skills",
    color: "text-purple-500",
  },
  awards: {
    label: "Awards & Honors",
    icon: Sparkles,
    addHash: "achievements",
    color: "text-rose-500",
  },
  certifications: {
    label: "Certifications & Credentials",
    icon: ShieldCheck,
    addHash: "certifications",
    color: "text-teal-500",
  },
  education: {
    label: "Education & Academics",
    icon: GraduationCap,
    addHash: "education",
    color: "text-indigo-500",
  },
  additional: {
    label: "Languages & Context",
    icon: Languages,
    addHash: "languages",
    color: "text-sky-500",
  },
};

export default function RecordDetailsPage() {
  const params = useParams();
  const categoryKey = (params?.category as string) || "employment";
  const recordId = (params?.recordId as string) || "";
  const { user, loading: authLoading } = useAuth();
  const router = useRouter();

  const [resumes, setResumes] = useState<Resume[]>([]);
  const [selectedResumeId, setSelectedResumeId] = useState<string>("");
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
        if (list.length > 0) {
          const base = list.find((r: Resume) => r.is_base_resume) || list[0];
          setSelectedResumeId(base.id);
        }
      })
      .catch((err) => console.error("Error fetching resumes:", err))
      .finally(() => setLoading(false));
  }, [user]);

  const activeResume = useMemo(() => {
    return resumes.find((r) => r.id === selectedResumeId) || resumes[0] || null;
  }, [resumes, selectedResumeId]);

  const categoryMeta = CATEGORY_MAP[categoryKey] || {
    label: "Category Details",
    icon: Layers,
    addHash: "experience",
    color: "text-amber-500",
  };

  const CategoryIcon = categoryMeta.icon;

  // Find record from active resume data
  const recordData = useMemo(() => {
    const data = activeResume?.resume_data;
    if (!data) return null;

    switch (categoryKey) {
      case "employment": {
        const found = data.workExperience?.find(
          (w, idx) => (w.id || `exp-${idx}`) === recordId
        );
        if (!found) return null;
        return {
          title: found.company || "Company",
          subtitle: found.role || "Role",
          dateRange: `${found.startDate || ""} – ${found.current ? "Present" : found.endDate || ""}`,
          current: found.current,
          location: found.city,
          industry: found.industry,
          teamSize: found.teamSize,
          employmentType: found.employmentType,
          description: found.contextNote,
          bullets: found.bullets || [],
          tools: found.toolsUsed || [],
          raw: found,
        };
      }

      case "projects": {
        const found = data.projects?.find(
          (p, idx) => (p.id || `proj-${idx}`) === recordId
        );
        if (!found) return null;
        return {
          title: found.name || "Project",
          subtitle: found.date,
          dateRange: found.date,
          link: found.link,
          description: found.description,
          bullets: found.bullets || [],
          tools: found.techStack || [],
          raw: found,
        };
      }

      case "education": {
        const found = data.education?.find(
          (e, idx) => (e.id || `edu-${idx}`) === recordId
        );
        if (!found) return null;
        return {
          title: found.institution || "Institution",
          subtitle: `${found.degree || ""} ${found.field ? `in ${found.field}` : ""}`.trim(),
          dateRange: `${found.startDate || ""} – ${found.endDate || ""}`,
          gpa: found.gpa,
          boardOrUniversity: found.boardOrUniversity,
          level: found.level,
          description: found.academicAchievements,
          raw: found,
        };
      }

      case "certifications": {
        const found = data.certifications?.find(
          (c, idx) => (c.id || `cert-${idx}`) === recordId
        );
        if (!found) return null;
        return {
          title: found.name || "Certification",
          subtitle: found.issuer,
          dateRange: found.date,
          raw: found,
        };
      }

      case "additional": {
        const found = data.languagesKnown?.find(
          (l, idx) => (l.id || `lang-${idx}`) === recordId
        );
        if (!found) return null;
        return {
          title: found.language || "Language",
          subtitle: `Proficiency: ${found.proficiency || "Fluent"}`,
          description: found.usageContext,
          raw: found,
        };
      }

      case "skills": {
        const isTech = recordId.startsWith("tech-");
        const idx = parseInt(recordId.split("-")[1] || "0", 10);
        const name = isTech
          ? data.skills?.technical?.[idx]
          : data.skills?.soft?.[idx];
        if (!name) return null;
        return {
          title: name,
          subtitle: isTech ? "Technical Skill" : "Soft Skill",
          description: `Demonstrated capability extracted from your career history and projects.`,
          tools: [name],
          raw: { name, isTech },
        };
      }

      default:
        return null;
    }
  }, [activeResume, categoryKey, recordId]);

  return (
    <div className="min-h-screen bg-[var(--bg)] text-[var(--text-primary)] flex flex-col font-sans transition-colors">
      <Navbar />

      {/* Breadcrumb Header */}
      <section className="relative overflow-hidden border-b border-[var(--border)] bg-[var(--card)] py-8 px-6 sm:px-8">
        <div className="max-w-4xl mx-auto relative z-10 space-y-4">
          <nav className="flex items-center gap-2 text-xs text-[var(--text-muted)]">
            <Link
              href="/value"
              className="hover:text-amber-500 transition-colors inline-flex items-center gap-1 no-underline"
            >
              <span>Value</span>
            </Link>
            <span>/</span>
            <Link
              href={`/value/${categoryKey}`}
              className="hover:text-amber-500 transition-colors no-underline"
            >
              <span>{categoryMeta.label}</span>
            </Link>
            <span>/</span>
            <span className="text-[var(--text-primary)] font-bold truncate max-w-[220px]">
              {recordData?.title || "Record Details"}
            </span>
          </nav>

          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <div className="flex items-center gap-2 mb-1">
                <span className="text-[10px] font-black uppercase tracking-wider px-2 py-0.5 rounded-md bg-amber-500/15 text-amber-600 dark:text-amber-400 border border-amber-500/30 font-mono">
                  Verified Fact Dossier
                </span>
              </div>
              <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-[var(--text-primary)] font-['Syne',sans-serif]">
                {recordData?.title || "Record Details"}
              </h1>
              {recordData?.subtitle && (
                <p className="text-sm font-semibold text-[var(--text-secondary)] mt-0.5">
                  {recordData.subtitle}
                </p>
              )}
            </div>

            <div className="flex items-center gap-3">
              <Link
                href={`/value/${categoryKey}`}
                className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-semibold border border-[var(--border)] text-[var(--text-secondary)] hover:bg-[var(--bg-elevated)] transition-colors no-underline shadow-xs"
              >
                <ArrowLeft size={13} />
                <span>Back to List</span>
              </Link>

              <Link
                href={`/resume/builder?new=true#${categoryMeta.addHash}`}
                className="inline-flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-black text-brand-navy bg-amber-500 hover:bg-amber-400 transition-all shadow-md shadow-amber-500/25 no-underline active:scale-[0.98]"
              >
                <Edit3 size={13} />
                <span>Edit in Studio</span>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Main Details Workspace */}
      <main className="max-w-4xl mx-auto w-full px-6 sm:px-8 py-10 flex-1 space-y-6">
        {/* Source Distinction Banner */}
        <div className="p-4 rounded-2xl bg-blue-500/10 border border-blue-500/20 text-xs text-blue-700 dark:text-blue-300 flex items-start gap-3 shadow-xs">
          <Info size={16} className="text-blue-500 shrink-0 mt-0.5" />
          <div className="leading-relaxed">
            <strong>Substantiated Record:</strong> Information extracted directly from your verified resume. In UpRole, factual career memory is cleanly separated from synthesized AI interpretations and hypotheses.
          </div>
        </div>

        {!recordData ? (
          <div className="bg-[var(--card)] border border-[var(--border)] rounded-3xl p-8 text-center shadow-sm">
            <h2 className="text-base font-bold text-[var(--text-primary)] font-['Syne',sans-serif]">
              Record not found
            </h2>
            <p className="text-xs text-[var(--text-secondary)] mt-1">
              This record may have been modified or deleted.
            </p>
            <Link
              href={`/value/${categoryKey}`}
              className="mt-4 inline-flex items-center gap-1.5 text-xs font-bold text-amber-500 hover:underline"
            >
              <ArrowLeft size={13} />
              <span>Return to {categoryMeta.label}</span>
            </Link>
          </div>
        ) : (
          <div className="bg-[var(--card)] border border-[var(--border)] rounded-3xl p-6 sm:p-8 shadow-sm space-y-6 relative overflow-hidden">
            {/* Meta badges */}
            <div className="flex flex-wrap items-center gap-3 pb-5 border-b border-[var(--border)] text-xs">
              {recordData.dateRange && (
                <div className="flex items-center gap-1.5 text-[var(--text-secondary)] font-medium font-mono bg-[var(--bg-elevated)] px-2.5 py-1 rounded-lg border border-[var(--border)] shadow-xs">
                  <Calendar size={13} className="text-amber-500" />
                  <span>{recordData.dateRange}</span>
                </div>
              )}
              {recordData.location && (
                <div className="flex items-center gap-1.5 text-[var(--text-secondary)] font-medium bg-[var(--bg-elevated)] px-2.5 py-1 rounded-lg border border-[var(--border)] shadow-xs">
                  <MapPin size={13} className="text-blue-500" />
                  <span>{recordData.location}</span>
                </div>
              )}
              {recordData.industry && (
                <div className="flex items-center gap-1.5 text-[var(--text-secondary)] font-medium bg-[var(--bg-elevated)] px-2.5 py-1 rounded-lg border border-[var(--border)] shadow-xs">
                  <Building size={13} className="text-purple-500" />
                  <span>{recordData.industry}</span>
                </div>
              )}
              {recordData.teamSize && (
                <div className="flex items-center gap-1.5 text-[var(--text-secondary)] font-medium bg-[var(--bg-elevated)] px-2.5 py-1 rounded-lg border border-[var(--border)] shadow-xs">
                  <Users size={13} className="text-teal-500" />
                  <span>Team: {recordData.teamSize}</span>
                </div>
              )}
              {recordData.gpa && (
                <span className="px-2.5 py-1 rounded-lg bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 font-bold font-mono border border-emerald-500/20 shadow-xs">
                  GPA: {recordData.gpa}
                </span>
              )}
            </div>

            {/* Description / Overview */}
            {recordData.description && (
              <div className="space-y-2">
                <h3 className="text-xs font-bold uppercase tracking-wider text-[var(--text-muted)]">
                  Context & Overview
                </h3>
                <p className="text-xs sm:text-sm text-[var(--text-secondary)] leading-relaxed">
                  {recordData.description}
                </p>
              </div>
            )}

            {/* Responsibilities & Contributions */}
            {recordData.bullets && recordData.bullets.length > 0 && (
              <div className="space-y-3">
                <h3 className="text-xs font-bold uppercase tracking-wider text-[var(--text-muted)]">
                  Responsibilities & Stated Outcomes
                </h3>
                <ul className="space-y-2.5 text-xs sm:text-sm text-[var(--text-secondary)] pl-4 list-disc">
                  {recordData.bullets.map((bullet: string, idx: number) => (
                    <li key={idx} className="leading-relaxed">
                      {bullet}
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {/* Technologies / Tools Used */}
            {recordData.tools && recordData.tools.length > 0 && (
              <div className="space-y-2.5 pt-2 border-t border-[var(--border)]">
                <h3 className="text-xs font-bold uppercase tracking-wider text-[var(--text-muted)]">
                  Technologies & Skills
                </h3>
                <div className="flex flex-wrap gap-2">
                  {recordData.tools.map((tool: string, idx: number) => (
                    <span
                      key={idx}
                      className="px-3 py-1 rounded-xl bg-[var(--bg-elevated)] border border-[var(--border)] text-xs font-semibold text-[var(--text-primary)] shadow-xs"
                    >
                      {tool}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
      </main>
    </div>
  );
}
