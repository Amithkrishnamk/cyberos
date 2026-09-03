"use client";

import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import {
  BookOpen,
  Calendar,
  Plus,
  Edit3,
  Trash2,
  ExternalLink,
  AlertCircle,
  X,
  Save,
  Search,
  Shield,
  Loader2,
  Clock,
  Sparkles,
} from "lucide-react";
import { NoteCategory } from "@/types";

const CATEGORY_TABS: Array<string> = [
  "All Categories",
  "Web Security",
  "Linux",
  "Active Directory",
  "SOC",
  "Networking",
  "Pentesting",
  "General",
];

export default function ClassContentPage() {
  const { data: session } = useSession();
  const userRole = (session?.user as any)?.role || "STUDENT";
  const isAdmin = userRole === "ADMIN";

  const [classContents, setClassContents] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("All Categories");
  const [searchQuery, setSearchQuery] = useState("");

  // Modals
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [editingItem, setEditingItem] = useState<any>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  // Form State
  const [title, setTitle] = useState("");
  const [category, setCategory] = useState<NoteCategory>("Web Security");
  const [description, setDescription] = useState("");
  const [labUrl, setLabUrl] = useState("");
  const [keyNotice, setKeyNotice] = useState("");
  const [classDate, setClassDate] = useState(new Date().toISOString().split("T")[0]);
  const [submitting, setSubmitting] = useState(false);
  const [formError, setFormError] = useState("");

  async function loadClassContents() {
    setLoading(true);
    try {
      const res = await fetch("/api/class-content");
      const data = await res.json();
      setClassContents(data.classContents || []);
    } catch (err) {
      console.error("Failed to load class content history:", err);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadClassContents();
  }, []);

  const openCreateModal = () => {
    setTitle("");
    setCategory("Web Security");
    setDescription("");
    setLabUrl("");
    setKeyNotice("");
    setClassDate(new Date().toISOString().split("T")[0]);
    setFormError("");
    setShowCreateModal(true);
  };

  const openEditModal = (item: any) => {
    setEditingItem(item);
    setTitle(item.title);
    setCategory(item.category);
    setDescription(item.description);
    setLabUrl(item.labUrl || "");
    setKeyNotice(item.keyNotice || "");
    setClassDate(new Date(item.classDate).toISOString().split("T")[0]);
    setFormError("");
  };

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError("");
    setSubmitting(true);

    try {
      const res = await fetch("/api/class-content", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title,
          category,
          description,
          labUrl,
          keyNotice,
          classDate,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        setFormError(data.error || "Failed to create class content entry.");
      } else {
        setShowCreateModal(false);
        await loadClassContents();
      }
    } catch (err) {
      setFormError("An error occurred while creating.");
    } finally {
      setSubmitting(false);
    }
  };

  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingItem) return;
    setFormError("");
    setSubmitting(true);

    try {
      const res = await fetch(`/api/class-content/${editingItem.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title,
          category,
          description,
          labUrl,
          keyNotice,
          classDate,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        setFormError(data.error || "Failed to update class content entry.");
      } else {
        setEditingItem(null);
        await loadClassContents();
      }
    } catch (err) {
      setFormError("An error occurred while updating.");
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this daily class content entry?")) return;

    setDeletingId(id);
    try {
      const res = await fetch(`/api/class-content/${id}`, {
        method: "DELETE",
      });

      if (res.ok) {
        await loadClassContents();
      } else {
        alert("Failed to delete entry.");
      }
    } catch (err) {
      console.error("Delete error:", err);
    } finally {
      setDeletingId(null);
    }
  };

  const filteredItems = classContents.filter((item) => {
    const matchesCategory = activeTab === "All Categories" || item.category === activeTab;
    const query = searchQuery.toLowerCase();
    const matchesSearch =
      item.title.toLowerCase().includes(query) ||
      item.description.toLowerCase().includes(query) ||
      item.category.toLowerCase().includes(query);
    return matchesCategory && matchesSearch;
  });

  return (
    <div className="max-w-7xl mx-auto space-y-6 font-mono">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[#1f293d] pb-6">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 bg-cyan-500/10 border border-cyan-500/30 rounded-full text-cyan-400 text-xs mb-2">
            <Calendar className="w-3.5 h-3.5" /> DAY-BY-DAY SYLLABUS & LESSON REPOSITORY
          </div>
          <h1 className="text-2xl font-bold text-white tracking-wide flex items-center gap-2">
            <BookOpen className="w-6 h-6 text-cyan-400" /> DAILY CLASS CONTENT
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            Access daily cybersecurity lecture topics, lab assignments, and instructor notices stored by date.
          </p>
        </div>

        {isAdmin && (
          <button
            onClick={openCreateModal}
            className="px-4 py-2.5 bg-cyan-600 hover:bg-cyan-500 text-white font-bold text-xs rounded-xl transition flex items-center gap-2 shadow-lg shadow-cyan-600/20 shrink-0"
          >
            <Plus className="w-4 h-4" /> PUBLISH DAILY CLASS CONTENT
          </button>
        )}
      </div>

      {/* Category Tabs & Search */}
      <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-4">
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

        <div className="relative w-full md:w-64 shrink-0">
          <Search className="w-4 h-4 text-slate-500 absolute left-3 top-2.5" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search topics & labs..."
            className="w-full bg-[#111827] border border-[#1f293d] focus:border-cyan-500 text-white text-xs rounded-lg pl-9 pr-3 py-2 focus:outline-none transition"
          />
        </div>
      </div>

      {/* Daily Class Timeline Grid */}
      {loading ? (
        <div className="text-center py-16 text-cyan-400 text-xs">LOADING CLASS CONTENT REPOSITORY...</div>
      ) : filteredItems.length === 0 ? (
        <div className="bg-[#111827] border border-[#1f293d] rounded-2xl p-12 text-center space-y-3">
          <Sparkles className="w-10 h-10 text-slate-600 mx-auto" />
          <h3 className="text-sm font-bold text-white">No Class Content Found</h3>
          <p className="text-xs text-slate-400 max-w-sm mx-auto">
            No class content entries match the selected filters.
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {filteredItems.map((item, idx) => (
            <div
              key={item.id}
              className="bg-[#111827] border border-[#1f293d] hover:border-cyan-500/40 rounded-2xl p-6 shadow-xl transition space-y-4 group relative"
            >
              {/* Header Info */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-800/80 pb-3">
                <div className="flex items-center gap-3">
                  <div className="px-3 py-1 bg-cyan-950/80 border border-cyan-800/60 rounded-xl text-cyan-300 font-bold text-xs flex items-center gap-1.5">
                    <Calendar className="w-3.5 h-3.5 text-cyan-400" />
                    {new Date(item.classDate).toLocaleDateString("en-US", {
                      weekday: "short",
                      year: "numeric",
                      month: "short",
                      day: "numeric",
                    })}
                  </div>

                  <span className="px-2.5 py-0.5 rounded-full text-[10px] bg-slate-800 text-slate-300 border border-slate-700 font-bold">
                    {item.category}
                  </span>

                  {idx === 0 && (
                    <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-950 border border-emerald-700 text-emerald-300">
                      LATEST CLASS
                    </span>
                  )}
                </div>

                {isAdmin && (
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => openEditModal(item)}
                      className="p-1.5 bg-slate-800 hover:bg-slate-700 text-cyan-400 rounded-lg transition"
                      title="Edit Class Content"
                    >
                      <Edit3 className="w-4 h-4" />
                    </button>

                    <button
                      onClick={() => handleDelete(item.id)}
                      disabled={deletingId === item.id}
                      className="p-1.5 bg-red-950/60 hover:bg-red-900/80 text-red-400 rounded-lg transition disabled:opacity-50"
                      title="Delete Class Content"
                    >
                      {deletingId === item.id ? (
                        <Loader2 className="w-4 h-4 animate-spin" />
                      ) : (
                        <Trash2 className="w-4 h-4" />
                      )}
                    </button>
                  </div>
                )}
              </div>

              {/* Title & Description */}
              <div className="space-y-2">
                <h2 className="text-base font-bold text-white group-hover:text-cyan-300 transition">
                  {item.title}
                </h2>
                <p className="text-xs text-slate-300 leading-relaxed bg-[#090d16] border border-slate-800/80 rounded-xl p-4">
                  {item.description}
                </p>
              </div>

              {/* Action Link & Instructor Notice */}
              <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 pt-1">
                {item.keyNotice ? (
                  <div className="flex items-center gap-2 text-xs text-amber-300 bg-amber-950/40 border border-amber-800/40 px-3.5 py-2 rounded-xl flex-1">
                    <AlertCircle className="w-4 h-4 text-amber-400 shrink-0" />
                    <span className="text-[11px]">{item.keyNotice}</span>
                  </div>
                ) : (
                  <div />
                )}

                {item.labUrl && (
                  <a
                    href={item.labUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="px-4 py-2 bg-cyan-600 hover:bg-cyan-500 text-white font-bold text-xs rounded-xl transition flex items-center justify-center gap-2 shadow-lg shadow-cyan-600/20 shrink-0"
                  >
                    Open Recommended Lab <ExternalLink className="w-3.5 h-3.5" />
                  </a>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* CREATE MODAL */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="w-full max-w-lg bg-[#111827] border border-cyan-500/40 rounded-2xl p-6 space-y-4 shadow-2xl font-mono text-slate-200">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <h3 className="text-sm font-bold text-white flex items-center gap-2">
                <Shield className="w-4 h-4 text-cyan-400" /> Publish Daily Class Content
              </h3>
              <button onClick={() => setShowCreateModal(false)} className="text-slate-500 hover:text-slate-300">
                <X className="w-4 h-4" />
              </button>
            </div>

            {formError && (
              <div className="p-3 bg-red-950/60 border border-red-800/60 rounded-lg text-red-400 text-xs">
                ⚠ {formError}
              </div>
            )}

            <form onSubmit={handleCreate} className="space-y-3 text-xs">
              <div>
                <label className="block text-slate-400 mb-1 font-bold">CLASS DATE</label>
                <input
                  type="date"
                  required
                  value={classDate}
                  onChange={(e) => setClassDate(e.target.value)}
                  className="w-full bg-[#090d16] border border-slate-800 focus:border-cyan-500 text-white rounded-lg p-2.5 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-slate-400 mb-1 font-bold">CLASS / TOPIC TITLE</label>
                <input
                  type="text"
                  required
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="e.g. Active Directory: Kerberoasting & SPN Discovery Labs"
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
                <label className="block text-slate-400 mb-1 font-bold">SYLLABUS / LECTURE DESCRIPTION</label>
                <textarea
                  rows={3}
                  required
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Details on today's lecture, key attack vectors, and hands-on exercises..."
                  className="w-full bg-[#090d16] border border-slate-800 focus:border-cyan-500 text-white rounded-lg p-2.5 focus:outline-none resize-y"
                />
              </div>

              <div>
                <label className="block text-slate-400 mb-1 font-bold">RECOMMENDED LAB URL</label>
                <input
                  type="url"
                  value={labUrl}
                  onChange={(e) => setLabUrl(e.target.value)}
                  placeholder="https://tryhackme.com/room/kerberos"
                  className="w-full bg-[#090d16] border border-slate-800 focus:border-cyan-500 text-white rounded-lg p-2.5 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-slate-400 mb-1 font-bold">INSTRUCTOR NOTICE / ANNOUNCEMENT</label>
                <textarea
                  rows={2}
                  value={keyNotice}
                  onChange={(e) => setKeyNotice(e.target.value)}
                  placeholder="e.g. Ensure you complete the mandatory study timer reflection after finishing the room."
                  className="w-full bg-[#090d16] border border-slate-800 focus:border-cyan-500 text-white rounded-lg p-2.5 focus:outline-none resize-y"
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
                  disabled={submitting}
                  className="flex-1 py-2.5 bg-cyan-600 hover:bg-cyan-500 text-white font-bold rounded-lg shadow-lg shadow-cyan-600/20 disabled:opacity-50 flex items-center justify-center gap-1.5"
                >
                  {submitting ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Save className="w-3.5 h-3.5" />}
                  <span>Publish Entry</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* EDIT MODAL */}
      {editingItem && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="w-full max-w-lg bg-[#111827] border border-cyan-500/40 rounded-2xl p-6 space-y-4 shadow-2xl font-mono text-slate-200">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <h3 className="text-sm font-bold text-white flex items-center gap-2">
                <Shield className="w-4 h-4 text-cyan-400" /> Edit Class Content Entry
              </h3>
              <button onClick={() => setEditingItem(null)} className="text-slate-500 hover:text-slate-300">
                <X className="w-4 h-4" />
              </button>
            </div>

            {formError && (
              <div className="p-3 bg-red-950/60 border border-red-800/60 rounded-lg text-red-400 text-xs">
                ⚠ {formError}
              </div>
            )}

            <form onSubmit={handleUpdate} className="space-y-3 text-xs">
              <div>
                <label className="block text-slate-400 mb-1 font-bold">CLASS DATE</label>
                <input
                  type="date"
                  required
                  value={classDate}
                  onChange={(e) => setClassDate(e.target.value)}
                  className="w-full bg-[#090d16] border border-slate-800 focus:border-cyan-500 text-white rounded-lg p-2.5 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-slate-400 mb-1 font-bold">CLASS / TOPIC TITLE</label>
                <input
                  type="text"
                  required
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
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
                <label className="block text-slate-400 mb-1 font-bold">SYLLABUS / LECTURE DESCRIPTION</label>
                <textarea
                  rows={3}
                  required
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className="w-full bg-[#090d16] border border-slate-800 focus:border-cyan-500 text-white rounded-lg p-2.5 focus:outline-none resize-y"
                />
              </div>

              <div>
                <label className="block text-slate-400 mb-1 font-bold">RECOMMENDED LAB URL</label>
                <input
                  type="url"
                  value={labUrl}
                  onChange={(e) => setLabUrl(e.target.value)}
                  className="w-full bg-[#090d16] border border-slate-800 focus:border-cyan-500 text-white rounded-lg p-2.5 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-slate-400 mb-1 font-bold">INSTRUCTOR NOTICE / ANNOUNCEMENT</label>
                <textarea
                  rows={2}
                  value={keyNotice}
                  onChange={(e) => setKeyNotice(e.target.value)}
                  className="w-full bg-[#090d16] border border-slate-800 focus:border-cyan-500 text-white rounded-lg p-2.5 focus:outline-none resize-y"
                />
              </div>

              <div className="flex gap-2 pt-3">
                <button
                  type="button"
                  onClick={() => setEditingItem(null)}
                  className="flex-1 py-2.5 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-lg font-bold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="flex-1 py-2.5 bg-cyan-600 hover:bg-cyan-500 text-white font-bold rounded-lg shadow-lg shadow-cyan-600/20 disabled:opacity-50 flex items-center justify-center gap-1.5"
                >
                  {submitting ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Save className="w-3.5 h-3.5" />}
                  <span>Save Changes</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
