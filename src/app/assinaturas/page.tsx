import type { Metadata } from "next";
import { plans } from "@/lib/plans";
import { site } from "@/lib/site";
import BuyButton from "@/components/BuyButton";

export const metadata: Metadata = {
  title: `Assinaturas — ${site.name}`,
};

export default function AssinaturasPage() {
  return (
    <div className="mx-auto max-w-5xl px-4 py-16">
      <p className="text-sm font-semibold uppercase tracking-widest text-gold">Membros</p>
      <h1 className="mt-2 text-4xl font-semibold text-maroon">Torne-se Membro</h1>
      <p className="mt-4 max-w-2xl text-ink/70">
        Assine um plano mensal e tenha acesso regular às nossas aulas. Pode cancelar a qualquer
        momento.
      </p>

      <div className="mt-10 grid gap-6 lg:grid-cols-3">
        {plans.map((plan) => (
          <div
            key={plan.slug}
            className={`flex flex-col rounded-2xl border p-6 ${
              plan.highlighted
                ? "border-gold bg-maroon text-cream shadow-lg"
                : "border-gold/30 bg-white"
            }`}
          >
            <h2 className={`text-lg font-semibold ${plan.highlighted ? "text-gold-light" : "text-maroon"}`}>
              {plan.name}
            </h2>
            <p className={`mt-1 text-sm ${plan.highlighted ? "text-cream/80" : "text-ink/70"}`}>
              {plan.description}
            </p>
            <p className="mt-4 text-3xl font-semibold">
              {new Intl.NumberFormat("pt-PT", { style: "currency", currency: "EUR" }).format(
                plan.priceCents / 100
              )}
              <span className="text-base font-normal">/mês</span>
              {plan.provisional && <span className="ml-1 text-sm font-normal text-gold">*</span>}
            </p>
            <ul className={`mt-4 flex-1 space-y-2 text-sm ${plan.highlighted ? "text-cream/85" : "text-ink/70"}`}>
              {plan.features.map((f) => (
                <li key={f}>• {f}</li>
              ))}
            </ul>
            <div className="mt-6">
              <BuyButton slug={plan.slug} endpoint="assinatura" label="Assinar" />
            </div>
          </div>
        ))}
      </div>

      <p className="mt-8 text-xs text-ink/50">
        * Valores provisórios, sujeitos a confirmação. Gestão e cancelamento da assinatura feitos
        diretamente através do Stripe após a subscrição.
      </p>
    </div>
  );
}
