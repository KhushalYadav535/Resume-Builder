"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Navbar from "@/components/Navbar";
import { useAuth } from "@/hooks/useAuth";

export interface JobApplication {
  id: string;
  company: string;
  role: string;
  salary: string;
  platform: string;
  date: string;
  status: "Applied" | "Interview" | "Offer" | "Rejected" | "Withdrawn";
  notes: string;
  reminders?: string;
  resume_id?: string;
  jd_text?: string;
  jd_url?: string;
  jd_match_score?: number;
}

export default function JobTracker() {
  const { user, loading: authLoading } = useAuth();
  const router = useRouter();

  // Job data states
  const [applications, setApplications] = useState<JobApplication[]>([]);
  const [resumes, setResumes] = useState<{ id: string; file_name: string }[]>([]);
  const [loading, setLoading] = useState(true);

  // Modal states
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [selectedApp, setSelectedApp] = useState<JobApplication | null>(null);

  // Form states
  const [company, setCompany] = useState("");
  const [roleName, setRoleName] = useState("");
  const [salary, setSalary] = useState("");
  const [platform, setPlatform] = useState("LinkedIn");
  const [status, setStatus] = useState<JobApplication["status"]>("Applied");
  const [date, setDate] = useState(new Date().toISOString().split("T")[0]);
  const [notes, setNotes] = useState("");
  const [resumeId, setResumeId] = useState("");
  const [jdText, setJdText] = useState("");
  const [jdUrl, setJdUrl] = useState("");
  const [jdMatchScore, setJdMatchScore] = useState<number | null>(null);

  useEffect(() => {
    if (!authLoading && !user) {
      router.push("/login");
    }
  }, [authLoading, user, router]);

  const fetchApplications = async () => {
    if (!user) return;
    try {
      setLoading(true);
      const res = await fetch("/api/job-applications");
      const data = await res.json();
      if (Array.isArray(data)) {
        setApplications(data);
      }
    } catch (err) {
      console.error("Failed to load applications:", err);
    } finally {
      setLoading(false);
    }
  };

  const fetchResumes = async () => {
    if (!user) return;
    try {
      const res = await fetch("/api/get-resumes");
      const data = await res.json();
      if (Array.isArray(data)) {
        setResumes(data);
      }
    } catch (err) {
      console.error("Failed to load resumes:", err);
    }
  };

  useEffect(() => {
    if (user) {
      fetchApplications();
      fetchResumes();
    }
  }, [user]);

  const handleAddSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!company.trim() || !roleName.trim()) return;

    try {
      const res = await fetch("/api/job-applications", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          company,
          role: roleName,
          salary,
          platform,
          date,
          status,
          notes,
          resume_id: resumeId || null,
          jd_text: jdText || null,
          jd_url: jdUrl || null,
        }),
      });

      if (!res.ok) throw new Error("Failed to add job application");
      
      const newApp = await res.json();
      setApplications((prev) => [newApp, ...prev]);
      
      // Reset form
      setCompany("");
      setRoleName("");
      setSalary("");
      setPlatform("LinkedIn");
      setStatus("Applied");
      setDate(new Date().toISOString().split("T")[0]);
      setNotes("");
      setResumeId("");
      setJdText("");
      setJdUrl("");
      setJdMatchScore(null);
      setShowAddModal(false);
    } catch (err) {
      console.error(err);
      alert("Error adding application. Make sure the database migration has been run.");
    }
  };

  const handleEditSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedApp || !company.trim() || !roleName.trim()) return;

    try {
      const res = await fetch("/api/job-applications", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          id: selectedApp.id,
          company,
          role: roleName,
          salary,
          platform,
          date,
          status,
          notes,
          resume_id: resumeId || null,
          jd_text: jdText || null,
          jd_url: jdUrl || null,
          jd_match_score: jdMatchScore, // Retain or recalculate on backend if cleared
        }),
      });

      if (!res.ok) throw new Error("Failed to update application");
      
      const updated = await res.json();
      setApplications((prev) => prev.map((app) => (app.id === updated.id ? updated : app)));
      setShowEditModal(false);
      setSelectedApp(null);
    } catch (err) {
      console.error(err);
      alert("Error updating application.");
    }
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm("Are you sure you want to delete this job application from your tracker?")) return;

    try {
      const res = await fetch(`/api/job-applications?id=${id}`, {
        method: "DELETE",
      });

      if (!res.ok) throw new Error("Failed to delete application");
      setApplications((prev) => prev.filter((app) => app.id !== id));
      setShowEditModal(false);
      setSelectedApp(null);
    } catch (err) {
      console.error(err);
      alert("Failed to delete application.");
    }
  };

  const openEdit = (app: JobApplication) => {
    setSelectedApp(app);
    setCompany(app.company);
    setRoleName(app.role);
    setSalary(app.salary || "");
    setPlatform(app.platform || "LinkedIn");
    setStatus(app.status);
    setDate(app.date);
    setNotes(app.notes || "");
    setResumeId(app.resume_id || "");
    setJdText(app.jd_text || "");
    setJdUrl(app.jd_url || "");
    setJdMatchScore(app.jd_match_score || null);
    setShowEditModal(true);
  };

  const updateStatusQuick = async (app: JobApplication, newStatus: JobApplication["status"]) => {
    try {
      const res = await fetch("/api/job-applications", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...app,
          status: newStatus,
        }),
      });

      if (!res.ok) throw new Error("Failed to update status");
      const updated = await res.json();
      setApplications((prev) => prev.map((a) => (a.id === updated.id ? updated : a)));
    } catch (err) {
      console.error(err);
    }
  };

  // Compute metrics
  const totalApps = applications.length;
  const interviews = applications.filter((a) => a.status === "Interview").length;
  const offers = applications.filter((a) => a.status === "Offer").length;
  const rejections = applications.filter((a) => a.status === "Rejected").length;
  const activeApps = applications.filter((a) => a.status === "Applied" || a.status === "Interview").length;
  
  // Calculate Response Rate: (Interviews + Offers) / Total Apps (excluding withdrawn)
  const nonWithdrawn = applications.filter(a => a.status !== "Withdrawn").length;
  const responseRate = nonWithdrawn > 0 
    ? Math.round(((interviews + offers) / nonWithdrawn) * 100) 
    : 0;

  const columns: { title: string; key: JobApplication["status"]; color: string }[] = [
    { title: "Applied", key: "Applied", color: "var(--accent)" },
    { title: "Interviews", key: "Interview", color: "#f6d365" },
    { title: "Offers", key: "Offer", color: "#43e97b" },
    { title: "Rejected / Closed", key: "Rejected", color: "#ff6584" },
    { title: "Withdrawn", key: "Withdrawn", color: "#888888" },
  ];

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

      <div style={{ maxWidth: "1280px", margin: "0 auto", padding: "2.5rem 1.5rem" }}>
        {/* HEADER AREA */}
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "2rem", borderBottom: "1px solid var(--border)", paddingBottom: "1.5rem" }}>
          <div>
            <span style={{ fontSize: "0.8rem", color: "var(--accent)", fontWeight: 700, textTransform: "uppercase" }}>Visual Pipeline</span>
            <h1 style={{ fontFamily: "Syne, sans-serif", fontSize: "2.2rem", fontWeight: 800 }}>Job Application Tracker</h1>
          </div>
          <button 
            onClick={() => {
              // Clear state and open add modal
              setCompany("");
              setRoleName("");
              setSalary("");
              setPlatform("LinkedIn");
              setStatus("Applied");
              setDate(new Date().toISOString().split("T")[0]);
              setNotes("");
              setShowAddModal(true);
            }} 
            className="btn-primary"
            style={{ padding: "0.7rem 1.5rem", borderRadius: "10px" }}
          >
            + Add New Application
          </button>
        </div>

        {/* METRICS STATS BAR */}
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: "1.2rem", marginBottom: "2.5rem" }}>
          {[
            { label: "Total Applications", val: totalApps, sub: "All time tracking", color: "#fff" },
            { label: "Active Pipeline", val: activeApps, sub: "Applied + Interview stage", color: "var(--accent)" },
            { label: "Interviews Scheduled", val: interviews, sub: "Keep practicing DSA!", color: "#f6d365" },
            { label: "Response Rate", val: `${responseRate}%`, sub: "Interviews / Applied ratio", color: "#43e97b" },
            { label: "Offers Secured", val: offers, sub: "Congratulations! 🥳", color: "#43e97b" }
          ].map((stat, i) => (
            <div key={i} className="card" style={{ padding: "1.2rem", border: "1px solid var(--border)", background: "var(--card)" }}>
              <div style={{ fontSize: "0.8rem", color: "var(--text-muted)", marginBottom: "0.3rem", fontWeight: 600 }}>{stat.label}</div>
              <div style={{ fontSize: "2rem", fontWeight: 800, color: stat.color }}>{stat.val}</div>
              <div style={{ fontSize: "0.72rem", color: "var(--text-muted)", marginTop: "0.2rem" }}>{stat.sub}</div>
            </div>
          ))}
        </div>

        {/* KANBAN BOARD WRAPPER */}
        {loading ? (
          <div style={{ textAlign: "center", padding: "5rem" }}>
            <div className="spinner" style={{ width: 32, height: 32, margin: "0 auto" }}></div>
            <p style={{ marginTop: "1rem", color: "var(--text-muted)" }}>Loading your application pipeline...</p>
          </div>
        ) : (
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(270px, 1fr))", gap: "1.5rem" }}>
            {columns.map((col) => {
              const colApps = applications.filter((app) => app.status === col.key);
              return (
                <div 
                  key={col.key} 
                  style={{ 
                    background: "rgba(10,10,15,0.4)", 
                    borderRadius: "12px", 
                    border: "1px solid var(--border)", 
                    padding: "1rem", 
                    minHeight: "500px",
                    display: "flex",
                    flexDirection: "column"
                  }}
                >
                  {/* Column Header */}
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "1rem", borderBottom: "2px solid " + col.color, paddingBottom: "0.6rem" }}>
                    <h3 style={{ fontSize: "1rem", fontWeight: 800, display: "flex", alignItems: "center", gap: "0.5rem" }}>
                      <span style={{ width: "8px", height: "8px", borderRadius: "50%", background: col.color }}></span>
                      {col.title}
                    </h3>
                    <span style={{ fontSize: "0.78rem", background: "var(--bg-3)", color: "var(--text-muted)", padding: "2px 8px", borderRadius: "12px", fontWeight: 700 }}>
                      {colApps.length}
                    </span>
                  </div>

                  {/* Column Cards */}
                  <div style={{ display: "flex", flexDirection: "column", gap: "0.8rem", flex: 1, overflowY: "auto" }}>
                    {colApps.length === 0 ? (
                      <div style={{ textAlign: "center", padding: "2.5rem 1rem", border: "1px dashed var(--border)", borderRadius: "8px", color: "var(--text-muted)", fontSize: "0.75rem" }}>
                        No jobs in this stage.
                      </div>
                    ) : (
                      colApps.map((app) => (
                        <div 
                          key={app.id} 
                          onClick={() => openEdit(app)}
                          style={{ 
                            background: "var(--card)", 
                            border: "1px solid var(--border)", 
                            borderRadius: "10px", 
                            padding: "1rem", 
                            cursor: "pointer",
                            transition: "transform 0.15s, border-color 0.15s",
                          }}
                          className="job-card-hover"
                          onMouseOver={(e) => {
                            e.currentTarget.style.transform = "translateY(-2px)";
                            e.currentTarget.style.borderColor = col.color;
                          }}
                          onMouseOut={(e) => {
                            e.currentTarget.style.transform = "none";
                            e.currentTarget.style.borderColor = "var(--border)";
                          }}
                        >
                          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "start", marginBottom: "0.3rem" }}>
                            <h4 style={{ fontWeight: 800, fontSize: "0.95rem", margin: 0, color: "var(--text)" }}>{app.company}</h4>
                            <div style={{ display: "flex", gap: "0.3rem", alignItems: "center" }}>
                              {app.jd_match_score !== undefined && app.jd_match_score !== null && (
                                <span 
                                  style={{ 
                                    fontSize: "0.68rem", 
                                    background: app.jd_match_score >= 70 ? "rgba(67,233,123,0.12)" : app.jd_match_score >= 45 ? "rgba(246,211,101,0.12)" : "rgba(255,101,132,0.12)", 
                                    color: app.jd_match_score >= 70 ? "#43e97b" : app.jd_match_score >= 45 ? "#f6d365" : "#ff6584", 
                                    padding: "2px 6px", 
                                    borderRadius: "4px",
                                    fontWeight: 700
                                  }}
                                >
                                  🎯 {app.jd_match_score}%
                                </span>
                              )}
                              <span style={{ fontSize: "0.68rem", background: "var(--bg-2)", color: "var(--text-muted)", padding: "2px 6px", borderRadius: "4px" }}>
                                {app.platform}
                              </span>
                            </div>
                          </div>
                          <p style={{ fontSize: "0.82rem", color: "var(--text-muted)", margin: "0 0 0.6rem" }}>{app.role}</p>

                          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", borderTop: "1px solid var(--border-2)", paddingTop: "0.6rem", marginTop: "0.4rem" }}>
                            <span style={{ fontSize: "0.78rem", fontWeight: 700, color: "var(--accent)" }}>
                              {app.salary ? `₹ ${app.salary}` : "LPA Not set"}
                            </span>
                            <span style={{ fontSize: "0.72rem", color: "var(--text-muted)" }}>
                              {app.date}
                            </span>
                          </div>

                          {/* Quick Status Changers */}
                          <div 
                            style={{ display: "flex", gap: "0.3rem", marginTop: "0.6rem", borderTop: "1px solid var(--border-2)", paddingTop: "0.5rem" }}
                            onClick={(e) => e.stopPropagation()} // Stop modal from triggering
                          >
                            {columns.filter(c => c.key !== col.key).map((c) => (
                              <button
                                key={c.key}
                                onClick={() => updateStatusQuick(app, c.key)}
                                style={{
                                  fontSize: "0.65rem",
                                  padding: "2px 6px",
                                  background: "var(--bg-3)",
                                  border: "1px solid var(--border)",
                                  borderRadius: "4px",
                                  color: "var(--text-muted)",
                                  cursor: "pointer",
                                }}
                                onMouseOver={(e) => e.currentTarget.style.borderColor = c.color}
                                onMouseOut={(e) => e.currentTarget.style.borderColor = "var(--border)"}
                              >
                                → {c.key}
                              </button>
                            ))}
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* ADD APPLICATION MODAL */}
        {showAddModal && (
          <>
            {/* Backdrop */}
            <div
              onClick={() => setShowAddModal(false)}
              style={{
                position: "fixed",
                inset: 0,
                backgroundColor: "rgba(0, 0, 0, 0.5)",
                zIndex: 40,
              }}
            />
            {/* Drawer Container */}
            <div
              style={{
                position: "fixed",
                top: 0,
                right: 0,
                height: "100%",
                width: "100%",
                maxWidth: "448px",
                backgroundColor: "var(--card)",
                borderLeft: "1px solid var(--border)",
                zIndex: 50,
                display: "flex",
                flexDirection: "column",
                boxShadow: "-4px 0 24px rgba(0, 0, 0, 0.5)",
              }}
            >
              {/* Header */}
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                  padding: "1rem",
                  borderBottom: "1px solid var(--border)",
                }}
              >
                <h3 style={{ fontFamily: "Syne, sans-serif", fontWeight: 800, fontSize: "1.3rem", margin: 0 }}>
                  Add New Job Application
                </h3>
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  style={{
                    background: "none",
                    border: "none",
                    color: "var(--text-muted)",
                    cursor: "pointer",
                    fontSize: "1.5rem",
                    lineHeight: 1,
                  }}
                >
                  ✕
                </button>
              </div>

              {/* Form wrapping body and footer */}
              <form
                onSubmit={handleAddSubmit}
                style={{
                  display: "flex",
                  flexDirection: "column",
                  flex: 1,
                  height: "calc(100% - 60px)",
                  overflow: "hidden",
                }}
              >
                {/* Scrollable Form Body */}
                <div
                  style={{
                    flex: 1,
                    overflowY: "auto",
                    padding: "1rem",
                    display: "flex",
                    flexDirection: "column",
                    gap: "1rem",
                  }}
                >
                  <div style={{ display: "flex", flexDirection: "column", gap: "0.3rem" }}>
                    <label style={{ fontSize: "0.8rem", color: "var(--text-muted)", display: "block" }}>Company Name *</label>
                    <input required className="input" style={{ width: "100%" }} placeholder="e.g. Google India, Razorpay, TCS" value={company} onChange={(e) => setCompany(e.target.value)} />
                  </div>

                  <div style={{ display: "flex", flexDirection: "column", gap: "0.3rem" }}>
                    <label style={{ fontSize: "0.8rem", color: "var(--text-muted)", display: "block" }}>Job Role *</label>
                    <input required className="input" style={{ width: "100%" }} placeholder="e.g. Software Engineer, Product Analyst" value={roleName} onChange={(e) => setRoleName(e.target.value)} />
                  </div>

                  <div style={{ display: "flex", flexDirection: "column", gap: "0.3rem" }}>
                    <label style={{ fontSize: "0.8rem", color: "var(--text-muted)", display: "block" }}>Link Resume</label>
                    <select className="input" style={{ height: "42px", background: "var(--bg-2)", color: "var(--text)", width: "100%" }} value={resumeId} onChange={(e) => setResumeId(e.target.value)}>
                      <option value="">-- Select Resume (Optional) --</option>
                      {resumes.map(r => (
                        <option key={r.id} value={r.id}>{r.file_name}</option>
                      ))}
                    </select>
                  </div>

                  <div style={{ display: "flex", flexDirection: "column", gap: "0.3rem" }}>
                    <label style={{ fontSize: "0.8rem", color: "var(--text-muted)", display: "block" }}>Job Description URL (Optional)</label>
                    <input className="input" style={{ width: "100%" }} placeholder="e.g. careers.google.com/jobs/..." value={jdUrl} onChange={(e) => setJdUrl(e.target.value)} />
                  </div>

                  <div style={{ display: "flex", flexDirection: "column", gap: "0.3rem" }}>
                    <label style={{ fontSize: "0.8rem", color: "var(--text-muted)", display: "block" }}>Job Description (Optional, triggers automatic AI JD match score)</label>
                    <textarea className="input" style={{ width: "100%" }} rows={3} placeholder="Paste job requirements/description to calculate match score..." value={jdText} onChange={(e) => setJdText(e.target.value)} />
                  </div>

                  <div style={{ display: "flex", flexDirection: "column", gap: "0.3rem" }}>
                    <label style={{ fontSize: "0.8rem", color: "var(--text-muted)", display: "block" }}>Salary Bracket (e.g. ₹ LPA)</label>
                    <input className="input" style={{ width: "100%" }} placeholder="e.g. 12-15 LPA" value={salary} onChange={(e) => setSalary(e.target.value)} />
                  </div>

                  <div style={{ display: "flex", flexDirection: "column", gap: "0.3rem" }}>
                    <label style={{ fontSize: "0.8rem", color: "var(--text-muted)", display: "block" }}>Source Platform</label>
                    <select className="input" style={{ height: "42px", background: "var(--bg-2)", width: "100%" }} value={platform} onChange={(e) => setPlatform(e.target.value)}>
                      <option value="LinkedIn">LinkedIn</option>
                      <option value="Naukri">Naukri</option>
                      <option value="Indeed">Indeed India</option>
                      <option value="Instahyre">Instahyre</option>
                      <option value="Direct Career Portal">Direct / Referral</option>
                    </select>
                  </div>

                  <div style={{ display: "flex", flexDirection: "column", gap: "0.3rem" }}>
                    <label style={{ fontSize: "0.8rem", color: "var(--text-muted)", display: "block" }}>Applied Date</label>
                    <input type="date" className="input" style={{ width: "100%" }} value={date} onChange={(e) => setDate(e.target.value)} />
                  </div>

                  <div style={{ display: "flex", flexDirection: "column", gap: "0.3rem" }}>
                    <label style={{ fontSize: "0.8rem", color: "var(--text-muted)", display: "block" }}>Current Status</label>
                    <select className="input" style={{ height: "42px", background: "var(--bg-2)", width: "100%" }} value={status} onChange={(e) => setStatus(e.target.value as any)}>
                      <option value="Applied">Applied</option>
                      <option value="Interview">Interview</option>
                      <option value="Offer">Offer secured</option>
                      <option value="Rejected">Rejected</option>
                      <option value="Withdrawn">Withdrawn</option>
                    </select>
                  </div>

                  <div style={{ display: "flex", flexDirection: "column", gap: "0.3rem" }}>
                    <label style={{ fontSize: "0.8rem", color: "var(--text-muted)", display: "block" }}>Application Notes</label>
                    <textarea className="input" style={{ width: "100%" }} rows={3} placeholder="Add follow-up notes, recruiters, references..." value={notes} onChange={(e) => setNotes(e.target.value)} />
                  </div>
                </div>

                {/* Fixed Footer */}
                <div
                  style={{
                    padding: "1rem",
                    borderTop: "1px solid var(--border)",
                    backgroundColor: "var(--card)",
                    display: "flex",
                    flexDirection: "column",
                    gap: "0.5rem",
                  }}
                >
                  <button type="submit" className="btn-primary" style={{ width: "100%", justifyContent: "center" }}>
                    Add Application
                  </button>
                  <button
                    type="button"
                    onClick={() => setShowAddModal(false)}
                    className="btn-secondary"
                    style={{ width: "100%", justifyContent: "center" }}
                  >
                    Cancel
                  </button>
                </div>
              </form>
            </div>
          </>
        )}

        {/* EDIT APPLICATION MODAL */}
        {showEditModal && selectedApp && (
          <div style={{ position: "fixed", top: 0, left: 0, right: 0, bottom: 0, background: "rgba(0,0,0,0.85)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 1000 }}>
            <form onSubmit={handleEditSubmit} className="card" style={{ width: "100%", maxWidth: "500px", padding: "2rem", display: "grid", gap: "1rem" }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <h3 style={{ fontFamily: "Syne, sans-serif", fontWeight: 800, fontSize: "1.3rem", margin: 0 }}>Edit Job Details</h3>
                <button 
                  type="button" 
                  onClick={() => handleDelete(selectedApp.id)} 
                  style={{ background: "none", border: "none", color: "#ff6584", cursor: "pointer", fontSize: "0.85rem", fontWeight: 700 }}
                >
                  🗑️ Delete
                </button>
              </div>

              <div>
                <label style={{ fontSize: "0.8rem", color: "var(--text-muted)", display: "block", marginBottom: "0.3rem" }}>Company Name *</label>
                <input required className="input" value={company} onChange={(e) => setCompany(e.target.value)} />
              </div>

              <div>
                <label style={{ fontSize: "0.8rem", color: "var(--text-muted)", display: "block", marginBottom: "0.3rem" }}>Job Role *</label>
                <input required className="input" value={roleName} onChange={(e) => setRoleName(e.target.value)} />
              </div>

              <div>
                <label style={{ fontSize: "0.8rem", color: "var(--text-muted)", display: "block", marginBottom: "0.3rem" }}>Link Resume</label>
                <select className="input" style={{ height: "42px", background: "var(--bg-2)", color: "var(--text)" }} value={resumeId} onChange={(e) => setResumeId(e.target.value)}>
                  <option value="">-- Select Resume (Optional) --</option>
                  {resumes.map(r => (
                    <option key={r.id} value={r.id}>{r.file_name}</option>
                  ))}
                </select>
              </div>

              {jdMatchScore !== null && (
                <div style={{ display: "flex", alignItems: "center", gap: "0.6rem", background: "rgba(0,0,0,0.15)", padding: "0.6rem 1rem", borderRadius: "8px" }}>
                  <span style={{ fontSize: "1.2rem" }}>🎯</span>
                  <div>
                    <span style={{ fontSize: "0.74rem", color: "var(--text-muted)", display: "block" }}>AI Job Description Match Score</span>
                    <strong style={{ 
                      fontSize: "0.95rem", 
                      color: jdMatchScore >= 70 ? "#43e97b" : jdMatchScore >= 45 ? "#f6d365" : "#ff6584"
                    }}>
                      {jdMatchScore}% Compatibility
                    </strong>
                  </div>
                </div>
              )}

              <div>
                <label style={{ fontSize: "0.8rem", color: "var(--text-muted)", display: "block", marginBottom: "0.3rem" }}>Job Description URL (Optional)</label>
                <input className="input" placeholder="e.g. careers.google.com/jobs/..." value={jdUrl} onChange={(e) => setJdUrl(e.target.value)} />
              </div>

              <div>
                <label style={{ fontSize: "0.8rem", color: "var(--text-muted)", display: "block", marginBottom: "0.3rem" }}>Job Description (Optional, triggers automatic AI JD match score)</label>
                <textarea className="input" rows={3} placeholder="Paste job requirements/description to calculate match score..." value={jdText} onChange={(e) => setJdText(e.target.value)} />
              </div>

              <div className="responsive-grid-2" style={{ gap: "1rem" }}>
                <div>
                  <label style={{ fontSize: "0.8rem", color: "var(--text-muted)", display: "block", marginBottom: "0.3rem" }}>Salary Bracket</label>
                  <input className="input" value={salary} onChange={(e) => setSalary(e.target.value)} />
                </div>
                <div>
                  <label style={{ fontSize: "0.8rem", color: "var(--text-muted)", display: "block", marginBottom: "0.3rem" }}>Platform</label>
                  <select className="input" style={{ height: "42px", background: "var(--bg-2)" }} value={platform} onChange={(e) => setPlatform(e.target.value)}>
                    <option value="LinkedIn">LinkedIn</option>
                    <option value="Naukri">Naukri</option>
                    <option value="Indeed">Indeed India</option>
                    <option value="Instahyre">Instahyre</option>
                    <option value="Direct Career Portal">Direct / Referral</option>
                  </select>
                </div>
              </div>

              <div className="responsive-grid-2" style={{ gap: "1rem" }}>
                <div>
                  <label style={{ fontSize: "0.8rem", color: "var(--text-muted)", display: "block", marginBottom: "0.3rem" }}>Applied Date</label>
                  <input type="date" className="input" value={date} onChange={(e) => setDate(e.target.value)} />
                </div>
                <div>
                  <label style={{ fontSize: "0.8rem", color: "var(--text-muted)", display: "block", marginBottom: "0.3rem" }}>Current Status</label>
                  <select className="input" style={{ height: "42px", background: "var(--bg-2)" }} value={status} onChange={(e) => setStatus(e.target.value as any)}>
                    <option value="Applied">Applied</option>
                    <option value="Interview">Interview</option>
                    <option value="Offer">Offer secured</option>
                    <option value="Rejected">Rejected</option>
                    <option value="Withdrawn">Withdrawn</option>
                  </select>
                </div>
              </div>

              <div>
                <label style={{ fontSize: "0.8rem", color: "var(--text-muted)", display: "block", marginBottom: "0.3rem" }}>Application Notes</label>
                <textarea className="input" rows={3} value={notes} onChange={(e) => setNotes(e.target.value)} />
              </div>

              <div style={{ display: "flex", justifyContent: "flex-end", gap: "0.8rem", marginTop: "0.5rem" }}>
                <button type="button" onClick={() => { setShowEditModal(false); setSelectedApp(null); }} className="btn-secondary">Cancel</button>
                <button type="submit" className="btn-primary">Save Changes</button>
              </div>
            </form>
          </div>
        )}
      </div>
    </div>
  );
}
