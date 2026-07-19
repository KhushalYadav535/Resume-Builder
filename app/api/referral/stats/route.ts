import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { cookies } from "next/headers";
import { createServerClient } from "@supabase/ssr";

export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  try {
    const cookieStore = await cookies();
    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        cookies: {
          get(name: string) {
            return cookieStore.get(name)?.value;
          },
        },
      }
    );

    const { data: { user }, error: authErr } = await supabase.auth.getUser();
    if (authErr || !user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const supabaseAdmin = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_SERVICE_ROLE_KEY!
    );

    // 1. Get user's referral code, generate one if missing
    let { data: profile } = await supabaseAdmin
      .from("profiles")
      .select("referral_code")
      .eq("id", user.id)
      .single();

    let referralCode = profile?.referral_code;

    if (!referralCode) {
      // Auto-generate it as the first 8 chars of their UUID
      referralCode = user.id.substring(0, 8);
      await supabaseAdmin
        .from("profiles")
        .update({ referral_code: referralCode })
        .eq("id", user.id);
    }

    // 2. Count successful referrals
    const { count, error: countErr } = await supabaseAdmin
      .from("profiles")
      .select("*", { count: 'exact', head: true })
      .eq("referred_by", user.id);

    // 3. Count total credits earned from referrals
    const { data: txs } = await supabaseAdmin
      .from("credit_transactions")
      .select("amount")
      .eq("user_id", user.id)
      .eq("reason", "Successful Referral");
      
    const totalEarned = txs?.reduce((sum, tx) => sum + tx.amount, 0) || 0;

    return NextResponse.json({
      referralCode,
      referralCount: count || 0,
      totalEarned
    });
  } catch (err: unknown) {
    console.error("Referral stats error:", err);
    return NextResponse.json(
      { error: "Internal error fetching stats." },
      { status: 500 }
    );
  }
}
