import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { getAuthSession } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const session = await getAuthSession();
    if (!session?.user || (session.user as any).role !== "ADMIN") {
      return NextResponse.json({ error: "Forbidden: Admin access required" }, { status: 403 });
    }

    const users = await prisma.user.findMany({
      include: {
        notes: { select: { id: true } },
        studySessions: { select: { durationMinutes: true } },
        labCompletions: { select: { id: true } },
      },
      orderBy: { createdAt: "desc" },
    });

    const sanitizedUsers = users.map((u) => {
      const totalMinutes = u.studySessions.reduce((acc, s) => acc + (s.durationMinutes || 0), 0);
      const totalHours = Math.round((totalMinutes / 60) * 10) / 10;

      return {
        id: u.id,
        name: u.name,
        email: u.email,
        role: u.role,
        theme: u.theme,
        createdAt: u.createdAt,
        stats: {
          notesCount: u.notes.length,
          labsCount: u.labCompletions.length,
          studyHours: totalHours,
        },
      };
    });

    return NextResponse.json({ users: sanitizedUsers });
  } catch (error: any) {
    console.error("GET /api/admin/users error:", error);
    return NextResponse.json({ error: "Failed to fetch users" }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const session = await getAuthSession();
    if (!session?.user || (session.user as any).role !== "ADMIN") {
      return NextResponse.json({ error: "Forbidden: Admin access required" }, { status: 403 });
    }

    const body = await req.json();
    const { name, email, password, role } = body;

    if (!name || !email || !password) {
      return NextResponse.json(
        { error: "Name, email, and password are required" },
        { status: 400 }
      );
    }

    if (password.length < 6) {
      return NextResponse.json(
        { error: "Password must be at least 6 characters long" },
        { status: 400 }
      );
    }

    const assignedRole = role === "ADMIN" ? "ADMIN" : "STUDENT";
    const cleanEmail = email.toLowerCase().trim();

    const existingUser = await prisma.user.findUnique({
      where: { email: cleanEmail },
    });

    if (existingUser) {
      return NextResponse.json(
        { error: "An account with this email already exists" },
        { status: 409 }
      );
    }

    const passwordHash = await bcrypt.hash(password, 10);

    const newUser = await prisma.user.create({
      data: {
        name: name.trim(),
        email: cleanEmail,
        passwordHash,
        role: assignedRole,
        theme: "cyan",
      },
    });

    return NextResponse.json(
      {
        user: {
          id: newUser.id,
          name: newUser.name,
          email: newUser.email,
          role: newUser.role,
          createdAt: newUser.createdAt,
        },
      },
      { status: 201 }
    );
  } catch (error: any) {
    console.error("POST /api/admin/users error:", error);
    return NextResponse.json({ error: "Failed to create user" }, { status: 500 });
  }
}
