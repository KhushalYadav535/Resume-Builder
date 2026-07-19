import { NextRequest, NextResponse } from "next/server";
import { isAdmin } from "@/lib/isAdmin";
import { createClient } from "@supabase/supabase-js";

export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  try {
    const adminCheck = await isAdmin();
    if (!adminCheck) {
      return NextResponse.json({ error: "Forbidden. Admin rights required." }, { status: 403 });
    }

    // Use Service Role to bypass RLS and fetch all user profiles and billing data
    const supabaseAdmin = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_SERVICE_ROLE_KEY!
    );

    // 1. Fetch user_profiles to get emails
    const { data: userProfiles, error: usersError } = await supabaseAdmin
      .from("user_profiles")
      .select("id, email, role, created_at");

    if (usersError) throw usersError;

    // 2. Fetch billing profiles for tier, credit_balance, and referrals
    const { data: billingProfiles, error: billingError } = await supabaseAdmin
      .from("profiles")
      .select("id, tier, credit_balance, tier_expiry_date, referral_code, referred_by");

    if (billingError && billingError.code !== '42P01') { 
      // 42P01 is relation does not exist, ignore if table missing
      console.error("Error fetching profiles:", billingError);
    }

    // 3. Fetch credit transactions
    const { data: transactions, error: txError } = await supabaseAdmin
      .from("credit_transactions")
      .select("id, user_id, amount, reason, category, created_at, expires_at")
      .order("created_at", { ascending: false });

    if (txError && txError.code !== '42P01') {
      console.error("Error fetching transactions:", txError);
    }

    // 4. Combine data
    const combinedData = (userProfiles || []).map((u) => {
      const billing = (billingProfiles || []).find((b) => b.id === u.id) || {
        tier: "free",
        credit_balance: 0,
        tier_expiry_date: null,
        referral_code: null,
        referred_by: null
      };
      const userTransactions = (transactions || []).filter((tx) => tx.user_id === u.id);
      
      // Calculate how many people this user has referred
      const referralCount = (billingProfiles || []).filter((b) => b.referred_by === u.id).length;

      return {
        id: u.id,
        email: u.email,
        role: u.role,
        tier: billing.tier,
        credit_balance: billing.credit_balance,
        tier_expiry_date: billing.tier_expiry_date,
        referral_code: billing.referral_code,
        referral_count: referralCount,
        transactions: userTransactions,
      };
    });

    return NextResponse.json(combinedData);
  } catch (err: unknown) {
    console.error("Fetch admin billing failed:", err);
    return NextResponse.json({ error: "Failed to fetch billing data." }, { status: 500 });
  }
}
