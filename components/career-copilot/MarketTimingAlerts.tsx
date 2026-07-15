"use client";
import React, { useState } from "react";
import { LineChart, Activity, TrendingUp, TrendingDown, Minus } from "lucide-react";
import { useToast } from "@/components/ui/toast-1";

export default function MarketTimingAlerts() {
  const [industry, setIndustry] = useState("");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<{ trend: string; hiringVelocity: string; macroInsight: string } | null>(null);
  const { showToast } = useToast();

  const handleAnalyze = async () => {
    if (!industry) {
      showToast("Please enter an industry or domain", "warning");
      return;
    }
    setLoading(true);
    try {
      const res = await fetch("/api/copilot/market-insight", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ type: "market-timing", industry })
      });
      if (res.ok) {
        const data = await res.json();
        setResult(data);
      } else {
        showToast("Failed to fetch market data", "error");
      }
    } catch (err) {
      console.error(err);
      showToast("An error occurred", "error");
    } finally {
      setLoading(false);
    }
  };

  const getTrendIcon = (trend: string) => {
    switch (trend.toLowerCase()) {
      case "bullish": return <TrendingUp size={24} className="text-emerald-500" />;
      case "bearish": return <TrendingDown size={24} className="text-red-500" />;
      default: return <Minus size={24} className="text-yellow-500" />;
    }
  };

  const getTrendBg = (trend: string) => {
    switch (trend.toLowerCase()) {
      case "bullish": return "rgba(16, 185, 129, 0.05)";
      case "bearish": return "rgba(239, 68, 68, 0.05)";
      default: return "rgba(234, 179, 8, 0.05)";
    }
  };

  const getTrendBorder = (trend: string) => {
    switch (trend.toLowerCase()) {
      case "bullish": return "rgba(16, 185, 129, 0.2)";
      case "bearish": return "rgba(239, 68, 68, 0.2)";
      default: return "rgba(234, 179, 8, 0.2)";
    }
  };

  return (
    <div className="card" style={{ padding: "1.5rem", display: "grid", gap: "1.2rem" }}>
      <h3 style={{ margin: "0 0 0.5rem", fontSize: "1.1rem", fontWeight: 700, display: "flex", alignItems: "center", gap: "0.5rem" }}>
        <LineChart size={18} className="text-orange-500" />
        Market Timing Alerts
      </h3>
      <p style={{ margin: 0, fontSize: "0.85rem", color: "var(--text-muted)", lineHeight: 1.5 }}>
        Get real-time macro insights on hiring trends and shifts in your specific industry.
      </p>

      <div style={{ display: "flex", gap: "1rem" }}>
        <input 
          className="input" 
          placeholder="Industry (e.g. Fintech, Web3, AI)" 
          value={industry} 
          onChange={e => setIndustry(e.target.value)}
          onKeyDown={e => e.key === 'Enter' && handleAnalyze()}
          style={{ flex: 1, padding: "0.6rem 1rem", borderRadius: "8px", border: "1px solid var(--border)", background: "var(--bg-elevated)" }} 
        />
        <button onClick={handleAnalyze} disabled={loading} className="btn-secondary">
          {loading ? "Analyzing..." : "Analyze Market"}
        </button>
      </div>

      {result && (
        <div style={{ background: getTrendBg(result.trend), border: `1px solid ${getTrendBorder(result.trend)}`, borderRadius: "10px", padding: "1.2rem", marginTop: "0.5rem", display: "grid", gap: "1.2rem" }}>
          
          <div style={{ display: "flex", alignItems: "center", gap: "1rem" }}>
            <div style={{ width: "45px", height: "45px", borderRadius: "50%", background: "var(--bg)", display: "flex", alignItems: "center", justifyItems: "center", justifyContent: "center" }}>
              {getTrendIcon(result.trend)}
            </div>
            <div>
              <h4 style={{ margin: 0, fontSize: "1rem", color: "var(--text)", textTransform: "capitalize" }}>{result.trend} Market</h4>
              <p style={{ margin: 0, fontSize: "0.8rem", color: "var(--text-muted)" }}>Current hiring velocity trajectory.</p>
            </div>
          </div>
          
          <div style={{ borderTop: "1px solid var(--border)", paddingTop: "1rem" }}>
            <h4 style={{ margin: "0 0 0.4rem", fontSize: "0.9rem", color: "var(--text)", display: "flex", alignItems: "center", gap: "0.4rem" }}>
              <Activity size={14} className="text-orange-400" /> Hiring Velocity
            </h4>
            <p style={{ margin: 0, fontSize: "0.85rem", color: "var(--text-muted)", lineHeight: 1.6 }}>{result.hiringVelocity}</p>
          </div>
          
          <div style={{ borderTop: "1px solid var(--border)", paddingTop: "1rem" }}>
            <h4 style={{ margin: "0 0 0.4rem", fontSize: "0.9rem", color: "var(--text)", display: "flex", alignItems: "center", gap: "0.4rem" }}>
              <LineChart size={14} className="text-blue-400" /> Macro Insight
            </h4>
            <p style={{ margin: 0, fontSize: "0.85rem", color: "var(--text-muted)", lineHeight: 1.6 }}>{result.macroInsight}</p>
          </div>

        </div>
      )}
    </div>
  );
}
