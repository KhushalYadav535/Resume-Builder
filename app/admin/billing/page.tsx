"use client";

import { useEffect, useState, useMemo } from "react";
import { useToast } from "@/components/ui/toast-1";
import {
  CreditCard,
  X,
  Receipt,
  Settings,
  Search,
  Zap,
  Crown,
  Clock,
  Users,
  Coins,
  RefreshCw,
  Sparkles,
  ArrowUpRight,
  ArrowDownRight,
  Copy,
  Check,
  ShieldCheck,
  Filter,
  Calendar,
  Layers,
  ChevronRight,
  AlertCircle
} from "lucide-react";

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

const BillingSkeleton = () => (
  <div className="space-y-6 animate-pulse">
    {/* Metric Cards Skeleton */}
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
      {[1, 2, 3, 4].map((i) => (
        <div key={i} className="h-28 rounded-2xl bg-[var(--bg-elevated)] border border-[var(--border)]" />
      ))}
    </div>
    {/* Table Skeleton */}
    <div className="h-[460px] rounded-2xl bg-[var(--bg-elevated)] border border-[var(--border)]" />
  </div>
);

export default function AdminBillingPage() {
  const { showToast } = useToast();
  const [profiles, setProfiles] = useState<BillingProfile[]>([]);
  const [loading, setLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState("");
  const [copiedCode, setCopiedCode] = useState<string | null>(null);

  // Search & Filter state
  const [searchQuery, setSearchQuery] = useState("");
  const [tierFilter, setTierFilter] = useState<string>("all");
  const [sortBy, setSortBy] = useState<"credits" | "transactions" | "referrals" | "email">("credits");

  // Selected User for Transaction History Modal
  const [selectedUser, setSelectedUser] = useState<BillingProfile | null>(null);

  // Management Modal state
  const [managingUser, setManagingUser] = useState<BillingProfile | null>(null);
  const [manageForm, setManageForm] = useState({
    tier: "free",
    tierExpiryDate: "",
    creditAdjustment: 0,
    reason: "",
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  // ─── Fetch Billing Data ──────────────────────────────────────────────────
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

  // ─── Copy Referral Code ──────────────────────────────────────────────────
  const copyToClipboard = (code: string) => {
    navigator.clipboard.writeText(code);
    setCopiedCode(code);
    showToast("Referral code copied to clipboard", "success");
    setTimeout(() => setCopiedCode(null), 2500);
  };

  // ─── Open Manage Modal ───────────────────────────────────────────────────
  const openManageModal = (user: BillingProfile) => {
    setManagingUser(user);
    setManageForm({
      tier: user.tier || "free",
      tierExpiryDate: user.tier_expiry_date
        ? new Date(user.tier_expiry_date).toISOString().split("T")[0]
        : "",
      creditAdjustment: 0,
      reason: "",
    });
  };

  // ─── Preset Expiration Date ──────────────────────────────────────────────
  const applyPresetExpiry = (days: number) => {
    const d = new Date();
    d.setDate(d.getDate() + days);
    setManageForm((prev) => ({
      ...prev,
      tierExpiryDate: d.toISOString().split("T")[0],
    }));
  };

  const suspendPremium = () => {
    setManageForm((prev) => ({
      ...prev,
      tier: "free",
      tierExpiryDate: "",
      reason: prev.reason || "Administrative downgrade to Free tier",
    }));
  };

  // ─── Submit Changes ──────────────────────────────────────────────────────
  const handleManageSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!managingUser) return;

    setIsSubmitting(true);
    try {
      const payload = {
        userId: managingUser.id,
        newTier: manageForm.tier,
        tierExpiryDate: manageForm.tierExpiryDate
          ? new Date(manageForm.tierExpiryDate).toISOString()
          : null,
        creditAdjustment: Number(manageForm.creditAdjustment) || 0,
        reason: manageForm.reason || "Administrative adjustment",
      };

      const res = await fetch("/api/admin/billing/manage", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.error || "Failed to update user billing profile.");
      }

      showToast("User billing & credit profile updated successfully", "success");
      setManagingUser(null);
      fetchBillingData();
    } catch (err: any) {
      showToast(err.message || "An unexpected error occurred.", "error");
    } finally {
      setIsSubmitting(false);
    }
  };

  // ─── Aggregated KPIs ─────────────────────────────────────────────────────
  const kpis = useMemo(() => {
    const totalUsers = profiles.length;
    const paidTiers = ["sprint", "pro", "interview_pack"];
    const monetizedUsers = profiles.filter((p) => paidTiers.includes(p.tier?.toLowerCase())).length;
    const totalCirculatingCredits = profiles.reduce((acc, p) => acc + (p.credit_balance || 0), 0);
    const totalTransactions = profiles.reduce((acc, p) => acc + (p.transactions?.length || 0), 0);
    const totalReferrals = profiles.reduce((acc, p) => acc + (p.referral_count || 0), 0);

    const proCount = profiles.filter((p) => p.tier?.toLowerCase() === "pro").length;
    const sprintCount = profiles.filter((p) => p.tier?.toLowerCase() === "sprint").length;
    const interviewCount = profiles.filter((p) => p.tier?.toLowerCase() === "interview_pack").length;
    const freeCount = profiles.filter((p) => !p.tier || p.tier?.toLowerCase() === "free").length;
    const hasCreditsCount = profiles.filter((p) => (p.credit_balance || 0) > 0).length;

    return {
      totalUsers,
      monetizedUsers,
      totalCirculatingCredits,
      totalTransactions,
      totalReferrals,
      proCount,
      sprintCount,
      interviewCount,
      freeCount,
      hasCreditsCount,
    };
  }, [profiles]);

  // ─── Filtered & Sorted Profiles ──────────────────────────────────────────
  const filteredProfiles = useMemo(() => {
    return profiles
      .filter((p) => {
        // Search filter
        const q = searchQuery.toLowerCase().trim();
        const matchesQuery =
          !q ||
          p.email?.toLowerCase().includes(q) ||
          p.id?.toLowerCase().includes(q) ||
          p.referral_code?.toLowerCase().includes(q);

        // Tier filter
        let matchesTier = true;
        if (tierFilter === "pro") matchesTier = p.tier?.toLowerCase() === "pro";
        else if (tierFilter === "sprint") matchesTier = p.tier?.toLowerCase() === "sprint";
        else if (tierFilter === "interview_pack") matchesTier = p.tier?.toLowerCase() === "interview_pack";
        else if (tierFilter === "free") matchesTier = !p.tier || p.tier?.toLowerCase() === "free";
        else if (tierFilter === "has_credits") matchesTier = (p.credit_balance || 0) > 0;

        return matchesQuery && matchesTier;
      })
      .sort((a, b) => {
        if (sortBy === "credits") return (b.credit_balance || 0) - (a.credit_balance || 0);
        if (sortBy === "transactions") return (b.transactions?.length || 0) - (a.transactions?.length || 0);
        if (sortBy === "referrals") return (b.referral_count || 0) - (a.referral_count || 0);
        return a.email.localeCompare(b.email);
      });
  }, [profiles, searchQuery, tierFilter, sortBy]);

  // ─── Tier Badge Renderer ─────────────────────────────────────────────────
  const renderTierBadge = (tier: string) => {
    const t = (tier || "free").toLowerCase();
    switch (t) {
      case "pro":
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-black uppercase tracking-wider bg-blue-500/10 text-blue-600 dark:text-blue-400 border border-blue-500/30 shadow-xs">
            <Crown size={12} className="text-blue-500" />
            <span>Pro Tier</span>
          </span>
        );
      case "sprint":
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-black uppercase tracking-wider bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/30 shadow-xs">
            <Zap size={12} className="text-amber-500" />
            <span>Sprint</span>
          </span>
        );
      case "interview_pack":
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-black uppercase tracking-wider bg-purple-500/10 text-purple-600 dark:text-purple-400 border border-purple-500/30 shadow-xs">
            <Sparkles size={12} className="text-purple-500" />
            <span>Interview Pack</span>
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-bold uppercase tracking-wider bg-slate-500/10 text-slate-600 dark:text-slate-400 border border-slate-500/20">
            <span>Free</span>
          </span>
        );
    }
  };

  return (
    <div className="space-y-8 font-sans">
      
      {/* ── EXECUTIVE HEADER ── */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 pb-6 border-b border-[var(--border)]">
        <div className="space-y-2">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/25 text-emerald-600 dark:text-emerald-400 text-xs font-bold uppercase tracking-wider">
            <Coins size={12} className="text-emerald-500" />
            <span>UPROLE PLATFORM COMMAND · MONETIZATION & CREDIT LEDGER</span>
          </div>

          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#101B3B] to-[#10B981] flex items-center justify-center text-white shadow-md border border-white/10 shrink-0">
              <CreditCard size={22} className="text-emerald-400" />
            </div>
            <h1 className="text-2xl md:text-3xl font-extrabold tracking-tight text-[var(--text-primary)] font-['Syne',sans-serif]">
              Billing, Subscriptions & Credit Ledger
            </h1>
          </div>

          <p className="text-sm text-[var(--text-muted)] max-w-2xl leading-relaxed">
            Monitor platform-wide subscription quotas, wallet credit liabilities, transaction audits, and manage administrative quota grants.
          </p>
        </div>

        {/* Action Controls */}
        <div className="flex items-center gap-3 self-start md:self-center shrink-0">
          <button
            onClick={fetchBillingData}
            disabled={loading}
            className="px-4 py-2.5 rounded-xl bg-[var(--bg-elevated)] border border-[var(--border)] text-xs font-bold text-[var(--text-primary)] hover:border-emerald-500/40 hover:bg-emerald-500/10 transition-all flex items-center gap-2 cursor-pointer shadow-xs disabled:opacity-50"
          >
            <RefreshCw
              size={14}
              className={loading ? "animate-spin text-emerald-500" : "text-[var(--text-muted)]"}
            />
            <span>Refresh Ledger</span>
          </button>
        </div>
      </div>

      {/* Error Notice */}
      {errorMsg && (
        <div className="p-4 rounded-xl bg-rose-500/10 border border-rose-500/30 flex items-center gap-3 text-rose-600 dark:text-rose-400 text-sm">
          <AlertCircle size={18} className="shrink-0" />
          <span>{errorMsg}</span>
        </div>
      )}

      {/* ── METRIC CARDS (4 EXECUTIVE KPIS) ── */}
      <section className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Metric 1: Monetized Users */}
        <div className="p-5 rounded-2xl bg-[var(--bg-elevated)] border border-[var(--border)] shadow-xs relative overflow-hidden group hover:border-blue-500/40 transition-all">
          <div className="absolute top-0 left-0 right-0 h-[2px] bg-blue-500" />
          <div className="flex items-center justify-between text-[var(--text-muted)] mb-2">
            <span className="text-xs font-bold uppercase tracking-wider">Paid Subscribers</span>
            <div className="w-7 h-7 rounded-lg bg-blue-500/10 text-blue-500 flex items-center justify-center">
              <Crown size={15} />
            </div>
          </div>
          <div className="text-2xl md:text-3xl font-black text-[var(--text-primary)] font-['Syne',sans-serif]">
            {loading ? "..." : kpis.monetizedUsers}
          </div>
          <div className="text-[11px] text-[var(--text-muted)] mt-1 flex items-center gap-1.5">
            <span className="text-blue-600 dark:text-blue-400 font-bold">
              {kpis.totalUsers > 0 ? Math.round((kpis.monetizedUsers / kpis.totalUsers) * 100) : 0}%
            </span>
            <span>of {kpis.totalUsers} registered users</span>
          </div>
        </div>

        {/* Metric 2: Circulating Credits */}
        <div className="p-5 rounded-2xl bg-[var(--bg-elevated)] border border-[var(--border)] shadow-xs relative overflow-hidden group hover:border-emerald-500/40 transition-all">
          <div className="absolute top-0 left-0 right-0 h-[2px] bg-emerald-500" />
          <div className="flex items-center justify-between text-[var(--text-muted)] mb-2">
            <span className="text-xs font-bold uppercase tracking-wider">Circulating Credits</span>
            <div className="w-7 h-7 rounded-lg bg-emerald-500/10 text-emerald-500 flex items-center justify-center">
              <Coins size={15} />
            </div>
          </div>
          <div className="text-2xl md:text-3xl font-black text-emerald-500 font-['Syne',sans-serif]">
            {loading ? "..." : kpis.totalCirculatingCredits.toLocaleString()}
          </div>
          <div className="text-[11px] text-[var(--text-muted)] mt-1">
            Active wallet balances in system
          </div>
        </div>

        {/* Metric 3: Transaction Events */}
        <div className="p-5 rounded-2xl bg-[var(--bg-elevated)] border border-[var(--border)] shadow-xs relative overflow-hidden group hover:border-amber-500/40 transition-all">
          <div className="absolute top-0 left-0 right-0 h-[2px] bg-amber-500" />
          <div className="flex items-center justify-between text-[var(--text-muted)] mb-2">
            <span className="text-xs font-bold uppercase tracking-wider">Audit Transactions</span>
            <div className="w-7 h-7 rounded-lg bg-amber-500/10 text-amber-500 flex items-center justify-center">
              <Receipt size={15} />
            </div>
          </div>
          <div className="text-2xl md:text-3xl font-black text-amber-500 font-['Syne',sans-serif]">
            {loading ? "..." : kpis.totalTransactions.toLocaleString()}
          </div>
          <div className="text-[11px] text-[var(--text-muted)] mt-1">
            Historical credit adjustments & burns
          </div>
        </div>

        {/* Metric 4: Referral Network */}
        <div className="p-5 rounded-2xl bg-[var(--bg-elevated)] border border-[var(--border)] shadow-xs relative overflow-hidden group hover:border-purple-500/40 transition-all">
          <div className="absolute top-0 left-0 right-0 h-[2px] bg-purple-500" />
          <div className="flex items-center justify-between text-[var(--text-muted)] mb-2">
            <span className="text-xs font-bold uppercase tracking-wider">Referral Invites</span>
            <div className="w-7 h-7 rounded-lg bg-purple-500/10 text-purple-500 flex items-center justify-center">
              <Users size={15} />
            </div>
          </div>
          <div className="text-2xl md:text-3xl font-black text-purple-500 font-['Syne',sans-serif]">
            {loading ? "..." : kpis.totalReferrals}
          </div>
          <div className="text-[11px] text-[var(--text-muted)] mt-1">
            Organic invitation conversions
          </div>
        </div>
      </section>

      {/* ── SEARCH & FILTER CONTROLS BAR ── */}
      <div className="flex flex-col md:flex-row gap-3 items-stretch md:items-center justify-between bg-[var(--bg-elevated)] border border-[var(--border)] p-3.5 rounded-2xl shadow-xs">
        {/* Search */}
        <div className="relative flex-1 min-w-[260px]">
          <Search size={14} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[var(--text-muted)] pointer-events-none" />
          <input
            type="text"
            placeholder="Search by user email, user ID, or referral code..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-4 py-2 rounded-xl bg-[var(--bg-page)] border border-[var(--border)] text-xs text-[var(--text-primary)] placeholder-[var(--text-muted)] focus:outline-none focus:border-emerald-500/50 transition-all"
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery("")}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-[var(--text-muted)] hover:text-[var(--text-primary)]"
            >
              <X size={12} />
            </button>
          )}
        </div>

        {/* Tier Filters Pills */}
        <div className="flex items-center gap-1.5 overflow-x-auto [scrollbar-width:none] pb-1 md:pb-0">
          {[
            { key: "all", label: `All (${kpis.totalUsers})` },
            { key: "pro", label: `Pro (${kpis.proCount})` },
            { key: "sprint", label: `Sprint (${kpis.sprintCount})` },
            { key: "interview_pack", label: `Interview Pack (${kpis.interviewCount})` },
            { key: "free", label: `Free (${kpis.freeCount})` },
            { key: "has_credits", label: `Has Credits (${kpis.hasCreditsCount})` },
          ].map((pill) => (
            <button
              key={pill.key}
              onClick={() => setTierFilter(pill.key)}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer whitespace-nowrap border ${
                tierFilter === pill.key
                  ? "bg-emerald-500 text-brand-navy border-emerald-500 font-extrabold shadow-2xs"
                  : "bg-[var(--bg-page)] text-[var(--text-secondary)] border-[var(--border)] hover:border-emerald-500/30 hover:text-[var(--text-primary)]"
              }`}
            >
              {pill.label}
            </button>
          ))}
        </div>

        {/* Sort Dropdown */}
        <div className="flex items-center gap-2 shrink-0">
          <label className="text-[11px] font-bold text-[var(--text-muted)] uppercase flex items-center gap-1">
            <Filter size={11} />
            <span>Sort:</span>
          </label>
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value as any)}
            className="px-3 py-1.5 rounded-xl bg-[var(--bg-page)] border border-[var(--border)] text-xs font-bold text-[var(--text-primary)] outline-none cursor-pointer focus:border-emerald-500/50 transition-all"
          >
            <option value="credits">Highest Credits</option>
            <option value="transactions">Most Transactions</option>
            <option value="referrals">Most Referrals</option>
            <option value="email">User Email (A-Z)</option>
          </select>
        </div>
      </div>

      {/* ── FINANCIAL LEDGER TABLE ── */}
      {loading ? (
        <BillingSkeleton />
      ) : filteredProfiles.length === 0 ? (
        <div className="p-12 text-center rounded-2xl bg-[var(--bg-elevated)] border border-dashed border-[var(--border)] text-[var(--text-muted)] space-y-3">
          <CreditCard size={36} className="mx-auto text-[var(--text-muted)] opacity-50" />
          <p className="font-bold text-sm text-[var(--text-primary)]">No billing profiles matched your criteria.</p>
          <p className="text-xs max-w-sm mx-auto">
            Try resetting your search query or filter tags to reveal platform records.
          </p>
          {(searchQuery || tierFilter !== "all") && (
            <button
              onClick={() => {
                setSearchQuery("");
                setTierFilter("all");
              }}
              className="px-4 py-1.5 text-xs font-bold rounded-xl bg-emerald-500/10 text-emerald-500 border border-emerald-500/20 hover:bg-emerald-500/20 transition-all cursor-pointer"
            >
              Reset Filters
            </button>
          )}
        </div>
      ) : (
        <div className="rounded-2xl bg-[var(--bg-elevated)] border border-[var(--border)] shadow-xs overflow-hidden backdrop-blur-xl">
          <div className="overflow-x-auto">
            <table className="w-full border-collapse text-left text-xs">
              <thead>
                <tr className="border-b border-[var(--border)] bg-[var(--bg-page)] text-[var(--text-muted)] font-bold text-[10px] uppercase tracking-wider">
                  <th className="px-6 py-3.5">User / Account</th>
                  <th className="px-6 py-3.5">Subscription Tier</th>
                  <th className="px-6 py-3.5">Credit Balance</th>
                  <th className="px-6 py-3.5">Referral Track</th>
                  <th className="px-6 py-3.5">Audit Ledger</th>
                  <th className="px-6 py-3.5 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[var(--border)]">
                {filteredProfiles.map((profile) => {
                  const isExpiringSoon =
                    profile.tier_expiry_date &&
                    new Date(profile.tier_expiry_date).getTime() - Date.now() < 7 * 24 * 60 * 60 * 1000;
                  const isExpired =
                    profile.tier_expiry_date &&
                    new Date(profile.tier_expiry_date).getTime() < Date.now();

                  return (
                    <tr
                      key={profile.id}
                      className="hover:bg-[var(--bg-page)]/70 transition-colors group"
                    >
                      {/* User / Email Column */}
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-full bg-gradient-to-br from-[#101B3B] to-[#2563EB] text-white flex items-center justify-center font-bold text-xs shadow-xs border border-white/10 shrink-0">
                            {profile.email?.charAt(0).toUpperCase() || "U"}
                          </div>
                          <div>
                            <div className="font-bold text-[var(--text-primary)] flex items-center gap-2">
                              <span>{profile.email}</span>
                              {profile.role === "admin" && (
                                <span className="px-1.5 py-0.5 rounded bg-amber-500/15 text-amber-600 dark:text-amber-400 text-[9px] font-black uppercase tracking-wider border border-amber-500/25">
                                  ADMIN
                                </span>
                              )}
                            </div>
                            <div className="text-[10px] font-mono text-[var(--text-muted)] mt-0.5">
                              ID: {profile.id.slice(0, 8)}...{profile.id.slice(-4)}
                            </div>
                          </div>
                        </div>
                      </td>

                      {/* Tier Column */}
                      <td className="px-6 py-4">
                        <div className="space-y-1">
                          <div>{renderTierBadge(profile.tier)}</div>
                          {profile.tier_expiry_date && (
                            <div
                              className={`text-[10px] flex items-center gap-1 font-mono ${
                                isExpired
                                  ? "text-rose-500 font-bold"
                                  : isExpiringSoon
                                  ? "text-amber-500 font-bold"
                                  : "text-[var(--text-muted)]"
                              }`}
                            >
                              <Calendar size={10} />
                              <span>
                                {isExpired ? "Expired: " : "Expires: "}
                                {new Date(profile.tier_expiry_date).toLocaleDateString()}
                              </span>
                            </div>
                          )}
                        </div>
                      </td>

                      {/* Credit Balance Column */}
                      <td className="px-6 py-4">
                        <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg border font-mono font-bold text-xs ${
                          profile.credit_balance > 0
                            ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/25'
                            : 'bg-slate-500/5 text-slate-500 dark:text-slate-400 border-slate-500/15'
                        }">
                          <Coins size={13} className={profile.credit_balance > 0 ? "text-emerald-500" : "text-slate-400"} />
                          <span>{profile.credit_balance}</span>
                          <span className="text-[9px] font-sans text-[var(--text-muted)] uppercase tracking-wide">
                            credits
                          </span>
                        </div>
                      </td>

                      {/* Referral Track Column */}
                      <td className="px-6 py-4">
                        <div className="space-y-1">
                          <div className="flex items-center gap-1.5">
                            <span className="text-xs font-bold text-[var(--text-primary)]">
                              {profile.referral_count || 0}
                            </span>
                            <span className="text-[10px] text-[var(--text-muted)]">referrals</span>
                          </div>
                          {profile.referral_code && (
                            <button
                              onClick={() => copyToClipboard(profile.referral_code!)}
                              title="Click to copy referral code"
                              className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded bg-[var(--bg-page)] hover:bg-emerald-500/10 border border-[var(--border)] hover:border-emerald-500/30 text-[10px] font-mono text-[var(--text-muted)] hover:text-emerald-600 dark:hover:text-emerald-400 transition-all cursor-pointer"
                            >
                              {copiedCode === profile.referral_code ? (
                                <Check size={10} className="text-emerald-500" />
                              ) : (
                                <Copy size={10} />
                              )}
                              <span>{profile.referral_code}</span>
                            </button>
                          )}
                        </div>
                      </td>

                      {/* Audit Ledger / Transaction count */}
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-1.5">
                          <span className="w-2 h-2 rounded-full bg-blue-500" />
                          <span className="font-bold text-[var(--text-primary)]">
                            {profile.transactions?.length || 0}
                          </span>
                          <span className="text-[10px] text-[var(--text-muted)]">events</span>
                        </div>
                      </td>

                      {/* Actions Column */}
                      <td className="px-6 py-4 text-right">
                        <div className="flex items-center justify-end gap-2">
                          <button
                            onClick={() => setSelectedUser(profile)}
                            className="px-3 py-1.5 rounded-xl bg-[var(--bg-page)] hover:bg-[var(--bg-elevated)] border border-[var(--border)] hover:border-blue-500/30 text-[var(--text-primary)] font-bold text-xs flex items-center gap-1.5 cursor-pointer transition-all shadow-2xs"
                          >
                            <Receipt size={13} className="text-blue-500" />
                            <span>Audit Ledger</span>
                          </button>
                          <button
                            onClick={() => openManageModal(profile)}
                            className="px-3 py-1.5 rounded-xl bg-emerald-500/10 hover:bg-emerald-500/20 border border-emerald-500/25 text-emerald-600 dark:text-emerald-400 font-bold text-xs flex items-center gap-1.5 cursor-pointer transition-all shadow-2xs"
                          >
                            <Settings size={13} className="text-emerald-500" />
                            <span>Manage</span>
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          {/* Table Footer */}
          <div className="p-4 border-t border-[var(--border)] bg-[var(--bg-page)]/50 flex flex-col sm:flex-row items-center justify-between text-xs text-[var(--text-muted)] gap-2">
            <span>
              Showing <strong className="text-[var(--text-primary)]">{filteredProfiles.length}</strong> of{" "}
              <strong className="text-[var(--text-primary)]">{profiles.length}</strong> user profiles
            </span>
            <span className="text-[11px]">
              Tip: Click <strong>Manage</strong> to grant bonus credits, extend active subscription dates, or alter tiers.
            </span>
          </div>
        </div>
      )}

      {/* ══════════════════════════════════════════════════════════════════════
          TRANSACTIONS AUDIT MODAL
      ══════════════════════════════════════════════════════════════════════ */}
      {selectedUser && (
        <div
          className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-[100] p-4 animate-in fade-in duration-200"
          onClick={() => setSelectedUser(null)}
        >
          <div
            className="bg-[var(--bg-elevated)] border border-[var(--border)] rounded-2xl p-6 w-full max-w-3xl max-h-[85vh] overflow-y-auto shadow-2xl space-y-6"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Modal Header */}
            <div className="flex items-center justify-between pb-4 border-b border-[var(--border)]">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-blue-500/10 border border-blue-500/20 text-blue-500 flex items-center justify-center shrink-0">
                  <Receipt size={20} />
                </div>
                <div>
                  <h2 className="text-base md:text-lg font-bold text-[var(--text-primary)] font-['Syne',sans-serif]">
                    Credit Ledger & Transaction Audit
                  </h2>
                  <p className="text-xs text-[var(--text-muted)] font-mono">
                    {selectedUser.email} · ID: {selectedUser.id}
                  </p>
                </div>
              </div>
              <button
                onClick={() => setSelectedUser(null)}
                className="p-1.5 rounded-lg bg-[var(--bg-page)] border border-[var(--border)] text-[var(--text-muted)] hover:text-[var(--text-primary)] hover:border-rose-500/30 transition-all cursor-pointer"
              >
                <X size={16} />
              </button>
            </div>

            {/* Quick Summary Cards */}
            <div className="grid grid-cols-3 gap-3">
              <div className="p-3 rounded-xl bg-[var(--bg-page)] border border-[var(--border)]">
                <span className="text-[10px] font-bold text-[var(--text-muted)] uppercase tracking-wider block">Current Balance</span>
                <span className="text-lg font-black text-emerald-500 font-mono">{selectedUser.credit_balance}</span>
              </div>
              <div className="p-3 rounded-xl bg-[var(--bg-page)] border border-[var(--border)]">
                <span className="text-[10px] font-bold text-[var(--text-muted)] uppercase tracking-wider block">Current Tier</span>
                <span className="text-xs font-black uppercase text-[var(--text-primary)] block mt-1">
                  {selectedUser.tier || "Free"}
                </span>
              </div>
              <div className="p-3 rounded-xl bg-[var(--bg-page)] border border-[var(--border)]">
                <span className="text-[10px] font-bold text-[var(--text-muted)] uppercase tracking-wider block">Total Logged Events</span>
                <span className="text-lg font-black text-blue-500 font-mono">{selectedUser.transactions?.length || 0}</span>
              </div>
            </div>

            {/* Transactions List */}
            {(!selectedUser.transactions || selectedUser.transactions.length === 0) ? (
              <div className="py-12 text-center text-[var(--text-muted)] border border-dashed border-[var(--border)] rounded-xl text-xs">
                No credit transactions have been logged for this account yet.
              </div>
            ) : (
              <div className="rounded-xl border border-[var(--border)] overflow-hidden">
                <table className="w-full border-collapse text-left text-xs">
                  <thead>
                    <tr className="border-b border-[var(--border)] bg-[var(--bg-page)] text-[var(--text-muted)] font-bold text-[10px] uppercase tracking-wider">
                      <th className="px-4 py-2.5">Date & Time</th>
                      <th className="px-4 py-2.5">Credit Delta</th>
                      <th className="px-4 py-2.5">Reason / Audit Memo</th>
                      <th className="px-4 py-2.5">Category</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[var(--border)]">
                    {selectedUser.transactions.map((tx) => {
                      const isPositive = tx.amount > 0;
                      return (
                        <tr key={tx.id} className="hover:bg-[var(--bg-page)]/50 transition-colors">
                          <td className="px-4 py-3 font-mono text-[11px] text-[var(--text-muted)]">
                            {new Date(tx.created_at).toLocaleString()}
                          </td>
                          <td className="px-4 py-3">
                            <span
                              className={`inline-flex items-center gap-1 font-mono font-bold text-xs px-2 py-0.5 rounded ${
                                isPositive
                                  ? "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20"
                                  : tx.amount < 0
                                  ? "bg-rose-500/10 text-rose-600 dark:text-rose-400 border border-rose-500/20"
                                  : "bg-slate-500/10 text-slate-500 border border-slate-500/20"
                              }`}
                            >
                              {isPositive ? (
                                <ArrowUpRight size={11} className="text-emerald-500" />
                              ) : tx.amount < 0 ? (
                                <ArrowDownRight size={11} className="text-rose-500" />
                              ) : null}
                              <span>{tx.amount > 0 ? `+${tx.amount}` : tx.amount}</span>
                            </span>
                          </td>
                          <td className="px-4 py-3 font-medium text-[var(--text-primary)]">
                            {tx.reason || "System ledger event"}
                          </td>
                          <td className="px-4 py-3">
                            <span className="px-2 py-0.5 rounded-full bg-[var(--bg-page)] border border-[var(--border)] text-[9px] font-bold text-[var(--text-muted)] uppercase tracking-wider">
                              {tx.category || "General"}
                            </span>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}

            {/* Modal Actions */}
            <div className="flex justify-between items-center pt-2">
              <button
                type="button"
                onClick={() => {
                  const target = selectedUser;
                  setSelectedUser(null);
                  openManageModal(target);
                }}
                className="px-4 py-2 rounded-xl bg-emerald-500/10 hover:bg-emerald-500/20 border border-emerald-500/25 text-emerald-600 dark:text-emerald-400 text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5"
              >
                <Settings size={13} />
                <span>Adjust Quotas for this User</span>
              </button>
              <button
                type="button"
                onClick={() => setSelectedUser(null)}
                className="px-4 py-2 rounded-xl bg-[var(--bg-page)] hover:bg-[var(--bg-elevated)] border border-[var(--border)] text-[var(--text-primary)] text-xs font-bold transition-all cursor-pointer"
              >
                Close Audit
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ══════════════════════════════════════════════════════════════════════
          MANAGEMENT MODAL (TIER & CREDITS ADJUSTMENT)
      ══════════════════════════════════════════════════════════════════════ */}
      {managingUser && (
        <div
          className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-[100] p-4 animate-in fade-in duration-200"
          onClick={() => setManagingUser(null)}
        >
          <div
            className="bg-[var(--bg-elevated)] border border-[var(--border)] rounded-2xl p-6 w-full max-w-lg shadow-2xl space-y-6"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Modal Header */}
            <div className="flex items-center justify-between pb-4 border-b border-[var(--border)]">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-500 flex items-center justify-center shrink-0">
                  <Settings size={20} />
                </div>
                <div>
                  <h2 className="text-base md:text-lg font-bold text-[var(--text-primary)] font-['Syne',sans-serif]">
                    Manage Subscription & Credits
                  </h2>
                  <p className="text-xs text-[var(--text-muted)] font-mono">
                    {managingUser.email}
                  </p>
                </div>
              </div>
              <button
                onClick={() => setManagingUser(null)}
                className="p-1.5 rounded-lg bg-[var(--bg-page)] border border-[var(--border)] text-[var(--text-muted)] hover:text-[var(--text-primary)] hover:border-rose-500/30 transition-all cursor-pointer"
              >
                <X size={16} />
              </button>
            </div>

            <form onSubmit={handleManageSubmit} className="space-y-6">
              {/* SECTION 1: SUBSCRIPTION TIER */}
              <div className="p-4 rounded-xl bg-[var(--bg-page)] border border-[var(--border)] space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-extrabold uppercase tracking-wider text-[var(--text-primary)] flex items-center gap-1.5">
                    <Crown size={14} className="text-blue-500" />
                    <span>Subscription Plan</span>
                  </span>
                  {managingUser.tier !== "free" && (
                    <button
                      type="button"
                      onClick={suspendPremium}
                      className="px-2 py-1 bg-rose-500/10 hover:bg-rose-500/20 border border-rose-500/25 text-rose-600 dark:text-rose-400 text-[10px] font-bold rounded-lg cursor-pointer transition-all"
                    >
                      Suspend to Free
                    </button>
                  )}
                </div>

                <div className="space-y-3">
                  <div>
                    <label className="text-[11px] font-bold text-[var(--text-muted)] block mb-1">
                      Tier Level
                    </label>
                    <select
                      value={manageForm.tier}
                      onChange={(e) => setManageForm({ ...manageForm, tier: e.target.value })}
                      className="w-full px-3 py-2 rounded-xl bg-[var(--bg-elevated)] border border-[var(--border)] text-xs font-bold text-[var(--text-primary)] outline-none cursor-pointer focus:border-emerald-500/50 transition-all"
                    >
                      <option value="free">Free Tier</option>
                      <option value="sprint">Sprint (Growth Accelerated)</option>
                      <option value="pro">Pro (Executive Tier)</option>
                      <option value="interview_pack">Interview Pack (Advanced Coaching)</option>
                    </select>
                  </div>

                  {manageForm.tier !== "free" && (
                    <div className="space-y-2 pt-1">
                      <label className="text-[11px] font-bold text-[var(--text-muted)] block">
                        Tier Expiration Date
                      </label>
                      <input
                        type="date"
                        value={manageForm.tierExpiryDate}
                        onChange={(e) => setManageForm({ ...manageForm, tierExpiryDate: e.target.value })}
                        className="w-full px-3 py-2 rounded-xl bg-[var(--bg-elevated)] border border-[var(--border)] text-xs text-[var(--text-primary)] outline-none focus:border-emerald-500/50 transition-all font-mono"
                      />
                      {/* Presets */}
                      <div className="flex items-center gap-1.5 pt-1">
                        <span className="text-[10px] text-[var(--text-muted)] font-medium">Quick Presets:</span>
                        <button
                          type="button"
                          onClick={() => applyPresetExpiry(30)}
                          className="px-2 py-0.5 rounded-md bg-[var(--bg-elevated)] border border-[var(--border)] text-[10px] font-bold hover:border-emerald-500/30 transition-all cursor-pointer text-[var(--text-secondary)]"
                        >
                          +30 Days
                        </button>
                        <button
                          type="button"
                          onClick={() => applyPresetExpiry(90)}
                          className="px-2 py-0.5 rounded-md bg-[var(--bg-elevated)] border border-[var(--border)] text-[10px] font-bold hover:border-emerald-500/30 transition-all cursor-pointer text-[var(--text-secondary)]"
                        >
                          +90 Days
                        </button>
                        <button
                          type="button"
                          onClick={() => applyPresetExpiry(365)}
                          className="px-2 py-0.5 rounded-md bg-[var(--bg-elevated)] border border-[var(--border)] text-[10px] font-bold hover:border-emerald-500/30 transition-all cursor-pointer text-[var(--text-secondary)]"
                        >
                          +1 Year
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* SECTION 2: CREDIT ADJUSTMENT */}
              <div className="p-4 rounded-xl bg-[var(--bg-page)] border border-[var(--border)] space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-extrabold uppercase tracking-wider text-[var(--text-primary)] flex items-center gap-1.5">
                    <Coins size={14} className="text-emerald-500" />
                    <span>Credit Balance Adjustment</span>
                  </span>
                  <span className="text-[11px] font-mono text-[var(--text-muted)]">
                    Current: <strong className="text-emerald-500">{managingUser.credit_balance}</strong>
                  </span>
                </div>

                <div className="space-y-3">
                  <div>
                    <label className="text-[11px] font-bold text-[var(--text-muted)] block mb-1">
                      Adjustment Delta (+ to credit, - to deduct)
                    </label>
                    <div className="flex items-center gap-3">
                      <input
                        type="number"
                        placeholder="0"
                        value={manageForm.creditAdjustment}
                        onChange={(e) =>
                          setManageForm({ ...manageForm, creditAdjustment: Number(e.target.value) })
                        }
                        className="flex-1 px-3 py-2 rounded-xl bg-[var(--bg-elevated)] border border-[var(--border)] text-xs font-mono text-[var(--text-primary)] outline-none focus:border-emerald-500/50 transition-all"
                      />
                      {/* Projected Balance Pill */}
                      <div className="px-3 py-2 rounded-xl bg-[var(--bg-elevated)] border border-[var(--border)] text-xs font-mono shrink-0">
                        <span className="text-[10px] text-[var(--text-muted)] mr-1.5">Projected:</span>
                        <strong
                          className={
                            managingUser.credit_balance + (Number(manageForm.creditAdjustment) || 0) >= 0
                              ? "text-emerald-500"
                              : "text-rose-500"
                          }
                        >
                          {managingUser.credit_balance + (Number(manageForm.creditAdjustment) || 0)}
                        </strong>
                      </div>
                    </div>
                  </div>

                  {/* Reason field (mandatory if changes detected) */}
                  <div>
                    <label className="text-[11px] font-bold text-[var(--text-muted)] block mb-1">
                      Audit Reason memo
                    </label>
                    <input
                      type="text"
                      placeholder="e.g. Promotional Bonus, Goodwill Grant, Support Ticket #124..."
                      value={manageForm.reason}
                      onChange={(e) => setManageForm({ ...manageForm, reason: e.target.value })}
                      required={
                        manageForm.creditAdjustment !== 0 || manageForm.tier !== managingUser.tier
                      }
                      className="w-full px-3 py-2 rounded-xl bg-[var(--bg-elevated)] border border-[var(--border)] text-xs text-[var(--text-primary)] placeholder-[var(--text-muted)] outline-none focus:border-emerald-500/50 transition-all"
                    />
                    {/* Quick reason suggestions */}
                    <div className="flex flex-wrap gap-1.5 mt-2">
                      {["Support Resolution", "Promotional Bonus", "Pro Trial Grant", "Manual Correction"].map(
                        (tag) => (
                          <button
                            key={tag}
                            type="button"
                            onClick={() => setManageForm((prev) => ({ ...prev, reason: tag }))}
                            className="px-2 py-0.5 rounded-md bg-[var(--bg-elevated)] border border-[var(--border)] text-[10px] text-[var(--text-muted)] hover:text-[var(--text-primary)] hover:border-emerald-500/30 transition-all cursor-pointer"
                          >
                            +{tag}
                          </button>
                        )
                      )}
                    </div>
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex items-center justify-end gap-2 pt-2 border-t border-[var(--border)]">
                <button
                  type="button"
                  onClick={() => setManagingUser(null)}
                  className="px-4 py-2 rounded-xl bg-[var(--bg-page)] hover:bg-[var(--bg-elevated)] border border-[var(--border)] text-[var(--text-primary)] text-xs font-bold transition-all cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="px-5 py-2 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-brand-navy font-black text-xs transition-all shadow-sm shadow-emerald-500/25 border border-emerald-400 cursor-pointer disabled:opacity-50"
                >
                  {isSubmitting ? "Committing Updates..." : "Save Changes"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
