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
  Plus,
  ArrowRight,
  ExternalLink,
  Edit3,
  Calendar,
  Layers,
  Sparkles,
  CheckCircle2,
  Trash2,
  Loader2,
  BookOpen,
  Users
} from "lucide-react";

interface RecordItem {
  id: string;
  title: string;
  subtitle?: string;
  dateRange?: string;
  badge?: string;
  description?: string;
  tags?: string[];
  bullets?: string[];
  raw?: any;
}

const CATEGORY_MAP: Record<
  string,
  { label: string; icon: any; addHash: string; emptyMessage: string; gradient: string; color: string; border: string }
> = {
  employment: {
    label: "Employment History",
    icon: Briefcase,
    addHash: "experience",
    emptyMessage: "No employment records found in your resume.",
    gradient: "from-amber-500/20 via-amber-500/5 to-transparent",
    color: "text-amber-500 bg-amber-500/15 border-amber-500/30",
    border: "border-amber-500/40",
  },
  projects: {
    label: "Projects & Engineering",
    icon: FolderGit2,
    addHash: "projects",
    emptyMessage: "No project records extracted.",
    gradient: "from-blue-500/20 via-blue-500/5 to-transparent",
    color: "text-blue-500 bg-blue-500/15 border-blue-500/30",
    border: "border-blue-500/40",
  },
  achievements: {
    label: "Impact & Measurable Outcomes",
    icon: Award,
    addHash: "experience",
    emptyMessage: "No explicit achievement records found.",
    gradient: "from-emerald-500/20 via-emerald-500/5 to-transparent",
    color: "text-emerald-500 bg-emerald-500/15 border-emerald-500/30",
    border: "border-emerald-500/40",
  },
  skills: {
    label: "Skills & Capabilities",
    icon: Zap,
    addHash: "skills",
    emptyMessage: "No skills extracted from your resume.",
    gradient: "from-purple-500/20 via-purple-500/5 to-transparent",
    color: "text-purple-500 bg-purple-500/15 border-purple-500/30",
    border: "border-purple-500/40",
  },
  awards: {
    label: "Awards & Recognition",
    icon: Sparkles,
    addHash: "achievements",
    emptyMessage: "No awards or honors recorded.",
    gradient: "from-rose-500/20 via-rose-500/5 to-transparent",
    color: "text-rose-500 bg-rose-500/15 border-rose-500/30",
    border: "border-rose-500/40",
  },
  certifications: {
    label: "Certifications & Credentials",
    icon: ShieldCheck,
    addHash: "certifications",
    emptyMessage: "No certifications added yet.",
    gradient: "from-teal-500/20 via-teal-500/5 to-transparent",
    color: "text-teal-500 bg-teal-500/15 border-teal-500/30",
    border: "border-teal-500/40",
  },
  education: {
    label: "Education & Academics",
    icon: GraduationCap,
    addHash: "education",
    emptyMessage: "No education records found.",
    gradient: "from-indigo-500/20 via-indigo-500/5 to-transparent",
    color: "text-indigo-500 bg-indigo-500/15 border-indigo-500/30",
    border: "border-indigo-500/40",
  },
  publications: {
    label: "Publications & Research",
    icon: BookOpen,
    addHash: "projects",
    emptyMessage: "No publications or research records found.",
    gradient: "from-sky-500/20 via-sky-500/5 to-transparent",
    color: "text-sky-500 bg-sky-500/15 border-sky-500/30",
    border: "border-sky-500/40",
  },
  volunteer: {
    label: "Volunteering & Leadership",
    icon: Users,
    addHash: "experience",
    emptyMessage: "No volunteering or extracurricular records found.",
    gradient: "from-emerald-600/20 via-emerald-600/5 to-transparent",
    color: "text-emerald-600 bg-emerald-600/15 border-emerald-600/30",
    border: "border-emerald-600/40",
  },
  additional: {
    label: "Languages & Additional Info",
    icon: Languages,
    addHash: "languages",
    emptyMessage: "No additional information records found.",
    gradient: "from-cyan-500/20 via-cyan-500/5 to-transparent",
    color: "text-cyan-500 bg-cyan-500/15 border-cyan-500/30",
    border: "border-cyan-500/40",
  },
};

