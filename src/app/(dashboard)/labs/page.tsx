"use client";

import { useEffect, useState } from "react";
import { CheckSquare, Plus, Search, Calendar, FileText, CheckCircle2 } from "lucide-react";

export default function LabsTrackerPage() {
  const [labs, setLabs] = useState<any[]>([]);
  const [labName, setLabName] = useState("");
  const [notes, setNotes] = useState("");
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  async function fetchLabs() {
    try {
      const res = await fetch("/api/labs");
      const data = await res.json();
      setLabs(data.labs || []);
    } catch (err) {
      console.error("Error loading labs:", err);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    fetchLabs();
  }, []);

  const handleCreateLab = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);

    try {
      await fetch("/api/labs", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ labName, notes }),
      });

      setLabName("");
      setNotes("");
      setShowModal(false);
      await fetchLabs();
    } catch (err) {
      console.error("Error creating lab:", err);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="max-w-7xl mx-auto space-y-6 font-mono">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[#1f293d] pb-6">
        <div>
          <h1 className="text-2xl font-bold text-white flex items-center gap-2">
            <CheckSquare className="w-6 h-6 text-amber-400" /> LAB COMPLETION TRACKER
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            Log hands-on cybersecurity exercises, PortSwigger labs, TryHackMe rooms, and CTF challenges.
          </p>
        </div>

        <button
          onClick={() => setShowModal(true)}
          className="px-4 py-2.5 bg-amber-600 hover:bg-amber-500 text-white font-bold text-xs rounded-lg transition flex items-center gap-2 shadow-lg shadow-amber-600/20"
        >
          <Plus className="w-4 h-4" /> LOG LAB COMPLETION
        </button>
      </div>

      {/* Labs List */}
      {loading ? (
        <div className="text-center py-16 text-amber-400 text-xs">LOADING LAB RECORDS...</div>
      ) : labs.length === 0 ? (
        <div className="bg-[#111827] border border-[#1f293d] rounded-2xl p-12 text-center space-y-3">
          <CheckCircle2 className="w-10 h-10 text-slate-600 mx-auto" />
          <h3 className="text-sm font-bold text-white">No Labs Logged Yet</h3>
          <p className="text-xs text-slate-400 max-w-sm mx-auto">
            Log completed hands-on lab exercises to build your verified practical portfolio.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {labs.map((lab) => (
            <div
              key={lab.id}
              className="bg-[#111827] border border-[#1f293d] rounded-2xl p-5 shadow-xl flex flex-col justify-between"
            >
              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="px-2.5 py-0.5 rounded-full text-[10px] bg-amber-950/60 border border-amber-800/40 text-amber-300 font-bold flex items-center gap-1">
                    <CheckCircle2 className="w-3 h-3 text-amber-400" /> COMPLETED
                  </span>
                  <span className="text-[10px] text-slate-500 flex items-center gap-1">
                    <Calendar className="w-3 h-3" />
                    {new Date(lab.completedAt).toLocaleDateString()}
                  </span>
                </div>

                <h2 className="text-sm font-bold text-white mb-2">{lab.labName}</h2>

                {lab.notes && (
                  <p className="text-xs text-slate-300 bg-[#090d16] p-3 rounded-xl border border-slate-800/80">
                    {lab.notes}
                  </p>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="w-full max-w-md bg-[#111827] border border-[#1f293d] rounded-2xl p-6 space-y-4">
            <h3 className="text-sm font-bold text-white">Log Practical Lab Completion</h3>

            <form onSubmit={handleCreateLab} className="space-y-4">
              <div>
                <label className="block text-xs text-slate-400 mb-1">LAB / ROOM NAME</label>
                <input
                  type="text"
                  required
                  value={labName}
                  onChange={(e) => setLabName(e.target.value)}
                  placeholder="e.g. PortSwigger: SQL injection UNION attack"
                  className="w-full bg-[#090d16] border border-slate-800 focus:border-amber-500 text-white rounded-lg p-2.5 text-xs focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs text-slate-400 mb-1">LAB NOTES / SOLVE PROCEDURE</label>
                <textarea
                  rows={3}
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="e.g. Identified 2 columns using NULL values, extracted database version..."
                  className="w-full bg-[#090d16] border border-slate-800 focus:border-amber-500 text-white rounded-lg p-2.5 text-xs focus:outline-none"
                />
              </div>

              <div className="flex gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="flex-1 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-lg text-xs font-bold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting || !labName.trim()}
                  className="flex-1 py-2 bg-amber-600 hover:bg-amber-500 text-white font-bold rounded-lg text-xs disabled:opacity-50"
                >
                  {submitting ? "Saving..." : "Save Lab Log"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
