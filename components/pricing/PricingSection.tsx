"use client";

import React, { useState } from "react";
import { Check, Star, Zap, Briefcase } from "lucide-react";
import Script from "next/script";
import { createClient } from "@/utils/supabase/client";
import { useRouter } from "next/navigation";

export default function PricingSection() {
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
            router.push("/dashboard");
          } else {
            alert("Payment verification failed.");
          }
        },
        prefill: {
          email: user.email,
        },
        theme: {
          color: "#4f46e5",
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
    <div className="w-full bg-[var(--bg-default)] text-[var(--text-primary)] pb-24 relative z-10">
      <Script src="https://checkout.razorpay.com/v1/checkout.js" strategy="lazyOnload" />
      {/* Header */}
      <div className="pt-20 pb-16 px-6 text-center max-w-3xl mx-auto">
        <h2 className="text-4xl md:text-5xl font-extrabold mb-6" style={{ fontFamily: "Syne, sans-serif" }}>
          Invest in your <span className="text-transparent bg-clip-text bg-gradient-to-r from-[var(--accent)] to-[#818cf8]">Career</span>, not a subscription.
        </h2>
        <p className="text-lg text-[var(--text-secondary)] mb-8">
          UpRole doesn't charge on a calendar. Job searches happen in bursts. 
          Our pricing is structured around your specific career moments, not subscription traps.
        </p>
      </div>

      {/* Main Tiers */}
      <div className="max-w-7xl mx-auto px-6 grid md:grid-cols-2 lg:grid-cols-4 gap-6 mb-24">
        
        {/* Free Tier */}
        <div className="bg-[var(--bg-surface)] border border-[var(--border)] rounded-2xl p-6 flex flex-col">
          <h3 className="text-xl font-bold mb-2">Free Forever</h3>
          <p className="text-[var(--text-muted)] text-sm mb-6 h-10">For passive job seekers and career tracking.</p>
          <div className="text-4xl font-extrabold mb-6">₹0</div>
          
          <ul className="space-y-4 mb-8 flex-1">
            {["1 Resume, 1 Template", "Unlimited Career Journal", "Passive Resume Strength Score", "100 Welcome Credits"].map((f, i) => (
              <li key={i} className="flex items-start gap-3">
                <Check size={18} className="text-[var(--accent)] mt-0.5" />
                <span className="text-sm">{f}</span>
              </li>
            ))}
          </ul>
          <button className="w-full py-3 rounded-xl font-semibold border border-[var(--border)] text-[var(--text-primary)] hover:bg-[var(--bg-elevated)] transition-colors">
            Current Plan
          </button>
        </div>

        {/* Career Sprint */}
        <div className="bg-[var(--bg-surface)] border-2 border-[var(--accent)] rounded-2xl p-8 flex flex-col relative shadow-[0_0_40px_rgba(99,102,241,0.15)] transform md:-translate-y-4">
          <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-[var(--accent)] text-white text-xs font-bold px-4 py-1 rounded-full uppercase tracking-wider">
            Most Popular
          </div>
          <h3 className="text-xl font-bold mb-2">Career Sprint</h3>
          <p className="text-[var(--text-muted)] text-sm mb-6 h-10">You have an active lead or need to apply now.</p>
          <div className="flex items-end gap-2 mb-6">
            <span className="text-4xl font-extrabold">₹799</span>
            <span className="text-[var(--text-muted)] mb-1">/ 30 days</span>
          </div>
          
          <ul className="space-y-4 mb-8 flex-1">
            {["Unlimited AI Resume Edits", "Unlimited ATS Optimization", "Unlimited Cover Letters", "Interview Prep module", "LinkedIn Optimization"].map((f, i) => (
              <li key={i} className="flex items-start gap-3">
                <Check size={18} className="text-[var(--accent)] mt-0.5" />
                <span className="text-sm font-medium">{f}</span>
              </li>
            ))}
          </ul>
          <button 
            disabled={isProcessing}
            onClick={() => handlePayment(799, "Career Sprint (30 Days)", "sprint", 0)}
            className="w-full py-3 rounded-xl font-bold text-white bg-[var(--accent)] hover:bg-[var(--accent-2)] transition-colors shadow-lg disabled:opacity-50"
          >
            Start 30-Day Sprint
          </button>
        </div>

        {/* Interview Pack */}
        <div className="bg-[var(--bg-surface)] border border-[var(--border)] rounded-2xl p-6 flex flex-col hover:border-[var(--accent)] transition-colors">
          <h3 className="text-xl font-bold mb-2">Interview Pack</h3>
          <p className="text-[var(--text-muted)] text-sm mb-6 h-10">You have a scheduled interview to prep for.</p>
          <div className="flex items-end gap-2 mb-6">
            <span className="text-4xl font-extrabold">₹799</span>
            <span className="text-[var(--text-muted)] mb-1">/ one-time</span>
          </div>
          
          <ul className="space-y-4 mb-8 flex-1">
            {["Resume Polish for Role", "Company Research", "Likely Questions", "Mock Interview", "Salary Negotiation Prep"].map((f, i) => (
              <li key={i} className="flex items-start gap-3">
                <Check size={18} className="text-[var(--accent)] mt-0.5" />
                <span className="text-sm">{f}</span>
              </li>
            ))}
          </ul>
          <button 
            disabled={isProcessing}
            onClick={() => handlePayment(799, "Interview Pack", "interview_pack", 0)}
            className="w-full py-3 rounded-xl font-semibold border border-[var(--border)] text-[var(--text-primary)] hover:bg-[var(--bg-elevated)] transition-colors disabled:opacity-50"
          >
            Get Interview Pack
          </button>
        </div>

        {/* Career Pro */}
        <div className="bg-[var(--bg-surface)] border border-[var(--border)] rounded-2xl p-6 flex flex-col">
          <h3 className="text-xl font-bold mb-2">Career Pro</h3>
          <p className="text-[var(--text-muted)] text-sm mb-6 h-10">Running a full, multi-role job search cycle.</p>
          <div className="flex items-end gap-2 mb-6">
            <span className="text-4xl font-extrabold">₹1,499</span>
            <span className="text-[var(--text-muted)] mb-1">/ 90 days</span>
          </div>
          
          <ul className="space-y-4 mb-8 flex-1">
            <li className="flex items-start gap-3">
              <Check size={18} className="text-[var(--accent)] mt-0.5" />
              <span className="text-sm font-bold">Everything in Sprint, plus:</span>
            </li>
            {["Multiple Resume Versions", "Priority AI Processing", "Advanced Analytics", "Recruiter Confidence Scoring"].map((f, i) => (
              <li key={i} className="flex items-start gap-3">
                <Check size={18} className="text-[var(--accent)] mt-0.5" />
                <span className="text-sm">{f}</span>
              </li>
            ))}
          </ul>
          <button 
            disabled={isProcessing}
            onClick={() => handlePayment(1499, "Career Pro (90 Days)", "pro", 0)}
            className="w-full py-3 rounded-xl font-semibold border border-[var(--border)] text-[var(--text-primary)] hover:bg-[var(--bg-elevated)] transition-colors disabled:opacity-50"
          >
            Go Pro
          </button>
        </div>
      </div>

      {/* Credit Top Ups */}
      <div className="max-w-4xl mx-auto px-6" id="topup">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold mb-4" style={{ fontFamily: "Syne, sans-serif" }}>Just need a quick fix?</h2>
          <p className="text-[var(--text-secondary)]">
            Use credits for casual, low-intent edits between job searches. <br/>
            (AI Edit = 10cr, ATS Check = 15cr, Cover Letter = 20cr)
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-6">
          {/* Starter */}
          <div onClick={() => handlePayment(99, "Starter Pack (100 Credits)")} className="bg-[var(--card)] border border-[var(--border)] rounded-xl p-6 text-center hover:border-[var(--accent)] transition-colors cursor-pointer group">
            <div className="w-12 h-12 bg-[var(--bg-elevated)] rounded-full flex items-center justify-center mx-auto mb-4 group-hover:bg-[var(--accent-soft)] transition-colors">
              <Zap size={20} className="text-[var(--accent)]" />
            </div>
            <h4 className="font-bold mb-1">Starter Pack</h4>
            <div className="text-2xl font-extrabold text-[var(--accent)] mb-4">100 <span className="text-sm font-normal text-[var(--text-muted)]">Credits</span></div>
            <div className="font-semibold mb-1">₹99</div>
            <div className="text-xs text-[var(--text-muted)]">₹0.99 / credit</div>
          </div>

          {/* Booster */}
          <div onClick={() => handlePayment(249, "Booster Pack (300 Credits)")} className="bg-[var(--card)] border border-[var(--border)] rounded-xl p-6 text-center hover:border-[var(--accent)] transition-colors cursor-pointer group relative overflow-hidden">
            <div className="absolute top-3 right-3 text-[10px] font-bold bg-[var(--signal-success)]/10 text-[var(--signal-success)] px-2 py-1 rounded">16% OFF</div>
            <div className="w-12 h-12 bg-[var(--bg-elevated)] rounded-full flex items-center justify-center mx-auto mb-4 group-hover:bg-[var(--accent-soft)] transition-colors">
              <Star size={20} className="text-[var(--accent)]" />
            </div>
            <h4 className="font-bold mb-1">Booster Pack</h4>
            <div className="text-2xl font-extrabold text-[var(--accent)] mb-4">300 <span className="text-sm font-normal text-[var(--text-muted)]">Credits</span></div>
            <div className="font-semibold mb-1">₹249</div>
            <div className="text-xs text-[var(--text-muted)]">₹0.83 / credit</div>
          </div>

          {/* Power */}
          <div onClick={() => handlePayment(499, "Power Pack (750 Credits)")} className="bg-[var(--card)] border border-[var(--border)] rounded-xl p-6 text-center hover:border-[var(--accent)] transition-colors cursor-pointer group relative overflow-hidden">
             <div className="absolute top-3 right-3 text-[10px] font-bold bg-[var(--signal-success)]/10 text-[var(--signal-success)] px-2 py-1 rounded">33% OFF</div>
            <div className="w-12 h-12 bg-[var(--bg-elevated)] rounded-full flex items-center justify-center mx-auto mb-4 group-hover:bg-[var(--accent-soft)] transition-colors">
              <Briefcase size={20} className="text-[var(--accent)]" />
            </div>
            <h4 className="font-bold mb-1">Power Pack</h4>
            <div className="text-2xl font-extrabold text-[var(--accent)] mb-4">750 <span className="text-sm font-normal text-[var(--text-muted)]">Credits</span></div>
            <div className="font-semibold mb-1">₹499</div>
            <div className="text-xs text-[var(--text-muted)]">₹0.66 / credit</div>
          </div>
        </div>
      </div>
    </div>
  );
}
