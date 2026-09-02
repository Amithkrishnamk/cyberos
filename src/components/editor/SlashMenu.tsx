"use client";

import { useEffect, useState, useRef } from "react";
import {
  Heading1,
  Heading2,
  Heading3,
  List,
  CheckSquare,
  Quote,
  Code,
  Terminal,
  ShieldAlert,
  Lightbulb,
  Minus,
  Type,
} from "lucide-react";
import { BlockType } from "@/types";

interface SlashMenuItem {
  type: BlockType;
  label: string;
  description: string;
  icon: any;
}

const SLASH_ITEMS: SlashMenuItem[] = [
  { type: "paragraph", label: "Text", description: "Just start typing with plain text.", icon: Type },
  { type: "heading1", label: "Heading 1", description: "Large section heading (#)", icon: Heading1 },
  { type: "heading2", label: "Heading 2", description: "Medium section heading (##)", icon: Heading2 },
  { type: "heading3", label: "Heading 3", description: "Small section heading (###)", icon: Heading3 },
  { type: "bullet", label: "Bullet List", description: "Simple bulleted list item (-)", icon: List },
  { type: "checklist", label: "Checklist", description: "Interactive task checkbox ([])", icon: CheckSquare },
  { type: "quote", label: "Quote / Callout", description: "Highlight key quotes or tips (>)", icon: Quote },
  { type: "code", label: "Code Block", description: "Syntax highlighted code snippet (```)", icon: Code },
  { type: "cmd", label: "Terminal Command", description: "Executable CLI command card ($ / cmd:)", icon: Terminal },
  { type: "vuln", label: "Vulnerability Card", description: "CVE record with severity rating (vuln:)", icon: ShieldAlert },
  { type: "concept", label: "Key Concept", description: "Core technical concept callout (concept:)", icon: Lightbulb },
  { type: "divider", label: "Divider", description: "Visual horizontal break (---)", icon: Minus },
];

interface SlashMenuProps {
  position: { top: number; left: number };
  onSelect: (type: BlockType) => void;
  onClose: () => void;
}

export default function SlashMenu({ position, onSelect, onClose }: SlashMenuProps) {
  const [search, setSearch] = useState("");
  const [selectedIndex, setSelectedIndex] = useState(0);
  const containerRef = useRef<HTMLDivElement>(null);

  const filteredItems = SLASH_ITEMS.filter(
    (item) =>
      item.label.toLowerCase().includes(search.toLowerCase()) ||
      item.description.toLowerCase().includes(search.toLowerCase()) ||
      item.type.toLowerCase().includes(search.toLowerCase())
  );

  useEffect(() => {
    setSelectedIndex(0);
  }, [search]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "ArrowDown") {
        e.preventDefault();
        setSelectedIndex((prev) => (prev + 1) % Math.max(1, filteredItems.length));
      } else if (e.key === "ArrowUp") {
        e.preventDefault();
        setSelectedIndex((prev) => (prev - 1 + filteredItems.length) % Math.max(1, filteredItems.length));
      } else if (e.key === "Enter") {
        e.preventDefault();
        if (filteredItems[selectedIndex]) {
          onSelect(filteredItems[selectedIndex].type);
        }
      } else if (e.key === "Escape") {
        e.preventDefault();
        onClose();
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [filteredItems, selectedIndex, onSelect, onClose]);

  return (
    <div
      ref={containerRef}
      style={{ top: position.top, left: position.left }}
      className="fixed z-50 w-72 bg-[#111827] border border-[#1f293d] rounded-xl shadow-2xl p-2 font-mono text-xs animate-in fade-in zoom-in-95 duration-150"
    >
      <div className="px-2 py-1 mb-1 text-[10px] text-cyan-400 font-bold uppercase border-b border-slate-800">
        Basic & Security Blocks
      </div>

      <div className="max-h-60 overflow-y-auto space-y-0.5">
        {filteredItems.length === 0 ? (
          <div className="p-3 text-center text-slate-500">No matching block types</div>
        ) : (
          filteredItems.map((item, index) => {
            const Icon = item.icon;
            const isSelected = index === selectedIndex;
            return (
              <button
                key={item.type}
                type="button"
                onClick={() => onSelect(item.type)}
                onMouseEnter={() => setSelectedIndex(index)}
                className={`w-full text-left flex items-start gap-2.5 p-2 rounded-lg transition ${
                  isSelected ? "bg-cyan-500/10 border border-cyan-500/40 text-cyan-300" : "text-slate-300 hover:bg-slate-800"
                }`}
              >
                <div className="p-1 rounded bg-slate-900 text-cyan-400 shrink-0 mt-0.5">
                  <Icon className="w-3.5 h-3.5" />
                </div>
                <div>
                  <div className="font-bold text-white text-xs">{item.label}</div>
                  <div className="text-[10px] text-slate-400">{item.description}</div>
                </div>
              </button>
            );
          })
        )}
      </div>
    </div>
  );
}
