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

    const labs = await prisma.labCompletion.findMany({
      where: { userId: userIdToQuery },
      orderBy: { completedAt: "desc" },
    });

    return NextResponse.json({ labs });
  } catch (error: any) {
    console.error("GET /api/labs error:", error);
    return NextResponse.json({ error: "Failed to fetch lab completions" }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const session = await getAuthSession();
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();
    const { labName, notes } = body;

    if (!labName) {
      return NextResponse.json({ error: "Lab name is required" }, { status: 400 });
    }

    const lab = await prisma.labCompletion.create({
      data: {
        userId: (session.user as any).id,
        labName: labName.trim(),
        notes: notes || "",
      },
    });

    return NextResponse.json({ lab }, { status: 201 });
  } catch (error: any) {
    console.error("POST /api/labs error:", error);
    return NextResponse.json({ error: "Failed to create lab completion" }, { status: 500 });
  }
}
