"use client";

import { useState } from "react";
import { useSession } from "next-auth/react";
import { useCyberTheme } from "@/providers/ThemeProvider";
import { CyberTheme } from "@/types";
import { Settings, Palette, User, Shield, Check, Save } from "lucide-react";

const THEMES: Array<{ id: CyberTheme; name: string; accentColor: string; bgPreview: string }> = [
  { id: "cyan", name: "Cyber Cyan", accentColor: "#06b6d4", bgPreview: "#090d16" },
  { id: "emerald", name: "Emerald Hacker", accentColor: "#10b981", bgPreview: "#06140e" },
  { id: "violet", name: "Neon Violet", accentColor: "#8b5cf6", bgPreview: "#0f0a1c" },
  { id: "amber", name: "Amber Terminal", accentColor: "#f59e0b", bgPreview: "#140d05" },
  { id: "red", name: "Red Team", accentColor: "#ef4444", bgPreview: "#140507" },
  { id: "stealth", name: "Stealth Blue", accentColor: "#3b82f6", bgPreview: "#050a14" },
];

export default function SettingsPage() {
  const { data: session, update } = useSession();
  const { theme, setTheme } = useCyberTheme();

  const [name, setName] = useState(session?.user?.name || "");
  const [saving, setSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);

  const handleUpdateProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);

    try {
      await fetch("/api/user/settings", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, theme }),
      });

      await update({ name, theme });
      setSaveSuccess(true);
      setTimeout(() => setSaveSuccess(false), 2500);
    } catch (err) {
      console.error("Failed to update profile settings:", err);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-8 font-mono">
      <div className="border-b border-[#1f293d] pb-6">
        <h1 className="text-2xl font-bold text-white flex items-center gap-2">
          <Settings className="w-6 h-6 text-cyan-400" /> SYSTEM SETTINGS & PREFERENCES
        </h1>
        <p className="text-xs text-slate-400 mt-1">
          Customize your operator UI theme, update account details, and manage profile security settings.
        </p>
      </div>

      {/* Theme Picker Palette */}
      <div className="bg-[#111827] border border-[#1f293d] rounded-2xl p-6 shadow-xl space-y-4">
        <div className="flex items-center gap-2 border-b border-slate-800 pb-3">
          <Palette className="w-4 h-4 text-cyan-400" />
          <h2 className="text-sm font-bold text-white">SYSTEM THEME PALETTE</h2>
        </div>

        <p className="text-xs text-slate-400">
          Selected theme persists across devices in your database profile.
        </p>

        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 pt-2">
          {THEMES.map((item) => {
            const isSelected = theme === item.id;
            return (
              <button
                key={item.id}
                type="button"
                onClick={() => setTheme(item.id)}
                style={{ backgroundColor: item.bgPreview }}
                className={`p-4 rounded-xl border text-left transition flex flex-col justify-between h-24 relative overflow-hidden group ${
                  isSelected ? "border-cyan-400 ring-2 ring-cyan-400/30" : "border-slate-800 hover:border-slate-600"
                }`}
              >
                <div className="flex items-center justify-between w-full">
                  <span className="text-xs font-bold text-white">{item.name}</span>
                  {isSelected && <Check className="w-4 h-4 text-cyan-400" />}
                </div>

                <div className="flex items-center gap-1.5">
                  <div
                    style={{ backgroundColor: item.accentColor }}
                    className="w-4 h-4 rounded-full shadow-lg"
                  />
                  <span className="text-[10px] text-slate-400 font-mono">Accent</span>
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* Profile Settings Form */}
      <div className="bg-[#111827] border border-[#1f293d] rounded-2xl p-6 shadow-xl space-y-4">
        <div className="flex items-center gap-2 border-b border-slate-800 pb-3">
          <User className="w-4 h-4 text-cyan-400" />
          <h2 className="text-sm font-bold text-white">OPERATOR PROFILE DETAILS</h2>
        </div>

        {saveSuccess && (
          <div className="p-3 bg-emerald-950/60 border border-emerald-500/40 rounded-lg text-emerald-400 text-xs flex items-center gap-2">
            <Check className="w-4 h-4" /> Profile settings saved successfully!
          </div>
        )}

        <form onSubmit={handleUpdateProfile} className="space-y-4 max-w-md">
          <div>
            <label className="block text-xs text-slate-400 mb-1">FULL NAME</label>
            <input
              type="text"
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full bg-[#090d16] border border-[#1f293d] focus:border-cyan-500 text-white rounded-lg px-3 py-2 text-xs font-mono focus:outline-none"
            />
          </div>

          <div>
            <label className="block text-xs text-slate-400 mb-1">EMAIL ADDRESS (READ-ONLY)</label>
            <input
              type="email"
              disabled
              value={session?.user?.email || ""}
              className="w-full bg-slate-900 border border-slate-800 text-slate-400 rounded-lg px-3 py-2 text-xs font-mono cursor-not-allowed"
            />
          </div>

          <div>
            <label className="block text-xs text-slate-400 mb-1">ASSIGNED ROLE</label>
            <div className="inline-flex items-center gap-2 px-3 py-1 bg-cyan-950/60 border border-cyan-800/40 text-cyan-400 rounded-lg text-xs font-bold">
              <Shield className="w-3.5 h-3.5" /> {(session?.user as any)?.role || "STUDENT"}
            </div>
          </div>

          <button
            type="submit"
            disabled={saving}
            className="px-4 py-2.5 bg-cyan-600 hover:bg-cyan-500 text-white font-bold text-xs rounded-lg transition flex items-center gap-2 shadow-lg shadow-cyan-600/20 disabled:opacity-50"
          >
            <Save className="w-4 h-4" /> {saving ? "SAVING..." : "SAVE CHANGES"}
          </button>
        </form>
      </div>
    </div>
  );
}
