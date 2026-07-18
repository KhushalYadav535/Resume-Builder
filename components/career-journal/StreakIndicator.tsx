"use client";
import React from "react";
import { Flame } from "lucide-react";
import { CareerJournalEntry } from "@/types";

interface StreakIndicatorProps {
  entries: CareerJournalEntry[];
}

export default function StreakIndicator({ entries }: StreakIndicatorProps) {
  /**
   * Computes how many consecutive calendar weeks the user logged at least one entry.
   * Counts backward from the current week.
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

    // Check each week going backward
    for (let i = 0; i <= 52; i++) {
      const weekDate = new Date(now);
      weekDate.setDate(now.getDate() - i * 7);
      const weekKey = getISOWeekKey(weekDate);
      if (weeksWithEntries.has(weekKey)) {
        streak++;
      } else if (i === 0) {
        // Current week is okay to skip (they may not have logged yet this week)
        continue;
      } else {
        break;
      }
    }

    return streak;
  };

  const streak = computeWeeklyStreak();
  const entriesCount = entries?.length ?? 0;

  return (
    <div
      className="card"
      style={{
        padding: "1.2rem 1.5rem",
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
        background: "linear-gradient(135deg, rgba(249, 115, 22, 0.05) 0%, rgba(239, 68, 68, 0.05) 100%)",
        border: "1px solid rgba(249, 115, 22, 0.2)",
      }}
    >
      <div>
        <h3
          style={{
            margin: "0 0 0.2rem",
            fontSize: "1.05rem",
            fontWeight: 700,
            display: "flex",
            alignItems: "center",
            gap: "0.4rem",
            color: "var(--text)",
          }}
        >
          Consistency Streak
        </h3>
        <p style={{ margin: 0, fontSize: "0.8rem", color: "var(--text-muted)" }}>
          {entriesCount === 0
            ? "Log your first entry to start your streak!"
            : `${entriesCount} total entr${entriesCount === 1 ? "y" : "ies"} logged`}
        </p>
      </div>

      <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
        <Flame
          size={28}
          className={streak > 0 ? "text-orange-500" : "text-gray-400"}
        />
        <div style={{ display: "flex", flexDirection: "column", alignItems: "center" }}>
          <span
            style={{
              fontSize: "1.4rem",
              fontWeight: 800,
              lineHeight: 1,
              color: streak >= 4 ? "#f97316" : streak >= 2 ? "#f59e0b" : "var(--text)",
            }}
          >
            {streak}
          </span>
          <span
            style={{
              fontSize: "0.65rem",
              textTransform: "uppercase",
              fontWeight: 700,
              color: "var(--text-muted)",
              letterSpacing: "0.5px",
            }}
          >
            {streak === 1 ? "Week" : "Weeks"}
          </span>
        </div>
      </div>
    </div>
  );
}
