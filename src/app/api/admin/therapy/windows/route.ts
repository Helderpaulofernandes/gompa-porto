import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { isAdminAuthenticated } from "@/lib/adminAuth";

export async function GET() {
  if (!(await isAdminAuthenticated())) {
    return NextResponse.json({ error: "Não autorizado." }, { status: 401 });
  }
  const windows = await prisma.availabilityWindow.findMany({
    include: { teacher: true, room: true },
    orderBy: [{ weekday: "asc" }, { startTime: "asc" }],
  });
  return NextResponse.json({ windows });
}

const bodySchema = z.object({
  teacherId: z.string().min(1),
  roomId: z.string().min(1),
  weekday: z.number().int().min(0).max(6),
  startTime: z.string().regex(/^\d{2}:\d{2}$/),
  endTime: z.string().regex(/^\d{2}:\d{2}$/),
});

export async function POST(req: NextRequest) {
  if (!(await isAdminAuthenticated())) {
    return NextResponse.json({ error: "Não autorizado." }, { status: 401 });
  }
  const parsed = bodySchema.safeParse(await req.json().catch(() => null));
  if (!parsed.success) {
    return NextResponse.json({ error: "Dados inválidos." }, { status: 400 });
  }
  if (parsed.data.startTime >= parsed.data.endTime) {
    return NextResponse.json({ error: "A hora de início deve ser antes da hora de fim." }, { status: 400 });
  }
  const { teacherId, weekday, startTime, endTime } = parsed.data;

  // Non-blocking heads-up: does this teacher already teach a class that overlaps this window?
  const clashingSlots = await prisma.classSlotDef.findMany({
    where: { weekday, class: { teacherId, active: true } },
    include: { class: true },
  });
  const overlapsWindow = (time: string, durationMinutes: number) => {
    const [h, m] = time.split(":").map(Number);
    const startMin = h * 60 + m;
    const endMin = startMin + durationMinutes;
    const [wsH, wsM] = startTime.split(":").map(Number);
    const [weH, weM] = endTime.split(":").map(Number);
    const winStart = wsH * 60 + wsM;
    const winEnd = weH * 60 + weM;
    return startMin < winEnd && winStart < endMin;
  };
  const conflicts = clashingSlots
    .filter((cs) => overlapsWindow(cs.time, cs.class.durationMinutes))
    .map((cs) => `${cs.class.name} às ${cs.time}`);

  const window = await prisma.availabilityWindow.create({ data: parsed.data });
  return NextResponse.json({
    window,
    warning:
      conflicts.length > 0
        ? `Este professor já tem aula(s) marcada(s) dentro desta janela: ${conflicts.join(", ")}. Esses horários não aparecerão como disponíveis para clientes.`
        : null,
  });
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
  await prisma.availabilityWindow.delete({ where: { id: parsed.data.id } });
  return NextResponse.json({ ok: true });
}
