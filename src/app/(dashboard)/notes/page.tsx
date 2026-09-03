"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  Plus,
  Search,
  BookOpen,
  Clock,
  Award,
  Sparkles,
  ArrowUpRight,
  Bot,
  Layers,
  Zap,
  Bell,
  CheckCircle2,
  Lock,
  Cpu,
  Rocket,
} from "lucide-react";

const CATEGORY_TABS: Array<string> = [
  "All Pages",
  "Web Security",
  "Linux",
  "Active Directory",
  "SOC",
  "Networking",
  "Pentesting",
  "⚡ Coming Soon",
];

const UPCOMING_FEATURES = [
  {
    id: "ai-assistant",
    title: "AI Security Co-Pilot & CVE Analyzer",
    badge: "IN DEVELOPMENT",
    icon: Bot,
    color: "cyan",
    description: "Automated vulnerability analysis, command syntax generation, and intelligent block-level note summarization.",
    eta: "Q4 2026",
  },
  {
    id: "flashcards",
    title: "Spaced Repetition Flashcard Engine",
    badge: "PLANNED",
    icon: Layers,
    color: "violet",
    description: "Auto-convert code blocks and key concept cards into active recall flashcards with Anki-style scheduling.",
    eta: "Q4 2026",
  },
  {
    id: "quiz-generator",
    title: "Dynamic Knowledge Quiz Generator",
    badge: "PLANNED",
    icon: Zap,
    color: "amber",
    description: "Generate customized multiple-choice practice exams derived directly from your personal study note repository.",
    eta: "Q1 2027",
  },
  {
    id: "team-vaults",
    title: "Shared Team Vaults & Real-time Sync",
    badge: "RESEARCH",
    icon: Cpu,
    color: "emerald",
    description: "Multi-operator live note collaboration, shared exploit documentation, and org-wide knowledge bases.",
    eta: "Q1 2027",
  },
];

