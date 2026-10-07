import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/utils/supabase/server";
import { createAdminClient } from "@/utils/supabase/admin";
import { GoalMilestone } from "@/types/momentum";

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
        .select("stage")
        .eq("id", id)
        .eq("user_id", user.id)
        .single();

      const { data: ms } = await admin
        .from("goal_milestones")
        .select("*")
        .eq("goal_id", id)
        .order("created_at", { ascending: true });

      if (ms) {
        const milestones: GoalMilestone[] = ms.map((m) => ({
          id: m.id,
          title: m.title,
          completed: Boolean(m.completed),
          stage: m.stage || "strategy",
          completedAt: m.completed_at ? m.completed_at.split("T")[0] : undefined,
          sourceType: m.source_type || undefined,
          evidenceSnippet: m.evidence_snippet || undefined,
        }));
        const completed = milestones.filter((m) => m.completed).length;

        return NextResponse.json({
          goalId: id,
          stage: goal?.stage || "target",
          completedMilestones: completed,
          totalMilestones: milestones.length,
          milestones,
        });
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
          let goal = parsed.activeGoal?.id === id ? parsed.activeGoal : null;
          if (!goal) {
            goal = parsed.otherGoals?.find((g: any) => g.id === id) || null;
          }
          if (goal) {
            const completed = (goal.milestones || []).filter((m: any) => m.completed).length;
            return NextResponse.json({
              goalId: goal.id,
              stage: goal.stage || "target",
              completedMilestones: completed,
              totalMilestones: (goal.milestones || []).length,
              milestones: goal.milestones || [],
            });
          }
        }
      } catch (e) {}
    }

    return NextResponse.json({ error: "Goal not found" }, { status: 404 });
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
    const body = await req.json(); // { milestoneId, completed, title, stage, action, sourceType, evidenceSnippet }
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (user && isValidUUID(id)) {
      const admin = createAdminClient();

      if (body.action === "add" && body.title) {
        const { data: newMs } = await admin
          .from("goal_milestones")
          .insert({
            goal_id: id,
            user_id: user.id,
            title: body.title,
            completed: Boolean(body.completed),
            stage: body.stage || "strategy",
            source_type: body.sourceType || "Milestone",
            evidence_snippet: body.evidenceSnippet || null,
          })
          .select()
          .single();

        return NextResponse.json({ success: true, created: newMs });
      }

      if (body.milestoneId && isValidUUID(body.milestoneId)) {
        await admin
          .from("goal_milestones")
          .update({
            completed: Boolean(body.completed),
            completed_at: body.completed ? new Date().toISOString() : null,
          })
          .eq("id", body.milestoneId)
          .eq("goal_id", id)
          .eq("user_id", user.id);

        // Optionally update goal stage if body.goalStage is supplied
        if (body.goalStage) {
          await admin
            .from("career_goals")
            .update({ stage: body.goalStage, updated_at: new Date().toISOString() })
            .eq("id", id)
            .eq("user_id", user.id);
        }
      }
    }

    return NextResponse.json({ success: true, updated: body });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 400 });
  }
}
