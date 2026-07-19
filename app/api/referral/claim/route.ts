import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { cookies } from "next/headers";
import { createServerClient } from "@supabase/ssr";

export const dynamic = "force-dynamic";

export async function POST(req: NextRequest) {
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

    const body = await req.json();
    const { refCode } = body;

    if (!refCode) {
      return NextResponse.json({ error: "Missing referral code" }, { status: 400 });
    }

    // Use admin client to bypass RLS for checking and updating other profiles
    const supabaseAdmin = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_SERVICE_ROLE_KEY!
    );

    // 1. Fetch current user profile to see if they already claimed one
    const { data: myProfile, error: myProfileErr } = await supabaseAdmin
      .from("profiles")
      .select("id, referred_by, credit_balance")
      .eq("id", user.id)
      .single();

    if (myProfileErr || !myProfile) {
      return NextResponse.json({ error: "User profile not found." }, { status: 404 });
    }

    if (myProfile.referred_by) {
      return NextResponse.json({ success: false, message: "Referral already claimed." });
    }

    // 2. Find the referrer by code
    const { data: referrerProfile, error: referrerErr } = await supabaseAdmin
      .from("profiles")
      .select("id, credit_balance")
      .eq("referral_code", refCode)
      .single();

    if (referrerErr || !referrerProfile) {
      return NextResponse.json({ error: "Invalid referral code." }, { status: 400 });
    }

    if (referrerProfile.id === user.id) {
      return NextResponse.json({ error: "You cannot refer yourself." }, { status: 400 });
    }

    const BONUS_CREDITS = 50;

    // 3. Update my profile (add referred_by and credits)
    await supabaseAdmin
      .from("profiles")
      .update({
        referred_by: referrerProfile.id,
        credit_balance: myProfile.credit_balance + BONUS_CREDITS
      })
      .eq("id", user.id);

    // Log my transaction
    await supabaseAdmin.from("credit_transactions").insert({
      user_id: user.id,
      amount: BONUS_CREDITS,
      reason: "Signup via Referral",
      category: "referral_bonus"
    });

    // 4. Update referrer profile (add credits)
    await supabaseAdmin
      .from("profiles")
      .update({
        credit_balance: referrerProfile.credit_balance + BONUS_CREDITS
      })
      .eq("id", referrerProfile.id);

    // Log referrer transaction
    await supabaseAdmin.from("credit_transactions").insert({
      user_id: referrerProfile.id,
      amount: BONUS_CREDITS,
      reason: "Successful Referral",
      category: "referral_bonus"
    });

    return NextResponse.json({ success: true, message: "Referral claimed successfully!" });
  } catch (err: unknown) {
    console.error("Referral claim error:", err);
    return NextResponse.json(
      { error: "Internal error processing referral." },
      { status: 500 }
    );
  }
}
