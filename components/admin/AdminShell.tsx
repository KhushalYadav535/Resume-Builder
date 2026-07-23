"use client";

import Navbar from "@/components/Navbar";

export default function AdminShell({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-[var(--bg-page)] text-[var(--text)] relative overflow-hidden transition-colors duration-300">
      {/* Ambient background blobs */}
      <div className="absolute top-20 right-10 w-96 h-96 bg-indigo-500/5 dark:bg-indigo-500/[0.03] rounded-full blur-3xl -z-10 pointer-events-none" />
      <div className="absolute bottom-20 left-10 w-96 h-96 bg-purple-500/5 dark:bg-purple-500/[0.03] rounded-full blur-3xl -z-10 pointer-events-none" />

      <div className="relative z-10">
        <Navbar />

        {/* ── Main Page Content ── */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8">
          <main>{children}</main>
        </div>
      </div>
    </div>
  );
}
