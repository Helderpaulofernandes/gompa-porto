"use client";

import { useEffect, useRef, useState } from "react";
import { useSearchParams } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import SeatCalendar from "@/components/SeatCalendar";

export type ClassCardData = {
  slug: string;
  name: string;
  description: string;
  scheduleText: string;
  photo?: string;
  hasCalendar: boolean;
};

export default function ClassCard({ aula }: { aula: ClassCardData }) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  const searchParams = useSearchParams();

  useEffect(() => {
    if (searchParams.get("abrir") === aula.slug && aula.hasCalendar) {
      setOpen(true);
      ref.current?.scrollIntoView({ behavior: "smooth", block: "center" });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchParams]);

  return (
    <div ref={ref} className="rounded-2xl border border-gold/30 bg-white p-6">
      <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
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
          <p className="mt-1 text-sm text-ink/70">{aula.scheduleText}</p>
          <p className="mt-1 text-sm text-ink/60">{aula.description}</p>
        </div>

        {aula.hasCalendar ? (
          <button
            onClick={() => setOpen((v) => !v)}
            className="shrink-0 rounded-full border border-maroon px-5 py-2 text-center text-sm font-semibold text-maroon hover:bg-maroon hover:text-cream"
          >
            {open ? "Fechar calendário" : "Ver disponibilidade e reservar"}
          </button>
        ) : (
          <Link
            href={`/marcacoes?servico=${aula.slug}`}
            className="shrink-0 rounded-full border border-maroon px-5 py-2 text-center text-sm font-semibold text-maroon hover:bg-maroon hover:text-cream"
          >
            Reservar lugar
          </Link>
        )}
      </div>

      {aula.hasCalendar && open && <SeatCalendar classSlug={aula.slug} className="mt-6" />}
    </div>
  );
}
