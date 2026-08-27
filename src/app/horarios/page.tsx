import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { services } from "@/lib/services";
import { site } from "@/lib/site";

export const metadata: Metadata = {
  title: `Horários — ${site.name}`,
};

export default function HorariosPage() {
  const aulas = services.filter((s) => s.category === "aula");

  return (
    <div className="mx-auto max-w-4xl px-4 py-16">
      <p className="text-sm font-semibold uppercase tracking-widest text-gold">Horários</p>
      <h1 className="mt-2 text-4xl font-semibold text-maroon">Aulas Semanais</h1>
      <p className="mt-4 text-ink/70">
        Consulte os horários das nossas aulas regulares. Para participar pela primeira vez,
        recomendamos que faça uma marcação para garantirmos o seu lugar.
      </p>

      <div className="mt-10 space-y-4">
        {aulas.map((aula) => (
          <div
            key={aula.slug}
            className="flex flex-col justify-between gap-4 rounded-2xl border border-gold/30 bg-white p-6 sm:flex-row sm:items-center"
          >
            {aula.photo && (
              <Image
                src={aula.photo}
                alt={aula.name}
                width={96}
                height={96}
                className="h-24 w-24 shrink-0 rounded-xl object-cover"
              />
            )}
            <div className="flex-1">
              <h2 className="text-lg font-semibold text-maroon">{aula.name}</h2>
              <p className="mt-1 text-sm text-ink/70">{aula.schedule}</p>
              <p className="mt-1 text-sm text-ink/60">{aula.description}</p>
            </div>
            <Link
              href={`/marcacoes?servico=${aula.slug}`}
              className="shrink-0 rounded-full border border-maroon px-5 py-2 text-center text-sm font-semibold text-maroon hover:bg-maroon hover:text-cream"
            >
              Reservar lugar
            </Link>
          </div>
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
