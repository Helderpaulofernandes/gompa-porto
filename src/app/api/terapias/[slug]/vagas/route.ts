import { NextRequest, NextResponse } from "next/server";
import { computeTherapyCandidates } from "@/lib/therapyAvailability";
import { getTherapyPriceCents, getTherapyDurationMinutes } from "@/lib/therapyPricing";

export async function GET(_req: NextRequest, { params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;

  const priceCents = getTherapyPriceCents(slug);
  const durationMinutes = getTherapyDurationMinutes(slug);
  if (!priceCents || !durationMinutes) {
    return NextResponse.json({ error: "Terapia não encontrada." }, { status: 404 });
  }

  const candidates = await computeTherapyCandidates(slug);

  return NextResponse.json({
    priceCents,
    durationMinutes,
    slots: candidates.map((c) => ({
      isoDate: c.isoDate,
      teacherId: c.teacherId,
      teacherName: c.teacherName,
      roomId: c.roomId,
      available: c.available,
    })),
  });
}
