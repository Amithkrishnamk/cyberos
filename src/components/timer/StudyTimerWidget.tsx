"use client";

import { useState, useEffect } from "react";
import { useTimer } from "@/providers/TimerContext";
import { Play, Pause, Square, Clock, ChevronDown, Flame, Link as LinkIcon } from "lucide-react";
import { NoteCategory } from "@/types";

export default function StudyTimerWidget() {
  const {
    status,
    elapsedSeconds,
    category,
    startTimer,
    pauseTimer,
    resumeTimer,
    stopTimer,
  } = useTimer();

  const [notes, setNotes] = useState<Array<{ id: string; title: string; category: string; icon?: string }>>([]);
  const [selectedNoteId, setSelectedNoteId] = useState<string>("");
  const [selectedCategory, setSelectedCategory] = useState<NoteCategory>("Web Security");
  const [isExpanded, setIsExpanded] = useState<boolean>(false);

  useEffect(() => {
    fetch("/api/notes")
      .then((res) => res.json())
      .then((data) => {
        if (data.notes) {
          setNotes(data.notes);
        }
      })
      .catch(() => {});
  }, []);

  const formatTime = (totalSec: number) => {
    const mins = Math.floor(totalSec / 60);
    const secs = totalSec % 60;
    return `${mins.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`;
  };

  const handleStart = () => {
    startTimer({
      mode: "stopwatch",
      targetMinutes: 0,
      linkedNoteId: selectedNoteId || undefined,
      category: selectedCategory,
    });
    setIsExpanded(false);
  };

  return (
    <div className="relative">
      {/* Active Running Widget in Navigation */}
      {status !== "idle" ? (
        <div className="flex items-center gap-3 bg-[#111827] border border-cyan-500/40 rounded-lg px-3 py-1.5 shadow-lg shadow-cyan-500/10 text-xs font-mono">
          <div className="flex items-center gap-1.5 text-cyan-400 font-bold animate-pulse">
            <Flame className="w-4 h-4 text-cyan-400" />
            <span>{formatTime(elapsedSeconds)}</span>
          </div>

          <div className="hidden md:flex items-center gap-1.5 text-slate-400 border-l border-slate-800 pl-3">
            <span className="truncate max-w-[120px] text-slate-300">{category}</span>
          </div>

          <div className="flex items-center gap-1 ml-1 border-l border-slate-800 pl-2">
            {status === "running" ? (
              <button
                onClick={pauseTimer}
                title="Pause Session"
                className="p-1 hover:bg-slate-800 text-amber-400 rounded transition"
              >
                <Pause className="w-3.5 h-3.5" />
              </button>
            ) : (
              <button
                onClick={resumeTimer}
                title="Resume Session"
                className="p-1 hover:bg-slate-800 text-emerald-400 rounded transition"
              >
                <Play className="w-3.5 h-3.5" />
              </button>
            )}

            <button
              onClick={stopTimer}
              title="Stop & Log Session"
              className="p-1 hover:bg-slate-800 text-red-400 rounded transition"
            >
              <Square className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      ) : (
        /* Idle Start Timer Control */
        <div className="relative">
          <button
            onClick={() => setIsExpanded(!isExpanded)}
            className="flex items-center gap-2 bg-[#111827] hover:bg-[#1a2336] border border-[#1f293d] hover:border-cyan-500/50 rounded-lg px-3 py-1.5 text-xs font-mono text-slate-300 transition"
          >
            <Clock className="w-3.5 h-3.5 text-cyan-400" />
            <span>STUDY TIMER</span>
            <ChevronDown className="w-3 h-3 text-slate-500" />
          </button>

          {isExpanded && (
            <div className="absolute right-0 top-full mt-2 w-72 bg-[#111827] border border-[#1f293d] rounded-xl shadow-2xl p-4 z-50 text-xs font-mono space-y-3">
              <div className="flex items-center justify-between text-slate-300 border-b border-slate-800 pb-2">
                <span className="font-bold text-white flex items-center gap-1.5">
                  <Clock className="w-3.5 h-3.5 text-cyan-400" /> Start Study Session
                </span>
              </div>

              {/* Category Dropdown */}
              <div>
                <label className="block text-[10px] text-slate-400 uppercase mb-1">Target Category</label>
                <select
                  value={selectedCategory}
                  onChange={(e) => setSelectedCategory(e.target.value as NoteCategory)}
                  className="w-full bg-[#090d16] border border-slate-800 rounded px-2.5 py-1.5 text-white text-xs focus:border-cyan-500 focus:outline-none"
                >
                  <option value="Web Security">Web Security</option>
                  <option value="Linux">Linux</option>
                  <option value="Active Directory">Active Directory</option>
                  <option value="SOC">SOC</option>
                  <option value="Networking">Networking</option>
                  <option value="Pentesting">Pentesting</option>
                  <option value="General">General</option>
                </select>
              </div>

              {/* Optional Linked Note */}
              <div>
                <label className="block text-[10px] text-slate-400 uppercase mb-1 flex items-center gap-1">
                  <LinkIcon className="w-2.5 h-2.5 text-cyan-400" /> Link Note (Optional)
                </label>
                <select
                  value={selectedNoteId}
                  onChange={(e) => setSelectedNoteId(e.target.value)}
                  className="w-full bg-[#090d16] border border-slate-800 rounded px-2.5 py-1.5 text-white text-xs focus:border-cyan-500 focus:outline-none truncate"
                >
                  <option value="">-- None --</option>
                  {notes.map((n) => (
                    <option key={n.id} value={n.id}>
                      {n.icon} {n.title}
                    </option>
                  ))}
                </select>
              </div>

              <button
                type="button"
                onClick={handleStart}
                className="w-full py-2.5 bg-cyan-600 hover:bg-cyan-500 text-white font-bold rounded-lg transition flex items-center justify-center gap-1.5 shadow-lg shadow-cyan-600/20"
              >
                <Play className="w-3.5 h-3.5 fill-current" /> START TIMER
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
