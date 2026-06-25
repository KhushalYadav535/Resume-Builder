"use client";
import { useEffect, useState } from "react";
import Link from "next/link";
import Navbar from "@/components/Navbar";
import { useAuth } from "@/hooks/useAuth";
import { createClient } from "@/utils/supabase/client";

export default function AdminKeywordsPage() {
  const { user, loading: authLoading } = useAuth();
  const [isAdmin, setIsAdmin] = useState<boolean | null>(null);
  const [activeTab, setActiveTab] = useState<"scan" | "pending" | "active">("scan");

  const [scanIndustry, setScanIndustry] = useState("software_engineering");
  const [scanLoading, setScanLoading] = useState(false);
  const [scanResults, setScanResults] = useState<any[]>([]);

  const [pendingKeywords, setPendingKeywords] = useState<any[]>([]);
  const [pendingLoading, setPendingLoading] = useState(false);

  const [activeKeywords, setActiveKeywords] = useState<any>({});
  const [activeLoading, setActiveLoading] = useState(false);
  
  const supabase = createClient();

  useEffect(() => {
    if (user) {
      supabase.from('user_profiles').select('role').eq('id', user.id).single()
        .then(({data}) => {
          setIsAdmin(data?.role === 'admin');
        });
    }
  }, [user]);

  const fetchPending = async () => {
    setPendingLoading(true);
    const { data } = await supabase.from('pending_keywords').select('*').eq('status', 'pending').order('created_at', { ascending: false });
    setPendingKeywords(data || []);
    setPendingLoading(false);
  };

  const fetchActive = async () => {
    setActiveLoading(true);
    const res = await fetch("/api/admin/keywords-active");
    if (res.ok) {
      const { data } = await res.json();
      setActiveKeywords(data || {});
    }
    setActiveLoading(false);
  };

  useEffect(() => {
    if (isAdmin) {
      if (activeTab === "pending") fetchPending();
      if (activeTab === "active") fetchActive();
    }
  }, [activeTab, isAdmin]);

  const runAIScanner = async () => {
    setScanLoading(true);
    try {
      const res = await fetch("/api/admin/keyword-suggestions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ industry: scanIndustry })
      });
      const data = await res.json();
      if (res.ok && data.success) {
        setScanResults(data.suggestions || []);
        alert("Found " + (data.suggestions?.length || 0) + " new suggestions!");
      } else {
        alert("Failed to scan: " + data.error);
      }
    } catch (e) {
      alert("Error running scan");
    }
    setScanLoading(false);
  };

  const handleAction = async (id: string, action: 'approve' | 'reject', source: 'scan' | 'pending') => {
    try {
      const res = await fetch("/api/admin/keyword-approve", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ keywordId: id, action })
      });
      if (res.ok) {
        if (source === 'scan') {
          setScanResults(prev => prev.filter(k => k.id !== id));
        } else {
          setPendingKeywords(prev => prev.filter(k => k.id !== id));
        }
        alert(`Successfully ${action}d!`);
      } else {
        alert(`Failed to ${action}`);
      }
    } catch (e) {
      alert("Error performing action");
    }
  };

  const handleApproveAllPending = async () => {
    if (!confirm("Are you sure you want to approve all pending keywords?")) return;
    setPendingLoading(true);
    let successCount = 0;
    for (const kw of pendingKeywords) {
      try {
        const res = await fetch("/api/admin/keyword-approve", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ keywordId: kw.id, action: 'approve' })
        });
        if (res.ok) successCount++;
      } catch (e) {
        console.error("Failed to approve keyword:", kw.id);
      }
    }
    alert(`Successfully approved ${successCount} out of ${pendingKeywords.length} keywords.`);
    fetchPending();
  };

  if (authLoading || isAdmin === null) return <div style={{ minHeight: "100vh", background: "var(--bg)", display: "flex", alignItems: "center", justifyContent: "center" }}><div className="spinner" style={{ width: 32, height: 32 }} /></div>;

  if (isAdmin === false) return <div style={{ minHeight: "100vh", background: "var(--bg)" }}><Navbar /><div style={{ textAlign: "center", padding: "6rem" }}><h3>Forbidden: Admins only</h3></div></div>;

  return (
    <div style={{ minHeight: "100vh", background: "var(--bg)" }}>
      <Navbar />
      <div style={{ maxWidth: "1200px", margin: "0 auto", padding: "2rem" }}>
        <div style={{ marginBottom: "2rem" }}>
          <p className="section-label" style={{ marginBottom: "0.5rem" }}>System Performance Monitor</p>
          <h1 style={{ fontFamily: "Syne, sans-serif", fontSize: "2.2rem", fontWeight: 800 }}>
            🛡️ Administrative Dashboard
          </h1>
          <p style={{ color: "var(--text-muted)", fontSize: "0.9rem", marginTop: "0.25rem" }}>
            Real-time platform statistics, user roles management, and OpenRouter API diagnostics.
          </p>
        </div>

        {/* Navigation Tabs */}
        <div style={{ display: "flex", gap: "0.5rem", borderBottom: "1px solid var(--border)", marginBottom: "2rem", overflowX: "auto", whiteSpace: "nowrap" }}>
          <Link href="/admin" style={{ textDecoration: "none" }}>
            <button style={{ padding: "0.6rem 1.2rem", background: "transparent", border: "none", color: "var(--text-muted)", fontWeight: 600, fontSize: "0.85rem", cursor: "pointer" }}>
              📊 Analytics Overview
            </button>
          </Link>
          <Link href="/admin/users" style={{ textDecoration: "none" }}>
            <button style={{ padding: "0.6rem 1.2rem", background: "transparent", border: "none", color: "var(--text-muted)", fontWeight: 600, fontSize: "0.85rem", cursor: "pointer" }}>
              👥 User Management
            </button>
          </Link>
          <Link href="/admin/ai-usage" style={{ textDecoration: "none" }}>
            <button style={{ padding: "0.6rem 1.2rem", background: "transparent", border: "none", color: "var(--text-muted)", fontWeight: 600, fontSize: "0.85rem", cursor: "pointer" }}>
              🤖 AI Usage Log
            </button>
          </Link>
          <Link href="/admin/keywords" style={{ textDecoration: "none" }}>
            <button style={{ padding: "0.6rem 1.2rem", background: "rgba(108,99,255,0.08)", border: "none", borderBottom: "2px solid var(--accent)", color: "var(--accent)", fontWeight: 700, fontSize: "0.85rem", cursor: "pointer" }}>
              🧠 ATS Keywords
            </button>
          </Link>
        </div>

        <h2 style={{ fontFamily: "Syne, sans-serif", fontSize: "1.6rem", fontWeight: 700, marginBottom: "1rem" }}>
          ATS Market Intelligence Admin
        </h2>
        
        {/* Sub Tabs */}
        <div style={{ display: "flex", gap: "1rem", borderBottom: "1px solid var(--border)", marginBottom: "2rem" }}>
          {[
            { key: "scan", label: "AI Scanner" },
            { key: "pending", label: "Pending Queue" },
            { key: "active", label: "Active Dictionary" },
          ].map(tab => (
            <button 
              key={tab.key}
              onClick={() => setActiveTab(tab.key as any)}
              style={{
                background: "transparent", border: "none",
                borderBottom: activeTab === tab.key ? "2px solid var(--accent)" : "2px solid transparent",
                color: activeTab === tab.key ? "var(--text)" : "var(--text-muted)",
                padding: "0.8rem 1rem", fontSize: "0.9rem", fontWeight: 600, cursor: "pointer"
              }}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Tab 1: AI Scanner */}
        {activeTab === "scan" && (
          <div className="card" style={{ padding: "2rem" }}>
            <h2 style={{ fontSize: "1.2rem", marginBottom: "1rem" }}>Discover New Market Trends</h2>
            <div style={{ display: "flex", gap: "1rem", marginBottom: "2rem", flexWrap: "wrap" }}>
              <select className="input" style={{ width: "300px" }} value={scanIndustry} onChange={e => setScanIndustry(e.target.value)}>
                <option value="software_engineering">Software Engineering</option>
                <option value="ai_engineering">AI Engineering</option>
                <option value="data_science">Data Science</option>
                <option value="finance">Finance</option>
                <option value="marketing">Marketing</option>
                <option value="product_management">Product Management</option>
                <option value="general">General</option>
              </select>
              <button className="btn-primary" onClick={runAIScanner} disabled={scanLoading}>
                {scanLoading ? "Scanning..." : "Run AI Scan"}
              </button>
            </div>

            {scanResults.length > 0 && (
              <div style={{ display: "grid", gap: "1rem", gridTemplateColumns: "repeat(auto-fill, minmax(300px, 1fr))" }}>
                {scanResults.map((kw, i) => (
                  <div key={kw.id || i} style={{ padding: "1.2rem", border: "1px solid var(--border)", borderRadius: "8px", background: "var(--bg-2)" }}>
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "start", marginBottom: "0.5rem" }}>
                      <strong style={{ fontSize: "1.1rem" }}>{kw.keyword}</strong>
                      <span className="tag tag-purple">Weight: {kw.weight}</span>
                    </div>
                    <p style={{ fontSize: "0.8rem", color: "var(--text-muted)", marginBottom: "1rem" }}>
                      Aliases: {kw.aliases?.join(', ') || 'None'}
                    </p>
                    {kw.id && (
                      <div style={{ display: "flex", gap: "0.5rem" }}>
                        <button className="btn-primary" style={{ padding: "0.4rem 0.8rem", fontSize: "0.8rem", flex: 1, background: "#43e97b", color: "#000", border: "none" }} onClick={() => handleAction(kw.id, 'approve', 'scan')}>Approve</button>
                        <button className="btn-secondary" style={{ padding: "0.4rem 0.8rem", fontSize: "0.8rem", flex: 1, borderColor: "#ff6584", color: "#ff6584" }} onClick={() => handleAction(kw.id, 'reject', 'scan')}>Reject</button>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Tab 2: Pending Queue */}
        {activeTab === "pending" && (
          <div className="card" style={{ padding: "2rem" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "1rem" }}>
              <h2 style={{ fontSize: "1.2rem", margin: 0 }}>Pending Keyword Queue</h2>
              {pendingKeywords.length > 0 && (
                <button 
                  className="btn-primary" 
                  style={{ padding: "0.5rem 1rem", fontSize: "0.85rem", background: "#43e97b", color: "#000", border: "none" }} 
                  onClick={handleApproveAllPending}
                  disabled={pendingLoading}
                >
                  {pendingLoading ? "Processing..." : "Approve All"}
                </button>
              )}
            </div>
            {pendingLoading ? <p>Loading...</p> : pendingKeywords.length === 0 ? <p>No pending keywords.</p> : (
              <div style={{ display: "grid", gap: "1rem" }}>
                {pendingKeywords.map(kw => (
                  <div key={kw.id} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "1rem", border: "1px solid var(--border)", borderRadius: "8px", background: "var(--bg-2)" }}>
                    <div>
                      <strong>{kw.keyword}</strong> <span style={{ color: "var(--text-muted)", fontSize: "0.85rem", marginLeft: "0.5rem" }}>({kw.industry}) - Weight: {kw.weight}</span>
                      <div style={{ fontSize: "0.8rem", color: "var(--text-muted)", marginTop: "0.3rem" }}>Aliases: {kw.aliases?.join(', ') || 'None'}</div>
                    </div>
                    <div style={{ display: "flex", gap: "0.5rem" }}>
                      <button className="btn-primary" style={{ padding: "0.4rem 0.8rem", fontSize: "0.8rem", background: "#43e97b", color: "#000", border: "none" }} onClick={() => handleAction(kw.id, 'approve', 'pending')}>Approve</button>
                      <button className="btn-secondary" style={{ padding: "0.4rem 0.8rem", fontSize: "0.8rem", borderColor: "#ff6584", color: "#ff6584" }} onClick={() => handleAction(kw.id, 'reject', 'pending')}>Reject</button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Tab 3: Active Dictionary */}
        {activeTab === "active" && (
          <div className="card" style={{ padding: "2rem" }}>
            <h2 style={{ fontSize: "1.2rem", marginBottom: "1rem" }}>Active Dictionary Map</h2>
            {activeLoading ? <p>Loading...</p> : (
              <div style={{ display: "flex", flexDirection: "column", gap: "2rem" }}>
                {Object.entries(activeKeywords).map(([industry, kws]: any) => (
                  <div key={industry}>
                    <h3 style={{ textTransform: "capitalize", fontSize: "1.1rem", marginBottom: "0.8rem", borderBottom: "1px solid var(--border)", paddingBottom: "0.5rem" }}>{industry.replace('_', ' ')}</h3>
                    <div style={{ display: "flex", flexWrap: "wrap", gap: "0.5rem" }}>
                      {kws.base?.map((k: any, i: number) => (
                        <span key={'base-'+i} className="tag tag-purple" style={{ fontSize: "0.8rem" }}>{k.keyword} ({k.weight})</span>
                      ))}
                      {kws.dynamic?.map((k: any, i: number) => {
                        const isExpired = k.expires_on && new Date(k.expires_on) < new Date();
                        const isActive = k.is_active !== false && !isExpired;
                        return (
                          <span key={'dyn-'+i} className="tag" style={{ fontSize: "0.8rem", background: isActive ? "rgba(67, 233, 123, 0.15)" : "rgba(255, 101, 132, 0.15)", color: isActive ? "#43e97b" : "#ff6584" }}>
                            {k.keyword} ({k.weight}) {isActive ? '✓' : '✗'}
                          </span>
                        );
                      })}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
