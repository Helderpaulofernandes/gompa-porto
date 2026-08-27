import type { Metadata } from "next";
import Image from "next/image";
import { site } from "@/lib/site";

export const metadata: Metadata = {
  title: `Sobre — ${site.name}`,
};

export default function SobrePage() {
  return (
    <div className="mx-auto max-w-3xl px-4 py-16">
      <p className="text-sm font-semibold uppercase tracking-widest text-gold">Sobre nós</p>
      <h1 className="mt-2 text-4xl font-semibold text-maroon">O que fazemos</h1>

      <div className="prose-body mt-8 text-ink/80">
        <p>
          A {site.name} é um espaço dedicado à prática e ao estudo do budismo tibetano — meditação,
          yoga tibetano e terapias energéticas tradicionais — aberto a todos, independentemente do
          nível de experiência.
        </p>
        <p>
          O nosso trabalho assenta em três pilares: a prática regular da meditação como caminho de
          transformação interior, o yoga tibetano (incluindo Lujong e Trul khor) como via de
          equilíbrio entre corpo e energia, e o estudo e partilha de palavras de sabedoria — os
          ensinamentos que sustentam e dão sentido à prática.
        </p>
        <p>
          Ao longo do ano organizamos aulas semanais, sessões de terapia individual, cursos
          estruturados e retiros, além de eventos mensais ligados ao calendário budista, como as
          práticas de dias auspiciosos e as meditações da Lua Nova e da Lua Cheia.
        </p>
        <p>
          Se procura um primeiro contacto com a meditação, aprofundar uma prática já existente, ou
          simplesmente um espaço de silêncio e comunidade, terá sempre lugar na {site.name}.
        </p>
      </div>

      <div className="mt-12 rounded-2xl border border-gold/30 bg-white p-6">
        <h2 className="text-lg font-semibold text-maroon">O que oferecemos</h2>
        <ul className="mt-3 grid gap-2 text-sm text-ink/75 sm:grid-cols-2">
          <li>• Aulas semanais de Yoga Tibetano</li>
          <li>• Prática semanal de Meditação</li>
          <li>• Treino individual de Tog Chöd</li>
          <li>• Terapia do Som</li>
          <li>• Tsa Lung Healing (toque energético / Reiki)</li>
          <li>• Massagem Shiatsu, Auriculoterapia e Reflexologia</li>
          <li>• Eventos mensais e concertos meditativos</li>
          <li>• Cursos e retiros de meditação e Lujong</li>
        </ul>
      </div>

      <div className="mt-12 flex flex-col gap-6 rounded-2xl border border-gold/30 bg-white p-6 sm:flex-row sm:items-center">
        <Image
          src="/images/anu-prayer.jpg"
          alt="Anu Biak"
          width={160}
          height={160}
          className="mx-auto h-40 w-40 shrink-0 rounded-full object-cover sm:mx-0"
        />
        <div>
          <h2 className="text-lg font-semibold text-maroon">Anu Biak</h2>
          <p className="mt-1 text-sm text-ink/70">Professor</p>
          <p className="mt-3 text-sm text-ink/75">
            Anu orienta as aulas de Yoga Tibetano, as práticas de meditação e o treino de Tog Chöd
            na {site.name}, acompanhando também os cursos, workshops e retiros da escola. A sua
            formação inclui anos de estudo e prática junto de professores tibetanos.
          </p>
        </div>
      </div>

      <figure className="mt-8 overflow-hidden rounded-2xl border border-gold/30">
        <Image
          src="/images/sand-mandala.jpg"
          alt="Anu em formação com professores tibetanos, durante a criação de uma mandala de areia"
          width={1100}
          height={1400}
          className="w-full object-cover"
        />
        <figcaption className="border-t border-gold/30 bg-cream px-4 py-3 text-center text-xs text-ink/60">
          Anu em formação com os seus professores tibetanos
        </figcaption>
      </figure>
    </div>
  );
}
