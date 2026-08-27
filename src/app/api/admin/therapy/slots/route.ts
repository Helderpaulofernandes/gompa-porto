import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { fromZonedTime } from "date-fns-tz";
import { prisma } from "@/lib/prisma";
import { isAdminAuthenticated } from "@/lib/adminAuth";

const TIME_ZONE = "Europe/Lisbon";

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

const bodySchema = z.object({
  teacherId: z.string().min(1),
  roomId: z.string().min(1),
  serviceSlug: z.string().min(1),
  date: z.string().min(1),
  time: z.string().min(1),
  durationMinutes: z.number().int().min(15).max(240).default(60),
});

export async function POST(req: NextRequest) {
  if (!(await isAdminAuthenticated())) {
    return NextResponse.json({ error: "Não autorizado." }, { status: 401 });
  }
  const parsed = bodySchema.safeParse(await req.json().catch(() => null));
  if (!parsed.success) {
    return NextResponse.json({ error: "Dados inválidos." }, { status: 400 });
  }
  const { teacherId, roomId, serviceSlug, date, time, durationMinutes } = parsed.data;

  const slotDate = fromZonedTime(`${date}T${time}:00`, TIME_ZONE);
  if (Number.isNaN(slotDate.getTime()) || slotDate.getTime() <= Date.now()) {
    return NextResponse.json({ error: "Data/hora inválida." }, { status: 400 });
  }

  const slot = await prisma.therapySlot.create({
    data: { teacherId, roomId, serviceSlug, date: slotDate, durationMinutes },
  });
  return NextResponse.json({ slot });
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
  const slot = await prisma.therapySlot.findUnique({ where: { id: parsed.data.id } });
  if (!slot) {
    return NextResponse.json({ error: "Horário não encontrado." }, { status: 404 });
  }
  if (slot.status !== "disponivel") {
    return NextResponse.json({ error: "Só é possível remover horários ainda disponíveis." }, { status: 409 });
  }
  await prisma.therapySlot.delete({ where: { id: slot.id } });
  return NextResponse.json({ ok: true });
}
