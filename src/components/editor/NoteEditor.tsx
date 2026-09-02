"use client";

import React, { useState, useEffect, useRef, useCallback } from "react";
import { useRouter } from "next/navigation";
import SlashMenu from "./SlashMenu";
import { NoteBlock, BlockType, NoteCategory } from "@/types";
import {
  Save,
  Download,
  Trash2,
  Copy,
  Check,
  Plus,
  Terminal,
  ShieldAlert,
  Lightbulb,
  Tag,
  Clock,
  Award,
  Sparkles,
  GripVertical,
  Loader2,
} from "lucide-react";

interface NoteEditorProps {
  initialNote: {
    id: string;
    title: string;
    category: string;
    tags: string;
    content: string;
    masteryPercent: number;
    timeStudiedMinutes: number;
    icon: string;
    coverImage: string;
    description: string;
  };
}

const COVER_PRESETS = [
  "linear-gradient(to right, #0f172a, #1e293b, #0f172a)",
  "linear-gradient(to right, #06201b, #0f4c3a, #06201b)",
  "linear-gradient(to right, #1d0f36, #3b1b6e, #1d0f36)",
  "linear-gradient(to right, #361f0f, #6e3d1b, #361f0f)",
  "linear-gradient(to right, #360f15, #6e1b27, #360f15)",
  "linear-gradient(to right, #0f1c36, #1b3a6e, #0f1c36)",
];

const EMOJI_PRESETS = ["📝", "🛡️", "🐧", "🌐", "⚡", "🔍", "💻", "🔑", "🎯", "🔬", "⚠️", "🔥"];

