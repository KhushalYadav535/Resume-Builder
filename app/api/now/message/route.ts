import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/utils/supabase/server";
import { createAdminClient } from "@/utils/supabase/admin";
import { fetchOpenRouter } from "@/lib/openrouter";

export const dynamic = "force-dynamic";

export interface NowBlock {
  id: string;
  type:
    | "intent_confirmation"
    | "question"
    | "insight"
    | "evidence"
    | "capability"
    | "progress"
    | "opportunity"
    | "recommendation"
    | "decision"
    | "action"
    | "module_component";
  source?: "PULSE" | "VALUE" | "MOMENTUM" | "JOURNAL" | "NAVIGATOR" | "SYSTEM";
  title: string;
  content: string;
  confidence?: "high" | "medium" | "low";
  actions?: {
    id: string;
    label: string;
    route?: string;
    type?: "link" | "decision" | "action";
    variant?: "primary" | "secondary" | "outline";
  }[];
  metadata?: {
    componentName?:
      | "CareerSnapshotCard"
      | "ValueProfileCard"
      | "RecentProgressCard"
      | "ProofVault"
      | "PromotionCaseBuilder"
      | "SalaryBenchmarker"
      | "PrecisionJD"
      | "CareerDirectionCard";
    evidence_ids?: string[];
    statValue?: string;
    statLabel?: string;
    badge?: string;
  };
}

export interface NowResponsePayload {
  session_id: string;
  thread_id: string;
  intent: string;
  confidence: number;
  route: string;
  response: {
    type: "now_response";
    title: string;
    subtitle: string;
    blocks: NowBlock[];
  };
}

