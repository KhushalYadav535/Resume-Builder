"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import Navbar from "@/components/Navbar";
import { useAuth } from "@/hooks/useAuth";
import { CareerValueResponse, CareerInterpretation } from "@/types/value";
import ValueDimensionDetailView from "@/components/value/ValueDimensionDetailView";
import ValueTraceabilityDrawer from "@/components/value/ValueTraceabilityDrawer";
import { ChevronRight, ArrowLeft } from "lucide-react";

export default function ImpactPage() {
  const { user, loading: authLoading } = useAuth();
  const router = useRouter();
  const [data, setData] = useState<CareerValueResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedInterp, setSelectedInterp] = useState<CareerInterpretation | null>(null);
  const [drawerOpen, setDrawerOpen] = useState(false);

  useEffect(() => {
    if (!authLoading && !user) {
      router.push("/login");
    }
  }, [authLoading, user, router]);

  useEffect(() => {
    if (!user) return;
    setLoading(true);
    fetch("/api/value")
      .then((res) => res.json())
      .then((resData) => {
        if (resData.profile) setData(resData);
      })
      .catch((err) => console.error("Error loading impact:", err))
      .finally(() => setLoading(false));
  }, [user]);

  const handleOpenDrawer = (interp: CareerInterpretation) => {
    setSelectedInterp(interp);
    setDrawerOpen(true);
  };

  const handleDrawerAction = async () => {
    const res = await fetch("/api/value");
    const json = await res.json();
    if (json.profile) setData(json);
  };

  return (
    <div className="min-h-screen bg-[var(--bg)] flex flex-col font-sans">
      <Navbar />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 w-full flex-1 space-y-6">
        <nav aria-label="Breadcrumb" className="flex items-center gap-2 text-xs font-bold text-[var(--text-muted)]">
          <Link href="/value" className="hover:text-[var(--text-primary)] transition-colors flex items-center gap-1">
            <ArrowLeft size={13} className="sm:hidden" />
            <span>Value Overview</span>
          </Link>
          <ChevronRight size={13} className="hidden sm:inline" />
          <span className="text-emerald-500 hidden sm:inline">Impact</span>
        </nav>

        {loading ? (
          <div className="space-y-4 animate-pulse">
            <div className="h-44 rounded-3xl bg-[var(--card)] border border-[var(--border)]" />
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="h-64 rounded-3xl bg-[var(--card)] border border-[var(--border)]" />
              <div className="h-64 rounded-3xl bg-[var(--card)] border border-[var(--border)]" />
            </div>
          </div>
        ) : data ? (
          <ValueDimensionDetailView
            dimension="impact"
            capabilities={data.profile.capabilities}
            impact={data.profile.impact}
            experience={data.profile.experience}
            progression={data.profile.progression}
            evidenceSummary={data.evidenceSummary}
            onSelectInterpretation={handleOpenDrawer}
            onExploreFacts={() => router.push("/value?tab=facts")}
          />
        ) : (
          <div className="p-12 text-center rounded-3xl bg-[var(--card)] border border-[var(--border)] space-y-3">
            <p className="text-sm text-[var(--text-muted)]">Unable to load impact data.</p>
            <Link href="/value" className="inline-block px-4 py-2 rounded-xl bg-emerald-500 text-white font-bold text-xs">
              Go to Value Overview
            </Link>
          </div>
        )}
      </main>

      <ValueTraceabilityDrawer
        interpretation={selectedInterp}
        isOpen={drawerOpen}
        onClose={() => setDrawerOpen(false)}
        onAccept={async (interp) => {
          await fetch(`/api/value/interpretations/${interp.id}`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ action: "accept" }),
          });
          handleDrawerAction();
        }}
        onEdit={async (interp, title, desc, note) => {
          await fetch(`/api/value/interpretations/${interp.id}`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ action: "edit", title, description: desc, note }),
          });
          handleDrawerAction();
        }}
        onReject={async (interp, reason) => {
          await fetch(`/api/value/interpretations/${interp.id}`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ action: "reject", reason }),
          });
          handleDrawerAction();
        }}
        onViewAllEvidence={() => router.push("/value?tab=facts")}
      />
    </div>
  );
}
