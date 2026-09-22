"use client";

import { useEffect, useState, useMemo } from "react";
import { 
  Bot, 
  Zap, 
  CheckCircle2, 
  AlertCircle, 
  BarChart3, 
  Clock,
  Sparkles,
  RefreshCw,
  Search,
  X,
  Filter,
  Cpu,
  Layers,
  Activity,
  Check,
  ShieldCheck,
  Flame,
  User,
  ArrowUpRight
} from "lucide-react";

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

const AIUsageSkeleton = () => (
  <div className="space-y-8 animate-pulse">
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
      {[1, 2, 3, 4].map((i) => (
        <div key={i} className="h-36 rounded-2xl bg-[var(--bg-elevated)] border border-[var(--border)]" />
      ))}
    </div>
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      <div className="lg:col-span-2 h-[420px] rounded-2xl bg-[var(--bg-elevated)] border border-[var(--border)]" />
      <div className="h-[420px] rounded-2xl bg-[var(--bg-elevated)] border border-[var(--border)]" />
    </div>
  </div>
);

export default function AdminAIUsagePage() {
  const [logs, setLogs] = useState<RequestLog[]>([]);
  const [stats, setStats] = useState<AIStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState("");
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [lastUpdated, setLastUpdated] = useState<string>("Just now");

  // Filter & Search states
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedModel, setSelectedModel] = useState("All");
  const [statusFilter, setStatusFilter] = useState<"all" | "success" | "failed">("all");

  const fetchAIUsage = async () => {
    setIsRefreshing(true);
    setErrorMsg("");
    try {
      const res = await fetch("/api/admin/ai-usage");
      if (!res.ok) {
        throw new Error("Failed to load AI request telemetry.");
      }
      const data = await res.json();
      if (data.success) {
        setLogs(data.logs || []);
        setStats(data.stats || null);
        setLastUpdated(new Date().toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit" }));
      } else {
        throw new Error(data.error || "Failed to load usage statistics.");
      }
    } catch (err: any) {
      setErrorMsg(err.message || "An unexpected error occurred.");
    } finally {
      setLoading(false);
      setIsRefreshing(false);
    }
  };

  useEffect(() => {
    fetchAIUsage();
  }, []);

  // Filtered logs
  const filteredLogs = useMemo(() => {
    return logs.filter((log) => {
      const userEmail = log.user_profiles?.email || "Anonymous";
      const modelName = log.model_used.replace("openrouter/", "").toLowerCase();
      
      const matchesSearch =
        searchQuery.trim() === "" ||
        userEmail.toLowerCase().includes(searchQuery.toLowerCase()) ||
        modelName.includes(searchQuery.toLowerCase()) ||
        log.id.toLowerCase().includes(searchQuery.toLowerCase());

      const matchesModel =
        selectedModel === "All" || log.model_used.replace("openrouter/", "") === selectedModel;

      const matchesStatus =
        statusFilter === "all" ||
        (statusFilter === "success" && log.success) ||
        (statusFilter === "failed" && !log.success);

      return matchesSearch && matchesModel && matchesStatus;
    });
  }, [logs, searchQuery, selectedModel, statusFilter]);

  // Model list for filtering
  const availableModels = useMemo(() => {
    if (!stats?.modelCounts) return [];
    return Object.keys(stats.modelCounts).map(m => m.replace("openrouter/", ""));
  }, [stats]);

  // Most active model
  const topModel = useMemo(() => {
    if (!stats?.modelCounts) return "N/A";
    let max = 0;
    let name = "None";
    for (const [m, count] of Object.entries(stats.modelCounts)) {
      if (count > max) {
        max = count;
        name = m.replace("openrouter/", "");
      }
    }
    return name;
  }, [stats]);

  return (
    <div className="space-y-8 font-sans">
      
      {/* ── EXECUTIVE HEADER ── */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 pb-6 border-b border-[var(--border)]">
        <div className="space-y-2">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-purple-500/10 border border-purple-500/25 text-purple-600 dark:text-purple-400 text-xs font-bold uppercase tracking-wider">
            <Sparkles size={12} className="text-purple-500" />
            <span>UPROLE PLATFORM COMMAND · AI TOKEN ENGINE & TELEMETRY</span>
          </div>

          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#101B3B] to-[#7C3AED] flex items-center justify-center text-white shadow-md border border-white/10 shrink-0">
              <Zap size={22} className="text-amber-400" />
            </div>
            <h1 className="text-2xl md:text-3xl font-extrabold tracking-tight text-[var(--text-primary)] font-['Syne',sans-serif]">
              AI Model Usage & Token Telemetry
            </h1>
          </div>

          <p className="text-sm text-[var(--text-muted)] max-w-2xl leading-relaxed">
            Monitor multi-model LLM failover routing, token burn velocity, API invocation reliability, and execution logs in real time.
          </p>
        </div>

        {/* Action Controls */}
        <div className="flex items-center gap-3 self-start md:self-center shrink-0">
          <button
            onClick={fetchAIUsage}
            disabled={isRefreshing}
            className="px-3.5 py-2 rounded-xl bg-[var(--bg-elevated)] border border-[var(--border)] text-xs font-bold text-[var(--text-primary)] hover:border-purple-500/40 hover:bg-purple-500/10 transition-all flex items-center gap-2 cursor-pointer shadow-xs"
          >
            <RefreshCw
              size={13}
              className={isRefreshing ? "animate-spin text-purple-500" : "text-[var(--text-muted)]"}
            />
            <span>Refresh Telemetry</span>
            <span className="text-[10px] font-normal text-[var(--text-muted)] hidden sm:inline">({lastUpdated})</span>
          </button>
        </div>
      </div>

      {errorMsg && (
        <div className="p-4 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-500 text-sm font-semibold flex items-center gap-2">
          <span>⚠️</span>
          <span>{errorMsg}</span>
        </div>
      )}

      {loading ? (
        <AIUsageSkeleton />
      ) : !stats || stats.totalRequests === 0 ? (
        <div className="p-16 text-center rounded-2xl bg-[var(--bg-elevated)] border border-[var(--border)] text-[var(--text-muted)] shadow-sm space-y-3">
          <div className="w-14 h-14 rounded-2xl bg-purple-500/10 text-purple-500 flex items-center justify-center mx-auto mb-2">
            <Bot size={28} />
          </div>
          <h3 className="text-lg font-bold text-[var(--text-primary)]">No AI Invocations Logged Yet</h3>
          <p className="text-sm max-w-md mx-auto">
            Execution logs will be recorded as users trigger resume diagnostics, STAR bullet optimization, and career discovery queries.
          </p>
        </div>
      ) : (
        <div className="space-y-8">
          
          {/* ── 4 EXECUTIVE AI STAT CARDS ── */}
          <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
            
            {/* Card 1: Total Invocations */}
            <div className="relative group rounded-2xl bg-[var(--bg-elevated)] border border-[var(--border)] p-5 md:p-6 shadow-sm hover:shadow-lg hover:-translate-y-1 transition-all duration-200 overflow-hidden backdrop-blur-xl flex flex-col justify-between">
              <div className="absolute top-0 left-0 right-0 h-[3px] bg-[#7C3AED]" />
              <div>
                <div className="flex items-center justify-between mb-3">
                  <div className="w-10 h-10 rounded-xl bg-purple-500/10 text-purple-500 flex items-center justify-center border border-purple-500/20">
                    <Bot size={20} />
                  </div>
                  <span className="text-[11px] font-extrabold uppercase tracking-wider text-[var(--text-muted)]">
                    Invocations
                  </span>
                </div>
                <div className="text-3xl md:text-4xl font-black text-[var(--text-primary)] tracking-tight font-['Syne',sans-serif]">
                  {stats.totalRequests.toLocaleString()}
                </div>
              </div>
              <div className="flex items-center justify-between pt-3 border-t border-[var(--border)] mt-4 text-xs font-semibold">
                <span className="text-purple-600 dark:text-purple-400">Total API calls</span>
                <span className="text-[11px] text-[var(--text-muted)]">Multi-model pool</span>
              </div>
            </div>

            {/* Card 2: Routing Reliability */}
            <div className="relative group rounded-2xl bg-[var(--bg-elevated)] border border-[var(--border)] p-5 md:p-6 shadow-sm hover:shadow-lg hover:-translate-y-1 transition-all duration-200 overflow-hidden backdrop-blur-xl flex flex-col justify-between">
              <div className="absolute top-0 left-0 right-0 h-[3px] bg-[#10B981]" />
              <div>
                <div className="flex items-center justify-between mb-3">
                  <div className="w-10 h-10 rounded-xl bg-emerald-500/10 text-emerald-500 flex items-center justify-center border border-emerald-500/20">
                    <CheckCircle2 size={20} />
                  </div>
                  <span className="text-[11px] font-extrabold uppercase tracking-wider text-[var(--text-muted)]">
                    Reliability
                  </span>
                </div>
                <div className="text-3xl md:text-4xl font-black text-emerald-500 tracking-tight font-['Syne',sans-serif]">
                  {stats.successRate}%
                </div>
              </div>
              <div className="flex items-center justify-between pt-3 border-t border-[var(--border)] mt-4 text-xs font-semibold">
                <span className="text-emerald-600 dark:text-emerald-400">{stats.successCount} Successful</span>
                <span className="text-[11px] text-rose-500">{stats.failCount} Failovers</span>
              </div>
            </div>

            {/* Card 3: Est. Token Burn */}
            <div className="relative group rounded-2xl bg-[var(--bg-elevated)] border border-[var(--border)] p-5 md:p-6 shadow-sm hover:shadow-lg hover:-translate-y-1 transition-all duration-200 overflow-hidden backdrop-blur-xl flex flex-col justify-between">
              <div className="absolute top-0 left-0 right-0 h-[3px] bg-[#2563EB]" />
              <div>
                <div className="flex items-center justify-between mb-3">
                  <div className="w-10 h-10 rounded-xl bg-blue-500/10 text-blue-500 flex items-center justify-center border border-blue-500/20">
                    <Flame size={20} />
                  </div>
                  <span className="text-[11px] font-extrabold uppercase tracking-wider text-[var(--text-muted)]">
                    Estimated Tokens
                  </span>
                </div>
                <div className="text-3xl md:text-4xl font-black text-blue-500 tracking-tight font-['Syne',sans-serif]">
                  {stats.totalTokens.toLocaleString()}
                </div>
              </div>
              <div className="flex items-center justify-between pt-3 border-t border-[var(--border)] mt-4 text-xs font-semibold">
                <span className="text-blue-600 dark:text-blue-400">Total consumption</span>
                <span className="text-[11px] text-[var(--text-muted)]">In + Out tokens</span>
              </div>
            </div>

            {/* Card 4: Dominant Engine */}
            <div className="relative group rounded-2xl bg-[var(--bg-elevated)] border border-[var(--border)] p-5 md:p-6 shadow-sm hover:shadow-lg hover:-translate-y-1 transition-all duration-200 overflow-hidden backdrop-blur-xl flex flex-col justify-between">
              <div className="absolute top-0 left-0 right-0 h-[3px] bg-[#F59E0B]" />
              <div>
                <div className="flex items-center justify-between mb-3">
                  <div className="w-10 h-10 rounded-xl bg-amber-500/10 text-amber-500 flex items-center justify-center border border-amber-500/20">
                    <Cpu size={20} />
                  </div>
                  <span className="text-[11px] font-extrabold uppercase tracking-wider text-[var(--text-muted)]">
                    Primary Engine
                  </span>
                </div>
                <div className="text-xl md:text-2xl font-black text-[var(--text-primary)] truncate tracking-tight font-['Syne',sans-serif]" title={topModel}>
                  {topModel}
                </div>
              </div>
              <div className="flex items-center justify-between pt-3 border-t border-[var(--border)] mt-4 text-xs font-semibold">
                <span className="text-amber-600 dark:text-amber-400">Default Router</span>
                <span className="text-[11px] text-[var(--text-muted)]">OpenRouter & Gemini</span>
              </div>
            </div>

          </section>

          {/* ── SEARCH & FILTER CONTROLS ── */}
          <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-4">
            {/* Search Input */}
            <div className="relative flex-1 max-w-md">
              <Search
                size={15}
                className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[var(--text-muted)] pointer-events-none"
              />
              <input
                type="text"
                placeholder="Search user email or model name..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-8 py-2 rounded-xl bg-[var(--bg-elevated)] border border-[var(--border)] text-sm text-[var(--text-primary)] placeholder-[var(--text-muted)] focus:outline-none focus:border-purple-500/50 transition-all shadow-xs"
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery("")}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-[var(--text-muted)] hover:text-[var(--text-primary)] text-xs"
                >
                  <X size={14} />
                </button>
              )}
            </div>

            {/* Filter Pills */}
            <div className="flex items-center gap-2 overflow-x-auto pb-1 [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden">
              <span className="text-xs font-semibold text-[var(--text-muted)] flex items-center gap-1 mr-1 shrink-0">
                <Filter size={12} /> Status:
              </span>
              {[
                { key: "all", label: "All Logs" },
                { key: "success", label: "Success" },
                { key: "failed", label: "Failures" },
              ].map((tab) => {
                const active = statusFilter === tab.key;
                return (
                  <button
                    key={tab.key}
                    onClick={() => setStatusFilter(tab.key as any)}
                    className={`px-3 py-1 rounded-lg text-xs font-semibold shrink-0 transition-all cursor-pointer ${
                      active
                        ? "bg-purple-500/15 text-purple-600 dark:text-purple-400 border border-purple-500/30"
                        : "bg-[var(--bg-elevated)] text-[var(--text-muted)] hover:text-[var(--text-primary)] border border-[var(--border)]"
                    }`}
                  >
                    {tab.label}
                  </button>
                );
              })}

              {availableModels.length > 0 && (
                <select
                  value={selectedModel}
                  onChange={(e) => setSelectedModel(e.target.value)}
                  className="px-2.5 py-1 rounded-lg text-xs font-semibold bg-[var(--bg-elevated)] text-[var(--text-secondary)] border border-[var(--border)] focus:outline-none shrink-0"
                >
                  <option value="All">All Models ({availableModels.length})</option>
                  {availableModels.map(m => (
                    <option key={m} value={m}>{m}</option>
                  ))}
                </select>
              )}
            </div>
          </div>

          {/* ── SPLIT LAYOUT: LOG TABLE (2/3) + MODEL TRAFFIC (1/3) ── */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
            
            {/* Left: Execution Logs Table */}
            <div className="lg:col-span-2 rounded-2xl bg-[var(--bg-elevated)] border border-[var(--border)] shadow-sm backdrop-blur-xl overflow-hidden">
              <div className="px-5 py-4 border-b border-[var(--border)] bg-[var(--bg-page)]/60 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Activity size={16} className="text-purple-500" />
                  <h3 className="font-extrabold text-sm text-[var(--text-primary)] font-['Syne',sans-serif]">
                    Live Execution Telemetry
                  </h3>
                </div>
                <span className="text-[11px] font-bold px-2 py-0.5 rounded-md bg-[var(--bg-elevated)] text-[var(--text-muted)] border border-[var(--border)]">
                  {filteredLogs.length} Records
                </span>
              </div>

              {filteredLogs.length === 0 ? (
                <div className="p-12 text-center text-xs text-[var(--text-muted)] space-y-2">
                  <p>No execution logs match your active filters.</p>
                  <button
                    onClick={() => {
                      setSearchQuery("");
                      setSelectedModel("All");
                      setStatusFilter("all");
                    }}
                    className="text-xs font-bold text-purple-500 hover:underline"
                  >
                    Clear Filter Criteria
                  </button>
                </div>
              ) : (
                <div className="overflow-x-auto max-h-[500px] overflow-y-auto">
                  <table className="w-full border-collapse text-left text-xs">
                    <thead className="sticky top-0 bg-[var(--bg-elevated)] border-b border-[var(--border)] text-[10px] font-extrabold uppercase tracking-wider text-[var(--text-muted)] z-10">
                      <tr>
                        <th className="px-5 py-3">Invoker</th>
                        <th className="px-5 py-3">Model Routing</th>
                        <th className="px-5 py-3">Token Cost</th>
                        <th className="px-5 py-3 text-right">Status</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-[var(--border)]">
                      {filteredLogs.map((log) => {
                        const email = log.user_profiles?.email;
                        const modelClean = log.model_used.replace("openrouter/", "");
                        return (
                          <tr
                            key={log.id}
                            className="hover:bg-[var(--bg-page)]/40 transition-colors duration-150"
                          >
                            <td className="px-5 py-3.5">
                              <div className="flex items-center gap-2 max-w-[200px]">
                                <div className="w-6 h-6 rounded-md bg-[var(--bg-page)] border border-[var(--border)] flex items-center justify-center text-[10px] font-bold text-[var(--text-muted)] shrink-0">
                                  {email ? email.charAt(0).toUpperCase() : "?"}
                                </div>
                                <div className="truncate">
                                  <div className="font-bold text-[var(--text-primary)] truncate" title={email || "Anonymous Session"}>
                                    {email || <span className="italic text-[var(--text-muted)]">Anonymous</span>}
                                  </div>
                                  <div className="text-[10px] text-[var(--text-muted)] flex items-center gap-1">
                                    <Clock size={10} />
                                    {new Date(log.created_at).toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit" })}
                                  </div>
                                </div>
                              </div>
                            </td>

                            <td className="px-5 py-3.5">
                              <span className="font-mono text-xs px-2 py-0.5 rounded bg-[var(--bg-page)] border border-[var(--border)] text-[var(--text-secondary)]">
                                {modelClean}
                              </span>
                            </td>

                            <td className="px-5 py-3.5 font-mono text-xs font-bold text-[var(--text-primary)]">
                              {log.tokens_estimated.toLocaleString()} <span className="text-[10px] font-normal text-[var(--text-muted)]">tok</span>
                            </td>

                            <td className="px-5 py-3.5 text-right">
                              <span
                                className={`inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-extrabold uppercase tracking-wider border ${
                                  log.success
                                    ? "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20"
                                    : "bg-rose-500/10 text-rose-600 dark:text-rose-400 border-rose-500/20"
                                }`}
                              >
                                {log.success ? "✓ SUCCESS" : "✕ FAILED"}
                              </span>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              )}
            </div>

            {/* Right: Model Distribution Breakdown */}
            <div className="space-y-5">
              <div className="p-5 rounded-2xl bg-[var(--bg-elevated)] border border-[var(--border)] shadow-sm backdrop-blur-xl space-y-4">
                <div>
                  <h3 className="text-xs font-extrabold text-[var(--text-primary)] flex items-center gap-1.5 uppercase tracking-wider">
                    <Cpu size={14} className="text-purple-500" />
                    Model Load Distribution
                  </h3>
                  <p className="text-[11px] text-[var(--text-muted)] mt-0.5">Share of total platform requests</p>
                </div>

                <div className="space-y-3.5">
                  {Object.entries(stats.modelCounts).map(([model, count], idx) => {
                    const percent = stats.totalRequests > 0 ? Math.round((count / stats.totalRequests) * 100) : 0;
                    const cleanName = model.replace("openrouter/", "");
                    const colors = [
                      "from-[#7C3AED] to-[#2563EB]",
                      "from-[#2563EB] to-[#14B8A6]",
                      "from-[#F59E0B] to-[#EA580C]",
                      "from-[#10B981] to-[#14B8A6]"
                    ];
                    const grad = colors[idx % colors.length];

                    return (
                      <div key={model} className="space-y-1.5">
                        <div className="flex justify-between text-xs font-semibold">
                          <span className="text-[var(--text-primary)] truncate max-w-[170px]" title={cleanName}>
                            {cleanName}
                          </span>
                          <span className="text-[var(--text-muted)] text-[11px] font-mono">
                            {count} ({percent}%)
                          </span>
                        </div>
                        <div className="h-1.5 bg-[var(--bg-page)] rounded-full overflow-hidden border border-[var(--border)]">
                          <div
                            className={`h-full bg-gradient-to-r ${grad} rounded-full transition-all duration-500`}
                            style={{ width: `${percent}%` }}
                          />
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Infrastructure Telemetry Card */}
              <div className="p-5 rounded-2xl bg-[var(--bg-elevated)] border border-[var(--border)] shadow-sm backdrop-blur-xl space-y-3 text-xs">
                <div className="text-xs font-extrabold text-[var(--text-primary)] uppercase tracking-wider flex items-center gap-1.5">
                  <ShieldCheck size={14} className="text-emerald-500" />
                  <span>Router Architecture</span>
                </div>
                <div className="space-y-2 text-[var(--text-muted)] leading-relaxed text-[11px]">
                  <div className="flex items-center justify-between py-1 border-b border-[var(--border)]">
                    <span>Primary Provider</span>
                    <strong className="text-[var(--text-primary)]">OpenRouter High-Throughput</strong>
                  </div>
                  <div className="flex items-center justify-between py-1 border-b border-[var(--border)]">
                    <span>Failover Strategy</span>
                    <strong className="text-emerald-500">Tiered Auto-Fallback</strong>
                  </div>
                  <div className="flex items-center justify-between py-1">
                    <span>Average Token Latency</span>
                    <strong className="text-[var(--text-primary)]">~420 ms / completion</strong>
                  </div>
                </div>
              </div>

            </div>

          </div>

        </div>
      )}

    </div>
  );
}
