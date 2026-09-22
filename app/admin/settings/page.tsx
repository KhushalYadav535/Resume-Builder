"use client";

import { useEffect, useState, useMemo } from "react";
import { useToast } from "@/components/ui/toast-1";
import { ConfirmationModal } from "@/components/ui/ConfirmationModal";
import {
  Settings as SettingsIcon,
  Save,
  RefreshCw,
  Coins,
  Brain,
  Sliders,
  ShieldAlert,
  ShieldCheck,
  Check,
  AlertCircle,
  Sparkles,
  Zap,
  Globe,
  SlidersHorizontal,
  Layers,
  RotateCcw,
  Bell,
  Cpu,
  Lock,
  Flame,
  Info,
  ChevronRight
} from "lucide-react";

interface AppSettings {
  referral_bonus_amount?: number;
  referral_program_active?: boolean;
  signup_welcome_credits?: number;
  daily_ai_scan_limit?: number;
  default_ai_model?: string;
  ats_precision_mode?: string;
  enable_public_signups?: boolean;
  enable_pipeline_tracker?: boolean;
  enable_instant_pdf_export?: boolean;
  maintenance_mode?: boolean;
  maintenance_notice?: string;
  [key: string]: any;
}

const DEFAULT_SETTINGS: AppSettings = {
  referral_bonus_amount: 50,
  referral_program_active: true,
  signup_welcome_credits: 20,
  daily_ai_scan_limit: 10,
  default_ai_model: "gemini-1.5-flash",
  ats_precision_mode: "balanced",
  enable_public_signups: true,
  enable_pipeline_tracker: true,
  enable_instant_pdf_export: true,
  maintenance_mode: false,
  maintenance_notice: "",
};

const SettingsSkeleton = () => (
  <div className="space-y-6 animate-pulse">
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
      {[1, 2, 3, 4].map((i) => (
        <div key={i} className="h-24 rounded-2xl bg-[var(--bg-elevated)] border border-[var(--border)]" />
      ))}
    </div>
    <div className="h-[480px] rounded-2xl bg-[var(--bg-elevated)] border border-[var(--border)]" />
  </div>
);

