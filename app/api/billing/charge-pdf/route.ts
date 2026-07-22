import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/utils/supabase/server";
import { checkAndDeductCredits } from "@/lib/billing";
import { CREDIT_COSTS } from "@/lib/creditCosts";

export const dynamic = "force-dynamic";

export async function POST(req: NextRequest) {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const billingCheck = await checkAndDeductCredits(
      user.id,
      CREDIT_COSTS.PDF_DOWNLOAD,
      "PDF Download"
    );

    if (!billingCheck.allowed) {
      return NextResponse.json({ error: billingCheck.error }, { status: 403 });
    }

    return NextResponse.json({ success: true });
  } catch (err: any) {
    console.error("PDF billing API error:", err);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
