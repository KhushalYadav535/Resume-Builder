"use client";
import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import Navbar from "@/components/Navbar";
import { useAuth } from "@/hooks/useAuth";
import { Resume } from "@/types";
import { getSalaryBenchmark } from "@/lib/salaryData";

import { createClient } from "@/utils/supabase/client";

export default function Dashboard() {
  const { user, role, loading: authLoading, logout } = useAuth();
  const router = useRouter();
  const [resumes, setResumes] = useState<Resume[]>([]);
  const [fetchingResumes, setFetchingResumes] = useState(true);

  // Search & Sort states
  const [searchQuery, setSearchQuery] = useState("");
  const [sortBy, setSortBy] = useState<"newest" | "oldest" | "ats">("newest");
  const [deletingId, setDeletingId] = useState<string | null>(null);

  // Salary insights states
  const [insightRole, setInsightRole] = useState("Software Engineer");
  const [insightCity, setInsightCity] = useState("Hyderabad");
  const [insightYoE, setInsightYoE] = useState(2);

  useEffect(() => {
    if (!authLoading && !user) {
      router.push("/login");
      return;
    }

    if (user) {
      const checkOnboarding = async () => {
        try {
          const supabase = createClient();
          const { data, error } = await supabase
            .from("user_profiles")
            .select("has_completed_onboarding")
            .eq("id", user.id)
            .single();
          if (!error && data && data.has_completed_onboarding === false) {
            router.push("/onboarding");
          }
        } catch (err) {
          console.error("Onboarding check failed:", err);
        }
      };
      checkOnboarding();
    }
  }, [authLoading, user, router]);

  const fetchResumesList = () => {
    if (authLoading || !user) return;

    setFetchingResumes(true);
    fetch("/api/get-resumes")
      .then((r) => r.json())
      .then((data) => {
        setResumes(Array.isArray(data) ? data : []);
        setFetchingResumes(false);
      })
      .catch(() => setFetchingResumes(false));
  };

  useEffect(() => {
    fetchResumesList();
  }, [authLoading, user]);

  useEffect(() => {
    if (resumes.length > 0) {
      const firstResume = resumes[0];
      const role = firstResume.resume_data?.personalInfo?.fullName
        ? (firstResume.resume_data?.workExperience?.[0]?.role || "Software Engineer")
        : "Software Engineer";
      setInsightRole(role);
      
      const work = firstResume.resume_data?.workExperience || [];
      if (work.length > 0) {
        setInsightYoE(Math.max(1, Math.min(25, work.length * 2)));
      }
    }
  }, [resumes]);

  const handleDelete = async (id: string, e: React.MouseEvent) => {
    e.preventDefault(); // Prevent navigating to detail page on click
    e.stopPropagation();

    if (!window.confirm("Are you sure you want to permanently delete this resume from your history? This action cannot be undone.")) {
      return;
    }

    setDeletingId(id);
    try {
      const res = await fetch("/api/delete-resume", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id }),
      });

      if (!res.ok) {
        throw new Error("Failed to delete resume record.");
      }

      setResumes((prev) => prev.filter((r) => r.id !== id));
    } catch (err) {
      console.error(err);
      alert("Error deleting resume. Please try again.");
    } finally {
      setDeletingId(null);
    }
  };

  const getScoreColor = (score: number) => {
    if (score >= 70) return "#43e97b";
    if (score >= 45) return "#f6d365";
    return "#ff6584";
  };

  // Perform search & sort operations locally
  const filteredResumes = resumes
    .filter((r) => r.file_name.toLowerCase().includes(searchQuery.toLowerCase()))
    .sort((a, b) => {
      if (sortBy === "oldest") {
        return new Date(a.created_at).getTime() - new Date(b.created_at).getTime();
      }
      if (sortBy === "ats") {
        const scoreA = a.ats_score ? (a.ats_score as any).overall || 0 : 0;
        const scoreB = b.ats_score ? (b.ats_score as any).overall || 0 : 0;
        return scoreB - scoreA;
      }
      // default: newest
      return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
    });

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
      <div style={{ maxWidth: "1100px", margin: "0 auto", padding: "2.5rem 1.5rem" }}>

        {/* Header */}
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "2.5rem", flexWrap: "wrap", gap: "1rem", borderBottom: "1px solid var(--border)", paddingBottom: "1.5rem" }}>
          <div>
            <p className="section-label" style={{ marginBottom: "0.25rem", display: "flex", alignItems: "center", gap: "0.5rem" }}>
              Logged in as: <span style={{ color: "var(--accent)", textTransform: "none" }}>{user?.user_metadata?.full_name || user?.user_metadata?.name || user?.email?.split('@')[0] || "User"}</span>
              {role === "admin" && (
                <span className="tag tag-red" style={{ fontSize: "0.65rem", fontWeight: 800 }}>Admin Panel</span>
              )}
            </p>
            <h1 style={{ fontFamily: "Syne, sans-serif", fontSize: "2.2rem", fontWeight: 800 }}>
              Your Resumes
            </h1>
          </div>
          <div style={{ display: "flex", gap: "0.75rem", flexWrap: "wrap", alignItems: "center" }}>
            {role === "admin" && (
              <Link href="/admin" style={{ textDecoration: "none" }}>
                <button className="btn-secondary" style={{ borderColor: "#ff6584", color: "#ff6584" }}>🛡️ Admin Panel</button>
              </Link>
            )}
            {resumes.length >= 2 && (
              <Link href="/resume/compare" style={{ textDecoration: "none" }}>
                <button className="btn-secondary" style={{ borderColor: "var(--accent)", color: "var(--accent)" }}>
                  ⚖️ Compare Resumes
                </button>
              </Link>
            )}
            <Link href="/resume/builder" style={{ textDecoration: "none" }}>
              <button className="btn-primary">✦ Build New</button>
            </Link>
            <Link href="/resume/upload" style={{ textDecoration: "none" }}>
              <button className="btn-secondary">⇑ Upload</button>
            </Link>
          </div>
        </div>

        {/* Quick Actions / Navigation Grid */}
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: "1rem", marginBottom: "2.5rem" }}>
          {[
            { icon: "✦", label: "Build from Scratch", href: "/resume/builder", color: "#6c63ff" },
            { icon: "⇑", label: "Upload & Analyze", href: "/resume/upload", color: "#43e97b" },
            { icon: "🎯", label: "Tailor for Job", href: "/resume/tailor", color: "#0ea5e9" },
            { icon: "▣", label: "Browse Templates", href: "/resume/templates", color: "#ff6584" },
          ].map((action) => (
            <Link key={action.label} href={action.href} style={{ textDecoration: "none" }}>
              <div
                className="card"
                style={{ cursor: "pointer", display: "flex", alignItems: "center", gap: "0.75rem", transition: "all 0.2s" }}
                onMouseEnter={(e) => {
                  (e.currentTarget as HTMLDivElement).style.borderColor = action.color + "66";
                  (e.currentTarget as HTMLDivElement).style.transform = "translateY(-2px)";
                }}
                onMouseLeave={(e) => {
                  (e.currentTarget as HTMLDivElement).style.borderColor = "var(--border)";
                  (e.currentTarget as HTMLDivElement).style.transform = "translateY(0)";
                }}
              >
                <div style={{ width: 36, height: 36, borderRadius: 8, background: action.color + "20", display: "flex", alignItems: "center", justifyContent: "center", color: action.color, fontSize: "1.1rem" }}>
                  {action.icon}
                </div>
                <span style={{ fontWeight: 600, fontSize: "0.9rem" }}>{action.label}</span>
              </div>
            </Link>
          ))}
        </div>

        {/* SALARY INSIGHTS WIDGET CARD - Hidden for now */}
        {/* {(() => {
          const benchmark = getSalaryBenchmark(insightRole, insightYoE, insightCity);
          return (
            <div className="card" style={{ marginBottom: "2.5rem", background: "linear-gradient(135deg, rgba(108, 99, 255, 0.05) 0%, rgba(20, 20, 30, 0.9) 100%)", border: "1px solid var(--border)" }}>
              <h3 style={{ fontFamily: "Syne, sans-serif", fontSize: "1.1rem", fontWeight: 800, marginBottom: "0.8rem", display: "flex", alignItems: "center", gap: "0.5rem" }}>
                <span>🇮🇳</span> Salary & Pay Benchmark Insights
              </h3>
              
              <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: "1rem", marginBottom: "1.2rem" }}>
                <div>
                  <label style={{ fontSize: "0.75rem", color: "var(--text-muted)", display: "block", marginBottom: "0.25rem" }}>Target Tech Role</label>
                  <input 
                    className="input" 
                    style={{ fontSize: "0.82rem", padding: "0.5rem" }} 
                    value={insightRole} 
                    onChange={(e) => setInsightRole(e.target.value)} 
                    placeholder="e.g. Backend Developer"
                  />
                </div>
                <div>
                  <label style={{ fontSize: "0.75rem", color: "var(--text-muted)", display: "block", marginBottom: "0.25rem" }}>Indian City Location</label>
                  <select 
                    className="input" 
                    style={{ height: "38px", fontSize: "0.82rem", background: "var(--bg-2)" }} 
                    value={insightCity} 
                    onChange={(e) => setInsightCity(e.target.value)}
                  >
                    <option value="Bangalore">Bengaluru (Bangalore)</option>
                    <option value="Mumbai">Mumbai</option>
                    <option value="Delhi">Delhi / NCR</option>
                    <option value="Hyderabad">Hyderabad</option>
                    <option value="Pune">Pune</option>
                    <option value="Chennai">Chennai</option>
                  </select>
                </div>
                <div>
                  <label style={{ fontSize: "0.75rem", color: "var(--text-muted)", display: "block", marginBottom: "0.25rem" }}>Experience: {insightYoE} Years</label>
                  <input 
                    type="range" 
                    min="0" 
                    max="20" 
                    value={insightYoE} 
                    onChange={(e) => setInsightYoE(parseInt(e.target.value) || 0)} 
                    style={{ width: "100%", accentColor: "var(--accent)", marginTop: "0.5rem" }}
                  />
                </div>
              </div>

              <div style={{ display: "flex", alignItems: "center", gap: "1rem", background: "rgba(0, 0, 0, 0.25)", padding: "1rem", borderRadius: "10px" }}>
                <div style={{ fontSize: "1.8rem" }}>₹</div>
                <div>
                  <div style={{ fontSize: "0.72rem", color: "var(--text-muted)" }}>Calculated LPA Bracket ({benchmark.roleName} in {benchmark.cityName})</div>
                  <strong style={{ fontSize: "1.25rem", color: "var(--accent)" }}>₹ {benchmark.minLPA} - {benchmark.maxLPA} LPA</strong>
                </div>
              </div>
            </div>
          );
        })()} */}

        {/* SEARCH & SORT TOOLBAR */}
        <div style={{ 
          display: "flex", 
          justifyContent: "space-between", 
          alignItems: "center", 
          flexWrap: "wrap", 
          gap: "1rem", 
          marginBottom: "1.5rem",
          background: "var(--card)", 
          padding: "1rem", 
          borderRadius: "12px", 
          border: "1px solid var(--border)"
        }}>
          {/* Search bar input */}
          <div style={{ flex: "1 1 300px", position: "relative" }}>
            <input 
              type="text"
              placeholder="Search resumes by title..."
              className="input"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              style={{ paddingLeft: "1rem" }}
            />
          </div>

          {/* Sort selector dropdown */}
          <div style={{ display: "flex", alignItems: "center", gap: "0.6rem" }}>
            <span style={{ fontSize: "0.82rem", color: "var(--text-muted)", fontWeight: 600 }}>Sort by:</span>
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as any)}
              style={{
                background: "var(--bg-2)",
                border: "1px solid var(--border)",
                color: "var(--text)",
                padding: "0.55rem 1rem",
                borderRadius: "8px",
                fontFamily: "DM Sans, sans-serif",
                fontSize: "0.88rem",
                cursor: "pointer",
                outline: "none"
              }}
            >
              <option value="newest">Newest Upload</option>
              <option value="oldest">Oldest Upload</option>
              <option value="ats">Highest ATS Score</option>
            </select>
          </div>
        </div>

        {/* Resume List container */}
        {fetchingResumes ? (
          <div style={{ textAlign: "center", padding: "4rem", color: "var(--text-muted)" }}>
            <div className="spinner" style={{ margin: "0 auto 1rem" }} />
            Loading resumes...
          </div>
        ) : filteredResumes.length === 0 ? (
          <div
            className="card"
            style={{ textAlign: "center", padding: "4rem 2rem", borderStyle: "dashed" }}
          >
            <div style={{ fontSize: "3rem", marginBottom: "1rem" }}>📄</div>
            <h3 style={{ fontFamily: "Syne, sans-serif", fontWeight: 700, marginBottom: "0.5rem" }}>
              {searchQuery ? "No search matches" : "No resumes saved"}
            </h3>
            <p style={{ color: "var(--text-muted)", marginBottom: "1.5rem", fontSize: "0.9rem" }}>
              {searchQuery ? "Try altering your keyword filters or query above." : "Build your first resume or upload an existing one to get started."}
            </p>
            {!searchQuery && (
              <Link href="/resume/builder" style={{ textDecoration: "none" }}>
                <button className="btn-primary">Build My First Resume</button>
              </Link>
            )}
          </div>
        ) : (
          <div style={{ display: "grid", gap: "1rem" }}>
            {filteredResumes.map((resumeItem) => (
              <Link key={resumeItem.id} href={`/resume/${resumeItem.id}`} style={{ textDecoration: "none" }}>
                <div
                  className="card"
                  style={{ display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: "1rem", cursor: "pointer", transition: "all 0.2s" }}
                  onMouseEnter={(e) => {
                    (e.currentTarget as HTMLDivElement).style.borderColor = "var(--border-light)";
                    (e.currentTarget as HTMLDivElement).style.transform = "translateX(4px)";
                  }}
                  onMouseLeave={(e) => {
                    (e.currentTarget as HTMLDivElement).style.borderColor = "var(--border)";
                    (e.currentTarget as HTMLDivElement).style.transform = "translateX(0)";
                  }}
                >
                  <div style={{ display: "flex", alignItems: "center", gap: "1rem" }}>
                    <div style={{ width: 42, height: 42, borderRadius: 10, background: "rgba(108,99,255,0.15)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "1.2rem" }}>
                      📄
                    </div>
                    <div>
                      <div style={{ fontWeight: 700, marginBottom: "0.2rem", color: "var(--text)" }}>{resumeItem.file_name}</div>
                      <div style={{ color: "var(--text-muted)", fontSize: "0.8rem" }}>
                        {new Date(resumeItem.created_at).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}
                      </div>
                    </div>
                  </div>
                  
                  <div style={{ display: "flex", gap: "1.2rem", alignItems: "center" }}>
                    {resumeItem.ats_score && (
                      <div style={{ textAlign: "center" }}>
                        <div style={{ fontSize: "0.72rem", color: "var(--text-muted)", marginBottom: "0.15rem" }}>ATS Score</div>
                        <div style={{ fontWeight: 700, color: getScoreColor(resumeItem.ats_score.overall), fontFamily: "Syne, sans-serif" }}>
                          {resumeItem.ats_score.overall}/100
                        </div>
                      </div>
                    )}
                    {resumeItem.jd_match && (
                      <div style={{ textAlign: "center" }}>
                        <div style={{ fontSize: "0.72rem", color: "var(--text-muted)", marginBottom: "0.15rem" }}>JD Match</div>
                        <div style={{ fontWeight: 700, color: getScoreColor(resumeItem.jd_match.matchScore), fontFamily: "Syne, sans-serif" }}>
                          {resumeItem.jd_match.matchScore}%
                        </div>
                      </div>
                    )}

                    {/* DELETE BUTTON */}
                    <button
                      onClick={(e) => handleDelete(resumeItem.id, e)}
                      disabled={deletingId === resumeItem.id}
                      className="btn-secondary"
                      style={{
                        padding: "0.45rem 0.75rem",
                        borderColor: "rgba(255, 101, 132, 0.2)",
                        color: "#ff6584",
                        fontSize: "0.82rem"
                      }}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.background = "rgba(255, 101, 132, 0.1)";
                        e.currentTarget.style.borderColor = "#ff6584";
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.background = "transparent";
                        e.currentTarget.style.borderColor = "rgba(255, 101, 132, 0.2)";
                      }}
                    >
                      {deletingId === resumeItem.id ? "..." : "🗑"}
                    </button>
                    
                    <div style={{ color: "var(--text-muted)", fontSize: "1.2rem" }}>→</div>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
