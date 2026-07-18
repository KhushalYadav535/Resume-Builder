"use client";
import React, { useState, useEffect } from "react";
import Link from "next/link";
import { X, Zap, TrendingUp } from "lucide-react";
import { createClient } from "@/utils/supabase/client";

interface CreditUpsellBannerProps {
  creditBalance: number;
  tier: string;
}

export default function CreditUpsellBanner({ creditBalance, tier }: CreditUpsellBannerProps) {
  const [dismissed, setDismissed] = useState(false);
  const [weeklySpend, setWeeklySpend] = useState(0);

  useEffect(() => {
    // Only fetch spend for free users
    if (tier !== "free") return;
    const fetchWeeklySpend = async () => {
      try {
        const supabase = createClient();
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) return;

        const weekAgo = new Date();
        weekAgo.setDate(weekAgo.getDate() - 7);

        const { data } = await supabase
          .from("credit_transactions")
          .select("amount")
          .eq("user_id", user.id)
          .eq("category", "usage")
          .gte("created_at", weekAgo.toISOString());

        if (data) {
          // amounts are negative for spend, so sum and abs
          const total = data.reduce((sum, tx) => sum + Math.abs(tx.amount), 0);
          setWeeklySpend(total);
        }
      } catch (err) {
        console.error("Weekly spend fetch failed:", err);
      }
    };
    fetchWeeklySpend();
  }, [tier]);

  // Don't show for paid tiers
  if (tier === "sprint" || tier === "pro") return null;
  // Don't show if dismissed
  if (dismissed) return null;

  // Show if balance low (< 50) OR high weekly spend (> 200)
  const lowBalance = creditBalance < 50;
  const highSpend = weeklySpend > 200;
  if (!lowBalance && !highSpend) return null;

  const isCritical = creditBalance < 20;

  return (
    <div
      style={{
        position: "fixed",
        bottom: "1.5rem",
        right: "1.5rem",
        zIndex: 200,
        maxWidth: "380px",
        background: isCritical
          ? "linear-gradient(135deg, #1a0a0a 0%, #2d0f0f 100%)"
          : "linear-gradient(135deg, #0f0a2a 0%, #1a1040 100%)",
        border: `1px solid ${isCritical ? "rgba(239,68,68,0.35)" : "rgba(108,99,255,0.35)"}`,
        borderRadius: "14px",
        padding: "1.2rem 1.4rem",
        boxShadow: "0 12px 40px rgba(0,0,0,0.4)",
        display: "flex",
        flexDirection: "column",
        gap: "0.8rem",
        animation: "slideUp 0.3s ease-out",
      }}
    >
      {/* Dismiss */}
      <button
        onClick={() => setDismissed(true)}
        style={{
          position: "absolute",
          top: "0.7rem",
          right: "0.7rem",
          background: "none",
          border: "none",
          cursor: "pointer",
          color: "rgba(255,255,255,0.4)",
          padding: "0.2rem",
        }}
      >
        <X size={16} />
      </button>

      {/* Icon + headline */}
      <div style={{ display: "flex", alignItems: "center", gap: "0.8rem" }}>
        <div
          style={{
            width: "36px",
            height: "36px",
            borderRadius: "10px",
            background: isCritical ? "rgba(239,68,68,0.15)" : "rgba(108,99,255,0.15)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            flexShrink: 0,
          }}
        >
          {isCritical ? (
            <Zap size={18} style={{ color: "#ef4444" }} />
          ) : (
            <TrendingUp size={18} style={{ color: "#6c63ff" }} />
          )}
        </div>
        <div>
          <p style={{ margin: 0, fontSize: "0.88rem", fontWeight: 700, color: "#fff", lineHeight: 1.3 }}>
            {isCritical
              ? `Only ${creditBalance} credits left`
              : highSpend && !lowBalance
              ? "You're getting great value from UpRole"
              : `Running low — ${creditBalance} credits remaining`}
          </p>
          <p style={{ margin: 0, fontSize: "0.78rem", color: "rgba(255,255,255,0.55)", marginTop: "0.2rem", lineHeight: 1.4 }}>
            {isCritical
              ? "Career Sprint gives unlimited AI access for ₹799/30 days."
              : highSpend && !lowBalance
              ? `You've used ${weeklySpend} credits this week. Sprint gives unlimited access for ₹799/30d — switch and save.`
              : "Top up your credits or switch to Career Sprint for unlimited access."}
          </p>
        </div>
      </div>

      {/* Actions */}
      <div style={{ display: "flex", gap: "0.6rem" }}>
        <Link
          href="/pricing"
          style={{
            flex: 1,
            textAlign: "center",
            padding: "0.55rem 0.8rem",
            borderRadius: "8px",
            background: "linear-gradient(135deg, #6c63ff 0%, #3b82f6 100%)",
            color: "#fff",
            fontWeight: 700,
            fontSize: "0.82rem",
            textDecoration: "none",
            transition: "opacity 0.15s",
          }}
        >
          Career Sprint — ₹799
        </Link>
        <Link
          href="/pricing#topup"
          style={{
            flex: 1,
            textAlign: "center",
            padding: "0.55rem 0.8rem",
            borderRadius: "8px",
            border: "1px solid rgba(255,255,255,0.15)",
            color: "rgba(255,255,255,0.7)",
            fontWeight: 600,
            fontSize: "0.82rem",
            textDecoration: "none",
          }}
        >
          Top Up Credits
        </Link>
      </div>
    </div>
  );
}
