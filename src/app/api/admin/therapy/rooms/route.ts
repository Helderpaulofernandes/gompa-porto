import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { isAdminAuthenticated } from "@/lib/adminAuth";

export async function GET() {
  if (!(await isAdminAuthenticated())) {
    return NextResponse.json({ error: "Não autorizado." }, { status: 401 });
  }
  const rooms = await prisma.room.findMany({ orderBy: { createdAt: "asc" } });
  return NextResponse.json({ rooms });
}

const bodySchema = z.object({ name: z.string().min(2) });

export async function POST(req: NextRequest) {
  if (!(await isAdminAuthenticated())) {
    return NextResponse.json({ error: "Não autorizado." }, { status: 401 });
  }
  const parsed = bodySchema.safeParse(await req.json().catch(() => null));
  if (!parsed.success) {
    return NextResponse.json({ error: "Nome inválido." }, { status: 400 });
  }
  const room = await prisma.room.create({ data: { name: parsed.data.name } });
  return NextResponse.json({ room });
}

const patchSchema = z.object({
  id: z.string().min(1),
  name: z.string().min(2).optional(),
  active: z.boolean().optional(),
});

export async function PATCH(req: NextRequest) {
  if (!(await isAdminAuthenticated())) {
    return NextResponse.json({ error: "Não autorizado." }, { status: 401 });
  }
  const parsed = patchSchema.safeParse(await req.json().catch(() => null));
  if (!parsed.success) {
    return NextResponse.json({ error: "Dados inválidos." }, { status: 400 });
  }
  const { id, ...data } = parsed.data;
  const room = await prisma.room.update({ where: { id }, data });
  return NextResponse.json({ room });
}

const deleteSchema = z.object({ id: z.string().min(1) });

export async function DELETE(req: NextRequest) {
  if (!(await isAdminAuthenticated())) {
    return NextResponse.json({ error: "Não autorizado." }, { status: 401 });
  }
  const parsed = deleteSchema.safeParse(await req.json().catch(() => null));
  if (!parsed.success) {
    return NextResponse.json({ error: "Dados inválidos." }, { status: 400 });
  }
  const slotCount = await prisma.therapySlot.count({ where: { roomId: parsed.data.id } });
  if (slotCount > 0) {
    return NextResponse.json(
      { error: "Esta sala já tem horários associados — desative-a em vez de a remover." },
      { status: 409 }
    );
  }
  await prisma.room.delete({ where: { id: parsed.data.id } });
  return NextResponse.json({ ok: true });
}
