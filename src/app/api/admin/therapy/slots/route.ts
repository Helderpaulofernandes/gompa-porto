import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { isAdminAuthenticated } from "@/lib/adminAuth";

export async function GET() {
  if (!(await isAdminAuthenticated())) {
    return NextResponse.json({ error: "Não autorizado." }, { status: 401 });
  }
  const slots = await prisma.therapySlot.findMany({
    where: { date: { gte: new Date() } },
    orderBy: { date: "asc" },
    include: { teacher: true, room: true },
  });
  return NextResponse.json({ slots });
}

const deleteSchema = z.object({ id: z.string().min(1) });

/**
 * Cancela uma marcação de terapia (disponibiliza de novo esse horário).
 * Usado quando um cliente pede para cancelar por telefone/email.
 */
export async function DELETE(req: NextRequest) {
  if (!(await isAdminAuthenticated())) {
    return NextResponse.json({ error: "Não autorizado." }, { status: 401 });
  }
  const parsed = deleteSchema.safeParse(await req.json().catch(() => null));
  if (!parsed.success) {
    return NextResponse.json({ error: "Dados inválidos." }, { status: 400 });
  }
  const slot = await prisma.therapySlot.findUnique({ where: { id: parsed.data.id } });
  if (!slot) {
    return NextResponse.json({ error: "Marcação não encontrada." }, { status: 404 });
  }
  await prisma.therapySlot.delete({ where: { id: slot.id } });
  return NextResponse.json({ ok: true });
}
