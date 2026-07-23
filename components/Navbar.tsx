"use client";
import { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { useAuth } from "@/hooks/useAuth";
import NotificationBell from "@/components/NotificationBell";
import { ThemeToggle } from "@/components/ThemeToggle";
import {
  Menu,
  X,
  Coins,
  Sparkles,
  LogOut,
  ArrowRight,
  User,
  LayoutDashboard,
  Users,
  Zap,
  Key,
  CreditCard,
  Megaphone,
  Settings,
} from "lucide-react";
import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";
import { createClient } from "@/utils/supabase/client";

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export default function Navbar() {
  const pathname = usePathname();
  const { role, user, logout } = useAuth();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [profile, setProfile] = useState<{ tier: string; credit_balance: number }>({ tier: "Loading...", credit_balance: 0 });

  useEffect(() => {
    if (user && user.id) {
      const fetchProfile = async () => {
        try {
          const supabase = createClient();
          const { data } = await supabase.from("profiles").select("tier, credit_balance").eq("id", user.id).single();
          if (data) {
            setProfile(data);
          } else {
            setProfile({ tier: "Free", credit_balance: 0 });
          }
        } catch (err) {
          console.error("Profile fetch error:", err);
          setProfile({ tier: "Free", credit_balance: 0 });
        }
      };
      fetchProfile();
    } else {
      setProfile({ tier: "Free", credit_balance: 0 });
    }
  }, [user]);

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

  useEffect(() => {
    setMobileMenuOpen(false);
  }, [pathname]);

  useEffect(() => {
    if (mobileMenuOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
  }, [mobileMenuOpen]);

  let links: { href: string; label: string; icon?: any }[] = [];
  if (role === "admin" || pathname.startsWith("/admin")) {
    links = [
      { href: "/admin", label: "Dashboard", icon: LayoutDashboard },
      { href: "/admin/users", label: "User Management", icon: Users },
      { href: "/admin/ai-usage", label: "AI Usage Log", icon: Zap },
      { href: "/admin/keywords", label: "ATS Keywords", icon: Key },
      { href: "/admin/billing", label: "Billing & Credits", icon: CreditCard },
      { href: "/admin/broadcast", label: "Broadcasts", icon: Megaphone },
      { href: "/admin/settings", label: "Settings", icon: Settings },
    ];
  } else {
    links = [
      { href: "/dashboard", label: "Dashboard" },
      { href: "/resume/builder?new=true", label: "Discovery" },
      { href: "/resume/tailor", label: "Match" },
      { href: "/career-copilot", label: "Copilot" },
      { href: "/career-journal", label: "Journal" },
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
          scrolled ? "bg-[var(--bg-glass-nav)] backdrop-blur-xl shadow-sm" : "bg-[var(--bg-glass-nav)] backdrop-blur-md"
        )}
        style={{
          height: "60px",
          padding: "0 clamp(16px, 4vw, 32px)",
        }}
      >
        <div className="flex items-center gap-6 shrink-0">
          {/* Mobile Menu Button */}
          <button
            className="md:hidden text-[var(--text-primary)] p-1 -ml-2"
            onClick={() => setMobileMenuOpen(true)}
            aria-label="Open menu"
          >
            <Menu size={24} />
          </button>

          {/* Logo */}
          <Link href={user ? (role === "admin" ? "/admin" : "/dashboard") : "/"} className="flex items-center no-underline">
            <div className="bg-transparent dark:bg-white/95 dark:py-1 dark:px-2.5 dark:rounded-[8px] flex items-center">
              <Image src="/UpRole logo.png" alt="UPROLE" width={120} height={32} style={{ objectFit: 'contain', height: 'auto' }} />
            </div>
          </Link>
        </div>

        {/* Desktop Links (Centered, Scrollbar Hidden) */}
        {user && (
          <div
            className="hidden md:flex flex-1 items-center justify-center gap-1.5 px-3 py-1 overflow-x-auto [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden"
            style={{ scrollbarWidth: "none", msOverflowStyle: "none" }}
          >
            {links.map((link) => {
              const Icon = link.icon;
              const isActive =
                link.href === "/admin"
                  ? pathname === "/admin"
                  : pathname === link.href || pathname.startsWith(link.href + "/");
              return (
                <Link
                  key={link.href}
                  href={link.href}
                  className={cn(
                    "relative px-3.5 py-1.5 text-[13.5px] font-semibold rounded-full transition-all duration-300 ease-out no-underline flex items-center gap-1.5 whitespace-nowrap shrink-0 group hover:scale-[1.03] active:scale-[0.98] hover:-translate-y-[1px]",
                    isActive
                      ? "bg-gradient-to-r from-indigo-600 to-purple-600 text-white font-bold shadow-md shadow-indigo-500/25 border-transparent px-4"
                      : "text-slate-600 dark:text-slate-300 bg-slate-100/70 dark:bg-white/[0.04] border border-slate-200/80 dark:border-white/10 hover:text-indigo-600 dark:hover:text-white hover:bg-slate-200/80 dark:hover:bg-white/10 hover:shadow-xs"
                  )}
                >
                  {Icon && <Icon size={14} className="shrink-0 transition-transform duration-300 group-hover:scale-110" />}
                  <span>{link.label}</span>
                  {/* Hover Underline animation indicator */}
                  <span
                    className={cn(
                      "absolute bottom-0.5 left-1/2 -translate-x-1/2 h-[2px] rounded-full transition-all duration-300 ease-out pointer-events-none",
                      isActive
                        ? "w-[40%] bg-white/60"
                        : "w-0 bg-indigo-500 dark:bg-indigo-400 group-hover:w-[60%]"
                    )}
                  />
                </Link>
              );
            })}
          </div>
        )}

        {/* Right Side */}
        <div className="flex items-center gap-3 shrink-0">
          <ThemeToggle />
          {user && (
            <>
              <NotificationBell />
              <div className="relative group cursor-pointer">
                <div
                  className="flex items-center justify-center w-[34px] h-[34px] rounded-full text-white font-bold text-[13px] transition-all duration-300 hover:scale-[1.08] hover:shadow-[var(--accent-glow)]"
                  style={{
                    background: "var(--accent-grad)",
                  }}
                >
                  {userInitials}
                </div>
                <div className="absolute right-0 mt-3 w-64 bg-white dark:bg-[#12121a] border border-gray-200 dark:border-white/10 rounded-2xl shadow-xl py-2 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-300 transform origin-top-right scale-95 group-hover:scale-100 z-50">
                  
                  {/* Header */}
                  <div className="px-4 py-3 border-b border-[var(--border)]">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full flex items-center justify-center bg-[var(--accent-soft)] text-[var(--accent)]">
                        <User size={20} />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-semibold text-[var(--text-primary)] truncate">
                          {user.email?.split("@")[0]}
                        </p>
                        <p className="text-xs text-[var(--text-muted)] truncate">
                          {user.email}
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Stats */}
                  <div className="px-4 py-3">
                    <div className="flex flex-col gap-3">
                      <div className="flex items-center justify-between">
                        <span className="text-[13px] font-medium text-gray-500 dark:text-gray-400">Current Plan</span>
                        <span className="text-[11px] font-bold text-white bg-gradient-to-r from-indigo-500 to-purple-500 px-2 py-0.5 rounded-md uppercase flex items-center gap-1">
                          <Sparkles size={10} />
                          {profile.tier}
                        </span>
                      </div>
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-1.5">
                          <span className="text-[13px] font-medium text-gray-500 dark:text-gray-400">Balance</span>
                          <Link href="/dashboard/credits" className="text-[11px] text-indigo-400 hover:text-indigo-300 transition-colors">View history</Link>
                        </div>
                        <div className="flex items-center gap-1.5">
                          {profile.credit_balance < 50 && profile.tier === 'free' && (
                            <Link href="/pricing" className="text-[10px] font-bold text-indigo-400 hover:text-indigo-300 bg-indigo-500/10 px-1.5 py-0.5 rounded transition-colors">Top Up</Link>
                          )}
                          <span
                            className={`text-[12px] font-bold flex items-center gap-1 px-2 py-0.5 rounded-md ${
                              profile.credit_balance < 20
                                ? 'text-red-500 bg-red-500/10'
                                : profile.credit_balance < 50
                                ? 'text-amber-500 bg-amber-500/10'
                                : 'text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-500/10'
                            }`}
                          >
                            <Coins size={12} />
                            {profile.credit_balance}
                          </span>
                        </div>
                      </div>
                    </div>

                    {profile.tier === 'free' ? (
                      <Link href="/pricing" className="mt-4 flex items-center justify-center gap-1.5 w-full text-[13px] font-bold text-white bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-600 hover:to-purple-700 rounded-lg py-2.5 transition-all shadow-sm hover:shadow-md">
                        Upgrade <ArrowRight size={14} />
                      </Link>
                    ) : (
                      <Link href="/dashboard/credits" className="mt-4 flex items-center justify-center gap-1.5 w-full text-[13px] font-semibold text-indigo-400 border border-indigo-500/20 hover:bg-indigo-500/10 rounded-lg py-2.5 transition-all">
                        <Coins size={13} /> View Credits & History
                      </Link>
                    )}
                  </div>

                  <div className="px-2 pb-1 border-t border-gray-100 dark:border-white/5 pt-1 mt-1">
                    <button
                      onClick={logout}
                      className="w-full flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium text-red-500 hover:bg-red-50 dark:hover:bg-red-500/10 transition-colors"
                    >
                      <LogOut size={16} />
                      Log out
                    </button>
                  </div>
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
          <div className="bg-transparent dark:bg-white/95 dark:py-1 dark:px-2 dark:rounded-[6px] flex items-center">
            <Image src="/UpRole logo.png" alt="UPROLE" width={110} height={28} style={{ objectFit: 'contain', height: 'auto' }} />
          </div>
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
              const Icon = link.icon;
              const isActive =
                link.href === "/admin"
                  ? pathname === "/admin"
                  : pathname === link.href || pathname.startsWith(link.href + "/");
              return (
                <Link
                  key={link.href}
                  href={link.href}
                  className={cn(
                    "flex items-center gap-2.5 h-[48px] px-4 rounded-[var(--radius-md)] text-[15px] font-medium transition-colors no-underline",
                    isActive
                      ? "text-[var(--accent)] bg-[var(--accent-soft)] font-bold"
                      : "text-[var(--text-secondary)] hover:bg-[var(--bg-elevated)] hover:text-[var(--text-primary)]"
                  )}
                  onClick={() => setMobileMenuOpen(false)}
                >
                  {Icon && <Icon size={18} className="shrink-0" />}
                  <span>{link.label}</span>
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
