import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/utils/supabase/server";
import { createAdminClient } from "@/utils/supabase/admin";

export const dynamic = "force-dynamic";

function isValidUUID(id: string | null | undefined): boolean {
  return typeof id === "string" && /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(id);
}

export async function GET(req: NextRequest) {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (user) {
      const admin = createAdminClient();
      const { data } = await admin
        .from("career_directions")
        .select("*")
        .eq("user_id", user.id)
        .order("updated_at", { ascending: false })
        .limit(1);

      if (data && data.length > 0) {
        const d = data[0];
        return NextResponse.json({
          id: d.id,
          userId: d.user_id,
          title: d.title,
          description: d.description || "",
          currentPath: d.current_path || "",
          targetPath: d.target_path || "",
          fullTrajectory: d.full_trajectory || [d.current_path, d.target_path],
          status: d.status || "Active",
          source: d.source || "User Confirmed",
          createdAt: d.created_at,
          updatedAt: d.updated_at,
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
          if (parsed.direction) {
            return NextResponse.json(parsed.direction);
          }
        }
      } catch (e) {}
    }

    return NextResponse.json(null);
  } catch (err: any) {
    return NextResponse.json(null);
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (user) {
      const admin = createAdminClient();
      const payload: any = {
        user_id: user.id,
        title: body.title,
        description: body.description || "",
        current_path: body.currentPath || body.current_path || "",
        target_path: body.targetPath || body.target_path || "",
        full_trajectory: body.fullTrajectory || body.full_trajectory || [body.currentPath, body.targetPath],
        status: body.status || "Active",
        source: body.source || "User Confirmed",
        updated_at: new Date().toISOString(),
      };

      if (isValidUUID(body.id)) {
        payload.id = body.id;
      }

      const { data, error } = await admin
        .from("career_directions")
        .upsert(payload)
        .select()
        .single();

      if (!error && data) {
        return NextResponse.json({
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
        });
      }
    }

    const updated = {
      id: body.id || (typeof crypto !== "undefined" && crypto.randomUUID ? crypto.randomUUID() : `dir-${Date.now()}`),
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
    return NextResponse.json(updated);
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 400 });
  }
}

export async function PATCH(req: NextRequest) {
  try {
    const body = await req.json();
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (user) {
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
      }
      if (body.status !== undefined) updateData.status = body.status;
      if (body.source !== undefined) updateData.source = body.source;

      let query = admin.from("career_directions").update(updateData).eq("user_id", user.id);
      if (isValidUUID(body.id)) {
        query = query.eq("id", body.id);
      }

      const { data } = await query.select();
      if (data && data.length > 0) {
        const d = data[0];
        return NextResponse.json({
          success: true,
          direction: {
            id: d.id,
            userId: d.user_id,
            title: d.title,
            description: d.description,
            currentPath: d.current_path,
            targetPath: d.target_path,
            fullTrajectory: d.full_trajectory,
            status: d.status,
            source: d.source,
            createdAt: d.created_at,
            updatedAt: d.updated_at,
          },
        });
      }
    }

    return NextResponse.json({ success: true, updated: body });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 400 });
  }
}
