import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/utils/supabase/server";
import { createAdminClient } from "@/utils/supabase/admin";
import { Resume, WorkExperience, Project } from "@/types";

export const dynamic = "force-dynamic";

export interface CapabilityEvidence {
  sourceType: "employment" | "project" | "journal";
  sourceTitle: string;
  sourceSubtitle: string;
  factText: string;
  evidenceType?: string;
}

export interface CapabilityHypothesis {
  id: string;
  name: string;
  description: string;
  confidence: "Strongly Supported" | "Supported" | "Developing";
  status: "unconfirmed" | "confirmed" | "rejected" | "modified";
  supportingEvidence: CapabilityEvidence[];
  userNote?: string;
  confirmedDate?: string;
}

export interface ImpactPattern {
  id: string;
  name: string;
  description: string;
  observedEvidence: string[];
  status: "observed" | "confirmed";
}

export interface ProgressionSignal {
  company: string;
  roles: string[];
  scopeEvolution: string;
  tenureYears: number;
}

export interface ProfileReviewLog {
  id: string;
  action: string;
  itemType: "capability" | "pattern" | "evidence";
  itemName: string;
  date: string;
  note?: string;
  status?: string;
}

export interface CareerValueProfileData {
  summaryNarrative: string;
  confirmationStatus: "Partially confirmed" | "Fully confirmed" | "Needs Review";
  itemsAwaitingReviewCount: number;
  capabilities: CapabilityHypothesis[];
  impactPatterns: ImpactPattern[];
  progression: ProgressionSignal[];
  evidenceCount: number;
  reviewLog?: ProfileReviewLog[];
}

