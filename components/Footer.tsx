"use client";

import Link from "next/link";
import UpRoleLogo from "@/components/UpRoleLogo";
import { Sparkles, ArrowRight, ShieldCheck, Heart } from "lucide-react";

export default function Footer() {
  return (
    <footer id="footer" className="bg-[var(--bg-elevated)] border-t border-[var(--border)] text-[var(--text-secondary)] font-sans">
      <div className="max-w-7xl mx-auto px-6 py-12 md:py-16">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-10 pb-12 border-b border-[var(--border)]">
          {/* Brand Col (2 cols on lg) */}
          <div className="lg:col-span-2 space-y-4">
            <UpRoleLogo href="/" size="md" variant="dark" />
            <p className="text-xs md:text-sm text-[var(--text-muted)] max-w-sm leading-relaxed">
              UpRole is the comprehensive Career Advancement Platform. Understand your market value, build your potential, and convert skills into premier career opportunities.
            </p>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-500/10 border border-amber-500/25 text-amber-600 dark:text-amber-400 text-xs font-bold uppercase tracking-wider">
              <Sparkles size={12} className="text-amber-500" />
              <span>Calibrated for Modern Tech Careers</span>
            </div>
          </div>

          {/* Col 1: Platform Pillars */}
          <div className="space-y-3 text-xs">
            <div className="font-extrabold text-[var(--text-primary)] uppercase tracking-wider text-[11px] font-['Syne',sans-serif]">
              Core Pillars
            </div>
            <ul className="space-y-2">
              <li>
                <Link href="/dashboard" className="hover:text-amber-500 transition-colors">
                  Pulse (Live Dashboard)
                </Link>
              </li>
              <li>
                <Link href="/career-discovery" className="hover:text-amber-500 transition-colors">
                  Value (Discovery & Builder)
                </Link>
              </li>
              <li>
                <Link href="/momentum" className="hover:text-amber-500 transition-colors">
                  Momentum (Strategy & Execution)
                </Link>
              </li>
              <li>
                <Link href="/career-journal" className="hover:text-amber-500 transition-colors">
                  Journal (Proof Vault)
                </Link>
              </li>
              <li>
                <Link href="/career-copilot" className="hover:text-amber-500 transition-colors">
                  Navigator (AI Partner & Market)
                </Link>
              </li>
            </ul>
          </div>

          {/* Col 2: Strategic Tools */}
          <div className="space-y-3 text-xs">
            <div className="font-extrabold text-[var(--text-primary)] uppercase tracking-wider text-[11px] font-['Syne',sans-serif]">
              Strategic Tools
            </div>
            <ul className="space-y-2">
              <li>
                <Link href="/resume/tailor" className="hover:text-amber-500 transition-colors">
                  Precision JD Matcher
                </Link>
              </li>
              <li>
                <Link href="/resume/templates" className="hover:text-amber-500 transition-colors">
                  ATS Templates
                </Link>
              </li>
              <li>
                <Link href="/pricing" className="hover:text-amber-500 transition-colors">
                  Sprint & Pro Plans
                </Link>
              </li>
              <li>
                <Link href="/dashboard/credits" className="hover:text-amber-500 transition-colors">
                  AI Credit Wallet
                </Link>
              </li>
              <li>
                <Link href="/dashboard/cover-letter" className="hover:text-amber-500 transition-colors">
                  Cover Letter Studio
                </Link>
              </li>
            </ul>
          </div>

          {/* Col 3: Support & Legal */}
          <div className="space-y-3 text-xs">
            <div className="font-extrabold text-[var(--text-primary)] uppercase tracking-wider text-[11px] font-['Syne',sans-serif]">
              Support & Legal
            </div>
            <ul className="space-y-2">
              <li>
                <Link href="/contact" className="hover:text-amber-500 transition-colors font-bold text-amber-500 flex items-center gap-1">
                  <span>In-App Helpdesk</span>
                  <ArrowRight size={10} />
                </Link>
              </li>
              <li>
                <Link href="/privacy" className="hover:text-amber-500 transition-colors">
                  Privacy Policy (DPDP & GDPR)
                </Link>
              </li>
              <li>
                <Link href="/terms" className="hover:text-amber-500 transition-colors">
                  Terms of Service
                </Link>
              </li>
              <li className="pt-2">
                <div className="flex items-center gap-1.5 text-[11px] text-emerald-600 dark:text-emerald-400 font-bold">
                  <ShieldCheck size={13} />
                  <span>256-Bit Encrypted Platform</span>
                </div>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom copyright row */}
        <div className="pt-8 flex flex-col sm:flex-row justify-between items-center gap-4 text-xs text-[var(--text-muted)]">
          <p>© {new Date().getFullYear()} UpRole. All rights reserved.</p>
          <p className="text-[11px] font-semibold uppercase tracking-wider text-amber-600 dark:text-amber-400">
            UPROLE | CAREERS WITH CLARITY. PROGRESS WITH PURPOSE.
          </p>
        </div>
      </div>
    </footer>
  );
}
