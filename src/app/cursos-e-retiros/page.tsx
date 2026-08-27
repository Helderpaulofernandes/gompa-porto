import type { Metadata } from "next";
import Link from "next/link";
import ClassCard, { type ClassCardData } from "@/components/ClassCard";
import { getActiveServices } from "@/lib/services";
import { site } from "@/lib/site";
import { getActiveClasses, scheduleTextFromSlots } from "@/lib/classSchedule";

export const metadata: Metadata = {
  title: `Cursos e Retiros — ${site.name}`,
};

export const dynamic = "force-dynamic";

export default async function CursosERetirosPage() {
  const services = await getActiveServices();
  const allClasses = await getActiveClasses();
  // Datas definitivas e publicamente reserváveis (posted por nós no backoffice) —
  // pedidos de interesse (EOI) continuam a usar o formulário estático abaixo.
  const scheduledClasses = allClasses.filter((c) => !c.recurring && c.publicCalendar);
  const scheduledSlugs = new Set(scheduledClasses.map((c) => c.slug));

  const scheduledCards: ClassCardData[] = scheduledClasses.map((c) => ({
    slug: c.slug,
    name: c.name,
    description: c.description,
    scheduleText: scheduleTextFromSlots(c.slots),
    hasCalendar: true,
  }));

  const cursos = services.filter((s) => s.category === "curso" && !scheduledSlugs.has(s.slug));
  const eventos = services.filter((s) => s.category === "evento" && !scheduledSlugs.has(s.slug));

  return (
    <div className="mx-auto max-w-4xl px-4 py-16">
      <p className="text-sm font-semibold uppercase tracking-widest text-gold">Formação</p>
      <h1 className="mt-2 text-4xl font-semibold text-maroon">Cursos e Retiros</h1>
      <p className="mt-4 text-ink/70">
        Formações estruturadas e retiros de imersão. Quando há uma data e local confirmados,
        reserve diretamente com pagamento online; para as restantes ofertas, envie um pedido de
        interesse e avisamos assim que houver datas marcadas.
      </p>

      {scheduledCards.length > 0 && (
        <div className="mt-10 space-y-4">
          {scheduledCards.map((c) => (
            <ClassCard key={c.slug} aula={c} />
          ))}
        </div>
      )}

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
