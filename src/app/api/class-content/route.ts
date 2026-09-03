import { NextResponse } from "next/server";
import { getAuthSession } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

const INITIAL_SEED_CLASS = {
  title: "Web Security: Advanced SQL Injection & Union Exploitation",
  category: "Web Security",
  description: "Today's focus: Identifying column counts using UNION NULL injection, extracting database metadata, and practicing PortSwigger SQLi labs.",
  labUrl: "https://portswigger.net/web-security/sql-injection",
  keyNotice: "Please log your study session timer and submit your mandatory end-of-session reflection log after completing today's lab.",
  classDate: new Date(),
};

export async function GET() {
  try {
    const session = await getAuthSession();
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    let classContents = await prisma.dailyClassContent.findMany({
      orderBy: { classDate: "desc" },
    });

    if (classContents.length === 0) {
      const initial = await prisma.dailyClassContent.create({
        data: INITIAL_SEED_CLASS,
      });
      classContents = [initial];
    }

    return NextResponse.json({ classContents, latestClass: classContents[0] });
  } catch (error: any) {
    console.error("GET /api/class-content error:", error);
    return NextResponse.json({ error: "Failed to fetch class content list" }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const session = await getAuthSession();
    if (!session?.user || (session.user as any).role !== "ADMIN") {
      return NextResponse.json({ error: "Forbidden: Admin privileges required" }, { status: 403 });
    }

    const body = await req.json();
    const { title, category, description, labUrl, keyNotice, classDate } = body;

    if (!title || !description) {
      return NextResponse.json({ error: "Title and description are required." }, { status: 400 });
    }

    const newClassContent = await prisma.dailyClassContent.create({
      data: {
        title: title.trim(),
        category: category || "Web Security",
        description: description.trim(),
        labUrl: labUrl ? labUrl.trim() : "",
        keyNotice: keyNotice ? keyNotice.trim() : "",
        classDate: classDate ? new Date(classDate) : new Date(),
      },
    });

    return NextResponse.json({ classContent: newClassContent }, { status: 201 });
  } catch (error: any) {
    console.error("POST /api/class-content error:", error);
    return NextResponse.json({ error: "Failed to create class content" }, { status: 500 });
  }
}
