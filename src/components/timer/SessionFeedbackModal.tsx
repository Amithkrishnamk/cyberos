"use client";

import { useState, useEffect } from "react";
import { useTimer } from "@/providers/TimerContext";
import { CheckCircle2, MessageSquare, AlertTriangle, ArrowRight, Lock, Check } from "lucide-react";

export default function SessionFeedbackModal() {
  const { showFeedbackModal, category, completeSession, resetTimerState } = useTimer();

  const [contentStudied, setContentStudied] = useState("");
  const [difficulties, setDifficulties] = useState("");
  const [nextSteps, setNextSteps] = useState("");
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [formError, setFormError] = useState("");

  // Always reset form state & ensure Image 1 (Form) shows whenever modal opens
  useEffect(() => {
    if (showFeedbackModal) {
      setSubmitted(false);
      setContentStudied("");
      setDifficulties("");
      setNextSteps("");
      setFormError("");
      setLoading(false);
    }
  }, [showFeedbackModal]);

  if (!showFeedbackModal) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError("");

    if (!contentStudied.trim() || !difficulties.trim() || !nextSteps.trim()) {
      setFormError("All 3 reflection questions are mandatory to complete your study session.");
      return;
    }

    setLoading(true);

    try {
      await completeSession({
        contentStudied: contentStudied.trim(),
        difficulties: difficulties.trim(),
        nextSteps: nextSteps.trim(),
      });

      // Show Image 2 (Success Screen) after successful API save
      setSubmitted(true);
    } catch (err) {
      setFormError("Failed to save reflection. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleDoneClose = () => {
    resetTimerState();
    setSubmitted(false);
  };

  return (
    <div className="fixed inset-0 bg-black/85 backdrop-blur-md flex items-center justify-center p-4 z-50 animate-in fade-in duration-200">
      <div className="w-full max-w-lg bg-[#111827] border border-cyan-500/40 rounded-2xl shadow-2xl p-6 relative font-mono text-slate-200">
        {/* Header - mandatory notice */}
        <div className="flex items-center justify-between border-b border-slate-800 pb-4 mb-4">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-cyan-500/10 border border-cyan-500/30 flex items-center justify-center text-cyan-400">
              <MessageSquare className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-white tracking-wide">Mandatory Session Reflection Log</h2>
              <p className="text-xs text-cyan-400">Category: {category}</p>
            </div>
          </div>
          <span className="px-2.5 py-1 rounded-full text-[10px] font-bold bg-amber-950/80 border border-amber-800/60 text-amber-300 flex items-center gap-1">
            <Lock className="w-3 h-3 text-amber-400" /> Required
          </span>
        </div>

        {formError && (
          <div className="p-3 mb-4 bg-red-950/80 border border-red-800/80 rounded-xl text-red-300 text-xs font-bold flex items-center gap-2">
            <AlertTriangle className="w-4 h-4 text-red-400 shrink-0" />
            <span>{formError}</span>
          </div>
        )}

        {submitted ? (
          /* Image 2: Success Screen */
          <div className="py-6 flex flex-col items-center text-center space-y-4">
            <CheckCircle2 className="w-12 h-12 text-emerald-400 animate-bounce" />
            <div>
              <h3 className="text-lg font-bold text-white">Reflection Saved Successfully!</h3>
              <p className="text-xs text-slate-400 mt-1 max-w-sm">
                Your study reflection and verified time log have been saved to your profile and instructor dashboard.
              </p>
            </div>

            <button
              type="button"
              onClick={handleDoneClose}
              className="mt-2 px-6 py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white font-bold rounded-xl transition flex items-center gap-2 text-xs shadow-lg shadow-emerald-600/20"
            >
              <Check className="w-4 h-4" /> Close & Continue
            </button>
          </div>
        ) : (
          /* Image 1: Form Screen */
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs text-cyan-400 font-bold mb-1">
                1. WHAT DID YOU STUDY? <span className="text-red-400">*</span>
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
                <AlertTriangle className="w-3.5 h-3.5 text-amber-400" /> 2. WHAT WAS DIFFICULT / WHERE DID YOU GET STUCK? <span className="text-red-400">*</span>
              </label>
              <textarea
                required
                rows={2}
                value={difficulties}
                onChange={(e) => setDifficulties(e.target.value)}
                placeholder="e.g. Identifying column count using NULL values, or time-based extraction syntax..."
                className="w-full bg-[#090d16] border border-slate-800 focus:border-amber-500 text-white rounded-lg p-2.5 text-xs focus:outline-none transition"
              />
            </div>

            <div>
              <label className="block text-xs text-emerald-400 font-bold mb-1">
                3. NEXT STEPS / WHAT TO REVIEW NEXT <span className="text-red-400">*</span>
              </label>
              <textarea
                required
                rows={2}
                value={nextSteps}
                onChange={(e) => setNextSteps(e.target.value)}
                placeholder="e.g. Practice PortSwigger Blind SQLi lab without hints..."
                className="w-full bg-[#090d16] border border-slate-800 focus:border-emerald-500 text-white rounded-lg p-2.5 text-xs focus:outline-none transition"
              />
            </div>

            <div className="pt-2">
              <button
                type="submit"
                disabled={loading || !contentStudied.trim() || !difficulties.trim() || !nextSteps.trim()}
                className="w-full py-3 bg-cyan-600 hover:bg-cyan-500 text-white font-bold rounded-xl transition flex items-center justify-center gap-2 text-xs shadow-lg shadow-cyan-600/20 disabled:opacity-50"
              >
                {loading ? (
                  <span>SUBMITTING REFLECTION...</span>
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
