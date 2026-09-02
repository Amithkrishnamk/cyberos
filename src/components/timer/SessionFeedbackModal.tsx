"use client";

import { useState } from "react";
import { useTimer } from "@/providers/TimerContext";
import { CheckCircle2, MessageSquare, AlertTriangle, ArrowRight, X } from "lucide-react";

export default function SessionFeedbackModal() {
  const { showFeedbackModal, category, completeSession, skipFeedback } = useTimer();

  const [contentStudied, setContentStudied] = useState("");
  const [difficulties, setDifficulties] = useState("");
  const [nextSteps, setNextSteps] = useState("");
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  if (!showFeedbackModal) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    await completeSession({
      contentStudied,
      difficulties,
      nextSteps,
    });

    setLoading(false);
    setSubmitted(true);
  };

  const handleSkip = async () => {
    setLoading(true);
    await skipFeedback();
    setLoading(false);
  };

  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 z-50 animate-in fade-in duration-200">
      <div className="w-full max-w-lg bg-[#111827] border border-[#1f293d] rounded-2xl shadow-2xl p-6 relative font-mono text-slate-200">
        <div className="flex items-center justify-between border-b border-slate-800 pb-4 mb-4">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-cyan-500/10 border border-cyan-500/30 flex items-center justify-center text-cyan-400">
              <MessageSquare className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-base font-bold text-white">Study Session Log & Reflection</h2>
              <p className="text-xs text-slate-400">Category: {category}</p>
            </div>
          </div>
          <button
            onClick={handleSkip}
            className="text-slate-500 hover:text-slate-300 transition p-1"
            title="Close / Skip"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {submitted ? (
          <div className="py-8 flex flex-col items-center text-center space-y-3">
            <CheckCircle2 className="w-12 h-12 text-emerald-400 animate-bounce" />
            <h3 className="text-lg font-bold text-white">Session Recorded Successfully!</h3>
            <p className="text-xs text-slate-400">
              Your study time and reflection notes have been saved to your profile and admin progress dashboard.
            </p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs text-cyan-400 font-bold mb-1">
                1. WHAT DID YOU STUDY?
              </label>
              <textarea
                required
                rows={2}
                value={contentStudied}
                onChange={(e) => setContentStudied(e.target.value)}
                placeholder="e.g. SQL Injection UNION payload construction & sqlmap testing..."
                className="w-full bg-[#090d16] border border-slate-800 focus:border-cyan-500 text-white rounded-lg p-2.5 text-xs focus:outline-none transition"
              />
            </div>

            <div>
              <label className="block text-xs text-amber-400 font-bold mb-1 flex items-center gap-1">
                <AlertTriangle className="w-3.5 h-3.5 text-amber-400" /> 2. WHAT WAS DIFFICULT / WHERE DID YOU GET STUCK?
              </label>
              <textarea
                rows={2}
                value={difficulties}
                onChange={(e) => setDifficulties(e.target.value)}
                placeholder="e.g. Identifying column count using NULL values, or time-based extraction syntax..."
                className="w-full bg-[#090d16] border border-slate-800 focus:border-amber-500 text-white rounded-lg p-2.5 text-xs focus:outline-none transition"
              />
            </div>

            <div>
              <label className="block text-xs text-emerald-400 font-bold mb-1">
                3. NEXT STEPS / WHAT TO REVIEW NEXT
              </label>
              <textarea
                rows={2}
                value={nextSteps}
                onChange={(e) => setNextSteps(e.target.value)}
                placeholder="e.g. Practice PortSwigger Blind SQLi lab without hints..."
                className="w-full bg-[#090d16] border border-slate-800 focus:border-emerald-500 text-white rounded-lg p-2.5 text-xs focus:outline-none transition"
              />
            </div>

            <div className="flex items-center gap-3 pt-2">
              <button
                type="button"
                onClick={handleSkip}
                disabled={loading}
                className="px-4 py-2.5 border border-slate-700 hover:border-slate-500 text-slate-400 hover:text-white rounded-lg text-xs transition"
              >
                Skip & Save Time Only
              </button>

              <button
                type="submit"
                disabled={loading || !contentStudied.trim()}
                className="flex-1 py-2.5 bg-cyan-600 hover:bg-cyan-500 text-white font-bold rounded-lg transition flex items-center justify-center gap-2 text-xs shadow-lg shadow-cyan-600/20 disabled:opacity-50"
              >
                {loading ? (
                  <span>SAVING...</span>
                ) : (
                  <>
                    SUBMIT REFLECTION <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}
