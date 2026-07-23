"use client";
import { useEffect, useState } from "react";
import { Bot, Zap, CheckCircle, AlertTriangle, BarChart3, Clock } from "lucide-react";

const AIUsageSkeleton = () => (
  <div className="space-y-8 animate-pulse">
    {/* Stats Cards Skeleton */}
    <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
      {[1, 2, 3].map((i) => (
        <div key={i} className="h-32 rounded-2xl bg-slate-200/50 dark:bg-white/[0.03] border border-slate-200/40 dark:border-white/5" />
      ))}
    </div>
    {/* Split Layout Skeleton */}
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      <div className="lg:col-span-2 h-[450px] rounded-2xl bg-slate-200/50 dark:bg-white/[0.03] border border-slate-200/40 dark:border-white/5" />
      <div className="h-[300px] rounded-2xl bg-slate-200/50 dark:bg-white/[0.03] border border-slate-200/40 dark:border-white/5" />
    </div>
  </div>
);

interface RequestLog {
  id: string;
  model_used: string;
  tokens_estimated: number;
  success: boolean;
  created_at: string;
  user_profiles?: {
    email: string;
  } | null;
}

interface AIStats {
  totalRequests: number;
  successCount: number;
  failCount: number;
  totalTokens: number;
  successRate: number;
  modelCounts: Record<string, number>;
}

