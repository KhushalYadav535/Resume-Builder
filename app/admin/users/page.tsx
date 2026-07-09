"use client";
import { useEffect, useState } from "react";
import Link from "next/link";
import Navbar from "@/components/Navbar";
import { ConfirmationModal } from "@/components/ui/ConfirmationModal";

interface UserProfile {
  id: string;
  email: string;
  role: string;
  created_at: string;
  has_completed_onboarding: boolean;
}

export default function AdminUsersPage() {
  const [users, setUsers] = useState<UserProfile[]>([]);
  const [loading, setLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState("");
  const [updatingId, setUpdatingId] = useState<string | null>(null);
  const [roleConfirm, setRoleConfirm] = useState<{
    userId: string;
    currentRole: string;
    confirmMsg: string;
  } | null>(null);

  const fetchUsers = async () => {
    setLoading(true);
    setErrorMsg("");
    try {
      const res = await fetch("/api/admin/users");
      if (!res.ok) {
        throw new Error("Failed to load platform users list.");
      }
      const data = await res.json();
      setUsers(Array.isArray(data) ? data : []);
    } catch (err: any) {
      setErrorMsg(err.message || "An unexpected error occurred.");
    } finally {
      setLoading(false);
    }
  };

  const handleRoleChangeTrigger = (userId: string, currentRole: string) => {
    const confirmMsg = currentRole === "admin" 
      ? "Are you sure you want to demote this administrator to user? They will lose access to all admin dashboards."
      : "Are you sure you want to promote this user to administrator? They will gain full platform metrics and log visibility.";
    setRoleConfirm({ userId, currentRole, confirmMsg });
  };

  const executeRoleChange = async (userId: string, currentRole: string) => {
    const newRole = currentRole === "admin" ? "user" : "admin";
    setUpdatingId(userId);
    try {
      const res = await fetch("/api/admin/users", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId, role: newRole }),
      });

      if (!res.ok) {
        const errData = await res.json();
        throw new Error(errData.error || "Failed to update user role.");
      }

      setUsers((prev) =>
        prev.map((u) => (u.id === userId ? { ...u, role: newRole } : u))
      );
    } catch (err: any) {
      alert(err.message || "Error updating role.");
    } finally {
      setUpdatingId(null);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  return (
    <div style={{ minHeight: "100vh", background: "var(--bg)" }}>
      <Navbar />
      <div style={{ maxWidth: "1100px", margin: "0 auto", padding: "2.5rem 1.5rem" }}>

        {/* Title */}
        <div style={{ marginBottom: "2rem" }}>
          <p className="section-label" style={{ marginBottom: "0.5rem" }}>System Directory</p>
          <h1 style={{ fontFamily: "Syne, sans-serif", fontSize: "2.2rem", fontWeight: 800 }}>
            👥 User Management
          </h1>
          <p style={{ color: "var(--text-muted)", fontSize: "0.9rem", marginTop: "0.25rem" }}>
            Promote or demote administrators, inspect onboarding status, and review account registration history.
          </p>
        </div>

        {/* Navigation Tabs */}
        <div style={{ display: "flex", gap: "0.5rem", borderBottom: "1px solid var(--border)", marginBottom: "2rem", overflowX: "auto", whiteSpace: "nowrap" }}>
          <Link href="/admin" style={{ textDecoration: "none" }}>
            <button style={{ padding: "0.6rem 1.2rem", background: "transparent", border: "none", color: "var(--text-muted)", fontWeight: 600, fontSize: "0.85rem", cursor: "pointer" }}>
              📊 Analytics Overview
            </button>
          </Link>
          <Link href="/admin/users" style={{ textDecoration: "none" }}>
            <button style={{ padding: "0.6rem 1.2rem", background: "rgba(108,99,255,0.08)", border: "none", borderBottom: "2px solid var(--accent)", color: "var(--accent)", fontWeight: 700, fontSize: "0.85rem", cursor: "pointer" }}>
              👥 User Management
            </button>
          </Link>
          <Link href="/admin/ai-usage" style={{ textDecoration: "none" }}>
            <button style={{ padding: "0.6rem 1.2rem", background: "transparent", border: "none", color: "var(--text-muted)", fontWeight: 600, fontSize: "0.85rem", cursor: "pointer" }}>
              🤖 AI Usage Log
            </button>
          </Link>
        </div>

        {errorMsg && (
          <div style={{ color: "#ff6584", fontSize: "0.88rem", padding: "0.9rem 1.2rem", background: "rgba(255,101,132,0.08)", borderRadius: "10px", borderLeft: "4px solid #ff6584", marginBottom: "2rem" }}>
            {errorMsg}
          </div>
        )}

        {loading ? (
          <div style={{ textAlign: "center", padding: "6rem 2rem", background: "var(--card)", borderRadius: "16px", border: "1px solid var(--border)" }}>
            <div className="spinner" style={{ margin: "0 auto 1rem", width: 32, height: 32 }} />
            <p style={{ color: "var(--text-muted)", fontSize: "0.88rem" }}>Fetching registered user profiles...</p>
          </div>
        ) : users.length === 0 ? (
          <div className="card" style={{ textAlign: "center", padding: "3rem" }}>
            No registered users profiles found. Ensure the user_profiles table is populated in Supabase.
          </div>
        ) : (
          <div className="card" style={{ padding: 0, overflowX: "auto" }}>
            <table style={{ width: "100%", borderCollapse: "collapse", textAlign: "left", fontSize: "0.88rem" }}>
              <thead>
                <tr style={{ borderBottom: "1px solid var(--border)", background: "rgba(255,255,255,0.01)" }}>
                  <th style={{ padding: "1rem 1.2rem", fontWeight: 700, color: "var(--text-muted)", textTransform: "uppercase", fontSize: "0.74rem" }}>User Email</th>
                  <th style={{ padding: "1rem 1.2rem", fontWeight: 700, color: "var(--text-muted)", textTransform: "uppercase", fontSize: "0.74rem" }}>Platform Role</th>
                  <th style={{ padding: "1rem 1.2rem", fontWeight: 700, color: "var(--text-muted)", textTransform: "uppercase", fontSize: "0.74rem" }}>Onboarding</th>
                  <th style={{ padding: "1rem 1.2rem", fontWeight: 700, color: "var(--text-muted)", textTransform: "uppercase", fontSize: "0.74rem" }}>Joined Date</th>
                  <th style={{ padding: "1rem 1.2rem", fontWeight: 700, color: "var(--text-muted)", textTransform: "uppercase", fontSize: "0.74rem", textAlign: "right" }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {users.map((profile) => (
                  <tr key={profile.id} style={{ borderBottom: "1px solid rgba(255,255,255,0.03)", transition: "background 0.2s" }} className="table-row-hover">
                    <td style={{ padding: "1rem 1.2rem", fontWeight: 600, color: "var(--text)" }}>{profile.email}</td>
                    <td style={{ padding: "1rem 1.2rem" }}>
                      <span className={`tag ${profile.role === "admin" ? "tag-red" : "tag-purple"}`} style={{ fontSize: "0.7rem", textTransform: "uppercase", fontWeight: 700 }}>
                        {profile.role}
                      </span>
                    </td>
                    <td style={{ padding: "1rem 1.2rem" }}>
                      {profile.has_completed_onboarding ? (
                        <span style={{ color: "#43e97b" }}>✓ Completed</span>
                      ) : (
                        <span style={{ color: "var(--text-dim)" }}>Incomplete</span>
                      )}
                    </td>
                    <td style={{ padding: "1rem 1.2rem", color: "var(--text-muted)" }}>
                      {new Date(profile.created_at).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" })}
                    </td>
                    <td style={{ padding: "1rem 1.2rem", textAlign: "right" }}>
                      <button
                        onClick={() => handleRoleChangeTrigger(profile.id, profile.role)}
                        disabled={updatingId === profile.id}
                        className="btn-secondary"
                        style={{
                          padding: "0.35rem 0.8rem",
                          fontSize: "0.78rem",
                          borderColor: profile.role === "admin" ? "#ff6584" : "var(--accent)",
                          color: profile.role === "admin" ? "#ff6584" : "var(--accent)",
                        }}
                      >
                        {updatingId === profile.id 
                          ? "Saving..." 
                          : profile.role === "admin" 
                            ? "Demote to User" 
                            : "Make Admin"}
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

      </div>
      <ConfirmationModal
        isOpen={roleConfirm !== null}
        title="Change User Role?"
        message={roleConfirm ? roleConfirm.confirmMsg : ""}
        confirmLabel="Proceed"
        cancelLabel="Cancel"
        isDanger={roleConfirm ? roleConfirm.currentRole === "admin" : false}
        onConfirm={() => {
          if (roleConfirm) {
            executeRoleChange(roleConfirm.userId, roleConfirm.currentRole);
            setRoleConfirm(null);
          }
        }}
        onCancel={() => setRoleConfirm(null)}
      />
    </div>
  );
}
