import Link from "next/link";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { Scale, CheckCircle2, AlertTriangle, CreditCard, Shield, HelpCircle } from "lucide-react";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Terms of Service & User Agreement | UpRole",
  description:
    "Review UpRole's terms of service, subscription policies, acceptable use guidelines, and platform commitments.",
};

export default function TermsOfServicePage() {
  return (
    <div className="min-h-screen bg-[var(--bg-page)] text-[var(--text-primary)] flex flex-col font-sans selection:bg-[#F59E0B] selection:text-[#101B3B]">
      <Navbar />

      <main className="flex-1 max-w-4xl mx-auto px-6 py-16 md:py-20 w-full">
        {/* Header */}
        <div className="space-y-3 pb-8 border-b border-[var(--border)]">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-500/10 border border-blue-500/25 text-blue-600 dark:text-blue-400 text-xs font-bold uppercase tracking-wider">
            <Scale size={12} className="text-blue-500" />
            <span>PLATFORM COMMITMENT & USER AGREEMENT</span>
          </div>
          <h1 className="text-3xl md:text-5xl font-black tracking-tight text-[var(--text-primary)] font-['Syne',sans-serif]">
            Terms of Service
          </h1>
          <p className="text-xs md:text-sm text-[var(--text-muted)] font-mono">
            Effective Date: September 14, 2026 · Version 2.4
          </p>
        </div>

        {/* Intro */}
        <div className="my-8 p-5 rounded-2xl bg-[var(--bg-elevated)] border border-[var(--border)] text-sm text-[var(--text-secondary)] leading-relaxed space-y-2">
          <p>
            Welcome to <strong>UpRole</strong>. By creating an account, browsing our website, or using any of our resume optimization, career discovery, or pursuit pipeline services, you agree to be bound by these Terms of Service.
          </p>
          <p>
            Please read these terms carefully. If you do not agree to these terms, you must discontinue using the platform.
          </p>
        </div>

        {/* Detailed Sections */}
        <div className="space-y-8 text-sm leading-relaxed text-[var(--text-secondary)]">
          {/* Section 1 */}
          <section className="p-6 md:p-7 rounded-2xl bg-[var(--bg-elevated)] border border-[var(--border)] space-y-3 shadow-xs">
            <div className="flex items-center gap-2.5 text-[var(--text-primary)] font-bold text-base font-['Syne',sans-serif]">
              <CheckCircle2 size={18} className="text-emerald-500" />
              <h2>1. Account Registration & Security</h2>
            </div>
            <p>
              To access personalized career features, you must maintain an authentic account. You are responsible for preserving the confidentiality of your authentication tokens and all activities that occur under your account. You agree to immediately report any unauthorized access through our support portal.
            </p>
          </section>

          {/* Section 2 */}
          <section className="p-6 md:p-7 rounded-2xl bg-[var(--bg-elevated)] border border-[var(--border)] space-y-3 shadow-xs">
            <div className="flex items-center gap-2.5 text-[var(--text-primary)] font-bold text-base font-['Syne',sans-serif]">
              <Shield size={18} className="text-blue-500" />
              <h2>2. Intellectual Property & Your Content</h2>
            </div>
            <p>
              <strong>Your Content:</strong> You retain complete, unconditional ownership of all text, work history, resume bullets, and career data you upload or generate on UpRole. You grant UpRole a limited, non-exclusive license solely to process and render your documents for your personal use.
            </p>
            <p>
              <strong>Platform Property:</strong> The design system, algorithms, taxonomy models, software code, logos, and trademarks are the exclusive proprietary property of UpRole.
            </p>
          </section>

          {/* Section 3 */}
          <section className="p-6 md:p-7 rounded-2xl bg-[var(--bg-elevated)] border border-[var(--border)] space-y-3 shadow-xs">
            <div className="flex items-center gap-2.5 text-[var(--text-primary)] font-bold text-base font-['Syne',sans-serif]">
              <CreditCard size={18} className="text-amber-500" />
              <h2>3. Subscriptions, Credits & Billing</h2>
            </div>
            <p>
              Certain advanced capabilities (e.g. unlimited AI ATS optimizations, Pro template exports, and mock interview simulations) require subscription tiers or credit balance balances.
            </p>
            <ul className="list-disc pl-5 space-y-1.5 text-xs md:text-sm text-[var(--text-muted)]">
              <li>Subscription charges are billed in advance on recurring cycles.</li>
              <li>Wallet credits are non-transferable and can be used across AI optimizations and instant exports.</li>
              <li>Refund requests for digital subscriptions can be reviewed by submitting an inquiry within 7 days of initial purchase through our support desk.</li>
            </ul>
          </section>

          {/* Section 4 */}
          <section className="p-6 md:p-7 rounded-2xl bg-[var(--bg-elevated)] border border-[var(--border)] space-y-3 shadow-xs">
            <div className="flex items-center gap-2.5 text-[var(--text-primary)] font-bold text-base font-['Syne',sans-serif]">
              <AlertTriangle size={18} className="text-rose-500" />
              <h2>4. Career Outcome Disclaimer</h2>
            </div>
            <p>
              UpRole equips job seekers with industry-leading ATS parsing algorithms, keyword calibration, and structured interview toolkits. However, UpRole does not guarantee employment offers, specific salary tiers, or employer hiring decisions, as these remain solely subject to external employer discretion.
            </p>
          </section>

          {/* Section 5 */}
          <section className="p-6 md:p-7 rounded-2xl bg-[var(--bg-elevated)] border border-[var(--border)] space-y-3 shadow-xs">
            <div className="flex items-center gap-2.5 text-[var(--text-primary)] font-bold text-base font-['Syne',sans-serif]">
              <HelpCircle size={18} className="text-purple-500" />
              <h2>5. Contact & Support Resolution</h2>
            </div>
            <p>
              If you have any questions or disputes arising from these Terms of Service, please reach out to our team through the official In-App Support Portal for prompt review and resolution.
            </p>
            <div className="pt-2">
              <Link
                href="/contact"
                className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-[var(--bg-page)] border border-[var(--border)] hover:border-amber-500/30 text-xs font-bold text-amber-500 transition-all"
              >
                <span>Access Support Helpdesk</span>
                <span>→</span>
              </Link>
            </div>
          </section>
        </div>

        {/* Footer Navigation */}
        <div className="mt-12 pt-6 border-t border-[var(--border)] flex justify-between items-center text-xs text-[var(--text-muted)]">
          <Link href="/" className="hover:text-amber-500 transition-colors font-bold">
            ← Return to Home Base
          </Link>
          <Link href="/privacy" className="hover:text-amber-500 transition-colors font-bold">
            Read Privacy Policy →
          </Link>
        </div>
      </main>

      <Footer />
    </div>
  );
}
