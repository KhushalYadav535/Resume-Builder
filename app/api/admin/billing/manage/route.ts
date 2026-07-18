import { NextRequest, NextResponse } from "next/server";
import { isAdmin } from "@/lib/isAdmin";
import { createClient } from "@supabase/supabase-js";

export async function POST(req: NextRequest) {
  try {
    const adminCheck = await isAdmin();
    if (!adminCheck) {
      return NextResponse.json({ error: "Forbidden. Admin rights required." }, { status: 403 });
    }

    const body = await req.json();
    const { userId, newTier, tierExpiryDate, creditAdjustment, reason } = body;

    if (!userId) {
      return NextResponse.json({ error: "Missing userId." }, { status: 400 });
    }

    const supabaseAdmin = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_SERVICE_ROLE_KEY!
    );

    // 1. Fetch current profile
    const { data: profile, error: profileErr } = await supabaseAdmin
      .from("profiles")
      .select("tier, credit_balance")
      .eq("id", userId)
      .single();

    if (profileErr) {
      console.error("Fetch profile error:", profileErr);
      return NextResponse.json({ error: "User profile not found." }, { status: 404 });
    }

    // 2. Prepare updates
    const updates: any = {};
    let tierChanged = false;

    if (newTier && newTier !== profile.tier) {
      updates.tier = newTier;
      updates.tier_expiry_date = newTier === "free" ? null : (tierExpiryDate || null);
      tierChanged = true;
    } else if (newTier === profile.tier && newTier !== "free") {
      // Just updating expiry date for existing tier
      updates.tier_expiry_date = tierExpiryDate || null;
    }

    const adj = Number(creditAdjustment) || 0;
    if (adj !== 0) {
      updates.credit_balance = profile.credit_balance + adj;
    }

    if (Object.keys(updates).length > 0) {
      const { error: updateErr } = await supabaseAdmin
        .from("profiles")
        .update(updates)
        .eq("id", userId);

      if (updateErr) {
        throw updateErr;
      }
    }

    // 3. Log transactions
    if (tierChanged) {
      await supabaseAdmin.from("credit_transactions").insert({
        user_id: userId,
        amount: 0,
        reason: `Admin changed tier to ${newTier.toUpperCase()}`,
        category: "admin_adjustment",
      });
    }

    if (adj !== 0) {
      await supabaseAdmin.from("credit_transactions").insert({
        user_id: userId,
        amount: adj,
        reason: reason || "Admin credit adjustment",
        category: "admin_adjustment",
      });
    }

    return NextResponse.json({ success: true, message: "User billing profile updated successfully." });
  } catch (err: unknown) {
    console.error("Admin Billing Manage Error:", err);
    return NextResponse.json(
      { error: "Failed to update user billing profile." },
      { status: 500 }
    );
  }
}