export default function NotesDatabasePage() {
  const router = useRouter();

  const [notes, setNotes] = useState<any[]>([]);
  const [activeTab, setActiveTab] = useState<string>("All Pages");
  const [searchQuery, setSearchQuery] = useState("");
  const [loading, setLoading] = useState(true);
  const [creating, setCreating] = useState(false);
  const [notifiedFeatures, setNotifiedFeatures] = useState<Record<string, boolean>>({});

  useEffect(() => {
    async function loadNotes() {
      if (activeTab === "⚡ Coming Soon") {
        setLoading(false);
        return;
      }
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
  }, [activeTab]);

  const handleCreateNote = async () => {
    setCreating(true);
    try {
      const res = await fetch("/api/notes", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: "Untitled Cybersecurity Note",
          category: activeTab === "All Pages" || activeTab === "⚡ Coming Soon" ? "Web Security" : activeTab,
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

  const toggleNotify = (id: string) => {
    setNotifiedFeatures((prev) => ({ ...prev, [id]: !prev[id] }));
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
              className={`px-3 py-1.5 rounded-lg text-xs font-bold whitespace-nowrap transition flex items-center gap-1.5 ${
                activeTab === tab
                  ? "bg-cyan-500/10 border border-cyan-500/40 text-cyan-400 shadow-md"
                  : "text-slate-400 hover:text-white hover:bg-slate-800/60"
              }`}
            >
              {tab === "⚡ Coming Soon" && <Rocket className="w-3.5 h-3.5 text-amber-400 animate-pulse" />}
              <span>{tab}</span>
            </button>
          ))}
        </div>

        {/* Search Input */}
        {activeTab !== "⚡ Coming Soon" && (
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
        )}
      </div>

      {/* COMING SOON TAB CONTENT */}
      {activeTab === "⚡ Coming Soon" ? (
        <div className="space-y-6">
          <div className="bg-gradient-to-r from-[#0d1829] via-[#111827] to-[#180f29] border border-cyan-500/30 rounded-2xl p-8 shadow-2xl relative overflow-hidden">
            <div className="absolute top-0 right-0 p-8 opacity-10 pointer-events-none">
              <Rocket className="w-48 h-48 text-cyan-400" />
            </div>

            <div className="max-w-2xl space-y-3">
              <div className="inline-flex items-center gap-2 px-3 py-1 bg-amber-500/10 border border-amber-500/30 rounded-full text-amber-400 text-xs font-bold">
                <Rocket className="w-3.5 h-3.5" /> CYBER // OS ROADMAP
              </div>
              <h2 className="text-2xl font-bold text-white tracking-wide">
                NEXT-GEN NOTES & STUDY MODULES
              </h2>
              <p className="text-xs text-slate-300 leading-relaxed">
                We are actively engineering advanced AI study co-pilots, active recall flashcard engines, dynamic quiz generators, and collaborative team vaults. Explore upcoming modules below and opt-in for launch pings.
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {UPCOMING_FEATURES.map((feature) => {
              const Icon = feature.icon;
              const isNotified = notifiedFeatures[feature.id];

              return (
                <div
                  key={feature.id}
                  className="bg-[#111827] border border-[#1f293d] hover:border-cyan-500/40 rounded-2xl p-6 shadow-xl transition flex flex-col justify-between group"
                >
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <div className="w-10 h-10 rounded-xl bg-cyan-500/10 border border-cyan-500/30 flex items-center justify-center text-cyan-400">
                        <Icon className="w-5 h-5" />
                      </div>
                      <span className="px-2.5 py-1 rounded-full text-[10px] font-bold bg-amber-950/80 border border-amber-800/60 text-amber-300">
                        {feature.badge} • EST {feature.eta}
                      </span>
                    </div>

                    <h3 className="text-base font-bold text-white group-hover:text-cyan-400 transition">
                      {feature.title}
                    </h3>
                    <p className="text-xs text-slate-400 leading-relaxed">{feature.description}</p>
                  </div>

                  <div className="pt-4 mt-6 border-t border-slate-800/80 flex items-center justify-between">
                    <span className="text-[10px] text-slate-500 flex items-center gap-1">
                      <Lock className="w-3 h-3 text-slate-500" /> Module in Active Dev
                    </span>

                    <button
                      onClick={() => toggleNotify(feature.id)}
                      className={`px-3 py-1.5 rounded-lg text-xs font-bold transition flex items-center gap-1.5 ${
                        isNotified
                          ? "bg-emerald-950 border border-emerald-700 text-emerald-300"
                          : "bg-slate-800 hover:bg-slate-700 text-cyan-300 border border-slate-700"
                      }`}
                    >
                      {isNotified ? (
                        <>
                          <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" /> Subscribed
                        </>
                      ) : (
                        <>
                          <Bell className="w-3.5 h-3.5" /> Notify Me
                        </>
                      )}
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      ) : (
        /* STANDARD NOTES DATABASE GRID */
        <>
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

          {/* Persistent Coming Soon Preview Banner */}
          <div className="mt-12 bg-[#0b1322] border border-cyan-500/30 rounded-2xl p-6 flex flex-col sm:flex-row items-center justify-between gap-4 shadow-xl">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-xl bg-cyan-500/10 border border-cyan-500/30 flex items-center justify-center text-cyan-400 shrink-0">
                <Rocket className="w-6 h-6 animate-pulse" />
              </div>
              <div>
                <h3 className="text-sm font-bold text-white">⚡ NEXT-GEN NOTES FEATURES COMING SOON</h3>
                <p className="text-xs text-slate-400 mt-0.5">
                  AI Security Co-Pilot, Spaced Repetition Flashcards, and Dynamic Exam Generators are in active development.
                </p>
              </div>
            </div>

            <button
              onClick={() => setActiveTab("⚡ Coming Soon")}
              className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-cyan-300 border border-cyan-800/50 rounded-xl text-xs font-bold transition whitespace-nowrap"
            >
              Explore Roadmap →
            </button>
          </div>
        </>
      )}
    </div>
  );
}
