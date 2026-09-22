"use client";

import { useState } from "react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { useToast } from "@/components/ui/toast-1";
import {
  MessageSquare,
  Send,
  CheckCircle2,
  Clock,
  ShieldCheck,
  HelpCircle,
  Sparkles,
  ArrowRight,
  ChevronDown
} from "lucide-react";
import Link from "next/link";

export default function ContactPage() {
  const { showToast } = useToast();
  const [form, setForm] = useState({
    name: "",
    email: "",
    category: "technical_support",
    subject: "",
    message: "",
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.name || !form.email || !form.message) {
      showToast("Please complete all required fields.", "error");
      return;
    }

    setIsSubmitting(true);
    // Simulate support ticket intake
    setTimeout(() => {
      setIsSubmitting(false);
      setIsSubmitted(true);
      showToast("Inquiry submitted! Ticket assigned.", "success");
    }, 900);
  };

  return (
    <div className="min-h-screen bg-[var(--bg-page)] text-[var(--text-primary)] flex flex-col font-sans selection:bg-[#F59E0B] selection:text-[#101B3B]">
      <Navbar />

      <main className="flex-1 max-w-6xl mx-auto px-6 py-16 md:py-20 w-full">
        {/* Header */}
        <div className="text-center max-w-2xl mx-auto space-y-3 mb-12">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-500/10 border border-amber-500/25 text-amber-600 dark:text-amber-400 text-xs font-bold uppercase tracking-wider">
            <MessageSquare size={12} className="text-amber-500" />
            <span>UPROLE SUPPORT & IN-APP HELPDESK</span>
          </div>

          <h1 className="text-3xl md:text-5xl font-black tracking-tight text-[var(--text-primary)] font-['Syne',sans-serif]">
            How can we assist your trajectory?
          </h1>

          <p className="text-sm md:text-base text-[var(--text-muted)] leading-relaxed">
            Have a question about ATS optimization, billing credits, or account features? Submit a ticket directly to our support engineering team.
          </p>
        </div>

        {/* 2-Column Support Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          
          {/* Left: Contact Form (7 Cols) */}
          <div className="lg:col-span-7 p-6 md:p-8 rounded-2xl bg-[var(--bg-elevated)] border border-[var(--border)] shadow-sm space-y-6 backdrop-blur-xl relative overflow-hidden">
            <div className="absolute top-0 left-0 right-0 h-[2px] bg-gradient-to-r from-amber-500 via-blue-500 to-teal-500" />

            {isSubmitted ? (
              <div className="py-12 text-center space-y-4">
                <div className="w-16 h-16 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-500 flex items-center justify-center mx-auto shadow-md">
                  <CheckCircle2 size={32} />
                </div>
                <h3 className="text-xl font-bold text-[var(--text-primary)] font-['Syne',sans-serif]">
                  Inquiry Dispatched Successfully!
                </h3>
                <p className="text-xs text-[var(--text-muted)] max-w-md mx-auto leading-relaxed">
                  Your ticket has been logged in our priority queue. A dedicated support specialist will review your request and follow up via your account within 24 hours.
                </p>
                <button
                  onClick={() => {
                    setIsSubmitted(false);
                    setForm({ name: "", email: "", category: "technical_support", subject: "", message: "" });
                  }}
                  className="px-5 py-2.5 rounded-xl bg-amber-500 text-brand-navy font-bold text-xs hover:bg-amber-400 transition-all cursor-pointer shadow-sm"
                >
                  Submit Another Inquiry
                </button>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {/* Name */}
                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-[var(--text-secondary)] uppercase tracking-wider block">
                      Your Full Name <span className="text-amber-500">*</span>
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. Alex Sharma"
                      value={form.name}
                      onChange={(e) => setForm({ ...form, name: e.target.value })}
                      className="w-full px-3.5 py-2.5 rounded-xl bg-[var(--bg-page)] border border-[var(--border)] text-xs text-[var(--text-primary)] placeholder-[var(--text-muted)] outline-none focus:border-amber-500/50 transition-all"
                    />
                  </div>

                  {/* Email */}
                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-[var(--text-secondary)] uppercase tracking-wider block">
                      Account Email Address <span className="text-amber-500">*</span>
                    </label>
                    <input
                      type="email"
                      required
                      placeholder="e.g. alex@example.com"
                      value={form.email}
                      onChange={(e) => setForm({ ...form, email: e.target.value })}
                      className="w-full px-3.5 py-2.5 rounded-xl bg-[var(--bg-page)] border border-[var(--border)] text-xs text-[var(--text-primary)] placeholder-[var(--text-muted)] outline-none focus:border-amber-500/50 transition-all font-mono"
                    />
                  </div>
                </div>

                {/* Category */}
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-[var(--text-secondary)] uppercase tracking-wider block">
                    Inquiry Category <span className="text-amber-500">*</span>
                  </label>
                  <select
                    value={form.category}
                    onChange={(e) => setForm({ ...form, category: e.target.value })}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-[var(--bg-page)] border border-[var(--border)] text-xs font-bold text-[var(--text-primary)] outline-none focus:border-amber-500/50 transition-all cursor-pointer"
                  >
                    <option value="technical_support">Technical Support & ATS Parser Questions</option>
                    <option value="account_billing">Billing, Credits & Subscription Management</option>
                    <option value="feature_feedback">Product Feedback & Feature Suggestions</option>
                    <option value="enterprise_partnerships">Institutional & University Partnerships</option>
                  </select>
                </div>

                {/* Subject */}
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-[var(--text-secondary)] uppercase tracking-wider block">
                    Subject / Topic
                  </label>
                  <input
                    type="text"
                    placeholder="Brief summary of your inquiry..."
                    value={form.subject}
                    onChange={(e) => setForm({ ...form, subject: e.target.value })}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-[var(--bg-page)] border border-[var(--border)] text-xs text-[var(--text-primary)] placeholder-[var(--text-muted)] outline-none focus:border-amber-500/50 transition-all"
                  />
                </div>

                {/* Message */}
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-[var(--text-secondary)] uppercase tracking-wider block">
                    Message / Details <span className="text-amber-500">*</span>
                  </label>
                  <textarea
                    required
                    rows={5}
                    placeholder="Describe how we can help you with your resume, account, or career pursuit..."
                    value={form.message}
                    onChange={(e) => setForm({ ...form, message: e.target.value })}
                    className="w-full p-3.5 rounded-xl bg-[var(--bg-page)] border border-[var(--border)] text-xs text-[var(--text-primary)] placeholder-[var(--text-muted)] outline-none focus:border-amber-500/50 transition-all resize-y min-h-[110px]"
                  />
                </div>

                {/* Submit button */}
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full py-3.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-brand-navy font-black text-xs md:text-sm transition-all shadow-md shadow-amber-500/25 border border-amber-400 cursor-pointer disabled:opacity-50 flex items-center justify-center gap-2"
                >
                  <Send size={15} />
                  <span>{isSubmitting ? "Transmitting Ticket..." : "Submit Support Ticket"}</span>
                </button>
              </form>
            )}
          </div>

          {/* Right: Support SLAs & FAQ Sidebar (5 Cols) */}
          <div className="lg:col-span-5 space-y-4">
            {/* SLA Card */}
            <div className="p-5 rounded-2xl bg-[var(--bg-elevated)] border border-[var(--border)] shadow-xs space-y-3 backdrop-blur-xl">
              <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-[var(--text-primary)] font-['Syne',sans-serif]">
                <Clock size={16} className="text-amber-500" />
                <span>Response Time SLA</span>
              </div>
              <p className="text-xs text-[var(--text-muted)] leading-relaxed">
                Tickets submitted during business hours are typically reviewed by a technical specialist within <strong>2 to 4 hours</strong>, with guaranteed resolution within <strong>24 business hours</strong>.
              </p>
              <div className="flex items-center gap-2 text-[11px] font-bold text-emerald-600 dark:text-emerald-400 pt-1">
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                <span>Support Desk Queue: Online & Active</span>
              </div>
            </div>

            {/* Quick Self-Serve FAQ Card */}
            <div className="p-5 rounded-2xl bg-[var(--bg-elevated)] border border-[var(--border)] shadow-xs space-y-3 backdrop-blur-xl">
              <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-[var(--text-primary)] font-['Syne',sans-serif]">
                <HelpCircle size={16} className="text-blue-500" />
                <span>Instant Self-Serve Answers</span>
              </div>

              <div className="space-y-2.5 text-xs">
                <div className="p-3 rounded-xl bg-[var(--bg-page)] border border-[var(--border)] space-y-1">
                  <div className="font-bold text-[var(--text-primary)]">How do AI credits work?</div>
                  <p className="text-[11px] text-[var(--text-muted)] leading-relaxed">
                    Credits power AI resume bullet optimizations, mock interviews, and PDF exports. Check your live balance in <Link href="/dashboard/credits" className="text-amber-500 hover:underline">Credits</Link>.
                  </p>
                </div>

                <div className="p-3 rounded-xl bg-[var(--bg-page)] border border-[var(--border)] space-y-1">
                  <div className="font-bold text-[var(--text-primary)]">Can I export resumes for free?</div>
                  <p className="text-[11px] text-[var(--text-muted)] leading-relaxed">
                    Yes! You can preview and export clean ATS resumes anytime directly from the <Link href="/resume/templates" className="text-amber-500 hover:underline">Templates</Link> gallery.
                  </p>
                </div>
              </div>
            </div>
          </div>

        </div>
      </main>

      <Footer />
    </div>
  );
}
