"use client";
import { useEffect, useState } from "react";
import Link from "next/link";
import Navbar from "@/components/Navbar";
import { useToast } from "@/components/ui/toast-1";
import { BarChart2, Users, Bot, Brain, CreditCard, Megaphone, Send, Clock } from "lucide-react";

interface BroadcastHistory {
  message: string;
  type: string;
  link: string | null;
  created_at: string;
}

export default function AdminBroadcastPage() {
  const { showToast } = useToast();
  
  const [form, setForm] = useState({
    message: "",
    type: "info",
    link: "",
    targetAudience: "all_users"
  });
  
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [history, setHistory] = useState<BroadcastHistory[]>([]);
  const [loadingHistory, setLoadingHistory] = useState(true);

  const fetchHistory = async () => {
    setLoadingHistory(true);
    try {
      const res = await fetch("/api/admin/broadcast");
      if (res.ok) {
        const data = await res.json();
        setHistory(Array.isArray(data) ? data : []);
      }
    } catch (err) {
      console.error("Failed to load history", err);
    } finally {
      setLoadingHistory(false);
    }
  };

  useEffect(() => {
    fetchHistory();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.message) return;
    
    setIsSubmitting(true);
    try {
      const res = await fetch("/api/admin/broadcast", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form)
      });

      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.error || "Failed to send broadcast.");
      }

      const data = await res.json();
      showToast(`Broadcast sent to ${data.sentCount} users successfully!`, "success");
      
      setForm({ ...form, message: "", link: "" });
      fetchHistory(); // Refresh history
    } catch (err: any) {
      showToast(err.message || "An unexpected error occurred.", "error");
    } finally {
      setIsSubmitting(false);
    }
  };

  const getBadgeColor = (type: string) => {
    switch (type) {
      case "promo": return "tag-purple";
      case "success": return "tag-green";
      case "warning": return "tag-amber";
      case "alert": return "tag-red";
      default: return "tag-gray";
    }
  };

  return (
    <div style={{ minHeight: "100vh", background: "var(--bg)" }}>
      <Navbar />
      <div style={{ maxWidth: "1100px", margin: "0 auto", padding: "2.5rem 1.5rem" }}>

        {/* Title */}
        <div style={{ marginBottom: "2rem" }}>
          <p className="section-label" style={{ marginBottom: "0.5rem" }}>System Directory</p>
          <h1 style={{ fontFamily: "Syne, sans-serif", fontSize: "2.2rem", fontWeight: 800, display: "inline-flex", alignItems: "center", gap: "0.5rem" }}>
            <Megaphone size={32} className="text-orange-500" />
            Global Broadcaster
          </h1>
          <p style={{ color: "var(--text-muted)", fontSize: "0.9rem", marginTop: "0.25rem" }}>
            Send announcements, promotional offers, and urgent alerts directly to users' notification centers.
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
          <Link href="/admin/billing" style={{ textDecoration: "none" }}>
            <button style={{ padding: "0.6rem 1.2rem", background: "transparent", border: "none", color: "var(--text-muted)", fontWeight: 600, fontSize: "0.85rem", cursor: "pointer", display: "inline-flex", alignItems: "center", gap: "0.4rem" }}>
              <CreditCard size={14} />
              Billing & Credits
            </button>
          </Link>
          <Link href="/admin/broadcast" style={{ textDecoration: "none" }}>
            <button style={{ padding: "0.6rem 1.2rem", background: "rgba(249, 115, 22, 0.08)", border: "none", borderBottom: "2px solid #f97316", color: "#f97316", fontWeight: 700, fontSize: "0.85rem", cursor: "pointer", display: "inline-flex", alignItems: "center", gap: "0.4rem" }}>
              <Megaphone size={14} />
              Broadcasts
            </button>
          </Link>
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "2rem", alignItems: "start" }}>
          
          {/* Compose Form */}
          <div className="card" style={{ padding: "2rem" }}>
            <h2 style={{ fontSize: "1.2rem", fontWeight: 700, marginBottom: "1.5rem", display: "flex", alignItems: "center", gap: "0.5rem" }}>
              <Send size={18} className="text-orange-500" /> Compose Broadcast
            </h2>
            
            <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: "1.25rem" }}>
              
              <label style={{ fontSize: "0.85rem", color: "var(--text-muted)", display: "flex", flexDirection: "column", gap: "0.4rem" }}>
                Target Audience
                <select
                  value={form.targetAudience}
                  onChange={(e) => setForm({ ...form, targetAudience: e.target.value })}
                  style={{ padding: "0.75rem", borderRadius: "8px", background: "rgba(255,255,255,0.03)", border: "1px solid var(--border)", color: "var(--text)" }}
                >
                  <option value="all_users">Everyone (All Registered Users)</option>
                  <option value="free_tier">Free Tier Users Only (Great for upsells)</option>
                  <option value="premium">Premium Users Only (Sprint/Pro/Interview Pack)</option>
                </select>
              </label>

              <label style={{ fontSize: "0.85rem", color: "var(--text-muted)", display: "flex", flexDirection: "column", gap: "0.4rem" }}>
                Notification Type
                <select
                  value={form.type}
                  onChange={(e) => setForm({ ...form, type: e.target.value })}
                  style={{ padding: "0.75rem", borderRadius: "8px", background: "rgba(255,255,255,0.03)", border: "1px solid var(--border)", color: "var(--text)" }}
                >
                  <option value="info">General Info (Standard alert)</option>
                  <option value="promo">Promotional (Highlights as an offer)</option>
                  <option value="success">Success / Milestone</option>
                  <option value="warning">Warning (Upcoming changes)</option>
                  <option value="alert">Urgent Alert (Downtime/Maintenance)</option>
                </select>
              </label>

              <label style={{ fontSize: "0.85rem", color: "var(--text-muted)", display: "flex", flexDirection: "column", gap: "0.4rem" }}>
                Message Text (Max 250 chars recommended)
                <textarea
                  placeholder="E.g. We just launched a new AI Mock Interview feature! Try it out today."
                  required
                  rows={4}
                  value={form.message}
                  onChange={(e) => setForm({ ...form, message: e.target.value })}
                  style={{ padding: "0.75rem", borderRadius: "8px", background: "rgba(255,255,255,0.03)", border: "1px solid var(--border)", color: "var(--text)", resize: "vertical" }}
                />
              </label>

              <label style={{ fontSize: "0.85rem", color: "var(--text-muted)", display: "flex", flexDirection: "column", gap: "0.4rem" }}>
                Call to Action Link (Optional URL)
                <input
                  type="text"
                  placeholder="E.g. /dashboard/credits or https://your-site.com/promo"
                  value={form.link}
                  onChange={(e) => setForm({ ...form, link: e.target.value })}
                  style={{ padding: "0.75rem", borderRadius: "8px", background: "rgba(255,255,255,0.03)", border: "1px solid var(--border)", color: "var(--text)" }}
                />
              </label>

              <button 
                type="submit" 
                disabled={isSubmitting || !form.message} 
                className="btn-primary" 
                style={{ padding: "0.85rem", fontSize: "0.95rem", background: "var(--accent)", marginTop: "0.5rem" }}
              >
                {isSubmitting ? "Broadcasting..." : "Send Broadcast Now"}
              </button>

            </form>
          </div>

          {/* History */}
          <div className="card" style={{ padding: "2rem", display: "flex", flexDirection: "column", maxHeight: "600px" }}>
            <h2 style={{ fontSize: "1.2rem", fontWeight: 700, marginBottom: "1.5rem", display: "flex", alignItems: "center", gap: "0.5rem" }}>
              <Clock size={18} className="text-indigo-500" /> Recent Broadcasts
            </h2>
            
            <div style={{ flex: 1, overflowY: "auto", paddingRight: "0.5rem" }}>
              {loadingHistory ? (
                <div style={{ textAlign: "center", padding: "2rem 0", color: "var(--text-muted)" }}>Loading history...</div>
              ) : history.length === 0 ? (
                <div style={{ textAlign: "center", padding: "3rem 0", color: "var(--text-muted)", background: "rgba(255,255,255,0.02)", borderRadius: "12px", border: "1px dashed var(--border)" }}>
                  No previous broadcasts found.
                </div>
              ) : (
                <div style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
                  {history.map((item, i) => (
                    <div key={i} style={{ padding: "1rem", background: "rgba(255,255,255,0.02)", border: "1px solid var(--border)", borderRadius: "12px" }}>
                      <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "0.75rem" }}>
                        <span className={`tag ${getBadgeColor(item.type)}`} style={{ fontSize: "0.7rem", textTransform: "uppercase" }}>
                          {item.type}
                        </span>
                        <span style={{ fontSize: "0.75rem", color: "var(--text-muted)" }}>
                          {new Date(item.created_at).toLocaleString()}
                        </span>
                      </div>
                      <p style={{ fontSize: "0.9rem", color: "var(--text)", lineHeight: 1.5, margin: 0 }}>
                        {item.message}
                      </p>
                      {item.link && (
                        <div style={{ marginTop: "0.75rem", fontSize: "0.8rem" }}>
                          <a href={item.link} target="_blank" rel="noopener noreferrer" style={{ color: "var(--accent)", textDecoration: "none" }}>
                            🔗 {item.link}
                          </a>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}
