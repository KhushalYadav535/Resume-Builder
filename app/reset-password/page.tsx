"use client";
import { useState, useEffect, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { createClient } from "@/utils/supabase/client";

function ResetPasswordForm() {
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [errorMsg, setErrorMsg] = useState("");
  const router = useRouter();
  const searchParams = useSearchParams();
  const supabase = createClient();

  useEffect(() => {
    const error = searchParams.get("error");
    const description = searchParams.get("error_description");
    const code = searchParams.get("error_code");
    
    if (error) {
      if (code === "otp_expired" || error === "access_denied") {
        setErrorMsg("This password reset link has expired or is invalid. Please request a new recovery link.");
      } else {
        setErrorMsg(description || "An error occurred with this password link.");
      }
    }
  }, [searchParams]);

  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setMessage("");
    setErrorMsg("");

    if (password !== confirmPassword) {
      setErrorMsg("Passwords do not match. Please verify.");
      setLoading(false);
      return;
    }

    if (password.length < 6) {
      setErrorMsg("Password must be at least 6 characters long.");
      setLoading(false);
      return;
    }

    try {
      const { error } = await supabase.auth.updateUser({
        password: password,
      });

      if (error) {
        setErrorMsg(error.message);
      } else {
        setMessage("Password updated successfully. Redirecting you to login...");
        setTimeout(() => {
          router.push("/login");
        }, 2500);
      }
    } catch (err: any) {
      setErrorMsg("An unexpected failure occurred during password update.");
    } finally {
      setLoading(false);
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
          left: "30%",
          width: "600px",
          height: "600px",
          background: "radial-gradient(circle, rgba(108,99,255,0.1) 0%, transparent 70%)",
          pointerEvents: "none",
        }}
      />

      <div
        className="card glow fade-in-up"
        style={{
          width: "100%",
          maxWidth: "420px",
          padding: "2.5rem 2rem",
          background: "rgba(19, 19, 30, 0.8)",
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
            Reset Password
          </h1>
          <p style={{ color: "var(--text-muted)", fontSize: "0.88rem" }}>
            Enter your new password below
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
              lineHeight: 1.4
            }}
          >
            {errorMsg}
          </div>
        )}

        {message && (
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
            {message}
          </div>
        )}

        <form onSubmit={handleUpdate} style={{ display: "grid", gap: "1.25rem" }}>
          <div style={{ display: "grid", gap: "0.4rem" }}>
            <label className="section-label" style={{ fontSize: "0.68rem" }}>
              New Password
            </label>
            <input
              type="password"
              className="input"
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              disabled={loading || !!searchParams.get("error")}
            />
          </div>

          <div style={{ display: "grid", gap: "0.4rem" }}>
            <label className="section-label" style={{ fontSize: "0.68rem" }}>
              Confirm Password
            </label>
            <input
              type="password"
              className="input"
              placeholder="••••••••"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              required
              disabled={loading || !!searchParams.get("error")}
            />
          </div>

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
            disabled={loading || !!searchParams.get("error")}
          >
            {loading ? (
              <span className="spinner" style={{ width: 18, height: 18, margin: "0 auto" }} />
            ) : (
              "Update Password →"
            )}
          </button>
        </form>

        <div style={{ textAlign: "center", marginTop: "1.5rem" }}>
          <Link
            href="/forgot-password"
            style={{
              color: "var(--text-muted)",
              textDecoration: "none",
              fontSize: "0.85rem",
              fontWeight: 500,
            }}
          >
            ← Request a new reset link
          </Link>
        </div>
      </div>
    </main>
  );
}

export default function ResetPasswordPage() {
  return (
    <Suspense fallback={
      <div style={{ minHeight: "100vh", background: "var(--bg)", display: "flex", alignItems: "center", justifyContent: "center" }}>
        <div className="spinner" style={{ width: 32, height: 32 }} />
      </div>
    }>
      <ResetPasswordForm />
    </Suspense>
  );
}
