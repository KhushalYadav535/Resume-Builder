"use client";
import { useEffect, useState } from "react";
import Link from "next/link";
import Navbar from "@/components/Navbar";
import { ShieldCheck, BarChart2, Users, Bot, Brain } from "lucide-react";

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
    <div style={{ minHeight: "100vh", background: "var(--bg)" }}>
      <Navbar />
      <div style={{ maxWidth: "1100px", margin: "0 auto", padding: "2.5rem 1.5rem" }}>

        {/* Title */}
        <div style={{ marginBottom: "2rem" }}>
          <p className="section-label" style={{ marginBottom: "0.5rem" }}>LLM Telemetry</p>
          <h1 style={{ fontFamily: "Syne, sans-serif", fontSize: "2.2rem", fontWeight: 800, display: "inline-flex", alignItems: "center", gap: "0.5rem" }}>
            <Bot size={32} className="text-indigo-500" />
            AI API Usage Tracker
          </h1>
          <p style={{ color: "var(--text-muted)", fontSize: "0.9rem", marginTop: "0.25rem" }}>
            Track token estimations, cascading failover success rates, and monitor API traffic for Gemini & OpenRouter.
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
            <button style={{ padding: "0.6rem 1.2rem", background: "rgba(108,99,255,0.08)", border: "none", borderBottom: "2px solid var(--accent)", color: "var(--accent)", fontWeight: 700, fontSize: "0.85rem", cursor: "pointer", display: "inline-flex", alignItems: "center", gap: "0.4rem" }}>
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
        </div>

        {errorMsg && (
          <div style={{ color: "#ff6584", fontSize: "0.88rem", padding: "0.9rem 1.2rem", background: "rgba(255,101,132,0.08)", borderRadius: "10px", borderLeft: "4px solid #ff6584", marginBottom: "2rem" }}>
            {errorMsg}
          </div>
        )}

        {loading ? (
          <div style={{ textAlign: "center", padding: "6rem 2rem", background: "var(--card)", borderRadius: "16px", border: "1px solid var(--border)" }}>
            <div className="spinner" style={{ margin: "0 auto 1rem", width: 32, height: 32 }} />
            <p style={{ color: "var(--text-muted)", fontSize: "0.88rem" }}>Compiling AI query performance reports...</p>
          </div>
        ) : !stats || stats.totalRequests === 0 ? (
          <div className="card" style={{ textAlign: "center", padding: "3rem" }}>
            No AI requests logged yet. Records will be generated as users run resume analysis and translations.
          </div>
        ) : (
          <div style={{ display: "grid", gap: "1.8rem" }}>
            
            {/* Stats Cards */}
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))", gap: "1.2rem" }}>
              <div className="card" style={{ textAlign: "center", padding: "1.5rem" }}>
                <p className="section-label" style={{ marginBottom: "0.3rem" }}>Total LLM Invocations</p>
                <div style={{ fontSize: "2.2rem", fontWeight: 800, fontFamily: "Syne, sans-serif" }}>
                  {stats.totalRequests}
                </div>
              </div>

              <div className="card" style={{ textAlign: "center", padding: "1.5rem" }}>
                <p className="section-label" style={{ marginBottom: "0.3rem" }}>Failover Success Rate</p>
                <div style={{ fontSize: "2.2rem", fontWeight: 800, fontFamily: "Syne, sans-serif", color: stats.successRate >= 90 ? "#43e97b" : stats.successRate >= 70 ? "#f6d365" : "#ff6584" }}>
                  {stats.successRate}%
                </div>
                <div style={{ fontSize: "0.74rem", color: "var(--text-muted)", marginTop: "0.2rem" }}>
                  {stats.successCount} OK / {stats.failCount} ERR
                </div>
              </div>

              <div className="card" style={{ textAlign: "center", padding: "1.5rem" }}>
                <p className="section-label" style={{ marginBottom: "0.3rem" }}>Est. Total Tokens</p>
                <div style={{ fontSize: "2.2rem", fontWeight: 800, fontFamily: "Syne, sans-serif", color: "var(--accent)" }}>
                  {stats.totalTokens.toLocaleString()}
                </div>
              </div>
            </div>

            {/* Split layout: Model breakdown + Log table */}
            <div className="detail-split-grid" style={{ alignItems: "start" }}>
              
              {/* Recent logs table */}
              <div className="card" style={{ padding: 0 }}>
                <div style={{ padding: "1rem 1.2rem", borderBottom: "1px solid var(--border)" }}>
                  <span style={{ fontWeight: 700, fontSize: "0.85rem", color: "var(--text)" }}>Recent Executions Logs</span>
                </div>
                <div style={{ overflowX: "auto" }}>
                  <table style={{ width: "100%", borderCollapse: "collapse", textAlign: "left", fontSize: "0.82rem" }}>
                    <thead>
                      <tr style={{ borderBottom: "1px solid var(--border)", background: "rgba(255,255,255,0.01)" }}>
                        <th style={{ padding: "0.8rem 1rem", fontWeight: 700, color: "var(--text-muted)" }}>User</th>
                        <th style={{ padding: "0.8rem 1rem", fontWeight: 700, color: "var(--text-muted)" }}>Model Used</th>
                        <th style={{ padding: "0.8rem 1rem", fontWeight: 700, color: "var(--text-muted)" }}>Tokens</th>
                        <th style={{ padding: "0.8rem 1rem", fontWeight: 700, color: "var(--text-muted)", textAlign: "right" }}>Status</th>
                      </tr>
                    </thead>
                    <tbody>
                      {logs.map((log) => (
                        <tr key={log.id} style={{ borderBottom: "1px solid rgba(255,255,255,0.03)" }}>
                          <td style={{ padding: "0.8rem 1rem", color: "var(--text)", textOverflow: "ellipsis", overflow: "hidden", maxWidth: "160px", whiteSpace: "nowrap" }} title={log.user_profiles?.email || "Anonymous"}>
                            {log.user_profiles?.email || <span style={{ fontStyle: "italic", color: "var(--text-dim)" }}>Anonymous</span>}
                          </td>
                          <td style={{ padding: "0.8rem 1rem", color: "var(--text-muted)", fontSize: "0.78rem" }}>
                            {log.model_used.replace("openrouter/", "")}
                          </td>
                          <td style={{ padding: "0.8rem 1rem" }}>{log.tokens_estimated}</td>
                          <td style={{ padding: "0.8rem 1rem", textAlign: "right" }}>
                            <span
                              style={{
                                display: "inline-block",
                                padding: "2px 8px",
                                borderRadius: "20px",
                                fontSize: "0.68rem",
                                fontWeight: 700,
                                background: log.success ? "rgba(67,233,123,0.12)" : "rgba(255,101,132,0.12)",
                                color: log.success ? "#43e97b" : "#ff6584",
                              }}
                            >
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
              <div className="card">
                <p className="section-label" style={{ marginBottom: "1.2rem" }}>Model Traffic Distribution</p>
                <div style={{ display: "grid", gap: "1rem" }}>
                  {Object.entries(stats.modelCounts).map(([model, count]) => {
                    const percent = stats.totalRequests > 0 ? Math.round((count / stats.totalRequests) * 100) : 0;
                    return (
                      <div key={model}>
                        <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "0.3rem", fontSize: "0.8rem" }}>
                          <strong style={{ color: "var(--text)", fontSize: "0.78rem" }}>{model.replace("openrouter/", "")}</strong>
                          <span style={{ color: "var(--text-muted)" }}>{count} runs ({percent}%)</span>
                        </div>
                        <div style={{ height: 6, background: "var(--bg-3)", borderRadius: 3, overflow: "hidden" }}>
                          <div style={{ height: "100%", width: `${percent}%`, background: "var(--accent)" }} />
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
    </div>
  );
}
