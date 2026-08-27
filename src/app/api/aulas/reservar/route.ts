import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { getStripe } from "@/lib/stripe";
import { getClassBySlug } from "@/lib/classSchedule";
import { getPlanBySlug } from "@/lib/plans";

const bodySchema = z.object({
  classSlug: z.string().min(1),
  classDate: z.string().min(1),
  name: z.string().min(2),
  email: z.string().email(),
  phone: z.string().optional(),
  paymentType: z.enum(["once", "membership"]),
  planSlug: z.string().optional(),
});

export async function POST(req: NextRequest) {
  const parsed = bodySchema.safeParse(await req.json().catch(() => null));
  if (!parsed.success) {
    return NextResponse.json({ error: "Dados inválidos." }, { status: 400 });
  }

  const { classSlug, classDate, name, email, phone, paymentType, planSlug } = parsed.data;

  const classDef = await getClassBySlug(classSlug);
  if (!classDef || !classDef.active) {
    return NextResponse.json({ error: "Aula não encontrada." }, { status: 404 });
  }

  const date = new Date(classDate);
  if (Number.isNaN(date.getTime()) || date.getTime() <= Date.now()) {
    return NextResponse.json({ error: "Data inválida." }, { status: 400 });
  }

  const taken = await prisma.seatReservation.count({
    where: { classSlug, classDate: date, status: { in: ["pendente", "confirmado"] } },
  });
  if (taken >= classDef.capacity) {
    return NextResponse.json({ error: "Já não há lugares disponíveis para esta aula." }, { status: 409 });
  }

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
    let sessionId: string;
    let checkoutUrl: string | null;

    if (paymentType === "once") {
      const session = await stripe.checkout.sessions.create({
        mode: "payment",
        customer_email: email,
        line_items: [
          {
            price_data: {
              currency: "eur",
              unit_amount: classDef.dropInPriceCents,
              product_data: {
                name: `${classDef.name} — ${dateLabel}`,
                description: "Reserva de lugar avulsa",
              },
            },
            quantity: 1,
          },
        ],
        success_url: `${origin}/sucesso?session_id={CHECKOUT_SESSION_ID}`,
        cancel_url: `${origin}${classDef.recurring ? "/horarios" : "/cursos-e-retiros"}`,
        metadata: { kind: "reserva", classSlug, classDate: date.toISOString() },
      });
      sessionId = session.id;
      checkoutUrl = session.url;
    } else {
      const plan = getPlanBySlug(planSlug ?? "ilimitado");
      if (!plan) {
        return NextResponse.json({ error: "Plano não encontrado." }, { status: 404 });
      }
      const session = await stripe.checkout.sessions.create({
        mode: "subscription",
        customer_email: email,
        line_items: [
          {
            price_data: {
              currency: plan.currency,
              unit_amount: plan.priceCents,
              recurring: { interval: plan.interval },
              product_data: { name: `Assinatura ${plan.name}`, description: plan.description },
            },
            quantity: 1,
          },
        ],
        success_url: `${origin}/sucesso?session_id={CHECKOUT_SESSION_ID}`,
        cancel_url: `${origin}${classDef.recurring ? "/horarios" : "/cursos-e-retiros"}`,
        metadata: { kind: "reserva-assinatura", classSlug, classDate: date.toISOString(), planSlug: plan.slug },
      });
      sessionId = session.id;
      checkoutUrl = session.url;
    }

    await prisma.seatReservation.create({
      data: {
        classSlug,
        classDate: date,
        name,
        email,
        phone: phone || null,
        paymentType,
        planSlug: paymentType === "membership" ? (planSlug ?? "ilimitado") : null,
        stripeSessionId: sessionId,
        status: "pendente",
      },
    });

    return NextResponse.json({ url: checkoutUrl });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Erro ao criar reserva.";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
