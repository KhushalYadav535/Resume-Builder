"use client";
import React, { useState } from "react";
import { DollarSign } from "lucide-react";
import { useToast } from "@/components/ui/toast-1";

export default function SalaryBenchmarker() {
  const [role, setRole] = useState("");
  const [location, setLocation] = useState("");
  const [experience, setExperience] = useState("");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<{ low: string; median: string; high: string; insights: string } | null>(null);
  const { showToast } = useToast();

  const handleBenchmark = async () => {
    if (!role || !location || !experience) {
      showToast("Please fill all fields", "warning");
      return;
    }
    setLoading(true);
    try {
      const res = await fetch("/api/copilot/market-insight", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ type: "salary", role, location, experience })
      });
      if (res.ok) {
        const data = await res.json();
        setResult(data);
      } else {
        showToast("Failed to fetch salary data", "error");
      }
    } catch (err) {
      console.error(err);
      showToast("An error occurred", "error");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="card" style={{ padding: "1.5rem", display: "grid", gap: "1.2rem" }}>
      <h3 style={{ margin: "0 0 0.5rem", fontSize: "1.1rem", fontWeight: 700, display: "flex", alignItems: "center", gap: "0.5rem" }}>
        <DollarSign size={18} className="text-emerald-500" />
        Salary Benchmarking
      </h3>
      <p style={{ margin: 0, fontSize: "0.85rem", color: "var(--text-muted)", lineHeight: 1.5 }}>
        Get AI-estimated salary bands based on real-time market trends.
      </p>

      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(150px, 1fr))", gap: "1rem" }}>
        <input className="input" placeholder="Role (e.g. Frontend Engineer)" value={role} onChange={e => setRole(e.target.value)} style={{ padding: "0.6rem 1rem", borderRadius: "8px", border: "1px solid var(--border)", background: "var(--bg-elevated)" }} />
        <input className="input" placeholder="Location (e.g. Remote, NY)" value={location} onChange={e => setLocation(e.target.value)} style={{ padding: "0.6rem 1rem", borderRadius: "8px", border: "1px solid var(--border)", background: "var(--bg-elevated)" }} />
        <select className="input" value={experience} onChange={e => setExperience(e.target.value)} style={{ padding: "0.6rem 1rem", borderRadius: "8px", border: "1px solid var(--border)", background: "var(--bg-elevated)" }}>
          <option value="">Experience Level</option>
          <option value="entry">Entry-Level (0-2 yrs)</option>
          <option value="mid">Mid-Level (3-5 yrs)</option>
          <option value="senior">Senior (6-9 yrs)</option>
          <option value="lead">Lead/Principal (10+ yrs)</option>
        </select>
      </div>

      <button onClick={handleBenchmark} disabled={loading} className="btn-primary" style={{ width: "fit-content" }}>
        {loading ? "Analyzing Market Data..." : "Get Salary Benchmark"}
      </button>

      {result && (
        <div style={{ background: "rgba(16, 185, 129, 0.05)", border: "1px solid rgba(16, 185, 129, 0.2)", borderRadius: "10px", padding: "1.2rem", marginTop: "1rem" }}>
          <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "1rem", flexWrap: "wrap", gap: "1rem" }}>
            <div style={{ textAlign: "center", flex: 1 }}>
              <span style={{ fontSize: "0.8rem", color: "var(--text-muted)" }}>25th Percentile</span>
              <strong style={{ display: "block", fontSize: "1.2rem", color: "var(--text)" }}>{result.low}</strong>
            </div>
            <div style={{ textAlign: "center", flex: 1, borderLeft: "1px solid var(--border)", borderRight: "1px solid var(--border)" }}>
              <span style={{ fontSize: "0.8rem", color: "var(--text-muted)" }}>Median (50th)</span>
              <strong style={{ display: "block", fontSize: "1.4rem", color: "var(--accent)" }}>{result.median}</strong>
            </div>
            <div style={{ textAlign: "center", flex: 1 }}>
              <span style={{ fontSize: "0.8rem", color: "var(--text-muted)" }}>75th Percentile</span>
              <strong style={{ display: "block", fontSize: "1.2rem", color: "var(--text)" }}>{result.high}</strong>
            </div>
          </div>
          <div style={{ fontSize: "0.85rem", color: "var(--text)", lineHeight: 1.6 }}>
            <strong>Market Insight:</strong> {result.insights}
          </div>
        </div>
      )}
    </div>
  );
}
