"use client";
import { useEffect, useState } from "react";
import Link from "next/link";
import Navbar from "@/components/Navbar";
import { useToast } from "@/components/ui/toast-1";
import { BarChart2, Users, Bot, Brain, CreditCard, X, Receipt, Settings, Megaphone } from "lucide-react";

interface Transaction {
  id: string;
  user_id: string;
  amount: number;
  reason: string;
  category: string;
  created_at: string;
  expires_at: string | null;
}

interface BillingProfile {
  id: string;
  email: string;
  role: string;
  tier: string;
  credit_balance: number;
  tier_expiry_date: string | null;
  referral_code: string | null;
  referral_count: number;
  transactions: Transaction[];
}

export default function AdminBillingPage() {
  const { showToast } = useToast();
  const [profiles, setProfiles] = useState<BillingProfile[]>([]);
  const [loading, setLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState("");
  
  const [selectedUser, setSelectedUser] = useState<BillingProfile | null>(null);
  
  // Management state
  const [managingUser, setManagingUser] = useState<BillingProfile | null>(null);
  const [manageForm, setManageForm] = useState({
    tier: "free",
    tierExpiryDate: "",
    creditAdjustment: 0,
    reason: ""
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  const fetchBillingData = async () => {
    setLoading(true);
    setErrorMsg("");
    try {
      const res = await fetch("/api/admin/billing");
      if (!res.ok) {
        throw new Error("Failed to load billing and credit reports.");
      }
      const data = await res.json();
      setProfiles(Array.isArray(data) ? data : []);
    } catch (err: any) {
      setErrorMsg(err.message || "An unexpected error occurred.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBillingData();
  }, []);

  const openManageModal = (user: BillingProfile) => {
    setManagingUser(user);
    setManageForm({
      tier: user.tier || "free",
      tierExpiryDate: user.tier_expiry_date ? new Date(user.tier_expiry_date).toISOString().split('T')[0] : "",
      creditAdjustment: 0,
      reason: ""
    });
  };

  const handleManageSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!managingUser) return;
    
    setIsSubmitting(true);
    try {
      const payload = {
        userId: managingUser.id,
        newTier: manageForm.tier,
        tierExpiryDate: manageForm.tierExpiryDate ? new Date(manageForm.tierExpiryDate).toISOString() : null,
        creditAdjustment: Number(manageForm.creditAdjustment) || 0,
        reason: manageForm.reason
      };

      const res = await fetch("/api/admin/billing/manage", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload)
      });

      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.error || "Failed to update user.");
      }

      showToast("User billing updated successfully", "success");
      setManagingUser(null);
      fetchBillingData(); // Refresh data
    } catch (err: any) {
      showToast(err.message || "An unexpected error occurred.", "error");
    } finally {
      setIsSubmitting(false);
    }
  };

  const suspendPremium = () => {
    setManageForm({ ...manageForm, tier: "free", tierExpiryDate: "" });
  };

  return (
    <div style={{ minHeight: "100vh", background: "var(--bg)" }}>
      <Navbar />
      <div style={{ maxWidth: "1100px", margin: "0 auto", padding: "2.5rem 1.5rem" }}>

        {/* Title */}
        <div style={{ marginBottom: "2rem" }}>
          <p className="section-label" style={{ marginBottom: "0.5rem" }}>System Directory</p>
          <h1 style={{ fontFamily: "Syne, sans-serif", fontSize: "2.2rem", fontWeight: 800, display: "inline-flex", alignItems: "center", gap: "0.5rem" }}>
            <CreditCard size={32} className="text-emerald-500" />
            Billing & Credits
          </h1>
          <p style={{ color: "var(--text-muted)", fontSize: "0.9rem", marginTop: "0.25rem" }}>
            Monitor user credit balances, active subscription tiers, and complete payment histories.
          </p>
        </div>

        {/* Navigation Tabs */}
        <div style={{ display: "flex", gap: "0.5rem", borderBottom: "1px solid var(--border)", marginBottom: "2rem", overflowX: "auto", whiteSpace: "nowrap" }}>
          <Link href="/admin" style={{ textDecoration: "none" }}>
            <button style={{ padding: "0.6rem 1.2rem", background: "transparent", border: "none", color: "var(--text-muted)", fontWeight: 600, fontSize: "0.85rem", cursor: "pointer", display: "inline-flex", alignItems: "center", gap: "0.4rem" }}>
              <BarChart2 size={14} />
              Analytics Overview
            </button>
          </Link>
          <Link href="/admin/users" style={{ textDecoration: "none" }}>
            <button style={{ padding: "0.6rem 1.2rem", background: "transparent", border: "none", color: "var(--text-muted)", fontWeight: 600, fontSize: "0.85rem", cursor: "pointer", display: "inline-flex", alignItems: "center", gap: "0.4rem" }}>
              <Users size={14} />
              User Management
            </button>
          </Link>
          <Link href="/admin/ai-usage" style={{ textDecoration: "none" }}>
            <button style={{ padding: "0.6rem 1.2rem", background: "transparent", border: "none", color: "var(--text-muted)", fontWeight: 600, fontSize: "0.85rem", cursor: "pointer", display: "inline-flex", alignItems: "center", gap: "0.4rem" }}>
              <Bot size={14} />
              AI Usage Log
            </button>
          </Link>
          <Link href="/admin/keywords" style={{ textDecoration: "none" }}>
            <button style={{ padding: "0.6rem 1.2rem", background: "transparent", border: "none", color: "var(--text-muted)", fontWeight: 600, fontSize: "0.85rem", cursor: "pointer", display: "inline-flex", alignItems: "center", gap: "0.4rem" }}>
              <Brain size={14} />
              ATS Keywords
            </button>
          </Link>
          <Link href="/admin/billing" style={{ textDecoration: "none" }}>
            <button style={{ padding: "0.6rem 1.2rem", background: "rgba(16, 185, 129, 0.08)", border: "none", borderBottom: "2px solid #10b981", color: "#10b981", fontWeight: 700, fontSize: "0.85rem", cursor: "pointer", display: "inline-flex", alignItems: "center", gap: "0.4rem" }}>
              <CreditCard size={14} />
              Billing & Credits
            </button>
          </Link>
          <Link href="/admin/broadcast" style={{ textDecoration: "none" }}>
            <button style={{ padding: "0.6rem 1.2rem", background: "transparent", border: "none", color: "var(--text-muted)", fontWeight: 600, fontSize: "0.85rem", cursor: "pointer", display: "inline-flex", alignItems: "center", gap: "0.4rem" }}>
              <Megaphone size={14} />
              Broadcasts
            </button>
          </Link>
          <Link href="/admin/settings" style={{ textDecoration: "none" }}>
            <button style={{ padding: "0.6rem 1.2rem", background: "transparent", border: "none", color: "var(--text-muted)", fontWeight: 600, fontSize: "0.85rem", cursor: "pointer", display: "inline-flex", alignItems: "center", gap: "0.4rem" }}>
              <Settings size={14} />
              Settings
            </button>
          </Link>
        </div>

        {errorMsg && (
          <div style={{ color: "#ff6584", fontSize: "0.88rem", padding: "0.9rem 1.2rem", background: "rgba(255,101,132,0.08)", borderRadius: "10px", borderLeft: "4px solid #ff6584", marginBottom: "2rem" }}>
            {errorMsg}
          </div>
        )}

        {loading ? (
          <div style={{ textAlign: "center", padding: "6rem 2rem", background: "var(--card)", borderRadius: "16px", border: "1px solid var(--border)" }}>
            <div className="spinner" style={{ margin: "0 auto 1rem", width: 32, height: 32 }} />
            <p style={{ color: "var(--text-muted)", fontSize: "0.88rem" }}>Fetching billing and credit reports...</p>
          </div>
        ) : profiles.length === 0 ? (
          <div className="card" style={{ textAlign: "center", padding: "3rem" }}>
            No billing profiles found.
          </div>
        ) : (
          <div className="card" style={{ padding: 0, overflowX: "auto" }}>
            <table style={{ width: "100%", borderCollapse: "collapse", textAlign: "left", fontSize: "0.88rem" }}>
              <thead>
                <tr style={{ borderBottom: "1px solid var(--border)", background: "rgba(255,255,255,0.01)" }}>
                  <th style={{ padding: "1rem 1.2rem", fontWeight: 700, color: "var(--text-muted)", textTransform: "uppercase", fontSize: "0.74rem" }}>User Email</th>
                  <th style={{ padding: "1rem 1.2rem", fontWeight: 700, color: "var(--text-muted)", textTransform: "uppercase", fontSize: "0.74rem" }}>Tier</th>
                  <th style={{ padding: "1rem 1.2rem", fontWeight: 700, color: "var(--text-muted)", textTransform: "uppercase", fontSize: "0.74rem" }}>Credits</th>
                  <th style={{ padding: "1rem 1.2rem", fontWeight: 700, color: "var(--text-muted)", textTransform: "uppercase", fontSize: "0.74rem" }}>Referrals</th>
                  <th style={{ padding: "1rem 1.2rem", fontWeight: 700, color: "var(--text-muted)", textTransform: "uppercase", fontSize: "0.74rem", textAlign: "right" }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {profiles.map((profile) => (
                  <tr key={profile.id} style={{ borderBottom: "1px solid rgba(255,255,255,0.03)", transition: "background 0.2s" }} className="table-row-hover">
                    <td style={{ padding: "1rem 1.2rem", fontWeight: 600, color: "var(--text)" }}>{profile.email}</td>
                    <td style={{ padding: "1rem 1.2rem" }}>
                      <span className={`tag ${profile.tier === "free" ? "tag-gray" : "tag-purple"}`} style={{ fontSize: "0.7rem", textTransform: "uppercase", fontWeight: 700 }}>
                        {profile.tier}
                      </span>
                      {profile.tier_expiry_date && (
                        <div style={{ fontSize: "0.7rem", color: "var(--text-muted)", marginTop: "4px" }}>
                          Expires: {new Date(profile.tier_expiry_date).toLocaleDateString()}
                        </div>
                      )}
                    </td>
                    <td style={{ padding: "1rem 1.2rem", fontWeight: 700, color: profile.credit_balance > 0 ? "#10b981" : "var(--text-muted)" }}>
                      {profile.credit_balance}
                    </td>
                    <td style={{ padding: "1rem 1.2rem", fontWeight: 600, color: profile.referral_count > 0 ? "var(--accent)" : "var(--text-muted)" }}>
                      {profile.referral_count || 0}
                    </td>
                    <td style={{ padding: "1rem 1.2rem", textAlign: "right" }}>
                      <div style={{ display: "flex", gap: "0.5rem", justifyContent: "flex-end" }}>
                        <button
                          onClick={() => setSelectedUser(profile)}
                          className="btn-secondary"
                          style={{ padding: "0.35rem 0.6rem", fontSize: "0.75rem", borderColor: "var(--border)", color: "var(--text)", display: "inline-flex", alignItems: "center", gap: "0.4rem" }}
                        >
                          <Receipt size={14} />
                          View ({profile.transactions.length})
                        </button>
                        <button
                          onClick={() => openManageModal(profile)}
                          className="btn-secondary"
                          style={{ padding: "0.35rem 0.6rem", fontSize: "0.75rem", borderColor: "var(--accent)", color: "var(--accent)", display: "inline-flex", alignItems: "center", gap: "0.4rem" }}
                        >
                          <Settings size={14} />
                          Manage
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

      </div>

      {/* Transactions Modal */}
      {selectedUser && (
        <div style={{ position: "fixed", top: 0, left: 0, right: 0, bottom: 0, background: "rgba(0,0,0,0.6)", backdropFilter: "blur(4px)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 1000, padding: "1rem" }} onClick={() => setSelectedUser(null)}>
          <div style={{ background: "var(--card)", border: "1px solid var(--border)", borderRadius: "16px", padding: "1.5rem", width: "100%", maxWidth: "700px", maxHeight: "85vh", overflowY: "auto", boxShadow: "0 10px 40px rgba(0,0,0,0.2)" }} onClick={(e) => e.stopPropagation()}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "1.5rem" }}>
              <div>
                <h2 style={{ fontSize: "1.2rem", fontWeight: 700, color: "var(--text-primary)" }}>Transaction Report</h2>
                <p style={{ fontSize: "0.85rem", color: "var(--text-muted)" }}>{selectedUser.email}</p>
              </div>
              <button onClick={() => setSelectedUser(null)} style={{ background: "transparent", border: "none", color: "var(--text-muted)", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", padding: "0.5rem", borderRadius: "8px", transition: "all 0.2s" }} className="hover:bg-white/5">
                <X size={20} />
              </button>
            </div>

            {selectedUser.transactions.length === 0 ? (
              <div style={{ padding: "3rem", textAlign: "center", color: "var(--text-muted)", background: "rgba(255,255,255,0.02)", borderRadius: "12px", border: "1px dashed var(--border)" }}>
                No transactions found for this user.
              </div>
            ) : (
              <table style={{ width: "100%", borderCollapse: "collapse", textAlign: "left", fontSize: "0.85rem" }}>
                <thead>
                  <tr style={{ borderBottom: "1px solid var(--border)" }}>
                    <th style={{ padding: "0.75rem 0", color: "var(--text-muted)", fontWeight: 600 }}>Date</th>
                    <th style={{ padding: "0.75rem 0", color: "var(--text-muted)", fontWeight: 600 }}>Amount</th>
                    <th style={{ padding: "0.75rem 0", color: "var(--text-muted)", fontWeight: 600 }}>Reason</th>
                    <th style={{ padding: "0.75rem 0", color: "var(--text-muted)", fontWeight: 600 }}>Category</th>
                  </tr>
                </thead>
                <tbody>
                  {selectedUser.transactions.map((tx) => (
                    <tr key={tx.id} style={{ borderBottom: "1px solid rgba(255,255,255,0.03)" }}>
                      <td style={{ padding: "1rem 0", color: "var(--text)" }}>{new Date(tx.created_at).toLocaleString()}</td>
                      <td style={{ padding: "1rem 0", fontWeight: 700, color: tx.amount > 0 ? "#10b981" : "#ff6584" }}>
                        {tx.amount > 0 ? `+${tx.amount}` : tx.amount}
                      </td>
                      <td style={{ padding: "1rem 0", color: "var(--text)" }}>{tx.reason}</td>
                      <td style={{ padding: "1rem 0" }}>
                        <span style={{ fontSize: "0.7rem", padding: "0.2rem 0.5rem", borderRadius: "12px", background: "rgba(255,255,255,0.05)", border: "1px solid var(--border)", color: "var(--text-muted)", textTransform: "uppercase" }}>
                          {tx.category || "General"}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </div>
      )}

      {/* Management Modal */}
      {managingUser && (
        <div style={{ position: "fixed", top: 0, left: 0, right: 0, bottom: 0, background: "rgba(0,0,0,0.6)", backdropFilter: "blur(4px)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 1000, padding: "1rem" }} onClick={() => setManagingUser(null)}>
          <div style={{ background: "var(--card)", border: "1px solid var(--border)", borderRadius: "16px", padding: "2rem", width: "100%", maxWidth: "500px", boxShadow: "0 10px 40px rgba(0,0,0,0.2)" }} onClick={(e) => e.stopPropagation()}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "1.5rem" }}>
              <div>
                <h2 style={{ fontSize: "1.2rem", fontWeight: 700, color: "var(--text-primary)" }}>Manage Credit Scheme</h2>
                <p style={{ fontSize: "0.85rem", color: "var(--text-muted)" }}>{managingUser.email}</p>
              </div>
              <button onClick={() => setManagingUser(null)} style={{ background: "transparent", border: "none", color: "var(--text-muted)", cursor: "pointer", padding: "0.5rem", borderRadius: "8px" }} className="hover:bg-white/5">
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleManageSubmit} style={{ display: "flex", flexDirection: "column", gap: "1.5rem" }}>
              {/* Tier Section */}
              <div style={{ background: "rgba(255,255,255,0.02)", border: "1px solid var(--border)", borderRadius: "12px", padding: "1rem" }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "1rem" }}>
                  <h3 style={{ fontSize: "0.95rem", fontWeight: 600 }}>Subscription Tier</h3>
                  <button type="button" onClick={suspendPremium} className="btn-secondary" style={{ fontSize: "0.7rem", padding: "0.3rem 0.6rem", borderColor: "#ff6584", color: "#ff6584" }}>
                    Suspend Premium
                  </button>
                </div>
                
                <div style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
                  <label style={{ fontSize: "0.85rem", color: "var(--text-muted)", display: "flex", flexDirection: "column", gap: "0.4rem" }}>
                    Tier Type
                    <select
                      value={manageForm.tier}
                      onChange={(e) => setManageForm({ ...manageForm, tier: e.target.value })}
                      style={{ padding: "0.6rem", borderRadius: "8px", background: "var(--bg)", border: "1px solid var(--border)", color: "var(--text)" }}
                    >
                      <option value="free">Free</option>
                      <option value="sprint">Sprint</option>
                      <option value="pro">Pro</option>
                      <option value="interview_pack">Interview Pack</option>
                    </select>
                  </label>

                  {manageForm.tier !== "free" && (
                    <label style={{ fontSize: "0.85rem", color: "var(--text-muted)", display: "flex", flexDirection: "column", gap: "0.4rem" }}>
                      Tier Expiration Date
                      <input
                        type="date"
                        value={manageForm.tierExpiryDate}
                        onChange={(e) => setManageForm({ ...manageForm, tierExpiryDate: e.target.value })}
                        style={{ padding: "0.6rem", borderRadius: "8px", background: "var(--bg)", border: "1px solid var(--border)", color: "var(--text)" }}
                      />
                    </label>
                  )}
                </div>
              </div>

              {/* Credits Section */}
              <div style={{ background: "rgba(255,255,255,0.02)", border: "1px solid var(--border)", borderRadius: "12px", padding: "1rem" }}>
                <h3 style={{ fontSize: "0.95rem", fontWeight: 600, marginBottom: "1rem" }}>
                  Credit Balance Adjustments
                </h3>
                <div style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
                  <label style={{ fontSize: "0.85rem", color: "var(--text-muted)", display: "flex", flexDirection: "column", gap: "0.4rem" }}>
                    Amount (use negative number to deduct)
                    <input
                      type="number"
                      placeholder="0"
                      value={manageForm.creditAdjustment}
                      onChange={(e) => setManageForm({ ...manageForm, creditAdjustment: Number(e.target.value) })}
                      style={{ padding: "0.6rem", borderRadius: "8px", background: "var(--bg)", border: "1px solid var(--border)", color: "var(--text)" }}
                    />
                  </label>
                  
                  {(manageForm.creditAdjustment !== 0 || manageForm.tier !== managingUser.tier) && (
                    <label style={{ fontSize: "0.85rem", color: "var(--text-muted)", display: "flex", flexDirection: "column", gap: "0.4rem" }}>
                      Reason for Adjustment / Change (Required)
                      <input
                        type="text"
                        placeholder="e.g. Promotional Bonus, Manual Refund..."
                        required
                        value={manageForm.reason}
                        onChange={(e) => setManageForm({ ...manageForm, reason: e.target.value })}
                        style={{ padding: "0.6rem", borderRadius: "8px", background: "var(--bg)", border: "1px solid var(--border)", color: "var(--text)" }}
                      />
                    </label>
                  )}
                </div>
              </div>

              <div style={{ display: "flex", justifyContent: "flex-end", gap: "1rem", marginTop: "0.5rem" }}>
                <button type="button" onClick={() => setManagingUser(null)} className="btn-secondary" style={{ padding: "0.6rem 1.2rem", fontSize: "0.85rem" }}>
                  Cancel
                </button>
                <button type="submit" disabled={isSubmitting} className="btn-primary" style={{ padding: "0.6rem 1.2rem", fontSize: "0.85rem", background: "var(--accent)" }}>
                  {isSubmitting ? "Saving..." : "Save Changes"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
