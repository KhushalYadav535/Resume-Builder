"use client";
import React, { useEffect, useState } from "react";
import Link from "next/link";
import Navbar from "@/components/Navbar";
import { useAuth } from "@/hooks/useAuth";
import { useRouter } from "next/navigation";
import { createClient } from "@/utils/supabase/client";
import {
  Coins, TrendingUp, TrendingDown, Gift, ShoppingCart,
  BookOpen, Zap, ArrowUpRight, Clock, AlertCircle
} from "lucide-react";

interface Transaction {
  id: string;
  amount: number;
  reason: string;
  category: string;
  created_at: string;
  expires_at: string | null;
}

interface Profile {
  tier: string;
  tier_expiry_date: string | null;
  credit_balance: number;
}

const categoryConfig: Record<string, { icon: React.ReactNode; color: string; bg: string }> = {
  journal_bonus: { icon: <BookOpen size={14} />, color: "#10b981", bg: "rgba(16,185,129,0.1)" },
  purchase:      { icon: <ShoppingCart size={14} />, color: "#6c63ff", bg: "rgba(108,99,255,0.1)" },
  welcome:       { icon: <Gift size={14} />, color: "#f59e0b", bg: "rgba(245,158,11,0.1)" },
  usage:         { icon: <Zap size={14} />, color: "#ef4444", bg: "rgba(239,68,68,0.1)" },
  default:       { icon: <Coins size={14} />, color: "#6b7280", bg: "rgba(107,114,128,0.1)" },
};

const tierLabels: Record<string, { label: string; color: string }> = {
  free:    { label: "Free",          color: "#6b7280" },
  sprint:  { label: "Career Sprint", color: "#6c63ff" },
  pro:     { label: "Career Pro",    color: "#f59e0b" },
};

