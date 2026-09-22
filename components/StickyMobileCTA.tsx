"use client";

import { usePathname } from "next/navigation";
import Link from "next/link";
import { Sparkles, ArrowRight, FileText } from "lucide-react";

export default function StickyMobileCTA() {
  const pathname = usePathname();

  // Exclude builder, admin, auth, and sub-editor pages from sticky mobile overlay
  const excludedPrefixes = [
    "/resume/builder",
    "/admin",
    "/login",
    "/signup",
    "/forgot-password",
    "/reset-password",
    "/onboarding",
  ];

  const shouldHide = excludedPrefixes.some((prefix) => pathname.startsWith(prefix));

  if (shouldHide) return null;

  return (
    <div className="fixed bottom-3 left-3 right-3 z-40 md:hidden animate-in slide-in-from-bottom-3 duration-200">
      <div className="p-2.5 rounded-2xl bg-[var(--bg-elevated)]/95 backdrop-blur-xl border border-amber-500/30 shadow-xl shadow-black/20 flex items-center justify-between gap-3">
        <div className="flex items-center gap-2 pl-2">
          <div className="w-8 h-8 rounded-xl bg-amber-500/15 border border-amber-500/30 text-amber-500 flex items-center justify-center shrink-0">
            <Sparkles size={16} />
          </div>
          <div>
            <div className="font-bold text-xs text-[var(--text-primary)] leading-tight font-['Syne',sans-serif]">
              Build Your Resume
            </div>
            <div className="text-[10px] text-amber-500 font-semibold">
              Free 2-Minute ATS Scan
            </div>
          </div>
        </div>

        <Link
          href="/resume/builder?new=true"
          className="px-4 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-brand-navy font-black text-xs transition-all shadow-sm shadow-amber-500/25 border border-amber-400 flex items-center gap-1.5 shrink-0"
        >
          <span>Start Free</span>
          <ArrowRight size={13} />
        </Link>
      </div>
    </div>
  );
}
