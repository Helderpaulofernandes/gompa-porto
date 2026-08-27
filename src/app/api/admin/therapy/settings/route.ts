import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { isAdminAuthenticated } from "@/lib/adminAuth";

export async function GET() {
  if (!(await isAdminAuthenticated())) {
    return NextResponse.json({ error: "Não autorizado." }, { status: 401 });
  }
  const settings = await prisma.therapySettings.findUnique({ where: { id: "singleton" } });
  return NextResponse.json({
    settings: settings ?? { id: "singleton", breakMinutes: 15, lunchStart: null, lunchEnd: null },
  });
}

const bodySchema = z.object({
  breakMinutes: z.number().int().min(0).max(180),
  lunchStart: z.string().regex(/^\d{2}:\d{2}$/).nullable(),
  lunchEnd: z.string().regex(/^\d{2}:\d{2}$/).nullable(),
});

export async function PATCH(req: NextRequest) {
  if (!(await isAdminAuthenticated())) {
    return NextResponse.json({ error: "Não autorizado." }, { status: 401 });
  }
  const parsed = bodySchema.safeParse(await req.json().catch(() => null));
  if (!parsed.success) {
    return NextResponse.json({ error: "Dados inválidos." }, { status: 400 });
  }
  const { breakMinutes, lunchStart, lunchEnd } = parsed.data;
  if (lunchStart && lunchEnd && lunchStart >= lunchEnd) {
    return NextResponse.json({ error: "A pausa de almoço deve começar antes de acabar." }, { status: 400 });
  }
  const settings = await prisma.therapySettings.upsert({
    where: { id: "singleton" },
    update: { breakMinutes, lunchStart, lunchEnd },
    create: { id: "singleton", breakMinutes, lunchStart, lunchEnd },
  });
  return NextResponse.json({ settings });
}
