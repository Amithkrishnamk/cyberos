import { notFound } from "next/navigation";
import { getAuthSession } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import NoteEditor from "@/components/editor/NoteEditor";

export default async function NoteEditorPage({ params }: { params: { id: string } }) {
  const session = await getAuthSession();
  if (!session?.user) return notFound();

  const note = await prisma.note.findUnique({
    where: { id: params.id },
  });

  if (!note) return notFound();

  // Verify access control
  const currentUserId = (session.user as any).id;
  const currentUserRole = (session.user as any).role;
  if (note.userId !== currentUserId && currentUserRole !== "ADMIN") {
    return notFound();
  }

  return <NoteEditor initialNote={note as any} />;
}