export default function NoteEditor({ initialNote }: NoteEditorProps) {
  const router = useRouter();

  const [title, setTitle] = useState(initialNote.title || "Untitled Note");
  const [category, setCategory] = useState<NoteCategory>((initialNote.category as NoteCategory) || "Web Security");
  const [description, setDescription] = useState(initialNote.description || "");
  const [icon, setIcon] = useState(initialNote.icon || "📝");
  const [coverImage, setCoverImage] = useState(initialNote.coverImage || COVER_PRESETS[0]);
  const [masteryPercent, setMasteryPercent] = useState<number>(initialNote.masteryPercent || 0);
  const [timeStudiedMinutes] = useState<number>(initialNote.timeStudiedMinutes || 0);
  const [tagsInput, setTagsInput] = useState<string>(
    (() => {
      try {
        const parsed = JSON.parse(initialNote.tags);
        return Array.isArray(parsed) ? parsed.join(", ") : initialNote.tags;
      } catch {
        return initialNote.tags || "";
      }
    })()
  );

  const [blocks, setBlocks] = useState<NoteBlock[]>(() => {
    try {
      const parsed = JSON.parse(initialNote.content);
      if (Array.isArray(parsed) && parsed.length > 0) return parsed;
    } catch {}
    return [{ id: "b-1", type: "paragraph", content: "" }];
  });

  const [saving, setSaving] = useState(false);
  const [exporting, setExporting] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [saveToast, setSaveToast] = useState(false);
  const [slashMenu, setSlashMenu] = useState<{ active: boolean; blockId: string; pos: { top: number; left: number } }>({
    active: false,
    blockId: "",
    pos: { top: 0, left: 0 },
  });
  const [copiedBlockId, setCopiedBlockId] = useState<string | null>(null);

  // Debounced Auto-save timer
  const autoSaveTimerRef = useRef<NodeJS.Timeout | null>(null);

  const saveToDatabase = useCallback(async () => {
    setSaving(true);
    const tagsArray = tagsInput.split(",").map((t) => t.trim()).filter(Boolean);

    try {
      await fetch(`/api/notes/${initialNote.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title,
          category,
          description,
          icon,
          coverImage,
          masteryPercent,
          tags: tagsArray,
          content: blocks,
        }),
      });
      setSaveToast(true);
      setTimeout(() => setSaveToast(false), 2500);
    } catch (err) {
      console.error("Auto-save error:", err);
    } finally {
      setSaving(false);
    }
  }, [initialNote.id, title, category, description, icon, coverImage, masteryPercent, tagsInput, blocks]);

  // Schedule debounced auto-save (5 seconds after typing stops)
  useEffect(() => {
    if (autoSaveTimerRef.current) clearTimeout(autoSaveTimerRef.current);
    autoSaveTimerRef.current = setTimeout(() => {
      saveToDatabase();
    }, 5000);

    return () => {
      if (autoSaveTimerRef.current) clearTimeout(autoSaveTimerRef.current);
    };
  }, [title, category, description, icon, coverImage, masteryPercent, tagsInput, blocks, saveToDatabase]);

  const handleBlockContentChange = (id: string, text: string) => {
    let newType: BlockType | null = null;
    let cleanText = text;

    if (text.startsWith("# ")) {
      newType = "heading1";
      cleanText = text.substring(2);
    } else if (text.startsWith("## ")) {
      newType = "heading2";
      cleanText = text.substring(3);
    } else if (text.startsWith("### ")) {
      newType = "heading3";
      cleanText = text.substring(4);
    } else if (text.startsWith("- ") || text.startsWith("* ") || text.startsWith("• ")) {
      newType = "bullet";
      cleanText = text.substring(2);
    } else if (text.startsWith("[] ") || text.startsWith("[ ] ")) {
      newType = "checklist";
      cleanText = text.substring(3);
    } else if (text.startsWith("> ")) {
      newType = "quote";
      cleanText = text.substring(2);
    } else if (text.startsWith("```")) {
      newType = "code";
      cleanText = text.substring(3);
    } else if (text.startsWith("$ ") || text.toLowerCase().startsWith("cmd:")) {
      newType = "cmd";
      cleanText = text.startsWith("$ ") ? text.substring(2) : text.substring(4);
    } else if (text.toLowerCase().startsWith("cve:") || text.toLowerCase().startsWith("vuln:")) {
      newType = "vuln";
      cleanText = text.startsWith("cve:") ? text.substring(4) : text.substring(5);
    } else if (text.toLowerCase().startsWith("concept:")) {
      newType = "concept";
      cleanText = text.substring(8);
    } else if (text === "---" || text === "===") {
      newType = "divider";
      cleanText = "";
    }

    setBlocks((prev) =>
      prev.map((b) => {
        if (b.id === id) {
          return {
            ...b,
            type: newType || b.type,
            content: cleanText,
          };
        }
        return b;
      })
    );
  };

  const handleKeyDown = (id: string, e: React.KeyboardEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    if (e.key === "/" && (e.target as HTMLInputElement).value === "") {
      const rect = (e.target as HTMLElement).getBoundingClientRect();
      setSlashMenu({
        active: true,
        blockId: id,
        pos: { top: rect.bottom + 5, left: rect.left },
      });
    } else if (e.key === "Enter" && !slashMenu.active) {
      if (e.shiftKey) return;
      e.preventDefault();
      const currentIndex = blocks.findIndex((b) => b.id === id);
      const newBlock: NoteBlock = {
        id: `b-${Date.now()}`,
        type: "paragraph",
        content: "",
      };
      const updated = [...blocks];
      updated.splice(currentIndex + 1, 0, newBlock);
      setBlocks(updated);
    } else if (e.key === "Backspace" && (e.target as HTMLInputElement).value === "" && blocks.length > 1) {
      e.preventDefault();
      setBlocks((prev) => prev.filter((b) => b.id !== id));
    }
  };

  const handleSelectSlashBlock = (type: BlockType) => {
    setBlocks((prev) =>
      prev.map((b) => {
        if (b.id === slashMenu.blockId) {
          return {
            ...b,
            type,
            content: "",
            severity: type === "vuln" ? "High" : undefined,
            cveId: type === "vuln" ? "CVE-2026-0001" : undefined,
          };
        }
        return b;
      })
    );
    setSlashMenu({ active: false, blockId: "", pos: { top: 0, left: 0 } });
  };

  const handlePaste = (e: React.ClipboardEvent) => {
    const text = e.clipboardData.getData("text");
    if (!text.includes("\n")) return;

    e.preventDefault();
    const lines = text.split("\n").filter((l) => l.trim().length > 0);
    const newBlocks: NoteBlock[] = lines.map((line, idx) => {
      let type: BlockType = "paragraph";
      let content = line;

      if (line.startsWith("# ")) {
        type = "heading1";
        content = line.substring(2);
      } else if (line.startsWith("## ")) {
        type = "heading2";
        content = line.substring(3);
      } else if (line.startsWith("### ")) {
        type = "heading3";
        content = line.substring(4);
      } else if (line.startsWith("- ") || line.startsWith("* ")) {
        type = "bullet";
        content = line.substring(2);
      } else if (line.startsWith("[] ") || line.startsWith("[ ] ")) {
        type = "checklist";
        content = line.substring(3);
      } else if (line.startsWith("> ")) {
        type = "quote";
        content = line.substring(2);
      }

      return {
        id: `b-paste-${Date.now()}-${idx}`,
        type,
        content,
      };
    });

    setBlocks((prev) => [...prev, ...newBlocks]);
  };

  const copyToClipboard = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedBlockId(id);
    setTimeout(() => setCopiedBlockId(null), 2000);
  };

  const handleExportPDF = () => {
    setExporting(true);
    window.open(`/api/notes/${initialNote.id}/export-pdf`, "_blank");
    setTimeout(() => setExporting(false), 1500);
  };

  const handleDeleteNote = async () => {
    if (!confirm("Are you sure you want to delete this note?")) return;
    setDeleting(true);
    await fetch(`/api/notes/${initialNote.id}`, { method: "DELETE" });
    router.push("/notes");
  };

  return (
    <div className="max-w-4xl mx-auto font-mono pb-32 relative">
      {/* Save Notification Toast */}
      {saveToast && (
        <div className="fixed bottom-6 right-6 z-50 bg-emerald-950 border border-emerald-500/50 text-emerald-300 px-4 py-2.5 rounded-xl shadow-2xl flex items-center gap-2 text-xs animate-in slide-in-from-bottom-5">
          <Check className="w-4 h-4 text-emerald-400" /> Saved to database
        </div>
      )}

      {/* Top Floating Action Bar */}
      <div className="flex items-center justify-between mb-6 bg-[#111827] border border-[#1f293d] rounded-xl p-3 shadow-lg">
        <div className="flex items-center gap-2 text-xs text-slate-400">
          <span className="w-2 h-2 rounded-full bg-emerald-400" />
          <span>{saving ? "Saving changes..." : "All changes saved to database"}</span>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={saveToDatabase}
            disabled={saving}
            className="px-3 py-1.5 bg-cyan-600 hover:bg-cyan-500 text-white rounded-lg text-xs font-bold transition flex items-center gap-1.5 shadow-md shadow-cyan-600/20 disabled:opacity-50"
          >
            {saving ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Save className="w-3.5 h-3.5" />}
            <span>{saving ? "Saving..." : "Save"}</span>
          </button>

          <button
            onClick={handleExportPDF}
            disabled={exporting}
            className="px-3 py-1.5 border border-slate-700 hover:border-cyan-500 text-slate-300 hover:text-cyan-400 rounded-lg text-xs transition flex items-center gap-1.5 disabled:opacity-50"
          >
            {exporting ? <Loader2 className="w-3.5 h-3.5 animate-spin text-cyan-400" /> : <Download className="w-3.5 h-3.5" />}
            <span>{exporting ? "Generating PDF..." : "Export PDF"}</span>
          </button>

          <button
            onClick={handleDeleteNote}
            disabled={deleting}
            className="p-1.5 text-slate-500 hover:text-red-400 hover:bg-red-950/20 rounded-lg transition disabled:opacity-50"
            title="Delete Note"
          >
            {deleting ? <Loader2 className="w-4 h-4 animate-spin text-red-400" /> : <Trash2 className="w-4 h-4" />}
          </button>
        </div>
      </div>

      {/* Notion Cover Banner Header */}
      <div className="relative group rounded-2xl overflow-hidden mb-6 border border-[#1f293d] shadow-xl">
        <div style={{ background: coverImage }} className="h-44 w-full transition-all duration-300" />

        <div className="absolute top-3 right-3 opacity-0 group-hover:opacity-100 transition flex gap-1 bg-black/60 backdrop-blur-md p-1 rounded-lg">
          {COVER_PRESETS.map((preset, idx) => (
            <button
              key={idx}
              onClick={() => setCoverImage(preset)}
              style={{ background: preset }}
              className="w-5 h-5 rounded-full border border-white/20 hover:scale-110 transition"
            />
          ))}
        </div>

        {/* Emoji Selector Badge */}
        <div className="absolute -bottom-5 left-8 flex items-center gap-2">
          <div className="relative group/emoji">
            <button className="text-4xl bg-[#111827] border-2 border-[#1f293d] rounded-2xl p-2 shadow-2xl hover:scale-105 transition">
              {icon}
            </button>
            <div className="absolute left-0 top-full mt-1 hidden group-hover/emoji:flex gap-1 bg-[#111827] border border-slate-800 p-2 rounded-xl shadow-2xl z-40">
              {EMOJI_PRESETS.map((e) => (
                <button key={e} onClick={() => setIcon(e)} className="text-xl hover:scale-125 transition">
                  {e}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Title & Metadata Inputs */}
      <div className="pt-6 px-4 space-y-4">
        {/* Title Input */}
        <input
          type="text"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="Untitled Cybersecurity Note..."
          className="w-full bg-transparent border-none text-3xl md:text-4xl font-bold text-white focus:outline-none placeholder:text-slate-600 tracking-tight"
        />

        {/* Description Line */}
        <input
          type="text"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          placeholder="Add a brief description or scope overview..."
          className="w-full bg-transparent border-none text-sm text-slate-400 focus:outline-none placeholder:text-slate-600"
        />

        {/* Metadata Properties Row */}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3 pt-3 border-y border-[#1f293d] py-3 text-xs">
          {/* Category */}
          <div className="flex items-center gap-2 bg-[#111827] px-3 py-2 rounded-lg border border-slate-800">
            <Sparkles className="w-3.5 h-3.5 text-cyan-400" />
            <span className="text-slate-400">Category:</span>
            <select
              value={category}
              onChange={(e) => setCategory(e.target.value as NoteCategory)}
              className="bg-transparent text-cyan-300 font-bold focus:outline-none cursor-pointer"
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

          {/* Mastery % */}
          <div className="flex items-center gap-2 bg-[#111827] px-3 py-2 rounded-lg border border-slate-800">
            <Award className="w-3.5 h-3.5 text-amber-400" />
            <span className="text-slate-400">Mastery:</span>
            <input
              type="number"
              min={0}
              max={100}
              value={masteryPercent}
              onChange={(e) => setMasteryPercent(Number(e.target.value))}
              className="w-12 bg-transparent text-amber-300 font-bold focus:outline-none text-right"
            />
            <span className="text-slate-400">%</span>
          </div>

          {/* Time Studied */}
          <div className="flex items-center gap-2 bg-[#111827] px-3 py-2 rounded-lg border border-slate-800">
            <Clock className="w-3.5 h-3.5 text-emerald-400" />
            <span className="text-slate-400">Studied:</span>
            <span className="text-emerald-300 font-bold">{timeStudiedMinutes} mins</span>
          </div>

          {/* Tags */}
          <div className="flex items-center gap-2 bg-[#111827] px-3 py-2 rounded-lg border border-slate-800">
            <Tag className="w-3.5 h-3.5 text-violet-400" />
            <input
              type="text"
              value={tagsInput}
              onChange={(e) => setTagsInput(e.target.value)}
              placeholder="OWASP, SQLi..."
              className="w-full bg-transparent text-violet-300 text-xs focus:outline-none"
            />
          </div>
        </div>
      </div>

      {/* Notion-Style Block Editor Stream */}
      <div className="pt-8 px-4 space-y-3" onPaste={handlePaste}>
        {blocks.map((block) => (
          <div key={block.id} className="group relative flex items-start gap-2">
            {/* Drag Handle & Type Indicator */}
            <div className="opacity-0 group-hover:opacity-100 transition text-slate-600 hover:text-slate-400 pt-1 cursor-grab">
              <GripVertical className="w-4 h-4" />
            </div>

            <div className="flex-1 min-w-0">
              {/* Paragraph */}
              {block.type === "paragraph" && (
                <textarea
                  rows={1}
                  value={block.content}
                  onChange={(e) => handleBlockContentChange(block.id, e.target.value)}
                  onKeyDown={(e) => handleKeyDown(block.id, e)}
                  placeholder="Type '/' for block menu or start writing..."
                  className="w-full bg-transparent text-slate-200 focus:outline-none text-sm placeholder:text-slate-700 resize-none"
                />
              )}

              {/* Headings */}
              {block.type === "heading1" && (
                <input
                  type="text"
                  value={block.content}
                  onChange={(e) => handleBlockContentChange(block.id, e.target.value)}
                  onKeyDown={(e) => handleKeyDown(block.id, e)}
                  placeholder="Heading 1"
                  className="w-full bg-transparent text-2xl font-bold text-white focus:outline-none pt-4 pb-1 border-b border-slate-800"
                />
              )}
              {block.type === "heading2" && (
                <input
                  type="text"
                  value={block.content}
                  onChange={(e) => handleBlockContentChange(block.id, e.target.value)}
                  onKeyDown={(e) => handleKeyDown(block.id, e)}
                  placeholder="Heading 2"
                  className="w-full bg-transparent text-xl font-bold text-cyan-400 focus:outline-none pt-3 pb-1"
                />
              )}
              {block.type === "heading3" && (
                <input
                  type="text"
                  value={block.content}
                  onChange={(e) => handleBlockContentChange(block.id, e.target.value)}
                  onKeyDown={(e) => handleKeyDown(block.id, e)}
                  placeholder="Heading 3"
                  className="w-full bg-transparent text-lg font-bold text-slate-300 focus:outline-none pt-2"
                />
              )}

              {/* Bullet */}
              {block.type === "bullet" && (
                <div className="flex items-center gap-2">
                  <span className="text-cyan-400 font-bold text-base">•</span>
                  <input
                    type="text"
                    value={block.content}
                    onChange={(e) => handleBlockContentChange(block.id, e.target.value)}
                    onKeyDown={(e) => handleKeyDown(block.id, e)}
                    placeholder="List item..."
                    className="w-full bg-transparent text-slate-200 text-sm focus:outline-none"
                  />
                </div>
              )}

              {/* Checklist */}
              {block.type === "checklist" && (
                <div className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    checked={block.checked || false}
                    onChange={(e) =>
                      setBlocks((prev) =>
                        prev.map((b) => (b.id === block.id ? { ...b, checked: e.target.checked } : b))
                      )
                    }
                    className="w-4 h-4 rounded border-slate-700 text-cyan-500 focus:ring-0 bg-[#090d16]"
                  />
                  <input
                    type="text"
                    value={block.content}
                    onChange={(e) => handleBlockContentChange(block.id, e.target.value)}
                    onKeyDown={(e) => handleKeyDown(block.id, e)}
                    placeholder="Task item..."
                    className={`w-full bg-transparent text-sm focus:outline-none ${
                      block.checked ? "line-through text-slate-500" : "text-slate-200"
                    }`}
                  />
                </div>
              )}

              {/* Quote */}
              {block.type === "quote" && (
                <div className="pl-3 border-l-2 border-cyan-400 italic text-cyan-200">
                  <input
                    type="text"
                    value={block.content}
                    onChange={(e) => handleBlockContentChange(block.id, e.target.value)}
                    onKeyDown={(e) => handleKeyDown(block.id, e)}
                    placeholder="Quote or callout tip..."
                    className="w-full bg-transparent text-sm focus:outline-none"
                  />
                </div>
              )}

              {/* Fenced Code Block */}
              {block.type === "code" && (
                <div className="bg-[#050811] border border-slate-800 rounded-xl p-3 relative group/code">
                  <div className="flex items-center justify-between text-[10px] text-slate-500 mb-2 border-b border-slate-800/80 pb-1.5">
                    <span>CODE BLOCK ({block.language || "bash"})</span>
                    <button
                      onClick={() => copyToClipboard(block.content, block.id)}
                      className="text-cyan-400 hover:underline flex items-center gap-1"
                    >
                      {copiedBlockId === block.id ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                      <span>{copiedBlockId === block.id ? "COPIED" : "COPY"}</span>
                    </button>
                  </div>
                  <textarea
                    rows={3}
                    value={block.content}
                    onChange={(e) => handleBlockContentChange(block.id, e.target.value)}
                    placeholder="// Paste code snippet here..."
                    className="w-full bg-transparent text-emerald-400 font-mono text-xs focus:outline-none resize-y"
                  />
                </div>
              )}

              {/* Terminal Command Card (cmd / $) */}
              {block.type === "cmd" && (
                <div className="bg-black/90 border border-cyan-500/40 rounded-xl p-3 font-mono text-xs relative flex items-center justify-between shadow-lg shadow-cyan-500/5">
                  <div className="flex items-center gap-2 flex-1 mr-2">
                    <Terminal className="w-4 h-4 text-cyan-400 shrink-0" />
                    <span className="text-cyan-400 font-bold">$</span>
                    <input
                      type="text"
                      value={block.content}
                      onChange={(e) => handleBlockContentChange(block.id, e.target.value)}
                      onKeyDown={(e) => handleKeyDown(block.id, e)}
                      placeholder="nmap -sV -sC -p- 10.10.10.1..."
                      className="w-full bg-transparent text-slate-200 focus:outline-none"
                    />
                  </div>
                  <button
                    onClick={() => copyToClipboard(block.content, block.id)}
                    className="p-1 text-slate-400 hover:text-cyan-400 transition shrink-0"
                    title="Copy Command"
                  >
                    {copiedBlockId === block.id ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                  </button>
                </div>
              )}

              {/* Vulnerability Record Card (vuln / cve) */}
              {block.type === "vuln" && (
                <div className="bg-[#14080a] border border-red-800/60 rounded-xl p-4 space-y-2 relative">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <ShieldAlert className="w-4 h-4 text-red-400" />
                      <input
                        type="text"
                        value={block.cveId || "CVE-2026-XXXX"}
                        onChange={(e) =>
                          setBlocks((prev) =>
                            prev.map((b) => (b.id === block.id ? { ...b, cveId: e.target.value } : b))
                          )
                        }
                        className="bg-red-950/60 border border-red-800/40 px-2 py-0.5 rounded text-red-300 text-xs font-bold focus:outline-none"
                      />
                    </div>

                    <select
                      value={block.severity || "High"}
                      onChange={(e) =>
                        setBlocks((prev) =>
                          prev.map((b) => (b.id === block.id ? { ...b, severity: e.target.value as any } : b))
                        )
                      }
                      className="bg-red-950 text-red-300 border border-red-700 text-xs rounded px-2 py-0.5 font-bold"
                    >
                      <option value="Low">Low</option>
                      <option value="Medium">Medium</option>
                      <option value="High">High</option>
                      <option value="Critical">Critical</option>
                    </select>
                  </div>

                  <input
                    type="text"
                    value={block.content}
                    onChange={(e) => handleBlockContentChange(block.id, e.target.value)}
                    placeholder="Vulnerability Title / Summary..."
                    className="w-full bg-transparent text-white font-bold text-sm focus:outline-none"
                  />
                </div>
              )}

              {/* Key Concept Card */}
              {block.type === "concept" && (
                <div className="bg-[#0b1c18] border border-emerald-600/40 rounded-xl p-4 flex items-start gap-3">
                  <Lightbulb className="w-5 h-5 text-emerald-400 shrink-0 mt-0.5" />
                  <div className="flex-1">
                    <div className="text-xs font-bold text-emerald-400 mb-1">KEY CONCEPT</div>
                    <textarea
                      rows={2}
                      value={block.content}
                      onChange={(e) => handleBlockContentChange(block.id, e.target.value)}
                      placeholder="Explain fundamental concept..."
                      className="w-full bg-transparent text-emerald-100 text-xs focus:outline-none resize-y"
                    />
                  </div>
                </div>
              )}

              {/* Divider */}
              {block.type === "divider" && (
                <div className="py-2">
                  <hr className="border-slate-800" />
                </div>
              )}
            </div>
          </div>
        ))}
      </div>

      {/* Add Block Button */}
      <div className="pt-6 px-4">
        <button
          type="button"
          onClick={() =>
            setBlocks((prev) => [...prev, { id: `b-${Date.now()}`, type: "paragraph", content: "" }])
          }
          className="flex items-center gap-2 text-xs text-slate-500 hover:text-cyan-400 transition"
        >
          <Plus className="w-4 h-4" /> Click to add block
        </button>
      </div>

      {/* Floating Slash Menu */}
      {slashMenu.active && (
        <SlashMenu
          position={slashMenu.pos}
          onSelect={handleSelectSlashBlock}
          onClose={() => setSlashMenu({ active: false, blockId: "", pos: { top: 0, left: 0 } })}
        />
      )}
    </div>
  );
}
