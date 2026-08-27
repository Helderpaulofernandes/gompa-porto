"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import SeatCalendar from "@/components/SeatCalendar";
import type { Service } from "@/lib/services";
import { getClassSchedule } from "@/lib/classSchedule";

export default function ClassCard({ aula }: { aula: Service }) {
  const [open, setOpen] = useState(false);
  const schedule = getClassSchedule(aula.slug);

  return (
    <div className="rounded-2xl border border-gold/30 bg-white p-6">
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
          <p className="mt-1 text-sm text-ink/70">{aula.schedule}</p>
          <p className="mt-1 text-sm text-ink/60">{aula.description}</p>
        </div>

        {schedule ? (
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

      {schedule && open && <SeatCalendar classSlug={aula.slug} className="mt-6" />}
    </div>
  );
}
