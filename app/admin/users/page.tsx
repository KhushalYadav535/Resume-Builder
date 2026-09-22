"use client";

import { useEffect, useState, useMemo } from "react";
import { ConfirmationModal } from "@/components/ui/ConfirmationModal";
import { useToast } from "@/components/ui/toast-1";
import {
  Users,
  ShieldCheck,
  Sparkles,
  Search,
  X,
  RefreshCw,
  UserCheck,
  UserX,
  ShieldAlert,
  Clock,
  Filter,
  CheckCircle2,
  AlertCircle,
  Trash2,
  Lock,
  Unlock,
  Mail,
  Award,
  Calendar,
} from "lucide-react";

interface UserProfile {
  id: string;
  email: string;
  role: string;
  created_at: string;
  has_completed_onboarding: boolean;
}

const UsersSkeleton = () => (
  <div className="space-y-6 animate-pulse">
    <div className="h-28 rounded-2xl bg-[var(--bg-elevated)] border border-[var(--border)]" />
    <div className="h-[420px] rounded-2xl bg-[var(--bg-elevated)] border border-[var(--border)]" />
  </div>
);

export default function AdminUsersPage() {
  const { showToast } = useToast();
  const [users, setUsers] = useState<UserProfile[]>([]);
  const [loading, setLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState("");
  const [updatingId, setUpdatingId] = useState<string | null>(null);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [roleFilter, setRoleFilter] = useState<"all" | "admin" | "user" | "suspended">("all");
  const [onboardingFilter, setOnboardingFilter] = useState<"all" | "completed" | "incomplete">("all");

  const [roleConfirm, setRoleConfirm] = useState<{
    userId: string;
    userEmail: string;
    currentRole: string;
    confirmMsg: string;
    actionType: "role" | "suspend" | "delete";
  } | null>(null);

  const fetchUsers = async () => {
    setIsRefreshing(true);
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
      setIsRefreshing(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const handleRoleChangeTrigger = (user: UserProfile) => {
    const confirmMsg =
      user.role === "admin"
        ? `Are you sure you want to demote ${user.email} from administrator to standard professional user? They will lose access to administrative telemetry.`
        : `Are you sure you want to promote ${user.email} to platform administrator? They will receive full access to system metrics, logs, and account management.`;
    setRoleConfirm({
      userId: user.id,
      userEmail: user.email,
      currentRole: user.role,
      confirmMsg,
      actionType: "role",
    });
  };

  const handleSuspendTrigger = (user: UserProfile) => {
    const isSuspended = user.role === "suspended";
    const confirmMsg = isSuspended
      ? `Are you sure you want to reactivate ${user.email}? They will regain full access to their dashboard and resumes.`
      : `Are you sure you want to suspend ${user.email}? They will immediately lose access to their account and active sessions.`;
    setRoleConfirm({
      userId: user.id,
      userEmail: user.email,
      currentRole: user.role,
      confirmMsg,
      actionType: "suspend",
    });
  };

  const handleDeleteTrigger = (user: UserProfile) => {
    setRoleConfirm({
      userId: user.id,
      userEmail: user.email,
      currentRole: "",
      confirmMsg: `Are you sure you want to permanently delete ${user.email}? All associated data, resumes, and logs will be permanently erased.`,
      actionType: "delete",
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
        showToast("User profile permanently deleted.", "success");
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
        showToast(
          `User ${
            actionType === "suspend"
              ? newRole === "suspended"
                ? "suspended"
                : "reactivated"
              : "privileges updated"
          } successfully.`,
          "success"
        );
      }
    } catch (err: any) {
      showToast(err.message || "Error performing action.", "error");
    } finally {
      setUpdatingId(null);
      setRoleConfirm(null);
    }
  };

  // Metrics computation
  const totalCount = users.length;
  const adminCount = users.filter((u) => u.role === "admin").length;
  const onboardedCount = users.filter((u) => u.has_completed_onboarding).length;
  const suspendedCount = users.filter((u) => u.role === "suspended").length;

  // Filtered users list
  const filteredUsers = useMemo(() => {
    return users.filter((u) => {
      const matchesSearch =
        searchQuery.trim() === "" ||
        u.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
        u.id.toLowerCase().includes(searchQuery.toLowerCase());

      const matchesRole =
        roleFilter === "all" || u.role === roleFilter;

      const matchesOnboarding =
        onboardingFilter === "all" ||
        (onboardingFilter === "completed" && u.has_completed_onboarding) ||
        (onboardingFilter === "incomplete" && !u.has_completed_onboarding);

      return matchesSearch && matchesRole && matchesOnboarding;
    });
  }, [users, searchQuery, roleFilter, onboardingFilter]);

  return (
    <div className="space-y-8 font-sans">
      {/* ── EXECUTIVE HEADER ── */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 pb-6 border-b border-[var(--border)]">
        <div className="space-y-2">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-500/10 border border-amber-500/25 text-amber-600 dark:text-amber-400 text-xs font-bold uppercase tracking-wider">
            <Sparkles size={12} className="text-amber-500" />
            <span>UPROLE PLATFORM COMMAND · ACCESS CONTROL & RBAC</span>
          </div>

          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#101B3B] to-[#2563EB] flex items-center justify-center text-white shadow-md border border-white/10 shrink-0">
              <Users size={22} className="text-amber-400" />
            </div>
            <h1 className="text-2xl md:text-3xl font-extrabold tracking-tight text-[var(--text-primary)] font-['Syne',sans-serif]">
              User Access & Role Management
            </h1>
          </div>

          <p className="text-sm text-[var(--text-muted)] max-w-2xl leading-relaxed">
            Manage professional accounts, grant or revoke administrative privileges, audit onboarding velocity, and oversee security status.
          </p>
        </div>

        {/* Action Controls */}
        <div className="flex items-center gap-3 self-start md:self-center shrink-0">
          <button
            onClick={fetchUsers}
            disabled={isRefreshing}
            className="px-3.5 py-2 rounded-xl bg-[var(--bg-elevated)] border border-[var(--border)] text-xs font-bold text-[var(--text-primary)] hover:border-amber-500/40 hover:bg-amber-500/10 transition-all flex items-center gap-2 cursor-pointer shadow-xs"
          >
            <RefreshCw
              size={13}
              className={isRefreshing ? "animate-spin text-amber-500" : "text-[var(--text-muted)]"}
            />
            <span>Refresh Users</span>
          </button>
        </div>
      </div>

      {/* ── METRICS OVERVIEW BAR ── */}
      <section className="bg-[var(--bg-elevated)] border border-[var(--border)] rounded-2xl p-4 md:p-5 shadow-sm backdrop-blur-xl relative overflow-hidden">
        <div className="absolute top-0 left-0 right-0 h-[2px] bg-gradient-to-r from-[#2563EB] via-[#F59E0B] to-[#14B8A6]" />
        
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 divide-y sm:divide-y-0 sm:divide-x divide-[var(--border)]">
          {/* Stat 1: Total Registered */}
          <div className="pt-2 sm:pt-0 sm:px-3 first:px-0">
            <div className="flex items-center gap-2 mb-1 text-xs font-extrabold text-[var(--text-muted)] uppercase tracking-wider">
              <div className="w-5 h-5 rounded-md bg-blue-500/10 text-blue-500 flex items-center justify-center">
                <Users size={12} />
              </div>
              <span>Total Accounts</span>
            </div>
            <div className="text-2xl md:text-3xl font-black text-[var(--text-primary)] font-['Syne',sans-serif]">
              {totalCount}
            </div>
            <div className="text-[11px] text-[var(--text-muted)] mt-0.5">
              Verified registrations
            </div>
          </div>

          {/* Stat 2: Administrators */}
          <div className="pt-2 sm:pt-0 sm:px-3">
            <div className="flex items-center gap-2 mb-1 text-xs font-extrabold text-[var(--text-muted)] uppercase tracking-wider">
              <div className="w-5 h-5 rounded-md bg-amber-500/10 text-amber-500 flex items-center justify-center">
                <ShieldCheck size={12} />
              </div>
              <span>System Admins</span>
            </div>
            <div className="text-2xl md:text-3xl font-black text-amber-500 font-['Syne',sans-serif]">
              {adminCount}
            </div>
            <div className="text-[11px] text-[var(--text-muted)] mt-0.5">
              Full privilege access
            </div>
          </div>

          {/* Stat 3: Onboarded Profiles */}
          <div className="pt-2 sm:pt-0 sm:px-3">
            <div className="flex items-center gap-2 mb-1 text-xs font-extrabold text-[var(--text-muted)] uppercase tracking-wider">
              <div className="w-5 h-5 rounded-md bg-teal-500/10 text-teal-500 flex items-center justify-center">
                <UserCheck size={12} />
              </div>
              <span>Onboarded</span>
            </div>
            <div className="text-2xl md:text-3xl font-black text-teal-500 font-['Syne',sans-serif]">
              {onboardedCount}
            </div>
            <div className="text-[11px] text-[var(--text-muted)] mt-0.5">
              {totalCount > 0 ? `${Math.round((onboardedCount / totalCount) * 100)}% completion rate` : "0%"}
            </div>
          </div>

          {/* Stat 4: Suspended */}
          <div className="pt-2 sm:pt-0 sm:px-3">
            <div className="flex items-center gap-2 mb-1 text-xs font-extrabold text-[var(--text-muted)] uppercase tracking-wider">
              <div className="w-5 h-5 rounded-md bg-rose-500/10 text-rose-500 flex items-center justify-center">
                <ShieldAlert size={12} />
              </div>
              <span>Suspended</span>
            </div>
            <div className="text-2xl md:text-3xl font-black text-rose-500 font-['Syne',sans-serif]">
              {suspendedCount}
            </div>
            <div className="text-[11px] text-[var(--text-muted)] mt-0.5">
              Restricted accounts
            </div>
          </div>
        </div>
      </section>

      {/* ── SEARCH & FILTER CONTROLS ── */}
      <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-4">
        {/* Search Bar */}
        <div className="relative flex-1 max-w-md">
          <Search
            size={15}
            className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[var(--text-muted)] pointer-events-none"
          />
          <input
            type="text"
            placeholder="Search by user email or ID..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-8 py-2 rounded-xl bg-[var(--bg-elevated)] border border-[var(--border)] text-sm text-[var(--text-primary)] placeholder-[var(--text-muted)] focus:outline-none focus:border-amber-500/50 transition-all shadow-xs"
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery("")}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-[var(--text-muted)] hover:text-[var(--text-primary)] text-xs"
            >
              <X size={14} />
            </button>
          )}
        </div>

        {/* Filter Pills */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden">
          <span className="text-xs font-semibold text-[var(--text-muted)] flex items-center gap-1 mr-1 shrink-0">
            <Filter size={12} /> Role:
          </span>
          {[
            { key: "all", label: "All", count: totalCount },
            { key: "admin", label: "Admins", count: adminCount },
            { key: "user", label: "Users", count: totalCount - adminCount - suspendedCount },
            { key: "suspended", label: "Suspended", count: suspendedCount },
          ].map((tab) => {
            const active = roleFilter === tab.key;
            return (
              <button
                key={tab.key}
                onClick={() => setRoleFilter(tab.key as any)}
                className={`px-3 py-1 rounded-lg text-xs font-semibold shrink-0 transition-all cursor-pointer flex items-center gap-1.5 ${
                  active
                    ? "bg-amber-500/15 text-amber-600 dark:text-amber-400 border border-amber-500/30"
                    : "bg-[var(--bg-elevated)] text-[var(--text-muted)] hover:text-[var(--text-primary)] border border-[var(--border)]"
                }`}
              >
                <span>{tab.label}</span>
                <span className="text-[10px] opacity-75 font-mono">({tab.count})</span>
              </button>
            );
          })}
        </div>
      </div>

      {errorMsg && (
        <div className="p-4 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-500 text-sm font-semibold flex items-center gap-2">
          <span>⚠️</span>
          <span>{errorMsg}</span>
        </div>
      )}

      {/* ── USERS TABLE / CARD CONTAINER ── */}
      {loading ? (
        <UsersSkeleton />
      ) : users.length === 0 ? (
        <div className="p-12 text-center rounded-2xl bg-[var(--bg-elevated)] border border-[var(--border)] text-[var(--text-muted)] shadow-sm">
          No registered user profiles found in the database.
        </div>
      ) : filteredUsers.length === 0 ? (
        <div className="p-12 text-center rounded-2xl bg-[var(--bg-elevated)] border border-[var(--border)] text-[var(--text-muted)] shadow-sm space-y-3">
          <p className="text-sm font-medium">No accounts match &ldquo;{searchQuery}&rdquo;</p>
          <button
            onClick={() => {
              setSearchQuery("");
              setRoleFilter("all");
            }}
            className="px-4 py-1.5 rounded-lg text-xs font-bold text-amber-500 bg-amber-500/10 hover:bg-amber-500/20 border border-amber-500/30 transition-all"
          >
            Clear Search & Filters
          </button>
        </div>
      ) : (
        <div className="rounded-2xl bg-[var(--bg-elevated)] border border-[var(--border)] shadow-sm backdrop-blur-xl overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full border-collapse text-left text-xs md:text-sm">
              <thead>
                <tr className="border-b border-[var(--border)] bg-[var(--bg-page)]/60 text-[10px] font-extrabold uppercase tracking-wider text-[var(--text-muted)]">
                  <th className="px-5 py-3.5">User Identity</th>
                  <th className="px-5 py-3.5">Access Role</th>
                  <th className="px-5 py-3.5">Onboarding</th>
                  <th className="px-5 py-3.5">Registered</th>
                  <th className="px-5 py-3.5 text-right">Security Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[var(--border)]">
                {filteredUsers.map((profile) => {
                  const initial = profile.email ? profile.email.charAt(0).toUpperCase() : "U";
                  const isAdmin = profile.role === "admin";
                  const isSuspended = profile.role === "suspended";

                  return (
                    <tr
                      key={profile.id}
                      className="hover:bg-[var(--bg-page)]/40 transition-colors duration-150 group"
                    >
                      {/* Identity: Avatar + Email */}
                      <td className="px-5 py-4">
                        <div className="flex items-center gap-3">
                          <div
                            className={`w-9 h-9 rounded-xl flex items-center justify-center text-xs font-black shadow-xs shrink-0 ${
                              isAdmin
                                ? "bg-gradient-to-br from-[#101B3B] to-[#F59E0B] text-white border border-amber-500/40"
                                : isSuspended
                                ? "bg-rose-500/10 text-rose-500 border border-rose-500/20"
                                : "bg-blue-500/10 text-blue-500 border border-blue-500/20"
                            }`}
                          >
                            {initial}
                          </div>
                          <div className="min-w-0">
                            <div className="font-bold text-[var(--text-primary)] truncate flex items-center gap-2">
                              <span>{profile.email}</span>
                              {isAdmin && (
                                <span className="text-[10px] font-black text-amber-500">👑</span>
                              )}
                            </div>
                            <div className="text-[10px] font-mono text-[var(--text-muted)] truncate max-w-[200px]">
                              ID: {profile.id}
                            </div>
                          </div>
                        </div>
                      </td>

                      {/* Access Role Badge */}
                      <td className="px-5 py-4">
                        <span
                          className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-md text-[10px] font-extrabold uppercase tracking-wider border ${
                            isAdmin
                              ? "bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/30"
                              : isSuspended
                              ? "bg-rose-500/10 text-rose-600 dark:text-rose-400 border-rose-500/30"
                              : "bg-blue-500/10 text-blue-600 dark:text-blue-400 border-blue-500/30"
                          }`}
                        >
                          {isAdmin ? "👑 Administrator" : isSuspended ? "⛔ Suspended" : "Professional"}
                        </span>
                      </td>

                      {/* Onboarding Readiness */}
                      <td className="px-5 py-4">
                        {profile.has_completed_onboarding ? (
                          <span className="inline-flex items-center gap-1 text-[11px] font-bold text-teal-600 dark:text-teal-400 bg-teal-500/10 border border-teal-500/20 px-2 py-0.5 rounded-md">
                            <CheckCircle2 size={12} />
                            <span>Completed</span>
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 text-[11px] font-medium text-[var(--text-muted)] bg-[var(--bg-page)] border border-[var(--border)] px-2 py-0.5 rounded-md">
                            <Clock size={11} />
                            <span>Incomplete</span>
                          </span>
                        )}
                      </td>

                      {/* Registered Date */}
                      <td className="px-5 py-4 text-[11px] text-[var(--text-muted)] font-medium whitespace-nowrap">
                        <div className="flex items-center gap-1.5">
                          <Calendar size={12} className="opacity-60" />
                          <span>
                            {new Date(profile.created_at).toLocaleDateString("en-IN", {
                              day: "numeric",
                              month: "short",
                              year: "numeric",
                            })}
                          </span>
                        </div>
                      </td>

                      {/* Security Actions */}
                      <td className="px-5 py-4 text-right">
                        <div className="flex items-center justify-end gap-2">
                          {/* Promote / Demote */}
                          <button
                            onClick={() => handleRoleChangeTrigger(profile)}
                            disabled={updatingId === profile.id || isSuspended}
                            className={`px-3 py-1.5 rounded-lg text-xs font-bold border transition-all cursor-pointer disabled:opacity-40 shadow-2xs ${
                              isAdmin
                                ? "bg-rose-500/10 hover:bg-rose-500/20 text-rose-600 dark:text-rose-400 border-rose-500/25"
                                : "bg-amber-500/10 hover:bg-amber-500/20 text-amber-600 dark:text-amber-400 border-amber-500/25"
                            }`}
                          >
                            {isAdmin ? "Demote" : "Make Admin"}
                          </button>

                          {/* Suspend / Activate */}
                          <button
                            onClick={() => handleSuspendTrigger(profile)}
                            disabled={updatingId === profile.id || isAdmin}
                            className={`px-3 py-1.5 rounded-lg text-xs font-bold border transition-all cursor-pointer disabled:opacity-40 shadow-2xs ${
                              isSuspended
                                ? "bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 border-emerald-500/25"
                                : "bg-slate-500/10 hover:bg-slate-500/20 text-[var(--text-secondary)] border-[var(--border)]"
                            }`}
                          >
                            {isSuspended ? "Reactivate" : "Suspend"}
                          </button>

                          {/* Delete */}
                          <button
                            onClick={() => handleDeleteTrigger(profile)}
                            disabled={updatingId === profile.id || isAdmin}
                            className="p-1.5 rounded-lg text-[var(--text-muted)] hover:text-rose-500 hover:bg-rose-500/10 border border-transparent hover:border-rose-500/20 transition-all cursor-pointer disabled:opacity-40"
                            title="Permanently Delete User"
                          >
                            <Trash2 size={15} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* ── CONFIRMATION MODAL ── */}
      <ConfirmationModal
        isOpen={!!roleConfirm}
        title={
          roleConfirm?.actionType === "delete"
            ? "Delete User Account?"
            : roleConfirm?.actionType === "suspend"
            ? roleConfirm?.currentRole === "suspended"
              ? "Reactivate User Access"
              : "Suspend User Access"
            : roleConfirm?.currentRole === "admin"
            ? "Demote Administrator"
            : "Promote to Administrator"
        }
        message={roleConfirm?.confirmMsg || ""}
        confirmLabel={
          roleConfirm?.actionType === "delete"
            ? "Delete User"
            : roleConfirm?.actionType === "suspend"
            ? roleConfirm?.currentRole === "suspended"
              ? "Reactivate"
              : "Suspend"
            : roleConfirm?.currentRole === "admin"
            ? "Demote to User"
            : "Promote to Admin"
        }
        cancelLabel="Cancel"
        isDanger={
          roleConfirm?.actionType === "delete" ||
          (roleConfirm?.actionType === "suspend" && roleConfirm?.currentRole !== "suspended") ||
          roleConfirm?.currentRole === "admin"
        }
        onConfirm={executeAction}
        onCancel={() => setRoleConfirm(null)}
      />
    </div>
  );
}
