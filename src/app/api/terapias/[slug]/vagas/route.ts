import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getTherapyPriceCents } from "@/lib/therapyPricing";

export async function GET(_req: NextRequest, { params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;

  const slots = await prisma.therapySlot.findMany({
    where: { serviceSlug: slug, date: { gte: new Date() } },
    orderBy: { date: "asc" },
    include: { teacher: true },
    take: 200,
  });

  return NextResponse.json({
    priceCents: getTherapyPriceCents(slug) ?? null,
    slots: slots.map((s) => ({
      id: s.id,
      isoDate: s.date.toISOString(),
      teacherName: s.teacher.name,
      durationMinutes: s.durationMinutes,
      available: s.status === "disponivel",
    })),
  });
}
