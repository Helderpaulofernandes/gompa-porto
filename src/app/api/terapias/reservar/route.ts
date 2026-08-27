import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { getStripe } from "@/lib/stripe";
import { getServiceBySlug } from "@/lib/services";
import { getTherapyPriceCents } from "@/lib/therapyPricing";

const bodySchema = z.object({
  slotId: z.string().min(1),
  name: z.string().min(2),
  email: z.string().email(),
  phone: z.string().optional(),
});

export async function POST(req: NextRequest) {
  const parsed = bodySchema.safeParse(await req.json().catch(() => null));
  if (!parsed.success) {
    return NextResponse.json({ error: "Dados inválidos." }, { status: 400 });
  }
  const { slotId, name, email, phone } = parsed.data;

  const slot = await prisma.therapySlot.findUnique({ where: { id: slotId }, include: { teacher: true } });
  if (!slot) {
    return NextResponse.json({ error: "Horário não encontrado." }, { status: 404 });
  }
  if (slot.status !== "disponivel" || slot.date.getTime() <= Date.now()) {
    return NextResponse.json({ error: "Este horário já não está disponível." }, { status: 409 });
  }

  const service = getServiceBySlug(slot.serviceSlug);
  const priceCents = getTherapyPriceCents(slot.serviceSlug);
  if (!service || !priceCents) {
    return NextResponse.json({ error: "Terapia não encontrada." }, { status: 404 });
  }

  const origin = req.headers.get("origin") ?? process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000";
  const dateLabel = slot.date.toLocaleString("pt-PT", {
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
              description: `Com ${slot.teacher.name}`,
            },
          },
          quantity: 1,
        },
      ],
      success_url: `${origin}/sucesso?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${origin}/terapias`,
      metadata: { kind: "terapia", slotId: slot.id, serviceSlug: slot.serviceSlug },
    });

    const claimed = await prisma.therapySlot.updateMany({
      where: { id: slotId, status: "disponivel" },
      data: {
        status: "pendente",
        clientName: name,
        clientEmail: email,
        clientPhone: phone || null,
        stripeSessionId: session.id,
      },
    });

    if (claimed.count === 0) {
      return NextResponse.json({ error: "Este horário acabou de ser reservado por outra pessoa." }, { status: 409 });
    }

    return NextResponse.json({ url: session.url });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Erro ao criar reserva.";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
