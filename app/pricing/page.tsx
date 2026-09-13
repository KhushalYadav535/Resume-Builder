"use client";

import Navbar from "@/components/Navbar";
import PricingSection from "@/components/pricing/PricingSection";
import UpRoleLogo from "@/components/UpRoleLogo";
import Link from "next/link";

export default function PricingPage() {
  return (
    <div className="min-h-screen bg-[#0A1124] text-white flex flex-col font-sans selection:bg-[#F59E0B] selection:text-[#101B3B]">
      <Navbar />

      <main className="flex-1">
        <PricingSection />
      </main>

      <footer className="bg-[#070D18] border-t border-white/10 py-10 px-6 sm:px-8 text-slate-400 text-xs">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row justify-between items-center gap-6">
          <UpRoleLogo href="/" size="sm" variant="dark" />

          <div className="flex flex-wrap items-center gap-6 font-medium text-slate-400">
            <Link href="/privacy" className="hover:text-amber-400 transition-colors">Privacy Policy</Link>
            <Link href="/terms" className="hover:text-amber-400 transition-colors">Terms of Service</Link>
            <Link href="/career-copilot" className="hover:text-amber-400 transition-colors">Career Intelligence</Link>
            <Link href="/resume/builder?new=true" className="hover:text-amber-400 transition-colors">Resume Platform</Link>
          </div>

          <p className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider">
            UPROLE | CAREERS WITH CLARITY. PROGRESS WITH PURPOSE.
          </p>
        </div>
      </footer>
    </div>
  );
}
