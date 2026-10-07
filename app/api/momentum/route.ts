import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/utils/supabase/server";
import { createAdminClient } from "@/utils/supabase/admin";
import { EMPTY_MOMENTUM_DATA, deriveMomentumFromRealProfile } from "@/lib/momentumData";
import {
  MomentumDashboardData,
  CareerDirection,
  CareerGoal,
  CareerPriority,
  GoalMilestone,
  SuggestedDirection,
} from "@/types/momentum";

export const dynamic = "force-dynamic";

function isValidUUID(id: string | null | undefined): boolean {
  return typeof id === "string" && /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(id);
}

export async function GET(req: NextRequest) {
  try {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    // If user is not authenticated, return empty state with zero mock data
    if (!user) {
      return NextResponse.json(EMPTY_MOMENTUM_DATA);
    }

    const admin = createAdminClient();

    // 1. Fetch user directions from DB
    let directions: any[] = [];
    try {
      const { data: d } = await admin
        .from("career_directions")
        .select("*")
        .eq("user_id", user.id)
        .order("updated_at", { ascending: false });
      directions = d || [];
    } catch (e) {
      // Table may not exist yet in schema cache
    }

    // 2. Fetch user goals from DB
    let goals: any[] = [];
    try {
      const { data: g } = await admin
        .from("career_goals")
        .select("*")
        .eq("user_id", user.id)
        .order("created_at", { ascending: false });
      goals = g || [];
    } catch (e) {
      // Table may not exist yet in schema cache
    }

    // 3. Fetch user priorities from DB
    let priorities: any[] = [];
    try {
      const { data: p } = await admin
        .from("career_priorities")
        .select("*")
        .eq("user_id", user.id)
        .order("created_at", { ascending: true });
      priorities = p || [];
    } catch (e) {
      // Table may not exist yet in schema cache
    }

    // 4. Check for real saved snapshot in career_journal_entries if tables are not yet created
    let savedSnapshot: MomentumDashboardData | null = null;
    try {
      const { data: snapshots } = await admin
        .from("career_journal_entries")
        .select("content")
        .eq("user_id", user.id)
        .contains("tags", ["momentum_state"])
        .order("updated_at", { ascending: false })
        .limit(1);

      if (snapshots && snapshots.length > 0 && snapshots[0].content) {
        try {
          savedSnapshot = JSON.parse(snapshots[0].content);
        } catch (e) {
          // Ignore invalid JSON
        }
      }
    } catch (e) {}

    // If user has saved momentum snapshot, return their real saved state directly
    if (directions.length === 0 && goals.length === 0 && savedSnapshot) {
      return NextResponse.json(savedSnapshot);
    }

    // 5. Fetch candidate's real base resume from Supabase database
    const { data: resumes } = await admin
      .from("resumes")
      .select("*")
      .eq("user_id", user.id)
      .order("updated_at", { ascending: false });

    const baseResume = resumes?.find((r: any) => r.is_base_resume) || resumes?.[0];

    // 6. Fetch user's real career journal entries
    const { data: journalEntries } = await admin
      .from("career_journal_entries")
      .select("*")
      .eq("user_id", user.id)
      .order("created_at", { ascending: false });

    // If user has NO directions or goals created yet:
    if (directions.length === 0 && goals.length === 0) {
      // Synthesize directly from candidate's real resume & background
      if (baseResume && baseResume.resume_data) {
        const realProfileMomentum = deriveMomentumFromRealProfile(
          user,
          baseResume.resume_data,
          journalEntries || []
        );
        return NextResponse.json(realProfileMomentum);
      }

      // If user has no resume uploaded either, return supportive empty state
      return NextResponse.json(EMPTY_MOMENTUM_DATA);
    }

    // Format saved direction
    let userDirection: CareerDirection | null = null;
    if (directions.length > 0) {
      const d = directions[0];
      userDirection = {
        id: d.id,
        userId: d.user_id,
        title: d.title,
        description: d.description || "",
        currentPath: d.current_path || "",
        targetPath: d.target_path || "",
        fullTrajectory: d.full_trajectory && d.full_trajectory.length > 0
          ? d.full_trajectory
          : [d.current_path || "Current", d.target_path || d.title],
        status: d.status || "Active",
        source: d.source || "User Confirmed",
        createdAt: d.created_at,
        updatedAt: d.updated_at,
      };
    }

    // Fetch milestones for all user goals
    const goalIds = goals.map((g) => g.id).filter(isValidUUID);
    let allMilestones: any[] = [];
    if (goalIds.length > 0) {
      try {
        const { data: ms } = await admin
          .from("goal_milestones")
          .select("*")
          .in("goal_id", goalIds)
          .order("created_at", { ascending: true });
        allMilestones = ms || [];
      } catch (e) {}
    }

    // Format goals
    let activeGoal: CareerGoal | null = null;
    const otherGoals: CareerGoal[] = [];

    for (const g of goals) {
      const gMilestones: GoalMilestone[] = allMilestones
        .filter((m) => m.goal_id === g.id)
        .map((m) => ({
          id: m.id,
          title: m.title,
          completed: Boolean(m.completed),
          stage: m.stage || "strategy",
          completedAt: m.completed_at ? m.completed_at.split("T")[0] : undefined,
          sourceType: m.source_type || undefined,
          evidenceSnippet: m.evidence_snippet || undefined,
        }));

      const formattedGoal: CareerGoal = {
        id: g.id,
        userId: g.user_id,
        title: g.title,
        targetRole: g.target_role || g.title,
        currentRole: g.current_role || (baseResume?.resume_data?.workExperience?.[0]?.role || ""),
        targetHorizon: g.target_horizon || "6–12 months",
        goalType: g.goal_type || "Role Change",
        status: g.status || "Active",
        isPrimary: Boolean(g.is_primary),
        stage: g.stage || "target",
        objective: g.objective || undefined,
        strategyOverview: g.strategy_overview || undefined,
        milestones: gMilestones,
        reasonSummary: g.reason_summary,
        supportingEvidence: g.supporting_evidence || [],
        createdAt: g.created_at,
        updatedAt: g.updated_at,
      };

      if (g.is_primary && !activeGoal) {
        activeGoal = formattedGoal;
      } else {
        otherGoals.push(formattedGoal);
      }
    }

    if (!activeGoal && otherGoals.length > 0) {
      activeGoal = otherGoals.shift()!;
      activeGoal.isPrimary = true;
    }

    // Format priorities
    let userPriorities: CareerPriority[] = EMPTY_MOMENTUM_DATA.priorities;
    if (priorities.length > 0) {
      userPriorities = priorities.map((p) => ({
        id: p.id,
        userId: p.user_id,
        type: p.type,
        label: p.label,
        importance: p.importance || "high",
        preference: p.preference || undefined,
        source: p.source || "User Selected",
        selected: Boolean(p.selected),
      }));
    }

    // Milestones progress for active goal
    const milestonesList: GoalMilestone[] = activeGoal ? activeGoal.milestones : [];
    const completedCount = milestonesList.filter((m: GoalMilestone) => m.completed).length;

    // Build real suggested directions derived from user's actual resume
    let dynamicSuggestedDirections: SuggestedDirection[] = [];
    if (baseResume && baseResume.resume_data) {
      const derived = deriveMomentumFromRealProfile(user, baseResume.resume_data, journalEntries || []);
      dynamicSuggestedDirections = derived.suggestedDirections;
    }

    const dynamicWhyThisGoal = {
      summary: activeGoal?.reasonSummary || `Targeting ${activeGoal?.targetRole || "your objective"} aligns with your professional background and momentum.`,
      experienceFactors: [
        `Aligned with current background as ${activeGoal?.currentRole || userDirection?.currentPath || "Professional"}`,
        `Focusing on target milestone progression toward ${activeGoal?.targetRole || "Target Role"}`,
      ],
      priorityAlignment: userPriorities
        .filter((p) => p.selected)
        .slice(0, 3)
        .map((p) => `Directly advances your stated priority of ${p.label}.`),
      supportingEvidence: activeGoal?.supportingEvidence || [],
    };

    const aggregateResponse: MomentumDashboardData = {
      direction: userDirection,
      activeGoal: activeGoal,
      whyThisGoal: dynamicWhyThisGoal,
      priorities: userPriorities,
      progress: {
        completedMilestones: completedCount,
        totalMilestones: milestonesList.length,
        milestones: milestonesList,
      },
      otherGoals,
      suggestedDirections: dynamicSuggestedDirections,
    };

    return NextResponse.json(aggregateResponse);
  } catch (error) {
    console.error("Error in GET /api/momentum:", error);
    return NextResponse.json(EMPTY_MOMENTUM_DATA);
  }
}

