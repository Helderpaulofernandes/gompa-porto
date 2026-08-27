import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { isAdminAuthenticated } from "@/lib/adminAuth";
import { uniqueSlug } from "@/lib/classSchedule";

const slotSchema = z.object({
  weekday: z.number().int().min(0).max(6),
  time: z.string().regex(/^\d{2}:\d{2}$/),
});

const createSchema = z.object({
  name: z.string().min(2),
  description: z.string().min(1),
  capacity: z.number().int().min(1).max(500),
  dropInPriceCents: z.number().int().min(0),
  durationMinutes: z.number().int().min(15).max(240).default(60),
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
  const { name, description, capacity, dropInPriceCents, durationMinutes, slots } = parsed.data;
  const slug = await uniqueSlug(name);

  const classDef = await prisma.classDefinition.create({
    data: {
      slug,
      name,
      description,
      capacity,
      dropInPriceCents,
      durationMinutes,
      slots: { create: slots },
    },
    include: { slots: true },
  });

  return NextResponse.json({ class: classDef });
}

const patchSchema = z.object({
  id: z.string().min(1),
  name: z.string().min(2).optional(),
  description: z.string().min(1).optional(),
  capacity: z.number().int().min(1).max(500).optional(),
  dropInPriceCents: z.number().int().min(0).optional(),
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
  const classDef = await prisma.classDefinition.update({ where: { id }, data });
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
