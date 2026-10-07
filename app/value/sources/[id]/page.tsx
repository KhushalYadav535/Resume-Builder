"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import Navbar from "@/components/Navbar";
import { useAuth } from "@/hooks/useAuth";
import { SourceDetail, CareerFact } from "@/types/value";
import {
  ChevronRight,
  ArrowLeft,
  ArrowRight,
  FileText,
  ShieldCheck,
  CheckCircle2,
  Calendar,
  Layers,
  Database,
  ExternalLink,
  Loader2,
} from "lucide-react";

export default function SourceDetailPage() {
  const params = useParams();
  const router = useRouter();
  const { user, loading: authLoading } = useAuth();

  const id = params?.id as string;
  const [source, setSource] = useState<SourceDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeCategory, setActiveCategory] = useState<string>("ALL");

  useEffect(() => {
    if (!authLoading && !user) {
      router.push("/login");
    }
  }, [authLoading, user, router]);

  useEffect(() => {
    if (!user || !id) return;
    setLoading(true);
    fetch(`/api/value/sources/${id}`)
      .then((res) => res.json())
      .then((data) => {
        if (data.source) {
          setSource(data.source);
        }
      })
      .catch((err) => console.error("Error loading source:", err))
      .finally(() => setLoading(false));
  }, [user, id]);

  if (loading) {
    return (
      <div className="min-h-screen bg-[var(--bg)] flex flex-col font-sans">
        <Navbar />
        <div className="max-w-4xl mx-auto px-4 py-12 w-full flex items-center justify-center">
          <Loader2 className="animate-spin text-amber-500" size={32} />
        </div>
      </div>
    );
  }

  if (!source) {
    return (
      <div className="min-h-screen bg-[var(--bg)] flex flex-col font-sans">
        <Navbar />
        <div className="max-w-4xl mx-auto px-4 py-12 w-full text-center space-y-4">
          <h2 className="text-xl font-bold text-[var(--text-primary)]">Source provenance not found</h2>
          <Link href="/value" className="inline-block px-4 py-2 rounded-xl bg-amber-500 text-brand-navy font-bold text-xs">
            Return to Career Value
          </Link>
        </div>
      </div>
    );
  }

  // Filtered facts based on selected category tab
  const displayedCategories =
    activeCategory === "ALL"
      ? source.categories
      : source.categories.filter((c) => c.category === activeCategory);

  return (
    <div className="min-h-screen bg-[var(--bg)] flex flex-col font-sans">
      <Navbar />

      <main className="max-w-4xl mx-auto px-4 sm:px-6 py-6 w-full flex-1 space-y-6">
        {/* Spec §25: Breadcrumbs (Value > Sources > Source) */}
        <nav aria-label="Breadcrumb" className="flex items-center gap-2 text-xs font-bold text-[var(--text-muted)] flex-wrap">
          <Link href="/value" className="hover:text-[var(--text-primary)] transition-colors">
            Value
          </Link>
          <ChevronRight size={13} />
          <Link href="/value?tab=facts" className="hover:text-[var(--text-primary)] transition-colors">
            Facts
          </Link>
          <ChevronRight size={13} />
          <span className="text-amber-500 font-extrabold truncate max-w-xs">{source.name}</span>
        </nav>

        {/* Spec §22: Source Header */}
        <div className="relative rounded-[1.75rem] bg-[var(--card)] border border-[var(--border)] p-6 sm:p-8 overflow-hidden shadow-[0_20px_60px_rgba(16,27,59,0.08)] space-y-4">
          <div className="h-[3px] absolute top-0 inset-x-0 bg-gradient-to-r from-amber-500 via-emerald-500 to-sky-500" aria-hidden="true" />
          
          <div className="flex items-center justify-between gap-3 flex-wrap">
            <span className="px-2.5 py-0.5 rounded-full text-[11px] font-black uppercase tracking-wider bg-sky-500/15 text-sky-600 dark:text-sky-400 border border-sky-500/30">
              Level 5 · Source Provenance
            </span>

            <span className="text-xs text-[var(--text-muted)] flex items-center gap-1 font-semibold">
              <Calendar size={13} />
              Uploaded: {source.uploadedAt ? new Date(source.uploadedAt).toLocaleDateString() : "Active Record"}
            </span>
          </div>

          <div className="space-y-1.5">
            <h1 className="text-2xl sm:text-3xl font-black text-[var(--text-primary)] font-['Syne',sans-serif]">
              {source.name}
            </h1>
            <p className="text-xs sm:text-sm text-[var(--text-secondary)]">
              Source document used as root grounding for atomic Career Facts and AI derivations.
            </p>
          </div>

          {/* Spec §23: Source Summary Metric Cards */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-2">
            <div className="p-3.5 rounded-2xl bg-[var(--bg-elevated)] border border-[var(--border)] space-y-0.5">
              <span className="text-[10px] font-bold text-[var(--text-muted)] uppercase tracking-wider">Total Facts</span>
              <div className="text-2xl font-black text-[var(--text-primary)] font-['Syne',sans-serif]">
                {source.summary.totalFacts}
              </div>
            </div>

            <div className="p-3.5 rounded-2xl bg-[var(--bg-elevated)] border border-[var(--border)] space-y-0.5">
              <span className="text-[10px] font-bold text-emerald-600 dark:text-emerald-400 uppercase tracking-wider">Confirmed</span>
              <div className="text-2xl font-black text-emerald-600 dark:text-emerald-400 font-['Syne',sans-serif]">
                {source.summary.confirmedFacts}
              </div>
            </div>

            <div className="p-3.5 rounded-2xl bg-[var(--bg-elevated)] border border-[var(--border)] space-y-0.5">
              <span className="text-[10px] font-bold text-amber-600 dark:text-amber-400 uppercase tracking-wider">Edited</span>
              <div className="text-2xl font-black text-amber-600 dark:text-amber-400 font-['Syne',sans-serif]">
                {source.summary.editedFacts}
              </div>
            </div>

            <div className="p-3.5 rounded-2xl bg-[var(--bg-elevated)] border border-[var(--border)] space-y-0.5">
              <span className="text-[10px] font-bold text-red-500 uppercase tracking-wider">Rejected</span>
              <div className="text-2xl font-black text-red-500 font-['Syne',sans-serif]">
                {source.summary.rejectedFacts}
              </div>
            </div>
          </div>
        </div>

        {/* Spec §24: Category Tabs */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 bg-[var(--card)] border border-[var(--border)] p-2 rounded-2xl">
          <button
            onClick={() => setActiveCategory("ALL")}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all shrink-0 cursor-pointer ${
              activeCategory === "ALL"
                ? "bg-amber-500 text-brand-navy shadow-sm"
                : "text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-elevated)]"
            }`}
          >
            All Categories ({source.summary.totalFacts})
          </button>
          {source.categories.map((c) => (
            <button
              key={c.category}
              onClick={() => setActiveCategory(c.category)}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all shrink-0 cursor-pointer ${
                activeCategory === c.category
                  ? "bg-amber-500 text-brand-navy shadow-sm"
                  : "text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-elevated)]"
              }`}
            >
              {c.label} ({c.count})
            </button>
          ))}
        </div>

        {/* Facts Grouped by Category */}
        <div className="space-y-5">
          {displayedCategories.map((catGroup) => (
            <div
              key={catGroup.category}
              className="p-6 rounded-3xl bg-[var(--card)] border border-[var(--border)] space-y-3"
            >
              <div className="flex items-center justify-between border-b border-[var(--border)] pb-3">
                <h3 className="text-xs font-black uppercase tracking-wider text-[var(--text-primary)] flex items-center gap-2">
                  <Database size={14} className="text-amber-500" />
                  <span>{catGroup.label}</span>
                </h3>
                <span className="text-xs text-[var(--text-muted)] font-semibold">
                  {catGroup.facts.length} fact{catGroup.facts.length !== 1 ? "s" : ""}
                </span>
              </div>

              <div className="space-y-2.5">
                {catGroup.facts.map((fact) => (
                  <div
                    key={fact.id}
                    className="p-3.5 rounded-xl bg-[var(--bg-elevated)] border border-[var(--border)] flex items-start justify-between gap-3 text-xs"
                  >
                    <div className="space-y-1">
                      <p className="font-semibold text-[var(--text-primary)] leading-relaxed">
                        {fact.statement}
                      </p>
                      <div className="text-[10px] text-[var(--text-muted)] flex items-center gap-2">
                        <span>Status: <strong className="text-[var(--text-secondary)]">{fact.status}</strong></span>
                        {fact.sourceDate && <span>· {fact.sourceDate}</span>}
                      </div>
                    </div>

                    <Link
                      href={`/value/facts/${fact.id}`}
                      className="px-2.5 py-1 rounded-lg bg-[var(--card)] hover:bg-amber-500/10 border border-[var(--border)] text-[11px] font-bold text-amber-500 shrink-0 transition-colors"
                    >
                      Fact Detail
                    </Link>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </main>
    </div>
  );
}
