"use client";
import { useEffect, useState } from "react";
import Link from "next/link";
import Navbar from "@/components/Navbar";
import { ConfirmationModal } from "@/components/ui/ConfirmationModal";
import { useToast } from "@/components/ui/toast-1";
import { ShieldCheck, BarChart2, Users, Bot, Brain, CreditCard, Megaphone } from "lucide-react";
import TabNavigation from "@/components/ui/TabNavigation";

interface UserProfile {
  id: string;
  email: string;
  role: string;
  created_at: string;
  has_completed_onboarding: boolean;
}

export default function AdminUsersPage() {
  const { showToast } = useToast();
  const [users, setUsers] = useState<UserProfile[]>([]);
  const [loading, setLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState("");
  const [updatingId, setUpdatingId] = useState<string | null>(null);
  const [roleConfirm, setRoleConfirm] = useState<{
    userId: string;
    currentRole: string;
    confirmMsg: string;
    actionType: "role" | "suspend" | "delete";
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
    setRoleConfirm({ userId, currentRole, confirmMsg, actionType: "role" });
  };

  const handleSuspendTrigger = (userId: string, currentRole: string) => {
    const isSuspended = currentRole === "suspended";
    const confirmMsg = isSuspended
      ? "Are you sure you want to activate this user? They will regain access to the platform."
      : "Are you sure you want to suspend this user? They will immediately lose access to their dashboard and resumes.";
    setRoleConfirm({ userId, currentRole, confirmMsg, actionType: "suspend" });
  };

  const handleDeleteTrigger = (userId: string) => {
    setRoleConfirm({ 
      userId, 
      currentRole: "", 
      confirmMsg: "Are you sure you want to permanently delete this user profile? This action cannot be undone.", 
      actionType: "delete" 
    });
  };

  const executeAction = async () => {
    if (!roleConfirm) return;
    const { userId, currentRole, actionType } = roleConfirm;
    
    setUpdatingId(userId);
    try {
      if (actionType === "delete") {
        const res = await fetch("/api/admin/users", {
          method: "DELETE",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ userId }),
        });

        if (!res.ok) {
          const errData = await res.json();
          throw new Error(errData.error || "Failed to delete user.");
        }

        setUsers((prev) => prev.filter((u) => u.id !== userId));
        showToast("User deleted successfully.", "success");
      } else {
        let newRole = currentRole;
        if (actionType === "role") {
          newRole = currentRole === "admin" ? "user" : "admin";
        } else if (actionType === "suspend") {
          newRole = currentRole === "suspended" ? "user" : "suspended";
        }

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
        showToast(`User ${actionType === "suspend" ? (newRole === "suspended" ? "suspended" : "activated") : "role updated"} successfully.`, "success");
      }
    } catch (err: any) {
      showToast(err.message || "Error performing action.", "error");
    } finally {
      setUpdatingId(null);
      setRoleConfirm(null);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  return (
    <div className="min-h-screen bg-[var(--bg-page)] text-[var(--text)] relative overflow-hidden transition-colors duration-300">
      {/* Premium background radial elements */}
      <div className="absolute top-20 right-10 w-96 h-96 bg-indigo-500/5 dark:bg-indigo-500/[0.03] rounded-full blur-3xl -z-10" />
      <div className="absolute bottom-20 left-10 w-96 h-96 bg-purple-500/5 dark:bg-purple-500/[0.03] rounded-full blur-3xl -z-10" />
      
      <div className="relative z-10">
        <Navbar />
        
        <main className="max-w-7xl mx-auto px-6 py-10 space-y-10">
          
          {/* Header */}
          <div className="space-y-2">
            <span className="text-[10px] font-bold text-indigo-600 dark:text-indigo-400 uppercase tracking-widest bg-indigo-500/10 px-3 py-1 rounded-full border border-indigo-500/20">
              System Control Room
            </span>
            <h1 className="text-3xl md:text-4xl font-extrabold font-['Syne',sans-serif] tracking-tight flex items-center gap-2 mt-2">
              <Users size={32} className="text-indigo-600 dark:text-indigo-400" />
              User Management
            </h1>
            <p className="text-sm text-slate-600 dark:text-[#9ea3c8] max-w-2xl leading-relaxed">
              Promote or demote administrators, inspect onboarding status, and review account registration history.
            </p>
          </div>

          {/* Navigation Tabs */}
          <TabNavigation activeTab="users" />

          {errorMsg && (
            <div className="p-4 rounded-xl bg-rose-500/10 border-l-4 border-rose-500 text-rose-300 text-sm">
              {errorMsg}
            </div>
          )}

          {loading ? (
            <div className="flex flex-col items-center justify-center py-24 rounded-2xl bg-white/80 dark:bg-white/[0.02] border border-slate-200/60 dark:border-white/5 shadow-sm dark:shadow-xl">
              <div className="spinner mb-4 w-10 h-10" />
              <p className="text-sm text-slate-500 dark:text-[#9ea3c8]">Fetching registered user profiles...</p>
            </div>
          ) : users.length === 0 ? (
            <div className="p-12 text-center rounded-2xl bg-white/80 dark:bg-white/[0.02] border border-slate-200/60 dark:border-white/5 text-slate-500 dark:text-gray-400 shadow-sm">
              No registered user profiles found. Ensure the user_profiles table is populated in Supabase.
            </div>
          ) : (
            <div className="rounded-2xl bg-white/80 dark:bg-slate-950/40 dark:bg-gradient-to-br dark:from-white/[0.05] dark:to-white/[0.01] backdrop-blur-xl border border-slate-200/60 dark:border-white/10 shadow-sm dark:shadow-xl overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full border-collapse text-left text-xs md:text-sm">
                  <thead>
                    <tr className="border-b border-slate-200 dark:border-white/10 bg-slate-50 dark:bg-white/[0.01]">
                      <th className="px-6 py-4 font-bold text-slate-500 dark:text-gray-400 uppercase tracking-wider text-[10px]">User Email</th>
                      <th className="px-6 py-4 font-bold text-slate-500 dark:text-gray-400 uppercase tracking-wider text-[10px]">Platform Role</th>
                      <th className="px-6 py-4 font-bold text-slate-500 dark:text-gray-400 uppercase tracking-wider text-[10px]">Onboarding</th>
                      <th className="px-6 py-4 font-bold text-slate-500 dark:text-gray-400 uppercase tracking-wider text-[10px]">Joined Date</th>
                      <th className="px-6 py-4 font-bold text-slate-500 dark:text-gray-400 uppercase tracking-wider text-[10px] text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {users.map((profile) => (
                      <tr key={profile.id} className="border-b border-slate-100 dark:border-white/[0.02] hover:bg-slate-50/50 dark:hover:bg-white/[0.01] transition duration-200">
                        <td className="px-6 py-4 font-semibold text-slate-900 dark:text-white">{profile.email}</td>
                        <td className="px-6 py-4">
                          <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider ${
                            profile.role === "admin" 
                              ? "bg-rose-500/10 text-rose-600 dark:text-rose-400 border border-rose-500/20" 
                              : profile.role === "suspended" 
                                ? "bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20" 
                                : "bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 border border-indigo-500/20"
                          }`}>
                            {profile.role}
                          </span>
                        </td>
                        <td className="px-6 py-4">
                          {profile.has_completed_onboarding ? (
                            <span className="text-emerald-600 dark:text-emerald-400 font-medium">✓ Completed</span>
                          ) : (
                            <span className="text-slate-400 dark:text-gray-500">Incomplete</span>
                          )}
                        </td>
                        <td className="px-6 py-4 text-slate-500 dark:text-gray-400">
                          {new Date(profile.created_at).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" })}
                        </td>
                        <td className="px-6 py-4 text-right">
                          <div className="flex gap-2 justify-end">
                            <button
                              onClick={() => handleRoleChangeTrigger(profile.id, profile.role)}
                              disabled={updatingId === profile.id || profile.role === "suspended"}
                              className="px-3 py-1.5 bg-slate-50 hover:bg-slate-100 dark:bg-white/5 dark:hover:bg-white/10 border border-slate-200 dark:border-white/10 hover:border-slate-300 rounded-lg text-xs font-bold cursor-pointer transition disabled:opacity-40"
                              style={{
                                color: profile.role === "admin" ? "#ef4444" : "var(--accent)"
                              }}
                            >
                              {profile.role === "admin" ? "Demote" : "Make Admin"}
                            </button>
                            
                            <button
                              onClick={() => handleSuspendTrigger(profile.id, profile.role)}
                              disabled={updatingId === profile.id || profile.role === "admin"}
                              className="px-3 py-1.5 bg-slate-50 hover:bg-slate-100 dark:bg-white/5 dark:hover:bg-white/10 border border-slate-200 dark:border-white/10 hover:border-slate-300 rounded-lg text-xs font-bold cursor-pointer transition disabled:opacity-40"
                              style={{
                                color: profile.role === "suspended" ? "#10b981" : "#f59e0b"
                              }}
                            >
                              {profile.role === "suspended" ? "Activate" : "Suspend"}
                            </button>

                            <button
                              onClick={() => handleDeleteTrigger(profile.id)}
                              disabled={updatingId === profile.id || profile.role === "admin"}
                              className="px-3 py-1.5 bg-rose-50 hover:bg-rose-100 dark:bg-rose-950/20 dark:hover:bg-rose-900/30 border border-rose-200 dark:border-rose-900/30 rounded-lg text-xs font-bold cursor-pointer transition text-rose-600 dark:text-rose-400 disabled:opacity-40"
                            >
                              Delete
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

        </main>
      </div>
      <ConfirmationModal
        isOpen={!!roleConfirm}
        title={
          roleConfirm?.actionType === "delete" 
            ? "Delete User Profile" 
            : roleConfirm?.actionType === "suspend"
              ? (roleConfirm?.currentRole === "suspended" ? "Activate User" : "Suspend User")
              : "Change User Role"
        }
        message={roleConfirm?.confirmMsg || ""}
        confirmLabel={
          roleConfirm?.actionType === "delete"
            ? "Yes, Delete"
            : roleConfirm?.actionType === "suspend"
              ? (roleConfirm?.currentRole === "suspended" ? "Activate" : "Suspend")
              : "Confirm Change"
        }
        cancelLabel="Cancel"
        isDanger={roleConfirm?.actionType === "delete" || (roleConfirm?.actionType === "suspend" && roleConfirm?.currentRole !== "suspended") || roleConfirm?.currentRole === "admin"}
        onConfirm={executeAction}
        onCancel={() => setRoleConfirm(null)}
      />
    </div>
  );
}
