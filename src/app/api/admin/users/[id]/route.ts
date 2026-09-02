import { NextResponse } from "next/server";
import { getAuthSession } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

export async function DELETE(req: Request, { params }: { params: { id: string } }) {
  try {
    const session = await getAuthSession();
    if (!session?.user || (session.user as any).role !== "ADMIN") {
      return NextResponse.json({ error: "Forbidden: Admin access required" }, { status: 403 });
    }

    const currentUserId = (session.user as any).id;

    // Self-delete guardrail: Admin cannot delete their own active account
    if (params.id === currentUserId) {
      return NextResponse.json(
        { error: "Forbidden: An admin cannot delete their own active account." },
        { status: 400 }
      );
    }

    const targetUser = await prisma.user.findUnique({
      where: { id: params.id },
    });

    if (!targetUser) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    // Cascade deletion removes linked notes, sessions, and labs automatically
    await prisma.user.delete({
      where: { id: params.id },
    });

    return NextResponse.json({
      success: true,
      message: `User ${targetUser.email} and all associated data permanently deleted.`,
    });
  } catch (error: any) {
    console.error("DELETE /api/admin/users/[id] error:", error);
    return NextResponse.json({ error: "Failed to delete user account" }, { status: 500 });
  }
}
