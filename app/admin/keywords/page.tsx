"use client";
import { useEffect, useState, useCallback } from "react";
import Link from "next/link";
import Navbar from "@/components/Navbar";
import { useAuth } from "@/hooks/useAuth";
import TabNavigation from "@/components/ui/TabNavigation";
import { createClient } from "@/utils/supabase/client";
import { ConfirmationModal } from "@/components/ui/ConfirmationModal";
import { useToast } from "@/components/ui/toast-1";
import {
  ShieldCheck, BarChart2, Users, Bot, Brain,
  Plus, Trash2, Edit3, Check, X, ChevronDown, ChevronRight,
  Search, Layers, RefreshCw, Tag, Save, PlusCircle, FolderPlus, CreditCard, Megaphone
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
    <div className="min-h-screen bg-[var(--bg-page)] flex items-center justify-center">
      <div className="spinner w-8 h-8" />
    </div>
  );

  if (isAdmin === false) return (
    <div className="min-h-screen bg-[var(--bg-page)] text-[var(--text)] relative overflow-hidden transition-colors duration-300">
      <Navbar />
      <div className="max-w-7xl mx-auto px-6 py-24 text-center">
        <h3 className="text-xl font-extrabold font-['Syne',sans-serif] text-rose-500">🔒 Forbidden: Admins only</h3>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-[var(--bg-page)] text-[var(--text)] relative overflow-hidden transition-colors duration-300">
      {/* Premium background radial elements */}
      <div className="absolute top-20 right-10 w-96 h-96 bg-indigo-500/5 dark:bg-indigo-500/[0.03] rounded-full blur-3xl -z-10" />
      <div className="absolute bottom-20 left-10 w-96 h-96 bg-purple-500/5 dark:bg-purple-500/[0.03] rounded-full blur-3xl -z-10" />
      
      <div className="relative z-10">
        <Navbar />
        
        <main className="max-w-7xl mx-auto px-6 py-10 space-y-10">
          
          {/* Page Header */}
          <div className="space-y-2">
            <span className="text-[10px] font-bold text-indigo-600 dark:text-indigo-400 uppercase tracking-widest bg-indigo-500/10 px-3 py-1 rounded-full border border-indigo-500/20">
              Admin Panel
            </span>
            <h1 className="text-3xl md:text-4xl font-extrabold font-['Syne',sans-serif] tracking-tight flex items-center gap-2 mt-2">
              <Brain size={32} className="text-indigo-600 dark:text-indigo-400" />
              ATS Keyword Management
            </h1>
            <p className="text-sm text-slate-600 dark:text-[#9ea3c8] max-w-2xl leading-relaxed">
              Manage ATS categories, add/edit/delete keywords, create new industries, and run AI scans.
            </p>
          </div>

          {/* Admin Nav */}
          <TabNavigation activeTab="keywords" />

          {/* Main Tabs */}
          <div className="flex gap-2 border-b border-slate-200 dark:border-white/10 pb-3 no-scrollbar mb-6 overflow-x-auto">
            {[
              { key: "manage", icon: <Layers size={15} />, label: "Manage Keywords" },
              { key: "create", icon: <FolderPlus size={15} />, label: "Add New Category" },
              { key: "scanner", icon: <Brain size={15} />, label: "AI Scanner" },
            ].map(t => {
              const isSelected = mainTab === t.key;
              return (
                <button 
                  key={t.key} 
                  onClick={() => setMainTab(t.key as any)} 
                  className={`
                    px-4 py-2 rounded-xl font-bold text-xs md:text-sm flex items-center gap-2
                    transition-all duration-200 border cursor-pointer whitespace-nowrap
                    ${isSelected
                      ? "bg-indigo-600 text-white border-indigo-600 shadow-md shadow-indigo-500/15"
                      : "text-slate-500 dark:text-gray-400 bg-slate-100 dark:bg-white/[0.02] border-slate-200 dark:border-white/5 hover:text-indigo-600 dark:hover:text-white"
                    }
                  `}
                >
                  {t.icon}
                  {t.label}
                </button>
              );
            })}
          </div>

        {/* ═══════════════════ TAB: MANAGE KEYWORDS ═══════════════════════════ */}
        {mainTab === "manage" && (
          <div style={{ display: "grid", gridTemplateColumns: "260px 1fr", gap: "1.5rem", alignItems: "start" }}>
            
            {/* Left: Category Sidebar */}
            <div className="p-6 rounded-2xl bg-white/80 dark:bg-slate-950/40 dark:bg-gradient-to-br dark:from-white/[0.05] dark:to-white/[0.01] border border-slate-200/60 dark:border-white/5 shadow-sm space-y-4">
              <div className="flex justify-between items-center">
                <span className="text-[10px] font-bold text-slate-500 dark:text-[#9ea3c8] uppercase tracking-wider">
                  Categories ({allCatKeys.length})
                </span>
                <button onClick={fetchCategories} disabled={catLoading} className="bg-transparent border-none cursor-pointer text-slate-400 dark:text-gray-500 hover:text-slate-600 dark:hover:text-white p-1">
                  <RefreshCw size={13} className={catLoading ? "animate-spin" : ""} />
                </button>
              </div>
              <div className="flex flex-col gap-1.5 max-h-[70vh] overflow-y-auto pr-1">
                {allCatKeys.map(key => {
                  const d = allCategories[key];
                  const isActive = selectedCategory === key;
                  return (
                    <button 
                      key={key} 
                      onClick={() => { setSelectedCategory(key); setKwSearch(""); setAddingKw(false); setEditingKw(null); }}
                      className={`
                        w-full flex items-center justify-between p-3 rounded-xl border text-xs md:text-sm font-semibold transition cursor-pointer
                        ${isActive 
                          ? 'bg-indigo-50 dark:bg-indigo-500/10 border-indigo-200 dark:border-indigo-500/20 text-indigo-600 dark:text-indigo-400 font-bold' 
                          : 'bg-transparent border-transparent text-slate-700 dark:text-gray-300 hover:bg-slate-100 dark:hover:bg-white/5'
                        }
                      `}
                    >
                      <span>{d.displayName}</span>
                      <span className="text-[10px] bg-slate-200/60 dark:bg-white/5 px-2 py-0.5 rounded text-slate-500 dark:text-gray-400 font-bold">
                        {(d.base?.length || 0) + (d.dynamic?.length || 0)}
                      </span>
                    </button>
                  );
                })}
                <button 
                  onClick={() => setMainTab("create")} 
                  className="w-full flex items-center justify-center gap-1.5 p-3 rounded-xl border border-dashed border-emerald-300 dark:border-emerald-500/20 bg-emerald-50/50 dark:bg-emerald-500/5 hover:bg-emerald-100/50 dark:hover:bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 text-xs font-bold cursor-pointer transition mt-2"
                >
                  <Plus size={13} /> Add New Category
                </button>
              </div>
            </div>

            {/* Right: Keyword Editor */}
            <div className="grid gap-6">
              {!catData ? (
                <div className="p-12 text-center rounded-2xl bg-white/80 dark:bg-white/[0.02] border border-slate-200/60 dark:border-white/5 text-slate-500 dark:text-gray-400 shadow-sm">
                  {catLoading ? <div className="spinner mx-auto" /> : "Select a category to manage keywords."}
                </div>
              ) : (
                <>
                  {/* Category Header */}
                  <div className="p-6 rounded-2xl bg-white/80 dark:bg-slate-950/40 dark:bg-gradient-to-br dark:from-white/[0.05] dark:to-white/[0.01] border border-slate-200/60 dark:border-white/10 shadow-sm flex flex-wrap justify-between items-center gap-4">
                    <div>
                      <h2 className="text-xl font-extrabold font-['Syne',sans-serif] text-slate-900 dark:text-white m-0">
                        {catData.displayName}
                      </h2>
                      <div className="flex items-center gap-2 mt-1">
                        <span className="px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 border border-indigo-500/20">{catData.base.length} base</span>
                        <span className="px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20">{catData.dynamic.length} dynamic</span>
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <div className="relative">
                        <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 dark:text-gray-500 pointer-events-none" />
                        <input
                          className="pl-8 pr-4 py-1.5 rounded-xl bg-slate-50 dark:bg-white/5 border border-slate-200 dark:border-white/10 text-xs md:text-sm text-[var(--text)] focus:border-indigo-500 outline-none transition w-44"
                          placeholder="Search keywords..."
                          value={kwSearch} 
                          onChange={e => setKwSearch(e.target.value)}
                        />
                      </div>
                      <button 
                        onClick={() => { setAddingKw(true); setEditingKw(null); }} 
                        className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs rounded-xl border-none cursor-pointer transition flex items-center gap-1.5"
                      >
                        <Plus size={13} /> Add Keyword
                      </button>
                    </div>
                  </div>

                  {/* Sub-tab: base / dynamic */}
                  <div className="flex gap-2 border-b border-slate-200 dark:border-white/10 pb-2 overflow-x-auto no-scrollbar">
                    {(["base", "dynamic"] as const).map(tab => {
                      const isSubActive = manageSubTab === tab;
                      return (
                        <button 
                          key={tab} 
                          onClick={() => setManageSubTab(tab)} 
                          className={`
                            px-4 py-2 rounded-xl font-bold text-xs transition border cursor-pointer whitespace-nowrap
                            ${isSubActive
                              ? "bg-indigo-600/10 border-indigo-200 dark:border-indigo-500/20 text-indigo-600 dark:text-indigo-400 font-bold"
                              : "bg-transparent border-transparent text-slate-500 dark:text-gray-400 hover:bg-slate-100 dark:hover:bg-white/5"
                            }
                          `}
                        >
                          {tab === "base" ? `📘 Base (${catData.base.length})` : `⚡ Dynamic (${catData.dynamic.length})`}
                        </button>
                      );
                    })}
                  </div>

                  {/* Add Keyword Form */}
                  {addingKw && (
                    <div className="p-6 rounded-2xl bg-indigo-50/50 dark:bg-indigo-950/5 border border-indigo-200/50 dark:border-indigo-500/10 shadow-sm space-y-4">
                      <h4 className="m-0 text-sm font-bold text-slate-800 dark:text-white flex items-center gap-1.5">
                        <PlusCircle size={15} className="text-indigo-600 dark:text-indigo-400" /> Add New Keyword to {catData.displayName}
                      </h4>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <input 
                          className="px-4 py-2.5 rounded-xl bg-white dark:bg-white/5 border border-slate-200 dark:border-white/10 text-xs md:text-sm text-[var(--text)] outline-none focus:border-indigo-500 transition w-full"
                          placeholder="Keyword name *" 
                          value={newKwKeyword} 
                          onChange={e => setNewKwKeyword(e.target.value)}
                          onKeyDown={e => e.key === "Enter" && handleAddKeyword()} 
                          autoFocus 
                        />
                        <div className="flex items-center gap-2">
                          <span className="text-xs text-slate-500 dark:text-gray-400 whitespace-nowrap">Weight (1-10):</span>
                          <input 
                            type="number" 
                            min={1} 
                            max={10} 
                            className="px-4 py-2.5 rounded-xl bg-white dark:bg-white/5 border border-slate-200 dark:border-white/10 text-xs md:text-sm text-[var(--text)] outline-none focus:border-indigo-500 transition w-20"
                            value={newKwWeight}
                            onChange={e => setNewKwWeight(parseInt(e.target.value) || 7)} 
                          />
                        </div>
                      </div>
                      <input 
                        className="px-4 py-2.5 rounded-xl bg-white dark:bg-white/5 border border-slate-200 dark:border-white/10 text-xs md:text-sm text-[var(--text)] outline-none focus:border-indigo-500 transition w-full"
                        placeholder="Aliases (comma-separated): e.g. JS, Node.js, NodeJS"
                        value={newKwAliases} 
                        onChange={e => setNewKwAliases(e.target.value)} 
                      />
                      <div className="flex gap-2">
                        <button 
                          onClick={handleAddKeyword} 
                          disabled={newKwSaving || !newKwKeyword.trim()} 
                          className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs rounded-xl border-none cursor-pointer transition flex items-center gap-1.5 disabled:opacity-50"
                        >
                          {newKwSaving ? <><div className="spinner w-3 h-3" /> Saving...</> : <><Check size={13} /> Add Keyword</>}
                        </button>
                        <button 
                          onClick={() => setAddingKw(false)} 
                          className="px-4 py-2 bg-slate-100 hover:bg-slate-200 dark:bg-white/5 dark:hover:bg-white/10 border border-slate-200 dark:border-white/10 text-slate-700 dark:text-white font-bold text-xs rounded-xl cursor-pointer transition"
                        >
                          Cancel
                        </button>
                      </div>
                    </div>
                  )}

                  {/* Keywords Table */}
                  <div className="rounded-2xl bg-white/80 dark:bg-slate-950/40 dark:bg-gradient-to-br dark:from-white/[0.05] dark:to-white/[0.01] border border-slate-200/60 dark:border-white/10 shadow-sm dark:shadow-xl overflow-hidden">
                    {filteredKeywords.length === 0 ? (
                      <div className="p-12 text-center text-slate-500 dark:text-gray-400 text-xs md:text-sm">
                        {kwSearch ? `No keywords matching "${kwSearch}"` : `No ${manageSubTab} keywords yet.`}
                      </div>
                    ) : (
                      <div className="overflow-x-auto">
                        <table className="w-full border-collapse text-left text-xs md:text-sm">
                          <thead>
                            <tr className="border-b border-slate-200 dark:border-white/10 bg-slate-50 dark:bg-white/[0.01]">
                              {["Keyword", "Weight", "Aliases", "Actions"].map(h => (
                                <th key={h} className="px-6 py-4 font-bold text-slate-500 dark:text-gray-400 uppercase tracking-wider text-[10px]">{h}</th>
                              ))}
                            </tr>
                          </thead>
                          <tbody>
                            {filteredKeywords.map((kw, i) => {
                              const isEditing = editingKw?.keyword === kw.keyword && editingKw?.layer === manageSubTab;
                              const isExpired = kw.expires_on && new Date(kw.expires_on) < new Date();
                              const isActive = kw.is_active !== false && !isExpired;
                              return (
                                <tr key={kw.keyword + i} className={`border-b border-slate-100 dark:border-white/[0.02] hover:bg-slate-50/50 dark:hover:bg-white/[0.01] transition duration-200 ${isEditing ? "bg-indigo-500/[0.04] dark:bg-indigo-500/[0.02]" : ""}`}>
                                  {isEditing ? (
                                    <td colSpan={4} className="px-6 py-4">
                                      <div className="grid grid-cols-1 sm:grid-cols-4 gap-3 items-center">
                                        <input 
                                          className="px-3 py-1.5 rounded-lg bg-white dark:bg-white/5 border border-slate-200 dark:border-white/10 text-xs md:text-sm text-[var(--text)] outline-none focus:border-indigo-500 transition" 
                                          value={editKwKeyword} 
                                          onChange={e => setEditKwKeyword(e.target.value)} 
                                          autoFocus 
                                        />
                                        <input 
                                          type="number" 
                                          min={1} 
                                          max={10} 
                                          className="px-3 py-1.5 rounded-lg bg-white dark:bg-white/5 border border-slate-200 dark:border-white/10 text-xs md:text-sm text-[var(--text)] outline-none focus:border-indigo-500 transition w-20" 
                                          value={editKwWeight} 
                                          onChange={e => setEditKwWeight(parseInt(e.target.value))} 
                                        />
                                        <input 
                                          className="px-3 py-1.5 rounded-lg bg-white dark:bg-white/5 border border-slate-200 dark:border-white/10 text-xs md:text-sm text-[var(--text)] outline-none focus:border-indigo-500 transition" 
                                          value={editKwAliases} 
                                          onChange={e => setEditKwAliases(e.target.value)} 
                                          placeholder="Aliases (comma-sep)" 
                                        />
                                        <div className="flex gap-2">
                                          <button 
                                            onClick={handleEditKeyword} 
                                            disabled={editKwSaving} 
                                            className="px-3 py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs rounded-lg border-none cursor-pointer transition flex items-center justify-center"
                                          >
                                            {editKwSaving ? "..." : <Save size={13} />}
                                          </button>
                                          <button 
                                            onClick={() => setEditingKw(null)} 
                                            className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 dark:bg-white/5 dark:hover:bg-white/10 border border-slate-200 dark:border-white/10 text-slate-700 dark:text-white font-bold text-xs rounded-lg cursor-pointer transition flex items-center justify-center"
                                          >
                                            <X size={13} />
                                          </button>
                                        </div>
                                      </div>
                                    </td>
                                  ) : (
                                    <>
                                      <td className="px-6 py-4 font-semibold text-slate-900 dark:text-white">
                                        <span>{kw.keyword}</span>
                                        {manageSubTab === "dynamic" && (
                                          <span className={`ml-2 px-1.5 py-0.5 rounded text-[9px] font-bold ${
                                            isActive 
                                              ? "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/10" 
                                              : "bg-rose-500/10 text-rose-600 dark:text-rose-400 border border-rose-500/10"
                                          }`}>
                                            {isActive ? "Active" : "Expired"}
                                          </span>
                                        )}
                                      </td>
                                      <td className="px-6 py-4 font-extrabold text-xs md:text-sm" style={{ color: WEIGHT_COLORS[kw.weight] }}>
                                        {kw.weight}
                                        <span className="text-[10px] text-slate-400 dark:text-gray-500 font-normal">/10</span>
                                      </td>
                                      <td className="px-6 py-4">
                                        <div className="flex flex-wrap gap-1.5">
                                          {(kw.aliases || []).length > 0
                                            ? kw.aliases.slice(0, 4).map((a, ai) => (
                                              <span key={ai} className="px-2 py-0.5 rounded text-[10px] bg-slate-100 dark:bg-white/5 text-slate-600 dark:text-gray-300 font-medium border border-slate-200/40 dark:border-white/5">{a}</span>
                                            ))
                                            : <span className="text-slate-400">—</span>
                                          }
                                          {(kw.aliases || []).length > 4 && (
                                            <span className="text-[10px] text-slate-400 dark:text-gray-500">+{kw.aliases.length - 4} more</span>
                                          )}
                                        </div>
                                      </td>
                                      <td className="px-6 py-4">
                                        <div className="flex gap-2">
                                          {manageSubTab === "base" && (
                                            <button 
                                              onClick={() => startEdit(kw, "base")} 
                                              className="px-2.5 py-1 bg-slate-50 hover:bg-slate-100 dark:bg-white/5 dark:hover:bg-white/10 border border-slate-200 dark:border-white/10 text-slate-700 dark:text-white text-xs font-bold rounded-lg cursor-pointer transition flex items-center gap-1"
                                            >
                                              <Edit3 size={12} /> Edit
                                            </button>
                                          )}
                                          <button 
                                            onClick={() => setDeleteConfirm({ keyword: kw.keyword, layer: manageSubTab })} 
                                            className="px-2.5 py-1 bg-rose-50 hover:bg-rose-100 dark:bg-rose-950/20 dark:hover:bg-rose-900/30 border border-rose-200 dark:border-rose-900/30 text-rose-600 dark:text-rose-400 text-xs font-bold rounded-lg cursor-pointer transition flex items-center gap-1"
                                          >
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
                      </div>
                    )}
                  </div>
                </>
              )}
            </div>
          </div>
        )}

        {/* ═══════════════════ TAB: CREATE CATEGORY ═══════════════════════════ */}
        {mainTab === "create" && (
          <div className="max-w-3xl">
            <div className="p-6 md:p-8 rounded-2xl bg-white/80 dark:bg-slate-950/40 dark:bg-gradient-to-br dark:from-white/[0.05] dark:to-white/[0.01] border border-slate-200/60 dark:border-white/10 shadow-sm dark:shadow-xl space-y-6">
              <div>
                <h2 className="text-xl font-extrabold font-['Syne',sans-serif] text-slate-900 dark:text-white m-0 flex items-center gap-2">
                  <FolderPlus size={20} className="text-emerald-500 dark:text-emerald-400" /> Create New ATS Category
                </h2>
                <p className="text-xs text-slate-500 dark:text-gray-400 mt-1">
                  Add a brand new industry/role category with initial keywords. It will be instantly active in the ATS engine.
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-500 dark:text-[#9ea3c8] block">
                    Category Slug * <span className="font-normal">(e.g. logistics_operations)</span>
                  </label>
                  <input 
                    className="px-4 py-2.5 rounded-xl bg-slate-50 dark:bg-white/5 border border-slate-200 dark:border-white/10 text-xs md:text-sm text-[var(--text)] outline-none focus:border-indigo-500 transition w-full"
                    placeholder="e.g. logistics_operations"
                    value={newCatSlug} 
                    onChange={e => setNewCatSlug(e.target.value.toLowerCase().replace(/\s+/g, "_").replace(/[^a-z0-9_]/g, ""))}
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-500 dark:text-[#9ea3c8] block">
                    Display Name * <span className="font-normal">(shown in admin + ATS)</span>
                  </label>
                  <input 
                    className="px-4 py-2.5 rounded-xl bg-slate-50 dark:bg-white/5 border border-slate-200 dark:border-white/10 text-xs md:text-sm text-[var(--text)] outline-none focus:border-indigo-500 transition w-full"
                    placeholder="e.g. Logistics & Operations"
                    value={newCatDisplay} 
                    onChange={e => setNewCatDisplay(e.target.value)}
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-500 dark:text-[#9ea3c8] block">
                  Initial Keywords <span className="font-normal">— one per line: <code className="text-xs text-indigo-500 font-mono">Keyword Name,Weight,Alias1,Alias2</code></span>
                </label>
                <textarea
                  className="px-4 py-2.5 rounded-xl bg-slate-50 dark:bg-white/5 border border-slate-200 dark:border-white/10 text-xs md:text-sm text-[var(--text)] outline-none focus:border-indigo-500 transition w-full font-mono min-h-[160px] resize-y"
                  rows={8}
                  value={newCatKeywordsRaw}
                  onChange={e => setNewCatKeywordsRaw(e.target.value)}
                  placeholder={"Supply Chain,9,SCM,Logistics\nInventory Management,8,WMS,Stock Control\nVendor Management,7,Procurement,Sourcing"}
                />
                <p className="text-[10px] text-slate-400 dark:text-gray-500 mt-1">
                  Format: <code className="font-mono bg-slate-100 dark:bg-white/5 px-1 py-0.5 rounded">Keyword Name,Weight(1-10),Alias1,Alias2,...</code> — Weight is optional (default: 7)
                </p>
              </div>

              {/* Preview */}
              {newCatKeywordsRaw.trim() && (
                <div className="p-4 rounded-xl bg-slate-50 dark:bg-white/5 border border-slate-200/60 dark:border-white/5 space-y-2">
                  <span className="text-[10px] font-bold text-slate-500 dark:text-[#9ea3c8] uppercase tracking-wider block">Preview ({newCatKeywordsRaw.split("\n").filter(l => l.trim()).length} keywords):</span>
                  <div className="flex flex-wrap gap-1.5">
                    {newCatKeywordsRaw.split("\n").filter(l => l.trim()).map((line, i) => {
                      const parts = line.split(",");
                      const kw = parts[0]?.trim();
                      const wt = parseInt(parts[1]?.trim()) || 7;
                      if (!kw) return null;
                      return (
                        <span key={i} className="px-2 py-0.5 rounded text-[10px] bg-white dark:bg-white/5 text-slate-700 dark:text-gray-300 font-semibold border border-slate-200/40 dark:border-white/5 flex items-center gap-1.5">
                          <span className="font-extrabold" style={{ color: WEIGHT_COLORS[wt] }}>{wt}</span>
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
                className="px-6 py-3 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs md:text-sm rounded-xl border-none cursor-pointer transition flex items-center gap-1.5 disabled:opacity-50"
              >
                {createCatLoading ? <><div className="spinner w-4 h-4" /> Creating...</> : <><FolderPlus size={15} /> Create Category</>}
              </button>
            </div>
          </div>
        )}

        {/* ═══════════════════ TAB: AI SCANNER ═════════════════════════════════ */}
        {mainTab === "scanner" && (
          <div className="space-y-6">
            <div className="flex gap-2 border-b border-slate-200 dark:border-white/10 pb-2 overflow-x-auto no-scrollbar">
              {[{ key: "scan", label: "🤖 AI Scan" }, { key: "pending", label: `⏳ Pending Queue (${pendingKeywords.length})` }].map(t => {
                const isScannerSubActive = scannerSubTab === t.key;
                return (
                  <button 
                    key={t.key} 
                    onClick={() => setScannerSubTab(t.key as any)} 
                    className={`
                      px-4 py-2 rounded-xl font-bold text-xs transition border cursor-pointer whitespace-nowrap
                      ${isScannerSubActive
                        ? "bg-indigo-600/10 border-indigo-200 dark:border-indigo-500/20 text-indigo-600 dark:text-indigo-400 font-bold"
                        : "bg-transparent border-transparent text-slate-500 dark:text-gray-400 hover:bg-slate-100 dark:hover:bg-white/5"
                      }
                    `}
                  >
                    {t.label}
                  </button>
                );
              })}
            </div>

            {scannerSubTab === "scan" && (
              <div className="p-6 md:p-8 rounded-2xl bg-white/80 dark:bg-slate-950/40 dark:bg-gradient-to-br dark:from-white/[0.05] dark:to-white/[0.01] border border-slate-200/60 dark:border-white/10 shadow-sm dark:shadow-xl space-y-6">
                <div>
                  <h2 className="text-xl font-extrabold font-['Syne',sans-serif] text-slate-900 dark:text-white m-0">AI Market Trend Scanner</h2>
                  <p className="text-xs text-slate-500 dark:text-gray-400 mt-1">
                    Let AI discover new emerging keywords for a category and add them to the pending queue for your review.
                  </p>
                </div>
                <div className="flex flex-wrap gap-3 items-center">
                  <select 
                    className="px-4 py-2.5 rounded-xl bg-slate-50 dark:bg-white/5 border border-slate-200 dark:border-white/10 text-xs md:text-sm text-[var(--text)] outline-none focus:border-indigo-500 transition w-72" 
                    value={scanIndustry} 
                    onChange={e => setScanIndustry(e.target.value)}
                  >
                    {Object.entries(allCategories).map(([key, d]) => (
                      <option key={key} value={key}>{d.displayName}</option>
                    ))}
                  </select>
                  <button 
                    className="px-5 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs md:text-sm rounded-xl border-none cursor-pointer transition disabled:opacity-50" 
                    onClick={runAIScanner} 
                    disabled={scanLoading}
                  >
                    {scanLoading ? "Scanning..." : "🔍 Run AI Scan"}
                  </button>
                </div>
                {scanResults.length > 0 && (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {scanResults.map((kw, i) => (
                      <div key={kw.id || i} className="p-4 rounded-xl bg-indigo-50/50 dark:bg-indigo-500/[0.02] border border-indigo-100 dark:border-indigo-500/10 space-y-3">
                        <div className="flex justify-between items-center">
                          <span className="font-bold text-slate-900 dark:text-white">{kw.keyword}</span>
                          <span className="text-xs font-bold" style={{ color: WEIGHT_COLORS[kw.weight] }}>{kw.weight}/10</span>
                        </div>
                        <p className="text-[11px] text-slate-500 dark:text-gray-400 m-0">
                          {kw.aliases?.length > 0 ? `Aliases: ${kw.aliases.join(", ")}` : "No aliases"}
                        </p>
                        {kw.id && (
                          <div className="flex gap-2 pt-2">
                            <button 
                              className="flex-1 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-lg border-none cursor-pointer transition" 
                              onClick={() => handleAction(kw.id, "approve", "scan")}
                            >
                              ✓ Approve
                            </button>
                            <button 
                              className="flex-1 py-1.5 bg-slate-100 hover:bg-slate-200 dark:bg-white/5 dark:hover:bg-white/10 border border-slate-200 dark:border-white/10 text-rose-500 font-bold text-xs rounded-lg cursor-pointer transition" 
                              onClick={() => handleAction(kw.id, "reject", "scan")}
                            >
                              ✕ Reject
                            </button>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {scannerSubTab === "pending" && (
              <div className="p-6 md:p-8 rounded-2xl bg-white/80 dark:bg-slate-950/40 dark:bg-gradient-to-br dark:from-white/[0.05] dark:to-white/[0.01] border border-slate-200/60 dark:border-white/10 shadow-sm dark:shadow-xl space-y-6">
                <div className="flex justify-between items-center">
                  <h2 className="text-xl font-extrabold font-['Syne',sans-serif] text-slate-900 dark:text-white m-0">Pending Queue ({pendingKeywords.length})</h2>
                  {pendingKeywords.length > 0 && (
                    <button 
                      className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-xl border-none cursor-pointer transition" 
                      onClick={() => setApproveAllConfirmOpen(true)} 
                      disabled={pendingLoading}
                    >
                      Approve All
                    </button>
                  )}
                </div>
                {pendingLoading ? <div className="spinner mx-auto" /> : pendingKeywords.length === 0 ? (
                  <p className="text-slate-500 dark:text-gray-400 text-center py-8 text-xs md:text-sm">No pending keywords. Run the AI scanner to add some!</p>
                ) : (
                  <div className="grid gap-3">
                    {pendingKeywords.map(kw => (
                      <div key={kw.id} className="flex flex-wrap justify-between items-center p-4 bg-indigo-50/50 dark:bg-indigo-500/[0.02] border border-indigo-100 dark:border-indigo-500/10 rounded-xl gap-4">
                        <div>
                          <strong className="text-slate-900 dark:text-white text-xs md:text-sm">{kw.keyword}</strong>
                          <span className="text-[10px] text-slate-500 dark:text-gray-400 ml-2 font-mono">({kw.industry}) — Weight: {kw.weight}</span>
                          {kw.aliases?.length > 0 && <div className="text-[10px] text-slate-400 dark:text-gray-500 mt-1">Aliases: {kw.aliases.join(", ")}</div>}
                        </div>
                        <div className="flex gap-2">
                          <button 
                            className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-lg border-none cursor-pointer transition" 
                            onClick={() => handleAction(kw.id, "approve", "pending")}
                          >
                            ✓ Approve
                          </button>
                          <button 
                            className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 dark:bg-white/5 dark:hover:bg-white/10 border border-slate-200 dark:border-white/10 text-rose-500 font-bold text-xs rounded-lg cursor-pointer transition" 
                            onClick={() => handleAction(kw.id, "reject", "pending")}
                          >
                            Reject
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>
        )}
        </main>
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
