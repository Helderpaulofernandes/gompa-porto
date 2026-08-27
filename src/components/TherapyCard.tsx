"use client";

import { useEffect, useRef, useState } from "react";
import { useSearchParams } from "next/navigation";
import TherapyCalendar from "@/components/TherapyCalendar";
import type { Service } from "@/lib/services";
import { formatPrice } from "@/lib/products";

export default function TherapyCard({ therapy }: { therapy: Service }) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  const searchParams = useSearchParams();
  const priceCents = therapy.priceCents;

  useEffect(() => {
    if (searchParams.get("abrir") === therapy.slug) {
      setOpen(true);
      ref.current?.scrollIntoView({ behavior: "smooth", block: "center" });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchParams]);

  return (
    <div ref={ref} className="rounded-2xl border border-gold/30 bg-white p-6">
      <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
        <div className="flex-1">
          <h2 className="text-lg font-semibold text-maroon">{therapy.name}</h2>
          <p className="mt-1 text-sm text-ink/70">{therapy.schedule}</p>
          <p className="mt-1 text-sm text-ink/60">{therapy.description}</p>
          <p className="mt-1 text-xs font-semibold text-gold">
            {priceCents ? `${formatPrice(priceCents)} *` : therapy.priceLabel}
          </p>
        </div>
        <button
          onClick={() => setOpen((v) => !v)}
          className="shrink-0 rounded-full border border-maroon px-5 py-2 text-center text-sm font-semibold text-maroon hover:bg-maroon hover:text-cream"
        >
          {open ? "Fechar calendário" : "Ver disponibilidade e reservar"}
        </button>
      </div>

      {open && <TherapyCalendar serviceSlug={therapy.slug} className="mt-6" />}
    </div>
  );
}
