import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { isAdminAuthenticated } from "@/lib/adminAuth";
import { getClassSchedule } from "@/lib/classSchedule";

const bodySchema = z.object({
  slug: z.string().min(1),
  capacity: z.number().int().min(0).max(500),
});

export async function POST(req: NextRequest) {
  if (!(await isAdminAuthenticated())) {
    return NextResponse.json({ error: "Não autorizado." }, { status: 401 });
  }

  const parsed = bodySchema.safeParse(await req.json().catch(() => null));
  if (!parsed.success) {
    return NextResponse.json({ error: "Dados inválidos." }, { status: 400 });
  }

  const { slug, capacity } = parsed.data;
  if (!getClassSchedule(slug)) {
    return NextResponse.json({ error: "Aula não encontrada." }, { status: 404 });
  }

  await prisma.classConfig.upsert({
    where: { slug },
    update: { capacity },
    create: { slug, capacity },
  });

  return NextResponse.json({ ok: true });
}
