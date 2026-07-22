"use client";
import { useEffect, useState } from "react";
import Link from "next/link";
import Navbar from "@/components/Navbar";
import { useToast } from "@/components/ui/toast-1";
import { BarChart2, Users, Bot, Brain, CreditCard, Megaphone, Settings as SettingsIcon, Save } from "lucide-react";
import TabNavigation from "@/components/ui/TabNavigation";

export default function AdminSettingsPage() {
  const { showToast } = useToast();
  const [settings, setSettings] = useState<Record<string, any>>({});
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");

  const fetchSettings = async () => {
    setLoading(true);
    setErrorMsg("");
    try {
      const res = await fetch("/api/admin/settings");
      if (!res.ok) {
        throw new Error("Failed to load system settings.");
      }
      const data = await res.json();
      setSettings(data);
    } catch (err: any) {
      setErrorMsg(err.message || "An unexpected error occurred.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSettings();
  }, []);

  const handleSave = async () => {
    setSaving(true);
    try {
      const res = await fetch("/api/admin/settings", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(settings)
      });
      if (!res.ok) {
        throw new Error("Failed to save settings.");
      }
      showToast("Settings saved successfully", "success");
    } catch (err: any) {
      showToast(err.message || "Failed to save settings", "error");
    } finally {
      setSaving(false);
    }
  };

  const handleSettingChange = (key: string, value: any) => {
    setSettings(prev => ({ ...prev, [key]: value }));
  };

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
              System Directory
            </span>
            <h1 className="text-3xl md:text-4xl font-extrabold font-['Syne',sans-serif] tracking-tight flex items-center gap-2 mt-2">
              <SettingsIcon size={32} className="text-indigo-600 dark:text-indigo-400" />
              System Settings
            </h1>
            <p className="text-sm text-slate-600 dark:text-[#9ea3c8] max-w-2xl leading-relaxed">
              Configure global application settings and feature toggles.
            </p>
          </div>

          {/* Navigation Tabs */}
          <TabNavigation activeTab="settings" />

          {errorMsg && (
            <div className="p-4 rounded-xl bg-rose-500/10 border-l-4 border-rose-500 text-rose-300 text-sm">
              {errorMsg}
            </div>
          )}

          {loading ? (
            <div className="flex flex-col items-center justify-center py-24 rounded-2xl bg-white/80 dark:bg-white/[0.02] border border-slate-200/60 dark:border-white/5 shadow-sm dark:shadow-xl">
              <div className="spinner mb-4 w-10 h-10" />
              <p className="text-sm text-slate-500 dark:text-[#9ea3c8]">Loading settings...</p>
            </div>
          ) : (
            <div className="p-6 md:p-8 rounded-2xl bg-white/80 dark:bg-slate-950/40 dark:bg-gradient-to-br dark:from-white/[0.05] dark:to-white/[0.01] border border-slate-200/60 dark:border-white/10 shadow-sm dark:shadow-xl space-y-6">
              
              {/* Referral Settings */}
              <div className="space-y-4">
                <h3 className="text-lg font-bold text-slate-900 dark:text-white pb-2 border-b border-slate-100 dark:border-white/5">
                  Referral Program Settings
                </h3>
                
                <div className="grid grid-cols-1 gap-4 max-w-md">
                  <label className="text-xs font-bold text-slate-500 dark:text-[#9ea3c8] block space-y-1.5">
                    <span>Referral Bonus Amount (Credits)</span>
                    <span className="text-[11px] text-slate-400 dark:text-gray-500 font-normal block">
                      Amount awarded to both the referrer and the new user. Set to 0 to effectively disable the referral program bonus.
                    </span>
                    <input 
                      type="number"
                      min="0"
                      value={settings.referral_bonus_amount || 0}
                      onChange={(e) => handleSettingChange('referral_bonus_amount', parseInt(e.target.value) || 0)}
                      className="px-3 py-2 rounded-lg bg-slate-50 dark:bg-[#0d0d1e] border border-slate-200 dark:border-white/10 text-xs md:text-sm text-[var(--text)] outline-none w-full"
                    />
                  </label>
                </div>
              </div>

              {/* Save Button */}
              <div className="flex justify-start pt-4 border-t border-slate-100 dark:border-white/5">
                <button 
                  onClick={handleSave} 
                  disabled={saving}
                  className="px-6 py-3 bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs md:text-sm rounded-xl border-none cursor-pointer transition flex items-center gap-1.5 disabled:opacity-50"
                >
                  <Save size={16} />
                  {saving ? "Saving..." : "Save Settings"}
                </button>
              </div>

            </div>
          )}

        </main>
      </div>
    </div>
  );
}
