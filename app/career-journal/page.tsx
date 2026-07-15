"use client";
import { useEffect } from "react";
import { useRouter } from "next/navigation";
import Navbar from "@/components/Navbar";
import { useAuth } from "@/hooks/useAuth";
import { BookOpen } from "lucide-react";

export default function CareerJournalPage() {
  const { user, loading: authLoading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!authLoading && !user) {
      router.push("/login");
    }
  }, [authLoading, user, router]);

  if (authLoading || !user) {
    return (
      <div style={{ minHeight: "100vh", background: "var(--bg)", display: "flex", alignItems: "center", justifyContent: "center" }}>
        <div className="spinner" style={{ width: 40, height: 40 }} />
      </div>
    );
  }

  return (
    <div style={{ minHeight: "100vh", background: "var(--bg)", display: "flex", flexDirection: "column" }}>
      <Navbar />

      <div style={{ padding: "3rem 2rem", maxWidth: "900px", margin: "0 auto", width: "100%", textAlign: "center" }}>
        <div style={{ display: "flex", justifyContent: "center", marginBottom: "1.5rem" }}>
          <div style={{ background: "rgba(108, 99, 255, 0.1)", padding: "1.5rem", borderRadius: "50%" }}>
            <BookOpen size={48} className="text-purple-500" />
          </div>
        </div>
        
        <h1 style={{ fontFamily: "Syne, sans-serif", fontSize: "2.5rem", fontWeight: 800, marginBottom: "1rem" }}>
          Career Journal
        </h1>
        
        <p style={{ color: "var(--text-muted)", fontSize: "1.1rem", maxWidth: "600px", margin: "0 auto", lineHeight: 1.6 }}>
          Track your professional journey, document your wins, and log your learning progress. 
          Your personalized Career Journal is coming soon!
        </p>

        <div className="card" style={{ marginTop: "3rem", padding: "2rem", display: "grid", gap: "1rem", textAlign: "left", background: "var(--card)", border: "1px dashed var(--border-light)" }}>
          <h3 style={{ fontSize: "1.1rem", fontWeight: 700, margin: 0 }}>Upcoming Features:</h3>
          <ul style={{ margin: 0, paddingLeft: "1.2rem", color: "var(--text-muted)", display: "grid", gap: "0.8rem", fontSize: "0.95rem" }}>
            <li>Log daily/weekly professional achievements to easily update your resume later.</li>
            <li>Track interview experiences, questions asked, and lessons learned.</li>
            <li>Monitor networking contacts and follow-up reminders.</li>
            <li>AI-assisted reflections to pull skills and bullet points directly from your journal entries.</li>
          </ul>
        </div>
      </div>
    </div>
  );
}
