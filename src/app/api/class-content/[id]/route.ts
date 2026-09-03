import { NextResponse } from "next/server";
import { getAuthSession } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

export async function PUT(req: Request, { params }: { params: { id: string } }) {
  try {
    const session = await getAuthSession();
    if (!session?.user || (session.user as any).role !== "ADMIN") {
      return NextResponse.json({ error: "Forbidden: Admin privileges required" }, { status: 403 });
    }

    const body = await req.json();
    const { title, category, description, labUrl, keyNotice, classDate } = body;

    const existing = await prisma.dailyClassContent.findUnique({
      where: { id: params.id },
    });

    if (!existing) {
      return NextResponse.json({ error: "Class content record not found." }, { status: 404 });
    }

    const updated = await prisma.dailyClassContent.update({
      where: { id: params.id },
      data: {
        title: title !== undefined ? title.trim() : undefined,
        category: category !== undefined ? category : undefined,
        description: description !== undefined ? description.trim() : undefined,
        labUrl: labUrl !== undefined ? labUrl.trim() : undefined,
        keyNotice: keyNotice !== undefined ? keyNotice.trim() : undefined,
        classDate: classDate ? new Date(classDate) : undefined,
        updatedAt: new Date(),
      },
    });

    return NextResponse.json({ classContent: updated });
  } catch (error: any) {
    console.error("PUT /api/class-content/[id] error:", error);
    return NextResponse.json({ error: "Failed to update class content" }, { status: 500 });
  }
}

export async function DELETE(req: Request, { params }: { params: { id: string } }) {
  try {
    const session = await getAuthSession();
    if (!session?.user || (session.user as any).role !== "ADMIN") {
      return NextResponse.json({ error: "Forbidden: Admin privileges required" }, { status: 403 });
    }

    const existing = await prisma.dailyClassContent.findUnique({
      where: { id: params.id },
    });

    if (!existing) {
      return NextResponse.json({ error: "Class content record not found." }, { status: 404 });
    }

    await prisma.dailyClassContent.delete({
      where: { id: params.id },
    });

    return NextResponse.json({ message: "Class content deleted successfully." });
  } catch (error: any) {
    console.error("DELETE /api/class-content/[id] error:", error);
    return NextResponse.json({ error: "Failed to delete class content" }, { status: 500 });
  }
}
