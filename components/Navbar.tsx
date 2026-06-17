"use client";
import { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useAuth } from "@/hooks/useAuth";
import NotificationBell from "@/components/NotificationBell";

export default function Navbar() {
  const pathname = usePathname();
  const { role, user } = useAuth();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const links = [
    { href: "/dashboard", label: "Dashboard" },
    { href: "/resume/builder", label: "Build Resume" },
    { href: "/resume/upload", label: "Upload" },
    { href: "/resume/templates", label: "Templates" },
    { href: "/job-tracker", label: "Job Tracker" },
  ];

  if (role === "admin") {
    links.push({ href: "/admin", label: "🛡️ Admin Panel" });
  }

  // Close mobile menu when page changes
  useEffect(() => {
    setIsMobileMenuOpen(false);
  }, [pathname]);

  return (
    <nav
      style={{
        background: "rgba(10,10,15,0.92)",
        backdropFilter: "blur(12px)",
        borderBottom: "1px solid var(--border)",
        position: "sticky",
        top: 0,
        zIndex: 1000,
      }}
    >
      {/* Media Query Injector */}
      <style dangerouslySetInnerHTML={{ __html: `
        .desktop-nav {
          display: flex !important;
          align-items: center;
          gap: 0.5rem;
        }
        .desktop-nav a:hover {
          color: var(--accent) !important;
          background: rgba(108, 99, 255, 0.05);
        }
        .mobile-toggle-btn {
          display: none !important;
        }
        .mobile-nav-drawer {
          display: none;
        }
        .mobile-nav-drawer a:hover {
          background: rgba(108, 99, 255, 0.05) !important;
          color: var(--accent) !important;
        }
        @media (max-width: 768px) {
          .desktop-nav {
            display: none !important;
          }
          .mobile-toggle-btn {
            display: flex !important;
          }
          .mobile-nav-drawer {
            display: ${isMobileMenuOpen ? "flex" : "none"};
            flex-direction: column;
            background: rgba(12, 12, 18, 0.98);
            border-bottom: 1px solid var(--border);
            padding: 1rem 1.5rem;
            gap: 0.8rem;
            position: absolute;
            top: 60px;
            left: 0;
            width: 100%;
            z-index: 999;
            box-shadow: 0 10px 20px rgba(0,0,0,0.5);
            animation: fadeInDown 0.2s ease;
          }
        }
      `}} />

      <div
        style={{
          maxWidth: "1200px",
          margin: "0 auto",
          padding: "0 1.5rem",
          height: "60px",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
        }}
      >
        {/* Logo */}
        <Link href="/" style={{ textDecoration: "none" }}>
          <span
            style={{
              fontFamily: "Syne, sans-serif",
              fontWeight: 800,
              fontSize: "1.2rem",
              background: "linear-gradient(135deg, #6c63ff, #ff6584)",
              WebkitBackgroundClip: "text",
              WebkitTextFillColor: "transparent",
            }}
          >
            ResumeAI
          </span>
        </Link>

        {/* Desktop Navigation Links */}
        <div className="desktop-nav">
          {links.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              style={{
                textDecoration: "none",
                padding: "0.4rem 0.9rem",
                borderRadius: "8px",
                fontSize: "0.88rem",
                fontWeight: 500,
                color: pathname === link.href ? "var(--accent)" : "var(--text-muted)",
                background: pathname === link.href ? "rgba(108,99,255,0.1)" : "transparent",
                transition: "all 0.2s",
              }}
            >
              {link.label}
            </Link>
          ))}
          {user && (
            <div style={{ marginLeft: "0.5rem", borderLeft: "1px solid var(--border)", paddingLeft: "0.8rem", display: "flex", alignItems: "center" }}>
              <NotificationBell />
            </div>
          )}
        </div>

        {/* Mobile controls (Notification bell + Hamburger toggle) */}
        <div style={{ display: "none", alignItems: "center", gap: "0.5rem" }} className="mobile-toggle-btn">
          {user && <NotificationBell />}
          <button
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            style={{
              background: "none",
              border: "none",
              cursor: "pointer",
              display: "flex",
              flexDirection: "column",
              gap: "5px",
              padding: "0.5rem",
              justifyContent: "center",
            }}
            aria-label="Toggle Navigation Menu"
          >
            <span style={{ width: "22px", height: "2px", background: "var(--text)", transition: "0.3s", transform: isMobileMenuOpen ? "rotate(45deg) translate(5px, 5px)" : "none" }} />
            <span style={{ width: "22px", height: "2px", background: "var(--text)", transition: "0.3s", opacity: isMobileMenuOpen ? 0 : 1 }} />
            <span style={{ width: "22px", height: "2px", background: "var(--text)", transition: "0.3s", transform: isMobileMenuOpen ? "rotate(-45deg) translate(5px, -5px)" : "none" }} />
          </button>
        </div>
      </div>

      {/* Mobile Drawer Dropdown */}
      <div className="mobile-nav-drawer">
        {links.map((link) => (
          <Link
            key={link.href}
            href={link.href}
            style={{
              textDecoration: "none",
              padding: "0.6rem 1rem",
              borderRadius: "8px",
              fontSize: "0.95rem",
              fontWeight: 500,
              color: pathname === link.href ? "var(--accent)" : "var(--text)",
              background: pathname === link.href ? "rgba(108,99,255,0.08)" : "transparent",
              transition: "all 0.2s",
            }}
          >
            {link.label}
          </Link>
        ))}
      </div>
    </nav>
  );
}
