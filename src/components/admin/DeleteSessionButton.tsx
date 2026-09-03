"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Trash2, Loader2 } from "lucide-react";

interface DeleteSessionButtonProps {
  sessionId: string;
  onDeleted?: () => void;
  className?: string;
}

export default function DeleteSessionButton({ sessionId, onDeleted, className }: DeleteSessionButtonProps) {
  const router = useRouter();
  const [deleting, setDeleting] = useState(false);

  const handleDelete = async () => {
    if (!confirm("Are you sure you want to delete this student study session reflection? This action cannot be undone.")) {
      return;
    }

    setDeleting(true);
    try {
      const res = await fetch(`/api/sessions/${sessionId}`, {
        method: "DELETE",
      });

      if (!res.ok) {
        const data = await res.json();
        alert(data.error || "Failed to delete study session reflection.");
      } else {
        if (onDeleted) {
          onDeleted();
        } else {
          router.refresh();
        }
      }
    } catch (err) {
      console.error("Delete session reflection error:", err);
      alert("An unexpected error occurred while deleting.");
    } finally {
      setDeleting(false);
    }
  };

  return (
    <button
      type="button"
      onClick={handleDelete}
      disabled={deleting}
      title="Delete Study Session Reflection (Admin)"
      className={
        className ||
        "p-1.5 bg-red-950/60 hover:bg-red-900/80 text-red-400 border border-red-900/40 rounded-lg transition disabled:opacity-50 flex items-center justify-center shrink-0"
      }
    >
      {deleting ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Trash2 className="w-3.5 h-3.5" />}
    </button>
  );
}
