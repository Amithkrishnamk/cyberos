import { NextResponse } from "next/server";
import { getAuthSession } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

export async function DELETE(req: Request, { params }: { params: { id: string } }) {
  try {
    const session = await getAuthSession();
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const currentUserId = (session.user as any).id;
    const currentUserRole = (session.user as any).role;

    const studySession = await prisma.studySession.findUnique({
      where: { id: params.id },
    });

    if (!studySession) {
      return NextResponse.json({ error: "Study session not found" }, { status: 404 });
    }

    // Only Admin or the session owner can delete a study session record
    if (currentUserRole !== "ADMIN" && studySession.userId !== currentUserId) {
      return NextResponse.json({ error: "Forbidden: Admin privileges required to delete student session reflections" }, { status: 403 });
    }

    await prisma.studySession.delete({
      where: { id: params.id },
    });

    return NextResponse.json({ message: "Study session reflection deleted successfully." });
  } catch (error: any) {
    console.error("DELETE /api/sessions/[id] error:", error);
    return NextResponse.json({ error: "Failed to delete study session reflection" }, { status: 500 });
  }
}