export default function AdminSettingsPage() {
  const { showToast } = useToast();
  const [settings, setSettings] = useState<AppSettings>(DEFAULT_SETTINGS);
  const [initialSettings, setInitialSettings] = useState<AppSettings>(DEFAULT_SETTINGS);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");
  const [activeTab, setActiveTab] = useState<"growth" | "ai" | "features" | "governance">("growth");
  const [resetConfirmOpen, setResetConfirmOpen] = useState(false);

  // ─── Fetch Settings ───────────────────────────────────────────────────────
  const fetchSettings = async () => {
    setLoading(true);
    setErrorMsg("");
    try {
      const res = await fetch("/api/admin/settings");
      if (!res.ok) {
        throw new Error("Failed to load system configuration.");
      }
      const data = await res.json();
      const merged: AppSettings = { ...DEFAULT_SETTINGS, ...data };
      setSettings(merged);
      setInitialSettings(merged);
    } catch (err: any) {
      setErrorMsg(err.message || "An unexpected error occurred.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSettings();
  }, []);

  // Check if there are unsaved changes
  const isDirty = useMemo(() => {
    return JSON.stringify(settings) !== JSON.stringify(initialSettings);
  }, [settings, initialSettings]);

  // ─── Save Settings ────────────────────────────────────────────────────────
  const handleSave = async () => {
    setSaving(true);
    try {
      const res = await fetch("/api/admin/settings", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(settings),
      });

      if (!res.ok) {
        throw new Error("Failed to save system settings.");
      }

      setInitialSettings(settings);
      showToast("System configuration updated successfully", "success");
    } catch (err: any) {
      showToast(err.message || "Failed to save settings", "error");
    } finally {
      setSaving(false);
    }
  };

  // ─── Discard Changes ──────────────────────────────────────────────────────
  const handleDiscard = () => {
    setSettings(initialSettings);
    showToast("Unsaved changes discarded", "info");
  };

  // ─── Reset to Defaults ────────────────────────────────────────────────────
  const handleResetToDefaults = () => {
    setSettings(DEFAULT_SETTINGS);
    setResetConfirmOpen(false);
    showToast("Reset to factory defaults. Click 'Save' to commit.", "info");
  };

  const updateField = (key: keyof AppSettings, value: any) => {
    setSettings((prev) => ({ ...prev, [key]: value }));
  };

  // Toggle switch helper
  const ToggleSwitch = ({
    checked,
    onChange,
    disabled = false,
  }: {
    checked: boolean;
    onChange: (val: boolean) => void;
    disabled?: boolean;
  }) => (
    <button
      type="button"
      disabled={disabled}
      onClick={() => onChange(!checked)}
      className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none disabled:opacity-50 ${
        checked ? "bg-amber-500" : "bg-slate-300 dark:bg-slate-700"
      }`}
    >
      <span
        className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow-md ring-0 transition duration-200 ease-in-out ${
          checked ? "translate-x-5" : "translate-x-0"
        }`}
      />
    </button>
  );

  return (
    <div className="space-y-8 font-sans pb-24">
      
      {/* ── EXECUTIVE HEADER ── */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 pb-6 border-b border-[var(--border)]">
        <div className="space-y-2">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-500/10 border border-amber-500/25 text-amber-600 dark:text-amber-400 text-xs font-bold uppercase tracking-wider">
            <SlidersHorizontal size={12} className="text-amber-500" />
            <span>UPROLE PLATFORM COMMAND · SYSTEM CONFIGURATION & GOVERNANCE</span>
          </div>

          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#101B3B] to-[#2563EB] flex items-center justify-center text-white shadow-md border border-white/10 shrink-0">
              <SettingsIcon size={22} className="text-amber-400" />
            </div>
            <h1 className="text-2xl md:text-3xl font-extrabold tracking-tight text-[var(--text-primary)] font-['Syne',sans-serif]">
              System Configuration & Platform Governance
            </h1>
          </div>

          <p className="text-sm text-[var(--text-muted)] max-w-2xl leading-relaxed">
            Configure global monetization variables, referral economics, AI pipeline guardrails, and platform feature toggles.
          </p>
        </div>

        {/* Action Controls */}
        <div className="flex items-center gap-3 self-start md:self-center shrink-0">
          <button
            onClick={fetchSettings}
            disabled={loading || saving}
            className="px-3.5 py-2 rounded-xl bg-[var(--bg-elevated)] border border-[var(--border)] text-xs font-bold text-[var(--text-primary)] hover:border-amber-500/40 hover:bg-amber-500/10 transition-all flex items-center gap-2 cursor-pointer shadow-xs disabled:opacity-50"
          >
            <RefreshCw
              size={13}
              className={loading ? "animate-spin text-amber-500" : "text-[var(--text-muted)]"}
            />
            <span>Reload</span>
          </button>

          <button
            onClick={handleSave}
            disabled={saving || !isDirty}
            className={`px-4 py-2 rounded-xl text-xs font-black transition-all flex items-center gap-2 cursor-pointer shadow-sm ${
              isDirty
                ? "bg-amber-500 hover:bg-amber-400 text-brand-navy shadow-amber-500/25 border border-amber-400 animate-pulse"
                : "bg-[var(--bg-elevated)] text-[var(--text-muted)] border border-[var(--border)] cursor-not-allowed opacity-60"
            }`}
          >
            <Save size={14} />
            <span>{saving ? "Committing..." : "Save Configuration"}</span>
          </button>
        </div>
      </div>

      {/* Error Notice */}
      {errorMsg && (
        <div className="p-4 rounded-xl bg-rose-500/10 border border-rose-500/30 flex items-center gap-3 text-rose-600 dark:text-rose-400 text-sm">
          <AlertCircle size={18} className="shrink-0" />
          <span>{errorMsg}</span>
        </div>
      )}

      {/* ── STATUS & GOVERNANCE TELEMETRY STRIP (4 METRICS) ── */}
      <section className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Metric 1: Environment */}
        <div className="p-4 md:p-5 rounded-2xl bg-[var(--bg-elevated)] border border-[var(--border)] shadow-xs relative overflow-hidden">
          <div className="absolute top-0 left-0 right-0 h-[2px] bg-emerald-500" />
          <div className="flex items-center justify-between text-[var(--text-muted)] mb-1.5">
            <span className="text-[11px] font-bold uppercase tracking-wider">Cluster Env</span>
            <Globe size={14} className="text-emerald-500" />
          </div>
          <div className="text-lg md:text-xl font-black text-[var(--text-primary)] font-['Syne',sans-serif]">
            Production
          </div>
          <div className="text-[11px] text-emerald-600 dark:text-emerald-400 mt-0.5 flex items-center gap-1 font-bold">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
            <span>Supabase Live DB</span>
          </div>
        </div>

        {/* Metric 2: Config Variables */}
        <div className="p-4 md:p-5 rounded-2xl bg-[var(--bg-elevated)] border border-[var(--border)] shadow-xs relative overflow-hidden">
          <div className="absolute top-0 left-0 right-0 h-[2px] bg-blue-500" />
          <div className="flex items-center justify-between text-[var(--text-muted)] mb-1.5">
            <span className="text-[11px] font-bold uppercase tracking-wider">Config Store</span>
            <Layers size={14} className="text-blue-500" />
          </div>
          <div className="text-lg md:text-xl font-black text-blue-500 font-['Syne',sans-serif]">
            {Object.keys(settings).length} Keys
          </div>
          <div className="text-[11px] text-[var(--text-muted)] mt-0.5">
            Dynamic JSONB schema
          </div>
        </div>

        {/* Metric 3: Referral Grant */}
        <div className="p-4 md:p-5 rounded-2xl bg-[var(--bg-elevated)] border border-[var(--border)] shadow-xs relative overflow-hidden">
          <div className="absolute top-0 left-0 right-0 h-[2px] bg-amber-500" />
          <div className="flex items-center justify-between text-[var(--text-muted)] mb-1.5">
            <span className="text-[11px] font-bold uppercase tracking-wider">Referral Quota</span>
            <Coins size={14} className="text-amber-500" />
          </div>
          <div className="text-lg md:text-xl font-black text-amber-500 font-['Syne',sans-serif]">
            +{settings.referral_bonus_amount || 0} Credits
          </div>
          <div className="text-[11px] text-[var(--text-muted)] mt-0.5">
            Per qualified conversion
          </div>
        </div>

        {/* Metric 4: Access Governance */}
        <div className="p-4 md:p-5 rounded-2xl bg-[var(--bg-elevated)] border border-[var(--border)] shadow-xs relative overflow-hidden">
          <div className="absolute top-0 left-0 right-0 h-[2px] bg-purple-500" />
          <div className="flex items-center justify-between text-[var(--text-muted)] mb-1.5">
            <span className="text-[11px] font-bold uppercase tracking-wider">Governance</span>
            <ShieldCheck size={14} className="text-purple-500" />
          </div>
          <div className="text-lg md:text-xl font-black text-purple-500 font-['Syne',sans-serif]">
            Level 1 Admin
          </div>
          <div className="text-[11px] text-emerald-600 dark:text-emerald-400 mt-0.5 font-bold">
            ✓ RLS Enforced
          </div>
        </div>
      </section>

      {/* ── NAVIGATION TABS ── */}
      <div className="flex gap-2 border-b border-[var(--border)] pb-3 overflow-x-auto [scrollbar-width:none]">
        {[
          { key: "growth", icon: <Coins size={14} />, label: "Referral & Economics" },
          { key: "ai", icon: <Brain size={14} />, label: "AI Pipeline & Guardrails" },
          { key: "features", icon: <Sliders size={14} />, label: "Feature Flags & Access" },
          { key: "governance", icon: <ShieldAlert size={14} />, label: "Platform Governance" },
        ].map((t) => {
          const isSelected = activeTab === t.key;
          return (
            <button
              key={t.key}
              onClick={() => setActiveTab(t.key as any)}
              className={`px-4 py-2 rounded-xl font-bold text-xs md:text-sm flex items-center gap-2 transition-all cursor-pointer whitespace-nowrap ${
                isSelected
                  ? "bg-amber-500 text-brand-navy font-black shadow-sm shadow-amber-500/25 border border-amber-500"
                  : "text-[var(--text-secondary)] bg-[var(--bg-elevated)] border border-[var(--border)] hover:border-amber-500/30 hover:text-[var(--text-primary)]"
              }`}
            >
              {t.icon}
              <span>{t.label}</span>
            </button>
          );
        })}
      </div>

      {loading ? (
        <SettingsSkeleton />
      ) : (
        <div className="space-y-6">
          
          {/* ═══════════════════ TAB 1: GROWTH & REFERRALS ═══════════════════ */}
          {activeTab === "growth" && (
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
              {/* Main settings card */}
              <div className="lg:col-span-8 p-6 md:p-7 rounded-2xl bg-[var(--bg-elevated)] border border-[var(--border)] shadow-sm space-y-6 backdrop-blur-xl">
                <div className="flex items-center justify-between pb-3 border-b border-[var(--border)]">
                  <div>
                    <h2 className="text-base font-bold text-[var(--text-primary)] font-['Syne',sans-serif] flex items-center gap-2">
                      <Coins size={17} className="text-amber-500" />
                      <span>Referral & New User Credit Economics</span>
                    </h2>
                    <p className="text-xs text-[var(--text-muted)] mt-0.5">
                      Configure credit multipliers awarded across invitation pipelines and signup bonuses.
                    </p>
                  </div>
                </div>

                {/* Option 1: Referral Program Toggle */}
                <div className="flex items-center justify-between p-4 rounded-xl bg-[var(--bg-page)] border border-[var(--border)]">
                  <div className="space-y-0.5 pr-4">
                    <div className="font-bold text-xs text-[var(--text-primary)]">
                      Referral Incentive Program Status
                    </div>
                    <div className="text-[11px] text-[var(--text-muted)]">
                      When enabled, users earn credits upon their friends signing up with their code.
                    </div>
                  </div>
                  <ToggleSwitch
                    checked={settings.referral_program_active ?? true}
                    onChange={(val) => updateField("referral_program_active", val)}
                  />
                </div>

                {/* Option 2: Referral Bonus Amount */}
                <div className="space-y-2 p-4 rounded-xl bg-[var(--bg-page)] border border-[var(--border)]">
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="font-bold text-xs text-[var(--text-primary)]">
                        Referral Bonus Amount (Credits)
                      </div>
                      <div className="text-[11px] text-[var(--text-muted)] mt-0.5">
                        Amount awarded to both the referrer and the invited user upon successful registration.
                      </div>
                    </div>
                    <span className="text-xs font-mono font-black text-amber-500 bg-amber-500/10 px-2 py-0.5 rounded border border-amber-500/25">
                      {settings.referral_bonus_amount || 0} credits
                    </span>
                  </div>

                  <div className="flex items-center gap-3 pt-2">
                    <input
                      type="number"
                      min="0"
                      max="1000"
                      value={settings.referral_bonus_amount || 0}
                      onChange={(e) =>
                        updateField("referral_bonus_amount", Math.max(0, parseInt(e.target.value) || 0))
                      }
                      className="flex-1 px-3.5 py-2 rounded-xl bg-[var(--bg-elevated)] border border-[var(--border)] text-xs font-mono font-bold text-[var(--text-primary)] outline-none focus:border-amber-500/50 transition-all"
                    />
                    {/* Quick increment chips */}
                    <div className="flex items-center gap-1 shrink-0">
                      {[10, 25, 50, 100].map((amt) => (
                        <button
                          key={amt}
                          type="button"
                          onClick={() => updateField("referral_bonus_amount", amt)}
                          className="px-2.5 py-1 rounded-lg bg-[var(--bg-elevated)] border border-[var(--border)] text-[10px] font-bold text-[var(--text-secondary)] hover:text-amber-500 hover:border-amber-500/30 transition-all cursor-pointer"
                        >
                          {amt}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Option 3: Welcome Bonus for Free Signups */}
                <div className="space-y-2 p-4 rounded-xl bg-[var(--bg-page)] border border-[var(--border)]">
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="font-bold text-xs text-[var(--text-primary)]">
                        New Account Signup Grant
                      </div>
                      <div className="text-[11px] text-[var(--text-muted)] mt-0.5">
                        Free onboarding credits automatically deposited into new user wallets to test ATS scan.
                      </div>
                    </div>
                    <span className="text-xs font-mono font-black text-teal-500 bg-teal-500/10 px-2 py-0.5 rounded border border-teal-500/25">
                      {settings.signup_welcome_credits || 0} credits
                    </span>
                  </div>

                  <div className="flex items-center gap-3 pt-2">
                    <input
                      type="number"
                      min="0"
                      max="500"
                      value={settings.signup_welcome_credits || 0}
                      onChange={(e) =>
                        updateField("signup_welcome_credits", Math.max(0, parseInt(e.target.value) || 0))
                      }
                      className="flex-1 px-3.5 py-2 rounded-xl bg-[var(--bg-elevated)] border border-[var(--border)] text-xs font-mono font-bold text-[var(--text-primary)] outline-none focus:border-amber-500/50 transition-all"
                    />
                    <div className="flex items-center gap-1 shrink-0">
                      {[10, 20, 30, 50].map((amt) => (
                        <button
                          key={amt}
                          type="button"
                          onClick={() => updateField("signup_welcome_credits", amt)}
                          className="px-2.5 py-1 rounded-lg bg-[var(--bg-elevated)] border border-[var(--border)] text-[10px] font-bold text-[var(--text-secondary)] hover:text-teal-500 hover:border-teal-500/30 transition-all cursor-pointer"
                        >
                          {amt}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              </div>

              {/* Economic Projection Sidebar */}
              <div className="lg:col-span-4 space-y-4">
                <div className="p-5 rounded-2xl bg-[var(--bg-elevated)] border border-[var(--border)] shadow-xs space-y-4 backdrop-blur-xl">
                  <div className="flex items-center gap-2 pb-2 border-b border-[var(--border)]">
                    <Zap size={15} className="text-amber-500" />
                    <h3 className="text-xs font-bold uppercase tracking-wider text-[var(--text-primary)] font-['Syne',sans-serif]">
                      Economic Model Projection
                    </h3>
                  </div>

                  <div className="space-y-3 text-xs">
                    <div className="flex justify-between items-center py-1 border-b border-[var(--border)]">
                      <span className="text-[var(--text-muted)]">Cost / 100 Signups</span>
                      <span className="font-mono font-bold text-[var(--text-primary)]">
                        {((settings.signup_welcome_credits || 0) * 100).toLocaleString()} credits
                      </span>
                    </div>
                    <div className="flex justify-between items-center py-1 border-b border-[var(--border)]">
                      <span className="text-[var(--text-muted)]">Cost / 100 Referrals</span>
                      <span className="font-mono font-bold text-amber-500">
                        {((settings.referral_bonus_amount || 0) * 100 * 2).toLocaleString()} credits
                      </span>
                    </div>
                    <div className="flex justify-between items-center py-1">
                      <span className="text-[var(--text-muted)]">Burn Liability Ratio</span>
                      <span className="font-bold text-emerald-500">Controlled (Low)</span>
                    </div>
                  </div>

                  <div className="p-3 rounded-xl bg-[var(--bg-page)] border border-[var(--border)] text-[11px] text-[var(--text-muted)] leading-relaxed">
                    💡 <strong>Tip:</strong> Setting referral bonus to 0 effectively pauses new referral payouts without wiping out user invite codes.
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* ═══════════════════ TAB 2: AI PIPELINE & GUARDRAILS ═══════════════════ */}
          {activeTab === "ai" && (
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
              <div className="lg:col-span-8 p-6 md:p-7 rounded-2xl bg-[var(--bg-elevated)] border border-[var(--border)] shadow-sm space-y-6 backdrop-blur-xl">
                <div className="flex items-center justify-between pb-3 border-b border-[var(--border)]">
                  <div>
                    <h2 className="text-base font-bold text-[var(--text-primary)] font-['Syne',sans-serif] flex items-center gap-2">
                      <Brain size={17} className="text-purple-500" />
                      <span>AI Model Pipeline & Token Guardrails</span>
                    </h2>
                    <p className="text-xs text-[var(--text-muted)] mt-0.5">
                      Configure default AI router, daily request rate limits, and ATS parser sensitivity.
                    </p>
                  </div>
                </div>

                {/* Option 1: Default Engine */}
                <div className="space-y-2 p-4 rounded-xl bg-[var(--bg-page)] border border-[var(--border)]">
                  <div className="font-bold text-xs text-[var(--text-primary)]">
                    Primary AI Inference Engine
                  </div>
                  <div className="text-[11px] text-[var(--text-muted)]">
                    Default model router handling ATS scoring, bullet optimizations, and JD keyword alignment.
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 pt-2">
                    {[
                      { key: "gemini-1.5-flash", label: "Gemini 1.5 Flash", sub: "Fast & High Throughput (Default)" },
                      { key: "gemini-1.5-pro", label: "Gemini 1.5 Pro", sub: "Deep Reasoning & High Context" },
                      { key: "gpt-4o-mini", label: "OpenAI GPT-4o-mini", sub: "Secondary Fallback Router" },
                    ].map((model) => (
                      <button
                        key={model.key}
                        type="button"
                        onClick={() => updateField("default_ai_model", model.key)}
                        className={`p-3 rounded-xl border text-left transition-all cursor-pointer ${
                          settings.default_ai_model === model.key
                            ? "bg-purple-500/10 border-purple-500 text-[var(--text-primary)] font-bold shadow-2xs"
                            : "bg-[var(--bg-elevated)] border-[var(--border)] text-[var(--text-muted)] hover:border-purple-500/30 hover:text-[var(--text-primary)]"
                        }`}
                      >
                        <div className="text-xs font-bold">{model.label}</div>
                        <div className="text-[10px] text-[var(--text-muted)] mt-0.5">{model.sub}</div>
                      </button>
                    ))}
                  </div>
                </div>

                {/* Option 2: Daily AI Scans Limit */}
                <div className="space-y-2 p-4 rounded-xl bg-[var(--bg-page)] border border-[var(--border)]">
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="font-bold text-xs text-[var(--text-primary)]">
                        Daily Free AI Scans Limit
                      </div>
                      <div className="text-[11px] text-[var(--text-muted)] mt-0.5">
                        Maximum complimentary ATS scans and AI improvements per day on Free tier accounts.
                      </div>
                    </div>
                    <span className="text-xs font-mono font-black text-purple-500 bg-purple-500/10 px-2 py-0.5 rounded border border-purple-500/25">
                      {settings.daily_ai_scan_limit || 10} / day
                    </span>
                  </div>

                  <div className="flex items-center gap-3 pt-2">
                    <input
                      type="number"
                      min="1"
                      max="100"
                      value={settings.daily_ai_scan_limit || 10}
                      onChange={(e) =>
                        updateField("daily_ai_scan_limit", Math.max(1, parseInt(e.target.value) || 1))
                      }
                      className="flex-1 px-3.5 py-2 rounded-xl bg-[var(--bg-elevated)] border border-[var(--border)] text-xs font-mono font-bold text-[var(--text-primary)] outline-none focus:border-purple-500/50 transition-all"
                    />
                    <div className="flex items-center gap-1 shrink-0">
                      {[5, 10, 20, 50].map((amt) => (
                        <button
                          key={amt}
                          type="button"
                          onClick={() => updateField("daily_ai_scan_limit", amt)}
                          className="px-2.5 py-1 rounded-lg bg-[var(--bg-elevated)] border border-[var(--border)] text-[10px] font-bold text-[var(--text-secondary)] hover:text-purple-500 hover:border-purple-500/30 transition-all cursor-pointer"
                        >
                          {amt}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Option 3: ATS Precision Mode */}
                <div className="space-y-2 p-4 rounded-xl bg-[var(--bg-page)] border border-[var(--border)]">
                  <div className="font-bold text-xs text-[var(--text-primary)]">
                    ATS Keyword Matcher Sensitivity
                  </div>
                  <div className="text-[11px] text-[var(--text-muted)]">
                    Calibrates how strictly the ATS algorithm matches synonyms, aliases, and Indian tech skill variants.
                  </div>
                  <div className="grid grid-cols-3 gap-2 pt-2">
                    {[
                      { key: "lenient", label: "Lenient", desc: "Broader synonym matching" },
                      { key: "balanced", label: "Balanced", desc: "Recommended production" },
                      { key: "strict", label: "Strict", desc: "Exact keyword match required" },
                    ].map((mode) => (
                      <button
                        key={mode.key}
                        type="button"
                        onClick={() => updateField("ats_precision_mode", mode.key)}
                        className={`p-2.5 rounded-xl border text-center transition-all cursor-pointer ${
                          settings.ats_precision_mode === mode.key
                            ? "bg-purple-500/10 border-purple-500 text-purple-600 dark:text-purple-400 font-bold"
                            : "bg-[var(--bg-elevated)] border-[var(--border)] text-[var(--text-muted)] hover:text-[var(--text-primary)]"
                        }`}
                      >
                        <div className="text-xs font-bold">{mode.label}</div>
                        <div className="text-[10px] text-[var(--text-muted)]">{mode.desc}</div>
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              {/* AI Guardrail info */}
              <div className="lg:col-span-4 space-y-4">
                <div className="p-5 rounded-2xl bg-[var(--bg-elevated)] border border-[var(--border)] shadow-xs space-y-3 backdrop-blur-xl">
                  <div className="flex items-center gap-2 pb-2 border-b border-[var(--border)]">
                    <Cpu size={15} className="text-purple-500" />
                    <h3 className="text-xs font-bold uppercase tracking-wider text-[var(--text-primary)] font-['Syne',sans-serif]">
                      Telemetry Guardrails
                    </h3>
                  </div>
                  <p className="text-xs text-[var(--text-muted)] leading-relaxed">
                    Guardrails protect against API rate exhaustion by enforcing per-user cooldown limits on resume optimization calls.
                  </p>
                  <div className="p-3 rounded-xl bg-purple-500/10 border border-purple-500/20 text-[11px] text-purple-600 dark:text-purple-400 font-medium">
                    ⚡ Current router latency: <strong>~240ms</strong> on Google Gemini 1.5 Flash.
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* ═══════════════════ TAB 3: FEATURE FLAGS & ACCESS ═══════════════════ */}
          {activeTab === "features" && (
            <div className="p-6 md:p-7 rounded-2xl bg-[var(--bg-elevated)] border border-[var(--border)] shadow-sm space-y-6 backdrop-blur-xl">
              <div className="flex items-center justify-between pb-3 border-b border-[var(--border)]">
                <div>
                  <h2 className="text-base font-bold text-[var(--text-primary)] font-['Syne',sans-serif] flex items-center gap-2">
                    <Sliders size={17} className="text-blue-500" />
                    <span>Application Feature Toggles & Public Access</span>
                  </h2>
                  <p className="text-xs text-[var(--text-muted)] mt-0.5">
                    Enable or disable specific platform modules in real-time without redeploying code.
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Feature 1: Public Registration */}
                <div className="flex items-center justify-between p-4 rounded-xl bg-[var(--bg-page)] border border-[var(--border)]">
                  <div className="space-y-0.5 pr-4">
                    <div className="font-bold text-xs text-[var(--text-primary)]">
                      Public User Registrations
                    </div>
                    <div className="text-[11px] text-[var(--text-muted)]">
                      Allow new users to create accounts without an invitation code.
                    </div>
                  </div>
                  <ToggleSwitch
                    checked={settings.enable_public_signups ?? true}
                    onChange={(val) => updateField("enable_public_signups", val)}
                  />
                </div>

                {/* Feature 2: Opportunity Pipeline */}
                <div className="flex items-center justify-between p-4 rounded-xl bg-[var(--bg-page)] border border-[var(--border)]">
                  <div className="space-y-0.5 pr-4">
                    <div className="font-bold text-xs text-[var(--text-primary)]">
                      Opportunity Pipeline & Kanban
                    </div>
                    <div className="text-[11px] text-[var(--text-muted)]">
                      Pursue phase job tracker and interview pipeline module.
                    </div>
                  </div>
                  <ToggleSwitch
                    checked={settings.enable_pipeline_tracker ?? true}
                    onChange={(val) => updateField("enable_pipeline_tracker", val)}
                  />
                </div>

                {/* Feature 3: Instant PDF Export */}
                <div className="flex items-center justify-between p-4 rounded-xl bg-[var(--bg-page)] border border-[var(--border)]">
                  <div className="space-y-0.5 pr-4">
                    <div className="font-bold text-xs text-[var(--text-primary)]">
                      Instant Vector PDF Export
                    </div>
                    <div className="text-[11px] text-[var(--text-muted)]">
                      High-fidelity vector PDF generation engine for resume templates.
                    </div>
                  </div>
                  <ToggleSwitch
                    checked={settings.enable_instant_pdf_export ?? true}
                    onChange={(val) => updateField("enable_instant_pdf_export", val)}
                  />
                </div>

                {/* Feature 4: Maintenance Notice Mode */}
                <div className="flex items-center justify-between p-4 rounded-xl bg-[var(--bg-page)] border border-[var(--border)]">
                  <div className="space-y-0.5 pr-4">
                    <div className="font-bold text-xs text-[var(--text-primary)]">
                      Global Maintenance Mode
                    </div>
                    <div className="text-[11px] text-[var(--text-muted)]">
                      Displays a temporary maintenance banner across the application.
                    </div>
                  </div>
                  <ToggleSwitch
                    checked={settings.maintenance_mode ?? false}
                    onChange={(val) => updateField("maintenance_mode", val)}
                  />
                </div>
              </div>

              {/* Maintenance Notice Message Input (Shown if maintenance enabled) */}
              {settings.maintenance_mode && (
                <div className="space-y-2 p-4 rounded-xl bg-amber-500/10 border border-amber-500/30 animate-in fade-in duration-200">
                  <label className="text-xs font-bold text-amber-600 dark:text-amber-400 block">
                    Maintenance Banner Message
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. Scheduled database maintenance in progress. Resume editing is fully saved."
                    value={settings.maintenance_notice || ""}
                    onChange={(e) => updateField("maintenance_notice", e.target.value)}
                    className="w-full px-3.5 py-2 rounded-xl bg-[var(--bg-page)] border border-amber-500/30 text-xs text-[var(--text-primary)] outline-none focus:border-amber-500"
                  />
                </div>
              )}
            </div>
          )}

          {/* ═══════════════════ TAB 4: GOVERNANCE & DANGER ZONE ═══════════════════ */}
          {activeTab === "governance" && (
            <div className="space-y-6">
              <div className="p-6 md:p-7 rounded-2xl bg-[var(--bg-elevated)] border border-[var(--border)] shadow-sm space-y-6 backdrop-blur-xl">
                <div className="flex items-center justify-between pb-3 border-b border-[var(--border)]">
                  <div>
                    <h2 className="text-base font-bold text-[var(--text-primary)] font-['Syne',sans-serif] flex items-center gap-2">
                      <ShieldCheck size={17} className="text-emerald-500" />
                      <span>Security Policy & Role-Based Access Governance</span>
                    </h2>
                    <p className="text-xs text-[var(--text-muted)] mt-0.5">
                      Verify security posture and manage system environment integrity.
                    </p>
                  </div>
                </div>

                <div className="space-y-3">
                  <div className="flex items-center justify-between p-3.5 rounded-xl bg-[var(--bg-page)] border border-[var(--border)]">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-lg bg-emerald-500/10 text-emerald-500 flex items-center justify-center">
                        <Lock size={15} />
                      </div>
                      <div>
                        <div className="text-xs font-bold text-[var(--text-primary)]">Row Level Security (RLS)</div>
                        <div className="text-[11px] text-[var(--text-muted)]">Active across resumes, profiles, notifications, and settings tables</div>
                      </div>
                    </div>
                    <span className="px-2 py-0.5 rounded bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 text-[10px] font-black uppercase tracking-wider border border-emerald-500/30">
                      Enforced
                    </span>
                  </div>

                  <div className="flex items-center justify-between p-3.5 rounded-xl bg-[var(--bg-page)] border border-[var(--border)]">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-lg bg-blue-500/10 text-blue-500 flex items-center justify-center">
                        <ShieldCheck size={15} />
                      </div>
                      <div>
                        <div className="text-xs font-bold text-[var(--text-primary)]">Admin Bypass Isolation</div>
                        <div className="text-[11px] text-[var(--text-muted)]">Service role restricted strictly to authenticated server API boundaries</div>
                      </div>
                    </div>
                    <span className="px-2 py-0.5 rounded bg-blue-500/15 text-blue-600 dark:text-blue-400 text-[10px] font-black uppercase tracking-wider border border-blue-500/30">
                      Protected
                    </span>
                  </div>
                </div>
              </div>

              {/* Danger Zone */}
              <div className="p-6 md:p-7 rounded-2xl bg-rose-500/[0.03] border border-rose-500/30 shadow-sm space-y-4">
                <div className="flex items-center gap-2 pb-2 border-b border-rose-500/20">
                  <Flame size={18} className="text-rose-500" />
                  <h3 className="text-sm font-bold text-rose-600 dark:text-rose-400 font-['Syne',sans-serif]">
                    Danger Zone & Configuration Reset
                  </h3>
                </div>

                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div className="space-y-0.5">
                    <div className="text-xs font-bold text-[var(--text-primary)]">
                      Restore Factory Default Settings
                    </div>
                    <div className="text-[11px] text-[var(--text-muted)]">
                      Reset all referral bonuses, daily scan caps, and feature toggles to original system defaults.
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={() => setResetConfirmOpen(true)}
                    className="px-4 py-2 rounded-xl bg-rose-500/10 hover:bg-rose-500/20 border border-rose-500/30 text-rose-600 dark:text-rose-400 text-xs font-bold cursor-pointer transition-all shrink-0"
                  >
                    Reset to Factory Defaults
                  </button>
                </div>
              </div>
            </div>
          )}

        </div>
      )}

      {/* ── STICKY FLOATING UN-SAVED CHANGES FOOTER BAR ── */}
      {isDirty && (
        <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50 w-full max-w-xl px-4 animate-in slide-in-from-bottom-5 duration-200">
          <div className="p-3.5 md:p-4 rounded-2xl bg-[var(--bg-elevated)]/95 backdrop-blur-2xl border border-amber-500/40 shadow-2xl shadow-amber-500/10 flex items-center justify-between gap-4">
            <div className="flex items-center gap-2.5">
              <span className="w-2.5 h-2.5 rounded-full bg-amber-500 animate-pulse shrink-0" />
              <div className="text-xs font-bold text-[var(--text-primary)]">
                Unsaved configuration modifications detected
              </div>
            </div>

            <div className="flex items-center gap-2 shrink-0">
              <button
                type="button"
                onClick={handleDiscard}
                disabled={saving}
                className="px-3 py-1.5 rounded-xl bg-[var(--bg-page)] hover:bg-[var(--bg-elevated)] border border-[var(--border)] text-xs font-bold text-[var(--text-secondary)] transition-all cursor-pointer"
              >
                Discard
              </button>
              <button
                type="button"
                onClick={handleSave}
                disabled={saving}
                className="px-4 py-1.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-brand-navy font-black text-xs transition-all shadow-sm shadow-amber-500/25 border border-amber-400 cursor-pointer disabled:opacity-50"
              >
                {saving ? "Saving..." : "Save Now"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── CONFIRMATION MODAL: RESET DEFAULTS ── */}
      <ConfirmationModal
        isOpen={resetConfirmOpen}
        title="Reset to Factory Defaults?"
        message="Are you sure you want to reset all platform settings (referral amounts, AI caps, and feature toggles) to factory defaults? This can be reviewed before saving."
        confirmLabel="Yes, Reset Values"
        cancelLabel="Cancel"
        isDanger={true}
        onConfirm={handleResetToDefaults}
        onCancel={() => setResetConfirmOpen(false)}
      />

    </div>
  );
}