export async function POST(req: NextRequest) {
  try {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json().catch(() => ({}));
    const { resumeId } = body;

    let resumeQuery = supabase
      .from("resumes")
      .select("*")
      .eq("user_id", user.id);

    if (resumeId) {
      resumeQuery = resumeQuery.eq("id", resumeId);
    } else {
      resumeQuery = resumeQuery.order("created_at", { ascending: false });
    }

    const { data: resumes, error } = await resumeQuery;

    if (error || !resumes || resumes.length === 0) {
      return NextResponse.json({
        profile: null,
        message: "No resume found. Upload a resume to derive Career Value.",
      });
    }

    const activeResume: Resume =
      resumes.find((r: Resume) => r.is_base_resume) || resumes[0];
    const data = activeResume.resume_data;

    const adminSupabase = createAdminClient();
    const { data: journalEntries } = await adminSupabase
      .from("career_journal_entries")
      .select("*")
      .eq("user_id", user.id)
      .order("created_at", { ascending: true });

    const journalList = Array.isArray(journalEntries) ? journalEntries : [];

    // 1. Derive Capabilities with Evidence Links
    const capabilities: CapabilityHypothesis[] = [];

    // Capability 1: Process Improvement & Automation
    const processEvidence: CapabilityEvidence[] = [];
    (data.workExperience || []).forEach((w: WorkExperience) => {
      (w.bullets || []).forEach((b: string) => {
        if (/process|workflow|pipeline|reporting|automat|efficien/i.test(b)) {
          processEvidence.push({
            sourceType: "employment",
            sourceTitle: w.company,
            sourceSubtitle: w.role,
            factText: b,
          });
        }
      });
    });

    if (processEvidence.length > 0) {
      capabilities.push({
        id: "cap-process-improvement",
        name: "Process Improvement & Workflow Automation",
        description:
          "Demonstrated ability to identify operational bottlenecks, automate manual workflows, and scale team efficiency.",
        confidence: processEvidence.length >= 2 ? "Strongly Supported" : "Supported",
        status: "unconfirmed",
        supportingEvidence: processEvidence.slice(0, 3),
      });
    }

    // Capability 2: High-Scale Technical Architecture
    const archEvidence: CapabilityEvidence[] = [];
    (data.workExperience || []).forEach((w: WorkExperience) => {
      (w.bullets || []).forEach((b: string) => {
        if (/scale|architect|concurrency|latency|microservices|distributed|system/i.test(b)) {
          archEvidence.push({
            sourceType: "employment",
            sourceTitle: w.company,
            sourceSubtitle: w.role,
            factText: b,
          });
        }
      });
    });
    (data.projects || []).forEach((p: Project) => {
      if (/concurrency|backend|scalable|api|database|cloud/i.test(p.description || "")) {
        archEvidence.push({
          sourceType: "project",
          sourceTitle: p.name,
          sourceSubtitle: "Project Architecture",
          factText: p.description || p.name,
        });
      }
    });

    if (archEvidence.length > 0) {
      capabilities.push({
        id: "cap-tech-architecture",
        name: "High-Scale Technical Architecture",
        description:
          "Architecting robust, fault-tolerant backend systems and high-throughput services with zero-downtime reliability.",
        confidence: archEvidence.length >= 2 ? "Strongly Supported" : "Supported",
        status: "unconfirmed",
        supportingEvidence: archEvidence.slice(0, 3),
      });
    }

    // Capability 3: Stakeholder Coordination & Cross-Functional Alignment
    const coordEvidence: CapabilityEvidence[] = [];
    (data.workExperience || []).forEach((w: WorkExperience) => {
      (w.bullets || []).forEach((b: string) => {
        if (/stakeholder|cross-functional|coordinated|partnered|aligned|client|collaborat/i.test(b)) {
          coordEvidence.push({
            sourceType: "employment",
            sourceTitle: w.company,
            sourceSubtitle: w.role,
            factText: b,
          });
        }
      });
    });

    if (coordEvidence.length > 0) {
      capabilities.push({
        id: "cap-stakeholder-coordination",
        name: "Stakeholder Coordination & Alignment",
        description:
          "Synthesizing technical and product roadmaps, communicating trade-offs, and coordinating cross-functional execution.",
        confidence: "Supported",
        status: "unconfirmed",
        supportingEvidence: coordEvidence.slice(0, 3),
      });
    }

    // Capability 4: Team Leadership & People Development
    const leadEvidence: CapabilityEvidence[] = [];
    (data.workExperience || []).forEach((w: WorkExperience) => {
      (w.bullets || []).forEach((b: string) => {
        if (/led|managed|mentored|hired|guided|supervised|squad/i.test(b)) {
          leadEvidence.push({
            sourceType: "employment",
            sourceTitle: w.company,
            sourceSubtitle: w.role,
            factText: b,
          });
        }
      });
    });

    if (leadEvidence.length > 0 || (data.workExperience || []).some((w) => w.teamSize && w.teamSize > 0)) {
      capabilities.push({
        id: "cap-team-leadership",
        name: "Technical Leadership & Mentorship",
        description:
          "Proven record of guiding engineering teams, conducting code reviews, unblocking delivery, and fostering engineering talent.",
        confidence: leadEvidence.length >= 2 ? "Strongly Supported" : "Supported",
        status: "unconfirmed",
        supportingEvidence: leadEvidence.slice(0, 3),
      });
    }

    // Capability 5: Commercial Impact & Value Optimization
    const bizEvidence: CapabilityEvidence[] = [];
    (data.workExperience || []).forEach((w: WorkExperience) => {
      (w.bullets || []).forEach((b: string) => {
        if (/\$|₹|revenue|cost|saved|growth|retention|conversion|roi/i.test(b)) {
          bizEvidence.push({
            sourceType: "employment",
            sourceTitle: w.company,
            sourceSubtitle: w.role,
            factText: b,
          });
        }
      });
    });

    if (bizEvidence.length > 0) {
      capabilities.push({
        id: "cap-commercial-impact",
        name: "Commercial Impact & Value Optimization",
        description:
          "Translating software capabilities into bottom-line revenue acceleration, infrastructure cost savings, and business growth.",
        confidence: "Supported",
        status: "unconfirmed",
        supportingEvidence: bizEvidence.slice(0, 3),
      });
    }

    // 2. Derive Impact Patterns
    const impactPatterns: ImpactPattern[] = [
      {
        id: "pattern-efficiency",
        name: "Operational Efficiency & Velocity",
        description:
          "Consistently eliminates manual toil and introduces automated pipelines to accelerate team and client delivery.",
        observedEvidence: processEvidence.map((e) => e.factText).slice(0, 2),
        status: "observed",
      },
      {
        id: "pattern-scale",
        name: "System Reliability at Scale",
        description:
          "Designs systems with production hardening, high concurrency tolerance, and resilient distributed data flows.",
        observedEvidence: archEvidence.map((e) => e.factText).slice(0, 2),
        status: "observed",
      },
      {
        id: "pattern-ownership",
        name: "End-to-End Execution & Ownership",
        description:
          "Takes full accountability from initial requirement gathering through deployment, monitoring, and post-launch optimization.",
        observedEvidence: coordEvidence.map((e) => e.factText).slice(0, 2),
        status: "observed",
      },
    ];

    // 3. Derive Progression Patterns
    const progression: ProgressionSignal[] = (data.workExperience || []).map((w: WorkExperience) => ({
      company: w.company || "Organization",
      roles: [w.role || "Role"],
      scopeEvolution: w.current
        ? "Active leadership and strategic ownership"
        : "Demonstrated progressive responsibility",
      tenureYears: 2,
    }));

    // 4. Synthesize Career Value Narrative
    const currentRole =
      data.workExperience?.find((w) => w.current)?.role ||
      data.workExperience?.[0]?.role ||
      "Technology Professional";
    const currentOrg =
      data.workExperience?.find((w) => w.current)?.company || "";

    // 5. Review Log & Status Hydration from Journal
    const reviewLogs: ProfileReviewLog[] = [];

    journalList.forEach((j: any) => {
      const tags = Array.isArray(j.tags) ? j.tags : [];
      if (tags.includes("Stage4Derivation") || tags.includes("PatternReview") || tags.includes("CapabilityReview")) {
        const metrics = j.extracted_metrics || {};
        const isPattern = tags.includes("PatternReview") || !!metrics.patternId;
        reviewLogs.push({
          id: j.id || String(Math.random()),
          action: metrics.action || (isPattern ? "Reviewed Pattern" : "Reviewed Capability"),
          itemType: isPattern ? "pattern" : "capability",
          itemName: metrics.patternName || metrics.capabilityName || (j.content ? j.content.slice(0, 45) : "Career Item"),
          date: j.date || j.created_at?.split("T")[0] || new Date().toISOString().split("T")[0],
          note: metrics.note || metrics.userNote || metrics.description || j.content,
          status: metrics.status || "confirmed",
        });

        // Hydrate pattern if modified or confirmed
        if (isPattern && metrics.patternId) {
          const pat = impactPatterns.find((p) => p.id === metrics.patternId);
          if (pat) {
            pat.status = "confirmed";
            if (metrics.patternName) pat.name = metrics.patternName;
            if (metrics.description) pat.description = metrics.description;
          }
        }

        // Hydrate capability if modified, confirmed, or rejected
        if (!isPattern && metrics.capabilityId) {
          const cap = capabilities.find((c) => c.id === metrics.capabilityId);
          if (cap) {
            cap.status = metrics.status || (metrics.action === "reject" ? "rejected" : "confirmed");
            if (metrics.capabilityName) cap.name = metrics.capabilityName;
            if (metrics.description) cap.description = metrics.description;
            if (metrics.userNote) cap.userNote = metrics.userNote;
          }
        }
      }
    });

    const visibleCapabilities = capabilities.filter((c) => c.status !== "rejected");
    const unconfirmedCapCount = visibleCapabilities.filter((c) => c.status === "unconfirmed").length;

    const summaryNarrative = `${currentRole} ${
      currentOrg ? `at ${currentOrg} ` : ""
    }with demonstrated capabilities in ${visibleCapabilities
      .slice(0, 3)
      .map((c) => c.name)
      .join(", ")}. Proven track record of creating value across ${impactPatterns
      .map((p) => p.name.toLowerCase())
      .join(" and ")}. Supported by user-verified career events and third-party recognition.`;

    const profile: CareerValueProfileData = {
      summaryNarrative,
      confirmationStatus:
        unconfirmedCapCount === 0
          ? "Fully confirmed"
          : reviewLogs.length > 0
          ? "Partially confirmed"
          : "Needs Review",
      itemsAwaitingReviewCount: unconfirmedCapCount,
      capabilities: visibleCapabilities,
      impactPatterns,
      progression,
      evidenceCount: journalList.length + bizEvidence.length,
      reviewLog: [...reviewLogs].reverse(),
    };

    return NextResponse.json({
      profile,
      resumeId: activeResume.id,
    });
  } catch (err: unknown) {
    console.error("Career Value Derivation error:", err);
    return NextResponse.json(
      { error: "Failed to derive Career Value Profile" },
      { status: 500 }
    );
  }
}
