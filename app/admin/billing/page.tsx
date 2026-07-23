"use client";
import { useEffect, useState } from "react";
import { useToast } from "@/components/ui/toast-1";
import { CreditCard, X, Receipt, Settings } from "lucide-react";

const BillingSkeleton = () => (
  <div className="space-y-6 animate-pulse">
    <div className="h-[400px] rounded-2xl bg-slate-200/50 dark:bg-white/[0.03] border border-slate-200/40 dark:border-white/5" />
  </div>
);

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
    <div className="space-y-8">
          
          {/* Header */}
          <div className="space-y-2">
            <span className="text-[10px] font-bold text-indigo-600 dark:text-indigo-400 uppercase tracking-widest bg-indigo-500/10 px-3 py-1 rounded-full border border-indigo-500/20">
              System Directory
            </span>
            <h1 className="text-3xl md:text-4xl font-extrabold font-['Syne',sans-serif] tracking-tight flex items-center gap-2 mt-2">
              <CreditCard size={32} className="text-indigo-600 dark:text-indigo-400" />
              Billing &amp; Credits
            </h1>
            <p className="text-sm text-slate-600 dark:text-[#9ea3c8] max-w-2xl leading-relaxed">
              Monitor user credit balances, active subscription tiers, and complete payment histories.
            </p>
          </div>

          {errorMsg && (
            <div className="p-4 rounded-xl bg-rose-500/10 border-l-4 border-rose-500 text-rose-300 text-sm">
              {errorMsg}
            </div>
          )}

          {loading ? (
            <BillingSkeleton />
          ) : profiles.length === 0 ? (
            <div className="p-12 text-center rounded-2xl bg-white/80 dark:bg-white/[0.02] border border-slate-200/60 dark:border-white/5 text-slate-500 dark:text-gray-400 shadow-sm">
              No billing profiles found.
            </div>
          ) : (
            <div className="rounded-2xl bg-white/80 dark:bg-slate-950/40 dark:bg-gradient-to-br dark:from-white/[0.05] dark:to-white/[0.01] backdrop-blur-xl border border-slate-200/60 dark:border-white/10 shadow-sm dark:shadow-xl overflow-hidden hover:-translate-y-1 hover:shadow-2xl dark:hover:shadow-[0_20px_50px_rgba(99,102,241,0.08)] transition-all duration-300">
              <div className="overflow-x-auto">
                <table className="w-full border-collapse text-left text-xs md:text-sm">
                  <thead>
                    <tr className="border-b border-slate-200 dark:border-white/10 bg-slate-50 dark:bg-white/[0.01]">
                      <th className="px-6 py-4 font-bold text-slate-500 dark:text-gray-400 uppercase tracking-wider text-[10px]">User Email</th>
                      <th className="px-6 py-4 font-bold text-slate-500 dark:text-gray-400 uppercase tracking-wider text-[10px]">Tier</th>
                      <th className="px-6 py-4 font-bold text-slate-500 dark:text-gray-400 uppercase tracking-wider text-[10px]">Credits</th>
                      <th className="px-6 py-4 font-bold text-slate-500 dark:text-gray-400 uppercase tracking-wider text-[10px]">Referrals</th>
                      <th className="px-6 py-4 font-bold text-slate-500 dark:text-gray-400 uppercase tracking-wider text-[10px] text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {profiles.map((profile) => (
                      <tr key={profile.id} className="border-b border-slate-100 dark:border-white/[0.02] hover:bg-slate-50/50 dark:hover:bg-white/[0.01] transition duration-200">
                        <td className="px-6 py-4 font-semibold text-slate-900 dark:text-white">{profile.email}</td>
                        <td className="px-6 py-4">
                          <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider ${
                            profile.tier === "free" 
                              ? "bg-slate-100 dark:bg-white/5 text-slate-600 dark:text-gray-400 border border-slate-200/40 dark:border-white/5" 
                              : "bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 border border-indigo-500/20"
                          }`}>
                            {profile.tier}
                          </span>
                          {profile.tier_expiry_date && (
                            <div className="text-[10px] text-slate-400 dark:text-gray-500 mt-1">
                              Expires: {new Date(profile.tier_expiry_date).toLocaleDateString()}
                            </div>
                          )}
                        </td>
                        <td className={`px-6 py-4 font-bold ${profile.credit_balance > 0 ? "text-emerald-600 dark:text-emerald-400" : "text-slate-400 dark:text-gray-500"}`}>
                          {profile.credit_balance}
                        </td>
                        <td className={`px-6 py-4 font-semibold ${profile.referral_count > 0 ? "text-indigo-600 dark:text-indigo-400" : "text-slate-400 dark:text-gray-500"}`}>
                          {profile.referral_count || 0}
                        </td>
                        <td className="px-6 py-4 text-right">
                          <div className="flex gap-2 justify-end">
                            <button
                              onClick={() => setSelectedUser(profile)}
                              className="px-3 py-1.5 bg-slate-50 hover:bg-slate-100 dark:bg-white/5 dark:hover:bg-white/10 border border-slate-200 dark:border-white/10 text-slate-700 dark:text-white hover:border-slate-300 rounded-lg text-xs font-bold cursor-pointer transition flex items-center gap-1.5"
                            >
                              <Receipt size={14} />
                              View ({profile.transactions.length})
                            </button>
                            <button
                              onClick={() => openManageModal(profile)}
                              className="px-3 py-1.5 bg-slate-50 hover:bg-slate-100 dark:bg-white/5 dark:hover:bg-white/10 border border-slate-200 dark:border-white/10 text-indigo-600 dark:text-indigo-400 hover:border-indigo-300 dark:hover:border-indigo-400 rounded-lg text-xs font-bold cursor-pointer transition flex items-center gap-1.5"
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
            </div>
          )}

          {/* Transactions Modal */}
          {selectedUser && (
            <div className="fixed inset-0 bg-slate-950/40 dark:bg-black/60 backdrop-blur-sm flex items-center justify-center z-[100] p-4" onClick={() => setSelectedUser(null)}>
              <div className="bg-white dark:bg-[#0a0a14] border border-slate-200 dark:border-white/10 rounded-2xl p-6 w-full max-w-2xl max-h-[80vh] overflow-y-auto shadow-2xl space-y-6" onClick={(e) => e.stopPropagation()}>
                <div className="flex justify-between items-center pb-2 border-b border-slate-100 dark:border-white/5">
                  <div>
                    <h2 className="text-lg font-bold text-slate-900 dark:text-white">Transaction Report</h2>
                    <p className="text-xs text-slate-500 dark:text-gray-400">{selectedUser.email}</p>
                  </div>
                  <button onClick={() => setSelectedUser(null)} className="p-1 bg-transparent border-none text-slate-400 hover:text-slate-600 dark:text-gray-500 dark:hover:text-white cursor-pointer transition">
                    <X size={20} />
                  </button>
                </div>

            {selectedUser.transactions.length === 0 ? (
              <div className="py-12 text-center text-slate-500 dark:text-gray-400 border border-dashed border-slate-200 dark:border-white/5 rounded-xl text-xs md:text-sm">
                No transactions found for this user.
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full border-collapse text-left text-xs md:text-sm">
                  <thead>
                    <tr className="border-b border-slate-100 dark:border-white/5">
                      <th className="pb-3 text-slate-500 dark:text-gray-400 font-bold uppercase tracking-wider text-[10px]">Date</th>
                      <th className="pb-3 text-slate-500 dark:text-gray-400 font-bold uppercase tracking-wider text-[10px]">Amount</th>
                      <th className="pb-3 text-slate-500 dark:text-gray-400 font-bold uppercase tracking-wider text-[10px]">Reason</th>
                      <th className="pb-3 text-slate-500 dark:text-gray-400 font-bold uppercase tracking-wider text-[10px]">Category</th>
                    </tr>
                  </thead>
                  <tbody>
                    {selectedUser.transactions.map((tx) => (
                      <tr key={tx.id} className="border-b border-slate-50 dark:border-white/[0.01]">
                        <td className="py-3 text-slate-800 dark:text-[#e8e9f5] font-mono text-[11px]">{new Date(tx.created_at).toLocaleString()}</td>
                        <td className={`py-3 font-bold ${tx.amount > 0 ? "text-emerald-600 dark:text-emerald-400" : "text-rose-500 dark:text-rose-400"}`}>
                          {tx.amount > 0 ? `+${tx.amount}` : tx.amount}
                        </td>
                        <td className="py-3 text-slate-700 dark:text-[#e8e9f5]">{tx.reason}</td>
                        <td className="py-3">
                          <span className="px-2 py-0.5 rounded-full bg-slate-100 dark:bg-white/5 border border-slate-200/50 dark:border-white/5 text-[9px] font-bold text-slate-500 dark:text-gray-400 uppercase">
                            {tx.category || "General"}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Management Modal */}
      {managingUser && (
        <div className="fixed inset-0 bg-slate-950/40 dark:bg-black/60 backdrop-blur-sm flex items-center justify-center z-[100] p-4" onClick={() => setManagingUser(null)}>
          <div className="bg-white dark:bg-[#0a0a14] border border-slate-200 dark:border-white/10 rounded-2xl p-6 w-full max-w-lg shadow-2xl space-y-6" onClick={(e) => e.stopPropagation()}>
            <div className="flex justify-between items-center pb-2 border-b border-slate-100 dark:border-white/5">
              <div>
                <h2 className="text-lg font-bold text-slate-900 dark:text-white">Manage Credit Scheme</h2>
                <p className="text-xs text-slate-500 dark:text-gray-400">{managingUser.email}</p>
              </div>
              <button onClick={() => setManagingUser(null)} className="p-1 bg-transparent border-none text-slate-400 hover:text-slate-600 dark:text-gray-500 dark:hover:text-white cursor-pointer transition">
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleManageSubmit} className="space-y-6">
              {/* Tier Section */}
              <div className="p-4 rounded-xl bg-slate-50 dark:bg-white/5 border border-slate-150 dark:border-white/5 space-y-4">
                <div className="flex justify-between items-center">
                  <h3 className="text-sm font-bold text-slate-800 dark:text-white">Subscription Tier</h3>
                  <button 
                    type="button" 
                    onClick={suspendPremium} 
                    className="px-2 py-1 bg-rose-50 hover:bg-rose-100 dark:bg-rose-950/20 dark:hover:bg-rose-900/30 border border-rose-200 dark:border-rose-900/30 text-rose-600 dark:text-rose-400 text-[10px] font-bold rounded-lg cursor-pointer transition"
                  >
                    Suspend Premium
                  </button>
                </div>
                
                <div className="grid grid-cols-1 gap-4">
                  <label className="text-xs font-bold text-slate-500 dark:text-[#9ea3c8] block space-y-1">
                    <span>Tier Type</span>
                    <select
                      value={manageForm.tier}
                      onChange={(e) => setManageForm({ ...manageForm, tier: e.target.value })}
                      className="px-3 py-2 rounded-lg bg-white dark:bg-[#0d0d1e] border border-slate-200 dark:border-white/10 text-xs md:text-sm text-[var(--text)] outline-none w-full"
                    >
                      <option value="free">Free</option>
                      <option value="sprint">Sprint</option>
                      <option value="pro">Pro</option>
                      <option value="interview_pack">Interview Pack</option>
                    </select>
                  </label>

                  {manageForm.tier !== "free" && (
                    <label className="text-xs font-bold text-slate-500 dark:text-[#9ea3c8] block space-y-1">
                      <span>Tier Expiration Date</span>
                      <input
                        type="date"
                        value={manageForm.tierExpiryDate}
                        onChange={(e) => setManageForm({ ...manageForm, tierExpiryDate: e.target.value })}
                        className="px-3 py-2 rounded-lg bg-white dark:bg-[#0d0d1e] border border-slate-200/10 text-xs md:text-sm text-[var(--text)] outline-none w-full"
                      />
                    </label>
                  )}
                </div>
              </div>

              {/* Credits Section */}
              <div className="p-4 rounded-xl bg-slate-50 dark:bg-white/5 border border-slate-150 dark:border-white/5 space-y-4">
                <h3 className="text-sm font-bold text-slate-800 dark:text-white">Credit Balance Adjustments</h3>
                <div className="grid grid-cols-1 gap-4">
                  <label className="text-xs font-bold text-slate-500 dark:text-[#9ea3c8] block space-y-1">
                    <span>Amount (use negative number to deduct)</span>
                    <input
                      type="number"
                      placeholder="0"
                      value={manageForm.creditAdjustment}
                      onChange={(e) => setManageForm({ ...manageForm, creditAdjustment: Number(e.target.value) })}
                      className="px-3 py-2 rounded-lg bg-white dark:bg-[#0d0d1e] border border-slate-200 dark:border-white/10 text-xs md:text-sm text-[var(--text)] outline-none w-full"
                    />
                  </label>
                  
                  {(manageForm.creditAdjustment !== 0 || manageForm.tier !== managingUser.tier) && (
                    <label className="text-xs font-bold text-slate-500 dark:text-[#9ea3c8] block space-y-1">
                      <span>Reason for Adjustment / Change (Required)</span>
                      <input
                        type="text"
                        placeholder="e.g. Promotional Bonus, Manual Refund..."
                        required
                        value={manageForm.reason}
                        onChange={(e) => setManageForm({ ...manageForm, reason: e.target.value })}
                        className="px-3 py-2 rounded-lg bg-white dark:bg-[#0d0d1e] border border-slate-200 dark:border-white/10 text-xs md:text-sm text-[var(--text)] outline-none w-full"
                      />
                    </label>
                  )}
                </div>
              </div>

              <div className="flex justify-end gap-2">
                <button 
                  type="button" 
                  onClick={() => setManagingUser(null)} 
                  className="px-4 py-2 bg-slate-100 hover:bg-slate-200 dark:bg-white/5 dark:hover:bg-white/10 border border-slate-200 dark:border-white/10 text-slate-700 dark:text-white font-bold text-xs rounded-xl cursor-pointer transition"
                >
                  Cancel
                </button>
                <button 
                  type="submit" 
                  disabled={isSubmitting} 
                  className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs rounded-xl border-none cursor-pointer transition disabled:opacity-50"
                >
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
