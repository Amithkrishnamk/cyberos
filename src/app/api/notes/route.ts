import { NextResponse } from "next/server";
import { getAuthSession } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

export async function GET(req: Request) {
  try {
    const session = await getAuthSession();
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const category = searchParams.get("category");
    const targetUserId = searchParams.get("userId");

    // Enforce security rule: non-admins can only query their own notes
    let userIdToQuery = (session.user as any).id;
    if (targetUserId && (session.user as any).role === "ADMIN") {
      userIdToQuery = targetUserId;
    }

    const whereClause: any = { userId: userIdToQuery };
    if (category && category !== "All Pages") {
      whereClause.category = category;
    }

    const notes = await prisma.note.findMany({
      where: whereClause,
      orderBy: { updatedAt: "desc" },
    });

    return NextResponse.json({ notes });
  } catch (error: any) {
    console.error("GET /api/notes error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const session = await getAuthSession();
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();
    const { title, category, tags, content, icon, coverImage, description } = body;

    const note = await prisma.note.create({
      data: {
        userId: (session.user as any).id,
        title: title || "Untitled Note",
        category: category || "Web Security",
        tags: typeof tags === "string" ? tags : JSON.stringify(tags || []),
        content: typeof content === "string" ? content : JSON.stringify(content || []),
        icon: icon || "📝",
        coverImage: coverImage || "linear-gradient(to r, #0f172a, #1e293b, #0f172a)",
        description: description || "",
      },
    });

    return NextResponse.json({ note }, { status: 201 });
  } catch (error: any) {
    console.error("POST /api/notes error:", error);
    return NextResponse.json({ error: "Failed to create note" }, { status: 500 });
  }
}
