"use client";
import React from "react";
import { Radar, Target } from "lucide-react";

export default function AchievementRadar({ onLogQuickWin }: { onLogQuickWin: () => void }) {
  // In a real implementation, this would check the last entry date.
  // For the demo, we assume the user hasn't logged anything in 7 days.
  return (
    <div className="card" style={{ padding: "1.5rem", border: "1px solid rgba(239, 68, 68, 0.2)", position: "relative", overflow: "hidden" }}>
      {/* Background radar effect */}
      <div style={{ position: "absolute", top: -20, right: -20, opacity: 0.05, color: "var(--accent)" }}>
        <Radar size={120} />
      </div>
      
      <h3 style={{ margin: "0 0 0.5rem", fontSize: "1.05rem", fontWeight: 700, display: "flex", alignItems: "center", gap: "0.5rem" }}>
        <Target size={18} className="text-red-400" />
        Achievement Radar
      </h3>
      <p style={{ fontSize: "0.85rem", color: "var(--text-secondary)", margin: "0 0 1rem", lineHeight: 1.5, position: "relative", zIndex: 1 }}>
        It's been <strong>over 7 days</strong> since your last log. Did you finish that major project or receive any client feedback this week? 
      </p>
      
      <button onClick={onLogQuickWin} className="btn-secondary" style={{ width: "100%", fontSize: "0.85rem", padding: "0.6rem", borderColor: "rgba(239, 68, 68, 0.4)", color: "var(--text)" }}>
        Log a Quick Win
      </button>
    </div>
  );
}
