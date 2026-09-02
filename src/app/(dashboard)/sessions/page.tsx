"use client";

import { useEffect, useState } from "react";
import { Clock, MessageSquare, AlertTriangle, Calendar, BookOpen, Flame } from "lucide-react";

export default function StudySessionsPage() {
  const [sessions, setSessions] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadSessions() {
      try {
        const res = await fetch("/api/sessions");
        const data = await res.json();
        setSessions(data.sessions || []);
      } catch (err) {
        console.error("Error loading sessions:", err);
      } finally {
        setLoading(false);
      }
    }

    loadSessions();
  }, []);

  return (
    <div className="max-w-7xl mx-auto space-y-6 font-mono">
      <div className="border-b border-[#1f293d] pb-6">
        <h1 className="text-2xl font-bold text-white flex items-center gap-2">
          <Clock className="w-6 h-6 text-cyan-400" /> STUDY SESSIONS & REFLECTION LOGS
        </h1>
        <p className="text-xs text-slate-400 mt-1">
          Review your recorded study time, content studied, flagged difficulties, and next step reflections.
        </p>
      </div>

      {loading ? (
        <div className="text-center py-16 text-cyan-400 text-xs">LOADING SESSION HISTORY...</div>
      ) : sessions.length === 0 ? (
        <div className="bg-[#111827] border border-[#1f293d] rounded-2xl p-12 text-center space-y-3">
          <Clock className="w-10 h-10 text-slate-600 mx-auto" />
          <h3 className="text-sm font-bold text-white">No Study Sessions Logged Yet</h3>
          <p className="text-xs text-slate-400 max-w-sm mx-auto">
            Use the global Study Timer in the header bar to track your sessions and record reflection notes.
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {sessions.map((item) => (
            <div
              key={item.id}
              className="bg-[#111827] border border-[#1f293d] rounded-2xl p-6 shadow-xl space-y-3"
            >
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-800 pb-3">
                <div className="flex items-center gap-2">
                  <span className="px-2.5 py-0.5 rounded-full bg-cyan-950/80 border border-cyan-800/50 text-cyan-300 text-xs font-bold">
                    {item.category || "General"}
                  </span>
                  {item.linkedNote?.title && (
                    <span className="text-xs text-slate-300 font-bold flex items-center gap-1">
                      <BookOpen className="w-3.5 h-3.5 text-cyan-400" /> {item.linkedNote.title}
                    </span>
                  )}
                </div>

                <div className="flex items-center gap-3 text-xs">
                  <span className="text-emerald-400 font-bold flex items-center gap-1">
                    <Flame className="w-3.5 h-3.5 text-emerald-400" /> {item.durationMinutes} mins
                  </span>
                  <span className="text-slate-600">•</span>
                  <span className="text-slate-400 flex items-center gap-1">
                    <Calendar className="w-3.5 h-3.5" />
                    {new Date(item.startedAt).toLocaleString()}
                  </span>
                </div>
              </div>

              <div>
                <div className="text-[10px] text-cyan-400 font-bold uppercase mb-1">Content Studied</div>
                <p className="text-xs text-slate-200">{item.contentStudied || "Study session completed."}</p>
              </div>

              {item.difficulties && (
                <div className="bg-amber-950/30 border border-amber-900/50 rounded-xl p-3">
                  <div className="text-[10px] text-amber-400 font-bold uppercase mb-1 flex items-center gap-1">
                    <AlertTriangle className="w-3.5 h-3.5 text-amber-400" /> Flagged Struggles / Difficulties
                  </div>
                  <p className="text-xs text-amber-200">{item.difficulties}</p>
                </div>
              )}

              {item.nextSteps && (
                <div>
                  <div className="text-[10px] text-emerald-400 font-bold uppercase mb-1">Next Steps</div>
                  <p className="text-xs text-slate-300">{item.nextSteps}</p>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
