"use client";

import { useEffect, useState, useMemo } from "react";
import { useToast } from "@/components/ui/toast-1";
import { ConfirmationModal } from "@/components/ui/ConfirmationModal";
import {
  Megaphone,
  Send,
  Clock,
  Radio,
  Users,
  Zap,
  Crown,
  Sparkles,
  CheckCircle2,
  AlertTriangle,
  AlertOctagon,
  Info,
  RefreshCw,
  Search,
  Trash2,
  ExternalLink,
  Check,
  X,
  Bell,
  Eye,
  ShieldCheck,
  ChevronRight,
  Flame
} from "lucide-react";

interface BroadcastHistoryItem {
  message: string;
  type: string;
  link: string | null;
  created_at: string;
  sent_count?: number;
  read_count?: number;
}

interface AudienceCounts {
  all: number;
  free: number;
  premium: number;
}

const BroadcastSkeleton = () => (
  <div className="space-y-4 animate-pulse">
    {[1, 2, 3].map((i) => (
      <div
        key={i}
        className="h-28 rounded-2xl bg-[var(--bg-elevated)] border border-[var(--border)]"
      />
    ))}
  </div>
);

export default function AdminBroadcastPage() {
  const { showToast } = useToast();

  // Form State
  const [form, setForm] = useState({
    message: "",
    type: "info",
    link: "",
    targetAudience: "all_users",
  });

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [history, setHistory] = useState<BroadcastHistoryItem[]>([]);
  const [audienceCounts, setAudienceCounts] = useState<AudienceCounts>({
    all: 0,
    free: 0,
    premium: 0,
  });
  const [loadingHistory, setLoadingHistory] = useState(true);

  // Search & Filter in History
  const [historySearch, setHistorySearch] = useState("");
  const [typeFilter, setTypeFilter] = useState<string>("all");

  // Modals state
  const [confirmSendOpen, setConfirmSendOpen] = useState(false);
  const [retractTarget, setRetractTarget] = useState<string | null>(null);
  const [isRetracting, setIsRetracting] = useState(false);

  // ─── Fetch History & Audience Telemetry ───────────────────────────────────
  const fetchHistory = async () => {
    setLoadingHistory(true);
    try {
      const res = await fetch("/api/admin/broadcast");
      if (res.ok) {
        const data = await res.json();
        const list = Array.isArray(data) ? data : data.broadcasts || [];
        setHistory(list);
        if (data.audienceCounts) {
          setAudienceCounts(data.audienceCounts);
        }
      }
    } catch (err) {
      console.error("Failed to load broadcast history", err);
    } finally {
      setLoadingHistory(false);
    }
  };

  useEffect(() => {
    fetchHistory();
  }, []);

  // ─── Dispatch Broadcast ───────────────────────────────────────────────────
  const executeBroadcast = async () => {
    if (!form.message) return;
    setIsSubmitting(true);
    try {
      const res = await fetch("/api/admin/broadcast", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });

      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.error || "Failed to send broadcast.");
      }

      const data = await res.json();
      showToast(
        `Broadcast sent successfully to ${data.sentCount} recipients!`,
        "success"
      );

      setForm((prev) => ({ ...prev, message: "", link: "" }));
      fetchHistory();
    } catch (err: any) {
      showToast(err.message || "An unexpected error occurred.", "error");
    } finally {
      setIsSubmitting(false);
      setConfirmSendOpen(false);
    }
  };

  // ─── Retract Broadcast ────────────────────────────────────────────────────
  const executeRetract = async () => {
    if (!retractTarget) return;
    setIsRetracting(true);
    try {
      const res = await fetch(
        `/api/admin/broadcast?message=${encodeURIComponent(retractTarget)}`,
        {
          method: "DELETE",
        }
      );

      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.error || "Failed to retract broadcast.");
      }

      const data = await res.json();
      showToast(
        data.message || `Retracted ${data.retractedCount} notifications.`,
        "success"
      );
      setRetractTarget(null);
      fetchHistory();
    } catch (err: any) {
      showToast(err.message || "Failed to retract broadcast.", "error");
    } finally {
      setIsRetracting(false);
    }
  };

  // ─── Template Presets ─────────────────────────────────────────────────────
  const applyTemplate = (text: string, type: string, link: string) => {
    setForm((prev) => ({
      ...prev,
      message: text,
      type,
      link,
    }));
    showToast("Template applied to composer", "info");
  };

  // ─── Filtered History ─────────────────────────────────────────────────────
  const filteredHistory = useMemo(() => {
    return history.filter((item) => {
      const matchesSearch =
        !historySearch ||
        item.message?.toLowerCase().includes(historySearch.toLowerCase()) ||
        item.link?.toLowerCase().includes(historySearch.toLowerCase());
      const matchesType = typeFilter === "all" || item.type === typeFilter;
      return matchesSearch && matchesType;
    });
  }, [history, historySearch, typeFilter]);

  // ─── Type Visuals ─────────────────────────────────────────────────────────
  const getTypeConfig = (type: string) => {
    switch (type) {
      case "promo":
        return {
          icon: <Sparkles size={12} />,
          label: "Promotional",
          badge: "bg-purple-500/15 text-purple-600 dark:text-purple-400 border-purple-500/30",
          border: "border-purple-500/40",
          dot: "bg-purple-500",
        };
      case "success":
        return {
          icon: <CheckCircle2 size={12} />,
          label: "Success",
          badge: "bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 border-emerald-500/30",
          border: "border-emerald-500/40",
          dot: "bg-emerald-500",
        };
      case "warning":
        return {
          icon: <AlertTriangle size={12} />,
          label: "Notice",
          badge: "bg-amber-500/15 text-amber-600 dark:text-amber-400 border-amber-500/30",
          border: "border-amber-500/40",
          dot: "bg-amber-500",
        };
      case "alert":
        return {
          icon: <Flame size={12} />,
          label: "Urgent Alert",
          badge: "bg-rose-500/15 text-rose-600 dark:text-rose-400 border-rose-500/30",
          border: "border-rose-500/40",
          dot: "bg-rose-500",
        };
      default:
        return {
          icon: <Info size={12} />,
          label: "Information",
          badge: "bg-blue-500/15 text-blue-600 dark:text-blue-400 border-blue-500/30",
          border: "border-blue-500/40",
          dot: "bg-blue-500",
        };
    }
  };

  return (
    <div className="space-y-8 font-sans">
      
      {/* ── EXECUTIVE HEADER ── */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 pb-6 border-b border-[var(--border)]">
        <div className="space-y-2">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-500/10 border border-amber-500/25 text-amber-600 dark:text-amber-400 text-xs font-bold uppercase tracking-wider">
            <Radio size={12} className="text-amber-500 animate-pulse" />
            <span>UPROLE PLATFORM COMMAND · GLOBAL BROADCASTER & NOTIFICATION ENGINE</span>
          </div>

          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#101B3B] to-[#F59E0B] flex items-center justify-center text-white shadow-md border border-white/10 shrink-0">
              <Megaphone size={22} className="text-amber-400" />
            </div>
            <h1 className="text-2xl md:text-3xl font-extrabold tracking-tight text-[var(--text-primary)] font-['Syne',sans-serif]">
              Global Broadcasts & Announcements
            </h1>
          </div>

          <p className="text-sm text-[var(--text-muted)] max-w-2xl leading-relaxed">
            Publish announcements, feature releases, and urgent maintenance alerts directly into users' in-app notification centers in real-time.
          </p>
        </div>

        {/* Action Controls */}
        <div className="flex items-center gap-3 self-start md:self-center shrink-0">
          <button
            onClick={fetchHistory}
            disabled={loadingHistory}
            className="px-4 py-2.5 rounded-xl bg-[var(--bg-elevated)] border border-[var(--border)] text-xs font-bold text-[var(--text-primary)] hover:border-amber-500/40 hover:bg-amber-500/10 transition-all flex items-center gap-2 cursor-pointer shadow-xs disabled:opacity-50"
          >
            <RefreshCw
              size={14}
              className={loadingHistory ? "animate-spin text-amber-500" : "text-[var(--text-muted)]"}
            />
            <span>Refresh Feed</span>
          </button>
        </div>
      </div>

      {/* ── OPERATIONAL TELEMETRY METRIC CARDS (4 KPIS) ── */}
      <section className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Metric 1: Total Campaigns */}
        <div className="p-5 rounded-2xl bg-[var(--bg-elevated)] border border-[var(--border)] shadow-xs relative overflow-hidden group hover:border-amber-500/40 transition-all">
          <div className="absolute top-0 left-0 right-0 h-[2px] bg-amber-500" />
          <div className="flex items-center justify-between text-[var(--text-muted)] mb-2">
            <span className="text-xs font-bold uppercase tracking-wider">Dispatched Alerts</span>
            <div className="w-7 h-7 rounded-lg bg-amber-500/10 text-amber-500 flex items-center justify-center">
              <Megaphone size={15} />
            </div>
          </div>
          <div className="text-2xl md:text-3xl font-black text-amber-500 font-['Syne',sans-serif]">
            {loadingHistory ? "..." : history.length}
          </div>
          <div className="text-[11px] text-[var(--text-muted)] mt-1">
            Unique broadcast campaigns
          </div>
        </div>

        {/* Metric 2: Audience Reach */}
        <div className="p-5 rounded-2xl bg-[var(--bg-elevated)] border border-[var(--border)] shadow-xs relative overflow-hidden group hover:border-blue-500/40 transition-all">
          <div className="absolute top-0 left-0 right-0 h-[2px] bg-blue-500" />
          <div className="flex items-center justify-between text-[var(--text-muted)] mb-2">
            <span className="text-xs font-bold uppercase tracking-wider">Total Reach</span>
            <div className="w-7 h-7 rounded-lg bg-blue-500/10 text-blue-500 flex items-center justify-center">
              <Users size={15} />
            </div>
          </div>
          <div className="text-2xl md:text-3xl font-black text-[var(--text-primary)] font-['Syne',sans-serif]">
            {loadingHistory ? "..." : audienceCounts.all}
          </div>
          <div className="text-[11px] text-[var(--text-muted)] mt-1">
            Registered accounts reachable
          </div>
        </div>

        {/* Metric 3: Free Cohort */}
        <div className="p-5 rounded-2xl bg-[var(--bg-elevated)] border border-[var(--border)] shadow-xs relative overflow-hidden group hover:border-teal-500/40 transition-all">
          <div className="absolute top-0 left-0 right-0 h-[2px] bg-teal-500" />
          <div className="flex items-center justify-between text-[var(--text-muted)] mb-2">
            <span className="text-xs font-bold uppercase tracking-wider">Free Cohort</span>
            <div className="w-7 h-7 rounded-lg bg-teal-500/10 text-teal-500 flex items-center justify-center">
              <Zap size={15} />
            </div>
          </div>
          <div className="text-2xl md:text-3xl font-black text-teal-500 font-['Syne',sans-serif]">
            {loadingHistory ? "..." : audienceCounts.free}
          </div>
          <div className="text-[11px] text-[var(--text-muted)] mt-1">
            Prime targets for upgrade upsells
          </div>
        </div>

        {/* Metric 4: Premium Cohort */}
        <div className="p-5 rounded-2xl bg-[var(--bg-elevated)] border border-[var(--border)] shadow-xs relative overflow-hidden group hover:border-purple-500/40 transition-all">
          <div className="absolute top-0 left-0 right-0 h-[2px] bg-purple-500" />
          <div className="flex items-center justify-between text-[var(--text-muted)] mb-2">
            <span className="text-xs font-bold uppercase tracking-wider">Paid Subscribers</span>
            <div className="w-7 h-7 rounded-lg bg-purple-500/10 text-purple-500 flex items-center justify-center">
              <Crown size={15} />
            </div>
          </div>
          <div className="text-2xl md:text-3xl font-black text-purple-500 font-['Syne',sans-serif]">
            {loadingHistory ? "..." : audienceCounts.premium}
          </div>
          <div className="text-[11px] text-[var(--text-muted)] mt-1">
            Sprint & Pro tier VIP members
          </div>
        </div>
      </section>

      {/* ── TWO-COLUMN COMMAND CENTER ── */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        
        {/* ── LEFT COLUMN: COMPOSE CONSOLE (7 Cols) ── */}
        <div className="lg:col-span-7 space-y-6">
          <div className="p-6 md:p-7 rounded-2xl bg-[var(--bg-elevated)] border border-[var(--border)] shadow-sm space-y-6 relative overflow-hidden backdrop-blur-xl">
            <div className="absolute top-0 left-0 right-0 h-[2px] bg-gradient-to-r from-amber-500 via-purple-500 to-blue-500" />

            <div className="flex items-center justify-between pb-3 border-b border-[var(--border)]">
              <div className="flex items-center gap-2.5">
                <div className="w-7 h-7 rounded-lg bg-amber-500/10 text-amber-500 flex items-center justify-center">
                  <Send size={15} />
                </div>
                <h2 className="text-base font-bold text-[var(--text-primary)] font-['Syne',sans-serif]">
                  Compose New Broadcast
                </h2>
              </div>
              <span className="text-[11px] font-bold text-emerald-500 flex items-center gap-1">
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                Delivery Channel Active
              </span>
            </div>

            <form
              onSubmit={(e) => {
                e.preventDefault();
                if (form.message.trim()) setConfirmSendOpen(true);
              }}
              className="space-y-5"
            >
              {/* FIELD 1: TARGET AUDIENCE */}
              <div className="space-y-2">
                <label className="text-xs font-bold text-[var(--text-secondary)] uppercase tracking-wider flex items-center justify-between">
                  <span>1. Target Audience Cohort</span>
                  <span className="text-[11px] text-amber-500 normal-case font-medium">
                    {form.targetAudience === "all_users"
                      ? `${audienceCounts.all} recipients`
                      : form.targetAudience === "free_tier"
                      ? `${audienceCounts.free} recipients`
                      : `${audienceCounts.premium} recipients`}
                  </span>
                </label>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
                  {[
                    {
                      key: "all_users",
                      label: "All Users",
                      sub: "Everyone registered",
                      count: audienceCounts.all,
                      icon: <Users size={14} />,
                    },
                    {
                      key: "free_tier",
                      label: "Free Cohort",
                      sub: "Upgrade upsells",
                      count: audienceCounts.free,
                      icon: <Zap size={14} />,
                    },
                    {
                      key: "premium",
                      label: "Premium VIP",
                      sub: "Sprint & Pro members",
                      count: audienceCounts.premium,
                      icon: <Crown size={14} />,
                    },
                  ].map((aud) => {
                    const isSelected = form.targetAudience === aud.key;
                    return (
                      <button
                        key={aud.key}
                        type="button"
                        onClick={() => setForm({ ...form, targetAudience: aud.key })}
                        className={`p-3 rounded-xl border text-left transition-all cursor-pointer flex flex-col justify-between ${
                          isSelected
                            ? "bg-amber-500/10 border-amber-500 text-[var(--text-primary)] shadow-2xs"
                            : "bg-[var(--bg-page)] border-[var(--border)] text-[var(--text-muted)] hover:border-amber-500/30 hover:text-[var(--text-primary)]"
                        }`}
                      >
                        <div className="flex items-center justify-between mb-1">
                          <span className={isSelected ? "text-amber-500" : "text-[var(--text-muted)]"}>
                            {aud.icon}
                          </span>
                          <span className="text-[10px] font-mono font-bold px-1.5 py-0.5 rounded bg-[var(--bg-elevated)] border border-[var(--border)]">
                            {aud.count}
                          </span>
                        </div>
                        <div className="font-bold text-xs">{aud.label}</div>
                        <div className="text-[10px] text-[var(--text-muted)]">{aud.sub}</div>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* FIELD 2: NOTIFICATION TYPE */}
              <div className="space-y-2">
                <label className="text-xs font-bold text-[var(--text-secondary)] uppercase tracking-wider block">
                  2. Notification Alert Type
                </label>
                <div className="flex flex-wrap gap-2">
                  {[
                    { key: "info", label: "Info", icon: <Info size={12} /> },
                    { key: "promo", label: "Promotional", icon: <Sparkles size={12} /> },
                    { key: "success", label: "Success", icon: <CheckCircle2 size={12} /> },
                    { key: "warning", label: "Notice", icon: <AlertTriangle size={12} /> },
                    { key: "alert", label: "Urgent Alert", icon: <Flame size={12} /> },
                  ].map((t) => {
                    const isSelected = form.type === t.key;
                    const config = getTypeConfig(t.key);
                    return (
                      <button
                        key={t.key}
                        type="button"
                        onClick={() => setForm({ ...form, type: t.key })}
                        className={`px-3 py-1.5 rounded-xl border text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
                          isSelected
                            ? `${config.badge} font-black shadow-2xs border-current`
                            : "bg-[var(--bg-page)] border-[var(--border)] text-[var(--text-muted)] hover:text-[var(--text-primary)] hover:border-amber-500/30"
                        }`}
                      >
                        {t.icon}
                        <span>{t.label}</span>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* FIELD 3: MESSAGE CONTENT */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-bold text-[var(--text-secondary)] uppercase tracking-wider">
                    3. Announcement Message
                  </label>
                  <span
                    className={`text-[11px] font-mono ${
                      form.message.length > 250
                        ? "text-amber-500 font-bold"
                        : "text-[var(--text-muted)]"
                    }`}
                  >
                    {form.message.length} / 250 recommended
                  </span>
                </div>

                <textarea
                  placeholder="Type your broadcast message here... E.g. We have upgraded our ATS Engine with real-time Indian tech keyword calibration! Try scanning your resume now."
                  required
                  rows={4}
                  value={form.message}
                  onChange={(e) => setForm({ ...form, message: e.target.value })}
                  className="w-full p-3 rounded-xl bg-[var(--bg-page)] border border-[var(--border)] text-xs md:text-sm text-[var(--text-primary)] placeholder-[var(--text-muted)] outline-none focus:border-amber-500/50 transition-all resize-y min-h-[90px]"
                />

                {/* Quick Templates */}
                <div className="pt-1">
                  <span className="text-[10px] font-bold text-[var(--text-muted)] uppercase tracking-wider block mb-1.5">
                    Quick Templates:
                  </span>
                  <div className="flex flex-wrap gap-1.5">
                    {[
                      {
                        label: "🚀 ATS v2.4 Release",
                        type: "promo",
                        link: "/resume/builder",
                        text: "We just launched our new AI ATS Engine v2.4 with deep keyword alignment! Test your score today.",
                      },
                      {
                        label: "⚡ Sprint Bonus Credits",
                        type: "promo",
                        link: "/dashboard/credits",
                        text: "Special bonus: Upgrade to Sprint Tier today and receive +50 complimentary AI credits.",
                      },
                      {
                        label: "🛠️ Scheduled Maintenance",
                        type: "warning",
                        link: "",
                        text: "Brief scheduled maintenance tonight from 2:00 AM to 2:30 AM IST. All data remains secure.",
                      },
                      {
                        label: "🎉 Pursuit Pipeline",
                        type: "success",
                        link: "/job-tracker",
                        text: "Keep momentum high! Update your active pursuit stages in the Opportunity Pipeline.",
                      },
                    ].map((tpl) => (
                      <button
                        key={tpl.label}
                        type="button"
                        onClick={() => applyTemplate(tpl.text, tpl.type, tpl.link)}
                        className="px-2 py-1 rounded-lg bg-[var(--bg-page)] border border-[var(--border)] text-[10px] text-[var(--text-muted)] hover:text-amber-500 hover:border-amber-500/30 transition-all cursor-pointer"
                      >
                        {tpl.label}
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              {/* FIELD 4: CALL TO ACTION URL */}
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-[var(--text-secondary)] uppercase tracking-wider block">
                  4. Action Link / Deep Link (Optional)
                </label>
                <div className="relative">
                  <input
                    type="text"
                    placeholder="e.g. /resume/builder or /job-tracker or https://uprole.in"
                    value={form.link}
                    onChange={(e) => setForm({ ...form, link: e.target.value })}
                    className="w-full pl-3 pr-24 py-2 rounded-xl bg-[var(--bg-page)] border border-[var(--border)] text-xs text-[var(--text-primary)] placeholder-[var(--text-muted)] outline-none focus:border-amber-500/50 transition-all font-mono"
                  />
                  {/* Preset path chips */}
                  <div className="absolute right-2 top-1/2 -translate-y-1/2 flex items-center gap-1">
                    {["/resume/builder", "/job-tracker"].map((p) => (
                      <button
                        key={p}
                        type="button"
                        onClick={() => setForm((prev) => ({ ...prev, link: p }))}
                        className="text-[9px] px-1.5 py-0.5 rounded bg-[var(--bg-elevated)] border border-[var(--border)] text-[var(--text-muted)] hover:text-[var(--text-primary)] cursor-pointer"
                      >
                        {p}
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              {/* ── LIVE IN-APP PREVIEW ── */}
              <div className="p-4 rounded-xl bg-[var(--bg-page)] border border-[var(--border)] space-y-2">
                <div className="flex items-center justify-between text-[11px] font-bold text-[var(--text-muted)]">
                  <span className="uppercase tracking-wider flex items-center gap-1.5">
                    <Eye size={13} className="text-amber-500" />
                    <span>In-App Notification Drawer Preview</span>
                  </span>
                  <span className="text-[10px]">What users will see</span>
                </div>

                <div className="p-3.5 rounded-xl bg-[var(--bg-elevated)] border-l-4 border-amber-500 border border-[var(--border)] shadow-xs space-y-1.5">
                  <div className="flex items-center justify-between">
                    <span
                      className={`inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-black uppercase tracking-wider ${
                        getTypeConfig(form.type).badge
                      }`}
                    >
                      {getTypeConfig(form.type).icon}
                      <span>{getTypeConfig(form.type).label}</span>
                    </span>
                    <span className="text-[10px] font-mono text-[var(--text-muted)]">
                      Just now
                    </span>
                  </div>
                  <p className="text-xs text-[var(--text-primary)] leading-relaxed m-0 font-medium">
                    {form.message || "Your announcement message will appear here for recipients..."}
                  </p>
                  {form.link && (
                    <div className="text-[11px] text-amber-500 font-bold flex items-center gap-1 pt-1">
                      <span>View details</span>
                      <ChevronRight size={12} />
                    </div>
                  )}
                </div>
              </div>

              {/* DISPATCH ACTION BUTTON */}
              <button
                type="submit"
                disabled={isSubmitting || !form.message.trim()}
                className="w-full py-3.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-brand-navy font-black text-sm transition-all shadow-md shadow-amber-500/25 border border-amber-400 cursor-pointer disabled:opacity-50 flex items-center justify-center gap-2"
              >
                <Send size={15} />
                <span>
                  {isSubmitting
                    ? "Transmitting Broadcast..."
                    : `Send Broadcast to ${
                        form.targetAudience === "all_users"
                          ? `All ${audienceCounts.all} Users`
                          : form.targetAudience === "free_tier"
                          ? `${audienceCounts.free} Free Users`
                          : `${audienceCounts.premium} VIP Subscribers`
                      }`}
                </span>
              </button>
            </form>
          </div>
        </div>

        {/* ── RIGHT COLUMN: BROADCAST AUDIT LEDGER (5 Cols) ── */}
        <div className="lg:col-span-5 space-y-4">
          <div className="p-5 md:p-6 rounded-2xl bg-[var(--bg-elevated)] border border-[var(--border)] shadow-sm space-y-4 backdrop-blur-xl">
            <div className="flex items-center justify-between pb-2 border-b border-[var(--border)]">
              <div className="flex items-center gap-2">
                <Clock size={16} className="text-amber-500" />
                <h3 className="text-sm font-bold text-[var(--text-primary)] font-['Syne',sans-serif]">
                  Broadcast Audit History ({history.length})
                </h3>
              </div>
              <span className="text-[10px] text-amber-500 font-bold">Ledger Feed</span>
            </div>

            {/* Filter & Search Bar */}
            <div className="space-y-2">
              <div className="relative">
                <Search
                  size={13}
                  className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--text-muted)] pointer-events-none"
                />
                <input
                  type="text"
                  placeholder="Filter past broadcasts..."
                  value={historySearch}
                  onChange={(e) => setHistorySearch(e.target.value)}
                  className="w-full pl-8 pr-3 py-1.5 rounded-xl bg-[var(--bg-page)] border border-[var(--border)] text-xs text-[var(--text-primary)] placeholder-[var(--text-muted)] outline-none focus:border-amber-500/50 transition-all"
                />
              </div>

              <div className="flex items-center gap-1 overflow-x-auto [scrollbar-width:none] pb-1">
                {["all", "promo", "alert", "warning", "info", "success"].map((t) => (
                  <button
                    key={t}
                    onClick={() => setTypeFilter(t)}
                    className={`px-2 py-0.5 rounded-lg text-[10px] font-bold uppercase tracking-wider border transition-all cursor-pointer whitespace-nowrap ${
                      typeFilter === t
                        ? "bg-amber-500 text-brand-navy border-amber-500 font-black"
                        : "bg-[var(--bg-page)] border-[var(--border)] text-[var(--text-muted)] hover:text-[var(--text-primary)]"
                    }`}
                  >
                    {t}
                  </button>
                ))}
              </div>
            </div>

            {/* List */}
            <div className="space-y-3 max-h-[620px] overflow-y-auto pr-1 [scrollbar-width:none]">
              {loadingHistory ? (
                <BroadcastSkeleton />
              ) : filteredHistory.length === 0 ? (
                <div className="py-12 text-center text-[var(--text-muted)] border border-dashed border-[var(--border)] rounded-xl text-xs space-y-2">
                  <Megaphone size={28} className="mx-auto text-[var(--text-muted)] opacity-50" />
                  <p className="font-bold text-[var(--text-primary)]">No previous broadcasts found.</p>
                  <p className="text-[11px]">Compose your first announcement on the left to dispatch it.</p>
                </div>
              ) : (
                filteredHistory.map((item, i) => {
                  const config = getTypeConfig(item.type);
                  return (
                    <div
                      key={i}
                      className="p-4 rounded-xl bg-[var(--bg-page)] border border-[var(--border)] hover:border-amber-500/30 transition-all space-y-2.5 group"
                    >
                      <div className="flex items-center justify-between">
                        <span
                          className={`inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-black uppercase tracking-wider ${config.badge}`}
                        >
                          {config.icon}
                          <span>{config.label}</span>
                        </span>

                        <div className="flex items-center gap-2">
                          <span className="text-[10px] font-mono text-[var(--text-muted)]">
                            {new Date(item.created_at).toLocaleDateString("en-IN", {
                              month: "short",
                              day: "numeric",
                              hour: "2-digit",
                              minute: "2-digit",
                            })}
                          </span>

                          {/* Retract button */}
                          <button
                            onClick={() => setRetractTarget(item.message)}
                            title="Retract this broadcast from all users"
                            className="p-1 rounded-md text-[var(--text-muted)] hover:text-rose-500 hover:bg-rose-500/10 transition-all cursor-pointer opacity-0 group-hover:opacity-100"
                          >
                            <Trash2 size={12} />
                          </button>
                        </div>
                      </div>

                      <p className="text-xs text-[var(--text-primary)] leading-relaxed m-0">
                        {item.message}
                      </p>

                      <div className="flex items-center justify-between pt-1 border-t border-[var(--border)] text-[10px] text-[var(--text-muted)]">
                        <div className="flex items-center gap-3">
                          {item.sent_count != null && (
                            <span className="font-mono">
                              Sent: <strong className="text-[var(--text-primary)]">{item.sent_count}</strong>
                            </span>
                          )}
                          {item.read_count != null && (
                            <span className="font-mono text-emerald-500">
                              Opened: <strong>{item.read_count}</strong>
                            </span>
                          )}
                        </div>

                        {item.link && (
                          <a
                            href={item.link}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-amber-500 hover:underline flex items-center gap-1 font-mono text-[10px]"
                          >
                            <span>Link</span>
                            <ExternalLink size={10} />
                          </a>
                        )}
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </div>
        </div>

      </div>

      {/* ── CONFIRMATION MODAL: DISPATCH BROADCAST ── */}
      <ConfirmationModal
        isOpen={confirmSendOpen}
        title="Confirm Immediate Broadcast"
        message={`Are you sure you want to dispatch this ${getTypeConfig(form.type).label} alert to ${
          form.targetAudience === "all_users"
            ? `All ${audienceCounts.all} registered users`
            : form.targetAudience === "free_tier"
            ? `${audienceCounts.free} Free Tier accounts`
            : `${audienceCounts.premium} VIP Subscribers`
        }? This will immediately populate their in-app notification centers.`}
        confirmLabel="Yes, Transmit Now"
        cancelLabel="Review Message"
        onConfirm={executeBroadcast}
        onCancel={() => setConfirmSendOpen(false)}
      />

      {/* ── CONFIRMATION MODAL: RETRACT BROADCAST ── */}
      <ConfirmationModal
        isOpen={Boolean(retractTarget)}
        title="Retract Broadcast Alert"
        message={`Are you sure you want to retract and delete this notification from all user in-app notification centers? This will remove all copies of this alert immediately.`}
        confirmLabel="Yes, Retract Alert"
        cancelLabel="Keep Alert"
        isDanger={true}
        onConfirm={executeRetract}
        onCancel={() => setRetractTarget(null)}
      />

    </div>
  );
}
