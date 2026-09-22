import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/utils/supabase/server";
import { createAdminClient } from "@/utils/supabase/admin";
import { Resume, WorkExperience, Project } from "@/types";

export const dynamic = "force-dynamic";

export interface CareerGap {
  id: string;
  sourceType: "workExperience" | "project" | "skill";
  sourceId: string;
  recordTitle: string;
  recordSubtitle: string;
  originalText: string;
  gapType: "responsibility" | "activity" | "achievement" | "project" | "leadership";
  promptTitle: string;
  promptContext: string;
  whyAsking: string;
  questions: {
    step: number;
    title: string;
    subtitle: string;
    chipOptions: string[];
    allowCustomText: boolean;
    customPlaceholder?: string;
  }[];
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
      return NextResponse.json({ gaps: [] });
    }

    const activeResume: Resume =
      resumes.find((r: Resume) => r.is_base_resume) || resumes[0];
    const data = activeResume.resume_data;

    if (!data) {
      return NextResponse.json({ gaps: [] });
    }

    const adminSupabase = createAdminClient();

    // Fetch journal entries to check which bullets were already answered via Guided Impact
    const { data: journalEntries } = await adminSupabase
      .from("career_journal_entries")
      .select("*")
      .eq("user_id", user.id);

    const cleanStr = (s: string) =>
      (s || "")
        .toLowerCase()
        .replace(/[\u2018\u2019]/g, "'")
        .replace(/[\u201C\u201D]/g, '"')
        .replace(/^[•\-\*\s"']+|[•\-\*\s"'\.]+$|\s+/g, " ")
        .trim();

    const resolvedBulletSet = new Set<string>();
    (journalEntries || []).forEach((j: any) => {
      const metrics = j.extracted_metrics || {};
      if (metrics.gapId) resolvedBulletSet.add(metrics.gapId);
      if (metrics.confirmedBullet) {
        resolvedBulletSet.add(metrics.confirmedBullet.trim().toLowerCase());
        resolvedBulletSet.add(cleanStr(metrics.confirmedBullet));
      }
      if (metrics.originalText) {
        resolvedBulletSet.add(metrics.originalText.trim().toLowerCase());
        resolvedBulletSet.add(cleanStr(metrics.originalText));
      }
      if (j.content) {
        resolvedBulletSet.add(j.content.trim().toLowerCase());
        resolvedBulletSet.add(cleanStr(j.content));
        const match = j.content.match(/^(.*?)\s*\(/);
        if (match) {
          resolvedBulletSet.add(match[1].trim().toLowerCase());
          resolvedBulletSet.add(cleanStr(match[1]));
        }
      }
    });

    const detectedGaps: CareerGap[] = [];

    // 1. Scan Work Experiences for responsibilities without quantified outcomes
    (data.workExperience || []).forEach((exp: WorkExperience, expIdx: number) => {
      const bullets = exp.bullets || [];
      bullets.forEach((bullet: string, bIdx: number) => {
        const cleanedBullet = cleanStr(bullet);
        const gapKey = `gap-exp-${expIdx}-${bIdx}`;

        // Check if already answered in Career Journal or already has Guided Impact rewrite format
        const isAlreadyAnswered =
          resolvedBulletSet.has(bullet.trim().toLowerCase()) ||
          resolvedBulletSet.has(cleanedBullet) ||
          resolvedBulletSet.has(gapKey) ||
          Array.from(resolvedBulletSet).some(
            (r) =>
              r.length > 20 &&
              (cleanedBullet.includes(r) || r.includes(cleanedBullet))
          ) ||
          /resulting in|addressed.*resulting in|impacted thousands|impacted millions/i.test(bullet);

        if (isAlreadyAnswered) {
          return; // Skip already answered bullet
        }

        const isQuantified =
          /\d+%|\$\d+|₹\d+|\d+x|reduced by|increased by|improved by|resulting in|impacted|thousands of|millions of|\d+k|\d+ users|saved \d+/i.test(
            bullet
          );

        // If bullet lacks explicit quantification or is vague
        if (!isQuantified && bullet.trim().length > 15) {
          const isLeadership = /led|managed|headed|supervised|directed/i.test(bullet);
          const isProcess = /process|system|workflow|pipeline|reporting/i.test(bullet);

          if (isProcess) {
            detectedGaps.push({
              id: `gap-exp-${expIdx}-${bIdx}`,
              sourceType: "workExperience",
              sourceId: exp.id || `exp-${expIdx}`,
              recordTitle: exp.role || "Role",
              recordSubtitle: exp.company || "Company",
              originalText: bullet,
              gapType: "activity",
              promptTitle: "Help us understand your contribution",
              promptContext: `Your resume mentions: "${bullet}" at ${exp.company}. We'd like to understand what changed because of your work.`,
              whyAsking:
                "Uncovering the problem and resulting change demonstrates high-value initiative and measurable business impact.",
              questions: [
                {
                  step: 1,
                  title: "What problem did this solve?",
                  subtitle: "Select the primary friction or challenge you tackled:",
                  chipOptions: [
                    "Reduced manual effort & repetitive work",
                    "Improved accuracy and reduced error rate",
                    "Reduced turnaround time for clients/team",
                    "Improved compliance, auditability or control",
                    "Eliminated system bottlenecks",
                    "Solved a different problem",
                  ],
                  allowCustomText: true,
                  customPlaceholder: "Or describe the problem in a few words...",
                },
                {
                  step: 2,
                  title: "What was your personal ownership?",
                  subtitle: "How did you drive this initiative?",
                  chipOptions: [
                    "Owned the initiative end-to-end",
                    "Led the technical implementation",
                    "Coordinated cross-functional stakeholders",
                    "Conceived the initial proposal & design",
                    "Executed core components with the team",
                  ],
                  allowCustomText: false,
                },
                {
                  step: 3,
                  title: "What changed after implementation?",
                  subtitle: "Estimate the approximate impact or outcome:",
                  chipOptions: [
                    "Saved ~5 to 10+ hours per week",
                    "50%+ faster processing or turnaround",
                    "Zero error rate / zero downtime",
                    "Adopted across multiple teams / company-wide",
                    "Significantly improved stakeholder satisfaction",
                  ],
                  allowCustomText: true,
                  customPlaceholder: "e.g. Reduced latency by 40%...",
                },
              ],
            });
          } else if (isLeadership) {
            detectedGaps.push({
              id: `gap-exp-${expIdx}-${bIdx}`,
              sourceType: "workExperience",
              sourceId: exp.id || `exp-${expIdx}`,
              recordTitle: exp.role || "Role",
              recordSubtitle: exp.company || "Company",
              originalText: bullet,
              gapType: "leadership",
              promptTitle: "Help us understand your leadership scope",
              promptContext: `Your resume mentions: "${bullet}" at ${exp.company}. We'd like to capture your team scope and outcomes.`,
              whyAsking:
                "Documenting team size, mentorship, and delivery outcomes establishes executive leadership readiness.",
              questions: [
                {
                  step: 1,
                  title: "What was the scale of your leadership?",
                  subtitle: "Select the scope of people or functions supported:",
                  chipOptions: [
                    "Directly led 3 to 8 engineers / reports",
                    "Cross-functional squad (Product, Design, QA)",
                    "Mentored junior engineers & interns",
                    "Led multiple pods / teams across locations",
                  ],
                  allowCustomText: true,
                  customPlaceholder: "e.g. Led 12 distributed developers...",
                },
                {
                  step: 2,
                  title: "What was your key leadership contribution?",
                  subtitle: "How did you help the team succeed?",
                  chipOptions: [
                    "Architectural direction & code standards",
                    "Unblocking delivery & sprint management",
                    "Hiring, interviewing & team scaling",
                    "Stakeholder alignment & executive updates",
                  ],
                  allowCustomText: false,
                },
                {
                  step: 3,
                  title: "What was the resulting team outcome?",
                  subtitle: "Select the primary outcome achieved:",
                  chipOptions: [
                    "Delivered key company milestone on time",
                    "Zero attrition / high team retention",
                    "Promoted 2+ team members",
                    "Increased sprint velocity by 30%+",
                  ],
                  allowCustomText: true,
                  customPlaceholder: "e.g. Delivered MVP 3 weeks ahead...",
                },
              ],
            });
          } else {
            detectedGaps.push({
              id: `gap-exp-${expIdx}-${bIdx}`,
              sourceType: "workExperience",
              sourceId: exp.id || `exp-${expIdx}`,
              recordTitle: exp.role || "Role",
              recordSubtitle: exp.company || "Company",
              originalText: bullet,
              gapType: "responsibility",
              promptTitle: "What changed because of this work?",
              promptContext: `In your role as ${exp.role} at ${exp.company}, you noted: "${bullet}".`,
              whyAsking:
                "Translating daily responsibilities into tangible business outcomes differentiates you from peers.",
              questions: [
                {
                  step: 1,
                  title: "What was the main outcome or impact?",
                  subtitle: "Choose the closest result from your work:",
                  chipOptions: [
                    "Increased efficiency or output",
                    "Delivered mission-critical feature/service",
                    "Improved reliability or performance",
                    "Satisfied key client or stakeholder requests",
                    "Reduced operational overhead",
                  ],
                  allowCustomText: true,
                  customPlaceholder: "Describe what changed...",
                },
                {
                  step: 2,
                  title: "What was your contribution level?",
                  subtitle: "Select your individual involvement:",
                  chipOptions: [
                    "Primary owner / author",
                    "Key contributor in core engineering",
                    "Collaborated with cross-functional team",
                    "Reviewed, optimized and deployed",
                  ],
                  allowCustomText: false,
                },
                {
                  step: 3,
                  title: "Any approximate scale or metric?",
                  subtitle: "Approximate figures strengthen your career proof:",
                  chipOptions: [
                    "Impacted thousands of daily active users",
                    "Handled millions of requests/events",
                    "Completed within tight deadline",
                    "Direct feedback from leadership",
                  ],
                  allowCustomText: true,
                  customPlaceholder: "e.g. 99.9% uptime, 10k users...",
                },
              ],
            });
          }
        }
      });
    });

    // 2. Scan Projects for unquantified outcomes
    (data.projects || []).forEach((proj: Project, projIdx: number) => {
      const isAlreadyAnswered =
        resolvedBulletSet.has((proj.name || "").trim().toLowerCase()) ||
        (proj.description && resolvedBulletSet.has(proj.description.trim().toLowerCase()));

      if (isAlreadyAnswered) {
        return;
      }

      const isQuantified =
        /\d+%|\$\d+|₹\d+|\d+x|users|adoption|stars|downloads/i.test(
          proj.description || ""
        );

      if (!isQuantified && proj.name) {
        detectedGaps.push({
          id: `gap-proj-${projIdx}`,
          sourceType: "project",
          sourceId: proj.id || `proj-${projIdx}`,
          recordTitle: proj.name,
          recordSubtitle: "Project Deliverable",
          originalText: proj.description || proj.name,
          gapType: "project",
          promptTitle: "What was the impact of this project?",
          promptContext: `You built "${proj.name}". We'd like to uncover user adoption, production scale, or technical outcomes.`,
          whyAsking:
            "Projects that show real adoption or solved real constraints carry 3x more weight in hiring discussions.",
          questions: [
            {
              step: 1,
              title: "Who used or benefited from this project?",
              subtitle: "Select target users or audience:",
              chipOptions: [
                "Internal engineering & operations teams",
                "End consumers / public web users",
                "Enterprise clients / B2B customers",
                "Open source community",
              ],
              allowCustomText: true,
              customPlaceholder: "e.g. 50+ internal analysts...",
            },
            {
              step: 2,
              title: "What technical challenge did you solve?",
              subtitle: "Highlight the core difficulty:",
              chipOptions: [
                "High concurrency & low latency requirements",
                "Complex distributed system integration",
                "Modernized legacy code into modern stack",
                "Implemented secure authentication & data flow",
              ],
              allowCustomText: false,
            },
            {
              step: 3,
              title: "What was the resulting milestone?",
              subtitle: "How was success measured?",
              chipOptions: [
                "Successfully deployed to production",
                "Achieved 100% test coverage & zero regressions",
                "Adopted as internal standard tool",
                "Received positive user / stakeholder reviews",
              ],
              allowCustomText: true,
              customPlaceholder: "e.g. 10k downloads, adopted company-wide...",
            },
          ],
        });
      }
    });

    // Prioritize top 5 gaps
    const prioritized = detectedGaps.slice(0, 5);

    return NextResponse.json({
      gaps: prioritized,
      totalGaps: detectedGaps.length,
      resumeId: activeResume.id,
    });
  } catch (err: unknown) {
    console.error("Gap detection error:", err);
    return NextResponse.json(
      { error: "Failed to detect career gaps" },
      { status: 500 }
    );
  }
}
