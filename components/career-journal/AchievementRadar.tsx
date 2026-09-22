"use client";
import React from "react";
import { Radar, Compass, Sparkles } from "lucide-react";
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
      return "Every major career advancement is built on documented evidence. Capture your first win today.";
    }
    if (daysSince >= 14) {
      return `It's been ${daysSince} days since your last entry. High performers routinely overlook their best impact. Did you ship code or gain feedback recently?`;
    }
    return `It's been ${daysSince} days since your last event. Keep your evidence loop active by recording a recent win.`;
  };

  return (
    <div
      style={{
        background: "var(--bg-elevated, #ffffff)",
        border: "1px solid var(--border)",
        borderRadius: "16px",
        padding: "1.2rem",
        boxShadow: "0 4px 16px rgba(16, 27, 59, 0.03)",
        position: "relative",
        overflow: "hidden",
        animation: "journal-fadeInUp 0.6s ease forwards",
        animationDelay: "0.1s",
      }}
    >
      {/* Top accent hairline */}
      <div style={{
        position: "absolute",
        top: 0,
        left: 0,
        right: 0,
        height: "3px",
        background: "linear-gradient(90deg, #F59E0B, #EF4444)",
        borderRadius: "16px 16px 0 0",
      }} />

      {/* Header */}
      <div style={{ display: "flex", alignItems: "center", gap: "0.55rem", marginBottom: "0.55rem" }}>
        <div style={{
          width: 32,
          height: 32,
          borderRadius: "9px",
          background: "rgba(245, 158, 11, 0.12)",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}>
          <Compass size={17} style={{ color: "var(--brand-amber, #F59E0B)" }} />
        </div>
        <div>
          <h3 style={{
            margin: 0,
            fontSize: "0.95rem",
            fontWeight: 800,
            fontFamily: "Space Grotesk, Syne, sans-serif",
            color: "var(--text-primary)",
          }}>
            Achievement Radar
          </h3>
          <span style={{ fontSize: "0.68rem", color: "var(--text-muted)" }}>
            Value Continuity Check
          </span>
        </div>
      </div>

      <p
        style={{
          fontSize: "0.78rem",
          color: "var(--text-secondary)",
          margin: "0 0 0.85rem",
          lineHeight: 1.45,
        }}
      >
        {getPromptText()}
      </p>

      <button
        onClick={onLogQuickWin}
        className="btn-primary journal-cta-glow"
        style={{
          width: "100%",
          fontSize: "0.8rem",
          padding: "0.55rem",
          borderRadius: "9px",
          fontWeight: 700,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          gap: "0.4rem",
        }}
      >
        <Sparkles size={13} />
        Log Recent Achievement
      </button>
    </div>
  );
}
