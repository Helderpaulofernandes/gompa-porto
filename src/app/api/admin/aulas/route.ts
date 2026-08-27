import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { isAdminAuthenticated } from "@/lib/adminAuth";
import { uniqueSlug } from "@/lib/classSchedule";
import { findTeacherSlotConflict } from "@/lib/teacherConflicts";

const slotSchema = z
  .object({
    weekday: z.number().int().min(0).max(6).nullable().optional(),
    specificDate: z.string().nullable().optional(),
    time: z.string().regex(/^\d{2}:\d{2}$/),
  })
  .refine((s) => (s.weekday !== null && s.weekday !== undefined) !== !!s.specificDate, {
    message: "Cada horário precisa de um dia da semana (recorrente) OU uma data específica (pontual), não ambos.",
  });

const createSchema = z.object({
  name: z.string().min(2),
  description: z.string().min(1),
  capacity: z.number().int().min(1).max(500),
  dropInPriceCents: z.number().int().min(0),
  durationMinutes: z.number().int().min(15).max(240).default(60),
  roomId: z.string().min(1).nullable().optional(),
  teacherId: z.string().min(1).nullable().optional(),
  recurring: z.boolean().default(true),
  endDate: z.string().nullable().optional(),
  publicCalendar: z.boolean().default(true),
  slots: z.array(slotSchema).min(1),
});

export async function POST(req: NextRequest) {
  if (!(await isAdminAuthenticated())) {
    return NextResponse.json({ error: "Não autorizado." }, { status: 401 });
  }
  const parsed = createSchema.safeParse(await req.json().catch(() => null));
  if (!parsed.success) {
    return NextResponse.json({ error: "Dados inválidos." }, { status: 400 });
  }
  const {
    name,
    description,
    capacity,
    dropInPriceCents,
    durationMinutes,
    roomId,
    teacherId,
    recurring,
    endDate,
    publicCalendar,
    slots,
  } = parsed.data;
  const slug = await uniqueSlug(name);

  const warnings: string[] = [];
  if (teacherId) {
    for (const s of slots) {
      const warning = await findTeacherSlotConflict({
        teacherId,
        weekday: s.weekday ?? null,
        specificDate: s.specificDate ? new Date(s.specificDate) : null,
        time: s.time,
        durationMinutes,
      });
      if (warning) warnings.push(warning);
    }
  }

  const classDef = await prisma.classDefinition.create({
    data: {
      slug,
      name,
      description,
      capacity,
      dropInPriceCents,
      durationMinutes,
      roomId: roomId || null,
      teacherId: teacherId || null,
      recurring,
      endDate: endDate ? new Date(endDate) : null,
      publicCalendar,
      slots: {
        create: slots.map((s) => ({
          weekday: s.weekday ?? null,
          specificDate: s.specificDate ? new Date(s.specificDate) : null,
          time: s.time,
        })),
      },
    },
    include: { slots: true },
  });

  return NextResponse.json({
    class: classDef,
    warning: warnings.length > 0 ? [...new Set(warnings)].join(" ") : null,
  });
}

const patchSchema = z.object({
  id: z.string().min(1),
  name: z.string().min(2).optional(),
  description: z.string().min(1).optional(),
  capacity: z.number().int().min(1).max(500).optional(),
  dropInPriceCents: z.number().int().min(0).optional(),
  roomId: z.string().min(1).nullable().optional(),
  teacherId: z.string().min(1).nullable().optional(),
  endDate: z.string().nullable().optional(),
  publicCalendar: z.boolean().optional(),
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
  const { id, endDate, ...rest } = parsed.data;
  const classDef = await prisma.classDefinition.update({
    where: { id },
    data: { ...rest, ...(endDate !== undefined ? { endDate: endDate ? new Date(endDate) : null } : {}) },
  });
  return NextResponse.json({ class: classDef });
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
  const classDef = await prisma.classDefinition.findUnique({ where: { id: parsed.data.id } });
  if (!classDef) {
    return NextResponse.json({ error: "Aula não encontrada." }, { status: 404 });
  }
  const reservationCount = await prisma.seatReservation.count({ where: { classSlug: classDef.slug } });
  if (reservationCount > 0) {
    return NextResponse.json(
      { error: "Esta aula já tem reservas associadas — desative-a em vez de a remover." },
      { status: 409 }
    );
  }
  await prisma.classDefinition.delete({ where: { id: classDef.id } });
  return NextResponse.json({ ok: true });
}
