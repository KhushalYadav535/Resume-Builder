"use client";

import { useEffect, useState, useCallback } from "react";
import { useAuth } from "@/hooks/useAuth";
import { createClient } from "@/utils/supabase/client";
import { ConfirmationModal } from "@/components/ui/ConfirmationModal";
import { useToast } from "@/components/ui/toast-1";
import {
  ShieldCheck,
  Brain,
  Plus,
  Trash2,
  Edit3,
  Check,
  X,
  Search,
  Layers,
  RefreshCw,
  Save,
  PlusCircle,
  FolderPlus,
  Sparkles,
  Key,
  CheckCircle2,
  AlertCircle,
  Clock,
  ArrowRight,
  TrendingUp,
  Cpu,
  Sliders,
  Tag
} from "lucide-react";

interface Keyword {
  keyword: string;
  weight: number;
  aliases: string[];
  is_active?: boolean;
  expires_on?: string;
}

interface CategoryData {
  base: Keyword[];
  dynamic: Keyword[];
  displayName: string;
}

const getWeightStyle = (weight: number) => {
  if (weight >= 8) {
    return {
      text: "text-teal-600 dark:text-teal-400",
      bg: "bg-teal-500/10",
      border: "border-teal-500/25",
      label: "Critical",
    };
  }
  if (weight >= 5) {
    return {
      text: "text-amber-600 dark:text-amber-400",
      bg: "bg-amber-500/10",
      border: "border-amber-500/25",
      label: "Core",
    };
  }
  return {
    text: "text-slate-500 dark:text-slate-400",
    bg: "bg-slate-500/10",
    border: "border-slate-500/25",
    label: "Auxiliary",
  };
};

const KeywordsSkeleton = () => (
  <div className="grid gap-6 animate-pulse" style={{ gridTemplateColumns: "260px 1fr" }}>
    <div className="h-[450px] rounded-2xl bg-[var(--bg-elevated)] border border-[var(--border)]" />
    <div className="space-y-6">
      <div className="h-20 rounded-2xl bg-[var(--bg-elevated)] border border-[var(--border)]" />
      <div className="h-[350px] rounded-2xl bg-[var(--bg-elevated)] border border-[var(--border)]" />
    </div>
  </div>
);

