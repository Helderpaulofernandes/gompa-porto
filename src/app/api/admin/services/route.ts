import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { isAdminAuthenticated } from "@/lib/adminAuth";
import { slugify } from "@/lib/classSchedule";

const categorySchema = z.enum(["aula", "terapia", "evento", "curso"]);

async function uniqueServiceSlug(name: string): Promise<string> {
  const base = slugify(name) || "servico";
  let candidate = base;
  let i = 2;
  while (await prisma.service.findUnique({ where: { slug: candidate } })) {
    candidate = `${base}-${i}`;
    i++;
  }
  return candidate;
}

const createSchema = z.object({
  name: z.string().min(2),
  category: categorySchema,
  schedule: z.string().min(1),
  duration: z.string().nullable().optional(),
  priceLabel: z.string().min(1),
  description: z.string().min(1),
  photo: z.string().min(1).nullable().optional(),
  bookable: z.boolean().default(true),
  priceCents: z.number().int().min(0).nullable().optional(),
  durationMinutes: z.number().int().min(1).nullable().optional(),
});

export async function POST(req: NextRequest) {
  if (!(await isAdminAuthenticated())) {
    return NextResponse.json({ error: "Não autorizado." }, { status: 401 });
  }
  const parsed = createSchema.safeParse(await req.json().catch(() => null));
  if (!parsed.success) {
    return NextResponse.json({ error: "Dados inválidos." }, { status: 400 });
  }
  const slug = await uniqueServiceSlug(parsed.data.name);
  const service = await prisma.service.create({
    data: { ...parsed.data, slug },
  });
  return NextResponse.json({ service });
}

const patchSchema = z.object({
  id: z.string().min(1),
  name: z.string().min(2).optional(),
  category: categorySchema.optional(),
  schedule: z.string().min(1).optional(),
  duration: z.string().nullable().optional(),
  priceLabel: z.string().min(1).optional(),
  description: z.string().min(1).optional(),
  photo: z.string().min(1).nullable().optional(),
  bookable: z.boolean().optional(),
  active: z.boolean().optional(),
  priceCents: z.number().int().min(0).nullable().optional(),
  durationMinutes: z.number().int().min(1).nullable().optional(),
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
  const service = await prisma.service.update({ where: { id }, data });
  return NextResponse.json({ service });
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
  const service = await prisma.service.findUnique({ where: { id: parsed.data.id } });
  if (!service) {
    return NextResponse.json({ error: "Serviço não encontrado." }, { status: 404 });
  }

  const [classUsingIt, teachersUsingIt, therapyBookings, eoiBookings] = await Promise.all([
    prisma.classDefinition.findFirst({ where: { slug: service.slug } }),
    prisma.teacher.findMany({ where: { services: { has: service.slug } } }),
    prisma.therapySlot.findFirst({ where: { serviceSlug: service.slug } }),
    prisma.booking.findFirst({ where: { serviceSlug: service.slug } }),
  ]);

  if (classUsingIt || teachersUsingIt.length > 0 || therapyBookings || eoiBookings) {
    return NextResponse.json(
      {
        error:
          "Este serviço está em uso (aula, professor atribuído, ou marcações associadas) — desative-o em vez de o remover.",
      },
      { status: 409 }
    );
  }

  await prisma.service.delete({ where: { id: service.id } });
  return NextResponse.json({ ok: true });
}
