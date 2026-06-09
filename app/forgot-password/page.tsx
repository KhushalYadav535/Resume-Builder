"use client";
import { useState } from "react";
import Link from "next/link";
import { createClient } from "@/utils/supabase/client";

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [errorMsg, setErrorMsg] = useState("");
  const supabase = createClient();

  const handleReset = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setMessage("");
    setErrorMsg("");

    try {
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/reset-password`,
      });

      if (error) {
        setErrorMsg(error.message);
      } else {
        setMessage("A password recovery link has been dispatched to your email address.");
      }
    } catch (err: any) {
      setErrorMsg("An unexpected failure occurred. Please try again.");
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
            Recover Password
          </h1>
          <p style={{ color: "var(--text-muted)", fontSize: "0.88rem" }}>
            Enter your email to receive a password reset link
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

        <form onSubmit={handleReset} style={{ display: "grid", gap: "1.25rem" }}>
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
              disabled={loading}
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
            disabled={loading}
          >
            {loading ? (
              <span className="spinner" style={{ width: 18, height: 18, margin: "0 auto" }} />
            ) : (
              "Send Reset Link →"
            )}
          </button>
        </form>

        <div style={{ textAlign: "center", marginTop: "1.5rem" }}>
          <Link
            href="/login"
            style={{
              color: "var(--text-muted)",
              textDecoration: "none",
              fontSize: "0.85rem",
              fontWeight: 500,
            }}
          >
            ← Back to Log In
          </Link>
        </div>
      </div>
    </main>
  );
}
