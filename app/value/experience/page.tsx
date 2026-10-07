"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import Navbar from "@/components/Navbar";
import { useAuth } from "@/hooks/useAuth";
import { CareerValueResponse } from "@/types/value";
import ValueDimensionDetailView from "@/components/value/ValueDimensionDetailView";
import { ChevronRight, ArrowLeft } from "lucide-react";

export default function ExperiencePage() {
  const { user, loading: authLoading } = useAuth();
  const router = useRouter();
  const [data, setData] = useState<CareerValueResponse | null>(null);
  const [loading, setLoading] = useState(true);

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
      .catch((err) => console.error("Error loading experience:", err))
      .finally(() => setLoading(false));
  }, [user]);

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
          <span className="text-sky-500 hidden sm:inline">Experience</span>
        </nav>

        {loading ? (
          <div className="space-y-4 animate-pulse">
            <div className="h-44 rounded-3xl bg-[var(--card)] border border-[var(--border)]" />
            <div className="h-64 rounded-3xl bg-[var(--card)] border border-[var(--border)]" />
          </div>
        ) : data ? (
          <ValueDimensionDetailView
            dimension="experience"
            capabilities={data.profile.capabilities}
            impact={data.profile.impact}
            experience={data.profile.experience}
            progression={data.profile.progression}
            evidenceSummary={data.evidenceSummary}
            onSelectInterpretation={() => {}}
            onExploreFacts={() => router.push("/value?tab=facts")}
          />
        ) : (
          <div className="p-12 text-center rounded-3xl bg-[var(--card)] border border-[var(--border)] space-y-3">
            <p className="text-sm text-[var(--text-muted)]">Unable to load experience profile.</p>
            <Link href="/value" className="inline-block px-4 py-2 rounded-xl bg-sky-500 text-white font-bold text-xs">
              Go to Value Overview
            </Link>
          </div>
        )}
      </main>
    </div>
  );
}
