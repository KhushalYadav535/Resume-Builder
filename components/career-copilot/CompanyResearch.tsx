"use client";
import React, { useState } from "react";
import { Building2, Info, Newspaper, MessageSquareQuote } from "lucide-react";
import { useToast } from "@/components/ui/toast-1";

export default function CompanyResearch() {
  const [companyName, setCompanyName] = useState("");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<{ culture: string; recentNews: string; interviewStyle: string } | null>(null);
  const { showToast } = useToast();

  const handleResearch = async () => {
    if (!companyName) {
      showToast("Please enter a company name", "warning");
      return;
    }
    setLoading(true);
    try {
      const res = await fetch("/api/copilot/market-insight", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ type: "company-research", companyName })
      });
      if (res.ok) {
        const data = await res.json();
        setResult(data);
      } else {
        showToast("Failed to fetch research", "error");
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
        <Building2 size={18} className="text-indigo-500" />
        Company Research Brief
      </h3>
      <p style={{ margin: 0, fontSize: "0.85rem", color: "var(--text-muted)", lineHeight: 1.5 }}>
        Get an AI-generated summary of a target company's culture, recent news, and interview style.
      </p>

      <div style={{ display: "flex", gap: "1rem" }}>
        <input 
          className="input" 
          placeholder="Company Name (e.g. Stripe, Netflix)" 
          value={companyName} 
          onChange={e => setCompanyName(e.target.value)}
          onKeyDown={e => e.key === 'Enter' && handleResearch()}
          style={{ flex: 1, padding: "0.6rem 1rem", borderRadius: "8px", border: "1px solid var(--border)", background: "var(--bg-elevated)" }} 
        />
        <button onClick={handleResearch} disabled={loading} className="btn-secondary">
          {loading ? "Researching..." : "Generate Brief"}
        </button>
      </div>

      {result && (
        <div style={{ background: "rgba(99, 102, 241, 0.05)", border: "1px solid rgba(99, 102, 241, 0.2)", borderRadius: "10px", padding: "1.2rem", marginTop: "0.5rem", display: "grid", gap: "1.2rem" }}>
          
          <div>
            <h4 style={{ margin: "0 0 0.4rem", fontSize: "0.9rem", color: "var(--text)", display: "flex", alignItems: "center", gap: "0.4rem" }}>
              <Info size={14} className="text-indigo-400" /> Culture & Values
            </h4>
            <p style={{ margin: 0, fontSize: "0.85rem", color: "var(--text-muted)", lineHeight: 1.6 }}>{result.culture}</p>
          </div>
          
          <div style={{ borderTop: "1px solid var(--border)", paddingTop: "1rem" }}>
            <h4 style={{ margin: "0 0 0.4rem", fontSize: "0.9rem", color: "var(--text)", display: "flex", alignItems: "center", gap: "0.4rem" }}>
              <Newspaper size={14} className="text-emerald-400" /> Recent News & Shifts
            </h4>
            <p style={{ margin: 0, fontSize: "0.85rem", color: "var(--text-muted)", lineHeight: 1.6 }}>{result.recentNews}</p>
          </div>
          
          <div style={{ borderTop: "1px solid var(--border)", paddingTop: "1rem" }}>
            <h4 style={{ margin: "0 0 0.4rem", fontSize: "0.9rem", color: "var(--text)", display: "flex", alignItems: "center", gap: "0.4rem" }}>
              <MessageSquareQuote size={14} className="text-amber-400" /> Interview Style
            </h4>
            <p style={{ margin: 0, fontSize: "0.85rem", color: "var(--text-muted)", lineHeight: 1.6 }}>{result.interviewStyle}</p>
          </div>

        </div>
      )}
    </div>
  );
}
