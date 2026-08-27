import type { Metadata } from "next";
import Link from "next/link";
import { services } from "@/lib/services";
import { site } from "@/lib/site";

export const metadata: Metadata = {
  title: `Cursos e Retiros — ${site.name}`,
};

export default function CursosERetirosPage() {
  const cursos = services.filter((s) => s.category === "curso");
  const eventos = services.filter((s) => s.category === "evento");

  return (
    <div className="mx-auto max-w-4xl px-4 py-16">
      <p className="text-sm font-semibold uppercase tracking-widest text-gold">Formação</p>
      <h1 className="mt-2 text-4xl font-semibold text-maroon">Cursos e Retiros</h1>
      <p className="mt-4 text-ink/70">
        Formações estruturadas e retiros de imersão. As datas são anunciadas com antecedência —
        faça uma marcação para ficar a par das próximas edições ou reservar o seu lugar.
      </p>

      <div className="mt-10 space-y-4">
        {cursos.map((c) => (
          <div
            key={c.slug}
            className="flex flex-col justify-between gap-4 rounded-2xl border border-gold/30 bg-white p-6 sm:flex-row sm:items-center"
          >
            <div>
              <h2 className="text-lg font-semibold text-maroon">{c.name}</h2>
              <p className="mt-1 text-sm text-ink/70">{c.schedule}</p>
              <p className="mt-1 text-sm text-ink/60">{c.description}</p>
              <p className="mt-1 text-xs font-semibold text-gold">{c.priceLabel}</p>
            </div>
            <Link
              href={`/marcacoes?servico=${c.slug}`}
              className="shrink-0 rounded-full border border-maroon px-5 py-2 text-center text-sm font-semibold text-maroon hover:bg-maroon hover:text-cream"
            >
              Inscrever interesse
            </Link>
          </div>
        ))}
      </div>

      <h2 className="mt-16 text-3xl font-semibold text-maroon">Eventos Mensais</h2>
      <p className="mt-4 text-ink/70">
        Momentos de prática partilhada, ligados ao calendário budista.
      </p>

      <div className="mt-8 space-y-4">
        {eventos.map((e) => (
          <div
            key={e.slug}
            className="flex flex-col justify-between gap-4 rounded-2xl border border-gold/30 bg-cream p-6 sm:flex-row sm:items-center"
          >
            <div>
              <h3 className="text-lg font-semibold text-maroon">{e.name}</h3>
              <p className="mt-1 text-sm text-ink/70">{e.schedule}</p>
              <p className="mt-1 text-sm text-ink/60">{e.description}</p>
            </div>
            <Link
              href={`/marcacoes?servico=${e.slug}`}
              className="shrink-0 rounded-full border border-maroon px-5 py-2 text-center text-sm font-semibold text-maroon hover:bg-maroon hover:text-cream"
            >
              Quero participar
            </Link>
          </div>
        ))}
      </div>

      <div className="mt-10 text-sm text-ink/60">
        Dúvidas sobre datas? Contacte-nos em{" "}
        <a href={`mailto:${site.email}`} className="font-semibold text-maroon hover:underline">
          {site.email}
        </a>
        .
      </div>
    </div>
  );
}
