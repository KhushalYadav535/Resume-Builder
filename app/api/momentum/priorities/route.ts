import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/utils/supabase/server";
import { createAdminClient } from "@/utils/supabase/admin";
import { EMPTY_MOMENTUM_DATA } from "@/lib/momentumData";
import { CareerPriority } from "@/types/momentum";

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
        .from("career_priorities")
        .select("*")
        .eq("user_id", user.id)
        .order("created_at", { ascending: true });

      if (data && data.length > 0) {
        const formatted: CareerPriority[] = data.map((p) => ({
          id: p.id,
          userId: p.user_id,
          type: p.type,
          label: p.label,
          importance: p.importance || "high",
          preference: p.preference || undefined,
          source: p.source || "User Selected",
          selected: Boolean(p.selected),
          createdAt: p.created_at,
          updatedAt: p.updated_at,
        }));
        return NextResponse.json(formatted);
      }
    }

    return NextResponse.json(EMPTY_MOMENTUM_DATA.priorities);
  } catch (err) {
    return NextResponse.json(EMPTY_MOMENTUM_DATA.priorities);
  }
}

export async function PATCH(req: NextRequest) {
  try {
    const body = await req.json(); // array of priorities or single priority
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (user) {
      const admin = createAdminClient();
      const list = Array.isArray(body) ? body : [body];

      for (const item of list) {
        const payload: any = {
          user_id: user.id,
          type: item.type,
          label: item.label,
          importance: item.importance || "high",
          preference: item.preference || null,
          source: item.source || "User Selected",
          selected: Boolean(item.selected),
          updated_at: new Date().toISOString(),
        };

        if (isValidUUID(item.id)) {
          payload.id = item.id;
        }

        await admin
          .from("career_priorities")
          .upsert(payload, { onConflict: "user_id,type" });
      }
    }

    return NextResponse.json({ success: true, updated: body });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 400 });
  }
}
