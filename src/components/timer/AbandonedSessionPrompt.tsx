"use client";

import { useTimer } from "@/providers/TimerContext";
import { AlertCircle, X, Check } from "lucide-react";

export default function AbandonedSessionPrompt() {
  const { abandonedSession, closeAbandonedPrompt } = useTimer();

  if (!abandonedSession) return null;

  return (
    <div className="fixed bottom-4 right-4 max-w-sm bg-[#111827] border border-amber-500/40 rounded-xl shadow-2xl p-4 z-50 font-mono text-xs text-slate-200 animate-in slide-in-from-bottom-5 duration-300">
      <div className="flex items-start justify-between gap-2 mb-2">
        <div className="flex items-center gap-2 text-amber-400 font-bold">
          <AlertCircle className="w-4 h-4" />
          <span>Unfinished Session Recovered</span>
        </div>
        <button onClick={closeAbandonedPrompt} className="text-slate-500 hover:text-slate-300">
          <X className="w-4 h-4" />
        </button>
      </div>

      <p className="text-slate-300 text-[11px] mb-3">
        An unclosed study session was detected. We auto-saved your study time based on your last active ping.
      </p>

      <div className="flex gap-2">
        <button
          onClick={closeAbandonedPrompt}
          className="flex-1 py-1.5 px-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded text-[11px] transition"
        >
          Dismiss
        </button>
      </div>
    </div>
  );
}
