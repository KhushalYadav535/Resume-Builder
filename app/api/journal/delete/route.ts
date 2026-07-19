import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/utils/supabase/server";

export const dynamic = "force-dynamic";

export async function DELETE(req: NextRequest) {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await req.json();
    if (!id) {
      return NextResponse.json({ error: "Missing entry id" }, { status: 400 });
    }

    const { error } = await supabase
      .from("career_journal_entries")
      .delete()
      .eq("id", id)
      .eq("user_id", user.id); // ownership check

    if (error) throw error;

    return NextResponse.json({ success: true });
  } catch (err: unknown) {
    console.error("Journal delete error:", err);
    return NextResponse.json({ error: "Failed to delete entry." }, { status: 500 });
  }
}
