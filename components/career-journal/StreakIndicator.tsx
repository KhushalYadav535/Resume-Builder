"use client";
import React, { useMemo } from "react";
import { Flame, Sparkles, TrendingUp, ShieldCheck } from "lucide-react";
import { CareerJournalEntry } from "@/types";

interface StreakIndicatorProps {
  entries: CareerJournalEntry[];
}

export default function StreakIndicator({ entries }: StreakIndicatorProps) {
  /**
   * Computes how many consecutive calendar weeks the user logged at least one entry.
   */
  const computeWeeklyStreak = (): number => {
    if (!entries || entries.length === 0) return 0;

    const getISOWeekKey = (date: Date): string => {
      const d = new Date(Date.UTC(date.getFullYear(), date.getMonth(), date.getDate()));
      const dayNum = d.getUTCDay() || 7; // Mon=1, Sun=7
      d.setUTCDate(d.getUTCDate() + 4 - dayNum);
      const yearStart = new Date(Date.UTC(d.getUTCFullYear(), 0, 1));
      const weekNo = Math.ceil(
        ((d.getTime() - yearStart.getTime()) / 86400000 + 1) / 7
      );
      return `${d.getUTCFullYear()}-W${weekNo}`;
    };

    const weeksWithEntries = new Set(
      entries.map((e) => getISOWeekKey(new Date(e.date)))
    );

    let streak = 0;
    const now = new Date();

    for (let i = 0; i <= 52; i++) {
      const weekDate = new Date(now);
      weekDate.setDate(now.getDate() - i * 7);
      const weekKey = getISOWeekKey(weekDate);
      if (weeksWithEntries.has(weekKey)) {
        streak++;
      } else if (i === 0) {
        continue;
      } else {
        break;
      }
    }

    return streak;
  };

  const streak = computeWeeklyStreak();
  const entriesCount = entries?.length ?? 0;

  // Build 7-day heatmap (last 7 days including today)
  const heatmapDays = useMemo(() => {
    const days: { label: string; count: number; dateStr: string }[] = [];
    const now = new Date();
    const dayLabels = ["S", "M", "T", "W", "T", "F", "S"];
    for (let i = 6; i >= 0; i--) {
      const d = new Date(now);
      d.setDate(now.getDate() - i);
      const dateStr = d.toISOString().split("T")[0];
      const count = entries?.filter(
        (e) => new Date(e.date).toISOString().split("T")[0] === dateStr
      ).length ?? 0;
      days.push({ label: dayLabels[d.getDay()], count, dateStr });
    }
    return days;
  }, [entries]);

  const getTier = () => {
    if (streak >= 8) return { label: "Executive", color: "#F59E0B" };
    if (streak >= 4) return { label: "Strong Rhythm", color: "#F59E0B" };
    if (streak >= 2) return { label: "Consistent", color: "#14B8A6" };
    return { label: "Foundation", color: "#64748B" };
  };

  const tier = getTier();

  const getStreakMessage = () => {
    if (entriesCount === 0) return "Log your first event to activate your momentum streak.";
    if (streak >= 8) return "Outstanding! Your career evidence is compounding weekly.";
    if (streak >= 4) return "Great rhythm! Regular logging turns work into career equity.";
    if (streak >= 2) return "Building consistency. Keep recording your weekly wins.";
    if (streak === 1) return "First week logged! Capture something every week.";
    return `${entriesCount} career event${entriesCount === 1 ? "" : "s"} safely preserved.`;
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
        animation: "journal-fadeInUp 0.5s ease forwards",
      }}
    >
      {/* Top accent hairline */}
      <div style={{
        position: "absolute",
        top: 0,
        left: 0,
        right: 0,
        height: "3px",
        background: "linear-gradient(90deg, #F59E0B, #FBBF24)",
        borderRadius: "16px 16px 0 0",
      }} />

      {/* Header Row */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "0.75rem" }}>
        <div style={{ display: "flex", alignItems: "center", gap: "0.55rem" }}>
          <div style={{
            width: 32,
            height: 32,
            borderRadius: "9px",
            background: "rgba(245, 158, 11, 0.12)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}>
            <Flame
              size={17}
              style={{
                color: streak > 0 ? "var(--brand-amber, #F59E0B)" : "var(--text-muted)",
              }}
            />
          </div>
          <div>
            <h3 style={{
              margin: 0,
              fontSize: "0.95rem",
              fontWeight: 800,
              fontFamily: "Space Grotesk, Syne, sans-serif",
              color: "var(--text-primary)",
            }}>
              Career Momentum
            </h3>
            <span style={{
              fontSize: "0.68rem",
              fontWeight: 700,
              textTransform: "uppercase",
              letterSpacing: "0.5px",
              color: tier.color,
            }}>
              {tier.label} Tier
            </span>
          </div>
        </div>

        {/* Streak Counter Pill */}
        <div style={{
          display: "flex",
          alignItems: "baseline",
          gap: "0.25rem",
          background: "var(--bg-2, #F1F4F9)",
          padding: "0.25rem 0.65rem",
          borderRadius: "8px",
          border: "1px solid var(--border)",
        }}>
          <span style={{
            fontSize: "1.15rem",
            fontWeight: 800,
            fontFamily: "Syne, sans-serif",
            color: streak > 0 ? "var(--brand-amber, #F59E0B)" : "var(--text-muted)",
            lineHeight: 1,
          }}>
            {streak}
          </span>
          <span style={{
            fontSize: "0.65rem",
            textTransform: "uppercase",
            fontWeight: 700,
            color: "var(--text-muted)",
            letterSpacing: "0.4px",
          }}>
            {streak === 1 ? "Wk" : "Wks"}
          </span>
        </div>
      </div>

      <p style={{
        margin: "0 0 0.85rem",
        fontSize: "0.78rem",
        color: "var(--text-secondary)",
        lineHeight: 1.45,
      }}>
        {getStreakMessage()}
      </p>

      {/* 7-Day Micro Heatmap */}
      <div style={{
        background: "var(--bg-2, #F1F4F9)",
        borderRadius: "10px",
        padding: "0.55rem 0.65rem",
        border: "1px solid var(--border)",
      }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "0.4rem" }}>
          <span style={{ fontSize: "0.68rem", color: "var(--text-muted)", fontWeight: 600 }}>7-Day Activity</span>
          <span style={{ fontSize: "0.66rem", color: "var(--text-muted)" }}>{entriesCount} logs</span>
        </div>

        <div style={{
          display: "flex",
          gap: "0.35rem",
          justifyContent: "space-between",
        }}>
          {heatmapDays.map((day, i) => (
            <div key={i} style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: "0.25rem" }}>
              <div
                title={`${day.count} event${day.count === 1 ? "" : "s"} on ${day.dateStr}`}
                style={{
                  width: "14px",
                  height: "14px",
                  borderRadius: "4px",
                  background: day.count === 0
                    ? "var(--border, #E2E8F0)"
                    : day.count === 1
                      ? "rgba(245, 158, 11, 0.55)"
                      : "var(--brand-amber, #F59E0B)",
                  boxShadow: day.count > 0 ? "0 0 6px rgba(245, 158, 11, 0.35)" : "none",
                  transition: "all 0.2s",
                }}
              />
              <span style={{ fontSize: "0.62rem", color: "var(--text-muted)", fontWeight: 600 }}>{day.label}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
