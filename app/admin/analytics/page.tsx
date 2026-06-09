"use client";
import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import Navbar from "@/components/Navbar";
import { useAuth } from "@/hooks/useAuth";

interface ActivityItem {
  id: string;
  name: string;
  atsScore: number | null;
  template: string;
  date: string;
}

interface AnalyticsData {
  totalResumes: number;
  averageATS: number;
  scoredResumesCount: number;
  templateDistribution: Record<string, number>;
  recentActivity: ActivityItem[];
}

export default function AdminAnalyticsPage() {
  const { user, loading: authLoading } = useAuth();
  const router = useRouter();

  const [stats, setStats] = useState<AnalyticsData | null>(null);
  const [loadingStats, setLoadingStats] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!authLoading && !user) {
      router.push("/login");
    }
  }, [authLoading, user, router]);

  useEffect(() => {
    if (authLoading || !user) return;

    setLoadingStats(true);
    setError("");

    fetch("/api/admin/stats")
      .then((res) => {
        if (!res.ok) {
          throw new Error("Failed to load analytics data.");
        }
        return res.json();
      })
      .then((data) => {
        if (data.success && data.analytics) {
          setStats(data.analytics);
        } else {
          setError(data.error || "Analytics retrieval failed.");
        }
        setLoadingStats(false);
      })
      .catch((err) => {
        console.error(err);
        setError("Error loading system metrics. Please verify connection.");
        setLoadingStats(false);
      });
  }, [authLoading, user]);

  const getScoreColor = (score: number) => {
    if (score >= 70) return "#43e97b";
    if (score >= 45) return "#f6d365";
    return "#ff6584";
  };

  const getTemplateColor = (tpl: string) => {
    const colors: Record<string, string> = {
      modern: "#6c63ff",
      professional: "#2563eb",
      creative: "#ff6584",
      executive: "#d97706",
    };
    return colors[tpl] || "var(--accent)";
  };

  if (authLoading || !user) {
    return (
      <div style={{ minHeight: "100vh", background: "var(--bg)", display: "flex", alignItems: "center", justifyContent: "center" }}>
        <div className="spinner" style={{ width: 40, height: 40 }} />
      </div>
    );
  }

  return (
    <div style={{ minHeight: "100vh", background: "var(--bg)" }}>
      <Navbar />
      <div style={{ maxWidth: "1000px", margin: "0 auto", padding: "2.5rem 1.5rem" }}>
        
        {/* Back navigation */}
        <Link href="/dashboard" style={{ textDecoration: "none", color: "var(--text-muted)", fontSize: "0.88rem", display: "inline-flex", alignItems: "center", gap: "0.4rem", marginBottom: "1.5rem" }}>
          ← Back to Dashboard
        </Link>

        {/* Title */}
        <div style={{ marginBottom: "2rem" }}>
          <p className="section-label" style={{ marginBottom: "0.5rem" }}>System Performance Monitor</p>
          <h1 style={{ fontFamily: "Syne, sans-serif", fontSize: "2.2rem", fontWeight: 800 }}>
            📈 Portfolio Analytics
          </h1>
          <p style={{ color: "var(--text-muted)", fontSize: "0.9rem", marginTop: "0.25rem" }}>
            Comprehensive overview of your resume templates, ATS average scores, and creation timelines.
          </p>
        </div>

        {error && (
          <div style={{ color: "#ff6584", fontSize: "0.88rem", padding: "0.9rem 1.2rem", background: "rgba(255,101,132,0.08)", borderRadius: "10px", borderLeft: "4px solid #ff6584", marginBottom: "2rem" }}>
            {error}
          </div>
        )}

        {loadingStats ? (
          <div style={{ textAlign: "center", padding: "6rem 2rem", background: "var(--card)", borderRadius: "16px", border: "1px solid var(--border)" }}>
            <div className="spinner" style={{ margin: "0 auto 1rem", width: 32, height: 32 }} />
            <p style={{ color: "var(--text-muted)" }}>Compiling system telemetry metrics...</p>
          </div>
        ) : stats ? (
          <div style={{ display: "grid", gap: "1.8rem" }}>
            
            {/* Global Aggregates Cards Row */}
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1.2rem", flexWrap: "wrap" }}>
              <div className="card" style={{ display: "flex", alignItems: "center", gap: "1.2rem", padding: "2rem" }}>
                <div style={{ width: 50, height: 50, borderRadius: 12, background: "rgba(108,99,255,0.15)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "1.5rem", color: "var(--accent)" }}>
                  📄
                </div>
                <div>
                  <div style={{ fontSize: "2.2rem", fontWeight: 800, fontFamily: "Syne, sans-serif" }}>
                    {stats.totalResumes}
                  </div>
                  <div style={{ color: "var(--text-muted)", fontSize: "0.82rem", fontWeight: 600, textTransform: "uppercase" }}>Total Resumes Saved</div>
                </div>
              </div>

              <div className="card" style={{ display: "flex", alignItems: "center", gap: "1.2rem", padding: "2rem" }}>
                <div style={{ width: 50, height: 50, borderRadius: 12, background: "rgba(67,233,123,0.15)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "1.5rem", color: "#43e97b" }}>
                  📈
                </div>
                <div>
                  <div style={{ fontSize: "2.2rem", fontWeight: 800, fontFamily: "Syne, sans-serif", color: getScoreColor(stats.averageATS) }}>
                    {stats.averageATS}/100
                  </div>
                  <div style={{ color: "var(--text-muted)", fontSize: "0.82rem", fontWeight: 600, textTransform: "uppercase" }}>Average ATS Compatibility</div>
                </div>
              </div>
            </div>

            {/* Split Breakdown sections */}
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(320px, 1fr))", gap: "1.5rem" }}>
              
              {/* Template Style Distributions */}
              <div className="card" style={{ display: "flex", flexDirection: "column" }}>
                <p className="section-label" style={{ marginBottom: "1.2rem" }}>Template Design Distribution</p>
                <div style={{ display: "grid", gap: "1.2rem", flex: 1, justifyContent: "center", alignContent: "center" }}>
                  {["modern", "professional", "creative", "executive"].map((tpl) => {
                    const count = stats.templateDistribution[tpl] || 0;
                    const percent = stats.totalResumes > 0 ? Math.round((count / stats.totalResumes) * 100) : 0;
                    const col = getTemplateColor(tpl);
                    return (
                      <div key={tpl} style={{ width: "280px" }}>
                        <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "0.3rem", fontSize: "0.88rem" }}>
                          <span style={{ textTransform: "capitalize", fontWeight: 600, color: "var(--text)" }}>{tpl} Style</span>
                          <span style={{ color: "var(--text-muted)" }}>{count} saved ({percent}%)</span>
                        </div>
                        <div style={{ height: 8, background: "var(--bg-3)", borderRadius: 4, overflow: "hidden", border: "1px solid var(--border)" }}>
                          <div style={{ height: "100%", width: `${percent}%`, background: col, borderRadius: 4 }} />
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Recent Activity Logs */}
              <div className="card">
                <p className="section-label" style={{ marginBottom: "1.2rem" }}>Recent Optimizations Activity</p>
                {stats.recentActivity.length === 0 ? (
                  <div style={{ textAlign: "center", padding: "2rem", color: "var(--text-muted)", fontSize: "0.88rem" }}>
                    No recent optimization activity recorded.
                  </div>
                ) : (
                  <div style={{ display: "grid", gap: "1rem" }}>
                    {stats.recentActivity.map((activity, idx) => (
                      <div key={activity.id} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", paddingBottom: "0.8rem", borderBottom: idx < stats.recentActivity.length - 1 ? "1px solid var(--border)" : "none" }}>
                        <div>
                          <strong style={{ fontSize: "0.88rem", display: "block", color: "var(--text)" }}>{activity.name}</strong>
                          <span style={{ fontSize: "0.78rem", color: "var(--text-muted)" }}>
                            Edited {new Date(activity.date).toLocaleDateString("en-US", { month: "short", day: "numeric" })} at {new Date(activity.date).toLocaleTimeString("en-US", { hour: "numeric", minute: "2-digit" })}
                          </span>
                        </div>
                        <div style={{ display: "flex", gap: "0.8rem", alignItems: "center" }}>
                          <span className="tag" style={{ background: "var(--bg-3)", color: getTemplateColor(activity.template), fontSize: "0.72rem", border: "1px solid var(--border)", textTransform: "capitalize" }}>
                            {activity.template}
                          </span>
                          {activity.atsScore !== null && (
                            <span style={{ fontSize: "0.85rem", fontWeight: 700, color: getScoreColor(activity.atsScore) }}>
                              {activity.atsScore}/100
                            </span>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

            </div>

          </div>
        ) : null}

      </div>
    </div>
  );
}
