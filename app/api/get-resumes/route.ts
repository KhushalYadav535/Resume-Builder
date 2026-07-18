import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/utils/supabase/server";

export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  try {
    const supabase = await createClient();

    // Fetch secure logged-in user session
    const { data: { user } } = await supabase.auth.getUser();

    // If no session exists, block retrieval
    if (!user) {
      return NextResponse.json(
        { error: "User not logged in or active session expired." },
        { status: 401 }
      );
    }

    // Query resumes belonging strictly to the logged-in user
    const { data, error } = await supabase
      .from("resumes")
      .select("*")
      .eq("user_id", user?.id)
      .order("created_at", { ascending: false });

    // Add Debug Logs
    console.log("Logged user:", user?.id);
    console.log("Fetch result:", data);
    console.error("Supabase error:", error);

    if (error) {
      throw error;
    }

    return NextResponse.json(data || []);
  } catch (err: unknown) {
    console.error("Failed to fetch resumes:", err);
    return NextResponse.json(
      { error: "Failed to fetch resumes" }, 
      { status: 500 }
    );
  }
}
