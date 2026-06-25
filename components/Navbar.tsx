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
    <nav
      style={{
        position: "sticky",
        top: 0,
        zIndex: 1000,
        width: "100%",
        background: "rgba(10, 10, 15, 0.85)",
        backdropFilter: "blur(12px)",
        borderBottom: "1px solid var(--border)",
        transition: "all 0.3s ease",
      }}
    >
      <div 
        style={{ 
          display: "flex", 
          width: "100%", 
          maxWidth: "1200px", 
          margin: "0 auto",
          padding: "0.75rem 1.5rem", 
          justifyContent: "space-between", 
          alignItems: "center"
        }}
      >
        
        <PillNav
          items={links}
          activeHref={pathname}
          className="resume-pill-nav"
        />

        {user && (
          <div style={{ 
            display: "flex", 
            alignItems: "center", 
            gap: "0.8rem", 
            padding: "0 0.5rem",
            height: "42px",
            zIndex: 100
          }}>
            <NotificationBell />
            <button 
              onClick={logout}
              style={{
                background: "transparent",
                border: "1px solid var(--border-light)",
                color: "#d1d1d1",
                fontSize: "13px",
                fontWeight: 600,
                cursor: "pointer",
                padding: "0.4rem 0.8rem",
                borderRadius: "8px",
                transition: "all 0.2s",
                textTransform: "uppercase",
                letterSpacing: "0.5px"
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.color = "#ff6584";
                e.currentTarget.style.borderColor = "#ff6584";
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.color = "#d1d1d1";
                e.currentTarget.style.borderColor = "var(--border-light)";
              }}
            >
              Logout
            </button>
          </div>
        )}
      </div>
    </nav>
  );
}
