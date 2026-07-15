"use client";
import React, { useState } from "react";
import { CalendarDays, Sparkles } from "lucide-react";
import { useToast } from "@/components/ui/toast-1";

export default function ProjectSync({ onGeneratedPrompt }: { onGeneratedPrompt: (prompt: string) => void }) {
  const [contextText, setContextText] = useState("");
  const [loading, setLoading] = useState(false);
  const { showToast } = useToast();

  const handleSync = async () => {
    if (!contextText) {
      showToast("Please enter a meeting or project title", "warning");
      return;
    }
    setLoading(true);
    try {
      const res = await fetch("/api/journal/project-sync", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ contextText })
      });
      if (res.ok) {
        const data = await res.json();
        onGeneratedPrompt(data.prompt);
        setContextText("");
      } else {
        showToast("Failed to generate prompt", "error");
      }
    } catch (err) {
      console.error(err);
      showToast("An error occurred", "error");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="card" style={{ padding: "1.5rem", background: "linear-gradient(135deg, rgba(234, 179, 8, 0.05) 0%, rgba(245, 158, 11, 0.05) 100%)", border: "1px solid rgba(234, 179, 8, 0.2)" }}>
      <h3 style={{ margin: "0 0 0.5rem", fontSize: "1.05rem", fontWeight: 700, display: "flex", alignItems: "center", gap: "0.5rem" }}>
        <CalendarDays size={18} className="text-yellow-500" />
        Project & Calendar Sync
      </h3>
      <p style={{ fontSize: "0.85rem", color: "var(--text-secondary)", margin: "0 0 1rem", lineHeight: 1.5 }}>
        Paste a recent meeting agenda or project title. AI will generate a personalized question to help you log your wins.
      </p>
      
      <div style={{ display: "grid", gap: "0.8rem" }}>
        <input 
          className="input" 
          placeholder="e.g. Q3 Roadmap Planning" 
          value={contextText} 
          onChange={e => setContextText(e.target.value)}
          onKeyDown={e => e.key === 'Enter' && handleSync()}
          style={{ width: "100%", padding: "0.6rem 1rem", borderRadius: "8px", border: "1px solid var(--border)", background: "var(--bg-elevated)", fontSize: "0.85rem" }} 
        />
        <button onClick={handleSync} disabled={loading} className="btn-secondary" style={{ width: "100%", fontSize: "0.85rem", padding: "0.6rem", display: "flex", justifyContent: "center", gap: "0.5rem", alignItems: "center" }}>
          {loading ? "Syncing..." : <><Sparkles size={14} /> Generate Prompt</>}
        </button>
      </div>
    </div>
  );
}
