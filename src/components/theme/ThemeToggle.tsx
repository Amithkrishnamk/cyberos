"use client";

import { useCyberTheme } from "@/providers/ThemeProvider";
import { Sun, Moon } from "lucide-react";

export default function ThemeToggle() {
  const { theme, setTheme } = useCyberTheme();

  // If theme is "light", current mode is Light, otherwise default Dark ("cyan" or other dark themes)
  const isLight = theme === "light";

  const toggleTheme = (target: "light" | "dark") => {
    if (target === "light") {
      setTheme("light");
    } else {
      setTheme("cyan"); // Default dark theme
    }
  };

  return (
    <div className="flex items-center bg-[#090d16] border border-[#1f293d] p-1 rounded-xl font-mono text-xs shadow-inner">
      <button
        type="button"
        onClick={() => toggleTheme("light")}
        className={`flex items-center gap-1 px-2.5 py-1 rounded-lg transition-all duration-200 ${
          isLight
            ? "bg-white text-slate-900 font-bold shadow-md border border-slate-200"
            : "text-slate-400 hover:text-slate-200"
        }`}
        title="Switch to Light Theme"
      >
        <Sun className="w-3.5 h-3.5 text-amber-500" />
        <span className="text-[11px]">Light</span>
      </button>

      <button
        type="button"
        onClick={() => toggleTheme("dark")}
        className={`flex items-center gap-1 px-2.5 py-1 rounded-lg transition-all duration-200 ${
          !isLight
            ? "bg-cyan-500/20 text-cyan-400 font-bold border border-cyan-500/40 shadow-sm shadow-cyan-500/20"
            : "text-slate-400 hover:text-slate-200"
        }`}
        title="Switch to Dark Theme"
      >
        <Moon className="w-3.5 h-3.5 text-cyan-400" />
        <span className="text-[11px]">Dark</span>
      </button>
    </div>
  );
}
