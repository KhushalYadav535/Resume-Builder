import { NextResponse } from "next/server";
import crypto from "crypto";
import Razorpay from "razorpay";
import { createClient } from "@supabase/supabase-js";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { razorpay_order_id, razorpay_payment_id, razorpay_signature } = body;

    const secret = process.env.RZP_key_secret!;

    const shasum = crypto.createHmac("sha256", secret);
    shasum.update(`${razorpay_order_id}|${razorpay_payment_id}`);
    const digest = shasum.digest("hex");

    if (digest !== razorpay_signature) {
      return NextResponse.json({ error: "Transaction not legit!" }, { status: 400 });
    }

    // Initialize Razorpay
    const razorpay = new Razorpay({
      key_id: process.env.RZP_key_id!,
      key_secret: secret,
    });

    // Fetch order to get metadata
    const order = await razorpay.orders.fetch(razorpay_order_id);
    const { userId, tier, credits } = order.notes || {};

    if (!userId) {
      console.warn("Order verified but no userId in notes:", razorpay_order_id);
      return NextResponse.json({ success: true, message: "Payment verified, but no user info found" });
    }

    // Initialize Supabase Admin to bypass RLS
    const supabaseAdmin = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_SERVICE_ROLE_KEY!
    );

    const creditsToAdd = parseInt(credits as string, 10) || 0;
    
    // Calculate expiry based on tier
    let tierExpiryDate = null;
    if (tier === "sprint") {
      tierExpiryDate = new Date();
      tierExpiryDate.setDate(tierExpiryDate.getDate() + 30);
    } else if (tier === "pro") {
      tierExpiryDate = new Date();
      tierExpiryDate.setDate(tierExpiryDate.getDate() + 90);
    }

    // 1. Get current profile to safely add credits
    const { data: profile } = await supabaseAdmin.from("profiles").select("credit_balance").eq("id", userId).single();
    const currentCredits = profile ? profile.credit_balance : 0;

    // 2. Update profile
    const updateData: any = { credit_balance: currentCredits + creditsToAdd };
    if (tier && tier !== "free") {
      updateData.tier = tier;
      updateData.tier_expiry_date = tierExpiryDate ? tierExpiryDate.toISOString() : null;
    }

    await supabaseAdmin.from("profiles").update(updateData).eq("id", userId);

    // 3. Log transaction
    await supabaseAdmin.from("credit_transactions").insert({
      user_id: userId,
      amount: creditsToAdd,
      reason: `Purchased ${tier && tier !== "free" ? String(tier).toUpperCase() + " Plan" : "Credits"}`,
      category: "purchase"
    });

    return NextResponse.json(
      { success: true, message: "Payment verified successfully" },
      { status: 200 }
    );
  } catch (error: any) {
    console.error("Razorpay Verify Order Error:", error);
    return NextResponse.json(
      { error: error.message || "Failed to verify order" },
      { status: 500 }
    );
  }
}
