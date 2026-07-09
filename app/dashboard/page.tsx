"use client";

import { useEffect, useState, useMemo } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import Navbar from "@/components/Navbar";
import ParticleBackground from "@/components/ui/ParticleBackground";
import { useAuth } from "@/hooks/useAuth";
import { Resume } from "@/types";
import { createClient } from "@/utils/supabase/client";
import { useToast } from "@/components/ui/toast-1";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { ATSRing } from "@/components/ui/ATSRing";
import { Badge } from "@/components/ui/Badge";
import { Input } from "@/components/ui/Input";
import { Plus, Upload, Target, LayoutTemplate, FileText, Search, Trash2, Calendar, TrendingUp, ArrowRight } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

export default function Dashboard() {
  const { user, role, loading: authLoading } = useAuth();
  const router = useRouter();
  const [resumes, setResumes] = useState<Resume[]>([]);
  const { showToast } = useToast();
  const [fetchingResumes, setFetchingResumes] = useState(true);

  // Search & Sort states
  const [searchQuery, setSearchQuery] = useState("");
  const [sortBy, setSortBy] = useState<"newest" | "oldest" | "ats">("newest");
  const [deletingId, setDeletingId] = useState<string | null>(null);

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

  const handleDelete = async (id: string, e: React.MouseEvent) => {
    e.preventDefault();
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
      showToast("Error deleting resume. Please try again.", "error");
    } finally {
      setDeletingId(null);
    }
  };

  const filteredResumes = useMemo(() => {
    return resumes
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
        return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
      });
  }, [resumes, searchQuery, sortBy]);

  // Derived stats
  const totalResumes = resumes.length;
  const avgATSScore = totalResumes 
    ? Math.round(resumes.reduce((acc, r) => acc + (r.ats_score ? (r.ats_score as any).overall || 0 : 0), 0) / totalResumes)
    : 0;
  
  const currentDate = new Intl.DateTimeFormat('en-US', { weekday: 'long', month: 'long', day: 'numeric' }).format(new Date());

  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return "Good morning";
    if (hour < 18) return "Good afternoon";
    return "Good evening";
  };
  
  const userName = user?.user_metadata?.full_name || user?.user_metadata?.name || user?.email?.split('@')[0] || "User";

  if (authLoading || !user) {
    return (
      <div className="min-h-screen bg-[var(--bg-page)] flex items-center justify-center">
        <div className="spinner w-10 h-10 border-4 border-[var(--accent)] border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[var(--bg-page)] pb-20 relative overflow-hidden">
      <ParticleBackground count={50} connectionDist={110} />
      <div style={{ position: 'relative', zIndex: 10 }}>
        <Navbar />
        <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-8">
        {/* Dynamic Header & Greeting */}
        <header className="mb-10 flex flex-col md:flex-row md:items-end justify-between gap-6">
          <div>
            <div className="flex items-center gap-3 mb-2 text-[var(--text-muted)] text-sm font-medium">
              <Calendar size={16} />
              {currentDate}
              {role === "admin" && (
                <Badge variant="danger">Admin</Badge>
              )}
            </div>
            <h1 className="font-['Syne',sans-serif] text-3xl md:text-4xl font-bold text-[var(--text-primary)]">
              {getGreeting()}, <span className="gradient-text">{userName}</span>
            </h1>
          </div>
          
          <div className="flex flex-wrap items-center gap-3">
            <Link href="/resume/upload" className="no-underline">
              <Button variant="secondary" icon={<Upload size={16} />}>Upload PDF</Button>
            </Link>
            <Link href="/resume/builder" className="no-underline">
              <Button icon={<Plus size={16} />}>Create New</Button>
            </Link>
          </div>
        </header>

        {/* Mini-Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
          <Card className="flex items-center p-6 gap-5 bg-[var(--card)]/50 backdrop-blur-sm">
            <div className="w-12 h-12 rounded-xl bg-[var(--accent)]/15 text-[var(--accent)] flex items-center justify-center">
              <FileText size={24} />
            </div>
            <div>
              <p className="text-[var(--text-muted)] text-sm font-medium mb-1">Total Resumes</p>
              <p className="font-['Syne',sans-serif] text-2xl font-bold text-[var(--text-primary)]">{fetchingResumes ? "-" : totalResumes}</p>
            </div>
          </Card>
          
          <Card className="flex items-center p-6 gap-5 bg-[var(--card)]/50 backdrop-blur-sm">
            <div className="w-12 h-12 rounded-xl bg-[var(--score-high)]/15 text-[var(--score-high)] flex items-center justify-center">
              <Target size={24} />
            </div>
            <div>
              <p className="text-[var(--text-muted)] text-sm font-medium mb-1">Avg ATS Score</p>
              <p className="font-['Syne',sans-serif] text-2xl font-bold text-[var(--text-primary)]">{fetchingResumes ? "-" : `${avgATSScore}/100`}</p>
            </div>
          </Card>

          <Card className="flex items-center p-6 gap-5 bg-[var(--card)]/50 backdrop-blur-sm">
            <div className="w-12 h-12 rounded-xl bg-[var(--info)]/15 text-[var(--info)] flex items-center justify-center">
              <TrendingUp size={24} />
            </div>
            <div>
              <p className="text-[var(--text-muted)] text-sm font-medium mb-1">Recent Activity</p>
              <p className="font-['Syne',sans-serif] text-xl font-bold text-[var(--text-primary)]">
                {fetchingResumes ? "-" : resumes.length > 0 ? new Date(resumes[0].created_at).toLocaleDateString(undefined, { month: 'short', day: 'numeric' }) : "None"}
              </p>
            </div>
          </Card>
        </div>

        {/* Quick Actions */}
        <div className="mb-12">
          <h2 className="text-lg font-bold text-[var(--text-primary)] mb-4">Quick Actions</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {[
              { icon: <Plus size={20} />, label: "Build from Scratch", href: "/resume/builder", color: "var(--accent)" },
              { icon: <Upload size={20} />, label: "Upload & Analyze", href: "/resume/upload", color: "var(--score-high)" },
              { icon: <Target size={20} />, label: "Tailor for Job", href: "/resume/tailor", color: "var(--info)" },
              { icon: <LayoutTemplate size={20} />, label: "Browse Templates", href: "/resume/templates", color: "var(--warning)" },
            ].map((action) => (
              <Link key={action.label} href={action.href} className="no-underline">
                <Card hoverable className="p-4 flex items-center gap-4 transition-all duration-300 hover:border-[var(--accent)] hover:shadow-md">
                  <div className="w-10 h-10 rounded-lg flex items-center justify-center text-white" style={{ backgroundColor: action.color }}>
                    {action.icon}
                  </div>
                  <span className="font-semibold text-sm text-[var(--text-primary)]">{action.label}</span>
                </Card>
              </Link>
            ))}
          </div>
        </div>

        {/* Resumes Library */}
        <div>
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-6">
            <h2 className="text-xl font-bold text-[var(--text-primary)] flex items-center gap-2">
              <FileText size={20} className="text-[var(--accent)]" />
              Your Resumes
            </h2>
            
            <div className="flex flex-col sm:flex-row gap-3 w-full md:w-auto">
              <Input
                placeholder="Search resumes..."
                icon={<Search size={16} />}
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full sm:w-64"
              />
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as any)}
                className="h-[42px] px-3 rounded-[var(--radius-md)] border border-[var(--border)] bg-[var(--bg-elevated)] text-[var(--text-primary)] text-sm outline-none focus:border-[var(--accent)] transition-colors w-full sm:w-auto"
              >
                <option value="newest">Newest First</option>
                <option value="oldest">Oldest First</option>
                <option value="ats">Highest ATS Score</option>
              </select>
            </div>
          </div>

          {fetchingResumes ? (
            /* Skeleton Loading State */
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {[1, 2, 3].map((i) => (
                <Card key={i} className="p-6 h-[220px] flex flex-col justify-between">
                  <div>
                    <div className="h-6 w-3/4 bg-[var(--bg-elevated)] rounded-md mb-2 skeleton" />
                    <div className="h-4 w-1/3 bg-[var(--bg-elevated)] rounded-md skeleton" />
                  </div>
                  <div className="flex justify-between items-end mt-6">
                    <div className="w-16 h-16 rounded-full border-4 border-[var(--bg-elevated)] skeleton" />
                    <div className="h-8 w-24 bg-[var(--bg-elevated)] rounded-md skeleton" />
                  </div>
                </Card>
              ))}
            </div>
          ) : filteredResumes.length === 0 ? (
            /* Empty State */
            <Card className="py-20 flex flex-col items-center justify-center text-center border-dashed border-2">
              <div className="w-20 h-20 rounded-full bg-[var(--bg-elevated)] flex items-center justify-center mb-6 text-[var(--text-muted)]">
                <FileText size={40} />
              </div>
              <h3 className="text-xl font-bold text-[var(--text-primary)] mb-2">
                {searchQuery ? "No matches found" : "No resumes yet"}
              </h3>
              <p className="text-[var(--text-muted)] mb-8 max-w-sm">
                {searchQuery 
                  ? "Try adjusting your search query." 
                  : "Create your first ATS-optimized resume to start landing interviews."}
              </p>
              {!searchQuery && (
                <Link href="/resume/builder" className="no-underline">
                  <Button size="lg" icon={<Plus size={18} />}>Create Resume</Button>
                </Link>
              )}
            </Card>
          ) : (
            /* Resume Grid using 3D Cards */
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredResumes.map((resumeItem, index) => {
                const score = resumeItem.ats_score ? (resumeItem.ats_score as any).overall || 0 : 0;
                const jdMatch = resumeItem.jd_match ? (resumeItem.jd_match as any).matchScore || 0 : 0;
                
                return (
                  <motion.div
                    key={resumeItem.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.3, delay: index * 0.05 }}
                  >
                    <Link href={`/resume/${resumeItem.id}`} className="block no-underline h-full">
                      <Card 
                        hoverable 
                        glowColor={score >= 70 ? "var(--score-high)" : score >= 40 ? "var(--score-mid)" : "var(--score-low)"}
                        className="h-full flex flex-col p-6"
                      >
                        <div className="flex justify-between items-start mb-6">
                          <div className="flex-1 pr-4">
                            <h3 className="font-bold text-lg text-[var(--text-primary)] line-clamp-2 leading-tight mb-1">
                              {resumeItem.file_name}
                            </h3>
                            <p className="text-xs text-[var(--text-muted)] flex items-center gap-1">
                              <Calendar size={12} />
                              {new Date(resumeItem.created_at).toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: 'numeric' })}
                            </p>
                          </div>
                          
                          <button
                            onClick={(e) => handleDelete(resumeItem.id, e)}
                            disabled={deletingId === resumeItem.id}
                            className="w-8 h-8 rounded-full flex items-center justify-center text-[var(--text-muted)] hover:text-[var(--danger)] hover:bg-[var(--danger)]/10 transition-colors z-10"
                            title="Delete resume"
                          >
                            {deletingId === resumeItem.id ? (
                              <div className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin" />
                            ) : (
                              <Trash2 size={16} />
                            )}
                          </button>
                        </div>

                        <div className="mt-auto flex items-end justify-between">
                          <div className="flex gap-4">
                            {score > 0 ? (
                              <div className="flex flex-col items-center">
                                <ATSRing score={score} size={64} strokeWidth={6} />
                                <span className="text-[10px] font-bold text-[var(--text-muted)] mt-1 uppercase tracking-wider">ATS Score</span>
                              </div>
                            ) : (
                              <div className="w-16 h-16 rounded-full border-4 border-[var(--bg-elevated)] flex items-center justify-center text-[var(--text-muted)] text-xs font-bold bg-[var(--bg-surface)]">
                                N/A
                              </div>
                            )}

                            {jdMatch > 0 && (
                              <div className="flex flex-col items-center">
                                <div className="w-16 h-16 rounded-full border-4 flex items-center justify-center font-bold text-lg bg-[var(--bg-surface)]" 
                                  style={{ 
                                    borderColor: jdMatch >= 70 ? 'var(--score-high)' : jdMatch >= 40 ? 'var(--score-mid)' : 'var(--score-low)',
                                    color: jdMatch >= 70 ? 'var(--score-high)' : jdMatch >= 40 ? 'var(--score-mid)' : 'var(--score-low)'
                                  }}>
                                  {jdMatch}%
                                </div>
                                <span className="text-[10px] font-bold text-[var(--text-muted)] mt-1 uppercase tracking-wider">JD Match</span>
                              </div>
                            )}
                          </div>
                          
                          <div className="text-[var(--accent)] font-medium text-sm flex items-center gap-1 group-hover:translate-x-1 transition-transform">
                            View <ArrowRight size={16} />
                          </div>
                        </div>
                      </Card>
                    </Link>
                  </motion.div>
                );
              })}
            </div>
          )}
        </div>
      </main>
      </div>
    </div>
  );
}
