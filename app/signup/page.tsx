"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useAuth } from "@/hooks/useAuth";
import { SignupSchema } from "@/lib/validation/auth";

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
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

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
            setErrorMsg("Phone login is not enabled. Please use your email address.");
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
    <main
      style={{
        minHeight: "100vh",
        background: "var(--bg)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: "2rem 1rem",
        position: "relative",
        overflow: "hidden",
      }}
    >
      {/* Background glow blobs */}
      <div
        style={{
          position: "absolute",
          top: "-200px",
          right: "30%",
          width: "600px",
          height: "600px",
          background: "radial-gradient(circle, rgba(108,99,255,0.1) 0%, transparent 70%)",
          pointerEvents: "none",
        }}
      />
      <div
        style={{
          position: "absolute",
          bottom: "-200px",
          left: "30%",
          width: "600px",
          height: "600px",
          background: "radial-gradient(circle, rgba(255,101,132,0.08) 0%, transparent 70%)",
          pointerEvents: "none",
        }}
      />

      <div
        className="card glow fade-in-up"
        style={{
          width: "100%",
          maxWidth: "420px",
          padding: "2.5rem 2rem",
          background: "var(--card)",
          backdropFilter: "blur(12px)",
          border: "1px solid var(--border)",
          borderRadius: "20px",
          zIndex: 10,
        }}
      >
        <div style={{ textAlign: "center", marginBottom: "2rem" }}>
          <h1
            style={{
              fontFamily: "Syne, sans-serif",
              fontSize: "1.8rem",
              fontWeight: 800,
              background: "linear-gradient(135deg, #6c63ff, #ff6584)",
              WebkitBackgroundClip: "text",
              WebkitTextFillColor: "transparent",
              marginBottom: "0.5rem",
            }}
          >
            Create Account
          </h1>
          <p style={{ color: "var(--text-muted)", fontSize: "0.88rem" }}>
            Sign up to build, scan, and optimize resumes
          </p>
        </div>

        {errorMsg && (
          <div
            style={{
              color: "#ff6584",
              fontSize: "0.85rem",
              padding: "0.75rem 1rem",
              background: "rgba(255, 101, 132, 0.1)",
              borderRadius: "8px",
              marginBottom: "1.5rem",
              border: "1px solid rgba(255, 101, 132, 0.2)",
            }}
          >
            {errorMsg}
          </div>
        )}

        {successMsg && (
          <div
            style={{
              color: "#43e97b",
              fontSize: "0.85rem",
              padding: "0.75rem 1rem",
              background: "rgba(67, 233, 123, 0.1)",
              borderRadius: "8px",
              marginBottom: "1.5rem",
              border: "1px solid rgba(67, 233, 123, 0.2)",
            }}
          >
            {successMsg}
          </div>
        )}

        <form onSubmit={handleSubmit} style={{ display: "grid", gap: "1.25rem" }}>
          {/* Email vs Mobile Number tab pills */}
          <div style={{ display: "flex", gap: "0.5rem", background: "var(--bg-3)", padding: "4px", borderRadius: "10px" }}>
            <button
              type="button"
              onClick={() => handleSwitchTab("email")}
              style={{
                flex: 1,
                padding: "0.5rem",
                borderRadius: "8px",
                border: "none",
                background: loginMethod === "email" ? "var(--accent)" : "transparent",
                color: loginMethod === "email" ? "#fff" : "var(--text)",
                fontSize: "0.85rem",
                fontWeight: 600,
                cursor: "pointer",
                transition: "background 0.2s",
              }}
            >
              Email
            </button>
            <button
              type="button"
              onClick={() => handleSwitchTab("mobile")}
              style={{
                flex: 1,
                padding: "0.5rem",
                borderRadius: "8px",
                border: "none",
                background: loginMethod === "mobile" ? "var(--accent)" : "transparent",
                color: loginMethod === "mobile" ? "#fff" : "var(--text)",
                fontSize: "0.85rem",
                fontWeight: 600,
                cursor: "pointer",
                transition: "background 0.2s",
              }}
            >
              Mobile Number
            </button>
          </div>

          {loginMethod === "email" ? (
            <>
              <div style={{ display: "grid", gap: "0.4rem" }}>
                <label className="section-label" style={{ fontSize: "0.68rem" }}>
                  Email Address
                </label>
                <input
                  type="email"
                  className="input"
                  placeholder="name@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  disabled={submitting}
                />
              </div>

              <div style={{ display: "grid", gap: "0.4rem" }}>
                <label className="section-label" style={{ fontSize: "0.68rem" }}>
                  Password
                </label>
                <div style={{ position: "relative" }}>
                  <input
                    type={showPassword ? "text" : "password"}
                    className="input"
                    placeholder="Min. 6 characters"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    disabled={submitting}
                    style={{ paddingRight: "40px", width: "100%" }}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    style={{
                      position: "absolute",
                      right: "12px",
                      top: "50%",
                      transform: "translateY(-50%)",
                      background: "none",
                      border: "none",
                      cursor: "pointer",
                      color: "var(--text-muted)",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                    }}
                  >
                    {showPassword ? (
                      <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" style={{ width: "20px", height: "20px" }}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M3.98 8.223A10.477 10.477 0 001.934 12C3.226 16.338 7.244 19.5 12 19.5c.993 0 1.953-.138 2.863-.395M6.228 6.228A10.45 10.45 0 0112 4.5c4.756 0 8.773 3.162 10.065 7.498a10.523 10.523 0 01-4.293 5.774M6.228 6.228L3 3m3.228 3.228l3.65 3.65m7.815 7.815L21 21m-3.955-3.955l-3.65-3.65m0 0a3 3 0 10-4.243-4.243m4.242 4.242L9.88 9.88" />
                      </svg>
                    ) : (
                      <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" style={{ width: "20px", height: "20px" }}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M2.036 12.322a1.012 1.012 0 010-.639C3.423 7.51 7.36 4.5 12 4.5c4.638 0 8.573 3.007 9.963 7.178.07.207.07.431 0 .639C20.577 16.49 16.64 19.5 12 19.5c-4.638 0-8.573-3.007-9.963-7.178z" />
                        <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                      </svg>
                    )}
                  </button>
                </div>
              </div>

              <div style={{ display: "grid", gap: "0.4rem" }}>
                <label className="section-label" style={{ fontSize: "0.68rem" }}>
                  Confirm Password
                </label>
                <div style={{ position: "relative" }}>
                  <input
                    type={showConfirmPassword ? "text" : "password"}
                    className="input"
                    placeholder="••••••••"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    required
                    disabled={submitting}
                    style={{ paddingRight: "40px", width: "100%" }}
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    style={{
                      position: "absolute",
                      right: "12px",
                      top: "50%",
                      transform: "translateY(-50%)",
                      background: "none",
                      border: "none",
                      cursor: "pointer",
                      color: "var(--text-muted)",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                    }}
                  >
                    {showConfirmPassword ? (
                      <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" style={{ width: "20px", height: "20px" }}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M3.98 8.223A10.477 10.477 0 001.934 12C3.226 16.338 7.244 19.5 12 19.5c.993 0 1.953-.138 2.863-.395M6.228 6.228A10.45 10.45 0 0112 4.5c4.756 0 8.773 3.162 10.065 7.498a10.523 10.523 0 01-4.293 5.774M6.228 6.228L3 3m3.228 3.228l3.65 3.65m7.815 7.815L21 21m-3.955-3.955l-3.65-3.65m0 0a3 3 0 10-4.243-4.243m4.242 4.242L9.88 9.88" />
                      </svg>
                    ) : (
                      <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" style={{ width: "20px", height: "20px" }}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M2.036 12.322a1.012 1.012 0 010-.639C3.423 7.51 7.36 4.5 12 4.5c4.638 0 8.573 3.007 9.963 7.178.07.207.07.431 0 .639C20.577 16.49 16.64 19.5 12 19.5c-4.638 0-8.573-3.007-9.963-7.178z" />
                        <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                      </svg>
                    )}
                  </button>
                </div>
              </div>
            </>
          ) : (
            <>
              {!showOtpInput ? (
                <div style={{ display: "grid", gap: "0.4rem" }}>
                  <label className="section-label" style={{ fontSize: "0.68rem" }}>
                    Mobile Number
                  </label>
                  <div style={{ display: "flex", gap: "0.5rem" }}>
                    <select
                      className="input"
                      value={countryCode}
                      onChange={(e) => setCountryCode(e.target.value)}
                      style={{ width: "95px", background: "var(--bg-2)", color: "#fff", border: "1px solid var(--border)", borderRadius: "8px", height: "42px" }}
                    >
                      <option value="+91">🇮🇳 +91</option>
                      <option value="+1">🇺🇸 +1</option>
                      <option value="+44">🇬🇧 +44</option>
                      <option value="+61">🇦🇺 +61</option>
                      <option value="+971">🇦🇪 +971</option>
                      <option value="+65">🇸🇬 +65</option>
                    </select>
                    <input
                      type="tel"
                      className="input"
                      placeholder="10-digit mobile number"
                      maxLength={10}
                      value={mobileNumber}
                      onChange={(e) => setMobileNumber(e.target.value.replace(/\D/g, ""))}
                      required
                      disabled={submitting}
                      style={{ flex: 1 }}
                    />
                  </div>
                </div>
              ) : (
                <div style={{ display: "grid", gap: "0.4rem" }}>
                  <label className="section-label" style={{ fontSize: "0.68rem" }}>
                    Enter 6-digit OTP
                  </label>
                  <input
                    type="text"
                    className="input"
                    placeholder="123456"
                    maxLength={6}
                    value={otpToken}
                    onChange={(e) => setOtpToken(e.target.value.replace(/\D/g, ""))}
                    required
                    disabled={submitting}
                  />
                  <p style={{ fontSize: "0.75rem", color: "var(--text-muted)", marginTop: "0.2rem" }}>
                    OTP sent to {countryCode} {mobileNumber}
                  </p>
                </div>
              )}
            </>
          )}

          <button
            type="submit"
            className="btn-primary"
            style={{
              width: "100%",
              justifyContent: "center",
              padding: "0.75rem",
              fontSize: "0.95rem",
              marginTop: "0.5rem",
            }}
            disabled={submitting}
          >
            {submitting ? (
              <span className="spinner" style={{ width: 18, height: 18, margin: "0 auto" }} />
            ) : loginMethod === "email" ? (
              "Sign Up →"
            ) : !showOtpInput ? (
              "Send OTP →"
            ) : (
              "Verify OTP →"
            )}
          </button>

          <div style={{ display: "flex", alignItems: "center", margin: "0.5rem 0", gap: "0.5rem" }}>
            <div style={{ flex: 1, height: 1, background: "var(--border)" }} />
            <span style={{ fontSize: "0.75rem", color: "var(--text-muted)" }}>or</span>
            <div style={{ flex: 1, height: 1, background: "var(--border)" }} />
          </div>

          <button
            type="button"
            className="btn-secondary"
            onClick={handleGoogleLogin}
            style={{
              width: "100%",
              justifyContent: "center",
              padding: "0.75rem",
              fontSize: "0.95rem",
            }}
          >
            Continue with Google
          </button>
        </form>

        <div style={{ textAlign: "center", marginTop: "1.5rem" }}>
          <p style={{ color: "var(--text-muted)", fontSize: "0.85rem" }}>
            Already have an account?{" "}
            <Link
              href="/login"
              style={{
                color: "var(--accent)",
                textDecoration: "none",
                fontWeight: 600,
              }}
            >
              Log In
            </Link>
          </p>
        </div>
      </div>
    </main>
  );
}
