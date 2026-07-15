"use client";
import React from "react";

interface ToneCalibratorProps {
  value: number; // 0 to 100
  onChange: (value: number) => void;
}

export default function ToneCalibrator({ value, onChange }: ToneCalibratorProps) {
  const getLabel = () => {
    if (value < 25) return "Modest & Humble";
    if (value < 50) return "Factual & Direct";
    if (value < 75) return "Confident & Professional";
    return "Bold & Assertive";
  };

  return (
    <div style={{ padding: "1rem 0" }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "0.8rem" }}>
        <label style={{ fontSize: "0.85rem", fontWeight: 700, color: "var(--text)" }}>Tone Calibrator</label>
        <span className="tag tag-purple" style={{ fontSize: "0.75rem", background: "rgba(108, 99, 255, 0.1)" }}>
          {getLabel()}
        </span>
      </div>
      
      <div style={{ position: "relative", padding: "0 10px" }}>
        <input
          type="range"
          min="0"
          max="100"
          value={value}
          onChange={(e) => onChange(parseInt(e.target.value))}
          style={{
            width: "100%",
            accentColor: "var(--accent)",
            cursor: "pointer"
          }}
        />
        
        <div style={{ display: "flex", justifyContent: "space-between", marginTop: "0.5rem", fontSize: "0.75rem", color: "var(--text-muted)" }}>
          <span>Modest</span>
          <span>Factual</span>
          <span>Confident</span>
          <span>Assertive</span>
        </div>
      </div>
    </div>
  );
}