export default function CreditsPage() {
  const { user, loading: authLoading } = useAuth();
  const router = useRouter();
  const [profile, setProfile] = useState<Profile | null>(null);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!authLoading && !user) router.push("/login");
  }, [authLoading, user, router]);

  useEffect(() => {
    if (!user) return;
    const fetchData = async () => {
      const supabase = createClient();
      const [profileRes, txRes] = await Promise.all([
        supabase.from("profiles").select("tier, tier_expiry_date, credit_balance").eq("id", user.id).single(),
        supabase.from("credit_transactions").select("*").eq("user_id", user.id).order("created_at", { ascending: false }).limit(50),
      ]);
      if (profileRes.data) setProfile(profileRes.data);
      if (txRes.data) setTransactions(txRes.data);
      setLoading(false);
    };
    fetchData();
  }, [user]);

  const totalEarned = transactions.filter(t => t.amount > 0).reduce((s, t) => s + t.amount, 0);
  const totalSpent  = transactions.filter(t => t.amount < 0).reduce((s, t) => s + Math.abs(t.amount), 0);

  const tierInfo = profile ? (tierLabels[profile.tier] || tierLabels.free) : tierLabels.free;

  const isExpiringSoon = (dateStr: string | null): boolean => {
    if (!dateStr) return false;
    const diff = new Date(dateStr).getTime() - Date.now();
    return diff > 0 && diff < 30 * 24 * 60 * 60 * 1000; // within 30 days
  };

  return (
    <div style={{ minHeight: "100vh", background: "var(--bg)" }}>
      <Navbar />
      <div style={{ maxWidth: "900px", margin: "0 auto", padding: "2rem 1.5rem" }}>

        {/* Header */}
        <div style={{ marginBottom: "2rem" }}>
          <h1 style={{ fontFamily: "Syne, sans-serif", fontSize: "2rem", fontWeight: 800, margin: "0 0 0.4rem" }}>
            Credits & Plan
          </h1>
          <p style={{ color: "var(--text-muted)", margin: 0, fontSize: "0.9rem" }}>
            Track your credit balance, spending history, and subscription.
          </p>
        </div>

        {loading ? (
          <div style={{ textAlign: "center", padding: "4rem" }}>
            <div className="spinner" style={{ width: 36, height: 36, margin: "0 auto" }} />
          </div>
        ) : (
          <>
            {/* Stats Row */}
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: "1.2rem", marginBottom: "2rem" }}>

              {/* Balance */}
              <div className="card" style={{ padding: "1.4rem", background: "linear-gradient(135deg, rgba(108,99,255,0.08) 0%, rgba(59,130,246,0.08) 100%)", border: "1px solid rgba(108,99,255,0.2)" }}>
                <div style={{ display: "flex", alignItems: "center", gap: "0.5rem", marginBottom: "0.6rem" }}>
                  <Coins size={18} style={{ color: "var(--accent)" }} />
                  <span style={{ fontSize: "0.82rem", fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.5px", color: "var(--text-muted)" }}>Balance</span>
                </div>
                <div style={{ fontSize: "2.8rem", fontWeight: 900, fontFamily: "Syne, sans-serif", lineHeight: 1, color: profile && profile.credit_balance < 20 ? "#ef4444" : profile && profile.credit_balance < 50 ? "#f59e0b" : "#10b981" }}>
                  {profile?.credit_balance ?? 0}
                </div>
                <div style={{ fontSize: "0.78rem", color: "var(--text-muted)", marginTop: "0.3rem" }}>credits available</div>
                {profile && profile.credit_balance < 50 && (
                  <Link href="/pricing" style={{ display: "inline-block", marginTop: "0.8rem", fontSize: "0.78rem", fontWeight: 700, color: "var(--accent)", textDecoration: "none" }}>
                    Top Up →
                  </Link>
                )}
              </div>

              {/* Current Plan */}
              <div className="card" style={{ padding: "1.4rem" }}>
                <div style={{ display: "flex", alignItems: "center", gap: "0.5rem", marginBottom: "0.6rem" }}>
                  <Zap size={18} style={{ color: tierInfo.color }} />
                  <span style={{ fontSize: "0.82rem", fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.5px", color: "var(--text-muted)" }}>Current Plan</span>
                </div>
                <div style={{ fontSize: "1.5rem", fontWeight: 800, fontFamily: "Syne, sans-serif", color: tierInfo.color }}>
                  {tierInfo.label}
                </div>
                {profile?.tier_expiry_date && (
                  <div style={{ fontSize: "0.78rem", color: isExpiringSoon(profile.tier_expiry_date) ? "#f59e0b" : "var(--text-muted)", marginTop: "0.3rem", display: "flex", alignItems: "center", gap: "0.3rem" }}>
                    {isExpiringSoon(profile.tier_expiry_date) && <AlertCircle size={12} />}
                    Expires {new Date(profile.tier_expiry_date).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" })}
                  </div>
                )}
                {profile?.tier === "free" && (
                  <Link href="/pricing" style={{ display: "inline-block", marginTop: "0.8rem", fontSize: "0.78rem", fontWeight: 700, color: "var(--accent)", textDecoration: "none" }}>
                    Upgrade →
                  </Link>
                )}
              </div>

              {/* Total Earned */}
              <div className="card" style={{ padding: "1.4rem" }}>
                <div style={{ display: "flex", alignItems: "center", gap: "0.5rem", marginBottom: "0.6rem" }}>
                  <TrendingUp size={18} style={{ color: "#10b981" }} />
                  <span style={{ fontSize: "0.82rem", fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.5px", color: "var(--text-muted)" }}>All-Time Earned</span>
                </div>
                <div style={{ fontSize: "2rem", fontWeight: 900, fontFamily: "Syne, sans-serif", color: "#10b981" }}>+{totalEarned}</div>
                <div style={{ fontSize: "0.78rem", color: "var(--text-muted)", marginTop: "0.3rem" }}>credits received</div>
              </div>

              {/* Total Spent */}
              <div className="card" style={{ padding: "1.4rem" }}>
                <div style={{ display: "flex", alignItems: "center", gap: "0.5rem", marginBottom: "0.6rem" }}>
                  <TrendingDown size={18} style={{ color: "#ef4444" }} />
                  <span style={{ fontSize: "0.82rem", fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.5px", color: "var(--text-muted)" }}>All-Time Used</span>
                </div>
                <div style={{ fontSize: "2rem", fontWeight: 900, fontFamily: "Syne, sans-serif", color: "#ef4444" }}>{totalSpent}</div>
                <div style={{ fontSize: "0.78rem", color: "var(--text-muted)", marginTop: "0.3rem" }}>credits spent</div>
              </div>
            </div>

            {/* Sprint Upsell — coach tone, only for free */}
            {profile?.tier === "free" && (
              <div className="card" style={{ padding: "1.4rem 1.8rem", marginBottom: "2rem", background: "linear-gradient(135deg, rgba(108,99,255,0.06) 0%, rgba(59,130,246,0.06) 100%)", border: "1px solid rgba(108,99,255,0.2)", display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: "1rem" }}>
                <div>
                  <p style={{ margin: "0 0 0.3rem", fontWeight: 700, fontSize: "0.95rem" }}>Heading into an active job search?</p>
                  <p style={{ margin: 0, fontSize: "0.83rem", color: "var(--text-muted)" }}>
                    Career Sprint gives unlimited AI access for 30 days — no credit counting, no interruptions.
                  </p>
                </div>
                <Link
                  href="/pricing"
                  style={{ padding: "0.6rem 1.4rem", borderRadius: "10px", background: "linear-gradient(135deg, #6c63ff, #3b82f6)", color: "#fff", fontWeight: 700, fontSize: "0.85rem", textDecoration: "none", display: "flex", alignItems: "center", gap: "0.4rem", flexShrink: 0 }}
                >
                  View Plans <ArrowUpRight size={14} />
                </Link>
              </div>
            )}

            {/* Transaction History */}
            <div className="card" style={{ padding: "1.5rem" }}>
              <h2 style={{ fontSize: "1rem", fontWeight: 700, margin: "0 0 1.2rem", display: "flex", alignItems: "center", gap: "0.5rem" }}>
                <Clock size={16} style={{ color: "var(--accent)" }} />
                Transaction History
              </h2>

              {transactions.length === 0 ? (
                <p style={{ color: "var(--text-muted)", fontSize: "0.85rem", textAlign: "center", padding: "2rem 0" }}>
                  No transactions yet. Start by logging a career win to earn bonus credits!
                </p>
              ) : (
                <div style={{ display: "grid", gap: "0.6rem" }}>
                  {transactions.map((tx) => {
                    const cfg = categoryConfig[tx.category] || categoryConfig.default;
                    const isEarn = tx.amount > 0;
                    const now = Date.now();
                    const expired = tx.expires_at ? new Date(tx.expires_at).getTime() < now : false;
                    const expiringSoon = tx.expires_at ? isExpiringSoon(tx.expires_at) : false;

                    return (
                      <div
                        key={tx.id}
                        style={{
                          display: "flex",
                          justifyContent: "space-between",
                          alignItems: "center",
                          padding: "0.8rem 1rem",
                          borderRadius: "8px",
                          background: "rgba(255,255,255,0.02)",
                          border: "1px solid var(--border)",
                          gap: "1rem",
                          opacity: expired ? 0.5 : 1,
                        }}
                      >
                        <div style={{ display: "flex", alignItems: "center", gap: "0.8rem", flex: 1, minWidth: 0 }}>
                          <div style={{ width: "32px", height: "32px", borderRadius: "8px", background: cfg.bg, color: cfg.color, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                            {cfg.icon}
                          </div>
                          <div style={{ minWidth: 0 }}>
                            <p style={{ margin: 0, fontSize: "0.85rem", fontWeight: 600, color: "var(--text)", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
                              {tx.reason}
                            </p>
                            <p style={{ margin: 0, fontSize: "0.72rem", color: expired ? "#ef4444" : expiringSoon ? "#f59e0b" : "var(--text-muted)", display: "flex", alignItems: "center", gap: "0.3rem" }}>
                              {expired ? "Expired" : expiringSoon ? `Expires ${new Date(tx.expires_at!).toLocaleDateString("en-IN", { day: "numeric", month: "short" })}` : new Date(tx.created_at).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" })}
                              {(expired || expiringSoon) && !isEarn && <AlertCircle size={10} />}
                            </p>
                          </div>
                        </div>
                        <div style={{ fontFamily: "Syne, sans-serif", fontSize: "1rem", fontWeight: 800, color: isEarn ? "#10b981" : "#ef4444", flexShrink: 0 }}>
                          {isEarn ? `+${tx.amount}` : tx.amount}
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </>
        )}
      </div>
    </div>
  );
}
