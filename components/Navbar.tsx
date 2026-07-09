"use client";
import { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useAuth } from "@/hooks/useAuth";
import NotificationBell from "@/components/NotificationBell";
import { ThemeToggle } from "@/components/ThemeToggle";
import { Menu, X, Box } from "lucide-react";
import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export default function Navbar() {
  const pathname = usePathname();
  const { role, user, logout } = useAuth();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  // Scroll listener for fade behavior
  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 40) {
        setScrolled(true);
      } else {
        setScrolled(false);
      }
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // Close mobile menu on route change
  useEffect(() => {
    setMobileMenuOpen(false);
  }, [pathname]);

  // Lock body scroll when mobile menu is open
  useEffect(() => {
    if (mobileMenuOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
  }, [mobileMenuOpen]);

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
      { href: "/resume/tailor", label: "Tailor Resume" },
      { href: "/resume/upload", label: "Upload" },
      { href: "/resume/templates", label: "Templates" },
    ];
  }

  const userInitials = user?.email ? user.email.substring(0, 2).toUpperCase() : "U";

  return (
    <>
      <nav
        className={cn(
          "sticky top-0 z-[100] flex items-center justify-between border-b border-[var(--border)] transition-all duration-300 ease-out",
          scrolled ? "bg-[var(--bg-glass-nav)] backdrop-blur-xl shadow-sm" : "bg-transparent"
        )}
        style={{
          height: "60px",
          padding: "0 clamp(16px, 4vw, 32px)",
        }}
      >
        <div className="flex items-center gap-6">
          {/* Mobile Menu Button */}
          <button
            className="md:hidden text-[var(--text-primary)] p-1 -ml-2"
            onClick={() => setMobileMenuOpen(true)}
            aria-label="Open menu"
          >
            <Menu size={24} />
          </button>

          {/* Logo */}
          <Link href={user ? "/dashboard" : "/"} className="flex items-center gap-2 no-underline">
            <Box size={24} className="text-[var(--accent)]" />
            <span
              className="text-[18px] font-[800] tracking-tight text-[var(--text-primary)]"
              style={{ fontFamily: "var(--font-inter)" }}
            >
              UP<span className="gradient-text">ROLE</span>
            </span>
          </Link>
        </div>

        {/* Desktop Links */}
        {user && (
          <div className="hidden md:flex items-center gap-2">
            {links.map((link) => {
              const isActive = pathname === link.href || pathname.startsWith(link.href + "/");
              return (
                <Link
                  key={link.href}
                  href={link.href}
                  className={cn(
                    "relative px-3 py-1.5 text-[14px] font-[500] rounded-[var(--radius-md)] transition-all duration-[var(--dur-fast)] no-underline group",
                    isActive
                      ? "text-[var(--accent)] bg-[var(--accent-soft)]"
                      : "text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--accent-soft)]"
                  )}
                >
                  {link.label}
                  {/* Hover Underline effect */}
                  <span
                    className="absolute bottom-0 left-1/2 -translate-x-1/2 h-[2px] bg-[var(--accent-grad)] transition-all duration-[var(--dur-fast)] ease-[var(--ease-out)] rounded-t-full"
                    style={{
                      width: isActive ? "0%" : "0%",
                    }}
                  />
                  <style jsx>{`
                    a:hover span {
                      width: 80% !important;
                    }
                  `}</style>
                </Link>
              );
            })}
          </div>
        )}

        {/* Right Side */}
        <div className="flex items-center gap-3">
          <ThemeToggle />
          {user && (
            <>
              <NotificationBell />
              <div className="relative group cursor-pointer">
                <div
                  className="flex items-center justify-center w-[34px] h-[34px] rounded-full text-white font-bold text-[13px] transition-all duration-300"
                  style={{
                    background: "var(--accent-grad)",
                  }}
                >
                  {userInitials}
                </div>
                <style jsx>{`
                  div:hover {
                    transform: scale(1.08);
                    box-shadow: var(--accent-glow);
                  }
                `}</style>
                {/* Dropdown for logout */}
                <div className="absolute right-0 mt-2 w-48 bg-[var(--bg-surface)] border border-[var(--border)] rounded-[var(--radius-md)] shadow-[var(--shadow-lg)] py-2 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200">
                  <div className="px-4 py-2 text-xs text-[var(--text-muted)] border-b border-[var(--border)] mb-1 truncate">
                    {user.email}
                  </div>
                  <button
                    onClick={logout}
                    className="w-full text-left px-4 py-2 text-sm text-[var(--danger)] hover:bg-[var(--bg-elevated)] transition-colors"
                  >
                    Logout
                  </button>
                </div>
              </div>
            </>
          )}
          {!user && (
            <Link
              href="/login"
              className="text-[14px] font-semibold text-[var(--accent)] hover:text-[var(--accent-2)] transition-colors hidden md:block"
            >
              Sign In
            </Link>
          )}
        </div>
      </nav>

      {/* Mobile Drawer Overlay */}
      {mobileMenuOpen && (
        <div
          className="fixed inset-0 z-[1001] bg-black/40 backdrop-blur-sm md:hidden transition-opacity"
          onClick={() => setMobileMenuOpen(false)}
        />
      )}

      {/* Mobile Drawer */}
      <div
        className="fixed top-0 left-0 bottom-0 z-[1002] w-[280px] bg-[var(--bg-glass)] backdrop-blur-2xl border-r border-[var(--border)] shadow-[var(--shadow-xl)] transform transition-transform duration-[var(--dur-base)] ease-[var(--ease-spring)] md:hidden flex flex-col"
        style={{
          transform: mobileMenuOpen ? "translateX(0)" : "translateX(-100%)",
        }}
      >
        <div className="flex items-center justify-between p-6 border-b border-[var(--border)]">
          <span
            className="text-[18px] font-[800] tracking-tight text-[var(--text-primary)]"
            style={{ fontFamily: "var(--font-inter)" }}
          >
            UP<span className="gradient-text">ROLE</span>
          </span>
          <button
            onClick={() => setMobileMenuOpen(false)}
            className="text-[var(--text-muted)] hover:text-[var(--text-primary)] p-1"
          >
            <X size={24} />
          </button>
        </div>
        <div className="flex flex-col p-4 gap-2 flex-1 overflow-y-auto">
          {user ? (
            links.map((link) => {
              const isActive = pathname === link.href || pathname.startsWith(link.href + "/");
              return (
                <Link
                  key={link.href}
                  href={link.href}
                  className={cn(
                    "flex items-center h-[48px] px-4 rounded-[var(--radius-md)] text-[15px] font-medium transition-colors no-underline",
                    isActive
                      ? "text-[var(--accent)] bg-[var(--accent-soft)]"
                      : "text-[var(--text-secondary)] hover:bg-[var(--bg-elevated)] hover:text-[var(--text-primary)]"
                  )}
                  onClick={() => setMobileMenuOpen(false)}
                >
                  {link.label}
                </Link>
              );
            })
          ) : (
            <>
              <Link
                href="/login"
                className="flex items-center h-[48px] px-4 rounded-[var(--radius-md)] text-[15px] font-medium text-[var(--text-secondary)] hover:bg-[var(--bg-elevated)] transition-colors"
                onClick={() => setMobileMenuOpen(false)}
              >
                Sign In
              </Link>
              <Link
                href="/signup"
                className="flex items-center h-[48px] px-4 rounded-[var(--radius-md)] text-[15px] font-medium text-[var(--accent)] bg-[var(--accent-soft)] mt-2"
                onClick={() => setMobileMenuOpen(false)}
              >
                Create Account
              </Link>
            </>
          )}
        </div>
        {user && (
          <div className="p-6 border-t border-[var(--border)]">
            <button
              onClick={() => {
                logout();
                setMobileMenuOpen(false);
              }}
              className="w-full flex items-center justify-center h-[48px] rounded-[var(--radius-md)] bg-red-500/10 text-[var(--danger)] font-semibold hover:bg-red-500/20 transition-colors"
            >
              Logout
            </button>
          </div>
        )}
      </div>
    </>
  );
}
