import { redirect } from "next/navigation";
import Link from "next/link";
import { getAuthSession } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import StudentRosterTable from "@/components/admin/StudentRosterTable";
import {
  ShieldAlert,
  Users,
  Clock,
  BookOpen,
  CheckSquare,
  AlertTriangle,
  Download,
  UserPlus,
} from "lucide-react";

export const dynamic = "force-dynamic";

export default async function AdminDashboardPage() {
  const session = await getAuthSession();

  if (!session?.user || (session.user as any).role !== "ADMIN") {
    redirect("/dashboard");
  }

  // Fetch real database metrics across all students
  const students = await prisma.user.findMany({
    where: { role: "STUDENT" },
    include: {
      notes: { select: { id: true } },
      studySessions: { select: { durationMinutes: true, difficulties: true, category: true } },
      labCompletions: { select: { id: true } },
    },
    orderBy: { createdAt: "desc" },
  });

  const totalStudents = students.length;
  const totalNotes = await prisma.note.count();
  const totalLabs = await prisma.labCompletion.count();

  const allSessions = await prisma.studySession.findMany({
    select: { durationMinutes: true, difficulties: true, category: true, startedAt: true },
  });

  const totalMinutes = allSessions.reduce((acc, s) => acc + (s.durationMinutes || 0), 0);
  const totalHours = Math.round((totalMinutes / 60) * 10) / 10;

  // Aggregate difficulties frequency list
  const categoryStrugglesMap: Record<string, number> = {};
  allSessions.forEach((s) => {
    if (s.difficulties && s.difficulties.trim().length > 0) {
      const cat = s.category || "General";
      categoryStrugglesMap[cat] = (categoryStrugglesMap[cat] || 0) + 1;
    }
  });

  const topDifficulties = Object.entries(categoryStrugglesMap)
    .map(([category, count]) => ({ category, count }))
    .sort((a, b) => b.count - a.count);

  const formattedStudents = students.map((student) => {
    const studentMins = student.studySessions.reduce(
      (acc, s) => acc + (s.durationMinutes || 0),
      0
    );
    const studentHours = Math.round((studentMins / 60) * 10) / 10;

    return {
      id: student.id,
      name: student.name,
      email: student.email,
      studyHours: studentHours,
      notesCount: student.notes.length,
      labsCount: student.labCompletions.length,
    };
  });

  return (
    <div className="max-w-7xl mx-auto space-y-8 font-mono">
      {/* Admin Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[#1f293d] pb-6">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 bg-red-500/10 border border-red-500/30 rounded-full text-red-400 text-xs mb-2">
            <ShieldAlert className="w-3.5 h-3.5" /> INSTRUCTOR & ADMIN PRIVILEGED ROLE
          </div>
          <h1 className="text-2xl font-bold text-white tracking-wide">ORGANIZATION OVERVIEW</h1>
          <p className="text-xs text-slate-400 mt-1">
            Real-time telemetry, student progress reflections, and difficulty insights across the platform.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <Link
            href="/admin/users"
            className="px-3.5 py-2 bg-slate-800 hover:bg-slate-700 text-cyan-300 font-bold text-xs rounded-lg border border-cyan-800/40 transition flex items-center gap-1.5"
          >
            <UserPlus className="w-4 h-4" /> USER MANAGEMENT
          </Link>

          <a
            href="/api/admin/reports/weekly/export-pdf?days=7"
            target="_blank"
            rel="noopener noreferrer"
            className="px-4 py-2 bg-cyan-600 hover:bg-cyan-500 text-white font-bold text-xs rounded-lg transition flex items-center gap-2 shadow-lg shadow-cyan-600/20"
          >
            <Download className="w-4 h-4" /> EXPORT WEEKLY ORG PDF
          </a>
        </div>
      </div>

      {/* Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-[#111827] border border-[#1f293d] rounded-xl p-5">
          <div className="flex items-center justify-between text-slate-400 mb-2">
            <span className="text-xs">REGISTERED STUDENTS</span>
            <Users className="w-4 h-4 text-cyan-400" />
          </div>
          <div className="text-2xl font-bold text-white">{totalStudents}</div>
          <div className="text-[10px] text-cyan-400 mt-2">Active platform users</div>
        </div>

        <div className="bg-[#111827] border border-[#1f293d] rounded-xl p-5">
          <div className="flex items-center justify-between text-slate-400 mb-2">
            <span className="text-xs">CUMULATIVE STUDY HOURS</span>
            <Clock className="w-4 h-4 text-emerald-400" />
          </div>
          <div className="text-2xl font-bold text-white">{totalHours} <span className="text-xs text-slate-400 font-normal">HRS</span></div>
          <div className="text-[10px] text-emerald-400 mt-2">Server verified session pings</div>
        </div>

        <div className="bg-[#111827] border border-[#1f293d] rounded-xl p-5">
          <div className="flex items-center justify-between text-slate-400 mb-2">
            <span className="text-xs">TOTAL NOTES CREATED</span>
            <BookOpen className="w-4 h-4 text-violet-400" />
          </div>
          <div className="text-2xl font-bold text-white">{totalNotes}</div>
          <div className="text-[10px] text-violet-400 mt-2">Notion-style documentation blocks</div>
        </div>

        <div className="bg-[#111827] border border-[#1f293d] rounded-xl p-5">
          <div className="flex items-center justify-between text-slate-400 mb-2">
            <span className="text-xs">LABS COMPLETED</span>
            <CheckSquare className="w-4 h-4 text-amber-400" />
          </div>
          <div className="text-2xl font-bold text-white">{totalLabs}</div>
          <div className="text-[10px] text-amber-400 mt-2">Hands-on lab completions</div>
        </div>
      </div>

      {/* Aggregate Difficulties Section */}
      <div className="bg-[#111827] border border-amber-500/30 rounded-2xl p-6 shadow-xl">
        <div className="flex items-center justify-between mb-4 pb-3 border-b border-slate-800">
          <div className="flex items-center gap-2">
            <AlertTriangle className="w-5 h-5 text-amber-400" />
            <h2 className="text-sm font-bold text-white">TOP FLAGGED STUDY DIFFICULTIES ACROSS STUDENTS</h2>
          </div>
          <span className="text-xs text-amber-400 bg-amber-950/60 px-2.5 py-1 rounded-full border border-amber-800/40">
            Instructor Insight
          </span>
        </div>

        {topDifficulties.length === 0 ? (
          <div className="text-xs text-slate-400 py-4">No study difficulties flagged by students yet.</div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            {topDifficulties.map((item, idx) => (
              <div
                key={idx}
                className="bg-[#090d16] border border-slate-800 rounded-xl p-4 flex items-center justify-between"
              >
                <div>
                  <div className="text-xs font-bold text-white">{item.category}</div>
                  <div className="text-[10px] text-slate-400 mt-0.5">Flagged Struggles</div>
                </div>
                <div className="text-xl font-bold text-amber-400 bg-amber-950/40 px-3 py-1 rounded-lg border border-amber-800/30">
                  {item.count}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Student Roster Table with Direct Delete Option */}
      <div className="bg-[#111827] border border-[#1f293d] rounded-2xl p-6 shadow-xl space-y-4">
        <div className="flex items-center justify-between border-b border-slate-800 pb-3">
          <h2 className="text-sm font-bold text-white flex items-center gap-2">
            <Users className="w-4 h-4 text-cyan-400" /> STUDENT ROSTER & PROGRESS TELEMETRY
          </h2>

          <Link
            href="/admin/users"
            className="text-xs text-cyan-400 hover:underline flex items-center gap-1 font-bold"
          >
            Manage All Accounts →
          </Link>
        </div>

        {students.length === 0 ? (
          <div className="text-xs text-slate-500 py-8 text-center">No student accounts registered yet.</div>
        ) : (
          <StudentRosterTable initialStudents={formattedStudents} />
        )}
      </div>
    </div>
  );
}
