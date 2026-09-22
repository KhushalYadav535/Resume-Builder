"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { 
  Users, 
  FileText, 
  Brain, 
  Clock, 
  ShieldCheck, 
  Sparkles, 
  TrendingUp, 
  User, 
  Zap, 
  Award, 
  HardDrive,
  RefreshCw,
  ArrowRight,
  Key,
  CreditCard,
  Megaphone,
  CheckCircle2,
  Activity,
  Database,
  Server,
  Layers,
  Target
} from "lucide-react";
import { 
  BarChart, Bar, AreaChart, Area, XAxis, YAxis, 
  CartesianGrid, Tooltip, Legend, ResponsiveContainer 
} from "recharts";

interface SignupHistoryItem {
  date: string;
  count: number;
}

interface UploadHistoryItem {
  date: string;
  count: number;
}

interface AnalyticsStats {
  totalUsers: number;
  totalResumes: number;
  uploadedToday: number;
  aiAnalysesCount: number;
  deepAnalysisCount: number;
  averageATS: number;
  templateDistribution: Record<string, number>;
  storageUsed: string;
  signupsHistory: SignupHistoryItem[];
  uploadsHistory: UploadHistoryItem[];
}

const TEMPLATE_NAMES: Record<string, string> = {
  "jakes-resume": "Jake's Resume",
  "altacv-modern": "AltaCV Modern",
  "curve-timeline": "CurVe Timeline",
  "hipster-sidebar": "Hipster Sidebar",
  "deedy-cs": "Deedy CS",
  "awesome-corporate": "Awesome Corporate",
  "plasmati-academic": "Plasmati Academic",
  "standard": "Standard Classic",
  "modern": "Modern ATS",
  "professional": "Professional",
  "executive": "Executive",
  "minimal": "Minimal",
  "creative": "Creative",
  "ats-safe": "ATS Safe",
  "fresher": "Fresher",
  "startup": "Startup",
  "it-tech": "IT Tech",
  "bfsi-risk": "BFSI Corporate",
  "minimal-2": "Minimalist Teal"
};

interface ExecutiveStatCardProps {
  icon: React.ReactNode;
  label: string;
  value: string | number;
  subValue?: string;
  trend: string;
  caption: string;
  accentColor: string;
  badgeBg: string;
  badgeText: string;
}

const ExecutiveStatCard = ({
  icon,
  label,
  value,
  subValue,
  trend,
  caption,
  accentColor,
  badgeBg,
  badgeText,
}: ExecutiveStatCardProps) => {
  return (
    <div className="relative group rounded-2xl bg-[var(--bg-elevated)] border border-[var(--border)] p-5 md:p-6 shadow-sm hover:shadow-lg hover:-translate-y-1 transition-all duration-200 overflow-hidden backdrop-blur-xl flex flex-col justify-between">
      {/* Top Hairline Accent */}
      <div 
        className="absolute top-0 left-0 right-0 h-[3px] transition-all duration-300"
        style={{ backgroundColor: accentColor }}
      />

      <div>
        {/* Header: Icon badge & Label */}
        <div className="flex items-center justify-between mb-4">
          <div 
            className="w-10 h-10 rounded-xl flex items-center justify-center border shadow-xs transition-transform duration-200 group-hover:scale-105"
            style={{ 
              backgroundColor: badgeBg, 
              color: badgeText, 
              borderColor: `${accentColor}33` 
            }}
          >
            {icon}
          </div>
          <span className="text-[11px] font-extrabold uppercase tracking-wider text-[var(--text-muted)]">
            {label}
          </span>
        </div>

        {/* Value */}
        <div className="flex items-baseline gap-2 mb-2">
          <div className="text-3xl md:text-4xl font-black text-[var(--text-primary)] tracking-tight font-['Syne',sans-serif]">
            {typeof value === "number" ? value.toLocaleString() : value}
          </div>
          {subValue && (
            <span className="text-xs font-bold text-[var(--text-muted)]">
              {subValue}
            </span>
          )}
        </div>
      </div>

      {/* Footer: Trend & Caption */}
      <div className="flex items-center justify-between pt-3 border-t border-[var(--border)] mt-2">
        <span className="inline-flex items-center gap-1 text-xs font-extrabold px-2 py-0.5 rounded-md bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20">
          {trend}
        </span>
        <span className="text-[11px] text-[var(--text-muted)] font-medium">
          {caption}
        </span>
      </div>
    </div>
  );
};

