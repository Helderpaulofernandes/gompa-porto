import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { isAdminAuthenticated } from "@/lib/adminAuth";

export async function GET() {
  if (!(await isAdminAuthenticated())) {
    return NextResponse.json({ error: "Não autorizado." }, { status: 401 });
  }
  const teachers = await prisma.teacher.findMany({ orderBy: { createdAt: "asc" } });
  return NextResponse.json({ teachers });
}

const bodySchema = z.object({
  name: z.string().min(2),
  services: z.array(z.string()).default([]),
});

export async function POST(req: NextRequest) {
  if (!(await isAdminAuthenticated())) {
    return NextResponse.json({ error: "Não autorizado." }, { status: 401 });
  }
  const parsed = bodySchema.safeParse(await req.json().catch(() => null));
  if (!parsed.success) {
    return NextResponse.json({ error: "Nome inválido." }, { status: 400 });
  }
  const teacher = await prisma.teacher.create({ data: parsed.data });
  return NextResponse.json({ teacher });
}

const patchSchema = z.object({
  id: z.string().min(1),
  name: z.string().min(2).optional(),
  active: z.boolean().optional(),
  services: z.array(z.string()).optional(),
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
  const teacher = await prisma.teacher.update({ where: { id }, data });
  return NextResponse.json({ teacher });
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
  const slotCount = await prisma.therapySlot.count({ where: { teacherId: parsed.data.id } });
  if (slotCount > 0) {
    return NextResponse.json(
      { error: "Este professor já tem horários associados — desative-o em vez de o remover." },
      { status: 409 }
    );
  }
  await prisma.teacher.delete({ where: { id: parsed.data.id } });
  return NextResponse.json({ ok: true });
}
