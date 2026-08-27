import type { Metadata } from "next";
import TherapyCard from "@/components/TherapyCard";
import { services } from "@/lib/services";
import { site } from "@/lib/site";

export const metadata: Metadata = {
  title: `Terapias — ${site.name}`,
};

export const dynamic = "force-dynamic";

export default function TerapiasPage() {
  const terapias = services.filter((s) => s.category === "terapia");

  return (
    <div className="mx-auto max-w-4xl px-4 py-16">
      <p className="text-sm font-semibold uppercase tracking-widest text-gold">Terapias</p>
      <h1 className="mt-2 text-4xl font-semibold text-maroon">Sessões Individuais</h1>
      <p className="mt-4 text-ink/70">
        Sessões terapêuticas individuais. Veja os horários disponíveis no calendário e reserve
        diretamente com pagamento seguro através do Stripe.
      </p>

      <div className="mt-10 space-y-4">
        {terapias.map((t) => (
          <TherapyCard key={t.slug} therapy={t} />
        ))}
      </div>
    </div>
  );
}