export async function POST(req: NextRequest) {
  try {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    const body: MomentumDashboardData = await req.json();

    if (user) {
      const admin = createAdminClient();

      // 1. Upsert direction if provided
      if (body.direction) {
        const directionPayload: any = {
          user_id: user.id,
          title: body.direction.title,
          description: body.direction.description,
          current_path: body.direction.currentPath,
          target_path: body.direction.targetPath,
          full_trajectory: body.direction.fullTrajectory,
          status: body.direction.status || "Active",
          source: body.direction.source || "User Confirmed",
          updated_at: new Date().toISOString(),
        };

        let targetDirectionId = isValidUUID(body.direction.id) ? body.direction.id : undefined;
        if (!targetDirectionId) {
          const { data: existingDirs } = await admin
            .from("career_directions")
            .select("id")
            .eq("user_id", user.id)
            .limit(1);
          if (existingDirs && existingDirs.length > 0) {
            targetDirectionId = existingDirs[0].id;
          }
        }

        if (targetDirectionId) {
          directionPayload.id = targetDirectionId;
        }

        await admin.from("career_directions").upsert(directionPayload);
      }

      // 2. Upsert active goal if provided
      if (body.activeGoal) {
        // Demote other goals to not primary
        await admin
          .from("career_goals")
          .update({ is_primary: false })
          .eq("user_id", user.id);

        const goalPayload: any = {
          user_id: user.id,
          title: body.activeGoal.title,
          target_role: body.activeGoal.targetRole || body.activeGoal.title,
          current_role: body.activeGoal.currentRole,
          target_horizon: body.activeGoal.targetHorizon || "6–12 months",
          goal_type: body.activeGoal.goalType || "Role Change",
          status: body.activeGoal.status || "Active",
          is_primary: true,
          stage: body.activeGoal.stage || "target",
          objective: body.activeGoal.objective || null,
          strategy_overview: body.activeGoal.strategyOverview || null,
          reason_summary: body.activeGoal.reasonSummary,
          supporting_evidence: body.activeGoal.supportingEvidence || [],
          updated_at: new Date().toISOString(),
        };

        let targetGoalId = isValidUUID(body.activeGoal.id) ? body.activeGoal.id : undefined;
        if (!targetGoalId) {
          const { data: existingGoals } = await admin
            .from("career_goals")
            .select("id")
            .eq("user_id", user.id)
            .eq("is_primary", true)
            .limit(1);
          if (existingGoals && existingGoals.length > 0) {
            targetGoalId = existingGoals[0].id;
          }
        }

        if (targetGoalId) {
          goalPayload.id = targetGoalId;
        }

        const { data: savedGoal } = await admin
          .from("career_goals")
          .upsert(goalPayload)
          .select()
          .single();

        // Upsert milestones for active goal (clean replacement to eliminate duplicates)
        if (savedGoal && body.activeGoal.milestones) {
          await admin.from("goal_milestones").delete().eq("goal_id", savedGoal.id);
          for (const m of body.activeGoal.milestones) {
            const milestonePayload: any = {
              goal_id: savedGoal.id,
              user_id: user.id,
              title: m.title,
              completed: Boolean(m.completed),
              stage: m.stage || "strategy",
              source_type: m.sourceType || "Milestone",
              evidence_snippet: m.evidenceSnippet || null,
              completed_at: m.completedAt || (m.completed ? new Date().toISOString() : null),
            };
            await admin.from("goal_milestones").insert(milestonePayload);
          }
        }
      }

      // 3. Upsert priorities if provided
      if (body.priorities && Array.isArray(body.priorities)) {
        for (const p of body.priorities) {
          const priorityPayload: any = {
            user_id: user.id,
            type: p.type,
            label: p.label,
            importance: p.importance || "high",
            preference: p.preference || null,
            source: p.source || "User Selected",
            selected: Boolean(p.selected),
            updated_at: new Date().toISOString(),
          };
          if (isValidUUID(p.id)) {
            priorityPayload.id = p.id;
          }
          await admin
            .from("career_priorities")
            .upsert(priorityPayload, { onConflict: "user_id,type" });
        }
      }

      // 4. Upsert other secondary goals if provided
      if (body.otherGoals && Array.isArray(body.otherGoals)) {
        for (const og of body.otherGoals) {
          const ogPayload: any = {
            user_id: user.id,
            title: og.title,
            target_role: og.targetRole || og.title,
            current_role: og.currentRole,
            target_horizon: og.targetHorizon || "6–12 months",
            goal_type: og.goalType || "Role Change",
            status: og.status || "Active",
            is_primary: false,
            stage: og.stage || "direction",
            objective: og.objective || null,
            strategy_overview: og.strategyOverview || null,
            reason_summary: og.reasonSummary,
            supporting_evidence: og.supportingEvidence || [],
            updated_at: new Date().toISOString(),
          };

          let ogId = isValidUUID(og.id) ? og.id : undefined;
          if (!ogId) {
            const { data: existingOg } = await admin
              .from("career_goals")
              .select("id")
              .eq("user_id", user.id)
              .eq("title", og.title)
              .limit(1);
            if (existingOg && existingOg.length > 0) {
              ogId = existingOg[0].id;
            }
          }

          if (ogId) {
            ogPayload.id = ogId;
          }

          await admin.from("career_goals").upsert(ogPayload);
        }
      }

      // 5. Always persist state snapshot to career_journal_entries to guarantee zero data loss
      try {
        const { data: existingSnapshots } = await admin
          .from("career_journal_entries")
          .select("id")
          .eq("user_id", user.id)
          .contains("tags", ["momentum_state"])
          .limit(1);

        if (existingSnapshots && existingSnapshots.length > 0) {
          await admin
            .from("career_journal_entries")
            .update({
              content: JSON.stringify(body),
              updated_at: new Date().toISOString(),
            })
            .eq("id", existingSnapshots[0].id);
        } else {
          await admin.from("career_journal_entries").insert({
            user_id: user.id,
            entry_type: "win",
            content: JSON.stringify(body),
            source: "manual",
            tags: ["momentum_state"],
          });
        }
      } catch (snapErr) {
        console.warn("Could not save snapshot to journal entries:", snapErr);
      }
    }

    return NextResponse.json({ success: true, data: body });
  } catch (error: any) {
    console.error("Error in POST /api/momentum:", error);
    return NextResponse.json({ error: error.message || "Failed to update" }, { status: 500 });
  }
}
