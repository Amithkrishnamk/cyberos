"use client";

import { useState } from "react";
import Link from "next/link";
import { useSession } from "next-auth/react";
import { ArrowUpRight, Trash2, AlertTriangle, Lock } from "lucide-react";

interface StudentUser {
  id: string;
  name: string;
  email: string;
  studyHours: number;
  notesCount: number;
  labsCount: number;
}

export default function StudentRosterTable({ initialStudents }: { initialStudents: StudentUser[] }) {
  const sessionResult = useSession();
  const session = sessionResult?.data;
  const currentUserId = (session?.user as any)?.id;

  const [students, setStudents] = useState<StudentUser[]>(initialStudents);
  const [deleteTarget, setDeleteTarget] = useState<StudentUser | null>(null);
  const [deleting, setDeleting] = useState(false);

  const handleDelete = async () => {
    if (!deleteTarget) return;

    if (deleteTarget.id === currentUserId) {
      alert("Self-delete blocked: You cannot delete your own active admin account.");
      setDeleteTarget(null);
      return;
    }

    setDeleting(true);

    try {
      const res = await fetch(`/api/admin/users/${deleteTarget.id}`, {
        method: "DELETE",
      });

      const data = await res.json();

      if (!res.ok) {
        alert(data.error || "Failed to delete user account.");
      } else {
        setStudents((prev) => prev.filter((s) => s.id !== deleteTarget.id));
      }
    } catch (err) {
      console.error("Error deleting user:", err);
      alert("Failed to delete user account.");
    } finally {
      setDeleting(false);
      setDeleteTarget(null);
    }
  };

  return (
    <>
      <div className="overflow-x-auto">
        <table className="w-full text-left text-xs font-mono">
          <thead>
            <tr className="border-b border-slate-800 text-slate-400 text-[10px] uppercase">
              <th className="pb-3 font-semibold">Student</th>
              <th className="pb-3 font-semibold">Email</th>
              <th className="pb-3 font-semibold">Study Hours</th>
              <th className="pb-3 font-semibold">Notes</th>
              <th className="pb-3 font-semibold">Labs</th>
              <th className="pb-3 font-semibold text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-800/60 font-mono">
            {students.map((student) => {
              const isCurrent = student.id === currentUserId;

              return (
                <tr key={student.id} className="hover:bg-[#162238]/50 transition">
                  <td className="py-3 font-bold text-white flex items-center gap-2">
                    <div className="w-7 h-7 rounded-full bg-cyan-950 border border-cyan-800 flex items-center justify-center text-cyan-300 text-[10px]">
                      {student.name.substring(0, 2).toUpperCase()}
                    </div>
                    {student.name}
                  </td>
                  <td className="py-3 text-slate-400">{student.email}</td>
                  <td className="py-3 text-emerald-400 font-bold">{student.studyHours} hrs</td>
                  <td className="py-3 text-violet-400">{student.notesCount} pages</td>
                  <td className="py-3 text-amber-400">{student.labsCount} labs</td>
                  <td className="py-3 text-right">
                    <div className="flex items-center justify-end gap-3">
                      <Link
                        href={`/admin/students/${student.id}`}
                        className="inline-flex items-center gap-1 text-cyan-400 hover:text-cyan-300 font-bold hover:underline"
                      >
                        Details <ArrowUpRight className="w-3.5 h-3.5" />
                      </Link>

                      {isCurrent ? (
                        <span className="inline-flex items-center gap-1 text-[10px] text-slate-500 bg-slate-900 border border-slate-800 px-2 py-0.5 rounded cursor-not-allowed">
                          <Lock className="w-3 h-3" /> Self
                        </span>
                      ) : (
                        <button
                          type="button"
                          onClick={() => setDeleteTarget(student)}
                          className="inline-flex items-center gap-1 text-slate-400 hover:text-red-400 hover:bg-red-950/40 px-2 py-0.5 rounded transition"
                          title="Delete Student Account"
                        >
                          <Trash2 className="w-3.5 h-3.5" /> Delete
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* Delete User Confirmation Modal */}
      {deleteTarget && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="w-full max-w-md bg-[#111827] border border-red-800/60 rounded-2xl p-6 space-y-4 font-mono">
            <div className="flex items-center gap-2 text-red-400 font-bold text-sm">
              <AlertTriangle className="w-5 h-5 text-red-400" /> Confirm Account Deletion
            </div>

            <p className="text-xs text-slate-300">
              Are you sure you want to permanently delete student account <strong className="text-white">{deleteTarget.email}</strong> ({deleteTarget.name})?
            </p>

            <div className="p-3 bg-red-950/40 border border-red-900/60 rounded-lg text-[11px] text-red-300">
              ⚠ This action will permanently remove all of this student's notes, study sessions, and lab completions. This cannot be undone.
            </div>

            <div className="flex gap-2 pt-2">
              <button
                type="button"
                onClick={() => setDeleteTarget(null)}
                disabled={deleting}
                className="flex-1 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-lg text-xs font-bold transition"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleDelete}
                disabled={deleting}
                className="flex-1 py-2 bg-red-600 hover:bg-red-500 text-white font-bold rounded-lg text-xs shadow-lg shadow-red-600/20 disabled:opacity-50 transition"
              >
                {deleting ? "Deleting..." : "Permanently Delete"}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