export default function AdminKeywordsPage() {
  const { user, loading: authLoading } = useAuth();
  const { showToast } = useToast();
  const [isAdmin, setIsAdmin] = useState<boolean | null>(null);
  const [mainTab, setMainTab] = useState<"manage" | "create" | "scanner">("manage");
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
  const [catSearch, setCatSearch] = useState("");

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
      supabase
        .from("user_profiles")
        .select("role")
        .eq("id", user.id)
        .maybeSingle()
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
    } catch (e) {
      showToast("Failed to load keyword categories.", "error");
    }
    setCatLoading(false);
  }, [selectedCategory]);

  useEffect(() => {
    if (isAdmin) {
      fetchCategories();
      fetchPending();
    }
  }, [isAdmin]);

  useEffect(() => {
    if (isAdmin && scannerSubTab === "pending") fetchPending();
  }, [scannerSubTab, isAdmin]);

  const fetchPending = async () => {
    setPendingLoading(true);
    const { data } = await supabase
      .from("pending_keywords")
      .select("*")
      .eq("status", "pending")
      .order("created_at", { ascending: false });
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
        body: JSON.stringify({ industry: scanIndustry }),
      });
      const data = await res.json();
      if (res.ok && data.success) {
        setScanResults(data.suggestions || []);
        showToast(`Discovered ${data.suggestions?.length || 0} candidate keywords!`, "success");
      } else {
        showToast("Scan failed: " + data.error, "error");
      }
    } catch {
      showToast("Error running AI keyword discovery.", "error");
    }
    setScanLoading(false);
  };

  const handleAction = async (id: string, action: "approve" | "reject", source: "scan" | "pending") => {
    const res = await fetch("/api/admin/keyword-approve", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ keywordId: id, action }),
    });
    if (res.ok) {
      if (source === "scan") setScanResults((prev) => prev.filter((k) => k.id !== id));
      else setPendingKeywords((prev) => prev.filter((k) => k.id !== id));
      if (action === "approve") {
        fetchCategories();
      }
      showToast(`${action === "approve" ? "Approved & indexed ✓" : "Rejected"}`, "success");
    } else {
      showToast("Action failed", "error");
    }
  };

  const executeApproveAllPending = async () => {
    setPendingLoading(true);
    let ok = 0;
    for (const kw of pendingKeywords) {
      const res = await fetch("/api/admin/keyword-approve", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ keywordId: kw.id, action: "approve" }),
      });
      if (res.ok) ok++;
    }
    showToast(`Approved & indexed ${ok}/${pendingKeywords.length} keywords.`, "success");
    fetchPending();
    fetchCategories();
  };

  // ─── Keyword CRUD ──────────────────────────────────────────────────────────
  const handleAddKeyword = async () => {
    if (!newKwKeyword.trim() || !selectedCategory) return;
    setNewKwSaving(true);
    const res = await fetch("/api/admin/keyword-base-add", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        industry: selectedCategory,
        keyword: newKwKeyword.trim(),
        weight: newKwWeight,
        aliases: newKwAliases,
      }),
    });
    const data = await res.json();
    if (res.ok) {
      showToast(`'${newKwKeyword}' added to index!`, "success");
      setNewKwKeyword("");
      setNewKwAliases("");
      setNewKwWeight(7);
      setAddingKw(false);
      fetchCategories();
    } else {
      showToast(data.error || "Failed to add keyword", "error");
    }
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
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        industry: selectedCategory,
        originalKeyword: editingKw.keyword,
        updated: { keyword: editKwKeyword, weight: editKwWeight, aliases: editKwAliases },
      }),
    });
    const data = await res.json();
    if (res.ok) {
      showToast("Keyword updated successfully!", "success");
      setEditingKw(null);
      fetchCategories();
    } else {
      showToast(data.error || "Edit failed", "error");
    }
    setEditKwSaving(false);
  };

  const handleDeleteKeyword = async () => {
    if (!deleteConfirm || !selectedCategory) return;
    const res = await fetch("/api/admin/keyword-delete", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        industry: selectedCategory,
        keyword: deleteConfirm.keyword,
        layer: deleteConfirm.layer,
      }),
    });
    const data = await res.json();
    if (res.ok) {
      showToast(`'${deleteConfirm.keyword}' removed from index.`, "success");
      setDeleteConfirm(null);
      fetchCategories();
    } else {
      showToast(data.error || "Delete failed", "error");
    }
  };

  // ─── Create Category ───────────────────────────────────────────────────────
  const handleCreateCategory = async () => {
    if (!newCatSlug.trim() || !newCatDisplay.trim()) {
      showToast("Please fill in category slug and display name", "error");
      return;
    }
    setCreateCatLoading(true);

    const keywords = newCatKeywordsRaw
      .split("\n")
      .map((line) => line.trim())
      .filter(Boolean)
      .map((line) => {
        const parts = line.split(",");
        return {
          keyword: parts[0]?.trim() || "",
          weight: parseInt(parts[1]?.trim()) || 7,
          aliases: parts.slice(2).map((a) => a.trim()).filter(Boolean),
        };
      })
      .filter((k) => k.keyword);

    const res = await fetch("/api/admin/category-create", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name: newCatSlug, displayName: newCatDisplay, keywords }),
    });
    const data = await res.json();
    if (res.ok) {
      showToast(`Category '${data.category.displayName}' created with ${data.category.keywordCount} keywords!`, "success");
      setNewCatSlug("");
      setNewCatDisplay("");
      setNewCatKeywordsRaw("Keyword Name,8,Alias1,Alias2");
      setSelectedCategory(data.category.slug);
      setMainTab("manage");
      fetchCategories();
    } else {
      showToast(data.error || "Failed to create category", "error");
    }
    setCreateCatLoading(false);
  };

  // ─── Derived Metrics ───────────────────────────────────────────────────────
  const catData = selectedCategory ? allCategories[selectedCategory] : null;
  const allCatKeys = Object.keys(allCategories).sort();
  
  const totalKeywordsAcrossAll = Object.values(allCategories).reduce(
    (acc, cat) => acc + (cat.base?.length || 0) + (cat.dynamic?.length || 0),
    0
  );

  const filteredCategories = allCatKeys.filter((key) => {
    const d = allCategories[key];
    return (
      catSearch.trim() === "" ||
      d.displayName.toLowerCase().includes(catSearch.toLowerCase()) ||
      key.toLowerCase().includes(catSearch.toLowerCase())
    );
  });

  const filteredKeywords = catData
    ? (manageSubTab === "base" ? catData.base : catData.dynamic).filter(
        (k) =>
          !kwSearch ||
          k.keyword.toLowerCase().includes(kwSearch.toLowerCase()) ||
          k.aliases?.some((a) => a.toLowerCase().includes(kwSearch.toLowerCase()))
      )
    : [];

  if (authLoading || isAdmin === null) {
    return (
      <div className="min-h-screen bg-[var(--bg-page)] flex items-center justify-center">
        <div className="spinner w-8 h-8" />
      </div>
    );
  }

  if (isAdmin === false) {
    return (
      <div className="py-24 text-center">
        <h3 className="text-xl font-extrabold font-['Syne',sans-serif] text-rose-500">
          🔒 Forbidden: Administrators only
        </h3>
      </div>
    );
  }

  return (
    <div className="space-y-8 font-sans">
      
      {/* ── EXECUTIVE HEADER ── */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 pb-6 border-b border-[var(--border)]">
        <div className="space-y-2">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-500/10 border border-amber-500/25 text-amber-600 dark:text-amber-400 text-xs font-bold uppercase tracking-wider">
            <Sparkles size={12} className="text-amber-500" />
            <span>UPROLE PLATFORM COMMAND · ATS PARSER & KEYWORDS ENGINE</span>
          </div>

          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#101B3B] to-[#2563EB] flex items-center justify-center text-white shadow-md border border-white/10 shrink-0">
              <Key size={22} className="text-amber-400" />
            </div>
            <h1 className="text-2xl md:text-3xl font-extrabold tracking-tight text-[var(--text-primary)] font-['Syne',sans-serif]">
              ATS Keyword Weights & Parser Rules
            </h1>
          </div>

          <p className="text-sm text-[var(--text-muted)] max-w-2xl leading-relaxed">
            Calibrate industry keyword banks, manage base & dynamic skill weights, inspect parser aliases, and discover market trends using AI.
          </p>
        </div>

        {/* Action Controls */}
        <div className="flex items-center gap-3 self-start md:self-center shrink-0">
          <button
            onClick={() => {
              fetchCategories();
              fetchPending();
            }}
            disabled={catLoading}
            className="px-3.5 py-2 rounded-xl bg-[var(--bg-elevated)] border border-[var(--border)] text-xs font-bold text-[var(--text-primary)] hover:border-amber-500/40 hover:bg-amber-500/10 transition-all flex items-center gap-2 cursor-pointer shadow-xs"
          >
            <RefreshCw
              size={13}
              className={catLoading ? "animate-spin text-amber-500" : "text-[var(--text-muted)]"}
            />
            <span>Refresh Index</span>
          </button>
        </div>
      </div>

      {/* ── METRICS OVERVIEW BAR ── */}
      <section className="bg-[var(--bg-elevated)] border border-[var(--border)] rounded-2xl p-4 md:p-5 shadow-sm backdrop-blur-xl relative overflow-hidden">
        <div className="absolute top-0 left-0 right-0 h-[2px] bg-gradient-to-r from-[#2563EB] via-[#F59E0B] to-[#14B8A6]" />
        
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 divide-y sm:divide-y-0 sm:divide-x divide-[var(--border)]">
          {/* Stat 1: Total Industries */}
          <div className="pt-2 sm:pt-0 sm:px-3 first:px-0">
            <div className="flex items-center gap-2 mb-1 text-xs font-extrabold text-[var(--text-muted)] uppercase tracking-wider">
              <div className="w-5 h-5 rounded-md bg-blue-500/10 text-blue-500 flex items-center justify-center">
                <Layers size={12} />
              </div>
              <span>Industries</span>
            </div>
            <div className="text-2xl md:text-3xl font-black text-[var(--text-primary)] font-['Syne',sans-serif]">
              {allCatKeys.length}
            </div>
            <div className="text-[11px] text-[var(--text-muted)] mt-0.5">
              Active taxonomy categories
            </div>
          </div>

          {/* Stat 2: Total Indexed Keywords */}
          <div className="pt-2 sm:pt-0 sm:px-3">
            <div className="flex items-center gap-2 mb-1 text-xs font-extrabold text-[var(--text-muted)] uppercase tracking-wider">
              <div className="w-5 h-5 rounded-md bg-teal-500/10 text-teal-500 flex items-center justify-center">
                <Key size={12} />
              </div>
              <span>Total Keywords</span>
            </div>
            <div className="text-2xl md:text-3xl font-black text-teal-500 font-['Syne',sans-serif]">
              {totalKeywordsAcrossAll.toLocaleString()}
            </div>
            <div className="text-[11px] text-[var(--text-muted)] mt-0.5">
              Base + dynamic indexed skills
            </div>
          </div>

          {/* Stat 3: Pending Queue */}
          <div className="pt-2 sm:pt-0 sm:px-3">
            <div className="flex items-center gap-2 mb-1 text-xs font-extrabold text-[var(--text-muted)] uppercase tracking-wider">
              <div className="w-5 h-5 rounded-md bg-amber-500/10 text-amber-500 flex items-center justify-center">
                <Clock size={12} />
              </div>
              <span>Pending Queue</span>
            </div>
            <div className="text-2xl md:text-3xl font-black text-amber-500 font-['Syne',sans-serif]">
              {pendingKeywords.length}
            </div>
            <div className="text-[11px] text-[var(--text-muted)] mt-0.5">
              Awaiting admin approval
            </div>
          </div>

          {/* Stat 4: Parser Engine */}
          <div className="pt-2 sm:pt-0 sm:px-3">
            <div className="flex items-center gap-2 mb-1 text-xs font-extrabold text-[var(--text-muted)] uppercase tracking-wider">
              <div className="w-5 h-5 rounded-md bg-purple-500/10 text-purple-500 flex items-center justify-center">
                <Brain size={12} />
              </div>
              <span>AI Engine</span>
            </div>
            <div className="text-lg md:text-xl font-black text-[var(--text-primary)] mt-1 font-['Syne',sans-serif]">
              v2.4 Active
            </div>
            <div className="text-[11px] text-emerald-600 dark:text-emerald-400 mt-0.5 font-bold">
              ✓ Calibrated for Indian tech
            </div>
          </div>
        </div>
      </section>

      {/* ── MAIN TABS NAVIGATION ── */}
      <div className="flex gap-2 border-b border-[var(--border)] pb-3 overflow-x-auto [scrollbar-width:none]">
        {[
          { key: "manage", icon: <Layers size={14} />, label: "Manage Keyword Index" },
          { key: "create", icon: <FolderPlus size={14} />, label: "Add Industry Category" },
          { key: "scanner", icon: <Brain size={14} />, label: `AI Trend Scanner ${pendingKeywords.length > 0 ? `(${pendingKeywords.length})` : ""}` },
        ].map((t) => {
          const isSelected = mainTab === t.key;
          return (
            <button
              key={t.key}
              onClick={() => setMainTab(t.key as any)}
              className={`px-4 py-2 rounded-xl font-bold text-xs md:text-sm flex items-center gap-2 transition-all cursor-pointer whitespace-nowrap ${
                isSelected
                  ? "bg-amber-500 text-brand-navy font-black shadow-sm shadow-amber-500/25 border border-amber-500"
                  : "text-[var(--text-secondary)] bg-[var(--bg-elevated)] border border-[var(--border)] hover:border-amber-500/30 hover:text-[var(--text-primary)]"
              }`}
            >
              {t.icon}
              <span>{t.label}</span>
            </button>
          );
        })}
      </div>

      {/* ═══════════════════ TAB 1: MANAGE KEYWORDS ═══════════════════════════ */}
      {mainTab === "manage" && (
        catLoading && Object.keys(allCategories).length === 0 ? (
          <KeywordsSkeleton />
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 items-start">
            
            {/* Left: Category Sidebar (1 Col) */}
            <div className="lg:col-span-1 p-4 md:p-5 rounded-2xl bg-[var(--bg-elevated)] border border-[var(--border)] shadow-sm space-y-4 backdrop-blur-xl">
              <div className="flex justify-between items-center pb-2 border-b border-[var(--border)]">
                <span className="text-[11px] font-extrabold text-[var(--text-muted)] uppercase tracking-wider">
                  Categories ({allCatKeys.length})
                </span>
                <span className="text-[10px] text-amber-500 font-bold">Live Taxonomy</span>
              </div>

              {/* Category Search */}
              <div className="relative">
                <Search size={13} className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--text-muted)] pointer-events-none" />
                <input
                  type="text"
                  placeholder="Filter industries..."
                  value={catSearch}
                  onChange={(e) => setCatSearch(e.target.value)}
                  className="w-full pl-8 pr-3 py-1.5 rounded-xl bg-[var(--bg-page)] border border-[var(--border)] text-xs text-[var(--text-primary)] placeholder-[var(--text-muted)] focus:outline-none focus:border-amber-500/50 transition-all"
                />
              </div>

              <div className="flex flex-col gap-1 max-h-[60vh] overflow-y-auto pr-1 [scrollbar-width:none]">
                {filteredCategories.map((key) => {
                  const d = allCategories[key];
                  const isActive = selectedCategory === key;
                  const total = (d.base?.length || 0) + (d.dynamic?.length || 0);

                  return (
                    <button
                      key={key}
                      onClick={() => {
                        setSelectedCategory(key);
                        setKwSearch("");
                        setAddingKw(false);
                        setEditingKw(null);
                      }}
                      className={`w-full flex items-center justify-between p-2.5 rounded-xl border text-xs font-bold transition-all cursor-pointer text-left ${
                        isActive
                          ? "bg-amber-500/15 border-amber-500/30 text-amber-600 dark:text-amber-400 font-extrabold shadow-2xs"
                          : "bg-transparent border-transparent text-[var(--text-secondary)] hover:bg-[var(--bg-page)] hover:text-[var(--text-primary)]"
                      }`}
                    >
                      <span className="truncate mr-2">{d.displayName}</span>
                      <span className="text-[10px] px-2 py-0.5 rounded-md bg-[var(--bg-page)] text-[var(--text-muted)] font-mono shrink-0 border border-[var(--border)]">
                        {total}
                      </span>
                    </button>
                  );
                })}

                <button
                  onClick={() => setMainTab("create")}
                  className="w-full flex items-center justify-center gap-1.5 p-2.5 rounded-xl border border-dashed border-amber-500/30 bg-amber-500/5 hover:bg-amber-500/10 text-amber-600 dark:text-amber-400 text-xs font-bold cursor-pointer transition-all mt-2"
                >
                  <Plus size={13} /> Add Category
                </button>
              </div>
            </div>

            {/* Right: Keyword Editor Table (3 Cols) */}
            <div className="lg:col-span-3 space-y-5">
              {!catData ? (
                <div className="p-12 text-center rounded-2xl bg-[var(--bg-elevated)] border border-[var(--border)] text-[var(--text-muted)] shadow-sm">
                  {catLoading ? <div className="spinner mx-auto" /> : "Select a category from the sidebar to inspect keywords."}
                </div>
              ) : (
                <>
                  {/* Category Header Card */}
                  <div className="p-5 rounded-2xl bg-[var(--bg-elevated)] border border-[var(--border)] shadow-sm flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 backdrop-blur-xl">
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <h2 className="text-lg font-black text-[var(--text-primary)] font-['Syne',sans-serif]">
                          {catData.displayName}
                        </h2>
                        <span className="text-[10px] font-mono text-[var(--text-muted)] bg-[var(--bg-page)] px-2 py-0.5 rounded border border-[var(--border)]">
                          {selectedCategory}
                        </span>
                      </div>

                      <div className="flex items-center gap-2 text-xs">
                        <span className="px-2 py-0.5 rounded-md text-[10px] font-extrabold uppercase tracking-wider bg-blue-500/10 text-blue-600 dark:text-blue-400 border border-blue-500/20">
                          {catData.base.length} Base Rules
                        </span>
                        <span className="px-2 py-0.5 rounded-md text-[10px] font-extrabold uppercase tracking-wider bg-teal-500/10 text-teal-600 dark:text-teal-400 border border-teal-500/20">
                          {catData.dynamic.length} Dynamic
                        </span>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 w-full sm:w-auto">
                      <div className="relative flex-1 sm:w-56">
                        <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--text-muted)] pointer-events-none" />
                        <input
                          type="text"
                          placeholder="Search keywords..."
                          value={kwSearch}
                          onChange={(e) => setKwSearch(e.target.value)}
                          className="w-full pl-8 pr-3 py-1.5 rounded-xl bg-[var(--bg-page)] border border-[var(--border)] text-xs text-[var(--text-primary)] placeholder-[var(--text-muted)] focus:outline-none focus:border-amber-500/50 transition-all"
                        />
                      </div>

                      <button
                        onClick={() => {
                          setAddingKw(true);
                          setEditingKw(null);
                        }}
                        className="btn-primary inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl text-xs font-bold shadow-sm shadow-amber-500/20 cursor-pointer shrink-0"
                      >
                        <Plus size={14} />
                        <span>Add Keyword</span>
                      </button>
                    </div>
                  </div>

                  {/* Sub-tab: Base / Dynamic */}
                  <div className="flex gap-2 border-b border-[var(--border)] pb-2">
                    {(["base", "dynamic"] as const).map((tab) => {
                      const isSubActive = manageSubTab === tab;
                      return (
                        <button
                          key={tab}
                          onClick={() => setManageSubTab(tab)}
                          className={`px-3.5 py-1.5 rounded-xl font-bold text-xs transition border cursor-pointer ${
                            isSubActive
                              ? "bg-amber-500/15 border-amber-500/30 text-amber-600 dark:text-amber-400 font-extrabold"
                              : "bg-transparent border-transparent text-[var(--text-muted)] hover:bg-[var(--bg-elevated)] hover:text-[var(--text-primary)]"
                          }`}
                        >
                          {tab === "base" ? `📘 Core Base (${catData.base.length})` : `⚡ Dynamic LLM (${catData.dynamic.length})`}
                        </button>
                      );
                    })}
                  </div>

                  {/* Inline Add Keyword Form */}
                  {addingKw && (
                    <div className="p-5 rounded-2xl bg-[var(--bg-elevated)] border border-amber-500/30 shadow-md space-y-4 animate-in fade-in duration-200">
                      <div className="flex items-center justify-between">
                        <h4 className="text-xs font-extrabold uppercase tracking-wider text-amber-500 flex items-center gap-1.5">
                          <PlusCircle size={14} /> Add Keyword to {catData.displayName}
                        </h4>
                        <button
                          onClick={() => setAddingKw(false)}
                          className="text-[var(--text-muted)] hover:text-[var(--text-primary)] text-xs"
                        >
                          <X size={15} />
                        </button>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                        <div className="sm:col-span-2 space-y-1">
                          <label className="text-[11px] font-semibold text-[var(--text-secondary)]">
                            Keyword Name *
                          </label>
                          <input
                            type="text"
                            placeholder="e.g. Distributed Systems, Kubernetes"
                            value={newKwKeyword}
                            onChange={(e) => setNewKwKeyword(e.target.value)}
                            onKeyDown={(e) => e.key === "Enter" && handleAddKeyword()}
                            autoFocus
                            className="w-full px-3 py-2 rounded-xl bg-[var(--bg-page)] border border-[var(--border)] text-xs text-[var(--text-primary)] focus:outline-none focus:border-amber-500/50"
                          />
                        </div>

                        <div className="space-y-1">
                          <label className="text-[11px] font-semibold text-[var(--text-secondary)]">
                            Weight (1-10)
                          </label>
                          <input
                            type="number"
                            min={1}
                            max={10}
                            value={newKwWeight}
                            onChange={(e) => setNewKwWeight(parseInt(e.target.value) || 7)}
                            className="w-full px-3 py-2 rounded-xl bg-[var(--bg-page)] border border-[var(--border)] text-xs text-[var(--text-primary)] font-bold focus:outline-none focus:border-amber-500/50"
                          />
                        </div>
                      </div>

                      <div className="space-y-1">
                        <label className="text-[11px] font-semibold text-[var(--text-secondary)]">
                          Aliases (Comma-separated ATS variations)
                        </label>
                        <input
                          type="text"
                          placeholder="e.g. K8s, Container Orchestration, Microservices"
                          value={newKwAliases}
                          onChange={(e) => setNewKwAliases(e.target.value)}
                          className="w-full px-3 py-2 rounded-xl bg-[var(--bg-page)] border border-[var(--border)] text-xs text-[var(--text-primary)] focus:outline-none focus:border-amber-500/50"
                        />
                      </div>

                      <div className="flex gap-2 pt-2">
                        <button
                          onClick={handleAddKeyword}
                          disabled={newKwSaving || !newKwKeyword.trim()}
                          className="btn-primary px-4 py-2 rounded-xl text-xs font-bold cursor-pointer disabled:opacity-50"
                        >
                          {newKwSaving ? "Saving..." : "+ Save to Parser Index"}
                        </button>
                        <button
                          onClick={() => setAddingKw(false)}
                          className="px-3.5 py-2 rounded-xl text-xs font-bold text-[var(--text-muted)] hover:bg-[var(--bg-page)] transition-colors cursor-pointer"
                        >
                          Cancel
                        </button>
                      </div>
                    </div>
                  )}

                  {/* Keywords Table */}
                  <div className="rounded-2xl bg-[var(--bg-elevated)] border border-[var(--border)] shadow-sm backdrop-blur-xl overflow-hidden">
                    {filteredKeywords.length === 0 ? (
                      <div className="p-12 text-center text-xs text-[var(--text-muted)] space-y-2">
                        <p>{kwSearch ? `No keywords matching "${kwSearch}"` : `No ${manageSubTab} keywords populated yet.`}</p>
                        {kwSearch && (
                          <button
                            onClick={() => setKwSearch("")}
                            className="text-xs font-bold text-amber-500 hover:underline"
                          >
                            Clear Search
                          </button>
                        )}
                      </div>
                    ) : (
                      <div className="overflow-x-auto">
                        <table className="w-full border-collapse text-left text-xs">
                          <thead>
                            <tr className="border-b border-[var(--border)] bg-[var(--bg-page)]/60 text-[10px] font-extrabold uppercase tracking-wider text-[var(--text-muted)]">
                              <th className="px-5 py-3">Keyword Identity</th>
                              <th className="px-5 py-3">ATS Weight</th>
                              <th className="px-5 py-3">Aliases & Match Variants</th>
                              <th className="px-5 py-3 text-right">Actions</th>
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-[var(--border)]">
                            {filteredKeywords.map((kw, i) => {
                              const isEditing = editingKw?.keyword === kw.keyword && editingKw?.layer === manageSubTab;
                              const isExpired = kw.expires_on && new Date(kw.expires_on) < new Date();
                              const isActive = kw.is_active !== false && !isExpired;
                              const weightStyle = getWeightStyle(kw.weight);

                              return (
                                <tr
                                  key={kw.keyword + i}
                                  className={`hover:bg-[var(--bg-page)]/40 transition-colors ${
                                    isEditing ? "bg-amber-500/5" : ""
                                  }`}
                                >
                                  {isEditing ? (
                                    <td colSpan={4} className="p-4">
                                      <div className="grid grid-cols-1 sm:grid-cols-4 gap-3 items-center">
                                        <input
                                          type="text"
                                          value={editKwKeyword}
                                          onChange={(e) => setEditKwKeyword(e.target.value)}
                                          autoFocus
                                          className="px-3 py-1.5 rounded-xl bg-[var(--bg-page)] border border-[var(--border)] text-xs text-[var(--text-primary)] focus:outline-none focus:border-amber-500/50"
                                        />
                                        <input
                                          type="number"
                                          min={1}
                                          max={10}
                                          value={editKwWeight}
                                          onChange={(e) => setEditKwWeight(parseInt(e.target.value) || 7)}
                                          className="px-3 py-1.5 rounded-xl bg-[var(--bg-page)] border border-[var(--border)] text-xs text-[var(--text-primary)] font-bold focus:outline-none focus:border-amber-500/50 w-24"
                                        />
                                        <input
                                          type="text"
                                          placeholder="Aliases (comma-sep)"
                                          value={editKwAliases}
                                          onChange={(e) => setEditKwAliases(e.target.value)}
                                          className="px-3 py-1.5 rounded-xl bg-[var(--bg-page)] border border-[var(--border)] text-xs text-[var(--text-primary)] focus:outline-none focus:border-amber-500/50"
                                        />
                                        <div className="flex gap-1.5 justify-end">
                                          <button
                                            onClick={handleEditKeyword}
                                            disabled={editKwSaving}
                                            className="btn-primary px-3 py-1.5 rounded-lg text-xs font-bold flex items-center gap-1 cursor-pointer"
                                          >
                                            <Save size={13} /> Save
                                          </button>
                                          <button
                                            onClick={() => setEditingKw(null)}
                                            className="px-2.5 py-1.5 rounded-lg text-xs font-bold text-[var(--text-muted)] hover:bg-[var(--bg-page)] cursor-pointer"
                                          >
                                            <X size={13} />
                                          </button>
                                        </div>
                                      </div>
                                    </td>
                                  ) : (
                                    <>
                                      {/* Keyword Name */}
                                      <td className="px-5 py-3.5 font-bold text-[var(--text-primary)]">
                                        <div className="flex items-center gap-2">
                                          <span>{kw.keyword}</span>
                                          {manageSubTab === "dynamic" && (
                                            <span
                                              className={`px-1.5 py-0.5 rounded text-[9px] font-black uppercase tracking-wider ${
                                                isActive
                                                  ? "bg-teal-500/10 text-teal-600 dark:text-teal-400 border border-teal-500/20"
                                                  : "bg-rose-500/10 text-rose-600 dark:text-rose-400 border border-rose-500/20"
                                              }`}
                                            >
                                              {isActive ? "Active" : "Expired"}
                                            </span>
                                          )}
                                        </div>
                                      </td>

                                      {/* Weight Badge */}
                                      <td className="px-5 py-3.5">
                                        <span
                                          className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-md text-[11px] font-black border ${weightStyle.bg} ${weightStyle.text} ${weightStyle.border}`}
                                        >
                                          <span>{kw.weight}</span>
                                          <span className="text-[9px] opacity-70">/10 · {weightStyle.label}</span>
                                        </span>
                                      </td>

                                      {/* Aliases */}
                                      <td className="px-5 py-3.5">
                                        <div className="flex flex-wrap gap-1">
                                          {(kw.aliases || []).length > 0 ? (
                                            kw.aliases.slice(0, 4).map((a, ai) => (
                                              <span
                                                key={ai}
                                                className="px-2 py-0.5 rounded text-[10px] bg-[var(--bg-page)] text-[var(--text-secondary)] font-medium border border-[var(--border)]"
                                              >
                                                {a}
                                              </span>
                                            ))
                                          ) : (
                                            <span className="text-[var(--text-muted)] text-[11px]">—</span>
                                          )}
                                          {(kw.aliases || []).length > 4 && (
                                            <span className="text-[10px] text-[var(--text-muted)]">
                                              +{kw.aliases.length - 4} more
                                            </span>
                                          )}
                                        </div>
                                      </td>

                                      {/* Actions */}
                                      <td className="px-5 py-3.5 text-right">
                                        <div className="flex items-center justify-end gap-1.5">
                                          {manageSubTab === "base" && (
                                            <button
                                              onClick={() => startEdit(kw, "base")}
                                              className="px-2.5 py-1 rounded-lg text-xs font-bold text-[var(--text-secondary)] hover:text-amber-500 hover:bg-amber-500/10 border border-[var(--border)] transition-colors cursor-pointer"
                                            >
                                              <Edit3 size={12} />
                                            </button>
                                          )}
                                          <button
                                            onClick={() => setDeleteConfirm({ keyword: kw.keyword, layer: manageSubTab })}
                                            className="px-2.5 py-1 rounded-lg text-xs font-bold text-[var(--text-muted)] hover:text-rose-500 hover:bg-rose-500/10 border border-[var(--border)] transition-colors cursor-pointer"
                                          >
                                            <Trash2 size={12} />
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
        )
      )}

      {/* ═══════════════════ TAB 2: CREATE CATEGORY ═══════════════════════════ */}
      {mainTab === "create" && (
        <div className="max-w-3xl mx-auto">
          <div className="p-6 md:p-8 rounded-2xl bg-[var(--bg-elevated)] border border-[var(--border)] shadow-sm backdrop-blur-xl space-y-6">
            <div>
              <h2 className="text-xl font-extrabold text-[var(--text-primary)] font-['Syne',sans-serif] flex items-center gap-2">
                <FolderPlus size={20} className="text-amber-500" />
                <span>Create New ATS Industry Category</span>
              </h2>
              <p className="text-xs text-[var(--text-muted)] mt-1 leading-relaxed">
                Add a new industry category with initial skill banks. It will instantly calibrate in the Workday & Greenhouse ATS parsing engine.
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-[var(--text-secondary)]">
                  Category Slug * <span className="font-normal text-[var(--text-muted)]">(e.g. logistics_supply_chain)</span>
                </label>
                <input
                  type="text"
                  placeholder="e.g. logistics_supply_chain"
                  value={newCatSlug}
                  onChange={(e) =>
                    setNewCatSlug(e.target.value.toLowerCase().replace(/\s+/g, "_").replace(/[^a-z0-9_]/g, ""))
                  }
                  className="w-full px-3.5 py-2.5 rounded-xl bg-[var(--bg-page)] border border-[var(--border)] text-xs md:text-sm text-[var(--text-primary)] focus:outline-none focus:border-amber-500/50"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-bold text-[var(--text-secondary)]">
                  Display Label * <span className="font-normal text-[var(--text-muted)]">(shown in resume builder)</span>
                </label>
                <input
                  type="text"
                  placeholder="e.g. Logistics & Supply Chain"
                  value={newCatDisplay}
                  onChange={(e) => setNewCatDisplay(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-[var(--bg-page)] border border-[var(--border)] text-xs md:text-sm text-[var(--text-primary)] focus:outline-none focus:border-amber-500/50"
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-bold text-[var(--text-secondary)]">
                Initial Keywords Specification <span className="font-normal text-[var(--text-muted)]">(one per line)</span>
              </label>
              <textarea
                rows={7}
                value={newCatKeywordsRaw}
                onChange={(e) => setNewCatKeywordsRaw(e.target.value)}
                placeholder={"Supply Chain Optimization,9,SCM,Logistics\nInventory Forecasting,8,WMS,Demand Planning\nVendor Procurement,7,Sourcing,Supplier Relations"}
                className="w-full px-3.5 py-2.5 rounded-xl bg-[var(--bg-page)] border border-[var(--border)] text-xs text-[var(--text-primary)] font-mono focus:outline-none focus:border-amber-500/50 leading-relaxed resize-y"
              />
              <p className="text-[10px] text-[var(--text-muted)]">
                Format: <code className="font-mono bg-[var(--bg-page)] px-1.5 py-0.5 rounded border border-[var(--border)]">Keyword,Weight(1-10),Alias1,Alias2</code>
              </p>
            </div>

            <button
              onClick={handleCreateCategory}
              disabled={createCatLoading || !newCatSlug.trim() || !newCatDisplay.trim()}
              className="btn-primary inline-flex items-center gap-2 px-6 py-2.5 rounded-xl text-xs md:text-sm font-bold shadow-md shadow-amber-500/20 cursor-pointer disabled:opacity-50"
            >
              {createCatLoading ? "Compiling Category..." : "+ Compile & Deploy Category"}
            </button>
          </div>
        </div>
      )}

      {/* ═══════════════════ TAB 3: AI SCANNER ═════════════════════════════════ */}
      {mainTab === "scanner" && (
        <div className="space-y-6">
          <div className="flex gap-2 border-b border-[var(--border)] pb-2">
            {[
              { key: "scan", label: "🤖 AI Market Trend Discovery" },
              { key: "pending", label: `⏳ Pending Review Queue (${pendingKeywords.length})` },
            ].map((t) => {
              const isScannerSubActive = scannerSubTab === t.key;
              return (
                <button
                  key={t.key}
                  onClick={() => setScannerSubTab(t.key as any)}
                  className={`px-3.5 py-1.5 rounded-xl font-bold text-xs transition border cursor-pointer ${
                    isScannerSubActive
                      ? "bg-amber-500/15 border-amber-500/30 text-amber-600 dark:text-amber-400 font-extrabold"
                      : "bg-transparent border-transparent text-[var(--text-muted)] hover:bg-[var(--bg-elevated)] hover:text-[var(--text-primary)]"
                  }`}
                >
                  {t.label}
                </button>
              );
            })}
          </div>

          {scannerSubTab === "scan" && (
            <div className="p-6 md:p-8 rounded-2xl bg-[var(--bg-elevated)] border border-[var(--border)] shadow-sm backdrop-blur-xl space-y-6">
              <div>
                <h2 className="text-xl font-extrabold text-[var(--text-primary)] font-['Syne',sans-serif]">
                  AI Market Trend Keyword Discovery
                </h2>
                <p className="text-xs text-[var(--text-muted)] mt-1">
                  Discover newly emerging industry skills from live hiring benchmarks and push them directly to your review queue.
                </p>
              </div>

              <div className="flex flex-wrap gap-3 items-center">
                <select
                  value={scanIndustry}
                  onChange={(e) => setScanIndustry(e.target.value)}
                  className="px-4 py-2.5 rounded-xl bg-[var(--bg-page)] border border-[var(--border)] text-xs md:text-sm text-[var(--text-primary)] focus:outline-none focus:border-amber-500/50 w-72"
                >
                  {Object.entries(allCategories).map(([key, d]) => (
                    <option key={key} value={key}>
                      {d.displayName} ({key})
                    </option>
                  ))}
                </select>

                <button
                  onClick={runAIScanner}
                  disabled={scanLoading}
                  className="btn-primary inline-flex items-center gap-2 px-5 py-2.5 rounded-xl text-xs md:text-sm font-bold shadow-md shadow-amber-500/20 cursor-pointer disabled:opacity-50"
                >
                  {scanLoading ? "Analyzing Hiring Benchmarks..." : "🔍 Run AI Discovery Scan"}
                </button>
              </div>

              {scanResults.length > 0 && (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 pt-4">
                  {scanResults.map((kw, i) => (
                    <div
                      key={kw.id || i}
                      className="p-4 rounded-xl bg-[var(--bg-page)] border border-[var(--border)] hover:border-amber-500/30 transition-all space-y-3"
                    >
                      <div className="flex justify-between items-center">
                        <span className="font-extrabold text-sm text-[var(--text-primary)]">{kw.keyword}</span>
                        <span className="text-xs font-black text-amber-500">{kw.weight}/10</span>
                      </div>

                      <p className="text-[11px] text-[var(--text-muted)] m-0">
                        {kw.aliases?.length > 0 ? `Aliases: ${kw.aliases.join(", ")}` : "No aliases configured"}
                      </p>

                      {kw.id && (
                        <div className="flex gap-2 pt-2 border-t border-[var(--border)]">
                          <button
                            onClick={() => handleAction(kw.id, "approve", "scan")}
                            className="flex-1 py-1.5 bg-teal-600 hover:bg-teal-700 text-white font-bold text-xs rounded-lg transition-colors cursor-pointer"
                          >
                            ✓ Approve
                          </button>
                          <button
                            onClick={() => handleAction(kw.id, "reject", "scan")}
                            className="flex-1 py-1.5 bg-[var(--bg-elevated)] hover:bg-rose-500/10 text-rose-500 font-bold text-xs rounded-lg border border-[var(--border)] transition-colors cursor-pointer"
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
            <div className="p-6 md:p-8 rounded-2xl bg-[var(--bg-elevated)] border border-[var(--border)] shadow-sm backdrop-blur-xl space-y-6">
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div>
                  <h2 className="text-xl font-extrabold text-[var(--text-primary)] font-['Syne',sans-serif]">
                    Pending Verification Queue ({pendingKeywords.length})
                  </h2>
                  <p className="text-xs text-[var(--text-muted)] mt-1">
                    Review and approve automated discoveries before promoting them into the active ATS scoring rules.
                  </p>
                </div>

                {pendingKeywords.length > 0 && (
                  <button
                    onClick={() => setApproveAllConfirmOpen(true)}
                    disabled={pendingLoading}
                    className="btn-primary px-4 py-2 rounded-xl text-xs font-bold shadow-md shadow-amber-500/20 cursor-pointer"
                  >
                    ✓ Approve All ({pendingKeywords.length})
                  </button>
                )}
              </div>

              {pendingLoading ? (
                <div className="spinner mx-auto" />
              ) : pendingKeywords.length === 0 ? (
                <div className="text-center py-12 text-xs text-[var(--text-muted)] space-y-2">
                  <CheckCircle2 size={24} className="text-teal-500 mx-auto" />
                  <p className="font-bold text-[var(--text-primary)]">Pending Queue is Clear</p>
                  <p>All automated discoveries have been evaluated and indexed.</p>
                </div>
              ) : (
                <div className="grid gap-3">
                  {pendingKeywords.map((kw) => (
                    <div
                      key={kw.id}
                      className="flex flex-wrap justify-between items-center p-4 bg-[var(--bg-page)] border border-[var(--border)] rounded-xl gap-4"
                    >
                      <div>
                        <strong className="text-sm font-bold text-[var(--text-primary)]">{kw.keyword}</strong>
                        <span className="text-[11px] text-[var(--text-muted)] ml-2 font-mono">
                          ({kw.industry}) · Weight: {kw.weight}/10
                        </span>
                        {kw.aliases?.length > 0 && (
                          <div className="text-[11px] text-[var(--text-muted)] mt-0.5">
                            Aliases: {kw.aliases.join(", ")}
                          </div>
                        )}
                      </div>

                      <div className="flex gap-2">
                        <button
                          onClick={() => handleAction(kw.id, "approve", "pending")}
                          className="px-3.5 py-1.5 bg-teal-600 hover:bg-teal-700 text-white font-bold text-xs rounded-lg cursor-pointer transition-colors"
                        >
                          ✓ Approve
                        </button>
                        <button
                          onClick={() => handleAction(kw.id, "reject", "pending")}
                          className="px-3.5 py-1.5 bg-[var(--bg-elevated)] hover:bg-rose-500/10 text-rose-500 font-bold text-xs rounded-lg border border-[var(--border)] cursor-pointer transition-colors"
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

      {/* ── DELETE CONFIRMATION MODAL ── */}
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

      {/* ── APPROVE ALL CONFIRMATION MODAL ── */}
      <ConfirmationModal
        isOpen={approveAllConfirmOpen}
        title="Approve All Pending Keywords?"
        message="This will activate all pending candidate keywords into the production ATS scoring engine."
        confirmLabel="Approve All"
        cancelLabel="Cancel"
        isDanger={false}
        onConfirm={() => {
          setApproveAllConfirmOpen(false);
          executeApproveAllPending();
        }}
        onCancel={() => setApproveAllConfirmOpen(false)}
      />

    </div>
  );
}
