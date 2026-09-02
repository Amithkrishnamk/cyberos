import { NextResponse } from "next/server";
import { getAuthSession } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { generateWeeklyReportPdfStream } from "@/lib/pdf/renderWeeklyReportPdf";

export const dynamic = "force-dynamic";

export async function GET(req: Request, { params }: { params: { studentId: string } }) {
  try {
    const session = await getAuthSession();
    if (!session?.user || (session.user as any).role !== "ADMIN") {
      return NextResponse.json({ error: "Forbidden: Admin access required" }, { status: 403 });
    }

    const student = await prisma.user.findUnique({
      where: { id: params.studentId },
    });

    if (!student) {
      return NextResponse.json({ error: "Student not found" }, { status: 404 });
    }

    const sessions = await prisma.studySession.findMany({
      where: { userId: student.id },
      orderBy: { createdAt: "desc" },
    });

    const notesCount = await prisma.note.count({
      where: { userId: student.id },
    });

    const labsCount = await prisma.labCompletion.count({
      where: { userId: student.id },
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
      reportScope: `All-Time Report for ${student.name}`,
      startDate: student.createdAt.toLocaleDateString(),
      endDate: new Date().toLocaleDateString(),
      totalStudents: 1,
      totalHours,
      totalSessions: sessions.length,
      totalNotes: notesCount,
      totalLabs: labsCount,
      difficultiesSummary,
      sessions: sessions.map((s) => ({
        studentName: student.name,
        category: s.category || "General",
        durationMinutes: s.durationMinutes,
        startedAt: s.startedAt.toISOString(),
        contentStudied: s.contentStudied || "",
        difficulties: s.difficulties || "",
        nextSteps: s.nextSteps || "",
      })),
    });

    const sanitized = student.name.replace(/[^a-zA-Z0-9_-]/g, "_");
    const filename = `Student_Report_${sanitized}.pdf`;

    return new NextResponse(pdfStream as any, {
      headers: {
        "Content-Type": "application/pdf",
        "Content-Disposition": `attachment; filename="${filename}"`,
      },
    });
  } catch (error: any) {
    console.error("GET /api/admin/reports/[studentId]/export-pdf error:", error);
    return NextResponse.json({ error: "Failed to generate student report PDF" }, { status: 500 });
  }
}
