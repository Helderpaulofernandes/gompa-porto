"use client";

import { useEffect, useState } from "react";
import { formatInTimeZone } from "date-fns-tz";
import { pt } from "date-fns/locale";
import AvailabilityCalendar, { type TimeEntry } from "@/components/AvailabilityCalendar";
import { formatPrice } from "@/lib/products";

type SlotApi = {
  isoDate: string;
  teacherId: string;
  teacherName: string;
  roomId: string;
  available: boolean;
};

type ApiResponse = {
  priceCents: number;
  durationMinutes: number;
  slots: SlotApi[];
};

const KEY_SEP = "::";

export default function TherapyCalendar({ serviceSlug, className }: { serviceSlug: string; className: string }) {
  const [data, setData] = useState<ApiResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [selected, setSelected] = useState<TimeEntry | null>(null);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    fetch(`/api/terapias/${serviceSlug}/vagas`)
      .then((res) => res.json())
      .then((json) => setData(json))
      .catch(() => setError("Não foi possível carregar o calendário."))
      .finally(() => setLoading(false));
  }, [serviceSlug]);

  async function handleReserve() {
    if (!selected || !name || !email) return;
    const [teacherId, roomId, isoDate] = selected.key.split(KEY_SEP);
    setSubmitting(true);
    setError("");
    try {
      const res = await fetch("/api/terapias/reservar", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ serviceSlug, teacherId, roomId, isoDate, name, email, phone }),
      });
      const json = await res.json();
      if (!res.ok || !json.url) throw new Error(json.error ?? "Não foi possível processar a reserva.");
      window.location.href = json.url;
    } catch (err) {
      setError(err instanceof Error ? err.message : "Erro inesperado.");
      setSubmitting(false);
    }
  }

  if (loading) return <p className="text-sm text-ink/50">A carregar calendário…</p>;

  if (!data || data.slots.length === 0) {
    return <p className="text-sm text-ink/50">Sem horários disponíveis de momento — contacte-nos para combinar.</p>;
  }

  const entries: TimeEntry[] = data.slots.map((s) => {
    const date = new Date(s.isoDate);
    const time = formatInTimeZone(date, "Europe/Lisbon", "HH:mm", { locale: pt });
    return {
      key: [s.teacherId, s.roomId, s.isoDate].join(KEY_SEP),
      date,
      label: s.available ? `${time} — ${s.teacherName}` : time,
      available: s.available,
      unavailableLabel: s.available ? undefined : "Reservado",
    };
  });

  return (
    <div className={className}>
      <AvailabilityCalendar
        entries={entries}
        onSelect={(entry) => {
          setSelected(entry);
          setError("");
        }}
      />

      {selected && (
        <div className="mt-6 rounded-2xl border border-gold/30 bg-cream p-5">
          <p className="text-sm font-semibold text-maroon">
            A reservar:{" "}
            <span className="capitalize">
              {formatInTimeZone(selected.date, "Europe/Lisbon", "EEEE, d 'de' MMMM 'às' HH:mm", { locale: pt })}
            </span>
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

          <button
            onClick={handleReserve}
            disabled={!name || !email || submitting}
            className="mt-4 w-full rounded-full bg-maroon px-5 py-2.5 text-sm font-semibold text-cream transition hover:bg-maroon-dark disabled:opacity-60 sm:w-auto"
          >
            {submitting ? "A processar…" : `Reservar e pagar — ${formatPrice(data.priceCents)}`}
          </button>
          <p className="mt-2 text-xs text-ink/50">* Valor provisório, sujeito a confirmação.</p>
        </div>
      )}
    </div>
  );
}
