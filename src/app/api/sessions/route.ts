import { NextResponse } from "next/server";
import { getAuthSession } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET(req: Request) {
  try {
    const session = await getAuthSession();
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const targetUserId = searchParams.get("userId");

    let userIdToQuery = (session.user as any).id;
    if (targetUserId && (session.user as any).role === "ADMIN") {
      userIdToQuery = targetUserId;
    }

    // Auto-recovery check: close abandoned sessions older than 2 minutes without recent heartbeats
    const twoMinutesAgo = new Date(Date.now() - 2 * 60 * 1000);
    const abandonedSessions = await prisma.studySession.findMany({
      where: {
        userId: userIdToQuery,
        endedAt: null,
        lastHeartbeatAt: { lt: twoMinutesAgo },
      },
    });

    for (const abandoned of abandonedSessions) {
      const startMs = new Date(abandoned.startedAt).getTime();
      const endMs = abandoned.lastHeartbeatAt ? new Date(abandoned.lastHeartbeatAt).getTime() : startMs + 60000;
      const durationMinutes = Math.max(1, Math.round((endMs - startMs) / (60 * 1000)));

      await prisma.studySession.update({
        where: { id: abandoned.id },
        data: {
          endedAt: abandoned.lastHeartbeatAt || new Date(),
          durationMinutes,
          difficulties: abandoned.difficulties || "Session auto-recovered after browser/tab disconnect.",
        },
      });
    }

    const sessions = await prisma.studySession.findMany({
      where: { userId: userIdToQuery },
      include: {
        linkedNote: {
          select: { id: true, title: true, category: true },
        },
      },
      orderBy: { createdAt: "desc" },
    });

    // Also check if there is an active session in progress right now
    const activeSession = await prisma.studySession.findFirst({
      where: {
        userId: userIdToQuery,
        endedAt: null,
      },
      orderBy: { createdAt: "desc" },
    });

    return NextResponse.json({ sessions, activeSession });
  } catch (error: any) {
    console.error("GET /api/sessions error:", error);
    return NextResponse.json({ error: "Failed to fetch study sessions" }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const session = await getAuthSession();
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();
    const { linkedNoteId, category } = body;
    const now = new Date();

    // Check if user already has an active session in progress; if so, return it
    const existingActive = await prisma.studySession.findFirst({
      where: {
        userId: (session.user as any).id,
        endedAt: null,
      },
    });

    if (existingActive) {
      return NextResponse.json({ studySession: existingActive });
    }

    const studySession = await prisma.studySession.create({
      data: {
        userId: (session.user as any).id,
        linkedNoteId: linkedNoteId || null,
        category: category || "General",
        startedAt: now,
        lastHeartbeatAt: now,
        endedAt: null,
        durationMinutes: 0,
      },
    });

    return NextResponse.json({ studySession }, { status: 201 });
  } catch (error: any) {
    console.error("POST /api/sessions error:", error);
    return NextResponse.json({ error: "Failed to start study session" }, { status: 500 });
  }
}
