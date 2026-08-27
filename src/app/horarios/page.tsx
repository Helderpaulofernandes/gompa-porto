import type { Metadata } from "next";
import Link from "next/link";
import ClassCard from "@/components/ClassCard";
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
        Consulte os horários das nossas aulas regulares e reserve o seu lugar diretamente numa
        data disponível.
      </p>

      <div className="mt-10 space-y-4">
        {aulas.map((aula) => (
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
