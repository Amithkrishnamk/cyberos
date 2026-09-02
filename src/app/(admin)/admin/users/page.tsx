"use client";

import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import Link from "next/link";
import {
  Users,
  UserPlus,
  Trash2,
  Shield,
  ArrowLeft,
  AlertTriangle,
  X,
  Lock,
} from "lucide-react";

export const dynamic = "force-dynamic";

export default function AdminUserManagementPage() {
  const sessionResponse = useSession();
  const session = sessionResponse?.data;
  const currentUserId = (session?.user as any)?.id;

  const [users, setUsers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAddModal, setShowAddModal] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState<any | null>(null);

  // Form states
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState<"STUDENT" | "ADMIN">("STUDENT");
  const [formError, setFormError] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [deleting, setDeleting] = useState(false);

  async function fetchUsers() {
    try {
      const res = await fetch("/api/admin/users");
      const data = await res.json();
      setUsers(data.users || []);
    } catch (err) {
      console.error("Error loading users:", err);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    fetchUsers();
  }, []);

  const handleCreateUser = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError("");

    if (password.length < 6) {
      setFormError("Password must be at least 6 characters long.");
      return;
    }

    setSubmitting(true);

    try {
      const res = await fetch("/api/admin/users", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, email, password, role }),
      });

      const data = await res.json();

      if (!res.ok) {
        setFormError(data.error || "Failed to create user account.");
        setSubmitting(false);
        return;
      }

      setName("");
      setEmail("");
      setPassword("");
      setRole("STUDENT");
      setShowAddModal(false);
      await fetchUsers();
    } catch (err) {
      setFormError("An unexpected error occurred.");
    } finally {
      setSubmitting(false);
    }
  };

  const handleDeleteUser = async () => {
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
        alert(data.error || "Failed to delete user.");
      } else {
        await fetchUsers();
      }
    } catch (err) {
      console.error("Error deleting user:", err);
    } finally {
      setDeleting(false);
      setDeleteTarget(null);
    }
  };

  return (
    <div className="max-w-7xl mx-auto space-y-6 font-mono">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[#1f293d] pb-6">
        <div>
          <Link
            href="/admin"
            className="inline-flex items-center gap-1.5 text-xs text-slate-400 hover:text-cyan-400 mb-2 transition"
          >
            <ArrowLeft className="w-3.5 h-3.5" /> Back to Admin Overview
          </Link>
          <h1 className="text-2xl font-bold text-white flex items-center gap-2">
            <Users className="w-6 h-6 text-cyan-400" /> USER ACCOUNT MANAGEMENT
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            Provision student/admin accounts, view access rights, and manage organization membership.
          </p>
        </div>

        <button
          onClick={() => setShowAddModal(true)}
          className="px-4 py-2.5 bg-cyan-600 hover:bg-cyan-500 text-white font-bold text-xs rounded-lg transition flex items-center gap-2 shadow-lg shadow-cyan-600/20"
        >
          <UserPlus className="w-4 h-4" /> ADD NEW USER
        </button>
      </div>

      {/* Users Roster Table */}
      <div className="bg-[#111827] border border-[#1f293d] rounded-2xl p-6 shadow-xl space-y-4">
        <div className="flex items-center justify-between border-b border-slate-800 pb-3">
          <h2 className="text-sm font-bold text-white flex items-center gap-2">
            <Shield className="w-4 h-4 text-cyan-400" /> REGISTERED ACCOUNTS ({users.length})
          </h2>
        </div>

        {loading ? (
          <div className="text-center py-12 text-cyan-400 text-xs">LOADING USER DIRECTORY...</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-slate-800 text-slate-400 font-mono text-[10px] uppercase">
                  <th className="pb-3 font-semibold">User</th>
                  <th className="pb-3 font-semibold">Email</th>
                  <th className="pb-3 font-semibold">Role</th>
                  <th className="pb-3 font-semibold">Joined</th>
                  <th className="pb-3 font-semibold">Activity Stats</th>
                  <th className="pb-3 font-semibold text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60 font-mono">
                {users.map((userItem) => {
                  const isCurrent = userItem.id === currentUserId;
                  return (
                    <tr key={userItem.id} className="hover:bg-[#162238]/50 transition">
                      <td className="py-3 font-bold text-white flex items-center gap-2">
                        <div className="w-7 h-7 rounded-full bg-slate-800 border border-slate-700 flex items-center justify-center text-slate-300 text-[10px]">
                          {userItem.name.substring(0, 2).toUpperCase()}
                        </div>
                        <div>
                          <div>{userItem.name}</div>
                          {isCurrent && (
                            <span className="text-[9px] text-cyan-400 font-normal">[Active Admin Session]</span>
                          )}
                        </div>
                      </td>
                      <td className="py-3 text-slate-400">{userItem.email}</td>
                      <td className="py-3">
                        <span
                          className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                            userItem.role === "ADMIN"
                              ? "bg-red-950/80 border border-red-800 text-red-300"
                              : "bg-cyan-950/80 border border-cyan-800 text-cyan-300"
                          }`}
                        >
                          {userItem.role}
                        </span>
                      </td>
                      <td className="py-3 text-slate-400">
                        {new Date(userItem.createdAt).toLocaleDateString()}
                      </td>
                      <td className="py-3 text-slate-300">
                        <div className="flex items-center gap-2 text-[11px]">
                          <span className="text-emerald-400">{userItem.stats?.studyHours || 0}h</span> •{" "}
                          <span className="text-violet-400">{userItem.stats?.notesCount || 0} notes</span> •{" "}
                          <span className="text-amber-400">{userItem.stats?.labsCount || 0} labs</span>
                        </div>
                      </td>
                      <td className="py-3 text-right">
                        {isCurrent ? (
                          <span className="inline-flex items-center gap-1 text-[10px] text-slate-500 bg-slate-900 border border-slate-800 px-2 py-1 rounded cursor-not-allowed">
                            <Lock className="w-3 h-3 text-slate-500" /> Current Session
                          </span>
                        ) : (
                          <button
                            onClick={() => setDeleteTarget(userItem)}
                            className="inline-flex items-center gap-1 text-slate-400 hover:text-red-400 p-1.5 hover:bg-red-950/30 rounded transition"
                            title="Delete User Account"
                          >
                            <Trash2 className="w-4 h-4" /> Delete
                          </button>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Add User Modal */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="w-full max-w-md bg-[#111827] border border-[#1f293d] rounded-2xl p-6 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <h3 className="text-sm font-bold text-white flex items-center gap-2">
                <UserPlus className="w-4 h-4 text-cyan-400" /> Provision New User Account
              </h3>
              <button onClick={() => setShowAddModal(false)} className="text-slate-500 hover:text-slate-300">
                <X className="w-4 h-4" />
              </button>
            </div>

            {formError && (
              <div className="p-3 bg-red-950/60 border border-red-800/60 rounded-lg text-red-400 text-xs">
                ⚠ {formError}
              </div>
            )}

            <form onSubmit={handleCreateUser} className="space-y-3 text-xs">
              <div>
                <label className="block text-slate-400 mb-1 font-bold">FULL NAME</label>
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="e.g. Jordan Smith"
                  className="w-full bg-[#090d16] border border-slate-800 focus:border-cyan-500 text-white rounded-lg p-2.5 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-slate-400 mb-1 font-bold">EMAIL ADDRESS</label>
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="e.g. jsmith@organization.dev"
                  className="w-full bg-[#090d16] border border-slate-800 focus:border-cyan-500 text-white rounded-lg p-2.5 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-slate-400 mb-1 font-bold">INITIAL PASSWORD (MIN 6 CHARS)</label>
                <input
                  type="password"
                  required
                  minLength={6}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••••••"
                  className="w-full bg-[#090d16] border border-slate-800 focus:border-cyan-500 text-white rounded-lg p-2.5 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-slate-400 mb-1 font-bold">ASSIGNED ROLE</label>
                <select
                  value={role}
                  onChange={(e) => setRole(e.target.value as any)}
                  className="w-full bg-[#090d16] border border-slate-800 focus:border-cyan-500 text-white rounded-lg p-2.5 focus:outline-none"
                >
                  <option value="STUDENT">STUDENT (Standard Learner)</option>
                  <option value="ADMIN">ADMIN (Instructor Privileges)</option>
                </select>
              </div>

              <div className="flex gap-2 pt-3">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="flex-1 py-2.5 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-lg font-bold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="flex-1 py-2.5 bg-cyan-600 hover:bg-cyan-500 text-white font-bold rounded-lg shadow-lg shadow-cyan-600/20 disabled:opacity-50"
                >
                  {submitting ? "Creating..." : "Create Account"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete User Confirmation Modal */}
      {deleteTarget && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="w-full max-w-md bg-[#111827] border border-red-800/60 rounded-2xl p-6 space-y-4">
            <div className="flex items-center gap-2 text-red-400 font-bold">
              <AlertTriangle className="w-5 h-5" /> Confirm Account Deletion
            </div>

            <p className="text-xs text-slate-300">
              Are you sure you want to permanently delete user account <strong className="text-white">{deleteTarget.email}</strong>?
            </p>

            <div className="p-3 bg-red-950/40 border border-red-900/60 rounded-lg text-[11px] text-red-300">
              ⚠ This action will permanently remove all of this user's notes, study sessions, and lab completions. This cannot be undone.
            </div>

            <div className="flex gap-2 pt-2">
              <button
                type="button"
                onClick={() => setDeleteTarget(null)}
                disabled={deleting}
                className="flex-1 py-2.5 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-lg text-xs font-bold"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleDeleteUser}
                disabled={deleting}
                className="flex-1 py-2.5 bg-red-600 hover:bg-red-500 text-white font-bold rounded-lg text-xs shadow-lg shadow-red-600/20 disabled:opacity-50"
              >
                {deleting ? "Deleting..." : "Permanently Delete"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
