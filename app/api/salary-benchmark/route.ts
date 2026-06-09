import { NextRequest, NextResponse } from "next/server";
import { getSalaryBenchmark } from "@/lib/salaryData";
import { createClient } from "@/utils/supabase/server";

export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: "Unauthorized." }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const role = searchParams.get("role") || "Software Engineer";
    const yoeStr = searchParams.get("yoe") || "2";
    const city = searchParams.get("city") || "Hyderabad";

    const yoe = Math.max(0, parseInt(yoeStr) || 0);

    const benchmark = getSalaryBenchmark(role, yoe, city);

    return NextResponse.json(benchmark);
  } catch (err: any) {
    console.error("Salary benchmark endpoint failed:", err);
    return NextResponse.json({ error: err.message || "Failed to retrieve salary benchmark." }, { status: 500 });
  }
}
