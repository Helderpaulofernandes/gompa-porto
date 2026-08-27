import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { getStripe } from "@/lib/stripe";
import { getPlanBySlug } from "@/lib/plans";

const bodySchema = z.object({ slug: z.string() });

export async function POST(req: NextRequest) {
  const parsed = bodySchema.safeParse(await req.json().catch(() => null));
  if (!parsed.success) {
    return NextResponse.json({ error: "Pedido inválido." }, { status: 400 });
  }

  const plan = getPlanBySlug(parsed.data.slug);
  if (!plan) {
    return NextResponse.json({ error: "Plano não encontrado." }, { status: 404 });
  }

  const origin = req.headers.get("origin") ?? process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000";

  try {
    const stripe = getStripe();
    const session = await stripe.checkout.sessions.create({
      mode: "subscription",
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
      cancel_url: `${origin}/cancelado`,
      metadata: { kind: "assinatura", slug: plan.slug },
    });

    return NextResponse.json({ url: session.url });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Erro ao criar sessão de checkout.";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
