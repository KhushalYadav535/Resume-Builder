"use client";
import { useEffect, useState } from "react";
import Link from "next/link";
import Navbar from "@/components/Navbar";
import { Card } from "@/components/ui/Card";
import ParticleBackground from "@/components/ui/ParticleBackground";
import { ShieldCheck, FileText, TrendingUp, User, BarChart2, Users, Bot, Brain } from "lucide-react";

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

export default function AdminDashboardPage() {
  const [stats, setStats] = useState<AnalyticsStats | null>(null);
  const [loadingData, setLoadingData] = useState(true);
  const [errorMsg, setErrorMsg] = useState("");

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

  useEffect(() => {
    fetchStats();
  }, []);

  const getScoreColor = (score: number) => {
    if (score >= 70) return "#43e97b";
    if (score >= 45) return "#f6d365";
    return "#ff6584";
  };

  const getTemplateColor = (tpl: string) => {
    const colors: Record<string, string> = {
      modern: "#6c63ff",
      professional: "#2563eb",
      executive: "#d97706",
      minimal: "#71717a",
      creative: "#ec4899",
    };
    return colors[tpl] || "var(--accent)";
  };

  // Render a responsive SVG bar chart
  const renderSVGChart = (data: { date: string; count: number }[], label: string, color: string) => {
    if (!data || data.length === 0) {
      return (
        <div style={{ textAlign: "center", padding: "2rem", color: "var(--text-muted)", fontSize: "0.82rem" }}>
          Insufficient history data for tracking.
        </div>
      );
    }

    const chartHeight = 120;
    const chartWidth = 340;
    const maxCount = Math.max(...data.map((d) => d.count), 5); // Fallback to 5 to avoid div-by-zero
    const paddingLeft = 30;
    const paddingBottom = 20;
    const graphHeight = chartHeight - paddingBottom;
    const graphWidth = chartWidth - paddingLeft;
    const barWidth = Math.min(25, (graphWidth / data.length) * 0.6);
    const stepX = graphWidth / data.length;

    return (
      <svg width="100%" height={chartHeight} viewBox={`0 0 ${chartWidth} ${chartHeight}`} style={{ overflow: "visible" }}>
        {/* Grid lines */}
        <line x1={paddingLeft} y1={0} x2={chartWidth} y2={0} stroke="var(--border)" strokeWidth={1} strokeDasharray="3 3" />
        <line x1={paddingLeft} y1={graphHeight / 2} x2={chartWidth} y2={graphHeight / 2} stroke="var(--border)" strokeWidth={1} strokeDasharray="3 3" />
        <line x1={paddingLeft} y1={graphHeight} x2={chartWidth} y2={graphHeight} stroke="var(--border)" strokeWidth={1} />
        
        {/* Y Axis label */}
        <text x={10} y={10} fill="var(--text-muted)" fontSize={9} textAnchor="start">{maxCount}</text>
        <text x={10} y={graphHeight} fill="var(--text-muted)" fontSize={9} textAnchor="start">0</text>

        {data.map((item, idx) => {
          const barHeight = (item.count / maxCount) * graphHeight;
          const x = paddingLeft + idx * stepX + (stepX - barWidth) / 2;
          const y = graphHeight - barHeight;

          return (
            <g key={idx}>
              <rect
                x={x}
                y={y}
                width={barWidth}
                height={barHeight}
                fill={color}
                opacity={0.85}
                rx={3}
              />
              <text
                x={x + barWidth / 2}
                y={chartHeight - 5}
                fill="var(--text-muted)"
                fontSize={8}
                textAnchor="middle"
              >
                {new Date(item.date).toLocaleDateString("en-IN", { day: "numeric", month: "short" })}
              </text>
              <text
                x={x + barWidth / 2}
                y={y - 5}
                fill="var(--text)"
                fontSize={8}
                fontWeight={700}
                textAnchor="middle"
              >
                {item.count}
              </text>
            </g>
          );
        })}
      </svg>
    );
  };

  return (
    <div className="min-h-screen bg-[var(--bg-page)] relative overflow-hidden">
      <ParticleBackground count={50} connectionDist={110} />
      <div style={{ position: 'relative', zIndex: 10 }}>
        <Navbar />
        <div style={{ maxWidth: "1100px", margin: "0 auto", padding: "2.5rem 1.5rem" }}>

        {/* Title */}
        <div style={{ marginBottom: "2rem" }}>
          <p className="section-label" style={{ marginBottom: "0.5rem" }}>System Performance Monitor</p>
          <h1 style={{ fontFamily: "Syne, sans-serif", fontSize: "2.2rem", fontWeight: 800, display: "inline-flex", alignItems: "center", gap: "0.5rem" }}>
            <ShieldCheck size={32} className="text-indigo-500" />
            Administrative Dashboard
          </h1>
          <p style={{ color: "var(--text-muted)", fontSize: "0.9rem", marginTop: "0.25rem" }}>
            Real-time platform statistics, user roles management, and OpenRouter API diagnostics.
          </p>
        </div>

        {/* Navigation Tabs */}
        <div style={{ display: "flex", gap: "0.5rem", borderBottom: "1px solid var(--border)", marginBottom: "2rem", overflowX: "auto", whiteSpace: "nowrap" }}>
          <Link href="/admin" style={{ textDecoration: "none" }}>
            <button style={{ padding: "0.6rem 1.2rem", background: "rgba(108,99,255,0.08)", border: "none", borderBottom: "2px solid var(--accent)", color: "var(--accent)", fontWeight: 700, fontSize: "0.85rem", cursor: "pointer", display: "inline-flex", alignItems: "center", gap: "0.4rem" }}>
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
        </div>

        {errorMsg && (
          <div style={{ color: "#ff6584", fontSize: "0.88rem", padding: "0.9rem 1.2rem", background: "rgba(255,101,132,0.08)", borderRadius: "10px", borderLeft: "4px solid #ff6584", marginBottom: "2rem" }}>
            {errorMsg}
          </div>
        )}

        {loadingData ? (
          <div style={{ textAlign: "center", padding: "6rem 2rem", background: "var(--card)", borderRadius: "16px", border: "1px solid var(--border)" }}>
            <div className="spinner" style={{ margin: "0 auto 1rem", width: 32, height: 32 }} />
            <p style={{ color: "var(--text-muted)", fontSize: "0.88rem" }}>Compiling platform metric indices...</p>
          </div>
        ) : stats ? (
          <div style={{ display: "grid", gap: "1.8rem" }}>
            
            {/* KPI Cards Grid */}
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))", gap: "1.2rem" }}>
              
              {/* Total Users */}
              <Card style={{ display: "flex", alignItems: "center", gap: "1.2rem" }}>
                <div style={{ width: 45, height: 45, borderRadius: 10, background: "rgba(108,99,255,0.12)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "1.3rem" }}>
                  👥
                </div>
                <div>
                  <div style={{ fontSize: "1.8rem", fontWeight: 800, fontFamily: "Syne, sans-serif" }}>
                    {stats.totalUsers}
                  </div>
                  <div style={{ color: "var(--text-muted)", fontSize: "0.75rem", fontWeight: 700, textTransform: "uppercase" }}>Total Registered Users</div>
                </div>
              </Card>

              {/* Total Resumes */}
              <Card style={{ display: "flex", alignItems: "center", gap: "1.2rem" }}>
                <div style={{ width: 45, height: 45, borderRadius: 10, background: "rgba(67,233,123,0.12)", display: "flex", alignItems: "center", justifyContent: "center", color: "#43e97b" }}>
                  <FileText size={20} />
                </div>
                <div>
                  <div style={{ fontSize: "1.8rem", fontWeight: 800, fontFamily: "Syne, sans-serif" }}>
                    {stats.totalResumes}
                  </div>
                  <div style={{ color: "var(--text-muted)", fontSize: "0.75rem", fontWeight: 700, textTransform: "uppercase" }}>Total Resumes Saved</div>
                </div>
              </Card>

              {/* AI Usage */}
              <Card style={{ display: "flex", alignItems: "center", gap: "1.2rem" }}>
                <div style={{ width: 45, height: 45, borderRadius: 10, background: "rgba(255,101,132,0.12)", display: "flex", alignItems: "center", justifyContent: "center", color: "#ff6584" }}>
                  <Sparkles size={20} />
                </div>
                <div>
                  <div style={{ fontSize: "1.8rem", fontWeight: 800, fontFamily: "Syne, sans-serif", color: "var(--accent-2)" }}>
                    {stats.aiAnalysesCount}
                  </div>
                  <div style={{ color: "var(--text-muted)", fontSize: "0.75rem", fontWeight: 700, textTransform: "uppercase" }}>
                    AI Runs ({stats.deepAnalysisCount} deep)
                  </div>
                </div>
              </Card>

              {/* Avg ATS */}
              <Card style={{ display: "flex", alignItems: "center", gap: "1.2rem" }}>
                <div style={{ width: 45, height: 45, borderRadius: 10, background: "rgba(246,211,101,0.12)", display: "flex", alignItems: "center", justifyContent: "center", color: "#f6d365" }}>
                  <TrendingUp size={20} />
                </div>
                <div>
                  <div style={{ fontSize: "1.8rem", fontWeight: 800, fontFamily: "Syne, sans-serif", color: getScoreColor(stats.averageATS) }}>
                    {stats.averageATS}%
                  </div>
                  <div style={{ color: "var(--text-muted)", fontSize: "0.75rem", fontWeight: 700, textTransform: "uppercase" }}>Average ATS Score</div>
                </div>
              </Card>

              {/* New Signups today */}
              <Card style={{ display: "flex", alignItems: "center", gap: "1.2rem" }}>
                <div style={{ width: 45, height: 45, borderRadius: 10, background: "rgba(67,233,123,0.12)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "1.3rem" }}>
                  🔥
                </div>
                <div>
                  <div style={{ fontSize: "1.8rem", fontWeight: 800, fontFamily: "Syne, sans-serif" }}>
                    {stats.uploadedToday}
                  </div>
                  <div style={{ color: "var(--text-muted)", fontSize: "0.75rem", fontWeight: 700, textTransform: "uppercase" }}>Resumes Created Today</div>
                </div>
              </Card>

              {/* Storage Used */}
              <Card style={{ display: "flex", alignItems: "center", gap: "1.2rem" }}>
                <div style={{ width: 45, height: 45, borderRadius: 10, background: "rgba(108,99,255,0.12)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "1.3rem" }}>
                  💾
                </div>
                <div>
                  <div style={{ fontSize: "1.8rem", fontWeight: 800, fontFamily: "Syne, sans-serif" }}>
                    {stats.storageUsed}
                  </div>
                  <div style={{ color: "var(--text-muted)", fontSize: "0.75rem", fontWeight: 700, textTransform: "uppercase" }}>Text Storage Utilized</div>
                </div>
              </Card>

            </div>

            {/* Split layout for trending charts */}
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(320px, 1fr))", gap: "1.5rem" }}>
              
              {/* Signups Chart */}
              <Card>
                <p className="section-label" style={{ marginBottom: "1rem", display: "inline-flex", alignItems: "center", gap: "0.4rem" }}>
                  <User size={14} className="text-emerald-500" />
                  User Signups Trend (Last 7 Days)
                </p>
                <div style={{ marginTop: "1rem", padding: "0.5rem" }}>
                  {renderSVGChart(stats.signupsHistory, "Signups", "#43e97b")}
                </div>
              </Card>

              {/* Uploads Chart */}
              <Card>
                <p className="section-label" style={{ marginBottom: "1rem", display: "inline-flex", alignItems: "center", gap: "0.4rem" }}>
                  <FileText size={14} className="text-purple-500" />
                  Resume Activity Trend (Last 7 Days)
                </p>
                <div style={{ marginTop: "1rem", padding: "0.5rem" }}>
                  {renderSVGChart(stats.uploadsHistory, "Uploads", "#6c63ff")}
                </div>
              </Card>

            </div>

            {/* Layout distribution panel */}
            <Card style={{ maxWidth: "600px" }}>
              <p className="section-label" style={{ marginBottom: "1.2rem" }}>Template Design Distribution</p>
              <div style={{ display: "grid", gap: "1rem" }}>
                {Object.entries(stats.templateDistribution).map(([tpl, count]) => {
                  const percent = stats.totalResumes > 0 ? Math.round((count / stats.totalResumes) * 100) : 0;
                  return (
                    <div key={tpl}>
                      <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "0.3rem", fontSize: "0.82rem" }}>
                        <span style={{ textTransform: "capitalize", fontWeight: 700 }}>{tpl} Template</span>
                        <span style={{ color: "var(--text-muted)" }}>{count} count ({percent}%)</span>
                      </div>
                      <div style={{ height: 6, background: "var(--bg-3)", borderRadius: 3, overflow: "hidden" }}>
                        <div style={{ height: "100%", width: `${percent}%`, background: getTemplateColor(tpl) }} />
                      </div>
                    </div>
                  );
                })}
              </div>
            </Card>

          </div>
        ) : (
          <Card style={{ textAlign: "center", padding: "3rem" }}>
            No platform statistics could be populated. Ensure data records exist in Supabase tables.
          </Card>
        )}

      </div>
      </div>
    </div>
  );
}
