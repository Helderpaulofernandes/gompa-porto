import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { isAdminAuthenticated } from "@/lib/adminAuth";
import { findTeacherSlotConflict } from "@/lib/teacherConflicts";

const bodySchema = z
  .object({
    classId: z.string().min(1),
    weekday: z.number().int().min(0).max(6).nullable().optional(),
    specificDate: z.string().nullable().optional(),
    time: z.string().regex(/^\d{2}:\d{2}$/),
  })
  .refine((s) => (s.weekday !== null && s.weekday !== undefined) !== !!s.specificDate, {
    message: "Indique um dia da semana (recorrente) OU uma data específica (pontual), não ambos.",
  });

export async function POST(req: NextRequest) {
  if (!(await isAdminAuthenticated())) {
    return NextResponse.json({ error: "Não autorizado." }, { status: 401 });
  }
  const parsed = bodySchema.safeParse(await req.json().catch(() => null));
  if (!parsed.success) {
    return NextResponse.json({ error: "Dados inválidos." }, { status: 400 });
  }
  const { classId, weekday, specificDate, time } = parsed.data;

  const classDef = await prisma.classDefinition.findUnique({ where: { id: classId } });
  if (!classDef) {
    return NextResponse.json({ error: "Aula não encontrada." }, { status: 404 });
  }

  let warning: string | null = null;
  if (classDef.teacherId) {
    warning = await findTeacherSlotConflict({
      teacherId: classDef.teacherId,
      weekday: weekday ?? null,
      specificDate: specificDate ? new Date(specificDate) : null,
      time,
      durationMinutes: classDef.durationMinutes,
      excludeClassId: classDef.id,
    });
  }

  const slot = await prisma.classSlotDef.create({
    data: {
      classId,
      weekday: weekday ?? null,
      specificDate: specificDate ? new Date(specificDate) : null,
      time,
    },
  });
  return NextResponse.json({ slot, warning });
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
  await prisma.classSlotDef.delete({ where: { id: parsed.data.id } });
  return NextResponse.json({ ok: true });
}