export default function AdminAIUsagePage() {
  const [logs, setLogs] = useState<RequestLog[]>([]);
  const [stats, setStats] = useState<AIStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState("");

  const fetchAIUsage = async () => {
    setLoading(true);
    setErrorMsg("");
    try {
      const res = await fetch("/api/admin/ai-usage");
      if (!res.ok) {
        throw new Error("Failed to load AI request metrics.");
      }
      const data = await res.json();
      if (data.success) {
        setLogs(data.logs || []);
        setStats(data.stats || null);
      } else {
        throw new Error(data.error || "Failed to load usage statistics.");
      }
    } catch (err: any) {
      setErrorMsg(err.message || "An unexpected error occurred.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAIUsage();
  }, []);

  return (
    <div className="space-y-8">
          
          {/* Header */}
          <div className="space-y-2">
            <span className="text-[10px] font-bold text-indigo-600 dark:text-indigo-400 uppercase tracking-widest bg-indigo-500/10 px-3 py-1 rounded-full border border-indigo-500/20">
              LLM Telemetry
            </span>
            <h1 className="text-3xl md:text-4xl font-extrabold font-['Syne',sans-serif] tracking-tight flex items-center gap-2 mt-2">
              <Bot size={32} className="text-indigo-600 dark:text-indigo-400" />
              AI API Usage Tracker
            </h1>
            <p className="text-sm text-slate-600 dark:text-[#9ea3c8] max-w-2xl leading-relaxed">
              Track token estimations, cascading failover success rates, and monitor API traffic for Gemini & OpenRouter.
            </p>
          </div>

          {errorMsg && (
            <div className="p-4 rounded-xl bg-rose-500/10 border-l-4 border-rose-500 text-rose-300 text-sm">
              {errorMsg}
            </div>
          )}

          {loading ? (
            <AIUsageSkeleton />
          ) : !stats || stats.totalRequests === 0 ? (
            <div className="p-12 text-center rounded-2xl bg-white/80 dark:bg-white/[0.02] border border-slate-200/60 dark:border-white/5 text-slate-500 dark:text-gray-400 shadow-sm">
              No AI requests logged yet. Records will be generated as users run resume analysis and translations.
            </div>
          ) : (
            <div className="space-y-8">
              
              {/* Stats Cards */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
                <div className="p-6 rounded-2xl bg-white/80 dark:bg-slate-950/40 dark:bg-gradient-to-br dark:from-white/[0.05] dark:to-white/[0.01] border border-slate-200/60 dark:border-white/5 shadow-sm hover:-translate-y-1 hover:shadow-md transition-all duration-300 text-center">
                  <h3 className="text-[10px] font-bold text-slate-500 dark:text-[#9ea3c8] uppercase tracking-wider mb-2">Total LLM Invocations</h3>
                  <div className="text-3xl font-extrabold font-['Syne',sans-serif] bg-gradient-to-r from-slate-900 via-indigo-600 to-slate-900 dark:from-white dark:via-indigo-400 dark:to-white bg-clip-text text-transparent">
                    {stats.totalRequests}
                  </div>
                </div>

                <div className="p-6 rounded-2xl bg-white/80 dark:bg-slate-950/40 dark:bg-gradient-to-br dark:from-white/[0.05] dark:to-white/[0.01] border border-slate-200/60 dark:border-white/5 shadow-sm hover:-translate-y-1 hover:shadow-md transition-all duration-300 text-center">
                  <h3 className="text-[10px] font-bold text-slate-500 dark:text-[#9ea3c8] uppercase tracking-wider mb-2">Failover Success Rate</h3>
                  <div className={`text-3xl font-extrabold font-['Syne',sans-serif] ${
                    stats.successRate >= 90 ? "text-emerald-600 dark:text-emerald-400" : stats.successRate >= 70 ? "text-amber-500 dark:text-amber-400" : "text-rose-500 dark:text-rose-400"
                  }`}>
                    {stats.successRate}%
                  </div>
                  <div className="text-[10px] text-slate-400 dark:text-gray-500 mt-1">
                    {stats.successCount} OK / {stats.failCount} ERR
                  </div>
                </div>

                <div className="p-6 rounded-2xl bg-white/80 dark:bg-slate-950/40 dark:bg-gradient-to-br dark:from-white/[0.05] dark:to-white/[0.01] border border-slate-200/60 dark:border-white/5 shadow-sm hover:-translate-y-1 hover:shadow-md transition-all duration-300 text-center">
                  <h3 className="text-[10px] font-bold text-slate-500 dark:text-[#9ea3c8] uppercase tracking-wider mb-2">Est. Total Tokens</h3>
                  <div className="text-3xl font-extrabold font-['Syne',sans-serif] text-purple-600 dark:text-purple-400">
                    {stats.totalTokens.toLocaleString()}
                  </div>
                </div>
              </div>

              {/* Split layout: Model breakdown + Log table */}
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
                
                {/* Recent logs table */}
                <div className="lg:col-span-2 rounded-2xl bg-white/80 dark:bg-slate-950/40 dark:bg-gradient-to-br dark:from-white/[0.05] dark:to-white/[0.01] border border-slate-200/60 dark:border-white/10 shadow-sm dark:shadow-xl overflow-hidden hover:-translate-y-1 hover:shadow-2xl dark:hover:shadow-[0_20px_50px_rgba(99,102,241,0.08)] transition-all duration-300">
                  <div className="px-6 py-4 border-b border-slate-200 dark:border-white/10 bg-slate-50 dark:bg-white/[0.01]">
                    <span className="font-bold text-xs md:text-sm text-slate-800 dark:text-white">Recent Execution Logs</span>
                  </div>
                  <div className="overflow-x-auto">
                    <table className="w-full border-collapse text-left text-xs md:text-sm">
                      <thead>
                        <tr className="border-b border-slate-200 dark:border-white/10">
                          <th className="px-6 py-3 font-bold text-slate-500 dark:text-gray-400 uppercase tracking-wider text-[10px]">User</th>
                          <th className="px-6 py-3 font-bold text-slate-500 dark:text-gray-400 uppercase tracking-wider text-[10px]">Model Used</th>
                          <th className="px-6 py-3 font-bold text-slate-500 dark:text-gray-400 uppercase tracking-wider text-[10px]">Tokens</th>
                          <th className="px-6 py-3 font-bold text-slate-500 dark:text-gray-400 uppercase tracking-wider text-[10px] text-right">Status</th>
                        </tr>
                      </thead>
                      <tbody>
                        {logs.map((log) => (
                          <tr key={log.id} className="border-b border-slate-100 dark:border-white/[0.02] hover:bg-slate-50/50 dark:hover:bg-white/[0.01] transition duration-200">
                            <td className="px-6 py-3.5 font-semibold text-slate-800 dark:text-[#e8e9f5] truncate max-w-[160px]" title={log.user_profiles?.email || "Anonymous"}>
                              {log.user_profiles?.email || <span className="italic text-slate-400 dark:text-gray-500">Anonymous</span>}
                            </td>
                            <td className="px-6 py-3.5 text-slate-500 dark:text-gray-400 text-xs font-mono">
                              {log.model_used.replace("openrouter/", "")}
                            </td>
                            <td className="px-6 py-3.5 text-slate-700 dark:text-gray-300 font-mono">{log.tokens_estimated.toLocaleString()}</td>
                            <td className="px-6 py-3.5 text-right">
                              <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider ${
                                log.success
                                  ? "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400"
                                  : "bg-rose-500/10 text-rose-600 dark:text-rose-400"
                              }`}>
                                {log.success ? "SUCCESS" : "FAILED"}
                              </span>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>

                {/* Model count distributions */}
                <div className="p-6 rounded-2xl bg-white/80 dark:bg-slate-950/40 dark:bg-gradient-to-br dark:from-white/[0.05] dark:to-white/[0.01] border border-slate-200/60 dark:border-white/5 shadow-sm space-y-6 hover:-translate-y-1 hover:shadow-md transition-all duration-300">
                  <div>
                    <h3 className="text-base font-bold text-slate-900 dark:text-white mb-1">Model Traffic</h3>
                    <p className="text-[11px] text-slate-500 dark:text-gray-400">Gemini vs. Llama failover loads</p>
                  </div>
                  <div className="space-y-4">
                    {Object.entries(stats.modelCounts).map(([model, count]) => {
                      const percent = stats.totalRequests > 0 ? Math.round((count / stats.totalRequests) * 100) : 0;
                      return (
                        <div key={model} className="space-y-1">
                          <div className="flex justify-between text-xs">
                            <span className="font-semibold text-slate-800 dark:text-[#e8e9f5] truncate max-w-[150px]">{model.replace("openrouter/", "")}</span>
                            <span className="text-slate-500 dark:text-gray-400">{count} runs ({percent}%)</span>
                          </div>
                          <div className="h-1.5 bg-slate-200 dark:bg-white/5 rounded-full overflow-hidden">
                            <div className="h-full bg-indigo-600 dark:bg-indigo-400 rounded-full" style={{ width: `${percent}%` }} />
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>

              </div>

            </div>
          )}
    </div>
  );
}
