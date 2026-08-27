import { NextRequest, NextResponse } from "next/server";
import { computeTherapyCandidates } from "@/lib/therapyAvailability";
import { getServiceBySlug } from "@/lib/services";

export async function GET(_req: NextRequest, { params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;

  const service = await getServiceBySlug(slug);
  const priceCents = service?.priceCents;
  const durationMinutes = service?.durationMinutes;
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
