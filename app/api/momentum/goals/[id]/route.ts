import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/utils/supabase/server";
import { createAdminClient } from "@/utils/supabase/admin";
import { CareerGoal, GoalMilestone } from "@/types/momentum";

export const dynamic = "force-dynamic";

function isValidUUID(id: string | null | undefined): boolean {
  return typeof id === "string" && /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(id);
}

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (user && isValidUUID(id)) {
      const admin = createAdminClient();
      const { data: goal } = await admin
        .from("career_goals")
        .select("*")
        .eq("id", id)
        .eq("user_id", user.id)
        .single();

      if (goal) {
        const { data: ms } = await admin
          .from("goal_milestones")
          .select("*")
          .eq("goal_id", id)
          .order("created_at", { ascending: true });

        const formattedMilestones: GoalMilestone[] = (ms || []).map((m) => ({
          id: m.id,
          title: m.title,
          completed: Boolean(m.completed),
          stage: m.stage || "strategy",
          completedAt: m.completed_at ? m.completed_at.split("T")[0] : undefined,
          sourceType: m.source_type || undefined,
          evidenceSnippet: m.evidence_snippet || undefined,
        }));

        const formatted: CareerGoal = {
          id: goal.id,
          userId: goal.user_id,
          title: goal.title,
          targetRole: goal.target_role,
          currentRole: goal.current_role || "",
          targetHorizon: goal.target_horizon || "6–12 months",
          goalType: goal.goal_type || "Role Change",
          status: goal.status || "Active",
          isPrimary: Boolean(goal.is_primary),
          stage: goal.stage || "target",
          objective: goal.objective || undefined,
          strategyOverview: goal.strategy_overview || undefined,
          milestones: formattedMilestones,
          reasonSummary: goal.reason_summary,
          supportingEvidence: goal.supporting_evidence || [],
          createdAt: goal.created_at,
          updatedAt: goal.updated_at,
        };

        return NextResponse.json(formatted);
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
          if (parsed.activeGoal?.id === id) {
            return NextResponse.json(parsed.activeGoal);
          }
          const secondary = parsed.otherGoals?.find((g: any) => g.id === id);
          if (secondary) {
            return NextResponse.json(secondary);
          }
        }
      } catch (e) {}
    }

    return NextResponse.json(
      { error: "Career goal not found" },
      { status: 404 }
    );
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 400 });
  }
}

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await req.json();
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (user && isValidUUID(id)) {
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
      if (body.objective !== undefined) updateData.objective = body.objective;
      if (body.strategyOverview !== undefined || body.strategy_overview !== undefined) {
        updateData.strategy_overview = body.strategyOverview || body.strategy_overview;
      }
      if (body.reasonSummary !== undefined || body.reason_summary !== undefined) {
        updateData.reason_summary = body.reasonSummary || body.reason_summary;
      }
      if (body.supportingEvidence !== undefined || body.supporting_evidence !== undefined) {
        updateData.supporting_evidence = body.supportingEvidence || body.supporting_evidence;
      }

      const { data, error } = await admin
        .from("career_goals")
        .update(updateData)
        .eq("id", id)
        .eq("user_id", user.id)
        .select()
        .single();

      if (!error && data) {
        return NextResponse.json({
          success: true,
          goalId: id,
          updated: data,
        });
      }
    }

    return NextResponse.json({
      success: true,
      goalId: id,
      updated: body,
      updatedAt: new Date().toISOString(),
    });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 400 });
  }
}

export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (user && isValidUUID(id)) {
      const admin = createAdminClient();
      await admin
        .from("goal_milestones")
        .delete()
        .eq("goal_id", id);

      await admin
        .from("career_goals")
        .delete()
        .eq("id", id)
        .eq("user_id", user.id);

      return NextResponse.json({ success: true, deletedId: id });
    }

    return NextResponse.json({ success: true, deletedId: id, simulated: true });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 400 });
  }
}
