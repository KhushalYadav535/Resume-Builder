import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/utils/supabase/server";
import { createAdminClient } from "@/utils/supabase/admin";
import { getDefaultMilestonesForGoalType } from "@/lib/momentumData";
import { CareerGoal, GoalMilestone, GoalType } from "@/types/momentum";

export const dynamic = "force-dynamic";

function isValidUUID(id: string | null | undefined): boolean {
  return typeof id === "string" && /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(id);
}

export async function GET(req: NextRequest) {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    const statusParam = req.nextUrl.searchParams.get("status");
    const isPrimaryParam = req.nextUrl.searchParams.get("isPrimary");

    if (user) {
      const admin = createAdminClient();
      let query = admin
        .from("career_goals")
        .select("*")
        .eq("user_id", user.id);

      if (statusParam) {
        query = query.eq("status", statusParam);
      }
      if (isPrimaryParam !== null && isPrimaryParam !== undefined) {
        query = query.eq("is_primary", isPrimaryParam === "true");
      }

      const { data: goals } = await query.order("created_at", { ascending: false });

      if (goals && goals.length > 0) {
        const goalIds = goals.map((g) => g.id).filter(isValidUUID);
        let allMilestones: any[] = [];
        if (goalIds.length > 0) {
          const { data: ms } = await admin
            .from("goal_milestones")
            .select("*")
            .in("goal_id", goalIds)
            .order("created_at", { ascending: true });
          allMilestones = ms || [];
        }

        const formattedGoals: CareerGoal[] = goals.map((g) => {
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

          return {
            id: g.id,
            userId: g.user_id,
            title: g.title,
            targetRole: g.target_role || g.title,
            currentRole: g.current_role || "",
            targetHorizon: g.target_horizon || "6–12 months",
            goalType: g.goal_type || "Role Change",
            status: g.status || "Active",
            isPrimary: Boolean(g.is_primary),
            stage: g.stage || "target",
            objective: g.objective || undefined,
            strategyOverview: g.strategy_overview || undefined,
            milestones: gMilestones,
            reasonSummary: g.reason_summary || undefined,
            supportingEvidence: g.supporting_evidence || [],
            createdAt: g.created_at,
            updatedAt: g.updated_at,
          };
        });

        const activeGoal = formattedGoals.find((g) => g.isPrimary) || formattedGoals[0];
        const otherGoals = formattedGoals.filter((g) => g.id !== activeGoal.id);
        return NextResponse.json({ activeGoal, otherGoals });
      }
    }

    // Check saved snapshot in career_journal_entries
    if (user) {
      try {
        const admin = createAdminClient();
        const { data: snapshots } = await admin
          .from("career_journal_entries")
          .select("content")
          .eq("user_id", user.id)
          .contains("tags", ["momentum_state"])
          .limit(1);

        if (snapshots && snapshots.length > 0 && snapshots[0].content) {
          const parsed = JSON.parse(snapshots[0].content);
          return NextResponse.json({
            activeGoal: parsed.activeGoal || null,
            otherGoals: parsed.otherGoals || [],
          });
        }
      } catch (e) {}
    }

    return NextResponse.json({
      activeGoal: null,
      otherGoals: [],
    });
  } catch (err: any) {
    return NextResponse.json({
      activeGoal: null,
      otherGoals: [],
    });
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    let createdGoalId = `goal-${Date.now()}`;

    if (user) {
      const admin = createAdminClient();

      if (body.isPrimary) {
        // Demote previous primary goals
        await admin
          .from("career_goals")
          .update({ is_primary: false })
          .eq("user_id", user.id);
      }

      const { data: goalData, error } = await admin
        .from("career_goals")
        .insert({
          user_id: user.id,
          title: body.title,
          target_role: body.targetRole || body.title,
          current_role: body.currentRole || "",
          target_horizon: body.targetHorizon || "6–12 months",
          goal_type: body.goalType || "Role Change",
          status: body.status || "Active",
          is_primary: Boolean(body.isPrimary),
          stage: body.stage || "direction",
          objective: body.objective || null,
          strategy_overview: body.strategyOverview || null,
          reason_summary: body.reasonSummary || "",
          supporting_evidence: body.supportingEvidence || [],
        })
        .select()
        .single();

      if (!error && goalData) {
        createdGoalId = goalData.id;
        const defaultMilestones = body.milestones && body.milestones.length > 0
          ? body.milestones
          : getDefaultMilestonesForGoalType(
              (body.goalType as GoalType) || "Role Change",
              body.targetRole || body.title
            );

        const insertedMilestones: GoalMilestone[] = [];
        for (const m of defaultMilestones) {
          const { data: mData } = await admin
            .from("goal_milestones")
            .insert({
              goal_id: goalData.id,
              user_id: user.id,
              title: m.title,
              completed: Boolean(m.completed),
              stage: m.stage || "strategy",
              source_type: m.sourceType || "Milestone",
              evidence_snippet: m.evidenceSnippet || null,
            })
            .select()
            .single();

          if (mData) {
            insertedMilestones.push({
              id: mData.id,
              title: mData.title,
              completed: Boolean(mData.completed),
              stage: mData.stage,
              completedAt: mData.completed_at,
              sourceType: mData.source_type,
              evidenceSnippet: mData.evidence_snippet,
            });
          }
        }

        const completeGoal: CareerGoal = {
          id: goalData.id,
          userId: goalData.user_id,
          title: goalData.title,
          targetRole: goalData.target_role,
          currentRole: goalData.current_role,
          targetHorizon: goalData.target_horizon,
          goalType: goalData.goal_type,
          status: goalData.status,
          isPrimary: Boolean(goalData.is_primary),
          stage: goalData.stage,
          milestones: insertedMilestones,
          reasonSummary: goalData.reason_summary,
          supportingEvidence: goalData.supporting_evidence,
          createdAt: goalData.created_at,
          updatedAt: goalData.updated_at,
        };

        return NextResponse.json(completeGoal);
      }
    }

    const newGoal: CareerGoal = {
      id: createdGoalId,
      title: body.title || "New Career Goal",
      targetRole: body.targetRole || body.title || "Target Role",
      currentRole: body.currentRole || "",
      targetHorizon: body.targetHorizon || "6–12 months",
      goalType: body.goalType || "Role Change",
      status: body.status || "Active",
      isPrimary: Boolean(body.isPrimary),
      stage: body.stage || "direction",
      milestones: body.milestones || [
        { id: `m-${Date.now()}-1`, title: "Target role defined", completed: true, stage: "direction" },
        { id: `m-${Date.now()}-2`, title: "Capability gaps identified", completed: false, stage: "target" },
        { id: `m-${Date.now()}-3`, title: "Strategy being developed", completed: false, stage: "strategy" },
        { id: `m-${Date.now()}-4`, title: "Career outcome achieved", completed: false, stage: "outcome" },
      ],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    return NextResponse.json(newGoal);
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 400 });
  }
}

