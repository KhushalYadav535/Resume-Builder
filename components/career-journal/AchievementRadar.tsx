"use client";
import React from "react";
import { Radar, Target } from "lucide-react";
import { CareerJournalEntry } from "@/types";

interface AchievementRadarProps {
  onLogQuickWin: () => void;
  entries: CareerJournalEntry[];
}

export default function AchievementRadar({ onLogQuickWin, entries }: AchievementRadarProps) {
  // Compute real days since last entry
  const getDaysSinceLastEntry = (): number | null => {
    if (!entries || entries.length === 0) return null;
    const sortedDates = entries
      .map((e) => new Date(e.date).getTime())
      .sort((a, b) => b - a);
    const lastEntry = new Date(sortedDates[0]);
    const now = new Date();
    const diffMs = now.getTime() - lastEntry.getTime();
    return Math.floor(diffMs / (1000 * 60 * 60 * 24));
  };

  const daysSince = getDaysSinceLastEntry();

  // Only show if 5+ days since last entry, or no entries at all
  const shouldShow = daysSince === null || daysSince >= 5;

  if (!shouldShow) return null;

  const getPromptText = () => {
    if (daysSince === null) {
      return "You haven't logged any career events yet. Start capturing your wins today — future-you will thank you when updating your resume!";
    }
    if (daysSince >= 14) {
      return `It's been ${daysSince} days since your last entry. Did anything noteworthy happen at work recently — a project shipped, feedback received, or a skill learned?`;
    }
    return `It's been ${daysSince} days since your last log. Did you finish anything significant or receive any feedback worth capturing?`;
  };

  return (
    <div
      className="card"
      style={{
        padding: "1.5rem",
        border: "1px solid rgba(239, 68, 68, 0.2)",
        position: "relative",
        overflow: "hidden",
      }}
    >
      {/* Background radar effect */}
      <div style={{ position: "absolute", top: -20, right: -20, opacity: 0.05, color: "var(--accent)" }}>
        <Radar size={120} />
      </div>

      <h3
        style={{
          margin: "0 0 0.5rem",
          fontSize: "1.05rem",
          fontWeight: 700,
          display: "flex",
          alignItems: "center",
          gap: "0.5rem",
        }}
      >
        <Target size={18} className="text-red-400" />
        Achievement Radar
      </h3>
      <p
        style={{
          fontSize: "0.85rem",
          color: "var(--text-secondary)",
          margin: "0 0 1rem",
          lineHeight: 1.5,
          position: "relative",
          zIndex: 1,
        }}
      >
        {getPromptText()}
      </p>

      <button
        onClick={onLogQuickWin}
        className="btn-secondary"
        style={{ width: "100%", fontSize: "0.85rem", padding: "0.6rem", borderColor: "rgba(239, 68, 68, 0.4)", color: "var(--text)" }}
      >
        Log a Quick Win
      </button>
    </div>
  );
}
