import { NextResponse } from "next/server";
import { getAuthSession } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

const DEFAULT_CLASS_CONTENT = {
  id: "today-class",
  title: "Web Security: Advanced SQL Injection & Union Exploitation",
  category: "Web Security",
  description: "Today's focus: Identifying column counts using UNION NULL injection, extracting database metadata, and practicing PortSwigger SQLi labs.",
  labUrl: "https://portswigger.net/web-security/sql-injection",
  keyNotice: "Please log your study session timer and submit your mandatory end-of-session reflection log after completing today's lab.",
};

export async function GET() {
  try {
    const session = await getAuthSession();
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    let classContent = await prisma.classContent.findUnique({
      where: { id: "today-class" },
    });

    if (!classContent) {
      classContent = await prisma.classContent.create({
        data: DEFAULT_CLASS_CONTENT,
      });
    }

    return NextResponse.json({ classContent });
  } catch (error: any) {
    console.error("GET /api/class-content error:", error);
    return NextResponse.json({ error: "Failed to fetch class content" }, { status: 500 });
  }
}

export async function PUT(req: Request) {
  try {
    const session = await getAuthSession();
    if (!session?.user || (session.user as any).role !== "ADMIN") {
      return NextResponse.json({ error: "Forbidden: Admin privileges required" }, { status: 403 });
    }

    const body = await req.json();
    const { title, category, description, labUrl, keyNotice } = body;

    const classContent = await prisma.classContent.upsert({
      where: { id: "today-class" },
      update: {
        title: title !== undefined ? title.trim() : undefined,
        category: category !== undefined ? category : undefined,
        description: description !== undefined ? description.trim() : undefined,
        labUrl: labUrl !== undefined ? labUrl.trim() : undefined,
        keyNotice: keyNotice !== undefined ? keyNotice.trim() : undefined,
        updatedAt: new Date(),
      },
      create: {
        id: "today-class",
        title: title ? title.trim() : DEFAULT_CLASS_CONTENT.title,
        category: category || DEFAULT_CLASS_CONTENT.category,
        description: description ? description.trim() : DEFAULT_CLASS_CONTENT.description,
        labUrl: labUrl ? labUrl.trim() : DEFAULT_CLASS_CONTENT.labUrl,
        keyNotice: keyNotice ? keyNotice.trim() : DEFAULT_CLASS_CONTENT.keyNotice,
      },
    });

    return NextResponse.json({ classContent });
  } catch (error: any) {
    console.error("PUT /api/class-content error:", error);
    return NextResponse.json({ error: "Failed to update class content" }, { status: 500 });
  }
}
