"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useAuth } from "@/hooks/useAuth";
import { LoginSchema } from "@/lib/validation/auth";
import {
  Mail,
  Phone,
  Lock,
  Smartphone,
  ArrowRight,
  ShieldCheck,
  Sparkles,
  Eye,
  EyeOff,
  TrendingUp,
  Award,
  CheckCircle2,
  Star,
} from "lucide-react";
import UpRoleLogo from "@/components/UpRoleLogo";

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const { login } = useAuth();

  // Dual-method and mobile states
  const [loginMethod, setLoginMethod] = useState<"email" | "mobile">("email");
  const [countryCode, setCountryCode] = useState("+91");
  const [mobileNumber, setMobileNumber] = useState("");
  const [otpToken, setOtpToken] = useState("");
  const [showOtpInput, setShowOtpInput] = useState(false);

  const handleSwitchTab = (method: "email" | "mobile") => {
    setLoginMethod(method);
    setErrorMsg("");
    setEmail("");
    setPassword("");
    setMobileNumber("");
    setOtpToken("");
    setShowOtpInput(false);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg("");
    setSubmitting(true);

    try {
      if (loginMethod === "email") {
        const validation = LoginSchema.safeParse({ email, password });
        if (!validation.success) {
          setErrorMsg(validation.error.issues[0].message);
          setSubmitting(false);
          return;
        }

        const res = await login(email, password);
        if (res.error) {
          setErrorMsg(res.error);
        }
      } else {
        const { createClient } = await import("@/utils/supabase/client");
        const supabase = createClient();
        const fullPhone = countryCode + mobileNumber;

        if (!showOtpInput) {
          const { error } = await supabase.auth.signInWithOtp({
            phone: fullPhone,
          });
          if (error) {
            setErrorMsg("Phone login failed or SMS is not configured on this number.");
            setLoginMethod("email");
            setMobileNumber("");
          } else {
            setShowOtpInput(true);
          }
        } else {
          const { error } = await supabase.auth.verifyOtp({
            phone: fullPhone,
            token: otpToken,
            type: "sms",
          });
          if (error) {
            setErrorMsg(error.message);
          } else {
            router.push("/dashboard");
          }
        }
      }
    } catch (err: any) {
      setErrorMsg("An unexpected error occurred. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  const handleGoogleLogin = async () => {
    setErrorMsg("");
    try {
      const { createClient } = await import("@/utils/supabase/client");
      const supabase = createClient();
      const { error } = await supabase.auth.signInWithOAuth({
        provider: "google",
        options: {
          redirectTo: `${window.location.origin}/auth/callback`,
        },
      });
      if (error) {
        setErrorMsg(error.message);
      }
    } catch (err: any) {
      setErrorMsg("Failed to initialize Google Login.");
    }
  };

  return (
    <div className="min-h-screen bg-[#FAF9F6] text-[#111827] flex flex-col font-sans selection:bg-[#F59E0B] selection:text-white">
      
      {/* ── Main Split View ── */}
      <div className="flex-1 grid grid-cols-1 lg:grid-cols-12 min-h-screen">
        
        {/* ════════════════════════════════════════════════════════════════
            LEFT COLUMN: Strategic Brand Showcase & Social Proof
            ════════════════════════════════════════════════════════════════ */}
        <div className="hidden lg:flex lg:col-span-6 xl:col-span-7 p-10 xl:p-16 flex-col justify-between border-r border-gray-200/80 bg-gradient-to-br from-[#FAF9F6] via-[#F4EFEA]/80 to-[#ECE5DC]/70 relative overflow-hidden">
          
          {/* Subtle warm decorative glow */}
          <div className="absolute top-12 left-10 w-96 h-96 bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />
          <div className="absolute bottom-10 right-10 w-96 h-96 bg-teal-500/10 rounded-full blur-3xl pointer-events-none" />

          {/* Top Logo */}
          <div className="relative z-10">
            <UpRoleLogo href="/" size="md" variant="light" />
          </div>

          {/* Center Showcase Content */}
          <div className="relative z-10 space-y-8 my-auto py-8 max-w-xl">
            
            {/* Eyebrow */}
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-white/90 border border-gray-200/80 shadow-xs text-xs font-bold uppercase tracking-wider text-[#101B3B]">
              <Sparkles size={13} className="text-[#F59E0B]" />
              <span>Career Advancement Platform</span>
            </div>

            {/* Main Statement */}
            <h2 className="text-4xl xl:text-[50px] font-normal leading-[1.12] font-['Playfair_Display',Georgia,serif] text-[#111827] tracking-tight">
              Your career has<br />
              more value than<br />
              you think<span className="text-[#F59E0B]">.</span>
            </h2>

            <p className="text-[15.5px] text-[#4B5563] leading-relaxed max-w-lg">
              Understand the true experience, impact, and capabilities you&apos;ve built — and turn them into your next promotion, salary jump, or career leap.
            </p>

            {/* Career Value Snapshot Miniature Card */}
            <div className="rounded-2xl bg-white/95 border border-gray-200/90 p-5 shadow-sm space-y-3.5 backdrop-blur-sm">
              <div className="flex items-center justify-between border-b border-gray-100 pb-2.5">
                <div className="flex items-center gap-2">
                  <Award size={15} className="text-[#F59E0B]" />
                  <span className="text-xs font-bold uppercase tracking-wider text-[#111827]">
                    Career Intelligence Snapshot
                  </span>
                </div>
                <div className="flex items-center gap-1.5 text-[11px] font-semibold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                  <span>Real Market Benchmark</span>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="p-2.5 rounded-xl bg-[#FAF9F6] border border-gray-100">
                  <span className="text-[10.5px] font-semibold text-gray-500 uppercase tracking-wide block">
                    Estimated Market Value
                  </span>
                  <span className="text-[15px] font-extrabold text-[#111827] mt-0.5 block">
                    ₹ 25–34 LPA
                  </span>
                </div>
                <div className="p-2.5 rounded-xl bg-[#FAF9F6] border border-gray-100">
                  <span className="text-[10.5px] font-semibold text-gray-500 uppercase tracking-wide block">
                    Target Role Alignment
                  </span>
                  <span className="text-[15px] font-extrabold text-[#10B981] mt-0.5 block">
                    94% Ready
                  </span>
                </div>
              </div>
            </div>

            {/* Testimonial Quote */}
            <div className="space-y-2 pt-2">
              <div className="flex items-center gap-1 text-amber-500">
                {[...Array(5)].map((_, i) => (
                  <Star key={i} size={14} className="fill-current" />
                ))}
              </div>
              <p className="text-sm italic text-[#374151] leading-relaxed">
                &ldquo;UpRole helped me articulate 7 years of engineering impact into a VP offer with a 45% pay surge. It&apos;s a strategic unfair advantage.&rdquo;
              </p>
              <p className="text-xs font-bold text-[#111827]">
                — Tanvi Deshmukh, <span className="font-normal text-gray-500">VP of Technology</span>
              </p>
            </div>

          </div>

          {/* Bottom Social Proof Bar */}
          <div className="relative z-10 pt-6 border-t border-gray-200/80 grid grid-cols-3 gap-4 max-w-lg">
            <div>
              <span className="text-xl font-extrabold text-[#111827] block">12,000+</span>
              <span className="text-[11px] text-gray-500 font-medium">Careers Accelerated</span>
            </div>
            <div>
              <span className="text-xl font-extrabold text-[#10B981] block">94%</span>
              <span className="text-[11px] text-gray-500 font-medium">Interview Call Rate</span>
            </div>
            <div>
              <span className="text-xl font-extrabold text-[#F59E0B] block">4.9 / 5</span>
              <span className="text-[11px] text-gray-500 font-medium">Professional Rating</span>
            </div>
          </div>

        </div>

        {/* ════════════════════════════════════════════════════════════════
            RIGHT COLUMN: Clean Luxury Authentication Form
            ════════════════════════════════════════════════════════════════ */}
        <div className="lg:col-span-6 xl:col-span-5 p-6 sm:p-12 xl:p-16 flex flex-col justify-between relative bg-[#FAF9F6]">
          
          {/* Top Bar on Mobile */}
          <div className="flex items-center justify-between mb-8 lg:mb-4">
            <div className="lg:hidden">
              <UpRoleLogo href="/" size="sm" variant="light" />
            </div>
            <Link
              href="/"
              className="text-xs font-semibold text-gray-500 hover:text-[#111827] transition-colors flex items-center gap-1.5 ml-auto"
            >
              <span>Back to Home</span>
              <ArrowRight size={13} />
            </Link>
          </div>

          {/* Form Card Container */}
          <div className="w-full max-w-[420px] mx-auto my-auto py-4">
            <div className="rounded-3xl bg-white border border-gray-200/90 shadow-[0_16px_50px_rgba(16,27,59,0.06)] p-7 sm:p-9 transition-all">
              
              {/* Heading */}
              <div className="text-center mb-6 space-y-1.5">
                <h1 className="text-3xl font-normal font-['Playfair_Display',Georgia,serif] text-[#111827] tracking-tight">
                  Welcome back<span className="text-[#F59E0B]">.</span>
                </h1>
                <p className="text-[13px] text-gray-500 leading-relaxed">
                  Sign in to access your career intelligence and tools.
                </p>
              </div>

              {/* Form */}
              <form onSubmit={handleSubmit} className="space-y-4" noValidate>
                
                {/* Error Banner */}
                {errorMsg && (
                  <div className="p-3.5 rounded-xl bg-red-50 border border-red-200 text-xs text-red-600 font-medium leading-snug animate-in fade-in duration-200">
                    {errorMsg}
                  </div>
                )}

                {/* Segmented Switcher */}
                <div className="flex p-1 bg-gray-100 rounded-xl border border-gray-200/70">
                  <button
                    type="button"
                    onClick={() => handleSwitchTab("email")}
                    className={`flex-1 py-2 text-xs font-semibold rounded-lg transition-all ${
                      loginMethod === "email"
                        ? "bg-white text-[#111827] font-bold shadow-xs border border-gray-200/60"
                        : "text-gray-500 hover:text-[#111827]"
                    }`}
                  >
                    Email Address
                  </button>
                  <button
                    type="button"
                    onClick={() => handleSwitchTab("mobile")}
                    className={`flex-1 py-2 text-xs font-semibold rounded-lg transition-all ${
                      loginMethod === "mobile"
                        ? "bg-white text-[#111827] font-bold shadow-xs border border-gray-200/60"
                        : "text-gray-500 hover:text-[#111827]"
                    }`}
                  >
                    Mobile Number
                  </button>
                </div>

                {/* Method Input Fields */}
                {loginMethod === "email" ? (
                  <div className="space-y-3 pt-1">
                    {/* Email Field */}
                    <div>
                      <label className="block text-[11px] font-bold uppercase tracking-wider text-gray-700 mb-1">
                        Email Address
                      </label>
                      <div className="relative">
                        <div className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none">
                          <Mail size={16} />
                        </div>
                        <input
                          type="email"
                          value={email}
                          onChange={(e) => setEmail(e.target.value)}
                          placeholder="name@company.com"
                          disabled={submitting}
                          required
                          className="w-full h-11 bg-white border border-gray-300 rounded-xl text-[14px] text-[#111827] pl-10 pr-4 focus:outline-none focus:border-[#F59E0B] focus:ring-3 focus:ring-[#F59E0B]/15 transition-all shadow-2xs placeholder:text-gray-400"
                        />
                      </div>
                    </div>

                    {/* Password Field */}
                    <div>
                      <div className="flex items-center justify-between mb-1">
                        <label className="text-[11px] font-bold uppercase tracking-wider text-gray-700">
                          Password
                        </label>
                        <Link
                          href="/forgot-password"
                          className="text-xs font-semibold text-[#F59E0B] hover:text-[#D97706] transition-colors"
                        >
                          Forgot?
                        </Link>
                      </div>
                      <div className="relative">
                        <div className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none">
                          <Lock size={16} />
                        </div>
                        <input
                          type={showPassword ? "text" : "password"}
                          value={password}
                          onChange={(e) => setPassword(e.target.value)}
                          placeholder="••••••••"
                          disabled={submitting}
                          required
                          className="w-full h-11 bg-white border border-gray-300 rounded-xl text-[14px] text-[#111827] pl-10 pr-11 focus:outline-none focus:border-[#F59E0B] focus:ring-3 focus:ring-[#F59E0B]/15 transition-all shadow-2xs placeholder:text-gray-400"
                        />
                        <button
                          type="button"
                          onClick={() => setShowPassword(!showPassword)}
                          className="absolute right-3.5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 focus:outline-none"
                        >
                          {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                        </button>
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="space-y-3 pt-1">
                    {!showOtpInput ? (
                      <div>
                        <label className="block text-[11px] font-bold uppercase tracking-wider text-gray-700 mb-1">
                          Mobile Phone
                        </label>
                        <div className="flex gap-2">
                          <div className="w-20">
                            <input
                              type="text"
                              value={countryCode}
                              onChange={(e) => setCountryCode(e.target.value)}
                              disabled={submitting}
                              className="w-full h-11 bg-white border border-gray-300 rounded-xl text-[13.5px] text-center font-bold text-[#111827] focus:outline-none focus:border-[#F59E0B] focus:ring-3 focus:ring-[#F59E0B]/15 transition-all shadow-2xs"
                            />
                          </div>
                          <div className="relative flex-1">
                            <div className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none">
                              <Phone size={16} />
                            </div>
                            <input
                              type="tel"
                              value={mobileNumber}
                              onChange={(e) => setMobileNumber(e.target.value.replace(/\D/g, ""))}
                              placeholder="98765 43210"
                              maxLength={10}
                              disabled={submitting}
                              required
                              className="w-full h-11 bg-white border border-gray-300 rounded-xl text-[14px] text-[#111827] pl-10 pr-4 focus:outline-none focus:border-[#F59E0B] focus:ring-3 focus:ring-[#F59E0B]/15 transition-all shadow-2xs placeholder:text-gray-400"
                            />
                          </div>
                        </div>
                      </div>
                    ) : (
                      <div>
                        <label className="block text-[11px] font-bold uppercase tracking-wider text-gray-700 mb-1">
                          6-Digit OTP Code
                        </label>
                        <div className="relative">
                          <div className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none">
                            <Smartphone size={16} />
                          </div>
                          <input
                            type="text"
                            value={otpToken}
                            onChange={(e) => setOtpToken(e.target.value.replace(/\D/g, ""))}
                            placeholder="123456"
                            maxLength={6}
                            disabled={submitting}
                            required
                            className="w-full h-11 bg-white border border-gray-300 rounded-xl text-[16px] tracking-widest font-bold text-[#111827] pl-10 pr-4 focus:outline-none focus:border-[#F59E0B] focus:ring-3 focus:ring-[#F59E0B]/15 transition-all shadow-2xs"
                          />
                        </div>
                        <p className="text-[11.5px] text-gray-500 mt-1">
                          Sent to {countryCode} {mobileNumber}
                        </p>
                      </div>
                    )}
                  </div>
                )}

                {/* Primary CTA Button */}
                <button
                  type="submit"
                  disabled={submitting}
                  className="w-full py-3 mt-1.5 rounded-xl bg-gradient-to-r from-[#F59E0B] to-[#D97706] hover:brightness-105 text-white font-bold text-[14px] transition-all shadow-sm hover:shadow-md hover:shadow-amber-500/20 flex items-center justify-center gap-2 cursor-pointer active:scale-[0.99] disabled:opacity-60"
                >
                  <span>{submitting ? "Signing in..." : loginMethod === "email" ? "Sign In to UpRole" : !showOtpInput ? "Send Verification Code" : "Verify & Continue"}</span>
                  <ArrowRight size={15} />
                </button>
              </form>

              {/* Divider */}
              <div className="flex items-center gap-3 my-5">
                <div className="flex-1 h-[1px] bg-gray-200" />
                <span className="text-[10.5px] font-bold text-gray-400 uppercase tracking-wider">
                  or
                </span>
                <div className="flex-1 h-[1px] bg-gray-200" />
              </div>

              {/* Google SSO Button */}
              <button
                type="button"
                onClick={handleGoogleLogin}
                className="w-full py-2.5 px-4 rounded-xl bg-white hover:bg-gray-50 border border-gray-300 text-[#374151] font-semibold text-[13px] transition-all flex items-center justify-center gap-2.5 cursor-pointer shadow-2xs hover:shadow-xs"
              >
                <svg width="17" height="17" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
                  <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
                  <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
                  <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
                </svg>
                <span>Continue with Google</span>
              </button>

              {/* Sign Up Link */}
              <p className="text-center text-[12.5px] text-[#4B5563] mt-5">
                Don&apos;t have an account?{" "}
                <Link
                  href="/signup"
                  className="text-[#F59E0B] font-bold hover:text-[#D97706] hover:underline transition-colors ml-0.5"
                >
                  Sign up for free
                </Link>
              </p>
            </div>

            {/* Bank Privacy Micro-Badge */}
            <div className="mt-4 flex items-center justify-center gap-1.5 text-[11px] text-gray-500 font-medium">
              <ShieldCheck size={13} className="text-emerald-600" />
              <span>Bank-grade career data privacy &amp; encryption</span>
            </div>
          </div>

          {/* Micro Footer */}
          <footer className="text-center text-[10.5px] font-bold text-gray-400 uppercase tracking-widest pt-4">
            UPROLE | CAREERS WITH CLARITY. PROGRESS WITH PURPOSE.
          </footer>

        </div>

      </div>

    </div>
  );
}
