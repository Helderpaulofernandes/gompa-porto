import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { isAdminAuthenticated } from "@/lib/adminAuth";

export async function GET() {
  if (!(await isAdminAuthenticated())) {
    return NextResponse.json({ error: "Não autorizado." }, { status: 401 });
  }
  const rooms = await prisma.room.findMany({ orderBy: { createdAt: "asc" } });
  return NextResponse.json({ rooms });
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
  const room = await prisma.room.create({ data: { name: parsed.data.name } });
  return NextResponse.json({ room });
}
