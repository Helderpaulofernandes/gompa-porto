import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { getStripe } from "@/lib/stripe";
import { getServiceBySlug } from "@/lib/services";
import { computeTherapyCandidates } from "@/lib/therapyAvailability";

const bodySchema = z.object({
  serviceSlug: z.string().min(1),
  teacherId: z.string().min(1),
  roomId: z.string().min(1),
  isoDate: z.string().min(1),
  name: z.string().min(2),
  email: z.string().email(),
  phone: z.string().optional(),
});

export async function POST(req: NextRequest) {
  const parsed = bodySchema.safeParse(await req.json().catch(() => null));
  if (!parsed.success) {
    return NextResponse.json({ error: "Dados inválidos." }, { status: 400 });
  }
  const { serviceSlug, teacherId, roomId, isoDate, name, email, phone } = parsed.data;

  const service = await getServiceBySlug(serviceSlug);
  const priceCents = service?.priceCents;
  const durationMinutes = service?.durationMinutes;
  if (!service || !priceCents || !durationMinutes) {
    return NextResponse.json({ error: "Terapia não encontrada." }, { status: 404 });
  }

  // Re-validate against the current computed availability to prevent double-booking.
  const candidates = await computeTherapyCandidates(serviceSlug);
  const match = candidates.find(
    (c) => c.isoDate === isoDate && c.teacherId === teacherId && c.roomId === roomId
  );
  if (!match || !match.available) {
    return NextResponse.json({ error: "Este horário já não está disponível." }, { status: 409 });
  }

  const date = new Date(isoDate);
  const origin = req.headers.get("origin") ?? process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000";
  const dateLabel = date.toLocaleString("pt-PT", {
    timeZone: "Europe/Lisbon",
    weekday: "long",
    day: "numeric",
    month: "long",
    hour: "2-digit",
    minute: "2-digit",
  });

  try {
    const stripe = getStripe();
    const session = await stripe.checkout.sessions.create({
      mode: "payment",
      customer_email: email,
      line_items: [
        {
          price_data: {
            currency: "eur",
            unit_amount: priceCents,
            product_data: {
              name: `${service.name} — ${dateLabel}`,
              description: `Com ${match.teacherName}`,
            },
          },
          quantity: 1,
        },
      ],
      success_url: `${origin}/sucesso?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${origin}/terapias`,
      metadata: { kind: "terapia", serviceSlug },
    });

    // Create the booking row now, atomically guarded by re-checking for an exact clash
    // right before insert to shrink (not eliminate) the race window.
    const clash = await prisma.therapySlot.findFirst({
      where: {
        teacherId,
        date,
        status: { in: ["pendente", "confirmado"] },
      },
    });
    if (clash) {
      return NextResponse.json({ error: "Este horário acabou de ser reservado por outra pessoa." }, { status: 409 });
    }

    await prisma.therapySlot.create({
      data: {
        teacherId,
        roomId,
        serviceSlug,
        date,
        durationMinutes,
        clientName: name,
        clientEmail: email,
        clientPhone: phone || null,
        stripeSessionId: session.id,
        status: "pendente",
      },
    });

    return NextResponse.json({ url: session.url });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Erro ao criar reserva.";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
