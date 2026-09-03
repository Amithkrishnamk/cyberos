"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import {
  Plus,
  Search,
  BookOpen,
  Download,
  Edit3,
  Trash2,
  ExternalLink,
  Shield,
  Sparkles,
  Loader2,
  X,
  FileText,
  Clock,
} from "lucide-react";
import { NoteCategory } from "@/types";

const CATEGORY_TABS: Array<string> = [
  "All Pages",
  "Web Security",
  "Linux",
  "Active Directory",
  "SOC",
  "Networking",
  "Pentesting",
  "General",
];

export default function NotesDatabasePage() {
  const router = useRouter();
  const { data: session } = useSession();
  const userRole = (session?.user as any)?.role || "STUDENT";
  const isAdmin = userRole === "ADMIN";

  const [notes, setNotes] = useState<any[]>([]);
  const [activeTab, setActiveTab] = useState<string>("All Pages");
  const [searchQuery, setSearchQuery] = useState("");
  const [loading, setLoading] = useState(true);

  // Admin Publish Modal state
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [title, setTitle] = useState("");
  const [category, setCategory] = useState<NoteCategory>("Web Security");
  const [description, setDescription] = useState("");
  const [content, setContent] = useState("");
  const [icon, setIcon] = useState("📄");
  const [publishing, setPublishing] = useState(false);
  const [publishError, setPublishError] = useState("");
  const [deletingId, setDeletingId] = useState<string | null>(null);

  async function loadNotes() {
    setLoading(true);
    try {
      const url = activeTab === "All Pages" ? "/api/notes" : `/api/notes?category=${encodeURIComponent(activeTab)}`;
      const res = await fetch(url);
      const data = await res.json();
      setNotes(data.notes || []);
    } catch (err) {
      console.error("Error loading notes:", err);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadNotes();
  }, [activeTab]);

  const handleOpenCreateModal = () => {
    setTitle("");
    setCategory(activeTab === "All Pages" ? "Web Security" : (activeTab as NoteCategory));
    setDescription("");
    setContent("");
    setIcon("📄");
    setPublishError("");
    setShowCreateModal(true);
  };

  const handlePublishNote = async (e: React.FormEvent) => {
    e.preventDefault();
    setPublishError("");
    setPublishing(true);

    try {
      // Build default blocks format for editor compatible PDF renderer
      const blocks = [
        { type: "paragraph", content: description },
        { type: "code", content: content },
      ];

      const res = await fetch("/api/notes", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title,
          category,
          description,
          content: JSON.stringify(blocks),
          icon,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        setPublishError(data.error || "Failed to publish study note.");
      } else {
        setShowCreateModal(false);
        await loadNotes();
      }
    } catch (err) {
      setPublishError("An error occurred while publishing.");
    } finally {
      setPublishing(false);
    }
  };

  const handleDeleteNote = async (noteId: string) => {
    if (!confirm("Are you sure you want to delete this study note?")) return;

    setDeletingId(noteId);
    try {
      const res = await fetch(`/api/notes/${noteId}`, {
        method: "DELETE",
      });

      if (res.ok) {
        await loadNotes();
      } else {
        alert("Failed to delete study note.");
      }
    } catch (err) {
      console.error("Delete note error:", err);
    } finally {
      setDeletingId(null);
    }
  };

  const filteredNotes = notes.filter((note) => {
    const query = searchQuery.toLowerCase();
    return (
      note.title.toLowerCase().includes(query) ||
      note.category.toLowerCase().includes(query) ||
      note.description?.toLowerCase().includes(query)
    );
  });

  return (
    <div className="max-w-7xl mx-auto space-y-6 font-mono">
      {/* Admin Notice */}
      {isAdmin && (
        <div className="bg-red-950/40 border border-red-800/60 rounded-xl p-3.5 flex items-center justify-between text-xs text-red-300">
          <div className="flex items-center gap-2">
            <Shield className="w-4 h-4 text-red-400 shrink-0" />
            <span>
              <strong>ADMIN PUBLISHING ACTIVE:</strong> Upload or write study notes & documents. Students can view and download them as PDF files.
            </span>
          </div>
          <span className="px-2 py-0.5 bg-red-900/60 border border-red-700 text-red-200 rounded text-[10px] font-bold">
            ADMIN CONTROL
          </span>
        </div>
      )}

      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[#1f293d] pb-6">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 bg-cyan-500/10 border border-cyan-500/30 rounded-full text-cyan-400 text-xs mb-2">
            <FileText className="w-3.5 h-3.5" /> CYBERSECURITY REPOSITORY & PDF DOWNLOAD HUB
          </div>
          <h1 className="text-2xl font-bold text-white tracking-wide flex items-center gap-2">
            <BookOpen className="w-6 h-6 text-cyan-400" /> STUDY NOTES & DOCS
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            Access instructor-published cybersecurity lecture notes, cheat sheets, and download them as PDF files.
          </p>
        </div>

        {isAdmin && (
          <button
            onClick={handleOpenCreateModal}
            className="px-4 py-2.5 bg-cyan-600 hover:bg-cyan-500 text-white font-bold text-xs rounded-xl transition flex items-center gap-2 shadow-lg shadow-cyan-600/20 shrink-0"
          >
            <Plus className="w-4 h-4" /> PUBLISH STUDY NOTE
          </button>
        )}
      </div>

      {/* Category Tabs & Search */}
      <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-4">
        {/* Category Tabs */}
        <div className="flex items-center gap-1 overflow-x-auto pb-2 md:pb-0 scrollbar-none">
          {CATEGORY_TABS.map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold whitespace-nowrap transition ${
                activeTab === tab
                  ? "bg-cyan-500/10 border border-cyan-500/40 text-cyan-400"
                  : "text-slate-400 hover:text-white hover:bg-slate-800/60"
              }`}
            >
              {tab}
            </button>
          ))}
        </div>

        {/* Search Input */}
        <div className="relative w-full md:w-64 shrink-0">
          <Search className="w-4 h-4 text-slate-500 absolute left-3 top-2.5" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search notes & topics..."
            className="w-full bg-[#111827] border border-[#1f293d] focus:border-cyan-500 text-white text-xs rounded-lg pl-9 pr-3 py-2 focus:outline-none transition"
          />
        </div>
      </div>

      {/* Notes Grid */}
      {loading ? (
        <div className="text-center py-16 text-cyan-400 text-xs">LOADING STUDY NOTES...</div>
      ) : filteredNotes.length === 0 ? (
        <div className="bg-[#111827] border border-[#1f293d] rounded-2xl p-12 text-center space-y-3">
          <Sparkles className="w-10 h-10 text-slate-600 mx-auto" />
          <h3 className="text-sm font-bold text-white">No Notes Found</h3>
          <p className="text-xs text-slate-400 max-w-sm mx-auto">
            No published study notes match your search under this category tab.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {filteredNotes.map((note) => (
            <div
              key={note.id}
              className="bg-[#111827] border border-[#1f293d] hover:border-cyan-500/40 rounded-2xl p-6 shadow-xl transition flex flex-col justify-between group relative"
            >
              <div>
                {/* Header & Category Badge */}
                <div className="flex items-center justify-between mb-3 border-b border-slate-800/80 pb-3">
                  <div className="flex items-center gap-2">
                    <span className="text-2xl">{note.icon || "📄"}</span>
                    <span className="px-2.5 py-0.5 rounded-full text-[10px] bg-cyan-950/80 border border-cyan-800/50 text-cyan-300 font-bold">
                      {note.category}
                    </span>
                  </div>

                  {isAdmin && (
                    <div className="flex items-center gap-1.5">
                      <button
                        onClick={() => router.push(`/notes/${note.id}`)}
                        className="p-1.5 bg-slate-800 hover:bg-slate-700 text-cyan-400 rounded-lg transition"
                        title="Edit Note"
                      >
                        <Edit3 className="w-3.5 h-3.5" />
                      </button>

                      <button
                        onClick={() => handleDeleteNote(note.id)}
                        disabled={deletingId === note.id}
                        className="p-1.5 bg-red-950/60 hover:bg-red-900/80 text-red-400 rounded-lg transition disabled:opacity-50"
                        title="Delete Note"
                      >
                        {deletingId === note.id ? (
                          <Loader2 className="w-3.5 h-3.5 animate-spin" />
                        ) : (
                          <Trash2 className="w-3.5 h-3.5" />
                        )}
                      </button>
                    </div>
                  )}
                </div>

                {/* Title & Description */}
                <h2 className="text-base font-bold text-white group-hover:text-cyan-300 transition mb-2 line-clamp-1">
                  {note.title}
                </h2>

                <p className="text-xs text-slate-300 line-clamp-3 mb-4 leading-relaxed bg-[#090d16] border border-slate-800/80 rounded-xl p-3">
                  {note.description || "Instructor published study document."}
                </p>
              </div>

              {/* Action Buttons: Download PDF & View Note */}
              <div className="pt-3 border-t border-slate-800/80 flex items-center justify-between gap-2">
                <a
                  href={`/api/notes/${note.id}/export-pdf`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex-1 px-3 py-2 bg-cyan-600 hover:bg-cyan-500 text-white font-bold text-xs rounded-xl transition flex items-center justify-center gap-1.5 shadow-lg shadow-cyan-600/20"
                >
                  <Download className="w-3.5 h-3.5" /> DOWNLOAD PDF
                </a>

                <Link
                  href={`/notes/${note.id}`}
                  className="px-3 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold text-xs rounded-xl border border-slate-700 transition flex items-center gap-1"
                >
                  View <ExternalLink className="w-3.5 h-3.5" />
                </Link>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* ADMIN PUBLISH NOTE MODAL */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="w-full max-w-lg bg-[#111827] border border-cyan-500/40 rounded-2xl p-6 space-y-4 shadow-2xl font-mono text-slate-200">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <h3 className="text-sm font-bold text-white flex items-center gap-2">
                <Shield className="w-4 h-4 text-cyan-400" /> Publish Study Note / Document
              </h3>
              <button onClick={() => setShowCreateModal(false)} className="text-slate-500 hover:text-slate-300">
                <X className="w-4 h-4" />
              </button>
            </div>

            {publishError && (
              <div className="p-3 bg-red-950/60 border border-red-800/60 rounded-lg text-red-400 text-xs">
                ⚠ {publishError}
              </div>
            )}

            <form onSubmit={handlePublishNote} className="space-y-3 text-xs">
              <div className="grid grid-cols-4 gap-3">
                <div className="col-span-3">
                  <label className="block text-slate-400 mb-1 font-bold">NOTE TITLE</label>
                  <input
                    type="text"
                    required
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    placeholder="e.g. Active Directory Kerberoasting Guide"
                    className="w-full bg-[#090d16] border border-slate-800 focus:border-cyan-500 text-white rounded-lg p-2.5 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-slate-400 mb-1 font-bold">ICON</label>
                  <input
                    type="text"
                    value={icon}
                    onChange={(e) => setIcon(e.target.value)}
                    placeholder="📄"
                    className="w-full bg-[#090d16] border border-slate-800 focus:border-cyan-500 text-white rounded-lg p-2.5 text-center focus:outline-none"
                  />
                </div>
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
                <label className="block text-slate-400 mb-1 font-bold">SUMMARY / DESCRIPTION</label>
                <textarea
                  rows={2}
                  required
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Overview of this study document for students..."
                  className="w-full bg-[#090d16] border border-slate-800 focus:border-cyan-500 text-white rounded-lg p-2.5 focus:outline-none resize-y"
                />
              </div>

              <div>
                <label className="block text-slate-400 mb-1 font-bold">NOTE LECTURE CONTENT & COMMANDS</label>
                <textarea
                  rows={5}
                  required
                  value={content}
                  onChange={(e) => setContent(e.target.value)}
                  placeholder="Detailed notes, commands, payload examples, or cheat sheet details..."
                  className="w-full bg-[#090d16] border border-slate-800 focus:border-cyan-500 text-white rounded-lg p-2.5 focus:outline-none resize-y font-mono"
                />
              </div>

              <div className="flex gap-2 pt-3">
                <button
                  type="button"
                  onClick={() => setShowCreateModal(false)}
                  className="flex-1 py-2.5 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-lg font-bold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={publishing}
                  className="flex-1 py-2.5 bg-cyan-600 hover:bg-cyan-500 text-white font-bold rounded-lg shadow-lg shadow-cyan-600/20 disabled:opacity-50 flex items-center justify-center gap-1.5"
                >
                  {publishing ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <BookOpen className="w-3.5 h-3.5" />}
                  <span>Publish Note</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
