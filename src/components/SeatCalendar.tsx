"use client";

import { useEffect, useState } from "react";
import { formatPrice } from "@/lib/products";
import { getPlanBySlug } from "@/lib/plans";

type OccurrenceApi = {
  isoDate: string;
  label: string;
  seatsAvailable: number;
  seatsTaken: number;
};

type ApiResponse = {
  capacity: number;
  dropInPriceCents: number;
  occurrences: OccurrenceApi[];
};

const RECURRING_PLAN_SLUG = "ilimitado";

export default function SeatCalendar({ classSlug, className }: { classSlug: string; className: string }) {
  const [data, setData] = useState<ApiResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [selected, setSelected] = useState<OccurrenceApi | null>(null);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [submitting, setSubmitting] = useState<"once" | "membership" | null>(null);
  const [error, setError] = useState("");

  useEffect(() => {
    fetch(`/api/aulas/${classSlug}/ocorrencias`)
      .then((res) => res.json())
      .then((json) => setData(json))
      .catch(() => setError("Não foi possível carregar o calendário."))
      .finally(() => setLoading(false));
  }, [classSlug]);

  async function handleReserve(paymentType: "once" | "membership") {
    if (!selected || !name || !email) return;
    setSubmitting(paymentType);
    setError("");
    try {
      const res = await fetch("/api/aulas/reservar", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          classSlug,
          classDate: selected.isoDate,
          name,
          email,
          phone,
          paymentType,
          planSlug: paymentType === "membership" ? RECURRING_PLAN_SLUG : undefined,
        }),
      });
      const json = await res.json();
      if (!res.ok || !json.url) throw new Error(json.error ?? "Não foi possível processar a reserva.");
      window.location.href = json.url;
    } catch (err) {
      setError(err instanceof Error ? err.message : "Erro inesperado.");
      setSubmitting(null);
    }
  }

  if (loading) {
    return <p className="text-sm text-ink/50">A carregar calendário…</p>;
  }

  if (!data || data.occurrences.length === 0) {
    return <p className="text-sm text-ink/50">Sem próximas datas disponíveis de momento.</p>;
  }

  const plan = getPlanBySlug(RECURRING_PLAN_SLUG);

  return (
    <div className={className}>
      <div className="grid gap-2 sm:grid-cols-2">
        {data.occurrences.map((o) => {
          const full = o.seatsAvailable === 0;
          const isSelected = selected?.isoDate === o.isoDate;
          return (
            <button
              key={o.isoDate}
              disabled={full}
              onClick={() => {
                setSelected(o);
                setError("");
              }}
              className={`rounded-xl border px-4 py-3 text-left text-sm transition ${
                full
                  ? "cursor-not-allowed border-ink/10 bg-ink/5 text-ink/40"
                  : isSelected
                    ? "border-maroon bg-maroon text-cream"
                    : "border-gold/40 bg-white text-ink hover:border-maroon"
              }`}
            >
              <div className="font-semibold capitalize">{o.label}</div>
              <div className={`mt-1 text-xs ${isSelected ? "text-cream/80" : "text-ink/60"}`}>
                {full ? "Esgotado" : `${o.seatsAvailable} de ${data.capacity} lugares disponíveis`}
              </div>
            </button>
          );
        })}
      </div>

      {selected && (
        <div className="mt-6 rounded-2xl border border-gold/30 bg-cream p-5">
          <p className="text-sm font-semibold text-maroon">
            A reservar: <span className="capitalize">{selected.label}</span>
          </p>

          <div className="mt-4 grid gap-3 sm:grid-cols-3">
            <input
              placeholder="Nome"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="rounded-lg border border-gold/40 px-3 py-2 text-sm focus:border-maroon focus:outline-none"
            />
            <input
              placeholder="Email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="rounded-lg border border-gold/40 px-3 py-2 text-sm focus:border-maroon focus:outline-none"
            />
            <input
              placeholder="Telefone (opcional)"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              className="rounded-lg border border-gold/40 px-3 py-2 text-sm focus:border-maroon focus:outline-none"
            />
          </div>

          {error && <p className="mt-3 text-sm text-red-600">{error}</p>}

          <div className="mt-4 flex flex-col gap-3 sm:flex-row">
            <button
              onClick={() => handleReserve("once")}
              disabled={!name || !email || submitting !== null}
              className="flex-1 rounded-full bg-maroon px-5 py-2.5 text-sm font-semibold text-cream transition hover:bg-maroon-dark disabled:opacity-60"
            >
              {submitting === "once"
                ? "A processar…"
                : `Pagar só esta aula — ${formatPrice(data.dropInPriceCents)}`}
            </button>
            {plan && (
              <button
                onClick={() => handleReserve("membership")}
                disabled={!name || !email || submitting !== null}
                className="flex-1 rounded-full border border-maroon px-5 py-2.5 text-sm font-semibold text-maroon transition hover:bg-maroon hover:text-cream disabled:opacity-60"
              >
                {submitting === "membership"
                  ? "A processar…"
                  : `Assinar ${plan.name} e reservar — ${formatPrice(plan.priceCents)}/mês`}
              </button>
            )}
          </div>
          <p className="mt-3 text-xs text-ink/50">
            Reservar aula a aula sai mais caro do que assinar um plano mensal — veja todos os
            planos em Assinaturas.
          </p>
        </div>
      )}
    </div>
  );
}