export default function CategoryDetailsPage() {
  const params = useParams();
  const categoryKey = (params?.category as string) || "employment";
  const { user, loading: authLoading } = useAuth();
  const router = useRouter();

  const [resumes, setResumes] = useState<Resume[]>([]);
  const [selectedResumeId, setSelectedResumeId] = useState<string>("");
  const [loading, setLoading] = useState(true);

  // Delete state
  const [deleteTarget, setDeleteTarget] = useState<{ id: string; title: string } | null>(null);
  const [deleting, setDeleting] = useState(false);

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
    emptyMessage: "No records found.",
    gradient: "from-amber-500/20 to-transparent",
    color: "text-amber-500 bg-amber-500/15 border-amber-500/30",
    border: "border-amber-500/40",
  };

  const CategoryIcon = categoryMeta.icon;

  // Map category data into uniform RecordItem format
  const records: RecordItem[] = useMemo(() => {
    const data = activeResume?.resume_data;
    if (!data) return [];

    switch (categoryKey) {
      case "employment":
        return (data.workExperience || []).map((exp, idx) => ({
          id: exp.id || `exp-${idx}`,
          title: exp.company || "Company",
          subtitle: exp.role || "Role",
          dateRange: `${exp.startDate || ""} – ${exp.current ? "Present" : exp.endDate || ""}`,
          badge: exp.current ? "Current Role" : undefined,
          description: exp.contextNote,
          bullets: exp.bullets,
          tags: exp.toolsUsed,
          raw: exp,
        }));

      case "projects":
        return (data.projects || []).map((proj, idx) => ({
          id: proj.id || `proj-${idx}`,
          title: proj.name || "Project",
          subtitle: proj.date,
          dateRange: proj.date,
          description: proj.description,
          bullets: proj.bullets,
          tags: proj.techStack,
          raw: proj,
        }));

      case "achievements": {
        const campus = (data.campusAchievements || []).map((ach, idx) => ({
          id: `campus-${idx}`,
          title: ach,
          subtitle: "Academic / Campus Achievement",
          badge: "Campus",
          raw: ach,
        }));
        const workAchievements = (data.workExperience || []).flatMap((w, wIdx) => {
          const outcomes = w.measurableOutcomes || w.achievements || [];
          if (outcomes.length > 0) {
            return outcomes.map((o, oIdx) => ({
              id: `work-ach-${w.id || wIdx}-${oIdx}`,
              title: o,
              subtitle: `${w.role} at ${w.company}`,
              badge: "Measurable Outcome",
              raw: o,
            }));
          }
          return (w.bullets || [])
            .filter((b) =>
              /\d+%|\$\d+|₹\d+|\d+x|reduced|increased|improved|scaled|delivered/i.test(b)
            )
            .map((b, bIdx) => ({
              id: `work-ach-${w.id || wIdx}-${bIdx}`,
              title: b,
              subtitle: `${w.role} at ${w.company}`,
              badge: "Impact Metric",
              raw: b,
            }));
        });
        return [...campus, ...workAchievements];
      }

      case "skills": {
        const techSkills = (data.skills?.technical || []).map((sk, idx) => ({
          id: `tech-${idx}`,
          title: sk,
          subtitle: "Technical Skill",
          badge: "Technical",
          raw: sk,
        }));
        const softSkills = (data.skills?.soft || []).map((sk, idx) => ({
          id: `soft-${idx}`,
          title: sk,
          subtitle: "Soft / Leadership Skill",
          badge: "Leadership",
          raw: sk,
        }));
        const toolsSkills = (data.skills?.tools || []).map((sk, idx) => ({
          id: `tool-${idx}`,
          title: sk,
          subtitle: "Tool & Platform",
          badge: "Tool",
          raw: sk,
        }));
        return [...techSkills, ...softSkills, ...toolsSkills];
      }

      case "awards": {
        const explicitAwards = (data.awards || []).map((aw, idx) => ({
          id: aw.id || `award-${idx}`,
          title: aw.title,
          subtitle: aw.issuer || "Honors & Recognition",
          dateRange: aw.date,
          badge: aw.category || "Award",
          description: aw.description,
          raw: aw,
        }));
        const hacks = (data.hackathons || []).map((h, idx) => ({
          id: `hack-${idx}`,
          title: h,
          subtitle: "Hackathon / Competition",
          badge: "Hackathon",
          raw: h,
        }));
        const contests = (data.codingContests || []).map((c, idx) => ({
          id: `contest-${idx}`,
          title: c,
          subtitle: "Coding Contest / Contest Honor",
          badge: "Contest",
          raw: c,
        }));
        return [...explicitAwards, ...hacks, ...contests];
      }

      case "certifications":
        return (data.certifications || []).map((cert, idx) => ({
          id: cert.id || `cert-${idx}`,
          title: cert.name || "Certification",
          subtitle: cert.issuer,
          dateRange: cert.date,
          badge: "Verified Credential",
          raw: cert,
        }));

      case "education":
        return (data.education || []).map((edu, idx) => ({
          id: edu.id || `edu-${idx}`,
          title: edu.institution || "Institution",
          subtitle: `${edu.degree || ""} ${edu.field ? `in ${edu.field}` : ""}`.trim(),
          dateRange: `${edu.startDate || ""} – ${edu.endDate || ""}`,
          badge: edu.gpa ? `GPA: ${edu.gpa}` : undefined,
          description: edu.academicAchievements,
          raw: edu,
        }));

      case "publications":
        return (data.publications || []).map((pub, idx) => ({
          id: pub.id || `pub-${idx}`,
          title: pub.title,
          subtitle: pub.publisher || "Publication / Journal",
          dateRange: pub.date,
          badge: "Publication",
          description: pub.description,
          raw: pub,
        }));

      case "volunteer":
        return (data.volunteerExperience || []).map((vol, idx) => ({
          id: vol.id || `vol-${idx}`,
          title: vol.role,
          subtitle: vol.organization,
          dateRange: `${vol.startDate || ""} – ${vol.endDate || ""}`.trim(),
          badge: "Volunteer",
          description: vol.description,
          raw: vol,
        }));

      case "additional": {
        const langs = (data.languagesKnown || []).map((lang, idx) => ({
          id: lang.id || `lang-${idx}`,
          title: lang.language || "Language",
          subtitle: `Proficiency: ${lang.proficiency || "Fluent"}`,
          badge: lang.proficiency || "Language",
          description: lang.usageContext,
          raw: lang,
        }));
        const adds = (data.additionalRecords || []).map((add, idx) => ({
          id: add.id || `add-${idx}`,
          title: add.title,
          subtitle: add.category,
          badge: add.category,
          description: add.description,
          raw: add,
        }));
        const pubs = (data.publications || []).map((pub, idx) => ({
          id: pub.id || `pub-add-${idx}`,
          title: pub.title,
          subtitle: pub.publisher || "Publication",
          dateRange: pub.date,
          badge: "Publication",
          description: pub.description,
          raw: pub,
        }));
        const vols = (data.volunteerExperience || []).map((vol, idx) => ({
          id: vol.id || `vol-add-${idx}`,
          title: vol.role,
          subtitle: vol.organization,
          dateRange: `${vol.startDate || ""} – ${vol.endDate || ""}`.trim(),
          badge: "Volunteer",
          description: vol.description,
          raw: vol,
        }));
        return [...langs, ...adds, ...pubs, ...vols];
      }

      default:
        return [];
    }
  }, [activeResume, categoryKey]);

  const handleDeleteRecord = async () => {
    if (!deleteTarget || !selectedResumeId) return;
    setDeleting(true);
    try {
      const res = await fetch("/api/value/delete-record", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          resumeId: selectedResumeId,
          category: categoryKey,
          recordId: deleteTarget.id,
        }),
      });
      if (res.ok) {
        // Refresh resumes
        const refreshRes = await fetch("/api/get-resumes");
        const refreshData = await refreshRes.json();
        if (Array.isArray(refreshData)) {
          setResumes(refreshData);
        }
        setDeleteTarget(null);
      }
    } catch (err) {
      console.error("Delete error:", err);
    } finally {
      setDeleting(false);
    }
  };

  return (
    <div className="min-h-screen bg-[var(--bg)] text-[var(--text-primary)] flex flex-col font-sans transition-colors">
      <Navbar />

      {/* Header & Breadcrumbs */}
      <section className="relative overflow-hidden border-b border-[var(--border)] bg-[var(--card)] py-10 px-6 sm:px-8">
        <div className="absolute top-0 right-10 w-72 h-72 bg-amber-500/5 rounded-full blur-3xl pointer-events-none" />

        <div className="max-w-7xl mx-auto relative z-10 space-y-6">
          {/* Breadcrumb Navigation */}
          <nav className="flex items-center gap-2 text-xs text-[var(--text-muted)]">
            <Link
              href="/value"
              className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[var(--bg-elevated)] border border-[var(--border)] hover:text-amber-500 hover:border-amber-500/30 transition-colors no-underline font-medium shadow-xs"
            >
              <ChevronLeft size={14} />
              <span>Value Workspace</span>
            </Link>
            <span className="text-[var(--text-muted)]">/</span>
            <span className="text-[var(--text-primary)] font-bold px-2 py-0.5 rounded-md bg-[var(--bg-elevated)]/50">
              {categoryMeta.label}
            </span>
          </nav>

          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6">
            <div className="flex items-center gap-4">
              <div
                className={`w-14 h-14 rounded-2xl bg-gradient-to-br ${categoryMeta.gradient} border ${categoryMeta.color.split(" ")[2] || "border-amber-500/30"} flex items-center justify-center shrink-0 shadow-xs`}
              >
                <CategoryIcon size={26} className={categoryMeta.color.split(" ")[0]} />
              </div>
              <div>
                <h1 className="text-2xl sm:text-3xl lg:text-4xl font-extrabold tracking-tight text-[var(--text-primary)] font-['Syne',sans-serif]">
                  {categoryMeta.label}
                </h1>
                <p className="text-xs sm:text-sm text-[var(--text-secondary)] mt-1 flex items-center gap-2">
                  <span className="font-bold text-[var(--text-primary)] font-mono">{records.length}</span>
                  <span>{records.length === 1 ? "record" : "records"} substantiated in Career Memory</span>
                </p>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <Link
                href={`/resume/builder?new=true#${categoryMeta.addHash}`}
                className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-black text-brand-navy bg-amber-500 hover:bg-amber-400 transition-all shadow-md shadow-amber-500/25 active:scale-[0.98] no-underline"
              >
                <Plus size={14} strokeWidth={3} />
                <span>Add Record</span>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Main List Workspace */}
      <main className="max-w-7xl mx-auto w-full px-6 sm:px-8 py-10 flex-1">
        {records.length === 0 ? (
          <div className="bg-[var(--card)] border border-[var(--border)] rounded-3xl p-12 text-center max-w-lg mx-auto shadow-sm">
            <div className="w-14 h-14 rounded-2xl bg-amber-500/15 text-amber-500 flex items-center justify-center mx-auto mb-4 shadow-xs">
              <CategoryIcon size={26} />
            </div>
            <h3 className="text-lg font-bold text-[var(--text-primary)] font-['Syne',sans-serif]">
              No Records Extracted
            </h3>
            <p className="text-xs sm:text-sm text-[var(--text-secondary)] mt-2 leading-relaxed">
              {categoryMeta.emptyMessage} Add records anytime in the Resume Studio to enrich this career dimension.
            </p>
            <Link
              href={`/resume/builder?new=true#${categoryMeta.addHash}`}
              className="mt-6 inline-flex items-center gap-2 px-5 py-2.5 rounded-xl text-xs font-black text-brand-navy bg-amber-500 hover:bg-amber-400 transition-all shadow-md shadow-amber-500/25 no-underline"
            >
              <Plus size={14} strokeWidth={3} />
              <span>Add Record in Studio</span>
            </Link>
          </div>
        ) : (
          <div className="space-y-4">
            {records.map((rec) => (
              <div
                key={rec.id}
                className="relative overflow-hidden bg-[var(--card)] border border-[var(--border)] rounded-3xl p-6 sm:p-7 shadow-sm hover:border-amber-500/40 hover:shadow-md transition-all duration-300 flex flex-col justify-between group"
              >
                <div>
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-3">
                    <div className="flex items-center gap-3 flex-wrap">
                      <h2 className="text-lg sm:text-xl font-bold text-[var(--text-primary)] font-['Syne',sans-serif] group-hover:text-amber-500 transition-colors">
                        {rec.title}
                      </h2>
                      {rec.badge && (
                        <span className="text-[10px] font-bold px-2.5 py-0.5 rounded-full bg-amber-500/15 text-amber-600 dark:text-amber-400 border border-amber-500/30 uppercase font-mono shadow-xs">
                          {rec.badge}
                        </span>
                      )}
                    </div>

                    {rec.dateRange && (
                      <div className="flex items-center gap-1.5 text-xs text-[var(--text-muted)] font-mono bg-[var(--bg-elevated)] px-2.5 py-1 rounded-lg border border-[var(--border)] shadow-xs">
                        <Calendar size={13} className="text-amber-500" />
                        <span>{rec.dateRange}</span>
                      </div>
                    )}
                  </div>

                  {rec.subtitle && (
                    <div className="text-sm font-semibold text-[var(--text-secondary)] mb-3">
                      {rec.subtitle}
                    </div>
                  )}

                  {rec.description && (
                    <p className="text-xs sm:text-sm text-[var(--text-secondary)] leading-relaxed mb-3">
                      {rec.description}
                    </p>
                  )}

                  {rec.bullets && rec.bullets.length > 0 && (
                    <ul className="space-y-2 text-xs sm:text-sm text-[var(--text-secondary)] pl-4 list-disc mb-3">
                      {rec.bullets.slice(0, 3).map((bullet, bIdx) => (
                        <li key={bIdx} className="leading-relaxed">
                          {bullet}
                        </li>
                      ))}
                      {rec.bullets.length > 3 && (
                        <li className="list-none text-[11px] font-bold text-amber-500 pt-1">
                          + {rec.bullets.length - 3} more verified responsibilities
                        </li>
                      )}
                    </ul>
                  )}

                  {rec.tags && rec.tags.length > 0 && (
                    <div className="flex flex-wrap gap-1.5 mt-3">
                      {rec.tags.map((tag, tIdx) => (
                        <span
                          key={tIdx}
                          className="text-[11px] font-semibold px-2.5 py-0.5 rounded-lg bg-[var(--bg-elevated)] border border-[var(--border)] text-[var(--text-secondary)] shadow-xs"
                        >
                          {tag}
                        </span>
                      ))}
                    </div>
                  )}
                </div>

                <div className="mt-6 pt-4 border-t border-[var(--border)] flex items-center justify-between">
                  <span className="text-xs text-[var(--text-muted)] flex items-center gap-1.5">
                    <CheckCircle2 size={13} className="text-emerald-500" />
                    <span>Verified Fact</span>
                  </span>

                  <div className="flex items-center gap-3">
                    <Link
                      href={`/value/${categoryKey}/${rec.id}`}
                      className="text-xs font-bold text-amber-500 hover:text-amber-400 inline-flex items-center gap-1.5 no-underline group-hover:translate-x-0.5 transition-transform"
                    >
                      <span>View details</span>
                      <ArrowRight size={13} />
                    </Link>

                    <Link
                      href={`/resume/builder?new=true#${categoryMeta.addHash}`}
                      className="text-xs font-semibold text-[var(--text-muted)] hover:text-[var(--text-primary)] inline-flex items-center gap-1 transition-colors no-underline"
                    >
                      <Edit3 size={12} />
                      <span>Edit</span>
                    </Link>

                    <button
                      onClick={() => setDeleteTarget({ id: rec.id, title: rec.title })}
                      className="text-xs font-semibold text-[var(--text-muted)] hover:text-red-500 inline-flex items-center gap-1 cursor-pointer transition-colors"
                    >
                      <Trash2 size={12} />
                      <span>Delete</span>
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </main>

      {/* Delete Confirmation Modal */}
      {deleteTarget && (
        <div className="fixed inset-0 z-[1000] flex items-center justify-center p-4 bg-black/60 backdrop-blur-md animate-in fade-in">
          <div className="w-full max-w-md bg-[var(--card)] border border-[var(--border)] rounded-3xl shadow-2xl p-6 sm:p-7 space-y-4">
            <div className="flex items-center gap-3.5">
              <div className="w-12 h-12 rounded-2xl bg-red-500/15 text-red-500 flex items-center justify-center shrink-0 shadow-xs">
                <Trash2 size={22} />
              </div>
              <div>
                <h3 className="text-lg font-bold text-[var(--text-primary)] font-['Syne',sans-serif]">
                  Delete Record?
                </h3>
                <p className="text-xs text-[var(--text-secondary)] mt-1">
                  This will permanently remove <strong>"{deleteTarget.title}"</strong> from your career records.
                </p>
              </div>
            </div>
            <div className="flex items-center justify-end gap-3 pt-3">
              <button
                onClick={() => setDeleteTarget(null)}
                className="px-4 py-2.5 rounded-xl text-xs font-semibold border border-[var(--border)] text-[var(--text-secondary)] hover:bg-[var(--bg-elevated)] transition-colors cursor-pointer"
              >
                Cancel
              </button>
              <button
                onClick={handleDeleteRecord}
                disabled={deleting}
                className="px-4 py-2.5 rounded-xl text-xs font-bold bg-red-500 text-white hover:bg-red-600 transition-all cursor-pointer disabled:opacity-50 inline-flex items-center gap-2 shadow-md shadow-red-500/25"
              >
                {deleting ? (
                  <><Loader2 size={13} className="animate-spin" /><span>Deleting...</span></>
                ) : (
                  <><Trash2 size={13} /><span>Delete Permanently</span></>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
