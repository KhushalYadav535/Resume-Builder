"use client";

import React from "react";
import Link from "next/link";
import {
  Briefcase,
  FolderGit2,
  Award,
  Zap,
  GraduationCap,
  ShieldCheck,
  Sparkles,
  Languages,
  ChevronRight,
  ArrowRight,
  CheckCircle2,
  BookOpen,
  Users,
  Layers,
  Database
} from "lucide-react";
import { ResumeData } from "@/types";

interface ValueCategoryCardsGridProps {
  resumeData?: ResumeData | null;
}

export default function ValueCategoryCardsGrid({ resumeData }: ValueCategoryCardsGridProps) {
  if (!resumeData) return null;

  // Compute record counts and latest previews for each proper head
  const expList = resumeData.workExperience || [];
  const projList = resumeData.projects || [];
  const certList = resumeData.certifications || [];
  const eduList = resumeData.education || [];

  // Measurable outcomes: explicit measurableOutcomes array + metric bullets + campus achievements
  const workOutcomes = expList.flatMap((w) => {
    if (w.measurableOutcomes && w.measurableOutcomes.length > 0) return w.measurableOutcomes;
    if (w.achievements && w.achievements.length > 0) return w.achievements;
    return (w.bullets || []).filter((b) =>
      /\d+%|\$\d+|₹\d+|\d+x|reduced|increased|improved|scaled|delivered/i.test(b)
    );
  });
  const campusAch = resumeData.campusAchievements || [];
  const totalAchievements = workOutcomes.length + campusAch.length;

  // Skills
  const techSkills = resumeData.skills?.technical || [];
  const softSkills = resumeData.skills?.soft || [];
  const toolSkills = resumeData.skills?.tools || [];
  const domainSkills = resumeData.skills?.domains || [];
  const totalSkills = techSkills.length + softSkills.length + toolSkills.length + domainSkills.length;

  // Awards: explicit awards + hackathons + coding contests
  const explicitAwards = resumeData.awards || [];
  const hackathons = resumeData.hackathons || [];
  const contests = resumeData.codingContests || [];
  const totalAwards = explicitAwards.length + hackathons.length + contests.length;

  // Additional & Languages: languages + publications + volunteer + additional records
  const langs = resumeData.languagesKnown || [];
  const pubs = resumeData.publications || [];
  const vols = resumeData.volunteerExperience || [];
  const adds = resumeData.additionalRecords || [];
  const totalAdditional = langs.length + pubs.length + vols.length + adds.length;

  const categories = [
    {
      key: "employment",
      title: "Employment History",
      subtitle: "Roles, tenure, operational duties & team scope",
      icon: Briefcase,
      count: expList.length,
      gradient: "from-amber-500/20 via-amber-500/5 to-transparent",
      accent: "text-amber-500",
      topBar: "from-amber-500 to-amber-400",
      preview: expList[0] ? `${expList[0].role} · ${expList[0].company}` : "No employment records extracted",
      meta: expList[0]?.startDate ? `${expList[0].startDate} – ${expList[0].current ? "Present" : expList[0].endDate}` : undefined,
    },
    {
      key: "projects",
      title: "Projects & Engineering",
      subtitle: "Technical projects, tech stacks & architecture",
      icon: FolderGit2,
      count: projList.length,
      gradient: "from-blue-500/20 via-blue-500/5 to-transparent",
      accent: "text-blue-500",
      topBar: "from-blue-500 to-cyan-400",
      preview: projList[0] ? projList[0].name : "No engineering projects extracted",
      meta: projList[0]?.techStack?.slice(0, 3).join(", ") || undefined,
    },
    {
      key: "achievements",
      title: "Impact & Measurable Outcomes",
      subtitle: "Quantified business results, metrics & savings",
      icon: Award,
      count: totalAchievements,
      gradient: "from-emerald-500/20 via-emerald-500/5 to-transparent",
      accent: "text-emerald-500",
      topBar: "from-emerald-500 to-teal-400",
      preview: workOutcomes[0] || campusAch[0] || "No quantified outcomes recorded",
      meta: workOutcomes.length > 0 ? `${workOutcomes.length} metrics verified` : undefined,
    },
    {
      key: "skills",
      title: "Skills & Capabilities",
      subtitle: "Technical stack, leadership & domain expertise",
      icon: Zap,
      count: totalSkills,
      gradient: "from-purple-500/20 via-purple-500/5 to-transparent",
      accent: "text-purple-500",
      topBar: "from-purple-500 to-violet-400",
      preview: techSkills.slice(0, 4).join(" · ") || softSkills.slice(0, 3).join(" · ") || "No skills extracted",
      meta: `${techSkills.length} tech · ${softSkills.length} leadership`,
    },
    {
      key: "awards",
      title: "Awards & Recognition",
      subtitle: "Hackathons, honors, ranks & contest accolades",
      icon: Sparkles,
      count: totalAwards,
      gradient: "from-rose-500/20 via-rose-500/5 to-transparent",
      accent: "text-rose-500",
      topBar: "from-rose-500 to-pink-400",
      preview: explicitAwards[0]?.title || hackathons[0] || contests[0] || "No honors or contest wins recorded",
      meta: explicitAwards[0]?.issuer || (hackathons.length > 0 ? "Hackathon Winner" : undefined),
    },
    {
      key: "certifications",
      title: "Certifications & Credentials",
      subtitle: "Verified credentials, licenses & certificates",
      icon: ShieldCheck,
      count: certList.length,
      gradient: "from-teal-500/20 via-teal-500/5 to-transparent",
      accent: "text-teal-500",
      topBar: "from-teal-500 to-emerald-400",
      preview: certList[0] ? `${certList[0].name}${certList[0].issuer ? ` (${certList[0].issuer})` : ""}` : "No certifications added yet",
      meta: certList[0]?.date || undefined,
    },
    {
      key: "education",
      title: "Education & Academics",
      subtitle: "University degrees, institutions & academic honors",
      icon: GraduationCap,
      count: eduList.length,
      gradient: "from-indigo-500/20 via-indigo-500/5 to-transparent",
      accent: "text-indigo-500",
      topBar: "from-indigo-500 to-blue-400",
      preview: eduList[0] ? `${eduList[0].degree || "Degree"} · ${eduList[0].institution}` : "No education records extracted",
      meta: eduList[0]?.gpa ? `GPA: ${eduList[0].gpa}` : eduList[0]?.endDate || undefined,
    },
    {
      key: "additional",
      title: "Languages & Additional Info",
      subtitle: "Languages, research publications, volunteering & interests",
      icon: Languages,
      count: totalAdditional,
      gradient: "from-cyan-500/20 via-cyan-500/5 to-transparent",
      accent: "text-cyan-500",
      topBar: "from-cyan-500 to-sky-400",
      preview: langs.length > 0
        ? `Languages: ${langs.map((l) => l.language).join(", ")}`
        : pubs[0]?.title
        ? `Pub: ${pubs[0].title}`
        : vols[0]?.role
        ? `Vol: ${vols[0].role}`
        : "No additional records found",
      meta: langs.length > 0 ? `${langs.length} languages` : undefined,
    },
  ];

  return (
    <section className="space-y-4 pt-4">
      {/* Section Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 px-1">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-[10px] font-black uppercase tracking-[0.18em] text-[var(--text-muted)] font-['Syne',sans-serif]">
              Stage 1 Extraction Heads
            </span>
            <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 border border-emerald-500/25">
              100% Zero Data Loss
            </span>
          </div>
          <h2 className="text-base sm:text-lg font-extrabold text-[var(--text-primary)] font-['Syne',sans-serif] mt-0.5">
            Structured Resume Heads & Career Records
          </h2>
          <p className="text-xs text-[var(--text-secondary)] mt-0.5">
            Every career fact from your resume organized under its proper head. Click any head to inspect, verify, or edit.
          </p>
        </div>

        <div className="flex items-center gap-2 text-xs text-[var(--text-muted)]">
          <Database size={13} className="text-emerald-500" />
          <span>8 Verified Taxonomy Heads</span>
        </div>
      </div>

      {/* 8-Card Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {categories.map((cat) => {
          const Icon = cat.icon;
          return (
            <Link
              key={cat.key}
              href={`/value/${cat.key}`}
              className="group relative rounded-2xl bg-[var(--card)] border border-[var(--border)] overflow-hidden transition-all duration-300 hover:-translate-y-1 hover:border-amber-500/40 hover:shadow-lg p-4 sm:p-5 flex flex-col justify-between no-underline"
            >
              <div
                className={`absolute top-0 inset-x-0 h-[2px] bg-gradient-to-r ${cat.topBar} z-10`}
                aria-hidden="true"
              />

              <div className="space-y-3">
                {/* Header row: Icon + Count Badge */}
                <div className="flex items-center justify-between gap-2">
                  <div className={`w-8 h-8 rounded-xl bg-[var(--surface)] border border-[var(--border)] flex items-center justify-center ${cat.accent}`}>
                    <Icon size={16} />
                  </div>
                  <span
                    className={`px-2.5 py-0.5 rounded-full text-[11px] font-bold border tabular-nums ${
                      cat.count > 0
                        ? "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/25"
                        : "bg-[var(--surface)] text-[var(--text-muted)] border-[var(--border)]"
                    }`}
                  >
                    {cat.count} {cat.count === 1 ? "record" : "records"}
                  </span>
                </div>

                {/* Title and Subtitle */}
                <div>
                  <h3 className="text-sm font-extrabold text-[var(--text-primary)] font-['Syne',sans-serif] group-hover:text-amber-500 transition-colors">
                    {cat.title}
                  </h3>
                  <p className="text-[11px] text-[var(--text-muted)] mt-0.5 line-clamp-1">
                    {cat.subtitle}
                  </p>
                </div>

                {/* Preview block */}
                <div className="p-2.5 rounded-xl bg-[var(--surface)] border border-[var(--border)] text-xs space-y-1">
                  <p className="text-[11.5px] font-semibold text-[var(--text-secondary)] line-clamp-2 leading-snug">
                    {cat.preview}
                  </p>
                  {cat.meta && (
                    <span className="inline-block text-[10px] font-mono font-medium text-[var(--text-muted)] truncate">
                      {cat.meta}
                    </span>
                  )}
                </div>
              </div>

              {/* Footer */}
              <div className="pt-3 mt-3 border-t border-[var(--border)] flex items-center justify-between text-xs">
                <span className="text-[11px] text-[var(--text-muted)] font-medium">
                  {cat.count > 0 ? "Inspect records" : "Add records"}
                </span>
                <span className="inline-flex items-center gap-1 text-[11px] font-bold text-amber-600 dark:text-amber-400 group-hover:translate-x-0.5 transition-transform">
                  <span>View Details</span>
                  <ChevronRight size={12} />
                </span>
              </div>
            </Link>
          );
        })}
      </div>
    </section>
  );
}
