"use client";
import Link from "next/link";
import { ThemeToggle } from "@/components/ThemeToggle";

export default function Home() {
  return (
    <main
      style={{
        minHeight: "100vh",
        background: "var(--bg)",
        overflow: "hidden",
        position: "relative",
      }}
    >
      {/* Background glow blobs */}
      <div
        style={{
          position: "absolute",
          top: "-200px",
          left: "50%",
          transform: "translateX(-50%)",
          width: "800px",
          height: "800px",
          background: "radial-gradient(circle, rgba(108,99,255,0.12) 0%, transparent 70%)",
          pointerEvents: "none",
        }}
      />
      <div
        style={{
          position: "absolute",
          bottom: "0",
          right: "-200px",
          width: "500px",
          height: "500px",
          background: "radial-gradient(circle, rgba(255,101,132,0.08) 0%, transparent 70%)",
          pointerEvents: "none",
        }}
      />

      {/* Responsive Navbar Styles */}
      <style dangerouslySetInnerHTML={{ __html: `
        .landing-nav {
          padding: 1.2rem 2.5rem !important;
        }
        .landing-logo {
          font-size: 1.4rem !important;
        }
        .landing-nav-btn {
          padding: 0.5rem 1.2rem !important;
          font-size: 0.9rem !important;
        }
        @media (max-width: 600px) {
          .landing-nav {
            padding: 1rem 1rem !important;
          }
          .landing-logo {
            font-size: 1.15rem !important;
          }
          .landing-nav-btn {
            padding: 0.4rem 0.8rem !important;
            font-size: 0.8rem !important;
          }
        }
      `}} />

      {/* Navbar */}
      <nav
        className="landing-nav"
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          borderBottom: "1px solid var(--border)",
          background: "var(--nav-bg)",
          backdropFilter: "blur(10px)",
          position: "sticky",
          top: 0,
          zIndex: 100,
        }}
      >
        <span
          className="landing-logo"
          style={{
            fontFamily: "Syne, sans-serif",
            fontWeight: 800,
            background: "linear-gradient(135deg, #6c63ff, #ff6584)",
            WebkitBackgroundClip: "text",
            WebkitTextFillColor: "transparent",
          }}
        >
          ResumeAI
        </span>
        <div style={{ display: "flex", gap: "0.5rem", alignItems: "center" }}>
          <ThemeToggle />
          <Link href="/dashboard" style={{ textDecoration: "none" }}>
            <button className="btn-secondary landing-nav-btn">
              Dashboard
            </button>
          </Link>
          <Link href="/resume/builder" style={{ textDecoration: "none" }}>
            <button className="btn-primary landing-nav-btn">
              Get Started →
            </button>
          </Link>
        </div>
      </nav>

      {/* Hero */}
      <section
        style={{
          maxWidth: "900px",
          margin: "0 auto",
          padding: "6rem 2rem 4rem",
          textAlign: "center",
        }}
      >
        <div
          className="tag tag-purple"
          style={{ marginBottom: "1.5rem", display: "inline-flex" }}
        >
          ✦ AI-Powered Resume Platform
        </div>

        <h1
          style={{
            fontFamily: "Syne, sans-serif",
            fontSize: "clamp(2.5rem, 6vw, 4.5rem)",
            fontWeight: 800,
            lineHeight: 1.1,
            marginBottom: "1.5rem",
          }}
        >
          Land your dream job with a{" "}
          <span className="gradient-text">resume that works</span>
        </h1>

        <p
          style={{
            fontSize: "1.15rem",
            color: "var(--text-muted)",
            lineHeight: 1.7,
            maxWidth: "600px",
            margin: "0 auto 2.5rem",
          }}
        >
          Build from scratch, optimize for ATS, match job descriptions, and get
          AI-powered content improvements — all in one free platform.
        </p>

        <div style={{ display: "flex", gap: "1rem", justifyContent: "center", flexWrap: "wrap" }}>
          <Link href="/resume/builder" style={{ textDecoration: "none" }}>
            <button className="btn-primary" style={{ padding: "0.9rem 2rem", fontSize: "1rem" }}>
              ✦ Build My Resume
            </button>
          </Link>
          <Link href="/resume/upload" style={{ textDecoration: "none" }}>
            <button className="btn-secondary" style={{ padding: "0.9rem 2rem", fontSize: "1rem" }}>
              Upload Existing Resume
            </button>
          </Link>
        </div>

        {/* Stats */}
        <div
          style={{
            display: "flex",
            gap: "2rem",
            justifyContent: "center",
            marginTop: "4rem",
            flexWrap: "wrap",
          }}
        >
          {[
            { value: "75%", label: "Resumes rejected by ATS" },
            { value: "6 sec", label: "Average recruiter screen time" },
            { value: "250+", label: "Applications per job posting" },
          ].map((stat) => (
            <div key={stat.label} style={{ textAlign: "center" }}>
              <div
                style={{
                  fontFamily: "Syne, sans-serif",
                  fontSize: "2rem",
                  fontWeight: 800,
                  background: "linear-gradient(135deg, #6c63ff, #ff6584)",
                  WebkitBackgroundClip: "text",
                  WebkitTextFillColor: "transparent",
                }}
              >
                {stat.value}
              </div>
              <div style={{ color: "var(--text-muted)", fontSize: "0.85rem", marginTop: "0.2rem" }}>
                {stat.label}
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Features */}
      <section
        style={{
          maxWidth: "1100px",
          margin: "0 auto",
          padding: "2rem 2rem 6rem",
        }}
      >
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))",
            gap: "1.5rem",
          }}
        >
          {[
            {
              icon: "✦",
              color: "#6c63ff",
              title: "Resume Builder",
              desc: "Build a professional resume from scratch with AI assistance on every section.",
            },
            {
              icon: "◈",
              color: "#43e97b",
              title: "ATS Score Checker",
              desc: "Instantly see how your resume performs against Applicant Tracking Systems.",
            },
            {
              icon: "◉",
              color: "#ff6584",
              title: "Content Reviewer",
              desc: "AI improves your bullet points, suggests powerful action verbs, and quantifies achievements.",
            },
            {
              icon: "⬡",
              color: "#f6d365",
              title: "JD Matcher",
              desc: "Paste any job description and get a keyword gap analysis instantly.",
            },
            {
              icon: "▣",
              color: "#a89fff",
              title: "ATS-Friendly Templates",
              desc: "Choose from professionally designed templates that beat ATS filters.",
            },
            {
              icon: "⇓",
              color: "#43e97b",
              title: "Export to PDF",
              desc: "Download your polished resume as a clean, formatted PDF instantly.",
            },
          ].map((feature) => (
            <div
              key={feature.title}
              className="card"
              style={{ transition: "all 0.3s" }}
              onMouseEnter={(e) => {
                (e.currentTarget as HTMLDivElement).style.borderColor = feature.color + "55";
                (e.currentTarget as HTMLDivElement).style.transform = "translateY(-4px)";
              }}
              onMouseLeave={(e) => {
                (e.currentTarget as HTMLDivElement).style.borderColor = "var(--border)";
                (e.currentTarget as HTMLDivElement).style.transform = "translateY(0)";
              }}
            >
              <div
                style={{
                  width: "40px",
                  height: "40px",
                  borderRadius: "10px",
                  background: feature.color + "20",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  fontSize: "1.3rem",
                  color: feature.color,
                  marginBottom: "1rem",
                }}
              >
                {feature.icon}
              </div>
              <h3
                style={{
                  fontFamily: "Syne, sans-serif",
                  fontWeight: 700,
                  fontSize: "1.05rem",
                  marginBottom: "0.5rem",
                }}
              >
                {feature.title}
              </h3>
              <p style={{ color: "var(--text-muted)", fontSize: "0.88rem", lineHeight: 1.6 }}>
                {feature.desc}
              </p>
            </div>
          ))}
        </div>
      </section>

      {/* CTA */}
      <section
        style={{
          textAlign: "center",
          padding: "4rem 2rem 6rem",
          borderTop: "1px solid var(--border)",
        }}
      >
        <h2
          style={{
            fontFamily: "Syne, sans-serif",
            fontSize: "2rem",
            fontWeight: 800,
            marginBottom: "1rem",
          }}
        >
          Ready to get more interviews?
        </h2>
        <p style={{ color: "var(--text-muted)", marginBottom: "2rem" }}>
          Free. No credit card. No account needed to start.
        </p>
        <Link href="/resume/builder" style={{ textDecoration: "none" }}>
          <button className="btn-primary" style={{ padding: "1rem 2.5rem", fontSize: "1.05rem" }}>
            Start Building Now →
          </button>
        </Link>
      </section>
    </main>
  );
}
