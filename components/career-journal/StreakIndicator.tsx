"use client";
import React from "react";
import { Flame } from "lucide-react";

export default function StreakIndicator({ entriesCount }: { entriesCount: number }) {
  // Simple streak logic for demo
  const streak = Math.min(Math.floor(entriesCount / 2) + 1, 12);
  
  return (
    <div className="card" style={{ padding: "1.2rem 1.5rem", display: "flex", justifyContent: "space-between", alignItems: "center", background: "linear-gradient(135deg, rgba(249, 115, 22, 0.05) 0%, rgba(239, 68, 68, 0.05) 100%)", border: "1px solid rgba(249, 115, 22, 0.2)" }}>
      <div>
        <h3 style={{ margin: "0 0 0.2rem", fontSize: "1.05rem", fontWeight: 700, display: "flex", alignItems: "center", gap: "0.4rem", color: "var(--text)" }}>
          Consistency Streak
        </h3>
        <p style={{ margin: 0, fontSize: "0.8rem", color: "var(--text-muted)" }}>
          Logging regularly reduces resume rewrite time.
        </p>
      </div>
      
      <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
        <Flame size={28} className="text-orange-500" />
        <div style={{ display: "flex", flexDirection: "column", alignItems: "center" }}>
          <span style={{ fontSize: "1.4rem", fontWeight: 800, lineHeight: 1 }}>{streak}</span>
          <span style={{ fontSize: "0.65rem", textTransform: "uppercase", fontWeight: 700, color: "var(--text-muted)", letterSpacing: "0.5px" }}>Weeks</span>
        </div>
      </div>
    </div>
  );
}
