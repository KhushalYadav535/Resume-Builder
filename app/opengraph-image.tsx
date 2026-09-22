import { ImageResponse } from "next/og";

export const runtime = "edge";
export const alt = "UpRole — Career Advancement Platform";
export const size = {
  width: 1200,
  height: 630,
};
export const contentType = "image/png";

export default async function Image() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          alignItems: "flex-start",
          justifyContent: "space-between",
          backgroundColor: "#0A1124",
          backgroundImage:
            "radial-gradient(circle at 25% 25%, #101B3B 0%, #070D18 100%)",
          padding: "80px",
          fontFamily: "sans-serif",
          position: "relative",
        }}
      >
        {/* Accent hairline border top */}
        <div
          style={{
            position: "absolute",
            top: 0,
            left: 0,
            right: 0,
            height: "6px",
            background: "linear-gradient(90deg, #F59E0B, #2563EB, #14B8A6)",
          }}
        />

        {/* Brand Header */}
        <div style={{ display: "flex", alignItems: "center", gap: "16px" }}>
          <div
            style={{
              width: "48px",
              height: "48px",
              borderRadius: "14px",
              backgroundColor: "#F59E0B",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              color: "#101B3B",
              fontSize: "28px",
              fontWeight: 900,
            }}
          >
            U
          </div>
          <span
            style={{
              color: "#FFFFFF",
              fontSize: "36px",
              fontWeight: 900,
              letterSpacing: "-1px",
            }}
          >
            UpRole
          </span>
          <span
            style={{
              marginLeft: "12px",
              padding: "6px 14px",
              borderRadius: "9999px",
              backgroundColor: "rgba(245, 158, 11, 0.15)",
              border: "1px solid rgba(245, 158, 11, 0.3)",
              color: "#F59E0B",
              fontSize: "14px",
              fontWeight: 800,
              letterSpacing: "1px",
              textTransform: "uppercase",
            }}
          >
            Career Advancement Platform
          </span>
        </div>

        {/* Hero Value Statement */}
        <div style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
          <h1
            style={{
              color: "#FFFFFF",
              fontSize: "58px",
              fontWeight: 900,
              lineHeight: 1.15,
              letterSpacing: "-2px",
              maxWidth: "960px",
              margin: 0,
            }}
          >
            More than a resume.{" "}
            <span style={{ color: "#F59E0B" }}>A brighter career ahead.</span>
          </h1>
          <p
            style={{
              color: "#94A3B8",
              fontSize: "24px",
              fontWeight: 500,
              lineHeight: 1.4,
              maxWidth: "850px",
              margin: 0,
            }}
          >
            AI-powered ATS Resume Optimizer, Career Discovery Engine, and
            Opportunity Pursuit Tracker built for ambitious professionals.
          </p>
        </div>

        {/* Footer Feature Badges */}
        <div style={{ display: "flex", alignItems: "center", gap: "32px" }}>
          <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
            <span style={{ color: "#14B8A6", fontSize: "20px" }}>✓</span>
            <span style={{ color: "#E2E8F0", fontSize: "16px", fontWeight: 700 }}>
              AI ATS Scoring Engine
            </span>
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
            <span style={{ color: "#2563EB", fontSize: "20px" }}>✓</span>
            <span style={{ color: "#E2E8F0", fontSize: "16px", fontWeight: 700 }}>
              Indian Tech Taxonomy
            </span>
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
            <span style={{ color: "#F59E0B", fontSize: "20px" }}>✓</span>
            <span style={{ color: "#E2E8F0", fontSize: "16px", fontWeight: 700 }}>
              Opportunity Pursuit Pipeline
            </span>
          </div>
        </div>
      </div>
    ),
    {
      ...size,
    }
  );
}
