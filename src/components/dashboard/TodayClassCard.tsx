"use client";

import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import Link from "next/link";
import {
  BookOpen,
  Edit3,
  ExternalLink,
  AlertCircle,
  X,
  Save,
  Clock,
  Shield,
  Loader2,
  Calendar,
  ArrowRight,
} from "lucide-react";
import { NoteCategory } from "@/types";

export default function TodayClassCard() {
  const { data: session } = useSession();
  const userRole = (session?.user as any)?.role || "STUDENT";
  const isAdmin = userRole === "ADMIN";

  const [classContent, setClassContent] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [showEditModal, setShowEditModal] = useState(false);

  // Edit form state
  const [title, setTitle] = useState("");
  const [category, setCategory] = useState<NoteCategory>("Web Security");
  const [description, setDescription] = useState("");
  const [labUrl, setLabUrl] = useState("");
  const [keyNotice, setKeyNotice] = useState("");
  const [saving, setSaving] = useState(false);
  const [formError, setFormError] = useState("");

  async function fetchClassContent() {
    try {
      const res = await fetch("/api/class-content");
      const data = await res.json();
      const latest = data.latestClass || (data.classContents && data.classContents[0]) || null;
      if (latest) {
        setClassContent(latest);
        setTitle(latest.title);
        setCategory(latest.category);
        setDescription(latest.description);
        setLabUrl(latest.labUrl || "");
        setKeyNotice(latest.keyNotice || "");
      }
    } catch (err) {
      console.error("Failed to load class content:", err);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    fetchClassContent();
  }, []);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!classContent?.id) return;
    setFormError("");
    setSaving(true);

    try {
      const res = await fetch(`/api/class-content/${classContent.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title,
          category,
          description,
          labUrl,
          keyNotice,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        setFormError(data.error || "Failed to update class content.");
      } else {
        setClassContent(data.classContent);
        setShowEditModal(false);
      }
    } catch (err) {
      setFormError("An unexpected error occurred.");
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="bg-[#111827] border border-[#1f293d] rounded-2xl p-6 text-center text-cyan-400 text-xs font-mono">
        LOADING TODAY'S CLASS CONTENT...
      </div>
    );
  }

  if (!classContent) return null;

  return (
    <div className="bg-[#111827] border border-cyan-500/30 rounded-2xl p-6 shadow-xl font-mono relative space-y-4 overflow-hidden">
      {/* Glow highlight */}
      <div className="absolute top-0 right-0 w-64 h-64 bg-cyan-500/5 rounded-full blur-3xl pointer-events-none" />

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-800 pb-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-cyan-500/10 border border-cyan-500/30 flex items-center justify-center text-cyan-400 shrink-0">
            <BookOpen className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-cyan-950/80 border border-cyan-800/60 text-cyan-300">
                {classContent.category}
              </span>
              <span className="text-[10px] text-slate-400 flex items-center gap-1">
                <Calendar className="w-3 h-3 text-slate-500" /> Class Date: {new Date(classContent.classDate).toLocaleDateString()}
              </span>
            </div>
            <h2 className="text-lg font-bold text-white tracking-wide mt-1">
              TODAY'S CLASS CONTENT & SYLLABUS
            </h2>
          </div>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          <Link
            href="/class-content"
            className="px-3 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold text-xs rounded-xl border border-slate-700 transition flex items-center gap-1"
          >
            <span>View All Class Timeline</span> <ArrowRight className="w-3.5 h-3.5" />
          </Link>

          {isAdmin && (
            <button
              onClick={() => setShowEditModal(true)}
              className="px-3 py-2 bg-cyan-950 hover:bg-cyan-900 text-cyan-300 font-bold text-xs rounded-xl border border-cyan-800/50 transition flex items-center gap-1.5"
            >
              <Edit3 className="w-3.5 h-3.5" /> EDIT TODAY'S CLASS
            </button>
          )}
        </div>
      </div>

      {/* Topic Title & Syllabus Description */}
      <div className="space-y-2">
        <h3 className="text-base font-bold text-cyan-300">{classContent.title}</h3>
        <p className="text-xs text-slate-300 leading-relaxed bg-[#090d16] border border-slate-800 rounded-xl p-4">
          {classContent.description}
        </p>
      </div>

      {/* Action Row & Instructor Notice */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4 pt-2">
        {classContent.keyNotice && (
          <div className="flex items-center gap-2 text-xs text-amber-300 bg-amber-950/40 border border-amber-800/40 px-3.5 py-2 rounded-xl flex-1">
            <AlertCircle className="w-4 h-4 text-amber-400 shrink-0" />
            <span className="text-[11px]">{classContent.keyNotice}</span>
          </div>
        )}

        {classContent.labUrl && (
          <a
            href={classContent.labUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="px-4 py-2.5 bg-cyan-600 hover:bg-cyan-500 text-white font-bold text-xs rounded-xl transition flex items-center justify-center gap-2 shadow-lg shadow-cyan-600/20 shrink-0"
          >
            Practice Today's Lab <ExternalLink className="w-3.5 h-3.5" />
          </a>
        )}
      </div>

      {/* Admin Edit Modal */}
      {showEditModal && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="w-full max-w-lg bg-[#111827] border border-cyan-500/40 rounded-2xl p-6 space-y-4 shadow-2xl font-mono text-slate-200">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <h3 className="text-sm font-bold text-white flex items-center gap-2">
                <Shield className="w-4 h-4 text-cyan-400" /> Update Today's Class Content
              </h3>
              <button
                onClick={() => setShowEditModal(false)}
                className="text-slate-500 hover:text-slate-300"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {formError && (
              <div className="p-3 bg-red-950/60 border border-red-800/60 rounded-lg text-red-400 text-xs">
                ⚠ {formError}
              </div>
            )}

            <form onSubmit={handleSave} className="space-y-3 text-xs">
              <div>
                <label className="block text-slate-400 mb-1 font-bold">CLASS / TOPIC TITLE</label>
                <input
                  type="text"
                  required
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="e.g. Web Security: Advanced SQL Injection & Union Exploitation"
                  className="w-full bg-[#090d16] border border-slate-800 focus:border-cyan-500 text-white rounded-lg p-2.5 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-slate-400 mb-1 font-bold">CATEGORY</label>
                <select
                  value={category}
                  onChange={(e) => setCategory(e.target.value as NoteCategory)}
                  className="w-full bg-[#090d16] border border-slate-800 focus:border-cyan-500 text-white rounded-lg p-2.5 focus:outline-none"
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

              <div>
                <label className="block text-slate-400 mb-1 font-bold">SYLLABUS / CONTENT DESCRIPTION</label>
                <textarea
                  rows={3}
                  required
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Details on today's lecture, key concepts, and focus topics..."
                  className="w-full bg-[#090d16] border border-slate-800 focus:border-cyan-500 text-white rounded-lg p-2.5 focus:outline-none resize-y"
                />
              </div>

              <div>
                <label className="block text-slate-400 mb-1 font-bold">RECOMMENDED LAB URL</label>
                <input
                  type="url"
                  value={labUrl}
                  onChange={(e) => setLabUrl(e.target.value)}
                  placeholder="https://portswigger.net/web-security/sql-injection"
                  className="w-full bg-[#090d16] border border-slate-800 focus:border-cyan-500 text-white rounded-lg p-2.5 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-slate-400 mb-1 font-bold">INSTRUCTOR NOTICE / ANNOUNCEMENT</label>
                <textarea
                  rows={2}
                  value={keyNotice}
                  onChange={(e) => setKeyNotice(e.target.value)}
                  placeholder="e.g. Mandatory timer log & reflection required after completing today's lab."
                  className="w-full bg-[#090d16] border border-slate-800 focus:border-cyan-500 text-white rounded-lg p-2.5 focus:outline-none resize-y"
                />
              </div>

              <div className="flex gap-2 pt-3">
                <button
                  type="button"
                  onClick={() => setShowEditModal(false)}
                  className="flex-1 py-2.5 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-lg font-bold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={saving}
                  className="flex-1 py-2.5 bg-cyan-600 hover:bg-cyan-500 text-white font-bold rounded-lg shadow-lg shadow-cyan-600/20 disabled:opacity-50 flex items-center justify-center gap-1.5"
                >
                  {saving ? (
                    <>
                      <Loader2 className="w-3.5 h-3.5 animate-spin" /> Saving...
                    </>
                  ) : (
                    <>
                      <Save className="w-3.5 h-3.5" /> Save Changes
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
