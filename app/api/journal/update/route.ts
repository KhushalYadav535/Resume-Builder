import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/utils/supabase/server";

export const dynamic = "force-dynamic";

export async function PUT(req: NextRequest) {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id, content, entry_type, tags, date } = await req.json();
    if (!id || !content || !entry_type) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    const { data, error } = await supabase
      .from("career_journal_entries")
      .update({
        content,
        entry_type,
        tags: tags || [],
        date: date || new Date().toISOString(),
      })
      .eq("id", id)
      .eq("user_id", user.id) // ownership check
      .select()
      .single();

    if (error) throw error;

    return NextResponse.json({ success: true, entry: data });
  } catch (err: unknown) {
    console.error("Journal update error:", err);
    return NextResponse.json({ error: "Failed to update entry." }, { status: 500 });
  }
}
