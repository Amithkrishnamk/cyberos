import { notFound, redirect } from "next/navigation";
import { getAuthSession } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import NoteEditor from "@/components/editor/NoteEditor";

export const dynamic = "force-dynamic";

export default async function NoteEditorPage({ params }: { params: { id: string } }) {
  const session = await getAuthSession();
  if (!session?.user) return notFound();

  const currentUserRole = (session.user as any).role;

  // Note editor access is restricted exclusively to Admin accounts
  if (currentUserRole !== "ADMIN") {
    redirect("/notes");
  }

  const note = await prisma.note.findUnique({
    where: { id: params.id },
  });

  if (!note) return notFound();

  return <NoteEditor initialNote={note as any} />;
}
