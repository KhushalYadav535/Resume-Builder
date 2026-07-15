"use client";
import React, { useState } from "react";
import { Users, BarChart } from "lucide-react";
import { useToast } from "@/components/ui/toast-1";

export default function PeerBenchmark({ userAtsScore = 0 }: { userAtsScore?: number }) {
  const [role, setRole] = useState("");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<{ averageAtsScore: number; coreSkills: string[] } | null>(null);
  const { showToast } = useToast();

  const handleBenchmark = async () => {
    if (!role) {
      showToast("Please enter a target role", "warning");
      return;
    }
    setLoading(true);
    try {
      const res = await fetch("/api/copilot/market-insight", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ type: "peer-benchmark", role })
      });
      if (res.ok) {
        const data = await res.json();
        setResult(data);
      } else {
        showToast("Failed to fetch benchmark data", "error");
      }
    } catch (err) {
      console.error(err);
      showToast("An error occurred", "error");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="card" style={{ padding: "1.2rem", background: "linear-gradient(135deg, rgba(236, 72, 153, 0.05) 0%, rgba(219, 39, 119, 0.05) 100%)", border: "1px solid rgba(236, 72, 153, 0.15)" }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: "1rem" }}>
        <div>
          <h3 style={{ margin: "0 0 0.2rem", fontSize: "1rem", fontWeight: 700, display: "flex", alignItems: "center", gap: "0.5rem" }}>
            <Users size={16} className="text-pink-500" />
            Peer Benchmark
          </h3>
          <p style={{ margin: "0 0 1rem", fontSize: "0.8rem", color: "var(--text-muted)", lineHeight: 1.5 }}>
            Compare your profile against the AI-generated industry average for a specific role.
          </p>
        </div>
      </div>

      <div style={{ display: "flex", gap: "0.8rem" }}>
        <input 
          className="input" 
          placeholder="Target Role (e.g. Data Scientist)" 
          value={role} 
          onChange={e => setRole(e.target.value)}
          onKeyDown={e => e.key === 'Enter' && handleBenchmark()}
          style={{ flex: 1, padding: "0.5rem 0.8rem", borderRadius: "8px", border: "1px solid var(--border)", background: "var(--bg-elevated)", fontSize: "0.85rem" }} 
        />
        <button onClick={handleBenchmark} disabled={loading} className="btn-secondary" style={{ fontSize: "0.85rem", padding: "0.5rem 1rem" }}>
          {loading ? "..." : "Compare"}
        </button>
      </div>

      {result && (
        <div style={{ marginTop: "1rem", paddingTop: "1rem", borderTop: "1px solid rgba(236, 72, 153, 0.2)" }}>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1rem", textAlign: "center" }}>
            <div>
              <span style={{ fontSize: "0.75rem", color: "var(--text-muted)", textTransform: "uppercase", letterSpacing: "0.5px" }}>You</span>
              <div style={{ fontSize: "1.5rem", fontWeight: 800, fontFamily: "Syne, sans-serif", color: userAtsScore >= result.averageAtsScore ? "#10b981" : "#ef4444" }}>
                {userAtsScore}
              </div>
            </div>
            <div style={{ borderLeft: "1px solid rgba(236, 72, 153, 0.2)" }}>
              <span style={{ fontSize: "0.75rem", color: "var(--text-muted)", textTransform: "uppercase", letterSpacing: "0.5px" }}>Industry Avg</span>
              <div style={{ fontSize: "1.5rem", fontWeight: 800, fontFamily: "Syne, sans-serif", color: "var(--text)" }}>
                {result.averageAtsScore}
              </div>
            </div>
          </div>
          
          <div style={{ marginTop: "1rem" }}>
            <span style={{ fontSize: "0.8rem", fontWeight: 600, color: "var(--text)", display: "block", marginBottom: "0.4rem" }}>Baseline Core Skills Expected:</span>
            <div style={{ display: "flex", flexWrap: "wrap", gap: "0.4rem" }}>
              {result.coreSkills.map((s, i) => (
                <span key={i} className="tag tag-pink" style={{ fontSize: "0.7rem" }}>{s}</span>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
