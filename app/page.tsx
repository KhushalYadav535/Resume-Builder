"use client";

import Link from "next/link";
import Navbar from "@/components/Navbar";
import ParticleBackground from "@/components/ui/ParticleBackground";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { motion } from "framer-motion";
import { ArrowRight, Upload, Sparkles, FileText, CheckCircle, Target, Download, Settings } from "lucide-react";
import { useEffect, useState } from "react";

function Counter({ value, suffix = "", prefix = "" }: { value: number; suffix?: string; prefix?: string }) {
  const [count, setCount] = useState(0);

  useEffect(() => {
    let start = 0;
    const end = value;
    const duration = 2000;
    const increment = end / (duration / 16);

    const timer = setInterval(() => {
      start += increment;
      if (start >= end) {
        setCount(end);
        clearInterval(timer);
      } else {
        setCount(Math.floor(start));
      }
    }, 16);
    return () => clearInterval(timer);
  }, [value]);

  return <span>{prefix}{count}{suffix}</span>;
}

export default function Home() {
  return (
    <main style={{ position: 'relative', minHeight: '100vh', background: 'var(--bg-page)', overflowX: 'hidden' }}>
      <ParticleBackground count={75} connectionDist={130} />
      <div style={{ position: 'relative', zIndex: 1 }}>
        <Navbar />

        {/* Hero Section */}
        <section style={{ position: 'relative', minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '80px 24px 60px', overflow: 'hidden' }}>
          {/* Background gradient orbs */}
          <div style={{ position: 'absolute', top: '-120px', left: '-100px', width: '500px', height: '500px', borderRadius: '50%', background: 'radial-gradient(circle, rgba(var(--particle-rgb), 0.12) 0%, transparent 70%)', animation: 'orbDrift 10s ease-in-out infinite', pointerEvents: 'none', zIndex: 1 }} />
          <div style={{ position: 'absolute', bottom: '-80px', right: '-60px', width: '420px', height: '420px', borderRadius: '50%', background: 'radial-gradient(circle, rgba(124, 58, 237, 0.10) 0%, transparent 70%)', animation: 'orbDrift 13s ease-in-out infinite reverse', pointerEvents: 'none', zIndex: 1 }} />

          {/* Resume mockup card (background decoration) */}
          <div className="hidden md:block hero-bg-mockup" style={{ position: 'absolute', right: 'clamp(-40px, 4vw, 60px)', top: '50%', transform: 'translateY(-50%)', width: 'clamp(280px, 28vw, 380px)', zIndex: 2, pointerEvents: 'none', animation: 'float 5s ease-in-out infinite' }}>
            <div className="relative w-full aspect-[4/3] rounded-2xl bg-[var(--bg-surface)] border-2 border-[var(--accent)] shadow-[var(--accent-glow)] backdrop-blur-xl p-6 overflow-hidden transform rotate-y-[-10deg] rotate-x-[5deg] hover:rotate-y-0 hover:rotate-x-0 transition-transform duration-[800ms] ease-out">
              <div className="absolute top-0 left-0 w-full h-1.5 bg-[var(--accent-grad)]" />
              <div className="flex justify-between items-start mb-8">
                <div>
                  <div className="h-6 w-48 bg-[var(--border-strong)] rounded-md mb-2 opacity-60" />
                  <div className="h-4 w-32 bg-[var(--border-strong)] rounded-md opacity-40" />
                </div>
                <div className="w-12 h-12 rounded-full border-[3px] border-[var(--score-high)] flex items-center justify-center font-mono font-bold text-[var(--score-high)] text-sm shadow-[0_0_15px_rgba(16,185,129,0.3)]">
                  98
                </div>
              </div>
              <div className="space-y-4">
                {[1, 2, 3].map((i) => (
                  <div key={i} className="flex gap-4">
                    <div className="w-2 h-2 rounded-full bg-[var(--accent)] mt-2 shadow-[0_0_10px_var(--accent)]" />
                    <div className="flex-1 space-y-2">
                      <div className="h-4 w-full bg-[var(--border-strong)] rounded-md opacity-40" />
                      <div className="h-4 w-5/6 bg-[var(--border-strong)] rounded-md opacity-30" />
                    </div>
                  </div>
                ))}
              </div>
              {/* Floating optimization chip */}
              <motion.div
                animate={{ y: [0, -10, 0] }}
                transition={{ repeat: Infinity, duration: 3, ease: "easeInOut" }}
                className="absolute bottom-6 right-6 bg-[var(--bg-surface)] px-4 py-2 rounded-full shadow-[0_0_20px_var(--accent)] border border-[var(--accent)] flex items-center gap-2 text-sm font-semibold text-[var(--text-primary)]"
              >
                <Sparkles size={16} className="text-[var(--accent)] animate-pulse" />
                <span>ATS Optimized</span>
              </motion.div>
            </div>
          </div>

          {/* Hero text content */}
          <div style={{ position: 'relative', zIndex: 3, maxWidth: '680px', margin: '0 auto', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '20px', textAlign: 'center', animation: 'heroFadeUp 0.9s var(--ease-out) both' }}>
            <div style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', padding: '6px 16px', background: 'var(--accent-soft)', border: '1px solid var(--border-accent)', borderRadius: 'var(--radius-full)', fontSize: '13px', fontWeight: 600, color: 'var(--accent)', animation: 'heroFadeUp 0.9s var(--ease-out) both' }}>
              <Sparkles size={14} className="mr-1.5" />
              AI-Powered Resume Platform
            </div>

            <h1 className="font-['Syne',sans-serif]" style={{ fontSize: 'clamp(42px, 7vw, 78px)', fontWeight: 800, lineHeight: 1.05, letterSpacing: '-0.025em', textAlign: 'center', color: 'var(--text-primary)', animation: 'heroFadeUp 0.9s 0.1s var(--ease-out) both' }}>
              Outsmart the ATS.{" "}
              <span className="gradient-text relative inline-block">
                Land the Interview.
                <svg className="absolute w-full h-3 -bottom-1 left-0 text-[var(--accent)] opacity-40" viewBox="0 0 100 10" preserveAspectRatio="none">
                  <path d="M0 5 Q 50 10 100 5" stroke="currentColor" strokeWidth="4" fill="none" />
                </svg>
              </span>
            </h1>

            <p style={{ fontSize: 'clamp(16px, 2vw, 20px)', color: 'var(--text-muted)', fontWeight: 400, lineHeight: 1.6, maxWidth: '520px', animation: 'heroFadeUp 0.9s 0.2s var(--ease-out) both' }}>
              Stop guessing what recruiters want. Let our elite AI engine perfect, optimize, and score your resume in seconds.
            </p>

            <div style={{ display: 'flex', justifyContent: 'center', flexWrap: 'wrap', gap: '14px', animation: 'heroFadeUp 0.9s 0.3s var(--ease-out) both' }}>
              <Link href="/resume/builder" className="w-full sm:w-auto no-underline">
                <Button size="lg" fullWidth icon={<FileText size={18} />}>
                  Build My Resume
                </Button>
              </Link>
              <Link href="/resume/upload" className="w-full sm:w-auto no-underline">
                <Button variant="secondary" size="lg" fullWidth icon={<Upload size={18} />}>
                  Upload Resume
                </Button>
              </Link>
            </div>
          </div>
        </section>

        {/* Stats Section */}
        <section className="border-y border-[var(--border)] bg-[var(--bg-surface)] py-16 relative z-10">
          <div className="max-w-6xl mx-auto px-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-10 divide-y md:divide-y-0 md:divide-x divide-[var(--border)]">
              {[
                { value: 75, suffix: "%", label: "Resumes rejected by ATS" },
                { value: 6, suffix: " sec", label: "Average recruiter screen time" },
                { value: 250, suffix: "+", label: "Applications per job posting" },
              ].map((stat, i) => (
                <motion.div
                  key={stat.label}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true, margin: "-50px" }}
                  transition={{ duration: 0.5, delay: i * 0.1 }}
                  className="text-center pt-8 md:pt-0 flex flex-col items-center justify-center"
                >
                  <div className="font-['Syne',sans-serif] text-4xl lg:text-5xl font-extrabold gradient-text mb-3">
                    <Counter value={stat.value} suffix={stat.suffix} />
                  </div>
                  <div className="text-[var(--text-secondary)] font-medium">
                    {stat.label}
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        {/* Features Grid */}
        <section className="py-24 max-w-7xl mx-auto px-6 relative z-10">
          <div className="text-center mb-16">
            <Badge variant="neutral" className="mb-4">Features</Badge>
            <h2 className="font-['Syne',sans-serif] text-3xl md:text-4xl font-extrabold text-[var(--text-primary)]">
              Everything you need to <span className="text-[var(--accent)]">succeed</span>
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[
              {
                icon: <FileText size={22} />,
                color: "var(--accent)",
                title: "Resume Builder",
                desc: "Build a professional resume from scratch with AI assistance on every section.",
              },
              {
                icon: <CheckCircle size={22} />,
                color: "var(--score-high)",
                title: "ATS Score Checker",
                desc: "Instantly see how your resume performs against Applicant Tracking Systems.",
              },
              {
                icon: <Sparkles size={22} />,
                color: "var(--score-mid)",
                title: "Content Reviewer",
                desc: "AI improves your bullet points, suggests powerful action verbs, and quantifies achievements.",
              },
              {
                icon: <Target size={22} />,
                color: "var(--info)",
                title: "JD Matcher",
                desc: "Paste any job description and get a keyword gap analysis instantly.",
              },
              {
                icon: <Settings size={22} />,
                color: "var(--accent-2)",
                title: "ATS-Friendly Templates",
                desc: "Choose from professionally designed templates that beat ATS filters.",
              },
              {
                icon: <Download size={22} />,
                color: "var(--success)",
                title: "Export to PDF",
                desc: "Download your polished resume as a clean, formatted PDF instantly.",
              },
            ].map((feature, i) => (
              <motion.div
                key={feature.title}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-50px" }}
                transition={{ duration: 0.5, delay: i * 0.1 }}
              >
                <Card hoverable glowColor={feature.color + "33"} className="h-full flex flex-col">
                  <div
                    className="w-12 h-12 rounded-[var(--radius-md)] flex items-center justify-center mb-5"
                    style={{ backgroundColor: `${feature.color}15`, color: feature.color }}
                  >
                    {feature.icon}
                  </div>
                  <h3 className="font-['Syne',sans-serif] text-xl font-bold mb-3 text-[var(--text-primary)]">
                    {feature.title}
                  </h3>
                  <p className="text-[var(--text-secondary)] text-[15px] leading-relaxed flex-1">
                    {feature.desc}
                  </p>
                </Card>
              </motion.div>
            ))}
          </div>
        </section>

        {/* CTA */}
        <section className="py-24 relative z-10 overflow-hidden">
          <div className="absolute inset-0 bg-[var(--accent-grad)] opacity-[0.03] pointer-events-none" />
          <div className="max-w-3xl mx-auto px-6 text-center">
            <h2 className="font-['Syne',sans-serif] text-3xl md:text-5xl font-extrabold mb-6 text-[var(--text-primary)]">
              Ready to get more interviews?
            </h2>
            <p className="text-lg text-[var(--text-secondary)] mb-10 max-w-xl mx-auto">
              Free. No credit card. No account needed to start. Join thousands of job seekers landing their dream roles.
            </p>
            <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }} className="inline-block">
              <Link href="/resume/builder" className="no-underline">
                <Button size="lg" icon={<ArrowRight size={18} />} className="shadow-[var(--shadow-lg)]">
                  Start Building Now
                </Button>
              </Link>
            </motion.div>
          </div>
        </section>
      </div>
    </main>
  );
}