export async function PATCH(req: NextRequest) {
  try {
    const body = await req.json();
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (user && isValidUUID(body.id)) {
      const admin = createAdminClient();
      const updateData: any = {
        updated_at: new Date().toISOString(),
      };

      if (body.title !== undefined) updateData.title = body.title;
      if (body.targetRole !== undefined || body.target_role !== undefined) {
        updateData.target_role = body.targetRole || body.target_role;
      }
      if (body.currentRole !== undefined || body.current_role !== undefined) {
        updateData.current_role = body.currentRole || body.current_role;
      }
      if (body.targetHorizon !== undefined || body.target_horizon !== undefined) {
        updateData.target_horizon = body.targetHorizon || body.target_horizon;
      }
      if (body.goalType !== undefined || body.goal_type !== undefined) {
        updateData.goal_type = body.goalType || body.goal_type;
      }
      if (body.status !== undefined) updateData.status = body.status;
      if (body.isPrimary !== undefined || body.is_primary !== undefined) {
        const isPrimary = Boolean(body.isPrimary !== undefined ? body.isPrimary : body.is_primary);
        updateData.is_primary = isPrimary;
        if (isPrimary) {
          await admin
            .from("career_goals")
            .update({ is_primary: false })
            .eq("user_id", user.id);
        }
      }
      if (body.stage !== undefined) updateData.stage = body.stage;
      if (body.reasonSummary !== undefined || body.reason_summary !== undefined) {
        updateData.reason_summary = body.reasonSummary || body.reason_summary;
      }
      if (body.supportingEvidence !== undefined || body.supporting_evidence !== undefined) {
        updateData.supporting_evidence = body.supportingEvidence || body.supporting_evidence;
      }

      await admin
        .from("career_goals")
        .update(updateData)
        .eq("id", body.id)
        .eq("user_id", user.id);
    }

    return NextResponse.json({ success: true, updated: body });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 400 });
  }
}
