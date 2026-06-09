"use client";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/hooks/useAuth";

export default function OnboardingPage() {
  const { user, loading: authLoading } = useAuth();
  const router = useRouter();

  const [role, setRole] = useState("Software Engineer");
  const [city, setCity] = useState("Bangalore");
  const [yoe, setYoe] = useState(2);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (!authLoading && !user) {
      router.push("/login");
    }
  }, [authLoading, user, router]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);

    try {
      const res = await fetch("/api/onboarding", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ targetRole: role, targetCity: city, yoe })
      });

      if (res.ok) {
        router.push("/dashboard");
      } else {
        alert("Onboarding failed. Please try again.");
      }
    } catch (err) {
      console.error(err);
      alert("Error setting up onboarding details.");
    } finally {
      setSubmitting(false);
    }
  };

  if (authLoading || !user) {
    return (
      <div style={{ minHeight: "100vh", background: "var(--bg)", display: "flex", alignItems: "center", justifyContent: "center" }}>
        <div className="spinner" style={{ width: 40, height: 40 }} />
      </div>
    );
  }

  return (
    <div style={{
      minHeight: "100vh",
      background: "radial-gradient(circle at center, rgba(108, 99, 255, 0.08) 0%, var(--bg) 80%)",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      padding: "2rem"
    }}>
      <div className="card" style={{
        maxWidth: "480px",
        width: "100%",
        padding: "2.5rem",
        display: "grid",
        gap: "1.5rem",
        border: "1px solid var(--border)",
        background: "rgba(15, 15, 25, 0.95)",
        boxShadow: "0 20px 40px rgba(0,0,0,0.6)",
        borderRadius: "16px",
        animation: "scaleUp 0.3s ease-out"
      }}>
        
        <div style={{ textAlign: "center" }}>
          <span style={{
            fontFamily: "Syne, sans-serif",
            fontWeight: 800,
            fontSize: "1.4rem",
            background: "linear-gradient(135deg, #6c63ff, #ff6584)",
            WebkitBackgroundClip: "text",
            WebkitTextFillColor: "transparent",
            display: "block",
            marginBottom: "0.5rem"
          }}>
            ResumeAI
          </span>
          <h2 style={{ fontFamily: "Syne, sans-serif", fontSize: "1.5rem", fontWeight: 800, margin: 0 }}>Onboarding Profile Setup</h2>
          <p style={{ color: "var(--text-muted)", fontSize: "0.82rem", marginTop: "0.25rem" }}>
            Let's configure your career preferences to personalize ATS scoring, keyword mapping, and salary benchmarks.
          </p>
        </div>

        <form onSubmit={handleSubmit} style={{ display: "grid", gap: "1rem" }}>
          <div>
            <label style={{ fontSize: "0.8rem", color: "var(--text-muted)", display: "block", marginBottom: "0.3rem", fontWeight: 600 }}>Target Tech Role</label>
            <input 
              required
              className="input" 
              placeholder="e.g. Frontend Developer, Product Manager" 
              value={role} 
              onChange={(e) => setRole(e.target.value)} 
            />
          </div>

          <div>
            <label style={{ fontSize: "0.8rem", color: "var(--text-muted)", display: "block", marginBottom: "0.3rem", fontWeight: 600 }}>Indian City Target</label>
            <select 
              className="input" 
              style={{ height: "42px", background: "var(--bg-2)", color: "var(--text)" }} 
              value={city} 
              onChange={(e) => setCity(e.target.value)}
            >
              <option value="Bangalore">Bengaluru (Bangalore)</option>
              <option value="Mumbai">Mumbai</option>
              <option value="Delhi">Delhi / NCR</option>
              <option value="Hyderabad">Hyderabad</option>
              <option value="Pune">Pune</option>
              <option value="Chennai">Chennai</option>
              <option value="Remote">Remote</option>
            </select>
          </div>

          <div>
            <label style={{ fontSize: "0.8rem", color: "var(--text-muted)", display: "block", marginBottom: "0.3rem", fontWeight: 600 }}>Years of Experience: {yoe}</label>
            <input 
              type="range" 
              min="0" 
              max="20" 
              value={yoe} 
              onChange={(e) => setYoe(parseInt(e.target.value) || 0)} 
              style={{ width: "100%", accentColor: "var(--accent)" }}
            />
          </div>

          <button 
            type="submit" 
            disabled={submitting} 
            className="btn-primary" 
            style={{ width: "100%", justifyContent: "center", padding: "0.75rem", fontSize: "0.95rem", marginTop: "0.5rem" }}
          >
            {submitting ? "Configuring..." : "✦ Setup Workspace & Continue"}
          </button>
        </form>

      </div>
    </div>
  );
}
