"use client";
import React from "react";
import { Sliders, Sparkles } from "lucide-react";

interface ToneCalibratorProps {
  value: number; // 0 to 100
  onChange: (value: number) => void;
}

const PRESETS = [
  { label: "Modest", desc: "Humble & Collaborative", val: 15, tag: "Modest & Humble", color: "#38BDF8" },
  { label: "Factual", desc: "Direct & Metric-driven", val: 38, tag: "Factual & Direct", color: "#34D399" },
  { label: "Confident", desc: "Executive & Polished", val: 65, tag: "Confident & Professional", color: "#F59E0B" },
  { label: "Assertive", desc: "Bold & High-impact", val: 90, tag: "Bold & Assertive", color: "#EC4899" },
];

export default function ToneCalibrator({ value, onChange }: ToneCalibratorProps) {
  const currentPreset =
    value < 25 ? PRESETS[0] : value < 50 ? PRESETS[1] : value < 75 ? PRESETS[2] : PRESETS[3];

  return (
    <div
      style={{
        padding: "1rem 1.2rem",
        borderRadius: "12px",
        background: "rgba(255, 255, 255, 0.02)",
        border: "1px solid var(--border)",
      }}
    >
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "0.85rem", flexWrap: "wrap", gap: "0.5rem" }}>
        <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
          <Sliders size={16} className="text-amber-500" />
          <label style={{ fontSize: "0.85rem", fontWeight: 700, color: "var(--text)" }}>
            Tone &amp; Executive Posture
          </label>
        </div>
        <div
          style={{
            fontSize: "0.75rem",
            fontWeight: 700,
            padding: "0.2rem 0.65rem",
            borderRadius: "999px",
            background: `${currentPreset.color}18`,
            color: currentPreset.color,
            border: `1px solid ${currentPreset.color}40`,
            display: "inline-flex",
            alignItems: "center",
            gap: "0.35rem",
          }}
        >
          <Sparkles size={11} />
          {currentPreset.tag}
        </div>
      </div>

      {/* Preset Buttons */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: "0.4rem", marginBottom: "0.85rem" }}>
        {PRESETS.map((p) => {
          const isActive =
            (p.val === 15 && value < 25) ||
            (p.val === 38 && value >= 25 && value < 50) ||
            (p.val === 65 && value >= 50 && value < 75) ||
            (p.val === 90 && value >= 75);
          return (
            <button
              key={p.label}
              type="button"
              onClick={() => onChange(p.val)}
              style={{
                padding: "0.4rem 0.2rem",
                borderRadius: "8px",
                border: isActive ? `1.5px solid ${p.color}` : "1px solid var(--border)",
                background: isActive ? `${p.color}15` : "var(--bg-elevated)",
                color: isActive ? p.color : "var(--text-muted)",
                fontSize: "0.75rem",
                fontWeight: isActive ? 700 : 500,
                cursor: "pointer",
                transition: "all 0.15s ease",
                textAlign: "center",
              }}
            >
              <div>{p.label}</div>
            </button>
          );
        })}
      </div>

      {/* Range Slider with Gradient Track */}
      <div style={{ position: "relative", padding: "0 4px" }}>
        <input
          type="range"
          min="0"
          max="100"
          value={value}
          onChange={(e) => onChange(parseInt(e.target.value))}
          style={{
            width: "100%",
            accentColor: currentPreset.color,
            cursor: "pointer",
            height: "6px",
            borderRadius: "999px",
          }}
        />
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            marginTop: "0.4rem",
            fontSize: "0.72rem",
            color: "var(--text-muted)",
          }}
        >
          <span>Modest (0%)</span>
          <span>Factual (35%)</span>
          <span>Confident (65%)</span>
          <span>Assertive (100%)</span>
        </div>
      </div>
    </div>
  );
}
