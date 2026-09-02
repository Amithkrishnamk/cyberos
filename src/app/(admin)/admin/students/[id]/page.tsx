import { notFound, redirect } from "next/navigation";
import Link from "next/link";
import { getAuthSession } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import {
  ShieldAlert,
  User,
  Clock,
  BookOpen,
  CheckSquare,
  AlertTriangle,
  Download,
  ArrowLeft,
  Calendar,
  MessageSquare,
} from "lucide-react";

export const dynamic = "force-dynamic";

export default async function AdminStudentDetailPage({ params }: { params: { id: string } }) {
  const session = await getAuthSession();

  if (!session?.user || (session.user as any).role !== "ADMIN") {
    redirect("/dashboard");
  }

  const student = await prisma.user.findUnique({
    where: { id: params.id },
    include: {
      notes: { orderBy: { updatedAt: "desc" } },
      labCompletions: { orderBy: { completedAt: "desc" } },
      studySessions: {
        orderBy: { startedAt: "desc" },
      },
    },
  });

  if (!student) return notFound();

  const totalMinutes = student.studySessions.reduce(
    (acc, s) => acc + (s.durationMinutes || 0),
    0
  );
  const totalHours = Math.round((totalMinutes / 60) * 10) / 10;

  // Map notes lookup for linked note title
  const notesMap = new Map(student.notes.map((n) => [n.id, n.title]));

  return (
    <div className="max-w-7xl mx-auto space-y-8 font-mono">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[#1f293d] pb-6">
        <div>
          <Link
            href="/admin"
            className="inline-flex items-center gap-1.5 text-xs text-slate-400 hover:text-cyan-400 mb-2 transition"
          >
            <ArrowLeft className="w-3.5 h-3.5" /> Back to Admin Dashboard
          </Link>
          <h1 className="text-2xl font-bold text-white flex items-center gap-3">
            <div className="w-9 h-9 rounded-full bg-cyan-950 border border-cyan-700 flex items-center justify-center text-cyan-300 text-sm">
              {student.name.substring(0, 2).toUpperCase()}
            </div>
            {student.name}
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            Email: {student.email} • Registered: {new Date(student.createdAt).toLocaleDateString()}
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <a
            href={`/api/admin/reports/weekly/export-pdf?studentId=${student.id}`}
            target="_blank"
            rel="noopener noreferrer"
            className="px-3.5 py-2 bg-slate-800 hover:bg-slate-700 text-cyan-300 font-bold text-xs rounded-lg border border-cyan-800/40 transition flex items-center gap-1.5"
          >
            <Download className="w-3.5 h-3.5" /> Weekly PDF Report
          </a>

          <a
            href={`/api/admin/reports/${student.id}/export-pdf`}
            target="_blank"
            rel="noopener noreferrer"
            className="px-3.5 py-2 bg-cyan-600 hover:bg-cyan-500 text-white font-bold text-xs rounded-lg transition flex items-center gap-1.5 shadow-lg shadow-cyan-600/20"
          >
            <Download className="w-3.5 h-3.5" /> All-Time PDF Summary
          </a>
        </div>
      </div>

      {/* Overview Stat Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-[#111827] border border-[#1f293d] rounded-xl p-5">
          <div className="flex items-center justify-between text-slate-400 mb-2">
            <span className="text-xs">TOTAL STUDY TIME</span>
            <Clock className="w-4 h-4 text-emerald-400" />
          </div>
          <div className="text-2xl font-bold text-white">{totalHours} <span className="text-xs text-slate-400 font-normal">HRS</span></div>
        </div>

        <div className="bg-[#111827] border border-[#1f293d] rounded-xl p-5">
          <div className="flex items-center justify-between text-slate-400 mb-2">
            <span className="text-xs">NOTES & DOCS</span>
            <BookOpen className="w-4 h-4 text-cyan-400" />
          </div>
          <div className="text-2xl font-bold text-white">{student.notes.length}</div>
        </div>

        <div className="bg-[#111827] border border-[#1f293d] rounded-xl p-5">
          <div className="flex items-center justify-between text-slate-400 mb-2">
            <span className="text-xs">LABS COMPLETED</span>
            <CheckSquare className="w-4 h-4 text-amber-400" />
          </div>
          <div className="text-2xl font-bold text-white">{student.labCompletions.length}</div>
        </div>
      </div>

      {/* Study Sessions & Reflections Stream */}
      <div className="bg-[#111827] border border-[#1f293d] rounded-2xl p-6 shadow-xl space-y-4">
        <div className="flex items-center justify-between border-b border-slate-800 pb-3">
          <h2 className="text-sm font-bold text-white flex items-center gap-2">
            <MessageSquare className="w-4 h-4 text-cyan-400" /> STUDY SESSION REFLECTIONS & LOGS
          </h2>
          <span className="text-xs text-slate-400">{student.studySessions.length} Recorded Sessions</span>
        </div>

        {student.studySessions.length === 0 ? (
          <div className="text-xs text-slate-500 py-6 text-center">No study sessions logged by student yet.</div>
        ) : (
          <div className="space-y-4">
            {student.studySessions.map((sessionItem) => {
              const linkedTitle = sessionItem.linkedNoteId ? notesMap.get(sessionItem.linkedNoteId) : null;
              return (
                <div
                  key={sessionItem.id}
                  className="bg-[#090d16] border border-slate-800 rounded-xl p-4 space-y-3"
                >
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-800/80 pb-2">
                    <div className="flex items-center gap-2">
                      <span className="px-2 py-0.5 rounded bg-cyan-950 text-cyan-300 text-[10px] font-bold">
                        {sessionItem.category || "General"}
                      </span>
                      {linkedTitle && (
                        <span className="text-xs text-slate-300 font-bold">
                          Linked: {linkedTitle}
                        </span>
                      )}
                    </div>
                    <div className="text-[10px] text-emerald-400 flex items-center gap-3">
                      <span>Duration: {sessionItem.durationMinutes} mins</span>
                      <span className="text-slate-500">•</span>
                      <span className="text-slate-400">
                        {new Date(sessionItem.startedAt).toLocaleString()}
                      </span>
                    </div>
                  </div>

                  <div>
                    <div className="text-[10px] text-cyan-400 font-bold uppercase mb-0.5">Content Studied</div>
                    <p className="text-xs text-slate-200">{sessionItem.contentStudied || "N/A"}</p>
                  </div>

                  {sessionItem.difficulties && (
                    <div className="bg-amber-950/20 border border-amber-900/40 rounded-lg p-2.5">
                      <div className="text-[10px] text-amber-400 font-bold uppercase mb-0.5 flex items-center gap-1">
                        <AlertTriangle className="w-3 h-3 text-amber-400" /> Flagged Difficulty / Struggle
                      </div>
                      <p className="text-xs text-amber-200">{sessionItem.difficulties}</p>
                    </div>
                  )}

                  {sessionItem.nextSteps && (
                    <div>
                      <div className="text-[10px] text-emerald-400 font-bold uppercase mb-0.5">Next Steps</div>
                      <p className="text-xs text-slate-300">{sessionItem.nextSteps}</p>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Student Notes & Labs Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Student Notes */}
        <div className="bg-[#111827] border border-[#1f293d] rounded-2xl p-6 shadow-xl space-y-4">
          <h2 className="text-sm font-bold text-white flex items-center gap-2 border-b border-slate-800 pb-3">
            <BookOpen className="w-4 h-4 text-violet-400" /> STUDENT NOTES & DOCUMENTS
          </h2>

          {student.notes.length === 0 ? (
            <div className="text-xs text-slate-500 py-6 text-center">No notes created yet.</div>
          ) : (
            <div className="space-y-2">
              {student.notes.map((note) => (
                <div key={note.id} className="p-3 bg-[#090d16] border border-slate-800 rounded-lg">
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-xs font-bold text-white flex items-center gap-1.5">
                      <span>{note.icon}</span> {note.title}
                    </span>
                    <span className="text-[10px] text-cyan-400">{note.category}</span>
                  </div>
                  <div className="text-[10px] text-slate-400 flex items-center gap-3 mt-2">
                    <span>Mastery: {note.masteryPercent}%</span>
                    <span>Studied: {note.timeStudiedMinutes}m</span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Lab Completions */}
        <div className="bg-[#111827] border border-[#1f293d] rounded-2xl p-6 shadow-xl space-y-4">
          <h2 className="text-sm font-bold text-white flex items-center gap-2 border-b border-slate-800 pb-3">
            <CheckSquare className="w-4 h-4 text-amber-400" /> LAB COMPLETION LOGS
          </h2>

          {student.labCompletions.length === 0 ? (
            <div className="text-xs text-slate-500 py-6 text-center">No labs logged yet.</div>
          ) : (
            <div className="space-y-2">
              {student.labCompletions.map((lab) => (
                <div key={lab.id} className="p-3 bg-[#090d16] border border-slate-800 rounded-lg">
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-xs font-bold text-emerald-400">{lab.labName}</span>
                    <span className="text-[10px] text-slate-500">
                      {new Date(lab.completedAt).toLocaleDateString()}
                    </span>
                  </div>
                  {(lab.keyLearnings || (lab as any).notes) && (
                    <p className="text-[11px] text-slate-300 mt-1">{lab.keyLearnings || (lab as any).notes}</p>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
