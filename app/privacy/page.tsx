import Link from "next/link";
import Navbar from "@/components/Navbar";

export default function PrivacyPolicyPage() {
  return (
    <div className="min-h-screen bg-[var(--bg-1)] text-[var(--text-primary)]">
      <Navbar />
      
      <main className="max-w-4xl mx-auto px-6 py-16">
        <h1 className="text-4xl font-extrabold font-['Syne',sans-serif] mb-4">Privacy Policy</h1>
        <p className="text-sm text-[var(--text-muted)] mb-8">Last updated: August 2, 2026</p>

        <div className="prose prose-invert max-w-none space-y-6 text-[var(--text-secondary)] text-sm leading-relaxed">
          <section className="p-6 rounded-2xl bg-[var(--bg-surface)] border border-[var(--border)]">
            <h2 className="text-xl font-bold text-[var(--text-primary)] mb-3">1. Information We Collect</h2>
            <p>
              When you sign up for Uprole using email or Google OAuth, we collect your name, email address, and profile details provided by Google authentication to manage your account safely.
            </p>
          </section>

          <section className="p-6 rounded-2xl bg-[var(--bg-surface)] border border-[var(--border)]">
            <h2 className="text-xl font-bold text-[var(--text-primary)] mb-3">2. How We Use Your Data</h2>
            <p>
              We use your data strictly to provide resume optimization, job application tracking, and AI career assistant features. We do not sell your personal data to third parties.
            </p>
          </section>

          <section className="p-6 rounded-2xl bg-[var(--bg-surface)] border border-[var(--border)]">
            <h2 className="text-xl font-bold text-[var(--text-primary)] mb-3">3. Data Security & Storage</h2>
            <p>
              Your data is stored securely using enterprise-grade encrypted storage. You can delete your account and personal resume data at any time from your account settings.
            </p>
          </section>

          <section className="p-6 rounded-2xl bg-[var(--bg-surface)] border border-[var(--border)]">
            <h2 className="text-xl font-bold text-[var(--text-primary)] mb-3">4. Contact Us</h2>
            <p>
              If you have any questions regarding this Privacy Policy, please contact us at support@uprole.com.
            </p>
          </section>
        </div>

        <div className="mt-12 pt-6 border-t border-[var(--border)] flex justify-between items-center text-xs text-[var(--text-muted)]">
          <Link href="/" className="hover:text-[var(--accent)] transition-colors">← Back to Home</Link>
          <Link href="/terms" className="hover:text-[var(--accent)] transition-colors">Terms of Service →</Link>
        </div>
      </main>
    </div>
  );
}
