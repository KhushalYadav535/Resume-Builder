"use client";

import React, { useState } from "react";
import { Check, Star, Zap, Briefcase, Sparkles, ShieldCheck, TrendingUp } from "lucide-react";
import Script from "next/script";
import { createClient } from "@/utils/supabase/client";
import { useRouter } from "next/navigation";

export default function PricingSection({ showCards = true }: { showCards?: boolean }) {
  const [isProcessing, setIsProcessing] = useState(false);
  const router = useRouter();
  const supabase = createClient();

  const handlePayment = async (amount: number, description: string, tier: string = "free", credits: number = 0) => {
    setIsProcessing(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        alert("Please login or register first to purchase credits/tiers.");
        router.push("/login?redirect=/pricing");
        setIsProcessing(false);
        return;
      }

      // 1. Create order on backend
      const res = await fetch("/api/razorpay/create-order", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ amount, tier, credits }),
      });
      const order = await res.json();

      if (!order.id) throw new Error("Failed to create order");

      // 2. Initialize Razorpay
      const options = {
        key: process.env.NEXT_PUBLIC_RZP_KEY_ID || "rzp_test_TE1K7rdsiBzADQ", // Fallback for dev
        amount: order.amount,
        currency: order.currency,
        name: "UpRole",
        description: description,
        order_id: order.id,
        handler: async function (response: any) {
          // 3. Verify Payment
          const verifyRes = await fetch("/api/razorpay/verify-order", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(response),
          });
          const verifyData = await verifyRes.json();
          
          if (verifyData.success) {
            alert("Payment successful! Credits/Tier updated.");
            window.location.href = "/dashboard";
          } else {
            alert("Payment verification failed.");
          }
        },
        prefill: {
          email: user.email,
        },
        theme: {
          color: "#F59E0B",
        },
      };

      const rzp = new (window as any).Razorpay(options);
      rzp.on("payment.failed", function (response: any) {
        alert(response.error.description);
      });
      rzp.open();
    } catch (error) {
      console.error(error);
      alert("Error initiating payment");
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="w-full bg-transparent text-white pb-24 relative z-10">
      <Script src="https://checkout.razorpay.com/v1/checkout.js" strategy="lazyOnload" />
      {/* Subtle Ambient Glow */}
      <div className="absolute top-12 left-1/2 -translate-x-1/2 w-[750px] h-[350px] bg-gradient-to-r from-amber-500/[0.07] via-teal-500/[0.05] to-blue-500/[0.07] rounded-full blur-[160px] pointer-events-none" />

      {/* Header */}
      <div className="pt-20 pb-16 px-6 text-center max-w-4xl mx-auto space-y-6 relative z-10">
        {/* Eyebrow Badge */}
        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-amber-500/10 border border-amber-500/30 text-amber-300 text-xs font-mono font-bold tracking-widest uppercase shadow-sm">
          <Sparkles size={13} className="text-[#F59E0B]" />
          <span>INTENT-BASED PRICING · NO RECURRING TRAPS</span>
        </div>

        <h2 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-normal leading-[1.18] text-white font-['Playfair_Display',serif] tracking-tight">
          Always free to build your career.
          <span className="block mt-2 font-normal italic text-transparent bg-clip-text bg-gradient-to-r from-amber-300 via-amber-200 to-teal-200">
            Pay only when you&apos;re moving it forward.
          </span>
        </h2>
        
        {/* Sub-line styled as a luxury status banner */}
        <div className="inline-flex items-center justify-center gap-2.5 px-5 py-2 bg-gradient-to-r from-amber-500/15 via-[#101B3B] to-teal-500/15 border border-amber-500/30 rounded-full text-xs sm:text-sm font-bold text-amber-200 shadow-md">
          <span className="w-2 h-2 rounded-full bg-amber-400 animate-pulse" />
          <span>Free is where you build. Paid is where you sprint.</span>
        </div>

        {/* 3-Pillar Confidence Strip */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 max-w-4xl mx-auto pt-4 text-left">
          <div className="p-4 rounded-xl card-obsidian border border-white/10 flex items-start gap-3">
            <div className="w-8 h-8 rounded-lg bg-emerald-500/15 border border-emerald-500/30 text-emerald-400 flex items-center justify-center shrink-0">
              <ShieldCheck size={16} />
            </div>
            <div>
              <h4 className="text-xs font-bold text-white uppercase font-mono tracking-wider">Free for Life</h4>
              <p className="text-[12px] text-slate-300 leading-relaxed mt-0.5">
                Your Career Journal, base resume, and tracked milestones remain permanently yours. No 14-day lockouts.
              </p>
            </div>
          </div>

          <div className="p-4 rounded-xl card-obsidian border border-white/10 flex items-start gap-3">
            <div className="w-8 h-8 rounded-lg bg-amber-500/15 border border-amber-500/30 text-amber-400 flex items-center justify-center shrink-0">
              <Zap size={16} />
            </div>
            <div>
              <h4 className="text-xs font-bold text-white uppercase font-mono tracking-wider">Pay for Momentum</h4>
              <p className="text-[12px] text-slate-300 leading-relaxed mt-0.5">
                Unlock unlimited AI calibrations and ATS matching for exact sprint windows (30 or 90 days).
              </p>
            </div>
          </div>

          <div className="p-4 rounded-xl card-obsidian border border-white/10 flex items-start gap-3">
            <div className="w-8 h-8 rounded-lg bg-blue-500/15 border border-blue-500/30 text-blue-400 flex items-center justify-center shrink-0">
              <TrendingUp size={16} />
            </div>
            <div>
              <h4 className="text-xs font-bold text-white uppercase font-mono tracking-wider">Zero Auto-Renewal</h4>
              <p className="text-[12px] text-slate-300 leading-relaxed mt-0.5">
                When your search concludes, your account returns to free automatically. No hidden recurring charges.
              </p>
            </div>
          </div>
        </div>
      </div>

      {showCards && (
        <>
          {/* Main Tiers */}
          <div className="max-w-7xl mx-auto px-6 grid md:grid-cols-2 lg:grid-cols-4 gap-6 mb-24">
        
        {/* Free Tier */}
        <div className="card-obsidian rounded-2xl p-7 flex flex-col justify-between">
          <div>
            <h3 className="text-xl font-bold mb-1 text-white">Free Forever</h3>
            <p className="text-slate-400 text-xs mb-5 h-8">For passive tracking & ongoing career reflection.</p>
            <div className="text-4xl font-extrabold mb-6 text-white font-['Syne',sans-serif]">₹0</div>
            
            <ul className="space-y-3.5 mb-8 flex-1 text-xs text-slate-300">
              {["1 Targeted Resume & Export", "Unlimited Career Journal", "Passive Resume Strength Score", "100 Welcome Credits"].map((f, i) => (
                <li key={i} className="flex items-start gap-2.5">
                  <Check size={16} className="text-emerald-400 mt-0.5 shrink-0" />
                  <span>{f}</span>
                </li>
              ))}
            </ul>
          </div>
          <button className="w-full py-3 rounded-xl font-semibold border border-white/15 bg-white/5 text-slate-300 hover:bg-white/10 hover:text-white transition-colors text-xs">
            Included by Default
          </button>
        </div>

        {/* Career Sprint */}
        <div className="relative rounded-2xl p-7 flex flex-col justify-between bg-gradient-to-b from-[#16244C] to-[#0A1124] border-2 border-[#F59E0B] shadow-[0_0_50px_rgba(245,158,11,0.25)] transform md:-translate-y-3">
          <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-gradient-to-r from-[#F59E0B] to-[#FBBF24] text-slate-950 text-[11px] font-extrabold px-4 py-1 rounded-full uppercase tracking-wider shadow-md">
            Most Popular
          </div>
          <div>
            <h3 className="text-xl font-bold mb-1 text-white">Career Sprint</h3>
            <p className="text-amber-200/80 text-xs mb-5 h-8">When actively applying for leads & target roles.</p>
            <div className="flex items-end gap-2 mb-6">
              <span className="text-4xl font-extrabold text-[#F59E0B] font-['Syne',sans-serif]">₹799</span>
              <span className="text-slate-400 text-xs mb-1 font-mono">/ 30 days pass</span>
            </div>
            
            <ul className="space-y-3.5 mb-8 flex-1 text-xs text-slate-200">
              {["Unlimited AI Resume Optimizations", "Named ATS Match Calibration", "Tailored STAR Interview Scripts", "Search-Optimized LinkedIn Hooks", "High-Conversion Cover Letters"].map((f, i) => (
                <li key={i} className="flex items-start gap-2.5">
                  <Check size={16} className="text-[#F59E0B] mt-0.5 shrink-0" />
                  <span className="font-medium">{f}</span>
                </li>
              ))}
            </ul>
          </div>
          <button 
            disabled={isProcessing}
            onClick={() => handlePayment(799, "Career Sprint (30 Days)", "sprint", 0)}
            className="w-full py-3.5 rounded-xl font-extrabold text-slate-950 btn-warm-amber transition-all shadow-lg hover:scale-105 active:scale-95 disabled:opacity-50 text-xs uppercase tracking-wider"
          >
            Start 30-Day Sprint
          </button>
        </div>

        {/* Interview Pack */}
        <div className="card-obsidian rounded-2xl p-7 flex flex-col justify-between hover:border-white/30 transition-colors">
          <div>
            <h3 className="text-xl font-bold mb-1 text-white">Interview Pack</h3>
            <p className="text-slate-400 text-xs mb-5 h-8">Scheduled interview with high-stakes compensation.</p>
            <div className="flex items-end gap-2 mb-6">
              <span className="text-4xl font-extrabold text-white font-['Syne',sans-serif]">₹799</span>
              <span className="text-slate-400 text-xs mb-1 font-mono">/ one-time</span>
            </div>
            
            <ul className="space-y-3.5 mb-8 flex-1 text-xs text-slate-300">
              {["Role-Specific Resume Polish", "Executive Interview Story Prep", "Company Context & Likely Questions", "STAR Answers Verification", "Salary & Comp Negotiation Guide"].map((f, i) => (
                <li key={i} className="flex items-start gap-2.5">
                  <Check size={16} className="text-teal-400 mt-0.5 shrink-0" />
                  <span>{f}</span>
                </li>
              ))}
            </ul>
          </div>
          <button 
            disabled={isProcessing}
            onClick={() => handlePayment(799, "Interview Pack", "interview_pack", 0)}
            className="w-full py-3 rounded-xl font-semibold border border-white/20 bg-white/5 text-white hover:bg-white/10 transition-colors disabled:opacity-50 text-xs"
          >
            Get Interview Pack
          </button>
        </div>

        {/* Career Pro */}
        <div className="card-obsidian rounded-2xl p-7 flex flex-col justify-between">
          <div>
            <h3 className="text-xl font-bold mb-1 text-white">Career Pro</h3>
            <p className="text-slate-400 text-xs mb-5 h-8">Running a multi-role, multi-country search cycle.</p>
            <div className="flex items-end gap-2 mb-6">
              <span className="text-4xl font-extrabold text-white font-['Syne',sans-serif]">₹1,499</span>
              <span className="text-slate-400 text-xs mb-1 font-mono">/ 90 days</span>
            </div>
            
            <ul className="space-y-3.5 mb-8 flex-1 text-xs text-slate-300">
              <li className="flex items-start gap-2.5 text-[#F59E0B] font-bold">
                <Check size={16} className="text-[#F59E0B] mt-0.5 shrink-0" />
                <span>Everything in Sprint, plus:</span>
              </li>
              {["Multiple Tailored Resume Profiles", "Priority AI Processing Queue", "Recruiter Search Index Scoring", "Direct Career Strategy Roadmap"].map((f, i) => (
                <li key={i} className="flex items-start gap-2.5">
                  <Check size={16} className="text-emerald-400 mt-0.5 shrink-0" />
                  <span>{f}</span>
                </li>
              ))}
            </ul>
          </div>
          <button 
            disabled={isProcessing}
            onClick={() => handlePayment(1499, "Career Pro (90 Days)", "pro", 0)}
            className="w-full py-3 rounded-xl font-semibold border border-white/20 bg-white/5 text-white hover:bg-white/10 transition-colors disabled:opacity-50 text-xs"
          >
            Go Career Pro (90d)
          </button>
        </div>
      </div>

      {/* Credit Top Ups */}
      <div className="max-w-4xl mx-auto px-6" id="topup">
        <div className="text-center mb-10">
          <h3 className="text-2xl font-bold mb-2 text-white font-['Syne',sans-serif]">Need quick on-demand momentum?</h3>
          <p className="text-xs text-slate-400">
            Use credits for micro-actions between career sprints. (AI Edit = 10cr, ATS Check = 15cr, Cover Letter = 20cr)
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-6">
          {/* Starter */}
          <div onClick={() => handlePayment(99, "Starter Pack (100 Credits)", "free", 100)} className="card-obsidian rounded-xl p-6 text-center hover:border-[#F59E0B]/50 transition-all cursor-pointer group">
            <div className="w-12 h-12 bg-white/5 rounded-full flex items-center justify-center mx-auto mb-3 group-hover:bg-[#F59E0B]/15 transition-colors">
              <Zap size={20} className="text-[#F59E0B]" />
            </div>
            <h4 className="font-bold text-sm mb-1 text-white">Starter Pack</h4>
            <div className="text-2xl font-extrabold text-[#F59E0B] mb-2 font-['Syne',sans-serif]">100 <span className="text-xs font-normal text-slate-400">Credits</span></div>
            <div className="font-semibold text-sm text-slate-200">₹99</div>
            <div className="text-[10px] text-slate-400 font-mono">₹0.99 / credit</div>
          </div>

          {/* Booster */}
          <div onClick={() => handlePayment(249, "Booster Pack (300 Credits)", "free", 300)} className="card-obsidian rounded-xl p-6 text-center hover:border-[#F59E0B]/50 transition-all cursor-pointer group relative overflow-hidden">
            <div className="absolute top-3 right-3 text-[10px] font-bold bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 px-2 py-0.5 rounded">16% OFF</div>
            <div className="w-12 h-12 bg-white/5 rounded-full flex items-center justify-center mx-auto mb-3 group-hover:bg-[#F59E0B]/15 transition-colors">
              <Star size={20} className="text-[#F59E0B]" />
            </div>
            <h4 className="font-bold text-sm mb-1 text-white">Booster Pack</h4>
            <div className="text-2xl font-extrabold text-[#F59E0B] mb-2 font-['Syne',sans-serif]">300 <span className="text-xs font-normal text-slate-400">Credits</span></div>
            <div className="font-semibold text-sm text-slate-200">₹249</div>
            <div className="text-[10px] text-slate-400 font-mono">₹0.83 / credit</div>
          </div>

          {/* Power */}
          <div onClick={() => handlePayment(499, "Power Pack (750 Credits)", "free", 750)} className="card-obsidian rounded-xl p-6 text-center hover:border-[#F59E0B]/50 transition-all cursor-pointer group relative overflow-hidden">
            <div className="absolute top-3 right-3 text-[10px] font-bold bg-amber-500/20 text-amber-300 border border-amber-500/30 px-2 py-0.5 rounded">33% OFF</div>
            <div className="w-12 h-12 bg-white/5 rounded-full flex items-center justify-center mx-auto mb-3 group-hover:bg-[#F59E0B]/15 transition-colors">
              <Briefcase size={20} className="text-[#F59E0B]" />
            </div>
            <h4 className="font-bold text-sm mb-1 text-white">Power Pack</h4>
            <div className="text-2xl font-extrabold text-[#F59E0B] mb-2 font-['Syne',sans-serif]">750 <span className="text-xs font-normal text-slate-400">Credits</span></div>
            <div className="font-semibold text-sm text-slate-200">₹499</div>
            <div className="text-[10px] text-slate-400 font-mono">₹0.66 / credit</div>
          </div>
        </div>
      </div>
        </>
      )}
    </div>
  );
}
