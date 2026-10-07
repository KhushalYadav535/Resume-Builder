"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import Navbar from "@/components/Navbar";
import { useAuth } from "@/hooks/useAuth";
import { CareerFact, DimensionSupport } from "@/types/value";
import {
  ChevronRight,
  ArrowLeft,
  ArrowRight,
  Layers,
  ShieldCheck,
  FileText,
  Calendar,
  CheckCircle2,
  Compass,
  Loader2,
} from "lucide-react";

interface EvidenceDetailData {
  id: string;
  title: string;
  statement: string;
  confidence: string;
  supports: DimensionSupport[];
  facts: CareerFact[];
  parentInterpretation?: {
    id: string;
    title: string;
    type: string;
    status: string;
  } | null;
}

export default function EvidenceDetailPage() {
  const params = useParams();
  const router = useRouter();
  const { user, loading: authLoading } = useAuth();

  const id = params?.id as string;
  const [evidence, setEvidence] = useState<EvidenceDetailData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!authLoading && !user) {
      router.push("/login");
    }
  }, [authLoading, user, router]);

  useEffect(() => {
    if (!user || !id) return;
    setLoading(true);
    fetch(`/api/value/evidence/${id}`)
      .then((res) => res.json())
      .then((data) => {
        if (data.evidence) {
          setEvidence(data.evidence);
        }
      })
      .catch((err) => console.error("Error loading evidence:", err))
      .finally(() => setLoading(false));
  }, [user, id]);

  if (loading) {
    return (
      <div className="min-h-screen bg-[var(--bg)] flex flex-col font-sans">
        <Navbar />
        <div className="max-w-4xl mx-auto px-4 py-12 w-full flex items-center justify-center">
          <Loader2 className="animate-spin text-emerald-500" size={32} />
        </div>
      </div>
    );
  }

  if (!evidence) {
    return (
      <div className="min-h-screen bg-[var(--bg)] flex flex-col font-sans">
        <Navbar />
        <div className="max-w-4xl mx-auto px-4 py-12 w-full text-center space-y-4">
          <h2 className="text-xl font-bold text-[var(--text-primary)]">Evidence cluster not found</h2>
          <Link href="/value" className="inline-block px-4 py-2 rounded-xl bg-emerald-500 text-white font-bold text-xs">
            Return to Career Value
          </Link>
        </div>
      </div>
    );
  }

  const parentInterp = evidence.parentInterpretation;

  return (
    <div className="min-h-screen bg-[var(--bg)] flex flex-col font-sans">
      <Navbar />

      <main className="max-w-4xl mx-auto px-4 sm:px-6 py-6 w-full flex-1 space-y-6">
        {/* Spec §25: Breadcrumbs (Value > Interpretation > Evidence) */}
        <nav aria-label="Breadcrumb" className="flex items-center gap-2 text-xs font-bold text-[var(--text-muted)] flex-wrap">
          <Link href="/value" className="hover:text-[var(--text-primary)] transition-colors">
            Value
          </Link>
          <ChevronRight size={13} />
          {parentInterp ? (
            <>
              <Link
                href={`/value/interpretations/${parentInterp.id}`}
                className="hover:text-[var(--text-primary)] transition-colors truncate max-w-[150px]"
              >
                {parentInterp.title}
              </Link>
              <ChevronRight size={13} />
            </>
          ) : (
            <>
              <Link href="/value/capabilities" className="hover:text-[var(--text-primary)] transition-colors">
                Capabilities
              </Link>
              <ChevronRight size={13} />
            </>
          )}
          <span className="text-emerald-500 font-extrabold truncate max-w-xs">{evidence.title}</span>
        </nav>

        {/* Spec §11 & §12: Evidence Header & Statement */}
        <div className="relative rounded-[1.75rem] bg-[var(--card)] border border-[var(--border)] p-6 sm:p-8 overflow-hidden shadow-[0_20px_60px_rgba(16,27,59,0.08)] space-y-4">
          <div className="h-[3px] absolute top-0 inset-x-0 bg-gradient-to-r from-emerald-500 via-teal-400 to-amber-500" aria-hidden="true" />
          
          <div className="flex items-center justify-between gap-3 flex-wrap">
            <span className="px-2.5 py-0.5 rounded-full text-[11px] font-black uppercase tracking-wider bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 border border-emerald-500/30">
              Level 3 · Evidence Detail
            </span>

            {/* Spec §15: Qualitative Evidence Confidence */}
            <span className="px-3 py-1 rounded-full text-xs font-bold bg-emerald-500/10 text-emerald-700 dark:text-emerald-300 border border-emerald-500/25 flex items-center gap-1.5">
              <ShieldCheck size={14} className="text-emerald-500" />
              <span>{evidence.confidence}</span>
            </span>
          </div>

          <div className="space-y-2">
            <h1 className="text-xl sm:text-2xl font-black text-[var(--text-primary)] font-['Syne',sans-serif]">
              {evidence.title}
            </h1>
            <p className="text-sm text-[var(--text-secondary)] leading-relaxed">
              Synthesized evidence cluster explaining why this capability or impact exists in your professional record.
            </p>
          </div>
        </div>

        {/* Spec §14: Evidence Classification (Supports multiple dimensions) */}
        {evidence.supports && evidence.supports.length > 0 && (
          <div className="p-5 rounded-2xl bg-[var(--card)] border border-[var(--border)] space-y-3">
            <div className="flex items-center gap-2 text-xs font-black uppercase tracking-wider text-[var(--text-muted)]">
              <Compass size={14} className="text-emerald-500" />
              <span>Multi-Dimensional Support (This evidence reinforces)</span>
            </div>

            <div className="flex flex-wrap gap-2.5">
              {evidence.supports.map((sup, idx) => (
                <div
                  key={idx}
                  className="px-3.5 py-2 rounded-xl bg-[var(--bg-elevated)] border border-[var(--border)] text-xs font-semibold text-[var(--text-primary)] flex items-center gap-2"
                >
                  <span className="px-2 py-0.5 rounded-md text-[10px] font-black uppercase tracking-wider bg-emerald-500/15 text-emerald-600 dark:text-emerald-400">
                    {sup.dimension}
                  </span>
                  <span>{sup.label}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Spec §13: Evidence -> Fact Cards (Level 4 Grounding) */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-black uppercase tracking-wider text-[var(--text-primary)] flex items-center gap-2">
              <FileText size={16} className="text-amber-500" />
              <span>Underlying Career Facts (Level 4)</span>
            </h3>
            <span className="text-xs font-semibold text-[var(--text-muted)]">
              {evidence.facts?.length || 0} facts supporting
            </span>
          </div>

          <div className="space-y-3">
            {evidence.facts && evidence.facts.length > 0 ? (
              evidence.facts.map((fact, fIdx) => (
                <div
                  key={fact.id || fIdx}
                  className="p-5 rounded-2xl bg-[var(--card)] border border-[var(--border)] hover:border-amber-500/40 hover:shadow-md transition-all space-y-3"
                >
                  <div className="flex items-start justify-between gap-3">
                    <p className="text-sm font-bold text-[var(--text-primary)] leading-relaxed">
                      {fact.statement}
                    </p>
                    <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 border border-emerald-500/30 shrink-0">
                      {fact.status}
                    </span>
                  </div>

                  <div className="flex items-center justify-between gap-3 pt-2 border-t border-[var(--border)] flex-wrap">
                    <div className="flex items-center gap-2 text-xs text-[var(--text-muted)]">
                      <span className="font-semibold text-[var(--text-secondary)]">Source: {fact.sourceType}</span>
                      <span>·</span>
                      <span>{fact.sourceTitle}</span>
                      {fact.sourceDate && <span>({fact.sourceDate})</span>}
                    </div>

                    <Link
                      href={`/value/facts/${fact.id}`}
                      className="inline-flex items-center gap-1.5 text-xs font-bold text-amber-500 hover:text-amber-400"
                    >
                      <span>Inspect Fact Detail</span>
                      <ArrowRight size={13} />
                    </Link>
                  </div>
                </div>
              ))
            ) : (
              <div className="p-8 text-center rounded-2xl bg-[var(--card)] border border-[var(--border)] text-xs text-[var(--text-muted)]">
                No active supporting facts linked to this evidence item.
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}
