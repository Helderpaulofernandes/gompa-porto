import { NextRequest, NextResponse } from "next/server";
import { getStripe } from "@/lib/stripe";
import { prisma } from "@/lib/prisma";
import type Stripe from "stripe";

export async function POST(req: NextRequest) {
  const signature = req.headers.get("stripe-signature");
  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;

  if (!signature || !webhookSecret) {
    return NextResponse.json({ error: "Webhook não configurado." }, { status: 400 });
  }

  const rawBody = await req.text();
  let event: Stripe.Event;

  try {
    const stripe = getStripe();
    event = stripe.webhooks.constructEvent(rawBody, signature, webhookSecret);
  } catch (err) {
    const message = err instanceof Error ? err.message : "Assinatura inválida.";
    return NextResponse.json({ error: `Webhook error: ${message}` }, { status: 400 });
  }

  if (event.type === "checkout.session.completed") {
    const session = event.data.object as Stripe.Checkout.Session;

    await prisma.order.upsert({
      where: { stripeSessionId: session.id },
      update: {},
      create: {
        stripeSessionId: session.id,
        customerEmail: session.customer_details?.email ?? null,
        customerName: session.customer_details?.name ?? null,
        description:
          session.mode === "subscription"
            ? `Assinatura: ${session.metadata?.slug ?? "desconhecido"}`
            : `Produto: ${session.metadata?.slug ?? "desconhecido"}`,
        amountTotal: session.amount_total ?? 0,
        currency: session.currency ?? "eur",
        mode: session.mode ?? "payment",
        status: "pago",
      },
    });
  }

  return NextResponse.json({ received: true });
}
