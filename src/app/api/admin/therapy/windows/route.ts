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
  const window = await prisma.availabilityWindow.create({ data: parsed.data });
  return NextResponse.json({ window });
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
