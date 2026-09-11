"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/components/ui/toast-1";
import { ThemeToggle } from "@/components/ThemeToggle";
import ParticleBackground from "@/components/ui/ParticleBackground";
import {
  Briefcase,
  MapPin,
  TrendingUp,
  Sparkles,
  ArrowRight,
  ShieldCheck,
  CheckCircle2,
  Building2,
  Award,
  Zap,
} from "lucide-react";

const POPULAR_ROLES = [
  "Software Engineer",
  "Full Stack Developer",
  "Frontend Engineer",
  "Backend Engineer",
  "DevOps / SRE",
  "Data Scientist / AI",
  "Product Manager",
  "Mobile Engineer",
];

const POPULAR_CITIES = [
  { id: "Bangalore", label: "Bengaluru", state: "KA" },
  { id: "Delhi", label: "Delhi / NCR", state: "DL" },
  { id: "Hyderabad", label: "Hyderabad", state: "TS" },
  { id: "Mumbai", label: "Mumbai", state: "MH" },
  { id: "Pune", label: "Pune", state: "MH" },
  { id: "Chennai", label: "Chennai", state: "TN" },
  { id: "Remote", label: "Remote", state: "Pan-India" },
];

const getSeniorityTier = (years: number) => {
  if (years <= 1) {
    return {
      label: "Entry / Fresher",
      badgeClass: "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20",
      description: "Foundational ATS keywords, core fundamentals & entry salary bands",
    };
  }
  if (years <= 4) {
    return {
      label: "Mid-Level Specialist",
      badgeClass: "bg-blue-500/10 text-blue-600 dark:text-blue-400 border-blue-500/20",
      description: "Project impact metrics, technical depth & mid-tier product benchmarks",
    };
  }
  if (years <= 8) {
    return {
      label: "Senior Professional",
      badgeClass: "bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/20",
      description: "Architectural ownership, leadership signals & senior CTC bands",
    };
  }
  if (years <= 12) {
    return {
      label: "Lead / Staff Architect",
      badgeClass: "bg-purple-500/10 text-purple-600 dark:text-purple-400 border-purple-500/20",
      description: "Cross-org strategy, tech governance & executive recruitment scoring",
    };
  }
  return {
    label: "Director / Executive",
    badgeClass: "bg-amber-500/20 text-amber-500 border-amber-500/30",
    description: "P&L impact, organizational design & C-suite career positioning",
  };
};

