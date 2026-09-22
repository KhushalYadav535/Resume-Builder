"use client";

import { useState, useEffect, useRef } from "react";
import Link from "next/link";
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
  Activity,
  TrendingUp,
  BookOpen,
  Compass,
  ChevronDown,
  ChevronRight,
  Map,
  FileText,
  Award,
  Briefcase,
  Target,
  Rocket,
  CheckCircle2,
  Handshake,
  MessageSquare,
  Crosshair,
  BarChart3,
  Clock,
  Search,
  Brain,
} from "lucide-react";
import UpRoleLogo from "@/components/UpRoleLogo";
import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";
import { createClient } from "@/utils/supabase/client";

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

interface SubMenuItem {
  label: string;
  desc?: string;
  href: string;
  badge?: string;
  icon?: any;
}

interface SubSection {
  heading: string;
  items: SubMenuItem[];
}

interface NavItem {
  href: string;
  label: string;
  icon: any;
  activeMatch: (pathname: string) => boolean;
  subSections?: SubSection[];
}

export default function Navbar() {
  const pathname = usePathname();
  const { role, user, logout } = useAuth();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [profile, setProfile] = useState<{ tier: string; credit_balance: number }>({
    tier: "Loading...",
    credit_balance: 0,
  });

  // Desktop hover dropdown state
  const [hoveredMenu, setHoveredMenu] = useState<string | null>(null);
  const hoverTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Mobile drawer accordion state
  const [expandedMobileMenu, setExpandedMobileMenu] = useState<string | null>(null);

  useEffect(() => {
    if (user && user.id) {
      const fetchProfile = async () => {
        try {
          const supabase = createClient();
          const { data } = await supabase
            .from("profiles")
            .select("tier, credit_balance")
            .eq("id", user.id)
            .single();
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
    setHoveredMenu(null);
  }, [pathname]);

  useEffect(() => {
    if (mobileMenuOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
  }, [mobileMenuOpen]);

  const handleMouseEnter = (label: string) => {
    if (hoverTimeoutRef.current) clearTimeout(hoverTimeoutRef.current);
    setHoveredMenu(label);
  };

  const handleMouseLeave = () => {
    hoverTimeoutRef.current = setTimeout(() => {
      setHoveredMenu(null);
    }, 160);
  };

  // Admin Navigation Links
  const adminLinks = [
    { href: "/admin", label: "Dashboard", icon: LayoutDashboard },
    { href: "/admin/users", label: "Users", icon: Users },
    { href: "/admin/ai-usage", label: "AI Usage", icon: Zap },
    { href: "/admin/keywords", label: "Keywords", icon: Key },
    { href: "/admin/billing", label: "Billing", icon: CreditCard },
    { href: "/admin/broadcast", label: "Broadcasts", icon: Megaphone },
    { href: "/admin/settings", label: "Settings", icon: Settings },
  ];

  // 5 Top Level Pillars (Pulse, Value, Momentum, Journal, Navigator)
  const pillars: NavItem[] = [
    {
      label: "Pulse",
      href: "/dashboard",
      icon: Activity,
      activeMatch: (p) => p === "/dashboard" || p.startsWith("/dashboard/"),
    },
    {
      label: "Value",
      href: "/value",
      icon: Sparkles,
      activeMatch: (p) =>
        p.startsWith("/value") ||
        p.startsWith("/career-discovery") ||
        p.startsWith("/resume"),
      subSections: [
        {
          heading: "Discovery Modes (Level 2)",
          items: [
            {
              label: "Career Value Profile",
              desc: "Multidimensional capabilities, impact patterns & progression",
              href: "/value/profile",
              badge: "Derived",
              icon: Brain,
            },
            {
              label: "Value Overview Workspace",
              desc: "Consolidated view of your career facts and categories",
              href: "/value",
              badge: "Overview",
              icon: FileText,
            },
            {
              label: "Interactive Discovery (CDE)",
              desc: "Google Maps-like card-based information gathering",
              href: "/career-discovery",
              badge: "Cards",
              icon: Map,
            },
            {
              label: "Resume & Profile Studio",
              desc: "Edit and curate your core resume information",
              href: "/resume/builder?new=true",
              badge: "Editor",
              icon: FileText,
            },
          ],
        },
        {
          heading: "Value Dimensions",
          items: [
            {
              label: "Employment History",
              desc: "Companies, roles, tenures & responsibilities",
              href: "/value/employment",
              icon: Briefcase,
            },
            {
              label: "Projects",
              desc: "Engineering deliverables, architecture & ownership",
              href: "/value/projects",
              icon: FileText,
            },
            {
              label: "Achievements",
              desc: "Quantified accomplishments & business metrics",
              href: "/value/achievements",
              icon: Award,
            },
            {
              label: "Skills & Capabilities",
              desc: "Technical stack, tools & leadership skills",
              href: "/value/skills",
              icon: Sparkles,
            },
            {
              label: "Education & Certifications",
              desc: "Academic qualifications & credentials",
              href: "/value/education",
              icon: Award,
            },
            {
              label: "Career Events",
              desc: "Milestones, promotions & transitions",
              href: "/career-journal#events",
              icon: BookOpen,
            },
          ],
        },
      ],
    },
    {
      label: "Momentum",
      href: "/momentum",
      icon: TrendingUp,
      activeMatch: (p) => p.startsWith("/momentum"),
      subSections: [
        {
          heading: "Foundation (Level 1)",
          items: [
            {
              label: "Career Priorities",
              desc: "What matters most to you right now",
              href: "/momentum#priorities",
              icon: Target,
            },
            {
              label: "Target Career Goals",
              desc: "Specific desired outcome & timeline",
              href: "/momentum#priorities",
              icon: Award,
            },
          ],
        },
        {
          heading: "Execution Engine (Level 2)",
          items: [
            {
              label: "Readiness & Gaps",
              desc: "Audit current state against target benchmarks",
              href: "/momentum#readiness",
              icon: CheckCircle2,
            },
            {
              label: "Strategy, Actions & Outcomes",
              desc: "Concrete milestones, next steps & tracked wins",
              href: "/momentum#strategy",
              icon: Rocket,
            },
          ],
        },
        {
          heading: "Strategic Tools (Level 3)",
          items: [
            {
              label: "Negotiations & Offers",
              desc: "Offer evaluator & negotiation script generator",
              href: "/career-copilot?tab=negotiation",
              badge: "Strategy",
              icon: Handshake,
            },
            {
              label: "Interview Prep & Pitch",
              desc: "Narrative studio, AI questions & gap storyteller",
              href: "/career-copilot?tab=interview",
              badge: "AI",
              icon: MessageSquare,
            },
            {
              label: "Skill Gap & Career Path",
              desc: "Telemetry & trajectory recommendations",
              href: "/career-copilot?tab=skillgap",
              badge: "Audit",
              icon: Sparkles,
            },
            {
              label: "Planning & Growth",
              desc: "Promotion case builder & networking assistant",
              href: "/career-copilot?tab=growth",
              icon: TrendingUp,
            },
            {
              label: "Match: Precision JD Matching",
              desc: "Job description matching & AI resume tailoring",
              href: "/resume/tailor",
              badge: "ATS",
              icon: Crosshair,
            },
          ],
        },
      ],
    },
    {
      label: "Journal",
      href: "/career-journal",
      icon: BookOpen,
      activeMatch: (p) => p.startsWith("/career-journal"),
    },
    {
      label: "Navigator",
      href: "/career-copilot",
      icon: Compass,
      activeMatch: (p) => p.startsWith("/career-copilot"),
      subSections: [
        {
          heading: "AI Career Partner",
          items: [
            {
              label: "AI Career Partner",
              desc: "Personalized executive copilot for tech careers",
              href: "/career-copilot",
              badge: "Core",
              icon: Compass,
            },
            {
              label: "LinkedIn & Recruiter Visibility",
              desc: "Profile audit & recruiter search optimization",
              href: "/career-copilot?tab=market",
              icon: Users,
            },
            {
              label: "Career Paths",
              desc: "Next-step trajectory & role recommendations",
              href: "/career-copilot?tab=skillgap",
              icon: TrendingUp,
            },
          ],
        },
        {
          heading: "Market Awareness Suite",
          items: [
            {
              label: "Salary Benchmarking",
              desc: "Real-time tech compensation benchmarks",
              href: "/career-copilot?tab=market",
              icon: BarChart3,
            },
            {
              label: "Market Timing Alerts",
              desc: "Hiring cycles & industry trends",
              href: "/career-copilot?tab=market",
              icon: Clock,
            },
            {
              label: "Company Research Brief",
              desc: "Deep-dive culture, stack & interview intel",
              href: "/career-copilot?tab=market",
              icon: FileText,
            },
            {
              label: "Recruiter Visibility Audit",
              desc: "Audit inbound visibility & search indexing",
              href: "/career-copilot?tab=market",
              icon: Search,
            },
          ],
        },
      ],
    },
  ];

  const userInitials = user?.email ? user.email.substring(0, 2).toUpperCase() : "U";

  return (
    <>
      <nav
        className={cn(
          "sticky top-0 z-[100] flex items-center justify-between transition-all duration-300 ease-out",
          pathname === "/"
            ? scrolled
              ? "bg-[#070C18]/95 backdrop-blur-2xl shadow-2xl border-b border-white/10"
              : "bg-transparent border-b border-transparent"
            : scrolled
            ? "bg-[var(--bg-glass-nav)] backdrop-blur-xl shadow-sm border-b border-[var(--border)]"
            : "bg-[var(--bg-glass-nav)] backdrop-blur-md border-b border-[var(--border)]"
        )}
        style={{
          height: "68px",
          padding: "0 clamp(16px, 3vw, 36px)",
        }}
      >
        <div className="flex items-center gap-3 shrink-0">
          {/* Mobile Menu Button */}
          <button
            className={cn(
              "md:hidden p-1 -ml-2 transition-colors",
              pathname === "/" ? "text-white" : "text-[var(--text-primary)] dark:text-white"
            )}
            onClick={() => setMobileMenuOpen(true)}
            aria-label="Open menu"
          >
            <Menu size={24} />
          </button>

          {/* Logo */}
          <UpRoleLogo
            href={user ? (role === "admin" ? "/admin" : "/dashboard") : "/"}
            size="md"
            variant={pathname === "/" ? "dark" : "auto"}
          />
          {role === "admin" && (
            <span className="hidden sm:inline-flex text-[9.5px] font-black uppercase tracking-widest px-2 py-0.5 rounded-md bg-amber-500/15 text-amber-600 dark:text-amber-400 border border-amber-500/30">
              Admin
            </span>
          )}
        </div>

        {/* Desktop Navigation Links */}
        {user ? (
          role === "admin" || pathname.startsWith("/admin") ? (
            <div className="hidden md:flex flex-1 items-center gap-1.5 px-2 py-1 justify-start ml-6 overflow-x-auto min-w-0 [scrollbar-width:none]">
              {adminLinks.map((link) => {
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
                      "relative px-3 py-1.5 text-[12.5px] rounded-full transition-all duration-200 ease-out no-underline flex items-center gap-1.5 whitespace-nowrap shrink-0",
                      isActive
                        ? "bg-amber-500 text-brand-navy font-bold shadow-sm shadow-amber-500/25 border border-amber-500"
                        : "font-semibold text-slate-600 dark:text-slate-300 bg-slate-100/75 dark:bg-white/[0.05] border border-slate-200/80 dark:border-white/10 hover:text-brand-navy dark:hover:text-amber-400 hover:bg-amber-500/10 hover:border-amber-500/30"
                    )}
                  >
                    {Icon && <Icon size={13} className="shrink-0" />}
                    <span>{link.label}</span>
                  </Link>
                );
              })}
            </div>
          ) : (
            <div className="hidden md:flex flex-1 items-center justify-center mx-4 gap-1.5 min-w-0">
              {pillars.map((pillar) => {
                const Icon = pillar.icon;
                const isActive = pillar.activeMatch(pathname);
                const hasSub = !!pillar.subSections && pillar.subSections.length > 0;
                const isOpen = hoveredMenu === pillar.label;

                return (
                  <div
                    key={pillar.label}
                    className="relative"
                    onMouseEnter={() => handleMouseEnter(pillar.label)}
                    onMouseLeave={handleMouseLeave}
                  >
                    <Link
                      href={pillar.href}
                      className={cn(
                        "relative px-3 py-1.5 text-[13px] rounded-full transition-all duration-200 ease-out no-underline flex items-center gap-1.5 whitespace-nowrap shrink-0 active:scale-[0.97]",
                        isActive
                          ? "bg-amber-500 text-brand-navy font-bold shadow-sm shadow-amber-500/25 border border-amber-500"
                          : isOpen
                          ? "text-brand-navy dark:text-amber-400 bg-amber-500/15 border border-amber-500/40 font-semibold"
                          : "font-semibold text-slate-600 dark:text-slate-300 bg-slate-100/75 dark:bg-white/[0.05] border border-slate-200/80 dark:border-white/10 hover:text-brand-navy dark:hover:text-amber-400 hover:bg-amber-500/10 hover:border-amber-500/30"
                      )}
                    >
                      <Icon size={14} className="shrink-0" />
                      <span>{pillar.label}</span>
                      {hasSub && (
                        <ChevronDown
                          size={12}
                          className={cn(
                            "transition-transform duration-200 opacity-60",
                            isOpen && "transform rotate-180 opacity-100 text-amber-500"
                          )}
                        />
                      )}
                    </Link>

                    {/* Rich Desktop Dropdown Menu */}
                    {hasSub && isOpen && (
                      <div
                        className="absolute top-full left-1/2 -translate-x-1/2 pt-2 z-[150]"
                        onMouseEnter={() => handleMouseEnter(pillar.label)}
                        onMouseLeave={handleMouseLeave}
                      >
                        <div
                          className={cn(
                            "bg-white/95 dark:bg-[#0B132B]/95 backdrop-blur-2xl border border-slate-200 dark:border-white/10 rounded-2xl shadow-2xl p-4 transition-all duration-200",
                            pillar.subSections!.length > 2
                              ? "w-[680px] grid grid-cols-3 gap-4"
                              : pillar.subSections!.length === 2
                              ? "w-[560px] grid grid-cols-2 gap-4"
                              : "w-[340px] space-y-3"
                          )}
                        >
                          {pillar.subSections!.map((section, idx) => (
                            <div key={idx} className="space-y-2">
                              <div className="text-[10px] font-extrabold uppercase tracking-wider text-[var(--text-muted)] px-2 pb-1 border-b border-[var(--border)]">
                                {section.heading}
                              </div>
                              <div className="space-y-1">
                                {section.items.map((item, itemIdx) => {
                                  const ItemIcon = item.icon || ChevronRight;
                                  return (
                                    <Link
                                      key={itemIdx}
                                      href={item.href}
                                      className="flex items-start gap-2.5 p-2 rounded-xl text-left hover:bg-amber-500/10 dark:hover:bg-white/[0.06] transition-colors group no-underline"
                                      onClick={() => setHoveredMenu(null)}
                                    >
                                      <div className="w-6 h-6 rounded-lg bg-amber-500/15 text-amber-600 dark:text-amber-400 flex items-center justify-center shrink-0 mt-0.5 group-hover:bg-amber-500 group-hover:text-brand-navy transition-colors">
                                        <ItemIcon size={13} />
                                      </div>
                                      <div className="min-w-0 flex-1">
                                        <div className="flex items-center gap-1.5">
                                          <span className="text-[12px] font-bold text-[var(--text-primary)] group-hover:text-amber-600 dark:group-hover:text-amber-400 transition-colors truncate">
                                            {item.label}
                                          </span>
                                          {item.badge && (
                                            <span className="text-[9px] font-bold px-1.5 py-0.2 rounded bg-amber-500/15 text-amber-600 dark:text-amber-400 uppercase">
                                              {item.badge}
                                            </span>
                                          )}
                                        </div>
                                        {item.desc && (
                                          <p className="text-[11px] text-[var(--text-secondary)] mt-0.5 leading-snug line-clamp-2">
                                            {item.desc}
                                          </p>
                                        )}
                                      </div>
                                    </Link>
                                  );
                                })}
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )
        ) : (
          <div className="hidden md:flex flex-1 items-center justify-center gap-7 text-[13.5px] font-bold">
            <Link
              href="/resume/templates"
              className="text-[var(--text-secondary)] hover:text-amber-600 dark:hover:text-amber-400 transition-colors no-underline"
            >
              Templates
            </Link>
            <Link
              href="/career-copilot"
              className="text-[var(--text-secondary)] hover:text-amber-600 dark:hover:text-amber-400 transition-colors no-underline"
            >
              Career Copilot
            </Link>
            <Link
              href="/pricing"
              className="text-[var(--text-secondary)] hover:text-amber-600 dark:hover:text-amber-400 transition-colors no-underline"
            >
              Pricing
            </Link>
            <Link
              href="/contact"
              className="text-[var(--text-secondary)] hover:text-amber-600 dark:hover:text-amber-400 transition-colors no-underline"
            >
              Support
            </Link>
          </div>
        )}

        {/* Right Side: Theme, Notification, User Dropdown */}
        <div className="flex items-center gap-3 shrink-0">
          {pathname !== "/" && <ThemeToggle />}
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
                <div className="absolute right-0 mt-3 w-64 bg-white dark:bg-[#101B3B] border border-gray-200 dark:border-white/10 rounded-2xl shadow-xl py-2 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-300 transform origin-top-right scale-95 group-hover:scale-100 z-50">
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
                        <p className="text-xs text-[var(--text-muted)] truncate">{user.email}</p>
                      </div>
                    </div>
                  </div>

                  {/* Stats */}
                  <div className="px-4 py-3">
                    <div className="flex flex-col gap-3">
                      <div className="flex items-center justify-between">
                        <span className="text-[13px] font-medium text-gray-500 dark:text-gray-400">
                          Current Plan
                        </span>
                        <span className="text-[11px] font-bold text-white bg-gradient-to-r from-[#2563EB] to-[#14B8A6] px-2 py-0.5 rounded-md uppercase flex items-center gap-1">
                          <Sparkles size={10} />
                          {profile.tier}
                        </span>
                      </div>
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-1.5">
                          <span className="text-[13px] font-medium text-gray-500 dark:text-gray-400">
                            Balance
                          </span>
                          <Link
                            href="/dashboard/credits"
                            className="text-[11px] text-blue-500 hover:underline transition-colors"
                          >
                            View history
                          </Link>
                        </div>
                        <div className="flex items-center gap-1.5">
                          {profile.credit_balance < 50 && profile.tier === "free" && (
                            <Link
                              href="/pricing#topup"
                              className="text-[10px] font-bold text-amber-500 hover:underline bg-amber-500/10 px-1.5 py-0.5 rounded transition-colors"
                            >
                              Top Up
                            </Link>
                          )}
                          <span
                            className={`text-[12px] font-bold flex items-center gap-1 px-2 py-0.5 rounded-md ${
                              profile.credit_balance < 20
                                ? "text-red-500 bg-red-500/10"
                                : profile.credit_balance < 50
                                ? "text-amber-500 bg-amber-500/10"
                                : "text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-500/10"
                            }`}
                          >
                            <Coins size={12} />
                            {profile.credit_balance}
                          </span>
                        </div>
                      </div>
                    </div>

                    {profile.tier === "free" ? (
                      <Link
                        href="/pricing"
                        className="mt-4 flex items-center justify-center gap-1.5 w-full text-[13px] font-bold text-white bg-gradient-to-r from-[#101B3B] to-[#2563EB] hover:from-[#182859] hover:to-[#1D4ED8] rounded-lg py-2.5 transition-all shadow-sm hover:shadow-md"
                      >
                        Upgrade <ArrowRight size={14} />
                      </Link>
                    ) : (
                      <Link
                        href="/dashboard/credits"
                        className="mt-4 flex items-center justify-center gap-1.5 w-full text-[13px] font-semibold text-blue-500 border border-blue-500/20 hover:bg-blue-500/10 rounded-lg py-2.5 transition-all"
                      >
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
            <div className="flex items-center gap-2.5">
              <Link
                href="/login"
                className="text-[13px] font-bold text-[var(--text-primary)] hover:text-amber-600 dark:hover:text-amber-400 px-4 py-2 rounded-xl border border-[var(--border)] hover:border-amber-500/40 bg-[var(--bg-elevated)] hover:bg-amber-500/10 transition-all no-underline shadow-xs"
              >
                Sign In
              </Link>
              <Link
                href="/resume/builder?new=true"
                className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl text-[13px] font-black text-brand-navy bg-amber-500 hover:bg-amber-400 shadow-md shadow-amber-500/25 border border-amber-400 transition-all hover:scale-[1.02] active:scale-[0.98] no-underline"
              >
                <span>Get Started</span>
              </Link>
            </div>
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
        className="fixed top-0 left-0 bottom-0 z-[1002] w-[310px] bg-[var(--bg-glass)] backdrop-blur-2xl border-r border-[var(--border)] shadow-[var(--shadow-xl)] transform transition-transform duration-[var(--dur-base)] ease-[var(--ease-spring)] md:hidden flex flex-col"
        style={{
          transform: mobileMenuOpen ? "translateX(0)" : "translateX(-100%)",
        }}
      >
        <div className="flex items-center justify-between p-5 border-b border-[var(--border)]">
          <UpRoleLogo href="/" size="sm" />
          <button
            onClick={() => setMobileMenuOpen(false)}
            className="text-[var(--text-muted)] hover:text-[var(--text-primary)] p-1 cursor-pointer"
          >
            <X size={24} />
          </button>
        </div>

        <div className="flex flex-col p-4 gap-2 flex-1 overflow-y-auto">
          {user ? (
            role === "admin" || pathname.startsWith("/admin") ? (
              adminLinks.map((link) => {
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
                      "flex items-center gap-2.5 h-[46px] px-4 rounded-[var(--radius-md)] text-[14px] font-medium transition-colors no-underline",
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
              pillars.map((pillar) => {
                const Icon = pillar.icon;
                const isActive = pillar.activeMatch(pathname);
                const hasSub = !!pillar.subSections && pillar.subSections.length > 0;
                const isExpanded = expandedMobileMenu === pillar.label;

                return (
                  <div key={pillar.label} className="flex flex-col">
                    <div className="flex items-center justify-between">
                      <Link
                        href={pillar.href}
                        className={cn(
                          "flex items-center gap-2.5 h-[46px] px-4 rounded-[var(--radius-md)] text-[15px] font-semibold transition-colors flex-1 no-underline",
                          isActive
                            ? "text-amber-600 dark:text-amber-400 bg-amber-500/10 font-bold"
                            : "text-[var(--text-secondary)] hover:bg-[var(--bg-elevated)] hover:text-[var(--text-primary)]"
                        )}
                        onClick={() => setMobileMenuOpen(false)}
                      >
                        <Icon size={18} className="shrink-0" />
                        <span>{pillar.label}</span>
                      </Link>
                      {hasSub && (
                        <button
                          onClick={() =>
                            setExpandedMobileMenu(isExpanded ? null : pillar.label)
                          }
                          className="p-2 text-[var(--text-muted)] hover:text-[var(--text-primary)] transition-transform"
                        >
                          <ChevronDown
                            size={18}
                            className={cn("transition-transform", isExpanded && "rotate-180")}
                          />
                        </button>
                      )}
                    </div>

                    {/* Mobile Accordion Submenu */}
                    {hasSub && isExpanded && (
                      <div className="pl-6 pr-2 py-2 space-y-3 bg-[var(--bg-elevated)] rounded-xl my-1">
                        {pillar.subSections!.map((sec, sIdx) => (
                          <div key={sIdx} className="space-y-1.5">
                            <div className="text-[10px] font-extrabold uppercase text-[var(--text-muted)] tracking-wider">
                              {sec.heading}
                            </div>
                            {sec.items.map((item, iIdx) => (
                              <Link
                                key={iIdx}
                                href={item.href}
                                className="flex items-center justify-between py-1.5 px-2 text-[12px] font-medium text-[var(--text-secondary)] hover:text-amber-500 transition-colors no-underline"
                                onClick={() => setMobileMenuOpen(false)}
                              >
                                <span className="truncate">{item.label}</span>
                                {item.badge && (
                                  <span className="text-[9px] font-bold px-1.5 py-0.5 rounded bg-amber-500/15 text-amber-500">
                                    {item.badge}
                                  </span>
                                )}
                              </Link>
                            ))}
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                );
              })
            )
          ) : (
            <>
              <Link
                href="/resume/templates"
                className="flex items-center h-[44px] px-4 rounded-xl text-[14px] font-bold text-[var(--text-secondary)] hover:bg-[var(--bg-elevated)] hover:text-[var(--text-primary)] transition-colors no-underline"
                onClick={() => setMobileMenuOpen(false)}
              >
                ATS Templates
              </Link>
              <Link
                href="/career-copilot"
                className="flex items-center h-[44px] px-4 rounded-xl text-[14px] font-bold text-[var(--text-secondary)] hover:bg-[var(--bg-elevated)] hover:text-[var(--text-primary)] transition-colors no-underline"
                onClick={() => setMobileMenuOpen(false)}
              >
                Career Copilot
              </Link>
              <Link
                href="/pricing"
                className="flex items-center h-[44px] px-4 rounded-xl text-[14px] font-bold text-[var(--text-secondary)] hover:bg-[var(--bg-elevated)] hover:text-[var(--text-primary)] transition-colors no-underline"
                onClick={() => setMobileMenuOpen(false)}
              >
                Pricing Plans
              </Link>
              <Link
                href="/contact"
                className="flex items-center h-[44px] px-4 rounded-xl text-[14px] font-bold text-[var(--text-secondary)] hover:bg-[var(--bg-elevated)] hover:text-[var(--text-primary)] transition-colors no-underline"
                onClick={() => setMobileMenuOpen(false)}
              >
                Support Helpdesk
              </Link>
              <div className="pt-3 border-t border-[var(--border)] mt-2 flex flex-col gap-2">
                <Link
                  href="/login"
                  className="flex items-center justify-center h-[44px] px-4 rounded-xl border border-[var(--border)] text-[14px] font-bold text-[var(--text-primary)] hover:bg-[var(--bg-elevated)] transition-colors no-underline"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  Sign In
                </Link>
                <Link
                  href="/resume/builder?new=true"
                  className="flex items-center justify-center h-[44px] px-4 rounded-xl text-[14px] font-black text-brand-navy bg-amber-500 hover:bg-amber-400 transition-all shadow-md shadow-amber-500/25 no-underline"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  Get Started Free
                </Link>
              </div>
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
