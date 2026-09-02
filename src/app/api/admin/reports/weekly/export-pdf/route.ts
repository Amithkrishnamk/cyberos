import { NextResponse } from "next/server";
import { getAuthSession } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { generateWeeklyReportPdfStream } from "@/lib/pdf/renderWeeklyReportPdf";

export const dynamic = "force-dynamic";

export async function GET(req: Request) {
  try {
    const session = await getAuthSession();
    if (!session?.user || (session.user as any).role !== "ADMIN") {
      return NextResponse.json({ error: "Forbidden: Admin access required" }, { status: 403 });
    }

    const { searchParams } = new URL(req.url);
    const studentId = searchParams.get("studentId");
    const days = Number(searchParams.get("days")) || 7;

    const startDate = new Date(Date.now() - days * 24 * 60 * 60 * 1000);
    const endDate = new Date();

    const userWhere = studentId ? { id: studentId } : { role: "STUDENT" };
    const targetUsers = await prisma.user.findMany({ where: userWhere });

    const userIds = targetUsers.map((u) => u.id);

    const sessions = await prisma.studySession.findMany({
      where: {
        userId: { in: userIds },
        startedAt: { gte: startDate },
      },
      include: { user: { select: { name: true } } },
      orderBy: { startedAt: "desc" },
    });

    const notesCount = await prisma.note.count({
      where: {
        userId: { in: userIds },
        createdAt: { gte: startDate },
      },
    });

    const labsCount = await prisma.labCompletion.count({
      where: {
        userId: { in: userIds },
        completedAt: { gte: startDate },
      },
    });

    const totalMinutes = sessions.reduce((acc, s) => acc + (s.durationMinutes || 0), 0);
    const totalHours = Math.round((totalMinutes / 60) * 10) / 10;

    const diffMap: Record<string, number> = {};
    sessions.forEach((s) => {
      if (s.difficulties && s.difficulties.trim().length > 0) {
        const cat = s.category || "General";
        diffMap[cat] = (diffMap[cat] || 0) + 1;
      }
    });

    const difficultiesSummary = Object.entries(diffMap).map(([category, count]) => ({
      category,
      count,
    }));

    const pdfStream = await generateWeeklyReportPdfStream({
      reportScope: studentId && targetUsers[0] ? targetUsers[0].name : "All Organization Students",
      startDate: startDate.toLocaleDateString(),
      endDate: endDate.toLocaleDateString(),
      totalStudents: targetUsers.length,
      totalHours,
      totalSessions: sessions.length,
      totalNotes: notesCount,
      totalLabs: labsCount,
      difficultiesSummary,
      sessions: sessions.map((s) => ({
        studentName: s.user?.name || "Student",
        category: s.category || "General",
        durationMinutes: s.durationMinutes,
        startedAt: s.startedAt.toISOString(),
        contentStudied: s.contentStudied || "",
        difficulties: s.difficulties || "",
        nextSteps: s.nextSteps || "",
      })),
    });

    const filename = `Weekly_Report_${days}Days.pdf`;

    return new NextResponse(pdfStream as any, {
      headers: {
        "Content-Type": "application/pdf",
        "Content-Disposition": `attachment; filename="${filename}"`,
      },
    });
  } catch (error: any) {
    console.error("GET /api/admin/reports/weekly/export-pdf error:", error);
    return NextResponse.json({ error: "Failed to generate weekly report PDF" }, { status: 500 });
  }
}
