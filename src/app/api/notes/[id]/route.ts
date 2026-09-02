import { NextResponse } from "next/server";
import { getAuthSession } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET(req: Request, { params }: { params: { id: string } }) {
  try {
    const session = await getAuthSession();
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const note = await prisma.note.findUnique({
      where: { id: params.id },
    });

    if (!note) {
      return NextResponse.json({ error: "Note not found" }, { status: 404 });
    }

    // Access control: verify session.user.id === note.userId unless requester is ADMIN
    const currentUserId = (session.user as any).id;
    const currentUserRole = (session.user as any).role;
    if (note.userId !== currentUserId && currentUserRole !== "ADMIN") {
      return NextResponse.json({ error: "Forbidden: Access denied" }, { status: 403 });
    }

    return NextResponse.json({ note });
  } catch (error: any) {
    console.error("GET /api/notes/[id] error:", error);
    return NextResponse.json({ error: "Failed to fetch note" }, { status: 500 });
  }
}

export async function PUT(req: Request, { params }: { params: { id: string } }) {
  try {
    const session = await getAuthSession();
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const note = await prisma.note.findUnique({
      where: { id: params.id },
    });

    if (!note) {
      return NextResponse.json({ error: "Note not found" }, { status: 404 });
    }

    const currentUserId = (session.user as any).id;
    const currentUserRole = (session.user as any).role;
    if (note.userId !== currentUserId && currentUserRole !== "ADMIN") {
      return NextResponse.json({ error: "Forbidden: Access denied" }, { status: 403 });
    }

    const body = await req.json();
    const { title, category, tags, content, masteryPercent, timeStudiedMinutes, icon, coverImage, description } = body;

    const updatedNote = await prisma.note.update({
      where: { id: params.id },
      data: {
        title: title !== undefined ? title : note.title,
        category: category !== undefined ? category : note.category,
        tags: tags !== undefined ? (typeof tags === "string" ? tags : JSON.stringify(tags)) : note.tags,
        content: content !== undefined ? (typeof content === "string" ? content : JSON.stringify(content)) : note.content,
        masteryPercent: masteryPercent !== undefined ? Number(masteryPercent) : note.masteryPercent,
        timeStudiedMinutes: timeStudiedMinutes !== undefined ? Number(timeStudiedMinutes) : note.timeStudiedMinutes,
        icon: icon !== undefined ? icon : note.icon,
        coverImage: coverImage !== undefined ? coverImage : note.coverImage,
        description: description !== undefined ? description : note.description,
      },
    });

    return NextResponse.json({ note: updatedNote });
  } catch (error: any) {
    console.error("PUT /api/notes/[id] error:", error);
    return NextResponse.json({ error: "Failed to update note" }, { status: 500 });
  }
}

export async function DELETE(req: Request, { params }: { params: { id: string } }) {
  try {
    const session = await getAuthSession();
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const note = await prisma.note.findUnique({
      where: { id: params.id },
    });

    if (!note) {
      return NextResponse.json({ error: "Note not found" }, { status: 404 });
    }

    const currentUserId = (session.user as any).id;
    const currentUserRole = (session.user as any).role;
    if (note.userId !== currentUserId && currentUserRole !== "ADMIN") {
      return NextResponse.json({ error: "Forbidden: Access denied" }, { status: 403 });
    }

    await prisma.note.delete({
      where: { id: params.id },
    });

    return NextResponse.json({ success: true, message: "Note deleted successfully" });
  } catch (error: any) {
    console.error("DELETE /api/notes/[id] error:", error);
    return NextResponse.json({ error: "Failed to delete note" }, { status: 500 });
  }
}
