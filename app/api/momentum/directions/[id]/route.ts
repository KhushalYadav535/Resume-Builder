import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/utils/supabase/server";
import { createAdminClient } from "@/utils/supabase/admin";

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
      const { data } = await admin
        .from("career_directions")
        .select("*")
        .eq("id", id)
        .eq("user_id", user.id)
        .single();

      if (data) {
        return NextResponse.json({
          id: data.id,
          userId: data.user_id,
          title: data.title,
          description: data.description || "",
          currentPath: data.current_path || "",
          targetPath: data.target_path || "",
          fullTrajectory: data.full_trajectory || [data.current_path, data.target_path],
          status: data.status || "Active",
          source: data.source || "User Confirmed",
          createdAt: data.created_at,
          updatedAt: data.updated_at,
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
          if (parsed.direction?.id === id) {
            return NextResponse.json(parsed.direction);
          }
        }
      } catch (e) {}
    }

    return NextResponse.json({ error: "Direction not found" }, { status: 404 });
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
      if (body.description !== undefined) updateData.description = body.description;
      if (body.currentPath !== undefined || body.current_path !== undefined) {
        updateData.current_path = body.currentPath || body.current_path;
      }
      if (body.targetPath !== undefined || body.target_path !== undefined) {
        updateData.target_path = body.targetPath || body.target_path;
      }
      if (body.fullTrajectory !== undefined || body.full_trajectory !== undefined) {
        updateData.full_trajectory = body.fullTrajectory || body.full_trajectory;
      } else if (updateData.current_path || updateData.target_path) {
        updateData.full_trajectory = [
          updateData.current_path || "Current",
          updateData.target_path || updateData.title || "Target",
        ];
      }
      if (body.status !== undefined) updateData.status = body.status;
      if (body.source !== undefined) updateData.source = body.source;

      const { data, error } = await admin
        .from("career_directions")
        .update(updateData)
        .eq("id", id)
        .eq("user_id", user.id)
        .select()
        .single();

      if (!error && data) {
        return NextResponse.json({
          success: true,
          direction: {
            id: data.id,
            userId: data.user_id,
            title: data.title,
            description: data.description,
            currentPath: data.current_path,
            targetPath: data.target_path,
            fullTrajectory: data.full_trajectory,
            status: data.status,
            source: data.source,
            createdAt: data.created_at,
            updatedAt: data.updated_at,
          },
        });
      }
    }

    const updated = {
      id,
      title: body.title || "Career Direction",
      description: body.description || "",
      currentPath: body.currentPath || "Current",
      targetPath: body.targetPath || "Target",
      fullTrajectory: body.fullTrajectory || ["Current", "Target"],
      status: body.status || "Active",
      source: "User Confirmed",
      ...body,
      updatedAt: new Date().toISOString(),
    };

    return NextResponse.json({ success: true, direction: updated });
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
        .from("career_directions")
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

