import Link from "next/link";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { ShieldCheck, Lock, EyeOff, FileText, Database, UserCheck, HelpCircle } from "lucide-react";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Privacy Policy & Data Protection | UpRole",
  description:
    "Learn how UpRole protects your personal information, resume data, and career details with enterprise-grade privacy and encryption standards.",
};

export default function PrivacyPolicyPage() {
  return (
    <div className="min-h-screen bg-[var(--bg-page)] text-[var(--text-primary)] flex flex-col font-sans selection:bg-[#F59E0B] selection:text-[#101B3B]">
      <Navbar />

      <main className="flex-1 max-w-4xl mx-auto px-6 py-16 md:py-20 w-full">
        {/* Header */}
        <div className="space-y-3 pb-8 border-b border-[var(--border)]">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-teal-500/10 border border-teal-500/25 text-teal-600 dark:text-teal-400 text-xs font-bold uppercase tracking-wider">
            <ShieldCheck size={12} className="text-teal-500" />
            <span>DATA TRUST & COMPLIANCE</span>
          </div>
          <h1 className="text-3xl md:text-5xl font-black tracking-tight text-[var(--text-primary)] font-['Syne',sans-serif]">
            Privacy Policy
          </h1>
          <p className="text-xs md:text-sm text-[var(--text-muted)] font-mono">
            Effective Date: September 14, 2026 · Version 2.4
          </p>
        </div>

        {/* Intro */}
        <div className="my-8 p-5 rounded-2xl bg-[var(--bg-elevated)] border border-[var(--border)] text-sm text-[var(--text-secondary)] leading-relaxed space-y-2">
          <p>
            At <strong>UpRole</strong>, we believe that your career data belongs entirely to you. We are deeply committed to safeguarding your privacy, ensuring absolute confidentiality of your resumes, and maintaining complete transparency regarding how data is handled.
          </p>
          <p>
            This Privacy Policy outlines our principles for data collection, usage, encryption, and your legal rights under applicable privacy frameworks including India’s Digital Personal Data Protection (DPDP) Act and global privacy benchmarks.
          </p>
        </div>

        {/* Detailed Sections */}
        <div className="space-y-8 text-sm leading-relaxed text-[var(--text-secondary)]">
          {/* Section 1 */}
          <section className="p-6 md:p-7 rounded-2xl bg-[var(--bg-elevated)] border border-[var(--border)] space-y-3 shadow-xs">
            <div className="flex items-center gap-2.5 text-[var(--text-primary)] font-bold text-base font-['Syne',sans-serif]">
              <Database size={18} className="text-blue-500" />
              <h2>1. Information We Collect</h2>
            </div>
            <p>
              We collect information strictly necessary to provide intelligent resume optimization and career advancement services:
            </p>
            <ul className="list-disc pl-5 space-y-1.5 text-xs md:text-sm text-[var(--text-muted)]">
              <li><strong>Account Credentials:</strong> Name, authenticated user ID, and account profile details when you sign up using email or secure Google OAuth.</li>
              <li><strong>Career Information:</strong> Employment history, education, skills, career achievements, and resume drafts you voluntarily upload or input.</li>
              <li><strong>Application Records:</strong> Job titles, target companies, and stage progression details you save within your Opportunity Pipeline tracker.</li>
              <li><strong>Platform Telemetry:</strong> Anonymized technical logs, browser user-agents, and performance diagnostics to optimize site speed and reliability.</li>
            </ul>
          </section>

          {/* Section 2 */}
          <section className="p-6 md:p-7 rounded-2xl bg-[var(--bg-elevated)] border border-[var(--border)] space-y-3 shadow-xs">
            <div className="flex items-center gap-2.5 text-[var(--text-primary)] font-bold text-base font-['Syne',sans-serif]">
              <EyeOff size={18} className="text-teal-500" />
              <h2>2. Zero-Public Training AI Confidentiality</h2>
            </div>
            <p>
              Your professional journey is unique and confidential. We strictly adhere to an enterprise-grade AI safety covenant:
            </p>
            <div className="p-4 rounded-xl bg-teal-500/10 border border-teal-500/25 text-xs text-teal-800 dark:text-teal-300 font-medium leading-relaxed">
              🔒 <strong>AI Privacy Guarantee:</strong> Your resumes, work journals, and career data are processed in ephemeral, isolated server sessions. We do <strong>NOT</strong> use your personal documents or resume text to train public foundational AI models.
            </div>
          </section>

          {/* Section 3 */}
          <section className="p-6 md:p-7 rounded-2xl bg-[var(--bg-elevated)] border border-[var(--border)] space-y-3 shadow-xs">
            <div className="flex items-center gap-2.5 text-[var(--text-primary)] font-bold text-base font-['Syne',sans-serif]">
              <Lock size={18} className="text-purple-500" />
              <h2>3. Storage, Encryption & Data Security</h2>
            </div>
            <p>
              All platform data is protected using industry-standard 256-bit AES encryption at rest and TLS 1.3 encryption in transit. Row Level Security (RLS) policies are enforced at the database kernel level to ensure that only authenticated account owners can read or modify their resumes and pipeline items.
            </p>
          </section>

          {/* Section 4 */}
          <section className="p-6 md:p-7 rounded-2xl bg-[var(--bg-elevated)] border border-[var(--border)] space-y-3 shadow-xs">
            <div className="flex items-center gap-2.5 text-[var(--text-primary)] font-bold text-base font-['Syne',sans-serif]">
              <UserCheck size={18} className="text-amber-500" />
              <h2>4. Your Rights: Export, Correction & Deletion</h2>
            </div>
            <p>
              You maintain total control over your career data. At any time, you can:
            </p>
            <ul className="list-disc pl-5 space-y-1.5 text-xs md:text-sm text-[var(--text-muted)]">
              <li>Export your formatted resumes in PDF or plain JSON formats.</li>
              <li>Edit or update any existing career entries, skills, or journal items.</li>
              <li>Permanently delete individual resumes or request complete account erasure directly through your dashboard.</li>
            </ul>
          </section>

          {/* Section 5 */}
          <section className="p-6 md:p-7 rounded-2xl bg-[var(--bg-elevated)] border border-[var(--border)] space-y-3 shadow-xs">
            <div className="flex items-center gap-2.5 text-[var(--text-primary)] font-bold text-base font-['Syne',sans-serif]">
              <HelpCircle size={18} className="text-rose-500" />
              <h2>5. Inquiries & Support Helpdesk</h2>
            </div>
            <p>
              If you have any questions, concerns, or requests regarding this Privacy Policy or your personal information, please submit an official inquiry through our dedicated In-App Support Portal. Our team reviews and resolves data inquiries within 24–48 business hours.
            </p>
            <div className="pt-2">
              <Link
                href="/contact"
                className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-[var(--bg-page)] border border-[var(--border)] hover:border-amber-500/30 text-xs font-bold text-amber-500 transition-all"
              >
                <span>Open In-App Support Portal</span>
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
          <Link href="/terms" className="hover:text-amber-500 transition-colors font-bold">
            Review Terms of Service →
          </Link>
        </div>
      </main>

      <Footer />
    </div>
  );
}
