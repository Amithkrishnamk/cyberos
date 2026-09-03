import { NextResponse } from "next/server";
import { getAuthSession } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { generateNotePdfStream } from "@/lib/pdf/renderNotePdf";

export async function GET(req: Request, { params }: { params: { id: string } }) {
  try {
    const session = await getAuthSession();
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const note = await prisma.note.findUnique({
      where: { id: params.id },
      include: {
        user: { select: { id: true, name: true, role: true } },
      },
    });

    if (!note) {
      return NextResponse.json({ error: "Note not found" }, { status: 404 });
    }

    const currentUserId = (session.user as any).id;
    const currentUserRole = (session.user as any).role;
    const isAuthorAdmin = note.user?.role === "ADMIN";

    // Students can export PDF for notes they created or notes published by Admin
    if (note.userId !== currentUserId && currentUserRole !== "ADMIN" && !isAuthorAdmin) {
      return NextResponse.json({ error: "Forbidden: Access denied" }, { status: 403 });
    }

    let parsedBlocks = [];
    try {
      parsedBlocks = JSON.parse(note.content);
    } catch {}

    let parsedTags = [];
    try {
      parsedTags = JSON.parse(note.tags);
    } catch {}

    const pdfStream = await generateNotePdfStream({
      title: note.title,
      category: note.category,
      description: note.description,
      icon: note.icon,
      masteryPercent: note.masteryPercent,
      timeStudiedMinutes: note.timeStudiedMinutes,
      tags: parsedTags,
      blocks: parsedBlocks,
    });

    const sanitizedFilename = note.title.replace(/[^a-zA-Z0-9_-]/g, "_");

    return new NextResponse(pdfStream as any, {
      headers: {
        "Content-Type": "application/pdf",
        "Content-Disposition": `attachment; filename="${sanitizedFilename}.pdf"`,
      },
    });
  } catch (error: any) {
    console.error("GET /api/notes/[id]/export-pdf error:", error);
    return NextResponse.json({ error: "Failed to generate note PDF" }, { status: 500 });
  }
}
