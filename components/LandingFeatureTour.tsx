"use client";

import { useState, useEffect } from "react";
import { 
  Search, 
  Briefcase, 
  MessageSquare, 
  Layout, 
  FileText, 
  TrendingUp, 
  Check, 
  Sparkles, 
  ArrowRight, 
  ChevronRight,
  ChevronDown
} from "lucide-react";

interface StepItem {
  id: string;
  num: string;
  title: string;
  shortTitle: string;
  icon: React.ReactNode;
  color: string;
  description: string;
  renderGraphic: (isActive: boolean) => React.ReactNode;
}

export default function LandingFeatureTour() {
  const [activeStep, setActiveStep] = useState<number>(1); // Default active: Resume Tailoring
  const [isMobile, setIsMobile] = useState<boolean>(false);

  useEffect(() => {
    if (typeof window !== "undefined") {
      const handleResize = () => {
        setIsMobile(window.innerWidth < 850);
      };
      handleResize();
      window.addEventListener("resize", handleResize);
      return () => window.removeEventListener("resize", handleResize);
    }
  }, []);

  const steps: StepItem[] = [
    {
      id: "analysis",
      num: "01",
      title: "Resume Analysis",
      shortTitle: "Analysis",
      icon: <Search size={16} />,
      color: "#0ea5e9",
      description: "Instantly score your resume against 30+ ATS parameters. Identify formatting flaws, missing sections, and word-count optimization opportunities in one click.",
      renderGraphic: (isActive) => (
        <div style={{ 
          position: "relative", 
          width: "100%", 
          height: isActive ? "140px" : "90px", 
          background: "rgba(14, 165, 233, 0.03)", 
          borderRadius: "12px", 
          border: "1px solid rgba(14, 165, 233, 0.15)", 
          padding: "12px", 
          display: "flex", 
          flexDirection: "column", 
          gap: "8px",
          transition: "all 0.5s",
          overflow: "hidden"
        }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <div style={{ height: "6px", width: "40px", background: "rgba(14, 165, 233, 0.4)", borderRadius: "4px" }} />
            <div style={{ height: "12px", width: "12px", borderRadius: "50%", border: "2px solid #0ea5e9" }} />
          </div>
          <div style={{ height: "4px", width: "100%", background: "var(--border-strong)", borderRadius: "4px", opacity: 0.3 }} />
          <div style={{ height: "4px", width: "85%", background: "var(--border-strong)", borderRadius: "4px", opacity: 0.3 }} />
          {isActive && (
            <>
              <div style={{ height: "4px", width: "90%", background: "var(--border-strong)", borderRadius: "4px", opacity: 0.3 }} />
              <div style={{ height: "4px", width: "60%", background: "var(--border-strong)", borderRadius: "4px", opacity: 0.3 }} />
            </>
          )}
          
          <div style={{ 
            position: "absolute", 
            right: isActive ? "15%" : "10%", 
            bottom: isActive ? "15px" : "8px", 
            width: "28px", 
            height: "28px", 
            borderRadius: "50%", 
            background: "rgba(14, 165, 233, 0.15)", 
            border: "2px solid #0ea5e9", 
            display: "flex", 
            alignItems: "center", 
            justifyContent: "center", 
            boxShadow: "0 4px 10px rgba(14, 165, 233, 0.2)",
            transition: "all 0.5s"
          }}>
            <Search size={12} style={{ color: "#0ea5e9" }} />
          </div>
        </div>
      )
    },
    {
      id: "tailoring",
      num: "02",
      title: "Resume Tailoring",
      shortTitle: "Tailoring",
      icon: <Briefcase size={16} />,
      color: "#3b82f6",
      description: "Tailor your resume to any job description in seconds. Uprole aligns your experience with the role, rewrites content to match key requirements, and prioritizes the most relevant information.",
      renderGraphic: (isActive) => (
        <div style={{ 
          display: "flex", 
          flexDirection: "column", 
          gap: isActive ? "8px" : "4px", 
          width: "100%", 
          padding: "2px",
          transition: "all 0.5s"
        }}>
          {[
            { label: "Data Analyst", checked: true },
            { label: "Data Entry", checked: false, hideOnCollapsed: true },
            { label: "Researcher", checked: false }
          ].map((item, idx) => {
            if (!isActive && item.hideOnCollapsed) return null;
            return (
              <div key={idx} style={{ 
                display: "flex", 
                justifyContent: "space-between", 
                alignItems: "center", 
                padding: isActive ? "8px 12px" : "6px 8px", 
                background: item.checked ? "rgba(59, 130, 246, 0.08)" : "var(--bg-3)", 
                border: item.checked ? "1px solid rgba(59, 130, 246, 0.25)" : "1px solid var(--border)", 
                borderRadius: "8px",
                color: item.checked ? "#3b82f6" : "var(--text-muted)",
                fontSize: isActive ? "0.78rem" : "0.65rem",
                fontWeight: item.checked ? 600 : 500,
                transition: "all 0.3s"
              }}>
                <span style={{ overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{item.label}</span>
                <div style={{ 
                  width: "12px", 
                  height: "12px", 
                  borderRadius: "50%", 
                  background: item.checked ? "#3b82f6" : "transparent",
                  border: item.checked ? "none" : "1.5px solid var(--border-strong)",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  color: "#fff",
                  flexShrink: 0
                }}>
                  {item.checked && <Check size={8} strokeWidth={3} />}
                </div>
              </div>
            );
          })}
        </div>
      )
    },
    {
      id: "agent",
      num: "03",
      title: "Resume Agent",
      shortTitle: "AI Agent",
      icon: <MessageSquare size={16} />,
      color: "#10b981",
      description: "Unlock personalized coaching with our interactive AI chat assistant. Ask questions like 'How can I make my project bullet sound more senior?' and receive contextual, expert advice.",
      renderGraphic: (isActive) => (
        <div style={{ 
          position: "relative", 
          width: "100%", 
          height: isActive ? "140px" : "90px", 
          background: "var(--bg-3)", 
          borderRadius: "12px", 
          border: "1px solid var(--border)", 
          padding: isActive ? "10px" : "6px", 
          display: "flex", 
          flexDirection: "column", 
          gap: isActive ? "8px" : "4px",
          transition: "all 0.5s",
          overflow: "hidden"
        }}>
          <div style={{ 
            alignSelf: "flex-end", 
            background: "var(--accent)", 
            color: "#fff", 
            padding: isActive ? "6px 10px" : "4px 6px", 
            borderRadius: "10px 10px 2px 10px", 
            fontSize: isActive ? "0.72rem" : "0.6rem", 
            maxWidth: "85%", 
            lineHeight: 1.2 
          }}>
            Improve summary
          </div>
          <div style={{ display: "flex", gap: "4px", alignItems: "flex-start", maxWidth: "90%" }}>
            <div style={{ 
              width: "14px", 
              height: "14px", 
              borderRadius: "50%", 
              background: "rgba(16, 185, 129, 0.1)", 
              border: "1px solid #10b981", 
              display: "flex", 
              alignItems: "center", 
              justifyContent: "center", 
              flexShrink: 0 
            }}>
              <Sparkles size={8} style={{ color: "#10b981" }} />
            </div>
            <div style={{ 
              background: "rgba(16, 185, 129, 0.05)", 
              border: "1px solid rgba(16, 185, 129, 0.12)", 
              color: "var(--text-muted)", 
              padding: isActive ? "6px 10px" : "4px 6px", 
              borderRadius: "2px 10px 10px 10px", 
              fontSize: isActive ? "0.72rem" : "0.6rem", 
              lineHeight: 1.2 
            }}>
              Done!
            </div>
          </div>
        </div>
      )
    },
    {
      id: "templates",
      num: "04",
      title: "ATS Templates",
      shortTitle: "Templates",
      icon: <Layout size={16} />,
      color: "#8b5cf6",
      description: "Ditch generic templates that confuse scanners. Choose from elegant layouts optimized with parsing-grade hierarchy, single-column margins, and modern professional typography.",
      renderGraphic: (isActive) => (
        <div style={{ 
          display: "grid", 
          gridTemplateColumns: isActive ? "1fr 1fr" : "1fr", 
          gap: "6px", 
          width: "100%", 
          height: isActive ? "140px" : "90px",
          transition: "all 0.5s",
          overflow: "hidden"
        }}>
          {[1, 2].map((tpl) => {
            if (!isActive && tpl === 2) return null;
            return (
              <div key={tpl} style={{ 
                background: "var(--bg-3)", 
                border: "1px solid var(--border)", 
                borderRadius: "8px", 
                padding: "8px", 
                display: "flex", 
                flexDirection: "column", 
                gap: "4px",
                height: "100%"
              }}>
                <div style={{ height: "4px", width: "65%", background: "var(--text-muted)", opacity: 0.3, borderRadius: "2px" }} />
                <div style={{ height: "2px", width: "40%", background: "var(--text-muted)", opacity: 0.2, borderRadius: "1px" }} />
                <div style={{ display: "flex", gap: "3px", marginTop: "4px" }}>
                  <div style={{ width: "20px", height: isActive ? "60px" : "35px", background: "var(--border)", opacity: 0.2, borderRadius: "2px" }} />
                  <div style={{ flex: 1, display: "flex", flexDirection: "column", gap: "3px" }}>
                    <div style={{ height: "3px", width: "100%", background: "var(--border)", opacity: 0.2 }} />
                    <div style={{ height: "3px", width: "80%", background: "var(--border)", opacity: 0.2 }} />
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )
    },
    {
      id: "coverletter",
      num: "05",
      title: "Cover Letter",
      shortTitle: "Generator",
      icon: <FileText size={16} />,
      color: "#f59e0b",
      description: "Generate highly matching, contextual cover letters matching your resume style. Tailor the tone of voice and highlight the exact credentials sought in the target job role.",
      renderGraphic: (isActive) => (
        <div style={{ 
          display: "flex", 
          alignItems: "center", 
          justifyContent: "center", 
          gap: isActive ? "8px" : "4px", 
          width: "100%", 
          height: isActive ? "140px" : "90px",
          transition: "all 0.5s",
          overflow: "hidden"
        }}>
          <div style={{ width: isActive ? "45px" : "32px", height: isActive ? "60px" : "45px", background: "var(--bg-3)", border: "1px solid var(--border)", borderRadius: "4px", padding: "4px", display: "flex", flexDirection: "column", gap: "2px", opacity: 0.8, transition: "all 0.5s" }}>
            <div style={{ height: "3px", width: "70%", background: "#3b82f6", borderRadius: "1px" }} />
            <div style={{ height: "2px", width: "90%", background: "var(--border)" }} />
            <div style={{ height: "2px", width: "80%", background: "var(--border)" }} />
          </div>
          
          <div style={{ color: "#f59e0b", display: "flex", alignItems: "center", justifyContent: "center" }}>
            <ArrowRight size={isActive ? 14 : 10} />
          </div>

          <div style={{ width: isActive ? "45px" : "32px", height: isActive ? "60px" : "45px", background: "rgba(245, 158, 11, 0.04)", border: "1px solid rgba(245, 158, 11, 0.25)", borderRadius: "4px", padding: "4px", display: "flex", flexDirection: "column", gap: "2px", transition: "all 0.5s" }}>
            <div style={{ height: "3px", width: "75%", background: "#f59e0b", borderRadius: "1px" }} />
            <div style={{ height: "2px", width: "90%", background: "rgba(245, 158, 11, 0.15)" }} />
            <div style={{ height: "2px", width: "85%", background: "rgba(245, 158, 11, 0.15)" }} />
          </div>
        </div>
      )
    },
    {
      id: "tracker",
      num: "06",
      title: "Application Tracker",
      shortTitle: "Tracker",
      icon: <TrendingUp size={16} />,
      color: "#ec4899",
      description: "Organize your job search pipeline in one place. Log applications, track interview dates, monitor salary packages, and see your overall platform offer/rejection analytics.",
      renderGraphic: (isActive) => (
        <div style={{ 
          display: "flex", 
          flexDirection: "column", 
          gap: isActive ? "6px" : "4px", 
          width: "100%",
          overflow: "hidden"
        }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: isActive ? "6px 8px" : "4px 6px", background: "var(--bg-3)", border: "1px solid var(--border)", borderRadius: "6px", fontSize: "0.65rem" }}>
            <span style={{ fontWeight: 700, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>Google</span>
            <span style={{ background: "rgba(59, 130, 246, 0.12)", color: "#3b82f6", padding: "1px 4px", borderRadius: "3px", fontSize: "0.55rem", fontWeight: 700, flexShrink: 0 }}>
              Interview
            </span>
          </div>
          {isActive && (
            <button style={{ width: "100%", border: "none", background: "linear-gradient(135deg, #ec4899 0%, #8b5cf6 100%)", color: "#fff", padding: "6px", borderRadius: "6px", fontSize: "0.7rem", fontWeight: 700, cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", gap: "4px" }}>
              <span>Track Application</span>
              <ChevronRight size={10} />
            </button>
          )}
        </div>
      )
    }
  ];

  if (isMobile) {
    return (
      <div style={{ width: "100%", display: "flex", flexDirection: "column", gap: "0.8rem", padding: "0.5rem" }}>
        {steps.map((step, idx) => {
          const isActive = activeStep === idx;
          return (
            <div
              key={step.id}
              onClick={() => setActiveStep(idx)}
              style={{
                background: "var(--bg-surface)",
                border: isActive ? `2px solid ${step.color}` : "1px solid var(--border)",
                borderRadius: "16px",
                padding: "1.2rem",
                display: "flex",
                flexDirection: "column",
                gap: "1rem",
                cursor: "pointer",
                boxShadow: isActive ? `0 8px 24px ${step.color}10` : "none",
                transition: "all 0.3s"
              }}
            >
              {/* Header row */}
              <div style={{ display: "flex", justifySelf: "stretch", justifyContent: "space-between", alignItems: "center", width: "100%" }}>
                <div style={{ display: "flex", alignItems: "center", gap: "0.8rem" }}>
                  <div style={{ fontSize: "1.1rem", fontWeight: 800, color: isActive ? step.color : "var(--text-muted)", opacity: isActive ? 1 : 0.6 }}>
                    {step.num}
                  </div>
                  <div style={{ 
                    width: "28px", 
                    height: "28px", 
                    borderRadius: "8px", 
                    background: isActive ? `${step.color}15` : "var(--bg-3)", 
                    color: isActive ? step.color : "var(--text-muted)", 
                    display: "flex", 
                    alignItems: "center", 
                    justifyContent: "center"
                  }}>
                    {step.icon}
                  </div>
                  <h3 style={{ fontFamily: "Syne, sans-serif", fontSize: "0.95rem", fontWeight: 800, margin: 0, color: "var(--text-primary)" }}>
                    {step.title}
                  </h3>
                </div>
                <div style={{ color: "var(--text-muted)", opacity: 0.6 }}>
                  {isActive ? <ChevronDown size={18} /> : <ChevronRight size={18} />}
                </div>
              </div>

              {/* Collapsed content container */}
              {isActive && (
                <div style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
                  <p style={{ fontSize: "0.82rem", color: "var(--text-secondary)", lineHeight: 1.45, margin: 0 }}>
                    {step.description}
                  </p>
                  <div style={{ width: "100%", display: "flex", justifyContent: "center", padding: "0.5rem 0" }}>
                    <div style={{ width: "100%", maxWidth: "280px" }}>
                      {step.renderGraphic(true)}
                    </div>
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>
    );
  }

  // Desktop horizontal view
  return (
    <div style={{ width: "100%", margin: "0 auto" }}>
      <div 
        className="feature-stepper-row" 
        style={{ 
          display: "flex", 
          gap: "1.2rem", 
          minHeight: "450px",
          width: "100%",
          padding: "1rem 0",
          justifyContent: "center"
        }}
      >
        {steps.map((step, idx) => {
          const isActive = activeStep === idx;
          return (
            <div
              key={step.id}
              onClick={() => setActiveStep(idx)}
              className={`feature-step-card ${isActive ? "active" : ""}`}
              style={{
                flex: isActive ? "3.5 0 0%" : "1 0 0%",
                background: "var(--bg-surface)",
                border: isActive ? `2px solid ${step.color}` : "1px solid var(--border)",
                borderRadius: "24px",
                padding: isActive ? "2rem" : "1.5rem 1rem",
                display: "flex",
                flexDirection: "column",
                justifyContent: "space-between",
                alignItems: "center",
                cursor: "pointer",
                transition: "all 0.5s cubic-bezier(0.25, 1, 0.5, 1)",
                boxShadow: isActive ? `0 15px 35px ${step.color}15` : "var(--shadow-sm)",
                position: "relative",
                overflow: "hidden"
              }}
              onMouseEnter={() => {
                if (typeof window !== "undefined" && window.innerWidth > 768) {
                  setActiveStep(idx);
                }
              }}
            >
              {/* Highlight gradient line on top */}
              {isActive && (
                <div style={{ 
                  position: "absolute", 
                  top: 0, 
                  left: 0, 
                  right: 0, 
                  height: "4px", 
                  background: `linear-gradient(90deg, ${step.color} 0%, rgba(255,255,255,0) 100%)` 
                }} />
              )}

              {/* Number and Graphic Row */}
              <div style={{ 
                width: "100%", 
                display: "flex", 
                flexDirection: "column", 
                alignItems: "center", 
                gap: "1.2rem" 
              }}>
                {/* Number */}
                <div style={{ 
                  fontFamily: "Syne, sans-serif", 
                  fontSize: isActive ? "2.6rem" : "1.8rem", 
                  fontWeight: 800, 
                  color: isActive ? "var(--text-primary)" : "var(--text-muted)", 
                  opacity: isActive ? 0.95 : 0.4,
                  lineHeight: 1,
                  transition: "all 0.3s"
                }}>
                  {step.num}
                </div>

                {/* Graphic Preview */}
                <div style={{ 
                  width: "100%", 
                  opacity: isActive ? 1 : 0.7, 
                  transition: "all 0.5s",
                  display: "flex",
                  justifyContent: "center",
                  alignItems: "center",
                  minHeight: "100px"
                }}>
                  {step.renderGraphic(isActive)}
                </div>
              </div>

              {/* Title & Description Column */}
              <div style={{ 
                width: "100%", 
                marginTop: "1.2rem",
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                textAlign: "center"
              }}>
                {/* Icon wrapper */}
                <div style={{ 
                  width: "34px", 
                  height: "34px", 
                  borderRadius: "10px", 
                  background: isActive ? `${step.color}15` : "var(--bg-3)", 
                  color: isActive ? step.color : "var(--text-muted)", 
                  display: "flex", 
                  alignItems: "center", 
                  justifyContent: "center",
                  marginBottom: "0.6rem",
                  transition: "all 0.3s",
                  flexShrink: 0
                }}>
                  {step.icon}
                </div>

                {/* Title */}
                <h3 style={{ 
                  fontFamily: "Syne, sans-serif", 
                  fontSize: isActive ? "1.2rem" : "0.76rem", 
                  fontWeight: 800, 
                  margin: 0,
                  color: "var(--text-primary)",
                  whiteSpace: "normal",
                  lineHeight: 1.3,
                  wordBreak: "break-word",
                  maxHeight: isActive ? "none" : "2.6em",
                  overflow: "hidden"
                }}>
                  {isActive ? step.title : step.shortTitle}
                </h3>

                {/* Description - only visible if active */}
                {isActive && (
                  <p 
                    style={{ 
                      fontSize: "0.8rem", 
                      color: "var(--text-secondary)", 
                      lineHeight: 1.45, 
                      margin: "0.6rem 0 0 0" 
                    }}
                  >
                    {step.description}
                  </p>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