export default function OnboardingPage() {
  const { user, loading: authLoading } = useAuth();
  const { showToast } = useToast();
  const router = useRouter();

  const [role, setRole] = useState("Software Engineer");
  const [city, setCity] = useState("Bangalore");
  const [yoe, setYoe] = useState(2);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (!authLoading && !user) {
      router.push("/login");
    }
  }, [authLoading, user, router]);

  const seniority = getSeniorityTier(yoe);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);

    try {
      const res = await fetch("/api/onboarding", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ targetRole: role, targetCity: city, yoe }),
      });

      if (res.ok) {
        showToast("Profile configured successfully! Launching workspace...", "success");
        router.push("/dashboard");
      } else {
        showToast("Onboarding failed. Please try again.", "error");
      }
    } catch (err) {
      console.error(err);
      showToast("Error setting up onboarding details.", "error");
    } finally {
      setSubmitting(false);
    }
  };

  if (authLoading || !user) {
    return (
      <div
        style={{
          minHeight: "100vh",
          background: "var(--bg-page)",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          gap: "1rem",
        }}
      >
        <div className="bg-transparent dark:bg-white/95 py-1 px-3 rounded-[8px] flex items-center shadow-sm">
          <Image
            src="/UpRole logo.png"
            alt="UpRole"
            width={120}
            height={30}
            style={{ objectFit: "contain", height: "auto" }}
          />
        </div>
        <div className="spinner" style={{ width: 36, height: 36 }} />
        <p style={{ color: "var(--text-muted)", fontSize: "0.85rem" }}>Loading your career session...</p>
      </div>
    );
  }

  return (
    <div
      style={{
        position: "relative",
        minHeight: "100vh",
        background: "var(--bg-page)",
        overflow: "hidden",
        display: "flex",
        flexDirection: "column",
      }}
    >
      {/* Background Particle Engine */}
      <ParticleBackground count={45} connectionDist={115} />

      {/* Ambient Brand Glow Blobs */}
      <div
        style={{
          position: "absolute",
          top: "-10%",
          right: "-5%",
          width: "550px",
          height: "550px",
          borderRadius: "50%",
          background: "radial-gradient(circle, rgba(245, 158, 11, 0.12) 0%, transparent 70%)",
          pointerEvents: "none",
          filter: "blur(60px)",
          zIndex: 0,
        }}
      />
      <div
        style={{
          position: "absolute",
          bottom: "-10%",
          left: "-5%",
          width: "550px",
          height: "550px",
          borderRadius: "50%",
          background: "radial-gradient(circle, rgba(37, 99, 235, 0.10) 0%, transparent 70%)",
          pointerEvents: "none",
          filter: "blur(60px)",
          zIndex: 0,
        }}
      />

      {/* Top Navigation Bar */}
      <header
        style={{
          position: "relative",
          zIndex: 30,
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          padding: "1.25rem 2rem",
          borderBottom: "1px solid var(--border)",
          backdropFilter: "blur(12px)",
          background: "var(--bg-glass-nav)",
        }}
      >
        <Link href="/" className="flex items-center no-underline">
          <div className="bg-transparent dark:bg-white/95 py-1 px-2.5 rounded-[8px] flex items-center shadow-xs">
            <Image
              src="/UpRole logo.png"
              alt="UpRole"
              width={110}
              height={28}
              style={{ objectFit: "contain", height: "auto" }}
            />
          </div>
        </Link>

        <div className="flex items-center gap-3">
          <div className="hidden sm:flex items-center gap-2 px-3 py-1 rounded-full bg-[var(--bg-elevated)] border border-[var(--border)] text-xs font-semibold text-[var(--text-muted)]">
            <span className="w-2 h-2 rounded-full bg-amber-500 animate-pulse" />
            <span>Step 1 of 1 • Career Foundation</span>
          </div>
          <ThemeToggle />
        </div>
      </header>

      {/* Main Content Body */}
      <main
        style={{
          position: "relative",
          zIndex: 10,
          flex: 1,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          padding: "2rem 1.5rem 3rem",
        }}
      >
        <div className="w-full max-w-5xl grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-center">
          
          {/* Left Column: Context & Real-Time Preview */}
          <div className="lg:col-span-5 flex flex-col gap-6">
            <div>
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/25 mb-3">
                <Sparkles size={13} />
                <span>Career Operating System</span>
              </div>
              <h1 className="text-3xl sm:text-4xl font-extrabold font-['Syne',sans-serif] text-[var(--text-primary)] tracking-tight leading-[1.2] mb-3">
                Calibrate Your Career Trajectory.
              </h1>
              <p className="text-[var(--text-muted)] text-[15px] leading-relaxed">
                Configure your target preferences so UpRole can fine-tune ATS keyword matching, Indian tech salary benchmarks, and AI interview prep specifically for you.
              </p>
            </div>

            {/* Dynamic Live Profile Calibrator Card */}
            <div
              className="p-5 rounded-2xl border transition-all relative overflow-hidden"
              style={{
                background: "var(--card)",
                borderColor: "var(--border)",
                boxShadow: "var(--shadow-md)",
              }}
            >
              <div
                style={{
                  position: "absolute",
                  top: 0,
                  left: 0,
                  right: 0,
                  height: "3px",
                  background: "var(--accent-grad)",
                }}
              />

              <div className="flex items-center justify-between mb-4 pb-3 border-b border-[var(--border)]">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-lg bg-amber-500/15 text-amber-500 flex items-center justify-center font-bold text-sm">
                    <Zap size={16} />
                  </div>
                  <div>
                    <span className="text-xs font-semibold text-[var(--text-muted)] block uppercase tracking-wider">
                      Live Calibration
                    </span>
                    <span className="text-sm font-bold text-[var(--text-primary)]">
                      {role || "Target Role"}
                    </span>
                  </div>
                </div>
                <span className={`text-[11px] font-bold px-2.5 py-1 rounded-full border ${seniority.badgeClass}`}>
                  {seniority.label}
                </span>
              </div>

              <div className="space-y-2.5 text-xs">
                <div className="flex items-center gap-2 text-[var(--text-secondary)]">
                  <CheckCircle2 size={15} className="text-emerald-500 shrink-0" />
                  <span>
                    ATS Scoring tuned for <strong className="text-[var(--text-primary)]">{role || "Your Role"}</strong>
                  </span>
                </div>
                <div className="flex items-center gap-2 text-[var(--text-secondary)]">
                  <CheckCircle2 size={15} className="text-blue-500 shrink-0" />
                  <span>
                    Salary benchmarks mapped to <strong className="text-[var(--text-primary)]">{city}</strong> tech market
                  </span>
                </div>
                <div className="flex items-center gap-2 text-[var(--text-secondary)]">
                  <CheckCircle2 size={15} className="text-amber-500 shrink-0" />
                  <span>
                    STAR interview models tailored to <strong className="text-[var(--text-primary)]">{yoe} YoE</strong> seniority
                  </span>
                </div>
              </div>

              <div className="mt-4 pt-3 border-t border-[var(--border)] flex items-center gap-2 text-[11px] text-[var(--text-muted)]">
                <Award size={14} className="text-amber-500 shrink-0" />
                <span>{seniority.description}</span>
              </div>
            </div>

            {/* Social Proof */}
            <div className="flex items-center gap-3 px-3 py-2 rounded-xl bg-[var(--bg-elevated)] border border-[var(--border)] text-xs text-[var(--text-secondary)]">
              <span className="text-amber-400 font-bold text-sm">★ ★ ★ ★ ★</span>
              <span>Trusted by 10,000+ ambitious tech professionals in India.</span>
            </div>
          </div>

          {/* Right Column: Interactive Setup Form */}
          <div className="lg:col-span-7">
            <div
              className="p-6 sm:p-8 rounded-2xl border transition-all"
              style={{
                background: "var(--card)",
                borderColor: "var(--border)",
                boxShadow: "0 20px 40px rgba(0,0,0,0.12), 0 1px 3px rgba(0,0,0,0.05)",
              }}
            >
              <div className="flex items-center justify-between mb-6 pb-4 border-b border-[var(--border)]">
                <div>
                  <h2 className="text-xl sm:text-2xl font-extrabold font-['Syne',sans-serif] text-[var(--text-primary)] m-0">
                    Onboarding Profile Setup
                  </h2>
                  <p className="text-xs sm:text-sm text-[var(--text-muted)] mt-1 mb-0">
                    Takes under 30 seconds. You can modify these anytime later.
                  </p>
                </div>
                <div className="hidden sm:flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20 text-xs font-bold">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                  100% Calibrated
                </div>
              </div>

              <form onSubmit={handleSubmit} className="flex flex-col gap-6">
                
                {/* Field 1: Target Tech Role */}
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <label className="text-xs font-bold uppercase tracking-wider text-[var(--text-secondary)] flex items-center gap-1.5">
                      <Briefcase size={14} className="text-amber-500" />
                      Target Tech Role
                    </label>
                    <span className="text-[11px] text-[var(--text-muted)]">Type or select a chip</span>
                  </div>

                  <input
                    required
                    type="text"
                    value={role}
                    onChange={(e) => setRole(e.target.value)}
                    placeholder="e.g. Software Engineer, Full Stack, Product Manager"
                    className="w-full px-4 py-3 rounded-xl border text-sm font-semibold transition-all outline-none"
                    style={{
                      background: "var(--bg-elevated)",
                      borderColor: "var(--border)",
                      color: "var(--text-primary)",
                    }}
                  />

                  {/* Quick role suggestions */}
                  <div className="flex flex-wrap gap-1.5 mt-2.5">
                    {POPULAR_ROLES.map((r) => {
                      const isSelected = role.toLowerCase() === r.toLowerCase();
                      return (
                        <button
                          key={r}
                          type="button"
                          onClick={() => setRole(r)}
                          className={`text-xs py-1 px-2.5 rounded-lg border transition-all cursor-pointer font-medium ${
                            isSelected
                              ? "bg-amber-500 text-brand-navy border-amber-500 font-bold shadow-xs"
                              : "bg-[var(--bg-elevated)] text-[var(--text-secondary)] border-[var(--border)] hover:border-amber-500/50 hover:text-[var(--text-primary)]"
                          }`}
                        >
                          {r}
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Field 2: Target City in India */}
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <label className="text-xs font-bold uppercase tracking-wider text-[var(--text-secondary)] flex items-center gap-1.5">
                      <MapPin size={14} className="text-amber-500" />
                      Indian City / Tech Hub
                    </label>
                    <span className="text-[11px] text-[var(--text-muted)]">Select target market</span>
                  </div>

                  {/* City Pill Grid */}
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 mb-2">
                    {POPULAR_CITIES.map((c) => {
                      const isSelected = city === c.id;
                      return (
                        <button
                          key={c.id}
                          type="button"
                          onClick={() => setCity(c.id)}
                          className={`p-2 rounded-xl border text-xs font-semibold text-left transition-all cursor-pointer flex flex-col justify-between ${
                            isSelected
                              ? "bg-amber-500 text-brand-navy border-amber-500 shadow-xs"
                              : "bg-[var(--bg-elevated)] text-[var(--text-primary)] border-[var(--border)] hover:border-amber-500/50"
                          }`}
                        >
                          <span className="font-bold">{c.label}</span>
                          <span
                            className={`text-[10px] mt-0.5 ${
                              isSelected ? "text-brand-navy/80 font-medium" : "text-[var(--text-muted)]"
                            }`}
                          >
                            {c.state}
                          </span>
                        </button>
                      );
                    })}
                  </div>

                  {/* Fallback Custom Select */}
                  <select
                    value={city}
                    onChange={(e) => setCity(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border text-xs font-medium outline-none transition-all"
                    style={{
                      background: "var(--bg-elevated)",
                      borderColor: "var(--border)",
                      color: "var(--text-primary)",
                    }}
                  >
                    <option value="Bangalore">Bengaluru (Bangalore)</option>
                    <option value="Delhi">Delhi / NCR (Gurgaon, Noida)</option>
                    <option value="Hyderabad">Hyderabad</option>
                    <option value="Mumbai">Mumbai / Navi Mumbai</option>
                    <option value="Pune">Pune</option>
                    <option value="Chennai">Chennai</option>
                    <option value="Remote">Remote / Anywhere</option>
                  </select>
                </div>

                {/* Field 3: Years of Experience */}
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <label className="text-xs font-bold uppercase tracking-wider text-[var(--text-secondary)] flex items-center gap-1.5">
                      <TrendingUp size={14} className="text-amber-500" />
                      Years of Experience (YoE)
                    </label>
                    <div className="flex items-center gap-2">
                      <span className="text-lg font-black text-amber-500 font-['Syne',sans-serif]">
                        {yoe} {yoe === 1 ? "Year" : "Years"}
                      </span>
                      <span className={`text-[11px] font-bold px-2 py-0.5 rounded-full border ${seniority.badgeClass}`}>
                        {seniority.label}
                      </span>
                    </div>
                  </div>

                  <input
                    type="range"
                    min="0"
                    max="20"
                    value={yoe}
                    onChange={(e) => setYoe(parseInt(e.target.value) || 0)}
                    className="w-full h-2.5 rounded-lg appearance-none cursor-pointer accent-amber-500"
                    style={{
                      background: "var(--bg-3)",
                    }}
                  />

                  {/* Preset quick buttons */}
                  <div className="flex items-center justify-between mt-2">
                    {[0, 2, 5, 8, 12, 15].map((preset) => (
                      <button
                        key={preset}
                        type="button"
                        onClick={() => setYoe(preset)}
                        className={`text-[11px] px-2 py-1 rounded-md border font-semibold transition-all cursor-pointer ${
                          yoe === preset
                            ? "bg-amber-500 text-brand-navy border-amber-500"
                            : "bg-[var(--bg-elevated)] text-[var(--text-muted)] border-[var(--border)] hover:text-[var(--text-primary)]"
                        }`}
                      >
                        {preset === 0 ? "Fresher" : `${preset}y`}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Primary Submit CTA */}
                <button
                  type="submit"
                  disabled={submitting}
                  className="w-full py-3.5 px-6 rounded-xl font-extrabold text-base flex items-center justify-center gap-2 cursor-pointer transition-all duration-200"
                  style={{
                    background: "var(--accent-grad)",
                    color: "#101B3B",
                    boxShadow: "0 6px 20px rgba(245, 158, 11, 0.35)",
                    opacity: submitting ? 0.7 : 1,
                  }}
                >
                  {submitting ? (
                    <>
                      <div className="spinner" style={{ width: 18, height: 18, borderWidth: 2 }} />
                      <span>Configuring Workspace...</span>
                    </>
                  ) : (
                    <>
                      <span>✦ Setup Workspace & Continue</span>
                      <ArrowRight size={18} />
                    </>
                  )}
                </button>

                {/* Privacy & Guarantee footer */}
                <div className="flex items-center justify-center gap-1.5 text-xs text-[var(--text-muted)]">
                  <ShieldCheck size={14} className="text-emerald-500" />
                  <span>100% Private & Encrypted. Preferences can be edited at any time.</span>
                </div>
              </form>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
