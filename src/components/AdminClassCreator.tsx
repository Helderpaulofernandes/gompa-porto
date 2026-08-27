"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { categoryLabels, type ServiceCategory } from "@/lib/services";

const WEEKDAYS = ["Domingo", "Segunda", "Terça", "Quarta", "Quinta", "Sexta", "Sábado"];
const SERVICE_CATEGORIES: ServiceCategory[] = ["aula", "evento", "curso"];

type ServiceOption = { slug: string; name: string; description: string; category: ServiceCategory };
type RoomOption = { id: string; name: string };
type TeacherOption = { id: string; name: string };
type SlotDraft = { weekday: number; specificDate: string; time: string };

export default function AdminClassCreator({
  rooms,
  teachers,
  services,
}: {
  rooms: RoomOption[];
  teachers: TeacherOption[];
  services: ServiceOption[];
}) {
  const router = useRouter();
  const [serviceSlug, setServiceSlug] = useState("");
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [capacity, setCapacity] = useState(14);
  const [priceEuros, setPriceEuros] = useState("9.00");
  const [duration, setDuration] = useState(60);
  const [roomId, setRoomId] = useState("");
  const [teacherId, setTeacherId] = useState("");
  const [recurring, setRecurring] = useState(true);
  const [endDate, setEndDate] = useState("");
  const [publicCalendar, setPublicCalendar] = useState(true);
  const [slots, setSlots] = useState<SlotDraft[]>([{ weekday: 2, specificDate: "", time: "19:30" }]);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [warning, setWarning] = useState("");
  const [saved, setSaved] = useState(false);

  function updateSlot(i: number, field: "weekday" | "specificDate" | "time", value: string | number) {
    setSlots((prev) => prev.map((s, idx) => (idx === i ? { ...s, [field]: value } : s)));
  }

  function handleServiceChange(slug: string) {
    setServiceSlug(slug);
    if (!slug) return;
    const service = services.find((s) => s.slug === slug);
    if (!service) return;
    setName(service.name);
    setDescription(service.description);
    if (service.category === "curso" || service.category === "evento") {
      setRecurring(false);
      setPublicCalendar(false);
      setSlots([{ weekday: 2, specificDate: "", time: "19:30" }]);
    } else {
      setRecurring(true);
      setPublicCalendar(true);
      setSlots([{ weekday: 2, specificDate: "", time: "19:30" }]);
    }
  }

  function handleRecurringChange(value: boolean) {
    setRecurring(value);
    setSlots([{ weekday: 2, specificDate: "", time: "19:30" }]);
  }

  async function createClass() {
    if (!name.trim() || !description.trim() || slots.length === 0) return;
    if (!recurring && slots.some((s) => !s.specificDate)) {
      setError("Indique uma data para cada horário pontual.");
      return;
    }
    setSaving(true);
    setError("");
    setWarning("");
    setSaved(false);
    try {
      const res = await fetch("/api/admin/aulas", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: name.trim(),
          description: description.trim(),
          capacity,
          dropInPriceCents: Math.round(parseFloat(priceEuros || "0") * 100),
          durationMinutes: duration,
          roomId: roomId || null,
          teacherId: teacherId || null,
          recurring,
          endDate: recurring && endDate ? endDate : null,
          publicCalendar,
          slots: recurring
            ? slots.map((s) => ({ weekday: s.weekday, time: s.time }))
            : slots.map((s) => ({ specificDate: s.specificDate, time: s.time })),
        }),
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error ?? "Erro ao criar aula.");
      if (json.warning) setWarning(json.warning);
      setSaved(true);
      setServiceSlug("");
      setName("");
      setDescription("");
      setEndDate("");
      setSlots([{ weekday: 2, specificDate: "", time: "19:30" }]);
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Erro inesperado.");
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="rounded-xl border border-gold/30 bg-white p-4">
      <h3 className="text-sm font-semibold text-ink">Criar Nova Aula / Evento</h3>

      <label className="mt-3 block text-xs text-ink/60">
        Serviço (opcional — preenche nome/descrição automaticamente):{" "}
        <select
          value={serviceSlug}
          onChange={(e) => handleServiceChange(e.target.value)}
          className="mt-1 w-full rounded-lg border border-gold/40 px-2 py-1.5 text-sm"
        >
          <option value="">Personalizado</option>
          {SERVICE_CATEGORIES.map((cat) => (
            <optgroup key={cat} label={categoryLabels[cat]}>
              {services
                .filter((s) => s.category === cat)
                .map((s) => (
                  <option key={s.slug} value={s.slug}>
                    {s.name}
                  </option>
                ))}
            </optgroup>
          ))}
        </select>
      </label>

      <div className="mt-3 grid gap-2 sm:grid-cols-2">
        <input
          placeholder="Nome da aula"
          value={name}
          onChange={(e) => setName(e.target.value)}
          className="rounded-lg border border-gold/40 px-2 py-1.5 text-sm focus:border-maroon focus:outline-none"
        />
        <input
          placeholder="Descrição breve"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          className="rounded-lg border border-gold/40 px-2 py-1.5 text-sm focus:border-maroon focus:outline-none"
        />
        <label className="text-xs text-ink/60">
          Lugares:{" "}
          <input
            type="number"
            min={1}
            value={capacity}
            onChange={(e) => setCapacity(Number(e.target.value))}
            className="w-16 rounded-lg border border-gold/40 px-2 py-1 text-sm"
          />
        </label>
        <label className="text-xs text-ink/60">
          Preço avulso (€):{" "}
          <input
            type="text"
            inputMode="decimal"
            value={priceEuros}
            onChange={(e) => setPriceEuros(e.target.value)}
            className="w-20 rounded-lg border border-gold/40 px-2 py-1 text-sm"
          />
        </label>
        <label className="text-xs text-ink/60">
          Duração (min):{" "}
          <input
            type="number"
            min={15}
            step={15}
            value={duration}
            onChange={(e) => setDuration(Number(e.target.value))}
            className="w-20 rounded-lg border border-gold/40 px-2 py-1 text-sm"
          />
        </label>
        <label className="text-xs text-ink/60">
          Sala (também serve para local externo / alugado):{" "}
          <select
            value={roomId}
            onChange={(e) => setRoomId(e.target.value)}
            className="rounded-lg border border-gold/40 px-2 py-1 text-sm"
          >
            <option value="">Sem sala definida</option>
            {rooms.map((r) => (
              <option key={r.id} value={r.id}>
                {r.name}
              </option>
            ))}
          </select>
        </label>
        <label className="text-xs text-ink/60">
          Professor:{" "}
          <select
            value={teacherId}
            onChange={(e) => setTeacherId(e.target.value)}
            className="rounded-lg border border-gold/40 px-2 py-1 text-sm"
          >
            <option value="">Sem professor definido</option>
            {teachers.map((t) => (
              <option key={t.id} value={t.id}>
                {t.name}
              </option>
            ))}
          </select>
        </label>
      </div>

      <div className="mt-3 flex flex-wrap items-center gap-4">
        <div className="flex items-center gap-2 text-xs">
          <span className="font-semibold text-ink/60">Tipo:</span>
          <button
            type="button"
            onClick={() => handleRecurringChange(true)}
            className={`rounded-full px-3 py-1 font-semibold ${
              recurring ? "bg-maroon text-cream" : "border border-gold/40 text-ink/60"
            }`}
          >
            Recorrente
          </button>
          <button
            type="button"
            onClick={() => handleRecurringChange(false)}
            className={`rounded-full px-3 py-1 font-semibold ${
              !recurring ? "bg-maroon text-cream" : "border border-gold/40 text-ink/60"
            }`}
          >
            Pontual
          </button>
        </div>
        <label className="flex items-center gap-1 text-xs text-ink/60">
          <input
            type="checkbox"
            checked={publicCalendar}
            onChange={(e) => setPublicCalendar(e.target.checked)}
          />
          Disponível para reserva online (senão fica só para pedidos de interesse / EOI)
        </label>
      </div>

      <div className="mt-3">
        <p className="text-xs font-semibold text-ink/60">
          {recurring ? "Horários semanais" : "Datas e horas"}
        </p>
        <div className="mt-1 space-y-2">
          {slots.map((s, i) => (
            <div key={i} className="flex items-center gap-2">
              {recurring ? (
                <select
                  value={s.weekday}
                  onChange={(e) => updateSlot(i, "weekday", Number(e.target.value))}
                  className="rounded-lg border border-gold/40 px-2 py-1 text-xs"
                >
                  {WEEKDAYS.map((w, idx) => (
                    <option key={w} value={idx}>
                      {w}
                    </option>
                  ))}
                </select>
              ) : (
                <input
                  type="date"
                  value={s.specificDate}
                  onChange={(e) => updateSlot(i, "specificDate", e.target.value)}
                  className="rounded-lg border border-gold/40 px-2 py-1 text-xs"
                />
              )}
              <input
                type="time"
                value={s.time}
                onChange={(e) => updateSlot(i, "time", e.target.value)}
                className="rounded-lg border border-gold/40 px-2 py-1 text-xs"
              />
              {slots.length > 1 && (
                <button
                  onClick={() => setSlots((prev) => prev.filter((_, idx) => idx !== i))}
                  className="text-xs text-red-600"
                >
                  Remover
                </button>
              )}
            </div>
          ))}
          <button
            onClick={() => setSlots((prev) => [...prev, { weekday: 2, specificDate: "", time: "19:30" }])}
            className="text-xs font-semibold text-maroon hover:underline"
          >
            + adicionar {recurring ? "horário" : "data"}
          </button>
        </div>
        {recurring && (
          <label className="mt-2 block text-xs text-ink/60">
            Data de término (opcional):{" "}
            <input
              type="date"
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
              className="rounded-lg border border-gold/40 px-2 py-1 text-xs"
            />
          </label>
        )}
      </div>

      {error && <p className="mt-3 text-xs text-red-600">{error}</p>}
      {warning && <p className="mt-3 text-xs text-amber-700">⚠ {warning}</p>}

      <button
        onClick={createClass}
        disabled={saving}
        className="mt-4 w-full rounded-full bg-maroon px-3 py-2 text-sm font-semibold text-cream hover:bg-maroon-dark disabled:opacity-60 sm:w-auto"
      >
        {saving ? "A criar…" : saved ? "Criada ✓" : "Criar"}
      </button>
    </div>
  );
}
