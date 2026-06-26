"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useAuth } from "@/hooks/useAuth";
import { SignupSchema } from "@/lib/validation/auth";
import { Input } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";
import { ThemeToggle } from "@/components/ThemeToggle";
import { Box, Mail, Phone, Lock, Smartphone } from "lucide-react";

export default function SignupPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [errorMsg, setErrorMsg] = useState("");
  const [successMsg, setSuccessMsg] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const { signup } = useAuth();

  // Dual-method and password states
  const [loginMethod, setLoginMethod] = useState<"email" | "mobile">("email");
  const [countryCode, setCountryCode] = useState("+91");
  const [mobileNumber, setMobileNumber] = useState("");
  const [otpToken, setOtpToken] = useState("");
  const [showOtpInput, setShowOtpInput] = useState(false);

  // Password strength logic
  const [strengthScore, setStrengthScore] = useState(0);

  useEffect(() => {
    let score = 0;
    if (password.length >= 8) score++;
    if (/[A-Z]/.test(password)) score++;
    if (/[0-9]/.test(password)) score++;
    if (/[^A-Za-z0-9]/.test(password)) score++;
    setStrengthScore(score);
  }, [password]);

  const getStrengthColor = (index: number) => {
    if (strengthScore <= index) return "var(--bg-elevated)";
    if (strengthScore === 1) return "var(--danger)"; // red
    if (strengthScore === 2) return "#F97316"; // orange
    if (strengthScore === 3) return "var(--warning)"; // yellow
    return "var(--success)"; // green
  };

  const handleSwitchTab = (method: "email" | "mobile") => {
    setLoginMethod(method);
    setErrorMsg("");
    setSuccessMsg("");
    setEmail("");
    setPassword("");
    setConfirmPassword("");
    setMobileNumber("");
    setOtpToken("");
    setShowOtpInput(false);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg("");
    setSuccessMsg("");

    if (loginMethod === "email") {
      if (password !== confirmPassword) {
        setErrorMsg("Passwords do not match. Please verify.");
        return;
      }

      const validation = SignupSchema.safeParse({ email, password });
      if (!validation.success) {
        setErrorMsg(validation.error.issues[0].message);
        return;
      }
    }

    setSubmitting(true);

    try {
      if (loginMethod === "email") {
        const res = await signup(email, password);
        if (res.error) {
          setErrorMsg(res.error);
        } else {
          setSuccessMsg("Account successfully created! Redirecting...");
        }
      } else {
        const { createClient } = await import("@/utils/supabase/client");
        const supabase = createClient();
        const fullPhone = countryCode + mobileNumber;

        if (!showOtpInput) {
          // Send OTP
          const { error } = await supabase.auth.signInWithOtp({
            phone: fullPhone,
          });
          if (error) {
            setErrorMsg("Phone login failed or not enabled.");
            setLoginMethod("email");
            setMobileNumber("");
          } else {
            setShowOtpInput(true);
            setSuccessMsg("OTP sent successfully. Please enter it below.");
          }
        } else {
          // Verify OTP
          const { error } = await supabase.auth.verifyOtp({
            phone: fullPhone,
            token: otpToken,
            type: "sms",
          });
          if (error) {
            setErrorMsg(error.message);
          } else {
            setSuccessMsg("Mobile registration successful! Redirecting...");
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
    <div className="flex min-h-screen bg-[var(--bg-surface)] relative">
      <div className="absolute top-6 right-6 z-50">
        <ThemeToggle />
      </div>
      {/* Left Decorative Panel */}
      <div className="hidden lg:flex flex-col relative w-[40%] bg-[var(--accent-grad)] p-12 overflow-hidden text-white">
        <Link href="/" className="flex items-center gap-2 mb-16 relative z-10 w-fit no-underline">
          <Box size={28} className="text-white" />
          <span className="text-2xl font-[800] tracking-tight text-white font-['Syne',sans-serif]">
            ResumeOptimizer
          </span>
        </Link>
        <div className="relative z-10 flex flex-col justify-center flex-1 pr-12">
          <h1 className="text-4xl lg:text-5xl font-extrabold font-['Syne',sans-serif] leading-tight mb-6 text-white">
            Join the top 1% of candidates.
          </h1>
          <p className="text-white/80 text-lg leading-relaxed">
            Create an account to start building ATS-optimized resumes and unlock tailored career recommendations.
          </p>
        </div>
        
        {/* Animated Background Blobs */}
        <div className="absolute top-0 right-0 w-[400px] h-[400px] bg-white/10 rounded-full blur-[80px] -translate-y-1/2 translate-x-1/3 mix-blend-overlay animate-pulse" />
        <div className="absolute bottom-0 left-0 w-[500px] h-[500px] bg-white/10 rounded-full blur-[100px] translate-y-1/3 -translate-x-1/4 mix-blend-overlay" />
      </div>

      {/* Right Form Panel */}
      <div className="flex-1 flex flex-col items-center justify-center p-6 sm:p-12 overflow-y-auto">
        <div className="w-full max-w-[420px] py-8">
          <div className="text-center mb-8">
            <h2 className="text-3xl font-extrabold font-['Syne',sans-serif] text-[var(--text-primary)] mb-2">
              Create an account
            </h2>
            <p className="text-[var(--text-muted)] text-[15px]">
              Sign up to start optimizing your resume
            </p>
          </div>

          <form onSubmit={handleSubmit} className="flex flex-col gap-5" noValidate>
            {errorMsg && (
              <div className="p-4 rounded-[var(--radius-md)] bg-[rgba(239,68,68,0.1)] border border-[rgba(239,68,68,0.2)] text-[14px] text-[var(--danger)] font-medium">
                {errorMsg}
              </div>
            )}
            
            {successMsg && (
              <div className="p-4 rounded-[var(--radius-md)] bg-[rgba(16,185,129,0.1)] border border-[rgba(16,185,129,0.2)] text-[14px] text-[var(--success)] font-medium">
                {successMsg}
              </div>
            )}

            {/* Email / Mobile Tabs */}
            <div className="flex gap-2 p-1 bg-[var(--bg-elevated)] rounded-[var(--radius-md)] border border-[var(--border)]">
              <button
                type="button"
                onClick={() => handleSwitchTab("email")}
                className={`flex-1 py-2 text-sm font-semibold rounded-[var(--radius-sm)] transition-all ${
                  loginMethod === "email"
                    ? "bg-white dark:bg-[#2A2A38] shadow-sm text-[var(--text-primary)]"
                    : "text-[var(--text-muted)] hover:text-[var(--text-primary)]"
                }`}
              >
                Email
              </button>
              <button
                type="button"
                onClick={() => handleSwitchTab("mobile")}
                className={`flex-1 py-2 text-sm font-semibold rounded-[var(--radius-sm)] transition-all ${
                  loginMethod === "mobile"
                    ? "bg-white dark:bg-[#2A2A38] shadow-sm text-[var(--text-primary)]"
                    : "text-[var(--text-muted)] hover:text-[var(--text-primary)]"
                }`}
              >
                Mobile
              </button>
            </div>

            {loginMethod === "email" ? (
              <>
                <Input
                  label="Email Address"
                  type="email"
                  icon={<Mail size={18} />}
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  disabled={submitting}
                  required
                />
                
                <div className="flex flex-col gap-2">
                  <Input
                    label="Password"
                    type="password"
                    icon={<Lock size={18} />}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    disabled={submitting}
                    required
                  />
                  {password.length > 0 && (
                    <div className="flex gap-1 h-1.5 mt-1 px-1">
                      {[0, 1, 2, 3].map((index) => (
                        <div
                          key={index}
                          className="flex-1 rounded-full transition-colors duration-300"
                          style={{ backgroundColor: getStrengthColor(index) }}
                        />
                      ))}
                    </div>
                  )}
                </div>

                <Input
                  label="Confirm Password"
                  type="password"
                  icon={<Lock size={18} />}
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  disabled={submitting}
                  required
                />
              </>
            ) : (
              <>
                {!showOtpInput ? (
                  <div className="flex gap-3">
                    <div className="w-[110px]">
                      <Input
                        label="Code"
                        value={countryCode}
                        onChange={(e) => setCountryCode(e.target.value)}
                        disabled={submitting}
                      />
                    </div>
                    <div className="flex-1">
                      <Input
                        label="Mobile Number"
                        type="tel"
                        icon={<Phone size={18} />}
                        value={mobileNumber}
                        onChange={(e) => setMobileNumber(e.target.value.replace(/\D/g, ""))}
                        maxLength={10}
                        disabled={submitting}
                        required
                      />
                    </div>
                  </div>
                ) : (
                  <div>
                    <Input
                      label="Enter 6-digit OTP"
                      type="text"
                      icon={<Smartphone size={18} />}
                      value={otpToken}
                      onChange={(e) => setOtpToken(e.target.value.replace(/\D/g, ""))}
                      maxLength={6}
                      disabled={submitting}
                      required
                    />
                    <p className="text-[13px] text-[var(--text-muted)] mt-2 font-medium">
                      Code sent to {countryCode} {mobileNumber}
                    </p>
                  </div>
                )}
              </>
            )}

            <Button
              type="submit"
              variant="primary"
              size="lg"
              fullWidth
              loading={submitting}
              className="mt-2"
            >
              {loginMethod === "email" ? "Sign Up" : !showOtpInput ? "Send Code" : "Verify Code"}
            </Button>
          </form>

          <div className="flex items-center gap-4 my-8">
            <div className="flex-1 h-[1px] bg-[var(--border)]" />
            <span className="text-[13px] font-medium text-[var(--text-muted)] uppercase tracking-wider">
              or continue with
            </span>
            <div className="flex-1 h-[1px] bg-[var(--border)]" />
          </div>

          <Button
            type="button"
            variant="secondary"
            size="lg"
            fullWidth
            onClick={handleGoogleLogin}
            className="bg-white dark:bg-transparent"
            icon={
              <svg width="20" height="20" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
                <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
                <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
                <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
              </svg>
            }
          >
            Google
          </Button>

          <p className="text-center text-[14px] text-[var(--text-muted)] mt-10">
            Already have an account?{" "}
            <Link
              href="/login"
              className="text-[var(--accent)] font-semibold hover:text-[var(--accent-2)] transition-colors ml-1"
            >
              Log in
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
