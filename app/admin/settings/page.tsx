"use client";
import { useEffect, useState } from "react";
import Link from "next/link";
import Navbar from "@/components/Navbar";
import { useToast } from "@/components/ui/toast-1";
import { BarChart2, Users, Bot, Brain, CreditCard, Megaphone, Settings as SettingsIcon, Save } from "lucide-react";

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
    <div style={{ minHeight: "100vh", background: "var(--bg)" }}>
      <Navbar />
      <div style={{ maxWidth: "1100px", margin: "0 auto", padding: "2.5rem 1.5rem" }}>

        {/* Title */}
        <div style={{ marginBottom: "2rem" }}>
          <p className="section-label" style={{ marginBottom: "0.5rem" }}>System Directory</p>
          <h1 style={{ fontFamily: "Syne, sans-serif", fontSize: "2.2rem", fontWeight: 800, display: "inline-flex", alignItems: "center", gap: "0.5rem" }}>
            <SettingsIcon size={32} className="text-gray-500" />
            System Settings
          </h1>
          <p style={{ color: "var(--text-muted)", fontSize: "0.9rem", marginTop: "0.25rem" }}>
            Configure global application settings and feature toggles.
          </p>
        </div>

        {/* Navigation Tabs */}
        <div style={{ display: "flex", gap: "0.5rem", borderBottom: "1px solid var(--border)", marginBottom: "2rem", overflowX: "auto", whiteSpace: "nowrap" }}>
          <Link href="/admin" style={{ textDecoration: "none" }}>
            <button style={{ padding: "0.6rem 1.2rem", background: "transparent", border: "none", color: "var(--text-muted)", fontWeight: 600, fontSize: "0.85rem", cursor: "pointer", display: "inline-flex", alignItems: "center", gap: "0.4rem" }}>
              <BarChart2 size={14} /> Analytics Overview
            </button>
          </Link>
          <Link href="/admin/users" style={{ textDecoration: "none" }}>
            <button style={{ padding: "0.6rem 1.2rem", background: "transparent", border: "none", color: "var(--text-muted)", fontWeight: 600, fontSize: "0.85rem", cursor: "pointer", display: "inline-flex", alignItems: "center", gap: "0.4rem" }}>
              <Users size={14} /> User Management
            </button>
          </Link>
          <Link href="/admin/ai-usage" style={{ textDecoration: "none" }}>
            <button style={{ padding: "0.6rem 1.2rem", background: "transparent", border: "none", color: "var(--text-muted)", fontWeight: 600, fontSize: "0.85rem", cursor: "pointer", display: "inline-flex", alignItems: "center", gap: "0.4rem" }}>
              <Bot size={14} /> AI Usage Log
            </button>
          </Link>
          <Link href="/admin/keywords" style={{ textDecoration: "none" }}>
            <button style={{ padding: "0.6rem 1.2rem", background: "transparent", border: "none", color: "var(--text-muted)", fontWeight: 600, fontSize: "0.85rem", cursor: "pointer", display: "inline-flex", alignItems: "center", gap: "0.4rem" }}>
              <Brain size={14} /> ATS Keywords
            </button>
          </Link>
          <Link href="/admin/billing" style={{ textDecoration: "none" }}>
            <button style={{ padding: "0.6rem 1.2rem", background: "transparent", border: "none", color: "var(--text-muted)", fontWeight: 600, fontSize: "0.85rem", cursor: "pointer", display: "inline-flex", alignItems: "center", gap: "0.4rem" }}>
              <CreditCard size={14} /> Billing & Credits
            </button>
          </Link>
          <Link href="/admin/broadcast" style={{ textDecoration: "none" }}>
            <button style={{ padding: "0.6rem 1.2rem", background: "transparent", border: "none", color: "var(--text-muted)", fontWeight: 600, fontSize: "0.85rem", cursor: "pointer", display: "inline-flex", alignItems: "center", gap: "0.4rem" }}>
              <Megaphone size={14} /> Broadcasts
            </button>
          </Link>
          <Link href="/admin/settings" style={{ textDecoration: "none" }}>
            <button style={{ padding: "0.6rem 1.2rem", background: "rgba(107, 114, 128, 0.08)", border: "none", borderBottom: "2px solid #6b7280", color: "#6b7280", fontWeight: 700, fontSize: "0.85rem", cursor: "pointer", display: "inline-flex", alignItems: "center", gap: "0.4rem" }}>
              <SettingsIcon size={14} /> Settings
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
            <p style={{ color: "var(--text-muted)", fontSize: "0.88rem" }}>Loading settings...</p>
          </div>
        ) : (
          <div className="card" style={{ padding: "2rem", display: "flex", flexDirection: "column", gap: "2rem" }}>
            
            {/* Referral Settings */}
            <div>
              <h3 style={{ fontSize: "1.1rem", fontWeight: 700, marginBottom: "1rem", borderBottom: "1px solid var(--border)", paddingBottom: "0.5rem" }}>
                Referral Program Settings
              </h3>
              
              <div style={{ display: "grid", gap: "1rem", maxWidth: "400px" }}>
                <label style={{ display: "flex", flexDirection: "column", gap: "0.5rem", fontSize: "0.9rem", color: "var(--text)" }}>
                  <span style={{ fontWeight: 600 }}>Referral Bonus Amount (Credits)</span>
                  <span style={{ fontSize: "0.8rem", color: "var(--text-muted)" }}>
                    Amount awarded to both the referrer and the new user. Set to 0 to effectively disable the referral program bonus.
                  </span>
                  <input 
                    type="number"
                    min="0"
                    value={settings.referral_bonus_amount || 0}
                    onChange={(e) => handleSettingChange('referral_bonus_amount', parseInt(e.target.value) || 0)}
                    className="input"
                    style={{ padding: "0.6rem 1rem", borderRadius: "8px", border: "1px solid var(--border)", background: "var(--bg-elevated)", color: "var(--text)", width: "100%" }}
                  />
                </label>
              </div>
            </div>

            {/* Save Button */}
            <div style={{ display: "flex", justifyContent: "flex-start", marginTop: "1rem" }}>
              <button 
                onClick={handleSave} 
                disabled={saving}
                className="btn-primary" 
                style={{ padding: "0.7rem 1.5rem", display: "flex", alignItems: "center", gap: "0.5rem" }}
              >
                <Save size={16} />
                {saving ? "Saving..." : "Save Settings"}
              </button>
            </div>

          </div>
        )}

      </div>
    </div>
  );
}
