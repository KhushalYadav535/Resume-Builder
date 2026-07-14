"use client";

import Link from "next/link";
import { AlertTriangle } from "lucide-react";

export default function SuspendedPage() {
  return (
    <div style={{
      minHeight: "100vh",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      background: "var(--bg)",
      padding: "2rem"
    }}>
      <div style={{
        maxWidth: "480px",
        width: "100%",
        background: "var(--card)",
        padding: "3rem 2rem",
        borderRadius: "16px",
        border: "1px solid var(--border)",
        textAlign: "center",
        boxShadow: "0 8px 30px rgba(0,0,0,0.04)"
      }}>
        <div style={{ 
          width: 64, 
          height: 64, 
          borderRadius: "50%", 
          background: "rgba(245, 158, 11, 0.1)", 
          display: "flex", 
          alignItems: "center", 
          justifyContent: "center",
          margin: "0 auto 1.5rem"
        }}>
          <AlertTriangle size={32} className="text-amber-500" />
        </div>
        
        <h1 style={{ 
          fontFamily: "Syne, sans-serif", 
          fontSize: "1.75rem", 
          fontWeight: 800, 
          color: "var(--text)",
          marginBottom: "1rem"
        }}>
          Account Suspended
        </h1>
        
        <p style={{ 
          color: "var(--text-muted)", 
          fontSize: "0.95rem", 
          lineHeight: 1.6,
          marginBottom: "2rem"
        }}>
          Your access to the Resume Builder platform has been temporarily suspended by an administrator. 
          You can no longer access your dashboard or edit your resumes.
        </p>

        <Link href="mailto:support@example.com" style={{
            display: "inline-block",
            width: "100%",
            padding: "0.8rem",
            background: "var(--accent)",
            color: "white",
            fontWeight: 700,
            borderRadius: "8px",
            textDecoration: "none"
        }}>
          Contact Support
        </Link>
      </div>
    </div>
  );
}
