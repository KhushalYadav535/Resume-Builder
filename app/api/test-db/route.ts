import { NextRequest, NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";

export const dynamic = "force-dynamic";

/**
 * Temporary test route to check database connection status
 * GET /api/test-db
 */
export async function GET(req: NextRequest) {
  try {
    // Query a single record from the resumes table to verify connection
    const { data, error } = await supabase
      .from("resumes")
      .select("*")
      .limit(1);

    if (error) {
      throw error;
    }

    return NextResponse.json({
      success: true,
      data,
    });
  } catch (err: any) {
    console.error("Database connection test failed:", err);
    return NextResponse.json(
      {
        success: false,
        error: err.message || String(err),
      },
      { status: 500 }
    );
  }
}
