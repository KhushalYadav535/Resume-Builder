"use client";
import { useEffect, useState } from "react";
import Link from "next/link";
import Navbar from "@/components/Navbar";
import { useToast } from "@/components/ui/toast-1";
import { BarChart2, Users, Bot, Brain, CreditCard, Megaphone, Send, Clock } from "lucide-react";
import TabNavigation from "@/components/ui/TabNavigation";

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
    <div className="min-h-screen bg-[var(--bg-page)] text-[var(--text)] relative overflow-hidden transition-colors duration-300">
      {/* Premium background radial elements */}
      <div className="absolute top-20 right-10 w-96 h-96 bg-indigo-500/5 dark:bg-indigo-500/[0.03] rounded-full blur-3xl -z-10" />
      <div className="absolute bottom-20 left-10 w-96 h-96 bg-purple-500/5 dark:bg-purple-500/[0.03] rounded-full blur-3xl -z-10" />
      
      <div className="relative z-10">
        <Navbar />
        
        <main className="max-w-7xl mx-auto px-6 py-10 space-y-10">
          
          {/* Header */}
          <div className="space-y-2">
            <span className="text-[10px] font-bold text-indigo-600 dark:text-indigo-400 uppercase tracking-widest bg-indigo-500/10 px-3 py-1 rounded-full border border-indigo-500/20">
              System Directory
            </span>
            <h1 className="text-3xl md:text-4xl font-extrabold font-['Syne',sans-serif] tracking-tight flex items-center gap-2 mt-2">
              <Megaphone size={32} className="text-indigo-600 dark:text-indigo-400" />
              Global Broadcaster
            </h1>
            <p className="text-sm text-slate-600 dark:text-[#9ea3c8] max-w-2xl leading-relaxed">
              Send announcements, promotional offers, and urgent alerts directly to users' notification centers.
            </p>
          </div>

          {/* Navigation Tabs */}
          <TabNavigation activeTab="broadcast" />

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-start">
            
            {/* Compose Form */}
            <div className="p-6 md:p-8 rounded-2xl bg-white/80 dark:bg-slate-950/40 dark:bg-gradient-to-br dark:from-white/[0.05] dark:to-white/[0.01] border border-slate-200/60 dark:border-white/10 shadow-sm dark:shadow-xl space-y-6">
              <h2 className="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2 m-0 border-b border-slate-100 dark:border-white/5 pb-3">
                <Send size={18} className="text-indigo-600 dark:text-indigo-400" /> Compose Broadcast
              </h2>
              
              <form onSubmit={handleSubmit} className="space-y-4">
                
                <label className="text-xs font-bold text-slate-500 dark:text-[#9ea3c8] block space-y-1.5">
                  <span>Target Audience</span>
                  <select
                    value={form.targetAudience}
                    onChange={(e) => setForm({ ...form, targetAudience: e.target.value })}
                    className="px-3 py-2.5 rounded-lg bg-slate-50 dark:bg-white/5 border border-slate-200 dark:border-white/10 text-xs md:text-sm text-[var(--text)] outline-none w-full"
                  >
                    <option value="all_users">Everyone (All Registered Users)</option>
                    <option value="free_tier">Free Tier Users Only (Great for upsells)</option>
                    <option value="premium">Premium Users Only (Sprint/Pro/Interview Pack)</option>
                  </select>
                </label>

                <label className="text-xs font-bold text-slate-500 dark:text-[#9ea3c8] block space-y-1.5">
                  <span>Notification Type</span>
                  <select
                    value={form.type}
                    onChange={(e) => setForm({ ...form, type: e.target.value })}
                    className="px-3 py-2.5 rounded-lg bg-slate-50 dark:bg-white/5 border border-slate-200 dark:border-white/10 text-xs md:text-sm text-[var(--text)] outline-none w-full"
                  >
                    <option value="info">General Info (Standard alert)</option>
                    <option value="promo">Promotional (Highlights as an offer)</option>
                    <option value="success">Success / Milestone</option>
                    <option value="warning">Warning (Upcoming changes)</option>
                    <option value="alert">Urgent Alert (Downtime/Maintenance)</option>
                  </select>
                </label>

                <label className="text-xs font-bold text-slate-500 dark:text-[#9ea3c8] block space-y-1.5">
                  <span>Message Text (Max 250 chars recommended)</span>
                  <textarea
                    placeholder="E.g. We just launched a new AI Mock Interview feature! Try it out today."
                    required
                    rows={4}
                    value={form.message}
                    onChange={(e) => setForm({ ...form, message: e.target.value })}
                    className="px-3 py-2.5 rounded-lg bg-slate-50 dark:bg-white/5 border border-slate-200 dark:border-white/10 text-xs md:text-sm text-[var(--text)] outline-none w-full resize-y min-h-[100px]"
                  />
                </label>

                <label className="text-xs font-bold text-slate-500 dark:text-[#9ea3c8] block space-y-1.5">
                  <span>Call to Action Link (Optional URL)</span>
                  <input
                    type="text"
                    placeholder="E.g. /dashboard/credits or https://your-site.com/promo"
                    value={form.link}
                    onChange={(e) => setForm({ ...form, link: e.target.value })}
                    className="px-3 py-2.5 rounded-lg bg-slate-50 dark:bg-white/5 border border-slate-200 dark:border-white/10 text-xs md:text-sm text-[var(--text)] outline-none w-full"
                  />
                </label>

                <button 
                  type="submit" 
                  disabled={isSubmitting || !form.message} 
                  className="w-full py-3 bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs md:text-sm rounded-xl border-none cursor-pointer transition disabled:opacity-50 mt-2"
                >
                  {isSubmitting ? "Broadcasting..." : "Send Broadcast Now"}
                </button>

              </form>
            </div>

            {/* History */}
            <div className="p-6 md:p-8 rounded-2xl bg-white/80 dark:bg-slate-950/40 dark:bg-gradient-to-br dark:from-white/[0.05] dark:to-white/[0.01] border border-slate-200/60 dark:border-white/10 shadow-sm dark:shadow-xl flex flex-col max-h-[620px]">
              <h2 className="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2 m-0 border-b border-slate-100 dark:border-white/5 pb-3">
                <Clock size={18} className="text-indigo-600 dark:text-indigo-400" /> Recent Broadcasts
              </h2>
              
              <div className="flex-1 overflow-y-auto pr-1 space-y-4 mt-4 no-scrollbar">
                {loadingHistory ? (
                  <div className="text-center py-8 text-slate-400 dark:text-gray-500 text-xs">Loading history...</div>
                ) : history.length === 0 ? (
                  <div className="py-12 text-center text-slate-500 dark:text-gray-400 border border-dashed border-slate-200 dark:border-white/5 rounded-xl text-xs md:text-sm">
                    No previous broadcasts found.
                  </div>
                ) : (
                  <div className="space-y-4">
                    {history.map((item, i) => (
                      <div key={i} className="p-4 rounded-xl bg-indigo-50/50 dark:bg-indigo-500/[0.02] border border-indigo-100 dark:border-indigo-500/10 space-y-3">
                        <div className="flex justify-between items-center">
                          <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider ${
                            item.type === "promo" 
                              ? "bg-purple-500/10 text-purple-600 dark:text-purple-400 border border-purple-500/20" 
                              : item.type === "alert" 
                                ? "bg-rose-500/10 text-rose-600 dark:text-rose-400 border border-rose-500/20" 
                                : item.type === "warning" 
                                  ? "bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20" 
                                  : item.type === "success" 
                                    ? "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20" 
                                    : "bg-slate-100 dark:bg-white/5 text-slate-500 dark:text-gray-400 border border-slate-200/40 dark:border-white/5"
                          }`}>
                            {item.type}
                          </span>
                          <span className="text-[10px] text-slate-400 dark:text-gray-500">
                            {new Date(item.created_at).toLocaleString()}
                          </span>
                        </div>
                        <p className="text-xs md:text-sm text-slate-800 dark:text-[#e8e9f5] leading-relaxed m-0">
                          {item.message}
                        </p>
                        {item.link && (
                          <div className="text-[11px] font-mono">
                            <a href={item.link} target="_blank" rel="noopener noreferrer" className="text-indigo-600 dark:text-indigo-400 hover:underline">
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
        </main>
      </div>
    </div>
  );
}
