"use client";
import React, { useState } from "react";
import { Users } from "lucide-react";
import { useToast } from "@/components/ui/toast-1";

export default function NetworkingAssistant() {
  const [targetPerson, setTargetPerson] = useState("");
  const [context, setContext] = useState("");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<string>("");
  const { showToast } = useToast();

  const handleGenerate = async () => {
    if (!targetPerson) {
      showToast("Please specify who you are reaching out to", "warning");
      return;
    }
    setLoading(true);
    try {
      const res = await fetch("/api/copilot/growth", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ type: "networking", targetPerson, context })
      });
      if (res.ok) {
        const data = await res.json();
        setResult(data.script);
      } else {
        showToast("Failed to generate message", "error");
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
        <Users size={18} className="text-blue-400" />
        Networking Assistant
      </h3>
      <p style={{ margin: 0, fontSize: "0.85rem", color: "var(--text-muted)", lineHeight: 1.5 }}>
        Draft personalized LinkedIn connection requests or cold outreach emails based on your background.
      </p>

      <div style={{ display: "grid", gap: "1rem" }}>
        <input 
          className="input" 
          placeholder="Who are you reaching out to? (e.g. Hiring Manager at Stripe)" 
          value={targetPerson} 
          onChange={e => setTargetPerson(e.target.value)} 
          style={{ width: "100%", padding: "0.6rem 1rem", borderRadius: "8px", border: "1px solid var(--border)", background: "var(--bg-elevated)" }} 
        />
        <input 
          className="input" 
          placeholder="Context (e.g. Interested in the frontend role, read their recent blog post)" 
          value={context} 
          onChange={e => setContext(e.target.value)} 
          style={{ width: "100%", padding: "0.6rem 1rem", borderRadius: "8px", border: "1px solid var(--border)", background: "var(--bg-elevated)" }} 
        />
        <button onClick={handleGenerate} disabled={loading} className="btn-secondary" style={{ width: "fit-content" }}>
          {loading ? "Drafting Message..." : "Draft Outreach Message"}
        </button>
      </div>

      {result && (
        <div style={{ background: "rgba(255, 255, 255, 0.03)", border: "1px solid var(--border)", borderRadius: "10px", padding: "1.2rem", marginTop: "0.5rem" }}>
          <p style={{ whiteSpace: "pre-wrap", margin: 0, fontSize: "0.9rem", color: "var(--text)", lineHeight: 1.6 }}>
            {result}
          </p>
        </div>
      )}
    </div>
  );
}
