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

const bodySchema = z.object({ name: z.string().min(2) });

export async function POST(req: NextRequest) {
  if (!(await isAdminAuthenticated())) {
    return NextResponse.json({ error: "Não autorizado." }, { status: 401 });
  }
  const parsed = bodySchema.safeParse(await req.json().catch(() => null));
  if (!parsed.success) {
    return NextResponse.json({ error: "Nome inválido." }, { status: 400 });
  }
  const teacher = await prisma.teacher.create({ data: { name: parsed.data.name } });
  return NextResponse.json({ teacher });
}

const patchSchema = z.object({ id: z.string(), active: z.boolean() });

export async function PATCH(req: NextRequest) {
  if (!(await isAdminAuthenticated())) {
    return NextResponse.json({ error: "Não autorizado." }, { status: 401 });
  }
  const parsed = patchSchema.safeParse(await req.json().catch(() => null));
  if (!parsed.success) {
    return NextResponse.json({ error: "Dados inválidos." }, { status: 400 });
  }
  const teacher = await prisma.teacher.update({
    where: { id: parsed.data.id },
    data: { active: parsed.data.active },
  });
  return NextResponse.json({ teacher });
}
