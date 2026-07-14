"use client";
import { useEffect, useState, useCallback } from "react";
import Link from "next/link";
import Navbar from "@/components/Navbar";
import { useAuth } from "@/hooks/useAuth";
import { createClient } from "@/utils/supabase/client";
import { ConfirmationModal } from "@/components/ui/ConfirmationModal";
import { useToast } from "@/components/ui/toast-1";
import {
  ShieldCheck, BarChart2, Users, Bot, Brain,
  Plus, Trash2, Edit3, Check, X, ChevronDown, ChevronRight,
  Search, Layers, RefreshCw, Tag, Save, PlusCircle, FolderPlus
} from "lucide-react";

const WEIGHT_COLORS: Record<number, string> = {
  10: "#43e97b", 9: "#43e97b", 8: "#6defa9",
  7: "#f6d365", 6: "#f6d365", 5: "#f6d365",
  4: "#ff8fa3", 3: "#ff6584", 2: "#ff6584", 1: "#ff6584",
};

interface Keyword { keyword: string; weight: number; aliases: string[]; is_active?: boolean; expires_on?: string; }
interface CategoryData { base: Keyword[]; dynamic: Keyword[]; displayName: string; }

export default function AdminKeywordsPage() {
  const { user, loading: authLoading } = useAuth();
  const { showToast } = useToast();
  const [isAdmin, setIsAdmin] = useState<boolean | null>(null);
  const [mainTab, setMainTab] = useState<"scanner" | "manage" | "create">("manage");
  const [manageSubTab, setManageSubTab] = useState<"base" | "dynamic">("base");

  // ─── Scanner Tab ───────────────────────────────────────────────────────────
  const [scanIndustry, setScanIndustry] = useState("software_engineering");
  const [scanLoading, setScanLoading] = useState(false);
  const [scanResults, setScanResults] = useState<any[]>([]);
  const [approveAllConfirmOpen, setApproveAllConfirmOpen] = useState(false);
  const [pendingKeywords, setPendingKeywords] = useState<any[]>([]);
  const [pendingLoading, setPendingLoading] = useState(false);
  const [scannerSubTab, setScannerSubTab] = useState<"scan" | "pending">("scan");

  // ─── Manage Tab ────────────────────────────────────────────────────────────
  const [allCategories, setAllCategories] = useState<Record<string, CategoryData>>({});
  const [catLoading, setCatLoading] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<string>("");
  const [kwSearch, setKwSearch] = useState("");

  // Add keyword inline
  const [addingKw, setAddingKw] = useState(false);
  const [newKwKeyword, setNewKwKeyword] = useState("");
  const [newKwWeight, setNewKwWeight] = useState(7);
  const [newKwAliases, setNewKwAliases] = useState("");
  const [newKwSaving, setNewKwSaving] = useState(false);

  // Edit keyword inline
  const [editingKw, setEditingKw] = useState<{ keyword: string; layer: "base" | "dynamic" } | null>(null);
  const [editKwKeyword, setEditKwKeyword] = useState("");
  const [editKwWeight, setEditKwWeight] = useState(7);
  const [editKwAliases, setEditKwAliases] = useState("");
  const [editKwSaving, setEditKwSaving] = useState(false);

  // Delete confirm
  const [deleteConfirm, setDeleteConfirm] = useState<{ keyword: string; layer: "base" | "dynamic" } | null>(null);

  // ─── Create Category Tab ────────────────────────────────────────────────────
  const [newCatSlug, setNewCatSlug] = useState("");
  const [newCatDisplay, setNewCatDisplay] = useState("");
  const [newCatKeywordsRaw, setNewCatKeywordsRaw] = useState(
    "React,9,ReactJS,React.js\nNode.js,8,NodeJS,Express\nTypeScript,9,TS"
  );
  const [createCatLoading, setCreateCatLoading] = useState(false);

  const supabase = createClient();

  useEffect(() => {
    if (user) {
      supabase.from("user_profiles").select("role").eq("id", user.id).single()
        .then(({ data }) => setIsAdmin(data?.role === "admin"));
    }
  }, [user]);

  // ─── Fetch all categories ──────────────────────────────────────────────────
  const fetchCategories = useCallback(async () => {
    setCatLoading(true);
    try {
      const res = await fetch("/api/admin/keywords-active");
      if (res.ok) {
        const { data } = await res.json();
        setAllCategories(data || {});
        if (!selectedCategory && Object.keys(data || {}).length > 0) {
          setSelectedCategory(Object.keys(data)[0]);
        }
      }
    } catch (e) { showToast("Failed to load categories", "error"); }
    setCatLoading(false);
  }, [selectedCategory]);

  useEffect(() => {
    if (isAdmin) {
      fetchCategories();
      if (scannerSubTab === "pending") fetchPending();
    }
  }, [isAdmin]);

  useEffect(() => {
    if (isAdmin && scannerSubTab === "pending") fetchPending();
  }, [scannerSubTab, isAdmin]);

  const fetchPending = async () => {
    setPendingLoading(true);
    const { data } = await supabase.from("pending_keywords").select("*").eq("status", "pending").order("created_at", { ascending: false });
    setPendingKeywords(data || []);
    setPendingLoading(false);
  };

  // ─── Scanner actions ───────────────────────────────────────────────────────
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
        showToast("Found " + (data.suggestions?.length || 0) + " suggestions!", "success");
      } else showToast("Scan failed: " + data.error, "error");
    } catch { showToast("Error running scan", "error"); }
    setScanLoading(false);
  };

  const handleAction = async (id: string, action: "approve" | "reject", source: "scan" | "pending") => {
    const res = await fetch("/api/admin/keyword-approve", {
      method: "POST", headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ keywordId: id, action })
    });
    if (res.ok) {
      if (source === "scan") setScanResults(prev => prev.filter(k => k.id !== id));
      else setPendingKeywords(prev => prev.filter(k => k.id !== id));
      if (action === "approve") { fetchCategories(); }
      showToast(`${action === "approve" ? "Approved ✓" : "Rejected"}`, "success");
    } else showToast("Action failed", "error");
  };

  const executeApproveAllPending = async () => {
    setPendingLoading(true);
    let ok = 0;
    for (const kw of pendingKeywords) {
      const res = await fetch("/api/admin/keyword-approve", {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ keywordId: kw.id, action: "approve" })
      });
      if (res.ok) ok++;
    }
    showToast(`Approved ${ok}/${pendingKeywords.length}`, "success");
    fetchPending(); fetchCategories();
  };

  // ─── Keyword CRUD ──────────────────────────────────────────────────────────
  const handleAddKeyword = async () => {
    if (!newKwKeyword.trim() || !selectedCategory) return;
    setNewKwSaving(true);
    const res = await fetch("/api/admin/keyword-base-add", {
      method: "POST", headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ industry: selectedCategory, keyword: newKwKeyword.trim(), weight: newKwWeight, aliases: newKwAliases })
    });
    const data = await res.json();
    if (res.ok) {
      showToast(`✅ '${newKwKeyword}' added!`, "success");
      setNewKwKeyword(""); setNewKwAliases(""); setNewKwWeight(7); setAddingKw(false);
      fetchCategories();
    } else showToast(data.error || "Failed to add keyword", "error");
    setNewKwSaving(false);
  };

  const startEdit = (kw: Keyword, layer: "base" | "dynamic") => {
    setEditingKw({ keyword: kw.keyword, layer });
    setEditKwKeyword(kw.keyword);
    setEditKwWeight(kw.weight);
    setEditKwAliases((kw.aliases || []).join(", "));
  };

  const handleEditKeyword = async () => {
    if (!editingKw || !selectedCategory) return;
    setEditKwSaving(true);
    const res = await fetch("/api/admin/keyword-base-edit", {
      method: "POST", headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        industry: selectedCategory,
        originalKeyword: editingKw.keyword,
        updated: { keyword: editKwKeyword, weight: editKwWeight, aliases: editKwAliases }
      })
    });
    const data = await res.json();
    if (res.ok) {
      showToast("✅ Keyword updated!", "success");
      setEditingKw(null); fetchCategories();
    } else showToast(data.error || "Edit failed", "error");
    setEditKwSaving(false);
  };

  const handleDeleteKeyword = async () => {
    if (!deleteConfirm || !selectedCategory) return;
    const res = await fetch("/api/admin/keyword-delete", {
      method: "POST", headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ industry: selectedCategory, keyword: deleteConfirm.keyword, layer: deleteConfirm.layer })
    });
    const data = await res.json();
    if (res.ok) {
      showToast(`🗑️ '${deleteConfirm.keyword}' deleted`, "success");
      setDeleteConfirm(null); fetchCategories();
    } else showToast(data.error || "Delete failed", "error");
  };

  // ─── Create Category ───────────────────────────────────────────────────────
  const handleCreateCategory = async () => {
    if (!newCatSlug.trim() || !newCatDisplay.trim()) {
      showToast("Please fill in category slug and display name", "error"); return;
    }
    setCreateCatLoading(true);

    // Parse keywords from textarea: "keyword,weight,alias1,alias2" per line
    const keywords = newCatKeywordsRaw.split("\n")
      .map(line => line.trim()).filter(Boolean)
      .map(line => {
        const parts = line.split(",");
        return {
          keyword: parts[0]?.trim() || "",
          weight: parseInt(parts[1]?.trim()) || 7,
          aliases: parts.slice(2).map(a => a.trim()).filter(Boolean),
        };
      }).filter(k => k.keyword);

    const res = await fetch("/api/admin/category-create", {
      method: "POST", headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name: newCatSlug, displayName: newCatDisplay, keywords })
    });
    const data = await res.json();
    if (res.ok) {
      showToast(`🎉 Category '${data.category.displayName}' created with ${data.category.keywordCount} keywords!`, "success");
      setNewCatSlug(""); setNewCatDisplay(""); setNewCatKeywordsRaw("Keyword Name,8,Alias1,Alias2");
      setSelectedCategory(data.category.slug);
      setMainTab("manage");
      fetchCategories();
    } else showToast(data.error || "Failed to create category", "error");
    setCreateCatLoading(false);
  };

  // ─── Derived ───────────────────────────────────────────────────────────────
  const catData = selectedCategory ? allCategories[selectedCategory] : null;
  const allCatKeys = Object.keys(allCategories).sort();
  const filteredKeywords = catData
    ? (manageSubTab === "base" ? catData.base : catData.dynamic).filter(k =>
        !kwSearch || k.keyword.toLowerCase().includes(kwSearch.toLowerCase()) ||
        k.aliases?.some(a => a.toLowerCase().includes(kwSearch.toLowerCase()))
      )
    : [];

  if (authLoading || isAdmin === null) return (
    <div style={{ minHeight: "100vh", background: "var(--bg)", display: "flex", alignItems: "center", justifyContent: "center" }}>
      <div className="spinner" style={{ width: 32, height: 32 }} />
    </div>
  );

  if (isAdmin === false) return (
    <div style={{ minHeight: "100vh", background: "var(--bg)" }}>
      <Navbar />
      <div style={{ textAlign: "center", padding: "6rem" }}>
        <h3 style={{ fontFamily: "Syne, sans-serif" }}>🔒 Forbidden: Admins only</h3>
      </div>
    </div>
  );

  return (
    <div style={{ minHeight: "100vh", background: "var(--bg)" }}>
      <Navbar />
      <div style={{ maxWidth: "1400px", margin: "0 auto", padding: "2rem" }}>
        
        {/* Page Header */}
        <div style={{ marginBottom: "1.5rem" }}>
          <p className="section-label" style={{ marginBottom: "0.3rem" }}>Admin Panel</p>
          <h1 style={{ fontFamily: "Syne, sans-serif", fontSize: "2rem", fontWeight: 800, display: "inline-flex", alignItems: "center", gap: "0.5rem", margin: 0 }}>
            <Brain size={28} className="text-indigo-500" />
            ATS Keyword Management
          </h1>
          <p style={{ color: "var(--text-muted)", fontSize: "0.88rem", marginTop: "0.3rem" }}>
            Manage ATS categories, add/edit/delete keywords, create new industries, and run AI scans.
          </p>
        </div>

        {/* Admin Nav */}
        <div style={{ display: "flex", gap: "0.5rem", borderBottom: "1px solid var(--border)", marginBottom: "2rem", overflowX: "auto", whiteSpace: "nowrap" }}>
          {[
            { href: "/admin", icon: <BarChart2 size={14} />, label: "Analytics" },
            { href: "/admin/users", icon: <Users size={14} />, label: "Users" },
            { href: "/admin/ai-usage", icon: <Bot size={14} />, label: "AI Usage" },
            { href: "/admin/keywords", icon: <Brain size={14} />, label: "ATS Keywords", active: true },
          ].map(tab => (
            <Link key={tab.href} href={tab.href} style={{ textDecoration: "none" }}>
              <button style={{
                padding: "0.6rem 1.2rem", background: tab.active ? "rgba(108,99,255,0.08)" : "transparent",
                border: "none", borderBottom: tab.active ? "2px solid var(--accent)" : "2px solid transparent",
                color: tab.active ? "var(--accent)" : "var(--text-muted)",
                fontWeight: tab.active ? 700 : 600, fontSize: "0.85rem", cursor: "pointer",
                display: "inline-flex", alignItems: "center", gap: "0.4rem"
              }}>
                {tab.icon}{tab.label}
              </button>
            </Link>
          ))}
        </div>

        {/* Main Tabs */}
        <div style={{ display: "flex", gap: "0.5rem", marginBottom: "1.5rem", flexWrap: "wrap" }}>
          {[
            { key: "manage", icon: <Layers size={15} />, label: "Manage Keywords" },
            { key: "create", icon: <FolderPlus size={15} />, label: "Add New Category" },
            { key: "scanner", icon: <Brain size={15} />, label: "AI Scanner" },
          ].map(t => (
            <button key={t.key} onClick={() => setMainTab(t.key as any)} style={{
              padding: "0.55rem 1.1rem", borderRadius: "10px", border: "1px solid",
              borderColor: mainTab === t.key ? "var(--accent)" : "var(--border)",
              background: mainTab === t.key ? "rgba(108,99,255,0.12)" : "var(--bg-2)",
              color: mainTab === t.key ? "var(--accent)" : "var(--text-muted)",
              fontWeight: mainTab === t.key ? 700 : 500, fontSize: "0.88rem",
              cursor: "pointer", display: "inline-flex", alignItems: "center", gap: "0.4rem",
              transition: "all 0.15s"
            }}>
              {t.icon}{t.label}
            </button>
          ))}
        </div>

        {/* ═══════════════════ TAB: MANAGE KEYWORDS ═══════════════════════════ */}
        {mainTab === "manage" && (
          <div style={{ display: "grid", gridTemplateColumns: "260px 1fr", gap: "1.5rem", alignItems: "start" }}>
            
            {/* Left: Category Sidebar */}
            <div className="card" style={{ padding: "1rem" }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "0.8rem" }}>
                <strong style={{ fontSize: "0.85rem", color: "var(--text-muted)", textTransform: "uppercase", letterSpacing: "0.05em" }}>
                  Categories ({allCatKeys.length})
                </strong>
                <button onClick={fetchCategories} disabled={catLoading} style={{ background: "none", border: "none", cursor: "pointer", color: "var(--text-muted)", padding: "0.2rem" }}>
                  <RefreshCw size={13} className={catLoading ? "animate-spin" : ""} />
                </button>
              </div>
              <div style={{ display: "flex", flexDirection: "column", gap: "0.25rem", maxHeight: "70vh", overflowY: "auto" }}>
                {allCatKeys.map(key => {
                  const d = allCategories[key];
                  const isActive = selectedCategory === key;
                  return (
                    <button key={key} onClick={() => { setSelectedCategory(key); setKwSearch(""); setAddingKw(false); setEditingKw(null); }}
                      style={{
                        background: isActive ? "rgba(108,99,255,0.12)" : "transparent",
                        border: isActive ? "1px solid var(--accent)" : "1px solid transparent",
                        borderRadius: "8px", padding: "0.6rem 0.75rem", textAlign: "left",
                        cursor: "pointer", transition: "all 0.12s", color: isActive ? "var(--accent)" : "var(--text)",
                        display: "flex", justifyContent: "space-between", alignItems: "center", gap: "0.4rem"
                      }}>
                      <span style={{ fontSize: "0.83rem", fontWeight: isActive ? 700 : 500 }}>
                        {d.displayName}
                      </span>
                      <span style={{ fontSize: "0.72rem", background: "var(--bg-3)", borderRadius: "4px", padding: "1px 5px", color: "var(--text-muted)", flexShrink: 0 }}>
                        {(d.base?.length || 0) + (d.dynamic?.length || 0)}
                      </span>
                    </button>
                  );
                })}
                <button onClick={() => setMainTab("create")} style={{
                  background: "rgba(16,185,129,0.06)", border: "1px dashed rgba(16,185,129,0.3)",
                  borderRadius: "8px", padding: "0.6rem 0.75rem", textAlign: "left", cursor: "pointer",
                  color: "#10b981", fontSize: "0.83rem", display: "flex", alignItems: "center", gap: "0.4rem", marginTop: "0.3rem"
                }}>
                  <Plus size={13} /> Add New Category
                </button>
              </div>
            </div>

            {/* Right: Keyword Editor */}
            <div style={{ display: "grid", gap: "1rem" }}>
              {!catData ? (
                <div className="card" style={{ padding: "3rem", textAlign: "center", color: "var(--text-muted)" }}>
                  {catLoading ? <div className="spinner" style={{ margin: "0 auto" }} /> : "Select a category to manage keywords."}
                </div>
              ) : (
                <>
                  {/* Category Header */}
                  <div className="card" style={{ padding: "1.2rem 1.5rem", display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: "1rem" }}>
                    <div>
                      <h2 style={{ fontFamily: "Syne, sans-serif", fontSize: "1.3rem", fontWeight: 800, margin: 0 }}>
                        {catData.displayName}
                      </h2>
                      <p style={{ color: "var(--text-muted)", fontSize: "0.82rem", margin: "0.2rem 0 0" }}>
                        <span className="tag tag-purple" style={{ fontSize: "0.72rem" }}>{catData.base.length} base</span>
                        {" "}
                        <span className="tag" style={{ fontSize: "0.72rem", background: "rgba(67,233,123,0.12)", color: "#43e97b" }}>{catData.dynamic.length} dynamic</span>
                      </p>
                    </div>
                    <div style={{ display: "flex", gap: "0.5rem" }}>
                      <div style={{ position: "relative" }}>
                        <Search size={14} style={{ position: "absolute", left: "0.6rem", top: "50%", transform: "translateY(-50%)", color: "var(--text-muted)", pointerEvents: "none" }} />
                        <input
                          className="input" placeholder="Search keywords..."
                          value={kwSearch} onChange={e => setKwSearch(e.target.value)}
                          style={{ paddingLeft: "2rem", height: "36px", fontSize: "0.83rem", width: "180px" }}
                        />
                      </div>
                      <button onClick={() => { setAddingKw(true); setEditingKw(null); }} className="btn-primary"
                        style={{ padding: "0.45rem 1rem", fontSize: "0.82rem", display: "inline-flex", alignItems: "center", gap: "0.3rem" }}>
                        <Plus size={13} /> Add Keyword
                      </button>
                    </div>
                  </div>

                  {/* Sub-tab: base / dynamic */}
                  <div style={{ display: "flex", gap: "0.5rem" }}>
                    {(["base", "dynamic"] as const).map(tab => (
                      <button key={tab} onClick={() => setManageSubTab(tab)} style={{
                        padding: "0.4rem 1rem", borderRadius: "8px", border: "1px solid",
                        borderColor: manageSubTab === tab ? "var(--accent)" : "var(--border)",
                        background: manageSubTab === tab ? "rgba(108,99,255,0.1)" : "var(--bg-2)",
                        color: manageSubTab === tab ? "var(--accent)" : "var(--text-muted)",
                        fontSize: "0.82rem", fontWeight: manageSubTab === tab ? 700 : 500, cursor: "pointer"
                      }}>
                        {tab === "base" ? `📘 Base (${catData.base.length})` : `⚡ Dynamic (${catData.dynamic.length})`}
                      </button>
                    ))}
                  </div>

                  {/* Add Keyword Form */}
                  {addingKw && (
                    <div className="card" style={{ padding: "1.2rem", background: "rgba(108,99,255,0.04)", border: "1px solid rgba(108,99,255,0.2)", display: "grid", gap: "0.75rem" }}>
                      <h4 style={{ margin: 0, fontSize: "0.92rem", fontWeight: 700, display: "flex", alignItems: "center", gap: "0.4rem" }}>
                        <PlusCircle size={15} className="text-indigo-400" /> Add New Keyword to {catData.displayName}
                      </h4>
                      <div style={{ display: "grid", gridTemplateColumns: "1fr 120px", gap: "0.6rem" }}>
                        <input className="input" placeholder="Keyword name *" value={newKwKeyword} onChange={e => setNewKwKeyword(e.target.value)}
                          onKeyDown={e => e.key === "Enter" && handleAddKeyword()} autoFocus style={{ height: "40px" }} />
                        <div style={{ display: "flex", alignItems: "center", gap: "0.4rem" }}>
                          <span style={{ fontSize: "0.78rem", color: "var(--text-muted)", flexShrink: 0 }}>Weight:</span>
                          <input type="number" min={1} max={10} className="input" value={newKwWeight}
                            onChange={e => setNewKwWeight(parseInt(e.target.value) || 7)} style={{ height: "40px", width: "60px" }} />
                        </div>
                      </div>
                      <input className="input" placeholder="Aliases (comma-separated): e.g. JS, Node.js, NodeJS"
                        value={newKwAliases} onChange={e => setNewKwAliases(e.target.value)} style={{ height: "40px" }} />
                      <div style={{ display: "flex", gap: "0.5rem" }}>
                        <button onClick={handleAddKeyword} disabled={newKwSaving || !newKwKeyword.trim()} className="btn-primary"
                          style={{ padding: "0.45rem 1.2rem", fontSize: "0.82rem", display: "flex", alignItems: "center", gap: "0.3rem" }}>
                          {newKwSaving ? <><div className="spinner" style={{ width: 12, height: 12 }} /> Saving...</> : <><Check size={13} /> Add Keyword</>}
                        </button>
                        <button onClick={() => setAddingKw(false)} className="btn-secondary" style={{ padding: "0.45rem 0.9rem", fontSize: "0.82rem" }}>Cancel</button>
                      </div>
                    </div>
                  )}

                  {/* Keywords Table */}
                  <div className="card" style={{ padding: 0, overflow: "hidden" }}>
                    {filteredKeywords.length === 0 ? (
                      <div style={{ padding: "3rem", textAlign: "center", color: "var(--text-muted)", fontSize: "0.88rem" }}>
                        {kwSearch ? `No keywords matching "${kwSearch}"` : `No ${manageSubTab} keywords yet.`}
                      </div>
                    ) : (
                      <table style={{ width: "100%", borderCollapse: "collapse" }}>
                        <thead>
                          <tr style={{ background: "var(--bg-3)", borderBottom: "1px solid var(--border)" }}>
                            {["Keyword", "Weight", "Aliases", "Actions"].map(h => (
                              <th key={h} style={{ padding: "0.75rem 1rem", textAlign: "left", fontSize: "0.75rem", fontWeight: 700, color: "var(--text-muted)", textTransform: "uppercase", letterSpacing: "0.05em" }}>{h}</th>
                            ))}
                          </tr>
                        </thead>
                        <tbody>
                          {filteredKeywords.map((kw, i) => {
                            const isEditing = editingKw?.keyword === kw.keyword && editingKw?.layer === manageSubTab;
                            const isExpired = kw.expires_on && new Date(kw.expires_on) < new Date();
                            const isActive = kw.is_active !== false && !isExpired;
                            return (
                              <tr key={kw.keyword + i} style={{ borderBottom: "1px solid var(--border)", background: isEditing ? "rgba(108,99,255,0.04)" : "transparent" }}>
                                {isEditing ? (
                                  <td colSpan={4} style={{ padding: "0.8rem 1rem" }}>
                                    <div style={{ display: "grid", gridTemplateColumns: "1fr 80px 1fr auto", gap: "0.5rem", alignItems: "center" }}>
                                      <input className="input" value={editKwKeyword} onChange={e => setEditKwKeyword(e.target.value)} style={{ height: "36px" }} autoFocus />
                                      <input type="number" min={1} max={10} className="input" value={editKwWeight} onChange={e => setEditKwWeight(parseInt(e.target.value))} style={{ height: "36px" }} />
                                      <input className="input" value={editKwAliases} onChange={e => setEditKwAliases(e.target.value)} placeholder="Aliases (comma-sep)" style={{ height: "36px" }} />
                                      <div style={{ display: "flex", gap: "0.4rem" }}>
                                        <button onClick={handleEditKeyword} disabled={editKwSaving} className="btn-primary" style={{ padding: "0.4rem 0.8rem", fontSize: "0.78rem" }}>
                                          {editKwSaving ? "..." : <Save size={13} />}
                                        </button>
                                        <button onClick={() => setEditingKw(null)} className="btn-secondary" style={{ padding: "0.4rem 0.7rem", fontSize: "0.78rem" }}>
                                          <X size={13} />
                                        </button>
                                      </div>
                                    </div>
                                  </td>
                                ) : (
                                  <>
                                    <td style={{ padding: "0.75rem 1rem" }}>
                                      <span style={{ fontWeight: 600, fontSize: "0.88rem" }}>{kw.keyword}</span>
                                      {manageSubTab === "dynamic" && (
                                        <span style={{ marginLeft: "0.4rem", fontSize: "0.7rem", padding: "1px 5px", borderRadius: "4px", background: isActive ? "rgba(67,233,123,0.15)" : "rgba(255,101,132,0.15)", color: isActive ? "#43e97b" : "#ff6584" }}>
                                          {isActive ? "Active" : "Expired"}
                                        </span>
                                      )}
                                    </td>
                                    <td style={{ padding: "0.75rem 1rem" }}>
                                      <span style={{ fontWeight: 800, fontSize: "1rem", color: WEIGHT_COLORS[kw.weight] || "var(--text-muted)" }}>
                                        {kw.weight}
                                        <span style={{ fontSize: "0.65rem", color: "var(--text-muted)", fontWeight: 400 }}>/10</span>
                                      </span>
                                    </td>
                                    <td style={{ padding: "0.75rem 1rem" }}>
                                      <div style={{ display: "flex", flexWrap: "wrap", gap: "0.3rem" }}>
                                        {(kw.aliases || []).length > 0
                                          ? kw.aliases.slice(0, 4).map((a, ai) => (
                                            <span key={ai} className="tag" style={{ fontSize: "0.72rem", padding: "2px 7px" }}>{a}</span>
                                          ))
                                          : <span style={{ color: "var(--text-muted)", fontSize: "0.78rem" }}>—</span>
                                        }
                                        {(kw.aliases || []).length > 4 && (
                                          <span style={{ fontSize: "0.72rem", color: "var(--text-muted)" }}>+{kw.aliases.length - 4} more</span>
                                        )}
                                      </div>
                                    </td>
                                    <td style={{ padding: "0.75rem 1rem" }}>
                                      <div style={{ display: "flex", gap: "0.4rem" }}>
                                        {manageSubTab === "base" && (
                                          <button onClick={() => startEdit(kw, "base")} style={{ background: "rgba(108,99,255,0.1)", border: "1px solid rgba(108,99,255,0.2)", borderRadius: "6px", padding: "0.3rem 0.6rem", cursor: "pointer", color: "var(--accent)", display: "flex", alignItems: "center", gap: "0.3rem", fontSize: "0.78rem" }}>
                                            <Edit3 size={12} /> Edit
                                          </button>
                                        )}
                                        <button onClick={() => setDeleteConfirm({ keyword: kw.keyword, layer: manageSubTab })} style={{ background: "rgba(255,101,132,0.08)", border: "1px solid rgba(255,101,132,0.2)", borderRadius: "6px", padding: "0.3rem 0.6rem", cursor: "pointer", color: "#ff6584", display: "flex", alignItems: "center", gap: "0.3rem", fontSize: "0.78rem" }}>
                                          <Trash2 size={12} /> Delete
                                        </button>
                                      </div>
                                    </td>
                                  </>
                                )}
                              </tr>
                            );
                          })}
                        </tbody>
                      </table>
                    )}
                  </div>
                </>
              )}
            </div>
          </div>
        )}

        {/* ═══════════════════ TAB: CREATE CATEGORY ═══════════════════════════ */}
        {mainTab === "create" && (
          <div style={{ maxWidth: "760px" }}>
            <div className="card" style={{ padding: "2rem", display: "grid", gap: "1.5rem" }}>
              <div>
                <h2 style={{ fontFamily: "Syne, sans-serif", fontSize: "1.4rem", fontWeight: 800, margin: "0 0 0.3rem", display: "flex", alignItems: "center", gap: "0.5rem" }}>
                  <FolderPlus size={20} className="text-emerald-400" /> Create New ATS Category
                </h2>
                <p style={{ color: "var(--text-muted)", fontSize: "0.85rem", margin: 0 }}>
                  Add a brand new industry/role category with initial keywords. It will be instantly active in the ATS engine.
                </p>
              </div>

              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1rem" }}>
                <div>
                  <label style={{ fontSize: "0.8rem", fontWeight: 700, color: "var(--text-muted)", display: "block", marginBottom: "0.4rem" }}>
                    Category Slug * <span style={{ fontWeight: 400 }}>(e.g. logistics, banking)</span>
                  </label>
                  <input className="input" placeholder="e.g. logistics_operations"
                    value={newCatSlug} onChange={e => setNewCatSlug(e.target.value.toLowerCase().replace(/\s+/g, "_").replace(/[^a-z0-9_]/g, ""))}
                    style={{ height: "42px" }} />
                </div>
                <div>
                  <label style={{ fontSize: "0.8rem", fontWeight: 700, color: "var(--text-muted)", display: "block", marginBottom: "0.4rem" }}>
                    Display Name * <span style={{ fontWeight: 400 }}>(shown in admin + ATS)</span>
                  </label>
                  <input className="input" placeholder="e.g. Logistics & Operations"
                    value={newCatDisplay} onChange={e => setNewCatDisplay(e.target.value)}
                    style={{ height: "42px" }} />
                </div>
              </div>

              <div>
                <label style={{ fontSize: "0.8rem", fontWeight: 700, color: "var(--text-muted)", display: "block", marginBottom: "0.4rem" }}>
                  Initial Keywords <span style={{ fontWeight: 400 }}>— one per line: <code style={{ fontSize: "0.78rem" }}>Keyword Name,Weight,Alias1,Alias2</code></span>
                </label>
                <textarea
                  className="input"
                  rows={12}
                  value={newCatKeywordsRaw}
                  onChange={e => setNewCatKeywordsRaw(e.target.value)}
                  placeholder={"Supply Chain,9,SCM,Logistics\nInventory Management,8,WMS,Stock Control\nVendor Management,7,Procurement,Sourcing"}
                  style={{ fontFamily: "monospace", fontSize: "0.82rem", resize: "vertical", minHeight: "200px" }}
                />
                <p style={{ fontSize: "0.75rem", color: "var(--text-muted)", marginTop: "0.4rem" }}>
                  Format: <code>Keyword Name,Weight(1-10),Alias1,Alias2,...</code> — Weight is optional (default: 7)
                </p>
              </div>

              {/* Preview */}
              {newCatKeywordsRaw.trim() && (
                <div style={{ background: "var(--bg-2)", borderRadius: "10px", padding: "1rem", border: "1px solid var(--border)" }}>
                  <p style={{ fontSize: "0.78rem", fontWeight: 700, color: "var(--text-muted)", margin: "0 0 0.5rem" }}>Preview ({newCatKeywordsRaw.split("\n").filter(l => l.trim()).length} keywords):</p>
                  <div style={{ display: "flex", flexWrap: "wrap", gap: "0.4rem" }}>
                    {newCatKeywordsRaw.split("\n").filter(l => l.trim()).map((line, i) => {
                      const parts = line.split(",");
                      const kw = parts[0]?.trim();
                      const wt = parseInt(parts[1]?.trim()) || 7;
                      if (!kw) return null;
                      return (
                        <span key={i} className="tag" style={{ fontSize: "0.75rem", background: "var(--bg-3)" }}>
                          <span style={{ color: WEIGHT_COLORS[wt] || "var(--text)", fontWeight: 700, marginRight: "0.3rem" }}>{wt}</span>
                          {kw}
                        </span>
                      );
                    })}
                  </div>
                </div>
              )}

              <button
                onClick={handleCreateCategory}
                disabled={createCatLoading || !newCatSlug.trim() || !newCatDisplay.trim()}
                className="btn-primary"
                style={{ padding: "0.75rem 2rem", fontSize: "0.92rem", alignSelf: "start", display: "inline-flex", alignItems: "center", gap: "0.4rem", background: "linear-gradient(135deg, #10b981 0%, #059669 100%)", border: "none" }}
              >
                {createCatLoading ? <><div className="spinner" style={{ width: 14, height: 14 }} /> Creating...</> : <><FolderPlus size={15} /> Create Category</>}
              </button>
            </div>
          </div>
        )}

        {/* ═══════════════════ TAB: AI SCANNER ═════════════════════════════════ */}
        {mainTab === "scanner" && (
          <div>
            <div style={{ display: "flex", gap: "0.5rem", marginBottom: "1.5rem" }}>
              {[{ key: "scan", label: "🤖 AI Scan" }, { key: "pending", label: `⏳ Pending Queue (${pendingKeywords.length})` }].map(t => (
                <button key={t.key} onClick={() => setScannerSubTab(t.key as any)} style={{
                  padding: "0.45rem 1.1rem", borderRadius: "8px", border: "1px solid",
                  borderColor: scannerSubTab === t.key ? "var(--accent)" : "var(--border)",
                  background: scannerSubTab === t.key ? "rgba(108,99,255,0.1)" : "var(--bg-2)",
                  color: scannerSubTab === t.key ? "var(--accent)" : "var(--text-muted)",
                  fontWeight: scannerSubTab === t.key ? 700 : 500, fontSize: "0.85rem", cursor: "pointer"
                }}>{t.label}</button>
              ))}
            </div>

            {scannerSubTab === "scan" && (
              <div className="card" style={{ padding: "2rem" }}>
                <h2 style={{ fontSize: "1.2rem", marginBottom: "0.5rem" }}>AI Market Trend Scanner</h2>
                <p style={{ color: "var(--text-muted)", fontSize: "0.85rem", marginBottom: "1.5rem" }}>
                  Let AI discover new emerging keywords for a category and add them to the pending queue for your review.
                </p>
                <div style={{ display: "flex", gap: "1rem", marginBottom: "2rem", flexWrap: "wrap" }}>
                  <select className="input" style={{ width: "280px" }} value={scanIndustry} onChange={e => setScanIndustry(e.target.value)}>
                    {Object.entries(allCategories).map(([key, d]) => (
                      <option key={key} value={key}>{d.displayName}</option>
                    ))}
                  </select>
                  <button className="btn-primary" onClick={runAIScanner} disabled={scanLoading}>
                    {scanLoading ? "Scanning..." : "🔍 Run AI Scan"}
                  </button>
                </div>
                {scanResults.length > 0 && (
                  <div style={{ display: "grid", gap: "1rem", gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))" }}>
                    {scanResults.map((kw, i) => (
                      <div key={kw.id || i} style={{ padding: "1.2rem", border: "1px solid var(--border)", borderRadius: "10px", background: "var(--bg-2)", display: "grid", gap: "0.5rem" }}>
                        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                          <strong style={{ fontSize: "1rem" }}>{kw.keyword}</strong>
                          <span style={{ fontWeight: 800, color: WEIGHT_COLORS[kw.weight] || "var(--text-muted)", fontSize: "0.9rem" }}>{kw.weight}/10</span>
                        </div>
                        <p style={{ fontSize: "0.78rem", color: "var(--text-muted)", margin: 0 }}>
                          {kw.aliases?.length > 0 ? `Aliases: ${kw.aliases.join(", ")}` : "No aliases"}
                        </p>
                        {kw.id && (
                          <div style={{ display: "flex", gap: "0.5rem" }}>
                            <button className="btn-primary" style={{ flex: 1, padding: "0.4rem", fontSize: "0.78rem", background: "#43e97b", color: "#000", border: "none" }} onClick={() => handleAction(kw.id, "approve", "scan")}>✓ Approve</button>
                            <button className="btn-secondary" style={{ flex: 1, padding: "0.4rem", fontSize: "0.78rem", borderColor: "#ff6584", color: "#ff6584" }} onClick={() => handleAction(kw.id, "reject", "scan")}>✕ Reject</button>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {scannerSubTab === "pending" && (
              <div className="card" style={{ padding: "2rem" }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "1rem" }}>
                  <h2 style={{ fontSize: "1.2rem", margin: 0 }}>Pending Queue ({pendingKeywords.length})</h2>
                  {pendingKeywords.length > 0 && (
                    <button className="btn-primary" style={{ padding: "0.5rem 1rem", fontSize: "0.85rem", background: "#43e97b", color: "#000", border: "none" }} onClick={() => setApproveAllConfirmOpen(true)} disabled={pendingLoading}>
                      Approve All
                    </button>
                  )}
                </div>
                {pendingLoading ? <div className="spinner" style={{ margin: "2rem auto" }} /> : pendingKeywords.length === 0 ? (
                  <p style={{ color: "var(--text-muted)", textAlign: "center", padding: "2rem" }}>No pending keywords. Run the AI scanner to add some!</p>
                ) : (
                  <div style={{ display: "grid", gap: "0.6rem" }}>
                    {pendingKeywords.map(kw => (
                      <div key={kw.id} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "0.9rem 1rem", border: "1px solid var(--border)", borderRadius: "8px", background: "var(--bg-2)", gap: "1rem", flexWrap: "wrap" }}>
                        <div>
                          <strong>{kw.keyword}</strong>
                          <span style={{ color: "var(--text-muted)", fontSize: "0.82rem", marginLeft: "0.5rem" }}>({kw.industry}) — Weight: {kw.weight}</span>
                          {kw.aliases?.length > 0 && <div style={{ fontSize: "0.78rem", color: "var(--text-muted)", marginTop: "0.2rem" }}>Aliases: {kw.aliases.join(", ")}</div>}
                        </div>
                        <div style={{ display: "flex", gap: "0.5rem" }}>
                          <button className="btn-primary" style={{ padding: "0.35rem 0.9rem", fontSize: "0.8rem", background: "#43e97b", color: "#000", border: "none" }} onClick={() => handleAction(kw.id, "approve", "pending")}>✓ Approve</button>
                          <button className="btn-secondary" style={{ padding: "0.35rem 0.8rem", fontSize: "0.8rem", borderColor: "#ff6584", color: "#ff6584" }} onClick={() => handleAction(kw.id, "reject", "pending")}>Reject</button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>
        )}
      </div>

      {/* Delete Confirm Modal */}
      <ConfirmationModal
        isOpen={!!deleteConfirm}
        title={`Delete "${deleteConfirm?.keyword}"?`}
        message={`This will permanently remove '${deleteConfirm?.keyword}' from the ${deleteConfirm?.layer} keyword list of '${allCategories[selectedCategory]?.displayName}'. Resumes will no longer be scored on this keyword.`}
        confirmLabel="Delete Keyword"
        cancelLabel="Cancel"
        isDanger={true}
        onConfirm={handleDeleteKeyword}
        onCancel={() => setDeleteConfirm(null)}
      />

      {/* Approve All Confirm */}
      <ConfirmationModal
        isOpen={approveAllConfirmOpen}
        title="Approve All Pending Keywords?"
        message="This will make all pending keywords immediately active in the ATS engine."
        confirmLabel="Approve All"
        cancelLabel="Cancel"
        isDanger={false}
        onConfirm={() => { setApproveAllConfirmOpen(false); executeApproveAllPending(); }}
        onCancel={() => setApproveAllConfirmOpen(false)}
      />
    </div>
  );
}
