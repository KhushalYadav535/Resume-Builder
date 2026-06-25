"use client";
import { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useAuth } from "@/hooks/useAuth";
import NotificationBell from "@/components/NotificationBell";
import PillNav from "./PillNav/PillNav";

export default function Navbar() {
  const pathname = usePathname();
  const { role, user, logout } = useAuth();
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  let links = [];

  if (role === "admin") {
    links = [
      { href: "/admin", label: "Admin Panel" },
      { href: "/analytics", label: "Analytics" },
    ];
  } else {
    links = [
      { href: "/dashboard", label: "Dashboard" },
      { href: "/resume/builder", label: "Build Resume" },
      { href: "/resume/upload", label: "Upload" },
      { href: "/resume/templates", label: "Templates" },
      { href: "/job-tracker", label: "Job Tracker" },
    ];
  }

  return (
    <div
      style={{
        position: "fixed",
        top: 0,
        left: 0,
        zIndex: 1000,
        width: "100%",
        display: "flex",
        justifyContent: "center",
        pointerEvents: "none",
        transition: "all 0.3s ease",
        opacity: scrolled ? 0.6 : 1,
        filter: scrolled ? "blur(2px)" : "none",
      }}
    >
      <div 
        style={{ 
          pointerEvents: "auto", 
          display: "flex", 
          width: "100%", 
          maxWidth: "1200px", 
          padding: "0 1.5rem", 
          justifyContent: "space-between", 
          alignItems: "center", 
          marginTop: scrolled ? "0.5rem" : "1rem",
          transition: "margin-top 0.3s ease"
        }}
      >
        
        <PillNav
          items={links}
          activeHref={pathname}
          baseColor="#000000"
          pillColor="#1a1a24"
          hoveredPillTextColor="#ffffff"
          pillTextColor="#d1d1d1"
          className="resume-pill-nav"
        />

        {user && (
          <div style={{ 
            display: "flex", 
            alignItems: "center", 
            gap: "0.8rem", 
            background: "rgba(19, 19, 30, 0.8)",
            backdropFilter: "blur(12px)",
            border: "1px solid var(--border)",
            padding: "0 1.5rem",
            height: "42px",
            borderRadius: "9999px",
            boxShadow: "0 4px 12px rgba(0,0,0,0.1)",
            zIndex: 100
          }}>
            <NotificationBell />
            <button 
              onClick={logout}
              style={{
                background: "transparent",
                border: "none",
                color: "#d1d1d1",
                fontSize: "14px",
                fontWeight: 600,
                cursor: "pointer",
                padding: "0.4rem 0.6rem",
                borderRadius: "8px",
                transition: "all 0.2s",
                textTransform: "uppercase",
                letterSpacing: "0.2px"
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.color = "#ff6584";
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.color = "#d1d1d1";
              }}
            >
              Logout
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
