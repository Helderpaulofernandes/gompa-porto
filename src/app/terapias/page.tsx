import type { Metadata } from "next";
import Link from "next/link";
import { services } from "@/lib/services";
import { site } from "@/lib/site";

export const metadata: Metadata = {
  title: `Terapias — ${site.name}`,
};

export default function TerapiasPage() {
  const terapias = services.filter((s) => s.category === "terapia");

  return (
    <div className="mx-auto max-w-4xl px-4 py-16">
      <p className="text-sm font-semibold uppercase tracking-widest text-gold">Terapias</p>
      <h1 className="mt-2 text-4xl font-semibold text-maroon">Sessões Individuais</h1>
      <p className="mt-4 text-ink/70">
        Sessões terapêuticas individuais, com marcação prévia. Os valores são definidos após
        contacto — envie um pedido de marcação e entraremos em contacto para combinar dia, hora
        e preço.
      </p>

      <div className="mt-10 space-y-4">
        {terapias.map((t) => (
          <div
            key={t.slug}
            className="flex flex-col justify-between gap-4 rounded-2xl border border-gold/30 bg-white p-6 sm:flex-row sm:items-center"
          >
            <div>
              <h2 className="text-lg font-semibold text-maroon">{t.name}</h2>
              <p className="mt-1 text-sm text-ink/70">{t.schedule}</p>
              <p className="mt-1 text-sm text-ink/60">{t.description}</p>
              <p className="mt-1 text-xs font-semibold text-gold">{t.priceLabel}</p>
            </div>
            <Link
              href={`/marcacoes?servico=${t.slug}`}
              className="shrink-0 rounded-full border border-maroon px-5 py-2 text-center text-sm font-semibold text-maroon hover:bg-maroon hover:text-cream"
            >
              Marcar sessão
            </Link>
          </div>
        ))}
      </div>

      <div className="mt-10 rounded-2xl border border-gold/30 bg-cream p-6 text-sm text-ink/70">
        Também vendemos um{" "}
        <Link href="/loja" className="font-semibold text-maroon hover:underline">
          voucher de terapia individual
        </Link>{" "}
        na nossa loja, ideal para oferecer.
      </div>
    </div>
  );
}
