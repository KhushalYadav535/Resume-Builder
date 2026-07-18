import { createClient } from "@supabase/supabase-js";

export async function checkAndDeductCredits(
  userId: string,
  cost: number,
  reason: string
): Promise<{ allowed: boolean; error?: string }> {
  try {
    const supabaseAdmin = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_SERVICE_ROLE_KEY!
    );

    // 1. Get user profile
    const { data: profile, error: profileErr } = await supabaseAdmin
      .from("profiles")
      .select("tier, tier_expiry_date, credit_balance")
      .eq("id", userId)
      .single();

    if (profileErr || !profile) {
      console.error("Profile fetch error:", profileErr);
      return { allowed: false, error: "Profile not found. Please log out and log back in." };
    }

    // 2. Check active subscription tier
    const isPremium = profile.tier === "sprint" || profile.tier === "pro" || profile.tier === "interview_pack";
    const isActive = profile.tier_expiry_date ? new Date(profile.tier_expiry_date) > new Date() : false;

    if (isPremium && isActive) {
      // Unlimited usage for active Sprint/Pro users
      return { allowed: true };
    }

    // 3. Check credits for Free users (or expired premium)
    if (profile.credit_balance < cost) {
      return { allowed: false, error: `Insufficient credits. You need ${cost} credits for this action.` };
    }

    // 4. Deduct credits
    const { error: updateErr } = await supabaseAdmin
      .from("profiles")
      .update({ credit_balance: profile.credit_balance - cost })
      .eq("id", userId);

    if (updateErr) {
      console.error("Credit deduction error:", updateErr);
      return { allowed: false, error: "Failed to process credits." };
    }

    // 5. Log transaction
    await supabaseAdmin.from("credit_transactions").insert({
      user_id: userId,
      amount: -cost,
      reason: reason,
      category: "usage"
    });

    return { allowed: true };
  } catch (err: any) {
    console.error("Billing check error:", err);
    return { allowed: false, error: "Internal billing error" };
  }
}
