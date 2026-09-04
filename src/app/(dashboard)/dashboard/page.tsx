"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useSession } from "next-auth/react";
import TodayClassCard from "@/components/dashboard/TodayClassCard";
import { calculateStudyStreak } from "@/lib/streak";
import {
  BookOpen,
  Clock,
  CheckSquare,
  Plus,
  Flame,
  ArrowUpRight,
  Shield,
  FileText,
  Activity,
} from "lucide-react";

export default function DashboardPage() {
  const { data: session } = useSession();
  const userName = session?.user?.name || "Student";

  const [stats, setStats] = useState({
    totalHours: 0,
    notesCount: 0,
    labsCount: 0,
    streakDays: 0,
  });
  const [recentNotes, setRecentNotes] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadDashboardData() {
      try {
        const [notesRes, sessionsRes, labsRes] = await Promise.all([
          fetch("/api/notes"),
          fetch("/api/sessions"),
          fetch("/api/labs"),
        ]);

        const notesData = await notesRes.json();
        const sessionsData = await sessionsRes.json();
        const labsData = await labsRes.json();

        const notesList = notesData.notes || [];
        const sessionsList = sessionsData.sessions || [];
        const labsList = labsData.labs || [];

        const totalMinutes = sessionsList.reduce(
          (acc: number, s: any) => acc + (s.durationMinutes || 0),
          0
        );
        const totalHours = Math.round((totalMinutes / 60) * 10) / 10;
        const streakDays = calculateStudyStreak(sessionsList);

        setStats({
          totalHours,
          notesCount: notesList.length,
          labsCount: labsList.length,
          streakDays,
        });

        setRecentNotes(notesList.slice(0, 5));
      } catch (err) {
        console.error("Error loading dashboard data:", err);
      } finally {
        setLoading(false);
      }
    }

    if (session?.user) {
      loadDashboardData();
    }
  }, [session]);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh] font-mono text-cyan-400">
        <div className="flex items-center gap-2">
          <Activity className="w-5 h-5 animate-spin" />
          <span>LOADING OPERATOR DASHBOARD...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8 font-mono max-w-7xl mx-auto">
      {/* Welcome Banner */}
      <div className="relative overflow-hidden bg-gradient-to-r from-[#111827] via-[#162238] to-[#111827] border border-[#1f293d] rounded-2xl p-6 md:p-8">
        <div className="absolute -right-10 -bottom-10 w-60 h-60 bg-cyan-500/10 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 bg-cyan-500/10 border border-cyan-500/30 rounded-full text-cyan-400 text-xs mb-3">
              <Shield className="w-3.5 h-3.5" /> ACTIVE OPERATOR SESSION
            </div>
            <h1 className="text-2xl md:text-3xl font-bold text-white tracking-wide">
              Welcome Back, <span className="text-cyan-400">{userName}</span>
            </h1>
            <p className="text-xs text-slate-400 mt-1 max-w-xl">
              Track your cybersecurity learning trajectory, manage block-based notes, complete labs, and log study reflections.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <Link
              href="/notes"
              className="px-4 py-2.5 bg-cyan-600 hover:bg-cyan-500 text-white font-bold text-xs rounded-lg transition flex items-center gap-2 shadow-lg shadow-cyan-600/20"
            >
              <Plus className="w-4 h-4" /> CREATE NOTE
            </Link>
          </div>
        </div>
      </div>

      {/* TODAY'S CLASS CONTENT & SYLLABUS ANNOUNCEMENT */}
      <TodayClassCard />

      {/* Metrics Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Total Study Hours */}
        <div className="bg-[#111827] border border-[#1f293d] rounded-xl p-5 relative overflow-hidden">
          <div className="flex items-center justify-between text-slate-400 mb-2">
            <span className="text-xs">TOTAL STUDY TIME</span>
            <Clock className="w-4 h-4 text-cyan-400" />
          </div>
          <div className="text-2xl font-bold text-white">{stats.totalHours} <span className="text-xs text-slate-400 font-normal">HRS</span></div>
          <div className="text-[10px] text-cyan-400 mt-2">Verified from server sessions</div>
        </div>

        {/* Notes Created */}
        <div className="bg-[#111827] border border-[#1f293d] rounded-xl p-5 relative overflow-hidden">
          <div className="flex items-center justify-between text-slate-400 mb-2">
            <span className="text-xs">NOTES & DOCS</span>
            <BookOpen className="w-4 h-4 text-emerald-400" />
          </div>
          <div className="text-2xl font-bold text-white">{stats.notesCount} <span className="text-xs text-slate-400 font-normal">PAGES</span></div>
          <div className="text-[10px] text-emerald-400 mt-2">Notion-style block database</div>
        </div>

        {/* Labs Completed */}
        <div className="bg-[#111827] border border-[#1f293d] rounded-xl p-5 relative overflow-hidden">
          <div className="flex items-center justify-between text-slate-400 mb-2">
            <span className="text-xs">LABS COMPLETED</span>
            <CheckSquare className="w-4 h-4 text-violet-400" />
          </div>
          <div className="text-2xl font-bold text-white">{stats.labsCount} <span className="text-xs text-slate-400 font-normal">LABS</span></div>
          <div className="text-[10px] text-violet-400 mt-2">Practical hands-on exercises</div>
        </div>

        {/* Study Streak */}
        <div className="bg-[#111827] border border-[#1f293d] rounded-xl p-5 relative overflow-hidden">
          <div className="flex items-center justify-between text-slate-400 mb-2">
            <span className="text-xs">STUDY STREAK</span>
            <Flame className="w-4 h-4 text-amber-400" />
          </div>
          <div className="text-2xl font-bold text-white">
            {stats.streakDays} <span className="text-xs text-slate-400 font-normal">DAYS 🔥</span>
          </div>
          <div className="text-[10px] text-amber-400 mt-2">
            {stats.streakDays > 0 ? `${stats.streakDays}-day consecutive study streak!` : "Log a session today to start your streak!"}
          </div>
        </div>
      </div>

      {/* Recent Notes Section */}
      <div className="bg-[#111827] border border-[#1f293d] rounded-xl p-6">
        <div className="flex items-center justify-between mb-4 pb-3 border-b border-slate-800">
          <h2 className="text-sm font-bold text-white flex items-center gap-2">
            <FileText className="w-4 h-4 text-cyan-400" /> RECENT NOTES & MODULES
          </h2>
          <Link href="/notes" className="text-xs text-cyan-400 hover:underline flex items-center gap-1">
            VIEW ALL <ArrowUpRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        {recentNotes.length === 0 ? (
          <div className="text-center py-8 text-slate-500 text-xs">
            No notes created yet. Click "Create Note" above to launch your first Notion-style cybersecurity document!
          </div>
        ) : (
          <div className="space-y-2">
            {recentNotes.map((note) => (
              <Link
                key={note.id}
                href={`/notes/${note.id}`}
                className="flex items-center justify-between p-3 rounded-lg bg-[#090d16] hover:bg-[#0f172a] border border-[#1f293d] hover:border-cyan-500/40 transition group"
              >
                <div className="flex items-center gap-3 overflow-hidden">
                  <span className="text-base">{note.icon}</span>
                  <div className="overflow-hidden">
                    <div className="text-xs font-bold text-white group-hover:text-cyan-400 transition truncate">
                      {note.title}
                    </div>
                    <div className="text-[10px] text-slate-400 flex items-center gap-2">
                      <span className="text-cyan-400">{note.category}</span> •{" "}
                      <span>{note.timeStudiedMinutes || 0} mins studied</span>
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-3 shrink-0">
                  <div className="hidden sm:block text-[10px] px-2 py-0.5 rounded bg-slate-800 text-slate-300">
                    Mastery: {note.masteryPercent}%
                  </div>
                  <ArrowUpRight className="w-4 h-4 text-slate-500 group-hover:text-cyan-400 transition" />
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
