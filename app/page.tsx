"use client";

import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { useAuth } from "@/hooks/useAuth";
import QuickScanModal from "@/components/QuickScanModal";
import {
  ArrowRight,
  Play,
  FileText,
  BarChart2,
  Sliders,
  Star,
  Target,
  Sparkles,
  TrendingUp,
  Compass,
  Menu,
  X,
} from "lucide-react";
import UpRoleLogo from "@/components/UpRoleLogo";
import Footer from "@/components/Footer";

/** Hand-drawn curved orange brush stroke matching the reference design */
function OrangeBrushStroke({ className = "w-16 h-2.5" }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 100 12"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      aria-hidden="true"
    >
      <path
        d="M2 7C24 2.5 74 2 98 6C70 8.5 28 10 3 8"
        stroke="#EB5A28"
        strokeWidth="3.2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

export default function Home() {
  const { user } = useAuth();
  const router = useRouter();
  const [isQuickScanOpen, setIsQuickScanOpen] = useState(false);
  const [mobileNavOpen, setMobileNavOpen] = useState(false);

  const handlePrimaryCta = () => {
    if (user) {
      router.push("/career-copilot");
    } else {
      setIsQuickScanOpen(true);
    }
  };

  return (
    <main className="min-h-screen bg-[#FAF9F6] text-[#111827] flex flex-col font-sans selection:bg-[#EB5A28] selection:text-white">
      
      {/* ════════════════════════════════════════════════════════════════
          CANONICAL NAVBAR (Exact Match to Reference Screenshot)
          ════════════════════════════════════════════════════════════════ */}
      <header className="sticky top-0 z-50 bg-[#FAF9F6]/95 backdrop-blur-md border-b border-gray-200/70 transition-all">
        <div className="max-w-7xl mx-auto px-6 sm:px-8 h-20 flex items-center justify-between">
          
          {/* Canonical Brand Logo */}
          <UpRoleLogo href="/" size="md" variant="light" />

          {/* Desktop Navigation Links */}
          <nav className="hidden lg:flex items-center gap-8 text-[14.5px] font-medium text-[#4B5563]">
            <a href="#beyond-the-resume" className="hover:text-[#111827] transition-colors">
              Why UpRole
            </a>
            <a href="#career-intelligence" className="hover:text-[#111827] transition-colors">
              Career Intelligence
            </a>
            <a href="#real-journeys" className="hover:text-[#111827] transition-colors">
              For Your Next Move
            </a>
            <a href="#how-it-works" className="hover:text-[#111827] transition-colors">
              Insights
            </a>
            <a href="#footer" className="hover:text-[#111827] transition-colors">
              About
            </a>
          </nav>

          {/* Right Action Buttons */}
          <div className="hidden sm:flex items-center gap-5">
            <Link
              href={user ? "/dashboard" : "/login"}
              className="text-[14.5px] font-semibold text-[#111827] hover:text-[#EB5A28] transition-colors"
            >
              {user ? "Dashboard" : "Sign In"}
            </Link>

            <button
              type="button"
              onClick={handlePrimaryCta}
              className="px-5 py-2.5 rounded-lg bg-[#EB5A28] hover:bg-[#D94B1B] text-white font-semibold text-[14px] transition-all shadow-sm hover:shadow flex items-center gap-2 cursor-pointer active:scale-[0.98]"
            >
              <span>Get Started</span>
              <ArrowRight size={15} />
            </button>
          </div>

          {/* Mobile Menu Toggle Button */}
          <button
            type="button"
            onClick={() => setMobileNavOpen(!mobileNavOpen)}
            className="lg:hidden p-2 text-[#111827] hover:text-[#EB5A28] focus:outline-none"
            aria-label="Toggle Navigation Menu"
          >
            {mobileNavOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>

        {/* Mobile Dropdown Menu */}
        {mobileNavOpen && (
          <div className="lg:hidden bg-[#FAF9F6] border-b border-gray-200 px-6 py-6 space-y-4 animate-in slide-in-from-top-2 duration-200">
            <nav className="flex flex-col space-y-3 text-[15px] font-medium text-[#4B5563]">
              <a
                href="#beyond-the-resume"
                onClick={() => setMobileNavOpen(false)}
                className="hover:text-[#EB5A28] py-1"
              >
                Why UpRole
              </a>
              <a
                href="#career-intelligence"
                onClick={() => setMobileNavOpen(false)}
                className="hover:text-[#EB5A28] py-1"
              >
                Career Intelligence
              </a>
              <a
                href="#real-journeys"
                onClick={() => setMobileNavOpen(false)}
                className="hover:text-[#EB5A28] py-1"
              >
                For Your Next Move
              </a>
              <a
                href="#how-it-works"
                onClick={() => setMobileNavOpen(false)}
                className="hover:text-[#EB5A28] py-1"
              >
                Insights
              </a>
              <a
                href="#footer"
                onClick={() => setMobileNavOpen(false)}
                className="hover:text-[#EB5A28] py-1"
              >
                About
              </a>
            </nav>

            <div className="pt-4 border-t border-gray-200/80 flex flex-col gap-3">
              <Link
                href={user ? "/dashboard" : "/login"}
                onClick={() => setMobileNavOpen(false)}
                className="text-center py-2.5 text-[14px] font-semibold text-[#111827] border border-gray-300 rounded-lg"
              >
                {user ? "Dashboard" : "Sign In"}
              </Link>
              <button
                type="button"
                onClick={() => {
                  setMobileNavOpen(false);
                  handlePrimaryCta();
                }}
                className="w-full py-3 rounded-lg bg-[#EB5A28] text-white font-semibold text-[14px] flex items-center justify-center gap-2"
              >
                <span>Get Started</span>
                <ArrowRight size={15} />
              </button>
            </div>
          </div>
        )}
      </header>

      {/* ════════════════════════════════════════════════════════════════
          SECTION 1: HERO SECTION (Exact Match to WhatsApp Reference Image)
          ════════════════════════════════════════════════════════════════ */}
      <section className="relative overflow-hidden pt-8 pb-16 lg:pt-14 lg:pb-24">
        <div className="max-w-7xl mx-auto px-6 sm:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-8 items-center">
            
            {/* Left Column: Editorial Headline & Actions */}
            <div className="lg:col-span-6 z-10 space-y-6 max-w-xl">
              <div>
                <span className="text-[11px] sm:text-xs font-bold uppercase tracking-[2.2px] text-[#4B5563] block">
                  Your Career Matters.
                </span>
              </div>

              <h1 className="text-5xl sm:text-6xl lg:text-[68px] font-normal leading-[1.08] text-[#111827] tracking-tight font-['Playfair_Display',Georgia,serif]">
                Your career has<br />
                more value<br />
                than you think<span className="text-[#EB5A28]">.</span>
              </h1>

              <p className="text-base sm:text-[17px] text-[#4B5563] leading-relaxed max-w-lg font-sans">
                UpRole helps you understand the experience, impact and capabilities you&apos;ve built — and turn them into your next career opportunity.
              </p>

              {/* Action Buttons */}
              <div className="pt-2 flex flex-wrap items-center gap-4">
                <button
                  type="button"
                  onClick={handlePrimaryCta}
                  className="px-6 py-3.5 rounded-lg bg-[#EB5A28] hover:bg-[#D94B1B] text-white font-semibold text-[15px] transition-all shadow-md hover:shadow-lg flex items-center gap-2 group cursor-pointer active:scale-[0.99]"
                >
                  <span>Discover Your Career Value</span>
                  <ArrowRight size={16} className="transition-transform group-hover:translate-x-1" />
                </button>

                <button
                  type="button"
                  onClick={() => {
                    const el = document.getElementById("how-it-works");
                    el?.scrollIntoView({ behavior: "smooth" });
                  }}
                  className="px-4 py-3.5 text-[15px] font-semibold text-[#111827] hover:text-[#EB5A28] transition-colors flex items-center gap-2 group cursor-pointer"
                >
                  <span>Explore UpRole</span>
                  <div className="w-6 h-6 rounded-full border border-[#111827]/40 flex items-center justify-center group-hover:border-[#EB5A28] transition-colors">
                    <Play size={10} className="fill-current ml-0.5 text-[#111827] group-hover:text-[#EB5A28]" />
                  </div>
                </button>
              </div>

              {/* Micro Footnote */}
              <div className="text-xs text-[#6B7280] pt-1">
                Free career assessment · Takes about 2 minutes
              </div>
            </div>

            {/* Right Column: Hero HD Photography & Editorial Floating Badges */}
            <div className="lg:col-span-6 relative">
              {/* Floating Top-Right Editorial Badge */}
              <div className="hidden sm:block absolute -top-3 right-4 z-20 max-w-[210px] text-right">
                <p className="text-[11px] font-extrabold uppercase tracking-[1.6px] text-[#111827] leading-tight">
                  Greater opportunities begin with greater clarity.
                </p>
                <OrangeBrushStroke className="w-16 h-2 ml-auto mt-1.5" />
              </div>

              {/* Hero Image Container */}
              <div className="relative w-full h-[480px] sm:h-[560px] lg:h-[620px] overflow-hidden rounded-2xl sm:rounded-none">
                <Image
                  src="/01_hero_woman.jpg"
                  alt="UpRole Professional Career Value"
                  fill
                  priority
                  className="object-cover object-center sm:object-top"
                />
                {/* Subtle bottom gradient to blend seamlessly */}
                <div className="absolute inset-x-0 bottom-0 h-28 bg-gradient-to-t from-[#FAF9F6] via-[#FAF9F6]/30 to-transparent" />
              </div>

              {/* Floating Bottom-Right Keywords */}
              <div className="absolute bottom-6 right-6 z-20 text-right space-y-1 text-[11px] font-extrabold tracking-[2.5px] text-[#111827] drop-shadow-sm">
                <div>PEOPLE</div>
                <div>POTENTIAL</div>
                <div>PROGRESS</div>
              </div>
            </div>

          </div>
        </div>
      </section>

      {/* ════════════════════════════════════════════════════════════════
          SECTION 2: BEYOND THE RESUME (5-Step Connected Value Chain)
          ════════════════════════════════════════════════════════════════ */}
      <section id="beyond-the-resume" className="bg-white border-y border-gray-200/80 py-16 lg:py-20">
        <div className="max-w-7xl mx-auto px-6 sm:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-10 items-center">
            
            {/* Left: Headline & Narrative */}
            <div className="lg:col-span-5 space-y-4">
              <span className="text-[11px] font-bold uppercase tracking-[2px] text-[#6B7280]">
                Beyond the Resume
              </span>
              <h2 className="text-3xl sm:text-4xl lg:text-[42px] font-normal text-[#111827] font-['Playfair_Display',Georgia,serif] leading-[1.15]">
                A career is more than a document.
              </h2>
              <p className="text-[15px] text-[#4B5563] leading-relaxed">
                It&apos;s a story of the problems you&apos;ve solved, the impact you&apos;ve created, the capabilities you&apos;ve built and the responsibilities you&apos;ve earned. UpRole helps you see the full picture — and turn it into what&apos;s next.
              </p>
              <div className="pt-2">
                <Link
                  href="/resume/builder?new=true"
                  className="inline-flex items-center gap-1.5 text-[14px] font-semibold text-[#EB5A28] hover:underline"
                >
                  <span>See how it works</span>
                  <ArrowRight size={14} />
                </Link>
              </div>
            </div>

            {/* Right: 5-Step Value Chain with Horizontal Connecting Arrows */}
            <div className="lg:col-span-7 overflow-x-auto pb-4 lg:pb-0 scrollbar-none">
              <div className="flex items-center justify-between min-w-[560px] gap-2">
                
                {/* Step 1: Experience */}
                <div className="flex flex-col items-center text-center space-y-2 flex-1">
                  <div className="w-14 h-14 rounded-full bg-[#EBF3FF] border border-[#BFDBFE] flex items-center justify-center text-[#2563EB] shadow-sm">
                    <FileText size={22} />
                  </div>
                  <div>
                    <h4 className="text-sm font-bold text-[#111827]">Experience</h4>
                    <p className="text-[11px] text-[#6B7280]">What you&apos;ve done</p>
                  </div>
                </div>

                <ArrowRight size={16} className="text-gray-300 shrink-0 mb-5" />

                {/* Step 2: Impact */}
                <div className="flex flex-col items-center text-center space-y-2 flex-1">
                  <div className="w-14 h-14 rounded-full bg-[#ECFDF5] border border-[#A7F3D0] flex items-center justify-center text-[#10B981] shadow-sm">
                    <BarChart2 size={22} />
                  </div>
                  <div>
                    <h4 className="text-sm font-bold text-[#111827]">Impact</h4>
                    <p className="text-[11px] text-[#6B7280]">What you&apos;ve created</p>
                  </div>
                </div>

                <ArrowRight size={16} className="text-gray-300 shrink-0 mb-5" />

                {/* Step 3: Capability */}
                <div className="flex flex-col items-center text-center space-y-2 flex-1">
                  <div className="w-14 h-14 rounded-full bg-[#FEF3C7] border border-[#FDE68A] flex items-center justify-center text-[#D97706] shadow-sm">
                    <Sliders size={22} />
                  </div>
                  <div>
                    <h4 className="text-sm font-bold text-[#111827]">Capability</h4>
                    <p className="text-[11px] text-[#6B7280]">What you can do</p>
                  </div>
                </div>

                <ArrowRight size={16} className="text-gray-300 shrink-0 mb-5" />

                {/* Step 4: Career Value */}
                <div className="flex flex-col items-center text-center space-y-2 flex-1">
                  <div className="w-14 h-14 rounded-full bg-[#E0E7FF] border border-[#C7D2FE] flex items-center justify-center text-[#4F46E5] shadow-sm">
                    <Star size={22} />
                  </div>
                  <div>
                    <h4 className="text-sm font-bold text-[#111827]">Career Value</h4>
                    <p className="text-[11px] text-[#6B7280]">What you bring</p>
                  </div>
                </div>

                <ArrowRight size={16} className="text-gray-300 shrink-0 mb-5" />

                {/* Step 5: Opportunity */}
                <div className="flex flex-col items-center text-center space-y-2 flex-1">
                  <div className="w-14 h-14 rounded-full bg-[#FEE2E2] border border-[#FECACA] flex items-center justify-center text-[#DC2626] shadow-sm">
                    <Target size={22} />
                  </div>
                  <div>
                    <h4 className="text-sm font-bold text-[#111827]">Opportunity</h4>
                    <p className="text-[11px] text-[#6B7280]">What&apos;s next for you</p>
                  </div>
                </div>

              </div>
            </div>

          </div>
        </div>
      </section>

      {/* ════════════════════════════════════════════════════════════════
          SECTION 3: CAREER INTELLIGENCE (DARK NAVY THEME - Exact Screenshot Match)
          ════════════════════════════════════════════════════════════════ */}
      <section id="career-intelligence" className="bg-[#0B1320] text-white py-20 lg:py-24 border-y border-[#1E2E45]/60 relative overflow-hidden">
        {/* Subtle deep ambient glow */}
        <div className="absolute top-0 right-1/4 w-96 h-96 bg-blue-900/10 rounded-full blur-3xl pointer-events-none" />
        
        <div className="max-w-7xl mx-auto px-6 sm:px-8 relative z-10">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
            
            {/* Left Column: Heading & Narrative */}
            <div className="lg:col-span-5 space-y-5">
              <span className="text-[11px] font-bold uppercase tracking-[2px] text-[#94A3B8] block">
                Career Intelligence
              </span>
              <h2 className="text-3xl sm:text-4xl lg:text-[44px] font-normal font-['Playfair_Display',Georgia,serif] leading-[1.15] text-white">
                Understand where<br />
                you stand.<br />
                Know where you can go.
              </h2>
              <p className="text-[15px] text-[#94A3B8] leading-relaxed pt-1 max-w-md">
                UpRole analyses your career journey, highlights your unique value, compares it with market opportunities and gives you personalized guidance for your next move.
              </p>
              <div className="pt-3">
                <button
                  type="button"
                  onClick={handlePrimaryCta}
                  className="px-6 py-3.5 rounded-full bg-[#EB5A28] hover:bg-[#D94B1B] text-white font-semibold text-[14px] transition-all inline-flex items-center gap-2 cursor-pointer shadow-lg hover:shadow-orange-500/25 active:scale-[0.98]"
                >
                  <span>See a Sample Analysis</span>
                  <ArrowRight size={15} />
                </button>
              </div>
            </div>

            {/* Center Column: Your Career Value Snapshot (Dark Glass Card) */}
            <div className="lg:col-span-4">
              <div className="rounded-2xl bg-[#101D30]/95 border border-[#1F334E] p-6 sm:p-7 shadow-2xl space-y-4 backdrop-blur-md">
                <h3 className="text-base font-bold text-white border-b border-[#1F334E] pb-3 font-sans">
                  Your Career Value Snapshot
                </h3>

                <div className="space-y-3 pt-1">
                  {/* Row 1: Key Strengths */}
                  <div className="flex items-start gap-3.5 p-3 rounded-xl bg-[#16273F]/90 border border-[#233B5D]/40">
                    <div className="w-8 h-8 rounded-lg bg-[#1D3557] text-[#60A5FA] flex items-center justify-center shrink-0 mt-0.5">
                      <Sparkles size={16} />
                    </div>
                    <div>
                      <span className="text-[11px] text-[#94A3B8] font-medium block">
                        Key Strengths
                      </span>
                      <p className="text-[13px] font-semibold text-white mt-0.5">
                        Strategic planning, Team leadership, Revenue growth
                      </p>
                    </div>
                  </div>

                  {/* Row 2: Market Value */}
                  <div className="flex items-start gap-3.5 p-3 rounded-xl bg-[#16273F]/90 border border-[#233B5D]/40">
                    <div className="w-8 h-8 rounded-lg bg-[#382618] text-[#F97316] flex items-center justify-center shrink-0 mt-0.5">
                      <TrendingUp size={16} />
                    </div>
                    <div>
                      <span className="text-[11px] text-[#94A3B8] font-medium block">
                        Market Value
                      </span>
                      <p className="text-[14px] font-bold text-white mt-0.5">
                        ₹ 25–32 LPA <span className="text-[#94A3B8] text-xs font-normal">(Bangalore)</span>
                      </p>
                    </div>
                  </div>

                  {/* Row 3: Opportunity Gap */}
                  <div className="flex items-start gap-3.5 p-3 rounded-xl bg-[#16273F]/90 border border-[#233B5D]/40">
                    <div className="w-8 h-8 rounded-lg bg-[#133333] text-[#2DD4BF] flex items-center justify-center shrink-0 mt-0.5">
                      <Target size={16} />
                    </div>
                    <div>
                      <span className="text-[11px] text-[#94A3B8] font-medium block">
                        Opportunity Gap
                      </span>
                      <p className="text-[13px] font-semibold text-white mt-0.5">
                        Strategic regional planning
                      </p>
                    </div>
                  </div>

                  {/* Row 4: Recommended Next Move */}
                  <div className="flex items-start gap-3.5 p-3 rounded-xl bg-[#16273F]/90 border border-[#233B5D]/40">
                    <div className="w-8 h-8 rounded-lg bg-[#143528] text-[#34D399] flex items-center justify-center shrink-0 mt-0.5">
                      <Compass size={16} />
                    </div>
                    <div>
                      <span className="text-[11px] text-[#94A3B8] font-medium block">
                        Recommended Next Move
                      </span>
                      <p className="text-[13px] font-bold text-white mt-0.5">
                        Regional Sales Manager
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Right Column: Editorial Script & Vertical Keywords */}
            <div className="lg:col-span-3 flex flex-col justify-between h-full space-y-10 pl-0 lg:pl-4">
              <div>
                <p className="text-3xl sm:text-4xl font-['Caveat',cursive] text-white leading-snug -rotate-1">
                  Same experience.<br />
                  A brighter<br />
                  future.
                </p>
                <OrangeBrushStroke className="w-20 h-2.5 mt-2" />
              </div>

              <div className="space-y-2 text-[12px] font-bold tracking-[2.5px] text-[#94A3B8] uppercase">
                <div>CLARITY</div>
                <div>CONFIDENCE</div>
                <div>CAREER GROWTH</div>
              </div>
            </div>

          </div>
        </div>
      </section>

      {/* ════════════════════════════════════════════════════════════════
          SECTION 4: BUILT FOR REAL JOURNEYS (4 Persona Cards)
          ════════════════════════════════════════════════════════════════ */}
      <section id="real-journeys" className="py-20 lg:py-24 bg-[#FAF9F6]">
        <div className="max-w-7xl mx-auto px-6 sm:px-8">
          {/* Section Header */}
          <div className="space-y-2 mb-12">
            <span className="text-[11px] font-bold uppercase tracking-[2px] text-[#6B7280]">
              Built for Real Journeys
            </span>
            <h2 className="text-3xl sm:text-4xl lg:text-[42px] font-normal text-[#111827] font-['Playfair_Display',Georgia,serif]">
              Wherever you are in your career, UpRole is with you.
            </h2>
          </div>

          {/* 4 Cards Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            
            {/* Card 1: Students & Fresh Graduates */}
            <div className="bg-white rounded-xl border border-gray-200/80 overflow-hidden shadow-sm hover:shadow-md transition-shadow flex flex-col justify-between">
              <div>
                <div className="relative w-full h-44 overflow-hidden">
                  <Image
                    src="/02_student_fresh_graduate.jpg"
                    alt="Students & Fresh Graduates"
                    fill
                    className="object-cover"
                  />
                </div>
                <div className="p-5 space-y-2">
                  <h3 className="text-[17px] font-bold text-[#111827]">
                    Students &amp; Fresh Graduates
                  </h3>
                  <p className="text-[13.5px] text-[#4B5563] leading-relaxed">
                    Start strong with a standout resume and clear direction.
                  </p>
                </div>
              </div>
              <div className="p-5 pt-0">
                <Link
                  href="/resume/builder?new=true"
                  className="inline-flex items-center gap-1 text-xs font-bold text-[#EB5A28] hover:underline"
                >
                  <span>Learn more</span>
                  <ArrowRight size={12} />
                </Link>
              </div>
            </div>

            {/* Card 2: Working Professionals */}
            <div className="bg-white rounded-xl border border-gray-200/80 overflow-hidden shadow-sm hover:shadow-md transition-shadow flex flex-col justify-between">
              <div>
                <div className="relative w-full h-44 overflow-hidden">
                  <Image
                    src="/03_working_professional.jpg"
                    alt="Working Professionals"
                    fill
                    className="object-cover"
                  />
                </div>
                <div className="p-5 space-y-2">
                  <h3 className="text-[17px] font-bold text-[#111827]">
                    Working Professionals
                  </h3>
                  <p className="text-[13.5px] text-[#4B5563] leading-relaxed">
                    Get shortlisted, switch roles and grow your salary.
                  </p>
                </div>
              </div>
              <div className="p-5 pt-0">
                <Link
                  href="/career-copilot"
                  className="inline-flex items-center gap-1 text-xs font-bold text-[#EB5A28] hover:underline"
                >
                  <span>Learn more</span>
                  <ArrowRight size={12} />
                </Link>
              </div>
            </div>

            {/* Card 3: Career Switchers */}
            <div className="bg-white rounded-xl border border-gray-200/80 overflow-hidden shadow-sm hover:shadow-md transition-shadow flex flex-col justify-between">
              <div>
                <div className="relative w-full h-44 overflow-hidden">
                  <Image
                    src="/04_career_switcher.jpg"
                    alt="Career Switchers"
                    fill
                    className="object-cover"
                  />
                </div>
                <div className="p-5 space-y-2">
                  <h3 className="text-[17px] font-bold text-[#111827]">
                    Career Switchers
                  </h3>
                  <p className="text-[13.5px] text-[#4B5563] leading-relaxed">
                    Position your transferable skills with confidence.
                  </p>
                </div>
              </div>
              <div className="p-5 pt-0">
                <Link
                  href="/resume/tailor"
                  className="inline-flex items-center gap-1 text-xs font-bold text-[#EB5A28] hover:underline"
                >
                  <span>Learn more</span>
                  <ArrowRight size={12} />
                </Link>
              </div>
            </div>

            {/* Card 4: Senior Professionals */}
            <div className="bg-white rounded-xl border border-gray-200/80 overflow-hidden shadow-sm hover:shadow-md transition-shadow flex flex-col justify-between">
              <div>
                <div className="relative w-full h-44 overflow-hidden">
                  <Image
                    src="/05_senior_professional.jpg"
                    alt="Senior Professionals"
                    fill
                    className="object-cover"
                  />
                </div>
                <div className="p-5 space-y-2">
                  <h3 className="text-[17px] font-bold text-[#111827]">
                    Senior Professionals
                  </h3>
                  <p className="text-[13.5px] text-[#4B5563] leading-relaxed">
                    Strengthen your leadership profile and explore new horizons.
                  </p>
                </div>
              </div>
              <div className="p-5 pt-0">
                <Link
                  href="/career-copilot"
                  className="inline-flex items-center gap-1 text-xs font-bold text-[#EB5A28] hover:underline"
                >
                  <span>Learn more</span>
                  <ArrowRight size={12} />
                </Link>
              </div>
            </div>

          </div>
        </div>
      </section>

      {/* ════════════════════════════════════════════════════════════════
          SECTION 5: HOW UPROLE WORKS (From insight to opportunity)
          ════════════════════════════════════════════════════════════════ */}
      <section id="how-it-works" className="bg-white border-y border-gray-200/80 py-16 lg:py-20">
        <div className="max-w-7xl mx-auto px-6 sm:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-center">
            
            {/* Left: Title */}
            <div className="lg:col-span-4 space-y-2">
              <span className="text-[11px] font-bold uppercase tracking-[2px] text-[#6B7280]">
                How UpRole Works
              </span>
              <h2 className="text-3xl sm:text-4xl lg:text-[40px] font-normal text-[#111827] font-['Playfair_Display',Georgia,serif] leading-tight">
                From insight<br />
                to opportunity.
              </h2>
            </div>

            {/* Right: 3 Steps Sequential Layout */}
            <div className="lg:col-span-8">
              <div className="flex flex-col sm:flex-row items-start sm:items-baseline justify-between gap-8 sm:gap-6">
                
                {/* Step 01 */}
                <div className="flex-1 space-y-1.5">
                  <span className="text-xl sm:text-2xl font-bold text-[#EB5A28] block">01</span>
                  <h3 className="text-lg font-bold text-[#111827] font-['Playfair_Display',Georgia,serif]">Discover</h3>
                  <p className="text-xs sm:text-[13.5px] text-[#4B5563] leading-relaxed">
                    Understand the value you&apos;ve already created.
                  </p>
                </div>

                <div className="hidden sm:block text-gray-300 text-xl shrink-0">→</div>

                {/* Step 02 */}
                <div className="flex-1 space-y-1.5">
                  <span className="text-xl sm:text-2xl font-bold text-[#EB5A28] block">02</span>
                  <h3 className="text-lg font-bold text-[#111827] font-['Playfair_Display',Georgia,serif]">Position</h3>
                  <p className="text-xs sm:text-[13.5px] text-[#4B5563] leading-relaxed">
                    Communicate that value with confidence.
                  </p>
                </div>

                <div className="hidden sm:block text-gray-300 text-xl shrink-0">→</div>

                {/* Step 03 */}
                <div className="flex-1 space-y-1.5">
                  <span className="text-xl sm:text-2xl font-bold text-[#EB5A28] block">03</span>
                  <h3 className="text-lg font-bold text-[#111827] font-['Playfair_Display',Georgia,serif]">Advance</h3>
                  <p className="text-xs sm:text-[13.5px] text-[#4B5563] leading-relaxed">
                    Take the actions that move your career forward.
                  </p>
                </div>

              </div>
            </div>

          </div>
        </div>
      </section>

      {/* ════════════════════════════════════════════════════════════════
          SECTION 6: HIGHER CAREERS AHEAD (FULL-WIDTH CINEMATIC BANNER)
          ════════════════════════════════════════════════════════════════ */}
      <section id="next-move" className="relative min-h-[460px] sm:min-h-[520px] lg:min-h-[560px] flex items-center overflow-hidden">
        {/* Full-width Panoramic Mountain Background */}
        <div className="absolute inset-0 z-0">
          <Image
            src="/06_mountain_career_journey.jpg"
            alt="UpRole — Higher Careers Ahead"
            fill
            priority
            className="object-cover object-center"
          />
          {/* Left-to-right dark contrast gradient for crisp typography */}
          <div className="absolute inset-0 bg-gradient-to-r from-[#070D18]/90 via-[#070D18]/60 to-transparent sm:via-[#070D18]/45" />
          {/* Subtle top and bottom border shadows */}
          <div className="absolute inset-x-0 top-0 h-16 bg-gradient-to-b from-black/40 to-transparent" />
          <div className="absolute inset-x-0 bottom-0 h-16 bg-gradient-to-t from-black/50 to-transparent" />
        </div>

        {/* Content Container */}
        <div className="relative z-10 max-w-7xl mx-auto px-6 sm:px-8 py-16 w-full">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-center">
            
            {/* Left Column: Heading & Call to Action */}
            <div className="lg:col-span-7 space-y-5 text-white max-w-xl">
              <span className="text-[11px] font-bold uppercase tracking-[2.5px] text-[#E5E7EB] block drop-shadow-sm">
                Higher Careers Ahead
              </span>
              <h2 className="text-4xl sm:text-5xl lg:text-[56px] font-normal font-['Playfair_Display',Georgia,serif] leading-[1.1] drop-shadow-md">
                What&apos;s your next move?
              </h2>
              <p className="text-base sm:text-lg text-[#F3F4F6] leading-relaxed max-w-md drop-shadow">
                Your career doesn&apos;t stand still.<br />
                Neither should your understanding of it.
              </p>
              <div className="pt-3">
                <button
                  type="button"
                  onClick={handlePrimaryCta}
                  className="px-7 py-3.5 rounded-full bg-[#EB5A28] hover:bg-[#D94B1B] text-white font-semibold text-[15px] transition-all shadow-xl hover:shadow-orange-500/30 flex items-center gap-2 group cursor-pointer active:scale-[0.99]"
                >
                  <span>Discover Your Career Value</span>
                  <ArrowRight size={16} className="transition-transform group-hover:translate-x-1" />
                </button>
              </div>
            </div>

            {/* Right Column: Editorial Stacked Keywords */}
            <div className="lg:col-span-5 flex flex-col justify-center items-start lg:items-end text-left lg:text-right space-y-2">
              <div className="text-[12px] sm:text-[13px] font-extrabold tracking-[2.5px] text-white uppercase space-y-2 drop-shadow-lg">
                <div>Bigger Roles</div>
                <div>Higher Impact</div>
                <div>A More Fulfilling You</div>
              </div>
              <OrangeBrushStroke className="w-20 h-2.5 mt-1 lg:ml-auto" />
            </div>

          </div>
        </div>
      </section>

      {/* Unified Master Brand Footer */}
      <Footer />

      {/* QuickScan / Assessment Modal */}
      <QuickScanModal isOpen={isQuickScanOpen} onClose={() => setIsQuickScanOpen(false)} />
    </main>
  );
}
