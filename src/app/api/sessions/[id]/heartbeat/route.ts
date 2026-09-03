import { NextResponse } from "next/server";
import { getAuthSession } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function PATCH(req: Request, { params }: { params: { id: string } }) {
  try {
    const session = await getAuthSession();
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const studySession = await prisma.studySession.findUnique({
      where: { id: params.id },
    });

    if (!studySession) {
      return NextResponse.json({ error: "Session not found" }, { status: 404 });
    }

    if (studySession.userId !== (session.user as any).id) {
      return NextResponse.json({ error: "Forbidden: Access denied" }, { status: 403 });
    }

    const now = new Date();

    // Throttling: reject heartbeat if last ping was less than 15 seconds ago to prevent DB spam
    if (studySession.lastHeartbeatAt) {
      const secondsSinceLastPing = (now.getTime() - new Date(studySession.lastHeartbeatAt).getTime()) / 1000;
      if (secondsSinceLastPing < 15) {
        return NextResponse.json({
          success: true,
          throttled: true,
          lastHeartbeatAt: studySession.lastHeartbeatAt,
        });
      }
    }

    const updated = await prisma.studySession.update({
      where: { id: params.id },
      data: {
        lastHeartbeatAt: now,
      },
    });

    return NextResponse.json({ success: true, lastHeartbeatAt: updated.lastHeartbeatAt });
  } catch (error: any) {
    console.error("PATCH /api/sessions/[id]/heartbeat error:", error);
    return NextResponse.json({ error: "Heartbeat update failed" }, { status: 500 });
  }
}
