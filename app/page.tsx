"use client";

import Link from "next/link";
import Navbar from "@/components/Navbar";
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
    <main className="min-h-screen bg-[var(--bg-primary)] overflow-hidden relative">
      {/* Background glow blobs */}
      <div className="absolute top-[-20%] left-[-10%] w-[800px] h-[800px] bg-[var(--accent-glow)] rounded-full blur-[120px] mix-blend-multiply opacity-70 pointer-events-none animate-pulse-ring" />
      <div className="absolute bottom-[-10%] right-[-10%] w-[600px] h-[600px] bg-[var(--shadow-glow-red)] rounded-full blur-[120px] mix-blend-multiply opacity-30 pointer-events-none" />

      <Navbar />

      {/* Hero Section */}
      <section className="relative max-w-7xl mx-auto px-6 pt-24 pb-32 flex flex-col lg:flex-row items-center gap-16">
        <div className="flex-1 flex flex-col items-center lg:items-start text-center lg:text-left z-10">
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, ease: "easeOut" }}
            className="mb-6"
          >
            <Badge variant="accent" className="px-4 py-1.5 text-sm shadow-[var(--shadow-sm)]">
              <Sparkles size={14} className="mr-1.5" />
              AI-Powered Resume Platform
            </Badge>
          </motion.div>

          <motion.h1 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, ease: "easeOut", delay: 0.1 }}
            className="font-['Syne',sans-serif] text-[clamp(3rem,6vw,5rem)] font-extrabold leading-[1.05] mb-6 text-[var(--text-primary)]"
          >
            Land your dream job with a{" "}
            <span className="gradient-text relative inline-block">
              resume that works
              <svg className="absolute w-full h-3 -bottom-1 left-0 text-[var(--accent)] opacity-40" viewBox="0 0 100 10" preserveAspectRatio="none">
                <path d="M0 5 Q 50 10 100 5" stroke="currentColor" strokeWidth="4" fill="none" />
              </svg>
            </span>
          </motion.h1>

          <motion.p 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, ease: "easeOut", delay: 0.2 }}
            className="text-lg lg:text-xl color-[var(--text-secondary)] leading-relaxed max-w-2xl mb-10"
          >
            Build from scratch, optimize for ATS, match job descriptions, and get
            AI-powered content improvements — all in one platform.
          </motion.p>

          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, ease: "easeOut", delay: 0.3 }}
            className="flex flex-col sm:flex-row gap-4 w-full sm:w-auto"
          >
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
          </motion.div>
        </div>

        <motion.div 
          initial={{ opacity: 0, scale: 0.9, rotateY: -15 }}
          animate={{ opacity: 1, scale: 1, rotateY: 0 }}
          transition={{ duration: 0.8, ease: "easeOut", delay: 0.2 }}
          className="flex-1 w-full relative z-10 perspective-[1000px] hidden lg:block"
        >
          <div className="relative w-full aspect-[4/3] rounded-2xl bg-[var(--bg-glass)] border border-[var(--border)] shadow-[var(--shadow-3d)] backdrop-blur-xl p-6 overflow-hidden transform rotate-y-[-10deg] rotate-x-[5deg] hover:rotate-y-0 hover:rotate-x-0 transition-transform duration-[800ms] ease-out">
            <div className="absolute top-0 left-0 w-full h-1.5 bg-[var(--accent-grad)]" />
            <div className="flex justify-between items-start mb-8">
              <div>
                <div className="h-6 w-48 bg-[var(--bg-elevated)] rounded-md mb-2 skeleton" />
                <div className="h-4 w-32 bg-[var(--bg-elevated)] rounded-md skeleton" />
              </div>
              <div className="w-12 h-12 rounded-full border-[3px] border-[var(--score-high)] flex items-center justify-center font-mono font-bold text-[var(--score-high)] text-sm">
                98
              </div>
            </div>
            <div className="space-y-4">
              {[1, 2, 3].map((i) => (
                <div key={i} className="flex gap-4">
                  <div className="w-2 h-2 rounded-full bg-[var(--accent)] mt-2" />
                  <div className="flex-1 space-y-2">
                    <div className="h-4 w-full bg-[var(--bg-elevated)] rounded-md skeleton" />
                    <div className="h-4 w-5/6 bg-[var(--bg-elevated)] rounded-md skeleton" />
                  </div>
                </div>
              ))}
            </div>
            {/* Floating optimization chip */}
            <motion.div 
              animate={{ y: [0, -10, 0] }}
              transition={{ repeat: Infinity, duration: 3, ease: "easeInOut" }}
              className="absolute bottom-6 right-6 bg-white dark:bg-[#1A1A24] px-4 py-2 rounded-full shadow-[var(--shadow-lg)] border border-[var(--border)] flex items-center gap-2 text-sm font-semibold"
            >
              <Sparkles size={16} className="text-[var(--accent)]" />
              <span>ATS Optimized</span>
            </motion.div>
          </div>
        </motion.div>
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
    </main>
  );
}
