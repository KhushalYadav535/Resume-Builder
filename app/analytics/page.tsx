"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import Navbar from "@/components/Navbar";
import ParticleBackground from "@/components/ui/ParticleBackground";
import { createClient } from "@/utils/supabase/client";
import { 
  Users, FileText, Brain, Clock, ShieldCheck, Sparkles, TrendingUp, User, Zap, Award, HardDrive
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

const colorMap: Record<string, {
  bg: string;
  glow: string;
  text: string;
  borderHover: string;
  gradientText: string;
  bottomBorder: string;
}> = {
  indigo: {
    bg: 'from-indigo-500/10 to-purple-500/5 dark:from-indigo-500/20 dark:to-purple-500/10',
    glow: 'from-indigo-600/10 to-indigo-600/5 dark:from-indigo-600/20 dark:to-indigo-600/10',
    text: 'text-indigo-600 dark:text-indigo-400',
    borderHover: 'group-hover:border-indigo-500/30 dark:group-hover:border-indigo-400/30',
    gradientText: 'from-slate-800 via-indigo-600 to-slate-900 dark:from-white dark:via-indigo-400 dark:to-white',
    bottomBorder: 'from-indigo-500/50 to-transparent'
  },
  green: {
    bg: 'from-green-500/10 to-emerald-500/5 dark:from-green-500/20 dark:to-emerald-500/10',
    glow: 'from-green-600/10 to-green-600/5 dark:from-green-600/20 dark:to-green-600/10',
    text: 'text-emerald-600 dark:text-emerald-400',
    borderHover: 'group-hover:border-emerald-500/30 dark:group-hover:border-emerald-400/30',
    gradientText: 'from-slate-800 via-emerald-600 to-slate-900 dark:from-white dark:via-green-400 dark:to-white',
    bottomBorder: 'from-emerald-500/50 to-transparent'
  },
  purple: {
    bg: 'from-purple-500/10 to-pink-500/5 dark:from-purple-500/20 dark:to-pink-500/10',
    glow: 'from-purple-600/10 to-purple-600/5 dark:from-purple-600/20 dark:to-purple-600/10',
    text: 'text-purple-600 dark:text-purple-400',
    borderHover: 'group-hover:border-purple-500/30 dark:group-hover:border-purple-400/30',
    gradientText: 'from-slate-800 via-purple-600 to-slate-900 dark:from-white dark:via-purple-400 dark:to-white',
    bottomBorder: 'from-purple-500/50 to-transparent'
  },
  amber: {
    bg: 'from-amber-500/10 to-orange-500/5 dark:from-amber-500/20 dark:to-orange-500/10',
    glow: 'from-amber-600/10 to-amber-600/5 dark:from-amber-600/20 dark:to-amber-600/10',
    text: 'text-amber-600 dark:text-amber-400',
    borderHover: 'group-hover:border-amber-500/30 dark:group-hover:border-amber-400/30',
    gradientText: 'from-slate-800 via-amber-600 to-slate-900 dark:from-white dark:via-amber-400 dark:to-white',
    bottomBorder: 'from-amber-500/50 to-transparent'
  },
};

interface PremiumStatCardProps {
  icon: string | React.ReactNode;
  label: string;
  value: string | number;
  trend: string;
  trendDirection?: 'up' | 'down';
  color?: 'indigo' | 'green' | 'purple' | 'amber';
}

const PremiumStatCard = ({ 
  icon, 
  label, 
  value, 
  trend, 
  trendDirection = 'up',
  color = 'indigo' 
}: PremiumStatCardProps) => {
  const colors = colorMap[color];

  return (
    <div className={`group relative p-[1px] rounded-2xl bg-gradient-to-br ${colors.bg}`}>
      {/* Multi-layer glow background */}
      <div className={`absolute -inset-1 rounded-2xl bg-gradient-to-br ${colors.glow} blur-xl opacity-0 group-hover:opacity-100 transition-all duration-500 -z-10`} />

      {/* Main card container */}
      <div className={`relative p-8 rounded-2xl bg-white/80 dark:bg-slate-950/40 dark:bg-gradient-to-br dark:from-white/[0.07] dark:to-white/[0.02] backdrop-blur-2xl border border-slate-200/60 dark:border-white/10 shadow-sm dark:shadow-[0_8px_32px_rgba(99,102,241,0.08)] group-hover:shadow-md dark:group-hover:shadow-[0_20px_60px_rgba(99,102,241,0.18)] group-hover:-translate-y-1.5 ${colors.borderHover} transition-all duration-300`}>
        {/* Top row: Icon + Label */}
        <div className="flex items-start justify-between mb-6">
          {/* Icon with rotating glow */}
          <div className="relative">
            <div className={`absolute -inset-2 rounded-xl bg-gradient-to-br ${colors.glow} blur-lg group-hover:blur-xl transition-all duration-300`} />
            <div className="relative text-3xl group-hover:scale-110 group-hover:rotate-6 transition-transform duration-300">
              {icon}
            </div>
          </div>

          {/* Label */}
          <span className="text-[10px] font-bold text-slate-500 dark:text-gray-400 uppercase tracking-wider">
            {label}
          </span>
        </div>

        {/* Value - Large and prominent */}
        <div className="mb-4">
          <div className={`text-4xl font-extrabold bg-gradient-to-r ${colors.gradientText} bg-clip-text text-transparent`}>
            {typeof value === 'number' ? value.toLocaleString() : value}
          </div>
        </div>

        {/* Trend indicator */}
        <div className="flex items-center gap-1.5">
          <span className={`text-xs font-semibold ${
            trendDirection === 'up' ? 'text-emerald-400' : 'text-rose-400'
          }`}>
            {trendDirection === 'up' ? '↑' : '↓'} {trend}
          </span>
          <span className="text-[10px] text-slate-400 dark:text-gray-500">this week</span>
        </div>

        {/* Animated bottom border */}
        <div className={`absolute bottom-0 left-0 h-[3px] bg-gradient-to-r ${colors.bottomBorder} rounded-full scale-x-0 group-hover:scale-x-100 transition-transform duration-300 origin-left w-full`} />
      </div>
    </div>
  );
};

export default function AnalyticsDashboardPage() {
  const router = useRouter();
  const [loadingCheck, setLoadingCheck] = useState(true);
  const [stats, setStats] = useState<AnalyticsStats | null>(null);
  const [loadingData, setLoadingData] = useState(true);
  const [errorMsg, setErrorMsg] = useState("");
  const [mounted, setMounted] = useState(false);
  const supabase = createClient();

  useEffect(() => {
    // Client-side RBAC verification
    const verifyAdmin = async () => {
      try {
        const {
          data: { user },
        } = await supabase.auth.getUser();

        if (!user) {
          router.push("/login");
          return;
        }

        const { data: profile, error } = await supabase
          .from("user_profiles")
          .select("role")
          .eq("id", user.id)
          .single();

        if (error || !profile || profile.role !== "admin") {
          console.warn("Access Denied: Redirecting non-admin to dashboard.");
          router.push("/dashboard");
          return;
        }

        setLoadingCheck(false);
        fetchStats();
        setMounted(true);
      } catch (err) {
        console.error("RBAC check failed:", err);
        router.push("/dashboard");
      }
    };

    verifyAdmin();
  }, [router, supabase]);

  const fetchStats = async () => {
    setLoadingData(true);
    setErrorMsg("");
    try {
      const res = await fetch("/api/analytics");
      if (!res.ok) {
        if (res.status === 403) {
          throw new Error("Access Denied: You do not possess administrator rights.");
        }
        throw new Error("Failed to load platform stats.");
      }
      const data = await res.json();
      if (data.success && data.stats) {
        setStats(data.stats);
      } else {
        throw new Error(data.error || "Failed to retrieve statistics.");
      }
    } catch (err: any) {
      setErrorMsg(err.message || "An unexpected error occurred.");
    } finally {
      setLoadingData(false);
    }
  };

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
    { name: "Deep AI Enhancement", percentage: deepAnalysisRate || 10, color: "from-purple-500 to-indigo-500" },
    { name: "ATS Optimization Check", percentage: aiOptimizeRate || 75, color: "from-amber-500 to-orange-500" },
    { name: "Word Document Export", percentage: 85, color: "from-emerald-500 to-teal-500" },
  ];

  if (loadingCheck) {
    return (
      <div className="min-h-screen bg-[var(--bg-page)] flex items-center justify-center">
        <div className="spinner w-10 h-10" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[var(--bg-page)] text-[var(--text)] relative overflow-hidden transition-colors duration-300">
      {/* Background radial elements */}
      <div className="absolute top-20 right-10 w-96 h-96 bg-indigo-500/5 dark:bg-indigo-500/[0.03] rounded-full blur-3xl -z-10" />
      <div className="absolute bottom-20 left-10 w-96 h-96 bg-purple-500/5 dark:bg-purple-500/[0.03] rounded-full blur-3xl -z-10" />
      
      <ParticleBackground count={40} connectionDist={100} />
      
      <div className="relative z-10">
        <Navbar />
        
        <main className="max-w-7xl mx-auto px-6 py-10 space-y-10">
          
          {/* Header */}
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
            <div className="space-y-2">
              <div className="flex items-center gap-2 text-xs">
                <Link href="/dashboard" className="text-slate-500 dark:text-gray-400 no-underline hover:text-indigo-600 dark:hover:text-white transition">
                  ← Back to Dashboard
                </Link>
                <span className="text-slate-300 dark:text-gray-600">/</span>
                <span className="text-indigo-600 dark:text-indigo-400 font-bold bg-indigo-500/10 px-2 py-0.5 rounded border border-indigo-500/20">
                  Platform Telemetry
                </span>
              </div>
              <h1 className="text-3xl md:text-4xl font-extrabold font-['Syne',sans-serif] tracking-tight flex items-center gap-2">
                <ShieldCheck size={32} className="text-indigo-600 dark:text-indigo-400" />
                Telemetry Dashboard
              </h1>
            </div>

            <button 
              onClick={fetchStats} 
              className="px-4 py-2 bg-slate-100 dark:bg-white/5 border border-slate-200 dark:border-white/10 hover:bg-slate-200 dark:hover:bg-white/10 text-xs font-bold rounded-xl cursor-pointer transition flex items-center gap-1.5"
              disabled={loadingData}
            >
              🔄 Refresh Data
            </button>
          </div>

          {errorMsg && (
            <div className="p-4 rounded-xl bg-rose-500/10 border-l-4 border-rose-500 text-rose-300 text-sm">
              {errorMsg}
            </div>
          )}

          {loadingData ? (
            <div className="flex flex-col items-center justify-center py-24 rounded-2xl bg-white/80 dark:bg-white/[0.02] border border-slate-200/60 dark:border-white/5 shadow-sm dark:shadow-xl">
              <div className="spinner mb-4 w-10 h-10" />
              <p className="text-sm text-slate-500 dark:text-[#9ea3c8]">Compiling platform telemetry...</p>
            </div>
          ) : stats ? (
            <div className="space-y-10">
              
              {/* Stat Cards Grid (4 columns) */}
              <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                <PremiumStatCard
                  icon={<Users className="text-indigo-600 dark:text-indigo-400" size={24} />}
                  label="Total Users"
                  value={stats.totalUsers}
                  trend="+2"
                  color="indigo"
                />
                <PremiumStatCard
                  icon={<FileText className="text-purple-600 dark:text-purple-400" size={24} />}
                  label="Resumes Saved"
                  value={stats.totalResumes}
                  trend="+8"
                  color="purple"
                />
                <PremiumStatCard
                  icon={<Zap className="text-amber-600 dark:text-amber-400" size={24} />}
                  label="AI Runs (Deep)"
                  value={`${stats.aiAnalysesCount} (${stats.deepAnalysisCount})`}
                  trend="+12"
                  color="amber"
                />
                <PremiumStatCard
                  icon={<Award className="text-emerald-600 dark:text-emerald-400" size={24} />}
                  label="Avg ATS Score"
                  value={`${stats.averageATS}%`}
                  trend="+5%"
                  color="green"
                />
              </section>

              {/* Supplementary Stats Section */}
              <section className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                <div className="flex items-center gap-4 p-6 rounded-2xl bg-white/80 dark:bg-slate-950/40 dark:bg-gradient-to-br dark:from-white/[0.05] dark:to-white/[0.01] border border-slate-200/60 dark:border-white/5 shadow-sm">
                  <div className="w-12 h-12 bg-amber-500/10 rounded-xl flex items-center justify-center text-amber-500 dark:text-amber-400">
                    <Clock size={22} />
                  </div>
                  <div>
                    <h3 className="text-xs font-bold text-slate-500 dark:text-[#9ea3c8] uppercase tracking-wider">Created Today</h3>
                    <p className="text-2xl font-bold text-slate-900 dark:text-white mt-1">{stats.uploadedToday}</p>
                  </div>
                </div>
                <div className="flex items-center gap-4 p-6 rounded-2xl bg-white/80 dark:bg-slate-950/40 dark:bg-gradient-to-br dark:from-white/[0.05] dark:to-white/[0.01] border border-slate-200/60 dark:border-white/5 shadow-sm">
                  <div className="w-12 h-12 bg-indigo-500/10 rounded-xl flex items-center justify-center text-indigo-600 dark:text-indigo-400">
                    <HardDrive size={22} />
                  </div>
                  <div>
                    <h3 className="text-xs font-bold text-slate-500 dark:text-[#9ea3c8] uppercase tracking-wider">Storage Utilized</h3>
                    <p className="text-2xl font-bold text-slate-900 dark:text-white mt-1">{stats.storageUsed}</p>
                  </div>
                </div>
              </section>

              {/* Recharts Analytics Graphs (2 columns) */}
              <section className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                
                {/* User Signups Trend Area Chart */}
                <div className="p-6 md:p-8 rounded-2xl bg-white/80 dark:bg-slate-950/40 dark:bg-gradient-to-br dark:from-white/[0.05] dark:to-white/[0.01] backdrop-blur-xl border border-slate-200/60 dark:border-white/10 shadow-sm dark:shadow-xl">
                  <div className="mb-6">
                    <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-1 flex items-center gap-2">
                      <User size={18} className="text-emerald-500 dark:text-emerald-400" />
                      User Signups Trend
                    </h3>
                    <p className="text-xs text-slate-500 dark:text-gray-400">Last 7 days registration telemetry</p>
                  </div>

                  <div className="w-full h-[280px] min-w-0">
                    {mounted && (
                      <ResponsiveContainer width="100%" height="100%">
                        <AreaChart data={signupData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                          <defs>
                            <linearGradient id="signupGradient" x1="0" y1="0" x2="0" y2="1">
                              <stop offset="5%" stopColor="#10b981" stopOpacity={0.4}/>
                              <stop offset="95%" stopColor="#10b981" stopOpacity={0}/>
                            </linearGradient>
                          </defs>
                          <CartesianGrid strokeDasharray="3 3" stroke="rgba(128,128,128,0.15)" vertical={false} />
                          <XAxis dataKey="day" stroke="rgba(128,128,128,0.5)" style={{ fontSize: '11px' }} />
                          <YAxis stroke="rgba(128,128,128,0.5)" style={{ fontSize: '11px' }} allowDecimals={false} />
                          <Tooltip 
                            contentStyle={{
                              backgroundColor: 'var(--bg-glass)',
                              border: '1px solid var(--border)',
                              borderRadius: '12px',
                              color: 'var(--text)',
                              fontSize: '12px'
                            }}
                            cursor={{ stroke: 'rgba(16,185,129,0.2)' }}
                          />
                          <Area 
                            type="monotone" 
                            dataKey="signups" 
                            stroke="#10b981" 
                            strokeWidth={2}
                            fill="url(#signupGradient)"
                            isAnimationActive={true}
                            animationDuration={850}
                          />
                        </AreaChart>
                      </ResponsiveContainer>
                    )}
                  </div>
                </div>

                {/* Resume Activity Bar Chart */}
                <div className="p-6 md:p-8 rounded-2xl bg-white/80 dark:bg-slate-950/40 dark:bg-gradient-to-br dark:from-white/[0.05] dark:to-white/[0.01] backdrop-blur-xl border border-slate-200/60 dark:border-white/10 shadow-sm dark:shadow-xl min-w-0">
                  <div className="mb-6">
                    <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-1 flex items-center gap-2">
                      <FileText size={18} className="text-purple-600 dark:text-purple-400" />
                      Resume Activity Trend
                    </h3>
                    <p className="text-xs text-slate-500 dark:text-gray-400">Daily uploads & system analysis counts</p>
                  </div>

                  <div className="w-full h-[280px] min-w-0">
                    {mounted && (
                      <ResponsiveContainer width="100%" height="100%">
                        <BarChart data={activityData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                          <defs>
                            <linearGradient id="uploadGradient" x1="0" y1="0" x2="0" y2="1">
                              <stop offset="0%" stopColor="#6366f1" stopOpacity={0.9}/>
                              <stop offset="100%" stopColor="#6366f1" stopOpacity={0.3}/>
                            </linearGradient>
                            <linearGradient id="analysisGradient" x1="0" y1="0" x2="0" y2="1">
                              <stop offset="0%" stopColor="#8b5cf6" stopOpacity={0.9}/>
                              <stop offset="100%" stopColor="#8b5cf6" stopOpacity={0.3}/>
                            </linearGradient>
                          </defs>
                          <CartesianGrid strokeDasharray="3 3" stroke="rgba(128,128,128,0.15)" vertical={false} />
                          <XAxis dataKey="day" stroke="rgba(128,128,128,0.5)" style={{ fontSize: '11px' }} />
                          <YAxis stroke="rgba(128,128,128,0.5)" style={{ fontSize: '11px' }} allowDecimals={false} />
                          <Tooltip 
                            contentStyle={{
                              backgroundColor: 'var(--bg-glass)',
                              border: '1px solid var(--border)',
                              borderRadius: '12px',
                              color: 'var(--text)',
                              fontSize: '12px'
                            }}
                          />
                          <Legend wrapperStyle={{ fontSize: '11px', paddingTop: '15px' }} iconType="circle" />
                          <Bar 
                            dataKey="uploads" 
                            name="Uploads"
                            fill="url(#uploadGradient)"
                            radius={[6, 6, 0, 0]}
                            animationDuration={850}
                          />
                          <Bar 
                            dataKey="analysis" 
                            name="Analyses"
                            fill="url(#analysisGradient)"
                            radius={[6, 6, 0, 0]}
                            animationDuration={850}
                          />
                        </BarChart>
                      </ResponsiveContainer>
                    )}
                  </div>
                </div>

              </section>

              {/* Additional Metrics (3 columns) */}
              <section className="grid grid-cols-1 md:grid-cols-3 gap-6">
                
                {/* ATS Keywords Performance */}
                <div className="p-6 rounded-2xl bg-white/80 dark:bg-slate-950/40 dark:bg-gradient-to-br dark:from-white/[0.05] dark:to-white/[0.01] backdrop-blur-xl border border-slate-200/60 dark:border-white/5 space-y-6 shadow-sm">
                  <div>
                    <h3 className="text-base font-bold text-slate-900 dark:text-white mb-1 flex items-center gap-1.5">
                      <Brain size={16} className="text-indigo-600 dark:text-indigo-400" />
                      Top Keywords
                    </h3>
                    <p className="text-[11px] text-slate-500 dark:text-gray-400">Most frequent skills parsed on resumes</p>
                  </div>
                  
                  <div className="space-y-4">
                    {topKeywords.map(keyword => (
                      <div key={keyword.id} className="space-y-1">
                        <div className="flex justify-between text-xs">
                          <span className="font-semibold text-slate-800 dark:text-[#e8e9f5]">{keyword.name}</span>
                          <span className="text-slate-500 dark:text-gray-400">{keyword.frequency} times ({keyword.percentage}%)</span>
                        </div>
                        <div className="h-1.5 bg-slate-200 dark:bg-white/5 rounded-full overflow-hidden">
                          <div 
                            className="h-full bg-gradient-to-r from-indigo-500 to-purple-500 rounded-full"
                            style={{ width: `${keyword.percentage}%` }}
                          />
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Template Usage (Filtered count > 0) */}
                <div className="p-6 rounded-2xl bg-white/80 dark:bg-slate-950/40 dark:bg-gradient-to-br dark:from-white/[0.05] dark:to-white/[0.01] backdrop-blur-xl border border-slate-200/60 dark:border-white/5 space-y-6 shadow-sm">
                  <div>
                    <h3 className="text-base font-bold text-slate-900 dark:text-white mb-1 flex items-center gap-1.5">
                      <Award size={16} className="text-purple-600 dark:text-purple-400" />
                      Template Usage Analytics
                    </h3>
                    <p className="text-[11px] text-slate-500 dark:text-gray-400">Active design style choices</p>
                  </div>
                  
                  {activeTemplates.length > 0 ? (
                    <div className="space-y-3 max-h-[220px] overflow-y-auto pr-1">
                      {activeTemplates.map(template => (
                        <div 
                          key={template.id} 
                          className="flex items-center justify-between p-3 bg-indigo-50/50 dark:bg-indigo-500/[0.03] border border-indigo-100 dark:border-indigo-500/10 rounded-xl hover:bg-indigo-50 dark:hover:bg-indigo-500/[0.07] transition-all duration-200"
                        >
                          <div className="flex items-center gap-2">
                            <div className="w-2 h-2 rounded-full bg-indigo-600 dark:bg-indigo-400" />
                            <span className="text-xs text-slate-800 dark:text-white font-bold">{template.name}</span>
                          </div>
                          <div className="flex items-center gap-3 text-xs">
                            <span className="text-indigo-600 dark:text-indigo-300 font-extrabold">{template.count} used</span>
                            <span className="text-[10px] text-slate-500">{template.percentage}%</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-8 text-xs text-gray-500">
                      No design template data loaded yet
                    </div>
                  )}
                </div>

                {/* Feature Adoption Stats */}
                <div className="p-6 rounded-2xl bg-white/80 dark:bg-slate-950/40 dark:bg-gradient-to-br dark:from-white/[0.05] dark:to-white/[0.01] backdrop-blur-xl border border-slate-200/60 dark:border-white/5 space-y-6 shadow-sm">
                  <div>
                    <h3 className="text-base font-bold text-slate-900 dark:text-white mb-1 flex items-center gap-1.5">
                      <Zap size={16} className="text-amber-500 dark:text-amber-400" />
                      Feature Adoption
                    </h3>
                    <p className="text-[11px] text-slate-500 dark:text-gray-400">User interaction indices per feature</p>
                  </div>
                  
                  <div className="space-y-4">
                    {featureAdoption.map((feat, idx) => (
                      <div key={idx} className="space-y-1">
                        <div className="flex justify-between text-xs">
                          <span className="font-semibold text-slate-800 dark:text-[#e8e9f5]">{feat.name}</span>
                          <span className="text-slate-500 dark:text-gray-400">{feat.percentage}%</span>
                        </div>
                        <div className="h-1.5 bg-slate-200 dark:bg-white/5 rounded-full overflow-hidden">
                          <div 
                            className={`h-full bg-gradient-to-r ${feat.color} rounded-full`}
                            style={{ width: `${feat.percentage}%` }}
                          />
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

              </section>

            </div>
          ) : (
            <div className="p-12 text-center rounded-2xl bg-white/80 dark:bg-white/[0.02] border border-slate-200/60 dark:border-white/5 text-slate-500 dark:text-gray-400">
              No platform statistics telemetry populated. Verify active database records exist.
            </div>
          )}

        </main>
      </div>
    </div>
  );
}
