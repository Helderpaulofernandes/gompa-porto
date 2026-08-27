import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getClassSchedule, getEffectiveCapacity } from "@/lib/classSchedule";
import { getUpcomingOccurrences } from "@/lib/occurrences";

export async function GET(_req: NextRequest, { params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const schedule = getClassSchedule(slug);
  if (!schedule) {
    return NextResponse.json({ error: "Aula não encontrada." }, { status: 404 });
  }

  const capacity = await getEffectiveCapacity(slug);
  const occurrences = getUpcomingOccurrences(slug);
  if (occurrences.length === 0) {
    return NextResponse.json({ capacity, dropInPriceCents: schedule.dropInPriceCents, occurrences: [] });
  }

  const dates = occurrences.map((o) => o.date);
  const counts = await prisma.seatReservation.groupBy({
    by: ["classDate"],
    where: {
      classSlug: slug,
      classDate: { in: dates },
      status: { in: ["pendente", "confirmado"] },
    },
    _count: { _all: true },
  });

  const countByIso = new Map(counts.map((c) => [c.classDate.toISOString(), c._count._all]));

  const result = occurrences.map((o) => {
    const taken = countByIso.get(o.isoDate) ?? 0;
    return {
      ...o,
      seatsTaken: taken,
      seatsAvailable: Math.max(0, capacity - taken),
    };
  });

  return NextResponse.json({
    capacity,
    dropInPriceCents: schedule.dropInPriceCents,
    occurrences: result,
  });
}
