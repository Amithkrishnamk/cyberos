"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import {
  Plus,
  Search,
  BookOpen,
  Clock,
  Award,
  Sparkles,
  ArrowUpRight,
  Lock,
  Rocket,
  Shield,
  Bot,
  Layers,
  Zap,
  Bell,
  CheckCircle2,
} from "lucide-react";

const CATEGORY_TABS: Array<string> = [
  "All Pages",
  "Web Security",
  "Linux",
  "Active Directory",
  "SOC",
  "Networking",
  "Pentesting",
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
  const [creating, setCreating] = useState(false);
  const [subscribed, setSubscribed] = useState(false);

  useEffect(() => {
    if (!isAdmin) {
      setLoading(false);
      return;
    }

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

    loadNotes();
  }, [activeTab, isAdmin]);

  const handleCreateNote = async () => {
    if (!isAdmin) return;
    setCreating(true);
    try {
      const res = await fetch("/api/notes", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: "Untitled Cybersecurity Note",
          category: activeTab === "All Pages" ? "Web Security" : activeTab,
        }),
      });

      const data = await res.json();
      if (data.note?.id) {
        router.push(`/notes/${data.note.id}`);
      }
    } catch (err) {
      console.error("Failed to create note:", err);
      setCreating(false);
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

  // NON-ADMIN VIEW: Coming Soon Banner & Feature Preview
  if (!isAdmin) {
    return (
      <div className="max-w-5xl mx-auto space-y-8 font-mono py-4">
        {/* Header Banner */}
        <div className="bg-gradient-to-br from-[#0f172a] via-[#111827] to-[#1e112a] border border-cyan-500/40 rounded-3xl p-8 sm:p-12 shadow-2xl relative overflow-hidden">
          <div className="absolute top-0 right-0 p-12 opacity-10 pointer-events-none">
            <Rocket className="w-64 h-64 text-cyan-400" />
          </div>

          <div className="max-w-2xl space-y-4 relative z-10">
            <div className="inline-flex items-center gap-2 px-3 py-1 bg-amber-500/10 border border-amber-500/30 rounded-full text-amber-400 text-xs font-bold">
              <Lock className="w-3.5 h-3.5" /> RESTRICTED MODULE • INSTRUCTOR & ADMIN ONLY
            </div>

            <h1 className="text-3xl sm:text-4xl font-bold text-white tracking-tight flex items-center gap-3">
              <BookOpen className="w-9 h-9 text-cyan-400" /> NOTION NOTE EDITOR
            </h1>

            <div className="p-4 bg-cyan-950/40 border border-cyan-500/30 rounded-2xl text-cyan-300 text-xs leading-relaxed">
              ⚡ <strong>COMING SOON FOR STUDENT ACCOUNTS:</strong> The block-based Notion Note Editor is currently restricted to <strong>Administrator</strong> accounts during active deployment testing. Full student editing access launches in <strong>Q4 2026</strong>.
            </div>

            <p className="text-xs text-slate-300 leading-relaxed pt-2">
              Our engineering team is building block-level markdown formatting, CVE vulnerability record cards, dynamic command execution snippets, and AI-powered study assistance.
            </p>

            <div className="pt-4 flex flex-wrap items-center gap-4">
              <button
                onClick={() => setSubscribed(!subscribed)}
                className={`px-5 py-3 rounded-xl text-xs font-bold transition flex items-center gap-2 shadow-lg ${
                  subscribed
                    ? "bg-emerald-950 border border-emerald-600 text-emerald-300"
                    : "bg-cyan-600 hover:bg-cyan-500 text-white shadow-cyan-600/20"
                }`}
              >
                {subscribed ? (
                  <>
                    <CheckCircle2 className="w-4 h-4 text-emerald-400" /> Subscribed for Launch Notification
                  </>
                ) : (
                  <>
                    <Bell className="w-4 h-4" /> Notify Me On Launch
                  </>
                )}
              </button>

              <Link
                href="/dashboard"
                className="px-5 py-3 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl text-xs font-bold border border-slate-700 transition"
              >
                Return to Dashboard →
              </Link>
            </div>
          </div>
        </div>

        {/* Feature Roadmap Preview Cards */}
        <div className="space-y-4">
          <h2 className="text-sm font-bold text-white flex items-center gap-2 border-b border-[#1f293d] pb-3">
            <Sparkles className="w-4 h-4 text-cyan-400" /> UPCOMING NOTE EDITOR CAPABILITIES
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="bg-[#111827] border border-[#1f293d] rounded-2xl p-5 space-y-3">
              <div className="w-9 h-9 rounded-xl bg-cyan-500/10 border border-cyan-500/30 flex items-center justify-center text-cyan-400">
                <Bot className="w-5 h-5" />
              </div>
              <h3 className="text-sm font-bold text-white">AI Security Co-Pilot</h3>
              <p className="text-xs text-slate-400 leading-relaxed">
                Automated CVE vulnerability analysis, payload explanations, and intelligent note summarization.
              </p>
            </div>

            <div className="bg-[#111827] border border-[#1f293d] rounded-2xl p-5 space-y-3">
              <div className="w-9 h-9 rounded-xl bg-violet-500/10 border border-violet-500/30 flex items-center justify-center text-violet-400">
                <Layers className="w-5 h-5" />
              </div>
              <h3 className="text-sm font-bold text-white">Notion Block Stream</h3>
              <p className="text-xs text-slate-400 leading-relaxed">
                Slash menu block formatting (`/`), live terminal commands, copy snippets, and mastery tracking.
              </p>
            </div>

            <div className="bg-[#111827] border border-[#1f293d] rounded-2xl p-5 space-y-3">
              <div className="w-9 h-9 rounded-xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-400">
                <Zap className="w-5 h-5" />
              </div>
              <h3 className="text-sm font-bold text-white">PDF Export Engine</h3>
              <p className="text-xs text-slate-400 leading-relaxed">
                One-click publication-ready PDF document rendering directly from your saved study notes.
              </p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // ADMIN FULL ACCESS VIEW
  return (
    <div className="max-w-7xl mx-auto space-y-6 font-mono">
      {/* Admin Privilege Banner */}
      <div className="bg-red-950/40 border border-red-800/60 rounded-xl p-3.5 flex items-center justify-between text-xs text-red-300">
        <div className="flex items-center gap-2">
          <Shield className="w-4 h-4 text-red-400 shrink-0" />
          <span>
            <strong>ADMIN PRIVILEGED ACCESS:</strong> You are viewing the active Notion Note Database. Regular student accounts see the Coming Soon banner.
          </span>
        </div>
        <span className="px-2 py-0.5 bg-red-900/60 border border-red-700 text-red-200 rounded text-[10px] font-bold">
          ADMIN ONLY
        </span>
      </div>

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[#1f293d] pb-6">
        <div>
          <h1 className="text-2xl font-bold text-white flex items-center gap-2">
            <BookOpen className="w-6 h-6 text-cyan-400" /> NOTION DATABASE VIEW
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            Organize, filter, and access your cybersecurity study notes and documentation blocks.
          </p>
        </div>

        <button
          onClick={handleCreateNote}
          disabled={creating}
          className="px-4 py-2.5 bg-cyan-600 hover:bg-cyan-500 text-white font-bold text-xs rounded-lg transition flex items-center gap-2 shadow-lg shadow-cyan-600/20 disabled:opacity-50"
        >
          <Plus className="w-4 h-4" /> {creating ? "CREATING..." : "NEW NOTE"}
        </button>
      </div>

      {/* Category Tabs & Search Bar */}
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
            placeholder="Search notes & tags..."
            className="w-full bg-[#111827] border border-[#1f293d] focus:border-cyan-500 text-white text-xs rounded-lg pl-9 pr-3 py-2 focus:outline-none transition"
          />
        </div>
      </div>

      {/* Notes Grid */}
      {loading ? (
        <div className="text-center py-16 text-cyan-400 text-xs">LOADING DATABASE RECORDS...</div>
      ) : filteredNotes.length === 0 ? (
        <div className="bg-[#111827] border border-[#1f293d] rounded-2xl p-12 text-center space-y-3">
          <Sparkles className="w-10 h-10 text-slate-600 mx-auto" />
          <h3 className="text-sm font-bold text-white">No Notes Found</h3>
          <p className="text-xs text-slate-400 max-w-sm mx-auto">
            No notes exist under this category tab. Click "New Note" above to initialize a block document.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredNotes.map((note) => (
            <Link
              key={note.id}
              href={`/notes/${note.id}`}
              className="bg-[#111827] hover:bg-[#162238] border border-[#1f293d] hover:border-cyan-500/50 rounded-2xl p-5 transition flex flex-col justify-between group shadow-xl"
            >
              <div>
                <div className="flex items-center justify-between mb-3">
                  <span className="text-2xl">{note.icon || "📝"}</span>
                  <span className="px-2.5 py-0.5 rounded-full text-[10px] bg-cyan-950/60 border border-cyan-800/40 text-cyan-300">
                    {note.category}
                  </span>
                </div>

                <h2 className="text-base font-bold text-white group-hover:text-cyan-400 transition mb-1 line-clamp-1">
                  {note.title}
                </h2>

                <p className="text-xs text-slate-400 line-clamp-2 mb-4">
                  {note.description || "No description provided."}
                </p>
              </div>

              <div className="pt-3 border-t border-slate-800/80 flex items-center justify-between text-[10px] text-slate-400">
                <div className="flex items-center gap-3">
                  <span className="flex items-center gap-1 text-emerald-400">
                    <Clock className="w-3 h-3" /> {note.timeStudiedMinutes || 0}m
                  </span>
                  <span className="flex items-center gap-1 text-amber-400">
                    <Award className="w-3 h-3" /> {note.masteryPercent || 0}%
                  </span>
                </div>

                <ArrowUpRight className="w-4 h-4 text-slate-500 group-hover:text-cyan-400 transition" />
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
