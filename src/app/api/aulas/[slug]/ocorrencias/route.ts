import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getClassBySlug } from "@/lib/classSchedule";
import { getUpcomingOccurrences } from "@/lib/occurrences";

export async function GET(_req: NextRequest, { params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const classDef = await getClassBySlug(slug);
  if (!classDef || !classDef.active) {
    return NextResponse.json({ error: "Aula não encontrada." }, { status: 404 });
  }

  const occurrences = getUpcomingOccurrences(classDef.slots);
  if (occurrences.length === 0) {
    return NextResponse.json({
      capacity: classDef.capacity,
      dropInPriceCents: classDef.dropInPriceCents,
      occurrences: [],
    });
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
      seatsAvailable: Math.max(0, classDef.capacity - taken),
    };
  });

  return NextResponse.json({
    capacity: classDef.capacity,
    dropInPriceCents: classDef.dropInPriceCents,
    occurrences: result,
  });
}