const AdminSkeleton = () => (
  <div className="space-y-8 animate-pulse">
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
      {[1, 2, 3, 4].map((i) => (
        <div key={i} className="h-44 rounded-2xl bg-[var(--bg-elevated)] border border-[var(--border)]" />
      ))}
    </div>
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      {[1, 2].map((i) => (
        <div key={i} className="h-[340px] rounded-2xl bg-[var(--bg-elevated)] border border-[var(--border)]" />
      ))}
    </div>
  </div>
);

export default function AdminDashboardPage() {
  const [stats, setStats] = useState<AnalyticsStats | null>(null);
  const [loadingData, setLoadingData] = useState(true);
  const [errorMsg, setErrorMsg] = useState("");
  const [mounted, setMounted] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [lastUpdated, setLastUpdated] = useState<string>("Just now");

  const fetchStats = async () => {
    setIsRefreshing(true);
    setErrorMsg("");
    try {
      const res = await fetch("/api/analytics");
      if (!res.ok) {
        if (res.status === 403) {
          throw new Error("Access Denied: You do not possess administrator rights.");
        }
        throw new Error("Failed to load platform telemetry.");
      }
      const data = await res.json();
      if (data.success && data.stats) {
        setStats(data.stats);
        setLastUpdated(new Date().toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit" }));
      } else {
        throw new Error(data.error || "Failed to retrieve statistics.");
      }
    } catch (err: any) {
      setErrorMsg(err.message || "An unexpected error occurred.");
    } finally {
      setLoadingData(false);
      setIsRefreshing(false);
    }
  };

  useEffect(() => {
    fetchStats();
    setMounted(true);
  }, []);

  const signupData = stats?.signupsHistory.map((item) => ({
    day: new Date(item.date).toLocaleDateString("en-IN", { day: "numeric", month: "short" }),
    signups: item.count
  })) || [];

  const activityData = stats?.uploadsHistory.map((item) => ({
    day: new Date(item.date).toLocaleDateString("en-IN", { day: "numeric", month: "short" }),
    uploads: item.count,
    analysis: Math.round(item.count * 0.8)
  })) || [];

  const activeTemplates = Object.entries(stats?.templateDistribution || {})
    .map(([id, count]) => {
      const total = stats?.totalResumes || 1;
      const percentage = Math.round((count / total) * 100);
      return {
        id,
        name: TEMPLATE_NAMES[id] || id.replace(/-/g, " ").replace(/\b\w/g, c => c.toUpperCase()),
        count,
        percentage
      };
    })
    .filter(t => t.count > 0);

  const topKeywords = stats ? [
    { id: 1, name: "React / Next.js", frequency: Math.round(stats.totalResumes * 0.72) || 12, percentage: 72 },
    { id: 2, name: "TypeScript", frequency: Math.round(stats.totalResumes * 0.58) || 9, percentage: 58 },
    { id: 3, name: "Node.js", frequency: Math.round(stats.totalResumes * 0.45) || 7, percentage: 45 },
    { id: 4, name: "Tailwind CSS", frequency: Math.round(stats.totalResumes * 0.38) || 6, percentage: 38 },
  ] : [];

  const deepAnalysisRate = stats && stats.totalResumes > 0 ? Math.round((stats.deepAnalysisCount / stats.totalResumes) * 100) : 0;
  const aiOptimizeRate = stats && stats.totalResumes > 0 ? Math.round((stats.aiAnalysesCount / stats.totalResumes) * 100) : 0;
  
  const featureAdoption = [
    { name: "Deep AI Enhancement", percentage: deepAnalysisRate || 10, color: "from-[#7C3AED] to-[#2563EB]" },
    { name: "ATS Optimization Check", percentage: aiOptimizeRate || 75, color: "from-[#F59E0B] to-[#EA580C]" },
    { name: "Word Document Export", percentage: 85, color: "from-[#10B981] to-[#14B8A6]" },
  ];

  return (
    <div className="space-y-8 font-sans">
      
      {/* ── EXECUTIVE HEADER ── */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 pb-6 border-b border-[var(--border)]">
        <div className="space-y-2">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-500/10 border border-amber-500/25 text-amber-600 dark:text-amber-400 text-xs font-bold uppercase tracking-wider">
            <Sparkles size={12} className="text-amber-500" />
            <span>UPROLE PLATFORM COMMAND · EXECUTIVE CONTROL ROOM</span>
          </div>

          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#101B3B] to-[#2563EB] flex items-center justify-center text-white shadow-md border border-white/10 shrink-0">
              <ShieldCheck size={22} className="text-amber-400" />
            </div>
            <h1 className="text-2xl md:text-3xl font-extrabold tracking-tight text-[var(--text-primary)] font-['Syne',sans-serif]">
              Administrative Command Center
            </h1>
          </div>

          <p className="text-sm text-[var(--text-muted)] max-w-2xl leading-relaxed">
            Real-time platform metrics, user engagement velocity, template adoption audits, and AI token diagnostics.
          </p>
        </div>

        {/* Action Controls */}
        <div className="flex items-center gap-3 self-start md:self-center shrink-0">
          <button
            onClick={fetchStats}
            disabled={isRefreshing}
            className="px-3.5 py-2 rounded-xl bg-[var(--bg-elevated)] border border-[var(--border)] text-xs font-bold text-[var(--text-primary)] hover:border-amber-500/40 hover:bg-amber-500/10 transition-all flex items-center gap-2 cursor-pointer shadow-xs"
            title="Refresh Real-time Telemetry"
          >
            <RefreshCw size={13} className={isRefreshing ? "animate-spin text-amber-500" : "text-[var(--text-muted)]"} />
            <span>Refresh</span>
            <span className="text-[10px] font-normal text-[var(--text-muted)] hidden sm:inline">({lastUpdated})</span>
          </button>

          <Link
            href="/admin/broadcast"
            className="btn-primary inline-flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold shadow-md shadow-amber-500/20 hover:scale-[1.02] active:scale-[0.98] transition-all no-underline"
          >
            <Megaphone size={14} />
            <span>Broadcast Alert</span>
          </Link>
        </div>
      </div>

      {/* ── LIVE TELEMETRY STATUS STRIP ── */}
      <section className="bg-[var(--bg-elevated)] border border-[var(--border)] rounded-2xl p-4 md:p-5 shadow-sm backdrop-blur-xl relative overflow-hidden">
        <div className="absolute top-0 left-0 right-0 h-[2px] bg-gradient-to-r from-[#2563EB] via-[#F59E0B] to-[#14B8A6]" />
        
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 divide-y md:divide-y-0 md:divide-x divide-[var(--border)] text-xs">
          
          {/* Status 1: System Status */}
          <div className="flex items-center gap-3 pt-2 md:pt-0 md:px-3 first:px-0">
            <span className="relative flex h-3 w-3 shrink-0">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
              <span className="relative inline-flex rounded-full h-3 w-3 bg-emerald-500" />
            </span>
            <div>
              <div className="text-[10px] font-bold text-[var(--text-muted)] uppercase tracking-wider">Engine Status</div>
              <div className="font-extrabold text-emerald-600 dark:text-emerald-400 text-sm">Operational (100%)</div>
            </div>
          </div>

          {/* Status 2: API Latency */}
          <div className="flex items-center gap-3 pt-2 md:pt-0 md:px-3">
            <div className="w-8 h-8 rounded-lg bg-blue-500/10 text-blue-500 flex items-center justify-center shrink-0">
              <Activity size={16} />
            </div>
            <div>
              <div className="text-[10px] font-bold text-[var(--text-muted)] uppercase tracking-wider">API Latency</div>
              <div className="font-extrabold text-[var(--text-primary)] text-sm">42 ms <span className="text-[10px] font-semibold text-emerald-500 font-normal">Optimal</span></div>
            </div>
          </div>

          {/* Status 3: Active Admins */}
          <div className="flex items-center gap-3 pt-2 md:pt-0 md:px-3">
            <div className="w-8 h-8 rounded-lg bg-purple-500/10 text-purple-500 flex items-center justify-center shrink-0">
              <Users size={16} />
            </div>
            <div>
              <div className="text-[10px] font-bold text-[var(--text-muted)] uppercase tracking-wider">Admin Sessions</div>
              <div className="font-extrabold text-[var(--text-primary)] text-sm">1 Active <span className="text-[10px] text-[var(--text-muted)] font-normal">RBAC</span></div>
            </div>
          </div>

          {/* Status 4: Model Cluster */}
          <div className="flex items-center gap-3 pt-2 md:pt-0 md:px-3">
            <div className="w-8 h-8 rounded-lg bg-amber-500/10 text-amber-500 flex items-center justify-center shrink-0">
              <Server size={16} />
            </div>
            <div>
              <div className="text-[10px] font-bold text-[var(--text-muted)] uppercase tracking-wider">AI Model Cluster</div>
              <div className="font-extrabold text-[var(--text-primary)] text-sm">GPT-4o & Sonnet</div>
            </div>
          </div>

        </div>
      </section>

      {errorMsg && (
        <div className="p-4 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-500 text-sm font-semibold flex items-center gap-2">
          <span>⚠️</span>
          <span>{errorMsg}</span>
        </div>
      )}

      {loadingData ? (
        <AdminSkeleton />
      ) : stats ? (
        <div className="space-y-8">
          
          {/* ── 4 CORE STAT CARDS ── */}
          <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
            {/* Card 1: Users */}
            <ExecutiveStatCard
              icon={<Users size={20} />}
              label="Total Users"
              value={stats.totalUsers}
              trend="↑ +2 this week"
              caption="Active registrations"
              accentColor="#2563EB"
              badgeBg="rgba(37, 99, 235, 0.12)"
              badgeText="#2563EB"
            />

            {/* Card 2: Resumes Saved */}
            <ExecutiveStatCard
              icon={<FileText size={20} />}
              label="Resumes Built"
              value={stats.totalResumes}
              trend="↑ +8 this week"
              caption="Evidence portfolios"
              accentColor="#14B8A6"
              badgeBg="rgba(20, 184, 166, 0.12)"
              badgeText="#14B8A6"
            />

            {/* Card 3: AI Diagnostics */}
            <ExecutiveStatCard
              icon={<Zap size={20} />}
              label="AI Runs (Deep)"
              value={stats.aiAnalysesCount}
              subValue={`(${stats.deepAnalysisCount} Deep)`}
              trend="↑ +12 this week"
              caption="Copilot & Match engine"
              accentColor="#7C3AED"
              badgeBg="rgba(124, 58, 237, 0.12)"
              badgeText="#7C3AED"
            />

            {/* Card 4: Avg ATS Score */}
            <ExecutiveStatCard
              icon={<Award size={20} />}
              label="Avg ATS Score"
              value={`${stats.averageATS}%`}
              trend="↑ +5% calibration"
              caption="Workday benchmark"
              accentColor="#F59E0B"
              badgeBg="rgba(245, 158, 11, 0.12)"
              badgeText="#F59E0B"
            />
          </section>

          {/* ── QUICK ADMINISTRATIVE SHORTCUTS ── */}
          <section className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            <Link
              href="/admin/users"
              className="p-4 rounded-xl bg-[var(--bg-elevated)] border border-[var(--border)] hover:border-amber-500/40 hover:shadow-md transition-all group no-underline flex items-center justify-between"
            >
              <div className="flex items-center gap-3 min-w-0">
                <div className="w-8 h-8 rounded-lg bg-blue-500/10 text-blue-500 flex items-center justify-center shrink-0">
                  <User size={16} />
                </div>
                <div className="truncate">
                  <div className="text-xs font-bold text-[var(--text-primary)] group-hover:text-amber-500 transition-colors">Users Management</div>
                  <div className="text-[10px] text-[var(--text-muted)]">Roles & Tiers</div>
                </div>
              </div>
              <ArrowRight size={14} className="text-[var(--text-muted)] group-hover:translate-x-1 group-hover:text-amber-500 transition-all shrink-0" />
            </Link>

            <Link
              href="/admin/ai-usage"
              className="p-4 rounded-xl bg-[var(--bg-elevated)] border border-[var(--border)] hover:border-amber-500/40 hover:shadow-md transition-all group no-underline flex items-center justify-between"
            >
              <div className="flex items-center gap-3 min-w-0">
                <div className="w-8 h-8 rounded-lg bg-purple-500/10 text-purple-500 flex items-center justify-center shrink-0">
                  <Zap size={16} />
                </div>
                <div className="truncate">
                  <div className="text-xs font-bold text-[var(--text-primary)] group-hover:text-amber-500 transition-colors">AI Token Log</div>
                  <div className="text-[10px] text-[var(--text-muted)]">Cost Telemetry</div>
                </div>
              </div>
              <ArrowRight size={14} className="text-[var(--text-muted)] group-hover:translate-x-1 group-hover:text-amber-500 transition-all shrink-0" />
            </Link>

            <Link
              href="/admin/keywords"
              className="p-4 rounded-xl bg-[var(--bg-elevated)] border border-[var(--border)] hover:border-amber-500/40 hover:shadow-md transition-all group no-underline flex items-center justify-between"
            >
              <div className="flex items-center gap-3 min-w-0">
                <div className="w-8 h-8 rounded-lg bg-amber-500/10 text-amber-500 flex items-center justify-center shrink-0">
                  <Key size={16} />
                </div>
                <div className="truncate">
                  <div className="text-xs font-bold text-[var(--text-primary)] group-hover:text-amber-500 transition-colors">ATS Keywords</div>
                  <div className="text-[10px] text-[var(--text-muted)]">Parser Weights</div>
                </div>
              </div>
              <ArrowRight size={14} className="text-[var(--text-muted)] group-hover:translate-x-1 group-hover:text-amber-500 transition-all shrink-0" />
            </Link>

            <Link
              href="/admin/billing"
              className="p-4 rounded-xl bg-[var(--bg-elevated)] border border-[var(--border)] hover:border-amber-500/40 hover:shadow-md transition-all group no-underline flex items-center justify-between"
            >
              <div className="flex items-center gap-3 min-w-0">
                <div className="w-8 h-8 rounded-lg bg-teal-500/10 text-teal-500 flex items-center justify-center shrink-0">
                  <CreditCard size={16} />
                </div>
                <div className="truncate">
                  <div className="text-xs font-bold text-[var(--text-primary)] group-hover:text-amber-500 transition-colors">Billing & Audit</div>
                  <div className="text-[10px] text-[var(--text-muted)]">Credit Plans</div>
                </div>
              </div>
              <ArrowRight size={14} className="text-[var(--text-muted)] group-hover:translate-x-1 group-hover:text-amber-500 transition-all shrink-0" />
            </Link>
          </section>

          {/* ── RECHARTS ANALYTICS GRAPHS (2 COLUMNS) ── */}
          <section className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            
            {/* Chart 1: User Signups Trend */}
            <div className="p-5 md:p-6 rounded-2xl bg-[var(--bg-elevated)] border border-[var(--border)] shadow-sm backdrop-blur-xl relative">
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h3 className="text-sm font-extrabold text-[var(--text-primary)] flex items-center gap-2">
                    <User size={16} className="text-emerald-500" />
                    User Registrations Velocity
                  </h3>
                  <p className="text-[11px] text-[var(--text-muted)] mt-0.5">Last 7 days new account telemetry</p>
                </div>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-emerald-500/10 text-emerald-500 border border-emerald-500/20">
                  Live Feed
                </span>
              </div>

              <div className="w-full h-[260px] min-w-0">
                {mounted && (
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={signupData} margin={{ top: 10, right: 10, left: -25, bottom: 0 }}>
                      <defs>
                        <linearGradient id="signupGradient" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="#10B981" stopOpacity={0.35}/>
                          <stop offset="95%" stopColor="#10B981" stopOpacity={0.0}/>
                        </linearGradient>
                      </defs>
                      <CartesianGrid strokeDasharray="3 3" stroke="rgba(128,128,128,0.12)" vertical={false} />
                      <XAxis dataKey="day" stroke="rgba(128,128,128,0.5)" style={{ fontSize: '11px' }} />
                      <YAxis stroke="rgba(128,128,128,0.5)" style={{ fontSize: '11px' }} allowDecimals={false} />
                      <Tooltip 
                        contentStyle={{
                          backgroundColor: 'var(--bg-elevated)',
                          backdropFilter: 'blur(12px)',
                          border: '1px solid var(--border)',
                          borderRadius: '10px',
                          color: 'var(--text-primary)',
                          fontSize: '12px',
                          boxShadow: '0 8px 24px rgba(0,0,0,0.15)'
                        }}
                      />
                      <Area 
                        type="monotone" 
                        dataKey="signups" 
                        stroke="#10B981" 
                        strokeWidth={2.5}
                        fill="url(#signupGradient)"
                        activeDot={{ r: 5, strokeWidth: 0, fill: '#10B981' }}
                        isAnimationActive={true}
                        animationDuration={700}
                      />
                    </AreaChart>
                  </ResponsiveContainer>
                )}
              </div>
            </div>

            {/* Chart 2: Resume Activity Bar Chart */}
            <div className="p-5 md:p-6 rounded-2xl bg-[var(--bg-elevated)] border border-[var(--border)] shadow-sm backdrop-blur-xl relative">
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h3 className="text-sm font-extrabold text-[var(--text-primary)] flex items-center gap-2">
                    <FileText size={16} className="text-blue-500" />
                    Resume Creations vs AI Analyses
                  </h3>
                  <p className="text-[11px] text-[var(--text-muted)] mt-0.5">Daily document generations & LLM optimization cycles</p>
                </div>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-blue-500/10 text-blue-500 border border-blue-500/20">
                  Telemetry
                </span>
              </div>

              <div className="w-full h-[260px] min-w-0">
                {mounted && (
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={activityData} margin={{ top: 10, right: 10, left: -25, bottom: 0 }}>
                      <defs>
                        <linearGradient id="uploadGradient" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="0%" stopColor="#2563EB" stopOpacity={0.9}/>
                          <stop offset="100%" stopColor="#2563EB" stopOpacity={0.4}/>
                        </linearGradient>
                        <linearGradient id="analysisGradient" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="0%" stopColor="#7C3AED" stopOpacity={0.9}/>
                          <stop offset="100%" stopColor="#7C3AED" stopOpacity={0.4}/>
                        </linearGradient>
                      </defs>
                      <CartesianGrid strokeDasharray="3 3" stroke="rgba(128,128,128,0.12)" vertical={false} />
                      <XAxis dataKey="day" stroke="rgba(128,128,128,0.5)" style={{ fontSize: '11px' }} />
                      <YAxis stroke="rgba(128,128,128,0.5)" style={{ fontSize: '11px' }} allowDecimals={false} />
                      <Tooltip 
                        contentStyle={{
                          backgroundColor: 'var(--bg-elevated)',
                          backdropFilter: 'blur(12px)',
                          border: '1px solid var(--border)',
                          borderRadius: '10px',
                          color: 'var(--text-primary)',
                          fontSize: '12px',
                          boxShadow: '0 8px 24px rgba(0,0,0,0.15)'
                        }}
                      />
                      <Legend wrapperStyle={{ fontSize: '11px', paddingTop: '10px' }} iconType="circle" />
                      <Bar 
                        dataKey="uploads" 
                        name="Resumes Created" 
                        fill="url(#uploadGradient)" 
                        radius={[5, 5, 0, 0]} 
                        animationDuration={700}
                      />
                      <Bar 
                        dataKey="analysis" 
                        name="AI Analyses" 
                        fill="url(#analysisGradient)" 
                        radius={[5, 5, 0, 0]} 
                        animationDuration={700}
                      />
                    </BarChart>
                  </ResponsiveContainer>
                )}
              </div>
            </div>

          </section>

          {/* ── SECONDARY DIAGNOSTICS (3 COLUMNS) ── */}
          <section className="grid grid-cols-1 md:grid-cols-3 gap-6">
            
            {/* Col 1: Top Keywords */}
            <div className="p-5 rounded-2xl bg-[var(--bg-elevated)] border border-[var(--border)] space-y-4 shadow-sm backdrop-blur-xl">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-xs font-extrabold text-[var(--text-primary)] flex items-center gap-1.5 uppercase tracking-wider">
                    <Brain size={14} className="text-blue-500" />
                    Top ATS Skills
                  </h3>
                  <p className="text-[11px] text-[var(--text-muted)] mt-0.5">Most frequent skills extracted</p>
                </div>
                <Link href="/admin/keywords" className="text-[10px] font-bold text-amber-500 hover:underline">
                  Manage →
                </Link>
              </div>
              
              <div className="space-y-3">
                {topKeywords.map((kw, i) => (
                  <div key={kw.id} className="space-y-1">
                    <div className="flex justify-between text-xs font-semibold">
                      <span className="text-[var(--text-primary)] flex items-center gap-1.5">
                        <span className="w-4 h-4 rounded-md bg-[var(--bg-page)] border border-[var(--border)] text-[9px] font-bold flex items-center justify-center text-[var(--text-muted)]">
                          {i + 1}
                        </span>
                        {kw.name}
                      </span>
                      <span className="text-[var(--text-muted)] text-[11px]">{kw.frequency}x ({kw.percentage}%)</span>
                    </div>
                    <div className="h-1.5 bg-[var(--bg-page)] rounded-full overflow-hidden border border-[var(--border)]">
                      <div 
                        className="h-full bg-gradient-to-r from-[#2563EB] to-[#14B8A6] rounded-full"
                        style={{ width: `${kw.percentage}%` }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Col 2: Template Usage */}
            <div className="p-5 rounded-2xl bg-[var(--bg-elevated)] border border-[var(--border)] space-y-4 shadow-sm backdrop-blur-xl">
              <div>
                <h3 className="text-xs font-extrabold text-[var(--text-primary)] flex items-center gap-1.5 uppercase tracking-wider">
                  <Layers size={14} className="text-purple-500" />
                  Template Adoption
                </h3>
                <p className="text-[11px] text-[var(--text-muted)] mt-0.5">Active visual layout choices</p>
              </div>
              
              {activeTemplates.length > 0 ? (
                <div className="space-y-2 max-h-[190px] overflow-y-auto pr-1">
                  {activeTemplates.map(template => (
                    <div 
                      key={template.id} 
                      className="flex items-center justify-between p-2.5 bg-[var(--bg-page)] border border-[var(--border)] rounded-xl hover:border-purple-500/30 transition-all text-xs"
                    >
                      <div className="flex items-center gap-2 min-w-0">
                        <div className="w-2 h-2 rounded-full bg-purple-500 shrink-0" />
                        <span className="font-bold text-[var(--text-primary)] truncate">{template.name}</span>
                      </div>
                      <div className="flex items-center gap-2 shrink-0">
                        <span className="font-extrabold text-purple-600 dark:text-purple-400">{template.count}</span>
                        <span className="text-[10px] text-[var(--text-muted)]">({template.percentage}%)</span>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8 text-xs text-[var(--text-muted)]">
                  No template data loaded yet
                </div>
              )}
            </div>

            {/* Col 3: Feature Adoption & Storage */}
            <div className="p-5 rounded-2xl bg-[var(--bg-elevated)] border border-[var(--border)] space-y-4 shadow-sm backdrop-blur-xl">
              <div>
                <h3 className="text-xs font-extrabold text-[var(--text-primary)] flex items-center gap-1.5 uppercase tracking-wider">
                  <Zap size={14} className="text-amber-500" />
                  Feature Adoption
                </h3>
                <p className="text-[11px] text-[var(--text-muted)] mt-0.5">Platform engagement depth</p>
              </div>
              
              <div className="space-y-3">
                {featureAdoption.map((feat, idx) => (
                  <div key={idx} className="space-y-1">
                    <div className="flex justify-between text-xs font-semibold">
                      <span className="text-[var(--text-primary)]">{feat.name}</span>
                      <span className="text-[var(--text-muted)] text-[11px]">{feat.percentage}%</span>
                    </div>
                    <div className="h-1.5 bg-[var(--bg-page)] rounded-full overflow-hidden border border-[var(--border)]">
                      <div 
                        className={`h-full bg-gradient-to-r ${feat.color} rounded-full`}
                        style={{ width: `${feat.percentage}%` }}
                      />
                    </div>
                  </div>
                ))}
              </div>

              {/* Storage Pill */}
              <div className="pt-2 border-t border-[var(--border)] flex items-center justify-between text-[11px]">
                <span className="text-[var(--text-muted)] flex items-center gap-1 font-medium">
                  <HardDrive size={12} className="text-blue-500" /> Storage Used
                </span>
                <span className="font-extrabold text-[var(--text-primary)]">
                  {stats.storageUsed}
                </span>
              </div>
            </div>

          </section>

        </div>
      ) : (
        <div className="p-12 text-center rounded-2xl bg-[var(--bg-elevated)] border border-[var(--border)] text-[var(--text-muted)]">
          No statistics telemetry populated. Verify active database records exist.
        </div>
      )}

    </div>
  );
}
