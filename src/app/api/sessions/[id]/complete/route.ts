import { NextResponse } from "next/server";
import { getAuthSession } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function POST(req: Request, { params }: { params: { id: string } }) {
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
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const body = await req.json();
    const { contentStudied, difficulties, nextSteps, endedAt: clientEndedAt } = body;

    const endedAt = clientEndedAt ? new Date(clientEndedAt) : new Date();
    const startedAt = new Date(studySession.startedAt);

    // Calculate duration in minutes server-side from timestamps
    const diffMs = endedAt.getTime() - startedAt.getTime();
    const durationMinutes = Math.max(1, Math.round(diffMs / (60 * 1000)));

    const updatedSession = await prisma.studySession.update({
      where: { id: params.id },
      data: {
        endedAt,
        durationMinutes,
        contentStudied: contentStudied || "Study session completed.",
        difficulties: difficulties || null,
        nextSteps: nextSteps || null,
      },
    });

    // If session was linked to a Note, update Note's timeStudiedMinutes
    if (studySession.linkedNoteId) {
      const linkedNote = await prisma.note.findUnique({
        where: { id: studySession.linkedNoteId },
      });

      if (linkedNote) {
        await prisma.note.update({
          where: { id: linkedNote.id },
          data: {
            timeStudiedMinutes: linkedNote.timeStudiedMinutes + durationMinutes,
          },
        });
      }
    }

    return NextResponse.json({ studySession: updatedSession });
  } catch (error: any) {
    console.error("POST /api/sessions/[id]/complete error:", error);
    return NextResponse.json({ error: "Failed to complete study session" }, { status: 500 });
  }
}