export async function POST(req: NextRequest) {
  try {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    const body = await req.json().catch(() => ({}));
    const message: string = (body.message || "").trim();
    const sessionId: string = body.session_id || `sess_${Date.now()}`;
    const threadId: string = body.thread_id || `thread_${Date.now()}`;
    const intentHint: string = body.intent_hint || "";

    if (!message && !intentHint) {
      return NextResponse.json(
        { error: "Message or intent is required." },
        { status: 400 }
      );
    }

    // 1. Fetch user career context from DB
    const adminSupabase = createAdminClient();
    let currentRole = "Product & Technology Leader";
    let companyName = "Enterprise Platforms";
    let totalYears = 8;
    let capabilities: string[] = ["Product Strategy", "System Architecture", "Leadership", "Execution"];
    let recentJournalWins: string[] = [];
    let targetRole = "Director of Product / Engineering";

    if (user) {
      const { data: resumes } = await adminSupabase
        .from("resumes")
        .select("*")
        .eq("user_id", user.id)
        .order("updated_at", { ascending: false });

      if (resumes && resumes.length > 0) {
        const baseResume = resumes.find((r: any) => r.is_base_resume) || resumes[0];
        const rData = baseResume?.resume_data || {};
        const workExp = Array.isArray(rData.workExperience) ? rData.workExperience : [];
        const skills = rData.skills || {};
        const allSkills = [...(skills.technical || []), ...(skills.soft || [])];
        if (allSkills.length > 0) capabilities = allSkills.slice(0, 5);

        const currentExp = workExp.find((w: any) => w.current) || workExp[0];
        if (currentExp?.role) currentRole = currentExp.role;
        if (currentExp?.company) companyName = currentExp.company;
        if (rData.targetRole) targetRole = rData.targetRole;
        if (workExp.length > 0) totalYears = Math.max(workExp.length * 2, 4);
      }

      const { data: journalEntries } = await adminSupabase
        .from("career_journal_entries")
        .select("title, impact")
        .eq("user_id", user.id)
        .order("created_at", { ascending: false })
        .limit(3);

      if (journalEntries && journalEntries.length > 0) {
        recentJournalWins = journalEntries.map((j: any) => j.title || j.impact).filter(Boolean);
      }
    }

    // 2. Check for external n8n Webhook
    if (process.env.N8N_NOW_WEBHOOK_URL) {
      try {
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 35000);
        const n8nRes = await fetch(process.env.N8N_NOW_WEBHOOK_URL, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            message,
            sessionId,
            threadId,
            userId: user?.id,
            careerContext: { currentRole, companyName, totalYears, capabilities, targetRole },
          }),
          signal: controller.signal,
        });
        clearTimeout(timeoutId);
        if (n8nRes.ok) {
          const rawText = await n8nRes.text();
          if (rawText && rawText.trim()) {
            const n8nData = JSON.parse(rawText);
            if (n8nData && n8nData.response?.blocks) {
              await persistNowThread(adminSupabase, user?.id, n8nData, { currentRole, companyName, totalYears, capabilities, targetRole });
              return NextResponse.json(n8nData);
            }
          }
        }
      } catch (n8nErr) {
        console.warn("n8n webhook fallback triggered:", n8nErr);
      }
    }

    // 3. Classify intent
    const textLower = `${message} ${intentHint}`.toLowerCase();
    let intent = "GENERAL_CAREER";
    let confidence = 0.94;
    let route = "GENERAL_WORKSPACE";

    if (/promo|move up|level up|climb|next level|advance|director|vp|ladder/i.test(textLower)) {
      intent = "PROMOTION";
      route = "PROMOTION_READINESS";
    } else if (/earn|salary|pay|compensation|raise|increment|underpaid|hike|package/i.test(textLower)) {
      intent = "COMPENSATION";
      route = "COMPENSATION_LEVERAGE";
    } else if (/job|opportunity|switch|market|hunt|apply|openings|roles|jd|matcher/i.test(textLower)) {
      intent = "JOB_CHANGE";
      route = "OPPORTUNITY_MATCH";
    } else if (/direction|explore|pivot|change career|unsure|confused|transition/i.test(textLower)) {
      intent = "CAREER_EXPLORATION";
      route = "DIRECTION_EXPLORATION";
    } else if (/strength|skills|capabilities|superpower|value|what am i good at|worth/i.test(textLower)) {
      intent = "CAPABILITY_DISCOVERY";
      route = "CAPABILITY_REVIEW";
    } else if (/what's next|next step|where do i go|options|guidance/i.test(textLower)) {
      intent = "CAREER_PLANNING";
      route = "TRAJECTORY_PLANNING";
    }

    // 4. Build Structured Blocks dynamically assembling components from existing menus
    let responseTitle = "Analyzing your career intent";
    let responseSubtitle = "Synthesizing your career memory across Pulse, Value, Momentum, Journal, and Navigator.";
    const blocks: NowBlock[] = [];

    if (intent === "PROMOTION") {
      responseTitle = "You want to move up.";
      responseSubtitle = `Looking at your experience at ${companyName}, you have documented momentum and core leadership signals. Let's inspect the evidence before framing your advancement case.`;

      blocks.push({
        id: "b-promo-1",
        type: "insight",
        source: "VALUE",
        title: "Leadership Scope & Scaled Execution",
        content: `Your career profile shows strong foundation in ${capabilities.slice(0, 3).join(", ")}. Over ${totalYears} years, your scope has expanded to cross-functional strategic delivery.`,
        confidence: "high",
        metadata: {
          badge: "Strong Signal",
        },
      });

      blocks.push({
        id: "b-promo-2",
        type: "module_component",
        source: "PULSE",
        title: "Current Telemetry Snapshot",
        content: "Live snapshot of your standing, evidence counts, and readiness index.",
        metadata: {
          componentName: "CareerSnapshotCard",
          statValue: `${totalYears}+ Years`,
          statLabel: currentRole,
        },
      });

      blocks.push({
        id: "b-promo-3",
        type: "module_component",
        source: "VALUE",
        title: "Verified Capabilities Profile",
        content: "Capabilities substantiated by verified career events.",
        metadata: {
          componentName: "ValueProfileCard",
        },
      });

      blocks.push({
        id: "b-promo-4",
        type: "decision",
        source: "NAVIGATOR",
        title: "One meaningful next step",
        content: "Would you like to build your executive Promotion Case now, or substantiate more leadership evidence first?",
        actions: [
          {
            id: "act-promo-build",
            label: "Build Promotion Case",
            route: "/career-copilot?tab=growth&tool=promotion",
            type: "action",
            variant: "primary",
          },
          {
            id: "act-promo-evidence",
            label: "Add Leadership Evidence in Value",
            route: "/value",
            type: "link",
            variant: "outline",
          },
        ],
      });
    } else if (intent === "COMPENSATION") {
      responseTitle = "You want to earn more.";
      responseSubtitle = `Let's assess your compensation leverage based on your verified impact at ${companyName} and current tech compensation benchmarks.`;

      blocks.push({
        id: "b-comp-1",
        type: "insight",
        source: "VALUE",
        title: "Quantified Impact Leverage",
        content: `Compensation negotiation requires demonstrable business impact. You currently have substantiated competencies in ${capabilities.slice(0, 2).join(" & ")}.`,
        confidence: "high",
      });

      blocks.push({
        id: "b-comp-2",
        type: "module_component",
        source: "NAVIGATOR",
        title: "Salary Benchmarking Engine",
        content: "Calibrate your current package against peer compensation percentiles.",
        metadata: {
          componentName: "SalaryBenchmarker",
        },
      });

      blocks.push({
        id: "b-comp-3",
        type: "decision",
        source: "NAVIGATOR",
        title: "Select your compensation path",
        content: "Are you preparing for an upcoming internal appraisal, or evaluating an external job offer?",
        actions: [
          {
            id: "act-comp-internal",
            label: "Generate Negotiation Script",
            route: "/career-copilot?tab=negotiation&tool=script",
            type: "action",
            variant: "primary",
          },
          {
            id: "act-comp-offer",
            label: "Evaluate Offer & Equity",
            route: "/career-copilot?tab=negotiation&tool=offer",
            type: "action",
            variant: "outline",
          },
        ],
      });
    } else if (intent === "JOB_CHANGE") {
      responseTitle = "Find a higher-leverage role.";
      responseSubtitle = `We will connect your Career Value to market opportunities and calibrate your positioning against target Job Descriptions.`;

      blocks.push({
        id: "b-job-1",
        type: "insight",
        source: "PULSE",
        title: "Target Role Trajectory",
        content: `Your profile is positioned for roles matching ${targetRole}. Recruiters look for direct evidence of ${capabilities[0] || "Architecture"} and execution.`,
        confidence: "high",
      });

      blocks.push({
        id: "b-job-2",
        type: "module_component",
        source: "NAVIGATOR",
        title: "Precision JD Matching & Tailoring",
        content: "Compare your resume against any target Job Description to identify keyword gaps.",
        metadata: {
          componentName: "PrecisionJD",
        },
      });

      blocks.push({
        id: "b-job-3",
        type: "decision",
        source: "MOMENTUM",
        title: "Next tactical move",
        content: "Would you like to tailor a targeted resume for an active opening, or sharpen your STAR interview pitch?",
        actions: [
          {
            id: "act-job-tailor",
            label: "Tailor Resume for Role",
            route: "/resume/builder?new=true",
            type: "action",
            variant: "primary",
          },
          {
            id: "act-job-interview",
            label: "Prepare STAR Interview Pitch",
            route: "/career-copilot?tab=interview",
            type: "link",
            variant: "outline",
          },
        ],
      });
    } else if (intent === "CAPABILITY_DISCOVERY") {
      responseTitle = "Understand your standout value.";
      responseSubtitle = "Here is what your career history substantiates as your competitive advantages.";

      blocks.push({
        id: "b-cap-1",
        type: "capability",
        source: "VALUE",
        title: "Core Differentiators",
        content: `Your proven capability stack: ${capabilities.join(" · ")}. These form the foundation of your Career Value proposition.`,
        confidence: "high",
      });

      blocks.push({
        id: "b-cap-2",
        type: "module_component",
        source: "VALUE",
        title: "Career Value Profile & Dimensions",
        content: "Explore how your capabilities translate to organizational impact.",
        metadata: {
          componentName: "ValueProfileCard",
        },
      });

      blocks.push({
        id: "b-cap-3",
        type: "module_component",
        source: "JOURNAL",
        title: "Verified Proof Vault",
        content: "Review achievements and evidence backing each capability.",
        metadata: {
          componentName: "ProofVault",
        },
      });

      blocks.push({
        id: "b-cap-4",
        type: "decision",
        source: "VALUE",
        title: "Review & Refine",
        content: "Do these capabilities accurately reflect your strengths?",
        actions: [
          {
            id: "act-cap-review",
            label: "Review Capability Details",
            route: "/value",
            type: "link",
            variant: "primary",
          },
          {
            id: "act-cap-add",
            label: "Log New Career Event",
            route: "/career-journal",
            type: "link",
            variant: "outline",
          },
        ],
      });
    } else {
      // General Career / What's Next / Exploration
      responseTitle = "You don't need to decide yet.";
      responseSubtitle = `Let's first look at what your career telemetry is already pointing toward.`;

      blocks.push({
        id: "b-gen-1",
        type: "insight",
        source: "PULSE",
        title: "Current Career Direction",
        content: `As ${currentRole} at ${companyName}, you have established authority in ${capabilities.slice(0, 2).join(" & ")}.`,
        confidence: "medium",
      });

      blocks.push({
        id: "b-gen-2",
        type: "module_component",
        source: "PULSE",
        title: "Career Direction & Possibilities",
        content: "Adjacent role trajectories calibrated to your experience.",
        metadata: {
          componentName: "CareerDirectionCard",
        },
      });

      blocks.push({
        id: "b-gen-3",
        type: "module_component",
        source: "MOMENTUM",
        title: "Recent Momentum & Movement",
        content: "Milestones and progress logged in your career record.",
        metadata: {
          componentName: "RecentProgressCard",
        },
      });

      blocks.push({
        id: "b-gen-4",
        type: "question",
        source: "SYSTEM",
        title: "What matters most right now?",
        content: "Are you looking to move up within your current domain, explore adjacent opportunities, or understand your compensation leverage?",
        actions: [
          {
            id: "act-choice-promo",
            label: "Move Up in Current Track",
            route: "/now?intent=PROMOTION",
            type: "action",
            variant: "primary",
          },
          {
            id: "act-choice-comp",
            label: "Evaluate Compensation",
            route: "/now?intent=COMPENSATION",
            type: "action",
            variant: "outline",
          },
          {
            id: "act-choice-switch",
            label: "Explore Market Roles",
            route: "/now?intent=JOB_CHANGE",
            type: "action",
            variant: "outline",
          },
        ],
      });
    }

    const payload: NowResponsePayload = {
      session_id: sessionId,
      thread_id: threadId,
      intent,
      confidence,
      route,
      response: {
        type: "now_response",
        title: responseTitle,
        subtitle: responseSubtitle,
        blocks,
      },
    };

    await persistNowThread(adminSupabase, user?.id, payload, { currentRole, companyName, totalYears, capabilities, targetRole });
    return NextResponse.json(payload);
  } catch (error: any) {
    console.error("Now Message Orchestrator error:", error);
    return NextResponse.json(
      {
        session_id: "fallback",
        thread_id: "fallback",
        intent: "GENERAL_CAREER",
        confidence: 0.8,
        route: "GENERAL_WORKSPACE",
        response: {
          type: "now_response",
          title: "Career Intent Received",
          subtitle: "We're aligning your existing career memory to this goal.",
          blocks: [
            {
              id: "b-err-fallback",
              type: "insight",
              source: "PULSE",
              title: "Career Telemetry Ready",
              content: "Your existing Pulse and Value records are active. Choose an action below to advance.",
              actions: [
                { id: "a-pulse", label: "Inspect Pulse", route: "/pulse", type: "link" },
                { id: "a-value", label: "Review Career Value", route: "/value", type: "link" },
              ],
            },
          ],
        },
      },
      { status: 200 }
    );
  }
}

async function persistNowThread(
  adminSupabase: any,
  userId: string | undefined,
  payload: NowResponsePayload,
  careerContext: any
) {
  if (!payload?.thread_id) return;
  try {
    const nowIso = new Date().toISOString();
    await adminSupabase.from("now_threads").upsert(
      {
        id: payload.thread_id,
        user_id: userId || null,
        title: payload.response?.title || "Career Intent",
        intent: payload.intent || "GENERAL_CAREER",
        status: "ACTIVE",
        current_stage: payload.route || "INTENT_DETECTED",
        updated_at: nowIso,
        last_activity_at: nowIso,
        context_snapshot: careerContext || {},
        response_snapshot: payload,
        next_action: payload.response?.blocks?.find((b: any) => b.type === "decision")?.title || null,
      },
      { onConflict: "id" }
    );
  } catch (err: any) {
    console.warn("Thread persistence note (table may not exist yet):", err.message);
  }
}
