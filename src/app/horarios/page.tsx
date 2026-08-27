import type { Metadata } from "next";
import Link from "next/link";
import ClassCard, { type ClassCardData } from "@/components/ClassCard";
import { getActiveServices } from "@/lib/services";
import { site } from "@/lib/site";
import { getActiveClasses, scheduleTextFromSlots } from "@/lib/classSchedule";

export const metadata: Metadata = {
  title: `Horários — ${site.name}`,
};

export const dynamic = "force-dynamic";

export default async function HorariosPage() {
  const services = await getActiveServices();
  const photoBySlug = new Map(services.map((s) => [s.slug, s.photo]));
  const allClasses = await getActiveClasses();
  // Eventos/cursos pontuais definitivos vivem em /cursos-e-retiros, não aqui;
  // entradas só-EOI (publicCalendar=false) não têm calendário público.
  const classes = allClasses.filter((c) => c.recurring && c.publicCalendar);

  const scheduledCards: ClassCardData[] = classes.map((c) => ({
    slug: c.slug,
    name: c.name,
    description: c.description,
    scheduleText: scheduleTextFromSlots(c.slots),
    photo: photoBySlug.get(c.slug) ?? undefined,
    hasCalendar: true,
  }));

  const scheduledSlugs = new Set(classes.map((c) => c.slug));
  const unscheduledCards: ClassCardData[] = services
    .filter((s) => s.category === "aula" && !scheduledSlugs.has(s.slug))
    .map((s) => ({
      slug: s.slug,
      name: s.name,
      description: s.description,
      scheduleText: s.schedule,
      photo: s.photo ?? undefined,
      hasCalendar: false,
    }));

  const cards = [...scheduledCards, ...unscheduledCards];

  return (
    <div className="mx-auto max-w-4xl px-4 py-16">
      <p className="text-sm font-semibold uppercase tracking-widest text-gold">Horários</p>
      <h1 className="mt-2 text-4xl font-semibold text-maroon">Aulas Semanais</h1>
      <p className="mt-4 text-ink/70">
        Consulte os horários das nossas aulas regulares e reserve o seu lugar diretamente numa
        data disponível.
      </p>

      <div className="mt-10 space-y-4">
        {cards.map((aula) => (
          <ClassCard key={aula.slug} aula={aula} />
        ))}
      </div>

      <div className="mt-10 rounded-2xl border border-gold/30 bg-cream p-6 text-sm text-ink/70">
        Também organizamos eventos mensais — práticas em dias auspiciosos, meditações da Lua Nova
        e Lua Cheia e concertos meditativos. Veja mais em{" "}
        <Link href="/cursos-e-retiros" className="font-semibold text-maroon hover:underline">
          Cursos e Retiros
        </Link>
        .
      </div>
    </div>
  );
}
