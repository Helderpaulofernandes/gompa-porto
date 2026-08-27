import Link from "next/link";
import { site } from "@/lib/site";

const highlights = [
  {
    title: "Aulas Semanais",
    description: "Yoga Tibetano e Prática de Meditação, todas as semanas.",
    href: "/horarios",
    cta: "Ver horários",
  },
  {
    title: "Terapias",
    description: "Terapia do Som, Tsa Lung Healing, Shiatsu, Auriculoterapia e Reflexologia.",
    href: "/terapias",
    cta: "Ver terapias",
  },
  {
    title: "Cursos e Retiros",
    description: "Formações em meditação, Lujong e Tsa Lung Healing, workshops e retiros.",
    href: "/cursos-e-retiros",
    cta: "Ver cursos",
  },
  {
    title: "Assinaturas",
    description: "Torne-se membro e tenha acesso regular às aulas com um plano mensal.",
    href: "/assinaturas",
    cta: "Ver planos",
  },
];

export default function Home() {
  return (
    <div>
      <section className="relative overflow-hidden bg-maroon text-cream">
        <div className="mx-auto max-w-6xl px-4 py-24 text-center sm:py-32">
          <p className="text-sm font-semibold uppercase tracking-[0.3em] text-gold-light">
            {site.name}
          </p>
          <h1 className="mx-auto mt-4 max-w-3xl text-4xl font-semibold leading-tight sm:text-5xl">
            Meditação, Yoga Tibetano e Sabedoria Budista no coração do Porto
          </h1>
          <p className="mx-auto mt-6 max-w-2xl text-lg text-cream/85">
            Um espaço dedicado à prática contemplativa tibetana — aulas semanais, terapias
            individuais, cursos e retiros para todos os níveis de experiência.
          </p>
          <div className="mt-10 flex flex-wrap justify-center gap-4">
            <Link
              href="/marcacoes"
              className="rounded-full bg-gold px-7 py-3 text-sm font-semibold text-ink transition hover:bg-gold-light"
            >
              Marcar uma Sessão
            </Link>
            <Link
              href="/horarios"
              className="rounded-full border border-cream/40 px-7 py-3 text-sm font-semibold text-cream transition hover:bg-cream/10"
            >
              Ver Horários das Aulas
            </Link>
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-4 py-20">
        <div className="mx-auto max-w-2xl text-center">
          <h2 className="text-3xl font-semibold text-maroon">O que fazemos</h2>
          <p className="mt-4 text-ink/75">
            A Gompa Porto é dedicada à partilha das práticas do budismo tibetano — meditação,
            yoga tibetano, terapias energéticas e o estudo das palavras de sabedoria — num
            ambiente acolhedor, aberto a todos.
          </p>
        </div>

        <div className="mt-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {highlights.map((h) => (
            <div
              key={h.title}
              className="flex flex-col rounded-2xl border border-gold/30 bg-white p-6 shadow-sm"
            >
              <h3 className="text-lg font-semibold text-maroon">{h.title}</h3>
              <p className="mt-2 flex-1 text-sm text-ink/70">{h.description}</p>
              <Link
                href={h.href}
                className="mt-4 text-sm font-semibold text-gold hover:text-maroon"
              >
                {h.cta} →
              </Link>
            </div>
          ))}
        </div>
      </section>

      <section className="bg-cream">
        <div className="mx-auto grid max-w-6xl gap-8 px-4 py-16 sm:grid-cols-2">
          <div className="flex flex-col justify-center">
            <h2 className="text-3xl font-semibold text-maroon">Onde estamos</h2>
            <p className="mt-4 text-ink/75">{site.address.line1}</p>
            <p className="text-ink/75">{site.address.line2}</p>
            <p className="mt-4 text-ink/75">{site.phone}</p>
            <p className="text-ink/75">{site.email}</p>
            <Link
              href="/onde-estamos"
              className="mt-6 inline-block w-fit rounded-full border border-maroon px-6 py-2.5 text-sm font-semibold text-maroon hover:bg-maroon hover:text-cream"
            >
              Como chegar
            </Link>
          </div>
          <div className="overflow-hidden rounded-2xl border border-gold/30">
            <iframe
              src={site.mapsEmbedSrc}
              className="h-full min-h-72 w-full"
              loading="lazy"
              title={`Mapa - ${site.name}`}
            />
          </div>
        </div>
      </section>
    </div>
  );
}
