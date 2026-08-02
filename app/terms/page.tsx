import Link from "next/link";
import Navbar from "@/components/Navbar";

export default function TermsOfServicePage() {
  return (
    <div className="min-h-screen bg-[var(--bg-1)] text-[var(--text-primary)]">
      <Navbar />
      
      <main className="max-w-4xl mx-auto px-6 py-16">
        <h1 className="text-4xl font-extrabold font-['Syne',sans-serif] mb-4">Terms of Service</h1>
        <p className="text-sm text-[var(--text-muted)] mb-8">Last updated: August 2, 2026</p>

        <div className="prose prose-invert max-w-none space-y-6 text-[var(--text-secondary)] text-sm leading-relaxed">
          <section className="p-6 rounded-2xl bg-[var(--bg-surface)] border border-[var(--border)]">
            <h2 className="text-xl font-bold text-[var(--text-primary)] mb-3">1. Acceptance of Terms</h2>
            <p>
              By accessing and using Uprole, you agree to comply with and be bound by these Terms of Service.
            </p>
          </section>

          <section className="p-6 rounded-2xl bg-[var(--bg-surface)] border border-[var(--border)]">
            <h2 className="text-xl font-bold text-[var(--text-primary)] mb-3">2. User Accounts</h2>
            <p>
              You are responsible for maintaining the security of your Uprole account and credentials. You agree to notify us immediately of any unauthorized access.
            </p>
          </section>

          <section className="p-6 rounded-2xl bg-[var(--bg-surface)] border border-[var(--border)]">
            <h2 className="text-xl font-bold text-[var(--text-primary)] mb-3">3. Acceptable Use</h2>
            <p>
              Uprole provides tools for resume optimization and career management. You agree not to upload harmful, offensive, or infringing content.
            </p>
          </section>

          <section className="p-6 rounded-2xl bg-[var(--bg-surface)] border border-[var(--border)]">
            <h2 className="text-xl font-bold text-[var(--text-primary)] mb-3">4. Limitation of Liability</h2>
            <p>
              Uprole is provided on an "as is" and "as available" basis without warranties of any kind.
            </p>
          </section>
        </div>

        <div className="mt-12 pt-6 border-t border-[var(--border)] flex justify-between items-center text-xs text-[var(--text-muted)]">
          <Link href="/" className="hover:text-[var(--accent)] transition-colors">← Back to Home</Link>
          <Link href="/privacy" className="hover:text-[var(--accent)] transition-colors">Privacy Policy →</Link>
        </div>
      </main>
    </div>
  );
}
